'use client';

import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { ActivityFeed } from '@/components/workspace/ActivityFeed';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function ActivityContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, isLoading: wsLoading } = useWorkspace();

  const isLoading = subLoading || wsLoading;

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card noise animate-pulse p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-700/60" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── No workspace (free/pro plan) ────────────────────────
  if (!hasWorkspace || !activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Activity" subtitle="Track workspace activity and changes." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Upgrade to the Team plan to access shared workspaces with activity feeds, collaboration, and audit trails.
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
      <PageHeader title="Activity" subtitle={activeWorkspace.name} badge="Team" />
      <ActivityFeed workspaceId={activeWorkspaceId} />
    </>
  );
}

export default function WorkspaceActivityPage() {
  return (
    <ErrorBoundary>
      <ActivityContent />
    </ErrorBoundary>
  );
}
