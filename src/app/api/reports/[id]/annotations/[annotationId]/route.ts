import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { z } from 'zod';
import type { ApiResponse, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ id: string; annotationId: string }> };

const patchSchema = z.object({
  content: z.string().trim().min(1).max(5000).optional(),
  resolved: z.boolean().optional(),
});

// ────────────────────────────────────────────────────────────
// PATCH /api/reports/[id]/annotations/[annotationId]
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: reportId, annotationId } = await context.params;
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

  try {
    let body: unknown;
    try {
      const { parseBodyWithLimit } = await import('@/lib/api/parse-body');
      body = await parseBodyWithLimit(request);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or oversized request body.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const admin = createAdminClient();

    // Fetch existing annotation
    const { data: existing } = await admin
      .from('report_annotations')
      .select('id, user_id, workspace_id, report_id')
      .eq('id', annotationId)
      .eq('report_id', reportId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Annotation not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    // Get the user's role in this workspace
    const { data: member } = await admin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', existing.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (!member?.role) {
      return NextResponse.json({ success: false, error: 'Not a workspace member.' } satisfies ApiResponse<never>, {
        status: 403,
      });
    }

    const role = member.role as WorkspaceRole;
    const isOwner = existing.user_id === user.id;
    const isAdmin = role === 'owner' || role === 'admin';

    // Content update: annotation owner only
    if (parsed.data.content !== undefined && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only the annotation author can edit content.' } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    // Resolved toggle: annotation owner OR admin+
    if (parsed.data.resolved !== undefined && !isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the author or workspace admins can resolve annotations.',
        } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    // Build update payload
    const updates: Record<string, unknown> = {};
    if (parsed.data.content !== undefined) {
      updates.content = parsed.data.content;
    }
    if (parsed.data.resolved !== undefined) {
      updates.resolved = parsed.data.resolved;
      updates.resolved_by = parsed.data.resolved ? user.id : null;
    }

    const { data: updated, error: updateError } = await admin
      .from('report_annotations')
      .update(updates)
      .eq('id', annotationId)
      .select(
        'id, report_id, workspace_id, user_id, content, mentions, parent_id, section_key, resolved, resolved_by, created_at, updated_at',
      )
      .single();

    if (updateError || !updated) {
      captureApiError(updateError, { route: `/api/reports/${reportId}/annotations/${annotationId}`, action: 'patch' });
      logger.error('annotation_update_failed', { error: updateError?.message, annotationId });
      return NextResponse.json({ success: false, error: 'Failed to update annotation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    captureApiError(err, { route: `/api/reports/${reportId}/annotations/${annotationId}`, action: 'patch' });
    logger.error('annotation_update_error', {
      error: err instanceof Error ? err.message : String(err),
      annotationId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/reports/[id]/annotations/[annotationId]
// ────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: reportId, annotationId } = await context.params;
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

  try {
    const admin = createAdminClient();

    // Fetch annotation to verify ownership
    const { data: existing } = await admin
      .from('report_annotations')
      .select('id, user_id')
      .eq('id', annotationId)
      .eq('report_id', reportId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Annotation not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the annotation author can delete it.' } satisfies ApiResponse<never>,
        { status: 403 },
      );
    }

    const { error: deleteError } = await admin.from('report_annotations').delete().eq('id', annotationId);

    if (deleteError) {
      captureApiError(deleteError, { route: `/api/reports/${reportId}/annotations/${annotationId}`, action: 'delete' });
      logger.error('annotation_delete_failed', { error: deleteError.message, annotationId });
      return NextResponse.json({ success: false, error: 'Failed to delete annotation.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    captureApiError(err, { route: `/api/reports/${reportId}/annotations/${annotationId}`, action: 'delete' });
    logger.error('annotation_delete_error', {
      error: err instanceof Error ? err.message : String(err),
      annotationId,
    });
    return NextResponse.json({ success: false, error: 'Internal server error.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
