'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowRight, CheckCircle, XCircle, Building2, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SSOConfigForm } from '@/components/workspace/SSOConfigForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { useEnterpriseSignals } from '@/hooks/useEnterpriseSignals';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { SSOConfig } from '@/types';

function SSOSettingsContent() {
  const { isLoading: subLoading, hasWorkspace, isEnterprise: isEnterprisePlan } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, isLoading: wsLoading } = useWorkspace();
  const { shouldNudge, reason } = useEnterpriseSignals(activeWorkspaceId);

  const [config, setConfig] = useState<SSOConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const isLoading = subLoading || wsLoading;

  const fetchConfig = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingConfig(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/sso`);
      if (!res.ok) throw new Error('Failed to fetch SSO config');
      const json = await res.json();
      if (json.success) {
        setConfig(json.data ?? null);
      }
    } catch {
      toast.error('Failed to load SSO configuration');
    } finally {
      setIsLoadingConfig(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId && activeWorkspace?.plan === 'enterprise') {
      fetchConfig();
    } else {
      setIsLoadingConfig(false);
    }
  }, [isLoading, activeWorkspaceId, activeWorkspace?.plan, fetchConfig]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="card noise p-6 max-w-2xl">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </>
    );
  }

  // ── No workspace plan (free/pro) ────────────────────────
  if (!hasWorkspace) {
    return (
      <>
        <PageHeader title="Single Sign-On" subtitle="Configure SSO for your workspace." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This feature requires a Team or Enterprise plan. Single Sign-On allows you to manage authentication
            centrally through your Identity Provider.
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
        <PageHeader title="Single Sign-On" subtitle="Configure SSO for your workspace." />
        {shouldNudge ? (
          <div className="card noise p-8 flex flex-col items-center text-center max-w-lg mx-auto border border-navy-700/40">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{reason}</p>
            <p className="text-xs text-slate-500 mb-4">
              Single Sign-On with your Identity Provider is available on Enterprise.
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
        <PageHeader title="Single Sign-On" subtitle="Configure SSO for your workspace." />
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

  // ── Enterprise plan — SSO config ────────────────────────
  return (
    <>
      <PageHeader title="Single Sign-On" subtitle={activeWorkspace.name} badge="Enterprise" />

      {/* SSO status badge */}
      <div className="card noise p-4 mb-6 flex items-center gap-3">
        {config ? (
          <>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">
                SSO configured — {config.provider.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              <p className="text-2xs text-slate-400 mt-0.5">
                Domain: <span className="font-mono text-slate-300">{config.domain}</span>
                {config.enforce_sso && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-2xs bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    Enforced
                  </span>
                )}
              </p>
            </div>
          </>
        ) : isLoadingConfig ? (
          <>
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-400">SSO not configured</p>
              <p className="text-2xs text-slate-500">Set up SSO below to enable secure single sign-on for your team.</p>
            </div>
          </>
        )}
      </div>

      {/* Config form */}
      {isLoadingConfig ? (
        <div className="card noise p-6 max-w-2xl">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="card noise p-6 max-w-2xl">
          <SSOConfigForm config={config} workspaceId={activeWorkspaceId} onSaved={fetchConfig} />
        </div>
      )}
    </>
  );
}

export default function SSOSettingsPage() {
  return (
    <ErrorBoundary>
      <SSOSettingsContent />
    </ErrorBoundary>
  );
}
