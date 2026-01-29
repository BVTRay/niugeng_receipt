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
export async function uploadPDFToSupabase(
  pdfBlob: Blob,
  fileName: string,
  bucketName: string = 'receipts'
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    console.log(`📤 开始上传 PDF: ${fileName}`);
    
    // 生成带时间戳的文件路径，避免文件名冲突
    // 使用 URL 编码处理中文字符，确保兼容性
    const timestamp = Date.now();
    const encodedFileName = encodeURIComponent(fileName);
    const filePath = `pdfs/${timestamp}_${encodedFileName}`;
    
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

