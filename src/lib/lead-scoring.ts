// ============================================================
// TERRAIN — Lead Scoring & Advisory Conversion Engine
//
// Turns platform usage into advisory client leads. Scores users
// based on behavior signals, classifies deal stage, and triggers
// Slack alerts + email drips for high-intent users.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

// ── Score Weights ────────────────────────────────────────────

const SIGNAL_WEIGHTS = {
  analysis_run: 5,
  repeat_indication_7d: 30,
  pdf_export: 20,
  partner_matching: 25,
  cdmo_matching: 30,
  competitive_landscape: 10,
  market_sizing: 10,
  regulatory_analysis: 10,
  report_saved: 15,
  combined_competitive_market: 20,
} as const;

// ── Types ────────────────────────────────────────────────────

export type DealStage = 'exploring' | 'evaluating' | 'preparing' | 'active';
export type LeadTemperature = 'cold' | 'warm' | 'hot' | 'on_fire';

export interface LeadProfile {
  userId: string;
  email: string;
  company: string | null;
  fullName: string | null;
  score: number;
  temperature: LeadTemperature;
  dealStage: DealStage;
  topIndications: string[];
  modulesUsed: string[];
  recentAnalyses: AnalysisContext[];
  totalAnalyses7d: number;
  totalExports: number;
  totalPartnerRuns: number;
  totalCdmoRuns: number;
}

export interface AnalysisContext {
  feature: string;
  indication: string | null;
  productCategory: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface LeadScoreEvent {
  userId: string;
  email: string;
  company: string | null;
  fullName: string | null;
  score: number;
  temperature: LeadTemperature;
  dealStage: DealStage;
  trigger: string;
  indication: string | null;
  modulesUsed: string[];
  topIndications: string[];
  recentAnalyses: AnalysisContext[];
}

// ── Core Scoring ─────────────────────────────────────────────

function classifyTemperature(score: number): LeadTemperature {
  if (score >= 81) return 'on_fire';
  if (score >= 51) return 'hot';
  if (score >= 21) return 'warm';
  return 'cold';
}

function classifyDealStage(profile: {
  totalAnalyses7d: number;
  totalExports: number;
  totalPartnerRuns: number;
  totalCdmoRuns: number;
  repeatIndication: boolean;
}): DealStage {
  // Active: multiple modules + exports + CDMO + return visits
  if (profile.totalCdmoRuns > 0 && profile.totalExports > 0 && profile.totalAnalyses7d >= 3) {
    return 'active';
  }
  // Preparing: exports + partner matching
  if (profile.totalExports > 0 && profile.totalPartnerRuns > 0) {
    return 'preparing';
  }
  // Evaluating: 3+ in same indication
  if (profile.repeatIndication && profile.totalAnalyses7d >= 3) {
    return 'evaluating';
  }
  return 'exploring';
}

/**
 * Compute lead score and profile for a user based on their usage_events.
 * Called after every analysis to check thresholds.
 */
export async function computeLeadScore(userId: string): Promise<LeadProfile | null> {
  const supabase = createAdminClient();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, company')
    .eq('id', userId)
    .single();

  if (!profile?.email) return null;

  // Get all usage events in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: events } = await supabase
    .from('usage_events')
    .select('feature, indication, metadata, created_at')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (!events || events.length === 0) return null;

  // Compute signals
  const indicationCounts: Record<string, number> = {};
  const modulesUsed = new Set<string>();
  let totalExports = 0;
  let totalPartnerRuns = 0;
  let totalCdmoRuns = 0;
  let hasCompetitive = false;
  let hasMarketSizing = false;

  for (const event of events) {
    modulesUsed.add(event.feature);

    if (event.indication) {
      indicationCounts[event.indication] = (indicationCounts[event.indication] || 0) + 1;
    }

    if (event.feature === 'partner_matching') totalPartnerRuns++;
    if (event.feature === 'cdmo_matching') totalCdmoRuns++;
    if (event.feature === 'competitive') hasCompetitive = true;
    if (event.feature === 'market_sizing') hasMarketSizing = true;

    const meta = event.metadata as Record<string, unknown>;
    if (meta?.exported_pdf) totalExports++;
  }

  // Find repeat indications (3+ in same indication within 7 days)
  const repeatIndications = Object.entries(indicationCounts)
    .filter(([, count]) => count >= 3)
    .map(([ind]) => ind);

  const topIndications = Object.entries(indicationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([ind]) => ind);

  // Calculate score
  let score = 0;
  score += events.length * SIGNAL_WEIGHTS.analysis_run;
  if (repeatIndications.length > 0) score += SIGNAL_WEIGHTS.repeat_indication_7d;
  score += totalExports * SIGNAL_WEIGHTS.pdf_export;
  score += totalPartnerRuns * SIGNAL_WEIGHTS.partner_matching;
  score += totalCdmoRuns * SIGNAL_WEIGHTS.cdmo_matching;
  if (hasCompetitive && hasMarketSizing) score += SIGNAL_WEIGHTS.combined_competitive_market;

  // Cap at 100
  score = Math.min(100, score);

  const temperature = classifyTemperature(score);
  const dealStage = classifyDealStage({
    totalAnalyses7d: events.length,
    totalExports,
    totalPartnerRuns,
    totalCdmoRuns,
    repeatIndication: repeatIndications.length > 0,
  });

  const recentAnalyses: AnalysisContext[] = events.slice(0, 5).map((e) => ({
    feature: e.feature,
    indication: e.indication,
    productCategory: (e.metadata as Record<string, unknown>)?.product_category as string | null,
    createdAt: e.created_at,
    metadata: e.metadata as Record<string, unknown>,
  }));

  return {
    userId,
    email: profile.email,
    company: profile.company ?? null,
    fullName: profile.full_name ?? null,
    score,
    temperature,
    dealStage,
    topIndications,
    modulesUsed: Array.from(modulesUsed),
    recentAnalyses,
    totalAnalyses7d: events.length,
    totalExports,
    totalPartnerRuns,
    totalCdmoRuns,
  };
}

/**
 * Process lead scoring after an analysis. Checks thresholds,
 * fires Slack alerts, queues emails.
 */
export async function processLeadSignal(userId: string, trigger: string, indication: string | null): Promise<void> {
  try {
    const profile = await computeLeadScore(userId);
    if (!profile) return;

    // Store lead score event
    const supabase = createAdminClient();
    await supabase
      .from('lead_score_events')
      .insert({
        user_id: userId,
        email: profile.email,
        company: profile.company,
        score: profile.score,
        temperature: profile.temperature,
        deal_stage: profile.dealStage,
        trigger,
        indication,
        modules_used: profile.modulesUsed,
        top_indications: profile.topIndications,
        metadata: {
          recent_analyses: profile.recentAnalyses,
          total_exports: profile.totalExports,
          total_partner_runs: profile.totalPartnerRuns,
          total_cdmo_runs: profile.totalCdmoRuns,
        },
      })
      .then(() => {})
      .catch(() => {});

    // Slack alert for hot+ leads
    if (profile.score > 50) {
      const { notifyHotLead } = await import('@/lib/slack');
      await notifyHotLead(profile);
    }

    // Email drip triggers
    await checkEmailTriggers(profile, trigger);
  } catch (error) {
    logger.error('lead_scoring_error', {
      error: error instanceof Error ? error.message : 'Unknown',
      userId,
    });
  }
}

// ── Email Drip Logic ─────────────────────────────────────────

async function checkEmailTriggers(profile: LeadProfile, trigger: string): Promise<void> {
  const supabase = createAdminClient();

  // Check what emails we've already sent to this user
  const { data: sentEmails } = await supabase
    .from('lead_emails_sent')
    .select('email_type')
    .eq('user_id', profile.userId);

  const sent = new Set((sentEmails || []).map((e) => e.email_type));

  // Email 1: After evaluating stage (repeat indication research)
  if (profile.dealStage === 'evaluating' && !sent.has('evaluating_nurture')) {
    await queueLeadEmail(profile, 'evaluating_nurture');
  }

  // Email 2: After PDF export
  if (profile.totalExports > 0 && !sent.has('export_followup')) {
    await queueLeadEmail(profile, 'export_followup');
  }

  // Email 3: When score > 70 (direct Issa outreach)
  if (profile.score > 70 && !sent.has('high_intent_outreach')) {
    await queueLeadEmail(profile, 'high_intent_outreach');
  }
}

async function queueLeadEmail(profile: LeadProfile, emailType: string): Promise<void> {
  const supabase = createAdminClient();

  // Record that we're sending this email (dedup)
  await supabase
    .from('lead_emails_sent')
    .insert({
      user_id: profile.userId,
      email_type: emailType,
      email: profile.email,
    })
    .then(() => {})
    .catch(() => {});

  // Delay emails slightly — don't send immediately after analysis
  // In production this would use a queue; for now we send inline
  const { sendLeadNurtureEmail } = await import('@/lib/lead-emails');
  await sendLeadNurtureEmail(profile, emailType);
}
