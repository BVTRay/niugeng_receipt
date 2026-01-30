# 存储桶文件上传问题诊断指南

## 🔍 问题：存储桶是空的，文件不知道存在哪里

如果发现存储桶是空的，但代码显示上传成功，可能是以下原因：

### 1. 存储桶权限问题（最常见）

**症状**：上传时没有明显错误，但文件没有出现在存储桶中

**原因**：Supabase 的 RLS (Row Level Security) 策略阻止了上传

**解决方案**：

1. 登录 Supabase Dashboard
2. 进入 **Storage** → **receipts** 存储桶
3. 点击 **Policies** 标签
4. 检查是否有上传策略，如果没有，添加以下策略：

```sql
-- 允许公开上传（开发环境）
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );

-- 允许公开读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );
```

### 2. 存储桶不存在

**症状**：上传失败，错误信息包含 "not found"

**解决方案**：

1. 在 Supabase Dashboard 中创建存储桶
2. 存储桶名称必须是 `receipts`（或修改代码中的存储桶名称）
3. 选择是否公开（建议选择公开，方便开发）

### 3. 存储桶名称不匹配

**症状**：代码中使用的存储桶名称与实际创建的不一致

**检查方法**：

1. 查看代码中的存储桶名称：
   - `src/lib/supabase-storage.ts` 第 9 行：`const DEFAULT_BUCKET = 'receipts';`
   - `src/lib/supabase-pdf-uploader.ts` 第 18 行：`bucketName: string = 'receipts'`

2. 在 Supabase Dashboard 中确认存储桶名称是否一致

### 4. 环境变量未配置

**症状**：上传功能完全不工作

**检查方法**：

运行诊断脚本：
```bash
npm run test:storage
```

如果提示环境变量未配置，检查 `.env` 文件：
```env
VITE_SUPABASE_URL=你的supabase-url
VITE_SUPABASE_ANON_KEY=你的anon-key
```

## 🧪 诊断步骤

### 步骤 1：运行存储测试脚本

```bash
npm run test:storage
```

这个脚本会：
- ✅ 检查存储桶是否存在
- ✅ 列出存储桶中的文件
- ✅ 测试上传权限
- ✅ 提供详细的错误信息和解决方案

### 步骤 2：检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签
3. 尝试上传文件或生成 PDF/图片
4. 查看控制台输出：

**正常情况应该看到：**
```
📤 准备上传文件到存储桶: receipts
   文件名: xxx.png
   文件大小: 123.45 KB
   存储路径: images/1234567890_xxx.png
✅ 文件上传成功!
   文件路径: images/1234567890_xxx.png
   公开URL: https://xxx.supabase.co/storage/v1/object/public/receipts/...
```

**如果有错误，会显示：**
```
❌ 文件上传失败: ...
   错误详情: { message: ..., statusCode: ..., ... }
```

### 步骤 3：检查 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入 **Storage** → **receipts**
3. 查看文件列表
4. 检查 **Policies** 标签中的策略设置

## 🔧 快速修复

### 如果存储桶权限有问题

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 创建新的公开上传策略
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );

-- 创建新的公开读取策略
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );
```

### 如果存储桶不存在

1. 在 Supabase Dashboard 中进入 **Storage**
2. 点击 **New bucket**
3. 填写：
   - **Name**: `receipts`
   - **Public bucket**: 选择 **Yes**（开发环境）
4. 点击 **Create bucket**

## 📊 文件存储结构

正常情况下，文件应该按以下结构存储：

```
receipts/ (存储桶)
├── pdfs/              # PDF文件
│   └── {timestamp}_{文件名}.pdf
├── images/            # 生成的图片文件
│   └── {timestamp}_{文件名}.png
├── logos/             # Logo文件
│   └── {timestamp}_{文件名}
└── seals/             # 印章Logo文件
    └── {timestamp}_{文件名}
```

## 🐛 常见错误信息

### 错误 1: "new row violates row-level security"

**含义**：RLS 策略阻止了操作

**解决**：添加存储策略（见上面的快速修复）

### 错误 2: "Bucket not found"

**含义**：存储桶不存在或名称错误

**解决**：创建存储桶或检查名称

### 错误 3: "Invalid API key"

**含义**：环境变量配置错误

**解决**：检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY`

## 📝 验证上传成功

上传成功后，你应该能在以下地方看到文件：

1. **Supabase Dashboard**：
   - Storage → receipts → 查看文件列表

2. **浏览器控制台**：
   - 显示上传成功的日志和文件 URL

3. **数据库记录**：
   - `serial_numbers` 表中的 `pdf_url` 或 `metadata.image_url` 字段

## 🆘 仍然无法解决？

1. 运行完整诊断：
   ```bash
   npm run test:storage
   ```

2. 检查 Supabase Dashboard 中的：
   - Storage 设置
   - API 设置
   - 项目设置

3. 查看详细文档：
   - `docs/SUPABASE_CONFIG.md`
   - `docs/QUICK_START.md`

4. 检查 Supabase 官方文档：
   - [Storage 文档](https://supabase.com/docs/guides/storage)
   - [RLS 策略](https://supabase.com/docs/guides/auth/row-level-security)

