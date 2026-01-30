/**
 * PDF 上传到 Supabase 的辅助函数
 * 用于浏览器环境
 */

import { supabase } from './supabase-client';

/**
 * 将 jsPDF 生成的 PDF 上传到 Supabase
 * @param pdfBlob PDF 的 Blob 对象
 * @param fileName 文件名
 * @param bucketName 存储桶名称
 * @returns 上传结果
 */
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

export async function uploadPDFToSupabase(
  pdfBlob: Blob,
  fileName: string,
  bucketName: string = 'receipts'
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    console.log(`📤 开始上传 PDF: ${fileName}`);
    
    // 生成带时间戳的文件路径，避免文件名冲突
    // 使用安全的文件名生成，避免中文字符问题
    const safeFileName = generateSafeFileName(fileName);
    const filePath = `pdfs/${safeFileName}`;
    console.log(`   原始文件名: ${fileName}`);
    console.log(`   安全文件名: ${safeFileName}`);
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ PDF 上传失败:', error);
      console.error('   错误详情:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        bucket: bucketName,
        path: filePath
      });
      console.error('   可能的原因:');
      console.error('   1. 存储桶不存在或名称错误');
      console.error('   2. 存储桶权限策略（RLS）不允许上传');
      console.error('   3. 文件大小超过限制');
      console.error('   4. 网络连接问题');
      return null;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    console.log('✅ PDF 上传成功:', urlData.publicUrl);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('❌ PDF 上传过程出错:', error);
    return null;
  }
}

/**
 * 将 Base64 编码的 PDF 上传到 Supabase
 * @param base64Data Base64 编码的 PDF 数据（包含 data:application/pdf;base64, 前缀）
 * @param fileName 文件名
 * @param bucketName 存储桶名称
 * @returns 上传结果
 */
export async function uploadPDFBase64ToSupabase(
  base64Data: string,
  fileName: string,
  bucketName: string = 'receipts'
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    // 将 Base64 转换为 Blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    return await uploadPDFToSupabase(blob, fileName, bucketName);
  } catch (error) {
    console.error('❌ Base64 PDF 上传失败:', error);
    return null;
  }
}

