import { Lock } from 'lucide-react';
import Link from 'next/link';

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
}

export function UpgradeGate({ feature, children }: UpgradeGateProps) {
  return (
    <div className="upgrade-gate">
      <div className="upgrade-gate-blur">{children}</div>
      <div className="upgrade-gate-overlay">
        <Lock className="w-6 h-6 text-teal-500 mb-3" />
        <h3 className="font-body text-base font-semibold text-white mb-1.5">{feature}</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-1.5">
          This analysis requires a Pro subscription. Pro includes unlimited market sizing, competitive landscapes,
          partner discovery, regulatory intelligence, and PDF export.
        </p>
        <p className="text-xs text-teal-400 font-medium mb-4">Start with a 7-day free trial — no commitment.</p>
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-2 px-5 py-2 bg-teal-500 text-white text-sm font-semibold rounded hover:bg-teal-400 transition-colors"
        >
          Start 7-Day Free Trial
        </Link>
      </div>
    </div>
  );
}
