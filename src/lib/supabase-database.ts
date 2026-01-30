/**
 * Supabase 数据库操作
 * 用于配置同步和流水编号管理
 */

import { supabase } from './supabase-client';

// ==================== 配置管理 ====================

export interface AppConfig {
  id?: string;
  user_id?: string;
  app_title: string;
  brand_name: string;
  brand_sub: string;
  logo_url: string;
  seal_url: string;
  seal_text: string;
  title: string;
  sub_title: string;
  intro_text: string;
  confirm_text: string;
  footer_slogan: string;
  membership_options: Array<{ label: string; price: number }>;
  handlers: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * 保存配置到云端
 */
export async function saveConfigToCloud(config: AppConfig): Promise<boolean> {
  try {
    console.log('💾 正在保存配置到云端...');
    
    // 使用固定的配置 ID（每个用户只有一个配置）
    const configId = 'default-config';
    
    const { data, error } = await supabase
      .from('app_configs')
      .upsert({
        id: configId,
        app_title: config.app_title,
        brand_name: config.brand_name,
        brand_sub: config.brand_sub,
        logo_url: config.logo_url || '',
        seal_url: config.seal_url || '',
        seal_text: config.seal_text,
        title: config.title,
        sub_title: config.sub_title,
        intro_text: config.intro_text,
        confirm_text: config.confirm_text,
        footer_slogan: config.footer_slogan,
        membership_options: config.membership_options,
        handlers: config.handlers,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('❌ 配置保存失败:', error);
      return false;
    }

    console.log('✅ 配置已保存到云端');
    return true;
  } catch (error) {
    console.error('❌ 保存配置过程出错:', error);
    return false;
  }
}

/**
 * 从云端加载配置
 */
export async function loadConfigFromCloud(): Promise<AppConfig | null> {
  try {
    console.log('📥 正在从云端加载配置...');
    
    const configId = 'default-config';
    
    const { data, error } = await supabase
      .from('app_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        console.log('📝 云端暂无配置，使用默认配置');
        return null;
      }
      console.error('❌ 配置加载失败:', error);
      return null;
    }

    console.log('✅ 配置已从云端加载');
    return data as AppConfig;
  } catch (error) {
    console.error('❌ 加载配置过程出错:', error);
    return null;
  }
}

// ==================== 流水编号管理 ====================

export interface SerialRecord {
  id?: number;
  serial_number: string;
  customer_name: string;
  amount: number;
  created_at?: string;
}

// ==================== 完整确认函记录 ====================

export interface ReceiptRecord {
  id?: number;
  serial_number: string;
  
  // 客户信息
  customer_name: string;
  customer_phone?: string;
  
  // 会员权益信息
  membership_type: string;        // 会员卡类型
  membership_label?: string;       // 权益完整标签
  amount: number;
  
  // 日期信息
  contract_date: string;           // 签约日期（YYYY-MM-DD）
  
  // 经办信息
  handler_name?: string;
  
  // PDF 文件信息
  pdf_url?: string;
  pdf_path?: string;
  pdf_size?: number;
  pdf_generated_at?: string;
  
  // 状态信息
  status?: string;                 // active, cancelled, expired
  notes?: string;
  
  // 时间戳
  created_at?: string;
  updated_at?: string;
  
  // 元数据
  metadata?: Record<string, any>;
}

/**
 * 生成新的流水编号（自动递增，不重复）
 */
export async function generateNewSerial(customerName: string = '', amount: number = 0): Promise<string> {
  try {
    const year = new Date().getFullYear();
    
    // 查询今年的最大流水编号
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('serial_number')
      .like('serial_number', `${year}-N-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    
    if (data && data.length > 0) {
      // 从最后一个流水编号中提取数字部分
      const lastSerial = data[0].serial_number;
      const match = lastSerial.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // 生成新的流水编号（4位数字，不足补0）
    const serialNumber = `${year}-N-${String(nextNumber).padStart(4, '0')}`;
    
    // 保存到数据库
    const { error: insertError } = await supabase
      .from('serial_numbers')
      .insert({
        serial_number: serialNumber,
        customer_name: customerName,
        amount: amount
      });

    if (insertError) {
      console.error('❌ 流水编号保存失败:', insertError);
      // 如果保存失败，使用时间戳作为备用方案
      const timestamp = Date.now().toString().slice(-4);
      return `${year}-N-${timestamp}`;
    }

    console.log('✅ 生成新流水编号:', serialNumber);
    return serialNumber;
  } catch (error) {
    console.error('❌ 生成流水编号出错:', error);
    // 备用方案：使用时间戳
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    return `${year}-N-${timestamp}`;
  }
}

/**
 * 检查流水编号是否已存在
 */
export async function checkSerialExists(serialNumber: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('id')
      .eq('serial_number', serialNumber)
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
}

/**
 * 获取最近的流水编号记录
 */
export async function getRecentSerials(limit: number = 10): Promise<SerialRecord[]> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ 获取流水编号记录失败:', error);
      return [];
    }

    return data as SerialRecord[];
  } catch (error) {
    console.error('❌ 获取流水编号记录出错:', error);
    return [];
  }
}

// ==================== 完整确认函记录管理 ====================

/**
 * 保存完整的确认函记录（包含所有表单信息和 PDF 文件信息）
 */
export async function saveReceiptRecord(receipt: ReceiptRecord): Promise<boolean> {
  try {
    console.log('💾 保存完整确认函记录:', receipt.serial_number);
    
    const { data, error } = await supabase
      .from('serial_numbers')
      .upsert({
        serial_number: receipt.serial_number,
        customer_name: receipt.customer_name,
        customer_phone: receipt.customer_phone || '',
        membership_type: receipt.membership_type,
        membership_label: receipt.membership_label || '',
        amount: receipt.amount,
        contract_date: receipt.contract_date,
        handler_name: receipt.handler_name || '',
        pdf_url: receipt.pdf_url || '',
        pdf_path: receipt.pdf_path || '',
        pdf_size: receipt.pdf_size || 0,
        pdf_generated_at: receipt.pdf_generated_at || new Date().toISOString(),
        status: receipt.status || 'active',
        notes: receipt.notes || '',
        metadata: receipt.metadata || {},
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'serial_number'
      });

    if (error) {
      console.error('❌ 确认函记录保存失败:', error);
      return false;
    }

    console.log('✅ 确认函记录已保存');
    return true;
  } catch (error) {
    console.error('❌ 保存确认函记录出错:', error);
    return false;
  }
}

/**
 * 获取确认函记录（通过流水编号）
 */
export async function getReceiptBySerial(serialNumber: string): Promise<ReceiptRecord | null> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('*')
      .eq('serial_number', serialNumber)
      .single();

    if (error) {
      console.error('❌ 获取确认函记录失败:', error);
      return null;
    }

    return data as ReceiptRecord;
  } catch (error) {
    console.error('❌ 获取确认函记录出错:', error);
    return null;
  }
}

/**
 * 获取最近的确认函记录列表
 */
export async function getRecentReceipts(limit: number = 20): Promise<ReceiptRecord[]> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ 获取确认函记录列表失败:', error);
      return [];
    }

    return data as ReceiptRecord[];
  } catch (error) {
    console.error('❌ 获取确认函记录列表出错:', error);
    return [];
  }
}

/**
 * 搜索确认函记录
 */
export async function searchReceipts(keyword: string, limit: number = 50): Promise<ReceiptRecord[]> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('*')
      .or(`customer_name.ilike.%${keyword}%,serial_number.ilike.%${keyword}%,customer_phone.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ 搜索确认函记录失败:', error);
      return [];
    }

    return data as ReceiptRecord[];
  } catch (error) {
    console.error('❌ 搜索确认函记录出错:', error);
    return [];
  }
}

/**
 * 更新确认函状态
 */
export async function updateReceiptStatus(
  serialNumber: string, 
  status: 'active' | 'cancelled' | 'expired',
  notes?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }

    const { error } = await supabase
      .from('serial_numbers')
      .update(updateData)
      .eq('serial_number', serialNumber);

    if (error) {
      console.error('❌ 更新确认函状态失败:', error);
      return false;
    }

    console.log('✅ 确认函状态已更新');
    return true;
  } catch (error) {
    console.error('❌ 更新确认函状态出错:', error);
    return false;
  }
}

/**
 * 获取统计信息
 */
export async function getReceiptStatistics(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('serial_numbers')
      .select('amount, status, created_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ 获取统计信息失败:', error);
      return null;
    }

    const total = data.length;
    const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const active = data.filter(item => item.status === 'active').length;
    const cancelled = data.filter(item => item.status === 'cancelled').length;

    return {
      total,
      totalAmount,
      active,
      cancelled,
      averageAmount: total > 0 ? totalAmount / total : 0
    };
  } catch (error) {
    console.error('❌ 获取统计信息出错:', error);
    return null;
  }
}

