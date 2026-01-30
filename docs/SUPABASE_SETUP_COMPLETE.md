# ✅ Supabase 配置完成

## 🎉 已完成的工作

### 1. 依赖安装
- ✅ `@supabase/supabase-js` - Supabase JavaScript 客户端
- ✅ `tsx` - TypeScript 执行器（开发依赖）

### 2. 核心文件创建

| 文件 | 功能 |
|------|------|
| `supabase-client.ts` | Supabase 客户端初始化 |
| `supabase-storage.ts` | 存储桶操作封装（上传、下载、删除等） |
| `test-supabase.ts` | 连接测试脚本 |
| `setup-env.js` | 交互式环境配置脚本 |

### 3. 文档文件

| 文件 | 说明 |
|------|------|
| `QUICK_START.md` | 快速开始指南（推荐先看这个） |
| `SUPABASE_CONFIG.md` | 详细配置文档 |
| `supabase-integration-example.js` | 实际集成示例代码 |

### 4. 配置更新
- ✅ 更新 `.gitignore`，防止环境变量文件被提交
- ✅ 更新 `package.json`，添加便捷脚本命令

---

## 🚀 下一步操作

### 第一步：配置环境变量

**方法 1：使用配置脚本（推荐）**

```bash
npm run setup:env
```

按照提示输入你的 Supabase URL 和 Key。

**方法 2：手动创建**

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://你的项目id.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

### 第二步：测试连接

```bash
npm run test:supabase
```

这个命令会：
- ✅ 验证环境变量是否配置正确
- ✅ 测试 Supabase 连接
- ✅ 列出可用的存储桶
- ✅ 测试文件上传权限

### 第三步：重启开发服务器

```bash
# 如果开发服务器正在运行，按 Ctrl+C 停止
# 然后重新启动
npm run dev
```

**⚠️ 重要：** Vite 需要重启才能加载新的环境变量。

---

## 📦 可用的 npm 脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 配置 Supabase 环境变量
npm run setup:env

# 测试 Supabase 连接
npm run test:supabase
```

---

## 🔍 存储桶设置检查清单

在 Supabase Dashboard 中完成以下操作：

### 1. 创建存储桶
- [ ] 进入 **Storage** 页面
- [ ] 点击 **New bucket**
- [ ] 设置名称为 `receipts`（或你喜欢的名称）
- [ ] 选择是否公开
- [ ] 点击 **Create bucket**

### 2. 配置访问策略（如果是私有桶）

进入存储桶的 **Policies** 标签，添加以下策略：

**允许公开读取：**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );
```

**允许公开上传（开发环境）：**
```sql
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );
```

**允许公开删除（谨慎使用）：**
```sql
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'receipts' );
```

### 3. 修改代码中的存储桶名称（如果需要）

如果你的存储桶名称不是 `receipts`，请在以下文件中修改：

**在 `supabase-storage.ts` 中：**
```typescript
const DEFAULT_BUCKET = 'your-bucket-name'; // 第 10 行
```

**在 `test-supabase.ts` 中：**
```typescript
const bucketName = 'your-bucket-name'; // 第 36 行和第 64 行
```

---

## 💡 使用示例

### 在现有代码中集成

打开 `index.html` 或 `index.tsx`，导入 Supabase 功能：

```javascript
// 在文件顶部导入
import { uploadBase64Image, getPublicUrl } from './supabase-storage';

// 修改 downloadImage 方法（示例）
const downloadImage = async () => {
    if(!form.name) return alert('请输入客户姓名');
    
    try {
        isGenerating.value = true;
        const canvas = await getCanvas();
        const base64Data = canvas.toDataURL('image/png');
        const fileName = `会员函_${form.name}_${form.serial}_${form.date}.png`;
        
        // 上传到 Supabase
        const result = await uploadBase64Image(base64Data, fileName);
        
        if (result) {
            alert(`✅ 文件已上传到云端！\n\n${result.publicUrl}`);
            
            // 可选：复制链接到剪贴板
            navigator.clipboard.writeText(result.publicUrl);
        }
        
        // 同时下载到本地
        const link = document.createElement('a');
        link.download = fileName;
        link.href = base64Data;
        link.click();
        
    } catch(e) { 
        console.error(e);
        alert('生成失败');
    } finally { 
        isGenerating.value = false; 
    }
};
```

更多示例请查看 `supabase-integration-example.js`。

---

## 🐛 故障排除

### 问题 1: 测试脚本运行时提示环境变量未配置

**解决方案：**
```bash
# 1. 确保已创建 .env 文件
# 2. 使用配置脚本
npm run setup:env

# 3. 或手动创建 .env 文件并填入配置
```

### 问题 2: 上传失败，提示权限错误

**解决方案：**
- 检查存储桶是否设置为公开
- 或在 Supabase Dashboard 中添加适当的 RLS 策略

### 问题 3: 开发服务器中环境变量未生效

**解决方案：**
```bash
# 停止开发服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 问题 4: 导入模块错误

**解决方案：**
确保使用正确的导入路径：
```typescript
// ✅ 正确
import { supabase } from './supabase-client';
import { uploadFile } from './supabase-storage';

// ❌ 错误（缺少 .ts 扩展名在某些配置下可能出错）
import { supabase } from './supabase-client.ts';
```

---

## 📚 推荐阅读顺序

1. 📖 **QUICK_START.md** - 快速开始（3 步配置）
2. 📖 **SUPABASE_CONFIG.md** - 详细配置说明
3. 💻 **supabase-integration-example.js** - 实际代码示例
4. 🧪 **test-supabase.ts** - 测试脚本源码

---

## 🎯 功能清单

Supabase 存储服务提供以下功能：

- ✅ 上传文件（File 对象）
- ✅ 上传 Base64 图片（适用于 Canvas）
- ✅ 下载文件
- ✅ 删除文件
- ✅ 获取公开 URL
- ✅ 列出文件
- ✅ 自定义存储桶
- ✅ 自定义文件路径（文件夹结构）

---

## 🆘 需要帮助？

- 📖 查看 `QUICK_START.md` 快速开始
- 📖 查看 `SUPABASE_CONFIG.md` 详细配置
- 💻 查看 `supabase-integration-example.js` 代码示例
- 🌐 访问 [Supabase 官方文档](https://supabase.com/docs)

---

## ✅ 配置完成后的检查清单

- [ ] 已安装依赖（`@supabase/supabase-js` 和 `tsx`）
- [ ] 已创建 `.env` 文件并配置 URL 和 Key
- [ ] 已在 Supabase 创建存储桶
- [ ] 已设置存储桶访问策略
- [ ] 运行 `npm run test:supabase` 测试通过
- [ ] 已重启开发服务器

**全部完成后，你就可以开始在项目中使用 Supabase 了！🎉**

---

**最后更新时间：** 2026-01-29


