# 用户配置隔离修复说明

## 问题描述

在不同浏览器登录后，设置的 logo 没有更新，没有关联到上传到数据库和存储桶的文件。这是因为所有用户共享同一个配置（`default-config`），导致配置互相覆盖。

## 修复内容

### 1. 配置保存逻辑更新

**文件：** `src/lib/supabase-database.ts`

- ✅ 配置保存时关联当前登录用户的 ID
- ✅ 使用 `user-{用户ID}` 作为配置 ID
- ✅ 保存 `user_id` 字段到数据库

### 2. 配置加载逻辑更新

**文件：** `src/lib/supabase-database.ts`

- ✅ 配置加载时根据当前登录用户查询
- ✅ 使用 `user_id` 字段查询用户专属配置
- ✅ 如果用户配置不存在，回退到 `default-config`（兼容旧数据）

### 3. 登录后自动加载配置

**文件：** `index.html`

- ✅ 登录成功后自动重新加载该用户的配置
- ✅ 创建了 `loadUserConfig` 函数用于加载用户配置
- ✅ 页面加载时，如果已登录，自动加载用户配置

### 4. 数据库索引优化

**文件：** `sql/supabase-schema.sql`、`sql/migrate-user-configs.sql`

- ✅ 为 `user_id` 字段添加索引，提高查询性能

## 使用方法

### 1. 执行数据库迁移（可选）

如果需要为现有用户创建配置，可以执行：

```sql
-- 在 Supabase SQL Editor 中执行
-- sql/migrate-user-configs.sql
```

### 2. 添加索引（推荐）

```sql
-- 在 Supabase SQL Editor 中执行
CREATE INDEX IF NOT EXISTS idx_app_configs_user_id ON app_configs(user_id);
```

### 3. 测试

1. 使用不同账号登录（admin 和 user）
2. 分别上传不同的 logo
3. 切换浏览器或重新登录
4. 确认每个用户看到的是自己的配置

## 配置存储结构

### 配置 ID 格式

- **旧格式：** `default-config`（所有用户共享）
- **新格式：** `user-{用户ID}`（每个用户独立）

### 数据库字段

- `id`: 配置 ID（格式：`user-{用户ID}`）
- `user_id`: 用户 ID（TEXT 类型）
- 其他配置字段保持不变

## 兼容性说明

### 向后兼容

- ✅ 如果用户没有专属配置，系统会尝试加载 `default-config` 作为默认值
- ✅ 旧的 `default-config` 仍然保留，不会自动删除

### 数据迁移

如果需要将 `default-config` 复制给特定用户：

```sql
-- 替换 USER_ID 为实际用户 ID
INSERT INTO app_configs (
    id, user_id, app_title, brand_name, ...
)
SELECT 
    'user-' || USER_ID,
    USER_ID::text,
    app_title, brand_name, ...
FROM app_configs
WHERE id = 'default-config'
ON CONFLICT (id) DO NOTHING;
```

## 注意事项

1. **首次使用：** 新用户首次保存配置时，会创建用户专属配置
2. **配置隔离：** 每个用户的配置完全独立，互不影响
3. **Logo 存储：** Logo 和印章图片仍然存储在 Supabase 存储桶中，配置只存储 URL
4. **性能优化：** 已为 `user_id` 字段添加索引，查询性能良好

## 相关文件

- `src/lib/supabase-database.ts` - 配置保存/加载逻辑
- `src/lib/supabase-auth.ts` - 用户认证模块
- `index.html` - 前端界面和登录逻辑
- `sql/supabase-schema.sql` - 数据库表结构
- `sql/migrate-user-configs.sql` - 迁移脚本

## 测试清单

- [ ] 使用 admin 账号登录，上传 logo，保存配置
- [ ] 登出，使用 user 账号登录，上传不同的 logo，保存配置
- [ ] 登出，重新使用 admin 账号登录，确认看到 admin 的 logo
- [ ] 登出，重新使用 user 账号登录，确认看到 user 的 logo
- [ ] 在不同浏览器中测试，确认配置正确同步

