import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description: string | React.ReactNode;
  /** Optional CTA button */
  cta?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  /** Use compact variant inside cards/sections (no card wrapper) */
  variant?: 'card' | 'inline';
  className?: string;
}

export function EmptyState({ icon: Icon, heading, description, cta, variant = 'card', className }: EmptyStateProps) {
  const CtaIcon = cta?.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        variant === 'card' && 'card noise p-12',
        variant === 'inline' && 'py-10',
        className,
      )}
    >
      <Icon className={cn('mb-4 text-navy-600', variant === 'card' ? 'w-12 h-12' : 'w-10 h-10')} />
      <h3 className={cn('font-display mb-2', variant === 'card' ? 'text-lg text-white' : 'text-sm text-slate-400')}>
        {heading}
      </h3>
      <p className={cn('text-sm text-slate-500 max-w-md', cta && 'mb-6')}>{description}</p>
      {cta && (
        <Link href={cta.href} className="btn btn-primary btn-sm inline-flex items-center gap-2">
          {CtaIcon && <CtaIcon className="w-4 h-4" />}
          {cta.label}
        </Link>
      )}
    </div>
  );
}
