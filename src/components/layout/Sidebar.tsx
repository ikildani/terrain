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
  CreditCard,
  UsersRound,
  Sparkles,
  X,
  LayoutDashboard,
  ExternalLink,
  Lock,
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
    section: 'Modules',
    items: [
      { label: 'Market Sizing', href: '/market-sizing', icon: BarChart3 },
      { label: 'Competitive Landscape', href: '/competitive', icon: Network },
      { label: 'Partner Discovery', href: '/partners', icon: Users, pro: true },
      { label: 'Regulatory Intel', href: '/regulatory', icon: Shield, pro: true },
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
          {/* Dashboard home */}
          <Link
            href="/dashboard"
            onClick={onClose}
            className={cn('sidebar-nav-item', pathname === '/dashboard' && 'active')}
            aria-current={pathname === '/dashboard' ? 'page' : undefined}
          >
            <LayoutDashboard />
            <span className="flex-1">Dashboard</span>
          </Link>

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
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon />
                      <span className="flex-1">{item.label}</span>
                      {item.pro && !isPro && (
                        <span className="badge-pro text-[9px] px-1.5 py-0.5 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
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
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Ambrosia Ventures */}
        <a
          href="https://ambrosiaventures.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          ambrosiaventures.co
        </a>

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
                ? 'Unlock partner discovery, regulatory intel, and export capabilities.'
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
