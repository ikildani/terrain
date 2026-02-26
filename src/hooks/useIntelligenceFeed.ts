'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from './useUser';

// --- Types ---

interface DataSourceStatus {
  id: string;
  display_name: string;
  source_url: string;
  last_refreshed_at: string | null;
  next_refresh_at: string | null;
  records_count: number;
  status: string;
  last_error: string | null;
  refresh_frequency: string;
  updated_at: string;
}

interface ClinicalTrial {
  nct_id: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: { type: string; name: string; description: string }[];
  sponsor: string;
  enrollment: number;
  start_date: string;
  completion_date: string;
  last_update_posted: string;
  fetched_at: string;
}

interface FDAApproval {
  application_number: string;
  brand_name: string | null;
  generic_name: string | null;
  sponsor_name: string | null;
  approval_date: string | null;
  application_type: string;
  active_ingredients: string[];
  route: string | null;
  dosage_form: string | null;
  submission_type: string | null;
  submission_status: string | null;
  fetched_at: string;
}

interface SECFiling {
  accession_number: string;
  company_name: string;
  ticker: string | null;
  form_type: string;
  filed_date: string;
  description: string;
  file_url: string;
  is_deal_related: boolean;
  deal_keywords: string[];
  fetched_at: string;
}

interface IntelligenceFeedData {
  sources: DataSourceStatus[];
  trials: ClinicalTrial[];
  fda: FDAApproval[];
  sec: SECFiling[];
  counts: {
    trials: number;
    fda: number;
    sec: number;
  };
}

interface IntelligenceFeedParams {
  source?: string;
  search?: string;
  limit?: number;
}

// --- Fetcher ---

async function fetchIntelligenceFeed(params: IntelligenceFeedParams): Promise<IntelligenceFeedData> {
  const searchParams = new URLSearchParams();
  if (params.source) searchParams.set('source', params.source);
  if (params.search) searchParams.set('search', params.search);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  const url = `/api/intelligence/feed${qs ? `?${qs}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Intelligence feed request failed: ${res.status}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown error');
  }
  return {
    sources: json.sources ?? [],
    trials: json.feed?.trials ?? [],
    fda: json.feed?.fda ?? [],
    sec: json.feed?.sec ?? [],
    counts: json.counts ?? { trials: 0, fda: 0, sec: 0 },
  } as IntelligenceFeedData;
}

// --- Hook ---

export function useIntelligenceFeed(params: IntelligenceFeedParams = {}) {
  const { user, isLoading: userLoading } = useUser();

  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['intelligence-feed', user?.id, params],
    queryFn: () => fetchIntelligenceFeed(params),
    enabled: !!user && !userLoading,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  return {
    sources: data?.sources ?? [],
    trials: data?.trials ?? [],
    fda: data?.fda ?? [],
    sec: data?.sec ?? [],
    counts: data?.counts ?? { trials: 0, fda: 0, sec: 0 },
    isLoading: isLoading || userLoading,
    error,
    dataUpdatedAt,
  };
}
