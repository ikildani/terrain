'use client';

import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import type { WorkspaceMember } from '@/types';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface AuditFilters {
  from: string;
  to: string;
  user_id: string;
  action: string;
}

interface AuditLogFiltersProps {
  onFilterChange: (filters: AuditFilters) => void;
  members: WorkspaceMember[];
  onExportCSV: () => void;
  isExporting?: boolean;
}

// ────────────────────────────────────────────────────────────
// Action options
// ────────────────────────────────────────────────────────────

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'report_created', label: 'Report created' },
  { value: 'report_updated', label: 'Report updated' },
  { value: 'report_deleted', label: 'Report deleted' },
  { value: 'report_shared', label: 'Report shared' },
  { value: 'report_exported', label: 'Report exported' },
  { value: 'member_invited', label: 'Member invited' },
  { value: 'member_removed', label: 'Member removed' },
  { value: 'member_role_changed', label: 'Role changed' },
  { value: 'settings_updated', label: 'Settings updated' },
  { value: 'api_key_created', label: 'API key created' },
  { value: 'api_key_revoked', label: 'API key revoked' },
  { value: 'sso_configured', label: 'SSO configured' },
  { value: 'template_created', label: 'Template created' },
  { value: 'folder_created', label: 'Folder created' },
];

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function AuditLogFilters({ onFilterChange, members, onExportCSV, isExporting }: AuditLogFiltersProps) {
  const [filters, setFilters] = useState<AuditFilters>({
    from: '',
    to: '',
    user_id: '',
    action: '',
  });

  function handleChange(key: keyof AuditFilters, value: string) {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Filter className="w-4 h-4 text-slate-500 shrink-0" />

      {/* Date range */}
      <input
        type="date"
        value={filters.from}
        onChange={(e) => handleChange('from', e.target.value)}
        placeholder="From"
        className="input input-sm bg-navy-800 border-navy-700 text-sm text-slate-300 w-36"
        aria-label="From date"
      />
      <span className="text-slate-600 text-xs">to</span>
      <input
        type="date"
        value={filters.to}
        onChange={(e) => handleChange('to', e.target.value)}
        placeholder="To"
        className="input input-sm bg-navy-800 border-navy-700 text-sm text-slate-300 w-36"
        aria-label="To date"
      />

      {/* User dropdown */}
      <select
        value={filters.user_id}
        onChange={(e) => handleChange('user_id', e.target.value)}
        className="input input-sm bg-navy-800 border-navy-700 text-sm text-slate-300 w-44"
        aria-label="Filter by user"
      >
        <option value="">All users</option>
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>
            {m.user_name || m.user_email || m.user_id.slice(0, 8)}
          </option>
        ))}
      </select>

      {/* Action dropdown */}
      <select
        value={filters.action}
        onChange={(e) => handleChange('action', e.target.value)}
        className="input input-sm bg-navy-800 border-navy-700 text-sm text-slate-300 w-44"
        aria-label="Filter by action"
      >
        {ACTION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Export CSV button */}
      <button
        onClick={onExportCSV}
        disabled={isExporting}
        className="btn btn-sm bg-navy-800 border border-navy-700 text-slate-300 hover:bg-navy-700 hover:text-white transition-colors ml-auto flex items-center gap-1.5"
        aria-label="Export audit log as CSV"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="text-xs">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
      </button>
    </div>
  );
}
