import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { queryPerplexity } from '@/lib/perplexity';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import { THERAPY_AREAS } from '@/lib/intelligence/enrichment-pipeline';

// ────────────────────────────────────────────────────────────
// POST /api/admin/bulk-enrich
//
// Triggers bulk enrichment for specified therapy areas.
// Protected by ADMIN_API_KEY or CRON_SECRET bearer token.
//
// Query params:
//   therapy_areas — comma-separated list (optional, defaults to thin TAs)
//   all           — set to "true" to enrich all 18 TAs
//
// Vercel Pro function limit: 5 minutes (300s)
// ────────────────────────────────────────────────────────────

export const maxDuration = 300; // 5 minute Vercel timeout

const THIN_TAS = [
  'dermatology',
  'musculoskeletal',
  'pain_management',
  'gastroenterology',
  'hepatology',
  'hematology',
  'ophthalmology',
  'nephrology',
  'pulmonology',
  'metabolic',
] as const;

const DELAY_BETWEEN_QUERIES_MS = 1_000;
const DELAY_BETWEEN_TAS_MS = 2_000;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function isAdminAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  if (!token) return false;

  // Check against ADMIN_API_KEY first, then CRON_SECRET
  const secrets = [process.env.ADMIN_API_KEY, process.env.CRON_SECRET].filter(Boolean) as string[];

  for (const secret of secrets) {
    try {
      const a = Buffer.from(token);
      const b = Buffer.from(secret);
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      continue;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Indication parser (inline to avoid pulling in static data deps during bulk run)
// ---------------------------------------------------------------------------

interface ParsedIndication {
  name: string;
  synonyms: string[];
  prevalence: number;
  incidence: number;
  diagnosisRate: number;
  treatmentRate: number;
  competitors: string[];
  growthDriver: string;
}

function parseIndicationsFromResponse(content: string, therapyArea: string): ParsedIndication[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 10);
  const results: ParsedIndication[] = [];
  const seenNames = new Set<string>();

  for (const line of lines) {
    const nameMatch = line.match(/^[\s*\-\d.)*]*\*?\*?([A-Z][^:,\n]{3,60})/);
    if (!nameMatch) continue;

    const name = nameMatch[1].replace(/\*+/g, '').trim();
    if (name.length < 4 || name.length > 80) continue;
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    if (/^(here|the|these|some|key|major|other|common|list|below)/i.test(name)) continue;

    const prevMatch = line.match(/(\d[\d,._]*)\s*(million|thousand|patients|cases|people|affected)/i);
    let prevalence = 0;
    if (prevMatch) {
      let num = parseFloat(prevMatch[1].replace(/[,_]/g, ''));
      if (prevMatch[2].toLowerCase() === 'million') num *= 1_000_000;
      else if (prevMatch[2].toLowerCase() === 'thousand') num *= 1_000;
      prevalence = Math.round(num);
    }

    const competitors: string[] = [];
    const compMatch = line.match(/(?:by|from|companies?:?|competitors?:?|drugs?:?)\s*([^.]+)/i);
    if (compMatch) {
      competitors.push(
        ...compMatch[1]
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2 && s.length < 60),
      );
    }

    let treatmentRate = 0.5;
    const trMatch = line.match(/treatment\s*rate\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/i);
    if (trMatch) {
      treatmentRate = Math.min(parseFloat(trMatch[1]) / 100, 1);
    }

    seenNames.add(nameKey);
    results.push({
      name,
      synonyms: [],
      prevalence: prevalence || 0,
      incidence: prevalence ? Math.round(prevalence * 0.1) : 0,
      diagnosisRate: 0.7,
      treatmentRate,
      competitors: competitors.slice(0, 5),
      growthDriver: `Active clinical development in ${therapyArea.replace(/_/g, ' ')}`,
    });
  }

  return results.slice(0, 25);
}

// ---------------------------------------------------------------------------
// Build the 3 queries for a therapy area
// ---------------------------------------------------------------------------

function buildQueries(therapyArea: string): string[] {
  const displayTA = therapyArea.replace(/_/g, ' ');
  return [
    `List all major pharmaceutical indications actively being targeted in ${displayTA} therapeutics as of 2026. For each provide: exact disease name, US prevalence (number of patients), annual US incidence, percentage of diagnosed patients receiving treatment, and top 3 competing approved drugs with their companies. Be specific with numbers and cite sources.`,
    `List emerging and rare indications in ${displayTA} with active Phase 1-3 clinical programs as of 2026. Include disease name, estimated US patient population, current standard of care, and companies with assets in development.`,
    `What are the highest unmet need indications in ${displayTA} where no approved therapy exists or current treatments are inadequate? Include disease name, US prevalence, and why current options fail.`,
  ];
}

// ---------------------------------------------------------------------------
// Sleep utility
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Enrich a single therapy area
// ---------------------------------------------------------------------------

interface TAResult {
  therapy_area: string;
  discovered: number;
  added: number;
  errors: string[];
}

async function enrichTherapyArea(
  therapyArea: string,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<TAResult> {
  const result: TAResult = {
    therapy_area: therapyArea,
    discovered: 0,
    added: 0,
    errors: [],
  };

  const queries = buildQueries(therapyArea);
  const allIndications: ParsedIndication[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < queries.length; i++) {
    const queryLabel = ['major', 'emerging/rare', 'unmet need'][i];

    const pResult = await queryPerplexity(queries[i]);
    if (!pResult?.content) {
      result.errors.push(`Query ${i + 1} (${queryLabel}) returned no content`);
    } else {
      const parsed = parseIndicationsFromResponse(pResult.content, therapyArea);
      for (const ind of parsed) {
        const key = ind.name.toLowerCase();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          allIndications.push(ind);
        }
      }
    }

    if (i < queries.length - 1) {
      await sleep(DELAY_BETWEEN_QUERIES_MS);
    }
  }

  result.discovered = allIndications.length;

  for (const ind of allIndications) {
    try {
      const { data: existing } = await supabase.from('enriched_indications').select('id').eq('name', ind.name).single();

      if (existing) continue;

      const { error } = await supabase.from('enriched_indications').insert({
        name: ind.name,
        therapy_area: therapyArea,
        synonyms: ind.synonyms,
        us_prevalence: ind.prevalence || null,
        us_incidence: ind.incidence || null,
        diagnosis_rate: ind.diagnosisRate || null,
        treatment_rate: ind.treatmentRate || null,
        major_competitors: ind.competitors,
        market_growth_driver: ind.growthDriver,
        prevalence_source: 'Perplexity AI (sourced from WHO/CDC/FDA databases)',
        enrichment_source: 'perplexity',
        confidence: 'medium',
      });

      if (error) {
        if (error.code === '23505') continue; // unique constraint — already exists
        result.errors.push(`Insert failed for ${ind.name}: ${error.message}`);
      } else {
        result.added++;
      }
    } catch (err) {
      result.errors.push(`Error: ${ind.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // Log the enrichment run
  try {
    await supabase.from('enrichment_runs').insert({
      therapy_area: therapyArea,
      run_type: 'indications',
      items_discovered: result.discovered,
      items_added: result.added,
      items_updated: 0,
      errors: result.errors.slice(0, 10),
      completed_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical
  }

  return result;
}

// ---------------------------------------------------------------------------
// Ensure enrichment tables exist
// ---------------------------------------------------------------------------

async function ensureTablesExist(supabase: ReturnType<typeof createAdminClient>): Promise<boolean> {
  const { error } = await supabase.from('enriched_indications').select('id').limit(1);

  if (error && error.message.includes('does not exist')) {
    // Tables missing — caller needs to run migration
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  // Parse which TAs to enrich
  const url = new URL(request.url);
  const allParam = url.searchParams.get('all') === 'true';
  const taParam = url.searchParams.get('therapy_areas');

  let targetTAs: string[];

  if (taParam) {
    const specified = taParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    targetTAs = specified.filter((ta) => (THERAPY_AREAS as readonly string[]).includes(ta));
    if (targetTAs.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid therapy_areas parameter',
          valid: [...THERAPY_AREAS],
        },
        { status: 400 },
      );
    }
  } else if (allParam) {
    targetTAs = [...THERAPY_AREAS];
  } else {
    targetTAs = [...THIN_TAS];
  }

  logger.info('Bulk enrichment started', {
    route: '/api/admin/bulk-enrich',
    therapy_areas: targetTAs,
    count: targetTAs.length,
  });

  const supabase = createAdminClient();

  // Check tables exist
  const tablesExist = await ensureTablesExist(supabase);
  if (!tablesExist) {
    return NextResponse.json(
      {
        error: 'Enrichment tables do not exist. Run migration 027 first.',
        migration: 'supabase/migrations/20240101000027_enrichment_tables.sql',
      },
      { status: 503 },
    );
  }

  const results: TAResult[] = [];

  try {
    for (let i = 0; i < targetTAs.length; i++) {
      const ta = targetTAs[i];

      // Check if we're approaching the 5-minute timeout (leave 30s buffer)
      const elapsed = Date.now() - startTime;
      if (elapsed > 270_000) {
        logger.warn('Bulk enrichment approaching timeout, stopping early', {
          completed: i,
          total: targetTAs.length,
          elapsed_ms: elapsed,
        });
        break;
      }

      logger.info(`Enriching ${ta} (${i + 1}/${targetTAs.length})`);
      const taResult = await enrichTherapyArea(ta, supabase);
      results.push(taResult);

      logger.info(`[${ta}] Discovered ${taResult.discovered}, added ${taResult.added} new`, {
        therapy_area: ta,
        discovered: taResult.discovered,
        added: taResult.added,
        errors: taResult.errors.length,
      });

      if (i < targetTAs.length - 1) {
        await sleep(DELAY_BETWEEN_TAS_MS);
      }
    }
  } catch (error) {
    captureApiError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/admin/bulk-enrich',
    });
    logger.error('Bulk enrichment failed', { error: String(error) });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        partial_results: results,
        duration_ms: Date.now() - startTime,
      },
      { status: 500 },
    );
  }

  const totalDiscovered = results.reduce((sum, r) => sum + r.discovered, 0);
  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  logger.info('Bulk enrichment complete', {
    route: '/api/admin/bulk-enrich',
    therapy_areas_completed: results.length,
    total_discovered: totalDiscovered,
    total_added: totalAdded,
    total_errors: totalErrors,
    duration_ms: Date.now() - startTime,
  });

  return NextResponse.json({
    success: true,
    summary: {
      therapy_areas_completed: results.length,
      therapy_areas_requested: targetTAs.length,
      total_discovered: totalDiscovered,
      total_added: totalAdded,
      total_errors: totalErrors,
      duration_ms: Date.now() - startTime,
    },
    results,
  });
}
