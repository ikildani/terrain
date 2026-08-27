// ============================================================
// TERRAIN — Diagnostic Test Volume Database
// src/lib/data/diagnostic-test-volumes.ts
//
// Annual US test volumes, reimbursement rates, and growth data
// for high-volume IVD and molecular diagnostic tests.
//
// Sources: CMS CLFS 2025, IQVIA diagnostics data, published
// market reports, company 10-K filings, CAP survey data.
// ============================================================

export interface DiagnosticTestVolume {
  test_name: string;
  test_type:
    | 'NGS'
    | 'IHC'
    | 'FISH'
    | 'PCR'
    | 'liquid_biopsy'
    | 'immunoassay'
    | 'chemistry'
    | 'hematology'
    | 'molecular'
    | 'cytogenetics';
  category:
    | 'oncology'
    | 'prenatal'
    | 'infectious_disease'
    | 'cardiovascular'
    | 'metabolic'
    | 'autoimmune'
    | 'pharmacogenomics'
    | 'general';
  annual_us_volume: number;
  volume_source: string;
  avg_reimbursement_usd: number;
  reimbursement_source: string;
  growth_rate_pct: number;
  key_cpt_codes: string[];
  major_providers: string[];
  clinical_context: string;
  estimated_as_of: string;
}

export const DIAGNOSTIC_TEST_VOLUMES: DiagnosticTestVolume[] = [
  // ──────────────────────────────────────────────────────────
  // ONCOLOGY MOLECULAR DIAGNOSTICS
  // ──────────────────────────────────────────────────────────
  {
    test_name: 'Comprehensive Genomic Profiling (CGP) — Tissue',
    test_type: 'NGS',
    category: 'oncology',
    annual_us_volume: 850000,
    volume_source: 'Foundation Medicine 10-K 2024; Tempus investor data; market estimates',
    avg_reimbursement_usd: 2919,
    reimbursement_source: 'CMS CLFS 2025 — CPT 81455',
    growth_rate_pct: 15.0,
    key_cpt_codes: ['81455', '81456'],
    major_providers: ['Foundation Medicine (Roche)', 'Tempus AI', 'Caris Life Sciences', 'NeoGenomics'],
    clinical_context:
      'Pan-cancer solid tumor profiling. Standard of care in advanced NSCLC, breast, CRC. NCD 90.2 covers for advanced cancer.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'Liquid Biopsy — ctDNA',
    test_type: 'liquid_biopsy',
    category: 'oncology',
    annual_us_volume: 450000,
    volume_source: 'Guardant Health 10-K 2024; market estimates',
    avg_reimbursement_usd: 3500,
    reimbursement_source: 'Guardant360 CDx — PLA 0239U; CMS CLFS 2025',
    growth_rate_pct: 25.0,
    key_cpt_codes: ['0239U', '81479'],
    major_providers: [
      'Guardant Health',
      'Foundation Medicine (FoundationOne Liquid CDx)',
      'Tempus',
      'Natera (Signatera)',
    ],
    clinical_context:
      'Rising rapidly for therapy selection when tissue unavailable and for MRD monitoring. Signatera MRD monitoring fastest-growing segment.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'PD-L1 IHC Testing',
    test_type: 'IHC',
    category: 'oncology',
    annual_us_volume: 1200000,
    volume_source: 'CAP survey data; Agilent/Dako investor presentations',
    avg_reimbursement_usd: 88,
    reimbursement_source: 'CMS CLFS 2025 — CPT 88342',
    growth_rate_pct: 8.0,
    key_cpt_codes: ['88342', '88341'],
    major_providers: ['Agilent/Dako (22C3, 28-8)', 'Ventana/Roche (SP263, SP142)', 'Reference labs'],
    clinical_context:
      'Required before pembrolizumab/atezolizumab in multiple tumor types. Four different antibody clones with different scoring systems.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'HER2 Testing (IHC + FISH)',
    test_type: 'IHC',
    category: 'oncology',
    annual_us_volume: 500000,
    volume_source: 'ASCO/CAP guidelines; breast cancer incidence data',
    avg_reimbursement_usd: 175,
    reimbursement_source: 'CMS CLFS 2025 — CPT 88342 (IHC) + 88377 (FISH)',
    growth_rate_pct: 5.0,
    key_cpt_codes: ['88342', '88377'],
    major_providers: ['Agilent/Dako', 'Ventana/Roche', 'Reference labs (Quest, LabCorp)'],
    clinical_context:
      'Standard of care in breast and gastric cancer. HER2-low category (IHC 1+/2+ FISH-) now therapeutically relevant with T-DXd (Enhertu).',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'BRCA1/2 Germline Testing',
    test_type: 'molecular',
    category: 'oncology',
    annual_us_volume: 600000,
    volume_source: 'Myriad Genetics 10-K 2024; market estimates',
    avg_reimbursement_usd: 1731,
    reimbursement_source: 'CMS CLFS 2025 — CPT 81162 (full sequence + del/dup)',
    growth_rate_pct: 10.0,
    key_cpt_codes: ['81162', '81163', '81164', '81165'],
    major_providers: ['Myriad Genetics (myRisk)', 'Invitae', 'Ambry Genetics', 'Color Health', 'GeneDx'],
    clinical_context:
      'Guideline-recommended for all breast, ovarian, pancreatic, prostate cancer patients. Expanding to universal screening proposals.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'KRAS/NRAS/BRAF Mutation Testing',
    test_type: 'PCR',
    category: 'oncology',
    annual_us_volume: 350000,
    volume_source: 'NCCN guideline adherence estimates; CRC/NSCLC incidence',
    avg_reimbursement_usd: 252,
    reimbursement_source: 'CMS CLFS 2025 — CPT 81210 (BRAF), 81275 (KRAS)',
    growth_rate_pct: 12.0,
    key_cpt_codes: ['81210', '81275', '81311'],
    major_providers: ['Quest Diagnostics', 'LabCorp', 'Foundation Medicine', 'NeoGenomics'],
    clinical_context:
      'Required before anti-EGFR therapy in CRC. KRAS G12C testing essential for sotorasib/adagrasib in NSCLC. Increasingly replaced by CGP panels.',
    estimated_as_of: '2025-06',
  },

  // ──────────────────────────────────────────────────────────
  // PRENATAL / REPRODUCTIVE
  // ──────────────────────────────────────────────────────────
  {
    test_name: 'Non-Invasive Prenatal Testing (NIPT)',
    test_type: 'molecular',
    category: 'prenatal',
    annual_us_volume: 2500000,
    volume_source: 'Natera 10-K 2024; Illumina; Roche; market estimates',
    avg_reimbursement_usd: 800,
    reimbursement_source: 'Commercial payer avg; CMS varies by code',
    growth_rate_pct: 12.0,
    key_cpt_codes: ['81420', '81507', '0060U'],
    major_providers: ['Natera (Panorama)', 'Illumina/Verinata (verifi)', 'Roche (Harmony)', 'Labcorp (MaterniT)'],
    clinical_context:
      'ACOG recommends offering to all pregnant patients regardless of age/risk. Screening for T21, T18, T13, sex chromosome aneuploidies.',
    estimated_as_of: '2025-06',
  },

  // ──────────────────────────────────────────────────────────
  // INFECTIOUS DISEASE
  // ──────────────────────────────────────────────────────────
  {
    test_name: 'COVID/Flu/RSV Multiplex PCR',
    test_type: 'PCR',
    category: 'infectious_disease',
    annual_us_volume: 15000000,
    volume_source: 'CDC surveillance; Abbott/Cepheid investor data',
    avg_reimbursement_usd: 142,
    reimbursement_source: 'CMS CLFS 2025 — CPT 87636 (SARS-CoV-2 + influenza)',
    growth_rate_pct: -10.0,
    key_cpt_codes: ['87636', '87637', '87426'],
    major_providers: [
      'Abbott (ID NOW, Alinity)',
      'Cepheid (Xpert Xpress)',
      'Roche (cobas)',
      'BioFire/bioMérieux (FilmArray)',
    ],
    clinical_context:
      'Post-pandemic normalization. Multiplex panels replacing single-pathogen tests. Point-of-care testing growing.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'HPV Testing',
    test_type: 'molecular',
    category: 'infectious_disease',
    annual_us_volume: 40000000,
    volume_source: 'USPSTF screening guidelines; cervical cancer screening volumes',
    avg_reimbursement_usd: 42,
    reimbursement_source: 'CMS CLFS 2025 — CPT 87624 (HR HPV)',
    growth_rate_pct: 3.0,
    key_cpt_codes: ['87624', '87625'],
    major_providers: ['Roche (cobas HPV)', 'Hologic (Aptima HPV)', 'BD (Onclarity)'],
    clinical_context:
      'Primary cervical cancer screening every 5 years for ages 25-65. HPV self-collection approved by FDA 2024.',
    estimated_as_of: '2025-06',
  },

  // ──────────────────────────────────────────────────────────
  // CARDIOVASCULAR / METABOLIC
  // ──────────────────────────────────────────────────────────
  {
    test_name: 'High-Sensitivity Troponin',
    test_type: 'immunoassay',
    category: 'cardiovascular',
    annual_us_volume: 80000000,
    volume_source: 'Hospital ED volume estimates; ACC/AHA guidelines',
    avg_reimbursement_usd: 18,
    reimbursement_source: 'CMS CLFS 2025 — CPT 84484',
    growth_rate_pct: 5.0,
    key_cpt_codes: ['84484'],
    major_providers: [
      'Abbott (ARCHITECT hs-cTnI)',
      'Roche (Elecsys hs-cTnT)',
      'Siemens (Atellica hs-TnI)',
      'Beckman Coulter (Access hs-TnI)',
    ],
    clinical_context:
      'Universal in ED chest pain workup. High-sensitivity assays now standard — enable rapid rule-out protocols (0/1h or 0/3h algorithms).',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'HbA1c',
    test_type: 'chemistry',
    category: 'metabolic',
    annual_us_volume: 60000000,
    volume_source: 'ADA screening guidelines; diabetes prevalence; CMS claims',
    avg_reimbursement_usd: 13,
    reimbursement_source: 'CMS CLFS 2025 — CPT 83036',
    growth_rate_pct: 4.0,
    key_cpt_codes: ['83036'],
    major_providers: ['Roche', 'Abbott', 'Siemens', 'Bio-Rad', 'Tosoh (HPLC reference)'],
    clinical_context:
      'Standard diabetes screening and monitoring. ADA recommends testing 2-4x/year for diabetic patients. 38M US adults with diabetes.',
    estimated_as_of: '2025-06',
  },
  {
    test_name: 'PSA (Prostate-Specific Antigen)',
    test_type: 'immunoassay',
    category: 'oncology',
    annual_us_volume: 30000000,
    volume_source: 'USPSTF guidelines; AUA data; CMS claims 2024',
    avg_reimbursement_usd: 25,
    reimbursement_source: 'CMS CLFS 2025 — CPT 84153',
    growth_rate_pct: 2.0,
    key_cpt_codes: ['84153'],
    major_providers: ['Roche', 'Abbott', 'Siemens', 'Beckman Coulter'],
    clinical_context:
      'Shared decision-making recommended for men 55-69. Stockholm3 and 4Kscore reflex tests reducing unnecessary biopsies.',
    estimated_as_of: '2025-06',
  },

  // ──────────────────────────────────────────────────────────
  // PHARMACOGENOMICS
  // ──────────────────────────────────────────────────────────
  {
    test_name: 'Pharmacogenomic Panel (PGx)',
    test_type: 'molecular',
    category: 'pharmacogenomics',
    annual_us_volume: 3000000,
    volume_source: 'OneOme, Myriad (GeneSight), Tempus estimates',
    avg_reimbursement_usd: 600,
    reimbursement_source: 'PLA codes; commercial payer avg',
    growth_rate_pct: 20.0,
    key_cpt_codes: ['81225', '81226', '81227', '81231', '0029U'],
    major_providers: ['Myriad (GeneSight)', 'OneOme (RightMed)', 'Tempus', 'Color Health', 'Genomind'],
    clinical_context:
      'Growing rapidly for psychiatry (antidepressant selection) and cardiology (clopidogrel/CYP2C19). CPIC guidelines driving adoption.',
    estimated_as_of: '2025-06',
  },
];

// ────────────────────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────────────────────

export function getTestVolumeByCategory(category: DiagnosticTestVolume['category']): DiagnosticTestVolume[] {
  return DIAGNOSTIC_TEST_VOLUMES.filter((t) => t.category === category);
}

export function getTestVolumeByType(testType: DiagnosticTestVolume['test_type']): DiagnosticTestVolume[] {
  return DIAGNOSTIC_TEST_VOLUMES.filter((t) => t.test_type === testType);
}

export function getTotalMarketSize(): number {
  return DIAGNOSTIC_TEST_VOLUMES.reduce((sum, t) => sum + t.annual_us_volume * t.avg_reimbursement_usd, 0);
}
