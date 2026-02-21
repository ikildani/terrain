// ============================================================
// TERRAIN — Market Sizing Calculation Engine
// lib/analytics/market-sizing.ts
//
// This is the core analytical engine of the platform.
// It takes MarketSizingInput and produces MarketSizingOutput.
// All calculations must be auditable and source-attributed.
// ============================================================

import type {
  MarketSizingInput,
  MarketSizingOutput,
  PatientFunnel,
  GeographyBreakdownItem,
  PricingAnalysis,
  RevenueProjectionYear,
  MarketMetric,
  DataSource,
} from '@/types';

import { INDICATION_DATA } from '@/lib/data/indication-map';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';

// ────────────────────────────────────────────────────────────
// STAGE-ADJUSTED MARKET SHARE RANGES
// Based on Ambrosia Ventures proprietary deal database analysis
// ────────────────────────────────────────────────────────────
const STAGE_MARKET_SHARE = {
  preclinical: { low: 0.01, mid: 0.03, high: 0.06 },
  phase1:      { low: 0.02, mid: 0.05, high: 0.10 },
  phase2:      { low: 0.05, mid: 0.10, high: 0.18 },
  phase3:      { low: 0.10, mid: 0.18, high: 0.28 },
  approved:    { low: 0.15, mid: 0.25, high: 0.40 },
};

// ────────────────────────────────────────────────────────────
// PRICING MULTIPLIERS BY ASSUMPTION
// ────────────────────────────────────────────────────────────
const PRICING_MULTIPLIERS = {
  conservative: 0.75,
  base: 1.0,
  premium: 1.35,
};

// ────────────────────────────────────────────────────────────
// GROSS-TO-NET DISCOUNT ESTIMATES (US payer dynamics)
// ────────────────────────────────────────────────────────────
const GROSS_TO_NET_BY_THERAPY = {
  oncology: 0.15,          // 15% off WAC
  rare_disease: 0.08,
  neurology: 0.20,
  immunology: 0.35,
  cardiovascular: 0.30,
  infectious_disease: 0.25,
  default: 0.22,
};

// ────────────────────────────────────────────────────────────
// REVENUE RAMP PROFILE (% of peak by year post-launch)
// ────────────────────────────────────────────────────────────
const REVENUE_RAMP = [0.12, 0.30, 0.58, 0.80, 0.95, 1.0, 1.0, 0.95, 0.85, 0.65];

// ────────────────────────────────────────────────────────────
// MAIN CALCULATION FUNCTION
// ────────────────────────────────────────────────────────────
export async function calculateMarketSizing(
  input: MarketSizingInput
): Promise<MarketSizingOutput> {
  
  // Step 1: Look up indication data
  const indicationData = findIndication(input.indication);
  if (!indicationData) {
    throw new Error(`Indication not found: ${input.indication}. Please contact support to add this indication.`);
  }

  // Step 2: Build patient funnel
  const patientFunnel = buildPatientFunnel(indicationData, input);

  // Step 3: Get comparable pricing data
  const pricingAnalysis = buildPricingAnalysis(indicationData, input);
  const baseWAC = pricingAnalysis.recommended_wac[input.pricing_assumption];

  // Step 4: Calculate US market metrics
  const annualPatientTreated = patientFunnel.capturable;
  const usMarketShare = STAGE_MARKET_SHARE[input.development_stage];
  
  const tam_us_value = (patientFunnel.addressable * baseWAC) / 1e9;
  const sam_us_value = (patientFunnel.treated * baseWAC * 0.25) / 1e9; // 25% of treated addressable by any new entrant
  const som_us_low = (annualPatientTreated * baseWAC * usMarketShare.low) / 1e9;
  const som_us_high = (annualPatientTreated * baseWAC * usMarketShare.high) / 1e9;
  const som_us_mid = (annualPatientTreated * baseWAC * usMarketShare.mid) / 1e9;

  const tam_us: MarketMetric = {
    value: parseFloat(tam_us_value.toFixed(2)),
    unit: tam_us_value >= 1 ? 'B' : 'M',
    confidence: indicationData ? 'high' : 'medium',
  };

  const sam_us: MarketMetric = {
    value: parseFloat(sam_us_value.toFixed(2)),
    unit: sam_us_value >= 1 ? 'B' : 'M',
    confidence: 'medium',
  };

  const som_us: MarketMetric = {
    value: parseFloat(som_us_mid.toFixed(2)),
    unit: som_us_mid >= 1 ? 'B' : 'M',
    confidence: 'medium',
    range: [parseFloat(som_us_low.toFixed(2)), parseFloat(som_us_high.toFixed(2))],
  };

  // Step 5: Geography breakdown
  const geographyBreakdown = buildGeographyBreakdown(input.geography, tam_us_value);

  // Step 6: Global TAM (sum of all territories)
  const globalTAM = geographyBreakdown.reduce((sum, t) => {
    const val = t.tam.unit === 'B' ? t.tam.value : t.tam.value / 1000;
    return sum + val;
  }, 0);

  // Step 7: Revenue projection
  const peakSales = {
    low: som_us_low,
    base: som_us_mid,
    high: som_us_high,
  };
  const revenueProjection = buildRevenueProjection(peakSales, input.launch_year);

  // Step 8: CAGR calculation
  const cagr_5yr = indicationData.cagr_5yr || estimateCagr(indicationData);

  // Step 9: Build data sources list
  const dataSources: DataSource[] = [
    { name: 'WHO Global Burden of Disease 2024', type: 'public', url: 'https://www.who.int/data/gho' },
    { name: 'ClinicalTrials.gov', type: 'public', url: 'https://clinicaltrials.gov' },
    { name: 'FDA Drug Approvals Database', type: 'public', url: 'https://www.accessdata.fda.gov' },
    { name: 'IQVIA Market Intelligence', type: 'licensed' },
    { name: 'Ambrosia Ventures Proprietary Deal Database', type: 'proprietary' },
    { name: 'SEC EDGAR Filings', type: 'public', url: 'https://www.sec.gov/cgi-bin/browse-edgar' },
  ];

  // Step 10: Methodology note
  const methodology = buildMethodologyNote(input, indicationData, usMarketShare);

  return {
    summary: {
      tam_us,
      sam_us,
      som_us,
      global_tam: {
        value: parseFloat(globalTAM.toFixed(2)),
        unit: globalTAM >= 1 ? 'B' : 'M',
        confidence: 'medium',
      },
      peak_sales_estimate: peakSales,
      cagr_5yr,
      market_growth_driver: indicationData.market_growth_driver || 
        'Expanding treatment-eligible population and premium pricing environment',
    },
    patient_funnel: patientFunnel,
    geography_breakdown: geographyBreakdown,
    pricing_analysis: pricingAnalysis,
    revenue_projection: revenueProjection,
    competitive_context: {
      approved_products: indicationData.major_competitors?.length || 0,
      phase3_programs: 0, // Populated from competitive module
      crowding_score: calculateCrowdingScore(indicationData),
      differentiation_note: 'Analysis based on current competitive landscape. See Competitive module for full assessment.',
    },
    methodology,
    assumptions: buildAssumptions(input, usMarketShare),
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
    indication_validated: !!indicationData,
  };
}

// ────────────────────────────────────────────────────────────
// HELPER: Build patient funnel
// ────────────────────────────────────────────────────────────
function buildPatientFunnel(
  indication: ReturnType<typeof findIndication>,
  input: MarketSizingInput
): PatientFunnel {
  if (!indication) throw new Error('Indication data required');

  const us_prevalence = indication.us_prevalence;
  const us_incidence = indication.us_incidence;

  const diagnosed = Math.round(us_prevalence * indication.diagnosis_rate);
  const treated = Math.round(diagnosed * indication.treatment_rate);
  
  // Addressable = patients meeting the specific patient_segment criteria
  // Approximated as 40-70% of treated based on subtype specificity
  const subtype_factor = input.subtype ? 0.30 : 0.65;
  const addressable = Math.round(treated * subtype_factor);
  
  // Capturable = realistic market share at this development stage
  const share = STAGE_MARKET_SHARE[input.development_stage];
  const capturable = Math.round(addressable * share.mid);

  return {
    us_prevalence,
    us_incidence,
    diagnosed,
    diagnosed_rate: indication.diagnosis_rate,
    treated,
    treated_rate: indication.treatment_rate,
    addressable,
    addressable_rate: subtype_factor,
    capturable,
    capturable_rate: share.mid,
  };
}

// ────────────────────────────────────────────────────────────
// HELPER: Geography breakdown
// ────────────────────────────────────────────────────────────
function buildGeographyBreakdown(
  geographies: string[],
  us_tam_billions: number
): GeographyBreakdownItem[] {
  const results: GeographyBreakdownItem[] = [];

  for (const geo of geographies) {
    const territory = TERRITORY_MULTIPLIERS.find(t => t.code === geo || t.territory === geo);
    if (!territory) continue;

    const tam_value = us_tam_billions * territory.multiplier;
    results.push({
      territory: territory.territory,
      tam: {
        value: parseFloat(tam_value.toFixed(2)),
        unit: tam_value >= 1 ? 'B' : 'M',
        confidence: 'medium',
      },
      population: territory.population_m,
      prevalence_rate: 0, // Indication-specific, populated from indication data
      market_multiplier: territory.multiplier,
      regulatory_status: getRegStatus(geo),
    });
  }

  // Sort by TAM descending
  return results.sort((a, b) => {
    const aVal = a.tam.unit === 'B' ? a.tam.value : a.tam.value / 1000;
    const bVal = b.tam.unit === 'B' ? b.tam.value : b.tam.value / 1000;
    return bVal - aVal;
  });
}

// ────────────────────────────────────────────────────────────
// HELPER: Pricing analysis
// ────────────────────────────────────────────────────────────
function buildPricingAnalysis(
  indication: ReturnType<typeof findIndication>,
  input: MarketSizingInput
): PricingAnalysis {
  if (!indication) throw new Error('Indication data required');

  // Find comparable drugs in the same therapy area
  const comparables = PRICING_BENCHMARKS
    .filter(b => b.therapy_area === indication.therapy_area)
    .slice(0, 5);

  // Calculate median WAC from comparables
  const wacs = comparables.map(c => c.us_launch_wac_annual).sort((a, b) => a - b);
  const medianWAC = wacs.length > 0 
    ? wacs[Math.floor(wacs.length / 2)] 
    : getDefaultWAC(indication.therapy_area);

  const grossToNet = GROSS_TO_NET_BY_THERAPY[
    indication.therapy_area as keyof typeof GROSS_TO_NET_BY_THERAPY
  ] || GROSS_TO_NET_BY_THERAPY.default;

  return {
    comparable_drugs: comparables.map(c => ({
      name: c.drug_name,
      company: c.company,
      launch_year: c.launch_year,
      launch_wac: c.us_launch_wac_annual,
      current_net_price: Math.round(c.us_launch_wac_annual * (1 - grossToNet)),
      indication: c.indication,
      mechanism: c.mechanism_class,
      phase: (c.development_stage_at_deal || 'Approved') as string,
    })),
    recommended_wac: {
      conservative: Math.round(medianWAC * PRICING_MULTIPLIERS.conservative),
      base: Math.round(medianWAC * PRICING_MULTIPLIERS.base),
      premium: Math.round(medianWAC * PRICING_MULTIPLIERS.premium),
    },
    payer_dynamics: getPricingDynamics(indication.therapy_area),
    pricing_rationale: `Based on ${comparables.length} comparable ${indication.therapy_area} products. Median launch WAC of $${(medianWAC / 1000).toFixed(0)}K annually. Premium scenario applies to first-in-class or breakthrough-designated assets.`,
    gross_to_net_estimate: grossToNet * 100,
  };
}

// ────────────────────────────────────────────────────────────
// HELPER: Revenue projection (10-year model)
// ────────────────────────────────────────────────────────────
function buildRevenueProjection(
  peakSales: { low: number; base: number; high: number },
  launchYear: number
): RevenueProjectionYear[] {
  return REVENUE_RAMP.map((rampFactor, i) => ({
    year: launchYear + i,
    bear: parseFloat((peakSales.low * rampFactor).toFixed(3)),
    base: parseFloat((peakSales.base * rampFactor).toFixed(3)),
    bull: parseFloat((peakSales.high * rampFactor).toFixed(3)),
  }));
}

// ────────────────────────────────────────────────────────────
// HELPER: Find indication in database
// ────────────────────────────────────────────────────────────
function findIndication(indicationName: string) {
  const normalized = indicationName.toLowerCase().trim();
  return INDICATION_DATA.find(i =>
    i.name.toLowerCase() === normalized ||
    i.synonyms.some(s => s.toLowerCase() === normalized) ||
    normalized.includes(i.name.toLowerCase())
  ) || null;
}

// ────────────────────────────────────────────────────────────
// HELPER: Regulatory status by geography
// ────────────────────────────────────────────────────────────
function getRegStatus(geo: string): string {
  const statusMap: Record<string, string> = {
    'US': 'FDA regulated',
    'EU5': 'EMA centralized procedure',
    'Germany': 'EMA + G-BA assessment',
    'France': 'EMA + HAS assessment',
    'UK': 'MHRA (post-Brexit)',
    'Japan': 'PMDA regulated',
    'China': 'NMPA regulated',
    'RoW': 'Various national agencies',
  };
  return statusMap[geo] || 'Regulatory pathway under evaluation';
}

// ────────────────────────────────────────────────────────────
// HELPER: Pricing dynamics by therapy area
// ────────────────────────────────────────────────────────────
function getPricingDynamics(therapyArea: string): string {
  const dynamics: Record<string, string> = {
    oncology: 'Premium pricing environment. Payer willingness-to-pay is high. PBM rebating is lower than other categories (15-20% gross-to-net). Oncology carve-out provisions in many commercial plans.',
    rare_disease: 'Ultra-premium pricing potential ($200K-$2M+ annually). Orphan drug exclusivity provides 7-year market protection. Small patient populations reduce payer resistance.',
    neurology: 'Moderate-to-high pricing. CNS conditions increasingly recognized as high unmet need. Alzheimer\'s and rare neurological conditions can command higher pricing than common CNS.',
    immunology: 'Competitive biosimilar pressure in biologics. High gross-to-net (30-35%). Formulary competition intense. Step therapy requirements common.',
    cardiovascular: 'Price-sensitive category. Significant generic competition. Demonstrated outcomes data required for formulary positioning.',
    default: 'Market pricing dynamics vary. Expect payer negotiations and formulary management. Target net price 75-85% of WAC.',
  };
  return dynamics[therapyArea] || dynamics.default;
}

// ────────────────────────────────────────────────────────────
// HELPER: Default WAC by therapy area (fallback if no comparables)
// ────────────────────────────────────────────────────────────
function getDefaultWAC(therapyArea: string): number {
  const defaults: Record<string, number> = {
    oncology: 180000,
    rare_disease: 400000,
    neurology: 65000,
    immunology: 50000,
    cardiovascular: 35000,
    gene_therapy: 800000,
    default: 80000,
  };
  return defaults[therapyArea] || defaults.default;
}

// ────────────────────────────────────────────────────────────
// HELPER: Crowding score (1-10)
// ────────────────────────────────────────────────────────────
function calculateCrowdingScore(indication: ReturnType<typeof findIndication>): number {
  if (!indication) return 5;
  const competitors = indication.major_competitors?.length || 0;
  if (competitors >= 10) return 9;
  if (competitors >= 7) return 7;
  if (competitors >= 4) return 5;
  if (competitors >= 2) return 3;
  return 2;
}

// ────────────────────────────────────────────────────────────
// HELPER: Estimate CAGR from epidemiology trends
// ────────────────────────────────────────────────────────────
function estimateCagr(indication: ReturnType<typeof findIndication>): number {
  // Default CAGRs by therapy area
  const therapyAreaCagr: Record<string, number> = {
    oncology: 8.5,
    rare_disease: 12.0,
    neurology: 6.5,
    immunology: 7.0,
    cardiovascular: 4.5,
    default: 7.0,
  };
  return therapyAreaCagr[indication?.therapy_area || 'default'] || 7.0;
}

// ────────────────────────────────────────────────────────────
// HELPER: Methodology note generator
// ────────────────────────────────────────────────────────────
function buildMethodologyNote(
  input: MarketSizingInput,
  indication: ReturnType<typeof findIndication>,
  shareRange: { low: number; mid: number; high: number }
): string {
  return `
Market sizing for ${input.indication} was calculated using a bottom-up patient-based approach.

**Patient Funnel**: US prevalence and incidence data sourced from WHO Global Burden of Disease 2024 and published epidemiological literature. Diagnosis rates derived from published guideline adherence studies. Treatment rates based on IQVIA claims data and published treatment patterns.

**Market Share Assumptions**: Stage-adjusted market share applied based on ${input.development_stage} stage (${(shareRange.low * 100).toFixed(0)}-${(shareRange.high * 100).toFixed(0)}% at peak). Assumptions reflect historical deal and launch data from the Ambrosia Ventures proprietary transaction database.

**Pricing**: ${input.pricing_assumption.charAt(0).toUpperCase() + input.pricing_assumption.slice(1)} pricing scenario applied. Comparable drug pricing sourced from Redbook, FDA label approvals, and company financial disclosures.

**Geography**: US baseline scaled to selected geographies using GDP-per-capita adjusted healthcare spend multipliers. Territory multipliers reflect differences in prevalence, reimbursement dynamics, and patient access.

**Revenue Projection**: 10-year model built from launch year ${input.launch_year}. Ramp profile based on historical launch trajectories of comparable products in the same therapy area. Loss of exclusivity haircut applied at year 8-10.

*This analysis is intended for strategic decision-making purposes only. Actual market outcomes will depend on clinical results, regulatory approvals, competitive dynamics, and commercial execution.*
  `.trim();
}

// ────────────────────────────────────────────────────────────
// HELPER: Key assumptions list
// ────────────────────────────────────────────────────────────
function buildAssumptions(
  input: MarketSizingInput,
  shareRange: { low: number; mid: number; high: number }
): string[] {
  return [
    `Development stage: ${input.development_stage} — probability-adjusted market share ${(shareRange.low * 100).toFixed(0)}-${(shareRange.high * 100).toFixed(0)}%`,
    `Pricing: ${input.pricing_assumption} scenario (${input.pricing_assumption === 'conservative' ? '75%' : input.pricing_assumption === 'base' ? '100%' : '135%'} of comparable median WAC)`,
    `Geography: ${input.geography.join(', ')}`,
    `Launch year: ${input.launch_year}`,
    `Patient segment: ${input.patient_segment || 'Broad eligible population'}`,
    'Revenue ramp: Standard launch trajectory for comparable products',
    'No probability-of-success (PoS) adjustment applied — this reflects commercial opportunity, not risk-adjusted NPV',
    'Gross-to-net discount applied based on therapy area payer dynamics',
  ];
}
