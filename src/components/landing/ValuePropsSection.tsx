'use client';

import { motion } from 'framer-motion';
import { Zap, Globe, FileText } from 'lucide-react';
import { fadeUp, staggerSlow } from './animations';
import { Section } from './Section';

const VALUE_PROPS = [
  {
    icon: Zap,
    title: 'Seconds, not weeks',
    body: 'Full TAM/SAM/SOM with patient funnel, competitive landscape, and partner scoring in under 30 seconds. The same deliverable a consulting firm charges $50K for and takes 3 weeks to produce.',
  },
  {
    icon: Globe,
    title: 'Global coverage, any modality',
    body: 'US, EU5, Japan, China, and Rest of World. Pharmaceuticals, medical devices, diagnostics, and nutraceuticals \u2014 each with category-specific sizing, regulatory pathways, and reimbursement models.',
  },
  {
    icon: FileText,
    title: 'Deal-ready output',
    body: 'Export to PDF or CSV with institutional-grade formatting. Every number is sourced. Every chart is presentation-ready for board decks, investment committee memos, and licensing discussions.',
  },
];

export function ValuePropsSection() {
  return (
    <Section className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid md:grid-cols-3 gap-12"
          variants={staggerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <motion.div key={prop.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-display text-xl text-white mb-3">{prop.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{prop.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
