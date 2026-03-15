import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, AnalyticsData, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string }> };

/** Verify user is a member of the workspace and return their role. */
async function getMemberRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  return (data?.role as WorkspaceRole) ?? null;
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/analytics
// ────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
      status: 401,
    });
  }

  const rl = await rateLimit(`workspace_analytics:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify membership
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role) {
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const admin = createAdminClient();

  try {
    // ── Get workspace members ──────────────────────────────
    const { data: members } = await admin
      .from('workspace_members')
      .select('user_id, profiles(full_name, email)')
      .eq('workspace_id', workspaceId);

    const memberIds = (members ?? []).map((m) => m.user_id);

    // ── Activity by day (last 30 days) ─────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await admin
      .from('workspace_activities')
      .select('action, user_id, created_at')
      .eq('workspace_id', workspaceId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Build activity_by_day map
    const dayMap = new Map<string, number>();
    for (let d = 0; d < 30; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const key = date.toISOString().split('T')[0];
      dayMap.set(key, 0);
    }
    for (const a of activities ?? []) {
      const key = a.created_at.split('T')[0];
      if (dayMap.has(key)) {
        dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
      }
    }
    const activity_by_day = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Usage events for workspace members ─────────────────
    const { data: usageEvents } =
      memberIds.length > 0
        ? await admin.from('usage_events').select('user_id, feature, indication').in('user_id', memberIds)
        : { data: [] as { user_id: string; feature: string; indication: string | null }[] };

    // ── Reports for workspace ──────────────────────────────
    const { data: reports } = await admin
      .from('reports')
      .select('id, report_type, user_id, indication')
      .eq('workspace_id', workspaceId);

    // ── Aggregations ───────────────────────────────────────

    // Top indications
    const indicationCounts = new Map<string, number>();
    for (const e of usageEvents ?? []) {
      if (e.indication) {
        indicationCounts.set(e.indication, (indicationCounts.get(e.indication) ?? 0) + 1);
      }
    }
    for (const r of reports ?? []) {
      if (r.indication) {
        indicationCounts.set(r.indication, (indicationCounts.get(r.indication) ?? 0) + 1);
      }
    }
    const top_indications = Array.from(indicationCounts.entries())
      .map(([indication, count]) => ({ indication, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Usage by member
    const memberAnalysisCounts = new Map<string, number>();
    const memberReportCounts = new Map<string, number>();

    for (const e of usageEvents ?? []) {
      memberAnalysisCounts.set(e.user_id, (memberAnalysisCounts.get(e.user_id) ?? 0) + 1);
    }
    for (const r of reports ?? []) {
      if (r.user_id) {
        memberReportCounts.set(r.user_id, (memberReportCounts.get(r.user_id) ?? 0) + 1);
      }
    }

    const usage_by_member = (members ?? []).map((m) => {
      const profile = m.profiles as unknown as { full_name: string | null; email: string } | null;
      return {
        user_id: m.user_id,
        name: profile?.full_name || profile?.email || 'Unknown',
        analysis_count: memberAnalysisCounts.get(m.user_id) ?? 0,
        report_count: memberReportCounts.get(m.user_id) ?? 0,
      };
    });

    // Report type distribution
    const typeCounts = new Map<string, number>();
    for (const r of reports ?? []) {
      typeCounts.set(r.report_type, (typeCounts.get(r.report_type) ?? 0) + 1);
    }
    const report_type_distribution = Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const total_analyses = (usageEvents ?? []).length;
    const total_reports = (reports ?? []).length;

    const analyticsData: AnalyticsData = {
      top_indications,
      usage_by_member,
      activity_by_day,
      report_type_distribution,
      total_analyses,
      total_reports,
    };

    return NextResponse.json({ success: true, data: analyticsData } satisfies ApiResponse<AnalyticsData>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/analytics`, action: 'get' });
    logger.error('workspace_analytics_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
