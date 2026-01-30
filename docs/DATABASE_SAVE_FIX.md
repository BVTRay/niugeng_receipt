# 数据库保存功能修复说明

## 📋 问题说明

之前生成图片或PDF时，数据可能没有正确保存到云端数据库。现在已经修复。

## ✅ 修复内容

### 1. 图片生成功能
- ✅ **已添加**：生成图片时自动上传到 Supabase 存储
- ✅ **已添加**：生成图片时自动保存记录到数据库
- ✅ **已添加**：即使上传失败，也会保存基本记录到数据库

### 2. PDF 生成功能
- ✅ **已优化**：即使 PDF 上传失败，也会保存基本记录到数据库
- ✅ **已优化**：改进了错误提示，明确显示上传和保存状态

## 📊 数据保存位置

所有确认函记录保存在 **`serial_numbers`** 表中。

### 表结构要求

确保你的数据库表包含以下字段（如果缺少，需要执行升级脚本）：

- `serial_number` - 流水编号（主键）
- `customer_name` - 客户姓名
- `customer_phone` - 客户电话
- `membership_type` - 会员类型
- `membership_label` - 会员标签
- `amount` - 金额
- `contract_date` - 签约日期
- `handler_name` - 经办人
- `pdf_url` - PDF 文件 URL（图片模式时为空）
- `pdf_path` - PDF 文件路径
- `pdf_size` - 文件大小
- `pdf_generated_at` - 生成时间
- `status` - 状态（active/cancelled/expired）
- `notes` - 备注
- `metadata` - 元数据（JSON，包含图片URL等信息）
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 🔧 如何检查数据库表结构

### 方法 1：使用检查脚本

运行检查脚本：

```bash
npm run check:tables
```

### 方法 2：在 Supabase Dashboard 中检查

1. 登录 Supabase Dashboard
2. 进入 **SQL Editor**
3. 执行以下查询：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'serial_numbers'
ORDER BY ordinal_position;
```

### 方法 3：执行升级脚本

如果表结构不完整，执行升级脚本：

1. 登录 Supabase Dashboard
2. 进入 **SQL Editor**
3. 复制并执行 `sql/supabase-schema-upgrade.sql` 文件内容

## 📝 保存的数据内容

### 图片生成时保存的数据：
- 所有表单信息（姓名、电话、会员类型、金额等）
- 图片的云端 URL（如果上传成功）
- 生成时间戳
- 元数据中包含文件类型为 'image'

### PDF 生成时保存的数据：
- 所有表单信息（姓名、电话、会员类型、金额等）
- PDF 的云端 URL（如果上传成功）
- PDF 文件大小和路径
- 生成时间戳
- 元数据中包含文件类型为 'pdf'

## 🧪 测试功能

### 测试图片保存

1. 填写表单信息
2. 点击"生成图片 (PNG)"
3. 打开浏览器控制台（F12）
4. 查看日志：
   - `🚀 正在上传图片到云端...`
   - `✅ 图片已上传到云端` 或 `⚠️ 图片上传失败`
   - `✅ 确认函记录已保存到数据库`

### 测试 PDF 保存

1. 填写表单信息
2. 点击"生成文档 (PDF)"
3. 打开浏览器控制台（F12）
4. 查看日志：
   - `🚀 正在上传到 Supabase...`
   - `✅ PDF 已上传到云端` 或 `⚠️ 云端上传失败`
   - `✅ 确认函记录已保存到数据库`

### 使用测试脚本

```bash
# 测试数据库功能
npm run test:database

# 测试确认函记录功能
npm run test:receipts
```

## ⚠️ 常见问题

### 问题 1：保存失败，提示字段不存在

**原因**：数据库表结构不完整

**解决**：执行 `sql/supabase-schema-upgrade.sql` 升级脚本

### 问题 2：上传成功但保存失败

**原因**：可能是 RLS（行级安全）策略限制

**解决**：检查 Supabase Dashboard 中的 RLS 策略设置

### 问题 3：没有看到保存日志

**原因**：浏览器控制台被关闭或过滤了日志

**解决**：打开浏览器控制台（F12），确保没有过滤日志

## 📚 相关文档

- [数据库设置指南](./SETUP_DATABASE.md)
- [确认函记录指南](./RECEIPT_RECORDS_GUIDE.md)
- [Supabase 配置](./SUPABASE_CONFIG.md)

