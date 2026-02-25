'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

interface ReportData {
  title: string;
  report_type: string;
  indication: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

interface SaveReportButtonProps {
  reportData?: ReportData;
  isSaved?: boolean;
  className?: string;
}

export function SaveReportButton({ reportData, isSaved: initialSaved = false, className }: SaveReportButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    if (saved || !reportData) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        setSaved(true);
        toast.success('Report saved');
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error || `Save failed (${res.status})`);
      }
    } catch {
      toast.error('Network error — try again');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading || saved}
      className={cn('btn btn-ghost', saved ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300', className)}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {saved ? 'Saved' : 'Save Report'}
    </button>
  );
}
