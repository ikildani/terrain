'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ChevronRight, Settings, CreditCard, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/client';
import { PLAN_DISPLAY } from '@/lib/subscription';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'market-sizing': 'Market Sizing',
  competitive: 'Competitive Landscape',
  partners: 'Partner Discovery',
  regulatory: 'Regulatory Intel',
  reports: 'Saved Reports',
  settings: 'Settings',
  billing: 'Billing',
  team: 'Team',
};

interface TopbarProps {
  onMenuToggle: () => void;
  onSearchClick?: () => void;
}

export function Topbar({ onMenuToggle, onSearchClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { fullName, initials } = useProfile();
  const { plan } = useSubscription();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  }

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
                <Link href={crumb.href} className="text-slate-500 hover:text-slate-300 transition-colors truncate">
                  {crumb.label}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              </>
            )}
          </span>
        ))}
      </nav>

      {/* Search — mobile icon */}
      <button
        onClick={onSearchClick}
        className="md:hidden p-1.5 rounded-md hover:bg-navy-800 transition-colors"
        aria-label="Open search (⌘K)"
      >
        <Search className="w-4.5 h-4.5 text-slate-400" />
      </button>

      {/* Search — desktop bar */}
      <button
        onClick={onSearchClick}
        aria-label="Open command palette (⌘K)"
        className="relative max-w-xs hidden md:flex items-center gap-2 pl-9 pr-3 py-1.5 text-sm text-slate-500 bg-navy-800 border border-transparent hover:border-navy-600 rounded-md w-64 transition-colors cursor-pointer"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <span>Search pages & reports...</span>
        <kbd className="ml-auto text-2xs font-mono text-slate-600 bg-navy-900 border border-navy-700 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>

      {/* User dropdown */}
      <div className="relative ml-3" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-navy-800 transition-colors"
          aria-label="User menu"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          <div className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-teal-400">{initials}</span>
          </div>
          <span className={cn('badge text-[9px] px-1.5 py-0', plan === 'free' ? 'badge-slate' : 'badge-pro')}>
            {planDisplay.name}
          </span>
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-navy-800 border border-navy-700 rounded-lg shadow-elevated py-1 z-50"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-navy-700">
              <p className="text-sm text-slate-200 font-medium">{fullName || user?.email || 'Guest'}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan === 'free' ? 'Free Plan' : `${planDisplay.name} Plan`}
              </p>
            </div>
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link
                href="/settings/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
                role="menuitem"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </Link>
            </div>
            <div className="border-t border-navy-700 py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-navy-700 transition-colors w-full text-left"
                role="menuitem"
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
