'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { ROLE_DISPLAY } from '@/lib/rbac';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { WorkspaceRole } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface RoleSelectorProps {
  currentRole: WorkspaceRole;
  memberId: string;
  workspaceId: string;
  onRoleChanged: () => void;
  disabled?: boolean;
}

// ────────────────────────────────────────────────────────────
// Role hierarchy (lower index = higher rank)
// ────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: WorkspaceRole[] = ['owner', 'admin', 'analyst', 'viewer'];

function getAssignableRoles(callerRole: WorkspaceRole): WorkspaceRole[] {
  if (callerRole === 'owner') {
    // Owner can assign any non-owner role
    return ['admin', 'analyst', 'viewer'];
  }
  if (callerRole === 'admin') {
    // Admin can only assign roles below their own
    return ['analyst', 'viewer'];
  }
  return [];
}

const BADGE_COLORS: Record<string, string> = {
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  slate: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function RoleSelector({
  currentRole,
  memberId,
  workspaceId,
  onRoleChanged,
  disabled = false,
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { myRole } = useWorkspace();

  const assignableRoles = myRole ? getAssignableRoles(myRole) : [];
  const canChangeRole = assignableRoles.length > 0 && !disabled && currentRole !== 'owner';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRoleChange = async (newRole: WorkspaceRole) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    setIsOpen(false);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Failed to update role');
        return;
      }

      toast.success(`Role updated to ${ROLE_DISPLAY[newRole].label}`);
      onRoleChanged();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const display = ROLE_DISPLAY[currentRole];
  const colorClass = BADGE_COLORS[display.color] ?? BADGE_COLORS.slate;

  // Non-interactive badge when user can't change roles
  if (!canChangeRole) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider',
          colorClass,
        )}
        title={display.description}
      >
        {display.label}
      </span>
    );
  }

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider transition-all',
          colorClass,
          'hover:opacity-80 cursor-pointer',
          isUpdating && 'opacity-50 cursor-wait',
        )}
      >
        {isUpdating ? 'Updating...' : display.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-navy-800 border border-navy-700 rounded-lg shadow-xl py-1 min-w-[220px]">
          <div className="px-3 py-1.5 border-b border-navy-700/50">
            <p className="text-[10px] font-mono uppercase text-slate-600 tracking-wider">Change role</p>
          </div>
          {assignableRoles.map((role) => {
            const rd = ROLE_DISPLAY[role];
            const isSelected = role === currentRole;
            return (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={cn(
                  'flex items-start gap-2.5 w-full px-3 py-2 text-left transition-colors',
                  isSelected ? 'bg-teal-500/10' : 'hover:bg-navy-700',
                )}
              >
                <Shield className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-medium', isSelected ? 'text-teal-400' : 'text-slate-300')}>
                      {rd.label}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-teal-400" />}
                  </div>
                  <p className="text-[10px] text-slate-600 leading-snug mt-0.5">{rd.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
