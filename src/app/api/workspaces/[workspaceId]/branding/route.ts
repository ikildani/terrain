import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { parseBodyWithLimit } from '@/lib/api/parse-body';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { logActivity } from '@/lib/activity';
import type { ApiResponse, WorkspaceRole } from '@/types';

interface WorkspaceBranding {
  logo_url: string | null;
  brand_primary_color: string | null;
  brand_footer_text: string | null;
}

const updateBrandingSchema = z.object({
  logo_url: z.string().url('Must be a valid URL').max(2000).optional().nullable(),
  brand_primary_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{3,8}$/, 'Must be a valid hex color')
    .optional()
    .nullable(),
  brand_footer_text: z.string().trim().max(200, 'Footer text too long').optional().nullable(),
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
// GET /api/workspaces/[workspaceId]/branding
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

  const rl = await rateLimit(`workspace_branding:${user.id}`, { limit: 60, windowMs: 60 * 1000 });
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

  const { data: workspace, error: fetchError } = await supabase
    .from('workspaces')
    .select('logo_url, brand_primary_color, brand_footer_text')
    .eq('id', workspaceId)
    .single();

  if (fetchError || !workspace) {
    captureApiError(fetchError, { route: `/api/workspaces/${workspaceId}/branding`, action: 'get' });
    return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
      status: 404,
    });
  }

  return NextResponse.json({ success: true, data: workspace } satisfies ApiResponse<WorkspaceBranding>);
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/branding
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const rl = await rateLimit(`workspace_branding_update:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
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
    const parsed = updateBrandingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const fields = parsed.data;
    const updates: Record<string, unknown> = {};
    if (fields.logo_url !== undefined) updates.logo_url = fields.logo_url;
    if (fields.brand_primary_color !== undefined) updates.brand_primary_color = fields.brand_primary_color;
    if (fields.brand_footer_text !== undefined) updates.brand_footer_text = fields.brand_footer_text;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    updates.updated_at = new Date().toISOString();

    const { data: workspace, error: updateError } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select('logo_url, brand_primary_color, brand_footer_text')
      .single();

    if (updateError) {
      captureApiError(updateError, { route: `/api/workspaces/${workspaceId}/branding`, action: 'update' });
      logger.error('workspace_branding_update_failed', { error: updateError.message, workspaceId });
      return NextResponse.json({ success: false, error: 'Failed to update branding.' } satisfies ApiResponse<never>, {
        status: 500,
      });
    }

    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    await logActivity({
      workspaceId,
      userId: user.id,
      action: 'settings_updated',
      resourceType: 'branding',
      metadata: { fields: Object.keys(fields) },
    });

    logger.info('workspace_branding_updated', { workspaceId, userId: user.id });

    return NextResponse.json({ success: true, data: workspace } satisfies ApiResponse<WorkspaceBranding>);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' } satisfies ApiResponse<never>, {
      status: 400,
    });
  }
}
