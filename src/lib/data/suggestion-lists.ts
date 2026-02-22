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
  'NPM1 mutation': { prevalence_pct: 30, context: 'AML' },
  // Neuroscience
  'Amyloid PET positivity': { prevalence_pct: 35, context: 'MCI / early Alzheimer\'s' },
  'Plasma p-tau217': { prevalence_pct: 35, context: 'Alzheimer\'s disease' },
  // Cardiology
  'Troponin I/T (high-sensitivity)': { prevalence_pct: 30, context: 'Chest pain presentations' },
  'NT-proBNP / BNP': { prevalence_pct: 50, context: 'Heart failure suspected' },
  // Metabolic
  'HbA1c (Glycated hemoglobin)': { prevalence_pct: 100, context: 'Diabetes (universal screen)' },
  // Infectious Disease
  'HIV-1 RNA viral load': { prevalence_pct: 100, context: 'HIV-positive patients' },
  'HBV DNA / HCV RNA': { prevalence_pct: 100, context: 'Hepatitis-positive patients' },
  // Reproductive
  'HPV genotyping (high-risk types)': { prevalence_pct: 10, context: 'Cervical screening population' },
  'NIPT (cell-free fetal DNA)': { prevalence_pct: 100, context: 'Prenatal (universal option)' },
};

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
