// ============================================================
// TERRAIN — Biosimilars Database
// lib/data/biosimilars-database.ts
//
// Approved biosimilars, pipeline, LOE calendar, and key companies.
// Sources: FDA Purple Book, EMA, SEC filings, company reports (2023-2026)
// ============================================================

export interface ApprovedBiosimilar {
  brand_name: string;
  reference_product: string;
  company: string;
  us_approval_date: string;
  eu_approval_date?: string;
  indications: string[];
  launch_status: 'Launched' | 'Approved Not Launched' | 'Withdrawn';
  discount_vs_reference_pct: number; // estimated
  interchangeable: boolean;
}

export interface PipelineBiosimilar {
  company: string;
  reference_product: string;
  reference_revenue_usd_b: number;
  phase: 'BLA Filed' | 'Phase 3' | 'Phase 1' | 'Preclinical';
  expected_filing_year: number;
  notes?: string;
}

export interface BiologicLOE {
  product: string;
  company: string;
  us_patent_expiry: string;
  us_revenue_at_risk_usd_b: number;
  global_revenue_usd_b: number;
  indications: string[];
  biosimilar_entrants: number; // approved or filed
}

export interface BiosimilarCompany {
  company: string;
  headquarters: string;
  approved_biosimilars: number;
  pipeline_count: number;
  focus_areas: string[];
  notable_products: string[];
}

// ────────────────────────────────────────────────────────────
// APPROVED BIOSIMILARS (US)
// Source: FDA Purple Book, company announcements (as of mid-2026)
// ────────────────────────────────────────────────────────────

export const APPROVED_BIOSIMILARS: ApprovedBiosimilar[] = [
  // --- Adalimumab (Humira) biosimilars ---
  {
    brand_name: 'Hadlima',
    reference_product: 'Humira',
    company: 'Samsung Bioepis / Organon',
    us_approval_date: '2019-07',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 85,
    interchangeable: false,
  },
  {
    brand_name: 'Hyrimoz',
    reference_product: 'Humira',
    company: 'Sandoz',
    us_approval_date: '2018-10',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 81,
    interchangeable: false,
  },
  {
    brand_name: 'Cyltezo',
    reference_product: 'Humira',
    company: 'Boehringer Ingelheim',
    us_approval_date: '2017-08',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 80,
    interchangeable: true,
  },
  {
    brand_name: 'Amjevita',
    reference_product: 'Humira',
    company: 'Amgen',
    us_approval_date: '2016-09',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 55,
    interchangeable: false,
  },
  {
    brand_name: 'Yusimry',
    reference_product: 'Humira',
    company: 'Coherus BioSciences',
    us_approval_date: '2021-12',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 80,
    interchangeable: false,
  },
  {
    brand_name: 'Idacio',
    reference_product: 'Humira',
    company: 'Fresenius Kabi',
    us_approval_date: '2023-04',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 78,
    interchangeable: false,
  },
  {
    brand_name: 'Yuflyma',
    reference_product: 'Humira',
    company: 'Celltrion',
    us_approval_date: '2023-03',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 75,
    interchangeable: false,
  },
  {
    brand_name: 'Simlandi',
    reference_product: 'Humira',
    company: 'Teva',
    us_approval_date: '2024-03',
    indications: ['RA', 'JIA', 'PsA', 'AS', 'CD', 'UC', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 80,
    interchangeable: true,
  },

  // --- Bevacizumab (Avastin) biosimilars ---
  {
    brand_name: 'Mvasi',
    reference_product: 'Avastin',
    company: 'Amgen',
    us_approval_date: '2017-09',
    indications: ['mCRC', 'NSCLC', 'GBM', 'mRCC', 'Cervical Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 23,
    interchangeable: false,
  },
  {
    brand_name: 'Zirabev',
    reference_product: 'Avastin',
    company: 'Pfizer',
    us_approval_date: '2019-06',
    indications: ['mCRC', 'NSCLC', 'GBM', 'mRCC', 'Cervical Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 23,
    interchangeable: false,
  },
  {
    brand_name: 'Alymsys',
    reference_product: 'Avastin',
    company: 'Amneal',
    us_approval_date: '2022-04',
    indications: ['mCRC', 'NSCLC', 'GBM', 'mRCC'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },
  {
    brand_name: 'Vegzelma',
    reference_product: 'Avastin',
    company: 'Celltrion',
    us_approval_date: '2024-09',
    indications: ['mCRC', 'NSCLC', 'GBM', 'mRCC', 'Cervical Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },

  // --- Trastuzumab (Herceptin) biosimilars ---
  {
    brand_name: 'Ogivri',
    reference_product: 'Herceptin',
    company: 'Mylan / Biocon',
    us_approval_date: '2017-12',
    indications: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Herzuma',
    reference_product: 'Herceptin',
    company: 'Celltrion',
    us_approval_date: '2018-12',
    indications: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 20,
    interchangeable: false,
  },
  {
    brand_name: 'Ontruzant',
    reference_product: 'Herceptin',
    company: 'Samsung Bioepis / Organon',
    us_approval_date: '2019-01',
    indications: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Trazimera',
    reference_product: 'Herceptin',
    company: 'Pfizer',
    us_approval_date: '2019-03',
    indications: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Kanjinti',
    reference_product: 'Herceptin',
    company: 'Amgen',
    us_approval_date: '2019-06',
    indications: ['HER2+ Breast Cancer', 'HER2+ Gastric Cancer'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },

  // --- Rituximab (Rituxan) biosimilars ---
  {
    brand_name: 'Truxima',
    reference_product: 'Rituxan',
    company: 'Celltrion',
    us_approval_date: '2018-11',
    indications: ['NHL', 'CLL', 'RA', 'GPA', 'MPA'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Ruxience',
    reference_product: 'Rituxan',
    company: 'Pfizer',
    us_approval_date: '2019-07',
    indications: ['NHL', 'CLL', 'RA', 'GPA', 'MPA'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 20,
    interchangeable: false,
  },
  {
    brand_name: 'Riabni',
    reference_product: 'Rituxan',
    company: 'Amgen',
    us_approval_date: '2020-12',
    indications: ['NHL', 'CLL', 'RA', 'GPA', 'MPA'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 25,
    interchangeable: false,
  },

  // --- Infliximab (Remicade) biosimilars ---
  {
    brand_name: 'Inflectra',
    reference_product: 'Remicade',
    company: 'Celltrion / Pfizer',
    us_approval_date: '2016-04',
    indications: ['CD', 'UC', 'RA', 'AS', 'PsA', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },
  {
    brand_name: 'Renflexis',
    reference_product: 'Remicade',
    company: 'Samsung Bioepis / Organon',
    us_approval_date: '2017-04',
    indications: ['CD', 'UC', 'RA', 'AS', 'PsA', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },
  {
    brand_name: 'Avsola',
    reference_product: 'Remicade',
    company: 'Amgen',
    us_approval_date: '2019-12',
    indications: ['CD', 'UC', 'RA', 'AS', 'PsA', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 40,
    interchangeable: true,
  },
  {
    brand_name: 'Zymfentra',
    reference_product: 'Remicade',
    company: 'Celltrion',
    us_approval_date: '2023-10',
    indications: ['UC', 'CD'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 45,
    interchangeable: false,
  },

  // --- Pegfilgrastim (Neulasta) biosimilars ---
  {
    brand_name: 'Fulphila',
    reference_product: 'Neulasta',
    company: 'Mylan / Biocon',
    us_approval_date: '2018-06',
    indications: ['Febrile Neutropenia Prophylaxis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 33,
    interchangeable: false,
  },
  {
    brand_name: 'Udenyca',
    reference_product: 'Neulasta',
    company: 'Coherus BioSciences',
    us_approval_date: '2018-11',
    indications: ['Febrile Neutropenia Prophylaxis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 33,
    interchangeable: false,
  },
  {
    brand_name: 'Ziextenzo',
    reference_product: 'Neulasta',
    company: 'Sandoz',
    us_approval_date: '2019-11',
    indications: ['Febrile Neutropenia Prophylaxis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 33,
    interchangeable: false,
  },
  {
    brand_name: 'Nyvepria',
    reference_product: 'Neulasta',
    company: 'Pfizer',
    us_approval_date: '2020-06',
    indications: ['Febrile Neutropenia Prophylaxis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },
  {
    brand_name: 'Stimufend',
    reference_product: 'Neulasta',
    company: 'Fresenius Kabi',
    us_approval_date: '2022-09',
    indications: ['Febrile Neutropenia Prophylaxis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },

  // --- Ranibizumab (Lucentis) biosimilars ---
  {
    brand_name: 'Byooviz',
    reference_product: 'Lucentis',
    company: 'Samsung Bioepis / Biogen',
    us_approval_date: '2021-09',
    indications: ['wAMD', 'DME', 'DR', 'mCNV'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 40,
    interchangeable: false,
  },
  {
    brand_name: 'Cimerli',
    reference_product: 'Lucentis',
    company: 'Coherus BioSciences',
    us_approval_date: '2022-08',
    indications: ['wAMD', 'DME', 'DR', 'mCNV'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },

  // --- Aflibercept (Eylea) biosimilars ---
  {
    brand_name: 'Yesafili',
    reference_product: 'Eylea',
    company: 'Samsung Bioepis / Biogen',
    us_approval_date: '2024-05',
    indications: ['wAMD', 'DME', 'DR', 'RVO'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },
  {
    brand_name: 'Ahzantive',
    reference_product: 'Eylea',
    company: 'Sandoz',
    us_approval_date: '2024-06',
    indications: ['wAMD', 'DME', 'DR', 'RVO'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },
  {
    brand_name: 'Opuviz',
    reference_product: 'Eylea',
    company: 'Celltrion',
    us_approval_date: '2024-09',
    indications: ['wAMD', 'DME', 'DR', 'RVO'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 35,
    interchangeable: false,
  },
  {
    brand_name: 'Pavblu',
    reference_product: 'Eylea',
    company: 'Pfizer',
    us_approval_date: '2024-06',
    indications: ['wAMD', 'DME', 'DR', 'RVO'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },

  // --- Denosumab (Prolia/Xgeva) biosimilars ---
  {
    brand_name: 'Jubbonti',
    reference_product: 'Prolia',
    company: 'Samsung Bioepis',
    us_approval_date: '2025-03',
    indications: ['Osteoporosis'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },
  {
    brand_name: 'Wyost',
    reference_product: 'Prolia',
    company: 'Sandoz',
    us_approval_date: '2025-05',
    indications: ['Osteoporosis'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 30,
    interchangeable: false,
  },

  // --- Ustekinumab (Stelara) biosimilars ---
  {
    brand_name: 'Otulfi',
    reference_product: 'Stelara',
    company: 'Samsung Bioepis / Organon',
    us_approval_date: '2025-02',
    indications: ['Plaque Psoriasis', 'PsA', 'CD', 'UC'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 25,
    interchangeable: false,
  },
  {
    brand_name: 'Pyzchiva',
    reference_product: 'Stelara',
    company: 'Sandoz',
    us_approval_date: '2025-02',
    indications: ['Plaque Psoriasis', 'PsA', 'CD', 'UC'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 25,
    interchangeable: false,
  },
  {
    brand_name: 'Selarsdi',
    reference_product: 'Stelara',
    company: 'Celltrion',
    us_approval_date: '2025-03',
    indications: ['Plaque Psoriasis', 'PsA', 'CD', 'UC'],
    launch_status: 'Approved Not Launched',
    discount_vs_reference_pct: 25,
    interchangeable: false,
  },

  // --- Etanercept (Enbrel) biosimilars ---
  {
    brand_name: 'Erelzi',
    reference_product: 'Enbrel',
    company: 'Sandoz',
    us_approval_date: '2016-08',
    indications: ['RA', 'PsA', 'AS', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Eticovo',
    reference_product: 'Enbrel',
    company: 'Samsung Bioepis',
    us_approval_date: '2019-04',
    indications: ['RA', 'PsA', 'AS', 'Plaque Psoriasis'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },

  // --- Filgrastim (Neupogen) biosimilars ---
  {
    brand_name: 'Zarxio',
    reference_product: 'Neupogen',
    company: 'Sandoz',
    us_approval_date: '2015-03',
    indications: ['Neutropenia'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Nivestym',
    reference_product: 'Neupogen',
    company: 'Pfizer',
    us_approval_date: '2018-07',
    indications: ['Neutropenia'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Releuko',
    reference_product: 'Neupogen',
    company: 'Sandoz',
    us_approval_date: '2022-02',
    indications: ['Neutropenia'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 20,
    interchangeable: true,
  },

  // --- Epoetin alfa (Epogen/Procrit) biosimilars ---
  {
    brand_name: 'Retacrit',
    reference_product: 'Epogen',
    company: 'Pfizer',
    us_approval_date: '2018-05',
    indications: ['Anemia of CKD', 'Chemo-Induced Anemia'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },

  // --- Insulin glargine (Lantus) biosimilars ---
  {
    brand_name: 'Basaglar',
    reference_product: 'Lantus',
    company: 'Lilly / Boehringer Ingelheim',
    us_approval_date: '2015-12',
    indications: ['T1D', 'T2D'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 15,
    interchangeable: false,
  },
  {
    brand_name: 'Semglee',
    reference_product: 'Lantus',
    company: 'Mylan / Biocon',
    us_approval_date: '2020-06',
    indications: ['T1D', 'T2D'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 65,
    interchangeable: true,
  },
  {
    brand_name: 'Rezvoglar',
    reference_product: 'Lantus',
    company: 'Lilly',
    us_approval_date: '2021-12',
    indications: ['T1D', 'T2D'],
    launch_status: 'Launched',
    discount_vs_reference_pct: 50,
    interchangeable: true,
  },
];

// ────────────────────────────────────────────────────────────
// BIOLOGIC LOE CALENDAR (2025-2032)
// Source: FDA Orange Book, patent databases, analyst estimates
// ────────────────────────────────────────────────────────────

export const BIOLOGIC_LOE_CALENDAR: BiologicLOE[] = [
  {
    product: 'Stelara (ustekinumab)',
    company: 'Johnson & Johnson',
    us_patent_expiry: '2025-01',
    us_revenue_at_risk_usd_b: 7.0,
    global_revenue_usd_b: 10.9,
    indications: ['Plaque Psoriasis', 'PsA', 'CD', 'UC'],
    biosimilar_entrants: 5,
  },
  {
    product: 'Keytruda (pembrolizumab)',
    company: 'Merck',
    us_patent_expiry: '2028-04',
    us_revenue_at_risk_usd_b: 18.0,
    global_revenue_usd_b: 25.0,
    indications: ['NSCLC', 'Melanoma', 'HNSCC', 'UC', '15+ indications'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Opdivo (nivolumab)',
    company: 'Bristol-Myers Squibb',
    us_patent_expiry: '2028-12',
    us_revenue_at_risk_usd_b: 6.5,
    global_revenue_usd_b: 9.5,
    indications: ['NSCLC', 'Melanoma', 'RCC', 'HCC', 'HNSCC'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Dupixent (dupilumab)',
    company: 'Regeneron / Sanofi',
    us_patent_expiry: '2031-03',
    us_revenue_at_risk_usd_b: 10.0,
    global_revenue_usd_b: 13.0,
    indications: ['Atopic Dermatitis', 'Asthma', 'CRSwNP', 'Prurigo Nodularis'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Eylea (aflibercept)',
    company: 'Regeneron',
    us_patent_expiry: '2025-05',
    us_revenue_at_risk_usd_b: 5.5,
    global_revenue_usd_b: 9.0,
    indications: ['wAMD', 'DME', 'DR', 'RVO'],
    biosimilar_entrants: 5,
  },
  {
    product: 'Entyvio (vedolizumab)',
    company: 'Takeda',
    us_patent_expiry: '2029-08',
    us_revenue_at_risk_usd_b: 3.5,
    global_revenue_usd_b: 5.5,
    indications: ['UC', 'CD'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Skyrizi (risankizumab)',
    company: 'AbbVie',
    us_patent_expiry: '2032-06',
    us_revenue_at_risk_usd_b: 6.0,
    global_revenue_usd_b: 8.0,
    indications: ['Plaque Psoriasis', 'PsA', 'CD', 'UC'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Tremfya (guselkumab)',
    company: 'Johnson & Johnson',
    us_patent_expiry: '2030-09',
    us_revenue_at_risk_usd_b: 2.5,
    global_revenue_usd_b: 3.5,
    indications: ['Plaque Psoriasis', 'PsA'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Prolia/Xgeva (denosumab)',
    company: 'Amgen',
    us_patent_expiry: '2025-02',
    us_revenue_at_risk_usd_b: 4.0,
    global_revenue_usd_b: 6.0,
    indications: ['Osteoporosis', 'Bone Metastases'],
    biosimilar_entrants: 3,
  },
  {
    product: 'Ocrevus (ocrelizumab)',
    company: 'Roche',
    us_patent_expiry: '2028-06',
    us_revenue_at_risk_usd_b: 5.0,
    global_revenue_usd_b: 6.5,
    indications: ['RRMS', 'PPMS'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Hemlibra (emicizumab)',
    company: 'Roche',
    us_patent_expiry: '2030-12',
    us_revenue_at_risk_usd_b: 3.0,
    global_revenue_usd_b: 4.5,
    indications: ['Hemophilia A'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Darzalex (daratumumab)',
    company: 'Johnson & Johnson',
    us_patent_expiry: '2029-05',
    us_revenue_at_risk_usd_b: 7.0,
    global_revenue_usd_b: 10.0,
    indications: ['Multiple Myeloma'],
    biosimilar_entrants: 0,
  },
  {
    product: 'Soliris (eculizumab)',
    company: 'Alexion / AstraZeneca',
    us_patent_expiry: '2027-03',
    us_revenue_at_risk_usd_b: 2.0,
    global_revenue_usd_b: 3.5,
    indications: ['PNH', 'aHUS'],
    biosimilar_entrants: 1,
  },
];

// ────────────────────────────────────────────────────────────
// KEY BIOSIMILAR COMPANIES
// ────────────────────────────────────────────────────────────

export const BIOSIMILAR_COMPANIES: BiosimilarCompany[] = [
  {
    company: 'Sandoz',
    headquarters: 'Basel, Switzerland',
    approved_biosimilars: 12,
    pipeline_count: 15,
    focus_areas: ['Oncology', 'Immunology', 'Ophthalmology', 'Bone Health'],
    notable_products: ['Zarxio', 'Ziextenzo', 'Hyrimoz', 'Ahzantive'],
  },
  {
    company: 'Celltrion',
    headquarters: 'Incheon, South Korea',
    approved_biosimilars: 10,
    pipeline_count: 10,
    focus_areas: ['Oncology', 'Immunology', 'Ophthalmology'],
    notable_products: ['Truxima', 'Herzuma', 'Vegzelma', 'Yuflyma', 'Zymfentra'],
  },
  {
    company: 'Samsung Bioepis',
    headquarters: 'Incheon, South Korea',
    approved_biosimilars: 8,
    pipeline_count: 8,
    focus_areas: ['Oncology', 'Immunology', 'Ophthalmology', 'Bone Health'],
    notable_products: ['Hadlima', 'Ontruzant', 'Byooviz', 'Jubbonti'],
  },
  {
    company: 'Amgen',
    headquarters: 'Thousand Oaks, CA',
    approved_biosimilars: 7,
    pipeline_count: 5,
    focus_areas: ['Oncology', 'Immunology', 'Supportive Care'],
    notable_products: ['Amjevita', 'Mvasi', 'Kanjinti', 'Avsola'],
  },
  {
    company: 'Pfizer',
    headquarters: 'New York, NY',
    approved_biosimilars: 6,
    pipeline_count: 4,
    focus_areas: ['Oncology', 'Immunology', 'Supportive Care', 'Ophthalmology'],
    notable_products: ['Zirabev', 'Trazimera', 'Ruxience', 'Pavblu'],
  },
  {
    company: 'Biocon / Viatris',
    headquarters: 'Bangalore, India',
    approved_biosimilars: 4,
    pipeline_count: 8,
    focus_areas: ['Oncology', 'Immunology', 'Diabetes'],
    notable_products: ['Ogivri', 'Fulphila', 'Semglee'],
  },
  {
    company: 'Fresenius Kabi',
    headquarters: 'Bad Homburg, Germany',
    approved_biosimilars: 4,
    pipeline_count: 5,
    focus_areas: ['Oncology', 'Immunology', 'Supportive Care'],
    notable_products: ['Idacio', 'Stimufend'],
  },
  {
    company: 'Coherus BioSciences',
    headquarters: 'Redwood City, CA',
    approved_biosimilars: 3,
    pipeline_count: 2,
    focus_areas: ['Oncology', 'Immunology', 'Ophthalmology'],
    notable_products: ['Udenyca', 'Yusimry', 'Cimerli'],
  },
  {
    company: 'Teva',
    headquarters: 'Tel Aviv, Israel',
    approved_biosimilars: 2,
    pipeline_count: 5,
    focus_areas: ['Immunology', 'Oncology'],
    notable_products: ['Simlandi'],
  },
  {
    company: 'Organon',
    headquarters: 'Jersey City, NJ',
    approved_biosimilars: 3,
    pipeline_count: 4,
    focus_areas: ['Immunology', 'Oncology', 'Bone Health'],
    notable_products: ['Hadlima', 'Renflexis', 'Otulfi'],
  },
];

// ────────────────────────────────────────────────────────────
// MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const BIOSIMILAR_MARKET = {
  us_market_size_2025_usd_b: 18.0, // estimated
  us_market_size_2030_usd_b: 65.0, // estimated
  global_market_size_2025_usd_b: 42.0,
  cagr_2025_2030_pct: 25.0,
  total_revenue_at_risk_2025_2032_usd_b: 250.0, // biologics losing exclusivity
  avg_discount_vs_reference_pct: 35,
  interchangeable_products_approved: 5,
  source: 'IQVIA, FDA Purple Book, company reports, Evaluate Pharma (2024-2026)',
};
