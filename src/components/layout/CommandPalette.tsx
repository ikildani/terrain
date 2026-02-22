'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  BarChart3,
  Network,
  Users,
  Shield,
  FileText,
  Settings,
  CreditCard,
  UsersRound,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useReports } from '@/hooks/useReports';
import { useSubscription } from '@/hooks/useSubscription';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Navigation' | 'Recent Reports';
  subtitle?: string;
  pro?: boolean;
}

const REPORT_TYPE_ROUTES: Record<string, string> = {
  market_sizing: '/market-sizing',
  competitive: '/competitive',
  pipeline: '/pipeline',
  regulatory: '/regulatory',
  partners: '/partners',
};

const NAV_COMMANDS: CommandItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { id: 'nav-market', label: 'Market Sizing', href: '/market-sizing', icon: BarChart3, category: 'Navigation' },
  { id: 'nav-competitive', label: 'Competitive Landscape', href: '/competitive', icon: Network, category: 'Navigation' },
  { id: 'nav-partners', label: 'Partner Discovery', href: '/partners', icon: Users, category: 'Navigation', pro: true },
  { id: 'nav-regulatory', label: 'Regulatory Intel', href: '/regulatory', icon: Shield, category: 'Navigation', pro: true },
  { id: 'nav-reports', label: 'Saved Reports', href: '/reports', icon: FileText, category: 'Navigation' },
  { id: 'nav-settings', label: 'Settings', href: '/settings', icon: Settings, category: 'Navigation' },
  { id: 'nav-billing', label: 'Billing', href: '/settings/billing', icon: CreditCard, category: 'Navigation' },
  { id: 'nav-team', label: 'Team', href: '/settings/team', icon: UsersRound, category: 'Navigation' },
];

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { reports } = useReports();
  const { isPro } = useSubscription();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems = useMemo(() => {
    const reportItems: CommandItem[] = reports.slice(0, 5).map((r) => ({
      id: `report-${r.id}`,
      label: r.title,
      href: `${REPORT_TYPE_ROUTES[r.report_type] ?? '/market-sizing'}/${r.id}`,
      icon: FileText,
      category: 'Recent Reports' as const,
      subtitle: r.indication,
    }));
    return [...NAV_COMMANDS, ...reportItems];
  }, [reports]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    return allItems.filter(
      (item) =>
        fuzzyMatch(query, item.label) ||
        (item.subtitle && fuzzyMatch(query, item.subtitle))
    );
  }, [query, allItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, handleSelect, onClose]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.category) || [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-lg shadow-elevated overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-700">
              <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and reports..."
                aria-label="Search pages and reports"
                aria-autocomplete="list"
                aria-controls="command-palette-results"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                style={{ fontFamily: 'Sora, sans-serif' }}
              />
              <kbd className="text-2xs font-mono text-slate-600 bg-navy-800 border border-navy-700 px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div id="command-palette-results" role="listbox" aria-label="Search results" className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-slate-500">No results found</p>
                  <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
                </div>
              ) : (
                Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5">
                      <span className="text-2xs font-mono text-slate-600 uppercase tracking-wider">
                        {category}
                      </span>
                    </div>
                    {items.map((item) => {
                      flatIndex++;
                      const idx = flatIndex;
                      const isSelected = idx === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                            isSelected
                              ? 'bg-navy-800 text-white'
                              : 'text-slate-400 hover:bg-navy-800/50'
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{item.label}</span>
                            {item.subtitle && (
                              <span className="text-xs text-slate-600 truncate block">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                          {item.pro && !isPro && (
                            <span className="badge-pro text-[8px] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Lock className="w-2 h-2" />
                              PRO
                            </span>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-navy-700 text-2xs font-mono text-slate-600">
              <span>
                <kbd className="bg-navy-800 border border-navy-700 px-1 py-0.5 rounded">↑↓</kbd>{' '}
                Navigate
              </span>
              <span>
                <kbd className="bg-navy-800 border border-navy-700 px-1 py-0.5 rounded">↵</kbd>{' '}
                Open
              </span>
              <span>
                <kbd className="bg-navy-800 border border-navy-700 px-1 py-0.5 rounded">esc</kbd>{' '}
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
