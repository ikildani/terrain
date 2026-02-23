'use client';

import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ExportPdfOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Generates a branded PDF from a DOM element.
 * Applies a light export theme before capture, then captures as a
 * high-resolution image and places it in a letter-sized PDF with
 * institutional header and footer.
 */
export async function exportToPdf(
  element: HTMLElement,
  options: ExportPdfOptions
): Promise<void> {
  const { title, subtitle, filename = 'terrain-report' } = options;

  // ── Apply light export theme for clean paper output ────
  // If already in light mode (e.g., preview overlay), skip the toggle
  const alreadyLight = element.classList.contains('export-light');
  if (!alreadyLight) {
    element.classList.add('export-light');
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  }

  try {
    // Capture at 2x for retina clarity
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Letter size in mm
    const pageWidth = 215.9;
    const pageHeight = 279.4;
    const margin = 15;
    const headerHeight = 28;
    const footerHeight = 15;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2 - headerHeight - footerHeight;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    // ── PDF metadata ───────────────────────────────────────
    pdf.setProperties({
      title: `${title} — Terrain Intelligence Report`,
      subject: subtitle || 'Market Intelligence Report',
      author: 'Terrain by Ambrosia Ventures',
      creator: 'Terrain (terrain.ambrosiaventures.co)',
      keywords: 'market intelligence, life sciences, biotech, terrain',
    });

    // Scale image to fit content width
    const ratio = contentWidth / (imgWidth / 2); // /2 because scale=2
    const scaledHeight = (imgHeight / 2) * ratio;
    const totalPages = Math.ceil(scaledHeight / contentHeight);

    const dateString = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // ── Header ──────────────────────────────────────────
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, headerHeight + margin, 'F');

      // Brand
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(4, 8, 15); // navy-950
      pdf.text('TERRAIN', margin, margin + 8);

      // Separator
      pdf.setFontSize(8);
      pdf.setTextColor(0, 138, 116); // teal-600 (darker for print)
      pdf.text('by Ambrosia Ventures', margin + 30, margin + 8);

      // Report title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(4, 8, 15);
      pdf.text(title, margin, margin + 16);

      if (subtitle) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(subtitle, margin, margin + 21);
      }

      // Page number
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `Page ${page + 1} of ${totalPages}`,
        pageWidth - margin,
        margin + 8,
        { align: 'right' }
      );

      // Teal accent line
      pdf.setDrawColor(0, 138, 116);
      pdf.setLineWidth(0.5);
      pdf.line(margin, headerHeight + margin - 2, pageWidth - margin, headerHeight + margin - 2);

      // ── Content (cropped from the full image) ───────────
      const sourceY = page * contentHeight / ratio * 2;
      const sourceH = Math.min(contentHeight / ratio * 2, imgHeight - sourceY);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidth;
      pageCanvas.height = sourceH;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceH, 0, 0, imgWidth, sourceH);
        const pageImgData = pageCanvas.toDataURL('image/png');
        const sliceHeight = (sourceH / 2) * ratio;
        pdf.addImage(
          pageImgData,
          'PNG',
          margin,
          headerHeight + margin,
          contentWidth,
          sliceHeight
        );
      }

      // ── Footer ──────────────────────────────────────────
      const footerY = pageHeight - margin - 4;
      pdf.setDrawColor(209, 213, 219); // gray-300
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        'CONFIDENTIAL — Generated by Terrain (terrain.ambrosiaventures.co)',
        margin,
        footerY
      );
      pdf.text(dateString, pageWidth - margin, footerY, { align: 'right' });
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    // Only remove the class if we added it
    if (!alreadyLight) {
      element.classList.remove('export-light');
    }
  }
}
