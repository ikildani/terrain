'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, TrendingUp, Sparkles, Database } from 'lucide-react';
import type { CompetitiveLandscapeOutput, Competitor } from '@/types';
import LandscapeMap from './LandscapeMap';
import PipelineTable from './PipelineTable';
import MarketShareChart from './MarketShareChart';
import CompetitorCard from './CompetitorCard';

interface CompetitiveLandscapeReportProps {
  data: CompetitiveLandscapeOutput;
  mechanism?: string;
}

type TabId = 'approved' | 'phase3' | 'phase2' | 'early';

interface TabDef {
  id: TabId;
  label: string;
  count: number;
}

function getCrowdingColor(score: number): string {
  if (score >= 8) return 'text-signal-red';
  if (score >= 5) return 'text-signal-amber';
  return 'text-signal-green';
}

export default function CompetitiveLandscapeReport({
  data,
  mechanism,
}: CompetitiveLandscapeReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('approved');

  const allCompetitors = useMemo<Competitor[]>(() => {
    return [
      ...data.approved_products,
      ...data.late_stage_pipeline,
      ...data.mid_stage_pipeline,
      ...data.early_pipeline,
    ];
  }, [data]);

  const topCompetitors = useMemo<Competitor[]>(() => {
    return [...allCompetitors]
      .sort((a, b) => b.differentiation_score - a.differentiation_score)
      .slice(0, 5);
  }, [allCompetitors]);

  const tabs: TabDef[] = [
    { id: 'approved', label: 'Approved', count: data.approved_products.length },
    { id: 'phase3', label: 'Phase 3', count: data.late_stage_pipeline.length },
    { id: 'phase2', label: 'Phase 2', count: data.mid_stage_pipeline.length },
    { id: 'early', label: 'Early', count: data.early_pipeline.length },
  ];

  const activeCompetitors = useMemo<Competitor[]>(() => {
    switch (activeTab) {
      case 'approved':
        return data.approved_products;
      case 'phase3':
        return data.late_stage_pipeline;
      case 'phase2':
        return data.mid_stage_pipeline;
      case 'early':
        return data.early_pipeline;
      default:
        return [];
    }
  }, [activeTab, data]);

  return (
    <div className="space-y-6">
      {/* ─── 1. Summary Metrics Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="label mb-1">Crowding Score</p>
          <p className={`font-mono text-2xl font-medium ${getCrowdingColor(data.summary.crowding_score)}`}>
            {data.summary.crowding_score}
            <span className="text-slate-500 text-sm">/10</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{data.summary.crowding_label}</p>
        </div>

        <div className="stat-card">
          <p className="label mb-1">Total Competitors</p>
          <p className="font-mono text-2xl font-medium text-slate-100">
            {allCompetitors.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">All phases</p>
        </div>

        <div className="stat-card">
          <p className="label mb-1">Approved Products</p>
          <p className="font-mono text-2xl font-medium text-signal-green">
            {data.approved_products.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">On market</p>
        </div>

        <div className="stat-card">
          <p className="label mb-1">Phase 3 Programs</p>
          <p className="font-mono text-2xl font-medium text-teal-400">
            {data.late_stage_pipeline.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Late stage</p>
        </div>
      </div>

      {/* ─── 2. Key Insight ─── */}
      <div className="card">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-slate-100 mb-1.5">Key Insight</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.summary.key_insight}
            </p>
            {data.summary.differentiation_opportunity && (
              <div className="mt-3 pt-3 border-t border-navy-700/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-signal-green" />
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    Differentiation Opportunity
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {data.summary.differentiation_opportunity}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. White Space ─── */}
      {data.summary.white_space.length > 0 && (
        <div className="card">
          <h3 className="chart-title mb-3">White Space Opportunities</h3>
          <ul className="space-y-2">
            {data.summary.white_space.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── 4. Landscape Map ─── */}
      <LandscapeMap competitors={allCompetitors} highlightMechanism={mechanism} />

      {/* ─── 5. Tabbed Pipeline Section ─── */}
      <div className="card">
        <div className="flex items-center gap-1 border-b border-navy-700/50 -mx-5 px-5 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-teal-400'
                    : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              {tab.label}
              <span className="font-mono text-xs ml-1.5 opacity-60">{tab.count}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-500 rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Inner table (no card wrapper — we're already inside a card) */}
        {activeCompetitors.length > 0 ? (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Asset</th>
                  <th>Phase</th>
                  <th>MoA</th>
                  <th>Endpoint</th>
                  <th>Key Data</th>
                  <th>Partner</th>
                  <th className="numeric">Deal Value</th>
                  <th className="numeric">Diff.</th>
                  <th className="numeric">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {activeCompetitors.map((c) => {
                  const diffColorClass =
                    c.differentiation_score >= 7
                      ? 'text-teal-400'
                      : c.differentiation_score >= 4
                        ? 'text-signal-amber'
                        : 'text-signal-red';
                  const evidColorClass =
                    c.evidence_strength >= 7
                      ? 'text-teal-400'
                      : c.evidence_strength >= 4
                        ? 'text-signal-amber'
                        : 'text-signal-red';

                  const phaseClassMap: Record<string, string> = {
                    Approved: 'phase-approved',
                    'Phase 3': 'phase-3',
                    'Phase 2/3': 'phase-2',
                    'Phase 2': 'phase-2',
                    'Phase 1/2': 'phase-1',
                    'Phase 1': 'phase-1',
                    Preclinical: 'phase-preclinical',
                  };

                  return (
                    <tr key={c.id}>
                      <td className="text-slate-100 font-medium whitespace-nowrap">{c.company}</td>
                      <td className="text-teal-400 whitespace-nowrap">{c.asset_name}</td>
                      <td>
                        <span className={`phase-badge ${phaseClassMap[c.phase] ?? 'phase-preclinical'}`}>
                          {c.phase}
                        </span>
                      </td>
                      <td className="max-w-[160px] truncate">{c.mechanism}</td>
                      <td className="max-w-[160px] truncate text-slate-400">
                        {c.primary_endpoint || '\u2014'}
                      </td>
                      <td className="max-w-[200px] truncate text-slate-400">
                        {c.key_data || '\u2014'}
                      </td>
                      <td className="text-slate-400 whitespace-nowrap">{c.partner || '\u2014'}</td>
                      <td className="numeric font-mono text-xs">
                        {c.partnership_deal_value || '\u2014'}
                      </td>
                      <td className={`numeric font-mono text-xs ${diffColorClass}`}>
                        {c.differentiation_score}
                      </td>
                      <td className={`numeric font-mono text-xs ${evidColorClass}`}>
                        {c.evidence_strength}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-slate-500 text-sm">No competitors in this category</p>
          </div>
        )}
      </div>

      {/* ─── 6. Market Share / Distribution Charts ─── */}
      <MarketShareChart competitors={allCompetitors} />

      {/* ─── 7. Top 5 Competitors ─── */}
      <div>
        <h3 className="chart-title mb-4">Top Competitors by Differentiation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {topCompetitors.map((competitor, idx) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              rank={idx + 1}
            />
          ))}
        </div>
      </div>

      {/* ─── 8. Data Sources Footer ─── */}
      {data.data_sources.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <h3 className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Data Sources
            </h3>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.data_sources.map((source, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal-400 transition-colors"
                    >
                      {source.name}
                    </a>
                  ) : (
                    source.name
                  )}
                </span>
                <span className="text-slate-600 text-[10px] font-mono">
                  {source.last_updated}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2 font-mono">
            Generated {data.generated_at}
          </p>
        </div>
      )}
    </div>
  );
}
