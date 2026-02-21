import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
  noise?: boolean;
}

export function Card({ className, variant = 'default', noise, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === 'elevated' ? 'card-elevated' : 'card',
        noise && 'noise',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
