import { describe, it, expect } from 'vitest';
import { analyzeNutraceuticalCompetitiveLandscape } from '@/lib/analytics/nutraceutical-competitive';
import type {
  NutraceuticalCompetitiveLandscapeInput,
  NutraceuticalCompetitiveLandscapeOutput,
  NutraBrandCompetitor,
} from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(
  overrides: Partial<NutraceuticalCompetitiveLandscapeInput> = {},
): NutraceuticalCompetitiveLandscapeInput {
  return {
    primary_ingredient: 'NMN',
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzeNutraceuticalCompetitiveLandscape', () => {
  // ── Happy path: NMN (known longevity ingredient) ─────────
  describe('with NMN (known ingredient)', () => {
    let result: NutraceuticalCompetitiveLandscapeOutput;

    it('should return a valid nutraceutical competitive landscape output', () => {
      result = analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result).toBeDefined();
    });

    it('should include a summary with crowding score between 1 and 10', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.summary.crowding_score).toBeLessThanOrEqual(10);
    });

    it('should have a valid crowding label', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(result.summary.crowding_label);
    });

    it('should include category revenue in the summary', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.summary.category_revenue_m).toBeGreaterThanOrEqual(0);
    });

    it('should include price positioning landscape description', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.summary.price_positioning_landscape).toBeDefined();
      expect(result.summary.price_positioning_landscape.length).toBeGreaterThan(0);
    });

    it('should return top brands with required fields', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());

      expect(result.top_brands).toBeInstanceOf(Array);
      expect(result.top_brands.length).toBeGreaterThan(0);

      for (const brand of result.top_brands) {
        expect(brand.brand).toBeDefined();
        expect(brand.brand.length).toBeGreaterThan(0);
        expect(brand.company).toBeDefined();
        expect(brand.primary_ingredient).toBeDefined();
        expect(brand.estimated_revenue_m).toBeGreaterThanOrEqual(0);
        expect(brand.price_per_unit).toBeGreaterThan(0);
        expect(['mass', 'premium', 'clinical_grade', 'luxury']).toContain(brand.price_tier);
        expect(brand.channels).toBeInstanceOf(Array);
        expect(brand.channels.length).toBeGreaterThan(0);
        expect(brand.differentiation_score).toBeGreaterThanOrEqual(0);
        expect(brand.differentiation_score).toBeLessThanOrEqual(10);
        expect(brand.evidence_strength).toBeGreaterThanOrEqual(0);
        expect(brand.evidence_strength).toBeLessThanOrEqual(10);
        expect(brand.strengths).toBeInstanceOf(Array);
        expect(brand.weaknesses).toBeInstanceOf(Array);
      }
    });

    it('should return emerging brands array', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.emerging_brands).toBeInstanceOf(Array);
    });

    it('should include pricing landscape with tier breakdown', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.pricing_landscape).toBeInstanceOf(Array);
      expect(result.pricing_landscape.length).toBeGreaterThan(0);

      for (const tier of result.pricing_landscape) {
        expect(['mass', 'premium', 'clinical_grade', 'luxury']).toContain(tier.tier);
        expect(tier.brand_count).toBeGreaterThanOrEqual(0);
        expect(tier.price_range.low).toBeLessThanOrEqual(tier.price_range.high);
        expect(tier.representative_brands).toBeInstanceOf(Array);
      }
    });

    it('should include Amazon intelligence aggregation', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.amazon_intelligence).toBeDefined();
      expect(result.amazon_intelligence.avg_bsr_top_10).toBeGreaterThanOrEqual(0);
      expect(result.amazon_intelligence.avg_reviews_top_10).toBeGreaterThanOrEqual(0);
      expect(result.amazon_intelligence.avg_rating_top_10).toBeGreaterThanOrEqual(0);
      expect(result.amazon_intelligence.avg_rating_top_10).toBeLessThanOrEqual(5);
      expect(['low', 'moderate', 'high']).toContain(result.amazon_intelligence.ppc_competitiveness);
      expect(result.amazon_intelligence.narrative).toBeDefined();
      expect(result.amazon_intelligence.narrative.length).toBeGreaterThan(10);
    });

    it('should include channel distribution', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.channel_distribution).toBeInstanceOf(Array);
      expect(result.channel_distribution.length).toBeGreaterThan(0);

      for (const channel of result.channel_distribution) {
        expect(channel.channel).toBeDefined();
        expect(channel.brand_count).toBeGreaterThanOrEqual(0);
        expect(channel.share_pct).toBeGreaterThanOrEqual(0);
        expect(channel.share_pct).toBeLessThanOrEqual(100);
      }
    });

    it('should include clinical evidence gaps', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.clinical_evidence_gaps).toBeInstanceOf(Array);

      for (const gap of result.clinical_evidence_gaps) {
        expect(gap.evidence_area).toBeDefined();
        expect(gap.current_studies).toBeGreaterThanOrEqual(0);
        expect(gap.opportunity).toBeDefined();
        expect(gap.opportunity.length).toBeGreaterThan(0);
      }
    });

    it('should include certification matrix', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.certification_matrix).toBeInstanceOf(Array);
      expect(result.certification_matrix.length).toBeGreaterThan(0);

      for (const cert of result.certification_matrix) {
        expect(cert.certification).toBeDefined();
        expect(cert.brands_with).toBeInstanceOf(Array);
        expect(cert.brands_without).toBeInstanceOf(Array);
        expect(['high', 'moderate', 'low']).toContain(cert.consumer_importance);
        expect(cert.cost_to_obtain_k).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include a comparison matrix', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.comparison_matrix).toBeInstanceOf(Array);
      expect(result.comparison_matrix.length).toBeGreaterThan(0);

      for (const attr of result.comparison_matrix) {
        expect(attr.attribute).toBeDefined();
        expect(attr.competitors).toBeDefined();
        expect(typeof attr.competitors).toBe('object');
      }
    });

    it('should include white space opportunities', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.summary.white_space).toBeInstanceOf(Array);
    });

    it('should include key insight narrative', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.summary.key_insight).toBeDefined();
      expect(result.summary.key_insight.length).toBeGreaterThan(20);
    });

    it('should include data sources', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', () => {
      result = result ?? analyzeNutraceuticalCompetitiveLandscape(makeInput());
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Health focus category resolution ─────────────────────
  describe('health focus category resolution', () => {
    it('should resolve "brain health" to the cognitive category', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(
        makeInput({
          primary_ingredient: "Lion's Mane",
          health_focus: 'brain health and cognitive function',
        }),
      );
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should resolve "gut health" to microbiome category', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(
        makeInput({
          primary_ingredient: 'Lactobacillus',
          health_focus: 'gut microbiome support',
        }),
      );
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Different ingredients ────────────────────────────────
  describe('across different ingredients', () => {
    it('should analyze creatine (sports performance)', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(makeInput({ primary_ingredient: 'Creatine' }));
      expect(result.summary).toBeDefined();
      expect(result.top_brands.length).toBeGreaterThan(0);
    });

    it('should analyze collagen (beauty)', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(makeInput({ primary_ingredient: 'Collagen' }));
      expect(result.summary).toBeDefined();
      expect(result.top_brands.length).toBeGreaterThan(0);
    });
  });

  // ── Explicit category override ───────────────────────────
  describe('with explicit ingredient_category', () => {
    it('should use the provided category for matching', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(
        makeInput({
          primary_ingredient: 'NMN',
          ingredient_category: 'longevity_compound',
        }),
      );
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Unknown ingredient ───────────────────────────────────
  describe('with an unknown ingredient', () => {
    it('should return a valid structure (falls back to top brands)', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(
        makeInput({ primary_ingredient: 'Totally Unknown Ingredient ZZZ999' }),
      );

      // The engine has fallback logic: when no ingredient match, it falls back
      // to category or top brands across all categories
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.top_brands).toBeInstanceOf(Array);
      expect(result.generated_at).toBeDefined();
    });
  });

  // ── Top brands sorted by revenue ─────────────────────────
  describe('brand ordering', () => {
    it('should return top brands sorted by estimated revenue descending', () => {
      const result = analyzeNutraceuticalCompetitiveLandscape(makeInput());

      for (let i = 1; i < result.top_brands.length; i++) {
        expect(result.top_brands[i].estimated_revenue_m).toBeLessThanOrEqual(
          result.top_brands[i - 1].estimated_revenue_m,
        );
      }
    });
  });
});
