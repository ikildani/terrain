import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, ApiKey, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string; keyId: string }> };

const VALID_SCOPES = ['market_sizing', 'competitive', 'partners', 'regulatory', 'reports', '*'] as const;

const UpdateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  scopes: z.array(z.enum(VALID_SCOPES)).min(1).optional(),
  rate_limit_rpm: z.number().int().min(1).max(1000).optional(),
});

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

async function requireAdminOrOwner(
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

  const rl = await rateLimit(`api_keys:${user.id}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return {
      user: null,
      error: NextResponse.json({ success: false, error: 'Rate limit exceeded.' } satisfies ApiResponse<never>, {
        status: 429,
      }),
    };
  }

  const admin = createAdminClient();
  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  const role = member?.role as WorkspaceRole | undefined;
  if (!role || (role !== 'owner' && role !== 'admin')) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Admin or owner access required.' } satisfies ApiResponse<never>,
        { status: 403 },
      ),
    };
  }

  return { user, error: null };
}

// ────────────────────────────────────────────────────────────
// PATCH /api/workspaces/[workspaceId]/api-keys/[keyId]
// ────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { workspaceId, keyId } = await context.params;
  const auth = await requireAdminOrOwner(request, workspaceId);
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

    const parsed = UpdateApiKeySchema.safeParse(body);
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

    // Fetch existing key
    const { data: existing } = await admin
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'API key not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    if (existing.revoked_at) {
      return NextResponse.json(
        { success: false, error: 'Cannot update a revoked API key.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
    if (parsed.data.scopes !== undefined) updatePayload.scopes = parsed.data.scopes;
    if (parsed.data.rate_limit_rpm !== undefined) updatePayload.rate_limit_rpm = parsed.data.rate_limit_rpm;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const { data, error } = await admin
      .from('api_keys')
      .update(updatePayload)
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)
      .select(
        'id, name, key_prefix, scopes, rate_limit_rpm, last_used_at, expires_at, revoked_at, created_at, created_by',
      )
      .single();

    if (error) throw error;

    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'api_key_created',
      resourceType: 'api_key',
      resourceId: keyId,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      oldValue: { name: existing.name, scopes: existing.scopes, rate_limit_rpm: existing.rate_limit_rpm },
      newValue: parsed.data as unknown as Record<string, unknown>,
    });

    return NextResponse.json({
      success: true,
      data: data as ApiKey,
    } satisfies ApiResponse<ApiKey>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/api-keys/${keyId}`, action: 'update' });
    logger.error('api_key_update_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
      keyId,
    });
    return NextResponse.json({ success: false, error: 'Failed to update API key.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}

// ────────────────────────────────────────────────────────────
// DELETE /api/workspaces/[workspaceId]/api-keys/[keyId] — Soft revoke
// ────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { workspaceId, keyId } = await context.params;
  const auth = await requireAdminOrOwner(request, workspaceId);
  if (auth.error) return auth.error;

  const admin = createAdminClient();

  try {
    // Fetch existing key
    const { data: existing } = await admin
      .from('api_keys')
      .select('id, name, revoked_at')
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'API key not found.' } satisfies ApiResponse<never>, {
        status: 404,
      });
    }

    if (existing.revoked_at) {
      return NextResponse.json({ success: false, error: 'API key is already revoked.' } satisfies ApiResponse<never>, {
        status: 400,
      });
    }

    const revokedAt = new Date().toISOString();
    const { error } = await admin
      .from('api_keys')
      .update({ revoked_at: revokedAt })
      .eq('id', keyId)
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'api_key_revoked',
      resourceType: 'api_key',
      resourceId: keyId,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      oldValue: { name: existing.name },
      metadata: { revoked_at: revokedAt },
    });

    logger.info('api_key_revoked', { workspaceId, keyId, name: existing.name });

    return NextResponse.json({
      success: true,
      data: null,
    } satisfies ApiResponse<null>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/api-keys/${keyId}`, action: 'revoke' });
    logger.error('api_key_revoke_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
      keyId,
    });
    return NextResponse.json({ success: false, error: 'Failed to revoke API key.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
