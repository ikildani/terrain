'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Network,
  Users,
  Shield,
  FileText,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pro?: boolean;
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Intelligence',
    items: [
      { label: 'Market Sizing', href: '/market-sizing', icon: BarChart3 },
      { label: 'Competitive Landscape', href: '/competitive', icon: Network },
    ],
  },
  {
    section: 'Deal Tools',
    items: [
      { label: 'Partner Discovery', href: '/partners', icon: Users, pro: true },
      { label: 'Regulatory Intel', href: '/regulatory', icon: Shield, pro: true },
    ],
  },
  {
    section: 'Workspace',
    items: [
      { label: 'Saved Reports', href: '/reports', icon: FileText },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/dashboard" className="block">
          <span className="font-display text-xl text-white">Terrain</span>
          <span className="block text-2xs font-mono text-teal-500 tracking-widest uppercase mt-0.5">
            Market Intelligence
          </span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('sidebar-nav-item', isActive && 'active')}
                >
                  <Icon />
                  <span className="flex-1">{item.label}</span>
                  {item.pro && (
                    <span className="badge-pro text-[9px] px-1.5 py-0.5">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-upgrade-card">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Unlock partner discovery, regulatory intel, deal alerts, and export
          capabilities.
        </p>
        <Link
          href="/settings/billing"
          className="btn btn-primary btn-sm w-full mt-3"
        >
          View Plans
        </Link>
      </div>
    </aside>
  );
}
