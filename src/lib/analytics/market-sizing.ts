// ============================================================
// TERRAIN — Pharmaceutical Market Sizing Engine
// lib/analytics/market-sizing.ts
//
// Patient funnel-based market sizing for pharmaceutical and
// biologic assets. All calculations auditable and source-attributed.
// Mirrors the multi-step pipeline in device-market-sizing.ts.
// ============================================================

import type {
  MarketSizingInput,
  MarketSizingOutput,
  PatientFunnel,
  GeographyBreakdownItem,
  PricingAnalysis,
  ComparableDrug,
  RevenueProjectionYear,
  MarketMetric,
  DataSource,
  ConfidenceLevel,
  SensitivityDriver,
  RiskAdjustment,
  IRAImpact,
  DevelopmentStage,
  CompetitiveResponseModel,
  BiosimilarErosionCurve,
  PayerMixEvolution,
  PatientDynamics,
  PatientSwitchingModel,
  BiomarkerNesting,
  BiomarkerNestingLevel,
  IntegratedRevenueYear,
  SensitivityInteraction,
  CrossEngineSignals,
  PercentileProjection,
  TreatmentLineModel,
  NonLinearCompetitiveErosion,
  GTNEvolutionYear,
  EfficacyShareModifier,
  LabelExpansionOpportunity,
  PayerTierPricing,
  PayerTierPricingEntry,
  ManufacturingConstraint,
  ManufacturingProductType,
  RegulatoryPathwayAnalysis,
  RegulatoryDesignation,
  CompetitiveMechanismAnalysis,
  MechanismRelationship,
  PatentCliffAnalysis,
  OneTimeTreatmentModel,
  PediatricAnalysis,
  DealCompsAnalysis,
  DealCompsAnalysisEntry,
  InvestmentThesis,
  InvestmentScenario,
  MarketSizingDevelopmentCost,
  DevelopmentPhaseEntry,
  DCFWaterfall,
  DCFWaterfallYear,
  DCFSensitivityPoint,
} from '@/types';

import { findIndicationByName, INDICATION_DATA } from '@/lib/data/indication-map';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { getLikelihoodOfApproval } from '@/lib/data/loa-tables';
import { BIOMARKER_DATA } from '@/lib/data/biomarker-prevalence';
import { filterDealComps } from '@/lib/data/pharma-deal-comps';

// ────────────────────────────────────────────────────────────
// STAGE-BASED PEAK MARKET SHARE RANGES
// Calibrated to historical outcomes from Ambrosia Ventures
// deal database: stage at analysis → eventual peak share.
// ────────────────────────────────────────────────────────────
const STAGE_SHARE = {
  preclinical: { low: 0.02, base: 0.05, high: 0.08 },
  phase1: { low: 0.03, base: 0.08, high: 0.12 },
  phase2: { low: 0.05, base: 0.12, high: 0.18 },
  phase3: { low: 0.08, base: 0.18, high: 0.28 },
  approved: { low: 0.12, base: 0.25, high: 0.4 },
};

// ────────────────────────────────────────────────────────────
// S-CURVE ADOPTION MODEL (Bass Diffusion)
// Replaces linear ramp with therapy-area-calibrated S-curves.
// p = innovation coefficient, q = imitation coefficient
// ────────────────────────────────────────────────────────────
const S_CURVE_PARAMS: Record<string, { p: number; q: number }> = {
  oncology: { p: 0.03, q: 0.38 }, // Fast adoption
  rare_disease: { p: 0.05, q: 0.45 }, // Faster (small population, high unmet need)
  neurology: { p: 0.02, q: 0.25 }, // Slow adoption
  cardiovascular: { p: 0.02, q: 0.28 },
  immunology: { p: 0.025, q: 0.3 },
  hematology: { p: 0.035, q: 0.4 },
  ophthalmology: { p: 0.03, q: 0.32 },
  metabolic: { p: 0.025, q: 0.3 },
  infectious_disease: { p: 0.03, q: 0.35 },
  pulmonology: { p: 0.025, q: 0.28 },
  nephrology: { p: 0.02, q: 0.25 },
  dermatology: { p: 0.03, q: 0.3 },
  pain_management: { p: 0.015, q: 0.2 }, // Slow: payer resistance, prior auth, opioid scrutiny
  psychiatry: { p: 0.02, q: 0.22 }, // Slow: stigma, titration requirements, treatment compliance
  gastroenterology: { p: 0.025, q: 0.3 }, // Moderate: step therapy, TNF-first protocols
  hepatology: { p: 0.02, q: 0.25 }, // Moderate-slow: specialist-driven, liver monitoring
  endocrinology: { p: 0.03, q: 0.35 }, // Moderate-fast: clear biomarker endpoints (HbA1c, TSH)
  musculoskeletal: { p: 0.02, q: 0.28 }, // Moderate-slow: conservative management first
};
const DEFAULT_S_CURVE = { p: 0.025, q: 0.32 };

// LOE decline factors for years 8-10 post-launch
const LOE_DECLINE = [0.95, 0.82, 0.65];

// ────────────────────────────────────────────────────────────
// COMPETITIVE POSITION CONTEXT (Enhancement 5)
// Adjusts Bass diffusion S-curve based on competitive dynamics
// ────────────────────────────────────────────────────────────
interface CompetitivePositionContext {
  crowding_score?: number; // 1-10
  is_first_in_class?: boolean; // mechanism differentiation
  new_entrants_before_peak?: number; // expected competitors entering before peak
}

function buildSCurveRamp(
  therapyArea: string,
  years: number = 10,
  competitiveContext?: CompetitivePositionContext,
): number[] {
  const baseParams = S_CURVE_PARAMS[therapyArea] ?? DEFAULT_S_CURVE;
  let { p, q } = baseParams;

  // Enhancement 5: Dynamic S-curve by competitive position
  if (competitiveContext) {
    // If very crowded (crowding_score > 7), reduce q by 20% (slower imitation)
    if (competitiveContext.crowding_score !== undefined && competitiveContext.crowding_score > 7) {
      q = q * 0.8;
    }

    // If first-in-class, increase p by 30% (faster innovation adoption)
    if (competitiveContext.is_first_in_class) {
      p = p * 1.3;
    }
  }

  // Bass diffusion: F(t) = [1 - e^(-(p+q)*t)] / [1 + (q/p)*e^(-(p+q)*t)]
  const raw: number[] = [];
  for (let t = 1; t <= years; t++) {
    const exp = Math.exp(-(p + q) * t);
    const ft = (1 - exp) / (1 + (q / p) * exp);
    raw.push(ft);
  }

  // Normalize so peak = 1.0
  const peak = Math.max(...raw);
  const normalized = raw.map((v) => v / peak);

  // Enhancement 5: If >3 new entrants before peak, flatten curve
  if (competitiveContext?.new_entrants_before_peak !== undefined && competitiveContext.new_entrants_before_peak > 3) {
    // Reduce peak by 15%
    const peakReduction = 0.85;
    // Extend time-to-peak by 1 year (shift curve right)
    for (let i = normalized.length - 1; i >= 1; i--) {
      // Blend current value with previous year's value to slow the ramp
      normalized[i] = normalized[i] * peakReduction;
    }
    normalized[0] = normalized[0] * peakReduction * 0.85; // Year 1 also dampened
  }

  // Apply LOE decline for final years
  for (let i = 0; i < LOE_DECLINE.length && years - LOE_DECLINE.length + i >= 0; i++) {
    const yearIdx = years - LOE_DECLINE.length + i;
    normalized[yearIdx] = Math.min(normalized[yearIdx], normalized[yearIdx] * LOE_DECLINE[i]);
  }

  return normalized;
}

// Fallback for backward compatibility
const PHARMA_REVENUE_RAMP = [0.05, 0.15, 0.35, 0.6, 0.85, 1.0, 1.0, 0.95, 0.85, 0.7];

// ────────────────────────────────────────────────────────────
// COMPETITION-ADJUSTED MARKET SHARE
// Each competitor beyond 3 reduces peak share by 5% (multiplicative)
// Capped at 40% total reduction
// ────────────────────────────────────────────────────────────

function adjustShareForCompetition(
  shareRange: { low: number; base: number; high: number },
  competitorCount: number,
): { low: number; base: number; high: number } {
  const excessCompetitors = Math.max(0, competitorCount - 3);
  if (excessCompetitors === 0) return shareRange;

  // Each excess competitor reduces share by 5% multiplicative, capped at 40%
  const reductionFactor = Math.max(0.6, Math.pow(0.95, excessCompetitors));

  return {
    low: shareRange.low * reductionFactor,
    base: shareRange.base * reductionFactor,
    high: shareRange.high * reductionFactor,
  };
}

// ────────────────────────────────────────────────────────────
// IRA IMPACT MODELING
// Inflation Reduction Act mandatory Medicare negotiation
// ────────────────────────────────────────────────────────────

const IRA_PARAMS = {
  small_molecule_negotiation_year: 9, // Years post-launch
  biologic_negotiation_year: 13,
  medicare_revenue_share: 0.35, // ~35% of US revenue is Medicare
  price_reduction_range: { low: 0.25, base: 0.4, high: 0.6 },
};

function computeIRAImpact(
  launchYear: number,
  revenueProjection: RevenueProjectionYear[],
  productType: 'small_molecule' | 'biologic' = 'small_molecule',
): IRAImpact | undefined {
  const negotiationYear =
    productType === 'biologic' ? IRA_PARAMS.biologic_negotiation_year : IRA_PARAMS.small_molecule_negotiation_year;

  const negotiationCalendarYear = launchYear + negotiationYear;

  // Only applies if negotiation year falls within projection window
  const affectedYears = revenueProjection.filter((yr) => yr.year >= negotiationCalendarYear).map((yr) => yr.year);

  if (affectedYears.length === 0) return undefined;

  // Estimate annual impact at base scenario
  const affectedRevenue = revenueProjection
    .filter((yr) => yr.year >= negotiationCalendarYear)
    .reduce((sum, yr) => sum + yr.base, 0);

  const annualImpact =
    (affectedRevenue * IRA_PARAMS.medicare_revenue_share * IRA_PARAMS.price_reduction_range.base) /
    affectedYears.length;

  return {
    product_type: productType,
    negotiation_year: negotiationCalendarYear,
    affected_years: affectedYears,
    medicare_revenue_share: IRA_PARAMS.medicare_revenue_share,
    price_reduction_pct: IRA_PARAMS.price_reduction_range.base,
    annual_revenue_impact_m: Math.round(annualImpact),
  };
}

function applyIRAToProjection(projection: RevenueProjectionYear[], iraImpact: IRAImpact): RevenueProjectionYear[] {
  return projection.map((yr) => {
    if (yr.year >= iraImpact.negotiation_year) {
      const reduction = iraImpact.medicare_revenue_share * iraImpact.price_reduction_pct;
      return {
        ...yr,
        bear: Math.round(yr.bear * (1 - reduction)),
        base: Math.round(yr.base * (1 - reduction)),
        bull: Math.round(yr.bull * (1 - reduction)),
        ira_adjusted: true,
      };
    }
    return yr;
  });
}

// ────────────────────────────────────────────────────────────
// SENSITIVITY ANALYSIS (Tornado Data)
// Tests 5 variables ±25-30% to show SOM sensitivity
// ────────────────────────────────────────────────────────────

function buildSensitivityAnalysis(
  baseSomM: number,
  shareRange: { low: number; base: number; high: number },
  netPrice: number,
  addressablePts: number,
  addressabilityFactor: number,
  diagnosisRate: number,
  grossToNet: number,
): SensitivityDriver[] {
  const drivers: SensitivityDriver[] = [];

  // 1. Market Share: ±30%
  const shareLow = baseSomM * 0.7;
  const shareHigh = baseSomM * 1.3;
  drivers.push({
    variable: 'Market Share',
    low_som_m: Math.round(shareLow),
    high_som_m: Math.round(shareHigh),
    base_som_m: Math.round(baseSomM),
    swing_pct: 30,
  });

  // 2. Drug Pricing: ±25%
  const priceFactor = (addressablePts * shareRange.base) / 1e6; // patients × share, in millions
  const priceLow = priceFactor * (netPrice * 0.75);
  const priceHigh = priceFactor * (netPrice * 1.25);
  drivers.push({
    variable: 'Drug Pricing',
    low_som_m: Math.round(priceLow),
    high_som_m: Math.round(priceHigh),
    base_som_m: Math.round(baseSomM),
    swing_pct: 25,
  });

  // 3. Addressability: ±30%
  const _addrLowPts = Math.round(((addressablePts * 0.7) / addressabilityFactor) * addressabilityFactor * 0.7);
  const _addrHighPts = Math.round(((addressablePts * 1.3) / addressabilityFactor) * addressabilityFactor * 1.3);
  drivers.push({
    variable: 'Addressable Population',
    low_som_m: Math.round(baseSomM * 0.7),
    high_som_m: Math.round(baseSomM * 1.3),
    base_som_m: Math.round(baseSomM),
    swing_pct: 30,
  });

  // 4. Diagnosis Rate: ±25%
  const diagLow = baseSomM * (1 - 0.25 * diagnosisRate);
  const diagHigh = baseSomM * (1 + 0.25 * (1 - diagnosisRate));
  drivers.push({
    variable: 'Diagnosis Rate',
    low_som_m: Math.round(diagLow),
    high_som_m: Math.round(diagHigh),
    base_som_m: Math.round(baseSomM),
    swing_pct: 25,
  });

  // 5. Gross-to-Net: ±25% (inverse — higher GTN = lower revenue)
  const gtnLow = baseSomM * (1 + grossToNet * 0.25); // Lower GTN = more revenue
  const gtnHigh = baseSomM * (1 - grossToNet * 0.25); // Higher GTN = less revenue
  drivers.push({
    variable: 'Gross-to-Net Discount',
    low_som_m: Math.round(Math.min(gtnLow, gtnHigh)),
    high_som_m: Math.round(Math.max(gtnLow, gtnHigh)),
    base_som_m: Math.round(baseSomM),
    swing_pct: 25,
  });

  // Sort by absolute swing magnitude (largest first)
  drivers.sort((a, b) => {
    const swingA = a.high_som_m - a.low_som_m;
    const swingB = b.high_som_m - b.low_som_m;
    return swingB - swingA;
  });

  return drivers;
}

// ────────────────────────────────────────────────────────────
// DYNAMIC COMPETITIVE RESPONSE MODEL
// Models price erosion as new competitors enter the market.
// Each new entrant beyond the first triggers 5-15% price drop
// and share redistribution. Based on IQVIA competitive dynamics.
// ────────────────────────────────────────────────────────────

const COMPETITIVE_ENTRY_SCHEDULE: Record<string, number[]> = {
  // Expected new entrants per year post-launch (10 years), by crowding level
  low: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  moderate: [0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
  high: [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  very_high: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
};

function buildCompetitiveResponse(
  baseProjection: RevenueProjectionYear[],
  competitorCount: number,
  therapyArea: string,
): CompetitiveResponseModel[] {
  // Determine crowding level
  let level: string;
  if (competitorCount <= 3) level = 'low';
  else if (competitorCount <= 6) level = 'moderate';
  else if (competitorCount <= 10) level = 'high';
  else level = 'very_high';

  const schedule = COMPETITIVE_ENTRY_SCHEDULE[level];
  const priceErosionPerEntrant = therapyArea === 'oncology' ? 0.05 : therapyArea === 'rare_disease' ? 0.03 : 0.08;
  const shareErosionPerEntrant = 0.04;

  let cumulativePriceErosion = 0;
  let cumulativeShareErosion = 0;
  let cumulativeEntrants = 0;

  return baseProjection.map((yr, i) => {
    const newEntrants = schedule[i] ?? 0;
    cumulativeEntrants += newEntrants;
    cumulativePriceErosion = Math.min(0.4, cumulativeEntrants * priceErosionPerEntrant);
    cumulativeShareErosion = Math.min(0.3, cumulativeEntrants * shareErosionPerEntrant);
    const totalErosion = 1 - cumulativePriceErosion - cumulativeShareErosion;
    const adjustedRevenue = Math.round(yr.base * Math.max(0.4, totalErosion));

    return {
      year: yr.year,
      new_entrants_expected: newEntrants,
      price_erosion_pct: Math.round(cumulativePriceErosion * 100),
      share_erosion_pct: Math.round(cumulativeShareErosion * 100),
      adjusted_revenue_m: adjustedRevenue,
    };
  });
}

// ────────────────────────────────────────────────────────────
// BIOSIMILAR / LOE EROSION CURVES
// Models post-LOE revenue decline. Biologics lose 60-80% share
// within 2-3 years; small molecules lose 80-95% within 1-2 years.
// Source: IQVIA Biosimilar Council reports, Amundsen Consulting
// ────────────────────────────────────────────────────────────

function buildBiosimilarErosionCurve(
  productType: 'small_molecule' | 'biologic',
  hasOrphanDesignation: boolean,
): BiosimilarErosionCurve {
  if (hasOrphanDesignation) {
    // Orphan drugs: protected by 7-year exclusivity, slower erosion
    return {
      years_post_loe: [0, 1, 2, 3, 4, 5],
      share_retained_pct: [100, 92, 78, 65, 55, 48],
      product_type: productType,
      erosion_model: 'protected',
      narrative:
        'Orphan drug exclusivity provides 7-year protection. Post-LOE erosion is gradual due to limited generic/biosimilar interest in small patient populations and complex manufacturing for biologics.',
    };
  }

  if (productType === 'biologic') {
    return {
      years_post_loe: [0, 1, 2, 3, 4, 5],
      share_retained_pct: [100, 82, 55, 38, 28, 22],
      product_type: 'biologic',
      erosion_model: 'gradual',
      narrative:
        'Biologic LOE erosion follows a gradual curve. Biosimilar uptake is slower than generic small molecules due to physician switching hesitancy, interchangeability requirements, and rebate dynamics. Expect 60-80% share loss within 3 years of first biosimilar entry.',
    };
  }

  // Small molecule
  return {
    years_post_loe: [0, 1, 2, 3, 4, 5],
    share_retained_pct: [100, 40, 18, 10, 8, 5],
    product_type: 'small_molecule',
    erosion_model: 'rapid',
    narrative:
      'Small molecule generics erode branded share rapidly. Paragraph IV challenges may enable day-1 generic entry. Expect 80-95% share loss within 2 years. Authorized generics provide partial mitigation.',
  };
}

// ────────────────────────────────────────────────────────────
// PAYER MIX EVOLUTION + MANAGED ENTRY AGREEMENTS (MEA)
// Models how payer mix shifts over product lifecycle and
// impacts blended net pricing. Medicare share increases as
// patient population ages; MEAs reduce effective pricing.
// ────────────────────────────────────────────────────────────

const PAYER_MIX_PROFILES: Record<
  string,
  {
    yr1_commercial: number;
    yr1_medicare: number;
    yr1_medicaid: number;
    yr1_va: number;
    yr10_commercial: number;
    yr10_medicare: number;
    yr10_medicaid: number;
    yr10_va: number;
    mea_penetration_yr5: number;
    mea_discount: number;
  }
> = {
  oncology: {
    yr1_commercial: 0.45,
    yr1_medicare: 0.4,
    yr1_medicaid: 0.1,
    yr1_va: 0.05,
    yr10_commercial: 0.35,
    yr10_medicare: 0.48,
    yr10_medicaid: 0.12,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.15,
    mea_discount: 0.1,
  },
  rare_disease: {
    yr1_commercial: 0.55,
    yr1_medicare: 0.2,
    yr1_medicaid: 0.2,
    yr1_va: 0.05,
    yr10_commercial: 0.48,
    yr10_medicare: 0.28,
    yr10_medicaid: 0.18,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.25,
    mea_discount: 0.15,
  },
  neurology: {
    yr1_commercial: 0.4,
    yr1_medicare: 0.42,
    yr1_medicaid: 0.12,
    yr1_va: 0.06,
    yr10_commercial: 0.3,
    yr10_medicare: 0.52,
    yr10_medicaid: 0.12,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  immunology: {
    yr1_commercial: 0.55,
    yr1_medicare: 0.25,
    yr1_medicaid: 0.15,
    yr1_va: 0.05,
    yr10_commercial: 0.45,
    yr10_medicare: 0.32,
    yr10_medicaid: 0.18,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.3,
    mea_discount: 0.18,
  },
  cardiovascular: {
    yr1_commercial: 0.35,
    yr1_medicare: 0.48,
    yr1_medicaid: 0.12,
    yr1_va: 0.05,
    yr10_commercial: 0.25,
    yr10_medicare: 0.56,
    yr10_medicaid: 0.14,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  metabolic: {
    yr1_commercial: 0.5,
    yr1_medicare: 0.3,
    yr1_medicaid: 0.15,
    yr1_va: 0.05,
    yr10_commercial: 0.4,
    yr10_medicare: 0.38,
    yr10_medicaid: 0.17,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.25,
    mea_discount: 0.15,
  },
  psychiatry: {
    yr1_commercial: 0.35,
    yr1_medicare: 0.2,
    yr1_medicaid: 0.38,
    yr1_va: 0.07,
    yr10_commercial: 0.3,
    yr10_medicare: 0.25,
    yr10_medicaid: 0.38,
    yr10_va: 0.07,
    mea_penetration_yr5: 0.15,
    mea_discount: 0.1,
  },
  pain_management: {
    yr1_commercial: 0.5,
    yr1_medicare: 0.3,
    yr1_medicaid: 0.14,
    yr1_va: 0.06,
    yr10_commercial: 0.4,
    yr10_medicare: 0.38,
    yr10_medicaid: 0.16,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  hematology: {
    yr1_commercial: 0.5,
    yr1_medicare: 0.25,
    yr1_medicaid: 0.2,
    yr1_va: 0.05,
    yr10_commercial: 0.42,
    yr10_medicare: 0.32,
    yr10_medicaid: 0.2,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  ophthalmology: {
    yr1_commercial: 0.3,
    yr1_medicare: 0.55,
    yr1_medicaid: 0.1,
    yr1_va: 0.05,
    yr10_commercial: 0.22,
    yr10_medicare: 0.62,
    yr10_medicaid: 0.11,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.15,
    mea_discount: 0.1,
  },
  pulmonology: {
    yr1_commercial: 0.45,
    yr1_medicare: 0.38,
    yr1_medicaid: 0.12,
    yr1_va: 0.05,
    yr10_commercial: 0.35,
    yr10_medicare: 0.48,
    yr10_medicaid: 0.12,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.22,
    mea_discount: 0.14,
  },
  nephrology: {
    yr1_commercial: 0.3,
    yr1_medicare: 0.52,
    yr1_medicaid: 0.12,
    yr1_va: 0.06,
    yr10_commercial: 0.22,
    yr10_medicare: 0.6,
    yr10_medicaid: 0.12,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.18,
    mea_discount: 0.12,
  },
  dermatology: {
    yr1_commercial: 0.6,
    yr1_medicare: 0.22,
    yr1_medicaid: 0.13,
    yr1_va: 0.05,
    yr10_commercial: 0.52,
    yr10_medicare: 0.28,
    yr10_medicaid: 0.15,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.28,
    mea_discount: 0.16,
  },
  gastroenterology: {
    yr1_commercial: 0.52,
    yr1_medicare: 0.28,
    yr1_medicaid: 0.15,
    yr1_va: 0.05,
    yr10_commercial: 0.42,
    yr10_medicare: 0.35,
    yr10_medicaid: 0.18,
    yr10_va: 0.05,
    mea_penetration_yr5: 0.25,
    mea_discount: 0.15,
  },
  hepatology: {
    yr1_commercial: 0.48,
    yr1_medicare: 0.3,
    yr1_medicaid: 0.16,
    yr1_va: 0.06,
    yr10_commercial: 0.38,
    yr10_medicare: 0.38,
    yr10_medicaid: 0.18,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  endocrinology: {
    yr1_commercial: 0.48,
    yr1_medicare: 0.32,
    yr1_medicaid: 0.14,
    yr1_va: 0.06,
    yr10_commercial: 0.38,
    yr10_medicare: 0.42,
    yr10_medicaid: 0.14,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.22,
    mea_discount: 0.14,
  },
  musculoskeletal: {
    yr1_commercial: 0.42,
    yr1_medicare: 0.4,
    yr1_medicaid: 0.12,
    yr1_va: 0.06,
    yr10_commercial: 0.32,
    yr10_medicare: 0.5,
    yr10_medicaid: 0.12,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.2,
    mea_discount: 0.12,
  },
  infectious_disease: {
    yr1_commercial: 0.4,
    yr1_medicare: 0.3,
    yr1_medicaid: 0.22,
    yr1_va: 0.08,
    yr10_commercial: 0.35,
    yr10_medicare: 0.35,
    yr10_medicaid: 0.22,
    yr10_va: 0.08,
    mea_penetration_yr5: 0.15,
    mea_discount: 0.1,
  },
  default: {
    yr1_commercial: 0.45,
    yr1_medicare: 0.35,
    yr1_medicaid: 0.14,
    yr1_va: 0.06,
    yr10_commercial: 0.38,
    yr10_medicare: 0.42,
    yr10_medicaid: 0.14,
    yr10_va: 0.06,
    mea_penetration_yr5: 0.18,
    mea_discount: 0.12,
  },
};

// Net price multipliers by payer type (vs. commercial = 1.0)
const PAYER_NET_PRICE_FACTOR = {
  commercial: 1.0,
  medicare: 0.78, // ASP+6% for Part B, Part D negotiation
  medicaid: 0.55, // Best price requirement
  va_dod: 0.52, // FSS pricing
};

function buildPayerMixEvolution(launchYear: number, therapyArea: string, years: number = 10): PayerMixEvolution[] {
  const profile = PAYER_MIX_PROFILES[therapyArea.toLowerCase()] ?? PAYER_MIX_PROFILES.default;

  return Array.from({ length: years }, (_, i) => {
    const t = years <= 1 ? 0 : i / (years - 1); // 0 to 1 interpolation

    const commercial = profile.yr1_commercial + (profile.yr10_commercial - profile.yr1_commercial) * t;
    const medicare = profile.yr1_medicare + (profile.yr10_medicare - profile.yr1_medicare) * t;
    const medicaid = profile.yr1_medicaid + (profile.yr10_medicaid - profile.yr1_medicaid) * t;
    const va = profile.yr1_va + (profile.yr10_va - profile.yr1_va) * t;

    // MEA impact ramps up linearly to target by year 5, then plateaus
    const meaPenetration = Math.min(profile.mea_penetration_yr5, profile.mea_penetration_yr5 * (i / 5));
    const meaImpact = meaPenetration * profile.mea_discount;

    // Blended net price factor
    const blended =
      (commercial * PAYER_NET_PRICE_FACTOR.commercial +
        medicare * PAYER_NET_PRICE_FACTOR.medicare +
        medicaid * PAYER_NET_PRICE_FACTOR.medicaid +
        va * PAYER_NET_PRICE_FACTOR.va_dod) *
      (1 - meaImpact);

    return {
      year: launchYear + i,
      commercial_pct: Math.round(commercial * 100),
      medicare_pct: Math.round(medicare * 100),
      medicaid_pct: Math.round(medicaid * 100),
      va_dod_pct: Math.round(va * 100),
      blended_net_price_factor: parseFloat(blended.toFixed(3)),
      mea_impact_pct: parseFloat((meaImpact * 100).toFixed(1)),
    };
  });
}

// ────────────────────────────────────────────────────────────
// PATIENT SWITCHING MODELS
// Models whether new entrants capture share from incumbents
// (cannibalistic) or expand the treated population (additive).
// ────────────────────────────────────────────────────────────

function buildPatientDynamics(
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  mechanism?: string,
): PatientDynamics {
  const competitors = indication.major_competitors;
  const therapyArea = indication.therapy_area.toLowerCase();
  const switchingSources: PatientSwitchingModel[] = [];

  // Determine if market is additive or cannibalistic based on therapy area characteristics
  const isHighUnmetNeed = indication.treatment_rate < 0.5;
  const isNewMechanism =
    mechanism && !competitors.some((c) => c.toLowerCase().includes(mechanism.toLowerCase().split(' ')[0]));

  let totalAdditive = 0;
  let totalCannibalistic = 0;

  if (isHighUnmetNeed) {
    // Low treatment rate = lots of untreated patients = more additive share
    totalAdditive = 60;
    totalCannibalistic = 40;
    switchingSources.push({
      competitor: 'Untreated patient pool',
      share_source: 'additive',
      share_captured_pct: 60,
      rationale: `Low treatment rate (${(indication.treatment_rate * 100).toFixed(0)}%) — majority of share comes from expanding treated population rather than displacing incumbents.`,
    });
  } else if (isNewMechanism) {
    // Novel mechanism has moderate additive potential
    totalAdditive = 40;
    totalCannibalistic = 60;
    switchingSources.push({
      competitor: 'Treatment-experienced patients',
      share_source: 'cannibalistic',
      share_captured_pct: 35,
      rationale:
        'Novel mechanism attracts patients failing current standard of care. Significant switching from existing therapies expected.',
    });
    switchingSources.push({
      competitor: 'Previously untreated patients',
      share_source: 'additive',
      share_captured_pct: 25,
      rationale: 'Novel mechanism may draw patients previously ineligible or unwilling to use existing treatments.',
    });
  } else {
    // Same mechanism in established market = mostly cannibalistic
    totalAdditive = 20;
    totalCannibalistic = 80;
  }

  // Add top competitors as specific switching sources
  const topCompetitors = competitors.slice(0, 3);
  for (const comp of topCompetitors) {
    const isSameMech = mechanism && comp.toLowerCase().includes(mechanism.toLowerCase().split(' ')[0]);
    switchingSources.push({
      competitor: comp,
      share_source: isSameMech ? 'cannibalistic' : 'mixed',
      share_captured_pct: Math.round((isSameMech ? 15 : 8) / Math.max(1, topCompetitors.length)),
      rationale: isSameMech
        ? `Direct competitor with same mechanism — head-to-head switching driven by efficacy/safety differentiation.`
        : `Different mechanism — switching limited to patients failing or intolerant of ${comp}.`,
    });
  }

  const netExpansion = therapyArea === 'rare_disease' ? 15 : isHighUnmetNeed ? 12 : isNewMechanism ? 8 : 3;

  const narrative =
    totalAdditive >= 50
      ? `This market has significant untreated patient potential (treatment rate: ${(indication.treatment_rate * 100).toFixed(0)}%). New entrants primarily expand the treated population rather than cannibalize incumbents. Net market expansion estimated at ${netExpansion}%.`
      : `Established treatment paradigm with high treatment penetration (${(indication.treatment_rate * 100).toFixed(0)}%). New entrants primarily displace existing therapies. ${isNewMechanism ? 'Novel mechanism may attract some previously untreated patients.' : 'Same-mechanism competition is predominantly cannibalistic.'} Net market expansion estimated at ${netExpansion}%.`;

  return {
    total_share_additive_pct: totalAdditive,
    total_share_cannibalistic_pct: totalCannibalistic,
    net_market_expansion_pct: netExpansion,
    switching_sources: switchingSources,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// BIOMARKER PREVALENCE — UNIFIED LOOKUP
// Primary source: BIOMARKER_DATA from biomarker-prevalence.ts
// Fallback: hardcoded map below for legacy indication/biomarker combos
// ────────────────────────────────────────────────────────────

/**
 * Search the canonical BIOMARKER_DATA array for a matching indication and
 * optional biomarker keyword.  Returns prevalence_pct / 100 (i.e. as a
 * decimal fraction) to match the shape expected by the sizing engine.
 */
function getBiomarkerPrevalence(indication: string, biomarkerKeyword?: string): number | undefined {
  const indLower = indication.toLowerCase();
  const bmLower = biomarkerKeyword?.toLowerCase();

  for (const entry of BIOMARKER_DATA) {
    const indicationMatch = entry.indications.some((ind) => {
      const l = ind.toLowerCase();
      return l.includes(indLower) || indLower.includes(l);
    });
    if (!indicationMatch) continue;

    if (!bmLower) {
      // No biomarker keyword — return first indication match
      return entry.prevalence_pct / 100;
    }

    // Check if biomarker name or cdx_drugs contain the keyword
    const biomarkerLower = entry.biomarker.toLowerCase();
    if (biomarkerLower.includes(bmLower) || bmLower.split(/[\s_-]+/).every((tok) => biomarkerLower.includes(tok))) {
      return entry.prevalence_pct / 100;
    }
  }

  return undefined;
}

const BIOMARKER_PREVALENCE_FALLBACK: Record<string, Record<string, number>> = {
  'non-small cell lung cancer': {
    egfr: 0.15,
    kras_g12c: 0.13,
    alk: 0.05,
    ros1: 0.02,
    braf_v600e: 0.02,
    ret: 0.02,
    met_ex14: 0.03,
    ntrk: 0.01,
    her2: 0.03,
    'pd-l1_high': 0.3,
  },
  nsclc: {
    egfr: 0.15,
    kras_g12c: 0.13,
    alk: 0.05,
    ros1: 0.02,
    braf_v600e: 0.02,
    ret: 0.02,
    met_ex14: 0.03,
    ntrk: 0.01,
    her2: 0.03,
    'pd-l1_high': 0.3,
  },
  'breast cancer': {
    her2: 0.2,
    triple_negative: 0.15,
    hr_positive: 0.7,
    brca: 0.05,
    pik3ca: 0.4,
  },
  'colorectal cancer': {
    kras: 0.45,
    braf_v600e: 0.08,
    msi_h: 0.15,
    her2: 0.03,
    ntrk: 0.01,
  },
  melanoma: {
    braf_v600: 0.5,
    nras: 0.25,
    'pd-l1_high': 0.4,
  },
  'gastric cancer': {
    her2: 0.2,
    'pd-l1_high': 0.35,
    msi_h: 0.05,
  },
  'bladder cancer': {
    fgfr: 0.2,
    'pd-l1_high': 0.3,
  },
  'hepatocellular carcinoma': {
    'pd-l1_high': 0.25,
  },
  'ovarian cancer': {
    brca: 0.2,
    hrd: 0.5,
  },
  'prostate cancer': {
    brca: 0.12,
    hrd: 0.25,
  },
};

// ────────────────────────────────────────────────────────────
// GROSS-TO-NET BY THERAPY AREA (decimal)
// Net price = WAC × (1 - discount)
// ────────────────────────────────────────────────────────────
const GROSS_TO_NET: Record<string, number> = {
  oncology: 0.18,
  immunology: 0.45,
  neurology: 0.25,
  cardiovascular: 0.55,
  metabolic: 0.6,
  rare_disease: 0.12,
  infectious_disease: 0.35,
  ophthalmology: 0.2,
  hematology: 0.22,
  pulmonology: 0.4,
  nephrology: 0.3,
  dermatology: 0.45,
  pain_management: 0.55,
  psychiatry: 0.5,
  gastroenterology: 0.4,
  hepatology: 0.35,
  endocrinology: 0.45,
  musculoskeletal: 0.5,
};
const DEFAULT_GTN = 0.3;

// ────────────────────────────────────────────────────────────
// DEFAULT WAC FALLBACKS (when no comparables found)
// ────────────────────────────────────────────────────────────
const DEFAULT_WAC: Record<string, number> = {
  oncology: 180000,
  rare_disease: 400000,
  neurology: 65000,
  immunology: 50000,
  cardiovascular: 35000,
  metabolic: 28000,
  hematology: 200000,
  ophthalmology: 80000,
  infectious_disease: 45000,
  pulmonology: 40000,
  nephrology: 50000,
  pain_management: 15000,
  psychiatry: 22000,
  gastroenterology: 45000,
  hepatology: 55000,
  endocrinology: 30000,
  musculoskeletal: 28000,
  dermatology: 38000,
};
const DEFAULT_WAC_FALLBACK = 80000;

// ────────────────────────────────────────────────────────────
// ENHANCEMENT 5: COMPETITIVE POSITION CONTEXT BUILDER
// Builds competitive position context for S-curve adjustment
// ────────────────────────────────────────────────────────────

function buildCompetitivePositionContext(
  crowdingScore: number,
  mechanism: string | undefined,
  competitorCount: number,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
): CompetitivePositionContext {
  const mechLower = (mechanism ?? '').toLowerCase();

  // Check if first-in-class: mechanism doesn't overlap with any known competitor
  const isFirstInClass =
    mechLower.length > 0 &&
    (mechLower.includes('first') ||
      !indication.major_competitors.some((c) => {
        const cLower = c.toLowerCase();
        const mechTokens = mechLower.split(/[\s_-]+/);
        return mechTokens.some((tok) => tok.length > 3 && cLower.includes(tok));
      }));

  // Estimate new entrants before peak (~year 5)
  let newEntrantsBeforePeak = 0;
  if (competitorCount <= 3) newEntrantsBeforePeak = 1;
  else if (competitorCount <= 6) newEntrantsBeforePeak = 3;
  else if (competitorCount <= 10) newEntrantsBeforePeak = 5;
  else newEntrantsBeforePeak = 7;

  return {
    crowding_score: crowdingScore,
    is_first_in_class: isFirstInClass,
    new_entrants_before_peak: newEntrantsBeforePeak,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT 6: LABEL EXPANSION MODELING
// Models additional indications that expand addressable market
// ────────────────────────────────────────────────────────────

function buildLabelExpansionOpportunities(
  primaryIndication: NonNullable<ReturnType<typeof findIndicationByName>>,
  launchYear: number,
  netPrice: number,
  shareRange: { low: number; base: number; high: number },
): LabelExpansionOpportunity[] {
  const therapyArea = primaryIndication.therapy_area.toLowerCase();

  // Find related indications in the same therapy area
  const relatedIndications = INDICATION_DATA.filter(
    (ind) => ind.therapy_area.toLowerCase() === therapyArea && ind.name !== primaryIndication.name,
  );

  if (relatedIndications.length === 0) return [];

  // Sort by prevalence to find the most commercially attractive expansions
  const sorted = [...relatedIndications].sort((a, b) => b.us_prevalence - a.us_prevalence);

  // Take top 2 expansion opportunities
  const topExpansions = sorted.slice(0, 2);

  return topExpansions.map((expansion, i) => {
    // Expansion population is 30-50% of primary addressable
    const expansionFactor = i === 0 ? 0.45 : 0.3;
    const additionalPatients = Math.round(
      expansion.us_prevalence * expansion.diagnosis_rate * expansion.treatment_rate * expansionFactor,
    );

    // Expected approval timing: Year 3-5 post-primary
    const approvalYear = launchYear + 3 + i;

    // Revenue contribution: patients * share * net price
    const incrementalRevenue = Math.round((additionalPatients * shareRange.base * netPrice) / 1e6);

    // Probability decreases for later expansions
    const probability = i === 0 ? 0.55 : 0.35;

    return {
      indication: expansion.name,
      therapy_area: expansion.therapy_area,
      additional_addressable_patients: additionalPatients,
      expected_approval_year: approvalYear,
      incremental_peak_revenue_m: incrementalRevenue,
      probability,
      rationale:
        `${expansion.name} shares ${therapyArea} therapeutic overlap with ${primaryIndication.name}. ` +
        `Estimated ${additionalPatients.toLocaleString()} additional addressable patients ` +
        `(${(expansionFactor * 100).toFixed(0)}% of ${expansion.name} treated population). ` +
        `Label expansion expected ~Year ${approvalYear - launchYear} post-primary approval.`,
    };
  });
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT 7: MULTI-DIMENSIONAL PAYER-TIER PRICING
// Payer-specific rebate tiers replacing single GTN
// ────────────────────────────────────────────────────────────

const PAYER_TIER_REBATES: Record<
  string,
  { commercial: number; medicare_b: number; medicare_d: number; medicaid: number; three40b: number }
> = {
  oncology: { commercial: 0.18, medicare_b: 0.22, medicare_d: 0.3, medicaid: 0.5, three40b: 0.4 },
  rare_disease: { commercial: 0.1, medicare_b: 0.22, medicare_d: 0.28, medicaid: 0.5, three40b: 0.42 },
  neurology: { commercial: 0.25, medicare_b: 0.22, medicare_d: 0.35, medicaid: 0.55, three40b: 0.45 },
  immunology: { commercial: 0.4, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.58, three40b: 0.48 },
  cardiovascular: { commercial: 0.5, medicare_b: 0.22, medicare_d: 0.4, medicaid: 0.6, three40b: 0.5 },
  metabolic: { commercial: 0.55, medicare_b: 0.22, medicare_d: 0.4, medicaid: 0.6, three40b: 0.5 },
  hematology: { commercial: 0.2, medicare_b: 0.22, medicare_d: 0.32, medicaid: 0.52, three40b: 0.42 },
  ophthalmology: { commercial: 0.2, medicare_b: 0.22, medicare_d: 0.3, medicaid: 0.5, three40b: 0.4 },
  infectious_disease: { commercial: 0.3, medicare_b: 0.22, medicare_d: 0.35, medicaid: 0.55, three40b: 0.45 },
  pulmonology: { commercial: 0.38, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.55, three40b: 0.45 },
  nephrology: { commercial: 0.28, medicare_b: 0.22, medicare_d: 0.35, medicaid: 0.55, three40b: 0.45 },
  dermatology: { commercial: 0.42, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.58, three40b: 0.48 },
  pain_management: { commercial: 0.5, medicare_b: 0.22, medicare_d: 0.4, medicaid: 0.6, three40b: 0.5 },
  psychiatry: { commercial: 0.45, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.58, three40b: 0.48 },
  gastroenterology: { commercial: 0.38, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.55, three40b: 0.45 },
  hepatology: { commercial: 0.32, medicare_b: 0.22, medicare_d: 0.35, medicaid: 0.55, three40b: 0.45 },
  endocrinology: { commercial: 0.42, medicare_b: 0.22, medicare_d: 0.4, medicaid: 0.58, three40b: 0.48 },
  musculoskeletal: { commercial: 0.45, medicare_b: 0.22, medicare_d: 0.38, medicaid: 0.58, three40b: 0.48 },
};
const DEFAULT_PAYER_TIER_REBATES = {
  commercial: 0.3,
  medicare_b: 0.22,
  medicare_d: 0.35,
  medicaid: 0.55,
  three40b: 0.45,
};

function buildPayerTierPricing(
  launchYear: number,
  therapyArea: string,
  wac: number,
  years: number = 10,
): PayerTierPricing[] {
  const areaLower = therapyArea.toLowerCase();
  const rebates = PAYER_TIER_REBATES[areaLower] ?? DEFAULT_PAYER_TIER_REBATES;
  const payerProfile = PAYER_MIX_PROFILES[areaLower] ?? PAYER_MIX_PROFILES.default;

  return Array.from({ length: years }, (_, i) => {
    const t = years <= 1 ? 0 : i / (years - 1);

    // Interpolate payer mix
    const commercial = payerProfile.yr1_commercial + (payerProfile.yr10_commercial - payerProfile.yr1_commercial) * t;
    const medicare = payerProfile.yr1_medicare + (payerProfile.yr10_medicare - payerProfile.yr1_medicare) * t;
    const medicaid = payerProfile.yr1_medicaid + (payerProfile.yr10_medicaid - payerProfile.yr1_medicaid) * t;
    const va = payerProfile.yr1_va + (payerProfile.yr10_va - payerProfile.yr1_va) * t;

    // Split Medicare into Part B and Part D (approximate: IV products are Part B, oral are Part D)
    const medicareBShare = 0.4; // ~40% of Medicare is Part B
    const medicareDShare = 0.6; // ~60% is Part D
    const partBPct = medicare * medicareBShare;
    const partDPct = medicare * medicareDShare;

    // 340B is approximately 5-8% of commercial volume
    const three40bPct = commercial * 0.12;
    const adjustedCommercial = commercial - three40bPct;

    const tiers: PayerTierPricingEntry[] = [
      {
        payer_tier: 'Commercial',
        share_pct: parseFloat((adjustedCommercial * 100).toFixed(1)),
        discount_pct: parseFloat((rebates.commercial * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - rebates.commercial)),
        rationale: 'Managed care rebates, formulary positioning, and PBM negotiations',
      },
      {
        payer_tier: 'Medicare Part B',
        share_pct: parseFloat((partBPct * 100).toFixed(1)),
        discount_pct: parseFloat((rebates.medicare_b * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - rebates.medicare_b)),
        rationale: 'ASP+6% buy-and-bill reimbursement model; sequestration reduces further',
      },
      {
        payer_tier: 'Medicare Part D',
        share_pct: parseFloat((partDPct * 100).toFixed(1)),
        discount_pct: parseFloat((rebates.medicare_d * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - rebates.medicare_d)),
        rationale: 'Coverage gap manufacturer discount (IRA: 10-20%) plus plan rebates',
      },
      {
        payer_tier: 'Medicaid',
        share_pct: parseFloat((medicaid * 100).toFixed(1)),
        discount_pct: parseFloat(((rebates.medicaid + i * 0.005) * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - rebates.medicaid - i * 0.005)),
        rationale: 'Best price + state supplemental rebates; URA floor applies',
      },
      {
        payer_tier: '340B',
        share_pct: parseFloat((three40bPct * 100).toFixed(1)),
        discount_pct: parseFloat((rebates.three40b * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - rebates.three40b)),
        rationale: 'Statutory ceiling price; 340B-covered entities purchase at discount',
      },
      {
        payer_tier: 'VA/DoD',
        share_pct: parseFloat((va * 100).toFixed(1)),
        discount_pct: parseFloat((0.52 * 100).toFixed(1)),
        net_price: Math.round(wac * (1 - 0.52)),
        rationale: 'Federal Supply Schedule pricing; additional negotiated discounts',
      },
    ];

    // Calculate blended net price
    const blendedNet =
      adjustedCommercial * wac * (1 - rebates.commercial) +
      partBPct * wac * (1 - rebates.medicare_b) +
      partDPct * wac * (1 - rebates.medicare_d) +
      medicaid * wac * (1 - rebates.medicaid - i * 0.005) +
      three40bPct * wac * (1 - rebates.three40b) +
      va * wac * (1 - 0.52);

    const effectiveGTN = 1 - blendedNet / wac;

    return {
      year: launchYear + i,
      wac,
      tiers,
      blended_net_price: Math.round(blendedNet),
      effective_gtn_pct: parseFloat((effectiveGTN * 100).toFixed(1)),
    };
  });
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT 8: MANUFACTURING CAPACITY CONSTRAINTS (Pharma)
// Caps revenue based on manufacturing capacity for complex products
// ────────────────────────────────────────────────────────────

const MANUFACTURING_CAPS: Record<ManufacturingProductType, number[]> = {
  small_molecule: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // No constraint
  biologic: [0.6, 0.85, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  cell_gene_therapy: [0.3, 0.5, 0.75, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
};

function detectManufacturingProductType(mechanism: string | undefined): ManufacturingProductType {
  const m = (mechanism ?? '').toLowerCase();
  if (m.includes('car-t') || m.includes('car t') || m.includes('gene therapy') || m.includes('cell therapy')) {
    return 'cell_gene_therapy';
  }
  if (
    m.includes('antibod') ||
    m.includes('mab') ||
    m.includes('adc') ||
    m.includes('bispecific') ||
    m.includes('fusion') ||
    m.includes('biologic') ||
    m.includes('enzyme replacement')
  ) {
    return 'biologic';
  }
  return 'small_molecule';
}

function buildManufacturingConstraint(
  mechanism: string | undefined,
  revenueProjection: RevenueProjectionYear[],
): ManufacturingConstraint {
  const productType = detectManufacturingProductType(mechanism);
  const caps = MANUFACTURING_CAPS[productType];

  const constrainedYears = revenueProjection
    .map((yr, i) => {
      const cap = caps[i] ?? 1.0;
      return {
        year: yr.year,
        capacity_pct: Math.round(cap * 100),
        revenue_cap_m: Math.round(yr.base * cap),
      };
    })
    .filter((yr) => yr.capacity_pct < 100);

  const narratives: Record<ManufacturingProductType, string> = {
    small_molecule: 'Small molecule manufacturing has high capacity scalability. No supply constraints expected.',
    biologic:
      'Biologic manufacturing requires specialized facilities (CHO cell culture, purification). ' +
      'Year 1 capacity capped at 60% of demand (facility qualification, batch scale-up), ' +
      'Year 2 at 85% (tech transfer completion). Full capacity from Year 3.',
    cell_gene_therapy:
      'Cell/gene therapy faces severe manufacturing bottlenecks. Autologous products require per-patient manufacturing. ' +
      'Year 1 capped at 30% (vein-to-vein logistics, QP release), Year 2 at 50%, Year 3 at 75%, Year 4 at 90%. ' +
      'Multiple manufacturing sites and process automation needed for scale.',
  };

  return {
    product_type: productType,
    constrained_years: constrainedYears,
    narrative: narratives[productType],
  };
}

function applyManufacturingConstraint(
  projection: RevenueProjectionYear[],
  constraint: ManufacturingConstraint,
): RevenueProjectionYear[] {
  const caps = MANUFACTURING_CAPS[constraint.product_type];
  return projection.map((yr, i) => {
    const cap = caps[i] ?? 1.0;
    if (cap >= 1.0) return yr;
    return {
      ...yr,
      bear: Math.round(yr.bear * cap),
      base: Math.round(yr.base * cap),
      bull: Math.round(yr.bull * cap),
    };
  });
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT 9: REGULATORY PATHWAY LoA DISTINCTION
// Adjusts LoA based on regulatory designations
// ────────────────────────────────────────────────────────────

const DESIGNATION_LOA_MODIFIERS: Record<RegulatoryDesignation, number> = {
  'Breakthrough Therapy': 1.4,
  'Fast Track': 1.15,
  'Priority Review': 1.1,
  'Accelerated Approval': 1.25,
  'Orphan Drug': 1.3,
};

function inferRegulatoryDesignations(
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  input: MarketSizingInput,
): RegulatoryDesignation[] {
  const inferred: RegulatoryDesignation[] = [];

  // If rare disease or low prevalence → Orphan Drug
  if (indication.therapy_area.toLowerCase() === 'rare_disease' || indication.us_prevalence < 200000) {
    inferred.push('Orphan Drug');
  }

  // If treatment rate is very low (high unmet need) → possible Breakthrough
  if (indication.treatment_rate < 0.3) {
    inferred.push('Breakthrough Therapy');
  } else if (indication.treatment_rate < 0.5) {
    // Moderate unmet need → Fast Track
    inferred.push('Fast Track');
  }

  return inferred;
}

function buildRegulatoryPathwayAnalysis(
  baseLoa: number,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  input: MarketSizingInput,
): RegulatoryPathwayAnalysis {
  // Use provided designations or infer
  const designations: RegulatoryDesignation[] =
    input.regulatory_designations && input.regulatory_designations.length > 0
      ? input.regulatory_designations
      : inferRegulatoryDesignations(indication, input);

  const inferred = !input.regulatory_designations || input.regulatory_designations.length === 0;

  if (designations.length === 0) {
    return {
      base_loa: baseLoa,
      designations: [],
      pathway_modifier: 1.0,
      adjusted_loa: baseLoa,
      rationale: 'Standard regulatory pathway. No special designations detected or provided.',
      inferred: true,
    };
  }

  // Apply the highest modifier (don't stack multiplicatively — designations overlap in benefit)
  const modifiers = designations.map((d) => DESIGNATION_LOA_MODIFIERS[d]);
  const maxModifier = Math.max(...modifiers);

  // For multiple designations, add a small bonus for each additional (5% of the delta)
  const additionalBonus = designations.length > 1 ? (maxModifier - 1.0) * 0.05 * (designations.length - 1) : 0;
  const pathwayModifier = parseFloat((maxModifier + additionalBonus).toFixed(3));

  // Cap adjusted LoA at 0.95 (never 100% certain)
  const adjustedLoa = parseFloat(Math.min(0.95, baseLoa * pathwayModifier).toFixed(3));

  const designationNames = designations.join(', ');
  const rationale = inferred
    ? `Regulatory designations inferred from indication characteristics: ${designationNames}. ` +
      `${indication.therapy_area === 'rare_disease' || indication.us_prevalence < 200000 ? 'US prevalence <200K qualifies for Orphan Drug designation. ' : ''}` +
      `${indication.treatment_rate < 0.3 ? 'Low treatment rate indicates high unmet need, supporting Breakthrough Therapy consideration. ' : ''}` +
      `Combined pathway modifier of ${pathwayModifier}x increases base LoA from ${(baseLoa * 100).toFixed(1)}% to ${(adjustedLoa * 100).toFixed(1)}%.`
    : `Regulatory designations provided: ${designationNames}. ` +
      `Pathway modifier of ${pathwayModifier}x reflects higher historical approval rates for designated products. ` +
      `Adjusted LoA: ${(adjustedLoa * 100).toFixed(1)}% (from base ${(baseLoa * 100).toFixed(1)}%).`;

  return {
    base_loa: baseLoa,
    designations,
    pathway_modifier: pathwayModifier,
    adjusted_loa: adjustedLoa,
    rationale,
    inferred,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT C: ONE-TIME TREATMENT DETECTION
// Detects gene therapies, CAR-T, and other one-time treatments
// from mechanism keywords.
// ────────────────────────────────────────────────────────────

const ONE_TIME_TREATMENT_KEYWORDS = [
  'gene therapy',
  'gene editing',
  'car-t',
  'car t',
  'cell therapy',
  'gene replacement',
  'crispr',
  'aav',
  'aav9',
  'aav8',
  'aav5',
  'lentiviral',
  'adeno-associated',
];

function isOneTimeTreatment(mechanism: string | undefined): boolean {
  const m = (mechanism ?? '').toLowerCase();
  return ONE_TIME_TREATMENT_KEYWORDS.some((kw) => m.includes(kw));
}

function buildOneTimeTreatmentModel(
  mechanism: string | undefined,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  netPrice: number,
  launchYear: number,
  shareRange: { low: number; base: number; high: number },
  addressabilityFactor: number,
): OneTimeTreatmentModel | undefined {
  if (!isOneTimeTreatment(mechanism)) {
    return undefined;
  }

  const prevalentPool = Math.round(
    indication.us_prevalence * indication.diagnosis_rate * indication.treatment_rate * addressabilityFactor,
  );
  const annualNewCases = Math.round(
    indication.us_incidence * indication.diagnosis_rate * indication.treatment_rate * addressabilityFactor,
  );

  // Manufacturing capacity: cell/gene therapies are severely constrained
  // Year 1: 15% of backlog, Year 2: 25%, Year 3: 30% of remaining, Year 4+: new cases only
  const manufacturingCap = Math.round(prevalentPool * 0.25); // max patients/year early on

  let remainingPool = prevalentPool;
  const revenueByYear: { year: number; patients_treated: number; revenue_m: number }[] = [];
  const treatmentRates = [0.15, 0.25, 0.3]; // Year 1-3 prevalent pool penetration

  for (let yr = 0; yr < 10; yr++) {
    let patientsTreated: number;
    if (yr < 3 && remainingPool > 0) {
      // Backlog depletion phase: treat fraction of prevalent pool, capped by manufacturing
      const targetPatients = Math.round(prevalentPool * (treatmentRates[yr] ?? 0.3));
      patientsTreated = Math.min(manufacturingCap, targetPatients, remainingPool);
      remainingPool = Math.max(0, remainingPool - patientsTreated);
      // Also add new incident cases from year 2 onward
      if (yr > 0) {
        const newCaseTreated = Math.round(annualNewCases * shareRange.base);
        patientsTreated += newCaseTreated;
      }
    } else {
      // Steady state: only new incident cases drive revenue
      patientsTreated = Math.round(annualNewCases * shareRange.base);
    }

    const revenue = (patientsTreated * netPrice) / 1e6; // $M
    revenueByYear.push({
      year: launchYear + yr,
      patients_treated: patientsTreated,
      revenue_m: Math.round(revenue),
    });
  }

  // Calculate pool depletion timeline
  let depletionYears = 0;
  let simPool = prevalentPool;
  for (let yr = 0; yr < 20; yr++) {
    const rate = yr < 3 ? (treatmentRates[yr] ?? 0.3) : 0;
    const treatedFromPool = yr < 3 ? Math.min(manufacturingCap, Math.round(prevalentPool * rate), simPool) : 0;
    simPool = Math.max(0, simPool - treatedFromPool);
    depletionYears = yr + 1;
    if (simPool <= 0) break;
  }

  const steadyStateRevenue = Math.round((annualNewCases * shareRange.base * netPrice) / 1e6);

  return {
    is_one_time: true,
    prevalent_pool: prevalentPool,
    annual_new_cases: annualNewCases,
    pool_depletion_years: depletionYears,
    steady_state_revenue_m: steadyStateRevenue,
    revenue_by_year: revenueByYear,
    narrative:
      `One-time treatment detected (${mechanism}). Revenue driven by prevalent pool depletion model, ` +
      `not annual recurring therapy. Prevalent backlog of ${prevalentPool.toLocaleString()} eligible patients ` +
      `treated over ${depletionYears} years with manufacturing capacity constraints. ` +
      `After backlog exhaustion, steady-state revenue of ~$${steadyStateRevenue}M/year ` +
      `from ${annualNewCases.toLocaleString()} new incident cases annually. ` +
      `Peak revenue occurs in Years 1-3 during backlog treatment phase.`,
  };
}

function applyOneTimeTreatmentToProjection(
  projection: RevenueProjectionYear[],
  model: OneTimeTreatmentModel,
): RevenueProjectionYear[] {
  return projection.map((yr) => {
    const modelYear = model.revenue_by_year.find((my) => my.year === yr.year);
    if (!modelYear) return yr;

    // Replace standard S-curve revenue with pool depletion model
    // Scale bear/bull around the base using existing ratios
    const baseRatio = yr.base > 0 ? modelYear.revenue_m / yr.base : 1;
    return {
      ...yr,
      bear: Math.round(yr.bear * baseRatio),
      base: modelYear.revenue_m,
      bull: Math.round(yr.bull * baseRatio),
    };
  });
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT D: REAL-WORLD ADHERENCE RATES
// Therapy-area-specific adherence/persistence rates that
// reduce the effective treated population before addressability.
// Source: WHO adherence reports, disease-specific literature.
// ────────────────────────────────────────────────────────────

const ADHERENCE_RATES: Record<string, number> = {
  oncology: 0.92, // High — life-threatening
  rare_disease: 0.88, // High — severe symptoms
  neurology: 0.65, // Moderate — side effects, cognitive impairment
  immunology: 0.72, // Moderate — injection fatigue, remission
  cardiovascular: 0.55, // Low — asymptomatic, polypharmacy
  metabolic: 0.5, // Low — lifestyle factors, GI side effects
  psychiatry: 0.45, // Very low — insight, side effects, stigma
  pain_management: 0.6, // Moderate — tolerance, abuse concerns
  infectious_disease: 0.75, // Moderate-high — curative intent
  hematology: 0.85, // High — serious disease
  ophthalmology: 0.7, // Moderate — injection visits
  pulmonology: 0.6, // Moderate — inhaler technique, asymptomatic periods
  nephrology: 0.65, // Moderate — dialysis adherence varies
  dermatology: 0.55, // Low — cosmetic perception, topical fatigue
  gastroenterology: 0.68, // Moderate — symptom-driven
  hepatology: 0.78, // Moderate-high — curative HCV, serious disease
  endocrinology: 0.55, // Low — injection fatigue (insulin/GLP-1)
  musculoskeletal: 0.58, // Low-moderate — pain resolution, side effects
};

const DEFAULT_ADHERENCE_RATE = 0.65;

function getAdherenceRate(therapyArea: string): number {
  return ADHERENCE_RATES[therapyArea] ?? DEFAULT_ADHERENCE_RATE;
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT E: PEDIATRIC POPULATION MODELING
// Uses pediatric_prevalence from indication data when the
// patient segment specifies a pediatric population.
// ────────────────────────────────────────────────────────────

// Indications where pediatric population is the primary patient base
const PEDIATRIC_PRIMARY_INDICATIONS = [
  'spinal muscular atrophy',
  'sma',
  'duchenne muscular dystrophy',
  'dmd',
  'duchenne',
  'pediatric acute lymphoblastic leukemia',
  'pediatric all',
  'neuroblastoma',
  'retinoblastoma',
  'wilms tumor',
  'medulloblastoma',
  'rett syndrome',
  'dravet syndrome',
  'lennox-gastaut syndrome',
  'batten disease',
  'phenylketonuria',
  'pku',
  'cystic fibrosis',
];

function isPediatricSegment(patientSegment: string | undefined, subtype: string | undefined): boolean {
  const text = `${patientSegment ?? ''} ${subtype ?? ''}`.toLowerCase();
  return /\b(pediatric|paediatric|children|child|adolescent|infant|neonatal|juvenile|newborn)\b/.test(text);
}

function isPediatricPrimaryIndication(indicationName: string): boolean {
  const name = indicationName.toLowerCase();
  return PEDIATRIC_PRIMARY_INDICATIONS.some((pi) => {
    // Use word boundary matching to prevent "sma" matching "small" in "Non-Small Cell Lung Cancer"
    const regex = new RegExp(`\\b${pi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(name);
  });
}

function buildPediatricAnalysis(
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  patientSegment: string | undefined,
  subtype: string | undefined,
): PediatricAnalysis | undefined {
  const isPedSegment = isPediatricSegment(patientSegment, subtype);
  const isPedPrimary = isPediatricPrimaryIndication(indication.name);

  // Only produce analysis if pediatric context is relevant
  if (!isPedSegment && !isPedPrimary) return undefined;

  const adultPrevalence = indication.us_prevalence;
  let pediatricPrevalence: number;
  let pricingAdjustment: number;
  let rationale: string;

  if (indication.pediatric_prevalence !== undefined && indication.pediatric_prevalence > 0) {
    // Use explicit pediatric prevalence from indication data
    pediatricPrevalence = indication.pediatric_prevalence;
    pricingAdjustment = 0.85; // Moderate adjustment for weight-based dosing
    rationale =
      `Pediatric prevalence of ${pediatricPrevalence.toLocaleString()} used from indication data ` +
      `(vs adult prevalence of ${adultPrevalence.toLocaleString()}). ` +
      `Pricing adjusted to 0.85x adult WAC for weight-based pediatric dosing.`;
  } else if (isPedPrimary) {
    // Pediatric-primary indication: use 15-25% of adult prevalence
    const pedFraction = 0.2; // 20% as midpoint
    pediatricPrevalence = Math.round(adultPrevalence * pedFraction);
    pricingAdjustment = 0.9; // Less adjustment — pediatric is the primary market
    rationale =
      `"${indication.name}" is a pediatric-primary indication. Estimated pediatric prevalence at ` +
      `20% of total prevalence (${pediatricPrevalence.toLocaleString()} patients). ` +
      `Pricing adjusted to 0.90x — pediatric formulation is the primary product.`;
  } else {
    // Generic pediatric subset of adult indication
    const pedFraction = 0.15;
    pediatricPrevalence = Math.round(adultPrevalence * pedFraction);
    pricingAdjustment = 0.75; // Larger adjustment for lower weight / dose
    rationale =
      `Pediatric subset estimated at 15% of adult prevalence (${pediatricPrevalence.toLocaleString()} patients). ` +
      `Pricing adjusted to 0.75x adult WAC reflecting lower weight-based dosing. ` +
      `Note: pediatric clinical development may require separate trials and formulation.`;
  }

  return {
    is_pediatric_focused: isPedPrimary || isPedSegment,
    pediatric_prevalence: pediatricPrevalence,
    adult_prevalence: adultPrevalence,
    pricing_adjustment: pricingAdjustment,
    rationale,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT: PHARMA M&A DEAL COMPS + IMPLIED VALUATIONS
// Filters comps database by TA and stage, calculates
// median/mean EV/Peak Sales multiples, derives implied
// valuation range from user's peak sales estimate.
// ────────────────────────────────────────────────────────────

function buildDealCompsAnalysis(
  therapyArea: string,
  developmentStage: DevelopmentStage,
  peakSalesBase: number,
  peakSalesLow: number,
  peakSalesHigh: number,
): DealCompsAnalysis {
  const comps = filterDealComps(therapyArea, developmentStage);

  // Map to analysis entry type
  const comparableDeals: DealCompsAnalysisEntry[] = comps.slice(0, 10).map((d) => ({
    acquirer: d.acquirer,
    target: d.target,
    asset_or_indication: d.asset_or_indication,
    therapy_area: d.therapy_area,
    development_stage: d.development_stage,
    deal_type: d.deal_type,
    total_deal_value_m: d.total_deal_value_m,
    upfront_m: d.upfront_m,
    milestones_m: d.milestones_m,
    royalty_pct: d.royalty_pct,
    peak_sales_estimate_m: d.peak_sales_estimate_m,
    ev_peak_sales_multiple: d.ev_peak_sales_multiple,
    year: d.year,
    source: d.source,
  }));

  // Calculate multiples
  const multiples = comps.map((d) => d.ev_peak_sales_multiple).sort((a, b) => a - b);
  const median =
    multiples.length === 0
      ? 2.0
      : multiples.length % 2 === 0
        ? (multiples[multiples.length / 2 - 1] + multiples[multiples.length / 2]) / 2
        : multiples[Math.floor(multiples.length / 2)];
  const mean = multiples.length === 0 ? 2.0 : multiples.reduce((s, v) => s + v, 0) / multiples.length;

  // Implied valuations: use p25, median, p75 of multiples applied to peak sales
  const p25 = multiples.length >= 4 ? multiples[Math.floor(multiples.length * 0.25)] : median * 0.7;
  const p75 = multiples.length >= 4 ? multiples[Math.floor(multiples.length * 0.75)] : median * 1.3;

  const impliedLow = Math.round(peakSalesLow * p25);
  const impliedBase = Math.round(peakSalesBase * median);
  const impliedHigh = Math.round(peakSalesHigh * p75);

  const narrative =
    `Based on ${comps.length} comparable ${therapyArea} transactions ` +
    `(${developmentStage} stage focus), median EV/Peak Sales multiple is ${median.toFixed(1)}x ` +
    `(mean ${mean.toFixed(1)}x). Applied to peak sales estimate of $${peakSalesBase.toLocaleString()}M, ` +
    `implied enterprise value is $${impliedBase.toLocaleString()}M (range: ` +
    `$${impliedLow.toLocaleString()}M to $${impliedHigh.toLocaleString()}M). ` +
    `Recent transactions (${comps.length > 0 ? comps[0].year : 'N/A'}) show ` +
    `${median > 3 ? 'premium valuations reflecting strong buyer appetite' : median > 1.5 ? 'moderate multiples consistent with risk-adjusted returns' : 'conservative multiples reflecting early-stage risk'}.`;

  return {
    comparable_deals: comparableDeals,
    median_ev_peak_sales: parseFloat(median.toFixed(2)),
    mean_ev_peak_sales: parseFloat(mean.toFixed(2)),
    implied_valuation_low_m: impliedLow,
    implied_valuation_base_m: impliedBase,
    implied_valuation_high_m: impliedHigh,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT: BULL/BASE/BEAR INVESTMENT THESIS
// Generates structured thesis with probability-weighted EV,
// key binary risks, and scenario-specific drivers/narratives.
// ────────────────────────────────────────────────────────────

const STAGE_PROBABILITY_WEIGHTS: Record<string, { bull: number; base: number; bear: number }> = {
  preclinical: { bull: 0.15, base: 0.35, bear: 0.5 },
  phase1: { bull: 0.2, base: 0.4, bear: 0.4 },
  phase2: { bull: 0.25, base: 0.5, bear: 0.25 },
  phase3: { bull: 0.25, base: 0.5, bear: 0.25 },
  approved: { bull: 0.3, base: 0.5, bear: 0.2 },
};

function buildInvestmentThesis(
  developmentStage: DevelopmentStage,
  therapyArea: string,
  peakSales: { low: number; base: number; high: number },
  competitorCount: number,
  indicationName: string,
  loa: number,
  mechanism: string | undefined,
): InvestmentThesis {
  const weights = STAGE_PROBABILITY_WEIGHTS[developmentStage] ?? STAGE_PROBABILITY_WEIGHTS.phase2;

  // Scale bull/bear peak sales with therapy-area-specific multipliers
  const bullPeak = Math.round(peakSales.high * 1.3); // 30% upside beyond SOM high
  const basePeak = peakSales.base;
  const bearPeak = Math.round(peakSales.low * 0.5); // 50% downside from SOM low

  // Bull drivers
  const bullDrivers: string[] = [
    `Label expansion into adjacent indications within ${therapyArea}`,
    'Faster-than-expected adoption driven by strong Phase 3 data readout',
    'Premium pricing supported by demonstrated differentiation vs. standard of care',
    `Limited competitive entries; fewer than ${Math.max(2, competitorCount - 2)} new launches during peak sales window`,
    'Favorable payer coverage decisions enabling broad formulary access',
  ];

  // Base drivers
  const baseDrivers: string[] = [
    `Standard S-curve adoption for ${therapyArea} consistent with historical analogues`,
    'Median pricing within therapy-area comparables',
    `${competitorCount} competitors in market; share consistent with ${developmentStage} entrant benchmarks`,
    'Expected competitive dynamics: incremental share erosion post-Year 5',
    `Treatment rate and diagnosis rate in line with current ${indicationName} epidemiology`,
  ];

  // Bear drivers
  const bearDrivers: string[] = [
    'Payer resistance: step-therapy requirements and prior authorization delays',
    'Slower diagnosis rates and physician adoption inertia',
    `${competitorCount + 3}+ competitor launches compressing market share below expectations`,
    'Manufacturing delays or scale-up issues limiting supply during launch window',
    'Adverse safety signal or label restriction narrowing addressable population',
  ];

  // Key binary risks — stage-dependent
  const binaryRisks: string[] = [];
  if (developmentStage === 'preclinical' || developmentStage === 'phase1') {
    binaryRisks.push(
      `IND-enabling toxicology results (${developmentStage === 'preclinical' ? 'upcoming' : 'completed'})`,
      'Phase 1 dose-limiting toxicity and MTD determination',
      'Proof-of-concept signal in Phase 1b/2',
    );
  }
  if (developmentStage === 'phase2') {
    binaryRisks.push(
      'Phase 2 primary endpoint hit (pivotal readout)',
      'Regulatory alignment on pivotal trial design (EOP2 meeting)',
      `Competitive data readout from ${Math.min(3, competitorCount)} rival programs`,
    );
  }
  if (developmentStage === 'phase3') {
    binaryRisks.push(
      'Phase 3 primary endpoint success (registration-enabling)',
      'FDA/EMA filing acceptance and review timeline',
      'Advisory committee vote (if applicable)',
    );
  }
  if (developmentStage === 'approved') {
    binaryRisks.push(
      'Post-marketing safety commitment results (Phase 4/REMS)',
      'Payer coverage determination (commercial formulary + Medicare)',
      'Label expansion (sNDA/sBLA) outcomes for additional indications',
    );
  }
  binaryRisks.push(
    `Patent/exclusivity challenge (${mechanism?.toLowerCase().includes('biologic') ? 'biosimilar' : 'Paragraph IV'} risk)`,
    'IRA Medicare price negotiation timing and magnitude',
  );

  // Expected value
  const ev = Math.round(weights.bear * bearPeak + weights.base * basePeak + weights.bull * bullPeak);

  // Investment decision framework
  const framework =
    `At ${developmentStage} stage with LoA of ${(loa * 100).toFixed(0)}%, ` +
    `probability-weighted expected peak sales of $${ev.toLocaleString()}M. ` +
    `Bull case ($${bullPeak.toLocaleString()}M, ${(weights.bull * 100).toFixed(0)}% probability) requires ` +
    `label expansion success and limited competitive entry. ` +
    `Bear case ($${bearPeak.toLocaleString()}M, ${(weights.bear * 100).toFixed(0)}% probability) ` +
    `materializes if payer resistance or competitor launches compress share. ` +
    `Key catalyst: ${developmentStage === 'approved' ? 'commercial launch trajectory vs. consensus' : developmentStage === 'phase3' ? 'Phase 3 topline data readout' : 'clinical data readout and regulatory feedback'}. ` +
    `Risk-reward profile is ${ev / basePeak > 0.9 ? 'favorable' : ev / basePeak > 0.7 ? 'balanced' : 'skewed to downside'} ` +
    `for a ${therapyArea} asset at this stage.`;

  return {
    bull_case: {
      peak_sales_m: bullPeak,
      probability_pct: Math.round(weights.bull * 100),
      drivers: bullDrivers,
      narrative:
        `Bull case assumes label expansion, premium pricing, and limited competitive disruption. ` +
        `Peak sales of $${bullPeak.toLocaleString()}M achievable if all key catalysts deliver. ` +
        `${therapyArea === 'rare_disease' ? 'Orphan exclusivity provides downside protection.' : `Requires ${mechanism ? `${mechanism} to demonstrate` : 'asset to demonstrate'} best-in-class efficacy.`}`,
    },
    base_case: {
      peak_sales_m: basePeak,
      probability_pct: Math.round(weights.base * 100),
      drivers: baseDrivers,
      narrative:
        `Base case reflects standard ${therapyArea} adoption curves and median competitive dynamics. ` +
        `Peak sales of $${basePeak.toLocaleString()}M consistent with ` +
        `${developmentStage} stage historical outcomes and ${competitorCount}-competitor market.`,
    },
    bear_case: {
      peak_sales_m: bearPeak,
      probability_pct: Math.round(weights.bear * 100),
      drivers: bearDrivers,
      narrative:
        `Bear case assumes payer resistance, slow adoption, and aggressive competitive launches. ` +
        `Peak sales floor of $${bearPeak.toLocaleString()}M reflects scenario where ` +
        `${developmentStage === 'approved' ? 'commercial execution underperforms consensus' : 'clinical data disappoints or regulatory timeline extends'}.`,
    },
    expected_value_m: ev,
    key_binary_risks: binaryRisks,
    investment_decision_framework: framework,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT: CLINICAL DEVELOPMENT COST ESTIMATION
// Phase-specific R&D costs by therapy area (BIO/Informa benchmarks)
// and timelines from current stage to launch.
// ────────────────────────────────────────────────────────────

const DEVELOPMENT_COSTS_M: Record<string, { phase1: number; phase2: number; phase3: number; nda: number }> = {
  oncology: { phase1: 15, phase2: 35, phase3: 150, nda: 5 },
  rare_disease: { phase1: 10, phase2: 25, phase3: 80, nda: 5 },
  neurology: { phase1: 18, phase2: 40, phase3: 180, nda: 5 },
  immunology: { phase1: 15, phase2: 35, phase3: 140, nda: 5 },
  cardiovascular: { phase1: 20, phase2: 45, phase3: 200, nda: 5 },
  metabolic: { phase1: 18, phase2: 42, phase3: 190, nda: 5 },
  psychiatry: { phase1: 16, phase2: 38, phase3: 170, nda: 5 },
  pain_management: { phase1: 14, phase2: 32, phase3: 145, nda: 5 },
  infectious_disease: { phase1: 12, phase2: 30, phase3: 120, nda: 5 },
  hematology: { phase1: 14, phase2: 33, phase3: 130, nda: 5 },
  ophthalmology: { phase1: 12, phase2: 28, phase3: 110, nda: 5 },
  pulmonology: { phase1: 16, phase2: 38, phase3: 160, nda: 5 },
  nephrology: { phase1: 15, phase2: 35, phase3: 140, nda: 5 },
  dermatology: { phase1: 12, phase2: 28, phase3: 100, nda: 5 },
  gastroenterology: { phase1: 14, phase2: 35, phase3: 140, nda: 5 },
  hepatology: { phase1: 15, phase2: 35, phase3: 130, nda: 5 },
  endocrinology: { phase1: 16, phase2: 38, phase3: 150, nda: 5 },
  musculoskeletal: { phase1: 15, phase2: 35, phase3: 145, nda: 5 },
};

const DEFAULT_DEV_COSTS = { phase1: 15, phase2: 35, phase3: 150, nda: 5 };

// Timeline by TA: years from each stage to launch
const DEVELOPMENT_TIMELINE: Record<string, Record<string, number>> = {
  oncology: { preclinical: 8, phase1: 6, phase2: 4, phase3: 2, approved: 0 },
  rare_disease: { preclinical: 7, phase1: 5, phase2: 3.5, phase3: 1.5, approved: 0 },
  neurology: { preclinical: 10, phase1: 8, phase2: 5, phase3: 2.5, approved: 0 },
  immunology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2, approved: 0 },
  cardiovascular: { preclinical: 10, phase1: 8, phase2: 5, phase3: 2.5, approved: 0 },
  metabolic: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2.5, approved: 0 },
  psychiatry: { preclinical: 10, phase1: 8, phase2: 5, phase3: 2.5, approved: 0 },
  pain_management: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2.5, approved: 0 },
  infectious_disease: { preclinical: 7, phase1: 5, phase2: 3.5, phase3: 2, approved: 0 },
  hematology: { preclinical: 8, phase1: 6, phase2: 4, phase3: 2, approved: 0 },
  ophthalmology: { preclinical: 8, phase1: 6, phase2: 4, phase3: 2, approved: 0 },
  pulmonology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2.5, approved: 0 },
  nephrology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2, approved: 0 },
  dermatology: { preclinical: 8, phase1: 6, phase2: 4, phase3: 2, approved: 0 },
  gastroenterology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2, approved: 0 },
  hepatology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2, approved: 0 },
  endocrinology: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2.5, approved: 0 },
  musculoskeletal: { preclinical: 9, phase1: 7, phase2: 4.5, phase3: 2.5, approved: 0 },
};

const DEFAULT_TIMELINE: Record<string, number> = {
  preclinical: 9,
  phase1: 7,
  phase2: 4.5,
  phase3: 2,
  approved: 0,
};

// Phase duration (years per phase)
const PHASE_DURATIONS: Record<string, number> = {
  preclinical_to_phase1: 2,
  phase1: 1.5,
  phase2: 2,
  phase3: 2.5,
  nda: 1,
};

function buildDevelopmentCostEstimate(
  developmentStage: DevelopmentStage,
  therapyArea: string,
  riskAdjustedNPV: number,
  discountRate: number,
): MarketSizingDevelopmentCost {
  const taLower = therapyArea.toLowerCase();
  const costs = DEVELOPMENT_COSTS_M[taLower] ?? DEFAULT_DEV_COSTS;
  const timelineMap = DEVELOPMENT_TIMELINE[taLower] ?? DEFAULT_TIMELINE;
  const yearsToLaunch = timelineMap[developmentStage] ?? 4.5;

  // Determine which phases remain
  const remainingPhases: DevelopmentPhaseEntry[] = [];
  const stageOrder: DevelopmentStage[] = ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'];
  const currentIdx = stageOrder.indexOf(developmentStage);

  if (currentIdx < 1) {
    // Preclinical: needs all phases
    remainingPhases.push({
      phase: 'Preclinical to IND',
      cost_m: Math.round(costs.phase1 * 0.5),
      duration_years: PHASE_DURATIONS.preclinical_to_phase1,
    });
    remainingPhases.push({ phase: 'Phase 1', cost_m: costs.phase1, duration_years: PHASE_DURATIONS.phase1 });
    remainingPhases.push({ phase: 'Phase 2', cost_m: costs.phase2, duration_years: PHASE_DURATIONS.phase2 });
    remainingPhases.push({ phase: 'Phase 3', cost_m: costs.phase3, duration_years: PHASE_DURATIONS.phase3 });
    remainingPhases.push({ phase: 'NDA/BLA Filing', cost_m: costs.nda, duration_years: PHASE_DURATIONS.nda });
  } else if (currentIdx === 1) {
    // Phase 1: needs Phase 2, 3, NDA
    remainingPhases.push({ phase: 'Phase 2', cost_m: costs.phase2, duration_years: PHASE_DURATIONS.phase2 });
    remainingPhases.push({ phase: 'Phase 3', cost_m: costs.phase3, duration_years: PHASE_DURATIONS.phase3 });
    remainingPhases.push({ phase: 'NDA/BLA Filing', cost_m: costs.nda, duration_years: PHASE_DURATIONS.nda });
  } else if (currentIdx === 2) {
    // Phase 2: needs Phase 3, NDA
    remainingPhases.push({ phase: 'Phase 3', cost_m: costs.phase3, duration_years: PHASE_DURATIONS.phase3 });
    remainingPhases.push({ phase: 'NDA/BLA Filing', cost_m: costs.nda, duration_years: PHASE_DURATIONS.nda });
  } else if (currentIdx === 3) {
    // Phase 3: needs NDA only
    remainingPhases.push({ phase: 'NDA/BLA Filing', cost_m: costs.nda, duration_years: PHASE_DURATIONS.nda });
  }
  // Approved: no remaining phases

  const totalRemainingCost = remainingPhases.reduce((sum, p) => sum + p.cost_m, 0);

  // Cost-adjusted NPV: subtract PV of development costs from risk-adjusted NPV
  let pvDevCosts = 0;
  let cumulativeYears = 0;
  for (const phase of remainingPhases) {
    // Costs incurred at midpoint of each phase
    const midpoint = cumulativeYears + phase.duration_years / 2;
    pvDevCosts += phase.cost_m / Math.pow(1 + discountRate, midpoint);
    cumulativeYears += phase.duration_years;
  }

  const costAdjustedNPV = Math.round(riskAdjustedNPV - pvDevCosts);

  const narrative =
    developmentStage === 'approved'
      ? `Asset is approved. No remaining clinical development costs. ` +
        `Cost-adjusted rNPV of $${costAdjustedNPV.toLocaleString()}M equals risk-adjusted NPV.`
      : `Remaining development cost from ${developmentStage} to launch: $${totalRemainingCost}M ` +
        `across ${remainingPhases.length} phases over ~${yearsToLaunch.toFixed(1)} years. ` +
        `Phase 3 is the largest cost component at $${costs.phase3}M for ${therapyArea} indications ` +
        `(BIO/Informa industry benchmarks). PV of development costs at ${(discountRate * 100).toFixed(0)}% WACC ` +
        `is $${Math.round(pvDevCosts)}M. Cost-adjusted rNPV: $${costAdjustedNPV.toLocaleString()}M ` +
        `(risk-adjusted NPV of $${riskAdjustedNPV.toLocaleString()}M minus PV of remaining R&D).`;

  return {
    remaining_phases: remainingPhases,
    total_remaining_cost_m: totalRemainingCost,
    estimated_years_to_launch: yearsToLaunch,
    cost_adjusted_npv_m: costAdjustedNPV,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// ENHANCEMENT: FULL DCF WATERFALL TABLE
// Year-by-year DCF with COGS, SG&A, R&D, tax, FCF, PV
// using therapy-area-specific cost assumptions.
// Terminal value: perpetuity growth at 2% after Year 10.
// WACC sensitivity: EV at 8%, 10%, 12%, 15%.
// ────────────────────────────────────────────────────────────

// Therapy-area-specific COGS and SG&A assumptions (as % of revenue)
const DCF_COST_ASSUMPTIONS: Record<string, { cogs_pct: number; sgna_pct: number }> = {
  oncology: { cogs_pct: 0.15, sgna_pct: 0.25 },
  rare_disease: { cogs_pct: 0.1, sgna_pct: 0.2 },
  neurology: { cogs_pct: 0.2, sgna_pct: 0.3 },
  immunology: { cogs_pct: 0.18, sgna_pct: 0.28 },
  cardiovascular: { cogs_pct: 0.25, sgna_pct: 0.4 },
  metabolic: { cogs_pct: 0.25, sgna_pct: 0.4 },
  psychiatry: { cogs_pct: 0.22, sgna_pct: 0.35 },
  pain_management: { cogs_pct: 0.2, sgna_pct: 0.3 },
  infectious_disease: { cogs_pct: 0.2, sgna_pct: 0.28 },
  hematology: { cogs_pct: 0.12, sgna_pct: 0.22 },
  ophthalmology: { cogs_pct: 0.15, sgna_pct: 0.25 },
  pulmonology: { cogs_pct: 0.22, sgna_pct: 0.32 },
  nephrology: { cogs_pct: 0.18, sgna_pct: 0.28 },
  dermatology: { cogs_pct: 0.2, sgna_pct: 0.32 },
  gastroenterology: { cogs_pct: 0.18, sgna_pct: 0.3 },
  hepatology: { cogs_pct: 0.18, sgna_pct: 0.28 },
  endocrinology: { cogs_pct: 0.22, sgna_pct: 0.35 },
  musculoskeletal: { cogs_pct: 0.22, sgna_pct: 0.32 },
};

const DEFAULT_DCF_COSTS = { cogs_pct: 0.2, sgna_pct: 0.3 };
const CORPORATE_TAX_RATE = 0.21; // US federal rate
const TERMINAL_GROWTH_RATE = 0.02; // 2% perpetuity growth
const WACC_SENSITIVITY_RATES = [0.08, 0.1, 0.12, 0.15];

function buildDCFWaterfall(
  revenueProjection: RevenueProjectionYear[],
  therapyArea: string,
  developmentStage: DevelopmentStage,
  loa: number,
  discountRate: number,
  devCostEstimate: MarketSizingDevelopmentCost | undefined,
): DCFWaterfall {
  const taLower = therapyArea.toLowerCase();
  const costAssumptions = DCF_COST_ASSUMPTIONS[taLower] ?? DEFAULT_DCF_COSTS;

  // Determine pre-launch R&D spending schedule from development cost estimate
  const devPhases = devCostEstimate?.remaining_phases ?? [];
  let rndSchedule: number[] = [];
  if (devPhases.length > 0) {
    // Distribute development costs across pre-launch years
    // Pre-launch years come before the revenue projection starts
    const totalDevYears = Math.ceil(devCostEstimate?.estimated_years_to_launch ?? 0);
    rndSchedule = new Array(totalDevYears).fill(0);
    let yearOffset = 0;
    for (const phase of devPhases) {
      const phaseYears = Math.max(1, Math.round(phase.duration_years));
      const costPerYear = phase.cost_m / phaseYears;
      for (let y = 0; y < phaseYears && yearOffset + y < rndSchedule.length; y++) {
        rndSchedule[yearOffset + y] += costPerYear;
      }
      yearOffset += phaseYears;
    }
  }

  // Build year-by-year DCF rows
  // Combine pre-launch R&D years (negative FCF) + post-launch revenue years
  const prelaunchYears = rndSchedule.length;
  const launchYear = revenueProjection.length > 0 ? revenueProjection[0].year : new Date().getFullYear() + 2;
  const allYears: DCFWaterfallYear[] = [];

  // Pre-launch years (R&D only, no revenue)
  for (let i = 0; i < prelaunchYears; i++) {
    const year = launchYear - prelaunchYears + i;
    const rnd = Math.round(rndSchedule[i]);
    const fcf = -rnd;
    const df = 1 / Math.pow(1 + discountRate, i + 1);
    allYears.push({
      year,
      revenue_m: 0,
      cogs_m: 0,
      gross_profit_m: 0,
      sgna_m: 0,
      rnd_m: rnd,
      ebit_m: -rnd,
      tax_m: 0, // No tax on losses (NOL carry-forward)
      fcf_m: fcf,
      discount_factor: parseFloat(df.toFixed(4)),
      pv_fcf_m: Math.round(fcf * df),
    });
  }

  // Post-launch revenue years (from revenue projection)
  for (let i = 0; i < revenueProjection.length; i++) {
    const yr = revenueProjection[i];
    const revenue = yr.base * loa; // Risk-adjusted revenue
    const cogs = Math.round(revenue * costAssumptions.cogs_pct);
    const grossProfit = Math.round(revenue - cogs);
    // SG&A ramps: higher as % in early years (launch investment), stabilizes
    const sgnaRamp = i < 2 ? 1.2 : i < 4 ? 1.1 : 1.0;
    const sgna = Math.round(revenue * costAssumptions.sgna_pct * sgnaRamp);
    // Post-launch R&D: ~5% of revenue for lifecycle management
    const rnd = Math.round(revenue * 0.05);
    const ebit = Math.round(grossProfit - sgna - rnd);
    const tax = ebit > 0 ? Math.round(ebit * CORPORATE_TAX_RATE) : 0;
    const fcf = ebit - tax;
    const discountPeriod = prelaunchYears + i + 1;
    const df = 1 / Math.pow(1 + discountRate, discountPeriod);

    allYears.push({
      year: yr.year,
      revenue_m: Math.round(revenue),
      cogs_m: cogs,
      gross_profit_m: grossProfit,
      sgna_m: sgna,
      rnd_m: rnd,
      ebit_m: ebit,
      tax_m: tax,
      fcf_m: Math.round(fcf),
      discount_factor: parseFloat(df.toFixed(4)),
      pv_fcf_m: Math.round(fcf * df),
    });
  }

  // Sum of PV(FCF)
  const sumPVFCF = allYears.reduce((sum, yr) => sum + yr.pv_fcf_m, 0);

  // Terminal value: FCF of last year growing at perpetuity rate
  const lastRevYear = allYears[allYears.length - 1];
  const terminalFCF = lastRevYear ? lastRevYear.fcf_m * (1 + TERMINAL_GROWTH_RATE) : 0;
  const terminalValue =
    discountRate > TERMINAL_GROWTH_RATE && terminalFCF > 0
      ? Math.round(terminalFCF / (discountRate - TERMINAL_GROWTH_RATE))
      : 0;

  // Discount terminal value to present
  const totalPeriods = allYears.length;
  const pvTerminalValue = Math.round(terminalValue / Math.pow(1 + discountRate, totalPeriods));

  const enterpriseValue = sumPVFCF + pvTerminalValue;

  // WACC sensitivity
  const sensitivity: DCFSensitivityPoint[] = WACC_SENSITIVITY_RATES.map((wacc) => {
    let evAtWacc = 0;
    // Re-discount all FCFs at this WACC
    for (let i = 0; i < allYears.length; i++) {
      evAtWacc += allYears[i].fcf_m / Math.pow(1 + wacc, i + 1);
    }
    // Terminal value at this WACC
    if (wacc > TERMINAL_GROWTH_RATE && lastRevYear && lastRevYear.fcf_m > 0) {
      const tvAtWacc = (lastRevYear.fcf_m * (1 + TERMINAL_GROWTH_RATE)) / (wacc - TERMINAL_GROWTH_RATE);
      evAtWacc += tvAtWacc / Math.pow(1 + wacc, totalPeriods);
    }
    return { wacc: parseFloat((wacc * 100).toFixed(0)), ev_m: Math.round(evAtWacc) };
  });

  return {
    discount_rate_pct: parseFloat((discountRate * 100).toFixed(0)),
    years: allYears,
    sum_pv_fcf_m: sumPVFCF,
    terminal_value_m: pvTerminalValue,
    enterprise_value_m: enterpriseValue,
    sensitivity,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN PHARMA CALCULATION FUNCTION
// ────────────────────────────────────────────────────────────
export async function calculateMarketSizing(rawInput: MarketSizingInput): Promise<MarketSizingOutput> {
  // Normalize input — apply safe defaults for potentially missing fields
  const input: MarketSizingInput = {
    ...rawInput,
    indication: rawInput.indication ?? '',
    geography: rawInput.geography ?? (['US'] as MarketSizingInput['geography']),
    development_stage: rawInput.development_stage ?? ('phase2' as MarketSizingInput['development_stage']),
    pricing_assumption: rawInput.pricing_assumption ?? ('base' as MarketSizingInput['pricing_assumption']),
    launch_year: rawInput.launch_year ?? new Date().getFullYear() + 2,
  };

  // Step 1: Indication lookup
  const indication = findIndicationByName(input.indication);
  if (!indication) {
    throw new Error(
      `Indication not found: "${input.indication}". ` +
        `Try a more common name or check spelling. ` +
        `Terrain covers ${INDICATION_DATA.length} indications across oncology, neurology, immunology, rare disease, and more.`,
    );
  }

  // Step 2: Patient funnel
  const rawShareRange = STAGE_SHARE[input.development_stage] ?? STAGE_SHARE.phase2;
  const addressabilityFactor = estimateAddressabilityFactor(input);

  // Adjust share for competition density
  const competitorCount = indication.major_competitors.length;
  const shareRange = adjustShareForCompetition(rawShareRange, competitorCount);

  // Enhancement E: Pediatric population modeling
  const pediatricAnalysis = buildPediatricAnalysis(indication, input.patient_segment, input.subtype);
  const effectivePrevalence =
    pediatricAnalysis &&
    (isPediatricSegment(input.patient_segment, input.subtype) || isPediatricPrimaryIndication(indication.name))
      ? pediatricAnalysis.pediatric_prevalence
      : indication.us_prevalence;

  const diagnosed = Math.round(effectivePrevalence * indication.diagnosis_rate);
  const treated = Math.round(diagnosed * indication.treatment_rate);

  // Enhancement D: Real-world adherence step
  const adherenceRate = getAdherenceRate(indication.therapy_area);
  const adherent = Math.round(treated * adherenceRate);

  // Addressable now derives from adherent, not treated
  const addressable = Math.round(adherent * addressabilityFactor);
  const capturable_base = Math.round(addressable * shareRange.base);

  const patientFunnel: PatientFunnel = {
    us_prevalence: effectivePrevalence,
    us_incidence: indication.us_incidence,
    diagnosed,
    diagnosed_rate: indication.diagnosis_rate,
    treated,
    treated_rate: indication.treatment_rate,
    adherent,
    adherence_rate: adherenceRate,
    addressable,
    addressable_rate: addressabilityFactor,
    capturable: capturable_base,
    capturable_rate: shareRange.base,
  };

  // Step 3: Pricing analysis
  const pricingAnalysis = buildPricingAnalysis(input, indication.therapy_area);

  // Step 4: TAM / SAM / SOM
  const selectedPrice = pricingAnalysis.recommended_wac[input.pricing_assumption];
  const therapyGTN = GROSS_TO_NET[indication.therapy_area] ?? DEFAULT_GTN;
  // Enhancement E: Apply pediatric pricing adjustment if applicable
  const pediatricPricingFactor = pediatricAnalysis ? pediatricAnalysis.pricing_adjustment : 1.0;
  const netPrice = selectedPrice * (1 - therapyGTN) * pediatricPricingFactor;

  const us_tam_value = (treated * netPrice) / 1e9;
  const us_sam_value = (addressable * netPrice) / 1e9;
  const us_som_base = (addressable * shareRange.base * netPrice) / 1e9;
  const us_som_low = (addressable * shareRange.low * netPrice) / 1e9;
  const us_som_high = (addressable * shareRange.high * netPrice) / 1e9;

  // Step 5: Geography breakdown
  const geographyBreakdown = buildGeographyBreakdown(input.geography, us_tam_value, indication);

  // Step 6: Global TAM
  const globalTAM = geographyBreakdown.reduce((sum, t) => {
    const val = t.tam.unit === 'B' ? t.tam.value : t.tam.value / 1000;
    return sum + val;
  }, 0);

  // Step 7: Revenue projection (values in $M) — S-curve adoption
  // Enhancement 5: Build competitive position context for S-curve adjustment
  const competitiveContext = buildCompetitiveContext(indication);
  const competitivePositionCtx = buildCompetitivePositionContext(
    competitiveContext.crowding_score,
    input.mechanism,
    competitorCount,
    indication,
  );

  let revenueProjection = buildRevenueProjection(
    input.launch_year,
    us_som_low,
    us_som_base,
    us_som_high,
    indication.therapy_area,
    competitivePositionCtx,
  );

  // Step 7b: IRA impact modeling
  const iraImpact = computeIRAImpact(input.launch_year, revenueProjection);
  if (iraImpact) {
    revenueProjection = applyIRAToProjection(revenueProjection, iraImpact);
  }

  // Step 7c: Enhancement 8 — Manufacturing capacity constraints
  const manufacturingConstraint = buildManufacturingConstraint(input.mechanism, revenueProjection);
  if (manufacturingConstraint.constrained_years.length > 0) {
    revenueProjection = applyManufacturingConstraint(revenueProjection, manufacturingConstraint);
  }

  // Step 7d: Enhancement C — One-time treatment (gene therapy) revenue model
  const oneTimeTreatmentModel = buildOneTimeTreatmentModel(
    input.mechanism,
    indication,
    netPrice,
    input.launch_year,
    shareRange,
    addressabilityFactor,
  );
  if (oneTimeTreatmentModel) {
    revenueProjection = applyOneTimeTreatmentToProjection(revenueProjection, oneTimeTreatmentModel);
  }

  // Step 8: Peak sales ($M)
  const peakSales = {
    low: parseFloat((us_som_low * 1000).toFixed(0)),
    base: parseFloat((us_som_base * 1000).toFixed(0)),
    high: parseFloat((us_som_high * 1000).toFixed(0)),
  };

  // Step 8b: Risk adjustment (LoA + eNPV) — now with indication-specific calibration
  const baseLoa = getLikelihoodOfApproval(indication.therapy_area, input.development_stage, input.indication);

  // Enhancement 9: Regulatory pathway LoA distinction
  const regulatoryPathwayAnalysis = buildRegulatoryPathwayAnalysis(baseLoa, indication, input);
  const loa = regulatoryPathwayAnalysis.adjusted_loa;

  const discountRate = 0.1; // Standard pharma 10% WACC
  const riskAdjustedNPV = revenueProjection.reduce((npv, yr, i) => {
    return npv + (yr.base * loa) / Math.pow(1 + discountRate, i + 1);
  }, 0);

  const riskAdjustment: RiskAdjustment = {
    probability_of_success: loa,
    therapy_area: indication.therapy_area,
    development_stage: input.development_stage,
    risk_adjusted_peak_sales: {
      low: Math.round(peakSales.low * loa),
      base: Math.round(peakSales.base * loa),
      high: Math.round(peakSales.high * loa),
    },
    risk_adjusted_npv_m: Math.round(riskAdjustedNPV),
    discount_rate: discountRate,
  };

  // Step 8c: Sensitivity analysis
  const sensitivityAnalysis = buildSensitivityAnalysis(
    us_som_base * 1000, // Convert to $M
    shareRange,
    netPrice,
    addressable,
    addressabilityFactor,
    indication.diagnosis_rate,
    therapyGTN,
  );

  // Step 8d: Dynamic competitive response model
  const competitiveResponse = buildCompetitiveResponse(revenueProjection, competitorCount, indication.therapy_area);

  // Step 8e: Biosimilar/LOE erosion curve
  const isBiologic =
    input.mechanism?.toLowerCase().includes('antibod') ||
    input.mechanism?.toLowerCase().includes('biologic') ||
    input.mechanism?.toLowerCase().includes('mab') ||
    input.mechanism?.toLowerCase().includes('adc') ||
    input.mechanism?.toLowerCase().includes('bispecific') ||
    input.mechanism?.toLowerCase().includes('car-t') ||
    input.mechanism?.toLowerCase().includes('fusion') ||
    false;
  const biosimilarErosion = buildBiosimilarErosionCurve(
    isBiologic ? 'biologic' : 'small_molecule',
    indication.us_prevalence < 200000,
  );

  // Step 8f: Payer mix evolution
  const payerMixEvolution = buildPayerMixEvolution(input.launch_year, indication.therapy_area);

  // Step 8g: Patient switching dynamics
  const patientDynamics = buildPatientDynamics(indication, input.mechanism);

  // Step 8h: Biomarker nesting
  const biomarkerNesting = buildBiomarkerNesting(
    indication,
    input.mechanism,
    input.patient_segment,
    input.subtype,
    addressable,
    loa,
  );

  // Step 8i: Sensitivity interactions (two-variable)
  const sensitivityInteractions = buildSensitivityInteractions(us_som_base * 1000, sensitivityAnalysis);

  // Step 8j: Cross-engine signals
  const crossEngineSignals = buildCrossEngineSignals(competitorCount, input.development_stage, loa);

  // Step 8k: Percentile projections (P10/P25/P50/P75/P90)
  const percentileProjections = buildPercentileProjections(revenueProjection, sensitivityAnalysis);

  // Step 8l: Treatment line model (1L/2L/3L+)
  const treatmentLineModel = buildTreatmentLineModel(indication.therapy_area, addressable, input.patient_segment);

  // Step 8m: Non-linear competitive erosion
  const nonLinearCompetitiveErosion = buildNonLinearCompetitiveErosion(competitorCount, input.mechanism);

  // Step 8n: GTN evolution (year-by-year gross-to-net)
  const gtnEvolution = buildGTNEvolution(
    input.launch_year,
    indication.therapy_area,
    isBiologic ? 'biologic' : 'small_molecule',
  );

  // Step 8o: Efficacy share modifier
  const efficacyShareModifier = buildEfficacyShareModifier(
    input.mechanism,
    input.patient_segment,
    competitorCount,
    indication,
  );

  // Step 8q: Enhancement 6 — Label expansion modeling
  const labelExpansionOpportunities = buildLabelExpansionOpportunities(
    indication,
    input.launch_year,
    netPrice,
    shareRange,
  );

  // Add label expansion revenue to bull case (years 4-10)
  if (labelExpansionOpportunities.length > 0) {
    revenueProjection = revenueProjection.map((yr) => {
      let expansionRevenue = 0;
      for (const exp of labelExpansionOpportunities) {
        if (yr.year >= exp.expected_approval_year) {
          // Ramp: 30% in year of expansion approval, 60% year 2, 100% year 3+
          const yearsPostExpansion = yr.year - exp.expected_approval_year;
          const rampFactor = yearsPostExpansion === 0 ? 0.3 : yearsPostExpansion === 1 ? 0.6 : 1.0;
          expansionRevenue += exp.incremental_peak_revenue_m * rampFactor * exp.probability;
        }
      }
      if (expansionRevenue > 0) {
        return { ...yr, bull: Math.round(yr.bull + expansionRevenue) };
      }
      return yr;
    });
  }

  // Step 8r: Enhancement 7 — Multi-dimensional payer-tier pricing
  const payerTierPricing = buildPayerTierPricing(input.launch_year, indication.therapy_area, selectedPrice);

  // Step 8s: Mechanism-based competitive analysis
  const competitiveMechanismAnalysis = buildCompetitiveMechanismAnalysis(
    input.mechanism,
    indication.major_competitors,
    indication.therapy_area,
  );

  // Step 8t: Patent cliff analysis
  const hasOrphanDesignation = indication.us_prevalence < 200000;
  const patentCliffAnalysis = buildPatentCliffAnalysis(input.mechanism, input.launch_year, hasOrphanDesignation, 10);

  // Apply mechanism-weighted erosion to competitive response (augments flat-rate model)
  if (competitiveMechanismAnalysis.mechanism_weighted_erosion_pct > 0) {
    const mechErosionFactor = 1 - competitiveMechanismAnalysis.mechanism_weighted_erosion_pct / 100;
    revenueProjection = revenueProjection.map((yr, i) => {
      // Phase in mechanism erosion over years 2-5 (competitors don't all launch simultaneously)
      const phaseIn = i === 0 ? 0.2 : i === 1 ? 0.5 : i === 2 ? 0.75 : i === 3 ? 0.9 : 1.0;
      const yearFactor = 1 - (1 - mechErosionFactor) * phaseIn;
      return {
        ...yr,
        bear: Math.round(yr.bear * yearFactor),
        base: Math.round(yr.base * yearFactor),
        bull: Math.round(yr.bull * yearFactor),
      };
    });
  }

  // Step 8u: Enhancement — Deal Comps Analysis (implied valuations from M&A precedents)
  const dealCompsAnalysis = buildDealCompsAnalysis(
    indication.therapy_area,
    input.development_stage,
    peakSales.base,
    peakSales.low,
    peakSales.high,
  );

  // Step 8v: Enhancement — Bull/Base/Bear Investment Thesis
  const investmentThesis = buildInvestmentThesis(
    input.development_stage,
    indication.therapy_area,
    peakSales,
    competitorCount,
    indication.name,
    loa,
    input.mechanism,
  );

  // Step 8w: Enhancement — Clinical Development Cost Estimation
  const developmentCostEstimate = buildDevelopmentCostEstimate(
    input.development_stage,
    indication.therapy_area,
    riskAdjustment.risk_adjusted_npv_m,
    discountRate,
  );

  // Apply patent cliff erosion to revenue projection (replaces hardcoded LOE_DECLINE in S-curve)
  if (patentCliffAnalysis.erosion_profile.length > 0) {
    revenueProjection = revenueProjection.map((yr) => {
      const cliffYear = patentCliffAnalysis.erosion_profile.find((e) => e.year === yr.year);
      if (cliffYear && cliffYear.retained_pct < 100) {
        const factor = cliffYear.retained_pct / 100;
        return {
          ...yr,
          bear: Math.round(yr.bear * factor),
          base: Math.round(yr.base * factor),
          bull: Math.round(yr.bull * factor),
        };
      }
      return yr;
    });
  }

  // Step 8p: Integrated revenue projection
  const integratedProjection = buildIntegratedProjection(
    revenueProjection,
    payerMixEvolution,
    competitiveResponse,
    iraImpact,
    biosimilarErosion,
    patientFunnel,
    shareRange,
    indication.therapy_area,
  );

  // Step 8x: Enhancement — Full DCF Waterfall Table
  const dcfWaterfall = buildDCFWaterfall(
    revenueProjection,
    indication.therapy_area,
    input.development_stage,
    loa,
    discountRate,
    developmentCostEstimate.remaining_phases.length > 0 ? developmentCostEstimate : undefined,
  );

  // Step 9: Competitive context (already computed in Step 7 for S-curve adjustment)

  return {
    summary: {
      tam_us: toMetric(us_tam_value, 'high'),
      sam_us: toMetric(us_sam_value, addressabilityFactor > 0.4 ? 'high' : 'medium'),
      som_us: {
        ...toMetric(us_som_base, 'medium'),
        range: [parseFloat(us_som_low.toFixed(2)), parseFloat(us_som_high.toFixed(2))],
      },
      global_tam: toMetric(globalTAM, geographyBreakdown.length > 1 ? 'medium' : 'low'),
      peak_sales_estimate: peakSales,
      cagr_5yr: indication.cagr_5yr,
      market_growth_driver: indication.market_growth_driver,
    },
    patient_funnel: patientFunnel,
    geography_breakdown: geographyBreakdown,
    pricing_analysis: pricingAnalysis,
    revenue_projection: revenueProjection,
    competitive_context: competitiveContext,
    methodology: buildMethodology(
      input,
      indication,
      shareRange,
      therapyGTN,
      netPrice,
      loa,
      patientDynamics,
      isBiologic,
    ),
    assumptions: buildAssumptions(input, indication, addressabilityFactor, therapyGTN, loa),
    data_sources: buildDataSources(indication),
    generated_at: new Date().toISOString(),
    indication_validated: true,
    risk_adjustment: riskAdjustment,
    sensitivity_analysis: sensitivityAnalysis,
    ira_impact: iraImpact,
    competitive_response: competitiveResponse,
    biosimilar_erosion: biosimilarErosion,
    payer_mix_evolution: payerMixEvolution,
    patient_dynamics: patientDynamics,
    biomarker_nesting: biomarkerNesting,
    integrated_projection: integratedProjection,
    sensitivity_interactions: sensitivityInteractions,
    cross_engine_signals: crossEngineSignals,
    percentile_projections: percentileProjections,
    treatment_line_model: treatmentLineModel,
    non_linear_competitive_erosion: nonLinearCompetitiveErosion,
    gtn_evolution: gtnEvolution,
    efficacy_share_modifier: efficacyShareModifier,
    label_expansion_opportunities: labelExpansionOpportunities.length > 0 ? labelExpansionOpportunities : undefined,
    payer_tier_pricing: payerTierPricing,
    manufacturing_constraint:
      manufacturingConstraint.constrained_years.length > 0 ? manufacturingConstraint : undefined,
    regulatory_pathway_analysis: regulatoryPathwayAnalysis,
    competitive_mechanism_analysis: competitiveMechanismAnalysis,
    patent_cliff_analysis: patentCliffAnalysis,
    one_time_treatment_model: oneTimeTreatmentModel,
    pediatric_analysis: pediatricAnalysis,
    deal_comps_analysis: dealCompsAnalysis,
    investment_thesis: investmentThesis,
    development_cost_estimate: developmentCostEstimate,
    dcf_waterfall: dcfWaterfall,
  };
}

// ────────────────────────────────────────────────────────────
// ADDRESSABILITY FACTOR
// ────────────────────────────────────────────────────────────
function estimateAddressabilityFactor(input: MarketSizingInput): number {
  if (!input.patient_segment && !input.subtype) return 0.6;

  const text = `${input.patient_segment ?? ''} ${input.subtype ?? ''}`.toLowerCase();
  const indicationLower = input.indication.toLowerCase();

  // Step 1a: Try unified BIOMARKER_DATA source first (broadest coverage)
  const biomarkerTokens = text.match(/\b[a-z0-9][a-z0-9_.-]+\b/g) ?? [];
  for (const token of biomarkerTokens) {
    const unifiedPrevalence = getBiomarkerPrevalence(indicationLower, token);
    if (unifiedPrevalence !== undefined) {
      if (/\b(2l|3l|4l|second.line|third.line|relapsed|refractory|r\/r)\b/.test(text)) {
        return unifiedPrevalence * 0.6;
      }
      return unifiedPrevalence;
    }
  }

  // Step 1b: Fallback to hardcoded map for legacy indication/biomarker combos
  const biomarkerData = BIOMARKER_PREVALENCE_FALLBACK[indicationLower];
  if (biomarkerData) {
    for (const [marker, prevalence] of Object.entries(biomarkerData)) {
      const markerNorm = marker.replace(/_/g, '[ _-]?');
      if (new RegExp(markerNorm, 'i').test(text)) {
        // Apply line-of-therapy modifier on top of biomarker prevalence
        if (/\b(2l|3l|4l|second.line|third.line|relapsed|refractory|r\/r)\b/.test(text)) {
          return prevalence * 0.6; // Later line narrows further
        }
        return prevalence;
      }
    }
  }

  // Step 2: Generic biomarker-selected = narrow population
  if (
    /\b(egfr|kras|her2|brca|alk|braf|ntrk|ros1|ret|met|fgfr|pik3ca|msi.h|tmb.h|pd.l1)\b/.test(text) ||
    text.includes('biomarker') ||
    text.includes('mutation')
  ) {
    return 0.15;
  }
  // Later line of therapy = narrow
  if (/\b(2l|3l|4l|second.line|third.line|relapsed|refractory|r\/r)\b/.test(text)) {
    return 0.35;
  }
  // First line = broader
  if (/\b(1l|first.line|frontline|treatment.naive|newly.diagnosed)\b/.test(text)) {
    return 0.55;
  }
  // Subtype specified but no other qualifier
  if (input.subtype) return 0.4;
  return 0.45;
}

// ────────────────────────────────────────────────────────────
// METRIC BUILDER
// ────────────────────────────────────────────────────────────
function toMetric(valueBillions: number, confidence: ConfidenceLevel): MarketMetric {
  if (valueBillions >= 1) {
    return { value: parseFloat(valueBillions.toFixed(2)), unit: 'B', confidence };
  }
  const valueM = valueBillions * 1000;
  return { value: parseFloat(valueM.toFixed(valueM >= 100 ? 0 : 1)), unit: 'M', confidence };
}

// ────────────────────────────────────────────────────────────
// PRICING ANALYSIS
// ────────────────────────────────────────────────────────────
function buildPricingAnalysis(input: MarketSizingInput, therapyArea: string): PricingAnalysis {
  // Find comparables: first by therapy_area, then narrow by mechanism if possible
  let comparables = PRICING_BENCHMARKS.filter((b) => b.therapy_area.toLowerCase() === therapyArea.toLowerCase());

  if (input.mechanism) {
    const mechanismMatches = comparables.filter(
      (b) =>
        b.mechanism_class.toLowerCase().includes(input.mechanism!.toLowerCase()) ||
        input.mechanism!.toLowerCase().includes(b.mechanism_class.toLowerCase()),
    );
    if (mechanismMatches.length >= 3) comparables = mechanismMatches;
  }

  // Sort by recency
  comparables.sort((a, b) => b.launch_year - a.launch_year);
  const topComparables = comparables.slice(0, 8);

  // Percentile-based pricing
  const wacs = comparables.map((c) => c.us_launch_wac_annual).sort((a, b) => a - b);
  const fallbackWAC = DEFAULT_WAC[therapyArea] ?? DEFAULT_WAC_FALLBACK;

  const pctl = (arr: number[], p: number) => {
    if (arr.length === 0) return fallbackWAC;
    const idx = (p / 100) * (arr.length - 1);
    const lo = Math.floor(idx),
      hi = Math.ceil(idx);
    return lo === hi ? arr[lo] : arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
  };

  const conservativeWAC = Math.round(pctl(wacs, 25));
  const baseWAC = Math.round(pctl(wacs, 50));
  const premiumWAC = Math.round(pctl(wacs, 75));

  const gtn = GROSS_TO_NET[therapyArea] ?? DEFAULT_GTN;

  const comparableDrugs: ComparableDrug[] = topComparables.map((c) => ({
    name: c.drug_name,
    company: c.company,
    launch_year: c.launch_year,
    launch_wac: c.us_launch_wac_annual,
    current_net_price: Math.round((c.current_list_price ?? c.us_launch_wac_annual) * (1 - gtn)),
    indication: c.indication,
    mechanism: c.mechanism_class,
    phase: 'Approved',
  }));

  const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

  return {
    comparable_drugs: comparableDrugs,
    recommended_wac: {
      conservative: conservativeWAC,
      base: baseWAC,
      premium: premiumWAC,
    },
    payer_dynamics: buildPayerDynamics(therapyArea),
    pricing_rationale:
      `Based on ${comparables.length} approved ${therapyArea} comparables. ` +
      `WAC range: ${fmtK(conservativeWAC)} (25th pctl) to ${fmtK(premiumWAC)} (75th pctl), ` +
      `base ${fmtK(baseWAC)} (median). ` +
      (input.mechanism ? `Reflects ${input.mechanism} positioning. ` : '') +
      `Net after ${(gtn * 100).toFixed(0)}% GTN.`,
    gross_to_net_estimate: gtn,
  };
}

function buildPayerDynamics(therapyArea: string): string {
  const d: Record<string, string> = {
    oncology:
      'Oncology retains strong pricing power. Part B buy-and-bill faces ASP+6% constraints; Part D oral oncology faces IRA negotiation risk after 9 years. Prior auth rare for first-in-class.',
    immunology:
      'Highly competitive. Biosimilar pressure on biologics. Step-through requirements and 40-55% gross-to-net spreads. Formulary positioning critical.',
    neurology:
      'Moderate payer restrictions. Specialty products may face CED requirements. Step therapy common for non-orphan indications.',
    rare_disease:
      'Favorable pricing. Limited payer pushback due to small populations. Value-based agreements growing. Patient assistance programs essential.',
    cardiovascular:
      'Mature, generic-heavy. Novel agents face generic step-through. Value-based pricing tied to CV outcomes data.',
    metabolic: 'GLP-1 class faces utilization management but strong demand. Insulin IRA caps at $35/month.',
    infectious_disease: 'Variable by sub-segment. Novel antibiotics supported by GAIN Act but low volumes.',
    ophthalmology:
      'Anti-VEGF dominated by buy-and-bill. Biosimilar entry disrupting. Gene therapy faces one-time payment challenges.',
    hematology:
      'Strong pricing for novel agents. CAR-T and bispecifics command $300K+. Factor replacement facing biosimilar competition.',
    pulmonology:
      'Competitive inhaler market with generic pressure. Biologics for severe asthma have moderate restrictions.',
    nephrology: 'Growing market with novel agents. Dialysis products face Medicare bundled payment dynamics.',
    psychiatry:
      'Heavy Medicaid exposure (30%+). State supplemental rebates compound federal best-price. Step-through generic antidepressants/antipsychotics mandated before novel agents. Long-acting injectables face medical benefit vs pharmacy benefit complexity.',
    pain_management:
      'Highest payer scrutiny. Prior authorization near-universal. Opioid policies restrict new entrants. CGRP migraine class has moderate access but utilization management via quantity limits. Non-opioid chronic pain lacks clear reimbursement pathways.',
    dermatology:
      'Biologic step-through policies (topicals → phototherapy → systemic → biologic). IL-17/IL-23/JAK class crowded with preferred formulary competition. Specialty pharmacy distribution. Copay accumulator programs impact patient out-of-pocket.',
    gastroenterology:
      'IBD biologics face step-through (anti-TNF first). Biosimilar infliximab/adalimumab disrupting. JAK/S1P oral agents gaining share but safety monitoring required. PPI class fully genericized.',
    hepatology:
      'HCV direct-acting antivirals faced aggressive payer management (cure-based value contracts). NASH/MASH emerging with uncertain reimbursement — payers await long-term outcome data. Subscription/Netflix pricing models for HCV.',
    endocrinology:
      'Insulin price caps ($35/month Medicare, expanding to commercial). GLP-1 class under intense utilization management for weight loss vs diabetes indications. IRA negotiation exposure for high-revenue agents. Thyroid/GH generics available.',
    musculoskeletal:
      'Anti-TNF biosimilar wave driving 30-50% discounts. Novel mechanisms (anti-IL17 for SpA, anti-sclerostin for osteoporosis) face step-through requirements. Osteoporosis agents face adherence-driven coverage restrictions. Gout treatment underpenetrated.',
  };
  return (
    d[therapyArea] ??
    'Standard commercial payer landscape. Coverage depends on clinical differentiation versus standard of care.'
  );
}

// ────────────────────────────────────────────────────────────
// GEOGRAPHY BREAKDOWN
// ────────────────────────────────────────────────────────────
// Epidemiological prevalence adjustment factors vs US.
// For most diseases, US prevalence rates are a reasonable proxy. For diseases with
// known major geographic variation (infectious diseases, genetic conditions, lifestyle-
// driven conditions), these factors correct the US-derived rate.
// Sources: WHO GBD 2021, Lancet regional epidemiology reviews, GLOBOCAN 2022.
// Territory prevalence adjustment factors relative to US prevalence rate.
// Sources: WHO Global Burden of Disease 2021, GLOBOCAN 2022, Lancet regional epidemiology reviews,
// IARC Cancer Today 2022, GBD 2021 Neurological Disorders Collaborators, IDF Diabetes Atlas 2021,
// WHO Global Tuberculosis Report 2023, UNAIDS 2023, Polaris Observatory (HBV/HCV).
// Values represent multipliers vs. US prevalence (1.0 = same as US).
const PREVALENCE_ADJUSTMENTS: Record<string, Record<string, number>> = {
  // --- ONCOLOGY ---

  // NSCLC: higher in China (high male smoking rates), slightly lower in most EU countries
  'Non-Small Cell Lung Cancer': {
    China: 1.8,
    Japan: 1.1,
    RoW: 0.9,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 0.8,
    Spain: 0.7,
    UK: 0.9,
    Canada: 0.8,
    Australia: 0.7,
  },
  // Breast cancer: higher in EU5/Australia, lower in Asia (rising in China)
  'Breast Cancer': {
    China: 0.5,
    Japan: 0.7,
    RoW: 0.6,
    EU5: 1.2,
    Germany: 1.2,
    France: 1.3,
    Italy: 1.1,
    Spain: 1.0,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.2,
  },
  'Triple-Negative Breast Cancer': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.7,
    EU5: 1.1,
    Germany: 1.1,
    France: 1.2,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.2,
    Canada: 1.0,
    Australia: 1.1,
  },
  'HER2+ Breast Cancer': {
    China: 0.5,
    Japan: 0.7,
    RoW: 0.6,
    EU5: 1.2,
    Germany: 1.2,
    France: 1.3,
    Italy: 1.1,
    Spain: 1.0,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.2,
  },
  'HR+/HER2- Breast Cancer': {
    China: 0.5,
    Japan: 0.7,
    RoW: 0.6,
    EU5: 1.2,
    Germany: 1.2,
    France: 1.3,
    Italy: 1.1,
    Spain: 1.0,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.2,
  },
  // Multiple myeloma: slightly higher in Western countries, lower in Asia
  'Multiple Myeloma': {
    China: 0.4,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.1,
    Canada: 1.0,
    Australia: 1.1,
  },
  // CLL: predominantly Western, lower in Asia
  'Chronic Lymphocytic Leukemia': {
    China: 0.2,
    Japan: 0.3,
    RoW: 0.4,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.1,
    Canada: 1.0,
    Australia: 1.1,
  },
  // AML: relatively similar globally, slightly lower in Asia
  'Acute Myeloid Leukemia': {
    China: 0.7,
    Japan: 0.8,
    RoW: 0.7,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // NHL: Western predominance, lower in Asia
  'Non-Hodgkin Lymphoma': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.1,
  },
  // Prostate cancer (mCRPC): much higher in Western countries, very low in Asia
  'Prostate Cancer': {
    China: 0.15,
    Japan: 0.3,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.2,
  },
  // Colorectal cancer: higher in Japan/Korea, similar in EU
  'Colorectal Cancer': {
    China: 1.1,
    Japan: 1.5,
    RoW: 0.7,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.0,
    Italy: 1.1,
    Spain: 1.1,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.1,
  },
  // RCC: similar in developed countries, lower in Asia
  'Renal Cell Carcinoma': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Melanoma: very high in Australia, low in Asia (UV/skin pigment driven)
  Melanoma: {
    China: 0.05,
    Japan: 0.05,
    RoW: 0.3,
    EU5: 0.7,
    Germany: 0.8,
    France: 0.6,
    Italy: 0.6,
    Spain: 0.5,
    UK: 0.8,
    Canada: 0.7,
    Australia: 2.5,
  },
  // Ovarian cancer: slightly higher in Northern Europe, lower in Asia
  'Ovarian Cancer': {
    China: 0.6,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.1,
    Canada: 1.0,
    Australia: 0.9,
  },
  // Pancreatic cancer: relatively similar in developed countries
  'Pancreatic Cancer': {
    China: 0.7,
    Japan: 1.0,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 0.9,
  },
  // Bladder / urothelial: higher in Southern Europe (smoking, occupational exposure)
  'Bladder Cancer': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.2,
    Spain: 1.3,
    UK: 1.0,
    Canada: 1.0,
    Australia: 0.9,
  },
  'Urothelial Carcinoma': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.2,
    Spain: 1.3,
    UK: 1.0,
    Canada: 1.0,
    Australia: 0.9,
  },
  // HNSCC: higher in South/Southeast Asia (betel nut), moderate in France (alcohol/tobacco)
  'Head and Neck Squamous Cell Carcinoma': {
    China: 1.2,
    Japan: 0.9,
    RoW: 1.5,
    EU5: 1.0,
    Germany: 0.9,
    France: 1.3,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.8,
    Canada: 0.8,
    Australia: 0.8,
  },
  // Glioblastoma: similar across developed countries, lower reported in developing
  Glioblastoma: {
    China: 0.7,
    Japan: 0.8,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Cholangiocarcinoma: much higher in East/SE Asia (liver fluke endemic areas)
  Cholangiocarcinoma: {
    China: 3.0,
    Japan: 2.0,
    RoW: 2.5,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.7,
    Italy: 0.9,
    Spain: 0.7,
    UK: 0.7,
    Canada: 0.6,
    Australia: 0.5,
  },

  // --- AUTOIMMUNE / INFLAMMATORY ---

  // RA: higher in Northern Europe, lower in Asia
  'Rheumatoid Arthritis': {
    China: 0.5,
    Japan: 0.7,
    RoW: 0.6,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.2,
    Canada: 1.1,
    Australia: 1.0,
  },
  // Psoriasis: strong Northern European gradient, much lower in Asia
  Psoriasis: {
    China: 0.3,
    Japan: 0.4,
    RoW: 0.4,
    EU5: 1.3,
    Germany: 1.5,
    France: 1.2,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.3,
    Canada: 1.2,
    Australia: 1.1,
  },
  'Psoriatic Arthritis': {
    China: 0.2,
    Japan: 0.3,
    RoW: 0.3,
    EU5: 1.2,
    Germany: 1.4,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.2,
    Canada: 1.1,
    Australia: 1.0,
  },
  // Atopic dermatitis: relatively common globally, higher in developed countries
  'Atopic Dermatitis': {
    China: 0.6,
    Japan: 0.8,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.2,
  },
  // IBD: highest in Northern Europe and North America, very low in Asia (rising)
  'Inflammatory Bowel Disease': {
    China: 0.15,
    Japan: 0.3,
    RoW: 0.3,
    EU5: 1.2,
    Germany: 1.3,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.3,
    Canada: 1.3,
    Australia: 1.1,
  },
  "Crohn's Disease": {
    China: 0.1,
    Japan: 0.25,
    RoW: 0.25,
    EU5: 1.2,
    Germany: 1.4,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.3,
    Canada: 1.4,
    Australia: 1.1,
  },
  'Ulcerative Colitis': {
    China: 0.2,
    Japan: 0.4,
    RoW: 0.3,
    EU5: 1.2,
    Germany: 1.3,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.3,
    Canada: 1.3,
    Australia: 1.1,
  },
  // MS: latitude gradient — highest in Northern Europe, very low near equator
  'Multiple Sclerosis': {
    China: 0.05,
    Japan: 0.1,
    RoW: 0.3,
    EU5: 1.3,
    Germany: 1.5,
    France: 1.2,
    Italy: 1.0,
    Spain: 0.8,
    UK: 1.4,
    Canada: 1.5,
    Australia: 0.9,
  },
  // SLE: higher in African/Asian descent populations, but higher diagnosed rates in West
  'Systemic Lupus Erythematosus': {
    China: 1.2,
    Japan: 0.8,
    RoW: 0.8,
    EU5: 0.8,
    Germany: 0.7,
    France: 0.8,
    Italy: 0.8,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.8,
  },

  // --- METABOLIC / CARDIOVASCULAR ---

  // Obesity: much lower in East Asia, highest in US/UK/Australia
  Obesity: {
    China: 0.2,
    Japan: 0.1,
    RoW: 0.4,
    EU5: 0.7,
    Germany: 0.7,
    France: 0.5,
    Italy: 0.4,
    Spain: 0.6,
    UK: 0.8,
    Canada: 0.8,
    Australia: 0.9,
  },
  // Heart failure: slightly higher in developed nations, different subtypes vary
  'Heart Failure': {
    China: 0.8,
    Japan: 0.9,
    RoW: 0.7,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Atrial fibrillation: age-dependent, similar in developed countries
  'Atrial Fibrillation': {
    China: 0.6,
    Japan: 0.8,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.1,
    Spain: 1.0,
    UK: 1.1,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Resistant hypertension: subset of hypertension, follows similar pattern
  'Resistant Hypertension': {
    China: 1.0,
    Japan: 0.9,
    RoW: 0.8,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.8,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // CKD: higher in diabetes-prevalent populations
  'Chronic Kidney Disease': {
    China: 1.1,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 1.0,
  },

  // --- RESPIRATORY ---

  // Severe asthma: higher in developed countries, UK/Australia have high rates
  'Severe Asthma': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 0.9,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.4,
  },
  // COPD: very high in China (smoking + air pollution), high in UK
  COPD: {
    China: 1.5,
    Japan: 0.9,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.2,
    Canada: 0.9,
    Australia: 0.9,
  },
  // IPF: similar in developed countries, under-diagnosed globally
  'Idiopathic Pulmonary Fibrosis': {
    China: 0.5,
    Japan: 0.8,
    RoW: 0.4,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.1,
    Canada: 1.0,
    Australia: 1.0,
  },
  // RSV: universal infection globally, hospitalization rates similar
  'Respiratory Syncytial Virus': {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.2,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- NEUROLOGY / PSYCHIATRY ---

  // Alzheimer's: similar in developed countries, underdiagnosed in developing
  "Alzheimer's Disease": {
    China: 0.7,
    Japan: 1.1,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.1,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Parkinson's: slightly lower in Asia, similar in West
  "Parkinson's Disease": {
    China: 0.7,
    Japan: 0.9,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Epilepsy: higher in developing countries (untreated infections, birth trauma)
  Epilepsy: {
    China: 0.9,
    Japan: 0.8,
    RoW: 1.5,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // MDD: underdiagnosed in Asia, high in developed Western countries
  'Major Depressive Disorder': {
    China: 0.4,
    Japan: 0.5,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Schizophrenia: ~1% globally, underdiagnosed in developing regions
  Schizophrenia: {
    China: 0.8,
    Japan: 0.9,
    RoW: 0.7,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Chronic migraine: higher in Western countries, underreported in Asia
  'Chronic Migraine': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.1,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // ALS: similar incidence globally (~2/100K), slightly higher in Northern Europe
  'Amyotrophic Lateral Sclerosis': {
    China: 0.7,
    Japan: 0.9,
    RoW: 0.5,
    EU5: 1.1,
    Germany: 1.1,
    France: 1.1,
    Italy: 1.2,
    Spain: 1.0,
    UK: 1.1,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- RARE / GENETIC ---

  // SMA: autosomal recessive, similar carrier frequency globally
  'Spinal Muscular Atrophy': {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // DMD: X-linked, similar incidence globally
  'Duchenne Muscular Dystrophy': {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // CF: overwhelmingly Caucasian — very rare in Asia/Africa
  'Cystic Fibrosis': {
    China: 0.01,
    Japan: 0.01,
    RoW: 0.1,
    EU5: 1.2,
    Germany: 1.0,
    France: 1.1,
    Italy: 0.8,
    Spain: 0.7,
    UK: 1.4,
    Canada: 1.2,
    Australia: 1.3,
  },
  // Hemophilia A: X-linked, similar globally
  'Hemophilia A': {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- INFECTIOUS DISEASE ---

  // HIV: very high in Sub-Saharan Africa, lower in East Asia
  HIV: {
    China: 0.15,
    Japan: 0.03,
    RoW: 5.0,
    EU5: 0.5,
    Germany: 0.3,
    France: 0.6,
    Italy: 0.4,
    Spain: 0.5,
    UK: 0.4,
    Canada: 0.5,
    Australia: 0.3,
  },
  // Hepatitis C: higher in Egypt/Pakistan, moderate in Southern Europe
  'Hepatitis C': {
    China: 0.7,
    Japan: 0.6,
    RoW: 2.0,
    EU5: 0.8,
    Germany: 0.5,
    France: 0.6,
    Italy: 1.2,
    Spain: 0.7,
    UK: 0.5,
    Canada: 0.6,
    Australia: 0.5,
  },

  // --- OPHTHALMOLOGY ---

  // AMD: age-dependent, similar in developed countries
  'Age-Related Macular Degeneration': {
    China: 0.6,
    Japan: 0.8,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.1,
  },
  // DME: follows T2D prevalence
  'Diabetic Macular Edema': {
    China: 1.2,
    Japan: 1.0,
    RoW: 1.1,
    EU5: 0.8,
    Germany: 0.9,
    France: 0.8,
    Italy: 0.8,
    Spain: 0.8,
    UK: 0.8,
    Canada: 0.9,
    Australia: 0.8,
  },

  // --- EXISTING ENTRIES (preserved) ---

  // Hepatitis B: endemic in Asia/Africa, rare in US
  'Hepatitis B': {
    China: 16.0,
    Japan: 1.5,
    RoW: 5.0,
    EU5: 0.8,
    Germany: 0.9,
    France: 0.7,
    Italy: 0.8,
    Spain: 0.6,
    UK: 0.5,
    Canada: 0.7,
    Australia: 0.5,
  },
  'Chronic Hepatitis B': {
    China: 16.0,
    Japan: 1.5,
    RoW: 5.0,
    EU5: 0.8,
    Germany: 0.9,
    France: 0.7,
    Italy: 0.8,
    Spain: 0.6,
    UK: 0.5,
    Canada: 0.7,
    Australia: 0.5,
  },
  // Gastric cancer: much higher in East Asia
  'Gastric Cancer': {
    China: 5.0,
    Japan: 6.0,
    RoW: 2.5,
    EU5: 1.2,
    Germany: 1.0,
    France: 0.9,
    Italy: 1.3,
    Spain: 1.2,
    UK: 0.8,
    Canada: 0.7,
    Australia: 0.6,
  },
  // Nasopharyngeal cancer: endemic in southern China/SE Asia
  'Nasopharyngeal Cancer': {
    China: 20.0,
    Japan: 1.5,
    RoW: 3.0,
    EU5: 0.4,
    Germany: 0.3,
    France: 0.4,
    Italy: 0.3,
    Spain: 0.3,
    UK: 0.3,
    Canada: 0.4,
    Australia: 0.5,
  },
  // Liver cancer (HCC): strongly linked to HBV/HCV prevalence
  'Hepatocellular Carcinoma': {
    China: 4.0,
    Japan: 2.5,
    RoW: 3.0,
    EU5: 1.0,
    Germany: 0.9,
    France: 1.1,
    Italy: 1.3,
    Spain: 1.0,
    UK: 0.7,
    Canada: 0.6,
    Australia: 0.5,
  },
  // Thalassemia: Mediterranean and SE Asian
  'Beta-Thalassemia': {
    China: 3.0,
    Japan: 0.2,
    RoW: 4.0,
    EU5: 1.5,
    Germany: 0.5,
    France: 0.8,
    Italy: 3.0,
    Spain: 1.5,
    UK: 0.8,
    Canada: 0.6,
    Australia: 0.8,
  },
  // Type 2 diabetes: higher in China, India, Middle East
  'Type 2 Diabetes': {
    China: 1.4,
    Japan: 1.1,
    RoW: 1.3,
    EU5: 0.8,
    Germany: 0.9,
    France: 0.7,
    Italy: 0.8,
    Spain: 0.8,
    UK: 0.7,
    Canada: 0.9,
    Australia: 0.8,
  },
  // NASH/MASH: follows obesity prevalence patterns
  'Metabolic Dysfunction-Associated Steatohepatitis': {
    China: 0.8,
    Japan: 0.9,
    RoW: 0.7,
    EU5: 0.85,
    Germany: 0.9,
    France: 0.8,
    Italy: 0.85,
    Spain: 0.8,
    UK: 0.85,
    Canada: 0.95,
    Australia: 0.9,
  },
  // Sickle cell: primarily African descent populations
  'Sickle Cell Disease': {
    China: 0.01,
    Japan: 0.01,
    RoW: 3.0,
    EU5: 0.15,
    Germany: 0.1,
    France: 0.3,
    Italy: 0.15,
    Spain: 0.1,
    UK: 0.25,
    Canada: 0.15,
    Australia: 0.1,
  },
  // Malaria: not relevant in developed markets but massive in RoW
  Malaria: {
    China: 0.01,
    Japan: 0.01,
    RoW: 50.0,
    EU5: 0.01,
    Germany: 0.01,
    France: 0.01,
    Italy: 0.01,
    Spain: 0.01,
    UK: 0.01,
    Canada: 0.01,
    Australia: 0.01,
  },
  // Tuberculosis
  Tuberculosis: {
    China: 5.0,
    Japan: 1.2,
    RoW: 10.0,
    EU5: 0.5,
    Germany: 0.4,
    France: 0.5,
    Italy: 0.4,
    Spain: 0.5,
    UK: 0.6,
    Canada: 0.4,
    Australia: 0.3,
  },
  // Cervical cancer: much higher where screening is limited
  'Cervical Cancer': {
    China: 2.0,
    Japan: 1.2,
    RoW: 4.0,
    EU5: 0.7,
    Germany: 0.6,
    France: 0.6,
    Italy: 0.5,
    Spain: 0.6,
    UK: 0.7,
    Canada: 0.5,
    Australia: 0.4,
  },

  // --- PSYCHIATRY ---

  // Bipolar disorder: ~1% globally, similar in developed countries, underdiagnosed in Asia
  'Bipolar Disorder': {
    China: 0.4,
    Japan: 0.5,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // PTSD: higher in conflict regions, higher diagnosed rates in US/UK
  'Post-Traumatic Stress Disorder': {
    China: 0.3,
    Japan: 0.4,
    RoW: 0.7,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.8,
    Italy: 0.7,
    Spain: 0.7,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // ADHD: much higher diagnosed rates in US; cultural differences in recognition
  'Attention Deficit Hyperactivity Disorder': {
    China: 0.3,
    Japan: 0.3,
    RoW: 0.3,
    EU5: 0.6,
    Germany: 0.6,
    France: 0.5,
    Italy: 0.4,
    Spain: 0.5,
    UK: 0.7,
    Canada: 0.8,
    Australia: 0.7,
  },
  // Generalized Anxiety Disorder
  'Generalized Anxiety Disorder': {
    China: 0.4,
    Japan: 0.5,
    RoW: 0.5,
    EU5: 0.9,
    Germany: 0.9,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // OCD: ~2% globally, similar across populations
  'Obsessive-Compulsive Disorder': {
    China: 0.7,
    Japan: 0.8,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Alcohol Use Disorder: higher in Eastern Europe/RoW, lower in Asia (flush reaction)
  'Alcohol Use Disorder': {
    China: 0.4,
    Japan: 0.5,
    RoW: 1.2,
    EU5: 1.2,
    Germany: 1.3,
    France: 1.4,
    Italy: 1.0,
    Spain: 1.1,
    UK: 1.3,
    Canada: 1.0,
    Australia: 1.1,
  },
  // Substance Use Disorder: higher in US (opioid crisis), varies by substance globally
  'Substance Use Disorder': {
    China: 0.3,
    Japan: 0.2,
    RoW: 0.6,
    EU5: 0.7,
    Germany: 0.7,
    France: 0.7,
    Italy: 0.6,
    Spain: 0.7,
    UK: 0.8,
    Canada: 0.8,
    Australia: 0.7,
  },

  // --- PAIN ---

  // Chronic pain: US has highest treatment rates; opioid prescribing patterns unique
  'Chronic Pain': {
    China: 0.6,
    Japan: 0.7,
    RoW: 0.5,
    EU5: 0.8,
    Germany: 0.9,
    France: 0.8,
    Italy: 0.7,
    Spain: 0.7,
    UK: 0.8,
    Canada: 0.9,
    Australia: 0.8,
  },
  // Fibromyalgia: higher diagnosed rates in US/EU; less recognized in Asia
  Fibromyalgia: {
    China: 0.3,
    Japan: 0.4,
    RoW: 0.4,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.7,
    Italy: 0.6,
    Spain: 0.7,
    UK: 0.8,
    Canada: 0.8,
    Australia: 0.7,
  },
  // Neuropathic pain: follows diabetic neuropathy patterns + post-herpetic neuralgia
  'Neuropathic Pain': {
    China: 0.8,
    Japan: 0.9,
    RoW: 0.7,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.8,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },

  // --- NEPHROLOGY ---

  // IgA Nephropathy: much higher in East Asia (especially Japan/China)
  'IgA Nephropathy': {
    China: 3.0,
    Japan: 3.5,
    RoW: 1.5,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 0.9,
  },
  // FSGS: higher in African ancestry populations
  'Focal Segmental Glomerulosclerosis': {
    China: 0.6,
    Japan: 0.5,
    RoW: 1.2,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.9,
    Italy: 0.7,
    Spain: 0.7,
    UK: 0.9,
    Canada: 0.8,
    Australia: 0.7,
  },
  // ESRD: follows CKD/diabetes/hypertension prevalence
  'End-Stage Renal Disease': {
    China: 1.0,
    Japan: 1.3,
    RoW: 0.8,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // Lupus nephritis: follows SLE distribution
  'Lupus Nephritis': {
    China: 1.3,
    Japan: 0.9,
    RoW: 0.9,
    EU5: 0.8,
    Germany: 0.7,
    France: 0.8,
    Italy: 0.8,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.8,
  },

  // --- DERMATOLOGY ---

  // Vitiligo: higher in darker skin populations, similar globally
  Vitiligo: {
    China: 0.8,
    Japan: 0.7,
    RoW: 1.2,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 1.0,
    Spain: 1.0,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // Alopecia areata: similar globally (~2%)
  'Alopecia Areata': {
    China: 0.9,
    Japan: 1.0,
    RoW: 0.8,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- GASTROENTEROLOGY ---

  // GERD: higher in Western nations, rising in Asia
  'Gastroesophageal Reflux Disease': {
    China: 0.5,
    Japan: 0.6,
    RoW: 0.5,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.8,
    Spain: 0.8,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // IBS: similar globally (~10%), diagnosis rates vary
  'Irritable Bowel Syndrome': {
    China: 0.7,
    Japan: 0.8,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Celiac disease: higher in Northern European ancestry, very low in East Asia
  'Celiac Disease': {
    China: 0.05,
    Japan: 0.05,
    RoW: 0.3,
    EU5: 1.2,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.3,
    Spain: 1.0,
    UK: 1.2,
    Canada: 1.1,
    Australia: 1.1,
  },

  // --- HEPATOLOGY ---

  // Cirrhosis: follows HBV/HCV/alcohol patterns
  Cirrhosis: {
    China: 2.5,
    Japan: 1.5,
    RoW: 2.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.2,
    Italy: 1.1,
    Spain: 1.0,
    UK: 0.9,
    Canada: 0.8,
    Australia: 0.7,
  },

  // --- ENDOCRINOLOGY ---

  // Type 1 Diabetes: higher in Northern Europe/Scandinavia
  'Type 1 Diabetes': {
    China: 0.2,
    Japan: 0.3,
    RoW: 0.4,
    EU5: 1.3,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.4,
    Canada: 1.1,
    Australia: 1.1,
  },
  // Osteoporosis: higher in aging populations, lower in Africa
  Osteoporosis: {
    China: 0.8,
    Japan: 1.2,
    RoW: 0.6,
    EU5: 1.1,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.1,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Hypothyroidism: higher in iodine-deficient regions
  Hypothyroidism: {
    China: 0.9,
    Japan: 1.0,
    RoW: 1.2,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- MUSCULOSKELETAL ---

  // Osteoarthritis: higher in aging populations, higher BMI nations
  Osteoarthritis: {
    China: 0.8,
    Japan: 1.1,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Gout: higher in Pacific Islanders, rising in China
  Gout: {
    China: 1.3,
    Japan: 1.0,
    RoW: 0.8,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.7,
    Italy: 0.7,
    Spain: 0.7,
    UK: 0.9,
    Canada: 0.9,
    Australia: 1.0,
  },
  // Ankylosing Spondylitis: follows HLA-B27 prevalence (higher in Northern Europeans)
  'Ankylosing Spondylitis': {
    China: 0.5,
    Japan: 0.3,
    RoW: 0.4,
    EU5: 1.2,
    Germany: 1.3,
    France: 1.1,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.2,
    Canada: 1.1,
    Australia: 1.0,
  },

  // --- HEMATOLOGY ---

  // ITP: similar globally
  'Immune Thrombocytopenic Purpura': {
    China: 0.9,
    Japan: 1.0,
    RoW: 0.7,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Hemophilia B: similar globally (X-linked)
  'Hemophilia B': {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- OPHTHALMOLOGY ---

  // Glaucoma: higher in African ancestry, angle-closure more common in East Asia
  Glaucoma: {
    China: 1.3,
    Japan: 1.1,
    RoW: 1.2,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.8,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.9,
  },
  // Dry Eye Disease: higher in Asia (screen time, environmental factors)
  'Dry Eye Disease': {
    China: 1.5,
    Japan: 1.4,
    RoW: 0.8,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.8,
    Italy: 0.8,
    Spain: 0.8,
    UK: 0.8,
    Canada: 0.9,
    Australia: 0.9,
  },
  // Retinal Vein Occlusion
  'Retinal Vein Occlusion': {
    China: 0.8,
    Japan: 1.0,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },

  // --- PULMONOLOGY ---

  // Pulmonary Arterial Hypertension: similar globally, underdiagnosed everywhere
  'Pulmonary Arterial Hypertension': {
    China: 0.7,
    Japan: 0.8,
    RoW: 0.5,
    EU5: 1.0,
    Germany: 1.1,
    France: 1.1,
    Italy: 1.0,
    Spain: 0.9,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Sarcoidosis: higher in Northern Europeans and African Americans
  Sarcoidosis: {
    China: 0.2,
    Japan: 0.5,
    RoW: 0.4,
    EU5: 1.2,
    Germany: 1.3,
    France: 1.1,
    Italy: 0.8,
    Spain: 0.7,
    UK: 1.1,
    Canada: 1.0,
    Australia: 0.8,
  },
  // Bronchiectasis: higher in Asia/Pacific
  Bronchiectasis: {
    China: 1.5,
    Japan: 1.3,
    RoW: 1.2,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 1.1,
    Canada: 0.9,
    Australia: 1.0,
  },

  // --- INFECTIOUS DISEASE ---

  // C. difficile: follows antibiotic use patterns
  'Clostridioides difficile Infection': {
    China: 0.6,
    Japan: 0.5,
    RoW: 0.5,
    EU5: 0.9,
    Germany: 1.0,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.8,
    UK: 1.0,
    Canada: 1.0,
    Australia: 0.8,
  },
  // CMV: higher seroprevalence in developing countries
  'Cytomegalovirus Infection': {
    China: 1.2,
    Japan: 1.0,
    RoW: 1.5,
    EU5: 0.9,
    Germany: 0.8,
    France: 0.9,
    Italy: 1.0,
    Spain: 1.0,
    UK: 0.8,
    Canada: 0.8,
    Australia: 0.8,
  },
  // Influenza: global, seasonal variation
  Influenza: {
    China: 1.0,
    Japan: 1.0,
    RoW: 1.0,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Fungal infections (invasive): higher in immunocompromised populations
  'Invasive Fungal Infections': {
    China: 0.8,
    Japan: 0.9,
    RoW: 1.5,
    EU5: 0.9,
    Germany: 0.9,
    France: 0.9,
    Italy: 0.9,
    Spain: 0.9,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.8,
  },

  // --- RARE DISEASE (additional) ---

  // Huntington's disease: similar globally (~5/100K), founder mutations in some populations
  "Huntington's Disease": {
    China: 0.2,
    Japan: 0.3,
    RoW: 0.4,
    EU5: 1.2,
    Germany: 1.2,
    France: 1.1,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.3,
    Canada: 1.1,
    Australia: 1.1,
  },
  // Fabry disease: X-linked, similar globally but underdiagnosed
  'Fabry Disease': {
    China: 0.8,
    Japan: 1.0,
    RoW: 0.6,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // Gaucher disease: higher in Ashkenazi Jewish populations
  'Gaucher Disease': {
    China: 0.3,
    Japan: 0.4,
    RoW: 0.5,
    EU5: 0.8,
    Germany: 0.8,
    France: 0.9,
    Italy: 0.7,
    Spain: 0.7,
    UK: 0.9,
    Canada: 0.9,
    Australia: 0.8,
  },
  // Hereditary angioedema: similar globally
  'Hereditary Angioedema': {
    China: 0.8,
    Japan: 0.9,
    RoW: 0.7,
    EU5: 1.0,
    Germany: 1.0,
    France: 1.0,
    Italy: 1.0,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
  // PKU: varies by population, higher carrier frequency in some European populations
  Phenylketonuria: {
    China: 0.6,
    Japan: 0.5,
    RoW: 0.6,
    EU5: 1.2,
    Germany: 1.1,
    France: 1.0,
    Italy: 1.3,
    Spain: 1.0,
    UK: 1.0,
    Canada: 1.0,
    Australia: 1.0,
  },
};

function buildGeographyBreakdown(
  geographies: string[],
  usTamBillions: number,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
): GeographyBreakdownItem[] {
  const usPopM = 336;

  const regNotes: Record<string, string> = {
    US: 'FDA NDA/BLA pathway. Priority Review, Breakthrough Therapy designations available.',
    EU5: 'EMA centralized MAA. National pricing negotiations per country.',
    Germany: 'AMNOG benefit assessment. Free pricing for 12 months post-launch.',
    France: 'HAS/CEPS assessment. ATU early access for high-need indications.',
    Italy: 'AIFA negotiation. Managed entry agreements common.',
    Spain: 'CIPM pricing. Regional (CCAA) reimbursement variations.',
    UK: 'MHRA + NICE HTA. QALY threshold ~$30K. Innovative Medicines Fund.',
    Japan: 'PMDA review. Sakigake designation. Biennial price revision.',
    China: 'NMPA approval. NRDL negotiation applies 30-80% discounts.',
    Canada: 'CADTH HTA + PMPRB pricing. 25-40% below US.',
    Australia: 'TGA + PBAC. Strict cost-effectiveness threshold.',
    RoW: 'Variable regulatory and pricing frameworks.',
  };

  // Look up prevalence adjustments for this indication (try exact name, then partial match)
  const indicationName = indication.name;
  const prevAdj =
    PREVALENCE_ADJUSTMENTS[indicationName] ??
    Object.entries(PREVALENCE_ADJUSTMENTS).find(
      ([key]) =>
        indicationName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(indicationName.toLowerCase()),
    )?.[1];

  // Expand 'Global' to all major territories
  // Deduplicate EU5 vs individual EU countries to prevent double-counting:
  // If EU5 is selected alongside any individual EU country, drop EU5 and use individual countries
  const EU5_COUNTRIES = ['Germany', 'France', 'Italy', 'Spain', 'UK'];
  let resolvedGeos: string[];

  if (geographies.includes('Global')) {
    resolvedGeos = [
      'US',
      'EU5',
      'Japan',
      'China',
      'Canada',
      'Australia',
      'South Korea',
      'Brazil',
      'India',
      'Mexico',
      'Taiwan',
      'Saudi Arabia',
      'Israel',
      'RoW',
    ];
  } else {
    const hasEU5 = geographies.includes('EU5');
    const hasIndividualEU = geographies.some((g) => EU5_COUNTRIES.includes(g));
    if (hasEU5 && hasIndividualEU) {
      // Drop EU5 aggregate, keep individual countries to avoid double-counting
      resolvedGeos = geographies.filter((g) => g !== 'EU5');
    } else {
      resolvedGeos = geographies;
    }
  }
  const expandedGeos = resolvedGeos;

  return expandedGeos
    .map((geo) => {
      const territory = TERRITORY_MULTIPLIERS.find((t) => t.code === geo || t.territory === geo);
      const multiplier = territory?.multiplier ?? 0.5;
      const popM = territory?.population_m ?? 50;
      const usPrevalencePerM = indication.us_prevalence / usPopM;

      // Apply territory-specific prevalence adjustment if available
      const geoAdjustment = prevAdj?.[geo] ?? 1.0;
      const adjustedPrevalencePerM = usPrevalencePerM * geoAdjustment;

      // Build notes for non-US territories
      let notes: string | undefined;
      if (geo === 'US') {
        notes = undefined; // US is the reference — no caveat needed
      } else if (prevAdj && prevAdj[geo] !== undefined) {
        notes =
          geoAdjustment > 1.5
            ? `Higher local prevalence (${geoAdjustment.toFixed(1)}x US rate). Revenue estimate uses IQVIA pharma market revenue ratio.`
            : geoAdjustment < 0.5
              ? `Lower local prevalence (${geoAdjustment.toFixed(1)}x US rate). Revenue estimate uses IQVIA pharma market revenue ratio.`
              : `Revenue scaled from US using IQVIA pharma market revenue ratio (${multiplier}x). Local prevalence similar to US.`;
      } else {
        notes = `Revenue estimate based on US market sizing scaled by territory pharma market ratio (${multiplier}x). Local epidemiology may differ — verify with regional data.`;
      }

      return {
        territory: territory?.territory ?? geo,
        tam: toMetric(usTamBillions * multiplier, multiplier > 0.3 ? 'high' : 'medium'),
        population: popM * 1_000_000,
        prevalence_rate: parseFloat((adjustedPrevalencePerM / 1_000_000).toFixed(6)),
        market_multiplier: multiplier,
        regulatory_status: regNotes[geo] ?? 'Country-specific regulatory framework.',
        notes,
      };
    })
    .sort((a, b) => {
      const aV = a.tam.unit === 'B' ? a.tam.value : a.tam.value / 1000;
      const bV = b.tam.unit === 'B' ? b.tam.value : b.tam.value / 1000;
      return bV - aV;
    });
}

// ────────────────────────────────────────────────────────────
// REVENUE PROJECTION (values in $M)
// ────────────────────────────────────────────────────────────
function buildRevenueProjection(
  launchYear: number,
  somLow: number,
  somBase: number,
  somHigh: number,
  therapyArea?: string,
  competitiveContext?: CompetitivePositionContext,
): RevenueProjectionYear[] {
  // Use therapy-area-specific S-curve if available, else fallback to generic ramp
  const ramp = therapyArea ? buildSCurveRamp(therapyArea, 10, competitiveContext) : PHARMA_REVENUE_RAMP;

  return ramp.map((factor, i) => ({
    year: launchYear + i,
    bear: parseFloat((somLow * factor * 1000).toFixed(0)),
    base: parseFloat((somBase * factor * 1000).toFixed(0)),
    bull: parseFloat((somHigh * factor * 1000).toFixed(0)),
  }));
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE CONTEXT
// ────────────────────────────────────────────────────────────
function buildCompetitiveContext(indication: NonNullable<ReturnType<typeof findIndicationByName>>) {
  const count = indication.major_competitors.length;

  let crowdingScore: number;
  if (count <= 1) crowdingScore = 2;
  else if (count <= 3) crowdingScore = 4;
  else if (count <= 5) crowdingScore = 6;
  else if (count <= 8) crowdingScore = 7;
  else if (count <= 12) crowdingScore = 8;
  else crowdingScore = 9;

  const note =
    count <= 2
      ? 'Low competition creates significant first/second-mover advantage.'
      : count <= 5
        ? 'Moderate competition. Mechanism differentiation and superior data will be key.'
        : 'Highly competitive. Requires clear differentiation on efficacy, safety, or convenience.';

  return {
    approved_products: Math.max(1, Math.round(count * 0.6)),
    phase3_programs: Math.max(1, Math.round(count * 0.4)),
    crowding_score: crowdingScore,
    differentiation_note: note,
  };
}

// ────────────────────────────────────────────────────────────
// METHODOLOGY
// ────────────────────────────────────────────────────────────
function buildMethodology(
  input: MarketSizingInput,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  shareRange: { low: number; base: number; high: number },
  grossToNet: number,
  netPrice: number,
  loa: number | undefined,
  patientDyn: PatientDynamics,
  isBiologicProduct: boolean,
): string {
  return [
    `Market sizing for "${input.indication}" calculated using a patient funnel-based approach with risk-adjusted revenue modeling.`,
    '',
    `Epidemiology: US prevalence ${indication.us_prevalence.toLocaleString()} patients, ` +
      `diagnosis rate ${(indication.diagnosis_rate * 100).toFixed(0)}%, ` +
      `treatment rate ${(indication.treatment_rate * 100).toFixed(0)}%. ` +
      `Source: ${indication.prevalence_source}.`,
    '',
    `Patient Funnel: Prevalence → diagnosed → treated → adherent (${(getAdherenceRate(indication.therapy_area) * 100).toFixed(0)}% ${indication.therapy_area} adherence rate) → addressable (segment filter${input.patient_segment ? `: "${input.patient_segment}"` : ': broad'}) → capturable. Real-world adherence/persistence rates applied per therapy area to reflect treatment discontinuation. Biomarker-specific prevalence applied where available.`,
    '',
    `Pricing: WAC benchmarked against ${indication.therapy_area} comparables from Terrain drug pricing database (${PRICING_BENCHMARKS.filter((b) => b.therapy_area === indication.therapy_area).length} drugs). ` +
      `Net price $${Math.round(netPrice).toLocaleString()} after ${(grossToNet * 100).toFixed(0)}% gross-to-net.`,
    '',
    `Market Share: ${(shareRange.low * 100).toFixed(1)}-${(shareRange.high * 100).toFixed(1)}% peak range for ${input.development_stage} stage, ` +
      `competition-adjusted for ${indication.major_competitors.length} known competitors (share reduced when >3 competitors). ` +
      `Calibrated to historical ${indication.therapy_area} outcomes.`,
    '',
    `Revenue: 10-year Bass diffusion S-curve model calibrated to ${indication.therapy_area} adoption dynamics. LOE decline modeled years 8-10. Three scenarios: bear/base/bull.`,
    '',
    loa !== undefined
      ? `Risk Adjustment: Probability of success ${(loa * 100).toFixed(0)}% (${indication.therapy_area} LoA at ${input.development_stage} stage, BIO/Informa benchmarks). Risk-adjusted NPV calculated at 10% WACC.`
      : '',
    '',
    `Sensitivity: Tornado analysis on 5 key drivers (market share, pricing, addressable population, diagnosis rate, gross-to-net).`,
    '',
    `IRA Impact: Inflation Reduction Act Medicare price negotiation modeled at Year 9 (small molecule) or Year 13 (biologic) post-launch.`,
    '',
    `Competitive Response: Mechanism-based competitive analysis scores each competitor by mechanism similarity (same mechanism: 25-35% erosion, same target: 15-20%, same pathway: 10-15%, different mechanism: 3-5%). Dynamic model projects mechanism-weighted erosion and share redistribution as competitors launch, calibrated to ${indication.therapy_area} competitive dynamics.`,
    '',
    `Patent Cliff / LOE: Product-type-specific patent cliff modeling. ${isBiologicProduct ? 'Biologic: 12-year exclusivity + patents, gradual biosimilar erosion (85% retained Year 1, 70% Year 2, 55% Year 3 post-LOE).' : 'Small molecule: NCE 5-year + patent protection, sharp generic cliff (40% retained Year 1, 20% Year 2 post-LOE).'} Cell/gene therapies: no generic pathway, minimal LOE erosion.`,
    '',
    `Payer Mix: Commercial/Medicare/Medicaid/VA split evolves over product lifecycle. Managed entry agreements (MEAs) modeled from Year 2 onward. Blended net price factor declines as Medicare share increases.`,
    '',
    `Patient Dynamics: ${patientDyn.total_share_additive_pct}% additive / ${patientDyn.total_share_cannibalistic_pct}% cannibalistic share capture modeled. Net market expansion: ${patientDyn.net_market_expansion_pct}%.`,
    '',
    isOneTimeTreatment(input.mechanism)
      ? `One-Time Treatment: Gene therapy/cell therapy revenue modeled using prevalent pool depletion, not annual recurring therapy. Revenue peaks in Years 1-3 as existing patient backlog is treated, then declines to steady-state from new incident cases only. Manufacturing capacity constraints applied.`
      : '',
    '',
    isPediatricSegment(input.patient_segment, input.subtype) || isPediatricPrimaryIndication(indication.name)
      ? `Pediatric Population: Prevalence adjusted for pediatric population. Pricing reflects weight-based dosing adjustment. Pediatric clinical development timeline and regulatory pathway (PREA, Written Request) may differ from adult programs.`
      : '',
    '',
    `Geography: US baseline scaled per territory using IQVIA pharma market revenue ratios (2024). Territory-specific prevalence adjustments applied for diseases with known geographic variation (e.g., HBV, gastric cancer, sickle cell). Non-US estimates should be validated with local epidemiological data.`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ────────────────────────────────────────────────────────────
// ASSUMPTIONS
// ────────────────────────────────────────────────────────────
function buildAssumptions(
  input: MarketSizingInput,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  addressabilityFactor: number,
  grossToNet: number,
  loa?: number,
): string[] {
  const assumptions = [
    `US prevalence: ${indication.us_prevalence.toLocaleString()} (${indication.prevalence_source})`,
    `Diagnosis rate: ${(indication.diagnosis_rate * 100).toFixed(0)}%`,
    `Treatment rate: ${(indication.treatment_rate * 100).toFixed(0)}%`,
    `Adherence/persistence: ${(getAdherenceRate(indication.therapy_area) * 100).toFixed(0)}% (${indication.therapy_area})`,
    `Addressability: ${(addressabilityFactor * 100).toFixed(0)}% of adherent patients`,
    `Pricing: ${input.pricing_assumption} tier`,
    `Gross-to-net: ${(grossToNet * 100).toFixed(0)}% (${indication.therapy_area})`,
    `Stage: ${input.development_stage}`,
    `Launch year: ${input.launch_year}`,
    `Adoption model: Bass diffusion S-curve (${indication.therapy_area}-calibrated)`,
    `LOE decline modeled years 8-10`,
    `5-year CAGR: ${indication.cagr_5yr}%`,
    `Competition adjustment: ${indication.major_competitors.length} known competitors`,
  ];

  if (loa !== undefined) {
    assumptions.push(
      `Probability of success: ${(loa * 100).toFixed(0)}% (${indication.therapy_area} LoA at ${input.development_stage})`,
      `Discount rate: 10% WACC (industry standard)`,
    );
  }

  assumptions.push(`IRA Medicare negotiation modeled at Year 9 (SM) / Year 13 (biologic)`);

  return assumptions;
}

// ────────────────────────────────────────────────────────────
// BIOMARKER NESTING
// Cascade: Indication → Biomarker → Line-of-therapy
// Produces nested addressable-patient funnel with LoA and
// pricing modifiers for biomarker-selected populations.
// ────────────────────────────────────────────────────────────

function buildBiomarkerNesting(
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
  mechanism: string | undefined,
  patientSegment: string | undefined,
  subtype: string | undefined,
  addressablePatients: number,
  baseLoa: number,
): BiomarkerNesting {
  const indicationLower = indication.name.toLowerCase();
  const segmentText = `${patientSegment ?? ''} ${subtype ?? ''}`.toLowerCase();
  const biomarkerFallback = BIOMARKER_PREVALENCE_FALLBACK[indicationLower];

  const levels: BiomarkerNestingLevel[] = [];

  // Level 0: Full indication
  levels.push({
    name: indication.name,
    prevalence_pct: 100,
    loa_modifier: 1.0,
    addressable_patients: addressablePatients,
    pricing_premium_pct: 0,
  });

  // Detect which biomarker is specified (if any)
  // Try unified BIOMARKER_DATA first, then fall back to hardcoded map
  let detectedBiomarker: string | undefined;
  let biomarkerPrevalence: number | undefined;

  const segmentTokens = segmentText.match(/\b[a-z0-9][a-z0-9_.-]+\b/g) ?? [];
  for (const token of segmentTokens) {
    const unified = getBiomarkerPrevalence(indicationLower, token);
    if (unified !== undefined) {
      detectedBiomarker = token;
      biomarkerPrevalence = unified;
      break;
    }
  }

  // Fallback to hardcoded map if unified lookup didn't match
  if (detectedBiomarker === undefined && biomarkerFallback) {
    for (const [marker, prevalence] of Object.entries(biomarkerFallback)) {
      const markerNorm = marker.replace(/_/g, '[ _-]?');
      if (new RegExp(markerNorm, 'i').test(segmentText)) {
        detectedBiomarker = marker;
        biomarkerPrevalence = prevalence;
        break;
      }
    }
  }

  // If no biomarker detected from segment text, check mechanism for hints
  if (!detectedBiomarker && mechanism) {
    const mechLower = mechanism.toLowerCase();
    // Try unified source via mechanism keyword
    const mechTokens = mechLower.match(/\b[a-z0-9][a-z0-9_.-]+\b/g) ?? [];
    for (const token of mechTokens) {
      const unified = getBiomarkerPrevalence(indicationLower, token);
      if (unified !== undefined) {
        detectedBiomarker = token;
        biomarkerPrevalence = unified;
        break;
      }
    }
    // Fallback to hardcoded map
    if (!detectedBiomarker && biomarkerFallback) {
      for (const [marker, prevalence] of Object.entries(biomarkerFallback)) {
        const markerClean = marker.replace(/_/g, ' ').toLowerCase();
        if (mechLower.includes(markerClean) || markerClean.includes(mechLower.split(' ')[0])) {
          detectedBiomarker = marker;
          biomarkerPrevalence = prevalence;
          break;
        }
      }
    }
  }

  if (detectedBiomarker && biomarkerPrevalence !== undefined) {
    // Level 1: Biomarker-selected population
    // Biomarker-selected trials have 1.2-1.5x LoA boost (enriched population)
    const biomarkerLoaModifier = biomarkerPrevalence <= 0.05 ? 1.5 : biomarkerPrevalence <= 0.15 ? 1.35 : 1.2;
    const biomarkerPricingPremium = biomarkerPrevalence <= 0.05 ? 20 : biomarkerPrevalence <= 0.15 ? 15 : 10;
    const biomarkerPatients = Math.round(addressablePatients * biomarkerPrevalence);

    levels.push({
      name: `${detectedBiomarker.replace(/_/g, ' ').toUpperCase()}-positive`,
      prevalence_pct: Math.round(biomarkerPrevalence * 100),
      loa_modifier: biomarkerLoaModifier,
      addressable_patients: biomarkerPatients,
      pricing_premium_pct: biomarkerPricingPremium,
    });

    // Level 2: Line-of-therapy within biomarker population (if specified)
    const isLaterLine = /\b(2l|3l|4l|second.line|third.line|relapsed|refractory|r\/r)\b/.test(segmentText);
    const isFirstLine = /\b(1l|first.line|frontline|treatment.naive|newly.diagnosed)\b/.test(segmentText);

    if (isLaterLine) {
      const lotFactor = 0.6;
      const lotPatients = Math.round(biomarkerPatients * lotFactor);
      levels.push({
        name: 'Later-line (2L+/R/R)',
        prevalence_pct: Math.round(lotFactor * 100),
        loa_modifier: 0.9, // Slightly harder in later lines
        addressable_patients: lotPatients,
        pricing_premium_pct: 5, // Modest additional premium for unmet need
      });
    } else if (isFirstLine) {
      const lotFactor = 0.55;
      const lotPatients = Math.round(biomarkerPatients * lotFactor);
      levels.push({
        name: 'First-line (1L)',
        prevalence_pct: Math.round(lotFactor * 100),
        loa_modifier: 1.1, // Slightly easier in first line
        addressable_patients: lotPatients,
        pricing_premium_pct: 0,
      });
    }
  }

  // Calculate effective values after all nesting levels
  const finalLevel = levels[levels.length - 1];
  const totalAddressable = finalLevel.addressable_patients;

  // Effective LoA = base LoA * product of all level modifiers
  const effectiveLoa = Math.min(
    1.0,
    levels.reduce((loa, lvl) => loa * lvl.loa_modifier, baseLoa),
  );

  // Build narrative
  const narrativeParts: string[] = [];
  narrativeParts.push(
    `Starting from ${indication.name} (${addressablePatients.toLocaleString()} addressable patients).`,
  );

  if (detectedBiomarker && levels.length > 1) {
    const bmLevel = levels[1];
    narrativeParts.push(
      `Biomarker nesting: ${bmLevel.name} represents ${bmLevel.prevalence_pct}% of the addressable population ` +
        `(${bmLevel.addressable_patients.toLocaleString()} patients). ` +
        `Biomarker-selected trial design boosts LoA by ${((bmLevel.loa_modifier - 1) * 100).toFixed(0)}% ` +
        `and supports a ${bmLevel.pricing_premium_pct}% pricing premium.`,
    );
    if (levels.length > 2) {
      const lotLevel = levels[2];
      narrativeParts.push(
        `${lotLevel.name} further narrows to ${lotLevel.prevalence_pct}% of biomarker-positive patients ` +
          `(${lotLevel.addressable_patients.toLocaleString()} patients).`,
      );
    }
  } else {
    narrativeParts.push('No biomarker nesting applied. Population addressed at the full indication level.');
  }

  narrativeParts.push(
    `Effective LoA after nesting: ${(effectiveLoa * 100).toFixed(1)}%. ` +
      `Total addressable after nesting: ${totalAddressable.toLocaleString()} patients.`,
  );

  return {
    indication: indication.name,
    levels,
    total_addressable_after_nesting: totalAddressable,
    effective_loa: parseFloat(effectiveLoa.toFixed(4)),
    narrative: narrativeParts.join(' '),
  };
}

// ────────────────────────────────────────────────────────────
// INTEGRATED REVENUE PROJECTION
// Merges base revenue projection with payer mix, competitive
// response, IRA impact, and biosimilar erosion into a single
// annual row showing all adjustment factors and net revenue.
// ────────────────────────────────────────────────────────────

function buildIntegratedProjection(
  baseProjection: RevenueProjectionYear[],
  payerMix: PayerMixEvolution[],
  competitiveResponse: CompetitiveResponseModel[],
  iraImpact: IRAImpact | undefined,
  biosimilarErosion: BiosimilarErosionCurve,
  patientFunnel: PatientFunnel,
  shareRange: { low: number; base: number; high: number },
  therapyArea: string,
): IntegratedRevenueYear[] {
  // Build S-curve adoption ramp for cumulative patient calculation
  const adoptionRamp = buildSCurveRamp(therapyArea, baseProjection.length);

  // Determine LOE start year (biosimilar erosion begins after patent expiry)
  // Approximate: LOE occurs at year 8 of a 10-year projection
  const loeStartIndex = Math.max(0, baseProjection.length - biosimilarErosion.years_post_loe.length);

  return baseProjection.map((yr, i) => {
    // Gross revenue is the unadjusted base scenario
    const grossRevenue = yr.base;

    // Payer mix factor for this year (fallback to 1.0 if missing)
    const payerYear = payerMix.find((p) => p.year === yr.year);
    const payerMixFactor = payerYear ? payerYear.blended_net_price_factor : 1.0;

    // Competitive erosion for this year
    const compYear = competitiveResponse.find((c) => c.year === yr.year);
    const competitiveErosionPct = compYear ? compYear.price_erosion_pct + compYear.share_erosion_pct : 0;

    // IRA reduction for this year
    let iraReductionPct = 0;
    if (iraImpact && yr.year >= iraImpact.negotiation_year) {
      iraReductionPct = Math.round(iraImpact.medicare_revenue_share * iraImpact.price_reduction_pct * 100);
    }

    // Biosimilar erosion for this year
    let biosimilarErosionPct = 0;
    if (i >= loeStartIndex) {
      const yearsPostLoe = i - loeStartIndex;
      const erosionIdx = Math.min(yearsPostLoe, biosimilarErosion.share_retained_pct.length - 1);
      const shareRetained = biosimilarErosion.share_retained_pct[erosionIdx];
      biosimilarErosionPct = 100 - shareRetained;
    }

    // Apply all factors multiplicatively to each scenario
    const adjustmentFactor =
      payerMixFactor *
      (1 - competitiveErosionPct / 100) *
      (1 - iraReductionPct / 100) *
      (1 - biosimilarErosionPct / 100);

    const clampedFactor = Math.max(0, adjustmentFactor);

    const netRevenueBear = Math.round(yr.bear * clampedFactor);
    const netRevenueBase = Math.round(yr.base * clampedFactor);
    const netRevenueBull = Math.round(yr.bull * clampedFactor);

    // Cumulative patients treated: patient funnel addressable * share * adoption curve
    const adoptionFactor = adoptionRamp[i] ?? 0;
    const cumulativePatientsTreated = Math.round(
      patientFunnel.addressable * shareRange.base * adoptionFactor * (i + 1),
    );

    return {
      year: yr.year,
      gross_revenue_m: grossRevenue,
      payer_mix_factor: parseFloat(payerMixFactor.toFixed(3)),
      competitive_erosion_pct: competitiveErosionPct,
      ira_reduction_pct: iraReductionPct,
      biosimilar_erosion_pct: biosimilarErosionPct,
      net_revenue_bear_m: netRevenueBear,
      net_revenue_base_m: netRevenueBase,
      net_revenue_bull_m: netRevenueBull,
      cumulative_patients_treated: cumulativePatientsTreated,
    };
  });
}

// ────────────────────────────────────────────────────────────
// TWO-VARIABLE INTERACTION SENSITIVITY
// Tests the 3 most impactful sensitivity variable pairs
// simultaneously to reveal non-linear interactions.
// ────────────────────────────────────────────────────────────

function buildSensitivityInteractions(
  baseSomM: number,
  sensitivityDrivers: SensitivityDriver[],
): SensitivityInteraction[] {
  // Sensitivity drivers are already sorted by swing magnitude (largest first).
  // Take the top 3 most impactful variables.
  const topDrivers = sensitivityDrivers.slice(0, 3);
  if (topDrivers.length < 2) return [];

  const interactions: SensitivityInteraction[] = [];

  // Generate all unique pairs from the top 3
  for (let a = 0; a < topDrivers.length; a++) {
    for (let b = a + 1; b < topDrivers.length; b++) {
      const driverA = topDrivers[a];
      const driverB = topDrivers[b];

      // Calculate individual multipliers relative to base
      const aLowMult = driverA.low_som_m / driverA.base_som_m;
      const aHighMult = driverA.high_som_m / driverA.base_som_m;
      const bLowMult = driverB.low_som_m / driverB.base_som_m;
      const bHighMult = driverB.high_som_m / driverB.base_som_m;

      // Combined effects: multiply the individual factors (assumes independence)
      const scenarios: Array<{
        scenario: 'both_low' | 'both_high' | 'a_low_b_high' | 'a_high_b_low';
        multiplier: number;
      }> = [
        { scenario: 'both_low', multiplier: aLowMult * bLowMult },
        { scenario: 'both_high', multiplier: aHighMult * bHighMult },
        { scenario: 'a_low_b_high', multiplier: aLowMult * bHighMult },
        { scenario: 'a_high_b_low', multiplier: aHighMult * bLowMult },
      ];

      for (const { scenario, multiplier } of scenarios) {
        const somM = Math.round(baseSomM * multiplier);
        const deltaVsBasePct = parseFloat((((somM - baseSomM) / baseSomM) * 100).toFixed(1));

        interactions.push({
          variable_a: driverA.variable,
          variable_b: driverB.variable,
          scenario,
          som_m: somM,
          delta_vs_base_pct: deltaVsBasePct,
        });
      }
    }
  }

  return interactions;
}

// ────────────────────────────────────────────────────────────
// CROSS-ENGINE SIGNALS
// Outputs signals that feed other Terrain engines (competitive,
// regulatory, partner discovery) for coherent cross-analysis.
// ────────────────────────────────────────────────────────────

// Stage-based estimates of months from current stage to approval
const STAGE_TO_APPROVAL_MONTHS: Record<string, number> = {
  preclinical: 96, // ~8 years
  phase1: 72, // ~6 years
  phase2: 42, // ~3.5 years
  phase3: 18, // ~1.5 years
  approved: 0,
};

function buildCrossEngineSignals(
  competitorCount: number,
  developmentStage: DevelopmentStage,
  loa: number,
): CrossEngineSignals {
  // competitive_crowding_for_share: 1-10 scale based on competitor count
  let crowding: number;
  if (competitorCount <= 1) crowding = 2;
  else if (competitorCount <= 3) crowding = 4;
  else if (competitorCount <= 5) crowding = 6;
  else if (competitorCount <= 8) crowding = 7;
  else if (competitorCount <= 12) crowding = 8;
  else crowding = 9;

  // regulatory_timeline_for_revenue_start: months from current stage to approval
  const timelineMonths = STAGE_TO_APPROVAL_MONTHS[developmentStage] ?? 60;

  // loa_for_risk_adjustment: the LoA value already calculated
  const loaValue = loa;

  // partner_urgency_from_competition: if >5 competitors urgency=8, >8 very high=10
  let partnerUrgency: number;
  if (competitorCount > 8) partnerUrgency = 10;
  else if (competitorCount > 5) partnerUrgency = 8;
  else if (competitorCount > 3) partnerUrgency = 6;
  else if (competitorCount > 1) partnerUrgency = 4;
  else partnerUrgency = 2;

  return {
    competitive_crowding_for_share: crowding,
    regulatory_timeline_for_revenue_start: timelineMonths,
    loa_for_risk_adjustment: parseFloat(loaValue.toFixed(4)),
    partner_urgency_from_competition: partnerUrgency,
  };
}

// ────────────────────────────────────────────────────────────
// PERCENTILE PROJECTIONS (P10/P25/P50/P75/P90)
// Builds confidence interval bands around base-case revenue
// using sensitivity driver swing magnitudes.
// ────────────────────────────────────────────────────────────

function buildPercentileProjections(
  revenueProjection: RevenueProjectionYear[],
  sensitivityDrivers: SensitivityDriver[],
): PercentileProjection[] {
  if (sensitivityDrivers.length === 0) return [];

  // Compute max negative and positive swings as fractions
  let maxNegativeSwing = 0;
  let maxPositiveSwing = 0;

  for (const driver of sensitivityDrivers) {
    if (driver.base_som_m === 0) continue;
    const negativeDelta = Math.abs((driver.base_som_m - driver.low_som_m) / driver.base_som_m);
    const positiveDelta = Math.abs((driver.high_som_m - driver.base_som_m) / driver.base_som_m);
    if (negativeDelta > maxNegativeSwing) maxNegativeSwing = negativeDelta;
    if (positiveDelta > maxPositiveSwing) maxPositiveSwing = positiveDelta;
  }

  return revenueProjection.map((yr) => {
    const base = yr.base;
    const p10 = Math.max(0, base * (1 - maxNegativeSwing * 1.5));
    const p25 = base * (1 - maxNegativeSwing * 0.75);
    const p75 = base * (1 + maxPositiveSwing * 0.75);
    const p90 = base * (1 + maxPositiveSwing * 1.5);

    return {
      year: yr.year,
      p10: Math.round(p10),
      p25: Math.round(p25),
      p50: Math.round(base),
      p75: Math.round(p75),
      p90: Math.round(p90),
    };
  });
}

// ────────────────────────────────────────────────────────────
// TREATMENT LINE MODEL (1L/2L/3L+)
// Patient attrition and share ceilings by line of therapy,
// calibrated per therapy area.
// ────────────────────────────────────────────────────────────

const TREATMENT_LINE_ATTRITION: Record<
  string,
  {
    '1L_to_2L': number;
    '2L_to_3L': number;
    '1L_ceiling': number;
    '2L_ceiling': number;
    '3L_ceiling': number;
    '2L_price_mult': number;
    '3L_price_mult': number;
  }
> = {
  oncology: {
    '1L_to_2L': 0.5,
    '2L_to_3L': 0.6,
    '1L_ceiling': 0.3,
    '2L_ceiling': 0.2,
    '3L_ceiling': 0.12,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.1,
  },
  neurology: {
    '1L_to_2L': 0.35,
    '2L_to_3L': 0.55,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
  rare_disease: {
    '1L_to_2L': 0.25,
    '2L_to_3L': 0.45,
    '1L_ceiling': 0.35,
    '2L_ceiling': 0.25,
    '3L_ceiling': 0.15,
    '2L_price_mult': 1.05,
    '3L_price_mult': 1.15,
  },
  immunology: {
    '1L_to_2L': 0.4,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  cardiovascular: {
    '1L_to_2L': 0.3,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.12,
    '3L_ceiling': 0.06,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  metabolic: {
    // GLP-1/SGLT2 class — high 1L penetration, moderate attrition
    '1L_to_2L': 0.35,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  psychiatry: {
    // High switching rates, treatment resistance common
    '1L_to_2L': 0.5,
    '2L_to_3L': 0.55,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.1,
    '3L_price_mult': 1.2,
  },
  pain_management: {
    // Step-therapy mandated by payers
    '1L_to_2L': 0.55,
    '2L_to_3L': 0.6,
    '1L_ceiling': 0.15,
    '2L_ceiling': 0.12,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.05,
    '3L_price_mult': 1.15,
  },
  infectious_disease: {
    // Cure-based — minimal LOT concept for most
    '1L_to_2L': 0.2,
    '2L_to_3L': 0.4,
    '1L_ceiling': 0.35,
    '2L_ceiling': 0.2,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.1,
  },
  hematology: {
    // Gene therapy / factor replacement — limited LOT
    '1L_to_2L': 0.3,
    '2L_to_3L': 0.45,
    '1L_ceiling': 0.3,
    '2L_ceiling': 0.2,
    '3L_ceiling': 0.12,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.1,
  },
  ophthalmology: {
    // Anti-VEGF — minimal LOT switching
    '1L_to_2L': 0.25,
    '2L_to_3L': 0.45,
    '1L_ceiling': 0.3,
    '2L_ceiling': 0.18,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  pulmonology: {
    // Biologic step-up from ICS/LABA
    '1L_to_2L': 0.4,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
  nephrology: {
    // Limited treatment options — low switching
    '1L_to_2L': 0.3,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
  dermatology: {
    // Biologic cycling common (IL-17 → IL-23 → JAK)
    '1L_to_2L': 0.4,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.18,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  gastroenterology: {
    // IBD step-through: anti-TNF → vedolizumab → JAK
    '1L_to_2L': 0.45,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
  hepatology: {
    // HCV cure-based; NASH chronic
    '1L_to_2L': 0.2,
    '2L_to_3L': 0.4,
    '1L_ceiling': 0.3,
    '2L_ceiling': 0.18,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
  endocrinology: {
    // Insulin/GLP-1 titration, moderate switching
    '1L_to_2L': 0.35,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  musculoskeletal: {
    // Anti-TNF cycling + biosimilar switching
    '1L_to_2L': 0.4,
    '2L_to_3L': 0.5,
    '1L_ceiling': 0.2,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.08,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.0,
  },
  default: {
    '1L_to_2L': 0.4,
    '2L_to_3L': 0.55,
    '1L_ceiling': 0.25,
    '2L_ceiling': 0.15,
    '3L_ceiling': 0.1,
    '2L_price_mult': 1.0,
    '3L_price_mult': 1.05,
  },
};

function buildTreatmentLineModel(
  indication: string,
  addressablePatients: number,
  patientSegment?: string,
): TreatmentLineModel[] {
  const therapyAreaLower = indication.toLowerCase();
  const attrition = TREATMENT_LINE_ATTRITION[therapyAreaLower] ?? TREATMENT_LINE_ATTRITION.default;

  // Detect specific line from patientSegment
  const segText = (patientSegment ?? '').toLowerCase();
  let detectedLine: '1L' | '2L' | '3L+' | null = null;

  if (/\b(1L|first[- ]line)\b/i.test(segText)) {
    detectedLine = '1L';
  } else if (/\b(2L|second[- ]line)\b/i.test(segText)) {
    detectedLine = '2L';
  } else if (/\b(3L|third[- ]line|later[- ]line)\b/i.test(segText)) {
    detectedLine = '3L+';
  }

  const patients1L = addressablePatients;
  const patients2L = Math.round(patients1L * (1 - attrition['1L_to_2L']));
  const patients3L = Math.round(patients2L * (1 - attrition['2L_to_3L']));

  const allLines: TreatmentLineModel[] = [
    {
      line: '1L',
      patient_count: patients1L,
      share_ceiling: attrition['1L_ceiling'],
      attrition_from_prior_line: 0,
      pricing_multiplier: 1.0,
      narrative: `First-line: ${patients1L.toLocaleString()} addressable patients. Share ceiling ${(attrition['1L_ceiling'] * 100).toFixed(0)}% reflects competitive dynamics in frontline setting.`,
    },
    {
      line: '2L',
      patient_count: patients2L,
      share_ceiling: attrition['2L_ceiling'],
      attrition_from_prior_line: attrition['1L_to_2L'],
      pricing_multiplier: attrition['2L_price_mult'],
      narrative: `Second-line: ${patients2L.toLocaleString()} patients after ${(attrition['1L_to_2L'] * 100).toFixed(0)}% attrition from 1L. Share ceiling ${(attrition['2L_ceiling'] * 100).toFixed(0)}%.`,
    },
    {
      line: '3L+',
      patient_count: patients3L,
      share_ceiling: attrition['3L_ceiling'],
      attrition_from_prior_line: attrition['2L_to_3L'],
      pricing_multiplier: attrition['3L_price_mult'],
      narrative: `Third-line+: ${patients3L.toLocaleString()} patients after ${(attrition['2L_to_3L'] * 100).toFixed(0)}% attrition from 2L. Share ceiling ${(attrition['3L_ceiling'] * 100).toFixed(0)}%. Pricing multiplier ${attrition['3L_price_mult']}x.`,
    },
  ];

  if (detectedLine) {
    return allLines.filter((l) => l.line === detectedLine);
  }

  return allLines;
}

// ────────────────────────────────────────────────────────────
// NON-LINEAR COMPETITIVE EROSION
// Diminishing share loss per additional competitor, with
// mechanism-overlap amplification.
// ────────────────────────────────────────────────────────────

const BASE_EROSION_PER_COMPETITOR = [0.22, 0.12, 0.08, 0.05, 0.03, 0.03, 0.02, 0.02];
const MAX_CUMULATIVE_EROSION = 0.6;

function buildNonLinearCompetitiveErosion(
  competitorCount: number,
  mechanism: string | undefined,
  competitorMechanisms?: string[],
): NonLinearCompetitiveErosion[] {
  const results: NonLinearCompetitiveErosion[] = [];
  let cumulativeLoss = 0;
  const mechLower = (mechanism ?? '').toLowerCase();

  for (let i = 0; i < competitorCount; i++) {
    const baseErosion =
      BASE_EROSION_PER_COMPETITOR[i] ?? BASE_EROSION_PER_COMPETITOR[BASE_EROSION_PER_COMPETITOR.length - 1];

    // Check mechanism overlap
    let mechanismOverlap = false;
    if (mechLower && competitorMechanisms && competitorMechanisms[i]) {
      mechanismOverlap =
        competitorMechanisms[i].toLowerCase().includes(mechLower) ||
        mechLower.includes(competitorMechanisms[i].toLowerCase());
    }

    const erosion = mechanismOverlap ? baseErosion * 1.3 : baseErosion;
    cumulativeLoss = Math.min(MAX_CUMULATIVE_EROSION, cumulativeLoss + erosion);

    results.push({
      competitor_number: i + 1,
      share_loss_pct: parseFloat((erosion * 100).toFixed(1)),
      cumulative_share_loss_pct: parseFloat((cumulativeLoss * 100).toFixed(1)),
      mechanism_overlap: mechanismOverlap,
    });
  }

  return results;
}

// ────────────────────────────────────────────────────────────
// MECHANISM-BASED COMPETITIVE RESPONSE
// Investment-bank grade mechanism similarity scoring.
// Replaces flat per-entrant erosion with mechanism-aware logic:
//   Same mechanism class:       25-35% erosion per entrant
//   Same target, diff modality: 15-20% erosion per entrant
//   Same pathway:               10-15% erosion per entrant
//   Different mechanism:        3-5% erosion (may expand market)
// Source: IQVIA competitive dynamics, Ambrosia Ventures deal DB
// ────────────────────────────────────────────────────────────

// Erosion ranges by mechanism relationship
const MECHANISM_EROSION_RANGES: Record<MechanismRelationship, { low: number; high: number }> = {
  same_mechanism: { low: 0.25, high: 0.35 },
  same_target: { low: 0.15, high: 0.2 },
  same_pathway: { low: 0.1, high: 0.15 },
  different_mechanism: { low: 0.03, high: 0.05 },
};

// Known mechanism -> target -> pathway mappings for similarity scoring
const MECHANISM_TAXONOMY: Record<string, { target: string; pathway: string; modality: string }> = {
  'pd-1 inhibitor': { target: 'PD-1', pathway: 'PD-1/PD-L1', modality: 'mAb' },
  'pd-l1 inhibitor': { target: 'PD-L1', pathway: 'PD-1/PD-L1', modality: 'mAb' },
  'pd-1/lag-3 inhibitor': { target: 'PD-1', pathway: 'PD-1/PD-L1', modality: 'bispecific' },
  'ctla-4 inhibitor': { target: 'CTLA-4', pathway: 'immune checkpoint', modality: 'mAb' },
  'anti-cd38 mab': { target: 'CD38', pathway: 'CD38', modality: 'mAb' },
  'anti-cd20 mab': { target: 'CD20', pathway: 'B-cell depletion', modality: 'mAb' },
  'anti-cd19 mab': { target: 'CD19', pathway: 'B-cell depletion', modality: 'mAb' },
  'btk inhibitor': { target: 'BTK', pathway: 'B-cell receptor', modality: 'small molecule' },
  'bcl-2 inhibitor': { target: 'BCL-2', pathway: 'apoptosis', modality: 'small molecule' },
  'kras g12c inhibitor': { target: 'KRAS G12C', pathway: 'RAS/MAPK', modality: 'small molecule' },
  'kras inhibitor': { target: 'KRAS', pathway: 'RAS/MAPK', modality: 'small molecule' },
  'egfr inhibitor': { target: 'EGFR', pathway: 'EGFR/HER', modality: 'small molecule' },
  'egfr tki': { target: 'EGFR', pathway: 'EGFR/HER', modality: 'small molecule' },
  'her2 inhibitor': { target: 'HER2', pathway: 'EGFR/HER', modality: 'mAb' },
  'alk inhibitor': { target: 'ALK', pathway: 'ALK/ROS1', modality: 'small molecule' },
  'ros1 inhibitor': { target: 'ROS1', pathway: 'ALK/ROS1', modality: 'small molecule' },
  'braf inhibitor': { target: 'BRAF', pathway: 'RAS/MAPK', modality: 'small molecule' },
  'mek inhibitor': { target: 'MEK', pathway: 'RAS/MAPK', modality: 'small molecule' },
  'jak inhibitor': { target: 'JAK', pathway: 'JAK/STAT', modality: 'small molecule' },
  'jak1 inhibitor': { target: 'JAK1', pathway: 'JAK/STAT', modality: 'small molecule' },
  'jak2 inhibitor': { target: 'JAK2', pathway: 'JAK/STAT', modality: 'small molecule' },
  'tnf inhibitor': { target: 'TNF-alpha', pathway: 'TNF', modality: 'mAb' },
  'anti-tnf': { target: 'TNF-alpha', pathway: 'TNF', modality: 'mAb' },
  'anti-il-6': { target: 'IL-6', pathway: 'IL-6/JAK/STAT', modality: 'mAb' },
  'il-6 inhibitor': { target: 'IL-6', pathway: 'IL-6/JAK/STAT', modality: 'mAb' },
  'anti-il-17': { target: 'IL-17', pathway: 'IL-17/IL-23', modality: 'mAb' },
  'il-17 inhibitor': { target: 'IL-17', pathway: 'IL-17/IL-23', modality: 'mAb' },
  'anti-il-23': { target: 'IL-23', pathway: 'IL-17/IL-23', modality: 'mAb' },
  'il-23 inhibitor': { target: 'IL-23', pathway: 'IL-17/IL-23', modality: 'mAb' },
  'anti-il-4/il-13': { target: 'IL-4/IL-13', pathway: 'type 2 inflammation', modality: 'mAb' },
  'anti-il-5': { target: 'IL-5', pathway: 'type 2 inflammation', modality: 'mAb' },
  'anti-il-13': { target: 'IL-13', pathway: 'type 2 inflammation', modality: 'mAb' },
  'anti-vegf': { target: 'VEGF', pathway: 'VEGF/angiogenesis', modality: 'mAb' },
  'vegfr inhibitor': { target: 'VEGFR', pathway: 'VEGF/angiogenesis', modality: 'small molecule' },
  'vegf trap': { target: 'VEGF', pathway: 'VEGF/angiogenesis', modality: 'fusion protein' },
  'parp inhibitor': { target: 'PARP', pathway: 'DNA damage repair', modality: 'small molecule' },
  'cdk4/6 inhibitor': { target: 'CDK4/6', pathway: 'cell cycle', modality: 'small molecule' },
  'pi3k inhibitor': { target: 'PI3K', pathway: 'PI3K/AKT/mTOR', modality: 'small molecule' },
  'mtor inhibitor': { target: 'mTOR', pathway: 'PI3K/AKT/mTOR', modality: 'small molecule' },
  'sglt2 inhibitor': { target: 'SGLT2', pathway: 'renal glucose transport', modality: 'small molecule' },
  'glp-1 agonist': { target: 'GLP-1R', pathway: 'incretin', modality: 'peptide' },
  'glp-1/gip agonist': { target: 'GLP-1R/GIPR', pathway: 'incretin', modality: 'peptide' },
  'dpp-4 inhibitor': { target: 'DPP-4', pathway: 'incretin', modality: 'small molecule' },
  'car-t': { target: 'variable', pathway: 'adoptive cell therapy', modality: 'cell therapy' },
  'car-t (cd19)': { target: 'CD19', pathway: 'adoptive cell therapy', modality: 'cell therapy' },
  'car-t (bcma)': { target: 'BCMA', pathway: 'adoptive cell therapy', modality: 'cell therapy' },
  'bispecific (bcmaxcd3)': { target: 'BCMA', pathway: 'T-cell engager', modality: 'bispecific' },
  'bispecific (gprc5dxcd3)': { target: 'GPRC5D', pathway: 'T-cell engager', modality: 'bispecific' },
  'bispecific (cd20xcd3)': { target: 'CD20', pathway: 'T-cell engager', modality: 'bispecific' },
  'adc (her2)': { target: 'HER2', pathway: 'EGFR/HER', modality: 'ADC' },
  'adc (trop-2)': { target: 'Trop-2', pathway: 'ADC payload delivery', modality: 'ADC' },
  'adc (nectin-4)': { target: 'Nectin-4', pathway: 'ADC payload delivery', modality: 'ADC' },
  'adc (cd30)': { target: 'CD30', pathway: 'ADC payload delivery', modality: 'ADC' },
  'adc (cd79b)': { target: 'CD79b', pathway: 'ADC payload delivery', modality: 'ADC' },
  'adc (fra)': { target: 'FRa', pathway: 'ADC payload delivery', modality: 'ADC' },
  'anti-cgrp': { target: 'CGRP', pathway: 'CGRP', modality: 'mAb' },
  'cgrp receptor antagonist': { target: 'CGRP receptor', pathway: 'CGRP', modality: 'small molecule' },
  'complement inhibitor': { target: 'C5', pathway: 'complement', modality: 'mAb' },
  'anti-c5': { target: 'C5', pathway: 'complement', modality: 'mAb' },
  'gene therapy': { target: 'variable', pathway: 'gene replacement', modality: 'gene therapy' },
  'enzyme replacement': { target: 'variable', pathway: 'enzyme replacement', modality: 'biologic' },
  'antisense oligonucleotide': { target: 'variable', pathway: 'RNA modulation', modality: 'oligonucleotide' },
  sirna: { target: 'variable', pathway: 'RNA modulation', modality: 'oligonucleotide' },
  mrna: { target: 'variable', pathway: 'RNA modulation', modality: 'mRNA' },
};

/**
 * Look up mechanism taxonomy entry via fuzzy matching.
 * Normalizes the input mechanism string and tries exact then partial matches.
 */
function lookupMechanismTaxonomy(mechanism: string): { target: string; pathway: string; modality: string } | undefined {
  const m = mechanism.toLowerCase().trim();
  // Exact match
  if (MECHANISM_TAXONOMY[m]) return MECHANISM_TAXONOMY[m];
  // Partial match: find the longest key that's contained in the input
  let bestMatch: string | undefined;
  let bestLen = 0;
  for (const key of Object.keys(MECHANISM_TAXONOMY)) {
    if (m.includes(key) && key.length > bestLen) {
      bestMatch = key;
      bestLen = key.length;
    }
  }
  if (bestMatch) return MECHANISM_TAXONOMY[bestMatch];
  // Reverse: check if any key contains the input
  for (const key of Object.keys(MECHANISM_TAXONOMY)) {
    if (key.includes(m) && m.length > 3) return MECHANISM_TAXONOMY[key];
  }
  return undefined;
}

/**
 * Score mechanism similarity between user's mechanism and a competitor's mechanism.
 * Returns relationship type and similarity score (0-1).
 */
function scoreMechanismSimilarity(
  userMechanism: string,
  competitorMechanism: string,
): { relationship: MechanismRelationship; similarity: number } {
  const userTax = lookupMechanismTaxonomy(userMechanism);
  const compTax = lookupMechanismTaxonomy(competitorMechanism);

  // If we can't classify either mechanism, fall back to string similarity
  if (!userTax || !compTax) {
    const uLower = userMechanism.toLowerCase();
    const cLower = competitorMechanism.toLowerCase();
    const uTokens = uLower.split(/[\s_\-/()]+/).filter((t) => t.length > 2);
    const cTokens = cLower.split(/[\s_\-/()]+/).filter((t) => t.length > 2);
    const overlap = uTokens.filter((t) => cTokens.some((ct) => ct.includes(t) || t.includes(ct)));
    if (overlap.length >= 2) return { relationship: 'same_mechanism', similarity: 0.85 };
    if (overlap.length === 1) return { relationship: 'same_pathway', similarity: 0.4 };
    return { relationship: 'different_mechanism', similarity: 0.1 };
  }

  // Both classified — compare at each level
  // Same mechanism class (e.g., both "PD-1 inhibitor")
  if (userTax.target === compTax.target && userTax.modality === compTax.modality) {
    return { relationship: 'same_mechanism', similarity: 0.95 };
  }

  // Same target, different modality (e.g., PD-1 mAb vs PD-1 bispecific)
  if (userTax.target === compTax.target && userTax.modality !== compTax.modality) {
    return { relationship: 'same_target', similarity: 0.7 };
  }

  // Same pathway (e.g., PD-1 vs PD-L1, both in PD-1/PD-L1 pathway)
  if (userTax.pathway === compTax.pathway) {
    return { relationship: 'same_pathway', similarity: 0.45 };
  }

  // Different mechanism entirely
  return { relationship: 'different_mechanism', similarity: 0.1 };
}

/**
 * Extract mechanism class from a competitor name string like "Keytruda (pembrolizumab, MSD)"
 * by cross-referencing with PRICING_BENCHMARKS.
 */
function extractCompetitorMechanism(competitorName: string): string | undefined {
  const nameLower = competitorName.toLowerCase();
  // Try matching against pricing benchmarks drug names
  for (const benchmark of PRICING_BENCHMARKS) {
    const drugLower = benchmark.drug_name.toLowerCase();
    if (nameLower.includes(drugLower) || drugLower.includes(nameLower.split('(')[0].trim())) {
      return benchmark.mechanism_class;
    }
  }

  // Try matching generic name in parentheses
  const parenMatch = competitorName.match(/\(([^,)]+)/);
  if (parenMatch) {
    const genericName = parenMatch[1].toLowerCase().trim();
    for (const benchmark of PRICING_BENCHMARKS) {
      if (benchmark.drug_name.toLowerCase().includes(genericName)) {
        return benchmark.mechanism_class;
      }
    }
  }

  return undefined;
}

/**
 * Build mechanism-based competitive analysis.
 * Scores each competitor by mechanism similarity and calculates
 * mechanism-weighted cumulative erosion.
 */
function buildCompetitiveMechanismAnalysis(
  userMechanism: string | undefined,
  competitors: string[],
  therapyArea: string,
): CompetitiveMechanismAnalysis {
  if (!userMechanism || competitors.length === 0) {
    return {
      competitors: [],
      overall_mechanism_crowding: 'low',
      mechanism_weighted_erosion_pct: 0,
      differentiation_narrative:
        'Insufficient mechanism data for competitive similarity analysis. Default flat erosion applied.',
    };
  }

  const analyzed: CompetitiveMechanismAnalysis['competitors'] = [];
  let cumulativeErosion = 0;
  let sameMechCount = 0;
  let sameTargetCount = 0;

  for (const comp of competitors) {
    const compMechanism = extractCompetitorMechanism(comp);
    if (!compMechanism) {
      // Unknown mechanism — treat as different mechanism with minimal erosion
      const erosionPct = 4.0; // midpoint of 3-5%
      cumulativeErosion += erosionPct;
      analyzed.push({
        name: comp.split('(')[0].trim(),
        mechanism: 'Unknown',
        similarity_score: 0.1,
        relationship: 'different_mechanism',
        erosion_impact_pct: erosionPct,
        market_effect: 'mixed',
      });
      continue;
    }

    const { relationship, similarity } = scoreMechanismSimilarity(userMechanism, compMechanism);
    const erosionRange = MECHANISM_EROSION_RANGES[relationship];
    // Use similarity to interpolate within the erosion range
    const erosionPct = parseFloat(
      ((erosionRange.low + (erosionRange.high - erosionRange.low) * similarity) * 100).toFixed(1),
    );

    // Determine market effect
    let marketEffect: 'cannibalistic' | 'additive' | 'mixed';
    if (relationship === 'same_mechanism' || relationship === 'same_target') {
      marketEffect = 'cannibalistic';
      if (relationship === 'same_mechanism') sameMechCount++;
      else sameTargetCount++;
    } else if (relationship === 'different_mechanism') {
      marketEffect = 'additive';
    } else {
      marketEffect = 'mixed';
    }

    // Diminishing returns: each additional same-mechanism competitor has 15% less marginal impact
    const sameTypeCount = sameMechCount + sameTargetCount;
    const diminishingFactor = sameTypeCount > 1 ? Math.pow(0.85, sameTypeCount - 1) : 1.0;
    const adjustedErosion = parseFloat((erosionPct * diminishingFactor).toFixed(1));

    cumulativeErosion += adjustedErosion;

    analyzed.push({
      name: comp.split('(')[0].trim(),
      mechanism: compMechanism,
      similarity_score: parseFloat(similarity.toFixed(2)),
      relationship,
      erosion_impact_pct: adjustedErosion,
      market_effect: marketEffect,
    });
  }

  // Cap cumulative erosion at 70% (some market always remains for differentiated products)
  cumulativeErosion = Math.min(70, cumulativeErosion);

  // Determine overall crowding
  let crowding: CompetitiveMechanismAnalysis['overall_mechanism_crowding'];
  if (sameMechCount >= 3 || cumulativeErosion > 50) {
    crowding = 'high';
  } else if (sameMechCount >= 1 || sameTargetCount >= 2 || cumulativeErosion > 25) {
    crowding = 'moderate';
  } else {
    crowding = 'low';
  }

  // Build differentiation narrative
  let narrative: string;
  if (crowding === 'high') {
    narrative =
      `High mechanism crowding detected: ${sameMechCount} same-mechanism competitor(s) ` +
      `and ${sameTargetCount} same-target competitor(s) in ${therapyArea}. ` +
      `Cumulative mechanism-weighted erosion of ${cumulativeErosion.toFixed(0)}% projected. ` +
      `Differentiation on efficacy, safety profile, dosing convenience, or combination potential is critical ` +
      `to sustain pricing and market share. Consider biomarker-selected subpopulations for positioning.`;
  } else if (crowding === 'moderate') {
    narrative =
      `Moderate mechanism crowding: ${sameMechCount + sameTargetCount} competitor(s) share mechanism similarity. ` +
      `${analyzed.filter((c) => c.market_effect === 'additive').length} competitor(s) target different mechanisms ` +
      `and may expand the overall market. Mechanism-weighted erosion of ${cumulativeErosion.toFixed(0)}% projected. ` +
      `Targeted differentiation on clinical data superiority or patient selection can mitigate competitive pressure.`;
  } else {
    narrative =
      `Low mechanism crowding: most competitors operate via different mechanisms or pathways. ` +
      `Mechanism-weighted erosion of ${cumulativeErosion.toFixed(0)}% projected, with ` +
      `${analyzed.filter((c) => c.market_effect === 'additive').length} additive competitor(s) that may expand the addressable market. ` +
      `First-in-class or best-in-class positioning is achievable.`;
  }

  return {
    competitors: analyzed,
    overall_mechanism_crowding: crowding,
    mechanism_weighted_erosion_pct: parseFloat(cumulativeErosion.toFixed(1)),
    differentiation_narrative: narrative,
  };
}

// ────────────────────────────────────────────────────────────
// PATENT CLIFF ANALYSIS
// Granular LOE modeling by product type. Replaces generic
// [0.95, 0.82, 0.65] with type-specific erosion profiles:
//   Small molecule:     Paragraph IV cliff -> 80% loss by Year 2
//   Biologic:           Gradual biosimilar -> 55% retained Year 3
//   Cell/gene therapy:  No generic pathway -> 90% retained Year 3
//   Orphan:             7-year exclusivity delay, then gradual
// Source: IQVIA Generic/Biosimilar Council, Amundsen Consulting
// ────────────────────────────────────────────────────────────

// Erosion profiles: multiplier of peak revenue retained, indexed by years post-LOE
const PATENT_CLIFF_PROFILES: Record<string, number[]> = {
  small_molecule: [1.0, 0.4, 0.2, 0.1, 0.08, 0.05], // Sharp generic cliff
  biologic: [1.0, 0.85, 0.7, 0.55, 0.4, 0.3], // Gradual biosimilar erosion
  cell_gene_therapy: [1.0, 0.95, 0.9, 0.87, 0.85, 0.82], // Minimal — no generic pathway
};

// Typical patent life from launch to LOE by product type
const TYPICAL_PATENT_LIFE: Record<string, number> = {
  small_molecule: 13, // NCE 5-year + patents typically give 12-15 years
  biologic: 16, // 12-year biologic exclusivity + patents
  cell_gene_therapy: 20, // No generic pathway; effective exclusivity much longer
};

const ORPHAN_EXCLUSIVITY_YEARS = 7;

/**
 * Build patent cliff analysis with product-type-specific erosion profiles.
 */
function buildPatentCliffAnalysis(
  mechanism: string | undefined,
  launchYear: number,
  hasOrphanDesignation: boolean,
  projectionYears: number = 10,
): PatentCliffAnalysis {
  const productType = detectManufacturingProductType(mechanism);
  const patentLife = TYPICAL_PATENT_LIFE[productType] ?? 13;

  // Calculate estimated LOE year
  let estimatedLoeYear: number;
  let exclusivityType: string;

  if (productType === 'cell_gene_therapy') {
    estimatedLoeYear = launchYear + 20; // Effectively no LOE in projection window
    exclusivityType = 'No generic pathway';
  } else if (hasOrphanDesignation) {
    // Orphan: 7-year exclusivity, then normal erosion
    const orphanExpiryYear = launchYear + ORPHAN_EXCLUSIVITY_YEARS;
    estimatedLoeYear = Math.max(orphanExpiryYear, launchYear + patentLife);
    exclusivityType = `7-year orphan exclusivity (expires ${orphanExpiryYear}) + ${productType === 'biologic' ? '12-year biologic' : 'NCE 5-year + patent'}`;
  } else if (productType === 'biologic') {
    estimatedLoeYear = launchYear + patentLife;
    exclusivityType = '12-year biologic exclusivity + patents';
  } else {
    estimatedLoeYear = launchYear + patentLife;
    exclusivityType = 'NCE 5-year + patent protection';
  }

  // Build erosion profile within the projection window
  const erosionMultipliers = PATENT_CLIFF_PROFILES[productType] ?? PATENT_CLIFF_PROFILES['biologic'];
  const erosionProfile: { year: number; retained_pct: number }[] = [];
  const peakRetained = 100;
  let troughRetained = 100;

  for (let yr = 0; yr < projectionYears; yr++) {
    const calendarYear = launchYear + yr;
    let retainedPct: number;

    if (calendarYear < estimatedLoeYear) {
      // Pre-LOE: full revenue retained
      retainedPct = 100;
    } else {
      // Post-LOE: apply product-specific erosion profile
      const yearsPostLoe = calendarYear - estimatedLoeYear;
      const profileIdx = Math.min(yearsPostLoe, erosionMultipliers.length - 1);
      retainedPct = Math.round(erosionMultipliers[profileIdx] * 100);
    }

    erosionProfile.push({ year: calendarYear, retained_pct: retainedPct });
    troughRetained = Math.min(troughRetained, retainedPct);
  }

  const peakToTroughDecline = peakRetained - troughRetained;

  // Build narrative
  let narrative: string;
  const loeInWindow = estimatedLoeYear <= launchYear + projectionYears;

  if (productType === 'cell_gene_therapy') {
    narrative =
      'Cell/gene therapy has no established generic or biosimilar pathway. Patent cliff risk is minimal ' +
      'within the projection window. Revenue retention projected at 90%+ through Year 10. ' +
      'Key risk is not generic entry but rather next-generation therapies from competing platforms.';
  } else if (!loeInWindow) {
    narrative =
      `LOE estimated at ${estimatedLoeYear}, beyond the ${projectionYears}-year projection window. ` +
      `${exclusivityType} provides protection. Revenue fully retained through the projection period. ` +
      `${hasOrphanDesignation ? 'Orphan drug exclusivity provides additional protection against generic/biosimilar entry. ' : ''}` +
      'Consider extending projections to capture post-LOE dynamics for DCF modeling.';
  } else if (productType === 'small_molecule') {
    narrative =
      `Small molecule LOE projected at ${estimatedLoeYear}. Paragraph IV generic challenge risk is material — ` +
      `expect 60% revenue loss in Year 1 post-LOE, 80% by Year 2. ` +
      `${hasOrphanDesignation ? 'Orphan designation delays generic entry to ' + (launchYear + ORPHAN_EXCLUSIVITY_YEARS) + '. ' : ''}` +
      'Authorized generic strategy may recapture 10-15% of lost share. ' +
      'Consider lifecycle management (extended-release, combinations, new indications) to mitigate cliff.';
  } else {
    narrative =
      `Biologic LOE projected at ${estimatedLoeYear}. Biosimilar entry is gradual — physician switching hesitancy, ` +
      `interchangeability requirements, and rebate dynamics slow erosion. ` +
      `Expect 15% loss Year 1, 30% by Year 2, 45% by Year 3 post-LOE. ` +
      `${hasOrphanDesignation ? 'Orphan designation provides additional protection. ' : ''}` +
      'Next-generation formulation or delivery innovation can defend share against biosimilar entrants.';
  }

  return {
    product_type: productType,
    estimated_loe_year: estimatedLoeYear,
    exclusivity_type: exclusivityType,
    erosion_profile: erosionProfile,
    peak_to_trough_decline_pct: peakToTroughDecline,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// GTN EVOLUTION
// Year-by-year gross-to-net modeling with rebate escalation,
// 340B pressure, and Part B vs D mix effects.
// ────────────────────────────────────────────────────────────

const GTN_BASE_RATES: Record<string, number> = {
  oncology: 0.18,
  rare_disease: 0.08,
  neurology: 0.15,
  immunology: 0.2,
  cardiovascular: 0.22,
  metabolic: 0.25, // High payer pressure (GLP-1s, SGLT2s — large populations, formulary wars)
  psychiatry: 0.28, // Heavy Medicaid mix, state supplemental rebates
  pain_management: 0.3, // Highest rebate pressure — prior auth walls, step therapy, opioid pushback
  infectious_disease: 0.15, // Moderate — vaccines lower GTN, antivirals moderate
  hematology: 0.1, // Low — specialty/orphan pricing, limited formulary negotiation
  ophthalmology: 0.12, // Low — buy-and-bill Part B, limited PBM rebate leverage
  pulmonology: 0.2, // Moderate — large asthma/COPD populations drive payer scrutiny
  nephrology: 0.18, // Moderate — Medicare Part D dominant, IRA price negotiation exposure
  dermatology: 0.22, // Moderate-high — biosimilar pressure on anti-TNF/IL-17
  gastroenterology: 0.22, // Moderate-high — biologics face step-through requirements
  hepatology: 0.18, // Moderate — HCV cured-in-one model; NASH still emerging
  endocrinology: 0.28, // High — insulin/GLP-1 payer wars, IRA exposure, massive populations
  musculoskeletal: 0.24, // Moderate-high — biosimilar competition in anti-TNF class
  default: 0.18,
};

const REBATE_ESCALATION_RATES: Record<string, number> = {
  oncology: 0.015, // Slow escalation — specialty pharmacy, limited formulary competition
  immunology: 0.02, // Moderate — biosimilar entry drives annual ratchet
  rare_disease: 0.01, // Slowest — limited competition, no formulary leverage
  cardiovascular: 0.022, // Moderate — large patient pools, generic competition in adjacencies
  metabolic: 0.025, // Fast — GLP-1/SGLT2 class competition, IRA price negotiation
  neurology: 0.018, // Moderate — specialty distribution, limited biosimilar pressure
  psychiatry: 0.022, // Moderate — Medicaid best-price ratchet, generic step therapy
  pain_management: 0.025, // Fast — payer pushback intensifying, prior auth tightening
  infectious_disease: 0.015, // Slow — vaccines/antivirals have less rebate pressure
  hematology: 0.01, // Slow — orphan/specialty, limited competition
  ophthalmology: 0.012, // Slow — buy-and-bill model, ASP-based pricing
  pulmonology: 0.02, // Moderate — biologic competition in severe asthma
  nephrology: 0.018, // Moderate — Medicare Part D, IRA exposure post-2028
  dermatology: 0.022, // Moderate — IL-17/IL-23 class competition, biosimilar wave
  gastroenterology: 0.022, // Moderate — anti-TNF biosimilars driving class-wide pressure
  hepatology: 0.015, // Slow — HCV declining volumes, NASH still nascent
  endocrinology: 0.028, // Fastest — insulin price caps, GLP-1 payer wars, IRA
  musculoskeletal: 0.02, // Moderate — anti-TNF biosimilar impact
  default: 0.018,
};

function buildGTNEvolution(
  launchYear: number,
  therapyArea: string,
  productType: 'small_molecule' | 'biologic' = 'small_molecule',
  years: number = 10,
): GTNEvolutionYear[] {
  const areaLower = therapyArea.toLowerCase();
  const baseGTN = GTN_BASE_RATES[areaLower] ?? GTN_BASE_RATES.default;
  const rebateRate = REBATE_ESCALATION_RATES[areaLower] ?? REBATE_ESCALATION_RATES.default;
  const is340BOnco = areaLower === 'oncology';

  const results: GTNEvolutionYear[] = [];

  for (let i = 0; i < years; i++) {
    const yearNum = i + 1;

    // Rebate escalation: cumulative annual increase
    const rebateEscalation = rebateRate * i;

    // 340B pressure: 0% years 1-2, then ramp
    let threeFourtyBPressure = 0;
    if (yearNum > 2) {
      const yearsOf340B = yearNum - 2;
      threeFourtyBPressure = is340BOnco ? yearsOf340B * 0.008 : yearsOf340B * 0.005;
    }

    // Part B vs D mix effect
    let partBvsDMix = 0;
    if (productType === 'biologic') {
      // Biologics (IV): ASP-based erosion starting year 3
      if (yearNum >= 3) {
        partBvsDMix = (yearNum - 2) * 0.005;
      }
    } else {
      // Small molecule (oral): Part D competition starting year 5
      if (yearNum >= 5) {
        partBvsDMix = (yearNum - 4) * 0.01;
      }
    }

    // Effective GTN capped at 45%
    const effectiveGTN = Math.min(0.45, baseGTN + rebateEscalation + threeFourtyBPressure + partBvsDMix);

    // Narrative
    const narrativeParts: string[] = [];
    narrativeParts.push(`Year ${yearNum}:`);
    if (rebateEscalation > 0) {
      narrativeParts.push(`rebate escalation adds ${(rebateEscalation * 100).toFixed(1)}pp`);
    }
    if (threeFourtyBPressure > 0) {
      narrativeParts.push(`340B pressure adds ${(threeFourtyBPressure * 100).toFixed(1)}pp`);
    }
    if (partBvsDMix > 0) {
      narrativeParts.push(
        `${productType === 'biologic' ? 'Part B ASP erosion' : 'Part D competition'} adds ${(partBvsDMix * 100).toFixed(1)}pp`,
      );
    }
    if (effectiveGTN >= 0.45) {
      narrativeParts.push('(capped at 45%)');
    }

    results.push({
      year: launchYear + i,
      base_gtn_pct: parseFloat((baseGTN * 100).toFixed(1)),
      rebate_escalation_pct: parseFloat((rebateEscalation * 100).toFixed(1)),
      three_forty_b_pressure_pct: parseFloat((threeFourtyBPressure * 100).toFixed(1)),
      part_b_vs_d_mix_effect: parseFloat((partBvsDMix * 100).toFixed(1)),
      effective_gtn_pct: parseFloat((effectiveGTN * 100).toFixed(1)),
      narrative: narrativeParts.join(' '),
    });
  }

  return results;
}

// ────────────────────────────────────────────────────────────
// EFFICACY SHARE MODIFIER
// Infers differentiation tier from mechanism, patient segment,
// competitor count, and indication to derive a share multiplier.
// ────────────────────────────────────────────────────────────

const EFFICACY_PRECEDENTS: Record<string, string[]> = {
  best_in_class: ['Keytruda (1L PD-L1>=50%)', 'Tagrisso (1L EGFR+)', 'Enhertu (HER2-low)'],
  differentiated: ['Lumakras (KRAS G12C)', 'Alecensa (ALK+)', 'Retevmo (RET+)'],
  comparable: ['Opdivo (2L NSCLC)', 'Tecentriq (1L combo)'],
  me_too: ['Later-line checkpoint inhibitors', '5th+ TKI in indication'],
};

const BIOMARKER_TERMS =
  /\b(egfr|kras|alk|her2|pd[- ]?l1|braf|ntrk|ros1|ret|met|fgfr|pik3ca|msi[- ]?h|tmb[- ]?h|brca|hrd)\b/i;

function buildEfficacyShareModifier(
  mechanism: string | undefined,
  patientSegment: string | undefined,
  competitorCount: number,
  indication: NonNullable<ReturnType<typeof findIndicationByName>>,
): EfficacyShareModifier {
  const mechLower = (mechanism ?? '').toLowerCase();
  const segLower = (patientSegment ?? '').toLowerCase();

  // Determine tier
  const isFirstMechHint = mechLower.includes('first');
  const fewMajorCompetitors = indication.major_competitors.length < 3;
  const hasBiomarkerTerm = BIOMARKER_TERMS.test(segLower);

  let tier: 'best_in_class' | 'differentiated' | 'comparable' | 'me_too';
  let multiplier: number;
  let evidence: string;

  if ((isFirstMechHint || fewMajorCompetitors) && competitorCount < 3) {
    tier = 'best_in_class';
    multiplier = 1.35;
    evidence = `Mechanism positioning ("${mechanism ?? 'N/A'}") and low competitor count (${competitorCount}) indicate best-in-class potential. Fewer than 3 major competitors in ${indication.name}.`;
  } else if (hasBiomarkerTerm || competitorCount < 5) {
    tier = 'differentiated';
    multiplier = 1.15;
    evidence = hasBiomarkerTerm
      ? `Biomarker-selected patient segment ("${patientSegment ?? ''}") provides differentiated positioning with enriched response rates.`
      : `Moderate competition (${competitorCount} competitors) allows for differentiated positioning.`;
  } else if (competitorCount <= 8) {
    tier = 'comparable';
    multiplier = 1.0;
    evidence = `${competitorCount} competitors in ${indication.name} — comparable to existing agents. Differentiation will depend on clinical data quality and label breadth.`;
  } else {
    tier = 'me_too';
    multiplier = 0.8;
    evidence = `Highly crowded space with ${competitorCount} competitors. Without clear differentiation, market share will be constrained by payer and physician switching inertia.`;
  }

  return {
    differentiation_tier: tier,
    share_multiplier: multiplier,
    evidence_basis: evidence,
    comparable_precedents: EFFICACY_PRECEDENTS[tier],
  };
}

// ────────────────────────────────────────────────────────────
// DATA SOURCES
// ────────────────────────────────────────────────────────────
function buildDataSources(indication: NonNullable<ReturnType<typeof findIndicationByName>>): DataSource[] {
  return [
    { name: indication.prevalence_source.split(';')[0].trim(), type: 'public' },
    { name: 'WHO Global Burden of Disease 2024', type: 'public' },
    { name: 'Terrain Drug Pricing Database', type: 'proprietary' },
    { name: 'IQVIA Drug Pricing Benchmarks', type: 'licensed' },
    { name: 'Ambrosia Ventures Transaction Database', type: 'proprietary' },
    { name: 'CMS Medicare Spending Data', type: 'public' },
  ];
}
