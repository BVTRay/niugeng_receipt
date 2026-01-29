# Supabase 配置说明

## 📋 前置条件

1. 已在 Supabase 获取了项目的 URL 和 Anon Key
2. 已创建了存储桶（Storage Bucket）

## 🔧 配置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件，添加以下内容：

```env
# Supabase 配置
VITE_SUPABASE_URL=你的-supabase-url
VITE_SUPABASE_ANON_KEY=你的-supabase-anon-key

# Gemini API（如果需要）
GEMINI_API_KEY=你的-gemini-api-key
```

**⚠️ 注意：** `.env` 文件不会被提交到 Git 仓库中（已在 .gitignore 中配置）

### 2. 配置存储桶

在 `supabase-storage.ts` 文件中，可以修改默认存储桶名称：

```typescript
const DEFAULT_BUCKET = 'receipts'; // 改为你创建的存储桶名称
```

### 3. 设置存储桶权限（Supabase 控制台）

确保你的存储桶有正确的访问权限：

1. 登录 Supabase 控制台
2. 进入 Storage > 你的存储桶
3. 点击 "Policies" 标签
4. 添加策略（根据需求）：
   - **公开读取**：允许所有人查看文件
   - **授权上传**：只允许登录用户上传
   - **自定义规则**：根据业务需求设置

示例策略（公开读取）：
```sql
-- 允许所有人读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- 允许所有人上传（开发环境，生产环境请限制）
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );
```

## 📦 使用方法

### 导入 Supabase 客户端

```typescript
import { supabase } from './supabase-client';
```

### 使用存储服务

```typescript
import {
  uploadFile,
  uploadBase64Image,
  downloadFile,
  deleteFiles,
  getPublicUrl,
  listFiles
} from './supabase-storage';

// 上传文件
const result = await uploadFile(file);
if (result) {
  console.log('文件 URL:', result.publicUrl);
}

// 上传 Base64 图片（适用于生成的权益函）
const imgResult = await uploadBase64Image(
  base64Data, 
  '会员函_张三_2026-01-29.png'
);

// 获取公开 URL
const url = getPublicUrl('path/to/file.png');

// 列出文件
const files = await listFiles('folder-name');

// 删除文件
const success = await deleteFiles(['file1.png', 'file2.png']);
```

## 🎯 在项目中集成

### 修改生成图片功能，自动上传到 Supabase

你可以在 `index.html` 中的 `downloadImage` 或 `downloadPDF` 方法后添加上传逻辑：

```javascript
// 在生成 canvas 后
const canvas = await getCanvas();
const base64Data = canvas.toDataURL('image/png');

// 上传到 Supabase
const fileName = `会员函_${form.name}_${form.serial}_${form.date}.png`;
const uploadResult = await uploadBase64Image(base64Data, fileName);

if (uploadResult) {
  console.log('已上传到云端:', uploadResult.publicUrl);
  // 可以保存 URL 到数据库或显示给用户
}
```

## 🔒 安全建议

1. **不要**将 `.env` 文件提交到版本控制系统
2. 生产环境使用 RLS（Row Level Security）策略限制访问
3. 定期轮换 API 密钥
4. 使用 Supabase 的存储限制功能防止滥用

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Storage API 文档](https://supabase.com/docs/guides/storage)
- [JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)

