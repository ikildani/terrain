// ────────────────────────────────────────────────────────────
// DATA SOURCE FRESHNESS MAP
// Maps data source names to their last-updated ISO date strings.
// Live sources (ClinicalTrials.gov, SEC EDGAR, etc.) use the
// current timestamp since they are queried in real time.
// ────────────────────────────────────────────────────────────

/**
 * Canonical freshness timestamps for every data source referenced
 * by the Terrain analytics engines. Used by report components to
 * populate DataSourceBadge `lastUpdated` props and to power the
 * stale-data warning banner.
 */
export const DATA_SOURCE_FRESHNESS: Record<string, string> = {
  // ── Public / epidemiology ────────────────────────────────
  'WHO Global Burden of Disease 2024': '2025-12-01',
  'WHO Global Burden of Disease': '2025-12-01',
  'ClinicalTrials.gov': new Date().toISOString(),
  'FDA Drug Approvals Database': '2026-02-15',
  'FDA 510(k) / PMA Database': '2026-02-15',
  'FDA Companion Diagnostics Database': '2026-02-15',

  // ── Pricing / reimbursement ──────────────────────────────
  'IQVIA Drug Pricing Benchmarks': '2025-09-01',
  'CMS Medicare Spending Data': '2026-01-01',
  'CMS Medicare Fee Schedule': '2026-01-01',
  'CMS Clinical Laboratory Fee Schedule 2024': '2024-01-01',
  'NCCN Biomarker Testing Guidelines': '2025-11-01',

  // ── Hospital / provider ──────────────────────────────────
  'AHA Annual Survey of Hospitals': '2025-06-01',
  'Definitive Healthcare Procedure Volume Data': '2025-10-01',

  // ── Proprietary / live ───────────────────────────────────
  'Ambrosia Ventures Transaction Database': new Date().toISOString(),
  'Ambrosia Ventures Deal Database': new Date().toISOString(),
  'Ambrosia Ventures Medtech Deal Database': new Date().toISOString(),
  'Ambrosia Ventures CDx Deal Database': new Date().toISOString(),
  'Terrain Drug Pricing Database': new Date().toISOString(),
  'Terrain Analysis': new Date().toISOString(),
  'SEC EDGAR 8-K Filings': new Date().toISOString(),
};

/**
 * Look up the freshness date for a data source. Falls back to
 * partial matching (contains) if exact key is not found.
 */
export function getSourceFreshness(sourceName: string): string | undefined {
  // Exact match first
  if (DATA_SOURCE_FRESHNESS[sourceName]) {
    return DATA_SOURCE_FRESHNESS[sourceName];
  }

  // Partial match — handles dynamic names like "CMS Medicare Fee Schedule 2026"
  // or "Ambrosia Ventures Medtech Deal Database (2020-2026)"
  const lowerName = sourceName.toLowerCase();
  for (const [key, value] of Object.entries(DATA_SOURCE_FRESHNESS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }

  // Check for partial keyword matches for common patterns
  if (lowerName.includes('cms') && lowerName.includes('medicare'))
    return DATA_SOURCE_FRESHNESS['CMS Medicare Fee Schedule'];
  if (lowerName.includes('aha') && lowerName.includes('survey'))
    return DATA_SOURCE_FRESHNESS['AHA Annual Survey of Hospitals'];
  if (lowerName.includes('ambrosia') || lowerName.includes('terrain')) return new Date().toISOString();
  if (lowerName.includes('clinicaltrials.gov') || lowerName.includes('clinical trials'))
    return new Date().toISOString();
  if (lowerName.includes('fda')) return DATA_SOURCE_FRESHNESS['FDA Drug Approvals Database'];
  if (lowerName.includes('iqvia')) return DATA_SOURCE_FRESHNESS['IQVIA Drug Pricing Benchmarks'];
  if (lowerName.includes('sec edgar')) return new Date().toISOString();
  if (lowerName.includes('asc association')) return '2025-06-01';
  if (lowerName.includes('definitive healthcare'))
    return DATA_SOURCE_FRESHNESS['Definitive Healthcare Procedure Volume Data'];

  return undefined;
}

/**
 * Check whether a source is stale (older than `thresholdMonths`).
 * Defaults to 6 months.
 */
export function isSourceStale(isoDate: string, thresholdMonths = 6): boolean {
  const ageMs = Date.now() - new Date(isoDate).getTime();
  const thresholdMs = thresholdMonths * 30 * 24 * 60 * 60 * 1000;
  return ageMs > thresholdMs;
}
