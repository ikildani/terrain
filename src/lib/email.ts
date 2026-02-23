import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import type { ReactElement } from 'react';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'Terrain <noreply@terrain.ambrosiaventures.co>';

interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  tags?: { name: string; value: string }[];
}

export async function sendEmail({ to, subject, react, tags }: SendEmailOptions) {
  if (!resend) {
    logger.warn('email_skipped_no_api_key', { to, subject });
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
      tags,
    });

    if (error) {
      logger.error('email_send_failed', { to, subject, error: error.message });
      return { success: false, error: error.message };
    }

    logger.info('email_sent', { to, subject, id: data?.id });
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('email_send_exception', { to, subject, error: message });
    return { success: false, error: message };
  }
}
