import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
          console.warn('[auth/callback] Welcome email fetch failed:', err instanceof Error ? err.message : err);
        });
      } catch (emailErr) {
        console.warn(
          '[auth/callback] Welcome email trigger failed:',
          emailErr instanceof Error ? emailErr.message : emailErr,
        );
      }

      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
