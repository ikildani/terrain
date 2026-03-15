'use client';

import { useState, useEffect, useCallback } from 'react';
import { Key, Plus, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApiKeyTable } from '@/components/workspace/ApiKeyTable';
import { CreateApiKeyModal } from '@/components/workspace/CreateApiKeyModal';
import { ApiKeyRevealModal } from '@/components/workspace/ApiKeyRevealModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { ApiKey } from '@/types';

function ApiKeysContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading } = useWorkspace();

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

  // ── No workspace ───────────────────────────────────────
  if (!hasWorkspace || !activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield className="mb-4 h-12 w-12 text-slate-500" />
        <h2 className="font-display text-xl text-white">Workspace Required</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          API keys are a workspace feature. Create or join a workspace to manage API access.
        </p>
        <Link
          href="/workspace"
          className="mt-6 rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-teal-400"
        >
          Go to Workspace
        </Link>
      </div>
    );
  }

  // ── Enterprise gate ────────────────────────────────────
  if (activeWorkspace.plan !== 'enterprise') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Key className="mb-4 h-12 w-12 text-slate-500" />
        <h2 className="font-display text-xl text-white">Enterprise Feature</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Programmatic API access is available on the Enterprise plan. Contact us to upgrade your workspace.
        </p>
        <Link
          href="/workspace/settings"
          className="mt-6 rounded-lg border border-navy-700 bg-navy-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          View Plan Settings
        </Link>
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
