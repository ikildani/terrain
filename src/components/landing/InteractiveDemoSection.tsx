'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calculator, ChevronDown } from 'lucide-react';
import { Section } from './Section';

// ────────────────────────────────────────────────────────────
// STATIC DATA — pre-computed market sizing for instant results
// Uses the same methodology as calculateMarketSizing engine
// ────────────────────────────────────────────────────────────

interface DemoIndication {
  name: string;
  therapy_area: string;
  us_prevalence: number;
  us_incidence: number;
  tam_b: number;
  sam_b: number;
  som_range: [number, number];
  peak_sales_b: number;
  cagr_5yr: number;
}

const THERAPY_AREAS = [
  'Oncology',
  'Neurology',
  'Immunology',
  'Rare Disease',
  'Cardiovascular',
  'Metabolic',
  'Psychiatry',
  'Hematology',
  'Dermatology',
  'Ophthalmology',
] as const;

const STAGES = [
  { value: 'preclinical', label: 'Preclinical', share: 0.03 },
  { value: 'phase1', label: 'Phase 1', share: 0.05 },
  { value: 'phase2', label: 'Phase 2', share: 0.12 },
  { value: 'phase3', label: 'Phase 3', share: 0.2 },
  { value: 'approved', label: 'Approved', share: 0.3 },
] as const;

const DEMO_DATA: Record<string, DemoIndication[]> = {
  Oncology: [
    {
      name: 'Non-Small Cell Lung Cancer',
      therapy_area: 'oncology',
      us_prevalence: 250000,
      us_incidence: 153000,
      tam_b: 28.4,
      sam_b: 14.2,
      som_range: [1.4, 4.3],
      peak_sales_b: 2.8,
      cagr_5yr: 8.5,
    },
    {
      name: 'Breast Cancer (HER2+)',
      therapy_area: 'oncology',
      us_prevalence: 48000,
      us_incidence: 32000,
      tam_b: 9.6,
      sam_b: 4.8,
      som_range: [0.5, 1.4],
      peak_sales_b: 1.0,
      cagr_5yr: 7.2,
    },
    {
      name: 'Colorectal Cancer',
      therapy_area: 'oncology',
      us_prevalence: 165000,
      us_incidence: 106000,
      tam_b: 15.8,
      sam_b: 7.9,
      som_range: [0.8, 2.4],
      peak_sales_b: 1.6,
      cagr_5yr: 6.8,
    },
  ],
  Neurology: [
    {
      name: "Alzheimer's Disease",
      therapy_area: 'neurology',
      us_prevalence: 6500000,
      us_incidence: 500000,
      tam_b: 22.1,
      sam_b: 8.8,
      som_range: [0.9, 2.6],
      peak_sales_b: 1.8,
      cagr_5yr: 12.4,
    },
    {
      name: 'Multiple Sclerosis',
      therapy_area: 'neurology',
      us_prevalence: 1000000,
      us_incidence: 10000,
      tam_b: 28.6,
      sam_b: 11.4,
      som_range: [1.1, 3.4],
      peak_sales_b: 2.3,
      cagr_5yr: 5.2,
    },
    {
      name: "Parkinson's Disease",
      therapy_area: 'neurology',
      us_prevalence: 1200000,
      us_incidence: 90000,
      tam_b: 8.4,
      sam_b: 3.4,
      som_range: [0.3, 1.0],
      peak_sales_b: 0.7,
      cagr_5yr: 9.1,
    },
  ],
  Immunology: [
    {
      name: 'Rheumatoid Arthritis',
      therapy_area: 'immunology',
      us_prevalence: 1500000,
      us_incidence: 41000,
      tam_b: 32.4,
      sam_b: 12.9,
      som_range: [1.3, 3.9],
      peak_sales_b: 2.6,
      cagr_5yr: 4.1,
    },
    {
      name: 'Atopic Dermatitis',
      therapy_area: 'immunology',
      us_prevalence: 16500000,
      us_incidence: 2000000,
      tam_b: 14.8,
      sam_b: 5.9,
      som_range: [0.6, 1.8],
      peak_sales_b: 1.2,
      cagr_5yr: 11.3,
    },
    {
      name: 'Ulcerative Colitis',
      therapy_area: 'immunology',
      us_prevalence: 900000,
      us_incidence: 38000,
      tam_b: 9.2,
      sam_b: 3.7,
      som_range: [0.4, 1.1],
      peak_sales_b: 0.7,
      cagr_5yr: 7.8,
    },
  ],
  'Rare Disease': [
    {
      name: 'Spinal Muscular Atrophy',
      therapy_area: 'rare_disease',
      us_prevalence: 25000,
      us_incidence: 400,
      tam_b: 3.8,
      sam_b: 2.3,
      som_range: [0.5, 1.2],
      peak_sales_b: 0.8,
      cagr_5yr: 6.5,
    },
    {
      name: 'Duchenne Muscular Dystrophy',
      therapy_area: 'rare_disease',
      us_prevalence: 12000,
      us_incidence: 1500,
      tam_b: 2.4,
      sam_b: 1.4,
      som_range: [0.3, 0.7],
      peak_sales_b: 0.5,
      cagr_5yr: 14.2,
    },
    {
      name: 'Cystic Fibrosis',
      therapy_area: 'rare_disease',
      us_prevalence: 40000,
      us_incidence: 1000,
      tam_b: 7.8,
      sam_b: 4.7,
      som_range: [0.5, 1.4],
      peak_sales_b: 0.9,
      cagr_5yr: 4.8,
    },
  ],
  Cardiovascular: [
    {
      name: 'Heart Failure (HFrEF)',
      therapy_area: 'cardiovascular',
      us_prevalence: 3400000,
      us_incidence: 550000,
      tam_b: 18.6,
      sam_b: 7.4,
      som_range: [0.7, 2.2],
      peak_sales_b: 1.5,
      cagr_5yr: 5.8,
    },
    {
      name: 'Hypertrophic Cardiomyopathy',
      therapy_area: 'cardiovascular',
      us_prevalence: 650000,
      us_incidence: 50000,
      tam_b: 5.2,
      sam_b: 2.1,
      som_range: [0.2, 0.6],
      peak_sales_b: 0.4,
      cagr_5yr: 18.5,
    },
  ],
  Metabolic: [
    {
      name: 'Obesity (BMI ≥30)',
      therapy_area: 'metabolic',
      us_prevalence: 42000000,
      us_incidence: 5000000,
      tam_b: 68.4,
      sam_b: 27.4,
      som_range: [2.7, 8.2],
      peak_sales_b: 5.5,
      cagr_5yr: 24.6,
    },
    {
      name: 'MASH/NASH',
      therapy_area: 'metabolic',
      us_prevalence: 16000000,
      us_incidence: 1200000,
      tam_b: 38.2,
      sam_b: 15.3,
      som_range: [1.5, 4.6],
      peak_sales_b: 3.1,
      cagr_5yr: 15.8,
    },
  ],
  Psychiatry: [
    {
      name: 'Treatment-Resistant Depression',
      therapy_area: 'psychiatry',
      us_prevalence: 3000000,
      us_incidence: 800000,
      tam_b: 6.8,
      sam_b: 2.7,
      som_range: [0.3, 0.8],
      peak_sales_b: 0.5,
      cagr_5yr: 11.2,
    },
    {
      name: 'Schizophrenia',
      therapy_area: 'psychiatry',
      us_prevalence: 2600000,
      us_incidence: 100000,
      tam_b: 12.4,
      sam_b: 5.0,
      som_range: [0.5, 1.5],
      peak_sales_b: 1.0,
      cagr_5yr: 4.5,
    },
  ],
  Hematology: [
    {
      name: 'Multiple Myeloma',
      therapy_area: 'hematology',
      us_prevalence: 176000,
      us_incidence: 35000,
      tam_b: 24.2,
      sam_b: 9.7,
      som_range: [1.0, 2.9],
      peak_sales_b: 1.9,
      cagr_5yr: 6.2,
    },
    {
      name: 'Sickle Cell Disease',
      therapy_area: 'hematology',
      us_prevalence: 100000,
      us_incidence: 2000,
      tam_b: 4.8,
      sam_b: 2.9,
      som_range: [0.3, 0.9],
      peak_sales_b: 0.6,
      cagr_5yr: 22.4,
    },
  ],
  Dermatology: [
    {
      name: 'Psoriasis (Moderate-to-Severe)',
      therapy_area: 'dermatology',
      us_prevalence: 3300000,
      us_incidence: 200000,
      tam_b: 18.4,
      sam_b: 7.4,
      som_range: [0.7, 2.2],
      peak_sales_b: 1.5,
      cagr_5yr: 5.1,
    },
    {
      name: 'Alopecia Areata',
      therapy_area: 'dermatology',
      us_prevalence: 300000,
      us_incidence: 66000,
      tam_b: 3.2,
      sam_b: 1.3,
      som_range: [0.1, 0.4],
      peak_sales_b: 0.3,
      cagr_5yr: 28.5,
    },
  ],
  Ophthalmology: [
    {
      name: 'Wet AMD',
      therapy_area: 'ophthalmology',
      us_prevalence: 1100000,
      us_incidence: 200000,
      tam_b: 14.8,
      sam_b: 5.9,
      som_range: [0.6, 1.8],
      peak_sales_b: 1.2,
      cagr_5yr: 3.8,
    },
    {
      name: 'Geographic Atrophy',
      therapy_area: 'ophthalmology',
      us_prevalence: 1000000,
      us_incidence: 150000,
      tam_b: 6.4,
      sam_b: 2.6,
      som_range: [0.3, 0.8],
      peak_sales_b: 0.5,
      cagr_5yr: 35.0,
    },
  ],
};

function formatBillion(v: number): string {
  if (v >= 1) return `$${v.toFixed(1)}B`;
  return `$${Math.round(v * 1000)}M`;
}

function formatPatients(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return v.toString();
}

// ────────────────────────────────────────────────────────────
// INTERACTIVE DEMO CALCULATOR
// ────────────────────────────────────────────────────────────

function InteractiveCalculator() {
  const [selectedTA, setSelectedTA] = useState<string>('Oncology');
  const [selectedIndication, setSelectedIndication] = useState<string>('Non-Small Cell Lung Cancer');
  const [selectedStage, setSelectedStage] = useState<string>('phase2');
  const [taOpen, setTaOpen] = useState(false);
  const [indicationOpen, setIndicationOpen] = useState(false);
  const taDropdownRef = useRef<HTMLDivElement>(null);
  const indicationDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (taDropdownRef.current && !taDropdownRef.current.contains(e.target as Node)) {
      setTaOpen(false);
    }
    if (indicationDropdownRef.current && !indicationDropdownRef.current.contains(e.target as Node)) {
      setIndicationOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const indications = DEMO_DATA[selectedTA] ?? [];
  const indication = indications.find((i) => i.name === selectedIndication) ?? null;
  const stage = STAGES.find((s) => s.value === selectedStage) ?? STAGES[2];

  // When therapy area changes, auto-select the first indication
  // so results are always visible
  useEffect(() => {
    const currentIndications = DEMO_DATA[selectedTA] ?? [];
    if (currentIndications.length > 0 && !currentIndications.find((i) => i.name === selectedIndication)) {
      setSelectedIndication(currentIndications[0].name);
    }
  }, [selectedTA]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute stage-adjusted results
  const results = useMemo(() => {
    if (!indication) return null;
    const shareMultiplier = stage.share;
    const somBase = indication.sam_b * shareMultiplier;
    const somLow = somBase * 0.6;
    const somHigh = somBase * 1.5;
    const peakAdj = indication.peak_sales_b * (shareMultiplier / 0.12); // normalized to phase2 baseline
    return {
      tam: indication.tam_b,
      sam: indication.sam_b,
      som: somBase,
      som_low: somLow,
      som_high: somHigh,
      peak: Math.min(peakAdj, indication.tam_b * 0.4),
      cagr: indication.cagr_5yr,
      prevalence: indication.us_prevalence,
      incidence: indication.us_incidence,
    };
  }, [indication, stage]);

  return (
    <div className="card noise p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-navy-700/60 flex items-center gap-2">
        <Calculator className="w-4 h-4 text-teal-500" />
        <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Interactive Market Calculator</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Therapeutic Area Dropdown */}
        <div>
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">
            Therapeutic Area
          </label>
          <div className="relative" ref={taDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setTaOpen(!taOpen);
                setIndicationOpen(false);
              }}
              className="input w-full text-left flex items-center justify-between border-navy-600"
            >
              <span className={selectedTA ? 'text-teal-400 text-sm' : 'text-slate-500 text-sm'}>
                {selectedTA || 'Select...'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {taOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-navy-600 bg-navy-900 shadow-xl max-h-52 overflow-y-auto">
                {THERAPY_AREAS.map((ta) => (
                  <button
                    key={ta}
                    type="button"
                    onClick={() => {
                      setSelectedTA(ta);
                      setSelectedIndication('');
                      setTaOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-navy-800 ${
                      selectedTA === ta ? 'text-teal-400 bg-navy-800/50' : 'text-slate-300'
                    }`}
                  >
                    {ta}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Indication Dropdown */}
        <div>
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Indication</label>
          <div className="relative" ref={indicationDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIndicationOpen(!indicationOpen);
                setTaOpen(false);
              }}
              className="input w-full text-left flex items-center justify-between border-navy-600"
            >
              <span className={selectedIndication ? 'text-teal-400 text-sm' : 'text-slate-500 text-sm'}>
                {selectedIndication || 'Select an indication...'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {indicationOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-navy-600 bg-navy-900 shadow-xl max-h-52 overflow-y-auto">
                {indications.map((ind) => (
                  <button
                    key={ind.name}
                    type="button"
                    onClick={() => {
                      setSelectedIndication(ind.name);
                      setIndicationOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-navy-800 ${
                      selectedIndication === ind.name ? 'text-teal-400 bg-navy-800/50' : 'text-slate-300'
                    }`}
                  >
                    {ind.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stage pills */}
        <div>
          <label className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">
            Development Stage
          </label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedStage(s.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  selectedStage === s.value
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                    : 'bg-navy-800 border-navy-700 text-slate-400 hover:border-navy-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {results && (
            <motion.div
              key={`${selectedIndication}-${selectedStage}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="pt-5 border-t border-navy-700/60 space-y-5"
            >
              {/* Primary metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'US TAM', value: formatBillion(results.tam), accent: false },
                  { label: 'US SAM', value: formatBillion(results.sam), accent: false },
                  { label: 'US SOM', value: formatBillion(results.som), accent: true },
                  { label: 'Peak Sales Est.', value: formatBillion(results.peak), accent: true },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</div>
                    <div className={`font-mono text-xl font-medium ${m.accent ? 'text-teal-400' : 'text-white'}`}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">5-yr CAGR</div>
                  <div className="font-mono text-sm text-emerald-400">+{results.cagr.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">US Prevalence</div>
                  <div className="font-mono text-sm text-white">{formatPatients(results.prevalence)}</div>
                </div>
                <div>
                  <div className="text-2xs text-slate-500 uppercase tracking-wider mb-1">US Incidence</div>
                  <div className="font-mono text-sm text-white">{formatPatients(results.incidence)}</div>
                </div>
              </div>

              {/* Waterfall */}
              <div>
                <div className="text-2xs text-slate-500 uppercase tracking-wider mb-2">TAM / SAM / SOM</div>
                <div className="flex items-end gap-1 h-20">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-2xs font-mono text-teal-300 mb-1">TAM {formatBillion(results.tam)}</span>
                    <div className="w-full bg-teal-500/20 rounded-sm h-14 relative">
                      <div className="absolute inset-x-0 bottom-0 bg-teal-500/40 rounded-sm h-full" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end">
                    <span className="text-2xs font-mono text-teal-300 mb-1">SAM {formatBillion(results.sam)}</span>
                    <div
                      className="w-full bg-teal-500/20 rounded-sm relative"
                      style={{ height: `${Math.max(1.5, (results.sam / results.tam) * 3.5)}rem` }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-teal-500/30 rounded-sm h-full" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-end">
                    <span className="text-2xs font-mono text-white mb-1">SOM {formatBillion(results.som)}</span>
                    <div
                      className="w-full bg-teal-500/20 rounded-sm relative"
                      style={{ height: `${Math.max(0.75, (results.som / results.tam) * 3.5)}rem` }}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-teal-500/60 rounded-sm h-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 text-center">
                <p className="text-sm text-slate-300 mb-3">
                  Get the full report with 15+ analytics sections — patient funnel, competitive landscape, partner
                  matching, regulatory pathway, and deal benchmarks.
                </p>
                <Link href="/signup" className="btn btn-primary text-sm px-6 py-2 inline-flex items-center gap-2">
                  Sign up free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No empty state — results pre-loaded on mount */}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SECTION EXPORT
// ────────────────────────────────────────────────────────────

export function InteractiveDemoSection() {
  return (
    <Section id="interactive-demo" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Live Calculator</p>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">See your market in real time.</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Pick any therapeutic area, indication, and development stage. Terrain computes TAM, SAM, SOM, and peak
              sales estimates instantly — the same engine powering our full intelligence reports.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                '10 therapeutic areas, 20+ indications pre-loaded',
                'Stage-adjusted market share modeling',
                'Epidemiology-driven patient funnel',
                'Full reports cover 15+ analytics sections',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Calculator className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <InteractiveCalculator />
        </div>
      </div>
    </Section>
  );
}
