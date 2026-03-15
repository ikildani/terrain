-- ============================================================
-- Migration 023: Report Templates
-- Workspace-scoped report templates for re-usable analysis configs
-- ============================================================

CREATE TABLE public.report_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  report_type TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_report_templates_workspace ON public.report_templates (workspace_id);
CREATE INDEX idx_report_templates_type ON public.report_templates (workspace_id, report_type);

-- Row Level Security
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Members can read templates in their workspace
CREATE POLICY "Workspace members can view templates"
  ON public.report_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_templates.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Admin/owner can insert templates
CREATE POLICY "Workspace admins can create templates"
  ON public.report_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_templates.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Admin/owner can update templates
CREATE POLICY "Workspace admins can update templates"
  ON public.report_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_templates.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Admin/owner can delete templates
CREATE POLICY "Workspace admins can delete templates"
  ON public.report_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_templates.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Ensure only one default template per workspace + report_type
CREATE UNIQUE INDEX idx_report_templates_default
  ON public.report_templates (workspace_id, report_type)
  WHERE is_default = TRUE;
