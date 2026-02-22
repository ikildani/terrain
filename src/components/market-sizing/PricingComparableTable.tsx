'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils/format';

interface ComparableItem {
  name: string;
  company: string;
  indication: string;
  launch_year: number;
  launch_wac: number;
  current_net_price: number;
  mechanism: string;
}

interface PricingComparableTableProps {
  comparables: ComparableItem[];
  recommendedRange?: {
    conservative: number;
    base: number;
    premium: number;
  };
}

export default function PricingComparableTable({
  comparables,
  recommendedRange,
}: PricingComparableTableProps) {
  const sorted = useMemo(
    () => [...comparables].sort((a, b) => b.launch_year - a.launch_year),
    [comparables]
  );

  return (
    <div className="chart-container noise">
      <div className="label mb-2">Competitive Landscape</div>
      <div className="chart-title">Pricing Comparables</div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Drug / Device</th>
              <th>Company</th>
              <th>Indication</th>
              <th>Year</th>
              <th>Launch WAC</th>
              <th>Net Price</th>
              <th>Mechanism</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={`${item.name}-${item.launch_year}`}>
                <td className="text-slate-300 font-medium">{item.name}</td>
                <td>{item.company}</td>
                <td>
                  <span className="text-2xs text-slate-500">{item.indication}</span>
                </td>
                <td className="numeric">
                  <span className="metric">{item.launch_year}</span>
                </td>
                <td className="numeric">
                  <span className="metric">{formatCurrency(item.launch_wac)}</span>
                </td>
                <td className="numeric">
                  <span className="metric">{formatCurrency(item.current_net_price)}</span>
                </td>
                <td>
                  <span className="text-2xs text-slate-400">{item.mechanism}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recommendedRange && (
        <div
          className="mt-5 p-4 rounded-md"
          style={{
            background: 'rgba(0,201,167,0.06)',
            border: '1px solid rgba(0,201,167,0.15)',
          }}
        >
          <div className="label mb-3">Recommended Pricing Range</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xs text-slate-500 mb-1">Conservative</div>
              <div className="metric text-lg font-medium text-slate-400">
                {formatCurrency(recommendedRange.conservative)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xs text-teal-500 mb-1">Base Case</div>
              <div className="metric text-lg font-medium text-teal-500">
                {formatCurrency(recommendedRange.base)}
              </div>
              <div className="w-full h-0.5 mt-2 rounded-full bg-teal-500" />
            </div>
            <div className="text-center">
              <div className="text-2xs text-slate-500 mb-1">Premium</div>
              <div className="metric text-lg font-medium" style={{ color: '#00E4BF' }}>
                {formatCurrency(recommendedRange.premium)}
              </div>
            </div>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-navy-700">
          <div>
            <span className="text-2xs text-slate-500">Avg Launch WAC: </span>
            <span className="metric text-2xs text-slate-300">
              {formatCurrency(
                Math.round(sorted.reduce((sum, c) => sum + c.launch_wac, 0) / sorted.length)
              )}
            </span>
          </div>
          <div>
            <span className="text-2xs text-slate-500">Avg Net Price: </span>
            <span className="metric text-2xs text-slate-300">
              {formatCurrency(
                Math.round(sorted.reduce((sum, c) => sum + c.current_net_price, 0) / sorted.length)
              )}
            </span>
          </div>
          <div>
            <span className="text-2xs text-slate-500">Comparables: </span>
            <span className="metric text-2xs text-slate-300">{sorted.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
