import { createAdminClient } from '@/lib/supabase/admin';
import type { WorkspaceRole } from '@/types';

// ────────────────────────────────────────────────────────────
// ROLE PERMISSIONS
// ────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: ['*'],
  admin: [
    'manage_members',
    'manage_folders',
    'manage_reports',
    'create_reports',
    'view_reports',
    'manage_templates',
    'view_activity',
    'manage_settings',
    'manage_api_keys',
    'view_audit',
  ],
  analyst: ['create_reports', 'view_reports', 'manage_folders', 'view_activity', 'create_annotations'],
  viewer: ['view_reports', 'view_activity'],
};

// ────────────────────────────────────────────────────────────
// ROLE DISPLAY (for UI)
// ────────────────────────────────────────────────────────────

export const ROLE_DISPLAY: Record<WorkspaceRole, { label: string; description: string; color: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full access. Can manage billing, members, and all workspace settings.',
    color: 'purple',
  },
  admin: {
    label: 'Admin',
    description: 'Can manage members, reports, folders, templates, and workspace settings.',
    color: 'amber',
  },
  analyst: {
    label: 'Analyst',
    description: 'Can create and view reports, manage folders, and add annotations.',
    color: 'teal',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to reports and activity.',
    color: 'slate',
  },
};

// ────────────────────────────────────────────────────────────
// PERMISSION CHECKS
// ────────────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission.
 * Owner has wildcard ('*') access to everything.
 */
export function hasPermission(role: WorkspaceRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Look up a user's workspace role via Supabase, then check the permission.
 * Returns true if the user has the given permission in the workspace.
 */
export async function checkWorkspacePermission(
  userId: string,
  workspaceId: string,
  permission: string,
): Promise<boolean> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (!data?.role) return false;

  return hasPermission(data.role as WorkspaceRole, permission);
}

/**
 * Require a workspace permission. Throws if the user does not have the permission.
 * Returns the user's role if allowed.
 */
export async function requireWorkspacePermission(
  userId: string,
  workspaceId: string,
  permission: string,
): Promise<WorkspaceRole> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (!data?.role) {
    throw new Error('Not a member of this workspace.');
  }

  const role = data.role as WorkspaceRole;

  if (!hasPermission(role, permission)) {
    throw new Error(`Permission denied: ${permission} requires a higher role than ${role}.`);
  }

  return role;
}
