'use client';

import { Star, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReportTemplate } from '@/types';
import { REPORT_TYPE_COLORS, REPORT_TYPE_ROUTES, formatReportType } from '@/lib/constants/chart-colors';

interface TemplateCardProps {
  template: ReportTemplate;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}

export function TemplateCard({ template, onEdit, onDelete, canManage }: TemplateCardProps) {
  const router = useRouter();
  const badgeClass = REPORT_TYPE_COLORS[template.report_type] ?? REPORT_TYPE_COLORS.full;
  const route = REPORT_TYPE_ROUTES[template.report_type] ?? '/market-sizing';

  const handleUseTemplate = () => {
    const params = new URLSearchParams();
    params.set('template_id', template.id);
    // Encode common input fields as query params for pre-fill
    const inputs = template.inputs as Record<string, string>;
    if (inputs.indication) params.set('indication', inputs.indication);
    if (inputs.mechanism) params.set('mechanism', inputs.mechanism);
    router.push(`${route}?${params.toString()}`);
  };

  return (
    <div
      className="card group hover:border-teal-500/30 transition-all duration-200 cursor-pointer"
      onClick={handleUseTemplate}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${badgeClass}`}>
          {formatReportType(template.report_type)}
        </span>
        <div className="flex items-center gap-1">
          {template.is_default && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          {canManage && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded hover:bg-navy-800 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Edit template"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500 hover:text-teal-500 transition-colors" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded hover:bg-navy-800 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete template"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 transition-colors" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Name */}
      <h4 className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors line-clamp-2 mb-1">
        {template.name}
      </h4>

      {/* Description */}
      {template.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{template.description}</p>}

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-navy-700/30">
          {template.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-2xs font-mono px-1.5 py-0.5 rounded bg-navy-800/60 text-slate-500 border border-navy-700/30"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 5 && (
            <span className="text-2xs font-mono text-slate-600">+{template.tags.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
}
