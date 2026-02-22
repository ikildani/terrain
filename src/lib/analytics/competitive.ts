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
  ParsedEfficacy,
  ThreatAssessment,
  DisplacementRisk,
  CompetitiveTimeline,
  EfficacyDelta,
  BarrierToEntry,
  BarrierAssessment,
  ConfidenceLevel,
  SafetyProfile,
  MarketShareDistribution,
  CompetitorSuccessProbability,
  DosingConvenience,
  DevelopmentStage,
} from '@/types';

import { findIndicationByName } from '@/lib/data/indication-map';
import {
  getCompetitorsForIndication,
  getUniqueMechanisms,
  type CompetitorRecord,
} from '@/lib/data/competitor-database';
import { PRICING_BENCHMARKS } from '@/lib/data/pricing-benchmarks';
import { PHARMA_PARTNER_DATABASE } from '@/lib/data/partner-database';
import { LOA_BY_PHASE_AND_AREA, DEFAULT_LOA } from '@/lib/data/loa-tables';

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
// CLINICAL EFFICACY PARSING
//
// Extracts structured efficacy metrics from free-text key_data
// fields (ORR%, PFS, OS, HR, CR%, DOR). This enables evidence-
// based scoring and head-to-head comparisons.
// ────────────────────────────────────────────────────────────

function parseEfficacyData(keyData?: string): ParsedEfficacy | undefined {
  if (!keyData || keyData.trim().length === 0) return undefined;

  const text = keyData.toLowerCase();
  const result: ParsedEfficacy = {};

  // ORR: "ORR 42%", "ORR: 42%", "ORR of 42%", "42% ORR"
  const orrMatch = text.match(/orr[\s:=of]*(\d+(?:\.\d+)?)\s*%/) ||
                   text.match(/(\d+(?:\.\d+)?)\s*%\s*orr/);
  if (orrMatch) result.orr_pct = parseFloat(orrMatch[1]);

  // CR: "CR 12%", "CR: 12%", "complete response 12%"
  const crMatch = text.match(/\bcr[\s:=of]*(\d+(?:\.\d+)?)\s*%/) ||
                  text.match(/complete\s*response[\s:=of]*(\d+(?:\.\d+)?)\s*%/);
  if (crMatch) result.cr_pct = parseFloat(crMatch[1]);

  // PFS: "mPFS 8.4 months", "PFS 8.4mo", "PFS: 8.4 months", "median PFS 8.4"
  const pfsMatch = text.match(/(?:m(?:edian)?\s*)?pfs[\s:=of]*(\d+(?:\.\d+)?)\s*(?:mo(?:nths?)?)?/) ||
                   text.match(/pfs[\s:=]*(\d+(?:\.\d+)?)/);
  if (pfsMatch) result.pfs_months = parseFloat(pfsMatch[1]);

  // OS: "mOS 24.6 months", "OS 24.6mo", "median OS 24.6", "overall survival 24.6"
  const osMatch = text.match(/(?:m(?:edian)?\s*)?(?:overall\s*survival|os)[\s:=of]*(\d+(?:\.\d+)?)\s*(?:mo(?:nths?)?)?/);
  if (osMatch) result.os_months = parseFloat(osMatch[1]);

  // OS HR: "HR 0.63", "OS HR 0.63", "HR=0.63", "hazard ratio 0.63"
  // Be careful: this may also capture PFS HR, so check context
  const osHrMatch = text.match(/(?:os\s*)?(?:hazard\s*ratio|hr)[\s:=]*(\d\.\d+)/) ||
                    text.match(/hr[\s:=]*(\d\.\d+)/);
  if (osHrMatch) result.os_hr = parseFloat(osHrMatch[1]);

  // PFS HR: "PFS HR 0.58", "PFS HR=0.58"
  const pfsHrMatch = text.match(/pfs\s*(?:hazard\s*ratio|hr)[\s:=]*(\d\.\d+)/);
  if (pfsHrMatch) result.pfs_hr = parseFloat(pfsHrMatch[1]);

  // DOR: "DOR 12.5 months", "mDOR 12.5mo", "duration of response 12.5"
  const dorMatch = text.match(/(?:m(?:edian)?\s*)?(?:duration\s*of\s*response|dor)[\s:=of]*(\d+(?:\.\d+)?)\s*(?:mo(?:nths?)?)?/);
  if (dorMatch) result.dor_months = parseFloat(dorMatch[1]);

  // Only return if we parsed at least one field
  const hasData = Object.values(result).some(v => v !== undefined);
  return hasData ? result : undefined;
}

// ────────────────────────────────────────────────────────────
// THREAT LEVEL SCORING
//
// Assesses how threatening each competitor is to a new entrant.
// Considers phase proximity, mechanism overlap, efficacy data,
// partnerships, and first-in-class status.
//
// Scale: 1-10
// Labels: 1-3 Low, 4-5 Moderate, 6-7 High, 8-10 Critical
// ────────────────────────────────────────────────────────────

const PHASE_THREAT_SCORE: Record<ClinicalPhase, number> = {
  'Approved': 4,
  'Phase 3': 3,
  'Phase 2/3': 2.5,
  'Phase 2': 2,
  'Phase 1/2': 1,
  'Phase 1': 0.5,
  'Preclinical': 0,
};

function calculateThreatLevel(
  record: CompetitorRecord,
  allRecords: CompetitorRecord[],
  parsedEfficacy?: ParsedEfficacy,
  userMechanism?: string,
): ThreatAssessment {
  let score = 0;
  const factors: string[] = [];

  // Phase proximity
  const phaseScore = PHASE_THREAT_SCORE[record.phase] ?? 0;
  score += phaseScore;
  if (phaseScore >= 3) factors.push(`${record.phase} — near-term competitive entry`);

  // Mechanism overlap with user's asset
  if (userMechanism) {
    const mechLower = record.mechanism.toLowerCase();
    const userMechLower = userMechanism.toLowerCase();
    if (mechLower.includes(userMechLower) || userMechLower.includes(mechLower)) {
      score += 2;
      factors.push('Same mechanism of action — direct competitor');
    } else {
      // Check for related mechanisms (same category)
      const mechCat = record.mechanism_category;
      const userTokens = userMechLower.split(/[\s\-_]+/);
      const catMatches = userTokens.some(t => mechCat.includes(t));
      if (catMatches) {
        score += 1;
        factors.push('Related mechanism category');
      }
    }
  }

  // Strong efficacy data
  if (parsedEfficacy) {
    if (parsedEfficacy.os_hr && parsedEfficacy.os_hr < 0.65) {
      score += 1;
      factors.push(`Strong OS benefit (HR ${parsedEfficacy.os_hr})`);
    }
    if (parsedEfficacy.orr_pct && parsedEfficacy.orr_pct >= 40) {
      score += 0.5;
      factors.push(`High ORR (${parsedEfficacy.orr_pct}%)`);
    }
  }

  // Big Pharma partnership
  if (record.partner) {
    score += 0.5;
    factors.push(`Partnered with ${record.partner}`);
  }

  // First-in-class
  if (record.first_in_class) {
    score += 0.5;
    factors.push('First-in-class mechanism');
  }

  score = clamp(Math.round(score * 10) / 10, 1, 10);

  let threat_level: ThreatAssessment['threat_level'];
  if (score <= 3) threat_level = 'Low';
  else if (score <= 5) threat_level = 'Moderate';
  else if (score <= 7) threat_level = 'High';
  else threat_level = 'Critical';

  return { threat_score: score, threat_level, threat_factors: factors };
}

// ────────────────────────────────────────────────────────────
// DISPLACEMENT RISK ASSESSMENT
//
// Evaluates whether dominant incumbents or near-term same-
// mechanism launches pose displacement risk for new entrants.
// ────────────────────────────────────────────────────────────

function assessDisplacementRisk(
  competitors: Competitor[],
  userMechanism?: string,
): DisplacementRisk {
  const threats: string[] = [];

  // Check for dominant approved incumbents
  const approved = competitors.filter(c => c.phase === 'Approved');
  const dominantIncumbents = approved.filter(
    c => c.differentiation_score >= 7 && c.evidence_strength >= 8
  );
  if (dominantIncumbents.length > 0) {
    threats.push(
      ...dominantIncumbents.map(c =>
        `${c.company} (${c.asset_name}) — highly differentiated approved product with strong evidence`
      )
    );
  }

  // Check for near-term same-mechanism Phase 3 launches
  if (userMechanism) {
    const mechLower = userMechanism.toLowerCase();
    const sameMechP3 = competitors.filter(c => {
      const isLateStage = c.phase === 'Phase 3' || c.phase === 'Phase 2/3';
      const mechMatch = c.mechanism.toLowerCase().includes(mechLower) ||
                        mechLower.includes(c.mechanism.toLowerCase());
      return isLateStage && mechMatch;
    });
    if (sameMechP3.length > 0) {
      threats.push(
        ...sameMechP3.map(c =>
          `${c.company} (${c.asset_name}) — same mechanism in ${c.phase}, near-term launch risk`
        )
      );
    }
  }

  // Check for crowded approved market
  if (approved.length >= 5) {
    threats.push(`${approved.length} approved products — highly saturated market with established standard of care`);
  }

  let risk_level: DisplacementRisk['risk_level'];
  if (threats.length === 0) {
    risk_level = 'low';
  } else if (dominantIncumbents.length >= 2 || threats.length >= 3) {
    risk_level = 'high';
  } else {
    risk_level = 'medium';
  }

  const narrativeParts: string[] = [];
  if (risk_level === 'low') {
    narrativeParts.push('Low displacement risk. No dominant incumbents or near-term same-mechanism competitors identified.');
  } else if (risk_level === 'medium') {
    narrativeParts.push('Moderate displacement risk. Some competitive pressure exists, but differentiated positioning can mitigate.');
  } else {
    narrativeParts.push('High displacement risk. Dominant incumbents and/or near-term same-mechanism competitors create significant barriers to market entry.');
  }

  return {
    risk_level,
    narrative: narrativeParts.join(' '),
    key_threats: threats.slice(0, 5),
  };
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

function calculateEvidenceStrength(
  record: CompetitorRecord,
  parsedEfficacy?: ParsedEfficacy,
): number {
  let score = PHASE_EVIDENCE_MAP[record.phase] ?? 1;

  // Bonus for having reported clinical data
  if (record.key_data && record.key_data.trim().length > 0) {
    score += 1;
  }

  // Bonus for gold-standard endpoint (overall survival)
  if (record.primary_endpoint === 'OS') {
    score += 1;
  }

  // Bonus for parsed efficacy data quality
  if (parsedEfficacy) {
    if (parsedEfficacy.os_months || parsedEfficacy.os_hr) {
      score += 0.5; // OS data available
    }
    if (parsedEfficacy.orr_pct && parsedEfficacy.orr_pct >= 30) {
      score += 0.5; // Meaningful response rate
    }
    if (parsedEfficacy.pfs_months && parsedEfficacy.pfs_months >= 6) {
      score += 0.5; // Clinically meaningful PFS
    }
    if (parsedEfficacy.os_hr && parsedEfficacy.os_hr < 0.70) {
      score += 0.5; // Strong survival benefit
    }
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

const PHASE_CROWDING_WEIGHT: Record<ClinicalPhase, number> = {
  'Approved': 2.0,
  'Phase 3': 1.5,
  'Phase 2/3': 1.25,
  'Phase 2': 1.0,
  'Phase 1/2': 0.5,
  'Phase 1': 0.3,
  'Preclinical': 0.1,
};

function calculateCrowdingScore(
  competitors: CompetitorRecord[],
  _indicationData: { therapy_area: string }
): { score: number; label: LandscapeSummary['crowding_label'] } {
  const total = competitors.length;

  // Step 1: Phase-weighted competitor count
  // Late-stage and approved products contribute more to crowding than early-stage
  const weightedTotal = competitors.reduce((sum, c) => {
    return sum + (PHASE_CROWDING_WEIGHT[c.phase] ?? 0.5);
  }, 0);

  let score: number;
  if (weightedTotal <= 3) score = 2;
  else if (weightedTotal <= 6) score = 4;
  else if (weightedTotal <= 10) score = 5;
  else if (weightedTotal <= 15) score = 6;
  else if (weightedTotal <= 20) score = 7;
  else if (weightedTotal <= 30) score = 8;
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

    if (dominantPct > 0.6) {
      score += 1;
    }
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
// COMPETITIVE TIMELINE MODEL
//
// Estimates expected data readout, filing, and launch dates
// based on current clinical phase. Uses current date as anchor
// and applies phase-specific development timelines.
//
// Confidence increases with phase maturity (later = higher).
// Risk factors account for indication complexity, modality,
// and regulatory challenges.
// ────────────────────────────────────────────────────────────

const PHASE_READOUT_MONTHS: Record<ClinicalPhase, { min: number; max: number } | null> = {
  'Preclinical': { min: 36, max: 60 },
  'Phase 1': { min: 12, max: 18 },
  'Phase 1/2': { min: 18, max: 24 },
  'Phase 2': { min: 12, max: 24 },
  'Phase 2/3': { min: 18, max: 30 },
  'Phase 3': { min: 24, max: 36 },
  'Approved': null,
};

const PHASE_CONFIDENCE: Record<ClinicalPhase, 'high' | 'medium' | 'low'> = {
  'Approved': 'high',
  'Phase 3': 'high',
  'Phase 2/3': 'medium',
  'Phase 2': 'medium',
  'Phase 1/2': 'low',
  'Phase 1': 'low',
  'Preclinical': 'low',
};

function formatFutureDate(monthsFromNow: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, 1);
  const quarter = Math.ceil((target.getMonth() + 1) / 4);
  const half = target.getMonth() < 6 ? 1 : 2;
  const year = target.getFullYear();

  // Use quarter format for <=24 months, half-year for >24 months
  if (monthsFromNow <= 24) {
    return `Q${quarter} ${year}`;
  }
  return `H${half} ${year}`;
}

function buildCompetitiveTimeline(record: CompetitorRecord): CompetitiveTimeline {
  const riskFactors: string[] = [];

  // Determine timeline risk factors
  const mechLower = record.mechanism.toLowerCase();
  const indicLower = record.indication.toLowerCase();

  if (record.orphan_drug) {
    riskFactors.push('Rare disease enrollment challenges may extend timelines');
  }
  if (mechLower.includes('car-t') || mechLower.includes('car_t') || mechLower.includes('gene therapy') || mechLower.includes('gene_therapy')) {
    riskFactors.push('Manufacturing complexity for cell/gene therapy may delay scale-up');
  }
  if (mechLower.includes('biologic') || mechLower.includes('antibody') || mechLower.includes('adc') || mechLower.includes('bispecific')) {
    riskFactors.push('Biologics manufacturing and CMC requirements add regulatory complexity');
  }
  if (indicLower.includes('pediatric') || indicLower.includes('children')) {
    riskFactors.push('Pediatric population requires additional safety monitoring and regulatory considerations');
  }
  if (record.phase === 'Preclinical' || record.phase === 'Phase 1') {
    riskFactors.push('Early-stage attrition risk remains high — timeline subject to significant uncertainty');
  }
  if (mechLower.includes('first') || record.first_in_class) {
    riskFactors.push('First-in-class mechanism may face additional regulatory scrutiny and longer review');
  }

  // Approved products — already launched
  if (record.phase === 'Approved') {
    return {
      company: record.company,
      asset_name: record.asset_name,
      current_phase: record.phase,
      expected_data_readout: undefined,
      estimated_filing_date: undefined,
      estimated_launch_date: 'Launched',
      confidence: 'high',
      timeline_risk_factors: riskFactors.length > 0 ? riskFactors : ['Product already on market — minimal timeline risk'],
    };
  }

  // Calculate readout, filing, and launch dates
  const readoutRange = PHASE_READOUT_MONTHS[record.phase];
  if (!readoutRange) {
    return {
      company: record.company,
      asset_name: record.asset_name,
      current_phase: record.phase,
      confidence: 'low',
      timeline_risk_factors: riskFactors,
    };
  }

  const readoutMidpoint = Math.round((readoutRange.min + readoutRange.max) / 2);
  const expectedReadout = formatFutureDate(readoutMidpoint);

  // Filing: readout + 6-12 months for submission prep
  const filingMin = readoutRange.max + 6;
  const filingMax = readoutRange.max + 12;
  const filingMidpoint = Math.round((filingMin + filingMax) / 2);
  const estimatedFiling = formatFutureDate(filingMidpoint);

  // Launch: filing + 10-18 months for review
  const launchMin = filingMax + 10;
  const launchMax = filingMax + 18;
  const launchMidpoint = Math.round((launchMin + launchMax) / 2);
  const estimatedLaunch = formatFutureDate(launchMidpoint);

  return {
    company: record.company,
    asset_name: record.asset_name,
    current_phase: record.phase,
    expected_data_readout: expectedReadout,
    estimated_filing_date: estimatedFiling,
    estimated_launch_date: estimatedLaunch,
    confidence: PHASE_CONFIDENCE[record.phase],
    timeline_risk_factors: riskFactors,
  };
}


// ────────────────────────────────────────────────────────────
// EFFICACY DELTA SCORING
//
// Compares each competitor's parsed efficacy against the
// best-in-class benchmark (approved product with best data,
// or median of approved products). Calculates deltas for
// ORR, PFS, and OS HR with clinical significance narratives.
//
// Significance thresholds:
//   ORR: >=10 percentage points
//   PFS: >=3 months
//   OS HR: <=0.15 difference
// ────────────────────────────────────────────────────────────

function buildEfficacyDeltas(
  competitor: Competitor,
  allCompetitors: Competitor[],
  _userMechanism?: string,
): EfficacyDelta[] {
  const deltas: EfficacyDelta[] = [];

  if (!competitor.parsed_efficacy) return deltas;

  // Establish best-in-class benchmarks from approved products
  const approvedWithEfficacy = allCompetitors.filter(
    c => c.phase === 'Approved' && c.parsed_efficacy
  );

  if (approvedWithEfficacy.length === 0) return deltas;

  // Helper: median of sorted array
  function median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  // Calculate benchmark values: median among approved products
  const approvedORRs = approvedWithEfficacy
    .map(c => c.parsed_efficacy?.orr_pct)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b);

  const approvedPFS = approvedWithEfficacy
    .map(c => c.parsed_efficacy?.pfs_months)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b);

  const approvedOSHR = approvedWithEfficacy
    .map(c => c.parsed_efficacy?.os_hr)
    .filter((v): v is number => v !== undefined)
    .sort((a, b) => a - b);

  const benchmarkORR = approvedORRs.length > 0 ? median(approvedORRs) : undefined;
  const benchmarkPFS = approvedPFS.length > 0 ? median(approvedPFS) : undefined;
  const benchmarkOSHR = approvedOSHR.length > 0 ? median(approvedOSHR) : undefined;

  const eff = competitor.parsed_efficacy;

  // ORR delta: higher is favorable, significance >= 10pp
  if (eff.orr_pct !== undefined && benchmarkORR !== undefined) {
    const delta = eff.orr_pct - benchmarkORR;
    const absDelta = Math.abs(delta);
    let direction: EfficacyDelta['delta_direction'];
    let significance: string;

    if (absDelta < 10) {
      direction = 'neutral';
      significance = `ORR of ${eff.orr_pct}% vs benchmark ${benchmarkORR.toFixed(1)}% (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp) — within clinically comparable range.`;
    } else if (delta > 0) {
      direction = 'favorable';
      significance = `ORR of ${eff.orr_pct}% is ${delta.toFixed(1)}pp above the approved benchmark of ${benchmarkORR.toFixed(1)}% — a clinically meaningful improvement in objective response.`;
    } else {
      direction = 'unfavorable';
      significance = `ORR of ${eff.orr_pct}% is ${absDelta.toFixed(1)}pp below the approved benchmark of ${benchmarkORR.toFixed(1)}% — may face differentiation challenges on response rate.`;
    }

    deltas.push({
      competitor: `${competitor.company} — ${competitor.asset_name}`,
      metric: 'ORR',
      competitor_value: eff.orr_pct,
      benchmark_value: benchmarkORR,
      delta: Math.round(delta * 10) / 10,
      delta_direction: direction,
      clinical_significance: significance,
    });
  }

  // PFS delta: higher is favorable, significance >= 3 months
  if (eff.pfs_months !== undefined && benchmarkPFS !== undefined) {
    const delta = eff.pfs_months - benchmarkPFS;
    const absDelta = Math.abs(delta);
    let direction: EfficacyDelta['delta_direction'];
    let significance: string;

    if (absDelta < 3) {
      direction = 'neutral';
      significance = `PFS of ${eff.pfs_months} months vs benchmark ${benchmarkPFS.toFixed(1)} months (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}mo) — no clinically meaningful PFS difference.`;
    } else if (delta > 0) {
      direction = 'favorable';
      significance = `PFS of ${eff.pfs_months} months is ${delta.toFixed(1)} months longer than the approved benchmark of ${benchmarkPFS.toFixed(1)} months — clinically meaningful progression-free survival advantage.`;
    } else {
      direction = 'unfavorable';
      significance = `PFS of ${eff.pfs_months} months is ${absDelta.toFixed(1)} months shorter than the approved benchmark of ${benchmarkPFS.toFixed(1)} months — inferior PFS could limit commercial uptake.`;
    }

    deltas.push({
      competitor: `${competitor.company} — ${competitor.asset_name}`,
      metric: 'PFS',
      competitor_value: eff.pfs_months,
      benchmark_value: benchmarkPFS,
      delta: Math.round(delta * 10) / 10,
      delta_direction: direction,
      clinical_significance: significance,
    });
  }

  // OS HR delta: lower is favorable, significance <= 0.15 difference
  if (eff.os_hr !== undefined && benchmarkOSHR !== undefined) {
    const delta = eff.os_hr - benchmarkOSHR;
    const absDelta = Math.abs(delta);
    let direction: EfficacyDelta['delta_direction'];
    let significance: string;

    if (absDelta <= 0.15) {
      direction = 'neutral';
      significance = `OS HR of ${eff.os_hr} vs benchmark ${benchmarkOSHR.toFixed(2)} (delta ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}) — hazard ratios are within a clinically comparable range.`;
    } else if (delta < 0) {
      direction = 'favorable';
      significance = `OS HR of ${eff.os_hr} is ${absDelta.toFixed(2)} lower than the approved benchmark of ${benchmarkOSHR.toFixed(2)} — indicates a meaningfully stronger overall survival benefit.`;
    } else {
      direction = 'unfavorable';
      significance = `OS HR of ${eff.os_hr} is ${absDelta.toFixed(2)} higher than the approved benchmark of ${benchmarkOSHR.toFixed(2)} — weaker survival signal relative to established therapies.`;
    }

    deltas.push({
      competitor: `${competitor.company} — ${competitor.asset_name}`,
      metric: 'OS HR',
      competitor_value: eff.os_hr,
      benchmark_value: benchmarkOSHR,
      delta: Math.round(delta * 100) / 100,
      delta_direction: direction,
      clinical_significance: significance,
    });
  }

  return deltas;
}


// ────────────────────────────────────────────────────────────
// BARRIER-TO-ENTRY ASSESSMENT
//
// Evaluates six dimensions of market barriers:
//   1. IP Protection (orphan drug, first-in-class exclusivity)
//   2. Manufacturing Complexity (biologics, CAR-T, gene therapy)
//   3. First-Mover Advantage (dominant incumbents)
//   4. Regulatory Exclusivity (orphan, NCE, biologics 12-year)
//   5. Payer Entrenchment (step therapy, formulary position)
//   6. KOL Network (entrenched relationships from incumbents)
//
// Returns overall barrier score (1-10), label, and narrative.
// ────────────────────────────────────────────────────────────

// Helper for barrier assessment: find the dominant mechanism among competitors
function findDominantMechanism(records: CompetitorRecord[]): string {
  const mechCounts: Record<string, number> = {};
  for (const r of records) {
    mechCounts[r.mechanism] = (mechCounts[r.mechanism] || 0) + 1;
  }
  let maxCount = 0;
  let dominant = '';
  for (const [mech, count] of Object.entries(mechCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = mech;
    }
  }
  return dominant;
}

function assessBarriers(
  competitors: Competitor[],
  competitorRecords: CompetitorRecord[],
  indicationData: { therapy_area: string },
  _userMechanism?: string,
): BarrierAssessment {
  const barriers: BarrierToEntry[] = [];
  const approved = competitors.filter(c => c.phase === 'Approved');
  const approvedRecords = competitorRecords.filter(r => r.phase === 'Approved');

  // 1. IP Protection
  const orphanDrugCompetitors = competitorRecords.filter(r => r.orphan_drug && r.phase === 'Approved');
  const firstInClassApproved = competitorRecords.filter(r => r.first_in_class && r.phase === 'Approved');

  let ipSeverity: BarrierToEntry['severity'] = 'low';
  const ipAffected: string[] = [];

  if (firstInClassApproved.length >= 2) {
    ipSeverity = 'high';
  } else if (firstInClassApproved.length >= 1 || orphanDrugCompetitors.length >= 1) {
    ipSeverity = 'medium';
  }

  for (const r of [...orphanDrugCompetitors, ...firstInClassApproved]) {
    const name = r.company + ' (' + r.asset_name + ')';
    if (!ipAffected.includes(name)) ipAffected.push(name);
  }

  const ipDescParts: string[] = [];
  if (orphanDrugCompetitors.length > 0) {
    ipDescParts.push(orphanDrugCompetitors.length + ' approved product(s) hold orphan drug designation with 7-year market exclusivity');
  }
  if (firstInClassApproved.length > 0) {
    ipDescParts.push(firstInClassApproved.length + ' first-in-class approved product(s) may hold composition-of-matter patents blocking similar mechanisms');
  }

  if (ipDescParts.length > 0) {
    barriers.push({
      barrier_type: 'ip_protection',
      severity: ipSeverity,
      description: ipDescParts.join('. ') + '.',
      affected_competitors: ipAffected,
    });
  }

  // 2. Manufacturing Complexity
  const allMechanisms = competitorRecords.map(r => r.mechanism.toLowerCase());
  const complexModalities = ['car-t', 'car_t', 'gene therapy', 'gene_therapy', 'bispecific', 'adc', 'antibody-drug conjugate'];
  const dominantMechanism = findDominantMechanism(competitorRecords);
  const dominantMechLower = dominantMechanism.toLowerCase();

  const isComplexModality = complexModalities.some(m =>
    dominantMechLower.includes(m) || allMechanisms.some(am => am.includes(m))
  );

  if (isComplexModality) {
    const complexCompetitors = competitorRecords
      .filter(r => complexModalities.some(m => r.mechanism.toLowerCase().includes(m)))
      .map(r => r.company + ' (' + r.asset_name + ')');

    barriers.push({
      barrier_type: 'manufacturing_complexity',
      severity: 'high',
      description: 'Dominant competitive modalities involve complex biologics (CAR-T, gene therapy, ADC, or bispecific antibodies), requiring specialized manufacturing infrastructure, supply chain capabilities, and CMC expertise that create significant barriers for new entrants.',
      affected_competitors: Array.from(new Set(complexCompetitors)),
    });
  } else {
    const biologicsPresent = allMechanisms.some(m =>
      m.includes('antibody') || m.includes('biologic') || (m.includes('inhibitor') && !m.includes('small molecule'))
    );
    if (biologicsPresent) {
      barriers.push({
        barrier_type: 'manufacturing_complexity',
        severity: 'medium',
        description: 'Biologics-based therapies in the landscape require specialized manufacturing and are subject to FDA/EMA biosimilar exclusivity periods.',
        affected_competitors: [],
      });
    }
  }

  // 3. First-Mover Advantage
  const dominantIncumbents = approved.filter(c => c.evidence_strength >= 8);
  let fmaSeverity: BarrierToEntry['severity'] = 'low';

  if (dominantIncumbents.length >= 2) {
    fmaSeverity = 'high';
  } else if (dominantIncumbents.length >= 1) {
    fmaSeverity = 'medium';
  }

  if (dominantIncumbents.length > 0) {
    barriers.push({
      barrier_type: 'first_mover',
      severity: fmaSeverity,
      description: dominantIncumbents.length + ' approved product(s) have high evidence strength (>=8/10), establishing entrenched clinical adoption, guideline inclusion, and prescribing habits that new entrants must overcome.',
      affected_competitors: dominantIncumbents.map(c => c.company + ' (' + c.asset_name + ')'),
    });
  }

  // 4. Regulatory Exclusivity
  const exclusivityBarriers: string[] = [];
  const exclusivityAffected: string[] = [];

  if (orphanDrugCompetitors.length > 0) {
    exclusivityBarriers.push('Orphan Drug Exclusivity (7 years) held by ' + orphanDrugCompetitors.length + ' product(s)');
    orphanDrugCompetitors.forEach(r => exclusivityAffected.push(r.company + ' (' + r.asset_name + ')'));
  }

  const recentApprovals = approvedRecords.filter(r => {
    const year = parseInt(r.last_updated.slice(0, 4), 10);
    return year >= 2020;
  });
  if (recentApprovals.length > 0) {
    exclusivityBarriers.push('Potential NCE exclusivity (5 years) for ' + recentApprovals.length + ' recently approved product(s)');
    recentApprovals.forEach(r => {
      const name = r.company + ' (' + r.asset_name + ')';
      if (!exclusivityAffected.includes(name)) exclusivityAffected.push(name);
    });
  }

  const biologicApprovals = approvedRecords.filter(r => {
    const mechLower = r.mechanism.toLowerCase();
    return mechLower.includes('antibody') || mechLower.includes('biologic') ||
           mechLower.includes('adc') || mechLower.includes('bispecific') ||
           mechLower.includes('car-t') || mechLower.includes('gene therapy');
  });
  if (biologicApprovals.length > 0) {
    exclusivityBarriers.push('Biologics reference product exclusivity (12 years) for ' + biologicApprovals.length + ' approved biologic(s)');
    biologicApprovals.forEach(r => {
      const name = r.company + ' (' + r.asset_name + ')';
      if (!exclusivityAffected.includes(name)) exclusivityAffected.push(name);
    });
  }

  if (exclusivityBarriers.length > 0) {
    let exclSeverity: BarrierToEntry['severity'] = 'low';
    if (orphanDrugCompetitors.length >= 2 || biologicApprovals.length >= 2) {
      exclSeverity = 'high';
    } else if (exclusivityBarriers.length >= 2) {
      exclSeverity = 'medium';
    }

    barriers.push({
      barrier_type: 'regulatory_exclusivity',
      severity: exclSeverity,
      description: exclusivityBarriers.join('. ') + '.',
      affected_competitors: Array.from(new Set(exclusivityAffected)),
    });
  }

  // 5. Payer Entrenchment
  if (approved.length >= 5) {
    barriers.push({
      barrier_type: 'payer_entrenchment',
      severity: 'high',
      description: 'With ' + approved.length + ' approved products, payers have established step therapy requirements, preferred formulary positions, and rebate contracts. New entrants must demonstrate substantial clinical differentiation or cost advantages to gain formulary access.',
      affected_competitors: approved.map(c => c.company + ' (' + c.asset_name + ')'),
    });
  } else if (approved.length >= 3) {
    barriers.push({
      barrier_type: 'payer_entrenchment',
      severity: 'medium',
      description: approved.length + ' approved products have established formulary positions. Payer negotiations will require evidence of incremental clinical benefit to justify addition to coverage.',
      affected_competitors: approved.map(c => c.company + ' (' + c.asset_name + ')'),
    });
  }

  // 6. KOL Network
  const longTermIncumbents = approvedRecords.filter(r => {
    const year = parseInt(r.last_updated.slice(0, 4), 10);
    return year <= 2022 || (r.key_data && r.key_data.length > 100);
  });

  if (longTermIncumbents.length >= 2) {
    barriers.push({
      barrier_type: 'kol_network',
      severity: 'high',
      description: longTermIncumbents.length + ' established products have built deep KOL relationships through years of clinical experience, advisory boards, and investigator-sponsored studies. New entrants must invest significantly in medical affairs to build comparable thought leader engagement.',
      affected_competitors: longTermIncumbents.map(r => r.company + ' (' + r.asset_name + ')'),
    });
  } else if (longTermIncumbents.length >= 1) {
    barriers.push({
      barrier_type: 'kol_network',
      severity: 'medium',
      description: 'Established incumbent(s) have existing KOL relationships that provide prescribing inertia. New entrants should prioritize medical affairs engagement and investigator-sponsored study programs.',
      affected_competitors: longTermIncumbents.map(r => r.company + ' (' + r.asset_name + ')'),
    });
  }

  // Calculate overall barrier score
  const severityWeights: Record<BarrierToEntry['severity'], number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  let totalWeight = 0;
  for (const b of barriers) {
    totalWeight += severityWeights[b.severity];
  }

  // Normalize to 1-10 scale. Max possible is 6 barriers * 3 = 18
  const rawScore = barriers.length > 0
    ? (totalWeight / Math.max(barriers.length, 1)) * (barriers.length / 6) * 10
    : 1;
  const overallScore = clamp(Math.round(rawScore * 10) / 10, 1, 10);

  let barrierLabel: BarrierAssessment['barrier_label'];
  if (overallScore <= 3) barrierLabel = 'Low';
  else if (overallScore <= 5) barrierLabel = 'Moderate';
  else if (overallScore <= 7) barrierLabel = 'High';
  else barrierLabel = 'Very High';

  // Build narrative
  const highBarriers = barriers.filter(b => b.severity === 'high');
  const mediumBarriers = barriers.filter(b => b.severity === 'medium');

  let narrative: string;
  if (barriers.length === 0) {
    narrative = 'The ' + indicationData.therapy_area + ' landscape presents minimal barriers to entry. No significant IP protection, manufacturing complexity, or payer entrenchment barriers were identified, suggesting relatively open competitive access for new entrants.';
  } else if (highBarriers.length >= 3) {
    narrative = 'The competitive landscape presents very high barriers to entry (' + overallScore + '/10). ' + highBarriers.length + ' high-severity barriers were identified, including ' + highBarriers.map(b => b.barrier_type.replace(/_/g, ' ')).join(', ') + '. New entrants require transformative clinical differentiation, substantial manufacturing capabilities, and robust market access strategies to compete effectively.';
  } else if (highBarriers.length >= 1) {
    narrative = 'The competitive landscape presents ' + barrierLabel.toLowerCase() + ' barriers to entry (' + overallScore + '/10). Key challenges include ' + highBarriers.map(b => b.barrier_type.replace(/_/g, ' ')).join(', ') + (mediumBarriers.length > 0 ? ', with moderate barriers in ' + mediumBarriers.map(b => b.barrier_type.replace(/_/g, ' ')).join(', ') : '') + '. Differentiated clinical profiles and strategic positioning can mitigate these barriers.';
  } else {
    narrative = 'The competitive landscape presents ' + barrierLabel.toLowerCase() + ' barriers to entry (' + overallScore + '/10) across ' + barriers.length + ' dimension(s). While no single barrier is prohibitive, cumulative challenges in ' + barriers.map(b => b.barrier_type.replace(/_/g, ' ')).join(', ') + ' should be factored into market entry planning.';
  }

  return {
    overall_barrier_score: overallScore,
    barrier_label: barrierLabel,
    barriers,
    narrative,
  };
}


// ────────────────────────────────────────────────────────────
// SAFETY PROFILE PARSING
//
// Extracts structured safety data from free-text key_data
// fields (grade 3+ AE rate, discontinuation rate, irAE rate).
// Falls back to mechanism-class defaults when no data found.
//
// Returns SafetyProfile with safety score (1-10), key signals,
// and a safety-vs-efficacy tradeoff narrative.
// ────────────────────────────────────────────────────────────

const MECHANISM_SAFETY_DEFAULTS: Record<string, { grade3: number; disc: number; irae: number }> = {
  checkpoint_inhibitor: { grade3: 15, disc: 8, irae: 25 },
  car_t:               { grade3: 60, disc: 5, irae: 0 },
  adc:                 { grade3: 25, disc: 12, irae: 0 },
  small_molecule_tki:  { grade3: 20, disc: 10, irae: 0 },
  bispecific:          { grade3: 30, disc: 8, irae: 0 },
  cdk_inhibitor:       { grade3: 18, disc: 7, irae: 0 },
  vegf_inhibitor:      { grade3: 22, disc: 9, irae: 0 },
  default:             { grade3: 20, disc: 10, irae: 0 },
};

function parseSafetyProfile(keyData?: string, mechanism?: string): SafetyProfile | undefined {
  let grade3: number | undefined;
  let disc: number | undefined;
  let irae: number | undefined;

  // Attempt regex extraction from keyData
  if (keyData && keyData.trim().length > 0) {
    const grade3Match = keyData.match(
      /(?:grade?\s*3\+?|g3\+?|≥?\s*grade\s*3)\s*(?:ae|adverse|toxicit)[\w]*[\s:]*(\d+(?:\.\d+)?)\s*%/i
    );
    if (grade3Match) grade3 = parseFloat(grade3Match[1]);

    const discMatch = keyData.match(
      /(?:treatment\s+)?discontinu[\w]*[\s:]*(\d+(?:\.\d+)?)\s*%/i
    );
    if (discMatch) disc = parseFloat(discMatch[1]);

    const iraeMatch = keyData.match(
      /(?:ir[- ]?ae|immune[- ]related)[\w\s]*[\s:]*(\d+(?:\.\d+)?)\s*%/i
    );
    if (iraeMatch) irae = parseFloat(iraeMatch[1]);
  }

  // Find matching mechanism defaults
  let mechKey = 'default';
  if (mechanism) {
    const mechLower = mechanism.toLowerCase();
    for (const key of Object.keys(MECHANISM_SAFETY_DEFAULTS)) {
      if (key === 'default') continue;
      if (mechLower.includes(key) || key.includes(mechLower.replace(/[\s\-]/g, '_'))) {
        mechKey = key;
        break;
      }
    }
  }
  const defaults = MECHANISM_SAFETY_DEFAULTS[mechKey];

  // Apply defaults where regex extraction failed
  const finalGrade3 = grade3 ?? defaults.grade3;
  const finalDisc = disc ?? defaults.disc;
  const finalIrae = irae ?? defaults.irae;

  // Safety score = Math.max(1, Math.min(10, 10 - (grade3/10 + disc/5)))
  const safetyScore = Math.max(1, Math.min(10, 10 - (finalGrade3 / 10 + finalDisc / 5)));

  // Key safety signals: list AEs found
  const signals: string[] = [];
  if (grade3 !== undefined) signals.push(`Grade 3+ AE rate: ${grade3}%`);
  if (disc !== undefined) signals.push(`Treatment discontinuation: ${disc}%`);
  if (irae !== undefined) signals.push(`Immune-related AE rate: ${irae}%`);
  if (signals.length === 0) signals.push(`Defaults applied for ${mechKey.replace(/_/g, ' ')} class`);

  // Tradeoff narrative
  const roundedScore = Math.round(safetyScore * 10) / 10;
  const expectedScore = Math.max(1, Math.min(10, 10 - (defaults.grade3 / 10 + defaults.disc / 5)));
  let tradeoff: string;
  if (roundedScore >= expectedScore + 1) {
    tradeoff = `Safety score of ${roundedScore}/10 is better than typical for ${mechKey.replace(/_/g, ' ')} agents (expected ~${Math.round(expectedScore * 10) / 10}/10). This favorable safety profile could support differentiation in tolerability-sensitive populations.`;
  } else if (roundedScore <= expectedScore - 1) {
    tradeoff = `Safety score of ${roundedScore}/10 is worse than typical for ${mechKey.replace(/_/g, ' ')} agents (expected ~${Math.round(expectedScore * 10) / 10}/10). Higher toxicity may limit use in combination regimens or frail patients, though strong efficacy data could offset this.`;
  } else {
    tradeoff = `Safety score of ${roundedScore}/10 is consistent with the ${mechKey.replace(/_/g, ' ')} class (expected ~${Math.round(expectedScore * 10) / 10}/10). Safety profile is within the expected range for this mechanism.`;
  }

  return {
    grade3_plus_ae_rate_pct: finalGrade3,
    treatment_discontinuation_rate_pct: finalDisc,
    any_irae_rate_pct: finalIrae > 0 ? finalIrae : undefined,
    safety_score: Math.round(roundedScore * 10) / 10,
    key_safety_signals: signals,
    safety_vs_efficacy_tradeoff: tradeoff,
  };
}


// ────────────────────────────────────────────────────────────
// MARKET SHARE DISTRIBUTION
//
// Estimates relative market share for each competitor based
// on phase, evidence strength, and differentiation. Computes
// the Herfindahl-Hirschman Index (HHI) for market concentration.
//
// HHI thresholds:
//   <1500    Fragmented
//   1500-2500 Moderate
//   2500-5000 Concentrated
//   >5000    Monopolistic
// ────────────────────────────────────────────────────────────

const PHASE_SHARE_WEIGHT: Record<ClinicalPhase, number> = {
  'Approved':    40,
  'Phase 3':     20,
  'Phase 2/3':   15,
  'Phase 2':     5,
  'Phase 1/2':   2,
  'Phase 1':     1,
  'Preclinical': 0.5,
};

function buildMarketShareDistribution(
  competitors: Competitor[],
  _therapyArea: string,
): MarketShareDistribution {
  if (competitors.length === 0) {
    return {
      competitors: [],
      hhi_index: 0,
      concentration_label: 'Fragmented',
      top_3_share_pct: 0,
      narrative: 'No competitors identified — market share distribution cannot be calculated.',
    };
  }

  // Score each competitor
  const scored = competitors.map(c => {
    const phaseWeight = PHASE_SHARE_WEIGHT[c.phase] ?? 1;
    let score = phaseWeight * c.evidence_strength * (c.differentiation_score / 10);

    // Bonus for approved drugs with strong evidence
    if (c.phase === 'Approved' && c.evidence_strength >= 7) {
      score += 20;
    }

    return {
      name: `${c.company} — ${c.asset_name}`,
      phase: c.phase as string,
      score,
    };
  });

  // Normalize to percentages
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  const withShares = scored.map(s => ({
    name: s.name,
    phase: s.phase,
    estimated_share_pct: totalScore > 0
      ? Math.round((s.score / totalScore) * 1000) / 10
      : 0,
  }));

  // Sort by share descending
  withShares.sort((a, b) => b.estimated_share_pct - a.estimated_share_pct);

  // HHI = sum of (share_pct)^2 (using whole number percentages)
  const hhi = Math.round(
    withShares.reduce((sum, s) => sum + s.estimated_share_pct * s.estimated_share_pct, 0)
  );

  let concentration_label: MarketShareDistribution['concentration_label'];
  if (hhi < 1500) concentration_label = 'Fragmented';
  else if (hhi <= 2500) concentration_label = 'Moderate';
  else if (hhi <= 5000) concentration_label = 'Concentrated';
  else concentration_label = 'Monopolistic';

  // Top 3 share
  const top3 = withShares.slice(0, 3).reduce((sum, s) => sum + s.estimated_share_pct, 0);
  const top_3_share_pct = Math.round(top3 * 10) / 10;

  // Narrative
  let narrative: string;
  if (concentration_label === 'Fragmented') {
    narrative = `The market is fragmented (HHI ${hhi}) with no single competitor dominating. The top 3 competitors hold ${top_3_share_pct}% of estimated share, suggesting room for differentiated entrants to capture meaningful share.`;
  } else if (concentration_label === 'Moderate') {
    narrative = `The market shows moderate concentration (HHI ${hhi}). The top 3 competitors control ${top_3_share_pct}% of estimated share, indicating established players but opportunities for strong differentiators.`;
  } else if (concentration_label === 'Concentrated') {
    narrative = `The market is concentrated (HHI ${hhi}) with the top 3 competitors holding ${top_3_share_pct}% of estimated share. New entrants face significant incumbency barriers and must demonstrate clear clinical superiority.`;
  } else {
    narrative = `The market is monopolistic (HHI ${hhi}) with the top 3 competitors controlling ${top_3_share_pct}% of estimated share. Market entry requires transformative differentiation or a fundamentally different treatment approach.`;
  }

  return {
    competitors: withShares,
    hhi_index: hhi,
    concentration_label,
    top_3_share_pct,
    narrative,
  };
}


// ────────────────────────────────────────────────────────────
// COMPETITOR SUCCESS PROBABILITIES
//
// Maps each competitor's current phase to a likelihood-of-
// approval (LoA) using therapy-area-specific tables, then
// computes a probability-weighted threat score.
//
// Sorted by probability_weighted_threat descending.
// ────────────────────────────────────────────────────────────

const PHASE_TO_STAGE: Record<string, DevelopmentStage> = {
  'Approved':    'approved',
  'Phase 3':     'phase3',
  'Phase 2/3':   'phase3',
  'Phase 2':     'phase2',
  'Phase 1/2':   'phase1',
  'Phase 1':     'phase1',
  'Preclinical': 'preclinical',
};

function buildCompetitorSuccessProbabilities(
  competitors: Competitor[],
  therapyArea: string,
): CompetitorSuccessProbability[] {
  const normalized = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');

  const results: CompetitorSuccessProbability[] = competitors.map(c => {
    const stage = PHASE_TO_STAGE[c.phase] ?? 'preclinical';

    let probability: number;
    if (c.phase === 'Approved') {
      probability = 1.0;
    } else {
      const areaTable = LOA_BY_PHASE_AND_AREA[normalized];
      probability = areaTable?.[stage] ?? DEFAULT_LOA[stage] ?? 0.10;
    }

    const threatScore = c.threat_assessment?.threat_score ?? 5;
    const probabilityWeightedThreat = Math.round(threatScore * probability * 100) / 100;

    // Narrative
    let narrative: string;
    if (c.phase === 'Approved') {
      narrative = `${c.company} (${c.asset_name}) is already approved — certainty of market presence. Threat score: ${threatScore}/10.`;
    } else if (probability >= 0.5) {
      narrative = `${c.company} (${c.asset_name}) in ${c.phase} has a ${(probability * 100).toFixed(0)}% LoA in ${therapyArea}. High probability of eventual approval makes this a significant competitive risk (weighted threat: ${probabilityWeightedThreat}).`;
    } else if (probability >= 0.15) {
      narrative = `${c.company} (${c.asset_name}) in ${c.phase} has a ${(probability * 100).toFixed(0)}% LoA. Moderate probability — monitor for clinical data readouts that could shift trajectory (weighted threat: ${probabilityWeightedThreat}).`;
    } else {
      narrative = `${c.company} (${c.asset_name}) in ${c.phase} has only ${(probability * 100).toFixed(0)}% LoA. Early-stage attrition risk is high — low near-term competitive concern but worth tracking (weighted threat: ${probabilityWeightedThreat}).`;
    }

    return {
      company: c.company,
      asset_name: c.asset_name,
      current_phase: c.phase,
      probability_of_approval: probability,
      probability_weighted_threat: probabilityWeightedThreat,
      narrative,
    };
  });

  // Sort by probability_weighted_threat descending
  results.sort((a, b) => b.probability_weighted_threat - a.probability_weighted_threat);

  return results;
}


// ────────────────────────────────────────────────────────────
// DOSING CONVENIENCE INFERENCE
//
// Infers route of administration, dosing frequency, and a
// convenience score (1-10) from the competitor's mechanism
// and free-text key_data. Higher score = more convenient
// for patients (oral > SC > IV; infrequent > frequent).
// ────────────────────────────────────────────────────────────

interface ModalityConvenienceEntry {
  route: string;
  freq: string;
  home: DosingConvenience['home_vs_clinic'];
  score: number;
}

const MODALITY_CONVENIENCE: { patterns: string[]; entry: ModalityConvenienceEntry }[] = [
  {
    patterns: ['small_molecule', 'tki', 'inhibitor'],
    entry: { route: 'oral', freq: 'once daily', home: 'home', score: 9 },
  },
  {
    patterns: ['checkpoint', 'pd-1', 'pd-l1', 'ctla-4'],
    entry: { route: 'IV', freq: 'every 3 weeks', home: 'clinic', score: 5 },
  },
  {
    patterns: ['adc', 'antibody-drug conjugate'],
    entry: { route: 'IV', freq: 'every 3 weeks', home: 'clinic', score: 4 },
  },
  {
    patterns: ['bispecific'],
    entry: { route: 'SC or IV', freq: 'weekly → monthly', home: 'clinic', score: 6 },
  },
  {
    patterns: ['car_t', 'car-t'],
    entry: { route: 'IV', freq: 'single dose', home: 'clinic', score: 2 },
  },
  {
    patterns: ['gene_therapy'],
    entry: { route: 'IV', freq: 'single dose', home: 'clinic', score: 2 },
  },
  {
    patterns: ['monoclonal_antibody', 'mab'],
    entry: { route: 'IV or SC', freq: 'every 2-4 weeks', home: 'clinic', score: 5 },
  },
];

function inferDosingConvenience(record: CompetitorRecord): DosingConvenience {
  const mechLower = (record.mechanism + ' ' + record.mechanism_category).toLowerCase();

  // Find matching modality
  let matched: ModalityConvenienceEntry | undefined;
  for (const entry of MODALITY_CONVENIENCE) {
    if (entry.patterns.some(p => mechLower.includes(p))) {
      matched = entry.entry;
      break;
    }
  }

  // Default fallback
  if (!matched) {
    // Check if mechanism text suggests oral
    if (mechLower.includes('oral') || mechLower.includes('small molecule')) {
      matched = { route: 'oral', freq: 'once daily', home: 'home', score: 9 };
    } else {
      matched = { route: 'IV', freq: 'every 3 weeks', home: 'clinic', score: 5 };
    }
  }

  let route = matched.route;
  let freq = matched.freq;
  let home = matched.home;
  let score = matched.score;
  let infusionTime: number | undefined;

  // Parse keyData for overrides
  if (record.key_data) {
    const text = record.key_data.toLowerCase();

    if (text.includes('oral once daily') || text.includes('oral qd')) {
      route = 'oral';
      freq = 'once daily';
      home = 'home';
      score = 9;
    } else if (text.includes('oral')) {
      route = 'oral';
      home = 'home';
      score = Math.max(score, 8);
    }

    if (text.includes('iv q2w') || text.includes('every 2 weeks')) {
      route = 'IV';
      freq = 'every 2 weeks';
      home = 'clinic';
      score = Math.min(score, 5);
    } else if (text.includes('q3w') || text.includes('every 3 weeks')) {
      freq = 'every 3 weeks';
    } else if (text.includes('q4w') || text.includes('every 4 weeks') || text.includes('monthly')) {
      freq = 'every 4 weeks';
      score = Math.min(score + 1, 10);
    }

    if (text.includes('sc monthly') || text.includes('subcutaneous monthly')) {
      route = 'SC';
      freq = 'monthly';
      home = 'either';
      score = 7;
    } else if (text.includes('sc') || text.includes('subcutaneous')) {
      route = 'SC';
      home = 'either';
      score = Math.max(score, 6);
    }

    // Infusion time extraction
    const infusionMatch = text.match(/(\d+)\s*(?:min(?:ute)?|hr|hour)\s*infusion/);
    if (infusionMatch) {
      const val = parseInt(infusionMatch[1], 10);
      infusionTime = text.includes('hr') || text.includes('hour') ? val * 60 : val;
    }
  }

  // Narrative
  const routeLabel = route === 'oral' ? 'Oral administration' : `${route} administration`;
  let narrative: string;
  if (score >= 8) {
    narrative = `${routeLabel} (${freq}) with a convenience score of ${score}/10. Home-based dosing significantly reduces treatment burden, improving adherence and patient quality of life.`;
  } else if (score >= 5) {
    narrative = `${routeLabel} (${freq}) with a convenience score of ${score}/10. Clinic-based dosing is standard for this modality but may limit uptake in settings where oral alternatives exist.`;
  } else {
    narrative = `${routeLabel} (${freq}) with a convenience score of ${score}/10. Intensive dosing logistics and clinic requirements create patient burden, though this is typical for ${record.mechanism_category.replace(/_/g, ' ')} therapies.`;
  }

  return {
    route_of_administration: route,
    dosing_frequency: freq,
    infusion_time_minutes: infusionTime,
    home_vs_clinic: home,
    convenience_score: score,
    narrative,
  };
}


// ────────────────────────────────────────────────────────────
// BUILD COMPETITOR OBJECT
//
// Transforms a CompetitorRecord + enrichment data + computed
// scores into the Competitor type defined in @/types.
// ────────────────────────────────────────────────────────────

function buildCompetitor(
  record: CompetitorRecord,
  allRecords: CompetitorRecord[],
  userMechanism?: string,
): Competitor {
  const pricingEnrichment = enrichWithPricingData(record);
  const dealEnrichment = enrichWithDealData(record);
  const differentiationScore = calculateDifferentiationScore(record, allRecords);
  const parsedEfficacy = parseEfficacyData(record.key_data);
  const evidenceStrength = calculateEvidenceStrength(record, parsedEfficacy);
  const threatAssessment = calculateThreatLevel(record, allRecords, parsedEfficacy, userMechanism);
  const competitiveTimeline = buildCompetitiveTimeline(record);
  const safetyProfile = parseSafetyProfile(record.key_data, record.mechanism_category);
  const dosingConvenience = inferDosingConvenience(record);

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
    parsed_efficacy: parsedEfficacy,
    threat_assessment: threatAssessment,
    competitive_timeline: competitiveTimeline,
    safety_profile: safetyProfile,
    dosing_convenience: dosingConvenience,
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
    {
      attribute: 'Estimated Peak Sales',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.estimated_peak_sales ?? 'N/A',
        ])
      ),
    },
    {
      attribute: 'Indication Specifics',
      competitors: Object.fromEntries(
        topCompetitors.map((c) => [
          `${c.company} — ${c.asset_name}`,
          c.indication_specifics ?? 'N/A',
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
    buildCompetitor(record, competitorRecords, input.mechanism)
  );

  // ── Step 8b: Calculate efficacy deltas for each competitor ─
  // After all competitors are built, calculate head-to-head
  // efficacy deltas against approved benchmarks.
  for (const comp of competitors) {
    comp.efficacy_deltas = buildEfficacyDeltas(comp, competitors);
  }

  // ── Step 8c: Build competitive timelines array ────────────
  const competitiveTimelines: CompetitiveTimeline[] = competitors
    .map(c => c.competitive_timeline)
    .filter((t): t is CompetitiveTimeline => t !== undefined);

  // ── Step 8d: Build barrier-to-entry assessment ────────────
  const barrierAssessment = assessBarriers(
    competitors,
    competitorRecords,
    indication,
  );

  // ── Step 8e: Build market share distribution ────────────
  const marketShareDistribution = buildMarketShareDistribution(
    competitors,
    indication.therapy_area,
  );

  // ── Step 8f: Build competitor success probabilities ─────
  const competitorSuccessProbabilities = buildCompetitorSuccessProbabilities(
    competitors,
    indication.therapy_area,
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

  // ── Step 14b: Assess displacement risk ────────────────────
  const displacementRisk = assessDisplacementRisk(competitors, input.mechanism);

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
    displacement_risk: displacementRisk,
    barrier_assessment: barrierAssessment,
    competitive_timelines: competitiveTimelines,
    market_share_distribution: marketShareDistribution,
    competitor_success_probabilities: competitorSuccessProbabilities,
  };

  return output;
}
