'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/hooks/useUser';
import { Users, Shield, Crown, FileText, Globe, Zap, Mail } from 'lucide-react';

const TEAM_FEATURES = [
  { icon: Users, label: '5 team seats included' },
  { icon: FileText, label: 'Shared report library' },
  { icon: Globe, label: 'API access for integrations' },
  { icon: Zap, label: 'Priority support' },
];

export default function TeamPage() {
  const { isTeam } = useSubscription();
  const { user } = useUser();

  if (!isTeam) {
    return (
      <>
        <PageHeader
          title="Team"
          subtitle="Manage team members and permissions."
          badge="Team"
        />
        <div className="card noise p-12 text-center max-w-lg mx-auto">
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
      />

      <div className="space-y-6 max-w-2xl">
        {/* Current Members */}
        <div className="card noise overflow-hidden">
          <div className="px-5 py-3 border-b border-navy-700">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Members (1/5)
            </h3>
          </div>

          <div className="divide-y divide-navy-700/60">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-xs font-mono text-teal-400">
                    {(user?.email?.[0] ?? 'U').toUpperCase()}
                  </span>
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
          </div>
        </div>

        {/* Team Features + Contact */}
        <div className="card noise p-6">
          <h3 className="text-sm font-medium text-white mb-4">
            Team Features
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
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
          <div className="border-t border-navy-700 pt-4">
            <p className="text-xs text-slate-400 mb-3">
              To invite team members, contact our team and we&apos;ll get you set up within 24 hours.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.location.href = 'mailto:team@ambrosiaventures.co?subject=Terrain Team — Add Members';
              }}
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
