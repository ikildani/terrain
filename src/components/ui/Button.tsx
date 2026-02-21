import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  isLoading?: boolean;
}

const variantMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeMap = {
  sm: 'btn-sm',
  default: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn('btn', variantMap[variant], sizeMap[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
