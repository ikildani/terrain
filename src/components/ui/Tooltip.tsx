'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5',
            'text-xs text-white bg-navy-700 border border-navy-600 rounded-md',
            'whitespace-nowrap z-50 animate-fade-in',
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
