// ============================================================
// TERRAIN — Core TypeScript Types
// All shared types for the platform. Import from '@/types'
// ============================================================

// ────────────────────────────────────────────────────────────
// USERS & AUTH
// ────────────────────────────────────────────────────────────

export type UserRole = 'founder' | 'bd_executive' | 'investor' | 'corp_dev' | 'researcher';

export type Plan = 'free' | 'pro' | 'team';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: UserRole | null;
  therapy_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserContext {
  profile: UserProfile;
  subscription: Subscription;
  usage: UsageContext;
}

export interface UsageContext {
  market_sizing: { count: number; limit: number };
  competitive: { count: number; limit: number };
  partners: { count: number; limit: number };
  regulatory: { count: number; limit: number };
}

// ────────────────────────────────────────────────────────────
// MARKET SIZING
// ────────────────────────────────────────────────────────────

export type DevelopmentStage = 
  | 'preclinical' 
  | 'phase1' 
  | 'phase2' 
  | 'phase3' 
  | 'approved';

export type GeographyCode =
  | 'US'
  | 'EU5'
  | 'Germany'
  | 'France'
  | 'Italy'
  | 'Spain'
  | 'UK'
  | 'Japan'
  | 'China'
  | 'Canada'
  | 'Australia'
  | 'RoW'
  | 'Global';

export type PricingAssumption = 'conservative' | 'base' | 'premium';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface MarketSizingInput {
  indication: string;
  subtype?: string;
  geography: GeographyCode[];
  development_stage: DevelopmentStage;
  mechanism?: string;
  molecular_target?: string;
  patient_segment?: string;                // e.g., "2L+ after platinum-based chemo"
  pricing_assumption: PricingAssumption;
  launch_year: number;
}

export interface MarketMetric {
  value: number;
  unit: 'B' | 'M' | 'K';
  confidence: ConfidenceLevel;
  range?: [number, number];               // Low-high range
  source?: string;
}

export interface PatientFunnel {
  us_prevalence: number;
  us_incidence: number;
  diagnosed: number;
  diagnosed_rate: number;                 // % of prevalent diagnosed
  treated: number;
  treated_rate: number;                   // % of diagnosed treated
  addressable: number;                    // Meets patient_segment criteria
  addressable_rate: number;
  capturable: number;                     // Realistic market share at peak
  capturable_rate: number;
}

export interface GeographyBreakdownItem {
  territory: GeographyCode | string;
  tam: MarketMetric;
  population: number;
  prevalence_rate: number;
  market_multiplier: number;              // vs US baseline (1.0)
  regulatory_status: string;
  notes?: string;
}

export interface ComparableDrug {
  name: string;
  company: string;
  launch_year: number;
  launch_wac: number;                     // Wholesale acquisition cost at launch
  current_net_price: number;             // Net after rebates (if available)
  indication: string;
  mechanism: string;
  phase: string;
}

export interface PricingAnalysis {
  comparable_drugs: ComparableDrug[];
  recommended_wac: {
    conservative: number;
    base: number;
    premium: number;
  };
  payer_dynamics: string;
  pricing_rationale: string;
  gross_to_net_estimate: number;         // % discount from WAC to net
}

export interface RevenueProjectionYear {
  year: number;
  bear: number;
  base: number;
  bull: number;
}

export interface DataSource {
  name: string;
  type: 'public' | 'proprietary' | 'licensed';
  url?: string;
  last_updated?: string;
}

export interface MarketSizingOutput {
  summary: {
    tam_us: MarketMetric;
    sam_us: MarketMetric;
    som_us: MarketMetric;
    global_tam: MarketMetric;
    peak_sales_estimate: { low: number; base: number; high: number };
    cagr_5yr: number;
    market_growth_driver: string;
  };
  patient_funnel: PatientFunnel;
  geography_breakdown: GeographyBreakdownItem[];
  pricing_analysis: PricingAnalysis;
  revenue_projection: RevenueProjectionYear[];
  competitive_context: {
    approved_products: number;
    phase3_programs: number;
    crowding_score: number;               // 1-10
    differentiation_note: string;
  };
  methodology: string;
  assumptions: string[];
  data_sources: DataSource[];
  generated_at: string;
  indication_validated: boolean;
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE LANDSCAPE
// ────────────────────────────────────────────────────────────

export type ClinicalPhase = 
  | 'Approved'
  | 'Phase 3'
  | 'Phase 2'
  | 'Phase 2/3'
  | 'Phase 1'
  | 'Phase 1/2'
  | 'Preclinical';

export interface Competitor {
  id: string;
  company: string;
  asset_name: string;
  generic_name?: string;
  mechanism: string;
  molecular_target?: string;
  phase: ClinicalPhase;
  indication_specifics: string;
  primary_endpoint?: string;
  key_data?: string;
  partner?: string;
  partnership_deal_value?: string;
  estimated_peak_sales?: string;
  differentiation_score: number;          // 1-10 vs assets at same phase
  evidence_strength: number;              // 1-10 based on data package
  strengths: string[];
  weaknesses: string[];
  nct_ids?: string[];
  source: string;
  last_updated: string;
}

export interface LandscapeSummary {
  indication: string;
  mechanism?: string;
  crowding_score: number;                 // 1-10
  crowding_label: 'Low' | 'Moderate' | 'High' | 'Extremely High';
  differentiation_opportunity: string;
  white_space: string[];
  key_insight: string;
}

export interface CompetitiveLandscapeOutput {
  summary: LandscapeSummary;
  approved_products: Competitor[];
  late_stage_pipeline: Competitor[];      // Phase 3
  mid_stage_pipeline: Competitor[];       // Phase 2
  early_pipeline: Competitor[];           // Phase 1 + Preclinical — PRO ONLY
  comparison_matrix: ComparisonAttribute[];
  data_sources: DataSource[];
  generated_at: string;
}

export interface ComparisonAttribute {
  attribute: string;                      // "Clinical Evidence", "MoA Differentiation", etc.
  competitors: { [company_asset: string]: string | number };
}

// ────────────────────────────────────────────────────────────
// PARTNER DISCOVERY
// ────────────────────────────────────────────────────────────

export interface PartnerDiscoveryInput {
  asset_description: string;
  indication: string;
  mechanism?: string;
  development_stage: DevelopmentStage;
  geography_rights: GeographyCode[];
  deal_types: ('licensing' | 'co-development' | 'acquisition' | 'co-promotion')[];
  exclude_companies?: string[];
  minimum_match_score?: number;           // Default: 25
}

export interface PartnerDeal {
  partner_company: string;
  licensed_to: string;
  indication: string;
  development_stage: DevelopmentStage;
  deal_type: string;
  upfront_usd?: number;
  total_value_usd?: number;
  royalty_range?: string;
  date: string;
  source: string;
}

export interface PartnerScoreBreakdown {
  therapeutic_alignment: number;          // 0-25: existing presence in indication
  pipeline_gap: number;                   // 0-25: asset fills a gap in their portfolio
  deal_history: number;                   // 0-20: track record at this stage
  financial_capacity: number;             // 0-15: can they afford expected terms
  geography_fit: number;                  // 0-15: rights geographies match footprint
}

export interface PartnerMatch {
  rank: number;
  company: string;
  company_type: 'Big Pharma' | 'Mid-Size Pharma' | 'Specialty Pharma' | 'Biotech';
  hq_location: string;
  market_cap?: string;
  bd_focus: string[];
  match_score: number;                    // 0-100
  score_breakdown: PartnerScoreBreakdown;
  recent_deals: PartnerDeal[];
  deal_terms_benchmark: {
    typical_upfront: string;
    typical_milestones: string;
    typical_royalty_range: string;
  };
  key_contacts?: string[];               // Public BD lead names
  rationale: string;
  watch_signals: string[];               // Why they might be motivated right now
}

export interface DealBenchmark {
  stage: string;
  avg_upfront_m: number;
  median_upfront_m: number;
  avg_total_value_m: number;
  median_total_value_m: number;
  typical_royalty_range: string;
  sample_size: number;
}

export interface PartnerDiscoveryOutput {
  ranked_partners: PartnerMatch[];
  deal_benchmarks: DealBenchmark;
  summary: {
    total_screened: number;
    total_matched: number;
    top_tier_count: number;
    avg_match_score: number;
    indication: string;
    development_stage: string;
  };
  methodology: string;
  data_sources: DataSource[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// REGULATORY INTELLIGENCE
// ────────────────────────────────────────────────────────────

export type RegulatoryAgency = 'FDA' | 'EMA' | 'PMDA' | 'NMPA';

export type DesignationName =
  | 'Breakthrough Therapy'
  | 'Fast Track'
  | 'Priority Review'
  | 'Accelerated Approval'
  | 'Orphan Drug'
  | 'Regenerative Medicine Advanced Therapy (RMAT)'
  | 'Rare Pediatric Disease'
  | 'PRIME (Priority Medicines)'
  | 'SAKIGAKE Designation';

export interface RegulatoryInput {
  indication: string;
  agency: RegulatoryAgency;
  development_stage: DevelopmentStage;
  unmet_need: 'high' | 'moderate' | 'low';
  patient_population: 'pediatric' | 'adult' | 'geriatric' | 'all';
  has_orphan_designation: boolean;
  mechanism_class?: string;
  biomarker_defined: boolean;
  prior_therapy_required?: string;
}

export interface RegulatoryPathway {
  name: string;
  description: string;
  typical_review_months: number;
  requirements: string[];
  data_package_requirements: string[];
  precedents: string[];
}

export interface DesignationOpportunity {
  designation: DesignationName;
  eligibility: 'likely' | 'possible' | 'unlikely';
  key_criteria_met: string[];
  key_criteria_unmet: string[];
  benefit: string;
  application_timing: string;
  estimated_time_savings?: string;
}

export interface ComparableApproval {
  drug: string;
  company: string;
  indication: string;
  pathway: string;
  designations: string[];
  ind_to_bla_months: number;
  review_months: number;
  approval_year: number;
  accelerated: boolean;
}

export interface RegulatoryRisk {
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface RegulatoryOutput {
  recommended_pathway: {
    primary: RegulatoryPathway;
    alternatives: RegulatoryPathway[];
    rationale: string;
  };
  timeline_estimate: {
    ind_submission_target?: string;
    phase1_completion?: string;
    phase2_completion?: string;
    phase3_completion?: string;
    bla_nda_submission?: string;
    approval_estimate?: string;
    total_to_approval: { optimistic: number; realistic: number; pessimistic: number };
  };
  designation_opportunities: DesignationOpportunity[];
  key_risks: RegulatoryRisk[];
  comparable_approvals: ComparableApproval[];
  review_division?: string;
  advisory_committee_likely: boolean;
  data_sources: DataSource[];
  generated_at: string;
}

// ────────────────────────────────────────────────────────────
// REPORTS
// ────────────────────────────────────────────────────────────

export type ReportType = 'market_sizing' | 'competitive' | 'regulatory' | 'partners' | 'full';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: ReportType;
  indication: string;
  inputs: MarketSizingInput | Partial<MarketSizingInput> | null;
  outputs: MarketSizingOutput | CompetitiveLandscapeOutput | null;
  status: 'draft' | 'final';
  is_starred: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// API RESPONSES
// ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface UsageResponse {
  feature: string;
  monthly_count: number;
  limit: number;                          // -1 = unlimited
  remaining: number;                      // -1 = unlimited
  resets_at: string;                      // ISO date of monthly reset
}

export interface MarketAnalysisResponse {
  data: MarketSizingOutput;
  report_id?: string;
  usage: UsageResponse;
}

// ────────────────────────────────────────────────────────────
// INTERNAL DATA TYPES (lib/data/)
// ────────────────────────────────────────────────────────────

export interface IndicationData {
  name: string;
  synonyms: string[];
  icd10_codes: string[];
  therapy_area: string;
  us_prevalence: number;
  us_incidence: number;
  prevalence_source: string;
  diagnosis_rate: number;                 // % of prevalent who are diagnosed
  treatment_rate: number;                 // % of diagnosed who receive treatment
  cagr_5yr: number;                       // Market CAGR estimate
  major_competitors: string[];
  last_updated?: string;
}

export interface TerritoryMultiplier {
  territory: string;
  code: GeographyCode;
  multiplier: number;                     // vs US = 1.0
  population_m: number;
  gdp_per_capita_usd: number;
  healthcare_spend_pct: number;
  notes: string;
}

export interface PricingBenchmark {
  drug_name: string;
  company: string;
  indication: string;
  therapy_area: string;
  mechanism_class: string;
  launch_year: number;
  us_launch_wac_annual: number;
  current_list_price?: number;
  orphan_drug: boolean;
  first_in_class: boolean;
  development_stage_at_deal?: DevelopmentStage;
}

export interface RegulatoryPathwayDefinition {
  pathway_name: string;
  agency: RegulatoryAgency;
  applicability: string;
  typical_review_months: number;
  requirements: string[];
  advantages: string[];
  disadvantages: string[];
}
