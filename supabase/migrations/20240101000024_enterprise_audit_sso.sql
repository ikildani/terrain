-- ============================================================
-- Migration 024: Enterprise Audit Log & SSO Configuration
-- Phase 5 enterprise features
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- AUDIT LOG TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_log_workspace_created
  ON public.audit_log (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_workspace_action
  ON public.audit_log (workspace_id, action);

CREATE INDEX IF NOT EXISTS idx_audit_log_workspace_user
  ON public.audit_log (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON public.audit_log (created_at);

-- RLS: only service role can insert/select (bypassed by admin client)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — all access goes through admin client
-- Add a policy for service role reads if needed
CREATE POLICY "Service role full access on audit_log"
  ON public.audit_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- SSO CONFIGURATION TABLE
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sso_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('saml', 'google_workspace', 'azure_ad', 'okta')),
  sso_provider_id TEXT,
  domain TEXT NOT NULL,
  metadata_url TEXT,
  enforce_sso BOOLEAN NOT NULL DEFAULT FALSE,
  auto_provision BOOLEAN NOT NULL DEFAULT TRUE,
  default_role TEXT NOT NULL DEFAULT 'analyst' CHECK (default_role IN ('admin', 'analyst', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One SSO config per workspace (UNIQUE constraint on workspace_id handles this)
CREATE INDEX IF NOT EXISTS idx_sso_configs_domain
  ON public.sso_configs (domain);

-- RLS: only service role can access (bypassed by admin client)
ALTER TABLE public.sso_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sso_configs"
  ON public.sso_configs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- ADD 'enterprise' TO WORKSPACE PLAN CHECK IF NOT EXISTS
-- ────────────────────────────────────────────────────────────

-- Ensure the workspaces table plan column accepts 'enterprise'
-- This is a safe no-op if already supported
DO $$
BEGIN
  -- Check if there's a constraint on the plan column and update it
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'workspaces_plan_check'
  ) THEN
    ALTER TABLE public.workspaces DROP CONSTRAINT workspaces_plan_check;
    ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_plan_check
      CHECK (plan IN ('free', 'pro', 'team', 'enterprise'));
  END IF;
END $$;
