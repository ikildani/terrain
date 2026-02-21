import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn('input', error && 'border-signal-red focus:border-signal-red', className)}
        {...props}
      />
      {error && <p className="text-xs text-signal-red mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
