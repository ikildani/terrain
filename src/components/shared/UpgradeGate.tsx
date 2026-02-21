import { Lock, Sparkles } from 'lucide-react';
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
        <Lock className="w-8 h-8 text-teal-500 mb-4" />
        <h3 className="font-display text-lg text-white mb-2">
          Upgrade to Pro
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mb-4">
          {feature} is available on the Pro plan. Upgrade to unlock full
          intelligence capabilities.
        </p>
        <Link href="/settings/billing" className="btn btn-primary">
          <Sparkles className="w-4 h-4" />
          View Plans
        </Link>
      </div>
    </div>
  );
}
