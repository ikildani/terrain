'use client';

import { useRef, useMemo } from 'react';
import { Users, Building2, DollarSign, BarChart3, Database, FileText } from 'lucide-react';
import type { PartnerDiscoveryOutput } from '@/types';
import PartnerCard from './PartnerCard';
import { SaveReportButton } from '@/components/shared/SaveReportButton';
import { ExportButton } from '@/components/shared/ExportButton';

interface PartnerDiscoveryReportProps {
  data: PartnerDiscoveryOutput;
  input?: {
    indication: string;
    mechanism?: string;
    development_stage: string;
    geography_rights: string[];
    deal_types: string[];
  };
}

function formatDealValue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
  if (value > 0) return `$${Math.round(value)}M`;
  return '--';
}

function formatStage(stage: string): string {
  const map: Record<string, string> = {
    preclinical: 'Preclinical',
    phase1: 'Phase 1',
    phase2: 'Phase 2',
    phase3: 'Phase 3',
    approved: 'Approved',
  };
  return map[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);
}

export default function PartnerDiscoveryReport({ data, input }: PartnerDiscoveryReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // CSV export data
  const csvData = useMemo(() => {
    return data.ranked_partners.map((p) => ({
      Rank: p.rank,
      Company: p.company,
      Type: p.company_type,
      HQ: p.hq_location,
      'Market Cap': p.market_cap || '',
      'Match Score': p.match_score,
      'Therapeutic Alignment (/25)': p.score_breakdown.therapeutic_alignment,
      'Pipeline Gap (/25)': p.score_breakdown.pipeline_gap,
      'Deal History (/20)': p.score_breakdown.deal_history,
      'Geography Fit (/15)': p.score_breakdown.geography_fit,
      'Financial Capacity (/15)': p.score_breakdown.financial_capacity,
      'BD Focus': p.bd_focus.join('; '),
      'Watch Signals': p.watch_signals.join('; '),
      'Typical Upfront': p.deal_terms_benchmark.typical_upfront,
      'Typical Milestones': p.deal_terms_benchmark.typical_milestones,
      'Royalty Range': p.deal_terms_benchmark.typical_royalty_range,
      Rationale: p.rationale,
    }));
  }, [data]);

  const reportData = input ? {
    title: `Partner Discovery — ${input.indication}`,
    report_type: 'partners' as const,
    indication: input.indication,
    inputs: input as Record<string, unknown>,
    outputs: data as unknown as Record<string, unknown>,
  } : undefined;

  return (
    <div ref={reportRef} className="space-y-4 animate-fade-in">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Partners Screened</span>
          </div>
          <p className="font-mono text-2xl text-white">{data.summary.total_screened}</p>
          <p className="text-[10px] text-slate-500 mt-1">{data.summary.total_matched} matched threshold</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Top-Tier Matches</span>
          </div>
          <p className="font-mono text-2xl text-white">{data.summary.top_tier_count}</p>
          <p className="text-[10px] text-slate-500 mt-1">Score {'>'}= 60/100</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Avg Match Score</span>
          </div>
          <p className="font-mono text-2xl text-white">{data.summary.avg_match_score}</p>
          <p className="text-[10px] text-slate-500 mt-1">Across top {data.ranked_partners.length} results</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Median Upfront</span>
          </div>
          <p className="font-mono text-2xl text-white">
            {data.deal_benchmarks.median_upfront_m > 0
              ? formatDealValue(data.deal_benchmarks.median_upfront_m)
              : '--'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {data.deal_benchmarks.sample_size > 0
              ? `Based on ${data.deal_benchmarks.sample_size} comparable deals`
              : 'Insufficient deal data'}
          </p>
        </div>
      </div>

      {/* Deal Benchmark Card */}
      {data.deal_benchmarks.sample_size > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-teal-500" />
            <h3 className="chart-title">Deal Benchmarks — {formatStage(data.summary.development_stage)} Stage</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Avg Upfront</p>
              <p className="font-mono text-sm text-teal-400 mt-1">{formatDealValue(data.deal_benchmarks.avg_upfront_m)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Median Upfront</p>
              <p className="font-mono text-sm text-white mt-1">{formatDealValue(data.deal_benchmarks.median_upfront_m)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Avg Total Value</p>
              <p className="font-mono text-sm text-white mt-1">{formatDealValue(data.deal_benchmarks.avg_total_value_m)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Median Total Value</p>
              <p className="font-mono text-sm text-white mt-1">{formatDealValue(data.deal_benchmarks.median_total_value_m)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">Typical Royalty</p>
              <p className="font-mono text-sm text-white mt-1">{data.deal_benchmarks.typical_royalty_range}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="chart-title">
          {data.ranked_partners.length > 0
            ? `Top ${data.ranked_partners.length} Partner Matches`
            : 'No Partners Above Threshold'}
        </h3>
        <div className="flex items-center gap-2">
          <ExportButton
            format="csv"
            data={csvData}
            filename={`partner-discovery-${data.summary.indication.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <ExportButton
            format="pdf"
            targetRef={reportRef}
            reportTitle="Partner Discovery Report"
            reportSubtitle={`${data.summary.indication} — ${formatStage(data.summary.development_stage)}`}
          />
          {reportData && <SaveReportButton reportData={reportData} />}
        </div>
      </div>

      {/* Partner Cards */}
      <div className="space-y-3">
        {data.ranked_partners.map((partner) => (
          <PartnerCard key={partner.rank} partner={partner} />
        ))}
      </div>

      {/* Methodology */}
      <details className="card group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-slate-300">
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Methodology & Data Sources</span>
        </summary>
        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Data Sources</p>
            <div className="space-y-1">
              {data.data_sources.map((source, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Database className="w-3 h-3 text-slate-600" />
                  <span className="text-slate-400">{source.name}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    source.type === 'public' ? 'bg-signal-green/10 text-signal-green' :
                    source.type === 'proprietary' ? 'bg-teal-500/10 text-teal-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {source.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
