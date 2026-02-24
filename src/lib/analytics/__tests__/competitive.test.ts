import { describe, it, expect } from 'vitest';
import { analyzeCompetitiveLandscape, type CompetitiveLandscapeInput } from '@/lib/analytics/competitive';
import type { CompetitiveLandscapeOutput, Competitor } from '@/types';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<CompetitiveLandscapeInput> = {}): CompetitiveLandscapeInput {
  return {
    indication: 'Non-Small Cell Lung Cancer',
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzeCompetitiveLandscape', () => {
  // ── Happy path: NSCLC ───────────────────────────────────
  describe('with NSCLC (known, competitive indication)', () => {
    let result: CompetitiveLandscapeOutput;

    it('should return a valid competitive landscape output', async () => {
      result = await analyzeCompetitiveLandscape(makeInput());
      expect(result).toBeDefined();
    });

    it('should include a summary with crowding score between 1 and 10', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.summary.crowding_score).toBeLessThanOrEqual(10);
    });

    it('should have a valid crowding label', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(result.summary.crowding_label);
    });

    it('should return competitors with required fields', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));

      // Gather all competitors across phase buckets
      const allCompetitors: Competitor[] = [
        ...result.approved_products,
        ...result.late_stage_pipeline,
        ...result.mid_stage_pipeline,
        ...result.early_pipeline,
      ];

      expect(allCompetitors.length).toBeGreaterThan(0);

      for (const comp of allCompetitors) {
        expect(comp.company).toBeDefined();
        expect(comp.company.length).toBeGreaterThan(0);
        expect(comp.asset_name).toBeDefined();
        expect(comp.asset_name.length).toBeGreaterThan(0);
        expect(comp.mechanism).toBeDefined();
        expect(comp.phase).toBeDefined();
        expect(['Approved', 'Phase 3', 'Phase 2/3', 'Phase 2', 'Phase 1/2', 'Phase 1', 'Preclinical']).toContain(
          comp.phase,
        );
      }
    });

    it('should have approved products for a well-known oncology indication', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.approved_products.length).toBeGreaterThan(0);
    });

    it('should include differentiation scores between 1 and 10', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      const allCompetitors = [
        ...result.approved_products,
        ...result.late_stage_pipeline,
        ...result.mid_stage_pipeline,
        ...result.early_pipeline,
      ];

      for (const comp of allCompetitors) {
        expect(comp.differentiation_score).toBeGreaterThanOrEqual(1);
        expect(comp.differentiation_score).toBeLessThanOrEqual(10);
      }
    });

    it('should include evidence strength scores between 1 and 10', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      const allCompetitors = [
        ...result.approved_products,
        ...result.late_stage_pipeline,
        ...result.mid_stage_pipeline,
        ...result.early_pipeline,
      ];

      for (const comp of allCompetitors) {
        expect(comp.evidence_strength).toBeGreaterThanOrEqual(1);
        expect(comp.evidence_strength).toBeLessThanOrEqual(10);
      }
    });

    it('should include white space opportunities', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.summary.white_space).toBeInstanceOf(Array);
      // White space may be empty for a very crowded indication, but should not be undefined
    });

    it('should include key insight narrative', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.summary.key_insight).toBeDefined();
      expect(result.summary.key_insight.length).toBeGreaterThan(20);
    });

    it('should include differentiation opportunity narrative', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.summary.differentiation_opportunity).toBeDefined();
      expect(result.summary.differentiation_opportunity.length).toBeGreaterThan(20);
    });

    it('should include a comparison matrix', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.comparison_matrix).toBeInstanceOf(Array);
      expect(result.comparison_matrix.length).toBeGreaterThan(0);

      // Each entry should have an attribute and competitors record
      for (const attr of result.comparison_matrix) {
        expect(attr.attribute).toBeDefined();
        expect(attr.competitors).toBeDefined();
        expect(typeof attr.competitors).toBe('object');
      }
    });

    it('should include data sources', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', async () => {
      result = result ?? (await analyzeCompetitiveLandscape(makeInput()));
      expect(result.generated_at).toBeDefined();
      // Should be a valid ISO string
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Phase bucketing ─────────────────────────────────────
  describe('phase bucketing', () => {
    it('should correctly bucket competitors by clinical phase', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());

      for (const comp of result.approved_products) {
        expect(comp.phase).toBe('Approved');
      }
      for (const comp of result.late_stage_pipeline) {
        expect(['Phase 3', 'Phase 2/3']).toContain(comp.phase);
      }
      for (const comp of result.mid_stage_pipeline) {
        expect(comp.phase).toBe('Phase 2');
      }
      for (const comp of result.early_pipeline) {
        expect(['Phase 1', 'Phase 1/2', 'Preclinical']).toContain(comp.phase);
      }
    });
  });

  // ── Mechanism filtering ─────────────────────────────────
  describe('mechanism context', () => {
    it('should include mechanism-specific insight when mechanism is provided', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput({ mechanism: 'PD-1 inhibitor' }));
      expect(result.summary.mechanism).toBe('PD-1 inhibitor');
      // Key insight should mention the mechanism
      expect(result.summary.key_insight.toLowerCase()).toContain('pd-1');
    });
  });

  // ── Unknown indication ─────────────────────────────────
  describe('with an unknown indication', () => {
    it('should throw an error for a completely unknown indication', async () => {
      await expect(
        analyzeCompetitiveLandscape(makeInput({ indication: 'Totally Fake Disease ABC999' })),
      ).rejects.toThrow(/indication not found/i);
    });
  });

  // ── Indication with no competitors ─────────────────────
  describe('with an indication that may have few or no competitors', () => {
    it('should return gracefully with empty competitor arrays when no competitors found', async () => {
      // Try an indication that exists in the map but may not have competitor data
      try {
        const result = await analyzeCompetitiveLandscape(makeInput({ indication: 'Friedreich Ataxia' }));
        // If it returns successfully, it should have valid structure
        expect(result.summary).toBeDefined();
        expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
        expect(result.approved_products).toBeInstanceOf(Array);
        expect(result.late_stage_pipeline).toBeInstanceOf(Array);
        expect(result.mid_stage_pipeline).toBeInstanceOf(Array);
        expect(result.early_pipeline).toBeInstanceOf(Array);
      } catch (e: unknown) {
        // If it throws, it should be because indication isn't found, not a crash
        expect((e as Error).message).toMatch(/indication/i);
      }
    });
  });

  // ── Competitor IDs are unique ───────────────────────────
  describe('competitor deduplication', () => {
    it('should generate unique IDs for all competitors', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      const allCompetitors = [
        ...result.approved_products,
        ...result.late_stage_pipeline,
        ...result.mid_stage_pipeline,
        ...result.early_pipeline,
      ];

      const ids = allCompetitors.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ── NSCLC should be highly crowded ──────────────────────
  describe('crowding score calibration', () => {
    it('should classify NSCLC as High or Extremely High crowding', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      // NSCLC is one of the most competitive indications
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(5);
      expect(['High', 'Extremely High']).toContain(result.summary.crowding_label);
    });
  });

  // ── Different indications ───────────────────────────────
  describe('across different indications', () => {
    it('should analyze a neurology indication', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput({ indication: "Alzheimer's Disease" }));
      expect(result.summary.indication).toBe("Alzheimer's Disease");
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Displacement risk ────────────────────────────────────
  describe('displacement risk assessment', () => {
    it('should include displacement risk analysis', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      expect(result.displacement_risk).toBeDefined();
    });
  });

  // ── Barrier assessment ───────────────────────────────────
  describe('barrier-to-entry assessment', () => {
    it('should include barrier assessment', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      expect(result.barrier_assessment).toBeDefined();
    });
  });

  // ── Market share distribution ────────────────────────────
  describe('market share distribution', () => {
    it('should include market share distribution for indications with approved products', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      expect(result.market_share_distribution).toBeDefined();
    });
  });

  // ── Competitor success probabilities ─────────────────────
  describe('competitor success probabilities', () => {
    it('should include competitor success probabilities', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      expect(result.competitor_success_probabilities).toBeDefined();
      expect(result.competitor_success_probabilities).toBeInstanceOf(Array);
    });
  });

  // ── Competitive timelines ────────────────────────────────
  describe('competitive timelines', () => {
    it('should include competitive timelines array', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      expect(result.competitive_timelines).toBeDefined();
      expect(result.competitive_timelines).toBeInstanceOf(Array);
    });
  });

  // ── Strengths and weaknesses ─────────────────────────────
  describe('competitor strengths and weaknesses', () => {
    it('should include strengths and weaknesses for each competitor', async () => {
      const result = await analyzeCompetitiveLandscape(makeInput());
      const allCompetitors = [
        ...result.approved_products,
        ...result.late_stage_pipeline,
        ...result.mid_stage_pipeline,
        ...result.early_pipeline,
      ];

      for (const comp of allCompetitors) {
        expect(comp.strengths).toBeInstanceOf(Array);
        expect(comp.weaknesses).toBeInstanceOf(Array);
        // Approved products should have populated strengths/weaknesses
        if (comp.phase === 'Approved') {
          expect(comp.strengths.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
