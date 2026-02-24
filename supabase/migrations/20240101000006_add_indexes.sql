-- ────────────────────────────────────────────────────────────
-- Migration 006: Performance indexes
-- Adds indexes for frequently queried columns across all tables.
-- ────────────────────────────────────────────────────────────

-- Usage events: monthly aggregation queries (user + feature + time range)
CREATE INDEX IF NOT EXISTS idx_usage_events_user_feature_month
  ON public.usage_events(user_id, feature, created_at);

-- Subscriptions: lookup by user ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);

-- Subscriptions: lookup by Stripe customer ID (webhook processing)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions(stripe_customer_id);

-- Alerts: active alerts per user (filtered index)
CREATE INDEX IF NOT EXISTS idx_alerts_user_active
  ON public.alerts(user_id) WHERE is_active = true;

-- Alert events: feed queries (user + reverse chronological)
CREATE INDEX IF NOT EXISTS idx_alert_events_user_created
  ON public.alert_events(user_id, created_at DESC);

-- Alert events: lookup by parent alert
CREATE INDEX IF NOT EXISTS idx_alert_events_alert_id
  ON public.alert_events(alert_id);

-- Reports: user listing (reverse chronological)
CREATE INDEX IF NOT EXISTS idx_reports_user_created
  ON public.reports(user_id, created_at DESC);

-- Profiles: email lookup (login, search)
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles(email);
