-- ==========================================
-- 数据库升级脚本 - 完整确认函记录系统
-- ==========================================

-- 方案：将现有 serial_numbers 表扩展为完整的确认函记录表
-- 保留所有现有数据，只添加新字段

-- 1. 为现有表添加新字段

DO $$ 
BEGIN
    -- 添加客户电话字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='customer_phone') THEN
        ALTER TABLE serial_numbers ADD COLUMN customer_phone TEXT DEFAULT '';
    END IF;
    
    -- 添加会员类型字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='membership_type') THEN
        ALTER TABLE serial_numbers ADD COLUMN membership_type TEXT DEFAULT '';
    END IF;
    
    -- 添加会员标签字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='membership_label') THEN
        ALTER TABLE serial_numbers ADD COLUMN membership_label TEXT DEFAULT '';
    END IF;
    
    -- 添加签约日期字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='contract_date') THEN
        ALTER TABLE serial_numbers ADD COLUMN contract_date DATE;
    END IF;
    
    -- 添加经办人字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='handler_name') THEN
        ALTER TABLE serial_numbers ADD COLUMN handler_name TEXT DEFAULT '';
    END IF;
    
    -- 添加 PDF URL 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='pdf_url') THEN
        ALTER TABLE serial_numbers ADD COLUMN pdf_url TEXT DEFAULT '';
    END IF;
    
    -- 添加 PDF 路径字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='pdf_path') THEN
        ALTER TABLE serial_numbers ADD COLUMN pdf_path TEXT DEFAULT '';
    END IF;
    
    -- 添加 PDF 文件大小字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='pdf_size') THEN
        ALTER TABLE serial_numbers ADD COLUMN pdf_size INTEGER DEFAULT 0;
    END IF;
    
    -- 添加 PDF 生成时间字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='pdf_generated_at') THEN
        ALTER TABLE serial_numbers ADD COLUMN pdf_generated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- 添加状态字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='status') THEN
        ALTER TABLE serial_numbers ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    -- 添加备注字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='notes') THEN
        ALTER TABLE serial_numbers ADD COLUMN notes TEXT DEFAULT '';
    END IF;
    
    -- 添加更新时间字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='updated_at') THEN
        ALTER TABLE serial_numbers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
    END IF;
    
    -- 添加元数据字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='serial_numbers' AND column_name='metadata') THEN
        ALTER TABLE serial_numbers ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_serial_customer ON serial_numbers(customer_name);
CREATE INDEX IF NOT EXISTS idx_serial_date ON serial_numbers(contract_date DESC);
CREATE INDEX IF NOT EXISTS idx_serial_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_handler ON serial_numbers(handler_name);
CREATE INDEX IF NOT EXISTS idx_serial_phone ON serial_numbers(customer_phone);

-- 6. 创建视图：汇总统计（可选）
DROP VIEW IF EXISTS receipt_statistics CASCADE;
CREATE VIEW receipt_statistics AS
SELECT 
    DATE(contract_date) as date,
    COUNT(*) as total_count,
    SUM(amount) as total_amount,
    COUNT(DISTINCT customer_name) as unique_customers,
    COUNT(DISTINCT handler_name) as handlers_involved
FROM serial_numbers
WHERE status = 'active'
  AND contract_date IS NOT NULL
GROUP BY DATE(contract_date)
ORDER BY date DESC;

-- 5. 创建函数：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 serial_numbers 表创建触发器
DROP TRIGGER IF EXISTS update_serial_numbers_updated_at ON serial_numbers;
CREATE TRIGGER update_serial_numbers_updated_at
    BEFORE UPDATE ON serial_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. 添加表和字段注释
-- ==========================================

COMMENT ON TABLE serial_numbers IS '确认函记录表 - 存储所有生成的会员权益确认函完整信息';
COMMENT ON COLUMN serial_numbers.serial_number IS '流水编号（格式：YYYY-N-XXXX）';
COMMENT ON COLUMN serial_numbers.customer_name IS '客户姓名';
COMMENT ON COLUMN serial_numbers.customer_phone IS '客户手机号';
COMMENT ON COLUMN serial_numbers.membership_type IS '会员卡类型';
COMMENT ON COLUMN serial_numbers.amount IS '金额（元）';
COMMENT ON COLUMN serial_numbers.contract_date IS '签约日期';
COMMENT ON COLUMN serial_numbers.handler_name IS '经办管家姓名';
COMMENT ON COLUMN serial_numbers.pdf_url IS '云端 PDF 文件公开访问 URL';
COMMENT ON COLUMN serial_numbers.pdf_path IS '云端 PDF 文件存储路径';
COMMENT ON COLUMN serial_numbers.status IS '状态：active(有效)、cancelled(已取消)、expired(已过期)';

-- ==========================================
-- 完成提示
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ 数据库升级完成！';
    RAISE NOTICE '📊 serial_numbers 表已扩展为完整的确认函记录系统';
    RAISE NOTICE '🔍 新增字段：客户电话、会员类型、PDF信息等';
    RAISE NOTICE '📈 创建了索引、触发器和统计视图';
    RAISE NOTICE '====================================';
END $$;

