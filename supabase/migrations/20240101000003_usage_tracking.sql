-- Migration 003: Usage Tracking
-- Tracks feature usage per user for free-tier limits

CREATE TABLE public.usage_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  indication TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.usage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for efficient monthly count queries
CREATE INDEX idx_usage_events_user_feature_created
  ON public.usage_events(user_id, feature, created_at);

-- Monthly usage aggregation view
CREATE VIEW public.monthly_usage AS
SELECT
  user_id,
  feature,
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS usage_count
FROM public.usage_events
GROUP BY user_id, feature, DATE_TRUNC('month', created_at);
