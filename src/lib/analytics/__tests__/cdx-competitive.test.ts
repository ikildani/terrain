import { describe, it, expect } from 'vitest';
import { analyzeCDxCompetitiveLandscape } from '@/lib/analytics/cdx-competitive';
import type {
  CDxCompetitiveLandscapeInput,
  CDxCompetitiveLandscapeOutput,
  CDxCompetitor,
} from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<CDxCompetitiveLandscapeInput> = {}): CDxCompetitiveLandscapeInput {
  return {
    biomarker: 'PD-L1',
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzeCDxCompetitiveLandscape', () => {
  // ── Happy path: PD-L1 (well-known biomarker) ────────────
  describe('with PD-L1 (known biomarker)', () => {
    let result: CDxCompetitiveLandscapeOutput;

    it('should return a valid CDx competitive landscape output', () => {
      result = analyzeCDxCompetitiveLandscape(makeInput());
      expect(result).toBeDefined();
    });

    it('should include a summary with crowding score between 1 and 10', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.summary.crowding_score).toBeLessThanOrEqual(10);
    });

    it('should have a valid crowding label', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(result.summary.crowding_label);
    });

    it('should return approved and/or pipeline tests', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());

      const allTests: CDxCompetitor[] = [...result.approved_tests, ...result.pipeline_tests];

      expect(allTests.length).toBeGreaterThan(0);

      for (const test of allTests) {
        expect(test.company).toBeDefined();
        expect(test.company.length).toBeGreaterThan(0);
        expect(test.test_name).toBeDefined();
        expect(test.test_name.length).toBeGreaterThan(0);
        expect(test.platform).toBeDefined();
        expect(test.biomarkers_covered).toBeInstanceOf(Array);
        expect(test.biomarkers_covered.length).toBeGreaterThan(0);
        expect(test.differentiation_score).toBeGreaterThanOrEqual(1);
        expect(test.differentiation_score).toBeLessThanOrEqual(10);
        expect(test.evidence_strength).toBeGreaterThanOrEqual(1);
        expect(test.evidence_strength).toBeLessThanOrEqual(10);
      }
    });

    it('should include platform comparison data', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.platform_comparison).toBeInstanceOf(Array);
      expect(result.platform_comparison.length).toBeGreaterThan(0);

      for (const platform of result.platform_comparison) {
        expect(platform.platform).toBeDefined();
        expect(platform.test_count).toBeGreaterThan(0);
        expect(['growing', 'stable', 'declining']).toContain(platform.trend);
        expect(['narrow', 'moderate', 'broad']).toContain(platform.biomarker_breadth);
      }
    });

    it('should include a biomarker competition matrix', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.biomarker_competition_matrix).toBeInstanceOf(Array);
      expect(result.biomarker_competition_matrix.length).toBeGreaterThan(0);

      for (const entry of result.biomarker_competition_matrix) {
        expect(entry.biomarker).toBeDefined();
        expect(entry.tests_detecting).toBeInstanceOf(Array);
        expect(['low', 'moderate', 'high', 'very_high']).toContain(entry.competitive_intensity);
      }
    });

    it('should include linked drug dependency data', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.linked_drug_dependency).toBeInstanceOf(Array);
    });

    it('should include a testing landscape summary', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.testing_landscape).toBeDefined();
      expect(result.testing_landscape.total_estimated_tests_per_year).toBeGreaterThanOrEqual(0);
      expect(result.testing_landscape.by_platform).toBeInstanceOf(Array);
    });

    it('should include a comparison matrix', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.comparison_matrix).toBeInstanceOf(Array);
      expect(result.comparison_matrix.length).toBeGreaterThan(0);

      for (const attr of result.comparison_matrix) {
        expect(attr.attribute).toBeDefined();
        expect(attr.competitors).toBeDefined();
        expect(typeof attr.competitors).toBe('object');
      }
    });

    it('should include white space opportunities', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.summary.white_space).toBeInstanceOf(Array);
    });

    it('should include key insight narrative', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.summary.key_insight).toBeDefined();
      expect(result.summary.key_insight.length).toBeGreaterThan(20);
    });

    it('should include the dominant platform in the summary', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.summary.platform_dominant).toBeDefined();
      expect(['NGS', 'PCR', 'IHC', 'FISH', 'liquid_biopsy', 'ddPCR', 'microarray']).toContain(
        result.summary.platform_dominant,
      );
    });

    it('should include testing penetration percentage', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.summary.testing_penetration_pct).toBeGreaterThanOrEqual(0);
      expect(result.summary.testing_penetration_pct).toBeLessThanOrEqual(100);
    });

    it('should include data sources', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', () => {
      result = result ?? analyzeCDxCompetitiveLandscape(makeInput());
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Biomarker alias resolution ───────────────────────────
  describe('biomarker alias resolution', () => {
    it('should resolve PDL1 to the same results as PD-L1', () => {
      const withDash = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'PD-L1' }));
      const withoutDash = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'PDL1' }));

      // Both should return the same set of tests
      const dashTestNames = [...withDash.approved_tests, ...withDash.pipeline_tests].map((t) => t.test_name).sort();
      const noDashTestNames = [...withoutDash.approved_tests, ...withoutDash.pipeline_tests]
        .map((t) => t.test_name)
        .sort();

      expect(dashTestNames).toEqual(noDashTestNames);
    });
  });

  // ── Different biomarkers ─────────────────────────────────
  describe('across different biomarkers', () => {
    it('should analyze EGFR biomarker', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'EGFR' }));
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should analyze HER2 biomarker', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'HER2' }));
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should analyze ALK biomarker', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'ALK' }));
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Optional filters ─────────────────────────────────────
  describe('optional input filters', () => {
    it('should accept a test_type filter', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'PD-L1', test_type: 'NGS' }));
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should accept a linked_drug filter', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'PD-L1', linked_drug: 'pembrolizumab' }));
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should accept an indication filter', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'PD-L1', indication: 'NSCLC' }));
      expect(result).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Unknown biomarker ────────────────────────────────────
  describe('with an unknown biomarker', () => {
    it('should return a valid structure (falls back to broader search)', () => {
      const result = analyzeCDxCompetitiveLandscape(makeInput({ biomarker: 'TOTALLY_UNKNOWN_BIOMARKER_ZZZ' }));

      // The engine has fallback logic and returns the full database as ultimate fallback
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.generated_at).toBeDefined();
    });
  });
});
