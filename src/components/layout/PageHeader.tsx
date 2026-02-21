import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: 'Pro' | 'Team';
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">{title}</h1>
            {badge && (
              <span className={cn('badge', badge === 'Pro' ? 'badge-pro' : 'badge-teal')}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
