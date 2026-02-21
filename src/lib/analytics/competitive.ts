// ============================================================
// TERRAIN — Competitive Landscape Analysis Engine
// lib/analytics/competitive.ts
//
// Analyzes the competitive landscape for a given indication,
// enriching competitor records with pricing data, deal data,
// differentiation scores, and evidence strength assessments.
//
// Produces a structured CompetitiveLandscapeOutput suitable
// for rendering in the dashboard and exporting to reports.
// ============================================================

import type {
  CompetitiveLandscapeOutput,
  Competitor,
  LandscapeSummary,
  ComparisonAttribute,
  DataSource,
  ClinicalPhase,
} from '@/types';

import { findIndicationByName } from '@/lib/data/indication-map';
import {
  getCompetitorsForIndication,
  getUniqueMechanisms,
  type CompetitorRecord,
} from '@/lib/data/competitor-database';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';

// ────────────────────────────────────────────────────────────
// PUBLIC INPUT TYPE
// ────────────────────────────────────────────────────────────

export interface CompetitiveLandscapeInput {
  indication: string;
  mechanism?: string;
}

// ────────────────────────────────────────────────────────────
// REFERENCE MECHANISM CATEGORIES BY THERAPY AREA
// Used for white-space identification — these are the major
// mechanism categories typically seen in each therapy area.
// If competitors are present but a category is missing,
// that represents a potential white-space opportunity.
// ────────────────────────────────────────────────────────────

const REFERENCE_MECHANISMS: Record<string, string[]> = {
  oncology: [
    'checkpoint_inhibitor_pd1',
    'checkpoint_inhibitor_pdl1',
    'adc',
    'bispecific',
    'car_t',
    'small_molecule_tki',
    'vegf_inhibitor',
    'parp_inhibitor',
    'radioligand',
    'degrader',
  ],
  immunology: [
    'anti_tnf',
    'anti_il6',
    'anti_il17',
    'anti_il23',
    'anti_il4',
    'anti_il13',
    'jak_inhibitor',
    'anti_integrin',
    'anti_cd20',
    'btk_inhibitor',
  ],
  neurology: [
    'anti_amyloid',
    'anti_alpha_synuclein',
    'anti_tau',
    'small_molecule_tki',
    'gene_therapy',
    'antisense_oligonucleotide',
    'nmda_modulator',
    'serotonin_modulator',
  ],
  rare_disease: [
    'gene_therapy',
    'antisense_oligonucleotide',
    'enzyme_replacement',
    'substrate_reduction',
    'small_molecule_tki',
    'mrna_therapy',
    'rna_interference',
  ],
  cardiovascular: [
    'pcsk9_inhibitor',
    'sglt2_inhibitor',
    'glp1_agonist',
    'angiotensin_modulator',
    'siRNA',
    'anti_inflammatory',
  ],
};

// ────────────────────────────────────────────────────────────
// CLINICAL PHASE → EVIDENCE BASE SCORE
// Maps each ClinicalPhase to a baseline evidence strength.
// Additional points are added for endpoint quality and data.
// ────────────────────────────────────────────────────────────

const PHASE_EVIDENCE_MAP: Record<ClinicalPhase, number> = {
  'Approved': 8,
  'Phase 3': 6,
  'Phase 2/3': 5,
  'Phase 2': 4,
  'Phase 1/2': 3,
  'Phase 1': 2,
  'Preclinical': 1,
};

// ────────────────────────────────────────────────────────────
// HELPER: Slugify a string for use as an ID
// ────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ────────────────────────────────────────────────────────────
// HELPER: Clamp a number to [min, max]
// ────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ────────────────────────────────────────────────────────────
// DIFFERENTIATION SCORE (1-10)
//
// Measures how differentiated a competitor's asset is relative
// to the rest of the landscape. Higher = more differentiated.
//
// Scoring:
//   Base: 5
//   +2 if first_in_class
//   +1 if orphan_drug
//   +1 if has_biomarker_selection
//   +1 if mechanism_category is unique among all competitors
//   -1 for EACH additional competitor sharing the same
//      mechanism_category (capped at -3)
//   Clamped to [1, 10]
// ────────────────────────────────────────────────────────────

function calculateDifferentiationScore(
  record: CompetitorRecord,
  allRecords: CompetitorRecord[]
): number {
  let score = 5;

  // First-in-class bonus: a truly novel mechanism commands premium differentiation
  if (record.first_in_class) score += 2;

  // Orphan drug bonus: smaller patient population = less competition typically
  if (record.orphan_drug) score += 1;

  // Biomarker selection bonus: precision medicine approach signals differentiation
  if (record.has_biomarker_selection) score += 1;

  // Mechanism uniqueness assessment
  const sameMechanismCount = allRecords.filter(
    (r) => r.mechanism_category === record.mechanism_category
  ).length;

  if (sameMechanismCount === 1) {
    // This is the only asset with this mechanism — unique
    score += 1;
  } else {
    // Penalize for each additional competitor with the same mechanism.
    // Subtract (sameMechanismCount - 1) but cap at -3.
    const penalty = Math.min(sameMechanismCount - 1, 3);
    score -= penalty;
  }

  return clamp(score, 1, 10);
}

// ────────────────────────────────────────────────────────────
// EVIDENCE STRENGTH (1-10)
//
// Measures the quality and maturity of clinical evidence.
//
// Base score from phase (see PHASE_EVIDENCE_MAP).
// +1 if key_data is non-empty (published data available)
// +1 if primary_endpoint is "OS" (gold standard in oncology)
// Clamped to [1, 10]
// ────────────────────────────────────────────────────────────

function calculateEvidenceStrength(record: CompetitorRecord): number {
  let score = PHASE_EVIDENCE_MAP[record.phase] ?? 1;

  // Bonus for having reported clinical data
  if (record.key_data && record.key_data.trim().length > 0) {
    score += 1;
  }

  // Bonus for gold-standard endpoint (overall survival)
  if (record.primary_endpoint === 'OS') {
    score += 1;
  }

  return clamp(score, 1, 10);
}

// ────────────────────────────────────────────────────────────
// CROWDING SCORE (1-10)
//
// Measures how crowded the competitive landscape is.
//
// Step 1: Base score from total competitor count
//   <=2 → 2, <=4 → 4, <=6 → 5, <=8 → 6, <=10 → 7, <=15 → 8, >15 → 9
//
// Step 2: Mechanism concentration adjustment
//   +1 if most common mechanism represents > 60% of total
//   -1 if most common mechanism represents < 30% of total
//
// Step 3: Late-stage density adjustment
//   +1 if 5 or more assets are in late stage (Phase 3 or Phase 2/3)
//
// Clamped to [1, 10]
//
// Labels:
//   1-3  → "Low"
//   4-5  → "Moderate"
//   6-7  → "High"
//   8-10 → "Extremely High"
// ────────────────────────────────────────────────────────────

function calculateCrowdingScore(
  competitors: CompetitorRecord[],
  _indicationData: { therapy_area: string }
): { score: number; label: LandscapeSummary['crowding_label'] } {
  const total = competitors.length;

  // Step 1: Base score from competitor count
  let score: number;
  if (total <= 2) score = 2;
  else if (total <= 4) score = 4;
  else if (total <= 6) score = 5;
  else if (total <= 8) score = 6;
  else if (total <= 10) score = 7;
  else if (total <= 15) score = 8;
  else score = 9;

  // Step 2: Mechanism concentration adjustment
  if (total > 0) {
    const mechanismCounts: Record<string, number> = {};
    for (const c of competitors) {
      mechanismCounts[c.mechanism_category] =
        (mechanismCounts[c.mechanism_category] || 0) + 1;
    }
    const maxMechanismCount = Math.max(...Object.values(mechanismCounts));
    const dominantPct = maxMechanismCount / total;

    // If one mechanism dominates (> 60%), the landscape is more crowded
    // because entrants are piling into the same approach.
    if (dominantPct > 0.6) {
      score += 1;
    }
    // If mechanisms are widely distributed (< 30% for most common),
    // there is more strategic diversity and slightly less head-to-head crowding.
    if (dominantPct < 0.3) {
      score -= 1;
    }
  }

  // Step 3: Late-stage density adjustment
  const lateStageCount = competitors.filter(
    (c) => c.phase === 'Phase 3' || c.phase === 'Phase 2/3'
  ).length;
  if (lateStageCount >= 5) {
    score += 1;
  }

  score = clamp(score, 1, 10);

  // Determine label
  let label: LandscapeSummary['crowding_label'];
  if (score <= 3) label = 'Low';
  else if (score <= 5) label = 'Moderate';
  else if (score <= 7) label = 'High';
  else label = 'Extremely High';

  return { score, label };
}

// ────────────────────────────────────────────────────────────
// WHITE SPACE IDENTIFICATION
//
// Identifies gaps in the competitive landscape that represent
// opportunities for new entrants. Looks at:
//   1. Missing mechanism categories vs. reference set
//   2. Line-of-therapy gaps (1L, 2L, maintenance)
//   3. Biomarker selection gap (no precision medicine asset)
// Returns up to 5 items.
// ────────────────────────────────────────────────────────────

function identifyWhiteSpace(
  competitors: CompetitorRecord[],
  therapyArea: string,
  indicationName: string
): string[] {
  const whiteSpace: string[] = [];

  // 1. Mechanism category gaps: compare present categories against the reference set
  const presentMechanisms = new Set(getUniqueMechanisms(competitors));
  const refMechanisms = REFERENCE_MECHANISMS[therapyArea] || [];

  for (const refMech of refMechanisms) {
    if (!presentMechanisms.has(refMech)) {
      // Convert mechanism_category slug to a readable label
      const readable = refMech
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      whiteSpace.push(
        `No ${readable} assets in ${indicationName} — potential novel mechanism opportunity`
      );
    }
    // Stop early if we already have enough
    if (whiteSpace.length >= 3) break;
  }

  // 2. Line-of-therapy gaps
  const linesPresent = new Set(
    competitors.map((c) => c.line_of_therapy).filter(Boolean)
  );
  const keyLines = ['1L', '2L', '2L+', 'maintenance'];

  for (const line of keyLines) {
    if (!linesPresent.has(line) && whiteSpace.length < 5) {
      whiteSpace.push(
        `No approved or late-stage asset targeting ${line} treatment in ${indicationName}`
      );
    }
  }

  // 3. Biomarker selection gap: if no competitors use biomarker selection,
  //    there may be an opportunity for precision medicine differentiation.
  const anyBiomarkerSelected = competitors.some((c) => c.has_biomarker_selection);
  if (!anyBiomarkerSelected && whiteSpace.length < 5) {
    whiteSpace.push(
      `No biomarker-selected therapies in ${indicationName} — precision medicine approach could differentiate`
    );
  }

  // Cap at 5
  return whiteSpace.slice(0, 5);
}

// ────────────────────────────────────────────────────────────
// PRICING DATA ENRICHMENT
//
// Attempts to find pricing benchmark data for a competitor
// by matching on drug_name / asset_name (case-insensitive).
// Returns the matched PricingBenchmark or undefined.
// ────────────────────────────────────────────────────────────

interface PricingEnrichment {
  estimated_peak_sales?: string;
  partnership_deal_value?: string;
}

function enrichWithPricingData(record: CompetitorRecord): PricingEnrichment {
  const result: PricingEnrichment = {};

  // Match pricing benchmarks by drug name (case-insensitive)
  const assetLower = record.asset_name.toLowerCase();
  const pricingMatch = PRICING_BENCHMARKS.find(
    (p) => p.drug_name.toLowerCase() === assetLower
  );

  if (pricingMatch) {
    // Estimate peak sales from current list price and therapy area context.
    // This is a rough proxy: use current list price as a signal.
    const price = pricingMatch.current_list_price ?? pricingMatch.us_launch_wac_annual;
    if (price >= 300000) {
      result.estimated_peak_sales = '$1B-$5B (premium-priced specialty)';
    } else if (price >= 150000) {
      result.estimated_peak_sales = '$500M-$3B';
    } else if (price >= 50000) {
      result.estimated_peak_sales = '$200M-$1B';
    } else {
      result.estimated_peak_sales = '$100M-$500M';
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// DEAL DATA ENRICHMENT
//
// Searches the PHARMA_PARTNER_DATABASE for deals matching
// the competitor's asset name or indication.
// ────────────────────────────────────────────────────────────

interface DealEnrichment {
  partner?: string;
  partnership_deal_value?: string;
}

function enrichWithDealData(record: CompetitorRecord): DealEnrichment {
  const result: DealEnrichment = {};

  // If the record already has a partner, skip enrichment
  if (record.partner) {
    return result;
  }

  // Flatten all deals from all partners
  const allDeals = PHARMA_PARTNER_DATABASE.flatMap((p) =>
    p.recent_deals.map((d) => ({
      ...d,
      parent_company: p.company,
    }))
  );

  const assetLower = record.asset_name.toLowerCase();
  const indicationLower = record.indication.toLowerCase();

  // Try matching by asset name first (most specific)
  const assetMatch = allDeals.find(
    (d) =>
      d.asset.toLowerCase().includes(assetLower) ||
      assetLower.includes(d.asset.toLowerCase())
  );

  if (assetMatch) {
    result.partner = assetMatch.parent_company;
    if (assetMatch.total_value_m > 0) {
      result.partnership_deal_value = `$${assetMatch.total_value_m >= 1000
        ? `${(assetMatch.total_value_m / 1000).toFixed(1)}B`
        : `${assetMatch.total_value_m}M`
      } total deal value`;
    }
    return result;
  }

  // Fall back to indication match (broader — only use for companies without a deal)
  const indicationMatch = allDeals.find(
    (d) =>
      d.indication.toLowerCase().includes(indicationLower) ||
      indicationLower.includes(d.indication.toLowerCase())
  );

  if (indicationMatch) {
    result.partner = indicationMatch.parent_company;
    if (indicationMatch.total_value_m > 0) {
      result.partnership_deal_value = `$${indicationMatch.total_value_m >= 1000
        ? `${(indicationMatch.total_value_m / 1000).toFixed(1)}B`
        : `${indicationMatch.total_value_m}M`
      } total deal value`;
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// BUILD COMPETITOR OBJECT
//
// Transforms a CompetitorRecord + enrichment data + computed
// scores into the Competitor type defined in @/types.
// ────────────────────────────────────────────────────────────

function buildCompetitor(
  record: CompetitorRecord,
  allRecords: CompetitorRecord[]
): Competitor {
  const pricingEnrichment = enrichWithPricingData(record);
  const dealEnrichment = enrichWithDealData(record);
  const differentiationScore = calculateDifferentiationScore(record, allRecords);
  const evidenceStrength = calculateEvidenceStrength(record);

  return {
    id: slugify(`${record.indication}-${record.asset_name}`),
    company: record.company,
    asset_name: record.asset_name,
    generic_name: record.generic_name,
    mechanism: record.mechanism,
    molecular_target: record.molecular_target,
    phase: record.phase,
    indication_specifics: record.indication_specifics,
    primary_endpoint: record.primary_endpoint,
    key_data: record.key_data,
    partner: record.partner ?? dealEnrichment.partner,
    partnership_deal_value:
      pricingEnrichment.partnership_deal_value ??
      dealEnrichment.partnership_deal_value,
    estimated_peak_sales: pricingEnrichment.estimated_peak_sales,
    differentiation_score: differentiationScore,
    evidence_strength: evidenceStrength,
    strengths: record.strengths,
    weaknesses: record.weaknesses,
    nct_ids: record.nct_ids,
    source: record.source,
    last_updated: record.last_updated,
  };
}

// ────────────────────────────────────────────────────────────
// BUILD COMPARISON MATRIX
//
// Constructs a structured comparison across all competitors
// for the key attributes that matter in landscape analysis.
// Each attribute becomes a row; each competitor becomes a
// column with its value for that attribute.
// ────────────────────────────────────────────────────────────

function buildComparisonMatrix(competitors: Competitor[]): ComparisonAttribute[] {
  // Limit to the top competitors to avoid an unwieldy matrix.
  // Prioritize approved products and late-stage assets.
  const phaseOrder: ClinicalPhase[] = [
    'Approved',
    'Phase 3',
    'Phase 2/3',
    'Phase 2',
    'Phase 1/2',
    'Phase 1',
    'Preclinical',
  ];
  const sorted = [...competitors].sort(
    (a, b) => phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase)
  );
  const topCompetitors = sorted.slice(0, 12);

  const attributes: ComparisonAttribute[] = [
    {
      attribute: 'Mechanism',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [`${c.company} — ${c.asset_name}`, c.mechanism])
      ),
    },
    {
      attribute: 'Phase',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [`${c.company} — ${c.asset_name}`, c.phase])
      ),
    },
    {
      attribute: 'Primary Endpoint',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.primary_endpoint ?? 'N/A',
        ])
      ),
    },
    {
      attribute: 'Differentiation',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.differentiation_score,
        ])
      ),
    },
    {
      attribute: 'Evidence Strength',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.evidence_strength,
        ])
      ),
    },
    {
      attribute: 'Partnership',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.partner ?? 'None disclosed',
        ])
      ),
    },
  ];

  return attributes;
}

// ────────────────────────────────────────────────────────────
// BUILD DIFFERENTIATION OPPORTUNITY NARRATIVE
// ────────────────────────────────────────────────────────────

function buildDifferentiationOpportunity(
  competitors: Competitor[],
  whiteSpace: string[],
  indicationName: string,
  crowdingLabel: LandscapeSummary['crowding_label']
): string {
  const approved = competitors.filter((c) => c.phase === 'Approved');
  const uniqueMechanisms = new Set(competitors.map((c) => c.mechanism));
  const avgDiff =
    competitors.reduce((sum, c) => sum + c.differentiation_score, 0) /
    (competitors.length || 1);

  if (crowdingLabel === 'Low') {
    return (
      `${indicationName} has a relatively uncrowded competitive landscape with only ` +
      `${competitors.length} tracked assets. With ${approved.length} approved product(s) ` +
      `and ${uniqueMechanisms.size} distinct mechanism(s), new entrants with differentiated ` +
      `profiles have substantial room to establish market position.`
    );
  }

  if (crowdingLabel === 'Moderate') {
    return (
      `The ${indicationName} landscape is moderately competitive with ` +
      `${competitors.length} assets across ${uniqueMechanisms.size} mechanisms. ` +
      `The average differentiation score is ${avgDiff.toFixed(1)}/10, suggesting ` +
      `opportunities for assets with novel mechanisms or biomarker-selected approaches. ` +
      (whiteSpace.length > 0
        ? `Key gaps include: ${whiteSpace[0].toLowerCase()}.`
        : '')
    );
  }

  if (crowdingLabel === 'High') {
    return (
      `${indicationName} is a highly competitive indication with ` +
      `${competitors.length} tracked assets and ${approved.length} approved products. ` +
      `Differentiation is critical — the average differentiation score is only ` +
      `${avgDiff.toFixed(1)}/10. New entrants should focus on unaddressed ` +
      `patient segments, novel combination strategies, or best-in-class clinical profiles.`
    );
  }

  // Extremely High
  return (
    `${indicationName} is an extremely crowded indication with ` +
    `${competitors.length}+ tracked assets competing across ${uniqueMechanisms.size} ` +
    `mechanism categories. With ${approved.length} approved products already on market, ` +
    `differentiation requires a transformative clinical profile, novel mechanism of action, ` +
    `or significant convenience/safety advantages. Consider niche patient segments ` +
    `or combination strategies to establish a defensible position.`
  );
}

// ────────────────────────────────────────────────────────────
// BUILD KEY INSIGHT NARRATIVE
// ────────────────────────────────────────────────────────────

function buildKeyInsight(
  competitors: Competitor[],
  indicationName: string,
  mechanism?: string
): string {
  const approved = competitors.filter((c) => c.phase === 'Approved');
  const lateStage = competitors.filter(
    (c) => c.phase === 'Phase 3' || c.phase === 'Phase 2/3'
  );
  const biomarkerSelected = competitors.filter(
    (c) => c.indication_specifics.toLowerCase().includes('biomarker') ||
           c.indication_specifics.toLowerCase().includes('mutated') ||
           c.indication_specifics.toLowerCase().includes('positive') ||
           c.indication_specifics.toLowerCase().includes('+')
  );

  const parts: string[] = [];

  // Headline stat
  parts.push(
    `The ${indicationName} landscape comprises ${competitors.length} tracked competitive ` +
    `assets: ${approved.length} approved, ${lateStage.length} in late-stage development.`
  );

  // Biomarker trend
  if (biomarkerSelected.length > 0) {
    const pct = Math.round((biomarkerSelected.length / competitors.length) * 100);
    parts.push(
      `Approximately ${pct}% of programs use biomarker-selected populations, ` +
      `reflecting the trend toward precision medicine in this indication.`
    );
  }

  // Mechanism-specific insight if provided
  if (mechanism) {
    const mechCompetitors = competitors.filter(
      (c) =>
        c.mechanism.toLowerCase().includes(mechanism.toLowerCase()) ||
        mechanism.toLowerCase().includes(c.mechanism.toLowerCase())
    );
    if (mechCompetitors.length > 0) {
      parts.push(
        `Within the ${mechanism} class specifically, there are ${mechCompetitors.length} ` +
        `tracked programs, creating direct competitive pressure for new entrants ` +
        `with the same mechanism.`
      );
    } else {
      parts.push(
        `No current competitors target the ${mechanism} mechanism, which could ` +
        `represent a first-in-class opportunity if supported by strong rationale.`
      );
    }
  }

  return parts.join(' ');
}

// ────────────────────────────────────────────────────────────
// BUILD DATA SOURCES
// ────────────────────────────────────────────────────────────

function buildDataSources(indicationName: string): DataSource[] {
  return [
    {
      name: 'Terrain Competitor Database',
      type: 'proprietary',
      last_updated: new Date().toISOString().split('T')[0],
    },
    {
      name: 'ClinicalTrials.gov',
      type: 'public',
      url: `https://clinicaltrials.gov/search?cond=${encodeURIComponent(indicationName)}`,
      last_updated: new Date().toISOString().split('T')[0],
    },
    {
      name: 'FDA Approved Drug Products (Drugs@FDA)',
      type: 'public',
      url: 'https://www.accessdata.fda.gov/scripts/cder/daf/',
    },
    {
      name: 'Terrain Drug Pricing Database',
      type: 'proprietary',
    },
    {
      name: 'SEC EDGAR Company Filings',
      type: 'public',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar',
    },
    {
      name: 'Ambrosia Ventures Deal Intelligence',
      type: 'proprietary',
    },
  ];
}

// ────────────────────────────────────────────────────────────
// MAIN FUNCTION: analyzeCompetitiveLandscape
//
// This is the primary entry point for the competitive
// landscape analysis engine. It:
//   1. Validates the indication
//   2. Retrieves and enriches competitor records
//   3. Calculates differentiation and evidence scores
//   4. Buckets competitors by clinical phase
//   5. Computes landscape crowding and white-space
//   6. Builds narrative summaries and comparison matrix
//   7. Returns the complete CompetitiveLandscapeOutput
// ────────────────────────────────────────────────────────────

export async function analyzeCompetitiveLandscape(
  input: CompetitiveLandscapeInput
): Promise<CompetitiveLandscapeOutput> {

  // ── Step 1: Indication lookup ─────────────────────────────
  // Validate that the indication exists in our data map.
  // This ensures we have epidemiology context and therapy area.
  const indication = findIndicationByName(input.indication);
  if (!indication) {
    throw new Error(
      `Indication not found: "${input.indication}". ` +
      `Check spelling or try a more common name. ` +
      `Terrain covers 150+ indications across oncology, neurology, immunology, rare disease, and more.`
    );
  }

  // ── Step 2: Retrieve competitors ──────────────────────────
  // Pull all competitors from the static database that match
  // this indication. Uses fuzzy matching on indication name.
  const competitorRecords = getCompetitorsForIndication(indication.name);

  // ── Handle 0-competitor case: return empty landscape with white-space ──
  if (competitorRecords.length === 0) {
    const whiteSpace = [
      `No approved or pipeline competitors identified for ${indication.name} — potential first-mover opportunity.`,
      `Consider novel mechanisms targeting ${indication.therapy_area} pathways.`,
      `Validate unmet need through epidemiology data (US prevalence: ${indication.us_prevalence?.toLocaleString() ?? 'N/A'}).`,
    ];
    const summary: LandscapeSummary = {
      indication: indication.name,
      mechanism: input.mechanism,
      crowding_score: 1,
      crowding_label: 'Low',
      differentiation_opportunity: `${indication.name} has no identified competitors in our database. This represents a significant white-space opportunity for first-mover advantage, though it may also indicate challenging biology or limited commercial viability. Conduct thorough diligence on prior failures in this space.`,
      white_space: whiteSpace,
      key_insight: `No competitive assets currently tracked for ${indication.name}. This could represent an untapped therapeutic area or one where prior attempts have failed. The absence of competitors suggests either a significant first-mover opportunity or underlying development challenges that warrant investigation.`,
    };
    return {
      summary,
      approved_products: [],
      late_stage_pipeline: [],
      mid_stage_pipeline: [],
      early_pipeline: [],
      comparison_matrix: [],
      data_sources: [
        { name: 'Terrain Competitive Database', type: 'proprietary', last_updated: new Date().toISOString().split('T')[0] },
        { name: 'ClinicalTrials.gov', type: 'public', last_updated: new Date().toISOString().split('T')[0] },
      ],
      generated_at: new Date().toISOString(),
    };
  }

  // ── Steps 3-8: Enrich and build Competitor objects ────────
  // For each record:
  //   - Enrich with pricing data from PRICING_BENCHMARKS
  //   - Enrich with deal data from PHARMA_PARTNER_DATABASE
  //   - Calculate differentiation score (1-10)
  //   - Calculate evidence strength (1-10)
  //   - Build the typed Competitor object
  const competitors: Competitor[] = competitorRecords.map((record) =>
    buildCompetitor(record, competitorRecords)
  );

  // ── Step 9: Bucket by clinical phase ──────────────────────
  const approved_products = competitors.filter((c) => c.phase === 'Approved');
  const late_stage_pipeline = competitors.filter(
    (c) => c.phase === 'Phase 3' || c.phase === 'Phase 2/3'
  );
  const mid_stage_pipeline = competitors.filter((c) => c.phase === 'Phase 2');
  const early_pipeline = competitors.filter(
    (c) =>
      c.phase === 'Phase 1' ||
      c.phase === 'Phase 1/2' ||
      c.phase === 'Preclinical'
  );

  // ── Step 10: Calculate crowding score ─────────────────────
  const { score: crowdingScore, label: crowdingLabel } = calculateCrowdingScore(
    competitorRecords,
    indication
  );

  // ── Step 11: Identify white space ─────────────────────────
  const whiteSpace = identifyWhiteSpace(
    competitorRecords,
    indication.therapy_area,
    indication.name
  );

  // ── Step 12: Build narratives ─────────────────────────────
  const differentiationOpportunity = buildDifferentiationOpportunity(
    competitors,
    whiteSpace,
    indication.name,
    crowdingLabel
  );

  const keyInsight = buildKeyInsight(
    competitors,
    indication.name,
    input.mechanism
  );

  // ── Step 13: Add mechanism-specific context to summary ────
  // If the user specified a mechanism, add targeted context.
  // This is already handled inside buildKeyInsight, but we
  // also want to surface the mechanism in the summary itself.

  // ── Step 14: Build comparison matrix ──────────────────────
  const comparisonMatrix = buildComparisonMatrix(competitors);

  // ── Step 15: Assemble final output ────────────────────────
  const summary: LandscapeSummary = {
    indication: indication.name,
    mechanism: input.mechanism,
    crowding_score: crowdingScore,
    crowding_label: crowdingLabel,
    differentiation_opportunity: differentiationOpportunity,
    white_space: whiteSpace,
    key_insight: keyInsight,
  };

  const output: CompetitiveLandscapeOutput = {
    summary,
    approved_products,
    late_stage_pipeline,
    mid_stage_pipeline,
    early_pipeline,
    comparison_matrix: comparisonMatrix,
    data_sources: buildDataSources(indication.name),
    generated_at: new Date().toISOString(),
  };

  return output;
}
