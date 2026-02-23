'use client';

import { useState, useMemo, useRef } from 'react';
import { Sparkles, Database, TableProperties, Clock, ShieldAlert, Lightbulb, Target } from 'lucide-react';
import type { CompetitiveLandscapeOutput, Competitor } from '@/types';
import { cn } from '@/lib/utils/cn';
import LandscapeMap from './LandscapeMap';
import PipelineTable from './PipelineTable';
import PipelineDistributionChart from './PipelineDistributionChart';
import CompanyConcentrationChart from './CompanyConcentrationChart';
import CompetitorCard from './CompetitorCard';
import { SaveReportButton } from '@/components/shared/SaveReportButton';
import { ExportButton } from '@/components/shared/ExportButton';

interface CompetitiveLandscapeReportProps {
  data: CompetitiveLandscapeOutput;
  mechanism?: string;
  previewMode?: boolean;
  onPdfExport?: () => void;
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
  previewMode,
  onPdfExport,
}: CompetitiveLandscapeReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('approved');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [moaFilter, setMoaFilter] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  const allCompetitorsRaw = useMemo<Competitor[]>(() => {
    return [
      ...data.approved_products,
      ...data.late_stage_pipeline,
      ...data.mid_stage_pipeline,
      ...data.early_pipeline,
    ];
  }, [data]);

  const allCompetitors = useMemo<Competitor[]>(() => {
    let filtered = allCompetitorsRaw;
    if (phaseFilter !== 'all') {
      filtered = filtered.filter((c) => c.phase === phaseFilter);
    }
    if (moaFilter.trim()) {
      const term = moaFilter.toLowerCase();
      filtered = filtered.filter((c) => c.mechanism.toLowerCase().includes(term));
    }
    return filtered;
  }, [allCompetitorsRaw, phaseFilter, moaFilter]);

  const topCompetitors = useMemo<Competitor[]>(() => {
    return [...allCompetitors]
      .sort((a, b) => b.differentiation_score - a.differentiation_score)
      .slice(0, 5);
  }, [allCompetitors]);

  // CSV export data: flatten all competitors into a table-friendly format
  const csvData = useMemo(() => {
    return allCompetitors.map((c) => ({
      Company: c.company,
      Asset: c.asset_name,
      Phase: c.phase,
      Mechanism: c.mechanism,
      Endpoint: c.primary_endpoint || '',
      'Key Data': c.key_data || '',
      Partner: c.partner || '',
      'Deal Value': c.partnership_deal_value || '',
      'Differentiation Score': c.differentiation_score,
      'Evidence Strength': c.evidence_strength,
      Strengths: c.strengths.join('; '),
      Weaknesses: c.weaknesses.join('; '),
    }));
  }, [allCompetitors]);

  // Comparison matrix column headers (competitor names)
  const matrixColumns = useMemo(() => {
    if (!data.comparison_matrix || data.comparison_matrix.length === 0) return [];
    return Object.keys(data.comparison_matrix[0].competitors);
  }, [data.comparison_matrix]);

  const tabs: TabDef[] = [
    { id: 'approved', label: 'Approved', count: data.approved_products.length },
    { id: 'phase3', label: 'Phase 3', count: data.late_stage_pipeline.length },
    { id: 'phase2', label: 'Phase 2', count: data.mid_stage_pipeline.length },
    { id: 'early', label: 'Early', count: data.early_pipeline.length },
  ];

  const activeCompetitors = useMemo<Competitor[]>(() => {
    let list: Competitor[];
    switch (activeTab) {
      case 'approved':
        list = data.approved_products;
        break;
      case 'phase3':
        list = data.late_stage_pipeline;
        break;
      case 'phase2':
        list = data.mid_stage_pipeline;
        break;
      case 'early':
        list = data.early_pipeline;
        break;
      default:
        list = [];
    }
    if (moaFilter.trim()) {
      const term = moaFilter.toLowerCase();
      list = list.filter((c) => c.mechanism.toLowerCase().includes(term));
    }
    return list;
  }, [activeTab, data, moaFilter]);

  return (
    <div className="space-y-6" ref={reportRef} data-report-content>
      {/* ─── 1. Summary Metrics Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card noise">
          <p className="label mb-1">Crowding Score</p>
          <p className={`font-mono text-2xl font-medium ${getCrowdingColor(data.summary.crowding_score)}`}>
            {data.summary.crowding_score}
            <span className="text-slate-500 text-sm">/10</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{data.summary.crowding_label}</p>
        </div>

        <div className="stat-card noise">
          <p className="label mb-1">Total Competitors</p>
          <p className="font-mono text-2xl font-medium text-slate-100">
            {allCompetitors.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">All phases</p>
        </div>

        <div className="stat-card noise">
          <p className="label mb-1">Approved Products</p>
          <p className="font-mono text-2xl font-medium text-signal-green">
            {data.approved_products.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">On market</p>
        </div>

        <div className="stat-card noise">
          <p className="label mb-1">Phase 3 Programs</p>
          <p className="font-mono text-2xl font-medium text-teal-400">
            {data.late_stage_pipeline.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Late stage</p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono">
          Generated {new Date(data.generated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span className="text-[9px] text-slate-600 font-mono">Source: Terrain Competitive Database</span>
      </div>

      {/* ─── 2. Executive Summary ─── */}
      <div className="card noise">
        <h3 className="chart-title mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Threat */}
          {topCompetitors.length > 0 && (
            <div className="bg-navy-800/60 rounded-lg px-4 py-3 border border-navy-700/40">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldAlert className="h-3.5 w-3.5 text-signal-red" />
                <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
                  Top Threat
                </span>
              </div>
              <p className="text-sm text-slate-100 font-medium">
                {topCompetitors[0].company} &mdash; {topCompetitors[0].asset_name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {topCompetitors[0].phase} &middot; Diff. Score{' '}
                <span className="font-mono text-teal-400">{topCompetitors[0].differentiation_score}</span>
                {' '}&middot; Evidence{' '}
                <span className="font-mono text-teal-400">{topCompetitors[0].evidence_strength}</span>
              </p>
            </div>
          )}

          {/* Key Opportunity */}
          {data.summary.white_space.length > 0 && (
            <div className="bg-navy-800/60 rounded-lg px-4 py-3 border border-teal-500/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5 text-teal-500" />
                <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
                  Key Opportunity
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {data.summary.white_space[0]}
              </p>
            </div>
          )}

          {/* Key Insight */}
          <div className="bg-navy-800/60 rounded-lg px-4 py-3 border border-navy-700/40">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
                Key Insight
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.summary.key_insight}
            </p>
          </div>

          {/* Differentiation Opportunity */}
          {data.summary.differentiation_opportunity && (
            <div className="bg-navy-800/60 rounded-lg px-4 py-3 border border-navy-700/40">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-signal-amber" />
                <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
                  Differentiation Opportunity
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {data.summary.differentiation_opportunity}
              </p>
            </div>
          )}
        </div>

        {/* Additional white space items */}
        {data.summary.white_space.length > 1 && (
          <div className="mt-4 pt-4 border-t border-navy-700/30">
            <p className="text-2xs uppercase tracking-wider text-slate-500 font-medium mb-2">
              Additional White Space
            </p>
            <ul className="space-y-1.5">
              {data.summary.white_space.slice(1).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-signal-green flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ─── 4. Filter Controls ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="input py-1.5 px-3 text-xs bg-navy-800 border-navy-700 w-auto"
        >
          <option value="all">All Phases</option>
          <option value="Approved">Approved</option>
          <option value="Phase 3">Phase 3</option>
          <option value="Phase 2">Phase 2</option>
          <option value="Phase 1">Phase 1</option>
          <option value="Preclinical">Preclinical</option>
        </select>
        <input
          type="text"
          placeholder="Filter by mechanism..."
          value={moaFilter}
          onChange={(e) => setMoaFilter(e.target.value)}
          className="input py-1.5 px-3 text-xs bg-navy-800 border-navy-700 w-48"
        />
        {(phaseFilter !== 'all' || moaFilter) && (
          <span className="text-2xs text-slate-500 font-mono">
            {allCompetitors.length} of {allCompetitorsRaw.length} shown
          </span>
        )}
      </div>

      {/* ─── 5. Landscape Map ─── */}
      <LandscapeMap competitors={allCompetitors} highlightMechanism={mechanism} />

      {/* ─── 5. Tabbed Pipeline Section ─── */}
      <div className="card noise">
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

        {/* Sortable pipeline table with click-to-expand */}
        <PipelineTable competitors={activeCompetitors} noCard />
      </div>

      {/* ─── 6. Pipeline Distribution + Company Concentration ─── */}
      <PipelineDistributionChart competitors={allCompetitors} />
      <CompanyConcentrationChart competitors={allCompetitors} />

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

      {/* ─── 8. Comparison Matrix ─── */}
      {data.comparison_matrix && data.comparison_matrix.length > 0 && matrixColumns.length > 0 && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-4">
            <TableProperties className="h-4 w-4 text-teal-500" />
            <h3 className="chart-title">Head-to-Head Comparison</h3>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-navy-900 z-10">Attribute</th>
                  {matrixColumns.map((col) => (
                    <th key={col} className="whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.comparison_matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="sticky left-0 bg-navy-900 z-10 text-slate-100 font-medium whitespace-nowrap">
                      {row.attribute}
                    </td>
                    {matrixColumns.map((col) => {
                      const val = row.competitors[col];
                      const isScoreRow = row.attribute === 'Differentiation' || row.attribute === 'Evidence Strength';
                      const numVal = typeof val === 'number' ? val : null;
                      const scoreClass = isScoreRow && numVal !== null
                        ? numVal >= 7
                          ? 'text-teal-400 font-mono'
                          : numVal >= 4
                            ? 'text-signal-amber font-mono'
                            : 'text-signal-red font-mono'
                        : 'text-slate-400';
                      return (
                        <td key={col} className={cn('text-xs max-w-[180px] truncate', scoreClass)}>
                          {val ?? '\u2014'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 9. Action Bar ─── */}
      {!previewMode && (
        <div className="flex items-center justify-end gap-3">
          <SaveReportButton
            reportData={{
              title: `Competitive Landscape — ${data.summary.indication}`,
              report_type: 'competitive',
              indication: data.summary.indication,
              inputs: { indication: data.summary.indication, mechanism: mechanism ?? '' },
              outputs: data as unknown as Record<string, unknown>,
            }}
          />
          <ExportButton
            format="pdf"
            onPdfExport={onPdfExport}
            targetRef={reportRef}
            reportTitle={`Competitive Landscape — ${data.summary.indication}`}
            filename={`competitive-landscape-${Date.now()}`}
          />
          <ExportButton
            format="csv"
            data={csvData}
            filename={`competitive-landscape-${Date.now()}`}
          />
          <ExportButton
            format="email"
            reportTitle={`Competitive Landscape — ${data.summary.indication}`}
          />
        </div>
      )}

      {/* ─── 10. Data Sources Footer ─── */}
      {data.data_sources.length > 0 && (
        <div className="card noise">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <h3 className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
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
                <span className="text-slate-600 text-2xs font-mono">
                  {source.last_updated}
                </span>
              </div>
            ))}
          </div>
          <p className="text-2xs text-slate-600 mt-2 font-mono">
            Generated {data.generated_at}
          </p>
        </div>
      )}
    </div>
  );
}
