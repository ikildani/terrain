'use client';

import { cn } from '@/lib/utils/cn';
import { formatCompact } from '@/lib/utils/format';

interface SensitivityTableProps {
  addressablePatients: number;
  netPrice: number;
  baseSharePct: number;
}

const PRICING_VARIANTS = [
  { label: 'Conservative', multiplier: 0.8 },
  { label: 'Base', multiplier: 1.0 },
  { label: 'Premium', multiplier: 1.2 },
] as const;

const SHARE_VARIANTS = [
  { label: 'Low Share', multiplier: 0.6 },
  { label: 'Base Share', multiplier: 1.0 },
  { label: 'High Share', multiplier: 1.5 },
] as const;

export default function SensitivityTable({
  addressablePatients,
  netPrice,
  baseSharePct,
}: SensitivityTableProps) {
  return (
    <div className="chart-container noise">
      <h3 className="chart-title">Sensitivity Analysis</h3>
      <p className="text-[11px] text-slate-500 mb-4">
        SOM estimates across pricing and market share assumptions (annual revenue at peak)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-medium pb-2 pr-4">
                Pricing \ Share
              </th>
              {SHARE_VARIANTS.map((sv) => (
                <th
                  key={sv.label}
                  className="text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium pb-2 px-3"
                >
                  {sv.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRICING_VARIANTS.map((pv) => (
              <tr key={pv.label}>
                <td className="text-xs text-slate-400 font-medium py-2 pr-4 border-t border-navy-700/50">
                  {pv.label}
                </td>
                {SHARE_VARIANTS.map((sv) => {
                  const som =
                    addressablePatients *
                    (netPrice * pv.multiplier) *
                    (baseSharePct * sv.multiplier);
                  const isBaseCase = pv.multiplier === 1.0 && sv.multiplier === 1.0;
                  return (
                    <td
                      key={sv.label}
                      className={cn(
                        'text-center py-2 px-3 border-t border-navy-700/50',
                        isBaseCase
                          ? 'bg-teal-500/10 rounded'
                          : '',
                      )}
                    >
                      <span
                        className={cn(
                          'metric text-sm',
                          isBaseCase ? 'text-teal-400' : 'text-slate-300',
                        )}
                      >
                        {formatCompact(som)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-slate-600 mt-3">
        Base case highlighted. Conservative/Premium pricing at ±20%. Low/High share at 0.6×/1.5× base assumption.
      </p>
    </div>
  );
}
