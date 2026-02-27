// ============================================================
// TERRAIN — BIO Convention 2025 Competitor Data
// lib/data/competitor-data-bio.ts
//
// Assets sourced from BIO International Convention 2025 partnering
// database. Mapped to Terrain's competitive intelligence format.
// Covers early-stage and mid-stage pipeline assets across oncology,
// neurology, rare disease, cardio-metabolic, immunology, and more.
//
// Source: BIO Convention 2025 Asset Database
// Last updated: 2025-06-01
// ============================================================

import type { CompetitorRecord } from './competitor-database';

export const BIO_COMPETITORS: CompetitorRecord[] = [
  // ══════════════════════════════════════════════════════════
  // ONCOLOGY
  // ══════════════════════════════════════════════════════════

  // ── SV-101 (Syncromune) ─────────────────────────────────
  {
    asset_name: 'SV-101',
    company: 'Syncromune',
    indication: 'Non-Small Cell Lung Cancer',
    indication_specifics:
      'Metastatic lung cancer; immunotherapy-based approach using immune recognition receptor antagonism',
    mechanism: 'Immune recognition receptor antagonist antibody designed to enhance anti-tumor immune surveillance',
    mechanism_category: 'immune_checkpoint',
    phase: 'Phase 1',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Novel immunological approach targeting immune recognition receptors in NSCLC',
      'Unpartnered — potential acquisition or licensing target for larger immuno-oncology players',
      'Addresses massive addressable market in metastatic lung cancer',
    ],
    weaknesses: [
      'Early Phase 1 with no disclosed clinical data; high attrition risk at this stage',
      'Crowded checkpoint/IO landscape in NSCLC with multiple approved agents',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RB-601 (Radiance Biopharma) — NSCLC ────────────────
  {
    asset_name: 'RB-601',
    company: 'Radiance Biopharma',
    indication: 'Non-Small Cell Lung Cancer',
    indication_specifics: 'cMET/EGFR-positive NSCLC; bispecific nano-ADC targeting dual oncogenic drivers',
    mechanism: 'First-in-man bispecific cMET/EGFR nano antibody-drug conjugate (nano-ADC)',
    mechanism_category: 'adc_bispecific',
    molecular_target: 'cMET/EGFR',
    phase: 'Phase 1',
    key_data: 'IIT: 100% ORR in 2 patients. Phase I/II: 66% disease control rate in 6 patients.',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: true,
    strengths: [
      'First-in-class bispecific nano-ADC with dual cMET/EGFR targeting — differentiated from monovalent ADCs',
      'Early signals of clinical activity (100% ORR in IIT, 66% DCR in Ph I/II)',
      'Biomarker-selected approach enables enriched patient population and higher response rates',
    ],
    weaknesses: [
      'Very small patient numbers (n=2 IIT, n=6 Ph I/II) — signals not yet statistically meaningful',
      'Unpartnered small company with potential funding constraints for larger registrational studies',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RB-601 (Radiance Biopharma) — Mesothelioma ─────────
  {
    asset_name: 'RB-601',
    company: 'Radiance Biopharma',
    indication: 'Mesothelioma',
    indication_specifics: 'Malignant mesothelioma; bispecific cMET/EGFR nano-ADC',
    mechanism: 'Bispecific cMET/EGFR nano antibody-drug conjugate',
    mechanism_category: 'adc_bispecific',
    molecular_target: 'cMET/EGFR',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Differentiated mechanism in a disease with severe unmet need and few approved therapies',
      'Platform potential across multiple cMET/EGFR-expressing solid tumors',
    ],
    weaknesses: [
      'No mesothelioma-specific clinical data disclosed',
      'Small company with limited resources for multi-indication clinical development',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RB-601 (Radiance Biopharma) — Pancreatic ───────────
  {
    asset_name: 'RB-601',
    company: 'Radiance Biopharma',
    indication: 'Pancreatic Ductal Adenocarcinoma',
    indication_specifics: 'Pancreatic cancer; bispecific nano-ADC approach targeting tumor stroma',
    mechanism: 'Bispecific nano antibody-drug conjugate targeting cMET/EGFR',
    mechanism_category: 'adc_bispecific',
    molecular_target: 'cMET/EGFR',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Addresses one of the most treatment-resistant solid tumors with near-zero 5-year survival',
      'Nano-ADC format may improve tumor penetration in dense pancreatic stroma',
    ],
    weaknesses: [
      'Pancreatic cancer has extremely high clinical failure rate across all modalities',
      'No pancreatic cancer-specific clinical data disclosed',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Pelareorep (Oncolytics Biotech) ────────────────────
  {
    asset_name: 'Pelareorep',
    company: 'Oncolytics Biotech',
    indication: 'Non-Small Cell Lung Cancer',
    indication_specifics:
      'Advanced/metastatic NSCLC; oncolytic reovirus immunotherapy to activate innate and adaptive immune responses',
    mechanism:
      'Oncolytic virus (reovirus) immunotherapy that selectively replicates in cancer cells, induces PD-L1 upregulation and immune cell infiltration',
    mechanism_category: 'oncolytic_virus',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class reovirus platform with unique dual mechanism: direct oncolysis plus immune activation',
      'Selective tumor replication spares normal tissue — favorable tolerability profile',
      'Strong scientific rationale for combination with checkpoint inhibitors (PD-L1 upregulation)',
    ],
    weaknesses: [
      'Oncolytic virus modality has historically faced manufacturing and delivery challenges',
      'Phase 2 in a crowded NSCLC landscape with multiple approved IO combinations',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Bizaxofusp (Medicenna) — Glioblastoma ──────────────
  {
    asset_name: 'Bizaxofusp',
    company: 'Medicenna Therapeutics',
    indication: 'Glioblastoma',
    indication_specifics: 'Recurrent glioblastoma (rGBM) and primary/metastatic CNS tumors; IL-4R targeted immunotoxin',
    mechanism: 'First-in-class IL-4 receptor targeted immunotoxin (cytokine-drug conjugate) for CNS tumors',
    mechanism_category: 'immunotoxin',
    molecular_target: 'IL-4R',
    phase: 'Phase 2',
    key_data:
      'Phase 2b: mOS 14.5 months vs 7.0 months SOC in difficult-to-treat rGBM. Orphan Drug + Fast Track status. FDA-endorsed Phase 3 trial design.',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Striking Phase 2b survival benefit (14.5 vs 7.0 months mOS) in rGBM — 2x improvement over SOC',
      'Orphan Drug status + Fast Track designation + FDA-endorsed Phase 3 design — clear regulatory path',
      'First-in-class mechanism with no direct competitors in IL-4R-targeted CNS immunotoxins',
    ],
    weaknesses: [
      'Seeking development and commercial partner — capital-intensive Phase 3 ahead with no partner secured',
      'GBM is a notoriously difficult indication with high attrition in late-stage trials',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── MDNA11 (Medicenna) — Melanoma ──────────────────────
  {
    asset_name: 'MDNA11',
    company: 'Medicenna Therapeutics',
    indication: 'Melanoma',
    indication_specifics:
      'Advanced/metastatic melanoma including ICI-resistant tumors; IL-2 super agonist monotherapy and combination with pembrolizumab',
    mechanism: 'Highly differentiated beta-only long-acting IL-2 super agonist-albumin fusion protein',
    mechanism_category: 'cytokine_therapy',
    molecular_target: 'IL-2R beta/gamma',
    phase: 'Phase 2',
    key_data:
      'ABILITY-1: ORR 29.4% monotherapy at >=60 ug/kg, 36% combo with pembrolizumab in ICI-resistant tumors. 50% ORR in MSI-H patients. No DLTs, no VLS.',
    nct_ids: ['NCT05086692'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Compelling ORR in ICI-resistant tumors where few options exist (29.4% mono, 36% combo)',
      'Beta-only selectivity avoids Treg expansion — differentiated from aldesleukin and competitors',
      'Excellent safety profile: no DLTs, no VLS, >90% TRAEs grade 1-2',
    ],
    weaknesses: [
      'Competitive IL-2 landscape with multiple engineered IL-2 programs from larger pharma',
      'Unpartnered — requires significant capital for registrational studies across multiple indications',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Elenagen (CureLab) — Ovarian Cancer ────────────────
  {
    asset_name: 'Elenagen',
    company: 'CureLab',
    indication: 'Ovarian Cancer',
    indication_specifics:
      'Platinum-resistant ovarian cancer; p62/SQSTM1 DNA vaccine as adjuvant to Doxil (planned partnership with NYU)',
    mechanism:
      'p62/SQSTM1 DNA therapeutic vaccine that reduces tumor grade, modifies intratumoral microenvironment, and restores chemosensitivity',
    mechanism_category: 'therapeutic_vaccine',
    molecular_target: 'p62/SQSTM1',
    phase: 'Phase 2',
    key_data:
      'Phase I/IIa: Stopped disease progression as monotherapy in terminal cancer patients. Restored chemotherapy sensitivity in all patients who had failed 5-8 prior lines.',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Unique mechanism: reverses tumor grade and restores chemosensitivity in heavily pretreated patients',
      'Demonstrated activity as monotherapy in terminal cancer patients across multiple tumor types',
      'Academic partnerships with Mount Sinai and NYU for Phase 2 expansion',
    ],
    weaknesses: [
      'Small Phase I/IIa study (27 patients) across heterogeneous tumor types — limited statistical power',
      'DNA vaccine modality faces regulatory and manufacturing complexity vs. simpler drug formats',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Elenagen (CureLab) — Breast Cancer ─────────────────
  {
    asset_name: 'Elenagen',
    company: 'CureLab',
    indication: 'Breast Cancer',
    indication_specifics:
      'Stage IV refractory triple-negative breast cancer; p62 DNA vaccine as adjuvant to checkpoint inhibitors and chemotherapy (planned with Mount Sinai)',
    mechanism: 'p62/SQSTM1 DNA therapeutic vaccine that modifies tumor microenvironment and restores chemosensitivity',
    mechanism_category: 'therapeutic_vaccine',
    molecular_target: 'p62/SQSTM1',
    phase: 'Phase 2',
    key_data:
      'Case study: 33% partial tumor regression and 19 weeks PFS in terminal TNBC patient after failing 21 chemo courses. Restored cognitive function and quality of life.',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Demonstrated chemosensitivity restoration in heavily pretreated TNBC — high unmet need',
      'Favorable safety profile with no serious adverse reactions in Phase I/IIa',
    ],
    weaknesses: [
      'Single case study in breast cancer — needs controlled Phase 2 data to validate signal',
      'TNBC is highly competitive with multiple IO/ADC combinations in development',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Elenagen (CureLab) — Pancreatic ────────────────────
  {
    asset_name: 'Elenagen',
    company: 'CureLab',
    indication: 'Pancreatic Ductal Adenocarcinoma',
    indication_specifics: 'Advanced pancreatic cancer; p62 DNA vaccine as adjuvant to standards of care',
    mechanism: 'p62/SQSTM1 DNA therapeutic vaccine targeting tumor microenvironment remodeling',
    mechanism_category: 'therapeutic_vaccine',
    molecular_target: 'p62/SQSTM1',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Platform vaccine approach with potential to restore chemosensitivity in pancreatic cancer',
      'Multi-indication Phase 2 program underway in Belarus and Brazil without additional funding',
    ],
    weaknesses: [
      'No pancreatic cancer-specific clinical data disclosed; extrapolating from mixed tumor Phase I/IIa',
      'Pancreatic cancer remains among the hardest indications with >95% clinical trial failure rate',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Elenagen (CureLab) — Melanoma ──────────────────────
  {
    asset_name: 'Elenagen',
    company: 'CureLab',
    indication: 'Melanoma',
    indication_specifics: 'Advanced melanoma; p62 DNA vaccine with observed disease cessation in Phase I/IIa',
    mechanism: 'p62/SQSTM1 DNA therapeutic vaccine enhancing intratumoral immune response',
    mechanism_category: 'therapeutic_vaccine',
    molecular_target: 'p62/SQSTM1',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Observed cessation of cancer progression in melanoma patients in Phase I/IIa',
      'Potential synergy with checkpoint inhibitors — enhances intratumoral immune response',
    ],
    weaknesses: [
      'Melanoma treatment landscape is highly competitive with multiple effective IO combinations',
      'Limited melanoma-specific patient numbers in Phase I/IIa; needs dedicated expansion cohort',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Stenoparib (Allarity) — Ovarian Cancer ─────────────
  {
    asset_name: 'Stenoparib',
    company: 'Allarity Therapeutics',
    indication: 'Ovarian Cancer',
    indication_specifics:
      'Advanced ovarian cancer with DRP companion diagnostic for patient selection; dual PARP/tankyrase inhibition',
    mechanism:
      'Dual PARP1/2 and tankyrase 1/2 inhibitor with dual tumor inhibitory action via DNA repair and Wnt/beta-catenin pathway',
    mechanism_category: 'parp_inhibitor',
    molecular_target: 'PARP1/2, Tankyrase 1/2',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: true,
    strengths: [
      'Dual PARP + tankyrase inhibition provides differentiated mechanism vs. single-target PARP inhibitors',
      'Validated DRP companion diagnostic for patient enrichment — precision medicine approach',
      'Oral administration with global exclusive rights (originally developed by Eisai)',
    ],
    weaknesses: [
      'Crowded PARP inhibitor landscape with olaparib, niraparib, and rucaparib already approved',
      'Must demonstrate superiority or differentiation vs. existing PARP inhibitors in ovarian cancer',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Chiauranib (Chipscreen) — Ovarian Cancer ───────────
  {
    asset_name: 'Chiauranib',
    company: 'Chipscreen Biosciences',
    indication: 'Ovarian Cancer',
    indication_specifics:
      'Phase 3 in ovarian cancer (China); multi-target kinase inhibitor (Aurora B/VEGFRs/CSF1R) with upcoming NDA submission',
    mechanism:
      'Multi-target kinase inhibitor targeting Aurora B, VEGFRs, and CSF1R — disrupts tumor microenvironment via three pathways',
    mechanism_category: 'multi_kinase_inhibitor',
    molecular_target: 'Aurora B/VEGFRs/CSF1R',
    phase: 'Phase 3',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Phase 3 completed in China with NDA submission upcoming — near-term regulatory catalyst',
      'Triple-pathway mechanism (Aurora B + VEGFR + CSF1R) differentiates from single-target kinase inhibitors',
      'Strong synergy with IO antibodies and chemotherapy — broad combination potential',
    ],
    weaknesses: [
      'Multi-kinase inhibitors typically carry toxicity burden — tolerability concerns in combination',
      'Phase 3 data in Chinese patient population may require bridging studies for US/EU approval',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Chiauranib (Chipscreen) — Pancreatic ────────────────
  {
    asset_name: 'Chiauranib',
    company: 'Chipscreen Biosciences',
    indication: 'Pancreatic Ductal Adenocarcinoma',
    indication_specifics: 'Phase 2 in pancreatic cancer; Aurora B/VEGFRs/CSF1R multi-kinase inhibitor',
    mechanism: 'Multi-target kinase inhibitor targeting Aurora B, VEGFRs, and CSF1R',
    mechanism_category: 'multi_kinase_inhibitor',
    molecular_target: 'Aurora B/VEGFRs/CSF1R',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Addresses critical unmet need in pancreatic cancer with a multi-pathway approach',
      'Backed by Phase 3 data in ovarian cancer — company has late-stage execution experience',
    ],
    weaknesses: [
      'Pancreatic cancer remains exceptionally difficult; multi-kinase inhibitors have historically underperformed here',
      'Phase 2 stage with no disclosed pancreatic-specific clinical results',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── OMTX705 (ONCOMATRYX) — NSCLC ──────────────────────
  {
    asset_name: 'OMTX705',
    company: 'ONCOMATRYX Biopharma',
    indication: 'Non-Small Cell Lung Cancer',
    indication_specifics:
      'Advanced solid tumors including NSCLC; first-in-class tenascin-C targeted stroma-directed ADC',
    mechanism: 'First-in-class antibody-drug conjugate targeting tenascin-C in the tumor stroma microenvironment',
    mechanism_category: 'adc',
    molecular_target: 'Tenascin-C',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class stroma-targeting ADC — fundamentally different from tumor cell-targeted ADCs',
      'Tenascin-C is broadly expressed across multiple solid tumor stroma — wide potential applicability',
      'Novel approach may overcome ADC resistance mechanisms that target tumor cell antigens',
    ],
    weaknesses: [
      'Phase 1 with no disclosed efficacy data — early-stage risk',
      'Stroma-directed approach is unvalidated in clinical setting; uncertain therapeutic index',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── OMTX705 (ONCOMATRYX) — Pancreatic ─────────────────
  {
    asset_name: 'OMTX705',
    company: 'ONCOMATRYX Biopharma',
    indication: 'Pancreatic Ductal Adenocarcinoma',
    indication_specifics:
      'Metastatic pancreatic cancer; stroma-directed tenascin-C ADC leveraging high stromal content of PDAC',
    mechanism: 'First-in-class antibody-drug conjugate targeting tenascin-C in tumor stroma',
    mechanism_category: 'adc',
    molecular_target: 'Tenascin-C',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Pancreatic cancer is highly stroma-dense — tenascin-C targeting may be uniquely suited for PDAC',
      'Differentiated from all other ADCs in pancreatic cancer development',
    ],
    weaknesses: [
      'No pancreatic cancer-specific clinical data; Phase 1 dose escalation stage',
      'Stroma-targeting ADC is a novel, unvalidated approach — regulatory pathway may require additional evidence',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RHB-107 (RedHill) — Breast Cancer ──────────────────
  {
    asset_name: 'RHB-107',
    generic_name: 'upamostat',
    company: 'RedHill Biopharma',
    indication: 'Breast Cancer',
    indication_specifics:
      'Metastatic breast cancer; first-in-class oral serine protease inhibitor targeting host-cell proteases involved in tumor progression',
    mechanism:
      'First-in-class oral serine protease inhibitor (upamostat) targeting host-cell proteases that facilitate tumor invasion and metastasis',
    mechanism_category: 'protease_inhibitor',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class oral serine protease inhibitor — novel mechanism distinct from standard cytotoxic or IO agents',
      'Well-tolerated in ~200 patients across multiple studies; once-daily oral dosing',
      'Multi-indication potential: same compound under evaluation in prostate, pancreatic, and GI cancers',
    ],
    weaknesses: [
      'Phase 2 stage with no disclosed breast cancer-specific efficacy data',
      'Host-directed protease inhibition is an unvalidated oncology mechanism — uncertain clinical translation',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RHB-107 (RedHill) — Prostate Cancer ────────────────
  {
    asset_name: 'RHB-107',
    generic_name: 'upamostat',
    company: 'RedHill Biopharma',
    indication: 'Prostate Cancer',
    indication_specifics: 'Metastatic prostate cancer; oral serine protease inhibitor',
    mechanism: 'Oral serine protease inhibitor targeting host-cell proteases involved in tumor invasion',
    mechanism_category: 'protease_inhibitor',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Novel mechanism complementary to existing AR-targeting agents in prostate cancer',
      'Oral once-daily dosing with established safety profile from prior clinical studies',
    ],
    weaknesses: [
      'Prostate cancer treatment landscape is highly mature with multiple approved agents',
      'No prostate cancer-specific efficacy readout disclosed',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RHB-107 (RedHill) — Pancreatic ─────────────────────
  {
    asset_name: 'RHB-107',
    generic_name: 'upamostat',
    company: 'RedHill Biopharma',
    indication: 'Pancreatic Ductal Adenocarcinoma',
    indication_specifics:
      'Metastatic pancreatic cancer; oral serine protease inhibitor targeting tumor invasion machinery',
    mechanism: 'Oral serine protease inhibitor targeting host-cell proteases involved in tumor invasion and metastasis',
    mechanism_category: 'protease_inhibitor',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Novel anti-invasion mechanism in a disease with near-universal metastasis at diagnosis',
      'Potential combination with gemcitabine/nab-paclitaxel backbone chemotherapy',
    ],
    weaknesses: [
      'Extremely difficult indication with high failure rate for novel agents',
      'Protease inhibitor mechanism has not been clinically validated in pancreatic cancer',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Opaganib (RedHill) — Prostate Cancer ───────────────
  {
    asset_name: 'Opaganib',
    generic_name: 'ABC294640',
    company: 'RedHill Biopharma',
    indication: 'Prostate Cancer',
    indication_specifics:
      'Metastatic prostate cancer; Phase 2 in combination with darolutamide (Bayer); first-in-class SphK2 inhibitor',
    mechanism:
      'First-in-class oral sphingosine kinase-2 (SphK2) selective inhibitor with anticancer, anti-inflammatory, and antiviral activity',
    mechanism_category: 'sphingolipid_modulator',
    molecular_target: 'SphK2',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class SphK2 inhibitor — novel mechanism targeting sphingolipid metabolism in cancer',
      'Combination study with darolutamide (Bayer partnership) provides credibility and clinical infrastructure',
      'Multi-indication potential with antiviral and anti-inflammatory properties',
    ],
    weaknesses: [
      'Sphingolipid modulation is a novel, unvalidated mechanism in prostate cancer',
      'Multiple indication pursuit (COVID, radiation, prostate) may dilute clinical focus and resources',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── CDK9 Molecular Glue (Baerenkraft) — Prostate ──────
  {
    asset_name: 'CDK9 Molecular Glue Degrader (BKT-3065)',
    company: 'Baerenkraft Therapeutics',
    indication: 'Prostate Cancer',
    indication_specifics: 'Metastatic castration-resistant prostate cancer; CDK9 molecular glue degrader',
    mechanism: 'First-in-class CDK9 molecular glue degrader targeting transcriptional addiction in prostate cancer',
    mechanism_category: 'targeted_degrader',
    molecular_target: 'CDK9',
    phase: 'Preclinical',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class molecular glue degrader for CDK9 — leverages emerging targeted protein degradation modality',
      'CDK9 is a validated oncology target driving transcriptional programs in mCRPC',
      'Molecular glue approach offers advantages over PROTACs in drug-like properties',
    ],
    weaknesses: [
      'Preclinical stage — no IND filing or clinical data; high development risk',
      'Small company with multiple preclinical programs competing for limited resources',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── MDL-4012 (Model Medicines) — Prostate Cancer ──────
  {
    asset_name: 'MDL-4012',
    company: 'Model Medicines',
    indication: 'Prostate Cancer',
    indication_specifics:
      'Prostate cancer including castration-resistant disease; novel BRD4 modulator targeting AR pathway transcription',
    mechanism: 'BRD4 modulator disrupting androgen receptor pathway transcriptional programs',
    mechanism_category: 'androgen_receptor_modulator',
    molecular_target: 'BRD4',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'BRD4 targeting offers alternative approach to AR pathway inhibition beyond direct AR antagonism',
      'Potential to address enzalutamide/abiraterone-resistant prostate cancer via epigenetic mechanism',
    ],
    weaknesses: [
      'Preclinical stage with no disclosed in vivo efficacy data',
      'BET/BRD4 inhibitor class has faced tolerability challenges in clinical development',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── CY-3132 (Cyana Therapeutics) — Melanoma ────────────
  {
    asset_name: 'CY-3132',
    company: 'Cyana Therapeutics',
    indication: 'Melanoma',
    indication_specifics:
      'Advanced melanoma and solid tumors; small molecule ENPP1 inhibitor activating STING innate immune pathway',
    mechanism:
      'Novel ENPP1 inhibitor that stimulates the STING innate immune pathway by targeting its negative regulator',
    mechanism_category: 'novel_immunotherapy',
    molecular_target: 'ENPP1',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'STING pathway activation is a validated approach for immune-cold tumors including melanoma',
      'Phase 1-ready — IND-enabling studies anticipated near-term',
      'Small molecule format offers advantages over injectable STING agonists in patient convenience',
    ],
    weaknesses: [
      'Preclinical stage with multiple STING pathway competitors from larger companies',
      'ENPP1 inhibitor class is early and unvalidated clinically',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // RARE DISEASE
  // ══════════════════════════════════════════════════════════

  // ── Alpha Galactosidase (Eleva GmbH) — Fabry Disease ───
  {
    asset_name: 'Alpha Galactosidase',
    company: 'Eleva GmbH',
    indication: 'Fabry Disease',
    indication_specifics:
      'Recombinant enzyme replacement therapy with demonstrated >60% reduction in urine Gb3/lyso-Gb3 for 28 days (vs 14-day dosing for approved ERTs)',
    mechanism: 'Recombinant alpha-galactosidase enzyme replacement therapy with extended pharmacodynamic duration',
    mechanism_category: 'enzyme_replacement',
    phase: 'Phase 1',
    key_data:
      'Phase 1b: >60% reduction in urine Gb3/lyso-Gb3 sustained for 28 days. Mild SAEs resolved within 24 hours.',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Extended 28-day dosing interval vs. 14-day standard — potential major convenience advantage for patients',
      'Clinically meaningful biomarker reduction (>60% Gb3/lyso-Gb3) demonstrated in Phase 1b',
      'Orphan drug designation pathway with smaller, faster clinical trials',
    ],
    weaknesses: [
      'Competing against established ERTs (agalsidase alfa/beta) and oral chaperone therapy (migalastat)',
      'Small Phase 1b — needs larger confirmatory studies to demonstrate sustained clinical benefit',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Factor H (Eleva GmbH) — aHUS ──────────────────────
  {
    asset_name: 'Factor H',
    company: 'Eleva GmbH',
    indication: 'Atypical Hemolytic Uremic Syndrome',
    indication_specifics:
      'Recombinant human Factor H for complement-mediated diseases including aHUS, C3G, PNH, dry AMD',
    mechanism:
      'Recombinant human complement Factor H — central regulator of the alternative complement pathway that downregulates over-activated complement while preserving natural defense',
    mechanism_category: 'complement_modulator',
    molecular_target: 'Alternative complement pathway',
    phase: 'Phase 1',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Physiological replacement approach — recombinant form of endogenous complement regulator',
      'Multi-indication platform potential across complement-mediated diseases (aHUS, C3G, PNH, dry AMD)',
      'Orphan drug pathway with potential for multiple rare disease designations',
    ],
    weaknesses: [
      'Phase 1b stage — early with no efficacy data in aHUS specifically disclosed',
      'Competing with established complement inhibitors (eculizumab, ravulizumab) from Alexion/AstraZeneca',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── DMD Gene Therapy (DNA Nanobots) ────────────────────
  {
    asset_name: 'DMD Full-Length Dystrophin Gene Therapy',
    company: 'DNA Nanobots',
    indication: 'Duchenne Muscular Dystrophy',
    indication_specifics:
      'Full-length dystrophin targeted gene delivery system for DMD — addresses fundamental limitation of micro-dystrophin approaches',
    mechanism: 'Gene therapy delivering full-length dystrophin via proprietary DNA nanobot delivery system',
    mechanism_category: 'gene_therapy',
    molecular_target: 'Dystrophin gene',
    phase: 'Preclinical',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Full-length dystrophin delivery addresses key limitation of competing micro-dystrophin gene therapies',
      'Orphan drug + rare pediatric disease designation pathway with priority review voucher potential',
      'If successful, could be transformative for DMD patients vs. truncated dystrophin approaches',
    ],
    weaknesses: [
      'Preclinical stage with no IND — earliest clinical entry likely 2027+',
      'DNA nanobot delivery system is novel and unvalidated; manufacturability uncertain at scale',
      'Competing against multiple AAV-based micro-dystrophin programs from Sarepta, Pfizer, Solid Bio',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // NEUROLOGY
  // ══════════════════════════════════════════════════════════

  // ── NG-02 (Neurogenesis) — ALS ─────────────────────────
  {
    asset_name: 'NG-02',
    company: 'Neurogenesis',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics:
      'Allogeneic bone marrow-derived cell therapy for ALS designed to induce neuro-regeneration and neuroprotection',
    mechanism:
      'Allogeneic bone marrow-derived cell therapy inducing neuro-regeneration and neuroprotection via apoptosis inhibition, immunomodulation, and stem cell stimulation',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class allogeneic neuro-regenerative cell therapy with multi-mechanism neuroprotection',
      'Off-the-shelf allogeneic product avoids patient-specific manufacturing delays of autologous approaches',
      'ALS has devastating unmet need with only two modestly effective approved therapies',
    ],
    weaknesses: [
      'Cell therapy in ALS has historically shown limited clinical efficacy in controlled trials',
      'Allogeneic cell therapy carries immunogenicity risk requiring potential immunosuppression',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── NG-01 (Neurogenesis) — Multiple Sclerosis ──────────
  {
    asset_name: 'NG-01',
    company: 'Neurogenesis',
    indication: 'Multiple Sclerosis',
    indication_specifics:
      'Autologous bone marrow-derived remyelinating cell therapy for MS; cells produce sustained, massive amounts of remyelinating proteins for up to 2 months',
    mechanism:
      'Autologous bone marrow-derived cell therapy creating remyelinating biofactory cells that produce sustained remyelinating proteins directly in the CNS',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class remyelination approach — addresses the fundamental pathology of MS rather than just immunosuppression',
      'Autologous cells avoid rejection; proprietary process enhances remyelinating subpopulation',
      'Potential to repair existing damage rather than only preventing new lesions',
    ],
    weaknesses: [
      'Autologous manufacturing is patient-specific, costly, and difficult to scale',
      'CNS delivery (intrathecal injection) is more invasive than oral or IV disease-modifying therapies',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── NG-01 (Neurogenesis) — ALS ─────────────────────────
  {
    asset_name: 'NG-01',
    company: 'Neurogenesis',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics:
      'Autologous bone marrow-derived remyelinating cell therapy for ALS; harnessing remyelination capabilities for myelin degenerative diseases',
    mechanism:
      'Autologous bone marrow-derived cell therapy producing remyelinating proteins to repair myelin degeneration',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Addresses myelin degeneration component of ALS — a pathological feature underserved by current therapies',
      'Companion program to NG-01 in MS provides platform validation opportunity',
    ],
    weaknesses: [
      'ALS pathology extends well beyond myelin — unclear if remyelination alone provides meaningful clinical benefit',
      'Autologous cell therapy faces scalability and cost challenges for a progressive disease',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── PMN310 (ProMIS Neurosciences) — Alzheimer's ───────
  {
    asset_name: 'PMN310',
    company: 'ProMIS Neurosciences',
    indication: "Alzheimer's Disease",
    indication_specifics:
      "Alzheimer's disease; antibody targeting misfolded amyloid-beta species identified via proprietary protein misfolding detection platform",
    mechanism: 'Anti-amyloid-beta antibody selectively targeting toxic misfolded conformations of amyloid-beta protein',
    mechanism_category: 'anti_amyloid',
    molecular_target: 'Misfolded amyloid-beta',
    phase: 'Phase 1',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Selective targeting of toxic misfolded amyloid species — potentially improved efficacy/safety vs. broad anti-amyloid antibodies',
      'Proprietary protein misfolding platform could identify the most pathogenic amyloid conformations',
      'Leverages anti-amyloid validation from lecanemab/donanemab approvals with differentiated specificity',
    ],
    weaknesses: [
      'Extremely competitive anti-amyloid landscape with lecanemab (approved) and donanemab (approved)',
      'Phase 1 stage — years behind marketed anti-amyloid therapies; differentiation must be substantial',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Scenic Biotech PLA2G15 — Parkinson's ──────────────
  {
    asset_name: 'PLA2G15 Inhibitor',
    company: 'Scenic Biotech',
    indication: "Parkinson's Disease",
    indication_specifics:
      "Parkinson's disease and frontotemporal dementia; first-in-class small molecule PLA2G15 inhibitor targeting lysosomal dysfunction in neurodegeneration",
    mechanism:
      'First-in-class small molecule inhibitor of PLA2G15, a BMP hydrolase identified as a disease-modifying target for lysosomal dysfunction in neurodegeneration',
    mechanism_category: 'lysosomal_enzyme_inhibitor',
    molecular_target: 'PLA2G15',
    phase: 'Phase 1',
    key_data:
      "Published in Nature May 2025 (with Stanford). Disease-modifying target for neurodegeneration validated across lysosomal storage disorders and Parkinson's. IND-enabling studies completing; clinic entry by YE 2026.",
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Nature publication (May 2025) provides strong scientific validation — discovered via proprietary Cell-Seq platform',
      "Disease-modifying potential in Parkinson's — addresses root cause of lysosomal dysfunction, not just symptoms",
      'First-in-class target with broad applicability across neurodegenerative diseases and lysosomal storage disorders',
    ],
    weaknesses: [
      'Pre-IND stage; earliest clinical data likely 2027 — long timeline to proof of concept',
      "Disease-modifying trials in Parkinson's require large patient numbers and extended follow-up",
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Scenic Biotech PLA2G15 — Alzheimer's ──────────────
  {
    asset_name: 'PLA2G15 Inhibitor',
    company: 'Scenic Biotech',
    indication: "Alzheimer's Disease",
    indication_specifics:
      "Alzheimer's disease; PLA2G15 inhibitor targeting lysosomal dysfunction component of neurodegeneration",
    mechanism: 'Small molecule PLA2G15 inhibitor targeting lysosomal BMP hydrolysis in neurodegeneration',
    mechanism_category: 'lysosomal_enzyme_inhibitor',
    molecular_target: 'PLA2G15',
    phase: 'Phase 1',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Orthogonal mechanism to amyloid/tau approaches — could combine with or complement anti-amyloid therapies',
      "Platform molecule with primary validation in Parkinson's extending to Alzheimer's",
    ],
    weaknesses: [
      "Pre-IND stage — furthest from clinical validation in Alzheimer's indication",
      "Alzheimer's has highest Phase 3 failure rate of any therapeutic area; novel mechanism carries additional risk",
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Vincere Biosciences — Parkinson's ──────────────────
  {
    asset_name: 'USP30 Inhibitor',
    company: 'Vincere Biosciences',
    indication: "Parkinson's Disease",
    indication_specifics:
      "Parkinson's disease; oral, selective, CNS-penetrant USP30 inhibitor modulating mitochondrial quality control via LRRK2/PINK1/Parkin pathway",
    mechanism:
      "Small molecule USP30 inhibitor enhancing mitochondrial quality control to address mitochondrial dysfunction in Parkinson's",
    mechanism_category: 'lrrk2_modulator',
    molecular_target: 'USP30',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      "Mitochondrial quality control is genetically validated in Parkinson's via PINK1/Parkin pathway",
      'Oral, CNS-penetrant small molecule — favorable drug-like properties for chronic neurodegenerative disease',
      'Potential disease-modifying mechanism addressing fundamental cellular pathology',
    ],
    weaknesses: [
      'Preclinical stage — no IND filed; lengthy development timeline ahead',
      'Competitive landscape includes LRRK2 inhibitors from Denali/Biogen and other mitochondrial approaches',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── RTX100 (Recall Therapeutics) — Alzheimer's ─────────
  {
    asset_name: 'RTX100',
    company: 'Recall Therapeutics',
    indication: "Alzheimer's Disease",
    indication_specifics:
      "Alzheimer's disease; novel gene therapy approach proven to restore memory in multiple small animal models; NHP study and pre-IND preparation underway",
    mechanism:
      'Novel gene therapy-based anti-aggregation approach designed to restore memory by targeting protein aggregation pathology',
    mechanism_category: 'anti_aggregation',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Breakthrough technology with memory restoration demonstrated in multiple preclinical models',
      'Gene therapy approach could provide durable, one-time treatment vs. chronic antibody infusions',
      'NHP study and pre-IND preparation underway — progressing toward clinical development',
    ],
    weaknesses: [
      'Preclinical stage with no human safety or efficacy data; small animal models often fail to translate',
      'Gene therapy for CNS faces delivery challenges (BBB penetration, vector tropism)',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Masitinib (AB Science) — ALS ───────────────────────
  {
    asset_name: 'Masitinib',
    company: 'AB Science',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics:
      'ALS; oral tyrosine kinase inhibitor targeting mast cells and macrophages/microglia-driven neuroinflammation',
    mechanism:
      'Selective tyrosine kinase inhibitor targeting mast cells and microglia via c-Kit, PDGFR, and Fyn kinase — reduces neuroinflammation',
    mechanism_category: 'tyrosine_kinase_inhibitor',
    molecular_target: 'c-Kit/PDGFR/Fyn',
    phase: 'Phase 3',
    key_data: 'Phase 3 positive data in ALS demonstrating significant benefit on ALSFRS-R functional endpoint.',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Positive Phase 3 data in ALS — one of very few drugs to show functional benefit in controlled trial',
      'Oral administration — significant convenience vs. IV riluzole or intrathecal approaches',
      'Anti-neuroinflammatory mechanism addresses innate immune component of ALS pathology',
    ],
    weaknesses: [
      'Regulatory path unclear despite positive Phase 3 — previous submissions have faced scrutiny',
      'Tyrosine kinase inhibitor carries potential off-target toxicity risks with chronic use',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── ATX-1209 (Aether Therapeutics) — Chronic Pain ──────
  {
    asset_name: 'ATX-1209',
    company: 'Aether Therapeutics',
    indication: 'Chronic Pain',
    indication_specifics:
      'Chronic pain and opioid addiction; novel dependence modulator targeting ligand-free mu opioid receptor signaling',
    mechanism:
      'Novel dependence modulator targeting ligand-free signaling of mu opioid receptors — designed as non-addictive pain therapy',
    mechanism_category: 'cns_modulator',
    molecular_target: 'Mu opioid receptor (ligand-free signaling)',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class non-addictive pain drug targeting novel mu opioid receptor signaling mechanism',
      'Dual potential: chronic pain treatment AND opioid addiction therapy — massive combined addressable market',
      'Addresses critical unmet need for effective non-addictive pain management in opioid crisis era',
    ],
    weaknesses: [
      'Phase 1 with limited disclosed clinical data — novel mechanism has high translation risk',
      'Pain drug development has high failure rate; subjective endpoints complicate clinical trial design',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── 18F-FMD (Programmable Medicine) — MS ───────────────
  {
    asset_name: '18F-Flurimedrimer (18F-FMD)',
    company: 'Programmable Medicine',
    indication: 'Multiple Sclerosis',
    indication_specifics:
      'Multiple sclerosis; first-in-class nanomedicine PET imaging agent for activated microglia in neuroinflammation',
    mechanism:
      'Novel first-in-class nanomedicine PET diagnostic agent that images activated microglia in regions of neuroinflammation',
    mechanism_category: 'diagnostic_imaging',
    phase: 'Phase 2',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class neuroinflammation imaging agent — could become standard biomarker for MS drug trials',
      'Phase 2 stage with novel imaging modality addressing unmet need for monitoring neuroinflammation',
      "Platform potential across Alzheimer's, MS, and other neuroinflammatory conditions",
    ],
    weaknesses: [
      'Diagnostic agent with smaller revenue potential vs. therapeutic — may require strategic partnership',
      'PET imaging requires specialized infrastructure limiting broad clinical adoption',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // CARDIOVASCULAR
  // ══════════════════════════════════════════════════════════

  // ── IMT-358 (IMMEDIATE Therapeutics) — Heart Failure ───
  {
    asset_name: 'IMT-358',
    company: 'IMMEDIATE Therapeutics',
    indication: 'Heart Failure',
    indication_specifics:
      'Acute coronary syndromes and cardiac ischemia; metabolic cardioprotective therapy administered during active ischemia (ambulance/ED) before reperfusion',
    mechanism:
      'First-in-class metabolic cardioprotective agent designed to preserve myocardium during acute ischemia before irreversible injury occurs',
    mechanism_category: 'cardioprotective_agent',
    phase: 'Phase 2',
    key_data:
      'Phase 2 (IMMEDIATE-1, n=871): ~50% reduction in cardiac arrest/mortality, ~80% reduction in infarct size. Breakthrough Therapy Designation, Special Protocol Assessment (SPA), and BLA designation from FDA.',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Striking Phase 2 results: 50% mortality reduction and 80% infarct size reduction in 871 patients',
      'Breakthrough Therapy Designation + SPA + BLA from FDA — clear regulatory support and accelerated path',
      'Paradigm-shifting: first therapy administered during active ischemia rather than after hospital arrival',
    ],
    weaknesses: [
      'Single pivotal Phase 3 ahead — any trial failure would be devastating with no backup data',
      'Pre-hospital/ambulance administration adds logistical complexity to clinical adoption',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── AB002 (Aronora) — Stroke ───────────────────────────
  {
    asset_name: 'AB002',
    company: 'Aronora',
    indication: 'Stroke',
    indication_specifics:
      'Ischemic stroke; antithrombotic/anti-inflammatory factor IIa mimetic protein C activator enzyme',
    mechanism: 'Factor IIa mimetic protein C activator with combined antithrombotic and anti-inflammatory activity',
    mechanism_category: 'antithrombotic',
    molecular_target: 'Protein C/Factor IIa pathway',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Dual antithrombotic and anti-inflammatory mechanism — addresses both clot burden and ischemic inflammation',
      'Enzyme-based approach may provide superior therapeutic window vs. traditional anticoagulants',
      'Published preclinical data supporting mechanism in peer-reviewed journals',
    ],
    weaknesses: [
      'Stroke treatment requires rapid administration — complex logistics for clinical trials',
      'Competing with established thrombolytics (tPA) and thrombectomy procedures',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── hNPC01 (Hopstem) — Stroke ─────────────────────────
  {
    asset_name: 'hNPC01',
    company: 'Hopstem Biotechnology',
    indication: 'Stroke',
    indication_specifics:
      'Ischemic stroke; iPSC-derived forebrain neural progenitor cell injection for neuroregeneration',
    mechanism:
      'iPSC-derived forebrain neural progenitor cell therapy designed to regenerate damaged neural tissue post-stroke',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class iPSC-derived neural progenitor cell therapy for stroke — potential for true neuroregeneration',
      'Published in Nature Communications (2025) — strong preclinical scientific validation',
      'iPSC platform enables scalable, standardized manufacturing vs. primary cell sources',
    ],
    weaknesses: [
      'iPSC-derived cell therapy is a complex modality with long regulatory pathway and manufacturing challenges',
      'Stroke recovery has a narrow therapeutic window — timing of cell administration is critical',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // METABOLIC / OBESITY / DIABETES
  // ══════════════════════════════════════════════════════════

  // ── Bofanglutide (Gan & Lee) — Obesity ─────────────────
  {
    asset_name: 'Bofanglutide',
    company: 'Gan & Lee Pharmaceuticals',
    indication: 'Obesity',
    indication_specifics:
      'Twice-monthly dosing GLP-1 analog; US Phase 2 H2H trial vs. tirzepatide 15mg ongoing; CN Phase 3 obesity trial ongoing',
    mechanism: 'Long-acting GLP-1 receptor agonist with twice-monthly dosing and best-in-class efficacy potential',
    mechanism_category: 'glp1_agonist',
    molecular_target: 'GLP-1 receptor',
    phase: 'Phase 3',
    key_data:
      '-16.3% placebo-adjusted 30-week weight loss vs baseline. Twice-monthly dosing. ~50% COGS advantage over other GLP-1 producers.',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Twice-monthly dosing is a significant convenience advantage over weekly GLP-1 agonists',
      'Strong weight loss efficacy (-16.3% placebo-adjusted) competitive with best-in-class',
      'Major cost advantage: ~50% COGS reduction via Gan & Lee manufacturing capacity — potential for DTC market access',
    ],
    weaknesses: [
      'Extremely competitive GLP-1/GIP landscape dominated by Lilly (tirzepatide) and Novo (semaglutide)',
      'H2H trial vs. tirzepatide is high-risk — any inferiority would significantly diminish commercial potential',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Bofanglutide (Gan & Lee) — Type 2 Diabetes ────────
  {
    asset_name: 'Bofanglutide',
    company: 'Gan & Lee Pharmaceuticals',
    indication: 'Type 2 Diabetes',
    indication_specifics: 'Type 2 diabetes mellitus; CN Phase 3 T2D trial ongoing; twice-monthly GLP-1 agonist',
    mechanism: 'Long-acting GLP-1 receptor agonist with twice-monthly subcutaneous dosing',
    mechanism_category: 'glp1_agonist',
    molecular_target: 'GLP-1 receptor',
    phase: 'Phase 3',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Phase 3 ongoing in China with potential for accelerated approval in large T2D market',
      'Twice-monthly dosing could drive adherence improvements vs. weekly or daily alternatives',
      'Cost-competitive manufacturing positions for broad market access in price-sensitive markets',
    ],
    weaknesses: [
      'GLP-1 agonist class is dominated by established players with extensive long-term safety data',
      'China-first development strategy may require additional bridging studies for US/EU approval',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Long-Acting Peptide (Palatin) — Obesity ────────────
  {
    asset_name: 'Long-Acting MC4R Peptide',
    company: 'Palatin Technologies',
    indication: 'Obesity',
    indication_specifics:
      'General obesity and rare genetic obesity disorders (POMC, PCSK1, LEPR, MC4R mutations); MC4R agonist targeting central appetite regulation',
    mechanism:
      'Melanocortin-4 receptor (MC4R) agonist peptide targeting hypothalamic appetite regulation and energy homeostasis',
    mechanism_category: 'melanocortin_agonist',
    molecular_target: 'MC4R',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'MC4R is genetically validated for obesity — LOF mutations directly cause severe early-onset obesity',
      'Potential for both rare genetic obesity (orphan) and general obesity (blockbuster) indications',
      'Differentiated mechanism from GLP-1 agonists — targets central appetite pathways directly',
    ],
    weaknesses: [
      'MC4R agonists have historically faced tolerability issues (nausea, cardiovascular effects, sexual side effects)',
      'Phase 2 stage competing against approved GLP-1/GIP agonists with massive clinical datasets',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── TNIK Inhibitor (Baerenkraft) — Obesity ─────────────
  {
    asset_name: 'TNIK Inhibitor (BKT-4001)',
    company: 'Baerenkraft Therapeutics',
    indication: 'Obesity',
    indication_specifics: 'Obesity and related endocrine/metabolic disorders; novel TNIK kinase inhibitor',
    mechanism: 'First-in-class TNIK (Traf2 and Nck-interacting kinase) inhibitor for metabolic disease',
    mechanism_category: 'novel_kinase_inhibitor',
    molecular_target: 'TNIK',
    phase: 'Preclinical',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class TNIK inhibitor — novel kinase target in metabolic disease with no direct competitors',
      'Differentiated mechanism from GLP-1/GIP agonists could complement existing obesity treatment paradigm',
    ],
    weaknesses: [
      'Preclinical stage with no disclosed in vivo efficacy data — high attrition risk',
      'Novel target with limited clinical validation — mechanism of action needs translational proof',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── BIOIO-1xx1 (BIOIO Pharma) — Type 2 Diabetes ──────
  {
    asset_name: 'BIOIO-1xx1',
    company: 'BIOIO Pharma',
    indication: 'Type 2 Diabetes',
    indication_specifics:
      'Type 2 diabetes mellitus; novel metabolic agent targeting SIRT3 and lipid metabolism pathways',
    mechanism: 'Novel small molecule metabolic agent modulating SIRT3 and lipid metabolism stimulation pathways',
    mechanism_category: 'metabolic_modulator',
    molecular_target: 'SIRT3/lipid metabolism',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'SIRT3 modulation targets mitochondrial metabolic pathways — differentiated from insulin/GLP-1 mechanisms',
      'Novel approach to metabolic disease could complement existing T2D treatment paradigm',
    ],
    weaknesses: [
      'Lead discovery/optimization stage — earliest clinical entry likely 3+ years away',
      'SIRT3 modulation is unvalidated in clinical setting for diabetes',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // MUSCULOSKELETAL
  // ══════════════════════════════════════════════════════════

  // ── Chondrostem (CELL Technologies) — OA ───────────────
  {
    asset_name: 'Chondrostem',
    company: 'CELL Technologies',
    indication: 'Osteoarthritis',
    indication_specifics:
      'Phase 3 cell therapy for osteoarthritis with breakthrough Phase 2 data showing significant long-term improvement beyond 12 months',
    mechanism:
      'Cell-based immunomodulatory therapy for osteoarthritis delivering sustained chondroprotection and disease modification',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 3',
    key_data:
      'Phase 2: Breakthrough data showing significant, sustained improvement in OA patients beyond 12 months of follow-up.',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Phase 3 stage with breakthrough Phase 2 data — sustained OA improvement beyond 12 months',
      'Disease-modifying potential in OA — a massive market with no approved DMOADs',
      'Cell therapy approach offers potential for durable benefit vs. repeated injection treatments',
    ],
    weaknesses: [
      'Cell therapy manufacturing complexity and cost may limit commercial accessibility',
      'OA clinical trials face challenges with high placebo response rates and subjective endpoints',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── Restem-X (Restem Group) — OA ───────────────────────
  {
    asset_name: 'Restem-X',
    company: 'Restem Group',
    indication: 'Osteoarthritis',
    indication_specifics: 'Musculoskeletal disease and injury; cell therapy approach for osteoarthritis',
    mechanism: 'Cell therapy for musculoskeletal repair and osteoarthritis treatment',
    mechanism_category: 'cell_therapy',
    phase: 'Phase 1',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Cell therapy platform with potential for disease modification in OA — large unmet need',
      'Multi-indication musculoskeletal platform (OA + injury) broadens commercial opportunity',
    ],
    weaknesses: [
      'Phase 1 with no disclosed clinical data — early stage with high attrition risk',
      'Competing with Chondrostem (Phase 3) and multiple other cell therapy OA programs',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // OPHTHALMOLOGY
  // ══════════════════════════════════════════════════════════

  // ── PL9643 (Palatin) — AMD ─────────────────────────────
  {
    asset_name: 'PL9643',
    company: 'Palatin Technologies',
    indication: 'Age-Related Macular Degeneration',
    indication_specifics:
      'Dry eye disease and potentially dry AMD; topical melanocortin 1/5 receptor agonist peptide — Phase 3 in DED, with platform extension to retinal diseases',
    mechanism: 'Melanocortin 1 and 5 receptor (MC1R/MC5R) agonist peptide delivered as topical ophthalmic solution',
    mechanism_category: 'melanocortin_agonist',
    molecular_target: 'MC1R/MC5R',
    phase: 'Phase 3',
    partner: 'Undisclosed',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Phase 3 stage with established commercial partner — de-risked development and commercialization',
      'Topical (eye drop) administration is significantly more convenient than intravitreal injections',
      'Melanocortin receptor agonism is a novel mechanism in ophthalmology with anti-inflammatory properties',
    ],
    weaknesses: [
      'Primary indication is dry eye disease, not wet/dry AMD — AMD extension requires additional clinical validation',
      'Topical delivery to posterior segment (retina) faces pharmacokinetic challenges',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ══════════════════════════════════════════════════════════
  // IMMUNOLOGY / INFLAMMATION
  // ══════════════════════════════════════════════════════════

  // ── CS12192 (Chipscreen) — RA ──────────────────────────
  {
    asset_name: 'CS12192',
    company: 'Chipscreen Biosciences',
    indication: 'Rheumatoid Arthritis',
    indication_specifics:
      'Rheumatoid arthritis, GvHD, alopecia areata; highly selective JAK3 inhibitor with additional IRAK4/TBK1 activity for differentiated anti-inflammatory efficacy',
    mechanism:
      'First-in-class highly selective JAK3 kinase inhibitor with moderate TBK1 inhibition — affects only gamma-chain cytokine signaling for improved safety vs. broader JAK inhibitors',
    mechanism_category: 'jak_inhibitor',
    molecular_target: 'JAK3/TBK1',
    phase: 'Phase 1',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Best-in-class JAK3 selectivity — avoids JAK1/2-mediated cardiovascular/thromboembolic risks seen with tofacitinib',
      'Additional TBK1 inhibition provides differentiated anti-inflammatory benefit beyond pure JAK3 inhibitors',
      'Multi-indication potential in RA, GvHD, and alopecia areata',
    ],
    weaknesses: [
      'JAK inhibitor class faces FDA black box warning concerns following ORAL Surveillance trial',
      'Phase 1 stage — significant development timeline ahead in a mature RA treatment landscape',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── MDNA413 (Medicenna) — Atopic Dermatitis ────────────
  {
    asset_name: 'MDNA413',
    company: 'Medicenna Therapeutics',
    indication: 'Atopic Dermatitis',
    indication_specifics:
      'Atopic dermatitis and asthma; IL-13 superkine engineered as potent dual IL-4/IL-13 antagonist binding Type II IL-4 receptor',
    mechanism:
      'Engineered IL-13 superkine functioning as a highly potent dual antagonist of IL-4 and IL-13 signaling via Type II IL-4 receptor blockade',
    mechanism_category: 'interleukin_inhibitor',
    molecular_target: 'Type II IL-4R (IL-4/IL-13)',
    phase: 'Preclinical',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'IL-4/IL-13 axis fully validated by dupilumab — clear commercial precedent and regulatory pathway',
      'Superkine engineering may provide superior potency or dosing convenience vs. antibody-based dupilumab',
      "Platform molecule from Medicenna's superkine technology with differentiated biology",
    ],
    weaknesses: [
      'Lead discovery/optimization stage — years from clinical entry',
      'Competing against established dupilumab and multiple JAK inhibitors already approved for AD',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },

  // ── ME3183 (Meiji Pharma) — Atopic Dermatitis ─────────
  {
    asset_name: 'ME3183',
    company: 'Meiji Pharma',
    indication: 'Atopic Dermatitis',
    indication_specifics:
      'Inflammatory dermatitis including atopic dermatitis; S1P1 receptor agonist with anti-inflammatory properties',
    mechanism:
      'Sphingosine-1-phosphate receptor 1 (S1P1) agonist with potent anti-inflammatory activity in dermatological inflammation',
    mechanism_category: 's1p_receptor_agonist',
    molecular_target: 'S1P1',
    phase: 'Phase 2',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'S1P receptor modulation validated in autoimmune diseases (MS: fingolimod/siponimod) — extending to dermatology',
      'Oral small molecule — convenience advantage over injectable biologics in AD',
      'Differentiated mechanism from IL-4/IL-13 and JAK pathways in atopic dermatitis',
    ],
    weaknesses: [
      'S1P1 agonists carry class risks (bradycardia, macular edema, lymphopenia) requiring monitoring',
      'Crowded AD treatment landscape with multiple effective biologics and JAK inhibitors',
    ],
    source: 'BIO Convention 2025 Asset Database',
    last_updated: '2025-06-01',
  },
];
