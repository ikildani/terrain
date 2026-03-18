// ============================================================
// TERRAIN — Core TypeScript Types
// All shared types for the platform. Import from '@/types'
// ============================================================

import type { DeviceMarketSizingOutput, CDxOutput, NutraceuticalMarketSizingOutput } from './devices-diagnostics';
export type { DeviceMarketSizingOutput, CDxOutput } from './devices-diagnostics';
export type {
  DeviceMarketSizingInput,
  CDxMarketSizingInput,
  CDxDeal,
  RevenueStreamBreakdown,
  ProductCategory,
} from './devices-diagnostics';
export type {
  DeviceRegulatoryInput,
  DeviceRegulatoryOutput,
  DeviceCategory,
  FDADevicePathway,
  FDADeviceClass,
} from './devices-diagnostics';
export type {
  PredicateDeviceRecord,
  DeviceClinicalEvidenceStrategy,
  DeviceIndicationScopeScenario,
  DeviceManufacturingRisk,
} from './devices-diagnostics';
export type {
  DevicePartnerDiscoveryInput,
  DevicePartnerMatch,
  DeviceAcquisitionProbability,
  DeviceRegulatoryTrackRecord,
  DistributionStrengthAssessment,
  DeviceDealStructureModel,
} from './devices-diagnostics';
export type {
  NutraceuticalCategory,
  NutraceuticalChannel,
  ClaimType,
  NutraceuticalMarketSizingInput,
} from './devices-diagnostics';
export type {
  NutraceuticalMarketSizingOutput,
  NutraceuticalPartnerProfile,
  NutraceuticalPartnerMatch,
  NutraceuticalPartnerDiscoveryInput,
  NutraceuticalPartnerType,
  NutraceuticalConsumerFunnel,
  NutraceuticalChannelRevenue,
  NutraceuticalDTCEconomics,
  NutraceuticalRegulatoryAssessment,
  NutraceuticalCompetitivePositioning,
  NutraceuticalAmazonIntelligence,
  NutraceuticalAcquisitionAttractiveness,
} from './devices-diagnostics';
export type {
  CompetitiveDataSource,
  CompetitiveComparisonAttribute,
  CompetitiveMarketShareDistribution,
} from './devices-diagnostics';
export type {
  DeviceRegulatoryStatus,
  DeviceRegulatoryPathwayShort,
  ClinicalEvidenceLevel,
  TechnologyReadiness,
  DeviceCompetitor,
  DeviceSwitchingCostAnalysis,
  PredicateDeviceMapEntry,
  DeviceTechnologyLandscape,
  DeviceCompetitiveLandscapeInput,
  DeviceCompetitiveLandscapeOutput,
} from './devices-diagnostics';
export type {
  CDxPlatform,
  CDxRegulatoryStatus,
  CDxCompetitor,
  BiomarkerCompetitionEntry,
  CDxPlatformComparison,
  CDxLinkedDrugDependency,
  CDxCompetitiveLandscapeInput,
  CDxCompetitiveLandscapeOutput,
} from './devices-diagnostics';
export type {
  NutraPriceTier,
  NutraBrandCompetitor,
  NutraPricingLandscapeEntry,
  NutraCertificationMatrix,
  NutraClinicalEvidenceGap,
  NutraAmazonIntelligenceAgg,
  NutraceuticalCompetitiveLandscapeInput,
  NutraceuticalCompetitiveLandscapeOutput,
} from './devices-diagnostics';

// ────────────────────────────────────────────────────────────
// USERS & AUTH
// ────────────────────────────────────────────────────────────

export type UserRole = 'founder' | 'bd_executive' | 'investor' | 'corp_dev' | 'researcher';

export type Plan = 'free' | 'pro' | 'team' | 'enterprise';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete';

// ────────────────────────────────────────────────────────────
// WORKSPACES
// ────────────────────────────────────────────────────────────

export type WorkspaceRole = 'owner' | 'admin' | 'analyst' | 'viewer';

export type WorkspacePlan = 'team' | 'enterprise';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  plan: WorkspacePlan;
  logo_url: string | null;
  brand_primary_color: string | null;
  brand_footer_text: string | null;
  max_seats: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  invited_by: string | null;
  // Joined fields from profiles (optional, populated by API)
  email?: string;
  full_name?: string | null;
  user_name?: string | null;
  user_email?: string | null;
}

export interface ReportFolder {
  id: string;
  workspace_id: string;
  name: string;
  parent_id: string | null;
  created_by: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  workspace_id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  report_type: string;
  inputs: Record<string, unknown>;
  tags: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  top_indications: { indication: string; count: number }[];
  usage_by_member: { user_id: string; name: string; analysis_count: number; report_count: number }[];
  activity_by_day: { date: string; count: number }[];
  report_type_distribution: { type: string; count: number }[];
  total_analyses: number;
  total_reports: number;
}

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

export type DevelopmentStage = 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved';

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
  | 'South Korea'
  | 'Brazil'
  | 'India'
  | 'Mexico'
  | 'Taiwan'
  | 'Saudi Arabia'
  | 'Israel'
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
  patient_segment?: string; // e.g., "2L+ after platinum-based chemo"
  pricing_assumption: PricingAssumption;
  launch_year: number;
  regulatory_designations?: RegulatoryDesignation[]; // Enhancement 9: pathway-based LoA modifiers
}

export type RegulatoryDesignation =
  | 'Breakthrough Therapy'
  | 'Fast Track'
  | 'Priority Review'
  | 'Accelerated Approval'
  | 'Orphan Drug';

export interface MarketMetric {
  value: number;
  unit: 'B' | 'M' | 'K';
  confidence: ConfidenceLevel;
  range?: [number, number]; // Low-high range
  source?: string;
}

export interface PatientFunnel {
  us_prevalence: number;
  us_incidence: number;
  diagnosed: number;
  diagnosed_rate: number; // % of prevalent diagnosed
  treated: number;
  treated_rate: number; // % of diagnosed treated
  adherent: number; // Patients who remain on therapy (treated * adherence_rate)
  adherence_rate: number; // Real-world adherence/persistence rate (0-1)
  addressable: number; // Meets patient_segment criteria
  addressable_rate: number;
  capturable: number; // Realistic market share at peak
  capturable_rate: number;
}

export interface GeographyBreakdownItem {
  territory: GeographyCode | string;
  tam: MarketMetric;
  population: number;
  prevalence_rate: number;
  market_multiplier: number; // vs US baseline (1.0)
  regulatory_status: string;
  notes?: string;
}

export interface ComparableDrug {
  name: string;
  company: string;
  launch_year: number;
  launch_wac: number; // Wholesale acquisition cost at launch
  current_net_price: number; // Net after rebates (if available)
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
  gross_to_net_estimate: number; // % discount from WAC to net
}

export interface RevenueProjectionYear {
  year: number;
  bear: number;
  base: number;
  bull: number;
  ira_adjusted?: boolean;
}

export interface SensitivityDriver {
  variable: string;
  low_som_m: number;
  high_som_m: number;
  base_som_m: number;
  swing_pct: number;
}

export interface ParsedEfficacy {
  orr_pct?: number;
  cr_pct?: number;
  pfs_months?: number;
  os_months?: number;
  os_hr?: number;
  pfs_hr?: number;
  dor_months?: number;
}

export interface ThreatAssessment {
  threat_score: number;
  threat_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  threat_factors: string[];
}

export interface DisplacementRisk {
  risk_level: 'low' | 'medium' | 'high';
  narrative: string;
  key_threats: string[];
}

export interface DataSource {
  name: string;
  type: 'public' | 'proprietary' | 'licensed';
  url?: string;
  last_updated?: string;
}

export interface RiskAdjustment {
  probability_of_success: number;
  therapy_area: string;
  development_stage: DevelopmentStage;
  risk_adjusted_peak_sales: { low: number; base: number; high: number };
  risk_adjusted_npv_m: number;
  discount_rate: number;
}

export interface IRAImpact {
  product_type: 'small_molecule' | 'biologic';
  negotiation_year: number;
  affected_years: number[];
  medicare_revenue_share: number;
  price_reduction_pct: number;
  annual_revenue_impact_m: number;
}

export interface CompetitiveResponseModel {
  year: number;
  new_entrants_expected: number;
  price_erosion_pct: number;
  share_erosion_pct: number;
  adjusted_revenue_m: number;
}

export interface BiosimilarErosionCurve {
  years_post_loe: number[];
  share_retained_pct: number[];
  product_type: 'small_molecule' | 'biologic';
  erosion_model: 'rapid' | 'gradual' | 'protected';
  narrative: string;
}

export interface PayerMixEvolution {
  year: number;
  commercial_pct: number;
  medicare_pct: number;
  medicaid_pct: number;
  va_dod_pct: number;
  blended_net_price_factor: number;
  mea_impact_pct: number;
}

export interface PatientSwitchingModel {
  competitor: string;
  share_source: 'cannibalistic' | 'additive' | 'mixed';
  share_captured_pct: number;
  rationale: string;
}

export interface PatientDynamics {
  total_share_additive_pct: number;
  total_share_cannibalistic_pct: number;
  net_market_expansion_pct: number;
  switching_sources: PatientSwitchingModel[];
  narrative: string;
}

export interface AdvisoryCommitteeModel {
  adcom_probability_pct: number;
  favorable_vote_probability_pct: number;
  crl_probability_pct: number;
  risk_factors: string[];
  historical_context: string;
  timeline_impact_months: { if_favorable: number; if_unfavorable: number };
}

export interface PartnerTrackRecord {
  total_deals_last_10yr: number;
  successful_integrations: number;
  terminated_deals: number;
  integration_success_rate: number;
  avg_time_to_first_milestone_months: number;
  track_record_label: 'Excellent' | 'Good' | 'Mixed' | 'Poor' | 'Unknown';
  notable_successes: string[];
  notable_failures: string[];
}

// ────────────────────────────────────────────────────────────
// BIOMARKER NESTING (Market Sizing 95+)
// Cascade: Indication → Biomarker → Sub-population
// ────────────────────────────────────────────────────────────

export interface BiomarkerNestingLevel {
  name: string;
  prevalence_pct: number;
  loa_modifier: number; // Multiplier vs base LoA (e.g., 1.4 for biomarker-selected)
  addressable_patients: number;
  pricing_premium_pct: number; // Biomarker-selected often commands premium
}

export interface BiomarkerNesting {
  indication: string;
  levels: BiomarkerNestingLevel[];
  total_addressable_after_nesting: number;
  effective_loa: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// INTEGRATED REVENUE PROJECTION (Market Sizing 95+)
// Merges payer mix, competitive response, and biosimilar
// erosion into a single annual projection row
// ────────────────────────────────────────────────────────────

export interface IntegratedRevenueYear {
  year: number;
  gross_revenue_m: number;
  payer_mix_factor: number;
  competitive_erosion_pct: number;
  ira_reduction_pct: number;
  biosimilar_erosion_pct: number;
  net_revenue_bear_m: number;
  net_revenue_base_m: number;
  net_revenue_bull_m: number;
  cumulative_patients_treated: number;
}

// ────────────────────────────────────────────────────────────
// INTERACTION SENSITIVITY (Market Sizing 95+)
// Two-variable interaction scenarios for tornado analysis
// ────────────────────────────────────────────────────────────

export interface SensitivityInteraction {
  variable_a: string;
  variable_b: string;
  scenario: 'both_low' | 'both_high' | 'a_low_b_high' | 'a_high_b_low';
  som_m: number;
  delta_vs_base_pct: number;
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE READOUT TIMING (Competitive 95+)
// Expected data readout and launch dates per competitor
// ────────────────────────────────────────────────────────────

export interface CompetitiveTimeline {
  company: string;
  asset_name: string;
  current_phase: ClinicalPhase;
  expected_data_readout?: string; // "Q2 2027"
  estimated_filing_date?: string; // "H1 2028"
  estimated_launch_date?: string; // "2029"
  confidence: ConfidenceLevel;
  timeline_risk_factors: string[];
}

// ────────────────────────────────────────────────────────────
// EFFICACY DELTA (Competitive 95+)
// Head-to-head positioning vs user's asset
// ────────────────────────────────────────────────────────────

export interface EfficacyDelta {
  competitor: string;
  metric: string; // "ORR", "PFS", "OS HR"
  competitor_value: number;
  benchmark_value?: number; // User's asset or SoC
  delta: number;
  delta_direction: 'favorable' | 'unfavorable' | 'neutral';
  clinical_significance: string;
}

// ────────────────────────────────────────────────────────────
// BARRIER TO ENTRY (Competitive 95+)
// IP moats, manufacturing complexity, first-mover advantages
// ────────────────────────────────────────────────────────────

export interface BarrierToEntry {
  barrier_type:
    | 'ip_protection'
    | 'manufacturing_complexity'
    | 'first_mover'
    | 'regulatory_exclusivity'
    | 'payer_entrenchment'
    | 'kol_network';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_competitors: string[];
}

export interface BarrierAssessment {
  overall_barrier_score: number; // 1-10
  barrier_label: 'Low' | 'Moderate' | 'High' | 'Very High';
  barriers: BarrierToEntry[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// CRL DECAY CURVES (Regulatory 95+)
// Time-to-resubmission and CRL-to-approval conversion rates
// ────────────────────────────────────────────────────────────

export interface CRLDecayCurve {
  therapy_area: string;
  historical_crl_rate_pct: number;
  avg_months_to_resubmission: number;
  resubmission_approval_rate_pct: number;
  common_crl_reasons: string[];
  recovery_narrative: string;
}

// ────────────────────────────────────────────────────────────
// SURROGATE STRENGTH MATRIX (Regulatory 95+)
// Endpoint × indication strength scoring
// ────────────────────────────────────────────────────────────

export interface SurrogateStrengthEntry {
  endpoint: string;
  indication: string;
  strength_score: number; // 1-10
  fda_precedent_count: number;
  recent_acceptance: boolean; // Accepted in last 3 years?
  notes: string;
}

// ────────────────────────────────────────────────────────────
// PARTNER PORTFOLIO APPETITE (Partners 95+)
// How actively a partner is building specific capabilities
// ────────────────────────────────────────────────────────────

export interface PortfolioAppetite {
  mechanism_category: string;
  appetite_level: 'actively_building' | 'established' | 'exploring' | 'divesting';
  evidence: string[]; // Recent deals, hires, etc.
  score: number; // 0-10
}

// ────────────────────────────────────────────────────────────
// GEOGRAPHIC REGULATORY STRENGTH (Partners 95+)
// Differentiated by region
// ────────────────────────────────────────────────────────────

export interface GeographicStrength {
  region: string;
  commercial_strength: number; // 1-10
  regulatory_capability: number; // 1-10
  kol_network: number; // 1-10
  reimbursement_track_record: number; // 1-10
  overall: number; // 1-10
}

// ────────────────────────────────────────────────────────────
// CROSS-ENGINE INTEGRATION SIGNALS
// Data flowing between engines for coherent analysis
// ────────────────────────────────────────────────────────────

export interface CrossEngineSignals {
  competitive_crowding_for_share: number; // Feeds market sizing share adjustment
  regulatory_timeline_for_revenue_start: number; // Months until revenue begins
  loa_for_risk_adjustment: number; // Feeds market sizing eNPV
  partner_urgency_from_competition: number; // Competitive density → partner urgency
}

// ────────────────────────────────────────────────────────────
// PERCENTILE PROJECTIONS (Market Sizing 99+)
// P10/P25/P50/P75/P90 confidence intervals per year
// ────────────────────────────────────────────────────────────

export interface PercentileProjection {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

// ────────────────────────────────────────────────────────────
// TREATMENT LINE MODEL (Market Sizing 99+)
// 1L/2L/3L+ patient split with attrition & share ceilings
// ────────────────────────────────────────────────────────────

export interface TreatmentLineModel {
  line: '1L' | '2L' | '3L+';
  patient_count: number;
  share_ceiling: number;
  attrition_from_prior_line: number;
  pricing_multiplier: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// NON-LINEAR COMPETITIVE EROSION (Market Sizing 99+)
// Diminishing share loss per additional competitor
// ────────────────────────────────────────────────────────────

export interface NonLinearCompetitiveErosion {
  competitor_number: number;
  share_loss_pct: number;
  cumulative_share_loss_pct: number;
  mechanism_overlap: boolean;
}

// ────────────────────────────────────────────────────────────
// MECHANISM-BASED COMPETITIVE ANALYSIS
// Investment-bank grade mechanism similarity scoring
// ────────────────────────────────────────────────────────────

export type MechanismRelationship = 'same_mechanism' | 'same_target' | 'same_pathway' | 'different_mechanism';

export interface CompetitiveMechanismAnalysis {
  competitors: {
    name: string;
    mechanism: string;
    similarity_score: number; // 0-1
    relationship: MechanismRelationship;
    erosion_impact_pct: number;
    market_effect: 'cannibalistic' | 'additive' | 'mixed';
  }[];
  overall_mechanism_crowding: 'high' | 'moderate' | 'low';
  mechanism_weighted_erosion_pct: number;
  differentiation_narrative: string;
}

// ────────────────────────────────────────────────────────────
// PATENT CLIFF ANALYSIS
// Granular LOE modeling by product type
// ────────────────────────────────────────────────────────────

export interface PatentCliffAnalysis {
  product_type: 'small_molecule' | 'biologic' | 'cell_gene_therapy';
  estimated_loe_year: number;
  exclusivity_type: string; // "NCE 5-year + patent" | "12-year biologic" | "7-year orphan" | "No generic pathway"
  erosion_profile: { year: number; retained_pct: number }[];
  peak_to_trough_decline_pct: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// GTN EVOLUTION (Market Sizing 99+)
// Year-by-year gross-to-net modeling
// ────────────────────────────────────────────────────────────

export interface GTNEvolutionYear {
  year: number;
  base_gtn_pct: number;
  rebate_escalation_pct: number;
  three_forty_b_pressure_pct: number;
  part_b_vs_d_mix_effect: number;
  effective_gtn_pct: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// EFFICACY SHARE MODIFIER (Market Sizing 99+)
// Differentiation tier → share multiplier
// ────────────────────────────────────────────────────────────

export interface EfficacyShareModifier {
  differentiation_tier: 'best_in_class' | 'differentiated' | 'comparable' | 'me_too';
  share_multiplier: number;
  evidence_basis: string;
  comparable_precedents: string[];
}

// ────────────────────────────────────────────────────────────
// SAFETY PROFILE (Competitive 99+)
// Structured safety data extracted from key_data
// ────────────────────────────────────────────────────────────

export interface SafetyProfile {
  grade3_plus_ae_rate_pct?: number;
  treatment_discontinuation_rate_pct?: number;
  any_irae_rate_pct?: number;
  safety_score: number;
  key_safety_signals: string[];
  safety_vs_efficacy_tradeoff: string;
}

// ────────────────────────────────────────────────────────────
// MARKET SHARE DISTRIBUTION (Competitive 99+)
// Estimated shares + HHI concentration index
// ────────────────────────────────────────────────────────────

export interface MarketShareDistribution {
  competitors: { name: string; phase: string; estimated_share_pct: number }[];
  hhi_index: number;
  concentration_label: 'Fragmented' | 'Moderate' | 'Concentrated' | 'Monopolistic';
  top_3_share_pct: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// COMPETITOR SUCCESS PROBABILITY (Competitive 99+)
// Phase-wise LoA for each competitor
// ────────────────────────────────────────────────────────────

export interface CompetitorSuccessProbability {
  company: string;
  asset_name: string;
  current_phase: string;
  probability_of_approval: number;
  probability_weighted_threat: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DOSING CONVENIENCE (Competitive 99+)
// Route, frequency, convenience scoring
// ────────────────────────────────────────────────────────────

export interface DosingConvenience {
  route_of_administration: string;
  dosing_frequency: string;
  infusion_time_minutes?: number;
  home_vs_clinic: 'home' | 'clinic' | 'either';
  convenience_score: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEAL STRUCTURE MODEL (Partners 99+)
// Milestone breakdowns, opt-in/opt-out, governance
// ────────────────────────────────────────────────────────────

export interface DealStructureModel {
  upfront_pct_of_total: number;
  clinical_milestones_pct: number;
  commercial_milestones_pct: number;
  has_opt_in_opt_out: boolean;
  opt_in_stage?: string;
  governance_complexity: 'simple' | 'moderate' | 'complex';
  benchmark_percentile: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// PARTNER PHASE SUCCESS RATES (Partners 99+)
// Development-stage-specific success rates per partner
// ────────────────────────────────────────────────────────────

export interface PartnerPhaseSuccessRates {
  company: string;
  phase1_to_phase2_pct: number;
  phase2_to_phase3_pct: number;
  phase3_to_approval_pct: number;
  overall_success_rate: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// NEGOTIATION LEVERAGE (Partners 99+)
// 6-factor leverage assessment
// ────────────────────────────────────────────────────────────

export interface NegotiationLeverageFactor {
  factor: string;
  direction: 'strengthens' | 'weakens';
  weight: number;
  narrative: string;
}

export interface NegotiationLeverage {
  overall_leverage: 'strong' | 'moderate' | 'weak';
  leverage_score: number;
  factors: NegotiationLeverageFactor[];
  estimated_competing_bidders: number;
  asset_scarcity_score: number;
  time_pressure_seller: number;
  time_pressure_buyer: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// LOE GAP ANALYSIS (Partners 99+)
// Strategic fit: partner LOE timeline vs user asset launch
// ────────────────────────────────────────────────────────────

export interface LOEGapAnalysis {
  partner: string;
  upcoming_loe_drugs: { drug: string; loe_year: number; revenue_at_risk_b: number }[];
  revenue_gap_year: number;
  gap_severity: 'critical' | 'significant' | 'moderate' | 'minimal';
  user_asset_fills_gap: boolean;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// PRECEDENT TRIAL DESIGN (Regulatory 99+)
// Landmark trial design parameters
// ────────────────────────────────────────────────────────────

export interface PrecedentTrialDesign {
  drug: string;
  indication: string;
  trial_name: string;
  design: string;
  primary_endpoint: string;
  sample_size: number;
  enrollment_months: number;
  comparator: string;
  result_summary: string;
  approval_year: number;
}

// ────────────────────────────────────────────────────────────
// TRIAL DESIGN RECOMMENDATION (Regulatory 99+)
// Concrete trial design guidance
// ────────────────────────────────────────────────────────────

export interface TrialDesignRecommendation {
  recommended_design: string;
  adaptive_elements: string[];
  enrichment_strategy?: string;
  recommended_endpoint: string;
  endpoint_rationale: string;
  estimated_sample_size: { low: number; base: number; high: number };
  estimated_enrollment_months: number;
  key_design_risks: string[];
}

// ────────────────────────────────────────────────────────────
// LABEL SCOPE SCENARIO (Regulatory 99+)
// Narrow/base/broad label outcomes
// ────────────────────────────────────────────────────────────

export interface LabelScopeScenario {
  scenario: 'narrow' | 'base' | 'broad';
  label_description: string;
  regulatory_risk: 'low' | 'medium' | 'high';
  revenue_impact_multiplier: number;
  probability_of_scenario: number;
  precedents: string[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// CMC RISK ASSESSMENT (Regulatory 99+)
// Manufacturing complexity & de-risking
// ────────────────────────────────────────────────────────────

export interface CMCRiskAssessment {
  modality_complexity_score: number;
  pre_approval_inspection_risk: 'low' | 'medium' | 'high';
  process_validation_months: number;
  estimated_cmc_cost_m: { low: number; base: number; high: number };
  key_cmc_risks: string[];
  de_risking_strategies: string[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// LABEL EXPANSION (Enhancement 6)
// Models additional indications that could expand addressable market
// ────────────────────────────────────────────────────────────

export interface LabelExpansionOpportunity {
  indication: string;
  therapy_area: string;
  additional_addressable_patients: number;
  expected_approval_year: number;
  incremental_peak_revenue_m: number;
  probability: number;
  rationale: string;
}

// ────────────────────────────────────────────────────────────
// PAYER-TIER PRICING (Enhancement 7)
// Multi-dimensional pricing model with payer-specific rebate tiers
// ────────────────────────────────────────────────────────────

export interface PayerTierPricingEntry {
  payer_tier: string;
  share_pct: number;
  discount_pct: number;
  net_price: number;
  rationale: string;
}

export interface PayerTierPricing {
  year: number;
  wac: number;
  tiers: PayerTierPricingEntry[];
  blended_net_price: number;
  effective_gtn_pct: number;
}

// ────────────────────────────────────────────────────────────
// MANUFACTURING CAPACITY CONSTRAINT (Enhancement 8)
// Supply-side cap on revenue for complex modalities
// ────────────────────────────────────────────────────────────

export type ManufacturingProductType = 'small_molecule' | 'biologic' | 'cell_gene_therapy';

export interface ManufacturingConstraint {
  product_type: ManufacturingProductType;
  constrained_years: { year: number; capacity_pct: number; revenue_cap_m: number }[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DEVICE MANUFACTURING CONSTRAINT (Enhancement 8)
// ────────────────────────────────────────────────────────────

export interface DeviceManufacturingConstraint {
  product_category: string;
  constrained_years: { year: number; capacity_pct: number; revenue_cap_m: number }[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// REGULATORY PATHWAY ANALYSIS (Enhancement 9)
// LoA modifiers based on regulatory designations
// ────────────────────────────────────────────────────────────

export interface RegulatoryPathwayAnalysis {
  base_loa: number;
  designations: RegulatoryDesignation[];
  pathway_modifier: number;
  adjusted_loa: number;
  rationale: string;
  inferred: boolean; // true if designations were inferred from indication characteristics
}

// ────────────────────────────────────────────────────────────
// ONE-TIME TREATMENT MODEL (Enhancement C)
// Gene therapy / CAR-T prevalent pool depletion model
// ────────────────────────────────────────────────────────────

export interface OneTimeTreatmentModel {
  is_one_time: boolean;
  prevalent_pool: number;
  annual_new_cases: number;
  pool_depletion_years: number; // Years to exhaust prevalent pool
  steady_state_revenue_m: number; // Annual revenue from new cases only
  revenue_by_year: { year: number; patients_treated: number; revenue_m: number }[];
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// PEDIATRIC ANALYSIS (Enhancement E)
// Pediatric population modeling and pricing adjustment
// ────────────────────────────────────────────────────────────

export interface PediatricAnalysis {
  is_pediatric_focused: boolean;
  pediatric_prevalence: number;
  adult_prevalence: number;
  pricing_adjustment: number; // 0.7-0.9x
  rationale: string;
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
    crowding_score: number; // 1-10
    differentiation_note: string;
  };
  methodology: string;
  assumptions: string[];
  data_sources: DataSource[];
  generated_at: string;
  indication_validated: boolean;
  /** True when the indication was resolved from dynamic enrichment data, not static */
  indication_enriched?: boolean;
  risk_adjustment?: RiskAdjustment;
  sensitivity_analysis?: SensitivityDriver[];
  ira_impact?: IRAImpact;
  competitive_response?: CompetitiveResponseModel[];
  biosimilar_erosion?: BiosimilarErosionCurve;
  payer_mix_evolution?: PayerMixEvolution[];
  patient_dynamics?: PatientDynamics;
  biomarker_nesting?: BiomarkerNesting;
  integrated_projection?: IntegratedRevenueYear[];
  sensitivity_interactions?: SensitivityInteraction[];
  cross_engine_signals?: CrossEngineSignals;
  percentile_projections?: PercentileProjection[];
  treatment_line_model?: TreatmentLineModel[];
  non_linear_competitive_erosion?: NonLinearCompetitiveErosion[];
  gtn_evolution?: GTNEvolutionYear[];
  efficacy_share_modifier?: EfficacyShareModifier;
  label_expansion_opportunities?: LabelExpansionOpportunity[];
  payer_tier_pricing?: PayerTierPricing[];
  manufacturing_constraint?: ManufacturingConstraint;
  regulatory_pathway_analysis?: RegulatoryPathwayAnalysis;
  competitive_mechanism_analysis?: CompetitiveMechanismAnalysis;
  patent_cliff_analysis?: PatentCliffAnalysis;
  one_time_treatment_model?: OneTimeTreatmentModel;
  pediatric_analysis?: PediatricAnalysis;

  // Enhancement: Deal Comps Analysis (implied valuations from M&A precedents)
  deal_comps_analysis?: DealCompsAnalysis;

  // Enhancement: Bull/Base/Bear Investment Thesis
  investment_thesis?: InvestmentThesis;

  // Enhancement: Clinical Development Cost Estimation
  development_cost_estimate?: MarketSizingDevelopmentCost;

  // Enhancement: Full DCF Waterfall Table
  dcf_waterfall?: DCFWaterfall;
}

// ────────────────────────────────────────────────────────────
// DEAL COMPS ANALYSIS (Implied Valuations from M&A Precedents)
// ────────────────────────────────────────────────────────────

export interface DealCompsAnalysisEntry {
  acquirer: string;
  target: string;
  asset_or_indication: string;
  therapy_area: string;
  development_stage: string;
  deal_type: 'acquisition' | 'licensing' | 'co_development' | 'option' | 'collaboration';
  total_deal_value_m: number;
  upfront_m: number;
  milestones_m: number;
  royalty_pct?: number;
  peak_sales_estimate_m: number;
  ev_peak_sales_multiple: number;
  year: number;
  source: string;
}

export interface DealCompsAnalysis {
  comparable_deals: DealCompsAnalysisEntry[];
  median_ev_peak_sales: number;
  mean_ev_peak_sales: number;
  implied_valuation_low_m: number;
  implied_valuation_base_m: number;
  implied_valuation_high_m: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// BULL/BASE/BEAR INVESTMENT THESIS
// ────────────────────────────────────────────────────────────

export interface InvestmentScenario {
  peak_sales_m: number;
  probability_pct: number;
  drivers: string[];
  narrative: string;
}

export interface InvestmentThesis {
  bull_case: InvestmentScenario;
  base_case: InvestmentScenario;
  bear_case: InvestmentScenario;
  expected_value_m: number;
  key_binary_risks: string[];
  investment_decision_framework: string;
}

// ────────────────────────────────────────────────────────────
// CLINICAL DEVELOPMENT COST ESTIMATION (Market Sizing Module)
// ────────────────────────────────────────────────────────────

export interface DevelopmentPhaseEntry {
  phase: string;
  cost_m: number;
  duration_years: number;
}

export interface MarketSizingDevelopmentCost {
  remaining_phases: DevelopmentPhaseEntry[];
  total_remaining_cost_m: number;
  estimated_years_to_launch: number;
  cost_adjusted_npv_m: number;
  narrative: string;
}

// ────────────────────────────────────────────────────────────
// DCF WATERFALL TABLE
// ────────────────────────────────────────────────────────────

export interface DCFWaterfallYear {
  year: number;
  revenue_m: number;
  cogs_m: number;
  gross_profit_m: number;
  sgna_m: number;
  rnd_m: number;
  ebit_m: number;
  tax_m: number;
  fcf_m: number;
  discount_factor: number;
  pv_fcf_m: number;
}

export interface DCFSensitivityPoint {
  wacc: number;
  ev_m: number;
}

export interface DCFWaterfall {
  discount_rate_pct: number;
  years: DCFWaterfallYear[];
  sum_pv_fcf_m: number;
  terminal_value_m: number;
  enterprise_value_m: number;
  sensitivity: DCFSensitivityPoint[];
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE LANDSCAPE
// ────────────────────────────────────────────────────────────

export type ClinicalPhase =
  | 'Approved'
  | 'Withdrawn'
  | 'Discontinued'
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
  differentiation_score: number; // 1-10 vs assets at same phase
  evidence_strength: number; // 1-10 based on data package
  strengths: string[];
  weaknesses: string[];
  nct_ids?: string[];
  source: string;
  last_updated: string;
  parsed_efficacy?: ParsedEfficacy;
  threat_assessment?: ThreatAssessment;
  competitive_timeline?: CompetitiveTimeline;
  efficacy_deltas?: EfficacyDelta[];
  safety_profile?: SafetyProfile;
  dosing_convenience?: DosingConvenience;
  exclusivity_type?: 'NCE' | 'orphan' | 'biologic' | 'pediatric' | 'none';
  exclusivity_expiry?: string; // ISO date
  combination_partners?: string[];
  approved_geographies?: string[];
  line_of_therapy?: string;
}

export interface LandscapeSummary {
  indication: string;
  mechanism?: string;
  crowding_score: number; // 1-10
  crowding_label: 'Low' | 'Moderate' | 'High' | 'Extremely High';
  differentiation_opportunity: string;
  white_space: string[];
  key_insight: string;
}

export interface CompetitiveLandscapeOutput {
  summary: LandscapeSummary;
  approved_products: Competitor[];
  late_stage_pipeline: Competitor[]; // Phase 3
  mid_stage_pipeline: Competitor[]; // Phase 2
  early_pipeline: Competitor[]; // Phase 1 + Preclinical — PRO ONLY
  comparison_matrix: ComparisonAttribute[];
  data_sources: DataSource[];
  generated_at: string;
  displacement_risk?: DisplacementRisk;
  barrier_assessment?: BarrierAssessment;
  competitive_timelines?: CompetitiveTimeline[];
  market_share_distribution?: MarketShareDistribution;
  competitor_success_probabilities?: CompetitorSuccessProbability[];
  patent_cliff_timeline?: {
    company: string;
    asset: string;
    exclusivity_type: string;
    expiry: string;
    revenue_at_risk?: string;
  }[];
  lot_crowding?: {
    line: string;
    competitor_count: number;
    approved_count: number;
    crowding_intensity: 'low' | 'moderate' | 'high';
  }[];
}

export interface ComparisonAttribute {
  attribute: string; // "Clinical Evidence", "MoA Differentiation", etc.
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
  minimum_match_score?: number; // Default: 25
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
  therapeutic_alignment: number; // 0-25: existing presence in indication
  pipeline_gap: number; // 0-25: asset fills a gap in their portfolio
  deal_history: number; // 0-20: track record at this stage
  financial_capacity: number; // 0-15: can they afford expected terms
  geography_fit: number; // 0-15: rights geographies match footprint
  competing_penalty?: number; // 0 to -10: penalty for competing partnerships
}

export interface PartnerMatch {
  rank: number;
  company: string;
  company_type: 'Big Pharma' | 'Mid-Size Pharma' | 'Specialty Pharma' | 'Biotech';
  hq_location: string;
  market_cap?: string;
  bd_focus: string[];
  match_score: number; // 0-100
  score_breakdown: PartnerScoreBreakdown;
  recent_deals: PartnerDeal[];
  deal_terms_benchmark: {
    typical_upfront: string;
    typical_milestones: string;
    typical_royalty_range: string;
  };
  key_contacts?: string[]; // Public BD lead names
  rationale: string;
  watch_signals: string[]; // Why they might be motivated right now
  mechanism_expertise_score?: number;
  patent_cliff_urgency?: string;
  track_record?: PartnerTrackRecord;
  portfolio_appetite?: PortfolioAppetite[];
  geographic_strengths?: GeographicStrength[];
  deal_structure_model?: DealStructureModel;
  phase_success_rates?: PartnerPhaseSuccessRates;
  loe_gap_analysis?: LOEGapAnalysis;
}

export interface DealBenchmark {
  stage: string;
  avg_upfront_m: number;
  median_upfront_m: number;
  avg_total_value_m: number;
  median_total_value_m: number;
  typical_royalty_range: string;
  sample_size: number;
  therapy_area?: string;
  therapy_area_context?: string;
  failure_adjusted_value_m?: number;
  failure_rate_pct?: number;
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
  negotiation_leverage?: NegotiationLeverage;
}

// ────────────────────────────────────────────────────────────
// REGULATORY INTELLIGENCE
// ────────────────────────────────────────────────────────────

export type RegulatoryAgency = 'FDA' | 'EMA' | 'PMDA' | 'NMPA' | 'MHRA' | 'TGA' | 'Health_Canada';

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

export interface ProbabilityOfSuccess {
  loa: number;
  phase_transition_rates: { from: string; to: string; rate: number }[];
  therapy_area: string;
  stage: DevelopmentStage;
}

export interface FilingSequenceEntry {
  agency: RegulatoryAgency;
  recommended_offset_months: number;
  rationale: string;
  estimated_filing_date?: string;
}

export interface DevelopmentCostEstimate {
  remaining_cost_low_m: number;
  remaining_cost_base_m: number;
  remaining_cost_high_m: number;
  pdufa_fee_m: number;
  notes: string[];
}

export interface SurrogateEndpoint {
  endpoint: string;
  status: 'validated' | 'reasonably_likely' | 'exploratory';
  fda_guidance?: string;
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
  advisory_committee_model?: AdvisoryCommitteeModel;
  data_sources: DataSource[];
  generated_at: string;
  probability_of_success?: ProbabilityOfSuccess;
  filing_sequence?: FilingSequenceEntry[];
  cost_estimate?: DevelopmentCostEstimate;
  competitive_landscape_risk?: RegulatoryRisk[];
  available_surrogate_endpoints?: SurrogateEndpoint[];
  crl_decay_curve?: CRLDecayCurve;
  surrogate_strength_matrix?: SurrogateStrengthEntry[];
  precedent_trial_designs?: PrecedentTrialDesign[];
  trial_design_recommendation?: TrialDesignRecommendation;
  label_scope_scenarios?: LabelScopeScenario[];
  cmc_risk?: CMCRiskAssessment;
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
  outputs:
    | MarketSizingOutput
    | DeviceMarketSizingOutput
    | CDxOutput
    | NutraceuticalMarketSizingOutput
    | CompetitiveLandscapeOutput
    | null;
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
  limit: number; // -1 = unlimited
  remaining: number; // -1 = unlimited
  resets_at: string; // ISO date of monthly reset
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
  diagnosis_rate: number; // % of prevalent who are diagnosed
  treatment_rate: number; // % of diagnosed who receive treatment
  cagr_5yr: number; // Market CAGR estimate
  major_competitors: string[];
  last_updated?: string;
}

export interface TerritoryMultiplier {
  territory: string;
  code: GeographyCode;
  multiplier: number; // vs US = 1.0
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

// ────────────────────────────────────────────────────────────
// ANNOTATIONS
// ────────────────────────────────────────────────────────────

export interface Annotation {
  id: string;
  report_id: string;
  workspace_id: string;
  user_id: string;
  content: string;
  mentions: string[];
  parent_id: string | null;
  section_key: string | null;
  resolved: boolean;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  user_name?: string;
  user_email?: string;
}

// ────────────────────────────────────────────────────────────
// COMPARISON
// ────────────────────────────────────────────────────────────

export interface ComparisonRow {
  label: string;
  category: string;
  values: (string | number | null)[];
  format?: 'currency' | 'percent' | 'number' | 'text';
}

// ────────────────────────────────────────────────────────────
// AUDIT LOG
// ────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  workspace_id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

// ────────────────────────────────────────────────────────────
// SSO CONFIGURATION
// ────────────────────────────────────────────────────────────

export interface SSOConfig {
  id: string;
  workspace_id: string;
  provider: 'saml' | 'google_workspace' | 'azure_ad' | 'okta';
  sso_provider_id: string | null;
  domain: string;
  metadata_url: string | null;
  enforce_sso: boolean;
  auto_provision: boolean;
  default_role: string;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────────────
// API KEYS
// ────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  workspace_id: string;
  created_by: string | null;
  name: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_rpm: number;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// WORKSPACE PROJECTS (Information Barriers)
// ────────────────────────────────────────────────────────────

export interface WorkspaceProject {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_restricted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'lead' | 'member';
  joined_at: string;
  // Joined
  email?: string;
  full_name?: string | null;
}

// ────────────────────────────────────────────────────────────
// Live Market Intelligence (real-time signals)
// ────────────────────────────────────────────────────────────

export interface LiveIntelligenceItem {
  headline: string;
  detail: string;
  source: string;
  source_url?: string;
  date_approximate?: string;
  signal_type: 'competitive' | 'regulatory' | 'clinical' | 'deal' | 'market';
}

export interface LiveIntelligence {
  items: LiveIntelligenceItem[];
  query_context: string;
  fetched_at: string;
}
