-- Add public SELECT policy on users table so the creators directory
-- and other public-facing queries can read full_name & avatar_url.
-- RLS policies are OR'd together, so the existing per-user policy
-- is preserved but superseded for the public case.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Anyone can view public user info') THEN
    CREATE POLICY "Anyone can view public user info"
      ON public.users FOR SELECT
      USING (TRUE);
  END IF;
END;
$$;
