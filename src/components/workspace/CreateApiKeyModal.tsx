'use client';

import { useState, type FormEvent } from 'react';
import { X, Key } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_SCOPES = [
  { id: 'market_sizing', label: 'Market Sizing', description: 'Run market sizing analyses' },
  { id: 'competitive', label: 'Competitive', description: 'Run competitive landscape analyses' },
  { id: 'partners', label: 'Partners', description: 'Run partner discovery analyses' },
  { id: 'regulatory', label: 'Regulatory', description: 'Run regulatory intelligence analyses' },
  { id: 'reports', label: 'Reports', description: 'Read and create workspace reports' },
  { id: '*', label: 'All Scopes', description: 'Full access to all API endpoints' },
] as const;

interface CreateApiKeyModalProps {
  workspaceId: string;
  onCreated: (key: string) => void;
  onClose: () => void;
}

export function CreateApiKeyModal({ workspaceId, onCreated, onClose }: CreateApiKeyModalProps) {
  const [name, setName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['*']);
  const [rateLimit, setRateLimit] = useState(60);
  const [expiresAt, setExpiresAt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const toggleScope = (scopeId: string) => {
    if (scopeId === '*') {
      setSelectedScopes(['*']);
      return;
    }
    // Deselect wildcard when selecting individual scopes
    const withoutWildcard = selectedScopes.filter((s) => s !== '*');
    if (withoutWildcard.includes(scopeId)) {
      const next = withoutWildcard.filter((s) => s !== scopeId);
      setSelectedScopes(next.length > 0 ? next : ['*']);
    } else {
      setSelectedScopes([...withoutWildcard, scopeId]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error('At least one scope is required');
      return;
    }

    setIsCreating(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        scopes: selectedScopes,
        rate_limit_rpm: rateLimit,
      };
      if (expiresAt) {
        body.expires_at = new Date(expiresAt).toISOString();
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      onCreated(json.data.key);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-navy-700 bg-navy-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-navy-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-2">
            <Key className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-display text-lg text-white">Create API Key</h2>
            <p className="text-sm text-slate-400">Generate a new key for programmatic access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="key-name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Key Name
            </label>
            <input
              id="key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Pipeline, CI/CD Integration"
              maxLength={100}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              autoFocus
            />
          </div>

          {/* Scopes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Scopes</label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
                    selectedScopes.includes(scope.id)
                      ? 'border-teal-500/50 bg-teal-500/5'
                      : 'border-navy-700 bg-navy-800 hover:border-navy-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.id)}
                    onChange={() => toggleScope(scope.id)}
                    className="mt-0.5 rounded border-navy-600 bg-navy-700 text-teal-500 focus:ring-teal-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{scope.label}</div>
                    <div className="text-xs text-slate-400">{scope.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Rate Limit */}
          <div>
            <label htmlFor="rate-limit" className="mb-1.5 block text-sm font-medium text-slate-300">
              Rate Limit
            </label>
            <div className="flex items-center gap-3">
              <input
                id="rate-limit"
                type="range"
                min={10}
                max={1000}
                step={10}
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value, 10))}
                className="flex-1 accent-teal-500"
              />
              <span className="w-24 rounded-lg border border-navy-700 bg-navy-800 px-3 py-1.5 text-center font-mono text-sm text-white">
                {rateLimit} RPM
              </span>
            </div>
          </div>

          {/* Expiration */}
          <div>
            <label htmlFor="expires-at" className="mb-1.5 block text-sm font-medium text-slate-300">
              Expiration <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-navy-700 bg-navy-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
