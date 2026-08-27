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
  // Sequential palette for heatmaps and gradient data
  sequential: [
    '#04080f',
    '#071520',
    '#0a2232',
    '#0d3045',
    '#104058',
    '#13506c',
    '#166180',
    '#1a7496',
    '#1d88ad',
    '#219dc6',
  ],
  // Diverging palette (red-neutral-green)
  diverging: ['#f87171', '#fb923c', '#fbbf24', '#94a3b8', '#34d399', '#22c55e', '#16a34a'],
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
  market_sizing: 'bg-[#002e27] text-teal-400 border-[#004d40]',
  competitive: 'bg-[#0c1a2e] text-blue-400 border-[#1a3350]',
  regulatory: 'bg-[#1a152e] text-purple-400 border-[#2e2450]',
  partners: 'bg-[#0a2a1f] text-emerald-400 border-[#134a35]',
  pipeline: 'bg-[#0c1a2e] text-blue-400 border-[#1a3350]',
  device_market_sizing: 'bg-[#002e27] text-teal-400 border-[#004d40]',
  cdx_market_sizing: 'bg-[#002e27] text-teal-400 border-[#004d40]',
  nutraceutical_market_sizing: 'bg-[#002e27] text-teal-400 border-[#004d40]',
  full: 'bg-[#1a2332] text-slate-400 border-[#253548]',
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
