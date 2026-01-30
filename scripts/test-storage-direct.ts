/**
 * 直接测试存储桶访问（不依赖 listBuckets）
 * 用于诊断存储桶权限问题
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 直接测试存储桶访问（绕过 listBuckets 权限限制）...\n');

async function testStorageDirect() {
  // 动态导入 Supabase 客户端
  const { supabase } = await import('../src/lib/supabase-client.js');
  
  const bucketName = 'receipts';
  
  // 测试 1: 直接尝试列出存储桶内容（不依赖 listBuckets）
  console.log('📡 测试 1: 直接访问存储桶（不依赖 listBuckets）');
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });
    
    if (error) {
      console.error('❌ 无法访问存储桶:', error.message);
      console.error('   错误代码:', error.statusCode || 'N/A');
      console.error('   错误名称:', error.name || 'N/A');
      
      // 检查原始错误
      if (error.originalError) {
        console.error('   原始错误:', error.originalError);
        if (error.originalError.message) {
          console.error('   原始错误消息:', error.originalError.message);
        }
      }
      
      // 处理 fetch failed 错误
      if (error.message.includes('fetch failed') || error.name === 'StorageUnknownError') {
        console.log('\n💡 "fetch failed" 错误可能的原因:');
        console.log('   1. 网络连接问题');
        console.log('   2. Supabase URL 配置错误');
        console.log('   3. 存储桶不存在');
        console.log('   4. CORS 配置问题');
        console.log('\n🔍 检查步骤:');
        console.log('   1. 确认 Supabase URL 正确:', process.env.VITE_SUPABASE_URL);
        console.log('   2. 在浏览器中访问 Supabase Dashboard 确认项目正常');
        console.log('   3. 检查网络连接');
        console.log('   4. 确认存储桶 "receipts" 已创建');
        console.log('\n📝 如果存储桶不存在，请:');
        console.log('   1. 在 Supabase Dashboard 中创建存储桶');
        console.log('   2. 存储桶名称必须是: receipts');
        console.log('   3. 可以选择公开或私有（策略会处理权限）');
        return false;
      }
      
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('\n💡 存储桶不存在或名称不匹配');
        console.log('   请检查:');
        console.log('   1. Supabase Dashboard → Storage');
        console.log('   2. 存储桶名称是否完全匹配 "receipts"（区分大小写）');
        console.log('   3. 存储桶是否创建在当前 Supabase 项目中');
        console.log('   4. 当前项目 URL:', process.env.VITE_SUPABASE_URL);
      } else if (error.message.includes('permission') || error.message.includes('policy') || error.message.includes('row-level security')) {
        console.log('\n💡 权限问题 - 需要配置存储策略');
        console.log('   请按照以下步骤操作:');
        console.log('   1. 登录 Supabase Dashboard');
        console.log('   2. 进入 Storage → receipts → Policies');
        console.log('   3. 添加以下策略:');
        console.log('');
        console.log('   -- 允许公开读取');
        console.log('   CREATE POLICY "Public Access"');
        console.log('   ON storage.objects FOR SELECT');
        console.log('   USING ( bucket_id = \'receipts\' );');
        console.log('');
        console.log('   -- 允许公开上传');
        console.log('   CREATE POLICY "Public Upload"');
        console.log('   ON storage.objects FOR INSERT');
        console.log('   WITH CHECK ( bucket_id = \'receipts\' );');
      } else {
        console.log('\n💡 其他错误，请检查:');
        console.log('   1. Supabase 项目设置');
        console.log('   2. API 密钥是否正确');
        console.log('   3. 网络连接');
      }
      return false;
    } else {
      console.log('✅ 存储桶访问成功！');
      console.log(`   找到 ${files.length} 个文件/文件夹`);
      if (files.length > 0) {
        console.log('   文件列表:');
        files.forEach((file, index) => {
          if (index < 10) {
            console.log(`     - ${file.name} (${file.id})`);
          }
        });
        if (files.length > 10) {
          console.log(`     ... 还有 ${files.length - 10} 个文件`);
        }
      } else {
        console.log('   (存储桶为空)');
      }
    }
  } catch (err) {
    console.error('❌ 访问存储桶时出错:', err);
    return false;
  }

  console.log('\n');

  // 测试 2: 尝试上传测试文件
  console.log('📡 测试 2: 测试上传功能');
  try {
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = `测试文件 - ${new Date().toISOString()}`;
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log(`   尝试上传: ${testFileName}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, blob, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (error) {
      console.error('❌ 上传失败:', error.message);
      console.error('   错误代码:', error.statusCode || 'N/A');
      console.error('   完整错误:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('new row violates row-level security') || error.message.includes('policy')) {
        console.log('\n💡 上传被 RLS 策略阻止');
        console.log('   解决方案: 在 Supabase Dashboard 中添加上传策略');
        console.log('   1. Storage → receipts → Policies');
        console.log('   2. 添加以下策略:');
        console.log('');
        console.log('   CREATE POLICY "Public Upload"');
        console.log('   ON storage.objects FOR INSERT');
        console.log('   WITH CHECK ( bucket_id = \'receipts\' );');
      }
      return false;
    }
    
    console.log('✅ 上传测试成功!');
    console.log(`   文件路径: ${data.path}`);
    
    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    console.log(`   公开URL: ${urlData.publicUrl}`);
    
    // 清理测试文件
    console.log('\n🗑️  清理测试文件...');
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️  无法删除测试文件:', deleteError.message);
      console.log('   (可以手动在 Dashboard 中删除)');
    } else {
      console.log('✅ 测试文件已清理');
    }
    
    return true;
  } catch (err) {
    console.error('❌ 上传测试异常:', err);
    return false;
  }
}

async function main() {
  // 检查环境变量
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 环境变量未配置！');
    console.error('📝 请确保 .env 文件包含以下内容:');
    console.error('   VITE_SUPABASE_URL=你的supabase-url');
    console.error('   VITE_SUPABASE_ANON_KEY=你的anon-key');
    process.exit(1);
  }

  console.log('✅ 环境变量已加载');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('\n');

  const success = await testStorageDirect();

  if (success) {
    console.log('\n═══════════════════════════════════════');
    console.log('✅ 所有测试通过！');
    console.log('🎉 存储桶配置正确，可以正常使用！');
    console.log('═══════════════════════════════════════\n');
  } else {
    console.log('\n═══════════════════════════════════════');
    console.log('⚠️  测试失败');
    console.log('📖 请查看上面的错误信息和解决方案');
    console.log('═══════════════════════════════════════\n');
  }
}

main();

