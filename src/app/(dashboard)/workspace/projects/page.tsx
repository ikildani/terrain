'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, ArrowRight, Plus, ShieldCheck, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectCard } from '@/components/workspace/ProjectCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { useEnterpriseSignals } from '@/hooks/useEnterpriseSignals';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { WorkspaceProject } from '@/types';

interface ProjectWithCounts extends WorkspaceProject {
  member_count?: number;
  report_count?: number;
}

function ProjectsContent() {
  const { isLoading: subLoading, hasWorkspace, isEnterprise: isEnterprisePlan } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading } = useWorkspace();
  const { shouldNudge, reason } = useEnterpriseSignals(activeWorkspaceId);

  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createRestricted, setCreateRestricted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isLoading = subLoading || wsLoading;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const fetchProjects = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingProjects(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/projects`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        setProjects(json.data ?? []);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      fetchProjects();
    }
  }, [isLoading, activeWorkspaceId, fetchProjects]);

  const handleCreate = async () => {
    if (!activeWorkspaceId || !createName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim() || null,
          is_restricted: createRestricted,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to create project');
        return;
      }

      toast.success('Project created');
      setShowCreateModal(false);
      setCreateName('');
      setCreateDescription('');
      setCreateRestricted(false);
      fetchProjects();
    } catch {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

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
        <PageHeader title="Projects" subtitle="Organize deal rooms with information barriers." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This feature requires a Team or Enterprise plan. Projects with information barriers help you organize deal
            rooms with restricted visibility and fine-grained access control.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Team user viewing enterprise feature ───────────────────
  if (!isEnterprisePlan) {
    return (
      <>
        <PageHeader title="Projects" subtitle="Organize deal rooms with information barriers." />
        {shouldNudge ? (
          <div className="card noise p-8 flex flex-col items-center text-center max-w-lg mx-auto border border-navy-700/40">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{reason}</p>
            <p className="text-xs text-slate-500 mb-4">
              Projects with information barriers are available on Enterprise.
            </p>
            <a
              href="mailto:team@ambrosiaventures.co"
              className="text-sm text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              team@ambrosiaventures.co
            </a>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">Available on Enterprise</p>
          </div>
        )}
      </>
    );
  }

  // ── Has enterprise plan but no workspace created yet ──────
  if (!activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Projects" subtitle="Organize deal rooms with information barriers." />
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

  // ── Workspace exists + enterprise plan ──────────────────
  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={activeWorkspace.name}
        badge="Enterprise"
        actions={
          canManage ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Project
            </button>
          ) : undefined
        }
      />

      {isLoadingProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card noise animate-pulse p-5">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-3 w-48 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              reportCount={project.report_count ?? 0}
              memberCount={project.member_count ?? 0}
              canManage={canManage}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          heading="No projects yet"
          description="Create your first deal room. Projects let you organize reports and control access with information barriers."
        />
      )}

      {/* Create project modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card noise max-w-md w-full p-6">
            <h3 className="font-display text-lg text-white mb-4">Create Project</h3>

            <div className="space-y-4">
              <div>
                <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">Project Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g., Project Alpha"
                  className="input w-full"
                  maxLength={200}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">
                  Description (optional)
                </label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Brief description of this deal room..."
                  className="input w-full resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={createRestricted}
                  onChange={(e) => setCreateRestricted(e.target.checked)}
                  className="rounded border-navy-600 bg-navy-800 text-teal-500 focus:ring-teal-500"
                />
                <div>
                  <span className="text-sm text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Restricted access
                  </span>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Only project members and workspace admins can see this project and its reports.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-navy-700/30">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateName('');
                  setCreateDescription('');
                  setCreateRestricted(false);
                }}
                className="btn btn-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || isCreating}
                className="btn btn-primary btn-sm"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function WorkspaceProjectsPage() {
  return (
    <ErrorBoundary>
      <ProjectsContent />
    </ErrorBoundary>
  );
}
