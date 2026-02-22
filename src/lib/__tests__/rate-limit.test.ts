import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// ────────────────────────────────────────────────────────────
// Integration tests for the sliding-window rate limiter.
// No UPSTASH env vars → uses in-memory fallback automatically.
//
// Uses vi.useFakeTimers() to control time progression and test
// window expiry, cleanup, and multi-key isolation.
// ────────────────────────────────────────────────────────────

describe('rateLimit()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const config = { limit: 3, windowMs: 60_000 }; // 3 requests per 60 seconds

  describe('allows requests within the limit', () => {
    it('should succeed for the first request', async () => {
      const result = await rateLimit('test-allow-first', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(3);
      expect(result.retryAfter).toBe(0);
    });

    it('should succeed for requests up to the limit', async () => {
      const key = 'test-allow-all';
      const r1 = await rateLimit(key, config);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = await rateLimit(key, config);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = await rateLimit(key, config);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);
    });
  });

  describe('blocks requests exceeding the limit', () => {
    it('should block the request after the limit is reached', async () => {
      const key = 'test-block-exceed';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      const result = await rateLimit(key, config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should continue blocking subsequent requests', async () => {
      const key = 'test-block-continued';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      const r4 = await rateLimit(key, config);
      const r5 = await rateLimit(key, config);
      expect(r4.success).toBe(false);
      expect(r5.success).toBe(false);
    });
  });

  describe('returns correct remaining count', () => {
    it('should decrement remaining with each successful request', async () => {
      const key = 'test-remaining-count';
      expect((await rateLimit(key, config)).remaining).toBe(2);
      expect((await rateLimit(key, config)).remaining).toBe(1);
      expect((await rateLimit(key, config)).remaining).toBe(0);
    });

    it('should report 0 remaining when blocked', async () => {
      const key = 'test-remaining-zero';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      const blocked = await rateLimit(key, config);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('returns correct retryAfter value when blocked', () => {
    it('should return retryAfter in seconds when rate limited', async () => {
      const key = 'test-retry-after';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      const blocked = await rateLimit(key, config);
      expect(blocked.success).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
      expect(blocked.retryAfter).toBeLessThanOrEqual(60);
    });

    it('should decrease retryAfter as time passes', async () => {
      const key = 'test-retry-decrease';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      vi.advanceTimersByTime(30_000);

      const blocked = await rateLimit(key, config);
      expect(blocked.success).toBe(false);
      expect(blocked.retryAfter).toBeLessThanOrEqual(30);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    it('should return retryAfter of 0 for successful requests', async () => {
      const result = await rateLimit('test-retry-zero-success', config);
      expect(result.retryAfter).toBe(0);
    });
  });

  describe('resets after window expires', () => {
    it('should allow requests again after the full window has elapsed', async () => {
      const key = 'test-window-reset';
      await rateLimit(key, config);
      await rateLimit(key, config);
      await rateLimit(key, config);

      expect((await rateLimit(key, config)).success).toBe(false);

      vi.advanceTimersByTime(60_001);

      const result = await rateLimit(key, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should partially reset as individual timestamps expire', async () => {
      const key = 'test-partial-reset';
      await rateLimit(key, config);

      vi.advanceTimersByTime(20_000);
      await rateLimit(key, config);

      vi.advanceTimersByTime(20_000);
      await rateLimit(key, config);

      expect((await rateLimit(key, config)).success).toBe(false);

      vi.advanceTimersByTime(21_000);

      const result = await rateLimit(key, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });

  describe('different keys do not interfere with each other', () => {
    it('should track limits independently per key', async () => {
      const keyA = 'test-isolation-a';
      const keyB = 'test-isolation-b';
      const singleConfig = { limit: 1, windowMs: 60_000 };

      await rateLimit(keyA, singleConfig);
      expect((await rateLimit(keyA, singleConfig)).success).toBe(false);

      const resultB = await rateLimit(keyB, singleConfig);
      expect(resultB.success).toBe(true);
    });

    it('should not share remaining counts across keys', async () => {
      const keyC = 'test-isolation-c';
      const keyD = 'test-isolation-d';

      await rateLimit(keyC, config);
      await rateLimit(keyC, config);

      expect((await rateLimit(keyD, config)).remaining).toBe(2);
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
