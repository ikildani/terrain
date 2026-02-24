import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const startTime = Date.now();

export async function GET() {
  const checks: Record<string, 'ok' | 'degraded' | 'down'> = {};

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'degraded';
    }
  } else {
    checks.redis = 'degraded'; // No Redis configured (dev mode)
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      checks,
      uptime_ms: Date.now() - startTime,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
