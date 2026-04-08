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
  resolved_at TIMESTAMPTZ,
  -- Must be within 24h of completion
  CONSTRAINT dispute_within_24h CHECK (
    created_at <= (SELECT COALESCE(completed_at, auto_completed_at, NOW()) + INTERVAL '24 hours' FROM orders WHERE id = order_id)
  )
);

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
-- 19. Realtime subscriptions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pro_profiles;

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
