// ============================================================
// TERRAIN — Indication Subtypes & Patient Segments Database
// lib/data/indication-subtypes.ts
//
// Comprehensive subtype, patient segment, and mechanism-of-action data
// for 100+ indications across all therapeutic areas.
// Sources: NCCN, ASCO, AAN, ACR, ACC/AHA, published epidemiology.
// ============================================================

export interface IndicationSubtype {
  indication: string;
  subtypes: { name: string; prevalence_pct: number; key_biomarkers: string[]; standard_of_care: string }[];
  patient_segments: { segment: string; description: string; pct_of_patients: number }[];
  mechanisms_of_action: string[];
  lines_of_therapy: string[];
  therapeutic_area: string;
}

export const INDICATION_SUBTYPES: IndicationSubtype[] = [
  // ──────────────────────────────────────────
  // ONCOLOGY
  // ──────────────────────────────────────────
  {
    indication: 'Non-Small Cell Lung Cancer',
    subtypes: [
      {
        name: 'Adenocarcinoma',
        prevalence_pct: 40,
        key_biomarkers: ['EGFR', 'ALK', 'ROS1', 'KRAS G12C', 'MET exon 14'],
        standard_of_care: 'Pembrolizumab + chemo (1L); targeted therapy if biomarker+',
      },
      {
        name: 'Squamous Cell Carcinoma',
        prevalence_pct: 30,
        key_biomarkers: ['PD-L1', 'FGFR1', 'PIK3CA'],
        standard_of_care: 'Pembrolizumab + carboplatin/paclitaxel',
      },
      {
        name: 'Large Cell Carcinoma',
        prevalence_pct: 5,
        key_biomarkers: ['PD-L1'],
        standard_of_care: 'Platinum-based chemotherapy + immunotherapy',
      },
      {
        name: 'EGFR-mutant',
        prevalence_pct: 17,
        key_biomarkers: ['EGFR exon 19 del', 'EGFR L858R', 'EGFR T790M'],
        standard_of_care: 'Osimertinib (1L)',
      },
      {
        name: 'ALK-rearranged',
        prevalence_pct: 5,
        key_biomarkers: ['ALK fusion'],
        standard_of_care: 'Alectinib or lorlatinib (1L)',
      },
      {
        name: 'KRAS G12C-mutant',
        prevalence_pct: 13,
        key_biomarkers: ['KRAS G12C'],
        standard_of_care: 'Sotorasib or adagrasib (2L+)',
      },
      {
        name: 'PD-L1 High (TPS ≥50%)',
        prevalence_pct: 28,
        key_biomarkers: ['PD-L1 TPS ≥50%'],
        standard_of_care: 'Pembrolizumab monotherapy (1L)',
      },
    ],
    patient_segments: [
      {
        segment: 'Biomarker-selected 1L',
        description: 'EGFR/ALK/ROS1+ receiving targeted therapy',
        pct_of_patients: 25,
      },
      {
        segment: 'IO-eligible 1L',
        description: 'No actionable mutation, PD-L1+, receiving IO+chemo',
        pct_of_patients: 45,
      },
      {
        segment: '2L+ after progression',
        description: 'Progressed on 1L, eligible for docetaxel±ramucirumab or IO',
        pct_of_patients: 20,
      },
      {
        segment: 'Elderly/frail',
        description: '≥75 years or ECOG 2, may receive modified regimens',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'EGFR TKI',
      'ALK inhibitor',
      'KRAS G12C inhibitor',
      'ROS1 inhibitor',
      'MET inhibitor',
      'RET inhibitor',
      'Platinum chemotherapy',
      'ADC (TROP2, HER3)',
      'Bispecific T-cell engager',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Breast Cancer',
    subtypes: [
      {
        name: 'HR+/HER2-',
        prevalence_pct: 70,
        key_biomarkers: ['ER', 'PR', 'Ki-67', 'PIK3CA', 'ESR1'],
        standard_of_care: 'CDK4/6 inhibitor + endocrine therapy (1L mBC)',
      },
      {
        name: 'HER2+',
        prevalence_pct: 18,
        key_biomarkers: ['HER2 IHC 3+', 'HER2 FISH+'],
        standard_of_care: 'Trastuzumab + pertuzumab + taxane (1L); T-DXd (2L+)',
      },
      {
        name: 'Triple-Negative (TNBC)',
        prevalence_pct: 12,
        key_biomarkers: ['PD-L1', 'BRCA1/2', 'TROP2'],
        standard_of_care: 'Pembrolizumab + chemo (1L PD-L1+); sacituzumab govitecan (2L+)',
      },
      {
        name: 'HER2-low',
        prevalence_pct: 55,
        key_biomarkers: ['HER2 IHC 1+/2+, FISH-'],
        standard_of_care: 'T-DXd after progression on prior therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Early stage (I-III)',
        description: 'Surgically resectable, neoadjuvant/adjuvant therapy',
        pct_of_patients: 85,
      },
      {
        segment: 'Metastatic 1L',
        description: 'De novo or recurrent metastatic, first systemic treatment',
        pct_of_patients: 8,
      },
      { segment: 'Metastatic 2L+', description: 'Progressed on first-line metastatic therapy', pct_of_patients: 7 },
    ],
    mechanisms_of_action: [
      'CDK4/6 inhibitor',
      'Anti-HER2 mAb',
      'Anti-HER2 ADC',
      'PARP inhibitor',
      'PI3K inhibitor',
      'TROP2 ADC',
      'PD-1 inhibitor',
      'Endocrine therapy (AI, tamoxifen)',
      'Selective ER degrader (SERD)',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L metastatic', '2L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Colorectal Cancer',
    subtypes: [
      {
        name: 'MSS/pMMR (microsatellite stable)',
        prevalence_pct: 85,
        key_biomarkers: ['RAS/RAF wild-type', 'HER2'],
        standard_of_care: 'FOLFOX/FOLFIRI + bevacizumab or anti-EGFR (left-sided, RAS WT)',
      },
      {
        name: 'MSI-H/dMMR',
        prevalence_pct: 15,
        key_biomarkers: ['MSI-H', 'dMMR', 'PD-L1'],
        standard_of_care: 'Pembrolizumab (1L mCRC); nivolumab + ipilimumab',
      },
      {
        name: 'KRAS/NRAS mutant',
        prevalence_pct: 50,
        key_biomarkers: ['KRAS G12/G13', 'NRAS'],
        standard_of_care: 'FOLFOX/FOLFIRI + bevacizumab (anti-EGFR contraindicated)',
      },
      {
        name: 'BRAF V600E mutant',
        prevalence_pct: 10,
        key_biomarkers: ['BRAF V600E'],
        standard_of_care: 'Encorafenib + cetuximab (2L+)',
      },
    ],
    patient_segments: [
      { segment: 'Localized (Stage I-III)', description: 'Surgical resection ± adjuvant chemo', pct_of_patients: 60 },
      { segment: 'Metastatic 1L', description: 'Unresectable mCRC, first-line systemic', pct_of_patients: 25 },
      { segment: 'Metastatic 2L+', description: 'Progressed on first-line', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Anti-EGFR mAb',
      'Anti-VEGF mAb',
      'PD-1 inhibitor',
      'BRAF+MEK inhibitor',
      'Fluoropyrimidine chemo',
      'KRAS G12C inhibitor',
      'HER2-targeted (tucatinib+trastuzumab)',
      'Bispecific',
    ],
    lines_of_therapy: ['Adjuvant', '1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Melanoma',
    subtypes: [
      {
        name: 'BRAF V600-mutant',
        prevalence_pct: 50,
        key_biomarkers: ['BRAF V600E', 'BRAF V600K'],
        standard_of_care: 'BRAF+MEK inhibitors or anti-PD-1 + anti-CTLA-4',
      },
      {
        name: 'BRAF wild-type',
        prevalence_pct: 50,
        key_biomarkers: ['NRAS', 'KIT', 'NF1'],
        standard_of_care: 'Anti-PD-1 ± anti-CTLA-4 (nivolumab + ipilimumab)',
      },
      {
        name: 'Uveal melanoma',
        prevalence_pct: 5,
        key_biomarkers: ['GNAQ', 'GNA11'],
        standard_of_care: 'Tebentafusp (HLA-A*02:01+); limited systemic options',
      },
      {
        name: 'Acral/mucosal',
        prevalence_pct: 5,
        key_biomarkers: ['KIT', 'NRAS'],
        standard_of_care: 'Anti-PD-1 ± anti-CTLA-4; KIT inhibitors if KIT-mutant',
      },
    ],
    patient_segments: [
      { segment: 'Resectable (Stage I-III)', description: 'Surgical excision ± adjuvant IO', pct_of_patients: 70 },
      { segment: 'Unresectable/metastatic 1L', description: 'First systemic therapy', pct_of_patients: 20 },
      {
        segment: 'Refractory',
        description: 'Progressed on anti-PD-1 and BRAF/MEK (if applicable)',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'CTLA-4 inhibitor',
      'BRAF inhibitor',
      'MEK inhibitor',
      'LAG-3 inhibitor',
      'T-cell engager (tebentafusp)',
      'TIL therapy',
      'Oncolytic virus',
    ],
    lines_of_therapy: ['Adjuvant', '1L', '2L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Prostate Cancer',
    subtypes: [
      {
        name: 'Localized',
        prevalence_pct: 80,
        key_biomarkers: ['PSA', 'Gleason score', 'BRCA1/2'],
        standard_of_care: 'Active surveillance, surgery, or radiation',
      },
      {
        name: 'mHSPC (hormone-sensitive)',
        prevalence_pct: 10,
        key_biomarkers: ['AR', 'BRCA1/2', 'HRR'],
        standard_of_care: 'ADT + abiraterone or enzalutamide + docetaxel',
      },
      {
        name: 'mCRPC (castration-resistant)',
        prevalence_pct: 10,
        key_biomarkers: ['AR-V7', 'BRCA1/2', 'MSI-H', 'PSMA'],
        standard_of_care: 'Enzalutamide/abiraterone; olaparib (HRR+); Lu-PSMA-617',
      },
    ],
    patient_segments: [
      {
        segment: 'Low-risk localized',
        description: 'Gleason ≤6, candidates for active surveillance',
        pct_of_patients: 40,
      },
      {
        segment: 'High-risk localized',
        description: 'Gleason ≥8, radical prostatectomy/radiation + ADT',
        pct_of_patients: 30,
      },
      { segment: 'Metastatic', description: 'mHSPC or mCRPC requiring systemic therapy', pct_of_patients: 20 },
      {
        segment: 'Biomarker-selected',
        description: 'BRCA/HRR+ or MSI-H eligible for targeted therapy',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Androgen receptor inhibitor',
      'CYP17 inhibitor',
      'PARP inhibitor',
      'Radioligand (Lu-PSMA-617)',
      'PD-1 inhibitor (MSI-H)',
      'Taxane chemotherapy',
      'PSMA-targeted ADC',
    ],
    lines_of_therapy: ['1L mHSPC', '1L mCRPC', '2L mCRPC', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Pancreatic Cancer',
    subtypes: [
      {
        name: 'KRAS-mutant',
        prevalence_pct: 90,
        key_biomarkers: ['KRAS G12D', 'KRAS G12V', 'KRAS G12R'],
        standard_of_care: 'FOLFIRINOX or gemcitabine/nab-paclitaxel',
      },
      {
        name: 'BRCA/PALB2-mutant',
        prevalence_pct: 7,
        key_biomarkers: ['BRCA1/2', 'PALB2'],
        standard_of_care: 'Platinum-based chemo → olaparib maintenance',
      },
      { name: 'MSI-H', prevalence_pct: 1, key_biomarkers: ['MSI-H', 'dMMR'], standard_of_care: 'Pembrolizumab' },
    ],
    patient_segments: [
      { segment: 'Resectable', description: 'Upfront surgery followed by adjuvant chemo', pct_of_patients: 15 },
      {
        segment: 'Borderline resectable',
        description: 'Neoadjuvant chemo → reassessment for surgery',
        pct_of_patients: 10,
      },
      { segment: 'Locally advanced', description: 'Unresectable, chemo ± radiation', pct_of_patients: 30 },
      { segment: 'Metastatic', description: 'First-line systemic chemotherapy', pct_of_patients: 45 },
    ],
    mechanisms_of_action: [
      'Fluoropyrimidine chemo',
      'Platinum chemo',
      'PARP inhibitor',
      'KRAS G12D inhibitor (emerging)',
      'PD-1 inhibitor (MSI-H)',
      'ADC',
      'Stroma-targeting agents',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L', '2L'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Ovarian Cancer',
    subtypes: [
      {
        name: 'High-grade serous',
        prevalence_pct: 70,
        key_biomarkers: ['BRCA1/2', 'HRD', 'TP53'],
        standard_of_care: 'Platinum/taxane → PARP inhibitor maintenance',
      },
      {
        name: 'Endometrioid',
        prevalence_pct: 10,
        key_biomarkers: ['MSI-H', 'ARID1A'],
        standard_of_care: 'Platinum-based chemo',
      },
      {
        name: 'Clear cell',
        prevalence_pct: 10,
        key_biomarkers: ['ARID1A', 'PIK3CA'],
        standard_of_care: 'Platinum-based chemo (less responsive)',
      },
      {
        name: 'Mucinous',
        prevalence_pct: 3,
        key_biomarkers: ['HER2', 'KRAS'],
        standard_of_care: 'Surgery; chemo for advanced disease',
      },
    ],
    patient_segments: [
      { segment: 'BRCA/HRD+', description: 'Eligible for PARP inhibitor maintenance', pct_of_patients: 50 },
      { segment: 'HRD-negative', description: 'Limited maintenance options post-platinum', pct_of_patients: 50 },
    ],
    mechanisms_of_action: [
      'PARP inhibitor',
      'Anti-VEGF (bevacizumab)',
      'PD-1/PD-L1 inhibitor',
      'Platinum chemotherapy',
      'ADC (mirvetuximab soravtansine)',
      'Folate receptor alpha targeting',
    ],
    lines_of_therapy: ['1L', 'Maintenance', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Renal Cell Carcinoma',
    subtypes: [
      {
        name: 'Clear cell',
        prevalence_pct: 75,
        key_biomarkers: ['VHL', 'PD-L1', 'VEGF'],
        standard_of_care: 'IO+TKI (pembrolizumab+lenvatinib or nivolumab+cabozantinib)',
      },
      {
        name: 'Papillary',
        prevalence_pct: 15,
        key_biomarkers: ['MET', 'FH'],
        standard_of_care: 'Cabozantinib; IO-based regimens',
      },
      {
        name: 'Chromophobe',
        prevalence_pct: 5,
        key_biomarkers: ['FLCN', 'TP53'],
        standard_of_care: 'mTOR inhibitor or TKI',
      },
    ],
    patient_segments: [
      {
        segment: 'Favorable risk (IMDC)',
        description: '0 risk factors, may receive IO+IO or IO+TKI',
        pct_of_patients: 25,
      },
      { segment: 'Intermediate risk', description: '1-2 risk factors, IO+TKI preferred', pct_of_patients: 50 },
      { segment: 'Poor risk', description: '3+ risk factors, IO+IO (nivo+ipi) or IO+TKI', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'CTLA-4 inhibitor',
      'VEGFR TKI',
      'HIF-2α inhibitor (belzutifan)',
      'mTOR inhibitor',
      'Anti-VEGF mAb',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Hepatocellular Carcinoma',
    subtypes: [
      {
        name: 'Virus-associated (HBV/HCV)',
        prevalence_pct: 60,
        key_biomarkers: ['AFP', 'HBV DNA', 'HCV RNA'],
        standard_of_care: 'Atezolizumab + bevacizumab (1L)',
      },
      {
        name: 'Metabolic/NASH-driven',
        prevalence_pct: 30,
        key_biomarkers: ['AFP', 'FIB-4'],
        standard_of_care: 'Atezolizumab + bevacizumab (may have lower IO response)',
      },
      {
        name: 'Alcohol-related',
        prevalence_pct: 10,
        key_biomarkers: ['AFP'],
        standard_of_care: 'Same systemic therapy as other etiologies',
      },
    ],
    patient_segments: [
      { segment: 'BCLC 0-A (early)', description: 'Resection, ablation, or transplant', pct_of_patients: 30 },
      { segment: 'BCLC B (intermediate)', description: 'TACE or systemic therapy', pct_of_patients: 20 },
      { segment: 'BCLC C (advanced)', description: 'Systemic IO+anti-VEGF', pct_of_patients: 35 },
      { segment: 'BCLC D (terminal)', description: 'Best supportive care', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'PD-L1 inhibitor',
      'Anti-VEGF mAb',
      'Multi-kinase TKI (sorafenib, lenvatinib)',
      'CTLA-4 inhibitor',
      'PD-1 inhibitor',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Bladder/Urothelial Cancer',
    subtypes: [
      {
        name: 'Muscle-invasive (MIBC)',
        prevalence_pct: 25,
        key_biomarkers: ['PD-L1', 'FGFR2/3', 'HER2', 'Nectin-4'],
        standard_of_care: 'Neoadjuvant cisplatin-based chemo → cystectomy; adjuvant nivolumab',
      },
      {
        name: 'Non-muscle-invasive (NMIBC)',
        prevalence_pct: 75,
        key_biomarkers: ['PD-L1'],
        standard_of_care: 'Intravesical BCG; pembrolizumab (BCG-unresponsive)',
      },
      {
        name: 'FGFR-altered',
        prevalence_pct: 20,
        key_biomarkers: ['FGFR2/3 alterations'],
        standard_of_care: 'Erdafitinib (2L+)',
      },
    ],
    patient_segments: [
      { segment: 'Cisplatin-eligible', description: 'Fit for platinum-based chemotherapy', pct_of_patients: 50 },
      { segment: 'Cisplatin-ineligible', description: 'IO-based first-line options', pct_of_patients: 50 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'FGFR inhibitor',
      'Nectin-4 ADC (enfortumab vedotin)',
      'Platinum chemotherapy',
      'Intravesical BCG',
      'HER2-targeted',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L', '2L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Gastric/GEJ Cancer',
    subtypes: [
      {
        name: 'HER2-positive',
        prevalence_pct: 20,
        key_biomarkers: ['HER2 IHC 3+', 'HER2 FISH+'],
        standard_of_care: 'Trastuzumab + chemo + pembrolizumab (1L)',
      },
      {
        name: 'PD-L1 CPS ≥5',
        prevalence_pct: 40,
        key_biomarkers: ['PD-L1 CPS'],
        standard_of_care: 'Nivolumab + chemo (1L)',
      },
      { name: 'MSI-H', prevalence_pct: 5, key_biomarkers: ['MSI-H', 'dMMR'], standard_of_care: 'Pembrolizumab' },
      {
        name: 'Claudin 18.2+',
        prevalence_pct: 35,
        key_biomarkers: ['CLDN18.2'],
        standard_of_care: 'Zolbetuximab + chemo (1L)',
      },
    ],
    patient_segments: [
      { segment: 'Resectable', description: 'Perioperative chemo + surgery', pct_of_patients: 30 },
      { segment: 'Advanced/metastatic 1L', description: 'Systemic chemo + IO ± targeted', pct_of_patients: 45 },
      { segment: 'Refractory', description: '2L+ options including ramucirumab, TAS-102', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'Anti-HER2 mAb',
      'Anti-Claudin 18.2 mAb',
      'Anti-VEGFR2 mAb',
      'Fluoropyrimidine/platinum chemo',
      'ADC (T-DXd for HER2+)',
    ],
    lines_of_therapy: ['Perioperative', '1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Head and Neck Squamous Cell Carcinoma',
    subtypes: [
      {
        name: 'HPV-positive oropharyngeal',
        prevalence_pct: 40,
        key_biomarkers: ['HPV p16+', 'PD-L1'],
        standard_of_care: 'Cisplatin + radiation; pembrolizumab (R/M)',
      },
      {
        name: 'HPV-negative',
        prevalence_pct: 60,
        key_biomarkers: ['PD-L1 CPS', 'TP53'],
        standard_of_care: 'Cisplatin + radiation; pembrolizumab + chemo (R/M)',
      },
    ],
    patient_segments: [
      { segment: 'Locally advanced', description: 'Concurrent chemoradiation', pct_of_patients: 60 },
      { segment: 'Recurrent/metastatic 1L', description: 'Pembrolizumab ± chemo (PD-L1 CPS ≥1)', pct_of_patients: 25 },
      { segment: 'Refractory', description: '2L+ options limited', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'Anti-EGFR mAb (cetuximab)',
      'Platinum chemotherapy',
      'ADC',
      'Bispecific antibody',
    ],
    lines_of_therapy: ['Definitive CRT', '1L R/M', '2L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Small Cell Lung Cancer',
    subtypes: [
      {
        name: 'Limited stage',
        prevalence_pct: 30,
        key_biomarkers: ['DLL3', 'PD-L1'],
        standard_of_care: 'Concurrent chemoradiation + PCI',
      },
      {
        name: 'Extensive stage',
        prevalence_pct: 70,
        key_biomarkers: ['DLL3', 'PD-L1'],
        standard_of_care: 'Atezolizumab + carboplatin/etoposide',
      },
    ],
    patient_segments: [
      {
        segment: 'Chemo-sensitive relapse',
        description: 'Relapsed >90 days post 1L, rechallenge option',
        pct_of_patients: 30,
      },
      { segment: 'Chemo-resistant relapse', description: 'Relapsed <90 days, poor prognosis', pct_of_patients: 40 },
    ],
    mechanisms_of_action: [
      'PD-L1 inhibitor',
      'Platinum chemotherapy',
      'Topoisomerase inhibitor',
      'DLL3-targeted ADC/BiTE',
      'Lurbinectedin',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Multiple Myeloma',
    subtypes: [
      {
        name: 'Standard risk',
        prevalence_pct: 60,
        key_biomarkers: ['t(11;14)', 'hyperdiploidy'],
        standard_of_care: 'VRd (bortezomib/lenalidomide/dex) → ASCT → len maintenance',
      },
      {
        name: 'High risk',
        prevalence_pct: 20,
        key_biomarkers: ['del(17p)', 't(4;14)', 't(14;16)', 'gain 1q'],
        standard_of_care: 'Quadruplet (dara-VRd) → ASCT → maintenance',
      },
      {
        name: 'BCMA-expressing',
        prevalence_pct: 95,
        key_biomarkers: ['BCMA'],
        standard_of_care: 'CAR-T (ide-cel, cilta-cel) or teclistamab (R/R)',
      },
    ],
    patient_segments: [
      { segment: 'Transplant-eligible', description: 'Age <70, fit, induction → ASCT', pct_of_patients: 40 },
      { segment: 'Transplant-ineligible', description: 'Continuous frontline therapy', pct_of_patients: 40 },
      {
        segment: 'Relapsed/refractory',
        description: 'Triple-class exposed, BCMA-directed therapy',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Proteasome inhibitor',
      'IMiD (lenalidomide, pomalidomide)',
      'Anti-CD38 mAb',
      'BCMA CAR-T',
      'BCMA bispecific',
      'GPRC5D bispecific',
      'XPO1 inhibitor',
      'BCL-2 inhibitor',
    ],
    lines_of_therapy: ['1L', '2L', '3L', '4L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Diffuse Large B-Cell Lymphoma',
    subtypes: [
      {
        name: 'GCB (germinal center B-cell)',
        prevalence_pct: 50,
        key_biomarkers: ['CD20', 'BCL2', 'MYC'],
        standard_of_care: 'R-CHOP or pola-R-CHP',
      },
      {
        name: 'ABC (activated B-cell)',
        prevalence_pct: 35,
        key_biomarkers: ['CD20', 'MYD88', 'CD79B'],
        standard_of_care: 'R-CHOP (poorer prognosis vs GCB)',
      },
      {
        name: 'Double-hit (MYC+BCL2)',
        prevalence_pct: 10,
        key_biomarkers: ['MYC rearrangement', 'BCL2 rearrangement'],
        standard_of_care: 'DA-EPOCH-R or intensive chemoimmunotherapy',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'Curable with R-CHOP in ~60%', pct_of_patients: 70 },
      { segment: 'Relapsed/refractory', description: 'Salvage chemo → ASCT or CAR-T', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Anti-CD20 mAb',
      'CD79b ADC (polatuzumab)',
      'CD19 CAR-T',
      'CD20xCD3 bispecific',
      'EZH2 inhibitor',
      'BTK inhibitor',
    ],
    lines_of_therapy: ['1L', '2L (salvage)', '3L+ (CAR-T/bispecific)'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Chronic Lymphocytic Leukemia',
    subtypes: [
      {
        name: 'IGHV-mutated',
        prevalence_pct: 50,
        key_biomarkers: ['IGHV mutation', 'del(13q)'],
        standard_of_care: 'BTK inhibitor or venetoclax-obinutuzumab (better prognosis)',
      },
      {
        name: 'IGHV-unmutated',
        prevalence_pct: 50,
        key_biomarkers: ['IGHV unmutated', 'del(11q)', 'trisomy 12'],
        standard_of_care: 'BTK inhibitor (continuous); venetoclax combinations',
      },
      {
        name: 'TP53/del(17p)',
        prevalence_pct: 10,
        key_biomarkers: ['TP53 mutation', 'del(17p)'],
        standard_of_care: 'BTK inhibitor or venetoclax (chemo-refractory)',
      },
    ],
    patient_segments: [
      { segment: 'Treatment-naive', description: 'Frontline therapy options expanding', pct_of_patients: 55 },
      {
        segment: 'Relapsed/refractory',
        description: 'Switch mechanism class (BTK→BCL2 or vice versa)',
        pct_of_patients: 35,
      },
      {
        segment: 'Richter transformation',
        description: 'Aggressive transformation, poor prognosis',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'BTK inhibitor (ibrutinib, acalabrutinib, zanubrutinib)',
      'BCL-2 inhibitor (venetoclax)',
      'Anti-CD20 mAb',
      'PI3K inhibitor',
      'Non-covalent BTK inhibitor (pirtobrutinib)',
      'CAR-T',
      'Bispecific',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Acute Myeloid Leukemia',
    subtypes: [
      {
        name: 'FLT3-mutant',
        prevalence_pct: 30,
        key_biomarkers: ['FLT3-ITD', 'FLT3-TKD'],
        standard_of_care: 'Intensive chemo + midostaurin → ASCT + gilteritinib maintenance',
      },
      {
        name: 'IDH1/2-mutant',
        prevalence_pct: 20,
        key_biomarkers: ['IDH1', 'IDH2'],
        standard_of_care: 'Ivosidenib/enasidenib + azacitidine',
      },
      {
        name: 'TP53-mutant',
        prevalence_pct: 10,
        key_biomarkers: ['TP53'],
        standard_of_care: 'Hypomethylating agents (poor prognosis)',
      },
      {
        name: 'NPM1-mutant',
        prevalence_pct: 30,
        key_biomarkers: ['NPM1'],
        standard_of_care: 'Intensive chemo (favorable if no FLT3-ITD)',
      },
    ],
    patient_segments: [
      { segment: 'Fit for intensive chemo', description: 'Age <60 or fit elderly, 7+3 induction', pct_of_patients: 50 },
      { segment: 'Unfit', description: 'HMA + venetoclax', pct_of_patients: 35 },
      { segment: 'Relapsed/refractory', description: 'Targeted therapy, clinical trials', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'FLT3 inhibitor',
      'IDH1/2 inhibitor',
      'BCL-2 inhibitor',
      'Hypomethylating agent',
      'Menin inhibitor (emerging)',
      'Cytarabine',
      'Anthracycline',
      'Gemtuzumab ozogamicin (CD33 ADC)',
    ],
    lines_of_therapy: ['Induction', 'Consolidation', 'Maintenance', 'R/R'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Follicular Lymphoma',
    subtypes: [
      {
        name: 'Grade 1-2',
        prevalence_pct: 70,
        key_biomarkers: ['BCL2', 'CD20', 'EZH2'],
        standard_of_care: 'Rituximab + bendamustine or obinutuzumab + chemo',
      },
      {
        name: 'Grade 3A',
        prevalence_pct: 20,
        key_biomarkers: ['CD20', 'BCL2'],
        standard_of_care: 'R-CHOP (treated more like DLBCL)',
      },
      {
        name: 'Transformed',
        prevalence_pct: 10,
        key_biomarkers: ['MYC', 'TP53'],
        standard_of_care: 'R-CHOP, salvage → CAR-T if eligible',
      },
    ],
    patient_segments: [
      { segment: 'Watch and wait', description: 'Low tumor burden, asymptomatic', pct_of_patients: 30 },
      { segment: 'Treatment-requiring', description: 'Symptomatic or high tumor burden', pct_of_patients: 50 },
      {
        segment: 'Relapsed/refractory',
        description: 'PI3K inhibitor, EZH2 inhibitor, CAR-T, bispecific',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Anti-CD20 mAb',
      'EZH2 inhibitor (tazemetostat)',
      'PI3K inhibitor',
      'CD20xCD3 bispecific',
      'CAR-T (axi-cel)',
      'Lenalidomide + rituximab',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Myelodysplastic Syndromes',
    subtypes: [
      {
        name: 'Lower-risk (IPSS-R Very Low/Low/Int)',
        prevalence_pct: 60,
        key_biomarkers: ['SF3B1', 'del(5q)', 'EPO level'],
        standard_of_care: 'ESAs, lenalidomide (del5q), luspatercept',
      },
      {
        name: 'Higher-risk',
        prevalence_pct: 40,
        key_biomarkers: ['TP53', 'ASXL1', 'RUNX1', 'EZH2'],
        standard_of_care: 'Azacitidine ± venetoclax; ASCT if eligible',
      },
    ],
    patient_segments: [
      { segment: 'Transfusion-dependent', description: 'Requiring regular red cell transfusions', pct_of_patients: 50 },
      { segment: 'ASCT-eligible', description: 'Fit for allogeneic stem cell transplant', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Hypomethylating agent',
      'TGF-β trap (luspatercept)',
      'IMiD (lenalidomide)',
      'BCL-2 inhibitor',
      'TP53 reactivator (emerging)',
      'ESA',
    ],
    lines_of_therapy: ['1L', '2L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Acute Lymphoblastic Leukemia',
    subtypes: [
      {
        name: 'Ph-positive (BCR-ABL+)',
        prevalence_pct: 25,
        key_biomarkers: ['BCR-ABL', 'Philadelphia chromosome'],
        standard_of_care: 'TKI + chemo or TKI + blinatumomab',
      },
      {
        name: 'Ph-negative B-cell',
        prevalence_pct: 55,
        key_biomarkers: ['CD19', 'CD22', 'MRD'],
        standard_of_care: 'Multi-agent chemo ± blinatumomab; CAR-T if R/R',
      },
      {
        name: 'T-cell ALL',
        prevalence_pct: 20,
        key_biomarkers: ['NOTCH1', 'CD7'],
        standard_of_care: 'Intensive chemotherapy (nelarabine if R/R)',
      },
    ],
    patient_segments: [
      { segment: 'Pediatric/AYA', description: 'Pediatric-inspired regimens, high cure rate', pct_of_patients: 55 },
      { segment: 'Adult (>40)', description: 'Lower intensity, higher relapse risk', pct_of_patients: 35 },
      { segment: 'Relapsed/refractory', description: 'Blinatumomab, inotuzumab, CAR-T', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'CD19xCD3 BiTE (blinatumomab)',
      'CD22 ADC (inotuzumab)',
      'CD19 CAR-T',
      'TKI (Ph+)',
      'Asparaginase',
      'Multi-agent chemotherapy',
    ],
    lines_of_therapy: ['Induction', 'Consolidation', 'Maintenance', 'R/R'],
    therapeutic_area: 'oncology',
  },

  // ──────────────────────────────────────────
  // NEUROLOGY
  // ──────────────────────────────────────────
  {
    indication: "Alzheimer's Disease",
    subtypes: [
      {
        name: 'Early/Mild Cognitive Impairment',
        prevalence_pct: 25,
        key_biomarkers: ['Amyloid PET+', 'p-tau 217', 'CSF Aβ42/40'],
        standard_of_care: 'Lecanemab or donanemab (amyloid+); cholinesterase inhibitors',
      },
      {
        name: 'Moderate',
        prevalence_pct: 40,
        key_biomarkers: ['Amyloid PET+', 'Tau PET+'],
        standard_of_care: 'Cholinesterase inhibitors; memantine',
      },
      {
        name: 'Severe',
        prevalence_pct: 35,
        key_biomarkers: ['Advanced atrophy on MRI'],
        standard_of_care: 'Memantine; supportive care',
      },
    ],
    patient_segments: [
      { segment: 'Amyloid-positive early', description: 'Eligible for anti-amyloid antibodies', pct_of_patients: 25 },
      { segment: 'APOE4 carriers', description: 'Higher amyloid risk, ARIA monitoring needed', pct_of_patients: 40 },
      { segment: 'Late-stage care', description: 'Symptom management and caregiver support', pct_of_patients: 35 },
    ],
    mechanisms_of_action: [
      'Anti-amyloid mAb',
      'Anti-tau mAb (emerging)',
      'Cholinesterase inhibitor',
      'NMDA antagonist',
      'GLP-1 agonist (repurposing)',
      'TREM2 agonist (emerging)',
      'Neuroinflammation modulator',
    ],
    lines_of_therapy: ['Preclinical/prevention', 'Early symptomatic', 'Moderate', 'Severe'],
    therapeutic_area: 'neurology',
  },
  {
    indication: "Parkinson's Disease",
    subtypes: [
      {
        name: 'Tremor-dominant',
        prevalence_pct: 30,
        key_biomarkers: ['Alpha-synuclein SAA', 'DAT-SPECT'],
        standard_of_care: 'Levodopa/carbidopa; dopamine agonists',
      },
      {
        name: 'Akinetic-rigid',
        prevalence_pct: 40,
        key_biomarkers: ['Alpha-synuclein SAA'],
        standard_of_care: 'Levodopa/carbidopa',
      },
      {
        name: 'GBA-associated',
        prevalence_pct: 10,
        key_biomarkers: ['GBA1 mutation'],
        standard_of_care: 'Standard PD therapy; GBA-targeted therapies in trials',
      },
      {
        name: 'LRRK2-associated',
        prevalence_pct: 5,
        key_biomarkers: ['LRRK2 G2019S'],
        standard_of_care: 'Standard PD therapy; LRRK2 inhibitors in trials',
      },
    ],
    patient_segments: [
      {
        segment: 'Early (no motor fluctuations)',
        description: 'Levodopa or dopamine agonist initiation',
        pct_of_patients: 40,
      },
      {
        segment: 'Advanced with motor fluctuations',
        description: 'Levodopa optimization, COMT/MAO-B inhibitors, DBS',
        pct_of_patients: 40,
      },
      {
        segment: 'Late-stage (non-motor dominant)',
        description: 'Dementia, falls, autonomic dysfunction',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Levodopa',
      'Dopamine agonist',
      'MAO-B inhibitor',
      'COMT inhibitor',
      'Alpha-synuclein antibody (emerging)',
      'GBA substrate reduction (emerging)',
      'LRRK2 inhibitor (emerging)',
      'Gene therapy',
    ],
    lines_of_therapy: ['Early motor', 'Motor fluctuations', 'Advanced/DBS'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Multiple Sclerosis',
    subtypes: [
      {
        name: 'Relapsing-Remitting (RRMS)',
        prevalence_pct: 85,
        key_biomarkers: ['OCBs in CSF', 'NfL', 'MRI lesions'],
        standard_of_care: 'High-efficacy DMT (ocrelizumab, natalizumab, ofatumumab)',
      },
      {
        name: 'Secondary Progressive (SPMS)',
        prevalence_pct: 10,
        key_biomarkers: ['NfL', 'Brain atrophy'],
        standard_of_care: 'Siponimod (active SPMS); limited options for non-active',
      },
      {
        name: 'Primary Progressive (PPMS)',
        prevalence_pct: 5,
        key_biomarkers: ['NfL', 'OCBs'],
        standard_of_care: 'Ocrelizumab (only approved DMT for PPMS)',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed RRMS',
        description: 'Early high-efficacy DMT increasingly preferred',
        pct_of_patients: 30,
      },
      { segment: 'Stable on DMT', description: 'Monitoring, may consider de-escalation', pct_of_patients: 45 },
      { segment: 'Progressive disease', description: 'Limited disease-modifying options', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'Anti-CD20 mAb',
      'S1P receptor modulator',
      'Anti-CD20 subcutaneous (ofatumumab)',
      'BTK inhibitor (emerging)',
      'Anti-LINGO-1 (remyelination, emerging)',
      'Cladribine',
      'Natalizumab (anti-VLA-4)',
    ],
    lines_of_therapy: ['1L DMT', '2L DMT', 'Progressive MS'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Amyotrophic Lateral Sclerosis',
    subtypes: [
      {
        name: 'Sporadic ALS',
        prevalence_pct: 85,
        key_biomarkers: ['NfL', 'p75ECD'],
        standard_of_care: 'Riluzole; edaravone; tofersen (SOD1 only)',
      },
      {
        name: 'SOD1-mutant',
        prevalence_pct: 2,
        key_biomarkers: ['SOD1 mutation', 'NfL'],
        standard_of_care: 'Tofersen (SOD1 ASO)',
      },
      {
        name: 'C9orf72 expansion',
        prevalence_pct: 10,
        key_biomarkers: ['C9orf72 repeat expansion'],
        standard_of_care: 'Riluzole; ASO therapies in development',
      },
      {
        name: 'FUS-mutant',
        prevalence_pct: 3,
        key_biomarkers: ['FUS mutation'],
        standard_of_care: 'Supportive care; gene therapy trials',
      },
    ],
    patient_segments: [
      { segment: 'Early (ambulatory)', description: 'Initiate disease-modifying therapy', pct_of_patients: 30 },
      {
        segment: 'Moderate (mobility impaired)',
        description: 'Multidisciplinary care + assistive devices',
        pct_of_patients: 40,
      },
      {
        segment: 'Advanced (ventilator-dependent)',
        description: 'Palliative and respiratory support',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'Antisense oligonucleotide (ASO)',
      'Glutamate antagonist (riluzole)',
      'Free radical scavenger',
      'Gene therapy',
      'Anti-inflammatory',
      'Muscle-directed (emerging)',
    ],
    lines_of_therapy: ['1L', 'Supportive/palliative'],
    therapeutic_area: 'neurology',
  },
  {
    indication: "Huntington's Disease",
    subtypes: [
      {
        name: 'Adult-onset (36-39 CAG)',
        prevalence_pct: 70,
        key_biomarkers: ['HTT CAG repeats', 'mHTT CSF'],
        standard_of_care: 'Tetrabenazine/deutetrabenazine (chorea); supportive care',
      },
      {
        name: 'Juvenile-onset (>60 CAG)',
        prevalence_pct: 5,
        key_biomarkers: ['HTT CAG repeats ≥60'],
        standard_of_care: 'Symptom management',
      },
    ],
    patient_segments: [
      {
        segment: 'Premanifest gene carriers',
        description: 'Genetic counseling, monitoring, prevention trials',
        pct_of_patients: 30,
      },
      { segment: 'Early manifest', description: 'Motor and psychiatric symptom management', pct_of_patients: 35 },
      { segment: 'Advanced', description: 'Full-time care, palliative approach', pct_of_patients: 35 },
    ],
    mechanisms_of_action: [
      'HTT-lowering ASO (emerging)',
      'VMAT2 inhibitor',
      'Dopamine modulator',
      'Gene therapy (emerging)',
      'Anti-inflammatory',
    ],
    lines_of_therapy: ['Symptomatic', 'Disease-modifying (emerging)'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Epilepsy',
    subtypes: [
      {
        name: 'Focal (partial) epilepsy',
        prevalence_pct: 60,
        key_biomarkers: ['EEG focal spikes', 'MRI lesion'],
        standard_of_care: 'Levetiracetam, lamotrigine, lacosamide',
      },
      {
        name: 'Generalized epilepsy',
        prevalence_pct: 30,
        key_biomarkers: ['EEG generalized spike-wave'],
        standard_of_care: 'Valproate, lamotrigine, levetiracetam',
      },
      {
        name: 'Drug-resistant epilepsy',
        prevalence_pct: 30,
        key_biomarkers: ['Failure of ≥2 ASMs'],
        standard_of_care: 'Cenobamate, VNS, RNS, surgery evaluation',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'First ASM monotherapy', pct_of_patients: 35 },
      { segment: 'Controlled on ASM', description: 'Stable, monitoring for seizure freedom', pct_of_patients: 35 },
      {
        segment: 'Drug-resistant',
        description: 'Polytherapy, neuromodulation, surgery candidates',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'Sodium channel blocker',
      'SV2A modulator',
      'GABA enhancer',
      'Calcium channel modulator',
      'AMPA antagonist',
      'Potassium channel opener',
    ],
    lines_of_therapy: ['1L monotherapy', '2L monotherapy', 'Adjunctive/polytherapy', 'Surgery/neuromodulation'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Migraine',
    subtypes: [
      {
        name: 'Episodic migraine (<15 days/month)',
        prevalence_pct: 85,
        key_biomarkers: ['CGRP levels'],
        standard_of_care: 'Triptans (acute); CGRP mAb preventive if ≥4 days/month',
      },
      {
        name: 'Chronic migraine (≥15 days/month)',
        prevalence_pct: 15,
        key_biomarkers: ['CGRP levels'],
        standard_of_care: 'CGRP mAb, botulinum toxin, topiramate',
      },
    ],
    patient_segments: [
      { segment: 'Acute-only treatment', description: 'Triptans, NSAIDs, gepants PRN', pct_of_patients: 50 },
      { segment: 'Preventive therapy', description: 'CGRP mAb or oral preventive', pct_of_patients: 35 },
      { segment: 'Refractory', description: 'Failed ≥3 preventives, neuromodulation', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'CGRP mAb',
      'CGRP receptor antagonist (gepant)',
      '5-HT1B/1D agonist (triptan)',
      'Ditan (5-HT1F)',
      'Botulinum toxin',
      'Neuromodulation',
      'Beta-blocker',
      'Anticonvulsant',
    ],
    lines_of_therapy: ['Acute', 'Preventive 1L', 'Preventive 2L+'],
    therapeutic_area: 'neurology',
  },

  // ──────────────────────────────────────────
  // IMMUNOLOGY
  // ──────────────────────────────────────────
  {
    indication: 'Rheumatoid Arthritis',
    subtypes: [
      {
        name: 'Seropositive (RF+ and/or anti-CCP+)',
        prevalence_pct: 70,
        key_biomarkers: ['RF', 'anti-CCP', 'ESR', 'CRP'],
        standard_of_care: 'Methotrexate → TNF inhibitor or JAK inhibitor',
      },
      {
        name: 'Seronegative',
        prevalence_pct: 30,
        key_biomarkers: ['Imaging erosions', 'CRP'],
        standard_of_care: 'Methotrexate → biologic DMARD',
      },
    ],
    patient_segments: [
      { segment: 'Early RA (<2 years)', description: 'MTX initiation, window of opportunity', pct_of_patients: 25 },
      { segment: 'Established RA, MTX-IR', description: 'Add bDMARD (TNFi, IL-6i, JAKi)', pct_of_patients: 40 },
      { segment: 'Multi-refractory', description: 'Failed ≥2 bDMARDs, switching mechanism', pct_of_patients: 20 },
      { segment: 'Remission/low disease', description: 'Dose reduction or tapering', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'TNF inhibitor',
      'IL-6 receptor inhibitor',
      'JAK inhibitor',
      'CTLA-4 Ig (abatacept)',
      'Anti-CD20 (rituximab)',
      'Methotrexate',
      'T-cell co-stimulation modulator',
    ],
    lines_of_therapy: ['csDMARD (MTX)', 'bDMARD 1L', 'bDMARD 2L', 'JAKi'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Atopic Dermatitis',
    subtypes: [
      {
        name: 'Mild-moderate',
        prevalence_pct: 70,
        key_biomarkers: ['IgE', 'Eosinophils', 'TARC'],
        standard_of_care: 'Topical corticosteroids, calcineurin inhibitors',
      },
      {
        name: 'Moderate-severe',
        prevalence_pct: 30,
        key_biomarkers: ['IgE', 'Eosinophils', 'IL-13', 'TARC'],
        standard_of_care: 'Dupilumab or JAK inhibitor (abrocitinib, upadacitinib)',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (<12 years)',
        description: 'Topicals first; dupilumab if moderate-severe',
        pct_of_patients: 35,
      },
      {
        segment: 'Adolescent/adult topical-controlled',
        description: 'Topical therapy sufficient',
        pct_of_patients: 35,
      },
      { segment: 'Adult systemic-requiring', description: 'Dupilumab, JAKi, or tralokinumab', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'IL-4/IL-13 inhibitor (dupilumab)',
      'IL-13 inhibitor (tralokinumab)',
      'JAK inhibitor',
      'IL-31 receptor antagonist (nemolizumab)',
      'OX40 inhibitor (emerging)',
      'PDE4 inhibitor (topical)',
      'Topical JAKi',
    ],
    lines_of_therapy: ['Topical', 'Systemic 1L', 'Systemic 2L'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Psoriasis',
    subtypes: [
      {
        name: 'Plaque psoriasis',
        prevalence_pct: 85,
        key_biomarkers: ['PASI score', 'IL-17', 'IL-23'],
        standard_of_care: 'IL-23 inhibitor or IL-17 inhibitor (moderate-severe)',
      },
      { name: 'Guttate', prevalence_pct: 8, key_biomarkers: ['ASO titer'], standard_of_care: 'Topical; phototherapy' },
      {
        name: 'Pustular',
        prevalence_pct: 3,
        key_biomarkers: ['IL-36'],
        standard_of_care: 'Spesolimab (IL-36R inhibitor) for flares',
      },
      {
        name: 'Erythrodermic',
        prevalence_pct: 2,
        key_biomarkers: ['Extensive involvement'],
        standard_of_care: 'Systemic biologics, cyclosporine for acute',
      },
    ],
    patient_segments: [
      { segment: 'Mild (topical-managed)', description: 'BSA <3%, topical steroids/vitamin D', pct_of_patients: 50 },
      {
        segment: 'Moderate-severe (systemic)',
        description: 'BSA ≥3% or significant impact, biologic therapy',
        pct_of_patients: 40,
      },
      { segment: 'Biologic-experienced', description: 'Failed ≥1 biologic, switching class', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'IL-23 inhibitor',
      'IL-17A inhibitor',
      'IL-17A/F inhibitor',
      'TNF inhibitor',
      'IL-36R inhibitor',
      'TYK2 inhibitor (deucravacitinib)',
      'PDE4 inhibitor',
      'JAK inhibitor',
    ],
    lines_of_therapy: ['Topical', 'Phototherapy', 'Systemic 1L', 'Systemic 2L+'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Systemic Lupus Erythematosus',
    subtypes: [
      {
        name: 'Lupus nephritis',
        prevalence_pct: 40,
        key_biomarkers: ['Anti-dsDNA', 'C3/C4', 'Proteinuria'],
        standard_of_care: 'MMF + belimumab or voclosporin; cyclophosphamide for severe',
      },
      {
        name: 'Cutaneous/articular',
        prevalence_pct: 80,
        key_biomarkers: ['ANA', 'Anti-dsDNA'],
        standard_of_care: 'Hydroxychloroquine + low-dose steroids',
      },
      {
        name: 'Hematologic',
        prevalence_pct: 20,
        key_biomarkers: ['Cytopenias', 'Anti-dsDNA'],
        standard_of_care: 'Steroids; rituximab for refractory',
      },
    ],
    patient_segments: [
      { segment: 'Mild (skin/joints)', description: 'HCQ + NSAIDs', pct_of_patients: 40 },
      { segment: 'Moderate (organ-threatening)', description: 'Immunosuppressants + belimumab', pct_of_patients: 35 },
      { segment: 'Severe/refractory', description: 'Cyclophosphamide, rituximab, anifrolumab', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'BLyS inhibitor (belimumab)',
      'Type I IFN receptor inhibitor (anifrolumab)',
      'Calcineurin inhibitor (voclosporin)',
      'Anti-CD20 (rituximab)',
      'CAR-T (emerging)',
      'HCQ',
      'MMF',
      'JAK inhibitor (emerging)',
    ],
    lines_of_therapy: ['HCQ baseline', 'Immunosuppressant', 'Biologic', 'Refractory'],
    therapeutic_area: 'immunology',
  },
  {
    indication: "Crohn's Disease",
    subtypes: [
      {
        name: 'Ileal',
        prevalence_pct: 30,
        key_biomarkers: ['CRP', 'Fecal calprotectin', 'ASCA'],
        standard_of_care: 'Budesonide (mild); anti-TNF or vedolizumab (moderate-severe)',
      },
      {
        name: 'Ileocolonic',
        prevalence_pct: 40,
        key_biomarkers: ['CRP', 'Fecal calprotectin'],
        standard_of_care: 'Anti-TNF or ustekinumab (moderate-severe)',
      },
      {
        name: 'Colonic',
        prevalence_pct: 25,
        key_biomarkers: ['CRP', 'pANCA'],
        standard_of_care: 'Anti-TNF, vedolizumab, or JAK inhibitor',
      },
      {
        name: 'Perianal fistulizing',
        prevalence_pct: 20,
        key_biomarkers: ['MRI perianal'],
        standard_of_care: 'Infliximab + surgical drainage; stem cell injection',
      },
    ],
    patient_segments: [
      {
        segment: 'Biologic-naive',
        description: 'First biologic after conventional therapy failure',
        pct_of_patients: 40,
      },
      { segment: 'Biologic-experienced', description: 'Failed ≥1 biologic, switching mechanism', pct_of_patients: 30 },
      { segment: 'Surgical candidates', description: 'Stricturing/penetrating requiring surgery', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'TNF inhibitor',
      'IL-23 inhibitor (risankizumab, guselkumab)',
      'IL-12/23 inhibitor (ustekinumab)',
      'Integrin inhibitor (vedolizumab)',
      'JAK inhibitor (upadacitinib)',
      'S1P modulator (ozanimod)',
      'Anti-TL1A (emerging)',
    ],
    lines_of_therapy: ['Conventional (5-ASA, steroids)', 'Biologic 1L', 'Biologic 2L', 'Surgery'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Ulcerative Colitis',
    subtypes: [
      {
        name: 'Proctitis (rectum only)',
        prevalence_pct: 30,
        key_biomarkers: ['Fecal calprotectin', 'Mayo endoscopic score'],
        standard_of_care: 'Topical 5-ASA (mesalamine suppository)',
      },
      {
        name: 'Left-sided colitis',
        prevalence_pct: 30,
        key_biomarkers: ['Fecal calprotectin', 'CRP'],
        standard_of_care: 'Oral + topical 5-ASA; escalate to biologic if needed',
      },
      {
        name: 'Extensive/pancolitis',
        prevalence_pct: 40,
        key_biomarkers: ['Fecal calprotectin', 'CRP', 'pANCA'],
        standard_of_care: 'Biologic (anti-TNF, vedolizumab, or JAKi) for moderate-severe',
      },
    ],
    patient_segments: [
      { segment: 'Mild', description: '5-ASA adequate', pct_of_patients: 40 },
      { segment: 'Moderate-severe biologic-naive', description: 'First biologic therapy', pct_of_patients: 30 },
      {
        segment: 'Biologic-refractory',
        description: 'Switching biologics or colectomy consideration',
        pct_of_patients: 20,
      },
      {
        segment: 'Acute severe (hospitalized)',
        description: 'IV steroids → infliximab or surgery',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'TNF inhibitor',
      'Integrin inhibitor',
      'JAK inhibitor (tofacitinib, upadacitinib)',
      'IL-23 inhibitor (mirikizumab)',
      'S1P modulator',
      'Anti-TL1A (emerging)',
      '5-ASA',
    ],
    lines_of_therapy: ['5-ASA', 'Biologic 1L', 'Biologic 2L', 'Surgery'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Psoriatic Arthritis',
    subtypes: [
      {
        name: 'Peripheral arthritis predominant',
        prevalence_pct: 60,
        key_biomarkers: ['HLA-B27 (30%)', 'CRP', 'ESR'],
        standard_of_care: 'TNF inhibitor or IL-17 inhibitor',
      },
      {
        name: 'Axial predominant',
        prevalence_pct: 20,
        key_biomarkers: ['HLA-B27', 'MRI sacroiliitis'],
        standard_of_care: 'TNF inhibitor or IL-17 inhibitor',
      },
      {
        name: 'Enthesitis/dactylitis',
        prevalence_pct: 20,
        key_biomarkers: ['Ultrasound enthesitis'],
        standard_of_care: 'IL-17 or IL-23 inhibitor',
      },
    ],
    patient_segments: [
      { segment: 'csDMARD-naive', description: 'Starting MTX or biologic directly', pct_of_patients: 30 },
      { segment: 'MTX-inadequate response', description: 'Escalating to biologic DMARD', pct_of_patients: 40 },
      { segment: 'bDMARD-experienced', description: 'Switching biologic mechanism', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'TNF inhibitor',
      'IL-17A inhibitor',
      'IL-17A/F inhibitor',
      'IL-23 inhibitor',
      'JAK inhibitor',
      'PDE4 inhibitor (apremilast)',
      'CTLA-4 Ig',
    ],
    lines_of_therapy: ['csDMARD', 'bDMARD 1L', 'bDMARD 2L', 'JAKi'],
    therapeutic_area: 'immunology',
  },

  // ──────────────────────────────────────────
  // CARDIOLOGY
  // ──────────────────────────────────────────
  {
    indication: 'Heart Failure',
    subtypes: [
      {
        name: 'HFrEF (EF ≤40%)',
        prevalence_pct: 50,
        key_biomarkers: ['NT-proBNP', 'BNP', 'LVEF'],
        standard_of_care: 'GDMT: ARNI + beta-blocker + MRA + SGLT2i',
      },
      {
        name: 'HFpEF (EF ≥50%)',
        prevalence_pct: 40,
        key_biomarkers: ['NT-proBNP', "E/e' ratio"],
        standard_of_care: 'SGLT2 inhibitor; diuretics; address comorbidities',
      },
      {
        name: 'HFmrEF (EF 41-49%)',
        prevalence_pct: 10,
        key_biomarkers: ['NT-proBNP'],
        standard_of_care: 'Consider GDMT as per HFrEF',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'GDMT initiation and up-titration', pct_of_patients: 20 },
      { segment: 'Stable on GDMT', description: 'Optimized on 4-pillar therapy', pct_of_patients: 45 },
      {
        segment: 'Advanced/refractory',
        description: 'LVAD, transplant evaluation, palliative care',
        pct_of_patients: 15,
      },
      { segment: 'Acute decompensated', description: 'IV diuretics, vasodilators, inotropes', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'SGLT2 inhibitor',
      'ARNI (sacubitril/valsartan)',
      'MRA',
      'Beta-blocker',
      'Cardiac myosin activator (omecamtiv)',
      'sGC stimulator (vericiguat)',
      'IV iron (carboxymaltose)',
    ],
    lines_of_therapy: ['GDMT initiation', 'GDMT optimization', 'Advanced therapies'],
    therapeutic_area: 'cardiology',
  },
  {
    indication: 'Atrial Fibrillation',
    subtypes: [
      {
        name: 'Paroxysmal',
        prevalence_pct: 35,
        key_biomarkers: ['ECG/Holter AF', 'CHA2DS2-VASc'],
        standard_of_care: 'Rate control + DOAC; rhythm control if symptomatic',
      },
      {
        name: 'Persistent',
        prevalence_pct: 35,
        key_biomarkers: ['ECG continuous AF', 'LA size'],
        standard_of_care: 'Rate/rhythm control + DOAC; ablation if drugs fail',
      },
      {
        name: 'Long-standing persistent / permanent',
        prevalence_pct: 30,
        key_biomarkers: ['LA dilation'],
        standard_of_care: 'Rate control + DOAC; accept permanent AF',
      },
    ],
    patient_segments: [
      { segment: 'Rate control strategy', description: 'Beta-blocker or CCB + anticoagulation', pct_of_patients: 50 },
      { segment: 'Rhythm control strategy', description: 'Antiarrhythmics or catheter ablation', pct_of_patients: 35 },
      {
        segment: 'Ablation candidates',
        description: 'PVI ablation for symptomatic, drug-refractory',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'DOAC (apixaban, rivaroxaban)',
      'Beta-blocker',
      'Calcium channel blocker',
      'Class III antiarrhythmic (amiodarone, dronedarone)',
      'Class IC antiarrhythmic (flecainide)',
      'Left atrial appendage closure',
      'Catheter ablation',
    ],
    lines_of_therapy: ['Rate control', 'Rhythm control', 'Ablation'],
    therapeutic_area: 'cardiology',
  },
  {
    indication: 'Pulmonary Arterial Hypertension',
    subtypes: [
      {
        name: 'Idiopathic PAH',
        prevalence_pct: 45,
        key_biomarkers: ['NT-proBNP', 'mPAP', 'PVR', '6MWD'],
        standard_of_care: 'ERA + PDE5i; prostacyclin pathway if severe',
      },
      {
        name: 'Connective tissue disease-associated',
        prevalence_pct: 25,
        key_biomarkers: ['ANA', 'mPAP'],
        standard_of_care: 'Same PAH therapy + treat underlying CTD',
      },
      {
        name: 'Drug/toxin-induced',
        prevalence_pct: 10,
        key_biomarkers: ['mPAP', 'PVR'],
        standard_of_care: 'Remove offending agent; PAH-specific therapy',
      },
    ],
    patient_segments: [
      { segment: 'Low risk', description: 'Oral dual combination (ERA + PDE5i)', pct_of_patients: 30 },
      { segment: 'Intermediate risk', description: 'Triple therapy (ERA + PDE5i + prostacyclin)', pct_of_patients: 40 },
      { segment: 'High risk', description: 'IV prostacyclin + transplant evaluation', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Endothelin receptor antagonist',
      'PDE5 inhibitor',
      'sGC stimulator (riociguat)',
      'Prostacyclin analog',
      'IP receptor agonist (selexipag)',
      'Activin signaling inhibitor (sotatercept)',
    ],
    lines_of_therapy: ['Monotherapy', 'Dual combination', 'Triple combination', 'IV prostacyclin'],
    therapeutic_area: 'cardiology',
  },

  // ──────────────────────────────────────────
  // METABOLIC
  // ──────────────────────────────────────────
  {
    indication: 'Type 2 Diabetes Mellitus',
    subtypes: [
      {
        name: 'Without cardiovascular disease',
        prevalence_pct: 70,
        key_biomarkers: ['HbA1c', 'Fasting glucose', 'C-peptide'],
        standard_of_care: 'Metformin → GLP-1 RA or SGLT2i',
      },
      {
        name: 'With established ASCVD',
        prevalence_pct: 20,
        key_biomarkers: ['HbA1c', 'LDL-C', 'hsCRP'],
        standard_of_care: 'GLP-1 RA or SGLT2i (CV benefit) + metformin',
      },
      {
        name: 'With heart failure/CKD',
        prevalence_pct: 10,
        key_biomarkers: ['eGFR', 'UACR', 'NT-proBNP'],
        standard_of_care: 'SGLT2 inhibitor (organ protection) + metformin',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed',
        description: 'Metformin + lifestyle; consider GLP-1 RA early',
        pct_of_patients: 20,
      },
      { segment: 'On oral agents', description: 'Metformin + DPP-4i or SGLT2i or GLP-1 RA', pct_of_patients: 45 },
      { segment: 'Injectable required', description: 'GLP-1 RA or basal insulin', pct_of_patients: 25 },
      { segment: 'Insulin-dependent', description: 'Basal-bolus or insulin pump', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'GLP-1 receptor agonist',
      'GIP/GLP-1 dual agonist (tirzepatide)',
      'SGLT2 inhibitor',
      'DPP-4 inhibitor',
      'Metformin',
      'Basal insulin',
      'GLP-1/GIP/glucagon triagonist (emerging)',
      'Amylin analog',
    ],
    lines_of_therapy: ['1L (metformin)', '2L (add GLP-1 or SGLT2i)', '3L (triple oral/injectable)', 'Insulin'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Obesity',
    subtypes: [
      {
        name: 'Class I (BMI 30-34.9)',
        prevalence_pct: 45,
        key_biomarkers: ['BMI', 'Waist circumference'],
        standard_of_care: 'Lifestyle + GLP-1 RA (semaglutide 2.4mg) or tirzepatide',
      },
      {
        name: 'Class II (BMI 35-39.9)',
        prevalence_pct: 30,
        key_biomarkers: ['BMI', 'Comorbidities'],
        standard_of_care: 'GLP-1 RA or tirzepatide; bariatric surgery if comorbidities',
      },
      {
        name: 'Class III (BMI ≥40)',
        prevalence_pct: 25,
        key_biomarkers: ['BMI'],
        standard_of_care: 'Anti-obesity medication + bariatric surgery evaluation',
      },
    ],
    patient_segments: [
      {
        segment: 'Lifestyle intervention only',
        description: 'Diet and exercise without pharmacotherapy',
        pct_of_patients: 30,
      },
      { segment: 'Anti-obesity medication', description: 'GLP-1 RA, tirzepatide, or combination', pct_of_patients: 45 },
      {
        segment: 'Bariatric surgery candidates',
        description: 'BMI ≥40 or ≥35 with comorbidities',
        pct_of_patients: 15,
      },
      {
        segment: 'Post-bariatric',
        description: 'Maintenance, revision, or AOM for weight regain',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'GLP-1 receptor agonist',
      'GIP/GLP-1 dual agonist',
      'GLP-1/GIP/glucagon triagonist (emerging)',
      'Amylin analog (cagrilintide)',
      'MC4R agonist',
      'Oral GLP-1 (emerging)',
      'Bariatric surgery',
    ],
    lines_of_therapy: ['Lifestyle', 'Monotherapy AOM', 'Combination AOM', 'Bariatric surgery'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'NASH/MASH',
    subtypes: [
      {
        name: 'MASH without fibrosis (F0-F1)',
        prevalence_pct: 40,
        key_biomarkers: ['FIB-4', 'ELF score', 'ALT/AST'],
        standard_of_care: 'Lifestyle intervention, weight loss',
      },
      {
        name: 'MASH with significant fibrosis (F2-F3)',
        prevalence_pct: 35,
        key_biomarkers: ['FibroScan', 'ELF', 'NFS'],
        standard_of_care: 'Resmetirom (F2-F3); GLP-1 RA for weight loss',
      },
      {
        name: 'MASH cirrhosis (F4)',
        prevalence_pct: 25,
        key_biomarkers: ['FibroScan >14 kPa', 'Platelet count', 'MELD'],
        standard_of_care: 'Resmetirom; transplant evaluation if decompensated',
      },
    ],
    patient_segments: [
      {
        segment: 'Early-stage (lifestyle manageable)',
        description: 'Weight loss target ≥7% body weight',
        pct_of_patients: 40,
      },
      {
        segment: 'Pharmacotherapy candidates',
        description: 'F2+ fibrosis, eligible for resmetirom or GLP-1 RA',
        pct_of_patients: 40,
      },
      { segment: 'Cirrhotic', description: 'Liver-directed therapy + transplant evaluation', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'THR-β agonist (resmetirom)',
      'GLP-1 receptor agonist',
      'FXR agonist',
      'FGF21 analog',
      'PPAR agonist (lanifibranor)',
      'ACC inhibitor',
      'GLP-1/GIP/glucagon triagonist (emerging)',
    ],
    lines_of_therapy: ['Lifestyle', 'Pharmacotherapy', 'Transplant'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Dyslipidemia',
    subtypes: [
      {
        name: 'Primary hypercholesterolemia',
        prevalence_pct: 85,
        key_biomarkers: ['LDL-C', 'non-HDL-C', 'ApoB'],
        standard_of_care: 'Statin → ezetimibe → PCSK9 inhibitor',
      },
      {
        name: 'Homozygous FH',
        prevalence_pct: 0.03,
        key_biomarkers: ['LDLR mutations', 'LDL-C >500'],
        standard_of_care: 'Max-dose statin + ezetimibe + PCSK9i + lomitapide',
      },
      {
        name: 'Elevated Lp(a)',
        prevalence_pct: 20,
        key_biomarkers: ['Lp(a) >50 mg/dL'],
        standard_of_care: 'No approved Lp(a)-lowering therapy yet; pelacarsen in trials',
      },
    ],
    patient_segments: [
      { segment: 'Primary prevention', description: 'Statin based on ASCVD risk score', pct_of_patients: 60 },
      {
        segment: 'Secondary prevention (established ASCVD)',
        description: 'High-intensity statin + LDL-C target <55 mg/dL',
        pct_of_patients: 30,
      },
      { segment: 'Statin-intolerant', description: 'Bempedoic acid, ezetimibe, PCSK9i', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Statin',
      'PCSK9 inhibitor (mAb)',
      'PCSK9 siRNA (inclisiran)',
      'Ezetimibe',
      'Bempedoic acid',
      'Lp(a) ASO (pelacarsen, emerging)',
      'ANGPTL3 inhibitor',
      'ApoC-III inhibitor',
    ],
    lines_of_therapy: ['Statin', 'Statin + ezetimibe', '+ PCSK9 inhibitor', 'Novel targets'],
    therapeutic_area: 'metabolic',
  },

  // ──────────────────────────────────────────
  // RARE DISEASES
  // ──────────────────────────────────────────
  {
    indication: 'Spinal Muscular Atrophy',
    subtypes: [
      {
        name: 'Type 1 (Werdnig-Hoffmann)',
        prevalence_pct: 50,
        key_biomarkers: ['SMN1 deletion', 'SMN2 copy number'],
        standard_of_care: 'Onasemnogene (gene therapy) or nusinersen; risdiplam',
      },
      {
        name: 'Type 2 (intermediate)',
        prevalence_pct: 30,
        key_biomarkers: ['SMN1 deletion', 'SMN2 2-3 copies'],
        standard_of_care: 'Nusinersen or risdiplam',
      },
      {
        name: 'Type 3 (Kugelberg-Welander)',
        prevalence_pct: 20,
        key_biomarkers: ['SMN1 deletion', 'SMN2 3-4 copies'],
        standard_of_care: 'Risdiplam',
      },
    ],
    patient_segments: [
      {
        segment: 'Pre-symptomatic (newborn screen)',
        description: 'Earliest treatment for best outcomes',
        pct_of_patients: 15,
      },
      { segment: 'Infantile onset', description: 'Gene therapy preferred if <2 years', pct_of_patients: 35 },
      {
        segment: 'Later onset (child/adult)',
        description: 'SMN2 splicing modifier (risdiplam/nusinersen)',
        pct_of_patients: 50,
      },
    ],
    mechanisms_of_action: [
      'Gene replacement therapy (onasemnogene)',
      'SMN2 splicing modifier (nusinersen ASO)',
      'SMN2 splicing modifier (risdiplam, oral)',
      'Muscle-directed therapy (emerging)',
    ],
    lines_of_therapy: ['1L (gene therapy or splicing modifier)', 'Combination (emerging)'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Duchenne Muscular Dystrophy',
    subtypes: [
      {
        name: 'Exon 51 skippable',
        prevalence_pct: 13,
        key_biomarkers: ['DMD exon 51 deletion'],
        standard_of_care: 'Eteplirsen (exon skipping ASO)',
      },
      {
        name: 'Exon 53 skippable',
        prevalence_pct: 8,
        key_biomarkers: ['DMD exon 53 deletion'],
        standard_of_care: 'Golodirsen/viltolarsen',
      },
      {
        name: 'Non-skippable / other',
        prevalence_pct: 70,
        key_biomarkers: ['CK levels', 'Dystrophin on biopsy'],
        standard_of_care: 'Corticosteroids (deflazacort); gene therapy (delandistrogene, micro-dystrophin)',
      },
    ],
    patient_segments: [
      {
        segment: 'Ambulatory (<12 years)',
        description: 'Corticosteroids, exon skipping if eligible, gene therapy',
        pct_of_patients: 50,
      },
      { segment: 'Non-ambulatory', description: 'Cardiac/respiratory management + continued DMT', pct_of_patients: 50 },
    ],
    mechanisms_of_action: [
      'Exon-skipping ASO',
      'Gene therapy (micro-dystrophin)',
      'Corticosteroids',
      'Utrophin upregulator (emerging)',
      'Anti-myostatin',
      'CRISPR gene editing (emerging)',
    ],
    lines_of_therapy: ['Corticosteroids', 'Gene therapy / exon skipping', 'Supportive care'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Cystic Fibrosis',
    subtypes: [
      {
        name: 'F508del homozygous',
        prevalence_pct: 45,
        key_biomarkers: ['CFTR F508del/F508del'],
        standard_of_care: 'Elexacaftor/tezacaftor/ivacaftor (Trikafta)',
      },
      {
        name: 'F508del heterozygous + minimal function',
        prevalence_pct: 25,
        key_biomarkers: ['F508del + other CFTR mutation'],
        standard_of_care: 'Elexacaftor/tezacaftor/ivacaftor',
      },
      {
        name: 'Gating mutations (G551D)',
        prevalence_pct: 5,
        key_biomarkers: ['G551D or other gating'],
        standard_of_care: 'Ivacaftor monotherapy',
      },
      {
        name: 'Non-modulator eligible',
        prevalence_pct: 10,
        key_biomarkers: ['Nonsense/splice mutations'],
        standard_of_care: 'Symptomatic (airway clearance, enzymes); mRNA therapy trials',
      },
    ],
    patient_segments: [
      {
        segment: 'CFTR modulator-eligible',
        description: '~90% of CF patients can benefit from Trikafta',
        pct_of_patients: 90,
      },
      {
        segment: 'Non-modulator eligible',
        description: 'Symptomatic management; gene/mRNA therapy trials',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'CFTR modulator (corrector + potentiator)',
      'CFTR potentiator (ivacaftor)',
      'mRNA therapy (emerging)',
      'Gene therapy (emerging)',
      'ENaC inhibitor (emerging)',
      'Anti-inflammatory',
    ],
    lines_of_therapy: ['CFTR modulator', 'Symptomatic (airway clearance, enzymes, antibiotics)'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Fabry Disease',
    subtypes: [
      {
        name: 'Classic (males)',
        prevalence_pct: 60,
        key_biomarkers: ['Alpha-galactosidase A activity', 'Globotriaosylsphingosine (lyso-Gb3)'],
        standard_of_care: 'Enzyme replacement therapy (agalsidase) or migalastat',
      },
      {
        name: 'Late-onset/attenuated',
        prevalence_pct: 40,
        key_biomarkers: ['GLA mutation', 'Lyso-Gb3'],
        standard_of_care: 'Migalastat (amenable mutations); ERT if severe',
      },
    ],
    patient_segments: [
      { segment: 'ERT-treated', description: 'Biweekly IV infusions', pct_of_patients: 60 },
      {
        segment: 'Oral chaperone (migalastat)',
        description: 'Amenable GLA mutation, oral therapy',
        pct_of_patients: 25,
      },
      { segment: 'Treatment-naive/monitoring', description: 'Mild disease, periodic assessment', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy',
      'Pharmacological chaperone (migalastat)',
      'Substrate reduction therapy (emerging)',
      'Gene therapy (emerging)',
      'mRNA therapy (emerging)',
    ],
    lines_of_therapy: ['ERT or chaperone', 'Gene therapy (emerging)'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Gaucher Disease',
    subtypes: [
      {
        name: 'Type 1 (non-neuronopathic)',
        prevalence_pct: 94,
        key_biomarkers: ['GBA1 activity', 'Chitotriosidase', 'Lyso-Gb1'],
        standard_of_care: 'ERT (imiglucerase) or SRT (eliglustat)',
      },
      {
        name: 'Type 2 (acute neuronopathic)',
        prevalence_pct: 1,
        key_biomarkers: ['GBA1 activity', 'CNS involvement'],
        standard_of_care: 'No effective therapy; supportive care',
      },
      {
        name: 'Type 3 (chronic neuronopathic)',
        prevalence_pct: 5,
        key_biomarkers: ['GBA1 activity', 'Mild CNS involvement'],
        standard_of_care: 'ERT for systemic disease; CNS untreated',
      },
    ],
    patient_segments: [
      { segment: 'ERT-treated', description: 'Biweekly IV infusions, well-controlled', pct_of_patients: 50 },
      { segment: 'SRT (oral eliglustat)', description: 'CYP2D6-based dosing, oral option', pct_of_patients: 30 },
      { segment: 'Untreated/mild', description: 'Monitoring without active treatment', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy',
      'Substrate reduction therapy (eliglustat)',
      'Gene therapy (emerging)',
      'Small molecule chaperone (emerging)',
    ],
    lines_of_therapy: ['ERT', 'SRT (switch or naive)', 'Gene therapy (emerging)'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hemophilia A',
    subtypes: [
      {
        name: 'Severe (<1% FVIII)',
        prevalence_pct: 50,
        key_biomarkers: ['FVIII activity <1%', 'Inhibitor status'],
        standard_of_care: 'Emicizumab prophylaxis; gene therapy (valoctocogene)',
      },
      {
        name: 'Moderate (1-5% FVIII)',
        prevalence_pct: 25,
        key_biomarkers: ['FVIII 1-5%'],
        standard_of_care: 'On-demand or prophylactic FVIII; emicizumab',
      },
      {
        name: 'Mild (5-40% FVIII)',
        prevalence_pct: 25,
        key_biomarkers: ['FVIII 5-40%'],
        standard_of_care: 'DDAVP or on-demand FVIII',
      },
    ],
    patient_segments: [
      {
        segment: 'Without inhibitors',
        description: 'Standard prophylaxis (FVIII, emicizumab, gene therapy)',
        pct_of_patients: 70,
      },
      { segment: 'With inhibitors', description: 'Emicizumab or bypassing agents; ITI', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Factor VIII replacement',
      'Bispecific antibody (emicizumab)',
      'Gene therapy (AAV-FVIII)',
      'Anti-TFPI (concizumab/fitusiran, emerging)',
      'Rebalancing agents',
    ],
    lines_of_therapy: ['Prophylaxis', 'On-demand', 'Gene therapy'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Phenylketonuria',
    subtypes: [
      {
        name: 'Classic PKU (Phe >1200 µmol/L)',
        prevalence_pct: 50,
        key_biomarkers: ['Blood phenylalanine', 'PAH genotype'],
        standard_of_care: 'Dietary Phe restriction + pegvaliase (if adult)',
      },
      {
        name: 'Moderate PKU (600-1200 µmol/L)',
        prevalence_pct: 30,
        key_biomarkers: ['Blood phenylalanine', 'BH4 responsiveness'],
        standard_of_care: 'Diet + sapropterin (BH4-responsive)',
      },
      {
        name: 'Mild hyperphenylalaninemia',
        prevalence_pct: 20,
        key_biomarkers: ['Phe 360-600 µmol/L'],
        standard_of_care: 'Dietary management; sapropterin trial',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (diet-managed)',
        description: 'Strict Phe-restricted diet from birth',
        pct_of_patients: 40,
      },
      { segment: 'Adult on enzyme substitution', description: 'Pegvaliase for uncontrolled Phe', pct_of_patients: 25 },
      { segment: 'BH4-responsive', description: 'Sapropterin + relaxed diet', pct_of_patients: 25 },
      {
        segment: 'Off-diet adult',
        description: 'Poor adherence, elevated Phe, neuropsych effects',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Enzyme substitution (pegvaliase)',
      'BH4 cofactor (sapropterin)',
      'Gene therapy (emerging)',
      'mRNA therapy (emerging)',
      'Dietary Phe restriction',
    ],
    lines_of_therapy: ['Diet', 'Sapropterin (BH4-responsive)', 'Pegvaliase', 'Gene therapy (emerging)'],
    therapeutic_area: 'rare_disease',
  },
];

// ──────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────

export function getSubtypesForIndication(indication: string): IndicationSubtype | undefined {
  const lower = indication.toLowerCase();
  return INDICATION_SUBTYPES.find(
    (entry) => entry.indication.toLowerCase() === lower || entry.indication.toLowerCase().includes(lower),
  );
}

export function getIndicationsByTherapeuticArea(area: string): IndicationSubtype[] {
  const lower = area.toLowerCase();
  return INDICATION_SUBTYPES.filter((entry) => entry.therapeutic_area.toLowerCase() === lower);
}
