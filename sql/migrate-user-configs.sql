-- ==========================================
-- 用户配置迁移脚本
-- 将旧的 default-config 迁移到用户特定配置
-- ==========================================

-- 为 user_id 字段添加索引（如果还没有）
CREATE INDEX IF NOT EXISTS idx_app_configs_user_id ON app_configs(user_id);

-- 如果存在旧的 default-config，且 user_id 为空，可以选择：
-- 1. 保留作为默认配置（推荐）
-- 2. 或者删除（如果确定不需要）

-- 注意：此脚本不会自动迁移数据，因为需要知道哪个用户应该继承 default-config
-- 如果需要迁移，可以手动执行：

-- 示例：将 default-config 复制给特定用户（替换 USER_ID）
-- INSERT INTO app_configs (
--     id,
--     user_id,
--     app_title,
--     brand_name,
--     brand_sub,
--     logo_url,
--     seal_url,
--     seal_text,
--     title,
--     sub_title,
--     intro_text,
--     confirm_text,
--     footer_slogan,
--     membership_options,
--     handlers,
--     created_at,
--     updated_at
-- )
-- SELECT 
--     'user-' || USER_ID,
--     USER_ID::text,
--     app_title,
--     brand_name,
--     brand_sub,
--     logo_url,
--     seal_url,
--     seal_text,
--     title,
--     sub_title,
--     intro_text,
--     confirm_text,
--     footer_slogan,
--     membership_options,
--     handlers,
--     created_at,
--     NOW()
-- FROM app_configs
-- WHERE id = 'default-config'
-- ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 说明
-- ==========================================

-- 此脚本用于：
-- 1. 为 user_id 字段添加索引，提高查询性能
-- 2. 提供迁移示例（需要手动执行）

-- 注意事项：
-- - 每个用户现在有独立的配置
-- - 配置 ID 格式：user-{用户ID}
-- - 如果用户没有配置，系统会尝试加载 default-config 作为默认值

