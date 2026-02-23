// =============================================================================
// Nutraceutical Competitive Landscape Analysis Engine
// =============================================================================
// Takes an ingredient/category input and produces a full competitive landscape
// output: brand rankings, pricing tiers, Amazon intelligence, clinical evidence
// gaps, certification matrix, crowding score, and white space identification.
//
// This is the nutraceutical equivalent of competitive.ts for pharmaceuticals.
// =============================================================================

import type {
  NutraceuticalCompetitiveLandscapeInput,
  NutraceuticalCompetitiveLandscapeOutput,
  NutraBrandCompetitor,
  NutraPricingLandscapeEntry,
  NutraCertificationMatrix,
  NutraClinicalEvidenceGap,
  NutraAmazonIntelligenceAgg,
  CompetitiveComparisonAttribute,
  CompetitiveDataSource,
  NutraceuticalCategory,
  NutraceuticalChannel,
  NutraPriceTier,
  ClinicalEvidenceLevel,
} from '@/types/devices-diagnostics';

import {
  findCompetitorsByIngredient,
  findCompetitorsByCategory,
  getTopBrandsByRevenue,
  type NutraceuticalBrandEntry,
} from '@/lib/data/nutraceutical-competitive-database';

import {
  findStudiesByIngredient,
  getEvidenceStrength,
  findLandmarkStudies,
} from '@/lib/data/nutraceutical-clinical-evidence';

// =============================================================================
// Constants
// =============================================================================

const CURRENT_YEAR = new Date().getFullYear();

/** Maps health_focus keywords to ingredient_category slugs. */
const HEALTH_FOCUS_TO_CATEGORY: { pattern: RegExp; category: string }[] = [
  { pattern: /nad\+|aging|longevity|anti[\-\s]?aging|nmn|nicotinamide/i, category: 'longevity' },
  { pattern: /cogniti|brain|nootropi|focus|memory|mental clarity/i, category: 'cognitive' },
  { pattern: /gut|digestive|microbiome|probiotic|prebiotic|synbiotic/i, category: 'gut_microbiome' },
  { pattern: /blood sugar|metaboli|glucose|berberine|insulin/i, category: 'metabolic' },
  { pattern: /immune|vitamin c|zinc|elderberry|echinacea/i, category: 'immune' },
  { pattern: /sleep|melatonin|magnesium|gaba|relaxa/i, category: 'sleep' },
  { pattern: /sport|protein|creatine|pre[\-\s]?workout|recovery|bcaa/i, category: 'sports_performance' },
  { pattern: /collagen|skin|hair|nail|beauty|glow/i, category: 'collagen_beauty' },
  { pattern: /inflam|curcum|omega|turmeric|joint pain|anti[\-\s]?inflam/i, category: 'anti_inflammatory' },
  { pattern: /hormone|testosterone|fertility|estrogen|dhea|tongkat/i, category: 'hormone' },
  { pattern: /joint|glucosamine|chondroitin|bone|calcium|osteo/i, category: 'joint_bone' },
  { pattern: /general|daily|multivitamin|multi[\-\s]?vitamin|prenatal/i, category: 'multivitamin' },
];

/** Maps the database's string channels to the typed NutraceuticalChannel enum. */
const CHANNEL_MAP: Record<string, NutraceuticalChannel> = {
  dtc: 'dtc_ecommerce',
  dtc_ecommerce: 'dtc_ecommerce',
  amazon: 'amazon',
  retail_mass: 'retail_mass',
  retail_specialty: 'retail_specialty',
  practitioner: 'practitioner',
  subscription: 'subscription',
  wholesale_b2b: 'wholesale_b2b',
};

/** Consumer importance rankings for common certifications. */
const CERTIFICATION_IMPORTANCE: Record<string, 'high' | 'moderate' | 'low'> = {
  'Organic': 'high',
  'NSF Certified for Sport': 'high',
  'USP Verified': 'high',
  'Non-GMO Project': 'high',
  'Third-party tested': 'moderate',
  'GMP': 'moderate',
  'Vegan': 'moderate',
  'Gluten-free': 'moderate',
  'Kosher': 'low',
  'Halal': 'low',
  'B Corp': 'low',
  'Carbon Neutral': 'low',
};

/** Estimated cost (in $K) to obtain each certification. */
const CERTIFICATION_COST_K: Record<string, number> = {
  'Organic': 15,
  'NSF Certified for Sport': 25,
  'USP Verified': 50,
  'Non-GMO Project': 10,
  'Third-party tested': 5,
  'GMP': 20,
  'Vegan': 3,
  'Gluten-free': 5,
  'Kosher': 8,
  'Halal': 8,
  'B Corp': 12,
  'Carbon Neutral': 20,
};

/** Maps database price_positioning to NutraPriceTier. They are identical strings. */
const PRICE_TIER_MAP: Record<string, NutraPriceTier> = {
  mass: 'mass',
  premium: 'premium',
  clinical_grade: 'clinical_grade',
  luxury: 'luxury',
};

// =============================================================================
// Step 1: Ingredient / Category Matching
// =============================================================================

function resolveCategory(input: NutraceuticalCompetitiveLandscapeInput): string | null {
  if (input.ingredient_category) {
    return input.ingredient_category;
  }

  if (input.health_focus) {
    for (const mapping of HEALTH_FOCUS_TO_CATEGORY) {
      if (mapping.pattern.test(input.health_focus)) {
        return mapping.category;
      }
    }
  }

  return null;
}

function findMatchingBrands(input: NutraceuticalCompetitiveLandscapeInput): NutraceuticalBrandEntry[] {
  // First try ingredient-level match
  let brands = findCompetitorsByIngredient(input.primary_ingredient);

  if (brands.length > 0) {
    return brands;
  }

  // Fall back to category-level match
  const category = resolveCategory(input);
  if (category) {
    brands = findCompetitorsByCategory(category);
  }

  // If still empty, get top brands across all categories
  if (brands.length === 0) {
    brands = getTopBrandsByRevenue(undefined, 20);
  }

  return brands;
}

// =============================================================================
// Step 2: Brand Retrieval + Sort by Revenue
// =============================================================================

interface BrandSplit {
  top_brands: NutraceuticalBrandEntry[];
  emerging_brands: NutraceuticalBrandEntry[];
}

function splitBrandsByTier(brands: NutraceuticalBrandEntry[]): BrandSplit {
  // Sort by revenue descending
  const sorted = [...brands].sort(
    (a, b) => b.estimated_annual_revenue_m - a.estimated_annual_revenue_m
  );

  const top_brands = sorted.slice(0, 10);

  // Emerging: either outside top 10 or launched within last 3 years
  const emergingThreshold = CURRENT_YEAR - 3;
  const emerging_brands = sorted.filter(
    (brand) =>
      !top_brands.includes(brand) || brand.year_launched >= emergingThreshold
  );

  // De-duplicate: if a brand is in top_brands AND qualifies as emerging, keep in top only
  const topBrandNames = new Set(top_brands.map((b) => b.brand_name));
  const dedupedEmerging = emerging_brands.filter((b) => !topBrandNames.has(b.brand_name));

  // Re-add recently launched top brands to emerging list as well (they appear in both)
  const recentTopBrands = top_brands.filter((b) => b.year_launched >= emergingThreshold);
  const finalEmerging = [...dedupedEmerging, ...recentTopBrands].sort(
    (a, b) => b.year_launched - a.year_launched || b.estimated_annual_revenue_m - a.estimated_annual_revenue_m
  );

  return { top_brands: sorted.slice(0, 10), emerging_brands: finalEmerging };
}

// =============================================================================
// Step 3: Convert NutraceuticalBrandEntry to NutraBrandCompetitor
// =============================================================================

function mapChannel(raw: string): NutraceuticalChannel {
  return CHANNEL_MAP[raw.toLowerCase().trim()] || 'dtc_ecommerce';
}

function mapCategory(raw: string): NutraceuticalCategory {
  // The database uses slugs like 'longevity', 'cognitive' etc.
  // Map to the NutraceuticalCategory type — most map to 'dietary_supplement'
  // since NutraceuticalCategory is about regulatory classification, not health area.
  const specialMappings: Record<string, NutraceuticalCategory> = {
    sports_performance: 'sports_nutrition',
    probiotic: 'probiotic_microbiome',
    gut_microbiome: 'probiotic_microbiome',
  };
  return specialMappings[raw] || 'dietary_supplement';
}

function computeDifferentiationScore(entry: NutraceuticalBrandEntry): number {
  let score = 3; // Baseline

  // Clinical studies boost: each study adds up to 1.5 points
  score += Math.min(entry.clinical_studies_count * 1.5, 3);

  // Certifications: each adds 0.4 points, up to +2
  score += Math.min(entry.certifications.length * 0.4, 2);

  // Key differentiator uniqueness: longer / more specific = higher score
  if (entry.key_differentiator.length > 100) {
    score += 1;
  } else if (entry.key_differentiator.length > 50) {
    score += 0.5;
  }

  // Channel diversity: more channels = higher score
  if (entry.channels.length >= 4) {
    score += 1;
  } else if (entry.channels.length >= 2) {
    score += 0.5;
  }

  return Math.min(Math.round(score * 10) / 10, 10);
}

function computeEvidenceStrength(entry: NutraceuticalBrandEntry): number {
  // Base score from clinical studies
  let score = Math.min(entry.clinical_studies_count * 2, 6);

  // Certification weight: science-oriented certifications count more
  const scienceCerts = ['NSF Certified for Sport', 'USP Verified', 'Third-party tested'];
  const scienceCertCount = entry.certifications.filter((c) =>
    scienceCerts.includes(c)
  ).length;
  score += scienceCertCount * 0.8;

  // Minimum floor
  if (entry.clinical_studies_count === 0 && scienceCertCount === 0) {
    score = 1;
  }

  return Math.min(Math.round(score * 10) / 10, 10);
}

function computeStrengths(entry: NutraceuticalBrandEntry): string[] {
  const strengths: string[] = [];

  if (entry.estimated_annual_revenue_m >= 100) {
    strengths.push(`Strong brand with $${entry.estimated_annual_revenue_m}M+ in annual revenue`);
  } else if (entry.estimated_annual_revenue_m >= 50) {
    strengths.push(`Established player with ~$${entry.estimated_annual_revenue_m}M annual revenue`);
  }

  if (entry.clinical_studies_count >= 3) {
    strengths.push(`Robust clinical evidence base (${entry.clinical_studies_count} published studies)`);
  } else if (entry.clinical_studies_count >= 1) {
    strengths.push(`Clinical evidence backing (${entry.clinical_studies_count} study${entry.clinical_studies_count > 1 ? 'ies' : 'y'})`);
  }

  if (entry.amazon_rating && entry.amazon_rating >= 4.4) {
    strengths.push(`High consumer satisfaction (${entry.amazon_rating} Amazon rating)`);
  }

  if (entry.amazon_review_count && entry.amazon_review_count >= 20000) {
    strengths.push(`Deep Amazon review moat (${(entry.amazon_review_count / 1000).toFixed(0)}K+ reviews)`);
  }

  if (entry.certifications.includes('NSF Certified for Sport')) {
    strengths.push('NSF Certified for Sport — trusted by athletes and practitioners');
  }

  if (entry.certifications.includes('Organic')) {
    strengths.push('Organic certification appeals to clean-label consumers');
  }

  if (entry.subscription_available) {
    strengths.push('Subscription model drives recurring revenue and high LTV');
  }

  if (entry.channels.length >= 4) {
    strengths.push('Broad multi-channel distribution (DTC, Amazon, retail)');
  }

  if (entry.key_differentiator && entry.key_differentiator.length > 50) {
    strengths.push(entry.key_differentiator.split(';')[0].trim());
  }

  return strengths.slice(0, 4);
}

function computeWeaknesses(entry: NutraceuticalBrandEntry): string[] {
  const weaknesses: string[] = [];

  if (entry.clinical_studies_count === 0) {
    weaknesses.push('No published clinical studies on the specific formulation');
  }

  if (!entry.amazon_bsr_estimate && !entry.amazon_review_count) {
    weaknesses.push('Limited Amazon presence — reliant on DTC or retail channels');
  }

  if (entry.amazon_rating && entry.amazon_rating < 4.2) {
    weaknesses.push(`Below-average Amazon rating (${entry.amazon_rating}) may deter trial`);
  }

  if (entry.channels.length <= 1) {
    weaknesses.push('Single-channel dependency creates distribution risk');
  }

  if (entry.price_positioning === 'luxury' || entry.price_positioning === 'clinical_grade') {
    const avgPrice = (entry.monthly_price_range.low + entry.monthly_price_range.high) / 2;
    if (avgPrice > 60) {
      weaknesses.push(`High price point ($${avgPrice}/mo) limits mass-market adoption`);
    }
  }

  if (entry.price_positioning === 'mass' && entry.certifications.length <= 2) {
    weaknesses.push('Minimal certifications may undermine trust with quality-conscious consumers');
  }

  if (!entry.subscription_available) {
    weaknesses.push('No subscription offering — missing recurring revenue and retention mechanics');
  }

  if (entry.year_launched >= CURRENT_YEAR - 2) {
    weaknesses.push('Recently launched — limited brand awareness and review history');
  }

  return weaknesses.slice(0, 4);
}

function convertToBrandCompetitor(entry: NutraceuticalBrandEntry): NutraBrandCompetitor {
  const avgPrice = (entry.monthly_price_range.low + entry.monthly_price_range.high) / 2;

  return {
    brand: entry.brand_name,
    company: entry.company,
    primary_ingredient: entry.primary_ingredients[0] || entry.ingredient_category,
    category: mapCategory(entry.ingredient_category),
    estimated_revenue_m: entry.estimated_annual_revenue_m,
    price_per_unit: Math.round(avgPrice * 100) / 100,
    price_tier: PRICE_TIER_MAP[entry.price_positioning] || 'premium',
    channels: entry.channels.map(mapChannel),
    certifications: [...entry.certifications],
    clinical_studies_count: entry.clinical_studies_count,
    amazon_bsr: entry.amazon_bsr_estimate,
    amazon_reviews: entry.amazon_review_count,
    amazon_rating: entry.amazon_rating,
    differentiation_score: computeDifferentiationScore(entry),
    evidence_strength: computeEvidenceStrength(entry),
    strengths: computeStrengths(entry),
    weaknesses: computeWeaknesses(entry),
  };
}

// =============================================================================
// Step 4: Pricing Landscape
// =============================================================================

function buildPricingLandscape(
  brands: NutraceuticalBrandEntry[]
): NutraPricingLandscapeEntry[] {
  const tiers: NutraPriceTier[] = ['mass', 'premium', 'clinical_grade', 'luxury'];
  const landscape: NutraPricingLandscapeEntry[] = [];

  for (const tier of tiers) {
    const tierBrands = brands.filter((b) => b.price_positioning === tier);
    if (tierBrands.length === 0) {
      // Include empty tier for completeness
      landscape.push({
        tier,
        brand_count: 0,
        price_range: { low: 0, high: 0 },
        avg_revenue_m: 0,
        representative_brands: [],
      });
      continue;
    }

    const allLows = tierBrands.map((b) => b.monthly_price_range.low);
    const allHighs = tierBrands.map((b) => b.monthly_price_range.high);
    const totalRevenue = tierBrands.reduce((sum, b) => sum + b.estimated_annual_revenue_m, 0);

    landscape.push({
      tier,
      brand_count: tierBrands.length,
      price_range: {
        low: Math.min(...allLows),
        high: Math.max(...allHighs),
      },
      avg_revenue_m: Math.round((totalRevenue / tierBrands.length) * 10) / 10,
      representative_brands: tierBrands
        .sort((a, b) => b.estimated_annual_revenue_m - a.estimated_annual_revenue_m)
        .slice(0, 4)
        .map((b) => b.brand_name),
    });
  }

  return landscape;
}

// =============================================================================
// Step 5: Amazon Intelligence Aggregation
// =============================================================================

function buildAmazonIntelligence(brands: NutraceuticalBrandEntry[]): NutraAmazonIntelligenceAgg {
  const amazonBrands = brands.filter(
    (b) => b.amazon_bsr_estimate != null && b.amazon_review_count != null
  );

  if (amazonBrands.length === 0) {
    return {
      avg_bsr_top_10: 0,
      avg_reviews_top_10: 0,
      avg_rating_top_10: 0,
      review_velocity_monthly: 0,
      ppc_competitiveness: 'low',
      subscribe_save_pct: 0,
      narrative:
        'Limited Amazon presence in this category — most brands sell DTC or through specialty retail.',
    };
  }

  // Sort by BSR ascending (lower = better seller) for top 10
  const sortedByBSR = [...amazonBrands].sort(
    (a, b) => (a.amazon_bsr_estimate || Infinity) - (b.amazon_bsr_estimate || Infinity)
  );
  const top10 = sortedByBSR.slice(0, 10);

  const avgBSR =
    top10.reduce((sum, b) => sum + (b.amazon_bsr_estimate || 0), 0) / top10.length;
  const avgReviews =
    top10.reduce((sum, b) => sum + (b.amazon_review_count || 0), 0) / top10.length;
  const avgRating =
    top10.reduce((sum, b) => sum + (b.amazon_rating || 0), 0) / top10.length;

  // Estimate review velocity: total reviews / estimated years on Amazon / 12
  const totalReviews = amazonBrands.reduce((sum, b) => sum + (b.amazon_review_count || 0), 0);
  const avgAge = amazonBrands.reduce((sum, b) => sum + (CURRENT_YEAR - b.year_launched), 0) / amazonBrands.length;
  const reviewVelocity = avgAge > 0 ? Math.round(totalReviews / amazonBrands.length / avgAge / 12) : 0;

  // PPC competitiveness heuristic: driven by number of Amazon brands and average reviews
  let ppcCompetitiveness: 'low' | 'moderate' | 'high' = 'low';
  if (amazonBrands.length >= 6 && avgReviews >= 15000) {
    ppcCompetitiveness = 'high';
  } else if (amazonBrands.length >= 3 && avgReviews >= 5000) {
    ppcCompetitiveness = 'moderate';
  }

  // Subscribe & Save percentage
  const subBrands = brands.filter((b) => b.subscription_available);
  const subscribeSavePct =
    brands.length > 0 ? Math.round((subBrands.length / brands.length) * 100) : 0;

  // Build narrative
  const narrativeParts: string[] = [];
  if (avgBSR < 2000) {
    narrativeParts.push(`Top sellers rank within BSR ${Math.round(avgBSR)}, indicating strong Amazon demand.`);
  } else {
    narrativeParts.push(`Average BSR of ${Math.round(avgBSR)} suggests a mid-tier Amazon category.`);
  }

  if (avgReviews > 20000) {
    narrativeParts.push(
      `Heavy review accumulation (~${(avgReviews / 1000).toFixed(0)}K avg) creates a significant barrier to entry for new brands.`
    );
  } else if (avgReviews > 5000) {
    narrativeParts.push(
      `Moderate review depth (~${(avgReviews / 1000).toFixed(0)}K avg) — new entrants can compete with targeted launch strategy.`
    );
  } else {
    narrativeParts.push(
      `Review counts are modest — Amazon channel has room for well-positioned new entrants.`
    );
  }

  if (ppcCompetitiveness === 'high') {
    narrativeParts.push('PPC costs are elevated; consider off-Amazon demand generation to maintain margins.');
  }

  return {
    avg_bsr_top_10: Math.round(avgBSR),
    avg_reviews_top_10: Math.round(avgReviews),
    avg_rating_top_10: Math.round(avgRating * 100) / 100,
    review_velocity_monthly: reviewVelocity,
    ppc_competitiveness: ppcCompetitiveness,
    subscribe_save_pct: subscribeSavePct,
    narrative: narrativeParts.join(' '),
  };
}

// =============================================================================
// Step 6: Channel Distribution Analysis
// =============================================================================

function buildChannelDistribution(
  brands: NutraceuticalBrandEntry[]
): { channel: NutraceuticalChannel; brand_count: number; share_pct: number }[] {
  const channelCounts = new Map<NutraceuticalChannel, number>();

  for (const brand of brands) {
    for (const rawChannel of brand.channels) {
      const ch = mapChannel(rawChannel);
      channelCounts.set(ch, (channelCounts.get(ch) || 0) + 1);
    }
  }

  const totalMentions = Array.from(channelCounts.values()).reduce((a, b) => a + b, 0);

  return Array.from(channelCounts.entries())
    .map(([channel, brand_count]) => ({
      channel,
      brand_count,
      share_pct: totalMentions > 0 ? Math.round((brand_count / totalMentions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.brand_count - a.brand_count);
}

// =============================================================================
// Step 7: Clinical Evidence Gap Analysis
// =============================================================================

function buildClinicalEvidenceGaps(
  brands: NutraceuticalBrandEntry[],
  primaryIngredient: string
): NutraClinicalEvidenceGap[] {
  const gaps: NutraClinicalEvidenceGap[] = [];

  // Gather all unique ingredient references from the matched brands
  const ingredientSeen = new Set<string>();
  for (const brand of brands) {
    for (const ing of brand.primary_ingredients) {
      ingredientSeen.add(ing);
    }
  }

  // Also include the user's primary ingredient
  ingredientSeen.add(primaryIngredient);

  for (const ingredient of Array.from(ingredientSeen)) {
    const studies = findStudiesByIngredient(ingredient);
    const evidenceStrength = getEvidenceStrength(ingredient);

    // Map evidence strength to ClinicalEvidenceLevel
    let strongestEvidence: ClinicalEvidenceLevel | 'none' = 'none';
    if (studies.length > 0) {
      const hasRCT = studies.some((s) => s.study_type === 'rct');
      const hasMeta = studies.some((s) => s.study_type === 'meta_analysis');
      const hasRegistry = studies.some((s) => s.study_type === 'cohort');

      if (hasMeta) {
        strongestEvidence = 'RCT'; // meta-analyses imply at least RCT-level evidence
      } else if (hasRCT) {
        strongestEvidence = 'RCT';
      } else if (hasRegistry) {
        strongestEvidence = 'registry';
      } else {
        strongestEvidence = 'case_series';
      }
    }

    // Brands that actually have clinical studies for this ingredient
    const brandsWithEvidence = brands.filter(
      (b) =>
        b.clinical_studies_count > 0 &&
        b.primary_ingredients.some(
          (pi) => pi.toLowerCase().includes(ingredient.toLowerCase().split('(')[0].trim())
        )
    );

    // Identify opportunity based on evidence gaps
    let opportunity = '';
    if (studies.length === 0) {
      opportunity = `No published clinical studies found for ${ingredient}. A well-designed RCT would create significant competitive differentiation.`;
    } else if (evidenceStrength === 'preliminary' || evidenceStrength === 'emerging') {
      opportunity = `Only ${studies.length} study${studies.length > 1 ? 'ies' : 'y'} found with ${evidenceStrength} evidence. Investing in a larger RCT could establish category leadership.`;
    } else if (evidenceStrength === 'moderate') {
      opportunity = `Moderate evidence base (${studies.length} studies). A definitive meta-analysis or large RCT could differentiate your product from ${brandsWithEvidence.length} competing brands.`;
    } else {
      opportunity = `Strong evidence base exists. Differentiation must come from formulation innovation, delivery mechanism, or combination studies.`;
    }

    gaps.push({
      evidence_area: ingredient,
      current_studies: studies.length,
      strongest_evidence: strongestEvidence,
      opportunity,
      brands_with_evidence: brandsWithEvidence.map((b) => b.brand_name),
    });
  }

  // Sort: ingredients with fewest studies first (biggest gaps)
  return gaps.sort((a, b) => a.current_studies - b.current_studies);
}

// =============================================================================
// Step 8: Certification Matrix
// =============================================================================

function buildCertificationMatrix(
  brands: NutraceuticalBrandEntry[]
): NutraCertificationMatrix[] {
  // Collect all unique certifications across brands
  const allCerts = new Set<string>();
  for (const brand of brands) {
    for (const cert of brand.certifications) {
      allCerts.add(cert);
    }
  }

  const matrix: NutraCertificationMatrix[] = [];

  for (const cert of Array.from(allCerts)) {
    const brandsWith = brands
      .filter((b) => b.certifications.includes(cert))
      .map((b) => b.brand_name);
    const brandsWithout = brands
      .filter((b) => !b.certifications.includes(cert))
      .map((b) => b.brand_name);

    matrix.push({
      certification: cert,
      brands_with: brandsWith,
      brands_without: brandsWithout,
      consumer_importance: CERTIFICATION_IMPORTANCE[cert] || 'moderate',
      cost_to_obtain_k: CERTIFICATION_COST_K[cert] || 10,
    });
  }

  // Sort by consumer importance (high first), then by adoption rate descending
  const importanceOrder: Record<string, number> = { high: 0, moderate: 1, low: 2 };
  return matrix.sort((a, b) => {
    const impDiff = importanceOrder[a.consumer_importance] - importanceOrder[b.consumer_importance];
    if (impDiff !== 0) return impDiff;
    return b.brands_with.length - a.brands_with.length;
  });
}

// =============================================================================
// Step 9: Crowding Score (1-10)
// =============================================================================

function computeCrowdingScore(
  brands: NutraceuticalBrandEntry[],
  amazonIntel: NutraAmazonIntelligenceAgg
): { score: number; label: 'Low' | 'Moderate' | 'High' | 'Extremely High' } {
  if (brands.length === 0) {
    return { score: 1, label: 'Low' };
  }

  let score = 0;

  // Factor 1: Brand count (0-3 points)
  if (brands.length >= 15) {
    score += 3;
  } else if (brands.length >= 8) {
    score += 2;
  } else if (brands.length >= 4) {
    score += 1;
  }

  // Factor 2: Revenue concentration — Herfindahl-Hirschman Index (0-2.5 points)
  // HHI < 1500 = competitive, 1500-2500 = moderate, >2500 = concentrated
  const totalRevenue = brands.reduce((sum, b) => sum + b.estimated_annual_revenue_m, 0);
  if (totalRevenue > 0) {
    const hhi = brands.reduce((sum, b) => {
      const share = (b.estimated_annual_revenue_m / totalRevenue) * 100;
      return sum + share * share;
    }, 0);

    if (hhi < 1500) {
      // Fragmented market = more crowded (many small players)
      score += 2.5;
    } else if (hhi < 2500) {
      score += 1.5;
    } else {
      // Highly concentrated = less crowded (dominated by few)
      score += 0.5;
    }
  }

  // Factor 3: Amazon saturation (0-2.5 points)
  if (amazonIntel.avg_reviews_top_10 > 20000) {
    score += 2.5;
  } else if (amazonIntel.avg_reviews_top_10 > 10000) {
    score += 1.5;
  } else if (amazonIntel.avg_reviews_top_10 > 3000) {
    score += 1;
  } else {
    score += 0.5;
  }

  // Factor 4: Clinical evidence density (0-2 points)
  const brandsWithStudies = brands.filter((b) => b.clinical_studies_count > 0).length;
  const evidenceDensity = brandsWithStudies / brands.length;
  if (evidenceDensity > 0.5) {
    score += 2;
  } else if (evidenceDensity > 0.25) {
    score += 1;
  } else {
    score += 0.5;
  }

  const finalScore = Math.min(Math.round(score * 10) / 10, 10);

  let label: 'Low' | 'Moderate' | 'High' | 'Extremely High' = 'Low';
  if (finalScore >= 8) {
    label = 'Extremely High';
  } else if (finalScore >= 6) {
    label = 'High';
  } else if (finalScore >= 4) {
    label = 'Moderate';
  }

  return { score: finalScore, label };
}

// =============================================================================
// Step 10: White Space Identification
// =============================================================================

function identifyWhiteSpace(
  brands: NutraceuticalBrandEntry[],
  pricingLandscape: NutraPricingLandscapeEntry[],
  channelDist: { channel: NutraceuticalChannel; brand_count: number; share_pct: number }[],
  certMatrix: NutraCertificationMatrix[]
): string[] {
  const whiteSpaces: string[] = [];

  // Underserved channels
  const allChannels: NutraceuticalChannel[] = [
    'dtc_ecommerce',
    'amazon',
    'retail_mass',
    'retail_specialty',
    'practitioner',
    'subscription',
    'wholesale_b2b',
  ];
  const representedChannels = new Set(channelDist.map((c) => c.channel));
  for (const ch of allChannels) {
    if (!representedChannels.has(ch)) {
      whiteSpaces.push(`No brands currently selling through ${ch.replace(/_/g, ' ')} channel`);
    }
  }

  // Channels with very low penetration
  for (const cd of channelDist) {
    if (cd.brand_count <= 1 && representedChannels.has(cd.channel)) {
      whiteSpaces.push(
        `Only ${cd.brand_count} brand${cd.brand_count > 1 ? 's' : ''} in ${cd.channel.replace(/_/g, ' ')} — low competition in this channel`
      );
    }
  }

  // Price tiers with few brands
  for (const tier of pricingLandscape) {
    if (tier.brand_count === 0) {
      whiteSpaces.push(
        `No brands in the ${tier.tier.replace(/_/g, ' ')} price tier — potential positioning opportunity`
      );
    } else if (tier.brand_count <= 2 && tier.tier !== 'luxury') {
      whiteSpaces.push(
        `Only ${tier.brand_count} brand${tier.brand_count > 1 ? 's' : ''} in the ${tier.tier.replace(/_/g, ' ')} tier — room for a differentiated offering`
      );
    }
  }

  // Certification gaps: high-importance certifications with low adoption
  for (const cert of certMatrix) {
    if (
      cert.consumer_importance === 'high' &&
      cert.brands_without.length > cert.brands_with.length
    ) {
      whiteSpaces.push(
        `${cert.certification} certification held by only ${cert.brands_with.length}/${cert.brands_with.length + cert.brands_without.length} brands — securing it creates competitive differentiation`
      );
    }
  }

  // Ingredient combo gaps: look for brands that only use single ingredients
  const singleIngredientBrands = brands.filter((b) => b.primary_ingredients.length === 1);
  if (singleIngredientBrands.length > brands.length * 0.6) {
    whiteSpaces.push(
      'Majority of brands use single-ingredient formulations — combination products could capture synergy-seeking consumers'
    );
  }

  // No subscription in category
  const subBrands = brands.filter((b) => b.subscription_available);
  if (subBrands.length < brands.length * 0.3) {
    whiteSpaces.push(
      'Low subscription adoption in category — subscription-first model could differentiate'
    );
  }

  // No clinical studies in category
  const evidenceBrands = brands.filter((b) => b.clinical_studies_count > 0);
  if (evidenceBrands.length < brands.length * 0.2) {
    whiteSpaces.push(
      'Very few brands invest in clinical evidence — a single RCT could create outsized differentiation'
    );
  }

  return whiteSpaces.slice(0, 8);
}

// =============================================================================
// Step 11: Comparison Matrix
// =============================================================================

function buildComparisonMatrix(
  topBrands: NutraBrandCompetitor[]
): CompetitiveComparisonAttribute[] {
  if (topBrands.length === 0) return [];

  const attributes: CompetitiveComparisonAttribute[] = [];

  // Price attribute
  const priceRow: CompetitiveComparisonAttribute = {
    attribute: 'Monthly Price ($)',
    competitors: {},
  };
  for (const brand of topBrands) {
    priceRow.competitors[brand.brand] = `$${brand.price_per_unit}`;
  }
  attributes.push(priceRow);

  // Price tier
  const tierRow: CompetitiveComparisonAttribute = {
    attribute: 'Price Tier',
    competitors: {},
  };
  for (const brand of topBrands) {
    tierRow.competitors[brand.brand] = brand.price_tier.replace(/_/g, ' ');
  }
  attributes.push(tierRow);

  // Clinical evidence
  const evidenceRow: CompetitiveComparisonAttribute = {
    attribute: 'Clinical Studies',
    competitors: {},
  };
  for (const brand of topBrands) {
    evidenceRow.competitors[brand.brand] = brand.clinical_studies_count;
  }
  attributes.push(evidenceRow);

  // Amazon rating
  const ratingRow: CompetitiveComparisonAttribute = {
    attribute: 'Amazon Rating',
    competitors: {},
  };
  for (const brand of topBrands) {
    ratingRow.competitors[brand.brand] = brand.amazon_rating
      ? `${brand.amazon_rating}/5.0`
      : 'N/A';
  }
  attributes.push(ratingRow);

  // Amazon reviews
  const reviewRow: CompetitiveComparisonAttribute = {
    attribute: 'Amazon Reviews',
    competitors: {},
  };
  for (const brand of topBrands) {
    reviewRow.competitors[brand.brand] = brand.amazon_reviews
      ? `${(brand.amazon_reviews / 1000).toFixed(1)}K`
      : 'N/A';
  }
  attributes.push(reviewRow);

  // Certifications count
  const certRow: CompetitiveComparisonAttribute = {
    attribute: 'Certifications',
    competitors: {},
  };
  for (const brand of topBrands) {
    certRow.competitors[brand.brand] = brand.certifications.length;
  }
  attributes.push(certRow);

  // Revenue ($M)
  const revenueRow: CompetitiveComparisonAttribute = {
    attribute: 'Revenue ($M)',
    competitors: {},
  };
  for (const brand of topBrands) {
    revenueRow.competitors[brand.brand] = `$${brand.estimated_revenue_m}M`;
  }
  attributes.push(revenueRow);

  // Channels
  const channelRow: CompetitiveComparisonAttribute = {
    attribute: 'Channels',
    competitors: {},
  };
  for (const brand of topBrands) {
    channelRow.competitors[brand.brand] = brand.channels
      .map((c) => c.replace(/_/g, ' '))
      .join(', ');
  }
  attributes.push(channelRow);

  // Differentiation score
  const diffRow: CompetitiveComparisonAttribute = {
    attribute: 'Differentiation Score',
    competitors: {},
  };
  for (const brand of topBrands) {
    diffRow.competitors[brand.brand] = `${brand.differentiation_score}/10`;
  }
  attributes.push(diffRow);

  // Evidence strength
  const evidStrRow: CompetitiveComparisonAttribute = {
    attribute: 'Evidence Strength',
    competitors: {},
  };
  for (const brand of topBrands) {
    evidStrRow.competitors[brand.brand] = `${brand.evidence_strength}/10`;
  }
  attributes.push(evidStrRow);

  return attributes;
}

// =============================================================================
// Step 13: Output Assembly
// =============================================================================

function buildDataSources(brands: NutraceuticalBrandEntry[]): CompetitiveDataSource[] {
  const sources: CompetitiveDataSource[] = [
    {
      name: 'Terrain Nutraceutical Brand Intelligence',
      type: 'proprietary',
      last_updated: `${CURRENT_YEAR}-01-01`,
    },
    {
      name: 'NBJ Supplement Business Report',
      type: 'licensed',
      url: 'https://nutritionbusinessjournal.com',
      last_updated: `${CURRENT_YEAR - 1}-12-01`,
    },
    {
      name: 'SPINS Natural & Specialty Retail Scanner Data',
      type: 'licensed',
      url: 'https://spins.com',
      last_updated: `${CURRENT_YEAR - 1}-12-01`,
    },
  ];

  // Add Amazon source if any brands have Amazon data
  const hasAmazon = brands.some((b) => b.amazon_bsr_estimate != null);
  if (hasAmazon) {
    sources.push({
      name: 'Amazon BSR & Review Intelligence (Jungle Scout / Helium 10)',
      type: 'licensed',
      url: 'https://www.junglescout.com',
      last_updated: `${CURRENT_YEAR}-01-01`,
    });
  }

  // Collect unique brand-level sources
  const brandSources = new Set<string>();
  for (const brand of brands) {
    if (brand.source) {
      brandSources.add(brand.source.split(';')[0].trim());
    }
  }
  // Add first 3 unique brand sources
  let brandSourceCount = 0;
  for (const src of Array.from(brandSources)) {
    if (brandSourceCount >= 3) break;
    sources.push({
      name: src,
      type: 'public',
    });
    brandSourceCount++;
  }

  return sources;
}

function buildSummary(
  brands: NutraceuticalBrandEntry[],
  crowding: { score: number; label: 'Low' | 'Moderate' | 'High' | 'Extremely High' },
  pricingLandscape: NutraPricingLandscapeEntry[],
  whiteSpaces: string[],
  primaryIngredient: string
): NutraceuticalCompetitiveLandscapeOutput['summary'] {
  const totalRevenue = brands.reduce((sum, b) => sum + b.estimated_annual_revenue_m, 0);

  // Build price positioning description
  const activeTiers = pricingLandscape.filter((t) => t.brand_count > 0);
  const dominantTier = activeTiers.sort((a, b) => b.brand_count - a.brand_count)[0];
  const pricePositioning = dominantTier
    ? `Market is concentrated in the ${dominantTier.tier.replace(/_/g, ' ')} tier (${dominantTier.brand_count} of ${brands.length} brands), with prices ranging $${dominantTier.price_range.low}-$${dominantTier.price_range.high}/month.`
    : 'Price positioning data unavailable.';

  // Key insight
  let keyInsight = '';
  const topBrand = [...brands].sort(
    (a, b) => b.estimated_annual_revenue_m - a.estimated_annual_revenue_m
  )[0];

  if (crowding.score >= 7) {
    keyInsight = `The ${primaryIngredient} competitive landscape is intensely crowded (${brands.length} brands, $${totalRevenue}M combined revenue). Differentiation through clinical evidence, novel delivery, or underserved channel strategy is essential for market entry.`;
  } else if (crowding.score >= 4) {
    keyInsight = `The ${primaryIngredient} market is moderately competitive with ${brands.length} brands generating $${totalRevenue}M in combined revenue. ${topBrand ? `${topBrand.brand_name} leads at $${topBrand.estimated_annual_revenue_m}M.` : ''} Opportunities exist in underrepresented tiers and channels.`;
  } else {
    keyInsight = `The ${primaryIngredient} space is relatively uncrowded with only ${brands.length} brands and $${totalRevenue}M in combined revenue, presenting a clear opportunity for a well-positioned entrant.`;
  }

  return {
    crowding_score: crowding.score,
    crowding_label: crowding.label,
    category_revenue_m: Math.round(totalRevenue),
    price_positioning_landscape: pricePositioning,
    white_space: whiteSpaces.slice(0, 5),
    key_insight: keyInsight,
  };
}

// =============================================================================
// Main Engine Function
// =============================================================================

/**
 * Analyzes the nutraceutical competitive landscape for a given ingredient or
 * health focus category. Returns a comprehensive output including brand
 * rankings, pricing tiers, Amazon intelligence, clinical evidence gaps,
 * certification matrix, and white space identification.
 */
export function analyzeNutraceuticalCompetitiveLandscape(
  input: NutraceuticalCompetitiveLandscapeInput
): NutraceuticalCompetitiveLandscapeOutput {
  // ── Step 1: Ingredient / category matching ──────────────────────────────
  const matchedBrands = findMatchingBrands(input);

  // ── Step 2: Brand retrieval + sort by revenue ───────────────────────────
  const { top_brands: topBrandEntries, emerging_brands: emergingBrandEntries } =
    splitBrandsByTier(matchedBrands);

  // ── Step 3: Convert NutraceuticalBrandEntry → NutraBrandCompetitor ──────
  const topBrands = topBrandEntries.map(convertToBrandCompetitor);
  const emergingBrands = emergingBrandEntries.map(convertToBrandCompetitor);

  // ── Step 4: Pricing landscape ───────────────────────────────────────────
  const pricingLandscape = buildPricingLandscape(matchedBrands);

  // ── Step 5: Amazon intelligence aggregation ─────────────────────────────
  const amazonIntelligence = buildAmazonIntelligence(matchedBrands);

  // ── Step 6: Channel distribution analysis ───────────────────────────────
  const channelDistribution = buildChannelDistribution(matchedBrands);

  // ── Step 7: Clinical evidence gap analysis ──────────────────────────────
  const clinicalEvidenceGaps = buildClinicalEvidenceGaps(
    matchedBrands,
    input.primary_ingredient
  );

  // ── Step 8: Certification matrix ────────────────────────────────────────
  const certificationMatrix = buildCertificationMatrix(matchedBrands);

  // ── Step 9: Crowding score ──────────────────────────────────────────────
  const crowding = computeCrowdingScore(matchedBrands, amazonIntelligence);

  // ── Step 10: White space identification ─────────────────────────────────
  const whiteSpaces = identifyWhiteSpace(
    matchedBrands,
    pricingLandscape,
    channelDistribution,
    certificationMatrix
  );

  // ── Step 11: Comparison matrix ──────────────────────────────────────────
  const comparisonMatrix = buildComparisonMatrix(topBrands);

  // ── Step 12: Strengths/weaknesses (already computed in Step 3) ──────────
  // Strengths and weaknesses are embedded in each NutraBrandCompetitor
  // from the convertToBrandCompetitor function.

  // ── Step 13: Output assembly ────────────────────────────────────────────
  const summary = buildSummary(
    matchedBrands,
    crowding,
    pricingLandscape,
    whiteSpaces,
    input.primary_ingredient
  );

  const dataSources = buildDataSources(matchedBrands);

  return {
    summary,
    top_brands: topBrands,
    emerging_brands: emergingBrands,
    comparison_matrix: comparisonMatrix,
    amazon_intelligence: amazonIntelligence,
    channel_distribution: channelDistribution,
    clinical_evidence_gaps: clinicalEvidenceGaps,
    pricing_landscape: pricingLandscape,
    certification_matrix: certificationMatrix,
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}
