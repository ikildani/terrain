import { describe, it, expect } from 'vitest';
import { analyzeDeviceCompetitiveLandscape } from '@/lib/analytics/device-competitive';
import type {
  DeviceCompetitiveLandscapeInput,
  DeviceCompetitiveLandscapeOutput,
  DeviceCompetitor,
} from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<DeviceCompetitiveLandscapeInput> = {}): DeviceCompetitiveLandscapeInput {
  return {
    procedure_or_condition: 'TAVR',
    device_category: 'cardiovascular',
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// TESTS
// ────────────────────────────────────────────────────────────

describe('analyzeDeviceCompetitiveLandscape', () => {
  // ── Happy path: TAVR (known, competitive procedure) ──────
  describe('with TAVR (known cardiovascular procedure)', () => {
    let result: DeviceCompetitiveLandscapeOutput;

    it('should return a valid device competitive landscape output', () => {
      result = analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result).toBeDefined();
    });

    it('should include a summary with crowding score between 1 and 10', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.summary.crowding_score).toBeLessThanOrEqual(10);
    });

    it('should have a valid crowding label', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(result.summary.crowding_label);
    });

    it('should return cleared/approved devices with required fields', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());

      const allDevices: DeviceCompetitor[] = [...result.cleared_approved_devices, ...result.pipeline_devices];

      expect(allDevices.length).toBeGreaterThan(0);

      for (const device of allDevices) {
        expect(device.company).toBeDefined();
        expect(device.company.length).toBeGreaterThan(0);
        expect(device.device_name).toBeDefined();
        expect(device.device_name.length).toBeGreaterThan(0);
        expect(device.regulatory_status).toBeDefined();
        expect(device.differentiation_score).toBeGreaterThanOrEqual(1);
        expect(device.differentiation_score).toBeLessThanOrEqual(10);
      }
    });

    it('should have cleared/approved devices for a well-known procedure', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.cleared_approved_devices.length).toBeGreaterThan(0);
    });

    it('should include a technology landscape', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.technology_landscape).toBeInstanceOf(Array);
      expect(result.technology_landscape.length).toBeGreaterThan(0);
    });

    it('should include a market share distribution with HHI', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.market_share_distribution).toBeDefined();
      expect(result.market_share_distribution.hhi_index).toBeGreaterThanOrEqual(0);
      expect(result.market_share_distribution.competitors).toBeInstanceOf(Array);
      expect(['Monopolistic', 'Highly Concentrated', 'Moderately Concentrated', 'Fragmented']).toContain(
        result.market_share_distribution.concentration_label,
      );
    });

    it('should include switching cost analysis', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.switching_cost_analysis).toBeInstanceOf(Array);
    });

    it('should include a comparison matrix', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.comparison_matrix).toBeInstanceOf(Array);
      expect(result.comparison_matrix.length).toBeGreaterThan(0);

      for (const attr of result.comparison_matrix) {
        expect(attr.attribute).toBeDefined();
        expect(attr.competitors).toBeDefined();
        expect(typeof attr.competitors).toBe('object');
      }
    });

    it('should include white space opportunities', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.summary.white_space).toBeInstanceOf(Array);
    });

    it('should include key insight narrative', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.summary.key_insight).toBeDefined();
      expect(result.summary.key_insight.length).toBeGreaterThan(20);
    });

    it('should include technology evolution stage', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.summary.technology_evolution_stage).toBeDefined();
      expect(result.summary.technology_evolution_stage.length).toBeGreaterThan(0);
    });

    it('should include data sources', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.data_sources).toBeInstanceOf(Array);
      expect(result.data_sources.length).toBeGreaterThan(0);
    });

    it('should include generated_at timestamp', () => {
      result = result ?? analyzeDeviceCompetitiveLandscape(makeInput());
      expect(result.generated_at).toBeDefined();
      expect(new Date(result.generated_at).getTime()).not.toBeNaN();
    });
  });

  // ── Unknown procedure ────────────────────────────────────
  describe('with an unknown procedure', () => {
    it('should return a valid structure for an unrecognized procedure', () => {
      const result = analyzeDeviceCompetitiveLandscape(
        makeInput({ procedure_or_condition: 'Totally Unknown Procedure XYZ999' }),
      );

      // The engine may return competitors via fuzzy matching or fall back to empty
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
      expect(result.summary.crowding_score).toBeLessThanOrEqual(10);
      expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(result.summary.crowding_label);
      expect(result.generated_at).toBeDefined();
    });

    it('should include white space for unknown procedures', () => {
      const result = analyzeDeviceCompetitiveLandscape(
        makeInput({ procedure_or_condition: 'Nonexistent Procedure ABC' }),
      );

      expect(result.summary.white_space).toBeInstanceOf(Array);
      expect(result.summary.white_space.length).toBeGreaterThan(0);
    });
  });

  // ── Alias resolution ─────────────────────────────────────
  describe('procedure alias resolution', () => {
    it('should resolve TAVR and TAVI to the same competitive set', () => {
      const tavr = analyzeDeviceCompetitiveLandscape(makeInput({ procedure_or_condition: 'TAVR' }));
      const tavi = analyzeDeviceCompetitiveLandscape(makeInput({ procedure_or_condition: 'TAVI' }));

      expect(tavr.cleared_approved_devices.length).toBe(tavi.cleared_approved_devices.length);
    });
  });

  // ── Different device categories ──────────────────────────
  describe('across different device categories', () => {
    it('should analyze a neurology device procedure (DBS)', () => {
      const result = analyzeDeviceCompetitiveLandscape(
        makeInput({
          procedure_or_condition: 'deep brain stimulation',
          device_category: 'neurology',
        }),
      );
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });

    it('should analyze an orthopedic procedure (Total Knee)', () => {
      const result = analyzeDeviceCompetitiveLandscape(
        makeInput({
          procedure_or_condition: 'total knee arthroplasty',
          device_category: 'orthopedic',
        }),
      );
      expect(result.summary).toBeDefined();
      expect(result.summary.crowding_score).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Evidence strength scores ─────────────────────────────
  describe('evidence strength scoring', () => {
    it('should assign evidence_strength between 1 and 10 for all devices', () => {
      const result = analyzeDeviceCompetitiveLandscape(makeInput());
      const allDevices = [...result.cleared_approved_devices, ...result.pipeline_devices];

      for (const device of allDevices) {
        expect(device.evidence_strength).toBeGreaterThanOrEqual(1);
        expect(device.evidence_strength).toBeLessThanOrEqual(10);
      }
    });
  });
});
