'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

interface PdfPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportSubtitle?: string;
  filename?: string;
  children: React.ReactNode;
}

export function PdfPreviewOverlay({
  isOpen,
  onClose,
  reportTitle,
  reportSubtitle,
  filename = 'terrain-report',
  children,
}: PdfPreviewOverlayProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleDownload = useCallback(async () => {
    if (!paperRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const { exportToPdf } = await import('@/lib/export-pdf');
      await exportToPdf(paperRef.current, {
        title: reportTitle,
        subtitle: reportSubtitle,
        filename,
      });
      toast.success('PDF downloaded');
      onClose();
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('PDF generation failed');
    } finally {
      setIsDownloading(false);
    }
  }, [reportTitle, reportSubtitle, filename, onClose, isDownloading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Toolbar */}
          <div className="relative z-[201] flex items-center h-14 px-5 bg-navy-950 border-b border-navy-700 flex-shrink-0">
            {/* Left: Brand + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-white font-bold tracking-wider text-sm flex-shrink-0">
                TERRAIN
              </span>
              <span className="text-navy-600 flex-shrink-0">|</span>
              <span className="text-slate-300 text-sm truncate">
                {reportTitle}
              </span>
              {reportSubtitle && (
                <span className="text-slate-500 text-xs truncate hidden md:inline">
                  {reportSubtitle}
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-slate-500 text-xs hidden md:inline font-mono">
                Letter 8.5&quot; &times; 11&quot;
              </span>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn btn-primary btn-sm"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={onClose}
                aria-label="Close preview"
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto"
            style={{ background: '#e5e7eb' }}
            onClick={(e) => {
              // Close if clicking the gray background (not the paper)
              if (e.target === scrollRef.current) onClose();
            }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Paper container */}
              <div
                ref={paperRef}
                className="pdf-preview-paper export-light"
              >
                {children}
              </div>
              {/* Bottom spacer */}
              <div className="h-8" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
