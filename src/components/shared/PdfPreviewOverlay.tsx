'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { X, Download, Loader2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { PDF_LAYOUT } from '@/lib/export-pdf';

interface PdfPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportSubtitle?: string;
  filename?: string;
  children: React.ReactNode;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;
const PAGE_GAP = 24;

interface PageMetrics {
  totalPages: number;
  contentHeightPx: number;
  headerHeightPx: number;
  footerHeightPx: number;
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
  const [zoom, setZoom] = useState(1);
  const [contentHTML, setContentHTML] = useState('');
  const [metrics, setMetrics] = useState<PageMetrics | null>(null);
  const [activePage, setActivePage] = useState(0);

  const dateString = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  // ── Lock body scroll ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ── Reset state on open ───────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setActivePage(0);
      setContentHTML('');
      setMetrics(null);
    }
  }, [isOpen]);

  // ── Measurement + content capture via ResizeObserver ───────
  useEffect(() => {
    if (!isOpen || !paperRef.current) return;

    const calculate = () => {
      const el = paperRef.current;
      if (!el || el.scrollWidth === 0) return;

      const paperWidth = el.scrollWidth;
      const mmToPx = paperWidth / PDF_LAYOUT.contentWidth;
      const contentHeightPx = PDF_LAYOUT.contentHeight * mmToPx;
      const headerHeightPx = PDF_LAYOUT.headerHeight * mmToPx;
      const footerHeightPx = PDF_LAYOUT.footerHeight * mmToPx;
      const totalPages = Math.max(1, Math.ceil(el.scrollHeight / contentHeightPx));

      setContentHTML(el.innerHTML);
      setMetrics({ totalPages, contentHeightPx, headerHeightPx, footerHeightPx });
    };

    const timer = setTimeout(calculate, 300);
    const observer = new ResizeObserver(calculate);
    observer.observe(paperRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isOpen, children]);

  // ── Fit-to-width ──────────────────────────────────────────
  const fitToWidth = useCallback(() => {
    if (!scrollRef.current) return;
    const viewportWidth = scrollRef.current.clientWidth;
    const sidebarWidth = metrics && metrics.totalPages > 1 ? 56 : 0;
    const available = viewportWidth - sidebarWidth - 64;
    const paperPx = 816;
    const fit = Math.min(available / paperPx, ZOOM_MAX);
    setZoom(Math.max(Math.round(fit * 100) / 100, ZOOM_MIN));
  }, [metrics]);

  // ── Auto fit-to-width on narrow screens ───────────────────
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (window.innerWidth < 900) fitToWidth();
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen, fitToWidth]);

  // ── Zoom with scroll position preservation ────────────────
  const adjustZoom = useCallback(
    (newZoom: number) => {
      const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
      const container = scrollRef.current;
      if (!container) {
        setZoom(clamped);
        return;
      }
      const centerY = container.scrollTop + container.clientHeight / 2;
      const contentY = centerY / zoom;
      setZoom(clamped);
      requestAnimationFrame(() => {
        container.scrollTop = contentY * clamped - container.clientHeight / 2;
      });
    },
    [zoom],
  );

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        adjustZoom(zoom + ZOOM_STEP);
      } else if (mod && e.key === '-') {
        e.preventDefault();
        adjustZoom(zoom - ZOOM_STEP);
      } else if (mod && e.key === '0') {
        e.preventDefault();
        fitToWidth();
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose, fitToWidth, adjustZoom, zoom]);

  // ── Track active page on scroll ───────────────────────────
  useEffect(() => {
    if (!scrollRef.current || !metrics) return;
    const container = scrollRef.current;
    const handleScroll = () => {
      const fullPageH = (metrics.headerHeightPx + metrics.contentHeightPx + metrics.footerHeightPx + PAGE_GAP) * zoom;
      if (fullPageH <= 0) return;
      const page = Math.floor((container.scrollTop + container.clientHeight / 3) / fullPageH);
      setActivePage(Math.max(0, Math.min(page, metrics.totalPages - 1)));
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [metrics, zoom]);

  // ── Scroll to page ────────────────────────────────────────
  const scrollToPage = useCallback(
    (page: number) => {
      if (!scrollRef.current || !metrics) return;
      const fullPageH = (metrics.headerHeightPx + metrics.contentHeightPx + metrics.footerHeightPx + PAGE_GAP) * zoom;
      scrollRef.current.scrollTo({ top: page * fullPageH, behavior: 'smooth' });
    },
    [metrics, zoom],
  );

  // ── Download PDF (from hidden measurement container) ──────
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

  // ── Shared chrome style (Helvetica, matching jsPDF) ───────
  const chromeFont: React.CSSProperties = {
    fontFamily: 'Helvetica, Arial, sans-serif',
  };

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
          {/* ── Toolbar ─────────────────────────────────────── */}
          <div className="relative z-[201] flex items-center h-14 px-5 bg-navy-950 border-b border-navy-700 flex-shrink-0">
            {/* Left: Brand + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-white font-bold tracking-wider text-sm flex-shrink-0">TERRAIN</span>
              <span className="text-navy-600 flex-shrink-0">|</span>
              <span className="text-slate-300 text-sm truncate">{reportTitle}</span>
              {reportSubtitle && (
                <span className="text-slate-500 text-xs truncate hidden md:inline">{reportSubtitle}</span>
              )}
            </div>

            {/* Center: Zoom controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mx-4">
              <button
                onClick={() => adjustZoom(zoom - ZOOM_STEP)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-navy-800"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-slate-300 text-xs font-mono w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => adjustZoom(zoom + ZOOM_STEP)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-navy-800"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-navy-700 mx-1">|</span>
              <button
                onClick={fitToWidth}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-navy-800 flex items-center gap-1"
                aria-label="Fit to width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono hidden sm:inline">FIT</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-slate-500 text-xs hidden md:inline font-mono">
                {metrics
                  ? `${metrics.totalPages} ${metrics.totalPages === 1 ? 'page' : 'pages'}`
                  : 'Letter 8.5\u2033 \u00d7 11\u2033'}
              </span>
              <button onClick={handleDownload} disabled={isDownloading} className="btn btn-primary btn-sm">
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

          {/* ── Main content area ───────────────────────────── */}
          <div className="flex flex-1 overflow-hidden">
            {/* Page navigation sidebar */}
            {metrics && metrics.totalPages > 1 && (
              <nav
                className="flex-shrink-0 overflow-y-auto"
                style={{
                  width: 56,
                  background: 'rgba(4, 8, 15, 0.95)',
                  borderRight: '1px solid rgba(16, 34, 54, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 0',
                  gap: 8,
                }}
              >
                {Array.from({ length: metrics.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    style={{
                      width: 36,
                      height: 46,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontFamily: '"DM Mono", monospace',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      border: '1px solid',
                      borderColor: activePage === i ? 'rgba(0, 201, 167, 0.25)' : 'transparent',
                      background: activePage === i ? 'rgba(0, 201, 167, 0.08)' : 'transparent',
                      color: activePage === i ? 'rgb(0, 201, 167)' : 'rgba(148, 163, 184, 0.6)',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            )}

            {/* Scrollable page area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overflow-x-auto"
              style={{ background: '#e5e7eb' }}
              onClick={(e) => {
                if (e.target === scrollRef.current) onClose();
              }}
            >
              {/* Hidden measurement container — real React content for PDF download */}
              <div
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 0,
                  width: '816px',
                  visibility: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                <div ref={paperRef} className="pdf-preview-paper export-light">
                  {children}
                </div>
              </div>

              {/* Zoom wrapper */}
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  willChange: 'transform',
                }}
              >
                <motion.div
                  initial={{ scale: 0.97, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.97, opacity: 0, y: 20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* Discrete pages */}
                  {metrics && contentHTML ? (
                    Array.from({ length: metrics.totalPages }).map((_, i) => (
                      <div
                        key={i}
                        data-page={i + 1}
                        style={{
                          maxWidth: '8.5in',
                          margin: i === 0 ? '2rem auto 0' : `${PAGE_GAP}px auto 0`,
                          background: '#ffffff',
                          borderRadius: 2,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* ── Page Header ──────────────────────── */}
                        <div
                          style={{
                            ...chromeFont,
                            padding: '15px 20px 0 20px',
                            background: '#ffffff',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: PDF_LAYOUT.navy950,
                                  letterSpacing: 0.5,
                                }}
                              >
                                TERRAIN
                              </span>
                              <span style={{ fontSize: 8, color: PDF_LAYOUT.teal }}>by Ambrosia Ventures</span>
                            </div>
                            <span style={{ fontSize: 7, color: PDF_LAYOUT.slate500 }}>
                              Page {i + 1} of {metrics.totalPages}
                            </span>
                          </div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 10,
                              color: PDF_LAYOUT.navy950,
                              marginTop: 6,
                            }}
                          >
                            {reportTitle}
                          </div>
                          {reportSubtitle && (
                            <div
                              style={{
                                fontSize: 7,
                                color: PDF_LAYOUT.slate500,
                                marginTop: 3,
                              }}
                            >
                              {reportSubtitle}
                            </div>
                          )}
                          <div
                            style={{
                              height: 0.5,
                              background: PDF_LAYOUT.teal,
                              marginTop: 8,
                            }}
                          />
                        </div>

                        {/* ── Content viewport (clipped) ───────── */}
                        <div
                          style={{
                            height: metrics.contentHeightPx,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <div
                            className="pdf-preview-paper export-light"
                            style={{
                              marginTop: `-${i * metrics.contentHeightPx}px`,
                            }}
                            dangerouslySetInnerHTML={{ __html: contentHTML }}
                          />
                        </div>

                        {/* ── Page Footer ──────────────────────── */}
                        <div
                          style={{
                            ...chromeFont,
                            padding: '0 20px 12px 20px',
                            background: '#ffffff',
                          }}
                        >
                          <div
                            style={{
                              height: 0.3,
                              background: PDF_LAYOUT.gray300,
                              marginBottom: 8,
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                            }}
                          >
                            <span style={{ fontSize: 6, color: PDF_LAYOUT.slate500 }}>
                              CONFIDENTIAL — Generated by Terrain (terrain.ambrosiaventures.co)
                            </span>
                            <span style={{ fontSize: 6, color: PDF_LAYOUT.slate500 }}>{dateString}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Loading skeleton — single page outline */
                    <div
                      style={{
                        maxWidth: '8.5in',
                        margin: '2rem auto',
                        background: '#ffffff',
                        borderRadius: 2,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                        padding: 48,
                        textAlign: 'center',
                      }}
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: PDF_LAYOUT.teal }} />
                      <p
                        style={{
                          fontSize: 13,
                          color: PDF_LAYOUT.slate500,
                          ...chromeFont,
                        }}
                      >
                        Preparing preview&hellip;
                      </p>
                    </div>
                  )}

                  {/* Bottom spacer */}
                  <div style={{ height: 32 }} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
