'use client';

import { useRef } from 'react';
import { Cpu, ShieldCheck, BarChart3, Lightbulb, ArrowRightLeft, Link2, Database } from 'lucide-react';
import type { DeviceCompetitiveLandscapeOutput, DeviceCompetitor } from '@/types/devices-diagnostics';
import { cn } from '@/lib/utils/cn';

interface Props {
  data: DeviceCompetitiveLandscapeOutput;
}

function getCrowdingColor(score: number): string {
  if (score >= 8) return 'text-signal-red';
  if (score >= 5) return 'text-signal-amber';
  return 'text-signal-green';
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    cleared: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    de_novo: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ide_ongoing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    development: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded border font-mono', colors[status] || colors.development)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PathwayBadge({ pathway }: { pathway: string }) {
  const colors: Record<string, string> = {
    '510k': 'badge-510k',
    PMA: 'badge-pma',
    De_Novo: 'badge-de-novo',
    HDE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EUA: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded border font-mono', colors[pathway] || 'badge-510k')}>
      {pathway.replace(/_/g, ' ')}
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

function DeviceRow({ device }: { device: DeviceCompetitor }) {
  return (
    <tr className="border-b border-navy-700/50 hover:bg-navy-800/50">
      <td className="px-3 py-2.5">
        <div className="font-medium text-sm text-white">{device.device_name}</div>
        <div className="text-2xs text-slate-500">{device.company}</div>
      </td>
      <td className="px-3 py-2.5 text-2xs text-slate-400">{device.technology_type}</td>
      <td className="px-3 py-2.5"><StatusBadge status={device.regulatory_status} /></td>
      <td className="px-3 py-2.5"><PathwayBadge pathway={device.pathway} /></td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {device.estimated_market_share_pct != null ? `${device.estimated_market_share_pct}%` : '—'}
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {device.asp_estimate != null ? `$${(device.asp_estimate / 1000).toFixed(0)}K` : '—'}
      </td>
      <td className="px-3 py-2.5 text-2xs text-slate-400">{device.clinical_evidence_level}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <div className="w-12 h-1.5 rounded-full bg-navy-700 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${device.differentiation_score * 10}%` }} />
          </div>
          <span className="font-mono text-2xs text-slate-400">{device.differentiation_score}</span>
        </div>
      </td>
    </tr>
  );
}

export default function DeviceCompetitiveLandscapeReport({ data }: Props) {
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
          label="Cleared/Approved"
          value={data.cleared_approved_devices.length}
          sublabel="devices on market"
        />
        <MetricCard
          label="Pipeline"
          value={data.pipeline_devices.length}
          sublabel="in development"
        />
        <MetricCard
          label="Concentration"
          value={data.market_share_distribution.concentration_label}
          sublabel={`HHI: ${data.market_share_distribution.hhi_index.toLocaleString()}`}
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

      {/* ── Technology Landscape ──────────────────────────── */}
      {data.technology_landscape.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Cpu className="h-4 w-4 text-teal-500" />
            Technology Landscape
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Technology</th>
                  <th className="text-left px-3 py-2">Readiness</th>
                  <th className="text-center px-3 py-2">Competitors</th>
                  <th className="text-left px-3 py-2">Representative</th>
                  <th className="text-left px-3 py-2">Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {data.technology_landscape.map((tech, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white font-medium">{tech.technology_type}</td>
                    <td className="px-3 py-2">
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-navy-700 text-slate-300">{tech.readiness}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-white">{tech.competitor_count}</td>
                    <td className="px-3 py-2 text-slate-400">{tech.representative_device}</td>
                    <td className="px-3 py-2">
                      <span className={cn('text-2xs font-medium', {
                        'text-signal-green': tech.growth_trajectory === 'emerging' || tech.growth_trajectory === 'growing',
                        'text-slate-400': tech.growth_trajectory === 'mature',
                        'text-signal-red': tech.growth_trajectory === 'declining',
                      })}>{tech.growth_trajectory}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Market Share Distribution ─────────────────────── */}
      <div className="card noise p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <BarChart3 className="h-4 w-4 text-teal-500" />
          Market Share Distribution
        </h3>
        <p className="text-sm text-slate-400 mb-3">{data.market_share_distribution.narrative}</p>
        <div className="space-y-2">
          {data.market_share_distribution.competitors
            .sort((a, b) => b.estimated_share_pct - a.estimated_share_pct)
            .slice(0, 10)
            .map((comp, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-slate-400 w-40 truncate">{comp.name}</span>
                <div className="flex-1 h-4 rounded bg-navy-700 overflow-hidden">
                  <div
                    className="h-full rounded bg-teal-500/70"
                    style={{ width: `${Math.min(comp.estimated_share_pct, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-sm text-white w-12 text-right">{comp.estimated_share_pct}%</span>
              </div>
            ))}
        </div>
      </div>

      {/* ── Cleared/Approved Devices Table ────────────────── */}
      {data.cleared_approved_devices.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <ShieldCheck className="h-4 w-4 text-signal-green" />
            Cleared / Approved Devices ({data.cleared_approved_devices.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Device</th>
                  <th className="text-left px-3 py-2">Technology</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Pathway</th>
                  <th className="text-right px-3 py-2">Share</th>
                  <th className="text-right px-3 py-2">ASP</th>
                  <th className="text-left px-3 py-2">Evidence</th>
                  <th className="text-left px-3 py-2">Diff.</th>
                </tr>
              </thead>
              <tbody>
                {data.cleared_approved_devices.map((d, i) => <DeviceRow key={i} device={d} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pipeline Devices Table ────────────────────────── */}
      {data.pipeline_devices.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Cpu className="h-4 w-4 text-signal-amber" />
            Pipeline Devices ({data.pipeline_devices.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Device</th>
                  <th className="text-left px-3 py-2">Technology</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Pathway</th>
                  <th className="text-right px-3 py-2">Share</th>
                  <th className="text-right px-3 py-2">ASP</th>
                  <th className="text-left px-3 py-2">Evidence</th>
                  <th className="text-left px-3 py-2">Diff.</th>
                </tr>
              </thead>
              <tbody>
                {data.pipeline_devices.map((d, i) => <DeviceRow key={i} device={d} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Switching Cost Analysis ───────────────────────── */}
      {data.switching_cost_analysis.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <ArrowRightLeft className="h-4 w-4 text-teal-500" />
            Switching Cost Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.switching_cost_analysis.map((sc, i) => (
              <div key={i} className="bg-navy-800/50 rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{sc.factor.replace(/_/g, ' ')}</span>
                  <span className={cn('text-2xs font-mono px-1.5 py-0.5 rounded', {
                    'bg-signal-green/10 text-signal-green': sc.severity === 'low',
                    'bg-signal-amber/10 text-signal-amber': sc.severity === 'moderate',
                    'bg-signal-red/10 text-signal-red': sc.severity === 'high',
                  })}>{sc.severity}</span>
                </div>
                <p className="text-2xs text-slate-500">{sc.narrative}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Predicate Device Map ──────────────────────────── */}
      {data.predicate_device_map && data.predicate_device_map.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Link2 className="h-4 w-4 text-teal-500" />
            Predicate Device Map
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Device</th>
                  <th className="text-left px-3 py-2">Company</th>
                  <th className="text-left px-3 py-2">K#/PMA</th>
                  <th className="text-left px-3 py-2">Clearance Date</th>
                  <th className="text-left px-3 py-2">Predicate</th>
                </tr>
              </thead>
              <tbody>
                {data.predicate_device_map.map((pd, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white">{pd.device_name}</td>
                    <td className="px-3 py-2 text-slate-400">{pd.company}</td>
                    <td className="px-3 py-2 font-mono text-2xs text-slate-400">{pd.k_number}</td>
                    <td className="px-3 py-2 font-mono text-2xs text-slate-400">{pd.clearance_date}</td>
                    <td className="px-3 py-2 text-slate-400">{pd.predicate_device_name || pd.predicate_k_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Deal Benchmark ────────────────────────────────── */}
      {data.deal_benchmark && data.deal_benchmark.recent_deals.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Database className="h-4 w-4 text-teal-500" />
            MedTech Deal Benchmarks
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-navy-800/50 rounded p-3 text-center">
              <p className="text-2xs text-slate-500">Median Revenue Multiple</p>
              <p className="font-mono text-xl text-teal-400">{data.deal_benchmark.median_revenue_multiple.toFixed(1)}x</p>
            </div>
            <div className="bg-navy-800/50 rounded p-3 text-center">
              <p className="text-2xs text-slate-500">Median Deal Value</p>
              <p className="font-mono text-xl text-white">${(data.deal_benchmark.median_deal_value_m / 1000).toFixed(1)}B</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Target</th>
                  <th className="text-left px-3 py-2">Acquirer</th>
                  <th className="text-right px-3 py-2">Value ($M)</th>
                  <th className="text-center px-3 py-2">Year</th>
                  <th className="text-right px-3 py-2">Multiple</th>
                </tr>
              </thead>
              <tbody>
                {data.deal_benchmark.recent_deals.map((deal, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white">{deal.target}</td>
                    <td className="px-3 py-2 text-slate-400">{deal.acquirer}</td>
                    <td className="px-3 py-2 font-mono text-white text-right">${deal.value_m.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-slate-400 text-center">{deal.year}</td>
                    <td className="px-3 py-2 font-mono text-teal-400 text-right">{deal.multiple || '—'}</td>
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
