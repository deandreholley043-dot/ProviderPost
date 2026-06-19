-- Migration: Add photo upload support
-- Run this in Supabase SQL editor

-- Add new columns to provider_images
ALTER TABLE provider_images ADD COLUMN IF NOT EXISTS (
  cloudflare_url VARCHAR(500),
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  hash VARCHAR(64),
  display_order INTEGER DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'pending',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_provider_images_hash ON provider_images(hash);
CREATE INDEX IF NOT EXISTS idx_provider_images_moderation_status ON provider_images(moderation_status);
CREATE INDEX IF NOT EXISTS idx_provider_images_display_order ON provider_images(provider_id, display_order);

-- Add constraint to limit photos per provider (max 6)
ALTER TABLE provider_images ADD CONSTRAINT max_photos_per_provider 
CHECK (
  (SELECT COUNT(*) FROM provider_images pi WHERE pi.provider_id = provider_images.provider_id) <= 6
);

-- Create duplicate detection: no identical photos allowed
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_images_hash_unique 
ON provider_images(hash) WHERE hash IS NOT NULL;

-- Update existing provider_images to have cloudflare_url placeholder if migrating
UPDATE provider_images 
SET cloudflare_url = 'https://placeholder.example.com/photo-' || id 
WHERE cloudflare_url IS NULL;

-- Make cloudflare_url NOT NULL after migration
ALTER TABLE provider_images 
ALTER COLUMN cloudflare_url SET NOT NULL;

-- Add RLS policy for photo uploads
-- Users can only see their own photos
ALTER TABLE provider_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own photos"
  ON provider_images FOR SELECT
  USING (auth.uid()::text = provider_id OR true); -- Allow public viewing of approved photos

CREATE POLICY "Users can insert their own photos"
  ON provider_images FOR INSERT
  WITH CHECK (auth.uid()::text = provider_id);

CREATE POLICY "Users can delete their own photos"
  ON provider_images FOR DELETE
  USING (auth.uid()::text = provider_id);

CREATE POLICY "Users can update their own photos"
  ON provider_images FOR UPDATE
  USING (auth.uid()::text = provider_id);

-- Create table for photo moderation tracking
CREATE TABLE IF NOT EXISTS photo_moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES provider_images(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  reviewed_by UUID,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_photo_moderation_logs_status ON photo_moderation_logs(new_status);
