// ============================================================
// TERRAIN — Opportunity Scoring Engine (Screener)
// lib/analytics/screener.ts
//
// Computes a 0-100 composite opportunity score for each of the
// 224 indications in the database across 5 weighted dimensions:
//   Market Attractiveness (0-30), Competitive Openness (0-25),
//   Unmet Need (0-20), Development Feasibility (0-15),
//   Partner Landscape (0-10).
//
// Outputs globally-adjusted prevalence/incidence using territory
// population multipliers, phase distribution, crowding analysis,
// white-space hints, early-stage asset discovery, and
// paginated/filterable results.
//
// Used by: /dashboard/screener, opportunity-ranking API routes
// ============================================================

import { INDICATION_DATA } from '@/lib/data/indication-map';
import type { IndicationData } from '@/lib/data/indication-map';
import { getCompetitorsForIndication } from '@/lib/data/competitor-database';
import type { CompetitorRecord } from '@/lib/data/competitor-database';
import { LOA_BY_PHASE_AND_AREA, INDICATION_SPECIFIC_LOA } from '@/lib/data/loa-tables';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { getRegionalFactors } from '@/lib/data/regional-prevalence-factors';
import { getCommunityDataForIndication } from '@/lib/data/community-prevalence';
import { INDICATION_SUBTYPES, getSubtypesForIndication } from '@/lib/data/indication-subtypes';
import type { IndicationSubtype } from '@/lib/data/indication-subtypes';
import { BIOMARKER_DATA, getBiomarkersForIndication } from '@/lib/data/biomarker-prevalence';
import type { BiomarkerEntry } from '@/lib/data/biomarker-prevalence';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { computeLoeImpactScore } from '@/lib/data/patent-cliffs';
import type { DevelopmentStage } from '@/types';

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

const US_POP_M = 336;

/** Key territory codes used for global prevalence extrapolation. */
const GLOBAL_TERRITORY_CODES = ['US', 'EU5', 'Japan', 'China', 'RoW'] as const;

/** Phase weights for crowding score computation. Withdrawn/Discontinued reduce crowding. */
const PHASE_WEIGHTS: Record<string, number> = {
  Approved: 1.0,
  'Phase 3': 0.9,
  'Phase 2/3': 0.7,
  'Phase 2': 0.5,
  'Phase 1/2': 0.3,
  'Phase 1': 0.2,
  Preclinical: 0.1,
  Withdrawn: -0.3,
  Discontinued: -0.2,
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
// HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Formats a large number into a compact human-readable string.
 * Used for score explanations and labels.
 */
function formatLargeNum(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toString();
}

// ────────────────────────────────────────────────────────────
// EXPORTED TYPES
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// WEIGHT PROFILES — User-configurable scoring lens
// ────────────────────────────────────────────────────────────

/**
 * Scoring weight profile. All values are 0-100 and must sum to 100.
 * Default is the balanced profile (30/25/20/15/10).
 */
export interface ScoringWeightProfile {
  market_attractiveness: number;
  competitive_openness: number;
  unmet_need: number;
  development_feasibility: number;
  partner_landscape: number;
}

/** Pre-built weight profiles for different strategic lenses. */
export const WEIGHT_PROFILES: Record<string, { label: string; description: string; weights: ScoringWeightProfile }> = {
  balanced: {
    label: 'Balanced',
    description: 'Equal emphasis across all dimensions — general-purpose screening',
    weights: {
      market_attractiveness: 30,
      competitive_openness: 25,
      unmet_need: 20,
      development_feasibility: 15,
      partner_landscape: 10,
    },
  },
  rare_disease: {
    label: 'Rare Disease',
    description: 'Prioritizes unmet need and feasibility over market size — orphan drug strategy',
    weights: {
      market_attractiveness: 15,
      competitive_openness: 20,
      unmet_need: 35,
      development_feasibility: 20,
      partner_landscape: 10,
    },
  },
  big_pharma_bd: {
    label: 'Big Pharma BD',
    description: 'Prioritizes large markets and partner activity — in-licensing focus',
    weights: {
      market_attractiveness: 35,
      competitive_openness: 20,
      unmet_need: 15,
      development_feasibility: 15,
      partner_landscape: 15,
    },
  },
  competitive_entry: {
    label: 'Competitive Entry',
    description: 'Prioritizes open markets and competitive dynamics — white space hunting',
    weights: {
      market_attractiveness: 20,
      competitive_openness: 35,
      unmet_need: 20,
      development_feasibility: 15,
      partner_landscape: 10,
    },
  },
  investor: {
    label: 'Investor',
    description: 'Prioritizes market attractiveness and feasibility — ROI-oriented',
    weights: {
      market_attractiveness: 35,
      competitive_openness: 20,
      unmet_need: 10,
      development_feasibility: 25,
      partner_landscape: 10,
    },
  },
};

/** Default weight profile key. */
export const DEFAULT_WEIGHT_PROFILE = 'balanced';

/** Max raw score per dimension (for normalization to 0-1 before applying weights). */
const DIMENSION_MAX: ScoringWeightProfile = {
  market_attractiveness: 30,
  competitive_openness: 25,
  unmet_need: 20,
  development_feasibility: 15,
  partner_landscape: 10,
};

export interface OpportunityFilters {
  therapy_areas?: string[];
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

export interface CommunityDisparity {
  community: string;
  prevalence_multiplier: number;
  clinical_trial_representation: string;
  modality_gap_count: number;
}

export type DataConfidence = 'high' | 'medium' | 'low';

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
  community_disparities: CommunityDisparity[];
  emerging_asset_count: number;
  data_confidence: DataConfidence;

  // Enriched fields
  revenue_potential_label: string;
  median_wac: number;
  severity_profile: Record<string, number> | null;
  biomarker_count: number;
  key_biomarkers: string[];
  subtype_count: number;
  unpartnered_fic_count: number;
  novel_mechanism_count: number;
  indication_loa: Record<string, number> | null;
  has_indication_loa: boolean;
  nearest_patent_cliff_year: number | null;
  loe_revenue_at_risk: number;
  score_explanations: Record<string, string>;

  // Investor-focused fields
  deal_activity: DealActivity;
  catalyst_signals: CatalystSignal[];
  investment_thesis: string;
}

export interface DealActivity {
  recent_deal_count: number;
  avg_deal_upfront_m: number;
  avg_deal_total_m: number;
  largest_deal_total_m: number;
  deal_velocity_trend: 'accelerating' | 'stable' | 'decelerating' | 'no_data';
  notable_deals: { company: string; asset: string; total_value_m: number; year: number }[];
}

export interface CatalystSignal {
  type: 'patent_cliff' | 'pipeline_catalyst' | 'deal_momentum' | 'regulatory_tailwind' | 'unmet_need' | 'market_growth';
  signal: string;
  timing: string;
  impact: 'high' | 'medium' | 'low';
}

export interface EarlyStageAsset {
  asset_name: string;
  company: string;
  indication: string;
  therapy_area: string;
  phase: string;
  mechanism: string;
  mechanism_category: string;
  molecular_target?: string;
  is_first_in_class: boolean;
  is_unpartnered: boolean;
  is_orphan: boolean;
  has_biomarker: boolean;
  strengths: string[];
  scouting_score: number;
  scouting_signals: string[];
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
 * (including negative weights for Withdrawn/Discontinued) and
 * mechanism concentration (penalty if many assets share the
 * same mechanism category).
 *
 * Normalization cap raised to 20 to better differentiate
 * heavily crowded oncology indications from moderate ones.
 */
function computeCrowdingScore(competitors: CompetitorRecord[]): CrowdingResult {
  if (competitors.length === 0) {
    return { score: 0, label: 'no_data' };
  }

  // Phase-weighted count (Withdrawn/Discontinued reduce the total)
  let weightedCount = 0;
  for (const c of competitors) {
    weightedCount += PHASE_WEIGHTS[c.phase] ?? 0.1;
  }

  // Mechanism concentration: penalize if many share same mechanism
  const mechs = new Set(competitors.map((c) => c.mechanism_category));
  const mechConcentration = 1 - mechs.size / Math.max(competitors.length, 1);

  // Raw score: weighted count normalized to 20 cap, with mechanism adjustment
  const raw = Math.min(weightedCount / 20, 1) * 8 + mechConcentration * 2;
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
  Withdrawn: 7,
  Discontinued: 8,
};

/**
 * Returns the top N unique company names, ordered by most advanced phase.
 */
function getTopCompanies(competitors: CompetitorRecord[], n: number): string[] {
  const sorted = [...competitors].sort((a, b) => (PHASE_SORT_ORDER[a.phase] ?? 9) - (PHASE_SORT_ORDER[b.phase] ?? 9));
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
  const sorted = [...competitors].sort((a, b) => (PHASE_SORT_ORDER[a.phase] ?? 9) - (PHASE_SORT_ORDER[b.phase] ?? 9));
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

/** Territory populations keyed by code for quick lookup. */
const TERRITORY_POP: Record<string, number> = Object.fromEntries(
  TERRITORY_MULTIPLIERS.filter((t) => (GLOBAL_TERRITORY_CODES as readonly string[]).includes(t.code)).map((t) => [
    t.code,
    t.population_m,
  ]),
);

/**
 * Extrapolates US epidemiology data to global estimates using
 * territory-specific disease burden adjustment factors.
 *
 * Instead of assuming identical per-capita rates worldwide (which
 * dramatically over- or under-estimates for many therapy areas),
 * this applies curated regional prevalence multipliers from
 * WHO GBD / GLOBOCAN / published literature.
 *
 * For each territory:
 *   territory_cases = (US_rate_per_million) x (territory_pop_M) x (regional_factor)
 *
 * Global total = US + EU5 + Japan + China + RoW (sum of adjusted territories).
 */
function computeGlobalEpidemiology(indication: IndicationData): GlobalEpidemiology {
  const factors = getRegionalFactors(indication.therapy_area);

  const usPrevalenceRatePerM = indication.us_prevalence / US_POP_M;
  const usIncidenceRatePerM = indication.us_incidence / US_POP_M;

  // US contribution (factor = 1.0 by definition)
  let totalPrevalence = indication.us_prevalence;
  let totalIncidence = indication.us_incidence;

  // EU5 contribution
  const eu5Pop = TERRITORY_POP['EU5'] ?? 330;
  totalPrevalence += usPrevalenceRatePerM * eu5Pop * factors.eu5;
  totalIncidence += usIncidenceRatePerM * eu5Pop * factors.eu5;

  // Japan contribution
  const japanPop = TERRITORY_POP['Japan'] ?? 124;
  totalPrevalence += usPrevalenceRatePerM * japanPop * factors.japan;
  totalIncidence += usIncidenceRatePerM * japanPop * factors.japan;

  // China contribution
  const chinaPop = TERRITORY_POP['China'] ?? 1410;
  totalPrevalence += usPrevalenceRatePerM * chinaPop * factors.china;
  totalIncidence += usIncidenceRatePerM * chinaPop * factors.china;

  // Rest of World contribution
  const rowPop = TERRITORY_POP['RoW'] ?? 6000;
  totalPrevalence += usPrevalenceRatePerM * rowPop * factors.row;
  totalIncidence += usIncidenceRatePerM * rowPop * factors.row;

  return {
    globalPrevalence: Math.round(totalPrevalence),
    globalIncidence: Math.round(totalIncidence),
  };
}

// ────────────────────────────────────────────────────────────
// OPPORTUNITY SCORE — 5 DIMENSIONS
// ────────────────────────────────────────────────────────────

/**
 * Market Attractiveness (0-30):
 * Log-scaled global prevalence (0-15) + CAGR bonus (0-7) +
 * revenue potential component (0-8) using WAC benchmarks.
 */
function scoreMarketAttractiveness(
  globalPrevalence: number,
  cagrPct: number,
  therapyArea: string,
  indicationName: string,
  treatmentRate: number,
): number {
  // Prevalence component (0-15)
  const logPrev = Math.log10(Math.max(globalPrevalence, 1));
  const prevScore = Math.min(logPrev / MAX_LOG_PREVALENCE, 1) * 15;

  // CAGR component (0-7)
  const cagrScore = Math.min(cagrPct / MAX_CAGR_REFERENCE, 1) * 7;

  // Revenue potential component (0-8): WAC x addressable patients
  const benchmarks = PRICING_BENCHMARKS.filter((b) => b.therapy_area === therapyArea);
  const medianWac =
    benchmarks.length > 0
      ? benchmarks.map((b) => b.us_launch_wac_annual).sort((a, b) => a - b)[Math.floor(benchmarks.length / 2)]
      : 50000;
  const revenueSignal = Math.log10(Math.max(globalPrevalence * treatmentRate * (medianWac / 100000), 1));
  const revenueScore = Math.min(revenueSignal / 5, 1) * 8;

  return Math.round((prevScore + cagrScore + revenueScore) * 10) / 10;
}

/**
 * Competitive Openness (0-25):
 * Uses a sigmoid (S-curve) rather than linear mapping so that:
 *   - Low crowding (0-3): openness stays high (20-25) — diminishing returns
 *   - Mid crowding (3-7): openness drops steeply — most discriminating range
 *   - High crowding (7-10): openness is low (0-5) — floor effect
 * When competitorCount is 0, caps at 15/25 to avoid inflating empty markets
 * where the high openness may simply reflect missing data.
 */
function scoreCompetitiveOpenness(crowdingScore: number, competitorCount: number): number {
  // Sigmoid: f(x) = 1 / (1 + e^(k*(x - midpoint)))
  // midpoint=5 (center of 0-10 range), k=0.8 (steepness)
  const sigmoid = 1 / (1 + Math.exp(0.8 * (crowdingScore - 5)));
  const raw = Math.round(25 * sigmoid * 10) / 10;
  if (competitorCount === 0) return Math.min(raw, 15);
  return raw;
}

/**
 * Unmet Need (0-20):
 * Weighted combination of treatment gap (50%), diagnosis gap (30%),
 * and severity bonus (20%). High severity + low treatment = high score.
 */
function scoreUnmetNeed(
  treatmentRate: number,
  diagnosisRate: number,
  severityDistribution?: Record<string, number>,
): number {
  const treatmentGap = 1 - treatmentRate;
  const diagnosisGap = 1 - diagnosisRate;

  let severityBonus = 0;
  if (severityDistribution) {
    const severePct =
      (severityDistribution['severe'] ?? 0) +
      (severityDistribution['very_severe'] ?? 0) +
      (severityDistribution['critical'] ?? 0);
    severityBonus = Math.min(severePct / 0.5, 1); // 50%+ severe = max bonus
  }

  return Math.round(20 * (treatmentGap * 0.5 + diagnosisGap * 0.3 + severityBonus * 0.2) * 10) / 10;
}

/**
 * Development Feasibility (0-15):
 * Prioritizes indication-specific LoA when available, falls back to
 * therapy-area LoA, then hardcoded defaults. Adds bonuses for:
 *   - Biomarker availability (+1) if strong biomarker testing exists
 *   - Orphan drug eligibility (+1.5) if US prevalence < 200,000
 *     (faster review, 7-year exclusivity, tax credits reduce dev cost)
 *
 * Returns the score plus metadata for explanations.
 */
function scoreDevelopmentFeasibility(
  therapyArea: string,
  indicationName: string,
  biomarkers: BiomarkerEntry[],
  usPrevalence?: number,
): { score: number; avgLoa: number; hasIndicationLoa: boolean; biomarkerBonus: number; orphanBonus: number } {
  // Try indication-specific LoA first
  const indicationKey = indicationName.toLowerCase();
  const indicationLoa = INDICATION_SPECIFIC_LOA[indicationKey];

  let loaData: Record<DevelopmentStage, number>;
  let hasIndicationLoa = false;

  if (indicationLoa) {
    loaData = indicationLoa;
    hasIndicationLoa = true;
  } else if (LOA_BY_PHASE_AND_AREA[therapyArea]) {
    loaData = LOA_BY_PHASE_AND_AREA[therapyArea];
  } else {
    // Hardcoded defaults — never use 'other' key
    loaData = {
      preclinical: 0.05,
      phase1: 0.08,
      phase2: 0.15,
      phase3: 0.5,
      approved: 1.0,
    };
  }

  const avgLoa = (loaData.phase1 + loaData.phase2 + loaData.phase3) / 3;
  let raw = 15 * (avgLoa / MAX_AVG_LOA_REFERENCE);

  // Biomarker availability bonus: if any biomarker has testing_rate > 50%, +1
  let biomarkerBonus = 0;
  if (biomarkers.some((b) => b.testing_rate_pct > 50)) {
    biomarkerBonus = 1;
    raw += 1;
  }

  // Orphan drug regulatory advantage bonus: US prevalence < 200,000
  // Benefits: priority review, 7-year market exclusivity, FDA fee waivers, tax credits
  let orphanBonus = 0;
  if (usPrevalence !== undefined && usPrevalence < 200_000) {
    orphanBonus = 1.5;
    raw += 1.5;
  }

  const score = Math.round(Math.min(raw, 15) * 10) / 10;
  return { score, avgLoa, hasIndicationLoa, biomarkerBonus, orphanBonus };
}

/**
 * Alias map for fuzzy therapy area matching between the screener's
 * standard therapy_area names and the varied naming in partner profiles.
 * Each standard area maps to additional tokens that should count as a match.
 */
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

/**
 * Returns true if the partner's listed therapeutic area matches the
 * screener's standard therapy_area. Uses bidirectional includes +
 * alias expansion for robust matching.
 */
function matchesTherapyArea(partnerArea: string, indicationArea: string): boolean {
  const pa = partnerArea.toLowerCase();
  const ia = indicationArea.toLowerCase();

  // Direct bidirectional includes
  if (pa.includes(ia) || ia.includes(pa)) return true;

  // Alias expansion: check if partner area matches any alias of the indication area
  const aliases = THERAPY_AREA_ALIASES[ia];
  if (aliases) {
    for (const alias of aliases) {
      if (pa.includes(alias) || alias.includes(pa)) return true;
    }
  }

  return false;
}

/**
 * Partner Landscape (0-10):
 * Count of active or very-active BD partners whose therapeutic_areas
 * overlap with the indication's therapy area (0-7), plus an
 * indication-specific deal bonus (0-3) for partners with recent
 * deals mentioning the indication.
 */
function scorePartnerLandscape(
  therapyArea: string,
  indicationName: string,
  competitors: CompetitorRecord[],
): { score: number; activeCount: number; indicationDealBonus: number } {
  // Therapy-area partner count (0-7)
  const activePartners = PHARMA_PARTNER_DATABASE.filter(
    (p) =>
      p.therapeutic_areas.some((ta) => matchesTherapyArea(ta, therapyArea)) &&
      (p.bd_activity === 'active' || p.bd_activity === 'very_active'),
  );
  const count = activePartners.length;
  const taScore = Math.min(count / MAX_ACTIVE_PARTNERS, 1) * 7;

  // Indication-specific deal bonus (0-3): partners with recent_deals mentioning the indication
  const indicationLower = indicationName.toLowerCase();
  let indicationDealBonus = 0;
  for (const partner of PHARMA_PARTNER_DATABASE) {
    if (indicationDealBonus >= 3) break;
    const hasIndicationDeal = partner.recent_deals.some(
      (d) =>
        d.indication.toLowerCase().includes(indicationLower) || indicationLower.includes(d.indication.toLowerCase()),
    );
    if (hasIndicationDeal) {
      indicationDealBonus++;
    }
  }

  const rawScore = taScore + indicationDealBonus;
  const score = Math.round(Math.min(rawScore, 10) * 10) / 10;
  return { score, activeCount: count, indicationDealBonus };
}

// ────────────────────────────────────────────────────────────
// DEAL ACTIVITY (investor feature)
// ────────────────────────────────────────────────────────────

function computeDealActivity(indicationName: string, therapyArea: string): DealActivity {
  const indicationLower = indicationName.toLowerCase();
  const taLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const currentYear = new Date().getFullYear();

  // Collect all deals matching this indication (direct or via therapy area)
  const indicationDeals: { company: string; asset: string; total_value_m: number; upfront_m: number; year: number }[] =
    [];
  const taDeals: typeof indicationDeals = [];

  for (const partner of PHARMA_PARTNER_DATABASE) {
    for (const deal of partner.recent_deals) {
      const dealInd = deal.indication.toLowerCase();
      if (dealInd.includes(indicationLower) || indicationLower.includes(dealInd)) {
        indicationDeals.push({
          company: partner.company,
          asset: deal.asset,
          total_value_m: deal.total_value_m,
          upfront_m: deal.upfront_m,
          year: deal.year,
        });
      } else if (
        partner.therapeutic_areas.some((ta) =>
          ta
            .toLowerCase()
            .replace(/[\s\-]+/g, '_')
            .includes(taLower),
        )
      ) {
        taDeals.push({
          company: partner.company,
          asset: deal.asset,
          total_value_m: deal.total_value_m,
          upfront_m: deal.upfront_m,
          year: deal.year,
        });
      }
    }
  }

  // Use indication-level deals if available, otherwise therapy-area deals
  const relevantDeals = indicationDeals.length >= 2 ? indicationDeals : [...indicationDeals, ...taDeals.slice(0, 10)];

  if (relevantDeals.length === 0) {
    return {
      recent_deal_count: 0,
      avg_deal_upfront_m: 0,
      avg_deal_total_m: 0,
      largest_deal_total_m: 0,
      deal_velocity_trend: 'no_data',
      notable_deals: [],
    };
  }

  const withValues = relevantDeals.filter((d) => d.total_value_m > 0);
  const avgUpfront = withValues.length > 0 ? withValues.reduce((s, d) => s + d.upfront_m, 0) / withValues.length : 0;
  const avgTotal = withValues.length > 0 ? withValues.reduce((s, d) => s + d.total_value_m, 0) / withValues.length : 0;
  const largest = withValues.reduce((max, d) => Math.max(max, d.total_value_m), 0);

  // Deal velocity: compare recent deals (last 2 years) vs older
  const recent = relevantDeals.filter((d) => d.year >= currentYear - 1).length;
  const older = relevantDeals.filter((d) => d.year < currentYear - 1).length;
  const trend: DealActivity['deal_velocity_trend'] =
    recent > older * 1.5 ? 'accelerating' : recent < older * 0.5 ? 'decelerating' : 'stable';

  // Notable deals: top 3 by total value
  const notable = [...withValues].sort((a, b) => b.total_value_m - a.total_value_m).slice(0, 3);

  return {
    recent_deal_count: relevantDeals.length,
    avg_deal_upfront_m: Math.round(avgUpfront),
    avg_deal_total_m: Math.round(avgTotal),
    largest_deal_total_m: Math.round(largest),
    deal_velocity_trend: trend,
    notable_deals: notable.map((d) => ({
      company: d.company,
      asset: d.asset,
      total_value_m: d.total_value_m,
      year: d.year,
    })),
  };
}

// ────────────────────────────────────────────────────────────
// CATALYST SIGNALS (investor feature)
// ────────────────────────────────────────────────────────────

function buildCatalystSignals(
  indication: IndicationData,
  loeImpact: { score: number; nearestCliffYear: number | null; totalRevenueAtRisk: number; cliffCount: number },
  dealActivity: DealActivity,
  competitors: CompetitorRecord[],
  crowdingScore: number,
): CatalystSignal[] {
  const signals: CatalystSignal[] = [];
  const currentYear = new Date().getFullYear();

  // Patent cliff catalyst
  if (loeImpact.nearestCliffYear && loeImpact.nearestCliffYear >= currentYear) {
    const yearsOut = loeImpact.nearestCliffYear - currentYear;
    signals.push({
      type: 'patent_cliff',
      signal: `$${loeImpact.totalRevenueAtRisk.toFixed(1)}B revenue at risk across ${loeImpact.cliffCount} drug(s) losing exclusivity`,
      timing:
        yearsOut <= 2 ? 'Imminent (0-2 years)' : yearsOut <= 4 ? 'Near-term (2-4 years)' : `${yearsOut} years out`,
      impact: yearsOut <= 2 ? 'high' : yearsOut <= 4 ? 'medium' : 'low',
    });
  }

  // Pipeline catalyst — Phase 3 readouts suggest near-term market changes
  const ph3Count = competitors.filter((c) => c.phase === 'Phase 3').length;
  if (ph3Count > 0) {
    signals.push({
      type: 'pipeline_catalyst',
      signal: `${ph3Count} Phase 3 program(s) with potential near-term readouts`,
      timing: 'Next 12-24 months',
      impact: ph3Count >= 3 ? 'high' : 'medium',
    });
  }

  // Emerging pipeline activity — lots of early-stage = future competition wave
  const earlyCount = competitors.filter((c) => ['Preclinical', 'Phase 1', 'Phase 1/2'].includes(c.phase)).length;
  if (earlyCount >= 5) {
    signals.push({
      type: 'pipeline_catalyst',
      signal: `${earlyCount} early-stage assets signaling strong R&D interest`,
      timing: '3-7 years',
      impact: earlyCount >= 10 ? 'high' : 'medium',
    });
  }

  // Deal momentum
  if (dealActivity.deal_velocity_trend === 'accelerating') {
    signals.push({
      type: 'deal_momentum',
      signal: `Deal activity accelerating — ${dealActivity.recent_deal_count} recent transactions, avg $${dealActivity.avg_deal_total_m}M total value`,
      timing: 'Current',
      impact: 'high',
    });
  } else if (dealActivity.recent_deal_count >= 3) {
    signals.push({
      type: 'deal_momentum',
      signal: `Active deal market — ${dealActivity.recent_deal_count} transactions with avg $${dealActivity.avg_deal_upfront_m}M upfront`,
      timing: 'Current',
      impact: 'medium',
    });
  }

  // Regulatory tailwind — orphan drug / high unmet need
  if (indication.us_prevalence < 200000) {
    signals.push({
      type: 'regulatory_tailwind',
      signal: 'Orphan drug designation eligible — accelerated review, 7-year market exclusivity, tax credits',
      timing: 'Ongoing regulatory advantage',
      impact: 'high',
    });
  }

  // Unmet need signal
  if (indication.treatment_rate < 0.4) {
    signals.push({
      type: 'unmet_need',
      signal: `Only ${(indication.treatment_rate * 100).toFixed(0)}% of patients treated — large addressable gap for new entrants`,
      timing: 'Structural opportunity',
      impact: indication.treatment_rate < 0.2 ? 'high' : 'medium',
    });
  }

  // Market growth signal
  if (indication.cagr_5yr >= 8) {
    signals.push({
      type: 'market_growth',
      signal: `${indication.cagr_5yr.toFixed(1)}% 5-year CAGR — above-average market expansion`,
      timing: 'Next 5 years',
      impact: indication.cagr_5yr >= 12 ? 'high' : 'medium',
    });
  }

  // Low crowding = open market
  if (crowdingScore < 3 && competitors.length >= 1) {
    signals.push({
      type: 'regulatory_tailwind',
      signal: `Low competitive crowding (${crowdingScore.toFixed(1)}/10) — favorable market entry window`,
      timing: 'Current',
      impact: 'medium',
    });
  }

  // Sort by impact (high first)
  const impactOrder = { high: 0, medium: 1, low: 2 };
  signals.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return signals.slice(0, 6); // Cap at 6 most important
}

// ────────────────────────────────────────────────────────────
// INVESTMENT THESIS (investor feature)
// ────────────────────────────────────────────────────────────

function buildInvestmentThesis(
  indication: IndicationData,
  opportunityScore: number,
  crowdingScore: number,
  dealActivity: DealActivity,
  loeImpact: { nearestCliffYear: number | null; totalRevenueAtRisk: number; cliffCount: number },
  competitorCount: number,
  catalysts: CatalystSignal[],
): string {
  const parts: string[] = [];

  // Market characterization
  const marketSize =
    indication.us_prevalence >= 1000000
      ? `large (${(indication.us_prevalence / 1000000).toFixed(1)}M US patients)`
      : indication.us_prevalence >= 200000
        ? `mid-size (${Math.round(indication.us_prevalence / 1000)}K US patients)`
        : `rare/niche (${indication.us_prevalence < 10000 ? `${Math.round(indication.us_prevalence / 1000)}K` : `${Math.round(indication.us_prevalence / 1000)}K`} US patients)`;

  const growthDescriptor = indication.cagr_5yr >= 10 ? 'high-growth' : indication.cagr_5yr >= 5 ? 'growing' : 'mature';

  parts.push(`${indication.name} is a ${growthDescriptor}, ${marketSize} market`);

  // Competitive dynamics
  if (crowdingScore >= 7) {
    parts[0] += ` with significant competitive density (${competitorCount} programs)`;
  } else if (crowdingScore >= 4) {
    parts[0] += ` with moderate competition (${competitorCount} programs)`;
  } else if (competitorCount > 0) {
    parts[0] += ` with limited competition (${competitorCount} programs) — favorable for differentiated entrants`;
  }
  parts[0] += '.';

  // "Why now" — pick the strongest catalyst
  const highImpactCatalysts = catalysts.filter((c) => c.impact === 'high');
  if (highImpactCatalysts.length > 0) {
    const whyNow = highImpactCatalysts[0];
    if (whyNow.type === 'patent_cliff') {
      parts.push(
        `Key timing catalyst: $${loeImpact.totalRevenueAtRisk.toFixed(0)}B in incumbent revenue faces LOE by ${loeImpact.nearestCliffYear}, creating a window for next-generation assets.`,
      );
    } else if (whyNow.type === 'deal_momentum') {
      parts.push(
        `Active deal environment with ${dealActivity.recent_deal_count} recent transactions (avg $${dealActivity.avg_deal_upfront_m}M upfront / $${dealActivity.avg_deal_total_m}M total), suggesting strong acquirer interest.`,
      );
    } else if (whyNow.type === 'regulatory_tailwind') {
      parts.push(`Regulatory tailwind: ${whyNow.signal.charAt(0).toLowerCase() + whyNow.signal.slice(1)}.`);
    } else if (whyNow.type === 'unmet_need') {
      parts.push(`Significant unmet need: ${whyNow.signal.charAt(0).toLowerCase() + whyNow.signal.slice(1)}.`);
    } else {
      parts.push(`${whyNow.signal}.`);
    }
  }

  // Deal landscape context
  if (dealActivity.largest_deal_total_m > 0 && !parts.some((p) => p.includes('deal'))) {
    parts.push(
      `Comparable transactions range up to $${dealActivity.largest_deal_total_m >= 1000 ? `${(dealActivity.largest_deal_total_m / 1000).toFixed(1)}B` : `${dealActivity.largest_deal_total_m}M`} total value.`,
    );
  }

  // Score-based verdict
  if (opportunityScore >= 75) {
    parts.push('Opportunity score indicates a top-tier investment thesis.');
  } else if (opportunityScore >= 55) {
    parts.push('Opportunity score supports a credible investment case with manageable risk.');
  }

  return parts.join(' ');
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
 * When weights are provided, normalizes each sub-score to 0-1 and applies
 * the user-selected weight profile for a customized composite score.
 */
function scoreIndication(
  indication: IndicationData,
  prefetchedCompetitors?: CompetitorRecord[],
  weights?: ScoringWeightProfile,
): ScoredIndication {
  // Competitors
  const competitors = prefetchedCompetitors ?? getCompetitorsForIndication(indication.name);
  const competitorCount = competitors.length;

  // Crowding
  const { score: crowdingScore, label: crowdingLabel } = computeCrowdingScore(competitors);

  // Phase distribution
  const phaseDist = computePhaseDistribution(competitors);

  // Global epidemiology
  const { globalPrevalence, globalIncidence } = computeGlobalEpidemiology(indication);

  // ── Biomarkers ──
  const biomarkers = getBiomarkersForIndication(indication.name);
  const biomarkerCount = biomarkers.length;
  const keyBiomarkers = biomarkers.slice(0, 3).map((b) => b.biomarker);

  // ── Subtypes ──
  const subtypeData = getSubtypesForIndication(indication.name);
  const subtypeCount = subtypeData?.subtypes?.length ?? 0;

  // ── Pricing / Revenue potential ──
  const taBenchmarks = PRICING_BENCHMARKS.filter((b) => b.therapy_area === indication.therapy_area);
  const medianWac =
    taBenchmarks.length > 0
      ? taBenchmarks.map((b) => b.us_launch_wac_annual).sort((a, b) => a - b)[Math.floor(taBenchmarks.length / 2)]
      : 50000;
  const estRevenue = globalPrevalence * indication.treatment_rate * medianWac;
  const revLabel =
    estRevenue >= 5e9 ? 'blockbuster' : estRevenue >= 1e9 ? 'large' : estRevenue >= 200e6 ? 'mid' : 'niche';

  // ── Early-stage / first-in-class / unpartnered / novel mechanisms ──
  const earlyPhases = new Set(['Preclinical', 'Phase 1', 'Phase 1/2']);
  const approvedMechs = new Set(competitors.filter((c) => c.phase === 'Approved').map((c) => c.mechanism_category));
  const unpartneredFic = competitors.filter((c) => earlyPhases.has(c.phase) && !c.partner && c.first_in_class).length;
  const novelMechs = competitors.filter((c) => !approvedMechs.has(c.mechanism_category)).length;

  // ── Indication-specific LoA ──
  const indicationKey = indication.name.toLowerCase();
  const indicationLoaData = INDICATION_SPECIFIC_LOA[indicationKey] ?? null;
  const hasIndicationLoa = indicationLoaData !== null;

  // ── 5-dimension scoring ──
  const marketAttractiveness = scoreMarketAttractiveness(
    globalPrevalence,
    indication.cagr_5yr,
    indication.therapy_area,
    indication.name,
    indication.treatment_rate,
  );
  const baseCompetitiveOpenness = scoreCompetitiveOpenness(crowdingScore, competitorCount);
  // LOE impact bonus: when major drugs in the indication are approaching LOE,
  // competitive openness increases — the market is about to open up.
  // Up to +3 bonus points when LOE impact score is high.
  const loeImpact = computeLoeImpactScore(indication.name);
  const loeBonus = Math.round(loeImpact.score * 3 * 10) / 10; // 0-3 bonus
  const competitiveOpenness = Math.min(baseCompetitiveOpenness + loeBonus, 25); // Cap at dimension max
  const unmetNeed = scoreUnmetNeed(
    indication.treatment_rate,
    indication.diagnosis_rate,
    indication.severity_distribution,
  );
  const devFeasibility = scoreDevelopmentFeasibility(
    indication.therapy_area,
    indication.name,
    biomarkers,
    indication.us_prevalence,
  );
  const partnerResult = scorePartnerLandscape(indication.therapy_area, indication.name, competitors);

  // Composite scoring: when custom weights are provided, normalize each
  // sub-score to 0-1 and apply weights (sum to 100). Otherwise use raw sums.
  const w = weights ?? WEIGHT_PROFILES[DEFAULT_WEIGHT_PROFILE].weights;
  const rawOpportunityScore =
    (marketAttractiveness / DIMENSION_MAX.market_attractiveness) * w.market_attractiveness +
    (competitiveOpenness / DIMENSION_MAX.competitive_openness) * w.competitive_openness +
    (unmetNeed / DIMENSION_MAX.unmet_need) * w.unmet_need +
    (devFeasibility.score / DIMENSION_MAX.development_feasibility) * w.development_feasibility +
    (partnerResult.score / DIMENSION_MAX.partner_landscape) * w.partner_landscape;

  // Confidence discount: low-confidence indications (0 competitors, sparse data)
  // get a 15% discount; medium gets 5%. Prevents low-data indications from
  // ranking above well-characterized ones.
  const confidenceLevel: DataConfidence =
    indication.data_confidence ?? (competitorCount >= 5 ? 'high' : competitorCount >= 1 ? 'medium' : 'low');
  const confidenceMultiplier = confidenceLevel === 'low' ? 0.85 : confidenceLevel === 'medium' ? 0.95 : 1.0;
  const opportunityScore = Math.round(rawOpportunityScore * confidenceMultiplier * 10) / 10;

  // ── Score explanations ──
  const severityNote = indication.severity_distribution
    ? `, severity (severe+critical) ${(
        ((indication.severity_distribution['severe'] ?? 0) +
          (indication.severity_distribution['very_severe'] ?? 0) +
          (indication.severity_distribution['critical'] ?? 0)) *
        100
      ).toFixed(0)}%`
    : '';

  const scoreExplanations: Record<string, string> = {
    market_attractiveness: `Global prevalence ${formatLargeNum(globalPrevalence)}, ${indication.cagr_5yr.toFixed(1)}% CAGR, median WAC $${formatLargeNum(medianWac)}`,
    competitive_openness:
      competitorCount === 0
        ? 'No tracked competitors (capped at 15/25 due to data uncertainty)'
        : `${competitorCount} competitors, crowding ${crowdingScore.toFixed(1)}/10 (${crowdingLabel})${loeBonus > 0 ? `, LOE bonus +${loeBonus.toFixed(1)}` : ''}`,
    ...(loeImpact.cliffCount > 0
      ? {
          loe_impact: `${loeImpact.cliffCount} patent cliff(s), $${loeImpact.totalRevenueAtRisk.toFixed(1)}B revenue at risk${loeImpact.nearestCliffYear ? `, nearest cliff ${loeImpact.nearestCliffYear}` : ''}, LOE score ${loeImpact.score.toFixed(2)}`,
        }
      : {}),
    unmet_need: `Treatment rate ${(indication.treatment_rate * 100).toFixed(0)}%, diagnosis rate ${(indication.diagnosis_rate * 100).toFixed(0)}%${severityNote}`,
    development_feasibility: `${devFeasibility.hasIndicationLoa ? 'Indication-specific' : 'Therapy-area'} LoA avg ${(devFeasibility.avgLoa * 100).toFixed(0)}%${devFeasibility.biomarkerBonus > 0 ? ', biomarker bonus +1' : ''}${devFeasibility.orphanBonus > 0 ? ', orphan drug advantage +1.5' : ''}`,
    partner_landscape: `${partnerResult.activeCount} active partners in ${indication.therapy_area}${partnerResult.indicationDealBonus > 0 ? `, ${partnerResult.indicationDealBonus} with indication deals` : ''}`,
    ...(confidenceMultiplier < 1
      ? {
          confidence_adjustment: `Score discounted ${((1 - confidenceMultiplier) * 100).toFixed(0)}% due to ${confidenceLevel} data confidence`,
        }
      : {}),
  };

  // ── Top competitors & assets ──
  const topCompanies = getTopCompanies(competitors, 3);
  const topAssets = getTopAssets(competitors, 5);

  // ── White space hints ──
  const whiteSpaceHints = computeWhiteSpaceHints(competitors, indication.diagnosis_rate, indication.treatment_rate);

  // ── Community disparities ──
  const communityData = getCommunityDataForIndication(indication.name);
  const communityDisparities: CommunityDisparity[] = communityData
    .sort((a, b) => b.prevalence_multiplier - a.prevalence_multiplier)
    .slice(0, 5)
    .map((c) => ({
      community: c.community,
      prevalence_multiplier: c.prevalence_multiplier,
      clinical_trial_representation: c.clinical_trial_representation,
      modality_gap_count: c.modality_gaps.length,
    }));

  // Add community-driven white-space hints
  const underrepresented = communityData.filter((c) => c.clinical_trial_representation === 'underrepresented');
  if (underrepresented.length > 0 && whiteSpaceHints.length < 6) {
    const communities = underrepresented.slice(0, 2).map((c) => c.community);
    whiteSpaceHints.push(
      `Underrepresented in clinical trials: ${communities.join(', ')} — community-targeted enrollment opportunity`,
    );
  }
  const highModalityGaps = communityData.filter((c) => c.modality_gaps.length >= 3);
  if (highModalityGaps.length > 0 && whiteSpaceHints.length < 7) {
    whiteSpaceHints.push(
      `${highModalityGaps.length} communit${highModalityGaps.length > 1 ? 'ies' : 'y'} with >=3 modality gaps — novel modality targeting opportunity`,
    );
  }

  // ── Emerging asset count ──
  const emergingAssetCount = competitors.filter((c) => earlyPhases.has(c.phase) && !c.partner).length;

  // ── Investor features: deal activity, catalysts, thesis ──
  const dealActivity = computeDealActivity(indication.name, indication.therapy_area);
  const catalystSignals = buildCatalystSignals(indication, loeImpact, dealActivity, competitors, crowdingScore);

  // ── Data confidence — reuse earlier computation ──
  const dataConfidence: DataConfidence = confidenceLevel;

  // ── Severity profile ──
  const severityProfile = indication.severity_distribution ?? null;

  const investmentThesis = buildInvestmentThesis(
    indication,
    opportunityScore,
    crowdingScore,
    dealActivity,
    loeImpact,
    competitorCount,
    catalystSignals,
  );

  const row: OpportunityRow = {
    indication: indication.name,
    therapy_area: indication.therapy_area,
    opportunity_score: opportunityScore,
    score_breakdown: {
      market_attractiveness: marketAttractiveness,
      competitive_openness: competitiveOpenness,
      unmet_need: unmetNeed,
      development_feasibility: devFeasibility.score,
      partner_landscape: partnerResult.score,
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
    active_partner_count: partnerResult.activeCount,
    community_disparities: communityDisparities,
    emerging_asset_count: emergingAssetCount,
    data_confidence: dataConfidence,

    // Enriched fields
    revenue_potential_label: revLabel,
    median_wac: medianWac,
    severity_profile: severityProfile,
    biomarker_count: biomarkerCount,
    key_biomarkers: keyBiomarkers,
    subtype_count: subtypeCount,
    unpartnered_fic_count: unpartneredFic,
    novel_mechanism_count: novelMechs,
    indication_loa: indicationLoaData
      ? (Object.fromEntries(Object.entries(indicationLoaData).map(([k, v]) => [k, v])) as Record<string, number>)
      : null,
    has_indication_loa: hasIndicationLoa,
    nearest_patent_cliff_year: loeImpact.nearestCliffYear,
    loe_revenue_at_risk: loeImpact.totalRevenueAtRisk,
    score_explanations: scoreExplanations,

    // Investor-focused fields
    deal_activity: dealActivity,
    catalyst_signals: catalystSignals,
    investment_thesis: investmentThesis,
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
  | 'unmet_need'
  | 'community_count'
  | 'emerging_asset_count'
  | 'median_wac'
  | 'biomarker_count'
  | 'subtype_count'
  | 'unpartnered_fic_count'
  | 'novel_mechanism_count'
  | 'revenue_potential_label'
  | 'deal_count'
  | 'catalyst_count'
  | 'avg_deal_total_m';

/**
 * Revenue potential label sort order for consistent sorting.
 */
const REVENUE_LABEL_ORDER: Record<string, number> = {
  blockbuster: 0,
  large: 1,
  mid: 2,
  niche: 3,
};

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
    case 'community_count':
      comparison = a.community_disparities.length - b.community_disparities.length;
      break;
    case 'emerging_asset_count':
      comparison = a.emerging_asset_count - b.emerging_asset_count;
      break;
    case 'median_wac':
      comparison = a.median_wac - b.median_wac;
      break;
    case 'biomarker_count':
      comparison = a.biomarker_count - b.biomarker_count;
      break;
    case 'subtype_count':
      comparison = a.subtype_count - b.subtype_count;
      break;
    case 'unpartnered_fic_count':
      comparison = a.unpartnered_fic_count - b.unpartnered_fic_count;
      break;
    case 'novel_mechanism_count':
      comparison = a.novel_mechanism_count - b.novel_mechanism_count;
      break;
    case 'revenue_potential_label':
      comparison =
        (REVENUE_LABEL_ORDER[a.revenue_potential_label] ?? 4) - (REVENUE_LABEL_ORDER[b.revenue_potential_label] ?? 4);
      break;
    case 'deal_count':
      comparison = a.deal_activity.recent_deal_count - b.deal_activity.recent_deal_count;
      break;
    case 'catalyst_count':
      comparison = a.catalyst_signals.length - b.catalyst_signals.length;
      break;
    case 'avg_deal_total_m':
      comparison = a.deal_activity.avg_deal_total_m - b.deal_activity.avg_deal_total_m;
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
 * Scores all indications, applies filters, sorts, and paginates.
 *
 * @param filters       - Optional filters to narrow results
 * @param sortBy        - Field to sort by (default: 'opportunity_score')
 * @param sortOrder     - 'asc' or 'desc' (default: 'desc')
 * @param limit         - Maximum rows per page (default: 50)
 * @param offset        - Starting index for pagination (default: 0)
 * @param weightProfile - Optional scoring weight profile key or custom weights
 *
 * @returns Paginated opportunity rows and total count after filtering.
 */
export function scoreAllIndications(
  filters?: OpportunityFilters,
  sortBy: string = 'opportunity_score',
  sortOrder: 'asc' | 'desc' = 'desc',
  limit: number = 50,
  offset: number = 0,
  weightProfile?: string | ScoringWeightProfile,
): ScreenerResult {
  // Resolve weight profile
  const weights: ScoringWeightProfile | undefined =
    typeof weightProfile === 'string' ? WEIGHT_PROFILES[weightProfile]?.weights : weightProfile;

  const scoredRows: OpportunityRow[] = [];

  for (const indication of INDICATION_DATA) {
    // Fetch competitors once and pass to both scoreIndication and passesFilters
    const competitors = getCompetitorsForIndication(indication.name);
    const { row } = scoreIndication(indication, competitors, weights);

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
 * is not found in the database. Accepts optional weight profile.
 */
export function scoreIndicationByName(
  indicationName: string,
  weightProfile?: string | ScoringWeightProfile,
): OpportunityRow | null {
  const normalized = indicationName.toLowerCase().trim();
  const match = INDICATION_DATA.find((ind) => ind.name.toLowerCase().trim() === normalized);

  if (!match) return null;

  const weights: ScoringWeightProfile | undefined =
    typeof weightProfile === 'string' ? WEIGHT_PROFILES[weightProfile]?.weights : weightProfile;

  const { row } = scoreIndication(match, undefined, weights);
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

// ────────────────────────────────────────────────────────────
// EARLY-STAGE ASSET DISCOVERY
// ────────────────────────────────────────────────────────────

/**
 * Discovers and scores early-stage (Preclinical, Phase 1, Phase 1/2)
 * unpartnered assets across the entire indication universe or filtered
 * by indication/therapy area. Returns assets ranked by a composite
 * scouting score (0-100) that weights first-in-class status, partnering
 * status, mechanism novelty, orphan designation, biomarker availability,
 * phase advancement, and competitive openness.
 *
 * Designed for BD teams scanning for in-licensing or acquisition targets.
 */
export function getEarlyStageAssets(
  indicationName?: string,
  therapyArea?: string,
  limit: number = 50,
): { assets: EarlyStageAsset[]; total: number } {
  const earlyPhaseSet = new Set(['Preclinical', 'Phase 1', 'Phase 1/2']);
  const phaseBonus: Record<string, number> = {
    Preclinical: 0,
    'Phase 1': 10,
    'Phase 1/2': 15,
    'Phase 2': 5,
  };

  const allAssets: EarlyStageAsset[] = [];

  // Filter indications if specified
  let targetIndications = INDICATION_DATA;
  if (indicationName) {
    const norm = indicationName.toLowerCase().trim();
    targetIndications = INDICATION_DATA.filter((ind) => ind.name.toLowerCase().trim() === norm);
  }
  if (therapyArea) {
    const taLower = therapyArea.toLowerCase().trim();
    targetIndications = targetIndications.filter((ind) => ind.therapy_area.toLowerCase().trim() === taLower);
  }

  for (const indication of targetIndications) {
    const competitors = getCompetitorsForIndication(indication.name);
    const { score: crowdingScore } = computeCrowdingScore(competitors);

    // Determine approved mechanisms for novelty check
    const approvedMechs = new Set(competitors.filter((c) => c.phase === 'Approved').map((c) => c.mechanism_category));

    // Biomarkers for this indication
    const biomarkers = getBiomarkersForIndication(indication.name);
    const biomarkerNames = new Set(biomarkers.map((b) => b.biomarker.toLowerCase()));

    // Filter to early-stage assets only
    const earlyAssets = competitors.filter((c) => earlyPhaseSet.has(c.phase));

    for (const asset of earlyAssets) {
      const isNovelMechanism = !approvedMechs.has(asset.mechanism_category);
      const hasBiomarker =
        asset.has_biomarker_selection || biomarkerNames.has((asset.molecular_target ?? '').toLowerCase());

      // Compute scouting score (0-100)
      let score = 0;
      const signals: string[] = [];

      if (asset.first_in_class) {
        score += 25;
        signals.push('First-in-class');
      }
      if (!asset.partner) {
        score += 20;
        signals.push('Unpartnered');
      }
      if (isNovelMechanism) {
        score += 15;
        signals.push('Novel target');
      }
      if (asset.orphan_drug) {
        score += 10;
        signals.push('Orphan drug');
      }
      if (hasBiomarker) {
        score += 10;
        signals.push('Biomarker selection');
      }
      score += phaseBonus[asset.phase] ?? 0;
      if (asset.phase !== 'Preclinical') {
        signals.push(`${asset.phase} data`);
      }
      if (crowdingScore < 4) {
        score += 5;
        signals.push('Low crowding indication');
      }

      allAssets.push({
        asset_name: asset.asset_name,
        company: asset.company,
        indication: indication.name,
        therapy_area: indication.therapy_area,
        phase: asset.phase,
        mechanism: asset.mechanism,
        mechanism_category: asset.mechanism_category,
        molecular_target: asset.molecular_target,
        is_first_in_class: asset.first_in_class,
        is_unpartnered: !asset.partner,
        is_orphan: asset.orphan_drug,
        has_biomarker: hasBiomarker,
        strengths: asset.strengths,
        scouting_score: Math.min(score, 100),
        scouting_signals: signals,
      });
    }
  }

  // Sort by scouting_score descending
  allAssets.sort((a, b) => b.scouting_score - a.scouting_score);

  const total = allAssets.length;
  const sliced = allAssets.slice(0, limit);

  return { assets: sliced, total };
}
