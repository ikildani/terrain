'use client';

/**
 * Institutional-grade Excel export engine.
 * Produces branded, styled .xlsx files matching the quality
 * standard of a Goldman Sachs or Morgan Stanley research report.
 */

interface ExportBranding {
  logoUrl?: string | null;
  primaryColor?: string | null;
  footerText?: string | null;
}

interface ExportExcelOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  branding?: ExportBranding;
}

/** Convert a hex color string to ARGB format for ExcelJS. Returns teal default if invalid. */
function hexToArgb(hex: string | null | undefined, fallback: string = 'FF00C9A7'): string {
  if (!hex) return fallback;
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return fallback;
  const full =
    clean.length <= 4
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  return `FF${full.slice(0, 6).toUpperCase()}`;
}

// Brand colors
const TEAL = 'FF00C9A7';
const NAVY_950 = 'FF04080F';
const NAVY_800 = 'FF0D1B2E';
const SLATE_400 = 'FF94A3B8';
const WHITE = 'FFF0F4F8';

export async function exportToExcel(data: Record<string, unknown>[], options: ExportExcelOptions): Promise<void> {
  const ExcelJS = await import('exceljs');
  const { title, subtitle, filename = 'terrain-export', branding } = options;
  const accentColor = hexToArgb(branding?.primaryColor, TEAL);
  const footerLabel = branding?.footerText || 'terrain.ambrosiaventures.co  |  Ambrosia Ventures  |  CONFIDENTIAL';
  const brandHeader = branding?.logoUrl ? 'TERRAIN' : 'TERRAIN by Ambrosia Ventures';

  if (!data.length) return;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Terrain by Ambrosia Ventures';
  wb.created = new Date();

  const sheetName = (title || 'Report').slice(0, 31).replace(/[[\]*?/\\]/g, '');
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 6 }], // Freeze first 6 rows (header block)
  });

  const dataKeys = Object.keys(data[0]);
  const colCount = dataKeys.length;

  // ── Row 1: Brand header ────────────────────────────────
  const brandRow = ws.addRow([brandHeader]);
  ws.mergeCells(1, 1, 1, colCount);
  const brandCell = brandRow.getCell(1);
  brandCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: NAVY_950 } };
  brandCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
  brandCell.alignment = { vertical: 'middle' };
  brandRow.height = 28;

  // ── Row 2: Report title ────────────────────────────────
  const titleRow = ws.addRow([title]);
  ws.mergeCells(2, 1, 2, colCount);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: NAVY_950 } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

  // ── Row 3: Subtitle (if provided) ─────────────────────
  if (subtitle) {
    const subRow = ws.addRow([subtitle]);
    ws.mergeCells(3, 1, 3, colCount);
    const subCell = subRow.getCell(1);
    subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: SLATE_400 } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };
  } else {
    ws.addRow([]); // spacer
  }

  // ── Row 4: Date + confidential ─────────────────────────
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const metaRow = ws.addRow([`Generated ${dateStr}  |  CONFIDENTIAL`]);
  ws.mergeCells(4, 1, 4, colCount);
  const metaCell = metaRow.getCell(1);
  metaCell.font = { name: 'Calibri', size: 8, color: { argb: SLATE_400 } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WHITE } };

  // ── Row 5: Teal accent divider ─────────────────────────
  const dividerRow = ws.addRow([]);
  dividerRow.height = 4;
  for (let c = 1; c <= colCount; c++) {
    const cell = dividerRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
  }

  // ── Row 6: Column headers ──────────────────────────────
  const headerLabels = dataKeys.map((key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim(),
  );
  const headerRow = ws.addRow(headerLabels);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY_800 } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: TEAL } },
    };
  });

  // ── Data rows ──────────────────────────────────────────
  data.forEach((row, rowIdx) => {
    const values = dataKeys.map((k) => {
      const val = row[k];
      if (val == null) return '';
      // Preserve numbers as numbers for Excel formatting
      if (typeof val === 'number') return val;
      const str = String(val);
      // Try to parse numeric strings
      const num = Number(str);
      if (str !== '' && !isNaN(num) && isFinite(num)) return num;
      return str;
    });
    const dataRow = ws.addRow(values);

    // Alternate row shading for readability
    const isEven = rowIdx % 2 === 0;
    dataRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 9, color: { argb: 'FF1E293B' } };
      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
      cell.alignment = { vertical: 'middle' };

      // Number formatting
      if (typeof cell.value === 'number') {
        cell.font = { name: 'Consolas', size: 9, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        const absVal = Math.abs(cell.value as number);
        if (absVal >= 1_000_000) {
          cell.numFmt = '#,##0';
        } else if (absVal >= 1 && Number.isInteger(cell.value)) {
          cell.numFmt = '#,##0';
        } else if (absVal < 1 && absVal > 0) {
          cell.numFmt = '0.0%'; // Likely a percentage
        } else {
          cell.numFmt = '#,##0.00';
        }
      }
    });
  });

  // ── Auto-fit column widths ─────────────────────────────
  dataKeys.forEach((key, i) => {
    const col = ws.getColumn(i + 1);
    const headerLen = headerLabels[i].length;
    let maxLen = headerLen;
    data.forEach((row) => {
      const val = row[key];
      const len = val == null ? 0 : String(val).length;
      maxLen = Math.max(maxLen, len);
    });
    col.width = Math.min(Math.max(maxLen + 3, 10), 55);
  });

  // ── Footer row ─────────────────────────────────────────
  ws.addRow([]); // spacer
  const footerRow = ws.addRow(['terrain.ambrosiaventures.co  |  Ambrosia Ventures  |  CONFIDENTIAL']);
  ws.mergeCells(footerRow.number, 1, footerRow.number, colCount);
  const footerCell = footerRow.getCell(1);
  footerCell.font = { name: 'Calibri', size: 7, italic: true, color: { argb: SLATE_400 } };

  // ── Download ───────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
