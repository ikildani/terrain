// ============================================================
// TERRAIN — Automated Data Enrichment Pipeline
// lib/intelligence/enrichment-pipeline.ts
//
// Uses Perplexity AI to discover new indications, pricing data,
// and procedure data that supplement the static data files.
// Results are stored in Supabase enrichment tables and merged
// with static data at query time.
// ============================================================

import { queryPerplexity } from '@/lib/perplexity';
import { createAdminClient } from '@/lib/supabase/admin';
import { INDICATION_DATA } from '@/lib/data/indication-map';

export const THERAPY_AREAS = [
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

export type TherapyArea = (typeof THERAPY_AREAS)[number];

export interface EnrichmentResult {
  therapy_area: string;
  run_type: 'indications' | 'pricing' | 'procedures';
  discovered: number;
  added: number;
  updated: number;
  errors: string[];
}

// ────────────────────────────────────────────────────────────
// INDICATION ENRICHMENT
// ────────────────────────────────────────────────────────────

export async function runIndicationEnrichment(therapyArea: string): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    therapy_area: therapyArea,
    run_type: 'indications',
    discovered: 0,
    added: 0,
    updated: 0,
    errors: [],
  };

  // 1. Query Perplexity for new/emerging indications
  const displayTA = therapyArea.replace(/_/g, ' ');
  const query =
    `List all current pharmaceutical indications and diseases being actively targeted ` +
    `in ${displayTA} as of 2026. For each, provide: disease name, US prevalence ` +
    `(number of patients), annual incidence, current treatment rate (percentage of ` +
    `diagnosed patients receiving treatment), and top 3 competing drugs or companies. ` +
    `Focus on indications with active Phase 2 or later clinical programs. ` +
    `Format each indication on its own line with structured data.`;

  const perplexityResult = await queryPerplexity(query);
  if (!perplexityResult?.content) {
    result.errors.push('Perplexity returned no content');
    return result;
  }

  // 2. Parse the response into structured indication objects
  const indications = parseIndicationsFromResponse(perplexityResult.content, therapyArea);
  result.discovered = indications.length;

  if (indications.length === 0) {
    result.errors.push('No indications parsed from response');
    return result;
  }

  // 3. Filter out indications already in static data
  const staticNames = new Set(
    INDICATION_DATA.flatMap((ind) => [ind.name.toLowerCase(), ...ind.synonyms.map((s) => s.toLowerCase())]),
  );

  const novelIndications = indications.filter(
    (ind) => !staticNames.has(ind.name.toLowerCase()) && !ind.synonyms.some((s) => staticNames.has(s.toLowerCase())),
  );

  // 4. Insert into Supabase (skip duplicates)
  const supabase = createAdminClient();

  for (const ind of novelIndications) {
    try {
      // Check if already in enrichment table
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
        result.errors.push(`Insert failed for ${ind.name}: ${error.message}`);
      } else {
        result.added++;
      }
    } catch (err) {
      result.errors.push(`Error processing ${ind.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // 5. Log the enrichment run
  await logEnrichmentRun(supabase, result);

  return result;
}

// ────────────────────────────────────────────────────────────
// PRICING ENRICHMENT
// ────────────────────────────────────────────────────────────

export async function runPricingEnrichment(therapyArea: string): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    therapy_area: therapyArea,
    run_type: 'pricing',
    discovered: 0,
    added: 0,
    updated: 0,
    errors: [],
  };

  const displayTA = therapyArea.replace(/_/g, ' ');
  const query =
    `List all drugs approved or launched in ${displayTA} since 2023 with their pricing. ` +
    `For each drug include: brand name, company, indication, mechanism of action, ` +
    `launch year, estimated WAC annual cost, and whether it has orphan drug designation. ` +
    `Focus on recently approved drugs with known pricing.`;

  const perplexityResult = await queryPerplexity(query);
  if (!perplexityResult?.content) {
    result.errors.push('Perplexity returned no content');
    return result;
  }

  const pricingEntries = parsePricingFromResponse(perplexityResult.content, therapyArea);
  result.discovered = pricingEntries.length;

  const supabase = createAdminClient();

  for (const entry of pricingEntries) {
    try {
      // Check if drug already exists
      const { data: existing } = await supabase
        .from('enriched_pricing')
        .select('id')
        .eq('drug_name', entry.drugName)
        .eq('therapy_area', therapyArea)
        .single();

      if (existing) continue;

      const { error } = await supabase.from('enriched_pricing').insert({
        drug_name: entry.drugName,
        company: entry.company || null,
        therapy_area: therapyArea,
        indication: entry.indication || null,
        mechanism: entry.mechanism || null,
        launch_year: entry.launchYear || null,
        wac_annual: entry.wacAnnual || null,
        net_price_annual: entry.netPriceAnnual || null,
        orphan_status: entry.orphanStatus || false,
        enrichment_source: 'perplexity',
      });

      if (error) {
        result.errors.push(`Insert failed for ${entry.drugName}: ${error.message}`);
      } else {
        result.added++;
      }
    } catch (err) {
      result.errors.push(`Error processing ${entry.drugName}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  await logEnrichmentRun(supabase, result);
  return result;
}

// ────────────────────────────────────────────────────────────
// PROCEDURE ENRICHMENT
// ────────────────────────────────────────────────────────────

export async function runProcedureEnrichment(deviceCategory: string): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    therapy_area: deviceCategory,
    run_type: 'procedures',
    discovered: 0,
    added: 0,
    updated: 0,
    errors: [],
  };

  const displayCat = deviceCategory.replace(/_/g, ' ');
  const query =
    `List emerging and established medical procedures in the ${displayCat} device category ` +
    `as of 2026. For each procedure include: procedure name, annual US procedure volume, ` +
    `annual growth rate, Medicare facility reimbursement rate, and top competing devices. ` +
    `Focus on procedures with growing adoption or new technology.`;

  const perplexityResult = await queryPerplexity(query);
  if (!perplexityResult?.content) {
    result.errors.push('Perplexity returned no content');
    return result;
  }

  const procedures = parseProceduresFromResponse(perplexityResult.content, deviceCategory);
  result.discovered = procedures.length;

  const supabase = createAdminClient();

  for (const proc of procedures) {
    try {
      const { data: existing } = await supabase.from('enriched_procedures').select('id').eq('name', proc.name).single();

      if (existing) continue;

      const { error } = await supabase.from('enriched_procedures').insert({
        name: proc.name,
        synonyms: proc.synonyms,
        device_category: deviceCategory,
        us_annual_procedures: proc.annualProcedures || null,
        us_procedure_growth_rate: proc.growthRate || null,
        medicare_facility_rate: proc.medicareRate || null,
        major_device_competitors: proc.competitors,
        enrichment_source: 'perplexity',
      });

      if (error) {
        result.errors.push(`Insert failed for ${proc.name}: ${error.message}`);
      } else {
        result.added++;
      }
    } catch (err) {
      result.errors.push(`Error processing ${proc.name}: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  await logEnrichmentRun(supabase, result);
  return result;
}

// ────────────────────────────────────────────────────────────
// RESPONSE PARSERS
// ────────────────────────────────────────────────────────────

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
    // Try to extract indication name (usually bold or starts with a number/bullet)
    const nameMatch = line.match(/^[\s*\-\d.)*]*\*?\*?([A-Z][^:,\n]{3,60})/);
    if (!nameMatch) continue;

    const name = nameMatch[1].replace(/\*+/g, '').trim();

    // Skip if too short, too long, or already seen
    if (name.length < 4 || name.length > 80) continue;
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;

    // Skip generic header-like strings
    if (/^(here|the|these|some|key|major|other|common|list|below)/i.test(name)) continue;

    // Extract prevalence (look for number followed by "patients", "cases", "million", etc.)
    const prevMatch = line.match(/(\d[\d,._]*)\s*(million|thousand|patients|cases|people|affected)/i);
    let prevalence = 0;
    if (prevMatch) {
      let num = parseFloat(prevMatch[1].replace(/[,_]/g, ''));
      if (prevMatch[2].toLowerCase() === 'million') num *= 1_000_000;
      else if (prevMatch[2].toLowerCase() === 'thousand') num *= 1_000;
      prevalence = Math.round(num);
    }

    // Extract competitors (look for company/drug names in parentheses or after "by"/"from")
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

    // Extract treatment rate if mentioned
    let treatmentRate = 0.5; // Default
    const trMatch = line.match(/treatment\s*rate\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/i);
    if (trMatch) {
      treatmentRate = Math.min(parseFloat(trMatch[1]) / 100, 1);
    }

    seenNames.add(nameKey);
    results.push({
      name,
      synonyms: [],
      prevalence: prevalence || 0,
      incidence: prevalence ? Math.round(prevalence * 0.1) : 0, // Rough estimate if incidence not specified
      diagnosisRate: 0.7, // Conservative default
      treatmentRate,
      competitors: competitors.slice(0, 5),
      growthDriver: `Active clinical development in ${therapyArea.replace(/_/g, ' ')}`,
    });
  }

  return results.slice(0, 20); // Max 20 per TA per run
}

interface ParsedPricing {
  drugName: string;
  company: string;
  indication: string;
  mechanism: string;
  launchYear: number;
  wacAnnual: number;
  netPriceAnnual: number;
  orphanStatus: boolean;
}

function parsePricingFromResponse(content: string, _therapyArea: string): ParsedPricing[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 10);
  const results: ParsedPricing[] = [];
  const seenDrugs = new Set<string>();

  for (const line of lines) {
    // Look for drug names (typically in bold or at start of bullet)
    const nameMatch = line.match(/^[\s*\-\d.)*]*\*?\*?([A-Z][a-zA-Z\-]+(?:\s*\([^)]+\))?)/);
    if (!nameMatch) continue;

    const drugName = nameMatch[1].replace(/\*+/g, '').trim();
    if (drugName.length < 3 || drugName.length > 60) continue;

    const drugKey = drugName.toLowerCase();
    if (seenDrugs.has(drugKey)) continue;
    if (/^(here|the|these|some|key|major|other|common|list|below)/i.test(drugName)) continue;

    // Extract price (look for $XX,XXX or $X.XB patterns)
    let wacAnnual = 0;
    const priceMatch = line.match(/\$\s*([\d,._]+)\s*(K|k|thousand|million|M|B|billion)?/);
    if (priceMatch) {
      let num = parseFloat(priceMatch[1].replace(/[,_]/g, ''));
      const unit = (priceMatch[2] || '').toLowerCase();
      if (unit === 'k' || unit === 'thousand') num *= 1_000;
      else if (unit === 'm' || unit === 'million') num *= 1_000_000;
      else if (unit === 'b' || unit === 'billion') num *= 1_000_000_000;
      wacAnnual = Math.round(num);
    }

    // Extract company
    let company = '';
    const companyMatch = line.match(/(?:by|from)\s+([A-Z][a-zA-Z\s&]+?)(?:[,;.]|\s+(?:for|in|is|was|at))/);
    if (companyMatch) {
      company = companyMatch[1].trim();
    }

    // Extract launch year
    let launchYear = 0;
    const yearMatch = line.match(/\b(202[3-9]|203[0-9])\b/);
    if (yearMatch) {
      launchYear = parseInt(yearMatch[1], 10);
    }

    // Check for orphan status
    const orphanStatus = /orphan/i.test(line);

    seenDrugs.add(drugKey);
    results.push({
      drugName,
      company,
      indication: '',
      mechanism: '',
      launchYear,
      wacAnnual,
      netPriceAnnual: wacAnnual ? Math.round(wacAnnual * 0.55) : 0, // Estimate ~45% GTN
      orphanStatus,
    });
  }

  return results.slice(0, 15); // Max 15 per TA per run
}

interface ParsedProcedure {
  name: string;
  synonyms: string[];
  annualProcedures: number;
  growthRate: number;
  medicareRate: number;
  competitors: string[];
}

function parseProceduresFromResponse(content: string, _deviceCategory: string): ParsedProcedure[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 10);
  const results: ParsedProcedure[] = [];
  const seenNames = new Set<string>();

  for (const line of lines) {
    const nameMatch = line.match(/^[\s*\-\d.)*]*\*?\*?([A-Z][^:,\n]{3,70})/);
    if (!nameMatch) continue;

    const name = nameMatch[1].replace(/\*+/g, '').trim();
    if (name.length < 4 || name.length > 80) continue;

    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) continue;
    if (/^(here|the|these|some|key|major|other|common|list|below)/i.test(name)) continue;

    // Extract procedure volume
    let annualProcedures = 0;
    const volMatch = line.match(/(\d[\d,._]*)\s*(million|thousand|procedures|cases)/i);
    if (volMatch) {
      let num = parseFloat(volMatch[1].replace(/[,_]/g, ''));
      if (volMatch[2].toLowerCase() === 'million') num *= 1_000_000;
      else if (volMatch[2].toLowerCase() === 'thousand') num *= 1_000;
      annualProcedures = Math.round(num);
    }

    // Extract growth rate
    let growthRate = 0;
    const grMatch = line.match(/(\d+(?:\.\d+)?)\s*%\s*(?:growth|CAGR|annual|increase)/i);
    if (grMatch) {
      growthRate = parseFloat(grMatch[1]);
    }

    // Extract Medicare rate
    let medicareRate = 0;
    const medMatch = line.match(/\$\s*([\d,._]+)\s*(?:Medicare|reimbursement|facility)/i);
    if (medMatch) {
      medicareRate = parseFloat(medMatch[1].replace(/[,_]/g, ''));
    }

    seenNames.add(nameKey);
    results.push({
      name,
      synonyms: [],
      annualProcedures,
      growthRate,
      medicareRate,
      competitors: [],
    });
  }

  return results.slice(0, 15);
}

// ────────────────────────────────────────────────────────────
// ENRICHMENT RUN LOGGER
// ────────────────────────────────────────────────────────────

async function logEnrichmentRun(
  supabase: ReturnType<typeof createAdminClient>,
  result: EnrichmentResult,
): Promise<void> {
  try {
    await supabase.from('enrichment_runs').insert({
      therapy_area: result.therapy_area,
      run_type: result.run_type,
      items_discovered: result.discovered,
      items_added: result.added,
      items_updated: result.updated,
      errors: result.errors.slice(0, 10), // Cap error array
      completed_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — don't fail the enrichment if logging fails
  }
}
