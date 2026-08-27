import { createAdminClient } from '@/lib/supabase/admin';
import type { CachedClinicalTrial, CachedFdaApproval, CachedSecFiling } from '@/types';

// EMA and PubMed types (ingested by crons, queried here)
export interface CachedEmaMedicine {
  medicine_name: string;
  inn: string | null;
  therapeutic_area: string | null;
  condition: string | null;
  authorisation_status: string | null;
  marketing_authorisation_holder: string | null;
  authorisation_date: string | null;
  medicine_url: string | null;
  atc_code: string | null;
  active_substance: string | null;
  medicine_type: string | null;
  fetched_at: string;
}

export interface CachedPubmedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string | null;
  pub_date: string | null;
  abstract_snippet: string | null;
  therapeutic_area: string;
  doi: string | null;
  fetched_at: string;
}

const TRIALS_COLUMNS =
  'nct_id, title, status, phase, conditions, interventions, sponsor, collaborators, enrollment, start_date, completion_date, last_update_posted, primary_outcomes, fetched_at';
const FDA_COLUMNS =
  'application_number, brand_name, generic_name, sponsor_name, approval_date, application_type, active_ingredients, route, dosage_form, submission_type, submission_status, fetched_at';
const SEC_COLUMNS =
  'accession_number, company_name, ticker, cik, form_type, filed_date, description, file_url, is_deal_related, deal_keywords, fetched_at';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const TTL_MS = 10 * 60 * 1000;
const trialsCache = new Map<string, CacheEntry<CachedClinicalTrial[]>>();
const fdaCache = new Map<string, CacheEntry<CachedFdaApproval[]>>();
const secCache = new Map<string, CacheEntry<CachedSecFiling[]>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < TTL_MS) return entry.data;
  return null;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T) {
  cache.set(key, { data, ts: Date.now() });
}

export async function getTrialsForIndication(indication: string): Promise<CachedClinicalTrial[]> {
  const key = indication.toLowerCase().trim();
  const cached = getCached(trialsCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('clinical_trials_cache')
      .select(TRIALS_COLUMNS)
      .contains('conditions', [indication])
      .in('status', ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION'])
      .order('last_update_posted', { ascending: false })
      .limit(100);

    if (error) {
      console.error('cached-data-loader: trials query failed', error.message);
      return [];
    }

    const results = (data || []) as CachedClinicalTrial[];
    setCache(trialsCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getTrialsForIndicationFuzzy(indication: string): Promise<CachedClinicalTrial[]> {
  const exact = await getTrialsForIndication(indication);
  if (exact.length > 0) return exact;

  const key = `fuzzy:${indication.toLowerCase().trim()}`;
  const cached = getCached(trialsCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const searchTerm = indication.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const { data, error } = await supabase
      .from('clinical_trials_cache')
      .select(TRIALS_COLUMNS)
      .ilike('title', `%${searchTerm}%`)
      .in('status', ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION'])
      .order('last_update_posted', { ascending: false })
      .limit(50);

    if (error) return [];
    const results = (data || []) as CachedClinicalTrial[];
    setCache(trialsCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getFdaApprovalsForIndication(indication: string): Promise<CachedFdaApproval[]> {
  const key = indication.toLowerCase().trim();
  const cached = getCached(fdaCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const searchTerm = indication.replace(/[^a-zA-Z0-9 ]/g, '').trim();

    const { data, error } = await supabase
      .from('fda_approvals_cache')
      .select(FDA_COLUMNS)
      .or(`brand_name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
      .order('approval_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('cached-data-loader: FDA query failed', error.message);
      return [];
    }

    const results = (data || []) as CachedFdaApproval[];
    setCache(fdaCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getRecentFdaApprovals(months = 12): Promise<CachedFdaApproval[]> {
  const key = `recent:${months}`;
  const cached = getCached(fdaCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const { data, error } = await supabase
      .from('fda_approvals_cache')
      .select(FDA_COLUMNS)
      .gte('approval_date', cutoff.toISOString().slice(0, 10))
      .order('approval_date', { ascending: false })
      .limit(100);

    if (error) return [];
    const results = (data || []) as CachedFdaApproval[];
    setCache(fdaCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getSecFilingsForCompanies(companyNames: string[]): Promise<CachedSecFiling[]> {
  if (companyNames.length === 0) return [];

  const key = companyNames.sort().join(',').toLowerCase();
  const cached = getCached(secCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const orClauses = companyNames.map((n) => `company_name.ilike.%${n}%`).join(',');

    const { data, error } = await supabase
      .from('sec_filings_cache')
      .select(SEC_COLUMNS)
      .or(orClauses)
      .eq('is_deal_related', true)
      .order('filed_date', { ascending: false })
      .limit(50);

    if (error) return [];
    const results = (data || []) as CachedSecFiling[];
    setCache(secCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getActiveTrialCount(indication: string): Promise<number> {
  const trials = await getTrialsForIndicationFuzzy(indication);
  return trials.length;
}

export async function getLiveCompetitorEnrichment(indication: string, companyNames: string[]) {
  const [trials, fdaApprovals, secFilings, emaApprovals, pubmedArticles] = await Promise.all([
    getTrialsForIndicationFuzzy(indication),
    getFdaApprovalsForIndication(indication),
    getSecFilingsForCompanies(companyNames),
    getEmaApprovalsForIndication(indication),
    getPubmedForIndication(indication),
  ]);

  return { trials, fdaApprovals, secFilings, emaApprovals, pubmedArticles };
}

// ── EMA Medicines ─────────────────────────────────────────

const EMA_COLUMNS =
  'medicine_name, inn, therapeutic_area, condition, authorisation_status, marketing_authorisation_holder, authorisation_date, medicine_url, atc_code, active_substance, medicine_type, fetched_at';

const emaCache = new Map<string, CacheEntry<CachedEmaMedicine[]>>();

export async function getEmaApprovalsForIndication(indication: string): Promise<CachedEmaMedicine[]> {
  const key = indication.toLowerCase().trim();
  const cached = getCached(emaCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const searchTerm = indication.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const { data, error } = await supabase
      .from('ema_medicines_cache')
      .select(EMA_COLUMNS)
      .or(`condition.ilike.%${searchTerm}%,therapeutic_area.ilike.%${searchTerm}%,medicine_name.ilike.%${searchTerm}%`)
      .order('authorisation_date', { ascending: false })
      .limit(50);

    if (error) return [];
    const results = (data || []) as CachedEmaMedicine[];
    setCache(emaCache, key, results);
    return results;
  } catch {
    return [];
  }
}

export async function getRecentEmaApprovals(months = 12): Promise<CachedEmaMedicine[]> {
  const key = `ema-recent:${months}`;
  const cached = getCached(emaCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const { data, error } = await supabase
      .from('ema_medicines_cache')
      .select(EMA_COLUMNS)
      .gte('authorisation_date', cutoff.toISOString().slice(0, 10))
      .order('authorisation_date', { ascending: false })
      .limit(100);

    if (error) return [];
    const results = (data || []) as CachedEmaMedicine[];
    setCache(emaCache, key, results);
    return results;
  } catch {
    return [];
  }
}

// ── PubMed Articles ───────────────────────────────────────

const PUBMED_COLUMNS = 'pmid, title, authors, journal, pub_date, abstract_snippet, therapeutic_area, doi, fetched_at';

const pubmedCache = new Map<string, CacheEntry<CachedPubmedArticle[]>>();

export async function getPubmedForIndication(indication: string): Promise<CachedPubmedArticle[]> {
  const key = indication.toLowerCase().trim();
  const cached = getCached(pubmedCache, key);
  if (cached) return cached;

  try {
    const supabase = createAdminClient();
    const searchTerm = indication.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const { data, error } = await supabase
      .from('pubmed_articles_cache')
      .select(PUBMED_COLUMNS)
      .or(`title.ilike.%${searchTerm}%,abstract_snippet.ilike.%${searchTerm}%`)
      .order('pub_date', { ascending: false })
      .limit(30);

    if (error) return [];
    const results = (data || []) as CachedPubmedArticle[];
    setCache(pubmedCache, key, results);
    return results;
  } catch {
    return [];
  }
}
