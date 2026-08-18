export const CHART_COLORS = {
  primary: '#00C9A7',
  primaryFaded: 'rgba(0, 201, 167, 0.08)',
  secondary: '#60A5FA',
  tertiary: '#FBBF24',
  positive: '#34D399',
  negative: '#F87171',
  muted: '#64748B',
  grid: '#102236',
  text: '#94A3B8',
  surface: '#07101E',
  surfaceElevated: '#0D1B2E',
  navy: '#0D1B2E',
  navyLight: '#102236',
  white: '#F0F4F8',
} as const;

export const PHASE_COLORS: Record<string, string> = {
  Approved: '#34D399',
  Withdrawn: '#64748B',
  Discontinued: '#64748B',
  'Phase 3': '#00C9A7',
  'Phase 2/3': '#00C9A7',
  'Phase 2': '#FBBF24',
  'Phase 1/2': '#60A5FA',
  'Phase 1': '#60A5FA',
  Preclinical: '#94A3B8',
};

export const REPORT_TYPE_COLORS: Record<string, string> = {
  market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  competitive: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  regulatory: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  partners: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pipeline: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  device_market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  cdx_market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  nutraceutical_market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  full: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export const REPORT_TYPE_ROUTES: Record<string, string> = {
  market_sizing: '/market-sizing',
  competitive: '/competitive',
  regulatory: '/regulatory',
  partners: '/partners',
  pipeline: '/competitive',
  device_market_sizing: '/market-sizing',
  cdx_market_sizing: '/market-sizing',
  nutraceutical_market_sizing: '/market-sizing',
};

export function formatReportType(type: string): string {
  const labels: Record<string, string> = {
    market_sizing: 'Market Sizing',
    competitive: 'Competitive',
    regulatory: 'Regulatory',
    partners: 'Partner Discovery',
    pipeline: 'Pipeline',
    device_market_sizing: 'Device Market Sizing',
    cdx_market_sizing: 'CDx Market Sizing',
    nutraceutical_market_sizing: 'Nutra Market Sizing',
    full: 'Full Report',
  };
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
