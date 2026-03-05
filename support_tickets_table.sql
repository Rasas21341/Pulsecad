-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
