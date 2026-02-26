'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FAQ } from './data';
import { Section } from './Section';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border-b border-navy-700/60 transition-all duration-200 ${open ? 'faq-item-open' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`text-sm font-medium pr-4 transition-colors ${
            open ? 'text-teal-400' : 'text-white group-hover:text-teal-400'
          }`}
        >
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-teal-500' : 'text-slate-500'
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="text-sm text-slate-400 leading-relaxed pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

export function FaqSection() {
  return (
    <Section id="faq" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">Common questions</h2>
        </div>

        <div className="border-t border-navy-700/60">
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </Section>
  );
}
