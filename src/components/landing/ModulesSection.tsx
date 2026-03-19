'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { MODULES } from './data';
import { fadeUp, stagger } from './animations';
import { Section } from './Section';

const MODULE_COLORS = [
  'border-l-blue-500/30',
  'border-l-amber-500/30',
  'border-l-emerald-500/30',
  'border-l-purple-500/30',
];

const MODULE_METRICS = [
  '236 indications \u00b7 30-second insights',
  'Live pipeline data \u00b7 Updated nightly',
  '300+ companies \u00b7 AI-scored matches',
  'FDA + EMA + PMDA \u00b7 Pathway recommended',
];

function MarketSizingSvg() {
  return (
    <svg width="100%" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-3">
      <rect x="10" y="8" width="160" height="12" rx="2" fill="url(#tam-grad)" opacity="0.6" />
      <rect x="10" y="26" width="110" height="12" rx="2" fill="url(#tam-grad)" opacity="0.45" />
      <rect x="10" y="44" width="50" height="12" rx="2" fill="url(#tam-grad)" opacity="0.7" />
      <text x="175" y="17" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        TAM
      </text>
      <text x="125" y="35" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        SAM
      </text>
      <text x="65" y="53" fill="#94a3b8" fontSize="8" fontFamily="monospace">
        SOM
      </text>
      <defs>
        <linearGradient id="tam-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00c9a7" />
          <stop offset="100%" stopColor="#00e4bf" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CompetitiveSvg() {
  return (
    <svg width="100%" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-3">
      <circle cx="50" cy="18" r="8" fill="#fbbf24" opacity="0.5" />
      <circle cx="130" cy="14" r="6" fill="#fbbf24" opacity="0.35" />
      <circle cx="80" cy="42" r="10" fill="#fbbf24" opacity="0.6" />
      <circle cx="150" cy="40" r="5" fill="#fbbf24" opacity="0.3" />
      <line x1="10" y1="55" x2="190" y2="55" stroke="#1e293b" strokeWidth="0.5" />
      <line x1="10" y1="0" x2="10" y2="55" stroke="#1e293b" strokeWidth="0.5" />
    </svg>
  );
}

function PartnerSvg() {
  return (
    <svg width="100%" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-3">
      <rect x="10" y="6" width="140" height="10" rx="2" fill="#34d399" opacity="0.5" />
      <rect x="10" y="24" width="110" height="10" rx="2" fill="#34d399" opacity="0.4" />
      <rect x="10" y="42" width="80" height="10" rx="2" fill="#34d399" opacity="0.3" />
      <text x="155" y="14" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        92
      </text>
      <text x="125" y="32" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        88
      </text>
      <text x="95" y="50" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        85
      </text>
    </svg>
  );
}

function RegulatorySvg() {
  return (
    <svg width="100%" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-3">
      <line x1="40" y1="30" x2="100" y2="30" stroke="#a78bfa" strokeWidth="2" opacity="0.4" />
      <line x1="100" y1="30" x2="160" y2="30" stroke="#a78bfa" strokeWidth="2" opacity="0.4" />
      <circle cx="40" cy="30" r="7" fill="#a78bfa" opacity="0.5" />
      <circle cx="100" cy="30" r="7" fill="#a78bfa" opacity="0.6" />
      <circle cx="160" cy="30" r="7" fill="#a78bfa" opacity="0.7" />
      <text x="27" y="50" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        IND
      </text>
      <text x="87" y="50" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        NDA
      </text>
      <text x="144" y="50" fill="#94a3b8" fontSize="7" fontFamily="monospace">
        Approval
      </text>
    </svg>
  );
}

const MODULE_SVGS = [MarketSizingSvg, CompetitiveSvg, PartnerSvg, RegulatorySvg];

export function ModulesSection() {
  return (
    <Section id="modules" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="label text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Intelligence Modules</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-medium mb-4">Four modules. One platform.</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Every module answers the questions that precede licensing deals, M&A transactions, and partnership
            discussions.
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            const SvgPreview = MODULE_SVGS[idx];
            return (
              <motion.div
                key={mod.name}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`card module-card noise p-6 group hover:border-teal-500/30 hover:shadow-card-hover transition-all relative cursor-pointer border-l-2 ${MODULE_COLORS[idx]} border-navy-700/60`}
              >
                <div className="module-icon w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 group-hover:border-teal-500/20 transition-all">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-display text-lg text-white font-medium mb-2">{mod.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{mod.description}</p>
                <SvgPreview />
                <div className="flex items-center justify-between mt-4">
                  <span className="font-mono text-xs text-teal-500">{MODULE_METRICS[idx]}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
