'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Search, Loader2, Sparkles } from 'lucide-react';
import { DEMO_INDICATIONS, DEMO_STAGES, DEMO_SUGGESTIONS, STATUS_MESSAGES } from './data';
import { Section } from './Section';

// ────────────────────────────────────────────────────────────
// LIVE DEMO
// ────────────────────────────────────────────────────────────

function LiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const demo = DEMO_INDICATIONS[activeIdx];

  return (
    <div className="card noise p-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-navy-700/60">
        {DEMO_INDICATIONS.map((d, i) => (
          <button
            key={d.name}
            onClick={() => setActiveIdx(i)}
            className={`flex-1 px-4 py-3 text-xs font-mono transition-colors ${
              i === activeIdx
                ? 'text-teal-400 bg-navy-800/50 border-b-2 border-teal-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      <motion.div
        key={activeIdx}
        className="p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'US TAM', value: demo.tam },
            { label: 'US SAM', value: demo.sam },
            { label: 'Peak Revenue', value: demo.som },
            { label: '5-yr CAGR', value: demo.cagr },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="font-mono text-xl text-white font-medium">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div className="mb-6">
          <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">TAM → SAM → SOM Waterfall</div>
          <div className="flex items-end gap-1 h-12">
            <div className="flex-1 bg-teal-500/20 rounded-sm h-full relative">
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/40 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xs font-mono text-teal-300">
                TAM {demo.tam}
              </span>
            </div>
            <div className="flex-1 bg-teal-500/20 rounded-sm relative" style={{ height: '60%' }}>
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/30 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xs font-mono text-teal-300">
                SAM {demo.sam}
              </span>
            </div>
            <div className="flex-1 bg-teal-500/20 rounded-sm relative" style={{ height: '25%' }}>
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/60 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-2xs font-mono text-white">
                SOM {demo.som}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-700/60">
          <div>
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Competitive Density</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-amber-400">{demo.competitors} assets</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-sm ${i < demo.crowding ? 'bg-amber-400' : 'bg-navy-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">Top Partner Match</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">{demo.partner}</span>
              <span className="badge-teal text-2xs px-1.5 py-0.5">{demo.partnerScore}/100</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DEMO RESULTS SKELETON
// ────────────────────────────────────────────────────────────

function DemoResultsSkeleton() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="mt-6 pt-6 border-t border-navy-700/60"
    >
      {/* Cycling status */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.span
            key={msgIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-mono text-teal-400"
          >
            {STATUS_MESSAGES[msgIdx]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Skeleton metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {['US TAM', 'US SAM', 'Peak Revenue', '5-yr CAGR'].map((label) => (
          <div key={label}>
            <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div className="skeleton h-6 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Skeleton waterfall */}
      <div className="mb-6">
        <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">TAM → SAM → SOM Waterfall</div>
        <div className="flex items-end gap-1 h-12">
          <div className="flex-1 skeleton rounded-sm" style={{ height: '100%' }} />
          <div className="flex-1 skeleton rounded-sm" style={{ height: '60%' }} />
          <div className="flex-1 skeleton rounded-sm" style={{ height: '25%' }} />
        </div>
      </div>

      {/* Skeleton CTA */}
      <div className="p-4 rounded-lg bg-navy-800/40 border border-navy-700/40">
        <div className="skeleton h-4 w-3/4 mx-auto rounded mb-3" />
        <div className="skeleton h-9 w-40 mx-auto rounded" />
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// TRY IT YOURSELF (Interactive Demo)
// ────────────────────────────────────────────────────────────

function TryItYourself() {
  const [indication, setIndication] = useState('');
  const [stage, setStage] = useState('phase2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!indication.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo: true,
          product_category: 'pharmaceutical',
          input: {
            indication: indication.trim(),
            development_stage: stage,
            geography: ['US'],
            launch_year: 2027,
            pricing_assumption: 'base',
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Try again.');
      } else {
        setResult(data.data as Record<string, unknown>);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const summary = result?.summary as Record<string, unknown> | undefined;
  const tamUs = summary?.tam_us as { value: number; unit: string } | undefined;
  const samUs = summary?.sam_us as { value: number; unit: string } | undefined;
  const somUs = summary?.som_us as { value: number; unit: string } | undefined;
  const cagr = summary?.cagr_5yr as number | undefined;

  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs font-mono text-teal-400 tracking-wide">Try it yourself — no signup required</span>
        </div>
        <h3 className="font-display text-2xl text-white mb-2">Run a real analysis</h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Type any indication and see instant market sizing powered by our engine.
        </p>
      </div>

      <div className="card noise p-6 max-w-2xl mx-auto">
        {/* Indication input */}
        <div className="mb-4">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Indication</label>
          <input
            type="text"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            placeholder="e.g., Non-Small Cell Lung Cancer"
            className="input w-full"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAnalyze();
            }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {DEMO_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setIndication(s)}
                disabled={loading}
                className="text-2xs font-mono text-slate-500 hover:text-teal-400 px-2 py-1 rounded border border-navy-700 hover:border-teal-500/30 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stage pills */}
        <div className="mb-6">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">
            Development Stage
          </label>
          <div className="flex flex-wrap gap-2">
            {DEMO_STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStage(s.value)}
                disabled={loading}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                  stage === s.value
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                    : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !indication.trim()}
          className="btn btn-primary w-full py-3 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Analyze Market
            </>
          )}
        </button>

        {/* Loading skeleton */}
        <AnimatePresence mode="wait">{loading && <DemoResultsSkeleton />}</AnimatePresence>

        {/* Error */}
        {error && !loading && (
          <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="mt-6 pt-6 border-t border-navy-700/60"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'US TAM', val: tamUs ? `$${tamUs.value}${tamUs.unit}` : '—' },
                  { label: 'US SAM', val: samUs ? `$${samUs.value}${samUs.unit}` : '—' },
                  { label: 'Peak Revenue', val: somUs ? `$${somUs.value}${somUs.unit}` : '—' },
                  { label: '5-yr CAGR', val: cagr != null ? `+${cagr.toFixed(1)}%` : '—' },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
                    <div className="font-mono text-lg text-white font-medium">{m.val}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 text-center">
                <p className="text-sm text-slate-300 mb-3">
                  Sign up to see the full report — patient funnel, geography breakdown, competitive density, and partner
                  matching.
                </p>
                <Link href="/signup" className="btn btn-primary text-sm px-6 py-2 inline-flex items-center gap-2">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// DEMO SECTION
// ────────────────────────────────────────────────────────────

export function DemoSection() {
  return (
    <Section id="demo" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Try It Now</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">See what Terrain delivers.</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Click through three real indications and see instant TAM/SAM/SOM analysis, competitive crowding scores,
              and partner match rankings — the same output you&apos;ll get on day one.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Patient-funnel-driven market sizing',
                'Waterfall TAM → SAM → SOM visualization',
                'Competitive density with crowding score',
                'Algorithmic partner matching with score breakdown',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
              Run your own analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <LiveDemo />
        </div>

        {/* Interactive Demo */}
        <TryItYourself />
      </div>
    </Section>
  );
}
