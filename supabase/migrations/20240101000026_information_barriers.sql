-- ============================================================
-- MIGRATION 026: Information Barriers (Workspace Projects)
-- Enterprise-only deal rooms with restricted visibility
-- ============================================================

-- ── Projects table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspace_projects_workspace ON public.workspace_projects(workspace_id);
CREATE INDEX idx_workspace_projects_created_by ON public.workspace_projects(created_by);

-- ── Project members table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.workspace_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);

-- ── Add project_id to reports ───────────────────────────────
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.workspace_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reports_project ON public.reports(project_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Workspace members can see non-restricted projects.
-- Restricted projects visible only to project members or workspace admins/owners.
CREATE POLICY "workspace_projects_select" ON public.workspace_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_projects.workspace_id
        AND wm.user_id = auth.uid()
        AND (
          workspace_projects.is_restricted = FALSE
          OR wm.role IN ('owner', 'admin')
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = workspace_projects.id
              AND pm.user_id = auth.uid()
          )
        )
    )
  );

-- Only admins/owners can insert projects
CREATE POLICY "workspace_projects_insert" ON public.workspace_projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_projects.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Only admins/owners can update projects
CREATE POLICY "workspace_projects_update" ON public.workspace_projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_projects.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Only admins/owners can delete projects
CREATE POLICY "workspace_projects_delete" ON public.workspace_projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_projects.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Project members: visible to project members + workspace admins/owners
CREATE POLICY "project_members_select" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_projects wp
      JOIN public.workspace_members wm ON wm.workspace_id = wp.workspace_id
      WHERE wp.id = project_members.project_id
        AND wm.user_id = auth.uid()
        AND (
          wm.role IN ('owner', 'admin')
          OR EXISTS (
            SELECT 1 FROM public.project_members pm2
            WHERE pm2.project_id = project_members.project_id
              AND pm2.user_id = auth.uid()
          )
        )
    )
  );

-- Only admins/owners can manage project members
CREATE POLICY "project_members_insert" ON public.project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_projects wp
      JOIN public.workspace_members wm ON wm.workspace_id = wp.workspace_id
      WHERE wp.id = project_members.project_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "project_members_delete" ON public.project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_projects wp
      JOIN public.workspace_members wm ON wm.workspace_id = wp.workspace_id
      WHERE wp.id = project_members.project_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );
