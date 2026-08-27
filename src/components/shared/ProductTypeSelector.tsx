'use client';

import { cn } from '@/lib/utils/cn';
import type { ProductCategory } from '@/types/devices-diagnostics';

interface ProductTypeSelectorProps {
  value: ProductCategory;
  onChange: (category: ProductCategory) => void;
}

const categories: { value: ProductCategory; label: string; description: string; group: string }[] = [
  // Therapeutics
  {
    value: 'pharmaceutical',
    label: 'Pharmaceutical',
    description: 'Small molecule, biologic, RNA therapeutic',
    group: 'Therapeutics',
  },
  {
    value: 'biosimilar',
    label: 'Biosimilar',
    description: 'Follow-on biologic, 351(k) pathway',
    group: 'Therapeutics',
  },
  {
    value: 'cell_gene_therapy',
    label: 'Cell & Gene Therapy',
    description: 'CAR-T, gene therapy, iPSC, gene editing',
    group: 'Therapeutics',
  },
  {
    value: 'radiopharmaceutical',
    label: 'Radiopharmaceutical',
    description: 'Theranostics, Lu-177, Ac-225, PET tracers',
    group: 'Therapeutics',
  },
  {
    value: 'nutraceutical',
    label: 'Nutraceutical / Consumer Health',
    description: 'Supplement, OTC, longevity, functional food',
    group: 'Therapeutics',
  },
  // Platforms & Services
  {
    value: 'drug_delivery_platform',
    label: 'Drug Delivery Platform',
    description: 'LNP, liposomal, GalNAc, depot formulation',
    group: 'Platforms',
  },
  {
    value: 'cdmo_partnership',
    label: 'CDMO / CMO',
    description: 'Manufacturing partner matching',
    group: 'Platforms',
  },
  // Diagnostics
  {
    value: 'diagnostics_ivd',
    label: 'Diagnostics (IVD)',
    description: 'In vitro diagnostic test or assay',
    group: 'Diagnostics',
  },
  {
    value: 'diagnostics_companion',
    label: 'Companion Diagnostic',
    description: 'CDx tied to a specific drug',
    group: 'Diagnostics',
  },
  // Devices
  {
    value: 'device_implantable',
    label: 'Device — Implantable',
    description: 'Permanent or semi-permanent implant',
    group: 'Devices',
  },
  {
    value: 'device_surgical',
    label: 'Device — Surgical',
    description: 'Surgical instrument, robot, ablation',
    group: 'Devices',
  },
  {
    value: 'device_monitoring',
    label: 'Device — Monitoring',
    description: 'Wearable, CGM, remote monitoring',
    group: 'Devices',
  },
  {
    value: 'device_digital_health',
    label: 'Digital Health / SaMD',
    description: 'Software as a medical device',
    group: 'Devices',
  },
  {
    value: 'device_capital_equipment',
    label: 'Capital Equipment',
    description: 'MRI, CT, radiation, NGS platform',
    group: 'Devices',
  },
];

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  const groups = Array.from(new Set(categories.map((c) => c.group)));

  return (
    <div>
      <label className="input-label">Product Category</label>
      {groups.map((group) => (
        <div key={group} className="mt-3">
          <div className="text-2xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">{group}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {categories
              .filter((c) => c.group === group)
              .map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => onChange(cat.value)}
                  className={cn(
                    'text-left px-3 py-2 rounded border transition-all text-sm',
                    value === cat.value
                      ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                      : 'border-navy-700 bg-navy-800 text-slate-400 hover:border-navy-600 hover:bg-navy-700',
                  )}
                >
                  <div className="font-medium text-xs">{cat.label}</div>
                  <div className="text-2xs text-slate-500 mt-0.5">{cat.description}</div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
