// ============================================================
// TERRAIN — Partner Discovery Matching Engine
// lib/analytics/partners.ts
//
// Scores and ranks 300+ biopharma companies against a user's
// asset profile to identify the highest-probability BD partners.
//
// Scoring dimensions (weighted to 100):
//   Therapeutic alignment  — 25 pts
//   Pipeline gap           — 25 pts
//   Deal history           — 20 pts
//   Geography fit          — 15 pts
//   Financial capacity     — 15 pts
//
// Sources: Partner database derived from SEC filings, company
// annual reports, BioCentury, Evaluate Pharma (2020-2025)
// ============================================================

import type {
  PartnerDiscoveryInput,
  PartnerDiscoveryOutput,
  PartnerMatch,
  PartnerScoreBreakdown,
  PartnerDeal,
  DealBenchmark,
  DataSource,
  DevelopmentStage,
  PartnerTrackRecord,
  PortfolioAppetite,
  GeographicStrength,
  DealStructureModel,
  PartnerPhaseSuccessRates,
  NegotiationLeverage,
  NegotiationLeverageFactor,
  LOEGapAnalysis,
} from '@/types';

import type {
  DevicePartnerDiscoveryInput,
  DevicePartnerMatch,
  DeviceAcquisitionProbability,
  DeviceRegulatoryTrackRecord,
  DistributionStrengthAssessment,
  DeviceDealStructureModel,
  DeviceCategory,
  ProductCategory,
  NutraceuticalPartnerDiscoveryInput,
  NutraceuticalPartnerMatch,
  NutraceuticalPartnerProfile,
  NutraceuticalPartnerType,
  NutraceuticalCategory,
  NutraceuticalChannel,
} from '@/types';

import {
  PHARMA_PARTNER_DATABASE,
  type PharmaPartnerProfile,
} from '@/lib/data/partner-database';

import {
  DEVICE_PARTNER_DATABASE_FULL as RAW_DEVICE_PARTNERS,
  type DevicePartnerProfile,
} from '@/lib/data/device-partner-database';

import { NUTRACEUTICAL_PARTNER_DATABASE } from '@/lib/data/nutraceutical-partner-database';

import { findIndicationByName } from '@/lib/data/indication-map';

// ────────────────────────────────────────────────────────────
// DEVICE → PHARMA PROFILE NORMALIZATION
// Converts DevicePartnerProfile to PharmaPartnerProfile shape
// so both databases can be scored by the same functions.
// ────────────────────────────────────────────────────────────

/** Infer geography footprint from HQ location for device partners */
function inferDeviceGeography(hq: string): string[] {
  const h = hq.toLowerCase();
  // Major medtech companies are almost always global
  // Base: US, EU5, Japan. Add China for larger companies. Add regional for HQ-based.
  const geos = ['US', 'EU5', 'Japan', 'China'];
  if (h.includes('uk') || h.includes('london') || h.includes('england')) geos.push('UK');
  if (h.includes('canada') || h.includes('toronto') || h.includes('montreal')) geos.push('Canada');
  if (h.includes('australia') || h.includes('sydney') || h.includes('melbourne')) geos.push('Australia');
  if (h.includes('germany') || h.includes('munich') || h.includes('berlin') || h.includes('erlangen')) geos.push('Germany');
  if (h.includes('france') || h.includes('paris') || h.includes('lyon')) geos.push('France');
  if (h.includes('italy') || h.includes('milan') || h.includes('rome')) geos.push('Italy');
  if (h.includes('spain') || h.includes('madrid') || h.includes('barcelona')) geos.push('Spain');
  return geos;
}

/** Map device regulatory stage terms to pharma DevelopmentStage equivalents */
function mapDeviceStage(stage: string): string {
  const map: Record<string, string> = {
    cleared_approved: 'approved',
    submission_pending: 'phase3',
    pivotal_ongoing: 'phase3',
    pivotal_design: 'phase2',
    feasibility: 'phase1',
    concept: 'preclinical',
    ide_approved: 'phase2',
    '510k_cleared': 'approved',
    pma_approved: 'approved',
  };
  return map[stage] || stage;
}

function normalizeDevicePartner(dp: DevicePartnerProfile): PharmaPartnerProfile {
  // Map device company_type → pharma company_type
  const typeMap: Record<string, PharmaPartnerProfile['company_type']> = {
    large_medtech: 'big_pharma',
    mid_medtech: 'mid_pharma',
    diagnostics: 'specialty_pharma',
    specialty_medtech: 'specialty_pharma',
    digital_health: 'biotech',
  };

  // Parse recent acquisitions into deal-like records
  const recentDeals = dp.recent_acquisitions.map((acq) => {
    const valueMatch = acq.match(/\$([0-9.]+)([BM])/i);
    let totalValueM = 0;
    if (valueMatch) {
      totalValueM = valueMatch[2].toUpperCase() === 'B'
        ? parseFloat(valueMatch[1]) * 1000
        : parseFloat(valueMatch[1]);
    }
    const yearMatch = acq.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
    const partnerMatch = acq.match(/^([^(]+)/);
    const partner = partnerMatch ? partnerMatch[1].trim() : 'Unknown';

    return {
      partner,
      asset: partner,
      indication: dp.primary_therapeutic_areas[0] || 'medical devices',
      deal_type: 'acquisition',
      upfront_m: totalValueM,
      total_value_m: totalValueM,
      year,
    };
  });

  return {
    company: dp.company,
    company_type: typeMap[dp.company_type] || 'specialty_pharma',
    headquarters: dp.hq,
    market_cap_b: dp.market_cap_b ?? 5,
    revenue_b: dp.revenue_b ?? 1,
    // Estimate R&D spend as ~10% of revenue for large medtech, ~15% for mid/specialty
    rd_spend_b: (dp.revenue_b ?? 1) * (dp.company_type === 'large_medtech' ? 0.10 : 0.15),
    therapeutic_areas: dp.primary_therapeutic_areas,
    pipeline_focus: [...dp.active_bd_interests, ...dp.key_divisions],
    strategic_priorities: dp.active_bd_interests,
    preferred_deal_stages: dp.preferred_stage.map(mapDeviceStage),
    bd_activity: 'active' as const,
    geography_footprint: inferDeviceGeography(dp.hq),
    recent_deals: recentDeals,
    deal_size_range: dp.deal_size_range,
    source: dp.source,
  };
}

const NORMALIZED_DEVICE_PARTNERS: PharmaPartnerProfile[] =
  RAW_DEVICE_PARTNERS.map(normalizeDevicePartner);

// ────────────────────────────────────────────────────────────
// THERAPY AREA MAPPING
// Maps indications/keywords → canonical therapy areas
// used for matching against partner therapeutic_areas
// ────────────────────────────────────────────────────────────

const THERAPY_AREA_KEYWORDS: Record<string, string[]> = {
  oncology: [
    'cancer', 'tumor', 'carcinoma', 'lymphoma', 'leukemia', 'myeloma',
    'sarcoma', 'melanoma', 'glioblastoma', 'glioma', 'nsclc', 'sclc',
    'hcc', 'rcc', 'tnbc', 'aml', 'cll', 'cml', 'dlbcl', 'mds',
    'mesothelioma', 'neuroblastoma', 'bladder', 'breast', 'lung',
    'prostate', 'ovarian', 'pancreatic', 'colorectal', 'gastric',
    'hepatocellular', 'cholangiocarcinoma', 'gist', 'net',
    'immuno-oncology', 'io', 'adc', 'antibody-drug conjugate',
    'car-t', 'bispecific', 'checkpoint', 'pd-1', 'pd-l1', 'ctla-4',
  ],
  immunology: [
    'rheumatoid arthritis', 'lupus', 'sle', 'psoriasis', 'atopic dermatitis',
    'eczema', 'psoriatic arthritis', 'ankylosing spondylitis', 'ibd',
    'crohn', 'ulcerative colitis', 'uc', 'autoimmune', 'inflammation',
    'il-17', 'il-23', 'jak', 'tyk2', 'tnf', 'anti-tnf',
    'hidradenitis', 'alopecia areata', 'vitiligo',
  ],
  neuroscience: [
    'alzheimer', 'parkinson', 'epilepsy', 'migraine', 'ms',
    'multiple sclerosis', 'schizophrenia', 'depression', 'mdd',
    'bipolar', 'adhd', 'huntington', 'als', 'amyotrophic',
    'neuropathy', 'pain', 'cns', 'neurodegeneration', 'dementia',
    'ptsd', 'anxiety', 'ocd', 'narcolepsy', 'sleep',
    'spinal muscular atrophy', 'sma', 'tau', 'amyloid',
  ],
  cardiovascular: [
    'heart failure', 'hypertension', 'atrial fibrillation', 'cad',
    'coronary', 'pah', 'pulmonary arterial hypertension',
    'atherosclerosis', 'cardiomyopathy', 'hcm', 'dcm', 'stroke',
    'thrombosis', 'anticoagulant',
  ],
  rare_disease: [
    'orphan', 'rare', 'ultra-rare', 'fabry', 'gaucher', 'pompe',
    'hemophilia', 'sickle cell', 'scd', 'beta-thalassemia',
    'cystic fibrosis', 'cf', 'duchenne', 'dmd', 'sma',
    'pku', 'phenylketonuria', 'mps', 'mucopolysaccharidosis',
    'friedreich', 'huntington',
  ],
  infectious_disease: [
    'hiv', 'hepatitis', 'hbv', 'hcv', 'rsv', 'influenza', 'covid',
    'bacterial', 'fungal', 'antiviral', 'antibiotic', 'vaccine',
    'malaria', 'tuberculosis',
  ],
  metabolic: [
    'diabetes', 't2d', 't1d', 'obesity', 'nash', 'mash', 'nafld',
    'glp-1', 'sglt2', 'metabolic', 'dyslipidemia', 'gout',
  ],
  hematology: [
    'anemia', 'hemophilia', 'itp', 'thrombocytopenia',
    'myelofibrosis', 'polycythemia', 'sickle cell', 'thalassemia',
    'von willebrand', 'hemolytic',
  ],
  ophthalmology: [
    'macular degeneration', 'amd', 'diabetic retinopathy', 'glaucoma',
    'dry eye', 'uveitis', 'retinal', 'geographic atrophy',
  ],
  dermatology: [
    'psoriasis', 'atopic dermatitis', 'eczema', 'acne', 'rosacea',
    'skin', 'dermatology', 'melanoma', 'cutaneous',
  ],
  nephrology: [
    'kidney', 'renal', 'iga nephropathy', 'fsgs', 'ckd',
    'dialysis', 'glomerulonephritis', 'nephrotic', 'hyperphosphatemia',
  ],
  respiratory: [
    'asthma', 'copd', 'ipf', 'pulmonary fibrosis', 'cystic fibrosis',
    'bronchitis', 'respiratory', 'lung disease',
  ],
  endocrinology: [
    'thyroid', 'growth hormone', 'acromegaly', 'cushing',
    'adrenal', 'hypoparathyroidism', 'endocrine',
  ],
  liver_disease: [
    'liver', 'hepatic', 'cirrhosis', 'nash', 'mash', 'nafld',
    'pbc', 'primary biliary', 'psc', 'fibrosis',
  ],
  gene_therapy: [
    'gene therapy', 'aav', 'lentiviral', 'crispr', 'gene editing',
    'base editing', 'rna editing', 'exon skipping',
  ],
};

// ────────────────────────────────────────────────────────────
// MECHANISM KEYWORD MAPPING
// Maps mechanism keywords for deeper alignment scoring
// ────────────────────────────────────────────────────────────

const MECHANISM_KEYWORDS: Record<string, string[]> = {
  adc: ['adc', 'antibody-drug conjugate', 'antibody drug conjugate', 'deruxtecan', 'vedotin', 'govitecan', 'maytansine', 'monomethyl'],
  bispecific: ['bispecific', 'bispecific antibody', 'dual-targeting', 'duobody'],
  car_t: ['car-t', 'car t', 'chimeric antigen receptor', 'cell therapy', 'autologous', 'allogeneic'],
  checkpoint: ['pd-1', 'pd-l1', 'ctla-4', 'lag-3', 'tigit', 'tim-3', 'checkpoint inhibitor', 'immuno-oncology'],
  degrader: ['degrader', 'protac', 'molecular glue', 'targeted protein degradation', 'cereblon', 'e3 ligase'],
  kinase: ['kinase inhibitor', 'tki', 'cdk', 'fgfr', 'egfr', 'kras', 'raf', 'mek', 'alk', 'ret', 'met', 'btk'],
  antibody: ['monoclonal antibody', 'mab', 'igg', 'fully human', 'humanized'],
  rna: ['sirna', 'mrna', 'antisense', 'oligonucleotide', 'aso', 'rna interference', 'rnai'],
  gene_therapy: ['gene therapy', 'aav', 'lentivirus', 'crispr', 'gene editing', 'base editing'],
  small_molecule: ['small molecule', 'oral', 'tablet', 'capsule'],
  glp1: ['glp-1', 'glp1', 'gip', 'incretin', 'amylin', 'obesity'],
  il_targeting: ['il-17', 'il-23', 'il-6', 'il-4', 'il-13', 'il-33', 'il-31', 'interleukin'],
};

// ────────────────────────────────────────────────────────────
// PATENT CLIFF URGENCY
// Top pharma companies with major LOE dates and revenue exposure
// Source: Public company disclosures, analyst consensus (2024-2025)
// ────────────────────────────────────────────────────────────

const MAJOR_LOE_EVENTS: Record<string, { drug: string; loe_year: number; revenue_b: number }[]> = {
  'merck': [{ drug: 'Keytruda', loe_year: 2028, revenue_b: 25 }],
  'abbvie': [{ drug: 'Humira', loe_year: 2023, revenue_b: 21 }, { drug: 'Imbruvica', loe_year: 2029, revenue_b: 5 }],
  'bristol-myers squibb': [{ drug: 'Eliquis', loe_year: 2026, revenue_b: 12 }, { drug: 'Opdivo', loe_year: 2028, revenue_b: 9 }],
  'bms': [{ drug: 'Eliquis', loe_year: 2026, revenue_b: 12 }, { drug: 'Opdivo', loe_year: 2028, revenue_b: 9 }],
  'pfizer': [{ drug: 'Ibrance', loe_year: 2027, revenue_b: 5 }, { drug: 'Eliquis', loe_year: 2026, revenue_b: 6 }],
  'johnson & johnson': [{ drug: 'Stelara', loe_year: 2025, revenue_b: 11 }, { drug: 'Darzalex', loe_year: 2032, revenue_b: 10 }],
  'janssen': [{ drug: 'Stelara', loe_year: 2025, revenue_b: 11 }, { drug: 'Darzalex', loe_year: 2032, revenue_b: 10 }],
  'roche': [{ drug: 'Ocrevus', loe_year: 2028, revenue_b: 7 }, { drug: 'Hemlibra', loe_year: 2030, revenue_b: 4 }],
  'novartis': [{ drug: 'Entresto', loe_year: 2026, revenue_b: 6 }, { drug: 'Kisqali', loe_year: 2029, revenue_b: 4 }],
  'astrazeneca': [{ drug: 'Tagrisso', loe_year: 2032, revenue_b: 6 }, { drug: 'Farxiga', loe_year: 2025, revenue_b: 6 }],
  'eli lilly': [{ drug: 'Trulicity', loe_year: 2027, revenue_b: 7 }, { drug: 'Verzenio', loe_year: 2032, revenue_b: 4 }],
  'lilly': [{ drug: 'Trulicity', loe_year: 2027, revenue_b: 7 }, { drug: 'Verzenio', loe_year: 2032, revenue_b: 4 }],
  'amgen': [{ drug: 'Enbrel', loe_year: 2023, revenue_b: 4 }, { drug: 'Prolia/Xgeva', loe_year: 2025, revenue_b: 4 }],
  'gilead': [{ drug: 'Biktarvy', loe_year: 2033, revenue_b: 12 }, { drug: 'Veklury', loe_year: 2025, revenue_b: 2 }],
  'sanofi': [{ drug: 'Dupixent', loe_year: 2031, revenue_b: 13 }],
  'regeneron': [{ drug: 'Eylea', loe_year: 2024, revenue_b: 10 }, { drug: 'Dupixent', loe_year: 2031, revenue_b: 13 }],
  'biogen': [{ drug: 'Tecfidera', loe_year: 2023, revenue_b: 4 }],
  'vertex': [{ drug: 'Trikafta', loe_year: 2037, revenue_b: 9 }],
  'gsk': [{ drug: 'Dovato/DTG', loe_year: 2027, revenue_b: 5 }, { drug: 'Shingrix', loe_year: 2029, revenue_b: 4 }],
  'takeda': [{ drug: 'Entyvio', loe_year: 2026, revenue_b: 5 }],
  'novo nordisk': [{ drug: 'Ozempic', loe_year: 2032, revenue_b: 18 }],
  'boehringer ingelheim': [{ drug: 'Jardiance', loe_year: 2025, revenue_b: 7 }],
};

function scorePatentCliffUrgency(partner: PharmaPartnerProfile): { score: number; narrative?: string } {
  const companyLower = partner.company.toLowerCase();

  // Find LOE events for this company
  const loeEvents = MAJOR_LOE_EVENTS[companyLower];
  if (!loeEvents || loeEvents.length === 0) return { score: 0 };

  const currentYear = new Date().getFullYear();
  let urgencyScore = 0;
  const urgentDrugs: string[] = [];

  for (const event of loeEvents) {
    const yearsToLOE = event.loe_year - currentYear;

    if (yearsToLOE <= 0) {
      // Already lost exclusivity
      urgencyScore += Math.min(4, (event.revenue_b / 5) * 4);
      urgentDrugs.push(`${event.drug} (LOE ${event.loe_year}, $${event.revenue_b}B peak)`);
    } else if (yearsToLOE <= 3) {
      // Imminent LOE
      urgencyScore += Math.min(3, (event.revenue_b / 5) * 3);
      urgentDrugs.push(`${event.drug} LOE in ${event.loe_year} ($${event.revenue_b}B at risk)`);
    } else if (yearsToLOE <= 5) {
      // Near-term LOE
      urgencyScore += Math.min(2, (event.revenue_b / 8) * 2);
      urgentDrugs.push(`${event.drug} LOE in ${event.loe_year}`);
    }
  }

  urgencyScore = Math.min(5, Math.round(urgencyScore * 10) / 10);

  if (urgencyScore === 0) return { score: 0 };

  const narrative = `Patent cliff pressure: ${urgentDrugs.join('; ')}. BD urgency elevated — actively seeking pipeline replenishment.`;

  return { score: urgencyScore, narrative };
}

// ────────────────────────────────────────────────────────────
// COMPETING PARTNERSHIP PENALTY
// Penalizes partners who have recent deals in the same indication
// or conflicting mechanism, reducing likelihood of a new deal.
// ────────────────────────────────────────────────────────────

function calculateCompetingPartnershipPenalty(
  partner: PharmaPartnerProfile,
  indication: string,
  mechanism?: string,
): number {
  let penalty = 0;
  const currentYear = new Date().getFullYear();
  const indicationTokens = tokenize(indication.toLowerCase());

  // Check recent deals for same-indication matches (within 3 years)
  const recentSameIndication = partner.recent_deals.filter(d => {
    const isRecent = d.year >= currentYear - 3;
    const dealInd = d.indication.toLowerCase();
    const indicationMatch = indicationTokens.some(t => dealInd.includes(t));
    return isRecent && indicationMatch;
  });

  if (recentSameIndication.length > 0) {
    penalty -= 8;
  }

  // Check pipeline_focus for mechanism conflict
  if (mechanism) {
    const mechLower = mechanism.toLowerCase();
    const mechCategories = inferMechanismCategories(mechanism);
    const hasMechConflict = partner.pipeline_focus.some(f => {
      const fLower = f.toLowerCase();
      return fLower.includes(mechLower) || mechCategories.some(mc => fLower.includes(mc));
    });
    // Only penalize if they have BOTH indication AND mechanism overlap (true competing asset)
    if (hasMechConflict && recentSameIndication.length > 0) {
      penalty -= 5;
    }
  }

  return Math.max(-10, penalty);
}

// ────────────────────────────────────────────────────────────
// MECHANISM EXPERTISE SCORING
// Informational — how deep is the partner's experience
// with this specific mechanism class
// ────────────────────────────────────────────────────────────

function scoreMechanismExpertise(
  partner: PharmaPartnerProfile,
  mechanism?: string,
): number {
  if (!mechanism) return 0;

  const mechLower = mechanism.toLowerCase();
  const mechCategories = inferMechanismCategories(mechanism);
  let score = 0;
  const currentYear = new Date().getFullYear();

  // Check recent deals for mechanism keyword matches
  for (const deal of partner.recent_deals) {
    const dealText = `${deal.indication} ${deal.asset} ${deal.deal_type}`.toLowerCase();
    const hasMechMatch = dealText.includes(mechLower) ||
      mechCategories.some(mc => dealText.includes(mc));
    if (hasMechMatch) {
      score += 3;
      // Recency bonus
      if (deal.year >= currentYear - 2) score += 1;
    }
  }

  // Check pipeline_focus for mechanism presence
  const hasPipelineMech = partner.pipeline_focus.some(f => {
    const fLower = f.toLowerCase();
    return fLower.includes(mechLower) || mechCategories.some(mc => fLower.includes(mc));
  });
  if (hasPipelineMech) score += 2;

  return Math.min(10, score);
}

// ────────────────────────────────────────────────────────────
// PARTNERSHIP TRACK RECORD SCORING
// Historical integration success rates by company.
// Sources: BioCentury BCIQ, public disclosures, Ambrosia deal database
// "Terminated" = deal terminated, returned, or written off within 3 years
// "Successful" = asset advanced to next stage or generated milestone
// ────────────────────────────────────────────────────────────

const PARTNER_TRACK_RECORDS: Record<string, {
  total_deals: number;
  successful: number;
  terminated: number;
  avg_milestone_months: number;
  notable_successes: string[];
  notable_failures: string[];
}> = {
  'roche': { total_deals: 45, successful: 32, terminated: 5, avg_milestone_months: 18, notable_successes: ['Genentech acquisition ($46.8B)', 'Hemlibra co-development'], notable_failures: ['Multiple anti-amyloid setbacks'] },
  'pfizer': { total_deals: 52, successful: 34, terminated: 8, avg_milestone_months: 20, notable_successes: ['BioNTech COVID-19 partnership', 'Seagen acquisition ($43B)'], notable_failures: ['Multiple CNS program terminations', 'Gene therapy wind-down'] },
  'novartis': { total_deals: 40, successful: 28, terminated: 6, avg_milestone_months: 19, notable_successes: ['Zolgensma (AveXis acquisition)', 'Kisqali development'], notable_failures: ['Endocyte integration delays'] },
  'merck': { total_deals: 35, successful: 26, terminated: 4, avg_milestone_months: 16, notable_successes: ['Keytruda development machine', 'Prometheus Biosciences ($10.8B)'], notable_failures: ['Vioxx post-market withdrawal'] },
  'johnson & johnson': { total_deals: 38, successful: 25, terminated: 6, avg_milestone_months: 22, notable_successes: ['Darzalex (Genmab partnership)', 'Tremfya development'], notable_failures: ['Actelion pipeline attrition'] },
  'janssen': { total_deals: 38, successful: 25, terminated: 6, avg_milestone_months: 22, notable_successes: ['Darzalex (Genmab partnership)', 'Tremfya development'], notable_failures: ['Actelion pipeline attrition'] },
  'astrazeneca': { total_deals: 42, successful: 30, terminated: 5, avg_milestone_months: 17, notable_successes: ['Daiichi Sankyo ADC partnership ($6.9B+)', 'Enhertu development'], notable_failures: ['Multiple early-stage program terminations'] },
  'bristol-myers squibb': { total_deals: 33, successful: 22, terminated: 5, avg_milestone_months: 19, notable_successes: ['Celgene acquisition ($74B)', 'Opdivo development'], notable_failures: ['Celgene integration challenges', 'Deucravacitinib launch stumble'] },
  'bms': { total_deals: 33, successful: 22, terminated: 5, avg_milestone_months: 19, notable_successes: ['Celgene acquisition ($74B)', 'Opdivo development'], notable_failures: ['Celgene integration challenges'] },
  'eli lilly': { total_deals: 30, successful: 23, terminated: 3, avg_milestone_months: 15, notable_successes: ['Mounjaro/Zepbound launch', 'LOXO Oncology acquisition'], notable_failures: ['Solanezumab Alzheimer\'s failures'] },
  'lilly': { total_deals: 30, successful: 23, terminated: 3, avg_milestone_months: 15, notable_successes: ['Mounjaro/Zepbound launch', 'LOXO Oncology acquisition'], notable_failures: ['Solanezumab failures'] },
  'abbvie': { total_deals: 35, successful: 24, terminated: 5, avg_milestone_months: 18, notable_successes: ['Allergan acquisition ($63B)', 'Imbruvica partnership'], notable_failures: ['ABBV-8E12 (tau antibody) failure', 'Rinvoq safety concerns'] },
  'gilead': { total_deals: 28, successful: 18, terminated: 5, avg_milestone_months: 20, notable_successes: ['Kite Pharma acquisition (CAR-T)', 'Sovaldi/Harvoni HCV'], notable_failures: ['NASH program terminations', 'Immunomedics integration'] },
  'sanofi': { total_deals: 32, successful: 21, terminated: 6, avg_milestone_months: 21, notable_successes: ['Dupixent co-development with Regeneron', 'Translate Bio mRNA'], notable_failures: ['Multiple oncology setbacks', 'Principia Bio integration'] },
  'amgen': { total_deals: 25, successful: 17, terminated: 4, avg_milestone_months: 19, notable_successes: ['Horizon Therapeutics acquisition ($28B)', 'Lumakras launch'], notable_failures: ['Otezla underwhelming performance post-acquisition'] },
  'biogen': { total_deals: 22, successful: 12, terminated: 6, avg_milestone_months: 24, notable_successes: ['Aduhelm accelerated approval (controversial)', 'Leqembi partnership with Eisai'], notable_failures: ['Multiple pipeline terminations', 'Aduhelm commercial failure'] },
  'regeneron': { total_deals: 18, successful: 14, terminated: 2, avg_milestone_months: 14, notable_successes: ['Dupixent franchise expansion', 'VelocImmune platform deals'], notable_failures: ['Limited — strong track record'] },
  'vertex': { total_deals: 15, successful: 12, terminated: 1, avg_milestone_months: 13, notable_successes: ['Casgevy gene therapy (CRISPR collab)', 'CF franchise dominance'], notable_failures: ['Pain program delays'] },
  'gsk': { total_deals: 30, successful: 18, terminated: 7, avg_milestone_months: 22, notable_successes: ['Shingrix development', 'Sierra Oncology acquisition'], notable_failures: ['Haleon demerger complexity', 'Multiple oncology failures'] },
  'takeda': { total_deals: 28, successful: 16, terminated: 6, avg_milestone_months: 23, notable_successes: ['Shire acquisition ($62B)', 'Entyvio development'], notable_failures: ['Shire integration — divested many assets', 'R&D pipeline attrition'] },
  'novo nordisk': { total_deals: 20, successful: 16, terminated: 2, avg_milestone_months: 15, notable_successes: ['Ozempic/Wegovy franchise', 'Dicerna acquisition (RNAi)'], notable_failures: ['Oral insulin challenges'] },
  'boehringer ingelheim': { total_deals: 22, successful: 15, terminated: 3, avg_milestone_months: 18, notable_successes: ['Jardiance partnership with Lilly', 'Astellas IPF collaboration'], notable_failures: ['Respimat patent dispute'] },
};

function evaluatePartnerTrackRecord(
  partner: PharmaPartnerProfile,
): PartnerTrackRecord | undefined {
  const companyLower = partner.company.toLowerCase();
  const record = PARTNER_TRACK_RECORDS[companyLower];
  if (!record) return undefined;

  const successRate = record.successful / Math.max(1, record.total_deals);

  let label: PartnerTrackRecord['track_record_label'];
  if (successRate >= 0.75) label = 'Excellent';
  else if (successRate >= 0.60) label = 'Good';
  else if (successRate >= 0.45) label = 'Mixed';
  else label = 'Poor';

  return {
    total_deals_last_10yr: record.total_deals,
    successful_integrations: record.successful,
    terminated_deals: record.terminated,
    integration_success_rate: parseFloat(successRate.toFixed(2)),
    avg_time_to_first_milestone_months: record.avg_milestone_months,
    track_record_label: label,
    notable_successes: record.notable_successes,
    notable_failures: record.notable_failures,
  };
}

// ────────────────────────────────────────────────────────────
// THERAPY-AREA-ADJUSTED DEAL BENCHMARKS
// Stage × therapy area matrix used as fallback when sample < 3
// ────────────────────────────────────────────────────────────

const THERAPY_AREA_DEAL_BENCHMARKS: Record<string, Record<DevelopmentStage, {
  avg_upfront_m: number;
  avg_total_m: number;
  royalty: string;
}>> = {
  oncology: {
    preclinical: { avg_upfront_m: 30, avg_total_m: 500, royalty: '3-6% tiered' },
    phase1: { avg_upfront_m: 75, avg_total_m: 900, royalty: '6-12% tiered' },
    phase2: { avg_upfront_m: 200, avg_total_m: 2000, royalty: '12-20% tiered' },
    phase3: { avg_upfront_m: 500, avg_total_m: 4000, royalty: '18-28% tiered' },
    approved: { avg_upfront_m: 1200, avg_total_m: 8000, royalty: '25-35% tiered' },
  },
  rare_disease: {
    preclinical: { avg_upfront_m: 20, avg_total_m: 300, royalty: '2-5% tiered' },
    phase1: { avg_upfront_m: 50, avg_total_m: 600, royalty: '5-10% tiered' },
    phase2: { avg_upfront_m: 150, avg_total_m: 1200, royalty: '10-18% tiered' },
    phase3: { avg_upfront_m: 350, avg_total_m: 2500, royalty: '15-25% tiered' },
    approved: { avg_upfront_m: 800, avg_total_m: 5000, royalty: '20-30% tiered' },
  },
  immunology: {
    preclinical: { avg_upfront_m: 25, avg_total_m: 400, royalty: '3-6% tiered' },
    phase1: { avg_upfront_m: 60, avg_total_m: 750, royalty: '6-12% tiered' },
    phase2: { avg_upfront_m: 175, avg_total_m: 1800, royalty: '12-18% tiered' },
    phase3: { avg_upfront_m: 400, avg_total_m: 3500, royalty: '15-25% tiered' },
    approved: { avg_upfront_m: 1000, avg_total_m: 6000, royalty: '22-32% tiered' },
  },
  neurology: {
    preclinical: { avg_upfront_m: 15, avg_total_m: 250, royalty: '2-5% tiered' },
    phase1: { avg_upfront_m: 40, avg_total_m: 500, royalty: '5-10% tiered' },
    phase2: { avg_upfront_m: 100, avg_total_m: 1000, royalty: '8-15% tiered' },
    phase3: { avg_upfront_m: 300, avg_total_m: 2500, royalty: '12-22% tiered' },
    approved: { avg_upfront_m: 700, avg_total_m: 4000, royalty: '18-28% tiered' },
  },
  default: {
    preclinical: { avg_upfront_m: 20, avg_total_m: 300, royalty: '2-5% tiered' },
    phase1: { avg_upfront_m: 50, avg_total_m: 600, royalty: '5-10% tiered' },
    phase2: { avg_upfront_m: 150, avg_total_m: 1500, royalty: '10-18% tiered' },
    phase3: { avg_upfront_m: 350, avg_total_m: 3000, royalty: '15-25% tiered' },
    approved: { avg_upfront_m: 800, avg_total_m: 5000, royalty: '20-35% tiered' },
  },
};

// ────────────────────────────────────────────────────────────
// DEAL FAILURE RATES BY STAGE x THERAPY AREA
// Historical deal failure/termination rates. Used to produce
// failure-adjusted deal valuations in benchmarks.
// Source: BioCentury BCIQ, Evaluate Pharma deal outcomes 2015-2025
// ────────────────────────────────────────────────────────────

const DEAL_FAILURE_RATES: Record<string, Record<string, number>> = {
  oncology: { preclinical: 0.35, phase1: 0.28, phase2: 0.20, phase3: 0.12, approved: 0.05 },
  rare_disease: { preclinical: 0.30, phase1: 0.22, phase2: 0.15, phase3: 0.08, approved: 0.03 },
  immunology: { preclinical: 0.32, phase1: 0.25, phase2: 0.18, phase3: 0.10, approved: 0.04 },
  neurology: { preclinical: 0.40, phase1: 0.32, phase2: 0.25, phase3: 0.15, approved: 0.06 },
  cardiovascular: { preclinical: 0.38, phase1: 0.30, phase2: 0.22, phase3: 0.12, approved: 0.05 },
  default: { preclinical: 0.35, phase1: 0.28, phase2: 0.20, phase3: 0.12, approved: 0.05 },
};

// ────────────────────────────────────────────────────────────
// DEAL TYPE MAPPING
// Maps user deal type preferences to partner deal history
// ────────────────────────────────────────────────────────────

// Known short indication/mechanism abbreviations that should NOT be filtered out
const KNOWN_ABBREVIATIONS = new Set([
  'aml', 'cll', 'sma', 'itp', 'mds', 'cml', 'all', 'nhl', 'rcc', 'hcc',
  'gbm', 'ipf', 'tnbc', 'dlbcl', 'nsclc', 'sclc', 'adc', 'her2', 'egfr',
  'kras', 'alk', 'ret', 'met', 'btk', 'jak', 'pah', 'ckd', 'ibd', 'sle',
  'mdd', 'als', 'cns', 'dmd', 'pku', 'hiv', 'hbv', 'hcv', 'rsv', 'gist',
  'nash', 'mash', 'amd', 'pfa', 'tka', 'tavr', 'dbs', 'drg', 'ivd', 'cdx',
]);

/** Tokenize indication/mechanism text, keeping known abbreviations */
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(
    (t) => t.length > 3 || KNOWN_ABBREVIATIONS.has(t)
  );
}

function matchesDealType(partnerDealType: string, userDealTypes: string[]): boolean {
  const normalized = partnerDealType.toLowerCase();
  return userDealTypes.some((udt) => {
    switch (udt) {
      case 'licensing':
        return normalized.includes('licens') || normalized.includes('license') || normalized.includes('rights');
      case 'co-development':
        return normalized.includes('co-develop') || normalized.includes('collaboration') || normalized.includes('co-promote') || normalized.includes('research');
      case 'acquisition':
        return normalized.includes('acqui') || normalized.includes('merger') || normalized.includes('full company');
      case 'co-promotion':
        return normalized.includes('co-promo') || normalized.includes('co promotion');
      default:
        return false;
    }
  });
}

// ────────────────────────────────────────────────────────────
// CORE SCORING FUNCTIONS
// ────────────────────────────────────────────────────────────

function inferTherapyAreas(indication: string, mechanism?: string): string[] {
  const text = `${indication} ${mechanism || ''}`.toLowerCase();
  const matched: string[] = [];

  for (const [area, keywords] of Object.entries(THERAPY_AREA_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(area);
    }
  }

  // Also try the indication map
  const indicationData = findIndicationByName(indication);
  if (indicationData) {
    const area = indicationData.therapy_area.toLowerCase().replace(/\s+/g, '_');
    if (!matched.includes(area)) {
      matched.push(area);
    }
  }

  return matched.length > 0 ? matched : ['general'];
}

function inferMechanismCategories(mechanism?: string): string[] {
  if (!mechanism) return [];
  const text = mechanism.toLowerCase();
  const matched: string[] = [];

  for (const [category, keywords] of Object.entries(MECHANISM_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(category);
    }
  }

  return matched;
}

/**
 * Therapeutic alignment score (0-25)
 * How well does the partner's existing therapeutic focus match the asset's indication?
 */
function scoreTherapeuticAlignment(
  partner: PharmaPartnerProfile,
  userTherapyAreas: string[],
  indication: string,
  mechanism?: string,
): number {
  let score = 0;
  const partnerAreas = partner.therapeutic_areas.map((a) => a.toLowerCase().replace(/\s+/g, '_'));
  const partnerFocus = partner.pipeline_focus.map((f) => f.toLowerCase());

  // Direct therapy area match (up to 12 pts) — normalized exact-match
  const normalize = (a: string) => a.toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^a-z0-9_]/g, '');
  const areaOverlap = userTherapyAreas.filter((ua) =>
    partnerAreas.some((pa) => normalize(pa) === normalize(ua))
  );
  score += Math.min(12, areaOverlap.length * 6);

  // Indication keyword match in pipeline focus (up to 8 pts)
  const indicationLower = indication.toLowerCase();
  const indicationTokens = tokenize(indicationLower);
  const focusMatch = partnerFocus.some((f) =>
    indicationTokens.some((t) => f.includes(t))
  );
  if (focusMatch) score += 8;

  // Mechanism match in pipeline focus (up to 5 pts)
  if (mechanism) {
    const mechLower = mechanism.toLowerCase();
    const mechCategories = inferMechanismCategories(mechanism);
    const mechMatch = partnerFocus.some((f) =>
      f.includes(mechLower) || mechCategories.some((mc) => f.includes(mc))
    );
    if (mechMatch) score += 5;
  }

  return Math.min(25, score);
}

/**
 * Pipeline gap score (0-25)
 * Does this partner need assets in this therapy area / at this stage?
 */
function scorePipelineGap(
  partner: PharmaPartnerProfile,
  userTherapyAreas: string[],
  developmentStage: DevelopmentStage,
  indication: string,
): number {
  let score = 0;
  const priorities = partner.strategic_priorities.map((p) => p.toLowerCase());
  const indicationLower = indication.toLowerCase();
  const indicationTokens = tokenize(indicationLower);

  // Strategic priority match (up to 15 pts)
  const priorityMatch = priorities.some((p) =>
    userTherapyAreas.some((ua) => p.includes(ua)) ||
    indicationTokens.some((t) => p.includes(t))
  );
  if (priorityMatch) score += 15;

  // Check if they mention LOE / patent cliff / pipeline gap in priorities (up to 5 pts)
  const gapSignals = ['loe', 'patent cliff', 'rebuild', 'gap', 'pipeline build', 'expansion', 'entry', 'seeking'];
  const hasGapSignal = priorities.some((p) =>
    gapSignals.some((gs) => p.includes(gs))
  );
  if (hasGapSignal) score += 5;

  // BD activity level bonus (up to 5 pts)
  switch (partner.bd_activity) {
    case 'very_active': score += 5; break;
    case 'active': score += 3; break;
    case 'moderate': score += 1; break;
    case 'selective': score += 0; break;
  }

  return Math.min(25, score);
}

/**
 * Deal history score (0-20)
 * Has this partner done relevant deals at this stage and type recently?
 */
function scoreDealHistory(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
  dealTypes: string[],
  userTherapyAreas: string[],
  indication: string,
): number {
  let score = 0;
  const deals = partner.recent_deals;
  const indicationLower = indication.toLowerCase();

  if (deals.length === 0) return 0;

  // Preferred stage match (up to 6 pts)
  if (partner.preferred_deal_stages.includes(developmentStage)) {
    score += 6;
  }

  // Recent deals in relevant therapy area (up to 6 pts)
  const relevantDeals = deals.filter((d) => {
    const dealInd = d.indication.toLowerCase();
    return userTherapyAreas.some((ua) => dealInd.includes(ua)) ||
      tokenize(indicationLower).some((t) => dealInd.includes(t));
  });
  score += Math.min(6, relevantDeals.length * 2);

  // Deal type match (up to 4 pts)
  const hasMatchingDealType = deals.some((d) =>
    matchesDealType(d.deal_type, dealTypes)
  );
  if (hasMatchingDealType) score += 4;

  // Recent activity bonus — deals in last 2 years (up to 4 pts)
  const recentDeals = deals.filter((d) => d.year >= new Date().getFullYear() - 2);
  score += Math.min(4, recentDeals.length * 2);

  return Math.min(20, score);
}

/**
 * Geography fit score (0-15)
 * Do the rights being offered match the partner's geographic presence?
 */
function scoreGeographyFit(
  partner: PharmaPartnerProfile,
  geographyRights: string[],
): number {
  let score = 0;
  const partnerGeo = partner.geography_footprint.map((g) => g.toLowerCase());

  // If user offers global rights, check partner has global presence
  if (geographyRights.some((g) => g.toLowerCase() === 'global')) {
    const hasGlobal = partnerGeo.length >= 3;
    return hasGlobal ? 15 : 8;
  }

  // Count matching geographies
  const matchedGeos = geographyRights.filter((g) =>
    partnerGeo.some((pg) => pg.toLowerCase() === g.toLowerCase() || pg.includes(g.toLowerCase()))
  );

  const matchRatio = matchedGeos.length / Math.max(1, geographyRights.length);
  score = Math.round(matchRatio * 15);

  return Math.min(15, score);
}

/**
 * Financial capacity score (0-15)
 * Can this partner afford a deal at the expected scale?
 */
function scoreFinancialCapacity(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
): number {
  // Expected deal size by stage
  const stageMinCapacity: Record<DevelopmentStage, number> = {
    preclinical: 0.1,   // $100M market cap minimum
    phase1: 0.5,         // $500M market cap minimum
    phase2: 2,           // $2B market cap minimum
    phase3: 5,           // $5B market cap minimum
    approved: 10,        // $10B market cap minimum
  };

  const minCap = stageMinCapacity[developmentStage] || 0.5;
  const partnerCap = partner.market_cap_b;

  if (partnerCap >= minCap * 10) return 15;  // Far exceeds requirement
  if (partnerCap >= minCap * 5) return 12;
  if (partnerCap >= minCap * 2) return 9;
  if (partnerCap >= minCap) return 6;
  if (partnerCap >= minCap * 0.5) return 3;
  return 0;
}

// ────────────────────────────────────────────────────────────
// DEAL BENCHMARKS
// ────────────────────────────────────────────────────────────

const STAGE_BENCHMARKS: Record<DevelopmentStage, { royalty: string }> = {
  preclinical: { royalty: '2-5% tiered' },
  phase1: { royalty: '5-10% tiered' },
  phase2: { royalty: '10-18% tiered' },
  phase3: { royalty: '15-25% tiered' },
  approved: { royalty: '20-35% tiered' },
};

function computeDealBenchmarks(
  relevantDeals: { upfront_m: number; total_value_m: number; year: number }[],
  developmentStage: DevelopmentStage,
  therapyArea?: string,
): DealBenchmark {
  // Filter to meaningful deals (non-zero values)
  const validDeals = relevantDeals.filter(
    (d) => d.upfront_m > 0 && d.total_value_m > 0
  );

  // If sample too small, use therapy-area benchmarks as fallback
  if (validDeals.length < 3 && therapyArea) {
    const taLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
    const taBenchmarks = THERAPY_AREA_DEAL_BENCHMARKS[taLower] ?? THERAPY_AREA_DEAL_BENCHMARKS.default;
    const stageBenchmark = taBenchmarks[developmentStage];

    if (stageBenchmark) {
      // Compute failure-adjusted values
      const taKeyFail = taLower.replace(/[\s\-]+/g, '_');
      const failRates = DEAL_FAILURE_RATES[taKeyFail] ?? DEAL_FAILURE_RATES.default;
      const failRate = failRates[developmentStage] ?? 0.20;
      const failAdjVal = Math.round(stageBenchmark.avg_total_m * (1 - failRate));

      return {
        stage: developmentStage,
        avg_upfront_m: stageBenchmark.avg_upfront_m,
        median_upfront_m: Math.round(stageBenchmark.avg_upfront_m * 0.85), // Median typically lower
        avg_total_value_m: stageBenchmark.avg_total_m,
        median_total_value_m: Math.round(stageBenchmark.avg_total_m * 0.80),
        typical_royalty_range: stageBenchmark.royalty,
        sample_size: validDeals.length,
        therapy_area: therapyArea,
        therapy_area_context: `Based on ${therapyArea} industry benchmarks (sample of ${validDeals.length} partner deals supplemented with therapy-area reference data).`,
        failure_adjusted_value_m: failAdjVal,
        failure_rate_pct: Math.round(failRate * 100),
      };
    }
  }

  if (validDeals.length === 0) {
    const zTaKey = (therapyArea || 'default').toLowerCase().replace(/[\s\-]+/g, '_');
    const zFailRates = DEAL_FAILURE_RATES[zTaKey] ?? DEAL_FAILURE_RATES.default;
    const zFailRate = zFailRates[developmentStage] ?? 0.20;

    return {
      stage: developmentStage,
      avg_upfront_m: 0,
      median_upfront_m: 0,
      avg_total_value_m: 0,
      median_total_value_m: 0,
      typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
      sample_size: 0,
      failure_adjusted_value_m: 0,
      failure_rate_pct: Math.round(zFailRate * 100),
    };
  }

  const upfronts = validDeals.map((d) => d.upfront_m).sort((a, b) => a - b);
  const totals = validDeals.map((d) => d.total_value_m).sort((a, b) => a - b);

  const median = (arr: number[]) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  // Compute failure-adjusted values for deal-derived benchmarks
  const avgTotalForFail = Math.round(avg(totals));
  const fTaKey = (therapyArea || 'default').toLowerCase().replace(/[\s\-]+/g, '_');
  const fRates = DEAL_FAILURE_RATES[fTaKey] ?? DEAL_FAILURE_RATES.default;
  const fRate = fRates[developmentStage] ?? 0.20;
  const fAdjVal = Math.round(avgTotalForFail * (1 - fRate));

  return {
    stage: developmentStage,
    avg_upfront_m: Math.round(avg(upfronts)),
    median_upfront_m: Math.round(median(upfronts)),
    avg_total_value_m: avgTotalForFail,
    median_total_value_m: Math.round(median(totals)),
    typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
    sample_size: validDeals.length,
    therapy_area: therapyArea,
    failure_adjusted_value_m: fAdjVal,
    failure_rate_pct: Math.round(fRate * 100),
  };
}

// ────────────────────────────────────────────────────────────
// RATIONALE GENERATION
// ────────────────────────────────────────────────────────────

function generateRationale(
  partner: PharmaPartnerProfile,
  scores: PartnerScoreBreakdown,
  indication: string,
  developmentStage: DevelopmentStage,
  dealTypes: string[],
): string {
  const parts: string[] = [];
  const companyType = formatCompanyType(partner.company_type);

  // Lead with strongest dimension
  const dimensions = [
    { key: 'therapeutic_alignment', score: scores.therapeutic_alignment, label: 'therapeutic alignment' },
    { key: 'pipeline_gap', score: scores.pipeline_gap, label: 'pipeline gap fit' },
    { key: 'deal_history', score: scores.deal_history, label: 'deal history' },
    { key: 'geography_fit', score: scores.geography_fit, label: 'geographic fit' },
    { key: 'financial_capacity', score: scores.financial_capacity, label: 'financial capacity' },
  ].sort((a, b) => b.score - a.score);

  const topDimension = dimensions[0];
  // Scale descriptor to actual score vs max for that dimension
  const dimMaxes: Record<string, number> = { therapeutic_alignment: 25, pipeline_gap: 25, deal_history: 20, geography_fit: 15, financial_capacity: 15 };
  const topRatio = topDimension.score / (dimMaxes[topDimension.key] || 25);
  const descriptor = topRatio >= 0.7 ? 'strong' : topRatio >= 0.4 ? 'notable' : 'relevant';

  parts.push(
    `${partner.company} is a ${companyType} with ${descriptor} ${topDimension.label} for this opportunity.`
  );

  // Therapeutic presence
  if (scores.therapeutic_alignment >= 15) {
    const relevantAreas = partner.therapeutic_areas.slice(0, 3).join(', ');
    parts.push(`Active in ${relevantAreas} with pipeline investments aligned to ${indication}.`);
  }

  // Deal activity with concrete data
  if (scores.deal_history >= 12) {
    const recentDeals = partner.recent_deals.filter((d) => d.year >= new Date().getFullYear() - 2);
    if (recentDeals.length > 0) {
      const totalValue = recentDeals.reduce((sum, d) => sum + (d.total_value_m || 0), 0);
      const valueStr = totalValue >= 1000
        ? `~$${(totalValue / 1000).toFixed(1)}B`
        : totalValue > 0
          ? `~$${Math.round(totalValue)}M`
          : '';
      parts.push(
        `${recentDeals.length} deal${recentDeals.length > 1 ? 's' : ''} in related therapeutic areas in the last 2 years${valueStr ? ` totaling ${valueStr} in aggregate value` : ''}.`
      );
    }
  }

  // Strategic priority match
  if (scores.pipeline_gap >= 15) {
    const relevantPriority = partner.strategic_priorities.find((p) => {
      const pLower = p.toLowerCase();
      return tokenize(indication).some((t) => pLower.includes(t));
    });
    if (relevantPriority) {
      parts.push(`Strategic priority: "${relevantPriority}".`);
    }
  }

  // BD activity note
  if (partner.bd_activity === 'very_active') {
    parts.push('Very active BD team currently seeking assets.');
  }

  return parts.join(' ');
}

function generateWatchSignals(
  partner: PharmaPartnerProfile,
  indication: string,
  developmentStage: DevelopmentStage,
): string[] {
  const signals: string[] = [];

  // LOE / patent cliff
  const hasLOE = partner.strategic_priorities.some(
    (p) => p.toLowerCase().includes('loe') || p.toLowerCase().includes('patent cliff') || p.toLowerCase().includes('rebuild')
  );
  if (hasLOE) {
    signals.push('Facing key product LOE — actively rebuilding pipeline');
  }

  // Very active BD
  if (partner.bd_activity === 'very_active') {
    signals.push('Very active BD team with multiple ongoing searches');
  }

  // Recent large deal capacity
  const largeRecent = partner.recent_deals.filter(
    (d) => d.year >= new Date().getFullYear() - 2 && d.total_value_m >= 1000
  );
  if (largeRecent.length > 0) {
    signals.push(`Recently closed ${largeRecent.length} deal(s) >$1B — demonstrated capacity for significant transactions`);
  }

  // Strategic priority alignment
  const indicationTokens = tokenize(indication);
  const matchingPriority = partner.strategic_priorities.find((p) =>
    indicationTokens.some((t) => p.toLowerCase().includes(t))
  );
  if (matchingPriority) {
    signals.push(`Stated strategic priority aligns with this asset`);
  }

  // High R&D spend relative to revenue
  if (partner.rd_spend_b > 0 && partner.revenue_b > 0) {
    const rdRatio = partner.rd_spend_b / partner.revenue_b;
    if (rdRatio > 0.25) {
      signals.push('High R&D intensity (>25% of revenue) — committed to pipeline expansion');
    }
  }

  return signals.slice(0, 4);
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

function formatCompanyType(
  type: PharmaPartnerProfile['company_type']
): PartnerMatch['company_type'] {
  switch (type) {
    case 'big_pharma': return 'Big Pharma';
    case 'mid_pharma': return 'Mid-Size Pharma';
    case 'specialty_pharma': return 'Specialty Pharma';
    case 'biotech': return 'Biotech';
    case 'generics': return 'Specialty Pharma';
    default: return 'Specialty Pharma';
  }
}

function formatMarketCap(mcb: number): string {
  if (mcb >= 100) return `$${Math.round(mcb)}B`;
  if (mcb >= 1) return `$${mcb.toFixed(1)}B`;
  return `$${Math.round(mcb * 1000)}M`;
}

function formatDealTermsBenchmark(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
): PartnerMatch['deal_terms_benchmark'] {
  const validDeals = partner.recent_deals.filter(
    (d) => d.upfront_m > 0 && d.total_value_m > 0
  );

  if (validDeals.length === 0) {
    const benchmarks = STAGE_BENCHMARKS[developmentStage] || { royalty: '5-15%' };
    return {
      typical_upfront: 'Not available',
      typical_milestones: 'Not available',
      typical_royalty_range: benchmarks.royalty,
    };
  }

  const avgUpfront = validDeals.reduce((s, d) => s + d.upfront_m, 0) / validDeals.length;
  const avgTotal = validDeals.reduce((s, d) => s + d.total_value_m, 0) / validDeals.length;
  const avgMilestones = avgTotal - avgUpfront;

  return {
    typical_upfront: `$${Math.round(avgUpfront)}M`,
    typical_milestones: `$${Math.round(avgMilestones)}M`,
    typical_royalty_range: STAGE_BENCHMARKS[developmentStage]?.royalty || '5-15%',
  };
}

function inferDealStage(deal: PharmaPartnerProfile['recent_deals'][0]): DevelopmentStage {
  const type = deal.deal_type.toLowerCase();
  // Acquisitions of marketed products are typically approved-stage
  if (type.includes('acqui') || type.includes('merger')) return 'approved';
  // Infer from deal value: very large deals tend to be later-stage
  if (deal.total_value_m >= 5000) return 'approved';
  if (deal.total_value_m >= 2000) return 'phase3';
  if (deal.total_value_m >= 500) return 'phase2';
  if (deal.total_value_m >= 100) return 'phase1';
  return 'preclinical';
}

function convertToPartnerDeal(
  deal: PharmaPartnerProfile['recent_deals'][0],
  partnerCompany: string,
): PartnerDeal {
  return {
    partner_company: partnerCompany,
    licensed_to: deal.partner,
    indication: deal.indication,
    development_stage: inferDealStage(deal),
    deal_type: deal.deal_type,
    upfront_usd: deal.upfront_m * 1_000_000,
    total_value_usd: deal.total_value_m * 1_000_000,
    date: `${deal.year}`,
    source: 'SEC filings, press releases',
  };
}

// ────────────────────────────────────────────────────────────
// PARTNER GEOGRAPHIC REGULATORY STRENGTHS
// Differentiated scores for top 20 pharma across US, EU, Japan, China.
// Dimensions: commercial presence, regulatory capability,
// KOL network, reimbursement track record.
// Source: Ambrosia proprietary scoring, public annual reports 2024
// ────────────────────────────────────────────────────────────

const PARTNER_GEOGRAPHIC_STRENGTHS: Record<string, Record<string, {
  commercial: number; regulatory: number; kol: number; reimbursement: number;
}>> = {
  'pfizer': {
    'US': { commercial: 10, regulatory: 10, kol: 9, reimbursement: 9 },
    'EU': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'roche': {
    'US': { commercial: 9, regulatory: 10, kol: 10, reimbursement: 9 },
    'EU': { commercial: 10, regulatory: 10, kol: 10, reimbursement: 9 },
    'Japan': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'China': { commercial: 7, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'novartis': {
    'US': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 8 },
    'EU': { commercial: 10, regulatory: 10, kol: 9, reimbursement: 9 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'merck': {
    'US': { commercial: 10, regulatory: 10, kol: 10, reimbursement: 9 },
    'EU': { commercial: 8, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 7, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'merck & co': {
    'US': { commercial: 10, regulatory: 10, kol: 10, reimbursement: 9 },
    'EU': { commercial: 8, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 7, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'johnson & johnson': {
    'US': { commercial: 10, regulatory: 9, kol: 9, reimbursement: 9 },
    'EU': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'janssen': {
    'US': { commercial: 10, regulatory: 9, kol: 9, reimbursement: 9 },
    'EU': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'astrazeneca': {
    'US': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 8 },
    'EU': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 8 },
    'Japan': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'China': { commercial: 9, regulatory: 8, kol: 7, reimbursement: 6 },
  },
  'bristol-myers squibb': {
    'US': { commercial: 9, regulatory: 10, kol: 9, reimbursement: 8 },
    'EU': { commercial: 8, regulatory: 8, kol: 8, reimbursement: 7 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 5, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'bms': {
    'US': { commercial: 9, regulatory: 10, kol: 9, reimbursement: 8 },
    'EU': { commercial: 8, regulatory: 8, kol: 8, reimbursement: 7 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 5, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'eli lilly': {
    'US': { commercial: 10, regulatory: 10, kol: 9, reimbursement: 9 },
    'EU': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'Japan': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'lilly': {
    'US': { commercial: 10, regulatory: 10, kol: 9, reimbursement: 9 },
    'EU': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'Japan': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'abbvie': {
    'US': { commercial: 10, regulatory: 9, kol: 9, reimbursement: 9 },
    'EU': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 5, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'gilead': {
    'US': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'EU': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'Japan': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
    'China': { commercial: 5, regulatory: 4, kol: 3, reimbursement: 3 },
  },
  'sanofi': {
    'US': { commercial: 8, regulatory: 8, kol: 8, reimbursement: 8 },
    'EU': { commercial: 10, regulatory: 10, kol: 9, reimbursement: 9 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 7, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'amgen': {
    'US': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'EU': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 5 },
    'China': { commercial: 4, regulatory: 4, kol: 3, reimbursement: 3 },
  },
  'biogen': {
    'US': { commercial: 8, regulatory: 8, kol: 8, reimbursement: 7 },
    'EU': { commercial: 7, regulatory: 7, kol: 7, reimbursement: 6 },
    'Japan': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
    'China': { commercial: 3, regulatory: 3, kol: 2, reimbursement: 2 },
  },
  'regeneron': {
    'US': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 8 },
    'EU': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
    'Japan': { commercial: 4, regulatory: 4, kol: 3, reimbursement: 3 },
    'China': { commercial: 3, regulatory: 3, kol: 2, reimbursement: 2 },
  },
  'vertex': {
    'US': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 8 },
    'EU': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'Japan': { commercial: 4, regulatory: 4, kol: 3, reimbursement: 3 },
    'China': { commercial: 3, regulatory: 3, kol: 2, reimbursement: 2 },
  },
  'gsk': {
    'US': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'EU': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'takeda': {
    'US': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'EU': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'Japan': { commercial: 10, regulatory: 10, kol: 10, reimbursement: 10 },
    'China': { commercial: 5, regulatory: 5, kol: 4, reimbursement: 4 },
  },
  'novo nordisk': {
    'US': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'EU': { commercial: 9, regulatory: 9, kol: 9, reimbursement: 9 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
  'boehringer ingelheim': {
    'US': { commercial: 8, regulatory: 8, kol: 7, reimbursement: 7 },
    'EU': { commercial: 9, regulatory: 9, kol: 8, reimbursement: 8 },
    'Japan': { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 },
    'China': { commercial: 6, regulatory: 6, kol: 5, reimbursement: 5 },
  },
};

// ────────────────────────────────────────────────────────────
// MECHANISM PORTFOLIO APPETITE
// Assesses how actively a partner is building capabilities
// in a given mechanism category based on deal history,
// pipeline focus, and strategic priorities.
// ────────────────────────────────────────────────────────────

function assessPortfolioAppetite(
  partner: PharmaPartnerProfile,
  mechanism?: string,
): PortfolioAppetite[] {
  const results: PortfolioAppetite[] = [];
  if (!mechanism) return results;

  const mechCategories = inferMechanismCategories(mechanism);
  if (mechCategories.length === 0) {
    // Fall back to treating the mechanism string itself as a category
    mechCategories.push(mechanism.toLowerCase());
  }

  const currentYear = new Date().getFullYear();
  const threeYearsAgo = currentYear - 3;

  for (const category of mechCategories) {
    const evidence: string[] = [];
    let dealCount = 0;
    let hasDivestingSignal = false;

    // Check recent_deals for mechanism matches (within 3 years)
    for (const deal of partner.recent_deals) {
      if (deal.year < threeYearsAgo) continue;
      const dealText = `${deal.indication} ${deal.asset} ${deal.deal_type}`.toLowerCase();

      // Look up the MECHANISM_KEYWORDS for this category
      const catKeywords = MECHANISM_KEYWORDS[category] || [category];
      const hasMatch = catKeywords.some((kw) => dealText.includes(kw));

      if (hasMatch) {
        dealCount++;
        evidence.push(`${deal.deal_type} with ${deal.partner} (${deal.year}) - ${deal.indication}`);

        // Check for divesting signals: returned assets, sold, terminated
        const divestSignals = ['return', 'divest', 'terminat', 'sold', 'wind down', 'discontinu'];
        if (divestSignals.some((sig) => dealText.includes(sig))) {
          hasDivestingSignal = true;
        }
      }
    }

    // Check pipeline_focus for mechanism keyword presence
    const catKWs = MECHANISM_KEYWORDS[category] || [category];
    const inPipelineFocus = partner.pipeline_focus.some((f) => {
      const fLower = f.toLowerCase();
      return catKWs.some((kw) => fLower.includes(kw));
    });
    if (inPipelineFocus) {
      evidence.push('Listed in pipeline focus areas');
    }

    // Check strategic_priorities for mechanism signals
    const inStrategicPriorities = partner.strategic_priorities.some((p) => {
      const pLower = p.toLowerCase();
      return catKWs.some((kw) => pLower.includes(kw));
    });
    if (inStrategicPriorities) {
      evidence.push('Mentioned in strategic priorities');
    }

    // Handle divesting case
    if (hasDivestingSignal) {
      results.push({
        mechanism_category: category,
        appetite_level: 'divesting',
        evidence,
        score: 1,
      });
      continue;
    }

    // Assign appetite level based on deal count and pipeline presence
    if (dealCount >= 3) {
      results.push({
        mechanism_category: category,
        appetite_level: 'actively_building',
        evidence,
        score: 9,
      });
    } else if (dealCount >= 1) {
      results.push({
        mechanism_category: category,
        appetite_level: 'established',
        evidence,
        score: 6,
      });
    } else if (inPipelineFocus || inStrategicPriorities) {
      results.push({
        mechanism_category: category,
        appetite_level: 'exploring',
        evidence,
        score: 3,
      });
    }
    // No signal -> don't include (per spec)
  }

  return results;
}

// ────────────────────────────────────────────────────────────
// GEOGRAPHIC REGULATORY STRENGTH LOOKUP
// Returns per-region strength breakdown for a partner across
// the user's offered geography rights.
// ────────────────────────────────────────────────────────────

function getGeographicStrengths(
  partner: PharmaPartnerProfile,
  geographyRights: string[],
): GeographicStrength[] {
  const companyLower = partner.company.toLowerCase();
  const strengths = PARTNER_GEOGRAPHIC_STRENGTHS[companyLower];

  // Normalize geography rights to match lookup keys
  const normalizeGeo = (geo: string): string[] => {
    const g = geo.toLowerCase();
    if (g === 'global') return ['US', 'EU', 'Japan', 'China'];
    if (g === 'eu5') return ['EU'];
    if (g === 'us') return ['US'];
    if (g === 'japan') return ['Japan'];
    if (g === 'china') return ['China'];
    // For other geographies, try to map to a major region
    if (['germany', 'france', 'italy', 'spain', 'uk'].includes(g)) return ['EU'];
    return [geo]; // Return as-is for unknown
  };

  // Deduplicate target regions
  const targetRegions = new Set<string>();
  for (const geo of geographyRights) {
    for (const region of normalizeGeo(geo)) {
      targetRegions.add(region);
    }
  }

  const results: GeographicStrength[] = [];

  for (const region of Array.from(targetRegions)) {
    if (strengths && strengths[region]) {
      const s = strengths[region];
      const overall = Math.round(((s.commercial + s.regulatory + s.kol + s.reimbursement) / 4) * 10) / 10;
      results.push({
        region,
        commercial_strength: s.commercial,
        regulatory_capability: s.regulatory,
        kol_network: s.kol,
        reimbursement_track_record: s.reimbursement,
        overall,
      });
    } else {
      // Estimate based on company_type for partners not in the lookup table
      let baseScores: { commercial: number; regulatory: number; kol: number; reimbursement: number };
      switch (partner.company_type) {
        case 'big_pharma':
          baseScores = { commercial: 7, regulatory: 7, kol: 6, reimbursement: 6 };
          break;
        case 'mid_pharma':
          baseScores = { commercial: 5, regulatory: 5, kol: 4, reimbursement: 4 };
          break;
        case 'specialty_pharma':
          baseScores = { commercial: 4, regulatory: 4, kol: 3, reimbursement: 3 };
          break;
        case 'biotech':
          baseScores = { commercial: 3, regulatory: 3, kol: 2, reimbursement: 2 };
          break;
        default:
          baseScores = { commercial: 4, regulatory: 4, kol: 3, reimbursement: 3 };
      }

      // Adjust: non-US regions generally lower for companies without lookup data
      const regionPenalty = region !== 'US' ? -1 : 0;
      const adj = (v: number) => Math.max(1, v + regionPenalty);

      const overall = Math.round(((adj(baseScores.commercial) + adj(baseScores.regulatory) + adj(baseScores.kol) + adj(baseScores.reimbursement)) / 4) * 10) / 10;
      results.push({
        region,
        commercial_strength: adj(baseScores.commercial),
        regulatory_capability: adj(baseScores.regulatory),
        kol_network: adj(baseScores.kol),
        reimbursement_track_record: adj(baseScores.reimbursement),
        overall,
      });
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────────
// CROSS-ENGINE: COMPETITIVE URGENCY SCORING
// Uses the indication map's major_competitors count to
// determine if competitive density should drive partner urgency.
// More competitors -> partners need to move faster -> bonus.
// ────────────────────────────────────────────────────────────

function scoreCompetitiveUrgency(indication: string): number {
  const indicationData = findIndicationByName(indication);
  if (!indicationData) return 0;

  const competitorCount = indicationData.major_competitors.length;

  if (competitorCount > 8) return 4;
  if (competitorCount > 5) return 2;
  if (competitorCount > 3) return 1;
  return 0;
}

// ────────────────────────────────────────────────────────────
// DEAL STRUCTURE MODEL (Partners 99+)
// Milestone breakdowns, opt-in/opt-out, governance
// ────────────────────────────────────────────────────────────

function buildDealStructureModel(
  partner: PharmaPartnerProfile,
  developmentStage: DevelopmentStage,
  therapyArea: string,
): DealStructureModel {
  // Upfront % of total by stage
  const UPFRONT_PCT: Record<DevelopmentStage, number> = {
    preclinical: 0.07,
    phase1: 0.10,
    phase2: 0.15,
    phase3: 0.22,
    approved: 0.32,
  };

  // Milestone split by stage (clinical_pct / commercial_pct)
  const MILESTONE_SPLIT: Record<DevelopmentStage, { clinical: number; commercial: number }> = {
    preclinical: { clinical: 0.65, commercial: 0.35 },
    phase1: { clinical: 0.60, commercial: 0.40 },
    phase2: { clinical: 0.55, commercial: 0.45 },
    phase3: { clinical: 0.40, commercial: 0.60 },
    approved: { clinical: 0.25, commercial: 0.75 },
  };

  // Opt-in/opt-out probability by stage
  const OPT_PROBABILITY: Record<DevelopmentStage, number> = {
    preclinical: 0.65,
    phase1: 0.55,
    phase2: 0.40,
    phase3: 0.15,
    approved: 0.05,
  };

  const upfront_pct_of_total = UPFRONT_PCT[developmentStage];
  const milestonePct = 1 - upfront_pct_of_total;
  const split = MILESTONE_SPLIT[developmentStage];
  const clinical_milestones_pct = parseFloat((milestonePct * split.clinical).toFixed(3));
  const commercial_milestones_pct = parseFloat((milestonePct * split.commercial).toFixed(3));

  const optProbability = OPT_PROBABILITY[developmentStage];
  const has_opt_in_opt_out = optProbability > 0.30;
  let opt_in_stage: string | undefined;
  if (has_opt_in_opt_out) {
    if (developmentStage === 'preclinical' || developmentStage === 'phase1') {
      opt_in_stage = 'Phase 2 data';
    } else if (developmentStage === 'phase2') {
      opt_in_stage = 'Phase 3 initiation';
    }
  }

  // Governance by company_type
  let governance_complexity: DealStructureModel['governance_complexity'];
  switch (partner.company_type) {
    case 'big_pharma':
      governance_complexity = 'complex';
      break;
    case 'mid_pharma':
    case 'specialty_pharma':
      governance_complexity = 'moderate';
      break;
    case 'biotech':
    default:
      governance_complexity = 'simple';
      break;
  }

  // Benchmark percentile: count deals in therapy area
  const taLower = therapyArea.toLowerCase().replace(/[\s\-]+/g, '_');
  const dealsInTA = partner.recent_deals.filter((d) => {
    const dealInd = d.indication.toLowerCase();
    return dealInd.includes(taLower) || taLower.split('_').some((t) => t.length > 3 && dealInd.includes(t));
  }).length;
  let benchmark_percentile: number;
  if (dealsInTA > 5) {
    benchmark_percentile = 75;
  } else if (dealsInTA >= 2) {
    benchmark_percentile = 50;
  } else {
    benchmark_percentile = 25;
  }

  const narrativeParts: string[] = [];
  narrativeParts.push(
    `At the ${developmentStage} stage, typical deal structure allocates ~${Math.round(upfront_pct_of_total * 100)}% upfront with the remainder split between clinical milestones (~${Math.round(clinical_milestones_pct * 100)}%) and commercial milestones (~${Math.round(commercial_milestones_pct * 100)}%).`
  );
  if (has_opt_in_opt_out && opt_in_stage) {
    narrativeParts.push(`Opt-in/opt-out clauses are common at this stage (${Math.round(optProbability * 100)}% probability), typically triggered at ${opt_in_stage}.`);
  }
  narrativeParts.push(`Governance with ${partner.company} (${partner.company_type.replace('_', ' ')}) is expected to be ${governance_complexity}.`);
  narrativeParts.push(`Based on ${dealsInTA} recent deal(s) in this therapy area, this structure benchmarks at the ${benchmark_percentile}th percentile.`);

  return {
    upfront_pct_of_total,
    clinical_milestones_pct,
    commercial_milestones_pct,
    has_opt_in_opt_out,
    opt_in_stage,
    governance_complexity,
    benchmark_percentile,
    narrative: narrativeParts.join(' '),
  };
}

// ────────────────────────────────────────────────────────────
// PARTNER PHASE SUCCESS RATES (Partners 99+)
// Development-stage-specific success rates per partner
// ────────────────────────────────────────────────────────────

const PARTNER_DEVELOPMENT_SUCCESS_RATES: Record<string, { p1_p2: number; p2_p3: number; p3_app: number }> = {
  pfizer: { p1_p2: 0.58, p2_p3: 0.48, p3_app: 0.72 },
  roche: { p1_p2: 0.65, p2_p3: 0.55, p3_app: 0.80 },
  novartis: { p1_p2: 0.58, p2_p3: 0.52, p3_app: 0.70 },
  merck: { p1_p2: 0.60, p2_p3: 0.50, p3_app: 0.75 },
  'johnson & johnson': { p1_p2: 0.55, p2_p3: 0.48, p3_app: 0.68 },
  janssen: { p1_p2: 0.55, p2_p3: 0.48, p3_app: 0.68 },
  astrazeneca: { p1_p2: 0.57, p2_p3: 0.50, p3_app: 0.73 },
  bms: { p1_p2: 0.55, p2_p3: 0.47, p3_app: 0.70 },
  'eli lilly': { p1_p2: 0.62, p2_p3: 0.53, p3_app: 0.78 },
  lilly: { p1_p2: 0.62, p2_p3: 0.53, p3_app: 0.78 },
  abbvie: { p1_p2: 0.56, p2_p3: 0.50, p3_app: 0.72 },
  gilead: { p1_p2: 0.54, p2_p3: 0.46, p3_app: 0.68 },
  sanofi: { p1_p2: 0.52, p2_p3: 0.45, p3_app: 0.65 },
  amgen: { p1_p2: 0.58, p2_p3: 0.50, p3_app: 0.72 },
  biogen: { p1_p2: 0.50, p2_p3: 0.40, p3_app: 0.45 },
  regeneron: { p1_p2: 0.63, p2_p3: 0.55, p3_app: 0.82 },
  vertex: { p1_p2: 0.65, p2_p3: 0.58, p3_app: 0.85 },
  gsk: { p1_p2: 0.52, p2_p3: 0.45, p3_app: 0.65 },
  takeda: { p1_p2: 0.53, p2_p3: 0.46, p3_app: 0.67 },
  'novo nordisk': { p1_p2: 0.60, p2_p3: 0.55, p3_app: 0.80 },
  'boehringer ingelheim': { p1_p2: 0.55, p2_p3: 0.48, p3_app: 0.70 },
  daiichi: { p1_p2: 0.55, p2_p3: 0.50, p3_app: 0.72 },
  'daiichi sankyo': { p1_p2: 0.55, p2_p3: 0.50, p3_app: 0.72 },
  seagen: { p1_p2: 0.52, p2_p3: 0.45, p3_app: 0.65 },
  incyte: { p1_p2: 0.50, p2_p3: 0.42, p3_app: 0.60 },
};

const COMPANY_TYPE_SUCCESS_DEFAULTS: Record<string, { p1_p2: number; p2_p3: number; p3_app: number }> = {
  big_pharma: { p1_p2: 0.56, p2_p3: 0.48, p3_app: 0.70 },
  mid_pharma: { p1_p2: 0.50, p2_p3: 0.42, p3_app: 0.62 },
  specialty_pharma: { p1_p2: 0.45, p2_p3: 0.38, p3_app: 0.55 },
  biotech: { p1_p2: 0.45, p2_p3: 0.38, p3_app: 0.55 },
};

function buildPartnerPhaseSuccessRates(
  partner: PharmaPartnerProfile,
): PartnerPhaseSuccessRates {
  const companyLower = partner.company.toLowerCase();

  // Try exact match first
  let rates = PARTNER_DEVELOPMENT_SUCCESS_RATES[companyLower];

  // Try partial match if no exact match
  if (!rates) {
    for (const [key, value] of Object.entries(PARTNER_DEVELOPMENT_SUCCESS_RATES)) {
      if (companyLower.includes(key) || key.includes(companyLower)) {
        rates = value;
        break;
      }
    }
  }

  // Fall back to company_type defaults
  if (!rates) {
    rates = COMPANY_TYPE_SUCCESS_DEFAULTS[partner.company_type] ?? COMPANY_TYPE_SUCCESS_DEFAULTS.big_pharma;
  }

  const overall_success_rate = parseFloat((rates.p1_p2 * rates.p2_p3 * rates.p3_app).toFixed(4));

  const narrativeParts: string[] = [];
  narrativeParts.push(
    `${partner.company}'s historical development success rates: Phase 1→2 ${Math.round(rates.p1_p2 * 100)}%, Phase 2→3 ${Math.round(rates.p2_p3 * 100)}%, Phase 3→Approval ${Math.round(rates.p3_app * 100)}%.`
  );
  narrativeParts.push(
    `Overall probability of advancing from Phase 1 to approval: ${(overall_success_rate * 100).toFixed(1)}%.`
  );
  if (overall_success_rate > 0.25) {
    narrativeParts.push('This is above-average development execution, indicating strong clinical operations and regulatory capabilities.');
  } else if (overall_success_rate > 0.15) {
    narrativeParts.push('This represents average industry development execution.');
  } else {
    narrativeParts.push('Below-average development success rate — factor this into risk assessment for partnered assets.');
  }

  return {
    company: partner.company,
    phase1_to_phase2_pct: rates.p1_p2,
    phase2_to_phase3_pct: rates.p2_p3,
    phase3_to_approval_pct: rates.p3_app,
    overall_success_rate,
    narrative: narrativeParts.join(' '),
  };
}

// ────────────────────────────────────────────────────────────
// NEGOTIATION LEVERAGE (Partners 99+)
// 6-factor leverage assessment
// ────────────────────────────────────────────────────────────

function assessNegotiationLeverage(
  input: PartnerDiscoveryInput,
  qualifiedPartnerCount: number,
  indication: ReturnType<typeof findIndicationByName>,
): NegotiationLeverage {
  const factors: NegotiationLeverageFactor[] = [];

  // Factor 1: Competing bidders
  let biddersScore: number;
  if (qualifiedPartnerCount > 10) biddersScore = 8;
  else if (qualifiedPartnerCount >= 7) biddersScore = 6;
  else if (qualifiedPartnerCount >= 4) biddersScore = 4;
  else biddersScore = 2;
  factors.push({
    factor: 'Competing bidders',
    direction: biddersScore > 5 ? 'strengthens' : 'weakens',
    weight: 1.5,
    narrative: `${qualifiedPartnerCount} qualified partners identified — ${biddersScore > 5 ? 'strong competitive tension among potential bidders' : 'limited pool may reduce negotiating power'}.`,
  });

  // Factor 2: Asset scarcity
  const competitorCount = indication?.major_competitors?.length ?? 5;
  let scarcityScore: number;
  if (competitorCount < 3) scarcityScore = 9;
  else if (competitorCount <= 5) scarcityScore = 6;
  else if (competitorCount <= 8) scarcityScore = 4;
  else scarcityScore = 2;
  factors.push({
    factor: 'Asset scarcity',
    direction: scarcityScore > 5 ? 'strengthens' : 'weakens',
    weight: 1.5,
    narrative: `${competitorCount} competitor(s) in the space — ${scarcityScore > 5 ? 'scarce assets command premium terms' : 'multiple alternatives reduce perceived uniqueness'}.`,
  });

  // Factor 3: Differentiation
  const mechText = (input.mechanism || '').toLowerCase();
  const hasDifferentiation = mechText.includes('first') || mechText.includes('biomarker') ||
    mechText.includes('novel') || mechText.includes('selective') || mechText.includes('precision');
  const diffScore = hasDifferentiation ? 8 : 4;
  factors.push({
    factor: 'Mechanism differentiation',
    direction: diffScore > 5 ? 'strengthens' : 'weakens',
    weight: 1.0,
    narrative: hasDifferentiation
      ? 'Differentiated mechanism/biomarker strategy enhances negotiating position.'
      : 'Mechanism is not clearly differentiated from competitors, limiting premium positioning.',
  });

  // Factor 4: Seller time pressure
  const SELLER_PRESSURE: Record<DevelopmentStage, number> = {
    preclinical: 2,
    phase1: 3,
    phase2: 5,
    phase3: 7,
    approved: 3,
  };
  const sellerPressureScore = SELLER_PRESSURE[input.development_stage];
  factors.push({
    factor: 'Seller time pressure',
    direction: sellerPressureScore > 5 ? 'weakens' : 'strengthens',
    weight: 1.0,
    narrative: sellerPressureScore > 5
      ? `${input.development_stage} stage creates urgency to close — partners may sense time pressure.`
      : `${input.development_stage} stage affords time to run a proper process without appearing desperate.`,
  });

  // Factor 5: Buyer time pressure (LOE-driven)
  const currentYear = 2026;
  let partnersWithNearLOE = 0;
  for (const [, events] of Object.entries(MAJOR_LOE_EVENTS)) {
    const hasNearLOE = events.some((e) => e.loe_year >= currentYear && e.loe_year <= currentYear + 3);
    if (hasNearLOE) partnersWithNearLOE++;
  }
  const buyerPressureScore = partnersWithNearLOE > 10 ? 7 : partnersWithNearLOE > 5 ? 5 : 3;
  factors.push({
    factor: 'Buyer time pressure (LOE-driven)',
    direction: buyerPressureScore > 5 ? 'strengthens' : 'weakens',
    weight: 1.0,
    narrative: `${partnersWithNearLOE} major pharma companies face significant LOE events within 3 years — ${buyerPressureScore > 5 ? 'creating urgency to acquire pipeline assets' : 'limited near-term LOE pressure reduces buyer urgency'}.`,
  });

  // Factor 6: Competitive dynamics
  const compDynamicsScore = competitorCount > 5 ? 7 : competitorCount < 3 ? 3 : 5;
  factors.push({
    factor: 'Competitive dynamics',
    direction: compDynamicsScore > 5 ? 'strengthens' : 'weakens',
    weight: 1.0,
    narrative: compDynamicsScore > 5
      ? 'Hot therapeutic space with many competitors drives bidder interest and urgency.'
      : 'Less competitive space may reduce the number of motivated acquirers.',
  });

  // Weighted average
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const scores = [biddersScore, scarcityScore, diffScore, sellerPressureScore, buyerPressureScore, compDynamicsScore];
  const leverage_score = parseFloat(
    (factors.reduce((s, f, i) => s + scores[i] * f.weight, 0) / totalWeight).toFixed(2)
  );

  let overall_leverage: NegotiationLeverage['overall_leverage'];
  if (leverage_score > 6.5) overall_leverage = 'strong';
  else if (leverage_score >= 4) overall_leverage = 'moderate';
  else overall_leverage = 'weak';

  const estimated_competing_bidders = Math.round(qualifiedPartnerCount * 0.4);

  const narrative = `Overall negotiation leverage is ${overall_leverage} (score: ${leverage_score}/10). ` +
    `An estimated ${estimated_competing_bidders} active bidders may compete for this asset. ` +
    (overall_leverage === 'strong'
      ? 'Conditions favor the seller — consider structured auction process to maximize terms.'
      : overall_leverage === 'moderate'
        ? 'Balanced dynamics — a well-run process can still generate competitive tension.'
        : 'Limited leverage — consider bilateral discussions with the strongest strategic fits.');

  return {
    overall_leverage,
    leverage_score,
    factors,
    estimated_competing_bidders,
    asset_scarcity_score: scarcityScore,
    time_pressure_seller: sellerPressureScore,
    time_pressure_buyer: buyerPressureScore,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// LOE GAP ANALYSIS (Partners 99+)
// Strategic fit: partner LOE timeline vs user asset launch
// ────────────────────────────────────────────────────────────

function buildLOEGapAnalysis(
  partner: PharmaPartnerProfile,
  userLaunchYear: number,
  indication: string,
): LOEGapAnalysis | undefined {
  const companyLower = partner.company.toLowerCase();

  // Look up LOE events for this partner
  const loeEvents = MAJOR_LOE_EVENTS[companyLower];
  if (!loeEvents || loeEvents.length === 0) return undefined;

  const currentYear = 2026;

  // Filter to upcoming LOE events
  const upcomingLOE = loeEvents.filter((e) => e.loe_year >= currentYear);
  if (upcomingLOE.length === 0) return undefined;

  // Build drug list with revenue_at_risk_b
  const upcoming_loe_drugs = upcomingLOE.map((e) => ({
    drug: e.drug,
    loe_year: e.loe_year,
    revenue_at_risk_b: e.revenue_b,
  }));

  // Find the year of maximum revenue exposure
  const revenue_gap_year = upcomingLOE.reduce(
    (max, e) => (e.revenue_b > max.revenue_b ? e : max),
    upcomingLOE[0]
  ).loe_year;

  // Determine gap severity based on max revenue at risk
  const maxRevenue = Math.max(...upcomingLOE.map((e) => e.revenue_b));
  let gap_severity: LOEGapAnalysis['gap_severity'];
  if (maxRevenue > 5) gap_severity = 'critical';
  else if (maxRevenue >= 2) gap_severity = 'significant';
  else if (maxRevenue >= 1) gap_severity = 'moderate';
  else gap_severity = 'minimal';

  // Check if user's asset launch fills the gap: within [-1, +3] of any LOE drug's loe_year
  const user_asset_fills_gap = upcomingLOE.some(
    (e) => userLaunchYear >= e.loe_year - 1 && userLaunchYear <= e.loe_year + 3
  );

  const narrativeParts: string[] = [];
  narrativeParts.push(
    `${partner.company} faces ${gap_severity} LOE exposure with ${upcoming_loe_drugs.length} drug(s) losing exclusivity: ${upcoming_loe_drugs.map((d) => `${d.drug} (${d.loe_year}, $${d.revenue_at_risk_b}B)`).join('; ')}.`
  );
  narrativeParts.push(`Peak revenue gap expected in ${revenue_gap_year}.`);
  if (user_asset_fills_gap) {
    narrativeParts.push(`Your asset's projected launch in ${userLaunchYear} is well-positioned to fill this revenue gap, creating strong strategic alignment for a partnership.`);
  } else {
    narrativeParts.push(`Your asset's projected launch in ${userLaunchYear} does not directly overlap with the LOE gap window, reducing the strategic urgency for ${partner.company}.`);
  }

  return {
    partner: partner.company,
    upcoming_loe_drugs,
    revenue_gap_year,
    gap_severity,
    user_asset_fills_gap,
    narrative: narrativeParts.join(' '),
  };
}

// ════════════════════════════════════════════════════════════
// DEVICE-SPECIFIC PARTNER ANALYTICS (4 functions)
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// DATA TABLE: MEDTECH SERIAL ACQUIRER STATISTICS
// Source: SEC filings, MedTech Strategist, Capital IQ (2020-2025)
// ────────────────────────────────────────────────────────────

interface MedtechAcquirerStats {
  company: string;
  acquisitions_last_3yr: number;
  acquisitions_last_5yr: number;
  avg_deal_size_m: number;
  preferred_categories: DeviceCategory[];
  revenue_b: number;
  organic_growth_pct: number;
}

const MEDTECH_SERIAL_ACQUIRER_STATS: MedtechAcquirerStats[] = [
  { company: 'Medtronic', acquisitions_last_3yr: 8, acquisitions_last_5yr: 12, avg_deal_size_m: 800, preferred_categories: ['cardiovascular', 'neurology', 'diabetes_metabolic'], revenue_b: 32, organic_growth_pct: 4.5 },
  { company: 'Abbott', acquisitions_last_3yr: 5, acquisitions_last_5yr: 8, avg_deal_size_m: 1200, preferred_categories: ['cardiovascular', 'ivd_oncology', 'ivd_cardiology', 'ivd_infectious'], revenue_b: 40, organic_growth_pct: 5.0 },
  { company: 'Boston Scientific', acquisitions_last_3yr: 10, acquisitions_last_5yr: 15, avg_deal_size_m: 600, preferred_categories: ['cardiovascular', 'endoscopy_gi', 'urology', 'neurology'], revenue_b: 15, organic_growth_pct: 7.0 },
  { company: 'Stryker', acquisitions_last_3yr: 7, acquisitions_last_5yr: 10, avg_deal_size_m: 1500, preferred_categories: ['orthopedic', 'neurology', 'general_surgery'], revenue_b: 20, organic_growth_pct: 6.5 },
  { company: 'Johnson & Johnson MedTech', acquisitions_last_3yr: 4, acquisitions_last_5yr: 6, avg_deal_size_m: 2000, preferred_categories: ['orthopedic', 'general_surgery', 'cardiovascular'], revenue_b: 30, organic_growth_pct: 3.5 },
  { company: 'Edwards Lifesciences', acquisitions_last_3yr: 3, acquisitions_last_5yr: 4, avg_deal_size_m: 400, preferred_categories: ['cardiovascular'], revenue_b: 6.4, organic_growth_pct: 8.0 },
  { company: 'Zimmer Biomet', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 500, preferred_categories: ['orthopedic'], revenue_b: 7.4, organic_growth_pct: 3.0 },
  { company: 'Intuitive Surgical', acquisitions_last_3yr: 2, acquisitions_last_5yr: 3, avg_deal_size_m: 200, preferred_categories: ['general_surgery'], revenue_b: 7.1, organic_growth_pct: 14.0 },
  { company: 'Becton Dickinson (BD)', acquisitions_last_3yr: 2, acquisitions_last_5yr: 4, avg_deal_size_m: 1000, preferred_categories: ['ivd_infectious', 'general_surgery', 'vascular'], revenue_b: 20, organic_growth_pct: 4.0 },
  { company: 'Hologic', acquisitions_last_3yr: 4, acquisitions_last_5yr: 6, avg_deal_size_m: 300, preferred_categories: ['ivd_oncology', 'ivd_genetics', 'ivd_infectious'], revenue_b: 4.0, organic_growth_pct: 3.5 },
  { company: 'Danaher (Beckman Coulter)', acquisitions_last_3yr: 4, acquisitions_last_5yr: 8, avg_deal_size_m: 2000, preferred_categories: ['ivd_oncology', 'ivd_infectious', 'ivd_genetics'], revenue_b: 24, organic_growth_pct: 5.0 },
  { company: 'Baxter International', acquisitions_last_3yr: 2, acquisitions_last_5yr: 3, avg_deal_size_m: 4000, preferred_categories: ['renal_dialysis', 'general_surgery'], revenue_b: 15, organic_growth_pct: 2.0 },
  { company: 'Teleflex', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 400, preferred_categories: ['vascular', 'urology', 'general_surgery'], revenue_b: 2.9, organic_growth_pct: 5.5 },
  { company: 'Smith+Nephew', acquisitions_last_3yr: 2, acquisitions_last_5yr: 4, avg_deal_size_m: 600, preferred_categories: ['orthopedic', 'wound_care'], revenue_b: 5.6, organic_growth_pct: 3.0 },
  { company: 'Philips', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 1500, preferred_categories: ['imaging_radiology', 'cardiovascular'], revenue_b: 18, organic_growth_pct: 2.5 },
  { company: 'GE HealthCare', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 300, preferred_categories: ['imaging_radiology', 'cardiovascular'], revenue_b: 19.6, organic_growth_pct: 4.0 },
  { company: 'Siemens Healthineers', acquisitions_last_3yr: 2, acquisitions_last_5yr: 4, avg_deal_size_m: 5000, preferred_categories: ['imaging_radiology', 'oncology_radiation', 'ivd_oncology'], revenue_b: 22, organic_growth_pct: 5.0 },
  { company: 'Globus Medical', acquisitions_last_3yr: 2, acquisitions_last_5yr: 3, avg_deal_size_m: 1500, preferred_categories: ['orthopedic'], revenue_b: 2.4, organic_growth_pct: 8.0 },
  { company: 'Roche Diagnostics', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 800, preferred_categories: ['ivd_oncology', 'ivd_infectious', 'ivd_genetics'], revenue_b: 17, organic_growth_pct: 4.0 },
  { company: 'Illumina', acquisitions_last_3yr: 1, acquisitions_last_5yr: 3, avg_deal_size_m: 3000, preferred_categories: ['ivd_genetics', 'ivd_oncology'], revenue_b: 4.5, organic_growth_pct: 2.0 },
  { company: 'Alcon', acquisitions_last_3yr: 3, acquisitions_last_5yr: 5, avg_deal_size_m: 500, preferred_categories: ['ophthalmology'], revenue_b: 9.4, organic_growth_pct: 6.0 },
  { company: 'ResMed', acquisitions_last_3yr: 2, acquisitions_last_5yr: 4, avg_deal_size_m: 500, preferred_categories: ['respiratory'], revenue_b: 4.2, organic_growth_pct: 8.0 },
  { company: 'Coloplast', acquisitions_last_3yr: 2, acquisitions_last_5yr: 4, avg_deal_size_m: 1200, preferred_categories: ['wound_care', 'urology'], revenue_b: 3.0, organic_growth_pct: 5.0 },
  { company: 'Olympus Corporation', acquisitions_last_3yr: 2, acquisitions_last_5yr: 3, avg_deal_size_m: 200, preferred_categories: ['endoscopy_gi', 'general_surgery', 'urology'], revenue_b: 7.5, organic_growth_pct: 5.0 },
  { company: 'Terumo Corporation', acquisitions_last_3yr: 2, acquisitions_last_5yr: 3, avg_deal_size_m: 300, preferred_categories: ['cardiovascular', 'vascular'], revenue_b: 6.8, organic_growth_pct: 5.5 },
];

/**
 * Function 1: buildDeviceAcquisitionProbability
 * Serial acquirer scoring + revenue gap analysis for medtech companies.
 */
function buildDeviceAcquisitionProbability(
  partner: DevicePartnerProfile,
  deviceCategory: DeviceCategory,
): DeviceAcquisitionProbability {
  const companyLower = partner.company.toLowerCase();
  const stats = MEDTECH_SERIAL_ACQUIRER_STATS.find(
    (s) => companyLower.includes(s.company.toLowerCase()) || s.company.toLowerCase().includes(companyLower)
  );

  // Defaults for unknown companies
  const acq3yr = stats?.acquisitions_last_3yr ?? (partner.company_type === 'large_medtech' ? 3 : 1);
  const acq5yr = stats?.acquisitions_last_5yr ?? (partner.company_type === 'large_medtech' ? 5 : 2);
  const avgDealSizeM = stats?.avg_deal_size_m ?? 300;
  const preferredCats = stats?.preferred_categories ?? [];
  const revenueB = stats?.revenue_b ?? (partner.revenue_b ?? 1);
  const organicGrowthPct = stats?.organic_growth_pct ?? 4.0;

  // 1) Serial acquirer score (0-10 based on 5yr deal frequency)
  let serialAcquirerScore: number;
  if (acq5yr >= 12) serialAcquirerScore = 10;
  else if (acq5yr >= 8) serialAcquirerScore = 8;
  else if (acq5yr >= 5) serialAcquirerScore = 6;
  else if (acq5yr >= 3) serialAcquirerScore = 4;
  else serialAcquirerScore = 2;

  // 2) Revenue gap calculation
  // Growth target typically 6-8% for large medtech; organic growth fills some
  const growthTargetPct = revenueB >= 10 ? 6 : 8;
  const revenueGapPct = Math.max(0, growthTargetPct - organicGrowthPct);
  const revenueGapToFillB = parseFloat(((revenueB * revenueGapPct) / 100).toFixed(2));

  // 3) Category match score (0-10)
  let categoryRelevance = 0;
  if (preferredCats.includes(deviceCategory)) {
    categoryRelevance = 10;
  } else {
    // Check for adjacency (same broad family)
    const categoryFamilies: Record<string, DeviceCategory[]> = {
      cardio: ['cardiovascular', 'vascular'],
      ortho: ['orthopedic'],
      neuro: ['neurology'],
      gi: ['endoscopy_gi'],
      dx_onc: ['ivd_oncology', 'oncology_surgical', 'oncology_radiation'],
      dx_gen: ['ivd_infectious', 'ivd_cardiology', 'ivd_genetics'],
      img: ['imaging_radiology'],
    };
    for (const cats of Object.values(categoryFamilies)) {
      if (cats.includes(deviceCategory) && preferredCats.some((pc) => cats.includes(pc))) {
        categoryRelevance = 6;
        break;
      }
    }
  }

  // Category deal frequency (how many past deals in this category per year)
  const categoryDealFrequency = preferredCats.includes(deviceCategory)
    ? parseFloat((acq5yr / 5).toFixed(1))
    : 0;

  // 4) Financial capacity (0-10)
  let financialCapacity: number;
  const mcapB = partner.market_cap_b ?? revenueB * 3;
  if (mcapB >= 100) financialCapacity = 10;
  else if (mcapB >= 50) financialCapacity = 8;
  else if (mcapB >= 20) financialCapacity = 6;
  else if (mcapB >= 5) financialCapacity = 4;
  else financialCapacity = 2;

  // 5) Acquisition probability formula
  const rawScore =
    (serialAcquirerScore / 10) * 0.3 +
    (categoryRelevance / 10) * 0.3 +
    (Math.min(revenueGapToFillB, 3) / 3) * 0.2 +
    (financialCapacity / 10) * 0.2;
  const acquisitionProbabilityPct = Math.round(Math.min(85, rawScore * 100));

  // 6) Key signals
  const keySignals: string[] = [];
  if (acq5yr >= 10) keySignals.push(`Serial acquirer with ${acq5yr} deals in 5 years`);
  else if (acq5yr >= 5) keySignals.push(`Active acquirer with ${acq5yr} deals in 5 years`);
  if (categoryRelevance >= 8) keySignals.push(`Active in ${deviceCategory} category`);
  if (revenueGapToFillB > 0.5) keySignals.push(`Revenue gap of $${revenueGapToFillB.toFixed(1)}B to fill through M&A`);
  if (financialCapacity >= 8) keySignals.push(`Strong financial capacity (market cap ~$${Math.round(mcapB)}B)`);
  if (acq3yr >= 5) keySignals.push(`Accelerating deal pace: ${acq3yr} acquisitions in last 3 years`);
  if (organicGrowthPct < 4) keySignals.push(`Low organic growth (${organicGrowthPct}%) increases M&A dependency`);

  const narrative = `${partner.company} has completed ${acq5yr} acquisitions in the last 5 years (avg $${avgDealSizeM}M). `
    + `Organic growth of ${organicGrowthPct}% vs. ${growthTargetPct}% target creates a $${revenueGapToFillB.toFixed(1)}B annual revenue gap to fill through M&A. `
    + (categoryRelevance >= 8
      ? `Historically active in ${deviceCategory}, making this a strong category fit.`
      : `Not historically focused on ${deviceCategory}, which may lower deal priority.`);

  return {
    serial_acquirer_score: serialAcquirerScore,
    acquisitions_last_3yr: acq3yr,
    acquisitions_last_5yr: acq5yr,
    avg_deal_size_m: avgDealSizeM,
    revenue_gap_to_fill_b: revenueGapToFillB,
    category_deal_frequency: categoryDealFrequency,
    acquisition_probability_pct: acquisitionProbabilityPct,
    key_signals: keySignals,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// DATA TABLE: MEDTECH REGULATORY TRACK RECORDS
// Source: FDA CDRH databases, AccessData, company 10-K filings
// ────────────────────────────────────────────────────────────

interface MedtechRegulatoryRecord {
  company: string;
  total_510k_clearances: number;
  total_pma_approvals: number;
  avg_510k_review_days: number;
  avg_pma_review_months: number;
  fda_warning_letters_5yr: number;
  breakthrough_designations: number;
}

const MEDTECH_REGULATORY_TRACK_RECORDS: MedtechRegulatoryRecord[] = [
  { company: 'Medtronic', total_510k_clearances: 520, total_pma_approvals: 85, avg_510k_review_days: 155, avg_pma_review_months: 11, fda_warning_letters_5yr: 2, breakthrough_designations: 12 },
  { company: 'Abbott', total_510k_clearances: 360, total_pma_approvals: 55, avg_510k_review_days: 160, avg_pma_review_months: 12, fda_warning_letters_5yr: 1, breakthrough_designations: 8 },
  { company: 'Boston Scientific', total_510k_clearances: 310, total_pma_approvals: 48, avg_510k_review_days: 165, avg_pma_review_months: 13, fda_warning_letters_5yr: 1, breakthrough_designations: 10 },
  { company: 'Johnson & Johnson MedTech', total_510k_clearances: 420, total_pma_approvals: 62, avg_510k_review_days: 170, avg_pma_review_months: 13, fda_warning_letters_5yr: 3, breakthrough_designations: 6 },
  { company: 'Stryker', total_510k_clearances: 260, total_pma_approvals: 22, avg_510k_review_days: 150, avg_pma_review_months: 10, fda_warning_letters_5yr: 0, breakthrough_designations: 4 },
  { company: 'Edwards Lifesciences', total_510k_clearances: 85, total_pma_approvals: 18, avg_510k_review_days: 145, avg_pma_review_months: 14, fda_warning_letters_5yr: 0, breakthrough_designations: 6 },
  { company: 'Zimmer Biomet', total_510k_clearances: 280, total_pma_approvals: 15, avg_510k_review_days: 165, avg_pma_review_months: 12, fda_warning_letters_5yr: 2, breakthrough_designations: 2 },
  { company: 'Intuitive Surgical', total_510k_clearances: 120, total_pma_approvals: 5, avg_510k_review_days: 140, avg_pma_review_months: 10, fda_warning_letters_5yr: 0, breakthrough_designations: 3 },
  { company: 'Becton Dickinson (BD)', total_510k_clearances: 350, total_pma_approvals: 20, avg_510k_review_days: 158, avg_pma_review_months: 11, fda_warning_letters_5yr: 1, breakthrough_designations: 3 },
  { company: 'Hologic', total_510k_clearances: 180, total_pma_approvals: 15, avg_510k_review_days: 150, avg_pma_review_months: 12, fda_warning_letters_5yr: 0, breakthrough_designations: 4 },
  { company: 'Danaher (Beckman Coulter)', total_510k_clearances: 400, total_pma_approvals: 30, avg_510k_review_days: 155, avg_pma_review_months: 11, fda_warning_letters_5yr: 1, breakthrough_designations: 5 },
  { company: 'Baxter International', total_510k_clearances: 250, total_pma_approvals: 18, avg_510k_review_days: 168, avg_pma_review_months: 13, fda_warning_letters_5yr: 2, breakthrough_designations: 2 },
  { company: 'Teleflex', total_510k_clearances: 190, total_pma_approvals: 8, avg_510k_review_days: 155, avg_pma_review_months: 11, fda_warning_letters_5yr: 0, breakthrough_designations: 2 },
  { company: 'Smith+Nephew', total_510k_clearances: 200, total_pma_approvals: 10, avg_510k_review_days: 162, avg_pma_review_months: 12, fda_warning_letters_5yr: 1, breakthrough_designations: 3 },
  { company: 'Philips', total_510k_clearances: 300, total_pma_approvals: 25, avg_510k_review_days: 170, avg_pma_review_months: 14, fda_warning_letters_5yr: 3, breakthrough_designations: 5 },
  { company: 'GE HealthCare', total_510k_clearances: 350, total_pma_approvals: 20, avg_510k_review_days: 165, avg_pma_review_months: 13, fda_warning_letters_5yr: 1, breakthrough_designations: 4 },
  { company: 'Siemens Healthineers', total_510k_clearances: 320, total_pma_approvals: 22, avg_510k_review_days: 168, avg_pma_review_months: 13, fda_warning_letters_5yr: 1, breakthrough_designations: 5 },
  { company: 'Globus Medical', total_510k_clearances: 140, total_pma_approvals: 4, avg_510k_review_days: 148, avg_pma_review_months: 10, fda_warning_letters_5yr: 0, breakthrough_designations: 2 },
  { company: 'Roche Diagnostics', total_510k_clearances: 280, total_pma_approvals: 35, avg_510k_review_days: 160, avg_pma_review_months: 12, fda_warning_letters_5yr: 0, breakthrough_designations: 6 },
  { company: 'Illumina', total_510k_clearances: 60, total_pma_approvals: 8, avg_510k_review_days: 175, avg_pma_review_months: 15, fda_warning_letters_5yr: 0, breakthrough_designations: 3 },
  { company: 'Alcon', total_510k_clearances: 220, total_pma_approvals: 18, avg_510k_review_days: 155, avg_pma_review_months: 12, fda_warning_letters_5yr: 0, breakthrough_designations: 3 },
  { company: 'ResMed', total_510k_clearances: 130, total_pma_approvals: 5, avg_510k_review_days: 148, avg_pma_review_months: 10, fda_warning_letters_5yr: 0, breakthrough_designations: 2 },
  { company: 'Coloplast', total_510k_clearances: 110, total_pma_approvals: 6, avg_510k_review_days: 165, avg_pma_review_months: 13, fda_warning_letters_5yr: 0, breakthrough_designations: 1 },
  { company: 'Olympus Corporation', total_510k_clearances: 180, total_pma_approvals: 8, avg_510k_review_days: 170, avg_pma_review_months: 14, fda_warning_letters_5yr: 2, breakthrough_designations: 2 },
  { company: 'Terumo Corporation', total_510k_clearances: 140, total_pma_approvals: 10, avg_510k_review_days: 160, avg_pma_review_months: 12, fda_warning_letters_5yr: 0, breakthrough_designations: 3 },
];

/**
 * Function 2: buildDeviceRegulatoryTrackRecord
 * FDA clearance/approval track record scoring for medtech companies.
 */
function buildDeviceRegulatoryTrackRecord(
  partner: DevicePartnerProfile,
): DeviceRegulatoryTrackRecord {
  const companyLower = partner.company.toLowerCase();
  const record = MEDTECH_REGULATORY_TRACK_RECORDS.find(
    (r) => companyLower.includes(r.company.toLowerCase()) || r.company.toLowerCase().includes(companyLower)
  );

  if (record) {
    // Clearance volume score (0-3 pts)
    let clearanceVolumeScore = 0;
    const totalClearances = record.total_510k_clearances + record.total_pma_approvals;
    if (totalClearances >= 400) clearanceVolumeScore = 3;
    else if (totalClearances >= 200) clearanceVolumeScore = 2.5;
    else if (totalClearances >= 100) clearanceVolumeScore = 2;
    else if (totalClearances >= 50) clearanceVolumeScore = 1;
    else clearanceVolumeScore = 0.5;

    // Review speed vs median (0-3 pts) — median 510(k) is ~174 days
    let reviewSpeedScore = 0;
    const median510kDays = 174;
    if (record.avg_510k_review_days <= median510kDays - 20) reviewSpeedScore = 3;
    else if (record.avg_510k_review_days <= median510kDays - 10) reviewSpeedScore = 2.5;
    else if (record.avg_510k_review_days <= median510kDays) reviewSpeedScore = 2;
    else if (record.avg_510k_review_days <= median510kDays + 10) reviewSpeedScore = 1;
    else reviewSpeedScore = 0.5;

    // Clean compliance (0-2 pts)
    let complianceScore = 0;
    if (record.fda_warning_letters_5yr === 0) complianceScore = 2;
    else if (record.fda_warning_letters_5yr === 1) complianceScore = 1;
    else complianceScore = 0;

    // Breakthrough designations (0-2 pts)
    let breakthroughScore = 0;
    if (record.breakthrough_designations >= 8) breakthroughScore = 2;
    else if (record.breakthrough_designations >= 4) breakthroughScore = 1.5;
    else if (record.breakthrough_designations >= 2) breakthroughScore = 1;
    else breakthroughScore = 0.5;

    const capabilityScore = Math.round((clearanceVolumeScore + reviewSpeedScore + complianceScore + breakthroughScore) * 10) / 10;

    const narrative = `${partner.company} has ${record.total_510k_clearances}+ 510(k) clearances and ${record.total_pma_approvals}+ PMA approvals. `
      + `Average 510(k) review: ${record.avg_510k_review_days} days (vs. industry median ~174). `
      + (record.fda_warning_letters_5yr === 0
        ? 'Clean compliance record with no FDA warning letters in 5 years. '
        : `${record.fda_warning_letters_5yr} FDA warning letter(s) in 5 years. `)
      + `${record.breakthrough_designations} breakthrough device designations secured.`;

    return {
      total_510k_clearances: record.total_510k_clearances,
      total_pma_approvals: record.total_pma_approvals,
      avg_510k_review_days: record.avg_510k_review_days,
      avg_pma_review_months: record.avg_pma_review_months,
      fda_warning_letters_5yr: record.fda_warning_letters_5yr,
      breakthrough_designations: record.breakthrough_designations,
      regulatory_capability_score: capabilityScore,
      narrative,
    };
  }

  // Fallback for unknown companies based on company_type
  const typeDefaults: Record<string, { clearances: number; pmas: number; days: number; months: number; warnings: number; breakthroughs: number; score: number }> = {
    large_medtech:      { clearances: 200, pmas: 20, days: 165, months: 12, warnings: 1, breakthroughs: 4, score: 7 },
    mid_medtech:        { clearances: 80, pmas: 5, days: 170, months: 13, warnings: 0, breakthroughs: 1, score: 5 },
    specialty_medtech:  { clearances: 30, pmas: 2, days: 175, months: 14, warnings: 0, breakthroughs: 1, score: 4 },
    diagnostics_major:  { clearances: 150, pmas: 15, days: 165, months: 12, warnings: 0, breakthroughs: 3, score: 5 },
    diagnostics_specialty: { clearances: 40, pmas: 3, days: 175, months: 14, warnings: 0, breakthroughs: 1, score: 4 },
    diagnostics_company:{ clearances: 40, pmas: 3, days: 175, months: 14, warnings: 0, breakthroughs: 1, score: 4 },
    digital_health:     { clearances: 15, pmas: 1, days: 180, months: 15, warnings: 0, breakthroughs: 1, score: 3 },
  };
  const defaults = typeDefaults[partner.company_type] ?? typeDefaults.mid_medtech;

  return {
    total_510k_clearances: defaults.clearances,
    total_pma_approvals: defaults.pmas,
    avg_510k_review_days: defaults.days,
    avg_pma_review_months: defaults.months,
    fda_warning_letters_5yr: defaults.warnings,
    breakthrough_designations: defaults.breakthroughs,
    regulatory_capability_score: defaults.score,
    narrative: `${partner.company} — regulatory track record estimated from company type (${partner.company_type}). Detailed FDA clearance history not available in database.`,
  };
}

// ────────────────────────────────────────────────────────────
// DATA TABLE: MEDTECH DISTRIBUTION PROFILES
// Source: company 10-K filings, GPO contract disclosures,
// MedTech sales force benchmarking reports (2024)
// ────────────────────────────────────────────────────────────

interface MedtechDistributionProfile {
  company: string;
  hospital_direct_sales: number;
  asc_coverage: number;
  office_channel: number;
  lab_channel: number;
  gpo_relationships: string[];
  estimated_us_field_reps: number;
}

const MEDTECH_DISTRIBUTION_PROFILES: MedtechDistributionProfile[] = [
  { company: 'Medtronic', hospital_direct_sales: 10, asc_coverage: 7, office_channel: 5, lab_channel: 2, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust', 'Intalere'], estimated_us_field_reps: 12000 },
  { company: 'Abbott', hospital_direct_sales: 9, asc_coverage: 8, office_channel: 7, lab_channel: 8, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 10000 },
  { company: 'Boston Scientific', hospital_direct_sales: 9, asc_coverage: 8, office_channel: 4, lab_channel: 1, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust'], estimated_us_field_reps: 8000 },
  { company: 'Stryker', hospital_direct_sales: 10, asc_coverage: 6, office_channel: 3, lab_channel: 0, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 9000 },
  { company: 'Johnson & Johnson MedTech', hospital_direct_sales: 10, asc_coverage: 7, office_channel: 5, lab_channel: 3, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust', 'Intalere'], estimated_us_field_reps: 11000 },
  { company: 'Edwards Lifesciences', hospital_direct_sales: 9, asc_coverage: 3, office_channel: 1, lab_channel: 0, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 2500 },
  { company: 'Zimmer Biomet', hospital_direct_sales: 9, asc_coverage: 6, office_channel: 3, lab_channel: 0, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust'], estimated_us_field_reps: 7000 },
  { company: 'Intuitive Surgical', hospital_direct_sales: 8, asc_coverage: 5, office_channel: 1, lab_channel: 0, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 3000 },
  { company: 'Becton Dickinson (BD)', hospital_direct_sales: 9, asc_coverage: 5, office_channel: 6, lab_channel: 7, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust'], estimated_us_field_reps: 6000 },
  { company: 'Hologic', hospital_direct_sales: 7, asc_coverage: 4, office_channel: 6, lab_channel: 8, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 3500 },
  { company: 'Danaher (Beckman Coulter)', hospital_direct_sales: 6, asc_coverage: 2, office_channel: 2, lab_channel: 10, gpo_relationships: ['Premier'], estimated_us_field_reps: 4000 },
  { company: 'Roche Diagnostics', hospital_direct_sales: 7, asc_coverage: 3, office_channel: 2, lab_channel: 10, gpo_relationships: ['Vizient'], estimated_us_field_reps: 5000 },
  { company: 'Baxter International', hospital_direct_sales: 9, asc_coverage: 5, office_channel: 3, lab_channel: 2, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust'], estimated_us_field_reps: 5000 },
  { company: 'Teleflex', hospital_direct_sales: 8, asc_coverage: 6, office_channel: 3, lab_channel: 1, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 3000 },
  { company: 'Smith+Nephew', hospital_direct_sales: 8, asc_coverage: 7, office_channel: 4, lab_channel: 0, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 4500 },
  { company: 'Philips', hospital_direct_sales: 9, asc_coverage: 4, office_channel: 3, lab_channel: 4, gpo_relationships: ['Vizient', 'Premier', 'HealthTrust'], estimated_us_field_reps: 5000 },
  { company: 'GE HealthCare', hospital_direct_sales: 9, asc_coverage: 4, office_channel: 2, lab_channel: 3, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 5000 },
  { company: 'Siemens Healthineers', hospital_direct_sales: 9, asc_coverage: 3, office_channel: 2, lab_channel: 8, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 4500 },
  { company: 'Globus Medical', hospital_direct_sales: 7, asc_coverage: 5, office_channel: 2, lab_channel: 0, gpo_relationships: ['Vizient'], estimated_us_field_reps: 2000 },
  { company: 'Illumina', hospital_direct_sales: 4, asc_coverage: 1, office_channel: 1, lab_channel: 10, gpo_relationships: ['Vizient'], estimated_us_field_reps: 2000 },
  { company: 'Alcon', hospital_direct_sales: 8, asc_coverage: 8, office_channel: 9, lab_channel: 1, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 4000 },
  { company: 'ResMed', hospital_direct_sales: 6, asc_coverage: 3, office_channel: 5, lab_channel: 0, gpo_relationships: ['Vizient'], estimated_us_field_reps: 2500 },
  { company: 'Coloplast', hospital_direct_sales: 6, asc_coverage: 3, office_channel: 5, lab_channel: 0, gpo_relationships: ['Premier'], estimated_us_field_reps: 2000 },
  { company: 'Olympus Corporation', hospital_direct_sales: 8, asc_coverage: 7, office_channel: 4, lab_channel: 1, gpo_relationships: ['Vizient', 'Premier'], estimated_us_field_reps: 3000 },
  { company: 'Terumo Corporation', hospital_direct_sales: 8, asc_coverage: 5, office_channel: 2, lab_channel: 1, gpo_relationships: ['Vizient'], estimated_us_field_reps: 2500 },
];

type TargetSettingType = 'hospital_inpatient' | 'hospital_outpatient' | 'asc' | 'office' | 'lab' | 'home';

/**
 * Function 3: buildDistributionStrength
 * Channel coverage assessment matched against target clinical setting.
 */
function buildDistributionStrength(
  partner: DevicePartnerProfile,
  targetSetting: TargetSettingType,
): DistributionStrengthAssessment {
  const companyLower = partner.company.toLowerCase();
  const profile = MEDTECH_DISTRIBUTION_PROFILES.find(
    (p) => companyLower.includes(p.company.toLowerCase()) || p.company.toLowerCase().includes(companyLower)
  );

  // Defaults for unknown companies
  const hospitalDirect = profile?.hospital_direct_sales ?? (partner.company_type === 'large_medtech' ? 7 : 4);
  const ascCov = profile?.asc_coverage ?? 3;
  const officeCh = profile?.office_channel ?? 2;
  const labCh = profile?.lab_channel ?? (partner.company_type.includes('diagnostics') ? 7 : 1);
  const gpoRels = profile?.gpo_relationships ?? ['Vizient'];
  const fieldReps = profile?.estimated_us_field_reps ?? 1500;

  // Score channel-by-channel overlap based on target_setting
  let overallScore: number;

  switch (targetSetting) {
    case 'hospital_inpatient':
      overallScore = hospitalDirect * 0.60 + ascCov * 0.10 + officeCh * 0.05 + labCh * 0.05 + Math.min(10, gpoRels.length * 2.5) * 0.20;
      break;
    case 'hospital_outpatient':
      overallScore = hospitalDirect * 0.40 + ascCov * 0.30 + officeCh * 0.10 + labCh * 0.05 + Math.min(10, gpoRels.length * 2.5) * 0.15;
      break;
    case 'asc':
      overallScore = hospitalDirect * 0.15 + ascCov * 0.55 + officeCh * 0.10 + labCh * 0.05 + Math.min(10, gpoRels.length * 2.5) * 0.15;
      break;
    case 'office':
      overallScore = hospitalDirect * 0.10 + ascCov * 0.10 + officeCh * 0.55 + labCh * 0.05 + Math.min(10, gpoRels.length * 2.5) * 0.20;
      break;
    case 'lab':
      overallScore = hospitalDirect * 0.05 + ascCov * 0.05 + officeCh * 0.05 + labCh * 0.65 + Math.min(10, gpoRels.length * 2.5) * 0.20;
      break;
    case 'home':
      // Home/remote monitoring: special scoring — office + digital distribution capability
      const digitalCapability = Math.min(10, fieldReps / 1000); // Proxy: more reps = better remote coverage
      overallScore = hospitalDirect * 0.05 + ascCov * 0.05 + officeCh * 0.30 + labCh * 0.05 + digitalCapability * 0.40 + Math.min(10, gpoRels.length * 2.5) * 0.15;
      break;
    default:
      overallScore = hospitalDirect * 0.40 + ascCov * 0.20 + officeCh * 0.15 + labCh * 0.10 + Math.min(10, gpoRels.length * 2.5) * 0.15;
  }

  overallScore = Math.round(overallScore * 10) / 10;

  const settingLabels: Record<TargetSettingType, string> = {
    hospital_inpatient: 'hospital inpatient',
    hospital_outpatient: 'hospital outpatient',
    asc: 'ambulatory surgical center',
    office: 'physician office',
    lab: 'clinical laboratory',
    home: 'home/remote monitoring',
  };

  const narrative = `${partner.company} distribution assessment for ${settingLabels[targetSetting]} setting: `
    + `Hospital direct sales ${hospitalDirect}/10, ASC coverage ${ascCov}/10, Office ${officeCh}/10, Lab ${labCh}/10. `
    + `GPO relationships: ${gpoRels.join(', ')}. `
    + `Estimated ${fieldReps.toLocaleString()} US field representatives. `
    + `Overall distribution alignment score: ${overallScore.toFixed(1)}/10.`;

  return {
    hospital_direct_sales: hospitalDirect,
    asc_coverage: ascCov,
    office_channel: officeCh,
    lab_channel: labCh,
    gpo_relationships: gpoRels,
    estimated_us_field_reps: fieldReps,
    overall_distribution_score: overallScore,
    narrative,
  };
}

// ────────────────────────────────────────────────────────────
// DATA TABLE: DEVICE DEAL STRUCTURES
// Deal type x development stage matrix for medtech transactions.
// Source: MedTech Strategist deal database, EY deal survey 2024
// ────────────────────────────────────────────────────────────

type DeviceDevelopmentStage = 'concept' | 'preclinical' | 'clinical_trial' | 'fda_submitted' | 'cleared_approved' | 'commercial';

interface DeviceDealStructureTemplate {
  stage: DeviceDevelopmentStage;
  deal_type_recommended: string;
  typical_upfront_pct: number;
  royalty_range: [number, number];
  margin_structure?: { low_pct: number; high_pct: number };
  milestones: { milestone: string; typical_value_m: number; probability: number }[];
  governance_complexity: 'low' | 'moderate' | 'high';
  comparable_deal_count: number;
}

const DEVICE_DEAL_STRUCTURES: DeviceDealStructureTemplate[] = [
  {
    stage: 'concept',
    deal_type_recommended: 'Co-Development Agreement',
    typical_upfront_pct: 10,
    royalty_range: [3, 8],
    milestones: [
      { milestone: 'Technical feasibility demonstrated', typical_value_m: 2, probability: 0.60 },
      { milestone: 'First-in-human study initiated', typical_value_m: 5, probability: 0.40 },
      { milestone: 'IDE approval', typical_value_m: 8, probability: 0.30 },
      { milestone: 'FDA clearance/approval', typical_value_m: 15, probability: 0.20 },
    ],
    governance_complexity: 'high',
    comparable_deal_count: 45,
  },
  {
    stage: 'preclinical',
    deal_type_recommended: 'Co-Development or Early Licensing',
    typical_upfront_pct: 12,
    royalty_range: [4, 9],
    milestones: [
      { milestone: 'Design verification complete', typical_value_m: 3, probability: 0.55 },
      { milestone: 'First-in-human study initiated', typical_value_m: 6, probability: 0.45 },
      { milestone: 'IDE approval', typical_value_m: 10, probability: 0.35 },
      { milestone: 'FDA clearance/approval', typical_value_m: 20, probability: 0.25 },
    ],
    governance_complexity: 'high',
    comparable_deal_count: 60,
  },
  {
    stage: 'clinical_trial',
    deal_type_recommended: 'Licensing Agreement',
    typical_upfront_pct: 20,
    royalty_range: [5, 12],
    milestones: [
      { milestone: 'Enrollment complete', typical_value_m: 8, probability: 0.65 },
      { milestone: 'Primary endpoint data readout', typical_value_m: 15, probability: 0.55 },
      { milestone: 'FDA submission', typical_value_m: 10, probability: 0.50 },
      { milestone: 'FDA clearance/approval', typical_value_m: 25, probability: 0.45 },
    ],
    governance_complexity: 'moderate',
    comparable_deal_count: 85,
  },
  {
    stage: 'fda_submitted',
    deal_type_recommended: 'Licensing or Acquisition',
    typical_upfront_pct: 40,
    royalty_range: [8, 15],
    margin_structure: { low_pct: 40, high_pct: 50 },
    milestones: [
      { milestone: 'FDA clearance/approval', typical_value_m: 30, probability: 0.75 },
      { milestone: 'First commercial sale', typical_value_m: 10, probability: 0.70 },
      { milestone: 'Revenue milestone ($50M)', typical_value_m: 20, probability: 0.50 },
    ],
    governance_complexity: 'moderate',
    comparable_deal_count: 55,
  },
  {
    stage: 'cleared_approved',
    deal_type_recommended: 'Distribution Agreement or Acquisition',
    typical_upfront_pct: 45,
    royalty_range: [10, 18],
    margin_structure: { low_pct: 40, high_pct: 55 },
    milestones: [
      { milestone: 'Revenue milestone ($25M)', typical_value_m: 15, probability: 0.70 },
      { milestone: 'Revenue milestone ($100M)', typical_value_m: 30, probability: 0.45 },
      { milestone: 'Revenue milestone ($250M)', typical_value_m: 50, probability: 0.25 },
    ],
    governance_complexity: 'low',
    comparable_deal_count: 120,
  },
  {
    stage: 'commercial',
    deal_type_recommended: 'Acquisition',
    typical_upfront_pct: 70,
    royalty_range: [0, 0],
    margin_structure: { low_pct: 45, high_pct: 55 },
    milestones: [
      { milestone: 'Revenue earnout (Year 1)', typical_value_m: 20, probability: 0.80 },
      { milestone: 'Revenue earnout (Year 2)', typical_value_m: 30, probability: 0.65 },
      { milestone: 'Revenue earnout (Year 3)', typical_value_m: 40, probability: 0.50 },
    ],
    governance_complexity: 'low',
    comparable_deal_count: 150,
  },
];

/**
 * Function 4: buildDeviceDealStructureModel
 * Device-specific deal term modeling based on development stage
 * and product category. Key differences from pharma:
 * - Distribution margin structures (40-55% GPM) instead of royalties for late-stage
 * - OEM arrangements (white-label, component supply)
 * - Revenue-based earnouts instead of clinical milestones
 * - Lower upfront % but higher margin structures
 */
function buildDeviceDealStructureModel(
  partner: DevicePartnerProfile,
  developmentStage: DeviceDevelopmentStage,
  productCategory: ProductCategory,
): DeviceDealStructureModel {
  const template = DEVICE_DEAL_STRUCTURES.find((t) => t.stage === developmentStage)
    ?? DEVICE_DEAL_STRUCTURES.find((t) => t.stage === 'clinical_trial')!;

  // Adjust based on partner type
  let upfrontAdj = 0;
  let royaltyAdj = 0;

  // Larger companies typically pay higher upfront but negotiate lower royalties
  if (partner.company_type === 'large_medtech') {
    upfrontAdj = 5;
    royaltyAdj = -1;
  } else if (partner.company_type === 'mid_medtech') {
    upfrontAdj = 0;
    royaltyAdj = 0;
  } else {
    // Smaller / specialty companies pay less upfront
    upfrontAdj = -5;
    royaltyAdj = 1;
  }

  // Product category adjustments
  // SaMD / digital health typically have lower upfronts, higher recurring rev share
  if (productCategory === 'device_digital_health') {
    upfrontAdj -= 5;
    royaltyAdj += 2;
  }
  // Capital equipment tends toward distribution agreements with margin structures
  if (productCategory === 'device_capital_equipment') {
    upfrontAdj += 5;
  }
  // Diagnostics: reagent rental model changes deal economics
  if (productCategory.startsWith('diagnostics_')) {
    royaltyAdj += 1;
  }

  const adjustedUpfrontPct = Math.max(5, Math.min(80, template.typical_upfront_pct + upfrontAdj));
  const adjustedRoyalty: [number, number] = [
    Math.max(0, template.royalty_range[0] + royaltyAdj),
    Math.max(0, template.royalty_range[1] + royaltyAdj),
  ];

  // Build narrative
  const isLateStage = developmentStage === 'cleared_approved' || developmentStage === 'commercial';
  const isEarlyStage = developmentStage === 'concept' || developmentStage === 'preclinical';

  let narrativeParts: string[] = [];
  narrativeParts.push(`For a ${developmentStage.replace(/_/g, ' ')} stage ${productCategory.replace(/_/g, ' ')} product, the recommended deal structure is ${template.deal_type_recommended.toLowerCase()}.`);

  if (isLateStage && template.margin_structure) {
    narrativeParts.push(`Distribution deals at this stage typically involve ${template.margin_structure.low_pct}-${template.margin_structure.high_pct}% gross profit margin structures rather than royalties.`);
    narrativeParts.push(`Acquisition multiples for commercial-stage devices typically range from 3-5x revenue.`);
  } else if (isEarlyStage) {
    narrativeParts.push(`Early-stage device deals feature heavier milestone-based structures with ${adjustedRoyalty[0]}-${adjustedRoyalty[1]}% royalties.`);
    narrativeParts.push(`Governance is typically complex, with joint steering committees and co-development IP sharing.`);
  } else {
    narrativeParts.push(`Mid-stage licensing typically includes ${adjustedUpfrontPct}% upfront with ${adjustedRoyalty[0]}-${adjustedRoyalty[1]}% royalties on net sales.`);
  }

  narrativeParts.push(`Based on ${template.comparable_deal_count} comparable transactions in the MedTech Strategist database.`);

  return {
    deal_type_recommended: template.deal_type_recommended,
    typical_upfront_pct: adjustedUpfrontPct,
    royalty_range: adjustedRoyalty,
    margin_structure: template.margin_structure,
    milestones: template.milestones,
    governance_complexity: template.governance_complexity,
    comparable_deal_count: template.comparable_deal_count,
    narrative: narrativeParts.join(' '),
  };
}

// ────────────────────────────────────────────────────────────
// DEVICE PARTNER SCORING LOOP
// Constructs DevicePartnerMatch objects with all 4 analytics
// ────────────────────────────────────────────────────────────

/** Map DevicePartnerProfile company_type to DevicePartnerMatch company_type */
function formatDeviceCompanyType(type: string): DevicePartnerMatch['company_type'] {
  switch (type) {
    case 'large_medtech': return 'Large Medtech';
    case 'mid_medtech': return 'Mid-Size Medtech';
    case 'diagnostics_major': return 'Diagnostics Company';
    case 'diagnostics_specialty': return 'Diagnostics Company';
    case 'diagnostics_company': return 'Diagnostics Company';
    case 'digital_health': return 'Mid-Size Medtech';
    default: return 'Mid-Size Medtech';
  }
}

export async function analyzeDevicePartners(
  input: DevicePartnerDiscoveryInput,
): Promise<{
  ranked_partners: DevicePartnerMatch[];
  summary: {
    total_screened: number;
    total_matched: number;
    top_tier_count: number;
    avg_match_score: number;
  };
  methodology: string;
  data_sources: DataSource[];
  generated_at: string;
}> {
  const {
    device_description,
    device_category,
    product_category,
    development_stage,
    geography_rights,
    deal_types,
    exclude_companies = [],
    target_partner_type,
  } = input;

  // Filter excluded companies and optionally by target partner type
  const excludeSet = new Set(exclude_companies.map((c) => c.toLowerCase()));
  let candidates = RAW_DEVICE_PARTNERS.filter(
    (p) => !excludeSet.has(p.company.toLowerCase())
  );

  // Optional: filter by target partner type
  if (target_partner_type && target_partner_type.length > 0) {
    const typeSet = new Set(target_partner_type);
    candidates = candidates.filter((p) => {
      const pType = p.company_type;
      if (typeSet.has('large_medtech') && pType === 'large_medtech') return true;
      if (typeSet.has('mid_medtech') && (pType === 'mid_medtech' || pType === 'specialty_medtech')) return true;
      if (typeSet.has('diagnostics_company') && (pType === 'diagnostics_major' || pType === 'diagnostics_specialty' || pType === 'diagnostics_company')) return true;
      if (typeSet.has('pharma_device_division') && pType === 'large_medtech') return true;
      if (typeSet.has('strategic_investor')) return true; // All types potentially invest
      return false;
    });
  }

  // Score all candidates
  const scored = candidates.map((dp) => {
    // Normalize for scoring using existing pharma-style scoring infrastructure
    const normalized = normalizeDevicePartner(dp);

    // Infer therapy areas from device description
    const descLower = device_description.toLowerCase();
    const userTherapyAreas: string[] = [];
    for (const [area, keywords] of Object.entries(THERAPY_AREA_KEYWORDS)) {
      if (keywords.some((kw) => descLower.includes(kw))) {
        userTherapyAreas.push(area);
      }
    }
    // Also try device_category -> therapy area mapping
    const categoryToTherapy: Partial<Record<DeviceCategory, string>> = {
      cardiovascular: 'cardiovascular',
      orthopedic: 'orthopedic',
      neurology: 'neuroscience',
      ophthalmology: 'ophthalmology',
      endoscopy_gi: 'gastroenterology',
      wound_care: 'dermatology',
      diabetes_metabolic: 'metabolic',
      oncology_surgical: 'oncology',
      oncology_radiation: 'oncology',
      ivd_oncology: 'oncology',
      ivd_infectious: 'infectious_disease',
      ivd_cardiology: 'cardiovascular',
      ivd_genetics: 'gene_therapy',
      respiratory: 'respiratory',
      renal_dialysis: 'nephrology',
    };
    const catTherapy = categoryToTherapy[device_category];
    if (catTherapy && !userTherapyAreas.includes(catTherapy)) {
      userTherapyAreas.push(catTherapy);
    }
    if (userTherapyAreas.length === 0) userTherapyAreas.push('general');

    // Map device development stage to pharma for scoring
    const pharmaStageLookup: Record<string, DevelopmentStage> = {
      concept: 'preclinical',
      preclinical: 'preclinical',
      clinical_trial: 'phase2',
      fda_submitted: 'phase3',
      cleared_approved: 'approved',
      commercial: 'approved',
    };
    const pharmaStage = pharmaStageLookup[development_stage] ?? 'phase2';

    // Map device deal types to pharma deal types for scoring
    const pharmaDeals = deal_types.map((dt) => {
      switch (dt) {
        case 'distribution': return 'licensing';
        case 'licensing': return 'licensing';
        case 'acquisition': return 'acquisition';
        case 'oem': return 'licensing';
        case 'co_development': return 'co-development';
        case 'strategic_investment': return 'acquisition';
        default: return 'licensing';
      }
    });

    // Core scoring dimensions (reusing existing functions)
    const therapeutic_alignment = scoreTherapeuticAlignment(normalized, userTherapyAreas, device_description);
    const pipeline_gap = scorePipelineGap(normalized, userTherapyAreas, pharmaStage, device_description);
    const deal_history = scoreDealHistory(normalized, pharmaStage, pharmaDeals, userTherapyAreas, device_description);
    const geography_fit = scoreGeographyFit(normalized, geography_rights);
    const financial_capacity = scoreFinancialCapacity(normalized, pharmaStage);

    // Device-specific category alignment bonus (up to 10 extra points)
    let categoryBonus = 0;
    const partnerAreas = dp.primary_therapeutic_areas.map((a) => a.toLowerCase());
    const categoryStr = device_category.replace(/_/g, ' ').toLowerCase();
    if (partnerAreas.some((a) => a.includes(categoryStr) || categoryStr.includes(a))) {
      categoryBonus = 10;
    } else {
      // Check key_divisions for category alignment
      const divisionStr = dp.key_divisions.join(' ').toLowerCase();
      if (divisionStr.includes(categoryStr)) categoryBonus = 7;
    }

    // Strategic interest alignment bonus
    let strategicBonus = 0;
    const bdInterestsLower = dp.active_bd_interests.join(' ').toLowerCase();
    const descTokens = tokenize(device_description);
    if (descTokens.some((t) => bdInterestsLower.includes(t))) {
      strategicBonus = 5;
    }

    const baseTotal = therapeutic_alignment + pipeline_gap + deal_history + geography_fit + financial_capacity;
    const total = Math.max(0, baseTotal + categoryBonus + strategicBonus);

    return { dp, normalized, total, therapeutic_alignment, pipeline_gap, deal_history, geography_fit, financial_capacity, categoryBonus, strategicBonus };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.total - a.total);

  // Filter by minimum score (25) and take top 20
  const qualified = scored.filter((s) => s.total >= 25);
  const topPartners = qualified.slice(0, 20);

  // Determine target setting from product category or default to hospital_inpatient
  let targetSetting: TargetSettingType = 'hospital_inpatient';
  if (product_category.includes('diagnostics') || product_category === 'device_point_of_care') {
    targetSetting = 'lab';
  } else if (product_category === 'device_monitoring' || product_category === 'device_digital_health') {
    targetSetting = 'home';
  } else if (product_category === 'device_surgical') {
    targetSetting = 'hospital_inpatient';
  }

  // Build ranked DevicePartnerMatch objects
  const rankedPartners: DevicePartnerMatch[] = topPartners.map((item, index) => {
    const { dp, total, therapeutic_alignment, pipeline_gap, deal_history, geography_fit, financial_capacity, categoryBonus, strategicBonus } = item;

    // Parse recent acquisitions into deal records
    const recentDeals = dp.recent_acquisitions.slice(0, 3).map((acq) => {
      const valueMatch = acq.match(/\$([0-9.]+)([BM])/i);
      let value: string | undefined;
      if (valueMatch) {
        value = `$${valueMatch[1]}${valueMatch[2].toUpperCase()}`;
      }
      const yearMatch = acq.match(/(\d{4})/);
      const date = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
      const targetMatch = acq.match(/^([^(]+)/);
      const target = targetMatch ? targetMatch[1].trim() : acq;

      return {
        target,
        deal_type: 'acquisition',
        device_category: dp.primary_therapeutic_areas[0] || device_category,
        value,
        date,
      };
    });

    // Acquisition signals
    const acquisitionSignals: string[] = [];
    if (dp.active_bd_interests.length > 0) {
      acquisitionSignals.push(`Active BD interests: ${dp.active_bd_interests.slice(0, 2).join(', ')}`);
    }
    if (categoryBonus >= 7) {
      acquisitionSignals.push(`Strong portfolio alignment with ${device_category} category`);
    }
    if (strategicBonus >= 5) {
      acquisitionSignals.push('Device description matches stated strategic priorities');
    }

    // Build the 4 device-specific analytics
    const acquisitionProbability = buildDeviceAcquisitionProbability(dp, device_category);
    const regulatoryTrackRecord = buildDeviceRegulatoryTrackRecord(dp);
    const distributionStrength = buildDistributionStrength(dp, targetSetting);
    const deviceDealStructure = buildDeviceDealStructureModel(dp, development_stage, product_category);

    // Rationale
    const companyType = formatDeviceCompanyType(dp.company_type);
    const rationaleLines: string[] = [
      `${dp.company} is a ${companyType} with ${total >= 60 ? 'strong' : total >= 40 ? 'good' : 'moderate'} alignment to this opportunity.`,
    ];
    if (categoryBonus >= 7) {
      rationaleLines.push(`Active in ${device_category.replace(/_/g, ' ')} with relevant product portfolio.`);
    }
    if (dp.recent_acquisitions.length > 0) {
      rationaleLines.push(`Recent deals: ${dp.recent_acquisitions[0]}.`);
    }
    if (acquisitionProbability.acquisition_probability_pct >= 50) {
      rationaleLines.push(`High acquisition probability (${acquisitionProbability.acquisition_probability_pct}%) based on serial acquirer analysis.`);
    }

    const partnerMatch: DevicePartnerMatch = {
      rank: index + 1,
      company: dp.company,
      company_type: companyType,
      hq_location: dp.hq,
      market_cap: dp.market_cap_b ? `$${dp.market_cap_b >= 100 ? Math.round(dp.market_cap_b) : dp.market_cap_b}B` : undefined,
      device_divisions: dp.key_divisions,
      match_score: total,
      score_breakdown: {
        portfolio_alignment: therapeutic_alignment,
        distribution_network: Math.round(distributionStrength.overall_distribution_score * 2.5), // Scale 0-10 → 0-25
        deal_history: deal_history,
        financial_capacity: financial_capacity,
        geographic_footprint: geography_fit,
        strategic_priority: Math.round((categoryBonus + strategicBonus) / 15 * 15),
      },
      recent_deals: recentDeals,
      deal_terms_benchmark: {
        typical_upfront: `${deviceDealStructure.typical_upfront_pct}% of total deal value`,
        royalty_or_distribution_margin: deviceDealStructure.margin_structure
          ? `${deviceDealStructure.margin_structure.low_pct}-${deviceDealStructure.margin_structure.high_pct}% GPM`
          : `${deviceDealStructure.royalty_range[0]}-${deviceDealStructure.royalty_range[1]}% royalty`,
        typical_deal_structure: deviceDealStructure.deal_type_recommended,
      },
      rationale: rationaleLines.join(' '),
      acquisition_signals: acquisitionSignals,
      acquisition_probability: acquisitionProbability,
      regulatory_track_record: regulatoryTrackRecord,
      distribution_strength: distributionStrength,
      device_deal_structure: deviceDealStructure,
    };

    return partnerMatch;
  });

  // Summary
  const matchedCount = qualified.length;
  const topTierCount = qualified.filter((q) => q.total >= 60).length;
  const avgScore = rankedPartners.length > 0
    ? Math.round(rankedPartners.reduce((s, p) => s + p.match_score, 0) / rankedPartners.length)
    : 0;

  const methodology = [
    `Screened ${candidates.length} medtech, diagnostics, and device companies against device profile.`,
    `Scoring: Portfolio Alignment (25 pts), Pipeline Gap (25 pts), Deal History (20 pts), Geography Fit (15 pts), Financial Capacity (15 pts) + Category Bonus (up to 10 pts) + Strategic Priority Bonus (up to 5 pts).`,
    `Device-specific analytics applied: acquisition probability (serial acquirer analysis + revenue gap), regulatory track record (FDA clearance volume + review speed + compliance), distribution strength (channel coverage vs. target setting), deal structure model (device-specific terms by development stage).`,
    `Partners scoring below 25/100 are excluded from results.`,
  ].join(' ');

  const dataSources: DataSource[] = [
    { name: 'SEC EDGAR Filings', type: 'public', url: 'https://www.sec.gov/edgar/searchedgar/companysearch' },
    { name: 'FDA CDRH 510(k) & PMA Databases', type: 'public', url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm' },
    { name: 'MedTech Strategist Deal Database', type: 'licensed' },
    { name: 'Company Annual Reports & 10-K Filings (2020-2025)', type: 'public' },
    { name: 'Ambrosia Ventures Proprietary MedTech Intelligence', type: 'proprietary' },
  ];

  return {
    ranked_partners: rankedPartners,
    summary: {
      total_screened: candidates.length,
      total_matched: matchedCount,
      top_tier_count: topTierCount,
      avg_match_score: avgScore,
    },
    methodology,
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}

// ────────────────────────────────────────────────────────────
// MAIN EXPORT: analyzePartners()
// ────────────────────────────────────────────────────────────

export async function analyzePartners(
  input: PartnerDiscoveryInput,
): Promise<PartnerDiscoveryOutput> {
  const {
    indication,
    mechanism,
    development_stage: developmentStage,
    geography_rights: geographyRights,
    deal_types: dealTypes,
    exclude_companies = [],
    minimum_match_score = 25,
  } = input;

  // Infer therapy areas from indication + mechanism
  const userTherapyAreas = inferTherapyAreas(indication, mechanism);

  // Merge pharma + device partner databases
  const allPartners: PharmaPartnerProfile[] = [
    ...PHARMA_PARTNER_DATABASE,
    ...NORMALIZED_DEVICE_PARTNERS,
  ];

  // Filter excluded companies
  const excludeSet = new Set(exclude_companies.map((c) => c.toLowerCase()));
  const candidates = allPartners.filter(
    (p) => !excludeSet.has(p.company.toLowerCase())
  );

  // Determine therapy area and estimated launch year for scoring functions
  const indicationDataForScoring = findIndicationByName(indication);
  const therapyAreaForScoring = indicationDataForScoring?.therapy_area || userTherapyAreas[0] || 'general';
  // Estimate launch year from development stage (no launch_year in PartnerDiscoveryInput)
  const STAGE_TO_LAUNCH_OFFSET: Record<DevelopmentStage, number> = {
    preclinical: 8, phase1: 6, phase2: 4, phase3: 2, approved: 0,
  };
  const estimatedLaunchYear = 2026 + (STAGE_TO_LAUNCH_OFFSET[developmentStage] ?? 4);

  // Score all candidates
  const scored = candidates.map((partner) => {
    const therapeutic_alignment = scoreTherapeuticAlignment(
      partner, userTherapyAreas, indication, mechanism
    );
    const pipeline_gap = scorePipelineGap(
      partner, userTherapyAreas, developmentStage, indication
    );
    const deal_history = scoreDealHistory(
      partner, developmentStage, dealTypes, userTherapyAreas, indication
    );
    const geography_fit = scoreGeographyFit(partner, geographyRights);
    const financial_capacity = scoreFinancialCapacity(partner, developmentStage);

    // New: competing partnership penalty
    const competing_penalty = calculateCompetingPartnershipPenalty(partner, indication, mechanism);

    // New: patent cliff urgency bonus
    const patentCliff = scorePatentCliffUrgency(partner);

    // New: mechanism expertise (informational, not added to score)
    const mechExpertise = scoreMechanismExpertise(partner, mechanism);

    // New: partnership track record evaluation
    const trackRecord = evaluatePartnerTrackRecord(partner);
    // Track record bonus/penalty: Excellent +3, Good +1, Mixed 0, Poor -3
    let trackRecordAdj = 0;
    if (trackRecord) {
      if (trackRecord.track_record_label === 'Excellent') trackRecordAdj = 3;
      else if (trackRecord.track_record_label === 'Good') trackRecordAdj = 1;
      else if (trackRecord.track_record_label === 'Poor') trackRecordAdj = -3;
    }

    const baseTotal = therapeutic_alignment + pipeline_gap + deal_history + geography_fit + financial_capacity;
    const total = Math.max(0, baseTotal + competing_penalty + patentCliff.score + trackRecordAdj);

    const breakdown: PartnerScoreBreakdown = {
      therapeutic_alignment,
      pipeline_gap,
      deal_history,
      financial_capacity,
      geography_fit,
      competing_penalty: competing_penalty < 0 ? competing_penalty : undefined,
    };

    // New: portfolio appetite for mechanism
    const portfolioAppetite = assessPortfolioAppetite(partner, mechanism);

    // New: geographic strengths
    const geoStrengths = getGeographicStrengths(partner, geographyRights);

    // New: competitive urgency bonus (cross-engine)
    const competitive_urgency_bonus = scoreCompetitiveUrgency(indication);

    // New (99+): deal structure model
    const dealStructure = buildDealStructureModel(partner, developmentStage, therapyAreaForScoring);

    // New (99+): partner phase success rates
    const phaseSuccessRates = buildPartnerPhaseSuccessRates(partner);

    // New (99+): LOE gap analysis
    const loeGap = buildLOEGapAnalysis(partner, estimatedLaunchYear, indication);

    // LOE gap alignment bonus: if user asset fills the gap, add +3 to score
    const loeGapBonus = loeGap?.user_asset_fills_gap ? 3 : 0;

    const totalWithUrgency = Math.max(0, total + competitive_urgency_bonus + loeGapBonus);

    return { partner, total: totalWithUrgency, breakdown, patentCliffNarrative: patentCliff.narrative, mechExpertise, trackRecord, portfolioAppetite, geoStrengths, competitive_urgency_bonus, dealStructure, phaseSuccessRates, loeGap };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.total - a.total);

  // Filter by minimum score and take top 20
  const qualified = scored.filter((s) => s.total >= minimum_match_score);
  const topPartners = qualified.slice(0, 20);

  // Build ranked partner matches
  const rankedPartners: PartnerMatch[] = topPartners.map((item, index) => {
    const { partner, total, breakdown, patentCliffNarrative, mechExpertise, trackRecord, portfolioAppetite, geoStrengths, dealStructure, phaseSuccessRates, loeGap } = item;

    // Get relevant deals (those matching indication or therapy area)
    const indicationLower = indication.toLowerCase();
    const relevantDeals = partner.recent_deals
      .filter((d) => {
        const dealInd = d.indication.toLowerCase();
        return userTherapyAreas.some((ua) => dealInd.includes(ua)) ||
          tokenize(indicationLower).some((t) => dealInd.includes(t));
      })
      .slice(0, 3)
      .map((d) => convertToPartnerDeal(d, partner.company));

    // If no relevant deals, just show most recent
    const dealsToShow = relevantDeals.length > 0
      ? relevantDeals
      : partner.recent_deals
          .sort((a, b) => b.year - a.year)
          .slice(0, 2)
          .map((d) => convertToPartnerDeal(d, partner.company));

    const watchSignals = generateWatchSignals(partner, indication, developmentStage);
    // Add patent cliff urgency to watch signals if present
    if (patentCliffNarrative) {
      watchSignals.unshift(patentCliffNarrative);
    }

    return {
      rank: index + 1,
      company: partner.company,
      company_type: formatCompanyType(partner.company_type),
      hq_location: partner.headquarters,
      market_cap: formatMarketCap(partner.market_cap_b),
      bd_focus: partner.strategic_priorities.slice(0, 3),
      match_score: total,
      score_breakdown: breakdown,
      recent_deals: dealsToShow,
      deal_terms_benchmark: formatDealTermsBenchmark(partner, developmentStage),
      rationale: generateRationale(partner, breakdown, indication, developmentStage, dealTypes),
      watch_signals: watchSignals.slice(0, 5),
      mechanism_expertise_score: mechExpertise > 0 ? mechExpertise : undefined,
      patent_cliff_urgency: patentCliffNarrative,
      track_record: trackRecord,
      portfolio_appetite: portfolioAppetite.length > 0 ? portfolioAppetite : undefined,
      geographic_strengths: geoStrengths.length > 0 ? geoStrengths : undefined,
      deal_structure_model: dealStructure,
      phase_success_rates: phaseSuccessRates,
      loe_gap_analysis: loeGap,
    };
  });

  // Compute deal benchmarks from all relevant deals across both databases
  const allRelevantDeals = allPartners.flatMap((p) =>
    p.recent_deals.filter((d) => {
      const dealInd = d.indication.toLowerCase();
      return userTherapyAreas.some((ua) => dealInd.includes(ua));
    })
  );

  // Determine therapy area for deal benchmarks
  const indicationData = findIndicationByName(indication);
  const therapyAreaForBenchmarks = indicationData?.therapy_area;
  const dealBenchmarks = computeDealBenchmarks(allRelevantDeals, developmentStage, therapyAreaForBenchmarks);

  // Negotiation leverage assessment (called once after all partners scored)
  const negotiation_leverage = assessNegotiationLeverage(input, qualified.length, indicationData);

  // Summary stats
  const matchedCount = qualified.length;
  const topTierCount = qualified.filter((q) => q.total >= 60).length;
  const avgScore = rankedPartners.length > 0
    ? Math.round(rankedPartners.reduce((s, p) => s + p.match_score, 0) / rankedPartners.length)
    : 0;

  const methodology = [
    `Screened ${candidates.length} biopharma companies against asset profile.`,
    `Scoring methodology: Therapeutic Alignment (25 pts), Pipeline Gap Analysis (25 pts), Deal History (20 pts), Geography Fit (15 pts), Financial Capacity (15 pts).`,
    `Therapeutic alignment evaluates overlap between the partner's existing therapeutic areas, pipeline focus, and the asset's indication/mechanism.`,
    `Pipeline gap analysis assesses whether the partner has stated strategic priorities or patent cliffs that create demand for this type of asset.`,
    `Deal history scores partners based on their preferred deal stages, recent transaction activity, and deal type alignment.`,
    `Geography fit measures overlap between offered rights territories and the partner's commercial footprint.`,
    `Financial capacity evaluates whether the partner's market capitalization supports a transaction at the appropriate scale for ${developmentStage} assets.`,
    `Partners scoring below ${minimum_match_score}/100 are excluded from results.`,
  ].join(' ');

  const dataSources: DataSource[] = [
    { name: 'SEC EDGAR Filings', type: 'public', url: 'https://www.sec.gov/edgar/searchedgar/companysearch' },
    { name: `Company Annual Reports & 10-K Filings (2020-${new Date().getFullYear()})`, type: 'public' },
    { name: 'BioCentury Deal Database', type: 'licensed' },
    { name: 'Evaluate Pharma', type: 'licensed' },
    { name: 'ClinicalTrials.gov Pipeline Data', type: 'public', url: 'https://clinicaltrials.gov' },
    { name: 'Ambrosia Ventures Proprietary Deal Intelligence', type: 'proprietary' },
  ];

  return {
    ranked_partners: rankedPartners,
    deal_benchmarks: dealBenchmarks,
    summary: {
      total_screened: candidates.length,
      total_matched: matchedCount,
      top_tier_count: topTierCount,
      avg_match_score: avgScore,
      indication,
      development_stage: developmentStage,
    },
    methodology,
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
    negotiation_leverage,
  };
}

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL PARTNER DISCOVERY
// ────────────────────────────────────────────────────────────
//
// Scores and ranks nutraceutical industry partners (contract
// manufacturers, ingredient suppliers, distributors, retail
// partners, DTC platforms, etc.) against a user's product
// profile.
//
// Scoring dimensions (weighted to 100):
//   Category alignment        — 25 pts
//   Channel fit               — 25 pts
//   Capability match          — 20 pts
//   Scale appropriateness     — 15 pts
//   Geographic fit            — 15 pts
// ────────────────────────────────────────────────────────────

/** Related categories for partial matching in category alignment scoring */
const RELATED_NUTRACEUTICAL_CATEGORIES: Partial<Record<NutraceuticalCategory, NutraceuticalCategory[]>> = {
  dietary_supplement: ['functional_food', 'sports_nutrition', 'longevity_compound'],
  functional_food: ['dietary_supplement', 'medical_food', 'probiotic_microbiome'],
  medical_food: ['functional_food', 'dietary_supplement', 'rx_to_otc_switch'],
  otc_drug: ['rx_to_otc_switch', 'cosmeceutical', 'dietary_supplement'],
  rx_to_otc_switch: ['otc_drug', 'medical_food', 'dietary_supplement'],
  cosmeceutical: ['otc_drug', 'dietary_supplement', 'longevity_compound'],
  longevity_compound: ['dietary_supplement', 'probiotic_microbiome', 'sports_nutrition'],
  probiotic_microbiome: ['functional_food', 'dietary_supplement', 'longevity_compound'],
  sports_nutrition: ['dietary_supplement', 'functional_food', 'longevity_compound'],
};

/** Stage-to-preferred-partner-type mapping for capability scoring */
const STAGE_PREFERRED_TYPES: Record<
  NutraceuticalPartnerDiscoveryInput['development_stage'],
  NutraceuticalPartnerType[]
> = {
  formulation: ['contract_manufacturer', 'ingredient_supplier'],
  clinical_study: ['clinical_research', 'ingredient_supplier'],
  market_ready: ['distributor', 'retail_partner', 'dtc_platform'],
  commercial: ['strategic_acquirer', 'retail_partner', 'marketing_agency'],
};

/** Score category alignment (0-25) */
function scoreNutraCategoryAlignment(
  partner: NutraceuticalPartnerProfile,
  inputCategory: NutraceuticalCategory,
): number {
  // Full match: partner serves the exact category
  if (partner.categories_served.includes(inputCategory)) return 25;

  // Partial: partner serves a related category
  const related = RELATED_NUTRACEUTICAL_CATEGORIES[inputCategory] ?? [];
  const hasRelated = partner.categories_served.some((cat) => related.includes(cat));
  if (hasRelated) return 12;

  return 0;
}

/** Score channel fit (0-25) */
function scoreNutraChannelFit(
  partner: NutraceuticalPartnerProfile,
  inputChannels: NutraceuticalChannel[],
): number {
  if (inputChannels.length === 0) return 0;
  const overlapCount = inputChannels.filter((ch) =>
    partner.channels_served.includes(ch),
  ).length;
  return Math.round((overlapCount / inputChannels.length) * 25);
}

/** Score capability match based on development stage (0-20) */
function scoreNutraCapabilityMatch(
  partner: NutraceuticalPartnerProfile,
  developmentStage: NutraceuticalPartnerDiscoveryInput['development_stage'],
): number {
  const preferred = STAGE_PREFERRED_TYPES[developmentStage];
  if (preferred.includes(partner.partner_type)) return 20;

  // Partial match: partner type is adjacent to preferred types
  // (e.g., a distributor is partially useful during clinical_study for launch prep)
  const allTypes: NutraceuticalPartnerType[] = [
    'contract_manufacturer',
    'ingredient_supplier',
    'distributor',
    'retail_partner',
    'strategic_acquirer',
    'dtc_platform',
    'clinical_research',
    'marketing_agency',
  ];
  // Check if the partner's capabilities overlap with preferred type keywords
  const preferredKeywords = preferred.map((t) => t.replace(/_/g, ' '));
  const capabilitiesStr = partner.capabilities.join(' ').toLowerCase();
  const hasPartialCapability = preferredKeywords.some((kw) =>
    capabilitiesStr.includes(kw.replace(/_/g, ' ')),
  );
  if (hasPartialCapability) return 10;

  return 10; // Baseline partial score — every partner has some transferable capability
}

/** Score scale appropriateness (0-15) */
function scoreNutraScaleAppropriateness(
  partner: NutraceuticalPartnerProfile,
  estimatedRevenueM?: number,
): number {
  if (!partner.revenue_b) return 10; // No revenue data — default
  if (estimatedRevenueM === undefined) return 10;

  const partnerRevenueB = partner.revenue_b;
  const companyRevenueM = estimatedRevenueM;

  // Large partner (>$10B) + small company (<$5M)
  if (partnerRevenueB > 10 && companyRevenueM < 5) return 8;
  // Mid partner ($1-10B) + startup
  if (partnerRevenueB >= 1 && partnerRevenueB <= 10 && companyRevenueM < 50) return 15;
  // Small partner (<$1B) + startup
  if (partnerRevenueB < 1 && companyRevenueM < 50) return 12;
  // Large partner + large company
  if (partnerRevenueB > 10 && companyRevenueM >= 50) return 13;
  // Mid partner + mid company
  if (partnerRevenueB >= 1 && partnerRevenueB <= 10 && companyRevenueM >= 50) return 11;

  return 10;
}

/** Score geographic fit (0-15) */
function scoreNutraGeographicFit(
  partner: NutraceuticalPartnerProfile,
  geographyRights: string[],
): number {
  if (geographyRights.length === 0) return 8; // No geography specified — neutral

  const hqLower = partner.hq.toLowerCase();
  const geoLower = geographyRights.map((g) => g.toLowerCase());

  // Check US presence
  const isUSPartner =
    hqLower.includes('us') ||
    hqLower.includes('united states') ||
    hqLower.includes('california') ||
    hqLower.includes('new york') ||
    hqLower.includes('new jersey') ||
    hqLower.includes('texas') ||
    hqLower.includes('illinois') ||
    hqLower.includes('florida') ||
    hqLower.includes('ohio') ||
    hqLower.includes('utah') ||
    hqLower.includes('wisconsin') ||
    hqLower.includes('north carolina') ||
    hqLower.includes('connecticut') ||
    hqLower.includes('massachusetts') ||
    hqLower.includes('minnesota');

  const wantsUS = geoLower.some((g) => g === 'us' || g === 'usa' || g === 'united states');

  if (isUSPartner && wantsUS) return 15;

  // International partner matching
  const regionKeywords: Record<string, string[]> = {
    eu: ['germany', 'france', 'uk', 'italy', 'spain', 'europe', 'switzerland', 'netherlands', 'denmark'],
    japan: ['japan', 'tokyo'],
    china: ['china', 'shanghai', 'beijing'],
    india: ['india', 'mumbai'],
    canada: ['canada', 'toronto'],
    australia: ['australia', 'sydney'],
    global: ['global'],
  };

  // Check if partner HQ matches any requested geography
  for (const geo of geoLower) {
    const keywords = regionKeywords[geo] ?? [geo];
    if (keywords.some((kw) => hqLower.includes(kw))) return 12;
  }

  // Partial overlap — partner is international but requested geography is partially covered
  // Check capabilities/description for international presence signals
  const descLower = partner.description.toLowerCase();
  const capsLower = partner.capabilities.join(' ').toLowerCase();
  const combined = `${descLower} ${capsLower}`;
  for (const geo of geoLower) {
    const keywords = regionKeywords[geo] ?? [geo];
    if (keywords.some((kw) => combined.includes(kw))) return 8;
  }

  return 3;
}

/** Generate rationale string for a nutraceutical partner match */
function generateNutraRationale(
  partner: NutraceuticalPartnerProfile,
  input: NutraceuticalPartnerDiscoveryInput,
  totalScore: number,
  breakdown: NutraceuticalPartnerMatch['score_breakdown'],
): string {
  const lines: string[] = [];

  // Overall assessment
  const tier = totalScore >= 70 ? 'strong' : totalScore >= 50 ? 'good' : 'moderate';
  lines.push(
    `${partner.company} is a ${partner.partner_type.replace(/_/g, ' ')} with ${tier} alignment (${totalScore}/100) to this ${input.nutraceutical_category.replace(/_/g, ' ')} opportunity.`,
  );

  // Category insight
  if (breakdown.category_alignment >= 25) {
    lines.push(`Directly serves the ${input.nutraceutical_category.replace(/_/g, ' ')} category.`);
  } else if (breakdown.category_alignment >= 12) {
    lines.push('Serves related product categories with transferable expertise.');
  }

  // Channel insight
  if (breakdown.channel_fit >= 20) {
    lines.push(`Strong channel overlap across ${input.channels.length > 1 ? 'multiple' : 'the target'} distribution channel${input.channels.length > 1 ? 's' : ''}.`);
  } else if (breakdown.channel_fit >= 10) {
    lines.push('Partial channel coverage with expansion potential.');
  }

  // Capability insight
  if (breakdown.capability_match >= 20) {
    lines.push(`Capabilities well-matched to ${input.development_stage.replace(/_/g, ' ')} stage needs.`);
  }

  // Notable clients
  if (partner.notable_clients.length > 0) {
    lines.push(`Works with: ${partner.notable_clients.slice(0, 3).join(', ')}.`);
  }

  return lines.join(' ');
}

export async function analyzeNutraceuticalPartners(
  input: NutraceuticalPartnerDiscoveryInput,
): Promise<{
  ranked_partners: NutraceuticalPartnerMatch[];
  summary: {
    total_screened: number;
    total_matched: number;
    top_tier_count: number;
    avg_match_score: number;
  };
  methodology: string;
  data_sources: { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[];
  generated_at: string;
}> {
  const {
    nutraceutical_category,
    channels,
    development_stage,
    geography_rights,
    partner_types_sought,
    exclude_companies = [],
    estimated_revenue_m,
  } = input;

  // ── Step 1: Filter candidates ──────────────────────────────
  const excludeSet = new Set(exclude_companies.map((c) => c.toLowerCase()));
  let candidates: NutraceuticalPartnerProfile[] = NUTRACEUTICAL_PARTNER_DATABASE.filter(
    (p) => !excludeSet.has(p.company.toLowerCase()),
  );

  // Filter by partner types sought (if provided)
  if (partner_types_sought && partner_types_sought.length > 0) {
    const typeSet = new Set(partner_types_sought);
    candidates = candidates.filter((p) => typeSet.has(p.partner_type));
  }

  // ── Step 2: Score each candidate on 5 dimensions ───────────
  const scored = candidates.map((partner) => {
    const category_alignment = scoreNutraCategoryAlignment(partner, nutraceutical_category);
    const channel_fit = scoreNutraChannelFit(partner, channels);
    const capability_match = scoreNutraCapabilityMatch(partner, development_stage);
    const scale_appropriateness = scoreNutraScaleAppropriateness(partner, estimated_revenue_m);
    const geographic_fit = scoreNutraGeographicFit(partner, geography_rights);

    const total = category_alignment + channel_fit + capability_match + scale_appropriateness + geographic_fit;

    return {
      partner,
      total,
      breakdown: {
        category_alignment,
        channel_fit,
        capability_match,
        scale_appropriateness,
        geographic_fit,
      },
    };
  });

  // ── Step 3: Sort by total score descending ─────────────────
  scored.sort((a, b) => b.total - a.total);

  // ── Step 4: Build ranked partner matches (top 15) ──────────
  const top15 = scored.slice(0, 15);

  const rankedPartners: NutraceuticalPartnerMatch[] = top15.map((item, index) => {
    const { partner, total, breakdown } = item;

    return {
      rank: index + 1,
      company: partner.company,
      partner_type: partner.partner_type,
      match_score: total,
      score_breakdown: breakdown,
      capabilities: partner.capabilities.slice(0, 6),
      notable_clients: partner.notable_clients.slice(0, 4),
      rationale: generateNutraRationale(partner, input, total, breakdown),
    };
  });

  // ── Step 5: Summary statistics ─────────────────────────────
  const matchedCount = scored.length;
  const topTierCount = scored.filter((s) => s.total >= 60).length;
  const avgScore = rankedPartners.length > 0
    ? Math.round(rankedPartners.reduce((s, p) => s + p.match_score, 0) / rankedPartners.length)
    : 0;

  const methodology = [
    `Screened ${candidates.length} nutraceutical industry partners against product profile.`,
    `Scoring methodology: Category Alignment (25 pts), Channel Fit (25 pts), Capability Match (20 pts), Scale Appropriateness (15 pts), Geographic Fit (15 pts).`,
    `Category alignment evaluates whether the partner serves the target nutraceutical category (${nutraceutical_category.replace(/_/g, ' ')}) or closely related categories.`,
    `Channel fit measures overlap between the product's target distribution channels and the partner's channel expertise.`,
    `Capability match assesses whether the partner's core competencies align with the product's current development stage (${development_stage.replace(/_/g, ' ')}).`,
    `Scale appropriateness evaluates revenue-proportionate fit between the partner's size and the product company's scale.`,
    `Geographic fit measures alignment between offered geography rights and the partner's operational footprint.`,
    `Top 15 partners returned, ranked by composite score.`,
  ].join(' ');

  const dataSources: { name: string; type: 'public' | 'proprietary' | 'licensed'; url?: string }[] = [
    { name: 'SEC EDGAR Filings', type: 'public', url: 'https://www.sec.gov/edgar/searchedgar/companysearch' },
    { name: 'NIH Dietary Supplement Label Database', type: 'public', url: 'https://dsld.od.nih.gov' },
    { name: 'FDA Dietary Supplement Adverse Event Reporting', type: 'public', url: 'https://www.fda.gov/food/dietary-supplements' },
    { name: 'Nutrition Business Journal Market Reports', type: 'licensed' },
    { name: 'SPINS / IRI Retail Scanner Data', type: 'licensed' },
    { name: 'Ambrosia Ventures Proprietary Nutraceutical Intelligence', type: 'proprietary' },
  ];

  return {
    ranked_partners: rankedPartners,
    summary: {
      total_screened: candidates.length,
      total_matched: matchedCount,
      top_tier_count: topTierCount,
      avg_match_score: avgScore,
    },
    methodology,
    data_sources: dataSources,
    generated_at: new Date().toISOString(),
  };
}
