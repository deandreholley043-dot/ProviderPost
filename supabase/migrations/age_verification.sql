-- AGE VERIFICATION SYSTEM
-- Allows admins to verify user age via ID upload

-- Create age_verifications table
CREATE TABLE IF NOT EXISTS age_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Document info
  document_type VARCHAR(50) CHECK (document_type IN ('drivers_license', 'passport', 'state_id')),
  document_url TEXT, -- S3/R2 URL to uploaded document
  document_file_name TEXT,
  document_size INT, -- File size in bytes
  
  -- Verification details
  verified_date_of_birth DATE,
  verified_age INT,
  
  -- Admin review
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Compliance
  verification_expiry_date TIMESTAMP, -- When verification expires (1 year)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit log for verifications
CREATE TABLE IF NOT EXISTS age_verification_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES age_verifications(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) CHECK (action IN ('submitted', 'approved', 'rejected', 'expired', 'deleted')),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create badge table for verified users
CREATE TABLE IF NOT EXISTS user_verification_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) DEFAULT 'age_verified',
  verified_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add verification status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS (
  age_verified BOOLEAN DEFAULT false,
  age_verified_at TIMESTAMP,
  age_verification_expires_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_age_verifications_user_id ON age_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verifications_status ON age_verifications(status);
CREATE INDEX IF NOT EXISTS idx_age_verifications_reviewed_by ON age_verifications(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_age_verification_audit_log_admin_id ON age_verification_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_age_verification_audit_log_action ON age_verification_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_user_verification_badges_user_id ON user_verification_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_badges_is_active ON user_verification_badges(is_active);

-- Enable RLS
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verification_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view their own verification
CREATE POLICY "Users can view their own verification"
  ON age_verifications FOR SELECT
  USING (user_id = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'));

-- RLS Policies: Users can insert their own verification
CREATE POLICY "Users can submit verification"
  ON age_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies: Admins can update verifications
CREATE POLICY "Admins can update verifications"
  ON age_verifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'));

-- RLS Policies: Only admins view audit logs
CREATE POLICY "Only admins view audit logs"
  ON age_verification_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'));

-- RLS Policies: Badge visibility
CREATE POLICY "Badge visibility"
  ON user_verification_badges FOR SELECT
  USING (user_id = auth.uid()::text OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'admin'));

-- Function to log verification events
CREATE OR REPLACE FUNCTION log_age_verification_event(
  p_verification_id UUID,
  p_admin_id UUID,
  p_action VARCHAR,
  p_details JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO age_verification_audit_log (verification_id, admin_id, action, details)
  VALUES (p_verification_id, p_admin_id, p_action, p_details);
END;
$$ LANGUAGE plpgsql;

-- Function to approve verification
CREATE OR REPLACE FUNCTION approve_age_verification(
  p_verification_id UUID,
  p_admin_id UUID,
  p_dob DATE
)
RETURNS void AS $$
BEGIN
  -- Update verification
  UPDATE age_verifications
  SET status = 'approved',
      verified_date_of_birth = p_dob,
      verified_age = DATE_PART('year', age(p_dob)),
      reviewed_by = p_admin_id,
      reviewed_at = NOW(),
      verification_expiry_date = NOW() + INTERVAL '1 year'
  WHERE id = p_verification_id;
  
  -- Update user
  UPDATE users
  SET age_verified = true,
      age_verified_at = NOW(),
      age_verification_expires_at = NOW() + INTERVAL '1 year'
  WHERE id = (SELECT user_id FROM age_verifications WHERE id = p_verification_id);
  
  -- Create badge
  INSERT INTO user_verification_badges (user_id, verified_at, expires_at)
  SELECT user_id, NOW(), NOW() + INTERVAL '1 year'
  FROM age_verifications
  WHERE id = p_verification_id
  ON CONFLICT (user_id) DO UPDATE SET
    verified_at = NOW(),
    expires_at = NOW() + INTERVAL '1 year',
    is_active = true;
  
  -- Log event
  PERFORM log_age_verification_event(
    p_verification_id,
    p_admin_id,
    'approved',
    jsonb_build_object('dob', p_dob, 'age', DATE_PART('year', age(p_dob)))
  );
END;
$$ LANGUAGE plpgsql;

-- Function to reject verification
CREATE OR REPLACE FUNCTION reject_age_verification(
  p_verification_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE age_verifications
  SET status = 'rejected',
      reviewed_by = p_admin_id,
      reviewed_at = NOW(),
      rejection_reason = p_reason
  WHERE id = p_verification_id;
  
  PERFORM log_age_verification_event(
    p_verification_id,
    p_admin_id,
    'rejected',
    jsonb_build_object('reason', p_reason)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is age verified
CREATE OR REPLACE FUNCTION is_age_verified(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  verified BOOLEAN;
BEGIN
  SELECT age_verified AND (age_verification_expires_at IS NULL OR age_verification_expires_at > NOW())
  INTO verified
  FROM users
  WHERE id = p_user_id;
  
  RETURN COALESCE(verified, false);
END;
$$ LANGUAGE plpgsql;

