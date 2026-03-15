import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, SSOConfig, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string }> };

const SSOProviders = ['saml', 'google_workspace', 'azure_ad', 'okta'] as const;

const CreateSSOSchema = z.object({
  provider: z.enum(SSOProviders),
  domain: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/, {
      message: 'Invalid domain format',
    }),
  metadata_url: z.string().url().max(2048).optional().nullable(),
  enforce_sso: z.boolean().default(false),
  auto_provision: z.boolean().default(true),
  default_role: z.enum(['admin', 'analyst', 'viewer']).default('analyst'),
});

const UpdateSSOSchema = CreateSSOSchema.partial();

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

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

async function requireOwner(
  request: NextRequest,
  workspaceId: string,
): Promise<{ user: { id: string }; error: null } | { user: null; error: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
        status: 401,
      }),
    };
  }

  const rl = await rateLimit(`sso_config:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return {
      user: null,
      error: NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
        status: 429,
      }),
    };
  }

  const role = await getMemberRole(supabase, workspaceId, user.id);
  if (role !== 'owner') {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Owner access required for SSO configuration.' } satisfies ApiResponse<never>,
        { status: 403 },
      ),
    };
  }

  // Verify enterprise plan
  const admin = createAdminClient();
  const { data: workspace } = await admin.from('workspaces').select('plan').eq('id', workspaceId).single();

  if (!workspace || workspace.plan !== 'enterprise') {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Enterprise plan required for SSO configuration.' } satisfies ApiResponse<never>,
        { status: 403 },
      ),
    };
  }

  return { user, error: null };
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/sso
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireOwner(request, workspaceId);
  if (auth.error) return auth.error;

  const admin = createAdminClient();

  try {
    const { data, error } = await admin.from('sso_configs').select('*').eq('workspace_id', workspaceId).maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data as SSOConfig | null,
    } satisfies ApiResponse<SSOConfig | null>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/sso`, action: 'get' });
    logger.error('sso_config_fetch_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSO configuration.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/sso
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireOwner(request, workspaceId);
  if (auth.error) return auth.error;

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
    const parsed = CreateSSOSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join('; '),
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Check if SSO config already exists
    const { data: existing } = await admin
      .from('sso_configs')
      .select('id')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'SSO configuration already exists. Use PATCH to update.',
        } satisfies ApiResponse<never>,
        { status: 409 },
      );
    }

    const { data, error } = await admin
      .from('sso_configs')
      .insert({
        workspace_id: workspaceId,
        provider: parsed.data.provider,
        domain: parsed.data.domain,
        metadata_url: parsed.data.metadata_url ?? null,
        enforce_sso: parsed.data.enforce_sso,
        auto_provision: parsed.data.auto_provision,
        default_role: parsed.data.default_role,
      })
      .select()
      .single();

    if (error) throw error;

    // Note: In a real implementation this would call Supabase SSO Management API.
    // For now, we store the config and log that SSO setup requires Supabase dashboard configuration.
    logger.info('sso_config_created', {
      workspaceId,
      provider: parsed.data.provider,
      domain: parsed.data.domain,
      note: 'SSO setup requires Supabase dashboard configuration to complete IdP integration.',
    });

    // Audit log
    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'sso_configured',
      resourceType: 'sso_config',
      resourceId: data.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      newValue: parsed.data as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      data: data as SSOConfig,
    } satisfies ApiResponse<SSOConfig>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/sso`, action: 'create' });
    logger.error('sso_config_create_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create SSO configuration.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/sso
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireOwner(request, workspaceId);
  if (auth.error) return auth.error;

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
    const parsed = UpdateSSOSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join('; '),
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // Fetch current config for audit trail
    const { data: existing } = await admin
      .from('sso_configs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'No SSO configuration found. Use POST to create one.' } satisfies ApiResponse<never>,
        { status: 404 },
      );
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.provider !== undefined) updatePayload.provider = parsed.data.provider;
    if (parsed.data.domain !== undefined) updatePayload.domain = parsed.data.domain;
    if (parsed.data.metadata_url !== undefined) updatePayload.metadata_url = parsed.data.metadata_url;
    if (parsed.data.enforce_sso !== undefined) updatePayload.enforce_sso = parsed.data.enforce_sso;
    if (parsed.data.auto_provision !== undefined) updatePayload.auto_provision = parsed.data.auto_provision;
    if (parsed.data.default_role !== undefined) updatePayload.default_role = parsed.data.default_role;

    const { data, error } = await admin
      .from('sso_configs')
      .update(updatePayload)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'sso_configured',
      resourceType: 'sso_config',
      resourceId: data.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      oldValue: existing as unknown as Record<string, unknown>,
      newValue: parsed.data as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      data: data as SSOConfig,
    } satisfies ApiResponse<SSOConfig>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/sso`, action: 'update' });
    logger.error('sso_config_update_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to update SSO configuration.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/sso
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireOwner(request, workspaceId);
  if (auth.error) return auth.error;

  const admin = createAdminClient();

  try {
    // Fetch current config for audit trail
    const { data: existing } = await admin
      .from('sso_configs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'No SSO configuration found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    const { error } = await admin.from('sso_configs').delete().eq('workspace_id', workspaceId);

    if (error) throw error;

    // Audit log
    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'sso_configured',
      resourceType: 'sso_config',
      resourceId: existing.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      oldValue: existing as unknown as Record<string, unknown>,
      metadata: { deleted: true },
    });

    return NextResponse.json({
      success: true,
      data: null,
    } satisfies ApiResponse<null>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/sso`, action: 'delete' });
    logger.error('sso_config_delete_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to delete SSO configuration.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
