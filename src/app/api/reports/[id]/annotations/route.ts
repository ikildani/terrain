import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { hasPermission } from '@/lib/rbac';
import { logActivity } from '@/lib/activity';
import { z } from 'zod';
import type { ApiResponse, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ id: string }> };

/** Look up a report's workspace_id and verify the requesting user is a member. */
async function getReportWorkspaceAndRole(
  reportId: string,
  userId: string,
): Promise<{ workspaceId: string; role: WorkspaceRole } | null> {
  const admin = createAdminClient();

  const { data: report } = await admin.from('reports').select('workspace_id').eq('id', reportId).single();

  if (!report?.workspace_id) return null;

  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', report.workspace_id)
    .eq('user_id', userId)
    .single();

  if (!member?.role) return null;

  return { workspaceId: report.workspace_id, role: member.role as WorkspaceRole };
}

const createAnnotationSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  parent_id: z.string().uuid().optional(),
  section_key: z.string().max(200).optional(),
  mentions: z.array(z.string().uuid()).max(20).optional(),
});

// ────────────────────────────────────────────────────────────
// GET /api/reports/[id]/annotations
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: reportId } = await context.params;
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

  const rl = await rateLimit(`annotations_read:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  const access = await getReportWorkspaceAndRole(reportId, user.id);
  if (!access) {
    return NextResponse.json({ success: false, error: 'Report not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  const { searchParams } = new URL(request.url);
  const sectionKey = searchParams.get('section_key');

  try {
    const admin = createAdminClient();

    let query = admin
      .from('report_annotations')
      .select(
        'id, report_id, workspace_id, user_id, content, mentions, parent_id, section_key, resolved, resolved_by, created_at, updated_at, profiles(email, full_name)',
      )
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (sectionKey) {
      query = query.eq('section_key', sectionKey);
    }

    const { data: annotations, error: fetchError } = await query;

    if (fetchError) {
      captureApiError(fetchError, { route: `/api/reports/${reportId}/annotations`, action: 'list' });
      logger.error('annotations_list_failed', { error: fetchError.message, reportId });
      return NextResponse.json({ success: false, error: 'Failed to fetch annotations.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    const flatAnnotations = (annotations ?? []).map((a) => {
      const profile = a.profiles as unknown as { email: string; full_name: string | null } | null;
      return {
        id: a.id,
        report_id: a.report_id,
        workspace_id: a.workspace_id,
        user_id: a.user_id,
        content: a.content,
        mentions: a.mentions,
        parent_id: a.parent_id,
        section_key: a.section_key,
        resolved: a.resolved,
        resolved_by: a.resolved_by,
        created_at: a.created_at,
        updated_at: a.updated_at,
        user_name: profile?.full_name ?? null,
        user_email: profile?.email ?? null,
      };
    });

    return NextResponse.json({ success: true, data: flatAnnotations });
  } catch (err) {
    captureApiError(err, { route: `/api/reports/${reportId}/annotations`, action: 'list' });
    logger.error('annotations_list_error', {
      error: err instanceof Error ? err.message : String(err),
      reportId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}

// ────────────────────────────────────────────────────────────
// POST /api/reports/[id]/annotations
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: reportId } = await context.params;
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

  const rl = await rateLimit(`annotations_write:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  const access = await getReportWorkspaceAndRole(reportId, user.id);
  if (!access) {
    return NextResponse.json({ success: false, error: 'Report not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  if (!hasPermission(access.role, 'create_annotations')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Analyst role or above required.',
      } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = createAnnotationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const { content, parent_id, section_key, mentions } = parsed.data;
    const admin = createAdminClient();

    const { data: annotation, error: insertError } = await admin
      .from('report_annotations')
      .insert({
        report_id: reportId,
        workspace_id: access.workspaceId,
        user_id: user.id,
        content,
        parent_id: parent_id ?? null,
        section_key: section_key ?? null,
        mentions: mentions ?? [],
      })
      .select(
        'id, report_id, workspace_id, user_id, content, mentions, parent_id, section_key, resolved, resolved_by, created_at, updated_at',
      )
      .single();

    if (insertError || !annotation) {
      captureApiError(insertError, { route: `/api/reports/${reportId}/annotations`, action: 'create' });
      logger.error('annotation_create_failed', { error: insertError?.message, reportId });
      return NextResponse.json({ success: false, error: 'Failed to create annotation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    void logActivity({
      workspaceId: access.workspaceId,
      userId: user.id,
      action: 'annotation_added',
      resourceType: 'report',
      resourceId: reportId,
      metadata: {
        annotation_id: annotation.id,
        section_key: section_key ?? null,
        is_reply: !!parent_id,
      },
    });

    return NextResponse.json({ success: true, data: annotation }, { status: 201 });
  } catch (err) {
    captureApiError(err, { route: `/api/reports/${reportId}/annotations`, action: 'create' });
    logger.error('annotation_create_error', {
      error: err instanceof Error ? err.message : String(err),
      reportId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
