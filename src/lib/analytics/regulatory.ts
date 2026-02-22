// ============================================================
// TERRAIN — Regulatory Intelligence Analysis Engine
// Analyzes regulatory pathways, designation eligibility,
// timelines, risks, and comparable approvals.
// ============================================================

import type {
  RegulatoryOutput,
  RegulatoryPathway,
  DesignationOpportunity,
  RegulatoryRisk,
  ComparableApproval,
  DataSource,
  RegulatoryAgency,
  DevelopmentStage,
  ProbabilityOfSuccess,
  FilingSequenceEntry,
  DevelopmentCostEstimate,
  SurrogateEndpoint,
  AdvisoryCommitteeModel,
  CRLDecayCurve,
  SurrogateStrengthEntry,
  PrecedentTrialDesign,
  TrialDesignRecommendation,
  LabelScopeScenario,
  CMCRiskAssessment,
} from '@/types';

import type {
  PredicateDeviceRecord,
  DeviceClinicalEvidenceStrategy,
  DeviceIndicationScopeScenario,
  DeviceManufacturingRisk,
  DeviceRegulatoryInput,
  DeviceRegulatoryOutput,
  DeviceCategory,
  ProductCategory,
  FDADevicePathway,
} from '@/types';

import {
  PREDICATE_DEVICE_DATABASE,
  findPredicatesByCategory,
  findPredicatesByUse,
} from '@/lib/data/predicate-devices';

import {
  REGULATORY_PATHWAYS,
  DESIGNATION_DEFINITIONS,
  COMPARABLE_APPROVALS,
  type RegulatoryPathwayDefinition,
  type ComparableApprovalRecord,
} from '@/lib/data/regulatory-pathways';

import { INDICATION_DATA } from '@/lib/data/indication-map';
import { PRECEDENT_TRIALS } from '@/lib/data/precedent-trials';
import type { PrecedentTrialRecord } from '@/lib/data/precedent-trials';
import { getLikelihoodOfApproval, getPhaseTransitionRates } from '@/lib/data/loa-tables';
import { getCompetitorsForIndication } from '@/lib/data/competitor-database';

// ────────────────────────────────────────────────────────────
// INPUT INTERFACE (server-side analysis)
// ────────────────────────────────────────────────────────────

export interface RegulatoryAnalysisInput {
  indication: string;
  product_type: 'pharmaceutical' | 'biologic' | 'device' | 'diagnostic';
  development_stage: DevelopmentStage;
  mechanism?: string;
  geography: RegulatoryAgency[];
  unmet_need: 'high' | 'medium' | 'low';
  has_orphan_potential: boolean;
  patient_population?: 'pediatric' | 'adult' | 'geriatric' | 'all';
}

// ────────────────────────────────────────────────────────────
// VALIDATED SURROGATE ENDPOINTS BY THERAPY AREA
// FDA-accepted surrogate endpoints for Accelerated Approval
// ────────────────────────────────────────────────────────────

const VALIDATED_SURROGATES: Record<string, SurrogateEndpoint[]> = {
  oncology: [
    { endpoint: 'Overall Response Rate (ORR)', status: 'reasonably_likely', fda_guidance: 'FDA Guidance: Clinical Trial Endpoints for Approval of Cancer Drugs' },
    { endpoint: 'Progression-Free Survival (PFS)', status: 'reasonably_likely', fda_guidance: 'FDA Guidance: Clinical Trial Endpoints (2018)' },
    { endpoint: 'Pathological Complete Response (pCR)', status: 'reasonably_likely', fda_guidance: 'FDA Guidance: Neoadjuvant Breast Cancer (2020)' },
    { endpoint: 'Complete Remission (CR) rate', status: 'reasonably_likely', fda_guidance: 'FDA Guidance: Hematologic Malignancies' },
    { endpoint: 'Duration of Response (DOR)', status: 'exploratory' },
    { endpoint: 'Minimal Residual Disease (MRD)', status: 'exploratory' },
  ],
  hematology: [
    { endpoint: 'Complete Remission (CR)', status: 'validated' },
    { endpoint: 'Transfusion Independence', status: 'reasonably_likely' },
    { endpoint: 'Molecular Response', status: 'reasonably_likely' },
    { endpoint: 'MRD-negative status', status: 'exploratory' },
  ],
  immunology: [
    { endpoint: 'ACR20/50/70 Response', status: 'validated', fda_guidance: 'FDA Guidance: RA Clinical Trials' },
    { endpoint: 'PASI 75/90/100', status: 'validated', fda_guidance: 'FDA Guidance: Psoriasis' },
    { endpoint: 'EASI Score Reduction', status: 'validated' },
    { endpoint: 'Endoscopic Remission', status: 'reasonably_likely', fda_guidance: 'FDA Guidance: IBD Clinical Trials (2022)' },
  ],
  cardiovascular: [
    { endpoint: 'LDL-C Reduction', status: 'validated', fda_guidance: 'FDA Guidance: Lipid-Altering Agents' },
    { endpoint: 'Blood Pressure Reduction', status: 'validated' },
    { endpoint: 'NT-proBNP Reduction', status: 'exploratory' },
  ],
  rare_disease: [
    { endpoint: 'Enzyme Activity Levels', status: 'reasonably_likely' },
    { endpoint: 'Biomarker Substrate Reduction', status: 'reasonably_likely' },
    { endpoint: 'Functional Capacity Measures', status: 'reasonably_likely' },
  ],
  neurology: [
    { endpoint: 'Amyloid PET Clearance', status: 'reasonably_likely', fda_guidance: 'FDA AA Pathway for Alzheimer\'s' },
    { endpoint: 'Annualized Relapse Rate (ARR)', status: 'validated', fda_guidance: 'FDA Guidance: MS Clinical Trials' },
    { endpoint: 'EDSS Disability Progression', status: 'validated' },
    { endpoint: 'Seizure Frequency Reduction', status: 'validated' },
  ],
};

// ────────────────────────────────────────────────────────────
// CRL DECAY CURVES
// Historical CRL rates, resubmission timelines, and recovery
// rates by therapy area.
// ────────────────────────────────────────────────────────────

const CRL_RECOVERY_DATA: Record<string, {
  historical_crl_rate_pct: number;
  avg_months_to_resubmission: number;
  resubmission_approval_rate_pct: number;
  common_reasons: string[];
}> = {
  oncology: {
    historical_crl_rate_pct: 8,
    avg_months_to_resubmission: 10,
    resubmission_approval_rate_pct: 78,
    common_reasons: ['Manufacturing/CMC deficiencies', 'Safety signal requiring additional data', 'Clinical hold on confirmatory trial', 'Insufficient efficacy in subgroup analysis'],
  },
  neurology: {
    historical_crl_rate_pct: 18,
    avg_months_to_resubmission: 14,
    resubmission_approval_rate_pct: 62,
    common_reasons: ['Failed primary endpoint (cognitive decline)', 'Safety concerns (ARIA, liver toxicity)', 'Inadequate benefit-risk for moderate disease', 'Surrogate endpoint not validated'],
  },
  immunology: {
    historical_crl_rate_pct: 10,
    avg_months_to_resubmission: 11,
    resubmission_approval_rate_pct: 75,
    common_reasons: ['Safety signal (infections, malignancy risk)', 'Manufacturing comparability issues', 'Insufficient long-term safety data'],
  },
  cardiovascular: {
    historical_crl_rate_pct: 15,
    avg_months_to_resubmission: 16,
    resubmission_approval_rate_pct: 65,
    common_reasons: ['CVOT requirement not met', 'Safety signal (CV events paradox)', 'Inadequate active-comparator data', 'Manufacturing facility issues'],
  },
  rare_disease: {
    historical_crl_rate_pct: 6,
    avg_months_to_resubmission: 9,
    resubmission_approval_rate_pct: 85,
    common_reasons: ['Manufacturing scale-up issues (gene therapy)', 'Insufficient natural history data for comparison', 'Additional follow-up requested'],
  },
  metabolic: {
    historical_crl_rate_pct: 12,
    avg_months_to_resubmission: 12,
    resubmission_approval_rate_pct: 70,
    common_reasons: ['CV safety signal', 'Liver toxicity concerns', 'Inadequate glycemic durability data', 'Manufacturing issues'],
  },
  hematology: {
    historical_crl_rate_pct: 8,
    avg_months_to_resubmission: 10,
    resubmission_approval_rate_pct: 80,
    common_reasons: ['Cytopenias / safety signal', 'Insufficient MRD data', 'Manufacturing issues for cell therapies'],
  },
  default: {
    historical_crl_rate_pct: 12,
    avg_months_to_resubmission: 12,
    resubmission_approval_rate_pct: 70,
    common_reasons: ['Safety concerns', 'Manufacturing deficiencies', 'Insufficient efficacy data', 'Labeling disagreement'],
  },
};

function buildCRLDecayCurve(therapyArea: string): CRLDecayCurve {
  const taLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const data = CRL_RECOVERY_DATA[taLower] ?? CRL_RECOVERY_DATA.default;

  const recoveryNarrative = `Historical CRL rate in ${therapyArea}: ${data.historical_crl_rate_pct}%. ` +
    `Average time to resubmission: ${data.avg_months_to_resubmission} months. ` +
    `Resubmission approval rate: ${data.resubmission_approval_rate_pct}%. ` +
    `Most common CRL reasons: ${data.common_reasons.slice(0, 2).join('; ')}. ` +
    `Proactive CMC readiness and safety monitoring can reduce CRL risk by 30-50%.`;

  return {
    therapy_area: therapyArea,
    historical_crl_rate_pct: data.historical_crl_rate_pct,
    avg_months_to_resubmission: data.avg_months_to_resubmission,
    resubmission_approval_rate_pct: data.resubmission_approval_rate_pct,
    common_crl_reasons: data.common_reasons,
    recovery_narrative: recoveryNarrative,
  };
}

// ────────────────────────────────────────────────────────────
// SURROGATE STRENGTH MATRIX
// Endpoint × indication strength scoring with FDA precedent
// counts and recent acceptance status.
// ────────────────────────────────────────────────────────────

const SURROGATE_STRENGTH_DATA: Record<string, { endpoint: string; strength: number; precedents: number; recent: boolean; notes: string }[]> = {
  oncology: [
    { endpoint: 'Overall Response Rate (ORR)', strength: 7, precedents: 45, recent: true, notes: 'Most commonly used surrogate for Accelerated Approval in solid tumors' },
    { endpoint: 'Progression-Free Survival (PFS)', strength: 8, precedents: 30, recent: true, notes: 'Accepted as primary endpoint for full approval in many tumor types' },
    { endpoint: 'Pathological Complete Response (pCR)', strength: 7, precedents: 8, recent: true, notes: 'Validated in neoadjuvant breast cancer; FDA 2020 guidance' },
    { endpoint: 'Complete Remission (CR)', strength: 8, precedents: 20, recent: true, notes: 'Standard in hematologic malignancies' },
    { endpoint: 'MRD-negative status', strength: 5, precedents: 3, recent: true, notes: 'Emerging in CLL/multiple myeloma; not yet fully validated' },
    { endpoint: 'Duration of Response (DOR)', strength: 5, precedents: 10, recent: true, notes: 'Supportive endpoint, not typically used as sole basis for approval' },
  ],
  neurology: [
    { endpoint: 'Amyloid PET Clearance', strength: 5, precedents: 2, recent: true, notes: 'Controversial after Aduhelm. Lecanemab showed correlation with clinical benefit' },
    { endpoint: 'Annualized Relapse Rate (ARR)', strength: 9, precedents: 15, recent: true, notes: 'Well-validated in relapsing MS' },
    { endpoint: 'EDSS Disability Progression', strength: 9, precedents: 12, recent: true, notes: 'Gold standard in MS, validated across multiple drug classes' },
    { endpoint: 'Seizure Frequency Reduction', strength: 9, precedents: 20, recent: true, notes: 'Well-established in epilepsy' },
    { endpoint: 'CDR-SB (Clinical Dementia Rating)', strength: 7, precedents: 5, recent: true, notes: 'Primary clinical endpoint for Alzheimer\'s — required for full approval' },
  ],
  immunology: [
    { endpoint: 'ACR20/50/70', strength: 9, precedents: 25, recent: true, notes: 'Standard in RA; well-validated across drug classes' },
    { endpoint: 'PASI 75/90/100', strength: 9, precedents: 15, recent: true, notes: 'Standard in psoriasis; PASI 90 becoming new bar' },
    { endpoint: 'EASI Score Reduction', strength: 9, precedents: 8, recent: true, notes: 'Standard in atopic dermatitis' },
    { endpoint: 'Endoscopic Remission', strength: 7, precedents: 6, recent: true, notes: 'Accepted in IBD per FDA 2022 guidance' },
    { endpoint: 'Mayo Score', strength: 8, precedents: 10, recent: true, notes: 'Standard composite in UC' },
  ],
  cardiovascular: [
    { endpoint: 'LDL-C Reduction', strength: 9, precedents: 20, recent: true, notes: 'Well-validated; FDA accepts as approvable endpoint' },
    { endpoint: 'Blood Pressure Reduction', strength: 9, precedents: 30, recent: true, notes: 'Long-established surrogate' },
    { endpoint: 'NT-proBNP Reduction', strength: 5, precedents: 2, recent: true, notes: 'Emerging in heart failure; not yet fully validated' },
    { endpoint: 'MACE (Major Adverse CV Events)', strength: 10, precedents: 15, recent: true, notes: 'Gold standard outcome; required for CV outcome trials' },
  ],
  rare_disease: [
    { endpoint: 'Enzyme Activity Levels', strength: 7, precedents: 8, recent: true, notes: 'Accepted for ERT approvals in lysosomal storage disorders' },
    { endpoint: 'Biomarker Substrate Reduction', strength: 7, precedents: 5, recent: true, notes: 'Used in substrate reduction therapy approvals' },
    { endpoint: 'Functional Capacity (6MWT)', strength: 8, precedents: 10, recent: true, notes: 'Standard in neuromuscular diseases' },
    { endpoint: 'Motor Function Scores', strength: 8, precedents: 6, recent: true, notes: 'Standard in SMA, DMD' },
  ],
};

function buildSurrogateStrengthMatrix(therapyArea: string): SurrogateStrengthEntry[] {
  const taLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const data = SURROGATE_STRENGTH_DATA[taLower];
  if (!data) return [];

  return data.map(d => ({
    endpoint: d.endpoint,
    indication: therapyArea,
    strength_score: d.strength,
    fda_precedent_count: d.precedents,
    recent_acceptance: d.recent,
    notes: d.notes,
  }));
}

// ────────────────────────────────────────────────────────────
// DEVELOPMENT COST ESTIMATES
// Stage-based remaining costs with therapy-area adjustments
// ────────────────────────────────────────────────────────────

const DEVELOPMENT_COST_BY_STAGE: Record<DevelopmentStage, { low_m: number; base_m: number; high_m: number }> = {
  preclinical: { low_m: 150, base_m: 300, high_m: 600 },
  phase1: { low_m: 80, base_m: 180, high_m: 350 },
  phase2: { low_m: 50, base_m: 120, high_m: 250 },
  phase3: { low_m: 30, base_m: 80, high_m: 180 },
  approved: { low_m: 5, base_m: 15, high_m: 30 },
};

const COST_MULTIPLIERS: Record<string, number> = {
  oncology: 1.3,       // Larger trials, complex endpoints
  neurology: 1.5,      // Long trials, difficult enrollment
  cardiovascular: 1.4,  // Large outcome trials
  rare_disease: 0.7,    // Smaller trials
  immunology: 1.1,
  hematology: 1.0,
  ophthalmology: 0.9,
  infectious_disease: 0.9,
  metabolic: 1.2,
  dermatology: 0.8,
};

const PDUFA_FEE_M = 4.0; // ~$4M in 2025/2026

function estimateDevelopmentCosts(
  stage: DevelopmentStage,
  therapyArea: string,
  hasOrphanDesignation: boolean,
  productType: string,
): DevelopmentCostEstimate {
  const baseCosts = DEVELOPMENT_COST_BY_STAGE[stage];
  const multiplier = COST_MULTIPLIERS[therapyArea.toLowerCase()] ?? 1.0;

  const notes: string[] = [];

  let low = baseCosts.low_m * multiplier;
  let base = baseCosts.base_m * multiplier;
  let high = baseCosts.high_m * multiplier;

  // Orphan drug: ~25% cost reduction (smaller trials) + PDUFA waiver + tax credit
  if (hasOrphanDesignation) {
    low *= 0.75;
    base *= 0.75;
    high *= 0.75;
    notes.push('Orphan Drug: PDUFA fee waived, 25% tax credit on clinical trial costs, smaller trial sizes');
  }

  // Biologic manufacturing costs
  if (productType === 'biologic') {
    low *= 1.2;
    base *= 1.2;
    high *= 1.2;
    notes.push('Biologic manufacturing adds ~20% to development costs (CMC complexity, process validation, facility requirements)');
  }

  const pdufaFee = hasOrphanDesignation ? 0 : PDUFA_FEE_M;
  if (!hasOrphanDesignation) {
    notes.push(`PDUFA application fee: ~$${PDUFA_FEE_M}M (waived for orphan drugs)`);
  }

  notes.push(`Cost estimates adjusted for ${therapyArea} therapy area (${multiplier}x modifier)`);

  return {
    remaining_cost_low_m: Math.round(low),
    remaining_cost_base_m: Math.round(base),
    remaining_cost_high_m: Math.round(high),
    pdufa_fee_m: pdufaFee,
    notes,
  };
}

// ────────────────────────────────────────────────────────────
// GEOGRAPHIC FILING SEQUENCE
// Recommends optimal global filing order
// ────────────────────────────────────────────────────────────

function recommendFilingSequence(
  input: RegulatoryAnalysisInput,
): FilingSequenceEntry[] {
  const sequence: FilingSequenceEntry[] = [];
  const indicationData = findIndicationData(input.indication);
  const isRare = indicationData ? indicationData.us_prevalence < 200000 : input.has_orphan_potential;

  // FDA first — fastest expedited pathways for high unmet need
  if (input.geography.includes('FDA') || input.geography.length === 0) {
    sequence.push({
      agency: 'FDA',
      recommended_offset_months: 0,
      rationale: 'FDA filing first: fastest expedited pathways (Breakthrough, Fast Track, Accelerated Approval), largest single market, sets global reference price.',
    });
  }

  // EMA: 0-6 months after FDA
  if (input.geography.includes('EMA')) {
    const offset = input.unmet_need === 'high' ? 0 : 6;
    sequence.push({
      agency: 'EMA',
      recommended_offset_months: offset,
      rationale: offset === 0
        ? 'Simultaneous EMA filing recommended for high-unmet-need: PRIME designation enables parallel review. Conditional Marketing Authorization possible.'
        : 'EMA filing 6 months post-FDA: allows FDA review feedback to strengthen EU dossier. CHMP scientific advice recommended.',
    });
  }

  // PMDA: near-simultaneous for rare disease, 3-6 months otherwise
  if (input.geography.includes('PMDA')) {
    const offset = isRare ? 0 : 6;
    sequence.push({
      agency: 'PMDA',
      recommended_offset_months: offset,
      rationale: isRare
        ? 'Near-simultaneous PMDA filing: SAKIGAKE designation supports Japan-first or simultaneous development for rare diseases.'
        : 'PMDA filing 3-6 months post-FDA: allows bridging study planning and PMDA pre-submission consultation.',
    });
  }

  // NMPA
  if (input.geography.includes('NMPA')) {
    sequence.push({
      agency: 'NMPA',
      recommended_offset_months: 12,
      rationale: 'NMPA filing 12 months post-FDA: allows for China-specific clinical data requirements and NMPA pre-submission meeting. Consider including Chinese sites in global pivotal trials for accelerated review.',
    });
  }

  return sequence;
}

// ────────────────────────────────────────────────────────────
// ADVISORY COMMITTEE PROBABILITY MODEL
//
// Models the probability of an AdCom meeting being convened,
// the likely vote outcome, and CRL risk. Based on historical
// FDA ODAC, NDAC, PCNS advisory committee patterns.
//
// Sources:
//   FDA AdCom voting data 2015-2025 (FDA.gov)
//   Nature Reviews Drug Discovery AdCom analysis (2023)
//   Ambrosia Ventures regulatory intelligence
// ────────────────────────────────────────────────────────────

// Historical AdCom convening rate and favorable vote rates by therapy area
const ADCOM_RATES: Record<string, {
  convening_pct: number;       // Probability FDA will convene AdCom
  favorable_vote_pct: number;  // Probability of favorable vote IF convened
  crl_base_pct: number;        // Base CRL probability regardless of AdCom
}> = {
  oncology: { convening_pct: 25, favorable_vote_pct: 78, crl_base_pct: 8 },
  neurology: { convening_pct: 55, favorable_vote_pct: 62, crl_base_pct: 18 },
  psychiatry: { convening_pct: 65, favorable_vote_pct: 55, crl_base_pct: 25 },
  cardiovascular: { convening_pct: 50, favorable_vote_pct: 68, crl_base_pct: 15 },
  immunology: { convening_pct: 30, favorable_vote_pct: 75, crl_base_pct: 10 },
  rare_disease: { convening_pct: 20, favorable_vote_pct: 82, crl_base_pct: 6 },
  metabolic: { convening_pct: 40, favorable_vote_pct: 72, crl_base_pct: 12 },
  hematology: { convening_pct: 30, favorable_vote_pct: 80, crl_base_pct: 8 },
  ophthalmology: { convening_pct: 25, favorable_vote_pct: 78, crl_base_pct: 10 },
  infectious_disease: { convening_pct: 35, favorable_vote_pct: 70, crl_base_pct: 12 },
  gene_cell_therapy: { convening_pct: 60, favorable_vote_pct: 70, crl_base_pct: 15 },
  dermatology: { convening_pct: 25, favorable_vote_pct: 80, crl_base_pct: 8 },
  default: { convening_pct: 35, favorable_vote_pct: 72, crl_base_pct: 12 },
};

function buildAdvisoryCommitteeModel(
  input: RegulatoryAnalysisInput,
): AdvisoryCommitteeModel {
  const indicationData = findIndicationData(input.indication);
  const therapyArea = indicationData?.therapy_area?.toLowerCase() ?? 'default';
  const rates = ADCOM_RATES[therapyArea] ?? ADCOM_RATES.default;

  let conveningPct = rates.convening_pct;
  let favorableVotePct = rates.favorable_vote_pct;
  let crlPct = rates.crl_base_pct;
  const riskFactors: string[] = [];

  // Factor 1: First-in-class increases AdCom probability
  if (input.mechanism) {
    conveningPct += 10;
    riskFactors.push('First-in-class or novel mechanism — FDA more likely to seek external expert input');
  }

  // Factor 2: Safety signals increase AdCom probability and CRL risk
  if (input.product_type === 'biologic') {
    conveningPct += 5;
    crlPct += 3;
    riskFactors.push('Biologic product — immunogenicity and safety monitoring increase scrutiny');
  }

  // Factor 3: Accelerated pathway may lead to more AdCom scrutiny post-FDORA
  if (input.unmet_need === 'high') {
    conveningPct -= 5; // High unmet need = FDA less likely to convene
    favorableVotePct += 5;
    crlPct -= 3;
    riskFactors.push('High unmet need — historical data shows favorable AdCom votes when unmet need is clear');
  } else if (input.unmet_need === 'low') {
    conveningPct += 10;
    favorableVotePct -= 8;
    crlPct += 5;
    riskFactors.push('Low unmet need — FDA more likely to convene AdCom to validate benefit-risk in context of existing therapies');
  }

  // Factor 4: Orphan designation reduces AdCom probability
  if (input.has_orphan_potential) {
    conveningPct -= 10;
    favorableVotePct += 5;
    crlPct -= 3;
    riskFactors.push('Orphan indication — smaller trial sizes accepted but may face questions about evidence adequacy');
  }

  // Factor 5: Early-stage = not yet at AdCom
  if (input.development_stage === 'preclinical' || input.development_stage === 'phase1') {
    riskFactors.push('Too early for AdCom assessment — model reflects expected pattern at NDA/BLA filing');
  }

  // Factor 6: Competitive landscape affects CRL risk
  const competitors = getCompetitorsForIndication(input.indication);
  const approvedCount = competitors.filter(c => c.phase === 'Approved').length;
  if (approvedCount >= 5) {
    conveningPct += 10;
    crlPct += 5;
    riskFactors.push(`Crowded market (${approvedCount} approved) — FDA may require demonstration of added benefit over existing options`);
  }

  // Factor 7: Safety signal severity (biologics with known class effects)
  const mechanismLower = (input.mechanism ?? '').toLowerCase();
  if (mechanismLower.includes('car-t') || mechanismLower.includes('gene therapy')) {
    conveningPct += 15;
    crlPct += 5;
    riskFactors.push('Cell/gene therapy — FDA routinely convenes AdCom for novel gene therapies due to long-term safety unknowns');
  } else if (mechanismLower.includes('checkpoint') || mechanismLower.includes('pd-1') || mechanismLower.includes('pd-l1')) {
    conveningPct += 5;
    riskFactors.push('Checkpoint inhibitor — immune-related adverse events require comprehensive safety characterization');
  }

  // Factor 8: Active comparator availability
  if (approvedCount >= 3 && input.unmet_need !== 'high') {
    crlPct += 3;
    riskFactors.push('Multiple approved competitors — FDA may require active-comparator data rather than placebo-controlled');
  }

  // Factor 9: Pediatric requirements (PREA)
  if (input.patient_population === 'pediatric') {
    conveningPct += 10;
    crlPct += 3;
    riskFactors.push('Pediatric population — heightened FDA scrutiny; Pediatric Advisory Committee may be consulted');
  }

  // Factor 10: REMS likelihood
  if (mechanismLower.includes('opioid') || mechanismLower.includes('immunosuppress') || mechanismLower.includes('cytotoxic')) {
    crlPct += 5;
    riskFactors.push('REMS program likely — may delay approval timeline and restrict distribution');
  }

  // Factor 11: Accelerated Approval track record
  if (input.unmet_need === 'high' && therapyArea === 'oncology') {
    favorableVotePct += 3;
    crlPct -= 2;
    riskFactors.push('Oncology with high unmet need — strong Accelerated Approval track record (post-FDORA enforcement notwithstanding)');
  }

  // Factor 12: Manufacturing complexity for novel modalities
  if (mechanismLower.includes('adc') || mechanismLower.includes('bispecific')) {
    crlPct += 3;
    riskFactors.push('Complex biologic modality (ADC/bispecific) — manufacturing-related CRL risk elevated');
  }

  // Factor 13: Prior CRL history in indication
  const indicationLower = input.indication.toLowerCase();
  const highCRLIndications = ['alzheimer', 'nash', 'mash', 'obesity', 'depression', 'mdd'];
  if (highCRLIndications.some(ind => indicationLower.includes(ind))) {
    crlPct += 5;
    conveningPct += 5;
    riskFactors.push('Indication with historically elevated CRL rate — heightened regulatory scrutiny expected');
  }

  // Factor 14: Patient advocacy influence
  if (input.has_orphan_potential || indicationLower.includes('pediatric') || indicationLower.includes('rare')) {
    favorableVotePct += 3;
    riskFactors.push('Strong patient advocacy presence expected — favorable influence on AdCom deliberations');
  }

  // Factor 15: Label scope ambition
  if (input.development_stage === 'phase3' || input.development_stage === 'approved') {
    riskFactors.push('Late-stage — label negotiation will be critical; overly broad label requests increase CRL risk');
  }

  // Clamp values
  conveningPct = Math.min(90, Math.max(5, conveningPct));
  favorableVotePct = Math.min(95, Math.max(30, favorableVotePct));

  // CRL probability: base + unfavorable AdCom outcome weighted by convening probability
  const unfavorableAdcomContribution = (conveningPct / 100) * ((100 - favorableVotePct) / 100) * 30; // 30% of unfavorable votes lead to CRL
  crlPct = Math.min(50, Math.max(3, crlPct + unfavorableAdcomContribution));

  // Historical context
  const contextParts: string[] = [];
  if (therapyArea === 'oncology') {
    contextParts.push('ODAC (Oncologic Drugs Advisory Committee) has voted favorably on ~78% of products presented 2015-2025. FDA has followed ODAC recommendation in ~85% of cases.');
  } else if (therapyArea === 'neurology') {
    contextParts.push('PCNS Advisory Committee has been more cautious, with ~62% favorable votes. The Aduhelm controversy (2021) has increased scrutiny on surrogate endpoints in neurodegeneration.');
  } else if (therapyArea === 'psychiatry') {
    contextParts.push('PCNS Advisory Committee for psychiatric drugs shows ~55% favorable vote rate, reflecting difficulty in demonstrating meaningful clinical benefit with subjective endpoints.');
  } else if (therapyArea === 'rare_disease') {
    contextParts.push('Rare disease AdCom meetings are less common (~20% of filings). When convened, favorable vote rates are high (~82%) reflecting high unmet need and smaller evidence packages.');
  } else {
    contextParts.push(`Historical FDA advisory committee favorable vote rate for ${therapyArea}: ~${Math.round(favorableVotePct)}%. FDA follows AdCom recommendation approximately 75-85% of the time.`);
  }

  return {
    adcom_probability_pct: Math.round(conveningPct),
    favorable_vote_probability_pct: Math.round(favorableVotePct),
    crl_probability_pct: Math.round(crlPct),
    risk_factors: riskFactors,
    historical_context: contextParts.join(' '),
    timeline_impact_months: {
      if_favorable: 0,        // No additional delay
      if_unfavorable: 6,      // 6-month delay for re-analysis, additional data, or resubmission
    },
  };
}

// ────────────────────────────────────────────────────────────
// PRECEDENT TRIAL DESIGN MATCHING
// Scores and returns relevant precedent trials for a given
// indication, therapy area, and mechanism.
// ────────────────────────────────────────────────────────────

function findPrecedentTrialDesigns(
  indication: string,
  therapyArea: string,
  mechanism?: string,
): PrecedentTrialDesign[] {
  if (!PRECEDENT_TRIALS || PRECEDENT_TRIALS.length === 0) return [];

  const indicationLower = indication.toLowerCase();
  const therapyAreaLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const mechanismLower = (mechanism ?? '').toLowerCase();

  const scored = PRECEDENT_TRIALS
    .filter(t => t.approval_year > 0) // Only approved trials
    .map(trial => {
      let score = 0;

      // Exact indication match (case-insensitive substring): +10
      if (trial.indication.toLowerCase().includes(indicationLower) ||
          indicationLower.includes(trial.indication.toLowerCase().split(',')[0].trim())) {
        score += 10;
      }

      // Therapy area match: +5
      if (trial.therapy_area.toLowerCase().replace(/[\s\-]+/g, '_') === therapyAreaLower) {
        score += 5;
      }

      // Mechanism overlap (mechanism keyword found in trial drug/indication): +3
      if (mechanismLower && (
        trial.drug.toLowerCase().includes(mechanismLower) ||
        trial.indication.toLowerCase().includes(mechanismLower) ||
        trial.result_summary.toLowerCase().includes(mechanismLower)
      )) {
        score += 3;
      }

      // Recent approval (last 5 years, >= 2021): +2
      if (trial.approval_year >= 2021) {
        score += 2;
      }

      // Biomarker enriched: +1
      if (trial.biomarker_enriched) {
        score += 1;
      }

      return { trial, score };
    })
    .filter(item => item.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return scored.map(({ trial }) => ({
    drug: trial.drug,
    indication: trial.indication,
    trial_name: trial.trial_name,
    design: trial.design,
    primary_endpoint: trial.primary_endpoint,
    sample_size: trial.sample_size,
    enrollment_months: trial.enrollment_months,
    comparator: trial.comparator,
    result_summary: trial.result_summary,
    approval_year: trial.approval_year,
  }));
}

// ────────────────────────────────────────────────────────────
// TRIAL DESIGN RECOMMENDATION
// Concrete trial design guidance based on precedent trials,
// unmet need, biomarker status, and development stage.
// ────────────────────────────────────────────────────────────

function buildTrialDesignRecommendation(
  input: RegulatoryAnalysisInput,
  precedentTrials: PrecedentTrialDesign[],
  surrogateEndpoints?: SurrogateEndpoint[],
): TrialDesignRecommendation {
  const indicationData = findIndicationData(input.indication);
  const therapyArea = (indicationData?.therapy_area ?? 'default').toLowerCase();
  const competitors = getCompetitorsForIndication(input.indication);
  const approvedCount = competitors.filter(c => c.phase === 'Approved').length;

  // ── Design type ──
  const hasAcceleratedPrecedent = precedentTrials.some(
    t => PRECEDENT_TRIALS.find(
      pt => pt.drug === t.drug && pt.was_accelerated
    )
  );
  let recommendedDesign: string;
  if (input.unmet_need === 'high' && (input.has_orphan_potential || hasAcceleratedPrecedent)) {
    recommendedDesign = 'Single-arm, open-label';
  } else if (approvedCount >= 3) {
    recommendedDesign = 'Randomized, double-blind, active-controlled';
  } else {
    recommendedDesign = 'Randomized, double-blind, placebo-controlled';
  }

  // ── Adaptive elements ──
  const adaptiveElements: string[] = [];

  // Estimate sample size early for adaptive check
  let sampleLow: number;
  let sampleBase: number;
  let sampleHigh: number;
  if (precedentTrials.length > 0) {
    const sizes = precedentTrials.map(t => t.sample_size).sort((a, b) => a - b);
    const medianSize = sizes[Math.floor(sizes.length / 2)];
    sampleLow = Math.round(medianSize * 0.8);
    sampleBase = medianSize;
    sampleHigh = Math.round(medianSize * 1.2);
  } else {
    // Stage-based defaults
    if (input.development_stage === 'phase2') {
      sampleLow = 100; sampleBase = 150; sampleHigh = 200;
    } else {
      sampleLow = 300; sampleBase = 400; sampleHigh = 500;
    }
  }

  if (sampleBase > 200) {
    adaptiveElements.push('Interim futility analysis');
  }
  if (indicationData && input.indication.toLowerCase().includes('biomarker')) {
    adaptiveElements.push('Adaptive randomization');
  }
  // Check biomarker_defined via the RegulatoryInput pattern — use has_orphan_potential + mechanism as proxy
  // Since RegulatoryAnalysisInput doesn't have biomarker_defined, we infer it from context
  const isBiomarkerDefined = precedentTrials.some(
    t => PRECEDENT_TRIALS.find(pt => pt.drug === t.drug && pt.biomarker_enriched)
  ) || (input.mechanism ?? '').toLowerCase().match(/biomarker|pd-l1|her2|egfr|kras|alk|ret|braf|brca|fgfr|ntrk|met|ros1/);
  if (isBiomarkerDefined) {
    adaptiveElements.push('Adaptive randomization');
  }
  if (input.development_stage === 'phase2') {
    adaptiveElements.push('Seamless Phase 2/3');
  }
  // Deduplicate
  const uniqueAdaptive = Array.from(new Set(adaptiveElements));

  // ── Enrichment strategy ──
  let enrichmentStrategy: string | undefined;
  if (isBiomarkerDefined) {
    enrichmentStrategy = 'Biomarker-selected enrollment to enrich for responders and increase statistical power';
  }

  // ── Endpoint ──
  let recommendedEndpoint: string;
  let endpointRationale: string;
  if (surrogateEndpoints && surrogateEndpoints.length > 0) {
    const validated = surrogateEndpoints.find(e => e.status === 'validated');
    const reasonablyLikely = surrogateEndpoints.find(e => e.status === 'reasonably_likely');
    const chosen = validated ?? reasonablyLikely;
    if (chosen) {
      recommendedEndpoint = chosen.endpoint;
      endpointRationale = `${chosen.endpoint} is ${chosen.status === 'validated' ? 'a validated surrogate endpoint' : 'a reasonably likely surrogate'} in ${therapyArea}. ` +
        (chosen.fda_guidance ? `Supported by ${chosen.fda_guidance}. ` : '') +
        'This endpoint balances regulatory acceptance with feasible trial duration.';
    } else {
      // Fallback by therapy area
      ({ endpoint: recommendedEndpoint, rationale: endpointRationale } = getDefaultEndpoint(therapyArea));
    }
  } else {
    ({ endpoint: recommendedEndpoint, rationale: endpointRationale } = getDefaultEndpoint(therapyArea));
  }

  // ── Enrollment months ──
  let enrollmentMonths: number;
  if (precedentTrials.length > 0) {
    const months = precedentTrials.map(t => t.enrollment_months).sort((a, b) => a - b);
    enrollmentMonths = months[Math.floor(months.length / 2)];
  } else {
    enrollmentMonths = input.development_stage === 'phase2' ? 18 : 30;
  }
  // Add 30% if orphan designation (smaller population, slower recruitment)
  if (input.has_orphan_potential) {
    enrollmentMonths = Math.round(enrollmentMonths * 1.3);
  }

  // ── Key design risks ──
  const keyDesignRisks: string[] = [];
  if (approvedCount >= 3 && recommendedDesign.includes('placebo')) {
    keyDesignRisks.push('Placebo arm ethical concerns if approved standard of care exists');
  }
  if (isBiomarkerDefined) {
    keyDesignRisks.push('Enrollment challenges in biomarker-selected population');
  }
  if (approvedCount >= 3) {
    keyDesignRisks.push('FDA may require active comparator given ' + approvedCount + ' approved products');
  }
  if (input.has_orphan_potential) {
    keyDesignRisks.push('Small patient population may limit enrollment speed and statistical power');
  }
  if (input.development_stage === 'phase2') {
    keyDesignRisks.push('Phase 2 data may not support seamless transition to registration; confirmatory Phase 3 may be required');
  }
  if (recommendedDesign.includes('Single-arm')) {
    keyDesignRisks.push('Single-arm design requires well-characterized natural history or historical control data for regulatory acceptance');
  }
  if (therapyArea === 'neurology') {
    keyDesignRisks.push('Long trial duration and high placebo response rates typical in neurology indications');
  }
  // Keep top 5
  const finalRisks = keyDesignRisks.slice(0, 5);

  return {
    recommended_design: recommendedDesign,
    adaptive_elements: uniqueAdaptive,
    enrichment_strategy: enrichmentStrategy,
    recommended_endpoint: recommendedEndpoint,
    endpoint_rationale: endpointRationale,
    estimated_sample_size: { low: sampleLow, base: sampleBase, high: sampleHigh },
    estimated_enrollment_months: enrollmentMonths,
    key_design_risks: finalRisks,
  };
}

/** Returns default endpoint and rationale for a therapy area */
function getDefaultEndpoint(therapyArea: string): { endpoint: string; rationale: string } {
  switch (therapyArea) {
    case 'oncology':
      return {
        endpoint: 'Overall Survival (OS)',
        rationale: 'OS is the gold standard endpoint in oncology. While surrogate endpoints (ORR, PFS) may support accelerated approval, OS remains the most robust basis for full approval.',
      };
    case 'cardiovascular':
      return {
        endpoint: 'Clinical composite endpoint',
        rationale: 'MACE composite (CV death, nonfatal MI, nonfatal stroke) is the standard primary endpoint for cardiovascular outcomes trials per FDA guidance.',
      };
    case 'neurology':
      return {
        endpoint: 'Disability progression',
        rationale: 'Disability progression endpoints (e.g., EDSS for MS, CDR-SB for Alzheimer\'s) are the regulatory standard in neurology, reflecting clinically meaningful outcomes.',
      };
    case 'immunology':
      return {
        endpoint: 'Disease-free interval',
        rationale: 'Validated composite endpoints (ACR responses for RA, PASI for psoriasis, EASI for AD) are well-accepted primary endpoints with strong regulatory precedent.',
      };
    default:
      return {
        endpoint: 'Primary clinical endpoint per FDA disease-specific guidance',
        rationale: 'Endpoint selection should be guided by FDA disease-specific draft or final guidance documents. Early FDA interaction (Type B meeting) is recommended to align on primary endpoint.',
      };
  }
}

// ────────────────────────────────────────────────────────────
// LABEL SCOPE SCENARIOS
// Narrow / Base / Broad label outcome modeling with
// probability and revenue impact multipliers.
// ────────────────────────────────────────────────────────────

function buildLabelScopeScenarios(
  input: RegulatoryAnalysisInput,
  comparableApprovals: ComparableApproval[],
): LabelScopeScenario[] {
  const isBiomarkerDefined = (input.mechanism ?? '').toLowerCase().match(
    /biomarker|pd-l1|her2|egfr|kras|alk|ret|braf|brca|fgfr|ntrk|met|ros1/
  );

  // ── Narrow scenario ──
  const narrowProb = input.has_orphan_potential ? 0.40 : 0.25;
  const narrowLabelDesc = isBiomarkerDefined
    ? 'Biomarker-selected population, specific line of therapy, restricted to prior treatment failure'
    : 'Specific subpopulation based on prior therapy or risk stratification';
  const narrowPrecedents = comparableApprovals
    .filter(a => a.accelerated)
    .slice(0, 3)
    .map(a => `${a.drug} (${a.indication}, ${a.approval_year})`);
  const narrowNarrative =
    `Narrow label scenario reflects a conservative regulatory outcome where the approved indication is restricted to a defined subset. ` +
    (isBiomarkerDefined
      ? 'Biomarker selection limits the addressable population but increases the probability of regulatory success and may support a pricing premium. '
      : 'Restriction to a specific prior-therapy or risk-stratified subgroup reduces commercial upside but mitigates regulatory risk. ') +
    (narrowPrecedents.length > 0
      ? `Precedent: ${narrowPrecedents.join('; ')}.`
      : 'No direct accelerated approval precedents identified in comparable approvals.');

  // ── Base scenario ──
  const baseProb = 0.45;
  const basePrecedents = comparableApprovals
    .slice(0, 3)
    .map(a => `${a.drug} (${a.indication}, ${a.approval_year})`);
  const baseNarrative =
    'Base label scenario reflects the most likely regulatory outcome based on clinical trial design and comparable approval precedents. ' +
    'Standard indication with typical restrictions based on development stage and clinical evidence. ' +
    (basePrecedents.length > 0
      ? `Comparable approvals: ${basePrecedents.join('; ')}.`
      : 'Label scope will depend heavily on pivotal trial population and endpoint selection.');

  // ── Broad scenario ──
  const broadProb = Math.round((1.0 - narrowProb - baseProb) * 100) / 100;
  const broadRevMultiplier = input.unmet_need === 'high' ? 1.4 : 1.25;
  const broadPrecedents = comparableApprovals
    .filter(a => !a.accelerated)
    .slice(0, 3)
    .map(a => `${a.drug} (${a.indication}, ${a.approval_year})`);
  const broadNarrative =
    'Broad label scenario represents an optimistic outcome with all-comers indication, multiple lines of therapy, and potential combination claims. ' +
    (input.unmet_need === 'high'
      ? 'High unmet need increases the probability of a broader label, particularly if clinical data demonstrate benefit across subpopulations. '
      : 'Moderate unmet need makes a broad label less likely, as FDA may restrict to the studied population. ') +
    (broadPrecedents.length > 0
      ? `Full-approval precedents with broad labels: ${broadPrecedents.join('; ')}.`
      : 'Broad label will require robust efficacy across all enrolled subgroups and a favorable safety profile.');

  return [
    {
      scenario: 'narrow',
      label_description: narrowLabelDesc,
      regulatory_risk: 'low',
      revenue_impact_multiplier: isBiomarkerDefined ? 0.5 : 0.65,
      probability_of_scenario: narrowProb,
      precedents: narrowPrecedents,
      narrative: narrowNarrative,
    },
    {
      scenario: 'base',
      label_description: 'Broad indication with standard restrictions based on development stage and clinical evidence',
      regulatory_risk: 'medium',
      revenue_impact_multiplier: 1.0,
      probability_of_scenario: baseProb,
      precedents: basePrecedents,
      narrative: baseNarrative,
    },
    {
      scenario: 'broad',
      label_description: 'All-comers indication, multiple lines of therapy, potential combination claims',
      regulatory_risk: 'high',
      revenue_impact_multiplier: broadRevMultiplier,
      probability_of_scenario: broadProb,
      precedents: broadPrecedents,
      narrative: broadNarrative,
    },
  ];
}

// ────────────────────────────────────────────────────────────
// CMC RISK ASSESSMENT
// Manufacturing complexity, inspection risk, cost estimates,
// and de-risking strategies by modality.
// ────────────────────────────────────────────────────────────

interface ModalityCMCProfile {
  complexity: number;
  inspection: 'low' | 'medium' | 'high';
  validation_months: number;
  cost_low: number;
  cost_base: number;
  cost_high: number;
}

const MODALITY_CMC_COMPLEXITY: Record<string, ModalityCMCProfile> = {
  small_molecule:     { complexity: 3,  inspection: 'low',    validation_months: 8,  cost_low: 5,  cost_base: 12,  cost_high: 20 },
  monoclonal_antibody: { complexity: 5, inspection: 'medium', validation_months: 15, cost_low: 20, cost_base: 40,  cost_high: 65 },
  mab:                { complexity: 5,  inspection: 'medium', validation_months: 15, cost_low: 20, cost_base: 40,  cost_high: 65 },
  adc:                { complexity: 8,  inspection: 'high',   validation_months: 21, cost_low: 35, cost_base: 60,  cost_high: 90 },
  'antibody-drug':    { complexity: 8,  inspection: 'high',   validation_months: 21, cost_low: 35, cost_base: 60,  cost_high: 90 },
  bispecific:         { complexity: 7,  inspection: 'medium', validation_months: 18, cost_low: 30, cost_base: 55,  cost_high: 80 },
  car_t:              { complexity: 9,  inspection: 'high',   validation_months: 27, cost_low: 50, cost_base: 80,  cost_high: 120 },
  'car-t':            { complexity: 9,  inspection: 'high',   validation_months: 27, cost_low: 50, cost_base: 80,  cost_high: 120 },
  gene_therapy:       { complexity: 10, inspection: 'high',   validation_months: 30, cost_low: 60, cost_base: 100, cost_high: 150 },
  vaccine:            { complexity: 6,  inspection: 'medium', validation_months: 15, cost_low: 15, cost_base: 30,  cost_high: 50 },
  rna:                { complexity: 7,  inspection: 'medium', validation_months: 18, cost_low: 25, cost_base: 45,  cost_high: 70 },
  mrna:               { complexity: 7,  inspection: 'medium', validation_months: 18, cost_low: 25, cost_base: 45,  cost_high: 70 },
  sirna:              { complexity: 7,  inspection: 'medium', validation_months: 18, cost_low: 25, cost_base: 45,  cost_high: 70 },
  aso:                { complexity: 7,  inspection: 'medium', validation_months: 18, cost_low: 25, cost_base: 45,  cost_high: 70 },
  pharmaceutical:     { complexity: 4,  inspection: 'low',    validation_months: 10, cost_low: 8,  cost_base: 18,  cost_high: 30 },
};

function resolveModalityCMCProfile(
  productType: string,
  mechanism?: string,
): ModalityCMCProfile {
  const mechLower = (mechanism ?? '').toLowerCase();
  const ptLower = productType.toLowerCase();

  // Try mechanism keywords first for more specific matching
  for (const key of Object.keys(MODALITY_CMC_COMPLEXITY)) {
    if (mechLower.includes(key) || ptLower.includes(key)) {
      return MODALITY_CMC_COMPLEXITY[key];
    }
  }

  // Fallback: map product_type to modality
  if (ptLower === 'biologic') {
    return MODALITY_CMC_COMPLEXITY.monoclonal_antibody;
  }

  return MODALITY_CMC_COMPLEXITY.pharmaceutical;
}

function buildCMCRiskAssessment(
  productType: string,
  mechanism?: string,
  developmentStage?: string,
): CMCRiskAssessment {
  const profile = resolveModalityCMCProfile(productType, mechanism);
  const mechLower = (mechanism ?? '').toLowerCase();

  // ── Key CMC risks ──
  const keyCMCRisks: string[] = [];
  if (mechLower.includes('car-t') || mechLower.includes('car_t')) {
    keyCMCRisks.push('Autologous manufacturing scalability');
    keyCMCRisks.push('Vein-to-vein time variability');
    keyCMCRisks.push('Potency assay validation');
    keyCMCRisks.push('Patient-specific manufacturing failure rate');
  } else if (mechLower.includes('gene_therapy') || mechLower.includes('gene therapy') || mechLower.includes('aav')) {
    keyCMCRisks.push('Viral vector manufacturing scalability');
    keyCMCRisks.push('Potency assay validation');
    keyCMCRisks.push('Empty/full capsid ratio control');
    keyCMCRisks.push('Long-term stability data requirements');
  } else if (mechLower.includes('adc') || mechLower.includes('antibody-drug')) {
    keyCMCRisks.push('Conjugation consistency');
    keyCMCRisks.push('Drug-antibody ratio (DAR) control');
    keyCMCRisks.push('Linker stability');
    keyCMCRisks.push('Payload potency specification');
  } else if (mechLower.includes('bispecific')) {
    keyCMCRisks.push('Bispecific protein folding and assembly');
    keyCMCRisks.push('Chain mispairing during production');
    keyCMCRisks.push('Aggregation control at scale');
  } else if (mechLower.includes('mab') || productType === 'biologic') {
    keyCMCRisks.push('Cell line productivity optimization');
    keyCMCRisks.push('Glycosylation profile consistency');
    keyCMCRisks.push('Process-related impurity clearance validation');
  } else if (mechLower.includes('rna') || mechLower.includes('mrna') || mechLower.includes('sirna') || mechLower.includes('aso')) {
    keyCMCRisks.push('LNP formulation consistency');
    keyCMCRisks.push('RNA integrity during scale-up');
    keyCMCRisks.push('Cold chain storage requirements');
  } else if (mechLower.includes('vaccine')) {
    keyCMCRisks.push('Antigen stability and potency');
    keyCMCRisks.push('Adjuvant consistency across batches');
    keyCMCRisks.push('Multi-dose vial contamination risk');
  } else {
    keyCMCRisks.push('API sourcing single-source risk');
    keyCMCRisks.push('Polymorphism control');
    keyCMCRisks.push('Impurity profile qualification');
  }
  // General risks applicable to all
  keyCMCRisks.push('Pre-approval inspection (PAI) readiness');

  // ── De-risking strategies ──
  const deRiskingStrategies: string[] = [];
  if (mechLower.includes('car-t') || mechLower.includes('car_t')) {
    deRiskingStrategies.push('Partner with experienced CDMO (e.g., Lonza, Catalent)');
    deRiskingStrategies.push('Develop decentralized manufacturing capabilities');
    deRiskingStrategies.push('Invest in allogeneic ("off-the-shelf") platform as next-gen strategy');
  } else if (mechLower.includes('gene_therapy') || mechLower.includes('gene therapy') || mechLower.includes('aav')) {
    deRiskingStrategies.push('Secure dedicated viral vector manufacturing capacity early');
    deRiskingStrategies.push('Develop robust analytical characterization package (potency, identity, purity)');
    deRiskingStrategies.push('Initiate comparability protocols before any process changes');
  } else if (mechLower.includes('adc') || mechLower.includes('antibody-drug')) {
    deRiskingStrategies.push('Start CMC development in Phase 1');
    deRiskingStrategies.push('Establish analytical characterization package early');
    deRiskingStrategies.push('Dual-source conjugation technology to mitigate supply risk');
  } else if (productType === 'biologic') {
    deRiskingStrategies.push('Lock cell line and process by end of Phase 2');
    deRiskingStrategies.push('Complete comparability studies if process changes are needed post-Phase 2');
  } else {
    deRiskingStrategies.push('Qualify backup API supplier to mitigate single-source risk');
    deRiskingStrategies.push('Complete ICH stability studies early to support shelf-life claims');
  }
  // General strategies applicable to all
  deRiskingStrategies.push('Complete process validation before Phase 3 enrollment completes');
  deRiskingStrategies.push('Pre-submission meeting with FDA CMC reviewers');
  if (developmentStage === 'phase3' || developmentStage === 'approved') {
    deRiskingStrategies.push('Conduct mock PAI readiness assessment 6 months before BLA/NDA submission');
  }

  // ── Narrative ──
  const modalityLabel = mechLower.includes('car-t') || mechLower.includes('car_t') ? 'CAR-T cell therapy'
    : mechLower.includes('gene_therapy') || mechLower.includes('gene therapy') ? 'gene therapy'
    : mechLower.includes('adc') || mechLower.includes('antibody-drug') ? 'antibody-drug conjugate (ADC)'
    : mechLower.includes('bispecific') ? 'bispecific antibody'
    : mechLower.includes('mrna') || mechLower.includes('rna') || mechLower.includes('sirna') || mechLower.includes('aso') ? 'RNA-based therapeutic'
    : productType === 'biologic' ? 'biologic (monoclonal antibody)'
    : 'small molecule pharmaceutical';

  const narrative =
    `CMC complexity for ${modalityLabel}: ${profile.complexity}/10. ` +
    `Pre-approval inspection risk: ${profile.inspection}. ` +
    `Estimated process validation timeline: ${profile.validation_months} months. ` +
    `Estimated CMC costs: $${profile.cost_low}-${profile.cost_high}M (base: $${profile.cost_base}M). ` +
    `Key risks include ${keyCMCRisks.slice(0, 2).join(' and ')}. ` +
    `Proactive CMC engagement with FDA and early process lock are critical to avoiding manufacturing-related CRL.`;

  return {
    modality_complexity_score: profile.complexity,
    pre_approval_inspection_risk: profile.inspection,
    process_validation_months: profile.validation_months,
    estimated_cmc_cost_m: { low: profile.cost_low, base: profile.cost_base, high: profile.cost_high },
    key_cmc_risks: keyCMCRisks.slice(0, 5),
    de_risking_strategies: deRiskingStrategies.slice(0, 5),
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN ANALYSIS FUNCTION
// ────────────────────────────────────────────────────────────

export async function analyzeRegulatory(
  input: RegulatoryAnalysisInput,
): Promise<RegulatoryOutput> {
  const primaryAgency = input.geography[0] ?? 'FDA';

  // 1. Recommend pathway
  const recommendedPathway = recommendPathway(input, primaryAgency);

  // 2. Estimate timeline
  const timeline = estimateTimeline(input, recommendedPathway.primary);

  // 3. Score designation opportunities
  const designations = scoreDesignations(input, primaryAgency);

  // 4. Find comparable approvals
  const comparables = findComparableApprovals(input);

  // 5. Assess risks
  const risks = assessRisks(input, recommendedPathway.primary);

  // 6. Determine review division and advisory committee likelihood
  const reviewDivision = getReviewDivision(input, primaryAgency);
  const advisoryCommitteeLikely = isAdvisoryCommitteeLikely(input);

  // 6b. Advisory committee probability model (detailed)
  const advisoryCommitteeModel = buildAdvisoryCommitteeModel(input);

  // 7. Probability of success — now with indication-specific calibration
  const indicationData = findIndicationData(input.indication);
  const therapyArea = indicationData?.therapy_area ?? 'default';
  const loa = getLikelihoodOfApproval(therapyArea, input.development_stage, input.indication);
  const transitionRates = getPhaseTransitionRates(therapyArea);

  const probabilityOfSuccess: ProbabilityOfSuccess = {
    loa,
    phase_transition_rates: transitionRates,
    therapy_area: therapyArea,
    stage: input.development_stage,
  };

  // 8. Competitive crowding cross-reference
  const competitiveLandscapeRisks = assessCompetitiveCrowdingRisks(input);

  // 9. Surrogate endpoint availability
  const surrogates = VALIDATED_SURROGATES[therapyArea.toLowerCase()] ?? [];

  // 10. Filing sequence
  const filingSequence = input.geography.length > 1
    ? recommendFilingSequence(input)
    : undefined;

  // 11. Development cost estimate
  const costEstimate = estimateDevelopmentCosts(
    input.development_stage,
    therapyArea,
    input.has_orphan_potential,
    input.product_type,
  );

  // 12. CRL decay curve
  const crlDecayCurve = buildCRLDecayCurve(therapyArea);

  // 13. Surrogate strength matrix
  const surrogateStrengthMatrix = buildSurrogateStrengthMatrix(therapyArea);

  // 14. Precedent trial designs
  const precedentTrialDesigns = findPrecedentTrialDesigns(
    input.indication,
    therapyArea,
    input.mechanism,
  );

  // 15. Trial design recommendation (uses precedent results + available surrogates)
  const trialDesignRecommendation = buildTrialDesignRecommendation(
    input,
    precedentTrialDesigns,
    surrogates.length > 0 ? surrogates : undefined,
  );

  // 16. Label scope scenarios (uses comparable approvals)
  const labelScopeScenarios = buildLabelScopeScenarios(input, comparables);

  // 17. CMC risk assessment
  const cmcRisk = buildCMCRiskAssessment(
    input.product_type,
    input.mechanism,
    input.development_stage,
  );

  // 11b. Add CRL risk from AdCom model if significant
  if (advisoryCommitteeModel.crl_probability_pct >= 15) {
    risks.push({
      risk: `Complete Response Letter (CRL) probability estimated at ${advisoryCommitteeModel.crl_probability_pct}%. ${advisoryCommitteeModel.crl_probability_pct >= 25 ? 'This is above the industry average and represents a significant regulatory risk.' : 'This is within the normal range but warrants proactive mitigation.'} Advisory committee meeting probability: ${advisoryCommitteeModel.adcom_probability_pct}%.`,
      severity: advisoryCommitteeModel.crl_probability_pct >= 25 ? 'high' : 'medium',
      mitigation: 'Conduct mock advisory committee with external KOLs 6 months before anticipated PDUFA date. Develop comprehensive benefit-risk framework. Ensure post-marketing commitments are well-defined. Consider proactive FDA engagement via Type A meeting if safety signals emerge.',
    });
  }

  // Merge competitive risks into main risks
  const allRisks = [...risks, ...competitiveLandscapeRisks];

  return {
    recommended_pathway: recommendedPathway,
    timeline_estimate: timeline,
    designation_opportunities: designations,
    key_risks: allRisks,
    comparable_approvals: comparables,
    review_division: reviewDivision,
    advisory_committee_likely: advisoryCommitteeLikely,
    advisory_committee_model: advisoryCommitteeModel,
    data_sources: getDataSources(),
    generated_at: new Date().toISOString(),
    probability_of_success: probabilityOfSuccess,
    filing_sequence: filingSequence,
    cost_estimate: costEstimate,
    competitive_landscape_risk: competitiveLandscapeRisks.length > 0 ? competitiveLandscapeRisks : undefined,
    available_surrogate_endpoints: surrogates.length > 0 ? surrogates : undefined,
    crl_decay_curve: crlDecayCurve,
    surrogate_strength_matrix: surrogateStrengthMatrix.length > 0 ? surrogateStrengthMatrix : undefined,
    precedent_trial_designs: precedentTrialDesigns.length > 0 ? precedentTrialDesigns : undefined,
    trial_design_recommendation: trialDesignRecommendation,
    label_scope_scenarios: labelScopeScenarios,
    cmc_risk: cmcRisk,
  };
}

// ────────────────────────────────────────────────────────────
// PATHWAY RECOMMENDATION
// ────────────────────────────────────────────────────────────

function mapProductType(
  pt: RegulatoryAnalysisInput['product_type'],
): RegulatoryPathwayDefinition['product_type'] {
  switch (pt) {
    case 'pharmaceutical':
      return 'pharma';
    case 'biologic':
      return 'pharma';
    case 'device':
      return 'device';
    case 'diagnostic':
      return 'diagnostic';
    default:
      return 'pharma';
  }
}

function recommendPathway(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): { primary: RegulatoryPathway; alternatives: RegulatoryPathway[]; rationale: string } {
  const productType = mapProductType(input.product_type);

  // Filter pathways by agency and product type
  let candidates = REGULATORY_PATHWAYS.filter(
    (p) => p.agency === agency && p.product_type === productType,
  );

  // Also include special designations for this agency
  const designationPaths = REGULATORY_PATHWAYS.filter(
    (p) =>
      p.agency === agency &&
      p.product_type === 'pharma' &&
      (p.pathway.includes('Orphan') ||
        p.pathway.includes('Rare Pediatric')),
  );

  if (candidates.length === 0) {
    // Fall back to pharma pathways for the agency
    candidates = REGULATORY_PATHWAYS.filter(
      (p) => p.agency === agency && p.product_type === 'pharma',
    );
  }

  // Score each candidate
  const scored = candidates.map((c) => ({
    pathway: c,
    score: scorePathway(c, input),
  }));

  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0]?.pathway;
  const alternatives = scored.slice(1, 4).map((s) => s.pathway);

  // Build rationale
  const rationale = buildPathwayRationale(input, primary, designationPaths);

  return {
    primary: formatPathway(primary),
    alternatives: alternatives.map(formatPathway),
    rationale,
  };
}

function scorePathway(
  pathway: RegulatoryPathwayDefinition,
  input: RegulatoryAnalysisInput,
): number {
  let score = 0;

  // Base: prefer higher success rates
  score += pathway.success_rate * 40;

  // Faster timelines score higher when unmet need is high
  if (input.unmet_need === 'high') {
    const timelineScore = Math.max(0, 40 - pathway.total_timeline_months);
    score += timelineScore;
  }

  // Accelerated pathways preferred for high unmet need + orphan
  if (
    input.unmet_need === 'high' &&
    input.has_orphan_potential &&
    (pathway.pathway.includes('Accelerated') ||
      pathway.pathway.includes('Breakthrough') ||
      pathway.pathway.includes('SAKIGAKE') ||
      pathway.pathway.includes('Conditional'))
  ) {
    score += 25;
  }

  // Biologics should prefer BLA
  if (
    input.product_type === 'biologic' &&
    pathway.pathway.includes('BLA')
  ) {
    score += 20;
  }

  // Penalize BLA for small molecules (not biologics)
  if (
    input.product_type === 'pharmaceutical' &&
    pathway.pathway.includes('BLA')
  ) {
    score -= 20;
  }

  // Standard NDA is baseline for pharma
  if (
    input.product_type === 'pharmaceutical' &&
    pathway.pathway === 'Standard NDA'
  ) {
    score += 10;
  }

  // 505(b)(2) gets a bonus only if this seems like a reformulation
  // (deduct for novel mechanisms)
  if (pathway.pathway.includes('505(b)(2)')) {
    score -= 5; // Usually not the primary recommendation for novel drugs
  }

  // ANDA scores very low for novel drugs
  if (pathway.pathway.includes('ANDA')) {
    score -= 40;
  }

  // Devices: match pathway to risk
  if (input.product_type === 'device') {
    if (pathway.pathway.includes('510(k)') && input.unmet_need === 'low') {
      score += 15;
    }
    if (pathway.pathway.includes('PMA') && input.unmet_need === 'high') {
      score += 10;
    }
    if (pathway.pathway.includes('De Novo')) {
      score += 5; // Modest bonus for novel devices
    }
  }

  // Priority Review and similar are not standalone pathways; they layer on
  if (pathway.pathway === 'Priority Review' || pathway.pathway === 'Fast Track') {
    score -= 10; // These are designations, not primary pathways
  }

  return score;
}

function formatPathway(def: RegulatoryPathwayDefinition): RegulatoryPathway {
  return {
    name: def.pathway,
    description: def.description,
    typical_review_months: def.typical_review_months,
    requirements: def.key_requirements,
    data_package_requirements: def.key_requirements.filter(
      (r) =>
        r.toLowerCase().includes('clinical') ||
        r.toLowerCase().includes('data') ||
        r.toLowerCase().includes('study') ||
        r.toLowerCase().includes('cmc') ||
        r.toLowerCase().includes('nonclinical'),
    ),
    precedents: def.advantages.slice(0, 3),
  };
}

function buildPathwayRationale(
  input: RegulatoryAnalysisInput,
  primary: RegulatoryPathwayDefinition,
  _designationPaths: RegulatoryPathwayDefinition[],
): string {
  const parts: string[] = [];

  parts.push(
    `Based on the product profile (${input.product_type}, ${input.indication}), the recommended primary pathway is ${primary.pathway}.`,
  );

  if (input.unmet_need === 'high') {
    parts.push(
      'Given the high unmet medical need, expedited designations (Breakthrough Therapy, Fast Track) should be pursued aggressively to reduce development timelines and enable early FDA engagement.',
    );
  }

  if (input.has_orphan_potential) {
    parts.push(
      'Orphan Drug Designation should be pursued early to secure 7-year market exclusivity, PDUFA fee waiver, and tax credits for clinical development costs.',
    );
  }

  if (input.product_type === 'biologic') {
    parts.push(
      'As a biologic product, this will be submitted as a BLA under Section 351(a) of the PHS Act, providing 12-year data exclusivity and limited biosimilar competition.',
    );
  }

  const indicationData = findIndicationData(input.indication);
  if (indicationData && indicationData.us_prevalence < 200000) {
    parts.push(
      `With an estimated US prevalence of ${indicationData.us_prevalence.toLocaleString()}, this indication qualifies for Orphan Drug Designation (fewer than 200,000 patients).`,
    );
  }

  parts.push(
    `The ${primary.pathway} pathway has a historical success rate of ${(primary.success_rate * 100).toFixed(0)}% and a typical total timeline of ${primary.total_timeline_months} months.`,
  );

  return parts.join(' ');
}

// ────────────────────────────────────────────────────────────
// INDICATION-SPECIFIC TIMELINE MODIFIERS
// ────────────────────────────────────────────────────────────

const THERAPY_AREA_TIMELINE_MODIFIERS: Record<string, { optimistic: number; realistic: number; pessimistic: number }> = {
  oncology: { optimistic: -6, realistic: -3, pessimistic: 0 },
  neurology: { optimistic: 6, realistic: 12, pessimistic: 18 },
  rare_disease: { optimistic: -3, realistic: 0, pessimistic: 12 },
  cardiovascular: { optimistic: 6, realistic: 6, pessimistic: 12 },
};

function getTherapyAreaTimelineModifier(indication: string): { optimistic: number; realistic: number; pessimistic: number } {
  const text = indication.toLowerCase();
  if (/cancer|carcinoma|lymphoma|leukemia|melanoma|sarcoma|glioma|myeloma|tumor|nsclc|sclc|hcc|rcc/.test(text)) {
    return THERAPY_AREA_TIMELINE_MODIFIERS.oncology;
  }
  if (/alzheimer|parkinson|als|amyotrophic|multiple sclerosis|epilepsy|huntington|neuropath|dementia/.test(text)) {
    return THERAPY_AREA_TIMELINE_MODIFIERS.neurology;
  }
  if (/heart failure|atrial fibrillation|hypertension|atherosclerosis|cardiovascular|myocardial|coronary/.test(text)) {
    return THERAPY_AREA_TIMELINE_MODIFIERS.cardiovascular;
  }
  return { optimistic: 0, realistic: 0, pessimistic: 0 };
}

// ────────────────────────────────────────────────────────────
// TIMELINE ESTIMATION
// ────────────────────────────────────────────────────────────

const STAGE_TO_REMAINING_MONTHS: Record<DevelopmentStage, { optimistic: number; realistic: number; pessimistic: number }> = {
  preclinical: { optimistic: 60, realistic: 84, pessimistic: 120 },
  phase1: { optimistic: 42, realistic: 60, pessimistic: 84 },
  phase2: { optimistic: 24, realistic: 42, pessimistic: 60 },
  phase3: { optimistic: 12, realistic: 24, pessimistic: 36 },
  approved: { optimistic: 0, realistic: 0, pessimistic: 0 },
};

function estimateTimeline(
  input: RegulatoryAnalysisInput,
  primaryPathway: RegulatoryPathway,
): RegulatoryOutput['timeline_estimate'] {
  const baseTimeline = STAGE_TO_REMAINING_MONTHS[input.development_stage];

  // Apply adjustments for unmet need (faster for high unmet need with expedited programs)
  let optimisticAdj = 0;
  let realisticAdj = 0;
  let pessimisticAdj = 0;

  if (input.unmet_need === 'high') {
    optimisticAdj -= 6;
    realisticAdj -= 3;
  } else if (input.unmet_need === 'low') {
    realisticAdj += 6;
    pessimisticAdj += 6;
  }

  // Orphan / rare disease adjustments (smaller trials, sometimes faster enrollment)
  if (input.has_orphan_potential) {
    optimisticAdj -= 3;
    realisticAdj -= 3;
    // But enrollment can be slow for rare diseases
    pessimisticAdj += 6;
  }

  // Indication-specific timeline modifiers
  const indicationMod = getTherapyAreaTimelineModifier(input.indication);
  optimisticAdj += indicationMod.optimistic;
  realisticAdj += indicationMod.realistic;
  pessimisticAdj += indicationMod.pessimistic;

  // Add review time
  const reviewMonths = primaryPathway.typical_review_months;

  const totalOptimistic = Math.max(
    0,
    baseTimeline.optimistic + optimisticAdj + reviewMonths,
  );
  const totalRealistic = Math.max(
    0,
    baseTimeline.realistic + realisticAdj + reviewMonths,
  );
  const totalPessimistic = Math.max(
    0,
    baseTimeline.pessimistic + pessimisticAdj + reviewMonths,
  );

  // Build milestone estimates based on current stage
  const now = new Date();
  const milestones: Record<string, string | undefined> = {};

  if (input.development_stage === 'preclinical') {
    milestones.ind_submission_target = addMonths(now, 6).toISOString();
    milestones.phase1_completion = addMonths(now, 24).toISOString();
    milestones.phase2_completion = addMonths(now, 48).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase1') {
    milestones.phase1_completion = addMonths(now, 12).toISOString();
    milestones.phase2_completion = addMonths(now, 30).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase2') {
    milestones.phase2_completion = addMonths(now, 12).toISOString();
    milestones.phase3_completion = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths + 2).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  } else if (input.development_stage === 'phase3') {
    milestones.phase3_completion = addMonths(now, 12).toISOString();
    milestones.bla_nda_submission = addMonths(now, totalRealistic - reviewMonths).toISOString();
    milestones.approval_estimate = addMonths(now, totalRealistic).toISOString();
  }

  return {
    ind_submission_target: milestones.ind_submission_target,
    phase1_completion: milestones.phase1_completion,
    phase2_completion: milestones.phase2_completion,
    phase3_completion: milestones.phase3_completion,
    bla_nda_submission: milestones.bla_nda_submission,
    approval_estimate: milestones.approval_estimate,
    total_to_approval: {
      optimistic: totalOptimistic,
      realistic: totalRealistic,
      pessimistic: totalPessimistic,
    },
  };
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ────────────────────────────────────────────────────────────
// DESIGNATION ELIGIBILITY SCORING
// ────────────────────────────────────────────────────────────

function scoreDesignations(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): DesignationOpportunity[] {
  const relevantDesignations = DESIGNATION_DEFINITIONS.filter(
    (d) => d.agency === agency,
  );

  return relevantDesignations.map((def) => {
    const { eligibility, criteriaMet, criteriaUnmet } = assessEligibility(
      def,
      input,
    );

    let timeSavings: string | undefined;
    if (def.typical_timeline_reduction_months > 0) {
      timeSavings = `Up to ${def.typical_timeline_reduction_months} months reduction in development or review timeline.`;
    }

    return {
      designation: def.name as DesignationOpportunity['designation'],
      eligibility,
      key_criteria_met: criteriaMet,
      key_criteria_unmet: criteriaUnmet,
      benefit: def.benefit,
      application_timing: def.application_timing,
      estimated_time_savings: timeSavings,
    };
  });
}

function assessEligibility(
  def: (typeof DESIGNATION_DEFINITIONS)[number],
  input: RegulatoryAnalysisInput,
): {
  eligibility: 'likely' | 'possible' | 'unlikely';
  criteriaMet: string[];
  criteriaUnmet: string[];
} {
  const criteriaMet: string[] = [];
  const criteriaUnmet: string[] = [];
  let score = 0;

  // Common checks across all designations
  const indicationData = findIndicationData(input.indication);
  const isRare = indicationData ? indicationData.us_prevalence < 200000 : input.has_orphan_potential;
  const isSeriousCondition = input.unmet_need === 'high' || input.unmet_need === 'medium';

  switch (def.id) {
    case 'breakthrough_therapy': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious or life-threatening condition');
        score += 30;
      } else {
        criteriaUnmet.push('Condition may not meet "serious or life-threatening" threshold');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet medical need — limited or no effective alternatives');
        score += 30;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Moderate unmet need — some alternatives exist');
        score += 15;
      } else {
        criteriaUnmet.push('Low unmet need — multiple effective treatments available');
      }
      if (input.development_stage === 'phase1' || input.development_stage === 'phase2') {
        criteriaMet.push('Clinical data available to support substantial improvement claim');
        score += 20;
      } else if (input.development_stage === 'preclinical') {
        criteriaUnmet.push('Preliminary clinical evidence required — preclinical data insufficient');
      } else {
        criteriaMet.push('Late-stage data available (though earlier application is typical)');
        score += 10;
      }
      break;
    }

    case 'fast_track': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious or life-threatening condition');
        score += 35;
      } else {
        criteriaUnmet.push('Condition may not meet "serious" threshold');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('Demonstrates potential to address unmet medical need');
        score += 35;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Some potential to address medical need, though alternatives exist');
        score += 20;
      } else {
        criteriaUnmet.push('Unmet medical need bar may not be met with existing treatments available');
      }
      // Fast Track can be obtained early
      criteriaMet.push('Can be requested at any stage of development');
      score += 10;
      break;
    }

    case 'priority_review': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious condition');
        score += 30;
      } else {
        criteriaUnmet.push('Must treat a serious condition');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('Significant improvement over available therapy expected');
        score += 40;
      } else if (input.unmet_need === 'medium') {
        criteriaMet.push('Some improvement over available therapy possible');
        score += 20;
      } else {
        criteriaUnmet.push('Significant improvement over existing therapy not demonstrated');
      }
      break;
    }

    case 'accelerated_approval': {
      if (isSeriousCondition) {
        criteriaMet.push('Drug treats a serious condition with unmet need');
        score += 25;
      } else {
        criteriaUnmet.push('Must treat a serious condition with unmet need');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports accelerated pathway');
        score += 25;
      } else {
        criteriaUnmet.push('Unmet need may not justify accelerated pathway');
      }
      // Check if surrogate endpoint is likely available
      if (input.product_type === 'biologic' || input.product_type === 'pharmaceutical') {
        criteriaMet.push('Surrogate or intermediate clinical endpoint may be available for this product type');
        score += 15;
      }
      // Check for validated surrogates in this therapy area
      const ta = indicationData?.therapy_area?.toLowerCase() ?? '';
      const surrogatesForTA = VALIDATED_SURROGATES[ta] ?? [];
      const validatedSurrogates = surrogatesForTA.filter(s => s.status === 'validated' || s.status === 'reasonably_likely');
      if (validatedSurrogates.length > 0) {
        criteriaMet.push(`${validatedSurrogates.length} validated/reasonably-likely surrogate endpoint(s) available for ${ta} (${validatedSurrogates.map(s => s.endpoint).slice(0, 2).join(', ')})`);
        score += 15;
      } else if (indicationData && indicationData.therapy_area === 'oncology') {
        criteriaMet.push('Oncology indications frequently use surrogate endpoints (ORR, PFS)');
        score += 15;
      } else {
        criteriaUnmet.push('Validated surrogate endpoint availability should be confirmed for this indication');
      }
      break;
    }

    case 'orphan_drug': {
      if (isRare) {
        criteriaMet.push('Disease affects fewer than 200,000 persons in the US');
        score += 60;
      } else {
        criteriaUnmet.push('Disease prevalence exceeds 200,000 US patients — standard orphan threshold not met');
      }
      if (input.has_orphan_potential) {
        criteriaMet.push('Sponsor has identified orphan drug potential');
        score += 15;
      }
      // Can be applied at any stage
      criteriaMet.push('Designation available at any development stage');
      score += 5;
      break;
    }

    case 'rmat': {
      if (input.product_type === 'biologic') {
        criteriaMet.push('Product may qualify as regenerative medicine therapy');
        score += 25;
      } else {
        criteriaUnmet.push('RMAT designation requires a regenerative medicine therapy (cell, gene, tissue engineering)');
        score -= 30;
      }
      if (isSeriousCondition) {
        criteriaMet.push('Treats serious condition');
        score += 20;
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports RMAT designation');
        score += 20;
      }
      break;
    }

    case 'prime': {
      if (isSeriousCondition) {
        criteriaMet.push('Product targets a condition with unmet medical need in the EU');
        score += 30;
      } else {
        criteriaUnmet.push('Must target unmet medical need in EU');
      }
      if (input.unmet_need === 'high') {
        criteriaMet.push('High unmet need supports PRIME eligibility');
        score += 30;
      } else if (input.unmet_need === 'medium') {
        score += 15;
      }
      if (input.development_stage === 'phase1' || input.development_stage === 'phase2') {
        criteriaMet.push('Preliminary clinical data available for PRIME assessment');
        score += 15;
      } else if (input.development_stage === 'preclinical') {
        criteriaUnmet.push('Clinical data typically required (except for SMEs/academic sponsors)');
      }
      break;
    }

    case 'sakigake': {
      if (input.unmet_need === 'high') {
        criteriaMet.push('Serious condition with high unmet need in Japan');
        score += 30;
      } else {
        criteriaUnmet.push('Must target disease with serious impact and high unmet need');
      }
      if (input.mechanism) {
        criteriaMet.push('Novel mechanism of action may qualify as innovative');
        score += 20;
      }
      criteriaUnmet.push('Requires Japan-first or simultaneous global development commitment');
      score -= 10; // Often difficult to commit to Japan-first
      break;
    }
  }

  let eligibility: 'likely' | 'possible' | 'unlikely';
  if (score >= 70) {
    eligibility = 'likely';
  } else if (score >= 40) {
    eligibility = 'possible';
  } else {
    eligibility = 'unlikely';
  }

  return { eligibility, criteriaMet, criteriaUnmet };
}

// ────────────────────────────────────────────────────────────
// COMPARABLE APPROVALS
// ────────────────────────────────────────────────────────────

function findComparableApprovals(
  input: RegulatoryAnalysisInput,
): ComparableApproval[] {
  const indicationData = findIndicationData(input.indication);
  const therapyArea = indicationData?.therapy_area ?? '';

  // Find by therapy area first
  let matches = COMPARABLE_APPROVALS.filter(
    (a) => a.therapy_area.toLowerCase() === therapyArea.toLowerCase(),
  );

  // If not enough matches, broaden to all
  if (matches.length < 3) {
    matches = [...COMPARABLE_APPROVALS];
  }

  // Score by relevance
  const scored = matches.map((a) => ({
    approval: a,
    score: scoreComparable(a, input, therapyArea),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map((s) => formatComparable(s.approval));
}

function scoreComparable(
  approval: ComparableApprovalRecord,
  input: RegulatoryAnalysisInput,
  therapyArea: string,
): number {
  let score = 0;

  // Same therapy area
  if (approval.therapy_area.toLowerCase() === therapyArea.toLowerCase()) {
    score += 40;
  }

  // Same product type
  if (
    (input.product_type === 'biologic' && approval.product_type === 'biologic') ||
    (input.product_type === 'pharmaceutical' && approval.product_type === 'pharma')
  ) {
    score += 20;
  }

  // Orphan overlap
  if (input.has_orphan_potential && approval.designations.includes('Orphan Drug')) {
    score += 15;
  }

  // Recent approvals more relevant
  if (approval.approval_year >= 2022) {
    score += 15;
  } else if (approval.approval_year >= 2019) {
    score += 10;
  }

  // Has similar designations
  if (input.unmet_need === 'high' && approval.designations.includes('Breakthrough Therapy')) {
    score += 10;
  }

  return score;
}

function formatComparable(record: ComparableApprovalRecord): ComparableApproval {
  return {
    drug: record.drug,
    company: record.company,
    indication: record.indication,
    pathway: record.pathway,
    designations: record.designations,
    ind_to_bla_months: record.total_development_months - record.review_months,
    review_months: record.review_months,
    approval_year: record.approval_year,
    accelerated:
      record.pathway.includes('Accelerated') ||
      record.designations.includes('Accelerated Approval'),
  };
}

// ────────────────────────────────────────────────────────────
// RISK ASSESSMENT
// ────────────────────────────────────────────────────────────

function assessRisks(
  input: RegulatoryAnalysisInput,
  primaryPathway: RegulatoryPathway,
): RegulatoryRisk[] {
  const risks: RegulatoryRisk[] = [];

  // Clinical data risks
  if (input.development_stage === 'preclinical' || input.development_stage === 'phase1') {
    risks.push({
      risk: 'Early-stage development: limited clinical data increases regulatory uncertainty. Pivotal trial design may change substantially based on early results.',
      severity: 'high',
      mitigation: 'Engage FDA via Pre-IND meeting (Type B) and End-of-Phase 2 meeting to align on pivotal trial design, endpoints, and patient population before committing to Phase 3.',
    });
  }

  // Endpoint risk
  if (primaryPathway.name.includes('Accelerated')) {
    risks.push({
      risk: 'Accelerated Approval requires post-marketing confirmatory trial. Under FDORA 2022, FDA has strengthened enforcement and expedited withdrawal authority if confirmatory trial fails.',
      severity: 'high',
      mitigation: 'Design confirmatory trial protocol before filing for Accelerated Approval. Ensure statistical plan and enrollment feasibility are robust. Consider initiating confirmatory trial before approval.',
    });
  }

  // Manufacturing risks for biologics
  if (input.product_type === 'biologic') {
    risks.push({
      risk: 'Biologic manufacturing complexity: pre-approval inspection (PAI) failures can delay approval by 6-12 months. Immunogenicity risk may require extensive characterization.',
      severity: 'medium',
      mitigation: 'Begin manufacturing process validation early. Ensure CMC package is submission-ready before BLA filing. Conduct pre-PAI readiness assessments.',
    });
  }

  // Advisory committee risk
  if (isAdvisoryCommitteeLikely(input)) {
    risks.push({
      risk: 'FDA Advisory Committee (AdCom) meeting is likely for this product profile. Unfavorable AdCom vote can delay or prevent approval, even though FDA is not bound by the vote.',
      severity: 'medium',
      mitigation: 'Prepare comprehensive AdCom briefing document. Conduct mock advisory committee with external KOLs. Develop patient advocacy support strategy.',
    });
  }

  // Competition risk
  if (input.unmet_need === 'low') {
    risks.push({
      risk: 'Low unmet medical need: FDA may require larger comparative trials rather than single-arm studies. Active comparator trial design increases cost, timeline, and regulatory complexity.',
      severity: 'medium',
      mitigation: 'Conduct thorough competitive landscape analysis. Consider biomarker-selected patient population to demonstrate superiority in a subgroup even if non-inferior overall.',
    });
  }

  // Orphan-specific risks
  if (input.has_orphan_potential) {
    risks.push({
      risk: 'Rare disease clinical trial enrollment: small patient population makes recruitment challenging. Single-arm studies may face FDA pushback on external controls.',
      severity: 'medium',
      mitigation: 'Establish global clinical trial network with rare disease centers of excellence. Consider natural history study to establish external control arm. Leverage patient registries for enrollment.',
    });
  }

  // Device-specific risks
  if (input.product_type === 'device') {
    risks.push({
      risk: 'Medical device development uncertainty: predicate device identification (510k) or novel classification (De Novo) may change during FDA engagement. IDE clinical trial design may require modification.',
      severity: 'medium',
      mitigation: 'Submit Pre-Submission (Q-Sub) to FDA early. Clearly define intended use and indications for use. Identify predicate devices and prepare substantial equivalence arguments before formal submission.',
    });
  }

  // Regulatory landscape change
  risks.push({
    risk: 'Evolving regulatory landscape: FDA guidance documents, review division reorganizations, and policy changes (e.g., FDA user fee reauthorization, FDORA provisions) may affect the review pathway or requirements.',
    severity: 'low',
    mitigation: 'Maintain ongoing regulatory intelligence monitoring. Engage external regulatory consultants familiar with the relevant review division. Participate in industry trade group regulatory policy discussions.',
  });

  // Labeling/commercial risk
  risks.push({
    risk: 'Label negotiation: FDA-approved labeling may be narrower than desired (restricted indication, boxed warning, REMS requirement), limiting commercial potential.',
    severity: 'medium',
    mitigation: 'Negotiate labeling early in the review process. Design clinical program to support broadest possible label. Consider post-marketing commitments to expand indications.',
  });

  return risks;
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE CROWDING CROSS-REFERENCE
// Warns when competitive landscape creates regulatory challenges
// ────────────────────────────────────────────────────────────

function assessCompetitiveCrowdingRisks(
  input: RegulatoryAnalysisInput,
): RegulatoryRisk[] {
  const risks: RegulatoryRisk[] = [];

  try {
    const competitors = getCompetitorsForIndication(input.indication);
    if (competitors.length === 0) return risks;

    const approved = competitors.filter(c => c.phase === 'Approved');
    const lateStage = competitors.filter(
      c => c.phase === 'Phase 3' || c.phase === 'Phase 2/3'
    );

    // ≥3 approved products: warn about active-comparator requirements
    if (approved.length >= 3) {
      risks.push({
        risk: `Crowded approved market (${approved.length} approved products): FDA may require active-comparator controlled trials rather than placebo-controlled studies. This increases trial cost, complexity, and risk of a negative outcome.`,
        severity: approved.length >= 5 ? 'high' : 'medium',
        mitigation: 'Consider superiority trial design in a biomarker-selected subgroup, or demonstrate clinically meaningful advantages on patient-relevant endpoints (safety, convenience, tolerability) to differentiate from standard of care.',
      });
    }

    // ≥3 late-stage programs: warn about market saturation at launch
    if (lateStage.length >= 3) {
      risks.push({
        risk: `Pipeline congestion (${lateStage.length} late-stage programs): Multiple competitors may reach market around the same time, potentially affecting commercial viability and FDA's assessment of unmet need for expedited designations.`,
        severity: 'medium',
        mitigation: 'Accelerate development timeline to establish first-mover advantage. Differentiate through patient selection strategy, unique endpoints, or combination approach.',
      });
    }
  } catch {
    // If competitor database lookup fails, skip this assessment silently
  }

  return risks;
}

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

function findIndicationData(
  indication: string,
): (typeof INDICATION_DATA)[number] | undefined {
  const normalized = indication.toLowerCase();
  return INDICATION_DATA.find(
    (ind) =>
      ind.name.toLowerCase() === normalized ||
      ind.synonyms.some((s) => s.toLowerCase() === normalized),
  );
}

function getReviewDivision(
  input: RegulatoryAnalysisInput,
  agency: RegulatoryAgency,
): string {
  if (agency !== 'FDA') {
    return agency === 'EMA'
      ? 'CHMP (Committee for Medicinal Products for Human Use)'
      : 'PMDA Review Division';
  }

  const indicationData = findIndicationData(input.indication);
  const ta = indicationData?.therapy_area?.toLowerCase() ?? '';

  if (input.product_type === 'device') {
    return 'CDRH (Center for Devices and Radiological Health)';
  }
  if (input.product_type === 'diagnostic') {
    return 'CDRH - Office of In Vitro Diagnostics';
  }

  // CDER/CBER routing
  if (ta === 'oncology') {
    return input.product_type === 'biologic'
      ? 'CDER - Office of Oncologic Diseases (OOD) / CBER for cell/gene therapies'
      : 'CDER - Office of Oncologic Diseases (OOD)';
  }
  if (ta === 'neurology') return 'CDER - Office of Neuroscience';
  if (ta === 'immunology' || ta === 'autoimmune') return 'CDER - Office of Immunology and Inflammation';
  if (ta === 'rare_disease') return 'CDER - Office of Rare Diseases, Pediatrics, Urologic and Reproductive Medicine';
  if (ta === 'cardiology' || ta === 'cardiovascular') return 'CDER - Office of Cardiology, Hematology, Endocrinology, and Nephrology';
  if (ta === 'metabolic') return 'CDER - Office of Cardiology, Hematology, Endocrinology, and Nephrology';
  if (ta === 'infectious_disease') return 'CDER - Office of Infectious Diseases';
  if (ta === 'ophthalmology') return 'CDER - Office of Immunology and Inflammation';
  if (ta === 'respiratory') return 'CDER - Office of Immunology and Inflammation';

  return 'CDER (Center for Drug Evaluation and Research)';
}

function isAdvisoryCommitteeLikely(input: RegulatoryAnalysisInput): boolean {
  // AdCom more likely for: first-in-class, novel mechanisms, safety concerns, controversial indications
  if (input.product_type === 'biologic' && input.unmet_need === 'high') return true;
  if (input.development_stage === 'preclinical' || input.development_stage === 'phase1') return false;

  const indicationData = findIndicationData(input.indication);
  const ta = indicationData?.therapy_area?.toLowerCase() ?? '';

  // High-profile therapy areas often get AdCom
  if (ta === 'neurology' || ta === 'psychiatry') return true;
  if (ta === 'cardiology' || ta === 'cardiovascular') return true;

  return false;
}

function getDataSources(): DataSource[] {
  return [
    {
      name: 'FDA Drug Approvals Database',
      type: 'public',
      url: 'https://www.fda.gov/drugs/development-approval-process-drugs/drug-approvals-and-databases',
    },
    {
      name: 'FDA CDER Expedited Programs',
      type: 'public',
      url: 'https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/expedited-programs-serious-conditions',
    },
    {
      name: 'FDA CDRH Device Approvals',
      type: 'public',
      url: 'https://www.fda.gov/medical-devices/device-approvals-denials-and-clearances',
    },
    {
      name: 'EMA Centralised Procedure',
      type: 'public',
      url: 'https://www.ema.europa.eu/en/human-regulatory-overview/marketing-authorisation/centralised-procedure',
    },
    {
      name: 'PMDA Review Reports',
      type: 'public',
      url: 'https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0001.html',
    },
    {
      name: 'Terrain Regulatory Pathway Database',
      type: 'proprietary',
    },
    {
      name: 'Ambrosia Ventures Deal Intelligence',
      type: 'proprietary',
    },
  ];
}

// ════════════════════════════════════════════════════════════════
// DEVICE REGULATORY ANALYTICS — 4 New Functions
// Predicate search, clinical evidence strategy, indication scope,
// and manufacturing risk profiling for medical devices.
// ════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// FUNCTION 1: findPredicateDevices
// Queries PREDICATE_DEVICE_DATABASE, scores by relevance,
// returns top 8 sorted by score.
// ────────────────────────────────────────────────────────────

export function findPredicateDevices(
  deviceCategory: DeviceCategory,
  intendedUse: string,
): PredicateDeviceRecord[] {
  // Split intended use into keyword tokens for the predicate search
  const intendedUseKeywords = intendedUse
    .toLowerCase()
    .split(/[\s,;.\/\-]+/)
    .filter(w => w.length > 3);

  const allPredicates = [
    ...findPredicatesByCategory(deviceCategory),
    ...findPredicatesByUse(intendedUseKeywords),
    ...PREDICATE_DEVICE_DATABASE,
  ];

  // Deduplicate by k_number_or_pma
  const seen = new Set<string>();
  const unique: typeof allPredicates = [];
  for (const p of allPredicates) {
    if (!seen.has(p.k_number_or_pma)) {
      seen.add(p.k_number_or_pma);
      unique.push(p);
    }
  }

  const intendedUseLower = intendedUse.toLowerCase();
  const useKeywords = intendedUseLower
    .split(/[\s,;.\/\-]+/)
    .filter(w => w.length > 3);
  const currentYear = new Date().getFullYear();

  const scored = unique.map(predicate => {
    let score = 0;

    // Exact category match: +10
    if (predicate.device_category === deviceCategory) {
      score += 10;
    }

    // Indication keyword overlap: +5 per keyword
    const predicateUseLower = predicate.indication_for_use.toLowerCase();
    for (const keyword of useKeywords) {
      if (predicateUseLower.includes(keyword)) {
        score += 5;
      }
    }

    // Recency bonus: +2 if clearance within 5 years
    const clearanceYear = new Date(predicate.clearance_date).getFullYear();
    if (currentYear - clearanceYear <= 5) {
      score += 2;
    }

    // Same pathway bonus: +3 for 510(k) predicates (most common chain)
    if (predicate.pathway === '510(k)') {
      score += 3;
    }

    return { predicate, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map(s => s.predicate);
}

// ────────────────────────────────────────────────────────────
// FUNCTION 2: buildDeviceClinicalEvidenceStrategy
// Study design recommendation by pathway + device category.
// ────────────────────────────────────────────────────────────

interface DeviceEvidenceSpec {
  study_type: string;
  sample_size: { low: number; base: number; high: number };
  enrollment_months: number;
  cost_m: { low: number; base: number; high: number };
  comparator: string;
  follow_up_months: number;
}

const DEVICE_EVIDENCE_REQUIREMENTS: Record<string, Record<string, DeviceEvidenceSpec>> = {
  '510(k) Clearance': {
    default: {
      study_type: 'Bench + biocompatibility testing',
      sample_size: { low: 0, base: 0, high: 0 },
      enrollment_months: 0,
      cost_m: { low: 0.3, base: 0.8, high: 1.5 },
      comparator: 'Predicate device (bench comparison)',
      follow_up_months: 0,
    },
    device_implantable: {
      study_type: 'Single-arm prospective clinical study',
      sample_size: { low: 50, base: 100, high: 150 },
      enrollment_months: 12,
      cost_m: { low: 2.0, base: 5.0, high: 10.0 },
      comparator: 'Predicate device performance goals',
      follow_up_months: 6,
    },
    device_drug_delivery: {
      study_type: 'Single-arm prospective clinical study',
      sample_size: { low: 60, base: 120, high: 150 },
      enrollment_months: 14,
      cost_m: { low: 3.0, base: 7.0, high: 12.0 },
      comparator: 'Predicate device performance goals',
      follow_up_months: 6,
    },
    device_surgical: {
      study_type: 'Performance testing + limited clinical',
      sample_size: { low: 20, base: 50, high: 80 },
      enrollment_months: 8,
      cost_m: { low: 1.0, base: 3.0, high: 6.0 },
      comparator: 'Predicate device bench equivalence',
      follow_up_months: 3,
    },
  },
  'De Novo Classification': {
    default: {
      study_type: 'Single-arm pivotal or prospective registry',
      sample_size: { low: 100, base: 200, high: 300 },
      enrollment_months: 15,
      cost_m: { low: 3.0, base: 8.0, high: 15.0 },
      comparator: 'Performance goals derived from literature',
      follow_up_months: 9,
    },
    device_digital_health: {
      study_type: 'Prospective clinical validation study',
      sample_size: { low: 100, base: 150, high: 250 },
      enrollment_months: 10,
      cost_m: { low: 1.5, base: 4.0, high: 8.0 },
      comparator: 'Clinical gold standard or physician adjudication',
      follow_up_months: 6,
    },
    diagnostics_ivd: {
      study_type: 'Prospective clinical validation (PPA/NPA study)',
      sample_size: { low: 150, base: 250, high: 400 },
      enrollment_months: 12,
      cost_m: { low: 2.0, base: 5.0, high: 10.0 },
      comparator: 'FDA-cleared comparator or clinical truth standard',
      follow_up_months: 0,
    },
    device_point_of_care: {
      study_type: 'Prospective multi-site clinical validation',
      sample_size: { low: 120, base: 200, high: 300 },
      enrollment_months: 10,
      cost_m: { low: 2.0, base: 5.5, high: 9.0 },
      comparator: 'Central laboratory reference method',
      follow_up_months: 0,
    },
  },
  'PMA (Premarket Approval)': {
    default: {
      study_type: 'Randomized controlled trial',
      sample_size: { low: 200, base: 350, high: 500 },
      enrollment_months: 24,
      cost_m: { low: 15.0, base: 30.0, high: 50.0 },
      comparator: 'Active comparator (standard of care device) or sham control',
      follow_up_months: 18,
    },
    device_implantable: {
      study_type: 'Randomized controlled trial',
      sample_size: { low: 250, base: 400, high: 500 },
      enrollment_months: 30,
      cost_m: { low: 20.0, base: 35.0, high: 50.0 },
      comparator: 'Standard of care device or medical therapy',
      follow_up_months: 24,
    },
    device_capital_equipment: {
      study_type: 'Randomized controlled trial',
      sample_size: { low: 200, base: 300, high: 450 },
      enrollment_months: 24,
      cost_m: { low: 15.0, base: 28.0, high: 45.0 },
      comparator: 'Standard of care system',
      follow_up_months: 12,
    },
    diagnostics_companion: {
      study_type: 'Prospective-retrospective bridging study + co-review with drug',
      sample_size: { low: 200, base: 350, high: 500 },
      enrollment_months: 18,
      cost_m: { low: 10.0, base: 20.0, high: 35.0 },
      comparator: 'FDA-cleared comparator assay or clinical outcome',
      follow_up_months: 12,
    },
    diagnostics_liquid_biopsy: {
      study_type: 'Prospective clinical validation with tissue concordance',
      sample_size: { low: 250, base: 400, high: 500 },
      enrollment_months: 20,
      cost_m: { low: 12.0, base: 25.0, high: 40.0 },
      comparator: 'Tissue biopsy gold standard',
      follow_up_months: 12,
    },
  },
  'HDE (Humanitarian Device Exemption)': {
    default: {
      study_type: 'Feasibility study (safety primary)',
      sample_size: { low: 10, base: 20, high: 30 },
      enrollment_months: 12,
      cost_m: { low: 0.5, base: 2.0, high: 5.0 },
      comparator: 'No comparator required (single-arm)',
      follow_up_months: 6,
    },
  },
};

const DEVICE_PRIMARY_ENDPOINTS: Record<string, string> = {
  cardiovascular: 'Composite of 30-day all-cause mortality, stroke, and major bleeding',
  orthopedic: 'Knee Society Score (KSS) or Harris Hip Score at 2 years',
  neurology: 'Seizure frequency reduction or UPDRS motor score improvement',
  ophthalmology: 'Best Corrected Visual Acuity (BCVA) at 12 months',
  endoscopy_gi: 'Adenoma detection rate or procedural success rate',
  wound_care: 'Complete wound closure rate at 12 weeks',
  diabetes_metabolic: 'Time in range (70-180 mg/dL) or HbA1c reduction at 6 months',
  oncology_surgical: 'R0 resection rate or margin-negative resection rate',
  oncology_radiation: 'Local tumor control rate at 12 months',
  ivd_oncology: 'Positive Percent Agreement (PPA) / Negative Percent Agreement (NPA) vs tissue biopsy',
  ivd_infectious: 'Sensitivity and specificity vs culture or PCR gold standard',
  ivd_cardiology: 'Clinical sensitivity/specificity for acute MI detection',
  ivd_genetics: 'Analytical accuracy vs Sanger sequencing or validated NGS panel',
  imaging_radiology: 'Diagnostic sensitivity and specificity vs clinical truth panel',
  renal_dialysis: 'Kt/V adequacy ≥1.2 or ultrafiltration accuracy',
  respiratory: 'FEV1 improvement or apnea-hypopnea index (AHI) reduction',
  dental: 'Implant survival rate at 12 months or marginal bone loss',
  general_surgery: 'Procedural success rate and 30-day complication rate',
  vascular: 'Primary patency rate at 12 months',
  ent: 'Symptom improvement on validated patient-reported outcome',
  urology: 'International Prostate Symptom Score (IPSS) improvement',
  dermatology: 'Lesion clearance rate or validated dermatologic endpoint',
};

const DEVICE_STUDY_RISKS: Record<string, string[]> = {
  cardiovascular: ['High adverse event rate requiring DSMB oversight', 'Sham procedure ethical concerns', 'Long-term follow-up attrition for implant durability'],
  orthopedic: ['Surgeon learning curve confounding early outcomes', 'Long follow-up required for implant longevity (minimum 2 years)', 'Crossover from control to treatment arm'],
  neurology: ['Sham surgery ethics in device trials', 'High placebo response rate', 'Endpoint variability and subjective assessment bias'],
  ophthalmology: ['Contralateral eye as control raises statistical issues', 'Masking challenges with device procedures', 'Variable natural history complicating endpoint assessment'],
  diabetes_metabolic: ['Sensor accuracy variability across glucose ranges', 'Real-world vs. controlled-setting performance gap', 'Insulin dosing confounders'],
  ivd_oncology: ['Specimen quality variability affecting assay performance', 'Evolving molecular classification during study', 'Clinical utility vs. analytical validity distinction'],
  general_surgery: ['Surgeon variability in procedural outcomes', 'Standardization of surgical technique across sites', 'Short-term endpoints may not predict long-term safety'],
  default: ['Enrollment competition with other device trials', 'Site variability in procedural technique', 'Regulatory endpoint alignment with commercial value proposition'],
};

const DEVICE_FDA_GUIDANCES: Record<string, string[]> = {
  cardiovascular: [
    'Guidance for Industry and FDA Staff: Clinical Investigations of Devices Indicated for the Treatment of Heart Failure',
    'FDA Guidance: Investigational Device Exemptions for Transcatheter Aortic Valve Replacement (TAVR)',
    'FDA Guidance: Clinical Evidence for Coronary Artery Stents',
  ],
  orthopedic: [
    'FDA Guidance: Clinical Evaluation of Orthopedic Devices',
    'FDA Guidance: Premarket Notification Requirements for Total Internal Knee Joint Prostheses',
    'FDA Guidance: Non-clinical Testing for Metal-on-Metal Hip Arthroplasty',
  ],
  neurology: [
    'FDA Guidance: Implanted Brain-Computer Interface Devices for Patients with Paralysis or Amputation',
    'FDA Guidance: Deep Brain Stimulation Devices for OCD',
    'FDA Guidance: Vagus Nerve Stimulation Device Clinical Studies',
  ],
  ophthalmology: [
    'FDA Guidance: Intraocular Lens Devices — 510(k) Submission',
    'FDA Guidance: Clinical Study Guidance for LASIK Devices',
  ],
  diabetes_metabolic: [
    'FDA Guidance: Self-Monitoring Blood Glucose Test Systems for Over-the-Counter Use',
    'FDA Guidance: Continuous Glucose Monitoring Systems',
    'FDA Guidance: Artificial Pancreas Device Systems',
  ],
  ivd_oncology: [
    'FDA Guidance: Principles for Codevelopment of an In Vitro Companion Diagnostic Device with a Therapeutic Product',
    'FDA Guidance: In Vitro Companion Diagnostic Devices (2014)',
    'FDA Guidance: Nucleic Acid Based Tests',
  ],
  ivd_infectious: [
    'FDA Guidance: In Vitro Diagnostics for the Detection of SARS-CoV-2 (Framework)',
    'FDA Guidance: Microbiology Devices; Classification of Antimicrobial Susceptibility Test Systems',
  ],
  ivd_genetics: [
    'FDA Guidance: Use of Public Human Genetic Variant Databases to Support Clinical Validity',
    'FDA Guidance: Considerations for Design, Development, and Analytical Validation of NGS-Based IVDs',
  ],
  imaging_radiology: [
    'FDA Guidance: Clinical Performance Assessment: Considerations for Computer-Assisted Detection Devices Applied to Radiology Images',
    'FDA Guidance: Clinical Evidence for Radiology AI/ML Devices',
  ],
  default: [
    'FDA Guidance: De Novo Classification Process (Evaluation of Automatic Class III Designation)',
    'FDA Guidance: Deciding When to Submit a 510(k) for a Change to an Existing Device',
    'FDA Guidance: Factors to Consider Regarding Benefit-Risk in Medical Device Product Availability, Compliance, and Enforcement Decisions',
  ],
};

export function buildDeviceClinicalEvidenceStrategy(
  pathway: string,
  deviceCategory: DeviceCategory,
  developmentStage: string,
): DeviceClinicalEvidenceStrategy {
  // Normalize pathway key to match our evidence requirements table
  let pathwayKey: string;
  if (pathway.includes('510(k)')) {
    pathwayKey = '510(k) Clearance';
  } else if (pathway.includes('De Novo')) {
    pathwayKey = 'De Novo Classification';
  } else if (pathway.includes('PMA')) {
    pathwayKey = 'PMA (Premarket Approval)';
  } else if (pathway.includes('HDE')) {
    pathwayKey = 'HDE (Humanitarian Device Exemption)';
  } else {
    pathwayKey = '510(k) Clearance';
  }

  // Map device category to product category key for lookup
  const categoryToProductKey: Record<string, string> = {
    cardiovascular: 'device_implantable',
    orthopedic: 'device_implantable',
    neurology: 'device_implantable',
    ophthalmology: 'device_surgical',
    endoscopy_gi: 'device_surgical',
    wound_care: 'device_surgical',
    diabetes_metabolic: 'device_monitoring',
    oncology_surgical: 'device_surgical',
    oncology_radiation: 'device_capital_equipment',
    ivd_oncology: 'diagnostics_ivd',
    ivd_infectious: 'diagnostics_ivd',
    ivd_cardiology: 'diagnostics_ivd',
    ivd_genetics: 'diagnostics_ivd',
    imaging_radiology: 'device_capital_equipment',
    renal_dialysis: 'device_capital_equipment',
    respiratory: 'device_monitoring',
    dental: 'device_implantable',
    general_surgery: 'device_surgical',
    vascular: 'device_implantable',
    ent: 'device_surgical',
    urology: 'device_surgical',
    dermatology: 'device_surgical',
  };

  const productKey = categoryToProductKey[deviceCategory] ?? 'default';
  const pathwayReqs = DEVICE_EVIDENCE_REQUIREMENTS[pathwayKey] ?? DEVICE_EVIDENCE_REQUIREMENTS['510(k) Clearance'];
  const spec: DeviceEvidenceSpec = pathwayReqs[productKey] ?? pathwayReqs['default'];

  // Get primary endpoint for this device category
  const primaryEndpoint = DEVICE_PRIMARY_ENDPOINTS[deviceCategory] ?? 'Primary clinical endpoint per FDA device-specific guidance';

  // Get study risks
  const studyRisks = DEVICE_STUDY_RISKS[deviceCategory] ?? DEVICE_STUDY_RISKS['default'];

  // Get FDA guidance documents
  const guidanceDocs = DEVICE_FDA_GUIDANCES[deviceCategory] ?? DEVICE_FDA_GUIDANCES['default'];

  // Build adaptive elements based on pathway and category
  const adaptiveElements: string[] = [];
  if (pathwayKey === 'PMA (Premarket Approval)') {
    adaptiveElements.push('Bayesian endpoint evaluation for primary outcome');
    adaptiveElements.push('Interim futility analysis at 50% enrollment');
    if (spec.sample_size.base > 300) {
      adaptiveElements.push('Adaptive randomization to optimize allocation ratio');
    }
    adaptiveElements.push('Pre-specified subgroup analyses for label differentiation');
  } else if (pathwayKey === 'De Novo Classification') {
    adaptiveElements.push('Interim futility analysis');
    adaptiveElements.push('Bayesian adaptive design for sample size re-estimation');
  } else if (pathwayKey === '510(k) Clearance' && spec.sample_size.base > 0) {
    adaptiveElements.push('Bayesian performance goal assessment');
  }
  if (developmentStage === 'concept' || developmentStage === 'preclinical') {
    adaptiveElements.push('Seamless feasibility-to-pivotal design to reduce development time');
  }

  // Build study rationale
  const rationaleStr = pathwayKey === '510(k) Clearance' && spec.sample_size.base === 0
    ? `For 510(k) clearance of this ${deviceCategory} device, bench testing and biocompatibility data are expected to be sufficient to demonstrate substantial equivalence to the predicate device. Clinical data may be required only if the predicate comparison reveals meaningful differences in technology, materials, or intended use.`
    : pathwayKey === 'HDE (Humanitarian Device Exemption)'
    ? `HDE pathway requires demonstration of probable benefit with safety data. Given the small patient population (<8,000/yr), a feasibility study of ${spec.sample_size.low}-${spec.sample_size.high} patients with safety as the primary endpoint is the standard approach. IRB approval at each institution is required for use.`
    : `${spec.study_type} is recommended based on FDA precedent for ${deviceCategory} devices pursuing ${pathwayKey}. ` +
      `Estimated enrollment of ${spec.sample_size.base} patients over ${spec.enrollment_months} months with ${spec.follow_up_months}-month follow-up. ` +
      `Primary endpoint: ${primaryEndpoint}. ` +
      `Estimated study cost: $${spec.cost_m.low}M-$${spec.cost_m.high}M (base: $${spec.cost_m.base}M). ` +
      `Pre-Submission (Q-Sub) meeting with FDA is strongly recommended to align on study design, primary endpoint, and acceptance criteria before trial initiation.`;

  return {
    recommended_study_type: spec.study_type,
    study_rationale: rationaleStr,
    recommended_primary_endpoint: primaryEndpoint,
    estimated_sample_size: spec.sample_size,
    estimated_enrollment_months: spec.enrollment_months,
    estimated_study_cost_m: spec.cost_m,
    comparator_recommendation: spec.comparator,
    adaptive_elements: adaptiveElements,
    key_study_risks: studyRisks.slice(0, 5),
    fda_guidance_documents: guidanceDocs,
    narrative:
      `Clinical evidence strategy for ${deviceCategory} device via ${pathwayKey}: ` +
      `${spec.study_type}${spec.sample_size.base > 0 ? ` with ${spec.sample_size.low}-${spec.sample_size.high} patients` : ''}. ` +
      `Recommended primary endpoint: ${primaryEndpoint}. ` +
      `Estimated total study cost: $${spec.cost_m.low}M-$${spec.cost_m.high}M. ` +
      `${adaptiveElements.length > 0 ? `Adaptive elements: ${adaptiveElements.slice(0, 2).join('; ')}. ` : ''}` +
      `Key risks: ${studyRisks.slice(0, 2).join('; ')}.`,
  };
}

// ────────────────────────────────────────────────────────────
// FUNCTION 3: buildDeviceIndicationScopeScenarios
// Three scenarios (narrow/base/broad) with indication scope,
// probability, and commercial impact multipliers.
// ────────────────────────────────────────────────────────────

interface IndicationScopeTemplate {
  narrow: {
    multiplier_range: [number, number];
    probability: number;
    risk: 'low' | 'moderate' | 'high';
  };
  base: {
    multiplier: number;
    probability: number;
    risk: 'low' | 'moderate' | 'high';
  };
  broad: {
    multiplier_range: [number, number];
    probability: number;
    risk: 'low' | 'moderate' | 'high';
  };
}

const INDICATION_SCOPE_TEMPLATES: Record<string, IndicationScopeTemplate> = {
  '510(k) Clearance': {
    narrow: { multiplier_range: [0.5, 0.7], probability: 0.85, risk: 'low' },
    base: { multiplier: 1.0, probability: 0.70, risk: 'moderate' },
    broad: { multiplier_range: [1.3, 1.5], probability: 0.40, risk: 'high' },
  },
  'PMA (Premarket Approval)': {
    narrow: { multiplier_range: [0.5, 0.7], probability: 0.90, risk: 'low' },
    base: { multiplier: 1.0, probability: 0.65, risk: 'moderate' },
    broad: { multiplier_range: [1.3, 1.5], probability: 0.35, risk: 'high' },
  },
  'De Novo Classification': {
    narrow: { multiplier_range: [0.4, 0.6], probability: 0.80, risk: 'low' },
    base: { multiplier: 1.0, probability: 0.60, risk: 'moderate' },
    broad: { multiplier_range: [1.5, 1.8], probability: 0.30, risk: 'high' },
  },
  'HDE (Humanitarian Device Exemption)': {
    narrow: { multiplier_range: [0.6, 0.8], probability: 0.90, risk: 'low' },
    base: { multiplier: 1.0, probability: 0.75, risk: 'moderate' },
    broad: { multiplier_range: [1.2, 1.4], probability: 0.45, risk: 'high' },
  },
};

// Indication scope details per device category for realistic narratives
const DEVICE_INDICATION_SCOPE_DETAILS: Record<string, {
  narrow_indication: string;
  narrow_population: string[];
  narrow_settings: string[];
  base_indication: string;
  base_population: string[];
  base_settings: string[];
  broad_indication: string;
  broad_population: string[];
  broad_settings: string[];
}> = {
  cardiovascular: {
    narrow_indication: 'Severe symptomatic aortic stenosis in patients at extreme/high surgical risk',
    narrow_population: ['Age ≥75', 'STS score ≥8%', 'Heart team determination of inoperability'],
    narrow_settings: ['Tertiary care hospitals with structural heart program'],
    base_indication: 'Severe symptomatic aortic stenosis across surgical risk categories',
    base_population: ['Adults with symptomatic severe AS', 'All surgical risk categories'],
    base_settings: ['Hospitals with structural heart programs', 'High-volume cardiac surgery centers'],
    broad_indication: 'Aortic stenosis including moderate AS and asymptomatic severe AS',
    broad_population: ['All adults with severe AS', 'Expansion to moderate AS', 'Asymptomatic patients with LV dysfunction'],
    broad_settings: ['Community hospitals with catheterization labs', 'Ambulatory surgical centers'],
  },
  orthopedic: {
    narrow_indication: 'Primary total knee arthroplasty in end-stage osteoarthritis',
    narrow_population: ['Adults 55-80 years', 'BMI <40', 'Kellgren-Lawrence Grade IV'],
    narrow_settings: ['Hospital inpatient and ASC with orthopedic capability'],
    base_indication: 'Primary and revision total knee arthroplasty',
    base_population: ['Adults ≥21 years', 'OA and post-traumatic arthritis', 'Including revision procedures'],
    base_settings: ['Hospitals', 'Ambulatory surgical centers', 'Orthopedic specialty centers'],
    broad_indication: 'Total and partial knee arthroplasty including robotic-assisted and patient-specific',
    broad_population: ['Adults of all ages', 'All BMI categories', 'Complex deformities and post-infectious'],
    broad_settings: ['All surgical settings including office-based surgery', 'Expansion to outpatient-only protocols'],
  },
  neurology: {
    narrow_indication: 'Drug-resistant epilepsy with focal onset seizures',
    narrow_population: ['Adults 18-65', 'Failed ≥2 AEDs', 'Localized seizure focus on EEG'],
    narrow_settings: ['Level 4 epilepsy centers'],
    base_indication: 'Drug-resistant epilepsy with focal and generalized onset seizures',
    base_population: ['Adults and adolescents ≥12', 'Failed ≥2 AEDs'],
    base_settings: ['Level 3-4 epilepsy centers', 'Academic medical centers'],
    broad_indication: 'Refractory epilepsy and movement disorders including essential tremor',
    broad_population: ['All ages ≥6', 'Expansion to movement disorders', 'Treatment-resistant depression adjunct'],
    broad_settings: ['Community neurology practices', 'Rehabilitation centers'],
  },
  diabetes_metabolic: {
    narrow_indication: 'Continuous glucose monitoring in Type 1 diabetes on insulin pump therapy',
    narrow_population: ['Adults with T1D', 'Insulin pump users', 'HbA1c >7.5%'],
    narrow_settings: ['Endocrinology practices'],
    base_indication: 'Continuous glucose monitoring in Type 1 and Type 2 diabetes on intensive insulin therapy',
    base_population: ['Adults and pediatrics ≥2 years', 'T1D and insulin-treated T2D'],
    base_settings: ['Endocrinology', 'Primary care', 'Diabetes education centers'],
    broad_indication: 'Glucose monitoring for all diabetes patients and prediabetes prevention',
    broad_population: ['All diabetes patients', 'Non-insulin-treated T2D', 'Prediabetes and gestational diabetes'],
    broad_settings: ['Primary care', 'OTC/direct-to-consumer', 'Pharmacy-based programs'],
  },
  ivd_oncology: {
    narrow_indication: 'Companion diagnostic for specific biomarker in a single tumor type',
    narrow_population: ['Stage III-IV patients', 'Prior to first-line therapy', 'Tissue-based testing only'],
    narrow_settings: ['CLIA-certified oncology reference laboratories'],
    base_indication: 'Multi-biomarker panel for tumor profiling in multiple solid tumors',
    base_population: ['All advanced solid tumor patients', 'All lines of therapy'],
    base_settings: ['Reference laboratories', 'Hospital-based pathology labs'],
    broad_indication: 'Comprehensive genomic profiling across all solid tumors and hematologic malignancies',
    broad_population: ['All cancer patients', 'Early-stage and advanced', 'Longitudinal monitoring'],
    broad_settings: ['Point-of-care molecular testing', 'Community hospital labs', 'Decentralized testing'],
  },
  general_surgery: {
    narrow_indication: 'Laparoscopic cholecystectomy in elective, non-emergent cases',
    narrow_population: ['Adults 18-70', 'BMI <35', 'ASA I-II'],
    narrow_settings: ['Hospital operating rooms with trained surgeons'],
    base_indication: 'Minimally invasive general surgery across multiple abdominal procedures',
    base_population: ['Adults ≥18', 'ASA I-III', 'Including bariatric and colorectal'],
    base_settings: ['Hospital ORs', 'Ambulatory surgical centers'],
    broad_indication: 'Multi-specialty minimally invasive and robotic-assisted surgery',
    broad_population: ['All surgical candidates', 'Expansion to thoracic and urologic procedures'],
    broad_settings: ['All surgical settings', 'Office-based procedures', 'Field surgical units'],
  },
  default: {
    narrow_indication: 'Specific clinical indication with restricted patient population',
    narrow_population: ['Narrowly defined patient criteria', 'Specific age/disease severity restrictions'],
    narrow_settings: ['Specialized centers only'],
    base_indication: 'Intended clinical indication matching pivotal trial population',
    base_population: ['Pivotal trial population', 'Standard clinical criteria'],
    base_settings: ['Standard-of-care clinical settings'],
    broad_indication: 'Expanded indications beyond pivotal data, including adjacent populations',
    broad_population: ['All-comers', 'Expanded age ranges', 'Adjacent disease states'],
    broad_settings: ['All applicable clinical settings', 'Point-of-care', 'Home use'],
  },
};

export function buildDeviceIndicationScopeScenarios(
  pathway: string,
  deviceCategory: DeviceCategory,
): DeviceIndicationScopeScenario[] {
  // Normalize pathway key
  let pathwayKey: string;
  if (pathway.includes('510(k)')) {
    pathwayKey = '510(k) Clearance';
  } else if (pathway.includes('De Novo')) {
    pathwayKey = 'De Novo Classification';
  } else if (pathway.includes('PMA')) {
    pathwayKey = 'PMA (Premarket Approval)';
  } else if (pathway.includes('HDE')) {
    pathwayKey = 'HDE (Humanitarian Device Exemption)';
  } else {
    pathwayKey = '510(k) Clearance';
  }

  const template = INDICATION_SCOPE_TEMPLATES[pathwayKey] ?? INDICATION_SCOPE_TEMPLATES['510(k) Clearance'];
  const details = DEVICE_INDICATION_SCOPE_DETAILS[deviceCategory] ?? DEVICE_INDICATION_SCOPE_DETAILS['default'];

  const narrowMultiplier = (template.narrow.multiplier_range[0] + template.narrow.multiplier_range[1]) / 2;
  const broadMultiplier = (template.broad.multiplier_range[0] + template.broad.multiplier_range[1]) / 2;

  // Build narrow scenario
  const narrowNarrative =
    `Narrow indication scenario for ${deviceCategory} device via ${pathwayKey}: ` +
    `"${details.narrow_indication}". ` +
    `Restricted to ${details.narrow_population.join('; ')}. ` +
    `Setting: ${details.narrow_settings.join('; ')}. ` +
    `This represents the most conservative regulatory outcome with the highest probability of clearance/approval (${(template.narrow.probability * 100).toFixed(0)}%). ` +
    `Commercial impact multiplier: ${narrowMultiplier.toFixed(1)}x — significantly limits addressable market but de-risks the regulatory pathway. ` +
    (pathwayKey === '510(k) Clearance'
      ? 'For 510(k), this means exact predicate match with single indication and specific population. Predicate chain is straightforward and review is expedited.'
      : pathwayKey === 'PMA (Premarket Approval)'
      ? 'For PMA, biomarker-selected or single-site-of-care restriction ensures robust efficacy signal in pivotal trial but limits commercial potential.'
      : 'Narrow scope minimizes regulatory risk and enables faster time to market.');

  // Build base scenario
  const baseNarrative =
    `Base indication scenario for ${deviceCategory} device via ${pathwayKey}: ` +
    `"${details.base_indication}". ` +
    `Population: ${details.base_population.join('; ')}. ` +
    `Setting: ${details.base_settings.join('; ')}. ` +
    `This is the most likely regulatory outcome based on pivotal trial design and FDA precedent (probability: ${(template.base.probability * 100).toFixed(0)}%). ` +
    `Commercial impact multiplier: 1.0x — represents the full intended market based on development plan. ` +
    (pathwayKey === '510(k) Clearance'
      ? 'For 510(k), slightly broader indication than predicate but within the same device category. Standard substantial equivalence argument.'
      : pathwayKey === 'PMA (Premarket Approval)'
      ? 'For PMA, broad indication across multiple settings. Pivotal RCT must demonstrate safety and effectiveness in the intended population.'
      : 'Standard indication scope aligned with clinical development program.');

  // Build broad scenario
  const broadNarrative =
    `Broad indication scenario for ${deviceCategory} device via ${pathwayKey}: ` +
    `"${details.broad_indication}". ` +
    `Population: ${details.broad_population.join('; ')}. ` +
    `Setting: ${details.broad_settings.join('; ')}. ` +
    `This represents the most optimistic regulatory outcome with the lowest probability (${(template.broad.probability * 100).toFixed(0)}%). ` +
    `Commercial impact multiplier: ${broadMultiplier.toFixed(1)}x — significantly expands addressable market. ` +
    (pathwayKey === '510(k) Clearance'
      ? 'For 510(k), this requires establishing a new predicate chain with expanded indications. FDA may request clinical data or reclassify the submission as De Novo.'
      : pathwayKey === 'PMA (Premarket Approval)'
      ? 'For PMA, all-comers trial with expanded settings including ASCs and expanded operator credentials. Post-market study commitments likely required.'
      : pathwayKey === 'De Novo Classification'
      ? 'For De Novo, expansion to OTC or point-of-care use with expanded indications. Creates a new classification that competitors can reference.'
      : 'Broad scope maximizes commercial potential but carries highest regulatory risk.');

  return [
    {
      scenario: 'narrow',
      indication_statement: details.narrow_indication,
      population_restrictions: details.narrow_population,
      setting_restrictions: details.narrow_settings,
      regulatory_risk: template.narrow.risk,
      commercial_impact_multiplier: narrowMultiplier,
      probability: template.narrow.probability,
      narrative: narrowNarrative,
    },
    {
      scenario: 'base',
      indication_statement: details.base_indication,
      population_restrictions: details.base_population,
      setting_restrictions: details.base_settings,
      regulatory_risk: template.base.risk,
      commercial_impact_multiplier: template.base.multiplier,
      probability: template.base.probability,
      narrative: baseNarrative,
    },
    {
      scenario: 'broad',
      indication_statement: details.broad_indication,
      population_restrictions: details.broad_population,
      setting_restrictions: details.broad_settings,
      regulatory_risk: template.broad.risk,
      commercial_impact_multiplier: broadMultiplier,
      probability: template.broad.probability,
      narrative: broadNarrative,
    },
  ];
}

// ────────────────────────────────────────────────────────────
// FUNCTION 4: buildDeviceManufacturingRisk
// Manufacturing risk profiling by product category.
// ────────────────────────────────────────────────────────────

interface ManufacturingProfile {
  complexity: number;
  sterilization_method: string;
  sterilization_risk: 'low' | 'moderate' | 'high';
  validation_months: number;
  biocompat_tests: string[];
  iso_standards: string[];
  cogs_range: { low_pct: number; high_pct: number };
  scale_up_challenges: string[];
  supply_chain_risk: 'low' | 'moderate' | 'high';
}

const DEVICE_MANUFACTURING_PROFILES: Record<string, ManufacturingProfile> = {
  device_implantable: {
    complexity: 8,
    sterilization_method: 'Ethylene oxide (EtO) or gamma radiation',
    sterilization_risk: 'high',
    validation_months: 18,
    biocompat_tests: [
      'Cytotoxicity (ISO 10993-5)',
      'Sensitization (ISO 10993-10)',
      'Irritation (ISO 10993-23)',
      'Systemic toxicity (ISO 10993-11)',
      'Genotoxicity (ISO 10993-3)',
      'Implantation (ISO 10993-6)',
      'Hemocompatibility (ISO 10993-4)',
    ],
    iso_standards: ['ISO 13485', 'ISO 10993 series', 'ISO 14971', 'ISO 11607 (packaging)'],
    cogs_range: { low_pct: 15, high_pct: 35 },
    scale_up_challenges: [
      'Biocompatible material sourcing (titanium, PEEK, UHMWPE)',
      'Cleanroom capacity for Class 7/8 manufacturing',
      'Sterilization validation (EtO cycle optimization)',
      'Lot-to-lot consistency for critical dimensions',
      'Incoming material qualification for implant-grade alloys',
      'Long-term stability studies for shelf-life claims',
    ],
    supply_chain_risk: 'high',
  },
  device_surgical: {
    complexity: 6,
    sterilization_method: 'Ethylene oxide (EtO)',
    sterilization_risk: 'moderate',
    validation_months: 12,
    biocompat_tests: [
      'Cytotoxicity (ISO 10993-5)',
      'Sensitization (ISO 10993-10)',
      'Irritation (ISO 10993-23)',
    ],
    iso_standards: ['ISO 13485', 'ISO 14971', 'IEC 60601-1 (electrical safety, if applicable)'],
    cogs_range: { low_pct: 20, high_pct: 40 },
    scale_up_challenges: [
      'Precision machining tolerances for cutting instruments',
      'Reprocessing validation for reusable devices',
      'Sterile packaging design and validation',
      'Multi-component assembly process qualification',
      'Supplier qualification for specialty stainless steel',
    ],
    supply_chain_risk: 'moderate',
  },
  device_monitoring: {
    complexity: 4,
    sterilization_method: 'Not required for external non-invasive devices',
    sterilization_risk: 'low',
    validation_months: 9,
    biocompat_tests: [
      'Cytotoxicity (ISO 10993-5) — for skin-contact components',
      'Sensitization (ISO 10993-10) — for adhesive components',
    ],
    iso_standards: ['ISO 13485', 'ISO 14971', 'IEC 60601-1', 'IEC 62304 (software lifecycle)'],
    cogs_range: { low_pct: 25, high_pct: 45 },
    scale_up_challenges: [
      'Electronics component supply chain volatility',
      'Sensor calibration consistency at scale',
      'Firmware/software update deployment management',
      'Battery life optimization and testing',
      'Consumer-grade packaging for home-use devices',
    ],
    supply_chain_risk: 'moderate',
  },
  device_drug_delivery: {
    complexity: 9,
    sterilization_method: 'Gamma radiation or ethylene oxide (EtO)',
    sterilization_risk: 'high',
    validation_months: 24,
    biocompat_tests: [
      'Cytotoxicity (ISO 10993-5)',
      'Sensitization (ISO 10993-10)',
      'Irritation (ISO 10993-23)',
      'Systemic toxicity (ISO 10993-11)',
      'Genotoxicity (ISO 10993-3)',
      'Implantation (ISO 10993-6)',
      'Hemocompatibility (ISO 10993-4)',
      'Drug-device interaction testing',
    ],
    iso_standards: ['ISO 13485', 'ISO 10993 series', 'ISO 14971', 'ICH Q8/Q9 (drug substance)', '21 CFR 4 (combination products)'],
    cogs_range: { low_pct: 20, high_pct: 40 },
    scale_up_challenges: [
      'Combination product regulatory complexity (CDER/CDRH jurisdiction)',
      'Drug-device compatibility and stability studies',
      'Dual GMP compliance (drug + device manufacturing)',
      'Sterilization method impact on drug stability',
      'Elution rate consistency across manufacturing lots',
      'Long-term drug reservoir stability validation',
    ],
    supply_chain_risk: 'high',
  },
  device_digital_health: {
    complexity: 3,
    sterilization_method: 'Not applicable (software only)',
    sterilization_risk: 'low',
    validation_months: 6,
    biocompat_tests: [],
    iso_standards: ['IEC 62304 (software lifecycle)', 'ISO 14971', 'IEC 82304 (health software)', 'ISO 13485 (if hardware component)'],
    cogs_range: { low_pct: 5, high_pct: 15 },
    scale_up_challenges: [
      'Cybersecurity compliance (FDA premarket cybersecurity guidance)',
      'Cloud infrastructure scaling and HIPAA compliance',
      'Software version management and update validation',
      'AI/ML model retraining and predetermined change control plan',
      'Interoperability with EHR systems (HL7 FHIR)',
      'Real-world performance monitoring post-deployment',
    ],
    supply_chain_risk: 'low',
  },
  device_capital_equipment: {
    complexity: 7,
    sterilization_method: 'Not applicable (non-sterile capital equipment)',
    sterilization_risk: 'low',
    validation_months: 15,
    biocompat_tests: [],
    iso_standards: ['ISO 13485', 'ISO 14971', 'IEC 60601-1', 'IEC 61010 (lab equipment)', 'IEC 62366 (usability)'],
    cogs_range: { low_pct: 25, high_pct: 45 },
    scale_up_challenges: [
      'Complex electromechanical assembly qualification',
      'Heavy supply chain dependency on specialized components (tubes, detectors, lasers)',
      'Installation qualification (IQ) and operational qualification (OQ) at customer sites',
      'Service infrastructure buildout (field service engineers)',
      'Long lead times for custom optics and radiation sources',
      'Regulatory clearance for hardware + software system integration',
    ],
    supply_chain_risk: 'high',
  },
  device_point_of_care: {
    complexity: 5,
    sterilization_method: 'Gamma radiation for reagent cartridges',
    sterilization_risk: 'moderate',
    validation_months: 10,
    biocompat_tests: [
      'Cytotoxicity (ISO 10993-5) — for specimen-contact components',
    ],
    iso_standards: ['ISO 13485', 'ISO 14971', 'ISO 15197 (glucose monitoring)', 'CLSI EP (evaluation protocols)'],
    cogs_range: { low_pct: 15, high_pct: 30 },
    scale_up_challenges: [
      'Reagent shelf-life and cold chain management',
      'Reader-to-reader variability in field conditions',
      'High-volume cartridge/test strip manufacturing consistency',
      'CLIA waiver study requirements for operator simplicity',
      'Environmental performance validation (temperature, humidity)',
    ],
    supply_chain_risk: 'moderate',
  },
  diagnostics_ivd: {
    complexity: 5,
    sterilization_method: 'Not applicable (non-sterile laboratory reagents)',
    sterilization_risk: 'low',
    validation_months: 12,
    biocompat_tests: [],
    iso_standards: ['ISO 13485', 'ISO 14971', 'ISO 23640 (IVD performance evaluation)', 'CLSI EP (evaluation protocols)'],
    cogs_range: { low_pct: 10, high_pct: 25 },
    scale_up_challenges: [
      'Reagent lot-to-lot consistency and stability',
      'Reference material sourcing and characterization',
      'Platform-instrument calibration standardization',
      'Clinical specimen banking for ongoing validation',
      'Software validation for data analysis algorithms',
    ],
    supply_chain_risk: 'moderate',
  },
  diagnostics_companion: {
    complexity: 6,
    sterilization_method: 'Not applicable (non-sterile laboratory reagents)',
    sterilization_risk: 'low',
    validation_months: 14,
    biocompat_tests: [],
    iso_standards: ['ISO 13485', 'ISO 14971', 'ISO 23640', 'FDA CDx PMA guidance'],
    cogs_range: { low_pct: 10, high_pct: 25 },
    scale_up_challenges: [
      'Co-development timeline synchronization with drug partner',
      'Clinical trial specimen access and bridging study design',
      'Analytical validation across specimen types (FFPE, fresh frozen, liquid)',
      'Label expansion tracking when drug label changes',
      'Multi-platform validation if distributed across analyzer systems',
    ],
    supply_chain_risk: 'moderate',
  },
  diagnostics_liquid_biopsy: {
    complexity: 7,
    sterilization_method: 'Not applicable (non-sterile laboratory reagents)',
    sterilization_risk: 'low',
    validation_months: 16,
    biocompat_tests: [],
    iso_standards: ['ISO 13485', 'ISO 14971', 'ISO 20186 (molecular testing)', 'CAP/CLIA laboratory standards'],
    cogs_range: { low_pct: 15, high_pct: 30 },
    scale_up_challenges: [
      'ctDNA extraction efficiency and limit-of-detection optimization',
      'Pre-analytical variable control (blood collection tube, processing time)',
      'Complex bioinformatics pipeline validation and version control',
      'Reference standard development for ultra-low-frequency variants',
      'Wet lab automation for high-throughput clinical laboratory operation',
      'Tissue concordance study design and execution',
    ],
    supply_chain_risk: 'moderate',
  },
};

export function buildDeviceManufacturingRisk(
  productCategory: ProductCategory,
  mechanism?: string,
): DeviceManufacturingRisk {
  // Map product category to manufacturing profile key
  const profileKey = productCategory as string;
  const profile = DEVICE_MANUFACTURING_PROFILES[profileKey] ?? DEVICE_MANUFACTURING_PROFILES['device_surgical'];

  // Adjust complexity based on mechanism keywords if provided
  let adjustedComplexity = profile.complexity;
  const mechLower = (mechanism ?? '').toLowerCase();
  if (mechLower.includes('robot') || mechLower.includes('ai') || mechLower.includes('machine learning')) {
    adjustedComplexity = Math.min(10, adjustedComplexity + 1);
  }
  if (mechLower.includes('nano') || mechLower.includes('bioresorbable') || mechLower.includes('3d print')) {
    adjustedComplexity = Math.min(10, adjustedComplexity + 1);
  }

  const narrative =
    `Manufacturing risk profile for ${productCategory}: complexity ${adjustedComplexity}/10. ` +
    `Sterilization: ${profile.sterilization_method} (risk: ${profile.sterilization_risk}). ` +
    `Estimated manufacturing validation timeline: ${profile.validation_months} months. ` +
    `Estimated COGS: ${profile.cogs_range.low_pct}-${profile.cogs_range.high_pct}% of ASP. ` +
    `Supply chain risk: ${profile.supply_chain_risk}. ` +
    (profile.biocompat_tests.length > 0
      ? `Biocompatibility testing required: ${profile.biocompat_tests.length} tests per ISO 10993 series. `
      : 'No biocompatibility testing required (non-patient-contact). ') +
    `Applicable standards: ${profile.iso_standards.join(', ')}. ` +
    `Key scale-up challenges: ${profile.scale_up_challenges.slice(0, 3).join('; ')}. ` +
    `Early engagement with CDMOs/CMOs and establishment of a robust Design History File (DHF) per 21 CFR 820 are critical to de-risking manufacturing.`;

  return {
    sterilization_method: profile.sterilization_method,
    sterilization_risk: profile.sterilization_risk,
    biocompatibility_testing_required: profile.biocompat_tests,
    iso_standards_applicable: profile.iso_standards,
    manufacturing_complexity_score: adjustedComplexity,
    supply_chain_risk: profile.supply_chain_risk,
    scale_up_challenges: profile.scale_up_challenges,
    estimated_manufacturing_validation_months: profile.validation_months,
    estimated_cogs_range: profile.cogs_range,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// DEVICE REGULATORY ANALYSIS — WIRING FUNCTION
// Constructs a DeviceRegulatoryOutput by calling the 4 new
// functions and integrating them with the existing device
// regulatory pathway logic.
// ────────────────────────────────────────────────────────────

export async function analyzeDeviceRegulatory(
  input: DeviceRegulatoryInput,
): Promise<DeviceRegulatoryOutput> {
  // Determine recommended pathway
  const pathwayResult = recommendDevicePathway(input);

  // Determine device class and review division
  const deviceClass = input.device_class_claimed ?? inferDeviceClass(input);
  const reviewDivision = input.product_category.startsWith('diagnostics')
    ? 'CDRH - Office of In Vitro Diagnostics and Radiological Health (OIR)'
    : 'CDRH - Office of Product Evaluation and Quality (OPEQ)';

  // Determine development stage label for evidence strategy
  const devStage = input.clinical_data_available ? 'clinical_trial' : 'preclinical';

  // Extract pathway string for downstream functions
  const pathwayStr = pathwayResult.primary.pathway;

  // ── NEW: Function 1 — Predicate device search ──
  const predicateDevices = findPredicateDevices(
    inferDeviceCategory(input),
    input.intended_use,
  );

  // ── NEW: Function 2 — Clinical evidence strategy ──
  const deviceClinicalEvidenceStrategy = buildDeviceClinicalEvidenceStrategy(
    pathwayStr as string,
    inferDeviceCategory(input),
    devStage,
  );

  // ── NEW: Function 3 — Indication scope scenarios ──
  const indicationScopeScenarios = buildDeviceIndicationScopeScenarios(
    pathwayStr as string,
    inferDeviceCategory(input),
  );

  // ── NEW: Function 4 — Manufacturing risk ──
  const deviceManufacturingRisk = buildDeviceManufacturingRisk(
    input.product_category,
    input.device_description,
  );

  // Build special designations
  const specialDesignations = scoreDeviceDesignations(input);

  // Timeline estimate
  const timelineEstimate = estimateDeviceTimeline(input, pathwayStr);

  // Key risks
  const keyRisks = assessDeviceRisks(input, pathwayStr);

  // Comparable clearances
  const comparableClearances = predicateDevices.slice(0, 5).map(p => ({
    device: p.device_name,
    company: p.company,
    pathway: p.pathway,
    clearance_date: p.clearance_date,
    review_months: Math.round(p.review_days / 30),
    device_class: p.device_class,
  }));

  // Clinical evidence strategy summary (for the existing field)
  const clinicalEvidenceStrategy = {
    study_design: deviceClinicalEvidenceStrategy.recommended_study_type,
    primary_endpoint: deviceClinicalEvidenceStrategy.recommended_primary_endpoint,
    sample_size_estimate: `${deviceClinicalEvidenceStrategy.estimated_sample_size.low}-${deviceClinicalEvidenceStrategy.estimated_sample_size.high} patients`,
    duration: `${deviceClinicalEvidenceStrategy.estimated_enrollment_months} months enrollment`,
    key_considerations: deviceClinicalEvidenceStrategy.key_study_risks.slice(0, 4),
  };

  // Post-market requirements
  const postMarketRequirements = buildPostMarketRequirements(input, pathwayStr);

  return {
    recommended_pathway: {
      primary: {
        pathway: pathwayStr,
        device_class: deviceClass,
        review_division: reviewDivision,
        typical_timeline_months: timelineEstimate.total_to_market.realistic,
        submission_requirements: pathwayResult.primary.requirements,
        clinical_evidence_required: deviceClinicalEvidenceStrategy.recommended_study_type,
      },
      alternatives: pathwayResult.alternatives,
      rationale: pathwayResult.rationale,
    },
    special_designations: specialDesignations,
    timeline_estimate: timelineEstimate,
    key_risks: keyRisks,
    comparable_clearances: comparableClearances,
    clinical_evidence_strategy: clinicalEvidenceStrategy,
    post_market_requirements: postMarketRequirements,

    // 99+ world-class regulatory analytics extensions
    predicate_devices: predicateDevices.length > 0 ? predicateDevices : undefined,
    device_clinical_evidence_strategy: deviceClinicalEvidenceStrategy,
    indication_scope_scenarios: indicationScopeScenarios,
    device_manufacturing_risk: deviceManufacturingRisk,

    data_sources: [
      { name: 'FDA 510(k) Premarket Notification Database', type: 'public' },
      { name: 'FDA PMA Database', type: 'public' },
      { name: 'FDA De Novo Classification Orders', type: 'public' },
      { name: 'FDA CDRH Annual Performance Reports', type: 'public' },
      { name: 'FDA Device Guidance Documents Library', type: 'public' },
      { name: 'Terrain Device Regulatory Intelligence', type: 'proprietary' },
      { name: 'Ambrosia Ventures MedTech Deal Database', type: 'proprietary' },
    ],
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// DEVICE REGULATORY HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

function inferDeviceCategory(input: DeviceRegulatoryInput): DeviceCategory {
  const desc = (input.device_description + ' ' + input.intended_use + ' ' + input.indications_for_use).toLowerCase();

  if (/heart|valve|stent|cardiac|coronary|atrial|aortic|pacemaker|defibrillator/.test(desc)) return 'cardiovascular';
  if (/knee|hip|spine|bone|joint|orthop|arthroplasty|fracture/.test(desc)) return 'orthopedic';
  if (/brain|neuro|seizure|epilepsy|parkinson|dbs|vagus/.test(desc)) return 'neurology';
  if (/eye|ophthalm|retina|cataract|lens|glaucoma|lasik/.test(desc)) return 'ophthalmology';
  if (/endoscop|colonoscop|gastro|gi tract/.test(desc)) return 'endoscopy_gi';
  if (/wound|dermal|skin repair|tissue regenerat/.test(desc)) return 'wound_care';
  if (/glucose|diabetes|insulin|cgm|metabolic|pump/.test(desc)) return 'diabetes_metabolic';
  if (/tumor|ablation|oncol|cancer.*surg/.test(desc)) return 'oncology_surgical';
  if (/radiation|proton|linac|brachytherapy/.test(desc)) return 'oncology_radiation';
  if (/ivd.*oncol|tumor marker|companion diag|genomic profil/.test(desc)) return 'ivd_oncology';
  if (/infect|pathogen|pcr|culture|antimicrob/.test(desc)) return 'ivd_infectious';
  if (/troponin|bnp|cardiac marker/.test(desc)) return 'ivd_cardiology';
  if (/genetic|ngs|sequenc|variant|genomic/.test(desc)) return 'ivd_genetics';
  if (/imaging|mri|ct scan|x-ray|ultrasound|radiol/.test(desc)) return 'imaging_radiology';
  if (/dialysis|renal|hemodialysis|peritoneal/.test(desc)) return 'renal_dialysis';
  if (/respirat|ventilat|cpap|pulmon|oxygen/.test(desc)) return 'respiratory';
  if (/dental|tooth|implant.*dental|oral/.test(desc)) return 'dental';
  if (/vascular|angioplasty|graft|embol/.test(desc)) return 'vascular';
  if (/ear|nose|throat|sinus|cochlear|hearing/.test(desc)) return 'ent';
  if (/urolog|prostate|bladder|kidney stone/.test(desc)) return 'urology';
  if (/dermatol|skin.*laser|cosmetic.*device/.test(desc)) return 'dermatology';

  return 'general_surgery';
}

type FDADeviceClassType = 'Class I' | 'Class II' | 'Class III';

function inferDeviceClass(input: DeviceRegulatoryInput): FDADeviceClassType {
  if (input.is_novel_technology && !input.has_predicate) return 'Class III';
  if (input.is_combination_product) return 'Class III';
  if (input.product_category === 'device_implantable') return 'Class III';
  if (input.product_category === 'diagnostics_companion') return 'Class III';
  if (input.has_predicate) return 'Class II';
  if (input.product_category === 'device_digital_health') return 'Class II';
  if (input.product_category === 'device_monitoring') return 'Class II';
  if (input.product_category === 'device_point_of_care') return 'Class II';
  if (input.product_category === 'diagnostics_ivd') return 'Class II';

  return 'Class II';
}

function recommendDevicePathway(
  input: DeviceRegulatoryInput,
): {
  primary: { pathway: FDADevicePathway; requirements: string[] };
  alternatives: { pathway: string; rationale: string; tradeoffs: string }[];
  rationale: string;
} {
  let primaryPathway: FDADevicePathway;
  let requirements: string[];
  const alternatives: { pathway: string; rationale: string; tradeoffs: string }[] = [];

  // HDE check first — patient population <8,000/yr
  if (input.patient_population_us && input.patient_population_us < 8000 && input.unmet_need === 'high') {
    primaryPathway = 'HDE (Humanitarian Device Exemption)';
    requirements = [
      'Humanitarian Use Device (HUD) designation from OOPD',
      'Probable benefit demonstration (not effectiveness)',
      'Safety data from feasibility study',
      'IRB approval required at each institution for use',
      'Annual distribution report to FDA',
    ];
    alternatives.push({
      pathway: 'PMA (Premarket Approval)',
      rationale: 'If clinical data supports full effectiveness claim, PMA allows broader commercialization without per-institution IRB requirement',
      tradeoffs: 'Significantly higher cost ($15-50M) and longer timeline (3-5 years) but removes HDE distribution restrictions',
    });
  }
  // PMA for Class III or novel high-risk
  else if (
    input.device_class_claimed === 'Class III' ||
    (input.is_novel_technology && input.is_combination_product) ||
    (input.product_category === 'device_implantable' && input.is_novel_technology && !input.has_predicate)
  ) {
    primaryPathway = 'PMA (Premarket Approval)';
    requirements = [
      'Complete PMA application (21 CFR 814)',
      'Valid scientific evidence of safety and effectiveness',
      'IDE-approved clinical trial with adequate patient enrollment',
      'Non-clinical (bench, animal) testing per FDA guidance',
      'Manufacturing information and quality system documentation',
      'Proposed labeling and instructions for use',
      'Environmental assessment or claim for categorical exclusion',
    ];
    alternatives.push({
      pathway: 'Breakthrough Device Designation',
      rationale: 'If device treats a life-threatening or irreversibly debilitating condition and represents breakthrough technology',
      tradeoffs: 'Adds interactive review and priority review but does not change submission type (still PMA). Application required early in development.',
    });
    alternatives.push({
      pathway: 'De Novo Classification',
      rationale: 'If FDA agrees device is low-to-moderate risk despite no predicate, De Novo creates new Class II classification',
      tradeoffs: 'Lower evidence burden than PMA but longer review time than 510(k). Creates predicate path for future competitors.',
    });
  }
  // De Novo for novel, low-to-moderate risk
  else if (input.is_novel_technology && !input.has_predicate) {
    primaryPathway = 'De Novo Classification';
    requirements = [
      'De Novo request (21 CFR 860.260)',
      'Description of device and intended use',
      'Risk analysis (ISO 14971) demonstrating low-to-moderate risk',
      'Performance data (clinical and/or non-clinical)',
      'Proposed classification and product code',
      'Comparison to existing classified devices',
      'Proposed special controls',
    ];
    alternatives.push({
      pathway: '510(k) Clearance',
      rationale: 'If a suitable predicate device can be identified through creative predicate chain analysis',
      tradeoffs: 'Faster and less expensive but requires substantial equivalence argument. May be challenged by FDA reviewer.',
    });
    alternatives.push({
      pathway: 'PMA (Premarket Approval)',
      rationale: 'If FDA disagrees with low-to-moderate risk classification, automatic Class III designation triggers PMA requirement',
      tradeoffs: 'Significantly higher evidence burden, cost, and timeline. Clinical trial required.',
    });
  }
  // 510(k) for predicate-based
  else {
    primaryPathway = '510(k) Clearance';
    requirements = [
      'Premarket Notification 510(k) (21 CFR 807 Subpart E)',
      'Substantial equivalence comparison to predicate device(s)',
      'Device description and intended use statement',
      'Performance data (bench, biocompatibility, clinical if applicable)',
      'Sterilization and shelf-life information (if applicable)',
      'Electrical safety and EMC testing (if applicable)',
      'Software documentation (if applicable, per IEC 62304)',
      'Labeling',
    ];
    alternatives.push({
      pathway: 'De Novo Classification',
      rationale: 'If predicate comparison is weak or FDA challenges substantial equivalence, De Novo provides alternative pathway',
      tradeoffs: 'Longer review time (12-18 months vs 3-6 months) but creates new classification. Clinical data may be required.',
    });
  }

  // Always suggest Q-Sub
  alternatives.push({
    pathway: 'Q-Submission (Pre-Sub Meeting)',
    rationale: 'Pre-Submission meeting with FDA is recommended regardless of pathway to align on submission strategy, testing requirements, and clinical evidence expectations',
    tradeoffs: 'Adds 3-4 months to timeline but significantly reduces risk of FDA additional information requests or refuse-to-accept.',
  });

  // Build rationale
  const rationale =
    `Based on the product profile (${input.product_category}, ${input.has_predicate ? 'predicate identified' : 'no predicate'}` +
    `${input.is_novel_technology ? ', novel technology' : ''}` +
    `${input.is_combination_product ? ', combination product' : ''}), ` +
    `the recommended primary pathway is ${primaryPathway}. ` +
    (primaryPathway === '510(k) Clearance'
      ? 'The presence of a predicate device supports 510(k) substantial equivalence. FDA review is typically 3-6 months. Pre-Submission meeting is strongly recommended to confirm predicate acceptability.'
      : primaryPathway === 'De Novo Classification'
      ? 'As a novel device with no identified predicate, De Novo classification is appropriate for low-to-moderate risk devices. This creates a new regulatory classification and product code.'
      : primaryPathway === 'PMA (Premarket Approval)'
      ? 'The high-risk profile of this device requires PMA with valid scientific evidence of safety and effectiveness. An IDE clinical trial is typically required. Breakthrough Device Designation should be evaluated for interactive FDA review.'
      : 'HDE is appropriate for devices targeting conditions affecting fewer than 8,000 patients per year in the US. Probable benefit (not effectiveness) must be demonstrated.');

  return { primary: { pathway: primaryPathway, requirements }, alternatives, rationale };
}

function scoreDeviceDesignations(input: DeviceRegulatoryInput): DeviceRegulatoryOutput['special_designations'] {
  const designations: DeviceRegulatoryOutput['special_designations'] = [];

  // Breakthrough Device
  const isLifeThreatening = input.unmet_need === 'high';
  const isBreakthroughTech = input.is_novel_technology;
  designations.push({
    designation: 'Breakthrough Device',
    eligibility: isLifeThreatening && isBreakthroughTech ? 'likely' : isLifeThreatening || isBreakthroughTech ? 'possible' : 'unlikely',
    benefit: 'Interactive and timely FDA review, data development plan, priority review of premarket submission, senior management involvement in review',
    criteria: 'Device provides more effective treatment or diagnosis of life-threatening or irreversibly debilitating human disease or condition AND represents breakthrough technology OR no approved/cleared alternative exists OR significant advantages over existing alternatives',
  });

  // HDE
  const isHDEEligible = input.patient_population_us !== undefined && input.patient_population_us < 8000;
  designations.push({
    designation: 'HDE',
    eligibility: isHDEEligible ? 'likely' : 'unlikely',
    benefit: 'Requires probable benefit rather than effectiveness, smaller clinical studies, PDUFA fee exemption',
    criteria: 'Device is intended to benefit patients in the treatment or diagnosis of a disease or condition that affects or is manifested in not more than 8,000 individuals in the United States per year',
  });

  // De Novo
  const isDeNovoCandidate = !input.has_predicate && !input.device_class_claimed?.includes('III');
  designations.push({
    designation: 'De Novo',
    eligibility: isDeNovoCandidate ? 'likely' : 'possible',
    benefit: 'Creates new Class I or Class II device classification, establishes regulatory pathway for similar devices, lower evidence burden than PMA',
    criteria: 'Novel device with no identified predicate that is low-to-moderate risk. Cannot be classified by the 510(k) process because no predicate exists.',
  });

  // EUA
  designations.push({
    designation: 'EUA',
    eligibility: 'unlikely',
    benefit: 'Emergency authorization during declared public health emergency',
    criteria: 'Public health emergency declared by HHS Secretary, and device may be effective for emergency use. Not applicable outside of declared emergencies.',
  });

  // MDUFA Priority Review
  designations.push({
    designation: 'MDUFA Priority Review',
    eligibility: isLifeThreatening ? 'possible' : 'unlikely',
    benefit: 'Shorter FDA review timeline, dedicated review team',
    criteria: 'Device addresses significant clinical need for life-threatening or irreversibly debilitating condition. Applied at time of premarket submission.',
  });

  return designations;
}

function estimateDeviceTimeline(
  input: DeviceRegulatoryInput,
  pathway: string,
): DeviceRegulatoryOutput['timeline_estimate'] {
  let ideSubmission: string | undefined;
  let clinicalCompletion: string | undefined;
  let fdaSubmission: string | undefined;
  let fdaReviewMonths: number;
  let approvalEstimate: string | undefined;

  const now = new Date();
  const addMo = (m: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().split('T')[0];
  };

  if (pathway.includes('510(k)')) {
    fdaReviewMonths = 6;
    if (!input.clinical_data_available) {
      fdaSubmission = addMo(6);
      approvalEstimate = addMo(6 + fdaReviewMonths);
    } else {
      fdaSubmission = addMo(3);
      approvalEstimate = addMo(3 + fdaReviewMonths);
    }
  } else if (pathway.includes('De Novo')) {
    fdaReviewMonths = 12;
    if (!input.clinical_data_available) {
      clinicalCompletion = addMo(18);
      fdaSubmission = addMo(20);
      approvalEstimate = addMo(20 + fdaReviewMonths);
    } else {
      fdaSubmission = addMo(4);
      approvalEstimate = addMo(4 + fdaReviewMonths);
    }
  } else if (pathway.includes('PMA')) {
    fdaReviewMonths = 12;
    if (!input.clinical_data_available) {
      ideSubmission = addMo(3);
      clinicalCompletion = addMo(36);
      fdaSubmission = addMo(39);
      approvalEstimate = addMo(39 + fdaReviewMonths);
    } else {
      fdaSubmission = addMo(6);
      approvalEstimate = addMo(6 + fdaReviewMonths);
    }
  } else if (pathway.includes('HDE')) {
    fdaReviewMonths = 8;
    if (!input.clinical_data_available) {
      clinicalCompletion = addMo(12);
      fdaSubmission = addMo(14);
      approvalEstimate = addMo(14 + fdaReviewMonths);
    } else {
      fdaSubmission = addMo(3);
      approvalEstimate = addMo(3 + fdaReviewMonths);
    }
  } else {
    fdaReviewMonths = 6;
    fdaSubmission = addMo(6);
    approvalEstimate = addMo(12);
  }

  // Calculate total months
  const approvalDate = new Date(approvalEstimate ?? addMo(12));
  const totalMonths = Math.round((approvalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return {
    ide_submission: ideSubmission,
    clinical_completion: clinicalCompletion,
    fda_submission: fdaSubmission,
    fda_review_months: fdaReviewMonths,
    approval_estimate: approvalEstimate,
    total_to_market: {
      optimistic: Math.max(3, Math.round(totalMonths * 0.75)),
      realistic: totalMonths,
    },
  };
}

function assessDeviceRisks(
  input: DeviceRegulatoryInput,
  pathway: string,
): DeviceRegulatoryOutput['key_risks'] {
  const risks: DeviceRegulatoryOutput['key_risks'] = [];

  // Predicate risk for 510(k)
  if (pathway.includes('510(k)')) {
    risks.push({
      risk: 'Predicate device identification: FDA may disagree with predicate selection or substantial equivalence argument, triggering reclassification to De Novo or Class III.',
      severity: input.has_predicate ? 'moderate' : 'high',
      mitigation: 'Submit Pre-Submission (Q-Sub) with proposed predicate(s) and substantial equivalence rationale. Identify backup predicates. Prepare De Novo strategy as contingency.',
    });
  }

  // Novel technology risk
  if (input.is_novel_technology) {
    risks.push({
      risk: 'Novel technology: FDA may request additional testing or reclassify the device to a higher risk class. Longer review times and additional information requests are likely.',
      severity: 'high',
      mitigation: 'Engage FDA early via Q-Sub. Develop comprehensive risk analysis per ISO 14971. Consider Breakthrough Device Designation for interactive review.',
    });
  }

  // Combination product risk
  if (input.is_combination_product) {
    risks.push({
      risk: 'Combination product complexity: Dual regulatory jurisdiction (CDRH + CDER/CBER) adds complexity. Primary mode of action determination affects lead center assignment.',
      severity: 'high',
      mitigation: 'Request combination product designation from Office of Combination Products (OCP) early. Develop both device and drug components in parallel. Follow 21 CFR Part 4.',
    });
  }

  // Clinical data risk
  if (!input.clinical_data_available && (pathway.includes('PMA') || pathway.includes('De Novo'))) {
    risks.push({
      risk: 'Clinical evidence gap: No clinical data currently available. IDE clinical trial required for PMA; clinical data likely needed for De Novo.',
      severity: 'high',
      mitigation: 'Initiate IDE application process. Design pivotal trial aligned with FDA guidance for this device category. Consider feasibility study to de-risk before pivotal.',
    });
  }

  // Manufacturing risk
  risks.push({
    risk: 'Manufacturing and quality system compliance: FDA may conduct pre-approval inspection. Design control and production process must comply with 21 CFR 820 (Quality System Regulation).',
    severity: 'moderate',
    mitigation: 'Establish QMS per ISO 13485/21 CFR 820 early. Complete Design History File (DHF). Conduct internal audit and mock FDA inspection before submission.',
  });

  // Post-market risk
  risks.push({
    risk: 'Post-market surveillance requirements: FDA may require post-market studies, MDR reporting, and periodic safety update reports. For PMA, annual reports and PMA supplements for changes.',
    severity: 'low',
    mitigation: 'Build post-market surveillance plan into development timeline. Establish MDR reporting procedures. Budget for post-market clinical study if required.',
  });

  // EU MDR risk
  if (input.geography.includes('CE_MDR') || input.geography.includes('CE_IVDR')) {
    risks.push({
      risk: 'EU MDR/IVDR compliance: New regulations (MDR 2017/745, IVDR 2017/746) impose stricter requirements including clinical evaluation, post-market surveillance, and Notified Body capacity constraints.',
      severity: 'high',
      mitigation: 'Engage Notified Body early. Prepare Clinical Evaluation Report (CER) per MEDDEV 2.7/1. Budget for longer EU certification timeline (12-24 months). Monitor MDCG guidance updates.',
    });
  }

  return risks;
}

function buildPostMarketRequirements(
  input: DeviceRegulatoryInput,
  pathway: string,
): string[] {
  const reqs: string[] = [];

  reqs.push('Medical Device Reporting (MDR) per 21 CFR 803 — mandatory adverse event reporting');
  reqs.push('Correction and removal reporting per 21 CFR 806');
  reqs.push('Registration and listing per 21 CFR 807');

  if (pathway.includes('PMA')) {
    reqs.push('PMA annual report (21 CFR 814.84)');
    reqs.push('PMA supplement required for design, labeling, or manufacturing changes');
    reqs.push('Post-approval study conditions (if imposed by FDA)');
  }

  if (pathway.includes('510(k)')) {
    reqs.push('New 510(k) required for significant changes to device design, intended use, or manufacturing process');
  }

  if (pathway.includes('De Novo')) {
    reqs.push('Compliance with special controls established in the De Novo classification order');
    reqs.push('New 510(k) required for future modifications (as a newly classified Class II device)');
  }

  if (pathway.includes('HDE')) {
    reqs.push('Annual distribution report to FDA');
    reqs.push('IRB approval required at each institution before device use');
    reqs.push('Profit restrictions unless granted profit exemption');
  }

  reqs.push('Quality System Regulation (QSR) compliance per 21 CFR 820');
  reqs.push('Unique Device Identification (UDI) labeling per 21 CFR 830');

  if (input.product_category === 'device_digital_health') {
    reqs.push('Predetermined Change Control Plan (PCCP) for AI/ML-based software modifications');
    reqs.push('Cybersecurity postmarket management per FDA guidance');
  }

  if (input.geography.includes('CE_MDR') || input.geography.includes('CE_IVDR')) {
    reqs.push('EU Post-Market Surveillance Plan per MDR Article 84');
    reqs.push('Periodic Safety Update Report (PSUR) per MDR Article 86');
    reqs.push('Post-Market Clinical Follow-up (PMCF) per MDR Annex XIV Part B');
  }

  return reqs;
}
