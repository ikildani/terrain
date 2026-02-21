import Link from 'next/link';
import {
  BarChart3,
  Network,
  FlaskConical,
  Users,
  Shield,
  Bell,
  ArrowRight,
  Check,
  Globe,
  Zap,
  FileText,
  ChevronRight,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────

const MODULES = [
  {
    name: 'Market Sizing',
    icon: BarChart3,
    description:
      'TAM/SAM/SOM with patient funnel, geography breakdown, and 10-year revenue projections.',
    metric: '150+ indications',
    href: '/market-sizing',
  },
  {
    name: 'Competitive Landscape',
    icon: Network,
    description:
      'Pipeline mapping, crowding scores, and head-to-head comparisons across every phase.',
    metric: 'Real-time pipeline',
    href: '/competitive',
  },
  {
    name: 'Pipeline Intelligence',
    icon: FlaskConical,
    description:
      'Live ClinicalTrials.gov integration with filterable search by indication, phase, and sponsor.',
    metric: 'Live CT.gov data',
    href: '/pipeline',
  },
  {
    name: 'Partner Discovery',
    icon: Users,
    description:
      'Algorithmic matching to 300+ biopharma BD groups based on deal history and pipeline gaps.',
    metric: '300+ companies',
    href: '/partners',
    pro: true,
  },
  {
    name: 'Regulatory Intelligence',
    icon: Shield,
    description:
      'FDA/EMA pathway analysis, designation eligibility, and timeline benchmarking.',
    metric: 'FDA + EMA + PMDA',
    href: '/regulatory',
    pro: true,
  },
  {
    name: 'Deal Alerts',
    icon: Bell,
    description:
      'Automated monitoring of competitor filings, partner deals, and FDA actions in your space.',
    metric: 'Real-time alerts',
    href: '/alerts',
    pro: true,
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Explore the platform with core market intelligence.',
    cta: 'Start for free',
    href: '/signup',
    highlighted: false,
    features: [
      '3 market sizing reports / month',
      '1 competitive landscape / month',
      '5 pipeline searches / month',
      '3 saved reports',
      'US geography only',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    description: 'Full intelligence suite for active deal-makers.',
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlighted: true,
    features: [
      'Unlimited market sizing',
      'Unlimited competitive landscapes',
      'Unlimited pipeline searches',
      'Partner discovery engine',
      'Regulatory intelligence',
      'Deal alerts (10 active)',
      'PDF & CSV export',
      'Global geography coverage',
      'Unlimited saved reports',
    ],
  },
  {
    name: 'Team',
    price: '$499',
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
  { value: '150+', label: 'Indications' },
  { value: '300+', label: 'Partners Mapped' },
  { value: '50+', label: 'Territories' },
  { value: '<30s', label: 'Time to Insight' },
];

// ────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-navy-700/60 bg-navy-950/80 backdrop-blur-xl">
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
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,201,167,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,201,167,0.3) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-mono text-teal-400 tracking-wide">
                Built on 10,000+ biopharma transactions
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] mb-6">
              Know the market
              <br />
              <span className="text-teal-400">before the deal.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
              TAM analysis, competitive landscapes, partner matching, and
              regulatory pathways — in 90 seconds, not 3 weeks. Institutional-grade
              intelligence for life sciences deal-makers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="btn btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#modules"
                className="btn btn-secondary text-base px-8 py-3.5"
              >
                See the modules
              </Link>
            </div>
          </div>

          {/* Terminal preview */}
          <div className="mt-16 max-w-2xl lg:absolute lg:right-0 lg:top-32 lg:w-[480px] xl:w-[520px]">
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 text-xs font-mono text-slate-500">
                  terrain — market-sizing
                </span>
              </div>
              <div className="p-5 font-mono text-sm space-y-3">
                <div className="text-slate-500">
                  {'>'}  KRAS G12C inhibitor · NSCLC · Phase 2
                </div>
                <div className="h-px bg-navy-700/60" />
                <div className="flex justify-between">
                  <span className="text-slate-400">US TAM</span>
                  <span className="text-teal-400 font-medium">$24.8B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">US SAM</span>
                  <span className="text-teal-400 font-medium">$8.2B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Revenue (base)</span>
                  <span className="text-white font-medium">$1.4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">5-yr CAGR</span>
                  <span className="text-emerald-400 font-medium">+12.3%</span>
                </div>
                <div className="h-px bg-navy-700/60" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Competitors</span>
                  <span className="text-amber-400 font-medium">
                    14 assets (crowding: 7/10)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top Partner Match</span>
                  <span className="text-white font-medium">
                    Merck — 92/100
                  </span>
                </div>
                <div className="h-px bg-navy-700/60" />
                <div className="text-slate-500 text-xs">
                  Generated in 4.2s · 6 data sources · High confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <section className="border-y border-navy-700/60 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-2xl sm:text-3xl text-teal-400 font-medium">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DATA SOURCE STRIP ───────────────────────────────── */}
      <section className="py-10 px-6">
        <p className="text-center text-sm text-slate-500 max-w-3xl mx-auto">
          Built on data from ClinicalTrials.gov, FDA, SEC EDGAR filings, WHO
          Global Burden of Disease, and 10,000+ biopharma transactions curated
          by Ambrosia Ventures.
        </p>
      </section>

      {/* ── MODULES ─────────────────────────────────────────── */}
      <section id="modules" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">
              Intelligence Modules
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
              Six modules. One platform.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every module is designed to answer the questions that precede
              $50M+ licensing deals, M&A transactions, and partnership
              discussions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.name}
                  className="card p-6 group hover:border-teal-500/30 transition-colors relative"
                >
                  {mod.pro && (
                    <span className="badge-pro text-[9px] px-1.5 py-0.5 absolute top-4 right-4">
                      PRO
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
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
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-display text-xl text-white mb-3">
                Seconds, not weeks
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                What takes a junior analyst three weeks of desk research,
                Terrain delivers in under 90 seconds — with sourcing and
                methodology you can defend in a board meeting.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-display text-xl text-white mb-3">
                Global coverage
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                US, EU5, Japan, China, and Rest of World — with
                territory-specific pricing multipliers, regulatory pathways, and
                reimbursement dynamics.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-display text-xl text-white mb-3">
                Deal-ready output
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Export to PDF or CSV with institutional-grade formatting.
                Every number has a source. Every chart is presentation-ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 border-t border-navy-700/60">
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

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 relative flex flex-col ${
                  plan.highlighted
                    ? 'border-teal-500/40 ring-1 ring-teal-500/20'
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
                      {plan.price}
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
                    plan.highlighted ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-navy-700/60">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Your next deal starts with better data.
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto">
            Join biotech founders and BD executives who use Terrain to prepare
            for every meeting, every diligence call, and every board
            presentation.
          </p>
          <Link
            href="/signup"
            className="btn btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2"
          >
            Get started — it&apos;s free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

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
            <Link
              href="/login"
              className="hover:text-white transition-colors"
            >
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
