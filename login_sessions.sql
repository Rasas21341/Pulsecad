-- Create login_sessions table to track logged-in users
CREATE TABLE login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
