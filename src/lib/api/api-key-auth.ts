import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// API KEY AUTHENTICATION
// ────────────────────────────────────────────────────────────

export interface ApiKeyContext {
  workspaceId: string;
  keyId: string;
  scopes: string[];
  rateLimitRpm: number;
}

const API_KEY_PREFIX = 'sk_terrain_';

/**
 * Authenticate an API request using a Bearer token (`sk_terrain_...`).
 *
 * - Extracts the key from the `Authorization: Bearer sk_terrain_...` header
 * - Hashes with SHA-256 and looks up the hash in the `api_keys` table
 * - Validates the key is not revoked and not expired
 * - Updates `last_used_at` (fire-and-forget)
 *
 * Returns the API key context if valid, or `null` if authentication fails.
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiKeyContext | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    const rawKey = parts[1];
    if (!rawKey.startsWith(API_KEY_PREFIX)) return null;

    // Hash the key with SHA-256
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const admin = createAdminClient();

    // Look up by hash
    const { data: apiKey, error } = await admin
      .from('api_keys')
      .select('id, workspace_id, scopes, rate_limit_rpm, revoked_at, expires_at')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKey) return null;

    // Check not revoked
    if (apiKey.revoked_at) return null;

    // Check not expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return null;

    // Update last_used_at (fire-and-forget — never block the request)
    admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id)
      .then(() => {})
      .catch((err) => {
        logger.warn('api_key_last_used_update_failed', {
          error: err instanceof Error ? err.message : String(err),
          keyId: apiKey.id,
        });
      });

    return {
      workspaceId: apiKey.workspace_id,
      keyId: apiKey.id,
      scopes: (apiKey.scopes as string[]) ?? ['*'],
      rateLimitRpm: apiKey.rate_limit_rpm ?? 60,
    };
  } catch (err) {
    logger.error('api_key_auth_error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Check if an API key context has a required scope.
 * Wildcard ('*') grants access to all scopes.
 */
export function hasScope(ctx: ApiKeyContext, requiredScope: string): boolean {
  return ctx.scopes.includes('*') || ctx.scopes.includes(requiredScope);
}
