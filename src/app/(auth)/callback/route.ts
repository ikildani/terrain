import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Prevent open redirect — only allow relative paths
  const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Trigger welcome email (non-blocking, fire-and-forget)
      try {
        const cookieStore = cookies();
        const cookieHeader = cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; ');
        fetch(`${origin}/api/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
          },
        }).catch((err) => {
          logger.warn('[auth/callback] Welcome email fetch failed', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
      } catch (emailErr) {
        logger.warn('[auth/callback] Welcome email trigger failed', {
          error: emailErr instanceof Error ? emailErr.message : String(emailErr),
        });
      }

      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
