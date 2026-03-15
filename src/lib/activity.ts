import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// ACTIVITY ACTIONS
// ────────────────────────────────────────────────────────────

export type ActivityAction =
  | 'analysis_run'
  | 'report_created'
  | 'report_updated'
  | 'report_deleted'
  | 'member_invited'
  | 'member_removed'
  | 'folder_created'
  | 'folder_deleted'
  | 'annotation_added'
  | 'template_created'
  | 'settings_updated';

// ────────────────────────────────────────────────────────────
// LOG ACTIVITY
// ────────────────────────────────────────────────────────────

/**
 * Log a workspace activity event.
 * Uses the admin client to bypass RLS.
 * Fire-and-forget: errors are logged but never thrown.
 */
export async function logActivity(params: {
  workspaceId: string;
  userId: string;
  action: ActivityAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createAdminClient();

    await admin.from('workspace_activities').insert({
      workspace_id: params.workspaceId,
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    logger.error('activity_log_failed', {
      error: err instanceof Error ? err.message : String(err),
      action: params.action,
      workspaceId: params.workspaceId,
    });
  }
}
