-- ────────────────────────────────────────────────────────────
-- Migration 021: Workspace Activities (Activity Feed + Audit)
-- ────────────────────────────────────────────────────────────

-- Activity log table for workspace events
CREATE TABLE public.workspace_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_workspace_activities_workspace_id
  ON public.workspace_activities(workspace_id);

CREATE INDEX idx_workspace_activities_workspace_created
  ON public.workspace_activities(workspace_id, created_at DESC);

CREATE INDEX idx_workspace_activities_user_id
  ON public.workspace_activities(user_id);

CREATE INDEX idx_workspace_activities_action
  ON public.workspace_activities(action);

-- Row Level Security
ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;

-- Members can read their workspace's activity
CREATE POLICY "Workspace members can view activity"
  ON public.workspace_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_activities.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Only service role (admin client) inserts activity — no user-facing INSERT policy
-- This ensures activity logging is controlled server-side only.

-- Enable Realtime for live activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_activities;
