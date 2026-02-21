/**
 * In-memory sliding window rate limiter.
 * No external dependencies — upgrade to Upstash Redis for distributed deployments.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  });
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the oldest request in the window expires */
  retryAfter: number;
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.limit) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      retryAfter,
    };
  }

  entry.timestamps.push(now);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.timestamps.length,
    retryAfter: 0,
  };
}

// ── Preset configurations ──────────────────────────────────

/** Analysis endpoints: 20/hour for Pro, 5/hour for Free */
export const RATE_LIMITS = {
  analysis_free: { limit: 5, windowMs: 60 * 60 * 1000 },
  analysis_pro: { limit: 20, windowMs: 60 * 60 * 1000 },
  analysis_team: { limit: 60, windowMs: 60 * 60 * 1000 },
  /** Auth routes: 10 attempts per 15 minutes per IP */
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;
