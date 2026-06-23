-- Fix the RLS policy for creator portfolios to correctly check the creator's user_id.
DROP POLICY IF EXISTS "Authenticated creator can manage own portfolios" ON public.creator_portfolios;

CREATE POLICY "Authenticated creator can manage own portfolios"
  ON public.creator_portfolios
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = creator_portfolios.creator_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.creator_profiles WHERE id = creator_portfolios.creator_id));
