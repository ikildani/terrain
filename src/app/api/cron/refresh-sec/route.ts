import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// SEC EDGAR Full-Text Search — Weekly deal announcement scan
// Free, no auth. Rate limit: 10 req/sec, User-Agent required
// Docs: https://efts.sec.gov/LATEST/search-index
// ────────────────────────────────────────────────────────────

const EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const EDGAR_FILING_BASE = 'https://www.sec.gov/Archives/edgar/data';

// Keywords that signal deal/partnership activity in biopharma filings
const DEAL_KEYWORDS = [
  'license agreement',
  'collaboration agreement',
  'co-development agreement',
  'acquisition',
  'merger agreement',
  'asset purchase',
  'option agreement',
  'upfront payment',
  'milestone payment',
  'royalty',
  'exclusive license',
  'co-promotion',
  'strategic alliance',
];

// Major biopharma companies to track (CIK numbers)
const PHARMA_COMPANIES: { name: string; cik: string }[] = [
  { name: 'Pfizer', cik: '0000078003' },
  { name: 'Merck', cik: '0000310158' },
  { name: 'Johnson & Johnson', cik: '0000200406' },
  { name: 'AbbVie', cik: '0001551152' },
  { name: 'Bristol-Myers Squibb', cik: '0000014272' },
  { name: 'Eli Lilly', cik: '0000059478' },
  { name: 'Amgen', cik: '0000318154' },
  { name: 'Roche/Genentech', cik: '0000820081' },
  { name: 'AstraZeneca', cik: '0000901832' },
  { name: 'Novartis', cik: '0001114448' },
  { name: 'Sanofi', cik: '0001121404' },
  { name: 'Gilead Sciences', cik: '0000882095' },
  { name: 'Regeneron', cik: '0000872589' },
  { name: 'Vertex', cik: '0000875320' },
  { name: 'Moderna', cik: '0001682852' },
  { name: 'BioNTech', cik: '0001776985' },
  { name: 'Biogen', cik: '0000875045' },
  { name: 'Alnylam', cik: '0001178670' },
  { name: 'Seagen', cik: '0001060349' },
  { name: 'Incyte', cik: '0000879169' },
  // MedTech majors
  { name: 'Medtronic', cik: '0001613103' },
  { name: 'Abbott Laboratories', cik: '0000001800' },
  { name: 'Boston Scientific', cik: '0000885725' },
  { name: 'Stryker', cik: '0000310764' },
  { name: 'Edwards Lifesciences', cik: '0001099800' },
  { name: 'Intuitive Surgical', cik: '0001035267' },
  { name: 'Hologic', cik: '0000880149' },
  { name: 'Exact Sciences', cik: '0001124140' },
  { name: 'Guardant Health', cik: '0001576280' },
  { name: 'Natera', cik: '0001604821' },
];

interface EDGARFiling {
  accessionNo?: string;
  companyName?: string;
  companyNameFormatted?: string;
  ticker?: string;
  cik?: string;
  formType?: string;
  filedAt?: string;
  description?: string;
  documentFormatFiles?: { documentUrl?: string; type?: string; description?: string }[];
}

async function searchFilings(cik: string, companyName: string): Promise<EDGARFiling[]> {
  // SEC EDGAR EFTS search for recent 8-K filings (material events/agreements)
  const params = new URLSearchParams({
    q: DEAL_KEYWORDS.slice(0, 5).join(' OR '), // Top deal keywords
    dateRange: 'custom',
    startdt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enddt: new Date().toISOString().split('T')[0],
    forms: '8-K,8-K/A',
  });

  const url = `${EDGAR_SEARCH}?${params}&ciks=${cik}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Terrain Intelligence Platform contact@ambrosiaventures.co',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // EDGAR EFTS may not be available — fall back to standard full-text search
      return await searchFilingsFallback(cik, companyName);
    }

    const data = await res.json();
    return (data.hits?.hits ?? []).map((hit: { _source: EDGARFiling }) => ({
      ...hit._source,
      companyName,
    }));
  } catch {
    return await searchFilingsFallback(cik, companyName);
  }
}

async function searchFilingsFallback(cik: string, companyName: string): Promise<EDGARFiling[]> {
  // Fallback: use the standard EDGAR full-text search API
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22license+agreement%22+OR+%22collaboration+agreement%22&forms=8-K&dateRange=custom&startdt=${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&enddt=${new Date().toISOString().split('T')[0]}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Terrain Intelligence Platform contact@ambrosiaventures.co',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.hits?.hits ?? [])
      .filter((hit: { _source: EDGARFiling }) => {
        const src = hit._source;
        return src.cik === cik || (src.companyName ?? '').toLowerCase().includes(companyName.toLowerCase());
      })
      .map((hit: { _source: EDGARFiling }) => ({
        ...hit._source,
        companyName,
      }));
  } catch {
    return [];
  }
}

function parseFiling(filing: EDGARFiling) {
  if (!filing.accessionNo) return null;

  const description = filing.description ?? '';
  const descriptionLower = description.toLowerCase();

  // Check which deal keywords match
  const matchedKeywords = DEAL_KEYWORDS.filter((kw) => descriptionLower.includes(kw));
  const isDealRelated = matchedKeywords.length > 0;

  // Build SEC filing URL
  const accessionClean = (filing.accessionNo ?? '').replace(/-/g, '');
  const cikClean = (filing.cik ?? '').replace(/^0+/, '');
  const fileUrl = `${EDGAR_FILING_BASE}/${cikClean}/${accessionClean}`;

  return {
    accession_number: filing.accessionNo,
    company_name: filing.companyName ?? filing.companyNameFormatted ?? 'Unknown',
    ticker: filing.ticker ?? null,
    cik: filing.cik ?? null,
    form_type: filing.formType ?? '8-K',
    filed_date: filing.filedAt ?? new Date().toISOString().split('T')[0],
    description,
    file_url: fileUrl,
    is_deal_related: isDealRelated,
    deal_keywords: matchedKeywords,
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

  for (const company of PHARMA_COMPANIES) {
    try {
      const filings = await searchFilings(company.cik, company.name);
      totalFetched += filings.length;

      const parsed = filings.map(parseFiling).filter(Boolean);

      if (parsed.length > 0) {
        const rows = parsed.map((f) => ({
          ...f,
          raw_data: {},
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from('sec_filings_cache').upsert(rows, { onConflict: 'accession_number' });

        if (error) {
          errors.push(`Upsert error for ${company.name}: ${error.message}`);
        } else {
          totalUpserted += rows.length;
        }
      }

      // Respect SEC rate limit: 10 req/sec — be conservative
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      errors.push(`Fetch error for ${company.name}: ${err instanceof Error ? err.message : String(err)}`);
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
    companiesScanned: PHARMA_COMPANIES.length,
    totalFetched,
    totalUpserted,
    totalCached: count ?? 0,
    dealRelated: totalUpserted,
    errors: errors.length,
    durationMs,
  });

  return NextResponse.json({
    success: true,
    companiesScanned: PHARMA_COMPANIES.length,
    fetched: totalFetched,
    upserted: totalUpserted,
    cached: count ?? 0,
    errors: errors.length,
    durationMs,
  });
}
