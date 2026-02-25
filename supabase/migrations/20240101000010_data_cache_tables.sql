-- Migration 010: Data cache tables for automated cron refresh
-- Stores cached results from free public APIs:
-- ClinicalTrials.gov, openFDA, SEC EDGAR Full-Text Search

-- ── Data source freshness tracking ──────────────────────────
CREATE TABLE IF NOT EXISTS public.data_source_status (
  id TEXT PRIMARY KEY,                    -- e.g. 'clinicaltrials', 'openfda', 'sec_edgar'
  display_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  last_refreshed_at TIMESTAMPTZ,
  next_refresh_at TIMESTAMPTZ,
  records_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',          -- 'success' | 'error' | 'pending' | 'running'
  last_error TEXT,
  refresh_frequency TEXT NOT NULL,        -- 'daily' | 'weekly' | 'monthly'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the data sources we track
INSERT INTO public.data_source_status (id, display_name, source_url, refresh_frequency)
VALUES
  ('clinicaltrials', 'ClinicalTrials.gov', 'https://clinicaltrials.gov/api/v2/studies', 'weekly'),
  ('openfda_approvals', 'FDA Drug Approvals (openFDA)', 'https://api.fda.gov/drug/drugsfda.json', 'daily'),
  ('sec_edgar', 'SEC EDGAR Filings', 'https://efts.sec.gov/LATEST/search-index', 'weekly')
ON CONFLICT (id) DO NOTHING;

-- ── Clinical trials cache ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clinical_trials_cache (
  nct_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,                            -- 'RECRUITING' | 'ACTIVE_NOT_RECRUITING' | 'COMPLETED' | etc.
  phase TEXT,                             -- 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4'
  conditions TEXT[],                      -- Array of condition/indication strings
  interventions JSONB DEFAULT '[]',       -- [{type, name, description}]
  sponsor TEXT,
  collaborators TEXT[],
  enrollment INTEGER,
  start_date TEXT,
  completion_date TEXT,
  study_type TEXT,
  primary_outcomes JSONB DEFAULT '[]',
  locations_count INTEGER DEFAULT 0,
  last_update_posted TEXT,
  raw_data JSONB,                         -- Full API response for this study
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trials_conditions ON public.clinical_trials_cache USING GIN (conditions);
CREATE INDEX IF NOT EXISTS idx_trials_sponsor ON public.clinical_trials_cache (sponsor);
CREATE INDEX IF NOT EXISTS idx_trials_phase ON public.clinical_trials_cache (phase);
CREATE INDEX IF NOT EXISTS idx_trials_status ON public.clinical_trials_cache (status);
CREATE INDEX IF NOT EXISTS idx_trials_fetched ON public.clinical_trials_cache (fetched_at DESC);

-- ── FDA approvals cache ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.fda_approvals_cache (
  application_number TEXT PRIMARY KEY,    -- e.g. 'NDA215310', 'BLA761310'
  brand_name TEXT,
  generic_name TEXT,
  sponsor_name TEXT,
  approval_date TEXT,
  application_type TEXT,                  -- 'NDA' | 'BLA' | 'ANDA'
  active_ingredients TEXT[],
  indications TEXT[],
  route TEXT,
  dosage_form TEXT,
  marketing_status TEXT,
  submission_type TEXT,                   -- 'Original' | 'Supplement'
  submission_status TEXT,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fda_sponsor ON public.fda_approvals_cache (sponsor_name);
CREATE INDEX IF NOT EXISTS idx_fda_approval_date ON public.fda_approvals_cache (approval_date DESC);
CREATE INDEX IF NOT EXISTS idx_fda_indications ON public.fda_approvals_cache USING GIN (indications);
CREATE INDEX IF NOT EXISTS idx_fda_fetched ON public.fda_approvals_cache (fetched_at DESC);

-- ── SEC EDGAR filings cache ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sec_filings_cache (
  accession_number TEXT PRIMARY KEY,      -- SEC unique filing ID
  company_name TEXT NOT NULL,
  ticker TEXT,
  cik TEXT,
  form_type TEXT NOT NULL,                -- '8-K' | '10-K' | '10-Q' | 'S-1'
  filed_date TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  is_deal_related BOOLEAN DEFAULT FALSE,  -- Flagged if contains deal/partnership keywords
  deal_keywords TEXT[],                   -- Matched keywords: ['license', 'collaboration', 'acquisition']
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_company ON public.sec_filings_cache (company_name);
CREATE INDEX IF NOT EXISTS idx_sec_form_type ON public.sec_filings_cache (form_type);
CREATE INDEX IF NOT EXISTS idx_sec_filed_date ON public.sec_filings_cache (filed_date DESC);
CREATE INDEX IF NOT EXISTS idx_sec_deal ON public.sec_filings_cache (is_deal_related) WHERE is_deal_related = TRUE;
CREATE INDEX IF NOT EXISTS idx_sec_fetched ON public.sec_filings_cache (fetched_at DESC);

-- RLS: data cache tables are read-only for authenticated users, writable by service role
ALTER TABLE public.data_source_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fda_approvals_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sec_filings_cache ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all cached data
CREATE POLICY "Authenticated users can read data sources" ON public.data_source_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read trials" ON public.clinical_trials_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read FDA approvals" ON public.fda_approvals_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read SEC filings" ON public.sec_filings_cache FOR SELECT TO authenticated USING (true);

-- Service role can do everything (used by cron jobs)
CREATE POLICY "Service role full access data sources" ON public.data_source_status FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access trials" ON public.clinical_trials_cache FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access FDA" ON public.fda_approvals_cache FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access SEC" ON public.sec_filings_cache FOR ALL TO service_role USING (true);
