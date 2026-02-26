'use client';

import { motion } from 'framer-motion';
import { STEPS } from './data';
import { fadeUp, staggerSlow } from './animations';
import { Section } from './Section';

export function HowItWorksSection() {
  return (
    <Section className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">From question to answer in three steps.</h2>
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
              <div className="font-mono text-3xl text-teal-500/30 font-medium mb-3">{step.number}</div>
              <h3 className="font-display text-lg text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
