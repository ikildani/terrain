import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, label, showValue, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && <span className="metric text-xs text-slate-300">{value}/{max}</span>}
        </div>
      )}
      <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
