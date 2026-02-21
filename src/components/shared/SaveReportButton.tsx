'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SaveReportButtonProps {
  reportId?: string;
  isSaved?: boolean;
  className?: string;
}

export function SaveReportButton({ isSaved: initialSaved = false, className }: SaveReportButtonProps) {
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      onClick={() => setSaved(!saved)}
      className={cn(
        'btn btn-ghost',
        saved ? 'text-teal-400' : 'text-slate-500',
        className
      )}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {saved ? 'Saved' : 'Save Report'}
    </button>
  );
}
