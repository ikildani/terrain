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

function buildSpecialtySuggestions(): SuggestionItem[] {
  const specialties = new Set<string>();
  for (const p of PROCEDURE_VOLUME_DATA) {
    if (p.physician_specialty) {
      for (const s of p.physician_specialty) specialties.add(s);
    }
  }
  return Array.from(specialties)
    .sort()
    .map((name) => ({ name }));
}

export const SPECIALTY_SUGGESTIONS: SuggestionItem[] = buildSpecialtySuggestions();

// ── Biomarker Suggestions (CDx form) ─────────────────────────

export const BIOMARKER_SUGGESTIONS: SuggestionItem[] = [
  { name: 'PD-L1 (TPS ≥1%)', category: 'Immunotherapy', detail: 'IHC 22C3' },
  { name: 'PD-L1 (CPS ≥10)', category: 'Immunotherapy', detail: 'IHC 22C3' },
  { name: 'EGFR exon 19 deletion', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'EGFR L858R', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'EGFR T790M', category: 'Oncology', detail: 'NGS/Liquid biopsy' },
  { name: 'KRAS G12C', category: 'Oncology', detail: 'NGS' },
  { name: 'KRAS G12D', category: 'Oncology', detail: 'NGS' },
  { name: 'ALK rearrangement', category: 'Oncology', detail: 'FISH/IHC/NGS' },
  { name: 'ROS1 rearrangement', category: 'Oncology', detail: 'FISH/NGS' },
  { name: 'BRAF V600E', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'NTRK fusion', category: 'Oncology', detail: 'NGS/FISH' },
  { name: 'RET fusion', category: 'Oncology', detail: 'NGS' },
  { name: 'MET exon 14 skipping', category: 'Oncology', detail: 'NGS' },
  { name: 'HER2 (IHC 3+ / FISH+)', category: 'Oncology', detail: 'IHC/FISH' },
  { name: 'HER2-low (IHC 1+/2+)', category: 'Oncology', detail: 'IHC' },
  { name: 'BRCA1/2 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'MSI-High / dMMR', category: 'Oncology', detail: 'IHC/NGS' },
  { name: 'TMB-High (≥10 mut/Mb)', category: 'Oncology', detail: 'NGS' },
  { name: 'PIK3CA mutation', category: 'Oncology', detail: 'NGS/PCR' },
  { name: 'FGFR alteration', category: 'Oncology', detail: 'NGS' },
  { name: 'IDH1/2 mutation', category: 'Oncology', detail: 'NGS/IHC' },
  { name: 'BCR-ABL1 (Philadelphia+)', category: 'Hematology', detail: 'FISH/PCR' },
  { name: 'FLT3-ITD', category: 'Hematology', detail: 'NGS/PCR' },
  { name: 'NPM1 mutation', category: 'Hematology', detail: 'NGS/PCR' },
  { name: 'TP53 mutation', category: 'Oncology', detail: 'NGS' },
  { name: 'Tumor Mutational Burden', category: 'Pan-tumor', detail: 'WES/NGS panel' },
  { name: 'Circulating Tumor DNA (ctDNA)', category: 'Pan-tumor', detail: 'Liquid biopsy' },
  { name: 'Minimal Residual Disease (MRD)', category: 'Hematology', detail: 'Flow/NGS' },
];

export const POPULAR_BIOMARKERS = [
  'PD-L1 (TPS ≥1%)',
  'EGFR exon 19 deletion',
  'KRAS G12C',
  'HER2 (IHC 3+ / FISH+)',
  'BRCA1/2 mutation',
  'ALK rearrangement',
];

// ── Patient Segment / Line of Therapy ────────────────────────

export const PATIENT_SEGMENT_SUGGESTIONS: SuggestionItem[] = [
  { name: '1L treatment-naive', category: 'Line of therapy' },
  { name: '1L maintenance', category: 'Line of therapy' },
  { name: '2L after prior immunotherapy', category: 'Line of therapy' },
  { name: '2L after prior chemotherapy', category: 'Line of therapy' },
  { name: '2L+ after platinum-based chemotherapy', category: 'Line of therapy' },
  { name: '3L+ heavily pretreated', category: 'Line of therapy' },
  { name: 'Adjuvant (post-surgery)', category: 'Setting' },
  { name: 'Neoadjuvant (pre-surgery)', category: 'Setting' },
  { name: 'Perioperative', category: 'Setting' },
  { name: 'Maintenance after induction', category: 'Setting' },
  { name: 'Relapsed/refractory', category: 'Setting' },
  { name: 'Newly diagnosed', category: 'Setting' },
  { name: 'Metastatic', category: 'Stage' },
  { name: 'Locally advanced unresectable', category: 'Stage' },
  { name: 'Early stage (resectable)', category: 'Stage' },
  { name: 'Biomarker-selected population', category: 'Selection' },
  { name: 'Pediatric population', category: 'Population' },
  { name: 'Elderly (≥65 years)', category: 'Population' },
];

export const POPULAR_SEGMENTS = [
  '1L treatment-naive',
  '2L+ after platinum-based chemotherapy',
  'Relapsed/refractory',
  'Adjuvant (post-surgery)',
  'Metastatic',
  'Biomarker-selected population',
];
