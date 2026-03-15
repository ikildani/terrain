'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Pencil, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectMemberManager } from '@/components/workspace/ProjectMemberManager';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { WorkspaceProject, ProjectMember } from '@/types';

interface ProjectDetail extends WorkspaceProject {
  members: ProjectMember[];
  report_count: number;
}

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { isLoading: subLoading } = useSubscription();
  const {
    activeWorkspace,
    activeWorkspaceId,
    myRole,
    members: workspaceMembers,
    isLoading: wsLoading,
  } = useWorkspace();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRestricted, setEditRestricted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = subLoading || wsLoading;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const fetchProject = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingProject(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Project not found');
          router.push('/workspace/projects');
          return;
        }
        throw new Error('Failed to fetch');
      }
      const json = await res.json();
      if (json.success) {
        setProject(json.data);
      }
    } catch {
      toast.error('Failed to load project');
    } finally {
      setIsLoadingProject(false);
    }
  }, [activeWorkspaceId, projectId, router]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId) {
      fetchProject();
    }
  }, [isLoading, activeWorkspaceId, fetchProject]);

  const handleEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description ?? '');
    setEditRestricted(project.is_restricted);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!activeWorkspaceId || !editName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          is_restricted: editRestricted,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to update project');
        return;
      }

      toast.success('Project updated');
      setIsEditing(false);
      fetchProject();
    } catch {
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspaceId) return;
    if (!window.confirm('Delete this project? Reports will be unlinked but not deleted.')) return;

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/projects/${projectId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to delete project');
        return;
      }
      toast.success('Project deleted');
      router.push('/workspace/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading || isLoadingProject) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card noise p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="card noise p-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!project || !activeWorkspace || !activeWorkspaceId) {
    return null;
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href="/workspace/projects"
          className="text-xs text-slate-500 hover:text-teal-400 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Projects
        </Link>
      </div>

      <PageHeader
        title={project.name}
        subtitle={activeWorkspace.name}
        badge="Enterprise"
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="btn btn-sm text-slate-400 hover:text-white inline-flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-sm text-slate-400 hover:text-red-400 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Project info badges */}
      <div className="flex items-center gap-3 mb-6">
        {project.is_restricted && (
          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-amber-500/15 text-amber-400 border-amber-500/20 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Restricted
          </span>
        )}
        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-slate-500/15 text-slate-400 border-slate-500/20 inline-flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {project.report_count} {project.report_count === 1 ? 'report' : 'reports'}
        </span>
      </div>

      {project.description && <p className="text-sm text-slate-400 mb-6 max-w-2xl">{project.description}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members panel */}
        <div className="lg:col-span-2 card noise p-6">
          <ProjectMemberManager
            projectId={projectId}
            workspaceId={activeWorkspaceId}
            members={project.members ?? []}
            workspaceMembers={workspaceMembers}
            canManage={canManage}
            onChanged={fetchProject}
          />
        </div>

        {/* Project metadata */}
        <div className="card noise p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Details</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-2xs text-slate-500 uppercase tracking-wider">Created</dt>
              <dd className="text-sm text-slate-300 font-mono">
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-2xs text-slate-500 uppercase tracking-wider">Last Updated</dt>
              <dd className="text-sm text-slate-300 font-mono">
                {new Date(project.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-2xs text-slate-500 uppercase tracking-wider">Visibility</dt>
              <dd className="text-sm text-slate-300">
                {project.is_restricted ? 'Members only' : 'All workspace members'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card noise max-w-md w-full p-6">
            <h3 className="font-display text-lg text-white mb-4">Edit Project</h3>

            <div className="space-y-4">
              <div>
                <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                  maxLength={200}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-2xs text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input w-full resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={editRestricted}
                  onChange={(e) => setEditRestricted(e.target.checked)}
                  className="rounded border-navy-600 bg-navy-800 text-teal-500 focus:ring-teal-500"
                />
                <div>
                  <span className="text-sm text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Restricted access
                  </span>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Only project members and workspace admins can see this project.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-navy-700/30">
              <button onClick={() => setIsEditing(false)} className="btn btn-sm text-slate-400 hover:text-white">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!editName.trim() || isSaving} className="btn btn-primary btn-sm">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <ErrorBoundary>
      <ProjectDetailContent />
    </ErrorBoundary>
  );
}
