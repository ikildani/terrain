'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { ReportTemplate } from '@/types';

const REPORT_TYPES = [
  { value: 'market_sizing', label: 'Market Sizing' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'regulatory', label: 'Regulatory' },
  { value: 'partners', label: 'Partners' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'full', label: 'Full Report' },
  { value: 'device_market_sizing', label: 'Device Market Sizing' },
  { value: 'cdx_market_sizing', label: 'CDx Market Sizing' },
  { value: 'nutraceutical_market_sizing', label: 'Nutraceutical' },
] as const;

const COMMON_INPUT_FIELDS = [
  { key: 'indication', label: 'Indication', placeholder: 'e.g., Non-Small Cell Lung Cancer' },
  { key: 'mechanism', label: 'Mechanism of Action', placeholder: 'e.g., KRAS G12C inhibitor' },
  { key: 'geography', label: 'Geography', placeholder: 'e.g., US, EU5' },
  { key: 'development_stage', label: 'Development Stage', placeholder: 'e.g., Phase 2' },
  { key: 'patient_segment', label: 'Patient Segment', placeholder: 'e.g., 2L+ after platinum-based chemo' },
];

interface TemplateEditorProps {
  workspaceId: string;
  template?: ReportTemplate;
  onSave: () => void;
  onCancel: () => void;
}

export function TemplateEditor({ workspaceId, template, onSave, onCancel }: TemplateEditorProps) {
  const isEditing = !!template;

  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [reportType, setReportType] = useState(template?.report_type ?? 'market_sizing');
  const [tagsInput, setTagsInput] = useState((template?.tags ?? []).join(', '));
  const [isDefault, setIsDefault] = useState(template?.is_default ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // Build inputs from common fields
  const existingInputs = (template?.inputs ?? {}) as Record<string, string>;
  const [inputValues, setInputValues] = useState<Record<string, string>>(
    COMMON_INPUT_FIELDS.reduce(
      (acc, f) => {
        acc[f.key] = existingInputs[f.key] ?? '';
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  const handleInputChange = useCallback((key: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error('Template name is required');
        return;
      }

      setIsSaving(true);

      // Build inputs, filtering out empty values
      const inputs: Record<string, string> = {};
      for (const [key, value] of Object.entries(inputValues)) {
        if (value.trim()) {
          inputs[key] = value.trim();
        }
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        report_type: reportType,
        inputs,
        tags,
        is_default: isDefault,
      };

      try {
        const url = isEditing
          ? `/api/workspaces/${workspaceId}/templates/${template.id}`
          : `/api/workspaces/${workspaceId}/templates`;

        const res = await fetch(url, {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error ?? 'Failed to save template');
          return;
        }

        toast.success(isEditing ? 'Template updated' : 'Template created');
        onSave();
      } catch {
        toast.error('Failed to save template');
      } finally {
        setIsSaving(false);
      }
    },
    [name, description, reportType, inputValues, tagsInput, isDefault, isEditing, workspaceId, template, onSave],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card noise w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-white">{isEditing ? 'Edit Template' : 'Create Template'}</h2>
          <button onClick={onCancel} className="p-1 rounded hover:bg-navy-800 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label text-slate-400 mb-1 block">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
              placeholder="Template name"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label text-slate-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all resize-none"
              placeholder="Brief description of this template"
            />
          </div>

          {/* Report Type */}
          <div>
            <label className="label text-slate-400 mb-1 block">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pre-filled inputs */}
          <div>
            <label className="label text-slate-400 mb-2 block">Pre-filled Inputs</label>
            <div className="space-y-3">
              {COMMON_INPUT_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="text-2xs font-mono text-slate-600 mb-0.5 block">{field.label}</label>
                  <input
                    type="text"
                    value={inputValues[field.key] ?? ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full px-3 py-1.5 bg-navy-900/40 border border-navy-700/30 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label text-slate-400 mb-1 block">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-navy-900/60 border border-navy-700/40 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
              placeholder="Comma-separated tags, e.g., oncology, phase-2"
            />
          </div>

          {/* Default toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDefault(!isDefault)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                isDefault ? 'bg-teal-500' : 'bg-navy-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isDefault ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-sm text-slate-400">Set as default for this report type</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-navy-700/30">
            <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSaving || !name.trim()} className="btn btn-primary btn-sm">
              {isSaving ? 'Saving...' : isEditing ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
