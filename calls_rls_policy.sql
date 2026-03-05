ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calls from their communities"
ON calls FOR SELECT
USING (
    auth.uid() IN (
        SELECT user_id FROM community_members 
        WHERE community_id = calls.community_id
    )
);

CREATE POLICY "Users can create calls in their communities"
ON calls FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM community_members 
        WHERE community_id = community_id
    )
);

CREATE POLICY "Users can update calls in their communities"
ON calls FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM community_members 
        WHERE community_id = calls.community_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM community_members 
        WHERE community_id = calls.community_id
    )
);

CREATE POLICY "Users can delete calls from their communities"
ON calls FOR DELETE
USING (
    auth.uid() IN (
        SELECT user_id FROM community_members 
        WHERE community_id = calls.community_id
    )
);
