/**
 * Supabase 连接测试脚本
 * 运行此脚本来验证 Supabase 配置是否正确
 * 
 * 使用方法: npx tsx test-supabase.ts
 */

// 在 Node.js 环境中加载 .env 文件
import { config } from 'dotenv';
config();

console.log('\n🔍 开始测试 Supabase 连接...\n');

async function testConnection() {
  // 动态导入 Supabase 客户端（确保环境变量已加载）
  const { supabase } = await import('../src/lib/supabase-client.js');
  
  // 测试 1: 基础连接
  console.log('📡 测试 1: 验证基础连接');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ 连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 连接成功！');
    console.log(`📦 发现 ${buckets.length} 个存储桶:`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? '公开' : '私有'})`);
    });
  } catch (err) {
    console.error('❌ 连接错误:', err);
    return false;
  }

  console.log('\n');

  // 测试 2: 检查特定存储桶
  console.log('📡 测试 2: 检查存储桶内容');
  try {
    const bucketName = 'receipts'; // 修改为你的存储桶名称
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });

    if (error) {
      if (error.message.includes('not found')) {
        console.log(`⚠️  存储桶 "${bucketName}" 不存在`);
        console.log('💡 提示: 请在 Supabase Dashboard 中创建此存储桶');
      } else {
        console.error('❌ 查询失败:', error.message);
      }
      return false;
    }

    console.log(`✅ 存储桶 "${bucketName}" 访问成功`);
    if (files && files.length > 0) {
      console.log(`📄 发现 ${files.length} 个文件:`);
      files.slice(0, 5).forEach(file => {
        console.log(`   - ${file.name}`);
      });
      if (files.length > 5) {
        console.log(`   ... 还有 ${files.length - 5} 个文件`);
      }
    } else {
      console.log('📄 存储桶为空');
    }
  } catch (err) {
    console.error('❌ 查询错误:', err);
    return false;
  }

  console.log('\n');

  // 测试 3: 测试上传功能（可选）
  console.log('📡 测试 3: 测试上传权限');
  try {
    const bucketName = 'receipts';
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file from Niugeng Receipt Generator';
    
    // 创建一个简单的 Blob
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // 尝试上传
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, blob);

    if (uploadError) {
      console.log('⚠️  上传测试失败:', uploadError.message);
      console.log('💡 这可能是由于存储桶策略限制，请检查 RLS 设置');
    } else {
      console.log('✅ 上传权限正常');
      
      // 清理测试文件
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([testFileName]);
      
      if (!deleteError) {
        console.log('🗑️  测试文件已清理');
      }
    }
  } catch (err) {
    console.log('⚠️  上传测试异常:', err);
  }

  console.log('\n');

  return true;
}

async function main() {
  // 检查环境变量
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 环境变量未配置！');
    console.error('📝 请确保 .env 文件包含以下内容:');
    console.error('   VITE_SUPABASE_URL=你的supabase地址');
    console.error('   VITE_SUPABASE_ANON_KEY=你的anon密钥');
    console.error('\n💡 你可以运行 "npm run setup:env" 来配置');
    process.exit(1);
  }

  console.log('✅ 环境变量已加载');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('\n');

  const success = await testConnection();

  if (success) {
    console.log('═══════════════════════════════════════');
    console.log('✅ 所有测试通过！');
    console.log('🎉 Supabase 配置正确，可以开始使用了！');
    console.log('═══════════════════════════════════════\n');
  } else {
    console.log('═══════════════════════════════════════');
    console.log('⚠️  部分测试失败');
    console.log('📖 请查看 SUPABASE_CONFIG.md 获取帮助');
    console.log('═══════════════════════════════════════\n');
    process.exit(1);
  }
}

main();

