// ============================================================
// TERRAIN — Enriched Data Loader
// lib/data/enriched-data-loader.ts
//
// Merges static data (compiled into build from *-map.ts files)
// with dynamic enrichment data (stored in Supabase at runtime).
// Static data is always authoritative; enriched data supplements.
// Graceful degradation: if Supabase fails, returns static only.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin';
import { INDICATION_DATA, type IndicationData } from '@/lib/data/indication-map';
import { PROCEDURE_DATA } from '@/lib/data/procedure-map';
import type { ProcedureData } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// Types for enriched data
// ────────────────────────────────────────────────────────────

export interface EnrichedIndicationRecord {
  id: string;
  name: string;
  therapy_area: string;
  synonyms: string[];
  us_prevalence: number | null;
  us_incidence: number | null;
  diagnosis_rate: number | null;
  treatment_rate: number | null;
  major_competitors: string[];
  market_growth_driver: string | null;
  prevalence_source: string | null;
  enrichment_source: string;
  confidence: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnrichedProcedureRecord {
  id: string;
  name: string;
  synonyms: string[];
  device_category: string | null;
  us_annual_procedures: number | null;
  us_procedure_growth_rate: number | null;
  medicare_facility_rate: number | null;
  major_device_competitors: string[];
  enrichment_source: string;
  created_at: string;
}

// ────────────────────────────────────────────────────────────
// In-memory cache (server-side, per-instance)
// TTL: 10 minutes — balances freshness vs. DB load
// ────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const indicationCache = new Map<string, CacheEntry<IndicationData[]>>();
const procedureCache = new Map<string, CacheEntry<ProcedureData[]>>();

// ────────────────────────────────────────────────────────────
// ENRICHED INDICATIONS
// ────────────────────────────────────────────────────────────

/**
 * Returns static indications merged with dynamically enriched ones.
 * Enriched indications are appended (never override static data).
 * If Supabase is unreachable, falls back to static data only.
 */
export async function getEnrichedIndications(therapyArea?: string): Promise<IndicationData[]> {
  const cacheKey = therapyArea || '__all__';
  const cached = indicationCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // Start with static data
  const indications: IndicationData[] = therapyArea
    ? INDICATION_DATA.filter((ind) => ind.therapy_area === therapyArea)
    : [...INDICATION_DATA];

  // Fetch dynamic enrichments from Supabase
  try {
    const supabase = createAdminClient();
    let query = supabase.from('enriched_indications').select('*');

    if (therapyArea) {
      query = query.eq('therapy_area', therapyArea);
    }

    const { data: enriched } = await query;

    if (enriched && enriched.length > 0) {
      // Build lookup set from static data for dedup
      const staticNames = new Set(
        indications.flatMap((ind) => [ind.name.toLowerCase(), ...ind.synonyms.map((s) => s.toLowerCase())]),
      );

      for (const item of enriched as EnrichedIndicationRecord[]) {
        // Skip if indication already exists in static data
        if (staticNames.has(item.name.toLowerCase()) || item.synonyms?.some((s) => staticNames.has(s.toLowerCase()))) {
          continue;
        }

        // Convert enriched record to IndicationData shape
        indications.push({
          name: item.name,
          synonyms: item.synonyms || [],
          icd10_codes: [], // Not available from enrichment
          therapy_area: item.therapy_area,
          us_prevalence: item.us_prevalence || 0,
          us_incidence: item.us_incidence || 0,
          prevalence_source: item.prevalence_source || 'Perplexity enrichment',
          diagnosis_rate: Number(item.diagnosis_rate) || 0.7,
          treatment_rate: Number(item.treatment_rate) || 0.5,
          cagr_5yr: 5.0, // Conservative default for enriched data
          major_competitors: item.major_competitors || [],
          market_growth_driver: item.market_growth_driver || '',
          therapy_area_pricing_context: '',
          data_confidence: (item.confidence as 'high' | 'medium' | 'low') || 'medium',
          last_verified_year: new Date().getFullYear(),
        });
      }
    }
  } catch {
    // Supabase unavailable — fall back to static data only
  }

  // Cache the result
  indicationCache.set(cacheKey, {
    data: indications,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return indications;
}

/**
 * Find an indication by name, checking both static and enriched data.
 * Returns the indication if found, or undefined.
 */
export async function findEnrichedIndicationByName(name: string): Promise<IndicationData | undefined> {
  const allIndications = await getEnrichedIndications();
  const normalized = name.toLowerCase().trim();

  return allIndications.find(
    (i) =>
      i.name.toLowerCase() === normalized ||
      i.synonyms.some((s) => s.toLowerCase() === normalized) ||
      normalized.includes(i.name.toLowerCase()) ||
      i.name.toLowerCase().includes(normalized),
  );
}

/**
 * Check if a given indication came from enrichment (not static data).
 */
export function isEnrichedIndication(indication: IndicationData): boolean {
  return !INDICATION_DATA.some((staticInd) => staticInd.name.toLowerCase() === indication.name.toLowerCase());
}

// ────────────────────────────────────────────────────────────
// ENRICHED PROCEDURES
// ────────────────────────────────────────────────────────────

/**
 * Returns static procedures merged with dynamically enriched ones.
 */
export async function getEnrichedProcedures(deviceCategory?: string): Promise<ProcedureData[]> {
  const cacheKey = deviceCategory || '__all__';
  const cached = procedureCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const procedures: ProcedureData[] = deviceCategory
    ? PROCEDURE_DATA.filter((p) => p.device_category === deviceCategory)
    : [...PROCEDURE_DATA];

  try {
    const supabase = createAdminClient();
    let query = supabase.from('enriched_procedures').select('*');

    if (deviceCategory) {
      query = query.eq('device_category', deviceCategory);
    }

    const { data: enriched } = await query;

    if (enriched && enriched.length > 0) {
      const staticNames = new Set(
        procedures.flatMap((p) => [p.name.toLowerCase(), ...p.synonyms.map((s) => s.toLowerCase())]),
      );

      for (const item of enriched as EnrichedProcedureRecord[]) {
        if (staticNames.has(item.name.toLowerCase()) || item.synonyms?.some((s) => staticNames.has(s.toLowerCase()))) {
          continue;
        }

        // Create a minimal ProcedureData record from enriched data
        procedures.push({
          name: item.name,
          synonyms: item.synonyms || [],
          cpt_codes: [],
          device_category: (item.device_category || 'cardiovascular') as ProcedureData['device_category'],
          us_annual_procedures: item.us_annual_procedures || 0,
          us_procedure_growth_rate: item.us_procedure_growth_rate || 0,
          procedure_setting: ['hospital_inpatient'],
          eligible_sites: { hospitals: 0 },
          performing_specialty: [],
          adoption_barrier: 'moderate' as const,
          procedure_source: 'Perplexity enrichment',
          reimbursement: {
            cms_coverage: 'partial' as const,
            medicare_facility_rate: item.medicare_facility_rate || 0,
            medicare_physician_rate: 0,
            private_payer_coverage: 'Coverage status unknown — enriched data',
          },
          major_device_competitors: item.major_device_competitors || [],
          market_leader: '',
          current_standard_of_care: '',
          cagr_5yr: item.us_procedure_growth_rate || 0,
          growth_driver: 'Dynamically enriched — pending verification',
        } as ProcedureData);
      }
    }
  } catch {
    // Supabase unavailable — fall back to static data only
  }

  procedureCache.set(cacheKey, {
    data: procedures,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return procedures;
}

// ────────────────────────────────────────────────────────────
// CACHE MANAGEMENT
// ────────────────────────────────────────────────────────────

/** Clear all enrichment caches (call after enrichment runs) */
export function clearEnrichmentCaches(): void {
  indicationCache.clear();
  procedureCache.clear();
}
