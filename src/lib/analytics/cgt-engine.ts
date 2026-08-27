// ============================================================
// TERRAIN — Cell & Gene Therapy Market Sizing Engine
// lib/analytics/cgt-engine.ts
//
// Specialized engine for one-time/curative therapies with
// manufacturing constraints, vein-to-vein modeling, and
// $1-3.5M pricing economics.
// ============================================================

import type { DataSource } from '@/types';

export interface CGTInput {
  indication: string;
  therapy_type:
    | 'car_t_autologous'
    | 'car_t_allogeneic'
    | 'gene_therapy_aav'
    | 'gene_therapy_lentiviral'
    | 'gene_editing'
    | 'ipsc_derived'
    | 'msc'
    | 'nk_cell'
    | 'tcr_t';
  target_population_us: number;
  eligible_fraction: number; // % of patients who qualify (biomarker, prior therapies, age)
  development_stage: 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved';
  pricing_strategy: 'outcomes_based' | 'cost_plus' | 'value_based' | 'reference';
  target_price?: number;
  territory: string[];
  manufacturing_sites: number;
  annual_manufacturing_capacity_per_site: number;
}

export interface CGTOutput {
  summary: {
    addressable_patients_us: number;
    treatable_patients_year1: number;
    peak_treatable_per_year: number;
    manufacturing_bottleneck_year: number | null;
    price_per_patient: { low: number; base: number; high: number };
    peak_revenue: { low: number; base: number; high: number };
  };
  manufacturing_model: {
    type: 'autologous' | 'allogeneic';
    cogs_per_patient: { low: number; base: number; high: number };
    vein_to_vein_days: { low: number; base: number; high: number };
    manufacturing_success_rate: number;
    capacity_limited_patients_per_year: number;
    scale_up_investment: string;
  };
  pricing_analysis: {
    recommended_price: number;
    pricing_rationale: string;
    comparables: { product: string; price: number; indication: string; year: number }[];
    payer_considerations: string[];
    outcomes_based_discount: number;
  };
  revenue_projection: {
    year: number;
    patients_treated: number;
    revenue: number;
    cumulative_revenue: number;
    manufacturing_utilization: number;
  }[];
  patient_dynamics: {
    incident_patients_per_year: number;
    prevalent_backlog: number;
    backlog_clearance_years: number;
    annual_growth_rate: number;
  };
  methodology: string;
  data_sources: DataSource[];
}

const CGT_PROFILES: Record<
  string,
  {
    autologous: boolean;
    cogs_low: number;
    cogs_base: number;
    cogs_high: number;
    vein_to_vein_low: number;
    vein_to_vein_base: number;
    vein_to_vein_high: number;
    success_rate: number;
    patients_per_site_year: number;
  }
> = {
  car_t_autologous: {
    autologous: true,
    cogs_low: 250000,
    cogs_base: 375000,
    cogs_high: 500000,
    vein_to_vein_low: 21,
    vein_to_vein_base: 28,
    vein_to_vein_high: 42,
    success_rate: 0.9,
    patients_per_site_year: 500,
  },
  car_t_allogeneic: {
    autologous: false,
    cogs_low: 30000,
    cogs_base: 60000,
    cogs_high: 100000,
    vein_to_vein_low: 1,
    vein_to_vein_base: 3,
    vein_to_vein_high: 7,
    success_rate: 0.95,
    patients_per_site_year: 5000,
  },
  gene_therapy_aav: {
    autologous: false,
    cogs_low: 50000,
    cogs_base: 150000,
    cogs_high: 300000,
    vein_to_vein_low: 1,
    vein_to_vein_base: 1,
    vein_to_vein_high: 1,
    success_rate: 0.98,
    patients_per_site_year: 2000,
  },
  gene_therapy_lentiviral: {
    autologous: true,
    cogs_low: 150000,
    cogs_base: 250000,
    cogs_high: 400000,
    vein_to_vein_low: 14,
    vein_to_vein_base: 21,
    vein_to_vein_high: 35,
    success_rate: 0.92,
    patients_per_site_year: 800,
  },
  gene_editing: {
    autologous: true,
    cogs_low: 200000,
    cogs_base: 350000,
    cogs_high: 500000,
    vein_to_vein_low: 14,
    vein_to_vein_base: 28,
    vein_to_vein_high: 42,
    success_rate: 0.88,
    patients_per_site_year: 400,
  },
  ipsc_derived: {
    autologous: false,
    cogs_low: 20000,
    cogs_base: 50000,
    cogs_high: 80000,
    vein_to_vein_low: 1,
    vein_to_vein_base: 2,
    vein_to_vein_high: 5,
    success_rate: 0.95,
    patients_per_site_year: 10000,
  },
  msc: {
    autologous: false,
    cogs_low: 15000,
    cogs_base: 30000,
    cogs_high: 60000,
    vein_to_vein_low: 1,
    vein_to_vein_base: 1,
    vein_to_vein_high: 3,
    success_rate: 0.97,
    patients_per_site_year: 8000,
  },
  nk_cell: {
    autologous: false,
    cogs_low: 25000,
    cogs_base: 55000,
    cogs_high: 90000,
    vein_to_vein_low: 1,
    vein_to_vein_base: 2,
    vein_to_vein_high: 5,
    success_rate: 0.94,
    patients_per_site_year: 6000,
  },
  tcr_t: {
    autologous: true,
    cogs_low: 200000,
    cogs_base: 350000,
    cogs_high: 500000,
    vein_to_vein_low: 18,
    vein_to_vein_base: 28,
    vein_to_vein_high: 40,
    success_rate: 0.89,
    patients_per_site_year: 600,
  },
};

const CGT_PRICE_COMPARABLES = [
  {
    product: 'Casgevy (Vertex/CRISPR)',
    price: 2200000,
    indication: 'Sickle cell disease / beta-thalassemia',
    year: 2024,
  },
  { product: 'Lyfgenia (bluebird bio)', price: 3100000, indication: 'Sickle cell disease', year: 2024 },
  { product: 'Zolgensma (Novartis)', price: 2125000, indication: 'Spinal muscular atrophy', year: 2019 },
  { product: 'Hemgenix (CSL Behring)', price: 3500000, indication: 'Hemophilia B', year: 2022 },
  { product: 'Yescarta (Kite/Gilead)', price: 424000, indication: 'DLBCL', year: 2017 },
  { product: 'Kymriah (Novartis)', price: 475000, indication: 'ALL / DLBCL', year: 2017 },
  { product: 'Tecartus (Kite/Gilead)', price: 373000, indication: 'MCL', year: 2020 },
  { product: 'Breyanzi (BMS)', price: 410300, indication: 'LBCL', year: 2021 },
  { product: 'Abecma (BMS/2seventy)', price: 419500, indication: 'Multiple myeloma', year: 2021 },
  { product: 'Carvykti (J&J/Legend)', price: 465000, indication: 'Multiple myeloma', year: 2022 },
  { product: 'Elevidys (Sarepta)', price: 3200000, indication: 'Duchenne MD', year: 2023 },
  { product: 'Luxturna (Spark/Roche)', price: 850000, indication: 'Inherited retinal dystrophy', year: 2018 },
  { product: 'Skysona (bluebird bio)', price: 3000000, indication: 'Cerebral adrenoleukodystrophy', year: 2022 },
];

function derivePrice(
  input: CGTInput,
  profile: (typeof CGT_PROFILES)['car_t_autologous'],
): { low: number; base: number; high: number } {
  if (input.target_price) {
    return { low: input.target_price * 0.8, base: input.target_price, high: input.target_price * 1.2 };
  }

  if (input.therapy_type.startsWith('car_t')) {
    return { low: 373000, base: 450000, high: 475000 };
  }
  if (input.therapy_type.startsWith('gene_therapy') || input.therapy_type === 'gene_editing') {
    if (input.target_population_us * input.eligible_fraction < 5000) {
      return { low: 1500000, base: 2500000, high: 3500000 };
    }
    return { low: 500000, base: 1200000, high: 2500000 };
  }
  // Allogeneic / iPSC / MSC / NK — lower pricing
  return { low: 50000, base: 150000, high: 350000 };
}

export function calculateCGTMarketSizing(input: CGTInput): CGTOutput {
  const profile = CGT_PROFILES[input.therapy_type] || CGT_PROFILES.car_t_autologous;
  const price = derivePrice(input, profile);

  const addressablePatients = Math.round(input.target_population_us * input.eligible_fraction);
  const maxCapacity = input.manufacturing_sites * profile.patients_per_site_year * profile.success_rate;

  // One-time therapies: prevalent backlog + annual incident flow
  const annualIncident = Math.round(addressablePatients * 0.15); // ~15% annual incidence of eligible pool
  const prevalentBacklog = addressablePatients;

  const projection: CGTOutput['revenue_projection'] = [];
  let cumulative = 0;
  let bottleneckYear: number | null = null;

  for (let yr = 0; yr < 10; yr++) {
    // Ramp: year 0-1 limited by launch, year 2+ limited by manufacturing
    const launchRamp = yr === 0 ? 0.15 : yr === 1 ? 0.45 : yr === 2 ? 0.75 : 1.0;
    const backlogDemand = yr < 3 ? prevalentBacklog * 0.15 * (yr + 1) : annualIncident;
    const demand = Math.round(backlogDemand * launchRamp);
    const treated = Math.min(demand, maxCapacity);
    const revenue = treated * price.base;
    cumulative += revenue;
    const utilization = treated / maxCapacity;

    if (utilization > 0.9 && !bottleneckYear) bottleneckYear = yr + 1;

    projection.push({
      year: yr + 1,
      patients_treated: treated,
      revenue,
      cumulative_revenue: cumulative,
      manufacturing_utilization: utilization,
    });
  }

  const peakRevenue = Math.max(...projection.map((p) => p.revenue));
  const peakTreated = Math.max(...projection.map((p) => p.patients_treated));

  return {
    summary: {
      addressable_patients_us: addressablePatients,
      treatable_patients_year1: projection[0]?.patients_treated || 0,
      peak_treatable_per_year: peakTreated,
      manufacturing_bottleneck_year: bottleneckYear,
      price_per_patient: price,
      peak_revenue: { low: peakRevenue * 0.7, base: peakRevenue, high: peakRevenue * 1.3 },
    },
    manufacturing_model: {
      type: profile.autologous ? 'autologous' : 'allogeneic',
      cogs_per_patient: { low: profile.cogs_low, base: profile.cogs_base, high: profile.cogs_high },
      vein_to_vein_days: {
        low: profile.vein_to_vein_low,
        base: profile.vein_to_vein_base,
        high: profile.vein_to_vein_high,
      },
      manufacturing_success_rate: profile.success_rate,
      capacity_limited_patients_per_year: Math.round(maxCapacity),
      scale_up_investment: profile.autologous ? '$50-150M per manufacturing site' : '$20-50M per manufacturing site',
    },
    pricing_analysis: {
      recommended_price: price.base,
      pricing_rationale: profile.autologous
        ? `Autologous ${input.therapy_type.replace(/_/g, ' ')} pricing benchmarked against approved CAR-T and gene therapy products. COGS of $${Math.round(profile.cogs_base / 1000)}K per patient supports pricing at ${Math.round((1 - profile.cogs_base / price.base) * 100)}% gross margin.`
        : `Allogeneic/off-the-shelf product with lower manufacturing costs supports broader market access pricing. COGS advantage of ${Math.round((1 - profile.cogs_base / CGT_PROFILES.car_t_autologous.cogs_base) * 100)}% vs. autologous CAR-T.`,
      comparables: CGT_PRICE_COMPARABLES.slice(0, 6),
      payer_considerations: [
        profile.autologous
          ? 'Outcomes-based contracts typical — 20-30% rebate if durability endpoints missed at 12-24 months'
          : 'Volume-based contracting possible given lower per-patient cost',
        'CMS NTAP (New Technology Add-on Payment) available for first 2-3 years post-approval',
        addressablePatients < 5000
          ? 'Orphan drug pricing precedent supports premium'
          : 'Larger population may face payer pushback above $500K',
        'Indication-based pricing (ICER threshold: $150K-500K/QALY) constrains ceiling',
      ],
      outcomes_based_discount: profile.autologous ? 0.25 : 0.1,
    },
    revenue_projection: projection,
    patient_dynamics: {
      incident_patients_per_year: annualIncident,
      prevalent_backlog: prevalentBacklog,
      backlog_clearance_years: Math.ceil(prevalentBacklog / maxCapacity),
      annual_growth_rate: 0.03,
    },
    methodology: `Cell & gene therapy market sizing using one-time treatment economics. Patient pool: ${addressablePatients.toLocaleString()} eligible patients (${Math.round(input.eligible_fraction * 100)}% of ${input.target_population_us.toLocaleString()} target population). Manufacturing constraint: ${Math.round(maxCapacity).toLocaleString()} patients/year across ${input.manufacturing_sites} site(s). ${profile.autologous ? 'Autologous' : 'Allogeneic'} manufacturing with ${Math.round(profile.success_rate * 100)}% success rate.`,
    data_sources: [
      { name: 'FDA-approved CGT product pricing (CMS ASP)', date: '2025-2026', confidence: 'high' as const },
      { name: 'ARM (Alliance for Regenerative Medicine) sector report', date: '2025', confidence: 'high' as const },
      {
        name: 'Published COGS analyses (Nature Reviews Drug Discovery)',
        date: '2024-2025',
        confidence: 'medium' as const,
      },
    ],
  };
}
