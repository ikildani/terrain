'use client';

import { BEFORE_AFTER } from './data';
import { Section } from './Section';

export function BeforeAfterSection() {
  return (
    <Section className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">The Difference</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">Traditional consulting vs. Terrain</h2>
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
  );
}
