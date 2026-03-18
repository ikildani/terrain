'use client';

import { FlaskConical, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import type { CompetitorScenario } from '@/types';
import { cn } from '@/lib/utils/cn';
import { UpgradeGate } from '@/components/shared/UpgradeGate';

interface CompetitorScenarioTableProps {
  scenarios: CompetitorScenario[];
  isPro?: boolean;
}

function getScenarioIcon(type: CompetitorScenario['type']) {
  switch (type) {
    case 'simultaneous_launch':
      return <TrendingDown className="h-3.5 w-3.5 text-signal-red" />;
    case 'safety_signal':
      return <TrendingUp className="h-3.5 w-3.5 text-signal-green" />;
    case 'biosimilar_entry':
      return <AlertTriangle className="h-3.5 w-3.5 text-signal-amber" />;
    default:
      return <FlaskConical className="h-3.5 w-3.5 text-slate-400" />;
  }
}

function getScenarioLabel(type: CompetitorScenario['type']): string {
  switch (type) {
    case 'simultaneous_launch':
      return 'Share Erosion';
    case 'safety_signal':
      return 'Share Gain';
    case 'biosimilar_entry':
      return 'Pricing Pressure';
    default:
      return 'Impact';
  }
}

function formatImpact(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  if (Math.abs(value) >= 1000) {
    return `${prefix}$${(value / 1000).toFixed(1)}B`;
  }
  return `${prefix}$${value}M`;
}

function getImpactColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < -50) return 'text-red-400';
  if (value < 0) return 'text-amber-400';
  return 'text-slate-400';
}

function ScenariosContent({ scenarios }: { scenarios: CompetitorScenario[] }) {
  return (
    <div className="card noise">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="h-4 w-4 text-teal-500" />
        <h3 className="chart-title">Multi-Competitor Scenario Modeling</h3>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario, i) => (
          <div
            key={`scenario-${scenario.type}-${i}`}
            className="bg-navy-800/60 rounded-lg border border-navy-700/40 overflow-hidden"
          >
            {/* Scenario Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/30">
              <div className="flex items-center gap-2">
                {getScenarioIcon(scenario.type)}
                <span className="text-sm text-slate-100 font-medium">{scenario.name}</span>
                <span className="text-2xs px-1.5 py-0.5 bg-navy-700/60 rounded text-slate-400 font-mono">
                  {getScenarioLabel(scenario.type)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-slate-500">Probability</span>
                <span className="font-mono text-xs text-teal-400">{scenario.probability_pct}%</span>
              </div>
            </div>

            {/* Bear / Base / Bull Grid */}
            <div className="grid grid-cols-3 divide-x divide-navy-700/30">
              {/* Bear */}
              <div className="px-4 py-3 text-center">
                <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1">Bear</p>
                <div className="space-y-1">
                  <p className={cn('font-mono text-sm', getImpactColor(scenario.impact_on_som.bear))}>
                    {formatImpact(scenario.impact_on_som.bear)}
                  </p>
                  <p className="text-2xs text-slate-500">SOM Impact</p>
                  <p className={cn('font-mono text-xs', getImpactColor(scenario.impact_on_peak_sales.bear))}>
                    {formatImpact(scenario.impact_on_peak_sales.bear)}
                  </p>
                  <p className="text-2xs text-slate-600">Peak Sales</p>
                </div>
              </div>

              {/* Base */}
              <div className="px-4 py-3 text-center bg-navy-800/30">
                <p className="text-2xs uppercase tracking-wider text-teal-500 mb-1">Base</p>
                <div className="space-y-1">
                  <p className={cn('font-mono text-sm font-medium', getImpactColor(scenario.impact_on_som.base))}>
                    {formatImpact(scenario.impact_on_som.base)}
                  </p>
                  <p className="text-2xs text-slate-500">SOM Impact</p>
                  <p
                    className={cn('font-mono text-xs font-medium', getImpactColor(scenario.impact_on_peak_sales.base))}
                  >
                    {formatImpact(scenario.impact_on_peak_sales.base)}
                  </p>
                  <p className="text-2xs text-slate-600">Peak Sales</p>
                </div>
              </div>

              {/* Bull */}
              <div className="px-4 py-3 text-center">
                <p className="text-2xs uppercase tracking-wider text-slate-500 mb-1">Bull</p>
                <div className="space-y-1">
                  <p className={cn('font-mono text-sm', getImpactColor(scenario.impact_on_som.bull))}>
                    {formatImpact(scenario.impact_on_som.bull)}
                  </p>
                  <p className="text-2xs text-slate-500">SOM Impact</p>
                  <p className={cn('font-mono text-xs', getImpactColor(scenario.impact_on_peak_sales.bull))}>
                    {formatImpact(scenario.impact_on_peak_sales.bull)}
                  </p>
                  <p className="text-2xs text-slate-600">Peak Sales</p>
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="px-4 py-2.5 border-t border-navy-700/30">
              <p className="text-xs text-slate-400 leading-relaxed">{scenario.narrative}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompetitorScenarioTable({ scenarios, isPro = false }: CompetitorScenarioTableProps) {
  if (!isPro) {
    return (
      <UpgradeGate feature="Competitor Scenario Modeling">
        <ScenariosContent scenarios={scenarios} />
      </UpgradeGate>
    );
  }

  return <ScenariosContent scenarios={scenarios} />;
}
