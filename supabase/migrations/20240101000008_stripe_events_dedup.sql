-- ============================================================
-- STRIPE EVENT DEDUPLICATION TABLE
-- Survives serverless cold starts unlike in-memory Maps.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-cleanup old events after 7 days
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at ON public.stripe_events(processed_at);

-- RLS: only service role should access this table (webhooks use service role)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
