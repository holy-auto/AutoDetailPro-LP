-- =============================================
-- Mobile Wash — Supabase Database Schema
-- Run in Supabase SQL Editor
-- =============================================

-- ============================================
-- 1. Profiles (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'pro', 'admin')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. Service Categories (admin-defined)
-- ============================================
CREATE TABLE service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories" ON service_categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage categories" ON service_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed categories
INSERT INTO service_categories (id, name, description, icon, color, sort_order) VALUES
  ('exterior', '外装洗車', '手洗い洗車・ワックスがけ', 'car-wash', '#3B82F6', 1),
  ('interior', '内装クリーニング', 'シート・ダッシュボード・フロアマット', 'car-seat', '#8B5CF6', 2),
  ('coating', 'コーティング', 'ガラスコーティング・セラミック', 'shield-check', '#F59E0B', 3),
  ('polish', '磨き・研磨', '傷消し・ポリッシュ・鏡面仕上げ', 'auto-fix', '#EC4899', 4),
  ('full_detail', 'フルディテイル', '外装＋内装＋コーティングのフルコース', 'star-circle', '#1E3A5F', 5),
  ('engine', 'エンジンルーム', 'エンジンルーム洗浄・美装', 'engine', '#EF4444', 6);

-- ============================================
-- 3. Pro Profiles
-- ============================================
CREATE TABLE pro_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  bio TEXT,
  payout_schedule TEXT DEFAULT 'weekly' CHECK (payout_schedule IN ('instant', 'weekly', 'monthly')),
  cash_enabled BOOLEAN DEFAULT TRUE,
  suspended BOOLEAN DEFAULT FALSE,
  -- Rating & ranking
  response_rate DOUBLE PRECISION DEFAULT 1.0,
  completion_rate DOUBLE PRECISION DEFAULT 1.0,
  -- Paid boost
  boost_plan_id TEXT,
  boost_started_at TIMESTAMPTZ,
  boost_expires_at TIMESTAMPTZ,
  -- Improvement plan
  improvement_status TEXT CHECK (improvement_status IN ('active', 'passed', 'failed', 'extended')),
  improvement_started_at TIMESTAMPTZ,
  improvement_extension_count INT DEFAULT 0,
  -- Forced removal
  removed_at TIMESTAMPTZ,
  removal_reason TEXT,
  removal_cooldown_until TIMESTAMPTZ,
  --
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can manage own pro profile" ON pro_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Customers can view online pros" ON pro_profiles FOR SELECT USING (is_online = TRUE AND NOT suspended);
CREATE POLICY "Admins can view all pros" ON pro_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update pros" ON pro_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 4. Menus (pro-created, category-linked)
-- ============================================
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES service_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL CHECK (price > 0),
  duration TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active menus" ON menus FOR SELECT USING (active = TRUE);
CREATE POLICY "Pros can manage own menus" ON menus FOR ALL USING (auth.uid() = pro_id);

-- ============================================
-- 5. Orders (full state machine)
-- ============================================
CREATE TYPE order_status AS ENUM (
  'draft',
  'payment_authorized',
  'requested',
  'requested_expanded',
  'accepted',
  'on_the_way',
  'arrived',
  'in_progress',
  'pro_marked_done',
  'completed',
  'auto_completed',
  'review_open',
  'dispute_open',
  'partially_refunded',
  'fully_refunded',
  'dispute_rejected',
  'cancelled',
  'cancelled_with_fee_30_50',
  'cancelled_with_fee_100',
  'auto_cancelled_no_response',
  'auto_cancelled_no_pro',
  'closed'
);

CREATE TYPE payment_method AS ENUM ('online', 'cash');

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID REFERENCES profiles(id),
  menu_id UUID REFERENCES menus(id),
  category_id TEXT REFERENCES service_categories(id),

  -- Status
  status order_status NOT NULL DEFAULT 'draft',

  -- Payment
  payment_method payment_method NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  stripe_payment_intent_id TEXT,

  -- Fee breakdown (mirrors stripe-connect Edge Function)
  customer_fee INT DEFAULT 0,
  customer_total INT DEFAULT 0,
  pro_fee INT DEFAULT 0,
  payout_fee INT DEFAULT 0,
  pro_payout INT DEFAULT 0,

  -- Location
  customer_latitude DOUBLE PRECISION,
  customer_longitude DOUBLE PRECISION,
  customer_address TEXT,
  matching_radius_km INT DEFAULT 15,

  -- Confirmations
  customer_confirmed BOOLEAN DEFAULT FALSE,
  pro_confirmed BOOLEAN DEFAULT FALSE,

  -- Cancellation
  cancellation_fee INT DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT CHECK (cancelled_by IN ('customer', 'pro', 'system')),

  -- Refund
  refund_amount INT DEFAULT 0,
  refund_reason TEXT,
  refund_percent INT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  payment_authorized_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  pro_departed_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  pro_completed_at TIMESTAMPTZ,
  customer_confirmed_at TIMESTAMPTZ,
  auto_completed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ
);

-- Idempotent column adds for existing deployments
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_fee INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_total INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pro_fee INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_fee INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pro_payout INT DEFAULT 0;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own orders" ON orders FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Pros can view assigned orders" ON orders FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Pros can update assigned orders" ON orders FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Index for matching (find nearby online pros)
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_pro ON orders (pro_id);

-- ============================================
-- 6. Reviews (one-sided: each side can post independently)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  target_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================
-- 7. Payouts (payment tracking for pros)
-- ============================================
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount INT NOT NULL,
  fee INT DEFAULT 0,
  schedule TEXT NOT NULL CHECK (schedule IN ('instant', 'weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'adjustment')),
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can view own payouts" ON payouts FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all payouts" ON payouts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 8. Cash Ledger (現金相殺管理)
-- ============================================
CREATE TABLE cash_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  cash_amount INT NOT NULL,
  -- Offset tracking
  offset_from_payout_id UUID REFERENCES payouts(id),
  offset_amount INT DEFAULT 0,
  remaining_amount INT NOT NULL,
  -- Invoice if cannot offset
  invoice_id TEXT,
  invoice_due_date DATE,
  invoice_paid BOOLEAN DEFAULT FALSE,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'offset', 'invoiced', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cash_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can view own cash ledger" ON cash_ledger FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage cash ledger" ON cash_ledger FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 9. Disputes (クレーム・返金審査)
-- ============================================
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  evidence_urls TEXT[],
  -- Resolution
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
  resolution TEXT,
  refund_percent INT,
  refund_amount INT,
  resolved_by UUID REFERENCES profiles(id),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Disputes must be filed within 24h of order completion.
-- (PostgreSQL does not allow subqueries in CHECK constraints, so use a trigger.)
CREATE OR REPLACE FUNCTION enforce_dispute_within_24h()
RETURNS TRIGGER AS $$
DECLARE
  deadline TIMESTAMPTZ;
BEGIN
  SELECT COALESCE(completed_at, auto_completed_at, NOW()) + INTERVAL '24 hours'
    INTO deadline
    FROM orders
   WHERE id = NEW.order_id;

  IF deadline IS NULL THEN
    RAISE EXCEPTION 'Referenced order % not found', NEW.order_id;
  END IF;

  IF NEW.created_at > deadline THEN
    RAISE EXCEPTION 'Dispute must be filed within 24 hours of order completion';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_disputes_within_24h
  BEFORE INSERT ON disputes
  FOR EACH ROW EXECUTE FUNCTION enforce_dispute_within_24h();

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own disputes" ON disputes FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Pros can view disputes about them" ON disputes FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all disputes" ON disputes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 10. Boost Purchases (有料優先表示)
-- ============================================
CREATE TABLE boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  price INT NOT NULL,
  duration_days INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE boost_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can view own boosts" ON boost_purchases FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Pros can purchase boosts" ON boost_purchases FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "Admins can manage boosts" ON boost_purchases FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 11. Improvement Plans (改善プラン履歴)
-- ============================================
CREATE TABLE improvement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  rating_at_start DOUBLE PRECISION NOT NULL,
  target_rating DOUBLE PRECISION NOT NULL DEFAULT 3.8,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  evaluation_at TIMESTAMPTZ NOT NULL,  -- started_at + 30 days
  rating_at_end DOUBLE PRECISION,
  orders_completed INT DEFAULT 0,
  extension_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'failed', 'extended')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE improvement_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can view own plans" ON improvement_plans FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage plans" ON improvement_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 12. Loyalty Accounts (ポイント管理)
-- ============================================
CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  lifetime_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own loyalty account" ON loyalty_accounts FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can insert own loyalty account" ON loyalty_accounts FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Customers can update own loyalty account" ON loyalty_accounts FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all loyalty accounts" ON loyalty_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 13. Loyalty Transactions (ポイント履歴)
-- ============================================
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  points INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn_order', 'earn_review', 'earn_referral', 'welcome', 'redeem', 'expire')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create own loyalty transactions" ON loyalty_transactions FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all loyalty transactions" ON loyalty_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions (customer_id);

-- ============================================
-- 14. Coupons (クーポン定義)
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed', 'free_service')),
  value INT NOT NULL,
  min_order_amount INT,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage all coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 15. Customer Coupons (顧客クーポン割当)
-- ============================================
CREATE TABLE customer_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own coupons" ON customer_coupons FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create own coupons" ON customer_coupons FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own coupons" ON customer_coupons FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all customer coupons" ON customer_coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_customer_coupons_customer ON customer_coupons (customer_id);

-- ============================================
-- 16. Gifts (ギフトカード)
-- ============================================
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  message TEXT,
  gift_code TEXT NOT NULL UNIQUE,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own sent gifts" ON gifts FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Customers can view redeemed gifts" ON gifts FOR SELECT USING (auth.uid() = redeemed_by);
CREATE POLICY "Customers can create gifts" ON gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can manage all gifts" ON gifts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_gifts_gift_code ON gifts (gift_code);

-- ============================================
-- 17. Subscriptions (定期予約プラン)
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES profiles(id),
  plan_id TEXT NOT NULL,
  menu_ids UUID[] NOT NULL,
  total_amount INT NOT NULL CHECK (total_amount > 0),
  discount_percent INT NOT NULL DEFAULT 0,
  next_booking_date DATE NOT NULL,
  customer_latitude DOUBLE PRECISION,
  customer_longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Pros can view assigned subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_subscriptions_customer ON subscriptions (customer_id);
CREATE INDEX idx_subscriptions_next_date ON subscriptions (next_booking_date) WHERE status = 'active';

-- ============================================
-- 18. Scheduled Bookings (日時指定予約)
-- ============================================
CREATE TABLE scheduled_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pro_id UUID REFERENCES profiles(id),
  menu_ids UUID[] NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  customer_latitude DOUBLE PRECISION,
  customer_longitude DOUBLE PRECISION,
  customer_address TEXT,
  amount INT NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'converted')),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own scheduled bookings" ON scheduled_bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create scheduled bookings" ON scheduled_bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own scheduled bookings" ON scheduled_bookings FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Pros can view assigned scheduled bookings" ON scheduled_bookings FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Pros can update assigned scheduled bookings" ON scheduled_bookings FOR UPDATE USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all scheduled bookings" ON scheduled_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_scheduled_bookings_customer ON scheduled_bookings (customer_id);
CREATE INDEX idx_scheduled_bookings_date ON scheduled_bookings (scheduled_date) WHERE status IN ('pending', 'confirmed');

-- ============================================
-- 19. Quality Audits (覆面調査)
-- ============================================
CREATE TABLE quality_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  -- Scores (JSON: { checklistId: 1-5 })
  scores JSONB,
  overall_score DOUBLE PRECISION,
  comment TEXT,
  -- Reward
  reward_coupon_id UUID REFERENCES coupons(id),
  -- Timestamps
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quality_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own audits" ON quality_audits FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can update own audits" ON quality_audits FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');
CREATE POLICY "Pros can view audits about them" ON quality_audits FOR SELECT USING (auth.uid() = pro_id);
CREATE POLICY "Admins can manage all audits" ON quality_audits FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_quality_audits_pro ON quality_audits (pro_id);
CREATE INDEX idx_quality_audits_customer ON quality_audits (customer_id);
CREATE INDEX idx_quality_audits_status ON quality_audits (status) WHERE status = 'pending';

-- ============================================
-- 20. Notifications (通知)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE read = FALSE;

-- ============================================
-- 21. Chat Messages (チャット — 運営監視付き)
-- ============================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'flagged')),
  flagged_reason TEXT,
  flagged_at TIMESTAMPTZ,
  flagged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  UNIQUE(order_id)
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view own chat rooms" ON chat_rooms FOR SELECT USING (auth.uid() IN (customer_id, pro_id));
CREATE POLICY "Admins can view all chat rooms" ON chat_rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system', 'admin_warning')),
  image_url TEXT,
  -- NGワード検知
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  -- 管理者介入メッセージ
  is_admin_message BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages in own rooms" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = room_id AND (customer_id = auth.uid() OR pro_id = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = room_id AND status = 'active' AND (customer_id = auth.uid() OR pro_id = auth.uid()))
);
CREATE POLICY "Admins can manage all messages" ON chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_chat_messages_room ON chat_messages (room_id, created_at);
CREATE INDEX idx_chat_rooms_order ON chat_rooms (order_id);
CREATE INDEX idx_chat_messages_flagged ON chat_messages (flagged) WHERE flagged = TRUE;

-- ============================================
-- 22. KYC / Identity Verification (本人確認)
-- ============================================
CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- 身分証明書
  id_document_type TEXT NOT NULL CHECK (id_document_type IN ('drivers_license', 'my_number', 'passport', 'residence_card')),
  id_document_front_url TEXT NOT NULL,
  id_document_back_url TEXT,
  -- リアルタイム顔写真
  selfie_url TEXT NOT NULL,
  -- 審査
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmit')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  -- Stripe Connect
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  --
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own KYC" ON kyc_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit KYC" ON kyc_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own KYC" ON kyc_verifications FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'resubmit'));
CREATE POLICY "Admins can manage all KYC" ON kyc_verifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_kyc_user ON kyc_verifications (user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications (status) WHERE status = 'pending';

-- ============================================
-- 23. Work Photos (施工写真 — プロの実績ポートフォリオ)
-- ============================================
CREATE TABLE work_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES profiles(id),
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_public BOOLEAN DEFAULT FALSE,  -- プロの施工履歴として公開するか
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE work_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public work photos" ON work_photos FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Pros can manage own work photos" ON work_photos FOR ALL USING (auth.uid() = pro_id);
CREATE POLICY "Customers can view photos of own orders" ON work_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins can manage all work photos" ON work_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_work_photos_pro ON work_photos (pro_id) WHERE is_public = TRUE;
CREATE INDEX idx_work_photos_order ON work_photos (order_id);

-- ============================================
-- 24. Ads (広告)
-- ============================================
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 広告主
  advertiser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  advertiser_type TEXT NOT NULL CHECK (advertiser_type IN ('pro', 'external', 'admin')),
  -- 広告内容
  ad_type TEXT NOT NULL CHECK (ad_type IN ('pro_promotion', 'banner', 'sponsored', 'in_feed')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  cta_text TEXT DEFAULT 'もっと見る',
  -- ターゲティング
  placement TEXT NOT NULL CHECK (placement IN ('home_top', 'home_feed', 'search_top', 'order_complete', 'pro_list')),
  target_area TEXT,               -- 地域ターゲティング（例: '東京都', '大阪府'）
  target_category_id TEXT REFERENCES service_categories(id),
  -- 掲載プラン（プロ自己宣伝用）
  plan_id TEXT,
  -- 課金
  pricing_model TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'cpc', 'cpm')),
  price INT NOT NULL DEFAULT 0,
  budget_limit INT,               -- 予算上限（CPC/CPMの場合）
  -- 配信期間
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'active', 'paused', 'expired', 'completed')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  -- 決済
  stripe_payment_intent_id TEXT,
  -- 統計
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  --
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active ads" ON ads FOR SELECT USING (status = 'active');
CREATE POLICY "Advertisers can manage own ads" ON ads FOR ALL USING (auth.uid() = advertiser_id);
CREATE POLICY "Admins can manage all ads" ON ads FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX idx_ads_placement ON ads (placement, status) WHERE status = 'active';
CREATE INDEX idx_ads_advertiser ON ads (advertiser_id);
CREATE INDEX idx_ads_expires ON ads (expires_at) WHERE status = 'active';

-- 広告クリック/インプレッション計測
CREATE TABLE ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click', 'dismiss')),
  placement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all ad events" ON ad_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Advertisers can view own ad events" ON ad_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE id = ad_id AND advertiser_id = auth.uid())
);
-- Insert is allowed for tracking (service role handles this)

CREATE INDEX idx_ad_events_ad ON ad_events (ad_id, event_type);
CREATE INDEX idx_ad_events_date ON ad_events (created_at);

-- ============================================
-- 25. Push Notification Tokens (デバイストークン)
-- ============================================
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tokens" ON push_tokens FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_push_tokens_user ON push_tokens (user_id) WHERE active = TRUE;

-- ============================================
-- 26. Vehicles (車両管理)
-- ============================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- ニックネーム（例: "マイカー"）
  make TEXT,                             -- メーカー（例: "トヨタ"）
  model TEXT,                            -- 車種（例: "プリウス"）
  year INT,
  color TEXT,
  license_plate TEXT,
  size TEXT NOT NULL CHECK (size IN ('kei', 'compact', 'sedan', 'suv', 'minivan', 'wagon', 'truck', 'luxury')),
  photo_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = owner_id);

CREATE INDEX idx_vehicles_owner ON vehicles (owner_id);

-- ============================================
-- 27. Estimates (見積もり)
-- ============================================
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID REFERENCES vehicles(id),
  menu_ids UUID[],
  vehicle_size TEXT NOT NULL,
  dirt_level TEXT NOT NULL CHECK (dirt_level IN ('light', 'moderate', 'heavy', 'extreme')),
  base_price INT NOT NULL,
  size_multiplier DOUBLE PRECISION DEFAULT 1.0,
  dirt_multiplier DOUBLE PRECISION DEFAULT 1.0,
  final_price INT NOT NULL,
  -- 指名料
  nominated_pro_id UUID REFERENCES profiles(id),
  nomination_fee INT DEFAULT 0,
  -- ステータス
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'expired', 'ordered')),
  order_id UUID REFERENCES orders(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can manage own estimates" ON estimates FOR ALL USING (auth.uid() = customer_id);

-- ============================================
-- 28. GPS Tracking (リアルタイム位置追跡)
-- ============================================
CREATE TABLE gps_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES profiles(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  eta_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gps_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pros can insert own GPS" ON gps_tracks FOR INSERT WITH CHECK (auth.uid() = pro_id);
CREATE POLICY "Order participants can view GPS" ON gps_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_id AND (customer_id = auth.uid() OR pro_id = auth.uid()))
);

CREATE INDEX idx_gps_tracks_order ON gps_tracks (order_id, created_at DESC);

-- ============================================
-- 29. Referrals (紹介プログラム)
-- ============================================
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  uses INT DEFAULT 0,
  max_uses INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referee_id UUID NOT NULL REFERENCES profiles(id),
  referrer_reward_points INT NOT NULL,
  referee_reward_points INT NOT NULL,
  referee_coupon_id UUID REFERENCES coupons(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referee_id)  -- 1人1回のみ利用可
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referral code" ON referral_codes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referral uses" ON referral_uses FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- ============================================
-- 30. Favorite Pros (お気に入りプロ + 指名)
-- ============================================
CREATE TABLE favorite_pros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, pro_id)
);

ALTER TABLE favorite_pros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can manage own favorites" ON favorite_pros FOR ALL USING (auth.uid() = customer_id);

CREATE INDEX idx_favorite_pros_customer ON favorite_pros (customer_id);

-- ============================================
-- 31. Corporate Accounts (法人アカウント)
-- ============================================
CREATE TABLE corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id),
  company_name TEXT NOT NULL,
  company_address TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  tax_id TEXT,                          -- 法人番号
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly')),
  discount_percent INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE corporate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corporate_id, user_id)
);

CREATE TABLE corporate_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  department TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corporate admins can manage" ON corporate_accounts FOR ALL USING (auth.uid() = admin_user_id);
CREATE POLICY "Members can view own corporate" ON corporate_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all corporate" ON corporate_accounts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 32. Group Bookings (グループ予約)
-- ============================================
CREATE TABLE group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT,                            -- 例: "マンション駐車場 一括洗車"
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  location_address TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  discount_percent INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE group_booking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  vehicle_id UUID REFERENCES vehicles(id),
  menu_id UUID REFERENCES menus(id),
  amount INT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_booking_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizers can manage groups" ON group_bookings FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Participants can view own entries" ON group_booking_entries FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Participants can manage own entries" ON group_booking_entries FOR ALL USING (auth.uid() = customer_id);

-- ============================================
-- 33. Pro Skill Badges (スキルバッジ)
-- ============================================
CREATE TABLE pro_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pro_id, badge_id)
);

ALTER TABLE pro_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON pro_badges FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage badges" ON pro_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 34. Area Expansion Requests (エリア拡大リクエスト)
-- ============================================
CREATE TABLE area_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  prefecture TEXT,
  city TEXT,
  votes INT DEFAULT 1,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'planned', 'launched', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE area_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view area requests" ON area_requests FOR SELECT USING (TRUE);
CREATE POLICY "Users can create requests" ON area_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_area_requests_location ON area_requests (prefecture, city);

-- ============================================
-- 35. Realtime subscriptions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pro_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE gps_tracks;

-- ============================================
-- 11. Helper functions
-- ============================================

-- Auto-cancel orders after 5 min with no acceptance
-- (Run via pg_cron or Supabase Edge Function scheduled)
CREATE OR REPLACE FUNCTION auto_cancel_expired_requests()
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET status = 'auto_cancelled_no_response',
      cancelled_at = NOW(),
      cancelled_by = 'system'
  WHERE status IN ('requested', 'requested_expanded')
    AND requested_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-complete orders 30 min after pro marks done
CREATE OR REPLACE FUNCTION auto_complete_unconfirmed_orders()
RETURNS void AS $$
BEGIN
  UPDATE orders
  SET status = 'auto_completed',
      auto_completed_at = NOW(),
      completed_at = NOW()
  WHERE status = 'pro_marked_done'
    AND pro_completed_at < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Evaluate improvement plans (run daily via pg_cron)
CREATE OR REPLACE FUNCTION evaluate_improvement_plans()
RETURNS void AS $$
DECLARE
  plan RECORD;
  avg_rating DOUBLE PRECISION;
  order_count INT;
BEGIN
  FOR plan IN
    SELECT ip.*, pp.id AS pro_id
    FROM improvement_plans ip
    JOIN pro_profiles pp ON pp.id = ip.pro_id
    WHERE ip.status IN ('active', 'extended')
      AND ip.evaluation_at <= NOW()
  LOOP
    -- Get current average rating
    SELECT COALESCE(AVG(r.rating), 0), COUNT(*)
    INTO avg_rating, order_count
    FROM reviews r
    WHERE r.target_id = plan.pro_id
      AND r.created_at >= plan.started_at;

    IF avg_rating >= plan.target_rating AND order_count >= 5 THEN
      -- Passed: restore normal status
      UPDATE improvement_plans SET status = 'passed', rating_at_end = avg_rating, orders_completed = order_count, resolved_at = NOW() WHERE id = plan.id;
      UPDATE pro_profiles SET improvement_status = 'passed', improvement_started_at = NULL WHERE id = plan.pro_id;
    ELSIF plan.extension_count < 1 THEN
      -- Allow one extension
      UPDATE improvement_plans SET status = 'extended', extension_count = plan.extension_count + 1, evaluation_at = NOW() + INTERVAL '30 days' WHERE id = plan.id;
      UPDATE pro_profiles SET improvement_status = 'extended', improvement_extension_count = plan.extension_count + 1 WHERE id = plan.pro_id;
    ELSE
      -- Failed: flag for forced removal
      UPDATE improvement_plans SET status = 'failed', rating_at_end = avg_rating, orders_completed = order_count, resolved_at = NOW() WHERE id = plan.id;
      UPDATE pro_profiles SET improvement_status = 'failed', suspended = TRUE, removed_at = NOW(), removal_reason = '改善プラン未達成による強制退会', removal_cooldown_until = NOW() + INTERVAL '90 days' WHERE id = plan.pro_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire boost plans (run daily via pg_cron)
CREATE OR REPLACE FUNCTION expire_boosts()
RETURNS void AS $$
BEGIN
  UPDATE boost_purchases SET status = 'expired' WHERE status = 'active' AND expires_at < NOW();
  UPDATE pro_profiles SET boost_plan_id = NULL, boost_started_at = NULL, boost_expires_at = NULL WHERE boost_expires_at IS NOT NULL AND boost_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check overdue cash invoices and suspend pros
CREATE OR REPLACE FUNCTION check_overdue_cash_invoices()
RETURNS void AS $$
BEGIN
  -- Mark overdue
  UPDATE cash_ledger
  SET status = 'overdue', updated_at = NOW()
  WHERE status = 'invoiced'
    AND invoice_due_date < CURRENT_DATE
    AND NOT invoice_paid;

  -- Suspend pros with overdue invoices
  UPDATE pro_profiles
  SET suspended = TRUE, cash_enabled = FALSE
  WHERE id IN (
    SELECT DISTINCT pro_id FROM cash_ledger WHERE status = 'overdue'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment ad impressions (called via supabase.rpc)
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads SET impressions = impressions + 1 WHERE id = ad_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads SET clicks = clicks + 1 WHERE id = ad_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire ads past their end date (run daily via pg_cron)
CREATE OR REPLACE FUNCTION expire_ads()
RETURNS void AS $$
BEGIN
  UPDATE ads SET status = 'expired', updated_at = NOW() WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
