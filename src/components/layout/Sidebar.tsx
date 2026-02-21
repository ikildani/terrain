'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Network,
  TestTube2,
  Users,
  Shield,
  Bell,
  FileText,
  Settings,
  CreditCard,
  UsersRound,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSubscription } from '@/hooks/useSubscription';
import { PLAN_DISPLAY } from '@/lib/subscription';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pro?: boolean;
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Intelligence',
    items: [
      { label: 'Market Sizing', href: '/market-sizing', icon: BarChart3 },
      { label: 'Competitive Landscape', href: '/competitive', icon: Network },
      { label: 'Pipeline Intelligence', href: '/pipeline', icon: TestTube2 },
    ],
  },
  {
    section: 'Deal Tools',
    items: [
      { label: 'Partner Discovery', href: '/partners', icon: Users, pro: true },
      { label: 'Regulatory Intel', href: '/regulatory', icon: Shield, pro: true },
      { label: 'Deal Alerts', href: '/alerts', icon: Bell, pro: true },
    ],
  },
  {
    section: 'Workspace',
    items: [
      { label: 'Saved Reports', href: '/reports', icon: FileText },
    ],
  },
];

const SETTINGS_ITEMS = [
  { label: 'Profile', href: '/settings', icon: Settings },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
  { label: 'Team', href: '/settings/team', icon: UsersRound },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { plan, isPro } = useSubscription();
  const settingsActive = pathname.startsWith('/settings');

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  function sectionHasActive(items: NavItem[]) {
    return items.some((item) => isActive(item.href));
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'sidebar',
          isOpen && 'open'
        )}
      >
        {/* Logo + mobile close */}
        <div className="sidebar-logo flex items-center justify-between">
          <Link href="/dashboard" className="block">
            <span className="font-display text-xl text-white">Terrain</span>
            <span className="block text-2xs font-mono text-teal-500 tracking-widest uppercase mt-0.5">
              Market Intelligence
            </span>
          </Link>
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-navy-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => {
            const hasActive = sectionHasActive(section.items);
            return (
              <div key={section.section}>
                <div
                  className={cn(
                    'sidebar-section-label',
                    hasActive && 'text-slate-300'
                  )}
                >
                  {section.section}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn('sidebar-nav-item', active && 'active')}
                    >
                      <Icon />
                      <span className="flex-1">{item.label}</span>
                      {item.pro && !isPro && (
                        <span className="badge-pro text-[9px] px-1.5 py-0.5">
                          PRO
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Settings submenu */}
          <div>
            <div
              className={cn(
                'sidebar-section-label',
                settingsActive && 'text-slate-300'
              )}
            >
              Settings
            </div>
            {SETTINGS_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn('sidebar-nav-item', active && 'active')}
                >
                  <Icon />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Upgrade card — hidden for team plan */}
        {plan !== 'team' && (
          <div className="sidebar-upgrade-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">
                {plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Team'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {plan === 'free'
                ? 'Unlock partner discovery, regulatory intel, deal alerts, and export capabilities.'
                : `Add ${PLAN_DISPLAY.team.name} features: ${PLAN_DISPLAY.team.tagline}`}
            </p>
            <Link
              href="/settings/billing"
              className="btn btn-primary btn-sm w-full mt-3"
            >
              {plan === 'free' ? 'View Plans' : 'Manage Plan'}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
