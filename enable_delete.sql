-- Complete fix to enable deletion

-- Step 1: Drop all existing RLS policies on communities
DROP POLICY IF EXISTS "Enable read access for all users" ON communities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON communities;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON communities;
DROP POLICY IF EXISTS "communities_select_all" ON communities;
DROP POLICY IF EXISTS "communities_insert_auth" ON communities;
DROP POLICY IF EXISTS "communities_update_owner" ON communities;
DROP POLICY IF EXISTS "communities_delete_auth" ON communities;

-- Step 2: Disable RLS entirely on communities table
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant all permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON communities TO authenticated, anon, postgres;

-- Done - you can now delete communities
SELECT 'Communities table is now open for deletion' as status;
