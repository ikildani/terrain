-- Fix #1: subscriptions RLS policy — restrict to service_role
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix #2: profiles open INSERT policy — restrict to own user
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
CREATE POLICY "Allow profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix #3: stripe_events RLS policy — restrict to service_role
CREATE POLICY "Service role only"
  ON public.stripe_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
