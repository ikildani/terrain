'use client';

import { useState } from 'react';
import { RotateCw, Trash2, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import type { ApiKey } from '@/types';

interface ApiKeyTableProps {
  keys: ApiKey[];
  onRevoke: (keyId: string) => void;
  onRotate: (keyId: string) => void;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ScopeBadge({ scope }: { scope: string }) {
  const label = scope === '*' ? 'All Scopes' : scope.replace(/_/g, ' ');
  return (
    <span className="inline-block rounded bg-navy-700 px-2 py-0.5 text-xs font-medium text-slate-300">{label}</span>
  );
}

export function ApiKeyTable({ keys, onRevoke, onRotate }: ApiKeyTableProps) {
  const [showRevoked, setShowRevoked] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [confirmRotate, setConfirmRotate] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);

  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-navy-700 bg-navy-900 py-16 text-center">
        <div className="mb-4 rounded-full bg-navy-800 p-4">
          <Clock className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="font-display text-lg text-white">No API Keys</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Create an API key to start making programmatic requests to the Terrain API.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Keys */}
      <div className="overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700 bg-navy-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Prefix
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Scopes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Rate Limit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Last Used
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/50">
            {activeKeys.map((key) => (
              <tr key={key.id} className="transition-colors hover:bg-navy-800/30">
                <td className="px-4 py-3 text-sm font-medium text-white">{key.name}</td>
                <td className="px-4 py-3">
                  <code className="rounded bg-navy-800 px-2 py-1 font-mono text-xs text-teal-400">
                    {key.key_prefix}...
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <ScopeBadge key={scope} scope={scope} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-slate-300">{key.rate_limit_rpm} RPM</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatRelativeTime(key.last_used_at)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatRelativeTime(key.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {confirmRotate === key.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400">Rotate?</span>
                        <button
                          onClick={() => {
                            onRotate(key.id);
                            setConfirmRotate(null);
                          }}
                          className="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/30"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmRotate(null)}
                          className="rounded bg-navy-700 px-2 py-1 text-xs text-slate-400 hover:bg-navy-600"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRotate(key.id)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-navy-700 hover:text-white"
                        title="Rotate key"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    )}

                    {confirmRevoke === key.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Revoke?</span>
                        <button
                          onClick={() => {
                            onRevoke(key.id);
                            setConfirmRevoke(null);
                          }}
                          className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/30"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmRevoke(null)}
                          className="rounded bg-navy-700 px-2 py-1 text-xs text-slate-400 hover:bg-navy-600"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRevoke(key.id)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-navy-700 hover:text-red-400"
                        title="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {activeKeys.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No active API keys.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Revoked Keys (collapsed) */}
      {revokedKeys.length > 0 && (
        <div className="rounded-xl border border-navy-700/50 bg-navy-900/50">
          <button
            onClick={() => setShowRevoked(!showRevoked)}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-400 transition-colors hover:text-slate-300"
          >
            {showRevoked ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Revoked Keys ({revokedKeys.length})
          </button>

          {showRevoked && (
            <div className="border-t border-navy-700/50">
              <table className="w-full">
                <tbody className="divide-y divide-navy-700/30">
                  {revokedKeys.map((key) => (
                    <tr key={key.id} className="opacity-50">
                      <td className="px-4 py-3 text-sm text-slate-400 line-through">{key.name}</td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-navy-800 px-2 py-1 font-mono text-xs text-slate-500">
                          {key.key_prefix}...
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">Revoked {formatRelativeTime(key.revoked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
