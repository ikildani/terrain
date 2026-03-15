'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import type { SSOConfig, WorkspaceRole } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface SSOConfigFormProps {
  config: SSOConfig | null;
  workspaceId: string;
  onSaved: () => void;
}

type SSOProvider = 'saml' | 'google_workspace' | 'azure_ad' | 'okta';

const PROVIDER_OPTIONS: { value: SSOProvider; label: string; guidance: string }[] = [
  {
    value: 'saml',
    label: 'SAML 2.0',
    guidance: 'Paste the SAML metadata URL from your Identity Provider.',
  },
  {
    value: 'okta',
    label: 'Okta',
    guidance: 'In Okta admin, create a SAML 2.0 app integration and paste the metadata URL here.',
  },
  {
    value: 'azure_ad',
    label: 'Azure AD (Entra ID)',
    guidance: 'In Azure AD, register an enterprise application and paste the federation metadata URL.',
  },
  {
    value: 'google_workspace',
    label: 'Google Workspace',
    guidance: 'In Google Admin > Apps > SAML apps, configure the application and provide the SSO URL.',
  },
];

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'viewer', label: 'Viewer' },
];

const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function SSOConfigForm({ config, workspaceId, onSaved }: SSOConfigFormProps) {
  const [provider, setProvider] = useState<SSOProvider>(config?.provider ?? 'saml');
  const [domain, setDomain] = useState(config?.domain ?? '');
  const [metadataUrl, setMetadataUrl] = useState(config?.metadata_url ?? '');
  const [enforceSso, setEnforceSso] = useState(config?.enforce_sso ?? false);
  const [autoProvision, setAutoProvision] = useState(config?.auto_provision ?? true);
  const [defaultRole, setDefaultRole] = useState<string>(config?.default_role ?? 'analyst');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!config;
  const selectedProvider = PROVIDER_OPTIONS.find((p) => p.value === provider);

  // ── Validation ───────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!domain.trim()) {
      newErrors.domain = 'Domain is required.';
    } else if (!DOMAIN_REGEX.test(domain.trim())) {
      newErrors.domain = 'Enter a valid domain (e.g., company.com).';
    }

    if (metadataUrl && !metadataUrl.startsWith('https://')) {
      newErrors.metadata_url = 'Metadata URL must use HTTPS.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Save handler ─────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const body = {
        provider,
        domain: domain.trim(),
        metadata_url: metadataUrl.trim() || null,
        enforce_sso: enforceSso,
        auto_provision: autoProvision,
        default_role: defaultRole,
      };

      const res = await fetch(`/api/workspaces/${workspaceId}/sso`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to save SSO configuration');
      }

      toast.success(isEditing ? 'SSO configuration updated' : 'SSO configuration created');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SSO configuration');
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete handler ───────────────────────────────────────
  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to remove the SSO configuration? Members will need to sign in with email/password.',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/sso`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to delete SSO configuration');
      }

      toast.success('SSO configuration removed');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete SSO configuration');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* IdP callout */}
      <div className="card noise p-4 border-l-4 border-amber-400/50 bg-amber-400/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Identity Provider configuration required</p>
            <p className="text-2xs text-slate-400 mt-1 leading-relaxed">
              After saving this configuration, you will need to complete the setup in your Identity Provider&apos;s
              admin console and the Supabase dashboard. Terrain stores the SSO config but full IdP integration requires
              additional steps.
            </p>
          </div>
        </div>
      </div>

      {/* Provider selector */}
      <div>
        <label className="label text-slate-400 mb-1.5 block">SSO Provider</label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setProvider(opt.value)}
              className={`px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                provider === opt.value
                  ? 'border-teal-500/40 bg-teal-500/10 text-teal-400'
                  : 'border-navy-700 bg-navy-800 text-slate-400 hover:border-navy-600 hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {selectedProvider && <p className="text-2xs text-slate-500 mt-2">{selectedProvider.guidance}</p>}
      </div>

      {/* Domain */}
      <div>
        <label className="label text-slate-400 mb-1.5 block" htmlFor="sso-domain">
          Email Domain
        </label>
        <input
          id="sso-domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="company.com"
          className="input bg-navy-800 border-navy-700 text-white w-full"
        />
        {errors.domain && <p className="text-2xs text-red-400 mt-1">{errors.domain}</p>}
        <p className="text-2xs text-slate-500 mt-1">Users with this email domain will be able to sign in via SSO.</p>
      </div>

      {/* Metadata URL */}
      <div>
        <label className="label text-slate-400 mb-1.5 block" htmlFor="sso-metadata">
          Metadata URL
        </label>
        <input
          id="sso-metadata"
          type="url"
          value={metadataUrl}
          onChange={(e) => setMetadataUrl(e.target.value)}
          placeholder="https://your-idp.com/saml/metadata"
          className="input bg-navy-800 border-navy-700 text-white w-full"
        />
        {errors.metadata_url && <p className="text-2xs text-red-400 mt-1">{errors.metadata_url}</p>}
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Enforce SSO</p>
            <p className="text-2xs text-slate-500">
              Require all members to sign in via SSO. Disables email/password login.
            </p>
          </div>
          <button
            onClick={() => setEnforceSso(!enforceSso)}
            className={`relative w-11 h-6 rounded-full transition-colors ${enforceSso ? 'bg-teal-500' : 'bg-navy-700'}`}
            role="switch"
            aria-checked={enforceSso}
            aria-label="Enforce SSO"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                enforceSso ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Auto-provision users</p>
            <p className="text-2xs text-slate-500">
              Automatically add new users who sign in via SSO to this workspace.
            </p>
          </div>
          <button
            onClick={() => setAutoProvision(!autoProvision)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoProvision ? 'bg-teal-500' : 'bg-navy-700'
            }`}
            role="switch"
            aria-checked={autoProvision}
            aria-label="Auto-provision users"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoProvision ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Default role */}
      <div>
        <label className="label text-slate-400 mb-1.5 block" htmlFor="sso-default-role">
          Default Role for New Members
        </label>
        <select
          id="sso-default-role"
          value={defaultRole}
          onChange={(e) => setDefaultRole(e.target.value)}
          className="input bg-navy-800 border-navy-700 text-white w-48"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-2xs text-slate-500 mt-1">
          Role assigned to users who are automatically provisioned via SSO.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-navy-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary btn-sm inline-flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : isEditing ? 'Update Configuration' : 'Save Configuration'}
        </button>

        {isEditing && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Removing...' : 'Remove SSO'}
          </button>
        )}
      </div>
    </div>
  );
}
