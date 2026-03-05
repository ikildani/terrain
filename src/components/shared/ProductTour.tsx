'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="market-sizing"]',
    title: 'Market Sizing',
    description:
      'Generate TAM/SAM/SOM analyses with investor-grade methodology. Enter an indication and get results in 90 seconds.',
    placement: 'right',
  },
  {
    target: '[data-tour="competitive"]',
    title: 'Competitive Landscape',
    description: 'Map competitors by phase, mechanism, and differentiation. Identify pipeline gaps and white space.',
    placement: 'right',
  },
  {
    target: '[data-tour="intelligence"]',
    title: 'Market Intelligence',
    description:
      'Live data from ClinicalTrials.gov, FDA, and SEC EDGAR — refreshed automatically. Your always-on research feed.',
    placement: 'right',
  },
  {
    target: '[data-tour="reports"]',
    title: 'Saved Reports',
    description: 'All your analyses in one place. Star favorites, share with team members, and export to PDF or Excel.',
    placement: 'right',
  },
  {
    target: '[data-tour="search"]',
    title: 'Quick Search',
    description: 'Press ⌘K to search across pages, reports, and indications. Get to anything in seconds.',
    placement: 'bottom',
  },
];

const STORAGE_KEY = 'terrain_tour_completed';

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if tour should show — only on first visit
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay tour start so the page has time to render
      const timer = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!active) return;
    const currentStep = TOUR_STEPS[step];
    const el = document.querySelector(currentStep.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [active, step]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  const completeTour = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      completeTour();
    }
  }, [step, completeTour]);

  const prevStep = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  if (!active) return null;

  const currentStep = TOUR_STEPS[step];
  const placement = currentStep.placement ?? 'right';
  const isLast = step === TOUR_STEPS.length - 1;

  // Calculate tooltip position based on target element
  let tooltipStyle: React.CSSProperties = {};
  if (targetRect) {
    switch (placement) {
      case 'right':
        tooltipStyle = {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + 16,
          transform: 'translateY(-50%)',
        };
        break;
      case 'bottom':
        tooltipStyle = {
          top: targetRect.bottom + 16,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
        break;
      case 'left':
        tooltipStyle = {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + 16,
          transform: 'translateY(-50%)',
        };
        break;
      case 'top':
        tooltipStyle = {
          bottom: window.innerHeight - targetRect.top + 16,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
        break;
    }
  } else {
    // Fallback: center on screen
    tooltipStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={completeTour}
          />

          {/* Spotlight on target */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[61] rounded-lg ring-2 ring-teal-500/60 pointer-events-none"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[62] w-80 bg-navy-800 border border-navy-600 rounded-xl shadow-elevated p-5"
            style={tooltipStyle}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-teal-500/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <h3 className="font-display text-sm text-white">{currentStep.title}</h3>
              </div>
              <button
                onClick={completeTour}
                className="p-1 rounded hover:bg-navy-700 transition-colors"
                aria-label="Close tour"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">{currentStep.description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono text-slate-600">
                {step + 1} / {TOUR_STEPS.length}
              </span>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
                    isLast
                      ? 'bg-teal-500 text-navy-950 hover:bg-teal-400'
                      : 'bg-teal-500/15 text-teal-400 hover:bg-teal-500/25',
                  )}
                >
                  {isLast ? 'Get Started' : 'Next'}
                  {!isLast && <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i === step ? 'bg-teal-500' : i < step ? 'bg-teal-500/40' : 'bg-navy-600',
                  )}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
