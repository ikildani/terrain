'use client';

import { DollarSign, TrendingDown, Gauge, ShieldCheck } from 'lucide-react';
import type { PricingPressure } from '@/types';
import { cn } from '@/lib/utils/cn';
import { UpgradeGate } from '@/components/shared/UpgradeGate';

interface PricingPressureCardProps {
  data: PricingPressure;
  isPro?: boolean;
}

function getPressureColor(score: number): string {
  if (score >= 7) return 'text-red-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-emerald-400';
}

function getPressureLabel(score: number): string {
  if (score >= 8) return 'Extreme';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Moderate';
  if (score >= 2) return 'Low';
  return 'Minimal';
}

function getPositionBadge(position: PricingPressure['your_position']): { label: string; className: string } {
  switch (position) {
    case 'premium':
      return { label: 'Premium Positioning', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' };
    case 'parity':
      return { label: 'Market Parity', className: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
    case 'discount':
      return { label: 'Discount Pressure', className: 'bg-red-500/15 text-red-400 border-red-500/25' };
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function PricingPressureContent({ data }: { data: PricingPressure }) {
  const positionBadge = getPositionBadge(data.your_position);
  const gaugeRotation = (data.pressure_score / 10) * 180 - 90; // -90 to +90 degrees

  return (
    <div className="card noise">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-teal-500" />
          <h3 className="chart-title">Pricing Pressure Calculator</h3>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border',
            positionBadge.className,
          )}
        >
          {positionBadge.label}
        </span>
      </div>

      {/* Narrative */}
      <p className="text-xs text-slate-400 leading-relaxed mb-5 bg-navy-800/40 rounded-md px-3 py-2 border border-navy-700/30">
        {data.narrative}
      </p>

      {/* Top Row: Pressure Score + Pricing Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Pressure Score Gauge */}
        <div className="bg-navy-800/60 rounded-lg border border-navy-700/40 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Gauge className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Pricing Pressure Score</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('font-mono text-3xl font-medium', getPressureColor(data.pressure_score))}>
                {data.pressure_score}
                <span className="text-slate-600 text-sm">/10</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{getPressureLabel(data.pressure_score)} Pressure</p>
            </div>
            {/* Visual gauge bar */}
            <div className="w-32">
              <div className="w-full h-2 bg-navy-700/60 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    data.pressure_score >= 7
                      ? 'bg-red-500'
                      : data.pressure_score >= 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500',
                  )}
                  style={{ width: `${data.pressure_score * 10}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-600 font-mono">Low</span>
                <span className="text-[9px] text-slate-600 font-mono">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Pricing Range */}
        <div className="bg-navy-800/60 rounded-lg border border-navy-700/40 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
              Market WAC Range (Annual)
            </span>
          </div>
          <div className="space-y-2">
            {/* Range bar */}
            <div className="relative h-8 flex items-center">
              <div className="absolute inset-x-0 h-1.5 bg-navy-700/60 rounded-full" />
              <div
                className="absolute h-1.5 bg-gradient-to-r from-emerald-500/60 via-teal-500/80 to-amber-500/60 rounded-full"
                style={{ left: '10%', right: '10%' }}
              />
              {/* Low marker */}
              <div className="absolute" style={{ left: '10%', transform: 'translateX(-50%)' }}>
                <div className="w-0.5 h-4 bg-emerald-400/60 rounded" />
              </div>
              {/* Median marker */}
              <div className="absolute" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                <div className="w-1 h-5 bg-teal-400 rounded" />
              </div>
              {/* High marker */}
              <div className="absolute" style={{ left: '90%', transform: 'translateX(-50%)' }}>
                <div className="w-0.5 h-4 bg-amber-400/60 rounded" />
              </div>
            </div>
            <div className="flex justify-between text-2xs font-mono">
              <span className="text-emerald-400">{formatCurrency(data.market_pricing_range.low)}</span>
              <span className="text-teal-400 font-medium">{formatCurrency(data.market_pricing_range.median)}</span>
              <span className="text-amber-400">{formatCurrency(data.market_pricing_range.high)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>Low</span>
              <span>Median</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pressure Factors */}
      <div className="mb-5">
        <h4 className="text-2xs uppercase tracking-wider text-slate-500 font-medium mb-3">Pressure Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.pressure_factors.map((factor, i) => (
            <div
              key={`factor-${factor.factor}-${i}`}
              className="bg-navy-800/40 rounded-md border border-navy-700/30 px-3 py-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-200 font-medium">{factor.factor}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1 bg-navy-700/60 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        factor.contribution >= 7
                          ? 'bg-red-500'
                          : factor.contribution >= 4
                            ? 'bg-amber-500'
                            : 'bg-emerald-500',
                      )}
                      style={{ width: `${factor.contribution * 10}%` }}
                    />
                  </div>
                  <span className="font-mono text-2xs text-slate-400">{factor.contribution}/10</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{factor.narrative}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Net Price Erosion Trajectory */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingDown className="h-3.5 w-3.5 text-slate-500" />
          <h4 className="text-2xs uppercase tracking-wider text-slate-500 font-medium">
            5-Year Net Price Erosion Forecast
          </h4>
        </div>
        <div className="flex items-end gap-2 h-24 px-2">
          {data.net_price_erosion_forecast.map((point, i) => {
            const maxErosion = data.net_price_erosion_forecast[data.net_price_erosion_forecast.length - 1].erosion_pct;
            const barHeight = maxErosion > 0 ? (point.erosion_pct / maxErosion) * 100 : 0;

            return (
              <div key={`erosion-${point.year}`} className="flex-1 flex flex-col items-center gap-1">
                <span className="font-mono text-2xs text-red-400">-{point.erosion_pct}%</span>
                <div className="w-full bg-navy-700/40 rounded-t relative" style={{ height: '64px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-red-500/30 border-t border-red-500/50 rounded-t transition-all"
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-slate-500">{point.year}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimal Strategy */}
      <div className="bg-teal-900/20 rounded-lg border border-teal-500/15 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
          <span className="text-2xs uppercase tracking-wider text-teal-500 font-medium">Optimal Pricing Strategy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{data.optimal_strategy}</p>
      </div>
    </div>
  );
}

export default function PricingPressureCard({ data, isPro = false }: PricingPressureCardProps) {
  if (!isPro) {
    return (
      <UpgradeGate feature="Pricing Pressure Analysis">
        <PricingPressureContent data={data} />
      </UpgradeGate>
    );
  }

  return <PricingPressureContent data={data} />;
}
