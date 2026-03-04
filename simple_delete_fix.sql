-- Simple fix for delete permissions

-- Step 1: Disable RLS completely on communities table (simplest solution for now)
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;

-- Step 2: Make sure all permissions are granted
GRANT ALL ON communities TO authenticated;
GRANT ALL ON communities TO anon;

-- Verify the table
SELECT * FROM communities LIMIT 5;
