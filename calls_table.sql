DROP TABLE IF EXISTS calls CASCADE;

CREATE TABLE calls (
  id BIGINT PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  number INT NOT NULL DEFAULT 1,
  type VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  postal VARCHAR(50),
  officer_callsign VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX calls_community_idx ON calls(community_id);
CREATE INDEX calls_officer_callsign_idx ON calls(officer_callsign);
CREATE INDEX calls_created_at_idx ON calls(created_at);
