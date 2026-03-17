// ============================================================
// TERRAIN — Device & Diagnostics Market Sizing Engine
// lib/analytics/device-market-sizing.ts
// ============================================================

import type {
  DeviceMarketSizingInput,
  DeviceMarketSizingOutput,
  RevenueStreamBreakdown,
  CDxMarketSizingInput,
  CDxOutput,
  CDxDeal,
  NTAPCalculation,
  PayerMixModel,
  PayerMixEntry,
  CoverageTimeline,
  CoverageMilestone,
  ReimbursementScenario,
  DeviceReimbursementAnalytics,
  DeviceCompetitiveShareDistribution,
  DeviceCompetitiveShareEntry,
  DeviceEvidenceGapAnalysis,
  DeviceEvidenceGap,
  DevicePricingPressureModel,
  MedTechDealBenchmark,
  TechnologyReadinessEntry,
  TechnologyReadinessScoring,
  ClinicalSuperiorityEntry,
  ClinicalSuperiorityMatrix,
  SurgeonSwitchingCostModel,
} from '@/types/devices-diagnostics';

import { PROCEDURE_DATA } from '@/lib/data/procedure-map';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { DEVICE_PRICING_BENCHMARKS } from '@/lib/data/device-pricing-benchmarks';
import { CDX_DEAL_DATABASE } from '@/lib/data/cdx-deals';
import { MEDTECH_DEAL_DATABASE, getDealsByCategory, getMedianDealValue } from '@/lib/data/medtech-deal-database';
import { getSourceFreshness } from '@/lib/data/data-freshness';

// ────────────────────────────────────────────────────────────
// DEVICE STAGE MARKET SHARE RANGES
// Different from pharma — adoption curves driven by clinical
// evidence + reimbursement, not regulatory approval alone
// ────────────────────────────────────────────────────────────
const DEVICE_STAGE_SHARE = {
  concept: { low: 0.0, base: 0.0, high: 0.01 },
  preclinical: { low: 0.01, base: 0.02, high: 0.04 },
  clinical_trial: { low: 0.02, base: 0.05, high: 0.1 },
  fda_submitted: { low: 0.05, base: 0.1, high: 0.18 },
  cleared_approved: { low: 0.08, base: 0.15, high: 0.28 },
  commercial: { low: 0.12, base: 0.22, high: 0.38 },
};

// ────────────────────────────────────────────────────────────
// DEVICE REVENUE RAMP (slower than pharma due to capital cycle,
// clinical learning curve, and ASC/hospital procurement cycles)
// ────────────────────────────────────────────────────────────
const DEVICE_REVENUE_RAMP = [0.08, 0.2, 0.4, 0.62, 0.8, 0.92, 1.0, 1.0, 0.98, 0.95];

// ────────────────────────────────────────────────────────────
// CAPITAL EQUIPMENT INSTALLED BASE RAMP
// Capital deploys slower — hospitals have procurement cycles
// ────────────────────────────────────────────────────────────
const CAPITAL_INSTALLED_RAMP = [0.05, 0.15, 0.3, 0.5, 0.68, 0.82, 0.92, 1.0, 1.0, 0.98];

// ────────────────────────────────────────────────────────────
// DEVICE MANUFACTURING CAPACITY CONSTRAINTS (Enhancement 8)
// Caps revenue based on product category procurement cycles
// ────────────────────────────────────────────────────────────

const DEVICE_MANUFACTURING_CAPS: Record<string, number[]> = {
  capital_equipment: [0.5, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  consumable: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // No constraint
  disposable: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // No constraint
  implantable: [0.7, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  default: [0.85, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
};

function getDeviceManufacturingCategory(productCategory: string): string {
  const cat = productCategory.toLowerCase();
  if (cat.includes('capital') || cat.includes('equipment') || cat.includes('robot') || cat.includes('laser')) {
    return 'capital_equipment';
  }
  if (cat.includes('consumable') || cat.includes('disposable') || cat.includes('catheter') || cat.includes('guide')) {
    return 'consumable';
  }
  if (cat.includes('implant') || cat.includes('stent') || cat.includes('valve') || cat.includes('prosth')) {
    return 'implantable';
  }
  return 'default';
}

function buildDeviceManufacturingConstraint(
  productCategory: string,
  revenueProjection: { year: number; bear: number; base: number; bull: number }[],
): {
  product_category: string;
  constrained_years: { year: number; capacity_pct: number; revenue_cap_m: number }[];
  narrative: string;
} {
  const mfgCategory = getDeviceManufacturingCategory(productCategory);
  const caps = DEVICE_MANUFACTURING_CAPS[mfgCategory] ?? DEVICE_MANUFACTURING_CAPS.default;

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

  const narratives: Record<string, string> = {
    capital_equipment:
      'Capital equipment faces hospital procurement cycle constraints. ' +
      'Year 1 capped at 50% (budget approval, value analysis committee review, installation lead times), ' +
      'Year 2 at 80% (follow-on orders, reference site visits completed). Full capacity from Year 3.',
    consumable: 'Consumables/disposables have scalable manufacturing with no significant supply constraints.',
    disposable: 'Disposables have scalable manufacturing with no significant supply constraints.',
    implantable:
      'Implantable devices require surgeon training, instrument tray availability, and hospital credentialing. ' +
      'Year 1 capped at 70% (limited trained surgeon base), Year 2 at 90% (training programs mature). Full capacity from Year 3.',
    default: 'Moderate manufacturing ramp expected. Year 1 at 85% capacity, Year 2 at 95%. Full capacity from Year 3.',
  };

  return {
    product_category: mfgCategory,
    constrained_years: constrainedYears,
    narrative: narratives[mfgCategory] ?? narratives.default,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN DEVICE CALCULATION FUNCTION
// ────────────────────────────────────────────────────────────
export async function calculateDeviceMarketSizing(input: DeviceMarketSizingInput): Promise<DeviceMarketSizingOutput> {
  // Step 0: Normalize input — API schema marks many fields optional,
  // but the engine expects them. Apply safe defaults for any missing fields.
  let safeInput: DeviceMarketSizingInput = {
    ...input,
    unit_ase: input.unit_ase ?? 0,
    physician_specialty: input.physician_specialty ?? [],
    target_setting: input.target_setting ?? ['hospital_inpatient'],
    pricing_model: input.pricing_model ?? 'per_procedure',
    device_category: input.device_category ?? ('general_surgery' as DeviceMarketSizingInput['device_category']),
    product_category: input.product_category ?? ('device_implantable' as DeviceMarketSizingInput['product_category']),
    reimbursement_status: input.reimbursement_status ?? 'covered',
    development_stage: input.development_stage ?? 'clinical_trial',
    geography: input.geography ?? ['US'],
    launch_year: input.launch_year ?? new Date().getFullYear() + 2,
  };

  // Step 1: Look up procedure data (with graceful fallback for unmatched inputs)
  const matchedProcedure = findProcedure(safeInput.procedure_or_condition);
  const procedure = matchedProcedure || buildFallbackProcedure(safeInput);

  // Derive ASE from procedure reimbursement data if user didn't provide one
  if (!safeInput.unit_ase || safeInput.unit_ase === 0) {
    const fallbackASE = procedure.reimbursement.medicare_facility_rate;
    if (fallbackASE && fallbackASE > 0) {
      safeInput = { ...safeInput, unit_ase: fallbackASE };
    }
  }

  // Step 2: Determine market share range
  const shareRange = DEVICE_STAGE_SHARE[safeInput.development_stage] ?? DEVICE_STAGE_SHARE.clinical_trial; // Fallback if stage doesn't match enum

  // Step 3: Calculate revenue streams based on pricing model
  const revenueStreams = buildRevenueStreams(safeInput, procedure, shareRange.base);

  // Step 4: US TAM (total market if dominant player)
  const us_tam_value = (procedure.us_annual_procedures * safeInput.unit_ase) / 1e9;

  // Step 5: US SAM (addressable with your device profile)
  const addressability_factor = getAddressabilityFactor(safeInput);
  const us_sam_value = us_tam_value * addressability_factor;

  // Step 6: US SOM (realistic capture at peak)
  const us_som_base = us_sam_value * shareRange.base;
  const us_som_low = us_sam_value * shareRange.low;
  const us_som_high = us_sam_value * shareRange.high;

  // Step 7: Geography breakdown
  const geographyBreakdown = buildDeviceGeographyBreakdown(safeInput.geography, us_tam_value, procedure);

  // Step 8: Global TAM
  const globalTAM = geographyBreakdown.reduce((sum, t) => {
    const val = t.tam.unit === 'B' ? t.tam.value : t.tam.value / 1000;
    return sum + val;
  }, 0);

  // Step 9: Category-specific adoption curve (replaces generic 2-curve model)
  const adoptionCurveData = getAdoptionCurve(safeInput.product_category, safeInput.device_category);
  const ramp = adoptionCurveData.factors.map((f, i) => (i < 3 ? f * adoptionCurveData.learning_curve : f));

  // Revenue projection in $M (matching pharma engine convention)
  let revenueProjection = ramp.map((factor, i) => ({
    year: safeInput.launch_year + i,
    bear: parseFloat((us_som_low * 1000 * factor).toFixed(1)),
    base: parseFloat((us_som_base * 1000 * factor).toFixed(1)),
    bull: parseFloat((us_som_high * 1000 * factor).toFixed(1)),
  }));

  // Enhancement 8: Device manufacturing capacity constraints
  const deviceMfgConstraint = buildDeviceManufacturingConstraint(
    safeInput.product_category ?? 'default',
    revenueProjection,
  );
  if (deviceMfgConstraint.constrained_years.length > 0) {
    const mfgCategory = getDeviceManufacturingCategory(safeInput.product_category ?? 'default');
    const caps = DEVICE_MANUFACTURING_CAPS[mfgCategory] ?? DEVICE_MANUFACTURING_CAPS.default;
    revenueProjection = revenueProjection.map((yr, i) => {
      const cap = caps[i] ?? 1.0;
      if (cap >= 1.0) return yr;
      return {
        ...yr,
        bear: parseFloat((yr.bear * cap).toFixed(1)),
        base: parseFloat((yr.base * cap).toFixed(1)),
        bull: parseFloat((yr.bull * cap).toFixed(1)),
      };
    });
  }

  // Step 10: Adoption model
  const adoptionModel = buildAdoptionModel(safeInput, procedure, shareRange);

  // Step 11: Reimbursement analysis
  const reimbursementAnalysis = buildReimbursementAnalysis(safeInput, procedure);

  // Step 12: Competitive positioning from benchmarks
  const competitivePositioning = buildCompetitivePositioning(safeInput, procedure);

  // Step 13: Reimbursement analytics
  const drgPayment = procedure.reimbursement.medicare_facility_rate || 0;
  const ntap = drgPayment > 0 ? calculateNTAPBenefit(safeInput.unit_ase, drgPayment) : undefined;
  const payerMix = buildPayerMixModel(
    safeInput.target_setting,
    safeInput.device_category,
    procedure.reimbursement.medicare_facility_rate,
  );
  const coverageTimeline = buildCoverageTimeline(
    safeInput.reimbursement_status,
    safeInput.development_stage,
    safeInput.product_category,
  );
  const reimbursementScenarios = buildReimbursementScenarios(payerMix, ntap, safeInput.unit_ase);
  const reimbursementRiskScore = ntap?.eligible
    ? 4
    : payerMix.blended_reimbursement_rate > safeInput.unit_ase * 0.7
      ? 3
      : 7;

  // Step 14: Enhanced competitive analytics
  const competitiveShareDist = buildDeviceCompetitiveShareDistribution(procedure, safeInput, DEVICE_PRICING_BENCHMARKS);
  const evidenceGaps = buildEvidenceGapAnalysis(safeInput.development_stage, safeInput.product_category);
  const pricingPressure = buildPricingPressureModel(safeInput, DEVICE_PRICING_BENCHMARKS, procedure);

  // Step 15: Deal benchmark
  const dealBenchmark = buildDealBenchmark(safeInput);

  // Step 16: Technology Readiness Scoring
  const technologyReadiness = buildTechnologyReadinessScoring(
    procedure.major_device_competitors,
    safeInput.development_stage,
  );

  // Step 17: Clinical Superiority Matrix
  const clinicalSuperiority = buildClinicalSuperiorityMatrix(procedure, safeInput);

  // Step 18: Surgeon Switching Cost Model
  const surgeonSwitchingCost = buildSurgeonSwitchingCostModel(safeInput.device_category, safeInput.product_category);

  const currentYear = new Date().getFullYear();
  const dataSources = [
    {
      name: `CMS Medicare Fee Schedule ${currentYear}`,
      type: 'public' as const,
      url: 'https://www.cms.gov/medicare/payment',
      last_updated: getSourceFreshness('CMS Medicare Fee Schedule'),
    },
    {
      name: `AHA Annual Survey of Hospitals ${currentYear}`,
      type: 'licensed' as const,
      last_updated: getSourceFreshness('AHA Annual Survey of Hospitals'),
    },
    {
      name: 'FDA 510(k) / PMA Database',
      type: 'public' as const,
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm',
      last_updated: getSourceFreshness('FDA 510(k) / PMA Database'),
    },
    {
      name: 'Definitive Healthcare Procedure Volume Data',
      type: 'licensed' as const,
      last_updated: getSourceFreshness('Definitive Healthcare Procedure Volume Data'),
    },
    {
      name: `Ambrosia Ventures Medtech Deal Database (2020-${currentYear})`,
      type: 'proprietary' as const,
      last_updated: getSourceFreshness('Ambrosia Ventures Medtech Deal Database'),
    },
    {
      name: `ASC Association Annual Survey ${currentYear}`,
      type: 'public' as const,
      last_updated: getSourceFreshness('ASC Association Annual Survey'),
    },
  ];

  return {
    summary: {
      us_tam: toDeviceMetric(us_tam_value, matchedProcedure ? 'high' : 'low'),
      us_sam: toDeviceMetric(
        us_sam_value,
        matchedProcedure && addressability_factor > 0.4 ? 'high' : matchedProcedure ? 'medium' : 'low',
      ),
      us_som: {
        ...toDeviceMetric(us_som_base, 'medium'),
        range:
          us_som_low >= 1
            ? [parseFloat(us_som_low.toFixed(2)), parseFloat(us_som_high.toFixed(2))]
            : [parseFloat((us_som_low * 1000).toFixed(1)), parseFloat((us_som_high * 1000).toFixed(1))],
      },
      global_tam: toDeviceMetric(globalTAM, matchedProcedure && geographyBreakdown.length > 1 ? 'medium' : 'low'),
      cagr_5yr: procedure.cagr_5yr,
      market_growth_driver: procedure.growth_driver,
    },
    procedure_volume: {
      us_annual_procedures: procedure.us_annual_procedures,
      us_addressable_procedures: Math.round(procedure.us_annual_procedures * addressability_factor),
      growth_rate_pct: procedure.us_procedure_growth_rate,
      source: procedure.procedure_source,
    },
    adoption_model: adoptionModel,
    revenue_streams: revenueStreams,
    geography_breakdown: geographyBreakdown,
    reimbursement_analysis: reimbursementAnalysis,
    competitive_positioning: competitivePositioning,
    revenue_projection: revenueProjection,
    // World-class analytics extensions
    reimbursement_analytics: {
      ntap,
      payer_mix: payerMix,
      coverage_timeline: coverageTimeline,
      scenarios: reimbursementScenarios,
      overall_reimbursement_risk_score: reimbursementRiskScore,
    },
    competitive_share_distribution: competitiveShareDist,
    evidence_gap_analysis: evidenceGaps,
    pricing_pressure: pricingPressure,
    deal_benchmark: dealBenchmark,
    // Competitive analytics extensions
    technology_readiness: technologyReadiness,
    clinical_superiority: clinicalSuperiority,
    surgeon_switching_cost: surgeonSwitchingCost,
    // Manufacturing capacity constraint (Enhancement 8)
    manufacturing_constraint: deviceMfgConstraint.constrained_years.length > 0 ? deviceMfgConstraint : undefined,
    methodology: buildDeviceMethodology(safeInput, procedure, shareRange),
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// COMPANION DIAGNOSTIC CALCULATION ENGINE
// ────────────────────────────────────────────────────────────
export async function calculateCDxMarketSizing(rawInput: CDxMarketSizingInput): Promise<CDxOutput> {
  // Normalize input — apply safe defaults for potentially missing fields
  const input: CDxMarketSizingInput = {
    ...rawInput,
    drug_indication: rawInput.drug_indication ?? 'Unknown Indication',
    biomarker: rawInput.biomarker ?? 'Unknown Biomarker',
    biomarker_prevalence_pct: rawInput.biomarker_prevalence_pct ?? 20,
    test_type: rawInput.test_type ?? 'NGS_panel',
    test_setting: rawInput.test_setting ?? ['central_lab'],
    drug_development_stage: rawInput.drug_development_stage ?? 'phase2',
    cdx_development_stage: rawInput.cdx_development_stage ?? 'clinical_validation',
    geography: rawInput.geography ?? ['US'],
    test_ase: rawInput.test_ase ?? 3500,
  };

  // Step 1: Get base indication incidence from pharma indication map
  // Import from indication-map.ts
  const { findIndicationByName } = await import('@/lib/data/indication-map');
  const indication = findIndicationByName(input.drug_indication);

  const us_incidence = indication?.us_incidence || estimateIncidenceFromIndication(input.drug_indication);

  // Step 2: Testing funnel
  // Not all newly diagnosed patients are immediately tested — depends on:
  // - Standard of care guidelines (NCCN, etc.)
  // - Test availability and turnaround
  // - Physician awareness
  const diagnosed_and_tested_pct = getTestingRate(input);
  const annual_newly_tested = Math.round(us_incidence * diagnosed_and_tested_pct);
  const biomarker_positive = Math.round(annual_newly_tested * (input.biomarker_prevalence_pct / 100));

  // Estimate % who get on linked drug (if approved)
  const drug_stage_factor = getDrugStageFactor(input.drug_development_stage);
  const treated_on_linked_drug = Math.round(biomarker_positive * drug_stage_factor);

  // Monitoring/repeat tests: patients on drug may get re-tested for resistance
  const monitoring_retests = Math.round(treated_on_linked_drug * 0.35);
  const total_annual_tests = annual_newly_tested + monitoring_retests;

  // Step 3: CDx economics
  const gross_revenue_per_test = input.test_ase;
  const gtm_discount = getCDxGrossToNet(input.test_type);
  const net_revenue_per_test = gross_revenue_per_test * (1 - gtm_discount);

  const total_revenue = {
    low: (total_annual_tests * 0.7 * net_revenue_per_test) / 1e6,
    base: (total_annual_tests * net_revenue_per_test) / 1e6,
    high: (total_annual_tests * 1.3 * net_revenue_per_test) / 1e6,
  };

  // Step 4: Find comparable CDx deals
  const comparableDeals = CDX_DEAL_DATABASE.filter(
    (d) =>
      d.indication.toLowerCase().includes(input.drug_indication.toLowerCase().split(' ')[0]) ||
      d.cdx_company.toLowerCase().includes('roche') || // Most deals involve major Dx companies
      d.test_type === input.test_type,
  ).slice(0, 5);

  // Step 5: CPT code lookup for test type
  const reimbursementInfo = getCDxReimbursement(input.test_type, input.biomarker);

  return {
    summary: {
      linked_drug_indication_incidence_us: us_incidence,
      annual_test_volume: total_annual_tests,
      cdx_revenue: {
        value: parseFloat(total_revenue.base.toFixed(1)),
        unit: total_revenue.base >= 1000 ? 'B' : 'M',
        confidence: indication ? 'high' : 'medium',
      },
      test_reimbursement: reimbursementInfo.summary,
    },
    patient_testing_funnel: {
      indication_incidence_us: us_incidence,
      diagnosed_and_tested_pct,
      annual_newly_tested,
      biomarker_positive_pct: input.biomarker_prevalence_pct,
      biomarker_positive_patients: biomarker_positive,
      treated_on_linked_drug,
      monitoring_retests_annual: monitoring_retests,
      total_annual_tests,
    },
    cdx_economics: {
      revenue_per_test_gross: gross_revenue_per_test,
      reimbursement_cpt_codes: reimbursementInfo.cpt_codes,
      cms_reimbursement_rate: reimbursementInfo.cms_rate,
      private_payer_rate: reimbursementInfo.private_payer,
      gross_to_net_pct: gtm_discount * 100,
      net_revenue_per_test,
      total_annual_revenue: total_revenue,
    },
    deal_structure_benchmark: buildCDxDealBenchmark(input, comparableDeals),
    regulatory_pathway: buildCDxRegulatoryPathway(input),
    competitive_cdx_landscape: buildCDxCompetitiveLandscape(input),
    methodology: buildCDxMethodology(input, us_incidence),
    data_sources: [
      {
        name: 'FDA Companion Diagnostics Database',
        type: 'public',
        last_updated: getSourceFreshness('FDA Companion Diagnostics Database'),
      },
      {
        name: 'CMS Clinical Laboratory Fee Schedule 2024',
        type: 'public',
        last_updated: getSourceFreshness('CMS Clinical Laboratory Fee Schedule 2024'),
      },
      {
        name: 'Ambrosia Ventures CDx Deal Database',
        type: 'proprietary',
        last_updated: getSourceFreshness('Ambrosia Ventures CDx Deal Database'),
      },
      {
        name: 'NCCN Biomarker Testing Guidelines',
        type: 'public',
        last_updated: getSourceFreshness('NCCN Biomarker Testing Guidelines'),
      },
    ],
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// METRIC BUILDER (mirrors pharma engine toMetric)
// ────────────────────────────────────────────────────────────

function toDeviceMetric(valueBillions: number, confidence: 'high' | 'medium' | 'low') {
  if (valueBillions >= 1) {
    return { value: parseFloat(valueBillions.toFixed(2)), unit: 'B' as const, confidence };
  }
  const valueM = valueBillions * 1000;
  return { value: parseFloat(valueM.toFixed(valueM >= 100 ? 0 : 1)), unit: 'M' as const, confidence };
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

// Common procedure aliases that don't match via substring
const PROCEDURE_ALIASES: Record<string, string[]> = {
  'transcatheter aortic valve replacement': ['heart valve', 'aortic valve', 'aortic stenosis', 'valve replacement'],
  'cardiac ablation for atrial fibrillation': ['afib', 'atrial fibrillation', 'heart rhythm', 'af ablation'],
  'coronary stent implantation': ['coronary stent', 'heart stent', 'pci', 'angioplasty', 'coronary artery disease'],
  'total knee replacement': [
    'knee replacement',
    'knee arthroplasty',
    'tka',
    'knee implant',
    'knee prosthesis',
    'osteoarthritis knee',
  ],
  'total hip replacement': [
    'hip replacement',
    'hip arthroplasty',
    'tha',
    'hip implant',
    'hip prosthesis',
    'osteoarthritis hip',
  ],
  'spinal fusion': [
    'spine fusion',
    'back surgery',
    'spinal implant',
    'lumbar fusion',
    'cervical fusion',
    'degenerative disc',
  ],
  'continuous glucose monitor (cgm)': [
    'glucose monitor',
    'cgm',
    'blood sugar monitor',
    'diabetes monitor',
    'continuous glucose',
  ],
  'insulin pump therapy': ['insulin pump', 'insulin delivery', 'diabetes pump'],
  'robotic-assisted radical prostatectomy': [
    'robotic surgery',
    'prostatectomy',
    'prostate surgery',
    'robotic prostate',
    'da vinci prostate',
  ],
  'deep brain stimulation': ['dbs', 'brain stimulation', 'parkinson stimulation', 'parkinson device', 'tremor device'],
  'cataract surgery with iol implantation': ['cataract', 'iol', 'intraocular lens', 'lens implant', 'cataract surgery'],
  'negative pressure wound therapy': ['wound vac', 'npwt', 'wound therapy', 'vacuum wound'],
  'leadless pacemaker implantation': ['pacemaker', 'leadless pacemaker', 'cardiac pacing'],
  'subcutaneous icd implantation': ['icd', 'defibrillator', 'implantable defibrillator', 's-icd'],
  'transcatheter mitral valve repair (teer)': [
    'mitral valve',
    'mitraclip',
    'teer',
    'mitral repair',
    'mitral regurgitation',
  ],
  'left atrial appendage closure': ['laa closure', 'watchman', 'atrial appendage', 'stroke prevention device'],
  'bariatric surgery (sleeve gastrectomy/gastric bypass)': [
    'bariatric',
    'weight loss surgery',
    'gastric sleeve',
    'gastric bypass',
    'obesity surgery',
  ],
  'cochlear implant': ['cochlear', 'hearing implant', 'hearing device', 'deaf implant'],
  'benign prostatic hyperplasia treatment (minimally invasive)': [
    'bph',
    'prostate enlargement',
    'urolift',
    'rezum',
    'enlarged prostate',
  ],
  'spinal cord stimulation': ['scs', 'spinal stimulator', 'pain stimulator', 'chronic pain device', 'back pain device'],
  'dialysis access (av fistula/graft creation)': ['dialysis', 'av fistula', 'dialysis access', 'hemodialysis'],
  'hernia repair (mesh)': ['hernia', 'hernia mesh', 'inguinal hernia', 'ventral hernia'],
  'mohs surgery for skin cancer': ['mohs', 'skin cancer surgery', 'skin cancer'],
  'balloon sinuplasty': ['sinus surgery', 'sinuplasty', 'sinus', 'chronic sinusitis'],
  'renal denervation': ['renal denervation', 'hypertension device', 'rdn'],
  'focused ultrasound thalamotomy': ['focused ultrasound', 'essential tremor', 'hifu brain'],
  'vagus nerve stimulation': ['vns', 'vagus nerve', 'epilepsy device'],
  'endovascular aneurysm repair': ['evar', 'aortic aneurysm', 'aneurysm repair', 'aaa repair'],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenScore(query: string, target: string): number {
  const qTokens = normalize(query)
    .split(' ')
    .filter((t) => t.length > 2);
  const tTokens = normalize(target)
    .split(' ')
    .filter((t) => t.length > 2);
  if (qTokens.length === 0) return 0;
  let matches = 0;
  for (const qt of qTokens) {
    if (tTokens.some((tt) => tt.includes(qt) || qt.includes(tt))) matches++;
  }
  return matches / qTokens.length;
}

function findProcedure(name: string): (typeof PROCEDURE_DATA)[number] | null {
  const q = normalize(name);

  // 1. Exact match on name or synonym
  const exact = PROCEDURE_DATA.find((p) => normalize(p.name) === q || p.synonyms.some((s) => normalize(s) === q));
  if (exact) return exact;

  // 2. Substring match (original logic)
  const substring = PROCEDURE_DATA.find(
    (p) =>
      normalize(p.name).includes(q) ||
      q.includes(normalize(p.name)) ||
      p.synonyms.some((s) => normalize(s).includes(q) || q.includes(normalize(s))),
  );
  if (substring) return substring;

  // 3. Alias map match
  for (const [procName, aliases] of Object.entries(PROCEDURE_ALIASES)) {
    if (aliases.some((a) => q.includes(a) || a.includes(q))) {
      const matched = PROCEDURE_DATA.find((p) => normalize(p.name) === procName);
      if (matched) return matched;
    }
  }

  // 4. Token-based fuzzy match — pick best scoring procedure
  let bestScore = 0;
  let bestMatch: (typeof PROCEDURE_DATA)[number] | null = null;

  for (const p of PROCEDURE_DATA) {
    const nameScore = tokenScore(q, p.name);
    const synonymScores = p.synonyms.map((s) => tokenScore(q, s));
    const aliasScores = (PROCEDURE_ALIASES[normalize(p.name)] || []).map((a) => tokenScore(q, a));
    const maxScore = Math.max(nameScore, ...synonymScores, ...aliasScores);
    if (maxScore > bestScore) {
      bestScore = maxScore;
      bestMatch = p;
    }
  }

  // Require at least 50% token overlap to prevent false matches
  if (bestScore >= 0.5 && bestMatch) return bestMatch;

  // 5. Category-based fallback — match by device_category
  const categoryMatch = PROCEDURE_DATA.find(
    (p) => normalize(p.device_category).includes(q) || q.includes(normalize(p.device_category)),
  );
  if (categoryMatch) return categoryMatch;

  return null;
}

// Category-to-default estimates for when no exact procedure match exists.
// Conservative fallback values based on broad medtech category averages.
const CATEGORY_DEFAULTS: Record<string, { procedures: number; growth: number; sites: number; facilityRate: number }> = {
  cardiovascular: { procedures: 120000, growth: 6.0, sites: 900, facilityRate: 22000 },
  orthopedic: { procedures: 200000, growth: 4.0, sites: 2500, facilityRate: 18000 },
  neurology: { procedures: 35000, growth: 8.0, sites: 600, facilityRate: 25000 },
  ophthalmology: { procedures: 400000, growth: 3.0, sites: 4000, facilityRate: 3500 },
  endoscopy_gi: { procedures: 150000, growth: 5.0, sites: 3000, facilityRate: 6000 },
  wound_care: { procedures: 250000, growth: 5.5, sites: 5000, facilityRate: 800 },
  diabetes_metabolic: { procedures: 500000, growth: 12.0, sites: 8000, facilityRate: 500 },
  oncology_surgical: { procedures: 80000, growth: 6.0, sites: 1200, facilityRate: 15000 },
  respiratory: { procedures: 60000, growth: 7.0, sites: 1000, facilityRate: 10000 },
  general_surgery: { procedures: 300000, growth: 3.5, sites: 4000, facilityRate: 8000 },
  vascular: { procedures: 100000, growth: 5.0, sites: 1500, facilityRate: 12000 },
  renal_dialysis: { procedures: 50000, growth: 4.0, sites: 800, facilityRate: 15000 },
  ent: { procedures: 180000, growth: 4.5, sites: 3000, facilityRate: 4000 },
};

function buildFallbackProcedure(input: DeviceMarketSizingInput): (typeof PROCEDURE_DATA)[number] {
  const cat = input.device_category || 'general_surgery';
  const defaults = CATEGORY_DEFAULTS[cat] || CATEGORY_DEFAULTS.general_surgery;

  return {
    name: input.procedure_or_condition,
    synonyms: [],
    cpt_codes: [],
    device_category: cat as import('@/types/devices-diagnostics').DeviceCategory,
    us_annual_procedures: defaults.procedures,
    us_procedure_growth_rate: defaults.growth,
    procedure_setting: input.target_setting || ['hospital_inpatient'],
    eligible_sites: { hospitals: defaults.sites, ascs: Math.round(defaults.sites * 0.15) },
    performing_specialty: input.physician_specialty || ['General Surgery'],
    adoption_barrier: 'moderate' as const,
    procedure_source: 'Terrain estimate — no exact procedure match in database. Values are category-level averages.',
    reimbursement: {
      cms_coverage: 'partial' as const,
      medicare_facility_rate: defaults.facilityRate,
      medicare_physician_rate: Math.round(defaults.facilityRate * 0.08),
      private_payer_coverage: 'Coverage varies. No specific data for this procedure — verify with target payers.',
    },
    major_device_competitors: [],
    market_leader: 'Unknown — not in Terrain database',
    market_leader_share_pct: undefined,
    current_standard_of_care:
      'Not available — procedure not in Terrain database. Results use category-level estimates.',
    cagr_5yr: defaults.growth,
    growth_driver: 'Category-level growth estimate. Verify with procedure-specific data.',
  };
}

function getAddressabilityFactor(input: DeviceMarketSizingInput): number {
  // SAM is narrower than TAM based on target setting fit
  const settingFactors: Record<string, number> = {
    hospital_inpatient: 0.45,
    hospital_outpatient: 0.3,
    asc: 0.2,
    office: 0.15,
    home: 0.25,
    lab: 0.6,
  };
  const settingFactor = input.target_setting.reduce((sum, s) => sum + (settingFactors[s] || 0.2), 0);
  return Math.min(settingFactor, 0.8);
}

function buildRevenueStreams(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  baseShare: number,
): RevenueStreamBreakdown[] {
  const streams: RevenueStreamBreakdown[] = [];
  const capturedProcedures = Math.round(procedure.us_annual_procedures * baseShare);

  // Primary revenue stream
  const primaryRevenue = (capturedProcedures * input.unit_ase) / 1e6;
  streams.push({
    stream: input.pricing_model === 'per_unit_capital' ? 'Capital Equipment' : 'Device / Procedure Revenue',
    annual_revenue_per_unit: input.unit_ase,
    total_units_or_procedures: capturedProcedures,
    gross_revenue_m: parseFloat(primaryRevenue.toFixed(1)),
    contribution_pct: 0, // calculated after all streams
  });

  // Disposables stream (if applicable)
  if (input.disposables_per_procedure && input.disposable_ase) {
    const disposableRevenue = (capturedProcedures * input.disposables_per_procedure * input.disposable_ase) / 1e6;
    streams.push({
      stream: 'Disposables & Consumables',
      annual_revenue_per_unit: input.disposables_per_procedure * input.disposable_ase,
      total_units_or_procedures: capturedProcedures,
      gross_revenue_m: parseFloat(disposableRevenue.toFixed(1)),
      contribution_pct: 0,
    });
  }

  // Service contracts (capital equipment)
  if (input.service_contract_annual && input.pricing_model === 'per_unit_capital') {
    // Assume installed base grows to match capturedProcedures worth of systems
    const installedSystems = Math.round(
      capturedProcedures /
        (procedure.us_annual_procedures / (procedure.eligible_sites.hospitals + (procedure.eligible_sites.ascs || 0))),
    );
    const serviceRevenue = (installedSystems * input.service_contract_annual) / 1e6;
    streams.push({
      stream: 'Service & Maintenance Contracts',
      annual_revenue_per_unit: input.service_contract_annual,
      total_units_or_procedures: installedSystems,
      gross_revenue_m: parseFloat(serviceRevenue.toFixed(1)),
      contribution_pct: 0,
    });
  }

  // Calculate contribution percentages
  const totalRevenue = streams.reduce((sum, s) => sum + s.gross_revenue_m, 0);
  return streams.map((s) => ({
    ...s,
    contribution_pct: parseFloat(((s.gross_revenue_m / totalRevenue) * 100).toFixed(1)),
  }));
}

function buildAdoptionModel(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  shareRange: { low: number; base: number; high: number },
) {
  const totalSites =
    (procedure.eligible_sites.hospitals || 0) +
    (procedure.eligible_sites.ascs || 0) +
    (procedure.eligible_sites.clinics || 0);

  const addressableSites = Math.round(totalSites * getAddressabilityFactor(input));

  return {
    total_us_sites: totalSites,
    addressable_sites: addressableSites,
    peak_market_share: {
      low: parseFloat((shareRange.low * 100).toFixed(1)),
      base: parseFloat((shareRange.base * 100).toFixed(1)),
      high: parseFloat((shareRange.high * 100).toFixed(1)),
    },
    peak_installed_base:
      input.pricing_model === 'per_unit_capital' ? Math.round(addressableSites * shareRange.base) : undefined,
    years_to_peak: input.pricing_model === 'per_unit_capital' ? 7 : 5,
  };
}

// Device market geographic distribution differs from pharma:
// - EU device market is relatively larger (higher hospital CapEx, universal coverage for procedures)
// - Japan device market is relatively larger (aging population, high procedure volumes)
// - China device market is relatively smaller for high-end devices (VBP pricing pressure, local competitors)
// Source: Evaluate MedTech World Preview 2024, IQVIA MedTech Market Report 2024
const DEVICE_MULTIPLIER_ADJUSTMENT: Record<string, number> = {
  US: 1.0,
  EU5: 1.25, // EU device market ~50% of US (vs 40% pharma) — more procedures, universal access
  Germany: 1.3, // Largest EU device market; strong hospital infrastructure
  France: 1.2, // High adoption of innovative devices; liste en sus program
  Italy: 1.1, // Lower device spending but high procedure volumes
  Spain: 1.1, // Growing MedTech market
  UK: 1.0, // NHS cost-constrained but NICE innovation pathway
  Japan: 1.3, // Aging population drives high device/procedure volumes
  China: 0.7, // VBP drives down device pricing; local competition intense
  Canada: 1.1, // Similar to US but smaller scale
  Australia: 1.1, // High per-capita device spending
  RoW: 0.8, // Variable but generally lower for premium devices
};

function buildDeviceGeographyBreakdown(
  geographies: string[],
  us_tam_billions: number,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
) {
  // Expand 'Global' to all individual territories
  const expandedGeos = geographies.includes('Global')
    ? [
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
      ]
    : geographies;

  return expandedGeos
    .map((geo) => {
      const territory = TERRITORY_MULTIPLIERS.find((t) => t.code === geo || t.territory === geo);
      // Apply device-specific adjustment to pharma multiplier
      const pharmaMultiplier = territory?.multiplier ?? 0.5;
      const deviceAdj = DEVICE_MULTIPLIER_ADJUSTMENT[geo] ?? 1.0;
      const multiplier = pharmaMultiplier * deviceAdj;

      const reimbursementNotes: Record<string, string> = {
        US: 'CMS/Medicare coverage; private payer negotiated rates',
        EU5: 'National health system reimbursement; DRG-based hospital payment',
        Germany: 'G-DRG system; NUB application for novel devices; InEK cost data',
        France: 'GHS/GHM system; CNEDIMTS HTA for high-value devices; liste en sus for costly devices',
        Italy: 'DRG-based hospital reimbursement; AGENAS HTA; regional procurement via CONSIP',
        Spain: 'SNS national health system; regional autonomous community procurement; AEMPS device registration',
        UK: 'NHS procurement; NICE medical technologies evaluation; NHSE commercial frameworks',
        Japan: 'NHI reimbursement; PMDA device approval; biennial price revision; C1/C2 reimbursement categories',
        China:
          'NMPA approved; provincial reimbursement catalog listing required; centralized volume-based procurement (VBP)',
        Canada: 'Provincial health authority procurement; CADTH device HTA; group purchasing organizations (GPOs)',
        Australia: 'TGA device registration; MSAC HTA for prostheses list; PBS equivalent for implantables',
        'South Korea': 'MFDS device approval; NHI reimbursement with HIRA HTA; Korean New Health Technology Assessment',
        Brazil: 'ANVISA device registration; SUS public procurement; ANS private insurance coverage; CONITEC HTA',
        India: 'CDSCO device regulation; NPPA price controls; state-level procurement; rapidly growing private sector',
        Mexico: 'COFEPRIS device registration; IMSS/ISSSTE public hospital procurement; UNOPS centralized purchasing',
        Taiwan: 'TFDA device approval; NHI coverage with PBRS agreements; high medtech adoption rate',
        'Saudi Arabia':
          'SFDA device registration; MOH hospital procurement; NUPCO centralized purchasing; Vision 2030 investment',
        Israel: 'MOH device regulation; HMO (kupot holim) procurement; strong medtech early adopter market',
        RoW: 'Variable; tender-based procurement in many markets; WHO prequalification for some device classes',
      };

      const tamVal = us_tam_billions * multiplier;
      return {
        territory: territory?.territory || geo,
        tam:
          tamVal >= 1
            ? { value: parseFloat(tamVal.toFixed(2)), unit: 'B' as const }
            : { value: parseFloat((tamVal * 1000).toFixed(tamVal * 1000 >= 100 ? 0 : 1)), unit: 'M' as const },
        procedure_volume: Math.round(procedure.us_annual_procedures * multiplier * 0.7),
        reimbursement_environment: reimbursementNotes[geo] || 'Country-specific reimbursement framework',
        market_note: territory?.notes || '',
      };
    })
    .sort((a, b) => {
      const aV = a.tam.unit === 'B' ? a.tam.value : a.tam.value / 1000;
      const bV = b.tam.unit === 'B' ? b.tam.value : b.tam.value / 1000;
      return bV - aV;
    });
}

function buildReimbursementAnalysis(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
) {
  const riskMap = {
    covered: 'low' as const,
    coverage_pending: 'moderate' as const,
    unlisted: 'high' as const,
    self_pay: 'high' as const,
  };

  return {
    us_coverage_status:
      procedure.reimbursement.cms_coverage === 'covered'
        ? 'Medicare covered under existing CPT codes'
        : 'Coverage pathway under development',
    primary_cpt_codes: procedure.cpt_codes,
    drg_codes: procedure.drg_codes,
    medicare_payment_rate: procedure.reimbursement.medicare_facility_rate
      ? `$${procedure.reimbursement.medicare_facility_rate.toLocaleString()} facility fee (Medicare)`
      : undefined,
    private_payer_coverage: procedure.reimbursement.private_payer_coverage,
    reimbursement_risk: riskMap[input.reimbursement_status],
    reimbursement_strategy: getReimbursementStrategy(input, procedure),
  };
}

function buildCompetitivePositioning(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
) {
  const benchmarks = DEVICE_PRICING_BENCHMARKS.filter((b) => b.product_category === input.product_category);
  const prices = benchmarks.map((b) => b.hospital_asp_usd).sort((a, b) => a - b);

  return {
    total_competitors: procedure.major_device_competitors.length,
    market_leader: procedure.market_leader,
    leader_market_share_pct: procedure.market_leader_share_pct || 35,
    ase_range: {
      lowest: prices[0] || input.unit_ase * 0.6,
      median: prices[Math.floor(prices.length / 2)] || input.unit_ase,
      highest: prices[prices.length - 1] || input.unit_ase * 1.8,
    },
    key_differentiation_vectors: getDifferentiationVectors(input.device_category),
  };
}

function getReimbursementStrategy(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
): string {
  if (input.reimbursement_status === 'covered') {
    return 'Existing CPT codes support coverage. Focus on health economics data to justify premium ASP vs. incumbent.';
  }
  if (input.reimbursement_status === 'coverage_pending') {
    return 'File New Technology APC or Category III CPT code application. Target BCBS technology assessment for early private payer coverage. NICE/AHA society endorsement accelerates coverage.';
  }
  return 'Novel coverage pathway required. File PLA code (if IVD) or New Technology Add-On Payment (NTAP) with CMS. Build payer-ready health economics package showing cost offsets.';
}

function getDifferentiationVectors(category: DeviceMarketSizingInput['device_category']): string[] {
  const vectors: Record<string, string[]> = {
    cardiovascular: [
      'Clinical outcomes data',
      'Procedure time reduction',
      'Learning curve',
      'Long-term durability',
      'Patient-reported outcomes',
    ],
    orthopedic: [
      'Revision rates',
      'Material innovation',
      'Patient-specific implant capability',
      'OR efficiency',
      'Surgeon preference',
    ],
    neurology: [
      'Anatomical access',
      'Stimulation parameter flexibility',
      'Battery longevity',
      'MRI compatibility',
      'Remote programming',
    ],
    diabetes_metabolic: [
      'Accuracy (MARD)',
      'Wear time',
      'Integration with insulin delivery',
      'Alarm algorithms',
      'Cost per day',
    ],
    oncology_surgical: [
      'Visualization',
      'Margin assessment',
      'Blood loss reduction',
      'Learning curve',
      'Hospital LOS impact',
    ],
    ivd_oncology: [
      'Sensitivity/specificity',
      'Turnaround time',
      'Tissue vs. liquid biopsy',
      'Multi-analyte panel',
      'AI interpretation',
    ],
    default: ['Clinical evidence', 'Ease of use', 'Cost-effectiveness', 'Patient outcomes', 'Workflow integration'],
  };
  return vectors[category] || vectors.default;
}

// ────────────────────────────────────────────────────────────
// CDx HELPERS
// ────────────────────────────────────────────────────────────

function estimateIncidenceFromIndication(indication: string): number {
  // Fallback estimates for common indications not in database
  const estimates: Record<string, number> = {
    nsclc: 236740,
    'lung cancer': 236740,
    'breast cancer': 310720,
    colorectal: 154270,
    melanoma: 100640,
    prostate: 299010,
    leukemia: 60650,
    lymphoma: 89380,
  };
  const q = indication.toLowerCase();
  for (const [key, val] of Object.entries(estimates)) {
    if (q.includes(key)) return val;
  }
  return 50000; // Generic fallback
}

function getDrugStageFactor(stage: string): number {
  const factors: Record<string, number> = {
    preclinical: 0.02,
    phase1: 0.05,
    phase2: 0.15,
    phase3: 0.4,
    approved: 0.65,
  };
  return factors[stage.toLowerCase().replace(' ', '')] || 0.3;
}

function getTestingRate(input: CDxMarketSizingInput): number {
  // Testing adoption depends on how firmly biomarker testing is embedded in guidelines
  const typeRates: Record<string, number> = {
    IHC: 0.8, // Widely available, low cost, high adoption
    FISH: 0.65,
    PCR: 0.75,
    NGS_panel: 0.55, // Growing but not yet universal
    liquid_biopsy: 0.3, // Emerging; not yet standard of care
    WGS: 0.2,
    RNA_seq: 0.25,
  };
  // Adjust for CDx development stage
  const stageAdj =
    input.cdx_development_stage === 'approved'
      ? 1.0
      : input.cdx_development_stage === 'pma_submitted'
        ? 0.75
        : input.cdx_development_stage === 'clinical_validation'
          ? 0.5
          : 0.3;

  return (typeRates[input.test_type] || 0.5) * stageAdj;
}

function getCDxGrossToNet(testType: string): number {
  // Diagnostics have lower gross-to-net than pharma drugs
  const gtm: Record<string, number> = {
    IHC: 0.1,
    FISH: 0.1,
    PCR: 0.12,
    NGS_panel: 0.15,
    liquid_biopsy: 0.18,
    WGS: 0.2,
    RNA_seq: 0.18,
  };
  return gtm[testType] || 0.12;
}

function getCDxReimbursement(testType: string, biomarker: string) {
  const cptByType: Record<string, string[]> = {
    IHC: ['88360', '88361'],
    FISH: ['88368', '88369'],
    PCR: ['81401', '81403'],
    NGS_panel: ['81445', '81455', '81479'],
    liquid_biopsy: ['81479', '0242U'],
    WGS: ['81425', '81426'],
    RNA_seq: ['81479'],
  };

  const cmsRates: Record<string, number> = {
    IHC: 85,
    FISH: 190,
    PCR: 200,
    NGS_panel: 650,
    liquid_biopsy: 500,
    WGS: 1000,
  };

  return {
    cpt_codes: cptByType[testType] || ['81479'],
    cms_rate: cmsRates[testType] || 400,
    private_payer: 'Typically 1.2-2x Medicare rate for approved CDx; LDT coverage varies significantly',
    summary: `${cptByType[testType]?.[0] || '81479'} — Est. Medicare $${cmsRates[testType] || 400}; private payer typically $${Math.round((cmsRates[testType] || 400) * 1.5)}`,
  };
}

function buildCDxDealBenchmark(input: CDxMarketSizingInput, deals: CDxDeal[]) {
  return {
    typical_deal_type: 'Co-development agreement with commercial supply terms',
    cdx_partner_economics: [
      'Milestone payments tied to drug development progress (Phase 2 data, Phase 3 initiation, NDA submission)',
      'PMA milestone upon CDx approval (typically $5-20M)',
      'Supply agreement: CDx company manufactures and sells test; pharma partner receives label exclusivity',
      'Royalty on drug net sales (rare) OR supply margin on test kits (more common)',
    ].join('. '),
    milestones:
      'Phase 2 milestone ($1-5M) → Phase 3 initiation ($2-8M) → Drug NDA filing ($5-15M) → Drug/CDx approval ($10-30M)',
    royalty_or_supply_structure:
      '15-35% gross margin on test supply; or 1-3% royalty on linked drug net sales if negotiated',
    comparable_deals: deals,
  };
}

function buildCDxRegulatoryPathway(input: CDxMarketSizingInput) {
  const isHighRisk = input.biomarker_prevalence_pct < 20; // Rare biomarker = more stringent
  return {
    fda_pathway: 'CDx PMA' as const,
    co_review_with_drug: true,
    timeline_months: {
      optimistic: 18,
      realistic: 24,
    },
    eu_ivdr_class: 'Class C (IVDR) — High individual/moderate public risk',
    post_approval_requirements: [
      'Post-market surveillance study',
      'Annual performance re-evaluation',
      'Labeling updates if drug label changes',
      'CLIA waiver if applicable (POC setting)',
    ],
  };
}

function buildCDxCompetitiveLandscape(input: CDxMarketSizingInput) {
  // Static map of major CDx players and approved tests by indication area
  const indicationArea = input.drug_indication.toLowerCase();
  const isOncology =
    indicationArea.includes('cancer') ||
    indicationArea.includes('tumor') ||
    indicationArea.includes('carcinoma') ||
    indicationArea.includes('lymphoma') ||
    indicationArea.includes('leukemia');

  return {
    approved_tests: isOncology
      ? [
          {
            test: 'cobas EGFR Mutation Test v2',
            company: 'Roche',
            drug: 'Tarceva/Tagrisso/Iressa',
            platform: 'PCR (tissue)',
            approval_year: 2016,
          },
          {
            test: 'FoundationOne CDx',
            company: 'Foundation Medicine (Roche)',
            drug: 'Multiple',
            platform: 'NGS panel',
            approval_year: 2017,
          },
          {
            test: 'therascreen EGFR RGQ PCR Kit',
            company: 'Qiagen',
            drug: 'Iressa',
            platform: 'PCR (tissue)',
            approval_year: 2013,
          },
          {
            test: 'PD-L1 IHC 22C3 pharmDx',
            company: 'Agilent/Dako',
            drug: 'Keytruda',
            platform: 'IHC',
            approval_year: 2015,
          },
          {
            test: 'Guardant360 CDx',
            company: 'Guardant Health',
            drug: 'Lumakras',
            platform: 'liquid biopsy',
            approval_year: 2021,
          },
        ]
      : [
          {
            test: 'Check other indication CDx — contact Ambrosia Ventures',
            company: '—',
            drug: '—',
            platform: '—',
            approval_year: 0,
          },
        ],
    pipeline_tests: [
      {
        test: 'NGS-based multi-analyte CDx',
        company: 'Multiple',
        stage: 'Clinical validation',
        drug_partner: 'Various',
      },
      {
        test: 'Liquid biopsy CDx platforms',
        company: 'Guardant / Foundation / Grail',
        stage: 'Clinical validation / PMA filed',
      },
    ],
    platform_technology_leader:
      'Roche (Foundation Medicine + cobas platform) dominates approved CDx market. Guardant Health leading liquid biopsy CDx.',
    market_insight: `${input.test_type === 'liquid_biopsy' ? 'Liquid biopsy CDx is the fastest-growing segment — offers tissue-free testing for patients without adequate biopsy material. Guardant and Foundation compete intensely.' : 'Tissue-based CDx remains standard for most indications. NGS panels increasingly preferred over single-gene PCR assays as they enable multi-biomarker selection at no added tissue cost.'}`,
  };
}

function buildDeviceMethodology(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  shareRange: { low: number; base: number; high: number },
): string {
  return `
Market sizing for "${input.procedure_or_condition}" was calculated using a procedure volume-based approach.

**Procedure Volume**: Annual US procedure counts sourced from CMS Medicare claims data, Definitive Healthcare procedure volume database, and published surgical society statistics. Procedure growth rate reflects trend data from the prior 5 years with adjustment for demographic aging projections.

**Addressable Market**: Total procedure volume narrowed to addressable subset based on target care setting (${input.target_setting.join(', ')}) and physician specialty focus (${input.physician_specialty.join(', ')}).

**Revenue Model**: Pricing model is ${input.pricing_model}. Base ASP of $${input.unit_ase.toLocaleString()} applied to addressable procedure volume at market share levels consistent with ${input.development_stage} stage devices (${(shareRange.low * 100).toFixed(0)}-${(shareRange.high * 100).toFixed(0)}% at peak).

${input.disposables_per_procedure ? `**Disposables**: ${input.disposables_per_procedure} disposable units per procedure at $${input.disposable_ase}/unit generate recurring revenue estimated separately from capital/device revenue.` : ''}

${input.service_contract_annual ? `**Service Contracts**: Annual service revenue of $${input.service_contract_annual.toLocaleString()}/installed system modeled on ${input.pricing_model === 'per_unit_capital' ? '65% attachment rate' : 'standard attachment'}.` : ''}

**Geography**: US baseline scaled using GDP-adjusted healthcare spend multipliers calibrated to device (not pharmaceutical) market dynamics.

**Revenue Ramp**: ${input.pricing_model === 'per_unit_capital' || input.pricing_model === 'bundle' ? 'Capital equipment ramp applied — longer adoption curve (7 years to peak) reflecting hospital procurement cycles, committee approvals, and physician training requirements.' : 'Standard device adoption ramp applied (5 years to peak).'}

*This analysis reflects commercial market opportunity and does not incorporate probability of regulatory clearance/approval.*
  `.trim();
}

function buildCDxMethodology(input: CDxMarketSizingInput, usIncidence: number): string {
  return `
CDx market sizing for ${input.biomarker} testing in ${input.drug_indication} was calculated using a patient testing funnel approach.

**Testing Funnel**: US incidence of ${usIncidence.toLocaleString()} patients serves as the starting cohort. Testing adoption rate of ${(getTestingRate(input) * 100).toFixed(0)}% applied based on ${input.test_type} platform adoption curves and current NCCN guideline recommendations.

**Biomarker Prevalence**: ${input.biomarker_prevalence_pct}% of tested patients expected to be ${input.biomarker} positive based on published epidemiological literature.

**Repeat Testing**: Estimated ${(35).toFixed(0)}% of biomarker-positive patients receive repeat testing for treatment monitoring and resistance detection, generating additional test volume beyond initial diagnosis.

**Revenue**: Test ASP of $${input.test_ase} applied with ${(getCDxGrossToNet(input.test_type) * 100).toFixed(0)}% gross-to-net discount typical for ${input.test_type} platforms.

**Reimbursement**: CPT-code based reimbursement analyzed using 2024 CMS Clinical Laboratory Fee Schedule. Private payer rates estimated at 1.2-1.8x Medicare.
  `.trim();
}

// ────────────────────────────────────────────────────────────
// CATEGORY-SPECIFIC ADOPTION CURVES
// Replaces the 2 generic ramps with 8 category-specific curves
// ────────────────────────────────────────────────────────────

const CATEGORY_ADOPTION_CURVES: Record<
  string,
  { factors: number[]; learning_curve: number; peak_year: number; narrative: string }
> = {
  structural_heart: {
    factors: [0.05, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95, 1.0, 1.0, 0.98],
    learning_curve: 0.85,
    peak_year: 8,
    narrative:
      'Structural heart devices require proctor-supervised cases (typically 25-50) before independent use. Slow year 1-2, steep growth as centers gain experience.',
  },
  orthopedic_implant: {
    factors: [0.08, 0.18, 0.32, 0.5, 0.68, 0.82, 0.92, 0.98, 1.0, 0.97],
    learning_curve: 0.9,
    peak_year: 9,
    narrative:
      'Surgeon preference-driven market. Moderate switching costs. Robotic-assisted adoption accelerating timeline for differentiated implants.',
  },
  neuromodulation: {
    factors: [0.04, 0.12, 0.25, 0.42, 0.58, 0.72, 0.85, 0.94, 1.0, 0.98],
    learning_curve: 0.8,
    peak_year: 9,
    narrative:
      'Slow initial ramp — implanting center accreditation, patient awareness campaigns, and payer coverage building all sequential gates.',
  },
  diagnostics_ivd: {
    factors: [0.1, 0.28, 0.48, 0.68, 0.82, 0.92, 0.98, 1.0, 0.98, 0.95],
    learning_curve: 0.95,
    peak_year: 8,
    narrative:
      'Lab procurement cycles shorter than hospital capital. Less physician training needed. Reagent-rental model reduces adoption friction.',
  },
  samd_digital: {
    factors: [0.12, 0.3, 0.52, 0.72, 0.88, 0.96, 1.0, 0.98, 0.95, 0.9],
    learning_curve: 0.98,
    peak_year: 7,
    narrative:
      'Fastest ramp — no physical supply chain, instant deployment via cloud. But also fastest commoditization and competitive erosion post-peak.',
  },
  capital_equipment: {
    factors: [0.03, 0.1, 0.22, 0.38, 0.55, 0.7, 0.82, 0.92, 1.0, 0.98],
    learning_curve: 0.75,
    peak_year: 9,
    narrative:
      'Slowest adoption — hospital capital budget cycles (1-3 year planning), value analysis committee approvals, installation and training periods.',
  },
  monitoring_wearable: {
    factors: [0.08, 0.22, 0.42, 0.62, 0.78, 0.9, 0.97, 1.0, 0.96, 0.92],
    learning_curve: 0.95,
    peak_year: 8,
    narrative:
      'Consumer-like adoption if insurance-covered. Slower for clinical-grade remote patient monitoring requiring prescriber workflows.',
  },
  surgical_instruments: {
    factors: [0.06, 0.18, 0.35, 0.55, 0.72, 0.86, 0.95, 1.0, 0.98, 0.95],
    learning_curve: 0.85,
    peak_year: 8,
    narrative:
      'Medium ramp — surgeon training and proctoring needed, but disposable/single-use model reduces capital barrier to adoption.',
  },
};

function getAdoptionCurve(
  productCategory: string,
  deviceCategory: string,
): { factors: number[]; learning_curve: number; peak_year: number; narrative: string } {
  // Map product_category + device_category to the right curve
  if (productCategory === 'device_capital_equipment') return CATEGORY_ADOPTION_CURVES.capital_equipment;
  if (productCategory === 'device_digital_health') return CATEGORY_ADOPTION_CURVES.samd_digital;
  if (productCategory === 'device_monitoring') return CATEGORY_ADOPTION_CURVES.monitoring_wearable;
  if (productCategory.startsWith('diagnostics_')) return CATEGORY_ADOPTION_CURVES.diagnostics_ivd;
  if (productCategory === 'device_point_of_care') return CATEGORY_ADOPTION_CURVES.diagnostics_ivd;

  // Device category-specific mapping
  if (deviceCategory === 'cardiovascular') return CATEGORY_ADOPTION_CURVES.structural_heart;
  if (deviceCategory === 'orthopedic') return CATEGORY_ADOPTION_CURVES.orthopedic_implant;
  if (deviceCategory === 'neurology') return CATEGORY_ADOPTION_CURVES.neuromodulation;

  // Fallback to surgical instruments for device_surgical, or generic
  if (productCategory === 'device_surgical') return CATEGORY_ADOPTION_CURVES.surgical_instruments;

  // Default fallback
  return {
    factors: DEVICE_REVENUE_RAMP as unknown as number[],
    learning_curve: 0.9,
    peak_year: 7,
    narrative: 'Standard device adoption curve applied.',
  };
}

// ────────────────────────────────────────────────────────────
// REIMBURSEMENT ANALYTICS FUNCTIONS
// ────────────────────────────────────────────────────────────

function calculateNTAPBenefit(deviceCost: number, drgPayment: number): NTAPCalculation {
  const excessCost = Math.max(0, deviceCost - drgPayment);
  const eligible = excessCost > 0;
  const ntapPayment = eligible ? excessCost * 0.65 : 0; // 65% of excess (FY2024 CMS rule)
  const effectiveCoverage = eligible
    ? ((drgPayment + ntapPayment) / deviceCost) * 100
    : (drgPayment / deviceCost) * 100;

  const currentYear = new Date().getFullYear();
  const nextFiscalYear = new Date().getMonth() >= 9 ? currentYear + 2 : currentYear + 1;

  return {
    eligible,
    drg_payment: drgPayment,
    device_cost: deviceCost,
    excess_cost: excessCost,
    ntap_payment: parseFloat(ntapPayment.toFixed(0)),
    effective_coverage_pct: parseFloat(effectiveCoverage.toFixed(1)),
    application_deadline: `October 1, ${currentYear} for FY${nextFiscalYear} NTAP (effective April 1, ${nextFiscalYear})`,
    narrative: eligible
      ? `Device cost ($${deviceCost.toLocaleString()}) exceeds DRG payment ($${drgPayment.toLocaleString()}) by $${excessCost.toLocaleString()}. NTAP covers 65% of excess = $${ntapPayment.toLocaleString()} additional reimbursement. Effective hospital coverage: ${effectiveCoverage.toFixed(1)}% of device cost.`
      : `Device cost ($${deviceCost.toLocaleString()}) does not exceed DRG payment ($${drgPayment.toLocaleString()}). NTAP not applicable — device cost is absorbed within standard DRG reimbursement.`,
  };
}

function buildPayerMixModel(siteOfCare: string[], deviceCategory: string, medicareRate?: number): PayerMixModel {
  // Payer mix by primary site of care
  const PAYER_MIX_BY_SITE: Record<
    string,
    { medicare: number; commercial: number; medicaid: number; self_pay: number }
  > = {
    hospital_inpatient: { medicare: 0.55, commercial: 0.3, medicaid: 0.12, self_pay: 0.03 },
    hospital_outpatient: { medicare: 0.4, commercial: 0.45, medicaid: 0.1, self_pay: 0.05 },
    asc: { medicare: 0.35, commercial: 0.55, medicaid: 0.05, self_pay: 0.05 },
    office: { medicare: 0.3, commercial: 0.55, medicaid: 0.1, self_pay: 0.05 },
    home: { medicare: 0.45, commercial: 0.35, medicaid: 0.15, self_pay: 0.05 },
    lab: { medicare: 0.42, commercial: 0.4, medicaid: 0.13, self_pay: 0.05 },
  };

  // Category adjustments
  const CATEGORY_ADJUSTMENTS: Record<string, { medicare_adj: number; medicaid_adj: number }> = {
    orthopedic: { medicare_adj: 0.08, medicaid_adj: -0.03 }, // Older population
    cardiovascular: { medicare_adj: 0.1, medicaid_adj: -0.05 }, // Heavily Medicare
    neurology: { medicare_adj: 0.05, medicaid_adj: 0.0 },
    diabetes_metabolic: { medicare_adj: 0.05, medicaid_adj: 0.03 },
    ophthalmology: { medicare_adj: 0.12, medicaid_adj: -0.05 }, // Cataract = elderly
  };

  const primarySite = siteOfCare[0] || 'hospital_inpatient';
  const baseMix = PAYER_MIX_BY_SITE[primarySite] || PAYER_MIX_BY_SITE.hospital_inpatient;
  const adj = CATEGORY_ADJUSTMENTS[deviceCategory] || { medicare_adj: 0, medicaid_adj: 0 };

  const medicarePct = Math.min(0.75, baseMix.medicare + adj.medicare_adj);
  const medicaidPct = Math.max(0.02, baseMix.medicaid + adj.medicaid_adj);
  const selfPayPct = baseMix.self_pay;
  const commercialPct = Math.max(0.1, 1 - medicarePct - medicaidPct - selfPayPct);

  const baseRate = medicareRate || 5000; // fallback
  const commercialRate = baseRate * 1.6;
  const medicaidRate = baseRate * 0.78;
  const blendedRate = medicarePct * baseRate + commercialPct * commercialRate + medicaidPct * medicaidRate;

  const payers: PayerMixEntry[] = [
    {
      payer: 'Medicare',
      patient_share_pct: parseFloat((medicarePct * 100).toFixed(1)),
      reimbursement_rate: baseRate,
      coverage_status: 'covered',
      prior_auth_required: false,
    },
    {
      payer: 'Commercial',
      patient_share_pct: parseFloat((commercialPct * 100).toFixed(1)),
      reimbursement_rate: parseFloat(commercialRate.toFixed(0)),
      coverage_status: 'covered',
      prior_auth_required: true,
    },
    {
      payer: 'Medicaid',
      patient_share_pct: parseFloat((medicaidPct * 100).toFixed(1)),
      reimbursement_rate: parseFloat(medicaidRate.toFixed(0)),
      coverage_status: 'covered',
      prior_auth_required: false,
    },
    {
      payer: 'Self-Pay / Uninsured',
      patient_share_pct: parseFloat((selfPayPct * 100).toFixed(1)),
      reimbursement_rate: 0,
      coverage_status: 'not_covered',
      prior_auth_required: false,
    },
  ];

  return {
    payers,
    blended_reimbursement_rate: parseFloat(blendedRate.toFixed(0)),
    commercial_vs_medicare_ratio: parseFloat((commercialRate / baseRate).toFixed(2)),
    narrative: `Payer mix for ${primarySite.replace(/_/g, ' ')} ${deviceCategory} procedures: Medicare ${(medicarePct * 100).toFixed(0)}%, Commercial ${(commercialPct * 100).toFixed(0)}%, Medicaid ${(medicaidPct * 100).toFixed(0)}%. Blended reimbursement rate: $${blendedRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Commercial payers reimburse at ${(commercialRate / baseRate).toFixed(1)}x Medicare rate.`,
  };
}

function buildCoverageTimeline(
  reimbursementStatus: string,
  developmentStage: string,
  productCategory: string,
): CoverageTimeline {
  const milestones: CoverageMilestone[] = [];

  if (developmentStage === 'concept' || developmentStage === 'preclinical') {
    milestones.push(
      { milestone: 'Complete clinical evidence generation', estimated_months: 24, probability: 0.7 },
      { milestone: 'FDA submission', estimated_months: 30, probability: 0.65 },
      { milestone: 'FDA clearance/approval', estimated_months: 42, probability: 0.55 },
      { milestone: 'CPT code application (if needed)', estimated_months: 44, probability: 0.8 },
      { milestone: 'CMS coverage determination', estimated_months: 54, probability: 0.6 },
      { milestone: 'Commercial payer adoption (top 5)', estimated_months: 60, probability: 0.55 },
    );
  } else if (developmentStage === 'clinical_trial') {
    milestones.push(
      { milestone: 'Complete pivotal trial enrollment', estimated_months: 12, probability: 0.75 },
      { milestone: 'FDA submission', estimated_months: 18, probability: 0.7 },
      { milestone: 'FDA clearance/approval', estimated_months: 28, probability: 0.6 },
      { milestone: 'CPT code application', estimated_months: 30, probability: 0.8 },
      { milestone: 'CMS coverage determination', estimated_months: 40, probability: 0.65 },
      { milestone: 'Commercial payer adoption (top 5)', estimated_months: 46, probability: 0.6 },
    );
  } else if (developmentStage === 'fda_submitted') {
    milestones.push(
      { milestone: 'FDA clearance/approval', estimated_months: 8, probability: 0.75 },
      { milestone: 'CPT code effective (if existing code)', estimated_months: 2, probability: 0.9 },
      { milestone: 'NTAP application (if applicable)', estimated_months: 10, probability: 0.7 },
      { milestone: 'MAC LCD coverage decision', estimated_months: 14, probability: 0.65 },
      { milestone: 'Commercial payer medical policy published', estimated_months: 18, probability: 0.6 },
    );
  } else if (reimbursementStatus === 'covered') {
    milestones.push(
      { milestone: 'Existing CPT codes — immediate coverage', estimated_months: 0, probability: 0.95 },
      { milestone: 'GPO contract inclusion', estimated_months: 6, probability: 0.8 },
      { milestone: 'Broad commercial payer adoption', estimated_months: 12, probability: 0.85 },
    );
  } else {
    milestones.push(
      {
        milestone: 'Category III CPT code application',
        estimated_months: 4,
        probability: 0.75,
        dependency: 'FDA clearance',
      },
      { milestone: 'AMA CPT Editorial Panel review', estimated_months: 14, probability: 0.65 },
      { milestone: 'CPT code effective date', estimated_months: 18, probability: 0.6 },
      { milestone: 'CMS gap-fill pricing determination', estimated_months: 22, probability: 0.55 },
      { milestone: 'Commercial payer adoption (top 5)', estimated_months: 28, probability: 0.5 },
    );
  }

  const lastMilestone = milestones[milestones.length - 1];
  const criticalPath =
    milestones
      .filter((m) => m.probability < 0.7)
      .map((m) => m.milestone)
      .join(' → ') || 'Standard coverage pathway';

  return {
    milestones,
    full_coverage_estimate_months: lastMilestone?.estimated_months || 24,
    critical_path: criticalPath,
    narrative: `Estimated ${lastMilestone?.estimated_months || 24} months to broad coverage. ${
      milestones.filter((m) => m.probability < 0.6).length > 0
        ? 'Key risks: ' +
          milestones
            .filter((m) => m.probability < 0.6)
            .map((m) => m.milestone)
            .join(', ') +
          '.'
        : 'No critical coverage risks identified.'
    }`,
  };
}

function buildReimbursementScenarios(
  payerMix: PayerMixModel,
  ntap: NTAPCalculation | undefined,
  deviceASP: number,
): ReimbursementScenario[] {
  const baseReimb = payerMix.blended_reimbursement_rate;
  const ntapBoost = ntap?.eligible ? ntap.ntap_payment : 0;

  return [
    {
      scenario: 'favorable',
      effective_reimbursement: parseFloat((baseReimb + ntapBoost * 1.0 + deviceASP * 0.15).toFixed(0)),
      patient_access_pct: 90,
      revenue_impact_multiplier: 1.3,
      key_assumptions: [
        'NTAP approved and active for 3 years',
        'Commercial payers cover at 1.6-2.0x Medicare',
        'Positive coverage with evidence development (CED) determination',
        'Strong health economics data showing cost offsets',
        'Society guideline endorsement within 12 months',
      ],
      narrative:
        'Favorable scenario assumes successful NTAP application, rapid commercial payer adoption driven by strong clinical evidence and health economics data, and broad Medicare coverage. Revenue impact: 1.3x base case.',
    },
    {
      scenario: 'base',
      effective_reimbursement: parseFloat(baseReimb.toFixed(0)),
      patient_access_pct: 68,
      revenue_impact_multiplier: 1.0,
      key_assumptions: [
        'Standard DRG/APC reimbursement without carve-out',
        'Commercial payers cover at 1.4-1.6x Medicare',
        'Partial prior authorization requirements',
        'Coverage builds over 18-24 months post-clearance',
        'GPO contract achieved within 12 months',
      ],
      narrative:
        'Base scenario reflects standard reimbursement pathway without NTAP advantage. Coverage builds gradually as clinical evidence accumulates. Majority of patients gain access within 24 months.',
    },
    {
      scenario: 'adverse',
      effective_reimbursement: parseFloat((baseReimb * 0.65).toFixed(0)),
      patient_access_pct: 42,
      revenue_impact_multiplier: 0.55,
      key_assumptions: [
        'DRG-bundled reimbursement with no separate payment',
        'Negative or delayed NCD/LCD coverage decision',
        'Commercial payers require extensive prior authorization',
        'Limited clinical evidence at time of launch',
        'GPO contracts delayed or unfavorable pricing',
      ],
      narrative:
        'Adverse scenario: device cost absorbed into existing DRG with no separate payment pathway. Limited patient access due to payer restrictions and prior auth requirements. Revenue impact: 0.55x base case.',
    },
  ];
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE ANALYTICS FUNCTIONS
// ────────────────────────────────────────────────────────────

function buildDeviceCompetitiveShareDistribution(
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  input: DeviceMarketSizingInput,
  benchmarks: typeof DEVICE_PRICING_BENCHMARKS,
): DeviceCompetitiveShareDistribution {
  const competitors = procedure.major_device_competitors;
  const leader = procedure.market_leader;
  const leaderShare = procedure.market_leader_share_pct || 35;

  // Build share estimates
  const entries: DeviceCompetitiveShareEntry[] = [];
  let remainingShare = 100;

  // Market leader
  entries.push({
    name: leader,
    estimated_share_pct: leaderShare,
    basis: 'Market leader — installed base momentum + surgeon preference',
  });
  remainingShare -= leaderShare;

  // Distribute remaining among other competitors
  const others = competitors.filter((c) => c !== leader);
  if (others.length > 0) {
    // Second place gets ~60% of average remaining, diminishing after
    const avgRemaining = remainingShare / others.length;
    others.forEach((comp, i) => {
      const factor = Math.max(0.3, 1.0 - i * 0.15);
      const share = Math.min(remainingShare, avgRemaining * factor);
      entries.push({
        name: comp,
        estimated_share_pct: parseFloat(share.toFixed(1)),
        basis: i === 0 ? 'Strong #2 position' : i === 1 ? 'Established competitor' : 'Niche/emerging competitor',
      });
      remainingShare -= share;
    });
  }

  // "Others" bucket
  if (remainingShare > 1) {
    entries.push({
      name: 'Others',
      estimated_share_pct: parseFloat(remainingShare.toFixed(1)),
      basis: 'Remaining market participants',
    });
  }

  // HHI calculation
  const hhi = entries.reduce((sum, e) => sum + Math.pow(e.estimated_share_pct, 2), 0);
  const hhiIndex = parseFloat(hhi.toFixed(0));
  const concentrationLabel =
    hhiIndex > 5000
      ? ('Monopolistic' as const)
      : hhiIndex > 2500
        ? ('Concentrated' as const)
        : hhiIndex > 1500
          ? ('Moderate' as const)
          : ('Fragmented' as const);

  const top3 = entries.slice(0, 3).reduce((sum, e) => sum + e.estimated_share_pct, 0);

  return {
    competitors: entries,
    hhi_index: hhiIndex,
    concentration_label: concentrationLabel,
    top_3_share_pct: parseFloat(top3.toFixed(1)),
    narrative: `Market is ${concentrationLabel.toLowerCase()} (HHI: ${hhiIndex.toLocaleString()}). Top 3 competitors control ${top3.toFixed(0)}% of the market. ${leader} leads with ${leaderShare}% share. ${concentrationLabel === 'Fragmented' ? 'Fragmented market presents opportunity for differentiated entrant.' : concentrationLabel === 'Concentrated' ? 'Concentrated market — new entrant must demonstrate clear clinical superiority or cost advantage.' : 'Moderate concentration — room for differentiated competitors.'}`,
  };
}

function buildEvidenceGapAnalysis(developmentStage: string, productCategory: string): DeviceEvidenceGapAnalysis {
  const gaps: DeviceEvidenceGap[] = [];

  // Evidence requirements by likely regulatory pathway
  const isPMA = productCategory === 'device_implantable' || productCategory === 'device_drug_delivery';
  const isIVD = productCategory.startsWith('diagnostics_') || productCategory === 'device_point_of_care';
  const isSaMD = productCategory === 'device_digital_health';

  // Clinical evidence
  if (developmentStage === 'concept' || developmentStage === 'preclinical') {
    gaps.push({
      evidence_type: 'Prospective clinical trial',
      current_state: 'No clinical data available',
      gap_severity: 'critical',
      competitive_impact: 'Cannot pursue regulatory clearance or payer coverage without clinical data',
      recommendation: isPMA
        ? 'Design pivotal RCT with FDA alignment via pre-submission meeting'
        : 'Plan 510(k) clinical study or De Novo clinical support',
    });
  }

  // RCT gap
  if (!['cleared_approved', 'commercial'].includes(developmentStage) && isPMA) {
    gaps.push({
      evidence_type: 'Randomized controlled trial (RCT)',
      current_state: developmentStage === 'clinical_trial' ? 'RCT in progress' : 'No RCT planned',
      gap_severity: isPMA ? 'critical' : 'significant',
      competitive_impact: 'PMA pathway requires RCT. Without it, regulatory timeline extends significantly.',
      recommendation:
        'Initiate multicenter RCT with primary endpoint aligned to FDA guidance document for this device category.',
    });
  }

  // Health economics
  gaps.push({
    evidence_type: 'Health economics & outcomes research (HEOR)',
    current_state: ['cleared_approved', 'commercial'].includes(developmentStage)
      ? 'HEOR data may be available'
      : 'No HEOR data generated',
    gap_severity: 'significant',
    competitive_impact:
      'Payers increasingly require cost-effectiveness data for coverage decisions. Without HEOR, coverage timeline extends 12-18 months.',
    recommendation:
      'Develop budget impact model and cost-effectiveness analysis. Include hospital LOS reduction, readmission reduction, and procedural efficiency gains.',
  });

  // Real-world evidence
  if (!['commercial'].includes(developmentStage)) {
    gaps.push({
      evidence_type: 'Real-world evidence / Registry data',
      current_state: 'No registry enrollment',
      gap_severity: 'moderate',
      competitive_impact:
        'Post-market registry data increasingly required for ongoing coverage. Competitors with registry data gain payer preference.',
      recommendation: 'Plan post-market registry or participate in existing society registry (e.g., STS, NCDR, AJRR).',
    });
  }

  // Comparative effectiveness
  gaps.push({
    evidence_type: 'Comparative effectiveness vs. standard of care',
    current_state: ['cleared_approved', 'commercial'].includes(developmentStage)
      ? 'Head-to-head data may exist'
      : 'No head-to-head comparison',
    gap_severity: ['concept', 'preclinical'].includes(developmentStage) ? 'moderate' : 'significant',
    competitive_impact:
      'Without comparative data, physicians default to established devices. Differentiation claims lack evidence support.',
    recommendation: 'Include active comparator arm in pivotal trial or plan post-market comparative study.',
  });

  // Patient-reported outcomes
  if (isPMA || productCategory === 'device_implantable') {
    gaps.push({
      evidence_type: 'Patient-reported outcomes (PROs)',
      current_state: 'PRO instruments not yet selected',
      gap_severity: 'moderate',
      competitive_impact:
        'FDA guidance increasingly emphasizes PROs for device approvals. Payers value patient-centric outcomes.',
      recommendation:
        'Incorporate validated PRO instruments (e.g., EQ-5D, KCCQ for cardiac, PROMIS for orthopedic) in clinical program.',
    });
  }

  const overallScore = Math.max(
    1,
    10 -
      gaps.filter((g) => g.gap_severity === 'critical').length * 3 -
      gaps.filter((g) => g.gap_severity === 'significant').length * 1.5 -
      gaps.filter((g) => g.gap_severity === 'moderate').length * 0.5,
  );

  return {
    gaps,
    overall_evidence_score: parseFloat(overallScore.toFixed(1)),
    narrative: `Evidence readiness score: ${overallScore.toFixed(1)}/10. ${gaps.filter((g) => g.gap_severity === 'critical').length} critical gaps, ${gaps.filter((g) => g.gap_severity === 'significant').length} significant gaps identified. ${gaps.filter((g) => g.gap_severity === 'critical').length > 0 ? 'Critical gaps must be addressed before regulatory submission.' : 'No critical evidence blockers — proceed with regulatory strategy.'}`,
  };
}

function buildPricingPressureModel(
  input: DeviceMarketSizingInput,
  benchmarks: typeof DEVICE_PRICING_BENCHMARKS,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
): DevicePricingPressureModel {
  const categoryBenchmarks = benchmarks.filter((b) => b.product_category === input.product_category);
  const prices = categoryBenchmarks.map((b) => b.hospital_asp_usd).sort((a, b) => a - b);
  const medianASP = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : input.unit_ase;

  // GPO pressure by category
  const GPO_PRESSURE: Record<string, number> = {
    cardiovascular: 4, // Moderate — high-value, differentiated
    orthopedic: 6, // Higher — commoditized segments
    neurology: 3, // Lower — specialty niche
    diabetes_metabolic: 7, // High — CGM becoming commodity
    general_surgery: 8, // Highest — staplers, energy devices highly commoditized
    ivd_oncology: 3, // Lower — specialized tests
    ivd_infectious: 7, // High — rapid tests commoditized
    imaging_radiology: 2, // Low — capital equipment, less GPO pressure
    ophthalmology: 5, // Medium
    respiratory: 6, // Medium-high
  };

  const gpoPressure = GPO_PRESSURE[input.device_category] || 5;
  const competitorCount = procedure.major_device_competitors.length;
  const competitivePressure = Math.min(10, competitorCount * 1.5);

  // Annual ASP erosion
  const baseErosion = -0.02; // 2% base annual erosion
  const gpoEffect = gpoPressure > 6 ? -0.02 : gpoPressure > 3 ? -0.01 : 0;
  const competitiveEffect = competitorCount > 5 ? -0.03 : competitorCount > 3 ? -0.015 : -0.005;
  const totalAnnualErosion = baseErosion + gpoEffect + competitiveEffect;

  // 5-year projected ASP
  const projected = [];
  let asp = input.unit_ase;
  for (let i = 0; i < 5; i++) {
    asp = asp * (1 + totalAnnualErosion);
    projected.push(parseFloat(asp.toFixed(0)));
  }

  const erosionRisk =
    totalAnnualErosion < -0.05
      ? ('high' as const)
      : totalAnnualErosion < -0.03
        ? ('moderate' as const)
        : ('low' as const);

  return {
    current_asp: input.unit_ase,
    category_median_asp: medianASP,
    asp_trend_pct_annual: parseFloat((totalAnnualErosion * 100).toFixed(1)),
    gpo_pressure_score: gpoPressure,
    competitive_pricing_pressure: parseFloat(competitivePressure.toFixed(1)),
    reimbursement_erosion_risk: erosionRisk,
    projected_asp_5yr: projected,
    narrative: `ASP of $${input.unit_ase.toLocaleString()} vs. category median $${medianASP.toLocaleString()}. Projected ${(totalAnnualErosion * 100).toFixed(1)}% annual ASP erosion driven by ${gpoPressure > 6 ? 'strong GPO pressure' : 'moderate GPO dynamics'} and ${competitorCount} competitors. ${erosionRisk === 'high' ? 'High pricing pressure — consider value-based contracting or bundled solutions.' : erosionRisk === 'moderate' ? 'Moderate pricing pressure — maintain differentiation to protect ASP.' : 'Low pricing pressure — novel/differentiated positioning supports premium pricing.'} 5-year projected ASP: $${projected[4]?.toLocaleString() || 'N/A'}.`,
  };
}

// ────────────────────────────────────────────────────────────
// DEAL BENCHMARK FUNCTION
// ────────────────────────────────────────────────────────────

function buildDealBenchmark(input: DeviceMarketSizingInput): MedTechDealBenchmark {
  const categoryDeals = getDealsByCategory(input.device_category);
  const recentDeals = categoryDeals.filter((d) => {
    const dealYear = new Date(d.announced_date).getFullYear();
    return dealYear >= new Date().getFullYear() - 3;
  });

  const dealsWithValue = categoryDeals.filter((d) => d.value_m != null);
  const values = dealsWithValue.map((d) => d.value_m!).sort((a, b) => a - b);
  const medianValue = values.length > 0 ? values[Math.floor(values.length / 2)] : 0;

  // Find hottest categories by deal count
  const allDeals = MEDTECH_DEAL_DATABASE;
  const categoryCounts: Record<string, number> = {};
  allDeals.forEach((d) => {
    categoryCounts[d.device_category] = (categoryCounts[d.device_category] || 0) + 1;
  });
  const hottest = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  return {
    comparable_deals: categoryDeals.slice(0, 8),
    median_deal_value_m: medianValue,
    deal_count_last_3yr: recentDeals.length,
    hottest_categories: hottest,
    narrative: `${categoryDeals.length} comparable ${input.device_category} deals identified. Median transaction value: $${medianValue >= 1000 ? (medianValue / 1000).toFixed(1) + 'B' : medianValue + 'M'}. ${recentDeals.length} deals in last 3 years. ${hottest[0] ? `Hottest M&A categories: ${hottest.join(', ')}.` : ''}`,
  };
}

// ────────────────────────────────────────────────────────────
// TECHNOLOGY READINESS SCORING (NASA TRL-based)
// ────────────────────────────────────────────────────────────

const COMPETITOR_TRL_DEFAULTS: Record<string, { trl_low: number; trl_high: number }> = {
  concept: { trl_low: 1, trl_high: 2 },
  preclinical: { trl_low: 3, trl_high: 4 },
  clinical_trial: { trl_low: 5, trl_high: 6 },
  fda_submitted: { trl_low: 7, trl_high: 7 },
  cleared_approved: { trl_low: 8, trl_high: 8 },
  commercial: { trl_low: 9, trl_high: 9 },
};

const TRL_LABELS: Record<number, string> = {
  1: 'Basic principles observed',
  2: 'Technology concept formulated',
  3: 'Experimental proof of concept',
  4: 'Technology validated in lab',
  5: 'Technology validated in relevant environment',
  6: 'Technology demonstrated in relevant environment',
  7: 'System prototype demonstration in operational environment',
  8: 'System complete and qualified',
  9: 'Actual system proven in operational environment',
};

interface KnownCompetitorTRL {
  name: string;
  device: string;
  category: string;
  trl: number;
  manufacturing_readiness: 'prototype' | 'pilot' | 'scaled' | 'commercial';
  ip_strength: 'weak' | 'moderate' | 'strong' | 'dominant';
  clinical_validation: string;
  years_to_market: number;
}

const KNOWN_COMPETITOR_TRL: KnownCompetitorTRL[] = [
  // Cardiovascular
  {
    name: 'Medtronic',
    device: 'CoreValve Evolut PRO+ (TAVR)',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'Multiple RCTs; STS/ACC TVT Registry',
    years_to_market: 0,
  },
  {
    name: 'Edwards Lifesciences',
    device: 'SAPIEN 3 Ultra RESILIA (TAVR)',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'PARTNER 3 RCT; commercial',
    years_to_market: 0,
  },
  {
    name: 'Abbott',
    device: 'MitraClip G4 (TEER)',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'COAPT RCT; post-market registries',
    years_to_market: 0,
  },
  {
    name: 'Boston Scientific',
    device: 'WATCHMAN FLX Pro (LAAC)',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'PREVAIL, PROTECT-AF RCTs',
    years_to_market: 0,
  },
  {
    name: 'Abbott',
    device: 'Gallant ICD/CRT-D',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'SCD-HeFT, MADIT legacy data',
    years_to_market: 0,
  },
  {
    name: 'Medtronic',
    device: 'Micra AV (Leadless Pacemaker)',
    category: 'cardiovascular',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'Micra AV IDE study; post-market registry',
    years_to_market: 0,
  },
  {
    name: 'JenaValve Technology',
    device: 'Trilogy (TAVR)',
    category: 'cardiovascular',
    trl: 7,
    manufacturing_readiness: 'pilot',
    ip_strength: 'moderate',
    clinical_validation: 'CE Mark; US IDE trial ongoing',
    years_to_market: 2,
  },

  // Orthopedic
  {
    name: 'Stryker',
    device: 'Mako SmartRobotics (TKA/THA)',
    category: 'orthopedic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'Multiple registry studies; 500K+ procedures',
    years_to_market: 0,
  },
  {
    name: 'Zimmer Biomet',
    device: 'ROSA Knee System',
    category: 'orthopedic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'Post-market registry data',
    years_to_market: 0,
  },
  {
    name: 'Smith+Nephew',
    device: 'CORI Surgical System',
    category: 'orthopedic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'moderate',
    clinical_validation: 'Registry-based evidence',
    years_to_market: 0,
  },
  {
    name: 'DePuy Synthes (J&J)',
    device: 'VELYS Robotic-Assisted Solution',
    category: 'orthopedic',
    trl: 8,
    manufacturing_readiness: 'scaled',
    ip_strength: 'strong',
    clinical_validation: '510(k) cleared; early post-market data',
    years_to_market: 0,
  },
  {
    name: 'Conformis',
    device: 'iTotal PS (Patient-Specific TKA)',
    category: 'orthopedic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'moderate',
    clinical_validation: 'Registry data; niche adoption',
    years_to_market: 0,
  },

  // Neurology
  {
    name: 'Medtronic',
    device: 'Percept PC (DBS)',
    category: 'neurology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'DBS pivotal trials; BrainSense technology',
    years_to_market: 0,
  },
  {
    name: 'Abbott',
    device: 'Infinity DBS System',
    category: 'neurology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'PROGRESS pivotal; directional leads',
    years_to_market: 0,
  },
  {
    name: 'Boston Scientific',
    device: 'Vercise Genus DBS',
    category: 'neurology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'INTREPID RCT; CartesiaX lead',
    years_to_market: 0,
  },
  {
    name: 'Nevro',
    device: 'Senza HFX (High-Frequency SCS)',
    category: 'neurology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'SENZA-RCT; HFX-PDN pivotal',
    years_to_market: 0,
  },
  {
    name: 'Abbott',
    device: 'Proclaim XR (SCS)',
    category: 'neurology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'BurstDR pivotal; BURST RCT',
    years_to_market: 0,
  },
  {
    name: 'Medtronic',
    device: 'Inceptiv (Closed-Loop SCS)',
    category: 'neurology',
    trl: 8,
    manufacturing_readiness: 'scaled',
    ip_strength: 'strong',
    clinical_validation: 'Evoke RCT (Saluda); adaptive stimulation',
    years_to_market: 0,
  },

  // Diagnostics — NGS / Liquid Biopsy
  {
    name: 'Foundation Medicine (Roche)',
    device: 'FoundationOne CDx (NGS Panel)',
    category: 'ivd_oncology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: 'PMA approved; multiple CDx labels',
    years_to_market: 0,
  },
  {
    name: 'Guardant Health',
    device: 'Guardant360 CDx (Liquid Biopsy)',
    category: 'ivd_oncology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'PMA approved for KRAS G12C',
    years_to_market: 0,
  },
  {
    name: 'Tempus AI',
    device: 'xT CDx (NGS Panel)',
    category: 'ivd_oncology',
    trl: 8,
    manufacturing_readiness: 'scaled',
    ip_strength: 'moderate',
    clinical_validation: 'PMA approved 2024',
    years_to_market: 0,
  },
  {
    name: 'Exact Sciences',
    device: 'Cologuard Plus (Stool DNA)',
    category: 'ivd_oncology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'BLUE-C pivotal; PMA approved',
    years_to_market: 0,
  },
  {
    name: 'Grail (Illumina)',
    device: 'Galleri (MCED)',
    category: 'ivd_oncology',
    trl: 7,
    manufacturing_readiness: 'pilot',
    ip_strength: 'strong',
    clinical_validation: 'PATHFINDER; NHS-Galleri trial ongoing',
    years_to_market: 2,
  },
  {
    name: 'Natera',
    device: 'Signatera (MRD ctDNA)',
    category: 'ivd_oncology',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'Multiple clinical validation studies; tumor-informed',
    years_to_market: 0,
  },

  // Surgical Robotics
  {
    name: 'Intuitive Surgical',
    device: 'da Vinci 5 Robotic System',
    category: 'general_surgery',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'dominant',
    clinical_validation: '12M+ procedures; multiple RCTs',
    years_to_market: 0,
  },
  {
    name: 'Medtronic',
    device: 'Hugo RAS System',
    category: 'general_surgery',
    trl: 8,
    manufacturing_readiness: 'scaled',
    ip_strength: 'moderate',
    clinical_validation: 'CE Mark obtained; US IDE ongoing',
    years_to_market: 1,
  },
  {
    name: 'Johnson & Johnson (Ottava)',
    device: 'Ottava Robotic Surgical System',
    category: 'general_surgery',
    trl: 6,
    manufacturing_readiness: 'pilot',
    ip_strength: 'moderate',
    clinical_validation: 'Preclinical; cadaver studies',
    years_to_market: 3,
  },
  {
    name: 'CMR Surgical',
    device: 'Versius Robotic System',
    category: 'general_surgery',
    trl: 8,
    manufacturing_readiness: 'scaled',
    ip_strength: 'moderate',
    clinical_validation: 'CE Mark; 10K+ procedures globally',
    years_to_market: 1,
  },

  // Diabetes / Metabolic
  {
    name: 'Dexcom',
    device: 'G7 CGM',
    category: 'diabetes_metabolic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'Multiple pivotal trials; iCGM cleared',
    years_to_market: 0,
  },
  {
    name: 'Abbott',
    device: 'FreeStyle Libre 3',
    category: 'diabetes_metabolic',
    trl: 9,
    manufacturing_readiness: 'commercial',
    ip_strength: 'strong',
    clinical_validation: 'Pivotal trials; 5M+ global users',
    years_to_market: 0,
  },
];

const MANUFACTURING_READINESS_SCORE: Record<string, number> = {
  prototype: 2,
  pilot: 5,
  scaled: 7,
  commercial: 9,
};

const IP_STRENGTH_SCORE: Record<string, number> = {
  weak: 2,
  moderate: 5,
  strong: 7,
  dominant: 9,
};

function buildTechnologyReadinessScoring(competitors: string[], developmentStage: string): TechnologyReadinessScoring {
  const entries: TechnologyReadinessEntry[] = [];

  for (const comp of competitors) {
    // Check if we have a known TRL record for this competitor
    const known = KNOWN_COMPETITOR_TRL.find(
      (k) =>
        k.name.toLowerCase() === comp.toLowerCase() ||
        comp.toLowerCase().includes(k.name.toLowerCase()) ||
        k.name.toLowerCase().includes(comp.toLowerCase()),
    );

    if (known) {
      const mfgScore = MANUFACTURING_READINESS_SCORE[known.manufacturing_readiness];
      const ipScore = IP_STRENGTH_SCORE[known.ip_strength];
      const threatScore = parseFloat((((known.trl * 0.4 + mfgScore * 0.3 + ipScore * 0.3) / 9) * 10).toFixed(1));

      entries.push({
        competitor_name: known.name,
        trl_level: known.trl,
        trl_label: TRL_LABELS[known.trl] || `TRL ${known.trl}`,
        clinical_validation_status: known.clinical_validation,
        manufacturing_readiness: known.manufacturing_readiness,
        ip_strength: known.ip_strength,
        years_to_market: known.years_to_market,
        threat_score: Math.min(10, threatScore),
        narrative: `${known.name} (${known.device}): TRL ${known.trl} — ${TRL_LABELS[known.trl]}. Manufacturing: ${known.manufacturing_readiness}. IP: ${known.ip_strength}. ${known.years_to_market === 0 ? 'Already commercial.' : `Estimated ${known.years_to_market} years to market.`}`,
      });
    } else {
      // Use stage-based defaults
      const defaults = COMPETITOR_TRL_DEFAULTS[developmentStage] || COMPETITOR_TRL_DEFAULTS.clinical_trial;
      const trl = Math.round((defaults.trl_low + defaults.trl_high) / 2);
      const mfgReadiness: TechnologyReadinessEntry['manufacturing_readiness'] =
        trl >= 8 ? 'commercial' : trl >= 6 ? 'scaled' : trl >= 4 ? 'pilot' : 'prototype';
      const ipStrength: TechnologyReadinessEntry['ip_strength'] = trl >= 8 ? 'strong' : trl >= 5 ? 'moderate' : 'weak';
      const mfgScore = MANUFACTURING_READINESS_SCORE[mfgReadiness];
      const ipScore = IP_STRENGTH_SCORE[ipStrength];
      const threatScore = parseFloat((((trl * 0.4 + mfgScore * 0.3 + ipScore * 0.3) / 9) * 10).toFixed(1));
      const yearsToMarket = trl >= 9 ? 0 : trl >= 7 ? 1 : trl >= 5 ? 3 : 5;

      entries.push({
        competitor_name: comp,
        trl_level: trl,
        trl_label: TRL_LABELS[trl] || `TRL ${trl}`,
        clinical_validation_status:
          trl >= 8 ? 'Clinical validation complete' : trl >= 5 ? 'Clinical studies in progress' : 'Preclinical only',
        manufacturing_readiness: mfgReadiness,
        ip_strength: ipStrength,
        years_to_market: yearsToMarket,
        threat_score: Math.min(10, threatScore),
        narrative: `${comp}: Estimated TRL ${trl} based on ${developmentStage} stage. Manufacturing: ${mfgReadiness}. IP: ${ipStrength}. Estimated ${yearsToMarket} years to market.`,
      });
    }
  }

  // Sort by threat score descending
  entries.sort((a, b) => b.threat_score - a.threat_score);

  const avgTrl =
    entries.length > 0 ? parseFloat((entries.reduce((sum, e) => sum + e.trl_level, 0) / entries.length).toFixed(1)) : 0;

  const highestThreat = entries[0]?.competitor_name || 'None identified';
  const commercialCount = entries.filter((e) => e.trl_level >= 9).length;
  const pipelineCount = entries.filter((e) => e.trl_level < 7).length;

  return {
    entries,
    highest_threat_competitor: highestThreat,
    avg_trl: avgTrl,
    narrative: `Technology readiness assessment across ${entries.length} competitors. Average TRL: ${avgTrl}. ${commercialCount} competitors are fully commercial (TRL 9). ${pipelineCount > 0 ? `${pipelineCount} competitors still in development pipeline (TRL <7).` : 'All identified competitors are at or near commercial readiness.'} Highest threat: ${highestThreat} (threat score ${entries[0]?.threat_score || 0}/10).`,
  };
}

// ────────────────────────────────────────────────────────────
// CLINICAL SUPERIORITY MATRIX
// ────────────────────────────────────────────────────────────

interface DeviceClinicalBenchmark {
  device: string;
  company: string;
  category: string;
  sub_category: string;
  success_rate_pct?: number;
  complication_rate_pct?: number;
  procedural_time_minutes?: number;
  hospital_los_days?: number;
  revision_rate_pct?: number;
  primary_endpoint: string;
  data_quality: 'RCT' | 'registry' | 'single_arm' | 'case_series' | 'bench_only';
}

const DEVICE_CLINICAL_BENCHMARKS: DeviceClinicalBenchmark[] = [
  // Cardiovascular — TAVR Valves
  {
    device: 'SAPIEN 3 Ultra RESILIA',
    company: 'Edwards Lifesciences',
    category: 'cardiovascular',
    sub_category: 'tavr',
    success_rate_pct: 96.5,
    complication_rate_pct: 3.4,
    procedural_time_minutes: 62,
    hospital_los_days: 2.8,
    revision_rate_pct: 0.8,
    primary_endpoint: '1-year all-cause mortality + disabling stroke',
    data_quality: 'RCT',
  },
  {
    device: 'Evolut PRO+',
    company: 'Medtronic',
    category: 'cardiovascular',
    sub_category: 'tavr',
    success_rate_pct: 95.8,
    complication_rate_pct: 4.1,
    procedural_time_minutes: 58,
    hospital_los_days: 3.1,
    revision_rate_pct: 1.0,
    primary_endpoint: '1-year all-cause mortality',
    data_quality: 'RCT',
  },
  {
    device: 'ACURATE neo2',
    company: 'Boston Scientific',
    category: 'cardiovascular',
    sub_category: 'tavr',
    success_rate_pct: 94.2,
    complication_rate_pct: 4.8,
    procedural_time_minutes: 55,
    hospital_los_days: 3.0,
    revision_rate_pct: 1.2,
    primary_endpoint: '30-day composite safety',
    data_quality: 'RCT',
  },
  {
    device: 'Trilogy',
    company: 'JenaValve',
    category: 'cardiovascular',
    sub_category: 'tavr',
    success_rate_pct: 92.0,
    complication_rate_pct: 5.5,
    procedural_time_minutes: 70,
    hospital_los_days: 3.5,
    revision_rate_pct: undefined,
    primary_endpoint: '30-day all-cause mortality',
    data_quality: 'single_arm',
  },

  // Cardiovascular — LAA Closure
  {
    device: 'WATCHMAN FLX Pro',
    company: 'Boston Scientific',
    category: 'cardiovascular',
    sub_category: 'laac',
    success_rate_pct: 98.8,
    complication_rate_pct: 2.8,
    procedural_time_minutes: 45,
    hospital_los_days: 1.5,
    revision_rate_pct: 0.3,
    primary_endpoint: 'Procedural success (seal <=5mm)',
    data_quality: 'RCT',
  },
  {
    device: 'Amulet',
    company: 'Abbott',
    category: 'cardiovascular',
    sub_category: 'laac',
    success_rate_pct: 98.9,
    complication_rate_pct: 3.2,
    procedural_time_minutes: 50,
    hospital_los_days: 1.6,
    revision_rate_pct: 0.4,
    primary_endpoint: 'Closure success vs WATCHMAN',
    data_quality: 'RCT',
  },

  // Cardiovascular — ICD / Pacemakers
  {
    device: 'Gallant ICD',
    company: 'Abbott',
    category: 'cardiovascular',
    sub_category: 'icd',
    success_rate_pct: 99.2,
    complication_rate_pct: 3.8,
    procedural_time_minutes: 75,
    hospital_los_days: 1.8,
    revision_rate_pct: 2.5,
    primary_endpoint: 'Appropriate shock delivery',
    data_quality: 'registry',
  },
  {
    device: 'Micra AV',
    company: 'Medtronic',
    category: 'cardiovascular',
    sub_category: 'pacemaker',
    success_rate_pct: 98.3,
    complication_rate_pct: 2.7,
    procedural_time_minutes: 35,
    hospital_los_days: 1.2,
    revision_rate_pct: 0.5,
    primary_endpoint: 'AV synchrony responder rate',
    data_quality: 'RCT',
  },
  {
    device: 'AVEIR DR',
    company: 'Abbott',
    category: 'cardiovascular',
    sub_category: 'pacemaker',
    success_rate_pct: 97.6,
    complication_rate_pct: 3.1,
    procedural_time_minutes: 42,
    hospital_los_days: 1.3,
    revision_rate_pct: 0.7,
    primary_endpoint: 'Dual-chamber leadless pacing safety',
    data_quality: 'single_arm',
  },

  // Orthopedic — TKA Systems / Robotics
  {
    device: 'Mako SmartRobotics TKA',
    company: 'Stryker',
    category: 'orthopedic',
    sub_category: 'tka_robotic',
    success_rate_pct: 97.5,
    complication_rate_pct: 2.1,
    procedural_time_minutes: 90,
    hospital_los_days: 2.0,
    revision_rate_pct: 1.8,
    primary_endpoint: '2-year revision rate',
    data_quality: 'registry',
  },
  {
    device: 'ROSA Knee System',
    company: 'Zimmer Biomet',
    category: 'orthopedic',
    sub_category: 'tka_robotic',
    success_rate_pct: 96.8,
    complication_rate_pct: 2.4,
    procedural_time_minutes: 95,
    hospital_los_days: 2.1,
    revision_rate_pct: 2.0,
    primary_endpoint: 'Mechanical axis alignment',
    data_quality: 'registry',
  },
  {
    device: 'CORI Surgical System',
    company: 'Smith+Nephew',
    category: 'orthopedic',
    sub_category: 'tka_robotic',
    success_rate_pct: 96.2,
    complication_rate_pct: 2.6,
    procedural_time_minutes: 88,
    hospital_los_days: 2.2,
    revision_rate_pct: 2.2,
    primary_endpoint: 'Alignment accuracy',
    data_quality: 'registry',
  },
  {
    device: 'VELYS Robotic-Assisted TKA',
    company: 'DePuy Synthes (J&J)',
    category: 'orthopedic',
    sub_category: 'tka_robotic',
    success_rate_pct: 95.5,
    complication_rate_pct: 2.8,
    procedural_time_minutes: 92,
    hospital_los_days: 2.3,
    revision_rate_pct: undefined,
    primary_endpoint: 'Bone cut accuracy',
    data_quality: 'single_arm',
  },
  {
    device: 'iTotal PS (Patient-Specific)',
    company: 'Conformis',
    category: 'orthopedic',
    sub_category: 'tka_implant',
    success_rate_pct: 95.0,
    complication_rate_pct: 3.0,
    procedural_time_minutes: 80,
    hospital_los_days: 2.2,
    revision_rate_pct: 2.5,
    primary_endpoint: 'Patient satisfaction (KSS)',
    data_quality: 'registry',
  },

  // Neurology — DBS
  {
    device: 'Percept PC DBS',
    company: 'Medtronic',
    category: 'neurology',
    sub_category: 'dbs',
    success_rate_pct: 93.5,
    complication_rate_pct: 5.2,
    procedural_time_minutes: 180,
    hospital_los_days: 2.5,
    revision_rate_pct: 4.5,
    primary_endpoint: 'UPDRS motor score improvement',
    data_quality: 'RCT',
  },
  {
    device: 'Infinity DBS',
    company: 'Abbott',
    category: 'neurology',
    sub_category: 'dbs',
    success_rate_pct: 92.8,
    complication_rate_pct: 5.5,
    procedural_time_minutes: 175,
    hospital_los_days: 2.8,
    revision_rate_pct: 4.8,
    primary_endpoint: 'Directional stimulation efficacy',
    data_quality: 'RCT',
  },
  {
    device: 'Vercise Genus DBS',
    company: 'Boston Scientific',
    category: 'neurology',
    sub_category: 'dbs',
    success_rate_pct: 91.5,
    complication_rate_pct: 5.8,
    procedural_time_minutes: 185,
    hospital_los_days: 2.7,
    revision_rate_pct: 5.0,
    primary_endpoint: 'UPDRS-III off-medication improvement',
    data_quality: 'RCT',
  },

  // Neurology — SCS
  {
    device: 'Senza HFX (10kHz SCS)',
    company: 'Nevro',
    category: 'neurology',
    sub_category: 'scs',
    success_rate_pct: 76.5,
    complication_rate_pct: 7.2,
    procedural_time_minutes: 120,
    hospital_los_days: 1.5,
    revision_rate_pct: 6.0,
    primary_endpoint: '>50% pain relief responder rate',
    data_quality: 'RCT',
  },
  {
    device: 'Proclaim XR BurstDR SCS',
    company: 'Abbott',
    category: 'neurology',
    sub_category: 'scs',
    success_rate_pct: 72.0,
    complication_rate_pct: 7.8,
    procedural_time_minutes: 115,
    hospital_los_days: 1.4,
    revision_rate_pct: 6.5,
    primary_endpoint: 'Pain VAS reduction',
    data_quality: 'RCT',
  },
  {
    device: 'Inceptiv Closed-Loop SCS',
    company: 'Medtronic',
    category: 'neurology',
    sub_category: 'scs',
    success_rate_pct: 80.1,
    complication_rate_pct: 6.5,
    procedural_time_minutes: 125,
    hospital_los_days: 1.5,
    revision_rate_pct: 5.5,
    primary_endpoint: 'Closed-loop vs open-loop pain relief',
    data_quality: 'RCT',
  },

  // Diagnostics — NGS Panels
  {
    device: 'FoundationOne CDx',
    company: 'Foundation Medicine (Roche)',
    category: 'ivd_oncology',
    sub_category: 'ngs_panel',
    success_rate_pct: 99.2,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'Analytical sensitivity/specificity (>99%)',
    data_quality: 'RCT',
  },
  {
    device: 'TruSight Oncology 500',
    company: 'Illumina',
    category: 'ivd_oncology',
    sub_category: 'ngs_panel',
    success_rate_pct: 98.5,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'Concordance with reference methods',
    data_quality: 'single_arm',
  },
  {
    device: 'xT CDx',
    company: 'Tempus AI',
    category: 'ivd_oncology',
    sub_category: 'ngs_panel',
    success_rate_pct: 98.8,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'Analytical validation + CDx claim',
    data_quality: 'single_arm',
  },
  {
    device: 'Oncomine Dx Target Test',
    company: 'Thermo Fisher',
    category: 'ivd_oncology',
    sub_category: 'ngs_panel',
    success_rate_pct: 97.5,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'Analytical sensitivity for key variants',
    data_quality: 'single_arm',
  },

  // Diagnostics — Liquid Biopsy
  {
    device: 'Guardant360 CDx',
    company: 'Guardant Health',
    category: 'ivd_oncology',
    sub_category: 'liquid_biopsy',
    success_rate_pct: 93.5,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'ctDNA detection sensitivity',
    data_quality: 'RCT',
  },
  {
    device: 'FoundationOne Liquid CDx',
    company: 'Foundation Medicine (Roche)',
    category: 'ivd_oncology',
    sub_category: 'liquid_biopsy',
    success_rate_pct: 94.0,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'ctDNA variant detection',
    data_quality: 'single_arm',
  },
  {
    device: 'Signatera (MRD)',
    company: 'Natera',
    category: 'ivd_oncology',
    sub_category: 'liquid_biopsy',
    success_rate_pct: 95.8,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'MRD detection sensitivity (tumor-informed)',
    data_quality: 'registry',
  },
  {
    device: 'Galleri (MCED)',
    company: 'Grail (Illumina)',
    category: 'ivd_oncology',
    sub_category: 'liquid_biopsy',
    success_rate_pct: 51.5,
    complication_rate_pct: undefined,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'Cancer signal detection (>50 cancer types)',
    data_quality: 'single_arm',
  },

  // Surgical Robots
  {
    device: 'da Vinci 5',
    company: 'Intuitive Surgical',
    category: 'general_surgery',
    sub_category: 'robotic_surgery',
    success_rate_pct: 98.5,
    complication_rate_pct: 2.2,
    procedural_time_minutes: 180,
    hospital_los_days: 1.8,
    revision_rate_pct: 0.5,
    primary_endpoint: 'Conversion to open rate',
    data_quality: 'registry',
  },
  {
    device: 'Hugo RAS',
    company: 'Medtronic',
    category: 'general_surgery',
    sub_category: 'robotic_surgery',
    success_rate_pct: 96.0,
    complication_rate_pct: 3.5,
    procedural_time_minutes: 195,
    hospital_los_days: 2.2,
    revision_rate_pct: undefined,
    primary_endpoint: '30-day complication rate (Clavien-Dindo)',
    data_quality: 'single_arm',
  },
  {
    device: 'Versius',
    company: 'CMR Surgical',
    category: 'general_surgery',
    sub_category: 'robotic_surgery',
    success_rate_pct: 95.5,
    complication_rate_pct: 3.8,
    procedural_time_minutes: 200,
    hospital_los_days: 2.3,
    revision_rate_pct: undefined,
    primary_endpoint: 'Operative time and conversion rate',
    data_quality: 'registry',
  },
  {
    device: 'Ion Endoluminal System',
    company: 'Intuitive Surgical',
    category: 'respiratory',
    sub_category: 'robotic_bronchoscopy',
    success_rate_pct: 88.0,
    complication_rate_pct: 2.5,
    procedural_time_minutes: 55,
    hospital_los_days: 0.5,
    revision_rate_pct: undefined,
    primary_endpoint: 'Diagnostic yield for peripheral lung lesions',
    data_quality: 'registry',
  },

  // Diabetes / CGM
  {
    device: 'G7 CGM',
    company: 'Dexcom',
    category: 'diabetes_metabolic',
    sub_category: 'cgm',
    success_rate_pct: undefined,
    complication_rate_pct: 0.5,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'MARD (Mean Absolute Relative Difference)',
    data_quality: 'RCT',
  },
  {
    device: 'FreeStyle Libre 3',
    company: 'Abbott',
    category: 'diabetes_metabolic',
    sub_category: 'cgm',
    success_rate_pct: undefined,
    complication_rate_pct: 0.8,
    procedural_time_minutes: undefined,
    hospital_los_days: undefined,
    revision_rate_pct: undefined,
    primary_endpoint: 'MARD; time in range',
    data_quality: 'RCT',
  },
];

// Category-level benchmark averages (computed at runtime for flexibility)
function getCategoryBenchmarkAverages(category: string): {
  avg_success_rate?: number;
  avg_complication_rate?: number;
  avg_procedural_time?: number;
  avg_hospital_los?: number;
  avg_revision_rate?: number;
} {
  const catEntries = DEVICE_CLINICAL_BENCHMARKS.filter((b) => b.category === category);
  if (catEntries.length === 0) return {};

  const avg = (vals: (number | undefined)[]) => {
    const defined = vals.filter((v): v is number => v != null);
    return defined.length > 0 ? defined.reduce((a, b) => a + b, 0) / defined.length : undefined;
  };

  return {
    avg_success_rate: avg(catEntries.map((e) => e.success_rate_pct)),
    avg_complication_rate: avg(catEntries.map((e) => e.complication_rate_pct)),
    avg_procedural_time: avg(catEntries.map((e) => e.procedural_time_minutes)),
    avg_hospital_los: avg(catEntries.map((e) => e.hospital_los_days)),
    avg_revision_rate: avg(catEntries.map((e) => e.revision_rate_pct)),
  };
}

function buildClinicalSuperiorityMatrix(
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  input: DeviceMarketSizingInput,
): ClinicalSuperiorityMatrix {
  const category = input.device_category;
  const benchmarks = DEVICE_CLINICAL_BENCHMARKS.filter((b) => b.category === category);
  const categoryAvg = getCategoryBenchmarkAverages(category);

  if (benchmarks.length === 0) {
    return {
      entries: [],
      user_device_position: 'insufficient_data',
      key_differentiator: 'No benchmark data available for this category',
      narrative: `No clinical benchmark data available for ${category}. Head-to-head comparison not possible without category-specific clinical outcomes data. Consider generating evidence through clinical studies to establish differentiation.`,
    };
  }

  const entries: ClinicalSuperiorityEntry[] = benchmarks.map((b) => {
    // Superiority score: -5 (much worse than avg) to +5 (much better)
    let scoreComponents = 0;
    let componentCount = 0;

    // Success rate: higher is better
    if (b.success_rate_pct != null && categoryAvg.avg_success_rate != null) {
      const delta = b.success_rate_pct - categoryAvg.avg_success_rate;
      scoreComponents += Math.max(-5, Math.min(5, delta / 2));
      componentCount++;
    }

    // Complication rate: lower is better
    if (b.complication_rate_pct != null && categoryAvg.avg_complication_rate != null) {
      const delta = categoryAvg.avg_complication_rate - b.complication_rate_pct;
      scoreComponents += Math.max(-5, Math.min(5, delta * 1.5));
      componentCount++;
    }

    // Procedural time: lower is better
    if (b.procedural_time_minutes != null && categoryAvg.avg_procedural_time != null) {
      const delta = categoryAvg.avg_procedural_time - b.procedural_time_minutes;
      const pctDelta = delta / categoryAvg.avg_procedural_time;
      scoreComponents += Math.max(-5, Math.min(5, pctDelta * 10));
      componentCount++;
    }

    // Hospital LOS: lower is better
    if (b.hospital_los_days != null && categoryAvg.avg_hospital_los != null) {
      const delta = categoryAvg.avg_hospital_los - b.hospital_los_days;
      scoreComponents += Math.max(-5, Math.min(5, delta * 3));
      componentCount++;
    }

    // Revision rate: lower is better
    if (b.revision_rate_pct != null && categoryAvg.avg_revision_rate != null) {
      const delta = categoryAvg.avg_revision_rate - b.revision_rate_pct;
      scoreComponents += Math.max(-5, Math.min(5, delta * 2));
      componentCount++;
    }

    const superiorityScore = componentCount > 0 ? parseFloat((scoreComponents / componentCount).toFixed(1)) : 0;

    // Build narrative
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    if (b.success_rate_pct != null && categoryAvg.avg_success_rate != null) {
      if (b.success_rate_pct > categoryAvg.avg_success_rate)
        strengths.push(`Success rate ${b.success_rate_pct}% (above avg ${categoryAvg.avg_success_rate.toFixed(1)}%)`);
      else
        weaknesses.push(`Success rate ${b.success_rate_pct}% (below avg ${categoryAvg.avg_success_rate.toFixed(1)}%)`);
    }
    if (b.complication_rate_pct != null && categoryAvg.avg_complication_rate != null) {
      if (b.complication_rate_pct < categoryAvg.avg_complication_rate)
        strengths.push(`Lower complications (${b.complication_rate_pct}%)`);
      else weaknesses.push(`Higher complications (${b.complication_rate_pct}%)`);
    }

    const narrativeParts = [];
    if (strengths.length > 0) narrativeParts.push(`Strengths: ${strengths.join('; ')}`);
    if (weaknesses.length > 0) narrativeParts.push(`Weaknesses: ${weaknesses.join('; ')}`);
    narrativeParts.push(`Data quality: ${b.data_quality}`);

    return {
      competitor_device: b.device,
      company: b.company,
      primary_endpoint: b.primary_endpoint,
      success_rate_pct: b.success_rate_pct,
      complication_rate_pct: b.complication_rate_pct,
      procedural_time_minutes: b.procedural_time_minutes,
      hospital_los_days: b.hospital_los_days,
      revision_rate_pct: b.revision_rate_pct,
      data_quality: b.data_quality,
      superiority_score: superiorityScore,
      narrative: `${b.device} (${b.company}): ${narrativeParts.join('. ')}.`,
    };
  });

  // Sort by superiority score descending
  entries.sort((a, b) => b.superiority_score - a.superiority_score);

  // Determine user device position
  // If user is in early stage with no clinical data, position is insufficient_data
  // Otherwise, estimate based on their development stage as a proxy
  const earlyStages = ['concept', 'preclinical'];
  let userDevicePosition: ClinicalSuperiorityMatrix['user_device_position'];
  let keyDifferentiator: string;

  if (earlyStages.includes(input.development_stage)) {
    userDevicePosition = 'insufficient_data';
    keyDifferentiator = 'Clinical data not yet available — position cannot be assessed until clinical studies complete';
  } else {
    // For devices in clinical trial or later, assume comparable until proven otherwise
    const avgScore = entries.length > 0 ? entries.reduce((sum, e) => sum + e.superiority_score, 0) / entries.length : 0;

    if (avgScore > 1.5) {
      userDevicePosition = 'comparable';
      keyDifferentiator =
        'Existing competitors show strong clinical profiles — differentiation will require demonstrating superior outcomes in head-to-head or registry studies';
    } else if (avgScore > 0) {
      userDevicePosition = 'comparable';
      keyDifferentiator =
        'Market competitors show moderate clinical profiles — opportunity to demonstrate superiority through focused clinical evidence';
    } else {
      userDevicePosition = 'comparable';
      keyDifferentiator =
        'Competitors show mixed clinical profiles — well-designed clinical program could establish a superior position';
    }
  }

  // Identify highest and lowest scored competitors
  const best = entries[0];
  const worst = entries[entries.length - 1];
  const rctCount = entries.filter((e) => e.data_quality === 'RCT').length;
  const sparseDataCount = entries.filter(
    (e) => e.data_quality === 'bench_only' || e.data_quality === 'case_series',
  ).length;

  return {
    entries,
    user_device_position: userDevicePosition,
    key_differentiator: keyDifferentiator,
    narrative: `Clinical superiority matrix for ${category}: ${entries.length} competitor devices benchmarked. ${rctCount} supported by RCT data. ${sparseDataCount > 0 ? `${sparseDataCount} devices have limited evidence (case series or bench only).` : 'All devices have substantial clinical evidence.'} Top performer: ${best?.competitor_device || 'N/A'} (score ${best?.superiority_score || 0}). ${worst && entries.length > 1 ? `Lowest: ${worst.competitor_device} (score ${worst.superiority_score}).` : ''} ${keyDifferentiator}.`,
  };
}

// ────────────────────────────────────────────────────────────
// SURGEON SWITCHING COST MODEL
// ────────────────────────────────────────────────────────────

interface SwitchingCostProfile {
  training_hours: number;
  learning_curve_cases: number;
  credentialing_required: boolean;
  or_workflow_change: 'minimal' | 'moderate' | 'significant' | 'transformative';
  compatibility: 'full' | 'partial' | 'none';
  switching_cost_per_site: number;
  barrier_score: number;
  facilitators: string[];
  inhibitors: string[];
}

const SWITCHING_COST_PROFILES: Record<string, SwitchingCostProfile> = {
  cardiovascular: {
    training_hours: 40,
    learning_curve_cases: 50,
    credentialing_required: true,
    or_workflow_change: 'significant',
    compatibility: 'partial',
    switching_cost_per_site: 85000,
    barrier_score: 8,
    facilitators: [
      'Company-funded proctoring programs (typically 5-10 cases)',
      'Simulator training available at regional training centers',
      'Clinical specialist support during initial cases',
      'Society-endorsed training pathways (e.g., STS, ACC)',
      'Wet lab and cadaver training programs',
    ],
    inhibitors: [
      '50-case proctored requirement for structural heart procedures',
      'Hospital credentialing committee approval (typically 3-6 months)',
      'Catheterization lab equipment compatibility assessment required',
      'OR team retraining required for new device workflow',
      'New imaging integration may require capital investment',
      'Heart team review process must be updated for new device',
    ],
  },
  orthopedic: {
    training_hours: 24,
    learning_curve_cases: 30,
    credentialing_required: false,
    or_workflow_change: 'moderate',
    compatibility: 'partial',
    switching_cost_per_site: 55000,
    barrier_score: 6,
    facilitators: [
      'Surgeon cadaver lab training widely available',
      'Implant company provides initial surgical planning support',
      'Many implant systems compatible with existing instruments',
      'Robotic platform training programs (1-2 day courses)',
      'Online surgical planning software for pre-operative familiarity',
    ],
    inhibitors: [
      '30-case learning curve for robotic-assisted procedures',
      'Surgeon preference creates inertia (familiarity with current system)',
      'Hospital implant contracts with GPO negotiated terms',
      'New instrumentation trays require sterile processing validation',
      'Patient-specific implant systems require new workflow integration',
    ],
  },
  neurology: {
    training_hours: 16,
    learning_curve_cases: 20,
    credentialing_required: false,
    or_workflow_change: 'moderate',
    compatibility: 'partial',
    switching_cost_per_site: 45000,
    barrier_score: 5,
    facilitators: [
      'Company-funded fellowship programs for DBS/SCS training',
      'Remote programming support reduces ongoing training burden',
      'MRI-conditional labeling reduces compatibility barriers',
      'Patient programmer app simplifies post-implant management',
      'Clinical specialist available for programming optimization',
    ],
    inhibitors: [
      '20-case supervised implant requirement typical for new systems',
      'Programming paradigm differences require adjustment period',
      'Existing patient base locked into current system ecosystem',
      'Lead compatibility varies across manufacturers',
      'Institutional programming protocols must be updated',
    ],
  },
  ophthalmology: {
    training_hours: 12,
    learning_curve_cases: 15,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'partial',
    switching_cost_per_site: 30000,
    barrier_score: 4,
    facilitators: [
      'Wet lab training widely available',
      'Short learning curve for experienced surgeons',
      'IOL formulas transferable across platforms',
      'Company-sponsored surgical observation programs',
    ],
    inhibitors: [
      'Surgeon familiarity and comfort with existing IOL platform',
      'A-constant/optimization requires recalibration',
      'OR microscope and phaco system compatibility',
      'Premium IOL requires patient counseling workflow change',
    ],
  },
  diabetes_metabolic: {
    training_hours: 8,
    learning_curve_cases: 0,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'partial',
    switching_cost_per_site: 12000,
    barrier_score: 3,
    facilitators: [
      'Direct-to-patient onboarding simplifies adoption',
      'Mobile app training modules for HCPs',
      'Minimal clinical workflow disruption for CGM',
      'Insurance coverage parity across major CGM systems',
      'Patient self-insertion eliminates clinical procedure requirement',
    ],
    inhibitors: [
      'EHR integration differences across CGM platforms',
      'Patient reluctance to switch if satisfied with current device',
      'Insulin pump compatibility limitations (closed-loop systems)',
      'Formulary/insurance preferred product constraints',
    ],
  },
  diagnostics_ivd: {
    training_hours: 8,
    learning_curve_cases: 0,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'partial',
    switching_cost_per_site: 15000,
    barrier_score: 3,
    facilitators: [
      'Reagent-rental model minimizes upfront capital commitment',
      'Vendor-provided on-site installation and training',
      'CLIA/CAP proficiency testing helps validate new platform',
      'Automated sample processing reduces manual training needs',
      'LIS/LIMS integration support provided by vendor',
    ],
    inhibitors: [
      'Laboratory information system (LIS) integration validation',
      'CLIA/CAP inspection readiness for new platform',
      'Reagent contract minimum volume commitments',
      'Staff retraining for new sample preparation workflows',
      'Method comparison/verification studies required',
    ],
  },
  ivd_oncology: {
    training_hours: 12,
    learning_curve_cases: 0,
    credentialing_required: false,
    or_workflow_change: 'moderate',
    compatibility: 'partial',
    switching_cost_per_site: 25000,
    barrier_score: 4,
    facilitators: [
      'Vendor-provided bioinformatics pipeline support',
      'Cloud-based reporting platforms reduce infrastructure needs',
      'Proficiency testing programs for new assay validation',
      'CDx label may drive adoption for specific therapeutics',
    ],
    inhibitors: [
      'Analytical validation required for new NGS panel (6-12 months)',
      'Bioinformatics pipeline revalidation',
      'Pathologist training on new variant interpretation framework',
      'Report template and clinical interpretation protocol updates',
      'Existing CDx labels may not transfer to new platform',
    ],
  },
  device_digital_health: {
    training_hours: 4,
    learning_curve_cases: 0,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'full',
    switching_cost_per_site: 5000,
    barrier_score: 2,
    facilitators: [
      'Cloud deployment — no hardware installation required',
      'Free trial periods standard in SaMD market',
      'API-based EHR integration (FHIR/HL7)',
      'Minimal physician workflow disruption',
      'Online training modules available on-demand',
    ],
    inhibitors: [
      'IT security review and approval process (2-8 weeks)',
      'EHR integration testing and validation',
      'Clinical workflow customization and configuration',
      'Data migration from existing platform',
    ],
  },
  device_capital_equipment: {
    training_hours: 60,
    learning_curve_cases: 40,
    credentialing_required: true,
    or_workflow_change: 'significant',
    compatibility: 'none',
    switching_cost_per_site: 120000,
    barrier_score: 9,
    facilitators: [
      'Vendor-funded installation and applications training',
      'Trade-in programs for existing capital equipment',
      'Leasing/financing options reduce upfront cost barrier',
      'Clinical applications specialists available for first 90 days',
      'Remote support and software updates post-installation',
    ],
    inhibitors: [
      'Hospital capital budget cycle (1-3 year planning horizon)',
      'Value Analysis Committee approval required',
      'Facility modifications may be needed (power, shielding, space)',
      'OR staff retraining across all shifts (40+ hours per team)',
      'Service contract transition — existing equipment may have years remaining',
      'Clinical evidence required to justify capital expenditure to administration',
    ],
  },
  device_surgical: {
    training_hours: 80,
    learning_curve_cases: 50,
    credentialing_required: true,
    or_workflow_change: 'transformative',
    compatibility: 'none',
    switching_cost_per_site: 200000,
    barrier_score: 9,
    facilitators: [
      'Structured robotic surgery fellowship programs',
      'Dual-console training capability for proctoring',
      'Simulator-based proficiency assessment',
      'Company-funded OR team training programs',
      'Gradual procedure type expansion pathway',
    ],
    inhibitors: [
      '50-case proctored requirement before independent use',
      'New capital equipment needed ($1.5-2.5M per system)',
      'Hospital credentialing committee approval for each surgeon',
      'OR team retraining required (circulating nurse, scrub tech, anesthesia)',
      'Procedure scheduling complexity during learning curve',
      'Instrument and consumable ecosystem lock-in',
      'Multi-year service contract commitment',
    ],
  },
  general_surgery: {
    training_hours: 8,
    learning_curve_cases: 10,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'full',
    switching_cost_per_site: 10000,
    barrier_score: 2,
    facilitators: [
      'Most surgical instruments are interchangeable across vendors',
      'Short in-service training (1-2 hours)',
      'Trial/evaluation programs widely available',
      'GPO contracts allow multi-vendor sourcing',
      'OR staff familiar with general instrument categories',
    ],
    inhibitors: [
      'Surgeon preference items — personal familiarity creates inertia',
      'Instrument tray configuration changes for sterile processing',
      'GPO contract compliance requirements',
      'Marginal cost differences may not justify switching effort',
    ],
  },
  endoscopy_gi: {
    training_hours: 16,
    learning_curve_cases: 25,
    credentialing_required: false,
    or_workflow_change: 'moderate',
    compatibility: 'partial',
    switching_cost_per_site: 40000,
    barrier_score: 5,
    facilitators: [
      'Hands-on training at company experience centers',
      'Scope compatibility across many accessory devices',
      'Company-provided clinical specialists during initial cases',
      'Society guidelines support adoption of advanced techniques',
    ],
    inhibitors: [
      'Endoscope/processor ecosystem lock-in',
      '25-case learning curve for advanced therapeutic endoscopy devices',
      'Reprocessing validation for new scope platforms',
      'Capital investment in processors and scopes as matched system',
    ],
  },
  vascular: {
    training_hours: 20,
    learning_curve_cases: 25,
    credentialing_required: true,
    or_workflow_change: 'moderate',
    compatibility: 'partial',
    switching_cost_per_site: 50000,
    barrier_score: 6,
    facilitators: [
      'Company-sponsored proctoring for initial cases',
      'Catheter/wire platforms have transferable skills',
      'Hybrid OR compatibility across device manufacturers',
      'Online case review and planning tools',
    ],
    inhibitors: [
      'Credentialing requirement for endovascular device deployment',
      'Stent graft sizing and planning software training',
      'Inventory consignment model creates switching friction',
      'Physician preference and technique-specific familiarity',
      'IFU differences may require protocol updates',
    ],
  },
  wound_care: {
    training_hours: 4,
    learning_curve_cases: 5,
    credentialing_required: false,
    or_workflow_change: 'minimal',
    compatibility: 'full',
    switching_cost_per_site: 5000,
    barrier_score: 2,
    facilitators: [
      'Low complexity — staff training in hours, not days',
      'Direct replacement for existing wound care products',
      'No capital equipment required',
      'Clinical outcome data can drive formulary change quickly',
    ],
    inhibitors: [
      'Formulary committee approval required for new product lines',
      'Established wound care protocols embedded in nursing workflows',
      'Cost-per-unit comparisons dominate procurement decisions',
    ],
  },
};

function buildSurgeonSwitchingCostModel(deviceCategory: string, productCategory: string): SurgeonSwitchingCostModel {
  // Try device category first, then product category, then fallback
  let profile = SWITCHING_COST_PROFILES[deviceCategory];

  if (!profile) {
    // Map product categories to closest switching cost profile
    const productCategoryMap: Record<string, string> = {
      device_implantable: 'cardiovascular',
      device_surgical: 'device_surgical',
      device_monitoring: 'diabetes_metabolic',
      device_drug_delivery: 'cardiovascular',
      device_digital_health: 'device_digital_health',
      device_capital_equipment: 'device_capital_equipment',
      device_point_of_care: 'diagnostics_ivd',
      diagnostics_ivd: 'diagnostics_ivd',
      diagnostics_companion: 'ivd_oncology',
      diagnostics_imaging: 'device_capital_equipment',
      diagnostics_liquid_biopsy: 'ivd_oncology',
      diagnostics_pathology: 'ivd_oncology',
    };
    const mappedKey = productCategoryMap[productCategory];
    if (mappedKey) {
      profile = SWITCHING_COST_PROFILES[mappedKey];
    }
  }

  // Fallback to general surgery profile
  if (!profile) {
    profile = SWITCHING_COST_PROFILES.general_surgery;
  }

  const barrierLabel =
    profile.barrier_score >= 8
      ? 'very high'
      : profile.barrier_score >= 6
        ? 'high'
        : profile.barrier_score >= 4
          ? 'moderate'
          : profile.barrier_score >= 2
            ? 'low'
            : 'very low';

  const costLabel =
    profile.switching_cost_per_site >= 100000
      ? `$${(profile.switching_cost_per_site / 1000).toFixed(0)}K`
      : `$${profile.switching_cost_per_site.toLocaleString()}`;

  return {
    training_requirement_hours: profile.training_hours,
    learning_curve_cases: profile.learning_curve_cases,
    credentialing_required: profile.credentialing_required,
    or_workflow_change: profile.or_workflow_change,
    compatibility_with_existing_systems: profile.compatibility,
    estimated_switching_cost_per_site: profile.switching_cost_per_site,
    switching_barrier_score: profile.barrier_score,
    switching_facilitators: profile.facilitators,
    switching_inhibitors: profile.inhibitors,
    narrative: `Switching cost analysis for ${deviceCategory}/${productCategory}: Barrier score ${profile.barrier_score}/10 (${barrierLabel}). Training: ${profile.training_hours} hours required. ${profile.learning_curve_cases > 0 ? `Learning curve: ${profile.learning_curve_cases} supervised cases.` : 'No procedural learning curve.'} ${profile.credentialing_required ? 'Hospital credentialing required.' : 'No formal credentialing needed.'} OR workflow change: ${profile.or_workflow_change}. Estimated switching cost per site: ${costLabel}. ${profile.barrier_score >= 7 ? 'High switching barriers favor incumbents — new entrant must offer compelling clinical or economic advantage to justify transition costs.' : profile.barrier_score >= 4 ? 'Moderate switching barriers — differentiation on outcomes or workflow efficiency can drive adoption.' : 'Low switching barriers — market entry accessible, but commoditization risk is higher.'}`,
  };
}
