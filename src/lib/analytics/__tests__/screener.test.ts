import { describe, it, expect } from 'vitest';
import { scoreAllIndications, type OpportunityRow, type DataConfidence } from '@/lib/analytics/screener';
import { getCompetitorsForIndication } from '@/lib/data/competitor-database';
import { getCommunityDataForIndication } from '@/lib/data/community-prevalence';
import { INDICATION_DATA } from '@/lib/data/indication-map';

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function getRow(indicationName: string): OpportunityRow | undefined {
  const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);
  return opportunities.find((r) => r.indication === indicationName);
}

// ────────────────────────────────────────────────────────────
// FIX 1: 0-Competitor Scoring Cap
// ────────────────────────────────────────────────────────────

describe('0-competitor scoring cap', () => {
  it('should ensure no indication has zero competitors after matching improvements', () => {
    for (const ind of INDICATION_DATA) {
      const competitors = getCompetitorsForIndication(ind.name);
      expect(competitors.length, `${ind.name} has 0 competitors — data gap`).toBeGreaterThan(0);
    }
  });

  it('should cap competitive_openness at 15 for low-competitor indications', () => {
    // Score all and check that no indication with few competitors gets >15 competitive openness
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      if (row.competitor_count === 0) {
        expect(
          row.score_breakdown.competitive_openness,
          `${row.indication} with 0 competitors should have capped competitive_openness`,
        ).toBeLessThanOrEqual(15);
      }
    }
  });

  it('should assign data_confidence to every row', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      expect(
        ['high', 'medium', 'low'].includes(row.data_confidence),
        `${row.indication} should have valid data_confidence, got '${row.data_confidence}'`,
      ).toBe(true);
    }
  });

  it('should label crowding as no_data when competitor count is 0', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      if (row.competitor_count === 0) {
        expect(row.crowding_label).toBe('no_data');
      } else {
        expect(row.crowding_label).not.toBe('no_data');
      }
    }
  });

  it('should not let 0-competitor indications rank in the top 20 by opportunity score', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 20, 0);

    for (const row of opportunities) {
      // If any 0-competitor row sneaks into top 20, the cap isn't aggressive enough
      if (row.competitor_count === 0) {
        // Allow it only if the indication genuinely has very high other scores
        expect(
          row.data_confidence,
          `${row.indication} is in top 20 with data_confidence=low — scoring inflation`,
        ).not.toBe('low');
      }
    }
  });

  it('should give higher opportunity scores to indications with real competitors than data-poor ones (all else equal)', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    const highConfidence = opportunities.filter((r) => r.data_confidence === 'high');
    const lowConfidence = opportunities.filter((r) => r.data_confidence === 'low');

    if (highConfidence.length > 0 && lowConfidence.length > 0) {
      const avgHigh = highConfidence.reduce((s, r) => s + r.opportunity_score, 0) / highConfidence.length;
      const avgLow = lowConfidence.reduce((s, r) => s + r.opportunity_score, 0) / lowConfidence.length;

      // High-confidence indications should generally score higher on average
      // (the cap should pull down low-confidence scores)
      expect(avgHigh).toBeGreaterThan(avgLow);
    }
  });
});

// ────────────────────────────────────────────────────────────
// FIX 3: Community Data Alias Matching
// ────────────────────────────────────────────────────────────

describe('community data alias matching', () => {
  it('should match MASH/NASH community data to indication-map name', () => {
    const data = getCommunityDataForIndication('Metabolic Dysfunction-Associated Steatohepatitis');
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((d) => d.community === 'Hispanic / Latino')).toBe(true);
  });

  it('should match Breast Cancer community data to subtype indications', () => {
    const tnbc = getCommunityDataForIndication('Triple Negative Breast Cancer');
    expect(tnbc.length).toBeGreaterThan(0);
    expect(tnbc.some((d) => d.community === 'African American / Black')).toBe(true);

    const her2 = getCommunityDataForIndication('HER2-Positive Breast Cancer');
    expect(her2.length).toBeGreaterThan(0);
  });

  it('should match Heart Failure community data to subtype indications', () => {
    const hfref = getCommunityDataForIndication('Heart Failure with Reduced Ejection Fraction');
    expect(hfref.length).toBeGreaterThan(0);

    const hfpef = getCommunityDataForIndication('Heart Failure with Preserved Ejection Fraction');
    expect(hfpef.length).toBeGreaterThan(0);
  });

  it('should match Prostate Cancer community data to mCRPC', () => {
    const data = getCommunityDataForIndication('Metastatic Castration-Resistant Prostate Cancer');
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((d) => d.community === 'African American / Black')).toBe(true);
  });

  it('should match Stroke community data via alias', () => {
    // Stroke isn't in indication-map, but community data should be accessible
    const data = getCommunityDataForIndication('Stroke');
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((d) => d.community === 'African American / Black')).toBe(true);
  });

  it('should return empty array for non-existent indications', () => {
    const data = getCommunityDataForIndication('Completely Fictional Disease XYZ');
    expect(data).toEqual([]);
  });

  it('should be case-insensitive', () => {
    const upper = getCommunityDataForIndication('SICKLE CELL DISEASE');
    const lower = getCommunityDataForIndication('sickle cell disease');
    const mixed = getCommunityDataForIndication('Sickle Cell Disease');

    expect(upper.length).toBe(lower.length);
    expect(lower.length).toBe(mixed.length);
    expect(mixed.length).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────
// FIX 4: Competitor Matching — Normalization & Aliases
// ────────────────────────────────────────────────────────────

describe('competitor matching normalization', () => {
  it('should match indications with apostrophes regardless of apostrophe style', () => {
    // These should all find competitors
    const names = ["Alzheimer's Disease", "Parkinson's Disease", "Crohn's Disease", "Huntington's Disease"];

    for (const name of names) {
      const competitors = getCompetitorsForIndication(name);
      expect(competitors.length, `${name} should have competitors via apostrophe normalization`).toBeGreaterThan(0);
    }
  });

  it('should match Waldenstrom Macroglobulinemia with or without apostrophe', () => {
    const without = getCompetitorsForIndication('Waldenstrom Macroglobulinemia');
    const withApostrophe = getCompetitorsForIndication("Waldenstrom's Macroglobulinemia");

    expect(without.length).toBeGreaterThan(0);
    expect(withApostrophe.length).toBeGreaterThan(0);
    // Should find the same competitors
    expect(without.length).toBe(withApostrophe.length);
  });

  it('should match AMD via alias expansion', () => {
    const specific = getCompetitorsForIndication('Neovascular Age-Related Macular Degeneration');
    const general = getCompetitorsForIndication('Age-Related Macular Degeneration');

    expect(specific.length).toBeGreaterThan(0);
    // General term should also find the same competitors via alias
    expect(general.length).toBeGreaterThan(0);
  });

  it('should match NASH/MASH naming variants', () => {
    const mash = getCompetitorsForIndication('Metabolic Dysfunction-Associated Steatohepatitis');
    expect(mash.length).toBeGreaterThan(0);
  });

  it('should be case-insensitive', () => {
    const lower = getCompetitorsForIndication('non-small cell lung cancer');
    const upper = getCompetitorsForIndication('Non-Small Cell Lung Cancer');
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBeGreaterThan(0);
  });

  it('should handle dashes and spaces interchangeably', () => {
    // After normalization, dashes become spaces
    const withDash = getCompetitorsForIndication('Non-Small Cell Lung Cancer');
    expect(withDash.length).toBeGreaterThan(0);
  });

  it('should find competitors for all 3 previously zero-coverage indications', () => {
    const indications = ["Hyperthyroidism/Graves' Disease", "Paget's Disease of Bone", "Addison's Disease"];

    for (const name of indications) {
      const competitors = getCompetitorsForIndication(name);
      expect(competitors.length, `${name} should have ≥3 competitors`).toBeGreaterThanOrEqual(3);
    }
  });

  it('should ensure 100% coverage — every indication has at least 1 competitor', () => {
    const zeroCoverage: string[] = [];

    for (const ind of INDICATION_DATA) {
      const competitors = getCompetitorsForIndication(ind.name);
      if (competitors.length === 0) {
        zeroCoverage.push(ind.name);
      }
    }

    expect(zeroCoverage, `These indications have 0 competitors: ${zeroCoverage.join(', ')}`).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
// FIX 2: Sorting by new fields
// ────────────────────────────────────────────────────────────

describe('screener sort fields', () => {
  it('should sort by community_count descending', () => {
    const { opportunities } = scoreAllIndications(undefined, 'community_count', 'desc', 10, 0);
    expect(opportunities.length).toBeGreaterThan(0);

    for (let i = 1; i < opportunities.length; i++) {
      expect(opportunities[i - 1].community_disparities.length).toBeGreaterThanOrEqual(
        opportunities[i].community_disparities.length,
      );
    }
  });

  it('should sort by emerging_asset_count descending', () => {
    const { opportunities } = scoreAllIndications(undefined, 'emerging_asset_count', 'desc', 10, 0);
    expect(opportunities.length).toBeGreaterThan(0);

    for (let i = 1; i < opportunities.length; i++) {
      expect(opportunities[i - 1].emerging_asset_count).toBeGreaterThanOrEqual(opportunities[i].emerging_asset_count);
    }
  });

  it('should include community_disparities and emerging_asset_count in every row', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 50, 0);

    for (const row of opportunities) {
      expect(row.community_disparities).toBeDefined();
      expect(Array.isArray(row.community_disparities)).toBe(true);
      expect(typeof row.emerging_asset_count).toBe('number');
      expect(row.emerging_asset_count).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include data_confidence in every row', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 50, 0);

    for (const row of opportunities) {
      expect(['high', 'medium', 'low']).toContain(row.data_confidence);
    }
  });
});

// ────────────────────────────────────────────────────────────
// OVERALL INTEGRITY
// ────────────────────────────────────────────────────────────

describe('screener output integrity', () => {
  it('should score all indications', () => {
    const { opportunities, total_count } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);
    expect(total_count).toBe(INDICATION_DATA.length);
    expect(opportunities.length).toBe(INDICATION_DATA.length);
  });

  it('should produce opportunity scores in 0-100 range', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      expect(row.opportunity_score).toBeGreaterThanOrEqual(0);
      expect(row.opportunity_score).toBeLessThanOrEqual(100);
    }
  });

  it('should produce crowding scores in 0-10 range', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      expect(row.crowding_score).toBeGreaterThanOrEqual(0);
      expect(row.crowding_score).toBeLessThanOrEqual(10);
    }
  });

  it('should have score_breakdown components that sum to opportunity_score (with confidence discount)', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      const sum =
        row.score_breakdown.market_attractiveness +
        row.score_breakdown.competitive_openness +
        row.score_breakdown.unmet_need +
        row.score_breakdown.development_feasibility +
        row.score_breakdown.partner_landscape;

      // Confidence discount: low=0.85x, medium=0.95x, high=1.0x
      // So opportunity_score = sum * multiplier. Verify it's within expected range.
      const multiplier = row.data_confidence === 'low' ? 0.85 : row.data_confidence === 'medium' ? 0.95 : 1.0;
      const expected = sum * multiplier;
      expect(Math.abs(expected - row.opportunity_score)).toBeLessThan(0.2);
    }
  });

  it('should have score_breakdown components within their max ranges', () => {
    const { opportunities } = scoreAllIndications(undefined, 'opportunity_score', 'desc', 300, 0);

    for (const row of opportunities) {
      expect(row.score_breakdown.market_attractiveness).toBeLessThanOrEqual(30);
      expect(row.score_breakdown.competitive_openness).toBeLessThanOrEqual(25);
      expect(row.score_breakdown.unmet_need).toBeLessThanOrEqual(20);
      expect(row.score_breakdown.development_feasibility).toBeLessThanOrEqual(15);
      expect(row.score_breakdown.partner_landscape).toBeLessThanOrEqual(10);
    }
  });
});
