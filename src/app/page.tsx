'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  BarChart3,
  Network,
  Users,
  Shield,
  ArrowRight,
  Check,
  Globe,
  Zap,
  FileText,
  ChevronRight,
  Database,
  TrendingUp,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────

const MODULES = [
  {
    name: 'Market Sizing',
    icon: BarChart3,
    description:
      'TAM/SAM/SOM with patient funnel, geography breakdown, and 10-year revenue projections. Pharma, diagnostics, and medical devices.',
    metric: '150+ indications',
    href: '/market-sizing',
  },
  {
    name: 'Competitive Landscape',
    icon: Network,
    description:
      'Pipeline mapping, crowding scores, and head-to-head comparisons across every development phase.',
    metric: 'Real-time pipeline',
    href: '/competitive',
  },
  {
    name: 'Partner Discovery',
    icon: Users,
    description:
      'Algorithmic matching to 300+ biopharma and medtech BD groups based on deal history and pipeline gaps.',
    metric: '300+ companies',
    href: '/partners',
  },
  {
    name: 'Regulatory Intelligence',
    icon: Shield,
    description:
      'FDA/EMA/PMDA pathway analysis, designation eligibility, device classification, and timeline benchmarking.',
    metric: 'FDA + EMA + PMDA',
    href: '/regulatory',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: 0,
    period: '',
    description: 'Explore the platform with core market intelligence.',
    cta: 'Start for free',
    href: '/signup',
    highlighted: false,
    features: [
      '3 market sizing reports / month',
      '1 competitive landscape / month',
      'Limited partner discovery',
      '3 saved reports',
      'US geography only',
    ],
  },
  {
    name: 'Pro',
    price: 99,
    period: '/mo',
    description: 'Full intelligence suite for active deal-makers.',
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlighted: true,
    features: [
      'Unlimited market sizing',
      'Unlimited competitive landscapes',
      'Full partner discovery engine',
      'Regulatory intelligence',
      'PDF & CSV export',
      'Global geography coverage',
      'Unlimited saved reports',
    ],
  },
  {
    name: 'Team',
    price: 299,
    period: '/mo',
    description: 'Shared intelligence for deal teams and BD groups.',
    cta: 'Contact us',
    href: '/signup?plan=team',
    highlighted: false,
    features: [
      'Everything in Pro',
      '5 team seats included',
      'Shared report library',
      'API access',
      'Custom alert configurations',
      'Priority support',
    ],
  },
];

const STATS = [
  { value: 150, suffix: '+', label: 'Indications' },
  { value: 300, suffix: '+', label: 'Partners Mapped' },
  { value: 50, suffix: '+', label: 'Territories' },
  { value: 30, suffix: 's', prefix: '<', label: 'Time to Insight' },
];

const TERMINAL_LINES = [
  { label: 'US TAM', value: '$24.8B', color: 'text-teal-400' },
  { label: 'US SAM', value: '$8.2B', color: 'text-teal-400' },
  { label: 'Peak Revenue (base)', value: '$1.4B', color: 'text-white' },
  { label: '5-yr CAGR', value: '+12.3%', color: 'text-emerald-400' },
];

const TERMINAL_LINES_2 = [
  {
    label: 'Competitors',
    value: '14 assets (crowding: 7/10)',
    color: 'text-amber-400',
  },
  { label: 'Top Partner Match', value: 'Merck — 92/100', color: 'text-white' },
];

const DEMO_INDICATIONS = [
  {
    name: 'KRAS G12C · NSCLC',
    tam: '$24.8B',
    sam: '$8.2B',
    som: '$1.4B',
    cagr: '+12.3%',
    competitors: 14,
    crowding: 7,
    partner: 'Merck',
    partnerScore: 92,
  },
  {
    name: 'EGFR Exon20 · NSCLC',
    tam: '$18.6B',
    sam: '$4.1B',
    som: '$0.9B',
    cagr: '+15.8%',
    competitors: 8,
    crowding: 5,
    partner: 'AstraZeneca',
    partnerScore: 88,
  },
  {
    name: 'HER2-low · Breast',
    tam: '$31.2B',
    sam: '$12.5B',
    som: '$2.1B',
    cagr: '+9.7%',
    competitors: 11,
    crowding: 6,
    partner: 'Daiichi Sankyo',
    partnerScore: 95,
  },
];

// ────────────────────────────────────────────────────────────
// ANIMATION HELPERS
// ────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerSlow = {
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

function Section({
  children,
  className = '',
  id,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}

// ────────────────────────────────────────────────────────────
// COUNTER HOOK
// ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

// ────────────────────────────────────────────────────────────
// ANIMATED STAT
// ────────────────────────────────────────────────────────────

function AnimatedStat({
  value,
  suffix,
  prefix,
  label,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-2xl sm:text-3xl text-teal-400 font-medium">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TERMINAL PREVIEW (typing reveal)
// ────────────────────────────────────────────────────────────

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
        <span className="ml-3 text-xs font-mono text-slate-500">
          terrain — market-sizing
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-sm space-y-3">
        {/* Query line */}
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

        {/* Market metrics */}
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

        {/* Competitive metrics */}
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

        {/* Footer */}
        <motion.div
          className="text-slate-500 text-xs"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.2 }}
        >
          Generated in 4.2s · 6 data sources · High confidence
        </motion.div>
      </div>
    </div>
  );
}

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

      {/* Results */}
      <motion.div
        key={activeIdx}
        className="p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'US TAM', value: demo.tam },
            { label: 'US SAM', value: demo.sam },
            { label: 'Peak Revenue', value: demo.som },
            { label: '5-yr CAGR', value: demo.cagr },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                {m.label}
              </div>
              <div className="font-mono text-xl text-white font-medium">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div className="mb-6">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            TAM → SAM → SOM Waterfall
          </div>
          <div className="flex items-end gap-1 h-12">
            <div className="flex-1 bg-teal-500/20 rounded-sm h-full relative">
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/40 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-teal-300">
                TAM {demo.tam}
              </span>
            </div>
            <div className="flex-1 bg-teal-500/20 rounded-sm relative" style={{ height: '60%' }}>
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/30 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-teal-300">
                SAM {demo.sam}
              </span>
            </div>
            <div className="flex-1 bg-teal-500/20 rounded-sm relative" style={{ height: '25%' }}>
              <div className="absolute inset-x-0 bottom-0 bg-teal-500/60 rounded-sm" style={{ height: '100%' }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white">
                SOM {demo.som}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-navy-700/60">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Competitive Density
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-amber-400">
                {demo.competitors} assets
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-sm ${
                      i < demo.crowding ? 'bg-amber-400' : 'bg-navy-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Top Partner Match
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">
                {demo.partner}
              </span>
              <span className="badge-teal text-[10px] px-1.5 py-0.5">
                {demo.partnerScore}/100
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-navy-700/60 bg-navy-950/90 backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl text-white tracking-tight">
              Terrain
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-teal-500 tracking-widest uppercase mt-0.5">
              by Ambrosia Ventures
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#modules" className="hover:text-white transition-colors">
              Modules
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-glow-teal opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
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
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              Know the market
              <br />
              <span className="text-teal-400">before the deal.</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              80% of a $50K consulting engagement in 10 minutes. TAM analysis,
              competitive landscapes, partner matching, and regulatory pathways
              for biotech founders, BD executives, and life sciences
              consultants who can&apos;t wait 3 weeks for answers.
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
              <Link
                href="#demo"
                className="btn btn-secondary text-base px-8 py-3.5"
              >
                Try the live demo
              </Link>
            </motion.div>
          </div>

          {/* Terminal preview */}
          <motion.div
            className="mt-16 max-w-2xl lg:absolute lg:right-0 lg:top-28 lg:w-[480px] xl:w-[520px]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <TerminalPreview />
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <section className="border-y border-navy-700/60 bg-navy-900/40 noise">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ── DATA SOURCE STRIP ───────────────────────────────── */}
      <Section className="py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            { icon: Database, text: 'ClinicalTrials.gov' },
            { icon: Shield, text: 'FDA / EMA' },
            { icon: FileText, text: 'SEC EDGAR' },
            { icon: Globe, text: 'WHO GBD' },
            { icon: TrendingUp, text: '10,000+ Transactions' },
          ].map((src) => {
            const Icon = src.icon;
            return (
              <div
                key={src.text}
                className="flex items-center gap-2 text-slate-500 text-xs"
              >
                <Icon className="w-3.5 h-3.5 text-slate-600" />
                <span>{src.text}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── MODULES ─────────────────────────────────────────── */}
      <Section id="modules" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              Intelligence Modules
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Four modules. One platform.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every module answers the questions that precede licensing
              deals, M&A transactions, and partnership discussions.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.name}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="card noise p-6 group hover:border-teal-500/30 hover:shadow-card-hover transition-all relative cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 group-hover:border-teal-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="font-display text-lg text-white mb-2">
                    {mod.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {mod.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-teal-500">
                      {mod.metric}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ── LIVE DEMO ───────────────────────────────────────── */}
      <Section id="demo" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
                Try It Now
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
                See what Terrain delivers.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Click through three real indications and see instant TAM/SAM/SOM
                analysis, competitive crowding scores, and partner match rankings
                — the same output you&apos;ll get on day one.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Patient-funnel-driven market sizing',
                  'Waterfall TAM → SAM → SOM visualization',
                  'Competitive density with crowding score',
                  'Algorithmic partner matching with score breakdown',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-slate-300"
                  >
                    <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="btn btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2"
              >
                Run your own analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — interactive demo */}
            <LiveDemo />
          </div>
        </div>
      </Section>

      {/* ── VALUE PROPS ─────────────────────────────────────── */}
      <Section className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-12"
            variants={staggerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                icon: Zap,
                title: 'Seconds, not weeks',
                body: 'What takes a junior analyst two days of desk research, Terrain delivers in under 10 minutes — with sourcing and methodology credible enough for a board presentation or client deliverable.',
              },
              {
                icon: Globe,
                title: 'Global coverage',
                body: 'US, EU5, Japan, China, and Rest of World — with territory-specific pricing multipliers, regulatory pathways, and reimbursement dynamics.',
              },
              {
                icon: FileText,
                title: 'Deal-ready output',
                body: 'Export to PDF or CSV with institutional-grade formatting. Every number has a source. Every chart is presentation-ready.',
              },
            ].map((prop) => {
              const Icon = prop.icon;
              return (
                <motion.div
                  key={prop.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="font-display text-xl text-white mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {prop.body}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <Section id="pricing" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              Pricing
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Intelligence at every scale
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Start free. Upgrade when Terrain becomes indispensable.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`card noise p-6 relative flex flex-col ${
                  plan.highlighted
                    ? 'border-teal-500/40 ring-1 ring-teal-500/20 shadow-teal-sm'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-teal text-[10px] px-3 py-1">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-4xl text-white font-medium">
                      ${plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-slate-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`btn w-full text-center text-sm py-2.5 ${
                    plan.highlighted
                      ? 'btn-primary shadow-teal-sm hover:shadow-teal-md transition-shadow'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <Section className="py-24 px-6 border-t border-navy-700/60 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-teal opacity-40 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Your next deal starts with better data.
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Biotech founders preparing for board meetings. BD executives
            building term sheets. Consultants delivering client analyses.
            They all start with Terrain.
          </p>
          <Link
            href="/signup"
            className="btn btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2 shadow-teal-sm hover:shadow-teal-md transition-shadow"
          >
            Get started — it&apos;s free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-navy-700/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-display text-lg text-white">Terrain</span>
            <p className="text-xs text-slate-500 mt-1">
              Built by{' '}
              <a
                href="https://ambrosiaventures.co"
                className="text-teal-500 hover:text-teal-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ambrosia Ventures
              </a>{' '}
              — boutique life sciences M&A and strategy advisory.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hover:text-white transition-colors"
            >
              Sign up
            </Link>
            <a
              href="https://ambrosiaventures.co"
              className="hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ambrosia Ventures
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-navy-700/40 text-center">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Ambrosia Ventures LLC. All rights
            reserved. Confidential.
          </p>
        </div>
      </footer>
    </div>
  );
}
