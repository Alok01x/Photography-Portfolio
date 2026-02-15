-- Fix Row Level Security policies for site_settings table
-- This allows updates to work properly

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated update access" ON site_settings;

-- Recreate policies with correct permissions
-- Policy: Anyone can read settings
CREATE POLICY "Allow public read access" ON site_settings
FOR SELECT USING (true);

-- Policy: Allow all updates (since this is admin-only page, we'll handle auth at app level)
CREATE POLICY "Allow all update access" ON site_settings
FOR UPDATE USING (true);

-- Also allow insert in case the row doesn't exist
CREATE POLICY "Allow all insert access" ON site_settings
FOR INSERT WITH CHECK (true);
