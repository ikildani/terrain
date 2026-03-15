import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { logActivity } from '@/lib/activity';
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

const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().trim().max(500, 'Description too long').optional().nullable(),
  report_type: z.enum(VALID_REPORT_TYPES, { errorMap: () => ({ message: 'Invalid report type.' }) }),
  inputs: z.record(z.unknown()).default({}),
  tags: z.array(z.string().trim().max(50)).max(20, 'Too many tags').optional().default([]),
  is_default: z.boolean().optional().default(false),
});

type RouteContext = { params: Promise<{ workspaceId: string }> };

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
// GET /api/workspaces/[workspaceId]/templates — List templates
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

  const { data: templates, error: fetchError } = await supabase
    .from('report_templates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true });

  if (fetchError) {
    captureApiError(fetchError, { route: `/api/workspaces/${workspaceId}/templates`, action: 'list' });
    logger.error('workspace_templates_list_failed', { error: fetchError.message, workspaceId });
    return NextResponse.json({ success: false, error: 'Failed to fetch templates.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }

  return NextResponse.json({ success: true, data: templates ?? [] } satisfies ApiResponse<ReportTemplate[]>);
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/templates — Create template
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_template_create:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
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
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { name, description, report_type, inputs, tags, is_default } = parsed.data;

    // If setting as default, unset other defaults for the same report_type
    if (is_default) {
      await supabase
        .from('report_templates')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('workspace_id', workspaceId)
        .eq('report_type', report_type)
        .eq('is_default', true);
    }

    const { data: template, error: createError } = await supabase
      .from('report_templates')
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        name,
        description: description ?? null,
        report_type,
        inputs,
        tags,
        is_default,
      })
      .select()
      .single();

    if (createError) {
      captureApiError(createError, { route: `/api/workspaces/${workspaceId}/templates`, action: 'create' });
      logger.error('workspace_template_create_failed', { error: createError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to create template.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    await logActivity({
      workspaceId,
      userId: user.id,
      action: 'template_created',
      resourceType: 'template',
      resourceId: template.id,
      metadata: { name, report_type },
    });

    logger.info('workspace_template_created', { workspaceId, templateId: template.id, userId: user.id });

    return NextResponse.json({ success: true, data: template } satisfies ApiResponse<ReportTemplate>, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}
