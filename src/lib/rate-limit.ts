/**
 * Distributed rate limiter backed by Upstash Redis.
 * Falls back to in-memory sliding window when Redis is unavailable.
 *
 * Uses @upstash/ratelimit for production (distributed, multi-instance safe).
 * Falls back to local Map<> for development or when env vars are missing.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// RATE LIMIT RESULT (consistent interface for both backends)
// ────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the oldest request in the window expires */
  retryAfter: number;
}

// ────────────────────────────────────────────────────────────
// UPSTASH REDIS BACKEND
// ────────────────────────────────────────────────────────────

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = !!(REDIS_URL && REDIS_TOKEN);

let redis: Redis | null = null;
if (useRedis) {
  redis = new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

// Cache Ratelimit instances per config signature to reuse connections
const rateLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.limit}:${config.windowMs}`;
  let limiter = rateLimiters.get(key);
  if (!limiter) {
    const windowSec = Math.ceil(config.windowMs / 1000);
    // Use sliding window for accuracy (matches previous in-memory behavior)
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.limit, `${windowSec} s`),
      prefix: 'terrain:rl',
      analytics: true,
    });
    rateLimiters.set(key, limiter);
  }
  return limiter;
}

async function rateLimitRedis(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = getRedisLimiter(config);
  const result = await limiter.limit(key);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    retryAfter: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1000),
  };
}

// ────────────────────────────────────────────────────────────
// IN-MEMORY FALLBACK (development / missing env vars)
// ────────────────────────────────────────────────────────────

interface MemoryEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryEntry>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupMemory(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  memoryStore.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) memoryStore.delete(key);
  });
}

function rateLimitMemory(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupMemory(config.windowMs);

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    return { success: false, limit: config.limit, remaining: 0, retryAfter };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.timestamps.length,
    retryAfter: 0,
  };
}

// ────────────────────────────────────────────────────────────
// PUBLIC API — same interface regardless of backend
// ────────────────────────────────────────────────────────────

/**
 * Rate limit a request by key.
 * Uses Upstash Redis in production, falls back to in-memory in development.
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (useRedis) {
    try {
      return await rateLimitRedis(key, config);
    } catch (err) {
      // Redis failure should not block requests — fall back to memory
      logger.warn('rate_limit_redis_fallback', {
        error: err instanceof Error ? err.message : 'Unknown error',
        key,
      });
      return rateLimitMemory(key, config);
    }
  }
  return rateLimitMemory(key, config);
}

// ────────────────────────────────────────────────────────────
// PRESET CONFIGURATIONS
// ────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  analysis_free: { limit: 5, windowMs: 60 * 60 * 1000 },
  analysis_pro: { limit: 20, windowMs: 60 * 60 * 1000 },
  analysis_team: { limit: 60, windowMs: 60 * 60 * 1000 },
  /** Auth routes: 10 attempts per 15 minutes per IP */
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;
