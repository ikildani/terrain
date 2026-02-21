import { describe, it, expect } from 'vitest';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import type { MarketSizingInput, MarketSizingOutput } from '@/types';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<MarketSizingInput> = {}): MarketSizingInput {
  return {
    indication: 'Non-Small Cell Lung Cancer',
    geography: ['US'],
    development_stage: 'phase2',
    pricing_assumption: 'base',
    launch_year: 2028,
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('calculateMarketSizing', () => {
  // ── Happy path: NSCLC ───────────────────────────────────
  describe('with a known indication (NSCLC)', () => {
    let result: MarketSizingOutput;

    it('should return a complete market sizing output', async () => {
      result = await calculateMarketSizing(makeInput());
      expect(result).toBeDefined();
    });

    it('should include TAM, SAM, SOM in summary', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.summary.tam_us).toBeDefined();
      expect(result.summary.sam_us).toBeDefined();
      expect(result.summary.som_us).toBeDefined();
      expect(result.summary.global_tam).toBeDefined();

      // Each metric has value, unit, confidence
      for (const metric of [result.summary.tam_us, result.summary.sam_us, result.summary.som_us, result.summary.global_tam]) {
        expect(metric.value).toBeTypeOf('number');
        expect(metric.value).toBeGreaterThan(0);
        expect(['B', 'M', 'K']).toContain(metric.unit);
        expect(['high', 'medium', 'low']).toContain(metric.confidence);
      }
    });

    it('should return a valid patient funnel', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      const { patient_funnel } = result;
      expect(patient_funnel.us_prevalence).toBeGreaterThan(0);
      expect(patient_funnel.us_incidence).toBeGreaterThan(0);
      expect(patient_funnel.diagnosed).toBeGreaterThan(0);
      expect(patient_funnel.treated).toBeGreaterThan(0);
      expect(patient_funnel.addressable).toBeGreaterThan(0);
      expect(patient_funnel.capturable).toBeGreaterThan(0);

      // Funnel should decrease: prevalence >= diagnosed >= treated >= addressable >= capturable
      expect(patient_funnel.us_prevalence).toBeGreaterThanOrEqual(patient_funnel.diagnosed);
      expect(patient_funnel.diagnosed).toBeGreaterThanOrEqual(patient_funnel.treated);
      expect(patient_funnel.treated).toBeGreaterThanOrEqual(patient_funnel.addressable);
      expect(patient_funnel.addressable).toBeGreaterThanOrEqual(patient_funnel.capturable);
    });

    it('should include geography breakdown', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.geography_breakdown).toBeInstanceOf(Array);
      expect(result.geography_breakdown.length).toBeGreaterThanOrEqual(1);

      const usGeo = result.geography_breakdown.find(g =>
        g.territory === 'United States' || g.territory === 'US'
      );
      expect(usGeo).toBeDefined();
      expect(usGeo!.tam.value).toBeGreaterThan(0);
    });

    it('should include pricing analysis with comparable drugs', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      const { pricing_analysis } = result;
      expect(pricing_analysis).toBeDefined();
      expect(pricing_analysis.comparable_drugs).toBeInstanceOf(Array);
      expect(pricing_analysis.recommended_wac.conservative).toBeGreaterThan(0);
      expect(pricing_analysis.recommended_wac.base).toBeGreaterThan(0);
      expect(pricing_analysis.recommended_wac.premium).toBeGreaterThan(0);

      // Conservative <= base <= premium
      expect(pricing_analysis.recommended_wac.conservative).toBeLessThanOrEqual(pricing_analysis.recommended_wac.base);
      expect(pricing_analysis.recommended_wac.base).toBeLessThanOrEqual(pricing_analysis.recommended_wac.premium);

      // Gross-to-net should be between 0 and 1
      expect(pricing_analysis.gross_to_net_estimate).toBeGreaterThan(0);
      expect(pricing_analysis.gross_to_net_estimate).toBeLessThan(1);

      // Payer dynamics and rationale are non-empty strings
      expect(pricing_analysis.payer_dynamics.length).toBeGreaterThan(10);
      expect(pricing_analysis.pricing_rationale.length).toBeGreaterThan(10);
    });

    it('should include revenue projection with 10 years', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.revenue_projection).toHaveLength(10);
      for (const year of result.revenue_projection) {
        expect(year.year).toBeGreaterThanOrEqual(2028);
        expect(year.bear).toBeTypeOf('number');
        expect(year.base).toBeTypeOf('number');
        expect(year.bull).toBeTypeOf('number');
        // bear <= base <= bull
        expect(year.bear).toBeLessThanOrEqual(year.base);
        expect(year.base).toBeLessThanOrEqual(year.bull);
      }
    });

    it('should include competitive context', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.competitive_context.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.competitive_context.crowding_score).toBeLessThanOrEqual(10);
      expect(result.competitive_context.approved_products).toBeGreaterThanOrEqual(0);
      expect(result.competitive_context.phase3_programs).toBeGreaterThanOrEqual(0);
      expect(result.competitive_context.differentiation_note.length).toBeGreaterThan(10);
    });

    it('should include peak sales estimates (low < base < high)', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      const ps = result.summary.peak_sales_estimate;
      expect(ps.low).toBeGreaterThan(0);
      expect(ps.base).toBeGreaterThan(0);
      expect(ps.high).toBeGreaterThan(0);
      expect(ps.low).toBeLessThanOrEqual(ps.base);
      expect(ps.base).toBeLessThanOrEqual(ps.high);
    });

    it('should include methodology, assumptions, and data sources', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.methodology.length).toBeGreaterThan(100);
      expect(result.assumptions.length).toBeGreaterThan(5);
      expect(result.data_sources.length).toBeGreaterThan(0);
      expect(result.generated_at).toBeDefined();
      expect(result.indication_validated).toBe(true);
    });

    it('should include CAGR and market growth driver', async () => {
      result = result ?? await calculateMarketSizing(makeInput());
      expect(result.summary.cagr_5yr).toBeTypeOf('number');
      expect(result.summary.cagr_5yr).toBeGreaterThan(0);
      expect(result.summary.market_growth_driver).toBeDefined();
      expect(result.summary.market_growth_driver.length).toBeGreaterThan(10);
    });
  });

  // ── Unknown indication ─────────────────────────────────
  describe('with an unknown indication', () => {
    it('should throw an error with a descriptive message', async () => {
      await expect(
        calculateMarketSizing(makeInput({ indication: 'Totally Fake Disease XYZ123' }))
      ).rejects.toThrow(/indication not found/i);
    });
  });

  // ── Geography filtering ─────────────────────────────────
  describe('geography filtering', () => {
    it('should return only US territory when geography is ["US"]', async () => {
      const result = await calculateMarketSizing(makeInput({ geography: ['US'] }));
      expect(result.geography_breakdown).toHaveLength(1);
    });

    it('should return multiple territories when geography includes US, EU5, Japan', async () => {
      const result = await calculateMarketSizing(
        makeInput({ geography: ['US', 'EU5', 'Japan'] })
      );
      expect(result.geography_breakdown.length).toBe(3);

      // Territories should be sorted by TAM descending
      const tamValues = result.geography_breakdown.map(g => {
        return g.tam.unit === 'B' ? g.tam.value : g.tam.value / 1000;
      });
      for (let i = 1; i < tamValues.length; i++) {
        expect(tamValues[i]).toBeLessThanOrEqual(tamValues[i - 1]);
      }
    });

    it('should produce a larger global TAM with more geographies', async () => {
      const resultNarrow = await calculateMarketSizing(makeInput({ geography: ['US'] }));
      const resultBroad = await calculateMarketSizing(
        makeInput({ geography: ['US', 'EU5', 'Japan', 'China'] })
      );

      const narrowGlobal = resultNarrow.summary.global_tam.unit === 'B'
        ? resultNarrow.summary.global_tam.value
        : resultNarrow.summary.global_tam.value / 1000;
      const broadGlobal = resultBroad.summary.global_tam.unit === 'B'
        ? resultBroad.summary.global_tam.value
        : resultBroad.summary.global_tam.value / 1000;

      expect(broadGlobal).toBeGreaterThan(narrowGlobal);
    });
  });

  // ── Development stages affect market share ──────────────
  describe('development stage differences', () => {
    it('should produce higher SOM for phase3 than preclinical', async () => {
      const preclinical = await calculateMarketSizing(
        makeInput({ development_stage: 'preclinical' })
      );
      const phase3 = await calculateMarketSizing(
        makeInput({ development_stage: 'phase3' })
      );

      const somPreclinical = preclinical.summary.som_us.unit === 'B'
        ? preclinical.summary.som_us.value
        : preclinical.summary.som_us.value / 1000;
      const somPhase3 = phase3.summary.som_us.unit === 'B'
        ? phase3.summary.som_us.value
        : phase3.summary.som_us.value / 1000;

      expect(somPhase3).toBeGreaterThan(somPreclinical);
    });

    it('should produce higher peak sales for approved than phase1', async () => {
      const phase1 = await calculateMarketSizing(makeInput({ development_stage: 'phase1' }));
      const approved = await calculateMarketSizing(makeInput({ development_stage: 'approved' }));

      expect(approved.summary.peak_sales_estimate.base).toBeGreaterThan(
        phase1.summary.peak_sales_estimate.base
      );
    });
  });

  // ── Pricing assumptions ─────────────────────────────────
  describe('pricing assumption effects', () => {
    it('should produce different output values for conservative vs premium', async () => {
      const conservative = await calculateMarketSizing(
        makeInput({ pricing_assumption: 'conservative' })
      );
      const premium = await calculateMarketSizing(
        makeInput({ pricing_assumption: 'premium' })
      );

      // Premium should produce higher TAM than conservative
      const tamC = conservative.summary.tam_us.unit === 'B'
        ? conservative.summary.tam_us.value
        : conservative.summary.tam_us.value / 1000;
      const tamP = premium.summary.tam_us.unit === 'B'
        ? premium.summary.tam_us.value
        : premium.summary.tam_us.value / 1000;

      expect(tamP).toBeGreaterThan(tamC);
    });
  });

  // ── Output structure completeness ───────────────────────
  describe('output structure completeness', () => {
    it('should have no undefined required fields', async () => {
      const result = await calculateMarketSizing(makeInput());

      // Summary
      expect(result.summary).toBeDefined();
      expect(result.summary.tam_us.value).toBeDefined();
      expect(result.summary.sam_us.value).toBeDefined();
      expect(result.summary.som_us.value).toBeDefined();
      expect(result.summary.global_tam.value).toBeDefined();
      expect(result.summary.peak_sales_estimate).toBeDefined();

      // Patient funnel: no field should be NaN
      const funnelValues = Object.values(result.patient_funnel);
      for (const val of funnelValues) {
        expect(Number.isNaN(val)).toBe(false);
      }

      // Revenue projection: no NaN values
      for (const yr of result.revenue_projection) {
        expect(Number.isNaN(yr.bear)).toBe(false);
        expect(Number.isNaN(yr.base)).toBe(false);
        expect(Number.isNaN(yr.bull)).toBe(false);
      }
    });
  });

  // ── Patient segment / addressability factor ─────────────
  describe('patient segment narrowing', () => {
    it('should return a smaller addressable population for biomarker-selected patients', async () => {
      const broad = await calculateMarketSizing(makeInput());
      const narrow = await calculateMarketSizing(
        makeInput({ patient_segment: 'EGFR mutated 2L+' })
      );

      expect(narrow.patient_funnel.addressable).toBeLessThan(broad.patient_funnel.addressable);
    });

    it('should return narrower addressable for 2L+ than 1L', async () => {
      const firstLine = await calculateMarketSizing(
        makeInput({ patient_segment: 'first-line treatment naive' })
      );
      const secondLine = await calculateMarketSizing(
        makeInput({ patient_segment: '2L relapsed refractory' })
      );

      expect(secondLine.patient_funnel.addressable).toBeLessThan(
        firstLine.patient_funnel.addressable
      );
    });
  });

  // ── Synonym resolution ──────────────────────────────────
  describe('indication synonym resolution', () => {
    it('should resolve "NSCLC" to the same output as "Non-Small Cell Lung Cancer"', async () => {
      const byName = await calculateMarketSizing(
        makeInput({ indication: 'Non-Small Cell Lung Cancer' })
      );
      const bySynonym = await calculateMarketSizing(
        makeInput({ indication: 'NSCLC' })
      );

      expect(byName.patient_funnel.us_prevalence).toBe(bySynonym.patient_funnel.us_prevalence);
    });
  });

  // ── Different therapy areas ─────────────────────────────
  describe('across different therapy areas', () => {
    it('should successfully analyze a neurology indication', async () => {
      const result = await calculateMarketSizing(
        makeInput({ indication: "Alzheimer's Disease" })
      );
      expect(result.summary.tam_us.value).toBeGreaterThan(0);
      expect(result.patient_funnel.us_prevalence).toBeGreaterThan(100000);
    });

    it('should successfully analyze a rare disease indication', async () => {
      const result = await calculateMarketSizing(
        makeInput({ indication: 'Duchenne Muscular Dystrophy' })
      );
      expect(result.summary.tam_us.value).toBeGreaterThan(0);
      // Rare disease has smaller patient population
      expect(result.patient_funnel.us_prevalence).toBeLessThan(50000);
    });
  });
});
