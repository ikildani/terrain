'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import type { AnalyticsData } from '@/types';
import { CHART_COLORS, formatReportType } from '@/lib/constants/chart-colors';

const SERIES_COLORS = [
  CHART_COLORS.primary, // teal
  CHART_COLORS.secondary, // blue
  '#A78BFA', // purple
  CHART_COLORS.positive, // emerald
  CHART_COLORS.tertiary, // amber
  CHART_COLORS.negative, // red
  '#38BDF8', // sky
  '#FB923C', // orange
  '#E879F9', // fuchsia
  '#2DD4BF', // cyan
];

interface AnalyticsChartsProps {
  analytics: AnalyticsData;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Trend — Line Chart */}
      <div className="card p-5 lg:col-span-2">
        <h3 className="label text-slate-400 mb-4">Activity (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.activity_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="date"
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                stroke={CHART_COLORS.muted}
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis
                stroke={CHART_COLORS.muted}
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: CHART_COLORS.navy,
                  border: `1px solid ${CHART_COLORS.grid}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                  color: CHART_COLORS.white,
                }}
                labelFormatter={(label: unknown) =>
                  new Date(String(label)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: CHART_COLORS.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Type Distribution — Donut */}
      <div className="card p-5">
        <h3 className="label text-slate-400 mb-4">Report Types</h3>
        <div className="h-64">
          {analytics.report_type_distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.report_type_distribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {analytics.report_type_distribution.map((_, idx) => (
                    <Cell key={idx} fill={SERIES_COLORS[idx % SERIES_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.navy,
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: CHART_COLORS.white,
                  }}
                  formatter={(value: unknown, _name: unknown, props: unknown) => [
                    value as number,
                    formatReportType((props as { payload?: { type?: string } })?.payload?.type ?? ''),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-600">No report data yet</div>
          )}
        </div>
        {/* Legend */}
        {analytics.report_type_distribution.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {analytics.report_type_distribution.map((item, idx) => (
              <div key={item.type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }}
                />
                <span className="text-2xs font-mono text-slate-500">{formatReportType(item.type)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Indications — Horizontal Bar */}
      <div className="card p-5">
        <h3 className="label text-slate-400 mb-4">Top Indications</h3>
        <div className="h-64">
          {analytics.top_indications.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.top_indications} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis
                  type="number"
                  stroke={CHART_COLORS.muted}
                  fontSize={10}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="indication"
                  stroke={CHART_COLORS.muted}
                  fontSize={9}
                  fontFamily="Inter"
                  tickLine={false}
                  width={120}
                  tick={{ fill: CHART_COLORS.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART_COLORS.navy,
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: CHART_COLORS.white,
                  }}
                />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-slate-600">No indication data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
