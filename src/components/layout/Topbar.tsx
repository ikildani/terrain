'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  User,
  ChevronRight,
  Settings,
  CreditCard,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';
import { PLAN_DISPLAY } from '@/lib/subscription';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'market-sizing': 'Market Sizing',
  competitive: 'Competitive Landscape',
  pipeline: 'Pipeline Intelligence',
  partners: 'Partner Discovery',
  regulatory: 'Regulatory Intel',
  alerts: 'Deal Alerts',
  reports: 'Saved Reports',
  settings: 'Settings',
  billing: 'Billing',
  team: 'Team',
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { plan } = useSubscription();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] || seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const planDisplay = PLAN_DISPLAY[plan];
  const initials = user ? 'U' : 'T';

  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden mr-3 p-1.5 rounded-md hover:bg-navy-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-slate-400" />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm flex-1 min-w-0" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {crumb.isLast ? (
              <span className="text-slate-200 font-medium truncate">{crumb.label}</span>
            ) : (
              <>
                <Link
                  href={crumb.href}
                  className="text-slate-500 hover:text-slate-300 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              </>
            )}
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="relative max-w-xs hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search indications, companies..."
          className="input pl-9 py-1.5 text-sm bg-navy-800 border-transparent focus:border-teal-500 w-64"
        />
      </div>

      {/* User dropdown */}
      <div className="relative ml-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-navy-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-teal-400">{initials}</span>
          </div>
          <span className={cn('badge text-[9px] px-1.5 py-0', plan === 'free' ? 'badge-slate' : 'badge-pro')}>
            {planDisplay.name}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated py-1 z-50">
            <div className="px-4 py-3 border-b border-navy-700">
              <p className="text-sm text-slate-200 font-medium">
                {user ? 'User' : 'Guest'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan === 'free' ? 'Free Plan' : `${planDisplay.name} Plan`}
              </p>
            </div>
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </div>
            <div className="border-t border-navy-700 py-1">
              <button
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-navy-700 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
