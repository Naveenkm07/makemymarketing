-- IoT Screen Client Migration

-- 1. Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text UNIQUE NOT NULL, -- Hardware UUID or Browser Fingerprint
  screen_id uuid REFERENCES screens(id), -- Nullable until paired
  pairing_code text, -- 6-digit code for registration
  status text DEFAULT 'pending', -- pending, active, offline, blocked
  ip_address text,
  user_agent text,
  last_seen timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create device_logs table (Detailed hardware logs)
CREATE TABLE IF NOT EXISTS device_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE NOT NULL,
  level text DEFAULT 'info', -- info, warn, error
  message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. RLS Policies

-- Devices:
-- Only admins/owners should see devices? Or devices themselves?
-- Devices authenticate via Header 'x-device-token' which maps to a device record?
-- For MVP, we might use a simple API key or just the device_id if trusted network, 
-- but better to issue a secure token after pairing.
-- Let's add a 'token' column to devices for secure access.

ALTER TABLE devices ADD COLUMN IF NOT EXISTS token text;

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Admins can view all devices
CREATE POLICY "Admins manage devices" ON devices FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Owners can view devices linked to their screens
CREATE POLICY "Owners view own devices" ON devices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM screens WHERE id = devices.screen_id AND owner_id = auth.uid())
);

-- Service Role (API) has full access, so effective RLS for devices is moot if we use Service Role in API routes.
-- We'll use Service Role in `/api/iot/*` routes for device interactions to avoid complex RLS for non-user entities.

-- Device Logs:
ALTER TABLE device_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view logs" ON device_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
