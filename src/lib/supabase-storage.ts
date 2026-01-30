import { supabase } from './supabase-client';

/**
 * Supabase 存储服务
 * 用于处理文件上传、下载和管理
 */

// 默认存储桶名称（可以根据实际情况修改）
const DEFAULT_BUCKET = 'receipts';

/**
 * 生成安全的文件名
 * 使用时间戳和随机字符串，避免中文字符和特殊字符导致的问题
 */
function generateSafeFileName(originalFileName: string): string {
  // 提取文件扩展名
  const ext = originalFileName.substring(originalFileName.lastIndexOf('.'));
  
  // 生成时间戳和随机字符串
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  // 使用时间戳_随机字符串.扩展名 的格式
  return `${timestamp}_${random}${ext}`;
}

/**
 * 清理文件名，移除不安全的字符（保留用于显示）
 */
function sanitizeFileName(fileName: string): string {
  // 提取文件扩展名
  const ext = fileName.substring(fileName.lastIndexOf('.'));
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  
  // 替换不安全字符为下划线
  const sanitized = nameWithoutExt
    .replace(/[<>:"|?*\x00-\x1F]/g, '_') // 移除 Windows 不支持的字符
    .replace(/\s+/g, '_') // 空格替换为下划线
    .replace(/_{2,}/g, '_') // 多个下划线合并为一个
    .replace(/^_+|_+$/g, ''); // 移除首尾下划线
  
  return sanitized + ext;
}

/**
 * 上传文件到 Supabase 存储桶
 * @param file 文件对象
 * @param path 存储路径（可选，默认使用时间戳生成）
 * @param bucketName 存储桶名称
 * @returns 上传结果，包含文件路径和公开 URL
 */
export async function uploadFile(
  file: File,
  path?: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    console.log(`📤 准备上传文件到存储桶: ${bucketName}`);
    console.log(`   文件名: ${file.name}`);
    console.log(`   文件大小: ${(file.size / 1024).toFixed(2)} KB`);
    
    // 如果没有提供路径，使用安全的文件名生成
    let filePath: string;
    if (path) {
      filePath = path;
    } else {
      // 使用时间戳和随机字符串生成安全的文件名，避免中文字符问题
      const safeFileName = generateSafeFileName(file.name);
      filePath = safeFileName;
    }
    console.log(`   存储路径: ${filePath}`);
    console.log(`   原始文件名: ${file.name}`);

    // 上传文件
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ 文件上传失败:', error);
      console.error('   错误详情:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        bucket: bucketName,
        path: filePath
      });
      return null;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log('✅ 文件上传成功!');
    console.log(`   文件路径: ${data.path}`);
    console.log(`   公开URL: ${urlData.publicUrl}`);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('上传过程出错:', error);
    return null;
  }
}

/**
 * 从 Supabase 存储桶下载文件
 * @param path 文件路径
 * @param bucketName 存储桶名称
 * @returns Blob 对象
 */
export async function downloadFile(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(path);

    if (error) {
      console.error('文件下载失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('下载过程出错:', error);
    return null;
  }
}

/**
 * 删除文件
 * @param paths 文件路径数组
 * @param bucketName 存储桶名称
 * @returns 是否删除成功
 */
export async function deleteFiles(
  paths: string[],
  bucketName: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove(paths);

    if (error) {
      console.error('文件删除失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除过程出错:', error);
    return false;
  }
}

/**
 * 获取文件的公开 URL
 * @param path 文件路径
 * @param bucketName 存储桶名称
 * @returns 公开访问 URL
 */
export function getPublicUrl(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * 列出存储桶中的文件
 * @param folderPath 文件夹路径（可选）
 * @param bucketName 存储桶名称
 * @returns 文件列表
 */
export async function listFiles(
  folderPath: string = '',
  bucketName: string = DEFAULT_BUCKET
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('文件列表获取失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('列表获取过程出错:', error);
    return null;
  }
}

/**
 * 上传 Base64 图片到存储桶
 * @param base64Data Base64 编码的图片数据
 * @param fileName 文件名
 * @param bucketName 存储桶名称
 * @returns 上传结果
 */
export async function uploadBase64Image(
  base64Data: string,
  fileName: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    // 将 Base64 转换为 Blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    // 创建 File 对象
    const file = new File([blob], fileName, { type: 'image/png' });
    
    // 生成带时间戳的文件路径，组织到 images 文件夹
    // 使用安全的文件名生成，避免中文字符问题
    const safeFileName = generateSafeFileName(fileName);
    const filePath = `images/${safeFileName}`;
    
    // 使用现有的上传函数，指定路径
    return await uploadFile(file, filePath, bucketName);
  } catch (error) {
    console.error('Base64 图片上传失败:', error);
    return null;
  }
}


