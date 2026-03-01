'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe, Copy, Check, Trash2, Link2, Lock, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, apiDelete } from '@/lib/utils/api';
import { cn } from '@/lib/utils/cn';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  isPro: boolean;
}

interface ShareEntry {
  id: string;
  email: string;
  full_name: string | null;
  permission: string;
  created_at: string;
}

interface PublicShareData {
  id: string;
  share_token: string;
  allow_download: boolean;
  view_count: number;
  expires_at: string | null;
  created_at: string;
}

export function ShareModal({ isOpen, onClose, reportId, reportTitle, isPro }: ShareModalProps) {
  const [tab, setTab] = useState<'team' | 'public'>('team');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const queryClient = useQueryClient();

  // ── Team Shares ────────────────────────────────────────────
  const { data: shares = [] } = useQuery({
    queryKey: ['report-shares', reportId],
    queryFn: async () => {
      const res = await apiGet<ShareEntry[]>(`/api/reports/${reportId}/shares`);
      return res.success && res.data ? res.data : [];
    },
    enabled: isOpen && isPro,
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiPost<{ shared_count: number; not_found_emails: string[] }>(
        `/api/reports/${reportId}/shares`,
        { emails: [email], permission },
      );
      if (!res.success) throw new Error(res.error || 'Failed to share');
      return res.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['report-shares', reportId] });
      if (data.not_found_emails.length > 0) {
        toast.error(`User not found: ${data.not_found_emails.join(', ')}`);
      } else {
        toast.success('Report shared');
      }
      setEmail('');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to share'),
  });

  const revokeMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const res = await apiDelete(`/api/reports/${reportId}/shares?shareId=${shareId}`);
      if (!res.success) throw new Error('Failed to revoke');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-shares', reportId] });
      toast.success('Share revoked');
    },
  });

  // ── Public Share ───────────────────────────────────────────
  const { data: publicShare } = useQuery({
    queryKey: ['public-share', reportId],
    queryFn: async () => {
      const res = await apiGet<PublicShareData | null>(`/api/reports/${reportId}/share/public`);
      return res.success ? res.data || null : null;
    },
    enabled: isOpen && isPro,
  });

  const createPublicMutation = useMutation({
    mutationFn: async () => {
      const res = await apiPost<PublicShareData>(`/api/reports/${reportId}/share/public`, { allow_download: false });
      if (!res.success) throw new Error(res.error || 'Failed to create link');
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-share', reportId] });
      toast.success('Public link created');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to create link'),
  });

  const toggleDownloadMutation = useMutation({
    mutationFn: async (allowDownload: boolean) => {
      // Regenerate with new setting
      const res = await apiPost<PublicShareData>(`/api/reports/${reportId}/share/public`, {
        allow_download: allowDownload,
      });
      if (!res.success) throw new Error(res.error || 'Failed to update');
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-share', reportId] });
    },
  });

  const revokePublicMutation = useMutation({
    mutationFn: async () => {
      const res = await apiDelete(`/api/reports/${reportId}/share/public`);
      if (!res.success) throw new Error('Failed to revoke');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-share', reportId] });
      setConfirmRevoke(false);
      toast.success('Public link revoked');
    },
  });

  const shareUrl = publicShare
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${publicShare.share_token}`
    : '';

  const copyLink = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    shareMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="card noise w-full max-w-lg"
            role="dialog"
            aria-modal="true"
            aria-label={`Share ${reportTitle}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="font-display text-lg text-white">Share Report</h2>
                <p className="text-xs text-slate-500 mt-1 truncate max-w-[300px]">{reportTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-navy-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 mt-4">
              {[
                { key: 'team' as const, label: 'Team', icon: Users },
                { key: 'public' as const, label: 'Public Link', icon: Globe },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all',
                    tab === key
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              {!isPro ? (
                <div className="text-center py-8">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-1">Team plan required</p>
                  <p className="text-xs text-slate-500 mb-4">Upgrade to Team to share reports with your team.</p>
                  <a href="/settings/billing" className="btn btn-primary text-xs px-4 py-2">
                    Upgrade to Team
                  </a>
                </div>
              ) : tab === 'team' ? (
                <div className="space-y-4">
                  {/* Share form */}
                  <form onSubmit={handleShare} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="input flex-1 text-sm"
                    />
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                      className="input w-24 text-xs"
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!email.trim() || shareMutation.isPending}
                      className="btn btn-primary text-xs px-4"
                    >
                      Share
                    </button>
                  </form>

                  {/* Existing shares */}
                  {shares.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-2xs text-slate-500 font-mono uppercase tracking-wider">Shared with</p>
                      {shares.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between py-2 px-3 bg-navy-800/50 rounded-md"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-mono text-teal-400">
                                {(s.full_name || s.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-slate-200 truncate">{s.full_name || s.email}</p>
                              {s.full_name && <p className="text-2xs text-slate-500 truncate">{s.email}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-2xs font-mono text-slate-500 uppercase">{s.permission}</span>
                            <button
                              onClick={() => revokeMutation.mutate(s.id)}
                              className="p-1.5 rounded hover:bg-navy-700 transition-colors"
                              aria-label={`Remove ${s.email}`}
                            >
                              <X className="w-3 h-3 text-slate-500 hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">
                      Not shared with anyone yet. Enter an email above.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {publicShare ? (
                    <>
                      {/* Link display */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="input flex-1 font-mono text-xs text-teal-400 bg-navy-800"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button onClick={copyLink} className="btn btn-primary px-3" aria-label="Copy link">
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Options */}
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-slate-400">Allow PDF download</span>
                        <button
                          onClick={() => toggleDownloadMutation.mutate(!publicShare.allow_download)}
                          className={cn(
                            'w-9 h-5 rounded-full transition-colors relative',
                            publicShare.allow_download ? 'bg-teal-500' : 'bg-navy-700',
                          )}
                          role="switch"
                          aria-checked={publicShare.allow_download}
                          aria-label="Allow PDF download"
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                              publicShare.allow_download ? 'translate-x-4' : 'translate-x-0.5',
                            )}
                          />
                        </button>
                      </div>

                      {/* View count */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          <span className="font-mono text-teal-400">{publicShare.view_count}</span> views
                        </span>
                      </div>

                      {/* Revoke */}
                      {confirmRevoke ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-red-500/5 border border-red-500/20 rounded-md p-3 space-y-2"
                        >
                          <p className="text-xs text-red-400">This will permanently disable the public link.</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmRevoke(false)}
                              className="btn text-xs px-3 py-1.5 border border-navy-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => revokePublicMutation.mutate()}
                              disabled={revokePublicMutation.isPending}
                              className="btn text-xs px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-3 h-3" />
                              Revoke Link
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(true)}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          Revoke public link
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Link2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 mb-1">No public link</p>
                      <p className="text-xs text-slate-500 mb-4">
                        Create a shareable link anyone can use to view this report.
                      </p>
                      <button
                        onClick={() => createPublicMutation.mutate()}
                        disabled={createPublicMutation.isPending}
                        className="btn btn-primary text-xs px-4 py-2"
                      >
                        {createPublicMutation.isPending ? 'Creating...' : 'Create public link'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
