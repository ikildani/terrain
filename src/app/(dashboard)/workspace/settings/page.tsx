'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, ArrowRight, Upload, Palette, Type, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useSubscription } from '@/hooks/useSubscription';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { createClient } from '@/lib/supabase/client';

function SettingsContent() {
  const { isLoading: subLoading, hasWorkspace } = useSubscription();
  const { activeWorkspace, activeWorkspaceId, myRole, isLoading: wsLoading, refetch } = useWorkspace();

  const isLoading = subLoading || wsLoading;
  const canManage = myRole === 'owner' || myRole === 'admin';

  // Branding state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#00C9A7');
  const [footerText, setFooterText] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // General state
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Load branding settings
  useEffect(() => {
    if (!activeWorkspace) return;
    setWorkspaceName(activeWorkspace.name);
    setLogoUrl(activeWorkspace.logo_url);
    setPrimaryColor(activeWorkspace.brand_primary_color || '#00C9A7');
    setFooterText(activeWorkspace.brand_footer_text || '');
  }, [activeWorkspace]);

  // ── Logo Upload ────────────────────────────────────────
  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeWorkspaceId) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }

      setIsUploadingLogo(true);
      try {
        const supabase = createClient();
        const ext = file.name.split('.').pop() ?? 'png';
        const filePath = `${activeWorkspaceId}/logo.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('workspace-logos')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          toast.error('Failed to upload logo');
          return;
        }

        const { data: urlData } = supabase.storage.from('workspace-logos').getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        setLogoUrl(publicUrl);

        // Save the URL to workspace branding
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}/branding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo_url: publicUrl }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error('Logo uploaded but failed to save URL');
          return;
        }

        toast.success('Logo uploaded');
        refetch();
      } catch {
        toast.error('Failed to upload logo');
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [activeWorkspaceId, refetch],
  );

  // ── Save Branding ─────────────────────────────────────
  const handleSaveBranding = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setIsSavingBranding(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_primary_color: primaryColor || null,
          brand_footer_text: footerText.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to save branding');
        return;
      }
      toast.success('Branding updated');
      refetch();
    } catch {
      toast.error('Failed to save branding');
    } finally {
      setIsSavingBranding(false);
    }
  }, [activeWorkspaceId, primaryColor, footerText, refetch]);

  // ── Save General ──────────────────────────────────────
  const handleSaveGeneral = useCallback(async () => {
    if (!activeWorkspaceId || !workspaceName.trim()) return;
    setIsSavingGeneral(true);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to update workspace');
        return;
      }
      toast.success('Workspace updated');
      refetch();
    } catch {
      toast.error('Failed to update workspace');
    } finally {
      setIsSavingGeneral(false);
    }
  }, [activeWorkspaceId, workspaceName, refetch]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-6 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card noise animate-pulse p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
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
        <PageHeader title="Settings" subtitle="Manage workspace settings and branding." />
        <div className="card noise p-12 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
            <Building2 className="w-7 h-7 text-teal-500" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team workspaces</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Upgrade to the Team plan to access workspace settings, branding, and team management.
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
      <PageHeader title="Settings" subtitle={activeWorkspace.name} badge="Team" />

      <div className="space-y-6 max-w-2xl">
        {/* ── General ──────────────────────────────────────── */}
        <div className="card noise p-6">
          <h3 className="font-display text-base text-white mb-4">General</h3>

          <div className="space-y-4">
            <div>
              <label className="label text-slate-400 mb-1 block">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={!canManage}
                className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="label text-slate-400 mb-1 block">Slug</label>
              <input
                type="text"
                value={activeWorkspace.slug}
                disabled
                className="w-full px-3 py-2 bg-navy-900/40 border border-navy-700/30 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-2xs text-slate-600 mt-1">Workspace slug cannot be changed.</p>
            </div>

            {canManage && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveGeneral}
                  disabled={isSavingGeneral || !workspaceName.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {isSavingGeneral ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Branding ─────────────────────────────────────── */}
        <div className="card noise p-6">
          <h3 className="font-display text-base text-white mb-4">Branding</h3>
          <p className="text-xs text-slate-500 mb-5">
            Customize the logo, accent color, and footer text used in exported PDF and Excel reports.
          </p>

          <div className="space-y-5">
            {/* Logo */}
            <div>
              <label className="label text-slate-400 mb-2 block">
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Logo
              </label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="w-16 h-16 rounded-lg border border-navy-700/40 bg-navy-900/60 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Workspace logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-navy-700/40 bg-navy-900/60 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-navy-600" />
                  </div>
                )}
                {canManage && (
                  <label className="btn btn-ghost btn-sm cursor-pointer">
                    {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </label>
                )}
              </div>
              <p className="text-2xs text-slate-600 mt-1">PNG or SVG, max 2MB. Appears in exported reports.</p>
            </div>

            {/* Primary Color */}
            <div>
              <label className="label text-slate-400 mb-2 block">
                <Palette className="w-3.5 h-3.5 inline mr-1.5" />
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border border-navy-700/40"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  disabled={!canManage}
                  maxLength={9}
                  className="w-32 px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                  placeholder="#00C9A7"
                />
              </div>
              <p className="text-2xs text-slate-600 mt-1">Hex color for accent lines in PDF/Excel exports.</p>
            </div>

            {/* Footer Text */}
            <div>
              <label className="label text-slate-400 mb-2 block">
                <Type className="w-3.5 h-3.5 inline mr-1.5" />
                Footer Text
              </label>
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                disabled={!canManage}
                maxLength={200}
                rows={2}
                className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none disabled:opacity-50"
                placeholder="CONFIDENTIAL — Generated by Terrain"
              />
              <p className="text-2xs text-slate-600 mt-1">Replaces default footer in exports. Max 200 characters.</p>
            </div>

            {canManage && (
              <div className="flex justify-end">
                <button onClick={handleSaveBranding} disabled={isSavingBranding} className="btn btn-primary btn-sm">
                  {isSavingBranding ? 'Saving...' : 'Save Branding'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Danger Zone ──────────────────────────────────── */}
        {myRole === 'owner' && (
          <div className="card noise p-6 border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="font-display text-base text-red-400">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Permanently delete this workspace and all its data. This action cannot be undone.
            </p>
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  `Are you sure you want to delete "${activeWorkspace.name}"? All reports, templates, and settings will be permanently lost.`,
                );
                if (!confirmed) return;
                // Double confirm
                const name = window.prompt(`Type "${activeWorkspace.name}" to confirm deletion:`);
                if (name !== activeWorkspace.name) {
                  toast.error('Workspace name did not match');
                  return;
                }
                fetch(`/api/workspaces/${activeWorkspaceId}`, { method: 'DELETE' })
                  .then((res) => res.json())
                  .then((json) => {
                    if (json.success) {
                      toast.success('Workspace deleted');
                      refetch();
                    } else {
                      toast.error(json.error ?? 'Failed to delete workspace');
                    }
                  })
                  .catch(() => toast.error('Failed to delete workspace'));
              }}
              className="btn btn-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 inline-flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Workspace
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function WorkspaceSettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  );
}
