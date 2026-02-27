-- Create Tones Table
CREATE TABLE tones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  audio_data TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  times_played INT DEFAULT 0,
  max_uses INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tones_community_id ON tones(community_id);
CREATE INDEX idx_tones_name ON tones(name);

-- Disable RLS (Optional: Enable after testing)
-- ALTER TABLE tones ENABLE ROW LEVEL SECURITY;

-- If you want to enable RLS, use these policies instead:
-- Create a policy to allow any authenticated user to do all operations
-- (adjust based on your authentication system)

-- ALTER TABLE tones ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "Allow all authenticated users" ON tones
--   FOR ALL
--   USING (auth.uid() IS NOT NULL)
--   WITH CHECK (auth.uid() IS NOT NULL);
