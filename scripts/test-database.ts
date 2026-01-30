/**
 * 数据库功能测试脚本
 * 测试配置同步和流水编号生成
 * 
 * 使用方法: npx tsx test-database.ts
 */

// 加载环境变量
import { config } from 'dotenv';
config();

import type { AppConfig } from '../src/lib/supabase-database';

console.log('\n🧪 开始测试数据库功能...\n');

async function testConfigSync() {
  // 动态导入数据库函数
  const { saveConfigToCloud, loadConfigFromCloud } = await import('../src/lib/supabase-database.js');
  console.log('📋 测试 1: 配置云端同步');
  
  try {
    // 创建测试配置
    const testConfig: AppConfig = {
      app_title: '测试应用',
      brand_name: '测试品牌',
      brand_sub: 'Test Brand',
      logo_url: 'https://example.com/logo.png',
      seal_url: 'https://example.com/seal.png',
      seal_text: '测试章',
      title: '测试标题',
      sub_title: 'Test Title',
      intro_text: '这是测试欢迎语',
      confirm_text: '这是测试确认语',
      footer_slogan: '测试 · 标语',
      membership_options: [
        { label: '测试套餐', price: 999 }
      ],
      handlers: ['测试管家']
    };

    // 保存配置
    console.log('💾 保存测试配置...');
    const saveSuccess = await saveConfigToCloud(testConfig);
    
    if (!saveSuccess) {
      console.error('❌ 配置保存失败');
      return false;
    }

    // 加载配置
    console.log('📥 加载配置...');
    const loadedConfig = await loadConfigFromCloud();
    
    if (!loadedConfig) {
      console.error('❌ 配置加载失败');
      return false;
    }

    // 验证配置
    if (loadedConfig.brand_name === testConfig.brand_name) {
      console.log('✅ 配置同步测试通过');
      console.log(`   品牌名称: ${loadedConfig.brand_name}`);
      return true;
    } else {
      console.error('❌ 配置数据不匹配');
      return false;
    }
  } catch (error) {
    console.error('❌ 配置同步测试失败:', error);
    return false;
  }
}

async function testSerialGeneration() {
  console.log('\n📋 测试 2: 流水编号生成');
  
  // 动态导入数据库函数
  const { generateNewSerial, checkSerialExists } = await import('../src/lib/supabase-database.js');
  
  try {
    // 生成多个流水编号
    const serials: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      console.log(`🔢 生成第 ${i + 1} 个流水编号...`);
      const serial = await generateNewSerial(`测试客户${i + 1}`, 1000 + i * 100);
      serials.push(serial);
      console.log(`   ✅ ${serial}`);
      
      // 检查是否已存在
      const exists = await checkSerialExists(serial);
      if (!exists) {
        console.error(`   ❌ 流水编号未正确保存到数据库`);
        return false;
      }
    }

    // 验证编号不重复
    const uniqueSerials = new Set(serials);
    if (uniqueSerials.size !== serials.length) {
      console.error('❌ 流水编号出现重复');
      return false;
    }

    // 验证编号递增
    const numbers = serials.map(s => parseInt(s.split('-')[2]));
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] <= numbers[i - 1]) {
        console.error('❌ 流水编号未正确递增');
        return false;
      }
    }

    console.log('✅ 流水编号生成测试通过');
    console.log(`   生成了 ${serials.length} 个唯一编号`);
    return true;
  } catch (error) {
    console.error('❌ 流水编号测试失败:', error);
    return false;
  }
}

async function testRecentRecords() {
  console.log('\n📋 测试 3: 查询最近记录');
  
  // 动态导入数据库函数
  const { getRecentSerials } = await import('../src/lib/supabase-database.js');
  
  try {
    const recentSerials = await getRecentSerials(5);
    
    if (recentSerials.length === 0) {
      console.log('⚠️  暂无流水编号记录');
      return true;
    }

    console.log(`✅ 找到 ${recentSerials.length} 条最近记录:`);
    recentSerials.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.serial_number} - ${record.customer_name || '无'} (¥${record.amount})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ 查询记录失败:', error);
    return false;
  }
}

async function main() {
  let allPassed = true;

  // 测试 1: 配置同步
  const test1 = await testConfigSync();
  allPassed = allPassed && test1;

  // 测试 2: 流水编号生成
  const test2 = await testSerialGeneration();
  allPassed = allPassed && test2;

  // 测试 3: 查询记录
  const test3 = await testRecentRecords();
  allPassed = allPassed && test3;

  // 总结
  console.log('\n═══════════════════════════════════════');
  if (allPassed) {
    console.log('✅ 所有测试通过！');
    console.log('🎉 数据库功能正常，可以使用了！');
  } else {
    console.log('❌ 部分测试失败');
    console.log('📖 请查看 SETUP_DATABASE.md 获取帮助');
  }
  console.log('═══════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

main();

