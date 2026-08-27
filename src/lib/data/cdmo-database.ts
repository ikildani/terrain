// ============================================================
// TERRAIN — CDMO/CMO Database
// lib/data/cdmo-database.ts
//
// Contract development and manufacturing organizations.
// Sources: Company reports, PharmSource, CDMO industry guides (2024-2026)
// ============================================================

export type CDMOSpecialty =
  | 'large_molecule'
  | 'small_molecule'
  | 'cell_gene_therapy'
  | 'fill_finish'
  | 'adc'
  | 'mrna'
  | 'peptide'
  | 'radiopharm'
  | 'oral_solid_dose'
  | 'sterile_injectable'
  | 'api';

export interface CDMORecord {
  company: string;
  headquarters: string;
  specialties: CDMOSpecialty[];
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3'; // Tier 1 = global top 20, Tier 2 = mid-size, Tier 3 = niche/regional
  estimated_revenue_usd_b?: number;
  bioreactor_capacity_liters?: number; // for biologics CDMOs
  fda_inspected: boolean;
  ema_inspected: boolean;
  key_clients_public: string[];
  geographic_footprint: string[];
  notable_capabilities: string[];
  source: string;
}

// ────────────────────────────────────────────────────────────
// CDMO DATABASE
// ────────────────────────────────────────────────────────────

export const CDMO_DATABASE: CDMORecord[] = [
  // ══════════════════════════════════════════════════════════
  // TIER 1 — Global Leaders
  // ══════════════════════════════════════════════════════════

  {
    company: 'Samsung Biologics',
    headquarters: 'Incheon, South Korea',
    specialties: ['large_molecule', 'adc', 'fill_finish'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 3.2,
    bioreactor_capacity_liters: 604000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Roche', 'BMS', 'AstraZeneca', 'Moderna', 'GSK'],
    geographic_footprint: ['South Korea', 'US (planned)'],
    notable_capabilities: [
      "World's largest single-site biomanufacturing",
      'Plant 4 operational 2023 (256,000L)',
      'ADC conjugation',
    ],
    source: 'Samsung Biologics annual report 2025',
  },
  {
    company: 'Lonza',
    headquarters: 'Basel, Switzerland',
    specialties: ['large_molecule', 'cell_gene_therapy', 'adc', 'small_molecule', 'fill_finish'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 5.5,
    bioreactor_capacity_liters: 300000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Moderna', 'Roche', 'Sarepta', 'bluebird bio'],
    geographic_footprint: ['Switzerland', 'US', 'UK', 'Netherlands', 'Singapore', 'China'],
    notable_capabilities: [
      'mRNA manufacturing (Moderna partner)',
      'CGT viral vector',
      'Ibex continuous bioprocessing',
      'ADC',
    ],
    source: 'Lonza annual report 2025',
  },
  {
    company: 'Catalent',
    headquarters: 'Somerset, NJ',
    specialties: ['large_molecule', 'cell_gene_therapy', 'fill_finish', 'oral_solid_dose', 'sterile_injectable'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 4.0,
    bioreactor_capacity_liters: 100000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['J&J', 'AstraZeneca', 'Moderna', 'BMS'],
    geographic_footprint: ['US', 'UK', 'Italy', 'Belgium', 'Japan', 'Singapore'],
    notable_capabilities: [
      'Acquired by Novo Holdings 2024',
      'CGT gene-modified cell therapy',
      'Zydis ODT technology',
      'GPEx cell line',
    ],
    source: 'Catalent / Novo Holdings reports 2024-2025',
  },
  {
    company: 'WuXi Biologics',
    headquarters: 'Shanghai, China',
    specialties: ['large_molecule', 'adc', 'fill_finish'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 2.8,
    bioreactor_capacity_liters: 262000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Disclosed as 600+ clients globally'],
    geographic_footprint: ['China', 'Ireland', 'Germany', 'US', 'Singapore'],
    notable_capabilities: [
      'Integrated CRO-CDMO model',
      'WuXiBody bispecific platform',
      'End-to-end from cell line to commercial',
    ],
    source: 'WuXi Biologics annual report 2025',
  },
  {
    company: 'Thermo Fisher Scientific (Patheon)',
    headquarters: 'Waltham, MA',
    specialties: [
      'small_molecule',
      'large_molecule',
      'cell_gene_therapy',
      'sterile_injectable',
      'oral_solid_dose',
      'api',
    ],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 7.0,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Pfizer', 'Moderna', 'BioNTech'],
    geographic_footprint: ['US', 'Canada', 'Italy', 'UK', 'India', 'Japan', 'Australia'],
    notable_capabilities: [
      'Largest pharma services company',
      'Viral vector manufacturing',
      'Plasmid DNA',
      'mRNA (acquired PPD 2021)',
    ],
    source: 'Thermo Fisher annual report 2025',
  },
  {
    company: 'Fujifilm Diosynth Biotechnologies',
    headquarters: 'Tokyo, Japan / Research Triangle Park, NC',
    specialties: ['large_molecule', 'cell_gene_therapy', 'mrna', 'adc'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 2.0,
    bioreactor_capacity_liters: 120000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['CSL Behring', 'Novavax', 'Arctus Therapeutics'],
    geographic_footprint: ['US', 'UK', 'Denmark', 'Japan'],
    notable_capabilities: [
      '$2B Holly Springs NC mega-site',
      'Apollo continuous manufacturing',
      'Next-gen process development',
    ],
    source: 'Fujifilm annual report 2025',
  },
  {
    company: 'Boehringer Ingelheim BioXcellence',
    headquarters: 'Ingelheim, Germany',
    specialties: ['large_molecule', 'cell_gene_therapy', 'fill_finish'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 1.5,
    bioreactor_capacity_liters: 200000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Abbvie', 'Astellas', 'Lilly'],
    geographic_footprint: ['Germany', 'Austria', 'China', 'US'],
    notable_capabilities: ['BI proprietary cell lines', 'Viral vector at scale', '40+ year track record'],
    source: 'Boehringer Ingelheim annual report 2025',
  },
  {
    company: 'AGC Biologics',
    headquarters: 'Seattle, WA',
    specialties: ['large_molecule', 'cell_gene_therapy', 'mrna', 'peptide'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 0.8,
    bioreactor_capacity_liters: 80000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['CureVac', 'Various undisclosed'],
    geographic_footprint: ['US', 'Denmark', 'Germany', 'Japan', 'Italy'],
    notable_capabilities: ['mRNA manufacturing', 'pDNA production', 'Microbial and mammalian', 'CGT viral vector'],
    source: 'AGC Biologics website, industry reports',
  },

  // ══════════════════════════════════════════════════════════
  // TIER 2 — Mid-Size / Specialized
  // ══════════════════════════════════════════════════════════

  {
    company: 'Rentschler Biopharma',
    headquarters: 'Laupheim, Germany',
    specialties: ['large_molecule', 'fill_finish'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.5,
    bioreactor_capacity_liters: 30000,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various European biotechs'],
    geographic_footprint: ['Germany', 'US (Milford, MA)'],
    notable_capabilities: ['European mid-size specialist', 'Strong regulatory track record', 'Flexible batch sizes'],
    source: 'Company reports',
  },
  {
    company: 'Recipharm',
    headquarters: 'Stockholm, Sweden',
    specialties: ['small_molecule', 'sterile_injectable', 'oral_solid_dose', 'fill_finish'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 1.2,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Major pharma (undisclosed)'],
    geographic_footprint: ['Sweden', 'France', 'Germany', 'Italy', 'UK', 'India', 'US'],
    notable_capabilities: ['Acquired by EQT 2023', 'End-to-end small molecule', '30+ manufacturing sites'],
    source: 'Recipharm / EQT reports',
  },
  {
    company: 'Siegfried',
    headquarters: 'Zofingen, Switzerland',
    specialties: ['small_molecule', 'api', 'sterile_injectable'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 1.3,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Novartis', 'Roche'],
    geographic_footprint: ['Switzerland', 'Germany', 'Malta', 'China', 'US'],
    notable_capabilities: ['API and drug product integration', 'Complex formulations', 'High-potent compound handling'],
    source: 'Siegfried annual report 2025',
  },
  {
    company: 'Curia (formerly AMRI)',
    headquarters: 'Albany, NY',
    specialties: ['small_molecule', 'large_molecule', 'api', 'sterile_injectable'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.7,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various mid-large pharma'],
    geographic_footprint: ['US', 'Europe'],
    notable_capabilities: ['Integrated drug substance + product', 'Oncology (cytotoxic handling)', 'Complex APIs'],
    source: 'Curia website, industry reports',
  },
  {
    company: 'Piramal Pharma Solutions',
    headquarters: 'Mumbai, India',
    specialties: ['small_molecule', 'api', 'large_molecule', 'sterile_injectable'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.5,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various global pharma'],
    geographic_footprint: ['India', 'UK', 'US', 'Canada'],
    notable_capabilities: ['Cost-competitive manufacturing', 'ADC payload synthesis', '15 global sites'],
    source: 'Piramal annual report',
  },
  {
    company: 'WuXi AppTec',
    headquarters: 'Shanghai, China',
    specialties: ['small_molecule', 'api', 'cell_gene_therapy', 'peptide'],
    tier: 'Tier 1',
    estimated_revenue_usd_b: 4.5,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['5,000+ clients globally (disclosed)'],
    geographic_footprint: ['China', 'US', 'Germany', 'UK', 'Japan'],
    notable_capabilities: [
      'Largest CRO-CDMO in China',
      'TIDES (oligo, peptide) platform',
      'CGT manufacturing',
      'Subject to BIOSECURE Act concerns',
    ],
    source: 'WuXi AppTec annual report 2025',
  },

  // ── Fill/Finish Specialists ──
  {
    company: 'Vetter Pharma',
    headquarters: 'Ravensburg, Germany',
    specialties: ['fill_finish', 'sterile_injectable'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Major pharma (undisclosed)'],
    geographic_footprint: ['Germany', 'US (Chicago)'],
    notable_capabilities: [
      'Prefilled syringe specialist',
      'Cartridge filling',
      'Clinical to commercial',
      'Family-owned',
    ],
    source: 'Vetter website, CDMO guides',
  },
  {
    company: 'Baxter BioPharma Solutions',
    headquarters: 'Deerfield, IL',
    specialties: ['fill_finish', 'sterile_injectable'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various pharma'],
    geographic_footprint: ['US', 'Austria'],
    notable_capabilities: ['Lyophilization expertise', 'Cytotoxic handling', 'Parenteral dosage forms'],
    source: 'Baxter website',
  },
  {
    company: 'Jubilant HollisterStier',
    headquarters: 'Spokane, WA',
    specialties: ['fill_finish', 'sterile_injectable', 'oral_solid_dose'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: false,
    key_clients_public: ['Various North American pharma'],
    geographic_footprint: ['US', 'Canada', 'India'],
    notable_capabilities: ['Sterile fill/finish', 'Lyophilization', 'Prefilled syringes', 'Allergenic extracts'],
    source: 'Jubilant website',
  },

  // ── CGT Specialists ──
  {
    company: 'Oxford Biomedica',
    headquarters: 'Oxford, UK',
    specialties: ['cell_gene_therapy'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.2,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['AstraZeneca (COVID vaccine)', 'Novartis', 'Sarepta'],
    geographic_footprint: ['UK', 'US (Bedford, MA)'],
    notable_capabilities: ['LentiVector platform', 'GMP lentiviral vector manufacturing', 'AAV capabilities'],
    source: 'Oxford Biomedica annual report',
  },
  {
    company: 'Brammer Bio (Thermo Fisher)',
    headquarters: 'Cambridge, MA',
    specialties: ['cell_gene_therapy'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: false,
    key_clients_public: ['Various CGT biotechs'],
    geographic_footprint: ['US'],
    notable_capabilities: ['Acquired by Thermo Fisher 2019', 'AAV, lentivirus, adenovirus', 'Plasmid DNA at scale'],
    source: 'Thermo Fisher reports',
  },
  {
    company: 'CEVEC Pharmaceuticals',
    headquarters: 'Cologne, Germany',
    specialties: ['cell_gene_therapy'],
    tier: 'Tier 3',
    fda_inspected: false,
    ema_inspected: true,
    key_clients_public: ['European CGT companies'],
    geographic_footprint: ['Germany'],
    notable_capabilities: ['CAP technology for adenovirus/AAV production', 'Suspension-adapted producer cells'],
    source: 'Company website',
  },

  // ── ADC Specialists ──
  {
    company: 'Lonza (ADC division)',
    headquarters: 'Visp, Switzerland',
    specialties: ['adc'],
    tier: 'Tier 1',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various ADC developers'],
    geographic_footprint: ['Switzerland', 'US'],
    notable_capabilities: [
      'End-to-end ADC (antibody + payload + conjugation)',
      'Cytotoxic payload synthesis',
      'GMP conjugation',
    ],
    source: 'Lonza ADC Solutions website',
  },
  {
    company: 'Novasep',
    headquarters: 'Lyon, France',
    specialties: ['adc', 'api', 'small_molecule'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various ADC developers'],
    geographic_footprint: ['France', 'Belgium'],
    notable_capabilities: ['Cytotoxic API expertise', 'High containment manufacturing', 'ADC payload synthesis'],
    source: 'Novasep website',
  },

  // ── mRNA Specialists ──
  {
    company: 'Moderna Manufacturing',
    headquarters: 'Norwood, MA',
    specialties: ['mrna'],
    tier: 'Tier 1',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Internal (vertically integrated)'],
    geographic_footprint: ['US', 'Australia (planned)', 'UK (planned)'],
    notable_capabilities: [
      'Largest dedicated mRNA manufacturing',
      'Internal + partner network (Lonza, Thermo Fisher)',
      'LNP formulation',
    ],
    source: 'Moderna annual report 2025',
  },

  // ── Peptide/Oligo Specialists ──
  {
    company: 'Bachem',
    headquarters: 'Bubendorf, Switzerland',
    specialties: ['peptide', 'api'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.8,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Novo Nordisk', 'Lilly (GLP-1 supply chain)'],
    geographic_footprint: ['Switzerland', 'US', 'UK', 'Japan'],
    notable_capabilities: [
      'World leader in peptide manufacturing',
      'GLP-1 supply (semaglutide, tirzepatide intermediates)',
      'Oligo manufacturing',
    ],
    source: 'Bachem annual report 2025',
  },
  {
    company: 'PolyPeptide Group',
    headquarters: 'Malmö, Sweden',
    specialties: ['peptide', 'api'],
    tier: 'Tier 2',
    estimated_revenue_usd_b: 0.4,
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various pharma'],
    geographic_footprint: ['Sweden', 'Belgium', 'India', 'US', 'France'],
    notable_capabilities: [
      'GMP peptide synthesis',
      'Large-scale solid-phase and solution-phase',
      'Regulatory peptides',
    ],
    source: 'PolyPeptide annual report',
  },

  // ── Regional CDMOs ──
  {
    company: 'Dishman Carbogen Amcis',
    headquarters: 'Ahmedabad, India',
    specialties: ['small_molecule', 'api', 'large_molecule'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Roche', 'Various pharma'],
    geographic_footprint: ['India', 'Switzerland', 'Netherlands', 'UK', 'China'],
    notable_capabilities: [
      'Cost-competitive API manufacturing',
      'High-potent compounds',
      'Vitamins and pharma intermediates',
    ],
    source: 'Dishman annual report',
  },
  {
    company: "Dr. Reddy's Custom Pharmaceutical Services",
    headquarters: 'Hyderabad, India',
    specialties: ['small_molecule', 'api', 'sterile_injectable'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Various global pharma'],
    geographic_footprint: ['India', 'US', 'UK'],
    notable_capabilities: ['API to formulation integration', 'Cost-competitive', 'Multiple FDA-inspected sites'],
    source: "Dr. Reddy's annual report",
  },
  {
    company: 'Astellia (Samsung BioLogics subsidiary)',
    headquarters: 'Incheon, South Korea',
    specialties: ['large_molecule', 'fill_finish'],
    tier: 'Tier 2',
    fda_inspected: true,
    ema_inspected: true,
    key_clients_public: ['Samsung Biologics clients'],
    geographic_footprint: ['South Korea'],
    notable_capabilities: ['Drug product manufacturing', 'Pre-filled syringe', 'Vial filling'],
    source: 'Samsung Biologics reports',
  },
];

// ────────────────────────────────────────────────────────────
// CDMO MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const CDMO_MARKET = {
  global_market_size_2025_usd_b: 210,
  global_market_size_2030_usd_b: 350,
  cagr_2025_2030_pct: 10.8,
  biologics_share_pct: 45,
  small_molecule_share_pct: 35,
  cgt_share_pct: 8,
  other_pct: 12,
  top_10_market_share_pct: 35,
  avg_contract_duration_years: 3,
  source: 'PharmSource, Grand View Research, EvaluatePharma (2025-2026)',
};

// Helper functions
export function getCDMOsBySpecialty(specialty: CDMOSpecialty): CDMORecord[] {
  return CDMO_DATABASE.filter((c) => c.specialties.includes(specialty));
}

export function getCDMOsByTier(tier: CDMORecord['tier']): CDMORecord[] {
  return CDMO_DATABASE.filter((c) => c.tier === tier);
}

export function getCDMOsByRegion(region: string): CDMORecord[] {
  return CDMO_DATABASE.filter((c) =>
    c.geographic_footprint.some((g) => g.toLowerCase().includes(region.toLowerCase())),
  );
}
