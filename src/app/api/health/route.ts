import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  let allOk = true;

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
    } catch {
      allOk = false;
    }
  } else {
    allOk = false;
  }

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
