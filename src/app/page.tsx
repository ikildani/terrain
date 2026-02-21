'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
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
  Clock,
  DollarSign,
  Target,
  LineChart,
  ChevronDown,
  Building2,
  Briefcase,
  PieChart,
  Menu,
  X,
  Bell,
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
  {
    name: 'Pipeline Intelligence',
    icon: LineChart,
    description:
      'Search ClinicalTrials.gov in real time. Filter by phase, mechanism, company, and geography. Export deal-ready pipeline tables.',
    metric: 'Live ClinicalTrials.gov',
    href: '/pipeline',
  },
  {
    name: 'Deal Alerts',
    icon: Bell,
    description:
      'Monitor competitor filings, partner deal activity, FDA actions, and market shifts. Daily digest or near-real-time for Team plan.',
    metric: 'Pro + Team',
    href: '/alerts',
  },
];

const PERSONAS = [
  {
    icon: Building2,
    title: 'Biotech Founders & CEOs',
    subtitle: 'Series A–C',
    pain: 'You need market intelligence for every board meeting, every investor conversation, every partnership discussion — but you can\u2019t justify a $50K consulting engagement for each one.',
    solve: 'Terrain gives you investor-grade market sizing in 10 minutes. Walk into your next board meeting with TAM/SAM/SOM, competitive landscapes, and partner rankings that hold up to scrutiny.',
  },
  {
    icon: Briefcase,
    title: 'BD & Licensing Executives',
    subtitle: 'Pharma & Biotech',
    pain: 'Your team evaluates dozens of opportunities per quarter. Each one needs a market assessment before you can build a term sheet — and your analysts are always bottlenecked.',
    solve: 'Run unlimited analyses across indications, geographies, and modalities. Export deal-ready PDFs that your licensing committee will take seriously.',
  },
  {
    icon: PieChart,
    title: 'Life Sciences Investors',
    subtitle: 'VC, Crossover & PE',
    pain: 'Due diligence requires rapid market validation across your pipeline of opportunities. You need to quickly separate the $5B markets from the $500M niches.',
    solve: 'Validate market opportunities in minutes, not weeks. Compare competitive density across indications, benchmark deal terms, and export analyses for your investment memos.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Choose your indication',
    description: 'Select from 150+ indications across oncology, neurology, immunology, rare disease, and more. Specify subtype, geography, and development stage.',
  },
  {
    number: '02',
    title: 'Generate your report',
    description: 'Terrain runs patient-funnel-driven market sizing, maps the competitive landscape, scores partner matches, and analyzes regulatory pathways — in under 30 seconds.',
  },
  {
    number: '03',
    title: 'Export & act',
    description: 'Download institutional-grade PDFs and CSVs. Every number is sourced. Every chart is presentation-ready for board decks, investor memos, and client deliverables.',
  },
];

const BEFORE_AFTER = [
  { label: 'Time to market assessment', before: '2–3 weeks', after: '< 30 seconds' },
  { label: 'Cost per analysis', before: '$15K–$50K', after: '$149/mo unlimited' },
  { label: 'Geography coverage', before: 'US-only (usually)', after: 'US, EU5, Japan, China, RoW' },
  { label: 'Competitive pipeline data', before: 'Stale (quarterly updates)', after: 'Real-time (ClinicalTrials.gov)' },
  { label: 'Partner matching', before: 'Relationship-driven guesswork', after: 'Algorithmic scoring (300+ companies)' },
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
    price: 149,
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
    price: 499,
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

const FAQ = [
  {
    q: 'Where does Terrain\u2019s data come from?',
    a: 'Terrain pulls from ClinicalTrials.gov (live pipeline data), FDA/EMA approval databases, SEC EDGAR filings (partnership disclosures), WHO Global Burden of Disease (epidemiology), and a proprietary database of 10,000+ biopharma transactions built by Ambrosia Ventures.',
  },
  {
    q: 'How current is the pipeline and competitive data?',
    a: 'Pipeline data from ClinicalTrials.gov updates nightly. FDA actions and SEC filings are processed within 24 hours. Epidemiology and pricing benchmarks are updated quarterly against the latest published sources.',
  },
  {
    q: 'Can I trust the market sizing numbers for a board presentation?',
    a: 'Yes. Every output includes a methodology section explaining the calculation approach and a data sources footer with specific citations. The patient-funnel methodology (prevalence \u2192 diagnosed \u2192 treated \u2192 addressable \u2192 capturable) follows the same framework used by top-tier equity research analysts.',
  },
  {
    q: 'Does Terrain cover medical devices and diagnostics, or just pharma?',
    a: 'All three. Select your product category (pharmaceutical, IVD, CDx, implantable device, surgical device, SaMD, etc.) and Terrain adjusts the sizing methodology, regulatory pathways, reimbursement framework, and partner database accordingly.',
  },
  {
    q: 'What\u2019s the difference between Pro and Team?',
    a: 'Pro is for individual professionals — unlimited analyses, full module access, and export capabilities. Team adds 5 seats, a shared report library, API access, and custom alert configurations for BD groups and deal teams working collaboratively.',
  },
  {
    q: 'Is my data secure?',
    a: 'Terrain runs on Supabase (PostgreSQL) with row-level security, encrypted at rest and in transit. Your analyses and saved reports are only visible to your account (or your team on the Team plan). We never share or sell user data.',
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
  { label: 'Competitors', value: '14 assets (crowding: 7/10)', color: 'text-amber-400' },
  { label: 'Top Partner Match', value: 'Merck \u2014 92/100', color: 'text-white' },
];

const DEMO_INDICATIONS = [
  {
    name: 'KRAS G12C \u00b7 NSCLC',
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
    name: 'EGFR Exon20 \u00b7 NSCLC',
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
    name: 'HER2-low \u00b7 Breast',
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

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerSlow = {
  visible: { transition: { staggerChildren: 0.15 } },
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
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
// TERMINAL PREVIEW
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
// FAQ ITEM
// ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-navy-700/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm text-white font-medium pr-4 group-hover:text-teal-400 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="text-sm text-slate-400 leading-relaxed pb-5">
          {a}
        </p>
      </motion.div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/signup" className="hidden sm:inline btn btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-navy-700/60 bg-navy-950/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
                {[
                  { href: '#modules', label: 'Modules' },
                  { href: '#demo', label: 'Demo' },
                  { href: '#pricing', label: 'Pricing' },
                  { href: '#faq', label: 'FAQ' },
                ].map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.2 }}
                    className="text-sm text-slate-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="border-t border-navy-700/40 pt-4 mt-2 flex flex-col gap-3"
                >
                  <Link
                    href="/login"
                    className="text-sm text-slate-300 hover:text-white transition-colors py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="btn btn-primary text-sm py-2.5 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
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
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
              80% of a $50K consulting engagement in 10 minutes. TAM analysis,
              competitive landscapes, partner matching, and regulatory pathways
              for biotech professionals who can&apos;t wait 3 weeks for answers.
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

          {/* Terminal preview — larger on desktop */}
          <motion.div
            className="w-full max-w-xl lg:max-w-none"
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
              <div key={src.text} className="flex items-center gap-2 text-slate-500 text-xs">
                <Icon className="w-3.5 h-3.5 text-slate-600" />
                <span>{src.text}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────── */}
      <Section id="personas" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              Built For
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Intelligence for every seat at the table.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Whether you&apos;re building the company, doing the deal, or writing the check
              — Terrain gives you the market context to move with conviction.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="card noise p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{p.title}</h3>
                      <p className="text-xs text-slate-500">{p.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 italic">
                    &ldquo;{p.pain}&rdquo;
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {p.solve}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ── SOCIAL PROOF ────────────────────────────────────── */}
      <section className="py-10 px-6 border-t border-navy-700/40">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-6">
            Trusted by life sciences professionals at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40">
            {['Series A Biotech', 'BD Teams', 'Life Sciences VC', 'CRO Partners'].map((name) => (
              <span key={name} className="text-sm font-mono text-slate-400">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ─────────────────────────────────────────── */}
      <Section id="modules" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              Intelligence Modules
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Six modules. One platform.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every module answers the questions that precede licensing
              deals, M&A transactions, and partnership discussions.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
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

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <Section className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              From question to answer in three steps.
            </h2>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={staggerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-px border-t border-dashed border-navy-700/80" />
                )}
                <div className="font-mono text-3xl text-teal-500/30 font-medium mb-3">
                  {step.number}
                </div>
                <h3 className="font-display text-lg text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── LIVE DEMO ───────────────────────────────────────── */}
      <Section id="demo" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
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

            <LiveDemo />
          </div>
        </div>
      </Section>

      {/* ── BEFORE / AFTER ────────────────────────────────────── */}
      <Section className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              The Difference
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Traditional consulting vs. Terrain
            </h2>
          </div>

          <div className="card noise p-0 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] border-b border-navy-700/60">
              <div className="px-5 py-3" />
              <div className="px-5 py-3 text-center border-l border-navy-700/60">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Before</span>
              </div>
              <div className="px-5 py-3 text-center border-l border-navy-700/60 bg-teal-500/5">
                <span className="text-xs font-mono text-teal-500 uppercase tracking-wider">Terrain</span>
              </div>
            </div>

            {/* Rows */}
            {BEFORE_AFTER.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_160px_160px] ${
                  i < BEFORE_AFTER.length - 1 ? 'border-b border-navy-700/40' : ''
                }`}
              >
                <div className="px-5 py-4 text-sm text-slate-300">{row.label}</div>
                <div className="px-5 py-4 text-center border-l border-navy-700/40 font-mono text-xs text-slate-500">
                  {row.before}
                </div>
                <div className="px-5 py-4 text-center border-l border-navy-700/40 bg-teal-500/5 font-mono text-xs text-teal-400 font-medium">
                  {row.after}
                </div>
              </div>
            ))}
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
                body: 'What takes a junior analyst two days of desk research, Terrain delivers in under 10 minutes — with sourcing and methodology credible enough for a board presentation or investment memo.',
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
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
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

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <Section id="faq" className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white">
              Common questions
            </h2>
          </div>

          <div className="border-t border-navy-700/60">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <Section className="py-24 px-6 border-t border-navy-700/60 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-glow-teal opacity-40 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Your next deal starts with better data.
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Biotech founders preparing for board meetings. BD executives
            building term sheets. Investors validating opportunities.
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
      <footer className="border-t border-navy-700/60 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="font-display text-lg text-white">Terrain</span>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Market Opportunity Intelligence for life sciences.
                Built by Ambrosia Ventures.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="/market-sizing" className="text-sm text-slate-500 hover:text-white transition-colors">Market Sizing</Link></li>
                <li><Link href="/competitive" className="text-sm text-slate-500 hover:text-white transition-colors">Competitive Landscape</Link></li>
                <li><Link href="/partners" className="text-sm text-slate-500 hover:text-white transition-colors">Partner Discovery</Link></li>
                <li><Link href="/regulatory" className="text-sm text-slate-500 hover:text-white transition-colors">Regulatory Intelligence</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://ambrosiaventures.co" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">
                    Ambrosia Ventures
                  </a>
                </li>
                <li><a href="#pricing" className="text-sm text-slate-500 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-sm text-slate-500 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors">Sign in</Link></li>
                <li><Link href="/signup" className="text-sm text-slate-500 hover:text-white transition-colors">Create account</Link></li>
                <li><Link href="/signup?plan=pro" className="text-sm text-slate-500 hover:text-white transition-colors">Start Pro trial</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-navy-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Ambrosia Ventures LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
