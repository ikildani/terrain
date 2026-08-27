// ============================================================
// TERRAIN — CDMO/CMO Partnership Matching Engine
// lib/analytics/cdmo-matching.ts
//
// Matches biotech companies to contract development and
// manufacturing organizations based on molecule type, scale,
// geography, regulatory track record, and specialization.
// ============================================================

import type { DataSource } from '@/types';

export interface CDMOInput {
  molecule_type:
    | 'small_molecule'
    | 'mab'
    | 'adc'
    | 'bispecific'
    | 'car_t'
    | 'gene_therapy'
    | 'mrna'
    | 'peptide'
    | 'oligonucleotide'
    | 'viral_vector';
  scale: 'preclinical' | 'phase1_2' | 'phase3' | 'commercial';
  geography_preference: ('us' | 'eu' | 'asia' | 'global')[];
  gmp_required: boolean;
  estimated_batch_size?: string;
  budget_range?: 'under_1m' | '1m_5m' | '5m_20m' | 'over_20m';
  priority_factors: (
    | 'speed'
    | 'cost'
    | 'quality'
    | 'regulatory_track_record'
    | 'tech_transfer_support'
    | 'scale_up_capability'
  )[];
}

export interface CDMOMatch {
  company: string;
  headquarters: string;
  match_score: number;
  specializations: string[];
  molecule_types: string[];
  scale_capabilities: string[];
  regulatory_approvals: string[];
  notable_clients: string[];
  estimated_timeline: string;
  estimated_cost_range: string;
  score_breakdown: {
    molecule_fit: number;
    scale_fit: number;
    geography_fit: number;
    regulatory_fit: number;
    specialization_fit: number;
  };
  rationale: string;
}

export interface CDMOOutput {
  matches: CDMOMatch[];
  market_context: {
    total_cdmos_evaluated: number;
    molecule_type_capacity: string;
    market_tightness: 'abundant' | 'moderate' | 'tight' | 'constrained';
    avg_lead_time: string;
  };
  recommendations: string[];
  methodology: string;
  data_sources: DataSource[];
}

interface CDMORecord {
  company: string;
  headquarters: string;
  molecule_types: string[];
  scale: string[];
  geographies: string[];
  regulatory: string[];
  specializations: string[];
  notable_clients: string[];
  timeline_months: Record<string, number>;
  tier: 'tier1' | 'tier2' | 'tier3';
}

// Core CDMO database — curated from public sources
const CDMO_DATABASE: CDMORecord[] = [
  // Tier 1 — Large-scale, full-service
  {
    company: 'Samsung Biologics',
    headquarters: 'South Korea',
    molecule_types: ['mab', 'bispecific', 'adc', 'fusion_protein'],
    scale: ['phase1_2', 'phase3', 'commercial'],
    geographies: ['asia', 'global'],
    regulatory: ['FDA', 'EMA', 'PMDA', 'MFDS'],
    specializations: ['Large-scale mAb', 'ADC conjugation', 'Bispecific'],
    notable_clients: ['Roche', 'Bristol Myers Squibb', 'AstraZeneca'],
    timeline_months: { phase1_2: 12, phase3: 18, commercial: 24 },
    tier: 'tier1',
  },
  {
    company: 'Lonza',
    headquarters: 'Switzerland',
    molecule_types: ['mab', 'adc', 'gene_therapy', 'viral_vector', 'cell_therapy'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['eu', 'us', 'global'],
    regulatory: ['FDA', 'EMA', 'PMDA'],
    specializations: ['Cell & gene therapy', 'mAb mammalian', 'Viral vectors'],
    notable_clients: ['Moderna', 'Spark Therapeutics', 'bluebird bio'],
    timeline_months: { preclinical: 6, phase1_2: 10, phase3: 16, commercial: 22 },
    tier: 'tier1',
  },
  {
    company: 'Catalent',
    headquarters: 'US',
    molecule_types: ['mab', 'adc', 'gene_therapy', 'viral_vector', 'mrna', 'small_molecule'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'eu', 'global'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Gene therapy', 'mRNA', 'Lipid nanoparticles', 'Fill-finish'],
    notable_clients: ['AstraZeneca', 'Johnson & Johnson', 'Moderna'],
    timeline_months: { preclinical: 5, phase1_2: 9, phase3: 15, commercial: 20 },
    tier: 'tier1',
  },
  {
    company: 'WuXi Biologics',
    headquarters: 'China',
    molecule_types: ['mab', 'bispecific', 'adc', 'fusion_protein'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['asia', 'us', 'eu', 'global'],
    regulatory: ['FDA', 'EMA', 'NMPA'],
    specializations: ['End-to-end biologics', 'Bispecific antibodies', 'Continuous manufacturing'],
    notable_clients: ['Multiple global pharma'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 14, commercial: 18 },
    tier: 'tier1',
  },
  {
    company: 'Boehringer Ingelheim BioXcellence',
    headquarters: 'Germany',
    molecule_types: ['mab', 'bispecific', 'fusion_protein'],
    scale: ['phase1_2', 'phase3', 'commercial'],
    geographies: ['eu', 'us', 'global'],
    regulatory: ['FDA', 'EMA', 'PMDA'],
    specializations: ['Mammalian cell culture', 'Process development', 'Commercial biologics'],
    notable_clients: ['Multiple pharma partners'],
    timeline_months: { phase1_2: 11, phase3: 17, commercial: 23 },
    tier: 'tier1',
  },
  {
    company: 'Thermo Fisher (Patheon)',
    headquarters: 'US',
    molecule_types: ['small_molecule', 'mab', 'adc', 'peptide'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'eu', 'global'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Small molecule API', 'Sterile injectables', 'Drug product'],
    notable_clients: ['Multiple pharma'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 14, commercial: 18 },
    tier: 'tier1',
  },
  // Tier 2 — Specialized
  {
    company: 'Ajinomoto Bio-Pharma',
    headquarters: 'US/Japan',
    molecule_types: ['small_molecule', 'oligonucleotide', 'peptide', 'adc'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'asia', 'global'],
    regulatory: ['FDA', 'PMDA'],
    specializations: ['Oligonucleotides', 'ADC linker-payload', 'High-potency API'],
    notable_clients: ['Multiple biotech'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 13, commercial: 17 },
    tier: 'tier2',
  },
  {
    company: 'AGC Biologics',
    headquarters: 'US/Denmark/Japan',
    molecule_types: ['mab', 'gene_therapy', 'viral_vector', 'mrna'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'eu', 'asia', 'global'],
    regulatory: ['FDA', 'EMA', 'PMDA'],
    specializations: ['Plasmid DNA', 'Viral vectors', 'mRNA'],
    notable_clients: ['Multiple gene therapy companies'],
    timeline_months: { preclinical: 5, phase1_2: 9, phase3: 15, commercial: 20 },
    tier: 'tier2',
  },
  {
    company: 'Novasep (Euroapi)',
    headquarters: 'France',
    molecule_types: ['small_molecule', 'peptide', 'oligonucleotide'],
    scale: ['phase1_2', 'phase3', 'commercial'],
    geographies: ['eu', 'global'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Complex API synthesis', 'Peptides', 'Chiral chemistry'],
    notable_clients: ['Sanofi', 'Multiple EU pharma'],
    timeline_months: { phase1_2: 9, phase3: 14, commercial: 19 },
    tier: 'tier2',
  },
  {
    company: 'Fujifilm Diosynth',
    headquarters: 'US/UK/Denmark',
    molecule_types: ['mab', 'gene_therapy', 'viral_vector', 'mrna'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'eu', 'global'],
    regulatory: ['FDA', 'EMA', 'MHRA'],
    specializations: ['Gene therapy vectors', 'Large-scale cell culture', 'CDMO services'],
    notable_clients: ['Multiple CGT companies'],
    timeline_months: { preclinical: 5, phase1_2: 10, phase3: 16, commercial: 22 },
    tier: 'tier2',
  },
  {
    company: 'Curia (formerly AMRI)',
    headquarters: 'US',
    molecule_types: ['small_molecule', 'peptide', 'adc'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['us', 'eu', 'global'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Complex small molecule', 'Highly potent compounds', 'Sterile manufacturing'],
    notable_clients: ['Multiple biotech'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 13, commercial: 17 },
    tier: 'tier2',
  },
  {
    company: 'KBI Biopharma',
    headquarters: 'US',
    molecule_types: ['mab', 'bispecific', 'fusion_protein'],
    scale: ['preclinical', 'phase1_2', 'phase3'],
    geographies: ['us', 'eu'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Microbial fermentation', 'Mammalian cell culture', 'Process dev'],
    notable_clients: ['Multiple biotech'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 14 },
    tier: 'tier2',
  },
  {
    company: 'Rentschler Biopharma',
    headquarters: 'Germany',
    molecule_types: ['mab', 'bispecific', 'fusion_protein'],
    scale: ['preclinical', 'phase1_2', 'phase3', 'commercial'],
    geographies: ['eu', 'us'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['European biologics manufacturing', 'Tech transfer', 'Process characterization'],
    notable_clients: ['European biotech'],
    timeline_months: { preclinical: 5, phase1_2: 10, phase3: 16, commercial: 22 },
    tier: 'tier2',
  },
  // Tier 3 — Niche / Emerging
  {
    company: 'National Resilience',
    headquarters: 'US',
    molecule_types: ['mab', 'gene_therapy', 'viral_vector', 'mrna', 'car_t'],
    scale: ['preclinical', 'phase1_2', 'phase3'],
    geographies: ['us'],
    regulatory: ['FDA'],
    specializations: ['Complex modalities', 'Gene therapy', 'Cell therapy manufacturing'],
    notable_clients: ['Multiple US biotech'],
    timeline_months: { preclinical: 5, phase1_2: 9, phase3: 15 },
    tier: 'tier3',
  },
  {
    company: 'Cellares',
    headquarters: 'US',
    molecule_types: ['car_t'],
    scale: ['preclinical', 'phase1_2', 'phase3'],
    geographies: ['us'],
    regulatory: ['FDA'],
    specializations: ['Automated cell therapy manufacturing', 'CAR-T'],
    notable_clients: ['Cell therapy companies'],
    timeline_months: { preclinical: 4, phase1_2: 7, phase3: 12 },
    tier: 'tier3',
  },
  {
    company: 'Polyplus (Sartorius)',
    headquarters: 'France',
    molecule_types: ['gene_therapy', 'viral_vector', 'mrna'],
    scale: ['preclinical', 'phase1_2', 'phase3'],
    geographies: ['eu', 'us'],
    regulatory: ['FDA', 'EMA'],
    specializations: ['Transfection reagents', 'Viral vector production', 'GMP plasmid DNA'],
    notable_clients: ['Gene therapy developers'],
    timeline_months: { preclinical: 4, phase1_2: 8, phase3: 14 },
    tier: 'tier3',
  },
];

const CAPACITY_TIGHTNESS: Record<string, 'abundant' | 'moderate' | 'tight' | 'constrained'> = {
  small_molecule: 'abundant',
  mab: 'moderate',
  adc: 'tight',
  bispecific: 'tight',
  car_t: 'constrained',
  gene_therapy: 'constrained',
  mrna: 'moderate',
  peptide: 'moderate',
  oligonucleotide: 'tight',
  viral_vector: 'constrained',
};

function scoreCDMO(cdmo: CDMORecord, input: CDMOInput): CDMOMatch {
  let moleculeFit = cdmo.molecule_types.includes(input.molecule_type) ? 80 : 20;
  if (cdmo.specializations.some((s) => s.toLowerCase().includes(input.molecule_type.replace('_', ' '))))
    moleculeFit = 100;

  const scaleFit = cdmo.scale.includes(input.scale) ? 90 : 30;

  const geoOverlap = input.geography_preference.filter((g) => cdmo.geographies.includes(g)).length;
  const geoFit = Math.min(100, (geoOverlap / Math.max(1, input.geography_preference.length)) * 100);

  const regulatoryFit = cdmo.regulatory.includes('FDA') ? 85 : 50;

  let specFit = 50;
  if (input.priority_factors.includes('regulatory_track_record') && cdmo.tier === 'tier1') specFit = 95;
  if (input.priority_factors.includes('speed') && cdmo.tier !== 'tier1') specFit += 10;
  if (input.priority_factors.includes('cost') && cdmo.tier === 'tier3') specFit += 15;

  const totalScore = Math.round(
    moleculeFit * 0.3 + scaleFit * 0.25 + geoFit * 0.15 + regulatoryFit * 0.15 + specFit * 0.15,
  );

  const timeline = cdmo.timeline_months[input.scale] || 12;

  return {
    company: cdmo.company,
    headquarters: cdmo.headquarters,
    match_score: totalScore,
    specializations: cdmo.specializations,
    molecule_types: cdmo.molecule_types,
    scale_capabilities: cdmo.scale,
    regulatory_approvals: cdmo.regulatory,
    notable_clients: cdmo.notable_clients,
    estimated_timeline: `${timeline}-${timeline + 4} months`,
    estimated_cost_range: input.scale === 'commercial' ? '$5-20M+' : input.scale === 'phase3' ? '$2-10M' : '$500K-3M',
    score_breakdown: {
      molecule_fit: moleculeFit,
      scale_fit: scaleFit,
      geography_fit: geoFit,
      regulatory_fit: regulatoryFit,
      specialization_fit: specFit,
    },
    rationale: `${cdmo.company} ${moleculeFit >= 80 ? 'has direct experience' : 'has adjacent capability'} with ${input.molecule_type.replace('_', ' ')} assets at ${input.scale} scale. ${cdmo.tier === 'tier1' ? 'Tier 1 CDMO with extensive regulatory track record.' : cdmo.tier === 'tier2' ? 'Specialized Tier 2 partner with focused expertise.' : 'Emerging/niche partner — may offer speed and flexibility advantages.'}`,
  };
}

export function matchCDMOs(input: CDMOInput): CDMOOutput {
  const matches = CDMO_DATABASE.map((cdmo) => scoreCDMO(cdmo, input))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10);

  const tightness = CAPACITY_TIGHTNESS[input.molecule_type] || 'moderate';

  const recommendations: string[] = [];
  if (tightness === 'constrained') {
    recommendations.push(
      `${input.molecule_type.replace('_', ' ')} manufacturing capacity is constrained globally. Engage CDMOs early — lead times are 6-12 months longer than standard biologics.`,
    );
  }
  if (input.scale === 'commercial' && matches[0]?.match_score < 70) {
    recommendations.push(
      'Limited commercial-scale options for this molecule type. Consider a phased approach: start with a Phase 3 CDMO and plan tech transfer to a commercial partner.',
    );
  }
  if (input.geography_preference.includes('us') && input.molecule_type === 'car_t') {
    recommendations.push(
      'Autologous CAR-T requires proximity to treatment sites. Prioritize US-based CDMOs with vein-to-vein logistics capability.',
    );
  }

  return {
    matches,
    market_context: {
      total_cdmos_evaluated: CDMO_DATABASE.length,
      molecule_type_capacity: `${input.molecule_type.replace('_', ' ')} manufacturing is ${tightness}`,
      market_tightness: tightness,
      avg_lead_time: matches[0]?.estimated_timeline || '12-18 months',
    },
    recommendations,
    methodology: `Scored ${CDMO_DATABASE.length} CDMOs across 5 dimensions: molecule fit (30%), scale capability (25%), geographic coverage (15%), regulatory track record (15%), and specialization alignment (15%). Rankings prioritize ${input.priority_factors.join(', ')}.`,
    data_sources: [
      { name: 'Public CDMO announcements and capabilities', type: 'public' as const },
      { name: 'FDA facility inspection database', type: 'public' as const },
    ],
  };
}
