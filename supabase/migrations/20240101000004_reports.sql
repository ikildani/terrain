-- Migration 004: Reports
-- Saved analysis reports with sharing support

CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  indication TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  outputs JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  is_starred BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Index for fast user report queries
CREATE INDEX idx_reports_user_created
  ON public.reports(user_id, created_at DESC);

-- Report sharing (Team plan)
CREATE TABLE public.report_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their shares"
  ON public.report_shares FOR SELECT
  USING (auth.uid() = shared_with_user_id);
