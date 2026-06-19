-- Moderation System Migration

-- Create moderation_logs table for audit trail
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  action VARCHAR(50) CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged')),
  reason TEXT,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add columns to providers table if they don't exist
ALTER TABLE providers ADD COLUMN IF NOT EXISTS (
  rejection_reason TEXT,
  moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'))
);

-- Add flagged_for_moderation if missing
ALTER TABLE providers ADD COLUMN IF NOT EXISTS (
  flagged_for_moderation BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderation_logs_admin ON moderation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_provider ON moderation_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_action ON moderation_logs(action);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created ON moderation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_providers_moderation_status ON providers(moderation_status);
CREATE INDEX IF NOT EXISTS idx_providers_flagged ON providers(flagged_for_moderation);

-- Enable RLS
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view moderation logs
CREATE POLICY "Admins can view moderation logs"
  ON moderation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Admins can create moderation logs
CREATE POLICY "Admins can create moderation logs"
  ON moderation_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Create function to get moderation stats
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE(pending BIGINT, flagged BIGINT, approved BIGINT, rejected BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM providers WHERE moderation_status = 'pending')::BIGINT as pending,
    (SELECT COUNT(*) FROM providers WHERE flagged_for_moderation = true)::BIGINT as flagged,
    (SELECT COUNT(*) FROM providers WHERE moderation_status = 'approved')::BIGINT as approved,
    (SELECT COUNT(*) FROM providers WHERE moderation_status = 'rejected')::BIGINT as rejected;
END;
$$ LANGUAGE plpgsql;

-- Create moderation queue view
CREATE OR REPLACE VIEW moderation_queue AS
SELECT 
  p.id,
  p.name,
  p.email,
  p.age,
  p.phone,
  p.city,
  p.state,
  p.rates_per_hour,
  p.description,
  p.moderation_status,
  p.flagged_for_moderation,
  p.created_at,
  COUNT(pi.id) as photo_count
FROM providers p
LEFT JOIN provider_images pi ON p.id = pi.provider_id
WHERE p.moderation_status = 'pending' OR p.flagged_for_moderation = true
GROUP BY p.id
ORDER BY p.created_at ASC;

