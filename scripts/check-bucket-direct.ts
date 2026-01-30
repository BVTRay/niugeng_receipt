/**
 * 直接检查存储桶（不依赖 listBuckets）
 * 用于诊断存储桶访问问题
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 直接检查存储桶访问...\n');

async function checkBucketDirect() {
  const { supabase } = await import('../src/lib/supabase-client.js');
  const bucketName = 'receipts';
  
  // 方法 1: 尝试列出存储桶根目录
  console.log('📡 方法 1: 尝试列出存储桶根目录');
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('❌ 无法访问存储桶:', error.message);
      console.error('   错误代码:', error.statusCode || 'N/A');
      console.error('   完整错误:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('\n💡 存储桶不存在或名称不匹配');
        console.log('   请检查:');
        console.log('   1. Supabase Dashboard → Storage');
        console.log('   2. 存储桶名称是否完全匹配 "receipts"（区分大小写）');
        console.log('   3. 存储桶是否创建在当前 Supabase 项目中');
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('\n💡 权限问题');
        console.log('   请检查存储桶的 Policies 设置');
      }
    } else {
      console.log('✅ 存储桶访问成功！');
      console.log(`   找到 ${files.length} 个文件/文件夹`);
      if (files.length > 0) {
        console.log('   示例文件:', files[0].name);
      }
      return true;
    }
  } catch (err) {
    console.error('❌ 访问存储桶时出错:', err);
  }
  
  console.log('\n');
  
  // 方法 2: 尝试上传测试文件
  console.log('📡 方法 2: 尝试上传测试文件');
  try {
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'test';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, blob);
    
    if (error) {
      console.error('❌ 上传失败:', error.message);
      console.error('   完整错误:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ 上传成功！');
      console.log('   文件路径:', data.path);
      
      // 清理
      await supabase.storage.from(bucketName).remove([testFileName]);
      return true;
    }
  } catch (err) {
    console.error('❌ 上传测试时出错:', err);
  }
  
  return false;
}

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  console.log('📍 Supabase URL:', supabaseUrl);
  console.log('🔑 Anon Key:', supabaseKey.substring(0, 20) + '...');
  console.log('\n');

  const success = await checkBucketDirect();
  
  if (!success) {
    console.log('\n═══════════════════════════════════════');
    console.log('💡 诊断建议:');
    console.log('═══════════════════════════════════════');
    console.log('1. 确认存储桶名称完全匹配 "receipts"');
    console.log('2. 确认存储桶创建在正确的 Supabase 项目中');
    console.log('3. 检查 Supabase Dashboard → Storage → receipts');
    console.log('4. 检查存储桶的 Policies 设置');
    console.log('5. 确认环境变量中的 URL 和 Key 正确');
    console.log('═══════════════════════════════════════\n');
  }
}

main();

