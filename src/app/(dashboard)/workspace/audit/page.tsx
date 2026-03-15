'use client';

import { Shield, ArrowRight, Building2, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { AuditLogTable } from '@/components/workspace/AuditLogTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function AuditLogContent() {
  const { isLoading: subLoading, hasWorkspace, isEnterprise: isEnterprisePlan } = useSubscription();
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

  // ── No workspace plan (free/pro) ────────────────────────
  if (!hasWorkspace) {
    return (
      <>
        <PageHeader title="Audit Log" subtitle="Track all workspace activity for compliance and security." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This feature requires a Team or Enterprise plan. Audit logging tracks all workspace activity with
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

  // ── Team user viewing enterprise feature ───────────────────
  if (!isEnterprisePlan) {
    return (
      <>
        <PageHeader title="Audit Log" subtitle="Track all workspace activity for compliance and security." />
        <div className="card noise p-8 flex flex-col items-center text-center max-w-lg mx-auto border border-navy-700/40">
          <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center mb-4">
            <Info className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            This feature is available on the Enterprise plan. Contact our team to learn more.
          </p>
          <a
            href="mailto:team@ambrosiaventures.co"
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            team@ambrosiaventures.co
          </a>
        </div>
      </>
    );
  }

  // ── Has enterprise plan but no workspace created yet ──────
  if (!activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Audit Log" subtitle="Track all workspace activity for compliance and security." />
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
