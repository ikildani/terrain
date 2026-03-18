'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { formatCompact } from '@/lib/utils/format';

// ────────────────────────────────────────────────────────────
// Revenue Waterfall / Bridge Chart
// Shows how revenue builds from TAM to peak sales through
// successive reductions (addressability, share, net pricing).
// ────────────────────────────────────────────────────────────

export interface RevenueWaterfallChartProps {
  tam_value: number;
  tam_unit: 'B' | 'M';
  addressability_factor: number; // 0-1 (fraction of TAM that is addressable)
  peak_share: number; // 0-1 (peak market share)
  gtn_discount: number; // 0-1 (gross-to-net discount)
  peak_sales_m: number;
}

// Recharts waterfall uses invisible + visible stacked bars.
// "invisible" lifts the visible bar to the correct start position.
interface WaterfallDatum {
  name: string;
  invisible: number; // transparent spacer
  value: number; // visible bar height
  displayLabel: string;
  isTotal: boolean;
}

const SLATE = '#64748B';
const TEAL = '#00C9A7';
const NAVY_BAR = '#1E293B'; // slate-800 — navy bars for reductions

function toM(value: number, unit: 'B' | 'M'): number {
  return unit === 'B' ? value * 1000 : value;
}

function buildWaterfallData(props: RevenueWaterfallChartProps): WaterfallDatum[] {
  const tamM = toM(props.tam_value, props.tam_unit);
  const addressableLoss = tamM * (1 - props.addressability_factor);
  const afterAddr = tamM - addressableLoss;
  const shareLoss = afterAddr * (1 - props.peak_share);
  const afterShare = afterAddr - shareLoss;
  const gtnLoss = afterShare * props.gtn_discount;
  const peakSales = props.peak_sales_m; // use the pre-calculated value

  return [
    {
      name: 'US TAM',
      invisible: 0,
      value: tamM,
      displayLabel: `$${formatCompact(tamM)}M`,
      isTotal: false,
    },
    {
      name: 'Addressability',
      invisible: tamM - addressableLoss,
      value: addressableLoss,
      displayLabel: `-${Math.round((1 - props.addressability_factor) * 100)}%`,
      isTotal: false,
    },
    {
      name: 'Market Share',
      invisible: afterAddr - shareLoss,
      value: shareLoss,
      displayLabel: `-${Math.round((1 - props.peak_share) * 100)}%`,
      isTotal: false,
    },
    {
      name: 'Net Pricing',
      invisible: afterShare - gtnLoss,
      value: gtnLoss,
      displayLabel: `-${Math.round(props.gtn_discount * 100)}%`,
      isTotal: false,
    },
    {
      name: 'Peak Sales',
      invisible: 0,
      value: peakSales,
      displayLabel: `$${formatCompact(peakSales)}M`,
      isTotal: true,
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as WaterfallDatum | undefined;
  if (!d) return null;
  return (
    <div className="bg-navy-800 border border-navy-700 rounded px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-slate-300">{d.name}</div>
      <div className="font-mono text-white mt-0.5">{d.displayLabel}</div>
    </div>
  );
}

function RevenueWaterfallChart(props: RevenueWaterfallChartProps) {
  const data = buildWaterfallData(props);

  return (
    <div className="chart-container noise">
      <div className="chart-title">Revenue Waterfall: TAM to Peak Sales</div>
      <div className="text-2xs text-slate-500 mb-4">
        How the total addressable market narrows to peak annual revenue
      </div>

      <div role="img" aria-label="Revenue waterfall chart from TAM to peak sales" style={{ overflowX: 'auto' }}>
        <BarChart width={700} height={320} data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: SLATE, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          {/* Invisible spacer bar */}
          <Bar dataKey="invisible" stackId="stack" fill="transparent" isAnimationActive={false} />

          {/* Visible value bar */}
          <Bar dataKey="value" stackId="stack" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isTotal ? TEAL : NAVY_BAR} />
            ))}
            <LabelList
              dataKey="displayLabel"
              position="top"
              style={{
                fill: '#94A3B8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          </Bar>
        </BarChart>
      </div>
    </div>
  );
}

export default RevenueWaterfallChart;
