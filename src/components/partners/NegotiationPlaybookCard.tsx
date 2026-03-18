'use client';

import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Target, AlertTriangle, Compass } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { NegotiationPlaybook } from '@/types';

interface NegotiationPlaybookCardProps {
  playbook: NegotiationPlaybook;
}

function LeverageMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color =
    score > 6.5
      ? 'bg-signal-green text-signal-green'
      : score >= 4
        ? 'bg-teal-500 text-teal-400'
        : 'bg-signal-amber text-signal-amber';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-navy-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', color.split(' ')[0])}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn('font-mono text-sm font-semibold', color.split(' ')[1])}>{score.toFixed(1)}/10</span>
    </div>
  );
}

function NegotiationPointCard({
  point,
  index,
}: {
  point: NegotiationPlaybook['key_negotiation_points'][0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-navy-700/50 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-navy-800/30 transition-colors"
      >
        <span className="w-5 h-5 rounded bg-teal-500/15 flex items-center justify-center shrink-0">
          <span className="font-mono text-2xs text-teal-400">{index + 1}</span>
        </span>
        <span className="flex-1 text-xs text-white font-medium">{point.point}</span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <p className="text-xs text-slate-400 leading-relaxed">{point.rationale}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-teal-500/5 border border-teal-500/15 rounded-md">
              <p className="text-2xs text-teal-400 uppercase tracking-wider mb-1">Your Ask</p>
              <p className="text-xs text-slate-300 leading-relaxed">{point.ask}</p>
            </div>
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-md">
              <p className="text-2xs text-amber-400 uppercase tracking-wider mb-1">Fallback</p>
              <p className="text-xs text-slate-300 leading-relaxed">{point.fallback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NegotiationPlaybookCard({ playbook }: NegotiationPlaybookCardProps) {
  const [showRedLines, setShowRedLines] = useState(false);
  const [showBATNA, setShowBATNA] = useState(false);

  const rec = playbook.deal_structure_recommendation;
  const typeLabel =
    rec.recommended_type === 'co-development'
      ? 'Co-Development'
      : rec.recommended_type === 'option'
        ? 'Option Deal'
        : 'Licensing';

  return (
    <div className="card noise">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-teal-500" />
        <h3 className="chart-title">Negotiation Playbook</h3>
      </div>

      {/* Leverage Score */}
      <div className="mb-5">
        <p className="text-2xs text-slate-600 uppercase tracking-wider mb-2">Negotiation Leverage</p>
        <LeverageMeter score={playbook.leverage_score} />
        <p className="text-xs text-slate-400 leading-relaxed mt-2">{playbook.leverage_assessment}</p>
      </div>

      {/* Deal Structure Recommendation */}
      <div className="p-3.5 bg-navy-800/50 rounded-lg mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-teal-500" />
          <p className="text-2xs text-slate-500 uppercase tracking-wider">
            Recommended Structure: <span className="text-teal-400">{typeLabel}</span>
          </p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.rationale}</p>
        <div className="space-y-2">
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Upfront Strategy</p>
            <p className="text-xs text-slate-300 mt-0.5">{rec.upfront_strategy}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Milestone Strategy</p>
            <p className="text-xs text-slate-300 mt-0.5">{rec.milestone_strategy}</p>
          </div>
          <div>
            <p className="text-2xs text-slate-600 uppercase tracking-wider">Royalty Strategy</p>
            <p className="text-xs text-slate-300 mt-0.5">{rec.royalty_strategy}</p>
          </div>
        </div>
      </div>

      {/* Key Negotiation Points */}
      <div className="mb-5">
        <p className="text-2xs text-slate-500 uppercase tracking-wider mb-2">Key Negotiation Points</p>
        <div className="space-y-2">
          {playbook.key_negotiation_points.map((point, i) => (
            <NegotiationPointCard key={point.point} point={point} index={i} />
          ))}
        </div>
      </div>

      {/* Red Lines */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowRedLines(!showRedLines)}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            {showRedLines ? 'Hide' : 'Show'} Red Lines ({playbook.red_lines.length})
          </span>
          {showRedLines ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showRedLines && (
          <ul className="mt-2 space-y-2 animate-fade-in">
            {playbook.red_lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-300/80 pl-1">
                <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* BATNA */}
      <div>
        <button
          type="button"
          onClick={() => setShowBATNA(!showBATNA)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showBATNA ? 'Hide' : 'Show'} Best Alternative (BATNA)</span>
          {showBATNA ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showBATNA && (
          <p className="mt-2 text-xs text-slate-400 leading-relaxed p-3 bg-navy-800/40 rounded-md animate-fade-in">
            {playbook.batna}
          </p>
        )}
      </div>
    </div>
  );
}
