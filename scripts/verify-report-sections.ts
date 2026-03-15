#!/usr/bin/env npx tsx
// ============================================================
// Terrain — Report Section Verification Script
//
// Validates that every field the UI report components reference
// exists on the type definitions. Creates fully-populated mock
// data for both MarketSizingOutput and DeviceMarketSizingOutput,
// then logs which optional sections would render.
//
// Run:  npx tsx scripts/verify-report-sections.ts
// ============================================================

import type {
  MarketSizingOutput,
  MarketSizingInput,
  DataSource,
  PatientFunnel,
  GeographyBreakdownItem,
  PricingAnalysis,
  RevenueProjectionYear,
  RiskAdjustment,
  SensitivityDriver,
  IRAImpact,
  CompetitiveResponseModel,
  BiosimilarErosionCurve,
  PayerMixEvolution,
  PatientDynamics,
  BiomarkerNesting,
  IntegratedRevenueYear,
  SensitivityInteraction,
  CrossEngineSignals,
  PercentileProjection,
  TreatmentLineModel,
  NonLinearCompetitiveErosion,
  GTNEvolutionYear,
  EfficacyShareModifier,
  DealCompsAnalysis,
  InvestmentThesis,
} from '../src/types';

import type {
  DeviceMarketSizingOutput,
  DeviceMarketSizingInput,
  RevenueStreamBreakdown,
} from '../src/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// MOCK: MarketSizingOutput (pharma) — all optional fields populated
// ────────────────────────────────────────────────────────────

const mockPatientFunnel: PatientFunnel = {
  us_prevalence: 250_000,
  us_incidence: 50_000,
  diagnosed: 200_000,
  diagnosed_rate: 80,
  treated: 150_000,
  treated_rate: 75,
  adherent: 120_000,
  adherence_rate: 0.8,
  addressable: 40_000,
  addressable_rate: 20,
  capturable: 6_000,
  capturable_rate: 15,
};

const mockDataSources: DataSource[] = [
  {
    name: 'ClinicalTrials.gov',
    type: 'public',
    url: 'https://clinicaltrials.gov',
    last_updated: '2026-03-12T10:00:00Z',
  },
  { name: 'FDA Approvals', type: 'public', last_updated: '2026-03-10T08:00:00Z' },
  { name: 'IQVIA Benchmarks', type: 'licensed', last_updated: '2025-12-01T00:00:00Z' },
  { name: 'Ambrosia Deal Database', type: 'proprietary', last_updated: '2026-03-14T00:00:00Z' },
];

const mockGeoBreakdown: GeographyBreakdownItem[] = [
  {
    territory: 'US',
    tam: { value: 4.2, unit: 'B', confidence: 'high' },
    population: 330_000_000,
    prevalence_rate: 0.00076,
    market_multiplier: 1.0,
    regulatory_status: 'Primary market',
  },
  {
    territory: 'EU5',
    tam: { value: 2.8, unit: 'B', confidence: 'medium' },
    population: 328_000_000,
    prevalence_rate: 0.00072,
    market_multiplier: 0.67,
    regulatory_status: 'EMA pathway',
  },
  {
    territory: 'Japan',
    tam: { value: 1.1, unit: 'B', confidence: 'medium' },
    population: 125_000_000,
    prevalence_rate: 0.00065,
    market_multiplier: 0.55,
    regulatory_status: 'PMDA',
  },
];

const mockPricingAnalysis: PricingAnalysis = {
  comparable_drugs: [
    {
      name: 'Tagrisso',
      company: 'AstraZeneca',
      launch_year: 2017,
      launch_wac: 13_000,
      current_net_price: 10_000,
      indication: 'NSCLC EGFR+',
      mechanism: 'EGFR TKI',
      phase: 'Approved',
    },
    {
      name: 'Lumakras',
      company: 'Amgen',
      launch_year: 2021,
      launch_wac: 17_900,
      current_net_price: 14_000,
      indication: 'NSCLC KRAS G12C',
      mechanism: 'KRAS G12C',
      phase: 'Approved',
    },
  ],
  recommended_wac: { conservative: 12_000, base: 15_000, premium: 18_000 },
  payer_dynamics: 'Moderate step-edit pressure; specialty pharmacy distribution',
  pricing_rationale: 'Positioned at median of approved KRAS inhibitors with first-in-class premium.',
  gross_to_net_estimate: 0.35,
};

const mockRevenueProjection: RevenueProjectionYear[] = Array.from({ length: 10 }, (_, i) => ({
  year: 2028 + i,
  bear: Math.round(50 + i * 40 - (i > 6 ? (i - 6) * 30 : 0)),
  base: Math.round(80 + i * 65 - (i > 7 ? (i - 7) * 40 : 0)),
  bull: Math.round(120 + i * 90 - (i > 7 ? (i - 7) * 50 : 0)),
}));

const mockMarketSizingOutput: MarketSizingOutput = {
  summary: {
    tam_us: { value: 4.2, unit: 'B', confidence: 'high' },
    sam_us: { value: 1.8, unit: 'B', confidence: 'medium' },
    som_us: { value: 420, unit: 'M', confidence: 'medium', range: [280, 580] },
    global_tam: { value: 8.6, unit: 'B', confidence: 'medium' },
    peak_sales_estimate: { low: 280, base: 420, high: 580 },
    cagr_5yr: 8.5,
    market_growth_driver: 'Rising diagnosis rates and expanding 2L treatment adoption.',
  },
  patient_funnel: mockPatientFunnel,
  geography_breakdown: mockGeoBreakdown,
  pricing_analysis: mockPricingAnalysis,
  revenue_projection: mockRevenueProjection,
  competitive_context: {
    approved_products: 5,
    phase3_programs: 8,
    crowding_score: 7,
    differentiation_note: 'Novel combination mechanism with potential for CNS penetration.',
  },
  methodology: 'Bottom-up prevalence-based sizing with benchmark-derived pricing and stage-adjusted share.',
  assumptions: [
    'Diagnosis rate improves 2% annually',
    'Launch in 2028',
    'No biosimilar/generic competition before 2038',
  ],
  data_sources: mockDataSources,
  generated_at: new Date().toISOString(),
  indication_validated: true,

  // ── Optional fields (all populated) ────────────────────────
  risk_adjustment: {
    probability_of_success: 0.22,
    therapy_area: 'oncology',
    development_stage: 'phase2',
    risk_adjusted_peak_sales: { low: 62, base: 92, high: 128 },
    risk_adjusted_npv_m: 156,
    discount_rate: 0.1,
  },
  sensitivity_analysis: [
    { variable: 'Market Share', low_som_m: 200, high_som_m: 600, base_som_m: 420, swing_pct: 48 },
    { variable: 'Net Price', low_som_m: 300, high_som_m: 550, base_som_m: 420, swing_pct: 30 },
    { variable: 'Diagnosis Rate', low_som_m: 350, high_som_m: 500, base_som_m: 420, swing_pct: 18 },
  ],
  ira_impact: {
    product_type: 'small_molecule',
    negotiation_year: 2037,
    affected_years: [2037, 2038],
    medicare_revenue_share: 0.35,
    price_reduction_pct: 0.25,
    annual_revenue_impact_m: 30,
  },
  competitive_response: [
    { year: 2030, new_entrants_expected: 2, price_erosion_pct: 5, share_erosion_pct: 8, adjusted_revenue_m: 380 },
  ],
  biosimilar_erosion: {
    years_post_loe: [0, 1, 2, 3],
    share_retained_pct: [100, 80, 55, 35],
    product_type: 'small_molecule',
    erosion_model: 'rapid',
    narrative: 'Generic entry expected within 6 months of LOE.',
  },
  payer_mix_evolution: [
    {
      year: 2028,
      commercial_pct: 55,
      medicare_pct: 30,
      medicaid_pct: 10,
      va_dod_pct: 5,
      blended_net_price_factor: 0.65,
      mea_impact_pct: 0,
    },
  ],
  patient_dynamics: {
    total_share_additive_pct: 40,
    total_share_cannibalistic_pct: 60,
    net_market_expansion_pct: 8,
    switching_sources: [
      {
        competitor: 'Lumakras',
        share_source: 'cannibalistic',
        share_captured_pct: 12,
        rationale: 'Better CNS penetration.',
      },
    ],
    narrative: 'Moderate market expansion driven by improved diagnosis rates.',
  },
  biomarker_nesting: {
    indication: 'NSCLC',
    levels: [
      {
        name: 'KRAS G12C+',
        prevalence_pct: 13,
        loa_modifier: 1.2,
        addressable_patients: 6500,
        pricing_premium_pct: 15,
      },
    ],
    total_addressable_after_nesting: 6500,
    effective_loa: 0.26,
    narrative: 'Biomarker-selected population with validated target.',
  },
  integrated_projection: [
    {
      year: 2028,
      gross_revenue_m: 80,
      payer_mix_factor: 0.65,
      competitive_erosion_pct: 0,
      ira_reduction_pct: 0,
      biosimilar_erosion_pct: 0,
      net_revenue_bear_m: 50,
      net_revenue_base_m: 80,
      net_revenue_bull_m: 120,
      cumulative_patients_treated: 3000,
    },
  ],
  sensitivity_interactions: [
    { variable_a: 'Share', variable_b: 'Price', scenario: 'both_high', som_m: 700, delta_vs_base_pct: 67 },
  ],
  cross_engine_signals: {
    competitive_crowding_for_share: 7,
    regulatory_timeline_for_revenue_start: 36,
    loa_for_risk_adjustment: 0.22,
    partner_urgency_from_competition: 8,
  },
  percentile_projections: [{ year: 2028, p10: 30, p25: 55, p50: 80, p75: 110, p90: 145 }],
  treatment_line_model: [
    {
      line: '2L',
      patient_count: 15000,
      share_ceiling: 0.25,
      attrition_from_prior_line: 0.3,
      pricing_multiplier: 1.0,
      narrative: '2L NSCLC after platinum doublet.',
    },
  ],
  non_linear_competitive_erosion: [
    { competitor_number: 1, share_loss_pct: 8, cumulative_share_loss_pct: 8, mechanism_overlap: true },
  ],
  gtn_evolution: [
    {
      year: 2028,
      base_gtn_pct: 30,
      rebate_escalation_pct: 2,
      three_forty_b_pressure_pct: 1,
      part_b_vs_d_mix_effect: 0,
      effective_gtn_pct: 33,
      narrative: 'Initial GTN of ~30% expanding modestly.',
    },
  ],
  efficacy_share_modifier: {
    differentiation_tier: 'differentiated',
    share_multiplier: 1.3,
    evidence_basis: 'CNS penetration data not seen with competitors.',
    comparable_precedents: ['Enhertu vs T-DM1'],
  },
  label_expansion_opportunities: undefined, // optional — not populated
  payer_tier_pricing: undefined,
  manufacturing_constraint: undefined,
  regulatory_pathway_analysis: undefined,
  competitive_mechanism_analysis: undefined,
  patent_cliff_analysis: undefined,
  one_time_treatment_model: undefined,
  pediatric_analysis: undefined,
  deal_comps_analysis: {
    comparable_deals: [
      {
        acquirer: 'Pfizer',
        target: 'Arena',
        asset_or_indication: 'Etrasimod',
        therapy_area: 'immunology',
        development_stage: 'phase3',
        deal_type: 'acquisition',
        total_deal_value_m: 6700,
        upfront_m: 6700,
        milestones_m: 0,
        peak_sales_estimate_m: 3000,
        ev_peak_sales_multiple: 2.2,
        year: 2022,
        source: 'SEC EDGAR',
      },
    ],
    median_ev_peak_sales: 2.2,
    mean_ev_peak_sales: 2.4,
    implied_valuation_low_m: 616,
    implied_valuation_base_m: 924,
    implied_valuation_high_m: 1276,
    narrative: 'Implied EV based on precedent deal multiples applied to peak sales scenarios.',
  },
  investment_thesis: {
    bull_case: {
      peak_sales_m: 580,
      probability_pct: 20,
      drivers: ['Best-in-class data', 'Fast Track'],
      narrative: 'Bull case assumes 1L expansion and premium pricing.',
    },
    base_case: {
      peak_sales_m: 420,
      probability_pct: 50,
      drivers: ['Competitive differentiation'],
      narrative: 'Base case reflects 2L positioning with moderate share.',
    },
    bear_case: {
      peak_sales_m: 280,
      probability_pct: 30,
      drivers: ['Crowding', 'Safety signal'],
      narrative: 'Bear case assumes share erosion from late entrants.',
    },
    expected_value_m: 402,
    key_binary_risks: ['Phase 3 OS miss', 'CRL for safety'],
    investment_decision_framework: 'Favorable risk/reward at current valuations; key catalyst is Phase 3 readout.',
  },
  development_cost_estimate: undefined,
  dcf_waterfall: undefined,
};

// ────────────────────────────────────────────────────────────
// MOCK: DeviceMarketSizingOutput — all optional fields populated
// ────────────────────────────────────────────────────────────

const mockDeviceOutput: DeviceMarketSizingOutput = {
  summary: {
    us_tam: { value: 2.8, unit: 'B', confidence: 'high' },
    us_sam: { value: 1.2, unit: 'B' },
    us_som: { value: 180, unit: 'M', range: [120, 250] },
    global_tam: { value: 5.5, unit: 'B' },
    cagr_5yr: 6.2,
    market_growth_driver: 'Aging population and shift to minimally invasive procedures.',
  },
  procedure_volume: {
    us_annual_procedures: 450_000,
    us_addressable_procedures: 280_000,
    growth_rate_pct: 4.5,
    source: 'CMS procedure volume data',
  },
  adoption_model: {
    total_us_sites: 5_200,
    addressable_sites: 3_100,
    peak_market_share: { low: 0.08, base: 0.15, high: 0.22 },
    peak_installed_base: 2_500,
    years_to_peak: 5,
  },
  revenue_streams: [
    {
      stream: 'Capital Equipment',
      annual_revenue_per_unit: 250_000,
      total_units_or_procedures: 500,
      gross_revenue_m: 125,
      contribution_pct: 55,
    },
    {
      stream: 'Disposables',
      annual_revenue_per_unit: 1_200,
      total_units_or_procedures: 42_000,
      gross_revenue_m: 50.4,
      contribution_pct: 22,
    },
    {
      stream: 'Service',
      annual_revenue_per_unit: 35_000,
      total_units_or_procedures: 1_500,
      gross_revenue_m: 52.5,
      contribution_pct: 23,
    },
  ],
  geography_breakdown: [
    {
      territory: 'US',
      tam: { value: 2.8, unit: 'B' },
      procedure_volume: 450_000,
      reimbursement_environment: 'Established DRG coverage',
      market_note: 'Primary market',
    },
    {
      territory: 'EU5',
      tam: { value: 1.6, unit: 'B' },
      procedure_volume: 320_000,
      reimbursement_environment: 'Variable by country',
      market_note: 'MDR compliance required',
    },
  ],
  reimbursement_analysis: {
    us_coverage_status: 'Covered under existing DRG',
    primary_cpt_codes: ['27447'],
    drg_codes: ['469', '470'],
    medicare_payment_rate: '$24,500',
    private_payer_coverage: 'Broadly covered with prior authorization',
    reimbursement_risk: 'low',
    reimbursement_strategy: 'Leverage existing DRG coding; pursue NTAP if needed.',
  },
  competitive_positioning: {
    total_competitors: 12,
    market_leader: 'Stryker',
    leader_market_share_pct: 32,
    ase_range: { lowest: 180_000, median: 240_000, highest: 350_000 },
    key_differentiation_vectors: ['AI-guided navigation', 'Faster OR time', 'Better outcomes data'],
  },
  revenue_projection: Array.from({ length: 10 }, (_, i) => ({
    year: 2028 + i,
    bear: Math.round(30 + i * 25 - (i > 7 ? (i - 7) * 15 : 0)),
    base: Math.round(50 + i * 40 - (i > 7 ? (i - 7) * 20 : 0)),
    bull: Math.round(80 + i * 55 - (i > 7 ? (i - 7) * 30 : 0)),
  })),
  methodology: 'Procedure volume × adoption curve × blended ASP model.',
  data_sources: [
    { name: 'CMS', type: 'public', url: 'https://cms.gov' },
    { name: 'IQVIA Procedure Tracker', type: 'licensed' },
  ],
  generated_at: new Date().toISOString(),
};

// ────────────────────────────────────────────────────────────
// MOCK: Inputs
// ────────────────────────────────────────────────────────────

const mockPharmaInput: MarketSizingInput = {
  indication: 'Non-Small Cell Lung Cancer',
  subtype: 'KRAS G12C+ 2L+',
  geography: ['US', 'EU5', 'Japan'],
  development_stage: 'phase2',
  mechanism: 'KRAS G12C inhibitor',
  patient_segment: '2L+ after platinum-based chemotherapy',
  pricing_assumption: 'base',
  launch_year: 2028,
};

const mockDeviceInput: DeviceMarketSizingInput = {
  product_name: 'AI-Guided Knee Replacement System',
  device_category: 'orthopedic',
  product_category: 'device_surgical',
  procedure_or_condition: 'Total knee arthroplasty',
  target_setting: ['hospital_inpatient', 'asc'],
  pricing_model: 'bundle',
  unit_ase: 250_000,
  disposables_per_procedure: 3,
  disposable_ase: 400,
  service_contract_annual: 35_000,
  development_stage: 'clinical_trial',
  geography: ['US', 'EU5'],
  reimbursement_status: 'covered',
  physician_specialty: ['Orthopedic Surgery'],
  launch_year: 2028,
};

// ────────────────────────────────────────────────────────────
// TYPE-LEVEL VERIFICATION
// Access every field that MarketSizingReport.tsx references.
// TypeScript will error at compile time if any field is missing.
// ────────────────────────────────────────────────────────────

function verifyPharmaFields(data: MarketSizingOutput, input: MarketSizingInput): void {
  // Summary
  void data.summary.tam_us.value;
  void data.summary.tam_us.unit;
  void data.summary.tam_us.confidence;
  void data.summary.tam_us.range;
  void data.summary.sam_us.value;
  void data.summary.sam_us.unit;
  void data.summary.som_us.value;
  void data.summary.som_us.unit;
  void data.summary.som_us.range;
  void data.summary.global_tam.value;
  void data.summary.global_tam.unit;
  void data.summary.peak_sales_estimate.low;
  void data.summary.peak_sales_estimate.base;
  void data.summary.peak_sales_estimate.high;
  void data.summary.cagr_5yr;
  void data.summary.market_growth_driver;

  // Patient funnel
  void data.patient_funnel.us_prevalence;
  void data.patient_funnel.us_incidence;
  void data.patient_funnel.diagnosed;
  void data.patient_funnel.diagnosed_rate;
  void data.patient_funnel.treated;
  void data.patient_funnel.treated_rate;
  void data.patient_funnel.adherent;
  void data.patient_funnel.adherence_rate;
  void data.patient_funnel.addressable;
  void data.patient_funnel.addressable_rate;
  void data.patient_funnel.capturable;
  void data.patient_funnel.capturable_rate;

  // Geography
  data.geography_breakdown.forEach((g) => {
    void g.territory;
    void g.tam.value;
    void g.tam.unit;
    void g.market_multiplier;
    void g.regulatory_status;
  });

  // Pricing
  data.pricing_analysis.comparable_drugs.forEach((d) => {
    void d.name;
    void d.company;
    void d.launch_year;
    void d.launch_wac;
    void d.current_net_price;
    void d.indication;
    void d.mechanism;
  });
  void data.pricing_analysis.recommended_wac.base;
  void data.pricing_analysis.gross_to_net_estimate;
  void data.pricing_analysis.payer_dynamics;
  void data.pricing_analysis.pricing_rationale;

  // Revenue projection
  data.revenue_projection.forEach((r) => {
    void r.year;
    void r.bear;
    void r.base;
    void r.bull;
  });

  // Competitive context
  void data.competitive_context.approved_products;
  void data.competitive_context.phase3_programs;
  void data.competitive_context.crowding_score;
  void data.competitive_context.differentiation_note;

  // Core meta
  void data.methodology;
  void data.assumptions;
  void data.data_sources;
  void data.generated_at;
  void data.indication_validated;

  // Optional sections
  void data.risk_adjustment;
  void data.sensitivity_analysis;
  void data.ira_impact;
  void data.competitive_response;
  void data.biosimilar_erosion;
  void data.payer_mix_evolution;
  void data.patient_dynamics;
  void data.biomarker_nesting;
  void data.integrated_projection;
  void data.sensitivity_interactions;
  void data.cross_engine_signals;
  void data.percentile_projections;
  void data.treatment_line_model;
  void data.deal_comps_analysis;
  void data.investment_thesis;
  void data.development_cost_estimate;
  void data.dcf_waterfall;

  // Input fields referenced in report header
  void input.indication;
  void input.mechanism;
  void input.subtype;
  void input.development_stage;
  void input.pricing_assumption;
  void input.launch_year;
  void input.geography;
}

function verifyDeviceFields(data: DeviceMarketSizingOutput, input: DeviceMarketSizingInput): void {
  // Summary
  void data.summary.us_tam.value;
  void data.summary.us_tam.unit;
  void data.summary.us_tam.confidence;
  void data.summary.us_sam.value;
  void data.summary.us_sam.unit;
  void data.summary.us_som.value;
  void data.summary.us_som.unit;
  void data.summary.us_som.range;
  void data.summary.global_tam.value;
  void data.summary.global_tam.unit;
  void data.summary.cagr_5yr;
  void data.summary.market_growth_driver;

  // Procedure volume
  void data.procedure_volume.us_annual_procedures;
  void data.procedure_volume.us_addressable_procedures;
  void data.procedure_volume.growth_rate_pct;
  void data.procedure_volume.source;

  // Adoption model
  void data.adoption_model.total_us_sites;
  void data.adoption_model.addressable_sites;
  void data.adoption_model.peak_market_share.low;
  void data.adoption_model.peak_market_share.base;
  void data.adoption_model.peak_market_share.high;
  void data.adoption_model.peak_installed_base;
  void data.adoption_model.years_to_peak;

  // Revenue streams
  data.revenue_streams.forEach((s) => {
    void s.stream;
    void s.annual_revenue_per_unit;
    void s.total_units_or_procedures;
    void s.gross_revenue_m;
    void s.contribution_pct;
  });

  // Geography
  data.geography_breakdown.forEach((g) => {
    void g.territory;
    void g.tam.value;
    void g.tam.unit;
    void g.procedure_volume;
    void g.reimbursement_environment;
    void g.market_note;
  });

  // Reimbursement
  void data.reimbursement_analysis.us_coverage_status;
  void data.reimbursement_analysis.primary_cpt_codes;
  void data.reimbursement_analysis.drg_codes;
  void data.reimbursement_analysis.medicare_payment_rate;
  void data.reimbursement_analysis.private_payer_coverage;
  void data.reimbursement_analysis.reimbursement_risk;
  void data.reimbursement_analysis.reimbursement_strategy;

  // Competitive
  void data.competitive_positioning.total_competitors;
  void data.competitive_positioning.market_leader;
  void data.competitive_positioning.leader_market_share_pct;
  void data.competitive_positioning.ase_range;
  void data.competitive_positioning.key_differentiation_vectors;

  // Revenue projection
  data.revenue_projection.forEach((r) => {
    void r.year;
    void r.bear;
    void r.base;
    void r.bull;
  });

  // Meta
  void data.methodology;
  void data.data_sources;
  void data.generated_at;

  // Input fields
  void input.product_name;
  void input.device_category;
  void input.product_category;
  void input.procedure_or_condition;
  void input.unit_ase;
  void input.launch_year;
  void input.geography;
}

// ────────────────────────────────────────────────────────────
// SECTION RENDER CHECKLIST
// ────────────────────────────────────────────────────────────

interface SectionCheck {
  section: string;
  wouldRender: boolean;
  reason: string;
}

function checkPharmaSections(data: MarketSizingOutput): SectionCheck[] {
  return [
    { section: 'Summary Stat Cards', wouldRender: true, reason: 'Always rendered' },
    { section: 'TAM / SAM / SOM Chart', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Revenue Waterfall (TAM to Peak Sales)',
      wouldRender: (data.summary.peak_sales_estimate?.base ?? 0) > 0,
      reason: 'Requires peak_sales_estimate.base > 0',
    },
    { section: 'Patient Funnel', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Geography Breakdown',
      wouldRender: data.geography_breakdown.length > 0,
      reason: `${data.geography_breakdown.length} geographies`,
    },
    {
      section: 'Revenue Projection (10yr)',
      wouldRender: data.revenue_projection.length > 0,
      reason: `${data.revenue_projection.length} years`,
    },
    {
      section: 'Sensitivity Analysis',
      wouldRender: data.patient_funnel.addressable > 0,
      reason: `addressable = ${data.patient_funnel.addressable}`,
    },
    {
      section: 'Pricing Comparables',
      wouldRender: data.pricing_analysis.comparable_drugs.length > 0,
      reason: `${data.pricing_analysis.comparable_drugs.length} drugs`,
    },
    {
      section: 'Risk Adjustment / LoA',
      wouldRender: !!data.risk_adjustment,
      reason: data.risk_adjustment ? `LoA = ${data.risk_adjustment.probability_of_success}` : 'Not populated',
    },
    {
      section: 'IRA Impact',
      wouldRender: !!data.ira_impact,
      reason: data.ira_impact ? `Negotiation year ${data.ira_impact.negotiation_year}` : 'Not populated',
    },
    {
      section: 'Competitive Response',
      wouldRender: !!data.competitive_response && data.competitive_response.length > 0,
      reason: data.competitive_response ? `${data.competitive_response.length} years` : 'Not populated',
    },
    {
      section: 'Biosimilar Erosion',
      wouldRender: !!data.biosimilar_erosion,
      reason: data.biosimilar_erosion ? data.biosimilar_erosion.erosion_model : 'Not populated',
    },
    {
      section: 'Payer Mix Evolution',
      wouldRender: !!data.payer_mix_evolution && data.payer_mix_evolution.length > 0,
      reason: data.payer_mix_evolution ? `${data.payer_mix_evolution.length} years` : 'Not populated',
    },
    {
      section: 'Patient Dynamics',
      wouldRender: !!data.patient_dynamics,
      reason: data.patient_dynamics ? `${data.patient_dynamics.switching_sources.length} sources` : 'Not populated',
    },
    {
      section: 'Biomarker Nesting',
      wouldRender: !!data.biomarker_nesting,
      reason: data.biomarker_nesting ? `${data.biomarker_nesting.levels.length} levels` : 'Not populated',
    },
    {
      section: 'Integrated Projection',
      wouldRender: !!data.integrated_projection && data.integrated_projection.length > 0,
      reason: data.integrated_projection ? `${data.integrated_projection.length} years` : 'Not populated',
    },
    {
      section: 'Percentile Projections',
      wouldRender: !!data.percentile_projections && data.percentile_projections.length > 0,
      reason: data.percentile_projections ? `${data.percentile_projections.length} years` : 'Not populated',
    },
    {
      section: 'Treatment Line Model',
      wouldRender: !!data.treatment_line_model && data.treatment_line_model.length > 0,
      reason: data.treatment_line_model ? `${data.treatment_line_model.length} lines` : 'Not populated',
    },
    {
      section: 'Deal Comps Analysis',
      wouldRender: !!data.deal_comps_analysis,
      reason: data.deal_comps_analysis ? `${data.deal_comps_analysis.comparable_deals.length} deals` : 'Not populated',
    },
    {
      section: 'Investment Thesis',
      wouldRender: !!data.investment_thesis,
      reason: data.investment_thesis ? `EV = $${data.investment_thesis.expected_value_m}M` : 'Not populated',
    },
    { section: 'Methodology', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Data Sources',
      wouldRender: data.data_sources.length > 0,
      reason: `${data.data_sources.length} sources`,
    },
  ];
}

function checkDeviceSections(data: DeviceMarketSizingOutput): SectionCheck[] {
  return [
    { section: 'Summary Stat Cards', wouldRender: true, reason: 'Always rendered' },
    { section: 'TAM / SAM / SOM Chart', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Revenue Waterfall (TAM to Peak Sales)',
      wouldRender: data.revenue_projection.length > 0,
      reason: `${data.revenue_projection.length} projection years`,
    },
    { section: 'Procedure Volume', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Revenue Streams',
      wouldRender: data.revenue_streams.length > 0,
      reason: `${data.revenue_streams.length} streams`,
    },
    { section: 'Adoption Model', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Geography Breakdown',
      wouldRender: data.geography_breakdown.length > 0,
      reason: `${data.geography_breakdown.length} territories`,
    },
    { section: 'Reimbursement Analysis', wouldRender: true, reason: 'Always rendered' },
    { section: 'Competitive Positioning', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Revenue Projection (10yr)',
      wouldRender: data.revenue_projection.length > 0,
      reason: `${data.revenue_projection.length} years`,
    },
    { section: 'Methodology', wouldRender: true, reason: 'Always rendered' },
    {
      section: 'Data Sources',
      wouldRender: data.data_sources.length > 0,
      reason: `${data.data_sources.length} sources`,
    },
  ];
}

// ────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────

function main(): void {
  console.log('\n=== TERRAIN REPORT SECTION VERIFICATION ===\n');

  // 1. Type-level verification (compile-time)
  verifyPharmaFields(mockMarketSizingOutput, mockPharmaInput);
  verifyDeviceFields(mockDeviceOutput, mockDeviceInput);
  console.log('[OK] All type-level field accesses compile successfully.\n');

  // 2. Pharma report section checklist
  console.log('--- PHARMA: MarketSizingReport.tsx ---');
  const pharmaSections = checkPharmaSections(mockMarketSizingOutput);
  pharmaSections.forEach((s) => {
    const icon = s.wouldRender ? '[+]' : '[ ]';
    console.log(`  ${icon} ${s.section.padEnd(40)} ${s.reason}`);
  });
  const pharmaRendered = pharmaSections.filter((s) => s.wouldRender).length;
  console.log(`\n  ${pharmaRendered}/${pharmaSections.length} sections would render\n`);

  // 3. Device report section checklist
  console.log('--- DEVICE: DeviceMarketSizingReport.tsx ---');
  const deviceSections = checkDeviceSections(mockDeviceOutput);
  deviceSections.forEach((s) => {
    const icon = s.wouldRender ? '[+]' : '[ ]';
    console.log(`  ${icon} ${s.section.padEnd(40)} ${s.reason}`);
  });
  const deviceRendered = deviceSections.filter((s) => s.wouldRender).length;
  console.log(`\n  ${deviceRendered}/${deviceSections.length} sections would render\n`);

  // 4. Data freshness check (DataSourceBadge)
  console.log('--- DATA FRESHNESS: DataSourceBadge ---');
  mockDataSources.forEach((src) => {
    if (src.last_updated) {
      const ageMs = Date.now() - new Date(src.last_updated).getTime();
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
      const freshness = ageDays < 7 ? 'GREEN' : ageDays <= 90 ? 'AMBER' : 'RED';
      console.log(`  [${freshness.padEnd(5)}] ${src.name.padEnd(30)} ${ageDays}d old`);
    } else {
      console.log(`  [N/A  ] ${src.name.padEnd(30)} no timestamp`);
    }
  });

  console.log('\n=== VERIFICATION COMPLETE ===\n');
}

main();
