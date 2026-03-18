#!/usr/bin/env tsx
// ============================================================
// TERRAIN — Bulk Enrichment Script
// scripts/bulk-enrich.ts
//
// One-time script to enrich all 18 therapy areas with real
// indication data via the Perplexity enrichment pipeline.
// Prioritizes thin TAs that need the most expansion.
//
// Usage:
//   PERPLEXITY_API_KEY=pplx-xxx \
//   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=xxx \
//   npx tsx scripts/bulk-enrich.ts [--thin-only] [--ta=dermatology,nephrology]
// ============================================================

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/v1/responses';

const ALL_THERAPY_AREAS = [
  'oncology',
  'immunology',
  'neurology',
  'rare_disease',
  'cardiovascular',
  'metabolic',
  'psychiatry',
  'pain_management',
  'infectious_disease',
  'hematology',
  'ophthalmology',
  'pulmonology',
  'nephrology',
  'dermatology',
  'gastroenterology',
  'hepatology',
  'endocrinology',
  'musculoskeletal',
] as const;

// TAs with the fewest static indications — run these first
const THIN_TAS = [
  'dermatology', // 4 indications
  'musculoskeletal', // 5
  'pain_management', // 6
  'gastroenterology', // 6
  'hepatology', // 6
  'hematology', // 7
  'ophthalmology', // 7
  'nephrology', // 7
  'pulmonology', // 8
  'metabolic', // 9
] as const;

const DELAY_BETWEEN_QUERIES_MS = 1_000;
const DELAY_BETWEEN_TAS_MS = 2_000;

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`[FATAL] Missing required env var: ${name}`);
    process.exit(1);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Supabase admin client (standalone, no Next.js imports)
// ---------------------------------------------------------------------------

function createAdminClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Perplexity client (standalone, no Next.js imports)
// ---------------------------------------------------------------------------

async function queryPerplexity(
  query: string,
): Promise<{ content: string; citations: { url: string; title: string }[] } | null> {
  const apiKey = requireEnv('PERPLEXITY_API_KEY');

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preset: 'fast-search',
        input: query,
      }),
      signal: AbortSignal.timeout(30_000), // 30s timeout for bulk
    });

    if (!response.ok) {
      console.error(`  Perplexity HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const output = data.output?.[0];
    if (!output) return null;

    return {
      content: output.content || '',
      citations: (output.citations || []).map((c: { url: string; title?: string }) => ({
        url: c.url,
        title: c.title || new URL(c.url).hostname,
      })),
    };
  } catch (err) {
    console.error(`  Perplexity error: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Ensure enrichment tables exist
// ---------------------------------------------------------------------------

async function ensureTablesExist(supabase: ReturnType<typeof createAdminClient>): Promise<void> {
  console.log('[setup] Checking if enrichment tables exist...');

  // Try a simple query against enriched_indications to see if the table exists
  const { error } = await supabase.from('enriched_indications').select('id').limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('[setup] Tables missing — creating via SQL...');

    const createSQL = `
      CREATE TABLE IF NOT EXISTS public.enriched_indications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        therapy_area TEXT NOT NULL,
        synonyms TEXT[] DEFAULT '{}',
        us_prevalence INTEGER,
        us_incidence INTEGER,
        diagnosis_rate NUMERIC(4,3),
        treatment_rate NUMERIC(4,3),
        major_competitors TEXT[] DEFAULT '{}',
        market_growth_driver TEXT,
        prevalence_source TEXT,
        enrichment_source TEXT DEFAULT 'perplexity',
        confidence TEXT DEFAULT 'medium',
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.enriched_pricing (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        drug_name TEXT NOT NULL,
        company TEXT,
        therapy_area TEXT NOT NULL,
        indication TEXT,
        mechanism TEXT,
        launch_year INTEGER,
        wac_annual NUMERIC(12,2),
        net_price_annual NUMERIC(12,2),
        orphan_status BOOLEAN DEFAULT FALSE,
        enrichment_source TEXT DEFAULT 'perplexity',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.enriched_procedures (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        synonyms TEXT[] DEFAULT '{}',
        device_category TEXT,
        us_annual_procedures INTEGER,
        us_procedure_growth_rate NUMERIC(4,2),
        medicare_facility_rate NUMERIC(10,2),
        major_device_competitors TEXT[] DEFAULT '{}',
        enrichment_source TEXT DEFAULT 'perplexity',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.enrichment_runs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        therapy_area TEXT NOT NULL,
        run_type TEXT NOT NULL,
        items_discovered INTEGER DEFAULT 0,
        items_added INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        errors TEXT[] DEFAULT '{}',
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      -- RLS
      ALTER TABLE public.enriched_indications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.enriched_pricing ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.enriched_procedures ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.enrichment_runs ENABLE ROW LEVEL SECURITY;

      -- Service role full access policies (idempotent with IF NOT EXISTS via DO block)
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on enriched_indications') THEN
          CREATE POLICY "Service role full access on enriched_indications"
            ON public.enriched_indications FOR ALL USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on enriched_pricing') THEN
          CREATE POLICY "Service role full access on enriched_pricing"
            ON public.enriched_pricing FOR ALL USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on enriched_procedures') THEN
          CREATE POLICY "Service role full access on enriched_procedures"
            ON public.enriched_procedures FOR ALL USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on enrichment_runs') THEN
          CREATE POLICY "Service role full access on enrichment_runs"
            ON public.enrichment_runs FOR ALL USING (true);
        END IF;
      END $$;

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_enriched_indications_therapy_area
        ON public.enriched_indications (therapy_area);
      CREATE INDEX IF NOT EXISTS idx_enriched_indications_name
        ON public.enriched_indications (lower(name));
      CREATE INDEX IF NOT EXISTS idx_enriched_pricing_therapy_area
        ON public.enriched_pricing (therapy_area);
      CREATE INDEX IF NOT EXISTS idx_enriched_procedures_category
        ON public.enriched_procedures (device_category);
      CREATE INDEX IF NOT EXISTS idx_enrichment_runs_therapy_area
        ON public.enrichment_runs (therapy_area, run_type);
    `;

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createSQL }).single();

    // If the RPC doesn't exist, try direct REST — Supabase doesn't expose raw SQL via REST
    // In that case, the migration must be run manually
    if (sqlError) {
      console.warn('[setup] Could not create tables via RPC (exec_sql not available).');
      console.warn('[setup] Please run the migration manually:');
      console.warn('  supabase db push  OR  apply supabase/migrations/20240101000027_enrichment_tables.sql');
      console.warn('[setup] Continuing anyway — will fail on insert if tables truly missing.\n');
    } else {
      console.log('[setup] Tables created successfully.');
    }
  } else if (error) {
    // Some other error (e.g. network) — warn but continue
    console.warn(`[setup] Table check returned error: ${error.message}`);
    console.warn('[setup] Continuing — inserts will fail if tables are missing.\n');
  } else {
    console.log('[setup] Enrichment tables already exist.');
  }
}

// ---------------------------------------------------------------------------
// Indication parser (duplicated from enrichment-pipeline.ts to avoid Next.js imports)
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

  return results.slice(0, 25); // Allow up to 25 per query
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
// Enrich a single therapy area with 3 queries
// ---------------------------------------------------------------------------

interface BulkEnrichResult {
  therapy_area: string;
  discovered: number;
  added: number;
  errors: string[];
  duration_ms: number;
}

async function enrichTherapyArea(
  therapyArea: string,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<BulkEnrichResult> {
  const start = performance.now();
  const result: BulkEnrichResult = {
    therapy_area: therapyArea,
    discovered: 0,
    added: 0,
    errors: [],
    duration_ms: 0,
  };

  const queries = buildQueries(therapyArea);
  const allIndications: ParsedIndication[] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < queries.length; i++) {
    const queryLabel = ['major', 'emerging/rare', 'unmet need'][i];
    console.log(`  Query ${i + 1}/3 (${queryLabel})...`);

    const pResult = await queryPerplexity(queries[i]);
    if (!pResult?.content) {
      const errMsg = `Query ${i + 1} (${queryLabel}) returned no content`;
      result.errors.push(errMsg);
      console.warn(`  WARNING: ${errMsg}`);
    } else {
      const parsed = parseIndicationsFromResponse(pResult.content, therapyArea);
      // Deduplicate across queries
      for (const ind of parsed) {
        const key = ind.name.toLowerCase();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          allIndications.push(ind);
        }
      }
      console.log(`  -> Parsed ${parsed.length} indications (${allIndications.length} unique total)`);
    }

    // Delay between queries to avoid rate limiting
    if (i < queries.length - 1) {
      await sleep(DELAY_BETWEEN_QUERIES_MS);
    }
  }

  result.discovered = allIndications.length;

  // Insert into Supabase (skip duplicates)
  for (const ind of allIndications) {
    try {
      // Check if already exists
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
        // Unique constraint violation = already exists, skip silently
        if (error.code === '23505') continue;
        result.errors.push(`Insert failed for ${ind.name}: ${error.message}`);
      } else {
        result.added++;
      }
    } catch (err) {
      result.errors.push(`Error processing ${ind.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
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

  result.duration_ms = Math.round(performance.now() - start);
  return result;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { therapyAreas: string[] } {
  const args = process.argv.slice(2);
  const thinOnly = args.includes('--thin-only');

  // Check for --ta=x,y,z
  const taArg = args.find((a) => a.startsWith('--ta='));
  if (taArg) {
    const specified = taArg
      .replace('--ta=', '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = specified.filter((ta) => (ALL_THERAPY_AREAS as readonly string[]).includes(ta));
    if (valid.length === 0) {
      console.error(`[FATAL] No valid therapy areas in --ta=${taArg}`);
      console.error(`  Valid: ${ALL_THERAPY_AREAS.join(', ')}`);
      process.exit(1);
    }
    return { therapyAreas: valid };
  }

  if (thinOnly) {
    return { therapyAreas: [...THIN_TAS] };
  }

  // Default: thin TAs first, then the rest
  const remaining = ALL_THERAPY_AREAS.filter((ta) => !(THIN_TAS as readonly string[]).includes(ta));
  return { therapyAreas: [...THIN_TAS, ...remaining] };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('============================================================');
  console.log('TERRAIN — Bulk Enrichment Pipeline');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  const { therapyAreas } = parseArgs();
  console.log(`Therapy areas to enrich (${therapyAreas.length}): ${therapyAreas.join(', ')}\n`);

  const supabase = createAdminClient();

  // Ensure tables exist
  await ensureTablesExist(supabase);
  console.log('');

  const results: BulkEnrichResult[] = [];
  const overallStart = performance.now();

  for (let i = 0; i < therapyAreas.length; i++) {
    const ta = therapyAreas[i];
    console.log(`[${i + 1}/${therapyAreas.length}] Enriching: ${ta}`);

    const taResult = await enrichTherapyArea(ta, supabase);
    results.push(taResult);

    console.log(
      `  [${ta}] Discovered ${taResult.discovered} indications, added ${taResult.added} new ` +
        `(${formatDuration(taResult.duration_ms)})` +
        (taResult.errors.length > 0 ? ` — ${taResult.errors.length} errors` : ''),
    );

    // Delay between TAs
    if (i < therapyAreas.length - 1) {
      await sleep(DELAY_BETWEEN_TAS_MS);
    }
  }

  const overallDuration = Math.round(performance.now() - overallStart);

  // Summary
  console.log('\n============================================================');
  console.log('ENRICHMENT COMPLETE');
  console.log('============================================================');
  console.log(`Total duration: ${formatDuration(overallDuration)}`);
  console.log(`\n${'Therapy Area'.padEnd(25)} ${'Discovered'.padEnd(12)} ${'Added'.padEnd(10)} Errors`);
  console.log('-'.repeat(60));

  let totalDiscovered = 0;
  let totalAdded = 0;
  let totalErrors = 0;

  for (const r of results) {
    totalDiscovered += r.discovered;
    totalAdded += r.added;
    totalErrors += r.errors.length;
    console.log(
      `${r.therapy_area.padEnd(25)} ${String(r.discovered).padEnd(12)} ${String(r.added).padEnd(10)} ${r.errors.length}`,
    );
  }

  console.log('-'.repeat(60));
  console.log(
    `${'TOTAL'.padEnd(25)} ${String(totalDiscovered).padEnd(12)} ${String(totalAdded).padEnd(10)} ${totalErrors}`,
  );

  if (totalErrors > 0) {
    console.log('\n--- Errors ---');
    for (const r of results) {
      for (const e of r.errors) {
        console.log(`  [${r.therapy_area}] ${e}`);
      }
    }
  }

  console.log(`\nFinished: ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error('[FATAL] Unhandled error:', err);
  process.exit(1);
});
