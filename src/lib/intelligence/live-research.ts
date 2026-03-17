// ────────────────────────────────────────────────────────────
// Live Market Intelligence — Fetches real-time market signals
// Powered by Perplexity AI, but user-facing label is
// "Live Market Intelligence" with cited sources.
// ────────────────────────────────────────────────────────────

import { queryPerplexity } from '@/lib/perplexity';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface LiveIntelligenceItem {
  headline: string;
  detail: string;
  source: string;
  source_url?: string;
  date_approximate?: string;
  signal_type: 'competitive' | 'regulatory' | 'clinical' | 'deal' | 'market';
}

export interface LiveIntelligence {
  items: LiveIntelligenceItem[];
  query_context: string;
  fetched_at: string;
}

// ────────────────────────────────────────────────────────────
// In-memory cache (server-side, per-instance)
// Key: "indication:therapeuticArea", TTL: 6 hours
// ────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry {
  data: LiveIntelligence;
  expiresAt: number;
}

const intelligenceCache = new Map<string, CacheEntry>();

function getCacheKey(indication: string, therapeuticArea: string): string {
  return `${indication.toLowerCase().trim()}:${therapeuticArea.toLowerCase().trim()}`;
}

function getCached(key: string): LiveIntelligence | null {
  const entry = intelligenceCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    intelligenceCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: LiveIntelligence): void {
  // Evict stale entries periodically (keep cache bounded)
  if (intelligenceCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of intelligenceCache) {
      if (now > v.expiresAt) intelligenceCache.delete(k);
    }
  }
  intelligenceCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ────────────────────────────────────────────────────────────
// Main fetch function
// ────────────────────────────────────────────────────────────

export async function fetchLiveIntelligence(params: {
  indication: string;
  therapeuticArea: string;
  mechanism?: string;
  competitors?: string[];
}): Promise<LiveIntelligence | null> {
  const { indication, therapeuticArea, mechanism, competitors } = params;

  // Check cache first
  const cacheKey = getCacheKey(indication, therapeuticArea);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Build a focused query for the indication
  const competitorStr = competitors?.slice(0, 3).join(', ') || '';
  const query =
    `Latest developments in ${indication} ${therapeuticArea} pharmaceutical market as of 2026. ` +
    `Include: recent FDA approvals or rejections, new clinical trial results, major licensing or M&A deals, ` +
    `competitive landscape changes${mechanism ? ` for ${mechanism} mechanism` : ''}` +
    `${competitorStr ? `. Key competitors: ${competitorStr}` : ''}. ` +
    `Focus on the last 3 months. Be specific with dates, companies, and dollar amounts.`;

  const result = await queryPerplexity(query);
  if (!result || !result.content) return null;

  // Parse the response into structured intelligence items
  const items = parseIntelligenceItems(result.content, result.citations);

  const intelligence: LiveIntelligence = {
    items,
    query_context: `${indication} (${therapeuticArea})`,
    fetched_at: new Date().toISOString(),
  };

  // Cache the result
  setCache(cacheKey, intelligence);

  return intelligence;
}

// ────────────────────────────────────────────────────────────
// Response parser
// ────────────────────────────────────────────────────────────

function parseIntelligenceItems(content: string, citations: { url: string; title: string }[]): LiveIntelligenceItem[] {
  // Split content into bullet points or sentences
  const lines = content
    .split(/[\n•\-\d+\.\)]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20);

  const items: LiveIntelligenceItem[] = [];

  for (const line of lines.slice(0, 8)) {
    // Max 8 items
    // Classify the signal type
    const lower = line.toLowerCase();
    let signal_type: LiveIntelligenceItem['signal_type'] = 'market';
    if (lower.includes('fda') || lower.includes('approval') || lower.includes('reject') || lower.includes('ema')) {
      signal_type = 'regulatory';
    } else if (
      lower.includes('trial') ||
      lower.includes('phase') ||
      lower.includes('endpoint') ||
      lower.includes('data')
    ) {
      signal_type = 'clinical';
    } else if (
      lower.includes('deal') ||
      lower.includes('licens') ||
      lower.includes('acqui') ||
      lower.includes('partner') ||
      lower.includes('$')
    ) {
      signal_type = 'deal';
    } else if (lower.includes('compet') || lower.includes('launch') || lower.includes('market share')) {
      signal_type = 'competitive';
    }

    // Extract a headline (first clause or sentence)
    const headline =
      line
        .split(/[.;:]/)
        .filter((s) => s.trim().length > 10)[0]
        ?.trim() || line.slice(0, 100);

    // Find a matching citation
    const matchedCitation = citations.find((c) => {
      try {
        const domain = new URL(c.url).hostname.replace('www.', '');
        return (
          line.toLowerCase().includes(domain.split('.')[0]) ||
          c.title
            .toLowerCase()
            .split(' ')
            .some((word) => word.length > 4 && line.toLowerCase().includes(word))
        );
      } catch {
        return false;
      }
    });

    items.push({
      headline: headline.slice(0, 120),
      detail: line.slice(0, 300),
      source: matchedCitation?.title || 'Industry Source',
      source_url: matchedCitation?.url,
      signal_type,
    });
  }

  return items;
}
