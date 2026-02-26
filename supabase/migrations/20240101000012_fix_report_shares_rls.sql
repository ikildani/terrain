-- Fix #24: Add missing INSERT/DELETE policies to report_shares
-- Currently only has a SELECT policy

-- Allow report owners to create share records
CREATE POLICY "Report owners can create shares"
  ON public.report_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.reports WHERE id = report_id)
  );

-- Allow report owners to revoke shares
CREATE POLICY "Report owners can delete shares"
  ON public.report_shares
  FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM public.reports WHERE id = report_id)
  );
