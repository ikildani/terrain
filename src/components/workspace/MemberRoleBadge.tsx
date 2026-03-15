'use client';

import { cn } from '@/lib/utils/cn';
import { ROLE_DISPLAY } from '@/lib/rbac';
import type { WorkspaceRole } from '@/types';

// ────────────────────────────────────────────────────────────
// Color mapping
// ────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  slate: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

interface MemberRoleBadgeProps {
  role: WorkspaceRole;
  className?: string;
}

export function MemberRoleBadge({ role, className }: MemberRoleBadgeProps) {
  const display = ROLE_DISPLAY[role];
  const colorClass = BADGE_COLORS[display.color] ?? BADGE_COLORS.slate;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider',
        colorClass,
        className,
      )}
      title={display.description}
    >
      {display.label}
    </span>
  );
}
