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
} from '@/types';

import { findIndicationByName, INDICATION_DATA } from '@/lib/data/indication-map';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { getLikelihoodOfApproval } from '@/lib/data/loa-tables';

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
};
const DEFAULT_S_CURVE = { p: 0.025, q: 0.32 };

// LOE decline factors for years 8-10 post-launch
const LOE_DECLINE = [0.95, 0.82, 0.65];

function buildSCurveRamp(therapyArea: string, years: number = 10): number[] {
  const params = S_CURVE_PARAMS[therapyArea] ?? DEFAULT_S_CURVE;
  const { p, q } = params;

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
// BIOMARKER-SPECIFIC ADDRESSABILITY
// Hardcoded prevalence rates for major biomarker-defined populations
// ────────────────────────────────────────────────────────────

const BIOMARKER_PREVALENCE: Record<string, Record<string, number>> = {
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
};
const DEFAULT_WAC_FALLBACK = 80000;

// ────────────────────────────────────────────────────────────
// MAIN PHARMA CALCULATION FUNCTION
// ────────────────────────────────────────────────────────────
export async function calculateMarketSizing(input: MarketSizingInput): Promise<MarketSizingOutput> {
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
  const rawShareRange = STAGE_SHARE[input.development_stage];
  const addressabilityFactor = estimateAddressabilityFactor(input);

  // Adjust share for competition density
  const competitorCount = indication.major_competitors.length;
  const shareRange = adjustShareForCompetition(rawShareRange, competitorCount);

  const diagnosed = Math.round(indication.us_prevalence * indication.diagnosis_rate);
  const treated = Math.round(diagnosed * indication.treatment_rate);
  const addressable = Math.round(treated * addressabilityFactor);
  const capturable_base = Math.round(addressable * shareRange.base);

  const patientFunnel: PatientFunnel = {
    us_prevalence: indication.us_prevalence,
    us_incidence: indication.us_incidence,
    diagnosed,
    diagnosed_rate: indication.diagnosis_rate,
    treated,
    treated_rate: indication.treatment_rate,
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
  const netPrice = selectedPrice * (1 - therapyGTN);

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
  let revenueProjection = buildRevenueProjection(
    input.launch_year,
    us_som_low,
    us_som_base,
    us_som_high,
    indication.therapy_area,
  );

  // Step 7b: IRA impact modeling
  const iraImpact = computeIRAImpact(input.launch_year, revenueProjection);
  if (iraImpact) {
    revenueProjection = applyIRAToProjection(revenueProjection, iraImpact);
  }

  // Step 8: Peak sales ($M)
  const peakSales = {
    low: parseFloat((us_som_low * 1000).toFixed(0)),
    base: parseFloat((us_som_base * 1000).toFixed(0)),
    high: parseFloat((us_som_high * 1000).toFixed(0)),
  };

  // Step 8b: Risk adjustment (LoA + eNPV) — now with indication-specific calibration
  const loa = getLikelihoodOfApproval(indication.therapy_area, input.development_stage, input.indication);
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

  // Step 9: Competitive context
  const competitiveContext = buildCompetitiveContext(indication);

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
  };
}

// ────────────────────────────────────────────────────────────
// ADDRESSABILITY FACTOR
// ────────────────────────────────────────────────────────────
function estimateAddressabilityFactor(input: MarketSizingInput): number {
  if (!input.patient_segment && !input.subtype) return 0.6;

  const text = `${input.patient_segment ?? ''} ${input.subtype ?? ''}`.toLowerCase();
  const indicationLower = input.indication.toLowerCase();

  // Step 1: Check biomarker-specific prevalence lookup (most accurate)
  const biomarkerData = BIOMARKER_PREVALENCE[indicationLower];
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
  };
  return (
    d[therapyArea] ??
    'Standard commercial payer landscape. Coverage depends on clinical differentiation versus standard of care.'
  );
}

// ────────────────────────────────────────────────────────────
// GEOGRAPHY BREAKDOWN
// ────────────────────────────────────────────────────────────
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

  return geographies
    .map((geo) => {
      const territory = TERRITORY_MULTIPLIERS.find((t) => t.code === geo || t.territory === geo);
      const multiplier = territory?.multiplier ?? 0.5;
      const popM = territory?.population_m ?? 50;
      const prevalencePerM = indication.us_prevalence / usPopM;

      return {
        territory: territory?.territory ?? geo,
        tam: toMetric(usTamBillions * multiplier, multiplier > 0.3 ? 'high' : 'medium'),
        population: popM * 1_000_000,
        prevalence_rate: parseFloat((prevalencePerM / 1_000_000).toFixed(6)),
        market_multiplier: multiplier,
        regulatory_status: regNotes[geo] ?? 'Country-specific regulatory framework.',
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
): RevenueProjectionYear[] {
  // Use therapy-area-specific S-curve if available, else fallback to generic ramp
  const ramp = therapyArea ? buildSCurveRamp(therapyArea, 10) : PHARMA_REVENUE_RAMP;

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
    `Patient Funnel: Prevalence → diagnosed → treated → addressable (segment filter${input.patient_segment ? `: "${input.patient_segment}"` : ': broad'}) → capturable. Biomarker-specific prevalence applied where available.`,
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
    `Competitive Response: Dynamic model projects price erosion (5-15% per new entrant) and share redistribution as competitors launch, calibrated to ${indication.therapy_area} competitive dynamics.`,
    '',
    `Biosimilar/LOE Erosion: Post-LOE revenue decline modeled using IQVIA biosimilar uptake curves. ${isBiologicProduct ? 'Biologic: 60-80% share loss within 3 years of first biosimilar entry.' : 'Small molecule: 80-95% share loss within 2 years of generic entry.'}`,
    '',
    `Payer Mix: Commercial/Medicare/Medicaid/VA split evolves over product lifecycle. Managed entry agreements (MEAs) modeled from Year 2 onward. Blended net price factor declines as Medicare share increases.`,
    '',
    `Patient Dynamics: ${patientDyn.total_share_additive_pct}% additive / ${patientDyn.total_share_cannibalistic_pct}% cannibalistic share capture modeled. Net market expansion: ${patientDyn.net_market_expansion_pct}%.`,
    '',
    `Geography: US baseline scaled per territory using GDP-adjusted healthcare spend multipliers.`,
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
    `Addressability: ${(addressabilityFactor * 100).toFixed(0)}% of treated patients`,
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
  const biomarkerData = BIOMARKER_PREVALENCE[indicationLower];

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
  let detectedBiomarker: string | undefined;
  let biomarkerPrevalence: number | undefined;

  if (biomarkerData) {
    for (const [marker, prevalence] of Object.entries(biomarkerData)) {
      const markerNorm = marker.replace(/_/g, '[ _-]?');
      if (new RegExp(markerNorm, 'i').test(segmentText)) {
        detectedBiomarker = marker;
        biomarkerPrevalence = prevalence;
        break;
      }
    }
  }

  // If no biomarker detected from segment text, check mechanism for hints
  if (!detectedBiomarker && mechanism && biomarkerData) {
    const mechLower = mechanism.toLowerCase();
    for (const [marker, prevalence] of Object.entries(biomarkerData)) {
      const markerClean = marker.replace(/_/g, ' ').toLowerCase();
      if (mechLower.includes(markerClean) || markerClean.includes(mechLower.split(' ')[0])) {
        detectedBiomarker = marker;
        biomarkerPrevalence = prevalence;
        break;
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
  default: 0.18,
};

const REBATE_ESCALATION_RATES: Record<string, number> = {
  oncology: 0.015,
  immunology: 0.02,
  rare_disease: 0.01,
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
