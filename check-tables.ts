/**
 * 检查数据库表是否已创建
 */

import { config } from 'dotenv';
config();

async function checkTables() {
  console.log('\n🔍 检查数据库表...\n');

  // 动态导入 Supabase 客户端（确保环境变量已加载）
  const { supabase } = await import('./supabase-client.js');

  try {
    // 检查 app_configs 表
    console.log('📋 检查 app_configs 表...');
    const { data: configData, error: configError } = await supabase
      .from('app_configs')
      .select('id')
      .limit(1);

    if (configError) {
      if (configError.code === '42P01') {
        console.log('❌ app_configs 表不存在');
        console.log('   需要在 Supabase Dashboard 中执行 supabase-schema.sql');
        return false;
      } else {
        console.log('❌ 访问 app_configs 表出错:', configError.message);
        return false;
      }
    } else {
      console.log('✅ app_configs 表已创建');
    }

    // 检查 serial_numbers 表
    console.log('\n📋 检查 serial_numbers 表...');
    const { data: serialData, error: serialError } = await supabase
      .from('serial_numbers')
      .select('id')
      .limit(1);

    if (serialError) {
      if (serialError.code === '42P01') {
        console.log('❌ serial_numbers 表不存在');
        console.log('   需要在 Supabase Dashboard 中执行 supabase-schema.sql');
        return false;
      } else {
        console.log('❌ 访问 serial_numbers 表出错:', serialError.message);
        return false;
      }
    } else {
      console.log('✅ serial_numbers 表已创建');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ 所有数据库表都已正确创建！');
    console.log('🎉 可以运行 npm run test:database 进行完整测试');
    console.log('═══════════════════════════════════════\n');

    return true;
  } catch (error) {
    console.error('❌ 检查表时出错:', error);
    return false;
  }
}

checkTables();

