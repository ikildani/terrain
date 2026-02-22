import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// ────────────────────────────────────────────────────────────
// Integration tests for the in-memory sliding-window rate limiter.
//
// Uses vi.useFakeTimers() to control time progression and test
// window expiry, cleanup, and multi-key isolation.
// ────────────────────────────────────────────────────────────

describe('rateLimit()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset the internal store between tests by advancing time far enough
    // to trigger cleanup, then making a dummy call so cleanup runs.
    // However, because the store is module-level, we need a fresh import.
    // Instead, we use unique keys per test group to avoid cross-contamination.
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const config = { limit: 3, windowMs: 60_000 }; // 3 requests per 60 seconds

  describe('allows requests within the limit', () => {
    it('should succeed for the first request', () => {
      const result = rateLimit('test-allow-first', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(3);
      expect(result.retryAfter).toBe(0);
    });

    it('should succeed for requests up to the limit', () => {
      const key = 'test-allow-all';
      const r1 = rateLimit(key, config);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = rateLimit(key, config);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = rateLimit(key, config);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);
    });
  });

  describe('blocks requests exceeding the limit', () => {
    it('should block the request after the limit is reached', () => {
      const key = 'test-block-exceed';
      // Exhaust the limit
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      // 4th request should be blocked
      const result = rateLimit(key, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should continue blocking subsequent requests', () => {
      const key = 'test-block-continued';
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      const r4 = rateLimit(key, config);
      const r5 = rateLimit(key, config);
      expect(r4.success).toBe(false);
      expect(r5.success).toBe(false);
    });
  });

  describe('returns correct remaining count', () => {
    it('should decrement remaining with each successful request', () => {
      const key = 'test-remaining-count';
      expect(rateLimit(key, config).remaining).toBe(2);
      expect(rateLimit(key, config).remaining).toBe(1);
      expect(rateLimit(key, config).remaining).toBe(0);
    });

    it('should report 0 remaining when blocked', () => {
      const key = 'test-remaining-zero';
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      const blocked = rateLimit(key, config);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('returns correct retryAfter value when blocked', () => {
    it('should return retryAfter in seconds when rate limited', () => {
      const key = 'test-retry-after';
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      const blocked = rateLimit(key, config);
      expect(blocked.success).toBe(false);
      // retryAfter should be roughly the window duration in seconds
      // since the oldest timestamp is very recent (same fake-time tick)
      expect(blocked.retryAfter).toBeGreaterThan(0);
      expect(blocked.retryAfter).toBeLessThanOrEqual(60); // windowMs / 1000
    });

    it('should decrease retryAfter as time passes', () => {
      const key = 'test-retry-decrease';
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      // Advance 30 seconds
      vi.advanceTimersByTime(30_000);

      const blocked = rateLimit(key, config);
      expect(blocked.success).toBe(false);
      // The oldest request is now 30s old in a 60s window, so retryAfter ~ 30
      expect(blocked.retryAfter).toBeLessThanOrEqual(30);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it('should return retryAfter of 0 for successful requests', () => {
      const result = rateLimit('test-retry-zero-success', config);
      expect(result.retryAfter).toBe(0);
    });
  });

  describe('resets after window expires', () => {
    it('should allow requests again after the full window has elapsed', () => {
      const key = 'test-window-reset';
      rateLimit(key, config);
      rateLimit(key, config);
      rateLimit(key, config);

      // Should be blocked
      expect(rateLimit(key, config).success).toBe(false);

      // Advance past the window
      vi.advanceTimersByTime(60_001);

      // Should be allowed again
      const result = rateLimit(key, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should partially reset as individual timestamps expire', () => {
      const key = 'test-partial-reset';
      // Request at t=0
      rateLimit(key, config);

      // Advance 20s, request at t=20s
      vi.advanceTimersByTime(20_000);
      rateLimit(key, config);

      // Advance 20s, request at t=40s
      vi.advanceTimersByTime(20_000);
      rateLimit(key, config);

      // Now all 3 slots used: t=0, t=20s, t=40s
      expect(rateLimit(key, config).success).toBe(false);

      // Advance 21s more (total 61s from t=0), so the t=0 request expires
      vi.advanceTimersByTime(21_000);

      const result = rateLimit(key, config);
      expect(result.success).toBe(true);
      // Two old timestamps remain (t=20 and t=40, both still within window)
      // plus this new one, so remaining should be 0
      expect(result.remaining).toBe(0);
    });
  });

  describe('different keys do not interfere with each other', () => {
    it('should track limits independently per key', () => {
      const keyA = 'test-isolation-a';
      const keyB = 'test-isolation-b';
      const singleConfig = { limit: 1, windowMs: 60_000 };

      // Exhaust key A
      rateLimit(keyA, singleConfig);
      expect(rateLimit(keyA, singleConfig).success).toBe(false);

      // Key B should still have capacity
      const resultB = rateLimit(keyB, singleConfig);
      expect(resultB.success).toBe(true);
    });

    it('should not share remaining counts across keys', () => {
      const keyC = 'test-isolation-c';
      const keyD = 'test-isolation-d';

      rateLimit(keyC, config); // use 1 of 3 on keyC
      rateLimit(keyC, config); // use 2 of 3 on keyC

      // keyD should still have full capacity
      expect(rateLimit(keyD, config).remaining).toBe(2);
    });
  });
});

// ────────────────────────────────────────────────────────────
// RATE_LIMITS preset configurations
// ────────────────────────────────────────────────────────────

describe('RATE_LIMITS presets', () => {
  it('should define analysis_free with 5 requests per hour', () => {
    expect(RATE_LIMITS.analysis_free).toEqual({
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
  });

  it('should define analysis_pro with 20 requests per hour', () => {
    expect(RATE_LIMITS.analysis_pro).toEqual({
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
  });

  it('should define analysis_team with 60 requests per hour', () => {
    expect(RATE_LIMITS.analysis_team).toEqual({
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });
  });

  it('should define auth with 10 attempts per 15 minutes', () => {
    expect(RATE_LIMITS.auth).toEqual({
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
  });

  it('should have progressively higher limits from free to team', () => {
    expect(RATE_LIMITS.analysis_free.limit).toBeLessThan(RATE_LIMITS.analysis_pro.limit);
    expect(RATE_LIMITS.analysis_pro.limit).toBeLessThan(RATE_LIMITS.analysis_team.limit);
  });

  it('should use the same window duration for all analysis tiers', () => {
    expect(RATE_LIMITS.analysis_free.windowMs).toBe(RATE_LIMITS.analysis_pro.windowMs);
    expect(RATE_LIMITS.analysis_pro.windowMs).toBe(RATE_LIMITS.analysis_team.windowMs);
  });

  it('should use a shorter window for auth than for analysis', () => {
    expect(RATE_LIMITS.auth.windowMs).toBeLessThan(RATE_LIMITS.analysis_free.windowMs);
  });
});
