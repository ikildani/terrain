// ============================================================
// TERRAIN — Opportunity Scoring Engine (Screener)
// lib/analytics/screener.ts
//
// Computes a 0-100 composite opportunity score for each of the
// 214 indications in the database across 5 weighted dimensions:
//   Market Attractiveness (0-30), Competitive Openness (0-25),
//   Unmet Need (0-20), Development Feasibility (0-15),
//   Partner Landscape (0-10).
//
// Outputs globally-adjusted prevalence/incidence using territory
// population multipliers, phase distribution, crowding analysis,
// white-space hints, and paginated/filterable results.
//
// Used by: /dashboard/screener, opportunity-ranking API routes
// ============================================================

import { INDICATION_DATA } from '@/lib/data/indication-map';
import type { IndicationData } from '@/lib/data/indication-map';
import { getCompetitorsForIndication } from '@/lib/data/competitor-database';
import type { CompetitorRecord } from '@/lib/data/competitor-database';
import { LOA_BY_PHASE_AND_AREA } from '@/lib/data/loa-tables';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import type { DevelopmentStage } from '@/types';

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

const US_POP_M = 336;

/** Key territory codes used for global prevalence extrapolation. */
const GLOBAL_TERRITORY_CODES = ['US', 'EU5', 'Japan', 'China', 'RoW'] as const;

/**
 * Sum of populations from key territories:
 * US(336) + EU5(330) + Japan(124) + China(1410) + RoW(6000) = ~8200M
 */
const GLOBAL_POP_M = TERRITORY_MULTIPLIERS.filter((t) =>
  (GLOBAL_TERRITORY_CODES as readonly string[]).includes(t.code),
).reduce((sum, t) => sum + t.population_m, 0);

/** Phase weights for crowding score computation. */
const PHASE_WEIGHTS: Record<string, number> = {
  Approved: 1.0,
  'Phase 3': 0.9,
  'Phase 2/3': 0.7,
  'Phase 2': 0.5,
  'Phase 1/2': 0.3,
  'Phase 1': 0.2,
  Preclinical: 0.1,
};

/** Maximum log-scaled prevalence reference (~50M patients). */
const MAX_LOG_PREVALENCE = Math.log10(50_000_000);

/** CAGR cap for market attractiveness scoring (15% = max score). */
const MAX_CAGR_REFERENCE = 15;

/** Average LOA reference ceiling (0.4 = max feasibility score). */
const MAX_AVG_LOA_REFERENCE = 0.4;

/** Active partner count ceiling for max partner landscape score. */
const MAX_ACTIVE_PARTNERS = 20;

// ────────────────────────────────────────────────────────────
// EXPORTED TYPES
// ────────────────────────────────────────────────────────────

export interface OpportunityFilters {
  therapy_areas?: string[];
  product_category?: string;
  min_prevalence?: number;
  max_crowding?: number;
  phases?: string[];
  min_opportunity_score?: number;
}

export interface OpportunityScoreBreakdown {
  market_attractiveness: number;
  competitive_openness: number;
  unmet_need: number;
  development_feasibility: number;
  partner_landscape: number;
}

export interface PhaseDistribution {
  approved: number;
  phase3: number;
  phase2: number;
  phase1: number;
  preclinical: number;
}

export interface TopAsset {
  company: string;
  asset: string;
  phase: string;
  mechanism: string;
}

export interface OpportunityRow {
  indication: string;
  therapy_area: string;
  opportunity_score: number;
  score_breakdown: OpportunityScoreBreakdown;
  global_prevalence: number;
  global_incidence: number;
  us_prevalence: number;
  us_incidence: number;
  cagr_5yr: number;
  crowding_score: number;
  crowding_label: string;
  competitor_count: number;
  phase_distribution: PhaseDistribution;
  treatment_rate: number;
  diagnosis_rate: number;
  top_competitors: string[];
  top_assets: TopAsset[];
  white_space_hints: string[];
  active_partner_count: number;
}

export interface ScreenerResult {
  opportunities: OpportunityRow[];
  total_count: number;
}

// ────────────────────────────────────────────────────────────
// CROWDING SCORE
// ────────────────────────────────────────────────────────────

interface CrowdingResult {
  score: number;
  label: string;
}

/**
 * Computes a 0-10 crowding score for an indication based on its
 * competitive pipeline. Accounts for phase-weighted asset count
 * and mechanism concentration (penalty if many assets share the
 * same mechanism category).
 */
function computeCrowdingScore(competitors: CompetitorRecord[]): CrowdingResult {
  if (competitors.length === 0) {
    return { score: 0, label: 'empty' };
  }

  // Phase-weighted count
  let weightedCount = 0;
  for (const c of competitors) {
    weightedCount += PHASE_WEIGHTS[c.phase] ?? 0.1;
  }

  // Mechanism concentration: penalize if many share same mechanism
  const mechs = new Set(competitors.map((c) => c.mechanism_category));
  const mechConcentration = 1 - mechs.size / Math.max(competitors.length, 1);

  // Raw score: weighted count normalized, with mechanism adjustment
  const raw = Math.min(weightedCount / 8, 1) * 8 + mechConcentration * 2;
  const score = Math.min(Math.max(Math.round(raw * 10) / 10, 0), 10);

  let label: string;
  if (score >= 8) label = 'very_crowded';
  else if (score >= 6) label = 'crowded';
  else if (score >= 3) label = 'moderate';
  else if (score >= 1) label = 'open';
  else label = 'empty';

  return { score, label };
}

// ────────────────────────────────────────────────────────────
// PHASE DISTRIBUTION
// ────────────────────────────────────────────────────────────

/**
 * Counts competitors into bucketed phase categories.
 */
function computePhaseDistribution(competitors: CompetitorRecord[]): PhaseDistribution {
  const dist: PhaseDistribution = {
    approved: 0,
    phase3: 0,
    phase2: 0,
    phase1: 0,
    preclinical: 0,
  };

  for (const c of competitors) {
    if (c.phase === 'Approved') {
      dist.approved++;
    } else if (c.phase === 'Phase 3') {
      dist.phase3++;
    } else if (c.phase.includes('2')) {
      dist.phase2++;
    } else if (c.phase.includes('1')) {
      dist.phase1++;
    } else {
      dist.preclinical++;
    }
  }

  return dist;
}

// ────────────────────────────────────────────────────────────
// WHITE SPACE HINTS
// ────────────────────────────────────────────────────────────

/**
 * Generates brief white-space notes based on competitive gaps.
 */
function computeWhiteSpaceHints(
  competitors: CompetitorRecord[],
  diagnosisRate: number,
  treatmentRate: number,
): string[] {
  const hints: string[] = [];

  if (competitors.length === 0) {
    hints.push('No active competitors — greenfield opportunity');
    return hints;
  }

  // 1. Mechanism diversity gap
  const mechs = new Set(competitors.map((c) => c.mechanism_category));
  if (mechs.size <= 2 && competitors.length >= 4) {
    const mechList = Array.from(mechs).join(', ');
    hints.push(
      `Low mechanism diversity (${mechs.size} classes for ${competitors.length} assets: ${mechList}) — novel MoA differentiation opportunity`,
    );
  }

  // 2. Line-of-therapy gap
  const linesPresent = new Set(
    competitors.map((c) => c.line_of_therapy).filter((l): l is string => l !== undefined && l !== null),
  );
  const standardLines = ['1L', '2L', '2L+', 'maintenance', 'adjuvant', 'neoadjuvant'];
  for (const line of standardLines) {
    if (!linesPresent.has(line) && hints.length < 5) {
      hints.push(`No assets targeting ${line} — potential line-of-therapy gap`);
    }
    if (hints.length >= 3) break;
  }

  // 3. Biomarker selection gap
  const anyBiomarker = competitors.some((c) => c.has_biomarker_selection);
  if (!anyBiomarker && hints.length < 5) {
    hints.push('No biomarker-selected assets — precision medicine angle open');
  }

  // 4. Combination therapy gap
  const comboKeywords = ['combo', 'combination', '+', 'plus'];
  const comboCompetitors = competitors.filter((c) =>
    comboKeywords.some(
      (kw) => c.indication_specifics.toLowerCase().includes(kw) || c.mechanism.toLowerCase().includes(kw),
    ),
  );
  if (comboCompetitors.length === 0 && competitors.length >= 3 && hints.length < 5) {
    hints.push('No combination regimens in pipeline — rational combination design opportunity');
  }

  // 5. Diagnosis/treatment gaps
  if (diagnosisRate < 0.5 && hints.length < 6) {
    hints.push(`Low diagnosis rate (${Math.round(diagnosisRate * 100)}%) — market expansion via diagnostic companion`);
  }
  if (treatmentRate < 0.5 && hints.length < 6) {
    hints.push(`Low treatment rate (${Math.round(treatmentRate * 100)}%) — significant untreated patient pool`);
  }

  // 6. Orphan drug gap
  const anyOrphan = competitors.some((c) => c.orphan_drug);
  if (!anyOrphan && competitors.length >= 2 && hints.length < 6) {
    hints.push('No orphan-designated assets — potential for orphan drug incentives');
  }

  return hints.slice(0, 6);
}

// ────────────────────────────────────────────────────────────
// TOP COMPETITORS / TOP ASSETS
// ────────────────────────────────────────────────────────────

/** Phase sort order — Approved is highest priority. */
const PHASE_SORT_ORDER: Record<string, number> = {
  Approved: 0,
  'Phase 3': 1,
  'Phase 2/3': 2,
  'Phase 2': 3,
  'Phase 1/2': 4,
  'Phase 1': 5,
  Preclinical: 6,
};

/**
 * Returns the top N unique company names, ordered by most advanced phase.
 */
function getTopCompanies(competitors: CompetitorRecord[], n: number): string[] {
  const sorted = [...competitors].sort((a, b) => (PHASE_SORT_ORDER[a.phase] ?? 7) - (PHASE_SORT_ORDER[b.phase] ?? 7));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const c of sorted) {
    const co = c.company;
    if (!seen.has(co)) {
      seen.add(co);
      result.push(co);
    }
    if (result.length >= n) break;
  }
  return result;
}

/**
 * Returns the top N assets, ordered by most advanced phase.
 */
function getTopAssets(competitors: CompetitorRecord[], n: number): TopAsset[] {
  const sorted = [...competitors].sort((a, b) => (PHASE_SORT_ORDER[a.phase] ?? 7) - (PHASE_SORT_ORDER[b.phase] ?? 7));
  return sorted.slice(0, n).map((c) => ({
    company: c.company,
    asset: c.asset_name,
    phase: c.phase,
    mechanism: c.mechanism_category,
  }));
}

// ────────────────────────────────────────────────────────────
// GLOBAL EPIDEMIOLOGY
// ────────────────────────────────────────────────────────────

interface GlobalEpidemiology {
  globalPrevalence: number;
  globalIncidence: number;
}

/**
 * Extrapolates US epidemiology data to global estimates using
 * territory population data. Uses a simple per-capita rate
 * extrapolation across key territories.
 */
function computeGlobalEpidemiology(indication: IndicationData): GlobalEpidemiology {
  const prevalenceRatePerM = indication.us_prevalence / US_POP_M;
  const globalPrevalence = Math.round(prevalenceRatePerM * GLOBAL_POP_M);

  const incidenceRatePerM = indication.us_incidence / US_POP_M;
  const globalIncidence = Math.round(incidenceRatePerM * GLOBAL_POP_M);

  return { globalPrevalence, globalIncidence };
}

// ────────────────────────────────────────────────────────────
// OPPORTUNITY SCORE — 5 DIMENSIONS
// ────────────────────────────────────────────────────────────

/**
 * Market Attractiveness (0-30):
 * Log-scaled global prevalence (0-20) + CAGR bonus (0-10).
 */
function scoreMarketAttractiveness(globalPrevalence: number, cagrPct: number): number {
  const logPrev = Math.log10(Math.max(globalPrevalence, 1));
  const prevScore = Math.min(logPrev / MAX_LOG_PREVALENCE, 1) * 20;
  const cagrScore = Math.min(cagrPct / MAX_CAGR_REFERENCE, 1) * 10;
  return Math.round((prevScore + cagrScore) * 10) / 10;
}

/**
 * Competitive Openness (0-25):
 * Inverse of crowding — a crowding score of 0 yields 25, and 10 yields 0.
 */
function scoreCompetitiveOpenness(crowdingScore: number): number {
  return Math.round(25 * (1 - crowdingScore / 10) * 10) / 10;
}

/**
 * Unmet Need (0-20):
 * Weighted combination of treatment gap (60%) and diagnosis gap (40%).
 * Low treatment + low diagnosis = high unmet need = high score.
 */
function scoreUnmetNeed(treatmentRate: number, diagnosisRate: number): number {
  const treatmentGap = 1 - treatmentRate;
  const diagnosisGap = 1 - diagnosisRate;
  return Math.round(20 * (treatmentGap * 0.6 + diagnosisGap * 0.4) * 10) / 10;
}

/**
 * Development Feasibility (0-15):
 * Average LOA across Phase 1/2/3 for the therapy area, normalized to
 * a 0.4 ceiling (40% average LOA across phases = max score).
 */
function scoreDevelopmentFeasibility(therapyArea: string): number {
  const loaData: Record<DevelopmentStage, number> = LOA_BY_PHASE_AND_AREA[therapyArea] ||
    LOA_BY_PHASE_AND_AREA['other'] || {
      preclinical: 0.05,
      phase1: 0.08,
      phase2: 0.15,
      phase3: 0.5,
      approved: 1.0,
    };

  const avgLoa = (loaData.phase1 + loaData.phase2 + loaData.phase3) / 3;
  const raw = 15 * (avgLoa / MAX_AVG_LOA_REFERENCE);
  return Math.round(Math.min(raw, 15) * 10) / 10;
}

/**
 * Partner Landscape (0-10):
 * Count of active or very-active BD partners whose therapeutic_areas
 * overlap with the indication's therapy area, normalized to a 20-partner
 * ceiling (20+ active partners = max score).
 */
function scorePartnerLandscape(therapyArea: string): { score: number; activeCount: number } {
  const taLower = therapyArea.toLowerCase();
  const activePartners = PHARMA_PARTNER_DATABASE.filter(
    (p) =>
      p.therapeutic_areas.some((ta) => ta.toLowerCase().includes(taLower)) &&
      (p.bd_activity === 'active' || p.bd_activity === 'very_active'),
  );
  const count = activePartners.length;
  const score = Math.round(Math.min(count / MAX_ACTIVE_PARTNERS, 1) * 10 * 10) / 10;
  return { score, activeCount: count };
}

// ────────────────────────────────────────────────────────────
// COMPOSITE SCORE
// ────────────────────────────────────────────────────────────

interface ScoredIndication {
  row: OpportunityRow;
}

/**
 * Computes the full opportunity profile for a single indication.
 * Accepts an optional pre-fetched competitors array to avoid redundant lookups.
 */
function scoreIndication(indication: IndicationData, prefetchedCompetitors?: CompetitorRecord[]): ScoredIndication {
  // Competitors
  const competitors = prefetchedCompetitors ?? getCompetitorsForIndication(indication.name);
  const competitorCount = competitors.length;

  // Crowding
  const { score: crowdingScore, label: crowdingLabel } = computeCrowdingScore(competitors);

  // Phase distribution
  const phaseDist = computePhaseDistribution(competitors);

  // Global epidemiology
  const { globalPrevalence, globalIncidence } = computeGlobalEpidemiology(indication);

  // 5-dimension scoring
  const marketAttractiveness = scoreMarketAttractiveness(globalPrevalence, indication.cagr_5yr);
  const competitiveOpenness = scoreCompetitiveOpenness(crowdingScore);
  const unmetNeed = scoreUnmetNeed(indication.treatment_rate, indication.diagnosis_rate);
  const developmentFeasibility = scoreDevelopmentFeasibility(indication.therapy_area);
  const { score: partnerLandscapeScore, activeCount } = scorePartnerLandscape(indication.therapy_area);

  const opportunityScore =
    Math.round(
      (marketAttractiveness + competitiveOpenness + unmetNeed + developmentFeasibility + partnerLandscapeScore) * 10,
    ) / 10;

  // Top competitors & assets
  const topCompanies = getTopCompanies(competitors, 3);
  const topAssets = getTopAssets(competitors, 5);

  // White space hints
  const whiteSpaceHints = computeWhiteSpaceHints(competitors, indication.diagnosis_rate, indication.treatment_rate);

  const row: OpportunityRow = {
    indication: indication.name,
    therapy_area: indication.therapy_area,
    opportunity_score: opportunityScore,
    score_breakdown: {
      market_attractiveness: marketAttractiveness,
      competitive_openness: competitiveOpenness,
      unmet_need: unmetNeed,
      development_feasibility: developmentFeasibility,
      partner_landscape: partnerLandscapeScore,
    },
    global_prevalence: globalPrevalence,
    global_incidence: globalIncidence,
    us_prevalence: indication.us_prevalence,
    us_incidence: indication.us_incidence,
    cagr_5yr: indication.cagr_5yr,
    crowding_score: crowdingScore,
    crowding_label: crowdingLabel,
    competitor_count: competitorCount,
    phase_distribution: phaseDist,
    treatment_rate: indication.treatment_rate,
    diagnosis_rate: indication.diagnosis_rate,
    top_competitors: topCompanies,
    top_assets: topAssets,
    white_space_hints: whiteSpaceHints,
    active_partner_count: activeCount,
  };

  return { row };
}

// ────────────────────────────────────────────────────────────
// FILTERING
// ────────────────────────────────────────────────────────────

/**
 * Returns true if the row passes all supplied filters.
 */
function passesFilters(row: OpportunityRow, competitors: CompetitorRecord[], filters: OpportunityFilters): boolean {
  // Therapy area filter
  if (filters.therapy_areas && filters.therapy_areas.length > 0 && !filters.therapy_areas.includes(row.therapy_area)) {
    return false;
  }

  // Minimum global prevalence
  if (filters.min_prevalence !== undefined && row.global_prevalence < filters.min_prevalence) {
    return false;
  }

  // Maximum crowding score
  if (filters.max_crowding !== undefined && row.crowding_score > filters.max_crowding) {
    return false;
  }

  // Phase filter: indication must have at least one competitor in one of the specified phases
  if (filters.phases && filters.phases.length > 0) {
    const phasesLower = filters.phases.map((p) => p.toLowerCase());
    const hasMatchingPhase = competitors.some((c) => phasesLower.includes(c.phase.toLowerCase()));
    if (!hasMatchingPhase) {
      return false;
    }
  }

  // Minimum opportunity score
  if (filters.min_opportunity_score !== undefined && row.opportunity_score < filters.min_opportunity_score) {
    return false;
  }

  return true;
}

// ────────────────────────────────────────────────────────────
// SORTING
// ────────────────────────────────────────────────────────────

/** Valid sort field keys for OpportunityRow. */
type SortableField =
  | 'opportunity_score'
  | 'global_prevalence'
  | 'global_incidence'
  | 'us_prevalence'
  | 'us_incidence'
  | 'cagr_5yr'
  | 'crowding_score'
  | 'competitor_count'
  | 'treatment_rate'
  | 'diagnosis_rate'
  | 'active_partner_count'
  | 'indication'
  | 'therapy_area'
  | 'unmet_need';

/**
 * Returns a numeric comparison value for sorting. String fields
 * use localeCompare and return -1/0/1.
 */
function compareRows(a: OpportunityRow, b: OpportunityRow, sortBy: string, sortOrder: 'asc' | 'desc'): number {
  const field = sortBy as SortableField;
  let comparison: number;

  switch (field) {
    case 'indication':
      comparison = a.indication.localeCompare(b.indication);
      break;
    case 'therapy_area':
      comparison = a.therapy_area.localeCompare(b.therapy_area);
      break;
    case 'opportunity_score':
      comparison = a.opportunity_score - b.opportunity_score;
      break;
    case 'global_prevalence':
      comparison = a.global_prevalence - b.global_prevalence;
      break;
    case 'global_incidence':
      comparison = a.global_incidence - b.global_incidence;
      break;
    case 'us_prevalence':
      comparison = a.us_prevalence - b.us_prevalence;
      break;
    case 'us_incidence':
      comparison = a.us_incidence - b.us_incidence;
      break;
    case 'cagr_5yr':
      comparison = a.cagr_5yr - b.cagr_5yr;
      break;
    case 'crowding_score':
      comparison = a.crowding_score - b.crowding_score;
      break;
    case 'competitor_count':
      comparison = a.competitor_count - b.competitor_count;
      break;
    case 'treatment_rate':
      comparison = a.treatment_rate - b.treatment_rate;
      break;
    case 'diagnosis_rate':
      comparison = a.diagnosis_rate - b.diagnosis_rate;
      break;
    case 'active_partner_count':
      comparison = a.active_partner_count - b.active_partner_count;
      break;
    case 'unmet_need':
      comparison = a.score_breakdown.unmet_need - b.score_breakdown.unmet_need;
      break;
    default:
      comparison = a.opportunity_score - b.opportunity_score;
      break;
  }

  return sortOrder === 'desc' ? -comparison : comparison;
}

// ────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ────────────────────────────────────────────────────────────

/**
 * Scores all 214 indications, applies filters, sorts, and paginates.
 *
 * @param filters  - Optional filters to narrow results
 * @param sortBy   - Field to sort by (default: 'opportunity_score')
 * @param sortOrder - 'asc' or 'desc' (default: 'desc')
 * @param limit    - Maximum rows per page (default: 50)
 * @param offset   - Starting index for pagination (default: 0)
 *
 * @returns Paginated opportunity rows and total count after filtering.
 */
export function scoreAllIndications(
  filters?: OpportunityFilters,
  sortBy: string = 'opportunity_score',
  sortOrder: 'asc' | 'desc' = 'desc',
  limit: number = 50,
  offset: number = 0,
): ScreenerResult {
  const scoredRows: OpportunityRow[] = [];

  for (const indication of INDICATION_DATA) {
    // Fetch competitors once and pass to both scoreIndication and passesFilters
    const competitors = getCompetitorsForIndication(indication.name);
    const { row } = scoreIndication(indication, competitors);

    // Apply filters (reuses already-fetched competitors for phase filter)
    if (filters) {
      if (!passesFilters(row, competitors, filters)) {
        continue;
      }
    }

    scoredRows.push(row);
  }

  // Sort
  scoredRows.sort((a, b) => compareRows(a, b, sortBy, sortOrder));

  const totalCount = scoredRows.length;

  // Paginate
  const paginated = scoredRows.slice(offset, offset + limit);

  return {
    opportunities: paginated,
    total_count: totalCount,
  };
}

/**
 * Scores a single indication by name. Returns null if the indication
 * is not found in the database.
 */
export function scoreIndicationByName(indicationName: string): OpportunityRow | null {
  const normalized = indicationName.toLowerCase().trim();
  const match = INDICATION_DATA.find((ind) => ind.name.toLowerCase().trim() === normalized);

  if (!match) return null;

  const { row } = scoreIndication(match);
  return row;
}

/**
 * Returns all unique therapy areas present in the indication database.
 * Useful for populating filter dropdowns in the UI.
 */
export function getAvailableTherapyAreas(): string[] {
  const areas = new Set(INDICATION_DATA.map((ind) => ind.therapy_area));
  return Array.from(areas).sort();
}

/**
 * Returns summary statistics across all scored indications.
 * Useful for dashboard overview widgets.
 */
export function getScreenerSummary(): {
  total_indications: number;
  therapy_area_counts: Record<string, number>;
  avg_opportunity_score: number;
  score_distribution: { bucket: string; count: number }[];
} {
  const allRows: OpportunityRow[] = [];
  for (const indication of INDICATION_DATA) {
    const { row } = scoreIndication(indication);
    allRows.push(row);
  }

  const therapyAreaCounts: Record<string, number> = {};
  let scoreSum = 0;
  const buckets: Record<string, number> = {
    '0-20': 0,
    '20-40': 0,
    '40-60': 0,
    '60-80': 0,
    '80-100': 0,
  };

  for (const row of allRows) {
    therapyAreaCounts[row.therapy_area] = (therapyAreaCounts[row.therapy_area] || 0) + 1;
    scoreSum += row.opportunity_score;

    if (row.opportunity_score < 20) buckets['0-20']++;
    else if (row.opportunity_score < 40) buckets['20-40']++;
    else if (row.opportunity_score < 60) buckets['40-60']++;
    else if (row.opportunity_score < 80) buckets['60-80']++;
    else buckets['80-100']++;
  }

  return {
    total_indications: allRows.length,
    therapy_area_counts: therapyAreaCounts,
    avg_opportunity_score: Math.round((scoreSum / Math.max(allRows.length, 1)) * 10) / 10,
    score_distribution: Object.entries(buckets).map(([bucket, count]) => ({
      bucket,
      count,
    })),
  };
}
