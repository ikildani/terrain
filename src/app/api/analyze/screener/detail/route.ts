import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage } from '@/lib/usage';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, logApiRequest, logApiResponse } from '@/lib/logger';
import { getCompetitorsForIndication, type CompetitorRecord } from '@/lib/data/competitor-database';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';
import { findIndicationByName } from '@/lib/data/indication-map';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

interface ClinicalTrial {
  nct_id: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: unknown;
  sponsor: string;
  enrollment: number;
  start_date: string;
  completion_date: string;
  last_update_posted: string;
  fetched_at: string;
}

interface FdaApproval {
  application_number: string;
  brand_name: string;
  generic_name: string;
  sponsor_name: string;
  approval_date: string;
  application_type: string;
  active_ingredients: string[];
  route: string;
  dosage_form: string;
  submission_type: string;
  submission_status: string;
  fetched_at: string;
}

interface SecFiling {
  accession_number: string;
  company_name: string;
  ticker: string;
  cik: string;
  form_type: string;
  filed_date: string;
  description: string;
  file_url: string;
  is_deal_related: boolean;
  deal_keywords: string[];
  fetched_at: string;
}

interface TopPartner {
  company: string;
  therapeutic_areas: string[];
  bd_activity: string;
  recent_deal?: string;
}

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const DetailRequestSchema = z.object({
  indication: z.string().min(1),
  product_category: z.string().default('pharmaceutical'),
});

// ────────────────────────────────────────────────────────────
// COLUMN SELECTIONS (match intelligence feed route)
// ────────────────────────────────────────────────────────────

const TRIALS_COLUMNS =
  'nct_id, title, status, phase, conditions, interventions, sponsor, enrollment, start_date, completion_date, last_update_posted, fetched_at';
const FDA_COLUMNS =
  'application_number, brand_name, generic_name, sponsor_name, approval_date, application_type, active_ingredients, route, dosage_form, submission_type, submission_status, fetched_at';
const SEC_COLUMNS =
  'accession_number, company_name, ticker, cik, form_type, filed_date, description, file_url, is_deal_related, deal_keywords, fetched_at';

// ────────────────────────────────────────────────────────────
// POST /api/analyze/screener/detail
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const routeStart = performance.now();
  try {
    // ── Auth ──────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required.' } satisfies ApiResponse<never>, {
        status: 401,
      });
    }

    // ── Rate limit (plan-aware) ──────────────────────────────
    const { data: subForRl } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();
    const userPlan = (subForRl?.plan as string) || 'free';
    const rlConfig =
      userPlan === 'team'
        ? RATE_LIMITS.analysis_team
        : userPlan === 'pro'
          ? RATE_LIMITS.analysis_pro
          : RATE_LIMITS.analysis_free;
    const rl = await rateLimit(`screener-detail:${user.id}`, rlConfig);
    if (!rl.success) {
      logApiResponse({
        route: '/api/analyze/screener/detail',
        status: 429,
        durationMs: Math.round(performance.now() - routeStart),
        userId: user.id,
      });
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' } satisfies ApiResponse<never>,
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    // ── Usage limit check ─────────────────────────────────────
    const usage = await checkUsage(user.id, 'competitive');

    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Monthly limit reached (${usage.limit} analyses on ${usage.plan} plan). Upgrade to Pro for unlimited access.`,
          usage: {
            feature: usage.feature,
            monthly_count: usage.monthlyCount,
            limit: usage.limit,
            remaining: 0,
          },
        } satisfies ApiResponse<never> & { usage: unknown },
        { status: 403 },
      );
    }

    // ── Parse body ──────────────────────────────────────────
    const body = await request.json();

    // ── Validate with Zod ───────────────────────────────────
    const parsed = DetailRequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { indication, product_category } = parsed.data;

    logApiRequest({
      route: '/api/analyze/screener/detail',
      method: 'POST',
      userId: user.id,
      indication,
      product_category,
    });

    // ── Static data (synchronous) ───────────────────────────
    const competitors = getCompetitorsForIndication(indication);
    const indicationData = findIndicationByName(indication);
    const therapyArea = indicationData?.therapy_area?.toLowerCase() ?? '';

    // Derive top competitor company names for SEC filing search
    const competitorCompanies = Array.from(new Set(competitors.map((c) => c.company))).slice(0, 10);

    // Filter partner database for matching therapy area — top 5 by alignment
    const topPartners: TopPartner[] = PHARMA_PARTNER_DATABASE.filter((p) =>
      p.therapeutic_areas.some(
        (ta) => ta.toLowerCase().includes(therapyArea) || therapyArea.includes(ta.toLowerCase()),
      ),
    )
      .sort((a, b) => {
        // Prefer more active BD teams and those with more relevant recent deals
        const activityScore: Record<string, number> = {
          very_active: 4,
          active: 3,
          moderate: 2,
          selective: 1,
        };
        return (activityScore[b.bd_activity] ?? 0) - (activityScore[a.bd_activity] ?? 0);
      })
      .slice(0, 5)
      .map((p) => ({
        company: p.company,
        therapeutic_areas: p.therapeutic_areas,
        bd_activity: p.bd_activity,
        recent_deal:
          p.recent_deals.length > 0
            ? `${p.recent_deals[0].asset} (${p.recent_deals[0].deal_type}, ${p.recent_deals[0].year})`
            : undefined,
      }));

    // ── White-space identification ──────────────────────────
    const mechanismCategories = Array.from(new Set(competitors.map((c) => c.mechanism_category)));
    const phases = Array.from(new Set(competitors.map((c) => c.phase)));
    const whiteSpace: string[] = [];

    if (!phases.includes('Approved') && competitors.length > 0) {
      whiteSpace.push('No approved therapies — first-to-market opportunity');
    }
    if (competitors.filter((c) => c.phase === 'Phase 3').length < 2) {
      whiteSpace.push('Fewer than 2 late-stage (Phase 3) competitors');
    }
    if (mechanismCategories.length < 3) {
      whiteSpace.push(
        `Limited mechanism diversity (${mechanismCategories.length} classes) — novel MoA could differentiate`,
      );
    }
    if (competitors.every((c) => !c.has_biomarker_selection)) {
      whiteSpace.push('No biomarker-selected therapies — precision medicine opportunity');
    }
    if (competitors.every((c) => c.line_of_therapy !== '1L')) {
      whiteSpace.push('No first-line competitors — 1L positioning available');
    }

    // ── Supabase cache queries (in parallel) ────────────────
    const searchTerm = indication.trim();

    const [trialsResult, secResult, fdaResult] = await Promise.all([
      // Clinical trials: search by indication in conditions or title
      supabase
        .from('clinical_trials_cache')
        .select(TRIALS_COLUMNS)
        .or(`conditions.cs.{${searchTerm}},title.ilike.%${searchTerm}%`)
        .order('last_update_posted', { ascending: false })
        .limit(15),

      // SEC filings: search by top competitor company names
      competitorCompanies.length > 0
        ? supabase
            .from('sec_filings_cache')
            .select(SEC_COLUMNS)
            .or(competitorCompanies.map((c) => `company_name.ilike.%${c}%`).join(','))
            .order('filed_date', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] as SecFiling[], error: null }),

      // FDA approvals: search by indication in brand_name or generic_name
      supabase
        .from('fda_approvals_cache')
        .select(FDA_COLUMNS)
        .or(`brand_name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
        .order('approval_date', { ascending: false })
        .limit(10),
    ]);

    // Log any query errors but don't fail the request
    if (trialsResult.error) {
      logger.warn('screener_detail_trials_query_failed', {
        error: trialsResult.error.message,
        indication: searchTerm,
      });
    }
    if (secResult.error) {
      logger.warn('screener_detail_sec_query_failed', {
        error: secResult.error.message,
        indication: searchTerm,
      });
    }
    if (fdaResult.error) {
      logger.warn('screener_detail_fda_query_failed', {
        error: fdaResult.error.message,
        indication: searchTerm,
      });
    }

    // ── Success ─────────────────────────────────────────────
    logApiResponse({
      route: '/api/analyze/screener/detail',
      status: 200,
      durationMs: Math.round(performance.now() - routeStart),
      userId: user.id,
      indication,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          trials: (trialsResult.data ?? []) as ClinicalTrial[],
          sec_filings: (secResult.data ?? []) as SecFiling[],
          fda_approvals: (fdaResult.data ?? []) as FdaApproval[],
          competitors: competitors as CompetitorRecord[],
          top_partners: topPartners,
          white_space: whiteSpace,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Screener detail fetch failed.';
    logger.error('screener_detail_error', {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    logApiResponse({
      route: '/api/analyze/screener/detail',
      status: 500,
      durationMs: Math.round(performance.now() - routeStart),
    });
    return NextResponse.json(
      { success: false, error: 'Screener detail fetch failed. Please try again.' } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
