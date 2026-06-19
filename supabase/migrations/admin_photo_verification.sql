-- Migration: Admin Photo Verification Override
-- Allow admins to bypass photo verification

-- Add columns to provider_images table
ALTER TABLE provider_images ADD COLUMN IF NOT EXISTS (
  manually_verified BOOLEAN DEFAULT false,
  manually_verified_by UUID REFERENCES users(id),
  manually_verified_at TIMESTAMP,
  verification_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_provider_images_manually_verified 
ON provider_images(manually_verified);

CREATE INDEX IF NOT EXISTS idx_provider_images_verified_by 
ON provider_images(manually_verified_by);

-- Create admin_actions audit log table
CREATE TABLE IF NOT EXISTS admin_photo_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  photo_id UUID REFERENCES provider_images(id) ON DELETE CASCADE,
  action VARCHAR(50) CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged')),
  reason TEXT,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for admin actions
CREATE INDEX idx_admin_photo_actions_admin ON admin_photo_actions(admin_id);
CREATE INDEX idx_admin_photo_actions_photo ON admin_photo_actions(photo_id);
CREATE INDEX idx_admin_photo_actions_created ON admin_photo_actions(created_at);

-- Enable RLS for audit log
ALTER TABLE admin_photo_actions ENABLE ROW LEVEL SECURITY;

-- Admin can view photo actions
CREATE POLICY "Admins can view photo actions"
  ON admin_photo_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Admin can create photo actions
CREATE POLICY "Admins can create photo actions"
  ON admin_photo_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );
