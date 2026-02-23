// ============================================================
// TERRAIN — Medical Device & Diagnostics Types
// types/devices-diagnostics.ts
//
// Add these types to your main types/index.ts
//
// Covers: IVD, companion diagnostics, imaging agents,
// implantables, surgical devices, monitoring/wearables,
// drug-device combinations, SaMD, capital equipment
// ============================================================

// ────────────────────────────────────────────────────────────
// PRODUCT CATEGORY TAXONOMY
// ────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'pharmaceutical'
  | 'nutraceutical'             // Dietary supplements, consumer health, longevity
  | 'diagnostics_ivd'           // In vitro diagnostic (blood, tissue, urine)
  | 'diagnostics_companion'     // CDx tied to a specific drug
  | 'diagnostics_imaging'       // Imaging agents, PET tracers, contrast media
  | 'diagnostics_liquid_biopsy' // ctDNA, cfRNA, exosome-based assays
  | 'diagnostics_pathology'     // Digital pathology, AI-assisted histology
  | 'device_implantable'        // Permanent/semi-permanent implants
  | 'device_surgical'           // OR instruments, robots, ablation
  | 'device_monitoring'         // Wearables, CGM, remote monitoring
  | 'device_drug_delivery'      // Combination product, drug-eluting
  | 'device_digital_health'     // SaMD — software as a medical device
  | 'device_capital_equipment'  // MRI, CT, radiation systems, NGS platforms
  | 'device_point_of_care';     // POC testing, rapid diagnostics

export type DeviceCategory =
  | 'cardiovascular'
  | 'orthopedic'
  | 'neurology'
  | 'ophthalmology'
  | 'endoscopy_gi'
  | 'wound_care'
  | 'diabetes_metabolic'
  | 'oncology_surgical'
  | 'oncology_radiation'
  | 'ivd_oncology'
  | 'ivd_infectious'
  | 'ivd_cardiology'
  | 'ivd_genetics'
  | 'imaging_radiology'
  | 'renal_dialysis'
  | 'respiratory'
  | 'dental'
  | 'general_surgery'
  | 'vascular'
  | 'ent'
  | 'urology'
  | 'dermatology';

// ────────────────────────────────────────────────────────────
// FDA DEVICE REGULATORY PATHWAYS
// ────────────────────────────────────────────────────────────

export type FDADeviceClass = 'Class I' | 'Class II' | 'Class III';

export type FDADevicePathway =
  | '510(k) Clearance'
  | 'De Novo Classification'
  | 'PMA (Premarket Approval)'
  | 'HDE (Humanitarian Device Exemption)'
  | 'Breakthrough Device Designation'
  | 'EUA (Emergency Use Authorization)'
  | 'Q-Submission (Pre-Sub Meeting)'
  | 'IDE (Investigational Device Exemption)';

export type CEMarkingRoute =
  | 'MDR (Medical Device Regulation)'
  | 'IVDR (In Vitro Diagnostic Regulation)'
  | 'Notified Body Review'
  | 'IVDR Annex IV (Self-certification)';

export type DiagnosticRegPathway =
  | 'PMA (Class III IVD)'
  | '510(k) (Class II IVD)'
  | 'De Novo IVD'
  | 'LDT (Laboratory Developed Test)'
  | 'EUA IVD'
  | 'CDx PMA (Companion Diagnostic)';

// ────────────────────────────────────────────────────────────
// DEVICE PRICING MODELS
// Fundamentally different from pharma per-patient-year pricing
// ────────────────────────────────────────────────────────────

export type DevicePricingModel =
  | 'per_procedure'        // Surgeon pays per use (surgical stapler)
  | 'per_unit_capital'     // Capital equipment sale (robot, scanner)
  | 'per_unit_disposable'  // Consumable at volume (catheter, test strip)
  | 'reagent_rental'       // Capital placed free, revenue on reagents/cartridges
  | 'subscription_samd'    // SaMD monthly/annual software subscription
  | 'bundle'               // Capital + service + consumables bundled
  | 'per_test'             // Diagnostic: lab charges per test run
  | 'per_patient_year';    // Long-term monitoring subscription

// ────────────────────────────────────────────────────────────
// DEVICE MARKET SIZING — INPUT
// ────────────────────────────────────────────────────────────

export interface DeviceMarketSizingInput {
  product_name?: string;
  device_category: DeviceCategory;
  product_category: ProductCategory;
  procedure_or_condition: string;        // e.g., "Total knee replacement" or "CGM for T1D"
  target_setting: ('hospital_inpatient' | 'hospital_outpatient' | 'asc' | 'office' | 'home' | 'lab')[];
  pricing_model: DevicePricingModel;

  // Pricing inputs
  unit_ase: number;                      // Average Selling Price per unit/procedure USD
  disposables_per_procedure?: number;
  disposable_ase?: number;
  service_contract_annual?: number;      // Annual service revenue per capital unit

  // Market context
  development_stage: 'concept' | 'preclinical' | 'clinical_trial' | 'fda_submitted' | 'cleared_approved' | 'commercial';
  geography: string[];
  reimbursement_status: 'covered' | 'coverage_pending' | 'unlisted' | 'self_pay';
  physician_specialty: string[];

  launch_year: number;
}

// ────────────────────────────────────────────────────────────
// DEVICE MARKET SIZING — OUTPUT
// ────────────────────────────────────────────────────────────

export interface RevenueStreamBreakdown {
  stream: string;                        // "Capital Equipment" | "Disposables" | "Service"
  annual_revenue_per_unit: number;
  total_units_or_procedures: number;
  gross_revenue_m: number;
  contribution_pct: number;
}

export interface DeviceMarketSizingOutput {
  summary: {
    us_tam: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    us_sam: { value: number; unit: 'B' | 'M' };
    us_som: { value: number; unit: 'B' | 'M'; range: [number, number] };
    global_tam: { value: number; unit: 'B' | 'M' };
    cagr_5yr: number;
    market_growth_driver: string;
  };

  procedure_volume: {
    us_annual_procedures: number;
    us_addressable_procedures: number;
    growth_rate_pct: number;
    source: string;
  };

  adoption_model: {
    total_us_sites: number;
    addressable_sites: number;
    peak_market_share: { low: number; base: number; high: number };
    peak_installed_base?: number;        // For capital equipment
    years_to_peak: number;
  };

  revenue_streams: RevenueStreamBreakdown[];

  geography_breakdown: {
    territory: string;
    tam: { value: number; unit: 'B' | 'M' };
    procedure_volume?: number;
    reimbursement_environment: string;
    market_note: string;
  }[];

  reimbursement_analysis: {
    us_coverage_status: string;
    primary_cpt_codes?: string[];
    drg_codes?: string[];
    medicare_payment_rate?: string;
    private_payer_coverage: string;
    reimbursement_risk: 'low' | 'moderate' | 'high';
    reimbursement_strategy: string;
  };

  competitive_positioning: {
    total_competitors: number;
    market_leader: string;
    leader_market_share_pct: number;
    ase_range: { lowest: number; median: number; highest: number };
    key_differentiation_vectors: string[];
  };

  revenue_projection: { year: number; bear: number; base: number; bull: number }[];

  // 99+ world-class analytics extensions
  reimbursement_analytics?: DeviceReimbursementAnalytics;
  competitive_share_distribution?: DeviceCompetitiveShareDistribution;
  evidence_gap_analysis?: DeviceEvidenceGapAnalysis;
  pricing_pressure?: DevicePricingPressureModel;
  deal_benchmark?: MedTechDealBenchmark;

  // 99+ world-class competitive analytics extensions
  technology_readiness?: TechnologyReadinessScoring;
  clinical_superiority?: ClinicalSuperiorityMatrix;
  surgeon_switching_cost?: SurgeonSwitchingCostModel;

  methodology: string;
  data_sources: { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// COMPANION DIAGNOSTICS (CDx)
// The bridge between pharma and diagnostics worlds
// Unique economics: CDx is tied to drug label, priced per test
// ────────────────────────────────────────────────────────────

export interface CDxMarketSizingInput {
  drug_name?: string;
  drug_indication: string;              // e.g., "NSCLC EGFR+"
  biomarker: string;                    // e.g., "EGFR exon 19/21 deletion"
  biomarker_prevalence_pct: number;     // % of indication that is biomarker positive
  test_type: 'IHC' | 'FISH' | 'PCR' | 'NGS_panel' | 'liquid_biopsy' | 'WGS' | 'RNA_seq';
  test_setting: ('pathology_lab' | 'central_lab' | 'point_of_care')[];
  drug_development_stage: string;
  cdx_development_stage: 'concept' | 'analytical_validation' | 'clinical_validation' | 'pma_submitted' | 'approved';
  geography: string[];
  test_ase: number;                     // $ per test (lab to payer)
  is_standalone?: boolean;
  drug_partner?: string;
}

export interface CDxDeal {
  cdx_company: string;
  drug_company: string;
  cdx_name: string;
  drug_name: string;
  biomarker: string;
  indication: string;
  test_type: string;
  deal_type: string;
  value_reported?: string;
  date: string;
  status: 'approved' | 'clinical' | 'pending';
}

export interface CDxOutput {
  summary: {
    linked_drug_indication_incidence_us: number;
    annual_test_volume: number;
    cdx_revenue: { value: number; unit: 'M' | 'B'; confidence: 'high' | 'medium' | 'low' };
    test_reimbursement: string;
  };

  patient_testing_funnel: {
    indication_incidence_us: number;
    diagnosed_and_tested_pct: number;
    annual_newly_tested: number;
    biomarker_positive_pct: number;
    biomarker_positive_patients: number;
    treated_on_linked_drug: number;
    monitoring_retests_annual: number;  // Repeat testing for monitoring/resistance
    total_annual_tests: number;
  };

  cdx_economics: {
    revenue_per_test_gross: number;
    reimbursement_cpt_codes: string[];
    cms_reimbursement_rate?: number;
    private_payer_rate?: string;
    gross_to_net_pct: number;
    net_revenue_per_test: number;
    total_annual_revenue: { low: number; base: number; high: number };
  };

  deal_structure_benchmark: {
    typical_deal_type: string;
    cdx_partner_economics: string;
    milestones: string;
    royalty_or_supply_structure: string;
    comparable_deals: CDxDeal[];
  };

  regulatory_pathway: {
    fda_pathway: 'CDx PMA' | 'CDx 510(k)' | 'Voluntary CDx';
    co_review_with_drug: boolean;
    timeline_months: { optimistic: number; realistic: number };
    eu_ivdr_class: string;
    post_approval_requirements: string[];
  };

  competitive_cdx_landscape: {
    approved_tests: { test: string; company: string; drug: string; platform: string; approval_year: number }[];
    pipeline_tests: { test: string; company: string; stage: string; drug_partner?: string }[];
    platform_technology_leader: string;
    market_insight: string;
  };

  methodology: string;
  data_sources: { name: string; type: string }[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE REGULATORY INTELLIGENCE
// ────────────────────────────────────────────────────────────

export interface DeviceRegulatoryInput {
  device_description: string;
  intended_use: string;
  indications_for_use: string;
  product_category: ProductCategory;
  device_class_claimed?: FDADeviceClass;
  has_predicate: boolean;
  predicate_device?: string;
  is_novel_technology: boolean;
  clinical_data_available: boolean;
  is_combination_product: boolean;
  unmet_need: 'high' | 'moderate' | 'low';
  patient_population_us?: number;       // For HDE eligibility (<8,000/yr)
  geography: ('FDA' | 'CE_MDR' | 'CE_IVDR' | 'PMDA' | 'NMPA')[];
}

export interface DeviceRegulatoryOutput {
  recommended_pathway: {
    primary: {
      pathway: FDADevicePathway | CEMarkingRoute | DiagnosticRegPathway;
      device_class: FDADeviceClass;
      review_division?: string;
      typical_timeline_months: number;
      submission_requirements: string[];
      clinical_evidence_required: string;
    };
    alternatives: { pathway: string; rationale: string; tradeoffs: string }[];
    rationale: string;
  };

  special_designations: {
    designation: 'Breakthrough Device' | 'HDE' | 'De Novo' | 'EUA' | 'MDUFA Priority Review';
    eligibility: 'likely' | 'possible' | 'unlikely';
    benefit: string;
    criteria: string;
  }[];

  timeline_estimate: {
    ide_submission?: string;
    clinical_completion?: string;
    fda_submission?: string;
    fda_review_months: number;
    approval_estimate?: string;
    total_to_market: { optimistic: number; realistic: number };
  };

  key_risks: { risk: string; severity: 'high' | 'moderate' | 'low'; mitigation: string }[];

  comparable_clearances: {
    device: string;
    company: string;
    pathway: string;
    clearance_date: string;
    review_months: number;
    device_class: string;
  }[];

  clinical_evidence_strategy: {
    study_design: string;
    primary_endpoint: string;
    sample_size_estimate: string;
    duration: string;
    key_considerations: string[];
  };

  post_market_requirements: string[];

  // 99+ world-class regulatory analytics extensions
  predicate_devices?: PredicateDeviceRecord[];
  device_clinical_evidence_strategy?: DeviceClinicalEvidenceStrategy;
  indication_scope_scenarios?: DeviceIndicationScopeScenario[];
  device_manufacturing_risk?: DeviceManufacturingRisk;

  data_sources: { name: string; type: string }[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE PARTNER DISCOVERY
// ────────────────────────────────────────────────────────────

export interface DevicePartnerDiscoveryInput {
  device_description: string;
  device_category: DeviceCategory;
  product_category: ProductCategory;
  development_stage: DeviceMarketSizingInput['development_stage'];
  geography_rights: string[];
  deal_types: ('distribution' | 'licensing' | 'acquisition' | 'oem' | 'co_development' | 'strategic_investment')[];
  exclude_companies?: string[];
  target_partner_type?: ('large_medtech' | 'mid_medtech' | 'diagnostics_company' | 'pharma_device_division' | 'strategic_investor')[];
}

export interface DevicePartnerMatch {
  rank: number;
  company: string;
  company_type: 'Large Medtech' | 'Mid-Size Medtech' | 'Diagnostics Company' | 'Pharma with Device Division' | 'PE-Backed Medtech';
  hq_location: string;
  market_cap?: string;
  device_divisions: string[];
  match_score: number;
  score_breakdown: {
    portfolio_alignment: number;
    distribution_network: number;
    deal_history: number;
    financial_capacity: number;
    geographic_footprint: number;
    strategic_priority: number;
  };
  recent_deals: {
    target: string;
    deal_type: string;
    device_category: string;
    value?: string;
    date: string;
  }[];
  deal_terms_benchmark: {
    typical_upfront?: string;
    royalty_or_distribution_margin?: string;
    typical_deal_structure: string;
  };
  rationale: string;
  acquisition_signals: string[];

  // 99+ world-class partner analytics extensions
  acquisition_probability?: DeviceAcquisitionProbability;
  regulatory_track_record?: DeviceRegulatoryTrackRecord;
  distribution_strength?: DistributionStrengthAssessment;
  device_deal_structure?: DeviceDealStructureModel;
}

// ────────────────────────────────────────────────────────────
// REIMBURSEMENT ANALYTICS (quantified $ models)
// ────────────────────────────────────────────────────────────

export interface NTAPCalculation {
  eligible: boolean;
  drg_payment: number;
  device_cost: number;
  excess_cost: number;
  ntap_payment: number;
  effective_coverage_pct: number;
  application_deadline: string;
  narrative: string;
}

export interface PayerMixEntry {
  payer: string;
  patient_share_pct: number;
  reimbursement_rate: number;
  coverage_status: 'covered' | 'pending' | 'not_covered';
  prior_auth_required: boolean;
}

export interface PayerMixModel {
  payers: PayerMixEntry[];
  blended_reimbursement_rate: number;
  commercial_vs_medicare_ratio: number;
  narrative: string;
}

export interface CoverageMilestone {
  milestone: string;
  estimated_months: number;
  probability: number;
  dependency?: string;
}

export interface CoverageTimeline {
  milestones: CoverageMilestone[];
  full_coverage_estimate_months: number;
  critical_path: string;
  narrative: string;
}

export interface ReimbursementScenario {
  scenario: 'favorable' | 'base' | 'adverse';
  effective_reimbursement: number;
  patient_access_pct: number;
  revenue_impact_multiplier: number;
  key_assumptions: string[];
  narrative: string;
}

export interface DeviceReimbursementAnalytics {
  ntap?: NTAPCalculation;
  payer_mix?: PayerMixModel;
  coverage_timeline?: CoverageTimeline;
  scenarios?: ReimbursementScenario[];
  overall_reimbursement_risk_score: number;
}

// ────────────────────────────────────────────────────────────
// CATEGORY-SPECIFIC ADOPTION CURVES
// ────────────────────────────────────────────────────────────

export interface CategoryAdoptionCurve {
  category: string;
  year_factors: number[];
  learning_curve_factor: number;
  peak_year: number;
  ramp_narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE COMPETITIVE ANALYTICS (institutional-grade)
// ────────────────────────────────────────────────────────────

export interface DeviceCompetitiveShareEntry {
  name: string;
  estimated_share_pct: number;
  basis: string;
}

export interface DeviceCompetitiveShareDistribution {
  competitors: DeviceCompetitiveShareEntry[];
  hhi_index: number;
  concentration_label: 'Fragmented' | 'Moderate' | 'Concentrated' | 'Monopolistic';
  top_3_share_pct: number;
  narrative: string;
}

export interface DeviceEvidenceGap {
  evidence_type: string;
  current_state: string;
  gap_severity: 'critical' | 'significant' | 'moderate';
  competitive_impact: string;
  recommendation: string;
}

export interface DeviceEvidenceGapAnalysis {
  gaps: DeviceEvidenceGap[];
  overall_evidence_score: number;
  narrative: string;
}

export interface DevicePricingPressureModel {
  current_asp: number;
  category_median_asp: number;
  asp_trend_pct_annual: number;
  gpo_pressure_score: number;
  competitive_pricing_pressure: number;
  reimbursement_erosion_risk: 'low' | 'moderate' | 'high';
  projected_asp_5yr: number[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// MEDTECH DEAL DATABASE TYPES
// ────────────────────────────────────────────────────────────

export interface MedTechDeal {
  acquirer: string;
  target: string;
  deal_type: 'acquisition' | 'licensing' | 'partnership' | 'investment' | 'distribution';
  value_m?: number;
  announced_date: string;
  closed_date?: string;
  device_category: DeviceCategory;
  product_category: ProductCategory;
  rationale: string;
  source: string;
}

export interface MedTechDealBenchmark {
  comparable_deals: MedTechDeal[];
  median_deal_value_m: number;
  median_revenue_multiple?: number;
  deal_count_last_3yr: number;
  hottest_categories: string[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE PARTNER ANALYTICS (99+ world-class extensions)
// ────────────────────────────────────────────────────────────

export interface DeviceAcquisitionProbability {
  serial_acquirer_score: number;
  acquisitions_last_3yr: number;
  acquisitions_last_5yr: number;
  avg_deal_size_m: number;
  revenue_gap_to_fill_b: number;
  category_deal_frequency: number;
  acquisition_probability_pct: number;
  key_signals: string[];
  narrative: string;
}

export interface DeviceRegulatoryTrackRecord {
  total_510k_clearances: number;
  total_pma_approvals: number;
  avg_510k_review_days: number;
  avg_pma_review_months: number;
  fda_warning_letters_5yr: number;
  breakthrough_designations: number;
  regulatory_capability_score: number;
  narrative: string;
}

export interface DistributionStrengthAssessment {
  hospital_direct_sales: number;
  asc_coverage: number;
  office_channel: number;
  lab_channel: number;
  gpo_relationships: string[];
  estimated_us_field_reps: number;
  overall_distribution_score: number;
  narrative: string;
}

export interface DeviceDealStructureModel {
  deal_type_recommended: string;
  typical_upfront_pct: number;
  royalty_range: [number, number];
  margin_structure?: { low_pct: number; high_pct: number };
  milestones: { milestone: string; typical_value_m: number; probability: number }[];
  governance_complexity: 'low' | 'moderate' | 'high';
  comparable_deal_count: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE REGULATORY ANALYTICS (99+ world-class extensions)
// ────────────────────────────────────────────────────────────

export interface PredicateDeviceRecord {
  device_name: string;
  company: string;
  k_number_or_pma: string;
  pathway: '510(k)' | 'PMA' | 'De Novo' | 'HDE';
  device_class: FDADeviceClass;
  product_code: string;
  clearance_date: string;
  review_days: number;
  device_category: DeviceCategory;
  indication_for_use: string;
  primary_endpoint?: string;
  sample_size?: number;
  clinical_study_required: boolean;
  landmark_significance: string;
}

export interface DeviceClinicalEvidenceStrategy {
  recommended_study_type: string;
  study_rationale: string;
  recommended_primary_endpoint: string;
  estimated_sample_size: { low: number; base: number; high: number };
  estimated_enrollment_months: number;
  estimated_study_cost_m: { low: number; base: number; high: number };
  comparator_recommendation: string;
  adaptive_elements: string[];
  key_study_risks: string[];
  fda_guidance_documents: string[];
  narrative: string;
}

export interface DeviceIndicationScopeScenario {
  scenario: 'narrow' | 'base' | 'broad';
  indication_statement: string;
  population_restrictions: string[];
  setting_restrictions: string[];
  regulatory_risk: 'low' | 'moderate' | 'high';
  commercial_impact_multiplier: number;
  probability: number;
  narrative: string;
}

export interface DeviceManufacturingRisk {
  sterilization_method: string;
  sterilization_risk: 'low' | 'moderate' | 'high';
  biocompatibility_testing_required: string[];
  iso_standards_applicable: string[];
  manufacturing_complexity_score: number;
  supply_chain_risk: 'low' | 'moderate' | 'high';
  scale_up_challenges: string[];
  estimated_manufacturing_validation_months: number;
  estimated_cogs_range: { low_pct: number; high_pct: number };
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE COMPETITIVE ANALYTICS (99+ world-class extensions)
// ────────────────────────────────────────────────────────────

export interface TechnologyReadinessEntry {
  competitor_name: string;
  trl_level: number;
  trl_label: string;
  clinical_validation_status: string;
  manufacturing_readiness: 'prototype' | 'pilot' | 'scaled' | 'commercial';
  ip_strength: 'weak' | 'moderate' | 'strong' | 'dominant';
  years_to_market: number;
  threat_score: number;
  narrative: string;
}

export interface TechnologyReadinessScoring {
  entries: TechnologyReadinessEntry[];
  highest_threat_competitor: string;
  avg_trl: number;
  narrative: string;
}

export interface ClinicalSuperiorityEntry {
  competitor_device: string;
  company: string;
  primary_endpoint: string;
  success_rate_pct?: number;
  complication_rate_pct?: number;
  procedural_time_minutes?: number;
  hospital_los_days?: number;
  revision_rate_pct?: number;
  data_quality: 'RCT' | 'registry' | 'single_arm' | 'case_series' | 'bench_only';
  superiority_score: number;
  narrative: string;
}

export interface ClinicalSuperiorityMatrix {
  entries: ClinicalSuperiorityEntry[];
  user_device_position: 'superior' | 'comparable' | 'inferior' | 'insufficient_data';
  key_differentiator: string;
  narrative: string;
}

export interface SurgeonSwitchingCostModel {
  training_requirement_hours: number;
  learning_curve_cases: number;
  credentialing_required: boolean;
  or_workflow_change: 'minimal' | 'moderate' | 'significant' | 'transformative';
  compatibility_with_existing_systems: 'full' | 'partial' | 'none';
  estimated_switching_cost_per_site: number;
  switching_barrier_score: number;
  switching_facilitators: string[];
  switching_inhibitors: string[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL / CONSUMER HEALTH / LONGEVITY
// ────────────────────────────────────────────────────────────

export type NutraceuticalCategory =
  | 'dietary_supplement'        // DSHEA-regulated supplement
  | 'functional_food'           // Food with health claims
  | 'medical_food'              // FSMA-regulated medical food (IEM)
  | 'otc_drug'                  // OTC monograph or NDA/ANDA
  | 'rx_to_otc_switch'          // Rx-to-OTC conversion
  | 'cosmeceutical'             // Cosmetic with active ingredients
  | 'longevity_compound'        // NAD+, rapamycin analogs, senolytics
  | 'probiotic_microbiome'      // Live biotherapeutics, probiotics
  | 'sports_nutrition';         // Performance, recovery, body composition

export type NutraceuticalChannel =
  | 'dtc_ecommerce'             // Direct-to-consumer online
  | 'amazon'                    // Amazon marketplace
  | 'retail_mass'               // Walmart, Target, CVS, Walgreens
  | 'retail_specialty'          // Whole Foods, Sprouts, GNC, Vitamin Shoppe
  | 'practitioner'              // Healthcare practitioner dispensary
  | 'subscription'              // Recurring subscription model
  | 'wholesale_b2b';            // White-label / ingredient supplier

export type ClaimType =
  | 'structure_function'        // "Supports immune health" (DSHEA, no FDA approval)
  | 'qualified_health'          // "May reduce risk of..." (FDA-approved qualified claim)
  | 'authorized_health'         // "Adequate calcium may reduce osteoporosis risk" (FDA-authorized)
  | 'nutrient_content'          // "High in Vitamin C" (nutrient level claim)
  | 'drug_claim'                // "Treats/cures/prevents X" — triggers FDA drug regulation
  | 'cosmetic_claim';           // "Reduces appearance of wrinkles"

export interface NutraceuticalMarketSizingInput {
  product_name?: string;
  product_category: 'nutraceutical';
  nutraceutical_category: NutraceuticalCategory;
  primary_ingredient: string;           // e.g., "NMN (Nicotinamide Mononucleotide)"
  health_focus: string;                 // e.g., "Longevity / NAD+ restoration"
  target_demographic: string;           // e.g., "Adults 40-65, health-optimizers"
  claim_type: ClaimType;
  channels: NutraceuticalChannel[];
  unit_price: number;                   // Retail price per unit (bottle/box)
  units_per_year_per_customer: number;  // Annual purchase frequency
  cogs_pct: number;                     // Cost of goods as % of retail
  geography: string[];
  development_stage: 'formulation' | 'clinical_study' | 'market_ready' | 'commercial';
  has_clinical_data: boolean;
  patent_protected: boolean;
  launch_year: number;
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL OUTPUT TYPES
// Consumer funnel, channel economics, DTC metrics, regulatory
// ────────────────────────────────────────────────────────────

export interface NutraceuticalConsumerFunnel {
  us_adult_population: number;
  supplement_users: number;
  supplement_users_pct: number;
  health_category_users: number;
  health_category_penetration_pct: number;
  target_demographic_users: number;
  demographic_penetration_pct: number;
  addressable_consumers: number;
  capturable_consumers: number;
  avg_annual_spend: number;
}

export interface NutraceuticalChannelRevenue {
  channel: NutraceuticalChannel;
  channel_share_pct: number;
  volume_units: number;
  gross_revenue_m: number;
  brand_margin_pct: number;
  net_revenue_m: number;
  cac: number;
  ltv: number;
  ltv_to_cac: number;
  contribution_pct: number;
}

export interface NutraceuticalDTCEconomics {
  monthly_subscription_price: number;
  cac: number;
  ltv_12m: number;
  ltv_36m: number;
  payback_months: number;
  month_6_retention_pct: number;
  month_12_retention_pct: number;
  gross_margin_pct: number;
  contribution_margin_per_customer: number;
  break_even_subscribers: number;
  narrative: string;
}

export interface NutraceuticalGeographyBreakdown {
  territory: string;
  tam: { value: number; unit: 'B' | 'M' };
  supplement_penetration_pct: number;
  regulatory_environment: string;
  market_note: string;
}

export interface NutraceuticalCompetitivePositioning {
  total_brands_in_category: number;
  top_brand: string;
  top_brand_estimated_revenue_m: number;
  price_positioning: 'mass' | 'premium' | 'clinical_grade' | 'luxury';
  clinical_evidence_differentiator: boolean;
  amazon_bsr_range?: string;
  key_differentiation_vectors: string[];
  competitive_moat_score: number;
  narrative: string;
}

export interface NutraceuticalRegulatoryAssessment {
  recommended_pathway: string;
  ndi_required: boolean;
  ndi_acceptance_probability_pct?: number;
  ftc_claim_risk: 'low' | 'moderate' | 'high';
  fda_warning_letter_risk: 'low' | 'moderate' | 'high';
  cgmp_compliance_cost_k: { low: number; high: number };
  certifications_recommended: string[];
  regulatory_timeline_months: { optimistic: number; realistic: number; pessimistic: number };
  claim_substantiation_gaps: string[];
  prop_65_risk: boolean;
  key_risks: { risk: string; severity: 'high' | 'medium' | 'low'; mitigation: string }[];
  narrative: string;
}

export interface NutraceuticalSensitivityDriver {
  variable: string;
  low_som_m: number;
  high_som_m: number;
  base_som_m: number;
  swing_pct: number;
}

export interface NutraceuticalClinicalEvidenceImpact {
  evidence_level: 'strong' | 'moderate' | 'emerging' | 'preliminary' | 'none';
  pricing_premium_pct: number;
  channel_access_unlocked: NutraceuticalChannel[];
  practitioner_trust_score: number;
  claim_upgrade_potential: ClaimType | null;
  narrative: string;
}

export interface NutraceuticalBrandEconomics {
  estimated_brand_build_cost_m: { low: number; base: number; high: number };
  time_to_brand_recognition_months: number;
  influencer_dependency_score: number;
  content_moat_score: number;
  community_strength: 'none' | 'emerging' | 'moderate' | 'strong';
  narrative: string;
}

export interface NutraceuticalAmazonIntelligence {
  estimated_category_bsr_range: { top: number; median: number };
  avg_review_count_top_10: number;
  avg_rating_top_10: number;
  ppc_cpc_estimate: number;
  ppc_acos_estimate_pct: number;
  subscribe_save_adoption_pct: number;
  estimated_monthly_revenue_top_seller_k: number;
  barrier_to_entry_score: number;
  narrative: string;
}

export interface NutraceuticalSubscriptionModel {
  optimal_price_point: number;
  churn_curve: { month: number; retention_pct: number }[];
  avg_lifetime_months: number;
  projected_mrr_12m: number;
  projected_arr_m: number;
  narrative: string;
}

export interface NutraceuticalIngredientSupplyChain {
  primary_ingredient_source: string;
  source_concentration: 'single_source' | 'limited' | 'diversified';
  supply_risk: 'low' | 'moderate' | 'high';
  cogs_volatility: 'stable' | 'moderate' | 'volatile';
  ip_protection: string;
  narrative: string;
}

export interface NutraceuticalAcquisitionAttractiveness {
  strategic_acquirer_interest: 'high' | 'moderate' | 'low';
  revenue_multiple_range: { low: number; base: number; high: number };
  ebitda_multiple_range: { low: number; base: number; high: number };
  key_value_drivers: string[];
  likely_acquirer_types: string[];
  comparable_acquisitions: { target: string; acquirer: string; value_m: number; multiple: string; year: number }[];
  narrative: string;
}

export interface NutraceuticalMarketSizingOutput {
  summary: {
    us_tam: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    us_sam: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    us_som: { value: number; unit: 'B' | 'M'; range: [number, number] };
    global_tam: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    cagr_5yr: number;
    market_growth_driver: string;
    peak_annual_revenue: { low: number; base: number; high: number };
  };

  consumer_funnel: NutraceuticalConsumerFunnel;
  channel_revenue: NutraceuticalChannelRevenue[];
  dtc_unit_economics?: NutraceuticalDTCEconomics;
  geography_breakdown: NutraceuticalGeographyBreakdown[];
  revenue_projection: { year: number; bear: number; base: number; bull: number }[];
  competitive_positioning: NutraceuticalCompetitivePositioning;
  regulatory_assessment: NutraceuticalRegulatoryAssessment;
  sensitivity_analysis?: NutraceuticalSensitivityDriver[];
  clinical_evidence_impact?: NutraceuticalClinicalEvidenceImpact;
  brand_economics?: NutraceuticalBrandEconomics;

  amazon_intelligence?: NutraceuticalAmazonIntelligence;
  subscription_model?: NutraceuticalSubscriptionModel;
  ingredient_supply_chain?: NutraceuticalIngredientSupplyChain;
  acquisition_attractiveness?: NutraceuticalAcquisitionAttractiveness;

  methodology: string;
  data_sources: { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL PARTNER TYPES
// ────────────────────────────────────────────────────────────

export type NutraceuticalPartnerType =
  | 'contract_manufacturer'
  | 'ingredient_supplier'
  | 'distributor'
  | 'retail_partner'
  | 'strategic_acquirer'
  | 'dtc_platform'
  | 'clinical_research'
  | 'marketing_agency';

export interface NutraceuticalPartnerProfile {
  company: string;
  partner_type: NutraceuticalPartnerType;
  hq: string;
  revenue_b?: number;
  description: string;
  capabilities: string[];
  categories_served: NutraceuticalCategory[];
  channels_served: NutraceuticalChannel[];
  notable_clients: string[];
  deal_size_range?: string;
  source: string;

  // Deal activity & track record
  recent_acquisitions?: { target: string; year: number; value_m?: number }[];
  deal_terms_typical?: {
    upfront_range?: string;
    royalty_range?: string;
    revenue_share_range?: string;
    typical_deal_type: string;    // 'acquisition' | 'licensing' | 'distribution' | 'co-development' | 'contract'
  };
  partnership_track_record?: {
    deals_last_5yr: number;
    notable_partnerships: string[];
    avg_deal_value_m?: number;
  };
  strategic_priorities?: string[];  // e.g., "NAD+ longevity category", "GLP-1 adjacent supplements"
}

export interface NutraceuticalPartnerMatch {
  rank: number;
  company: string;
  partner_type: NutraceuticalPartnerType;
  match_score: number;
  score_breakdown: {
    category_alignment: number;
    channel_fit: number;
    capability_match: number;
    scale_appropriateness: number;
    geographic_fit: number;
  };
  capabilities: string[];
  notable_clients: string[];
  rationale: string;
}

export interface NutraceuticalPartnerDiscoveryInput {
  product_description: string;
  primary_ingredient: string;
  nutraceutical_category: NutraceuticalCategory;
  channels: NutraceuticalChannel[];
  development_stage: 'formulation' | 'clinical_study' | 'market_ready' | 'commercial';
  geography_rights: string[];
  partner_types_sought: NutraceuticalPartnerType[];
  exclude_companies?: string[];
  has_clinical_data: boolean;
  estimated_revenue_m?: number;
}

// ────────────────────────────────────────────────────────────
// PROCEDURE DATA (equivalent of IndicationData for devices)
// ────────────────────────────────────────────────────────────

export interface ProcedureData {
  name: string;
  synonyms: string[];
  cpt_codes: string[];
  drg_codes?: string[];
  icd10_pcs_codes?: string[];
  device_category: DeviceCategory;

  us_annual_procedures: number;
  us_procedure_growth_rate: number;    // Annual % growth
  procedure_setting: string[];

  eligible_sites: {
    hospitals: number;
    ascs?: number;
    clinics?: number;
    labs?: number;
  };

  performing_specialty: string[];
  adoption_barrier: 'low' | 'moderate' | 'high';
  procedure_source: string;

  reimbursement: {
    cms_coverage: 'covered' | 'partial' | 'unlisted';
    medicare_facility_rate?: number;
    medicare_physician_rate?: number;
    private_payer_coverage: string;
  };

  major_device_competitors: string[];
  market_leader: string;
  market_leader_share_pct?: number;
  current_standard_of_care: string;

  cagr_5yr: number;
  growth_driver: string;
}
