# 🔧 问题修复说明

## 遇到的问题

### 问题 1: `setup-env.js` ES 模块错误
```
ReferenceError: require is not defined in ES module scope
```

**原因：** 项目的 `package.json` 设置了 `"type": "module"`，所有 `.js` 文件会被当作 ES 模块处理，不能使用 CommonJS 的 `require` 语法。

**解决方案：**
- ✅ 将 `setup-env.js` 重命名为 `setup-env.cjs`（明确标记为 CommonJS 模块）
- ✅ 更新 `package.json` 中的脚本路径

### 问题 2: `test-supabase.ts` 环境变量错误
```
TypeError: Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')
```

**原因：** 
- `import.meta.env` 是 Vite 的特性，只在浏览器环境中可用
- 在 Node.js 环境中运行测试脚本时，`import.meta.env` 是 undefined

**解决方案：**
- ✅ 安装 `dotenv` 包用于在 Node.js 中加载 `.env` 文件
- ✅ 修改 `supabase-client.ts`，使其同时支持浏览器和 Node.js 环境
- ✅ 在 `test-supabase.ts` 中添加 `dotenv` 配置

---

## 已应用的修复

### 1. 文件重命名
```bash
setup-env.js → setup-env.cjs
```

### 2. 安装依赖
```bash
npm install -D dotenv
```

### 3. 更新 `supabase-client.ts`

添加了环境检测函数，自动判断运行环境：

```typescript
function getEnvVar(key: string): string | undefined {
  // 在浏览器环境（Vite）中使用 import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // 在 Node.js 环境中使用 process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}
```

### 4. 更新 `test-supabase.ts`

在文件开头添加：

```typescript
import { config } from 'dotenv';
config();
```

---

## 现在可以正常使用的命令

### ✅ 配置环境变量
```bash
npm run setup:env
```

按照提示输入你的 Supabase URL 和 Key。

### ✅ 测试连接（配置后）
```bash
npm run test:supabase
```

**注意：** 需要先创建 `.env` 文件并配置好环境变量才能运行测试。

---

## 完整使用流程

### 步骤 1: 配置环境变量

**方法 A：使用配置向导（推荐）**

```bash
npm run setup:env
```

按照提示输入：
1. Supabase URL（例如：`https://abcdefgh.supabase.co`）
2. Supabase Anon Key
3. Gemini API Key（可选）

**方法 B：手动创建 `.env` 文件**

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://你的项目id.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon密钥
```

### 步骤 2: 测试配置

```bash
npm run test:supabase
```

如果看到 ✅ 表示配置成功！

### 步骤 3: 重启开发服务器

```bash
# 如果开发服务器正在运行，先停止（Ctrl+C）
npm run dev
```

---

## 技术细节

### 为什么使用 `.cjs` 扩展名？

在 `package.json` 设置了 `"type": "module"` 的项目中：
- `.js` 文件被视为 ES 模块（ESM）
- `.cjs` 文件被视为 CommonJS 模块
- `.mjs` 文件明确标记为 ES 模块

由于 `setup-env.js` 使用了 `require()` 和 `module.exports`（CommonJS 语法），必须使用 `.cjs` 扩展名。

### 为什么需要环境检测？

因为同一个代码需要在两个环境中运行：

1. **浏览器环境（Vite）**：
   - 使用 `import.meta.env.VITE_*` 读取环境变量
   - Vite 会在构建时注入这些变量

2. **Node.js 环境（测试脚本）**：
   - 使用 `process.env.VITE_*` 读取环境变量
   - 通过 `dotenv` 从 `.env` 文件加载

### 环境变量加载流程

```
开发环境（浏览器）:
  .env → Vite → import.meta.env → 代码

Node.js 脚本:
  .env → dotenv → process.env → 代码
```

---

## 验证修复

运行以下命令验证所有功能正常：

```bash
# 1. 测试配置脚本（应该可以运行，等待输入）
npm run setup:env

# 按 Ctrl+C 退出，然后手动创建 .env 文件

# 2. 创建测试用的 .env 文件
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://test.supabase.co
VITE_SUPABASE_ANON_KEY=test-key-for-validation
EOF

# 3. 运行测试（会连接失败，但不应该报错）
npm run test:supabase

# 4. 清理测试文件
rm .env
```

---

## 下一步

现在修复已完成，你可以：

1. ✅ 运行 `npm run setup:env` 配置真实的 Supabase 信息
2. ✅ 运行 `npm run test:supabase` 验证连接
3. ✅ 开始在项目中使用 Supabase 功能

查看 `QUICK_START.md` 了解更多使用说明。

---

**修复完成时间：** 2026-01-29


