'use client';

import { Star, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReportTemplate } from '@/types';

const REPORT_TYPE_COLORS: Record<string, string> = {
  market_sizing: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  competitive: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  regulatory: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  partners: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pipeline: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  full: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  device_market_sizing: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  cdx_market_sizing: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  nutraceutical_market_sizing: 'bg-lime-500/15 text-lime-400 border-lime-500/20',
};

const REPORT_TYPE_ROUTES: Record<string, string> = {
  market_sizing: '/market-sizing',
  competitive: '/competitive',
  regulatory: '/regulatory',
  partners: '/partners',
  pipeline: '/pipeline',
  device_market_sizing: '/market-sizing',
  cdx_market_sizing: '/market-sizing',
  nutraceutical_market_sizing: '/market-sizing',
};

function formatReportType(reportType: string): string {
  return reportType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

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
      className="card noise group hover:border-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-teal-sm cursor-pointer"
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
