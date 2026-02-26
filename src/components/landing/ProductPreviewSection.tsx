'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { BarChart3, Network, Users, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  REVENUE_BARS,
  GEO_ROWS,
  PARTNER_DATA,
  PARTNER_PREVIEW_DATA,
  REGULATORY_PREVIEW,
} from '@/components/landing/data';
import { fadeUp } from '@/components/landing/animations';

// ────────────────────────────────────────────────────────────
// WINDOW CHROME (reusable)
// ────────────────────────────────────────────────────────────

function WindowChrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-navy-700/60 bg-navy-900/60">
      <span className="w-2 h-2 rounded-full bg-red-400/60" />
      <span className="w-2 h-2 rounded-full bg-amber-400/60" />
      <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
      <span className="ml-2 text-2xs font-mono text-slate-600">terrain — {title}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PARTNER BARS PREVIEW (animated)
// ────────────────────────────────────────────────────────────

function PartnerBarsPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref}>
      <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Top Partner Matches</div>
      <div className="space-y-2">
        {PARTNER_DATA.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3">
            <span className="text-xs text-white font-medium w-24">{p.name}</span>
            <div className="flex-1 h-1.5 bg-navy-700/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-teal-500/60 rounded-full"
                initial={{ width: 0 }}
                animate={inView ? { width: `${p.score}%` } : { width: 0 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="font-mono text-2xs text-teal-400 w-8">{p.score}</span>
            <span className="text-[9px] text-slate-500 hidden sm:inline">{p.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ANIMATED DASHBOARD PREVIEW
// ────────────────────────────────────────────────────────────

function AnimatedDashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className="card noise p-0 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-navy-700/60 bg-navy-900/60">
        <span className="w-2 h-2 rounded-full bg-red-400/60" />
        <span className="w-2 h-2 rounded-full bg-amber-400/60" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
        <span className="ml-2 text-2xs font-mono text-slate-600">terrain — dashboard</span>
      </div>
      <div className="p-5">
        {/* Top metrics row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'US TAM', val: '$24.8B', trend: '+12.3%', up: true },
            { label: 'US SAM', val: '$8.2B', trend: '+8.1%', up: true },
            { label: 'Peak Revenue', val: '$1.4B', trend: 'Base case', up: false },
            { label: 'Competitors', val: '14', trend: 'Crowding: 7/10', up: false },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="bg-navy-800/60 rounded-lg p-3 border border-navy-700/40"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="font-mono text-sm text-white font-medium">{m.val}</div>
              <div className={`text-[9px] font-mono mt-0.5 ${m.up ? 'text-emerald-400' : 'text-slate-500'}`}>
                {m.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue projection bars — animated */}
        <div className="mb-5">
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">10-Year Revenue Projection ($M)</div>
          <div className="flex items-end gap-1 h-24">
            {REVENUE_BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <motion.div
                  className="w-full rounded-sm bg-gradient-to-t from-teal-500/40 to-teal-400/60"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(h / 140) * 100}%` } : { height: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="text-[7px] font-mono text-slate-700">{2027 + i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geography breakdown — animated bars */}
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Geography Breakdown</div>
          <div className="space-y-1">
            {GEO_ROWS.map((row, i) => (
              <div key={row.geo} className="flex items-center gap-3 text-2xs">
                <span className="text-slate-400 w-20 shrink-0">{row.geo}</span>
                <div className="flex-1 h-1.5 bg-navy-700/60 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-teal-500/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${row.w}%` } : { width: 0 }}
                    transition={{ duration: 0.7, delay: 0.8 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="font-mono text-slate-300 w-12 text-right">{row.tam}</span>
                <span className="font-mono text-slate-600 w-8 text-right">{row.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// COMPETITIVE LANDSCAPE PREVIEW
// ────────────────────────────────────────────────────────────

function CompetitiveLandscapePreview() {
  return (
    <div className="card noise p-0 overflow-hidden">
      <WindowChrome title="competitive landscape" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-white font-medium">KRAS G12C · NSCLC Pipeline</div>
            <div className="text-2xs text-slate-500">14 assets across 4 phases</div>
          </div>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
            Crowding: 7/10
          </span>
        </div>

        <div className="border border-navy-700/40 rounded-lg overflow-hidden mb-5">
          <div className="grid grid-cols-[1fr_80px_60px_70px] text-[9px] font-mono uppercase tracking-wider text-slate-600 bg-navy-800/40 px-3 py-2 border-b border-navy-700/40">
            <span>Company / Asset</span>
            <span>Phase</span>
            <span>MoA</span>
            <span className="text-right">Deal</span>
          </div>
          {[
            {
              company: 'Amgen',
              asset: 'Sotorasib',
              phase: 'Approved',
              moa: 'Covalent',
              deal: '$3.7B',
              color: 'text-emerald-400',
            },
            {
              company: 'Mirati (BMS)',
              asset: 'Adagrasib',
              phase: 'Approved',
              moa: 'Covalent',
              deal: '$5.8B',
              color: 'text-emerald-400',
            },
            {
              company: 'Revolution Med',
              asset: 'RMC-6236',
              phase: 'Phase 2',
              moa: 'Multi-RAS',
              deal: '—',
              color: 'text-teal-400',
            },
            {
              company: 'Eli Lilly',
              asset: 'LY3537982',
              phase: 'Phase 3',
              moa: 'Tri-complex',
              deal: '—',
              color: 'text-amber-400',
            },
            {
              company: 'Novartis',
              asset: 'JDQ443',
              phase: 'Phase 2',
              moa: 'Covalent',
              deal: '—',
              color: 'text-teal-400',
            },
            {
              company: 'Roche',
              asset: 'Divarasib',
              phase: 'Phase 3',
              moa: 'Covalent',
              deal: '—',
              color: 'text-amber-400',
            },
          ].map((row) => (
            <div
              key={row.asset}
              className="grid grid-cols-[1fr_80px_60px_70px] px-3 py-2 border-b border-navy-700/30 last:border-0 text-2xs"
            >
              <div>
                <span className="text-white">{row.company}</span>
                <span className="text-slate-500 ml-1">· {row.asset}</span>
              </div>
              <span className={`font-mono ${row.color}`}>{row.phase}</span>
              <span className="text-slate-400 font-mono">{row.moa}</span>
              <span className="text-right font-mono text-slate-300">{row.deal}</span>
            </div>
          ))}
        </div>

        <PartnerBarsPreview />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PARTNER DISCOVERY PREVIEW
// ────────────────────────────────────────────────────────────

function PartnerDiscoveryPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="card noise p-0 overflow-hidden">
      <WindowChrome title="partner discovery" />
      <div className="p-5">
        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Partners Screened', val: '312', sub: 'Active BD groups' },
            { label: 'Top Match', val: '92/100', sub: 'Merck' },
            { label: 'Avg Score', val: '78', sub: 'Above threshold' },
            { label: 'Median Upfront', val: '$200M', sub: 'Comparable deals' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="bg-navy-800/60 rounded-lg p-3 border border-navy-700/40"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">{m.label}</div>
              <div className="font-mono text-sm text-white font-medium">{m.val}</div>
              <div className="text-[9px] font-mono mt-0.5 text-slate-500">{m.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Partner cards */}
        <div className="space-y-3">
          {PARTNER_PREVIEW_DATA.map((p, pi) => (
            <motion.div
              key={p.company}
              className="bg-navy-800/40 rounded-lg p-4 border border-navy-700/40"
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + pi * 0.12 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xs font-mono text-teal-400 font-medium">
                    {p.rank}
                  </span>
                  <span className="text-sm text-white font-medium">{p.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-navy-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-teal-500/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${p.matchScore}%` } : { width: 0 }}
                      transition={{ duration: 0.7, delay: 0.5 + pi * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="font-mono text-xs text-teal-400 font-medium">{p.matchScore}</span>
                </div>
              </div>

              {/* Score breakdown — 6 tiny bars */}
              <div className="grid grid-cols-6 gap-2 mb-3">
                {p.scores.map((s, si) => (
                  <div key={s.label}>
                    <div className="text-[7px] text-slate-600 uppercase tracking-wider mb-1 truncate">{s.label}</div>
                    <div className="h-1 bg-navy-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-500/40 rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${s.value}%` } : { width: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + pi * 0.12 + si * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Deal + terms */}
              <div className="flex items-center gap-3 text-[9px]">
                <span className="text-slate-500">Recent:</span>
                <span className="text-slate-300 font-mono">{p.deal}</span>
              </div>
              <div className="text-[8px] text-slate-600 font-mono mt-1">{p.terms}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// REGULATORY PREVIEW
// ────────────────────────────────────────────────────────────

function RegulatoryPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="card noise p-0 overflow-hidden">
      <WindowChrome title="regulatory intelligence" />
      <div className="p-5">
        {/* Pathway card */}
        <motion.div
          className="bg-navy-800/60 rounded-lg p-4 border border-navy-700/40 mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-white font-medium">{REGULATORY_PREVIEW.pathway}</span>
          </div>
          <div className="text-2xs text-slate-500 ml-7">{REGULATORY_PREVIEW.division}</div>
        </motion.div>

        {/* Timeline bars */}
        <div className="mb-5">
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-3">Timeline to Approval</div>
          <div className="space-y-2">
            {REGULATORY_PREVIEW.timelines.map((t, i) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className="text-2xs text-slate-400 w-20">{t.label}</span>
                <div className="flex-1 h-2 bg-navy-700/60 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${t.color}`}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${t.pct}%` } : { width: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="font-mono text-2xs text-slate-300 w-12 text-right">{t.months} mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Designation badges */}
        <div className="mb-5">
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Designation Eligibility</div>
          <div className="flex flex-wrap gap-2">
            {REGULATORY_PREVIEW.designations.map((d) => (
              <span key={d.name} className={`text-[9px] font-mono px-2 py-1 rounded border ${d.bg} ${d.color}`}>
                {d.name} · {d.status}
              </span>
            ))}
          </div>
        </div>

        {/* Risk cards */}
        <div className="mb-5">
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Key Risks</div>
          <div className="grid grid-cols-3 gap-2">
            {REGULATORY_PREVIEW.risks.map((r) => (
              <div key={r.title} className={`bg-navy-800/40 rounded-lg p-3 border-l-2 ${r.color}`}>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${r.badge}`}>{r.severity}</span>
                <div className="text-2xs text-white mt-1.5">{r.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparables mini-table */}
        <div>
          <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-2">Comparable Approvals</div>
          <div className="border border-navy-700/40 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_50px_90px] text-[8px] font-mono uppercase tracking-wider text-slate-600 bg-navy-800/40 px-3 py-1.5 border-b border-navy-700/40">
              <span>Drug</span>
              <span>Company</span>
              <span className="text-right">Time</span>
              <span className="text-right">Pathway</span>
            </div>
            {REGULATORY_PREVIEW.comparables.map((c) => (
              <div
                key={c.drug}
                className="grid grid-cols-[1fr_80px_50px_90px] px-3 py-2 border-b border-navy-700/30 last:border-0 text-2xs"
              >
                <span className="text-white">{c.drug}</span>
                <span className="text-slate-400">{c.company}</span>
                <span className="text-right font-mono text-slate-300">{c.months}mo</span>
                <span className={`text-right font-mono ${c.pathColor}`}>{c.pathway}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MODULE SHOWCASE (tabbed)
// ────────────────────────────────────────────────────────────

function ModuleShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Market Sizing', icon: BarChart3 },
    { label: 'Competitive', icon: Network },
    { label: 'Partners', icon: Users },
    { label: 'Regulatory', icon: Shield },
  ];

  return (
    <div>
      <div className="flex border-b border-navy-700/60 mb-6 overflow-x-auto">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                i === activeTab ? 'text-teal-400 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 0 && <AnimatedDashboardPreview />}
          {activeTab === 1 && <CompetitiveLandscapePreview />}
          {activeTab === 2 && <PartnerDiscoveryPreview />}
          {activeTab === 3 && <RegulatoryPreview />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PRODUCT PREVIEW SECTION
// ────────────────────────────────────────────────────────────

export function ProductPreviewSection() {
  return (
    <motion.section
      className="py-24 px-6 border-t border-navy-700/60"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      variants={fadeUp}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">See It In Action</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Institutional-grade intelligence, delivered instantly.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every analysis produces a comprehensive report with sourced data, exportable charts, and presentation-ready
            formatting.
          </p>
        </div>

        <ModuleShowcase />

        <div className="text-center mt-8">
          <Link href="/signup" className="btn btn-primary text-sm px-8 py-3 inline-flex items-center gap-2">
            Analyze your indication
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
