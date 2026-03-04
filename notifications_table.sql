-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'changelog', 'announcement', 'maintenance', 'update'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON notifications;
DROP POLICY IF EXISTS "Allow staff to create notifications" ON notifications;
DROP POLICY IF EXISTS "Allow anyone to insert notifications" ON notifications;

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read notifications
CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT
TO authenticated, anon
USING (true);

-- Allow all authenticated users to insert notifications
CREATE POLICY "notifications_insert_policy"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
