-- Migration: Add promo code system to Supabase
-- Run this in Supabase SQL Editor

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('days_free', 'weeks_free', 'months_free', 'years_free', 'percent_discount')),
  value INTEGER NOT NULL CHECK (value > 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  expires_at TIMESTAMP,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

-- Create promo_redemptions table (track who used what)
CREATE TABLE IF NOT EXISTS promo_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- when free period ends (null for percent discounts)
  UNIQUE(user_id, promo_id) -- prevent using same code twice
);

-- Create indexes for faster queries
CREATE INDEX idx_promo_codes_active ON promo_codes(active) WHERE active = true;
CREATE INDEX idx_promo_codes_expiry ON promo_codes(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_redemptions_user ON promo_redemptions(user_id);
CREATE INDEX idx_promo_redemptions_promo ON promo_redemptions(promo_id);

-- Create audit table for promo modifications
CREATE TABLE IF NOT EXISTS promo_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(20) NOT NULL, -- 'created', 'updated', 'deleted', 'redeemed'
  promo_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes

-- Everyone can view active promo codes (for checkout)
CREATE POLICY "Anyone can view active promos"
  ON promo_codes FOR SELECT
  USING (active = true);

-- Only admins can create/edit/delete promos
CREATE POLICY "Only admins can create promos"
  ON promo_codes FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'));

CREATE POLICY "Only admins can update promos"
  ON promo_codes FOR UPDATE
  USING (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'))
  WITH CHECK (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'));

CREATE POLICY "Only admins can delete promos"
  ON promo_codes FOR DELETE
  USING (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'));

-- RLS Policies for promo_redemptions

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own redemptions
CREATE POLICY "Users can redeem promos"
  ON promo_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON promo_redemptions FOR SELECT
  USING (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'));

-- RLS Policies for audit logs

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON promo_audit_logs FOR SELECT
  USING (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'admin'));

-- Anyone can insert to audit logs (for tracking)
CREATE POLICY "Anyone can create audit logs"
  ON promo_audit_logs FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON promo_codes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON promo_codes TO authenticated;
GRANT SELECT, INSERT ON promo_redemptions TO authenticated;
GRANT SELECT ON promo_audit_logs TO authenticated;
