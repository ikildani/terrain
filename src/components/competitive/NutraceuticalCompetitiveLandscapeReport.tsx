'use client';

import { useRef } from 'react';
import { Leaf, DollarSign, BarChart3, Lightbulb, Award, ShoppingCart, FlaskConical, Database } from 'lucide-react';
import type { NutraceuticalCompetitiveLandscapeOutput, NutraBrandCompetitor } from '@/types/devices-diagnostics';
import { cn } from '@/lib/utils/cn';

interface Props {
  data: NutraceuticalCompetitiveLandscapeOutput;
}

function getCrowdingColor(score: number): string {
  if (score >= 8) return 'text-signal-red';
  if (score >= 5) return 'text-signal-amber';
  return 'text-signal-green';
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    mass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    premium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    clinical_grade: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    luxury: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={cn('text-2xs px-1.5 py-0.5 rounded border font-mono', colors[tier] || colors.mass)}>
      {tier.replace(/_/g, ' ')}
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

function BrandRow({ brand }: { brand: NutraBrandCompetitor }) {
  return (
    <tr className="border-b border-navy-700/50 hover:bg-navy-800/50">
      <td className="px-3 py-2.5">
        <div className="font-medium text-sm text-white">{brand.brand}</div>
        <div className="text-2xs text-slate-500">{brand.company}</div>
      </td>
      <td className="px-3 py-2.5 text-2xs text-slate-400">{brand.primary_ingredient}</td>
      <td className="px-3 py-2.5"><TierBadge tier={brand.price_tier} /></td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        ${brand.estimated_revenue_m.toFixed(0)}M
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        ${brand.price_per_unit.toFixed(2)}
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {brand.amazon_rating != null ? brand.amazon_rating.toFixed(1) : '—'}
      </td>
      <td className="px-3 py-2.5 font-mono text-sm text-white text-right">
        {brand.amazon_reviews != null ? brand.amazon_reviews.toLocaleString() : '—'}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <div className="w-12 h-1.5 rounded-full bg-navy-700 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${brand.differentiation_score * 10}%` }} />
          </div>
          <span className="font-mono text-2xs text-slate-400">{brand.differentiation_score}</span>
        </div>
      </td>
    </tr>
  );
}

export default function NutraceuticalCompetitiveLandscapeReport({ data }: Props) {
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
          label="Category Revenue"
          value={`$${summary.category_revenue_m.toFixed(0)}M`}
          sublabel="estimated annual"
        />
        <MetricCard
          label="Top Brands"
          value={data.top_brands.length}
          sublabel="market leaders"
        />
        <MetricCard
          label="Emerging Brands"
          value={data.emerging_brands.length}
          sublabel="challengers"
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

      {/* ── Pricing Landscape ────────────────────────────── */}
      {data.pricing_landscape.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <DollarSign className="h-4 w-4 text-teal-500" />
            Pricing Landscape
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {data.pricing_landscape.map((tier, i) => (
              <div key={i} className="bg-navy-800/50 rounded-md p-3">
                <TierBadge tier={tier.tier} />
                <div className="mt-2">
                  <p className="font-mono text-sm text-white">
                    ${tier.price_range.low.toFixed(2)} – ${tier.price_range.high.toFixed(2)}
                  </p>
                  <p className="text-2xs text-slate-500 mt-0.5">{tier.brand_count} brands</p>
                  <p className="text-2xs text-slate-500">Avg rev: ${tier.avg_revenue_m.toFixed(0)}M</p>
                </div>
                {tier.representative_brands.length > 0 && (
                  <p className="text-2xs text-slate-500 mt-1 truncate">
                    {tier.representative_brands.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Amazon Intelligence ───────────────────────────── */}
      <div className="card noise p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <ShoppingCart className="h-4 w-4 text-teal-500" />
          Amazon Intelligence
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Avg BSR (Top 10)</p>
            <p className="font-mono text-lg text-white">{data.amazon_intelligence.avg_bsr_top_10.toLocaleString()}</p>
          </div>
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Avg Rating</p>
            <p className="font-mono text-lg text-white">{data.amazon_intelligence.avg_rating_top_10.toFixed(1)}</p>
          </div>
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">Avg Reviews</p>
            <p className="font-mono text-lg text-white">{data.amazon_intelligence.avg_reviews_top_10.toLocaleString()}</p>
          </div>
          <div className="bg-navy-800/50 rounded p-3 text-center">
            <p className="text-2xs text-slate-500">PPC Competition</p>
            <p className={cn('font-mono text-lg', {
              'text-signal-green': data.amazon_intelligence.ppc_competitiveness === 'low',
              'text-signal-amber': data.amazon_intelligence.ppc_competitiveness === 'moderate',
              'text-signal-red': data.amazon_intelligence.ppc_competitiveness === 'high',
            })}>{data.amazon_intelligence.ppc_competitiveness}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">{data.amazon_intelligence.narrative}</p>
      </div>

      {/* ── Channel Distribution ──────────────────────────── */}
      {data.channel_distribution.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <BarChart3 className="h-4 w-4 text-teal-500" />
            Channel Distribution
          </h3>
          <div className="space-y-2">
            {data.channel_distribution
              .sort((a, b) => b.share_pct - a.share_pct)
              .map((ch, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 w-36 truncate">{ch.channel.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-4 rounded bg-navy-700 overflow-hidden">
                    <div className="h-full rounded bg-teal-500/70" style={{ width: `${ch.share_pct}%` }} />
                  </div>
                  <span className="font-mono text-sm text-white w-20 text-right">
                    {ch.brand_count} brands · {ch.share_pct}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Top Brands Table ──────────────────────────────── */}
      {data.top_brands.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Leaf className="h-4 w-4 text-signal-green" />
            Top Brands ({data.top_brands.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Brand</th>
                  <th className="text-left px-3 py-2">Ingredient</th>
                  <th className="text-left px-3 py-2">Tier</th>
                  <th className="text-right px-3 py-2">Revenue</th>
                  <th className="text-right px-3 py-2">Price/Unit</th>
                  <th className="text-right px-3 py-2">Rating</th>
                  <th className="text-right px-3 py-2">Reviews</th>
                  <th className="text-left px-3 py-2">Diff.</th>
                </tr>
              </thead>
              <tbody>
                {data.top_brands.map((b, i) => <BrandRow key={i} brand={b} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Clinical Evidence Gaps ────────────────────────── */}
      {data.clinical_evidence_gaps.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <FlaskConical className="h-4 w-4 text-teal-500" />
            Clinical Evidence Gaps
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Evidence Area</th>
                  <th className="text-center px-3 py-2">Studies</th>
                  <th className="text-left px-3 py-2">Strongest</th>
                  <th className="text-left px-3 py-2">Opportunity</th>
                  <th className="text-left px-3 py-2">Brands w/ Evidence</th>
                </tr>
              </thead>
              <tbody>
                {data.clinical_evidence_gaps.map((gap, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white font-medium">{gap.evidence_area}</td>
                    <td className="px-3 py-2 font-mono text-white text-center">{gap.current_studies}</td>
                    <td className="px-3 py-2 text-slate-400">{gap.strongest_evidence}</td>
                    <td className="px-3 py-2 text-slate-400 text-2xs">{gap.opportunity}</td>
                    <td className="px-3 py-2 text-slate-400 text-2xs">{gap.brands_with_evidence.slice(0, 3).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Certification Matrix ──────────────────────────── */}
      {data.certification_matrix.length > 0 && (
        <div className="card noise p-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Award className="h-4 w-4 text-teal-500" />
            Certification Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-slate-500 text-2xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Certification</th>
                  <th className="text-center px-3 py-2">Brands With</th>
                  <th className="text-center px-3 py-2">Brands Without</th>
                  <th className="text-left px-3 py-2">Importance</th>
                  <th className="text-right px-3 py-2">Cost ($K)</th>
                </tr>
              </thead>
              <tbody>
                {data.certification_matrix.map((cert, i) => (
                  <tr key={i} className="border-b border-navy-700/50">
                    <td className="px-3 py-2 text-white font-medium">{cert.certification}</td>
                    <td className="px-3 py-2 font-mono text-signal-green text-center">{cert.brands_with.length}</td>
                    <td className="px-3 py-2 font-mono text-signal-red text-center">{cert.brands_without.length}</td>
                    <td className="px-3 py-2">
                      <span className={cn('text-2xs font-mono px-1.5 py-0.5 rounded', {
                        'bg-signal-red/10 text-signal-red': cert.consumer_importance === 'high',
                        'bg-signal-amber/10 text-signal-amber': cert.consumer_importance === 'moderate',
                        'bg-signal-green/10 text-signal-green': cert.consumer_importance === 'low',
                      })}>{cert.consumer_importance}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-white text-right">${cert.cost_to_obtain_k}K</td>
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
