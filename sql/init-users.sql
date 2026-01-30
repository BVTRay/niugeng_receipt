-- ==========================================
-- 初始化用户账号
-- 用于创建默认的管理员和普通用户
-- ==========================================

-- 注意：此脚本需要在创建 users 表后执行
-- 密码哈希使用 bcrypt 算法

-- 删除已存在的默认用户（如果存在）
DELETE FROM users WHERE username IN ('admin', 'user');

-- 创建管理员账号
-- 用户名：admin
-- 密码：admin123
-- 密码哈希（SHA-256）：240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO users (username, password_hash, role, display_name) 
VALUES (
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'admin',
    '管理员'
);

-- 创建普通用户账号
-- 用户名：user
-- 密码：user123
-- 密码哈希（SHA-256）：e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446
INSERT INTO users (username, password_hash, role, display_name) 
VALUES (
    'user',
    'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446',
    'user',
    '普通用户'
);

-- ==========================================
-- 说明
-- ==========================================

-- 默认账号信息：
-- 1. 管理员
--    用户名：admin
--    密码：admin123
--    权限：可以访问所有功能，包括设置
--
-- 2. 普通用户
--    用户名：user
--    密码：user123
--    权限：只能使用生成功能，不能访问设置

-- 重要提示：
-- - 在生产环境中，请务必修改这些默认密码！
-- - 可以通过更新 users 表的 password_hash 字段来修改密码
-- - 密码哈希可以使用脚本生成：
--   tsx scripts/generate-password-hash.ts <密码>

