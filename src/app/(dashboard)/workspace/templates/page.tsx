'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { TemplateCard } from '@/components/workspace/TemplateCard';
import { TemplateEditor } from '@/components/workspace/TemplateEditor';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { ReportTemplate } from '@/types';
import { FileText } from 'lucide-react';

function TemplatesContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading } = useWorkspace();

  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | undefined>();

  const isLoading = subLoading || wsLoading;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const fetchTemplates = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingTemplates(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/templates`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data ?? []);
      }
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      fetchTemplates();
    }
  }, [isLoading, activeWorkspaceId, fetchTemplates]);

  const handleEdit = useCallback((template: ReportTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  }, []);

  const handleDelete = useCallback(
    async (template: ReportTemplate) => {
      if (!activeWorkspaceId) return;
      if (!window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) return;

      try {
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}/templates/${template.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? 'Failed to delete template');
          return;
        }
        toast.success('Template deleted');
        fetchTemplates();
      } catch {
        toast.error('Failed to delete template');
      }
    },
    [activeWorkspaceId, fetchTemplates],
  );

  const handleSave = useCallback(() => {
    setShowEditor(false);
    setEditingTemplate(undefined);
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCancel = useCallback(() => {
    setShowEditor(false);
    setEditingTemplate(undefined);
  }, []);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card noise animate-pulse p-5">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-3 w-48 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── No workspace plan (free/pro) ────────────────────────
  if (!hasWorkspace) {
    return (
      <>
        <PageHeader title="Templates" subtitle="Re-usable analysis configurations for your team." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This feature requires a Team or Enterprise plan. Shared workspaces include templates, collaboration, and
            team analytics.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Has plan but no workspace created yet ─────────────────
  if (!activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Templates" subtitle="Re-usable analysis configurations for your team." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Create your workspace</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">Set up your workspace to get started.</p>
          <Link href="/settings/team" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            Set Up Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Workspace exists ────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Templates"
        subtitle={activeWorkspace.name}
        badge={activeWorkspace.plan === 'enterprise' ? 'Enterprise' : 'Team'}
        actions={
          canManage ? (
            <button
              onClick={() => {
                setEditingTemplate(undefined);
                setShowEditor(true);
              }}
              className="btn btn-primary btn-sm inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Template
            </button>
          ) : undefined
        }
      />

      {isLoadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card noise animate-pulse p-5">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-3 w-48 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template)}
              canManage={canManage}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          heading="No templates yet"
          description="Create re-usable analysis templates to standardize how your team runs market intelligence."
        />
      )}

      {showEditor && (
        <TemplateEditor
          workspaceId={activeWorkspaceId}
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

export default function WorkspaceTemplatesPage() {
  return (
    <ErrorBoundary>
      <TemplatesContent />
    </ErrorBoundary>
  );
}
