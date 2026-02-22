'use client';

import type { PartnerDeal } from '@/types';

interface DealHistoryTableProps {
  deals: PartnerDeal[];
  compact?: boolean;
}

function formatDealValue(value?: number): string {
  if (!value || value === 0) return '--';
  const millions = value / 1_000_000;
  if (millions >= 1000) return `$${(millions / 1000).toFixed(1)}B`;
  return `$${Math.round(millions)}M`;
}

function formatStage(stage: string): string {
  const map: Record<string, string> = {
    preclinical: 'Preclinical',
    phase1: 'Phase 1',
    phase2: 'Phase 2',
    phase3: 'Phase 3',
    approved: 'Approved',
  };
  return map[stage] || stage;
}

export default function DealHistoryTable({ deals, compact }: DealHistoryTableProps) {
  if (deals.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic">No recent deal data available.</p>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        {deals.map((deal, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-navy-800/50 rounded"
          >
            <div className="flex-1 min-w-0">
              <span className="text-slate-300 truncate block">
                {deal.licensed_to}
              </span>
              <span className="text-slate-500 text-[10px] truncate block">
                {deal.indication} &middot; {deal.deal_type} &middot; {formatStage(deal.development_stage)}
              </span>
            </div>
            <div className="text-right ml-3 shrink-0">
              <span className="font-mono text-teal-400 block">
                {formatDealValue(deal.upfront_usd)}
              </span>
              <span className="font-mono text-slate-500 text-[10px] block">
                / {formatDealValue(deal.total_value_usd)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-navy-700">
            <th className="text-left py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Counterparty</th>
            <th className="text-left py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Indication</th>
            <th className="text-left py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Type</th>
            <th className="text-left py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Stage</th>
            <th className="text-right py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Upfront</th>
            <th className="text-right py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Total Value</th>
            <th className="text-right py-2 px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">Year</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <tr key={i} className="border-b border-navy-700/50 hover:bg-navy-800/30">
              <td className="py-2 px-2 text-slate-300">{deal.licensed_to}</td>
              <td className="py-2 px-2 text-slate-400 max-w-[160px] truncate">{deal.indication}</td>
              <td className="py-2 px-2 text-slate-400">{deal.deal_type}</td>
              <td className="py-2 px-2 text-slate-400">{formatStage(deal.development_stage)}</td>
              <td className="py-2 px-2 text-right font-mono text-teal-400">{formatDealValue(deal.upfront_usd)}</td>
              <td className="py-2 px-2 text-right font-mono text-slate-300">{formatDealValue(deal.total_value_usd)}</td>
              <td className="py-2 px-2 text-right font-mono text-slate-500">{deal.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
