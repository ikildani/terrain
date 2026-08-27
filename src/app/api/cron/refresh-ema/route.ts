import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';

const EmaRecordSchema = z.object({
  medicine_name: z.string().max(500),
  inn: z.string().max(500).nullable(),
  therapeutic_area: z.string().max(500).nullable(),
  condition: z.string().max(1000).nullable(),
  authorisation_status: z.string().max(100).nullable(),
  marketing_authorisation_holder: z.string().max(500).nullable(),
  authorisation_date: z.string().max(30).nullable(),
  medicine_url: z.string().max(1000).nullable(),
  atc_code: z.string().max(20).nullable(),
  active_substance: z.string().max(500).nullable(),
  medicine_type: z.string().max(200).nullable(),
});

// ────────────────────────────────────────────────────────────
// EMA Medicines API — Daily refresh
// Public endpoint, no auth required.
// Docs: https://www.ema.europa.eu/en/medicines/download-medicine-data
// ────────────────────────────────────────────────────────────

const EMA_API = 'https://medicines.api.ema.europa.eu/human-medicines';

interface EmaMedicine {
  medicineName?: string;
  inn?: string;
  therapeuticArea?: string;
  condition?: string;
  authorisationStatus?: string;
  marketingAuthorisationHolder?: string;
  firstPublishedDate?: string;
  revisionDate?: string;
  url?: string;
  atcCode?: string;
  activeSubstance?: string;
  medicineType?: string;
}

async function fetchRecentEmaApprovals(): Promise<EmaMedicine[]> {
  const results: EmaMedicine[] = [];

  // Fetch recently authorized medicines (last 90 days for overlap)
  try {
    const res = await fetch(`${EMA_API}?pageSize=100&page=1`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      // Fallback: try the EMA RSS feed for human medicines
      logger.warn('ema_api_failed_trying_rss', { status: res.status });
      return await fetchFromEmaRss();
    }

    const data = await res.json();
    if (data?.content && Array.isArray(data.content)) {
      results.push(...data.content);
    } else if (Array.isArray(data)) {
      results.push(...data);
    }
  } catch (err) {
    logger.warn('ema_api_error_trying_rss', { error: err instanceof Error ? err.message : String(err) });
    return await fetchFromEmaRss();
  }

  return results;
}

async function fetchFromEmaRss(): Promise<EmaMedicine[]> {
  const RSS_URL = 'https://www.ema.europa.eu/en/rss/human-medicines';
  const results: EmaMedicine[] = [];

  try {
    const res = await fetch(RSS_URL, {
      headers: { Accept: 'application/xml, text/xml' },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      logger.error('ema_rss_failed', { status: res.status });
      return [];
    }

    const xml = await res.text();
    // Simple XML parsing for RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const titleMatch = titleRegex.exec(item);
      const linkMatch = linkRegex.exec(item);
      const dateMatch = pubDateRegex.exec(item);
      const descMatch = descRegex.exec(item);

      const title = titleMatch?.[1] || titleMatch?.[2] || '';
      const link = linkMatch?.[1] || '';
      const date = dateMatch?.[1] || '';
      const desc = descMatch?.[1] || descMatch?.[2] || '';

      if (title) {
        results.push({
          medicineName: title.trim(),
          condition: desc.trim() || undefined,
          url: link.trim() || undefined,
          firstPublishedDate: date ? new Date(date).toISOString().split('T')[0] : undefined,
          authorisationStatus: 'Authorised',
        });
      }
    }
  } catch (err) {
    logger.error('ema_rss_parse_error', { error: err instanceof Error ? err.message : String(err) });
  }

  return results;
}

function parseEmaMedicine(med: EmaMedicine) {
  return {
    medicine_name: med.medicineName || 'Unknown',
    inn: med.inn || med.activeSubstance || undefined,
    therapeutic_area: med.therapeuticArea || undefined,
    condition: med.condition || undefined,
    authorisation_status: med.authorisationStatus || undefined,
    marketing_authorisation_holder: med.marketingAuthorisationHolder || undefined,
    authorisation_date: med.firstPublishedDate || med.revisionDate || undefined,
    medicine_url: med.url || undefined,
    atc_code: med.atcCode || undefined,
    active_substance: med.activeSubstance || med.inn || undefined,
    medicine_type: med.medicineType || undefined,
  };
}

// ────────────────────────────────────────────────────────────
// GET /api/cron/refresh-ema
// Schedule: Daily at 7 AM UTC
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  await supabase.from('data_source_status').upsert({
    id: 'ema_approvals',
    display_name: 'EMA Human Medicines (European Medicines Agency)',
    source_url: 'https://www.ema.europa.eu/en/medicines',
    refresh_frequency: 'daily',
    status: 'running',
    updated_at: new Date().toISOString(),
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const errors: string[] = [];

  try {
    const results = await fetchRecentEmaApprovals();
    totalFetched = results.length;

    const rawParsed = results.map(parseEmaMedicine);

    const parsed: z.infer<typeof EmaRecordSchema>[] = [];
    for (const record of rawParsed) {
      const validated = EmaRecordSchema.safeParse(record);
      if (validated.success) {
        parsed.push(validated.data);
      } else {
        logger.warn('ema_record_validation_failed', {
          medicineName: record?.medicine_name,
          issues: validated.error.issues.map((i) => i.message).join('; '),
        });
      }
    }

    if (parsed.length > 0) {
      for (let i = 0; i < parsed.length; i += 50) {
        const chunk = parsed.slice(i, i + 50).map((r) => ({
          ...r,
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from('ema_approvals_cache').upsert(chunk, { onConflict: 'medicine_name' });

        if (error) {
          errors.push(`Upsert chunk error: ${error.message}`);
        } else {
          totalUpserted += chunk.length;
        }
      }
    }
  } catch (err) {
    captureApiError(err, { route: '/api/cron/refresh-ema' });
    errors.push(`Fetch error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const durationMs = Math.round(performance.now() - startTime);

  const { count } = await supabase.from('ema_approvals_cache').select('medicine_name', { count: 'exact', head: true });

  const status = errors.length > 0 ? 'error' : totalFetched === 0 ? 'warning' : 'success';

  await supabase.from('data_source_status').upsert({
    id: 'ema_approvals',
    display_name: 'EMA Human Medicines (European Medicines Agency)',
    source_url: 'https://www.ema.europa.eu/en/medicines',
    refresh_frequency: 'daily',
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    records_count: count ?? 0,
    status,
    last_error: errors.length > 0 ? errors.join('; ') : undefined,
    updated_at: new Date().toISOString(),
  });

  logger.info('cron_refresh_ema_complete', {
    totalFetched,
    totalUpserted,
    totalCached: count ?? 0,
    errors: errors.length,
    durationMs,
  });

  try {
    const { notifyCronSuccess, notifyCronFailure } = await import('@/lib/slack');
    if (errors.length > 0) {
      await notifyCronFailure(
        'refresh-ema',
        `${errors.length} errors. Fetched: ${totalFetched}, Upserted: ${totalUpserted}`,
      );
    } else {
      await notifyCronSuccess(
        'refresh-ema',
        `Fetched: ${totalFetched}, Upserted: ${totalUpserted}, Total: ${count ?? 0}`,
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
  });
}
