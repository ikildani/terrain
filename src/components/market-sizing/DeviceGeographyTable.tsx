'use client';

import { formatMetric, formatNumber } from '@/lib/utils/format';
import type { DeviceMarketSizingOutput } from '@/types/devices-diagnostics';

interface DeviceGeographyTableProps {
  data: DeviceMarketSizingOutput['geography_breakdown'];
}

export default function DeviceGeographyTable({ data }: DeviceGeographyTableProps) {
  return (
    <div className="chart-container noise">
      <div className="chart-title">Geography Breakdown</div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Territory</th>
              <th>TAM</th>
              <th>Procedure Volume</th>
              <th>Reimbursement</th>
              <th>Market Note</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.territory}>
                <td className="text-slate-300 font-medium">{row.territory}</td>
                <td className="numeric">
                  {formatMetric(row.tam.value, row.tam.unit)}
                </td>
                <td className="numeric">
                  {row.procedure_volume != null
                    ? formatNumber(row.procedure_volume)
                    : <span className="text-slate-600">--</span>}
                </td>
                <td>
                  <span className="text-2xs text-slate-400">
                    {row.reimbursement_environment}
                  </span>
                </td>
                <td>
                  <span className="text-2xs text-slate-500">
                    {row.market_note}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
