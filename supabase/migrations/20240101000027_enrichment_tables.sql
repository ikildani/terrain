-- ============================================================
-- TERRAIN — Dynamic Data Enrichment Tables
-- Migration 027: enrichment_tables
--
-- Supplements static data files (indication-map.ts, pricing-benchmarks.ts,
-- procedure-map.ts) with dynamically discovered data from Perplexity AI.
-- Static + dynamic data are merged at query time.
-- ============================================================

-- Dynamic indication enrichment (supplements static indication-map.ts)
CREATE TABLE IF NOT EXISTS public.enriched_indications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  therapy_area TEXT NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  us_prevalence INTEGER,
  us_incidence INTEGER,
  diagnosis_rate NUMERIC(4,3),
  treatment_rate NUMERIC(4,3),
  major_competitors TEXT[] DEFAULT '{}',
  market_growth_driver TEXT,
  prevalence_source TEXT,
  enrichment_source TEXT DEFAULT 'perplexity',
  confidence TEXT DEFAULT 'medium',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic pricing enrichment
CREATE TABLE IF NOT EXISTS public.enriched_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name TEXT NOT NULL,
  company TEXT,
  therapy_area TEXT NOT NULL,
  indication TEXT,
  mechanism TEXT,
  launch_year INTEGER,
  wac_annual NUMERIC(12,2),
  net_price_annual NUMERIC(12,2),
  orphan_status BOOLEAN DEFAULT FALSE,
  enrichment_source TEXT DEFAULT 'perplexity',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic procedure enrichment (devices)
CREATE TABLE IF NOT EXISTS public.enriched_procedures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  synonyms TEXT[] DEFAULT '{}',
  device_category TEXT,
  us_annual_procedures INTEGER,
  us_procedure_growth_rate NUMERIC(4,2),
  medicare_facility_rate NUMERIC(10,2),
  major_device_competitors TEXT[] DEFAULT '{}',
  enrichment_source TEXT DEFAULT 'perplexity',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrichment run log
CREATE TABLE IF NOT EXISTS public.enrichment_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapy_area TEXT NOT NULL,
  run_type TEXT NOT NULL, -- 'indications', 'pricing', 'procedures'
  items_discovered INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.enriched_indications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enriched_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enriched_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrichment_runs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (cron jobs use service role)
CREATE POLICY "Service role full access on enriched_indications"
  ON public.enriched_indications FOR ALL USING (true);
CREATE POLICY "Service role full access on enriched_pricing"
  ON public.enriched_pricing FOR ALL USING (true);
CREATE POLICY "Service role full access on enriched_procedures"
  ON public.enriched_procedures FOR ALL USING (true);
CREATE POLICY "Service role full access on enrichment_runs"
  ON public.enrichment_runs FOR ALL USING (true);

-- Authenticated users can read
CREATE POLICY "Auth users can read indications"
  ON public.enriched_indications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can read pricing"
  ON public.enriched_pricing FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can read procedures"
  ON public.enriched_procedures FOR SELECT USING (auth.uid() IS NOT NULL);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_enriched_indications_therapy_area
  ON public.enriched_indications (therapy_area);
CREATE INDEX IF NOT EXISTS idx_enriched_indications_name
  ON public.enriched_indications (lower(name));
CREATE INDEX IF NOT EXISTS idx_enriched_pricing_therapy_area
  ON public.enriched_pricing (therapy_area);
CREATE INDEX IF NOT EXISTS idx_enriched_procedures_category
  ON public.enriched_procedures (device_category);
CREATE INDEX IF NOT EXISTS idx_enrichment_runs_therapy_area
  ON public.enrichment_runs (therapy_area, run_type);
