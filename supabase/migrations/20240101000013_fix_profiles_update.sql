-- Fix #31: Prevent users from self-modifying team_owner_id via direct profile update
-- Drop the existing overly permissive update policy and recreate with column restrictions
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (team_owner_id IS NOT DISTINCT FROM (SELECT team_owner_id FROM public.profiles WHERE id = auth.uid()))
  );
