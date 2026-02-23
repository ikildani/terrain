import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { logger } from '@/lib/logger';

export async function POST() {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'Service unavailable' },
      { status: 503 }
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userName = (user.user_metadata?.full_name as string) || '';

  const result = await sendEmail({
    to: user.email,
    subject: 'Welcome to Terrain — Market Intelligence',
    react: WelcomeEmail({ userName }),
    tags: [{ name: 'type', value: 'welcome' }],
  });

  if (!result.success) {
    logger.error('welcome_email_failed', {
      userId: user.id,
      error: result.error,
    });
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
