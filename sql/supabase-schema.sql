-- ==========================================
-- Supabase 数据库表结构
-- 用于牛耕部落会员权益确认函生成器
-- ==========================================

-- 1. 应用配置表
CREATE TABLE IF NOT EXISTS app_configs (
    id TEXT PRIMARY KEY DEFAULT 'default-config',
    user_id TEXT,
    app_title TEXT NOT NULL DEFAULT '权益函生成助手',
    brand_name TEXT NOT NULL DEFAULT '牛耕部落',
    brand_sub TEXT NOT NULL DEFAULT 'The Plough Tribe',
    logo_url TEXT DEFAULT '',
    seal_url TEXT DEFAULT '',
    seal_text TEXT NOT NULL DEFAULT '专用章',
    title TEXT NOT NULL DEFAULT '会员权益确认函',
    sub_title TEXT NOT NULL DEFAULT 'Official Membership Receipt',
    intro_text TEXT NOT NULL,
    confirm_text TEXT NOT NULL,
    footer_slogan TEXT NOT NULL DEFAULT '自然 · 生命 · 未来',
    membership_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    handlers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_app_configs_user_id ON app_configs(user_id);

-- 2. 流水编号记录表
CREATE TABLE IF NOT EXISTS serial_numbers (
    id BIGSERIAL PRIMARY KEY,
    serial_number TEXT UNIQUE NOT NULL,
    customer_name TEXT DEFAULT '',
    amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_created_at ON serial_numbers(created_at DESC);

-- ==========================================
-- 访问策略（RLS - Row Level Security）
-- ==========================================

-- 启用 RLS
ALTER TABLE app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;

-- 配置表策略：允许所有人读写（简化版，生产环境需要更严格的控制）
CREATE POLICY "Allow all access to app_configs" 
ON app_configs FOR ALL 
USING (true) 
WITH CHECK (true);

-- 流水编号表策略：允许所有人读写
CREATE POLICY "Allow all access to serial_numbers" 
ON serial_numbers FOR ALL 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 初始化数据
-- ==========================================

-- 插入默认配置（如果不存在）
INSERT INTO app_configs (
    id,
    app_title,
    brand_name,
    brand_sub,
    intro_text,
    confirm_text,
    membership_options,
    handlers
) VALUES (
    'default-config',
    '权益函生成助手',
    '牛耕部落',
    'The Plough Tribe',
    '欢迎加入「牛耕部落」。这里不仅是一方农田，更是我们共同守护的自然家园。感谢您对生态农业的支持与信任。',
    '兹确认您已成功办理以下会员权益，我们将竭诚为您提供源自大地的纯净馈赠。',
    '[
        {"label": "【尝鲜】耕友·季度体验卡", "price": 698},
        {"label": "【轻量】守护·小户年卡", "price": 1398},
        {"label": "【标准】守护·家园年卡", "price": 2580},
        {"label": "【尊享】守护·丰仓年卡", "price": 4680}
    ]'::jsonb,
    '["张三", "李四"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 说明
-- ==========================================

-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- 4. 确认表创建成功

-- 表说明：
-- - app_configs: 存储应用配置，包括品牌信息、logo、会员选项等
-- - serial_numbers: 存储所有生成的流水编号，确保不重复

-- 注意事项：
-- - 流水编号格式：YYYY-N-XXXX (年份-N-四位数字)
-- - 配置 ID 固定为 'default-config'，支持多用户时可改为用户ID


