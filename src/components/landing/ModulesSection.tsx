'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { MODULES } from './data';
import { fadeUp, stagger } from './animations';
import { Section } from './Section';

export function ModulesSection() {
  return (
    <Section id="modules" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Intelligence Modules</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">Four modules. One platform.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
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
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.name}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card module-card noise p-6 group hover:border-teal-500/30 hover:shadow-card-hover transition-all relative cursor-pointer"
              >
                <div className="module-icon w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 group-hover:border-teal-500/20 transition-all">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-display text-lg text-white mb-2">{mod.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{mod.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-teal-500">{mod.metric}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
