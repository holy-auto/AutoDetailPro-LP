-- =============================================================================
-- Long-term foundation tables (PR: claude/debug-app-progress-LsiPR)
-- =============================================================================
-- Run this on existing databases that already have the base schema.
-- New deploys can use supabase-schema.sql which already contains these tables.
--
-- Adds:
--   - audit_logs           (compliance / debugging)
--   - feature_flags        (staged rollout / emergency kill-switch)
--   - masked_calls         (Twilio Proxy phone masking sessions)
--   - trip_stats           (self-hosted ETA aggregates)
--   - service_areas        (prefecture-level launch control)
--   - fraud_signals        (suspicious-event log)
--   - reviews.* sub-rating columns
--
-- Safe to run multiple times: every CREATE uses IF NOT EXISTS where supported.
-- =============================================================================


-- ============================================
-- 40. Audit Logs (変更履歴・コンプライアンス)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,              -- e.g. 'order.cancel', 'boost.activate', 'payment.capture'
  resource_type TEXT,                -- e.g. 'order', 'boost_purchase', 'profile'
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = actor_id);
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can insert own audit logs" ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action, created_at DESC);

-- ============================================
-- 45. Fraud Signals (不正検知シグナル蓄積)
-- ============================================
-- Append-only stream of suspicious-but-not-conclusive events.
-- A separate scoring job aggregates these per user/device to flag
-- accounts for manual review. Storing raw signals (vs immediately
-- judging) lets us tune detection without re-collecting data.

CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT,                       -- Anonymous device fingerprint
  signal_type TEXT NOT NULL,            -- e.g. 'gps_jump', 'rapid_cancel', 'payment_decline_burst', 'multi_account_device'
  severity SMALLINT NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 10),
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own signals" ON fraud_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all signals" ON fraud_signals FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_fraud_signals_user ON fraud_signals (user_id, created_at DESC);
CREATE INDEX idx_fraud_signals_device ON fraud_signals (device_id, created_at DESC);
CREATE INDEX idx_fraud_signals_type ON fraud_signals (signal_type, created_at DESC);

-- ============================================
-- 44. Service Areas (都道府県・市区町村単位のサービス展開管理)
-- ============================================
-- Controls where the platform is open for business. Lets us launch
-- city-by-city and shut down problematic areas without code deploys.
-- Customer-side: search/booking blocked outside active areas.
-- Pro-side: signup blocked outside active areas.

CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 階層: prefecture (都道府県) → city (市区町村)
  prefecture TEXT NOT NULL,        -- e.g. '東京都', '大阪府'
  city TEXT,                       -- NULL means whole prefecture
  -- Bounding box (rough — for client-side coords→area resolution without geocoding)
  min_lat DOUBLE PRECISION NOT NULL,
  max_lat DOUBLE PRECISION NOT NULL,
  min_lng DOUBLE PRECISION NOT NULL,
  max_lng DOUBLE PRECISION NOT NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','soft_launch','active','suspended')),
  -- Soft launch: visible to allowlisted accounts only
  allowlist_emails TEXT[] DEFAULT '{}',
  launched_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read areas" ON service_areas FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage areas" ON service_areas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_service_areas_status ON service_areas (status) WHERE status IN ('active', 'soft_launch');
CREATE INDEX idx_service_areas_bbox ON service_areas (min_lat, max_lat, min_lng, max_lng);

-- Seed: Tokyo 23 wards + Osaka as starting active areas
INSERT INTO service_areas (prefecture, city, min_lat, max_lat, min_lng, max_lng, status) VALUES
  ('東京都', NULL, 35.50, 35.85, 139.55, 139.92, 'active'),
  ('大阪府', NULL, 34.55, 34.85, 135.40, 135.65, 'soft_launch')
ON CONFLICT DO NOTHING;

-- ============================================
-- 43. Trip Stats (実走データの集約 — 自前 ETA モデル基盤)
-- ============================================
-- Aggregated travel-time stats per (origin grid cell × destination grid cell × hour-of-day).
-- Populated by a periodic job that scans completed orders + gps_tracks.
-- Used to compute ETA without depending on Google Directions API.
--
-- Grid cells are quantised lat/lng (~1km buckets) so we don't store
-- per-coordinate data. Bucket size: round(lat*100)/100, round(lng*100)/100.

CREATE TABLE trip_stats (
  origin_lat_cell  NUMERIC(5,2) NOT NULL,
  origin_lng_cell  NUMERIC(6,2) NOT NULL,
  dest_lat_cell    NUMERIC(5,2) NOT NULL,
  dest_lng_cell    NUMERIC(6,2) NOT NULL,
  hour_of_day      SMALLINT NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  -- Aggregates
  sample_count     INT NOT NULL DEFAULT 0,
  avg_seconds      INT NOT NULL,           -- average travel time
  p50_seconds      INT,                     -- median
  p90_seconds      INT,                     -- 90th percentile
  avg_distance_m   INT,                     -- straight-line distance for sanity check
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (origin_lat_cell, origin_lng_cell, dest_lat_cell, dest_lng_cell, hour_of_day)
);

ALTER TABLE trip_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read trip stats" ON trip_stats FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role only writes" ON trip_stats FOR ALL USING (FALSE);

CREATE INDEX idx_trip_stats_origin ON trip_stats (origin_lat_cell, origin_lng_cell, hour_of_day);

-- ============================================
-- 42. Masked Communication (電話番号マスキング)
-- ============================================
-- Replaces direct phone number sharing between customer and pro.
-- Each call gets a temporary proxy number that routes through a
-- third-party (e.g. Twilio Proxy, Vonage). Real numbers never appear
-- in the client. Only valid during the active order window.

CREATE TABLE masked_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  caller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  callee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  proxy_number TEXT NOT NULL,        -- Twilio proxy number assigned to this session
  provider TEXT NOT NULL,            -- 'twilio' | 'vonage' | ...
  provider_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,   -- Session valid until order completion + 24h
  -- Per-call audit (populated by webhook)
  duration_seconds INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','completed','failed','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE masked_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view own calls" ON masked_calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);
CREATE POLICY "Admins can manage all calls" ON masked_calls FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_masked_calls_order ON masked_calls (order_id);
CREATE INDEX idx_masked_calls_proxy ON masked_calls (proxy_number) WHERE status = 'active';

-- ============================================
-- 41. Feature Flags (段階的ロールアウト・緊急停止)
-- ============================================
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percent INT NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  target_roles TEXT[] DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read flags" ON feature_flags FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage flags" ON feature_flags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed a few initial flags (disabled by default — enable from admin UI)
INSERT INTO feature_flags (key, description) VALUES
  ('enable_boost_purchase',         'プロのブースト購入機能'),
  ('enable_rewarded_ad_coupon',     'リワード広告でクーポン獲得'),
  ('enable_auto_completion',        '30分自動完了機能'),
  ('enable_multi_dimensional_review', '多次元レビュー (時間厳守/技術/丁寧さ)'),
  ('emergency_price_cap',           '災害時の料金キャップ (true時は boost 購入停止)')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- Reviews — multi-dimensional rating columns
-- =============================================================================
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS technical_rating   INT CHECK (technical_rating   BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS courtesy_rating    INT CHECK (courtesy_rating    BETWEEN 1 AND 5);

-- =============================================================================
-- boost_purchases — payment intent reference
-- =============================================================================
ALTER TABLE boost_purchases
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
