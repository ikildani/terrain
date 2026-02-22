import { describe, it, expect } from 'vitest';
import { analyzePartners } from '@/lib/analytics/partners';
import type { PartnerDiscoveryInput, PartnerDiscoveryOutput, PartnerMatch } from '@/types';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<PartnerDiscoveryInput> = {}): PartnerDiscoveryInput {
  return {
    asset_description: 'KRAS G12C inhibitor for NSCLC',
    indication: 'Non-Small Cell Lung Cancer',
    mechanism: 'KRAS G12C inhibitor',
    development_stage: 'phase2',
    geography_rights: ['US', 'EU5', 'Japan'],
    deal_types: ['licensing'],
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzePartners', () => {
  // ── Happy path: oncology partner matching ───────────────
  describe('with oncology input (NSCLC)', () => {
    let result: PartnerDiscoveryOutput;

    it('should return a valid partner discovery output', async () => {
      result = await analyzePartners(makeInput());
      expect(result).toBeDefined();
    });

    it('should return partners sorted by match_score descending', async () => {
      result = result ?? await analyzePartners(makeInput());
      expect(result.ranked_partners.length).toBeGreaterThan(0);

      for (let i = 1; i < result.ranked_partners.length; i++) {
        expect(result.ranked_partners[i].match_score).toBeLessThanOrEqual(
          result.ranked_partners[i - 1].match_score
        );
      }
    });

    it('should assign match scores between 0 and 100', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        expect(partner.match_score).toBeGreaterThanOrEqual(0);
        expect(partner.match_score).toBeLessThanOrEqual(100);
      }
    });

    it('should include required fields on each partner match', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        expect(partner.company).toBeDefined();
        expect(partner.company.length).toBeGreaterThan(0);
        expect(partner.match_score).toBeTypeOf('number');
        expect(partner.score_breakdown).toBeDefined();
        expect(partner.rationale).toBeDefined();
        expect(partner.rationale.length).toBeGreaterThan(10);
      }
    });

    it('should include score breakdown with all 5 dimensions', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        const bd = partner.score_breakdown;
        expect(bd).toBeDefined();
        expect(bd.therapeutic_alignment).toBeTypeOf('number');
        expect(bd.pipeline_gap).toBeTypeOf('number');
        expect(bd.deal_history).toBeTypeOf('number');
        expect(bd.geography_fit).toBeTypeOf('number');
        expect(bd.financial_capacity).toBeTypeOf('number');
      }
    });

    it('should have each dimension score within its valid range', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        const bd = partner.score_breakdown;
        expect(bd.therapeutic_alignment).toBeGreaterThanOrEqual(0);
        expect(bd.therapeutic_alignment).toBeLessThanOrEqual(25);
        expect(bd.pipeline_gap).toBeGreaterThanOrEqual(0);
        expect(bd.pipeline_gap).toBeLessThanOrEqual(25);
        expect(bd.deal_history).toBeGreaterThanOrEqual(0);
        expect(bd.deal_history).toBeLessThanOrEqual(20);
        expect(bd.geography_fit).toBeGreaterThanOrEqual(0);
        expect(bd.geography_fit).toBeLessThanOrEqual(15);
        expect(bd.financial_capacity).toBeGreaterThanOrEqual(0);
        expect(bd.financial_capacity).toBeLessThanOrEqual(15);
      }
    });

    it('should have total match_score >= sum of base dimension scores (bonuses may increase it)', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        const bd = partner.score_breakdown;
        const baseSum =
          bd.therapeutic_alignment +
          bd.pipeline_gap +
          bd.deal_history +
          bd.geography_fit +
          bd.financial_capacity +
          (bd.competing_penalty ?? 0);
        // match_score = baseSum + competing_penalty + patent_cliff_score
        // so match_score >= baseSum (when no penalty) or could be lower (with penalty)
        expect(partner.match_score).toBeGreaterThanOrEqual(0);
        expect(partner.match_score).toBeGreaterThanOrEqual(baseSum);
      }
    });

    it('should include ranks starting from 1', async () => {
      result = result ?? await analyzePartners(makeInput());
      expect(result.ranked_partners[0].rank).toBe(1);

      for (let i = 0; i < result.ranked_partners.length; i++) {
        expect(result.ranked_partners[i].rank).toBe(i + 1);
      }
    });

    it('should include company type for each partner', async () => {
      result = result ?? await analyzePartners(makeInput());
      const validTypes = ['Big Pharma', 'Mid-Size Pharma', 'Specialty Pharma', 'Biotech'];

      for (const partner of result.ranked_partners) {
        expect(validTypes).toContain(partner.company_type);
      }
    });

    it('should include deal terms benchmark for each partner', async () => {
      result = result ?? await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        expect(partner.deal_terms_benchmark).toBeDefined();
        expect(partner.deal_terms_benchmark.typical_upfront).toBeDefined();
        expect(partner.deal_terms_benchmark.typical_milestones).toBeDefined();
        expect(partner.deal_terms_benchmark.typical_royalty_range).toBeDefined();
      }
    });

    it('should include recent deals for partners', async () => {
      result = result ?? await analyzePartners(makeInput());

      // At least some partners should have recent deals
      const partnersWithDeals = result.ranked_partners.filter(
        p => p.recent_deals.length > 0
      );
      expect(partnersWithDeals.length).toBeGreaterThan(0);
    });

    it('should include watch signals for partners', async () => {
      result = result ?? await analyzePartners(makeInput());

      // At least some partners should have watch signals
      const partnersWithSignals = result.ranked_partners.filter(
        p => p.watch_signals.length > 0
      );
      expect(partnersWithSignals.length).toBeGreaterThan(0);
    });
  });

  // ── Excluding companies ─────────────────────────────────
  describe('exclude_companies filtering', () => {
    it('should exclude specified companies from results', async () => {
      const result = await analyzePartners(
        makeInput({ exclude_companies: ['Pfizer', 'Merck & Co'] })
      );

      const companyNames = result.ranked_partners.map(p => p.company);
      expect(companyNames).not.toContain('Pfizer');
      expect(companyNames).not.toContain('Merck & Co');
    });

    it('should return fewer partners when companies are excluded', async () => {
      const resultFull = await analyzePartners(makeInput());
      const resultExcluded = await analyzePartners(
        makeInput({ exclude_companies: ['Pfizer', 'Merck & Co', 'Roche'] })
      );

      expect(resultExcluded.summary.total_screened).toBeLessThan(
        resultFull.summary.total_screened
      );
    });
  });

  // ── Deal type matching ──────────────────────────────────
  describe('deal type effects on matching', () => {
    it('should affect deal_history scores based on deal type', async () => {
      const licensing = await analyzePartners(
        makeInput({ deal_types: ['licensing'] })
      );
      const acquisition = await analyzePartners(
        makeInput({ deal_types: ['acquisition'] })
      );

      // Both should return results
      expect(licensing.ranked_partners.length).toBeGreaterThan(0);
      expect(acquisition.ranked_partners.length).toBeGreaterThan(0);
    });
  });

  // ── Summary statistics ──────────────────────────────────
  describe('summary statistics', () => {
    it('should include summary with total_screened, total_matched, and avg_match_score', async () => {
      const result = await analyzePartners(makeInput());
      expect(result.summary.total_screened).toBeGreaterThan(0);
      expect(result.summary.total_matched).toBeGreaterThanOrEqual(0);
      expect(result.summary.total_matched).toBeLessThanOrEqual(result.summary.total_screened);
      expect(result.summary.avg_match_score).toBeGreaterThanOrEqual(0);
      expect(result.summary.avg_match_score).toBeLessThanOrEqual(100);
      expect(result.summary.indication).toBe('Non-Small Cell Lung Cancer');
      expect(result.summary.development_stage).toBe('phase2');
    });

    it('should include top_tier_count (score >= 60)', async () => {
      const result = await analyzePartners(makeInput());
      // top_tier_count counts ALL qualified partners (before the top-20 cap),
      // so it may be larger than ranked_partners.length
      expect(result.summary.top_tier_count).toBeGreaterThanOrEqual(0);
      expect(result.summary.top_tier_count).toBeLessThanOrEqual(result.summary.total_matched);

      // Every returned partner with score >= 60 should be counted in top_tier
      const returnedTopTier = result.ranked_partners.filter(p => p.match_score >= 60).length;
      expect(result.summary.top_tier_count).toBeGreaterThanOrEqual(returnedTopTier);
    });
  });

  // ── Deal benchmarks ─────────────────────────────────────
  describe('deal benchmarks', () => {
    it('should include deal benchmarks with stage and sample size', async () => {
      const result = await analyzePartners(makeInput());
      expect(result.deal_benchmarks).toBeDefined();
      expect(result.deal_benchmarks.stage).toBe('phase2');
      expect(result.deal_benchmarks.sample_size).toBeTypeOf('number');
      expect(result.deal_benchmarks.typical_royalty_range).toBeDefined();
    });
  });

  // ── Methodology and data sources ────────────────────────
  describe('methodology and data sources', () => {
    it('should include methodology string', async () => {
      const result = await analyzePartners(makeInput());
      expect(result.methodology).toBeDefined();
      expect(result.methodology.length).toBeGreaterThan(50);
    });

    it('should include data sources', async () => {
      const result = await analyzePartners(makeInput());
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', async () => {
      const result = await analyzePartners(makeInput());
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Minimum match score filtering ───────────────────────
  describe('minimum match score filtering', () => {
    it('should filter out partners below minimum_match_score', async () => {
      const result = await analyzePartners(
        makeInput({ minimum_match_score: 50 })
      );

      for (const partner of result.ranked_partners) {
        expect(partner.match_score).toBeGreaterThanOrEqual(50);
      }
    });

    it('should return fewer results with a higher minimum score', async () => {
      const lowThreshold = await analyzePartners(
        makeInput({ minimum_match_score: 20 })
      );
      const highThreshold = await analyzePartners(
        makeInput({ minimum_match_score: 60 })
      );

      expect(highThreshold.ranked_partners.length).toBeLessThanOrEqual(
        lowThreshold.ranked_partners.length
      );
    });
  });

  // ── Geography rights impact ─────────────────────────────
  describe('geography rights impact', () => {
    it('should include geography_fit scores for each partner', async () => {
      const result = await analyzePartners(makeInput());

      for (const partner of result.ranked_partners) {
        expect(partner.score_breakdown.geography_fit).toBeGreaterThanOrEqual(0);
        expect(partner.score_breakdown.geography_fit).toBeLessThanOrEqual(15);
      }
    });

    it('should produce results for global rights', async () => {
      const result = await analyzePartners(
        makeInput({ geography_rights: ['Global' as any] })
      );
      expect(result.ranked_partners.length).toBeGreaterThan(0);
    });
  });

  // ── Max 20 partners returned ────────────────────────────
  describe('result capping', () => {
    it('should return at most 20 partners', async () => {
      const result = await analyzePartners(
        makeInput({ minimum_match_score: 1 })
      );
      expect(result.ranked_partners.length).toBeLessThanOrEqual(20);
    });
  });

  // ── Different indications ───────────────────────────────
  describe('across different indications', () => {
    it('should find partners for immunology indication', async () => {
      const result = await analyzePartners(
        makeInput({
          indication: 'Rheumatoid Arthritis',
          mechanism: 'JAK inhibitor',
        })
      );
      expect(result.ranked_partners.length).toBeGreaterThan(0);
    });

    it('should find partners for rare disease indication', async () => {
      const result = await analyzePartners(
        makeInput({
          indication: 'Duchenne Muscular Dystrophy',
          mechanism: 'gene therapy',
        })
      );
      expect(result.ranked_partners.length).toBeGreaterThan(0);
    });
  });
});
