'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { SSOConfigForm } from '@/components/workspace/SSOConfigForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { SSOConfig } from '@/types';

function SSOSettingsContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, isLoading: wsLoading } = useWorkspace();

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

  // ── No workspace ────────────────────────────────────────
  if (!hasWorkspace || !activeWorkspace || !activeWorkspaceId) {
    return (
      <>
        <PageHeader title="Single Sign-On" subtitle="Configure SSO for your workspace." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Shield className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Enterprise feature</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Single Sign-On is available on the Enterprise plan. Manage authentication centrally through your Identity
            Provider.
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
        <PageHeader title="Single Sign-On" subtitle={activeWorkspace.name} badge="Enterprise" />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Shield className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Upgrade to Enterprise</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Configure SAML, Okta, Azure AD, or Google Workspace SSO to streamline authentication for your team. Includes
            auto-provisioning and enforced SSO policies.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            Upgrade to Enterprise
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
