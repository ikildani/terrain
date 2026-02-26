// ============================================================
// TERRAIN — Likelihood-of-Approval (LoA) Reference Tables
// lib/data/loa-tables.ts
//
// Published LoA data by phase AND therapy area, derived from:
// - BIO/Informa/QLS Clinical Development Success Rates 2011-2020
// - Updated with CDER/CBER 2021-2025 approval trend data
// - Indication-specific calibration for major sub-indications
//
// Used by: market-sizing.ts, regulatory.ts
// ============================================================

import type { DevelopmentStage } from '@/types';

// ────────────────────────────────────────────────────────────
// LoA BY PHASE AND THERAPY AREA (Updated 2025)
// Probability of eventual approval from the given phase.
// Sources:
//   BIO/Informa/QLS Clinical Development Success Rates 2011-2020
//   CDER Novel Drug Approvals 2021-2025
//   Nature Reviews Drug Discovery Phase Transition Analysis 2023
//   Citeline/Pharmaprojects Pipeline Intelligence 2024
// ────────────────────────────────────────────────────────────

export const LOA_BY_PHASE_AND_AREA: Record<string, Record<DevelopmentStage, number>> = {
  // Updated: oncology LoA improved due to biomarker selection + accelerated approvals
  oncology: { preclinical: 0.05, phase1: 0.07, phase2: 0.15, phase3: 0.4, approved: 1.0 },
  immunology: { preclinical: 0.06, phase1: 0.09, phase2: 0.2, phase3: 0.54, approved: 1.0 },
  // Updated: neurology slightly improved — anti-amyloid approvals shifted trajectory
  neurology: { preclinical: 0.03, phase1: 0.06, phase2: 0.12, phase3: 0.46, approved: 1.0 },
  // Updated: rare disease benefiting from accelerated pathways
  rare_disease: { preclinical: 0.1, phase1: 0.16, phase2: 0.28, phase3: 0.66, approved: 1.0 },
  cardiovascular: { preclinical: 0.04, phase1: 0.07, phase2: 0.15, phase3: 0.55, approved: 1.0 },
  // Updated: metabolic surging with GLP-1 class success
  metabolic: { preclinical: 0.06, phase1: 0.11, phase2: 0.22, phase3: 0.6, approved: 1.0 },
  infectious_disease: { preclinical: 0.05, phase1: 0.1, phase2: 0.21, phase3: 0.58, approved: 1.0 },
  hematology: { preclinical: 0.07, phase1: 0.12, phase2: 0.22, phase3: 0.52, approved: 1.0 },
  ophthalmology: { preclinical: 0.06, phase1: 0.1, phase2: 0.18, phase3: 0.5, approved: 1.0 },
  pulmonology: { preclinical: 0.04, phase1: 0.08, phase2: 0.15, phase3: 0.48, approved: 1.0 },
  nephrology: { preclinical: 0.04, phase1: 0.07, phase2: 0.14, phase3: 0.45, approved: 1.0 },
  dermatology: { preclinical: 0.06, phase1: 0.1, phase2: 0.22, phase3: 0.55, approved: 1.0 },
  // Endocrinology: strong Phase 3 success driven by well-defined biomarker endpoints (HbA1c, T4, GH levels)
  endocrinology: { preclinical: 0.05, phase1: 0.09, phase2: 0.2, phase3: 0.58, approved: 1.0 },
  // Gastroenterology: moderate success; IBD endpoints improving with histologic remission standards
  gastroenterology: { preclinical: 0.05, phase1: 0.08, phase2: 0.18, phase3: 0.52, approved: 1.0 },
  // Hepatology: improving with direct-acting antivirals; NASH/MASH historically low but resurgam/MAdCAM shifting
  hepatology: { preclinical: 0.04, phase1: 0.07, phase2: 0.14, phase3: 0.45, approved: 1.0 },
  // Musculoskeletal: moderate; pain endpoints subjective but biologics for RA/OA improving rates
  musculoskeletal: { preclinical: 0.05, phase1: 0.08, phase2: 0.17, phase3: 0.5, approved: 1.0 },
  // Pain management: historically poor due to subjective endpoints, abuse liability concerns, high placebo response
  pain_management: { preclinical: 0.03, phase1: 0.06, phase2: 0.11, phase3: 0.4, approved: 1.0 },
  // New: gene/cell therapy (distinct risk profile)
  gene_cell_therapy: { preclinical: 0.04, phase1: 0.08, phase2: 0.18, phase3: 0.55, approved: 1.0 },
  // New: psychiatry (historically low success)
  psychiatry: { preclinical: 0.02, phase1: 0.05, phase2: 0.08, phase3: 0.38, approved: 1.0 },
};

export const DEFAULT_LOA: Record<DevelopmentStage, number> = {
  preclinical: 0.05,
  phase1: 0.08,
  phase2: 0.15,
  phase3: 0.5,
  approved: 1.0,
};

// ────────────────────────────────────────────────────────────
// INDICATION-SPECIFIC LoA CALIBRATION
// Sub-indication LoA varies 3-5x within therapy areas.
// Example: melanoma Phase 2 LoA = 0.25 vs pancreatic = 0.06
//
// Source: Nature Reviews Drug Discovery (2023), FDA CDER
// approval stats by indication, Citeline Pharmaprojects
// ────────────────────────────────────────────────────────────

export const INDICATION_SPECIFIC_LOA: Record<string, Record<DevelopmentStage, number>> = {
  // ONCOLOGY SUB-INDICATIONS
  melanoma: { preclinical: 0.08, phase1: 0.12, phase2: 0.25, phase3: 0.52, approved: 1.0 },
  'breast cancer': { preclinical: 0.06, phase1: 0.09, phase2: 0.18, phase3: 0.45, approved: 1.0 },
  nsclc: { preclinical: 0.06, phase1: 0.09, phase2: 0.18, phase3: 0.42, approved: 1.0 },
  'non-small cell lung cancer': { preclinical: 0.06, phase1: 0.09, phase2: 0.18, phase3: 0.42, approved: 1.0 },
  'colorectal cancer': { preclinical: 0.04, phase1: 0.06, phase2: 0.12, phase3: 0.35, approved: 1.0 },
  'pancreatic cancer': { preclinical: 0.02, phase1: 0.03, phase2: 0.06, phase3: 0.2, approved: 1.0 },
  glioblastoma: { preclinical: 0.02, phase1: 0.03, phase2: 0.05, phase3: 0.15, approved: 1.0 },
  'ovarian cancer': { preclinical: 0.04, phase1: 0.06, phase2: 0.12, phase3: 0.32, approved: 1.0 },
  'prostate cancer': { preclinical: 0.05, phase1: 0.08, phase2: 0.16, phase3: 0.42, approved: 1.0 },
  'renal cell carcinoma': { preclinical: 0.05, phase1: 0.08, phase2: 0.16, phase3: 0.4, approved: 1.0 },
  'hepatocellular carcinoma': { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.3, approved: 1.0 },
  'multiple myeloma': { preclinical: 0.07, phase1: 0.11, phase2: 0.22, phase3: 0.48, approved: 1.0 },
  aml: { preclinical: 0.05, phase1: 0.08, phase2: 0.15, phase3: 0.35, approved: 1.0 },
  'acute myeloid leukemia': { preclinical: 0.05, phase1: 0.08, phase2: 0.15, phase3: 0.35, approved: 1.0 },
  cll: { preclinical: 0.06, phase1: 0.1, phase2: 0.2, phase3: 0.5, approved: 1.0 },
  dlbcl: { preclinical: 0.05, phase1: 0.08, phase2: 0.18, phase3: 0.4, approved: 1.0 },
  'bladder cancer': { preclinical: 0.04, phase1: 0.07, phase2: 0.14, phase3: 0.35, approved: 1.0 },
  'gastric cancer': { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.28, approved: 1.0 },
  sclc: { preclinical: 0.03, phase1: 0.04, phase2: 0.08, phase3: 0.25, approved: 1.0 },
  'small cell lung cancer': { preclinical: 0.03, phase1: 0.04, phase2: 0.08, phase3: 0.25, approved: 1.0 },

  // NEUROLOGY SUB-INDICATIONS
  alzheimer: { preclinical: 0.02, phase1: 0.03, phase2: 0.06, phase3: 0.3, approved: 1.0 },
  "alzheimer's disease": { preclinical: 0.02, phase1: 0.03, phase2: 0.06, phase3: 0.3, approved: 1.0 },
  parkinson: { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.4, approved: 1.0 },
  "parkinson's disease": { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.4, approved: 1.0 },
  'multiple sclerosis': { preclinical: 0.05, phase1: 0.08, phase2: 0.18, phase3: 0.55, approved: 1.0 },
  epilepsy: { preclinical: 0.04, phase1: 0.07, phase2: 0.15, phase3: 0.5, approved: 1.0 },
  migraine: { preclinical: 0.05, phase1: 0.08, phase2: 0.2, phase3: 0.58, approved: 1.0 },
  als: { preclinical: 0.02, phase1: 0.03, phase2: 0.06, phase3: 0.25, approved: 1.0 },
  'amyotrophic lateral sclerosis': { preclinical: 0.02, phase1: 0.03, phase2: 0.06, phase3: 0.25, approved: 1.0 },
  huntington: { preclinical: 0.02, phase1: 0.03, phase2: 0.05, phase3: 0.2, approved: 1.0 },

  // IMMUNOLOGY SUB-INDICATIONS
  'rheumatoid arthritis': { preclinical: 0.07, phase1: 0.1, phase2: 0.22, phase3: 0.58, approved: 1.0 },
  psoriasis: { preclinical: 0.08, phase1: 0.12, phase2: 0.28, phase3: 0.65, approved: 1.0 },
  'atopic dermatitis': { preclinical: 0.07, phase1: 0.11, phase2: 0.25, phase3: 0.6, approved: 1.0 },
  'ulcerative colitis': { preclinical: 0.05, phase1: 0.08, phase2: 0.18, phase3: 0.48, approved: 1.0 },
  "crohn's disease": { preclinical: 0.04, phase1: 0.07, phase2: 0.15, phase3: 0.45, approved: 1.0 },
  lupus: { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.32, approved: 1.0 },

  // RARE DISEASE (high variability by specific condition)
  'sickle cell disease': { preclinical: 0.1, phase1: 0.18, phase2: 0.3, phase3: 0.65, approved: 1.0 },
  'cystic fibrosis': { preclinical: 0.12, phase1: 0.2, phase2: 0.35, phase3: 0.7, approved: 1.0 },
  duchenne: { preclinical: 0.06, phase1: 0.1, phase2: 0.2, phase3: 0.5, approved: 1.0 },
  hemophilia: { preclinical: 0.1, phase1: 0.16, phase2: 0.28, phase3: 0.62, approved: 1.0 },
  'spinal muscular atrophy': { preclinical: 0.1, phase1: 0.18, phase2: 0.32, phase3: 0.68, approved: 1.0 },

  // METABOLIC
  'type 2 diabetes': { preclinical: 0.07, phase1: 0.12, phase2: 0.25, phase3: 0.65, approved: 1.0 },
  obesity: { preclinical: 0.06, phase1: 0.1, phase2: 0.22, phase3: 0.58, approved: 1.0 },
  nash: { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.35, approved: 1.0 },
  mash: { preclinical: 0.03, phase1: 0.05, phase2: 0.1, phase3: 0.35, approved: 1.0 },

  // CARDIOVASCULAR
  'heart failure': { preclinical: 0.04, phase1: 0.06, phase2: 0.13, phase3: 0.48, approved: 1.0 },
  'atrial fibrillation': { preclinical: 0.04, phase1: 0.07, phase2: 0.15, phase3: 0.52, approved: 1.0 },
};

// ────────────────────────────────────────────────────────────
// PHASE TRANSITION RATES (Updated 2025)
// Probability of advancing from one phase to the next.
// ────────────────────────────────────────────────────────────

export const PHASE_TRANSITION_RATES: Record<string, { from: string; to: string; rate: number }[]> = {
  oncology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.55 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.3 },
    { from: 'Phase 3', to: 'Approval', rate: 0.4 },
  ],
  immunology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.62 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.37 },
    { from: 'Phase 3', to: 'Approval', rate: 0.54 },
  ],
  neurology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.58 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.23 },
    { from: 'Phase 3', to: 'Approval', rate: 0.46 },
  ],
  rare_disease: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.7 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.42 },
    { from: 'Phase 3', to: 'Approval', rate: 0.66 },
  ],
  metabolic: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.64 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.35 },
    { from: 'Phase 3', to: 'Approval', rate: 0.6 },
  ],
  cardiovascular: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.58 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.28 },
    { from: 'Phase 3', to: 'Approval', rate: 0.55 },
  ],
  hematology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.6 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.36 },
    { from: 'Phase 3', to: 'Approval', rate: 0.52 },
  ],
  gene_cell_therapy: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.55 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.35 },
    { from: 'Phase 3', to: 'Approval', rate: 0.55 },
  ],
  psychiatry: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.52 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.18 },
    { from: 'Phase 3', to: 'Approval', rate: 0.38 },
  ],
  infectious_disease: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.65 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.36 },
    { from: 'Phase 3', to: 'Approval', rate: 0.58 },
  ],
  ophthalmology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.62 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.34 },
    { from: 'Phase 3', to: 'Approval', rate: 0.5 },
  ],
  dermatology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.64 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.38 },
    { from: 'Phase 3', to: 'Approval', rate: 0.55 },
  ],
  pulmonology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.58 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.28 },
    { from: 'Phase 3', to: 'Approval', rate: 0.48 },
  ],
  nephrology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.56 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.26 },
    { from: 'Phase 3', to: 'Approval', rate: 0.45 },
  ],
  endocrinology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.62 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.35 },
    { from: 'Phase 3', to: 'Approval', rate: 0.58 },
  ],
  gastroenterology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.6 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.32 },
    { from: 'Phase 3', to: 'Approval', rate: 0.52 },
  ],
  hepatology: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.58 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.25 },
    { from: 'Phase 3', to: 'Approval', rate: 0.45 },
  ],
  musculoskeletal: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.6 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.3 },
    { from: 'Phase 3', to: 'Approval', rate: 0.5 },
  ],
  pain_management: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.55 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.22 },
    { from: 'Phase 3', to: 'Approval', rate: 0.4 },
  ],
  default: [
    { from: 'Phase 1', to: 'Phase 2', rate: 0.6 },
    { from: 'Phase 2', to: 'Phase 3', rate: 0.3 },
    { from: 'Phase 3', to: 'Approval', rate: 0.5 },
  ],
};

// ────────────────────────────────────────────────────────────
// HELPER: Get LoA for a therapy area + stage
// Now checks indication-specific table FIRST for sub-indication
// precision, then falls back to therapy-area level.
// ────────────────────────────────────────────────────────────

export function getLikelihoodOfApproval(therapyArea: string, stage: DevelopmentStage, indication?: string): number {
  // Step 1: Check indication-specific LoA (most precise)
  if (indication) {
    const indLower = indication.toLowerCase();
    const indTable = INDICATION_SPECIFIC_LOA[indLower];
    if (indTable && indTable[stage] !== undefined) {
      return indTable[stage];
    }
    // Try partial matching for common variations
    for (const [key, table] of Object.entries(INDICATION_SPECIFIC_LOA)) {
      if (indLower.includes(key) || key.includes(indLower)) {
        if (table[stage] !== undefined) return table[stage];
      }
    }
  }

  // Step 2: Therapy-area level LoA
  const normalized = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const areaTable = LOA_BY_PHASE_AND_AREA[normalized];
  if (areaTable && areaTable[stage] !== undefined) {
    return areaTable[stage];
  }
  return DEFAULT_LOA[stage] ?? 0.1;
}

export function getPhaseTransitionRates(therapyArea: string): { from: string; to: string; rate: number }[] {
  const normalized = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  return PHASE_TRANSITION_RATES[normalized] ?? PHASE_TRANSITION_RATES.default;
}
