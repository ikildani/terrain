'use client';

import { useState } from 'react';
import { Download, Lock, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface ExportButtonProps {
  format: 'pdf' | 'csv' | 'email';
  data?: Record<string, unknown>[];
  filename?: string;
  className?: string;
  /** The DOM element to capture for PDF export. If omitted, captures the report section. */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** Report title for the PDF header. */
  reportTitle?: string;
  /** Report subtitle for the PDF header. */
  reportSubtitle?: string;
  /** When provided, clicking PDF export opens preview instead of generating immediately. */
  onPdfExport?: () => void;
}

const formatLabels = { pdf: 'PDF', csv: 'CSV', email: 'Email Report' };

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val == null ? '' : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(','),
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton({
  format,
  data,
  filename = 'terrain-export',
  className,
  targetRef,
  reportTitle,
  reportSubtitle,
  onPdfExport,
}: ExportButtonProps) {
  const { isPro, isTeam } = useSubscription();
  const canExport = isPro || isTeam;
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      if (format === 'csv' && data) {
        exportCSV(data, filename);
      } else if (format === 'pdf') {
        if (onPdfExport) {
          // Open preview overlay instead of generating immediately
          onPdfExport();
          setIsExporting(false);
          return;
        }
        // Fallback: direct export (when no preview handler provided)
        const target = targetRef?.current || document.querySelector('[data-report-content]');
        if (target) {
          const { exportToPdf } = await import('@/lib/export-pdf');
          await exportToPdf(target as HTMLElement, {
            title: reportTitle || 'Market Intelligence Report',
            subtitle: reportSubtitle,
            filename,
          });
        } else {
          window.print();
        }
      } else if (format === 'email') {
        const res = await fetch('/api/email/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportTitle, reportSubtitle }),
        });
        const result = await res.json();
        if (result.success) {
          toast.success('Report sent to your email');
        } else {
          toast.error(result.error || 'Failed to send email');
        }
      }
    } catch {
      toast.error(format === 'email' ? 'Failed to send email' : 'Export failed. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  }

  if (!canExport) {
    return (
      <button className={cn('btn btn-secondary opacity-50 cursor-not-allowed', className)} disabled>
        <Lock className="w-3.5 h-3.5" />
        {format === 'email' ? 'Email Report' : `Export ${formatLabels[format]}`}
        <span className="badge-pro text-[8px] px-1 py-0">PRO</span>
      </button>
    );
  }

  const Icon = format === 'email' ? Mail : Download;
  const label = format === 'email' ? 'Email Report' : `Export ${formatLabels[format]}`;
  const loadingLabel = format === 'email' ? 'Sending...' : 'Generating...';

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || (format === 'csv' && (!data || data.length === 0))}
      className={cn('btn btn-secondary', className)}
    >
      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {isExporting ? loadingLabel : label}
    </button>
  );
}
