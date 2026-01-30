# 存储桶设置完整指南

## 📋 步骤 1: 创建存储桶

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **Storage** 页面
4. 点击 **New bucket** 按钮
5. 填写信息：
   - **Name**: `receipts`（必须完全匹配，区分大小写）
   - **Public bucket**: 可以选择 **Yes** 或 **No**（策略会处理权限）
6. 点击 **Create bucket**

## 📋 步骤 2: 添加存储策略（重要！）

即使创建了存储桶，也需要添加策略才能上传文件。

### 方法 1: 使用 SQL Editor（推荐）

1. 在 Supabase Dashboard 中进入 **SQL Editor**
2. 点击 **New query**
3. 复制 `sql/storage-policies.sql` 文件的内容
4. 粘贴到 SQL Editor
5. 点击 **Run** 执行

### 方法 2: 手动添加策略

1. 进入 **Storage** → **receipts** 存储桶
2. 点击 **Policies** 标签
3. 点击 **New Policy**
4. 添加以下策略：

**策略 1: 公开读取**
- Policy name: `Public Access`
- Allowed operation: `SELECT`
- Policy definition:
```sql
bucket_id = 'receipts'
```

**策略 2: 公开上传**
- Policy name: `Public Upload`
- Allowed operation: `INSERT`
- Policy definition:
```sql
bucket_id = 'receipts'
```

## 🔍 验证设置

运行测试脚本验证配置：

```bash
npm run test:storage-direct
```

如果仍然报错，请检查：

### 1. 存储桶是否存在

在 Supabase Dashboard 中：
- 进入 **Storage**
- 查看是否有名为 `receipts` 的存储桶
- 确认名称完全匹配（区分大小写）

### 2. 环境变量配置

检查 `.env` 文件：

```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
```

确认：
- URL 和 Key 来自同一个项目
- 项目是创建存储桶的项目

### 3. 网络连接

如果遇到 "fetch failed" 错误：
- 检查网络连接
- 确认 Supabase 服务正常
- 尝试在浏览器中访问 Supabase Dashboard

## 🐛 常见问题

### 问题 1: "fetch failed" 错误

**可能原因**：
1. 存储桶不存在
2. 网络连接问题
3. Supabase URL 配置错误

**解决方案**：
1. 确认存储桶已创建
2. 检查 `.env` 文件中的 URL
3. 确认网络连接正常

### 问题 2: "new row violates row-level security"

**原因**：没有配置存储策略

**解决方案**：执行 `sql/storage-policies.sql` 文件

### 问题 3: 存储桶名称不匹配

**原因**：代码中使用 `receipts`，但实际存储桶名称不同

**解决方案**：
1. 在 Supabase Dashboard 中重命名存储桶为 `receipts`
2. 或修改代码中的存储桶名称

## 📝 SQL 策略文件

完整的策略 SQL 文件位于：`sql/storage-policies.sql`

包含以下策略：
- ✅ 公开读取 (SELECT)
- ✅ 公开上传 (INSERT)
- ✅ 公开更新 (UPDATE)
- ✅ 公开删除 (DELETE)

## ✅ 设置完成检查清单

- [ ] 存储桶 `receipts` 已创建
- [ ] 存储策略已添加（通过 SQL Editor 或 Policies 页面）
- [ ] 环境变量已配置（`.env` 文件）
- [ ] 测试脚本运行成功（`npm run test:storage-direct`）
- [ ] 可以在浏览器中生成并上传文件

