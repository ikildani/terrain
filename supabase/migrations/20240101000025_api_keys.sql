-- ────────────────────────────────────────────────────────────
-- Migration 025 — API Keys for programmatic access
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL CHECK (char_length(key_prefix) <= 20),
  scopes TEXT[] NOT NULL DEFAULT '{*}',
  rate_limit_rpm INTEGER NOT NULL DEFAULT 60 CHECK (rate_limit_rpm BETWEEN 1 AND 1000),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast hash lookups (authentication)
CREATE UNIQUE INDEX idx_api_keys_key_hash ON public.api_keys (key_hash);

-- Index for listing active keys per workspace
CREATE INDEX idx_api_keys_workspace_active ON public.api_keys (workspace_id)
  WHERE revoked_at IS NULL;

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only workspace admins/owners can manage keys via the service role client.
-- All API key operations go through the admin client, so no user-facing
-- RLS policies are needed. Deny all direct access.
CREATE POLICY "Deny all direct access to api_keys"
  ON public.api_keys
  FOR ALL
  USING (false);
