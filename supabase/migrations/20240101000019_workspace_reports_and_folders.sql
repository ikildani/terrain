-- ============================================================
-- Migration 019: Report Folders & Workspace Report Access
-- Adds folder hierarchy and workspace-level report visibility
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Report folders table
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.report_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.report_folders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, name, parent_id)
);

ALTER TABLE public.report_folders ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 2. Extend reports table with workspace and folder references
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.reports
  ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  ADD COLUMN folder_id UUID REFERENCES public.report_folders(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────
-- 3. Recreate reports RLS policies for workspace access
-- ────────────────────────────────────────────────────────────

-- Drop old policies
DROP POLICY IF EXISTS "Users can manage own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view shared reports" ON public.reports;

-- Owner retains full CRUD on own reports
CREATE POLICY "Users manage own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Workspace members can view workspace reports
CREATE POLICY "Workspace members view workspace reports"
  ON public.reports FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Shared report access via report_shares
CREATE POLICY "Shared report access"
  ON public.reports FOR SELECT
  USING (
    id IN (
      SELECT report_id FROM public.report_shares
      WHERE shared_with_user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 4. Report folders RLS — workspace members can manage
-- ────────────────────────────────────────────────────────────

CREATE POLICY "Workspace members can view folders"
  ON public.report_folders FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can manage folders"
  ON public.report_folders FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 5. Indexes
-- ────────────────────────────────────────────────────────────

CREATE INDEX idx_reports_workspace_id ON public.reports(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX idx_reports_folder_id ON public.reports(folder_id) WHERE folder_id IS NOT NULL;
CREATE INDEX idx_report_folders_workspace_id ON public.report_folders(workspace_id);
CREATE INDEX idx_report_folders_parent_id ON public.report_folders(parent_id) WHERE parent_id IS NOT NULL;
