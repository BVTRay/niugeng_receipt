-- ==========================================
-- Supabase 存储桶策略配置
-- 用于 receipts 存储桶
-- ==========================================
-- 
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- 4. 确认策略创建成功
--
-- ==========================================

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- ==========================================
-- 策略 1: 允许公开读取
-- ==========================================
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'receipts' );

-- ==========================================
-- 策略 2: 允许公开上传
-- ==========================================
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'receipts' );

-- ==========================================
-- 策略 3: 允许公开更新（可选）
-- ==========================================
CREATE POLICY "Public Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'receipts' )
WITH CHECK ( bucket_id = 'receipts' );

-- ==========================================
-- 策略 4: 允许公开删除（可选，谨慎使用）
-- ==========================================
CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'receipts' );

-- ==========================================
-- 验证策略
-- ==========================================
-- 执行以下查询来验证策略是否创建成功：
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%Public%';

-- ==========================================
-- 完成提示
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ 存储策略配置完成！';
    RAISE NOTICE '📊 receipts 存储桶现在允许:';
    RAISE NOTICE '   - 公开读取 (SELECT)';
    RAISE NOTICE '   - 公开上传 (INSERT)';
    RAISE NOTICE '   - 公开更新 (UPDATE)';
    RAISE NOTICE '   - 公开删除 (DELETE)';
    RAISE NOTICE '====================================';
END $$;

