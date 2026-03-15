'use client';

import { useState, useEffect, useCallback } from 'react';
import { Key, Plus, Shield, Building2, ArrowRight, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApiKeyTable } from '@/components/workspace/ApiKeyTable';
import { CreateApiKeyModal } from '@/components/workspace/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/workspace/ApiKeyRevealModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { useEnterpriseSignals } from '@/hooks/useEnterpriseSignals';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { ApiKey } from '@/types';

function ApiKeysContent() {
  const { isLoading: subLoading, hasWorkspace, isEnterprise: isEnterprisePlan } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading } = useWorkspace();
  const { shouldNudge, reason } = useEnterpriseSignals(activeWorkspaceId);

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revealKey, setRevealKey] = useState<string | null>(null);

  const isLoading = subLoading || wsLoading;
  const isAdminOrOwner = myRole === 'owner' || myRole === 'admin';

  const fetchKeys = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsLoadingKeys(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/api-keys`);
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const json = await res.json();
      if (json.success) {
        setKeys(json.data ?? []);
      }
    } catch {
      toast.error('Failed to load API keys');
    } finally {
      setIsLoadingKeys(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!isLoading && activeWorkspaceId && isAdminOrOwner) {
      fetchKeys();
    } else {
      setIsLoadingKeys(false);
    }
  }, [isLoading, activeWorkspaceId, isAdminOrOwner, fetchKeys]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // ── No workspace plan (free/pro) ────────────────────────
  if (!hasWorkspace) {
    return (
      <div className="space-y-6">
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            This feature requires a Team or Enterprise plan. API keys provide programmatic access to Terrain
            intelligence.
          </p>
          <Link href="/settings/billing" className="btn btn-primary btn-sm inline-flex items-center gap-2">
            View Plans
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Team user viewing enterprise feature ───────────────────
  if (!isEnterprisePlan) {
    return (
      <div className="space-y-6">
        {shouldNudge ? (
          <div className="card noise p-8 flex flex-col items-center text-center max-w-lg mx-auto border border-navy-700/40">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
              <Info className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{reason}</p>
            <p className="text-xs text-slate-500 mb-4">API keys for programmatic access are available on Enterprise.</p>
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
      </div>
    );
  }

  // ── Has enterprise plan but no workspace created yet ──────
  if (!activeWorkspace) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  // ── Permission gate ────────────────────────────────────
  if (!isAdminOrOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="mb-4 h-12 w-12 text-slate-500" />
        <h2 className="font-display text-xl text-white">Access Restricted</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">Only workspace admins and owners can manage API keys.</p>
      </div>
    );
  }

  const handleKeyCreated = (newKey: string) => {
    setShowCreateModal(false);
    setRevealKey(newKey);
    fetchKeys();
  };

  const handleRevoke = async (keyId: string) => {
    if (!activeWorkspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success('API key revoked');
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke API key');
    }
  };

  const handleRotate = async (keyId: string) => {
    if (!activeWorkspaceId) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/api-keys/${keyId}/rotate`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRevealKey(json.data.key);
      toast.success('API key rotated');
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rotate API key');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        subtitle="Manage programmatic access to the Terrain API"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-teal-400"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        }
      />

      {isLoadingKeys ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ApiKeyTable keys={keys} onRevoke={handleRevoke} onRotate={handleRotate} />
      )}

      {showCreateModal && activeWorkspaceId && (
        <CreateApiKeyModal
          workspaceId={activeWorkspaceId}
          onCreated={handleKeyCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {revealKey && <ApiKeyRevealModal apiKey={revealKey} onClose={() => setRevealKey(null)} />}
    </div>
  );
}

export default function ApiKeysPage() {
  return (
    <ErrorBoundary>
      <ApiKeysContent />
    </ErrorBoundary>
  );
}
