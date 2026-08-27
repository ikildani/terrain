import { logger } from '@/lib/logger';

async function postToSlack(text: string, color?: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn('slack_not_configured', { message: 'SLACK_WEBHOOK_URL not set' });
    return;
  }

  try {
    const body = color ? JSON.stringify({ attachments: [{ color, text }] }) : JSON.stringify({ text });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      logger.error('slack_webhook_failed', { status: response.status });
    }
  } catch (error) {
    logger.error('slack_webhook_error', { error: error instanceof Error ? error.message : 'Unknown' });
  }
}

export async function notifyCronSuccess(cronName: string, details: string): Promise<void> {
  await postToSlack(`✅ *${cronName}* completed — ${details}`, '#059669');
}

export async function notifyCronFailure(cronName: string, error: string): Promise<void> {
  await postToSlack(`❌ *${cronName}* failed — ${error}`, '#DC2626');
}

export async function notifyCronSkipped(cronName: string, reason: string): Promise<void> {
  await postToSlack(`⚠️ *${cronName}* skipped — ${reason}`, '#F59E0B');
}

export async function notifyQAHealthCheck(status: 'pass' | 'warn' | 'fail', details: string): Promise<void> {
  const color = status === 'pass' ? '#059669' : status === 'warn' ? '#F59E0B' : '#DC2626';
  const emoji = status === 'pass' ? '🟢' : status === 'warn' ? '🟡' : '🔴';
  await postToSlack(`${emoji} *Terrain QA Health Check* — ${status.toUpperCase()}\n${details}`, color);
}
