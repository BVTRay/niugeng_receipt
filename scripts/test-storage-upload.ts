/**
 * 测试存储桶上传功能
 * 用于诊断文件上传问题
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 开始测试存储桶上传功能...\n');

async function testStorageUpload() {
  // 动态导入 Supabase 客户端
  const { supabase } = await import('../src/lib/supabase-client.js');
  
  const bucketName = 'receipts';
  
  // 测试 1: 检查存储桶是否存在
  console.log('📡 测试 1: 检查存储桶是否存在');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ 无法列出存储桶:', error.message);
      console.error('   错误详情:', error);
      console.log('\n💡 可能的原因:');
      console.log('   1. Anon Key 没有权限列出存储桶');
      console.log('   2. 环境变量配置错误（连接到了错误的项目）');
      console.log('   3. Supabase 项目设置问题');
      console.log('\n🔍 请检查:');
      console.log('   1. Supabase Dashboard → Settings → API');
      console.log('   2. 确认使用的是正确的 Project URL 和 anon key');
      console.log('   3. 确认存储桶创建在当前项目中');
      return false;
    }
    
    console.log(`📦 找到 ${buckets.length} 个存储桶:`);
    if (buckets.length === 0) {
      console.log('   ⚠️  注意: listBuckets() 返回空数组');
      console.log('   这可能是因为:');
      console.log('   1. Anon Key 没有权限列出存储桶（常见情况）');
      console.log('   2. 存储桶真的不存在');
      console.log('\n💡 建议: 运行 "npm run test:storage-direct" 进行更准确的测试');
      console.log('   该脚本会直接访问存储桶，不依赖 listBuckets() 权限');
    } else {
      buckets.forEach(b => {
        console.log(`   - ${b.name} (${b.public ? '公开' : '私有'}) - 创建于: ${b.created_at}`);
      });
    }
    
    const bucket = buckets.find(b => b.name === bucketName);
    if (!bucket) {
      if (buckets.length === 0) {
        console.log(`\n⚠️  无法通过 listBuckets() 确认存储桶 "${bucketName}" 是否存在`);
        console.log('   这是因为 anon key 通常没有列出存储桶的权限');
        console.log('\n💡 解决方案:');
        console.log('   1. 运行 "npm run test:storage-direct" 进行直接测试');
        console.log('   2. 或者直接在 Supabase Dashboard 中确认存储桶是否存在');
        console.log('   3. 如果存储桶存在，请检查存储策略（Policies）');
        console.log('\n   继续测试 2: 直接访问存储桶...');
        // 不返回 false，继续测试 2
      } else {
        console.error(`\n❌ 存储桶 "${bucketName}" 不存在`);
        console.log(`📦 当前项目中的存储桶: ${buckets.map(b => b.name).join(', ')}`);
        console.log('\n💡 解决方案:');
        console.log('   1. 在 Supabase Dashboard 中创建存储桶');
        console.log('   2. 存储桶名称必须是: receipts（区分大小写）');
        console.log('   3. 或者修改代码中的存储桶名称以匹配现有的存储桶');
        return false;
      }
    } else {
      console.log(`✅ 存储桶 "${bucketName}" 存在`);
      console.log(`   公开访问: ${bucket.public ? '是' : '否'}`);
      console.log(`   创建时间: ${bucket.created_at}`);
    }
    
    console.log(`✅ 存储桶 "${bucketName}" 存在`);
    console.log(`   公开访问: ${bucket.public ? '是' : '否'}`);
    console.log(`   创建时间: ${bucket.created_at}`);
  } catch (err) {
    console.error('❌ 检查存储桶时出错:', err);
    return false;
  }

  console.log('\n');

  // 测试 2: 检查存储桶内容
  console.log('📡 测试 2: 检查存储桶内容');
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 });
    
    if (error) {
      console.error('❌ 无法列出文件:', error.message);
      if (error.message.includes('not found')) {
        console.log('💡 存储桶可能不存在或没有访问权限');
      }
      return false;
    }
    
    console.log(`📄 存储桶中有 ${files.length} 个文件/文件夹:`);
    if (files.length === 0) {
      console.log('   (存储桶为空)');
    } else {
      files.forEach((file, index) => {
        if (index < 10) {
          console.log(`   - ${file.name} (${file.id})`);
        }
      });
      if (files.length > 10) {
        console.log(`   ... 还有 ${files.length - 10} 个文件`);
      }
    }
  } catch (err) {
    console.error('❌ 列出文件时出错:', err);
    return false;
  }

  console.log('\n');

  // 测试 3: 测试上传权限
  console.log('📡 测试 3: 测试上传权限');
  try {
    const testFileName = `test-upload-${Date.now()}.txt`;
    const testContent = `测试文件 - ${new Date().toISOString()}`;
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    console.log(`   尝试上传测试文件: ${testFileName}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, blob, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (error) {
      console.error('❌ 上传测试失败:', error.message);
      console.error('   错误代码:', error.statusCode || 'N/A');
      console.error('   错误详情:', error.error || 'N/A');
      
      console.log('\n💡 可能的原因和解决方案:');
      if (error.message.includes('new row violates row-level security')) {
        console.log('   1. ❌ RLS (行级安全) 策略阻止了上传');
        console.log('   2. ✅ 解决方案: 在 Supabase Dashboard 中添加存储策略');
        console.log('      进入 Storage > receipts > Policies');
        console.log('      添加以下策略:');
        console.log('      ```sql');
        console.log('      CREATE POLICY "Public Upload"');
        console.log('      ON storage.objects FOR INSERT');
        console.log('      WITH CHECK ( bucket_id = \'receipts\' );');
        console.log('      ```');
      } else if (error.message.includes('not found')) {
        console.log('   1. ❌ 存储桶不存在');
        console.log('   2. ✅ 解决方案: 在 Supabase Dashboard 中创建存储桶');
      } else {
        console.log('   1. ❌ 权限问题或配置错误');
        console.log('   2. ✅ 检查 Supabase Dashboard 中的存储桶设置');
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
    console.error('   VITE_SUPABASE_URL=你的supabase地址');
    console.error('   VITE_SUPABASE_ANON_KEY=你的anon密钥');
    console.error('\n💡 你可以运行 "npm run setup:env" 来配置');
    process.exit(1);
  }

  console.log('✅ 环境变量已加载');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('\n🔍 验证连接的项目:');
  console.log(`   请在 Supabase Dashboard 中确认此 URL 对应的项目`);
  console.log(`   如果 URL 不匹配，请更新 .env 文件中的 VITE_SUPABASE_URL`);
  console.log('\n');

  const success = await testStorageUpload();

  if (success) {
    console.log('\n═══════════════════════════════════════');
    console.log('✅ 所有测试通过！');
    console.log('🎉 存储桶配置正确，可以正常上传文件！');
    console.log('═══════════════════════════════════════\n');
  } else {
    console.log('\n═══════════════════════════════════════');
    console.log('⚠️  测试失败');
    console.log('📖 请查看上面的错误信息并按照提示修复');
    console.log('📚 更多帮助请查看 docs/SUPABASE_CONFIG.md');
    console.log('═══════════════════════════════════════\n');
    process.exit(1);
  }
}

main();

