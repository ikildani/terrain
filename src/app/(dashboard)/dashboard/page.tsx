import { PageHeader } from '@/components/layout/PageHeader';
import { BarChart3, Network, TestTube2, Users } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  { label: 'Market Sizing', desc: 'Quantify your opportunity', href: '/market-sizing', icon: BarChart3 },
  { label: 'Competitive', desc: 'Map the landscape', href: '/competitive', icon: Network },
  { label: 'Pipeline', desc: 'Track clinical trials', href: '/pipeline', icon: TestTube2 },
  { label: 'Partners', desc: 'Find BD matches', href: '/partners', icon: Users },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Welcome back. Start a new analysis or continue where you left off." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="card group hover:border-teal-500/30">
              <Icon className="w-5 h-5 text-teal-500 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{action.label}</h3>
              <p className="text-xs text-slate-500">{action.desc}</p>
            </Link>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="label mb-4">Recent Reports</h3>
          <p className="text-sm text-slate-500">No reports yet. Run your first analysis to get started.</p>
        </div>
        <div className="card">
          <h3 className="label mb-4">Alert Feed</h3>
          <p className="text-sm text-slate-500">No alerts configured. Set up alerts in Deal Alerts.</p>
        </div>
      </div>
    </>
  );
}
