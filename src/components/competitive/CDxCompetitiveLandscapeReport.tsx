'use client';

import { useRef } from 'react';
import { FlaskConical, Dna, BarChart3, Lightbulb, Pill, Database, Layers } from 'lucide-react';
import type { CDxCompetitiveLandscapeOutput, CDxCompetitor, CDxPlatform } from '@/types/devices-diagnostics';
import { cn } from '@/lib/utils/cn';

interface Props {
  data: CDxCompetitiveLandscapeOutput;
}

function getCrowdingColor(score: number): string {
  if (score >= 8) return 'text-signal-red';
  if (score >= 5) return 'text-signal-amber';
  return 'text-signal-green';
}

function PlatformBadge({ platform }: { platform: CDxPlatform }) {
  const colors: Record<string, string> = {
    NGS: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    PCR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IHC: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    FISH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    liquid_biopsy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ddPCR: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    microarray: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded border font-mono', colors[platform] || colors.NGS)}>
      {platform.replace(/_/g, ' ')}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PMA_approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cleared: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    LDT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    development: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded border font-mono', colors[status] || colors.LDT)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function MetricCard({ label, value, sublabel, color }: { label: string; value: string | number; sublabel?: string; color?: string }) {
  return (
    <div className="card noise p-4">
      <p className="text-2xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={cn('font-mono text-2xl font-semibold mt-1', color || 'text-white')}>{value}</p>
      {sublabel && <p className="text-2xs text-slate-500 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function CDxRow({ test }: { test: CDxCompetitor }) {
  return (
    <tr className="border-b border-navy-700/50 hover:bg-navy-800/50">
      <td className="px-3 py-2.5">
        <div className="font-medium text-sm text-white">{test.test_name}</div>
        <div className="text-2xs text-slate-500">{test.company}</div>
      </td>
      <td className="px-3 py-2.5"><PlatformBadge platform={test.platform} /></td>
      <td className="px-3 py-2.5"><StatusBadge status={test.regulatory_status} /></td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {test.genes_in_panel != null ? test.genes_in_panel.toLocaleString() : '—'}
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {test.turnaround_days != null ? `${test.turnaround_days}d` : '—'}
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {test.test_price_estimate != null ? `$${test.test_price_estimate.toLocaleString()}` : '—'}
      </td>
      <td className="px-3 py-2.5 text-2xs text-slate-400">
        {test.sample_type.join(', ')}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <div className="w-12 h-1.5 rounded-full bg-navy-700 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${test.differentiation_score * 10}%` }} />
          </div>
          <span className="font-mono text-2xs text-slate-400">{test.differentiation_score}</span>
        </div>
      </td>
    </tr>
  );
}

export default function CDxCompetitiveLandscapeReport({ data }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { summary } = data;

  return (
    <div ref={reportRef} className="space-y-6 animate-fade-in">
      {/* ── Summary Metrics ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Crowding Score"
          value={`${summary.crowding_score}/10`}
          sublabel={summary.crowding_label}
          color={getCrowdingColor(summary.crowding_score)}
        />
        <MetricCard
          label="Approved Tests"
          value={data.approved_tests.length}
          sublabel="FDA approved/cleared"
        />
        <MetricCard
          label="Pipeline/LDT"
          value={data.pipeline_tests.length}
          sublabel="in development or LDT"
        />
        <MetricCard
          label="Dominant Platform"
          value={summary.platform_dominant.replace(/_/g, ' ')}
          sublabel={`${summary.testing_penetration_pct}% penetration`}
        />
      </div>

      {/* ── Key Insight ──────────────────────────────────── */}
      <div className="card noise p-4 border-l-2 border-teal-500">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Key Insight</p>
            <p className="text-sm text-slate-400 mt-1">{summary.key_insight}</p>
          </div>
        </div>
      </div>

      {/* ── White Space ──────────────────────────────────── */}
      {summary.white_space.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Lightbulb className="h-4 w-4 text-signal-amber" />
            White Space Opportunities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {summary.white_space.map((ws, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-400 bg-navy-800/50 rounded px-3 py-2">
                <span className="text-teal-500 mt-0.5 flex-shrink-0">&#9679;</span>
                {ws}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Biomarker Competition Matrix ──────────────────── */}
      {data.biomarker_competition_matrix.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Dna className="h-4 w-4 text-teal-500" />
            Biomarker Competition Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Biomarker</th>
                  <th className="text-center px-3 py-2">Tests</th>
                  <th className="text-left px-3 py-2">Approved Drugs</th>
                  <th className="text-right px-3 py-2">Testing Rate</th>
                  <th className="text-left px-3 py-2">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {data.biomarker_competition_matrix.map((bm, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 font-medium text-white">{bm.biomarker}</td>
                    <td className="px-3 py-2 text-center font-mono text-white">{bm.tests_detecting.length}</td>
                    <td className="px-3 py-2 text-slate-400 text-2xs">{bm.linked_drugs_approved.slice(0, 3).join(', ') || '—'}</td>
                    <td className="px-3 py-2 font-mono text-white text-right">{bm.testing_rate_pct}%</td>
                    <td className="px-3 py-2">
                      <span className={cn('text-2xs font-mono px-1.5 py-0.5 rounded', {
                        'bg-signal-green/10 text-signal-green': bm.competitive_intensity === 'low',
                        'bg-signal-amber/10 text-signal-amber': bm.competitive_intensity === 'moderate',
                        'bg-signal-red/10 text-signal-red': bm.competitive_intensity === 'high' || bm.competitive_intensity === 'very_high',
                      })}>{bm.competitive_intensity.replace(/_/g, ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Platform Comparison ───────────────────────────── */}
      {data.platform_comparison.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Layers className="h-4 w-4 text-teal-500" />
            Platform Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Platform</th>
                  <th className="text-center px-3 py-2">Tests</th>
                  <th className="text-right px-3 py-2">Avg TAT</th>
                  <th className="text-right px-3 py-2">Avg Price</th>
                  <th className="text-left px-3 py-2">Breadth</th>
                  <th className="text-left px-3 py-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.platform_comparison.map((pc, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2"><PlatformBadge platform={pc.platform} /></td>
                    <td className="px-3 py-2 text-center font-mono text-white">{pc.test_count}</td>
                    <td className="px-3 py-2 font-mono text-white text-right">{pc.avg_turnaround_days.toFixed(0)}d</td>
                    <td className="px-3 py-2 font-mono text-white text-right">${pc.avg_price_estimate.toLocaleString()}</td>
                    <td className="px-3 py-2 text-slate-400">{pc.biomarker_breadth}</td>
                    <td className="px-3 py-2">
                      <span className={cn('text-2xs font-medium', {
                        'text-signal-green': pc.trend === 'growing',
                        'text-slate-400': pc.trend === 'stable',
                        'text-signal-red': pc.trend === 'declining',
                      })}>{pc.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Testing Landscape ────────────────────────────── */}
      <div className="card noise p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <BarChart3 className="h-4 w-4 text-teal-500" />
          Testing Landscape
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Est. Annual Tests</p>
            <p className="font-mono text-xl text-white">
              {data.testing_landscape.total_estimated_tests_per_year >= 1000000
                ? `${(data.testing_landscape.total_estimated_tests_per_year / 1000000).toFixed(1)}M`
                : `${(data.testing_landscape.total_estimated_tests_per_year / 1000).toFixed(0)}K`}
            </p>
          </div>
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Growth Rate</p>
            <p className="font-mono text-xl text-signal-green">{data.testing_landscape.growth_rate_pct}%</p>
          </div>
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Testing Penetration</p>
            <p className="font-mono text-xl text-teal-400">{summary.testing_penetration_pct}%</p>
          </div>
        </div>
        <div className="space-y-2">
          {data.testing_landscape.by_platform.map((bp, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-28">{bp.platform.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-4 rounded bg-navy-700 overflow-hidden">
                <div className="h-full rounded bg-teal-500/70" style={{ width: `${bp.share_pct}%` }} />
              </div>
              <span className="font-mono text-sm text-white w-12 text-right">{bp.share_pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Linked Drug Dependencies ─────────────────────── */}
      {data.linked_drug_dependency.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Pill className="h-4 w-4 text-teal-500" />
            Linked Drug Dependencies
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Drug</th>
                  <th className="text-left px-3 py-2">Company</th>
                  <th className="text-left px-3 py-2">Phase</th>
                  <th className="text-right px-3 py-2">Est. Revenue</th>
                  <th className="text-center px-3 py-2">CDx Tests</th>
                  <th className="text-left px-3 py-2">Dependency</th>
                </tr>
              </thead>
              <tbody>
                {data.linked_drug_dependency.map((dd, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white font-medium">{dd.drug_name}</td>
                    <td className="px-3 py-2 text-slate-400">{dd.drug_company}</td>
                    <td className="px-3 py-2 text-slate-400">{dd.drug_phase}</td>
                    <td className="px-3 py-2 font-mono text-white text-right">
                      {dd.estimated_drug_revenue_m != null ? `$${(dd.estimated_drug_revenue_m / 1000).toFixed(1)}B` : '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-white text-center">{dd.cdx_tests_linked.length}</td>
                    <td className="px-3 py-2">
                      <span className={cn('text-2xs font-mono px-1.5 py-0.5 rounded', {
                        'bg-signal-red/10 text-signal-red': dd.cdx_revenue_dependency === 'high',
                        'bg-signal-amber/10 text-signal-amber': dd.cdx_revenue_dependency === 'moderate',
                        'bg-signal-green/10 text-signal-green': dd.cdx_revenue_dependency === 'low',
                      })}>{dd.cdx_revenue_dependency}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Approved Tests Table ──────────────────────────── */}
      {data.approved_tests.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <FlaskConical className="h-4 w-4 text-signal-green" />
            FDA Approved / Cleared Tests ({data.approved_tests.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Test</th>
                  <th className="text-left px-3 py-2">Platform</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Genes</th>
                  <th className="text-right px-3 py-2">TAT</th>
                  <th className="text-right px-3 py-2">Price</th>
                  <th className="text-left px-3 py-2">Sample</th>
                  <th className="text-left px-3 py-2">Diff.</th>
                </tr>
              </thead>
              <tbody>
                {data.approved_tests.map((t, i) => <CDxRow key={i} test={t} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pipeline/LDT Tests Table ─────────────────────── */}
      {data.pipeline_tests.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <FlaskConical className="h-4 w-4 text-signal-amber" />
            Pipeline / LDT Tests ({data.pipeline_tests.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Test</th>
                  <th className="text-left px-3 py-2">Platform</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Genes</th>
                  <th className="text-right px-3 py-2">TAT</th>
                  <th className="text-right px-3 py-2">Price</th>
                  <th className="text-left px-3 py-2">Sample</th>
                  <th className="text-left px-3 py-2">Diff.</th>
                </tr>
              </thead>
              <tbody>
                {data.pipeline_tests.map((t, i) => <CDxRow key={i} test={t} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Comparable CDx Deals ──────────────────────────── */}
      {data.comparable_cdx_deals && data.comparable_cdx_deals.deals.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Database className="h-4 w-4 text-teal-500" />
            Comparable CDx / Diagnostics Deals
          </h3>
          <div className="bg-navy-800/50 rounded p-3 text-center mb-4">
            <p className="text-2xs text-slate-500">Median Deal Value</p>
            <p className="font-mono text-xl text-teal-400">
              ${(data.comparable_cdx_deals.median_deal_value_m / 1000).toFixed(1)}B
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Target</th>
                  <th className="text-left px-3 py-2">Acquirer</th>
                  <th className="text-right px-3 py-2">Value ($M)</th>
                  <th className="text-center px-3 py-2">Year</th>
                  <th className="text-left px-3 py-2">Focus</th>
                </tr>
              </thead>
              <tbody>
                {data.comparable_cdx_deals.deals.map((deal, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white">{deal.target}</td>
                    <td className="px-3 py-2 text-slate-400">{deal.acquirer}</td>
                    <td className="px-3 py-2 font-mono text-white text-right">${deal.value_m.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-slate-400 text-center">{deal.year}</td>
                    <td className="px-3 py-2 text-slate-400">{deal.biomarker_focus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Data Sources ──────────────────────────────────── */}
      <div className="card noise p-4">
        <h3 className="text-2xs text-slate-500 uppercase tracking-wider mb-2">Data Sources</h3>
        <div className="flex flex-wrap gap-2">
          {data.data_sources.map((src, i) => (
            <span key={i} className="text-2xs bg-navy-800 text-slate-400 px-2 py-1 rounded border border-navy-700">
              {src.name}
            </span>
          ))}
        </div>
        <p className="text-2xs text-slate-600 mt-2">Generated {new Date(data.generated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
