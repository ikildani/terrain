// ============================================================
// TERRAIN — Drug Delivery Platforms Database
// lib/data/drug-delivery-database.ts
//
// Platform technologies, key companies, deal economics.
// Sources: Company filings, Nature Reviews Drug Delivery, SEC (2024-2026)
// ============================================================

export type DeliveryTechnology =
  | 'LNP'
  | 'GalNAc'
  | 'Liposomal'
  | 'Depot/LAI'
  | 'Transdermal'
  | 'Implant'
  | 'Polymer Conjugate'
  | 'Nanoparticle'
  | 'Exosome'
  | 'Oral Peptide'
  | 'Inhaled'
  | 'Ocular'
  | 'ENHANZE (hyaluronidase)';

export interface DrugDeliveryPlatform {
  company: string;
  technology: DeliveryTechnology;
  platform_name: string;
  therapeutic_applications: string[];
  stage: 'Commercialized' | 'Phase 3' | 'Phase 2' | 'Phase 1' | 'Preclinical';
  key_products: string[];
  notable_deals: { partner: string; value_usd_m?: number; year: number; asset: string }[];
  competitive_advantage: string;
  source: string;
}

// ────────────────────────────────────────────────────────────
// DRUG DELIVERY PLATFORMS
// ────────────────────────────────────────────────────────────

export const DRUG_DELIVERY_PLATFORMS: DrugDeliveryPlatform[] = [
  // ── LNP / Lipid Nanoparticles ──
  {
    company: 'Moderna',
    technology: 'LNP',
    platform_name: 'Proprietary LNP (mRNA delivery)',
    therapeutic_applications: ['Vaccines', 'Oncology (mRNA-based neo-antigens)', 'Rare Disease', 'Autoimmune'],
    stage: 'Commercialized',
    key_products: [
      'Spikevax (COVID-19)',
      'mRNA-1345 (RSV)',
      'INT-1XX (latent HSV)',
      'mRNA-4157/V940 (melanoma, with Merck)',
    ],
    notable_deals: [
      { partner: 'Merck', value_usd_m: 250, year: 2023, asset: 'mRNA-4157 personalized cancer vaccine' },
      { partner: 'Blackstone', value_usd_m: 750, year: 2022, asset: 'Manufacturing JV' },
    ],
    competitive_advantage:
      'Largest mRNA manufacturing footprint; proprietary ionizable lipid chemistry; 100+ programs in clinical development',
    source: 'Moderna annual report 2025',
  },
  {
    company: 'Acuitas Therapeutics',
    technology: 'LNP',
    platform_name: 'Acuitas LNP Technology',
    therapeutic_applications: ['mRNA delivery', 'siRNA delivery', 'Gene editing delivery'],
    stage: 'Commercialized',
    key_products: ['LNP in Pfizer/BioNTech COVID vaccine (Comirnaty)'],
    notable_deals: [
      { partner: 'BioNTech', year: 2020, asset: 'LNP license for COVID vaccine' },
      { partner: 'CureVac', year: 2021, asset: 'LNP license for mRNA programs' },
      { partner: 'Arcturus', year: 2020, asset: 'LNP co-development' },
    ],
    competitive_advantage: 'Most widely licensed LNP technology; used in first mRNA vaccine; extensive IP portfolio',
    source: 'Acuitas website, BioNTech filings',
  },
  {
    company: 'Genevant Sciences',
    technology: 'LNP',
    platform_name: 'Genevant LNP Platform',
    therapeutic_applications: ['mRNA delivery', 'Gene editing'],
    stage: 'Phase 2',
    key_products: ['Licensed to multiple partners'],
    notable_deals: [{ partner: 'Arbutus (parent)', year: 2018, asset: 'LNP IP spinout' }],
    competitive_advantage: 'Deep LNP IP from Arbutus heritage; next-gen ionizable lipids; tissue-targeting LNPs',
    source: 'Genevant website',
  },

  // ── GalNAc Conjugation ──
  {
    company: 'Alnylam Pharmaceuticals',
    technology: 'GalNAc',
    platform_name: 'Enhanced Stabilization Chemistry (ESC) GalNAc',
    therapeutic_applications: ['Liver-targeted siRNA', 'Rare Disease', 'Cardio-metabolic', 'Infectious Disease'],
    stage: 'Commercialized',
    key_products: [
      'Onpattro (patisiran)',
      'Amvuttra (vutrisiran)',
      'Leqvio (inclisiran, licensed to Novartis)',
      'Givlaari (givosiran)',
      'Oxlumo (lumasiran)',
    ],
    notable_deals: [
      { partner: 'Novartis', value_usd_m: 800, year: 2019, asset: 'Inclisiran (Leqvio) — cardiovascular siRNA' },
      {
        partner: 'Regeneron',
        value_usd_m: 1000,
        year: 2019,
        asset: 'RNAi therapeutics co-development (CNS, ocular, liver)',
      },
      { partner: 'Roche', value_usd_m: 310, year: 2022, asset: 'CNS-targeted siRNA' },
    ],
    competitive_advantage:
      'Market leader in RNAi therapeutics; 5 approved products; ESC chemistry enables Q6M-Q12M dosing; dominant liver-targeting IP',
    source: 'Alnylam annual report 2025',
  },
  {
    company: 'Arrowhead Pharmaceuticals',
    technology: 'GalNAc',
    platform_name: 'TRiM (Targeted RNAi Molecule)',
    therapeutic_applications: ['Liver', 'Lung', 'Muscle', 'CNS', 'Tumors'],
    stage: 'Phase 3',
    key_products: ['Plozasiran (APOC3, Phase 3)', 'Zodasiran (ANGPTL3, Phase 2)', 'ARO-HIF2 (ccRCC, Phase 2)'],
    notable_deals: [
      { partner: 'Amgen', value_usd_m: 674, year: 2021, asset: 'Olpasiran (Lp(a)) — now Amgen lead' },
      { partner: 'Johnson & Johnson', value_usd_m: 3700, year: 2020, asset: 'JNJ-3989 (HBV) and JNJ-75220795' },
      { partner: 'Takeda', value_usd_m: 1000, year: 2020, asset: 'Liver disease programs' },
    ],
    competitive_advantage:
      'Beyond-liver targeting (lung, muscle, CNS via novel delivery moieties); multiple large pharma partnerships',
    source: 'Arrowhead annual report 2025',
  },
  {
    company: 'Silence Therapeutics',
    technology: 'GalNAc',
    platform_name: 'mRNAi GOLD Platform',
    therapeutic_applications: ['Liver-targeted siRNA', 'Hematology', 'Cardio-metabolic'],
    stage: 'Phase 2',
    key_products: ['Zerlasiran (PCSK9, Phase 2)', 'Divesiran (TMPRSS6, Phase 2)'],
    notable_deals: [
      { partner: 'AstraZeneca', value_usd_m: 2000, year: 2022, asset: 'CV and renal siRNA programs' },
      { partner: 'Mallinckrodt', year: 2021, asset: 'C3 complement siRNA' },
    ],
    competitive_advantage: 'Proprietary GalNAc-siRNA chemistry; AZ partnership validates platform',
    source: 'Silence Therapeutics reports',
  },

  // ── Depot / Long-Acting Injectables ──
  {
    company: 'Halozyme',
    technology: 'ENHANZE (hyaluronidase)',
    platform_name: 'ENHANZE Technology (rHuPH20)',
    therapeutic_applications: ['SC conversion of IV biologics', 'Faster injection', 'Co-formulation'],
    stage: 'Commercialized',
    key_products: [
      'Herceptin Hylecta (trastuzumab SC)',
      'Darzalex Faspro (daratumumab SC)',
      'Phesgo (pertuzumab+trastuzumab SC)',
      'Hylenex (recombinant hyaluronidase)',
    ],
    notable_deals: [
      { partner: 'Roche', value_usd_m: 190, year: 2006, asset: 'Herceptin SC, Rituxan SC, MabThera SC' },
      { partner: 'J&J', value_usd_m: 50, year: 2014, asset: 'Darzalex Faspro' },
      { partner: 'BMS', value_usd_m: 105, year: 2018, asset: 'Opdivo SC' },
      { partner: 'argenx', value_usd_m: 100, year: 2019, asset: 'Vyvgart SC' },
      { partner: 'Lilly', value_usd_m: 125, year: 2022, asset: 'Undisclosed targets' },
    ],
    competitive_advantage:
      'Most licensed drug delivery platform in biopharma; enables IV-to-SC conversion; proven across 10+ products; $2B+ in royalties',
    source: 'Halozyme annual report 2025',
  },

  // ── Liposomal ──
  {
    company: 'Jazz Pharmaceuticals',
    technology: 'Liposomal',
    platform_name: 'CombiPlex (liposomal encapsulation)',
    therapeutic_applications: ['Oncology', 'Hematology'],
    stage: 'Commercialized',
    key_products: ['Vyxeos (daunorubicin + cytarabine liposomal)', 'Rylaze (asparaginase)'],
    notable_deals: [],
    competitive_advantage: 'Fixed-ratio drug encapsulation; improved PK/PD profile vs. free drugs',
    source: 'Jazz annual report',
  },
  {
    company: 'Pacira BioSciences',
    technology: 'Liposomal',
    platform_name: 'DepoFoam Technology',
    therapeutic_applications: ['Pain management', 'Surgery'],
    stage: 'Commercialized',
    key_products: ['Exparel (bupivacaine liposomal)', 'DepoCyt'],
    notable_deals: [],
    competitive_advantage: 'Extended-release local anesthetic; avoids opioids; multivesicular liposomal technology',
    source: 'Pacira annual report',
  },

  // ── Oral Peptide Delivery ──
  {
    company: 'Novo Nordisk',
    technology: 'Oral Peptide',
    platform_name: 'SNAC (salcaprozate sodium) co-formulation',
    therapeutic_applications: ['GLP-1 oral delivery', 'Peptide oral delivery'],
    stage: 'Commercialized',
    key_products: ['Rybelsus (oral semaglutide)'],
    notable_deals: [{ partner: 'Emisphere (acquired)', year: 2020, asset: 'SNAC technology platform' }],
    competitive_advantage:
      'Only approved oral GLP-1; SNAC enhances gastric absorption of peptides; competitive moat for oral semaglutide franchise',
    source: 'Novo Nordisk reports',
  },

  // ── Polymer Conjugate ──
  {
    company: 'Nektar Therapeutics',
    technology: 'Polymer Conjugate',
    platform_name: 'PEGylation / Polymer Conjugation',
    therapeutic_applications: ['Extended half-life', 'Improved PK', 'Reduced immunogenicity'],
    stage: 'Commercialized',
    key_products: ['PEGylated technologies in multiple approved drugs (Movantik, Adynovate)'],
    notable_deals: [
      { partner: 'BMS', value_usd_m: 3600, year: 2018, asset: 'Bempegaldesleukin (failed Phase 3 — deal collapsed)' },
    ],
    competitive_advantage: 'Pioneer of PEGylation; broad IP; technology used in 15+ approved products across partners',
    source: 'Nektar reports, FDA',
  },

  // ── Inhaled Delivery ──
  {
    company: 'Civitas Therapeutics (Acorda)',
    technology: 'Inhaled',
    platform_name: 'ARCUS Inhaled Delivery',
    therapeutic_applications: ["CNS (Parkinson's rapid onset)", 'Pulmonary'],
    stage: 'Commercialized',
    key_products: ["Inbrija (inhaled levodopa for Parkinson's OFF episodes)"],
    notable_deals: [],
    competitive_advantage: 'Pulmonary delivery for rapid systemic absorption; bypasses first-pass metabolism',
    source: 'FDA, Acorda reports',
  },

  // ── Ocular Delivery ──
  {
    company: 'Clearside Biomedical',
    technology: 'Ocular',
    platform_name: 'SCS Microinjector (suprachoroidal delivery)',
    therapeutic_applications: ['Retinal diseases', 'Uveitis', 'Wet AMD', 'DME'],
    stage: 'Commercialized',
    key_products: ['XIPERE (triamcinolone for macular edema from uveitis)'],
    notable_deals: [
      { partner: 'REGENXBIO', year: 2021, asset: 'Suprachoroidal AAV gene therapy delivery' },
      { partner: 'Bausch + Lomb', year: 2022, asset: 'Axitinib suprachoroidal for wet AMD' },
    ],
    competitive_advantage:
      'Only FDA-approved suprachoroidal injection; targets retinal tissue with lower systemic exposure',
    source: 'Clearside reports',
  },
];

// ────────────────────────────────────────────────────────────
// PLATFORM DEAL ECONOMICS
// Source: SEC filings, BioCentury, Nature Reviews (2020-2026)
// ────────────────────────────────────────────────────────────

export const PLATFORM_DEAL_ECONOMICS = {
  lnp_license: {
    typical_upfront_usd_m: [10, 50],
    typical_milestones_usd_m: [50, 300],
    typical_royalty_pct: [2, 5],
    notes: 'Platform license (non-exclusive) for specific therapeutic targets. Exclusive deals command 3-5x premiums.',
  },
  galnac_license: {
    typical_upfront_usd_m: [50, 200],
    typical_milestones_usd_m: [200, 2000],
    typical_royalty_pct: [5, 15],
    notes: 'Target-specific licenses. Large pharma deals (AZ/Silence, Roche/Alnylam) can reach $2B+ TDV.',
  },
  enhanze_license: {
    typical_upfront_usd_m: [20, 125],
    typical_milestones_usd_m: [50, 300],
    typical_royalty_pct: [3, 10],
    notes: "Product-specific license for SC conversion. Halozyme model — royalties on partner's SC product sales.",
  },
  depot_lai: {
    typical_upfront_usd_m: [5, 30],
    typical_milestones_usd_m: [20, 100],
    typical_royalty_pct: [3, 8],
    notes: 'Formulation-specific deals. Lower value than novel MOA platforms.',
  },
  source: 'SEC filings, BioCentury BCIQ, Ambrosia Ventures proprietary database',
};

// ────────────────────────────────────────────────────────────
// MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const DRUG_DELIVERY_MARKET = {
  global_market_2025_usd_b: 45,
  global_market_2030_usd_b: 85,
  cagr_2025_2030_pct: 13.5,
  lnp_segment_2025_usd_b: 8,
  galnac_segment_2025_usd_b: 6,
  enhanze_royalty_revenue_2025_usd_b: 2,
  key_trends: [
    'LNP expanding beyond vaccines into therapeutics (gene editing, protein replacement)',
    'GalNAc enabling quarterly/semi-annual dosing for chronic diseases',
    'IV-to-SC conversion via ENHANZE creating $1B+ product upgrades',
    'Oral peptide delivery (SNAC, Mycapssa) opening oral biologic category',
    'Tissue-targeted LNPs (lung, brain, muscle) — next frontier beyond liver',
  ],
  source: 'Grand View Research, Nature Reviews Drug Delivery, company reports',
};
