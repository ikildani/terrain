import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/api/client-ip';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`health:${ip}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ status: 'rate_limited' }, { status: 429 });
  }
  let redisOk = true;
  let supabaseOk = true;

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
    } catch {
      redisOk = false;
    }
  } else {
    redisOk = false;
  }

  // Check Supabase
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      supabaseOk = false;
    }
  } catch {
    supabaseOk = false;
  }

  const allOk = redisOk && supabaseOk;

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
