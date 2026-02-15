-- Add missing customization fields to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS gallery_title TEXT DEFAULT 'Shutter Stories & Soulful Shots',
ADD COLUMN IF NOT EXISTS profile_role TEXT DEFAULT 'Founder & Lead Photographer',
ADD COLUMN IF NOT EXISTS profile_label TEXT DEFAULT 'The Visionary',
ADD COLUMN IF NOT EXISTS profile_long_bio TEXT,
ADD COLUMN IF NOT EXISTS profile_expertise TEXT DEFAULT 'Landscape Photography, Architectural Documentation, Cinematic Portraits, Visual Storytelling',
ADD COLUMN IF NOT EXISTS profile_gear JSONB DEFAULT '[
    {"category": "Camera Body", "item": "Sony A7R IV"},
    {"category": "Prime Lenses", "item": "35mm f/1.4, 85mm f/1.4"},
    {"category": "Zoom Lenses", "item": "24-70mm f/2.8, 70-200mm f/2.8"},
    {"category": "Drone", "item": "DJI Mavic 3 Pro"}
]';
