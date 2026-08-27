// ============================================================
// TERRAIN — Cell & Gene Therapy Database
// lib/data/cgt-database.ts
//
// Approved products, pipeline, manufacturing economics, pricing.
// Sources: FDA, EMA, ARM annual reports, company filings (2023-2026)
// ============================================================

export type CGTModality =
  | 'CAR-T'
  | 'Gene Therapy (AAV)'
  | 'Gene Therapy (Lentiviral)'
  | 'Gene Editing (CRISPR)'
  | 'Gene Editing (Base)'
  | 'TCR-T'
  | 'NK Cell'
  | 'iPSC-derived'
  | 'TIL'
  | 'Ex Vivo Gene Therapy'
  | 'In Vivo Gene Therapy'
  | 'mRNA Therapy';

export interface ApprovedCGT {
  product_name: string;
  generic_name: string;
  company: string;
  modality: CGTModality;
  indication: string;
  us_approval_date: string;
  list_price_usd: number;
  autologous: boolean;
  vein_to_vein_days?: number;
  manufacturing_site: string;
  annual_us_patients_treated_est?: number;
  source: string;
}

export interface CGTPipeline {
  asset_name: string;
  company: string;
  modality: CGTModality;
  indication: string;
  phase: 'Approved' | 'BLA Filed' | 'Phase 3' | 'Phase 2' | 'Phase 1/2' | 'Phase 1' | 'Preclinical';
  autologous: boolean;
  key_data?: string;
  nct_id?: string;
  partner?: string;
}

export interface CGTManufacturingBenchmark {
  modality: CGTModality;
  autologous: boolean;
  estimated_cogs_per_dose_usd: [number, number]; // [low, high]
  vein_to_vein_days: [number, number];
  manufacturing_success_rate_pct: number;
  key_challenges: string[];
  source: string;
}

// ────────────────────────────────────────────────────────────
// APPROVED CGT PRODUCTS
// Source: FDA, company reports, ARM (as of mid-2026)
// ────────────────────────────────────────────────────────────

export const APPROVED_CGT_PRODUCTS: ApprovedCGT[] = [
  // CAR-T
  {
    product_name: 'Kymriah',
    generic_name: 'tisagenlecleucel',
    company: 'Novartis',
    modality: 'CAR-T',
    indication: 'r/r B-cell ALL (pediatric/young adult), r/r DLBCL, r/r FL',
    us_approval_date: '2017-08',
    list_price_usd: 475000,
    autologous: true,
    vein_to_vein_days: 22,
    manufacturing_site: 'Morris Plains, NJ',
    annual_us_patients_treated_est: 2500,
    source: 'FDA, Novartis 2025 annual report',
  },
  {
    product_name: 'Yescarta',
    generic_name: 'axicabtagene ciloleucel',
    company: 'Gilead (Kite)',
    modality: 'CAR-T',
    indication: 'r/r LBCL (2L+), r/r FL',
    us_approval_date: '2017-10',
    list_price_usd: 373000,
    autologous: true,
    vein_to_vein_days: 17,
    manufacturing_site: 'El Segundo, CA',
    annual_us_patients_treated_est: 5000,
    source: 'FDA, Gilead 2025 annual report',
  },
  {
    product_name: 'Tecartus',
    generic_name: 'brexucabtagene autoleucel',
    company: 'Gilead (Kite)',
    modality: 'CAR-T',
    indication: 'r/r MCL, r/r B-ALL (adult)',
    us_approval_date: '2020-07',
    list_price_usd: 373000,
    autologous: true,
    vein_to_vein_days: 17,
    manufacturing_site: 'El Segundo, CA',
    source: 'FDA, Gilead reports',
  },
  {
    product_name: 'Abecma',
    generic_name: 'idecabtagene vicleucel',
    company: 'BMS (2seventy bio)',
    modality: 'CAR-T',
    indication: 'r/r Multiple Myeloma (4L+)',
    us_approval_date: '2021-03',
    list_price_usd: 419500,
    autologous: true,
    vein_to_vein_days: 30,
    manufacturing_site: 'Summit, NJ',
    source: 'FDA, BMS reports',
  },
  {
    product_name: 'Breyanzi',
    generic_name: 'lisocabtagene maraleucel',
    company: 'BMS',
    modality: 'CAR-T',
    indication: 'r/r LBCL (2L+)',
    us_approval_date: '2021-02',
    list_price_usd: 410300,
    autologous: true,
    vein_to_vein_days: 24,
    manufacturing_site: 'Bothell, WA',
    annual_us_patients_treated_est: 4000,
    source: 'FDA, BMS 2025 annual report',
  },
  {
    product_name: 'Carvykti',
    generic_name: 'ciltacabtagene autoleucel',
    company: 'J&J (Legend Biotech)',
    modality: 'CAR-T',
    indication: 'r/r Multiple Myeloma',
    us_approval_date: '2022-02',
    list_price_usd: 465000,
    autologous: true,
    vein_to_vein_days: 28,
    manufacturing_site: 'Raritan, NJ',
    annual_us_patients_treated_est: 3000,
    source: 'FDA, J&J 2025 annual report',
  },

  // Gene Therapy
  {
    product_name: 'Luxturna',
    generic_name: 'voretigene neparvovec',
    company: 'Spark (Roche)',
    modality: 'Gene Therapy (AAV)',
    indication: 'Inherited Retinal Dystrophy (RPE65)',
    us_approval_date: '2017-12',
    list_price_usd: 850000,
    autologous: false,
    manufacturing_site: 'Philadelphia, PA',
    source: 'FDA, Roche reports',
  },
  {
    product_name: 'Zolgensma',
    generic_name: 'onasemnogene abeparvovec',
    company: 'Novartis',
    modality: 'Gene Therapy (AAV)',
    indication: 'Spinal Muscular Atrophy (SMA, <2 years)',
    us_approval_date: '2019-05',
    list_price_usd: 2125000,
    autologous: false,
    manufacturing_site: 'Libertyville, IL (AveXis)',
    annual_us_patients_treated_est: 500,
    source: 'FDA, Novartis 2025 annual report',
  },
  {
    product_name: 'Hemgenix',
    generic_name: 'etranacogene dezaparvovec',
    company: 'CSL Behring (uniQure)',
    modality: 'Gene Therapy (AAV)',
    indication: 'Hemophilia B',
    us_approval_date: '2022-11',
    list_price_usd: 3500000,
    autologous: false,
    manufacturing_site: 'Lexington, MA (uniQure)',
    source: 'FDA, CSL Behring reports',
  },
  {
    product_name: 'Elevidys',
    generic_name: 'delandistrogene moxeparvovec',
    company: 'Sarepta Therapeutics',
    modality: 'Gene Therapy (AAV)',
    indication: 'Duchenne Muscular Dystrophy',
    us_approval_date: '2023-06',
    list_price_usd: 3200000,
    autologous: false,
    manufacturing_site: 'Andover, MA',
    source: 'FDA, Sarepta reports',
  },
  {
    product_name: 'Roctavian',
    generic_name: 'valoctocogene roxaparvovec',
    company: 'BioMarin',
    modality: 'Gene Therapy (AAV)',
    indication: 'Hemophilia A',
    us_approval_date: '2023-06',
    list_price_usd: 2900000,
    autologous: false,
    manufacturing_site: 'Novato, CA',
    source: 'FDA, BioMarin reports',
  },

  // Gene Editing
  {
    product_name: 'Casgevy',
    generic_name: 'exagamglogene autotemcel',
    company: 'Vertex / CRISPR Therapeutics',
    modality: 'Gene Editing (CRISPR)',
    indication: 'Sickle Cell Disease, Transfusion-Dependent Beta-Thalassemia',
    us_approval_date: '2023-12',
    list_price_usd: 2200000,
    autologous: true,
    vein_to_vein_days: 60,
    manufacturing_site: 'Boston, MA (Vertex)',
    source: 'FDA, Vertex 2025 annual report',
  },
  {
    product_name: 'Lyfgenia',
    generic_name: 'lovotibeglogene autotemcel',
    company: 'bluebird bio',
    modality: 'Ex Vivo Gene Therapy',
    indication: 'Sickle Cell Disease',
    us_approval_date: '2023-12',
    list_price_usd: 3100000,
    autologous: true,
    vein_to_vein_days: 45,
    manufacturing_site: 'Durham, NC',
    source: 'FDA, bluebird bio reports',
  },
  {
    product_name: 'Skysona',
    generic_name: 'elivaldogene autotemcel',
    company: 'bluebird bio',
    modality: 'Ex Vivo Gene Therapy',
    indication: 'Cerebral Adrenoleukodystrophy (cALD)',
    us_approval_date: '2022-09',
    list_price_usd: 3000000,
    autologous: true,
    manufacturing_site: 'Durham, NC',
    source: 'FDA, bluebird bio reports',
  },

  // Other
  {
    product_name: 'Adstiladrin',
    generic_name: 'nadofaragene firadenovec',
    company: 'Ferring',
    modality: 'In Vivo Gene Therapy',
    indication: 'BCG-Unresponsive Non-Muscle Invasive Bladder Cancer',
    us_approval_date: '2022-12',
    list_price_usd: 238000,
    autologous: false,
    manufacturing_site: 'San Diego, CA',
    source: 'FDA, Ferring reports',
  },
];

// ────────────────────────────────────────────────────────────
// MANUFACTURING ECONOMICS
// Source: ARM, Nature Reviews Drug Discovery, McKinsey CGT analysis
// ────────────────────────────────────────────────────────────

export const CGT_MANUFACTURING_BENCHMARKS: CGTManufacturingBenchmark[] = [
  {
    modality: 'CAR-T',
    autologous: true,
    estimated_cogs_per_dose_usd: [50000, 100000],
    vein_to_vein_days: [14, 35],
    manufacturing_success_rate_pct: 92,
    key_challenges: [
      'Patient-specific manufacturing',
      'Apheresis logistics',
      'Manufacturing failures (~8%)',
      'Short shelf life',
    ],
    source: 'ARM 2025, McKinsey CGT analysis',
  },
  {
    modality: 'CAR-T',
    autologous: false,
    estimated_cogs_per_dose_usd: [15000, 40000],
    vein_to_vein_days: [1, 5],
    manufacturing_success_rate_pct: 98,
    key_challenges: ['GvHD risk', 'Persistence uncertainty', 'Gene editing for HLA knockout'],
    source: 'ARM 2025 estimates',
  },
  {
    modality: 'Gene Therapy (AAV)',
    autologous: false,
    estimated_cogs_per_dose_usd: [100000, 500000],
    vein_to_vein_days: [1, 3],
    manufacturing_success_rate_pct: 95,
    key_challenges: [
      'AAV scalability',
      'Empty/full capsid separation',
      'High-dose manufacturing',
      'Pre-existing immunity',
    ],
    source: 'Nature Reviews Drug Discovery 2024',
  },
  {
    modality: 'Gene Editing (CRISPR)',
    autologous: true,
    estimated_cogs_per_dose_usd: [75000, 150000],
    vein_to_vein_days: [30, 90],
    manufacturing_success_rate_pct: 90,
    key_challenges: [
      'Ex vivo editing efficiency',
      'Myeloablative conditioning',
      'Long manufacturing time',
      'Engraftment monitoring',
    ],
    source: 'Vertex/CRISPR disclosures, ARM 2025',
  },
  {
    modality: 'TIL',
    autologous: true,
    estimated_cogs_per_dose_usd: [80000, 150000],
    vein_to_vein_days: [22, 35],
    manufacturing_success_rate_pct: 85,
    key_challenges: [
      'Tumor biopsy required',
      'TIL expansion variability',
      'IL-2 conditioning',
      'Manufacturing complexity',
    ],
    source: 'Iovance disclosures, FDA briefing documents',
  },
  {
    modality: 'NK Cell',
    autologous: false,
    estimated_cogs_per_dose_usd: [20000, 60000],
    vein_to_vein_days: [1, 7],
    manufacturing_success_rate_pct: 95,
    key_challenges: ['Persistence in vivo', 'Expansion at scale', 'Cryopreservation stability'],
    source: 'Industry estimates',
  },
];

// ────────────────────────────────────────────────────────────
// CGT MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const CGT_MARKET = {
  global_market_size_2025_usd_b: 15.0,
  global_market_size_2030_usd_b: 50.0,
  cagr_2025_2030_pct: 27.0,
  approved_products_worldwide: 25,
  active_ind_applications: 3500,
  avg_list_price_gene_therapy_usd: 2500000,
  avg_list_price_car_t_usd: 430000,
  outcomes_based_contracts_pct: 40,
  source: 'ARM Annual Report 2025, MIT NEWDIGS, FDA OTAT, EvaluatePharma',
};
