import { cn } from '@/lib/utils/cn';
import { ExternalLink } from 'lucide-react';

interface DataSourceBadgeProps {
  source: string;
  type?: 'public' | 'proprietary' | 'licensed';
  url?: string;
  className?: string;
}

const typeColors = {
  public: 'text-signal-green',
  proprietary: 'text-teal-400',
  licensed: 'text-signal-amber',
};

export function DataSourceBadge({ source, type = 'public', url, className }: DataSourceBadgeProps) {
  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-2xs font-mono',
        typeColors[type],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {source}
      {url && <ExternalLink className="w-2.5 h-2.5" />}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {content}
      </a>
    );
  }

  return content;
}
