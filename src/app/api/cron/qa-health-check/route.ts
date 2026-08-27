import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { notifyQAHealthCheck } from '@/lib/slack';
import { DATA_SOURCE_FRESHNESS } from '@/lib/data/data-freshness';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checks: { name: string; status: 'pass' | 'warn' | 'fail'; detail: string }[] = [];
  const supabase = createServiceClient();

  // 1. Check trial data freshness — at least 1 trial ingested in last 7 days
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('clinical_trials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    if ((count ?? 0) > 0) {
      checks.push({ name: 'Trial ingestion (7d)', status: 'pass', detail: `${count} trials ingested in last 7 days` });
    } else {
      checks.push({
        name: 'Trial ingestion (7d)',
        status: 'fail',
        detail: 'No new trials in 7 days — refresh-trials may be failing',
      });
    }
  } catch (err) {
    checks.push({
      name: 'Trial ingestion (7d)',
      status: 'fail',
      detail: `Query failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // 2. Check FDA data freshness — at least 1 check in last 3 days
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('data_sources')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'fda')
      .gte('last_refreshed_at', threeDaysAgo);

    if ((count ?? 0) > 0) {
      checks.push({ name: 'FDA refresh (3d)', status: 'pass', detail: 'FDA data refreshed within 3 days' });
    } else {
      checks.push({ name: 'FDA refresh (3d)', status: 'warn', detail: 'FDA data not refreshed in 3+ days' });
    }
  } catch (err) {
    checks.push({
      name: 'FDA refresh (3d)',
      status: 'warn',
      detail: `Query failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // 3. Check data source freshness — no curated source older than 6 months
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const staleSources: string[] = [];
  for (const [source, dateStr] of Object.entries(DATA_SOURCE_FRESHNESS)) {
    try {
      const sourceDate = new Date(dateStr);
      if (sourceDate < sixMonthsAgo) {
        staleSources.push(`${source} (${dateStr})`);
      }
    } catch {}
  }
  if (staleSources.length === 0) {
    checks.push({ name: 'Source freshness', status: 'pass', detail: 'All data sources within 6-month window' });
  } else {
    checks.push({
      name: 'Source freshness',
      status: 'warn',
      detail: `${staleSources.length} stale: ${staleSources.slice(0, 3).join(', ')}`,
    });
  }

  // 4. Check total indication count hasn't dropped
  try {
    const { THERAPEUTIC_AREAS } = await import('@/lib/data/ta-metadata');
    const totalIndications = THERAPEUTIC_AREAS.reduce((sum, ta) => sum + ta.indicationCount, 0);
    if (totalIndications >= 200) {
      checks.push({
        name: 'Indication coverage',
        status: 'pass',
        detail: `${totalIndications} indications across ${THERAPEUTIC_AREAS.length} TAs`,
      });
    } else {
      checks.push({
        name: 'Indication coverage',
        status: 'fail',
        detail: `Only ${totalIndications} indications — expected 200+`,
      });
    }
  } catch (err) {
    checks.push({
      name: 'Indication coverage',
      status: 'fail',
      detail: `Import failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // 5. Check Supabase connectivity
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (!error) {
      checks.push({ name: 'Supabase', status: 'pass', detail: 'Connected' });
    } else {
      checks.push({ name: 'Supabase', status: 'fail', detail: error.message });
    }
  } catch (err) {
    checks.push({
      name: 'Supabase',
      status: 'fail',
      detail: `Connection failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // Aggregate
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const overallStatus = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

  const slackDetails = checks
    .map((c) => {
      const emoji = c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌';
      return `${emoji} ${c.name}: ${c.detail}`;
    })
    .join('\n');

  try {
    await notifyQAHealthCheck(overallStatus, slackDetails);
  } catch {}

  logger.info('qa_health_check_complete', { overallStatus, checks });

  return NextResponse.json({
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  });
}
