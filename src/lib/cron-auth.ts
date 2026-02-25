import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createServerClient } from '@supabase/ssr';

/**
 * Verify cron route authorization via Bearer token.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) return false;

  const token = authHeader.replace('Bearer ', '');

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(cronSecret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Create a Supabase service client for cron jobs.
 * Uses service role key for unrestricted access (bypasses RLS).
 */
export function createServiceClient() {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  });
}
