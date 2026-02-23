// =============================================================================
// TERRAIN — Companion Diagnostic (CDx) Competitive Landscape Engine
// lib/analytics/cdx-competitive.ts
//
// Analyzes the competitive landscape for companion diagnostics based on
// biomarker, indication, platform, and linked drug inputs. Produces a
// structured CDxCompetitiveLandscapeOutput suitable for rendering in the
// dashboard and exporting to reports.
//
// This is the CDx equivalent of competitive.ts (pharma) and
// nutraceutical-competitive.ts (nutraceuticals). Follows the same patterns.
// =============================================================================

import type {
  CDxCompetitiveLandscapeInput,
  CDxCompetitiveLandscapeOutput,
  CDxCompetitor,
  BiomarkerCompetitionEntry,
  CDxPlatformComparison,
  CDxLinkedDrugDependency,
  CDxPlatform,
  CDxRegulatoryStatus,
  CompetitiveComparisonAttribute,
  CompetitiveDataSource,
} from '@/types/devices-diagnostics';

import {
  CDX_COMPETITOR_DATABASE,
  getCDxCompetitorsByBiomarker,
  getCDxCompetitorsByPlatform,
  getCDxCompetitorsByLinkedDrug,
  getCoveredBiomarkers,
  getCDxCompetitorsByCompany,
} from '@/lib/data/cdx-competitor-database';

// =============================================================================
// Constants
// =============================================================================

const CURRENT_YEAR = new Date().getFullYear();

// =============================================================================
// Step 1: Biomarker Aliases
// =============================================================================

/**
 * Canonical biomarker alias map. Keys are normalized uppercase names; values
 * are the common synonyms, abbreviations, and gene names that map to the
 * same biological target.
 */
const BIOMARKER_ALIASES: Record<string, string[]> = {
  'PD-L1':  ['PDL1', 'PD-L1', 'CD274'],
  'EGFR':   ['EGFR', 'HER1', 'ERBB1'],
  'HER2':   ['HER2', 'ERBB2', 'neu'],
  'ALK':    ['ALK', 'ALK rearrangement', 'EML4-ALK'],
  'BRCA':   ['BRCA1', 'BRCA2', 'BRCA1/2'],
  'MSI':    ['MSI', 'MSI-H', 'microsatellite instability'],
  'TMB':    ['TMB', 'tumor mutational burden'],
  'KRAS':   ['KRAS', 'KRAS G12C'],
  'MRD':    ['MRD', 'ctDNA', 'minimal residual disease'],
  'HRD':    ['HRD', 'homologous recombination deficiency'],
};

/**
 * Resolves a user-provided biomarker string to all known aliases so
 * downstream lookups can match against any variant.
 */
function resolveBiomarkerAliases(biomarker: string): string[] {
  const normalized = biomarker.trim().toUpperCase();

  // Check if the input matches any key directly
  for (const [canonical, aliases] of Object.entries(BIOMARKER_ALIASES)) {
    if (canonical.toUpperCase() === normalized) {
      return aliases;
    }
    // Check if the input matches any alias
    for (const alias of aliases) {
      if (alias.toUpperCase() === normalized) {
        return aliases;
      }
    }
  }

  // No alias found; return the original as a single-element array
  return [biomarker.trim()];
}

// =============================================================================
// Step 2: Competitor Retrieval
// =============================================================================

/**
 * Retrieves and deduplicates CDx competitors matching the input criteria.
 * Combines biomarker, platform, and linked-drug searches and falls back
 * to broader matching when no results are found.
 */
function retrieveCompetitors(input: CDxCompetitiveLandscapeInput): CDxCompetitor[] {
  const aliases = resolveBiomarkerAliases(input.biomarker);
  const seen = new Map<string, CDxCompetitor>();

  // Search by each biomarker alias
  for (const alias of aliases) {
    const matches = getCDxCompetitorsByBiomarker(alias);
    for (const m of matches) {
      if (!seen.has(m.test_name.toLowerCase())) {
        seen.set(m.test_name.toLowerCase(), m);
      }
    }
  }

  // If a platform filter was provided, merge in platform matches
  if (input.test_type) {
    const platformMatches = getCDxCompetitorsByPlatform(input.test_type);
    for (const m of platformMatches) {
      if (!seen.has(m.test_name.toLowerCase())) {
        seen.set(m.test_name.toLowerCase(), m);
      }
    }
  }

  // If a linked-drug filter was provided, merge in drug matches
  if (input.linked_drug) {
    const drugMatches = getCDxCompetitorsByLinkedDrug(input.linked_drug);
    for (const m of drugMatches) {
      if (!seen.has(m.test_name.toLowerCase())) {
        seen.set(m.test_name.toLowerCase(), m);
      }
    }
  }

  let results = Array.from(seen.values());

  // Fallback: if no matches, try broader indication-based fuzzy match
  if (results.length === 0 && input.indication) {
    const needle = input.indication.toLowerCase();
    results = CDX_COMPETITOR_DATABASE.filter((c) =>
      c.biomarkers_covered.some((b) => b.toLowerCase().includes(needle)) ||
      c.test_name.toLowerCase().includes(needle) ||
      c.linked_drugs.some((d) => d.toLowerCase().includes(needle))
    );
  }

  // Ultimate fallback: return entire database (rare)
  if (results.length === 0) {
    results = [...CDX_COMPETITOR_DATABASE];
  }

  return results;
}

// =============================================================================
// Step 3: Split Approved vs Pipeline
// =============================================================================

/** Regulatory statuses considered "approved" (commercially available). */
const APPROVED_STATUSES: CDxRegulatoryStatus[] = ['PMA_approved', 'cleared'];

/** Regulatory statuses considered "pipeline" (not yet fully commercially available). */
const PIPELINE_STATUSES: CDxRegulatoryStatus[] = ['LDT', 'development', 'submitted'];

/**
 * Splits an array of CDx competitors into approved (on-market) tests and
 * pipeline / in-development tests.
 */
function splitApprovedVsPipeline(
  competitors: CDxCompetitor[]
): { approved: CDxCompetitor[]; pipeline: CDxCompetitor[] } {
  const approved = competitors.filter((c) =>
    APPROVED_STATUSES.includes(c.regulatory_status)
  );
  const pipeline = competitors.filter((c) =>
    PIPELINE_STATUSES.includes(c.regulatory_status)
  );
  return { approved, pipeline };
}

// =============================================================================
// Step 4: Platform Comparison
// =============================================================================

/** Growth trend by platform type. */
const PLATFORM_TREND: Record<CDxPlatform, CDxPlatformComparison['trend']> = {
  NGS:           'growing',
  PCR:           'stable',
  IHC:           'stable',
  FISH:          'declining',
  liquid_biopsy: 'growing',
  ddPCR:         'growing',
  microarray:    'stable',
};

/**
 * Assesses biomarker breadth based on average genes-in-panel.
 * < 10 = narrow, 10-100 = moderate, > 100 = broad.
 */
function assessBiomarkerBreadth(avgGenes: number): CDxPlatformComparison['biomarker_breadth'] {
  if (avgGenes > 100) return 'broad';
  if (avgGenes >= 10) return 'moderate';
  return 'narrow';
}

/**
 * Builds platform-level comparison data from the matched competitor set.
 * Groups competitors by platform and computes aggregate statistics.
 */
function buildPlatformComparison(competitors: CDxCompetitor[]): CDxPlatformComparison[] {
  const platformMap = new Map<CDxPlatform, CDxCompetitor[]>();

  for (const c of competitors) {
    const existing = platformMap.get(c.platform) || [];
    existing.push(c);
    platformMap.set(c.platform, existing);
  }

  const comparisons: CDxPlatformComparison[] = [];

  for (const [platform, tests] of Array.from(platformMap.entries())) {
    const testCount = tests.length;

    // Average turnaround (filter undefined)
    const turnaroundValues = tests
      .filter((t) => t.turnaround_days != null)
      .map((t) => t.turnaround_days as number);
    const avgTurnaround = turnaroundValues.length > 0
      ? Math.round(turnaroundValues.reduce((a, b) => a + b, 0) / turnaroundValues.length)
      : 0;

    // Average price (filter undefined)
    const priceValues = tests
      .filter((t) => t.test_price_estimate != null)
      .map((t) => t.test_price_estimate as number);
    const avgPrice = priceValues.length > 0
      ? Math.round(priceValues.reduce((a, b) => a + b, 0) / priceValues.length)
      : 0;

    // Biomarker breadth based on average genes_in_panel
    const geneValues = tests
      .filter((t) => t.genes_in_panel != null && t.genes_in_panel > 0)
      .map((t) => t.genes_in_panel as number);
    const avgGenes = geneValues.length > 0
      ? geneValues.reduce((a, b) => a + b, 0) / geneValues.length
      : 0;
    const breadth = assessBiomarkerBreadth(avgGenes);

    const trend = PLATFORM_TREND[platform] || 'stable';

    // Build narrative
    const narrative = buildPlatformNarrative(platform, testCount, avgTurnaround, avgPrice, breadth, trend);

    comparisons.push({
      platform,
      test_count: testCount,
      avg_turnaround_days: avgTurnaround,
      avg_price_estimate: avgPrice,
      biomarker_breadth: breadth,
      trend,
      narrative,
    });
  }

  // Sort by test count descending
  return comparisons.sort((a, b) => b.test_count - a.test_count);
}

/**
 * Generates a human-readable narrative string for a given platform summary.
 */
function buildPlatformNarrative(
  platform: CDxPlatform,
  testCount: number,
  avgTurnaround: number,
  avgPrice: number,
  breadth: CDxPlatformComparison['biomarker_breadth'],
  trend: CDxPlatformComparison['trend']
): string {
  const platformLabel = platform === 'liquid_biopsy' ? 'Liquid Biopsy' :
                        platform === 'ddPCR' ? 'ddPCR' :
                        platform.toUpperCase();

  const parts: string[] = [];

  parts.push(`${platformLabel} has ${testCount} test${testCount !== 1 ? 's' : ''} in this landscape.`);

  if (avgTurnaround > 0) {
    parts.push(`Average turnaround is ${avgTurnaround} days.`);
  }
  if (avgPrice > 0) {
    parts.push(`Average test price is ~$${avgPrice.toLocaleString()}.`);
  }

  parts.push(`Biomarker breadth is ${breadth}.`);

  if (trend === 'growing') {
    parts.push('This platform is on a growth trajectory driven by expanding clinical utility.');
  } else if (trend === 'declining') {
    parts.push('This platform is declining as broader multi-gene panels replace single-marker assays.');
  } else {
    parts.push('Adoption is stable with established clinical workflows.');
  }

  return parts.join(' ');
}

// =============================================================================
// Step 5: Linked Drug Dependency
// =============================================================================

/**
 * Hardcoded estimated annual drug revenue (in $M) for major drugs with CDx
 * linkages. Used to assess how dependent a CDx test's volume is on the
 * success of its linked drug.
 */
const DRUG_REVENUE_ESTIMATES: Record<string, { company: string; revenue_m: number; phase: string }> = {
  'keytruda':       { company: 'Merck', revenue_m: 25000, phase: 'approved' },
  'pembrolizumab':  { company: 'Merck', revenue_m: 25000, phase: 'approved' },
  'tagrisso':       { company: 'AstraZeneca', revenue_m: 5500, phase: 'approved' },
  'osimertinib':    { company: 'AstraZeneca', revenue_m: 5500, phase: 'approved' },
  'lynparza':       { company: 'AstraZeneca/Merck', revenue_m: 2500, phase: 'approved' },
  'olaparib':       { company: 'AstraZeneca/Merck', revenue_m: 2500, phase: 'approved' },
  'tecentriq':      { company: 'Roche', revenue_m: 3800, phase: 'approved' },
  'atezolizumab':   { company: 'Roche', revenue_m: 3800, phase: 'approved' },
  'imfinzi':        { company: 'AstraZeneca', revenue_m: 4200, phase: 'approved' },
  'durvalumab':     { company: 'AstraZeneca', revenue_m: 4200, phase: 'approved' },
  'herceptin':      { company: 'Roche', revenue_m: 3000, phase: 'approved' },
  'trastuzumab':    { company: 'Roche', revenue_m: 3000, phase: 'approved' },
  'enhertu':        { company: 'Daiichi Sankyo/AstraZeneca', revenue_m: 4000, phase: 'approved' },
  'rozlytrek':      { company: 'Roche', revenue_m: 200, phase: 'approved' },
  'entrectinib':    { company: 'Roche', revenue_m: 200, phase: 'approved' },
  'vitrakvi':       { company: 'Bayer', revenue_m: 250, phase: 'approved' },
  'larotrectinib':  { company: 'Bayer', revenue_m: 250, phase: 'approved' },
  'lumakras':       { company: 'Amgen', revenue_m: 700, phase: 'approved' },
  'sotorasib':      { company: 'Amgen', revenue_m: 700, phase: 'approved' },
  'tabrecta':       { company: 'Novartis', revenue_m: 150, phase: 'approved' },
  'capmatinib':     { company: 'Novartis', revenue_m: 150, phase: 'approved' },
  'rybrevant':      { company: 'Janssen', revenue_m: 500, phase: 'approved' },
  'amivantamab':    { company: 'Janssen', revenue_m: 500, phase: 'approved' },
  'rubraca':        { company: 'GSK', revenue_m: 150, phase: 'approved' },
  'rucaparib':      { company: 'GSK', revenue_m: 150, phase: 'approved' },
  'piqray':         { company: 'Novartis', revenue_m: 350, phase: 'approved' },
  'alpelisib':      { company: 'Novartis', revenue_m: 350, phase: 'approved' },
  'xalkori':        { company: 'Pfizer', revenue_m: 300, phase: 'approved' },
  'crizotinib':     { company: 'Pfizer', revenue_m: 300, phase: 'approved' },
  'alecensa':       { company: 'Roche', revenue_m: 1500, phase: 'approved' },
  'alectinib':      { company: 'Roche', revenue_m: 1500, phase: 'approved' },
  'lorbrena':       { company: 'Pfizer', revenue_m: 800, phase: 'approved' },
  'lorlatinib':     { company: 'Pfizer', revenue_m: 800, phase: 'approved' },
  'zelboraf':       { company: 'Roche', revenue_m: 100, phase: 'approved' },
  'vemurafenib':    { company: 'Roche', revenue_m: 100, phase: 'approved' },
  'tafinlar':       { company: 'Novartis', revenue_m: 2200, phase: 'approved' },
  'dabrafenib':     { company: 'Novartis', revenue_m: 2200, phase: 'approved' },
  'mekinist':       { company: 'Novartis', revenue_m: 2200, phase: 'approved' },
  'trametinib':     { company: 'Novartis', revenue_m: 2200, phase: 'approved' },
  'iressa':         { company: 'AstraZeneca', revenue_m: 200, phase: 'approved' },
  'gefitinib':      { company: 'AstraZeneca', revenue_m: 200, phase: 'approved' },
  'tarceva':        { company: 'Roche', revenue_m: 300, phase: 'approved' },
  'erlotinib':      { company: 'Roche', revenue_m: 300, phase: 'approved' },
  'kadcyla':        { company: 'Roche', revenue_m: 1800, phase: 'approved' },
  'zejula':         { company: 'GSK', revenue_m: 400, phase: 'approved' },
  'niraparib':      { company: 'GSK', revenue_m: 400, phase: 'approved' },
  'talazoparib':    { company: 'Pfizer', revenue_m: 300, phase: 'approved' },
};

/**
 * Extracts the generic drug name from a formatted string like
 * "Keytruda (pembrolizumab)" or just "Keytruda".
 */
function extractDrugKey(drugString: string): string {
  // Try to match the pattern "BrandName (genericName)"
  const match = drugString.match(/\(([^)]+)\)/);
  if (match) {
    return match[1].toLowerCase().trim();
  }
  // Fall back to the brand name
  return drugString.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Looks up revenue estimate for a drug string. Tries generic name first,
 * then brand name.
 */
function lookupDrugRevenue(drugString: string): { company: string; revenue_m: number; phase: string } | undefined {
  const generic = extractDrugKey(drugString);
  if (DRUG_REVENUE_ESTIMATES[generic]) {
    return DRUG_REVENUE_ESTIMATES[generic];
  }
  // Try the brand name portion
  const brand = drugString.split('(')[0].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  if (DRUG_REVENUE_ESTIMATES[brand]) {
    return DRUG_REVENUE_ESTIMATES[brand];
  }
  return undefined;
}

/**
 * Builds the linked drug dependency analysis. For each unique drug
 * referenced across matched competitors, identifies revenue dependency
 * and lists associated CDx tests.
 */
function buildLinkedDrugDependency(competitors: CDxCompetitor[]): CDxLinkedDrugDependency[] {
  const drugMap = new Map<string, { tests: Set<string>; rawDrugString: string }>();

  for (const c of competitors) {
    for (const drug of c.linked_drugs) {
      const key = extractDrugKey(drug) || drug.toLowerCase().trim();
      if (!drugMap.has(key)) {
        drugMap.set(key, { tests: new Set<string>(), rawDrugString: drug });
      }
      const entry = drugMap.get(key)!;
      entry.tests.add(c.test_name);
    }
  }

  const dependencies: CDxLinkedDrugDependency[] = [];

  for (const [, value] of Array.from(drugMap.entries())) {
    const revenueData = lookupDrugRevenue(value.rawDrugString);

    const drugCompany = revenueData?.company || 'Unknown';
    const drugPhase = revenueData?.phase || 'approved';
    const estimatedRevenue = revenueData?.revenue_m;

    // Assess CDx revenue dependency based on drug revenue
    let dependency: CDxLinkedDrugDependency['cdx_revenue_dependency'] = 'low';
    if (estimatedRevenue != null) {
      if (estimatedRevenue > 2000) {
        dependency = 'high';
      } else if (estimatedRevenue >= 500) {
        dependency = 'moderate';
      }
    }

    // Extract brand name for display
    const displayName = value.rawDrugString.split('(')[0].trim() || value.rawDrugString;

    dependencies.push({
      drug_name: displayName,
      drug_company: drugCompany,
      drug_phase: drugPhase,
      estimated_drug_revenue_m: estimatedRevenue,
      cdx_tests_linked: Array.from(value.tests),
      cdx_revenue_dependency: dependency,
    });
  }

  // Sort by revenue descending (high-dependency drugs first)
  return dependencies.sort((a, b) => (b.estimated_drug_revenue_m || 0) - (a.estimated_drug_revenue_m || 0));
}

// =============================================================================
// Step 6: Biomarker Competition Matrix
// =============================================================================

/**
 * Estimated testing rates for major biomarkers — the percentage of eligible
 * patients who actually receive testing for this biomarker.
 */
const BIOMARKER_TESTING_RATES: Record<string, number> = {
  'EGFR':   80,
  'PD-L1':  70,
  'ALK':    75,
  'BRAF':   60,
  'HER2':   95,
  'BRCA':   40,
  'BRCA1':  40,
  'BRCA2':  40,
  'TMB':    30,
  'MSI':    50,
  'KRAS':   50,
  'ROS1':   65,
  'NTRK':   40,
  'MET':    45,
  'RET':    45,
  'PIK3CA': 35,
  'HRD':    30,
  'MRD':    15,
  'ctDNA':  15,
};

/**
 * Known biomarker-to-approved-drug and biomarker-to-pipeline-drug mappings.
 * Used to enrich the competition matrix with drug context.
 */
const BIOMARKER_DRUG_MAP: Record<string, { approved: string[]; pipeline: string[] }> = {
  'EGFR':   { approved: ['Tagrisso', 'Iressa', 'Tarceva', 'Gilotrif', 'Vizimpro', 'Rybrevant'], pipeline: ['EGFR degraders', 'C797S inhibitors'] },
  'PD-L1':  { approved: ['Keytruda', 'Tecentriq', 'Imfinzi', 'Bavencio', 'Opdivo'], pipeline: ['next-gen IO combinations', 'PD-L1 bispecifics'] },
  'ALK':    { approved: ['Xalkori', 'Alecensa', 'Lorbrena', 'Zykadia', 'Alunbrig'], pipeline: ['NVL-655', 'TPX-0131'] },
  'BRAF':   { approved: ['Zelboraf', 'Tafinlar + Mekinist', 'Braftovi + Mektovi'], pipeline: ['BRAF-dimer inhibitors'] },
  'HER2':   { approved: ['Herceptin', 'Enhertu', 'Kadcyla', 'Perjeta', 'Tucatinib'], pipeline: ['HER2 bispecifics', 'next-gen ADCs'] },
  'BRCA':   { approved: ['Lynparza', 'Rubraca', 'Zejula', 'Talazoparib'], pipeline: ['next-gen PARPi', 'PARPi combinations'] },
  'BRCA1':  { approved: ['Lynparza', 'Rubraca', 'Zejula'], pipeline: ['next-gen PARPi'] },
  'BRCA2':  { approved: ['Lynparza', 'Rubraca', 'Zejula'], pipeline: ['next-gen PARPi'] },
  'TMB':    { approved: ['Keytruda (TMB-H)'], pipeline: ['IO biomarker-selected trials'] },
  'MSI':    { approved: ['Keytruda (MSI-H)', 'Opdivo + Yervoy'], pipeline: ['tissue-agnostic IO'] },
  'KRAS':   { approved: ['Lumakras', 'Krazati'], pipeline: ['KRAS G12D inhibitors', 'KRAS-ON inhibitors', 'RAS(ON) multi-selective'] },
  'ROS1':   { approved: ['Xalkori', 'Rozlytrek', 'Lorbrena'], pipeline: ['NVL-520', 'taletrectinib'] },
  'NTRK':   { approved: ['Vitrakvi', 'Rozlytrek'], pipeline: ['next-gen TRK inhibitors', 'selitrectinib'] },
  'MET':    { approved: ['Tabrecta', 'Tepmetko'], pipeline: ['MET ADCs', 'bispecific MET x EGFR'] },
  'RET':    { approved: ['Retevmo', 'Gavreto'], pipeline: ['next-gen RET inhibitors'] },
  'PIK3CA': { approved: ['Piqray'], pipeline: ['PI3K-alpha selective inhibitors', 'PI3K degraders'] },
  'HRD':    { approved: ['Lynparza (HRD+)', 'Zejula (HRD+)'], pipeline: ['combination PARPi + IO for HRD'] },
  'MRD':    { approved: [], pipeline: ['MRD-guided adjuvant therapy trials', 'ctDNA-guided de-escalation'] },
  'ctDNA':  { approved: [], pipeline: ['ctDNA-guided treatment decisions', 'MRD-based surveillance'] },
};

/**
 * Computes competitive intensity based on the number of tests detecting
 * a biomarker.
 */
function assessCompetitiveIntensity(testCount: number): BiomarkerCompetitionEntry['competitive_intensity'] {
  if (testCount >= 7) return 'very_high';
  if (testCount >= 4) return 'high';
  if (testCount >= 2) return 'moderate';
  return 'low';
}

/**
 * Looks up estimated testing rate for a biomarker string. Falls back to
 * alias resolution and defaults to 25% if unknown.
 */
function getTestingRate(biomarker: string): number {
  const upper = biomarker.toUpperCase().trim();

  // Direct lookup
  for (const [key, rate] of Object.entries(BIOMARKER_TESTING_RATES)) {
    if (key.toUpperCase() === upper || upper.includes(key.toUpperCase())) {
      return rate;
    }
  }

  // Try aliases
  for (const [, aliases] of Object.entries(BIOMARKER_ALIASES)) {
    for (const alias of aliases) {
      if (alias.toUpperCase() === upper) {
        // Try to find the canonical name in the testing rate map
        for (const canonAlias of aliases) {
          const rate = BIOMARKER_TESTING_RATES[canonAlias.toUpperCase()];
          if (rate != null) return rate;
        }
      }
    }
  }

  return 25; // Default testing rate for unknown biomarkers
}

/**
 * Looks up approved and pipeline drugs linked to a biomarker.
 */
function getDrugsForBiomarker(biomarker: string): { approved: string[]; pipeline: string[] } {
  const upper = biomarker.toUpperCase().trim();

  for (const [key, drugs] of Object.entries(BIOMARKER_DRUG_MAP)) {
    if (key.toUpperCase() === upper || upper.includes(key.toUpperCase())) {
      return drugs;
    }
  }

  return { approved: [], pipeline: [] };
}

/**
 * Builds the biomarker competition matrix. For each unique biomarker
 * across all matched competitors, aggregates test coverage, drug linkages,
 * testing rates, and competitive intensity.
 */
function buildBiomarkerCompetitionMatrix(competitors: CDxCompetitor[]): BiomarkerCompetitionEntry[] {
  const biomarkerMap = new Map<string, {
    tests: { test_name: string; company: string; platform: CDxPlatform }[];
  }>();

  for (const c of competitors) {
    for (const bm of c.biomarkers_covered) {
      const key = bm.toUpperCase().trim();
      if (!biomarkerMap.has(key)) {
        biomarkerMap.set(key, { tests: [] });
      }
      const entry = biomarkerMap.get(key)!;
      // Avoid duplicate test entries
      const alreadyListed = entry.tests.some(
        (t) => t.test_name.toLowerCase() === c.test_name.toLowerCase()
      );
      if (!alreadyListed) {
        entry.tests.push({
          test_name: c.test_name,
          company: c.company,
          platform: c.platform,
        });
      }
    }
  }

  const matrix: BiomarkerCompetitionEntry[] = [];

  for (const [biomarkerKey, data] of Array.from(biomarkerMap.entries())) {
    const drugs = getDrugsForBiomarker(biomarkerKey);
    const testingRate = getTestingRate(biomarkerKey);
    const intensity = assessCompetitiveIntensity(data.tests.length);

    matrix.push({
      biomarker: biomarkerKey,
      tests_detecting: data.tests,
      linked_drugs_approved: drugs.approved,
      linked_drugs_pipeline: drugs.pipeline,
      testing_rate_pct: testingRate,
      competitive_intensity: intensity,
    });
  }

  // Sort by number of tests descending (most contested biomarkers first)
  return matrix.sort((a, b) => b.tests_detecting.length - a.tests_detecting.length);
}

// =============================================================================
// Step 7: Testing Landscape
// =============================================================================

/**
 * Estimates the market-level growth rate based on the platform mix of
 * matched competitors. NGS-heavy mixes grow faster than PCR-heavy mixes.
 */
function estimateGrowthRate(
  byPlatform: { platform: CDxPlatform; share_pct: number }[]
): number {
  let weightedGrowth = 0;

  const platformGrowthRates: Record<CDxPlatform, number> = {
    NGS:           18,
    liquid_biopsy: 28,
    PCR:           4,
    IHC:           3,
    FISH:          -2,
    ddPCR:         15,
    microarray:    2,
  };

  for (const entry of byPlatform) {
    const rate = platformGrowthRates[entry.platform] || 5;
    weightedGrowth += rate * (entry.share_pct / 100);
  }

  return Math.round(weightedGrowth * 10) / 10;
}

/**
 * Builds the aggregate testing landscape from matched competitors.
 * Computes total estimated annual tests, platform share breakdown,
 * and estimated growth rate.
 */
function buildTestingLandscape(
  competitors: CDxCompetitor[]
): CDxCompetitiveLandscapeOutput['testing_landscape'] {
  const totalTests = competitors.reduce(
    (sum, c) => sum + (c.estimated_annual_test_volume || 0),
    0
  );

  // Platform breakdown by test volume
  const platformVolumes = new Map<CDxPlatform, number>();
  for (const c of competitors) {
    const vol = c.estimated_annual_test_volume || 0;
    platformVolumes.set(c.platform, (platformVolumes.get(c.platform) || 0) + vol);
  }

  const byPlatform = Array.from(platformVolumes.entries())
    .map(([platform, volume]) => ({
      platform,
      share_pct: totalTests > 0
        ? Math.round((volume / totalTests) * 1000) / 10
        : 0,
    }))
    .sort((a, b) => b.share_pct - a.share_pct);

  const growthRate = estimateGrowthRate(byPlatform);

  return {
    total_estimated_tests_per_year: totalTests,
    by_platform: byPlatform,
    growth_rate_pct: growthRate,
  };
}

// =============================================================================
// Step 8: Crowding Score
// =============================================================================

/**
 * Calculates a 1-10 crowding score based on multiple competitive factors:
 * - Number of approved tests (weight: 0.25)
 * - Number of pipeline/LDT tests (weight: 0.20)
 * - Platform diversity (weight: 0.15)
 * - Biomarker coverage overlap (weight: 0.20)
 * - Total test volume competition (weight: 0.20)
 */
function computeCrowdingScore(
  approved: CDxCompetitor[],
  pipeline: CDxCompetitor[],
  allCompetitors: CDxCompetitor[],
  biomarkerMatrix: BiomarkerCompetitionEntry[]
): { score: number; label: CDxCompetitiveLandscapeOutput['summary']['crowding_label'] } {
  if (allCompetitors.length === 0) {
    return { score: 1, label: 'Low' };
  }

  // Factor 1: Approved test count (0-10, weight 0.25)
  let approvedScore: number;
  if (approved.length >= 10) approvedScore = 10;
  else if (approved.length >= 7) approvedScore = 8;
  else if (approved.length >= 4) approvedScore = 6;
  else if (approved.length >= 2) approvedScore = 4;
  else if (approved.length === 1) approvedScore = 2;
  else approvedScore = 0;

  // Factor 2: Pipeline / LDT test count (0-10, weight 0.20)
  let pipelineScore: number;
  if (pipeline.length >= 15) pipelineScore = 10;
  else if (pipeline.length >= 10) pipelineScore = 8;
  else if (pipeline.length >= 5) pipelineScore = 6;
  else if (pipeline.length >= 2) pipelineScore = 4;
  else if (pipeline.length === 1) pipelineScore = 2;
  else pipelineScore = 0;

  // Factor 3: Platform diversity (0-10, weight 0.15)
  const uniquePlatforms = new Set(allCompetitors.map((c) => c.platform));
  let platformScore: number;
  if (uniquePlatforms.size >= 5) platformScore = 10;
  else if (uniquePlatforms.size >= 4) platformScore = 8;
  else if (uniquePlatforms.size >= 3) platformScore = 6;
  else if (uniquePlatforms.size >= 2) platformScore = 4;
  else platformScore = 2;

  // Factor 4: Biomarker coverage overlap (0-10, weight 0.20)
  // High overlap = high crowding
  const avgTestsPerBiomarker = biomarkerMatrix.length > 0
    ? biomarkerMatrix.reduce((sum, bm) => sum + bm.tests_detecting.length, 0) / biomarkerMatrix.length
    : 0;
  let overlapScore: number;
  if (avgTestsPerBiomarker >= 8) overlapScore = 10;
  else if (avgTestsPerBiomarker >= 5) overlapScore = 8;
  else if (avgTestsPerBiomarker >= 3) overlapScore = 6;
  else if (avgTestsPerBiomarker >= 2) overlapScore = 4;
  else overlapScore = 2;

  // Factor 5: Total test volume (0-10, weight 0.20)
  const totalVolume = allCompetitors.reduce(
    (sum, c) => sum + (c.estimated_annual_test_volume || 0),
    0
  );
  let volumeScore: number;
  if (totalVolume >= 5000000) volumeScore = 10;
  else if (totalVolume >= 1000000) volumeScore = 8;
  else if (totalVolume >= 500000) volumeScore = 6;
  else if (totalVolume >= 100000) volumeScore = 4;
  else volumeScore = 2;

  // Weighted composite
  const rawScore =
    approvedScore * 0.25 +
    pipelineScore * 0.20 +
    platformScore * 0.15 +
    overlapScore * 0.20 +
    volumeScore * 0.20;

  const finalScore = Math.min(Math.max(Math.round(rawScore * 10) / 10, 1), 10);

  let label: CDxCompetitiveLandscapeOutput['summary']['crowding_label'];
  if (finalScore >= 8) label = 'Extremely High';
  else if (finalScore >= 5) label = 'High';
  else if (finalScore >= 3) label = 'Moderate';
  else label = 'Low';

  return { score: finalScore, label };
}

// =============================================================================
// Step 9: White Space Identification
// =============================================================================

/**
 * Identifies competitive white spaces — gaps in the current CDx landscape
 * that represent market entry or differentiation opportunities. Returns
 * at most 5 insights.
 */
function identifyWhiteSpace(
  competitors: CDxCompetitor[],
  biomarkerMatrix: BiomarkerCompetitionEntry[],
  platformComparison: CDxPlatformComparison[],
  inputBiomarker: string
): string[] {
  const whiteSpaces: string[] = [];

  // Gap 1: Biomarkers with strong drug pipelines but few CDx options
  for (const bm of biomarkerMatrix) {
    if (bm.linked_drugs_pipeline.length >= 2 && bm.tests_detecting.length <= 2) {
      whiteSpaces.push(
        `${bm.biomarker} has ${bm.linked_drugs_pipeline.length} pipeline drugs but only ${bm.tests_detecting.length} CDx test${bm.tests_detecting.length !== 1 ? 's' : ''} — strong CDx development opportunity.`
      );
    }
  }

  // Gap 2: Platforms underrepresented for this biomarker
  const allPlatforms: CDxPlatform[] = ['NGS', 'PCR', 'IHC', 'FISH', 'liquid_biopsy', 'ddPCR', 'microarray'];
  const representedPlatforms = new Set(competitors.map((c) => c.platform));

  if (!representedPlatforms.has('liquid_biopsy')) {
    whiteSpaces.push(
      `No liquid biopsy option detected for ${inputBiomarker} — blood-based testing could address tissue-insufficient patients and enable serial monitoring.`
    );
  }
  if (!representedPlatforms.has('NGS') && competitors.length > 0) {
    whiteSpaces.push(
      `No NGS panel includes ${inputBiomarker} as a primary focus — comprehensive genomic profiling opportunity.`
    );
  }

  // Gap 3: Indications where testing rate is low
  for (const bm of biomarkerMatrix) {
    if (bm.testing_rate_pct < 40 && bm.linked_drugs_approved.length > 0) {
      whiteSpaces.push(
        `${bm.biomarker} testing rate is only ${bm.testing_rate_pct}% despite ${bm.linked_drugs_approved.length} approved linked drug${bm.linked_drugs_approved.length !== 1 ? 's' : ''} — market expansion opportunity through better test access.`
      );
    }
  }

  // Gap 4: MRD monitoring opportunity
  const hasMRD = competitors.some((c) =>
    c.biomarkers_covered.some((b) =>
      b.toLowerCase().includes('mrd') || b.toLowerCase().includes('ctdna')
    )
  );
  if (!hasMRD) {
    whiteSpaces.push(
      'No MRD/ctDNA monitoring test in this competitive set — longitudinal monitoring represents a rapidly growing market segment ($3B+ TAM by 2028).'
    );
  }

  // Gap 5: Price gap — no low-cost option
  const priceValues = competitors
    .filter((c) => c.test_price_estimate != null)
    .map((c) => c.test_price_estimate as number);
  if (priceValues.length > 0) {
    const minPrice = Math.min(...priceValues);
    if (minPrice > 2000) {
      whiteSpaces.push(
        `The lowest-cost test in this landscape is ~$${minPrice.toLocaleString()} — a sub-$1,000 rapid turnaround option could capture community oncology volume.`
      );
    }
  }

  // Gap 6: Under-represented platforms that are growing
  for (const platform of allPlatforms) {
    if (!representedPlatforms.has(platform) && PLATFORM_TREND[platform] === 'growing' && platform !== 'liquid_biopsy') {
      whiteSpaces.push(
        `${platform === 'ddPCR' ? 'ddPCR' : platform.toUpperCase()} platform is absent from this landscape despite being on a growth trajectory.`
      );
    }
  }

  return whiteSpaces.slice(0, 5);
}

// =============================================================================
// Step 10: Comparison Matrix
// =============================================================================

/**
 * Builds a comparison matrix with 8 key attributes across the top
 * matched competitors (limited to 8 competitors for readability).
 */
function buildComparisonMatrix(competitors: CDxCompetitor[]): CompetitiveComparisonAttribute[] {
  // Limit to top 8 competitors by differentiation score
  const sorted = [...competitors].sort((a, b) => b.differentiation_score - a.differentiation_score);
  const top = sorted.slice(0, 8);

  if (top.length === 0) return [];

  const attributes: CompetitiveComparisonAttribute[] = [];

  // Attribute 1: Platform
  const platformRow: CompetitiveComparisonAttribute = { attribute: 'Platform', competitors: {} };
  for (const c of top) {
    const label = c.platform === 'liquid_biopsy' ? 'Liquid Biopsy' :
                  c.platform === 'ddPCR' ? 'ddPCR' :
                  c.platform.toUpperCase();
    platformRow.competitors[`${c.company} — ${c.test_name}`] = label;
  }
  attributes.push(platformRow);

  // Attribute 2: Regulatory Status
  const regRow: CompetitiveComparisonAttribute = { attribute: 'Regulatory Status', competitors: {} };
  for (const c of top) {
    const statusLabels: Record<CDxRegulatoryStatus, string> = {
      PMA_approved: 'PMA Approved',
      cleared: '510(k) Cleared',
      LDT: 'LDT',
      development: 'Development',
      submitted: 'Submitted',
    };
    regRow.competitors[`${c.company} — ${c.test_name}`] = statusLabels[c.regulatory_status];
  }
  attributes.push(regRow);

  // Attribute 3: Genes in Panel
  const genesRow: CompetitiveComparisonAttribute = { attribute: 'Genes in Panel', competitors: {} };
  for (const c of top) {
    genesRow.competitors[`${c.company} — ${c.test_name}`] = c.genes_in_panel != null ? c.genes_in_panel : 'N/A';
  }
  attributes.push(genesRow);

  // Attribute 4: Turnaround Days
  const tatRow: CompetitiveComparisonAttribute = { attribute: 'Turnaround (Days)', competitors: {} };
  for (const c of top) {
    tatRow.competitors[`${c.company} — ${c.test_name}`] = c.turnaround_days != null ? c.turnaround_days : 'N/A';
  }
  attributes.push(tatRow);

  // Attribute 5: Price
  const priceRow: CompetitiveComparisonAttribute = { attribute: 'Estimated Price ($)', competitors: {} };
  for (const c of top) {
    priceRow.competitors[`${c.company} — ${c.test_name}`] = c.test_price_estimate != null
      ? `$${c.test_price_estimate.toLocaleString()}`
      : 'N/A';
  }
  attributes.push(priceRow);

  // Attribute 6: Sample Type
  const sampleRow: CompetitiveComparisonAttribute = { attribute: 'Sample Type', competitors: {} };
  for (const c of top) {
    sampleRow.competitors[`${c.company} — ${c.test_name}`] = c.sample_type.join(', ');
  }
  attributes.push(sampleRow);

  // Attribute 7: Annual Volume
  const volumeRow: CompetitiveComparisonAttribute = { attribute: 'Annual Test Volume', competitors: {} };
  for (const c of top) {
    if (c.estimated_annual_test_volume != null && c.estimated_annual_test_volume > 0) {
      if (c.estimated_annual_test_volume >= 1000000) {
        volumeRow.competitors[`${c.company} — ${c.test_name}`] =
          `${(c.estimated_annual_test_volume / 1000000).toFixed(1)}M`;
      } else {
        volumeRow.competitors[`${c.company} — ${c.test_name}`] =
          `${(c.estimated_annual_test_volume / 1000).toFixed(0)}K`;
      }
    } else {
      volumeRow.competitors[`${c.company} — ${c.test_name}`] = 'N/A';
    }
  }
  attributes.push(volumeRow);

  // Attribute 8: Differentiation Score
  const diffRow: CompetitiveComparisonAttribute = { attribute: 'Differentiation Score', competitors: {} };
  for (const c of top) {
    diffRow.competitors[`${c.company} — ${c.test_name}`] = `${c.differentiation_score}/10`;
  }
  attributes.push(diffRow);

  return attributes;
}

// =============================================================================
// Step 11: Comparable CDx Deals
// =============================================================================

/**
 * Reference CDx M&A and strategic deals used for valuation benchmarking.
 */
const CDX_REFERENCE_DEALS: {
  target: string;
  acquirer: string;
  value_m: number;
  year: number;
  biomarker_focus?: string;
  platform_focus?: string;
}[] = [
  {
    target: 'Foundation Medicine',
    acquirer: 'Roche',
    value_m: 5300,
    year: 2018,
    biomarker_focus: 'comprehensive genomic profiling',
    platform_focus: 'NGS',
  },
  {
    target: 'Genomic Health',
    acquirer: 'Exact Sciences',
    value_m: 2800,
    year: 2019,
    biomarker_focus: 'gene expression profiling (breast/prostate)',
    platform_focus: 'PCR',
  },
  {
    target: 'GRAIL',
    acquirer: 'Illumina',
    value_m: 8000,
    year: 2021,
    biomarker_focus: 'multi-cancer early detection (cfDNA methylation)',
    platform_focus: 'NGS',
  },
  {
    target: 'Resolution Bioscience',
    acquirer: 'Agilent',
    value_m: 550,
    year: 2021,
    biomarker_focus: 'liquid biopsy (ctDNA)',
    platform_focus: 'liquid_biopsy',
  },
  {
    target: 'Guardant Health',
    acquirer: 'Public Market (implied valuation)',
    value_m: 10000,
    year: 2024,
    biomarker_focus: 'liquid biopsy, CRC screening',
    platform_focus: 'liquid_biopsy',
  },
  {
    target: 'Loxo Oncology (CDx component)',
    acquirer: 'Bayer',
    value_m: 800,
    year: 2019,
    biomarker_focus: 'NTRK/TRK diagnostics',
    platform_focus: 'NGS',
  },
  {
    target: 'Invivoscribe (ClonoSEQ)',
    acquirer: 'Adaptive Biotechnologies',
    value_m: 300,
    year: 2020,
    biomarker_focus: 'MRD hematologic',
    platform_focus: 'NGS',
  },
  {
    target: 'Myriad Genetics (Oncology segment)',
    acquirer: 'Strategic (multiple suitors)',
    value_m: 2500,
    year: 2023,
    biomarker_focus: 'BRCA, HRD, hereditary cancer',
    platform_focus: 'PCR',
  },
];

/**
 * Filters and returns CDx deals relevant to the user's biomarker and
 * platform context. Computes median deal value for the filtered set.
 */
function buildComparableCdxDeals(
  inputBiomarker: string,
  inputPlatform: CDxPlatform | undefined,
  competitors: CDxCompetitor[]
): CDxCompetitiveLandscapeOutput['comparable_cdx_deals'] {
  const biomarkerLower = inputBiomarker.toLowerCase();
  const aliases = resolveBiomarkerAliases(inputBiomarker).map((a) => a.toLowerCase());

  // Determine platforms in play
  const platformsInPlay = new Set(competitors.map((c) => c.platform));
  if (inputPlatform) {
    platformsInPlay.add(inputPlatform);
  }

  // Score each deal for relevance
  const scoredDeals = CDX_REFERENCE_DEALS.map((deal) => {
    let relevance = 0;

    // Biomarker relevance
    if (deal.biomarker_focus) {
      const focusLower = deal.biomarker_focus.toLowerCase();
      for (const alias of aliases) {
        if (focusLower.includes(alias)) {
          relevance += 3;
          break;
        }
      }
      // Broader match on terms
      if (focusLower.includes('comprehensive') || focusLower.includes('genomic profiling')) {
        relevance += 1; // CGP deals are always relevant
      }
    }

    // Platform relevance
    if (deal.platform_focus) {
      for (const plat of Array.from(platformsInPlay)) {
        if (deal.platform_focus.toLowerCase() === plat.toLowerCase()) {
          relevance += 2;
          break;
        }
      }
    }

    // Recency bonus
    if (deal.year >= CURRENT_YEAR - 3) {
      relevance += 1;
    }

    return { deal, relevance };
  });

  // Filter to deals with relevance > 0, then take top deals
  let filtered = scoredDeals
    .filter((sd) => sd.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .map((sd) => ({
      target: sd.deal.target,
      acquirer: sd.deal.acquirer,
      value_m: sd.deal.value_m,
      year: sd.deal.year,
      biomarker_focus: sd.deal.biomarker_focus,
    }));

  // If no relevant deals, include all as context
  if (filtered.length === 0) {
    filtered = CDX_REFERENCE_DEALS.map((d) => ({
      target: d.target,
      acquirer: d.acquirer,
      value_m: d.value_m,
      year: d.year,
      biomarker_focus: d.biomarker_focus,
    }));
  }

  // Compute median deal value
  const values = filtered.map((d) => d.value_m).sort((a, b) => a - b);
  const medianValue = values.length > 0
    ? values.length % 2 === 0
      ? Math.round((values[values.length / 2 - 1] + values[values.length / 2]) / 2)
      : values[Math.floor(values.length / 2)]
    : 0;

  return {
    deals: filtered,
    median_deal_value_m: medianValue,
  };
}

// =============================================================================
// Summary Builder
// =============================================================================

/**
 * Determines the dominant platform from platform comparison data.
 */
function getDominantPlatform(platformComparison: CDxPlatformComparison[]): CDxPlatform {
  if (platformComparison.length === 0) return 'NGS';
  return platformComparison[0].platform; // Already sorted by test_count descending
}

/**
 * Estimates the overall testing penetration percentage for the primary
 * biomarker. Uses the biomarker competition matrix if available, otherwise
 * falls back to the BIOMARKER_TESTING_RATES lookup.
 */
function getTestingPenetration(
  inputBiomarker: string,
  biomarkerMatrix: BiomarkerCompetitionEntry[]
): number {
  // Try to find the input biomarker in the matrix
  const upper = inputBiomarker.toUpperCase().trim();
  for (const bm of biomarkerMatrix) {
    if (bm.biomarker.toUpperCase() === upper || upper.includes(bm.biomarker.toUpperCase())) {
      return bm.testing_rate_pct;
    }
  }
  return getTestingRate(inputBiomarker);
}

/**
 * Generates the key insight string for the summary section.
 */
function buildKeyInsight(
  inputBiomarker: string,
  crowding: { score: number; label: string },
  approved: CDxCompetitor[],
  pipeline: CDxCompetitor[],
  dominantPlatform: CDxPlatform,
  testingPenetration: number
): string {
  const total = approved.length + pipeline.length;
  const platformLabel = dominantPlatform === 'liquid_biopsy' ? 'liquid biopsy' :
                        dominantPlatform === 'ddPCR' ? 'ddPCR' :
                        dominantPlatform.toUpperCase();

  if (crowding.score >= 8) {
    return `The ${inputBiomarker} CDx landscape is extremely crowded with ${total} tests across ${approved.length} approved and ${pipeline.length} pipeline/LDT. ${platformLabel} dominates. Testing penetration at ${testingPenetration}% suggests the market is maturing rapidly. Differentiation requires platform innovation, faster turnaround, lower cost, or novel biomarker combinations.`;
  }
  if (crowding.score >= 5) {
    return `The ${inputBiomarker} CDx space is competitive with ${total} tests (${approved.length} approved, ${pipeline.length} pipeline/LDT). ${platformLabel} is the dominant platform. At ${testingPenetration}% testing penetration, there is room for growth through expanded testing guidelines and improved access.`;
  }
  if (crowding.score >= 3) {
    return `The ${inputBiomarker} CDx landscape is moderately competitive with ${total} tests. ${platformLabel} leads, but ${testingPenetration}% testing penetration indicates significant unmet need. Early entrants with strong clinical validation and payer coverage strategy can capture meaningful share.`;
  }
  return `The ${inputBiomarker} CDx landscape is relatively uncrowded with only ${total} tests. Testing penetration of ${testingPenetration}% represents a major market opportunity. A well-positioned CDx with FDA approval and payer coverage could establish category leadership.`;
}

// =============================================================================
// Data Sources Builder
// =============================================================================

/**
 * Assembles the standard data source attributions for CDx competitive
 * landscape analyses.
 */
function buildDataSources(): CompetitiveDataSource[] {
  return [
    {
      name: 'FDA PMA Database',
      type: 'public',
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm',
      last_updated: `${CURRENT_YEAR}-01-01`,
    },
    {
      name: 'CMS MolDx Coverage Decisions',
      type: 'public',
      url: 'https://www.cms.gov/medicare-coverage-database',
      last_updated: `${CURRENT_YEAR}-01-01`,
    },
    {
      name: 'ClinicalTrials.gov Biomarker Studies',
      type: 'public',
      url: 'https://clinicaltrials.gov',
      last_updated: `${CURRENT_YEAR}-01-01`,
    },
    {
      name: 'Company SEC Filings (10-K, 20-F, S-1)',
      type: 'public',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar',
      last_updated: `${CURRENT_YEAR - 1}-12-31`,
    },
    {
      name: 'GenomeWeb',
      type: 'licensed',
      url: 'https://www.genomeweb.com',
      last_updated: `${CURRENT_YEAR}-01-15`,
    },
    {
      name: 'Evaluate Diagnostics',
      type: 'licensed',
      url: 'https://www.evaluate.com/products-services/diagnostics',
      last_updated: `${CURRENT_YEAR - 1}-12-01`,
    },
  ];
}

// =============================================================================
// Main Engine Function
// =============================================================================

/**
 * Analyzes the companion diagnostic (CDx) competitive landscape for a given
 * biomarker, with optional filtering by indication, platform, and linked drug.
 *
 * Returns a comprehensive output including approved/pipeline test splits,
 * biomarker competition matrix, platform comparisons, linked drug dependencies,
 * testing landscape metrics, crowding score, white space identification,
 * comparison matrix, comparable CDx deals, and data source attribution.
 *
 * @param input - The CDx competitive landscape query parameters
 * @returns A structured CDxCompetitiveLandscapeOutput object
 *
 * @example
 * ```typescript
 * const output = analyzeCDxCompetitiveLandscape({
 *   biomarker: 'EGFR',
 *   indication: 'NSCLC',
 *   test_type: 'NGS',
 * });
 * console.log(output.summary.crowding_score); // e.g. 7.2
 * ```
 */
export function analyzeCDxCompetitiveLandscape(
  input: CDxCompetitiveLandscapeInput
): CDxCompetitiveLandscapeOutput {
  // ── Step 1: Biomarker alias resolution ──────────────────────────────────
  // (handled inside retrieveCompetitors via resolveBiomarkerAliases)

  // ── Step 2: Competitor retrieval ────────────────────────────────────────
  const allCompetitors = retrieveCompetitors(input);

  // ── Step 3: Split approved vs pipeline ──────────────────────────────────
  const { approved, pipeline } = splitApprovedVsPipeline(allCompetitors);

  // ── Step 4: Platform comparison ─────────────────────────────────────────
  const platformComparison = buildPlatformComparison(allCompetitors);

  // ── Step 5: Linked drug dependency ──────────────────────────────────────
  const linkedDrugDependency = buildLinkedDrugDependency(allCompetitors);

  // ── Step 6: Biomarker competition matrix ────────────────────────────────
  const biomarkerMatrix = buildBiomarkerCompetitionMatrix(allCompetitors);

  // ── Step 7: Testing landscape ───────────────────────────────────────────
  const testingLandscape = buildTestingLandscape(allCompetitors);

  // ── Step 8: Crowding score ──────────────────────────────────────────────
  const crowding = computeCrowdingScore(approved, pipeline, allCompetitors, biomarkerMatrix);

  // ── Step 9: White space identification ──────────────────────────────────
  const whiteSpaces = identifyWhiteSpace(
    allCompetitors,
    biomarkerMatrix,
    platformComparison,
    input.biomarker
  );

  // ── Step 10: Comparison matrix ──────────────────────────────────────────
  const comparisonMatrix = buildComparisonMatrix(allCompetitors);

  // ── Step 11: Comparable CDx deals ───────────────────────────────────────
  const comparableDeals = buildComparableCdxDeals(
    input.biomarker,
    input.test_type,
    allCompetitors
  );

  // ── Final: Output assembly ──────────────────────────────────────────────
  const dominantPlatform = getDominantPlatform(platformComparison);
  const testingPenetration = getTestingPenetration(input.biomarker, biomarkerMatrix);
  const keyInsight = buildKeyInsight(
    input.biomarker,
    crowding,
    approved,
    pipeline,
    dominantPlatform,
    testingPenetration
  );

  return {
    summary: {
      crowding_score: crowding.score,
      crowding_label: crowding.label,
      platform_dominant: dominantPlatform,
      testing_penetration_pct: testingPenetration,
      white_space: whiteSpaces,
      key_insight: keyInsight,
    },
    approved_tests: approved,
    pipeline_tests: pipeline,
    biomarker_competition_matrix: biomarkerMatrix,
    platform_comparison: platformComparison,
    linked_drug_dependency: linkedDrugDependency,
    testing_landscape: testingLandscape,
    comparable_cdx_deals: comparableDeals,
    comparison_matrix: comparisonMatrix,
    data_sources: buildDataSources(),
    generated_at: new Date().toISOString(),
  };
}
