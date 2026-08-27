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
  X,
  LayoutDashboard,
  ExternalLink,
  Lock,
  Library,
  Activity,
  BarChart2,
  FileStack,
  Key,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSubscription } from '@/hooks/useSubscription';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pro?: boolean;
  enterprise?: boolean;
  tourId?: string;
}

const NAV_SECTIONS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Intelligence',
    items: [
      { label: 'Market Sizing', href: '/market-sizing', icon: BarChart3, tourId: 'market-sizing' },
      { label: 'Competitive Landscape', href: '/competitive', icon: Network, tourId: 'competitive' },
    ],
  },
  {
    section: 'Deal Tools',
    items: [
      { label: 'Partner Discovery', href: '/partners', icon: Users, pro: true },
      { label: 'CDMO / CMO Matching', href: '/cdmo', icon: Activity, pro: true },
      { label: 'Regulatory Intel', href: '/regulatory', icon: Shield, pro: true },
    ],
  },
  {
    section: 'Workspace',
    items: [{ label: 'Saved Reports', href: '/reports', icon: FileText, tourId: 'reports' }],
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

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Report Library', href: '/workspace', icon: Library },
  { label: 'Activity', href: '/workspace/activity', icon: Activity },
  { label: 'Analytics', href: '/workspace/analytics', icon: BarChart2 },
  { label: 'Templates', href: '/workspace/templates', icon: FileStack },
  { label: 'Projects', href: '/workspace/projects', icon: Shield, enterprise: true },
];

const ENTERPRISE_ITEMS: NavItem[] = [
  { label: 'API Keys', href: '/settings/api-keys', icon: Key, enterprise: true },
  { label: 'SSO / SAML', href: '/settings/sso', icon: ShieldCheck, enterprise: true },
  { label: 'Audit Log', href: '/settings/audit-log', icon: ScrollText, enterprise: true },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isPro, isEnterprise, hasWorkspace } = useSubscription();
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
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={cn('sidebar', isOpen && 'open')}>
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
              className="lg:hidden p-2 rounded hover:bg-navy-800 transition-colors"
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
                <div className={cn('sidebar-section-label', hasActive && 'text-slate-300')}>{section.section}</div>
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
                      {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                    >
                      <Icon />
                      <span className="flex-1">{item.label}</span>
                      {item.pro && !isPro && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Team Workspace section — visible only for team/enterprise plans */}
          {hasWorkspace && (
            <div>
              <div
                className={cn(
                  'sidebar-section-label',
                  WORKSPACE_ITEMS.some((item) => isActive(item.href)) && 'text-slate-300',
                )}
              >
                Team Workspace
              </div>
              {WORKSPACE_ITEMS.map((item) => {
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
                    {item.enterprise && !isEnterprise && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Enterprise Controls — visible only for enterprise plan */}
          {isEnterprise && (
            <div>
              <div
                className={cn(
                  'sidebar-section-label',
                  ENTERPRISE_ITEMS.some((item) => isActive(item.href)) && 'text-slate-300',
                )}
              >
                <span className="flex items-center gap-1.5">
                  Enterprise
                  <span className="text-[7px] font-mono uppercase px-1 py-0.5 rounded-sm bg-[#1a152e] text-purple-400 border border-[#2e2450] leading-none">
                    ENT
                  </span>
                </span>
              </div>
              {ENTERPRISE_ITEMS.map((item) => {
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
                  </Link>
                );
              })}
            </div>
          )}

          {/* Settings submenu */}
          <div>
            <div className={cn('sidebar-section-label', settingsActive && 'text-slate-300')}>Settings</div>
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
        <div className="border-t border-navy-700 mx-3 mb-1" />
        <a
          href="https://ambrosiaventures.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-300"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          ambrosiaventures.co
        </a>
      </aside>
    </>
  );
}
