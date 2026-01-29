# 🌩️ 云端同步功能使用指南

## ✨ 新功能概览

已为你的会员权益确认函生成器添加了完整的云端同步功能：

### 🎯 核心功能

1. **配置云端同步**
   - 品牌信息（名称、副标题、标语等）
   - Logo 和印章图片
   - 会员权益选项
   - 经办管家列表
   - ✅ 支持跨设备自动同步

2. **Logo 图片云端存储**
   - Logo 自动上传到 Supabase 存储桶
   - 印章图片自动上传到云端
   - ✅ 任何设备都能访问

3. **流水编号自动生成（不重复）**
   - 自动递增（0001, 0002, 0003...）
   - 每年重新开始
   - ✅ 全局唯一，绝不重复

---

## 🚀 快速开始（5 分钟配置）

### 步骤 1：创建数据库表 ⏱️ 2 分钟

1. 打开 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 点击 **SQL Editor**
4. 点击 **New query**
5. 打开 `supabase-schema.sql` 文件
6. 复制全部内容粘贴到 SQL Editor
7. 点击 **Run** 按钮

✅ 看到 "Success" 表示创建成功！

### 步骤 2：测试连接 ⏱️ 1 分钟

在项目目录运行：

```bash
npm run test:database
```

应该看到：
- ✅ 配置同步测试通过
- ✅ 流水编号生成测试通过
- ✅ 查询记录测试通过

### 步骤 3：刷新页面开始使用 ⏱️ 1 分钟

1. 打开浏览器
2. 刷新页面（F5）
3. 打开开发者工具（F12）
4. 查看控制台，应该看到：
   ```
   ✅ Supabase 功能已加载（PDF上传、配置同步、流水编号）
   ```

🎉 **完成！现在可以跨设备使用了！**

---

## 📱 使用场景演示

### 场景 1：在办公室设置 Logo

**办公室电脑操作：**

1. 打开应用，点击设置按钮（⚙️）
2. 上传公司 Logo
3. 点击"保存设置"
4. 控制台显示：
   ```
   📤 正在上传 Logo 到云端...
   ✅ Logo 已上传到云端: https://xxx.supabase.co/...
   💾 正在保存配置到云端...
   ✅ 配置已同步到云端
   ```

**回家后在笔记本电脑：**

1. 打开同一个应用
2. Logo 自动显示（无需重新上传）
3. 所有设置都是最新的

### 场景 2：流水编号连续不断

**上午生成 3 个确认函：**
- 2026-N-0001
- 2026-N-0002
- 2026-N-0003

**下午换到另一台电脑继续：**
- 2026-N-0004（自动继续）
- 2026-N-0005
- 不会出现重复！

### 场景 3：多人协作

**销售 A 在北京：**
- 生成编号：2026-N-0010

**销售 B 在上海：**
- 生成编号：2026-N-0011（自动避开已用编号）

**销售 C 在广州：**
- 生成编号：2026-N-0012

✅ **所有编号全局唯一，不会冲突！**

---

## 🔄 同步机制说明

### 配置同步时机

| 操作 | 本地 | 云端 | 说明 |
|------|------|------|------|
| 打开页面 | ✅ 加载 | ✅ 读取 | 优先从云端加载最新配置 |
| 修改设置 | ✅ 立即 | - | 实时预览，未保存 |
| 保存设置 | ✅ 立即 | ✅ 同步 | 双重保险，确保不丢失 |
| 上传 Logo | ✅ 预览 | ✅ 存储 | 本地预览，云端永久存储 |

### 流水编号生成逻辑

```
点击生成/刷新按钮
    ↓
查询数据库最大编号
    ↓
计算：最大编号 + 1
    ↓
生成新编号
    ↓
保存到数据库
    ↓
返回新编号
```

**防重复机制：**
1. 数据库约束：`serial_number` 字段设置为 `UNIQUE`
2. 事务处理：确保原子性操作
3. 备用方案：如果云端失败，使用本地时间戳

---

## 🛠️ 高级功能

### 1. 查看历史流水编号

在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 查看最近 20 条记录
SELECT 
    serial_number, 
    customer_name, 
    amount,
    created_at
FROM serial_numbers
ORDER BY created_at DESC
LIMIT 20;
```

### 2. 导出配置数据

```sql
-- 导出当前配置
SELECT * FROM app_configs 
WHERE id = 'default-config';
```

### 3. 查看今年统计

```sql
-- 统计今年生成的确认函数量
SELECT 
    COUNT(*) as 总数,
    SUM(amount) as 总金额,
    DATE(created_at) as 日期
FROM serial_numbers
WHERE serial_number LIKE '2026-N-%'
GROUP BY DATE(created_at)
ORDER BY 日期 DESC;
```

### 4. 清空测试数据

```sql
-- ⚠️ 谨慎使用！删除测试生成的流水编号
DELETE FROM serial_numbers 
WHERE customer_name LIKE '测试%';
```

---

## 🔍 常见问题解答

### Q1: 如果离线使用会怎样？

**答：** 
- 配置会使用本地缓存（localStorage）
- 流水编号使用时间戳生成（可能重复）
- 恢复网络后会自动同步

### Q2: 如何在多个账号间使用？

**答：** 
目前所有配置共用一个 `default-config`。如需多账号：
1. 修改 `supabase-database.ts` 中的配置 ID
2. 使用 `user_id` 字段区分用户
3. 添加登录功能

### Q3: Logo 图片有大小限制吗？

**答：** 
- Supabase 免费版单文件限制 50MB
- 建议 Logo 控制在 2MB 以内
- 支持 JPG, PNG, SVG 等格式

### Q4: 流水编号到 9999 后会怎样？

**答：** 
- 可以继续到 10000, 10001...（没有上限）
- 或者每年重新开始（默认配置）
- 可以修改 `generateNewSerial` 函数调整规则

### Q5: 如何备份数据？

**答：** 
Supabase 提供多种备份方式：
1. **自动备份**：Pro 版本每天自动备份
2. **手动导出**：在 Database 页面导出 SQL
3. **API 导出**：使用脚本定期备份

---

## 🎓 技术架构

```
┌─────────────┐
│  浏览器前端  │
│  (Vue 3)    │
└──────┬──────┘
       │
       ├─ 配置管理
       │  ├─ 读取：优先云端，备用本地
       │  └─ 保存：双写（本地+云端）
       │
       ├─ Logo 上传
       │  ├─ 预览：Base64 本地显示
       │  └─ 存储：Supabase Storage
       │
       └─ 流水编号
          ├─ 生成：云端 API
          └─ 验证：数据库唯一约束
       
┌──────────────────┐
│  Supabase 后端    │
├──────────────────┤
│ 📊 Database      │
│  ├─ app_configs   │ ← 配置表
│  └─ serial_numbers│ ← 流水号表
│                  │
│ 📦 Storage       │
│  └─ receipts/    │
│      ├─ logos/   │ ← Logo 图片
│      ├─ seals/   │ ← 印章图片
│      └─ pdfs/    │ ← 生成的 PDF
└──────────────────┘
```

---

## 📊 性能优化建议

### 1. Logo 图片优化

上传前压缩图片：
- 使用 TinyPNG 或类似工具
- 推荐尺寸：Logo 500×200px，印章 200×200px
- 格式：PNG（透明背景）或 JPG（纯色背景）

### 2. 配置缓存

- 本地使用 localStorage 缓存
- 减少云端读取频率
- 只在保存时写入云端

### 3. 流水编号批量生成

如果需要批量生成，可以修改函数：

```typescript
async function batchGenerateSerials(count: number) {
  const serials = [];
  for (let i = 0; i < count; i++) {
    const serial = await generateNewSerial();
    serials.push(serial);
  }
  return serials;
}
```

---

## ✅ 配置完成检查

完成以下检查确保功能正常：

- [ ] 已在 Supabase 执行 SQL 脚本
- [ ] `npm run test:database` 测试通过
- [ ] 浏览器控制台显示"功能已加载"
- [ ] 上传 Logo 后在其他设备能看到
- [ ] 流水编号连续递增不重复
- [ ] 修改配置后其他设备能同步

---

## 🆘 获取帮助

遇到问题时：

1. **查看控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签的错误信息

2. **运行测试脚本**
   ```bash
   npm run test:supabase    # 测试基础连接
   npm run test:database    # 测试数据库功能
   ```

3. **查看文档**
   - `SETUP_DATABASE.md` - 详细配置说明
   - `SUPABASE_CONFIG.md` - Supabase 基础配置
   - `FIXES_APPLIED.md` - 已知问题和修复

---

**🎉 享受云端同步带来的便利吧！**

