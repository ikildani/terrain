-- ============================================================
-- Migration 015: Atomic share view count increment
-- Prevents race conditions when multiple viewers hit a share
-- link simultaneously. Uses SECURITY DEFINER to bypass RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_share_view_count(p_share_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.report_public_shares
  SET view_count = view_count + 1,
      updated_at = NOW()
  WHERE id = p_share_id;
$$;
