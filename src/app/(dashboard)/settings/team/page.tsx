'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { Users, Shield, Crown, FileText, Globe, Zap, UserPlus, X, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const TEAM_FEATURES = [
  { icon: Users, label: '5 team seats included' },
  { icon: FileText, label: 'Shared report library' },
  { icon: Globe, label: 'API access for integrations' },
  { icon: Zap, label: 'Priority support' },
];

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
}

export default function TeamPage() {
  const { isTeam } = useSubscription();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members);
        setInvitations(data.data.invitations);
      }
    } catch {
      toast.error('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isTeam) fetchTeam();
  }, [isTeam, fetchTeam]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setInviting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          data.data.autoLinked
            ? `${email} was already on Terrain and has been added to your team.`
            : `Invitation sent to ${email}.`,
        );
        setEmail('');
        fetchTeam();
      } else {
        toast.error(data.error || 'Failed to send invitation.');
      }
    } catch {
      toast.error('Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const res = await fetch(`/api/team?memberId=${memberId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Member removed.');
        fetchTeam();
      } else {
        toast.error(data.error || 'Failed to remove member.');
      }
    } catch {
      toast.error('Failed to remove member.');
    }
  }

  async function handleRevokeInvite(invitationId: string) {
    try {
      const res = await fetch(`/api/team?invitationId=${invitationId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Invitation revoked.');
        fetchTeam();
      } else {
        toast.error(data.error || 'Failed to revoke invitation.');
      }
    } catch {
      toast.error('Failed to revoke invitation.');
    }
  }

  // ── Non-team upgrade gate ──────────────────────────────
  if (!isTeam) {
    return (
      <>
        <PageHeader title="Team" subtitle="Manage team members and permissions." badge="Team" />
        <div className="card noise p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">Team Plan Required</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Upgrade to the Team plan ($499/mo) to invite up to 5 team members, share reports, and collaborate on
            analyses.
          </p>
          <Button
            variant="primary"
            onClick={async () => {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'team' }),
              });
              const data = await res.json();
              if (data.success && data.data?.url) {
                window.location.href = data.data.url;
              }
            }}
          >
            <Crown className="w-4 h-4" />
            Upgrade to Team
          </Button>
        </div>
      </>
    );
  }

  // ── Team management UI ─────────────────────────────────
  const pendingInvites = invitations.filter((i) => i.status === 'pending');
  const totalSeats = 1 + members.length + pendingInvites.length;

  return (
    <>
      <PageHeader title="Team" subtitle="Manage team members and permissions." badge="Team" />

      <div className="space-y-6 max-w-2xl">
        {/* Invite Form */}
        <div className="card noise p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-medium text-white">Invite Team Member</h3>
            <span className="ml-auto text-2xs font-mono text-slate-500">{totalSeats}/5 seats used</span>
          </div>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="input flex-1"
              required
              disabled={totalSeats >= 5}
            />
            <Button type="submit" variant="primary" size="sm" disabled={inviting || totalSeats >= 5}>
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              {inviting ? 'Sending...' : 'Invite'}
            </Button>
          </form>
          {totalSeats >= 5 && (
            <p className="text-2xs text-amber-400 mt-2">
              All 5 seats are used. Remove a member or revoke an invitation to invite someone new.
            </p>
          )}
        </div>

        {/* Current Members */}
        <div className="card noise overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Members ({1 + members.length})
            </h3>
          </div>

          <div className="divide-y divide-navy-700/60">
            {/* Owner (you) */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-xs font-mono text-teal-400">{(user?.email?.[0] ?? 'U').toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm text-white">{user?.email ?? 'You'}</p>
                  <p className="text-2xs text-slate-500">Owner</p>
                </div>
              </div>
              <span className="badge-teal text-2xs px-2 py-0.5">
                <Shield className="w-2.5 h-2.5 inline mr-1" />
                Admin
              </span>
            </div>

            {/* Team members */}
            {members.map((member) => (
              <div key={member.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center">
                    <span className="text-xs font-mono text-slate-400">{(member.email?.[0] ?? 'U').toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white">{member.full_name || member.email}</p>
                    <p className="text-2xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-2xs text-signal-green">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-signal-red transition-colors"
                    title="Remove member"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {loading && members.length === 0 && (
              <div className="px-5 py-6 text-center text-2xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-slate-600" />
                Loading team...
              </div>
            )}
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <div className="card noise overflow-hidden">
            <div className="px-5 py-3 border-b border-navy-700">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Pending Invitations ({pendingInvites.length})
              </h3>
            </div>
            <div className="divide-y divide-navy-700/60">
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">{inv.email}</p>
                      <p className="text-2xs text-slate-500">
                        Invited{' '}
                        {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-amber-400">Pending</span>
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-signal-red transition-colors"
                      title="Revoke invitation"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Features */}
        <div className="card noise p-6">
          <h3 className="text-sm font-medium text-white mb-4">Team Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {TEAM_FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded bg-navy-800 border border-navy-700"
              >
                <Icon className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
