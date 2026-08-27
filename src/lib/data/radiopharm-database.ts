// ============================================================
// TERRAIN — Radiopharmaceuticals Database
// lib/data/radiopharm-database.ts
//
// Approved products, pipeline, isotope supply, M&A, key companies.
// Sources: FDA, company filings, SNMMI, Nature Reviews (2024-2026)
// ============================================================

export type RadiopharmType = 'Therapeutic' | 'Diagnostic' | 'Theranostic Pair';

export interface ApprovedRadiopharm {
  product_name: string;
  generic_name: string;
  company: string;
  isotope: string;
  type: RadiopharmType;
  target: string;
  indication: string;
  us_approval_date: string;
  annual_us_revenue_usd_m?: number;
  pricing_per_dose_usd?: number;
  source: string;
}

export interface RadiopharmPipeline {
  asset_name: string;
  company: string;
  isotope: string;
  target: string;
  type: RadiopharmType;
  indication: string;
  phase: 'Approved' | 'Phase 3' | 'Phase 2' | 'Phase 1/2' | 'Phase 1' | 'Preclinical';
  diagnostic_pair?: string;
  key_data?: string;
}

export interface IsotopeSupply {
  isotope: string;
  half_life: string;
  primary_use: string;
  key_producers: string[];
  supply_status: 'Adequate' | 'Constrained' | 'Critical Shortage' | 'Emerging';
  estimated_global_demand_doses_per_year: number;
  key_challenge: string;
}

export interface RadiopharmDeal {
  acquirer: string;
  target: string;
  year: number;
  value_usd_b: number;
  key_asset: string;
  rationale: string;
}

// ────────────────────────────────────────────────────────────
// APPROVED RADIOPHARMACEUTICALS
// ────────────────────────────────────────────────────────────

export const APPROVED_RADIOPHARMS: ApprovedRadiopharm[] = [
  // Therapeutic
  {
    product_name: 'Pluvicto',
    generic_name: 'lutetium Lu-177 vipivotide tetraxetan',
    company: 'Novartis',
    isotope: 'Lu-177',
    type: 'Therapeutic',
    target: 'PSMA',
    indication: 'mCRPC (PSMA+)',
    us_approval_date: '2022-03',
    annual_us_revenue_usd_m: 1400,
    pricing_per_dose_usd: 42500,
    source: 'FDA, Novartis 2025 annual report',
  },
  {
    product_name: 'Lutathera',
    generic_name: 'lutetium Lu-177 dotatate',
    company: 'Novartis (AAA)',
    isotope: 'Lu-177',
    type: 'Therapeutic',
    target: 'SSTR',
    indication: 'GEP-NETs (somatostatin receptor+)',
    us_approval_date: '2018-01',
    annual_us_revenue_usd_m: 600,
    pricing_per_dose_usd: 47600,
    source: 'FDA, Novartis reports',
  },
  {
    product_name: 'Xofigo',
    generic_name: 'radium Ra-223 dichloride',
    company: 'Bayer',
    isotope: 'Ra-223',
    type: 'Therapeutic',
    target: 'Bone (calcium mimetic)',
    indication: 'mCRPC with bone metastases',
    us_approval_date: '2013-05',
    annual_us_revenue_usd_m: 400,
    pricing_per_dose_usd: 12000,
    source: 'FDA, Bayer reports',
  },
  {
    product_name: 'Azedra',
    generic_name: 'iobenguane I-131',
    company: 'Progenics (Lantheus)',
    isotope: 'I-131',
    type: 'Therapeutic',
    target: 'Norepinephrine transporter',
    indication: 'Pheochromocytoma/Paraganglioma',
    us_approval_date: '2018-07',
    pricing_per_dose_usd: 137000,
    source: 'FDA, Lantheus reports',
  },
  {
    product_name: 'Zevalin',
    generic_name: 'ibritumomab tiuxetan Y-90',
    company: 'Acrotech',
    isotope: 'Y-90',
    type: 'Therapeutic',
    target: 'CD20',
    indication: 'r/r FL',
    us_approval_date: '2002-02',
    source: 'FDA',
  },

  // Diagnostic (key agents)
  {
    product_name: 'Pylarify',
    generic_name: 'piflufolastat F-18',
    company: 'Lantheus',
    isotope: 'F-18',
    type: 'Diagnostic',
    target: 'PSMA',
    indication: 'PSMA PET imaging for prostate cancer',
    us_approval_date: '2021-05',
    annual_us_revenue_usd_m: 900,
    pricing_per_dose_usd: 4200,
    source: 'FDA, Lantheus 2025 annual report',
  },
  {
    product_name: 'Locametz',
    generic_name: 'gallium Ga-68 gozetotide',
    company: 'Novartis',
    isotope: 'Ga-68',
    type: 'Diagnostic',
    target: 'PSMA',
    indication: 'PSMA PET imaging for prostate cancer',
    us_approval_date: '2022-03',
    pricing_per_dose_usd: 3500,
    source: 'FDA, Novartis reports',
  },
  {
    product_name: 'Detectnet',
    generic_name: 'copper Cu-64 dotatate',
    company: 'RadioMedic',
    isotope: 'Cu-64',
    type: 'Diagnostic',
    target: 'SSTR',
    indication: 'NET localization',
    us_approval_date: '2020-09',
    source: 'FDA',
  },
  {
    product_name: 'Netspot',
    generic_name: 'gallium Ga-68 dotatate',
    company: 'AAA (Novartis)',
    isotope: 'Ga-68',
    type: 'Diagnostic',
    target: 'SSTR',
    indication: 'NET localization',
    us_approval_date: '2016-06',
    source: 'FDA',
  },
];

// ────────────────────────────────────────────────────────────
// PIPELINE (Therapeutic focus)
// ────────────────────────────────────────────────────────────

export const RADIOPHARM_PIPELINE: RadiopharmPipeline[] = [
  // PSMA-targeted
  {
    asset_name: 'PNT2002',
    company: 'POINT Biopharma (Lilly)',
    isotope: 'Lu-177',
    target: 'PSMA',
    type: 'Theranostic Pair',
    indication: 'mCRPC pre-chemo',
    phase: 'Phase 3',
    diagnostic_pair: 'PNT2003 (F-18)',
    key_data: 'SPLASH Phase 3 ongoing',
  },
  {
    asset_name: 'RYZ-101',
    company: 'RayzeBio (BMS)',
    isotope: 'Ac-225',
    target: 'SSTR',
    type: 'Therapeutic',
    indication: 'GEP-NETs, SCLC',
    phase: 'Phase 1/2',
    key_data: 'Ac-225 alpha emitter — potentially more potent than Lu-177',
  },
  {
    asset_name: 'FPI-2265',
    company: 'Fusion Pharmaceuticals (AZ)',
    isotope: 'Ac-225',
    target: 'PSMA',
    type: 'Theranostic Pair',
    indication: 'mCRPC',
    phase: 'Phase 2',
    key_data: 'FUSION trial — Ac-225 vs Lu-177 debate',
  },

  // FAP-targeted (next wave)
  {
    asset_name: 'PNT2004',
    company: 'POINT Biopharma (Lilly)',
    isotope: 'Lu-177',
    target: 'FAP',
    type: 'Theranostic Pair',
    indication: 'Solid tumors (pan-cancer)',
    phase: 'Phase 1',
    key_data: 'FAP is expressed on tumor stroma across cancer types',
  },
  {
    asset_name: 'FAP-2286',
    company: 'Clovis Oncology / ITM',
    isotope: 'Lu-177',
    target: 'FAP',
    type: 'Therapeutic',
    indication: 'Solid tumors',
    phase: 'Phase 1/2',
    key_data: 'Peptide-based FAP targeting',
  },

  // Other targets
  {
    asset_name: 'TLX250-CDx / TLX250',
    company: 'Telix Pharmaceuticals',
    isotope: 'Zr-89 / Lu-177',
    target: 'CA9',
    type: 'Theranostic Pair',
    indication: 'Clear Cell Renal Cell Carcinoma',
    phase: 'Phase 3',
    diagnostic_pair: 'TLX250-CDx (Zr-89)',
    key_data: 'ZIRCON Phase 3 — imaging completed, therapy in Phase 2',
  },
  {
    asset_name: 'CLR 131',
    company: 'Cellectar Biosciences',
    isotope: 'I-131',
    target: 'Phospholipid ether',
    indication: 'r/r DLBCL, Multiple Myeloma',
    phase: 'Phase 2',
    type: 'Therapeutic',
  },
  {
    asset_name: '225Ac-DOTA-TOC',
    company: 'ITM Isotope Technologies',
    isotope: 'Ac-225',
    target: 'SSTR',
    type: 'Therapeutic',
    indication: 'GEP-NETs (Ac-225 upgrade from Lu-177)',
    phase: 'Phase 1/2',
    key_data: 'Next-gen alpha therapy for NETs',
  },
  {
    asset_name: 'Iopofosine I-131',
    company: 'Cellectar',
    isotope: 'I-131',
    target: 'Phospholipid ether',
    indication: 'Waldenstrom macroglobulinemia',
    phase: 'Phase 2',
    type: 'Therapeutic',
  },
];

// ────────────────────────────────────────────────────────────
// ISOTOPE SUPPLY
// ────────────────────────────────────────────────────────────

export const ISOTOPE_SUPPLY: IsotopeSupply[] = [
  {
    isotope: 'Lu-177',
    half_life: '6.6 days',
    primary_use: 'Beta therapy (PSMA, SSTR)',
    key_producers: ['ITM Isotope Technologies', 'NorthStar Medical', 'SHINE Technologies', 'Bruce Power (NRU reactor)'],
    supply_status: 'Constrained',
    estimated_global_demand_doses_per_year: 200000,
    key_challenge:
      'Demand growing 30%+ annually; reactor-based production has capacity limits; non-carrier-added (n.c.a.) premium supply limited',
  },
  {
    isotope: 'Ac-225',
    half_life: '10 days',
    primary_use: 'Alpha therapy (next-gen, more potent)',
    key_producers: ['ORNL (Oak Ridge)', 'ITM', 'TRIUMF', 'SHINE Technologies'],
    supply_status: 'Critical Shortage',
    estimated_global_demand_doses_per_year: 5000,
    key_challenge:
      'Global supply supports only ~2,000 patients/year; most from U.S. DOE Th-229 decay; accelerator-based production scaling but years away from commercial supply',
  },
  {
    isotope: 'F-18',
    half_life: '110 minutes',
    primary_use: 'PET diagnostic imaging (FDG, PSMA)',
    key_producers: ['Petnet (Siemens)', 'SOFIE Biosciences', 'Cardinal Health', 'Lantheus'],
    supply_status: 'Adequate',
    estimated_global_demand_doses_per_year: 5000000,
    key_challenge:
      'Short half-life requires proximity to cyclotron; established supply chain for FDG; newer tracers (PSMA) growing',
  },
  {
    isotope: 'Ga-68',
    half_life: '68 minutes',
    primary_use: 'PET diagnostic imaging (SSTR, PSMA)',
    key_producers: ['Generator-based (Ge-68/Ga-68)', 'IRE ELiT', 'Eckert & Ziegler'],
    supply_status: 'Adequate',
    estimated_global_demand_doses_per_year: 500000,
    key_challenge: 'Generator-based — no reactor needed, but limited doses per generator per day',
  },
  {
    isotope: 'I-131',
    half_life: '8 days',
    primary_use: 'Thyroid therapy, targeted radiotherapy',
    key_producers: ['NTP Radioisotopes', 'Nordion', 'POLATOM'],
    supply_status: 'Adequate',
    estimated_global_demand_doses_per_year: 2000000,
    key_challenge: 'Mature supply chain; primarily thyroid cancer; some targeted therapy applications',
  },
  {
    isotope: 'At-211',
    half_life: '7.2 hours',
    primary_use: 'Alpha therapy (emerging)',
    key_producers: ['Duke University', 'U of Washington', 'RIKEN (Japan)'],
    supply_status: 'Emerging',
    estimated_global_demand_doses_per_year: 500,
    key_challenge: 'Only produced at cyclotrons; extremely short half-life limits distribution; early clinical only',
  },
  {
    isotope: 'Ra-223',
    half_life: '11.4 days',
    primary_use: 'Alpha therapy (bone metastases)',
    key_producers: ['Bayer (Algeta legacy)', 'Institute for Energy Technology (Norway)'],
    supply_status: 'Adequate',
    estimated_global_demand_doses_per_year: 100000,
    key_challenge: 'Single approved product (Xofigo); mature supply for current demand',
  },
];

// ────────────────────────────────────────────────────────────
// MAJOR M&A (2021-2026)
// ────────────────────────────────────────────────────────────

export const RADIOPHARM_DEALS: RadiopharmDeal[] = [
  {
    acquirer: 'Novartis',
    target: 'Advanced Accelerator Applications (AAA)',
    year: 2018,
    value_usd_b: 3.9,
    key_asset: 'Lutathera (Lu-177 dotatate)',
    rationale: 'Entry into radioligand therapy; built foundation for Pluvicto',
  },
  {
    acquirer: 'Novartis',
    target: 'Endocyte',
    year: 2018,
    value_usd_b: 2.1,
    key_asset: 'PSMA-617 (became Pluvicto)',
    rationale: 'PSMA-targeted Lu-177 therapy for prostate cancer',
  },
  {
    acquirer: 'Eli Lilly',
    target: 'POINT Biopharma',
    year: 2023,
    value_usd_b: 1.4,
    key_asset: 'PNT2002 (Lu-177 PSMA)',
    rationale: 'Theranostic platform; pre-chemo mCRPC opportunity',
  },
  {
    acquirer: 'Bristol-Myers Squibb',
    target: 'RayzeBio',
    year: 2024,
    value_usd_b: 4.1,
    key_asset: 'RYZ-101 (Ac-225 SSTR)',
    rationale: 'Next-gen Ac-225 alpha therapy; IO + RLT combo potential',
  },
  {
    acquirer: 'AstraZeneca',
    target: 'Fusion Pharmaceuticals',
    year: 2024,
    value_usd_b: 2.4,
    key_asset: 'FPI-2265 (Ac-225 PSMA)',
    rationale: 'Alpha-emitting RLT; PSMA and FAP-targeted programs',
  },
  {
    acquirer: 'Novartis',
    target: 'Mariana Oncology',
    year: 2024,
    value_usd_b: 1.75,
    key_asset: 'Ac-225 next-gen RLT platform',
    rationale: 'Next wave of alpha-emitting radiopharmaceuticals',
  },
];

// ────────────────────────────────────────────────────────────
// MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const RADIOPHARM_MARKET = {
  global_therapeutic_market_2025_usd_b: 5.0,
  global_therapeutic_market_2030_usd_b: 18.0,
  global_diagnostic_market_2025_usd_b: 7.0,
  cagr_therapeutic_2025_2030_pct: 29,
  total_ma_value_2018_2026_usd_b: 15.6,
  pluvicto_peak_sales_consensus_usd_b: 4.0,
  key_growth_drivers: [
    'PSMA prostate cancer expansion',
    'Ac-225 alpha therapy',
    'FAP pan-cancer targeting',
    'Theranostic companion diagnostics',
    'Earlier line-of-therapy expansion',
  ],
  key_constraints: [
    'Ac-225 supply shortage',
    'Radiopharmacy network build-out',
    'Dosimetry expertise requirements',
    'Short half-life logistics',
  ],
  source: 'SNMMI, Nature Reviews Drug Discovery 2025, company reports, EvaluatePharma',
};
