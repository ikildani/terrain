'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Check, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useWorkspace } from '@/hooks/useWorkspace';

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, activeWorkspaceId, isLoading, setActiveWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-3 mb-3 rounded-lg bg-navy-800/50 px-3 py-2.5">
        <div className="h-4 w-24 animate-pulse rounded bg-navy-700" />
      </div>
    );
  }

  // No workspaces — show setup CTA
  if (workspaces.length === 0) {
    return (
      <div className="mx-3 mb-3 rounded-lg border border-navy-700 bg-navy-800/50 px-3 py-3">
        <p className="text-xs text-slate-500 leading-relaxed mb-2">
          Set up your workspace to collaborate with your team.
        </p>
        <Link
          href="/settings/team"
          className="flex items-center gap-1.5 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Set up workspace
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative mx-3 mb-3">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
          'bg-navy-800/60 hover:bg-navy-800 border border-navy-700/50',
          open && 'bg-navy-800 border-navy-700',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-500/10">
          <Building2 className="h-3.5 w-3.5 text-teal-500" />
        </div>
        <span className="flex-1 truncate text-sm font-medium text-slate-300">
          {activeWorkspace?.name ?? 'Select workspace'}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-50 mt-1',
            'rounded-lg border border-navy-700 bg-navy-800 shadow-xl shadow-black/30',
            'overflow-hidden',
          )}
          role="listbox"
          aria-label="Select workspace"
        >
          <div className="max-h-56 overflow-y-auto py-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveWorkspace(ws.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                    isActive ? 'bg-teal-500/10 text-white' : 'text-slate-300 hover:bg-navy-700/50 hover:text-white',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded',
                      isActive ? 'bg-teal-500/20' : 'bg-navy-700/50',
                    )}
                  >
                    <Building2 className={cn('h-3 w-3', isActive ? 'text-teal-500' : 'text-slate-500')} />
                  </div>
                  <span className="flex-1 truncate text-sm">{ws.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-teal-500" />}
                </button>
              );
            })}
          </div>

          {/* Divider + Create */}
          <div className="border-t border-navy-700">
            <Link
              href="/settings/team"
              onClick={() => setOpen(false)}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                'text-slate-400 hover:bg-navy-700/50 hover:text-slate-300',
              )}
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="text-sm">Create Workspace</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
