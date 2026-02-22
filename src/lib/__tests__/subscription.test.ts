import { describe, it, expect } from 'vitest';
import {
  PLAN_LIMITS,
  hasFeatureAccess,
  getFeatureLimit,
  isUnlimited,
  PLAN_DISPLAY,
  type PlanKey,
  type FeatureKey,
} from '@/lib/subscription';

// ────────────────────────────────────────────────────────────
// Integration tests for the subscription module.
//
// The existing usage.test.ts in analytics/__tests__ covers
// plan limit values, hasFeatureAccess, getFeatureLimit, and
// isUnlimited in detail. This file focuses on:
//
// 1. PLAN_DISPLAY constants (not covered elsewhere)
// 2. STRIPE_PRICES existence (imported at module level)
// 3. Cross-plan consistency and structural invariants
// 4. Edge cases in the helper functions
// ────────────────────────────────────────────────────────────

describe('PLAN_LIMITS structural invariants', () => {
  const planKeys: PlanKey[] = ['free', 'pro', 'team'];

  it('should have exactly three plans: free, pro, team', () => {
    expect(Object.keys(PLAN_LIMITS)).toHaveLength(3);
    expect(Object.keys(PLAN_LIMITS).sort()).toEqual(['free', 'pro', 'team']);
  });

  it('every plan should have market_sizing, competitive, partners, regulatory, reports_saved features', () => {
    const requiredFeatures: FeatureKey[] = [
      'market_sizing',
      'competitive',
      'partners',
      'regulatory',
      'reports_saved',
    ];

    for (const plan of planKeys) {
      for (const feature of requiredFeatures) {
        expect(PLAN_LIMITS[plan]).toHaveProperty(feature);
      }
    }
  });

  it('every plan should have export_pdf and export_csv boolean features', () => {
    for (const plan of planKeys) {
      expect(typeof PLAN_LIMITS[plan].export_pdf).toBe('boolean');
      expect(typeof PLAN_LIMITS[plan].export_csv).toBe('boolean');
    }
  });

  it('pro numeric limits should be >= free numeric limits for every feature', () => {
    const numericFeatures: FeatureKey[] = [
      'market_sizing',
      'competitive',
      'partners',
      'regulatory',
      'reports_saved',
    ];

    for (const feature of numericFeatures) {
      const freeLimit = getFeatureLimit('free', feature);
      const proLimit = getFeatureLimit('pro', feature);
      // -1 means unlimited, which is always >= any finite limit
      if (proLimit === -1) {
        expect(true).toBe(true); // unlimited is always greater
      } else {
        expect(proLimit).toBeGreaterThanOrEqual(freeLimit);
      }
    }
  });

  it('team numeric limits should be >= pro numeric limits for every feature', () => {
    const numericFeatures: FeatureKey[] = [
      'market_sizing',
      'competitive',
      'partners',
      'regulatory',
      'reports_saved',
    ];

    for (const feature of numericFeatures) {
      const proLimit = getFeatureLimit('pro', feature);
      const teamLimit = getFeatureLimit('team', feature);
      if (teamLimit === -1) {
        expect(true).toBe(true);
      } else {
        expect(teamLimit).toBeGreaterThanOrEqual(proLimit);
      }
    }
  });

  it('team should have team_sharing enabled while free and pro do not', () => {
    expect(PLAN_LIMITS.free.team_sharing).toBe(false);
    expect(PLAN_LIMITS.pro.team_sharing).toBe(false);
    expect(PLAN_LIMITS.team.team_sharing).toBe(true);
  });

  it('team should have api_access and seats properties', () => {
    expect(PLAN_LIMITS.team).toHaveProperty('api_access', true);
    expect(PLAN_LIMITS.team).toHaveProperty('seats', 5);
  });
});

describe('PLAN_DISPLAY constants', () => {
  it('should have display info for all three plans', () => {
    expect(PLAN_DISPLAY.free).toBeDefined();
    expect(PLAN_DISPLAY.pro).toBeDefined();
    expect(PLAN_DISPLAY.team).toBeDefined();
  });

  it('should have correct plan names', () => {
    expect(PLAN_DISPLAY.free.name).toBe('Free');
    expect(PLAN_DISPLAY.pro.name).toBe('Pro');
    expect(PLAN_DISPLAY.team.name).toBe('Team');
  });

  it('should have price strings for all plans', () => {
    expect(PLAN_DISPLAY.free.price).toBe('$0');
    expect(PLAN_DISPLAY.pro.price).toBe('$149');
    expect(PLAN_DISPLAY.team.price).toBe('$499');
  });

  it('should have period for paid plans', () => {
    expect(PLAN_DISPLAY.pro.period).toBe('/month');
    expect(PLAN_DISPLAY.team.period).toBe('/month');
  });

  it('should have taglines for all plans', () => {
    expect(typeof PLAN_DISPLAY.free.tagline).toBe('string');
    expect(PLAN_DISPLAY.free.tagline.length).toBeGreaterThan(0);
    expect(typeof PLAN_DISPLAY.pro.tagline).toBe('string');
    expect(PLAN_DISPLAY.pro.tagline.length).toBeGreaterThan(0);
    expect(typeof PLAN_DISPLAY.team.tagline).toBe('string');
    expect(PLAN_DISPLAY.team.tagline.length).toBeGreaterThan(0);
  });

  it('should have color assigned to each plan', () => {
    expect(PLAN_DISPLAY.free.color).toBe('slate');
    expect(PLAN_DISPLAY.pro.color).toBe('teal');
    expect(PLAN_DISPLAY.team.color).toBe('amber');
  });

  it('should have badges on pro and team only', () => {
    expect(PLAN_DISPLAY.pro.badge).toBe('Most Popular');
    expect(PLAN_DISPLAY.team.badge).toBe('Best Value');
    // free plan should not have badge property
    expect((PLAN_DISPLAY.free as Record<string, unknown>).badge).toBeUndefined();
  });
});

describe('STRIPE_PRICES', () => {
  // STRIPE_PRICES reads from process.env which are undefined in test.
  // We just verify the module exports the constant without crashing.
  it('should be importable from the subscription module', async () => {
    const mod = await import('@/lib/subscription');
    expect(mod.STRIPE_PRICES).toBeDefined();
    expect(mod.STRIPE_PRICES).toHaveProperty('pro_monthly');
    expect(mod.STRIPE_PRICES).toHaveProperty('team_monthly');
  });
});

describe('hasFeatureAccess edge cases', () => {
  it('should return false for a feature key that does not exist on a plan', () => {
    // api_access only exists on team plan, not on free or pro
    const result = hasFeatureAccess('free', 'api_access' as FeatureKey);
    expect(result).toBe(false);
  });

  it('should return true for team-only features on team plan', () => {
    expect(hasFeatureAccess('team', 'team_sharing')).toBe(true);
  });
});

describe('getFeatureLimit edge cases', () => {
  it('should return 0 for boolean features even when true', () => {
    // export_pdf is true on pro, but getFeatureLimit returns 0 for booleans
    expect(getFeatureLimit('pro', 'export_pdf')).toBe(0);
  });

  it('should return 0 for a feature not present on the plan', () => {
    // seats only exists on team
    const result = getFeatureLimit('free', 'seats' as FeatureKey);
    expect(result).toBe(0);
  });
});

describe('isUnlimited edge cases', () => {
  it('should return false for features with limit of 0', () => {
    expect(isUnlimited('free', 'partners')).toBe(false);
  });

  it('should return false for features with positive finite limits', () => {
    expect(isUnlimited('free', 'market_sizing')).toBe(false);
  });

  it('should return false for boolean features', () => {
    expect(isUnlimited('team', 'export_pdf')).toBe(false);
    expect(isUnlimited('team', 'team_sharing')).toBe(false);
  });
});
