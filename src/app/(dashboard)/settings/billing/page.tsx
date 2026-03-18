'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { PLAN_DISPLAY, PLAN_LIMITS, ENTERPRISE_FEATURES } from '@/lib/subscription';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  CreditCard,
  Crown,
  Zap,
  Check,
  ArrowRight,
  Loader2,
  Building2,
  Key,
  ShieldCheck,
  ScrollText,
  Users,
  FileText,
  Lock,
  Shield,
  Headphones,
} from 'lucide-react';
import type { Plan } from '@/types';

function PlanCard({
  plan,
  currentPlan,
  onUpgrade,
  upgrading,
  onManage,
  managingPortal,
}: {
  plan: Plan;
  currentPlan: Plan;
  onUpgrade: (plan: Plan) => void;
  upgrading: boolean;
  onManage: () => void;
  managingPortal: boolean;
}) {
  const display = PLAN_DISPLAY[plan];
  const isCurrent = plan === currentPlan;
  const isDowngrade = plan === 'free' && currentPlan !== 'free';

  return (
    <div className={`card p-5 ${isCurrent ? 'border-teal-500/40 bg-teal-500/5' : 'hover:border-navy-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">{display.name}</h3>
          {isCurrent && <span className="badge-teal text-2xs px-2 py-0.5">Current</span>}
          {'badge' in display && !isCurrent && (
            <span className="badge-amber text-2xs px-2 py-0.5">{display.badge}</span>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono text-lg text-white">{display.price}</span>
          {'period' in display && <span className="text-xs text-slate-500">{display.period}</span>}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">{display.tagline}</p>
      {!isCurrent && !isDowngrade && plan !== 'enterprise' && (
        <Button variant="primary" size="sm" className="w-full" onClick={() => onUpgrade(plan)} isLoading={upgrading}>
          <Zap className="w-3.5 h-3.5" />
          Upgrade to {display.name}
        </Button>
      )}
      {!isCurrent && plan === 'enterprise' && (
        <a
          href="mailto:enterprise@ambrosiaventures.co?subject=Enterprise%20Plan%20Inquiry"
          className="btn btn-primary btn-sm w-full inline-flex items-center justify-center gap-2"
        >
          <Building2 className="w-3.5 h-3.5" />
          Contact Sales
        </a>
      )}
      {isCurrent && currentPlan !== 'free' && currentPlan !== 'enterprise' && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onManage} isLoading={managingPortal}>
          {managingPortal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
          {managingPortal ? 'Opening...' : 'Manage Subscription'}
        </Button>
      )}
      {isCurrent && currentPlan === 'enterprise' && (
        <a
          href="mailto:enterprise@ambrosiaventures.co?subject=Enterprise%20Account%20Management"
          className="btn btn-ghost btn-sm w-full inline-flex items-center justify-center gap-2"
        >
          <Headphones className="w-3.5 h-3.5" />
          Contact Account Manager
        </a>
      )}
    </div>
  );
}

/** Enterprise feature icon mapping */
const ENTERPRISE_FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Unlimited seats': Users,
  'REST API access': Key,
  'SSO / SAML': ShieldCheck,
  'Audit log': ScrollText,
  'Role-based access control': Shield,
  'Information barriers': Lock,
  'White-label reports': FileText,
  'SLA & security review': Headphones,
  'All Pro features': Crown,
};

export default function BillingPage() {
  const { plan, isPro, isEnterprise, cancelAtPeriodEnd, currentPeriodEnd } = useSubscription();
  const { user } = useUser();
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const limits = PLAN_LIMITS[plan];

  async function handleOpenPortal() {
    setManagingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal.');
      }
    } catch {
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setManagingPortal(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    async function fetchUsage() {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data } = await supabase!
        .from('usage_events')
        .select('feature')
        .eq('user_id', user!.id)
        .gte('created_at', monthStart);

      if (data) {
        const counts: Record<string, number> = {};
        for (const row of data) {
          const feature = (row as { feature: string }).feature;
          counts[feature] = (counts[feature] || 0) + 1;
        }
        setUsage(counts);
      }
    }
    fetchUsage();
  }, [user]);

  async function handleUpgrade(targetPlan: Plan) {
    if (targetPlan === 'free' || targetPlan === 'enterprise') return;
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      }
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <ErrorBoundary>
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and payment methods."
        badge={isEnterprise ? 'Enterprise' : undefined}
      />

      <div className="space-y-6 max-w-2xl">
        {/* Current Plan Status */}
        {cancelAtPeriodEnd && currentPeriodEnd && (
          <div className="card noise p-4 border-amber-400/20 bg-amber-400/5">
            <p className="text-xs text-amber-400">
              Your subscription will cancel at the end of the current period (
              {new Date(currentPeriodEnd).toLocaleDateString()}). You will retain Pro access until then.
            </p>
          </div>
        )}

        {/* Enterprise Plan Feature Card — shown to enterprise users at the top */}
        {isEnterprise && (
          <div className="card noise p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-white">Enterprise Plan</h3>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full institutional-grade intelligence with security and compliance controls
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENTERPRISE_FEATURES.map((feature) => {
                const Icon = ENTERPRISE_FEATURE_ICONS[feature.label] ?? Check;
                return (
                  <div key={feature.label} className="flex items-start gap-3 p-3 rounded-lg bg-navy-900/40">
                    <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{feature.label}</p>
                      <p className="text-2xs text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-4 border-t border-navy-700/40">
              <p className="text-2xs text-slate-500">
                Need to adjust your plan or have questions?{' '}
                <a
                  href="mailto:enterprise@ambrosiaventures.co"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Contact your account manager
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Plans</h3>
          {(['free', 'pro', 'team', 'enterprise'] as Plan[]).map((p) => (
            <PlanCard
              key={p}
              plan={p}
              currentPlan={plan}
              onUpgrade={handleUpgrade}
              upgrading={upgrading}
              onManage={handleOpenPortal}
              managingPortal={managingPortal}
            />
          ))}
        </div>

        {/* Usage This Month */}
        <div className="card noise p-6">
          <h3 className="text-sm font-medium text-white mb-4">Usage This Month</h3>
          <div className="space-y-4">
            {[
              { label: 'Market Sizing Analyses', feature: 'market_sizing' as const },
              { label: 'Competitive Landscapes', feature: 'competitive' as const },
              { label: 'Saved Reports', feature: 'reports_saved' as const },
            ].map(({ label, feature }) => {
              const limit = (limits as Record<string, number | boolean>)[feature];
              const numLimit = typeof limit === 'number' ? limit : 0;
              const isUnlimited = numLimit === -1;
              const used = usage[feature] ?? 0;

              return (
                <div key={feature}>
                  <Progress label={label} value={used} max={isUnlimited ? 100 : numLimit} showValue={!isUnlimited} />
                  {isUnlimited && (
                    <span className="text-2xs font-mono text-teal-500 mt-0.5 block">Unlimited ({used} used)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pro Features — shown only to non-Pro users */}
        {!isPro && (
          <div className="card noise p-6 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Unlock Full Intelligence</h3>
                <ul className="space-y-1.5 mb-4">
                  {[
                    'Unlimited market sizing analyses',
                    'PDF & CSV report exports',
                    'Partner discovery & matching',
                    'Regulatory pathway analysis',
                    'Global geography coverage',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" size="sm" onClick={() => handleUpgrade('pro')} isLoading={upgrading}>
                  Upgrade to Pro
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
