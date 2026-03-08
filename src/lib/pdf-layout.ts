// ── PDF Layout Constants (shared with preview overlay for WYSIWYG) ──
// Extracted to avoid pulling html2canvas-pro and jspdf into the client bundle
// when only the layout constants are needed.

export const PDF_LAYOUT = {
  pageWidth: 215.9, // mm — Letter width
  pageHeight: 279.4, // mm — Letter height
  margin: 15, // mm — all sides
  headerHeight: 28, // mm
  footerHeight: 15, // mm
  contentWidth: 185.9, // pageWidth - margin*2
  contentHeight: 206.4, // pageHeight - margin*2 - headerHeight - footerHeight
  teal: 'rgb(0, 138, 116)',
  navy950: 'rgb(4, 8, 15)',
  slate500: 'rgb(100, 116, 139)',
  gray300: 'rgb(209, 213, 219)',
} as const;
