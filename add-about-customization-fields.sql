-- Add about page customization fields to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS about_title TEXT DEFAULT 'About Me',
ADD COLUMN IF NOT EXISTS about_subtitle TEXT DEFAULT 'The Story',
ADD COLUMN IF NOT EXISTS about_stats_exp TEXT DEFAULT '10+',
ADD COLUMN IF NOT EXISTS about_stats_locations TEXT DEFAULT '50+',
ADD COLUMN IF NOT EXISTS about_stats_captures TEXT DEFAULT '1M+';
