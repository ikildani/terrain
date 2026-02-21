'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { useSubscription } from '@/hooks/useSubscription';
import { PLAN_DISPLAY, PLAN_LIMITS } from '@/lib/subscription';
import {
  CreditCard,
  ExternalLink,
  Crown,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { Plan } from '@/types';

function PlanCard({
  plan,
  currentPlan,
  onUpgrade,
  upgrading,
}: {
  plan: Plan;
  currentPlan: Plan;
  onUpgrade: (plan: Plan) => void;
  upgrading: boolean;
}) {
  const display = PLAN_DISPLAY[plan];
  const isCurrent = plan === currentPlan;
  const isDowngrade = plan === 'free' && currentPlan !== 'free';

  return (
    <div
      className={`card p-5 ${
        isCurrent
          ? 'border-teal-500/40 bg-teal-500/5'
          : 'hover:border-navy-600'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">{display.name}</h3>
          {isCurrent && (
            <span className="badge-teal text-[10px] px-2 py-0.5">Current</span>
          )}
          {'badge' in display && !isCurrent && (
            <span className="badge-amber text-[10px] px-2 py-0.5">
              {display.badge}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono text-lg text-white">{display.price}</span>
          {'period' in display && (
            <span className="text-xs text-slate-500">{display.period}</span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">{display.tagline}</p>
      {!isCurrent && !isDowngrade && (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onUpgrade(plan)}
          isLoading={upgrading}
        >
          <Zap className="w-3.5 h-3.5" />
          Upgrade to {display.name}
        </Button>
      )}
      {isCurrent && currentPlan !== 'free' && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => openPortal()}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Manage Subscription
        </Button>
      )}
    </div>
  );
}

async function openPortal() {
  const res = await fetch('/api/stripe/portal', { method: 'POST' });
  const data = await res.json();
  if (data.success && data.data?.url) {
    window.location.href = data.data.url;
  }
}

export default function BillingPage() {
  const { plan, isPro, cancelAtPeriodEnd, currentPeriodEnd } =
    useSubscription();
  const [upgrading, setUpgrading] = useState(false);
  const limits = PLAN_LIMITS[plan];

  async function handleUpgrade(targetPlan: Plan) {
    if (targetPlan === 'free') return;
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
    <>
      <PageHeader
        title="Billing"
        subtitle="Manage your subscription and payment methods."
      />

      <div className="space-y-6 max-w-2xl">
        {/* Current Plan Status */}
        {cancelAtPeriodEnd && currentPeriodEnd && (
          <div className="card p-4 border-amber-400/20 bg-amber-400/5">
            <p className="text-xs text-amber-400">
              Your subscription will cancel at the end of the current period (
              {new Date(currentPeriodEnd).toLocaleDateString()}). You will
              retain Pro access until then.
            </p>
          </div>
        )}

        {/* Plan Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Plans
          </h3>
          {(['free', 'pro', 'team'] as Plan[]).map((p) => (
            <PlanCard
              key={p}
              plan={p}
              currentPlan={plan}
              onUpgrade={handleUpgrade}
              upgrading={upgrading}
            />
          ))}
        </div>

        {/* Usage This Month */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-white mb-4">
            Usage This Month
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Market Sizing Analyses', feature: 'market_sizing' as const },
              { label: 'Competitive Landscapes', feature: 'competitive' as const },
              { label: 'Saved Reports', feature: 'reports_saved' as const },
            ].map(({ label, feature }) => {
              const limit = (limits as Record<string, number | boolean>)[feature];
              const numLimit = typeof limit === 'number' ? limit : 0;
              const isUnlimited = numLimit === -1;

              return (
                <div key={feature}>
                  <Progress
                    label={label}
                    value={0}
                    max={isUnlimited ? 100 : numLimit}
                    showValue={!isUnlimited}
                  />
                  {isUnlimited && (
                    <span className="text-[10px] font-mono text-teal-500 mt-0.5 block">
                      Unlimited
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pro Features */}
        {!isPro && (
          <div className="card p-6 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Unlock Full Intelligence
                </h3>
                <ul className="space-y-1.5 mb-4">
                  {[
                    'Unlimited market sizing analyses',
                    'PDF & CSV report exports',
                    'Partner discovery & matching',
                    'Regulatory pathway analysis',
                    'Deal alert monitoring',
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-slate-400"
                    >
                      <Check className="w-3 h-3 text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpgrade('pro')}
                  isLoading={upgrading}
                >
                  Upgrade to Pro
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
