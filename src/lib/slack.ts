import { logger } from '@/lib/logger';

export async function postToSlack(text: string, color?: string): Promise<void> {
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

export async function notifyHotLead(profile: {
  email: string;
  company: string | null;
  fullName: string | null;
  score: number;
  temperature: string;
  dealStage: string;
  topIndications: string[];
  modulesUsed: string[];
  totalAnalyses7d: number;
  totalExports: number;
  totalPartnerRuns: number;
  totalCdmoRuns: number;
  recentAnalyses: { feature: string; indication: string | null; productCategory: string | null }[];
}): Promise<void> {
  const stageEmoji: Record<string, string> = {
    exploring: '👀',
    evaluating: '🔍',
    preparing: '📋',
    active: '🔥',
  };

  const user = profile.fullName || profile.email;
  const company = profile.company ? ` at ${profile.company}` : '';
  const emoji = stageEmoji[profile.dealStage] || '🔥';

  const moduleList = profile.modulesUsed.join(', ');
  const indicationList = profile.topIndications.slice(0, 3).join(', ');

  const activityLines: string[] = [];
  for (const a of profile.recentAnalyses.slice(0, 3)) {
    const parts = [a.feature.replace(/_/g, ' ')];
    if (a.indication) parts.push(`for ${a.indication}`);
    if (a.productCategory) parts.push(`(${a.productCategory})`);
    activityLines.push(`  • ${parts.join(' ')}`);
  }

  const behaviorNotes: string[] = [];
  if (profile.totalExports > 0)
    behaviorNotes.push(`exported ${profile.totalExports} PDF${profile.totalExports > 1 ? 's' : ''}`);
  if (profile.totalPartnerRuns > 0) behaviorNotes.push(`ran partner matching ${profile.totalPartnerRuns}x`);
  if (profile.totalCdmoRuns > 0) behaviorNotes.push(`used CDMO matching ${profile.totalCdmoRuns}x`);

  const dossier = [
    `${emoji} *Hot Lead Alert — Score: ${profile.score}/100*`,
    `*User:* ${user}${company}`,
    `*Email:* ${profile.email}`,
    `*Deal Stage:* ${profile.dealStage.toUpperCase()} | *Temperature:* ${profile.temperature}`,
    `*Indications:* ${indicationList || 'Various'}`,
    `*Modules:* ${moduleList}`,
    `*7-day activity:* ${profile.totalAnalyses7d} analyses`,
    behaviorNotes.length > 0 ? `*Signals:* ${behaviorNotes.join(' · ')}` : '',
    activityLines.length > 0 ? `*Recent:*\n${activityLines.join('\n')}` : '',
    '',
    `_Pattern matches ${profile.dealStage === 'active' ? 'active deal process' : profile.dealStage === 'preparing' ? 'pre-partnering behavior' : 'opportunity evaluation'}_`,
  ]
    .filter(Boolean)
    .join('\n');

  await postToSlack(dossier, '#14B8A6');
}
