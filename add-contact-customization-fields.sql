-- Add missing contact page customization fields to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'Get in Touch',
ADD COLUMN IF NOT EXISTS contact_subtitle TEXT DEFAULT 'Whether you''re interested in a collaboration, print sales, or just want to say hello.',
ADD COLUMN IF NOT EXISTS contact_insta_qr_url TEXT;
