-- Drop intelligence/data cache tables (feature removed)
DROP TABLE IF EXISTS public.sec_filings_cache CASCADE;
DROP TABLE IF EXISTS public.fda_approvals_cache CASCADE;
DROP TABLE IF EXISTS public.clinical_trials_cache CASCADE;
DROP TABLE IF EXISTS public.data_source_status CASCADE;
