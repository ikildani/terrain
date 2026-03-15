import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import type { ApiResponse, ApiKey, WorkspaceRole } from '@/types';

type RouteContext = { params: Promise<{ workspaceId: string }> };

const VALID_SCOPES = ['market_sizing', 'competitive', 'partners', 'regulatory', 'reports', '*'] as const;

const CreateApiKeySchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or fewer.'),
  scopes: z.array(z.enum(VALID_SCOPES)).min(1, 'At least one scope is required.').default(['*']),
  rate_limit_rpm: z
    .number()
    .int()
    .min(1, 'Rate limit must be at least 1.')
    .max(1000, 'Rate limit must be 1000 or fewer.')
    .default(60),
  expires_at: z.string().datetime().optional().nullable(),
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
        {
          success: false,
          error: 'Admin or owner access required for API key management.',
        } satisfies ApiResponse<never>,
        { status: 403 },
      ),
    };
  }

  return { user, error: null };
}

// ────────────────────────────────────────────────────────────
// GET /api/workspaces/[workspaceId]/api-keys — List active keys
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
  const auth = await requireAdminOrOwner(request, workspaceId);
  if (auth.error) return auth.error;

  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from('api_keys')
      .select(
        'id, name, key_prefix, scopes, rate_limit_rpm, last_used_at, expires_at, revoked_at, created_at, created_by',
      )
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []) as ApiKey[],
    } satisfies ApiResponse<ApiKey[]>);
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/api-keys`, action: 'list' });
    logger.error('api_keys_list_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Failed to fetch API keys.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}

// ────────────────────────────────────────────────────────────
// POST /api/workspaces/[workspaceId]/api-keys — Create new key
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, context: RouteContext) {
  const { workspaceId } = await context.params;
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

    const parsed = CreateApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join('; '),
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // Generate the raw key: sk_terrain_ + 40 hex chars
    const randomBytes = crypto.randomBytes(20);
    const rawKey = `sk_terrain_${randomBytes.toString('hex')}`;

    // Hash for storage
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Store first 12 chars as prefix for identification
    const keyPrefix = rawKey.substring(0, 12);

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('api_keys')
      .insert({
        workspace_id: workspaceId,
        created_by: auth.user.id,
        name: parsed.data.name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: parsed.data.scopes,
        rate_limit_rpm: parsed.data.rate_limit_rpm,
        expires_at: parsed.data.expires_at ?? null,
      })
      .select(
        'id, name, key_prefix, scopes, rate_limit_rpm, last_used_at, expires_at, revoked_at, created_at, created_by',
      )
      .single();

    if (error) throw error;

    // Audit log
    logAudit({
      workspaceId,
      userId: auth.user.id,
      action: 'api_key_created',
      resourceType: 'api_key',
      resourceId: data.id,
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
      newValue: {
        name: parsed.data.name,
        scopes: parsed.data.scopes,
        rate_limit_rpm: parsed.data.rate_limit_rpm,
      },
    });

    logger.info('api_key_created', {
      workspaceId,
      keyId: data.id,
      name: parsed.data.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...(data as ApiKey),
        key: rawKey, // Return full key ONCE — never stored in plaintext
      },
    });
  } catch (err) {
    captureApiError(err, { route: `/api/workspaces/${workspaceId}/api-keys`, action: 'create' });
    logger.error('api_key_create_failed', {
      error: err instanceof Error ? err.message : String(err),
      workspaceId,
    });
    return NextResponse.json({ success: false, error: 'Failed to create API key.' } satisfies ApiResponse<never>, {
      status: 500,
    });
  }
}
