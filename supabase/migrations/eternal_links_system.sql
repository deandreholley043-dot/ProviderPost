-- ETERNAL LINKS ARCHIVAL SYSTEM MIGRATION
-- Complete isolation - no modifications to existing tables

-- Create eternal_links table (archive metadata)
CREATE TABLE IF NOT EXISTS eternal_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., "a7K9xQ"
  original_ad_id UUID NOT NULL, -- Reference to original ad (not FK, for safety)
  original_user_id UUID NOT NULL, -- Original poster
  
  -- Complete archived data snapshot
  archived_data JSONB NOT NULL, -- All ad details as JSON
  
  -- Admin tracking
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- View tracking
  total_views BIGINT DEFAULT 0
);

-- Create eternal_link_views table (view analytics)
CREATE TABLE IF NOT EXISTS eternal_link_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eternal_link_id UUID NOT NULL REFERENCES eternal_links(id) ON DELETE CASCADE,
  
  -- Visitor tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  
  -- Timestamp
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_eternal_links_code ON eternal_links(code);
CREATE INDEX IF NOT EXISTS idx_eternal_links_original_ad_id ON eternal_links(original_ad_id);
CREATE INDEX IF NOT EXISTS idx_eternal_links_admin_id ON eternal_links(admin_id);
CREATE INDEX IF NOT EXISTS idx_eternal_links_status ON eternal_links(status);
CREATE INDEX IF NOT EXISTS idx_eternal_links_created_at ON eternal_links(created_at);

CREATE INDEX IF NOT EXISTS idx_eternal_link_views_eternal_link_id ON eternal_link_views(eternal_link_id);
CREATE INDEX IF NOT EXISTS idx_eternal_link_views_viewed_at ON eternal_link_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_eternal_link_views_ip ON eternal_link_views(ip_address);

-- Enable RLS
ALTER TABLE eternal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE eternal_link_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view eternal links
CREATE POLICY "Only admins can view eternal links"
  ON eternal_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Only admins can insert eternal links
CREATE POLICY "Only admins can create eternal links"
  ON eternal_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Only admins can update eternal links
CREATE POLICY "Only admins can update eternal links"
  ON eternal_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Only admins can delete eternal links
CREATE POLICY "Only admins can delete eternal links"
  ON eternal_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Anyone can view eternal link views (but only admin can see through API)
CREATE POLICY "Views are readable by admins only"
  ON eternal_link_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- RLS Policy: System can insert views
CREATE POLICY "System can insert eternal link views"
  ON eternal_link_views FOR INSERT
  WITH CHECK (true);

-- Function: Generate unique eternal link code
CREATE OR REPLACE FUNCTION generate_eternal_link_code()
RETURNS VARCHAR AS $$
DECLARE
  code VARCHAR;
  attempts INT := 0;
BEGIN
  LOOP
    -- Generate random 8-character code (alphanumeric)
    code := substring(
      encode(gen_random_bytes(6), 'base64'),
      1, 8
    );
    -- Replace special chars
    code := replace(replace(replace(code, '+', 'x'), '/', 'y'), '=', 'z');
    code := substr(code, 1, 8);
    
    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM eternal_links WHERE code = code) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique code';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment view count
CREATE OR REPLACE FUNCTION increment_eternal_link_views(p_code VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE eternal_links 
  SET total_views = total_views + 1 
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql;

