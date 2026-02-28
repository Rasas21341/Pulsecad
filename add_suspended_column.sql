-- Add suspended column to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE;

-- To suspend a community:
-- UPDATE communities SET suspended = TRUE WHERE id = 'community-id';

-- To unsuspend a community:
-- UPDATE communities SET suspended = FALSE WHERE id = 'community-id';
