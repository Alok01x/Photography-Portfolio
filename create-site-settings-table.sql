-- Site Settings Table
-- This table stores all customizable site-wide settings
-- It's designed as a single-row table (only one settings record)

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  
  -- Profile Section
  profile_image_url TEXT,
  profile_name TEXT DEFAULT 'Your Name',
  profile_bio TEXT DEFAULT 'Photographer & Visual Artist',
  
  -- Hero Section
  hero_background_url TEXT,
  hero_title TEXT DEFAULT 'The Art of Seeing.',
  hero_subtitle TEXT DEFAULT 'Narrating the silent beauty of existence through light, shadow, and soul.',
  
  -- About Page
  about_content TEXT DEFAULT 'Share your story here...',
  about_image_url TEXT,
  
  -- Contact Page
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  
  -- Social Media Links
  social_instagram TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings row if it doesn't exist
INSERT INTO site_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at 
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings
CREATE POLICY "Allow public read access" ON site_settings
FOR SELECT USING (true);

-- Policy: Only authenticated users can update (for admin)
CREATE POLICY "Allow authenticated update access" ON site_settings
FOR UPDATE USING (auth.role() = 'authenticated');
