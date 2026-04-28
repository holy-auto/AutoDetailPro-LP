-- =============================================
-- Migration: orders テーブルをアプリコードに揃える
-- =============================================
-- 既に supabase-schema.sql の旧バージョンを流してテーブルが存在する場合に
-- 不足列を追加し、列名をコード期待値にリネームする。
--
-- 影響: orders テーブルのみ。データは保持される。
--
-- 想定エラーメッセージ: "Could not find the X column of orders in the schema cache"
-- =============================================

BEGIN;

-- 1. お客様/プロ手数料の列を追加（コード: lib/orders.ts createOrder）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_fee  INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_total INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pro_fee       INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT NOW();

-- 2. menu_id (UUID 単数, FK) → menu_ids (UUID[] 複数)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='orders' AND column_name='menu_ids'
  ) THEN
    ALTER TABLE orders ADD COLUMN menu_ids UUID[] NOT NULL DEFAULT '{}';
  END IF;

  -- 旧 menu_id があればその値を menu_ids に移行してから drop
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='orders' AND column_name='menu_id'
  ) THEN
    UPDATE orders
       SET menu_ids = ARRAY[menu_id]
     WHERE menu_id IS NOT NULL
       AND (menu_ids IS NULL OR cardinality(menu_ids) = 0);

    ALTER TABLE orders DROP COLUMN menu_id;
  END IF;
END$$;

-- 3. customer_latitude/longitude/address → location_lat/lng/address
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='orders' AND column_name='customer_latitude'
  ) THEN
    ALTER TABLE orders RENAME COLUMN customer_latitude TO location_lat;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='orders' AND column_name='customer_longitude'
  ) THEN
    ALTER TABLE orders RENAME COLUMN customer_longitude TO location_lng;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_name='orders' AND column_name='customer_address'
  ) THEN
    ALTER TABLE orders RENAME COLUMN customer_address TO location_address;
  END IF;

  -- 既に location_* 列だけある場合は何もしない (idempotent)
END$$;

COMMIT;

-- 完了後、PostgREST がスキーマキャッシュをリロードします (数秒)。
-- もし再起動が必要なら Supabase Dashboard > Database > 再起動 してください。
