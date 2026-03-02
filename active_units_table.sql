-- Create active_units table
CREATE TABLE IF NOT EXISTS public.active_units (
  id TEXT PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  callsign VARCHAR(50) NOT NULL,
  rank VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT '10-8',
  subdivision VARCHAR(100) DEFAULT 'None',
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS active_units_community_id_idx ON public.active_units(community_id);
CREATE INDEX IF NOT EXISTS active_units_status_idx ON public.active_units(status);
CREATE INDEX IF NOT EXISTS active_units_user_id_idx ON public.active_units(user_id);
