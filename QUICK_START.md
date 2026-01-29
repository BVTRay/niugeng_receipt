# 🚀 Supabase 快速开始指南

## ⚡ 快速配置（3 步完成）

### 步骤 1: 运行配置脚本

```bash
npm run setup:env
```

按照提示输入你的 Supabase URL 和 Anon Key，脚本会自动生成 `.env` 文件。

### 步骤 2: 验证配置

创建一个测试文件 `test-supabase.ts` 来验证连接：

```typescript
import { supabase } from './supabase-client';

async function testConnection() {
  try {
    // 测试存储桶连接
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ 连接失败:', error);
      return false;
    }
    
    console.log('✅ Supabase 连接成功！');
    console.log('📦 可用的存储桶:', data);
    return true;
  } catch (err) {
    console.error('❌ 连接错误:', err);
    return false;
  }
}

testConnection();
```

运行测试：

```bash
npx tsx test-supabase.ts
```

### 步骤 3: 集成到项目

在 `index.tsx` 中导入并使用：

```typescript
import { uploadBase64Image, getPublicUrl } from './supabase-storage';

// 在生成图片后上传
const result = await uploadBase64Image(
  base64Data, 
  `receipt_${Date.now()}.png`
);

console.log('上传成功:', result?.publicUrl);
```

---

## 📦 文件说明

### 核心文件

| 文件 | 说明 |
|------|------|
| `supabase-client.ts` | Supabase 客户端初始化 |
| `supabase-storage.ts` | 存储桶操作封装（上传、下载、删除等） |
| `setup-env.js` | 交互式环境配置脚本 |
| `.env` | 环境变量配置（需手动创建或运行脚本） |

### 文档文件

| 文件 | 说明 |
|------|------|
| `SUPABASE_CONFIG.md` | 详细配置文档 |
| `supabase-integration-example.js` | 集成示例代码 |
| `QUICK_START.md` | 本文件 - 快速开始指南 |

---

## 🔑 环境变量说明

创建 `.env` 文件（如果未使用配置脚本）：

```env
# Supabase 项目地址
VITE_SUPABASE_URL=https://你的项目id.supabase.co

# Supabase 匿名密钥（Anon Key）
VITE_SUPABASE_ANON_KEY=你的anon密钥

# Gemini API Key（可选）
GEMINI_API_KEY=你的gemini密钥
```

### 📍 如何获取这些值？

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下内容：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

---

## 🪣 存储桶设置

### 创建存储桶

1. 在 Supabase Dashboard 中进入 **Storage**
2. 点击 **New bucket**
3. 填写信息：
   - **Name**: `receipts`（或你喜欢的名称）
   - **Public bucket**: 根据需要选择（公开或私有）
4. 点击 **Create bucket**

### 设置访问策略

如果选择私有存储桶，需要添加策略：

```sql
-- 允许所有人读取（公开访问）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- 允许所有人上传（开发测试用）
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );

-- 允许所有人删除（谨慎使用）
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'receipts' );
```

**⚠️ 生产环境建议：** 限制上传和删除权限，只允许经过身份验证的用户操作。

---

## 🎯 常用 API

### 上传文件

```typescript
import { uploadFile } from './supabase-storage';

// 上传 File 对象
const result = await uploadFile(file);
if (result) {
  console.log('URL:', result.publicUrl);
}
```

### 上传 Base64 图片

```typescript
import { uploadBase64Image } from './supabase-storage';

// 适用于 canvas.toDataURL() 的结果
const result = await uploadBase64Image(
  base64String,
  'receipt.png',
  'receipts' // 存储桶名称（可选）
);
```

### 获取文件列表

```typescript
import { listFiles } from './supabase-storage';

const files = await listFiles('folder-name');
console.log(files);
```

### 删除文件

```typescript
import { deleteFiles } from './supabase-storage';

const success = await deleteFiles(['file1.png', 'file2.png']);
```

### 获取公开 URL

```typescript
import { getPublicUrl } from './supabase-storage';

const url = getPublicUrl('path/to/file.png');
```

---

## 🐛 常见问题

### 1. 上传失败：403 Forbidden

**原因：** 存储桶策略未正确设置

**解决：** 
- 检查存储桶是否设置为 Public
- 或添加适当的 RLS 策略

### 2. 环境变量未生效

**原因：** Vite 需要重启才能加载新的环境变量

**解决：**
```bash
# 停止开发服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 3. 导入错误：找不到模块

**原因：** TypeScript 配置或文件路径问题

**解决：** 确保 `tsconfig.json` 中包含：
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

### 4. CORS 错误

**原因：** Supabase 项目设置问题

**解决：** 
- 在 Supabase Dashboard > Settings > API 中检查 CORS 设置
- 确保允许你的域名访问

---

## 📚 下一步

✅ 配置完成后，你可以：

1. 查看 `SUPABASE_CONFIG.md` 了解详细配置
2. 查看 `supabase-integration-example.js` 学习更多用法
3. 在 `index.html` 中集成上传功能
4. 添加文件管理界面

---

## 🆘 需要帮助？

- [Supabase 官方文档](https://supabase.com/docs)
- [JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [Storage API 文档](https://supabase.com/docs/guides/storage)

---

**🎉 祝你使用愉快！**

