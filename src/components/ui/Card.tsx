import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div className={cn(variant === 'elevated' ? 'card-elevated' : 'card', className)} {...props}>
      {children}
    </div>
  );
}
