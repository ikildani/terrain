'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
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

export function SaveReportButton({
  reportData,
  isSaved: initialSaved = false,
  className,
}: SaveReportButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSave() {
    if (saved || !reportData) return;
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        setSaved(true);
        setFeedback('Report saved');
      } else {
        const json = await res.json().catch(() => null);
        const msg = json?.error || `Save failed (${res.status})`;
        setFeedback(msg);
      }
    } catch {
      setFeedback('Network error — try again');
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        onClick={handleSave}
        disabled={isLoading || saved}
        className={cn(
          'btn btn-ghost',
          saved ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300',
          className
        )}
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
      {feedback && (
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-slate-400 bg-navy-800 border border-navy-700 rounded px-2 py-1 animate-fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
