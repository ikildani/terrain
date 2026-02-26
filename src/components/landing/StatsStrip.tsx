'use client';

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { STATS } from './data';

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

function AnimatedStat({
  value,
  suffix,
  prefix,
  label,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-2xl sm:text-3xl text-teal-400 font-medium">
        {prefix}
        {count}
        {suffix}
      </div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export function StatsStrip() {
  return (
    <section className="border-y border-navy-700/60 bg-navy-900/40 noise">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <AnimatedStat key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
