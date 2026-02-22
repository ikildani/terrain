// ============================================================
// TERRAIN — Partner Discovery Matching Engine
// lib/analytics/partners.ts
//
// Scores and ranks 300+ biopharma companies against a user's
// asset profile to identify the highest-probability BD partners.
//
// Scoring dimensions (weighted to 100):
//   Therapeutic alignment  — 25 pts
//   Pipeline gap           — 25 pts
//   Deal history           — 20 pts
//   Geography fit          — 15 pts
//   Financial capacity     — 15 pts
//
// Sources: Partner database derived from SEC filings, company
// annual reports, BioCentury, Evaluate Pharma (2020-2025)
// ============================================================

import type {
  PartnerDiscoveryInput,
  PartnerDiscoveryOutput,
  PartnerMatch,
  PartnerScoreBreakdown,
  PartnerDeal,
  DealBenchmark,
  DataSource,
  DevelopmentStage,
} from '@/types';

import {
  PHARMA_PARTNER_DATABASE,
  type PharmaPartnerProfile,
} from '@/lib/data/partner-database';

import {
  DEVICE_PARTNER_DATABASE_FULL as RAW_DEVICE_PARTNERS,
  type DevicePartnerProfile,
} from '@/lib/data/device-partner-database';

import { findIndicationByName } from '@/lib/data/indication-map';

// ────────────────────────────────────────────────────────────
// DEVICE → PHARMA PROFILE NORMALIZATION
// Converts DevicePartnerProfile to PharmaPartnerProfile shape
// so both databases can be scored by the same functions.
// ────────────────────────────────────────────────────────────

/** Infer geography footprint from HQ location for device partners */
function inferDeviceGeography(hq: string): string[] {
  const h = hq.toLowerCase();
  // Major medtech companies are almost always global
  // Base: US, EU5, Japan. Add China for larger companies. Add regional for HQ-based.
  const geos = ['US', 'EU5', 'Japan', 'China'];
  if (h.includes('uk') || h.includes('london') || h.includes('england')) geos.push('UK');
  if (h.includes('canada') || h.includes('toronto') || h.includes('montreal')) geos.push('Canada');
  if (h.includes('australia') || h.includes('sydney') || h.includes('melbourne')) geos.push('Australia');
  if (h.includes('germany') || h.includes('munich') || h.includes('berlin') || h.includes('erlangen')) geos.push('Germany');
  if (h.includes('france') || h.includes('paris') || h.includes('lyon')) geos.push('France');
  if (h.includes('italy') || h.includes('milan') || h.includes('rome')) geos.push('Italy');
  if (h.includes('spain') || h.includes('madrid') || h.includes('barcelona')) geos.push('Spain');
  return geos;
}

/** Map device regulatory stage terms to pharma DevelopmentStage equivalents */
function mapDeviceStage(stage: string): string {
  const map: Record<string, string> = {
    cleared_approved: 'approved',
    submission_pending: 'phase3',
    pivotal_ongoing: 'phase3',
    pivotal_design: 'phase2',
    feasibility: 'phase1',
    concept: 'preclinical',
    ide_approved: 'phase2',
    '510k_cleared': 'approved',
    pma_approved: 'approved',
  };
  return map[stage] || stage;
}

function normalizeDevicePartner(dp: DevicePartnerProfile): PharmaPartnerProfile {
  // Map device company_type → pharma company_type
  const typeMap: Record<string, PharmaPartnerProfile['company_type']> = {
    large_medtech: 'big_pharma',
    mid_medtech: 'mid_pharma',
    diagnostics: 'specialty_pharma',
    specialty_medtech: 'specialty_pharma',
    digital_health: 'biotech',
  };

  // Parse recent acquisitions into deal-like records
  const recentDeals = dp.recent_acquisitions.map((acq) => {
    const valueMatch = acq.match(/\$([0-9.]+)([BM])/i);
    let totalValueM = 0;
    if (valueMatch) {
      totalValueM = valueMatch[2].toUpperCase() === 'B'
        ? parseFloat(valueMatch[1]) * 1000
        : parseFloat(valueMatch[1]);
    }
    const yearMatch = acq.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2023;
    const partnerMatch = acq.match(/^([^(]+)/);
    const partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown';

    return {
      partner,
      asset: partner,
      indication: dp.primary_therapeutic_areas[0] || 'medical devices',
      deal_type: 'acquisition',
      upfront_m: totalValueM,
      total_value_m: totalValueM,
      year,
    };
  });

  return {
    company: dp.company,
    company_type: typeMap[dp.company_type] || 'specialty_pharma',
    headquarters: dp.hq,
    market_cap_b: dp.market_cap_b ?? 5,
    revenue_b: dp.revenue_b ?? 1,
    // Estimate R&D spend as ~10% of revenue for large medtech, ~15% for mid/specialty
    rd_spend_b: (dp.revenue_b ?? 1) * (dp.company_type === 'large_medtech' ? 0.10 : 0.15),
    therapeutic_areas: dp.primary_therapeutic_areas,
    pipeline_focus: [...dp.active_bd_interests, ...dp.key_divisions],
    strategic_priorities: dp.active_bd_interests,
    preferred_deal_stages: dp.preferred_stage.map(mapDeviceStage),
    bd_activity: 'active' as const,
    geography_footprint: inferDeviceGeography(dp.hq),
    recent_deals: recentDeals,
    deal_size_range: dp.deal_size_range,
    source: dp.source,
  };
}

const NORMALIZED_DEVICE_PARTNERS: PharmaPartnerProfile[] =
  RAW_DEVICE_PARTNERS.map(normalizeDevicePartner);

// ────────────────────────────────────────────────────────────
// THERAPY AREA MAPPING
// Maps indications/keywords → canonical therapy areas
// used for matching against partner therapeutic_areas
// ────────────────────────────────────────────────────────────

const THERAPY_AREA_KEYWORDS: Record<string, string[]> = {
  oncology: [
    'cancer', 'tumor', 'carcinoma', 'lymphoma', 'leukemia', 'myeloma',
    'sarcoma', 'melanoma', 'glioblastoma', 'glioma', 'nsclc', 'sclc',
    'hcc', 'rcc', 'tnbc', 'aml', 'cll', 'cml', 'dlbcl', 'mds',
    'mesothelioma', 'neuroblastoma', 'bladder', 'breast', 'lung',
    'prostate', 'ovarian', 'pancreatic', 'colorectal', 'gastric',
    'hepatocellular', 'cholangiocarcinoma', 'gist', 'net',
    'immuno-oncology', 'io', 'adc', 'antibody-drug conjugate',
    'car-t', 'bispecific', 'checkpoint', 'pd-1', 'pd-l1', 'ctla-4',
  ],
  immunology: [
    'rheumatoid arthritis', 'lupus', 'sle', 'psoriasis', 'atopic dermatitis',
    'eczema', 'psoriatic arthritis', 'ankylosing spondylitis', 'ibd',
    'crohn', 'ulcerative colitis', 'uc', 'autoimmune', 'inflammation',
    'il-17', 'il-23', 'jak', 'tyk2', 'tnf', 'anti-tnf',
    'hidradenitis', 'alopecia areata', 'vitiligo',
  ],
  neuroscience: [
    'alzheimer', 'parkinson', 'epilepsy', 'migraine', 'ms',
    'multiple sclerosis', 'schizophrenia', 'depression', 'mdd',
    'bipolar', 'adhd', 'huntington', 'als', 'amyotrophic',
    'neuropathy', 'pain', 'cns', 'neurodegeneration', 'dementia',
    'ptsd', 'anxiety', 'ocd', 'narcolepsy', 'sleep',
    'spinal muscular atrophy', 'sma', 'tau', 'amyloid',
  ],
  cardiovascular: [
    'heart failure', 'hypertension', 'atrial fibrillation', 'cad',
    'coronary', 'pah', 'pulmonary arterial hypertension',
    'atherosclerosis', 'cardiomyopathy', 'hcm', 'dcm', 'stroke',
    'thrombosis', 'anticoagulant',
  ],
  rare_disease: [
    'orphan', 'rare', 'ultra-rare', 'fabry', 'gaucher', 'pompe',
    'hemophilia', 'sickle cell', 'scd', 'beta-thalassemia',
    'cystic fibrosis', 'cf', 'duchenne', 'dmd', 'sma',
    'pku', 'phenylketonuria', 'mps', 'mucopolysaccharidosis',
    'friedreich', 'huntington',
  ],
  infectious_disease: [
    'hiv', 'hepatitis', 'hbv', 'hcv', 'rsv', 'influenza', 'covid',
    'bacterial', 'fungal', 'antiviral', 'antibiotic', 'vaccine',
    'malaria', 'tuberculosis',
  ],
  metabolic: [
    'diabetes', 't2d', 't1d', 'obesity', 'nash', 'mash', 'nafld',
    'glp-1', 'sglt2', 'metabolic', 'dyslipidemia', 'gout',
  ],
  hematology: [
    'anemia', 'hemophilia', 'itp', 'thrombocytopenia',
    'myelofibrosis', 'polycythemia', 'sickle cell', 'thalassemia',
    'von willebrand', 'hemolytic',
  ],
  ophthalmology: [
    'macular degeneration', 'amd', 'diabetic retinopathy', 'glaucoma',
    'dry eye', 'uveitis', 'retinal', 'geographic atrophy',
  ],
  dermatology: [
    'psoriasis', 'atopic dermatitis', 'eczema', 'acne', 'rosacea',
    'skin', 'dermatology', 'melanoma', 'cutaneous',
  ],
  nephrology: [
    'kidney', 'renal', 'iga nephropathy', 'fsgs', 'ckd',
    'dialysis', 'glomerulonephritis', 'nephrotic', 'hyperphosphatemia',
  ],
  respiratory: [
    'asthma', 'copd', 'ipf', 'pulmonary fibrosis', 'cystic fibrosis',
    'bronchitis', 'respiratory', 'lung disease',
  ],
  endocrinology: [
    'thyroid', 'growth hormone', 'acromegaly', 'cushing',
    'adrenal', 'hypoparathyroidism', 'endocrine',
  ],
  liver_disease: [
    'liver', 'hepatic', 'cirrhosis', 'nash', 'mash', 'nafld',
    'pbc', 'primary biliary', 'psc', 'fibrosis',
  ],
  gene_therapy: [
    'gene therapy', 'aav', 'lentiviral', 'crispr', 'gene editing',
    'base editing', 'rna editing', 'exon skipping',
  ],
};

// ────────────────────────────────────────────────────────────
// MECHANISM KEYWORD MAPPING
// Maps mechanism keywords for deeper alignment scoring
// ────────────────────────────────────────────────────────────

const MECHANISM_KEYWORDS: Record<string, string[]> = {
  adc: ['adc', 'antibody-drug conjugate', 'antibody drug conjugate', 'deruxtecan', 'vedotin', 'govitecan', 'maytansine', 'monomethyl'],
  bispecific: ['bispecific', 'bispecific antibody', 'dual-targeting', 'duobody'],
  car_t: ['car-t', 'car t', 'chimeric antigen receptor', 'cell therapy', 'autologous', 'allogeneic'],
  checkpoint: ['pd-1', 'pd-l1', 'ctla-4', 'lag-3', 'tigit', 'tim-3', 'checkpoint inhibitor', 'immuno-oncology'],
  degrader: ['degrader', 'protac', 'molecular glue', 'targeted protein degradation', 'cereblon', 'e3 ligase'],
  kinase: ['kinase inhibitor', 'tki', 'cdk', 'fgfr', 'egfr', 'kras', 'raf', 'mek', 'alk', 'ret', 'met', 'btk'],
  antibody: ['monoclonal antibody', 'mab', 'igg', 'fully human', 'humanized'],
  rna: ['sirna', 'mrna', 'antisense', 'oligonucleotide', 'aso', 'rna interference', 'rnai'],
  gene_therapy: ['gene therapy', 'aav', 'lentivirus', 'crispr', 'gene editing', 'base editing'],
  small_molecule: ['small molecule', 'oral', 'tablet', 'capsule'],
  glp1: ['glp-1', 'glp1', 'gip', 'incretin', 'amylin', 'obesity'],
  il_targeting: ['il-17', 'il-23', 'il-6', 'il-4', 'il-13', 'il-33', 'il-31', 'interleukin'],
};

// ────────────────────────────────────────────────────────────
// DEAL TYPE MAPPING
// Maps user deal type preferences to partner deal history
// ────────────────────────────────────────────────────────────

// Known short indication/mechanism abbreviations that should NOT be filtered out
const KNOWN_ABBREVIATIONS = new Set([
  'aml', 'cll', 'sma', 'itp', 'mds', 'cml', 'all', 'nhl', 'rcc', 'hcc',
  'gbm', 'ipf', 'tnbc', 'dlbcl', 'nsclc', 'sclc', 'adc', 'her2', 'egfr',
  'kras', 'alk', 'ret', 'met', 'btk', 'jak', 'pah', 'ckd', 'ibd', 'sle',
  'mdd', 'als', 'cns', 'dmd', 'pku', 'hiv', 'hbv', 'hcv', 'rsv', 'gist',
  'nash', 'mash', 'amd', 'pfa', 'tka', 'tavr', 'dbs', 'drg', 'ivd', 'cdx',
]);

/** Tokenize indication/mechanism text, keeping known abbreviations */
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(
    (t) => t.length > 3 || KNOWN_ABBREVIATIONS.has(t)
  );
}

function matchesDealType(partnerDealType: string, userDealTypes: string[]): boolean {
  const normalized = partnerDealType.toLowerCase();
  return userDealTypes.some((udt) => {
    switch (udt) {
      case 'licensing':
        return normalized.includes('licens') || normalized.includes('license') || normalized.includes('rights');
      case 'co-development':
        return normalized.includes('co-develop') || normalized.includes('collaboration') || normalized.includes('co-promote') || normalized.includes('research');
      case 'acquisition':
        return normalized.includes('acqui') || normalized.includes('merger') || normalized.includes('full company');
      case 'co-promotion':
        return normalized.includes('co-promo') || normalized.includes('co promotion');
      default:
        return false;
    }
  });
}

// ────────────────────────────────────────────────────────────
// CORE SCORING FUNCTIONS
// ────────────────────────────────────────────────────────────

function inferTherapyAreas(indication: string, mechanism?: string): string[] {
  const text = `${indication} ${mechanism || ''}`.toLowerCase();
  const matched: string[] = [];

  for (const [area, keywords] of Object.entries(THERAPY_AREA_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(area);
    }
  }

  // Also try the indication map
  const indicationData = findIndicationByName(indication);
  if (indicationData) {
    const area = indicationData.therapy_area.toLowerCase().replace(/\s+/g, '_');
    if (!matched.includes(area)) {
      matched.push(area);
    }
  }

  return matched.length > 0 ? matched : ['general'];
}

function inferMechanismCategories(mechanism?: string): string[] {
  if (!mechanism) return [];
  const text = mechanism.toLowerCase();
  const matched: string[] = [];

  for (const [category, keywords] of Object.entries(MECHANISM_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(category);
    }
  }

  return matched;
}

/**
 * Therapeutic alignment score (0-25)
 * How well does the partner's existing therapeutic focus match the asset's indication?
 */
function scoreTherapeuticAlignment(
  partner: PharmaPartnerProfile,
  userTherapyAreas: string[],
  indication: string,
  mechanism?: string,
): number {
  let score = 0;
  const partnerAreas = partner.therapeutic_areas.map((a) => a.toLowerCase().replace(/\s+/g, '_'));
  const partnerFocus = partner.pipeline_focus.map((f) => f.toLowerCase());

  // Direct therapy area match (up to 12 pts)
  const areaOverlap = userTherapyAreas.filter((ua) =>
    partnerAreas.some((pa) => pa.includes(ua) || ua.includes(pa))
  );
  score += Math.min(12, areaOverlap.length * 6);

  // Indication keyword match in pipeline focus (up to 8 pts)
  const indicationLower = indication.toLowerCase();
  const indicationTokens = tokenize(indicationLower);
  const focusMatch = partnerFocus.some((f) =>
    indicationTokens.some((t) => f.includes(t))
  );
  if (focusMatch) score += 8;

  // Mechanism match in pipeline focus (up to 5 pts)
  if (mechanism) {
    const mechLower = mechanism.toLowerCase();
    const mechCategories = inferMechanismCategories(mechanism);
    const mechMatch = partnerFocus.some((f) =>
      f.includes(mechLower) || mechCategories.some((mc) => f.includes(mc))
    );
    if (mechMatch) score += 5;
  }

  return Math.min(25, score);
}

/**
 * Pipeline gap score (0-25)
 * Does this partner need assets in this therapy area / at this stage?
 */
function scorePipelineGap(
  partner: PharmaPartnerProfile,
  userTherapyAreas: string[],
  developmentStage: DevelopmentStage,
  indication: string,
): number {
  let score = 0;
  const priorities = partner.strategic_priorities.map((p) => p.toLowerCase());
  const indicationLower = indication.toLowerCase();
  const indicationTokens = tokenize(indicationLower);

  // Strategic priority match (up to 15 pts)
  const priorityMatch = priorities.some((p) =>
    userTherapyAreas.some((ua) => p.includes(ua)) ||
    indicationTokens.some((t) => p.includes(t))
  );
  if (priorityMatch) score += 15;

  // Check if they mention LOE / patent cliff / pipeline gap in priorities (up to 5 pts)
  const gapSignals = ['loe', 'patent cliff', 'rebuild', 'gap', 'pipeline build', 'expansion', 'entry', 'seeking'];
  const hasGapSignal = priorities.some((p) =>
    gapSignals.some((gs) => p.includes(gs))
  );
  if (hasGapSignal) score += 5;

  // BD activity level bonus (up to 5 pts)
  switch (partner.bd_activity) {
    case 'very_active': score += 5; break;
    case 'active': score += 3; break;
    case 'moderate': score += 1; break;
    case 'selective': score += 0; break;
  }

  return Math.min(25, score);
}

/**
 * Deal history score (0-20)
 * Has this partner done relevant deals at this stage and type recently?
 */
function scoreDealHistory(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
  dealTypes: string[],
  userTherapyAreas: string[],
  indication: string,
): number {
  let score = 0;
  const deals = partner.recent_deals;
  const indicationLower = indication.toLowerCase();

  if (deals.length === 0) return 0;

  // Preferred stage match (up to 6 pts)
  if (partner.preferred_deal_stages.includes(developmentStage)) {
    score += 6;
  }

  // Recent deals in relevant therapy area (up to 6 pts)
  const relevantDeals = deals.filter((d) => {
    const dealInd = d.indication.toLowerCase();
    return userTherapyAreas.some((ua) => dealInd.includes(ua)) ||
      tokenize(indicationLower).some((t) => dealInd.includes(t));
  });
  score += Math.min(6, relevantDeals.length * 2);

  // Deal type match (up to 4 pts)
  const hasMatchingDealType = deals.some((d) =>
    matchesDealType(d.deal_type, dealTypes)
  );
  if (hasMatchingDealType) score += 4;

  // Recent activity bonus — deals in last 2 years (up to 4 pts)
  const recentDeals = deals.filter((d) => d.year >= new Date().getFullYear() - 2);
  score += Math.min(4, recentDeals.length * 2);

  return Math.min(20, score);
}

/**
 * Geography fit score (0-15)
 * Do the rights being offered match the partner's geographic presence?
 */
function scoreGeographyFit(
  partner: PharmaPartnerProfile,
  geographyRights: string[],
): number {
  let score = 0;
  const partnerGeo = partner.geography_footprint.map((g) => g.toLowerCase());

  // If user offers global rights, check partner has global presence
  if (geographyRights.some((g) => g.toLowerCase() === 'global')) {
    const hasGlobal = partnerGeo.length >= 3;
    return hasGlobal ? 15 : 8;
  }

  // Count matching geographies
  const matchedGeos = geographyRights.filter((g) =>
    partnerGeo.some((pg) => pg.toLowerCase() === g.toLowerCase() || pg.includes(g.toLowerCase()))
  );

  const matchRatio = matchedGeos.length / Math.max(1, geographyRights.length);
  score = Math.round(matchRatio * 15);

  return Math.min(15, score);
}

/**
 * Financial capacity score (0-15)
 * Can this partner afford a deal at the expected scale?
 */
function scoreFinancialCapacity(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
): number {
  // Expected deal size by stage
  const stageMinCapacity: Record<DevelopmentStage, number> = {
    preclinical: 0.1,   // $100M market cap minimum
    phase1: 0.5,         // $500M market cap minimum
    phase2: 2,           // $2B market cap minimum
    phase3: 5,           // $5B market cap minimum
    approved: 10,        // $10B market cap minimum
  };

  const minCap = stageMinCapacity[developmentStage] || 0.5;
  const partnerCap = partner.market_cap_b;

  if (partnerCap >= minCap * 10) return 15;  // Far exceeds requirement
  if (partnerCap >= minCap * 5) return 12;
  if (partnerCap >= minCap * 2) return 9;
  if (partnerCap >= minCap) return 6;
  if (partnerCap >= minCap * 0.5) return 3;
  return 0;
}

// ────────────────────────────────────────────────────────────
// DEAL BENCHMARKS
// ────────────────────────────────────────────────────────────

const STAGE_BENCHMARKS: Record<DevelopmentStage, { royalty: string }> = {
  preclinical: { royalty: '2-5% tiered' },
  phase1: { royalty: '5-10% tiered' },
  phase2: { royalty: '10-18% tiered' },
  phase3: { royalty: '15-25% tiered' },
  approved: { royalty: '20-35% tiered' },
};

function computeDealBenchmarks(
  relevantDeals: { upfront_m: number; total_value_m: number; year: number }[],
  developmentStage: DevelopmentStage,
): DealBenchmark {
  // Filter to meaningful deals (non-zero values)
  const validDeals = relevantDeals.filter(
    (d) => d.upfront_m > 0 && d.total_value_m > 0
  );

  if (validDeals.length === 0) {
    return {
      stage: developmentStage,
      avg_upfront_m: 0,
      median_upfront_m: 0,
      avg_total_value_m: 0,
      median_total_value_m: 0,
      typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
      sample_size: 0,
    };
  }

  const upfronts = validDeals.map((d) => d.upfront_m).sort((a, b) => a - b);
  const totals = validDeals.map((d) => d.total_value_m).sort((a, b) => a - b);

  const median = (arr: number[]) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    stage: developmentStage,
    avg_upfront_m: Math.round(avg(upfronts)),
    median_upfront_m: Math.round(median(upfronts)),
    avg_total_value_m: Math.round(avg(totals)),
    median_total_value_m: Math.round(median(totals)),
    typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
    sample_size: validDeals.length,
  };
}

// ────────────────────────────────────────────────────────────
// RATIONALE GENERATION
// ────────────────────────────────────────────────────────────

function generateRationale(
  partner: PharmaPartnerProfile,
  scores: PartnerScoreBreakdown,
  indication: string,
  developmentStage: DevelopmentStage,
  dealTypes: string[],
): string {
  const parts: string[] = [];
  const companyType = formatCompanyType(partner.company_type);

  // Lead with strongest dimension
  const dimensions = [
    { key: 'therapeutic_alignment', score: scores.therapeutic_alignment, label: 'therapeutic alignment' },
    { key: 'pipeline_gap', score: scores.pipeline_gap, label: 'pipeline gap fit' },
    { key: 'deal_history', score: scores.deal_history, label: 'deal history' },
    { key: 'geography_fit', score: scores.geography_fit, label: 'geographic fit' },
    { key: 'financial_capacity', score: scores.financial_capacity, label: 'financial capacity' },
  ].sort((a, b) => b.score - a.score);

  const topDimension = dimensions[0];
  // Scale descriptor to actual score vs max for that dimension
  const dimMaxes: Record<string, number> = { therapeutic_alignment: 25, pipeline_gap: 25, deal_history: 20, geography_fit: 15, financial_capacity: 15 };
  const topRatio = topDimension.score / (dimMaxes[topDimension.key] || 25);
  const descriptor = topRatio >= 0.7 ? 'strong' : topRatio >= 0.4 ? 'notable' : 'relevant';

  parts.push(
    `${partner.company} is a ${companyType} with ${descriptor} ${topDimension.label} for this opportunity.`
  );

  // Therapeutic presence
  if (scores.therapeutic_alignment >= 15) {
    const relevantAreas = partner.therapeutic_areas.slice(0, 3).join(', ');
    parts.push(`Active in ${relevantAreas} with pipeline investments aligned to ${indication}.`);
  }

  // Deal activity
  if (scores.deal_history >= 12) {
    const recentCount = partner.recent_deals.filter((d) => d.year >= new Date().getFullYear() - 2).length;
    if (recentCount > 0) {
      parts.push(`Completed ${recentCount} relevant deal${recentCount > 1 ? 's' : ''} in the last 2 years.`);
    }
  }

  // Strategic priority match
  if (scores.pipeline_gap >= 15) {
    const relevantPriority = partner.strategic_priorities.find((p) => {
      const pLower = p.toLowerCase();
      return tokenize(indication).some((t) => pLower.includes(t));
    });
    if (relevantPriority) {
      parts.push(`Strategic priority: "${relevantPriority}".`);
    }
  }

  // BD activity note
  if (partner.bd_activity === 'very_active') {
    parts.push('Very active BD team currently seeking assets.');
  }

  return parts.join(' ');
}

function generateWatchSignals(
  partner: PharmaPartnerProfile,
  indication: string,
  developmentStage: DevelopmentStage,
): string[] {
  const signals: string[] = [];

  // LOE / patent cliff
  const hasLOE = partner.strategic_priorities.some(
    (p) => p.toLowerCase().includes('loe') || p.toLowerCase().includes('patent cliff') || p.toLowerCase().includes('rebuild')
  );
  if (hasLOE) {
    signals.push('Facing key product LOE — actively rebuilding pipeline');
  }

  // Very active BD
  if (partner.bd_activity === 'very_active') {
    signals.push('Very active BD team with multiple ongoing searches');
  }

  // Recent large deal capacity
  const largeRecent = partner.recent_deals.filter(
    (d) => d.year >= new Date().getFullYear() - 2 && d.total_value_m >= 1000
  );
  if (largeRecent.length > 0) {
    signals.push(`Recently closed ${largeRecent.length} deal(s) >$1B — demonstrated capacity for significant transactions`);
  }

  // Strategic priority alignment
  const indicationTokens = tokenize(indication);
  const matchingPriority = partner.strategic_priorities.find((p) =>
    indicationTokens.some((t) => p.toLowerCase().includes(t))
  );
  if (matchingPriority) {
    signals.push(`Stated strategic priority aligns with this asset`);
  }

  // High R&D spend relative to revenue
  if (partner.rd_spend_b > 0 && partner.revenue_b > 0) {
    const rdRatio = partner.rd_spend_b / partner.revenue_b;
    if (rdRatio > 0.25) {
      signals.push('High R&D intensity (>25% of revenue) — committed to pipeline expansion');
    }
  }

  return signals.slice(0, 4);
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function formatCompanyType(
  type: PharmaPartnerProfile['company_type']
): PartnerMatch['company_type'] {
  switch (type) {
    case 'big_pharma': return 'Big Pharma';
    case 'mid_pharma': return 'Mid-Size Pharma';
    case 'specialty_pharma': return 'Specialty Pharma';
    case 'biotech': return 'Biotech';
    case 'generics': return 'Specialty Pharma';
    default: return 'Specialty Pharma';
  }
}

function formatMarketCap(mcb: number): string {
  if (mcb >= 100) return `$${Math.round(mcb)}B`;
  if (mcb >= 1) return `$${mcb.toFixed(1)}B`;
  return `$${Math.round(mcb * 1000)}M`;
}

function formatDealTermsBenchmark(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
): PartnerMatch['deal_terms_benchmark'] {
  const validDeals = partner.recent_deals.filter(
    (d) => d.upfront_m > 0 && d.total_value_m > 0
  );

  if (validDeals.length === 0) {
    const benchmarks = STAGE_BENCHMARKS[developmentStage] || { royalty: '5-15%' };
    return {
      typical_upfront: 'Not available',
      typical_milestones: 'Not available',
      typical_royalty_range: benchmarks.royalty,
    };
  }

  const avgUpfront = validDeals.reduce((s, d) => s + d.upfront_m, 0) / validDeals.length;
  const avgTotal = validDeals.reduce((s, d) => s + d.total_value_m, 0) / validDeals.length;
  const avgMilestones = avgTotal - avgUpfront;

  return {
    typical_upfront: `$${Math.round(avgUpfront)}M`,
    typical_milestones: `$${Math.round(avgMilestones)}M`,
    typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
  };
}

function inferDealStage(deal: PharmaPartnerProfile['recent_deals'][0]): DevelopmentStage {
  const type = deal.deal_type.toLowerCase();
  // Acquisitions of marketed products are typically approved-stage
  if (type.includes('acqui') || type.includes('merger')) return 'approved';
  // Infer from deal value: very large deals tend to be later-stage
  if (deal.total_value_m >= 5000) return 'approved';
  if (deal.total_value_m >= 2000) return 'phase3';
  if (deal.total_value_m >= 500) return 'phase2';
  if (deal.total_value_m >= 100) return 'phase1';
  return 'preclinical';
}

function convertToPartnerDeal(
  deal: PharmaPartnerProfile['recent_deals'][0],
  partnerCompany: string,
): PartnerDeal {
  return {
    partner_company: partnerCompany,
    licensed_to: deal.partner,
    indication: deal.indication,
    development_stage: inferDealStage(deal),
    deal_type: deal.deal_type,
    upfront_usd: deal.upfront_m * 1_000_000,
    total_value_usd: deal.total_value_m * 1_000_000,
    date: `${deal.year}`,
    source: 'SEC filings, press releases',
  };
}

// ────────────────────────────────────────────────────────────
// MAIN EXPORT: analyzePartners()
// ────────────────────────────────────────────────────────────

export async function analyzePartners(
  input: PartnerDiscoveryInput,
): Promise<PartnerDiscoveryOutput> {
  const {
    indication,
    mechanism,
    development_stage: developmentStage,
    geography_rights: geographyRights,
    deal_types: dealTypes,
    exclude_companies = [],
    minimum_match_score = 25,
  } = input;

  // Infer therapy areas from indication + mechanism
  const userTherapyAreas = inferTherapyAreas(indication, mechanism);

  // Merge pharma + device partner databases
  const allPartners: PharmaPartnerProfile[] = [
    ...PHARMA_PARTNER_DATABASE,
    ...NORMALIZED_DEVICE_PARTNERS,
  ];

  // Filter excluded companies
  const excludeSet = new Set(exclude_companies.map((c) => c.toLowerCase()));
  const candidates = allPartners.filter(
    (p) => !excludeSet.has(p.company.toLowerCase())
  );

  // Score all candidates
  const scored = candidates.map((partner) => {
    const therapeutic_alignment = scoreTherapeuticAlignment(
      partner, userTherapyAreas, indication, mechanism
    );
    const pipeline_gap = scorePipelineGap(
      partner, userTherapyAreas, developmentStage, indication
    );
    const deal_history = scoreDealHistory(
      partner, developmentStage, dealTypes, userTherapyAreas, indication
    );
    const geography_fit = scoreGeographyFit(partner, geographyRights);
    const financial_capacity = scoreFinancialCapacity(partner, developmentStage);

    const total = therapeutic_alignment + pipeline_gap + deal_history + geography_fit + financial_capacity;

    const breakdown: PartnerScoreBreakdown = {
      therapeutic_alignment,
      pipeline_gap,
      deal_history,
      financial_capacity,
      geography_fit,
    };

    return { partner, total, breakdown };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.total - a.total);

  // Filter by minimum score and take top 20
  const qualified = scored.filter((s) => s.total >= minimum_match_score);
  const topPartners = qualified.slice(0, 20);

  // Build ranked partner matches
  const rankedPartners: PartnerMatch[] = topPartners.map((item, index) => {
    const { partner, total, breakdown } = item;

    // Get relevant deals (those matching indication or therapy area)
    const indicationLower = indication.toLowerCase();
    const relevantDeals = partner.recent_deals
      .filter((d) => {
        const dealInd = d.indication.toLowerCase();
        return userTherapyAreas.some((ua) => dealInd.includes(ua)) ||
          tokenize(indicationLower).some((t) => dealInd.includes(t));
      })
      .slice(0, 3)
      .map((d) => convertToPartnerDeal(d, partner.company));

    // If no relevant deals, just show most recent
    const dealsToShow = relevantDeals.length > 0
      ? relevantDeals
      : partner.recent_deals
          .sort((a, b) => b.year - a.year)
          .slice(0, 2)
          .map((d) => convertToPartnerDeal(d, partner.company));

    return {
      rank: index + 1,
      company: partner.company,
      company_type: formatCompanyType(partner.company_type),
      hq_location: partner.headquarters,
      market_cap: formatMarketCap(partner.market_cap_b),
      bd_focus: partner.strategic_priorities.slice(0, 3),
      match_score: total,
      score_breakdown: breakdown,
      recent_deals: dealsToShow,
      deal_terms_benchmark: formatDealTermsBenchmark(partner, developmentStage),
      rationale: generateRationale(partner, breakdown, indication, developmentStage, dealTypes),
      watch_signals: generateWatchSignals(partner, indication, developmentStage),
    };
  });

  // Compute deal benchmarks from all relevant deals across both databases
  const allRelevantDeals = allPartners.flatMap((p) =>
    p.recent_deals.filter((d) => {
      const dealInd = d.indication.toLowerCase();
      return userTherapyAreas.some((ua) => dealInd.includes(ua));
    })
  );

  const dealBenchmarks = computeDealBenchmarks(allRelevantDeals, developmentStage);

  // Summary stats
  const matchedCount = qualified.length;
  const topTierCount = qualified.filter((q) => q.total >= 60).length;
  const avgScore = rankedPartners.length > 0
    ? Math.round(rankedPartners.reduce((s, p) => s + p.match_score, 0) / rankedPartners.length)
    : 0;

  const methodology = [
    `Screened ${candidates.length} biopharma companies against asset profile.`,
    `Scoring methodology: Therapeutic Alignment (25 pts), Pipeline Gap Analysis (25 pts), Deal History (20 pts), Geography Fit (15 pts), Financial Capacity (15 pts).`,
    `Therapeutic alignment evaluates overlap between the partner's existing therapeutic areas, pipeline focus, and the asset's indication/mechanism.`,
    `Pipeline gap analysis assesses whether the partner has stated strategic priorities or patent cliffs that create demand for this type of asset.`,
    `Deal history scores partners based on their preferred deal stages, recent transaction activity, and deal type alignment.`,
    `Geography fit measures overlap between offered rights territories and the partner's commercial footprint.`,
    `Financial capacity evaluates whether the partner's market capitalization supports a transaction at the appropriate scale for ${developmentStage} assets.`,
    `Partners scoring below ${minimum_match_score}/100 are excluded from results.`,
  ].join(' ');

  const dataSources: DataSource[] = [
    { name: 'SEC EDGAR Filings', type: 'public', url: 'https://www.sec.gov/edgar/searchedgar/companysearch' },
    { name: `Company Annual Reports & 10-K Filings (2020-${new Date().getFullYear()})`, type: 'public' },
    { name: 'BioCentury Deal Database', type: 'licensed' },
    { name: 'Evaluate Pharma', type: 'licensed' },
    { name: 'ClinicalTrials.gov Pipeline Data', type: 'public', url: 'https://clinicaltrials.gov' },
    { name: 'Ambrosia Ventures Proprietary Deal Intelligence', type: 'proprietary' },
  ];

  return {
    ranked_partners: rankedPartners,
    deal_benchmarks: dealBenchmarks,
    summary: {
      total_screened: candidates.length,
      total_matched: matchedCount,
      top_tier_count: topTierCount,
      avg_match_score: avgScore,
      indication,
      development_stage: developmentStage,
    },
    methodology,
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}
