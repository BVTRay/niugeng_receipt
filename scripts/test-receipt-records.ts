/**
 * 测试确认函完整记录功能
 */

import { config } from 'dotenv';
config();

async function testReceiptRecords() {
  console.log('\n🧪 测试确认函完整记录功能...\n');

  // 动态导入函数
  const { 
    saveReceiptRecord, 
    getReceiptBySerial,
    getRecentReceipts,
    searchReceipts,
    updateReceiptStatus,
    getReceiptStatistics
  } = await import('../src/lib/supabase-database.js');

  let allTestsPassed = true;

  // 测试 1: 保存完整记录
  console.log('📋 测试 1: 保存完整确认函记录');
  const testReceipt = {
    serial_number: `TEST-2026-${Date.now()}`,
    customer_name: '测试客户',
    customer_phone: '13800138000',
    membership_type: '守护·家园年卡',
    membership_label: '【标准】守护·家园年卡',
    amount: 2580,
    contract_date: '2026-01-30',
    handler_name: '测试管家',
    pdf_url: 'https://example.com/test.pdf',
    pdf_path: 'pdfs/test.pdf',
    pdf_size: 123456,
    status: 'active',
    notes: '这是测试记录',
    metadata: { test: true }
  };

  const saved = await saveReceiptRecord(testReceipt);
  if (saved) {
    console.log('✅ 保存成功');
  } else {
    console.log('❌ 保存失败');
    allTestsPassed = false;
  }

  // 测试 2: 查询单个记录
  console.log('\n📋 测试 2: 查询单个记录');
  const retrieved = await getReceiptBySerial(testReceipt.serial_number);
  if (retrieved && retrieved.customer_name === testReceipt.customer_name) {
    console.log('✅ 查询成功');
    console.log(`   客户: ${retrieved.customer_name}`);
    console.log(`   金额: ¥${retrieved.amount}`);
    console.log(`   PDF: ${retrieved.pdf_url}`);
  } else {
    console.log('❌ 查询失败');
    allTestsPassed = false;
  }

  // 测试 3: 获取最近记录
  console.log('\n📋 测试 3: 获取最近记录');
  const recentReceipts = await getRecentReceipts(5);
  if (recentReceipts && recentReceipts.length > 0) {
    console.log(`✅ 找到 ${recentReceipts.length} 条记录`);
    recentReceipts.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.serial_number} - ${r.customer_name}`);
    });
  } else {
    console.log('⚠️  未找到记录');
  }

  // 测试 4: 搜索记录
  console.log('\n📋 测试 4: 搜索记录');
  const searchResults = await searchReceipts('测试');
  if (searchResults && searchResults.length > 0) {
    console.log(`✅ 搜索到 ${searchResults.length} 条记录`);
  } else {
    console.log('⚠️  未搜索到记录');
  }

  // 测试 5: 更新状态
  console.log('\n📋 测试 5: 更新状态');
  const updated = await updateReceiptStatus(testReceipt.serial_number, 'cancelled', '测试取消');
  if (updated) {
    console.log('✅ 状态更新成功');
    const check = await getReceiptBySerial(testReceipt.serial_number);
    if (check && check.status === 'cancelled') {
      console.log('   状态已更新为: cancelled');
    }
  } else {
    console.log('❌ 状态更新失败');
    allTestsPassed = false;
  }

  // 测试 6: 获取统计信息
  console.log('\n📋 测试 6: 获取统计信息');
  const stats = await getReceiptStatistics();
  if (stats) {
    console.log('✅ 统计信息获取成功');
    console.log(`   总记录数: ${stats.total}`);
    console.log(`   总金额: ¥${stats.totalAmount.toFixed(2)}`);
    console.log(`   有效记录: ${stats.active}`);
    console.log(`   已取消: ${stats.cancelled}`);
    console.log(`   平均金额: ¥${stats.averageAmount.toFixed(2)}`);
  } else {
    console.log('⚠️  统计信息获取失败');
  }

  // 总结
  console.log('\n═══════════════════════════════════════');
  if (allTestsPassed) {
    console.log('✅ 所有测试通过！');
    console.log('🎉 确认函完整记录功能正常！');
  } else {
    console.log('❌ 部分测试失败');
  }
  console.log('═══════════════════════════════════════\n');

  process.exit(allTestsPassed ? 0 : 1);
}

testReceiptRecords();


