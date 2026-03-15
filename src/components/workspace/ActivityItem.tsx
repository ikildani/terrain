'use client';

import { cn } from '@/lib/utils/cn';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface ActivityRecord {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

interface ActivityItemProps {
  activity: ActivityRecord;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getInitial(name: string | null, email: string | null): string {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return '?';
}

function getDisplayName(name: string | null, email: string | null): string {
  if (name) return name;
  if (email) return email.split('@')[0] ?? email;
  return 'Unknown user';
}

function getActionDescription(activity: ActivityRecord): string {
  const meta = activity.metadata;

  switch (activity.action) {
    case 'analysis_run': {
      const reportType = meta.report_type ? String(meta.report_type).replace(/_/g, ' ') : 'an';
      const indication = meta.indication ? ` for ${String(meta.indication)}` : '';
      return `ran a ${reportType} analysis${indication}`;
    }
    case 'report_created': {
      const title = meta.title ? `"${String(meta.title)}"` : 'a report';
      return `created report ${title}`;
    }
    case 'report_updated': {
      const title = meta.title ? `"${String(meta.title)}"` : 'a report';
      return `updated report ${title}`;
    }
    case 'report_deleted': {
      const title = meta.title ? `"${String(meta.title)}"` : 'a report';
      return `deleted report ${title}`;
    }
    case 'member_invited': {
      const email = meta.email ? String(meta.email) : 'a new member';
      return `invited ${email} to the workspace`;
    }
    case 'member_removed': {
      const email = meta.email ? String(meta.email) : 'a member';
      return `removed ${email} from the workspace`;
    }
    case 'folder_created': {
      const name = meta.name ? `"${String(meta.name)}"` : 'a folder';
      return `created folder ${name}`;
    }
    case 'folder_deleted': {
      const name = meta.name ? `"${String(meta.name)}"` : 'a folder';
      return `deleted folder ${name}`;
    }
    case 'annotation_added': {
      return 'added an annotation';
    }
    case 'template_created': {
      const name = meta.name ? `"${String(meta.name)}"` : 'a template';
      return `created template ${name}`;
    }
    case 'settings_updated': {
      const setting = meta.setting ? String(meta.setting) : 'workspace settings';
      return `updated ${setting}`;
    }
    default:
      return activity.action.replace(/_/g, ' ');
  }
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export function ActivityItem({ activity }: ActivityItemProps) {
  const initial = getInitial(activity.user_name, activity.user_email);
  const displayName = getDisplayName(activity.user_name, activity.user_email);
  const description = getActionDescription(activity);
  const relativeTime = getRelativeTime(activity.created_at);

  return (
    <div className={cn('flex items-start gap-3 px-3 py-2.5 rounded-lg', 'hover:bg-navy-900/40 transition-colors')}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-teal-500/15 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-semibold text-teal-400">{initial}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 leading-snug">
          <span className="font-medium text-white">{displayName}</span> <span>{description}</span>
        </p>
        <p className="text-2xs font-mono text-slate-600 mt-0.5">{relativeTime}</p>
      </div>
    </div>
  );
}
