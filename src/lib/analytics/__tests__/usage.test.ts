import { describe, it, expect } from 'vitest';
import {
  PLAN_LIMITS,
  hasFeatureAccess,
  getFeatureLimit,
  isUnlimited,
  type PlanKey,
  type FeatureKey,
} from '@/lib/subscription';

// ────────────────────────────────────────────────────────────
// Tests for the subscription/usage module.
//
// The core usage checking function (checkUsage) requires a
// Supabase client for DB access, so we test the pure functions
// that it depends on: getFeatureLimit, isUnlimited, hasFeatureAccess.
// These functions determine whether a user can use a feature
// based on their subscription plan.
// ────────────────────────────────────────────────────────────

describe('Subscription plan limits and access', () => {
  // ── Plan limit constants ────────────────────────────────
  describe('PLAN_LIMITS structure', () => {
    it('should have free, pro, and team plans', () => {
      expect(PLAN_LIMITS.free).toBeDefined();
      expect(PLAN_LIMITS.pro).toBeDefined();
      expect(PLAN_LIMITS.team).toBeDefined();
    });

    it('should have positive limits for free tier features', () => {
      expect(PLAN_LIMITS.free.market_sizing).toBe(3);
      expect(PLAN_LIMITS.free.competitive).toBe(1);
      expect(PLAN_LIMITS.free.reports_saved).toBe(3);
    });

    it('should block partners and regulatory on free tier', () => {
      expect(PLAN_LIMITS.free.partners).toBe(0);
      expect(PLAN_LIMITS.free.regulatory).toBe(0);
    });

    it('should set unlimited (-1) for pro features', () => {
      expect(PLAN_LIMITS.pro.market_sizing).toBe(-1);
      expect(PLAN_LIMITS.pro.competitive).toBe(-1);
      expect(PLAN_LIMITS.pro.partners).toBe(-1);
      expect(PLAN_LIMITS.pro.regulatory).toBe(-1);
      expect(PLAN_LIMITS.pro.reports_saved).toBe(-1);
    });

    it('should set unlimited (-1) for team features', () => {
      expect(PLAN_LIMITS.team.market_sizing).toBe(-1);
      expect(PLAN_LIMITS.team.competitive).toBe(-1);
      expect(PLAN_LIMITS.team.partners).toBe(-1);
      expect(PLAN_LIMITS.team.regulatory).toBe(-1);
    });

    it('should enable export and sharing on paid tiers only', () => {
      expect(PLAN_LIMITS.free.export_pdf).toBe(false);
      expect(PLAN_LIMITS.free.export_csv).toBe(false);
      expect(PLAN_LIMITS.free.team_sharing).toBe(false);

      expect(PLAN_LIMITS.pro.export_pdf).toBe(true);
      expect(PLAN_LIMITS.pro.export_csv).toBe(true);
      expect(PLAN_LIMITS.pro.team_sharing).toBe(false);

      expect(PLAN_LIMITS.team.export_pdf).toBe(true);
      expect(PLAN_LIMITS.team.export_csv).toBe(true);
      expect(PLAN_LIMITS.team.team_sharing).toBe(true);
    });
  });

  // ── hasFeatureAccess ────────────────────────────────────
  describe('hasFeatureAccess()', () => {
    it('should return true for features with positive limits on free plan', () => {
      expect(hasFeatureAccess('free', 'market_sizing')).toBe(true);
      expect(hasFeatureAccess('free', 'competitive')).toBe(true);
    });

    it('should return false for blocked features on free plan', () => {
      expect(hasFeatureAccess('free', 'partners')).toBe(false);
      expect(hasFeatureAccess('free', 'regulatory')).toBe(false);
    });

    it('should return false for boolean-false features on free plan', () => {
      expect(hasFeatureAccess('free', 'export_pdf')).toBe(false);
      expect(hasFeatureAccess('free', 'export_csv')).toBe(false);
    });

    it('should return true for all numeric features on pro plan', () => {
      expect(hasFeatureAccess('pro', 'market_sizing')).toBe(true);
      expect(hasFeatureAccess('pro', 'competitive')).toBe(true);
      expect(hasFeatureAccess('pro', 'partners')).toBe(true);
      expect(hasFeatureAccess('pro', 'regulatory')).toBe(true);
    });

    it('should return true for boolean-true features on pro plan', () => {
      expect(hasFeatureAccess('pro', 'export_pdf')).toBe(true);
      expect(hasFeatureAccess('pro', 'export_csv')).toBe(true);
    });

    it('should return true for all features on team plan', () => {
      expect(hasFeatureAccess('team', 'market_sizing')).toBe(true);
      expect(hasFeatureAccess('team', 'partners')).toBe(true);
      expect(hasFeatureAccess('team', 'export_pdf')).toBe(true);
      expect(hasFeatureAccess('team', 'team_sharing')).toBe(true);
    });
  });

  // ── getFeatureLimit ─────────────────────────────────────
  describe('getFeatureLimit()', () => {
    it('should return numeric limit for free tier', () => {
      expect(getFeatureLimit('free', 'market_sizing')).toBe(3);
      expect(getFeatureLimit('free', 'competitive')).toBe(1);
      expect(getFeatureLimit('free', 'reports_saved')).toBe(3);
    });

    it('should return 0 for blocked features on free tier', () => {
      expect(getFeatureLimit('free', 'partners')).toBe(0);
      expect(getFeatureLimit('free', 'regulatory')).toBe(0);
    });

    it('should return -1 (unlimited) for pro tier', () => {
      expect(getFeatureLimit('pro', 'market_sizing')).toBe(-1);
      expect(getFeatureLimit('pro', 'competitive')).toBe(-1);
      expect(getFeatureLimit('pro', 'partners')).toBe(-1);
    });

    it('should return 0 for boolean features (not numeric)', () => {
      expect(getFeatureLimit('free', 'export_pdf')).toBe(0);
      expect(getFeatureLimit('pro', 'export_pdf')).toBe(0);
    });
  });

  // ── isUnlimited ─────────────────────────────────────────
  describe('isUnlimited()', () => {
    it('should return false for free tier features (they have finite limits)', () => {
      expect(isUnlimited('free', 'market_sizing')).toBe(false);
      expect(isUnlimited('free', 'competitive')).toBe(false);
    });

    it('should return true for pro tier numeric features', () => {
      expect(isUnlimited('pro', 'market_sizing')).toBe(true);
      expect(isUnlimited('pro', 'competitive')).toBe(true);
      expect(isUnlimited('pro', 'partners')).toBe(true);
      expect(isUnlimited('pro', 'regulatory')).toBe(true);
    });

    it('should return true for team tier numeric features', () => {
      expect(isUnlimited('team', 'market_sizing')).toBe(true);
      expect(isUnlimited('team', 'partners')).toBe(true);
    });

    it('should return false for boolean features (they are not -1)', () => {
      expect(isUnlimited('pro', 'export_pdf')).toBe(false);
      expect(isUnlimited('team', 'team_sharing')).toBe(false);
    });
  });

  // ── Remaining count calculation logic ───────────────────
  describe('remaining count calculation (unit logic)', () => {
    // This tests the logic used inside checkUsage() without needing Supabase.
    // The formula: remaining = Math.max(0, limit - monthlyCount)
    //              allowed   = monthlyCount < limit

    it('should compute remaining correctly for free plan within limit', () => {
      const limit = getFeatureLimit('free', 'market_sizing'); // 3
      const monthlyCount = 1;
      const remaining = Math.max(0, limit - monthlyCount);
      const allowed = monthlyCount < limit;

      expect(remaining).toBe(2);
      expect(allowed).toBe(true);
    });

    it('should return 0 remaining when at limit', () => {
      const limit = getFeatureLimit('free', 'market_sizing'); // 3
      const monthlyCount = 3;
      const remaining = Math.max(0, limit - monthlyCount);
      const allowed = monthlyCount < limit;

      expect(remaining).toBe(0);
      expect(allowed).toBe(false);
    });

    it('should return 0 remaining when over limit', () => {
      const limit = getFeatureLimit('free', 'competitive'); // 1
      const monthlyCount = 5;
      const remaining = Math.max(0, limit - monthlyCount);
      const allowed = monthlyCount < limit;

      expect(remaining).toBe(0);
      expect(allowed).toBe(false);
    });

    it('should not restrict unlimited plans', () => {
      const limit = getFeatureLimit('pro', 'market_sizing'); // -1
      const unlimited = isUnlimited('pro', 'market_sizing');

      expect(unlimited).toBe(true);
      // Unlimited plans skip the count check entirely
    });

    it('should block access when limit is 0 (feature not available)', () => {
      const limit = getFeatureLimit('free', 'partners'); // 0
      expect(limit).toBe(0);
      // When limit is 0, access is denied immediately (no DB check needed)
    });
  });
});
