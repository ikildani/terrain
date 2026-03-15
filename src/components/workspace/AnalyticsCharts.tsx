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

const CHART_COLORS = [
  '#00C9A7', // teal
  '#60A5FA', // blue
  '#A78BFA', // purple
  '#34D399', // emerald
  '#FBBF24', // amber
  '#F87171', // red
  '#38BDF8', // sky
  '#FB923C', // orange
  '#E879F9', // fuchsia
  '#2DD4BF', // cyan
];

function formatReportType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface AnalyticsChartsProps {
  analytics: AnalyticsData;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Activity Trend — Line Chart */}
      <div className="card noise p-5 lg:col-span-2">
        <h3 className="label text-slate-400 mb-4">Activity (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.activity_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="#102236" />
              <XAxis
                dataKey="date"
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                stroke="#64748B"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1B2E',
                  border: '1px solid #102236',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                  color: '#F0F4F8',
                }}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00C9A7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00C9A7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Type Distribution — Donut */}
      <div className="card noise p-5">
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
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2E',
                    border: '1px solid #102236',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F0F4F8',
                  }}
                  formatter={(value: number, _name: string, props: { payload?: { type?: string } }) => [
                    value,
                    formatReportType(props.payload?.type ?? ''),
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
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="text-2xs font-mono text-slate-500">{formatReportType(item.type)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Indications — Horizontal Bar */}
      <div className="card noise p-5">
        <h3 className="label text-slate-400 mb-4">Top Indications</h3>
        <div className="h-64">
          {analytics.top_indications.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.top_indications} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#102236" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748B"
                  fontSize={10}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="indication"
                  stroke="#64748B"
                  fontSize={9}
                  fontFamily="Inter"
                  tickLine={false}
                  width={120}
                  tick={{ fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2E',
                    border: '1px solid #102236',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F0F4F8',
                  }}
                />
                <Bar dataKey="count" fill="#00C9A7" radius={[0, 4, 4, 0]} barSize={16} />
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
