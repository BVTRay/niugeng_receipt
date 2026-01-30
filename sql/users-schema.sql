-- ==========================================
-- 用户表结构
-- 用于牛耕部落会员权益确认函生成器
-- ==========================================

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    display_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 注意：由于我们使用简单的账号密码登录，不使用 Supabase Auth，
-- 我们在应用层进行权限控制，因此使用简化的 RLS 策略。

-- 简化版策略：允许所有访问（通过应用层控制权限）
-- 生产环境建议使用更严格的策略，或者完全禁用 RLS 并在应用层控制
CREATE POLICY "Allow all access to users" 
ON users FOR ALL 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 初始化用户数据
-- ==========================================

-- 注意：密码需要使用 bcrypt 哈希
-- 默认密码：admin123 (管理员) 和 user123 (普通用户)
-- 在生产环境中，请务必修改这些默认密码！

-- 注意：用户账号的初始化请使用 init-users.sql 脚本
-- 这里不创建默认用户，避免密码哈希问题

-- ==========================================
-- 说明
-- ==========================================

-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- 4. 确认表创建成功
-- 5. 使用 init-users.sql 脚本初始化用户（包含正确的密码哈希）

-- 表说明：
-- - users: 存储用户账号、密码哈希、角色等信息
-- - role: 'admin' 管理员，'user' 普通用户
-- - password_hash: 使用 SHA-256 算法加密的密码（简化实现）

-- 注意事项：
-- - 密码必须使用 bcrypt 哈希存储，不要存储明文密码
-- - 管理员可以访问设置功能，普通用户只能使用生成功能
-- - 建议在生产环境中修改默认密码

