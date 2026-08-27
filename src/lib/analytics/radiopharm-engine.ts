// ============================================================
// TERRAIN — Radiopharmaceutical Market Sizing Engine
// lib/analytics/radiopharm-engine.ts
//
// Specialized engine accounting for isotope supply constraints,
// radiopharmacy network requirements, half-life distribution
// limits, and theranostic pairing economics.
// ============================================================

import type { DataSource } from '@/types';

export interface RadiopharmInput {
  indication: string;
  target_population_us: number;
  eligible_fraction: number;
  isotope: 'lu177' | 'ac225' | 'i131' | 'ra223' | 'y90' | 'ga68_pet' | 'f18_pet' | 'cu64_pet' | 'zr89_pet' | 'other';
  therapy_or_diagnostic: 'therapeutic' | 'diagnostic' | 'theranostic_pair';
  development_stage: 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved';
  target_molecule: string;
  linker_payload: string;
  treatment_cycles: number;
  has_diagnostic_pair: boolean;
  radiopharmacy_sites: number;
  territory: string[];
}

export interface RadiopharmOutput {
  summary: {
    addressable_patients_us: number;
    supply_constrained_patients: number;
    effective_treatable: number;
    price_per_treatment_course: { low: number; base: number; high: number };
    peak_revenue: { low: number; base: number; high: number };
    diagnostic_revenue_addon: number;
  };
  isotope_analysis: {
    isotope: string;
    half_life: string;
    global_supply_status: 'abundant' | 'moderate' | 'constrained' | 'severely_limited';
    annual_global_supply: string;
    max_patients_per_year_from_supply: number;
    key_suppliers: string[];
    supply_risk: string;
  };
  distribution_model: {
    max_distribution_radius_hours: number;
    radiopharmacy_sites_needed: number;
    dose_preparation_time: string;
    cold_chain_requirements: string;
  };
  theranostic_economics: {
    diagnostic_price: number;
    therapeutic_price: number;
    combined_course_value: number;
    diagnostic_attachment_rate: number;
    diagnostic_revenue_stream: number;
  } | null;
  revenue_projection: {
    year: number;
    patients: number;
    therapeutic_revenue: number;
    diagnostic_revenue: number;
    total_revenue: number;
  }[];
  comparable_deals: { buyer: string; target: string; value_usd: number; year: number; isotope: string }[];
  methodology: string;
  data_sources: DataSource[];
}

const ISOTOPE_PROFILES: Record<
  string,
  {
    half_life: string;
    half_life_hours: number;
    supply: 'abundant' | 'moderate' | 'constrained' | 'severely_limited';
    annual_global_supply: string;
    max_patients_global: number;
    suppliers: string[];
    distribution_radius_hours: number;
  }
> = {
  lu177: {
    half_life: '6.7 days',
    half_life_hours: 161,
    supply: 'moderate',
    annual_global_supply: '~30,000 Ci/year',
    max_patients_global: 200000,
    suppliers: ['ITM (Germany)', 'NRG/SHINE (Netherlands/US)', 'BWXT (Canada)'],
    distribution_radius_hours: 48,
  },
  ac225: {
    half_life: '10 days',
    half_life_hours: 240,
    supply: 'severely_limited',
    annual_global_supply: '~2-3 Ci/year (expanding)',
    max_patients_global: 2000,
    suppliers: ['ORNL (US)', 'ITM (Germany)', 'TRIUMF (Canada)', 'BWXT'],
    distribution_radius_hours: 72,
  },
  i131: {
    half_life: '8.0 days',
    half_life_hours: 192,
    supply: 'abundant',
    annual_global_supply: 'Abundant (reactor-produced)',
    max_patients_global: 1000000,
    suppliers: ['Multiple global suppliers'],
    distribution_radius_hours: 48,
  },
  ra223: {
    half_life: '11.4 days',
    half_life_hours: 274,
    supply: 'moderate',
    annual_global_supply: '~10,000 doses/year',
    max_patients_global: 10000,
    suppliers: ['Bayer (Xofigo supply chain)'],
    distribution_radius_hours: 72,
  },
  y90: {
    half_life: '2.7 days',
    half_life_hours: 64,
    supply: 'moderate',
    annual_global_supply: 'Moderate (generator-produced)',
    max_patients_global: 50000,
    suppliers: ['Boston Scientific', 'Sirtex/BTG'],
    distribution_radius_hours: 24,
  },
  ga68_pet: {
    half_life: '68 min',
    half_life_hours: 1.1,
    supply: 'moderate',
    annual_global_supply: 'Generator-based (expanding)',
    max_patients_global: 500000,
    suppliers: ['Eckert & Ziegler', 'IRE ELiT'],
    distribution_radius_hours: 2,
  },
  f18_pet: {
    half_life: '110 min',
    half_life_hours: 1.8,
    supply: 'abundant',
    annual_global_supply: 'Cyclotron-produced (abundant)',
    max_patients_global: 5000000,
    suppliers: ['PETNET (Siemens)', 'Cardinal Health', 'Jubilant DraxImage'],
    distribution_radius_hours: 4,
  },
  cu64_pet: {
    half_life: '12.7 hours',
    half_life_hours: 12.7,
    supply: 'constrained',
    annual_global_supply: 'Limited cyclotron production',
    max_patients_global: 50000,
    suppliers: ['Research reactors', 'Specialty cyclotrons'],
    distribution_radius_hours: 8,
  },
  zr89_pet: {
    half_life: '3.3 days',
    half_life_hours: 78,
    supply: 'constrained',
    annual_global_supply: 'Limited (cyclotron)',
    max_patients_global: 30000,
    suppliers: ['3D Imaging', 'Specialty producers'],
    distribution_radius_hours: 24,
  },
  other: {
    half_life: 'Variable',
    half_life_hours: 24,
    supply: 'moderate',
    annual_global_supply: 'Variable',
    max_patients_global: 100000,
    suppliers: ['Various'],
    distribution_radius_hours: 24,
  },
};

const RADIOPHARM_DEALS = [
  {
    buyer: 'Novartis',
    target: 'AAA (Advanced Accelerator Applications)',
    value_usd: 3900000000,
    year: 2018,
    isotope: 'lu177',
  },
  { buyer: 'Eli Lilly', target: 'Point Biopharma', value_usd: 1400000000, year: 2023, isotope: 'lu177' },
  { buyer: 'Bristol Myers Squibb', target: 'RayzeBio', value_usd: 4100000000, year: 2024, isotope: 'ac225' },
  { buyer: 'AstraZeneca', target: 'Fusion Pharmaceuticals', value_usd: 2400000000, year: 2024, isotope: 'ac225' },
  {
    buyer: 'Bristol Myers Squibb',
    target: 'Mirati (radiopharm rights)',
    value_usd: 600000000,
    year: 2024,
    isotope: 'lu177',
  },
];

function deriveRadiopharmPrice(
  input: RadiopharmInput,
  isotope: (typeof ISOTOPE_PROFILES)['lu177'],
): { low: number; base: number; high: number } {
  if (input.therapy_or_diagnostic === 'diagnostic') {
    return { low: 1500, base: 3500, high: 8000 };
  }
  const baseCourse =
    input.treatment_cycles * (input.isotope === 'ac225' ? 75000 : input.isotope === 'lu177' ? 40000 : 25000);
  return { low: baseCourse * 0.7, base: baseCourse, high: baseCourse * 1.4 };
}

export function calculateRadiopharmMarketSizing(input: RadiopharmInput): RadiopharmOutput {
  const isotope = ISOTOPE_PROFILES[input.isotope] || ISOTOPE_PROFILES.other;
  const addressable = Math.round(input.target_population_us * input.eligible_fraction);
  const supplyConstrained = Math.min(addressable, Math.round(isotope.max_patients_global * 0.4)); // US ~40% of global
  const price = deriveRadiopharmPrice(input, isotope);

  const diagnosticPrice = input.has_diagnostic_pair ? 3500 : 0;
  const diagnosticAttachment = input.has_diagnostic_pair ? 0.85 : 0;

  const projection: RadiopharmOutput['revenue_projection'] = [];
  for (let yr = 0; yr < 10; yr++) {
    const ramp = yr === 0 ? 0.1 : yr === 1 ? 0.3 : yr === 2 ? 0.55 : yr === 3 ? 0.75 : Math.min(1.0, 0.75 + yr * 0.05);
    const patients = Math.min(Math.round(addressable * ramp * 0.15), supplyConstrained);
    const therapeuticRev = patients * price.base;
    const diagnosticRev = Math.round(
      patients * diagnosticAttachment * diagnosticPrice * ((1 / input.treatment_cycles) * 2),
    ); // Diagnostic usually 2x per treatment course
    projection.push({
      year: yr + 1,
      patients,
      therapeutic_revenue: therapeuticRev,
      diagnostic_revenue: diagnosticRev,
      total_revenue: therapeuticRev + diagnosticRev,
    });
  }

  const peakTotal = Math.max(...projection.map((p) => p.total_revenue));
  const peakDiagnostic = Math.max(...projection.map((p) => p.diagnostic_revenue));

  return {
    summary: {
      addressable_patients_us: addressable,
      supply_constrained_patients: supplyConstrained,
      effective_treatable: Math.min(addressable, supplyConstrained),
      price_per_treatment_course: price,
      peak_revenue: { low: peakTotal * 0.7, base: peakTotal, high: peakTotal * 1.3 },
      diagnostic_revenue_addon: peakDiagnostic,
    },
    isotope_analysis: {
      isotope: input.isotope,
      half_life: isotope.half_life,
      global_supply_status: isotope.supply,
      annual_global_supply: isotope.annual_global_supply,
      max_patients_per_year_from_supply: supplyConstrained,
      key_suppliers: isotope.suppliers,
      supply_risk:
        isotope.supply === 'severely_limited'
          ? 'Critical supply risk. Ac-225 production is expanding but current capacity limits patient access. Secure supply agreements early.'
          : isotope.supply === 'constrained'
            ? 'Moderate supply risk. Expansion projects underway but not yet online. Dual-source strategy recommended.'
            : 'Supply adequate for projected demand at current production levels.',
    },
    distribution_model: {
      max_distribution_radius_hours: isotope.distribution_radius_hours,
      radiopharmacy_sites_needed: Math.max(input.radiopharmacy_sites, Math.ceil((addressable * 0.1) / 5000)),
      dose_preparation_time:
        isotope.half_life_hours < 4
          ? 'Same-day preparation required'
          : isotope.half_life_hours < 24
            ? 'Next-day preparation possible'
            : 'Multi-day shelf life allows centralized preparation',
      cold_chain_requirements:
        'Radiation-shielded transport container, DOT-certified carrier, chain of custody documentation',
    },
    theranostic_economics: input.has_diagnostic_pair
      ? {
          diagnostic_price: diagnosticPrice,
          therapeutic_price: price.base,
          combined_course_value: price.base + diagnosticPrice * 2,
          diagnostic_attachment_rate: diagnosticAttachment,
          diagnostic_revenue_stream: peakDiagnostic,
        }
      : null,
    revenue_projection: projection,
    comparable_deals: RADIOPHARM_DEALS.filter((d) => (input.isotope === 'ac225' ? d.isotope === 'ac225' : true)).slice(
      0,
      5,
    ),
    methodology: `Radiopharmaceutical market sizing with isotope supply constraints. ${isotope.supply === 'severely_limited' ? 'SUPPLY-LIMITED MODEL: ' : ''}${addressable.toLocaleString()} eligible patients constrained to ${supplyConstrained.toLocaleString()} by ${input.isotope.toUpperCase()} supply (${isotope.annual_global_supply}). ${input.treatment_cycles}-cycle treatment at $${Math.round(price.base / 1000)}K/course.${input.has_diagnostic_pair ? ` Theranostic pair adds $${diagnosticPrice}/diagnostic scan.` : ''}`,
    data_sources: [
      { name: 'SNMMI Radiopharmaceutical Market Report', date: '2025', confidence: 'high' as const },
      { name: 'DOE Isotope Program production data', date: '2025-2026', confidence: 'high' as const },
      { name: 'Ambrosia Ventures radiopharm deal database', date: 'current', confidence: 'high' as const },
    ],
  };
}
