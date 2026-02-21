import { cn } from '@/lib/utils/cn';

type BadgeVariant =
  | 'teal' | 'pro' | 'green' | 'amber' | 'red' | 'slate'
  | 'phase-approved' | 'phase-3' | 'phase-2' | 'phase-1' | 'phase-preclinical';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantMap: Record<BadgeVariant, string> = {
  teal: 'badge-teal',
  pro: 'badge-pro',
  green: 'badge-green',
  amber: 'badge-amber',
  red: 'badge-red',
  slate: 'badge-slate',
  'phase-approved': 'phase-badge phase-approved',
  'phase-3': 'phase-badge phase-3',
  'phase-2': 'phase-badge phase-2',
  'phase-1': 'phase-badge phase-1',
  'phase-preclinical': 'phase-badge phase-preclinical',
};

export function Badge({ variant = 'teal', className, children }: BadgeProps) {
  return (
    <span className={cn('badge', variantMap[variant], className)}>
      {children}
    </span>
  );
}
