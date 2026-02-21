'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/hooks/useUser';
import { Users, Plus, Mail, Shield, Crown } from 'lucide-react';

export default function TeamPage() {
  const { isTeam, plan } = useSubscription();
  const { user } = useUser();

  if (!isTeam) {
    return (
      <>
        <PageHeader
          title="Team"
          subtitle="Manage team members and permissions."
          badge="Team"
        />
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-display text-lg text-white mb-2">
            Team Plan Required
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Upgrade to the Team plan ($499/mo) to invite up to 5 team members,
            share reports, and collaborate on analyses.
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

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Manage team members and permissions."
        badge="Team"
        actions={
          <Button variant="primary" size="sm" disabled>
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        }
      />

      <div className="space-y-6 max-w-2xl">
        {/* Current Members */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Members (1/5)
            </h3>
          </div>

          <div className="divide-y divide-navy-700/60">
            {/* Owner */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-xs font-mono text-teal-400">
                    {(user?.email?.[0] ?? 'U').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white">{user?.email ?? 'You'}</p>
                  <p className="text-[10px] text-slate-500">Owner</p>
                </div>
              </div>
              <span className="badge-teal text-[10px] px-2 py-0.5">
                <Shield className="w-2.5 h-2.5 inline mr-1" />
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Invite */}
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-white mb-1">
                Invite Team Members
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                You have 4 remaining seats. Invited members get full access to
                all Pro features and can share reports within your organization.
              </p>
              <p className="text-xs text-slate-600">
                Team invitations coming soon. Contact{' '}
                <a
                  href="mailto:support@ambrosiaventures.co"
                  className="text-teal-400 hover:text-teal-300"
                >
                  support@ambrosiaventures.co
                </a>{' '}
                to add team members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
