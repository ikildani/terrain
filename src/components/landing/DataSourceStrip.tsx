'use client';

import { Database, Shield, FileText, Globe, TrendingUp } from 'lucide-react';
import { Section } from './Section';

const SOURCES = [
  { icon: Database, text: 'ClinicalTrials.gov', freq: 'Updated nightly' },
  { icon: Shield, text: 'FDA / EMA', freq: 'Within 24h' },
  { icon: FileText, text: 'SEC EDGAR', freq: 'Within 24h' },
  { icon: Globe, text: 'WHO GBD', freq: 'Quarterly' },
  { icon: TrendingUp, text: '10,000+ Transactions', freq: 'Proprietary' },
];

export function DataSourceStrip() {
  return (
    <Section className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-4">
          Powered by live data pipelines
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SOURCES.map((src) => {
            const Icon = src.icon;
            return (
              <div key={src.text} className="flex items-center gap-2 text-slate-500 text-xs">
                <Icon className="w-3.5 h-3.5 text-slate-600" />
                <span>{src.text}</span>
                <span className="text-[9px] font-mono text-slate-700">{src.freq}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
