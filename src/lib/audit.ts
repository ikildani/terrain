import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// AUDIT ACTIONS
// ────────────────────────────────────────────────────────────

export type AuditAction =
  | 'login'
  | 'report_created'
  | 'report_updated'
  | 'report_deleted'
  | 'report_shared'
  | 'report_exported'
  | 'member_invited'
  | 'member_removed'
  | 'member_role_changed'
  | 'settings_updated'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'sso_configured'
  | 'template_created'
  | 'folder_created';

// ────────────────────────────────────────────────────────────
// LOG AUDIT
// ────────────────────────────────────────────────────────────

/**
 * Log an audit event for a workspace.
 * Uses the admin client to bypass RLS.
 * Fire-and-forget: errors are logged but never thrown.
 */
export async function logAudit(params: {
  workspaceId: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createAdminClient();

    await admin.from('audit_log').insert({
      workspace_id: params.workspaceId,
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      old_value: params.oldValue ?? null,
      new_value: params.newValue ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    logger.error('audit_log_failed', {
      error: err instanceof Error ? err.message : String(err),
      action: params.action,
      workspaceId: params.workspaceId,
    });
  }
}
