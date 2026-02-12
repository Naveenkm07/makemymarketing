-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- ENUM TYPES
-- =========================
-- Drop existing enum if it exists and recreate with admin role
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('advertiser', 'owner', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'booked', 'running', 'finished', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- PROFILES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  role user_role NOT NULL DEFAULT 'advertiser',
  is_verified BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (id = auth.uid());

DROP POLICY IF EXISTS "Enable insert for authentication" ON profiles;
CREATE POLICY "Enable insert for authentication"
ON profiles
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, company, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'advertiser')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================
-- SCREENS TABLE (OWNER)
-- =========================
CREATE TABLE IF NOT EXISTS screens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  type TEXT DEFAULT 'digital',
  price_per_day NUMERIC(10,2) DEFAULT 0,
  availability BOOLEAN DEFAULT TRUE,
  specs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE screens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage their screens" ON screens;
CREATE POLICY "Owners manage their screens"
ON screens
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Advertisers can view available screens" ON screens;
CREATE POLICY "Advertisers can view available screens"
ON screens
FOR SELECT
USING (availability = true);

-- =========================
-- CAMPAIGNS TABLE (ADVERTISER)
-- =========================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2) DEFAULT 0,
  status campaign_status DEFAULT 'draft',
  target_locations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own campaigns" ON campaigns;
CREATE POLICY "Users can CRUD own campaigns"
ON campaigns
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =========================
-- BOOKINGS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  total_price NUMERIC(10,2) DEFAULT 0,
  status booking_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view related bookings" ON bookings;
CREATE POLICY "Users can view related bookings"
ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = bookings.campaign_id
    AND c.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM screens s
    WHERE s.id = bookings.screen_id
    AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create bookings for own campaigns" ON bookings;
CREATE POLICY "Users can create bookings for own campaigns"
ON bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = bookings.campaign_id
    AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
ON bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = bookings.campaign_id
    AND c.user_id = auth.uid()
  )
);

-- =========================
-- PAYMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
ON payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN campaigns c ON b.campaign_id = c.id
    WHERE b.id = payments.booking_id
    AND c.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN screens s ON b.screen_id = s.id
    WHERE b.id = payments.booking_id
    AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Advertisers can create payments" ON payments;
CREATE POLICY "Advertisers can create payments"
ON payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN campaigns c ON b.campaign_id = c.id
    WHERE b.id = payments.booking_id
    AND c.user_id = auth.uid()
  )
);

-- =========================
-- PLAYBACK LOGS (PROOF OF PLAY)
-- =========================
CREATE TABLE IF NOT EXISTS playback_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  screen_id UUID REFERENCES screens(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration_played INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playback_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners & advertisers view playback logs" ON playback_logs;
CREATE POLICY "Owners & advertisers view playback logs"
ON playback_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM screens s
    WHERE s.id = playback_logs.screen_id
    AND s.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN campaigns c ON b.campaign_id = c.id
    WHERE b.id = playback_logs.booking_id
    AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can create playback logs" ON playback_logs;
CREATE POLICY "Owners can create playback logs"
ON playback_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM screens s
    WHERE s.id = playback_logs.screen_id
    AND s.owner_id = auth.uid()
  )
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_screens_owner_id ON screens(owner_id);
CREATE INDEX IF NOT EXISTS idx_screens_availability ON screens(availability);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_bookings_campaign_id ON bookings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bookings_screen_id ON bookings(screen_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_playback_logs_booking_id ON playback_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_playback_logs_screen_id ON playback_logs(screen_id);
CREATE INDEX IF NOT EXISTS idx_playback_logs_played_at ON playback_logs(played_at);

-- =========================
-- UPDATE TIMESTAMP TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_screens_updated_at ON screens;
CREATE TRIGGER update_screens_updated_at
BEFORE UPDATE ON screens
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- REALTIME SUBSCRIPTIONS
-- =========================
-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE screens;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE playback_logs;
