-- ============================================================
-- Migration 022: Report Annotations
-- Phase 3 — Annotations system for workspace collaboration
-- ============================================================

-- Report annotations table
CREATE TABLE IF NOT EXISTS public.report_annotations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  mentions UUID[] DEFAULT '{}',
  parent_id UUID REFERENCES public.report_annotations(id) ON DELETE CASCADE,
  section_key TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_report_annotations_report_id ON public.report_annotations(report_id);
CREATE INDEX idx_report_annotations_workspace_id ON public.report_annotations(workspace_id);
CREATE INDEX idx_report_annotations_parent_id ON public.report_annotations(parent_id);
CREATE INDEX idx_report_annotations_section_key ON public.report_annotations(report_id, section_key);
CREATE INDEX idx_report_annotations_created_at ON public.report_annotations(created_at DESC);

-- Enable RLS
ALTER TABLE public.report_annotations ENABLE ROW LEVEL SECURITY;

-- RLS policies: workspace members can view annotations for reports in their workspace
CREATE POLICY "Workspace members can view annotations"
  ON public.report_annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_annotations.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- Analysts and above can insert annotations
CREATE POLICY "Analysts can insert annotations"
  ON public.report_annotations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_annotations.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin', 'analyst')
    )
  );

-- Users can update their own annotations
CREATE POLICY "Users can update own annotations"
  ON public.report_annotations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any annotation (for resolving)
CREATE POLICY "Admins can update annotations"
  ON public.report_annotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = report_annotations.workspace_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner', 'admin')
    )
  );

-- Users can delete their own annotations
CREATE POLICY "Users can delete own annotations"
  ON public.report_annotations FOR DELETE
  USING (user_id = auth.uid());

-- Enable Realtime for annotations
ALTER PUBLICATION supabase_realtime ADD TABLE public.report_annotations;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_report_annotation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_annotation_updated_at
  BEFORE UPDATE ON public.report_annotations
  FOR EACH ROW EXECUTE FUNCTION update_report_annotation_updated_at();
