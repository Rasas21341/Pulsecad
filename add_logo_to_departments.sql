-- Add logo_url column to departments table
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Update RLS policies if needed
DROP POLICY IF EXISTS "Allow inserts" ON public.departments;
DROP POLICY IF EXISTS "Allow selects" ON public.departments;

CREATE POLICY "Allow inserts" ON public.departments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow selects" ON public.departments
  FOR SELECT USING (true);

CREATE POLICY "Allow updates" ON public.departments
  FOR UPDATE WITH CHECK (true);

CREATE POLICY "Allow deletes" ON public.departments
  FOR DELETE USING (true);
