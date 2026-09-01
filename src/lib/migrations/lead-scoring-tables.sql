CREATE TABLE IF NOT EXISTS lead_score_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  score INTEGER NOT NULL,
  temperature TEXT NOT NULL,
  deal_stage TEXT NOT NULL,
  trigger TEXT,
  indication TEXT,
  modules_used TEXT[] DEFAULT '{}',
  top_indications TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_score_user ON lead_score_events(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_score_temp ON lead_score_events(temperature);

CREATE TABLE IF NOT EXISTS lead_emails_sent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email_type)
);
