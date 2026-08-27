'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from './Section';

export function CtaSection() {
  return (
    <Section className="py-24 px-6 border-t border-navy-700/60 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-40 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-8">Start your analysis.</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="btn btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2">
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/signup?plan=pro" className="btn btn-secondary text-base px-8 py-3.5">
            Start 7-day Pro trial
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-4">No credit card required</p>
      </div>
    </Section>
  );
}
