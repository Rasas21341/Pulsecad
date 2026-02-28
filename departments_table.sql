-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('police', 'sheriff', 'dispatch')),
  code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(community_id, code)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS departments_community_id_idx ON public.departments(community_id);
