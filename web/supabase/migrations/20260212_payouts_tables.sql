-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES profiles(id) NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  commission numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, paid, failed
  period_start date,
  period_end date,
  provider_ref text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create owner_bank_accounts table
CREATE TABLE IF NOT EXISTS owner_bank_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES profiles(id) NOT NULL UNIQUE,
  bank_name text NOT NULL,
  account_last4 text NOT NULL,
  ifsc text NOT NULL,
  upi_id text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for payouts
CREATE POLICY "Owners see own payouts" ON payouts 
  FOR SELECT USING (owner_id = auth.uid());

-- Policies for owner_bank_accounts
CREATE POLICY "Owners see own bank" ON owner_bank_accounts 
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners manage own bank" ON owner_bank_accounts 
  FOR ALL USING (owner_id = auth.uid());
