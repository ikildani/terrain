'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRICING } from './data';
import { fadeUp, stagger } from './animations';
import { Section } from './Section';

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <Section id="pricing" className="py-24 px-6 border-t border-navy-700/60">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-teal-500 tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">Intelligence at every scale</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Start free. Upgrade when Terrain becomes indispensable.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-navy-800 border border-navy-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                billingPeriod === 'monthly' ? 'bg-navy-700 text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-2 ${
                billingPeriod === 'annual' ? 'bg-navy-700 text-white' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Annual
              <span className="text-2xs font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Save ~17%</span>
            </button>
          </div>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {PRICING.map((plan) => {
            const isEnterprise = plan.price === -1;
            const displayPrice = isEnterprise
              ? null
              : billingPeriod === 'annual' && plan.annualPrice > 0
                ? plan.annualPrice
                : plan.price;

            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`card noise p-6 relative flex flex-col ${
                  plan.highlighted
                    ? 'border-teal-500/40 ring-1 ring-teal-500/20 shadow-teal-sm pro-card-accent'
                    : isEnterprise
                      ? 'border-slate-600/40'
                      : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-teal text-2xs px-3 py-1">Most Popular</span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                  {isEnterprise ? (
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl text-white font-medium">Custom</span>
                    </div>
                  ) : (
                    <div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${plan.name}-${billingPeriod}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-4xl text-white font-medium">${displayPrice}</span>
                            {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
                          </div>
                          {billingPeriod === 'annual' && plan.annualTotal > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                              Billed annually at ${plan.annualTotal.toLocaleString()}/yr
                            </p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                      {plan.highlighted && (
                        <p className="text-xs text-teal-400/70 mt-2 font-mono">
                          14-day free trial · No credit card required
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isEnterprise ? (
                  <a href={plan.href} className="btn btn-secondary w-full text-center text-sm py-2.5">
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`btn w-full text-center text-sm py-2.5 ${
                      plan.highlighted
                        ? 'btn-primary shadow-teal-sm hover:shadow-teal-md transition-shadow'
                        : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Section>
  );
}
