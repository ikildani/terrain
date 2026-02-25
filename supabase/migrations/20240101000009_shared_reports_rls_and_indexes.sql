-- Migration 009: Fix shared report access + add missing indexes
-- Addresses: missing RLS policy for shared reports, missing performance indexes

-- ────────────────────────────────────────────────────────────
-- 1. Allow shared users to read reports they've been granted access to
-- ────────────────────────────────────────────────────────────

-- Drop the existing overly-restrictive policy
DROP POLICY IF EXISTS "Users can CRUD own reports" ON public.reports;

-- Owner retains full CRUD
CREATE POLICY "Users can manage own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Shared users can SELECT reports they have explicit access to
CREATE POLICY "Users can view shared reports"
  ON public.reports FOR SELECT
  USING (
    id IN (
      SELECT report_id FROM public.report_shares
      WHERE shared_with_user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 2. Performance indexes for frequently-queried columns
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id_created
  ON public.usage_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_user_id_created
  ON public.reports(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_shares_shared_user
  ON public.report_shares(shared_with_user_id, report_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);
