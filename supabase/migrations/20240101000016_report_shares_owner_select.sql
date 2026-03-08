-- Migration 016: Allow report owners to view shares for their own reports
-- Currently, only shared_with_user_id can SELECT from report_shares.
-- Report owners need to see shares to manage them (list, revoke).

CREATE POLICY "Report owners can view shares for their reports"
  ON public.report_shares
  FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.reports WHERE id = report_id)
  );
