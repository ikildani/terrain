-- ============================================================
-- Migration 014: Public Report Sharing
-- Adds report_public_shares table for shareable link tokens
-- ============================================================

CREATE TABLE IF NOT EXISTS public.report_public_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  allow_download BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.report_public_shares ENABLE ROW LEVEL SECURITY;

-- Only report creators can manage their public shares
CREATE POLICY "Owners manage public shares"
  ON public.report_public_shares FOR ALL
  USING (auth.uid() = created_by);

CREATE INDEX idx_report_public_shares_token ON public.report_public_shares(share_token);
CREATE INDEX idx_report_public_shares_report ON public.report_public_shares(report_id);
