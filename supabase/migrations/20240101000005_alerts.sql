-- Migration 005: Alerts
-- Deal alert configuration and event feed

CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  indication TEXT,
  company TEXT,
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  frequency TEXT DEFAULT 'weekly',
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.alert_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  source_url TEXT,
  signal_type TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.alerts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alert events"
  ON public.alert_events FOR ALL
  USING (auth.uid() = user_id);
