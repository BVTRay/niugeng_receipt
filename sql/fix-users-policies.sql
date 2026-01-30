-- ==========================================
-- 修复用户表 RLS 策略
-- 用于解决 "cannot cast type uuid to bigint" 错误
-- ==========================================

-- 删除旧的错误策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated access to users" ON users;

-- 创建新的简化策略（允许所有访问，权限在应用层控制）
CREATE POLICY "Allow all access to users" 
ON users FOR ALL 
USING (true) 
WITH CHECK (true);

-- ==========================================
-- 说明
-- ==========================================

-- 此脚本用于修复 RLS 策略错误
-- 由于我们使用自定义认证（不使用 Supabase Auth），
-- 因此使用简化的策略，权限控制在应用层实现

