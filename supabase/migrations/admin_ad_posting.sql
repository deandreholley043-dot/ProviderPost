-- ADMIN-ONLY AD POSTING SYSTEM
-- Completely isolated from user ad posting
-- No modifications to existing verification systems

-- Add admin_created flag to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS (
  admin_created BOOLEAN DEFAULT false,
  admin_created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_created_at TIMESTAMP,
  admin_notes TEXT
);

-- Create audit log table for admin ad actions
CREATE TABLE IF NOT EXISTS admin_ad_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  action VARCHAR(50) CHECK (action IN (
    'created', 'updated', 'deleted', 'renewed', 
    'paused', 'resumed', 'image_added', 'image_removed'
  )),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_admin_created ON providers(admin_created);
CREATE INDEX IF NOT EXISTS idx_providers_admin_created_by ON providers(admin_created_by);
CREATE INDEX IF NOT EXISTS idx_admin_ad_audit_log_admin_id ON admin_ad_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_ad_audit_log_provider_id ON admin_ad_audit_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_admin_ad_audit_log_action ON admin_ad_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_ad_audit_log_created_at ON admin_ad_audit_log(created_at);

-- Enable RLS
ALTER TABLE admin_ad_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON admin_ad_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Only admins can create audit logs
CREATE POLICY "Only admins can create audit logs"
  ON admin_ad_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Function to log admin ad actions
CREATE OR REPLACE FUNCTION log_admin_ad_action(
  p_admin_id UUID,
  p_provider_id UUID,
  p_action VARCHAR,
  p_details JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_ad_audit_log (admin_id, provider_id, action, details)
  VALUES (p_admin_id, p_provider_id, p_action, p_details);
END;
$$ LANGUAGE plpgsql;

-- Function to check if ad is admin-created
CREATE OR REPLACE FUNCTION is_admin_created_ad(p_provider_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_ad BOOLEAN;
BEGIN
  SELECT admin_created INTO is_admin_ad FROM providers WHERE id = p_provider_id;
  RETURN COALESCE(is_admin_ad, false);
END;
$$ LANGUAGE plpgsql;

