'use client';

import { Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuditLogTable } from '@/components/workspace/AuditLogTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function AuditLogContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, members, isLoading: wsLoading } = useWorkspace();

  const isLoading = subLoading || wsLoading;

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card noise animate-pulse p-4">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── No workspace ────────────────────────────────────────
  if (!hasWorkspace || !activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Audit Log" subtitle="Track all workspace activity for compliance and security." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Shield className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Enterprise feature</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Audit logging is available on the Enterprise plan. Upgrade to track all workspace activity with full
            compliance-grade audit trails.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Enterprise plan gate ────────────────────────────────
  if (activeWorkspace.plan !== 'enterprise') {
    return (
      <>
        <PageHeader title="Audit Log" subtitle={activeWorkspace.name} badge="Enterprise" />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Shield className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Upgrade to Enterprise</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Compliance-grade audit logging tracks every action in your workspace: report creation, member changes,
            settings updates, and more. Includes CSV export and 1-year retention.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            Upgrade to Enterprise
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </>
    );
  }

  // ── Enterprise plan — show audit log ────────────────────
  return (
    <>
      <PageHeader title="Audit Log" subtitle={activeWorkspace.name} badge="Enterprise" />
      <AuditLogTable workspaceId={activeWorkspaceId} members={members} />
    </>
  );
}

export default function WorkspaceAuditPage() {
  return (
    <ErrorBoundary>
      <AuditLogContent />
    </ErrorBoundary>
  );
}
