import { vi, describe, it, expect, beforeAll } from 'vitest';

// Keep the engines hermetic: every Supabase-backed loader degrades to "no live data".
vi.mock('@/lib/supabase/admin', () => {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  for (const m of [
    'select',
    'eq',
    'neq',
    'in',
    'ilike',
    'like',
    'or',
    'gte',
    'lte',
    'order',
    'limit',
    'range',
    'single',
    'maybeSingle',
  ]) {
    chain[m] = vi.fn(self);
  }
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);
  return { createAdminClient: vi.fn(() => ({ from: vi.fn(() => chain) })) };
});

import {
  buildDemandProfile,
  getDemandProfileCached,
  clearDemandProfileCache,
  resolveTerritory,
  supportedTerritories,
  UnknownTerritoryError,
  DEMAND_DEFAULTS,
  type DemandProfile,
} from '@/lib/demand/demand-layer';

function expectProfileShape(p: DemandProfile) {
  // identity
  expect(p.identity.terrainName).toBeTypeOf('string');
  expect(p.identity.therapyArea).toBeTypeOf('string');
  expect(Array.isArray(p.identity.icd10)).toBe(true);
  expect(['solidus_key', 'solidus_alias', 'terrain_name', 'terrain_synonym', 'terrain_fuzzy']).toContain(
    p.identity.resolvedBy,
  );

  // epidemiology
  expect(p.epidemiology.population).toBe('US');
  expect(p.epidemiology.prevalence).toBeGreaterThan(0);
  expect(p.epidemiology.diagnosisRate).toBeGreaterThan(0);
  expect(p.epidemiology.diagnosisRate).toBeLessThanOrEqual(1);
  expect(p.epidemiology.treatmentRate).toBeGreaterThan(0);
  expect(p.epidemiology.treatmentRate).toBeLessThanOrEqual(1);
  expect(p.epidemiology.diagnosed).toBe(Math.round(p.epidemiology.prevalence * p.epidemiology.diagnosisRate));
  expect(['high', 'medium', 'low']).toContain(p.epidemiology.confidence);
  expect(p.epidemiology.verifiedYear).toBeGreaterThanOrEqual(2020);
  expect(p.epidemiology.source.length).toBeGreaterThan(0);

  // market
  expect(p.market.currency).toBe('USD');
  expect(p.market.tamUs.valueUsd).toBeGreaterThan(0);
  expect(p.market.samUs.valueUsd).toBeLessThanOrEqual(p.market.tamUs.valueUsd);
  expect(p.market.somUs.valueUsd).toBeLessThanOrEqual(p.market.samUs.valueUsd);
  expect(p.market.peakSalesUsdM.low).toBeLessThanOrEqual(p.market.peakSalesUsdM.base);
  expect(p.market.peakSalesUsdM.base).toBeLessThanOrEqual(p.market.peakSalesUsdM.high);
  expect(p.market.priceBenchmark.wacAnnualUsd.conservative).toBeLessThanOrEqual(
    p.market.priceBenchmark.wacAnnualUsd.premium,
  );
  expect(p.market.priceBenchmark.grossToNet).toBeGreaterThan(0);
  expect(p.market.priceBenchmark.grossToNet).toBeLessThan(1);
  expect(p.market.cagr5yrPct).toBeTypeOf('number');
  expect(p.market.territoryBreakdown.length).toBeGreaterThan(0);
  expect(p.market.engineInputs.developmentStage).toBe(DEMAND_DEFAULTS.developmentStage);
  expect(p.market.patientFunnel.us_prevalence).toBe(p.epidemiology.prevalence);

  // competition
  expect(p.competition.densityScore).toBeGreaterThanOrEqual(1);
  expect(p.competition.densityScore).toBeLessThanOrEqual(10);
  expect(['Low', 'Moderate', 'High', 'Extremely High']).toContain(p.competition.densityLabel);
  expect(p.competition.countsByPhase.total).toBeGreaterThanOrEqual(
    p.competition.countsByPhase.approved + p.competition.countsByPhase.phase3,
  );
  expect(Array.isArray(p.competition.referenceMechanisms)).toBe(true);
  expect(p.competition.keyPrograms.length).toBeLessThanOrEqual(DEMAND_DEFAULTS.keyProgramLimit);
  expect(Array.isArray(p.competition.whiteSpace)).toBe(true);
  expect(p.competition.majorCompetitors.length).toBeGreaterThan(0);

  // regulatory
  expect(Array.isArray(p.regulatory.validatedSurrogates)).toBe(true);
  expect(p.regulatory.pathwayNotes.length).toBeGreaterThanOrEqual(2);
  expect(p.regulatory.crlRecovery.historicalCrlRatePct).toBeGreaterThan(0);
  for (const stage of ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'] as const) {
    expect(p.regulatory.likelihoodOfApproval[stage]).toBeGreaterThan(0);
    expect(p.regulatory.likelihoodOfApproval[stage]).toBeLessThanOrEqual(1);
  }
  expect(p.regulatory.likelihoodOfApproval.phase3).toBeGreaterThanOrEqual(p.regulatory.likelihoodOfApproval.phase1);

  // provenance
  expect(p.assumptions.length).toBeGreaterThanOrEqual(5);
  expect(p.assumptions.some((a) => a.includes('development_stage defaulted'))).toBe(true);
  expect(p.sources.length).toBeGreaterThan(5);
  for (const s of p.sources) {
    expect(s.field.length).toBeGreaterThan(0);
    expect(s.origin.length).toBeGreaterThan(0);
    expect(['terrain_static', 'terrain_engine', 'terrain_live', 'terrain_reference']).toContain(s.kind);
  }
  expect(p.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(p.generatedAt.startsWith(p.asOf)).toBe(true);
  expect(p.contractVersion).toBe('1.0');
}

describe('buildDemandProfile', () => {
  let alz: DemandProfile;
  let nsclc: DemandProfile;

  beforeAll(async () => {
    clearDemandProfileCache();
    alz = (await buildDemandProfile('alzheimers'))!;
    nsclc = (await buildDemandProfile('lung_nsclc'))!;
  }, 60_000);

  it("builds a complete profile for alzheimers (Solidus slug → Alzheimer's Disease)", () => {
    expect(alz).toBeDefined();
    expect(alz.identity.solidusKey).toBe('alzheimers');
    expect(alz.identity.terrainName).toBe("Alzheimer's Disease");
    expect(alz.identity.therapyArea).toBe('neurology');
    expect(alz.identity.icd10.length).toBeGreaterThan(0);
    expectProfileShape(alz);
    expect(alz.regulatory.orphanEligible).toBe(false);
    expect(alz.competition.referenceMechanisms).toContain('anti_amyloid');
  });

  it('builds a complete profile for lung_nsclc', () => {
    expect(nsclc.identity.solidusKey).toBe('lung_nsclc');
    expect(nsclc.identity.therapyArea).toBe('oncology');
    expectProfileShape(nsclc);
    expect(nsclc.regulatory.validatedSurrogates.some((s) => /Overall Response Rate/.test(s.endpoint))).toBe(true);
    expect(nsclc.competition.countsByPhase.approved).toBeGreaterThan(0);
    expect(nsclc.competition.keyPrograms[0]?.phase).toBe('Approved');
  });

  it('returns undefined for an unmapped Solidus key', async () => {
    expect(await buildDemandProfile('thymoma')).toBeUndefined();
  });

  it('flags a requested asOf that Terrain cannot serve', async () => {
    const p = await buildDemandProfile('alzheimers', { asOf: '2020-01-01' });
    expect(p?.assumptions.some((a) => a.includes('asOf 2020-01-01'))).toBe(true);
  });

  it('accepts a Solidus territory code and reports the breakdown for it', async () => {
    const p = (await buildDemandProfile('alzheimers', { territory: 'europe' }))!;
    expect(p.market.territory.geographies).toEqual(['EU5']);
    expect(p.market.territoryBreakdown.map((t) => t.code)).toEqual(['EU5']);
    expect(p.market.territoryBreakdown[0].territory).toMatch(/EU5/);
    expect(p.market.tamRequestedTerritory.valueUsd).toBeLessThan(p.market.tamUs.valueUsd);
    // US headline figures do not change with territory
    expect(p.market.tamUs.valueUsd).toBe(alz.market.tamUs.valueUsd);
  }, 60_000);

  it('throws UnknownTerritoryError for an unsupported territory', async () => {
    await expect(buildDemandProfile('alzheimers', { territory: 'mars' })).rejects.toBeInstanceOf(UnknownTerritoryError);
  });
});

describe('getDemandProfileCached', () => {
  it('memoises per indication + territory for the TTL', async () => {
    clearDemandProfileCache();
    const first = await getDemandProfileCached('nashMash');
    const second = await getDemandProfileCached('NASH'); // synonym → same Terrain indication
    expect(first?.cacheHit).toBe(false);
    expect(second?.cacheHit).toBe(true);
    expect(second?.profile.identity.solidusKey).toBe('nashMash');
    expect(second?.profile.generatedAt).toBe(first?.profile.generatedAt);
  }, 60_000);

  it('annotates a mismatched asOf on a cache hit without mutating the cached object', async () => {
    const hit = await getDemandProfileCached('nashMash', { asOf: '2019-06-01' });
    expect(hit?.cacheHit).toBe(true);
    expect(hit?.profile.assumptions.some((a) => a.includes('asOf 2019-06-01'))).toBe(true);
    const clean = await getDemandProfileCached('nashMash');
    expect(clean?.profile.assumptions.some((a) => a.includes('asOf 2019-06-01'))).toBe(false);
  });
});

describe('resolveTerritory', () => {
  it('defaults to US', () => {
    expect(resolveTerritory()).toEqual({ requested: 'US', geographies: ['US'] });
  });
  it('accepts Terrain codes case-insensitively and Solidus aliases', () => {
    expect(resolveTerritory('japan').geographies).toEqual(['Japan']);
    expect(resolveTerritory('EU5').geographies).toEqual(['EU5']);
    expect(resolveTerritory('us_eu').geographies).toEqual(['US', 'EU5']);
    expect(resolveTerritory('ex_us').geographies).toContain('RoW');
    expect(resolveTerritory('Global').geographies).toEqual(['Global']);
  });
  it('lists every supported territory', () => {
    const t = supportedTerritories();
    expect(t).toContain('US');
    expect(t).toContain('us_only');
    expect(t).toContain('Global');
  });
});
