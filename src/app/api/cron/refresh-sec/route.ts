import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// SEC EDGAR Full-Text Search — Weekly deal announcement scan
// Free, no auth. Rate limit: 10 req/sec, User-Agent required
// Uses EDGAR EFTS (Elasticsearch Full-Text Search) API
// ────────────────────────────────────────────────────────────

const EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const EDGAR_FILING_BASE = 'https://www.sec.gov/Archives/edgar/data';
const USER_AGENT = 'Terrain Intelligence Platform contact@ambrosiaventures.co';

// Keywords for deal/partnership full-text search queries
const SEARCH_QUERIES = [
  '"license agreement" OR "collaboration agreement"',
  '"co-development agreement" OR "exclusive license"',
  '"acquisition" OR "merger agreement"',
  '"asset purchase" OR "option agreement"',
  '"milestone payment" OR "upfront payment"',
];

// Major biopharma/medtech companies to track (CIK numbers)
const TRACKED_CIKS = new Set([
  // Pharma majors
  '0000078003', // Pfizer
  '0000310158', // Merck
  '0000200406', // Johnson & Johnson
  '0001551152', // AbbVie
  '0000014272', // Bristol-Myers Squibb
  '0000059478', // Eli Lilly
  '0000318154', // Amgen
  '0000820081', // Roche/Genentech
  '0000901832', // AstraZeneca
  '0001114448', // Novartis
  '0001121404', // Sanofi
  '0000882095', // Gilead Sciences
  '0000872589', // Regeneron
  '0000875320', // Vertex
  '0001682852', // Moderna
  '0001776985', // BioNTech
  '0000875045', // Biogen
  '0001178670', // Alnylam
  '0001060349', // Seagen
  '0000879169', // Incyte
  // MedTech majors
  '0001613103', // Medtronic
  '0000001800', // Abbott Laboratories
  '0000885725', // Boston Scientific
  '0000310764', // Stryker
  '0001099800', // Edwards Lifesciences
  '0001035267', // Intuitive Surgical
  '0000880149', // Hologic
  '0001124140', // Exact Sciences
  '0001576280', // Guardant Health
  '0001604821', // Natera
]);

// Biopharma/MedTech SIC codes — keep filings from any company in these sectors
const LIFE_SCIENCES_SICS = new Set([
  '2830',
  '2833',
  '2834',
  '2835',
  '2836', // Pharma & biotech
  '2860', // Industrial chemicals (some biotech)
  '3841',
  '3842',
  '3844',
  '3845', // Medical devices & instruments
  '3826',
  '3827', // Laboratory instruments
  '8000',
  '8011',
  '8049',
  '8071',
  '8099', // Health services
]);

// 8-K item codes indicating deal activity
// 1.01 = Entry into a Material Definitive Agreement
// 2.01 = Completion of Acquisition or Disposition of Assets
const DEAL_ITEMS = new Set(['1.01', '2.01']);

// Actual EFTS _source field structure
interface EFTSSource {
  adsh?: string;
  ciks?: string[];
  display_names?: string[];
  root_forms?: string[];
  form?: string;
  file_date?: string;
  file_type?: string;
  file_description?: string;
  sics?: string[];
  biz_locations?: string[];
  items?: string[];
  period_ending?: string;
}

function parseDisplayName(displayName: string): { name: string; ticker: string | null } {
  const tickerMatch = displayName.match(/\(([A-Z]{1,6}(?:,\s*[A-Z]{1,6})*)\)/);
  const nameMatch = displayName.match(/^(.+?)\s{2,}\(/);
  return {
    name: nameMatch?.[1]?.trim() ?? displayName.replace(/\s+\(CIK.*$/, '').trim(),
    ticker: tickerMatch?.[1]?.split(',')[0]?.trim() ?? null,
  };
}

async function fetchDealFilings(query: string, startDate: string, endDate: string): Promise<EFTSSource[]> {
  const params = new URLSearchParams({
    q: query,
    forms: '8-K,8-K/A',
    dateRange: 'custom',
    startdt: startDate,
    enddt: endDate,
  });

  const url = `${EDGAR_SEARCH}?${params}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.warn('edgar_efts_fetch_failed', { query, status: res.status, body: body.slice(0, 200) });
    return [];
  }

  const data = await res.json();
  return (data.hits?.hits ?? []).map((hit: { _source: EFTSSource }) => hit._source);
}

function isRelevantFiling(source: EFTSSource): boolean {
  const ciks = source.ciks ?? [];
  const sics = source.sics ?? [];

  // Keep if company is in our tracked list
  if (ciks.some((c) => TRACKED_CIKS.has(c))) return true;

  // Keep if it's a life sciences company with a deal-relevant 8-K item
  const isLifeSciences = sics.some((s) => LIFE_SCIENCES_SICS.has(s));
  const hasDealItem = (source.items ?? []).some((i) => DEAL_ITEMS.has(i));
  if (isLifeSciences && hasDealItem) return true;

  return false;
}

function parseFiling(source: EFTSSource) {
  if (!source.adsh) return null;

  const displayName = source.display_names?.[0] ?? 'Unknown';
  const { name, ticker } = parseDisplayName(displayName);
  const cik = source.ciks?.[0] ?? null;

  // Build SEC filing URL
  const accessionClean = source.adsh.replace(/-/g, '');
  const cikClean = (cik ?? '').replace(/^0+/, '');
  const fileUrl = cikClean
    ? `${EDGAR_FILING_BASE}/${cikClean}/${accessionClean}`
    : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&accession=${source.adsh}`;

  // Determine deal relevance from 8-K items
  const items = source.items ?? [];
  const hasDealItem = items.some((i) => DEAL_ITEMS.has(i));
  const isTracked = (source.ciks ?? []).some((c) => TRACKED_CIKS.has(c));

  // Build description from available metadata
  const formType = source.form ?? source.root_forms?.[0] ?? '8-K';
  const itemDescriptions: Record<string, string> = {
    '1.01': 'Material Definitive Agreement',
    '2.01': 'Acquisition/Disposition of Assets',
    '2.02': 'Results of Operations',
    '2.03': 'Creation of Obligation',
    '3.02': 'Unregistered Sales of Equity Securities',
    '5.02': 'Departure/Election of Officers',
    '7.01': 'Regulation FD Disclosure',
    '8.01': 'Other Events',
    '9.01': 'Financial Statements and Exhibits',
  };
  const itemLabels = items
    .filter((i) => i !== '9.01') // Skip the generic "exhibits" item
    .map((i) => itemDescriptions[i] ?? `Item ${i}`)
    .slice(0, 3);
  const description = itemLabels.length > 0 ? itemLabels.join('; ') : (source.file_description ?? '');

  // Deal keywords — since EFTS matched our search query, we know the filing text
  // contains deal keywords. Use items to refine which keywords are relevant.
  const dealKeywords: string[] = [];
  if (items.includes('1.01')) dealKeywords.push('material agreement');
  if (items.includes('2.01')) dealKeywords.push('acquisition');

  return {
    accession_number: source.adsh,
    company_name: name,
    ticker,
    cik,
    form_type: formType,
    filed_date: source.file_date ?? new Date().toISOString().split('T')[0],
    description,
    file_url: fileUrl,
    is_deal_related: hasDealItem || isTracked,
    deal_keywords: dealKeywords,
  };
}

// ────────────────────────────────────────────────────────────
// GET /api/cron/refresh-sec
// Schedule: Weekly (Monday 4 AM UTC)
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  // Mark source as running
  await supabase.from('data_source_status').upsert({
    id: 'sec_edgar',
    display_name: 'SEC EDGAR Filings',
    source_url: 'https://efts.sec.gov/LATEST/search-index',
    refresh_frequency: 'weekly',
    status: 'running',
    updated_at: new Date().toISOString(),
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const errors: string[] = [];

  const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  // Deduplicate filings by accession number across queries
  const seenAccessions = new Set<string>();
  const allFilings: EFTSSource[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const sources = await fetchDealFilings(query, startDate, endDate);
      for (const source of sources) {
        if (source.adsh && !seenAccessions.has(source.adsh)) {
          seenAccessions.add(source.adsh);
          if (isRelevantFiling(source)) {
            allFilings.push(source);
          }
        }
      }
      totalFetched += sources.length;

      // Respect SEC rate limit: 10 req/sec
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      errors.push(
        `Fetch error for query "${query.slice(0, 40)}...": ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Parse and upsert
  const parsed = allFilings.map(parseFiling).filter(Boolean);

  if (parsed.length > 0) {
    // Batch upsert in chunks of 50
    for (let i = 0; i < parsed.length; i += 50) {
      const chunk = parsed.slice(i, i + 50).map((f) => ({
        ...f,
        raw_data: {},
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('sec_filings_cache').upsert(chunk, { onConflict: 'accession_number' });

      if (error) {
        errors.push(`Upsert chunk error: ${error.message}`);
      } else {
        totalUpserted += chunk.length;
      }
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Count total records
  const { count } = await supabase.from('sec_filings_cache').select('accession_number', { count: 'exact', head: true });

  // Update source status
  await supabase.from('data_source_status').upsert({
    id: 'sec_edgar',
    display_name: 'SEC EDGAR Filings',
    source_url: 'https://efts.sec.gov/LATEST/search-index',
    refresh_frequency: 'weekly',
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    records_count: count ?? 0,
    status: errors.length > 0 ? 'error' : 'success',
    last_error: errors.length > 0 ? errors.join('; ') : null,
    updated_at: new Date().toISOString(),
  });

  logger.info('cron_refresh_sec_complete', {
    queriesRun: SEARCH_QUERIES.length,
    totalFetched,
    uniqueFilings: allFilings.length,
    totalUpserted,
    totalCached: count ?? 0,
    errors: errors.length,
    durationMs,
  });

  return NextResponse.json({
    success: true,
    queriesRun: SEARCH_QUERIES.length,
    fetched: totalFetched,
    uniqueRelevant: allFilings.length,
    upserted: totalUpserted,
    cached: count ?? 0,
    errors: errors.length,
    durationMs,
  });
}
