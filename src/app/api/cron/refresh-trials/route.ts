import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, createServiceClient } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// ClinicalTrials.gov API v2 — Weekly pipeline refresh
// Free, no auth required. Rate limit: ~3 req/sec
// Docs: https://clinicaltrials.gov/data-api/api
// ────────────────────────────────────────────────────────────

const CTGOV_BASE = 'https://clinicaltrials.gov/api/v2/studies';

// Key therapeutic areas to track — covers all Terrain indication categories
const SEARCH_QUERIES = [
  // Oncology (largest pipeline)
  'NSCLC OR non-small cell lung cancer',
  'breast cancer OR triple negative',
  'pancreatic cancer OR cholangiocarcinoma',
  'acute myeloid leukemia OR multiple myeloma',
  'melanoma OR merkel cell carcinoma',
  'glioblastoma OR brain tumor',
  'renal cell carcinoma OR bladder cancer',
  'colorectal cancer OR hepatocellular carcinoma',
  // Immunology & inflammation
  'rheumatoid arthritis OR psoriatic arthritis',
  'systemic lupus erythematosus OR lupus nephritis',
  'atopic dermatitis OR psoriasis',
  'inflammatory bowel disease OR Crohn',
  // Neurology
  'Alzheimer disease OR frontotemporal dementia',
  'Parkinson disease OR Huntington',
  'multiple sclerosis OR amyotrophic lateral sclerosis',
  'epilepsy OR spinal muscular atrophy',
  // Rare disease
  'sickle cell disease OR thalassemia',
  'cystic fibrosis OR Duchenne muscular dystrophy',
  'phenylketonuria OR Fabry disease',
  // Cardiovascular & metabolic
  'heart failure OR hypertrophic cardiomyopathy',
  'NASH OR nonalcoholic steatohepatitis',
  'type 2 diabetes OR obesity GLP-1',
  // Infectious disease
  'HIV OR hepatitis B',
  'RSV OR respiratory syncytial virus',
];

const FIELDS =
  'NCTId,BriefTitle,OverallStatus,Phase,Condition,InterventionName,InterventionType,' +
  'LeadSponsorName,CollaboratorName,EnrollmentCount,StartDate,CompletionDate,' +
  'StudyType,PrimaryOutcomeMeasure,LocationCountry,LastUpdatePostDate';

interface CTGovStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string };
    statusModule?: {
      overallStatus?: string;
      startDateStruct?: { date?: string };
      completionDateStruct?: { date?: string };
      lastUpdatePostDateStruct?: { date?: string };
    };
    designModule?: { studyType?: string; phases?: string[] };
    conditionsModule?: { conditions?: string[] };
    armsInterventionsModule?: { interventions?: { type?: string; name?: string; description?: string }[] };
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string }; collaborators?: { name?: string }[] };
    descriptionModule?: { briefSummary?: string };
    eligibilityModule?: { enrollmentInfo?: { count?: number } };
    outcomesModule?: { primaryOutcomes?: { measure?: string; timeFrame?: string }[] };
    contactsLocationsModule?: { locations?: unknown[] };
  };
}

async function fetchStudies(query: string): Promise<CTGovStudy[]> {
  const params = new URLSearchParams({
    'query.cond': query,
    'filter.overallStatus': 'RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION,NOT_YET_RECRUITING',
    'filter.phase': 'PHASE2,PHASE3',
    pageSize: '50',
    sort: 'LastUpdatePostDate:desc',
    format: 'json',
  });

  const url = `${CTGOV_BASE}?${params}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    logger.warn('ctgov_fetch_failed', { query, status: res.status });
    return [];
  }

  const data = await res.json();
  return data.studies ?? [];
}

function parseStudy(study: CTGovStudy) {
  const p = study.protocolSection;
  if (!p?.identificationModule?.nctId) return null;

  const id = p.identificationModule;
  const status = p.statusModule;
  const design = p.designModule;
  const conditions = p.conditionsModule;
  const arms = p.armsInterventionsModule;
  const sponsor = p.sponsorCollaboratorsModule;
  const eligibility = p.eligibilityModule;
  const outcomes = p.outcomesModule;
  const contacts = p.contactsLocationsModule;

  return {
    nct_id: id.nctId!,
    title: id.briefTitle ?? '',
    status: status?.overallStatus ?? 'UNKNOWN',
    phase: design?.phases?.[0] ?? 'NA',
    conditions: conditions?.conditions ?? [],
    interventions: (arms?.interventions ?? []).map((i) => ({
      type: i.type ?? '',
      name: i.name ?? '',
      description: i.description ?? '',
    })),
    sponsor: sponsor?.leadSponsor?.name ?? 'Unknown',
    collaborators: (sponsor?.collaborators ?? []).map((c) => c.name ?? ''),
    enrollment: eligibility?.enrollmentInfo?.count ?? 0,
    start_date: status?.startDateStruct?.date ?? '',
    completion_date: status?.completionDateStruct?.date ?? '',
    study_type: design?.studyType ?? '',
    primary_outcomes: (outcomes?.primaryOutcomes ?? []).map((o) => ({
      measure: o.measure ?? '',
      timeFrame: o.timeFrame ?? '',
    })),
    locations_count: contacts?.locations?.length ?? 0,
    last_update_posted: status?.lastUpdatePostDateStruct?.date ?? '',
  };
}

// ────────────────────────────────────────────────────────────
// GET /api/cron/refresh-trials
// Schedule: Weekly (Sunday 3 AM UTC)
// ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = performance.now();
  const supabase = createServiceClient();

  // Mark source as running
  await supabase.from('data_source_status').upsert({
    id: 'clinicaltrials',
    display_name: 'ClinicalTrials.gov',
    source_url: 'https://clinicaltrials.gov/api/v2/studies',
    refresh_frequency: 'weekly',
    status: 'running',
    updated_at: new Date().toISOString(),
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const errors: string[] = [];

  for (const query of SEARCH_QUERIES) {
    try {
      const studies = await fetchStudies(query);
      totalFetched += studies.length;

      const parsed = studies.map(parseStudy).filter(Boolean);

      if (parsed.length > 0) {
        const rows = parsed.map((s) => ({
          ...s,
          raw_data: {},
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error } = await supabase.from('clinical_trials_cache').upsert(rows, { onConflict: 'nct_id' });

        if (error) {
          errors.push(`Upsert error for "${query}": ${error.message}`);
        } else {
          totalUpserted += rows.length;
        }
      }

      // Respect rate limit: ~3 req/sec
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      errors.push(`Fetch error for "${query}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Count total records in cache
  const { count } = await supabase.from('clinical_trials_cache').select('nct_id', { count: 'exact', head: true });

  // Update source status
  await supabase.from('data_source_status').upsert({
    id: 'clinicaltrials',
    display_name: 'ClinicalTrials.gov',
    source_url: 'https://clinicaltrials.gov/api/v2/studies',
    refresh_frequency: 'weekly',
    last_refreshed_at: new Date().toISOString(),
    next_refresh_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    records_count: count ?? 0,
    status: errors.length > 0 ? 'error' : 'success',
    last_error: errors.length > 0 ? errors.join('; ') : null,
    updated_at: new Date().toISOString(),
  });

  logger.info('cron_refresh_trials_complete', {
    totalFetched,
    totalUpserted,
    totalCached: count ?? 0,
    errors: errors.length,
    durationMs,
  });

  return NextResponse.json({
    success: true,
    fetched: totalFetched,
    upserted: totalUpserted,
    cached: count ?? 0,
    errors: errors.length,
    durationMs,
  });
}
