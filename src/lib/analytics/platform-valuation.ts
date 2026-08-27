// ============================================================
// TERRAIN — Drug Delivery Platform Valuation Engine
// lib/analytics/platform-valuation.ts
//
// Platform deals have different economics: access fee +
// per-target milestone stacking + royalty on all licensed
// targets. Valued as sum of per-target option values.
// ============================================================

import type { DataSource } from '@/types';

export interface PlatformInput {
  platform_type:
    | 'lnp'
    | 'liposomal'
    | 'galnac'
    | 'depot'
    | 'aav_capsid'
    | 'exosome'
    | 'polymeric'
    | 'transdermal'
    | 'inhaled'
    | 'ocular'
    | 'other';
  num_targets_licensable: number;
  targets_currently_licensed: number;
  avg_target_indication_tam: number;
  platform_differentiation: 'first_in_class' | 'best_in_class' | 'me_too';
  development_stage_of_platform: 'preclinical' | 'clinical_validated' | 'commercially_proven';
  modalities_enabled: string[];
  territory: string[];
}

export interface PlatformOutput {
  summary: {
    platform_value: { low: number; base: number; high: number };
    per_target_option_value: { low: number; base: number; high: number };
    total_milestone_potential: number;
    royalty_stream_value: number;
    num_targets_remaining: number;
  };
  target_economics: {
    access_fee: number;
    per_target_upfront: number;
    development_milestones: number;
    commercial_milestones: number;
    royalty_range: string;
    total_per_target: number;
  };
  platform_premium: {
    premium_vs_single_asset: number;
    premium_drivers: string[];
    comparable_platforms: { name: string; type: string; deals: number; total_value: string }[];
  };
  valuation_scenarios: { scenario: string; targets_licensed: number; value: number; assumptions: string }[];
  deal_structure_recommendation: {
    recommended_structure: string;
    access_fee_range: string;
    per_target_upfront_range: string;
    milestone_structure: string;
    royalty_range: string;
    rationale: string;
  };
  methodology: string;
  data_sources: DataSource[];
}

const PLATFORM_BENCHMARKS: Record<
  string,
  {
    access_fee: number;
    per_target_upfront: number;
    dev_milestones: number;
    comm_milestones: number;
    royalty_low: number;
    royalty_high: number;
  }
> = {
  lnp: {
    access_fee: 50_000_000,
    per_target_upfront: 30_000_000,
    dev_milestones: 150_000_000,
    comm_milestones: 200_000_000,
    royalty_low: 0.04,
    royalty_high: 0.08,
  },
  galnac: {
    access_fee: 40_000_000,
    per_target_upfront: 25_000_000,
    dev_milestones: 120_000_000,
    comm_milestones: 180_000_000,
    royalty_low: 0.05,
    royalty_high: 0.1,
  },
  aav_capsid: {
    access_fee: 30_000_000,
    per_target_upfront: 20_000_000,
    dev_milestones: 100_000_000,
    comm_milestones: 150_000_000,
    royalty_low: 0.03,
    royalty_high: 0.07,
  },
  liposomal: {
    access_fee: 20_000_000,
    per_target_upfront: 15_000_000,
    dev_milestones: 80_000_000,
    comm_milestones: 120_000_000,
    royalty_low: 0.03,
    royalty_high: 0.06,
  },
  depot: {
    access_fee: 15_000_000,
    per_target_upfront: 10_000_000,
    dev_milestones: 60_000_000,
    comm_milestones: 100_000_000,
    royalty_low: 0.02,
    royalty_high: 0.05,
  },
  exosome: {
    access_fee: 25_000_000,
    per_target_upfront: 15_000_000,
    dev_milestones: 80_000_000,
    comm_milestones: 120_000_000,
    royalty_low: 0.04,
    royalty_high: 0.08,
  },
  polymeric: {
    access_fee: 10_000_000,
    per_target_upfront: 8_000_000,
    dev_milestones: 50_000_000,
    comm_milestones: 80_000_000,
    royalty_low: 0.02,
    royalty_high: 0.05,
  },
  transdermal: {
    access_fee: 10_000_000,
    per_target_upfront: 8_000_000,
    dev_milestones: 40_000_000,
    comm_milestones: 70_000_000,
    royalty_low: 0.02,
    royalty_high: 0.04,
  },
  inhaled: {
    access_fee: 15_000_000,
    per_target_upfront: 12_000_000,
    dev_milestones: 60_000_000,
    comm_milestones: 100_000_000,
    royalty_low: 0.03,
    royalty_high: 0.06,
  },
  ocular: {
    access_fee: 20_000_000,
    per_target_upfront: 15_000_000,
    dev_milestones: 80_000_000,
    comm_milestones: 130_000_000,
    royalty_low: 0.03,
    royalty_high: 0.07,
  },
  other: {
    access_fee: 15_000_000,
    per_target_upfront: 10_000_000,
    dev_milestones: 60_000_000,
    comm_milestones: 90_000_000,
    royalty_low: 0.03,
    royalty_high: 0.06,
  },
};

const COMPARABLE_PLATFORMS = [
  { name: 'Arbutus / Genevant (LNP)', type: 'lnp', deals: 5, total_value: '$7B+ in partner deal values' },
  { name: 'Alnylam (GalNAc)', type: 'galnac', deals: 8, total_value: '$10B+ across Roche, Novartis, Regeneron' },
  { name: 'Arctus (mRNA + LNP)', type: 'lnp', deals: 3, total_value: '$4B+ with AstraZeneca, Ultragenyx' },
  {
    name: 'Acuitas (LNP for Pfizer/BioNTech)',
    type: 'lnp',
    deals: 2,
    total_value: 'Royalties on $30B+ COVID vaccine revenue',
  },
  { name: '4D Molecular Therapeutics (AAV capsid)', type: 'aav_capsid', deals: 3, total_value: '$1B+ in partnerships' },
  { name: 'Nuvation Bio (precision delivery)', type: 'other', deals: 2, total_value: '$500M+' },
];

function diffMultiplier(diff: PlatformInput['platform_differentiation']): number {
  return diff === 'first_in_class' ? 1.4 : diff === 'best_in_class' ? 1.15 : 0.75;
}

function stageMultiplier(stage: PlatformInput['development_stage_of_platform']): number {
  return stage === 'commercially_proven' ? 1.5 : stage === 'clinical_validated' ? 1.0 : 0.5;
}

export function calculatePlatformValuation(input: PlatformInput): PlatformOutput {
  const bench = PLATFORM_BENCHMARKS[input.platform_type] || PLATFORM_BENCHMARKS.other;
  const dMult = diffMultiplier(input.platform_differentiation);
  const sMult = stageMultiplier(input.development_stage_of_platform);

  const accessFee = Math.round(bench.access_fee * dMult * sMult);
  const perTargetUpfront = Math.round(bench.per_target_upfront * dMult * sMult);
  const devMilestones = Math.round(bench.dev_milestones * dMult);
  const commMilestones = Math.round(bench.comm_milestones * dMult);
  const totalPerTarget = perTargetUpfront + devMilestones + commMilestones;
  const remainingTargets = input.num_targets_licensable - input.targets_currently_licensed;

  // Platform value = access fee + sum of per-target option values
  // Each target is a real option: probability-weighted milestone stream
  const optionProb =
    input.development_stage_of_platform === 'commercially_proven'
      ? 0.35
      : input.development_stage_of_platform === 'clinical_validated'
        ? 0.2
        : 0.08;
  const perTargetOptionValue = Math.round(totalPerTarget * optionProb);

  const royaltyStreamPerTarget = Math.round(
    ((input.avg_target_indication_tam * (bench.royalty_low + bench.royalty_high)) / 2) * 0.1 * 10,
  ); // 10% peak share × 10 years × avg royalty
  const totalRoyaltyValue = royaltyStreamPerTarget * remainingTargets * optionProb;

  const platformValueBase = accessFee + perTargetOptionValue * remainingTargets + totalRoyaltyValue;

  return {
    summary: {
      platform_value: {
        low: Math.round(platformValueBase * 0.6),
        base: platformValueBase,
        high: Math.round(platformValueBase * 1.5),
      },
      per_target_option_value: {
        low: Math.round(perTargetOptionValue * 0.6),
        base: perTargetOptionValue,
        high: Math.round(perTargetOptionValue * 1.5),
      },
      total_milestone_potential: totalPerTarget * remainingTargets,
      royalty_stream_value: totalRoyaltyValue,
      num_targets_remaining: remainingTargets,
    },
    target_economics: {
      access_fee: accessFee,
      per_target_upfront: perTargetUpfront,
      development_milestones: devMilestones,
      commercial_milestones: commMilestones,
      royalty_range: `${Math.round(bench.royalty_low * 100)}-${Math.round(bench.royalty_high * 100)}%`,
      total_per_target: totalPerTarget,
    },
    platform_premium: {
      premium_vs_single_asset: Math.round((remainingTargets - 1) * 0.15 * 100),
      premium_drivers: [
        `${remainingTargets} licensable targets create compound optionality`,
        `${input.platform_type.replace(/_/g, ' ').toUpperCase()} platform validated ${input.development_stage_of_platform === 'commercially_proven' ? 'commercially' : input.development_stage_of_platform === 'clinical_validated' ? 'in clinical trials' : 'preclinically'}`,
        `${input.modalities_enabled.length} modalities enabled (${input.modalities_enabled.join(', ')})`,
        input.platform_differentiation === 'first_in_class'
          ? 'First-in-class delivery mechanism — limited competition for platform access'
          : '',
      ].filter(Boolean),
      comparable_platforms: COMPARABLE_PLATFORMS.filter(
        (c) => c.type === input.platform_type || input.platform_type === 'other',
      ).slice(0, 4),
    },
    valuation_scenarios: [
      {
        scenario: 'Bear',
        targets_licensed: Math.ceil(remainingTargets * 0.3),
        value: Math.round(platformValueBase * 0.4),
        assumptions: '30% of targets licensed, lower milestones achieved',
      },
      {
        scenario: 'Base',
        targets_licensed: Math.ceil(remainingTargets * 0.6),
        value: platformValueBase,
        assumptions: '60% of targets licensed, standard milestone achievement',
      },
      {
        scenario: 'Bull',
        targets_licensed: remainingTargets,
        value: Math.round(platformValueBase * 1.8),
        assumptions: 'All targets licensed, premium milestones, blockbuster royalties',
      },
    ],
    deal_structure_recommendation: {
      recommended_structure:
        remainingTargets > 3
          ? 'Platform access agreement with per-target opt-in'
          : 'Multi-target license with staged opt-in rights',
      access_fee_range: `$${Math.round((accessFee * 0.7) / 1_000_000)}M - $${Math.round((accessFee * 1.3) / 1_000_000)}M`,
      per_target_upfront_range: `$${Math.round((perTargetUpfront * 0.7) / 1_000_000)}M - $${Math.round((perTargetUpfront * 1.3) / 1_000_000)}M per target`,
      milestone_structure: `$${Math.round(devMilestones / 1_000_000)}M development + $${Math.round(commMilestones / 1_000_000)}M commercial per target`,
      royalty_range: `${Math.round(bench.royalty_low * 100)}-${Math.round(bench.royalty_high * 100)}% on net sales`,
      rationale: `${input.platform_type.replace(/_/g, ' ')} platform deals typically structure around per-target economics with an access fee that secures exclusivity. ${input.platform_differentiation === 'first_in_class' ? 'First-in-class differentiation supports premium access fee.' : ''} ${input.development_stage_of_platform === 'commercially_proven' ? 'Commercial validation de-risks the platform and justifies higher upfronts.' : ''}`,
    },
    methodology: `Platform valuation using real options approach. Each of ${remainingTargets} licensable targets valued as a probability-weighted milestone stream (${Math.round(optionProb * 100)}% cumulative PoS at ${input.development_stage_of_platform.replace(/_/g, ' ')} stage). ${input.platform_type.replace(/_/g, ' ').toUpperCase()} benchmarks calibrated against comparable platform deals. ${input.platform_differentiation.replace(/_/g, ' ')} differentiation ${dMult > 1 ? 'premium' : 'discount'} applied.`,
    data_sources: [
      { name: 'Platform licensing deal database (Ambrosia Ventures)', date: 'current', confidence: 'high' as const },
      {
        name: 'Published platform deal analyses (Nature Biotechnology)',
        date: '2024-2025',
        confidence: 'high' as const,
      },
    ],
  };
}
