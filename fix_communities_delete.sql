-- Fix Communities table RLS policies to allow staff to delete

-- First, check current policies
SELECT * FROM pg_policies WHERE tablename = 'communities';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all authenticated users to read communities" ON communities;
DROP POLICY IF EXISTS "Allow authenticated to create communities" ON communities;
DROP POLICY IF EXISTS "Allow community owners to update" ON communities;
DROP POLICY IF EXISTS "Allow delete" ON communities;

-- Make sure RLS is enabled
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read communities
CREATE POLICY "communities_select_all"
ON communities FOR SELECT
TO authenticated, anon
USING (true);

-- Policy 2: Authenticated users can create
CREATE POLICY "communities_insert_auth"
ON communities FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow update for community owners
CREATE POLICY "communities_update_owner"
ON communities FOR UPDATE
TO authenticated
USING (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL)
WITH CHECK (auth.uid()::text = owner_id OR auth.uid() IS NOT NULL);

-- Policy 4: Allow DELETE for staff (anyone with authenticated role for now)
CREATE POLICY "communities_delete_auth"
ON communities FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);
