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
