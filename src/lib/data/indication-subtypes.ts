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

  // ──────────────────────────────────────────
  // PSYCHIATRY
  // ──────────────────────────────────────────

  {
    indication: 'Major Depressive Disorder',
    subtypes: [
      {
        name: 'First Episode',
        prevalence_pct: 25,
        key_biomarkers: ['BDNF', 'cortisol', '5-HTTLPR'],
        standard_of_care: 'SSRI monotherapy (escitalopram, sertraline)',
      },
      {
        name: 'Recurrent',
        prevalence_pct: 45,
        key_biomarkers: ['HPA axis dysregulation'],
        standard_of_care: 'SSRI/SNRI, augmentation with atypical antipsychotic',
      },
      {
        name: 'Treatment-Resistant (TRD)',
        prevalence_pct: 30,
        key_biomarkers: ['CYP2D6', 'MTHFR', 'inflammatory markers'],
        standard_of_care: 'Esketamine (Spravato), ECT, TMS, lithium augmentation',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild-moderate (outpatient)',
        description: 'PHQ-9 5-19, managed in primary care',
        pct_of_patients: 60,
      },
      {
        segment: 'Severe (specialist)',
        description: 'PHQ-9 ≥20, suicidal ideation, requires psychiatrist',
        pct_of_patients: 25,
      },
      {
        segment: 'Treatment-resistant',
        description: 'Failed ≥2 adequate trials, candidate for novel Tx',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'SSRI',
      'SNRI',
      'NMDA antagonist',
      'Psychedelic',
      'TMS',
      'Neuroactive steroid',
      'GABA modulator',
      'Dopamine modulator',
    ],
    lines_of_therapy: ['1L SSRI', '2L SNRI/augmentation', '3L TRD (esketamine/TMS/ECT)'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Schizophrenia',
    subtypes: [
      {
        name: 'Positive-symptom predominant',
        prevalence_pct: 40,
        key_biomarkers: ['D2 receptor occupancy'],
        standard_of_care: 'Second-generation antipsychotic (risperidone, olanzapine)',
      },
      {
        name: 'Negative-symptom predominant',
        prevalence_pct: 30,
        key_biomarkers: ['Glutamate levels'],
        standard_of_care: 'Cariprazine; limited options — high unmet need',
      },
      {
        name: 'Cognitive deficit subtype',
        prevalence_pct: 15,
        key_biomarkers: ['Neuroimaging markers'],
        standard_of_care: 'No approved cognitive enhancers — unmet need',
      },
      {
        name: 'Treatment-resistant',
        prevalence_pct: 15,
        key_biomarkers: ['Clozapine response'],
        standard_of_care: 'Clozapine (only approved for TRS)',
      },
    ],
    patient_segments: [
      { segment: 'First-episode psychosis', description: 'Initial presentation, age 18-25', pct_of_patients: 20 },
      { segment: 'Stable maintenance', description: 'Controlled on oral or LAI antipsychotic', pct_of_patients: 50 },
      {
        segment: 'Treatment-resistant',
        description: 'Failed ≥2 antipsychotics at adequate dose/duration',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'D2 antagonist',
      'Serotonin-dopamine modulator',
      'Muscarinic agonist',
      'NMDA modulator',
      'Trace amine receptor agonist',
      'Long-acting injectable',
    ],
    lines_of_therapy: ['1L oral SGA', '2L LAI or switch SGA', '3L clozapine', '4L novel mechanism'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Bipolar Disorder',
    subtypes: [
      {
        name: 'Bipolar I',
        prevalence_pct: 55,
        key_biomarkers: ['Lithium response (GSK-3β)'],
        standard_of_care: 'Lithium or valproate + SGA (mania); lamotrigine (maintenance)',
      },
      {
        name: 'Bipolar II',
        prevalence_pct: 45,
        key_biomarkers: ['Serotonin transporter'],
        standard_of_care: 'Quetiapine or lamotrigine; Caplyta (lumateperone)',
      },
    ],
    patient_segments: [
      { segment: 'Acute mania', description: 'Hospitalized or acute stabilization', pct_of_patients: 20 },
      { segment: 'Bipolar depression', description: 'Depressive episode — most time spent here', pct_of_patients: 50 },
      { segment: 'Maintenance/prevention', description: 'Stable, preventing recurrence', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Mood stabilizer (lithium)',
      'Anticonvulsant',
      'Atypical antipsychotic',
      'Serotonin-dopamine modulator',
    ],
    lines_of_therapy: ['Acute mania Tx', 'Bipolar depression Tx', 'Maintenance/prophylaxis'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'ADHD',
    subtypes: [
      {
        name: 'Predominantly Inattentive',
        prevalence_pct: 40,
        key_biomarkers: ['Dopamine transporter density'],
        standard_of_care: 'Methylphenidate or amphetamine; atomoxetine if stimulant-averse',
      },
      {
        name: 'Predominantly Hyperactive-Impulsive',
        prevalence_pct: 10,
        key_biomarkers: ['Norepinephrine levels'],
        standard_of_care: 'Stimulant medication',
      },
      {
        name: 'Combined Type',
        prevalence_pct: 50,
        key_biomarkers: ['DAT1 polymorphism'],
        standard_of_care: 'Stimulant ± behavioral therapy',
      },
    ],
    patient_segments: [
      { segment: 'Pediatric (6-12)', description: 'School-age children, primary diagnosis', pct_of_patients: 40 },
      { segment: 'Adolescent (13-17)', description: 'Continued treatment, medication adjustment', pct_of_patients: 25 },
      { segment: 'Adult (18+)', description: 'Diagnosed or continued from childhood', pct_of_patients: 35 },
    ],
    mechanisms_of_action: [
      'Stimulant (methylphenidate)',
      'Stimulant (amphetamine)',
      'Norepinephrine reuptake inhibitor',
      'Alpha-2 agonist',
      'Viloxazine (NRI)',
    ],
    lines_of_therapy: ['1L stimulant', '2L non-stimulant (atomoxetine, viloxazine)', '3L alpha-2 agonist adjunct'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'PTSD',
    subtypes: [
      {
        name: 'Acute Stress / Early PTSD',
        prevalence_pct: 30,
        key_biomarkers: ['Cortisol response'],
        standard_of_care: 'Trauma-focused CBT; no first-line pharmacotherapy',
      },
      {
        name: 'Chronic PTSD',
        prevalence_pct: 50,
        key_biomarkers: ['HPA axis dysregulation', 'Inflammatory markers'],
        standard_of_care: 'Sertraline or paroxetine (FDA-approved); prazosin for nightmares',
      },
      {
        name: 'Complex PTSD',
        prevalence_pct: 20,
        key_biomarkers: ['Dissociation markers'],
        standard_of_care: 'Phase-based trauma therapy + pharmacotherapy',
      },
    ],
    patient_segments: [
      { segment: 'Military/veteran', description: 'Combat-related PTSD, VA system', pct_of_patients: 25 },
      { segment: 'Civilian trauma', description: 'Sexual assault, accidents, violence', pct_of_patients: 55 },
      { segment: 'First responders', description: 'Occupational trauma exposure', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'SSRI',
      'SNRI',
      'Prazosin (alpha-1 blocker)',
      'MDMA-assisted therapy',
      'Psilocybin',
      'Stellate ganglion block',
    ],
    lines_of_therapy: ['1L SSRI (sertraline/paroxetine)', '2L SNRI + prazosin', '3L augmentation/novel'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'OCD',
    subtypes: [
      {
        name: 'Contamination/cleaning',
        prevalence_pct: 30,
        key_biomarkers: [],
        standard_of_care: 'High-dose SSRI (fluvoxamine, fluoxetine) + ERP',
      },
      { name: 'Symmetry/ordering', prevalence_pct: 25, key_biomarkers: [], standard_of_care: 'SSRI + ERP' },
      {
        name: 'Forbidden thoughts',
        prevalence_pct: 25,
        key_biomarkers: [],
        standard_of_care: 'SSRI + ERP; clomipramine',
      },
      {
        name: 'Hoarding',
        prevalence_pct: 20,
        key_biomarkers: [],
        standard_of_care: 'CBT (limited medication response)',
      },
    ],
    patient_segments: [
      { segment: 'Mild-moderate', description: 'Y-BOCS 8-23, managed outpatient', pct_of_patients: 55 },
      { segment: 'Severe', description: 'Y-BOCS ≥24, significant impairment', pct_of_patients: 30 },
      { segment: 'Treatment-refractory', description: 'Failed ≥2 SRIs at adequate dose + ERP', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'SSRI (high-dose)',
      'Clomipramine (SRI)',
      'SGA augmentation',
      'Glutamate modulator',
      'Deep brain stimulation',
    ],
    lines_of_therapy: ['1L SSRI + ERP', '2L clomipramine or SGA augment', '3L DBS/TMS (refractory)'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Anxiety Disorders',
    subtypes: [
      {
        name: 'Generalized Anxiety Disorder (GAD)',
        prevalence_pct: 45,
        key_biomarkers: ['GABA levels', 'cortisol'],
        standard_of_care: 'SSRI/SNRI (escitalopram, duloxetine); buspirone',
      },
      {
        name: 'Social Anxiety Disorder',
        prevalence_pct: 30,
        key_biomarkers: [],
        standard_of_care: 'SSRI (paroxetine, sertraline); CBT',
      },
      {
        name: 'Panic Disorder',
        prevalence_pct: 25,
        key_biomarkers: [],
        standard_of_care: 'SSRI; short-term benzodiazepine; CBT',
      },
    ],
    patient_segments: [
      { segment: 'Primary care managed', description: 'Mild-moderate, SSRI + counseling', pct_of_patients: 65 },
      { segment: 'Specialist-managed', description: 'Moderate-severe, medication optimization', pct_of_patients: 25 },
      { segment: 'Treatment-resistant', description: 'Failed ≥2 trials, comorbid conditions', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'SSRI',
      'SNRI',
      'Buspirone (5-HT1A agonist)',
      'Benzodiazepine',
      'Pregabalin',
      'GABA modulator',
    ],
    lines_of_therapy: ['1L SSRI/SNRI', '2L buspirone or switch SSRI', '3L augmentation/novel'],
    therapeutic_area: 'psychiatry',
  },

  // ──────────────────────────────────────────
  // PAIN MANAGEMENT
  // ──────────────────────────────────────────

  {
    indication: 'Chronic Pain',
    subtypes: [
      {
        name: 'Nociceptive (inflammatory/mechanical)',
        prevalence_pct: 45,
        key_biomarkers: ['CRP', 'ESR', 'IL-6'],
        standard_of_care: 'NSAIDs, acetaminophen, physical therapy',
      },
      {
        name: 'Neuropathic',
        prevalence_pct: 25,
        key_biomarkers: ['Nerve conduction studies', 'QST'],
        standard_of_care: 'Gabapentin/pregabalin, duloxetine, TCAs',
      },
      {
        name: 'Nociplastic (central sensitization)',
        prevalence_pct: 30,
        key_biomarkers: ['Central sensitization inventory'],
        standard_of_care: 'Duloxetine, milnacipran, multimodal therapy',
      },
    ],
    patient_segments: [
      { segment: 'Mild (NRS 1-3)', description: 'OTC management, intermittent', pct_of_patients: 30 },
      { segment: 'Moderate (NRS 4-6)', description: 'Prescription management, regular', pct_of_patients: 45 },
      { segment: 'Severe (NRS 7-10)', description: 'Multimodal/specialist pain management', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'NSAID',
      'Opioid',
      'Gabapentinoid',
      'SNRI',
      'TCA',
      'NaV1.8 inhibitor',
      'CGRP inhibitor',
      'Neuromodulation',
    ],
    lines_of_therapy: ['1L non-opioid analgesic', '2L gabapentinoid/SNRI', '3L interventional/novel'],
    therapeutic_area: 'pain_management',
  },
  {
    indication: 'Migraine',
    subtypes: [
      {
        name: 'Episodic Migraine (without aura)',
        prevalence_pct: 55,
        key_biomarkers: ['CGRP levels'],
        standard_of_care: 'Triptans (acute); CGRP mAb prevention if ≥4 MMD',
      },
      {
        name: 'Episodic Migraine (with aura)',
        prevalence_pct: 20,
        key_biomarkers: ['CGRP', 'cortical spreading depression'],
        standard_of_care: 'Triptans (avoid in hemiplegic); gepants',
      },
      {
        name: 'Chronic Migraine (≥15 days/month)',
        prevalence_pct: 25,
        key_biomarkers: ['CGRP', 'PACAP'],
        standard_of_care: 'OnabotulinumtoxinA + CGRP mAb; gepants',
      },
    ],
    patient_segments: [
      { segment: 'Acute treatment only', description: '4-7 MMD, triptans/gepants as needed', pct_of_patients: 50 },
      { segment: 'Prevention + acute', description: '≥4 MMD, on preventive + acute Tx', pct_of_patients: 35 },
      { segment: 'Refractory', description: 'Failed ≥3 preventives, needs multimodal', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Triptan (5-HT1B/1D)',
      'CGRP mAb',
      'CGRP receptor antagonist (gepant)',
      'Ditan',
      'OnabotulinumtoxinA',
      'Neuromodulation device',
    ],
    lines_of_therapy: [
      'Acute triptan/gepant',
      '1L prevention (CGRP mAb)',
      '2L OnabotulinumtoxinA',
      '3L combination/novel',
    ],
    therapeutic_area: 'pain_management',
  },
  {
    indication: 'Neuropathic Pain',
    subtypes: [
      {
        name: 'Diabetic Peripheral Neuropathy',
        prevalence_pct: 40,
        key_biomarkers: ['HbA1c', 'nerve conduction'],
        standard_of_care: 'Pregabalin, duloxetine, gabapentin',
      },
      {
        name: 'Post-herpetic Neuralgia',
        prevalence_pct: 15,
        key_biomarkers: [],
        standard_of_care: 'Gabapentin, lidocaine patch, pregabalin',
      },
      {
        name: 'Chemotherapy-Induced',
        prevalence_pct: 20,
        key_biomarkers: ['Platinum exposure', 'taxane exposure'],
        standard_of_care: 'Duloxetine (modest evidence); limited options',
      },
      {
        name: 'Radiculopathy/Sciatica',
        prevalence_pct: 25,
        key_biomarkers: ['MRI findings'],
        standard_of_care: 'Gabapentinoids, PT, epidural steroid injection',
      },
    ],
    patient_segments: [
      { segment: 'Mild-moderate', description: 'Monotherapy adequate', pct_of_patients: 45 },
      { segment: 'Severe/refractory', description: 'Combination therapy, specialist referral', pct_of_patients: 35 },
      {
        segment: 'Interventional candidates',
        description: 'Spinal cord stimulation, nerve blocks',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Gabapentinoid',
      'SNRI',
      'TCA',
      'NaV1.7/1.8 inhibitor',
      'Topical lidocaine',
      'Capsaicin patch',
      'Spinal cord stimulation',
    ],
    lines_of_therapy: ['1L gabapentinoid/SNRI', '2L combination/TCA', '3L interventional'],
    therapeutic_area: 'pain_management',
  },
  {
    indication: 'Fibromyalgia',
    subtypes: [
      {
        name: 'Widespread pain predominant',
        prevalence_pct: 50,
        key_biomarkers: ['Tender point count', 'fibromyalgia severity scale'],
        standard_of_care: 'Duloxetine, pregabalin, milnacipran',
      },
      {
        name: 'Fatigue/cognitive predominant',
        prevalence_pct: 30,
        key_biomarkers: ['Sleep quality metrics'],
        standard_of_care: 'Sleep optimization, duloxetine, exercise program',
      },
      {
        name: 'Comorbid mood disorder',
        prevalence_pct: 20,
        key_biomarkers: ['PHQ-9', 'GAD-7'],
        standard_of_care: 'SNRI (dual benefit), CBT, multimodal',
      },
    ],
    patient_segments: [
      { segment: 'Mild', description: 'Functional, managed with exercise + single agent', pct_of_patients: 35 },
      { segment: 'Moderate', description: 'Impaired function, combination pharmacotherapy', pct_of_patients: 40 },
      {
        segment: 'Severe/refractory',
        description: 'Significant disability, multidisciplinary care',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'SNRI (duloxetine, milnacipran)',
      'Gabapentinoid (pregabalin)',
      'Low-dose naltrexone',
      'Cannabinoid',
      'Muscle relaxant',
    ],
    lines_of_therapy: [
      '1L duloxetine or pregabalin',
      '2L combination SNRI + gabapentinoid',
      '3L low-dose naltrexone/novel',
    ],
    therapeutic_area: 'pain_management',
  },
  {
    indication: 'Low Back Pain',
    subtypes: [
      {
        name: 'Acute (<4 weeks)',
        prevalence_pct: 40,
        key_biomarkers: [],
        standard_of_care: 'NSAIDs, heat therapy, continued activity',
      },
      {
        name: 'Subacute (4-12 weeks)',
        prevalence_pct: 20,
        key_biomarkers: ['MRI if red flags'],
        standard_of_care: 'PT, NSAIDs, muscle relaxants',
      },
      {
        name: 'Chronic (>12 weeks)',
        prevalence_pct: 40,
        key_biomarkers: ['Modic changes on MRI', 'central sensitization'],
        standard_of_care: 'Multimodal: PT + duloxetine + interventional',
      },
    ],
    patient_segments: [
      {
        segment: 'Non-specific mechanical',
        description: 'No specific pathology, majority of cases',
        pct_of_patients: 85,
      },
      { segment: 'Radiculopathy', description: 'Nerve root compression, may need surgery', pct_of_patients: 10 },
      { segment: 'Serious pathology', description: 'Infection, fracture, tumor, cauda equina', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'NSAID',
      'Muscle relaxant',
      'SNRI',
      'Gabapentinoid',
      'Interventional (epidural)',
      'NaV inhibitor (emerging)',
      'Anti-NGF mAb (tanezumab)',
    ],
    lines_of_therapy: ['1L NSAID + PT', '2L SNRI/gabapentinoid', '3L interventional'],
    therapeutic_area: 'pain_management',
  },

  // ──────────────────────────────────────────
  // INFECTIOUS DISEASE
  // ──────────────────────────────────────────

  {
    indication: 'HIV/AIDS',
    subtypes: [
      {
        name: 'Treatment-naive',
        prevalence_pct: 15,
        key_biomarkers: ['CD4 count', 'viral load', 'HLA-B*5701', 'tropism'],
        standard_of_care: 'Bictegravir/emtricitabine/TAF (Biktarvy)',
      },
      {
        name: 'Treatment-experienced (virally suppressed)',
        prevalence_pct: 70,
        key_biomarkers: ['Resistance mutations', 'CD4 count'],
        standard_of_care: 'Continued ART; switch to simplify (2-drug regimen, LAI)',
      },
      {
        name: 'Treatment-experienced (viremic)',
        prevalence_pct: 15,
        key_biomarkers: ['Resistance genotype/phenotype'],
        standard_of_care: 'Resistance-guided regimen; ibalizumab, fostemsavir, lenacapavir',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'Recent seroconversion, starting ART', pct_of_patients: 10 },
      { segment: 'Stable on ART', description: 'Virally suppressed, long-term management', pct_of_patients: 65 },
      { segment: 'Multi-drug resistant', description: 'Limited options, novel mechanisms needed', pct_of_patients: 5 },
      { segment: 'PrEP candidates', description: 'At-risk, prevention with Descovy/lenacapavir', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'INSTI (integrase inhibitor)',
      'NRTI',
      'NNRTI',
      'Protease inhibitor',
      'Capsid inhibitor',
      'Attachment inhibitor',
      'Post-attachment inhibitor',
      'Long-acting injectable',
    ],
    lines_of_therapy: ['1L INSTI-based triple', '2L switch/simplify', '3L salvage (heavily treatment-experienced)'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Hepatitis B',
    subtypes: [
      {
        name: 'HBeAg-positive (immune active)',
        prevalence_pct: 30,
        key_biomarkers: ['HBeAg', 'HBV DNA', 'ALT'],
        standard_of_care: 'Entecavir or tenofovir (TAF preferred)',
      },
      {
        name: 'HBeAg-negative (immune active)',
        prevalence_pct: 40,
        key_biomarkers: ['HBeAg-', 'HBV DNA >2000', 'ALT elevated'],
        standard_of_care: 'Entecavir or tenofovir; indefinite treatment',
      },
      {
        name: 'Immune tolerant',
        prevalence_pct: 20,
        key_biomarkers: ['HBeAg+', 'high HBV DNA', 'normal ALT'],
        standard_of_care: 'Monitor; treatment evolving (functional cure trials)',
      },
      {
        name: 'Inactive carrier',
        prevalence_pct: 10,
        key_biomarkers: ['HBeAg-', 'low HBV DNA', 'normal ALT'],
        standard_of_care: 'Monitor; no treatment unless reactivation',
      },
    ],
    patient_segments: [
      { segment: 'On NUC therapy', description: 'Suppressed on entecavir/tenofovir', pct_of_patients: 45 },
      {
        segment: 'Functional cure candidates',
        description: 'HBsAg loss goal (emerging therapies)',
        pct_of_patients: 20,
      },
      { segment: 'Monitoring only', description: 'Immune tolerant/inactive, serial monitoring', pct_of_patients: 35 },
    ],
    mechanisms_of_action: [
      'Nucleos(t)ide analog (NUC)',
      'Interferon-alpha',
      'siRNA (RNAi)',
      'ASO (antisense)',
      'Capsid assembly modulator',
      'Therapeutic vaccine',
      'TLR agonist',
    ],
    lines_of_therapy: ['1L NUC (entecavir/tenofovir)', '2L functional cure trial', 'PegIFN-alpha (finite therapy)'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Hepatitis C',
    subtypes: [
      {
        name: 'Genotype 1 (1a/1b)',
        prevalence_pct: 70,
        key_biomarkers: ['HCV genotype', 'viral load', 'fibrosis stage'],
        standard_of_care: 'Sofosbuvir/velpatasvir (Epclusa) or glecaprevir/pibrentasvir (Mavyret)',
      },
      {
        name: 'Genotype 2',
        prevalence_pct: 12,
        key_biomarkers: ['HCV genotype'],
        standard_of_care: 'Sofosbuvir/velpatasvir × 12 weeks',
      },
      {
        name: 'Genotype 3',
        prevalence_pct: 10,
        key_biomarkers: ['HCV genotype', 'cirrhosis status'],
        standard_of_care: 'Sofosbuvir/velpatasvir ± ribavirin if cirrhotic',
      },
      {
        name: 'Genotype 4/5/6',
        prevalence_pct: 8,
        key_biomarkers: ['HCV genotype'],
        standard_of_care: 'Pan-genotypic DAA regimen',
      },
    ],
    patient_segments: [
      {
        segment: 'Treatment-naive non-cirrhotic',
        description: 'Straightforward 8-12 week DAA cure',
        pct_of_patients: 55,
      },
      {
        segment: 'Treatment-naive cirrhotic',
        description: 'Longer treatment, ribavirin consideration',
        pct_of_patients: 20,
      },
      {
        segment: 'DAA-experienced',
        description: 'Prior DAA failure; resistance-guided retreatment',
        pct_of_patients: 5,
      },
      { segment: 'Undiagnosed/untreated', description: 'Screening gap; birth cohort, PWID', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'NS5B polymerase inhibitor',
      'NS5A inhibitor',
      'NS3/4A protease inhibitor',
      'Pan-genotypic DAA combination',
    ],
    lines_of_therapy: ['1L pan-genotypic DAA', '2L resistance-guided retreatment'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'RSV Infection',
    subtypes: [
      {
        name: 'Infant/pediatric RSV',
        prevalence_pct: 60,
        key_biomarkers: ['RSV rapid antigen', 'PCR'],
        standard_of_care: 'Nirsevimab (Beyfortus) prevention; supportive care',
      },
      {
        name: 'Adult/elderly RSV',
        prevalence_pct: 30,
        key_biomarkers: ['RSV PCR'],
        standard_of_care: 'Abrysvo/Arexvy vaccine prevention; supportive care',
      },
      {
        name: 'Immunocompromised RSV',
        prevalence_pct: 10,
        key_biomarkers: ['Immune status'],
        standard_of_care: 'Ribavirin (limited efficacy); no approved antiviral',
      },
    ],
    patient_segments: [
      { segment: 'Infants <6 months', description: 'Highest risk, nirsevimab eligible', pct_of_patients: 25 },
      { segment: 'Children 6mo-5yr', description: 'Moderate risk, outpatient management', pct_of_patients: 35 },
      { segment: 'Adults ≥60', description: 'Vaccine eligible (Abrysvo, Arexvy)', pct_of_patients: 30 },
      { segment: 'Immunocompromised (any age)', description: 'High morbidity/mortality risk', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'mAb (anti-RSV F protein)',
      'Vaccine (prefusion F)',
      'Fusion inhibitor',
      'RNA polymerase inhibitor',
    ],
    lines_of_therapy: ['Prevention (vaccine/mAb)', 'Acute (supportive/antiviral)'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'COVID-19',
    subtypes: [
      {
        name: 'Mild-moderate (outpatient)',
        prevalence_pct: 80,
        key_biomarkers: ['SARS-CoV-2 PCR/antigen', 'variant typing'],
        standard_of_care: 'Paxlovid (high-risk); supportive care (low-risk)',
      },
      {
        name: 'Severe/hospitalized',
        prevalence_pct: 15,
        key_biomarkers: ['D-dimer', 'CRP', 'ferritin', 'O2 saturation'],
        standard_of_care: 'Dexamethasone, remdesivir, baricitinib/tocilizumab',
      },
      {
        name: 'Critical/ICU',
        prevalence_pct: 5,
        key_biomarkers: ['IL-6', 'procalcitonin', 'imaging'],
        standard_of_care: 'Mechanical ventilation, dexamethasone, anti-IL-6',
      },
    ],
    patient_segments: [
      { segment: 'Vaccinated/low-risk', description: 'Mild illness, self-limited', pct_of_patients: 60 },
      { segment: 'High-risk (immunocompromised, elderly)', description: 'Paxlovid within 5 days', pct_of_patients: 25 },
      { segment: 'Hospitalized', description: 'Oxygen requirement, anti-inflammatory Tx', pct_of_patients: 12 },
      { segment: 'Long COVID', description: 'Post-acute sequelae, emerging therapeutic target', pct_of_patients: 3 },
    ],
    mechanisms_of_action: [
      'Protease inhibitor (nirmatrelvir)',
      'RdRp inhibitor (remdesivir, molnupiravir)',
      'Anti-IL-6 mAb',
      'JAK inhibitor',
      'Corticosteroid',
      'mAb (anti-spike)',
    ],
    lines_of_therapy: ['Outpatient (Paxlovid)', 'Inpatient (remdesivir + dex)', 'Severe (anti-IL-6/JAK + dex)'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Tuberculosis',
    subtypes: [
      {
        name: 'Drug-susceptible TB',
        prevalence_pct: 85,
        key_biomarkers: ['AFB smear', 'culture', 'GeneXpert'],
        standard_of_care: 'RIPE regimen (rifampin, isoniazid, pyrazinamide, ethambutol) × 6 months',
      },
      {
        name: 'MDR-TB',
        prevalence_pct: 10,
        key_biomarkers: ['Rifampin/isoniazid resistance'],
        standard_of_care: 'Bedaquiline + pretomanid + linezolid (BPaL)',
      },
      {
        name: 'XDR-TB',
        prevalence_pct: 5,
        key_biomarkers: ['Fluoroquinolone + injectable resistance'],
        standard_of_care: 'BPaL regimen; individualized based on DST',
      },
    ],
    patient_segments: [
      { segment: 'Active pulmonary', description: 'Infectious, requires isolation + RIPE', pct_of_patients: 70 },
      { segment: 'Extrapulmonary', description: 'Lymph node, bone, CNS TB', pct_of_patients: 20 },
      {
        segment: 'Latent TB (treatment)',
        description: 'Preventive therapy (isoniazid/rifapentine)',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Cell wall synthesis inhibitor',
      'RNA polymerase inhibitor',
      'ATP synthase inhibitor (bedaquiline)',
      'Nitroimidazole (pretomanid)',
      'Oxazolidinone (linezolid)',
    ],
    lines_of_therapy: ['1L RIPE (drug-susceptible)', '2L BPaL (MDR)', '3L individualized (XDR)'],
    therapeutic_area: 'infectious_disease',
  },

  // ──────────────────────────────────────────
  // PULMONOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'COPD',
    subtypes: [
      {
        name: 'GOLD Stage I (Mild)',
        prevalence_pct: 15,
        key_biomarkers: ['FEV1 ≥80% predicted'],
        standard_of_care: 'SABA prn; smoking cessation',
      },
      {
        name: 'GOLD Stage II (Moderate)',
        prevalence_pct: 35,
        key_biomarkers: ['FEV1 50-79%'],
        standard_of_care: 'LABA or LAMA; pulmonary rehab',
      },
      {
        name: 'GOLD Stage III (Severe)',
        prevalence_pct: 30,
        key_biomarkers: ['FEV1 30-49%', 'eosinophils'],
        standard_of_care: 'LABA/LAMA ± ICS; triple therapy if eosinophilic',
      },
      {
        name: 'GOLD Stage IV (Very Severe)',
        prevalence_pct: 20,
        key_biomarkers: ['FEV1 <30%', 'chronic respiratory failure'],
        standard_of_care: 'Triple therapy; LTOT; lung transplant evaluation',
      },
    ],
    patient_segments: [
      { segment: 'Eosinophilic COPD', description: 'Blood eos ≥300, ICS-responsive', pct_of_patients: 30 },
      { segment: 'Non-eosinophilic', description: 'Dual bronchodilator without ICS', pct_of_patients: 50 },
      {
        segment: 'Frequent exacerbator',
        description: '≥2 moderate or ≥1 hospitalized exacerbation/year',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'LABA',
      'LAMA',
      'ICS',
      'PDE3/4 inhibitor',
      'Anti-IL-5 (eosinophilic)',
      'Anti-IL-33',
      'Anti-TSLP',
    ],
    lines_of_therapy: [
      'SABA prn',
      '1L LABA or LAMA',
      '2L LABA/LAMA dual',
      '3L Triple (ICS/LABA/LAMA)',
      'Add-on biologic',
    ],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Asthma',
    subtypes: [
      {
        name: 'Mild Intermittent',
        prevalence_pct: 30,
        key_biomarkers: [],
        standard_of_care: 'SABA prn or low-dose ICS-formoterol prn',
      },
      {
        name: 'Mild-Moderate Persistent',
        prevalence_pct: 35,
        key_biomarkers: ['FeNO', 'eosinophils'],
        standard_of_care: 'Low-medium dose ICS or ICS-LABA',
      },
      {
        name: 'Severe Uncontrolled',
        prevalence_pct: 10,
        key_biomarkers: ['Blood eos ≥150/300', 'FeNO ≥25', 'total IgE', 'periostin'],
        standard_of_care: 'High-dose ICS-LABA + biologic (anti-IL5/IL4/TSLP)',
      },
      {
        name: 'Allergic (Type 2 High)',
        prevalence_pct: 15,
        key_biomarkers: ['Total IgE', 'specific IgE', 'skin prick'],
        standard_of_care: 'ICS-LABA ± omalizumab; allergen avoidance',
      },
      {
        name: 'Non-allergic/Neutrophilic',
        prevalence_pct: 10,
        key_biomarkers: ['Low eosinophils', 'neutrophil predominant'],
        standard_of_care: 'ICS-LABA + LAMA; macrolide; limited biologic options',
      },
    ],
    patient_segments: [
      { segment: 'Well-controlled on ICS', description: 'Stable, step-down candidate', pct_of_patients: 50 },
      { segment: 'Partially controlled', description: 'Step-up needed, optimize adherence', pct_of_patients: 30 },
      { segment: 'Severe/biologic-eligible', description: 'On or candidate for biologic therapy', pct_of_patients: 10 },
      { segment: 'Pediatric asthma', description: 'Age-appropriate formulations needed', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'ICS',
      'LABA',
      'LAMA',
      'Anti-IgE (omalizumab)',
      'Anti-IL-5 (mepolizumab, benralizumab)',
      'Anti-IL-4/13 (dupilumab)',
      'Anti-TSLP (tezepelumab)',
      'LTRA',
    ],
    lines_of_therapy: [
      'Step 1: SABA prn',
      'Step 2: Low ICS',
      'Step 3: ICS-LABA',
      'Step 4: Medium-high ICS-LABA',
      'Step 5: Biologic add-on',
    ],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Idiopathic Pulmonary Fibrosis',
    subtypes: [
      {
        name: 'Early/Mild (FVC >80%)',
        prevalence_pct: 30,
        key_biomarkers: ['HRCT UIP pattern', 'FVC', 'DLCO'],
        standard_of_care: 'Nintedanib or pirfenidone (early initiation)',
      },
      {
        name: 'Moderate (FVC 50-80%)',
        prevalence_pct: 45,
        key_biomarkers: ['FVC decline >5%/year'],
        standard_of_care: 'Nintedanib or pirfenidone + pulmonary rehab',
      },
      {
        name: 'Advanced (FVC <50%)',
        prevalence_pct: 25,
        key_biomarkers: ['6MWT <250m', 'supplemental O2'],
        standard_of_care: 'Anti-fibrotic + transplant evaluation',
      },
    ],
    patient_segments: [
      { segment: 'Stable/slow progressor', description: 'FVC decline <5%/year', pct_of_patients: 40 },
      { segment: 'Rapid progressor', description: 'FVC decline >10%/year, urgent Tx', pct_of_patients: 35 },
      { segment: 'Transplant candidate', description: 'Advanced disease, listed for transplant', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'Anti-fibrotic TKI (nintedanib)',
      'Anti-fibrotic (pirfenidone)',
      'Anti-integrin',
      'Autotaxin inhibitor',
      'Pentraxin-2 (inhaled)',
      'Anti-CTGF mAb',
    ],
    lines_of_therapy: ['1L nintedanib or pirfenidone', '2L combination/novel anti-fibrotic', 'Lung transplant'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Pulmonary Arterial Hypertension',
    subtypes: [
      {
        name: 'Idiopathic PAH (IPAH)',
        prevalence_pct: 45,
        key_biomarkers: ['mPAP ≥20 mmHg', 'PVR ≥3 WU', 'NT-proBNP', 'WHO functional class'],
        standard_of_care: 'Upfront combination ERA + PDE5i; IV prostacyclin if severe',
      },
      {
        name: 'Connective Tissue Disease-Associated PAH',
        prevalence_pct: 25,
        key_biomarkers: ['ANA', 'anti-Scl-70', 'echocardiography', 'RHC'],
        standard_of_care: 'ERA + PDE5i; sotatercept add-on; prostacyclin',
      },
      {
        name: 'Congenital Heart Disease-Associated PAH',
        prevalence_pct: 15,
        key_biomarkers: ['Eisenmenger physiology', 'shunt evaluation'],
        standard_of_care: 'ERA (bosentan); PDE5i; shunt closure evaluation',
      },
      {
        name: 'Other PAH (drug-induced, portopulmonary, heritable)',
        prevalence_pct: 15,
        key_biomarkers: ['BMPR2 mutation (heritable)', 'liver disease (porto)', 'drug exposure history'],
        standard_of_care: 'Etiology-specific management + standard PAH therapy',
      },
    ],
    patient_segments: [
      { segment: 'WHO FC I-II (mild)', description: 'Functional, oral combination therapy', pct_of_patients: 30 },
      {
        segment: 'WHO FC III (moderate)',
        description: 'Symptomatic on exertion, triple therapy consideration',
        pct_of_patients: 45,
      },
      {
        segment: 'WHO FC IV (severe)',
        description: 'Resting symptoms, IV prostacyclin, transplant evaluation',
        pct_of_patients: 15,
      },
      {
        segment: 'Sotatercept-eligible',
        description: 'On background therapy, add-on activin signaling inhibitor',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Endothelin receptor antagonist (ambrisentan, bosentan, macitentan)',
      'PDE5 inhibitor (sildenafil, tadalafil)',
      'Soluble guanylate cyclase stimulator (riociguat)',
      'Prostacyclin analog (epoprostenol, treprostinil)',
      'Prostacyclin receptor agonist (selexipag)',
      'Activin signaling inhibitor (sotatercept)',
    ],
    lines_of_therapy: [
      '1L upfront oral combination (ERA + PDE5i)',
      '2L add prostacyclin pathway agent',
      '3L add sotatercept',
      '4L lung transplant',
    ],
    therapeutic_area: 'pulmonology',
  },

  // ──────────────────────────────────────────
  // NEPHROLOGY
  // ──────────────────────────────────────────

  {
    indication: 'Chronic Kidney Disease',
    subtypes: [
      {
        name: 'Stage 3a (eGFR 45-59)',
        prevalence_pct: 30,
        key_biomarkers: ['eGFR', 'UACR', 'serum creatinine'],
        standard_of_care: 'ACEi/ARB, SGLT2i, BP control; statin',
      },
      {
        name: 'Stage 3b (eGFR 30-44)',
        prevalence_pct: 25,
        key_biomarkers: ['eGFR', 'UACR', 'PTH', 'phosphorus'],
        standard_of_care: 'SGLT2i + finerenone (if diabetic); phosphate management',
      },
      {
        name: 'Stage 4 (eGFR 15-29)',
        prevalence_pct: 20,
        key_biomarkers: ['eGFR', 'bicarbonate', 'Hgb', 'PTH'],
        standard_of_care: 'Prepare for RRT; EPO, phosphate binders, diet',
      },
      {
        name: 'Stage 5 / ESRD (eGFR <15)',
        prevalence_pct: 15,
        key_biomarkers: ['eGFR', 'uremic symptoms'],
        standard_of_care: 'Dialysis or transplant; ESA, iron, phosphate binder',
      },
      {
        name: 'Diabetic Kidney Disease',
        prevalence_pct: 10,
        key_biomarkers: ['UACR >30', 'eGFR decline', 'HbA1c'],
        standard_of_care: 'SGLT2i + finerenone + ACEi/ARB; GLP-1 RA',
      },
    ],
    patient_segments: [
      { segment: 'Early CKD (Stage 1-3a)', description: 'Preserve function, slow progression', pct_of_patients: 55 },
      {
        segment: 'Advanced CKD (Stage 3b-4)',
        description: 'Delay dialysis, manage complications',
        pct_of_patients: 30,
      },
      { segment: 'ESRD/dialysis', description: 'Renal replacement therapy', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'SGLT2 inhibitor',
      'Nonsteroidal MRA (finerenone)',
      'ACE inhibitor',
      'ARB',
      'GLP-1 RA',
      'Endothelin receptor antagonist',
      'HIF-PHI (roxadustat)',
    ],
    lines_of_therapy: ['1L ACEi/ARB + SGLT2i', '2L add finerenone (if diabetic)', '3L GLP-1 RA / novel agent'],
    therapeutic_area: 'nephrology',
  },
  {
    indication: 'IgA Nephropathy',
    subtypes: [
      {
        name: 'Low proteinuria (<1 g/day)',
        prevalence_pct: 40,
        key_biomarkers: ['Serum IgA', 'UPCR', 'eGFR', 'Gd-IgA1'],
        standard_of_care: 'Supportive (ACEi/ARB, BP control); monitor',
      },
      {
        name: 'Moderate proteinuria (1-3 g/day)',
        prevalence_pct: 35,
        key_biomarkers: ['UPCR', 'kidney biopsy (MEST-C)'],
        standard_of_care: 'ACEi/ARB + SGLT2i; targeted budesonide (Tarpeyo); sparsentan',
      },
      {
        name: 'High proteinuria (>3 g/day) / progressive',
        prevalence_pct: 25,
        key_biomarkers: ['Crescentic GN', 'eGFR decline >5/yr'],
        standard_of_care: 'Immunosuppression; SGLT2i; novel APRIL/BAFF inhibitors',
      },
    ],
    patient_segments: [
      { segment: 'Stable/indolent', description: 'Slow progression, supportive care', pct_of_patients: 40 },
      { segment: 'Progressive', description: 'Declining eGFR, needs disease-modifying Tx', pct_of_patients: 45 },
      { segment: 'Rapidly progressive', description: 'Crescentic disease, aggressive Tx needed', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Targeted budesonide (Nefecon)',
      'APRIL inhibitor (sibeprenlimab)',
      'Endothelin/angiotensin dual blocker (sparsentan)',
      'SGLT2 inhibitor',
      'Complement inhibitor',
      'BAFF inhibitor',
    ],
    lines_of_therapy: ['1L ACEi/ARB + SGLT2i', '2L Tarpeyo or sparsentan', '3L APRIL inhibitor / complement / novel'],
    therapeutic_area: 'nephrology',
  },
  {
    indication: 'Lupus Nephritis',
    subtypes: [
      {
        name: 'Class III (focal proliferative)',
        prevalence_pct: 25,
        key_biomarkers: ['Anti-dsDNA', 'C3/C4', 'kidney biopsy'],
        standard_of_care: 'MMF + low-dose steroids; voclosporin add-on',
      },
      {
        name: 'Class IV (diffuse proliferative)',
        prevalence_pct: 40,
        key_biomarkers: ['Anti-dsDNA', 'C3/C4'],
        standard_of_care: 'MMF or cyclophosphamide + steroids; voclosporin; belimumab',
      },
      {
        name: 'Class V (membranous)',
        prevalence_pct: 20,
        key_biomarkers: ['Nephrotic-range proteinuria', 'PLA2R'],
        standard_of_care: 'MMF + steroids; rituximab; voclosporin',
      },
      {
        name: 'Mixed (III/V or IV/V)',
        prevalence_pct: 15,
        key_biomarkers: ['Biopsy morphology'],
        standard_of_care: 'Aggressive immunosuppression',
      },
    ],
    patient_segments: [
      { segment: 'Induction', description: 'Active nephritis, achieve remission', pct_of_patients: 30 },
      { segment: 'Maintenance', description: 'Remission, prevent flare', pct_of_patients: 50 },
      { segment: 'Refractory', description: 'Failed standard induction, escalation', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Calcineurin inhibitor (voclosporin)',
      'Anti-BLyS mAb (belimumab)',
      'Anti-CD20 mAb (rituximab/obinutuzumab)',
      'MMF',
      'Cyclophosphamide',
      'Complement inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L induction: MMF + steroids ± voclosporin/belimumab',
      '2L rituximab',
      '3L novel (complement, BAFF/APRIL)',
    ],
    therapeutic_area: 'nephrology',
  },
  {
    indication: 'Focal Segmental Glomerulosclerosis',
    subtypes: [
      {
        name: 'Primary (idiopathic) FSGS',
        prevalence_pct: 60,
        key_biomarkers: [
          'Proteinuria (nephrotic-range)',
          'kidney biopsy (segmental sclerosis)',
          'soluble urokinase receptor (suPAR)',
        ],
        standard_of_care: 'High-dose corticosteroids; calcineurin inhibitor (tacrolimus/cyclosporine); SGLT2i',
      },
      {
        name: 'Secondary FSGS',
        prevalence_pct: 30,
        key_biomarkers: ['Glomerular hyperfiltration', 'obesity', 'reflux nephropathy', 'viral-associated'],
        standard_of_care: 'Treat underlying cause; ACEi/ARB for proteinuria reduction; SGLT2i',
      },
      {
        name: 'Genetic FSGS',
        prevalence_pct: 10,
        key_biomarkers: ['APOL1 risk alleles', 'NPHS1/NPHS2 mutations', 'podocin variants'],
        standard_of_care: 'Supportive care; ACEi/ARB; genetic counseling; generally immunosuppression-resistant',
      },
    ],
    patient_segments: [
      {
        segment: 'Steroid-sensitive',
        description: 'Remission with corticosteroids, favorable prognosis',
        pct_of_patients: 30,
      },
      {
        segment: 'Steroid-resistant',
        description: 'No response to steroids; CNI or novel agents needed',
        pct_of_patients: 40,
      },
      {
        segment: 'Frequently relapsing',
        description: 'Multiple relapses requiring steroid-sparing agents',
        pct_of_patients: 15,
      },
      {
        segment: 'Progressive to ESRD',
        description: 'Declining eGFR despite treatment; transplant planning',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Corticosteroid',
      'Calcineurin inhibitor (tacrolimus, cyclosporine)',
      'Anti-CD20 mAb (rituximab)',
      'SGLT2 inhibitor',
      'ACTH analog (repository corticotropin)',
      'Sparsentan (dual endothelin/angiotensin)',
      'Anti-APOL1 (emerging)',
    ],
    lines_of_therapy: [
      '1L high-dose steroids + ACEi/ARB + SGLT2i',
      '2L calcineurin inhibitor or rituximab',
      '3L sparsentan or novel agent',
    ],
    therapeutic_area: 'nephrology',
  },

  // ──────────────────────────────────────────
  // OPHTHALMOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'Age-Related Macular Degeneration',
    subtypes: [
      {
        name: 'Dry AMD (non-neovascular)',
        prevalence_pct: 85,
        key_biomarkers: ['Drusen on OCT', 'GA area'],
        standard_of_care: 'AREDS2 supplements; complement inhibitor for GA (Syfovre, Izervay)',
      },
      {
        name: 'Wet AMD (neovascular)',
        prevalence_pct: 15,
        key_biomarkers: ['CNV on FA/OCT', 'subretinal fluid'],
        standard_of_care: 'Anti-VEGF (aflibercept, ranibizumab, faricimab)',
      },
    ],
    patient_segments: [
      { segment: 'Early/intermediate dry AMD', description: 'Drusen, monitoring + supplements', pct_of_patients: 60 },
      {
        segment: 'Geographic atrophy',
        description: 'Progressive vision loss, complement-eligible',
        pct_of_patients: 25,
      },
      { segment: 'Active wet AMD', description: 'Regular anti-VEGF injections', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Anti-VEGF mAb',
      'Anti-VEGF/Ang-2 bispecific (faricimab)',
      'Complement C3 inhibitor (pegcetacoplan)',
      'Complement C5 inhibitor (avacincaptad pegol)',
      'Gene therapy (anti-VEGF)',
      'Port delivery system',
    ],
    lines_of_therapy: [
      'Wet: 1L anti-VEGF (aflibercept/faricimab)',
      'Wet: 2L switch anti-VEGF',
      'Dry/GA: complement inhibitor',
    ],
    therapeutic_area: 'ophthalmology',
  },
  {
    indication: 'Diabetic Macular Edema',
    subtypes: [
      {
        name: 'Center-involving DME',
        prevalence_pct: 60,
        key_biomarkers: ['CRT on OCT', 'BCVA'],
        standard_of_care: 'Anti-VEGF (aflibercept, ranibizumab, faricimab)',
      },
      {
        name: 'Non-center-involving DME',
        prevalence_pct: 40,
        key_biomarkers: ['OCT thickness', 'visual acuity'],
        standard_of_care: 'Focal laser or observation; anti-VEGF if progressing',
      },
    ],
    patient_segments: [
      { segment: 'Treatment-naive', description: 'First anti-VEGF course', pct_of_patients: 40 },
      {
        segment: 'Chronic/persistent',
        description: 'Ongoing edema despite Tx, switch or add steroid',
        pct_of_patients: 40,
      },
      {
        segment: 'Poor responders',
        description: 'Refractory to anti-VEGF, steroid implant or surgery',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Anti-VEGF mAb',
      'Bispecific (anti-VEGF/Ang-2)',
      'Dexamethasone intravitreal implant',
      'Fluocinolone acetonide implant',
      'Focal/grid laser',
    ],
    lines_of_therapy: ['1L anti-VEGF', '2L switch anti-VEGF or add steroid implant', '3L surgical vitrectomy'],
    therapeutic_area: 'ophthalmology',
  },
  {
    indication: 'Glaucoma',
    subtypes: [
      {
        name: 'Primary Open-Angle (POAG)',
        prevalence_pct: 80,
        key_biomarkers: ['IOP', 'optic nerve OCT', 'visual field'],
        standard_of_care: 'Prostaglandin analog eye drops (latanoprost, bimatoprost)',
      },
      {
        name: 'Angle-Closure',
        prevalence_pct: 15,
        key_biomarkers: ['Gonioscopy', 'IOP'],
        standard_of_care: 'Laser peripheral iridotomy; IOP-lowering drops; surgery',
      },
      {
        name: 'Normal-Tension',
        prevalence_pct: 5,
        key_biomarkers: ['Normal IOP + optic nerve damage'],
        standard_of_care: 'IOP reduction to 30% below baseline; neuroprotection trials',
      },
    ],
    patient_segments: [
      { segment: 'Medical management', description: 'Controlled on drops alone', pct_of_patients: 60 },
      { segment: 'Surgical candidates', description: 'Uncontrolled IOP, MIGS or trabeculectomy', pct_of_patients: 25 },
      {
        segment: 'Advanced/end-stage',
        description: 'Severe vision loss, tube shunt/cyclophotocoagulation',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Prostaglandin analog',
      'Beta-blocker',
      'Alpha-agonist',
      'ROCK inhibitor (netarsudil)',
      'Rho kinase inhibitor',
      'MIGS devices',
      'Neuroprotective (emerging)',
    ],
    lines_of_therapy: ['1L prostaglandin analog', '2L combination drops or ROCK inhibitor', '3L MIGS/surgery'],
    therapeutic_area: 'ophthalmology',
  },
  {
    indication: 'Dry Eye Disease',
    subtypes: [
      {
        name: 'Aqueous Deficient',
        prevalence_pct: 40,
        key_biomarkers: ['Schirmer test <10mm', 'tear osmolarity >308', 'lactoferrin levels'],
        standard_of_care: 'Cyclosporine ophthalmic (Restasis); lifitegrast (Xiidra); punctal plugs',
      },
      {
        name: 'Evaporative (MGD-related)',
        prevalence_pct: 50,
        key_biomarkers: ['Meibography', 'TBUT <10s', 'lipid layer thickness'],
        standard_of_care: 'Warm compresses, lid hygiene; LipiFlow thermal pulsation; omega-3',
      },
      {
        name: 'Mixed Mechanism',
        prevalence_pct: 10,
        key_biomarkers: ['Combined aqueous and lipid deficiency', 'MMP-9 elevated', 'TBUT + Schirmer both reduced'],
        standard_of_care: 'Combined approach: anti-inflammatory + MGD treatment + artificial tears',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild (DEWS I)',
        description: 'Occasional symptoms; artificial tears sufficient',
        pct_of_patients: 45,
      },
      {
        segment: 'Moderate (DEWS II)',
        description: 'Persistent symptoms affecting QoL; prescription drops needed',
        pct_of_patients: 35,
      },
      {
        segment: 'Severe (DEWS III)',
        description: 'Corneal damage risk; combination Rx + procedures',
        pct_of_patients: 15,
      },
      {
        segment: 'Sjogren-associated',
        description: 'Autoimmune etiology; systemic treatment considerations',
        pct_of_patients: 5,
      },
    ],
    mechanisms_of_action: [
      'Calcineurin inhibitor (cyclosporine)',
      'LFA-1 antagonist (lifitegrast)',
      'IL-1 receptor antagonist (anakinra ophthalmic, emerging)',
      'Loteprednol (anti-inflammatory)',
      'Perfluorohexyloctane (Miebo, non-aqueous tear supplement)',
      'Secretagogue (diquafosol, OTX-DED)',
      'Autologous serum tears',
    ],
    lines_of_therapy: [
      '1L artificial tears + lid hygiene',
      '2L cyclosporine or lifitegrast',
      '3L combination Rx + punctal plugs',
      '4L autologous serum tears / amniotic membrane',
    ],
    therapeutic_area: 'ophthalmology',
  },

  // ──────────────────────────────────────────
  // HEMATOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'Sickle Cell Disease',
    subtypes: [
      {
        name: 'HbSS (homozygous)',
        prevalence_pct: 65,
        key_biomarkers: ['Hb electrophoresis', 'HbF level'],
        standard_of_care: 'Hydroxyurea; voxelotor; crizanlizumab; L-glutamine',
      },
      {
        name: 'HbSC',
        prevalence_pct: 25,
        key_biomarkers: ['Hb electrophoresis'],
        standard_of_care: 'Hydroxyurea if symptomatic; exchange transfusion',
      },
      {
        name: 'HbS-beta thalassemia',
        prevalence_pct: 10,
        key_biomarkers: ['Hb electrophoresis', 'MCV'],
        standard_of_care: 'Hydroxyurea; transfusion support',
      },
    ],
    patient_segments: [
      { segment: 'Pediatric (managed with HU)', description: 'Hydroxyurea from age 9 months', pct_of_patients: 30 },
      { segment: 'Adult with frequent VOC', description: '≥3 VOC/year, multi-drug therapy', pct_of_patients: 40 },
      {
        segment: 'Curative therapy candidates',
        description: 'Gene therapy / gene editing eligible',
        pct_of_patients: 10,
      },
      { segment: 'Chronic organ damage', description: 'Stroke, renal, pulmonary complications', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'HbF inducer (hydroxyurea)',
      'HbS polymerization inhibitor (voxelotor)',
      'Anti-P-selectin mAb (crizanlizumab)',
      'Gene therapy (LentiGlobin)',
      'Gene editing (CRISPR - Casgevy)',
      'L-glutamine',
    ],
    lines_of_therapy: ['1L hydroxyurea', '2L add voxelotor/crizanlizumab', '3L gene therapy/editing (curative)'],
    therapeutic_area: 'hematology',
  },
  {
    indication: 'Hemophilia A',
    subtypes: [
      {
        name: 'Severe (<1% FVIII)',
        prevalence_pct: 50,
        key_biomarkers: ['Factor VIII activity', 'inhibitor titer'],
        standard_of_care: 'Emicizumab prophylaxis; FVIII for bleeds; gene therapy eligible',
      },
      {
        name: 'Moderate (1-5% FVIII)',
        prevalence_pct: 25,
        key_biomarkers: ['Factor VIII activity'],
        standard_of_care: 'Prophylaxis or on-demand FVIII',
      },
      {
        name: 'Mild (5-40% FVIII)',
        prevalence_pct: 25,
        key_biomarkers: ['Factor VIII activity'],
        standard_of_care: 'On-demand FVIII or desmopressin; emicizumab emerging',
      },
    ],
    patient_segments: [
      {
        segment: 'With inhibitors',
        description: 'Alloantibody to FVIII, bypassing agents needed',
        pct_of_patients: 25,
      },
      { segment: 'Without inhibitors', description: 'Standard FVIII or emicizumab prophylaxis', pct_of_patients: 75 },
    ],
    mechanisms_of_action: [
      'Factor VIII replacement',
      'Extended half-life FVIII (efanesoctocog)',
      'Bispecific mAb (emicizumab)',
      'Anti-TFPI mAb (concizumab)',
      'Gene therapy (valoctocogene)',
      'RNAi (fitusiran - anti-AT3)',
    ],
    lines_of_therapy: ['1L emicizumab prophylaxis', '2L EHL-FVIII', '3L gene therapy (curative intent)'],
    therapeutic_area: 'hematology',
  },
  {
    indication: 'Immune Thrombocytopenia',
    subtypes: [
      {
        name: 'Newly diagnosed (<3 months)',
        prevalence_pct: 30,
        key_biomarkers: ['Platelet count', 'anti-platelet antibodies'],
        standard_of_care: 'Corticosteroids (prednisone/dexamethasone); IVIG if urgent',
      },
      {
        name: 'Persistent (3-12 months)',
        prevalence_pct: 20,
        key_biomarkers: ['Platelet count trend'],
        standard_of_care: 'TPO-RA (eltrombopag, romiplostim); rituximab',
      },
      {
        name: 'Chronic (>12 months)',
        prevalence_pct: 50,
        key_biomarkers: ['Refractory to 1L/2L'],
        standard_of_care: 'TPO-RA long-term; fostamatinib; splenectomy (declining use)',
      },
    ],
    patient_segments: [
      { segment: 'Mild (plt 50-100K)', description: 'Monitor, treat if bleeding or procedure', pct_of_patients: 30 },
      { segment: 'Moderate (plt 20-50K)', description: 'Active treatment to raise platelets', pct_of_patients: 40 },
      { segment: 'Severe (plt <20K)', description: 'Urgent treatment, hospitalization risk', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'TPO receptor agonist',
      'Corticosteroid',
      'Anti-CD20 mAb (rituximab)',
      'SYK inhibitor (fostamatinib)',
      'FcRn inhibitor (rozanolixizumab)',
      'IVIG',
      'Complement inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L corticosteroids ± IVIG',
      '2L TPO-RA or rituximab',
      '3L fostamatinib / FcRn inhibitor / novel',
    ],
    therapeutic_area: 'hematology',
  },
  {
    indication: 'Thrombotic Thrombocytopenic Purpura',
    subtypes: [
      {
        name: 'Acquired (autoimmune) TTP',
        prevalence_pct: 95,
        key_biomarkers: ['ADAMTS13 activity <10%', 'ADAMTS13 inhibitor titer', 'schistocytes', 'LDH elevated'],
        standard_of_care: 'Caplacizumab + plasma exchange + immunosuppression (steroids + rituximab)',
      },
      {
        name: 'Congenital TTP (Upshaw-Schulman)',
        prevalence_pct: 5,
        key_biomarkers: ['ADAMTS13 <10% without inhibitor', 'ADAMTS13 gene mutations'],
        standard_of_care: 'Prophylactic plasma infusion; recombinant ADAMTS13 (emerging)',
      },
    ],
    patient_segments: [
      {
        segment: 'Acute initial episode',
        description: 'First presentation; emergency plasma exchange + caplacizumab',
        pct_of_patients: 40,
      },
      {
        segment: 'Relapsing acquired TTP',
        description: 'Recurrent episodes; rituximab for remission maintenance',
        pct_of_patients: 35,
      },
      {
        segment: 'Refractory to initial therapy',
        description: 'Persistent ADAMTS13 deficiency despite standard Tx',
        pct_of_patients: 15,
      },
      {
        segment: 'Congenital (prophylaxis)',
        description: 'Regular plasma infusion or recombinant ADAMTS13',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Anti-vWF nanobody (caplacizumab)',
      'Plasma exchange (replace ADAMTS13)',
      'Anti-CD20 mAb (rituximab)',
      'Corticosteroid',
      'Recombinant ADAMTS13 (emerging)',
      'FcRn inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L caplacizumab + PEX + steroids + rituximab',
      '2L intensified PEX + escalated immunosuppression',
      '3L recombinant ADAMTS13 / novel',
    ],
    therapeutic_area: 'hematology',
  },

  // ──────────────────────────────────────────
  // DERMATOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'Psoriasis',
    subtypes: [
      {
        name: 'Plaque (Chronic)',
        prevalence_pct: 80,
        key_biomarkers: ['BSA', 'PASI', 'IGA'],
        standard_of_care: 'Topical (mild), phototherapy (moderate), biologic (moderate-severe)',
      },
      {
        name: 'Guttate',
        prevalence_pct: 8,
        key_biomarkers: ['ASO titer (strep-triggered)'],
        standard_of_care: 'Topical + phototherapy; often self-resolving',
      },
      {
        name: 'Pustular',
        prevalence_pct: 5,
        key_biomarkers: ['IL-36 pathway', 'GPP flares'],
        standard_of_care: 'Spesolimab (anti-IL-36R); acitretin; cyclosporine',
      },
      {
        name: 'Erythrodermic',
        prevalence_pct: 2,
        key_biomarkers: ['BSA >90%'],
        standard_of_care: 'Systemic immunosuppression, biologic, hospitalization',
      },
      {
        name: 'Nail Psoriasis',
        prevalence_pct: 5,
        key_biomarkers: ['NAPSI score'],
        standard_of_care: 'Biologic therapy (anti-IL-17/23); topical',
      },
    ],
    patient_segments: [
      { segment: 'Mild (BSA <3%)', description: 'Topical-only management', pct_of_patients: 60 },
      { segment: 'Moderate (BSA 3-10%)', description: 'Phototherapy or systemic Tx', pct_of_patients: 25 },
      { segment: 'Severe (BSA >10%)', description: 'Biologic-eligible', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Anti-IL-17A (secukinumab, ixekizumab)',
      'Anti-IL-17A/F bispecific (bimekizumab)',
      'Anti-IL-23 (risankizumab, guselkumab, tildrakizumab)',
      'Anti-TNF (adalimumab)',
      'TYK2 inhibitor (deucravacitinib)',
      'Anti-IL-36R (spesolimab)',
      'PDE4 inhibitor (apremilast)',
    ],
    lines_of_therapy: [
      '1L topical',
      '2L phototherapy/apremilast',
      '3L biologic (anti-IL-23 preferred)',
      '4L switch biologic class',
    ],
    therapeutic_area: 'dermatology',
  },
  {
    indication: 'Atopic Dermatitis',
    subtypes: [
      {
        name: 'Mild',
        prevalence_pct: 60,
        key_biomarkers: ['EASI <7', 'IGA 2'],
        standard_of_care: 'Topical corticosteroids, TCI, PDE4 inhibitor (crisaborole)',
      },
      {
        name: 'Moderate',
        prevalence_pct: 25,
        key_biomarkers: ['EASI 7-21', 'IGA 3', 'IgE elevated'],
        standard_of_care: 'Dupilumab; topical JAK (ruxolitinib); tralokinumab',
      },
      {
        name: 'Severe',
        prevalence_pct: 15,
        key_biomarkers: ['EASI >21', 'IGA 4', 'BSA >10%'],
        standard_of_care: 'Dupilumab; upadacitinib or abrocitinib (JAK1i)',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (6mo-11yr)',
        description: 'Age-appropriate dosing, safety monitoring',
        pct_of_patients: 30,
      },
      {
        segment: 'Adolescent (12-17)',
        description: 'Biologic eligible (dupilumab, tralokinumab)',
        pct_of_patients: 15,
      },
      { segment: 'Adult (18+)', description: 'Full therapeutic options available', pct_of_patients: 55 },
    ],
    mechanisms_of_action: [
      'Anti-IL-4/IL-13 (dupilumab)',
      'Anti-IL-13 (tralokinumab)',
      'JAK1 inhibitor oral (upadacitinib, abrocitinib)',
      'JAK1/2 topical (ruxolitinib)',
      'Anti-IL-31 (nemolizumab)',
      'Anti-OX40 (emerging)',
      'PDE4 inhibitor topical (crisaborole)',
    ],
    lines_of_therapy: [
      '1L topical CS/TCI',
      '2L dupilumab or tralokinumab',
      '3L JAK inhibitor',
      '4L novel (anti-IL-31/OX40)',
    ],
    therapeutic_area: 'dermatology',
  },
  {
    indication: 'Alopecia Areata',
    subtypes: [
      {
        name: 'Patchy AA',
        prevalence_pct: 65,
        key_biomarkers: ['SALT score', 'NKG2D+ T cells'],
        standard_of_care: 'Topical corticosteroids; intralesional triamcinolone',
      },
      {
        name: 'Alopecia Totalis',
        prevalence_pct: 20,
        key_biomarkers: ['SALT 100'],
        standard_of_care: 'JAK inhibitor (baricitinib, ritlecitinib); systemic immunosuppression',
      },
      {
        name: 'Alopecia Universalis',
        prevalence_pct: 15,
        key_biomarkers: ['SALT 100 + body hair loss'],
        standard_of_care: 'JAK inhibitor; clinical trial enrollment',
      },
    ],
    patient_segments: [
      {
        segment: 'Limited disease (<50% scalp)',
        description: 'Topical/intralesional Tx, observation',
        pct_of_patients: 50,
      },
      { segment: 'Extensive (≥50% scalp)', description: 'Systemic JAK inhibitor eligible', pct_of_patients: 35 },
      { segment: 'Refractory', description: 'Failed JAK inhibitor, clinical trial', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'JAK1/2 inhibitor (baricitinib)',
      'JAK3/TEC inhibitor (ritlecitinib)',
      'Topical JAK (emerging)',
      'Anti-IL-15 (emerging)',
      'Corticosteroid (topical/intralesional/systemic)',
    ],
    lines_of_therapy: [
      '1L topical/intralesional CS',
      '2L JAK inhibitor (baricitinib/ritlecitinib)',
      '3L novel/clinical trial',
    ],
    therapeutic_area: 'dermatology',
  },
  {
    indication: 'Vitiligo',
    subtypes: [
      {
        name: 'Non-Segmental (Generalized)',
        prevalence_pct: 85,
        key_biomarkers: ['BSA involvement', 'VASI score', 'anti-melanocyte antibodies', 'thyroid antibodies'],
        standard_of_care: 'Topical ruxolitinib (Opzelura); topical corticosteroids; narrowband UVB',
      },
      {
        name: 'Segmental',
        prevalence_pct: 15,
        key_biomarkers: ['Dermatomal distribution', 'stable vs progressive'],
        standard_of_care: 'Topical corticosteroid/calcineurin inhibitor; surgical melanocyte transplant if stable',
      },
    ],
    patient_segments: [
      { segment: 'Limited BSA (<5%)', description: 'Topical therapy primary approach', pct_of_patients: 40 },
      { segment: 'Moderate BSA (5-20%)', description: 'Topical + phototherapy combination', pct_of_patients: 30 },
      {
        segment: 'Extensive BSA (>20%)',
        description: 'Systemic JAK inhibitor consideration; phototherapy',
        pct_of_patients: 20,
      },
      {
        segment: 'Facial involvement',
        description: 'High psychosocial impact; topical JAKi preferred site',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'JAK1/2 inhibitor topical (ruxolitinib)',
      'JAK inhibitor oral (emerging)',
      'Topical calcineurin inhibitor (tacrolimus)',
      'Narrowband UVB phototherapy',
      'Topical corticosteroid',
      'Melanocyte-keratinocyte transplant',
      'Anti-IL-15 (emerging)',
    ],
    lines_of_therapy: [
      '1L topical ruxolitinib or corticosteroid',
      '2L narrowband UVB + topical',
      '3L oral JAK inhibitor (emerging) or surgical',
    ],
    therapeutic_area: 'dermatology',
  },

  // ──────────────────────────────────────────
  // GASTROENTEROLOGY
  // ──────────────────────────────────────────

  {
    indication: "Crohn's Disease",
    subtypes: [
      {
        name: "Ileitis (ileal Crohn's)",
        prevalence_pct: 30,
        key_biomarkers: ['Fecal calprotectin', 'CRP', 'SES-CD endoscopic score', 'MR enterography'],
        standard_of_care: 'Anti-TNF (adalimumab, infliximab); vedolizumab; ustekinumab',
      },
      {
        name: "Crohn's Colitis",
        prevalence_pct: 25,
        key_biomarkers: ['Fecal calprotectin', 'colonoscopy findings', 'CRP'],
        standard_of_care: 'Anti-TNF or vedolizumab; 5-ASA (limited efficacy)',
      },
      {
        name: 'Ileocolitis',
        prevalence_pct: 45,
        key_biomarkers: ['SES-CD', 'fecal calprotectin', 'CRP', 'MR enterography'],
        standard_of_care: 'Biologic therapy (anti-TNF, anti-IL-23, anti-integrin); corticosteroids for induction',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild-moderate (biologic-naive)',
        description: 'First biologic trial; endoscopic healing target',
        pct_of_patients: 35,
      },
      {
        segment: 'Moderate-severe (biologic-experienced)',
        description: 'Failed first biologic; switch mechanism',
        pct_of_patients: 30,
      },
      {
        segment: 'Penetrating/fistulizing',
        description: 'Perianal or enteric fistulae; infliximab preferred',
        pct_of_patients: 20,
      },
      {
        segment: 'Stricturing',
        description: 'Fibrotic strictures; may require endoscopic dilation or surgery',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Anti-TNF mAb (adalimumab, infliximab, certolizumab)',
      'Anti-IL-23 p19 mAb (risankizumab, mirikizumab)',
      'Anti-IL-12/23 p40 mAb (ustekinumab)',
      'Anti-integrin (vedolizumab)',
      'JAK inhibitor (upadacitinib)',
      'S1P receptor modulator (ozanimod)',
      'Corticosteroid (budesonide)',
    ],
    lines_of_therapy: [
      '1L anti-TNF or anti-IL-23',
      '2L switch biologic class',
      '3L JAK inhibitor or combination',
      'Surgery (strictureplasty, resection)',
    ],
    therapeutic_area: 'gastroenterology',
  },
  {
    indication: 'Ulcerative Colitis',
    subtypes: [
      {
        name: 'Ulcerative Proctitis',
        prevalence_pct: 25,
        key_biomarkers: ['Mayo endoscopic subscore', 'fecal calprotectin', 'extent on colonoscopy'],
        standard_of_care: 'Topical mesalamine (suppository/enema); oral 5-ASA',
      },
      {
        name: 'Left-Sided Colitis',
        prevalence_pct: 35,
        key_biomarkers: ['Mayo score', 'fecal calprotectin', 'CRP'],
        standard_of_care: 'Oral + topical 5-ASA; biologic if refractory',
      },
      {
        name: 'Extensive/Pancolitis',
        prevalence_pct: 40,
        key_biomarkers: ['Mayo score', 'fecal calprotectin', 'albumin', 'CRP'],
        standard_of_care: 'Biologic therapy (anti-TNF, vedolizumab, ustekinumab); JAK inhibitor; S1P modulator',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild-moderate (5-ASA responsive)',
        description: 'Controlled on mesalamine maintenance',
        pct_of_patients: 40,
      },
      {
        segment: 'Moderate-severe (biologic-naive)',
        description: 'First biologic; anti-TNF or vedolizumab',
        pct_of_patients: 25,
      },
      {
        segment: 'Biologic-experienced',
        description: 'Failed >=1 biologic; JAK inhibitor or switch',
        pct_of_patients: 20,
      },
      {
        segment: 'Acute severe UC (hospitalized)',
        description: 'IV corticosteroids; rescue infliximab or cyclosporine',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      '5-ASA (mesalamine)',
      'Anti-TNF mAb (infliximab, adalimumab, golimumab)',
      'Anti-integrin (vedolizumab)',
      'Anti-IL-23 p19 (mirikizumab)',
      'JAK inhibitor (tofacitinib, upadacitinib)',
      'S1P receptor modulator (ozanimod, etrasimod)',
      'Anti-IL-12/23 p40 (ustekinumab)',
    ],
    lines_of_therapy: [
      '1L 5-ASA (mild-moderate)',
      '2L biologic (anti-TNF or vedolizumab)',
      '3L JAK inhibitor or S1P modulator',
      '4L colectomy',
    ],
    therapeutic_area: 'gastroenterology',
  },
  {
    indication: 'Irritable Bowel Syndrome',
    subtypes: [
      {
        name: 'IBS-C (constipation-predominant)',
        prevalence_pct: 35,
        key_biomarkers: ['Bristol stool form', 'abdominal pain NRS'],
        standard_of_care: 'Linaclotide, plecanatide, lubiprostone; tegaserod',
      },
      {
        name: 'IBS-D (diarrhea-predominant)',
        prevalence_pct: 35,
        key_biomarkers: ['Bristol stool form', 'bile acid malabsorption test'],
        standard_of_care: 'Eluxadoline, rifaximin, alosetron (severe F)',
      },
      {
        name: 'IBS-M (mixed)',
        prevalence_pct: 30,
        key_biomarkers: ['Alternating stool pattern'],
        standard_of_care: 'Symptom-directed therapy; low FODMAP diet',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild (primary care managed)',
        description: 'Diet, lifestyle, OTC laxative/antidiarrheal',
        pct_of_patients: 60,
      },
      { segment: 'Moderate (GI specialist)', description: 'Prescription pharmacotherapy', pct_of_patients: 30 },
      { segment: 'Severe/refractory', description: 'Multiple agent failure, behavioral therapy', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'GC-C agonist (linaclotide)',
      'Opioid modulator (eluxadoline)',
      'Non-absorbable antibiotic (rifaximin)',
      '5-HT3 antagonist (alosetron)',
      '5-HT4 agonist (tegaserod)',
      'Chloride channel activator (lubiprostone)',
    ],
    lines_of_therapy: [
      '1L diet + fiber/OTC',
      '2L GC-C agonist (IBS-C) or rifaximin (IBS-D)',
      '3L eluxadoline / alosetron / neuromodulator',
    ],
    therapeutic_area: 'gastroenterology',
  },
  {
    indication: 'GERD',
    subtypes: [
      {
        name: 'Non-erosive (NERD)',
        prevalence_pct: 60,
        key_biomarkers: ['pH impedance', 'symptom association'],
        standard_of_care: 'PPI (standard dose); step-down to H2RA',
      },
      {
        name: 'Erosive esophagitis',
        prevalence_pct: 30,
        key_biomarkers: ['LA grade A-D', 'endoscopy'],
        standard_of_care: 'PPI (standard/double dose); vonoprazan',
      },
      {
        name: 'Refractory GERD',
        prevalence_pct: 10,
        key_biomarkers: ['pH impedance on PPI', 'functional heartburn'],
        standard_of_care: 'Double-dose PPI, vonoprazan; anti-reflux surgery (fundoplication, MSA)',
      },
    ],
    patient_segments: [
      { segment: 'Intermittent/mild', description: 'As-needed PPI or H2RA', pct_of_patients: 50 },
      { segment: 'Chronic daily', description: 'Daily PPI maintenance', pct_of_patients: 35 },
      { segment: 'Surgical candidates', description: 'PPI-refractory, large hiatal hernia', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'PPI (omeprazole, esomeprazole)',
      'P-CAB (vonoprazan)',
      'H2RA (famotidine)',
      'Alginate (Gaviscon)',
      'Anti-reflux surgery (Nissen, LINX)',
    ],
    lines_of_therapy: ['1L PPI standard dose', '2L PPI double dose / vonoprazan', '3L anti-reflux surgery'],
    therapeutic_area: 'gastroenterology',
  },
  {
    indication: 'Celiac Disease',
    subtypes: [
      {
        name: 'Classical (GI symptoms)',
        prevalence_pct: 45,
        key_biomarkers: ['tTG-IgA', 'EMA', 'duodenal biopsy Marsh grade'],
        standard_of_care: 'Strict gluten-free diet (GFD)',
      },
      {
        name: 'Non-classical (extraintestinal)',
        prevalence_pct: 40,
        key_biomarkers: ['tTG-IgA', 'DGP', 'anemia', 'osteoporosis'],
        standard_of_care: 'GFD; nutritional supplementation',
      },
      {
        name: 'Refractory celiac disease',
        prevalence_pct: 15,
        key_biomarkers: ['Persistent villous atrophy on GFD', 'aberrant IEL'],
        standard_of_care: 'Strict GFD adherence review; budesonide; immunosuppression',
      },
    ],
    patient_segments: [
      { segment: 'Diagnosed, adherent to GFD', description: 'Well-controlled, annual monitoring', pct_of_patients: 50 },
      {
        segment: 'Diagnosed, non-adherent/accidental exposure',
        description: 'Ongoing symptoms, need for adjunctive Tx',
        pct_of_patients: 35,
      },
      {
        segment: 'Refractory (Type I/II)',
        description: 'Nonresponsive to GFD, lymphoma risk (Type II)',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Gluten-free diet',
      'Transglutaminase 2 inhibitor (emerging)',
      'Immune tolerance (Nexvax2-like, discontinued)',
      'Zonulin inhibitor (larazotide)',
      'IL-15 blockade (emerging)',
    ],
    lines_of_therapy: [
      '1L gluten-free diet',
      '2L adjunctive enzyme/TG2 inhibitor (emerging)',
      '3L immunosuppression (refractory)',
    ],
    therapeutic_area: 'gastroenterology',
  },

  // ──────────────────────────────────────────
  // HEPATOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'NASH/MASH',
    subtypes: [
      {
        name: 'NAFL (steatosis only, F0)',
        prevalence_pct: 30,
        key_biomarkers: ['MRI-PDFF', 'FibroScan CAP'],
        standard_of_care: 'Lifestyle modification (weight loss 7-10%)',
      },
      {
        name: 'NASH without significant fibrosis (F0-F1)',
        prevalence_pct: 30,
        key_biomarkers: ['NAS score ≥4', 'ALT elevation'],
        standard_of_care: 'Weight loss; pioglitazone; vitamin E',
      },
      {
        name: 'NASH with significant fibrosis (F2-F3)',
        prevalence_pct: 25,
        key_biomarkers: ['FibroScan ≥8 kPa', 'ELF score', 'FIB-4'],
        standard_of_care: 'Resmetirom (Rezdiffra) — first FDA-approved; GLP-1 RA (off-label)',
      },
      {
        name: 'NASH cirrhosis (F4)',
        prevalence_pct: 15,
        key_biomarkers: ['Cirrhosis on imaging/biopsy', 'portal hypertension'],
        standard_of_care: 'Transplant evaluation; manage complications (varices, ascites)',
      },
    ],
    patient_segments: [
      {
        segment: 'At-risk NASH (F2-F3)',
        description: 'Pharmacotherapy-eligible, highest unmet need',
        pct_of_patients: 25,
      },
      { segment: 'Compensated cirrhosis', description: 'Prevent decompensation, HCC screening', pct_of_patients: 10 },
      { segment: 'Metabolic comorbidities', description: 'T2D + obesity + NASH overlap', pct_of_patients: 50 },
      { segment: 'Lean NASH', description: 'BMI <25, genetic predisposition', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'THR-β agonist (resmetirom)',
      'GLP-1 RA (semaglutide)',
      'FXR agonist',
      'PPAR agonist',
      'Anti-fibrotic',
      'SGLT2 inhibitor',
      'GLP-1/GIP dual agonist',
      'ACC inhibitor',
    ],
    lines_of_therapy: ['1L lifestyle + weight loss', '2L resmetirom (F2-F3)', '3L GLP-1 RA add-on / novel combination'],
    therapeutic_area: 'hepatology',
  },
  {
    indication: 'Primary Biliary Cholangitis',
    subtypes: [
      {
        name: 'UDCA-responsive',
        prevalence_pct: 60,
        key_biomarkers: ['ALP', 'bilirubin', 'AMA', 'Paris criteria'],
        standard_of_care: 'Ursodeoxycholic acid (UDCA) 13-15 mg/kg/day',
      },
      {
        name: 'UDCA-inadequate response',
        prevalence_pct: 30,
        key_biomarkers: ['ALP >1.67x ULN on UDCA', 'elevated bilirubin'],
        standard_of_care: 'Add obeticholic acid (Ocaliva) or seladelpar (Livdelzi)',
      },
      {
        name: 'Advanced/cirrhotic PBC',
        prevalence_pct: 10,
        key_biomarkers: ['Cirrhosis', 'portal hypertension', 'bilirubin >3'],
        standard_of_care: 'Transplant evaluation; fibrate (off-label)',
      },
    ],
    patient_segments: [
      { segment: 'Controlled on UDCA', description: 'Adequate biochemical response, monitoring', pct_of_patients: 55 },
      { segment: 'Inadequate response to UDCA', description: 'Second-line agent needed', pct_of_patients: 35 },
      { segment: 'Transplant-eligible', description: 'Advanced liver disease, transplant workup', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Bile acid (UDCA)',
      'FXR agonist (obeticholic acid)',
      'PPAR delta agonist (seladelpar)',
      'Fibrate (bezafibrate, off-label)',
      'Anti-IL-12/23 (emerging)',
    ],
    lines_of_therapy: ['1L UDCA', '2L add OCA or seladelpar', '3L transplant'],
    therapeutic_area: 'hepatology',
  },
  {
    indication: 'Cirrhosis',
    subtypes: [
      {
        name: 'Compensated Cirrhosis',
        prevalence_pct: 60,
        key_biomarkers: ['FibroScan ≥12.5 kPa', 'platelet count', 'albumin', 'MELD score', 'liver biopsy (F4)'],
        standard_of_care: 'Treat underlying etiology; HCC surveillance q6 months; varices screening',
      },
      {
        name: 'Decompensated Cirrhosis',
        prevalence_pct: 40,
        key_biomarkers: [
          'MELD score ≥15',
          'ascites',
          'variceal bleeding',
          'hepatic encephalopathy',
          'bilirubin elevated',
        ],
        standard_of_care: 'Transplant evaluation; diuretics for ascites; lactulose/rifaximin for HE; TIPS if indicated',
      },
    ],
    patient_segments: [
      {
        segment: 'Alcohol-related',
        description: 'Alcohol cessation + supportive care; transplant if abstinent',
        pct_of_patients: 30,
      },
      {
        segment: 'MASH/NAFLD-related',
        description: 'Metabolic risk management; growing population',
        pct_of_patients: 30,
      },
      {
        segment: 'Viral hepatitis-related',
        description: 'HCV cured or HBV suppressed; ongoing surveillance',
        pct_of_patients: 25,
      },
      {
        segment: 'Autoimmune/cholestatic',
        description: 'AIH, PBC, PSC; immunosuppression or UDCA as appropriate',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Antiviral (NUC, DAA — treat underlying cause)',
      'Non-selective beta-blocker (carvedilol, for portal hypertension)',
      'Lactulose + rifaximin (hepatic encephalopathy)',
      'Diuretics (spironolactone + furosemide)',
      'TIPS procedure',
      'FXR agonist (emerging)',
      'Liver transplant',
    ],
    lines_of_therapy: [
      'Compensated: treat etiology + surveillance',
      'Decompensated: manage complications + transplant evaluation',
      'TIPS for refractory ascites/variceal bleeding',
      'Liver transplant',
    ],
    therapeutic_area: 'hepatology',
  },

  // ──────────────────────────────────────────
  // ENDOCRINOLOGY
  // ──────────────────────────────────────────

  {
    indication: 'Type 2 Diabetes',
    subtypes: [
      {
        name: 'HbA1c 7-8% (moderate hyperglycemia)',
        prevalence_pct: 40,
        key_biomarkers: ['HbA1c', 'fasting glucose', 'C-peptide', 'BMI'],
        standard_of_care: 'Metformin + GLP-1 RA or SGLT2i; lifestyle modification',
      },
      {
        name: 'HbA1c 8-10% (poorly controlled)',
        prevalence_pct: 30,
        key_biomarkers: ['HbA1c', 'fasting glucose', 'postprandial glucose'],
        standard_of_care: 'Dual/triple oral + injectable; GLP-1 RA or dual agonist; consider insulin',
      },
      {
        name: 'HbA1c >10% / insulin-requiring',
        prevalence_pct: 15,
        key_biomarkers: ['HbA1c', 'C-peptide (to rule out T1D)', 'anti-GAD (negative)'],
        standard_of_care: 'Basal insulin + GLP-1 RA; titrate insulin; address glucose toxicity',
      },
      {
        name: 'T2D with established CKD',
        prevalence_pct: 15,
        key_biomarkers: ['eGFR', 'UACR', 'HbA1c', 'potassium'],
        standard_of_care: 'SGLT2i (if eGFR >20) + finerenone + GLP-1 RA; dose-adjust metformin',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed (no ASCVD/CKD)',
        description: 'Metformin + lifestyle; early intensification',
        pct_of_patients: 30,
      },
      {
        segment: 'With ASCVD',
        description: 'GLP-1 RA or SGLT2i regardless of HbA1c (CV benefit)',
        pct_of_patients: 25,
      },
      { segment: 'With CKD/HF', description: 'SGLT2i preferred (renal/cardiac protection)', pct_of_patients: 20 },
      {
        segment: 'Obese (BMI ≥30)',
        description: 'GLP-1 RA or dual GIP/GLP-1 agonist for weight + glycemic benefit',
        pct_of_patients: 15,
      },
      { segment: 'Insulin-treated', description: 'Basal ± bolus insulin; adjunct GLP-1 RA', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Biguanide (metformin)',
      'GLP-1 receptor agonist (semaglutide, liraglutide, dulaglutide)',
      'Dual GIP/GLP-1 agonist (tirzepatide)',
      'SGLT2 inhibitor (empagliflozin, dapagliflozin)',
      'DPP-4 inhibitor (sitagliptin)',
      'Sulfonylurea',
      'Basal insulin analog',
      'Triple agonist GLP-1/GIP/glucagon (emerging)',
    ],
    lines_of_therapy: [
      '1L metformin + lifestyle',
      '2L add GLP-1 RA or SGLT2i',
      '3L triple therapy or tirzepatide',
      '4L insulin-based regimen',
    ],
    therapeutic_area: 'endocrinology',
  },
  {
    indication: 'Type 1 Diabetes',
    subtypes: [
      {
        name: 'Autoimmune (classic onset)',
        prevalence_pct: 85,
        key_biomarkers: ['Anti-GAD65', 'anti-IA2', 'anti-ZnT8', 'C-peptide'],
        standard_of_care: 'Intensive insulin therapy (MDI or pump)',
      },
      {
        name: 'LADA (Latent Autoimmune Diabetes of Adults)',
        prevalence_pct: 10,
        key_biomarkers: ['Anti-GAD65+', 'C-peptide preserved initially'],
        standard_of_care: 'Initially oral agents; eventual insulin requirement',
      },
      {
        name: 'Fulminant Type 1',
        prevalence_pct: 5,
        key_biomarkers: ['Rapid onset', 'near-absent C-peptide', 'DKA'],
        standard_of_care: 'Immediate insulin; ICU management of DKA',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric onset (<18)',
        description: 'School-age management, pump therapy preferred',
        pct_of_patients: 50,
      },
      { segment: 'Adult onset', description: 'MDI or hybrid closed loop; LADA evaluation', pct_of_patients: 35 },
      {
        segment: 'Stage 1-2 (pre-symptomatic)',
        description: 'Autoantibody+ but not yet insulin-dependent; teplizumab eligible',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Insulin analog (rapid, basal, ultra-long)',
      'Hybrid closed-loop (artificial pancreas)',
      'Anti-CD3 mAb (teplizumab — delay onset)',
      'SGLT2 inhibitor (adjunct)',
      'Beta-cell regeneration (emerging)',
      'Islet transplant/encapsulation',
    ],
    lines_of_therapy: [
      'Pre-T1D: teplizumab (Stage 2)',
      '1L insulin therapy',
      '2L closed-loop system',
      '3L adjunct SGLT2i / stem cell (emerging)',
    ],
    therapeutic_area: 'endocrinology',
  },
  {
    indication: 'Thyroid Disorders',
    subtypes: [
      {
        name: "Hypothyroidism (Hashimoto's)",
        prevalence_pct: 65,
        key_biomarkers: ['TSH elevated', 'free T4 low', 'anti-TPO'],
        standard_of_care: 'Levothyroxine replacement',
      },
      {
        name: "Graves' Disease (hyperthyroidism)",
        prevalence_pct: 25,
        key_biomarkers: ['TSH suppressed', 'TRAb', 'free T4/T3 elevated'],
        standard_of_care: 'Methimazole/PTU; radioactive iodine; thyroidectomy',
      },
      {
        name: 'Thyroid Eye Disease',
        prevalence_pct: 5,
        key_biomarkers: ['Clinical Activity Score', 'proptosis', 'TRAb'],
        standard_of_care: 'Teprotumumab (Tepezza); orbital decompression',
      },
      {
        name: 'Thyroid Nodules/Cancer screening',
        prevalence_pct: 5,
        key_biomarkers: ['FNA cytology', 'BRAF/RAS mutations', 'Afirma/ThyroSeq'],
        standard_of_care: 'Observation or surgery based on molecular testing',
      },
    ],
    patient_segments: [
      { segment: 'Stable on replacement', description: 'Well-controlled hypothyroid, annual TSH', pct_of_patients: 50 },
      { segment: 'Newly diagnosed', description: 'Titrating levothyroxine or anti-thyroid Rx', pct_of_patients: 25 },
      { segment: "Graves'/TED active", description: 'Active autoimmune thyroid disease', pct_of_patients: 15 },
      { segment: 'Thyroid cancer survivors', description: 'TSH suppression, surveillance', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Thyroid hormone replacement (levothyroxine)',
      'Anti-thyroid (methimazole, PTU)',
      'Anti-IGF-1R mAb (teprotumumab)',
      'Radioactive iodine (I-131)',
      'Thyroidectomy',
      'TKI (for advanced thyroid cancer)',
    ],
    lines_of_therapy: ['Hypo: levothyroxine', 'Hyper: methimazole → RAI/surgery', 'TED: teprotumumab'],
    therapeutic_area: 'endocrinology',
  },
  {
    indication: 'Osteoporosis',
    subtypes: [
      {
        name: 'Postmenopausal osteoporosis',
        prevalence_pct: 70,
        key_biomarkers: ['DXA T-score ≤-2.5', 'FRAX score', 'P1NP', 'CTX'],
        standard_of_care: 'Bisphosphonate (alendronate); denosumab; romosozumab if high-risk',
      },
      {
        name: 'Glucocorticoid-induced',
        prevalence_pct: 15,
        key_biomarkers: ['DXA', 'prednisone ≥5mg/day ≥3 months'],
        standard_of_care: 'Bisphosphonate or teriparatide',
      },
      {
        name: 'Male osteoporosis',
        prevalence_pct: 10,
        key_biomarkers: ['DXA T-score', 'testosterone', 'vitamin D'],
        standard_of_care: 'Bisphosphonate; denosumab; testosterone if hypogonadal',
      },
      {
        name: 'Secondary osteoporosis',
        prevalence_pct: 5,
        key_biomarkers: ['DXA', 'underlying cause (hyperPTH, malabsorption)'],
        standard_of_care: 'Treat underlying cause + bone-active agent',
      },
    ],
    patient_segments: [
      {
        segment: 'Very high fracture risk',
        description: 'Prior fracture or T-score ≤-3.0; anabolic-first strategy',
        pct_of_patients: 20,
      },
      { segment: 'High risk', description: 'T-score ≤-2.5, FRAX threshold met', pct_of_patients: 30 },
      { segment: 'Moderate risk', description: 'Osteopenia with risk factors', pct_of_patients: 35 },
      { segment: 'Treatment-experienced', description: 'Sequential therapy after anabolic', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Bisphosphonate (alendronate, zoledronic acid)',
      'Anti-RANKL mAb (denosumab)',
      'Anti-sclerostin mAb (romosozumab)',
      'PTH analog (teriparatide)',
      'PTHrP analog (abaloparatide)',
      'SERM (raloxifene)',
    ],
    lines_of_therapy: [
      'High risk 1L: romosozumab/teriparatide → bisphosphonate',
      'Standard 1L: bisphosphonate or denosumab',
      '2L: switch agent class',
    ],
    therapeutic_area: 'endocrinology',
  },

  // ──────────────────────────────────────────
  // MUSCULOSKELETAL
  // ──────────────────────────────────────────

  {
    indication: 'Rheumatoid Arthritis',
    subtypes: [
      {
        name: 'Seropositive RA (RF+ and/or anti-CCP+)',
        prevalence_pct: 70,
        key_biomarkers: ['RF', 'anti-CCP/ACPA', 'CRP', 'ESR', 'DAS28'],
        standard_of_care: 'Methotrexate + biologic DMARD (anti-TNF, anti-IL-6, or abatacept)',
      },
      {
        name: 'Seronegative RA',
        prevalence_pct: 30,
        key_biomarkers: ['CRP', 'ESR', 'ultrasound synovitis', 'MRI bone edema'],
        standard_of_care: 'Methotrexate; biologic DMARD if inadequate response',
      },
    ],
    patient_segments: [
      {
        segment: 'Early RA (<2 years)',
        description: 'Aggressive treat-to-target; window of opportunity',
        pct_of_patients: 25,
      },
      {
        segment: 'Established RA (MTX-responsive)',
        description: 'Stable on csDMARD; low disease activity',
        pct_of_patients: 30,
      },
      { segment: 'Biologic-treated', description: 'On anti-TNF, anti-IL-6, or abatacept + MTX', pct_of_patients: 30 },
      {
        segment: 'Difficult-to-treat / refractory',
        description: 'Failed >=2 bDMARDs with different mechanisms',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Anti-TNF mAb (adalimumab, infliximab, certolizumab, golimumab)',
      'Anti-IL-6R mAb (tocilizumab, sarilumab)',
      'CTLA-4-Ig (abatacept)',
      'Anti-CD20 mAb (rituximab)',
      'JAK inhibitor (tofacitinib, baricitinib, upadacitinib)',
      'Methotrexate (anchor DMARD)',
      'Anti-GM-CSF (emerging)',
    ],
    lines_of_therapy: [
      '1L methotrexate + short-term glucocorticoid',
      '2L MTX + biologic DMARD (anti-TNF or anti-IL-6)',
      '3L switch biologic class or JAK inhibitor',
      '4L rituximab or novel agent',
    ],
    therapeutic_area: 'musculoskeletal',
  },
  {
    indication: 'Osteoarthritis',
    subtypes: [
      {
        name: 'Knee OA',
        prevalence_pct: 45,
        key_biomarkers: ['KL grade (X-ray)', 'MRI bone marrow lesions'],
        standard_of_care: 'NSAIDs, PT, intra-articular corticosteroid/HA; TKR if severe',
      },
      {
        name: 'Hip OA',
        prevalence_pct: 25,
        key_biomarkers: ['KL grade'],
        standard_of_care: 'NSAIDs, PT; total hip replacement if severe',
      },
      {
        name: 'Hand OA (including erosive)',
        prevalence_pct: 20,
        key_biomarkers: ['Nodes', 'erosions on X-ray'],
        standard_of_care: 'Topical NSAIDs, splints, PT',
      },
      {
        name: 'Spinal OA',
        prevalence_pct: 10,
        key_biomarkers: ['Facet joint arthropathy on imaging'],
        standard_of_care: 'PT, NSAIDs, facet joint injection',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild-moderate (conservative)',
        description: 'OTC analgesics, exercise, weight management',
        pct_of_patients: 55,
      },
      {
        segment: 'Moderate-severe (injectable)',
        description: 'Intra-articular injections, prescription NSAIDs',
        pct_of_patients: 30,
      },
      { segment: 'Surgical candidates', description: 'Total joint replacement eligible', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'NSAID',
      'Intra-articular corticosteroid',
      'Hyaluronic acid injection',
      'Anti-NGF mAb (tanezumab — regulatory issues)',
      'Wnt pathway inhibitor (lorecivivint)',
      'Total joint replacement',
    ],
    lines_of_therapy: ['1L OTC analgesic + PT', '2L prescription NSAID + IA injection', '3L surgery (TKR/THR)'],
    therapeutic_area: 'musculoskeletal',
  },
  {
    indication: 'Gout',
    subtypes: [
      {
        name: 'Acute Gout Flare',
        prevalence_pct: 40,
        key_biomarkers: ['Serum urate', 'MSU crystals on joint aspiration', 'CRP'],
        standard_of_care: 'Colchicine, NSAIDs, or corticosteroids',
      },
      {
        name: 'Chronic Tophaceous Gout',
        prevalence_pct: 15,
        key_biomarkers: ['Tophi on exam/imaging', 'serum urate >6 mg/dL'],
        standard_of_care: 'Urate-lowering therapy (allopurinol, febuxostat); pegloticase if refractory',
      },
      {
        name: 'Intercritical (between flares)',
        prevalence_pct: 45,
        key_biomarkers: ['Serum urate (target <6)'],
        standard_of_care: 'Allopurinol or febuxostat titrated to target',
      },
    ],
    patient_segments: [
      {
        segment: 'Infrequent flares (<2/year)',
        description: 'Flare management ± ULT consideration',
        pct_of_patients: 40,
      },
      { segment: 'Frequent flares (≥2/year)', description: 'ULT indicated, flare prophylaxis', pct_of_patients: 35 },
      { segment: 'Refractory/tophaceous', description: 'ULT-refractory, pegloticase eligible', pct_of_patients: 15 },
      { segment: 'CKD comorbid', description: 'Dose-adjusted ULT, avoid NSAIDs', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Xanthine oxidase inhibitor (allopurinol, febuxostat)',
      'PEGylated uricase (pegloticase)',
      'URAT1 inhibitor (lesinurad)',
      'Anti-IL-1β (anakinra, rilonacept)',
      'Colchicine',
      'NSAID',
    ],
    lines_of_therapy: [
      'Acute: colchicine/NSAID/steroid',
      '1L ULT: allopurinol',
      '2L ULT: febuxostat',
      '3L pegloticase (refractory)',
    ],
    therapeutic_area: 'musculoskeletal',
  },
  {
    indication: 'Ankylosing Spondylitis',
    subtypes: [
      {
        name: 'Radiographic axSpA (AS)',
        prevalence_pct: 60,
        key_biomarkers: ['HLA-B27', 'sacroiliitis on X-ray', 'MRI inflammation'],
        standard_of_care: 'NSAIDs → anti-TNF (adalimumab, certolizumab) or anti-IL-17 (secukinumab)',
      },
      {
        name: 'Non-radiographic axSpA (nr-axSpA)',
        prevalence_pct: 40,
        key_biomarkers: ['HLA-B27', 'MRI bone marrow edema', 'CRP'],
        standard_of_care: 'NSAIDs → anti-TNF or anti-IL-17 if inadequate response',
      },
    ],
    patient_segments: [
      { segment: 'NSAID-responsive', description: 'Controlled on NSAIDs + exercise', pct_of_patients: 40 },
      { segment: 'Biologic-eligible', description: 'NSAID-inadequate, starting biologic', pct_of_patients: 35 },
      { segment: 'Biologic-experienced', description: 'Failed first biologic, switching class', pct_of_patients: 15 },
      {
        segment: 'Peripheral involvement',
        description: 'Extra-axial joints, enthesitis, uveitis',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'NSAID',
      'Anti-TNF (adalimumab, certolizumab, golimumab)',
      'Anti-IL-17A (secukinumab, ixekizumab)',
      'JAK inhibitor (upadacitinib, tofacitinib)',
      'Anti-IL-23 (emerging, mixed data)',
    ],
    lines_of_therapy: ['1L NSAIDs + exercise', '2L anti-TNF or anti-IL-17A', '3L JAK inhibitor or switch biologic'],
    therapeutic_area: 'musculoskeletal',
  },
  // ──────────────────────────────────────────
  // ONCOLOGY — EXPANDED INDICATIONS
  // ──────────────────────────────────────────
  {
    indication: 'Pancreatic Ductal Adenocarcinoma',
    subtypes: [
      {
        name: 'Resectable',
        prevalence_pct: 15,
        key_biomarkers: ['KRAS', 'BRCA1/2', 'MSI-H', 'NTRK'],
        standard_of_care: 'Surgery + adjuvant mFOLFIRINOX or gemcitabine/capecitabine',
      },
      {
        name: 'Locally Advanced',
        prevalence_pct: 30,
        key_biomarkers: ['KRAS', 'BRCA1/2', 'MSI-H', 'NTRK'],
        standard_of_care: 'FOLFIRINOX or gemcitabine/nab-paclitaxel; consider radiation',
      },
      {
        name: 'Metastatic',
        prevalence_pct: 55,
        key_biomarkers: ['KRAS', 'BRCA1/2', 'MSI-H', 'NTRK'],
        standard_of_care: 'FOLFIRINOX or gemcitabine/nab-paclitaxel (1L); nanoliposomal irinotecan (2L)',
      },
    ],
    patient_segments: [
      {
        segment: '1L metastatic, fit',
        description: 'ECOG 0-1, receiving FOLFIRINOX or gem/nab-pac',
        pct_of_patients: 45,
      },
      { segment: '1L metastatic, unfit', description: 'ECOG 2+, gemcitabine monotherapy', pct_of_patients: 15 },
      {
        segment: '2L+ metastatic',
        description: 'Progressed on 1L, eligible for second-line regimen',
        pct_of_patients: 25,
      },
      { segment: 'Maintenance after 1L', description: 'BRCA+ on olaparib maintenance', pct_of_patients: 5 },
      { segment: 'Resectable/borderline', description: 'Neoadjuvant or adjuvant setting', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'Platinum chemotherapy',
      'Fluoropyrimidine',
      'Topoisomerase inhibitor',
      'PARP inhibitor',
      'PD-1/PD-L1 inhibitor (MSI-H)',
      'NTRK inhibitor',
      'KRAS G12C inhibitor (emerging)',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Triple Negative Breast Cancer',
    subtypes: [
      {
        name: 'BL1 (basal-like 1)',
        prevalence_pct: 35,
        key_biomarkers: ['PD-L1', 'BRCA', 'TROP2', 'gBRCA'],
        standard_of_care: 'Pembrolizumab + chemo (1L PD-L1+); sacituzumab govitecan (2L+)',
      },
      {
        name: 'BL2 (basal-like 2)',
        prevalence_pct: 10,
        key_biomarkers: ['PD-L1', 'BRCA', 'TROP2', 'gBRCA'],
        standard_of_care: 'Chemotherapy-based regimens; clinical trials',
      },
      {
        name: 'Mesenchymal (M)',
        prevalence_pct: 25,
        key_biomarkers: ['PD-L1', 'BRCA', 'TROP2', 'gBRCA'],
        standard_of_care: 'Chemotherapy; PI3K/mTOR pathway inhibitors (investigational)',
      },
      {
        name: 'LAR (luminal androgen receptor)',
        prevalence_pct: 15,
        key_biomarkers: ['PD-L1', 'BRCA', 'TROP2', 'gBRCA', 'AR'],
        standard_of_care: 'AR-targeted therapy (investigational); standard chemotherapy',
      },
      {
        name: 'Immunomodulatory (IM)',
        prevalence_pct: 15,
        key_biomarkers: ['PD-L1', 'BRCA', 'TROP2', 'gBRCA'],
        standard_of_care: 'Checkpoint inhibitor + chemotherapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Early stage neoadjuvant',
        description: 'Pembrolizumab + chemo → surgery → adjuvant pembro',
        pct_of_patients: 40,
      },
      { segment: '1L metastatic PD-L1+', description: 'Pembrolizumab + chemo', pct_of_patients: 15 },
      { segment: '1L metastatic PD-L1-', description: 'Chemotherapy or PARP inhibitor (gBRCA+)', pct_of_patients: 15 },
      {
        segment: '2L+ metastatic',
        description: 'Sacituzumab govitecan, trastuzumab deruxtecan (HER2-low)',
        pct_of_patients: 20,
      },
      { segment: 'gBRCA-mutant', description: 'PARP inhibitor eligible', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'TROP2 ADC',
      'PARP inhibitor',
      'Anti-HER2 ADC (HER2-low)',
      'Platinum chemotherapy',
      'Taxane',
      'AKT inhibitor',
      'AR antagonist (emerging)',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Gastric/Gastroesophageal Junction Cancer',
    subtypes: [
      {
        name: 'Intestinal type',
        prevalence_pct: 50,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'Claudin 18.2'],
        standard_of_care: 'FOLFOX/CAPOX + nivolumab (1L); trastuzumab if HER2+',
      },
      {
        name: 'Diffuse type',
        prevalence_pct: 35,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'Claudin 18.2', 'CDH1'],
        standard_of_care: 'Chemotherapy + IO; zolbetuximab if CLDN18.2+',
      },
      {
        name: 'Mixed type',
        prevalence_pct: 15,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'Claudin 18.2'],
        standard_of_care: 'Platinum/fluoropyrimidine-based chemo + IO',
      },
    ],
    patient_segments: [
      { segment: '1L HER2+ metastatic', description: 'Trastuzumab + chemo + pembrolizumab', pct_of_patients: 15 },
      {
        segment: '1L HER2- metastatic',
        description: 'Chemo + nivolumab; zolbetuximab if CLDN18.2+',
        pct_of_patients: 50,
      },
      { segment: '2L+ metastatic', description: 'Ramucirumab + paclitaxel; T-DXd (HER2+)', pct_of_patients: 25 },
      { segment: 'MSI-H/dMMR', description: 'Checkpoint inhibitor monotherapy', pct_of_patients: 5 },
      { segment: 'Perioperative', description: 'FLOT chemo ± IO', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'Anti-HER2 mAb',
      'Anti-HER2 ADC',
      'Anti-CLDN18.2 mAb',
      'Anti-VEGFR2 mAb',
      'Platinum chemotherapy',
      'Fluoropyrimidine',
      'Taxane',
    ],
    lines_of_therapy: ['Perioperative', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Urothelial Carcinoma',
    subtypes: [
      {
        name: 'Muscle-Invasive (MIBC)',
        prevalence_pct: 25,
        key_biomarkers: ['PD-L1', 'FGFR', 'Nectin-4', 'HER2'],
        standard_of_care: 'Neoadjuvant cisplatin-based chemo → cystectomy; adjuvant nivolumab',
      },
      {
        name: 'Non-Muscle-Invasive (NMIBC)',
        prevalence_pct: 75,
        key_biomarkers: ['PD-L1', 'FGFR', 'Nectin-4', 'HER2'],
        standard_of_care: 'BCG intravesical therapy; pembrolizumab if BCG-unresponsive',
      },
    ],
    patient_segments: [
      { segment: 'NMIBC BCG-responsive', description: 'BCG induction + maintenance', pct_of_patients: 45 },
      {
        segment: 'NMIBC BCG-unresponsive',
        description: 'Pembrolizumab, nadofaragene, or cystectomy',
        pct_of_patients: 15,
      },
      {
        segment: '1L metastatic cisplatin-eligible',
        description: 'Cisplatin-based chemo + avelumab maintenance',
        pct_of_patients: 15,
      },
      {
        segment: '1L metastatic cisplatin-ineligible',
        description: 'Checkpoint inhibitor or enfortumab vedotin + pembro',
        pct_of_patients: 10,
      },
      { segment: '2L+ metastatic', description: 'Enfortumab vedotin, erdafitinib (FGFR+)', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'Nectin-4 ADC (enfortumab vedotin)',
      'FGFR inhibitor',
      'BCG immunotherapy',
      'Platinum chemotherapy',
      'Anti-HER2 ADC',
      'Gene therapy (nadofaragene)',
    ],
    lines_of_therapy: ['Intravesical (NMIBC)', 'Neoadjuvant', 'Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Metastatic Castration-Resistant Prostate Cancer',
    subtypes: [
      {
        name: 'Visceral metastases',
        prevalence_pct: 25,
        key_biomarkers: ['BRCA2', 'HRR', 'AR-V7', 'PSMA'],
        standard_of_care: 'Cabazitaxel or PARP inhibitor (HRR+); clinical trials',
      },
      {
        name: 'Bone-only metastases',
        prevalence_pct: 45,
        key_biomarkers: ['BRCA2', 'HRR', 'AR-V7', 'PSMA'],
        standard_of_care: 'AR pathway inhibitor + radium-223 or Lu-PSMA-617',
      },
      {
        name: 'Lymph node metastases',
        prevalence_pct: 30,
        key_biomarkers: ['BRCA2', 'HRR', 'AR-V7', 'PSMA'],
        standard_of_care: 'AR pathway inhibitor (enzalutamide, abiraterone, apalutamide)',
      },
    ],
    patient_segments: [
      {
        segment: '1L mCRPC post-ARSI naive',
        description: 'Switching AR pathway inhibitor class or taxane',
        pct_of_patients: 30,
      },
      { segment: '1L mCRPC post-docetaxel', description: 'AR pathway inhibitor or cabazitaxel', pct_of_patients: 20 },
      { segment: 'HRR-mutant', description: 'PARP inhibitor (olaparib, rucaparib, talazoparib)', pct_of_patients: 15 },
      { segment: 'PSMA+', description: 'Lu-PSMA-617 radioligand therapy', pct_of_patients: 25 },
      {
        segment: '3L+ heavily pretreated',
        description: 'Clinical trials or best supportive care',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'AR pathway inhibitor',
      'PARP inhibitor',
      'Radioligand therapy (Lu-PSMA-617)',
      'Taxane chemotherapy',
      'Radium-223',
      'PD-1/PD-L1 inhibitor (MSI-H)',
      'AKT inhibitor',
    ],
    lines_of_therapy: ['1L mCRPC', '2L mCRPC', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Cervical Cancer',
    subtypes: [
      {
        name: 'Squamous cell carcinoma',
        prevalence_pct: 70,
        key_biomarkers: ['PD-L1', 'HER2', 'NTRK'],
        standard_of_care: 'Cisplatin/paclitaxel/bevacizumab + pembrolizumab (1L); tisotumab vedotin (2L+)',
      },
      {
        name: 'Adenocarcinoma',
        prevalence_pct: 25,
        key_biomarkers: ['PD-L1', 'HER2', 'NTRK'],
        standard_of_care: 'Platinum-based chemo + pembrolizumab + bevacizumab',
      },
      {
        name: 'Adenosquamous',
        prevalence_pct: 5,
        key_biomarkers: ['PD-L1', 'HER2', 'NTRK'],
        standard_of_care: 'Platinum-based chemo + IO; poorer prognosis',
      },
    ],
    patient_segments: [
      { segment: 'Locally advanced', description: 'Cisplatin + radiation ± pembrolizumab', pct_of_patients: 40 },
      {
        segment: '1L metastatic/recurrent',
        description: 'Platinum/paclitaxel/bevacizumab + pembrolizumab',
        pct_of_patients: 30,
      },
      {
        segment: '2L+ metastatic',
        description: 'Tisotumab vedotin, pembrolizumab (if not prior IO)',
        pct_of_patients: 20,
      },
      { segment: 'MSI-H/dMMR', description: 'Checkpoint inhibitor monotherapy', pct_of_patients: 5 },
      { segment: 'Early stage', description: 'Surgery ± adjuvant chemoradiation', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'Tissue factor ADC (tisotumab vedotin)',
      'Anti-VEGF mAb',
      'Platinum chemotherapy',
      'Taxane',
      'NTRK inhibitor',
      'Anti-HER2 ADC (emerging)',
    ],
    lines_of_therapy: ['Definitive chemoradiation', '1L metastatic/recurrent', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Endometrial Cancer',
    subtypes: [
      {
        name: 'Endometrioid',
        prevalence_pct: 80,
        key_biomarkers: ['MSI-H', 'dMMR', 'HER2', 'p53'],
        standard_of_care: 'Surgery + adjuvant chemo/radiation; carboplatin/paclitaxel (advanced)',
      },
      {
        name: 'Serous',
        prevalence_pct: 10,
        key_biomarkers: ['MSI-H', 'dMMR', 'HER2', 'p53'],
        standard_of_care: 'Carboplatin/paclitaxel ± trastuzumab (HER2+); IO (dMMR)',
      },
      {
        name: 'Clear cell',
        prevalence_pct: 5,
        key_biomarkers: ['MSI-H', 'dMMR', 'HER2', 'p53'],
        standard_of_care: 'Platinum-based chemo; aggressive like serous',
      },
      {
        name: 'Carcinosarcoma',
        prevalence_pct: 5,
        key_biomarkers: ['MSI-H', 'dMMR', 'HER2', 'p53'],
        standard_of_care: 'Carboplatin/paclitaxel; poor prognosis',
      },
    ],
    patient_segments: [
      {
        segment: '1L advanced/metastatic',
        description: 'Carboplatin/paclitaxel + pembrolizumab (dMMR) or + lenvatinib (pMMR)',
        pct_of_patients: 35,
      },
      { segment: '2L+ metastatic dMMR', description: 'Dostarlimab or pembrolizumab monotherapy', pct_of_patients: 15 },
      { segment: '2L+ metastatic pMMR', description: 'Pembrolizumab + lenvatinib', pct_of_patients: 25 },
      { segment: 'Adjuvant', description: 'Post-surgical chemo ± radiation based on risk', pct_of_patients: 20 },
      { segment: 'HER2+ serous', description: 'Trastuzumab-containing regimens', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'Multi-kinase inhibitor (lenvatinib)',
      'Anti-HER2 mAb',
      'Platinum chemotherapy',
      'Taxane',
      'mTOR inhibitor',
      'Anti-HER2 ADC (emerging)',
    ],
    lines_of_therapy: ['Adjuvant', '1L advanced/metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Thyroid Cancer',
    subtypes: [
      {
        name: 'Papillary',
        prevalence_pct: 80,
        key_biomarkers: ['BRAF V600E', 'RET', 'NTRK', 'RAS'],
        standard_of_care: 'Surgery + RAI; BRAF/MEK inhibitors (advanced BRAF+)',
      },
      {
        name: 'Follicular',
        prevalence_pct: 10,
        key_biomarkers: ['BRAF V600E', 'RET', 'NTRK', 'RAS'],
        standard_of_care: 'Surgery + RAI; lenvatinib or sorafenib (RAI-refractory)',
      },
      {
        name: 'Medullary (MTC)',
        prevalence_pct: 5,
        key_biomarkers: ['BRAF V600E', 'RET', 'NTRK', 'RAS', 'RET M918T'],
        standard_of_care: 'Surgery; selpercatinib or pralsetinib (RET+); cabozantinib or vandetanib',
      },
      {
        name: 'Anaplastic (ATC)',
        prevalence_pct: 2,
        key_biomarkers: ['BRAF V600E', 'RET', 'NTRK', 'RAS'],
        standard_of_care: 'Dabrafenib/trametinib (BRAF+); pembrolizumab; chemoradiation',
      },
      {
        name: 'Other',
        prevalence_pct: 3,
        key_biomarkers: ['BRAF V600E', 'RET', 'NTRK', 'RAS'],
        standard_of_care: 'Surgery; individualized systemic therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'RAI-responsive DTC',
        description: 'Surgery + radioactive iodine ablation, good prognosis',
        pct_of_patients: 60,
      },
      {
        segment: 'RAI-refractory DTC',
        description: 'Lenvatinib, sorafenib, or BRAF/MEK inhibitor',
        pct_of_patients: 15,
      },
      { segment: 'Medullary (RET+)', description: 'Selpercatinib or pralsetinib', pct_of_patients: 5 },
      { segment: 'Anaplastic', description: 'BRAF/MEK ± IO; aggressive multimodal', pct_of_patients: 2 },
      { segment: 'Surveillance', description: 'Post-treatment monitoring, TSH suppression', pct_of_patients: 18 },
    ],
    mechanisms_of_action: [
      'BRAF inhibitor',
      'MEK inhibitor',
      'RET inhibitor',
      'NTRK inhibitor',
      'Multi-kinase inhibitor (lenvatinib, sorafenib, cabozantinib)',
      'PD-1 inhibitor',
      'Radioactive iodine',
    ],
    lines_of_therapy: ['Surgery + RAI', '1L systemic (RAI-refractory)', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Glioblastoma',
    subtypes: [
      {
        name: 'Classical',
        prevalence_pct: 25,
        key_biomarkers: ['MGMT', 'IDH1/2', 'EGFR', 'TERT'],
        standard_of_care: 'Maximal resection + temozolomide/radiation (Stupp protocol)',
      },
      {
        name: 'Proneural',
        prevalence_pct: 30,
        key_biomarkers: ['MGMT', 'IDH1/2', 'EGFR', 'TERT'],
        standard_of_care: 'Stupp protocol; IDH-mutant may have better prognosis',
      },
      {
        name: 'Mesenchymal',
        prevalence_pct: 30,
        key_biomarkers: ['MGMT', 'IDH1/2', 'EGFR', 'TERT', 'NF1'],
        standard_of_care: 'Stupp protocol; worst prognosis subtype',
      },
      {
        name: 'Neural',
        prevalence_pct: 15,
        key_biomarkers: ['MGMT', 'IDH1/2', 'EGFR', 'TERT'],
        standard_of_care: 'Stupp protocol',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed MGMT-methylated',
        description: 'Temozolomide + radiation; best response to chemo',
        pct_of_patients: 35,
      },
      {
        segment: 'Newly diagnosed MGMT-unmethylated',
        description: 'Radiation ± temozolomide; TTFields',
        pct_of_patients: 40,
      },
      { segment: 'Recurrent', description: 'Bevacizumab, lomustine, or clinical trials', pct_of_patients: 20 },
      { segment: 'Elderly/unfit', description: 'Hypofractionated radiation ± temozolomide', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'Alkylating agent (temozolomide)',
      'Anti-VEGF mAb (bevacizumab)',
      'Nitrosourea (lomustine)',
      'TTFields (tumor treating fields)',
      'EGFR-targeted therapy (emerging)',
      'IDH inhibitor (emerging)',
      'PD-1 inhibitor (limited efficacy)',
      'CAR-T (investigational)',
    ],
    lines_of_therapy: ['1L (Stupp protocol)', '2L recurrent', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Mesothelioma',
    subtypes: [
      {
        name: 'Epithelioid',
        prevalence_pct: 60,
        key_biomarkers: ['BAP1', 'PD-L1', 'NF2'],
        standard_of_care: 'Nivolumab + ipilimumab (1L); pemetrexed/cisplatin',
      },
      {
        name: 'Sarcomatoid',
        prevalence_pct: 20,
        key_biomarkers: ['BAP1', 'PD-L1', 'NF2'],
        standard_of_care: 'Nivolumab + ipilimumab; poor prognosis',
      },
      {
        name: 'Biphasic',
        prevalence_pct: 20,
        key_biomarkers: ['BAP1', 'PD-L1', 'NF2'],
        standard_of_care: 'Nivolumab + ipilimumab; depends on predominant component',
      },
    ],
    patient_segments: [
      { segment: '1L unresectable', description: 'Nivolumab + ipilimumab or pemetrexed/platinum', pct_of_patients: 55 },
      { segment: 'Surgically resectable', description: 'Pleurectomy/decortication + chemo ± IO', pct_of_patients: 15 },
      { segment: '2L+', description: 'Single-agent IO or chemotherapy', pct_of_patients: 20 },
      { segment: 'Peritoneal mesothelioma', description: 'HIPEC, systemic chemo + IO', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'CTLA-4 inhibitor',
      'Pemetrexed (antifolate)',
      'Platinum chemotherapy',
      'Anti-mesothelin ADC (emerging)',
      'BAP1-targeted (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Merkel Cell Carcinoma',
    subtypes: [
      {
        name: 'Virus-positive (MCPyV+)',
        prevalence_pct: 80,
        key_biomarkers: ['MCPyV', 'PD-L1'],
        standard_of_care: 'Surgery + adjuvant radiation; avelumab or pembrolizumab (advanced)',
      },
      {
        name: 'Virus-negative (MCPyV-)',
        prevalence_pct: 20,
        key_biomarkers: ['MCPyV', 'PD-L1', 'UV mutational burden'],
        standard_of_care: 'Surgery + adjuvant radiation; checkpoint inhibitor (advanced)',
      },
    ],
    patient_segments: [
      {
        segment: 'Localized resectable',
        description: 'Wide excision + sentinel lymph node biopsy + adjuvant RT',
        pct_of_patients: 50,
      },
      { segment: '1L advanced/metastatic', description: 'Avelumab or pembrolizumab', pct_of_patients: 30 },
      {
        segment: '2L+ metastatic',
        description: 'Alternate checkpoint inhibitor; chemotherapy (etoposide/platinum)',
        pct_of_patients: 15,
      },
      { segment: 'Immunosuppressed', description: 'Modified IO approach; higher recurrence risk', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'PD-L1 inhibitor (avelumab)',
      'Platinum chemotherapy',
      'Etoposide',
      'T-cell therapy (investigational)',
    ],
    lines_of_therapy: ['Adjuvant', '1L advanced', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Cholangiocarcinoma',
    subtypes: [
      {
        name: 'Intrahepatic',
        prevalence_pct: 60,
        key_biomarkers: ['IDH1', 'FGFR2', 'HER2', 'MSI-H'],
        standard_of_care: 'Gemcitabine/cisplatin + durvalumab (1L); ivosidenib (IDH1+); pemigatinib (FGFR2+)',
      },
      {
        name: 'Perihilar (Klatskin)',
        prevalence_pct: 25,
        key_biomarkers: ['IDH1', 'FGFR2', 'HER2', 'MSI-H'],
        standard_of_care: 'Gemcitabine/cisplatin + durvalumab; surgery if resectable',
      },
      {
        name: 'Distal',
        prevalence_pct: 15,
        key_biomarkers: ['IDH1', 'FGFR2', 'HER2', 'MSI-H'],
        standard_of_care: 'Gemcitabine/cisplatin + durvalumab; Whipple if resectable',
      },
    ],
    patient_segments: [
      { segment: '1L advanced/metastatic', description: 'Gemcitabine/cisplatin + durvalumab', pct_of_patients: 45 },
      { segment: '2L IDH1-mutant', description: 'Ivosidenib', pct_of_patients: 10 },
      {
        segment: '2L FGFR2 fusion/rearrangement',
        description: 'Pemigatinib, futibatinib, or erdafitinib',
        pct_of_patients: 10,
      },
      { segment: '2L+ other', description: 'FOLFOX or clinical trials', pct_of_patients: 20 },
      { segment: 'Resectable', description: 'Surgery + adjuvant capecitabine', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'PD-L1 inhibitor',
      'IDH1 inhibitor',
      'FGFR inhibitor',
      'Platinum chemotherapy',
      'Gemcitabine',
      'HER2-targeted (emerging)',
      'Fluoropyrimidine',
    ],
    lines_of_therapy: ['Adjuvant', '1L advanced', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Adrenocortical Carcinoma',
    subtypes: [
      {
        name: 'Functional (hormone-secreting)',
        prevalence_pct: 60,
        key_biomarkers: ['p53', 'Ki-67', 'Weiss score'],
        standard_of_care: 'Surgery + mitotane ± adjuvant chemo; EDP-M (advanced)',
      },
      {
        name: 'Non-functional',
        prevalence_pct: 40,
        key_biomarkers: ['p53', 'Ki-67', 'Weiss score'],
        standard_of_care: 'Surgery + mitotane; EDP-M (advanced)',
      },
    ],
    patient_segments: [
      { segment: 'Resectable', description: 'Adrenalectomy + adjuvant mitotane (high risk)', pct_of_patients: 40 },
      {
        segment: '1L advanced/metastatic',
        description: 'EDP-M (etoposide/doxorubicin/cisplatin + mitotane)',
        pct_of_patients: 30,
      },
      {
        segment: '2L+ metastatic',
        description: 'Gemcitabine + capecitabine; pembrolizumab; clinical trials',
        pct_of_patients: 20,
      },
      {
        segment: 'Hormone control',
        description: 'Medical management of cortisol/aldosterone excess',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Mitotane (adrenolytic)',
      'Platinum chemotherapy',
      'Etoposide',
      'Doxorubicin',
      'PD-1 inhibitor (emerging)',
      'IGF-1R inhibitor (investigational)',
    ],
    lines_of_therapy: ['Adjuvant', '1L advanced', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Mantle Cell Lymphoma',
    subtypes: [
      {
        name: 'Classical',
        prevalence_pct: 80,
        key_biomarkers: ['cyclin D1', 'SOX11', 'TP53', 'Ki-67'],
        standard_of_care: 'Bendamustine/rituximab or R-CHOP ± cytarabine; autologous SCT (fit)',
      },
      {
        name: 'Blastoid variant',
        prevalence_pct: 10,
        key_biomarkers: ['cyclin D1', 'SOX11', 'TP53', 'Ki-67'],
        standard_of_care: 'Aggressive chemoimmunotherapy; poor prognosis; consider alloSCT',
      },
      {
        name: 'Pleomorphic variant',
        prevalence_pct: 10,
        key_biomarkers: ['cyclin D1', 'SOX11', 'TP53', 'Ki-67'],
        standard_of_care: 'Aggressive chemoimmunotherapy; high-grade behavior',
      },
    ],
    patient_segments: [
      {
        segment: '1L transplant-eligible',
        description: 'R-DHAP or R-HyperCVAD → autoSCT → rituximab maintenance',
        pct_of_patients: 30,
      },
      { segment: '1L transplant-ineligible', description: 'BR or R-CHOP → rituximab maintenance', pct_of_patients: 30 },
      {
        segment: 'Relapsed/refractory',
        description: 'BTK inhibitor (ibrutinib, acalabrutinib, zanubrutinib)',
        pct_of_patients: 25,
      },
      {
        segment: '3L+ BTK-refractory',
        description: 'CAR-T (brexucabtagene), pirtobrutinib, venetoclax',
        pct_of_patients: 10,
      },
      { segment: 'Indolent (leukemic non-nodal)', description: 'Watch and wait; SOX11-negative', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'BTK inhibitor',
      'Anti-CD20 mAb (rituximab)',
      'BCL-2 inhibitor',
      'CAR-T cell therapy',
      'Alkylating agent',
      'Proteasome inhibitor (bortezomib)',
      'Immunomodulator (lenalidomide)',
      'Bispecific antibody (emerging)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Myelofibrosis',
    subtypes: [
      {
        name: 'Primary myelofibrosis',
        prevalence_pct: 65,
        key_biomarkers: ['JAK2', 'CALR', 'MPL', 'ASXL1'],
        standard_of_care: 'Ruxolitinib (1L); fedratinib or pacritinib (2L); alloSCT (curative)',
      },
      {
        name: 'Post-polycythemia vera MF',
        prevalence_pct: 20,
        key_biomarkers: ['JAK2', 'CALR', 'MPL', 'ASXL1'],
        standard_of_care: 'JAK inhibitor; alloSCT if eligible',
      },
      {
        name: 'Post-essential thrombocythemia MF',
        prevalence_pct: 15,
        key_biomarkers: ['JAK2', 'CALR', 'MPL', 'ASXL1'],
        standard_of_care: 'JAK inhibitor; alloSCT if eligible',
      },
    ],
    patient_segments: [
      { segment: '1L intermediate/high risk', description: 'Ruxolitinib or momelotinib', pct_of_patients: 40 },
      {
        segment: '2L JAK inhibitor switch',
        description: 'Fedratinib, pacritinib, or momelotinib',
        pct_of_patients: 20,
      },
      {
        segment: 'Transplant-eligible',
        description: 'Allogeneic stem cell transplant (curative intent)',
        pct_of_patients: 10,
      },
      { segment: 'Anemia-predominant', description: 'Momelotinib, danazol, or luspatercept', pct_of_patients: 20 },
      { segment: 'Low risk', description: 'Observation or symptom management', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'JAK1/2 inhibitor (ruxolitinib)',
      'JAK2 inhibitor (fedratinib, pacritinib)',
      'JAK1/JAK2/ACVR1 inhibitor (momelotinib)',
      'BET inhibitor (emerging)',
      'Telomerase inhibitor (imetelstat)',
      'ALK2/ACVR1 inhibitor',
      'PI3Kδ inhibitor',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Polycythemia Vera',
    subtypes: [
      {
        name: 'Low risk',
        prevalence_pct: 40,
        key_biomarkers: ['JAK2 V617F', 'JAK2 exon 12'],
        standard_of_care: 'Phlebotomy + low-dose aspirin',
      },
      {
        name: 'High risk',
        prevalence_pct: 60,
        key_biomarkers: ['JAK2 V617F', 'JAK2 exon 12'],
        standard_of_care: 'Hydroxyurea (1L cytoreduction); ruxolitinib or interferon-alpha (2L)',
      },
    ],
    patient_segments: [
      {
        segment: 'Low risk, phlebotomy-controlled',
        description: 'Phlebotomy + aspirin, observation',
        pct_of_patients: 35,
      },
      { segment: '1L high risk cytoreduction', description: 'Hydroxyurea or interferon-alpha', pct_of_patients: 35 },
      {
        segment: '2L HU-resistant/intolerant',
        description: 'Ruxolitinib or ropeginterferon-alpha-2b',
        pct_of_patients: 20,
      },
      { segment: 'Thrombotic history', description: 'Aggressive cytoreduction + anticoagulation', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'JAK1/2 inhibitor (ruxolitinib)',
      'Pegylated interferon-alpha (ropeginterferon)',
      'Hydroxyurea',
      'Hepcidin mimetic (emerging)',
      'LSD1 inhibitor (emerging)',
    ],
    lines_of_therapy: ['1L (phlebotomy + aspirin)', '1L cytoreduction', '2L cytoreduction', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Neuroblastoma',
    subtypes: [
      {
        name: 'Low risk',
        prevalence_pct: 40,
        key_biomarkers: ['MYCN', 'ALK', '1p/11q del'],
        standard_of_care: 'Observation or surgery alone; excellent prognosis',
      },
      {
        name: 'Intermediate risk',
        prevalence_pct: 15,
        key_biomarkers: ['MYCN', 'ALK', '1p/11q del'],
        standard_of_care: 'Surgery + moderate chemotherapy',
      },
      {
        name: 'High risk',
        prevalence_pct: 45,
        key_biomarkers: ['MYCN', 'ALK', '1p/11q del'],
        standard_of_care: 'Intensive chemo → surgery → autoSCT → anti-GD2 immunotherapy (dinutuximab)',
      },
    ],
    patient_segments: [
      {
        segment: 'Low risk, observation',
        description: 'Spontaneous regression possible; surgery if needed',
        pct_of_patients: 30,
      },
      {
        segment: 'Intermediate risk, chemo',
        description: 'Moderate-intensity chemotherapy + surgery',
        pct_of_patients: 15,
      },
      { segment: 'High risk, induction', description: 'Intensive multiagent chemotherapy', pct_of_patients: 25 },
      {
        segment: 'High risk, consolidation/maintenance',
        description: 'AutoSCT → anti-GD2 (dinutuximab) + isotretinoin',
        pct_of_patients: 20,
      },
      {
        segment: 'Relapsed/refractory',
        description: 'Salvage chemo, MIBG therapy, clinical trials (ALK inhibitors)',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Anti-GD2 mAb (dinutuximab)',
      'ALK inhibitor (crizotinib, lorlatinib)',
      'Retinoid (isotretinoin)',
      'MIBG radiotherapy',
      'Platinum chemotherapy',
      'Topoisomerase inhibitor',
      'Autologous SCT',
      'CAR-T (investigational)',
    ],
    lines_of_therapy: ['1L induction', 'Consolidation', 'Maintenance', '2L relapsed', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Ewing Sarcoma',
    subtypes: [
      {
        name: 'Localized',
        prevalence_pct: 70,
        key_biomarkers: ['EWSR1-FLI1', 'EWSR1-ERG'],
        standard_of_care:
          'VDC/IE (vincristine/doxorubicin/cyclophosphamide alternating with ifosfamide/etoposide) + surgery/radiation',
      },
      {
        name: 'Metastatic',
        prevalence_pct: 30,
        key_biomarkers: ['EWSR1-FLI1', 'EWSR1-ERG'],
        standard_of_care: 'VDC/IE; high-dose chemo + autoSCT (investigational); poor prognosis',
      },
    ],
    patient_segments: [
      {
        segment: '1L localized',
        description: 'Neoadjuvant VDC/IE → surgery/radiation → adjuvant chemo',
        pct_of_patients: 55,
      },
      { segment: '1L metastatic', description: 'VDC/IE; intensified regimens', pct_of_patients: 25 },
      {
        segment: 'Relapsed/refractory',
        description: 'Topotecan/cyclophosphamide, irinotecan/temozolomide, or clinical trials',
        pct_of_patients: 15,
      },
      { segment: 'Maintenance/surveillance', description: 'Post-treatment monitoring', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'Alkylating agent (cyclophosphamide, ifosfamide)',
      'Anthracycline (doxorubicin)',
      'Vinca alkaloid (vincristine)',
      'Topoisomerase inhibitor (etoposide, irinotecan)',
      'Anti-IGF-1R mAb (investigational)',
      'EZH2 inhibitor (emerging)',
    ],
    lines_of_therapy: ['1L', '2L relapsed', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Osteosarcoma',
    subtypes: [
      {
        name: 'Conventional (osteoblastic/chondroblastic/fibroblastic)',
        prevalence_pct: 80,
        key_biomarkers: ['p53', 'RB1', 'HER2'],
        standard_of_care: 'MAP (methotrexate/doxorubicin/cisplatin) + surgery',
      },
      {
        name: 'Telangiectatic',
        prevalence_pct: 10,
        key_biomarkers: ['p53', 'RB1', 'HER2'],
        standard_of_care: 'MAP + surgery; similar to conventional',
      },
      {
        name: 'Small cell',
        prevalence_pct: 5,
        key_biomarkers: ['p53', 'RB1', 'HER2'],
        standard_of_care: 'MAP + surgery; may add Ewing-like regimen',
      },
      {
        name: 'Other (parosteal, periosteal)',
        prevalence_pct: 5,
        key_biomarkers: ['p53', 'RB1', 'HER2'],
        standard_of_care: 'Surgery ± chemo based on grade',
      },
    ],
    patient_segments: [
      { segment: '1L localized', description: 'Neoadjuvant MAP → surgery → adjuvant MAP', pct_of_patients: 60 },
      { segment: '1L metastatic', description: 'MAP + metastasectomy if feasible', pct_of_patients: 20 },
      {
        segment: 'Relapsed/refractory',
        description: 'Ifosfamide/etoposide, gemcitabine/docetaxel, or regorafenib',
        pct_of_patients: 15,
      },
      { segment: 'Unresectable', description: 'Palliative chemo, radiation, clinical trials', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'High-dose methotrexate',
      'Platinum chemotherapy (cisplatin)',
      'Anthracycline (doxorubicin)',
      'Multi-kinase inhibitor (regorafenib)',
      'Anti-GD2 mAb (investigational)',
      'Mifamurtide (EU)',
      'PD-1 inhibitor (limited efficacy)',
    ],
    lines_of_therapy: ['1L (MAP)', '2L relapsed', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Soft Tissue Sarcoma',
    subtypes: [
      {
        name: 'Liposarcoma',
        prevalence_pct: 15,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA'],
        standard_of_care: 'Surgery + doxorubicin-based chemo; CDK4 inhibitor (dedifferentiated)',
      },
      {
        name: 'Leiomyosarcoma',
        prevalence_pct: 15,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA'],
        standard_of_care: 'Surgery + doxorubicin ± ifosfamide; gemcitabine/docetaxel (2L)',
      },
      {
        name: 'Undifferentiated Pleomorphic Sarcoma (UPS)',
        prevalence_pct: 15,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA'],
        standard_of_care: 'Surgery + doxorubicin-based chemo; trabectedin (2L)',
      },
      {
        name: 'Synovial sarcoma',
        prevalence_pct: 8,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA', 'SS18-SSX'],
        standard_of_care: 'Surgery + ifosfamide-based chemo; pazopanib (2L+)',
      },
      {
        name: 'GIST',
        prevalence_pct: 18,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA', 'SDHA/B/C/D'],
        standard_of_care: 'Imatinib (1L); sunitinib (2L); ripretinib (3L+); avapritinib (PDGFRA D842V)',
      },
      {
        name: 'Other STS',
        prevalence_pct: 29,
        key_biomarkers: ['MDM2/CDK4', 'KIT', 'PDGFRA'],
        standard_of_care: 'Surgery + subtype-specific systemic therapy',
      },
    ],
    patient_segments: [
      { segment: '1L advanced non-GIST', description: 'Doxorubicin ± ifosfamide or olaratumab', pct_of_patients: 30 },
      {
        segment: '2L+ non-GIST',
        description: 'Trabectedin, pazopanib, gemcitabine/docetaxel, eribulin',
        pct_of_patients: 20,
      },
      { segment: '1L GIST', description: 'Imatinib', pct_of_patients: 15 },
      { segment: '2L+ GIST', description: 'Sunitinib, regorafenib, ripretinib', pct_of_patients: 10 },
      { segment: 'Localized resectable', description: 'Surgery ± neoadjuvant/adjuvant therapy', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'Anthracycline (doxorubicin)',
      'KIT/PDGFRA inhibitor (imatinib, sunitinib, ripretinib)',
      'Multi-kinase inhibitor (pazopanib, regorafenib)',
      'Trabectedin',
      'CDK4 inhibitor (emerging)',
      'MDM2 inhibitor (emerging)',
      'Anti-PD-1 (limited, UPS)',
      'T-cell engager (afamitresgene autoleucel, MAGE-A4)',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L advanced', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Esophageal Cancer',
    subtypes: [
      {
        name: 'Squamous cell carcinoma',
        prevalence_pct: 40,
        key_biomarkers: ['PD-L1', 'HER2', 'MSI-H'],
        standard_of_care: 'Nivolumab + chemo (1L); pembrolizumab (PD-L1+)',
      },
      {
        name: 'Adenocarcinoma',
        prevalence_pct: 60,
        key_biomarkers: ['PD-L1', 'HER2', 'MSI-H'],
        standard_of_care: 'Nivolumab + chemo (1L); trastuzumab if HER2+ (overlap with GEJ)',
      },
    ],
    patient_segments: [
      {
        segment: 'Perioperative (resectable)',
        description: 'Neoadjuvant chemoradiation → surgery + adjuvant nivolumab',
        pct_of_patients: 25,
      },
      { segment: '1L metastatic', description: 'Nivolumab/pembrolizumab + chemo', pct_of_patients: 35 },
      {
        segment: '2L+ metastatic',
        description: 'Nivolumab, pembrolizumab, ramucirumab/paclitaxel',
        pct_of_patients: 25,
      },
      { segment: 'HER2+', description: 'Trastuzumab + chemo; T-DXd (2L+)', pct_of_patients: 10 },
      { segment: 'MSI-H/dMMR', description: 'Checkpoint inhibitor monotherapy', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor',
      'Anti-HER2 mAb',
      'Anti-HER2 ADC',
      'Anti-VEGFR2 mAb (ramucirumab)',
      'Platinum chemotherapy',
      'Fluoropyrimidine',
      'Taxane',
      'FGFR inhibitor (emerging)',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Hodgkin Lymphoma',
    subtypes: [
      {
        name: 'Classical Hodgkin lymphoma',
        prevalence_pct: 95,
        key_biomarkers: ['CD30', 'PD-L1', 'Reed-Sternberg'],
        standard_of_care: 'ABVD or A+AVD (brentuximab vedotin) (1L); pembrolizumab (R/R)',
      },
      {
        name: 'Nodular lymphocyte-predominant',
        prevalence_pct: 5,
        key_biomarkers: ['CD30', 'PD-L1', 'Reed-Sternberg', 'CD20'],
        standard_of_care: 'Rituximab ± radiation; ABVD for advanced',
      },
    ],
    patient_segments: [
      { segment: '1L early stage favorable', description: 'ABVD × 2-4 cycles + radiation', pct_of_patients: 30 },
      { segment: '1L advanced stage', description: 'A+AVD × 6 cycles or ABVD × 6 cycles', pct_of_patients: 35 },
      {
        segment: '2L relapsed (transplant-eligible)',
        description: 'Salvage chemo → autoSCT; brentuximab vedotin consolidation',
        pct_of_patients: 15,
      },
      {
        segment: '3L+ or post-autoSCT relapse',
        description: 'Pembrolizumab, nivolumab, or brentuximab vedotin',
        pct_of_patients: 15,
      },
      {
        segment: 'Post-IO or refractory',
        description: 'AlloSCT, CAR-T (investigational), bispecific (emerging)',
        pct_of_patients: 5,
      },
    ],
    mechanisms_of_action: [
      'Anti-CD30 ADC (brentuximab vedotin)',
      'PD-1 inhibitor (pembrolizumab, nivolumab)',
      'Alkylating agent (dacarbazine, cyclophosphamide)',
      'Anthracycline (doxorubicin)',
      'Vinca alkaloid (vinblastine)',
      'Anti-CD20 mAb (NLPHL)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Chronic Myeloid Leukemia',
    subtypes: [
      {
        name: 'Chronic phase',
        prevalence_pct: 85,
        key_biomarkers: ['BCR-ABL', 'T315I'],
        standard_of_care: 'Imatinib, dasatinib, nilotinib, or bosutinib (1L TKI)',
      },
      {
        name: 'Accelerated phase',
        prevalence_pct: 10,
        key_biomarkers: ['BCR-ABL', 'T315I'],
        standard_of_care: '2G TKI (dasatinib, nilotinib); ponatinib if T315I+',
      },
      {
        name: 'Blast crisis',
        prevalence_pct: 5,
        key_biomarkers: ['BCR-ABL', 'T315I'],
        standard_of_care: 'TKI + induction chemo; alloSCT if eligible; poor prognosis',
      },
    ],
    patient_segments: [
      { segment: '1L chronic phase', description: 'Imatinib, dasatinib, nilotinib, or bosutinib', pct_of_patients: 50 },
      {
        segment: '2L TKI-resistant/intolerant',
        description: 'Switch TKI class; asciminib (STAMP inhibitor)',
        pct_of_patients: 20,
      },
      { segment: 'T315I-mutant', description: 'Ponatinib or asciminib', pct_of_patients: 5 },
      {
        segment: 'Treatment-free remission',
        description: 'Deep molecular response, TKI discontinuation eligible',
        pct_of_patients: 15,
      },
      { segment: 'Advanced/blast crisis', description: 'TKI + chemo; alloSCT', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'BCR-ABL TKI (imatinib, dasatinib, nilotinib, bosutinib)',
      'BCR-ABL T315I-active TKI (ponatinib)',
      'STAMP inhibitor (asciminib)',
      'Omacetaxine (protein synthesis inhibitor)',
      'Allogeneic SCT',
    ],
    lines_of_therapy: ['1L', '2L', '3L+', 'Treatment-free remission'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'HER2-Positive Breast Cancer',
    subtypes: [
      {
        name: 'HR+/HER2+',
        prevalence_pct: 50,
        key_biomarkers: ['HER2 IHC 3+', 'HER2 FISH', 'PIK3CA'],
        standard_of_care: 'Trastuzumab + pertuzumab + taxane ± endocrine (1L); T-DXd (2L+)',
      },
      {
        name: 'HR-/HER2+',
        prevalence_pct: 50,
        key_biomarkers: ['HER2 IHC 3+', 'HER2 FISH', 'PIK3CA'],
        standard_of_care: 'Trastuzumab + pertuzumab + taxane (1L); T-DXd (2L+)',
      },
    ],
    patient_segments: [
      {
        segment: 'Early stage neoadjuvant',
        description: 'TCHP → surgery → adjuvant HP ± T-DM1 (residual disease)',
        pct_of_patients: 40,
      },
      { segment: '1L metastatic', description: 'Trastuzumab + pertuzumab + taxane', pct_of_patients: 20 },
      { segment: '2L metastatic', description: 'T-DXd (trastuzumab deruxtecan)', pct_of_patients: 20 },
      {
        segment: '3L+ metastatic',
        description: 'Tucatinib + trastuzumab + capecitabine; margetuximab',
        pct_of_patients: 15,
      },
      { segment: 'Brain metastases', description: 'Tucatinib-based regimen; T-DXd', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'Anti-HER2 mAb (trastuzumab, pertuzumab, margetuximab)',
      'Anti-HER2 ADC (T-DXd, T-DM1)',
      'HER2 TKI (tucatinib, neratinib, lapatinib)',
      'PI3K inhibitor',
      'CDK4/6 inhibitor (HR+ subset)',
      'Taxane chemotherapy',
    ],
    lines_of_therapy: ['Neoadjuvant', 'Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'HR+/HER2- Breast Cancer',
    subtypes: [
      {
        name: 'Luminal A',
        prevalence_pct: 60,
        key_biomarkers: ['ESR1', 'PIK3CA', 'Ki-67', 'Oncotype DX'],
        standard_of_care: 'CDK4/6 inhibitor + aromatase inhibitor (1L mBC); endocrine monotherapy (low risk early)',
      },
      {
        name: 'Luminal B',
        prevalence_pct: 40,
        key_biomarkers: ['ESR1', 'PIK3CA', 'Ki-67', 'Oncotype DX'],
        standard_of_care: 'CDK4/6 inhibitor + endocrine (1L mBC); chemo ± endocrine (high-risk early)',
      },
    ],
    patient_segments: [
      {
        segment: 'Early stage, low genomic risk',
        description: 'Endocrine therapy alone (Oncotype DX ≤25)',
        pct_of_patients: 35,
      },
      {
        segment: 'Early stage, high genomic risk',
        description: 'Adjuvant chemo + endocrine ± abemaciclib (high risk)',
        pct_of_patients: 20,
      },
      {
        segment: '1L metastatic',
        description: 'CDK4/6 inhibitor + aromatase inhibitor or fulvestrant',
        pct_of_patients: 20,
      },
      {
        segment: '2L metastatic (ESR1-mutant)',
        description: 'Elacestrant or PI3K/AKT inhibitor + fulvestrant',
        pct_of_patients: 15,
      },
      {
        segment: '3L+ metastatic',
        description: 'Chemotherapy, T-DXd (HER2-low), sacituzumab govitecan',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'CDK4/6 inhibitor (palbociclib, ribociclib, abemaciclib)',
      'Aromatase inhibitor',
      'Selective ER degrader (fulvestrant, elacestrant)',
      'PI3Kα inhibitor (alpelisib)',
      'AKT inhibitor (capivasertib)',
      'mTOR inhibitor (everolimus)',
      'TROP2 ADC',
      'Anti-HER2 ADC (HER2-low)',
    ],
    lines_of_therapy: ['Adjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Gastric Cancer',
    subtypes: [
      {
        name: 'Intestinal type',
        prevalence_pct: 50,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'CLDN18.2', 'FGFR2'],
        standard_of_care: 'Fluoropyrimidine/platinum + nivolumab (1L); trastuzumab if HER2+',
      },
      {
        name: 'Diffuse type',
        prevalence_pct: 35,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'CLDN18.2', 'FGFR2', 'CDH1'],
        standard_of_care: 'Chemo + IO; zolbetuximab (CLDN18.2+); poor prognosis',
      },
      {
        name: 'Mixed type',
        prevalence_pct: 15,
        key_biomarkers: ['HER2', 'PD-L1', 'MSI-H', 'CLDN18.2', 'FGFR2'],
        standard_of_care: 'Fluoropyrimidine/platinum + IO',
      },
    ],
    patient_segments: [
      { segment: '1L metastatic HER2+', description: 'Trastuzumab + chemo + pembrolizumab', pct_of_patients: 15 },
      {
        segment: '1L metastatic HER2-',
        description: 'Chemo + nivolumab; zolbetuximab if CLDN18.2+',
        pct_of_patients: 45,
      },
      {
        segment: '2L+ metastatic',
        description: 'Ramucirumab + paclitaxel; T-DXd; trifluridine/tipiracil',
        pct_of_patients: 25,
      },
      { segment: 'Perioperative', description: 'FLOT + IO (emerging)', pct_of_patients: 10 },
      { segment: 'MSI-H', description: 'Pembrolizumab monotherapy', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-1/PD-L1 inhibitor',
      'Anti-HER2 mAb',
      'Anti-HER2 ADC (T-DXd)',
      'Anti-CLDN18.2 mAb (zolbetuximab)',
      'Anti-VEGFR2 mAb (ramucirumab)',
      'FGFR2 inhibitor',
      'Platinum chemotherapy',
      'Fluoropyrimidine',
    ],
    lines_of_therapy: ['Perioperative', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Basal Cell Carcinoma',
    subtypes: [
      {
        name: 'Nodular',
        prevalence_pct: 60,
        key_biomarkers: ['PTCH1', 'SMO'],
        standard_of_care: 'Surgery (Mohs or excision); topical therapy for superficial',
      },
      {
        name: 'Superficial',
        prevalence_pct: 25,
        key_biomarkers: ['PTCH1', 'SMO'],
        standard_of_care: 'Topical imiquimod or 5-FU; surgery; photodynamic therapy',
      },
      {
        name: 'Morpheaform (infiltrative)',
        prevalence_pct: 10,
        key_biomarkers: ['PTCH1', 'SMO'],
        standard_of_care: 'Mohs surgery (gold standard); radiation if inoperable',
      },
      {
        name: 'Other (pigmented, basosquamous)',
        prevalence_pct: 5,
        key_biomarkers: ['PTCH1', 'SMO'],
        standard_of_care: 'Surgery; hedgehog inhibitor if locally advanced/metastatic',
      },
    ],
    patient_segments: [
      { segment: 'Surgically resectable', description: 'Mohs or standard excision', pct_of_patients: 80 },
      {
        segment: 'Locally advanced unresectable',
        description: 'Vismodegib or sonidegib (Hedgehog inhibitor)',
        pct_of_patients: 10,
      },
      {
        segment: 'Metastatic',
        description: 'Hedgehog inhibitor; cemiplimab (PD-1); clinical trials',
        pct_of_patients: 2,
      },
      {
        segment: 'Superficial (topical-eligible)',
        description: 'Imiquimod, 5-FU, or photodynamic therapy',
        pct_of_patients: 8,
      },
    ],
    mechanisms_of_action: [
      'Hedgehog pathway inhibitor (vismodegib, sonidegib)',
      'PD-1 inhibitor (cemiplimab)',
      'Topical immune response modifier (imiquimod)',
      'Topical 5-FU',
      'Photodynamic therapy',
    ],
    lines_of_therapy: ['1L (surgery/topical)', '1L advanced (HHI)', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Cutaneous Squamous Cell Carcinoma',
    subtypes: [
      {
        name: 'Well-differentiated',
        prevalence_pct: 50,
        key_biomarkers: ['PD-L1', 'EGFR'],
        standard_of_care: 'Surgery (excision or Mohs); radiation if inoperable',
      },
      {
        name: 'Moderately differentiated',
        prevalence_pct: 35,
        key_biomarkers: ['PD-L1', 'EGFR'],
        standard_of_care: 'Surgery + possible adjuvant radiation',
      },
      {
        name: 'Poorly differentiated',
        prevalence_pct: 15,
        key_biomarkers: ['PD-L1', 'EGFR'],
        standard_of_care: 'Surgery + adjuvant radiation; cemiplimab if advanced',
      },
    ],
    patient_segments: [
      {
        segment: 'Surgically resectable',
        description: 'Excision or Mohs surgery ± adjuvant radiation',
        pct_of_patients: 75,
      },
      { segment: 'Locally advanced unresectable', description: 'Cemiplimab or pembrolizumab', pct_of_patients: 12 },
      { segment: 'Metastatic', description: 'Cemiplimab or pembrolizumab; platinum-based chemo', pct_of_patients: 5 },
      { segment: 'Immunosuppressed', description: 'Modified approach; increased recurrence risk', pct_of_patients: 8 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor (cemiplimab, pembrolizumab)',
      'EGFR inhibitor (cetuximab)',
      'Platinum chemotherapy',
      'Radiation therapy',
    ],
    lines_of_therapy: ['1L (surgery)', '1L advanced (IO)', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Testicular Cancer',
    subtypes: [
      {
        name: 'Seminoma',
        prevalence_pct: 55,
        key_biomarkers: ['AFP', 'HCG', 'LDH'],
        standard_of_care: 'Orchiectomy + surveillance or radiation/chemo (stage-dependent)',
      },
      {
        name: 'Non-seminoma',
        prevalence_pct: 45,
        key_biomarkers: ['AFP', 'HCG', 'LDH'],
        standard_of_care: 'Orchiectomy + RPLND or BEP chemo (stage-dependent)',
      },
    ],
    patient_segments: [
      { segment: 'Stage I (surveillance)', description: 'Orchiectomy + active surveillance', pct_of_patients: 50 },
      { segment: 'Good risk metastatic', description: 'BEP × 3 or EP × 4 cycles', pct_of_patients: 25 },
      {
        segment: 'Intermediate/poor risk metastatic',
        description: 'BEP × 4 cycles; high-dose chemo + autoSCT (salvage)',
        pct_of_patients: 15,
      },
      {
        segment: 'Relapsed/refractory',
        description: 'Salvage chemo (TIP); high-dose chemo + autoSCT',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Platinum chemotherapy (cisplatin)',
      'Etoposide',
      'Bleomycin',
      'Ifosfamide',
      'High-dose carboplatin + autoSCT',
      'PD-1 inhibitor (investigational for refractory)',
    ],
    lines_of_therapy: ['1L', '2L salvage', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Anal Cancer',
    subtypes: [
      {
        name: 'Squamous cell carcinoma',
        prevalence_pct: 85,
        key_biomarkers: ['HPV', 'PD-L1', 'p16'],
        standard_of_care: 'Chemoradiation (5-FU/mitomycin + RT); nivolumab (metastatic 2L+)',
      },
      {
        name: 'Adenocarcinoma',
        prevalence_pct: 10,
        key_biomarkers: ['HPV', 'PD-L1', 'p16'],
        standard_of_care: 'Treated like rectal adenocarcinoma',
      },
      {
        name: 'Other (melanoma, neuroendocrine)',
        prevalence_pct: 5,
        key_biomarkers: ['HPV', 'PD-L1', 'p16'],
        standard_of_care: 'Subtype-specific treatment',
      },
    ],
    patient_segments: [
      {
        segment: 'Localized (definitive chemoradiation)',
        description: '5-FU/mitomycin + radiation (Nigro protocol)',
        pct_of_patients: 60,
      },
      { segment: '1L metastatic', description: 'Carboplatin/paclitaxel ± nivolumab', pct_of_patients: 15 },
      { segment: '2L+ metastatic', description: 'Nivolumab or pembrolizumab; retifanlimab', pct_of_patients: 15 },
      {
        segment: 'Local recurrence post-CRT',
        description: 'APR (abdominoperineal resection) or re-irradiation',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor (nivolumab, pembrolizumab, retifanlimab)',
      'Fluoropyrimidine (5-FU, capecitabine)',
      'Mitomycin C',
      'Platinum chemotherapy',
      'Taxane',
    ],
    lines_of_therapy: ['Definitive chemoradiation', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Cutaneous T-Cell Lymphoma',
    subtypes: [
      {
        name: 'Mycosis fungoides',
        prevalence_pct: 55,
        key_biomarkers: ['CD30', 'TCR clonality'],
        standard_of_care: 'Skin-directed therapy (early); mogamulizumab, brentuximab vedotin (advanced)',
      },
      {
        name: 'Sézary syndrome',
        prevalence_pct: 10,
        key_biomarkers: ['CD30', 'TCR clonality'],
        standard_of_care: 'Mogamulizumab; extracorporeal photopheresis; HDAC inhibitors',
      },
      {
        name: 'Other (primary cutaneous ALCL, LyP, etc.)',
        prevalence_pct: 35,
        key_biomarkers: ['CD30', 'TCR clonality'],
        standard_of_care: 'Subtype-dependent; brentuximab vedotin (CD30+)',
      },
    ],
    patient_segments: [
      {
        segment: 'Early stage (IA-IIA)',
        description: 'Skin-directed therapy: topical steroids, phototherapy, nitrogen mustard',
        pct_of_patients: 45,
      },
      {
        segment: 'Advanced stage (IIB-IV)',
        description: 'Systemic: mogamulizumab, brentuximab vedotin, romidepsin, vorinostat',
        pct_of_patients: 30,
      },
      { segment: 'Sézary (erythrodermic)', description: 'Mogamulizumab, ECP, alemtuzumab', pct_of_patients: 10 },
      {
        segment: 'Refractory/transformed',
        description: 'Chemo (gemcitabine), alloSCT, clinical trials',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'Anti-CCR4 mAb (mogamulizumab)',
      'Anti-CD30 ADC (brentuximab vedotin)',
      'HDAC inhibitor (vorinostat, romidepsin)',
      'Retinoid (bexarotene)',
      'Pralatrexate',
      'Extracorporeal photopheresis',
      'Nitrogen mustard (topical)',
    ],
    lines_of_therapy: ['1L skin-directed', '1L systemic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Burkitt Lymphoma',
    subtypes: [
      {
        name: 'Endemic',
        prevalence_pct: 40,
        key_biomarkers: ['MYC', 'EBV', 'Ki-67'],
        standard_of_care: 'Intensive chemo (CODOX-M/IVAC or DA-EPOCH-R); highly curable',
      },
      {
        name: 'Sporadic',
        prevalence_pct: 40,
        key_biomarkers: ['MYC', 'EBV', 'Ki-67'],
        standard_of_care: 'Intensive chemo (R-CODOX-M/IVAC or R-HyperCVAD)',
      },
      {
        name: 'Immunodeficiency-associated',
        prevalence_pct: 20,
        key_biomarkers: ['MYC', 'EBV', 'Ki-67', 'HIV'],
        standard_of_care: 'DA-EPOCH-R + ART optimization; intensive chemo if tolerated',
      },
    ],
    patient_segments: [
      { segment: '1L adult, fit', description: 'R-CODOX-M/IVAC or DA-EPOCH-R', pct_of_patients: 50 },
      {
        segment: '1L pediatric',
        description: 'FAB/LMB-based intensive chemo; excellent cure rate',
        pct_of_patients: 25,
      },
      {
        segment: 'HIV-associated',
        description: 'DA-EPOCH-R with ART; good outcomes with treatment',
        pct_of_patients: 10,
      },
      {
        segment: 'Relapsed/refractory',
        description: 'Salvage chemo → alloSCT; CAR-T (investigational)',
        pct_of_patients: 10,
      },
      { segment: 'Elderly/unfit', description: 'Modified-intensity regimens; R-miniCHOP', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'Anti-CD20 mAb (rituximab)',
      'Intensive multi-agent chemotherapy',
      'Alkylating agent (cyclophosphamide)',
      'Anthracycline (doxorubicin)',
      'High-dose methotrexate/cytarabine',
      'Etoposide',
      'CAR-T (investigational)',
    ],
    lines_of_therapy: ['1L', '2L salvage', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Gallbladder Cancer',
    subtypes: [
      {
        name: 'Adenocarcinoma',
        prevalence_pct: 90,
        key_biomarkers: ['HER2', 'MSI-H', 'FGFR', 'IDH1'],
        standard_of_care: 'Surgery (if resectable); gemcitabine/cisplatin + durvalumab (advanced)',
      },
      {
        name: 'Squamous cell carcinoma',
        prevalence_pct: 5,
        key_biomarkers: ['HER2', 'MSI-H', 'FGFR', 'IDH1'],
        standard_of_care: 'Platinum-based chemo; limited data',
      },
      {
        name: 'Other (mucinous, neuroendocrine)',
        prevalence_pct: 5,
        key_biomarkers: ['HER2', 'MSI-H', 'FGFR', 'IDH1'],
        standard_of_care: 'Subtype-specific; gemcitabine-based for most',
      },
    ],
    patient_segments: [
      { segment: 'Resectable', description: 'Radical cholecystectomy + adjuvant capecitabine', pct_of_patients: 20 },
      { segment: '1L advanced/metastatic', description: 'Gemcitabine/cisplatin + durvalumab', pct_of_patients: 40 },
      {
        segment: '2L+ metastatic',
        description: 'FOLFOX; FGFR inhibitor (if FGFR+); IDH inhibitor (if IDH+)',
        pct_of_patients: 25,
      },
      {
        segment: 'Incidental (found at cholecystectomy)',
        description: 'Re-resection if T2+; observation if T1a',
        pct_of_patients: 10,
      },
      { segment: 'MSI-H/dMMR', description: 'Checkpoint inhibitor monotherapy', pct_of_patients: 5 },
    ],
    mechanisms_of_action: [
      'PD-L1 inhibitor',
      'Gemcitabine',
      'Platinum chemotherapy',
      'FGFR inhibitor',
      'IDH1 inhibitor',
      'HER2-targeted (emerging)',
      'Fluoropyrimidine',
    ],
    lines_of_therapy: ['Adjuvant', '1L advanced', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },
  {
    indication: 'Penile Cancer',
    subtypes: [
      {
        name: 'Squamous cell carcinoma',
        prevalence_pct: 95,
        key_biomarkers: ['HPV', 'PD-L1', 'p16'],
        standard_of_care: 'Surgery (primary); TIP chemo (advanced); pembrolizumab (2L+)',
      },
      {
        name: 'Other (melanoma, sarcoma, BCC)',
        prevalence_pct: 5,
        key_biomarkers: ['HPV', 'PD-L1', 'p16'],
        standard_of_care: 'Subtype-specific treatment',
      },
    ],
    patient_segments: [
      {
        segment: 'Localized (surgery)',
        description: 'Partial/total penectomy + inguinal lymph node dissection',
        pct_of_patients: 55,
      },
      {
        segment: '1L advanced/metastatic',
        description: 'TIP (paclitaxel/ifosfamide/cisplatin) or platinum-based chemo',
        pct_of_patients: 20,
      },
      { segment: '2L+ metastatic', description: 'Pembrolizumab; clinical trials', pct_of_patients: 15 },
      { segment: 'Neoadjuvant', description: 'Chemo before surgery for bulky nodal disease', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'PD-1 inhibitor (pembrolizumab)',
      'Platinum chemotherapy (cisplatin)',
      'Taxane (paclitaxel)',
      'Ifosfamide',
      'EGFR inhibitor (investigational)',
    ],
    lines_of_therapy: ['1L (surgery)', 'Neoadjuvant', '1L metastatic', '2L', '3L+'],
    therapeutic_area: 'oncology',
  },

  // ──────────────────────────────────────────
  // NEUROLOGY (expanded)
  // ──────────────────────────────────────────
  {
    indication: 'Progressive Supranuclear Palsy',
    subtypes: [
      {
        name: 'Richardson syndrome',
        prevalence_pct: 55,
        key_biomarkers: ['Tau PET', '4R-tau CSF', 'MRI midbrain atrophy'],
        standard_of_care: 'Supportive care; no approved disease-modifying therapy',
      },
      {
        name: 'PSP-Parkinsonism (PSP-P)',
        prevalence_pct: 30,
        key_biomarkers: ['Tau PET', 'DAT-SPECT'],
        standard_of_care: 'Levodopa trial (limited response); supportive care',
      },
      {
        name: 'Other variants (PSP-CBS, PSP-SL, PSP-F)',
        prevalence_pct: 15,
        key_biomarkers: ['Tau PET', 'FDG-PET frontal hypometabolism'],
        standard_of_care: 'Symptom management; physical therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Early motor predominant',
        description: 'Falls, gait instability, vertical gaze palsy onset',
        pct_of_patients: 40,
      },
      {
        segment: 'Cognitive/behavioral predominant',
        description: 'Frontal executive dysfunction, apathy',
        pct_of_patients: 30,
      },
      { segment: 'Advanced/dependent', description: 'Full-time care, dysphagia, aspiration risk', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Anti-tau mAb (emerging)',
      'Tau aggregation inhibitor',
      'LMTM / methylene blue derivative',
      'Gene therapy (MAPT-targeted, emerging)',
      'Neuroprotective agent',
    ],
    lines_of_therapy: ['Symptomatic (levodopa trial, OT/PT)', 'Disease-modifying (clinical trials only)'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Myasthenia Gravis',
    subtypes: [
      {
        name: 'AChR antibody-positive',
        prevalence_pct: 85,
        key_biomarkers: ['AChR antibody', 'RNS decrement', 'CT chest (thymoma)'],
        standard_of_care: 'Pyridostigmine; prednisone + steroid-sparing agent; thymectomy if thymoma',
      },
      {
        name: 'MuSK antibody-positive',
        prevalence_pct: 10,
        key_biomarkers: ['MuSK antibody'],
        standard_of_care: 'Rituximab preferred; pyridostigmine often ineffective',
      },
      {
        name: 'Seronegative',
        prevalence_pct: 5,
        key_biomarkers: ['LRP4 antibody (rare)', 'clinical/EMG diagnosis'],
        standard_of_care: 'Trial of AChR+ standard therapy; immunosuppression',
      },
    ],
    patient_segments: [
      { segment: 'Ocular MG', description: 'Ptosis and diplopia only; may generalize', pct_of_patients: 20 },
      { segment: 'Generalized mild-moderate', description: 'Stable on first-line immunotherapy', pct_of_patients: 45 },
      {
        segment: 'Refractory/severe',
        description: 'Failed >=2 immunosuppressants; complement/FcRn inhibitor eligible',
        pct_of_patients: 25,
      },
      { segment: 'Crisis-prone', description: 'History of myasthenic crisis, ICU admissions', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'AChE inhibitor (pyridostigmine)',
      'Complement C5 inhibitor (eculizumab, ravulizumab, zilucoplan)',
      'FcRn inhibitor (efgartigimod, rozanolixizumab)',
      'Anti-CD20 (rituximab)',
      'Conventional immunosuppressant (azathioprine, mycophenolate)',
      'Corticosteroid',
      'BAFF inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L pyridostigmine + prednisone',
      '2L steroid-sparing immunosuppressant',
      '3L complement or FcRn inhibitor',
      'Rescue: IVIg/PLEX',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Neuromyelitis Optica Spectrum Disorder',
    subtypes: [
      {
        name: 'AQP4-IgG seropositive',
        prevalence_pct: 75,
        key_biomarkers: ['AQP4-IgG', 'MRI longitudinally extensive transverse myelitis'],
        standard_of_care: 'Eculizumab, inebilizumab, or satralizumab (approved)',
      },
      {
        name: 'MOG-IgG positive',
        prevalence_pct: 15,
        key_biomarkers: ['MOG-IgG'],
        standard_of_care: 'Immunosuppression (rituximab, azathioprine); satralizumab (emerging)',
      },
      {
        name: 'Seronegative NMOSD',
        prevalence_pct: 10,
        key_biomarkers: ['Clinical/radiologic criteria only'],
        standard_of_care: 'Empiric immunosuppression; treat as AQP4+ if high clinical suspicion',
      },
    ],
    patient_segments: [
      { segment: 'Relapse prevention', description: 'On maintenance therapy to prevent attacks', pct_of_patients: 60 },
      { segment: 'Acute relapse', description: 'High-dose IV steroids, PLEX', pct_of_patients: 20 },
      { segment: 'Treatment-naive', description: 'Newly diagnosed, initiating long-term therapy', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Complement C5 inhibitor (eculizumab)',
      'Anti-CD19 (inebilizumab)',
      'Anti-IL-6R (satralizumab, tocilizumab)',
      'Anti-CD20 (rituximab)',
      'Azathioprine',
      'Mycophenolate mofetil',
    ],
    lines_of_therapy: [
      '1L complement/anti-CD19/anti-IL-6R',
      '2L rituximab or conventional IS',
      'Acute relapse: steroids + PLEX',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Chronic Inflammatory Demyelinating Polyneuropathy',
    subtypes: [
      {
        name: 'Typical CIDP',
        prevalence_pct: 60,
        key_biomarkers: ['NCV demyelinating pattern', 'CSF elevated protein', 'Anti-NF155/CNTN1 (subset)'],
        standard_of_care: 'IVIg or SCIg; corticosteroids; plasma exchange',
      },
      {
        name: 'Atypical CIDP (DADS, MADSAM, focal, pure motor/sensory)',
        prevalence_pct: 40,
        key_biomarkers: ['NCV demyelinating pattern', 'Anti-MAG (DADS variant)'],
        standard_of_care: 'IVIg first line; rituximab for anti-MAG; corticosteroids',
      },
    ],
    patient_segments: [
      {
        segment: 'IVIg-dependent',
        description: 'Requires chronic IVIg infusions every 3-4 weeks',
        pct_of_patients: 50,
      },
      { segment: 'Corticosteroid-responsive', description: 'Maintained on low-dose prednisone', pct_of_patients: 25 },
      {
        segment: 'Refractory',
        description: 'Failed IVIg and steroids; rituximab, cyclophosphamide',
        pct_of_patients: 15,
      },
      {
        segment: 'Treatment withdrawal candidates',
        description: 'May achieve remission off therapy',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'IVIg / SCIg',
      'Corticosteroid',
      'Plasma exchange',
      'FcRn inhibitor (efgartigimod, emerging)',
      'Anti-CD20 (rituximab)',
      'Complement inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L IVIg or corticosteroids',
      '2L plasma exchange or switch 1L',
      '3L rituximab or immunosuppressant',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Transthyretin Amyloid Cardiomyopathy',
    subtypes: [
      {
        name: 'Wild-type (ATTRwt)',
        prevalence_pct: 75,
        key_biomarkers: ['Tc-99m PYP scan grade 2/3', 'NT-proBNP', 'Troponin'],
        standard_of_care: 'Tafamidis (TTR stabilizer); diuretics; pacemaker if needed',
      },
      {
        name: 'Hereditary (ATTRv)',
        prevalence_pct: 25,
        key_biomarkers: ['TTR gene mutation (V30M, V122I)', 'Tc-99m PYP scan', 'Genetic testing'],
        standard_of_care: 'Tafamidis; patisiran/vutrisiran (TTR silencer); liver transplant (select)',
      },
    ],
    patient_segments: [
      {
        segment: 'NYHA Class I-II',
        description: 'Early disease, ambulatory, initiating tafamidis',
        pct_of_patients: 40,
      },
      { segment: 'NYHA Class III', description: 'Symptomatic HF, combination therapy', pct_of_patients: 40 },
      { segment: 'NYHA Class IV / advanced', description: 'Refractory HF, transplant evaluation', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'TTR stabilizer (tafamidis, acoramidis)',
      'TTR silencer RNAi (patisiran, vutrisiran)',
      'TTR silencer ASO (inotersen, eplontersen)',
      'TTR gene editing (NTLA-2001, CRISPR, emerging)',
      'Anti-amyloid fibril antibody (emerging)',
    ],
    lines_of_therapy: [
      '1L TTR stabilizer',
      '2L TTR silencer (if hereditary or progressing)',
      'Advanced: transplant or combination',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Essential Tremor',
    subtypes: [
      {
        name: 'Mild',
        prevalence_pct: 40,
        key_biomarkers: ['Fahn-Tolosa-Marin tremor rating scale'],
        standard_of_care: 'Observation; propranolol or primidone if functional impairment',
      },
      {
        name: 'Moderate',
        prevalence_pct: 40,
        key_biomarkers: ['Tremor rating scale', 'Accelerometry'],
        standard_of_care: 'Propranolol or primidone; topiramate; combination therapy',
      },
      {
        name: 'Severe/medication-refractory',
        prevalence_pct: 20,
        key_biomarkers: ['Tremor rating scale', 'MRI (DBS planning)'],
        standard_of_care: 'DBS or focused ultrasound thalamotomy',
      },
    ],
    patient_segments: [
      {
        segment: 'Medication-responsive',
        description: 'Controlled with beta-blocker or primidone',
        pct_of_patients: 50,
      },
      {
        segment: 'Medication-refractory',
        description: 'Inadequate response to >=2 pharmacotherapies',
        pct_of_patients: 30,
      },
      { segment: 'Surgical candidates', description: 'DBS or focused ultrasound eligible', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Beta-blocker (propranolol)',
      'Anticonvulsant (primidone, topiramate)',
      'GABA modulator (emerging)',
      'T-type calcium channel blocker (CX-8998, emerging)',
      'Deep brain stimulation',
      'MR-guided focused ultrasound',
    ],
    lines_of_therapy: ['1L propranolol or primidone', '2L topiramate or combination', '3L DBS or focused ultrasound'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Narcolepsy',
    subtypes: [
      {
        name: 'Type 1 (with cataplexy)',
        prevalence_pct: 55,
        key_biomarkers: [
          'CSF hypocretin-1 <=110 pg/mL',
          'HLA-DQB1*06:02',
          'MSLT mean sleep latency <=8 min with >=2 SOREMPs',
        ],
        standard_of_care: 'Sodium oxybate (Xyrem/Xywav); solriamfetol or modafinil for EDS; pitolisant',
      },
      {
        name: 'Type 2 (without cataplexy)',
        prevalence_pct: 45,
        key_biomarkers: ['MSLT <=8 min with >=2 SOREMPs', 'Normal CSF hypocretin'],
        standard_of_care: 'Modafinil or solriamfetol for EDS; sodium oxybate for disrupted nocturnal sleep',
      },
    ],
    patient_segments: [
      {
        segment: 'EDS-predominant',
        description: 'Excessive daytime sleepiness as primary complaint',
        pct_of_patients: 45,
      },
      {
        segment: 'Cataplexy-predominant',
        description: 'Frequent cataplexy episodes impairing function',
        pct_of_patients: 30,
      },
      {
        segment: 'Pediatric/adolescent onset',
        description: 'Early diagnosis, school/social impact',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'Sodium oxybate (GHB receptor agonist)',
      'Dopamine/norepinephrine reuptake inhibitor (solriamfetol)',
      'Wakefulness-promoting agent (modafinil, armodafinil)',
      'Histamine H3 inverse agonist (pitolisant)',
      'Orexin receptor 2 agonist (TAK-994 class, emerging)',
      'Immunotherapy for acute-onset (emerging)',
    ],
    lines_of_therapy: [
      '1L modafinil/solriamfetol (EDS) + sodium oxybate (cataplexy)',
      '2L pitolisant or combination',
      '3L stimulant (methylphenidate, amphetamine)',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Rett Syndrome',
    subtypes: [
      {
        name: 'Classic Rett syndrome',
        prevalence_pct: 75,
        key_biomarkers: ['MECP2 mutation'],
        standard_of_care: 'Trofinetide (approved); supportive care (PT/OT/speech, seizure management)',
      },
      {
        name: 'Atypical Rett syndrome',
        prevalence_pct: 25,
        key_biomarkers: ['MECP2 mutation (or CDKL5, FOXG1 in variants)'],
        standard_of_care: 'Symptom management; trofinetide (if MECP2+); seizure management',
      },
    ],
    patient_segments: [
      {
        segment: 'Early regression phase',
        description: 'Loss of hand skills and language, 1-4 years',
        pct_of_patients: 20,
      },
      {
        segment: 'Plateau phase',
        description: 'Stable but significant disability, seizures common',
        pct_of_patients: 50,
      },
      {
        segment: 'Late motor deterioration',
        description: 'Scoliosis, rigidity, reduced mobility',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'IGF-1 analog (trofinetide)',
      'MECP2 gene therapy (emerging)',
      'MECP2 reactivation (X-chromosome, emerging)',
      'GABA modulator',
      'Antiepileptic drugs',
      'Glutamate modulator (emerging)',
    ],
    lines_of_therapy: [
      '1L trofinetide + supportive therapies',
      '2L gene therapy (clinical trials)',
      'Seizure management: ASMs',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Angelman Syndrome',
    subtypes: [
      {
        name: 'Deletion (15q11-q13)',
        prevalence_pct: 70,
        key_biomarkers: ['UBE3A deletion on chromosome 15', 'Methylation analysis'],
        standard_of_care: 'Supportive care; seizure management; emerging ASO/gene therapy',
      },
      {
        name: 'UBE3A point mutation',
        prevalence_pct: 10,
        key_biomarkers: ['UBE3A sequencing'],
        standard_of_care: 'Supportive care; seizure management',
      },
      {
        name: 'Imprinting defect',
        prevalence_pct: 5,
        key_biomarkers: ['Abnormal methylation, intact UBE3A'],
        standard_of_care: 'Supportive care; milder phenotype possible',
      },
      {
        name: 'Uniparental disomy (UPD)',
        prevalence_pct: 5,
        key_biomarkers: ['Paternal UPD chromosome 15'],
        standard_of_care: 'Supportive care; generally milder phenotype',
      },
      {
        name: 'Unknown mechanism',
        prevalence_pct: 10,
        key_biomarkers: ['Clinical diagnosis, no molecular confirmation'],
        standard_of_care: 'Supportive care',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric with severe seizures',
        description: 'Refractory epilepsy requiring polytherapy',
        pct_of_patients: 40,
      },
      { segment: 'Pediatric mild-moderate', description: 'Developmental delay, limited seizures', pct_of_patients: 35 },
      { segment: 'Adult', description: 'Chronic management, behavioral challenges', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'UBE3A-activating ASO (GTX-102 class, emerging)',
      'UBE3A gene therapy (emerging)',
      'Antiepileptic drugs (valproate, clobazam, levetiracetam)',
      'OV101 / gaboxadol (GABA-A agonist, emerging)',
      'Dietary management (ketogenic diet for seizures)',
    ],
    lines_of_therapy: [
      '1L supportive + seizure management',
      '2L UBE3A-restoring therapy (clinical trials)',
      'Seizure rescue: benzodiazepines',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Dravet Syndrome',
    subtypes: [
      {
        name: 'SCN1A mutation-positive',
        prevalence_pct: 80,
        key_biomarkers: ['SCN1A pathogenic variant'],
        standard_of_care: 'Stiripentol + clobazam + valproate; cannabidiol (Epidiolex); fenfluramine',
      },
      {
        name: 'SCN1A-negative',
        prevalence_pct: 20,
        key_biomarkers: ['Epilepsy gene panel (PCDH19, SCN2A, others)', 'Clinical criteria'],
        standard_of_care: 'Same as SCN1A+ approach; consider alternative genetic etiologies',
      },
    ],
    patient_segments: [
      {
        segment: 'Infantile onset (<1 year)',
        description: 'Febrile seizure onset evolving to refractory epilepsy',
        pct_of_patients: 50,
      },
      {
        segment: 'Childhood (stabilization)',
        description: 'Seizure frequency variable, cognitive decline',
        pct_of_patients: 30,
      },
      { segment: 'Adolescent/adult', description: 'Chronic management, SUDEP risk monitoring', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Cannabidiol (Epidiolex)',
      'Fenfluramine (serotonin-releasing agent)',
      'Stiripentol (GABA-A modulator)',
      'SCN1A gene therapy (emerging)',
      'ASO targeting SCN1A (STK-001 class, emerging)',
      'Precision medicine (NaV1.1 activator)',
    ],
    lines_of_therapy: [
      '1L valproate + clobazam',
      '2L add stiripentol or cannabidiol or fenfluramine',
      '3L combination or investigational',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Tardive Dyskinesia',
    subtypes: [
      {
        name: 'Orofacial',
        prevalence_pct: 60,
        key_biomarkers: ['AIMS score', 'Dopamine receptor occupancy (research)'],
        standard_of_care: 'Valbenazine or deutetrabenazine (VMAT2 inhibitors)',
      },
      {
        name: 'Limb-trunk',
        prevalence_pct: 25,
        key_biomarkers: ['AIMS score'],
        standard_of_care: 'Valbenazine or deutetrabenazine',
      },
      {
        name: 'Mixed (orofacial + limb)',
        prevalence_pct: 15,
        key_biomarkers: ['AIMS score'],
        standard_of_care: 'Valbenazine or deutetrabenazine; dose optimization of causative agent',
      },
    ],
    patient_segments: [
      {
        segment: 'On antipsychotic (cannot discontinue)',
        description: 'Schizophrenia/bipolar requiring continued DRA',
        pct_of_patients: 60,
      },
      {
        segment: 'GI/antiemetic-induced',
        description: 'Metoclopramide or prochlorperazine exposure',
        pct_of_patients: 20,
      },
      { segment: 'Mild/monitoring', description: 'Low AIMS score, watchful waiting', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'VMAT2 inhibitor (valbenazine, deutetrabenazine)',
      'Dopamine modulator (emerging)',
      'Muscarinic M4 agonist (emerging)',
      'Phosphodiesterase 10A inhibitor (emerging)',
    ],
    lines_of_therapy: [
      '1L VMAT2 inhibitor',
      '2L switch or combine VMAT2 inhibitor',
      'Adjunct: reduce/switch causative DRA if possible',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Lennox-Gastaut Syndrome',
    subtypes: [
      {
        name: 'Structural etiology',
        prevalence_pct: 40,
        key_biomarkers: ['MRI structural lesion', 'EEG slow spike-wave <2.5 Hz'],
        standard_of_care: 'Valproate + clobazam; cannabidiol; rufinamide; surgery if resectable',
      },
      {
        name: 'Genetic etiology',
        prevalence_pct: 30,
        key_biomarkers: ['Epilepsy gene panel', 'EEG slow spike-wave'],
        standard_of_care: 'Valproate + clobazam; cannabidiol; precision therapy if gene identified',
      },
      {
        name: 'Unknown etiology',
        prevalence_pct: 30,
        key_biomarkers: ['EEG slow spike-wave', 'Multiple seizure types'],
        standard_of_care: 'Valproate + clobazam; cannabidiol; broad-spectrum ASMs',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (<18 years)',
        description: 'Active treatment optimization, schooling support',
        pct_of_patients: 55,
      },
      { segment: 'Adult transition', description: 'Transitioning pediatric to adult care', pct_of_patients: 25 },
      {
        segment: 'Surgery candidates',
        description: 'Corpus callosotomy, VNS, or resective surgery',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Cannabidiol (Epidiolex)',
      'Rufinamide',
      'Clobazam',
      'Valproate',
      'Felbamate',
      'Vagus nerve stimulation',
      'mTOR inhibitor (if TSC-related)',
      'Fenfluramine (emerging in LGS)',
    ],
    lines_of_therapy: ['1L valproate + clobazam', '2L add cannabidiol or rufinamide', '3L felbamate or VNS/surgery'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Duchenne Muscular Dystrophy - CNS Manifestations',
    subtypes: [
      {
        name: 'Cognitive impairment predominant',
        prevalence_pct: 30,
        key_biomarkers: ['Dp140 isoform status', 'Neuropsychological testing', 'DMD mutation location'],
        standard_of_care: 'Educational support; no approved CNS-specific therapy',
      },
      {
        name: 'Behavioral predominant (ASD/ADHD features)',
        prevalence_pct: 40,
        key_biomarkers: ['Behavioral rating scales', 'DMD mutation downstream of exon 45'],
        standard_of_care: 'Behavioral therapy; ADHD medications (stimulants/non-stimulants); SSRI',
      },
      {
        name: 'Both cognitive and behavioral',
        prevalence_pct: 30,
        key_biomarkers: ['Dp140 and Dp71 isoform status'],
        standard_of_care: 'Comprehensive neuropsychological support; pharmacotherapy as needed',
      },
    ],
    patient_segments: [
      {
        segment: 'Early school-age',
        description: 'Cognitive screening, educational IEP development',
        pct_of_patients: 35,
      },
      { segment: 'Adolescent', description: 'Behavioral challenges, social isolation', pct_of_patients: 35 },
      { segment: 'Young adult', description: 'Transition planning, mental health support', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Dystrophin-restoring gene therapy (brain penetrant, emerging)',
      'Utrophin modulator (CNS-active, emerging)',
      'Stimulant (methylphenidate for ADHD)',
      'SSRI (for anxiety/OCD features)',
      'Cognitive rehabilitation',
    ],
    lines_of_therapy: [
      '1L behavioral/educational intervention',
      '2L pharmacotherapy (ADHD/anxiety)',
      '3L CNS gene therapy (clinical trials)',
    ],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Trigeminal Neuralgia',
    subtypes: [
      {
        name: 'Classical (neurovascular compression)',
        prevalence_pct: 70,
        key_biomarkers: ['MRI neurovascular contact', 'Trigeminal reflex testing'],
        standard_of_care: 'Carbamazepine or oxcarbazepine; microvascular decompression if refractory',
      },
      {
        name: 'Secondary (MS, tumor)',
        prevalence_pct: 20,
        key_biomarkers: ['MRI structural lesion/MS plaque', 'MS diagnosis'],
        standard_of_care: 'Carbamazepine; treat underlying cause; ablative procedures',
      },
      {
        name: 'Idiopathic',
        prevalence_pct: 10,
        key_biomarkers: ['Normal MRI', 'Clinical diagnosis'],
        standard_of_care: 'Carbamazepine or oxcarbazepine; consider Gamma Knife if refractory',
      },
    ],
    patient_segments: [
      {
        segment: 'Medication-responsive',
        description: 'Controlled on carbamazepine/oxcarbazepine',
        pct_of_patients: 50,
      },
      {
        segment: 'Medication-refractory',
        description: 'Failed pharmacotherapy, surgical candidate',
        pct_of_patients: 30,
      },
      {
        segment: 'Elderly/comorbid',
        description: 'Limited surgical options, Gamma Knife preferred',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Sodium channel blocker (carbamazepine, oxcarbazepine)',
      'NaV1.7 selective inhibitor (emerging)',
      'Microvascular decompression (surgery)',
      'Gamma Knife radiosurgery',
      'Percutaneous rhizotomy',
      'Botulinum toxin (emerging)',
    ],
    lines_of_therapy: ['1L carbamazepine or oxcarbazepine', '2L add baclofen or lamotrigine', '3L MVD or Gamma Knife'],
    therapeutic_area: 'neurology',
  },
  {
    indication: 'Charcot-Marie-Tooth Disease',
    subtypes: [
      {
        name: 'CMT1A (PMP22 duplication)',
        prevalence_pct: 50,
        key_biomarkers: ['PMP22 duplication', 'NCV slowed (<38 m/s)'],
        standard_of_care: 'Supportive care (orthotics, PT); no approved disease-modifying therapy',
      },
      {
        name: 'CMT1B (MPZ mutation)',
        prevalence_pct: 10,
        key_biomarkers: ['MPZ gene mutation', 'NCV demyelinating'],
        standard_of_care: 'Supportive care',
      },
      {
        name: 'CMT2A (MFN2 mutation)',
        prevalence_pct: 10,
        key_biomarkers: ['MFN2 gene mutation', 'Axonal pattern on EMG/NCV'],
        standard_of_care: 'Supportive care; pain management',
      },
      {
        name: 'CMTX1 (GJB1/Connexin 32)',
        prevalence_pct: 15,
        key_biomarkers: ['GJB1 mutation', 'X-linked inheritance'],
        standard_of_care: 'Supportive care; genetic counseling',
      },
      {
        name: 'Other CMT subtypes',
        prevalence_pct: 15,
        key_biomarkers: ['CMT gene panel', 'WES/WGS'],
        standard_of_care: 'Supportive care; clinical trial enrollment',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild (ambulatory, independent)',
        description: 'Foot drop, mild weakness, orthotics',
        pct_of_patients: 45,
      },
      {
        segment: 'Moderate (assistive devices)',
        description: 'AFOs, hand splints, adapted equipment',
        pct_of_patients: 35,
      },
      {
        segment: 'Severe (wheelchair-dependent)',
        description: 'Progressive weakness, respiratory monitoring',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'PMP22-lowering ASO (emerging)',
      'PMP22-lowering gene therapy (emerging)',
      'Neurotrophin (NT-3, emerging)',
      'Progesterone antagonist (emerging)',
      'Physical therapy and orthotics',
      'Surgical correction (tendon transfers)',
    ],
    lines_of_therapy: [
      '1L supportive care (orthotics, PT, OT)',
      '2L disease-modifying therapy (clinical trials)',
      'Surgical: tendon transfers for foot deformity',
    ],
    therapeutic_area: 'neurology',
  },

  // ──────────────────────────────────────────
  // RARE DISEASE (expanded)
  // ──────────────────────────────────────────
  {
    indication: 'Pompe Disease',
    subtypes: [
      {
        name: 'Infantile-onset (IOPD)',
        prevalence_pct: 15,
        key_biomarkers: ['GAA enzyme activity', 'GAA gene mutation', 'CK', 'CRIM status'],
        standard_of_care:
          'Enzyme replacement therapy (alglucosidase alfa, avalglucosidase alfa); CRIM-negative: immunomodulation',
      },
      {
        name: 'Late-onset (LOPD)',
        prevalence_pct: 85,
        key_biomarkers: ['GAA enzyme activity', 'GAA gene mutation', 'Urine Hex4'],
        standard_of_care: 'Avalglucosidase alfa (preferred) or alglucosidase alfa ERT; respiratory support',
      },
    ],
    patient_segments: [
      { segment: 'Infantile (CRIM+)', description: 'ERT initiated early, best outcomes', pct_of_patients: 10 },
      {
        segment: 'Infantile (CRIM-)',
        description: 'Requires immune tolerance induction before ERT',
        pct_of_patients: 5,
      },
      { segment: 'Late-onset ambulatory', description: 'Limb-girdle weakness, stable on ERT', pct_of_patients: 55 },
      {
        segment: 'Late-onset ventilator-dependent',
        description: 'Respiratory decline, chronic ventilation',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy (ERT)',
      'Next-gen ERT with enhanced uptake (avalglucosidase alfa)',
      'Gene therapy (AAV-mediated, emerging)',
      'Substrate reduction therapy (emerging)',
      'Chaperone therapy (emerging)',
    ],
    lines_of_therapy: [
      '1L ERT (avalglucosidase alfa)',
      '2L gene therapy (clinical trials)',
      'Supportive: respiratory + physical therapy',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hereditary Angioedema',
    subtypes: [
      {
        name: 'Type I (low C1-INH level)',
        prevalence_pct: 85,
        key_biomarkers: ['C1-INH level (low)', 'C1-INH function (low)', 'C4 (low)'],
        standard_of_care:
          'Prophylaxis: lanadelumab, berotralstat, or SC C1-INH; Acute: icatibant or C1-INH concentrate',
      },
      {
        name: 'Type II (dysfunctional C1-INH)',
        prevalence_pct: 15,
        key_biomarkers: ['C1-INH level (normal/high)', 'C1-INH function (low)', 'C4 (low)'],
        standard_of_care: 'Same as Type I',
      },
    ],
    patient_segments: [
      { segment: 'Frequent attackers (>=1/month)', description: 'Long-term prophylaxis required', pct_of_patients: 40 },
      {
        segment: 'Infrequent attackers',
        description: 'On-demand treatment, consider prophylaxis',
        pct_of_patients: 40,
      },
      { segment: 'Pediatric', description: 'Limited approved options, growing evidence base', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Anti-kallikrein mAb (lanadelumab)',
      'Plasma kallikrein inhibitor (berotralstat, oral)',
      'C1-INH replacement (IV or SC)',
      'Bradykinin B2 receptor antagonist (icatibant)',
      'Factor XIIa inhibitor (garadacimab, emerging)',
      'Prekallikrein ASO (donidalorsen, emerging)',
      'CRISPR gene editing (NTLA-2002, emerging)',
    ],
    lines_of_therapy: [
      '1L prophylaxis (lanadelumab or berotralstat)',
      '2L SC C1-INH prophylaxis',
      'Acute: icatibant or IV C1-INH',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Wilson Disease',
    subtypes: [
      {
        name: 'Hepatic presentation',
        prevalence_pct: 40,
        key_biomarkers: ['Ceruloplasmin (low)', 'ATP7B mutation', '24h urine copper', 'Liver copper on biopsy'],
        standard_of_care: 'Chelation (D-penicillamine or trientine); zinc maintenance; liver transplant if fulminant',
      },
      {
        name: 'Neurologic presentation',
        prevalence_pct: 40,
        key_biomarkers: ['Ceruloplasmin (low)', 'ATP7B mutation', 'MRI basal ganglia changes', 'KF rings'],
        standard_of_care:
          'Trientine or zinc (avoid D-penicillamine neurologic worsening); tetrathiomolybdate (emerging)',
      },
      {
        name: 'Mixed hepatic-neurologic',
        prevalence_pct: 20,
        key_biomarkers: ['Ceruloplasmin (low)', 'ATP7B mutation', 'KF rings', 'Liver function tests'],
        standard_of_care: 'Chelation + zinc; careful monitoring for neurologic worsening',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed (de-coppering phase)',
        description: 'Intensive chelation, close monitoring',
        pct_of_patients: 20,
      },
      { segment: 'Maintenance phase', description: 'Zinc or low-dose chelator, stable', pct_of_patients: 55 },
      { segment: 'Fulminant / decompensated', description: 'Urgent liver transplant evaluation', pct_of_patients: 10 },
      { segment: 'Pre-symptomatic siblings', description: 'Screening, early zinc prophylaxis', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Copper chelator (D-penicillamine, trientine)',
      'Zinc (blocks intestinal copper absorption)',
      'Bis-choline tetrathiomolybdate (emerging)',
      'Gene therapy (AAV-ATP7B, emerging)',
      'Methanobactin (emerging)',
    ],
    lines_of_therapy: [
      '1L chelation (trientine preferred if neurologic)',
      '2L zinc maintenance',
      '3L liver transplant (fulminant)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Lysosomal Acid Lipase Deficiency',
    subtypes: [
      {
        name: 'Wolman disease (infantile)',
        prevalence_pct: 5,
        key_biomarkers: ['LAL enzyme activity (absent)', 'LIPA gene mutation', 'Adrenal calcifications'],
        standard_of_care: 'Sebelipase alfa (ERT); HSCT in select cases',
      },
      {
        name: 'Cholesteryl ester storage disease (CESD)',
        prevalence_pct: 95,
        key_biomarkers: ['LAL enzyme activity (reduced)', 'LIPA gene mutation', 'LDL-C elevated', 'Hepatomegaly'],
        standard_of_care: 'Sebelipase alfa (ERT); statins; liver monitoring',
      },
    ],
    patient_segments: [
      {
        segment: 'Infantile (Wolman)',
        description: 'Failure to thrive, hepatosplenomegaly, fatal without treatment',
        pct_of_patients: 5,
      },
      { segment: 'Pediatric CESD', description: 'Hepatomegaly, elevated transaminases', pct_of_patients: 30 },
      {
        segment: 'Adult CESD',
        description: 'Dyslipidemia, hepatic fibrosis, often misdiagnosed as NAFLD',
        pct_of_patients: 65,
      },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy (sebelipase alfa)',
      'Statin therapy (adjunct)',
      'Gene therapy (emerging)',
      'Substrate reduction (emerging)',
    ],
    lines_of_therapy: ['1L sebelipase alfa ERT', '2L statins + hepatic monitoring', 'Wolman: ERT +/- HSCT'],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Acute Hepatic Porphyria',
    subtypes: [
      {
        name: 'Acute intermittent porphyria (AIP)',
        prevalence_pct: 80,
        key_biomarkers: ['Urine PBG (elevated)', 'Urine ALA (elevated)', 'HMBS gene mutation'],
        standard_of_care: 'Givosiran (RNAi prophylaxis); hemin for acute attacks; glucose loading',
      },
      {
        name: 'Variegate porphyria (VP)',
        prevalence_pct: 10,
        key_biomarkers: ['Plasma fluorescence scan', 'PPOX gene mutation', 'PBG elevated during attack'],
        standard_of_care: 'Givosiran; hemin for attacks; sun avoidance',
      },
      {
        name: 'Hereditary coproporphyria (HCP)',
        prevalence_pct: 10,
        key_biomarkers: ['Urine coproporphyrin III', 'CPOX gene mutation', 'PBG elevated during attack'],
        standard_of_care: 'Givosiran; hemin for attacks',
      },
    ],
    patient_segments: [
      {
        segment: 'Recurrent attackers (>=4/year)',
        description: 'Givosiran prophylaxis indicated',
        pct_of_patients: 30,
      },
      { segment: 'Sporadic attackers', description: 'On-demand hemin; trigger avoidance', pct_of_patients: 40 },
      { segment: 'Asymptomatic carriers', description: 'Genetic counseling, trigger education', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'ALAS1 RNAi (givosiran)',
      'Hemin replacement',
      'Glucose infusion (mild attacks)',
      'Gene therapy (emerging)',
      'mRNA therapy (emerging)',
    ],
    lines_of_therapy: [
      '1L givosiran prophylaxis (if recurrent)',
      'Acute: IV hemin',
      'Supportive: pain management, trigger avoidance',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hemophilia B',
    subtypes: [
      {
        name: 'Severe (FIX <1%)',
        prevalence_pct: 40,
        key_biomarkers: ['Factor IX activity level', 'F9 gene mutation'],
        standard_of_care:
          'Factor IX prophylaxis (extended half-life preferred); fitusiran; gene therapy (etranacogene dezaparvovec)',
      },
      {
        name: 'Moderate (FIX 1-5%)',
        prevalence_pct: 30,
        key_biomarkers: ['Factor IX activity level', 'F9 gene mutation'],
        standard_of_care: 'Factor IX prophylaxis or on-demand; fitusiran (emerging)',
      },
      {
        name: 'Mild (FIX 5-40%)',
        prevalence_pct: 30,
        key_biomarkers: ['Factor IX activity level'],
        standard_of_care: 'On-demand factor IX; desmopressin (limited efficacy in Hem B)',
      },
    ],
    patient_segments: [
      {
        segment: 'Prophylaxis (no inhibitors)',
        description: 'Regular FIX replacement, low bleed rate',
        pct_of_patients: 55,
      },
      { segment: 'Inhibitor patients', description: 'Factor bypassing agents, immune tolerance', pct_of_patients: 5 },
      {
        segment: 'Gene therapy candidates',
        description: 'Eligible for one-time AAV gene therapy',
        pct_of_patients: 20,
      },
      { segment: 'On-demand only', description: 'Mild disease, episodic treatment', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Factor IX replacement (recombinant, extended half-life)',
      'Gene therapy (etranacogene dezaparvovec, AAV5-FIX)',
      'Anti-TFPI (fitusiran)',
      'Antithrombin silencing (emerging)',
      'Factor IX Fc fusion (eftrenonacog alfa)',
    ],
    lines_of_therapy: [
      '1L FIX prophylaxis (extended half-life)',
      '2L gene therapy',
      '3L non-factor therapy (fitusiran)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hunter Syndrome (MPS II)',
    subtypes: [
      {
        name: 'Severe / neuronopathic',
        prevalence_pct: 60,
        key_biomarkers: ['Iduronate-2-sulfatase activity', 'IDS gene mutation', 'Urine GAGs', 'Brain MRI'],
        standard_of_care: 'Idursulfase ERT; HSCT (limited CNS benefit); intrathecal ERT (emerging)',
      },
      {
        name: 'Attenuated (non-neuronopathic)',
        prevalence_pct: 40,
        key_biomarkers: ['Iduronate-2-sulfatase activity', 'IDS gene mutation', 'Urine GAGs'],
        standard_of_care: 'Idursulfase ERT; multidisciplinary management',
      },
    ],
    patient_segments: [
      {
        segment: 'Early diagnosis (<3 years)',
        description: 'ERT initiation, developmental monitoring',
        pct_of_patients: 30,
      },
      {
        segment: 'School-age (somatic focus)',
        description: 'ERT maintenance, orthopedic/cardiac management',
        pct_of_patients: 40,
      },
      {
        segment: 'Adolescent/adult (attenuated)',
        description: 'Long-term ERT, joint/cardiac monitoring',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy (idursulfase)',
      'Intrathecal ERT (idursulfase-IT, emerging)',
      'Gene therapy (emerging)',
      'Substrate reduction therapy (emerging)',
      'HSCT (select neuronopathic cases)',
    ],
    lines_of_therapy: [
      '1L idursulfase ERT',
      '2L intrathecal ERT or gene therapy (clinical trials)',
      'Supportive: multidisciplinary',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hurler Syndrome (MPS I)',
    subtypes: [
      {
        name: 'Hurler (severe)',
        prevalence_pct: 60,
        key_biomarkers: ['Alpha-L-iduronidase activity', 'IDUA gene mutation', 'Urine GAGs'],
        standard_of_care: 'HSCT (standard of care if <2.5 years); laronidase ERT (bridge to transplant)',
      },
      {
        name: 'Hurler-Scheie (intermediate)',
        prevalence_pct: 25,
        key_biomarkers: ['Alpha-L-iduronidase activity', 'IDUA gene mutation'],
        standard_of_care: 'Laronidase ERT; consider HSCT in select cases',
      },
      {
        name: 'Scheie (attenuated)',
        prevalence_pct: 15,
        key_biomarkers: ['Alpha-L-iduronidase activity (residual)', 'IDUA gene mutation'],
        standard_of_care: 'Laronidase ERT; joint/cardiac management',
      },
    ],
    patient_segments: [
      { segment: 'Pre-HSCT (Hurler)', description: 'ERT bridging, transplant preparation', pct_of_patients: 30 },
      { segment: 'Post-HSCT', description: 'Engraftment monitoring, residual disease management', pct_of_patients: 25 },
      {
        segment: 'ERT-maintained (attenuated)',
        description: 'Chronic ERT, multidisciplinary care',
        pct_of_patients: 45,
      },
    ],
    mechanisms_of_action: [
      'Enzyme replacement therapy (laronidase)',
      'Hematopoietic stem cell transplant',
      'Gene therapy (emerging)',
      'Intrathecal ERT (emerging)',
      'Substrate reduction (emerging)',
    ],
    lines_of_therapy: [
      '1L HSCT (Hurler <2.5 years)',
      '1L laronidase ERT (attenuated)',
      '2L gene therapy (clinical trials)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Niemann-Pick Disease Type C',
    subtypes: [
      {
        name: 'Infantile onset',
        prevalence_pct: 10,
        key_biomarkers: ['NPC1/NPC2 gene mutation', 'Filipin staining', 'Oxysterols (plasma)'],
        standard_of_care: 'Miglustat (substrate reduction); supportive care',
      },
      {
        name: 'Juvenile onset',
        prevalence_pct: 45,
        key_biomarkers: ['NPC1/NPC2 gene mutation', 'Oxysterols', 'Vertical supranuclear gaze palsy'],
        standard_of_care: 'Miglustat; arimoclomol (emerging); supportive care',
      },
      {
        name: 'Adult onset',
        prevalence_pct: 45,
        key_biomarkers: ['NPC1/NPC2 gene mutation', 'Oxysterols', 'Psychiatric/cognitive symptoms'],
        standard_of_care: 'Miglustat; psychiatric management; supportive care',
      },
    ],
    patient_segments: [
      { segment: 'Progressive neurologic', description: 'Ataxia, dysarthria, cognitive decline', pct_of_patients: 50 },
      {
        segment: 'Visceral predominant',
        description: 'Hepatosplenomegaly, less neurologic involvement',
        pct_of_patients: 20,
      },
      {
        segment: 'Psychiatric presentation',
        description: 'Psychosis or cognitive symptoms preceding motor',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'Substrate reduction therapy (miglustat)',
      'HSP70 co-inducer (arimoclomol, emerging)',
      'Cyclodextrin (intrathecal, emerging)',
      'Gene therapy (emerging)',
      'Acetyl-L-carnitine (adjunct)',
    ],
    lines_of_therapy: [
      '1L miglustat',
      '2L arimoclomol or cyclodextrin (clinical trials)',
      'Supportive: PT/OT, seizure management',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Batten Disease (CLN)',
    subtypes: [
      {
        name: 'CLN2 (late infantile)',
        prevalence_pct: 25,
        key_biomarkers: ['TPP1 enzyme activity', 'CLN2/TPP1 gene mutation'],
        standard_of_care: 'Cerliponase alfa (intracerebroventricular ERT)',
      },
      {
        name: 'CLN3 (juvenile)',
        prevalence_pct: 40,
        key_biomarkers: ['CLN3 gene mutation (1 kb deletion common)', 'Vacuolated lymphocytes'],
        standard_of_care: 'Supportive care; gene therapy (emerging)',
      },
      {
        name: 'Other CLN types (CLN1, CLN5, CLN6, CLN7, CLN8)',
        prevalence_pct: 35,
        key_biomarkers: ['Gene panel', 'Enzyme assays (PPT1 for CLN1)'],
        standard_of_care: 'Supportive care; gene therapy (emerging for CLN1, CLN5, CLN6)',
      },
    ],
    patient_segments: [
      {
        segment: 'Pre-symptomatic (newborn screen)',
        description: 'Earliest intervention for best outcomes',
        pct_of_patients: 10,
      },
      {
        segment: 'Symptomatic pediatric',
        description: 'Progressive vision loss, seizures, cognitive decline',
        pct_of_patients: 60,
      },
      { segment: 'Advanced / palliative', description: 'Severe disability, comfort-focused care', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Intracerebroventricular ERT (cerliponase alfa for CLN2)',
      'Gene therapy (AAV-mediated, multiple CLN types emerging)',
      'Small molecule chaperone (emerging)',
      'Antisense oligonucleotide (emerging)',
      'Stem cell therapy (emerging)',
    ],
    lines_of_therapy: [
      '1L cerliponase alfa ICV ERT (CLN2)',
      '1L gene therapy (CLN3/others, clinical trials)',
      'Supportive: seizure management, palliative care',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Epidermolysis Bullosa',
    subtypes: [
      {
        name: 'EB simplex',
        prevalence_pct: 70,
        key_biomarkers: ['KRT5/KRT14 mutation', 'Skin biopsy with IF mapping'],
        standard_of_care: 'Wound care; beremagene geperpavec (gene therapy, dystrophic only); pain management',
      },
      {
        name: 'Junctional EB',
        prevalence_pct: 5,
        key_biomarkers: ['LAMB3, LAMA3, COL17A1 mutation', 'IF mapping (laminin-332)'],
        standard_of_care: 'Intensive wound care; nutritional support; infection prevention',
      },
      {
        name: 'Dystrophic EB',
        prevalence_pct: 25,
        key_biomarkers: ['COL7A1 mutation', 'IF mapping (collagen VII)', 'Anchoring fibril absence'],
        standard_of_care: 'Beremagene geperpavec (topical gene therapy); wound care; esophageal dilation',
      },
    ],
    patient_segments: [
      { segment: 'Mild localized', description: 'Limited blistering, minimal systemic impact', pct_of_patients: 40 },
      { segment: 'Generalized moderate', description: 'Widespread wounds, nutrition challenges', pct_of_patients: 35 },
      {
        segment: 'Severe generalized',
        description: 'Life-threatening complications, SCC risk, chronic pain',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'Topical gene therapy (beremagene geperpavec)',
      'Systemic gene therapy (emerging)',
      'Cell-based therapy (fibroblast, MSC, emerging)',
      'Protein replacement (collagen VII, emerging)',
      'Anti-fibrotic agent (losartan, emerging)',
      'Wound care and pain management',
    ],
    lines_of_therapy: [
      '1L wound care + gene therapy (if dystrophic)',
      '2L systemic gene/cell therapy (clinical trials)',
      'Supportive: nutrition, pain, infection prevention',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Achondroplasia',
    subtypes: [
      {
        name: 'Homozygous (lethal)',
        prevalence_pct: 1,
        key_biomarkers: ['FGFR3 homozygous G380R', 'Prenatal imaging'],
        standard_of_care: 'Lethal in utero or neonatal period; palliative care',
      },
      {
        name: 'Heterozygous',
        prevalence_pct: 99,
        key_biomarkers: ['FGFR3 G380R heterozygous mutation', 'Skeletal survey'],
        standard_of_care:
          'Vosoritide (C-type natriuretic peptide analog); growth monitoring; surgical intervention for complications',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (growing)',
        description: 'Vosoritide treatment to promote linear growth',
        pct_of_patients: 40,
      },
      {
        segment: 'Adolescent (near skeletal maturity)',
        description: 'Surgical planning, spinal stenosis monitoring',
        pct_of_patients: 20,
      },
      { segment: 'Adult', description: 'Spinal stenosis, joint complications, pain management', pct_of_patients: 40 },
    ],
    mechanisms_of_action: [
      'CNP analog (vosoritide)',
      'FGFR3 inhibitor (infigratinib, emerging)',
      'Anti-FGFR3 antibody (emerging)',
      'Gene therapy (emerging)',
      'Limb lengthening surgery',
    ],
    lines_of_therapy: [
      '1L vosoritide (pediatric)',
      '2L FGFR3-targeted therapy (clinical trials)',
      'Surgical: limb lengthening, spinal decompression',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Hypophosphatasia',
    subtypes: [
      {
        name: 'Perinatal (lethal/severe)',
        prevalence_pct: 5,
        key_biomarkers: ['ALPL gene mutation', 'ALP severely low', 'PLP elevated'],
        standard_of_care: 'Asfotase alfa (ERT); respiratory support',
      },
      {
        name: 'Infantile',
        prevalence_pct: 15,
        key_biomarkers: ['ALPL gene mutation', 'ALP low', 'Rachitic changes on X-ray'],
        standard_of_care: 'Asfotase alfa; calcium/vitamin D management',
      },
      {
        name: 'Childhood',
        prevalence_pct: 30,
        key_biomarkers: ['ALPL gene mutation', 'ALP low', 'Premature tooth loss', 'PLP elevated'],
        standard_of_care: 'Asfotase alfa; dental management; orthopedic care',
      },
      {
        name: 'Adult',
        prevalence_pct: 50,
        key_biomarkers: ['ALP low-normal', 'PLP elevated', 'Stress fractures', 'ALPL gene mutation'],
        standard_of_care: 'Asfotase alfa (severe); supportive care; avoid bisphosphonates',
      },
    ],
    patient_segments: [
      {
        segment: 'Severe pediatric (ERT-dependent)',
        description: 'Life-threatening disease, continuous ERT',
        pct_of_patients: 20,
      },
      {
        segment: 'Moderate pediatric',
        description: 'Skeletal disease, dental issues, ERT beneficial',
        pct_of_patients: 30,
      },
      {
        segment: 'Adult with fractures',
        description: 'Recurrent metatarsal fractures, muscle weakness',
        pct_of_patients: 35,
      },
      { segment: 'Mild/odontohypophosphatasia', description: 'Dental-only manifestation', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'Bone-targeted ERT (asfotase alfa)',
      'Gene therapy (emerging)',
      'Small molecule ALP activator (emerging)',
      'Substrate reduction (emerging)',
    ],
    lines_of_therapy: [
      '1L asfotase alfa ERT (severe/moderate)',
      'Supportive: orthopedic, dental, pain management',
      'Avoid: bisphosphonates (contraindicated)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Alpha-1 Antitrypsin Deficiency',
    subtypes: [
      {
        name: 'PiZZ (severe)',
        prevalence_pct: 70,
        key_biomarkers: ['AAT level <11 uM', 'Pi typing (ZZ)', 'SERPINA1 gene'],
        standard_of_care: 'IV augmentation therapy (weekly infusion); smoking cessation; lung transplant (advanced)',
      },
      {
        name: 'PiSZ (moderate)',
        prevalence_pct: 25,
        key_biomarkers: ['AAT level 11-15 uM', 'Pi typing (SZ)'],
        standard_of_care: 'Augmentation therapy if symptomatic with low AAT; standard COPD management',
      },
      {
        name: 'Other rare alleles (null, Mmalton)',
        prevalence_pct: 5,
        key_biomarkers: ['AAT level variable', 'SERPINA1 sequencing'],
        standard_of_care: 'Augmentation therapy; genotype-guided management',
      },
    ],
    patient_segments: [
      {
        segment: 'Lung-predominant (emphysema)',
        description: 'Progressive COPD, augmentation therapy',
        pct_of_patients: 60,
      },
      {
        segment: 'Liver-predominant',
        description: 'Hepatic fibrosis/cirrhosis from polymerized AAT',
        pct_of_patients: 20,
      },
      {
        segment: 'Undiagnosed/newly diagnosed',
        description: 'Often diagnosed after years of COPD treatment',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'IV augmentation therapy (human AAT protein)',
      'Gene therapy (AAV-mediated, emerging)',
      'RNAi/ASO for liver disease (fazirsiran, emerging)',
      'Small molecule corrector (emerging)',
      'Lung transplant (advanced)',
    ],
    lines_of_therapy: [
      '1L IV augmentation therapy',
      '2L gene therapy or RNAi (clinical trials)',
      'End-stage: lung or liver transplant',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Prader-Willi Syndrome',
    subtypes: [
      {
        name: 'Deletion (15q11-q13)',
        prevalence_pct: 70,
        key_biomarkers: ['Chromosome 15 deletion (FISH/CMA)', 'Methylation analysis'],
        standard_of_care: 'Growth hormone therapy; dietary management; behavioral support',
      },
      {
        name: 'Uniparental disomy (maternal UPD)',
        prevalence_pct: 25,
        key_biomarkers: ['Maternal UPD chromosome 15', 'Methylation analysis'],
        standard_of_care: 'Same as deletion; generally milder phenotype',
      },
      {
        name: 'Imprinting defect',
        prevalence_pct: 5,
        key_biomarkers: ['Abnormal methylation, intact 15q', 'Imprinting center mutation'],
        standard_of_care: 'Same as deletion; genetic counseling for recurrence risk',
      },
    ],
    patient_segments: [
      {
        segment: 'Infant (hypotonia phase)',
        description: 'Feeding difficulties, growth hormone initiation',
        pct_of_patients: 15,
      },
      {
        segment: 'Child (hyperphagia onset)',
        description: 'Food security measures, behavioral management',
        pct_of_patients: 35,
      },
      {
        segment: 'Adolescent/adult',
        description: 'Obesity management, psychiatric comorbidities, supervised living',
        pct_of_patients: 50,
      },
    ],
    mechanisms_of_action: [
      'Growth hormone (somatropin)',
      'Melanocortin-4 receptor agonist (setmelanotide class, emerging)',
      'Oxytocin (intranasal, emerging)',
      'Unacylated ghrelin analog (emerging)',
      'SNORD116-restoring therapy (emerging)',
      'Behavioral/dietary intervention',
    ],
    lines_of_therapy: [
      '1L growth hormone + dietary management',
      '2L MC4R agonist or oxytocin (clinical trials)',
      'Supportive: behavioral, psychiatric, educational',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Tuberous Sclerosis Complex',
    subtypes: [
      {
        name: 'TSC1 (hamartin)',
        prevalence_pct: 30,
        key_biomarkers: ['TSC1 gene mutation', 'MRI cortical tubers', 'Renal AMLs'],
        standard_of_care: 'Everolimus (mTOR inhibitor) for SEGA and AMLs; vigabatrin for infantile spasms',
      },
      {
        name: 'TSC2 (tuberin)',
        prevalence_pct: 70,
        key_biomarkers: ['TSC2 gene mutation', 'MRI cortical tubers', 'Cardiac rhabdomyomas'],
        standard_of_care: 'Everolimus; vigabatrin; generally more severe phenotype than TSC1',
      },
    ],
    patient_segments: [
      {
        segment: 'Epilepsy-predominant',
        description: 'Refractory seizures, infantile spasms, epilepsy surgery candidates',
        pct_of_patients: 40,
      },
      { segment: 'Renal-predominant', description: 'AML management, everolimus or embolization', pct_of_patients: 25 },
      {
        segment: 'CNS-predominant (SEGA)',
        description: 'Subependymal giant cell astrocytoma, everolimus or surgery',
        pct_of_patients: 15,
      },
      {
        segment: 'LAM (lymphangioleiomyomatosis)',
        description: 'Pulmonary LAM in adult females, sirolimus',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'mTOR inhibitor (everolimus, sirolimus)',
      'Vigabatrin (GABA transaminase inhibitor, for seizures)',
      'Cannabidiol (adjunct for seizures)',
      'Gene therapy (emerging)',
      'Epilepsy surgery',
    ],
    lines_of_therapy: [
      '1L everolimus (SEGA, AML) + vigabatrin (seizures)',
      '2L epilepsy surgery or cannabidiol adjunct',
      '3L gene therapy (clinical trials)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Spinal and Bulbar Muscular Atrophy',
    subtypes: [
      {
        name: 'By CAG repeat length (36-55+ repeats)',
        prevalence_pct: 100,
        key_biomarkers: [
          'AR gene CAG repeat expansion (>=38)',
          'Elevated CK',
          'Sensory nerve action potentials reduced',
        ],
        standard_of_care:
          'No approved disease-modifying therapy; supportive care; androgen reduction (leuprorelin, Japan only)',
      },
    ],
    patient_segments: [
      { segment: 'Early symptomatic', description: 'Muscle cramps, tremor, mild weakness', pct_of_patients: 30 },
      { segment: 'Progressive weakness', description: 'Proximal limb and bulbar weakness, falls', pct_of_patients: 45 },
      {
        segment: 'Advanced (bulbar predominant)',
        description: 'Dysphagia, dysarthria, aspiration risk',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'Androgen receptor degrader (emerging)',
      'ASO targeting AR (emerging)',
      'Gene therapy (emerging)',
      'GnRH agonist (leuprorelin, Japan)',
      'Muscle-directed therapy (emerging)',
      'Supportive care (PT/OT, speech therapy)',
    ],
    lines_of_therapy: [
      '1L supportive care + physical therapy',
      '2L androgen reduction (investigational outside Japan)',
      '3L gene/ASO therapy (clinical trials)',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Homozygous Familial Hypercholesterolemia',
    subtypes: [
      {
        name: 'Null/null (receptor-negative)',
        prevalence_pct: 30,
        key_biomarkers: ['LDLR null mutations (both alleles)', 'LDL-C >500 mg/dL untreated'],
        standard_of_care: 'Lomitapide; evinacumab; lipoprotein apheresis; liver transplant (select)',
      },
      {
        name: 'Defective/null (partial receptor activity)',
        prevalence_pct: 70,
        key_biomarkers: ['LDLR defective + null mutation', 'LDL-C 300-500 mg/dL untreated'],
        standard_of_care: 'Max-dose statin + ezetimibe; PCSK9 inhibitor; evinacumab; lomitapide; apheresis',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (diagnosis <10 years)',
        description: 'Early aggressive LDL lowering to prevent CVD',
        pct_of_patients: 30,
      },
      { segment: 'Adult with established CVD', description: 'Maximum LDL reduction, apheresis', pct_of_patients: 50 },
      { segment: 'Apheresis-dependent', description: 'Biweekly lipoprotein apheresis', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Anti-ANGPTL3 mAb (evinacumab)',
      'MTP inhibitor (lomitapide)',
      'PCSK9 inhibitor (evolocumab, alirocumab)',
      'Statin + ezetimibe',
      'Lipoprotein apheresis',
      'ANGPTL3 siRNA (emerging)',
      'Gene editing (emerging)',
    ],
    lines_of_therapy: [
      '1L max statin + ezetimibe + PCSK9i',
      '2L evinacumab or lomitapide',
      '3L lipoprotein apheresis or liver transplant',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Congenital Adrenal Hyperplasia',
    subtypes: [
      {
        name: 'Classic salt-wasting',
        prevalence_pct: 75,
        key_biomarkers: [
          '17-OHP (markedly elevated)',
          '21-hydroxylase (CYP21A2) mutation',
          'Renin elevated',
          'Electrolytes (hyponatremia, hyperkalemia)',
        ],
        standard_of_care: 'Hydrocortisone + fludrocortisone; stress dosing; newborn screening',
      },
      {
        name: 'Classic simple virilizing',
        prevalence_pct: 25,
        key_biomarkers: ['17-OHP (elevated)', 'CYP21A2 mutation', 'Normal electrolytes'],
        standard_of_care: 'Hydrocortisone; monitoring for growth and pubertal development',
      },
    ],
    patient_segments: [
      {
        segment: 'Neonatal/infant',
        description: 'Salt-wasting crisis prevention, steroid initiation',
        pct_of_patients: 15,
      },
      {
        segment: 'Pediatric (growth phase)',
        description: 'Growth optimization, avoid glucocorticoid excess',
        pct_of_patients: 35,
      },
      {
        segment: 'Adolescent/adult',
        description: 'Fertility management, bone health, cardiovascular risk',
        pct_of_patients: 50,
      },
    ],
    mechanisms_of_action: [
      'Glucocorticoid replacement (hydrocortisone)',
      'Mineralocorticoid replacement (fludrocortisone)',
      'CRF1 antagonist (crinecerfont, emerging)',
      'Modified-release hydrocortisone (Alkindi, Chronocort)',
      'Gene therapy (emerging)',
      'Adrenal steroidogenesis inhibitor (abiraterone, investigational use)',
    ],
    lines_of_therapy: [
      '1L hydrocortisone + fludrocortisone',
      '2L CRF1 antagonist adjunct (emerging)',
      'Stress dosing protocol for illness/surgery',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'AADC Deficiency',
    subtypes: [
      {
        name: 'Severe',
        prevalence_pct: 70,
        key_biomarkers: [
          'DDC gene mutation',
          '3-OMD (elevated in plasma/CSF)',
          'AADC enzyme activity (low)',
          'CSF neurotransmitters (HVA/5-HIAA low)',
        ],
        standard_of_care: 'Eladocagene exuparvovec (gene therapy, approved); dopamine agonists; MAO inhibitors',
      },
      {
        name: 'Moderate',
        prevalence_pct: 30,
        key_biomarkers: ['DDC gene mutation', '3-OMD (elevated)', 'Residual AADC activity'],
        standard_of_care: 'Gene therapy; dopamine agonists; pyridoxine (B6); MAO inhibitors',
      },
    ],
    patient_segments: [
      { segment: 'Pre-gene therapy', description: 'Supportive management, oculogyric crises', pct_of_patients: 30 },
      {
        segment: 'Post-gene therapy',
        description: 'Motor milestone acquisition, dose reduction of medications',
        pct_of_patients: 40,
      },
      { segment: 'Gene therapy ineligible', description: 'Symptomatic management only', pct_of_patients: 30 },
    ],
    mechanisms_of_action: [
      'Gene therapy (eladocagene exuparvovec, AAV2-DDC)',
      'Dopamine agonist (pramipexole, ropinirole)',
      'MAO inhibitor (selegiline, tranylcypromine)',
      'Pyridoxine (vitamin B6, cofactor)',
      'Anticholinergic (for dystonia)',
    ],
    lines_of_therapy: [
      '1L gene therapy (eladocagene exuparvovec)',
      '2L dopamine agonist + MAO inhibitor + pyridoxine',
      'Supportive: PT/OT, feeding support',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Acromegaly',
    subtypes: [
      {
        name: 'Macroadenoma (>=10 mm)',
        prevalence_pct: 75,
        key_biomarkers: ['IGF-1 (elevated)', 'GH (non-suppressible on OGTT)', 'MRI pituitary macroadenoma'],
        standard_of_care: 'Transsphenoidal surgery; somatostatin analog (octreotide LAR, lanreotide); pegvisomant',
      },
      {
        name: 'Microadenoma (<10 mm)',
        prevalence_pct: 25,
        key_biomarkers: ['IGF-1 (elevated)', 'GH (elevated)', 'MRI pituitary microadenoma'],
        standard_of_care: 'Transsphenoidal surgery (often curative); somatostatin analog if not cured',
      },
    ],
    patient_segments: [
      { segment: 'Surgical candidates', description: 'Transphenoidal surgery as first-line', pct_of_patients: 50 },
      {
        segment: 'Post-surgical residual',
        description: 'Incomplete resection, medical therapy needed',
        pct_of_patients: 30,
      },
      { segment: 'Medical therapy primary', description: 'Inoperable or patient preference', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Somatostatin receptor ligand (octreotide, lanreotide, pasireotide)',
      'GH receptor antagonist (pegvisomant)',
      'Dopamine agonist (cabergoline, adjunct)',
      'Transsphenoidal surgery',
      'Stereotactic radiosurgery',
      'Oral somatostatin analog (paltusotine, emerging)',
    ],
    lines_of_therapy: [
      '1L transsphenoidal surgery',
      '2L somatostatin analog (SSA)',
      '3L pegvisomant or combination SSA + pegvisomant',
    ],
    therapeutic_area: 'rare_disease',
  },
  {
    indication: 'Cushing Syndrome',
    subtypes: [
      {
        name: 'Pituitary (Cushing disease)',
        prevalence_pct: 70,
        key_biomarkers: [
          '24h urine free cortisol',
          'Late-night salivary cortisol',
          'ACTH (elevated)',
          'MRI pituitary adenoma',
          'IPSS',
        ],
        standard_of_care: 'Transsphenoidal surgery; osilodrostat or ketoconazole if not cured; pasireotide',
      },
      {
        name: 'Adrenal (adenoma/carcinoma)',
        prevalence_pct: 15,
        key_biomarkers: ['ACTH (suppressed)', 'CT adrenal mass', '24h urine free cortisol'],
        standard_of_care: 'Adrenalectomy; medical therapy (metyrapone, osilodrostat) if inoperable',
      },
      {
        name: 'Ectopic ACTH',
        prevalence_pct: 15,
        key_biomarkers: ['ACTH (markedly elevated)', 'BIPSS no gradient', 'CT chest/abdomen for source'],
        standard_of_care:
          'Treat primary tumor; medical cortisol-lowering therapy; bilateral adrenalectomy if refractory',
      },
    ],
    patient_segments: [
      {
        segment: 'Surgical candidates',
        description: 'Identifiable tumor, primary surgical approach',
        pct_of_patients: 55,
      },
      {
        segment: 'Post-surgical recurrence',
        description: 'Medical therapy, repeat surgery, or radiation',
        pct_of_patients: 25,
      },
      { segment: 'Medical therapy primary', description: 'Inoperable or occult source', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'Steroidogenesis inhibitor (osilodrostat, ketoconazole, metyrapone)',
      'Somatostatin analog (pasireotide)',
      'Glucocorticoid receptor antagonist (mifepristone)',
      'Dopamine agonist (cabergoline, adjunct)',
      'Transsphenoidal surgery',
      'Bilateral adrenalectomy',
      'Relacorilant (selective GR modulator, emerging)',
    ],
    lines_of_therapy: [
      '1L transsphenoidal surgery (pituitary)',
      '2L steroidogenesis inhibitor',
      '3L GR antagonist or bilateral adrenalectomy',
    ],
    therapeutic_area: 'rare_disease',
  },

  // ──────────────────────────────────────────
  // CARDIOVASCULAR (expanded)
  // ──────────────────────────────────────────
  {
    indication: 'Heart Failure with Reduced Ejection Fraction',
    subtypes: [
      {
        name: 'Ischemic cardiomyopathy',
        prevalence_pct: 55,
        key_biomarkers: ['LVEF <=40%', 'NT-proBNP', 'Troponin', 'Coronary angiography'],
        standard_of_care: 'GDMT: ARNI + beta-blocker + MRA + SGLT2i; revascularization if indicated',
      },
      {
        name: 'Non-ischemic cardiomyopathy',
        prevalence_pct: 45,
        key_biomarkers: ['LVEF <=40%', 'NT-proBNP', 'CMR (LGE pattern)'],
        standard_of_care: 'GDMT: ARNI + beta-blocker + MRA + SGLT2i; ICD if LVEF <=35%',
      },
    ],
    patient_segments: [
      { segment: 'NYHA Class I', description: 'Asymptomatic, GDMT initiation', pct_of_patients: 15 },
      { segment: 'NYHA Class II', description: 'Mild symptoms, GDMT optimization', pct_of_patients: 35 },
      {
        segment: 'NYHA Class III',
        description: 'Moderate symptoms, device therapy consideration',
        pct_of_patients: 35,
      },
      { segment: 'NYHA Class IV', description: 'Advanced HF, LVAD/transplant evaluation', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'ARNI (sacubitril/valsartan)',
      'SGLT2 inhibitor (dapagliflozin, empagliflozin)',
      'Beta-blocker (carvedilol, bisoprolol, metoprolol succinate)',
      'MRA (spironolactone, eplerenone)',
      'Cardiac myosin activator (omecamtiv mecarbil)',
      'sGC stimulator (vericiguat)',
      'IV iron (ferric carboxymaltose)',
      'LVAD (mechanical circulatory support)',
    ],
    lines_of_therapy: ['1L GDMT 4-pillar initiation', '2L add omecamtiv or vericiguat', '3L LVAD or transplant'],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Heart Failure with Preserved Ejection Fraction',
    subtypes: [
      {
        name: 'Obesity phenotype',
        prevalence_pct: 40,
        key_biomarkers: ['LVEF >=50%', 'NT-proBNP (may be low-normal)', 'BMI >=30', 'H2FPEF score'],
        standard_of_care: 'SGLT2 inhibitor; diuretics; weight management (GLP-1 RA emerging)',
      },
      {
        name: 'Aging/fibrotic phenotype',
        prevalence_pct: 35,
        key_biomarkers: ['LVEF >=50%', 'NT-proBNP elevated', 'LV hypertrophy', "E/e' elevated"],
        standard_of_care: 'SGLT2 inhibitor; diuretics; blood pressure optimization',
      },
      {
        name: 'Hypertensive phenotype',
        prevalence_pct: 25,
        key_biomarkers: ['LVEF >=50%', 'LV hypertrophy', 'Hypertension history'],
        standard_of_care: 'SGLT2 inhibitor; aggressive BP control; MRA; diuretics',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'SGLT2i initiation, comorbidity assessment', pct_of_patients: 25 },
      { segment: 'Volume overloaded', description: 'Diuretic optimization, sodium restriction', pct_of_patients: 35 },
      {
        segment: 'Comorbidity-driven',
        description: 'AF, CKD, obesity, diabetes driving symptoms',
        pct_of_patients: 30,
      },
      { segment: 'Advanced/refractory', description: 'Persistent symptoms despite optimization', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'SGLT2 inhibitor (empagliflozin, dapagliflozin)',
      'GLP-1 receptor agonist (semaglutide, for obesity phenotype)',
      'MRA (spironolactone)',
      'ARB or ARNI',
      'Diuretic (loop, thiazide)',
      'Tirzepatide (GIP/GLP-1, emerging for obesity-HFpEF)',
    ],
    lines_of_therapy: [
      '1L SGLT2 inhibitor + diuretics',
      '2L MRA + comorbidity management',
      '3L GLP-1 RA (obesity phenotype) or clinical trial',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'MASH/NASH',
    subtypes: [
      {
        name: 'F0-F1 (no/mild fibrosis)',
        prevalence_pct: 35,
        key_biomarkers: ['NAS score', 'FIB-4 <1.30', 'Liver biopsy', 'MRI-PDFF'],
        standard_of_care: 'Lifestyle intervention (weight loss, diet, exercise); no approved pharmacotherapy yet',
      },
      {
        name: 'F2 (moderate fibrosis)',
        prevalence_pct: 25,
        key_biomarkers: ['NAS score >=4', 'FIB-4 1.30-2.67', 'FibroScan', 'ELF test'],
        standard_of_care: 'Resmetirom (if MASH with F2-F3); lifestyle intervention; clinical trials',
      },
      {
        name: 'F3 (advanced fibrosis)',
        prevalence_pct: 25,
        key_biomarkers: ['NAS score >=4', 'FIB-4 >2.67', 'FibroScan >=9.6 kPa', 'ELF >=9.8'],
        standard_of_care: 'Resmetirom; GLP-1 RA (emerging); clinical trials',
      },
      {
        name: 'F4 (cirrhotic MASH)',
        prevalence_pct: 15,
        key_biomarkers: ['Liver biopsy (cirrhosis)', 'FibroScan >=14 kPa', 'Platelet count low', 'MELD score'],
        standard_of_care: 'Manage cirrhosis complications; liver transplant evaluation; resmetirom (non-decompensated)',
      },
    ],
    patient_segments: [
      {
        segment: 'Early MASH (metabolic syndrome)',
        description: 'Weight loss, metabolic optimization',
        pct_of_patients: 35,
      },
      {
        segment: 'At-risk MASH (F2-F3)',
        description: 'Pharmacotherapy candidates, fibrosis regression goal',
        pct_of_patients: 40,
      },
      {
        segment: 'Cirrhotic MASH',
        description: 'Varices screening, HCC surveillance, transplant',
        pct_of_patients: 15,
      },
      {
        segment: 'Post-transplant recurrence',
        description: 'MASH recurrence in graft, metabolic management',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'THR-beta agonist (resmetirom)',
      'GLP-1 receptor agonist (semaglutide)',
      'FGF21 analog (pegozafermin, emerging)',
      'PPAR agonist (lanifibranor, emerging)',
      'FXR agonist (obeticholic acid)',
      'ACC inhibitor (emerging)',
      'GLP-1/GIP/glucagon triple agonist (emerging)',
    ],
    lines_of_therapy: [
      '1L lifestyle + resmetirom (F2-F3)',
      '2L GLP-1 RA or combination therapy',
      '3L liver transplant (decompensated cirrhosis)',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Heterozygous Familial Hypercholesterolemia',
    subtypes: [
      {
        name: 'LDLR mutation',
        prevalence_pct: 85,
        key_biomarkers: ['LDL-C >190 mg/dL (untreated)', 'LDLR pathogenic variant', 'Family history CVD'],
        standard_of_care: 'High-intensity statin + ezetimibe; PCSK9 inhibitor; bempedoic acid; inclisiran',
      },
      {
        name: 'APOB mutation',
        prevalence_pct: 10,
        key_biomarkers: ['LDL-C elevated', 'APOB mutation', 'Normal LDLR'],
        standard_of_care: 'High-intensity statin + ezetimibe; PCSK9 inhibitor',
      },
      {
        name: 'PCSK9 gain-of-function',
        prevalence_pct: 5,
        key_biomarkers: ['LDL-C elevated', 'PCSK9 gain-of-function mutation'],
        standard_of_care: 'High-intensity statin + ezetimibe; PCSK9 inhibitor (may need higher doses)',
      },
    ],
    patient_segments: [
      { segment: 'Statin-controlled', description: 'At LDL-C goal on statin +/- ezetimibe', pct_of_patients: 30 },
      { segment: 'Requiring PCSK9i', description: 'Not at goal on max oral therapy', pct_of_patients: 35 },
      {
        segment: 'Statin-intolerant',
        description: 'Myopathy/elevated CK, alternative agents needed',
        pct_of_patients: 15,
      },
      { segment: 'Pediatric', description: 'Early statin initiation, LDL-C burden reduction', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'PCSK9 mAb (evolocumab, alirocumab)',
      'PCSK9 siRNA (inclisiran)',
      'HMG-CoA reductase inhibitor (statin)',
      'NPC1L1 inhibitor (ezetimibe)',
      'ACL inhibitor (bempedoic acid)',
      'ANGPTL3 inhibitor (emerging for severe cases)',
    ],
    lines_of_therapy: [
      '1L high-intensity statin + ezetimibe',
      '2L add PCSK9 inhibitor or inclisiran',
      '3L bempedoic acid or combination',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Chronic Thromboembolic Pulmonary Hypertension',
    subtypes: [
      {
        name: 'Operable (accessible thrombi)',
        prevalence_pct: 60,
        key_biomarkers: [
          'V/Q scan mismatch',
          'CT pulmonary angiography',
          'Right heart catheterization (mPAP >=25)',
          'PVR elevated',
        ],
        standard_of_care: 'Pulmonary endarterectomy (PEA) - curative surgery; bridge with riociguat',
      },
      {
        name: 'Inoperable (distal disease)',
        prevalence_pct: 40,
        key_biomarkers: ['V/Q scan mismatch', 'CTPA distal disease', 'RHC (mPAP >=25)', 'PVR elevated'],
        standard_of_care: 'Riociguat; balloon pulmonary angioplasty (BPA); consider PAH-targeted therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Surgical (PEA) candidates',
        description: 'Proximal thrombi, curative surgery available',
        pct_of_patients: 50,
      },
      { segment: 'BPA candidates', description: 'Distal disease amenable to balloon angioplasty', pct_of_patients: 25 },
      {
        segment: 'Medical therapy only',
        description: 'Inoperable, not BPA candidate, riociguat + PAH drugs',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'Pulmonary endarterectomy (surgery)',
      'sGC stimulator (riociguat)',
      'Balloon pulmonary angioplasty',
      'Endothelin receptor antagonist (bosentan, macitentan, off-label)',
      'PDE-5 inhibitor (sildenafil, off-label)',
      'Prostacyclin analog (off-label for residual PH)',
    ],
    lines_of_therapy: ['1L PEA surgery (if operable)', '2L riociguat + BPA', '3L PAH-targeted combination therapy'],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Peripheral Artery Disease',
    subtypes: [
      {
        name: 'Intermittent claudication',
        prevalence_pct: 70,
        key_biomarkers: ['ABI <0.90', 'Duplex ultrasound', 'CTA/MRA'],
        standard_of_care: 'Supervised exercise; cilostazol; antiplatelet therapy; statin; risk factor modification',
      },
      {
        name: 'Chronic limb-threatening ischemia (CLI)',
        prevalence_pct: 30,
        key_biomarkers: ['ABI <0.40', 'Toe pressure <30 mmHg', 'TcPO2 <30 mmHg', 'Angiography'],
        standard_of_care:
          'Revascularization (endovascular or surgical bypass); wound care; amputation if non-salvageable',
      },
    ],
    patient_segments: [
      {
        segment: 'Fontaine I (asymptomatic)',
        description: 'Incidental finding, risk factor management',
        pct_of_patients: 20,
      },
      {
        segment: 'Fontaine II (claudication)',
        description: 'Exercise, cilostazol, consider revascularization',
        pct_of_patients: 45,
      },
      { segment: 'Fontaine III (rest pain)', description: 'Urgent revascularization evaluation', pct_of_patients: 15 },
      {
        segment: 'Fontaine IV (tissue loss)',
        description: 'Revascularization + wound care, limb salvage',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'Antiplatelet (aspirin, clopidogrel, rivaroxaban low-dose)',
      'PDE-3 inhibitor (cilostazol)',
      'Statin (pleiotropic vascular effects)',
      'Endovascular revascularization',
      'Surgical bypass',
      'Gene therapy (VEGF, HGF, emerging)',
      'Cell therapy (emerging)',
    ],
    lines_of_therapy: [
      '1L risk factor modification + antiplatelet + statin',
      '2L cilostazol + supervised exercise',
      '3L revascularization (endovascular or surgical)',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Hypertrophic Cardiomyopathy',
    subtypes: [
      {
        name: 'Obstructive (HOCM)',
        prevalence_pct: 70,
        key_biomarkers: ['LVOT gradient >=30 mmHg', 'MYH7 or MYBPC3 mutation', 'Echo: septal hypertrophy', 'CMR (LGE)'],
        standard_of_care:
          'Mavacamten (cardiac myosin inhibitor); beta-blocker; disopyramide; septal reduction if refractory',
      },
      {
        name: 'Non-obstructive',
        prevalence_pct: 30,
        key_biomarkers: ['LVOT gradient <30 mmHg', 'LV wall thickness >=15 mm', 'Genetic testing'],
        standard_of_care: 'Beta-blocker or CCB; ICD if high SCD risk; diuretics if congested',
      },
    ],
    patient_segments: [
      { segment: 'Symptomatic obstructive', description: 'Dyspnea/angina with LVOT obstruction', pct_of_patients: 40 },
      {
        segment: 'Asymptomatic/mildly symptomatic',
        description: 'Monitoring, activity guidance, SCD risk assessment',
        pct_of_patients: 35,
      },
      { segment: 'High SCD risk', description: 'ICD placement, family screening', pct_of_patients: 15 },
      {
        segment: 'End-stage (burned out)',
        description: 'Reduced EF, HF management, transplant evaluation',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Cardiac myosin inhibitor (mavacamten, aficamten)',
      'Beta-blocker (metoprolol, propranolol)',
      'Calcium channel blocker (verapamil, diltiazem)',
      'Disopyramide (Na channel blocker)',
      'Septal myectomy (surgery)',
      'Alcohol septal ablation',
      'ICD (sudden death prevention)',
    ],
    lines_of_therapy: [
      '1L beta-blocker or CCB',
      '2L mavacamten or aficamten (obstructive)',
      '3L septal reduction therapy (myectomy or ablation)',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Deep Vein Thrombosis',
    subtypes: [
      {
        name: 'Proximal DVT (iliofemoral/popliteal)',
        prevalence_pct: 60,
        key_biomarkers: ['D-dimer', 'Compression ultrasound', 'CT venography (if iliac)'],
        standard_of_care:
          'DOAC (rivaroxaban or apixaban preferred); LMWH to warfarin (alternative); 3-6 months minimum',
      },
      {
        name: 'Distal DVT (calf vein)',
        prevalence_pct: 40,
        key_biomarkers: ['D-dimer', 'Compression ultrasound'],
        standard_of_care: 'Anticoagulation 3 months or serial monitoring (if low risk); DOAC preferred',
      },
    ],
    patient_segments: [
      {
        segment: 'Provoked (surgery/immobilization)',
        description: 'Time-limited anticoagulation (3 months)',
        pct_of_patients: 40,
      },
      {
        segment: 'Unprovoked',
        description: 'Extended anticoagulation consideration, thrombophilia workup',
        pct_of_patients: 35,
      },
      { segment: 'Cancer-associated', description: 'DOAC or LMWH; treat while cancer active', pct_of_patients: 15 },
      {
        segment: 'Recurrent VTE',
        description: 'Indefinite anticoagulation; consider IVC filter if contraindicated',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'Direct oral anticoagulant (rivaroxaban, apixaban, edoxaban)',
      'Low-molecular-weight heparin (enoxaparin, dalteparin)',
      'Vitamin K antagonist (warfarin)',
      'Factor XIa inhibitor (abelacimab, milvexian, emerging)',
      'Catheter-directed thrombolysis (massive/submassive)',
    ],
    lines_of_therapy: [
      '1L DOAC (rivaroxaban or apixaban)',
      '2L LMWH (cancer-associated or pregnancy)',
      '3L warfarin (mechanical valve, APS)',
    ],
    therapeutic_area: 'cardiovascular',
  },
  {
    indication: 'Dilated Cardiomyopathy',
    subtypes: [
      {
        name: 'Idiopathic',
        prevalence_pct: 50,
        key_biomarkers: ['LVEF <45%', 'LV dilation on echo', 'NT-proBNP', 'CMR (LGE pattern)'],
        standard_of_care: 'GDMT: ARNI + beta-blocker + MRA + SGLT2i; ICD if LVEF <=35%',
      },
      {
        name: 'Familial/genetic',
        prevalence_pct: 30,
        key_biomarkers: ['TTN, LMNA, or other DCM gene mutation', 'Family history', 'Genetic testing panel'],
        standard_of_care: 'GDMT; ICD (especially LMNA); family screening; genetic counseling',
      },
      {
        name: 'Post-myocarditis',
        prevalence_pct: 10,
        key_biomarkers: ['CMR (edema, LGE mid-wall)', 'Troponin history', 'Viral serology'],
        standard_of_care: 'GDMT; immunosuppression if active myocarditis confirmed; avoid exercise during acute phase',
      },
      {
        name: 'Other (tachycardia-mediated, peripartum, toxic)',
        prevalence_pct: 10,
        key_biomarkers: ['Clinical history', 'Echo/CMR', 'Arrhythmia monitoring'],
        standard_of_care: 'Treat underlying cause; GDMT; potential for recovery',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed (potential for recovery)',
        description: 'GDMT initiation, reassess EF at 3-6 months',
        pct_of_patients: 25,
      },
      { segment: 'Stable chronic DCM', description: 'Optimized GDMT, ICD in place', pct_of_patients: 40 },
      {
        segment: 'Progressive/advanced',
        description: 'Worsening symptoms, LVAD/transplant evaluation',
        pct_of_patients: 20,
      },
      {
        segment: 'LMNA mutation carriers',
        description: 'High arrhythmia risk, early ICD, close monitoring',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'ARNI (sacubitril/valsartan)',
      'SGLT2 inhibitor',
      'Beta-blocker (carvedilol preferred)',
      'MRA (spironolactone, eplerenone)',
      'ICD / CRT-D',
      'Gene therapy (LMNA-targeted, emerging)',
      'Immunosuppression (myocarditis-related)',
      'LVAD (bridge to transplant or destination)',
    ],
    lines_of_therapy: ['1L GDMT 4-pillar therapy', '2L ICD/CRT-D implantation', '3L LVAD or heart transplant'],
    therapeutic_area: 'cardiovascular',
  },

  // ════════════════════════════════════════════════════════════
  // PSYCHIATRY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Post-Traumatic Stress Disorder',
    subtypes: [
      {
        name: 'Combat-related PTSD',
        prevalence_pct: 25,
        key_biomarkers: ['cortisol dysregulation', 'HPA axis'],
        standard_of_care: 'Sertraline/paroxetine + CPT/PE therapy',
      },
      {
        name: 'Sexual trauma PTSD',
        prevalence_pct: 35,
        key_biomarkers: ['cortisol dysregulation'],
        standard_of_care: 'SSRI + CPT/EMDR therapy',
      },
      {
        name: 'Complex/developmental PTSD',
        prevalence_pct: 40,
        key_biomarkers: ['inflammatory markers'],
        standard_of_care: 'Phase-based trauma therapy + SSRI/SNRI',
      },
    ],
    patient_segments: [
      {
        segment: 'Treatment-naive',
        description: 'First presentation, eligible for first-line therapy',
        pct_of_patients: 40,
      },
      { segment: 'Partial responders', description: 'Incomplete response to first-line SSRI', pct_of_patients: 35 },
      { segment: 'Treatment-resistant', description: 'Failed ≥2 adequate trials', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'SSRI',
      'SNRI',
      'NMDA modulator',
      'MDMA-assisted therapy',
      'alpha-1 antagonist',
      'psychedelic-assisted',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Obsessive-Compulsive Disorder',
    subtypes: [
      {
        name: 'Contamination/cleaning',
        prevalence_pct: 30,
        key_biomarkers: ['serotonin transporter'],
        standard_of_care: 'High-dose SSRI + ERP therapy',
      },
      { name: 'Harm/checking', prevalence_pct: 25, key_biomarkers: [], standard_of_care: 'SSRI + ERP therapy' },
      { name: 'Symmetry/ordering', prevalence_pct: 20, key_biomarkers: [], standard_of_care: 'SSRI + ERP therapy' },
      { name: 'Hoarding', prevalence_pct: 15, key_biomarkers: [], standard_of_care: 'CBT specialized for hoarding' },
      {
        name: 'Pure obsessional (Pure-O)',
        prevalence_pct: 10,
        key_biomarkers: [],
        standard_of_care: 'SSRI + ERP/ACT therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Mild-moderate (Y-BOCS <24)',
        description: 'Responsive to SSRI monotherapy + ERP',
        pct_of_patients: 45,
      },
      { segment: 'Severe (Y-BOCS 24-32)', description: 'Requires augmentation strategies', pct_of_patients: 35 },
      {
        segment: 'Extreme/refractory (Y-BOCS >32)',
        description: 'Failed multiple SSRIs + augmentation; DBS candidate',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'SSRI (high-dose)',
      'SRI (clomipramine)',
      'glutamate modulator',
      'dopamine antagonist augmentation',
      'TMS',
      'DBS',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    subtypes: [
      {
        name: 'Predominantly inattentive',
        prevalence_pct: 30,
        key_biomarkers: ['dopamine transporter'],
        standard_of_care: 'Methylphenidate or amphetamine salts',
      },
      {
        name: 'Predominantly hyperactive-impulsive',
        prevalence_pct: 10,
        key_biomarkers: ['norepinephrine'],
        standard_of_care: 'Stimulant medication + behavioral therapy',
      },
      {
        name: 'Combined type',
        prevalence_pct: 60,
        key_biomarkers: ['dopamine transporter', 'norepinephrine'],
        standard_of_care: 'Stimulant medication ± behavioral therapy',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (6-12)',
        description: 'School-age children; behavioral + pharmacological',
        pct_of_patients: 35,
      },
      { segment: 'Adolescent (13-17)', description: 'Transition period; adherence challenges', pct_of_patients: 25 },
      { segment: 'Adult (18+)', description: 'Often newly diagnosed; workplace impairment focus', pct_of_patients: 40 },
    ],
    mechanisms_of_action: [
      'stimulant (methylphenidate)',
      'stimulant (amphetamine)',
      'NRI (atomoxetine)',
      'alpha-2 agonist (guanfacine)',
      'NRI (viloxazine)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Generalized Anxiety Disorder',
    subtypes: [
      { name: 'Mild GAD', prevalence_pct: 35, key_biomarkers: ['GAD-7 score 5-9'], standard_of_care: 'CBT ± SSRI' },
      {
        name: 'Moderate GAD',
        prevalence_pct: 40,
        key_biomarkers: ['GAD-7 score 10-14'],
        standard_of_care: 'SSRI/SNRI + CBT',
      },
      {
        name: 'Severe GAD',
        prevalence_pct: 25,
        key_biomarkers: ['GAD-7 score ≥15'],
        standard_of_care: 'SNRI + CBT + possible augmentation',
      },
    ],
    patient_segments: [
      { segment: 'First episode', description: 'Treatment-naive, good prognosis', pct_of_patients: 30 },
      {
        segment: 'Chronic/recurrent',
        description: 'Multiple episodes, may need maintenance therapy',
        pct_of_patients: 50,
      },
      { segment: 'Comorbid MDD', description: 'Anxiety with depression; dual-target therapy', pct_of_patients: 20 },
    ],
    mechanisms_of_action: ['SSRI', 'SNRI', 'buspirone', 'pregabalin', 'hydroxyzine', 'benzodiazepine (short-term)'],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Anorexia Nervosa',
    subtypes: [
      {
        name: 'Restricting type',
        prevalence_pct: 50,
        key_biomarkers: ['BMI', 'electrolytes', 'bone density'],
        standard_of_care: 'Nutritional rehabilitation + CBT-E/FBT',
      },
      {
        name: 'Binge-eating/purging type',
        prevalence_pct: 50,
        key_biomarkers: ['BMI', 'electrolytes', 'amylase'],
        standard_of_care: 'Nutritional rehabilitation + CBT-E + medical monitoring',
      },
    ],
    patient_segments: [
      { segment: 'Adolescent onset', description: 'FBT is gold standard; better prognosis', pct_of_patients: 45 },
      {
        segment: 'Adult onset/chronic',
        description: 'CBT-E primary; may need higher level of care',
        pct_of_patients: 40,
      },
      {
        segment: 'Severe/enduring (SE-AN)',
        description: '>7 years illness; harm reduction approach',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'nutritional rehabilitation',
      'CBT-E',
      'FBT (family-based)',
      'olanzapine (low-dose)',
      'SSRI (comorbid)',
      'psilocybin (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Substance Use Disorder',
    subtypes: [
      {
        name: 'Opioid use disorder',
        prevalence_pct: 35,
        key_biomarkers: ['urine drug screen', 'CYP2B6'],
        standard_of_care: 'Buprenorphine or methadone MAT + counseling',
      },
      {
        name: 'Alcohol use disorder',
        prevalence_pct: 40,
        key_biomarkers: ['GGT', 'CDT', 'MCV'],
        standard_of_care: 'Naltrexone or acamprosate + behavioral therapy',
      },
      {
        name: 'Stimulant use disorder',
        prevalence_pct: 15,
        key_biomarkers: ['urine drug screen'],
        standard_of_care: 'Contingency management + CBT (no FDA-approved pharmacotherapy)',
      },
      {
        name: 'Polysubstance use',
        prevalence_pct: 10,
        key_biomarkers: ['comprehensive tox screen'],
        standard_of_care: 'Integrated treatment addressing each substance',
      },
    ],
    patient_segments: [
      { segment: 'Early intervention', description: 'Mild SUD; outpatient counseling + MAT', pct_of_patients: 25 },
      { segment: 'Moderate-severe', description: 'IOP/residential treatment + MAT', pct_of_patients: 50 },
      { segment: 'Chronic relapsing', description: 'Long-term MAT + wraparound services', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'mu-opioid partial agonist (buprenorphine)',
      'mu-opioid antagonist (naltrexone)',
      'NMDA modulator (acamprosate)',
      'aldehyde dehydrogenase inhibitor (disulfiram)',
      'GLP-1 RA (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', 'Maintenance'],
    therapeutic_area: 'psychiatry',
  },
  {
    indication: 'Treatment-Resistant Depression',
    subtypes: [
      {
        name: 'TRD after 2 adequate trials',
        prevalence_pct: 60,
        key_biomarkers: ['CYP2D6', 'CYP2C19', 'inflammatory markers'],
        standard_of_care: 'Esketamine nasal spray + oral AD; or augmentation with atypical antipsychotic',
      },
      {
        name: 'TRD after 3+ adequate trials',
        prevalence_pct: 40,
        key_biomarkers: ['CYP2D6', 'inflammatory markers', 'HPA axis'],
        standard_of_care: 'Esketamine or ECT or TMS; psilocybin (investigational)',
      },
    ],
    patient_segments: [
      {
        segment: 'Augmentation candidates',
        description: 'Adding atypical antipsychotic or lithium to existing AD',
        pct_of_patients: 45,
      },
      {
        segment: 'Esketamine eligible',
        description: 'Meet REMS criteria; intranasal esketamine + oral AD',
        pct_of_patients: 30,
      },
      { segment: 'Neuromodulation candidates', description: 'ECT, TMS, or VNS eligible', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'NMDA antagonist (esketamine)',
      'atypical antipsychotic augmentation',
      'lithium augmentation',
      'ECT',
      'TMS',
      'VNS',
      'psilocybin (investigational)',
      'MDMA (investigational)',
    ],
    lines_of_therapy: ['3L+', 'Augmentation', 'Neuromodulation'],
    therapeutic_area: 'psychiatry',
  },

  // ════════════════════════════════════════════════════════════
  // PAIN MANAGEMENT (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Complex Regional Pain Syndrome',
    subtypes: [
      {
        name: 'CRPS-I (without nerve injury)',
        prevalence_pct: 90,
        key_biomarkers: ['inflammatory cytokines', 'bone scan'],
        standard_of_care: 'Physical therapy + bisphosphonates + gabapentinoids',
      },
      {
        name: 'CRPS-II (with nerve injury)',
        prevalence_pct: 10,
        key_biomarkers: ['nerve conduction studies'],
        standard_of_care: 'Physical therapy + nerve blocks + gabapentinoids',
      },
    ],
    patient_segments: [
      { segment: 'Warm phase (acute)', description: 'Early inflammatory; best treatment window', pct_of_patients: 35 },
      {
        segment: 'Cold phase (chronic)',
        description: 'Dystrophic/atrophic changes; harder to treat',
        pct_of_patients: 45,
      },
      {
        segment: 'Refractory',
        description: 'Failed multimodal; SCS or ketamine infusion candidates',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'bisphosphonate',
      'gabapentinoid',
      'NMDA antagonist (ketamine)',
      'sympathetic blockade',
      'spinal cord stimulation',
      'corticosteroid',
      'anti-CGRP',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'pain_management',
  },
  {
    indication: 'Cluster Headache',
    subtypes: [
      {
        name: 'Episodic cluster headache',
        prevalence_pct: 80,
        key_biomarkers: ['hypothalamic activation on fMRI'],
        standard_of_care: 'Sumatriptan SC + high-flow oxygen; verapamil prevention',
      },
      {
        name: 'Chronic cluster headache',
        prevalence_pct: 20,
        key_biomarkers: ['hypothalamic activation'],
        standard_of_care: 'Verapamil + galcanezumab; occipital nerve stimulation for refractory',
      },
    ],
    patient_segments: [
      { segment: 'Acute treatment', description: 'Sumatriptan/oxygen for attack abortion', pct_of_patients: 100 },
      {
        segment: 'Preventive therapy',
        description: 'Verapamil or galcanezumab for bout suppression',
        pct_of_patients: 70,
      },
      { segment: 'Refractory', description: 'Failed ≥3 preventives; neuromodulation candidates', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      '5-HT1B/1D agonist (triptan)',
      'calcium channel blocker (verapamil)',
      'anti-CGRP mAb (galcanezumab)',
      'corticosteroid (transitional)',
      'lithium',
      'occipital nerve stimulation',
    ],
    lines_of_therapy: ['Acute', 'Transitional', 'Preventive'],
    therapeutic_area: 'pain_management',
  },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Plaque Psoriasis',
    subtypes: [
      {
        name: 'Mild (BSA <3%)',
        prevalence_pct: 40,
        key_biomarkers: ['IL-17', 'IL-23', 'TNF-alpha'],
        standard_of_care: 'Topical corticosteroids + vitamin D analogs',
      },
      {
        name: 'Moderate (BSA 3-10%)',
        prevalence_pct: 35,
        key_biomarkers: ['IL-17', 'IL-23'],
        standard_of_care: 'Phototherapy or biologic (anti-IL-17/IL-23)',
      },
      {
        name: 'Severe (BSA >10%)',
        prevalence_pct: 25,
        key_biomarkers: ['IL-17', 'IL-23', 'TNF-alpha'],
        standard_of_care: 'Biologic therapy: IL-23i (risankizumab, guselkumab) or IL-17i (secukinumab, ixekizumab)',
      },
    ],
    patient_segments: [
      {
        segment: 'Biologic-naive',
        description: 'First systemic therapy; excellent response expected',
        pct_of_patients: 55,
      },
      { segment: 'Biologic-experienced', description: 'Switched from TNFi or other biologic', pct_of_patients: 30 },
      {
        segment: 'Difficult-to-treat areas',
        description: 'Scalp, nails, palmoplantar, genital involvement',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'anti-IL-17A',
      'anti-IL-17A/F',
      'anti-IL-23',
      'anti-TNF',
      'TYK2 inhibitor',
      'PDE4 inhibitor',
      'JAK inhibitor',
    ],
    lines_of_therapy: ['Topical', 'Phototherapy', '1L biologic', '2L biologic'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Giant Cell Arteritis',
    subtypes: [
      {
        name: 'Cranial GCA',
        prevalence_pct: 70,
        key_biomarkers: ['ESR', 'CRP', 'temporal artery biopsy'],
        standard_of_care: 'High-dose prednisone + tocilizumab',
      },
      {
        name: 'Large-vessel GCA',
        prevalence_pct: 30,
        key_biomarkers: ['CRP', 'PET-CT uptake'],
        standard_of_care: 'Tocilizumab + prednisone taper',
      },
    ],
    patient_segments: [
      {
        segment: 'Newly diagnosed',
        description: 'High-dose steroids + tocilizumab for steroid-sparing',
        pct_of_patients: 50,
      },
      { segment: 'Relapsing', description: 'Flare on steroid taper; biologic escalation', pct_of_patients: 35 },
      { segment: 'Refractory', description: 'Failed tocilizumab; clinical trial candidates', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'anti-IL-6R (tocilizumab)',
      'corticosteroid',
      'methotrexate',
      'JAK inhibitor (investigational)',
      'anti-GM-CSF (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Eosinophilic Esophagitis',
    subtypes: [
      {
        name: 'Inflammatory-predominant',
        prevalence_pct: 55,
        key_biomarkers: ['eosinophil count >15/hpf', 'IL-13', 'eotaxin-3'],
        standard_of_care: 'PPI trial → swallowed topical corticosteroid or dupilumab',
      },
      {
        name: 'Fibrostenotic',
        prevalence_pct: 45,
        key_biomarkers: ['endoscopic stricture', 'tissue remodeling markers'],
        standard_of_care: 'Dilation + dupilumab or budesonide ODT',
      },
    ],
    patient_segments: [
      { segment: 'PPI-responsive', description: 'Responds to PPI alone; milder phenotype', pct_of_patients: 35 },
      {
        segment: 'Biologic-eligible',
        description: 'Failed PPI/topical steroids; dupilumab candidate',
        pct_of_patients: 40,
      },
      { segment: 'Stricturing', description: 'Requires dilation + anti-inflammatory', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'anti-IL-4R/IL-13 (dupilumab)',
      'topical corticosteroid (budesonide)',
      'PPI',
      'anti-IL-13 (cendakimab, investigational)',
      'anti-Siglec-8 (lirentelimab, investigational)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Systemic Sclerosis',
    subtypes: [
      {
        name: 'Limited cutaneous (lcSSc/CREST)',
        prevalence_pct: 60,
        key_biomarkers: ['anti-centromere antibody', 'ACA'],
        standard_of_care: 'Symptomatic management; calcium channel blockers for Raynaud; nintedanib for ILD',
      },
      {
        name: 'Diffuse cutaneous (dcSSc)',
        prevalence_pct: 40,
        key_biomarkers: ['anti-Scl-70/anti-topoisomerase I', 'anti-RNA polymerase III'],
        standard_of_care: 'Mycophenolate + nintedanib for ILD; tocilizumab for skin',
      },
    ],
    patient_segments: [
      {
        segment: 'Early diffuse (<3 years)',
        description: 'Window for disease modification; aggressive immunosuppression',
        pct_of_patients: 25,
      },
      { segment: 'Established with ILD', description: 'Nintedanib or mycophenolate for fibrosis', pct_of_patients: 35 },
      { segment: 'PAH complication', description: 'Endothelin antagonist + PDE5i + prostacyclin', pct_of_patients: 20 },
      { segment: 'Limited/stable', description: 'Symptomatic management; Raynaud focus', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'anti-fibrotic (nintedanib)',
      'anti-IL-6R (tocilizumab)',
      'mycophenolate',
      'endothelin antagonist',
      'PDE5 inhibitor',
      'anti-CD20 (rituximab)',
      'HSCT (severe)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Hidradenitis Suppurativa',
    subtypes: [
      {
        name: 'Hurley Stage I (mild)',
        prevalence_pct: 30,
        key_biomarkers: ['TNF-alpha', 'IL-17'],
        standard_of_care: 'Topical clindamycin + lifestyle modifications',
      },
      {
        name: 'Hurley Stage II (moderate)',
        prevalence_pct: 45,
        key_biomarkers: ['TNF-alpha', 'IL-17', 'IL-1'],
        standard_of_care: 'Adalimumab or secukinumab + antibiotics',
      },
      {
        name: 'Hurley Stage III (severe)',
        prevalence_pct: 25,
        key_biomarkers: ['TNF-alpha', 'IL-17'],
        standard_of_care: 'Biologic + surgical intervention',
      },
    ],
    patient_segments: [
      { segment: 'Biologic-naive', description: 'First biologic; adalimumab or secukinumab', pct_of_patients: 55 },
      {
        segment: 'Biologic-experienced',
        description: 'Failed anti-TNF; switch to IL-17 or bimekizumab',
        pct_of_patients: 30,
      },
      {
        segment: 'Surgical candidates',
        description: 'Severe tunneling; surgery + biologic maintenance',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'anti-TNF (adalimumab)',
      'anti-IL-17A (secukinumab)',
      'anti-IL-17A/F (bimekizumab)',
      'JAK inhibitor (investigational)',
      'anti-IL-1 (anakinra)',
      'topical/oral antibiotics',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'immunology',
  },
  {
    indication: 'Chronic Spontaneous Urticaria',
    subtypes: [
      {
        name: 'Autoimmune IgE-mediated',
        prevalence_pct: 55,
        key_biomarkers: ['total IgE', 'anti-IgE receptor antibody'],
        standard_of_care: 'Second-generation antihistamine → omalizumab',
      },
      {
        name: 'Autoimmune IgG-mediated',
        prevalence_pct: 30,
        key_biomarkers: ['anti-FcεRIα antibody', 'basophil CD203c'],
        standard_of_care: 'Omalizumab; if refractory, cyclosporine',
      },
      {
        name: 'Idiopathic',
        prevalence_pct: 15,
        key_biomarkers: [],
        standard_of_care: 'Up-dosed antihistamine → omalizumab → cyclosporine',
      },
    ],
    patient_segments: [
      {
        segment: 'Antihistamine-controlled',
        description: 'Standard or up-dosed H1 antihistamine sufficient',
        pct_of_patients: 45,
      },
      {
        segment: 'Omalizumab responders',
        description: 'Failed antihistamines; omalizumab effective',
        pct_of_patients: 35,
      },
      { segment: 'Refractory', description: 'Failed omalizumab; cyclosporine or investigational', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'H1 antihistamine',
      'anti-IgE (omalizumab)',
      'anti-IgE (ligelizumab, investigational)',
      'BTK inhibitor (remibrutinib)',
      'cyclosporine',
      'anti-IL-4R/IL-13',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'immunology',
  },

  // ════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASE (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Respiratory Syncytial Virus',
    subtypes: [
      {
        name: 'Pediatric RSV',
        prevalence_pct: 40,
        key_biomarkers: ['RSV antigen', 'PCR'],
        standard_of_care: 'Nirsevimab prophylaxis; supportive care for acute',
      },
      {
        name: 'Elderly/adult RSV',
        prevalence_pct: 35,
        key_biomarkers: ['RSV PCR'],
        standard_of_care: 'Vaccination (Arexvy, Abrysvo); supportive care',
      },
      {
        name: 'Immunocompromised RSV',
        prevalence_pct: 25,
        key_biomarkers: ['RSV PCR', 'immune status'],
        standard_of_care: 'Ribavirin ± IVIG; investigational antivirals',
      },
    ],
    patient_segments: [
      {
        segment: 'Prevention (prophylaxis)',
        description: 'mAb or vaccine for high-risk populations',
        pct_of_patients: 60,
      },
      {
        segment: 'Acute treatment',
        description: 'Hospitalized with acute RSV; supportive ± antiviral',
        pct_of_patients: 40,
      },
    ],
    mechanisms_of_action: [
      'anti-RSV mAb (nirsevimab)',
      'anti-RSV mAb (palivizumab)',
      'RSV vaccine (protein subunit)',
      'fusion inhibitor (investigational)',
      'nucleoside analog (ribavirin)',
    ],
    lines_of_therapy: ['Prevention', 'Acute treatment'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Influenza',
    subtypes: [
      {
        name: 'Influenza A',
        prevalence_pct: 75,
        key_biomarkers: ['rapid antigen', 'PCR subtype'],
        standard_of_care: 'Oseltamivir or baloxavir within 48h of symptom onset',
      },
      {
        name: 'Influenza B',
        prevalence_pct: 25,
        key_biomarkers: ['rapid antigen', 'PCR'],
        standard_of_care: 'Oseltamivir or baloxavir',
      },
    ],
    patient_segments: [
      {
        segment: 'Outpatient mild',
        description: 'Otherwise healthy; early antiviral if presenting <48h',
        pct_of_patients: 70,
      },
      {
        segment: 'High-risk/hospitalized',
        description: 'Elderly, immunocompromised, comorbid; antiviral regardless of timing',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'neuraminidase inhibitor (oseltamivir)',
      'cap-dependent endonuclease inhibitor (baloxavir)',
      'neuraminidase inhibitor (zanamivir)',
      'M2 inhibitor (amantadine, limited use)',
    ],
    lines_of_therapy: ['Acute treatment', 'Prophylaxis'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'MRSA Infections',
    subtypes: [
      {
        name: 'Hospital-acquired MRSA',
        prevalence_pct: 45,
        key_biomarkers: ['mecA gene', 'PBP2a'],
        standard_of_care: 'Vancomycin IV or daptomycin',
      },
      {
        name: 'Community-acquired MRSA',
        prevalence_pct: 55,
        key_biomarkers: ['PVL toxin', 'mecA'],
        standard_of_care: 'TMP-SMX or doxycycline (mild); vancomycin IV (severe)',
      },
    ],
    patient_segments: [
      { segment: 'Skin/soft tissue', description: 'I&D + oral antibiotics; most common CA-MRSA', pct_of_patients: 55 },
      {
        segment: 'Bacteremia/endocarditis',
        description: 'IV vancomycin or daptomycin; prolonged course',
        pct_of_patients: 25,
      },
      { segment: 'Pneumonia', description: 'Vancomycin or linezolid; high mortality', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'glycopeptide (vancomycin)',
      'lipopeptide (daptomycin)',
      'oxazolidinone (linezolid)',
      'lipoglycopeptide (dalbavancin)',
      'cephalosporin (ceftaroline)',
      'tetracycline (omadacycline)',
    ],
    lines_of_therapy: ['1L', '2L', 'Salvage'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Clostridioides difficile Infection',
    subtypes: [
      {
        name: 'Initial episode',
        prevalence_pct: 60,
        key_biomarkers: ['C. diff toxin A/B', 'GDH antigen', 'NAAT'],
        standard_of_care: 'Fidaxomicin (preferred) or vancomycin oral',
      },
      {
        name: 'First recurrence',
        prevalence_pct: 25,
        key_biomarkers: ['C. diff toxin', 'prior episode'],
        standard_of_care: 'Fidaxomicin or vancomycin taper + bezlotoxumab',
      },
      {
        name: 'Multiply recurrent',
        prevalence_pct: 15,
        key_biomarkers: ['C. diff toxin', 'microbiome disruption'],
        standard_of_care: 'Fecal microbiota transplant (Vowst, Rebyota) + antibiotic',
      },
    ],
    patient_segments: [
      { segment: 'Non-severe', description: 'WBC <15K, creatinine <1.5; oral antibiotic', pct_of_patients: 60 },
      { segment: 'Severe', description: 'WBC ≥15K or creatinine ≥1.5; high-dose vancomycin', pct_of_patients: 25 },
      {
        segment: 'Fulminant',
        description: 'Hypotension, ileus, megacolon; surgical consultation',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'macrocyclic antibiotic (fidaxomicin)',
      'glycopeptide (vancomycin oral)',
      'anti-toxin B mAb (bezlotoxumab)',
      'fecal microbiota (SER-109/Vowst)',
      'fecal microbiota (RBX2660/Rebyota)',
    ],
    lines_of_therapy: ['1L', 'Recurrence', 'Multiply recurrent'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Malaria',
    subtypes: [
      {
        name: 'P. falciparum',
        prevalence_pct: 70,
        key_biomarkers: ['blood smear', 'RDT', 'PCR'],
        standard_of_care: 'ACT (artemisinin combination therapy); IV artesunate for severe',
      },
      {
        name: 'P. vivax',
        prevalence_pct: 25,
        key_biomarkers: ['blood smear', 'G6PD status'],
        standard_of_care: 'Chloroquine + primaquine (radical cure); tafenoquine',
      },
      {
        name: 'Other species',
        prevalence_pct: 5,
        key_biomarkers: ['blood smear', 'PCR speciation'],
        standard_of_care: 'Chloroquine (P. malariae/ovale); ACT if mixed',
      },
    ],
    patient_segments: [
      { segment: 'Uncomplicated', description: 'Oral ACT; outpatient management', pct_of_patients: 75 },
      {
        segment: 'Severe/complicated',
        description: 'IV artesunate; ICU-level care; cerebral malaria',
        pct_of_patients: 15,
      },
      { segment: 'Prophylaxis travelers', description: 'Atovaquone-proguanil or doxycycline', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'artemisinin (endoperoxide)',
      'chloroquine (4-aminoquinoline)',
      'primaquine (8-aminoquinoline)',
      'atovaquone-proguanil',
      'tafenoquine',
      'RTS,S/AS01 vaccine (Mosquirix)',
    ],
    lines_of_therapy: ['Prophylaxis', 'Treatment', 'Radical cure'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Invasive Fungal Infections',
    subtypes: [
      {
        name: 'Invasive aspergillosis',
        prevalence_pct: 40,
        key_biomarkers: ['galactomannan', 'beta-D-glucan', 'CT halo sign'],
        standard_of_care: 'Voriconazole or isavuconazole',
      },
      {
        name: 'Invasive candidiasis',
        prevalence_pct: 35,
        key_biomarkers: ['blood culture', 'beta-D-glucan', 'T2Candida'],
        standard_of_care: 'Echinocandin (micafungin, caspofungin)',
      },
      {
        name: 'Mucormycosis',
        prevalence_pct: 15,
        key_biomarkers: ['tissue biopsy', 'PCR'],
        standard_of_care: 'Amphotericin B lipid + surgical debridement',
      },
      {
        name: 'Other (crypto, histo, etc.)',
        prevalence_pct: 10,
        key_biomarkers: ['antigen testing', 'culture'],
        standard_of_care: 'Pathogen-specific antifungal',
      },
    ],
    patient_segments: [
      { segment: 'Hematologic malignancy', description: 'Highest risk; prolonged neutropenia', pct_of_patients: 40 },
      {
        segment: 'Solid organ transplant',
        description: 'Chronic immunosuppression; prophylaxis common',
        pct_of_patients: 30,
      },
      {
        segment: 'ICU/other',
        description: 'Candidemia in critical illness; broad-spectrum antifungal',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'triazole (voriconazole, isavuconazole)',
      'echinocandin (micafungin, caspofungin)',
      'polyene (amphotericin B)',
      'triazole (posaconazole, prophylaxis)',
      'olorofim (investigational)',
      'fosmanogepix (investigational)',
    ],
    lines_of_therapy: ['Prophylaxis', '1L treatment', 'Salvage'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Mpox',
    subtypes: [
      {
        name: 'Mild (limited lesions)',
        prevalence_pct: 70,
        key_biomarkers: ['orthopoxvirus PCR'],
        standard_of_care: 'Supportive care; vaccination post-exposure',
      },
      {
        name: 'Moderate',
        prevalence_pct: 20,
        key_biomarkers: ['orthopoxvirus PCR'],
        standard_of_care: 'Tecovirimat (TPOXX) under expanded access',
      },
      {
        name: 'Severe/immunocompromised',
        prevalence_pct: 10,
        key_biomarkers: ['orthopoxvirus PCR', 'immune status'],
        standard_of_care: 'Tecovirimat + cidofovir/brincidofovir + VIG',
      },
    ],
    patient_segments: [
      { segment: 'Immunocompetent', description: 'Self-limited in most; supportive care', pct_of_patients: 70 },
      {
        segment: 'HIV/immunocompromised',
        description: 'Higher complication risk; antiviral treatment',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'VP37 inhibitor (tecovirimat)',
      'DNA polymerase inhibitor (cidofovir)',
      'DNA polymerase inhibitor (brincidofovir)',
      'vaccinia immune globulin',
      'MVA-BN vaccine (Jynneos)',
    ],
    lines_of_therapy: ['Prevention', 'Treatment'],
    therapeutic_area: 'infectious_disease',
  },
  {
    indication: 'Chronic Hepatitis D',
    subtypes: [
      {
        name: 'HDV/HBV coinfection',
        prevalence_pct: 30,
        key_biomarkers: ['HDV RNA', 'HBsAg', 'anti-HDV IgM'],
        standard_of_care: 'PEG-interferon alpha; bulevirtide',
      },
      {
        name: 'HDV superinfection on chronic HBV',
        prevalence_pct: 70,
        key_biomarkers: ['HDV RNA', 'HBsAg', 'anti-HDV total'],
        standard_of_care: 'Bulevirtide (Hepcludex); PEG-IFN if eligible',
      },
    ],
    patient_segments: [
      { segment: 'Compensated liver disease', description: 'Bulevirtide or PEG-IFN eligible', pct_of_patients: 60 },
      {
        segment: 'Advanced fibrosis/cirrhosis',
        description: 'Bulevirtide; IFN-ineligible; transplant evaluation',
        pct_of_patients: 30,
      },
      {
        segment: 'Decompensated',
        description: 'Liver transplant evaluation; limited antiviral options',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'NTCP entry inhibitor (bulevirtide)',
      'PEG-interferon alpha',
      'prenylation inhibitor (lonafarnib, investigational)',
      'HBV functional cure agents (investigational)',
    ],
    lines_of_therapy: ['1L', '2L'],
    therapeutic_area: 'infectious_disease',
  },

  // ════════════════════════════════════════════════════════════
  // PULMONOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Severe Asthma',
    subtypes: [
      {
        name: 'Eosinophilic asthma',
        prevalence_pct: 50,
        key_biomarkers: ['blood eosinophils ≥300', 'FeNO ≥25 ppb', 'sputum eosinophils'],
        standard_of_care: 'Anti-IL-5 (mepolizumab, benralizumab) or anti-IL-4R (dupilumab)',
      },
      {
        name: 'Allergic asthma',
        prevalence_pct: 30,
        key_biomarkers: ['total IgE elevated', 'specific IgE', 'skin prick'],
        standard_of_care: 'Anti-IgE (omalizumab); allergen avoidance',
      },
      {
        name: 'Non-eosinophilic/neutrophilic asthma',
        prevalence_pct: 20,
        key_biomarkers: ['sputum neutrophils', 'normal eosinophils'],
        standard_of_care: 'Anti-TSLP (tezepelumab); macrolide trial; bronchial thermoplasty',
      },
    ],
    patient_segments: [
      { segment: 'Biologic-naive', description: 'First biologic; phenotype-guided selection', pct_of_patients: 50 },
      { segment: 'Biologic-experienced', description: 'Switched biologic; reassess phenotype', pct_of_patients: 30 },
      { segment: 'OCS-dependent', description: 'Goal is OCS reduction/elimination via biologic', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'anti-IL-5 (mepolizumab)',
      'anti-IL-5R (benralizumab)',
      'anti-IL-4R (dupilumab)',
      'anti-IgE (omalizumab)',
      'anti-TSLP (tezepelumab)',
      'LABA/LAMA/ICS triple',
      'bronchial thermoplasty',
    ],
    lines_of_therapy: ['Step 4 (GINA)', 'Step 5 biologic', 'Step 5+ add-on'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Chronic Obstructive Pulmonary Disease',
    subtypes: [
      {
        name: 'GOLD I (mild)',
        prevalence_pct: 15,
        key_biomarkers: ['FEV1 ≥80% predicted', 'FEV1/FVC <0.70'],
        standard_of_care: 'Short-acting bronchodilator PRN',
      },
      {
        name: 'GOLD II (moderate)',
        prevalence_pct: 40,
        key_biomarkers: ['FEV1 50-79%'],
        standard_of_care: 'LABA or LAMA maintenance',
      },
      {
        name: 'GOLD III (severe)',
        prevalence_pct: 30,
        key_biomarkers: ['FEV1 30-49%', 'eosinophils for ICS decision'],
        standard_of_care: 'LABA/LAMA ± ICS based on eosinophils and exacerbation history',
      },
      {
        name: 'GOLD IV (very severe)',
        prevalence_pct: 15,
        key_biomarkers: ['FEV1 <30%'],
        standard_of_care: 'Triple therapy (LABA/LAMA/ICS) + roflumilast; LVRS/transplant evaluation',
      },
    ],
    patient_segments: [
      {
        segment: 'Infrequent exacerbator',
        description: '0-1 moderate exacerbation/year; bronchodilator focus',
        pct_of_patients: 50,
      },
      {
        segment: 'Frequent exacerbator',
        description: '≥2 moderate or ≥1 hospitalized/year; ICS/biologic consideration',
        pct_of_patients: 35,
      },
      {
        segment: 'Eosinophilic COPD',
        description: 'Blood eos ≥300; ICS-responsive; biologic candidates',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'LABA',
      'LAMA',
      'ICS',
      'PDE4 inhibitor (roflumilast)',
      'PDE3/4 + muscarinic (ensifentrine)',
      'anti-IL-5 (investigational in COPD)',
      'anti-IL-33 (investigational)',
    ],
    lines_of_therapy: ['Monotherapy', 'Dual', 'Triple', 'Triple + add-on'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Bronchiectasis',
    subtypes: [
      {
        name: 'Post-infectious',
        prevalence_pct: 40,
        key_biomarkers: ['CT bronchial dilation', 'sputum culture'],
        standard_of_care: 'Airway clearance + macrolide + inhaled antibiotics if Pseudomonas',
      },
      {
        name: 'Idiopathic',
        prevalence_pct: 30,
        key_biomarkers: ['HRCT'],
        standard_of_care: 'Airway clearance + macrolide for exacerbation prevention',
      },
      {
        name: 'Immunodeficiency-related',
        prevalence_pct: 15,
        key_biomarkers: ['immunoglobulin levels', 'HRCT'],
        standard_of_care: 'IgG replacement + airway clearance + antibiotics',
      },
      {
        name: 'Other etiology',
        prevalence_pct: 15,
        key_biomarkers: ['HRCT', 'etiology workup'],
        standard_of_care: 'Treat underlying cause + airway clearance',
      },
    ],
    patient_segments: [
      { segment: 'Pseudomonas-colonized', description: 'Inhaled antibiotics; worse prognosis', pct_of_patients: 30 },
      { segment: 'Non-Pseudomonas', description: 'Macrolide prophylaxis; better prognosis', pct_of_patients: 50 },
      {
        segment: 'Frequent exacerbator',
        description: '≥3/year; aggressive antibiotic + airway clearance',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'macrolide (azithromycin)',
      'inhaled antibiotic (tobramycin, colistin)',
      'mucoactive agent',
      'anti-neutrophil elastase (brensocatib)',
      'DPP1 inhibitor (brensocatib)',
      'CFTR modulator (if CF-related)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Sarcoidosis',
    subtypes: [
      {
        name: 'Pulmonary sarcoidosis',
        prevalence_pct: 90,
        key_biomarkers: ['ACE level', 'chest CT', 'biopsy non-caseating granuloma'],
        standard_of_care: 'Observation (Scadding I-II) or prednisone (III-IV); methotrexate steroid-sparing',
      },
      {
        name: 'Extrapulmonary sarcoidosis',
        prevalence_pct: 10,
        key_biomarkers: ['ACE', 'organ-specific markers'],
        standard_of_care: 'Corticosteroids + immunosuppressant based on organ involvement',
      },
    ],
    patient_segments: [
      {
        segment: 'Self-resolving (Scadding I-II)',
        description: 'Observation; spontaneous remission in 60-80%',
        pct_of_patients: 50,
      },
      { segment: 'Chronic progressive', description: 'Corticosteroids + steroid-sparing agent', pct_of_patients: 35 },
      { segment: 'Refractory/fibrotic', description: 'Anti-TNF (infliximab); clinical trials', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'corticosteroid',
      'methotrexate',
      'anti-TNF (infliximab)',
      'mycophenolate',
      'azathioprine',
      'anti-JAK (investigational)',
      'mTOR inhibitor (investigational)',
    ],
    lines_of_therapy: ['Observation', '1L', '2L', '3L+'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Allergic Bronchopulmonary Aspergillosis',
    subtypes: [
      {
        name: 'Acute ABPA',
        prevalence_pct: 40,
        key_biomarkers: ['total IgE >1000', 'Aspergillus-specific IgE/IgG', 'eosinophils'],
        standard_of_care: 'Oral corticosteroids + itraconazole',
      },
      {
        name: 'ABPA-dependent',
        prevalence_pct: 35,
        key_biomarkers: ['total IgE elevated', 'recurrent infiltrates'],
        standard_of_care: 'Low-dose prednisone + itraconazole; omalizumab steroid-sparing',
      },
      {
        name: 'ABPA-fibrotic',
        prevalence_pct: 25,
        key_biomarkers: ['central bronchiectasis on CT', 'fibrosis'],
        standard_of_care: 'Antifungal + corticosteroid + airway clearance',
      },
    ],
    patient_segments: [
      { segment: 'Asthma-ABPA', description: 'ABPA complicating severe asthma', pct_of_patients: 60 },
      { segment: 'CF-ABPA', description: 'ABPA in cystic fibrosis patients', pct_of_patients: 30 },
      { segment: 'Steroid-dependent', description: 'Cannot taper steroids; biologic candidates', pct_of_patients: 10 },
    ],
    mechanisms_of_action: [
      'triazole antifungal (itraconazole)',
      'corticosteroid',
      'anti-IgE (omalizumab)',
      'anti-IL-5 (mepolizumab, off-label)',
      'anti-TSLP (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', '3L+'],
    therapeutic_area: 'pulmonology',
  },
  {
    indication: 'Interstitial Lung Disease',
    subtypes: [
      {
        name: 'IPF',
        prevalence_pct: 35,
        key_biomarkers: ['UIP pattern on HRCT', 'KL-6', 'SP-D'],
        standard_of_care: 'Nintedanib or pirfenidone',
      },
      {
        name: 'CTD-ILD',
        prevalence_pct: 25,
        key_biomarkers: ['autoimmune serologies', 'HRCT pattern'],
        standard_of_care: 'Mycophenolate + nintedanib if progressive',
      },
      {
        name: 'Hypersensitivity pneumonitis',
        prevalence_pct: 20,
        key_biomarkers: ['exposure history', 'BAL lymphocytosis'],
        standard_of_care: 'Antigen avoidance + corticosteroids; nintedanib if fibrotic',
      },
      {
        name: 'Other ILD',
        prevalence_pct: 20,
        key_biomarkers: ['HRCT pattern', 'BAL', 'biopsy'],
        standard_of_care: 'Etiology-specific treatment',
      },
    ],
    patient_segments: [
      { segment: 'Non-progressive', description: 'Stable ILD; monitoring ± immunosuppression', pct_of_patients: 40 },
      {
        segment: 'Progressive fibrosing',
        description: 'Progressive despite treatment; anti-fibrotic indicated',
        pct_of_patients: 40,
      },
      { segment: 'Transplant candidate', description: 'Advanced ILD; lung transplant evaluation', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'anti-fibrotic (nintedanib)',
      'anti-fibrotic (pirfenidone)',
      'mycophenolate',
      'rituximab (CTD-ILD)',
      'tocilizumab (SSc-ILD)',
      'corticosteroid',
    ],
    lines_of_therapy: ['1L', '2L', 'Transplant'],
    therapeutic_area: 'pulmonology',
  },

  // ════════════════════════════════════════════════════════════
  // NEPHROLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Minimal Change Disease',
    subtypes: [
      {
        name: 'Steroid-sensitive',
        prevalence_pct: 80,
        key_biomarkers: ['nephrotic-range proteinuria', 'normal complement', 'podocyte foot process effacement'],
        standard_of_care: 'Prednisone 1mg/kg; complete remission expected in 8-16 weeks',
      },
      {
        name: 'Steroid-resistant',
        prevalence_pct: 20,
        key_biomarkers: ['persistent proteinuria >4 weeks of steroids'],
        standard_of_care: 'Calcineurin inhibitor (tacrolimus/cyclosporine) or rituximab',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric',
        description: 'Most common childhood nephrotic syndrome; excellent steroid response',
        pct_of_patients: 55,
      },
      {
        segment: 'Adult',
        description: 'Slower response; higher relapse rate; more steroid toxicity',
        pct_of_patients: 30,
      },
      {
        segment: 'Frequently relapsing',
        description: '≥2 relapses in 6 months; steroid-sparing agents needed',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'corticosteroid',
      'calcineurin inhibitor (tacrolimus)',
      'anti-CD20 (rituximab)',
      'mycophenolate',
      'cyclophosphamide',
      'anti-CD38 (investigational)',
    ],
    lines_of_therapy: ['1L', '2L', 'Frequently relapsing'],
    therapeutic_area: 'nephrology',
  },
  {
    indication: 'Membranous Nephropathy',
    subtypes: [
      {
        name: 'Primary (PLA2R-associated)',
        prevalence_pct: 70,
        key_biomarkers: ['anti-PLA2R antibody', 'anti-THSD7A', 'nephrotic proteinuria'],
        standard_of_care: 'Rituximab (first-line); cyclophosphamide/CNI if refractory',
      },
      {
        name: 'Secondary',
        prevalence_pct: 30,
        key_biomarkers: ['PLA2R-negative', 'underlying cause workup'],
        standard_of_care: 'Treat underlying cause (lupus, malignancy, drugs, infections)',
      },
    ],
    patient_segments: [
      {
        segment: 'Low risk (proteinuria <4g)',
        description: 'Observation + ACEi/ARB; spontaneous remission possible',
        pct_of_patients: 30,
      },
      {
        segment: 'Medium risk (proteinuria 4-8g)',
        description: 'Rituximab if persistent >6 months',
        pct_of_patients: 40,
      },
      {
        segment: 'High risk (proteinuria >8g)',
        description: 'Immediate rituximab or cyclophosphamide-based regimen',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'anti-CD20 (rituximab)',
      'cyclophosphamide',
      'calcineurin inhibitor',
      'ACEi/ARB (antiproteinuric)',
      'anti-BAFF (belimumab, investigational in MN)',
      'complement inhibitor (investigational)',
    ],
    lines_of_therapy: ['Supportive', '1L immunosuppression', '2L'],
    therapeutic_area: 'nephrology',
  },

  // ════════════════════════════════════════════════════════════
  // OPHTHALMOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Neovascular Age-Related Macular Degeneration',
    subtypes: [
      {
        name: 'Treatment-naive nAMD',
        prevalence_pct: 30,
        key_biomarkers: ['CNV on OCT/FA', 'subretinal fluid', 'intraretinal fluid'],
        standard_of_care: 'Anti-VEGF: aflibercept 8mg or faricimab; treat-and-extend',
      },
      {
        name: 'Treatment-experienced nAMD',
        prevalence_pct: 70,
        key_biomarkers: ['persistent/recurrent fluid on OCT'],
        standard_of_care: 'Switch anti-VEGF agent or increase frequency; combination (investigational)',
      },
    ],
    patient_segments: [
      { segment: 'Good responders', description: 'Dry retina on anti-VEGF; extended intervals', pct_of_patients: 55 },
      {
        segment: 'Partial responders',
        description: 'Persistent fluid; consider switch or combination',
        pct_of_patients: 30,
      },
      {
        segment: 'Refractory/poor responders',
        description: 'Persistent fluid despite multiple agents; clinical trial',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'anti-VEGF (aflibercept)',
      'anti-VEGF-A/Ang-2 bispecific (faricimab)',
      'anti-VEGF (ranibizumab)',
      'anti-VEGF (bevacizumab, off-label)',
      'port delivery system',
      'gene therapy (investigational)',
    ],
    lines_of_therapy: ['1L anti-VEGF', '2L switch', 'Combination/investigational'],
    therapeutic_area: 'ophthalmology',
  },
  {
    indication: 'Geographic Atrophy',
    subtypes: [
      {
        name: 'Unifocal GA',
        prevalence_pct: 40,
        key_biomarkers: ['FAF hypofluorescence', 'OCT RPE loss'],
        standard_of_care: 'Pegcetacoplan or avacincaptad pegol intravitreal',
      },
      {
        name: 'Multifocal GA',
        prevalence_pct: 60,
        key_biomarkers: ['FAF multi-lesion', 'OCT RPE/photoreceptor loss'],
        standard_of_care: 'Complement inhibitor; monitoring for CNV conversion',
      },
    ],
    patient_segments: [
      {
        segment: 'Extrafoveal GA',
        description: 'Preserved central vision; treatment to prevent foveal involvement',
        pct_of_patients: 45,
      },
      {
        segment: 'Foveal GA',
        description: 'Central vision loss; treatment to slow further expansion',
        pct_of_patients: 35,
      },
      {
        segment: 'GA with CNV conversion',
        description: 'Developed neovascularization; add anti-VEGF',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'complement C3 inhibitor (pegcetacoplan)',
      'complement C5 inhibitor (avacincaptad pegol)',
      'complement factor D (investigational)',
      'neuroprotective (investigational)',
      'visual cycle modulator (investigational)',
    ],
    lines_of_therapy: ['1L', 'Monitoring', 'Add anti-VEGF if CNV'],
    therapeutic_area: 'ophthalmology',
  },
  {
    indication: 'Retinitis Pigmentosa',
    subtypes: [
      {
        name: 'Rod-cone dystrophy (typical RP)',
        prevalence_pct: 90,
        key_biomarkers: ['RHO (25%)', 'USH2A (15%)', 'RPGR (10%)', 'other genes'],
        standard_of_care:
          'Voretigene neparvovec (RPE65-associated only); vitamin A (limited evidence); low vision aids',
      },
      {
        name: 'Cone-rod dystrophy',
        prevalence_pct: 10,
        key_biomarkers: ['ABCA4', 'GUCY2D', 'CRX'],
        standard_of_care: 'No approved therapy; clinical trials; low vision rehabilitation',
      },
    ],
    patient_segments: [
      {
        segment: 'RPE65 biallelic (gene therapy eligible)',
        description: 'Luxturna-eligible; <4% of RP',
        pct_of_patients: 4,
      },
      {
        segment: 'Early/moderate RP',
        description: 'Preserved central vision; monitoring + trial candidates',
        pct_of_patients: 50,
      },
      {
        segment: 'Advanced RP',
        description: 'Significant vision loss; low vision rehab; retinal prosthesis',
        pct_of_patients: 46,
      },
    ],
    mechanisms_of_action: [
      'gene therapy (voretigene neparvovec for RPE65)',
      'gene therapy (investigational for RPGR, USH2A)',
      'optogenetics (investigational)',
      'retinal prosthesis (Argus II)',
      'neuroprotective (investigational)',
      'stem cell therapy (investigational)',
    ],
    lines_of_therapy: ['Gene therapy (if eligible)', 'Supportive', 'Investigational'],
    therapeutic_area: 'ophthalmology',
  },

  // ════════════════════════════════════════════════════════════
  // HEMATOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Iron Deficiency Anemia',
    subtypes: [
      {
        name: 'Absolute iron deficiency',
        prevalence_pct: 70,
        key_biomarkers: ['ferritin <30', 'TSAT <20%', 'low MCV'],
        standard_of_care: 'Oral iron (ferrous sulfate); IV iron (ferric carboxymaltose) if intolerant/malabsorption',
      },
      {
        name: 'Functional iron deficiency',
        prevalence_pct: 30,
        key_biomarkers: ['ferritin 30-100 + TSAT <20%', 'CRP elevated'],
        standard_of_care: 'IV iron preferred (ferric carboxymaltose, iron sucrose); treat underlying inflammation',
      },
    ],
    patient_segments: [
      { segment: 'GI blood loss', description: 'Menstruation, GI bleeding; oral iron first', pct_of_patients: 45 },
      { segment: 'CKD/HF-associated', description: 'IV iron preferred; ESA if needed', pct_of_patients: 30 },
      { segment: 'Malabsorption/IBD', description: 'IV iron required; oral iron ineffective', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'oral iron (ferrous sulfate/gluconate)',
      'IV iron (ferric carboxymaltose)',
      'IV iron (iron sucrose)',
      'IV iron (ferric derisomaltose)',
      'ESA (if concurrent anemia of chronic disease)',
    ],
    lines_of_therapy: ['Oral iron', 'IV iron', 'IV iron + ESA'],
    therapeutic_area: 'hematology',
  },
  {
    indication: 'Paroxysmal Nocturnal Hemoglobinuria',
    subtypes: [
      {
        name: 'Classical PNH',
        prevalence_pct: 50,
        key_biomarkers: ['GPI-anchor deficient clone >50%', 'LDH elevated', 'flow cytometry'],
        standard_of_care: 'Complement C5 inhibitor (eculizumab/ravulizumab) or C3 inhibitor (iptacopan)',
      },
      {
        name: 'PNH/aplastic anemia overlap',
        prevalence_pct: 35,
        key_biomarkers: ['GPI-anchor deficient clone', 'hypocellular marrow'],
        standard_of_care: 'IST (ATG + cyclosporine) ± complement inhibitor',
      },
      {
        name: 'Subclinical PNH',
        prevalence_pct: 15,
        key_biomarkers: ['small GPI-anchor clone <10%', 'normal LDH'],
        standard_of_care: 'Monitoring; treat if clone expands or symptoms develop',
      },
    ],
    patient_segments: [
      {
        segment: 'C5 inhibitor responders',
        description: 'Good hemolysis control on eculizumab/ravulizumab',
        pct_of_patients: 55,
      },
      {
        segment: 'Residual anemia on C5i',
        description: 'C3-mediated extravascular hemolysis; switch to proximal complement',
        pct_of_patients: 30,
      },
      {
        segment: 'Treatment-naive',
        description: 'Newly diagnosed; first complement inhibitor selection',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'anti-C5 (eculizumab)',
      'anti-C5 long-acting (ravulizumab)',
      'factor B inhibitor (iptacopan)',
      'factor D inhibitor (danicopan)',
      'C3 inhibitor (pegcetacoplan)',
      'anti-C5 (crovalimab)',
    ],
    lines_of_therapy: ['1L', '2L (switch)', 'Add-on'],
    therapeutic_area: 'hematology',
  },
  {
    indication: 'Beta-Thalassemia',
    subtypes: [
      {
        name: 'Transfusion-dependent (TDT/major)',
        prevalence_pct: 30,
        key_biomarkers: ['Hb <7 g/dL untransfused', 'beta-globin genotype'],
        standard_of_care: 'Chronic transfusions + chelation; luspatercept; gene therapy (betibeglogene/exagamglogene)',
      },
      {
        name: 'Non-transfusion-dependent (NTDT/intermedia)',
        prevalence_pct: 50,
        key_biomarkers: ['Hb 7-10 g/dL', 'beta-globin genotype'],
        standard_of_care: 'Luspatercept; intermittent transfusion; chelation if iron overloaded',
      },
      {
        name: 'Beta-thalassemia trait',
        prevalence_pct: 20,
        key_biomarkers: ['Hb 9-11', 'HbA2 elevated', 'microcytosis'],
        standard_of_care: 'No treatment needed; genetic counseling',
      },
    ],
    patient_segments: [
      {
        segment: 'Gene therapy eligible',
        description: 'TDT patients eligible for curative gene therapy',
        pct_of_patients: 15,
      },
      {
        segment: 'Chronic transfusion management',
        description: 'Regular transfusions + chelation + monitoring',
        pct_of_patients: 45,
      },
      {
        segment: 'Luspatercept responders',
        description: 'Reduced transfusion burden with maturation agent',
        pct_of_patients: 40,
      },
    ],
    mechanisms_of_action: [
      'erythroid maturation agent (luspatercept)',
      'gene therapy (betibeglogene autotemcel)',
      'gene editing (exagamglogene autotemcel)',
      'iron chelation (deferasirox, deferoxamine)',
      'HbF induction (hydroxyurea)',
      'JAK2 inhibitor (investigational)',
    ],
    lines_of_therapy: ['Transfusion + chelation', 'Luspatercept', 'Gene therapy'],
    therapeutic_area: 'hematology',
  },

  // ════════════════════════════════════════════════════════════
  // DERMATOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Acne Vulgaris',
    subtypes: [
      {
        name: 'Comedonal acne',
        prevalence_pct: 30,
        key_biomarkers: ['open/closed comedones'],
        standard_of_care: 'Topical retinoid (adapalene/tretinoin)',
      },
      {
        name: 'Inflammatory acne',
        prevalence_pct: 50,
        key_biomarkers: ['papules', 'pustules'],
        standard_of_care: 'Topical retinoid + benzoyl peroxide ± topical antibiotic',
      },
      {
        name: 'Nodulocystic acne',
        prevalence_pct: 20,
        key_biomarkers: ['nodules', 'cysts', 'scarring risk'],
        standard_of_care: 'Oral isotretinoin',
      },
    ],
    patient_segments: [
      { segment: 'Adolescent', description: 'Peak prevalence; topical-first approach', pct_of_patients: 55 },
      { segment: 'Adult female', description: 'Hormonal component; spironolactone consideration', pct_of_patients: 30 },
      {
        segment: 'Scarring/severe',
        description: 'Early isotretinoin to prevent permanent scarring',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'retinoid (adapalene, tretinoin, isotretinoin)',
      'benzoyl peroxide',
      'topical antibiotic (clindamycin)',
      'oral antibiotic (doxycycline)',
      'anti-androgen (spironolactone)',
      'clascoterone (topical anti-androgen)',
    ],
    lines_of_therapy: ['Topical', 'Oral antibiotic', 'Isotretinoin'],
    therapeutic_area: 'dermatology',
  },
  {
    indication: 'Prurigo Nodularis',
    subtypes: [
      {
        name: 'Mild PN',
        prevalence_pct: 30,
        key_biomarkers: ['IGA-PN score', 'WI-NRS'],
        standard_of_care: 'Topical corticosteroids + antihistamines',
      },
      {
        name: 'Moderate PN',
        prevalence_pct: 40,
        key_biomarkers: ['IGA-PN', 'WI-NRS ≥7'],
        standard_of_care: 'Dupilumab or nemolizumab',
      },
      {
        name: 'Severe PN',
        prevalence_pct: 30,
        key_biomarkers: ['IGA-PN severe', 'widespread nodules'],
        standard_of_care: 'Dupilumab or nemolizumab; immunosuppressant if refractory',
      },
    ],
    patient_segments: [
      {
        segment: 'Biologic-naive',
        description: 'First systemic therapy; dupilumab or nemolizumab',
        pct_of_patients: 60,
      },
      { segment: 'Biologic-experienced', description: 'Switch agent or combine approaches', pct_of_patients: 25 },
      {
        segment: 'Underlying atopic diathesis',
        description: 'AD + PN overlap; anti-IL-4R preferred',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'anti-IL-4R/IL-13 (dupilumab)',
      'anti-IL-31R (nemolizumab)',
      'anti-OSMRβ (vixarelimab, investigational)',
      'JAK inhibitor (investigational)',
      'NK1R antagonist (serlopitant)',
      'topical corticosteroid',
    ],
    lines_of_therapy: ['Topical', '1L biologic', '2L biologic'],
    therapeutic_area: 'dermatology',
  },
  {
    indication: 'Pemphigus Vulgaris',
    subtypes: [
      {
        name: 'Mucosal dominant PV',
        prevalence_pct: 40,
        key_biomarkers: ['anti-Dsg3 positive', 'anti-Dsg1 negative'],
        standard_of_care: 'Rituximab first-line + short-course corticosteroid',
      },
      {
        name: 'Mucocutaneous PV',
        prevalence_pct: 60,
        key_biomarkers: ['anti-Dsg3 positive', 'anti-Dsg1 positive'],
        standard_of_care: 'Rituximab first-line + corticosteroid; mycophenolate steroid-sparing',
      },
    ],
    patient_segments: [
      { segment: 'Newly diagnosed', description: 'Rituximab + prednisone (RITUX 3 protocol)', pct_of_patients: 40 },
      {
        segment: 'Maintenance/remission',
        description: 'Rituximab re-dosing based on CD19/Dsg titers',
        pct_of_patients: 40,
      },
      {
        segment: 'Refractory',
        description: 'Failed rituximab; IVIG, cyclophosphamide, or investigational',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'anti-CD20 (rituximab)',
      'corticosteroid',
      'mycophenolate',
      'IVIG',
      'anti-neonatal Fc receptor (efgartigimod, investigational)',
      'anti-CD19 (investigational)',
      'BTK inhibitor (investigational)',
    ],
    lines_of_therapy: ['1L', 'Maintenance', 'Refractory'],
    therapeutic_area: 'dermatology',
  },

  // ════════════════════════════════════════════════════════════
  // GASTROENTEROLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Eosinophilic Gastritis/Duodenitis',
    subtypes: [
      {
        name: 'Gastric-predominant',
        prevalence_pct: 50,
        key_biomarkers: ['gastric eosinophils ≥30/hpf', 'peripheral eosinophilia'],
        standard_of_care: 'PPI trial; topical/systemic corticosteroids; dupilumab (investigational)',
      },
      {
        name: 'Duodenal-predominant',
        prevalence_pct: 30,
        key_biomarkers: ['duodenal eosinophils ≥30/hpf'],
        standard_of_care: 'Budesonide oral suspension; diet elimination',
      },
      {
        name: 'Combined gastroduodenal',
        prevalence_pct: 20,
        key_biomarkers: ['multi-segment eosinophilia'],
        standard_of_care: 'Systemic corticosteroid + PPI; anti-IL-4R (investigational)',
      },
    ],
    patient_segments: [
      {
        segment: 'Diet-responsive',
        description: 'Elimination diet effective; allergen identification',
        pct_of_patients: 30,
      },
      {
        segment: 'Steroid-responsive',
        description: 'Topical or systemic steroids control disease',
        pct_of_patients: 45,
      },
      { segment: 'Refractory', description: 'Failed diet + steroids; biologic candidates', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'PPI',
      'topical corticosteroid (budesonide)',
      'systemic corticosteroid',
      'anti-IL-4R/IL-13 (dupilumab, investigational)',
      'anti-IL-5 (mepolizumab, investigational)',
      'anti-Siglec-8 (lirentelimab, investigational)',
    ],
    lines_of_therapy: ['Diet/PPI', '1L steroid', '2L biologic'],
    therapeutic_area: 'gastroenterology',
  },
  {
    indication: 'Short Bowel Syndrome',
    subtypes: [
      {
        name: 'SBS with colon-in-continuity',
        prevalence_pct: 60,
        key_biomarkers: ['remaining bowel length', 'citrulline level'],
        standard_of_care: 'Oral nutrition optimization + teduglutide; parenteral nutrition weaning',
      },
      {
        name: 'SBS with end-jejunostomy',
        prevalence_pct: 40,
        key_biomarkers: ['remaining bowel length <100cm', 'high ostomy output'],
        standard_of_care: 'Parenteral nutrition + teduglutide; intestinal transplant evaluation',
      },
    ],
    patient_segments: [
      { segment: 'PN-dependent', description: 'Requiring parenteral nutrition ≥3 days/week', pct_of_patients: 55 },
      {
        segment: 'Weaning from PN',
        description: 'Intestinal adaptation ongoing; teduglutide to accelerate',
        pct_of_patients: 30,
      },
      {
        segment: 'Enterally autonomous',
        description: 'Off PN; oral/enteral nutrition sufficient',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'GLP-2 analog (teduglutide)',
      'oral rehydration/nutrition',
      'anti-diarrheal (loperamide)',
      'PPI (reduce gastric hypersecretion)',
      'intestinal transplant',
      'APSA (apraglutide, investigational)',
    ],
    lines_of_therapy: ['PN + oral rehab', 'GLP-2 analog', 'Transplant'],
    therapeutic_area: 'gastroenterology',
  },

  // ════════════════════════════════════════════════════════════
  // HEPATOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Autoimmune Hepatitis',
    subtypes: [
      {
        name: 'Type 1 AIH (ANA/SMA+)',
        prevalence_pct: 80,
        key_biomarkers: ['ANA', 'SMA', 'elevated IgG', 'ALT/AST'],
        standard_of_care: 'Prednisone + azathioprine induction → azathioprine maintenance',
      },
      {
        name: 'Type 2 AIH (anti-LKM1+)',
        prevalence_pct: 20,
        key_biomarkers: ['anti-LKM1', 'anti-LC1', 'elevated IgG'],
        standard_of_care: 'Prednisone + azathioprine; mycophenolate if azathioprine-intolerant',
      },
    ],
    patient_segments: [
      { segment: 'Treatment-naive', description: 'Induction with prednisone + azathioprine', pct_of_patients: 40 },
      {
        segment: 'Maintenance/remission',
        description: 'Azathioprine monotherapy; monitor for flares',
        pct_of_patients: 40,
      },
      {
        segment: 'Refractory/intolerant',
        description: 'Mycophenolate, tacrolimus, or investigational agents',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'corticosteroid',
      'azathioprine',
      'mycophenolate',
      'tacrolimus',
      'anti-BAFF (investigational)',
      'anti-CD20 (rituximab, refractory)',
      'budesonide (non-cirrhotic)',
    ],
    lines_of_therapy: ['Induction', 'Maintenance', 'Refractory'],
    therapeutic_area: 'hepatology',
  },
  {
    indication: 'Primary Sclerosing Cholangitis',
    subtypes: [
      {
        name: 'Large-duct PSC',
        prevalence_pct: 80,
        key_biomarkers: ['ALP elevated', 'MRCP beading', 'pANCA'],
        standard_of_care: 'UDCA (controversial); endoscopic management of strictures; transplant evaluation',
      },
      {
        name: 'Small-duct PSC',
        prevalence_pct: 20,
        key_biomarkers: ['ALP elevated', 'normal MRCP', 'liver biopsy'],
        standard_of_care: 'UDCA; monitoring; better prognosis than large-duct',
      },
    ],
    patient_segments: [
      { segment: 'Early/asymptomatic', description: 'Monitoring + UDCA; cancer surveillance', pct_of_patients: 40 },
      { segment: 'Dominant stricture', description: 'ERCP with dilation/stenting', pct_of_patients: 30 },
      {
        segment: 'Advanced/transplant candidate',
        description: 'Liver transplant evaluation; cholangiocarcinoma surveillance',
        pct_of_patients: 30,
      },
    ],
    mechanisms_of_action: [
      'UDCA (ursodeoxycholic acid)',
      'nor-UDCA (investigational)',
      'FXR agonist (investigational)',
      'PPAR agonist (investigational)',
      'anti-fibrotic (investigational)',
      'liver transplant',
    ],
    lines_of_therapy: ['Medical management', 'Endoscopic', 'Transplant'],
    therapeutic_area: 'hepatology',
  },

  // ════════════════════════════════════════════════════════════
  // ENDOCRINOLOGY (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Hypothyroidism',
    subtypes: [
      {
        name: "Hashimoto's thyroiditis",
        prevalence_pct: 90,
        key_biomarkers: ['anti-TPO antibody', 'anti-thyroglobulin', 'elevated TSH'],
        standard_of_care: 'Levothyroxine replacement; dose titrated to TSH',
      },
      {
        name: 'Non-autoimmune hypothyroidism',
        prevalence_pct: 10,
        key_biomarkers: ['elevated TSH', 'negative antibodies'],
        standard_of_care: 'Levothyroxine; investigate etiology (post-surgical, radiation, drug-induced)',
      },
    ],
    patient_segments: [
      {
        segment: 'Subclinical (TSH 4.5-10)',
        description: 'Treat if symptomatic, pregnant, or anti-TPO+',
        pct_of_patients: 35,
      },
      { segment: 'Overt hypothyroidism', description: 'Standard levothyroxine replacement', pct_of_patients: 55 },
      {
        segment: 'Refractory symptoms on T4',
        description: 'Consider T4/T3 combination; investigate other causes',
        pct_of_patients: 10,
      },
    ],
    mechanisms_of_action: [
      'levothyroxine (T4)',
      'liothyronine (T3)',
      'desiccated thyroid',
      'selenium (Hashimoto, investigational)',
    ],
    lines_of_therapy: ['Levothyroxine', 'Combination T4/T3'],
    therapeutic_area: 'endocrinology',
  },
  {
    indication: 'Hypoparathyroidism',
    subtypes: [
      {
        name: 'Post-surgical',
        prevalence_pct: 75,
        key_biomarkers: ['low PTH', 'low calcium', 'high phosphate'],
        standard_of_care: 'Calcium + calcitriol; TransCon PTH (palopegteriparatide)',
      },
      {
        name: 'Autoimmune',
        prevalence_pct: 15,
        key_biomarkers: ['anti-CASR antibody', 'low PTH'],
        standard_of_care: 'Calcium + calcitriol; PTH replacement',
      },
      {
        name: 'Genetic',
        prevalence_pct: 10,
        key_biomarkers: ['genetic testing (TBCE, GATA3, GCM2)', 'low PTH'],
        standard_of_care: 'Calcium + calcitriol; PTH replacement if available',
      },
    ],
    patient_segments: [
      {
        segment: 'Well-controlled on calcium/calcitriol',
        description: 'Stable calcium levels; monitoring',
        pct_of_patients: 50,
      },
      {
        segment: 'Poorly controlled/high supplement burden',
        description: 'PTH replacement candidate (TransCon PTH)',
        pct_of_patients: 35,
      },
      {
        segment: 'Complications (renal, QoL)',
        description: 'Nephrocalcinosis, brain calcification; PTH replacement priority',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'PTH replacement (palopegteriparatide/TransCon PTH)',
      'rhPTH(1-84) (discontinued)',
      'calcium supplementation',
      'calcitriol (active vitamin D)',
      'thiazide diuretic (reduce hypercalciuria)',
    ],
    lines_of_therapy: ['Calcium/calcitriol', 'PTH replacement', 'Adjunctive'],
    therapeutic_area: 'endocrinology',
  },
  {
    indication: 'Congenital Hyperinsulinism',
    subtypes: [
      {
        name: 'Diffuse CHI',
        prevalence_pct: 55,
        key_biomarkers: ['ABCC8/KCNJ11 mutations', '18F-DOPA PET'],
        standard_of_care: 'Diazoxide trial; octreotide if unresponsive; near-total pancreatectomy if medical failure',
      },
      {
        name: 'Focal CHI',
        prevalence_pct: 45,
        key_biomarkers: ['paternal ABCC8/KCNJ11 + somatic LOH', '18F-DOPA PET focal uptake'],
        standard_of_care: 'Limited focal pancreatectomy (curative)',
      },
    ],
    patient_segments: [
      {
        segment: 'Diazoxide-responsive',
        description: 'K-ATP channel partially functional; medical management',
        pct_of_patients: 40,
      },
      {
        segment: 'Diazoxide-unresponsive',
        description: 'Severe K-ATP defect; octreotide or surgery',
        pct_of_patients: 45,
      },
      { segment: 'Post-surgical', description: 'Monitoring for diabetes/exocrine insufficiency', pct_of_patients: 15 },
    ],
    mechanisms_of_action: [
      'KATP channel opener (diazoxide)',
      'somatostatin analog (octreotide, lanreotide)',
      'GLP-1R antagonist (exendin 9-39, investigational)',
      'mTOR inhibitor (sirolimus, off-label)',
      'focal pancreatectomy',
    ],
    lines_of_therapy: ['1L medical', '2L medical', 'Surgical'],
    therapeutic_area: 'endocrinology',
  },

  // ════════════════════════════════════════════════════════════
  // METABOLIC (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Hyperuricemia',
    subtypes: [
      {
        name: 'Asymptomatic hyperuricemia',
        prevalence_pct: 70,
        key_biomarkers: ['serum urate >6.8 mg/dL'],
        standard_of_care: 'Lifestyle modification; ULT controversial in asymptomatic',
      },
      {
        name: 'Hyperuricemia with gout',
        prevalence_pct: 30,
        key_biomarkers: ['serum urate >6.8', 'MSU crystals on aspiration'],
        standard_of_care: 'ULT: allopurinol or febuxostat to target <6 mg/dL',
      },
    ],
    patient_segments: [
      {
        segment: 'Diet/lifestyle responsive',
        description: 'Purine restriction + hydration; mild elevation',
        pct_of_patients: 30,
      },
      { segment: 'ULT-controlled', description: 'Allopurinol/febuxostat maintaining target', pct_of_patients: 50 },
      { segment: 'Refractory', description: 'Failed oral ULT; pegloticase or combination', pct_of_patients: 20 },
    ],
    mechanisms_of_action: [
      'xanthine oxidase inhibitor (allopurinol)',
      'xanthine oxidase inhibitor (febuxostat)',
      'URAT1 inhibitor (lesinurad)',
      'PEGylated uricase (pegloticase)',
      'anti-IL-1 (for flare, anakinra/canakinumab)',
    ],
    lines_of_therapy: ['Lifestyle', '1L ULT', '2L ULT/combination'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Hyperlipidemia',
    subtypes: [
      {
        name: 'Primary hyperlipidemia',
        prevalence_pct: 85,
        key_biomarkers: ['LDL-C', 'non-HDL-C', 'ApoB', 'Lp(a)'],
        standard_of_care: 'Statin first-line; add ezetimibe; add PCSK9i if still above goal',
      },
      {
        name: 'Secondary hyperlipidemia',
        prevalence_pct: 15,
        key_biomarkers: ['LDL-C', 'TSH', 'glucose', 'renal function'],
        standard_of_care: 'Treat underlying cause + statin as needed',
      },
    ],
    patient_segments: [
      { segment: 'Primary prevention', description: 'ASCVD risk-based statin therapy', pct_of_patients: 55 },
      {
        segment: 'Secondary prevention (post-ACS/ASCVD)',
        description: 'High-intensity statin + ezetimibe ± PCSK9i',
        pct_of_patients: 30,
      },
      {
        segment: 'Statin-intolerant',
        description: 'Bempedoic acid, ezetimibe, PCSK9i, or inclisiran',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'HMG-CoA reductase inhibitor (statin)',
      'NPC1L1 inhibitor (ezetimibe)',
      'PCSK9 mAb (evolocumab, alirocumab)',
      'PCSK9 siRNA (inclisiran)',
      'ACL inhibitor (bempedoic acid)',
      'ANGPTL3 mAb (evinacumab)',
      'Lp(a) ASO (investigational)',
    ],
    lines_of_therapy: ['Statin', 'Statin + ezetimibe', 'Add PCSK9i/inclisiran'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Homocystinuria',
    subtypes: [
      {
        name: 'CBS deficiency (pyridoxine-responsive)',
        prevalence_pct: 48,
        key_biomarkers: ['homocysteine elevated', 'CBS gene', 'pyridoxine response test'],
        standard_of_care: 'Pyridoxine (B6) + betaine + methionine-restricted diet',
      },
      {
        name: 'CBS deficiency (pyridoxine non-responsive)',
        prevalence_pct: 47,
        key_biomarkers: ['homocysteine elevated', 'CBS gene'],
        standard_of_care: 'Methionine-restricted diet + betaine + pyridoxine trial',
      },
      {
        name: 'Remethylation defects',
        prevalence_pct: 5,
        key_biomarkers: ['MTHFR', 'cobalamin metabolism genes'],
        standard_of_care: 'Hydroxocobalamin + betaine + folate',
      },
    ],
    patient_segments: [
      {
        segment: 'Early diagnosed (newborn screening)',
        description: 'Best outcomes with early dietary intervention',
        pct_of_patients: 40,
      },
      {
        segment: 'Late diagnosed',
        description: 'Complications present; dietary + pharmacological',
        pct_of_patients: 40,
      },
      {
        segment: 'Enzyme therapy candidates',
        description: 'OT-58 PEGylated CBS (investigational)',
        pct_of_patients: 20,
      },
    ],
    mechanisms_of_action: [
      'pyridoxine (vitamin B6)',
      'betaine (methyl donor)',
      'methionine-restricted diet',
      'PEGylated CBS enzyme (OT-58, investigational)',
    ],
    lines_of_therapy: ['Diet + B6', 'Diet + betaine', 'Investigational enzyme'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Maple Syrup Urine Disease',
    subtypes: [
      {
        name: 'Classic MSUD',
        prevalence_pct: 75,
        key_biomarkers: [
          'leucine, isoleucine, valine elevated',
          'alloisoleucine pathognomonic',
          'BCKDH enzyme activity <2%',
        ],
        standard_of_care: 'BCAA-restricted diet; acute crisis: IV glucose + lipids + dialysis',
      },
      {
        name: 'Intermediate MSUD',
        prevalence_pct: 15,
        key_biomarkers: ['intermittent BCAA elevation', 'BCKDH 3-30%'],
        standard_of_care: 'Moderate BCAA restriction; crisis management',
      },
      {
        name: 'Intermittent MSUD',
        prevalence_pct: 10,
        key_biomarkers: ['BCAA normal between crises', 'BCKDH >30%'],
        standard_of_care: 'Normal diet with illness management protocol; BCAA monitoring',
      },
    ],
    patient_segments: [
      { segment: 'Neonatal/infant', description: 'Acute presentation; emergency management', pct_of_patients: 35 },
      {
        segment: 'Chronic dietary management',
        description: 'Lifelong BCAA restriction; metabolic formula',
        pct_of_patients: 50,
      },
      {
        segment: 'Liver transplant candidates',
        description: 'Curative; eliminates dietary restriction',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'BCAA-restricted diet',
      'metabolic formula (BCAA-free)',
      'liver transplant (curative)',
      'gene therapy (investigational)',
      'BCKDH activator (investigational)',
    ],
    lines_of_therapy: ['Dietary management', 'Acute crisis management', 'Transplant'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Galactosemia',
    subtypes: [
      {
        name: 'Classic galactosemia (GALT deficiency)',
        prevalence_pct: 70,
        key_biomarkers: ['GALT enzyme activity <1%', 'galactose-1-phosphate elevated', 'GALT gene'],
        standard_of_care: 'Galactose-restricted diet (lifelong); calcium/vitamin D supplementation',
      },
      {
        name: 'Duarte galactosemia',
        prevalence_pct: 30,
        key_biomarkers: ['GALT enzyme 14-25%', 'D/G compound heterozygote'],
        standard_of_care: 'Dietary restriction in infancy; most liberalize diet by age 1',
      },
    ],
    patient_segments: [
      {
        segment: 'Neonatal presentation',
        description: 'Acute illness in first week; eliminate galactose immediately',
        pct_of_patients: 40,
      },
      {
        segment: 'Chronic management',
        description: 'Long-term diet + monitoring for complications',
        pct_of_patients: 45,
      },
      {
        segment: 'Long-term complications',
        description: 'Ovarian insufficiency, speech/cognitive; supportive care',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'galactose-restricted diet',
      'calcium/vitamin D supplementation',
      'hormone replacement (ovarian failure)',
      'mRNA therapy (investigational)',
      'gene therapy (investigational)',
    ],
    lines_of_therapy: ['Dietary restriction', 'Complication management'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Urea Cycle Disorders',
    subtypes: [
      {
        name: 'OTC deficiency',
        prevalence_pct: 50,
        key_biomarkers: ['ammonia elevated', 'orotic acid elevated', 'OTC gene (X-linked)'],
        standard_of_care:
          'Protein-restricted diet + nitrogen scavenger (sodium phenylbutyrate/glycerol phenylbutyrate)',
      },
      {
        name: 'CPS1 deficiency',
        prevalence_pct: 15,
        key_biomarkers: ['ammonia elevated', 'low citrulline', 'CPS1 gene'],
        standard_of_care: 'Protein restriction + nitrogen scavenger; liver transplant for severe',
      },
      {
        name: 'ASS1 deficiency (citrullinemia)',
        prevalence_pct: 15,
        key_biomarkers: ['citrulline markedly elevated', 'ASS1 gene'],
        standard_of_care: 'Protein restriction + nitrogen scavenger + arginine supplementation',
      },
      {
        name: 'ASL deficiency (argininosuccinic aciduria)',
        prevalence_pct: 10,
        key_biomarkers: ['argininosuccinic acid elevated', 'ASL gene'],
        standard_of_care: 'Protein restriction + nitrogen scavenger + arginine',
      },
      {
        name: 'Other UCD',
        prevalence_pct: 10,
        key_biomarkers: ['ammonia', 'amino acid profile', 'genetic testing'],
        standard_of_care: 'Subtype-specific management',
      },
    ],
    patient_segments: [
      {
        segment: 'Neonatal onset (severe)',
        description: 'Acute hyperammonemia crisis; NICU + dialysis + scavenger',
        pct_of_patients: 30,
      },
      {
        segment: 'Late onset/partial deficiency',
        description: 'Chronic management; diet + scavenger',
        pct_of_patients: 45,
      },
      { segment: 'Transplant candidates', description: 'Liver transplant for recurrent crises', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'nitrogen scavenger (sodium phenylbutyrate)',
      'nitrogen scavenger (glycerol phenylbutyrate)',
      'protein-restricted diet',
      'arginine supplementation',
      'liver transplant',
      'mRNA therapy (investigational)',
      'gene therapy (investigational)',
    ],
    lines_of_therapy: ['Diet + scavenger', 'Acute crisis management', 'Transplant'],
    therapeutic_area: 'metabolic',
  },
  {
    indication: 'Glycogen Storage Disease Type I',
    subtypes: [
      {
        name: 'GSD Ia (glucose-6-phosphatase deficiency)',
        prevalence_pct: 80,
        key_biomarkers: ['G6PC gene', 'lactate elevated', 'uric acid elevated', 'triglycerides elevated'],
        standard_of_care: 'Continuous glucose therapy (cornstarch); avoid fasting; allopurinol for hyperuricemia',
      },
      {
        name: 'GSD Ib (G6P translocase deficiency)',
        prevalence_pct: 20,
        key_biomarkers: ['SLC37A4 gene', 'neutropenia', 'recurrent infections'],
        standard_of_care: 'Cornstarch + empagliflozin (for neutropenia); G-CSF if needed',
      },
    ],
    patient_segments: [
      {
        segment: 'Pediatric (growth/metabolic focus)',
        description: 'Frequent feeds/cornstarch; growth monitoring',
        pct_of_patients: 40,
      },
      {
        segment: 'Adult (complication management)',
        description: 'Hepatic adenoma surveillance; renal monitoring',
        pct_of_patients: 45,
      },
      {
        segment: 'Liver transplant candidates',
        description: 'Multiple adenomas or HCC risk; metabolic correction',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'continuous glucose (uncooked cornstarch)',
      'modified cornstarch (Glycosade)',
      'SGLT2 inhibitor (empagliflozin for GSD Ib neutropenia)',
      'allopurinol (hyperuricemia)',
      'ACEi (renal protection)',
      'gene therapy (investigational)',
      'mRNA therapy (investigational)',
    ],
    lines_of_therapy: ['Dietary management', 'Pharmacological', 'Transplant'],
    therapeutic_area: 'metabolic',
  },

  // ════════════════════════════════════════════════════════════
  // MUSCULOSKELETAL (additional)
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Rheumatoid Arthritis - Refractory',
    subtypes: [
      {
        name: 'Multi-biologic failure',
        prevalence_pct: 60,
        key_biomarkers: ['RF', 'anti-CCP', 'ESR/CRP', 'prior biologic exposure'],
        standard_of_care: 'Rituximab or switch mechanism class; JAK inhibitor if not tried',
      },
      {
        name: 'JAK inhibitor failure',
        prevalence_pct: 40,
        key_biomarkers: ['RF', 'anti-CCP', 'DAS28 elevated'],
        standard_of_care: 'Switch to biologic DMARD (anti-IL-6, rituximab, abatacept); clinical trial',
      },
    ],
    patient_segments: [
      {
        segment: 'TNFi + non-TNFi biologic failure',
        description: 'Consider rituximab, abatacept, or JAKi',
        pct_of_patients: 45,
      },
      {
        segment: 'Pan-biologic + JAKi failure',
        description: 'Clinical trial enrollment; combination strategies',
        pct_of_patients: 30,
      },
      {
        segment: 'Erosive/destructive RA',
        description: 'Aggressive combination; surgical consultation',
        pct_of_patients: 25,
      },
    ],
    mechanisms_of_action: [
      'anti-CD20 (rituximab)',
      'T-cell costimulation blocker (abatacept)',
      'anti-IL-6R (tocilizumab, sarilumab)',
      'JAK inhibitor (tofacitinib, upadacitinib, baricitinib)',
      'anti-TNF (multiple)',
      'bispecific (investigational)',
    ],
    lines_of_therapy: ['3L+', '4L+', 'Combination'],
    therapeutic_area: 'musculoskeletal',
  },
  {
    indication: 'Gout - Refractory',
    subtypes: [
      {
        name: 'Tophaceous gout',
        prevalence_pct: 70,
        key_biomarkers: ['serum urate >6 mg/dL on ULT', 'tophi on exam/imaging', 'DECT'],
        standard_of_care: 'Pegloticase ± immunomodulator (methotrexate) for anti-drug antibody prevention',
      },
      {
        name: 'Non-tophaceous frequent flare',
        prevalence_pct: 30,
        key_biomarkers: ['serum urate >6 on ULT', '≥2 flares/year'],
        standard_of_care: 'Combination ULT (xanthine oxidase inhibitor + uricosuric) or pegloticase',
      },
    ],
    patient_segments: [
      {
        segment: 'Oral ULT maximized',
        description: 'On max allopurinol + uricosuric; still above target',
        pct_of_patients: 40,
      },
      { segment: 'Pegloticase candidates', description: 'Severe tophaceous; biweekly infusion', pct_of_patients: 35 },
      { segment: 'Comorbidity-limited', description: 'CKD/CV disease limiting ULT options', pct_of_patients: 25 },
    ],
    mechanisms_of_action: [
      'PEGylated uricase (pegloticase)',
      'xanthine oxidase inhibitor (allopurinol, febuxostat)',
      'URAT1 inhibitor (lesinurad)',
      'anti-IL-1 (anakinra for flare)',
      'colchicine (flare prophylaxis)',
      'methotrexate (pegloticase immunomodulation)',
    ],
    lines_of_therapy: ['Combination oral ULT', 'Pegloticase', 'Flare management'],
    therapeutic_area: 'musculoskeletal',
  },

  // ════════════════════════════════════════════════════════════
  // METABOLIC - remaining
  // ════════════════════════════════════════════════════════════
  {
    indication: 'Metabolic Dysfunction-Associated Steatohepatitis',
    subtypes: [
      {
        name: 'MASH F0-F1 (no/mild fibrosis)',
        prevalence_pct: 35,
        key_biomarkers: ['NAS ≥4', 'FIB-4 <1.3', 'MRI-PDFF'],
        standard_of_care: 'Lifestyle modification (weight loss ≥7%); GLP-1 RA if obese/diabetic',
      },
      {
        name: 'MASH F2 (significant fibrosis)',
        prevalence_pct: 25,
        key_biomarkers: ['NAS ≥4', 'FIB-4 1.3-2.67', 'liver stiffness 8-12 kPa'],
        standard_of_care: 'Resmetirom (Rezdiffra); GLP-1 RA + lifestyle',
      },
      {
        name: 'MASH F3 (advanced fibrosis)',
        prevalence_pct: 25,
        key_biomarkers: ['NAS ≥4', 'FIB-4 >2.67', 'liver stiffness 12-20 kPa'],
        standard_of_care: 'Resmetirom; clinical trials; GLP-1 RA',
      },
      {
        name: 'MASH F4 (cirrhotic)',
        prevalence_pct: 15,
        key_biomarkers: ['cirrhosis on imaging/biopsy', 'liver stiffness >20 kPa'],
        standard_of_care: 'Cirrhosis management; HCC screening; transplant evaluation; resmetirom (non-decompensated)',
      },
    ],
    patient_segments: [
      {
        segment: 'With type 2 diabetes',
        description: 'GLP-1 RA + resmetirom; pioglitazone option',
        pct_of_patients: 55,
      },
      {
        segment: 'Without diabetes',
        description: 'Lifestyle + resmetirom if F2+; clinical trials',
        pct_of_patients: 30,
      },
      {
        segment: 'Lean MASH',
        description: 'BMI <25; genetic predisposition (PNPLA3); limited treatment options',
        pct_of_patients: 15,
      },
    ],
    mechanisms_of_action: [
      'THR-beta agonist (resmetirom)',
      'GLP-1 RA (semaglutide)',
      'GIP/GLP-1 (tirzepatide)',
      'FXR agonist (obeticholic acid)',
      'PPAR agonist (pioglitazone, lanifibranor)',
      'anti-fibrotic (investigational)',
      'ASK1 inhibitor (investigational)',
    ],
    lines_of_therapy: ['Lifestyle', '1L pharmacotherapy', '2L combination'],
    therapeutic_area: 'metabolic',
  },
];

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
