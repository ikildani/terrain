import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, ApiKey, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string; keyId: string }> };

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
// POST /api/workspaces/[workspaceId]/api-keys/[keyId]/rotate
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
  const { workspaceId, keyId } = await context.params;
  const auth = await requireAdminOrOwner(request, workspaceId);
  if (auth.error) return auth.error;

  const admin = createAdminClient();

  try {
    // Fetch existing key
    const { data: existing } = await admin
      .from('api_keys')
      .select('id, name, scopes, rate_limit_rpm, expires_at, revoked_at')
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
        { success: false, error: 'Cannot rotate a revoked API key.' } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // Generate new key
    const randomBytes = crypto.randomBytes(20);
    const rawKey = `sk_terrain_${randomBytes.toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);
    const revokedAt = new Date().toISOString();

    // Revoke old key
    const { error: revokeError } = await admin
      .from('api_keys')
      .update({ revoked_at: revokedAt })
      .eq('id', keyId)
      .eq('workspace_id', workspaceId);

    if (revokeError) throw revokeError;

    // Create new key with same settings
    const { data: newKey, error: createError } = await admin
      .from('api_keys')
      .insert({
        workspace_id: workspaceId,
        created_by: auth.user.id,
        name: existing.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: existing.scopes,
        rate_limit_rpm: existing.rate_limit_rpm,
        expires_at: existing.expires_at,
      })
      .select(
        'id, name, key_prefix, scopes, rate_limit_rpm, last_used_at, expires_at, revoked_at, created_at, created_by',
      )
      .single();

    if (createError) throw createError;

    // Audit log
    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'api_key_created',
      resourceType: 'api_key',
      resourceId: newKey.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      oldValue: { rotated_from: keyId, name: existing.name },
      newValue: { new_key_id: newKey.id },
      metadata: { rotation: true },
    });

    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'api_key_revoked',
      resourceType: 'api_key',
      resourceId: keyId,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      metadata: { rotated_to: newKey.id, revoked_at: revokedAt },
    });

    logger.info('api_key_rotated', {
      workspaceId,
      oldKeyId: keyId,
      newKeyId: newKey.id,
      name: existing.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...(newKey as ApiKey),
        key: rawKey, // Return full key ONCE
      },
    });
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/api-keys/${keyId}/rotate`, action: 'rotate' });
    logger.error('api_key_rotate_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
      keyId,
    });
    return NextResponse.json({ success: false, error: 'Failed to rotate API key.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
