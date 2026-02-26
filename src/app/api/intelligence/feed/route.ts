import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SourceFilter = 'trials' | 'fda' | 'sec' | 'all';

interface ClinicalTrial {
  nct_id: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: unknown;
  sponsor: string;
  enrollment: number;
  start_date: string;
  completion_date: string;
  last_update_posted: string;
  fetched_at: string;
}

interface FdaApproval {
  application_number: string;
  brand_name: string;
  generic_name: string;
  sponsor_name: string;
  approval_date: string;
  application_type: string;
  active_ingredients: string[];
  route: string;
  dosage_form: string;
  submission_type: string;
  submission_status: string;
  fetched_at: string;
}

interface SecFiling {
  accession_number: string;
  company_name: string;
  ticker: string;
  cik: string;
  form_type: string;
  filed_date: string;
  description: string;
  file_url: string;
  is_deal_related: boolean;
  deal_keywords: string[];
  fetched_at: string;
}

interface DataSourceStatus {
  id: string;
  display_name: string;
  source_url: string;
  last_refreshed_at: string;
  next_refresh_at: string;
  records_count: number;
  status: string;
  last_error: string | null;
  refresh_frequency: string;
  updated_at: string;
}

interface FeedResponse {
  success: true;
  sources: DataSourceStatus[];
  feed: {
    trials: ClinicalTrial[];
    fda: FdaApproval[];
    sec: SecFiling[];
  };
  counts: {
    trials: number;
    fda: number;
    sec: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const VALID_SOURCES: SourceFilter[] = ['trials', 'fda', 'sec', 'all'];

// Column selections — explicitly enumerate to avoid SELECT *
const TRIALS_COLUMNS =
  'nct_id, title, status, phase, conditions, interventions, sponsor, enrollment, start_date, completion_date, last_update_posted, fetched_at';

const FDA_COLUMNS =
  'application_number, brand_name, generic_name, sponsor_name, approval_date, application_type, active_ingredients, route, dosage_form, submission_type, submission_status, fetched_at';

const SEC_COLUMNS =
  'accession_number, company_name, ticker, cik, form_type, filed_date, description, file_url, is_deal_related, deal_keywords, fetched_at';

const SOURCE_STATUS_COLUMNS =
  'id, display_name, source_url, last_refreshed_at, next_refresh_at, records_count, status, last_error, refresh_frequency, updated_at';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function parseSource(raw: string | null): SourceFilter {
  if (!raw) return 'all';
  const lower = raw.toLowerCase() as SourceFilter;
  return VALID_SOURCES.includes(lower) ? lower : 'all';
}

function toSearchPattern(search: string): string {
  const sanitized = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
  return `%${sanitized}%`;
}

// ---------------------------------------------------------------------------
// GET /api/intelligence/feed
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse<FeedResponse | ErrorResponse>> {
  const supabase = createClient();

  // ── Authentication ──────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false as const, error: 'Authentication required.' }, { status: 401 });
  }

  // ── Parse query parameters ──────────────────────────────────────────────
  const { searchParams } = request.nextUrl;
  const source = parseSource(searchParams.get('source'));
  const limit = parseLimit(searchParams.get('limit'));
  const search = searchParams.get('search')?.trim() || null;
  const searchPattern = search ? toSearchPattern(search) : null;

  const shouldFetch = {
    trials: source === 'all' || source === 'trials',
    fda: source === 'all' || source === 'fda',
    sec: source === 'all' || source === 'sec',
  };

  // ── Build queries in parallel ───────────────────────────────────────────

  // 1. Data source status — always fetched
  const sourceStatusPromise = supabase
    .from('data_source_status')
    .select(SOURCE_STATUS_COLUMNS)
    .order('display_name', { ascending: true });

  // 2. Clinical trials
  const trialsPromise = (async () => {
    if (!shouldFetch.trials) return { data: [] as ClinicalTrial[], count: 0 };

    // Count query (unfiltered by limit, but filtered by search)
    let countQuery = supabase.from('clinical_trials_cache').select('nct_id', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('clinical_trials_cache')
      .select(TRIALS_COLUMNS)
      .order('last_update_posted', { ascending: false })
      .limit(limit);

    if (searchPattern) {
      const orFilter = `title.ilike.${searchPattern},sponsor.ilike.${searchPattern}`;
      countQuery = countQuery.or(orFilter);
      dataQuery = dataQuery.or(orFilter);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (dataResult.error) {
      throw new Error(`Trials query failed: ${dataResult.error.message}`);
    }

    return {
      data: (dataResult.data ?? []) as ClinicalTrial[],
      count: countResult.count ?? 0,
    };
  })();

  // 3. FDA approvals
  const fdaPromise = (async () => {
    if (!shouldFetch.fda) return { data: [] as FdaApproval[], count: 0 };

    let countQuery = supabase.from('fda_approvals_cache').select('application_number', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('fda_approvals_cache')
      .select(FDA_COLUMNS)
      .order('approval_date', { ascending: false })
      .limit(limit);

    if (searchPattern) {
      const orFilter = `brand_name.ilike.${searchPattern},generic_name.ilike.${searchPattern},sponsor_name.ilike.${searchPattern}`;
      countQuery = countQuery.or(orFilter);
      dataQuery = dataQuery.or(orFilter);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (dataResult.error) {
      throw new Error(`FDA query failed: ${dataResult.error.message}`);
    }

    return {
      data: (dataResult.data ?? []) as FdaApproval[],
      count: countResult.count ?? 0,
    };
  })();

  // 4. SEC filings
  const secPromise = (async () => {
    if (!shouldFetch.sec) return { data: [] as SecFiling[], count: 0 };

    let countQuery = supabase.from('sec_filings_cache').select('accession_number', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('sec_filings_cache')
      .select(SEC_COLUMNS)
      .order('filed_date', { ascending: false })
      .limit(limit);

    if (searchPattern) {
      const orFilter = `company_name.ilike.${searchPattern},description.ilike.${searchPattern},ticker.ilike.${searchPattern}`;
      countQuery = countQuery.or(orFilter);
      dataQuery = dataQuery.or(orFilter);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (dataResult.error) {
      throw new Error(`SEC query failed: ${dataResult.error.message}`);
    }

    return {
      data: (dataResult.data ?? []) as SecFiling[],
      count: countResult.count ?? 0,
    };
  })();

  // ── Execute all queries concurrently ────────────────────────────────────
  try {
    const [sourceStatus, trials, fda, sec] = await Promise.all([
      sourceStatusPromise,
      trialsPromise,
      fdaPromise,
      secPromise,
    ]);

    if (sourceStatus.error) {
      return NextResponse.json(
        { success: false as const, error: 'Failed to fetch data source status.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true as const,
        sources: (sourceStatus.data ?? []) as DataSourceStatus[],
        feed: {
          trials: trials.data,
          fda: fda.data,
          sec: sec.data,
        },
        counts: {
          trials: trials.count,
          fda: fda.count,
          sec: sec.count,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error.';
    console.error('[intelligence/feed] Query error:', message);

    return NextResponse.json({ success: false as const, error: message }, { status: 500 });
  }
}
