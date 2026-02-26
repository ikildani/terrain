'use client';

import { motion } from 'framer-motion';
import { PERSONAS } from './data';
import { fadeUp, staggerSlow } from './animations';
import { Section } from './Section';

export function PersonasSection() {
  return (
    <Section id="personas" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Built For</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
            Intelligence for every seat at the table.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Whether you&apos;re building the company, doing the deal, or writing the check — Terrain gives you the
            market context to move with conviction.
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
                <p className="text-sm text-slate-500 leading-relaxed mb-4 italic">&ldquo;{p.pain}&rdquo;</p>
                <p className="text-sm text-slate-300 leading-relaxed">{p.solve}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
