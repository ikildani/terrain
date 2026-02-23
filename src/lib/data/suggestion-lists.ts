// ============================================================
// TERRAIN — Suggestion Lists for Autocomplete
// Extracted from competitor-database and device-indications
// ============================================================

import type { SuggestionItem } from '@/components/ui/FuzzyAutocomplete';
import { COMPETITOR_DATABASE } from './competitor-database';
import { PROCEDURE_VOLUME_DATA } from './device-indications';

// ── Mechanism Suggestions ────────────────────────────────────
// Deduplicated from competitor-database mechanism field

function buildMechanismSuggestions(): SuggestionItem[] {
  const counts = new Map<string, { category: string; count: number }>();
  for (const rec of COMPETITOR_DATABASE) {
    const key = rec.mechanism;
    if (!key) continue;
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, {
        category: rec.mechanism_category
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        count: 1,
      });
    }
  }
  return Array.from(counts.entries())
    .map(([name, { category, count }]) => ({
      name,
      category,
      detail: `${count} asset${count > 1 ? 's' : ''}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const MECHANISM_SUGGESTIONS: SuggestionItem[] = buildMechanismSuggestions();

export const POPULAR_MECHANISMS = [
  'PD-1 inhibitor',
  'PD-L1 inhibitor',
  'KRAS G12C inhibitor',
  'Antibody-drug conjugate (ADC)',
  'Bispecific T-cell engager',
  'CAR-T cell therapy',
];

// ── Molecular Target Suggestions ─────────────────────────────

function buildTargetSuggestions(): SuggestionItem[] {
  const counts = new Map<string, { area: string; count: number }>();
  for (const rec of COMPETITOR_DATABASE) {
    const target = rec.molecular_target;
    if (!target) continue;
    const existing = counts.get(target);
    if (existing) {
      existing.count++;
    } else {
      counts.set(target, {
        area: rec.mechanism_category
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        count: 1,
      });
    }
  }
  return Array.from(counts.entries())
    .map(([name, { area, count }]) => ({
      name,
      category: area,
      detail: `${count} asset${count > 1 ? 's' : ''}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const TARGET_SUGGESTIONS: SuggestionItem[] = buildTargetSuggestions();

// ── Subtype / Specifics Suggestions ──────────────────────────
// Dynamically built from competitor-database indication_specifics

function buildSubtypeSuggestions(): SuggestionItem[] {
  const seen = new Map<string, { indication: string; count: number }>();
  for (const rec of COMPETITOR_DATABASE) {
    const specifics = rec.indication_specifics;
    if (!specifics) continue;
    const existing = seen.get(specifics);
    if (existing) {
      existing.count++;
    } else {
      seen.set(specifics, { indication: rec.indication, count: 1 });
    }
  }
  return Array.from(seen.entries())
    .map(([name, { indication, count }]) => ({
      name,
      category: indication,
      detail: `${count} asset${count > 1 ? 's' : ''}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const SUBTYPE_SUGGESTIONS: SuggestionItem[] = buildSubtypeSuggestions();

export const POPULAR_SUBTYPES = [
  'EGFR-mutated NSCLC',
  'HR+/HER2- metastatic breast cancer',
  'Relapsed/refractory DLBCL',
  'R/R multiple myeloma after ≥4 prior lines',
  '1L metastatic PDAC',
  'Biomarker-unselected advanced solid tumors',
];

// ── Procedure Suggestions (Device form) ──────────────────────

export const PROCEDURE_SUGGESTIONS: SuggestionItem[] = PROCEDURE_VOLUME_DATA.map((p) => ({
  name: p.procedure_name,
  category: p.physician_specialty?.[0] || p.site_of_care?.[0] || '',
  detail: p.annual_us_procedures
    ? `${(p.annual_us_procedures / 1_000).toFixed(0)}K US/yr`
    : undefined,
}));

export const POPULAR_PROCEDURES = PROCEDURE_VOLUME_DATA
  .sort((a, b) => (b.annual_us_procedures || 0) - (a.annual_us_procedures || 0))
  .slice(0, 6)
  .map((p) => p.procedure_name);

// ── Physician Specialty Suggestions ──────────────────────────

const ADDITIONAL_SPECIALTIES: SuggestionItem[] = [
  { name: 'Radiation Oncology', category: 'Oncology' },
  { name: 'Surgical Oncology', category: 'Oncology' },
  { name: 'Gynecologic Oncology', category: 'Oncology' },
  { name: 'Neuro-Oncology', category: 'Oncology' },
  { name: 'Pediatric Oncology', category: 'Oncology' },
  { name: 'Hematology/Oncology', category: 'Oncology' },
  { name: 'Interventional Radiology', category: 'Radiology' },
  { name: 'Diagnostic Radiology', category: 'Radiology' },
  { name: 'Nuclear Medicine', category: 'Radiology' },
  { name: 'Pulmonology', category: 'Internal Medicine' },
  { name: 'Hepatology', category: 'Internal Medicine' },
  { name: 'Rheumatology', category: 'Internal Medicine' },
  { name: 'Nephrology', category: 'Internal Medicine' },
  { name: 'Endocrinology', category: 'Internal Medicine' },
  { name: 'Infectious Disease', category: 'Internal Medicine' },
  { name: 'Allergy & Immunology', category: 'Internal Medicine' },
  { name: 'Gastroenterology', category: 'Internal Medicine' },
  { name: 'Critical Care Medicine', category: 'Internal Medicine' },
  { name: 'Pain Management', category: 'Anesthesiology' },
  { name: 'Anesthesiology', category: 'Perioperative' },
  { name: 'Emergency Medicine', category: 'Emergency' },
  { name: 'Pathology', category: 'Diagnostics' },
  { name: 'Molecular Pathology', category: 'Diagnostics' },
  { name: 'Clinical Genetics', category: 'Diagnostics' },
  { name: 'Dermatology', category: 'Surgical' },
  { name: 'Plastic Surgery', category: 'Surgical' },
  { name: 'Thoracic Surgery', category: 'Surgical' },
  { name: 'Vascular Surgery', category: 'Surgical' },
  { name: 'Pediatric Surgery', category: 'Surgical' },
  { name: 'Transplant Surgery', category: 'Surgical' },
  { name: 'Colorectal Surgery', category: 'Surgical' },
  { name: 'Otolaryngology (ENT)', category: 'Surgical' },
  { name: 'Urology', category: 'Surgical' },
  { name: 'Ophthalmology', category: 'Surgical' },
  { name: 'Psychiatry', category: 'Neuroscience' },
  { name: 'Neurology', category: 'Neuroscience' },
  { name: 'Neurosurgery', category: 'Neuroscience' },
  { name: 'Physical Medicine & Rehabilitation', category: 'Other' },
  { name: 'Geriatrics', category: 'Other' },
  { name: 'Palliative Care', category: 'Other' },
];

function buildSpecialtySuggestions(): SuggestionItem[] {
  const specialties = new Map<string, SuggestionItem>();

  // Dynamic from procedure data
  for (const p of PROCEDURE_VOLUME_DATA) {
    if (p.physician_specialty) {
      for (const s of p.physician_specialty) {
        if (!specialties.has(s)) specialties.set(s, { name: s });
      }
    }
  }

  // Hand-curated additions
  for (const item of ADDITIONAL_SPECIALTIES) {
    if (!specialties.has(item.name)) {
      specialties.set(item.name, item);
    }
  }

  return Array.from(specialties.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const SPECIALTY_SUGGESTIONS: SuggestionItem[] = buildSpecialtySuggestions();

// ── Biomarker Suggestions (CDx form) ─────────────────────────

export const BIOMARKER_SUGGESTIONS: SuggestionItem[] = [
  // Immunotherapy
  { name: 'PD-L1 (TPS ≥1%)', category: 'Immunotherapy', detail: 'IHC 22C3' },
  { name: 'PD-L1 (CPS ≥10)', category: 'Immunotherapy', detail: 'IHC 22C3' },
  { name: 'PD-L1 (IC ≥1%)', category: 'Immunotherapy', detail: 'IHC SP142' },
  // Oncology — Lung
  { name: 'EGFR exon 19 deletion', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'EGFR L858R', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'EGFR T790M', category: 'Oncology', detail: 'NGS/Liquid biopsy' },
  { name: 'EGFR exon 20 insertion', category: 'Oncology', detail: 'NGS' },
  { name: 'KRAS G12C', category: 'Oncology', detail: 'NGS' },
  { name: 'KRAS G12D', category: 'Oncology', detail: 'NGS' },
  { name: 'KRAS wild-type', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'ALK rearrangement', category: 'Oncology', detail: 'FISH/IHC/NGS' },
  { name: 'ROS1 rearrangement', category: 'Oncology', detail: 'FISH/NGS' },
  { name: 'BRAF V600E', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'BRAF V600E/K', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'NTRK fusion', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'RET fusion', category: 'Oncology', detail: 'NGS' },
  { name: 'RET mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'MET exon 14 skipping', category: 'Oncology', detail: 'NGS' },
  { name: 'MET amplification', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'STK11 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'KEAP1 mutation', category: 'Oncology', detail: 'NGS' },
  // Oncology — Breast
  { name: 'HER2 (IHC 3+ / FISH+)', category: 'Oncology', detail: 'IHC/FISH' },
  { name: 'HER2-low (IHC 1+/2+)', category: 'Oncology', detail: 'IHC' },
  { name: 'ERBB2/HER2 amplification', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'BRCA1/2 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'ESR1 mutation', category: 'Oncology', detail: 'NGS/Liquid biopsy' },
  { name: 'PIK3CA mutation', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'PALB2 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'ATM mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'CDH1 mutation', category: 'Oncology', detail: 'NGS' },
  // Oncology — GI / GU / Other
  { name: 'NRAS mutation', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'FGFR alteration', category: 'Oncology', detail: 'NGS' },
  { name: 'IDH1/2 mutation', category: 'Oncology', detail: 'NGS/IHC' },
  { name: 'MSI-High / dMMR', category: 'Oncology', detail: 'IHC/NGS' },
  { name: 'TMB-High (≥10 mut/Mb)', category: 'Oncology', detail: 'NGS' },
  { name: 'TP53 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'CDKN2A deletion', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'MDM2 amplification', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'MYC amplification', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'TERT promoter mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'EBV status', category: 'Oncology', detail: 'ISH/IHC' },
  { name: 'HPV status', category: 'Oncology', detail: 'ISH/PCR' },
  // Hematology
  { name: 'BCR-ABL1 (Philadelphia+)', category: 'Hematology', detail: 'FISH/PCR' },
  { name: 'FLT3-ITD', category: 'Hematology', detail: 'NGS/PCR' },
  { name: 'FLT3-TKD', category: 'Hematology', detail: 'NGS/PCR' },
  { name: 'NPM1 mutation', category: 'Hematology', detail: 'NGS/PCR' },
  { name: 'CEBPA mutation', category: 'Hematology', detail: 'NGS' },
  { name: 'RUNX1 mutation', category: 'Hematology', detail: 'NGS' },
  { name: 'SF3B1 mutation', category: 'Hematology', detail: 'NGS' },
  { name: 'IGHV mutational status', category: 'Hematology', detail: 'Sanger/NGS' },
  { name: 'del(17p) / TP53 deletion', category: 'Hematology', detail: 'FISH' },
  { name: 't(14;18) BCL2', category: 'Hematology', detail: 'FISH' },
  { name: 'MYD88 L265P', category: 'Hematology', detail: 'AS-PCR/NGS' },
  { name: 'BTK C481S', category: 'Hematology', detail: 'NGS' },
  { name: 'Minimal Residual Disease (MRD)', category: 'Hematology', detail: 'Flow/NGS' },
  // Neuroscience
  { name: 'Amyloid PET positivity', category: 'Neuroscience', detail: 'PET imaging' },
  { name: 'Tau PET positivity', category: 'Neuroscience', detail: 'PET imaging' },
  { name: 'CSF p-tau/Abeta42 ratio', category: 'Neuroscience', detail: 'CSF assay' },
  { name: 'Plasma p-tau217', category: 'Neuroscience', detail: 'Blood assay' },
  { name: 'Neurofilament light (NfL)', category: 'Neuroscience', detail: 'Blood/CSF assay' },
  { name: 'Alpha-synuclein SAA', category: 'Neuroscience', detail: 'CSF assay' },
  // Pan-tumor
  { name: 'Tumor Mutational Burden', category: 'Pan-tumor', detail: 'WES/NGS panel' },
  { name: 'Circulating Tumor DNA (ctDNA)', category: 'Pan-tumor', detail: 'Liquid biopsy' },
  { name: 'Homologous Recombination Deficiency (HRD)', category: 'Pan-tumor', detail: 'NGS' },
  // Cardiology
  { name: 'Troponin I/T (high-sensitivity)', category: 'Cardiology', detail: 'Immunoassay' },
  { name: 'NT-proBNP / BNP', category: 'Cardiology', detail: 'Immunoassay' },
  { name: 'Lipoprotein(a) [Lp(a)]', category: 'Cardiology', detail: 'Blood assay' },
  { name: 'hs-CRP (high-sensitivity C-reactive protein)', category: 'Cardiology', detail: 'Blood assay' },
  { name: 'D-Dimer', category: 'Cardiology', detail: 'Blood assay' },
  // Metabolic / Endocrine
  { name: 'HbA1c (Glycated hemoglobin)', category: 'Metabolic', detail: 'Blood assay' },
  { name: 'Fasting insulin / HOMA-IR', category: 'Metabolic', detail: 'Blood assay' },
  { name: 'GLP-1 receptor expression', category: 'Metabolic', detail: 'IHC' },
  { name: 'FGF21', category: 'Metabolic', detail: 'Blood assay' },
  { name: 'ELF Score (Enhanced Liver Fibrosis)', category: 'Metabolic', detail: 'Blood panel' },
  // Autoimmune / Inflammatory
  { name: 'Anti-CCP (Anti-citrullinated peptide)', category: 'Autoimmune', detail: 'Immunoassay' },
  { name: 'ANA (Antinuclear antibody)', category: 'Autoimmune', detail: 'Immunofluorescence' },
  { name: 'IL-6 / IL-17 / TNF-alpha', category: 'Autoimmune', detail: 'ELISA' },
  { name: 'Calprotectin (fecal)', category: 'Autoimmune', detail: 'ELISA' },
  // Infectious Disease
  { name: 'HIV-1 RNA viral load', category: 'Infectious Disease', detail: 'PCR' },
  { name: 'HBV DNA / HCV RNA', category: 'Infectious Disease', detail: 'PCR' },
  { name: 'Procalcitonin (PCT)', category: 'Infectious Disease', detail: 'Immunoassay' },
  { name: 'SARS-CoV-2 antigen/PCR', category: 'Infectious Disease', detail: 'Lateral flow/PCR' },
  // Reproductive / Women's Health
  { name: 'AMH (Anti-Mullerian Hormone)', category: 'Reproductive', detail: 'Immunoassay' },
  { name: 'NIPT (cell-free fetal DNA)', category: 'Reproductive', detail: 'NGS' },
  { name: 'HPV genotyping (high-risk types)', category: 'Reproductive', detail: 'PCR/NGS' },
  // Renal
  { name: 'Cystatin C', category: 'Renal', detail: 'Blood assay' },
  { name: 'NGAL (Neutrophil Gelatinase-Associated Lipocalin)', category: 'Renal', detail: 'Immunoassay' },
  { name: 'Kidney Injury Molecule-1 (KIM-1)', category: 'Renal', detail: 'Blood/urine assay' },
];

export const POPULAR_BIOMARKERS = [
  'PD-L1 (TPS ≥1%)',
  'EGFR exon 19 deletion',
  'KRAS G12C',
  'HER2 (IHC 3+ / FISH+)',
  'NT-proBNP / BNP',
  'Troponin I/T (high-sensitivity)',
];

// ── Biomarker Prevalence Auto-Fill (CDx form) ───────────────

export const BIOMARKER_PREVALENCE: Record<string, { prevalence_pct: number; context: string }> = {
  // Immunotherapy
  'PD-L1 (TPS ≥1%)': { prevalence_pct: 60, context: 'NSCLC' },
  'PD-L1 (CPS ≥10)': { prevalence_pct: 40, context: 'Gastric / H&N / Urothelial' },
  'PD-L1 (IC ≥1%)': { prevalence_pct: 25, context: 'Urothelial carcinoma' },
  // Oncology — Lung
  'EGFR exon 19 deletion': { prevalence_pct: 10, context: 'NSCLC' },
  'EGFR L858R': { prevalence_pct: 5, context: 'NSCLC' },
  'EGFR T790M': { prevalence_pct: 50, context: 'EGFR+ NSCLC after TKI' },
  'EGFR exon 20 insertion': { prevalence_pct: 2, context: 'NSCLC' },
  'KRAS G12C': { prevalence_pct: 13, context: 'NSCLC' },
  'KRAS G12D': { prevalence_pct: 4, context: 'NSCLC / PDAC' },
  'ALK rearrangement': { prevalence_pct: 5, context: 'NSCLC' },
  'ROS1 rearrangement': { prevalence_pct: 2, context: 'NSCLC' },
  'BRAF V600E': { prevalence_pct: 2, context: 'NSCLC / Melanoma (50%)' },
  'NTRK fusion': { prevalence_pct: 1, context: 'Pan-tumor' },
  'RET fusion': { prevalence_pct: 2, context: 'NSCLC / Thyroid' },
  'MET exon 14 skipping': { prevalence_pct: 3, context: 'NSCLC' },
  'MET amplification': { prevalence_pct: 5, context: 'NSCLC / Gastric' },
  // Oncology — Breast
  'HER2 (IHC 3+ / FISH+)': { prevalence_pct: 20, context: 'Breast cancer' },
  'HER2-low (IHC 1+/2+)': { prevalence_pct: 55, context: 'Breast cancer' },
  'BRCA1/2 mutation': { prevalence_pct: 15, context: 'Ovarian / Breast cancer' },
  'ESR1 mutation': { prevalence_pct: 30, context: 'HR+ mBC after AI' },
  'PIK3CA mutation': { prevalence_pct: 40, context: 'HR+/HER2- breast cancer' },
  // Oncology — GI / GU
  'KRAS wild-type': { prevalence_pct: 45, context: 'Colorectal cancer' },
  'MSI-High / dMMR': { prevalence_pct: 15, context: 'Colorectal / Endometrial' },
  'TMB-High (≥10 mut/Mb)': { prevalence_pct: 10, context: 'Pan-tumor' },
  'FGFR alteration': { prevalence_pct: 20, context: 'Bladder cancer' },
  'IDH1/2 mutation': { prevalence_pct: 20, context: 'AML / Glioma' },
  // Hematology
  'BCR-ABL1 (Philadelphia+)': { prevalence_pct: 95, context: 'CML' },
  'FLT3-ITD': { prevalence_pct: 25, context: 'AML' },
  'FLT3-TKD': { prevalence_pct: 8, context: 'AML' },
  'NPM1 mutation': { prevalence_pct: 30, context: 'AML' },
  'CEBPA biallelic mutation': { prevalence_pct: 6, context: 'AML' },
  'SF3B1 mutation': { prevalence_pct: 25, context: 'MDS / CLL' },
  'IGHV unmutated': { prevalence_pct: 40, context: 'CLL' },
  'MYD88 L265P': { prevalence_pct: 90, context: 'Waldenström macroglobulinemia' },
  'TP53 mutation/deletion': { prevalence_pct: 10, context: 'CLL / AML / MDS' },
  // Oncology — GI (additional)
  'NRAS mutation': { prevalence_pct: 5, context: 'Colorectal cancer' },
  'BRAF V600E (CRC)': { prevalence_pct: 8, context: 'Colorectal cancer' },
  'HER2 amplification (GI)': { prevalence_pct: 15, context: 'Gastric / GEJ cancer' },
  'Claudin 18.2': { prevalence_pct: 38, context: 'Gastric / GEJ cancer' },
  // Oncology — Prostate / GU
  'BRCA1/2 (prostate)': { prevalence_pct: 12, context: 'mCRPC' },
  'ATM mutation': { prevalence_pct: 6, context: 'mCRPC / Pancreatic' },
  'PALB2 mutation': { prevalence_pct: 3, context: 'Breast / Pancreatic cancer' },
  'AR-V7 splice variant': { prevalence_pct: 30, context: 'mCRPC after abiraterone/enzalutamide' },
  // Oncology — Melanoma / Other
  'BRAF V600E/K (melanoma)': { prevalence_pct: 50, context: 'Melanoma' },
  'CDKN2A loss': { prevalence_pct: 30, context: 'Melanoma / NSCLC' },
  'TERT promoter mutation': { prevalence_pct: 60, context: 'Glioblastoma / Melanoma' },
  // Oncology — Lung (additional)
  'STK11/LKB1 mutation': { prevalence_pct: 15, context: 'NSCLC' },
  'KEAP1 mutation': { prevalence_pct: 12, context: 'NSCLC (IO resistance)' },
  'HER2 mutation (NSCLC)': { prevalence_pct: 3, context: 'NSCLC' },
  // Neuroscience
  'Amyloid PET positivity': { prevalence_pct: 35, context: 'MCI / early Alzheimer\'s' },
  'Plasma p-tau217': { prevalence_pct: 35, context: 'Alzheimer\'s disease' },
  'NfL (neurofilament light)': { prevalence_pct: 100, context: 'MS / ALS monitoring' },
  'CSF amyloid-beta 42/40 ratio': { prevalence_pct: 35, context: 'Alzheimer\'s disease' },
  // Cardiology
  'Troponin I/T (high-sensitivity)': { prevalence_pct: 30, context: 'Chest pain presentations' },
  'NT-proBNP / BNP': { prevalence_pct: 50, context: 'Heart failure suspected' },
  'Lipoprotein(a) [Lp(a)]': { prevalence_pct: 20, context: 'Elevated CV risk (>50 mg/dL)' },
  'hs-CRP': { prevalence_pct: 25, context: 'CV inflammation (elevated >2 mg/L)' },
  'D-Dimer': { prevalence_pct: 100, context: 'PE/DVT rule-out (universal test)' },
  // Metabolic / Endocrine
  'HbA1c (Glycated hemoglobin)': { prevalence_pct: 100, context: 'Diabetes (universal screen)' },
  'Fasting insulin / HOMA-IR': { prevalence_pct: 40, context: 'Insulin resistance screening' },
  'GLP-1 receptor expression': { prevalence_pct: 60, context: 'T2D islet cells' },
  'FGF21': { prevalence_pct: 100, context: 'NASH/metabolic dysfunction (research)' },
  'ELF Score': { prevalence_pct: 100, context: 'Liver fibrosis screening (universal test)' },
  // Autoimmune / Inflammatory
  'Anti-CCP (anti-citrullinated peptide)': { prevalence_pct: 70, context: 'Rheumatoid arthritis' },
  'ANA (Antinuclear antibody)': { prevalence_pct: 95, context: 'Lupus (SLE)' },
  'Calprotectin (fecal)': { prevalence_pct: 100, context: 'IBD activity monitoring' },
  'IL-6': { prevalence_pct: 100, context: 'Systemic inflammation (universal marker)' },
  // Infectious Disease
  'HIV-1 RNA viral load': { prevalence_pct: 100, context: 'HIV-positive patients' },
  'HBV DNA / HCV RNA': { prevalence_pct: 100, context: 'Hepatitis-positive patients' },
  'Procalcitonin (PCT)': { prevalence_pct: 100, context: 'Sepsis / bacterial infection' },
  'SARS-CoV-2 antigen/PCR': { prevalence_pct: 100, context: 'COVID-19 testing' },
  // Reproductive / Women's Health
  'HPV genotyping (high-risk types)': { prevalence_pct: 10, context: 'Cervical screening population' },
  'NIPT (cell-free fetal DNA)': { prevalence_pct: 100, context: 'Prenatal (universal option)' },
  'AMH (Anti-Müllerian Hormone)': { prevalence_pct: 100, context: 'Ovarian reserve assessment' },
  // Renal
  'Cystatin C': { prevalence_pct: 100, context: 'GFR estimation (CKD)' },
  'NGAL': { prevalence_pct: 100, context: 'Acute kidney injury (early marker)' },
  'KIM-1 (Kidney Injury Molecule-1)': { prevalence_pct: 100, context: 'Renal tubular injury' },
};

// ── CDx Drug Linkage Matrix ─────────────────────────────────
// Maps biomarker → linked drug(s) → eligible population → revenue model.
// Critical for CDx market sizing: test volume tied to drug-eligible patients.

export interface CDxDrugLinkage {
  biomarker: string;
  linked_drug: string;
  drug_company: string;
  drug_wac_annual_usd: number;
  primary_indication: string;
  eligible_patient_pct: number;       // % of indication patients with this biomarker
  us_eligible_patients_yr: number;    // Annual US patients eligible for testing
  fda_cdx_approved: boolean;
  cdx_approval_year: number | null;
  approved_cdx_test: string | null;   // e.g., "Guardant360 CDx", "FoundationOne CDx"
  testing_rate_pct: number;           // Current % of eligible patients actually tested
  test_reimbursement_usd: number;     // Per-test reimbursement (CMS/commercial blended)
  regulatory_co_submission: boolean;
}

export const CDX_DRUG_LINKAGE: CDxDrugLinkage[] = [
  // ── NSCLC Biomarkers ──
  {
    biomarker: 'EGFR exon 19 deletion',
    linked_drug: 'Tagrisso (osimertinib)',
    drug_company: 'AstraZeneca',
    drug_wac_annual_usd: 192000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 10,
    us_eligible_patients_yr: 23600,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'cobas EGFR Mutation Test v2 (Roche)',
    testing_rate_pct: 85,
    test_reimbursement_usd: 450,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'EGFR L858R',
    linked_drug: 'Tagrisso (osimertinib)',
    drug_company: 'AstraZeneca',
    drug_wac_annual_usd: 192000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 5,
    us_eligible_patients_yr: 11800,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'cobas EGFR Mutation Test v2 (Roche)',
    testing_rate_pct: 85,
    test_reimbursement_usd: 450,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'EGFR T790M',
    linked_drug: 'Tagrisso (osimertinib) — 2L',
    drug_company: 'AstraZeneca',
    drug_wac_annual_usd: 192000,
    primary_indication: 'EGFR+ NSCLC after TKI',
    eligible_patient_pct: 50,
    us_eligible_patients_yr: 11800,
    fda_cdx_approved: true,
    cdx_approval_year: 2017,
    approved_cdx_test: 'Guardant360 CDx (liquid biopsy)',
    testing_rate_pct: 75,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'KRAS G12C',
    linked_drug: 'Lumakras (sotorasib)',
    drug_company: 'Amgen',
    drug_wac_annual_usd: 178000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 13,
    us_eligible_patients_yr: 30700,
    fda_cdx_approved: true,
    cdx_approval_year: 2021,
    approved_cdx_test: 'QIAGEN therascreen KRAS RGQ PCR Kit',
    testing_rate_pct: 80,
    test_reimbursement_usd: 350,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'ALK rearrangement',
    linked_drug: 'Alecensa (alectinib)',
    drug_company: 'Roche/Genentech',
    drug_wac_annual_usd: 178000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 5,
    us_eligible_patients_yr: 11800,
    fda_cdx_approved: true,
    cdx_approval_year: 2017,
    approved_cdx_test: 'VENTANA ALK (D5F3) CDx Assay (Roche)',
    testing_rate_pct: 85,
    test_reimbursement_usd: 350,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'ROS1 rearrangement',
    linked_drug: 'Xalkori (crizotinib)',
    drug_company: 'Pfizer',
    drug_wac_annual_usd: 167000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 2,
    us_eligible_patients_yr: 4720,
    fda_cdx_approved: true,
    cdx_approval_year: 2016,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 80,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: false,
  },
  {
    biomarker: 'MET exon 14 skipping',
    linked_drug: 'Tabrecta (capmatinib)',
    drug_company: 'Novartis',
    drug_wac_annual_usd: 195000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 3,
    us_eligible_patients_yr: 7080,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 70,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'RET fusion',
    linked_drug: 'Retevmo (selpercatinib)',
    drug_company: 'Eli Lilly',
    drug_wac_annual_usd: 198000,
    primary_indication: 'NSCLC / Thyroid',
    eligible_patient_pct: 2,
    us_eligible_patients_yr: 4720,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 70,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'NTRK fusion',
    linked_drug: 'Vitrakvi (larotrectinib)',
    drug_company: 'Bayer',
    drug_wac_annual_usd: 396000,
    primary_indication: 'Pan-tumor (solid tumors)',
    eligible_patient_pct: 1,
    us_eligible_patients_yr: 3000,
    fda_cdx_approved: true,
    cdx_approval_year: 2018,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 65,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: false,
  },
  // ── Breast Cancer Biomarkers ──
  {
    biomarker: 'HER2 (IHC 3+ / FISH+)',
    linked_drug: 'Herceptin (trastuzumab)',
    drug_company: 'Roche/Genentech',
    drug_wac_annual_usd: 72000,
    primary_indication: 'Breast cancer',
    eligible_patient_pct: 20,
    us_eligible_patients_yr: 57400,
    fda_cdx_approved: true,
    cdx_approval_year: 1998,
    approved_cdx_test: 'HercepTest (Dako/Agilent)',
    testing_rate_pct: 95,
    test_reimbursement_usd: 180,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'HER2-low (IHC 1+/2+)',
    linked_drug: 'Enhertu (T-DXd)',
    drug_company: 'Daiichi Sankyo / AstraZeneca',
    drug_wac_annual_usd: 215000,
    primary_indication: 'Breast cancer',
    eligible_patient_pct: 55,
    us_eligible_patients_yr: 157850,
    fda_cdx_approved: true,
    cdx_approval_year: 2022,
    approved_cdx_test: 'VENTANA PATHWAY HER2 (4B5)',
    testing_rate_pct: 90,
    test_reimbursement_usd: 180,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'BRCA1/2 mutation',
    linked_drug: 'Lynparza (olaparib)',
    drug_company: 'AstraZeneca',
    drug_wac_annual_usd: 155000,
    primary_indication: 'Ovarian / Breast cancer',
    eligible_patient_pct: 15,
    us_eligible_patients_yr: 46000,
    fda_cdx_approved: true,
    cdx_approval_year: 2014,
    approved_cdx_test: 'BRACAnalysis CDx (Myriad Genetics)',
    testing_rate_pct: 80,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'PIK3CA mutation',
    linked_drug: 'Piqray (alpelisib)',
    drug_company: 'Novartis',
    drug_wac_annual_usd: 143000,
    primary_indication: 'HR+/HER2- breast cancer',
    eligible_patient_pct: 40,
    us_eligible_patients_yr: 56000,
    fda_cdx_approved: true,
    cdx_approval_year: 2019,
    approved_cdx_test: 'therascreen PIK3CA RGQ PCR Kit (QIAGEN)',
    testing_rate_pct: 70,
    test_reimbursement_usd: 350,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'ESR1 mutation',
    linked_drug: 'Orserdu (elacestrant)',
    drug_company: 'Stemline / Menarini',
    drug_wac_annual_usd: 130000,
    primary_indication: 'HR+ mBC after AI',
    eligible_patient_pct: 30,
    us_eligible_patients_yr: 20000,
    fda_cdx_approved: true,
    cdx_approval_year: 2023,
    approved_cdx_test: 'Guardant360 CDx',
    testing_rate_pct: 60,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  // ── Immunotherapy (Pan-Tumor) ──
  {
    biomarker: 'PD-L1 (TPS ≥1%)',
    linked_drug: 'Keytruda (pembrolizumab)',
    drug_company: 'Merck',
    drug_wac_annual_usd: 191000,
    primary_indication: 'NSCLC',
    eligible_patient_pct: 60,
    us_eligible_patients_yr: 141600,
    fda_cdx_approved: true,
    cdx_approval_year: 2015,
    approved_cdx_test: 'PD-L1 IHC 22C3 pharmDx (Dako/Agilent)',
    testing_rate_pct: 90,
    test_reimbursement_usd: 250,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'MSI-High / dMMR',
    linked_drug: 'Keytruda (pembrolizumab)',
    drug_company: 'Merck',
    drug_wac_annual_usd: 191000,
    primary_indication: 'Colorectal / Pan-tumor',
    eligible_patient_pct: 15,
    us_eligible_patients_yr: 22500,
    fda_cdx_approved: true,
    cdx_approval_year: 2017,
    approved_cdx_test: 'VENTANA MMR IHC Panel / MSI by PCR',
    testing_rate_pct: 85,
    test_reimbursement_usd: 300,
    regulatory_co_submission: false,
  },
  {
    biomarker: 'TMB-High (≥10 mut/Mb)',
    linked_drug: 'Keytruda (pembrolizumab)',
    drug_company: 'Merck',
    drug_wac_annual_usd: 191000,
    primary_indication: 'Pan-tumor',
    eligible_patient_pct: 10,
    us_eligible_patients_yr: 50000,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 60,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  // ── GI / GU Oncology ──
  {
    biomarker: 'FGFR alteration',
    linked_drug: 'Pemazyre (pemigatinib)',
    drug_company: 'Incyte',
    drug_wac_annual_usd: 230000,
    primary_indication: 'Cholangiocarcinoma / Bladder',
    eligible_patient_pct: 20,
    us_eligible_patients_yr: 16000,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 65,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
  {
    biomarker: 'IDH1/2 mutation',
    linked_drug: 'Tibsovo (ivosidenib)',
    drug_company: 'Servier',
    drug_wac_annual_usd: 280000,
    primary_indication: 'AML / Glioma / Cholangiocarcinoma',
    eligible_patient_pct: 20,
    us_eligible_patients_yr: 4000,
    fda_cdx_approved: true,
    cdx_approval_year: 2018,
    approved_cdx_test: 'Abbott RealTime IDH1 Assay',
    testing_rate_pct: 75,
    test_reimbursement_usd: 350,
    regulatory_co_submission: true,
  },
  // ── Hematology ──
  {
    biomarker: 'BCR-ABL1 (Philadelphia+)',
    linked_drug: 'Gleevec (imatinib) / Sprycel / Tasigna',
    drug_company: 'Novartis / BMS',
    drug_wac_annual_usd: 120000,
    primary_indication: 'CML',
    eligible_patient_pct: 95,
    us_eligible_patients_yr: 9000,
    fda_cdx_approved: true,
    cdx_approval_year: 2001,
    approved_cdx_test: 'BCR-ABL1 quantitative PCR (multiple labs)',
    testing_rate_pct: 98,
    test_reimbursement_usd: 300,
    regulatory_co_submission: false,
  },
  {
    biomarker: 'FLT3-ITD',
    linked_drug: 'Xospata (gilteritinib)',
    drug_company: 'Astellas',
    drug_wac_annual_usd: 280000,
    primary_indication: 'AML',
    eligible_patient_pct: 25,
    us_eligible_patients_yr: 5000,
    fda_cdx_approved: true,
    cdx_approval_year: 2018,
    approved_cdx_test: 'LeukoStrat CDx FLT3 Mutation Assay (Invivoscribe)',
    testing_rate_pct: 90,
    test_reimbursement_usd: 350,
    regulatory_co_submission: true,
  },
  // ── Melanoma ──
  {
    biomarker: 'BRAF V600E/K (melanoma)',
    linked_drug: 'Tafinlar + Mekinist (dabrafenib/trametinib)',
    drug_company: 'Novartis',
    drug_wac_annual_usd: 240000,
    primary_indication: 'Melanoma',
    eligible_patient_pct: 50,
    us_eligible_patients_yr: 50000,
    fda_cdx_approved: true,
    cdx_approval_year: 2013,
    approved_cdx_test: 'THxID BRAF Kit (bioMérieux)',
    testing_rate_pct: 92,
    test_reimbursement_usd: 250,
    regulatory_co_submission: true,
  },
  // ── Prostate ──
  {
    biomarker: 'BRCA1/2 (prostate)',
    linked_drug: 'Lynparza (olaparib)',
    drug_company: 'AstraZeneca',
    drug_wac_annual_usd: 155000,
    primary_indication: 'mCRPC',
    eligible_patient_pct: 12,
    us_eligible_patients_yr: 4200,
    fda_cdx_approved: true,
    cdx_approval_year: 2020,
    approved_cdx_test: 'FoundationOne CDx',
    testing_rate_pct: 65,
    test_reimbursement_usd: 3500,
    regulatory_co_submission: true,
  },
];

// ── Patient Segment / Line of Therapy ────────────────────────

export const PATIENT_SEGMENT_SUGGESTIONS: SuggestionItem[] = [
  // Line of therapy
  { name: '1L treatment-naive', category: 'Line of therapy' },
  { name: '1L maintenance', category: 'Line of therapy' },
  { name: '1L + maintenance continuation', category: 'Line of therapy' },
  { name: '2L after prior immunotherapy', category: 'Line of therapy' },
  { name: '2L after prior chemotherapy', category: 'Line of therapy' },
  { name: '2L after TKI failure', category: 'Line of therapy' },
  { name: '2L+ after platinum-based chemotherapy', category: 'Line of therapy' },
  { name: '3L+ heavily pretreated', category: 'Line of therapy' },
  { name: '3L+ after IO + chemo', category: 'Line of therapy' },
  // Setting
  { name: 'Adjuvant (post-surgery)', category: 'Setting' },
  { name: 'Neoadjuvant (pre-surgery)', category: 'Setting' },
  { name: 'Perioperative', category: 'Setting' },
  { name: 'Maintenance after induction', category: 'Setting' },
  { name: 'Consolidation after induction', category: 'Setting' },
  { name: 'Switch maintenance', category: 'Setting' },
  { name: 'Post-transplant maintenance', category: 'Setting' },
  { name: 'Post-CAR-T', category: 'Setting' },
  { name: 'Relapsed/refractory', category: 'Setting' },
  { name: 'Newly diagnosed', category: 'Setting' },
  { name: 'Treatment-experienced, IO-naive', category: 'Setting' },
  { name: 'IO-refractory', category: 'Setting' },
  // Stage / Disease characteristics
  { name: 'Metastatic', category: 'Stage' },
  { name: 'Locally advanced unresectable', category: 'Stage' },
  { name: 'Early stage (resectable)', category: 'Stage' },
  { name: 'High-risk resected', category: 'Stage' },
  { name: 'MRD-positive', category: 'Stage' },
  { name: 'Oligometastatic', category: 'Stage' },
  { name: 'Brain metastases', category: 'Stage' },
  { name: 'Liver metastases', category: 'Stage' },
  { name: 'Bone-only metastases', category: 'Stage' },
  { name: 'De novo metastatic', category: 'Stage' },
  // Selection / Biomarker
  { name: 'Biomarker-selected population', category: 'Selection' },
  { name: 'All-comers (biomarker-unselected)', category: 'Selection' },
  { name: 'PD-L1 high (TPS ≥50%)', category: 'Selection' },
  // Population
  { name: 'Pediatric population', category: 'Population' },
  { name: 'Elderly (≥65 years)', category: 'Population' },
  { name: 'ECOG 0-1 (good performance status)', category: 'Population' },
  { name: 'ECOG 2+ / frail', category: 'Population' },
  { name: 'Comorbid (CKD, hepatic impairment)', category: 'Population' },
];

export const POPULAR_SEGMENTS = [
  '1L treatment-naive',
  '2L+ after platinum-based chemotherapy',
  'Relapsed/refractory',
  'Adjuvant (post-surgery)',
  'Metastatic',
  'Biomarker-selected population',
];
