-- Add category column to photos table
ALTER TABLE photos ADD COLUMN IF NOT EXISTS category TEXT;

-- Update existing photos to have a default category if needed
UPDATE photos SET category = 'Uncategorized' WHERE category IS NULL;
