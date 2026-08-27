import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

const PubmedRecordSchema = z.object({
  pmid: z.string().max(20),
  title: z.string().max(2000),
  authors: z.array(z.string().max(200)).max(100),
  journal: z.string().max(500).nullable(),
  pub_date: z.string().max(30).nullable(),
  abstract_snippet: z.string().max(3000).nullable(),
  therapeutic_area: z.string().max(100),
  doi: z.string().max(200).nullable(),
});

// ────────────────────────────────────────────────────────────
// PubMed E-Utilities — Weekly refresh
// Free, no auth required (within rate limits: 3 req/sec without API key)
// Docs: https://www.ncbi.nlm.nih.gov/books/NBK25497/
// ────────────────────────────────────────────────────────────

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.NCBI_API_KEY; // Optional: raises limit to 10 req/sec

const TA_QUERIES: { ta: string; query: string }[] = [
  {
    ta: 'oncology',
    query: '(oncology OR cancer) AND (clinical trial results OR drug approval) AND (licensing OR partnership)',
  },
  {
    ta: 'neurology',
    query: '(neurology OR neurological) AND (clinical trial OR drug development) AND (licensing OR partnering)',
  },
  { ta: 'immunology', query: '(immunology OR autoimmune) AND (clinical trial results) AND (biologic OR antibody)' },
  { ta: 'rare_disease', query: '(rare disease OR orphan drug) AND (clinical trial OR FDA approval)' },
  { ta: 'cardiovascular', query: '(cardiovascular OR cardiology) AND (clinical trial results OR drug approval)' },
  { ta: 'metabolic', query: '(metabolic OR diabetes OR obesity) AND (clinical trial OR drug development)' },
  { ta: 'infectious_disease', query: '(infectious disease OR antiviral OR antibiotic) AND (clinical trial results)' },
  { ta: 'hematology', query: '(hematology OR blood cancer OR lymphoma) AND (clinical trial results OR drug approval)' },
  { ta: 'dermatology', query: '(dermatology OR skin disease) AND (clinical trial OR drug development)' },
  { ta: 'ophthalmology', query: '(ophthalmology OR retinal OR macular) AND (clinical trial results)' },
];

interface ESearchResult {
  esearchresult?: { idlist?: string[]; count?: string };
}

interface EFetchArticle {
  MedlineCitation?: {
    PMID?: { '#text'?: string };
    Article?: {
      ArticleTitle?: string;
      AuthorList?: { Author?: { LastName?: string; ForeName?: string }[] };
      Journal?: { Title?: string };
      Abstract?: { AbstractText?: string | { '#text'?: string }[] };
      ELocationID?: { '#text'?: string; '@EIdType'?: string }[];
      ArticleDate?: { Year?: string; Month?: string; Day?: string }[];
    };
  };
}

async function searchPubMed(query: string, maxResults: number = 20): Promise<string[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const minDate = `${thirtyDaysAgo.getFullYear()}/${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}/${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(maxResults),
    sort: 'date',
    datetype: 'pdat',
    mindate: minDate,
    retmode: 'json',
    ...(API_KEY ? { api_key: API_KEY } : {}),
  });

  const res = await fetch(`${EUTILS_BASE}/esearch.fcgi?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return [];

  const data: ESearchResult = await res.json();
  return data.esearchresult?.idlist ?? [];
}

async function fetchArticleDetails(pmids: string[]): Promise<EFetchArticle[]> {
  if (pmids.length === 0) return [];

  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'xml',
    rettype: 'abstract',
    ...(API_KEY ? { api_key: API_KEY } : {}),
  });

  const res = await fetch(`${EUTILS_BASE}/efetch.fcgi?${params}`, {
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return [];

  const xml = await res.text();
  return parseEFetchXml(xml);
}

function parseEFetchXml(xml: string): EFetchArticle[] {
  const articles: EFetchArticle[] = [];
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;

  let match;
  while ((match = articleRegex.exec(xml)) !== null) {
    const block = match[1];

    const pmidMatch = /<PMID[^>]*>(.*?)<\/PMID>/.exec(block);
    const titleMatch = /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/.exec(block);
    const journalMatch = /<Title>(.*?)<\/Title>/.exec(block);
    const abstractMatch = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/.exec(block);
    const doiMatch = /<ELocationID EIdType="doi"[^>]*>(.*?)<\/ELocationID>/.exec(block);

    // Extract authors
    const authorNames: string[] = [];
    const authorRegex =
      /<Author[^>]*>[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?<ForeName>(.*?)<\/ForeName>[\s\S]*?<\/Author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(block)) !== null) {
      authorNames.push(`${authorMatch[2]} ${authorMatch[1]}`);
    }

    // Extract date
    const yearMatch = /<PubDate>[\s\S]*?<Year>(.*?)<\/Year>/.exec(block);
    const monthMatch = /<PubDate>[\s\S]*?<Month>(.*?)<\/Month>/.exec(block);
    const dayMatch = /<PubDate>[\s\S]*?<Day>(.*?)<\/Day>/.exec(block);
    const pubDate = yearMatch
      ? `${yearMatch[1]}-${monthMatch?.[1]?.padStart(2, '0') ?? '01'}-${dayMatch?.[1]?.padStart(2, '0') ?? '01'}`
      : null;

    if (pmidMatch) {
      articles.push({
        MedlineCitation: {
          PMID: { '#text': pmidMatch[1] },
          Article: {
            ArticleTitle: titleMatch?.[1]?.replace(/<[^>]+>/g, '') ?? 'Untitled',
            AuthorList: {
              Author: authorNames.map((n) => ({
                ForeName: n.split(' ')[0],
                LastName: n.split(' ').slice(1).join(' '),
              })),
            },
            Journal: { Title: journalMatch?.[1] ?? null },
            Abstract: { AbstractText: abstractMatch?.[1]?.replace(/<[^>]+>/g, '').slice(0, 2000) ?? null },
            ELocationID: doiMatch ? [{ '#text': doiMatch[1], '@EIdType': 'doi' }] : [],
            ArticleDate: pubDate
              ? [{ Year: pubDate.split('-')[0], Month: pubDate.split('-')[1], Day: pubDate.split('-')[2] }]
              : [],
          },
        },
      });
    }
  }

  return articles;
}

function parseArticle(article: EFetchArticle, ta: string) {
  const citation = article.MedlineCitation;
  const art = citation?.Article;

  const pmid = citation?.PMID?.['#text'];
  if (!pmid) return null;

  const authors =
    art?.AuthorList?.Author?.map((a) => `${a.ForeName ?? ''} ${a.LastName ?? ''}`.trim()).filter(Boolean) ?? [];

  const dateArr = art?.ArticleDate?.[0];
  const pubDate = dateArr
    ? `${dateArr.Year}-${dateArr.Month?.padStart(2, '0')}-${dateArr.Day?.padStart(2, '0')}`
    : null;

  const abstractText =
    typeof art?.Abstract?.AbstractText === 'string'
      ? art.Abstract.AbstractText
      : Array.isArray(art?.Abstract?.AbstractText)
        ? art.Abstract.AbstractText.map((t) => (typeof t === 'string' ? t : (t?.['#text'] ?? ''))).join(' ')
        : null;

  const doi = art?.ELocationID?.find((e) => e['@EIdType'] === 'doi')?.['#text'] ?? null;

  return {
    pmid,
    title: (art?.ArticleTitle ?? 'Untitled').slice(0, 2000),
    authors: authors.slice(0, 100),
    journal: (art?.Journal?.Title ?? null)?.slice(0, 500) ?? null,
    pub_date: pubDate,
    abstract_snippet: abstractText?.slice(0, 3000) ?? null,
    therapeutic_area: ta,
    doi,
  };
}

// ────────────────────────────────────────────────────────────
// GET /api/cron/refresh-pubmed
// Schedule: Weekly (Wednesdays 4 AM UTC)
// ────────────────────────────────────────────────────────────

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  await supabase.from('data_source_status').upsert({
    id: 'pubmed_literature',
    display_name: 'PubMed Scientific Literature (NCBI)',
    source_url: 'https://pubmed.ncbi.nlm.nih.gov/',
    refresh_frequency: 'weekly',
    status: 'running',
    updated_at: new Date().toISOString(),
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const errors: string[] = [];
  const taBreakdown: Record<string, number> = {};

  try {
    for (const { ta, query } of TA_QUERIES) {
      try {
        // Rate limiting: 300ms between requests (3 req/sec without API key)
        await new Promise((r) => setTimeout(r, API_KEY ? 100 : 350));

        const pmids = await searchPubMed(query, 15);
        if (pmids.length === 0) continue;

        await new Promise((r) => setTimeout(r, API_KEY ? 100 : 350));

        const articles = await fetchArticleDetails(pmids);
        totalFetched += articles.length;

        const parsed: z.infer<typeof PubmedRecordSchema>[] = [];
        for (const article of articles) {
          const record = parseArticle(article, ta);
          if (!record) continue;

          const validated = PubmedRecordSchema.safeParse(record);
          if (validated.success) {
            parsed.push(validated.data);
          }
        }

        if (parsed.length > 0) {
          const { error } = await supabase.from('pubmed_articles_cache').upsert(
            parsed.map((r) => ({ ...r, fetched_at: new Date().toISOString(), updated_at: new Date().toISOString() })),
            { onConflict: 'pmid' },
          );

          if (error) {
            errors.push(`${ta}: ${error.message}`);
          } else {
            totalUpserted += parsed.length;
            taBreakdown[ta] = parsed.length;
          }
        }
      } catch (err) {
        errors.push(`${ta}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    captureApiError(err, { route: '/api/cron/refresh-pubmed' });
    errors.push(`Top-level error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const durationMs = Math.round(performance.now() - startTime);

  const { count } = await supabase.from('pubmed_articles_cache').select('pmid', { count: 'exact', head: true });

  const status = errors.length > 0 ? 'error' : totalFetched === 0 ? 'warning' : 'success';

  await supabase.from('data_source_status').upsert({
    id: 'pubmed_literature',
    display_name: 'PubMed Scientific Literature (NCBI)',
    source_url: 'https://pubmed.ncbi.nlm.nih.gov/',
    refresh_frequency: 'weekly',
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    records_count: count ?? 0,
    status,
    last_error: errors.length > 0 ? errors.join('; ') : undefined,
    updated_at: new Date().toISOString(),
  });

  logger.info('cron_refresh_pubmed_complete', {
    totalFetched,
    totalUpserted,
    totalCached: count ?? 0,
    errors: errors.length,
    durationMs,
    taBreakdown,
  });

  try {
    const { notifyCronSuccess, notifyCronFailure } = await import('@/lib/slack');
    if (errors.length > 0) {
      await notifyCronFailure(
        'refresh-pubmed',
        `${errors.length} errors. Fetched: ${totalFetched}, Upserted: ${totalUpserted}`,
      );
    } else {
      const taList = Object.entries(taBreakdown)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      await notifyCronSuccess(
        'refresh-pubmed',
        `Fetched: ${totalFetched}, Upserted: ${totalUpserted}, Total: ${count ?? 0}. By TA: ${taList}`,
      );
    }
  } catch {}

  return NextResponse.json({
    success: true,
    fetched: totalFetched,
    upserted: totalUpserted,
    cached: count ?? 0,
    errors: errors.length,
    durationMs,
    taBreakdown,
  });
}
