'use client';

import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Re-export layout constants from dedicated module (keeps heavy deps out of light importers)
export { PDF_LAYOUT } from './pdf-layout';

/**
 * Convert all SVG elements within a container to canvas elements
 * for reliable html2canvas capture. Returns a cleanup function
 * to restore the original SVGs.
 */
async function svgToCanvas(container: HTMLElement): Promise<() => void> {
  const svgs = container.querySelectorAll('svg.recharts-surface');
  const originals: { svg: SVGSVGElement; canvas: HTMLCanvasElement; parent: HTMLElement }[] = [];

  for (const svg of Array.from(svgs)) {
    const svgElement = svg as SVGSVGElement;
    const parent = svgElement.parentElement;
    if (!parent) continue;

    const bbox = svgElement.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = bbox.width * 2; // 2x for retina
    canvas.height = bbox.height * 2;
    canvas.style.width = `${bbox.width}px`;
    canvas.style.height = `${bbox.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // Serialize SVG to string and render to canvas via Image
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      // Replace SVG with canvas in DOM
      svgElement.style.display = 'none';
      parent.appendChild(canvas);
      originals.push({ svg: svgElement, canvas, parent });
    } catch {
      // If SVG conversion fails, skip this chart
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Return cleanup function
  return () => {
    for (const { svg, canvas, parent } of originals) {
      svg.style.display = '';
      parent.removeChild(canvas);
    }
  };
}

interface ExportBranding {
  logoUrl?: string | null;
  primaryColor?: string | null;
  footerText?: string | null;
  /** When true, removes all Terrain/Ambrosia references (enterprise white-label). */
  whiteLabel?: boolean;
}

interface ExportPdfOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  branding?: ExportBranding;
}

/** Parse a hex color string to RGB values. Returns teal default if invalid. */
function hexToRgb(hex: string | null | undefined): { r: number; g: number; b: number } {
  const DEFAULT = { r: 0, g: 138, b: 116 }; // teal-600
  if (!hex) return DEFAULT;
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return DEFAULT;
  // Expand shorthand (e.g., "0f8" → "00ff88")
  const full =
    clean.length <= 4
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full.slice(0, 6), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Captured section: a canvas image and its dimensions in mm at content scale. */
interface CapturedSection {
  canvas: HTMLCanvasElement;
  /** Height of this section in mm when scaled to fit the PDF content width. */
  heightMm: number;
}

// ── Page geometry (Letter, mm) ─────────────────────────────────────
const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN = 15;
const HEADER_HEIGHT = 28;
const FOOTER_HEIGHT = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN * 2 - HEADER_HEIGHT - FOOTER_HEIGHT;
const CONTENT_TOP = MARGIN + HEADER_HEIGHT;
const SCALE_FACTOR = 2; // html2canvas scale

/**
 * Capture a single DOM element as a high-res canvas.
 * Returns the canvas and its height in mm when scaled to CONTENT_WIDTH.
 */
async function captureSection(el: HTMLElement): Promise<CapturedSection> {
  const canvas = await html2canvas(el, {
    scale: SCALE_FACTOR,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    windowWidth: 816,
    windowHeight: el.scrollHeight,
    allowTaint: false,
    foreignObjectRendering: false,
  });
  // Convert pixel height → mm at content width scale
  const ratio = CONTENT_WIDTH / (canvas.width / SCALE_FACTOR);
  const heightMm = (canvas.height / SCALE_FACTOR) * ratio;
  return { canvas, heightMm };
}

/**
 * Draw the branded header on the current PDF page.
 * The teal accent line is drawn BELOW the date text.
 */
async function drawHeader(
  pdf: jsPDF,
  page: number,
  totalPages: number,
  title: string,
  subtitle: string | undefined,
  dateString: string,
  accentRgb: { r: number; g: number; b: number },
  branding?: ExportBranding,
): Promise<void> {
  const isWhiteLabel = branding?.whiteLabel === true;

  // White background behind header
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, PAGE_WIDTH, CONTENT_TOP, 'F');

  // Brand — render logo if provided, otherwise text
  let headerTextX = MARGIN;
  if (branding?.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject(new Error('Logo load failed'));
        logoImg.src = branding.logoUrl!;
      });
      const logoCanvas = document.createElement('canvas');
      logoCanvas.width = logoImg.naturalWidth;
      logoCanvas.height = logoImg.naturalHeight;
      const logoCtx = logoCanvas.getContext('2d');
      if (logoCtx) {
        logoCtx.drawImage(logoImg, 0, 0);
        const logoData = logoCanvas.toDataURL('image/png');
        const logoH = 8; // mm height
        const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
        pdf.addImage(logoData, 'PNG', MARGIN, MARGIN + 2, logoW, logoH);
        headerTextX = MARGIN + logoW + 3;
      }
    } catch {
      // Logo failed to load — fall back to text brand
    }
  }

  if (!isWhiteLabel) {
    // Default Terrain branding — distinctive bold italic for brand name
    pdf.setFont('helvetica', 'bolditalic');
    pdf.setFontSize(12);
    pdf.setTextColor(4, 8, 15); // navy-950
    pdf.text('TERRAIN', headerTextX, MARGIN + 7);

    // Tagline
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
    pdf.text('by Ambrosia Ventures', headerTextX + 24, MARGIN + 7);

    // Thin line under brand area
    pdf.setDrawColor(209, 213, 219); // gray-300
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, MARGIN + 10, PAGE_WIDTH - MARGIN, MARGIN + 10);
  }

  // Page number (top-right)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Page ${page + 1} of ${totalPages}`, PAGE_WIDTH - MARGIN, MARGIN + 7, { align: 'right' });

  // Report title — larger for first page, smaller for continuation pages
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(page === 0 ? 16 : 10);
  pdf.setTextColor(4, 8, 15);
  pdf.text(title, MARGIN, MARGIN + 16);

  // Track the Y position for stacking subtitle, date, then accent line
  let nextY = MARGIN + 16;

  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(page === 0 ? 10 : 7);
    pdf.setTextColor(100, 116, 139); // slate-500
    nextY = MARGIN + (page === 0 ? 22 : 21);
    pdf.text(subtitle, MARGIN, nextY);
  }

  // Date line on first page
  if (page === 0) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    nextY = MARGIN + (subtitle ? 27 : 22);
    pdf.text(`Prepared ${dateString}`, MARGIN, nextY);
  }

  // Teal accent line — BELOW the date text (not through it)
  const accentLineY = CONTENT_TOP - 2;
  pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  pdf.setLineWidth(0.8);
  pdf.line(MARGIN, accentLineY, PAGE_WIDTH - MARGIN, accentLineY);
}

/**
 * Draw the branded footer on the current PDF page.
 */
function drawFooter(
  pdf: jsPDF,
  page: number,
  totalPages: number,
  dateString: string,
  footerLabel: string,
  isWhiteLabel: boolean,
): void {
  const footerY = PAGE_HEIGHT - MARGIN - 4;

  // Separator line
  pdf.setDrawColor(209, 213, 219); // gray-300
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, footerY - 4, PAGE_WIDTH - MARGIN, footerY - 4);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(100, 116, 139);

  // Left: confidential label
  pdf.text(footerLabel, MARGIN, footerY);
  // Center: copyright
  pdf.text('\u00A9 2026 Ambrosia Ventures', PAGE_WIDTH / 2, footerY, { align: 'center' });
  // Right: date + page
  pdf.text(`${dateString}  |  Page ${page + 1} of ${totalPages}`, PAGE_WIDTH - MARGIN, footerY, { align: 'right' });
}

/**
 * Place a section canvas (or a slice of it) onto the PDF at the given cursor position.
 * Returns the height in mm that was actually placed.
 */
function placeImage(
  pdf: jsPDF,
  sectionCanvas: HTMLCanvasElement,
  cursorY: number,
  maxHeightMm: number,
  sourceOffsetMm: number,
  sectionTotalHeightMm: number,
): number {
  const placeMm = Math.min(sectionTotalHeightMm - sourceOffsetMm, maxHeightMm);
  if (placeMm <= 0) return 0;

  // Calculate source pixels for the slice
  const ratio = CONTENT_WIDTH / (sectionCanvas.width / SCALE_FACTOR);
  const srcYPx = (sourceOffsetMm / ratio) * SCALE_FACTOR;
  const srcHPx = (placeMm / ratio) * SCALE_FACTOR;

  // Create a slice canvas
  const sliceCanvas = document.createElement('canvas');
  sliceCanvas.width = sectionCanvas.width;
  sliceCanvas.height = Math.ceil(srcHPx);
  const ctx = sliceCanvas.getContext('2d');
  if (!ctx) return 0;

  ctx.drawImage(sectionCanvas, 0, srcYPx, sectionCanvas.width, srcHPx, 0, 0, sectionCanvas.width, srcHPx);

  const imgData = sliceCanvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', MARGIN, cursorY, CONTENT_WIDTH, placeMm);
  return placeMm;
}

/**
 * Generates a branded PDF from a DOM element using section-aware pagination.
 *
 * Instead of capturing one giant image and slicing blindly, this captures each
 * direct child of the target element individually. Sections are placed on pages
 * with intelligent break logic: a section only starts a new page if it won't fit
 * on the current one. Sections taller than a full page are sliced (overflow).
 *
 * Elements with [data-no-print] are skipped entirely.
 */
export async function exportToPdf(element: HTMLElement, options: ExportPdfOptions): Promise<void> {
  const { title, subtitle, filename = 'terrain-report', branding } = options;
  const isWhiteLabel = branding?.whiteLabel === true;
  const accentRgb = hexToRgb(branding?.primaryColor);
  const footerLabel = isWhiteLabel
    ? `CONFIDENTIAL — ${branding?.footerText || ''}`
    : `CONFIDENTIAL — ${branding?.footerText || 'Generated by Terrain (terrain.ambrosiaventures.co)'}`;

  // ── Apply light export theme for clean paper output ────
  const alreadyLight = element.classList.contains('export-light');
  if (!alreadyLight) {
    element.classList.add('export-light');
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }

  // Convert SVG charts to canvas for reliable capture
  const restoreSvgs = await svgToCanvas(element);

  try {
    // Ensure the element is visible and has dimensions before capture
    const computedStyle = window.getComputedStyle(element);
    const wasHidden = computedStyle.visibility === 'hidden' || computedStyle.display === 'none';
    if (wasHidden) {
      element.style.visibility = 'visible';
      element.style.display = 'block';
      void element.offsetHeight; // Force reflow
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }

    // ── Step 1: Collect sections (direct children, skip [data-no-print]) ──
    const children = Array.from(element.children) as HTMLElement[];
    const sections: CapturedSection[] = [];

    for (const child of children) {
      // Skip elements marked as no-print
      if (child.hasAttribute('data-no-print') || child.dataset.noPrint !== undefined) continue;
      // Skip invisible elements
      const childStyle = window.getComputedStyle(child);
      if (childStyle.display === 'none' || childStyle.visibility === 'hidden') continue;
      // Skip zero-height elements
      if (child.offsetHeight === 0) continue;

      const captured = await captureSection(child);
      if (captured.heightMm > 0) {
        sections.push(captured);
      }
    }

    // If no sections were captured, fall back to capturing the whole element
    if (sections.length === 0) {
      const wholeCaptured = await captureSection(element);
      if (wholeCaptured.heightMm > 0) {
        sections.push(wholeCaptured);
      }
    }

    if (sections.length === 0) {
      throw new Error('No content to export');
    }

    // ── Step 2: Plan pagination ──────────────────────────────────────
    // Walk through sections and determine page assignments.
    // Each entry: { sectionIndex, sourceOffsetMm, heightMm, pageIndex, cursorY }
    interface PageSlice {
      sectionIndex: number;
      sourceOffsetMm: number;
      heightMm: number;
    }
    const pages: PageSlice[][] = [[]];
    let currentPage = 0;
    let cursorMm = 0; // How much of the current page's content area is used

    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      const remaining = CONTENT_HEIGHT - cursorMm;

      if (section.heightMm <= remaining) {
        // Section fits on current page
        pages[currentPage].push({
          sectionIndex: si,
          sourceOffsetMm: 0,
          heightMm: section.heightMm,
        });
        cursorMm += section.heightMm;
      } else if (section.heightMm <= CONTENT_HEIGHT) {
        // Section doesn't fit here but fits on a fresh page — start new page
        currentPage++;
        pages[currentPage] = [];
        pages[currentPage].push({
          sectionIndex: si,
          sourceOffsetMm: 0,
          heightMm: section.heightMm,
        });
        cursorMm = section.heightMm;
      } else {
        // Section is taller than one full page — slice it across pages
        let offset = 0;
        let sectionRemaining = section.heightMm;

        // If there's some space on the current page, use it
        if (remaining > 20) {
          // Only start on current page if there's meaningful space (>20mm)
          const slice = Math.min(remaining, sectionRemaining);
          pages[currentPage].push({
            sectionIndex: si,
            sourceOffsetMm: offset,
            heightMm: slice,
          });
          offset += slice;
          sectionRemaining -= slice;
        }

        // Fill subsequent pages with slices
        while (sectionRemaining > 0) {
          currentPage++;
          pages[currentPage] = [];
          const slice = Math.min(CONTENT_HEIGHT, sectionRemaining);
          pages[currentPage].push({
            sectionIndex: si,
            sourceOffsetMm: offset,
            heightMm: slice,
          });
          offset += slice;
          sectionRemaining -= slice;
        }
        cursorMm = pages[currentPage].reduce((acc, s) => acc + s.heightMm, 0);
      }
    }

    const totalPages = pages.length;

    // ── Step 3: Build the PDF ────────────────────────────────────────
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    // PDF metadata
    pdf.setProperties({
      title: isWhiteLabel ? `${title} — Intelligence Report` : `${title} — Terrain Intelligence Report`,
      subject: subtitle || 'Market Intelligence Report',
      author: isWhiteLabel ? 'Intelligence Platform' : 'Terrain by Ambrosia Ventures',
      creator: isWhiteLabel ? 'Intelligence Platform' : 'Terrain (terrain.ambrosiaventures.co)',
      keywords: 'market intelligence, life sciences, biotech',
    });

    const dateString = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (pageIdx > 0) pdf.addPage();

      // Draw header
      await drawHeader(pdf, pageIdx, totalPages, title, subtitle, dateString, accentRgb, branding);

      // Place section slices on this page
      let y = CONTENT_TOP;
      for (const slice of pages[pageIdx]) {
        const section = sections[slice.sectionIndex];
        const placed = placeImage(pdf, section.canvas, y, slice.heightMm, slice.sourceOffsetMm, section.heightMm);
        y += placed;
      }

      // Draw footer
      drawFooter(pdf, pageIdx, totalPages, dateString, footerLabel, isWhiteLabel);
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    // Restore original SVG elements
    restoreSvgs();
    // Only remove the class if we added it
    if (!alreadyLight) {
      element.classList.remove('export-light');
    }
  }
}
