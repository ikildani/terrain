import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

// ────────────────────────────────────────────────────────────
// GET /api/cron/audit-cleanup
// Schedule: Weekly, Sunday 2 AM UTC
// Deletes audit_log entries older than 1 year
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const cutoffDate = oneYearAgo.toISOString();

    // Count entries to be deleted first
    const { count: toDeleteCount } = await supabase
      .from('audit_log')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffDate);

    // Delete old entries
    const { error } = await supabase.from('audit_log').delete().lt('created_at', cutoffDate);

    if (error) {
      throw error;
    }

    const durationMs = Math.round(performance.now() - startTime);
    const deletedCount = toDeleteCount ?? 0;

    logger.info('cron_audit_cleanup_complete', {
      deletedCount,
      cutoffDate,
      durationMs,
    });

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      cutoff: cutoffDate,
      durationMs,
    });
  } catch (err) {
    captureApiError(err, { route: '/api/cron/audit-cleanup' });
    logger.error('cron_audit_cleanup_failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ success: false, error: 'Audit cleanup failed.' }, { status: 500 });
  }
}
