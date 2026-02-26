'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';

export function Section({
  children,
  className = '',
  id,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}
