import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkUsage } from '@/lib/usage';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger, logApiRequest, logApiResponse } from '@/lib/logger';
import { getCompetitorsForIndication, type CompetitorRecord } from '@/lib/data/competitor-database';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';
import { findIndicationByName } from '@/lib/data/indication-map';
import { getCommunityDataForIndication, type CommunityPrevalenceEntry } from '@/lib/data/community-prevalence';
import { sanitizePostgrestValue } from '@/lib/utils/sanitize';
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

interface EmergingAsset {
  asset_name: string;
  company: string;
  phase: string;
  mechanism: string;
  mechanism_category: string;
  is_first_in_class: boolean;
  is_unpartnered: boolean;
  strengths: string[];
  source: string;
}

interface CommunityInsight {
  community: string;
  prevalence_multiplier: number;
  affected_population_estimate: number;
  key_evidence: string;
  clinical_trial_representation: string;
  modality_gaps: string[];
}

// Therapy area alias map for partner matching (mirrors screener.ts)
const THERAPY_AREA_ALIASES: Record<string, string[]> = {
  neurology: ['neuroscience', 'neuro', 'cns'],
  gastroenterology: ['gi', 'gastrointestinal', 'digestive'],
  pulmonology: ['respiratory', 'pulmonary', 'lung'],
  nephrology: ['renal', 'kidney'],
  hepatology: ['liver', 'hepatic', 'hepatitis'],
  musculoskeletal: ['orthopedic', 'bone', 'joint', 'rheumatology'],
  pain_management: ['pain', 'analgesic', 'analgesia'],
  endocrinology: ['endocrine', 'diabetes', 'thyroid', 'hormonal'],
  psychiatry: ['mental health', 'behavioral', 'psychiatric'],
  immunology: ['autoimmune', 'inflammation', 'immune'],
  cardiovascular: ['cardiology', 'cardiac', 'heart', 'vascular'],
  metabolic: ['metabolism', 'obesity', 'lipid'],
  infectious_disease: ['infectious', 'anti-infective', 'antiviral', 'antibacterial', 'vaccines'],
  ophthalmology: ['ophthalmic', 'eye', 'retinal', 'vision'],
  dermatology: ['skin', 'dermatologic'],
  rare_disease: ['orphan', 'ultra-rare', 'genetic disease'],
  oncology: ['cancer', 'tumor', 'immuno-oncology', 'io'],
  hematology: ['blood', 'hemophilia', 'thrombosis'],
};

function matchesTherapyArea(partnerArea: string, indicationArea: string): boolean {
  const pa = partnerArea.toLowerCase();
  const ia = indicationArea.toLowerCase();
  if (pa.includes(ia) || ia.includes(pa)) return true;
  const aliases = THERAPY_AREA_ALIASES[ia];
  if (aliases) {
    for (const alias of aliases) {
      if (pa.includes(alias) || alias.includes(pa)) return true;
    }
  }
  return false;
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

    // Filter partner database for matching therapy area — top 5 by alignment (alias-aware)
    const topPartners: TopPartner[] = PHARMA_PARTNER_DATABASE.filter((p) =>
      p.therapeutic_areas.some((ta) => matchesTherapyArea(ta, therapyArea)),
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

    // ── Emerging pipeline (early-stage / unpartnered assets) ──
    const earlyPhases = new Set(['Preclinical', 'Phase 1', 'Phase 1/2', 'Phase 2']);
    const emergingAssets: EmergingAsset[] = competitors
      .filter((c) => earlyPhases.has(c.phase))
      .sort((a, b) => {
        // Prefer unpartnered, first-in-class, and more advanced phase
        const phaseOrder: Record<string, number> = { 'Phase 2': 0, 'Phase 1/2': 1, 'Phase 1': 2, Preclinical: 3 };
        const aScore = (a.partner ? 0 : 2) + (a.first_in_class ? 1 : 0) + (3 - (phaseOrder[a.phase] ?? 3));
        const bScore = (b.partner ? 0 : 2) + (b.first_in_class ? 1 : 0) + (3 - (phaseOrder[b.phase] ?? 3));
        return bScore - aScore;
      })
      .slice(0, 10)
      .map((c) => ({
        asset_name: c.asset_name,
        company: c.company,
        phase: c.phase,
        mechanism: c.mechanism,
        mechanism_category: c.mechanism_category,
        is_first_in_class: c.first_in_class,
        is_unpartnered: !c.partner,
        strengths: c.strengths,
        source: c.source,
      }));

    // ── Community health disparity data ────────────────────
    const communityData = getCommunityDataForIndication(indication);
    const communityInsights: CommunityInsight[] = communityData
      .sort((a, b) => b.prevalence_multiplier - a.prevalence_multiplier)
      .slice(0, 8)
      .map((c) => ({
        community: c.community,
        prevalence_multiplier: c.prevalence_multiplier,
        affected_population_estimate: c.affected_population_estimate,
        key_evidence: c.key_evidence,
        clinical_trial_representation: c.clinical_trial_representation,
        modality_gaps: c.modality_gaps,
      }));

    // ── Supabase cache queries (in parallel) ────────────────
    const searchTerm = sanitizePostgrestValue(indication.trim());

    // Derive approved/late-stage drug names for FDA approval lookup
    const approvedDrugNames = competitors
      .filter((c) => c.phase === 'Approved' || c.phase === 'Phase 3')
      .map((c) => c.asset_name)
      .filter((name) => name.length >= 3)
      .slice(0, 10);

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
            .or(competitorCompanies.map((c) => `company_name.ilike.%${sanitizePostgrestValue(c)}%`).join(','))
            .order('filed_date', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] as SecFiling[], error: null }),

      // FDA approvals: search by competitor drug names (brand_name/generic_name)
      approvedDrugNames.length > 0
        ? supabase
            .from('fda_approvals_cache')
            .select(FDA_COLUMNS)
            .or(
              approvedDrugNames
                .map(
                  (d) =>
                    `brand_name.ilike.%${sanitizePostgrestValue(d)}%,generic_name.ilike.%${sanitizePostgrestValue(d)}%`,
                )
                .join(','),
            )
            .order('approval_date', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] as FdaApproval[], error: null }),
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
          emerging_assets: emergingAssets,
          community_insights: communityInsights,
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
