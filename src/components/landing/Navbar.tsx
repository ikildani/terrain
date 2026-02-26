'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'border-navy-700/60 bg-navy-950/90 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-display text-xl text-white tracking-tight group-hover:text-teal-400 transition-colors">
            Terrain
          </span>
          <span className="hidden sm:block w-px h-5 bg-navy-700/80" />
          <span className="text-[9px] sm:text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
            Powered by{' '}
            <span className="text-slate-400 group-hover:text-teal-400 transition-colors font-medium">
              Ambrosia Ventures
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#modules" className="nav-link hover:text-white transition-colors">
            Modules
          </a>
          <a href="#demo" className="nav-link hover:text-white transition-colors">
            Demo
          </a>
          <a href="#pricing" className="nav-link hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="nav-link hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline text-sm text-slate-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="hidden sm:inline btn btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-navy-700/60 bg-navy-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {[
                { href: '#modules', label: 'Modules' },
                { href: '#demo', label: 'Demo' },
                { href: '#pricing', label: 'Pricing' },
                { href: '#faq', label: 'FAQ' },
              ].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.2 }}
                  className="text-sm text-slate-300 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t border-navy-700/40 pt-4 mt-2 flex flex-col gap-3"
              >
                <Link
                  href="/login"
                  className="text-sm text-slate-300 hover:text-white transition-colors py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary text-sm py-2.5 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
