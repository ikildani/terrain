'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TERMINAL_LINES, TERMINAL_LINES_2 } from './data';

function TerminalPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <div ref={ref} className="card noise overflow-hidden">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700/60">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-3 text-xs font-mono text-slate-500">terrain — market-sizing</span>
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-sm space-y-3">
        <motion.div
          className="text-slate-500"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {'>'} KRAS G12C inhibitor · NSCLC · Phase 2
        </motion.div>

        <motion.div
          className="h-px bg-navy-700/60"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 }}
          style={{ transformOrigin: 'left' }}
        />

        {TERMINAL_LINES.map((line, i) => (
          <motion.div
            key={line.label}
            className="flex justify-between"
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.7 + i * 0.15 }}
          >
            <span className="text-slate-400">{line.label}</span>
            <span className={`${line.color} font-medium`}>{line.value}</span>
          </motion.div>
        ))}

        <motion.div
          className="h-px bg-navy-700/60"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.4 }}
          style={{ transformOrigin: 'left' }}
        />

        {TERMINAL_LINES_2.map((line, i) => (
          <motion.div
            key={line.label}
            className="flex justify-between"
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: 1.6 + i * 0.15 }}
          >
            <span className="text-slate-400">{line.label}</span>
            <span className={`${line.color} font-medium`}>{line.value}</span>
          </motion.div>
        ))}

        <motion.div
          className="h-px bg-navy-700/60"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.4, delay: 2.0 }}
          style={{ transformOrigin: 'left' }}
        />

        <motion.div
          className="text-slate-500 text-xs"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.2 }}
        >
          Generated in 4.2s · 6 data sources · High confidence
          <span className="terminal-cursor ml-1">▊</span>
        </motion.div>
      </div>
    </div>
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-glow-teal opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div>
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-mono text-teal-400 tracking-wide">
              Built on 10,000+ biopharma transactions
            </span>
          </motion.div>

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
            className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed mb-10"
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
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#demo" className="btn btn-secondary text-base px-8 py-3.5">
              Try the live demo
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
          <TerminalPreview />
        </motion.div>
      </div>
    </section>
  );
}
