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
} from '@/types/devices-diagnostics';

import { PROCEDURE_DATA } from '@/lib/data/procedure-map';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { DEVICE_PRICING_BENCHMARKS } from '@/lib/data/device-pricing-benchmarks';
import { CDX_DEAL_DATABASE } from '@/lib/data/cdx-deals';

// ────────────────────────────────────────────────────────────
// DEVICE STAGE MARKET SHARE RANGES
// Different from pharma — adoption curves driven by clinical
// evidence + reimbursement, not regulatory approval alone
// ────────────────────────────────────────────────────────────
const DEVICE_STAGE_SHARE = {
  concept:           { low: 0.00, base: 0.00, high: 0.01 },
  preclinical:       { low: 0.01, base: 0.02, high: 0.04 },
  clinical_trial:    { low: 0.02, base: 0.05, high: 0.10 },
  fda_submitted:     { low: 0.05, base: 0.10, high: 0.18 },
  cleared_approved:  { low: 0.08, base: 0.15, high: 0.28 },
  commercial:        { low: 0.12, base: 0.22, high: 0.38 },
};

// ────────────────────────────────────────────────────────────
// DEVICE REVENUE RAMP (slower than pharma due to capital cycle,
// clinical learning curve, and ASC/hospital procurement cycles)
// ────────────────────────────────────────────────────────────
const DEVICE_REVENUE_RAMP = [0.08, 0.20, 0.40, 0.62, 0.80, 0.92, 1.0, 1.0, 0.98, 0.95];

// ────────────────────────────────────────────────────────────
// CAPITAL EQUIPMENT INSTALLED BASE RAMP
// Capital deploys slower — hospitals have procurement cycles
// ────────────────────────────────────────────────────────────
const CAPITAL_INSTALLED_RAMP = [0.05, 0.15, 0.30, 0.50, 0.68, 0.82, 0.92, 1.0, 1.0, 0.98];

// ────────────────────────────────────────────────────────────
// MAIN DEVICE CALCULATION FUNCTION
// ────────────────────────────────────────────────────────────
export async function calculateDeviceMarketSizing(
  input: DeviceMarketSizingInput
): Promise<DeviceMarketSizingOutput> {

  // Step 1: Look up procedure data
  const procedure = findProcedure(input.procedure_or_condition);
  if (!procedure) {
    throw new Error(`Procedure/condition not found: "${input.procedure_or_condition}". Please try a related term or contact support.`);
  }

  // Step 2: Determine market share range
  const shareRange = DEVICE_STAGE_SHARE[input.development_stage];

  // Step 3: Calculate revenue streams based on pricing model
  const revenueStreams = buildRevenueStreams(input, procedure, shareRange.base);

  // Step 4: US TAM (total market if dominant player)
  const us_tam_value = (procedure.us_annual_procedures * input.unit_ase) / 1e9;

  // Step 5: US SAM (addressable with your device profile)
  const addressability_factor = getAddressabilityFactor(input);
  const us_sam_value = us_tam_value * addressability_factor;

  // Step 6: US SOM (realistic capture at peak)
  const us_som_base = us_sam_value * shareRange.base;
  const us_som_low  = us_sam_value * shareRange.low;
  const us_som_high = us_sam_value * shareRange.high;

  // Step 7: Geography breakdown
  const geographyBreakdown = buildDeviceGeographyBreakdown(
    input.geography, us_tam_value, procedure
  );

  // Step 8: Global TAM
  const globalTAM = geographyBreakdown.reduce((sum, t) => {
    const val = t.tam.unit === 'B' ? t.tam.value : t.tam.value / 1000;
    return sum + val;
  }, 0);

  // Step 9: Revenue projection
  const ramp = input.pricing_model === 'per_unit_capital' || input.pricing_model === 'bundle'
    ? CAPITAL_INSTALLED_RAMP
    : DEVICE_REVENUE_RAMP;

  const revenueProjection = ramp.map((factor, i) => ({
    year: input.launch_year + i,
    bear:  parseFloat((us_som_low  * factor).toFixed(3)),
    base:  parseFloat((us_som_base * factor).toFixed(3)),
    bull:  parseFloat((us_som_high * factor).toFixed(3)),
  }));

  // Step 10: Adoption model
  const adoptionModel = buildAdoptionModel(input, procedure, shareRange);

  // Step 11: Reimbursement analysis
  const reimbursementAnalysis = buildReimbursementAnalysis(input, procedure);

  // Step 12: Competitive positioning from benchmarks
  const competitivePositioning = buildCompetitivePositioning(input, procedure);

  const dataSources = [
    { name: 'CMS Medicare Fee Schedule 2024', type: 'public' as const, url: 'https://www.cms.gov/medicare/payment' },
    { name: 'AHA Annual Survey of Hospitals 2024', type: 'licensed' as const },
    { name: 'FDA 510(k) / PMA Database', type: 'public' as const, url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm' },
    { name: 'Definitive Healthcare Procedure Volume Data', type: 'licensed' as const },
    { name: 'Ambrosia Ventures Medtech Deal Database', type: 'proprietary' as const },
    { name: 'ASC Association Annual Survey', type: 'public' as const },
  ];

  return {
    summary: {
      us_tam: {
        value: parseFloat(us_tam_value.toFixed(2)),
        unit: us_tam_value >= 1 ? 'B' : 'M',
        confidence: procedure ? 'high' : 'medium',
      },
      us_sam: {
        value: parseFloat(us_sam_value.toFixed(2)),
        unit: us_sam_value >= 1 ? 'B' : 'M',
      },
      us_som: {
        value: parseFloat(us_som_base.toFixed(2)),
        unit: us_som_base >= 1 ? 'B' : 'M',
        range: [parseFloat(us_som_low.toFixed(2)), parseFloat(us_som_high.toFixed(2))],
      },
      global_tam: {
        value: parseFloat(globalTAM.toFixed(2)),
        unit: globalTAM >= 1 ? 'B' : 'M',
      },
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
    methodology: buildDeviceMethodology(input, procedure, shareRange),
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// COMPANION DIAGNOSTIC CALCULATION ENGINE
// ────────────────────────────────────────────────────────────
export async function calculateCDxMarketSizing(
  input: CDxMarketSizingInput
): Promise<CDxOutput> {

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
    low:  total_annual_tests * 0.7  * net_revenue_per_test / 1e6,
    base: total_annual_tests        * net_revenue_per_test / 1e6,
    high: total_annual_tests * 1.3  * net_revenue_per_test / 1e6,
  };

  // Step 4: Find comparable CDx deals
  const comparableDeals = CDX_DEAL_DATABASE.filter(d =>
    d.indication.toLowerCase().includes(input.drug_indication.toLowerCase().split(' ')[0]) ||
    d.cdx_company.toLowerCase().includes('roche') || // Most deals involve major Dx companies
    d.test_type === input.test_type
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
      { name: 'FDA Companion Diagnostics Database', type: 'public' },
      { name: 'CMS Clinical Laboratory Fee Schedule 2024', type: 'public' },
      { name: 'Ambrosia Ventures CDx Deal Database', type: 'proprietary' },
      { name: 'NCCN Biomarker Testing Guidelines', type: 'public' },
    ],
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function findProcedure(name: string) {
  const q = name.toLowerCase().trim();
  return PROCEDURE_DATA.find(p =>
    p.name.toLowerCase() === q ||
    p.synonyms.some(s => s.toLowerCase() === q || s.toLowerCase().includes(q)) ||
    q.includes(p.name.toLowerCase())
  ) || null;
}

function getAddressabilityFactor(input: DeviceMarketSizingInput): number {
  // SAM is narrower than TAM based on target setting fit
  const settingFactors: Record<string, number> = {
    hospital_inpatient: 0.45,
    hospital_outpatient: 0.30,
    asc: 0.20,
    office: 0.15,
    home: 0.25,
    lab: 0.60,
  };
  const settingFactor = input.target_setting.reduce((sum, s) => sum + (settingFactors[s] || 0.2), 0);
  return Math.min(settingFactor, 0.80);
}

function buildRevenueStreams(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  baseShare: number
): RevenueStreamBreakdown[] {
  const streams: RevenueStreamBreakdown[] = [];
  const capturedProcedures = Math.round(procedure.us_annual_procedures * baseShare);

  // Primary revenue stream
  const primaryRevenue = capturedProcedures * input.unit_ase / 1e6;
  streams.push({
    stream: input.pricing_model === 'per_unit_capital' ? 'Capital Equipment' : 'Device / Procedure Revenue',
    annual_revenue_per_unit: input.unit_ase,
    total_units_or_procedures: capturedProcedures,
    gross_revenue_m: parseFloat(primaryRevenue.toFixed(1)),
    contribution_pct: 0, // calculated after all streams
  });

  // Disposables stream (if applicable)
  if (input.disposables_per_procedure && input.disposable_ase) {
    const disposableRevenue = capturedProcedures * input.disposables_per_procedure * input.disposable_ase / 1e6;
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
    const installedSystems = Math.round(capturedProcedures / (procedure.us_annual_procedures / (procedure.eligible_sites.hospitals + (procedure.eligible_sites.ascs || 0))));
    const serviceRevenue = installedSystems * input.service_contract_annual / 1e6;
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
  return streams.map(s => ({
    ...s,
    contribution_pct: parseFloat(((s.gross_revenue_m / totalRevenue) * 100).toFixed(1)),
  }));
}

function buildAdoptionModel(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  shareRange: { low: number; base: number; high: number }
) {
  const totalSites = (procedure.eligible_sites.hospitals || 0) +
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
    peak_installed_base: input.pricing_model === 'per_unit_capital'
      ? Math.round(addressableSites * shareRange.base)
      : undefined,
    years_to_peak: input.pricing_model === 'per_unit_capital' ? 7 : 5,
  };
}

function buildDeviceGeographyBreakdown(
  geographies: string[],
  us_tam_billions: number,
  procedure: NonNullable<ReturnType<typeof findProcedure>>
) {
  return geographies.map(geo => {
    const territory = TERRITORY_MULTIPLIERS.find(t => t.code === geo || t.territory === geo);
    const multiplier = territory?.multiplier || 0.5;

    const reimbursementNotes: Record<string, string> = {
      'US': 'CMS/Medicare coverage; private payer negotiated rates',
      'EU5': 'National health system reimbursement; DRG-based hospital payment',
      'Germany': 'G-DRG system; NUB application for novel devices',
      'France': 'GHS/GHM system; CNEDIMTS HTA for high-value devices',
      'UK': 'NHS procurement; NICE medical technologies evaluation',
      'Japan': 'NHI reimbursement; PMDA device approval; biennial price revision',
      'China': 'NMPA approved; provincial reimbursement catalog listing required',
      'RoW': 'Variable; tender-based procurement in many markets',
    };

    return {
      territory: territory?.territory || geo,
      tam: {
        value: parseFloat((us_tam_billions * multiplier).toFixed(2)),
        unit: (us_tam_billions * multiplier) >= 1 ? 'B' as const : 'M' as const,
      },
      procedure_volume: Math.round(procedure.us_annual_procedures * multiplier * 0.7),
      reimbursement_environment: reimbursementNotes[geo] || 'Country-specific reimbursement framework',
      market_note: territory?.notes || '',
    };
  }).sort((a, b) => {
    const aV = a.tam.unit === 'B' ? a.tam.value : a.tam.value / 1000;
    const bV = b.tam.unit === 'B' ? b.tam.value : b.tam.value / 1000;
    return bV - aV;
  });
}

function buildReimbursementAnalysis(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>
) {
  const riskMap = {
    covered: 'low' as const,
    coverage_pending: 'moderate' as const,
    unlisted: 'high' as const,
    self_pay: 'high' as const,
  };

  return {
    us_coverage_status: procedure.reimbursement.cms_coverage === 'covered'
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
  procedure: NonNullable<ReturnType<typeof findProcedure>>
) {
  const benchmarks = DEVICE_PRICING_BENCHMARKS.filter(b =>
    b.product_category === input.product_category
  );
  const prices = benchmarks.map(b => b.hospital_asp_usd).sort((a, b) => a - b);

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
  procedure: NonNullable<ReturnType<typeof findProcedure>>
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
    cardiovascular: ['Clinical outcomes data', 'Procedure time reduction', 'Learning curve', 'Long-term durability', 'Patient-reported outcomes'],
    orthopedic: ['Revision rates', 'Material innovation', 'Patient-specific implant capability', 'OR efficiency', 'Surgeon preference'],
    neurology: ['Anatomical access', 'Stimulation parameter flexibility', 'Battery longevity', 'MRI compatibility', 'Remote programming'],
    diabetes_metabolic: ['Accuracy (MARD)', 'Wear time', 'Integration with insulin delivery', 'Alarm algorithms', 'Cost per day'],
    oncology_surgical: ['Visualization', 'Margin assessment', 'Blood loss reduction', 'Learning curve', 'Hospital LOS impact'],
    ivd_oncology: ['Sensitivity/specificity', 'Turnaround time', 'Tissue vs. liquid biopsy', 'Multi-analyte panel', 'AI interpretation'],
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
    'nsclc': 236740, 'lung cancer': 236740,
    'breast cancer': 310720, 'colorectal': 154270,
    'melanoma': 100640, 'prostate': 299010,
    'leukemia': 60650, 'lymphoma': 89380,
  };
  const q = indication.toLowerCase();
  for (const [key, val] of Object.entries(estimates)) {
    if (q.includes(key)) return val;
  }
  return 50000; // Generic fallback
}

function getDrugStageFactor(stage: string): number {
  const factors: Record<string, number> = {
    'preclinical': 0.02, 'phase1': 0.05, 'phase2': 0.15,
    'phase3': 0.40, 'approved': 0.65,
  };
  return factors[stage.toLowerCase().replace(' ', '')] || 0.30;
}

function getTestingRate(input: CDxMarketSizingInput): number {
  // Testing adoption depends on how firmly biomarker testing is embedded in guidelines
  const typeRates: Record<string, number> = {
    'IHC': 0.80,           // Widely available, low cost, high adoption
    'FISH': 0.65,
    'PCR': 0.75,
    'NGS_panel': 0.55,     // Growing but not yet universal
    'liquid_biopsy': 0.30, // Emerging; not yet standard of care
    'WGS': 0.20,
    'RNA_seq': 0.25,
  };
  // Adjust for CDx development stage
  const stageAdj = input.cdx_development_stage === 'approved' ? 1.0 :
                   input.cdx_development_stage === 'pma_submitted' ? 0.75 :
                   input.cdx_development_stage === 'clinical_validation' ? 0.50 : 0.30;

  return (typeRates[input.test_type] || 0.50) * stageAdj;
}

function getCDxGrossToNet(testType: string): number {
  // Diagnostics have lower gross-to-net than pharma drugs
  const gtm: Record<string, number> = {
    'IHC': 0.10, 'FISH': 0.10, 'PCR': 0.12,
    'NGS_panel': 0.15, 'liquid_biopsy': 0.18,
    'WGS': 0.20, 'RNA_seq': 0.18,
  };
  return gtm[testType] || 0.12;
}

function getCDxReimbursement(testType: string, biomarker: string) {
  const cptByType: Record<string, string[]> = {
    'IHC': ['88360', '88361'],
    'FISH': ['88368', '88369'],
    'PCR': ['81401', '81403'],
    'NGS_panel': ['81445', '81455', '81479'],
    'liquid_biopsy': ['81479', '0242U'],
    'WGS': ['81425', '81426'],
    'RNA_seq': ['81479'],
  };

  const cmsRates: Record<string, number> = {
    'IHC': 85, 'FISH': 190, 'PCR': 200,
    'NGS_panel': 650, 'liquid_biopsy': 500, 'WGS': 1000,
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
    milestones: 'Phase 2 milestone ($1-5M) → Phase 3 initiation ($2-8M) → Drug NDA filing ($5-15M) → Drug/CDx approval ($10-30M)',
    royalty_or_supply_structure: '15-35% gross margin on test supply; or 1-3% royalty on linked drug net sales if negotiated',
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
  const isOncology = indicationArea.includes('cancer') || indicationArea.includes('tumor') ||
    indicationArea.includes('carcinoma') || indicationArea.includes('lymphoma') || indicationArea.includes('leukemia');

  return {
    approved_tests: isOncology ? [
      { test: 'cobas EGFR Mutation Test v2', company: 'Roche', drug: 'Tarceva/Tagrisso/Iressa', platform: 'PCR (tissue)', approval_year: 2016 },
      { test: 'FoundationOne CDx', company: 'Foundation Medicine (Roche)', drug: 'Multiple', platform: 'NGS panel', approval_year: 2017 },
      { test: 'therascreen EGFR RGQ PCR Kit', company: 'Qiagen', drug: 'Iressa', platform: 'PCR (tissue)', approval_year: 2013 },
      { test: 'PD-L1 IHC 22C3 pharmDx', company: 'Agilent/Dako', drug: 'Keytruda', platform: 'IHC', approval_year: 2015 },
      { test: 'Guardant360 CDx', company: 'Guardant Health', drug: 'Lumakras', platform: 'liquid biopsy', approval_year: 2021 },
    ] : [
      { test: 'Check other indication CDx — contact Ambrosia Ventures', company: '—', drug: '—', platform: '—', approval_year: 0 },
    ],
    pipeline_tests: [
      { test: 'NGS-based multi-analyte CDx', company: 'Multiple', stage: 'Clinical validation', drug_partner: 'Various' },
      { test: 'Liquid biopsy CDx platforms', company: 'Guardant / Foundation / Grail', stage: 'Clinical validation / PMA filed' },
    ],
    platform_technology_leader: 'Roche (Foundation Medicine + cobas platform) dominates approved CDx market. Guardant Health leading liquid biopsy CDx.',
    market_insight: `${input.test_type === 'liquid_biopsy' ? 'Liquid biopsy CDx is the fastest-growing segment — offers tissue-free testing for patients without adequate biopsy material. Guardant and Foundation compete intensely.' : 'Tissue-based CDx remains standard for most indications. NGS panels increasingly preferred over single-gene PCR assays as they enable multi-biomarker selection at no added tissue cost.'}`,
  };
}

function buildDeviceMethodology(
  input: DeviceMarketSizingInput,
  procedure: NonNullable<ReturnType<typeof findProcedure>>,
  shareRange: { low: number; base: number; high: number }
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
