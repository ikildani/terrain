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
