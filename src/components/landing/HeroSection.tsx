'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const DASHBOARD_METRICS = [
  { label: 'US TAM', value: '$24.8B', detail: 'High confidence', color: 'text-teal-400' },
  { label: 'US SAM', value: '$8.2B', detail: null, color: 'text-teal-400' },
  { label: 'US SOM', value: '$316M', detail: 'Range: $132\u2013475M', color: 'text-white' },
  { label: 'Peak Sales', value: '$316M', detail: 'Base case', color: 'text-white' },
  { label: '5-yr CAGR', value: '+9.2%', detail: null, color: 'text-emerald-400' },
];

function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="card noise overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-navy-700/60">
        <motion.p
          className="font-mono text-sm text-slate-300 tracking-wide"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          KRAS G12C Inhibitor &middot; NSCLC &middot; Phase 2
        </motion.p>
      </div>

      {/* Metrics body */}
      <div className="p-5 space-y-0">
        {DASHBOARD_METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            className="flex items-baseline justify-between py-2.5 border-b border-navy-700/30 last:border-b-0"
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.6 + i * 0.12 }}
          >
            <span className="text-sm text-slate-300">{m.label}</span>
            <div className="flex items-baseline gap-3">
              <span className={`font-mono text-lg font-medium ${m.color}`}>{m.value}</span>
              {m.detail && <span className="text-xs text-slate-500 hidden sm:inline">{m.detail}</span>}
            </div>
          </motion.div>
        ))}

        {/* Divider */}
        <motion.div
          className="h-px bg-navy-700/60 my-1"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.3 }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Competitive summary */}
        <motion.div
          className="flex items-center justify-between pt-2.5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.5 }}
        >
          <span className="text-sm text-slate-300">Competitors</span>
          <span className="font-mono text-sm text-amber-400">7 competitors &middot; Crowding: 7/10</span>
        </motion.div>
        <motion.div
          className="flex items-center justify-between pt-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.65 }}
        >
          <span className="text-sm text-slate-300">Clinical Programs</span>
          <span className="font-mono text-sm text-white">14 active</span>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="px-5 py-3 border-t border-navy-700/60"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.8 }}
      >
        <p className="text-xs text-slate-500">
          Generated in 4.2s &middot; ClinicalTrials.gov + FDA data &middot; High confidence
        </p>
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,201,167,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.3) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-glow-teal opacity-80 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div>
          {/* Headline */}
          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Know the market
            <br />
            <span className="text-teal-400">before the deal.</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            TAM/SAM/SOM, competitive landscapes, partner scoring, and regulatory pathway analysis &mdash; sourced,
            methodology-backed, and board-presentation-ready. For biotech professionals who can&apos;t wait 3 weeks for
            a consulting deliverable.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link
              href="/signup"
              className="btn btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2 shadow-teal-sm hover:shadow-teal-md transition-shadow"
            >
              Analyze Your Market
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#interactive-demo" className="btn btn-secondary text-base px-8 py-3.5">
              View Sample Report
            </Link>
          </motion.div>
        </div>

        {/* Terminal preview */}
        <motion.div
          className="w-full max-w-xl lg:max-w-none"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
