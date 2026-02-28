-- Add banner_url column to communities table
-- This stores the URL to the banner image from Supabase Storage

ALTER TABLE communities ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Optional: Add a created_at timestamp for when banner was uploaded
ALTER TABLE communities ADD COLUMN IF NOT EXISTS banner_updated_at TIMESTAMP DEFAULT NOW();

-- If you need to reset banner for a specific community, use:
-- UPDATE communities SET banner_url = NULL WHERE id = 'your-community-id';

-- To view all communities with their banners:
-- SELECT id, name, banner_url FROM communities;
