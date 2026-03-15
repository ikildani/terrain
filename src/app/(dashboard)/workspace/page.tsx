'use client';

import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReportLibrary } from '@/components/workspace/ReportLibrary';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function WorkspaceContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading } = useWorkspace();

  const isLoading = subLoading || wsLoading;

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex gap-6">
          <div className="w-[240px] shrink-0 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card noise animate-pulse">
                <div className="h-3 w-20 bg-navy-700/60 rounded mb-3" />
                <div className="h-5 w-48 bg-navy-700/60 rounded mb-2" />
                <div className="h-3 w-32 bg-navy-700/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── No workspace (free/pro plan) ────────────────────────
  if (!hasWorkspace || !activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Workspace" subtitle="Collaborate with your team on shared reports and analyses." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Upgrade to the Team plan to access shared workspaces with report libraries, folder organization, and team
            collaboration features.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Workspace exists ────────────────────────────────────
  return (
    <>
      <PageHeader title="Workspace" subtitle={activeWorkspace.name} badge="Team" />
      <ReportLibrary workspaceId={activeWorkspaceId} myRole={myRole} />
    </>
  );
}

export default function WorkspacePage() {
  return (
    <ErrorBoundary>
      <WorkspaceContent />
    </ErrorBoundary>
  );
}
