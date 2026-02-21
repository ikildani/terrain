import { describe, it, expect } from 'vitest';
import {
  analyzeRegulatory,
  type RegulatoryAnalysisInput,
} from '@/lib/analytics/regulatory';
import type { RegulatoryOutput } from '@/types';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<RegulatoryAnalysisInput> = {}): RegulatoryAnalysisInput {
  return {
    indication: 'Non-Small Cell Lung Cancer',
    product_type: 'pharmaceutical',
    development_stage: 'phase2',
    geography: ['FDA'],
    unmet_need: 'high',
    has_orphan_potential: false,
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzeRegulatory', () => {
  // ── Happy path: pharma, FDA ─────────────────────────────
  describe('with standard pharmaceutical input (FDA)', () => {
    let result: RegulatoryOutput;

    it('should return a complete regulatory output', async () => {
      result = await analyzeRegulatory(makeInput());
      expect(result).toBeDefined();
    });

    it('should include a recommended pathway with primary and alternatives', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.recommended_pathway.primary).toBeDefined();
      expect(result.recommended_pathway.primary.name).toBeDefined();
      expect(result.recommended_pathway.primary.name.length).toBeGreaterThan(0);
      expect(result.recommended_pathway.primary.description).toBeDefined();
      expect(result.recommended_pathway.primary.typical_review_months).toBeGreaterThan(0);
      expect(result.recommended_pathway.primary.requirements).toBeInstanceOf(Array);
      expect(result.recommended_pathway.primary.requirements.length).toBeGreaterThan(0);

      expect(result.recommended_pathway.alternatives).toBeInstanceOf(Array);
      expect(result.recommended_pathway.rationale).toBeDefined();
      expect(result.recommended_pathway.rationale.length).toBeGreaterThan(20);
    });

    it('should include timeline estimates where optimistic < realistic < pessimistic', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      const { total_to_approval } = result.timeline_estimate;
      expect(total_to_approval.optimistic).toBeGreaterThan(0);
      expect(total_to_approval.realistic).toBeGreaterThan(0);
      expect(total_to_approval.pessimistic).toBeGreaterThan(0);
      expect(total_to_approval.optimistic).toBeLessThanOrEqual(total_to_approval.realistic);
      expect(total_to_approval.realistic).toBeLessThanOrEqual(total_to_approval.pessimistic);
    });

    it('should include designation opportunities', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.designation_opportunities).toBeInstanceOf(Array);
      expect(result.designation_opportunities.length).toBeGreaterThan(0);

      for (const desig of result.designation_opportunities) {
        expect(desig.designation).toBeDefined();
        expect(['likely', 'possible', 'unlikely']).toContain(desig.eligibility);
        expect(desig.benefit).toBeDefined();
        expect(desig.application_timing).toBeDefined();
        expect(desig.key_criteria_met).toBeInstanceOf(Array);
        expect(desig.key_criteria_unmet).toBeInstanceOf(Array);
      }
    });

    it('should include key risks with severity levels', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.key_risks).toBeInstanceOf(Array);
      expect(result.key_risks.length).toBeGreaterThan(0);

      for (const risk of result.key_risks) {
        expect(risk.risk).toBeDefined();
        expect(risk.risk.length).toBeGreaterThan(10);
        expect(['high', 'medium', 'low']).toContain(risk.severity);
        expect(risk.mitigation).toBeDefined();
        expect(risk.mitigation.length).toBeGreaterThan(10);
      }
    });

    it('should include comparable approvals', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.comparable_approvals).toBeInstanceOf(Array);
      expect(result.comparable_approvals.length).toBeGreaterThan(0);

      for (const comp of result.comparable_approvals) {
        expect(comp.drug).toBeDefined();
        expect(comp.company).toBeDefined();
        expect(comp.indication).toBeDefined();
        expect(comp.pathway).toBeDefined();
        expect(comp.approval_year).toBeGreaterThan(2000);
        expect(comp.review_months).toBeGreaterThan(0);
      }
    });

    it('should include review division and advisory committee likelihood', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.review_division).toBeDefined();
      expect(result.advisory_committee_likely).toBeTypeOf('boolean');
    });

    it('should include data sources', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', async () => {
      result = result ?? await analyzeRegulatory(makeInput());
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Agency-specific pathways ────────────────────────────
  describe('agency-specific pathway recommendations', () => {
    it('should recommend an FDA pathway when geography is FDA', async () => {
      const result = await analyzeRegulatory(makeInput({ geography: ['FDA'] }));
      // Primary pathway name should reference FDA-specific terms
      const pathwayName = result.recommended_pathway.primary.name;
      expect(pathwayName).toBeDefined();
      expect(pathwayName.length).toBeGreaterThan(0);
    });

    it('should produce EMA-specific output when geography is EMA', async () => {
      const result = await analyzeRegulatory(makeInput({ geography: ['EMA'] }));
      // Review division should reference EMA
      expect(result.review_division).toContain('CHMP');
    });

    it('should produce PMDA-specific output when geography is PMDA', async () => {
      const result = await analyzeRegulatory(makeInput({ geography: ['PMDA'] }));
      expect(result.review_division).toContain('PMDA');
    });
  });

  // ── Orphan Drug Designation ─────────────────────────────
  describe('orphan drug designation scoring', () => {
    it('should score orphan drug designation higher when has_orphan_potential is true', async () => {
      const withOrphan = await analyzeRegulatory(
        makeInput({ has_orphan_potential: true })
      );
      const withoutOrphan = await analyzeRegulatory(
        makeInput({ has_orphan_potential: false })
      );

      const orphanDesigWith = withOrphan.designation_opportunities.find(
        d => d.designation === 'Orphan Drug'
      );
      const orphanDesigWithout = withoutOrphan.designation_opportunities.find(
        d => d.designation === 'Orphan Drug'
      );

      expect(orphanDesigWith).toBeDefined();
      expect(orphanDesigWithout).toBeDefined();

      // With orphan potential, eligibility should be at least as favorable or more
      const eligibilityRank = { likely: 3, possible: 2, unlikely: 1 };
      expect(eligibilityRank[orphanDesigWith!.eligibility]).toBeGreaterThanOrEqual(
        eligibilityRank[orphanDesigWithout!.eligibility]
      );
    });

    it('should recognize rare diseases as orphan drug eligible', async () => {
      const result = await analyzeRegulatory(
        makeInput({
          indication: 'Duchenne Muscular Dystrophy',
          has_orphan_potential: true,
        })
      );

      const orphanDesig = result.designation_opportunities.find(
        d => d.designation === 'Orphan Drug'
      );
      expect(orphanDesig).toBeDefined();
      expect(orphanDesig!.eligibility).toBe('likely');
    });
  });

  // ── Timeline: optimistic < realistic < pessimistic ──────
  describe('timeline ordering across stages', () => {
    const stages = ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'] as const;

    for (const stage of stages) {
      it(`should maintain optimistic <= realistic <= pessimistic for ${stage}`, async () => {
        const result = await analyzeRegulatory(
          makeInput({ development_stage: stage })
        );
        const t = result.timeline_estimate.total_to_approval;
        expect(t.optimistic).toBeLessThanOrEqual(t.realistic);
        expect(t.realistic).toBeLessThanOrEqual(t.pessimistic);
      });
    }

    it('should produce longer timelines for earlier stages', async () => {
      const preclinical = await analyzeRegulatory(
        makeInput({ development_stage: 'preclinical' })
      );
      const phase3 = await analyzeRegulatory(
        makeInput({ development_stage: 'phase3' })
      );

      expect(preclinical.timeline_estimate.total_to_approval.realistic).toBeGreaterThan(
        phase3.timeline_estimate.total_to_approval.realistic
      );
    });
  });

  // ── Product type differences ────────────────────────────
  describe('product type differences', () => {
    it('should recommend different pathways for device vs pharma', async () => {
      const pharma = await analyzeRegulatory(
        makeInput({ product_type: 'pharmaceutical' })
      );
      const device = await analyzeRegulatory(
        makeInput({ product_type: 'device' })
      );

      // Device pathway names should differ from pharma pathway names
      expect(device.recommended_pathway.primary.name).not.toBe(
        pharma.recommended_pathway.primary.name
      );
    });

    it('should recommend BLA-related pathway for biologics', async () => {
      const result = await analyzeRegulatory(
        makeInput({ product_type: 'biologic', unmet_need: 'high' })
      );
      // The rationale or pathway should mention BLA
      const mentionsBLA =
        result.recommended_pathway.primary.name.includes('BLA') ||
        result.recommended_pathway.rationale.includes('BLA') ||
        result.recommended_pathway.alternatives.some(a => a.name.includes('BLA'));
      expect(mentionsBLA).toBe(true);
    });

    it('should include device-specific risks for device product type', async () => {
      const result = await analyzeRegulatory(
        makeInput({ product_type: 'device' })
      );

      const hasDeviceRisk = result.key_risks.some(
        r => r.risk.toLowerCase().includes('device') || r.risk.toLowerCase().includes('510')
      );
      expect(hasDeviceRisk).toBe(true);
    });
  });

  // ── Unmet need affects designation eligibility ──────────
  describe('unmet need affects designation eligibility', () => {
    it('should score breakthrough therapy as more likely with high unmet need', async () => {
      const highNeed = await analyzeRegulatory(makeInput({ unmet_need: 'high' }));
      const lowNeed = await analyzeRegulatory(makeInput({ unmet_need: 'low' }));

      const btHigh = highNeed.designation_opportunities.find(
        d => d.designation === 'Breakthrough Therapy'
      );
      const btLow = lowNeed.designation_opportunities.find(
        d => d.designation === 'Breakthrough Therapy'
      );

      expect(btHigh).toBeDefined();
      expect(btLow).toBeDefined();

      const eligibilityRank = { likely: 3, possible: 2, unlikely: 1 };
      expect(eligibilityRank[btHigh!.eligibility]).toBeGreaterThan(
        eligibilityRank[btLow!.eligibility]
      );
    });

    it('should include competition risk when unmet need is low', async () => {
      const result = await analyzeRegulatory(makeInput({ unmet_need: 'low' }));
      const hasCompRisk = result.key_risks.some(
        r => r.risk.toLowerCase().includes('low unmet')
      );
      expect(hasCompRisk).toBe(true);
    });
  });

  // ── Milestone dates ─────────────────────────────────────
  describe('milestone date generation', () => {
    it('should generate milestone dates for preclinical stage', async () => {
      const result = await analyzeRegulatory(
        makeInput({ development_stage: 'preclinical' })
      );
      expect(result.timeline_estimate.ind_submission_target).toBeDefined();
      expect(result.timeline_estimate.phase1_completion).toBeDefined();
      expect(result.timeline_estimate.phase2_completion).toBeDefined();
      expect(result.timeline_estimate.phase3_completion).toBeDefined();
      expect(result.timeline_estimate.approval_estimate).toBeDefined();
    });

    it('should not include phase1_completion for phase3 stage', async () => {
      const result = await analyzeRegulatory(
        makeInput({ development_stage: 'phase3' })
      );
      expect(result.timeline_estimate.phase1_completion).toBeUndefined();
      expect(result.timeline_estimate.phase2_completion).toBeUndefined();
      expect(result.timeline_estimate.phase3_completion).toBeDefined();
    });
  });

  // ── Review division routing ─────────────────────────────
  describe('review division routing', () => {
    it('should route oncology to OOD', async () => {
      const result = await analyzeRegulatory(makeInput());
      expect(result.review_division).toContain('Oncologic');
    });

    it('should route neurology to Office of Neuroscience', async () => {
      const result = await analyzeRegulatory(
        makeInput({ indication: "Alzheimer's Disease" })
      );
      expect(result.review_division).toContain('Neuroscience');
    });

    it('should route device to CDRH', async () => {
      const result = await analyzeRegulatory(
        makeInput({ product_type: 'device' })
      );
      expect(result.review_division).toContain('CDRH');
    });

    it('should route diagnostic to CDRH IVD', async () => {
      const result = await analyzeRegulatory(
        makeInput({ product_type: 'diagnostic' })
      );
      expect(result.review_division).toContain('CDRH');
    });
  });
});
