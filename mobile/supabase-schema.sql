-- =============================================
-- Auto Detail Pro — Supabase Database Schema
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
  ('full_detail', 'フルディテイル', '外装＋内装＋コーティングのフルコース', 'star-circle', '#1B4332', 5),
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
-- 10. Realtime subscriptions
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
