-- Auto Detail Pro - Supabase Database Schema
-- Run this in your Supabase SQL Editor

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

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Anyone can view active categories" ON service_categories
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage categories" ON service_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default categories
INSERT INTO service_categories (id, name, description, icon, color, sort_order) VALUES
  ('exterior', '外装洗車', '手洗い洗車・ワックスがけ', 'car-wash', '#3B82F6', 1),
  ('interior', '内装クリーニング', 'シート・ダッシュボード・フロアマット', 'car-seat', '#8B5CF6', 2),
  ('coating', 'コーティング', 'ガラスコーティング・セラミック', 'shield-check', '#F59E0B', 3),
  ('polish', '磨き・研磨', '傷消し・ポリッシュ・鏡面仕上げ', 'auto-fix', '#EC4899', 4),
  ('full_detail', 'フルディテイル', '外装＋内装＋コーティングのフルコース', 'star-circle', '#1B4332', 5),
  ('engine', 'エンジンルーム', 'エンジンルーム洗浄・美装', 'engine', '#EF4444', 6);

-- ============================================
-- 3. Pro Profiles (extends profiles for pros)
-- ============================================
CREATE TABLE pro_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  bio TEXT,
  payout_schedule TEXT DEFAULT 'weekly' CHECK (payout_schedule IN ('instant', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pro_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros can manage own pro profile" ON pro_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Customers can view online pros" ON pro_profiles
  FOR SELECT USING (is_online = TRUE);

CREATE POLICY "Admins can view all pros" ON pro_profiles
  FOR SELECT USING (
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

CREATE POLICY "Anyone can view active menus" ON menus
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Pros can manage own menus" ON menus
  FOR ALL USING (auth.uid() = pro_id);

CREATE POLICY "Admins can view all menus" ON menus
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 5. Orders
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID REFERENCES profiles(id),
  menu_id UUID REFERENCES menus(id),
  category_id TEXT REFERENCES service_categories(id),
  status TEXT NOT NULL DEFAULT 'searching'
    CHECK (status IN ('searching', 'accepted', 'arriving', 'in_progress', 'pending_confirm', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('online', 'cash')),
  amount INT NOT NULL CHECK (amount > 0),
  customer_latitude DOUBLE PRECISION,
  customer_longitude DOUBLE PRECISION,
  customer_address TEXT,
  customer_confirmed BOOLEAN DEFAULT FALSE,
  pro_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Pros can view assigned orders" ON orders
  FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Pros can update assigned orders" ON orders
  FOR UPDATE USING (auth.uid() = pro_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 6. Reviews
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pro_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Customers can create reviews for own orders" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros can view own payouts" ON payouts
  FOR SELECT USING (auth.uid() = pro_id);

CREATE POLICY "Admins can manage all payouts" ON payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 8. Realtime subscriptions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pro_profiles;
