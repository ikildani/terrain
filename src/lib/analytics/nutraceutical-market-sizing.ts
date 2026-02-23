// ============================================================
// TERRAIN — Nutraceutical / Consumer Health Market Sizing Engine
// lib/analytics/nutraceutical-market-sizing.ts
//
// 15-step pipeline: ingredient lookup, consumer funnel, channel
// revenue, DTC economics, TAM/SAM/SOM, geography, projections,
// competitive, regulatory, sensitivity, clinical evidence, brand
// economics, Amazon intelligence, subscription model, M&A.
//
// All calculations auditable and source-attributed.
// ============================================================

import type {
  NutraceuticalMarketSizingInput,
  NutraceuticalMarketSizingOutput,
  NutraceuticalConsumerFunnel,
  NutraceuticalChannelRevenue,
  NutraceuticalDTCEconomics,
  NutraceuticalGeographyBreakdown,
  NutraceuticalCompetitivePositioning,
  NutraceuticalRegulatoryAssessment,
  NutraceuticalSensitivityDriver,
  NutraceuticalClinicalEvidenceImpact,
  NutraceuticalBrandEconomics,
  NutraceuticalAmazonIntelligence,
  NutraceuticalSubscriptionModel,
  NutraceuticalIngredientSupplyChain,
  NutraceuticalAcquisitionAttractiveness,
  NutraceuticalChannel,
  ClaimType,
} from '@/types/devices-diagnostics';

import {
  OTC_REGULATORY_PATHWAYS,
  NUTRACEUTICAL_INGREDIENTS,
  CHANNEL_ECONOMICS,
  US_SUPPLEMENT_MARKET,
  HEALTH_FOCUS_SUGGESTIONS,
} from '@/lib/data/nutraceutical-data';

import type { NutraceuticalIngredient, ChannelEconomics } from '@/lib/data/nutraceutical-data';

import {
  findCompetitorsByIngredient,
  findCompetitorsByCategory,
  getTopBrandsByRevenue,
} from '@/lib/data/nutraceutical-competitive-database';

import {
  findStudiesByIngredient,
  getEvidenceStrength,
  findLandmarkStudies,
} from '@/lib/data/nutraceutical-clinical-evidence';

// ────────────────────────────────────────────────────────────
// HEALTH FOCUS → COMPETITIVE DB CATEGORY MAPPING
// The ingredient data uses verbose health_focus strings while
// the competitive brand DB uses category slugs. This mapping
// bridges the two so Step 8 fallback actually works.
// ────────────────────────────────────────────────────────────
const HEALTH_FOCUS_TO_COMPETITIVE_CATEGORY: [RegExp, string][] = [
  // Longevity / aging
  [/nad\+|aging|longevity|sirtuin|senescent|senolyti|mitochondri|autophagy|cellular energy|telomer/i, 'longevity'],
  // Cognitive / brain
  [/cognitive|neuroprotect|brain|nerve growth|nootropi|memory|focus|mental/i, 'cognitive'],
  // Gut / microbiome / digestive
  [/gut|digestive|microbiome|probiotic|prebiotic|fiber|motility|ibs|bloating/i, 'gut_microbiome'],
  // Metabolic / blood sugar / weight
  [/glucose|metaboli|blood sugar|cholesterol|ampk|weight|appetite|glp-1|insulin/i, 'metabolic'],
  // Immune / foundational vitamins
  [/immune|cold|flu|vitamin d|vitamin c|zinc|wound healing/i, 'immune_foundational'],
  // Sleep
  [/sleep|circadian|melatonin|insomnia|jet lag|relaxation.*sleep/i, 'sleep'],
  // Sports / performance
  [/muscle|athletic|performance|recovery|endurance|power output|exercise|creatine|testosterone.*sport/i, 'sports_nutrition'],
  // Collagen / beauty
  [/collagen|skin|hair|nail|beauty|elasticity/i, 'collagen_beauty'],
  // Anti-inflammatory / pain
  [/anti-inflammatory|inflammation|curcum|turmeric|pain|cox-2|prostaglandin/i, 'anti_inflammatory'],
  // Hormone
  [/testosterone|cortisol|hormone|estrogen|thyroid|tongkat|ashwagandha.*testosterone/i, 'hormone_support'],
  // Joint
  [/joint|cartilage|glucosamine|chondroitin|mobility/i, 'joint_mobility'],
  // Multivitamin (broad)
  [/multivitamin|multi-nutrient|broad.*spectrum|300\+.*enzymatic/i, 'multivitamin'],
];

function mapHealthFocusToCategory(healthFocus: string): string | null {
  const text = healthFocus.toLowerCase();
  for (const [pattern, category] of HEALTH_FOCUS_TO_COMPETITIVE_CATEGORY) {
    if (pattern.test(text)) return category;
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL STAGE-BASED MARKET SHARE RANGES
// Consumer health adoption is driven by clinical evidence,
// brand strength, and channel access — not regulatory alone.
// ────────────────────────────────────────────────────────────
const NUTRA_STAGE_SHARE: Record<string, { low: number; base: number; high: number }> = {
  formulation:    { low: 0.0005, base: 0.001,  high: 0.003  },
  clinical_study: { low: 0.001,  base: 0.003,  high: 0.008  },
  market_ready:   { low: 0.003,  base: 0.008,  high: 0.020  },
  commercial:     { low: 0.008,  base: 0.020,  high: 0.060  },
};

// ────────────────────────────────────────────────────────────
// CLINICAL EVIDENCE MULTIPLIER
// Strong evidence unlocks practitioner channel + pricing premium
// ────────────────────────────────────────────────────────────
const CLINICAL_EVIDENCE_MULTIPLIER: Record<string, number> = {
  strong: 1.8,
  moderate: 1.3,
  emerging: 1.0,
  preliminary: 0.8,
  none: 0.6,
};

// ────────────────────────────────────────────────────────────
// PATENT MULTIPLIER
// IP protection enables premium pricing and competitive moat
// ────────────────────────────────────────────────────────────
const PATENT_MULTIPLIER = { patent_protected: 1.4, no_patent: 1.0 };

// ────────────────────────────────────────────────────────────
// REVENUE RAMP (10-year) — CATEGORY-CALIBRATED
// Different supplement categories have fundamentally different
// adoption dynamics. Novel/longevity ingredients ramp fast from
// a small base (early adopter → biohacker diffusion). Mature
// categories like probiotics ramp slower but sustain longer.
// ────────────────────────────────────────────────────────────
const NUTRA_REVENUE_RAMP_PROFILES: Record<string, number[]> = {
  // Novel / longevity: fast early adoption via biohacker community, quick peak, faster erosion from copycats
  novel_fast:       [0.15, 0.35, 0.60, 0.80, 0.92, 1.00, 0.98, 0.94, 0.88, 0.82],
  // Mature / crowded: slower ramp into saturated market, long plateau, gradual decline
  mature_sustained: [0.06, 0.15, 0.30, 0.50, 0.68, 0.82, 0.92, 1.00, 0.98, 0.95],
  // Clinical-driven: slow start (evidence must build), strong mid-phase as data publishes, long tail
  clinical_driven:  [0.05, 0.12, 0.28, 0.50, 0.72, 0.88, 0.95, 1.00, 1.00, 0.97],
  // DTC viral: explosive start, peaks early, decays as novelty fades
  dtc_viral:        [0.20, 0.45, 0.70, 0.90, 1.00, 0.95, 0.88, 0.80, 0.72, 0.65],
  // Default: balanced (original ramp — used when no category match)
  default:          [0.10, 0.25, 0.50, 0.72, 0.88, 0.95, 1.00, 1.00, 0.97, 0.93],
};

// Map ingredient/category/channel signals to a ramp profile
function selectRevenueRampProfile(
  ingredientCagr: number,
  categorySlug: string | null,
  channels: string[],
  hasClinicalData: boolean,
  evidenceLevel: string,
): number[] {
  const dtcHeavy = channels.includes('dtc_ecommerce') || channels.includes('subscription');
  const retailHeavy = channels.includes('retail_mass') || channels.includes('retail_specialty');

  // DTC-viral: high-growth ingredient + DTC-heavy channel mix + no retail anchor
  if (dtcHeavy && !retailHeavy && ingredientCagr > 12) {
    return NUTRA_REVENUE_RAMP_PROFILES.dtc_viral;
  }

  // Clinical-driven: strong or moderate evidence + practitioner channel
  if ((evidenceLevel === 'strong' || evidenceLevel === 'moderate') && channels.includes('practitioner')) {
    return NUTRA_REVENUE_RAMP_PROFILES.clinical_driven;
  }

  // Novel/fast: longevity, cognitive, or high-CAGR niche ingredients
  if (categorySlug === 'longevity' || categorySlug === 'cognitive' || ingredientCagr > 15) {
    return NUTRA_REVENUE_RAMP_PROFILES.novel_fast;
  }

  // Mature/sustained: probiotics, multivitamins, immune, joint — large established markets
  if (['gut_microbiome', 'multivitamin', 'immune_foundational', 'joint_mobility', 'collagen_beauty'].includes(categorySlug ?? '')) {
    return NUTRA_REVENUE_RAMP_PROFILES.mature_sustained;
  }

  // Clinical-driven fallback: has clinical data but not practitioner channel
  if (hasClinicalData && (evidenceLevel === 'strong' || evidenceLevel === 'moderate')) {
    return NUTRA_REVENUE_RAMP_PROFILES.clinical_driven;
  }

  return NUTRA_REVENUE_RAMP_PROFILES.default;
}

// ────────────────────────────────────────────────────────────
// CLAIM TYPE MARKET REACH MULTIPLIER
// Higher-quality claims expand addressable consumer base
// ────────────────────────────────────────────────────────────
const CLAIM_TYPE_REACH: Record<string, number> = {
  structure_function: 0.80,
  qualified_health: 0.90,
  authorized_health: 1.0,
  nutrient_content: 0.70,
  drug_claim: 0.50,
  cosmetic_claim: 0.60,
};

// ────────────────────────────────────────────────────────────
// GEOGRAPHY MULTIPLIERS
// Relative to US supplement market (=1.0)
// ────────────────────────────────────────────────────────────
const NUTRA_GEO_MULTIPLIERS: Record<string, { multiplier: number; regulatory_note: string }> = {
  US:        { multiplier: 1.0,  regulatory_note: 'DSHEA framework. Largest supplement market globally.' },
  EU5:       { multiplier: 0.55, regulatory_note: 'EU Novel Foods Regulation. Stricter than US for new ingredients.' },
  Germany:   { multiplier: 0.18, regulatory_note: 'Largest EU supplement market. Apotheken channel important.' },
  France:    { multiplier: 0.12, regulatory_note: 'ANSES registration. Pharmacy-dominant distribution.' },
  UK:        { multiplier: 0.14, regulatory_note: 'Post-Brexit: independent MHRA framework.' },
  Italy:     { multiplier: 0.08, regulatory_note: 'Ministry of Health notification system.' },
  Spain:     { multiplier: 0.06, regulatory_note: 'AESAN registration required.' },
  Japan:     { multiplier: 0.35, regulatory_note: 'FOSHU and FFC systems.' },
  China:     { multiplier: 1.2,  regulatory_note: 'Blue hat registration. Large market, complex regulatory.' },
  Canada:    { multiplier: 0.12, regulatory_note: 'Natural Health Products Directorate. NPN required.' },
  Australia: { multiplier: 0.08, regulatory_note: 'TGA Listed Medicines (AUST L) pathway.' },
  RoW:       { multiplier: 0.3,  regulatory_note: 'Mixed regulatory environments.' },
  Global:    { multiplier: 3.0,  regulatory_note: 'All markets combined.' },
};

// ────────────────────────────────────────────────────────────
// COMPARABLE ACQUISITIONS DATABASE
// ────────────────────────────────────────────────────────────
const NUTRA_COMPARABLE_ACQUISITIONS = [
  { target: 'Vital Proteins', acquirer: 'Nestle Health Science', value_m: 900, multiple: '~6x revenue', year: 2021 },
  { target: 'Nuun Hydration', acquirer: 'Nestle Health Science', value_m: 450, multiple: '~5x revenue', year: 2021 },
  { target: 'Garden of Life', acquirer: 'Nestle Health Science', value_m: 2300, multiple: '~4x revenue', year: 2017 },
  { target: 'Nutrafol', acquirer: 'Unilever', value_m: 1000, multiple: '~8x revenue', year: 2022 },
  { target: 'Olly Nutrition', acquirer: 'Unilever', value_m: 700, multiple: '~5x revenue', year: 2019 },
  { target: 'Onnit', acquirer: 'Unilever', value_m: 500, multiple: '~4x revenue', year: 2021 },
  { target: 'SmartyPants Vitamins', acquirer: 'Unilever', value_m: 300, multiple: '~3x revenue', year: 2020 },
  { target: "Nature's Bounty / Bountiful Company", acquirer: 'KKR', value_m: 5750, multiple: '~3x revenue', year: 2020 },
  { target: 'Metagenics', acquirer: 'Alticor/Amway', value_m: 500, multiple: '~4x revenue', year: 2021 },
  { target: "Zarbee's Naturals", acquirer: 'Johnson & Johnson', value_m: 500, multiple: '~5x revenue', year: 2021 },
  { target: 'Orgain', acquirer: 'Butterfly Equity', value_m: 1000, multiple: '~4x revenue', year: 2022 },
  { target: 'Nutraceutix', acquirer: 'Church & Dwight', value_m: 200, multiple: '~3x revenue', year: 2019 },
];


// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Fuzzy match an ingredient name against NUTRACEUTICAL_INGREDIENTS.
 * Tries exact match, then case-insensitive substring, then keyword overlap.
 */
function findIngredient(name: string): NutraceuticalIngredient | null {
  const lower = name.toLowerCase().trim();

  // Exact (case-insensitive) match
  const exact = NUTRACEUTICAL_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === lower
  );
  if (exact) return exact;

  // Substring match — ingredient name contains query or vice versa
  const substring = NUTRACEUTICAL_INGREDIENTS.find(
    (i) =>
      i.name.toLowerCase().includes(lower) ||
      lower.includes(i.name.toLowerCase())
  );
  if (substring) return substring;

  // Keyword overlap — split into words and check overlap
  const queryWords = lower.split(/[\s\-\/()]+/).filter((w) => w.length > 2);
  let bestMatch: NutraceuticalIngredient | null = null;
  let bestScore = 0;

  for (const ingredient of NUTRACEUTICAL_INGREDIENTS) {
    const ingredientWords = ingredient.name
      .toLowerCase()
      .split(/[\s\-\/()]+/)
      .filter((w) => w.length > 2);
    const overlap = queryWords.filter((w) =>
      ingredientWords.some((iw) => iw.includes(w) || w.includes(iw))
    ).length;
    const score = overlap / Math.max(queryWords.length, 1);
    if (score > bestScore && score >= 0.3) {
      bestScore = score;
      bestMatch = ingredient;
    }
  }

  return bestMatch;
}

/**
 * Estimate health category penetration from health focus keyword.
 * Returns { users: number; penetration_pct: number; category_size_b: number }.
 */
function getHealthCategoryPenetration(healthFocus: string): {
  users: number;
  penetration_pct: number;
  category_size_b: number;
} {
  const lower = healthFocus.toLowerCase();

  // Try to match to HEALTH_FOCUS_SUGGESTIONS by keyword
  const match = HEALTH_FOCUS_SUGGESTIONS.find((h) => {
    const hLower = h.name.toLowerCase();
    return (
      lower.includes(hLower) ||
      hLower.includes(lower) ||
      h.category.toLowerCase().includes(lower)
    );
  });

  // Try to match to US_SUPPLEMENT_MARKET.top_categories
  const categoryMatch = US_SUPPLEMENT_MARKET.top_categories.find((c) =>
    lower.includes(c.category.toLowerCase()) ||
    c.category.toLowerCase().includes(lower)
  );

  if (categoryMatch) {
    const categoryRevenue = categoryMatch.size_b * 1e9;
    const avgAnnualSpend = US_SUPPLEMENT_MARKET.avg_monthly_spend_per_user * 12;
    const users = Math.round(categoryRevenue / avgAnnualSpend);
    return {
      users,
      penetration_pct: (users / (US_SUPPLEMENT_MARKET.total_supplement_users_m * 1e6)) * 100,
      category_size_b: categoryMatch.size_b,
    };
  }

  if (match) {
    // Estimate from detail string — parse "$X.XB" pattern
    const sizeMatch = match.detail.match(/\$?([\d.]+)B/i);
    const sizeB = sizeMatch ? parseFloat(sizeMatch[1]) : 2.0;
    const avgAnnualSpend = US_SUPPLEMENT_MARKET.avg_monthly_spend_per_user * 12;
    const users = Math.round((sizeB * 1e9) / avgAnnualSpend);
    return {
      users,
      penetration_pct: (users / (US_SUPPLEMENT_MARKET.total_supplement_users_m * 1e6)) * 100,
      category_size_b: sizeB,
    };
  }

  // Fallback: use average ~5% of supplement users for a niche category
  const fallbackUsers = Math.round(US_SUPPLEMENT_MARKET.total_supplement_users_m * 1e6 * 0.05);
  return {
    users: fallbackUsers,
    penetration_pct: 5.0,
    category_size_b: (fallbackUsers * US_SUPPLEMENT_MARKET.avg_monthly_spend_per_user * 12) / 1e9,
  };
}

/**
 * Keyword-based demographic factor from target_demographic string.
 * Returns a fraction of health-category users that match the target.
 */
function getDemographicFactor(target: string): number {
  const lower = target.toLowerCase();

  // Specific keyword matches
  if (/women|female|woman/.test(lower)) return 0.50;
  if (/men\b|male\b/.test(lower) && !/women/.test(lower)) return 0.45;
  if (/athlete|sport|fitness|performance|gym/.test(lower)) return 0.15;
  if (/senior|elderly|65\+|70\+|aging/.test(lower)) return 0.20;
  if (/millennial|25.?35|young adult/.test(lower)) return 0.22;
  if (/biohack|optimiz|longevity|health.?conscious/.test(lower)) return 0.18;
  if (/adult.?40.?65|middle.?age|40\+|45\+|50\+/.test(lower)) return 0.35;
  if (/adult.?30.?60|30\+/.test(lower)) return 0.40;
  if (/pregnan|prenatal|fertility|maternal/.test(lower)) return 0.12;
  if (/child|kid|pediatric/.test(lower)) return 0.10;
  if (/everyone|general|all adult/.test(lower)) return 0.50;

  // Default: moderate demographic slice
  return 0.30;
}

/**
 * Get normalized channel weights from selected channels.
 * Returns a map from channel to normalized weight (0-1, sum = 1).
 */
function getChannelWeight(
  channels: NutraceuticalChannel[]
): Map<NutraceuticalChannel, { weight: number; economics: ChannelEconomics }> {
  const result = new Map<NutraceuticalChannel, { weight: number; economics: ChannelEconomics }>();

  // Find matching economics for each selected channel
  const matched: { channel: NutraceuticalChannel; economics: ChannelEconomics; share: number }[] = [];
  for (const ch of channels) {
    const econ = CHANNEL_ECONOMICS.find((e) => e.channel === ch);
    if (econ) {
      matched.push({ channel: ch, economics: econ, share: econ.market_share_of_supplement_sales_pct });
    }
  }

  const totalShare = matched.reduce((sum, m) => sum + m.share, 0);

  for (const m of matched) {
    result.set(m.channel, {
      weight: totalShare > 0 ? m.share / totalShare : 1 / matched.length,
      economics: m.economics,
    });
  }

  return result;
}

/**
 * Build 12-month retention curve for DTC / subscription model.
 * Clinical data improves retention; subscription model has different baseline.
 */
function buildRetentionCurve(hasClinical: boolean, isSubscription: boolean): number[] {
  // Baseline retention curve (% retained at end of each month)
  const base = [100, 82, 70, 62, 56, 52, 48, 46, 44, 43, 42, 41];

  return base.map((pct) => {
    let adjusted = pct;
    // Clinical data improves trust and retention
    if (hasClinical) adjusted = Math.min(100, adjusted + 5);
    // Subscription model has slightly better retention due to inertia
    if (isSubscription) adjusted = Math.min(100, adjusted + 3);
    return adjusted;
  });
}

/**
 * Convert a raw value to a display metric with appropriate unit (B or M).
 */
function toMetric(
  value: number,
  confidence: 'high' | 'medium' | 'low'
): { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' } {
  if (Math.abs(value) >= 1.0) {
    return { value: Math.round(value * 100) / 100, unit: 'B', confidence };
  }
  return { value: Math.round(value * 1000 * 10) / 10, unit: 'M', confidence };
}

/**
 * Build plain-English methodology string.
 */
function buildMethodology(
  input: NutraceuticalMarketSizingInput,
  ingredient: NutraceuticalIngredient | null,
  ingredientUsedFallback: boolean,
  capturableConsumers: number,
  totalNetRevenue: number
): string {
  const lines = [
    `Market sizing methodology for ${input.product_name || input.primary_ingredient} in the ${input.health_focus} segment:`,
    '',
    `1. INGREDIENT LOOKUP: ${ingredient ? `Matched "${input.primary_ingredient}" to database entry "${ingredient.name}" (${ingredient.category}, US market $${ingredient.us_market_size_m_2025}M, ${ingredient.cagr_5yr_pct}% 5-yr CAGR).` : `No exact match found for "${input.primary_ingredient}". Used health-focus category averages.`}`,
    `2. CONSUMER FUNNEL: Started with ${(US_SUPPLEMENT_MARKET.total_supplement_users_m).toFixed(0)}M US supplement users (${US_SUPPLEMENT_MARKET.us_adult_supplement_usage_pct}% of adults). Applied health-category filter, demographic targeting ("${input.target_demographic}"), and channel reach factor to derive addressable consumers.`,
    `3. CAPTURABLE CONSUMERS: Applied stage-based share range (${input.development_stage}: ${(NUTRA_STAGE_SHARE[input.development_stage].low * 100).toFixed(2)}% - ${(NUTRA_STAGE_SHARE[input.development_stage].high * 100).toFixed(2)}%), clinical evidence multiplier (${ingredient?.clinical_evidence_level || 'moderate'}), and patent status (${input.patent_protected ? 'protected' : 'no patent'}) to yield ~${Math.round(capturableConsumers).toLocaleString()} capturable consumers.`,
    `4. CHANNEL MODEL: Revenue modeled across ${input.channels.length} channel(s): ${input.channels.join(', ')}. Each channel weighted by market share contribution and assigned brand margin, CAC, and LTV benchmarks from Terrain channel economics database.`,
    `5. PRICING: Unit price $${input.unit_price} x ${input.units_per_year_per_customer} units/year = $${(input.unit_price * input.units_per_year_per_customer).toFixed(0)}/customer/year. COGS at ${input.cogs_pct}% of retail.`,
    `6. TAM/SAM/SOM: US TAM derived from ${ingredient ? 'ingredient-level market data' : 'category-level estimates'}. SAM adjusted for channel reach and claim type (${input.claim_type}). SOM = modeled net revenue from channel analysis.`,
    `7. GEOGRAPHY: Applied Terrain geo multipliers for ${input.geography.join(', ')}. Global TAM = US TAM x sum of territory multipliers.`,
    `8. PROJECTIONS: 10-year bear/base/bull revenue using nutraceutical revenue ramp curve and ${ingredient ? ingredient.cagr_5yr_pct + '%' : '7.5%'} category CAGR. Bear = 0.6x, Bull = 1.5x.`,
    `9. COMPETITIVE: Category brand count estimated from market size. Moat scored on IP, clinical evidence, and channel barriers.`,
    `10. REGULATORY: Mapped to DSHEA/NDI/OTC pathway based on category. NDI, FTC, and Prop 65 risk assessed.`,
    '',
    `All figures in USD. Base year: 2025. Data sources include Nutrition Business Journal, Grand View Research, Euromonitor, ClinicalTrials.gov supplement studies, FDA CFSAN databases, and Terrain proprietary channel economics benchmarks.`,
  ];
  return lines.join('\n');
}

/**
 * Build data sources array.
 */
function buildDataSources(
  ingredient: NutraceuticalIngredient | null,
  competitorCount: number,
  studyCount: number,
): { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[] {
  const sources: { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[] = [
    { name: 'Nutrition Business Journal — US supplement market data 2025', type: 'licensed' },
    { name: 'Grand View Research — Dietary supplement market report', type: 'licensed' },
    { name: 'Euromonitor International — Consumer Health data', type: 'licensed' },
    { name: 'FDA CFSAN — Dietary Supplement Ingredient Directory', type: 'public', url: 'https://www.fda.gov/food/dietary-supplements' },
    { name: 'FTC — Health Products Enforcement Actions', type: 'public', url: 'https://www.ftc.gov/enforcement/cases-proceedings' },
    { name: 'Terrain Channel Economics Database', type: 'proprietary' },
    { name: 'Terrain Nutraceutical Ingredient Database', type: 'proprietary' },
    { name: 'Terrain M&A Transaction Database — Consumer Health', type: 'proprietary' },
  ];

  if (competitorCount > 0) {
    sources.push({
      name: `Terrain Competitive Brand Database — ${competitorCount} tracked brands (NBJ, SPINS, Jungle Scout / Helium 10 estimates)`,
      type: 'proprietary',
    });
  }

  if (studyCount > 0) {
    sources.push({
      name: `Terrain Clinical Evidence Database — ${studyCount} published studies (PubMed, Cochrane, ClinicalTrials.gov)`,
      type: 'proprietary',
    });
  }

  if (ingredient) {
    sources.push({
      name: `ClinicalTrials.gov — ${ingredient.name} clinical studies`,
      type: 'public',
      url: `https://clinicaltrials.gov/search?intr=${encodeURIComponent(ingredient.name)}`,
    });
  }

  return sources;
}


// ════════════════════════════════════════════════════════════
// MAIN CALCULATION FUNCTION — 15-STEP PIPELINE
// ════════════════════════════════════════════════════════════

export async function calculateNutraceuticalMarketSizing(
  input: NutraceuticalMarketSizingInput
): Promise<NutraceuticalMarketSizingOutput> {

  // ──────────────────────────────────────────────────────────
  // STEP 1: INGREDIENT LOOKUP
  // ──────────────────────────────────────────────────────────
  let ingredient = findIngredient(input.primary_ingredient);
  let ingredientUsedFallback = false;

  // If no ingredient match, try health_focus to find a related category
  if (!ingredient) {
    const healthLower = input.health_focus.toLowerCase();
    ingredient = NUTRACEUTICAL_INGREDIENTS.find(
      (i) =>
        healthLower.includes(i.category.toLowerCase()) ||
        i.health_focus.toLowerCase().includes(healthLower) ||
        healthLower.includes(i.health_focus.toLowerCase().split(',')[0])
    ) ?? null;
    if (ingredient) ingredientUsedFallback = true;
  }

  // Derive core metrics from ingredient or fallbacks
  const ingredientMarketSizeM = ingredient?.us_market_size_m_2025 ?? 200;
  const ingredientCagr = ingredient?.cagr_5yr_pct ?? US_SUPPLEMENT_MARKET.cagr_5yr_pct;
  const clinicalEvidenceLevel = ingredient?.clinical_evidence_level ?? 'moderate';

  // ──────────────────────────────────────────────────────────
  // STEP 2: CONSUMER FUNNEL
  // ──────────────────────────────────────────────────────────
  const US_ADULTS = 258_000_000;
  const supplementUsers = US_SUPPLEMENT_MARKET.total_supplement_users_m * 1_000_000; // 170M

  // Health category users: derive from ingredient market size / avg annual spend
  const avgAnnualSpend = US_SUPPLEMENT_MARKET.avg_monthly_spend_per_user * 12; // $504
  const healthCatPenetration = getHealthCategoryPenetration(input.health_focus);
  const healthCategoryUsers = ingredient
    ? Math.round((ingredientMarketSizeM * 1e6) / avgAnnualSpend)
    : healthCatPenetration.users;

  // Target demographic
  const demographicFactor = getDemographicFactor(input.target_demographic);
  const targetDemographicUsers = Math.round(healthCategoryUsers * demographicFactor);

  // Channel reach factor: sum of selected channels' market share / 100
  const channelWeights = getChannelWeight(input.channels);
  let channelShareSum = 0;
  for (const [, data] of Array.from(channelWeights)) {
    channelShareSum += data.economics.market_share_of_supplement_sales_pct;
  }
  const channelReachFactor = Math.min(channelShareSum / 100, 1.0);

  // Addressable consumers
  const addressableConsumers = Math.round(targetDemographicUsers * channelReachFactor);

  // Capturable consumers
  const stageShare = NUTRA_STAGE_SHARE[input.development_stage] ?? NUTRA_STAGE_SHARE.market_ready;
  const evidenceMultiplier = CLINICAL_EVIDENCE_MULTIPLIER[clinicalEvidenceLevel] ?? 1.0;
  const patentMult = input.patent_protected ? PATENT_MULTIPLIER.patent_protected : PATENT_MULTIPLIER.no_patent;

  const capturableBase = addressableConsumers * stageShare.base * evidenceMultiplier * patentMult;
  const capturableLow = addressableConsumers * stageShare.low * evidenceMultiplier * patentMult;
  const capturableHigh = addressableConsumers * stageShare.high * evidenceMultiplier * patentMult;

  const consumerFunnel: NutraceuticalConsumerFunnel = {
    us_adult_population: US_ADULTS,
    supplement_users: supplementUsers,
    supplement_users_pct: US_SUPPLEMENT_MARKET.us_adult_supplement_usage_pct,
    health_category_users: healthCategoryUsers,
    health_category_penetration_pct:
      Math.round((healthCategoryUsers / supplementUsers) * 10000) / 100,
    target_demographic_users: targetDemographicUsers,
    demographic_penetration_pct:
      Math.round((targetDemographicUsers / healthCategoryUsers) * 10000) / 100,
    addressable_consumers: addressableConsumers,
    capturable_consumers: Math.round(capturableBase),
    avg_annual_spend: input.unit_price * input.units_per_year_per_customer,
  };

  // ──────────────────────────────────────────────────────────
  // STEP 3: CHANNEL REVENUE MODEL
  // ──────────────────────────────────────────────────────────
  const annualRevenuePerCustomer = input.unit_price * input.units_per_year_per_customer;
  const avgLifetimeYears = 3;
  const channelRevenues: NutraceuticalChannelRevenue[] = [];
  let totalNetRevenue = 0;

  for (const [channel, data] of Array.from(channelWeights)) {
    const { weight, economics } = data;
    const volume = Math.round(capturableBase * weight);
    const grossRevenue = (volume * annualRevenuePerCustomer) / 1_000_000;
    const brandMarginPct = economics.typical_margin_pct.brand;
    const netRevenue = grossRevenue * (brandMarginPct / 100);
    const cacMid = (economics.customer_acquisition_cost.low + economics.customer_acquisition_cost.high) / 2;
    const ltv = annualRevenuePerCustomer * (brandMarginPct / 100) * avgLifetimeYears;
    const ltvCac = cacMid > 0 ? ltv / cacMid : 0;

    channelRevenues.push({
      channel,
      channel_share_pct: Math.round(weight * 10000) / 100,
      volume_units: volume,
      gross_revenue_m: Math.round(grossRevenue * 100) / 100,
      brand_margin_pct: brandMarginPct,
      net_revenue_m: Math.round(netRevenue * 100) / 100,
      cac: Math.round(cacMid),
      ltv: Math.round(ltv),
      ltv_to_cac: Math.round(ltvCac * 100) / 100,
      contribution_pct: 0, // will fill in after totals
    });

    totalNetRevenue += netRevenue;
  }

  // Fill in contribution_pct
  for (const cr of channelRevenues) {
    cr.contribution_pct =
      totalNetRevenue > 0
        ? Math.round((cr.net_revenue_m / totalNetRevenue) * 10000) / 100
        : 0;
  }

  // ──────────────────────────────────────────────────────────
  // STEP 4: DTC UNIT ECONOMICS
  // ──────────────────────────────────────────────────────────
  const hasDTC = input.channels.includes('dtc_ecommerce') || input.channels.includes('subscription');
  let dtcEconomics: NutraceuticalDTCEconomics | undefined;

  if (hasDTC) {
    const monthlyPrice = annualRevenuePerCustomer / 12;
    const grossMarginPct = 100 - input.cogs_pct;
    const grossMarginFraction = grossMarginPct / 100;
    const monthlyContribution = monthlyPrice * grossMarginFraction;
    const cac = 75; // DTC midpoint

    const isSubscription = input.channels.includes('subscription');
    const retentionCurve = buildRetentionCurve(input.has_clinical_data, isSubscription);

    // LTV 12-month: sum of monthly contributions weighted by retention
    let ltv12 = 0;
    for (let m = 0; m < 12; m++) {
      ltv12 += monthlyContribution * (retentionCurve[m] / 100);
    }

    // LTV 36-month: extrapolate with exponential decay beyond month 12
    // Decay rate derived from month 11 to month 12 retention delta
    const decayRate = retentionCurve[11] > 0
      ? retentionCurve[11] / retentionCurve[10]
      : 0.98;
    let ltv36 = ltv12;
    let currentRetention = retentionCurve[11];
    for (let m = 12; m < 36; m++) {
      currentRetention *= decayRate;
      ltv36 += monthlyContribution * (currentRetention / 100);
    }

    const paybackMonths = monthlyContribution > 0
      ? Math.ceil(cac / monthlyContribution)
      : 999;

    // Break-even subscribers: $500K fixed cost / (monthly contribution x 12)
    const annualContribution = monthlyContribution * 12;
    const breakEvenSubscribers = annualContribution > 0
      ? Math.round(500_000 / annualContribution)
      : 0;

    dtcEconomics = {
      monthly_subscription_price: Math.round(monthlyPrice * 100) / 100,
      cac,
      ltv_12m: Math.round(ltv12 * 100) / 100,
      ltv_36m: Math.round(ltv36 * 100) / 100,
      payback_months: paybackMonths,
      month_6_retention_pct: retentionCurve[5],
      month_12_retention_pct: retentionCurve[11],
      gross_margin_pct: grossMarginPct,
      contribution_margin_per_customer: Math.round(monthlyContribution * 12 * 100) / 100,
      break_even_subscribers: breakEvenSubscribers,
      narrative: `At $${monthlyPrice.toFixed(0)}/mo with ${grossMarginPct}% gross margin, each subscriber generates $${monthlyContribution.toFixed(2)}/mo in contribution. With a $${cac} CAC, payback occurs in ${paybackMonths} month(s). LTV:CAC of ${(ltv12 / cac).toFixed(1)}x (12-month) and ${(ltv36 / cac).toFixed(1)}x (36-month) ${ltv12 / cac >= 3 ? 'exceeds' : 'falls below'} the 3x industry benchmark. Month-12 retention of ${retentionCurve[11]}% is ${retentionCurve[11] >= 45 ? 'strong' : retentionCurve[11] >= 35 ? 'moderate' : 'below average'} for the supplement category. ${input.has_clinical_data ? 'Clinical evidence provides +5pp retention uplift across the curve.' : 'Adding clinical evidence could improve retention by ~5 percentage points.'}`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // STEP 5: TAM / SAM / SOM
  // ──────────────────────────────────────────────────────────
  // US TAM: ingredient market size if available, else derive from category
  const usTamB = ingredient
    ? ingredientMarketSizeM / 1000
    : (healthCategoryUsers * avgAnnualSpend) / 1e9;

  // US SAM: TAM * channel reach * claim type reach
  const claimReach = CLAIM_TYPE_REACH[input.claim_type] ?? 0.80;
  const usSamB = usTamB * channelReachFactor * claimReach;

  // US SOM: from channel revenue model
  const usSomBase = totalNetRevenue; // in $M
  const usSomLow = usSomBase * (capturableLow / Math.max(capturableBase, 1));
  const usSomHigh = usSomBase * (capturableHigh / Math.max(capturableBase, 1));

  // Global TAM: sum of geo multipliers for selected geographies
  let geoMultiplierSum = 0;
  for (const geo of input.geography) {
    const geoData = NUTRA_GEO_MULTIPLIERS[geo];
    if (geoData) {
      geoMultiplierSum += geoData.multiplier;
    }
  }
  // If only US selected, global = US
  if (geoMultiplierSum === 0) geoMultiplierSum = 1.0;
  const globalTamB = usTamB * geoMultiplierSum;

  // Confidence based on data quality
  const tamConfidence: 'high' | 'medium' | 'low' = ingredient
    ? 'high'
    : ingredientUsedFallback
      ? 'medium'
      : 'low';

  const samConfidence: 'high' | 'medium' | 'low' = ingredient && input.channels.length > 0
    ? 'medium'
    : 'low';

  // ──────────────────────────────────────────────────────────
  // STEP 6: GEOGRAPHY BREAKDOWN
  // ──────────────────────────────────────────────────────────
  const geographyBreakdown: NutraceuticalGeographyBreakdown[] = input.geography.map((geo) => {
    const geoData = NUTRA_GEO_MULTIPLIERS[geo] ?? { multiplier: 0.1, regulatory_note: 'No data available.' };
    const territoryTamM = usTamB * geoData.multiplier * 1000;

    // Estimate supplement penetration per territory
    const penetration: Record<string, number> = {
      US: 57, EU5: 40, Germany: 45, France: 38, UK: 42, Italy: 35,
      Spain: 32, Japan: 50, China: 25, Canada: 48, Australia: 52, RoW: 20, Global: 40,
    };

    return {
      territory: geo,
      tam: toMetric(territoryTamM / 1000, tamConfidence),
      supplement_penetration_pct: penetration[geo] ?? 30,
      regulatory_environment: geoData.regulatory_note,
      market_note:
        geo === 'US'
          ? 'Largest supplement market globally. DSHEA provides relatively low regulatory barrier.'
          : geo === 'China'
            ? 'Blue hat registration required. Large and fast-growing market with complex cross-border e-commerce regulations.'
            : geo === 'Japan'
              ? 'FOSHU (Foods for Specified Health Uses) and FFC systems. Health-conscious consumers.'
              : geo === 'EU5'
                ? 'EU Novel Foods Regulation. Mutual recognition within EU but stricter ingredient acceptance than US.'
                : `${geo} market for ${input.health_focus} supplements.`,
    };
  });

  // ──────────────────────────────────────────────────────────
  // STEP 7: REVENUE PROJECTION (10-year)
  // ──────────────────────────────────────────────────────────
  const cagrFraction = ingredientCagr / 100;
  const revenueProjection: { year: number; bear: number; base: number; bull: number }[] = [];
  let peakBear = 0;
  let peakBase = 0;
  let peakBull = 0;

  // Select category-calibrated ramp profile
  const rampProfile = selectRevenueRampProfile(
    ingredientCagr,
    mapHealthFocusToCategory(ingredient?.health_focus ?? input.health_focus),
    input.channels,
    input.has_clinical_data,
    clinicalEvidenceLevel,
  );

  for (let i = 0; i < 10; i++) {
    const yearOffset = i;
    const rampFactor = rampProfile[i];
    const growthFactor = Math.pow(1 + cagrFraction, yearOffset);
    const baseRev = usSomBase * rampFactor * growthFactor;
    const bearRev = baseRev * 0.6;
    const bullRev = baseRev * 1.5;

    const bearRounded = Math.round(bearRev * 100) / 100;
    const baseRounded = Math.round(baseRev * 100) / 100;
    const bullRounded = Math.round(bullRev * 100) / 100;

    revenueProjection.push({
      year: input.launch_year + i,
      bear: bearRounded,
      base: baseRounded,
      bull: bullRounded,
    });

    peakBear = Math.max(peakBear, bearRounded);
    peakBase = Math.max(peakBase, baseRounded);
    peakBull = Math.max(peakBull, bullRounded);
  }

  // ──────────────────────────────────────────────────────────
  // STEP 8: COMPETITIVE POSITIONING (grounded in brand database)
  // ──────────────────────────────────────────────────────────
  // Pull real competitors from the competitive brand database
  const dbCompetitors = findCompetitorsByIngredient(input.primary_ingredient);
  // Fallback: map health_focus to competitive DB category slug
  const mappedCategory = mapHealthFocusToCategory(ingredient?.health_focus ?? input.health_focus);
  const categoryCompetitors = dbCompetitors.length > 0
    ? dbCompetitors
    : mappedCategory
      ? findCompetitorsByCategory(mappedCategory)
      : [];
  const topBrandsDB = categoryCompetitors.length > 0
    ? [...categoryCompetitors].sort((a, b) => b.estimated_annual_revenue_m - a.estimated_annual_revenue_m)
    : [];
  const hasRealData = topBrandsDB.length > 0;

  // Brand count: real data + heuristic expansion for unlisted brands
  const listedBrands = categoryCompetitors.length;
  const rawBrandCount = Math.round(ingredientMarketSizeM / 2);
  const totalBrands = hasRealData
    ? Math.max(listedBrands, Math.min(500, rawBrandCount))
    : Math.max(20, Math.min(500, rawBrandCount));

  // Top brand: real data preferred
  const topBrandEntry = topBrandsDB[0];
  const topBrand = topBrandEntry?.brand_name ?? ingredient?.key_brands?.[0] ?? 'Category leader';
  const topBrandRevenue = topBrandEntry
    ? topBrandEntry.estimated_annual_revenue_m
    : Math.round(ingredientMarketSizeM * 0.12);

  // Price positioning based on unit price vs typical monthly range
  const typicalLow = ingredient?.typical_retail_price_monthly?.low ?? 15;
  const typicalHigh = ingredient?.typical_retail_price_monthly?.high ?? 50;
  const monthlyEquivalent = annualRevenuePerCustomer / 12;
  const pricePositioning: 'mass' | 'premium' | 'clinical_grade' | 'luxury' =
    monthlyEquivalent <= typicalLow * 0.8
      ? 'mass'
      : monthlyEquivalent <= typicalHigh
        ? 'premium'
        : monthlyEquivalent <= typicalHigh * 2
          ? 'clinical_grade'
          : 'luxury';

  // Amazon BSR from real competitor data
  const amazonCompetitors = categoryCompetitors.filter((c) => c.amazon_bsr_estimate != null);
  const realBsrRange = amazonCompetitors.length >= 2
    ? `#${Math.min(...amazonCompetitors.map((c) => c.amazon_bsr_estimate!))} - #${Math.max(...amazonCompetitors.map((c) => c.amazon_bsr_estimate!))}`
    : amazonCompetitors.length === 1
      ? `~#${amazonCompetitors[0].amazon_bsr_estimate}`
      : undefined;

  // Moat score (0-100)
  let moatScore = 20; // base
  if (input.patent_protected) moatScore += 25;
  if (input.has_clinical_data) moatScore += 20;
  if (clinicalEvidenceLevel === 'strong') moatScore += 10;
  if (input.channels.includes('practitioner')) moatScore += 10;
  if (input.channels.includes('subscription')) moatScore += 5;
  if (ingredient?.ip_landscape?.toLowerCase().includes('patent')) moatScore += 10;
  moatScore = Math.min(100, moatScore);

  // Differentiation vectors
  const diffVectors: string[] = [];
  if (input.patent_protected) diffVectors.push('Patent-protected formulation or delivery');
  if (input.has_clinical_data) diffVectors.push('Clinical evidence differentiation');
  if (input.channels.includes('practitioner'))
    diffVectors.push('Practitioner recommendation channel');
  if (pricePositioning === 'clinical_grade' || pricePositioning === 'luxury')
    diffVectors.push('Premium price positioning signals quality');
  if (input.claim_type === 'qualified_health' || input.claim_type === 'authorized_health')
    diffVectors.push('FDA-sanctioned health claim');
  if (input.channels.includes('subscription'))
    diffVectors.push('Subscription model drives recurring revenue');
  if (diffVectors.length === 0)
    diffVectors.push('Formulation innovation', 'Brand and marketing execution');

  // Build competitive landscape summary from real data
  const top3Brands = topBrandsDB.slice(0, 3);
  const top3Summary = top3Brands.length > 0
    ? ` Top competitors: ${top3Brands.map((b) => `${b.brand_name} (${b.company}, ~$${b.estimated_annual_revenue_m}M, ${b.price_positioning})`).join('; ')}.`
    : '';
  const clinicalDiffBrands = categoryCompetitors.filter((c) => c.clinical_studies_count > 0);
  const clinicalNote = clinicalDiffBrands.length > 0
    ? ` ${clinicalDiffBrands.length} of ${listedBrands} tracked competitors have published clinical studies — clinical evidence is ${clinicalDiffBrands.length > listedBrands * 0.4 ? 'a baseline expectation' : 'a genuine differentiator'} in this category.`
    : ' Few competitors have proprietary clinical data — clinical evidence is a major differentiator.';

  const competitivePositioning: NutraceuticalCompetitivePositioning = {
    total_brands_in_category: totalBrands,
    top_brand: topBrand,
    top_brand_estimated_revenue_m: topBrandRevenue,
    price_positioning: pricePositioning,
    clinical_evidence_differentiator: input.has_clinical_data,
    amazon_bsr_range: input.channels.includes('amazon')
      ? (realBsrRange ?? `#${Math.round(ingredientMarketSizeM / 10)}-${Math.round(ingredientMarketSizeM)}`)
      : undefined,
    key_differentiation_vectors: diffVectors,
    competitive_moat_score: moatScore,
    narrative: `The ${ingredient?.name ?? input.primary_ingredient} category has approximately ${totalBrands} active brands competing for a $${ingredientMarketSizeM}M US market.${top3Summary}${clinicalNote} Your ${pricePositioning} positioning ${pricePositioning === 'clinical_grade' || pricePositioning === 'luxury' ? 'targets the upper tier' : 'competes in the core'} of the market. Competitive moat score: ${moatScore}/100 (${moatScore >= 60 ? 'strong' : moatScore >= 40 ? 'moderate' : 'weak'}). Key differentiation: ${diffVectors.slice(0, 3).join(', ')}.`,
  };

  // ──────────────────────────────────────────────────────────
  // STEP 9: REGULATORY ASSESSMENT
  // ──────────────────────────────────────────────────────────
  // Match nutraceutical_category to OTC_REGULATORY_PATHWAYS
  const matchedPathways = OTC_REGULATORY_PATHWAYS.filter((p) =>
    p.applicable_categories.includes(input.nutraceutical_category)
  );
  const primaryPathway = matchedPathways[0] ?? OTC_REGULATORY_PATHWAYS[0];

  // NDI check
  const ndiRequired =
    ingredient?.regulatory_status?.toLowerCase().includes('ndi') ||
    ingredient?.regulatory_status?.toLowerCase().includes('new dietary ingredient') ||
    input.nutraceutical_category === 'longevity_compound';

  const ndiAcceptanceProbability = ndiRequired
    ? ingredient?.regulatory_status?.toLowerCase().includes('accepted')
      ? 75
      : ingredient?.regulatory_status?.toLowerCase().includes('disputed') ||
          ingredient?.regulatory_status?.toLowerCase().includes('challenged')
        ? 40
        : 65
    : undefined;

  // FTC risk based on claim type
  const ftcRisk: 'low' | 'moderate' | 'high' =
    input.claim_type === 'drug_claim'
      ? 'high'
      : input.claim_type === 'qualified_health' || input.claim_type === 'authorized_health'
        ? 'moderate'
        : input.claim_type === 'structure_function'
          ? 'low'
          : 'moderate';

  // FDA warning letter risk
  const fdaRisk: 'low' | 'moderate' | 'high' =
    input.claim_type === 'drug_claim'
      ? 'high'
      : ndiRequired && ndiAcceptanceProbability !== undefined && ndiAcceptanceProbability < 60
        ? 'high'
        : input.nutraceutical_category === 'longevity_compound' || input.nutraceutical_category === 'cosmeceutical'
          ? 'moderate'
          : 'low';

  // cGMP compliance cost
  const cgmpCostK =
    input.nutraceutical_category === 'otc_drug' || input.nutraceutical_category === 'rx_to_otc_switch'
      ? { low: 200, high: 2000 }
      : input.nutraceutical_category === 'medical_food'
        ? { low: 50, high: 300 }
        : { low: 50, high: 500 };

  // Certifications
  const certs: string[] = ['cGMP (21 CFR Part 111)'];
  if (input.channels.includes('practitioner')) certs.push('NSF Certified for Sport', 'USP Verified');
  if (input.channels.includes('retail_specialty')) certs.push('Non-GMO Project Verified', 'Certified Organic (if applicable)');
  if (input.channels.includes('amazon')) certs.push('Third-party tested (CoA)', 'Amazon Climate Pledge Friendly');
  certs.push('ISO 17025 lab testing');

  // Claim substantiation gaps
  const claimGaps: string[] = [];
  if (!input.has_clinical_data)
    claimGaps.push('No proprietary clinical trial data — reliance on published literature');
  if (input.claim_type === 'qualified_health')
    claimGaps.push('Qualified health claim requires petition to FDA with totality of scientific evidence');
  if (input.claim_type === 'structure_function')
    claimGaps.push('Structure/function claims must be substantiated — FTC "competent and reliable scientific evidence" standard');
  if (clinicalEvidenceLevel === 'preliminary' || clinicalEvidenceLevel === 'emerging')
    claimGaps.push(`Clinical evidence rated "${clinicalEvidenceLevel}" — additional RCTs may be needed for claim defense`);

  // Key risks
  const regRisks: { risk: string; severity: 'high' | 'medium' | 'low'; mitigation: string }[] = [];
  if (ndiRequired) {
    regRisks.push({
      risk: 'NDI notification may be rejected by FDA',
      severity: ndiAcceptanceProbability !== undefined && ndiAcceptanceProbability < 60 ? 'high' : 'medium',
      mitigation: 'Prepare robust safety dossier with toxicology studies and history of use evidence.',
    });
  }
  if (ftcRisk === 'high' || ftcRisk === 'moderate') {
    regRisks.push({
      risk: 'FTC enforcement action for unsubstantiated claims',
      severity: ftcRisk === 'high' ? 'high' : 'medium',
      mitigation: 'Ensure all marketing claims are backed by at least one well-designed RCT or meta-analysis.',
    });
  }
  regRisks.push({
    risk: 'State-level regulatory actions (CA Prop 65, NY AG)',
    severity: 'medium',
    mitigation: 'Prop 65 testing for heavy metals and contaminants. Legal review of all claims for state compliance.',
  });
  if (ingredient?.regulatory_status?.toLowerCase().includes('disputed') ||
      ingredient?.regulatory_status?.toLowerCase().includes('challenged')) {
    regRisks.push({
      risk: `Ingredient regulatory status disputed: ${ingredient?.regulatory_status.substring(0, 80)}`,
      severity: 'high',
      mitigation: 'Monitor FDA guidance. Consider reformulation with NDI-accepted alternative.',
    });
  }

  const regulatoryAssessment: NutraceuticalRegulatoryAssessment = {
    recommended_pathway: primaryPathway.pathway,
    ndi_required: !!ndiRequired,
    ndi_acceptance_probability_pct: ndiAcceptanceProbability,
    ftc_claim_risk: ftcRisk,
    fda_warning_letter_risk: fdaRisk,
    cgmp_compliance_cost_k: cgmpCostK,
    certifications_recommended: certs,
    regulatory_timeline_months: primaryPathway.timeline_months,
    claim_substantiation_gaps: claimGaps,
    prop_65_risk: true, // Almost all supplements have some Prop 65 consideration
    key_risks: regRisks,
    narrative: `Recommended regulatory pathway: ${primaryPathway.pathway}. ${ndiRequired ? `NDI notification ${ndiAcceptanceProbability !== undefined && ndiAcceptanceProbability >= 60 ? 'likely required but has reasonable acceptance probability' : 'required with elevated rejection risk'}. ` : 'No NDI notification required. '}FTC advertising risk: ${ftcRisk}. Estimated regulatory timeline: ${primaryPathway.timeline_months.optimistic}-${primaryPathway.timeline_months.pessimistic} months. cGMP compliance: $${cgmpCostK.low}K-$${cgmpCostK.high}K investment. ${claimGaps.length > 0 ? `Key gaps: ${claimGaps[0]}.` : 'Claim substantiation appears adequate.'}`,
  };

  // ──────────────────────────────────────────────────────────
  // STEP 10: SENSITIVITY ANALYSIS
  // ──────────────────────────────────────────────────────────
  const baseSomM = usSomBase; // alias for clarity
  const sensitivityDrivers: NutraceuticalSensitivityDriver[] = [
    {
      variable: 'Consumer Adoption Rate',
      low_som_m: Math.round(baseSomM * 0.70 * 100) / 100,
      high_som_m: Math.round(baseSomM * 1.30 * 100) / 100,
      base_som_m: Math.round(baseSomM * 100) / 100,
      swing_pct: 30,
    },
    {
      variable: 'Unit Price',
      low_som_m: Math.round(baseSomM * 0.75 * 100) / 100,
      high_som_m: Math.round(baseSomM * 1.25 * 100) / 100,
      base_som_m: Math.round(baseSomM * 100) / 100,
      swing_pct: 25,
    },
    {
      variable: 'Customer Retention',
      low_som_m: Math.round(baseSomM * 0.75 * 100) / 100,
      high_som_m: Math.round(baseSomM * 1.25 * 100) / 100,
      base_som_m: Math.round(baseSomM * 100) / 100,
      swing_pct: 25,
    },
    {
      variable: 'Customer Acquisition Cost',
      // Higher CAC reduces net margin -> lower SOM value; lower CAC = higher
      low_som_m: Math.round(baseSomM * 1.15 * 100) / 100,  // lower CAC = better
      high_som_m: Math.round(baseSomM * 0.85 * 100) / 100, // higher CAC = worse
      base_som_m: Math.round(baseSomM * 100) / 100,
      swing_pct: 30,
    },
    {
      variable: 'Channel Mix Effectiveness',
      low_som_m: Math.round(baseSomM * 0.80 * 100) / 100,
      high_som_m: Math.round(baseSomM * 1.20 * 100) / 100,
      base_som_m: Math.round(baseSomM * 100) / 100,
      swing_pct: 20,
    },
  ];

  // ──────────────────────────────────────────────────────────
  // STEP 11: CLINICAL EVIDENCE IMPACT (grounded in evidence DB)
  // ──────────────────────────────────────────────────────────
  // Pull real published studies for this ingredient
  const ingredientStudies = findStudiesByIngredient(input.primary_ingredient);
  const dbEvidenceStrength = getEvidenceStrength(input.primary_ingredient);
  const landmarkStudiesForIngredient = ingredientStudies.filter((s) => s.quality_score >= 8);
  const rctCount = ingredientStudies.filter((s) => s.study_type === 'rct').length;
  const metaCount = ingredientStudies.filter((s) => s.study_type === 'meta_analysis').length;

  // Use DB-derived evidence strength when available, otherwise fall back to input
  const evidenceLevel = ingredientStudies.length > 0
    ? dbEvidenceStrength
    : (clinicalEvidenceLevel as 'strong' | 'moderate' | 'emerging' | 'preliminary' | 'none');

  const pricingPremiumMap: Record<string, number> = {
    strong: 40,
    moderate: 20,
    emerging: 10,
    preliminary: 5,
    none: 0,
  };
  const practitionerTrustMap: Record<string, number> = {
    strong: 90,
    moderate: 65,
    emerging: 40,
    preliminary: 20,
    none: 5,
  };

  // Channels unlocked by evidence level
  const channelsUnlocked: NutraceuticalChannel[] = ['dtc_ecommerce', 'amazon', 'retail_mass'];
  if (evidenceLevel === 'moderate' || evidenceLevel === 'strong') {
    channelsUnlocked.push('retail_specialty', 'subscription');
  }
  if (evidenceLevel === 'strong') {
    channelsUnlocked.push('practitioner');
  }

  // Claim upgrade potential
  const claimUpgradeMap: Record<string, ClaimType | null> = {
    strong: 'authorized_health',
    moderate: 'qualified_health',
    emerging: null,
    preliminary: null,
    none: null,
  };

  // Build evidence narrative grounded in real studies
  const studySummary = ingredientStudies.length > 0
    ? `Published evidence base: ${ingredientStudies.length} studies (${rctCount} RCTs, ${metaCount} meta-analyses). ${landmarkStudiesForIngredient.length > 0 ? `Landmark studies: ${landmarkStudiesForIngredient.slice(0, 2).map((s) => `${s.study_name} (${s.journal} ${s.year}, n=${s.sample_size}, ${s.result_summary.slice(0, 80)}...)`).join('; ')}.` : ''}`
    : 'No published studies found in our evidence database for this specific ingredient.';

  const hasEvidenceData = input.has_clinical_data || ingredientStudies.length > 0;

  const clinicalEvidenceImpact: NutraceuticalClinicalEvidenceImpact = {
    evidence_level: hasEvidenceData ? evidenceLevel : 'none',
    pricing_premium_pct: hasEvidenceData ? (pricingPremiumMap[evidenceLevel] ?? 0) : 0,
    channel_access_unlocked: channelsUnlocked,
    practitioner_trust_score: hasEvidenceData ? (practitionerTrustMap[evidenceLevel] ?? 20) : 5,
    claim_upgrade_potential: hasEvidenceData ? (claimUpgradeMap[evidenceLevel] ?? null) : null,
    narrative: hasEvidenceData
      ? `Clinical evidence level: "${evidenceLevel}" (DB-grounded). ${studySummary} This enables a ${pricingPremiumMap[evidenceLevel] ?? 0}% pricing premium over generic alternatives. Practitioner trust score: ${practitionerTrustMap[evidenceLevel] ?? 20}/100. ${evidenceLevel === 'strong' ? 'Unlocks the high-value practitioner dispensary channel (Fullscript, Wellevate) and supports authorized health claim petition.' : evidenceLevel === 'moderate' ? 'Supports qualified health claim and enables specialty retail shelf placement.' : 'Additional clinical studies (ideally double-blind RCTs) needed to unlock premium channels and claim upgrades.'}`
      : 'No proprietary clinical data and no published studies found in our evidence database. Recommend commissioning at least one clinical study to differentiate from commodity competition, support marketing claims, and unlock practitioner channel access. Even a small pilot (n=30-60) can provide meaningful marketing ammunition.',
  };

  // ──────────────────────────────────────────────────────────
  // STEP 12: BRAND ECONOMICS (industry benchmarked)
  // ──────────────────────────────────────────────────────────
  // Brand-building cost benchmarks sourced from DTC supplement
  // industry reports (Pattern, Tinuiti, Marketplace Pulse 2024).
  // All figures in $M first-year investment.
  //
  // Channel       | Low  | Base | High | Key cost drivers
  // DTC/ecommerce | 1.0  | 3.0  | 5.0  | Paid social ($40-80 CPA), content creation, Shopify/CRO
  // Amazon        | 0.5  | 1.2  | 2.0  | PPC ($1-2.5 CPC), review velocity programs, A+ content
  // Retail mass   | 2.5  | 6.0  | 10.0 | Slotting fees ($25-50K/SKU/chain), trade promo, broker fees
  // Retail spec.  | 1.0  | 2.5  | 4.0  | Demos, sampling, education, smaller slotting
  // Practitioner  | 0.8  | 2.0  | 3.5  | KOL engagement, clinical education, dispensary onboarding
  // Subscription  | 1.2  | 3.0  | 5.5  | Acquisition + retention tech, loyalty, lifecycle email
  // Wholesale B2B | 0.2  | 0.5  | 1.0  | Sales team, trade shows, co-manufacturing relationships
  const BRAND_BUILD_BENCHMARKS: Record<string, { low: number; base: number; high: number; cpa_note: string }> = {
    dtc_ecommerce:  { low: 1.0, base: 3.0, high: 5.0,  cpa_note: 'Meta/TikTok CPA $40-80, content creation $5-15K/mo' },
    amazon:         { low: 0.5, base: 1.2, high: 2.0,  cpa_note: 'PPC $1.00-2.50 CPC, 18-28% ACOS, review velocity critical' },
    retail_mass:    { low: 2.5, base: 6.0, high: 10.0, cpa_note: 'Slotting fees $25-50K/SKU/chain, trade promo 15-25% of revenue' },
    retail_specialty: { low: 1.0, base: 2.5, high: 4.0, cpa_note: 'In-store demos $500-1K/event, sampling $2-5/trial, education reps' },
    practitioner:   { low: 0.8, base: 2.0, high: 3.5,  cpa_note: 'KOL advisory board $50-100K, clinical education, Fullscript/Wellevate fees' },
    subscription:   { low: 1.2, base: 3.0, high: 5.5,  cpa_note: 'Recharge/Bold subscription tech, lifecycle email, loyalty program' },
    wholesale_b2b:  { low: 0.2, base: 0.5, high: 1.0,  cpa_note: 'Trade shows $20-50K/event, sales team $150-250K/head' },
  };

  let brandBuildLow = 0;
  let brandBuildBase = 0;
  let brandBuildHigh = 0;
  const channelCostNotes: string[] = [];

  for (const [channel, data] of Array.from(channelWeights)) {
    const { weight } = data;
    const benchmark = BRAND_BUILD_BENCHMARKS[channel];
    if (benchmark) {
      brandBuildLow += benchmark.low * weight;
      brandBuildBase += benchmark.base * weight;
      brandBuildHigh += benchmark.high * weight;
      if (weight > 0.15) channelCostNotes.push(`${channel.replace(/_/g, ' ')}: ${benchmark.cpa_note}`);
    }
  }

  // Influencer dependency: higher for DTC, lower for practitioner/retail
  const dtcWeight = (channelWeights.get('dtc_ecommerce')?.weight ?? 0) +
    (channelWeights.get('subscription')?.weight ?? 0);
  const influencerDependency = Math.round(Math.min(100, dtcWeight * 80 + 20));

  // Content moat: clinical data + DTC presence
  let contentMoat = 20;
  if (input.has_clinical_data) contentMoat += 30;
  if (dtcWeight > 0.3) contentMoat += 20;
  if (input.channels.includes('practitioner')) contentMoat += 15;
  contentMoat = Math.min(100, contentMoat);

  // Time to brand recognition — benchmarked against successful DTC supplement launches
  // Retail: 18-30 months (shelf space → trial → repeat). DTC: 12-18 months (paid → organic flywheel).
  // Amazon: 6-12 months (review velocity driven). Practitioner: 12-24 months (slow trust build).
  const brandRecMonths = input.channels.includes('retail_mass')
    ? 24
    : input.channels.includes('dtc_ecommerce') || input.channels.includes('subscription')
      ? 18
      : input.channels.includes('amazon')
        ? 12
        : 15;

  // Community strength
  const communityStrength: 'none' | 'emerging' | 'moderate' | 'strong' =
    dtcWeight > 0.5 && input.has_clinical_data
      ? 'strong'
      : dtcWeight > 0.3 || input.channels.includes('subscription')
        ? 'moderate'
        : dtcWeight > 0
          ? 'emerging'
          : 'none';

  const costBreakdown = channelCostNotes.length > 0
    ? ` Key cost drivers: ${channelCostNotes.join('; ')}.`
    : '';

  const brandEconomics: NutraceuticalBrandEconomics = {
    estimated_brand_build_cost_m: {
      low: Math.round(brandBuildLow * 100) / 100,
      base: Math.round(brandBuildBase * 100) / 100,
      high: Math.round(brandBuildHigh * 100) / 100,
    },
    time_to_brand_recognition_months: brandRecMonths,
    influencer_dependency_score: influencerDependency,
    content_moat_score: contentMoat,
    community_strength: communityStrength,
    narrative: `Estimated brand build investment: $${brandBuildBase.toFixed(1)}M (range: $${brandBuildLow.toFixed(1)}M-$${brandBuildHigh.toFixed(1)}M), benchmarked against DTC supplement industry data (Pattern/Tinuiti 2024).${costBreakdown} ${input.channels.includes('retail_mass') ? 'Mass retail channels require highest upfront investment — slotting fees alone can exceed $500K for a national Walmart/Target launch.' : ''} ${dtcWeight > 0.3 ? 'DTC-heavy strategy relies on content marketing, influencer partnerships, and paid social — Meta/TikTok CPA typically $40-80 for supplements.' : ''} Time to meaningful brand recognition: ~${brandRecMonths} months. Influencer dependency: ${influencerDependency}/100. ${input.has_clinical_data ? 'Clinical evidence creates a defensible content moat that competitors cannot easily replicate — expect 20-40% lower CPA vs. non-clinical brands.' : 'Without clinical data, brand differentiation relies primarily on marketing execution and influencer relationships.'}`,
  };

  // ──────────────────────────────────────────────────────────
  // STEP 13: AMAZON INTELLIGENCE (grounded in brand database)
  // ──────────────────────────────────────────────────────────
  let amazonIntelligence: NutraceuticalAmazonIntelligence | undefined;

  if (input.channels.includes('amazon')) {
    // Pull real Amazon data from competitive database
    const amazonBrands = categoryCompetitors.filter(
      (c) => c.amazon_bsr_estimate != null && c.amazon_review_count != null
    );
    const hasAmazonData = amazonBrands.length >= 2;

    // BSR range: real data preferred, fallback to heuristic
    const bsrTop = hasAmazonData
      ? Math.min(...amazonBrands.map((c) => c.amazon_bsr_estimate!))
      : Math.max(1, Math.round(5000 / (ingredientMarketSizeM / 100)));
    const bsrMedian = hasAmazonData
      ? Math.round(amazonBrands.reduce((sum, c) => sum + c.amazon_bsr_estimate!, 0) / amazonBrands.length)
      : bsrTop * 15;

    // Review counts: real data preferred
    const avgReviewsTop10 = hasAmazonData
      ? Math.round(amazonBrands.slice(0, 10).reduce((sum, c) => sum + (c.amazon_review_count ?? 0), 0) / Math.min(amazonBrands.length, 10))
      : ingredientMarketSizeM > 1000 ? 15000 : ingredientMarketSizeM > 500 ? 8000 : ingredientMarketSizeM > 200 ? 4000 : 1500;

    // Average rating: real data preferred
    const avgRatingTop10 = hasAmazonData
      ? Math.round(amazonBrands.slice(0, 10).reduce((sum, c) => sum + (c.amazon_rating ?? 4.3), 0) / Math.min(amazonBrands.length, 10) * 10) / 10
      : 4.3;

    // PPC economics (heuristic — no real PPC data in DB)
    const ppcCpc = ingredientMarketSizeM > 1000 ? 2.20
      : ingredientMarketSizeM > 500 ? 1.80
        : ingredientMarketSizeM > 200 ? 1.40
          : 0.95;

    const acos = ingredientMarketSizeM > 1000 ? 28
      : ingredientMarketSizeM > 500 ? 24
        : ingredientMarketSizeM > 200 ? 20
          : 18;

    const snsBrands = amazonBrands.filter((c) => c.subscription_available);
    const snsAdoption = hasAmazonData
      ? Math.round((snsBrands.length / amazonBrands.length) * 100)
      : (ingredient?.trending ? 32 : 27);

    // Top seller monthly revenue estimate
    const topSellerMonthlyK = Math.round(topBrandRevenue / 12 * 0.35 * 1000 / 1000); // 35% on Amazon

    // Barrier to entry score
    let barrierScore = 20;
    if (avgReviewsTop10 > 10000) barrierScore += 25;
    if (ppcCpc > 1.5) barrierScore += 15;
    if (ingredientMarketSizeM > 500) barrierScore += 15;
    if (totalBrands > 200) barrierScore += 15;
    barrierScore = Math.min(100, barrierScore);

    const topAmazonBrand = amazonBrands[0];
    const amazonNote = topAmazonBrand
      ? ` Category leader on Amazon: ${topAmazonBrand.brand_name} with ${topAmazonBrand.amazon_review_count?.toLocaleString()} reviews at ${topAmazonBrand.amazon_rating} stars (BSR ~#${topAmazonBrand.amazon_bsr_estimate}).`
      : '';

    amazonIntelligence = {
      estimated_category_bsr_range: { top: bsrTop, median: bsrMedian },
      avg_review_count_top_10: avgReviewsTop10,
      avg_rating_top_10: avgRatingTop10,
      ppc_cpc_estimate: ppcCpc,
      ppc_acos_estimate_pct: acos,
      subscribe_save_adoption_pct: snsAdoption,
      estimated_monthly_revenue_top_seller_k: topSellerMonthlyK,
      barrier_to_entry_score: barrierScore,
      narrative: `Amazon ${ingredient?.name ?? input.primary_ingredient} category${hasAmazonData ? ` (${amazonBrands.length} tracked brands)` : ''}: Top products average ${avgReviewsTop10.toLocaleString()} reviews at ${avgRatingTop10} stars.${amazonNote} PPC costs estimated at $${ppcCpc.toFixed(2)} CPC with ${acos}% ACOS. Subscribe & Save adoption: ${snsAdoption}%. BSR range for top performers: #${bsrTop}-${bsrMedian} in Health & Household. Barrier to entry: ${barrierScore}/100 (${barrierScore >= 60 ? 'high — requires significant review velocity and ad spend' : barrierScore >= 40 ? 'moderate — achievable with strong launch strategy' : 'low — opportunity for well-positioned entrant'}). Key success factors: rapid review accumulation (target 100+ in first 90 days), competitive PPC strategy, and Subscribe & Save enrollment optimization.`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // STEP 14: SUBSCRIPTION MODEL
  // ──────────────────────────────────────────────────────────
  let subscriptionModel: NutraceuticalSubscriptionModel | undefined;

  if (input.channels.includes('subscription')) {
    const optimalPrice = Math.round(annualRevenuePerCustomer / 12 * 0.9 * 100) / 100; // 10% subscription discount
    const retCurve = buildRetentionCurve(input.has_clinical_data, true);

    const churnCurve = retCurve.map((pct, idx) => ({
      month: idx + 1,
      retention_pct: pct,
    }));

    // Average lifetime: sum of retention / 100 gives expected months
    const avgLifetimeMonths = retCurve.reduce((sum, pct) => sum + pct / 100, 0);

    // MRR at month 12: assume we acquire capturableBase * subscription weight customers over 12 months
    // Monthly acquisition rate = total / 12
    const subWeight = channelWeights.get('subscription')?.weight ?? 0.2;
    const totalSubCustomers = Math.round(capturableBase * subWeight);
    const monthlyAcquisition = totalSubCustomers / 12;

    // At month 12: sum of customers acquired in each month * their retention at that point
    let activeAt12 = 0;
    for (let acqMonth = 0; acqMonth < 12; acqMonth++) {
      const monthsActive = 12 - acqMonth;
      const retention = monthsActive <= 12 ? retCurve[monthsActive - 1] / 100 : 0.35;
      activeAt12 += monthlyAcquisition * retention;
    }
    const mrr12 = Math.round(activeAt12 * optimalPrice);
    const arrM = Math.round(mrr12 * 12) / 1_000_000;

    subscriptionModel = {
      optimal_price_point: optimalPrice,
      churn_curve: churnCurve,
      avg_lifetime_months: Math.round(avgLifetimeMonths * 10) / 10,
      projected_mrr_12m: mrr12,
      projected_arr_m: Math.round(arrM * 100) / 100,
      narrative: `Optimal subscription price: $${optimalPrice.toFixed(2)}/mo (10% discount from one-time purchase equivalent). Average subscriber lifetime: ${avgLifetimeMonths.toFixed(1)} months. Month-6 retention: ${retCurve[5]}%, month-12: ${retCurve[11]}%. Projected MRR at month 12: $${mrr12.toLocaleString()} ($${(arrM).toFixed(2)}M ARR run rate). ${input.has_clinical_data ? 'Clinical evidence adds ~5pp to retention across the curve.' : 'Adding clinical evidence could improve retention by ~5 percentage points, materially impacting LTV.'} Key levers: reduce early churn (month 2-4) through onboarding optimization, and increase engagement through personalized health tracking integration.`,
    };
  }

  // ──────────────────────────────────────────────────────────
  // STEP 15: ACQUISITION ATTRACTIVENESS
  // ──────────────────────────────────────────────────────────

  // Revenue multiples from comparable acquisitions
  const comparableMultiples = NUTRA_COMPARABLE_ACQUISITIONS.map((a) => {
    const numMatch = a.multiple.match(/([\d.]+)/);
    return numMatch ? parseFloat(numMatch[1]) : 4;
  });
  const avgMultiple = comparableMultiples.reduce((s, v) => s + v, 0) / comparableMultiples.length;
  const minMultiple = Math.min(...comparableMultiples);
  const maxMultiple = Math.max(...comparableMultiples);

  // Strategic interest level
  const strategicInterest: 'high' | 'moderate' | 'low' =
    (input.has_clinical_data && ingredientCagr > 15) || (ingredientMarketSizeM > 500 && moatScore > 50)
      ? 'high'
      : ingredientCagr > 10 || moatScore > 35
        ? 'moderate'
        : 'low';

  // Key value drivers
  const valueDrivers: string[] = [];
  if (input.has_clinical_data) valueDrivers.push('Clinical evidence provides defensibility');
  if (input.patent_protected) valueDrivers.push('IP protection extends competitive advantage');
  if (ingredient?.trending) valueDrivers.push(`Category is trending with ${ingredientCagr}% CAGR`);
  if (input.channels.includes('subscription')) valueDrivers.push('Recurring revenue model (subscription)');
  if (input.channels.includes('dtc_ecommerce'))
    valueDrivers.push('DTC channel with first-party customer data');
  if (moatScore > 50) valueDrivers.push('Strong competitive moat');
  if (valueDrivers.length === 0) valueDrivers.push('Market growth potential', 'Channel diversification');

  // Likely acquirer types
  const acquirerTypes: string[] = [
    'Strategic CPG (Nestle Health Science, Unilever, Church & Dwight)',
  ];
  if (ingredientMarketSizeM > 300)
    acquirerTypes.push('Large pharma consumer health divisions (J&J, GSK, P&G)');
  if (input.channels.includes('subscription') || input.channels.includes('dtc_ecommerce'))
    acquirerTypes.push('PE-backed consumer health platforms (KKR, Butterfly Equity)');
  if (input.channels.includes('practitioner'))
    acquirerTypes.push('Practitioner-channel aggregators (Alticor/Amway, Metagenics parent)');
  acquirerTypes.push('Mid-market supplement companies seeking bolt-on acquisitions');

  // Filter comparable acquisitions to most relevant
  const relevantComps = NUTRA_COMPARABLE_ACQUISITIONS.slice(0, 8);

  const acquisitionAttractiveness: NutraceuticalAcquisitionAttractiveness = {
    strategic_acquirer_interest: strategicInterest,
    revenue_multiple_range: {
      low: Math.round(minMultiple * 10) / 10,
      base: Math.round(avgMultiple * 10) / 10,
      high: Math.round(maxMultiple * 10) / 10,
    },
    ebitda_multiple_range: {
      low: 10,
      base: 15,
      high: 20,
    },
    key_value_drivers: valueDrivers,
    likely_acquirer_types: acquirerTypes,
    comparable_acquisitions: relevantComps,
    narrative: `Strategic acquirer interest: ${strategicInterest}. Nutraceutical M&A revenue multiples range from ${minMultiple}x to ${maxMultiple}x (median ~${avgMultiple.toFixed(1)}x). EBITDA multiples of 10-20x are typical for profitable consumer health brands. ${strategicInterest === 'high' ? 'Strong acquirer interest driven by clinical differentiation, high-growth category, and defensible positioning.' : strategicInterest === 'moderate' ? 'Moderate acquirer interest — additional clinical evidence and brand scale would improve attractiveness.' : 'Limited near-term acquirer interest — focus on building scale, brand recognition, and clinical evidence before exploring exit.'} Most active acquirers in nutraceutical M&A: Nestle Health Science (9 acquisitions 2017-2023), Unilever (5 acquisitions), and PE firms (KKR, Butterfly, Charlesbank). Brands with $50M+ revenue, strong DTC, and clinical evidence command premium multiples (6-8x revenue).`,
  };

  // ──────────────────────────────────────────────────────────
  // INGREDIENT SUPPLY CHAIN (bonus — always populated)
  // ──────────────────────────────────────────────────────────
  const ipLower = ingredient?.ip_landscape?.toLowerCase() ?? '';
  const supplyConcentration: 'single_source' | 'limited' | 'diversified' =
    ipLower.includes('single') || ipLower.includes('exclusive') || ipLower.includes('sole')
      ? 'single_source'
      : ipLower.includes('open') || ipLower.includes('commodity') || ipLower.includes('widely')
        ? 'diversified'
        : 'limited';

  const supplyRisk: 'low' | 'moderate' | 'high' =
    supplyConcentration === 'single_source'
      ? 'high'
      : supplyConcentration === 'limited'
        ? 'moderate'
        : 'low';

  const cogsVolatility: 'stable' | 'moderate' | 'volatile' =
    ingredient?.category === 'Foundational'
      ? 'stable'
      : ingredient?.trending
        ? 'moderate'
        : 'stable';

  const ingredientSupplyChain: NutraceuticalIngredientSupplyChain = {
    primary_ingredient_source: ingredient
      ? `${ingredient.name} — ${ingredient.category}`
      : input.primary_ingredient,
    source_concentration: supplyConcentration,
    supply_risk: supplyRisk,
    cogs_volatility: cogsVolatility,
    ip_protection: ingredient?.ip_landscape ?? 'No data available. Conduct patent landscape search.',
    narrative: `Primary ingredient: ${ingredient?.name ?? input.primary_ingredient}. Supply concentration: ${supplyConcentration}. ${ingredient?.ip_landscape ?? 'IP landscape unknown.'} Supply risk: ${supplyRisk}. COGS volatility: ${cogsVolatility}. ${supplyConcentration === 'diversified' ? 'Multiple global suppliers available — favorable negotiating position.' : supplyConcentration === 'limited' ? 'Limited supplier base — recommend qualifying 2-3 alternative sources.' : 'Single-source dependency — critical to establish backup supply agreements.'}`,
  };

  // ──────────────────────────────────────────────────────────
  // MARKET GROWTH DRIVER
  // ──────────────────────────────────────────────────────────
  const growthDriver = ingredient?.trending
    ? `${ingredient.name} is a trending category with ${ingredientCagr}% 5-year CAGR, driven by ${ingredient.health_focus.split(',')[0]?.trim() ?? 'growing consumer interest'}.`
    : `${input.health_focus} market growing at ${ingredientCagr}% CAGR. Driven by aging demographics, preventive health consumer trends, and expanding clinical evidence.`;

  // ──────────────────────────────────────────────────────────
  // ASSEMBLE OUTPUT
  // ──────────────────────────────────────────────────────────
  const output: NutraceuticalMarketSizingOutput = {
    summary: {
      us_tam: toMetric(usTamB, tamConfidence),
      us_sam: toMetric(usSamB, samConfidence),
      us_som: {
        value: Math.round(usSomBase * 10) / 10,
        unit: 'M',
        range: [
          Math.round(usSomLow * 10) / 10,
          Math.round(usSomHigh * 10) / 10,
        ],
      },
      global_tam: toMetric(globalTamB, ingredient ? 'medium' : 'low'),
      cagr_5yr: ingredientCagr,
      market_growth_driver: growthDriver,
      peak_annual_revenue: {
        low: peakBear,
        base: peakBase,
        high: peakBull,
      },
    },

    consumer_funnel: consumerFunnel,
    channel_revenue: channelRevenues,
    dtc_unit_economics: dtcEconomics,
    geography_breakdown: geographyBreakdown,
    revenue_projection: revenueProjection,
    competitive_positioning: competitivePositioning,
    regulatory_assessment: regulatoryAssessment,
    sensitivity_analysis: sensitivityDrivers,
    clinical_evidence_impact: clinicalEvidenceImpact,
    brand_economics: brandEconomics,

    amazon_intelligence: amazonIntelligence,
    subscription_model: subscriptionModel,
    ingredient_supply_chain: ingredientSupplyChain,
    acquisition_attractiveness: acquisitionAttractiveness,

    methodology: buildMethodology(
      input,
      ingredient,
      ingredientUsedFallback,
      capturableBase,
      totalNetRevenue
    ),
    data_sources: buildDataSources(ingredient, categoryCompetitors.length, ingredientStudies.length),
    generated_at: new Date().toISOString(),
  };

  return output;
}
