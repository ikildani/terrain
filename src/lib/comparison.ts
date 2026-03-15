/**
 * Comparison engine — extracts key metrics from reports and builds
 * a side-by-side comparison matrix.
 */

import type {
  Report,
  ComparisonRow,
  MarketSizingOutput,
  CompetitiveLandscapeOutput,
  DeviceMarketSizingOutput,
  CDxOutput,
  NutraceuticalMarketSizingOutput,
} from '@/types';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

export interface ReportSummary {
  id: string;
  title: string;
  report_type: string;
  indication: string;
  created_at: string;
}

export interface ComparisonMatrix {
  reports: ReportSummary[];
  metrics: ComparisonRow[];
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function formatCurrency(value: number, unit?: string): string {
  if (unit === 'B' || value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (unit === 'M' || value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString()}`;
}

function safeNumber(val: unknown): number | null {
  if (typeof val === 'number' && !isNaN(val)) return val;
  return null;
}

// ────────────────────────────────────────────────────────────
// METRIC EXTRACTION
// ────────────────────────────────────────────────────────────

/**
 * Extract key metrics from any report type's outputs.
 * Returns a flat Record of label → displayable value.
 */
export function extractMetrics(report: Report): Record<string, string | number | null> {
  const outputs = report.outputs;
  if (!outputs) return {};

  const metrics: Record<string, string | number | null> = {};

  // Detect report type and extract accordingly
  if (isMarketSizingOutput(outputs)) {
    extractMarketSizingMetrics(outputs, metrics);
  } else if (isCompetitiveOutput(outputs)) {
    extractCompetitiveMetrics(outputs, metrics);
  } else if (isDeviceOutput(outputs)) {
    extractDeviceMetrics(outputs, metrics);
  } else if (isCDxOutput(outputs)) {
    extractCDxMetrics(outputs, metrics);
  } else if (isNutraceuticalOutput(outputs)) {
    extractNutraceuticalMetrics(outputs, metrics);
  }

  return metrics;
}

// ── Type guards ──────────────────────────────────────────────

function isMarketSizingOutput(o: unknown): o is MarketSizingOutput {
  return !!o && typeof o === 'object' && 'summary' in o && 'patient_funnel' in o;
}

function isCompetitiveOutput(o: unknown): o is CompetitiveLandscapeOutput {
  return !!o && typeof o === 'object' && 'summary' in o && 'approved_products' in o;
}

function isDeviceOutput(o: unknown): o is DeviceMarketSizingOutput {
  return !!o && typeof o === 'object' && 'device_category' in o;
}

function isCDxOutput(o: unknown): o is CDxOutput {
  return !!o && typeof o === 'object' && 'cdx_strategy' in o;
}

function isNutraceuticalOutput(o: unknown): o is NutraceuticalMarketSizingOutput {
  return !!o && typeof o === 'object' && 'consumer_funnel' in o;
}

// ── Extractors per type ─────────────────────────────────────

function extractMarketSizingMetrics(o: MarketSizingOutput, m: Record<string, string | number | null>) {
  // Market Size
  m['US TAM'] = o.summary.tam_us?.value ? formatCurrency(o.summary.tam_us.value, o.summary.tam_us.unit) : null;
  m['US SAM'] = o.summary.sam_us?.value ? formatCurrency(o.summary.sam_us.value, o.summary.sam_us.unit) : null;
  m['US SOM'] = o.summary.som_us?.value ? formatCurrency(o.summary.som_us.value, o.summary.som_us.unit) : null;
  m['Global TAM'] = o.summary.global_tam?.value
    ? formatCurrency(o.summary.global_tam.value, o.summary.global_tam.unit)
    : null;
  m['5Y CAGR'] = safeNumber(o.summary.cagr_5yr);

  // Peak Sales
  m['Peak Sales (Base)'] = o.summary.peak_sales_estimate?.base
    ? formatCurrency(o.summary.peak_sales_estimate.base)
    : null;
  m['Peak Sales (Low)'] = o.summary.peak_sales_estimate?.low ? formatCurrency(o.summary.peak_sales_estimate.low) : null;
  m['Peak Sales (High)'] = o.summary.peak_sales_estimate?.high
    ? formatCurrency(o.summary.peak_sales_estimate.high)
    : null;

  // Patient Funnel
  m['US Prevalence'] = safeNumber(o.patient_funnel?.us_prevalence);
  m['US Incidence'] = safeNumber(o.patient_funnel?.us_incidence);
  m['Diagnosed'] = safeNumber(o.patient_funnel?.diagnosed);
  m['Treated'] = safeNumber(o.patient_funnel?.treated);
  m['Addressable'] = safeNumber(o.patient_funnel?.addressable);
  m['Capturable'] = safeNumber(o.patient_funnel?.capturable);

  // Pricing
  const pricing = o.pricing_analysis;
  m['WAC (Base)'] = pricing?.recommended_wac?.base ? formatCurrency(pricing.recommended_wac.base) : null;

  // Competitive
  m['Crowding Score'] = safeNumber(o.competitive_context?.crowding_score);
}

function extractCompetitiveMetrics(o: CompetitiveLandscapeOutput, m: Record<string, string | number | null>) {
  m['Crowding Score'] = safeNumber(o.summary?.crowding_score);
  m['Crowding Label'] = o.summary?.crowding_label ?? null;
  m['Approved Products'] = o.approved_products?.length ?? null;
  m['Phase 3 Pipeline'] = o.late_stage_pipeline?.length ?? null;
  m['Phase 2 Pipeline'] = o.mid_stage_pipeline?.length ?? null;
  m['Early Pipeline'] = o.early_pipeline?.length ?? null;
  m['White Space Opportunities'] = o.summary?.white_space?.length ?? null;
}

function extractDeviceMetrics(o: DeviceMarketSizingOutput, m: Record<string, string | number | null>) {
  // DeviceMarketSizingOutput may have different structure — extract what's available
  const raw = o as unknown as Record<string, unknown>;
  if (raw.total_addressable_market && typeof raw.total_addressable_market === 'number') {
    m['Device TAM'] = formatCurrency(raw.total_addressable_market as number);
  }
  if (raw.device_category && typeof raw.device_category === 'string') {
    m['Device Category'] = raw.device_category as string;
  }
}

function extractCDxMetrics(o: CDxOutput, m: Record<string, string | number | null>) {
  const raw = o as unknown as Record<string, unknown>;
  if (raw.annual_test_volume && typeof raw.annual_test_volume === 'number') {
    m['Annual Test Volume'] = raw.annual_test_volume as number;
  }
}

function extractNutraceuticalMetrics(o: NutraceuticalMarketSizingOutput, m: Record<string, string | number | null>) {
  const raw = o as unknown as Record<string, unknown>;
  if (raw.total_market_size && typeof raw.total_market_size === 'number') {
    m['Total Market Size'] = formatCurrency(raw.total_market_size as number);
  }
}

// ────────────────────────────────────────────────────────────
// METRIC CATEGORIES
// ────────────────────────────────────────────────────────────

const METRIC_CATEGORIES: Record<string, string> = {
  'US TAM': 'Market Size',
  'US SAM': 'Market Size',
  'US SOM': 'Market Size',
  'Global TAM': 'Market Size',
  '5Y CAGR': 'Market Size',
  'Peak Sales (Base)': 'Market Size',
  'Peak Sales (Low)': 'Market Size',
  'Peak Sales (High)': 'Market Size',
  'US Prevalence': 'Patient Funnel',
  'US Incidence': 'Patient Funnel',
  Diagnosed: 'Patient Funnel',
  Treated: 'Patient Funnel',
  Addressable: 'Patient Funnel',
  Capturable: 'Patient Funnel',
  'WAC (Base)': 'Pricing',
  'Crowding Score': 'Competitive',
  'Crowding Label': 'Competitive',
  'Approved Products': 'Competitive',
  'Phase 3 Pipeline': 'Competitive',
  'Phase 2 Pipeline': 'Competitive',
  'Early Pipeline': 'Competitive',
  'White Space Opportunities': 'Competitive',
  'Device TAM': 'Market Size',
  'Device Category': 'Market Size',
  'Annual Test Volume': 'Market Size',
  'Total Market Size': 'Market Size',
};

const METRIC_FORMATS: Record<string, ComparisonRow['format']> = {
  'US TAM': 'currency',
  'US SAM': 'currency',
  'US SOM': 'currency',
  'Global TAM': 'currency',
  '5Y CAGR': 'percent',
  'Peak Sales (Base)': 'currency',
  'Peak Sales (Low)': 'currency',
  'Peak Sales (High)': 'currency',
  'US Prevalence': 'number',
  'US Incidence': 'number',
  Diagnosed: 'number',
  Treated: 'number',
  Addressable: 'number',
  Capturable: 'number',
  'WAC (Base)': 'currency',
  'Crowding Score': 'number',
  'Crowding Label': 'text',
  'Approved Products': 'number',
  'Phase 3 Pipeline': 'number',
  'Phase 2 Pipeline': 'number',
  'Early Pipeline': 'number',
  'White Space Opportunities': 'number',
  'Device TAM': 'currency',
  'Device Category': 'text',
  'Annual Test Volume': 'number',
  'Total Market Size': 'currency',
};

// ────────────────────────────────────────────────────────────
// BUILD COMPARISON MATRIX
// ────────────────────────────────────────────────────────────

/**
 * Build a comparison matrix from 2-4 reports.
 * Rows are metric names, columns are report values.
 */
export function buildComparisonMatrix(reports: Report[]): ComparisonMatrix {
  // Build report summaries
  const summaries: ReportSummary[] = reports.map((r) => ({
    id: r.id,
    title: r.title,
    report_type: r.report_type,
    indication: r.indication,
    created_at: r.created_at,
  }));

  // Extract metrics from all reports
  const allMetricMaps = reports.map((r) => extractMetrics(r));

  // Collect all unique metric keys across reports
  const allKeys = new Set<string>();
  for (const mm of allMetricMaps) {
    for (const key of Object.keys(mm)) {
      allKeys.add(key);
    }
  }

  // Build rows: one per unique metric, sorted by category
  const categoryOrder = ['Market Size', 'Patient Funnel', 'Pricing', 'Competitive', 'Regulatory'];

  const rows: ComparisonRow[] = Array.from(allKeys)
    .sort((a, b) => {
      const catA = categoryOrder.indexOf(METRIC_CATEGORIES[a] ?? 'Other');
      const catB = categoryOrder.indexOf(METRIC_CATEGORIES[b] ?? 'Other');
      if (catA !== catB) return catA - catB;
      return a.localeCompare(b);
    })
    .map((key) => ({
      label: key,
      category: METRIC_CATEGORIES[key] ?? 'Other',
      values: allMetricMaps.map((mm) => mm[key] ?? null),
      format: METRIC_FORMATS[key],
    }));

  return { reports: summaries, metrics: rows };
}
