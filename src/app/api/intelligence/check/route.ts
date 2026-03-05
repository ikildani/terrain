import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── GET: Lightweight check for new intelligence data ─────────
// Returns only data source timestamps — no feed data.
// Used by the notification bell to show/hide the unread dot.
export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 });
  }

  const { data: sources } = await supabase
    .from('data_source_status')
    .select('last_refreshed_at')
    .order('last_refreshed_at', { ascending: false })
    .limit(1);

  const latestRefresh = sources?.[0]?.last_refreshed_at ?? null;

  return NextResponse.json({
    success: true,
    latest_refresh: latestRefresh,
  });
}
