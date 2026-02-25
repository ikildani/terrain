import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// openFDA Drug Approvals — Daily refresh
// Free, no auth. Rate limit: 240 req/min without API key
// Docs: https://open.fda.gov/apis/drug/drugsfda/
// ────────────────────────────────────────────────────────────

const OPENFDA_BASE = 'https://api.fda.gov/drug/drugsfda.json';

interface OpenFDAResult {
  application_number?: string;
  sponsor_name?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    route?: string[];
    substance_name?: string[];
  };
  products?: {
    brand_name?: string;
    active_ingredients?: { name?: string; strength?: string }[];
    dosage_form?: string;
    route?: string;
    marketing_status?: string;
  }[];
  submissions?: {
    submission_type?: string;
    submission_number?: string;
    submission_status?: string;
    submission_status_date?: string;
    application_docs?: { id?: string; url?: string; type?: string; title?: string }[];
  }[];
}

async function fetchRecentApprovals(daysBack: number): Promise<OpenFDAResult[]> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

  const search = `submissions.submission_status_date:[${formatDate(startDate)}+TO+${formatDate(endDate)}]`;
  const url = `${OPENFDA_BASE}?search=${search}&limit=100`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    logger.warn('openfda_fetch_failed', { status: res.status, url });
    return [];
  }

  const data = await res.json();
  return data.results ?? [];
}

function parseApproval(result: OpenFDAResult) {
  const appNum = result.application_number;
  if (!appNum) return null;

  const latestSubmission = result.submissions?.sort((a, b) =>
    (b.submission_status_date ?? '').localeCompare(a.submission_status_date ?? ''),
  )?.[0];

  const brandNames = result.openfda?.brand_name ?? result.products?.map((p) => p.brand_name).filter(Boolean) ?? [];
  const genericNames = result.openfda?.generic_name ?? [];
  const activeIngredients = result.openfda?.substance_name ?? [];
  const routes = result.openfda?.route ?? [];

  // Derive application type from number prefix
  let applicationType = 'Unknown';
  if (appNum.startsWith('NDA')) applicationType = 'NDA';
  else if (appNum.startsWith('BLA')) applicationType = 'BLA';
  else if (appNum.startsWith('ANDA')) applicationType = 'ANDA';

  return {
    application_number: appNum,
    brand_name: brandNames[0] ?? null,
    generic_name: genericNames[0] ?? null,
    sponsor_name: result.sponsor_name ?? null,
    approval_date: latestSubmission?.submission_status_date ?? null,
    application_type: applicationType,
    active_ingredients: activeIngredients as string[],
    indications: [] as string[], // openFDA doesn't expose indications directly
    route: routes[0] ?? null,
    dosage_form: result.products?.[0]?.dosage_form ?? null,
    marketing_status: result.products?.[0]?.marketing_status ?? null,
    submission_type: latestSubmission?.submission_type ?? null,
    submission_status: latestSubmission?.submission_status ?? null,
  };
}

// ────────────────────────────────────────────────────────────
// GET /api/cron/refresh-fda
// Schedule: Daily at 6 AM UTC
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  // Mark source as running
  await supabase.from('data_source_status').upsert({
    id: 'openfda_approvals',
    display_name: 'FDA Drug Approvals (openFDA)',
    source_url: 'https://api.fda.gov/drug/drugsfda.json',
    refresh_frequency: 'daily',
    status: 'running',
    updated_at: new Date().toISOString(),
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const errors: string[] = [];

  try {
    // Fetch last 30 days of FDA activity (overlapping window to catch updates)
    const results = await fetchRecentApprovals(30);
    totalFetched = results.length;

    const parsed = results.map(parseApproval).filter(Boolean);

    if (parsed.length > 0) {
      // Batch upsert in chunks of 50
      for (let i = 0; i < parsed.length; i += 50) {
        const chunk = parsed.slice(i, i + 50).map((r) => ({
          ...r,
          raw_data: {},
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('fda_approvals_cache')
          .upsert(chunk, { onConflict: 'application_number' });

        if (error) {
          errors.push(`Upsert chunk error: ${error.message}`);
        } else {
          totalUpserted += chunk.length;
        }
      }
    }
  } catch (err) {
    errors.push(`Fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Count total records
  const { count } = await supabase
    .from('fda_approvals_cache')
    .select('application_number', { count: 'exact', head: true });

  // Update source status
  await supabase.from('data_source_status').upsert({
    id: 'openfda_approvals',
    display_name: 'FDA Drug Approvals (openFDA)',
    source_url: 'https://api.fda.gov/drug/drugsfda.json',
    refresh_frequency: 'daily',
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    records_count: count ?? 0,
    status: errors.length > 0 ? 'error' : 'success',
    last_error: errors.length > 0 ? errors.join('; ') : null,
    updated_at: new Date().toISOString(),
  });

  logger.info('cron_refresh_fda_complete', {
    totalFetched,
    totalUpserted,
    totalCached: count ?? 0,
    errors: errors.length,
    durationMs,
  });

  return NextResponse.json({
    success: true,
    fetched: totalFetched,
    upserted: totalUpserted,
    cached: count ?? 0,
    errors: errors.length,
    durationMs,
  });
}
