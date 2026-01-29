# 📋 确认函完整记录系统使用指南

## 🎯 功能概述

现在每次生成确认函时，系统会自动在数据库中保存一条完整的记录，包括：

- ✅ 客户信息（姓名、手机号）
- ✅ 会员权益信息（类型、金额、签约日期）
- ✅ 经办管家信息
- ✅ PDF 文件信息（URL、路径、大小）
- ✅ 状态信息（有效、已取消、已过期）
- ✅ 时间戳（创建时间、更新时间）

---

## 🚀 快速开始

### 步骤 1：升级数据库表结构

1. 打开 [Supabase Dashboard](https://app.supabase.com/)
2. 进入 **SQL Editor**
3. 打开 `supabase-schema-upgrade.sql` 文件
4. 复制全部内容粘贴到 SQL Editor
5. 点击 **Run** 按钮

✅ 执行成功后会看到提示：**数据库升级完成！**

### 步骤 2：测试功能

刷新浏览器页面，生成一个确认函：

1. 填写客户信息
2. 选择会员权益
3. 点击"生成文档 (PDF)"

控制台应该显示：
```
✅ PDF 已上传到云端
✅ 确认函记录已保存到数据库
```

---

## 📊 数据库表结构

### 扩展后的字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGSERIAL | 自增主键 |
| `serial_number` | TEXT | 流水编号（唯一）|
| `customer_name` | TEXT | 客户姓名 |
| `customer_phone` | TEXT | 客户手机号 |
| `membership_type` | TEXT | 会员卡类型 |
| `membership_label` | TEXT | 完整权益标签 |
| `amount` | DECIMAL | 金额（元）|
| `contract_date` | DATE | 签约日期 |
| `handler_name` | TEXT | 经办管家姓名 |
| `pdf_url` | TEXT | PDF 公开访问 URL |
| `pdf_path` | TEXT | PDF 存储路径 |
| `pdf_size` | INTEGER | PDF 文件大小（字节）|
| `pdf_generated_at` | TIMESTAMP | PDF 生成时间 |
| `status` | TEXT | 状态（active/cancelled/expired）|
| `notes` | TEXT | 备注信息 |
| `created_at` | TIMESTAMP | 创建时间 |
| `updated_at` | TIMESTAMP | 更新时间 |
| `metadata` | JSONB | 额外元数据 |

---

## 💻 API 使用说明

### 1. 保存确认函记录

```javascript
const receiptRecord = {
  serial_number: '2026-N-0001',
  customer_name: '张三',
  customer_phone: '13800138000',
  membership_type: '守护·家园年卡',
  amount: 2580,
  contract_date: '2026-01-30',
  handler_name: '李四',
  pdf_url: 'https://xxx.supabase.co/storage/v1/object/public/receipts/...',
  pdf_path: 'pdfs/1234567890_filename.pdf',
  pdf_size: 123456,
  status: 'active'
};

const success = await window.saveReceiptRecord(receiptRecord);
```

### 2. 查询单个记录

```javascript
const receipt = await window.getReceiptBySerial('2026-N-0001');
console.log(receipt.customer_name); // '张三'
console.log(receipt.pdf_url); // PDF 访问地址
```

### 3. 获取最近记录

```javascript
// 获取最近 20 条记录
const recentReceipts = await window.getRecentReceipts(20);
recentReceipts.forEach(receipt => {
  console.log(`${receipt.serial_number} - ${receipt.customer_name}`);
});
```

### 4. 搜索记录

```javascript
// 搜索客户姓名、流水编号或手机号
const results = await window.searchReceipts('张三');
console.log(`找到 ${results.length} 条记录`);
```

### 5. 更新状态

```javascript
// 取消确认函
await window.updateReceiptStatus('2026-N-0001', 'cancelled', '客户退款');

// 标记为已过期
await window.updateReceiptStatus('2025-N-0100', 'expired');
```

### 6. 获取统计信息

```javascript
const stats = await window.getReceiptStatistics();
console.log(`总计: ${stats.total} 条`);
console.log(`总金额: ¥${stats.totalAmount}`);
console.log(`有效: ${stats.active} 条`);
console.log(`已取消: ${stats.cancelled} 条`);
console.log(`平均金额: ¥${stats.averageAmount.toFixed(2)}`);
```

---

## 🔍 数据查询示例

### SQL 查询示例

#### 1. 查看所有记录

```sql
SELECT 
    serial_number,
    customer_name,
    membership_type,
    amount,
    contract_date,
    pdf_url,
    created_at
FROM serial_numbers
ORDER BY created_at DESC
LIMIT 50;
```

#### 2. 按客户查询

```sql
SELECT * FROM serial_numbers
WHERE customer_name = '张三'
ORDER BY created_at DESC;
```

#### 3. 按日期范围查询

```sql
SELECT * FROM serial_numbers
WHERE contract_date BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY contract_date DESC;
```

#### 4. 按会员类型统计

```sql
SELECT 
    membership_type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM serial_numbers
WHERE status = 'active'
GROUP BY membership_type
ORDER BY total_amount DESC;
```

#### 5. 按经办管家统计

```sql
SELECT 
    handler_name,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM serial_numbers
WHERE handler_name != ''
GROUP BY handler_name
ORDER BY count DESC;
```

#### 6. 查找缺少 PDF 的记录

```sql
SELECT serial_number, customer_name, created_at
FROM serial_numbers
WHERE pdf_url = '' OR pdf_url IS NULL
ORDER BY created_at DESC;
```

#### 7. 月度统计报表

```sql
SELECT 
    DATE_TRUNC('month', contract_date) as month,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    COUNT(DISTINCT customer_name) as unique_customers
FROM serial_numbers
WHERE status = 'active'
GROUP BY DATE_TRUNC('month', contract_date)
ORDER BY month DESC;
```

---

## 📱 实际使用场景

### 场景 1：客户查询

```
客户打电话询问："我上个月办理的会员卡信息能发给我吗？"

操作：
1. 打开 Supabase Dashboard
2. 在 SQL Editor 中运行：
   SELECT * FROM serial_numbers 
   WHERE customer_name = '客户姓名' 
   ORDER BY created_at DESC LIMIT 1;
3. 复制 pdf_url 发送给客户
```

### 场景 2：月度报表

```
需要生成本月的销售报表

操作：
在 Supabase Dashboard 运行统计查询，导出 CSV
```

### 场景 3：数据审核

```
发现某个确认函有误，需要作废

操作：
await window.updateReceiptStatus('2026-N-0123', 'cancelled', '信息错误');
```

### 场景 4：数据备份

```
定期导出所有确认函记录

操作：
在 Supabase Dashboard 的 Table Editor 中：
1. 选择 serial_numbers 表
2. 点击 "Export to CSV"
```

---

## 🛠️ 高级功能

### 1. 自动更新时间戳

数据库已配置触发器，每次更新记录时自动更新 `updated_at` 字段。

### 2. 统计视图

已创建 `receipt_statistics` 视图，可以快速查看统计数据：

```sql
SELECT * FROM receipt_statistics
ORDER BY date DESC
LIMIT 30;
```

### 3. 全文搜索

使用 PostgreSQL 的全文搜索功能：

```sql
SELECT * FROM serial_numbers
WHERE 
  customer_name ILIKE '%关键词%' OR
  serial_number ILIKE '%关键词%' OR
  customer_phone ILIKE '%关键词%';
```

---

## 📊 数据分析示例

### 1. 会员类型分布

```sql
SELECT 
    membership_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM serial_numbers
WHERE status = 'active'
GROUP BY membership_type
ORDER BY count DESC;
```

### 2. 销售趋势

```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as daily_count,
    SUM(amount) as daily_amount
FROM serial_numbers
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### 3. 客户价值排名

```sql
SELECT 
    customer_name,
    COUNT(*) as purchase_count,
    SUM(amount) as total_spent,
    MAX(created_at) as last_purchase
FROM serial_numbers
WHERE status = 'active'
GROUP BY customer_name
HAVING COUNT(*) > 1
ORDER BY total_spent DESC
LIMIT 20;
```

---

## 🔒 数据安全

### 备份建议

1. **自动备份**（Supabase Pro 版本）
   - 自动每日备份
   - 保留 7 天

2. **手动备份**
   - 定期导出 CSV
   - 存储到安全位置

3. **代码备份**
   ```bash
   # 导出表结构
   pg_dump -s -t serial_numbers > backup.sql
   ```

### 访问控制

生产环境建议：

```sql
-- 限制只读访问
CREATE POLICY "Read only for authenticated users"
ON serial_numbers FOR SELECT
USING (auth.role() = 'authenticated');

-- 限制写入权限
CREATE POLICY "Insert for authorized users only"
ON serial_numbers FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 🎓 最佳实践

1. **定期清理**
   - 定期归档旧记录
   - 删除测试数据

2. **数据验证**
   - 确保必填字段完整
   - 验证金额格式

3. **性能优化**
   - 使用索引加速查询
   - 定期 VACUUM

4. **监控告警**
   - 监控存储空间
   - 设置异常告警

---

## ✅ 功能检查清单

完成以下步骤确保功能正常：

- [ ] 已执行 `supabase-schema-upgrade.sql`
- [ ] 已刷新浏览器页面
- [ ] 生成测试确认函
- [ ] 控制台显示"确认函记录已保存"
- [ ] 在 Supabase Dashboard 中能看到新记录
- [ ] PDF URL 可以访问
- [ ] 所有字段数据正确

---

**🎉 恭喜！现在你拥有了一个完整的确认函记录系统！**

所有生成的确认函都会被完整记录，方便日后查询、统计和管理。

