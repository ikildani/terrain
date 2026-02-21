'use client';

import { cn } from '@/lib/utils/cn';
import type { ProductCategory } from '@/types/devices-diagnostics';

interface ProductTypeSelectorProps {
  value: ProductCategory;
  onChange: (category: ProductCategory) => void;
}

const categories: { value: ProductCategory; label: string; description: string }[] = [
  {
    value: 'pharmaceutical',
    label: 'Pharmaceutical',
    description: 'Small molecule, biologic, RNA therapeutic',
  },
  {
    value: 'diagnostics_ivd',
    label: 'Diagnostics (IVD)',
    description: 'In vitro diagnostic test or assay',
  },
  {
    value: 'diagnostics_companion',
    label: 'Companion Diagnostic',
    description: 'CDx tied to a specific drug',
  },
  {
    value: 'device_implantable',
    label: 'Device — Implantable',
    description: 'Permanent or semi-permanent implant',
  },
  {
    value: 'device_surgical',
    label: 'Device — Surgical',
    description: 'Surgical instrument, robot, ablation',
  },
  {
    value: 'device_monitoring',
    label: 'Device — Monitoring',
    description: 'Wearable, CGM, remote monitoring',
  },
  {
    value: 'device_digital_health',
    label: 'Digital Health / SaMD',
    description: 'Software as a medical device',
  },
  {
    value: 'device_capital_equipment',
    label: 'Capital Equipment',
    description: 'MRI, CT, radiation, NGS platform',
  },
];

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <div>
      <label className="input-label">Product Category</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              'text-left px-3 py-2.5 rounded-md border transition-all text-sm',
              value === cat.value
                ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                : 'border-navy-700 bg-navy-800 text-slate-400 hover:border-navy-600 hover:bg-navy-700'
            )}
          >
            <div className="font-medium text-xs">{cat.label}</div>
            <div className="text-2xs text-slate-500 mt-0.5">{cat.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
