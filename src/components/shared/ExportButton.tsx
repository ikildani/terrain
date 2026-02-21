'use client';

import { Download, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ExportButtonProps {
  format: 'pdf' | 'csv' | 'pptx';
  onExport?: () => void;
  isPro?: boolean;
  className?: string;
}

const formatLabels = { pdf: 'PDF', csv: 'CSV', pptx: 'PPTX' };

export function ExportButton({ format, onExport, isPro = false, className }: ExportButtonProps) {
  if (!isPro) {
    return (
      <button className={cn('btn btn-secondary opacity-50 cursor-not-allowed', className)} disabled>
        <Lock className="w-3.5 h-3.5" />
        Export {formatLabels[format]}
        <span className="badge-pro text-[8px] px-1 py-0">PRO</span>
      </button>
    );
  }

  return (
    <button onClick={onExport} className={cn('btn btn-secondary', className)}>
      <Download className="w-3.5 h-3.5" />
      Export {formatLabels[format]}
    </button>
  );
}
