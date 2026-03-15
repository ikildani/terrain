import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, ReportTemplate, WorkspaceRole } from '@/types';

const VALID_REPORT_TYPES = [
  'market_sizing',
  'competitive',
  'regulatory',
  'partners',
  'pipeline',
  'full',
  'device_market_sizing',
  'cdx_market_sizing',
  'nutraceutical_market_sizing',
] as const;

const updateTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long').optional(),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  report_type: z.enum(VALID_REPORT_TYPES, { errorMap: () => ({ message: 'Invalid report type.' }) }).optional(),
  inputs: z.record(z.unknown()).optional(),
  tags: z.array(z.string().trim().max(50)).max(20, 'Too many tags').optional(),
  is_default: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ workspaceId: string; templateId: string }> };

const ADMIN_ROLES: WorkspaceRole[] = ['owner', 'admin'];

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
// GET /api/workspaces/[workspaceId]/templates/[templateId]
// ────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, context: RouteContext) {
  const { workspaceId, templateId } = await context.params;
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

  const rl = await rateLimit(`workspace_templates:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  const { data: template, error: fetchError } = await supabase
    .from('report_templates')
    .select('*')
    .eq('id', templateId)
    .eq('workspace_id', workspaceId)
    .single();

  if (fetchError || !template) {
    return NextResponse.json({ success: false, error: 'Template not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  return NextResponse.json({ success: true, data: template } satisfies ApiResponse<ReportTemplate>);
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/templates/[templateId]
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { workspaceId, templateId } = await context.params;
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

  const rl = await rateLimit(`workspace_template_update:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify admin/owner role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  try {
    const body = await parseBodyWithLimit(request);
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const fields = parsed.data;
    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.report_type !== undefined) updates.report_type = fields.report_type;
    if (fields.inputs !== undefined) updates.inputs = fields.inputs;
    if (fields.tags !== undefined) updates.tags = fields.tags;
    if (fields.is_default !== undefined) updates.is_default = fields.is_default;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    // If setting as default, unset other defaults for the same report_type
    if (updates.is_default === true) {
      const reportType = updates.report_type as string | undefined;
      // Need to know the current report_type if not being changed
      let targetReportType = reportType;
      if (!targetReportType) {
        const { data: existing } = await supabase
          .from('report_templates')
          .select('report_type')
          .eq('id', templateId)
          .eq('workspace_id', workspaceId)
          .single();
        targetReportType = existing?.report_type;
      }

      if (targetReportType) {
        await supabase
          .from('report_templates')
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq('workspace_id', workspaceId)
          .eq('report_type', targetReportType)
          .eq('is_default', true)
          .neq('id', templateId);
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data: template, error: updateError } = await supabase
      .from('report_templates')
      .update(updates)
      .eq('id', templateId)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (updateError) {
      captureApiError(updateError, {
        route: `/api/workspaces/${workspaceId}/templates/${templateId}`,
        action: 'update',
      });
      logger.error('workspace_template_update_failed', { error: updateError.message, workspaceId, templateId });
      return NextResponse.json({ success: false, error: 'Failed to update template.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    logger.info('workspace_template_updated', { workspaceId, templateId, userId: user.id });

    return NextResponse.json({ success: true, data: template } satisfies ApiResponse<ReportTemplate>);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/templates/[templateId]
// ────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { workspaceId, templateId } = await context.params;
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

  const rl = await rateLimit(`workspace_template_delete:${user.id}`, { limit: 10, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
      status: 429,
    });
  }

  // Verify admin/owner role
  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json(
      { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
      { status: 403 },
    );
  }

  const { error: deleteError } = await supabase
    .from('report_templates')
    .delete()
    .eq('id', templateId)
    .eq('workspace_id', workspaceId);

  if (deleteError) {
    captureApiError(deleteError, { route: `/api/workspaces/${workspaceId}/templates/${templateId}`, action: 'delete' });
    logger.error('workspace_template_delete_failed', { error: deleteError.message, workspaceId, templateId });
    return NextResponse.json({ success: false, error: 'Failed to delete template.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  logger.info('workspace_template_deleted', { workspaceId, templateId, userId: user.id });

  return NextResponse.json({ success: true });
}
