-- Admin Control Panel Migration

-- 1. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES profiles(id) NOT NULL,
  action text NOT NULL, -- e.g. "USER_BLOCK", "SCREEN_APPROVE"
  target_type text NOT NULL, -- "user", "screen", "campaign", "finance"
  target_id uuid, -- ID of the target object
  details jsonb, -- Extra data (reason, old_value, new_value)
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create settings table (Global Platform Config)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('commission_rate', '0.15'::jsonb),
('platform_fee', '0'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Create tickets table (Support System)
CREATE TABLE IF NOT EXISTS tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  priority text DEFAULT 'normal', -- low, normal, high, urgent
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false, -- Admin notes
  created_at timestamptz DEFAULT now()
);

-- 5. Alter Screens Table: Add verification status
ALTER TABLE screens ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
-- Note: Existing screens default to false (unverified) or true? Let's default false for safety.
-- Ideally we should auto-verify existing ones if we want.
-- UPD: Let's default to FALSE.

-- 6. Alter Campaigns Table: Add moderation status (optional, using 'status' for now but this is better for explicit approval)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending'; -- pending, approved, rejected
-- Auto-approve for now unless we build the moderation queue immediately. 
-- Let's default to 'approved' to not break existing flow, but for future use 'pending'.
ALTER TABLE campaigns ALTER COLUMN moderation_status SET DEFAULT 'approved';

-- 7. RLS Policies

-- Admin Audit Logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Everyone can read settings" ON settings FOR SELECT TO authenticated USING (true); -- Public/Auth users need to know platform fees? Or maybe just backend. Let's allow auth read.

-- Tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all tickets" ON tickets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update tickets" ON tickets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ticket Messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view messages for own ticket" ON ticket_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Users send messages to own ticket" ON ticket_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Admins manage messages" ON ticket_messages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
