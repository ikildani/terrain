import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
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
      redis: redisOk ? 'ok' : 'error',
      supabase: supabaseOk ? 'ok' : 'error',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
