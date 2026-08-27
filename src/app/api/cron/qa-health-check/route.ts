import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { notifyQAHealthCheck } from '@/lib/slack';
import { DATA_SOURCE_FRESHNESS } from '@/lib/data/data-freshness';

export const maxDuration = 60;

interface Check {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checks: Check[] = [];
  const supabase = createServiceClient();

  // ── 1. Trial ingestion freshness (7 days) ──────────────────
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('clinical_trials')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    checks.push(
      (count ?? 0) > 0
        ? { name: 'Trial ingestion (7d)', status: 'pass', detail: `${count} trials ingested in last 7 days` }
        : {
            name: 'Trial ingestion (7d)',
            status: 'fail',
            detail: 'No new trials in 7 days — refresh-trials may be failing',
          },
    );
  } catch (err) {
    checks.push({
      name: 'Trial ingestion (7d)',
      status: 'fail',
      detail: `Query failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // ── 2. Per-TA trial count (at least 5 active per major TA) ──
  const majorTAs = [
    'oncology',
    'neurology',
    'immunology',
    'rare_disease',
    'cardiovascular',
    'metabolic',
    'infectious_disease',
    'hematology',
  ];
  try {
    const { data: taCounts } = await supabase.rpc('count_trials_by_ta').select('*');
    if (taCounts && Array.isArray(taCounts)) {
      const countMap = new Map(taCounts.map((r: { ta: string; count: number }) => [r.ta, r.count]));
      const emptyTAs = majorTAs.filter((ta) => (countMap.get(ta) ?? 0) < 5);
      checks.push(
        emptyTAs.length === 0
          ? { name: 'Per-TA trial coverage', status: 'pass', detail: `All ${majorTAs.length} major TAs have 5+ trials` }
          : { name: 'Per-TA trial coverage', status: 'warn', detail: `Low trial count in: ${emptyTAs.join(', ')}` },
      );
    } else {
      const { count } = await supabase.from('clinical_trials').select('*', { count: 'exact', head: true });
      checks.push({
        name: 'Per-TA trial coverage',
        status: (count ?? 0) > 100 ? 'pass' : 'warn',
        detail: `Total trials: ${count ?? 0} (per-TA RPC not available)`,
      });
    }
  } catch {
    checks.push({ name: 'Per-TA trial coverage', status: 'warn', detail: 'Per-TA query not available — skipped' });
  }

  // ── 3. FDA refresh freshness (3 days) ──────────────────────
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('data_source_status')
      .select('last_refreshed_at')
      .eq('id', 'openfda_approvals')
      .single();

    if (data?.last_refreshed_at && data.last_refreshed_at > threeDaysAgo) {
      checks.push({
        name: 'FDA refresh (3d)',
        status: 'pass',
        detail: `Last refreshed: ${data.last_refreshed_at.split('T')[0]}`,
      });
    } else {
      checks.push({ name: 'FDA refresh (3d)', status: 'warn', detail: 'FDA data not refreshed in 3+ days' });
    }
  } catch {
    checks.push({ name: 'FDA refresh (3d)', status: 'warn', detail: 'Could not check FDA status' });
  }

  // ── 4. EMA refresh freshness (3 days) ──────────────────────
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('data_source_status')
      .select('last_refreshed_at')
      .eq('id', 'ema_approvals')
      .single();

    if (data?.last_refreshed_at && data.last_refreshed_at > threeDaysAgo) {
      checks.push({
        name: 'EMA refresh (3d)',
        status: 'pass',
        detail: `Last refreshed: ${data.last_refreshed_at.split('T')[0]}`,
      });
    } else {
      checks.push({ name: 'EMA refresh (3d)', status: 'warn', detail: 'EMA data not refreshed in 3+ days' });
    }
  } catch {
    checks.push({ name: 'EMA refresh (3d)', status: 'warn', detail: 'EMA source not yet configured' });
  }

  // ── 5. PubMed freshness (10 days) ──────────────────────────
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('data_source_status')
      .select('last_refreshed_at')
      .eq('id', 'pubmed_literature')
      .single();

    if (data?.last_refreshed_at && data.last_refreshed_at > tenDaysAgo) {
      checks.push({
        name: 'PubMed refresh (10d)',
        status: 'pass',
        detail: `Last refreshed: ${data.last_refreshed_at.split('T')[0]}`,
      });
    } else {
      checks.push({ name: 'PubMed refresh (10d)', status: 'warn', detail: 'PubMed not refreshed in 10+ days' });
    }
  } catch {
    checks.push({ name: 'PubMed refresh (10d)', status: 'warn', detail: 'PubMed source not yet configured' });
  }

  // ── 6. SEC EDGAR freshness (10 days) ──────────────────────
  try {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('sec_filings_cache')
      .select('*', { count: 'exact', head: true })
      .gte('fetched_at', tenDaysAgo);

    checks.push(
      (count ?? 0) > 0
        ? { name: 'SEC EDGAR (10d)', status: 'pass', detail: `${count} filings cached in last 10 days` }
        : { name: 'SEC EDGAR (10d)', status: 'warn', detail: 'No SEC filings in 10 days' },
    );
  } catch {
    checks.push({ name: 'SEC EDGAR (10d)', status: 'warn', detail: 'SEC table not available' });
  }

  // ── 7. Enrichment pipeline freshness (3 days) ─────────────
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('enriched_data')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', threeDaysAgo);

    checks.push(
      (count ?? 0) > 0
        ? { name: 'Enrichment pipeline (3d)', status: 'pass', detail: `${count} enrichments in last 3 days` }
        : { name: 'Enrichment pipeline (3d)', status: 'warn', detail: 'No enrichments in 3 days' },
    );
  } catch {
    checks.push({ name: 'Enrichment pipeline (3d)', status: 'warn', detail: 'Enrichment table not available' });
  }

  // ── 8. Data source freshness — no curated source > 6 months ──
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const staleSources: string[] = [];
  for (const [source, dateStr] of Object.entries(DATA_SOURCE_FRESHNESS)) {
    try {
      const sourceDate = new Date(dateStr);
      if (sourceDate < sixMonthsAgo) {
        staleSources.push(`${source} (${dateStr.split('T')[0]})`);
      }
    } catch {}
  }
  checks.push(
    staleSources.length === 0
      ? {
          name: 'Source freshness (<6mo)',
          status: 'pass',
          detail: `All ${Object.keys(DATA_SOURCE_FRESHNESS).length} sources within window`,
        }
      : {
          name: 'Source freshness (<6mo)',
          status: 'warn',
          detail: `${staleSources.length} stale: ${staleSources.slice(0, 3).join(', ')}`,
        },
  );

  // ── 9. Indication coverage ────────────────────────────────
  try {
    const { THERAPEUTIC_AREAS } = await import('@/lib/data/ta-metadata');
    const totalIndications = THERAPEUTIC_AREAS.reduce(
      (sum: number, ta: { indicationCount: number }) => sum + ta.indicationCount,
      0,
    );
    checks.push(
      totalIndications >= 200
        ? {
            name: 'Indication coverage',
            status: 'pass',
            detail: `${totalIndications} indications across ${THERAPEUTIC_AREAS.length} TAs`,
          }
        : { name: 'Indication coverage', status: 'fail', detail: `Only ${totalIndications} — expected 200+` },
    );
  } catch (err) {
    checks.push({
      name: 'Indication coverage',
      status: 'fail',
      detail: `Import failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // ── 10. Competitor database completeness ──────────────────
  try {
    const { COMPETITOR_DATABASE } = await import('@/lib/data/competitor-database');
    const n = Array.isArray(COMPETITOR_DATABASE) ? COMPETITOR_DATABASE.length : 0;
    checks.push(
      n >= 500
        ? { name: 'Competitor database', status: 'pass', detail: `${n} competitors` }
        : n >= 200
          ? { name: 'Competitor database', status: 'warn', detail: `${n} competitors — target 500+` }
          : { name: 'Competitor database', status: 'fail', detail: `Only ${n} competitors` },
    );
  } catch {
    checks.push({ name: 'Competitor database', status: 'warn', detail: 'Could not load competitor database' });
  }

  // ── 11. Partner database ──────────────────────────────────
  try {
    const { partners } = await import('@/lib/data/partner-database');
    const n = Array.isArray(partners) ? partners.length : 0;
    checks.push(
      n >= 200
        ? { name: 'Partner database', status: 'pass', detail: `${n} partners` }
        : { name: 'Partner database', status: 'warn', detail: `${n} partners — target 200+` },
    );
  } catch {
    checks.push({ name: 'Partner database', status: 'warn', detail: 'Could not load partner database' });
  }

  // ── 12. Pricing benchmarks ────────────────────────────────
  try {
    const { pricingBenchmarks } = await import('@/lib/data/pricing-benchmarks');
    const n = Array.isArray(pricingBenchmarks) ? pricingBenchmarks.length : 0;
    checks.push(
      n >= 100
        ? { name: 'Pricing benchmarks', status: 'pass', detail: `${n} benchmarks` }
        : { name: 'Pricing benchmarks', status: 'warn', detail: `${n} — target 100+` },
    );
  } catch {
    checks.push({ name: 'Pricing benchmarks', status: 'warn', detail: 'Could not load pricing data' });
  }

  // ── 13. Deal comps ────────────────────────────────────────
  try {
    const { dealComps } = await import('@/lib/data/pharma-deal-comps');
    const n = Array.isArray(dealComps) ? dealComps.length : 0;
    checks.push(
      n >= 200
        ? { name: 'Deal comps', status: 'pass', detail: `${n} comps` }
        : { name: 'Deal comps', status: 'warn', detail: `${n} — target 200+` },
    );
  } catch {
    checks.push({ name: 'Deal comps', status: 'warn', detail: 'Could not load deal comps' });
  }

  // ── 14. LOA tables ────────────────────────────────────────
  try {
    const loaTables = await import('@/lib/data/loa-tables');
    checks.push(
      loaTables && Object.keys(loaTables).length > 0
        ? { name: 'LOA tables', status: 'pass', detail: 'Loaded' }
        : { name: 'LOA tables', status: 'fail', detail: 'Empty' },
    );
  } catch {
    checks.push({ name: 'LOA tables', status: 'fail', detail: 'Could not load LOA tables' });
  }

  // ── 15. Supabase connectivity ─────────────────────────────
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    checks.push(
      !error
        ? { name: 'Supabase', status: 'pass', detail: 'Connected' }
        : { name: 'Supabase', status: 'fail', detail: error.message },
    );
  } catch (err) {
    checks.push({
      name: 'Supabase',
      status: 'fail',
      detail: `Failed: ${err instanceof Error ? err.message : 'Unknown'}`,
    });
  }

  // ── 16. User count ────────────────────────────────────────
  try {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    checks.push(
      (count ?? 0) > 0
        ? { name: 'User database', status: 'pass', detail: `${count} users` }
        : { name: 'User database', status: 'warn', detail: 'Zero users' },
    );
  } catch {
    checks.push({ name: 'User database', status: 'warn', detail: 'Could not query users' });
  }

  // ── 17-21. Configuration checks ───────────────────────────
  checks.push(
    process.env.STRIPE_WEBHOOK_SECRET
      ? { name: 'Stripe webhook', status: 'pass', detail: 'Configured' }
      : { name: 'Stripe webhook', status: 'warn', detail: 'Not set' },
  );
  checks.push(
    process.env.SLACK_WEBHOOK_URL
      ? { name: 'Slack notifications', status: 'pass', detail: 'Configured' }
      : { name: 'Slack notifications', status: 'warn', detail: 'Not set — alerts silent' },
  );
  checks.push(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
      ? { name: 'Error tracking', status: 'pass', detail: 'Sentry configured' }
      : { name: 'Error tracking', status: 'warn', detail: 'Sentry not configured' },
  );
  checks.push(
    process.env.CRON_SECRET
      ? { name: 'Cron auth', status: 'pass', detail: 'Configured' }
      : { name: 'Cron auth', status: 'fail', detail: 'CRON_SECRET not set' },
  );
  checks.push(
    process.env.PERPLEXITY_API_KEY
      ? { name: 'Perplexity AI', status: 'pass', detail: 'Configured' }
      : { name: 'Perplexity AI', status: 'warn', detail: 'Not set — enrichment disabled' },
  );

  // ── Aggregate ─────────────────────────────────────────────
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const overallStatus = failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass';

  const slackDetails = [
    `*${checks.length} checks:* ${passCount} pass, ${warnCount} warn, ${failCount} fail`,
    '',
    ...checks.map((c) => {
      const emoji = c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌';
      return `${emoji} ${c.name}: ${c.detail}`;
    }),
  ].join('\n');

  try {
    await notifyQAHealthCheck(overallStatus, slackDetails);
  } catch {}

  logger.info('qa_health_check_complete', {
    overallStatus,
    totalChecks: checks.length,
    passCount,
    warnCount,
    failCount,
  });

  return NextResponse.json({
    status: overallStatus,
    summary: { total: checks.length, pass: passCount, warn: warnCount, fail: failCount },
    checks,
    timestamp: new Date().toISOString(),
  });
}
