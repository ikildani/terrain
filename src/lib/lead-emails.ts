// ============================================================
// Lead nurture emails — personalized based on user behavior
// ============================================================

import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { createElement } from 'react';
import type { LeadProfile } from '@/lib/lead-scoring';

function formatIndication(ind: string): string {
  return ind.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function LeadEmailWrapper({ children }: { children: React.ReactNode }) {
  return createElement(
    'div',
    {
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '560px',
        margin: '0 auto',
        color: '#1a1a1a',
        lineHeight: '1.6',
        fontSize: '15px',
      },
    },
    children,
  );
}

function EvaluatingEmail({ profile }: { profile: LeadProfile }) {
  const indication = profile.topIndications[0] ? formatIndication(profile.topIndications[0]) : 'your target indication';

  return createElement(
    LeadEmailWrapper,
    {},
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `Hi${profile.fullName ? ` ${profile.fullName.split(' ')[0]}` : ''},`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `I noticed you've been researching ${indication} on Terrain — looks like you're doing serious market diligence.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `At Ambrosia Ventures, we advise life sciences companies on deal structuring and partnering strategy. If you're approaching a licensing, co-development, or M&A conversation in this space, we can help with the transaction side — defensible valuations, deal benchmarks, partner mapping, and process management.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `For deal term benchmarking specifically, our platform `,
      createElement('a', { href: 'https://solidus.ambrosiaventures.co', style: { color: '#00c9a7' } }, 'Solidus'),
      ` covers 1,900+ verified transactions across 12 therapeutic areas.`,
    ),
    createElement('p', { style: { marginBottom: '14px' } }, `Happy to be a resource if useful.`),
    createElement(
      'p',
      { style: { marginBottom: '0', color: '#64748b', fontSize: '13px' } },
      'Issa Kildani',
      createElement('br'),
      'Managing Partner, Ambrosia Ventures',
      createElement('br'),
      createElement(
        'a',
        { href: 'mailto:ikildani@ambrosiaventures.co', style: { color: '#00c9a7' } },
        'ikildani@ambrosiaventures.co',
      ),
    ),
  );
}

function ExportFollowupEmail({ profile }: { profile: LeadProfile }) {
  const indication = profile.topIndications[0] ? formatIndication(profile.topIndications[0]) : 'your market analysis';

  return createElement(
    LeadEmailWrapper,
    {},
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `Hi${profile.fullName ? ` ${profile.fullName.split(' ')[0]}` : ''},`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `You recently exported a market intelligence report from Terrain — often that means a board meeting, investor presentation, or partnering conversation is coming up.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `If you're preparing for a transaction discussion, our advisory team works on exactly this. We help clinical-stage companies structure licensing deals, run sell-side M&A processes, and benchmark terms against 1,900+ verified transactions on `,
      createElement('a', { href: 'https://solidus.ambrosiaventures.co', style: { color: '#00c9a7' } }, 'Solidus'),
      `.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `No pressure — just wanted you to know the resource exists if the timing is right.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '0', color: '#64748b', fontSize: '13px' } },
      'Issa Kildani',
      createElement('br'),
      'Managing Partner, Ambrosia Ventures',
      createElement('br'),
      createElement(
        'a',
        { href: 'mailto:ikildani@ambrosiaventures.co', style: { color: '#00c9a7' } },
        'ikildani@ambrosiaventures.co',
      ),
    ),
  );
}

function HighIntentEmail({ profile }: { profile: LeadProfile }) {
  const indication = profile.topIndications[0] ? formatIndication(profile.topIndications[0]) : 'this space';
  const moduleSummary = profile.modulesUsed.map((m) => m.replace(/_/g, ' ')).join(', ');

  return createElement(
    LeadEmailWrapper,
    {},
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `Hi${profile.fullName ? ` ${profile.fullName.split(' ')[0]}` : ''},`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `Quick question — you've been doing deep work in ${indication} on Terrain (${moduleSummary}). Are you approaching a transaction or partnering conversation?`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `If so, I'd welcome a 15-minute conversation. We advise life sciences companies on deal structuring and have been tracking deal terms in this space closely.`,
    ),
    createElement('p', { style: { marginBottom: '14px' } }, `No pitch — just curious if the timing makes sense.`),
    createElement(
      'p',
      { style: { marginBottom: '0', color: '#64748b', fontSize: '13px' } },
      'Issa Kildani',
      createElement('br'),
      'Managing Partner, Ambrosia Ventures',
      createElement('br'),
      createElement(
        'a',
        { href: 'mailto:ikildani@ambrosiaventures.co', style: { color: '#00c9a7' } },
        'ikildani@ambrosiaventures.co',
      ),
    ),
  );
}

function ProTrialNudgeEmail({ profile }: { profile: LeadProfile }) {
  const indication = profile.topIndications[0]
    ? formatIndication(profile.topIndications[0])
    : 'your target indications';

  return createElement(
    LeadEmailWrapper,
    {},
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `Hi${profile.fullName ? ` ${profile.fullName.split(' ')[0]}` : ''},`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `You've been doing solid research on ${indication} — looks like you're putting together a real market picture.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      `You've used your free monthly analyses. With Pro, you get unlimited market sizing, competitive landscapes, partner discovery, regulatory intelligence, and PDF export — everything you need to build a defensible market thesis.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px', fontWeight: '600' } },
      `Try Pro free for 7 days — no commitment, cancel anytime.`,
    ),
    createElement(
      'p',
      { style: { marginBottom: '14px' } },
      createElement(
        'a',
        {
          href: 'https://terrain.ambrosiaventures.co/settings/billing',
          style: {
            display: 'inline-block',
            background: '#00c9a7',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          },
        },
        'Start 7-Day Free Trial',
      ),
    ),
    createElement(
      'p',
      { style: { marginBottom: '0', color: '#64748b', fontSize: '13px' } },
      'Terrain by Ambrosia Ventures',
      createElement('br'),
      createElement(
        'a',
        { href: 'https://terrain.ambrosiaventures.co', style: { color: '#00c9a7' } },
        'terrain.ambrosiaventures.co',
      ),
    ),
  );
}

const EMAIL_CONFIG: Record<
  string,
  {
    subject: (p: LeadProfile) => string;
    component: (props: { profile: LeadProfile }) => React.ReactElement;
  }
> = {
  pro_trial_nudge: {
    subject: (p) => {
      const ind = p.topIndications[0] ? formatIndication(p.topIndications[0]) : 'your research';
      return `Continue your ${ind} analysis — try Pro free for 7 days`;
    },
    component: ProTrialNudgeEmail,
  },
  evaluating_nurture: {
    subject: (p) => {
      const ind = p.topIndications[0] ? formatIndication(p.topIndications[0]) : 'your target market';
      return `Market intelligence for ${ind}`;
    },
    component: EvaluatingEmail,
  },
  export_followup: {
    subject: () => 'Preparing for a board meeting or partner conversation?',
    component: ExportFollowupEmail,
  },
  high_intent_outreach: {
    subject: (p) => {
      const ind = p.topIndications[0] ? formatIndication(p.topIndications[0]) : 'your research';
      return `Quick question about ${ind}`;
    },
    component: HighIntentEmail,
  },
};

export async function sendLeadNurtureEmail(profile: LeadProfile, emailType: string): Promise<void> {
  const config = EMAIL_CONFIG[emailType];
  if (!config) {
    logger.warn('unknown_lead_email_type', { emailType });
    return;
  }

  try {
    const result = await sendEmail({
      to: profile.email,
      subject: config.subject(profile),
      react: createElement(config.component, { profile }),
      tags: [
        { name: 'type', value: `lead_${emailType}` },
        { name: 'deal_stage', value: profile.dealStage },
        { name: 'score', value: String(profile.score) },
      ],
    });

    if (result.success) {
      logger.info('lead_email_sent', { email: profile.email, type: emailType, score: profile.score });
    }
  } catch (error) {
    logger.error('lead_email_failed', {
      error: error instanceof Error ? error.message : 'Unknown',
      email: profile.email,
      type: emailType,
    });
  }
}
