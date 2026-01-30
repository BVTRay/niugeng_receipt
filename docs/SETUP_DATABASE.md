# 📊 数据库配置指南

## 🎯 功能说明

已实现以下云端同步功能：

1. **配置云端同步** - 设置的 Logo、品牌信息等在不同设备间自动同步
2. **流水编号自动生成** - 确保每个流水编号唯一，不会重复
3. **图片云端存储** - Logo 和印章图片自动上传到 Supabase 存储桶

---

## 🚀 快速开始（3 步完成）

### 步骤 1：在 Supabase 创建数据库表

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **New query**
5. 复制 `supabase-schema.sql` 文件的全部内容
6. 粘贴到 SQL Editor 中
7. 点击 **Run** 按钮执行

### 步骤 2：验证表创建成功

在 SQL Editor 中运行以下查询：

```sql
-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('app_configs', 'serial_numbers');
```

应该看到两条记录：
- `app_configs`
- `serial_numbers`

### 步骤 3：测试功能

1. 刷新浏览器页面
2. 打开开发者工具控制台
3. 应该看到：`✅ Supabase 功能已加载（PDF上传、配置同步、流水编号）`

---

## 📋 数据库表说明

### 1. app_configs（应用配置表）

存储应用的所有配置信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 配置 ID（固定为 'default-config'）|
| app_title | TEXT | 应用标题 |
| brand_name | TEXT | 品牌名称 |
| brand_sub | TEXT | 品牌副标题 |
| logo_url | TEXT | Logo 图片 URL（云端地址）|
| seal_url | TEXT | 印章 Logo URL（云端地址）|
| seal_text | TEXT | 印章底部文字 |
| title | TEXT | 确认函主标题 |
| sub_title | TEXT | 确认函副标题 |
| intro_text | TEXT | 欢迎语 |
| confirm_text | TEXT | 确认语 |
| footer_slogan | TEXT | 底部标语 |
| membership_options | JSONB | 会员权益选项（JSON 格式）|
| handlers | JSONB | 经办管家列表（JSON 格式）|
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 2. serial_numbers（流水编号表）

记录所有生成的流水编号：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 自增 ID |
| serial_number | TEXT | 流水编号（格式：YYYY-N-XXXX）|
| customer_name | TEXT | 客户姓名 |
| amount | DECIMAL | 金额 |
| created_at | TIMESTAMP | 生成时间 |

---

## 🔄 功能工作流程

### 配置同步流程

1. **首次加载页面**
   - 尝试从云端加载配置
   - 如果失败，从本地 localStorage 加载
   - 如果都没有，使用默认配置

2. **修改并保存设置**
   - 点击"保存设置"按钮
   - 配置立即保存到本地（确保即时生效）
   - 同时上传到云端数据库
   - 控制台显示同步结果

3. **跨设备同步**
   - 在设备 A 修改配置并保存
   - 在设备 B 刷新页面
   - 自动从云端加载最新配置

### Logo 上传流程

1. **选择图片文件**
   - 点击文件选择按钮
   - 立即显示本地预览（快速反馈）

2. **自动上传到云端**
   - 后台上传到 Supabase 存储桶
   - 上传成功后更新为云端 URL
   - Logo 路径：`receipts/logos/` 或 `receipts/seals/`

3. **跨设备访问**
   - 云端 URL 可在任何设备访问
   - 不依赖本地文件

### 流水编号生成流程

1. **页面加载时**
   - 自动生成初始流水编号
   - 调用云端 API 获取下一个编号

2. **点击刷新按钮（↺）**
   - 生成新的流水编号
   - 确保不与已有编号重复

3. **编号规则**
   - 格式：`年份-N-四位数字`
   - 例如：`2026-N-0001`, `2026-N-0002`
   - 每年从 0001 重新开始

4. **防重复机制**
   - 每个编号生成后立即保存到数据库
   - 下次生成时查询最大编号并 +1
   - 确保全局唯一

---

## 🧪 测试功能

### 测试配置同步

1. 在设备 A：
   - 修改品牌名称为"测试公司"
   - 点击"保存设置"
   - 查看控制台：应显示 `✅ 配置已同步到云端`

2. 在设备 B（或清除本地缓存后）：
   - 刷新页面
   - 查看控制台：应显示 `✅ 已从云端加载配置`
   - 品牌名称应为"测试公司"

### 测试 Logo 同步

1. 在设备 A：
   - 上传 Logo 图片
   - 查看控制台：应显示云端 URL

2. 在设备 B：
   - 刷新页面
   - Logo 应自动显示（从云端加载）

### 测试流水编号

1. 生成第一个编号：
   - 应为 `2026-N-0001`（或当前年份）

2. 点击刷新按钮：
   - 应为 `2026-N-0002`

3. 关闭并重新打开页面：
   - 继续从 `0003` 开始，不会重复

---

## 🔍 故障排查

### 问题 1：配置无法同步

**症状：** 修改配置后，其他设备看不到更新

**解决方案：**
1. 检查 Supabase 连接：运行 `npm run test:supabase`
2. 检查浏览器控制台是否有错误
3. 确认数据库表已创建
4. 检查 RLS 策略是否正确

### 问题 2：流水编号重复

**症状：** 生成的流水编号出现重复

**解决方案：**
1. 检查 `serial_numbers` 表是否有数据
2. 查询表中的记录：
   ```sql
   SELECT * FROM serial_numbers ORDER BY created_at DESC LIMIT 10;
   ```
3. 如果表为空，可能是数据库连接问题

### 问题 3：Logo 上传失败

**症状：** Logo 无法上传到云端

**解决方案：**
1. 确认存储桶 `receipts` 已创建
2. 检查存储桶访问策略
3. 查看浏览器控制台错误信息

---

## 📊 数据库管理

### 查看配置

```sql
-- 查看当前配置
SELECT * FROM app_configs WHERE id = 'default-config';
```

### 查看流水编号记录

```sql
-- 查看最近 20 条流水编号
SELECT * FROM serial_numbers 
ORDER BY created_at DESC 
LIMIT 20;
```

### 查看今年的流水编号数量

```sql
-- 统计今年生成的编号数量
SELECT COUNT(*) 
FROM serial_numbers 
WHERE serial_number LIKE '2026-N-%';
```

### 重置流水编号（谨慎使用）

```sql
-- ⚠️  删除所有流水编号记录（不可恢复）
DELETE FROM serial_numbers;
```

---

## 🔒 安全建议

1. **生产环境配置**
   - 启用 Row Level Security (RLS)
   - 限制匿名用户访问
   - 添加用户认证

2. **数据备份**
   - 定期导出配置数据
   - 使用 Supabase 的自动备份功能

3. **访问控制**
   - 生产环境不要使用 `POLICY "Allow all access"`
   - 根据实际需求设置细粒度权限

---

## ✅ 完成检查清单

- [ ] 在 Supabase 中执行了 `supabase-schema.sql`
- [ ] 确认两个表创建成功
- [ ] 浏览器控制台显示功能已加载
- [ ] 测试配置同步功能
- [ ] 测试 Logo 上传功能
- [ ] 测试流水编号生成功能
- [ ] 在不同设备或浏览器测试同步

---

**🎉 配置完成！现在你可以在任何设备使用并同步配置了！**


