// ============================================================
// TERRAIN — Community Prevalence & Health Disparity Data
// lib/data/community-prevalence.ts
//
// Maps disease indications to demographic communities where
// prevalence is significantly elevated, and identifies modality
// gaps — therapeutic approaches with limited evidence or access
// in those populations.
//
// Sources: NIH NIMHD, CDC MMWR, SEER, WHO, disease foundations,
// published epidemiology literature, FDA Drug Trials Snapshots
// ============================================================

export interface CommunityPrevalenceEntry {
  indication: string;
  community: string;
  prevalence_multiplier: number;
  affected_population_estimate: number;
  key_evidence: string;
  awareness_gap: 'high' | 'moderate' | 'low';
  clinical_trial_representation: 'underrepresented' | 'proportional' | 'overrepresented';
  modality_gaps: string[];
}

export interface ModalityGap {
  modality: string;
  display_name: string;
  gap_description: string;
}

export const MODALITY_TYPES: ModalityGap[] = [
  {
    modality: 'gene_therapy',
    display_name: 'Gene Therapy',
    gap_description:
      'Limited clinical trial enrollment and access in underrepresented communities; genetic diversity not reflected in vector design',
  },
  {
    modality: 'cell_therapy',
    display_name: 'Cell/CAR-T Therapy',
    gap_description:
      'High cost and referral center concentration create access barriers; limited HLA-matched donors for allogeneic approaches',
  },
  {
    modality: 'mrna',
    display_name: 'mRNA Therapeutics',
    gap_description:
      'Emerging modality with limited diversity data; population-specific immune response profiles not yet characterized',
  },
  {
    modality: 'adc',
    display_name: 'Antibody-Drug Conjugate',
    gap_description:
      'Target antigen expression may vary by ancestry; pharmacogenomic differences in linker/payload metabolism underexplored',
  },
  {
    modality: 'bispecific',
    display_name: 'Bispecific Antibody',
    gap_description:
      'Clinical trials historically underrepresent minorities; immunogenicity profiles across populations poorly characterized',
  },
  {
    modality: 'gene_editing',
    display_name: 'Gene Editing (CRISPR)',
    gap_description:
      'Guide RNA design based on reference genomes may miss population-specific variants; off-target risks vary by genetic background',
  },
  {
    modality: 'rna_interference',
    display_name: 'RNAi/siRNA',
    gap_description:
      'Target sequence polymorphisms across ancestries could affect efficacy; limited PK/PD data in diverse populations',
  },
  {
    modality: 'checkpoint_inhibitor',
    display_name: 'Immune Checkpoint',
    gap_description:
      'Tumor mutational burden and PD-L1 expression patterns differ by ancestry; autoimmune irAE risk may vary',
  },
  {
    modality: 'targeted_degrader',
    display_name: 'Targeted Protein Degrader',
    gap_description:
      'E3 ligase expression and proteasome activity may vary across populations; very early-stage diversity data',
  },
];

export const COMMUNITY_PREVALENCE_DATA: CommunityPrevalenceEntry[] = [
  // ══════════════════════════════════════════════════════════
  // AFRICAN AMERICAN / BLACK COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Sickle Cell Disease',
    community: 'African American / Black',
    prevalence_multiplier: 8.0,
    affected_population_estimate: 100000,
    key_evidence:
      'CDC: ~100,000 Americans affected, predominantly African American (~1 in 365 births). NIH NHLBI Sickle Cell Disease data.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'cell_therapy'],
  },
  {
    indication: 'Prostate Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 55000,
    key_evidence:
      'ACS 2024: 1.7x incidence rate, 2.4x mortality rate vs white males. SEER data confirms persistent disparity.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['adc', 'bispecific', 'targeted_degrader'],
  },
  {
    indication: 'Breast Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 36000,
    key_evidence: 'ACS 2024: 2x incidence of triple-negative subtype, 40% higher mortality overall. SEER 2020-2024.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['adc', 'cell_therapy', 'bispecific'],
  },
  {
    indication: 'Heart Failure',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 900000,
    key_evidence:
      'AHA 2024: 1.5x prevalence, younger onset (mean age 10 years earlier). ARIC study, Jackson Heart Study.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },
  {
    indication: 'Systemic Lupus Erythematosus',
    community: 'African American / Black',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 200000,
    key_evidence: 'Lupus Foundation: 2-3x prevalence, more severe disease course, higher renal involvement. CDC 2023.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'bispecific', 'targeted_degrader'],
  },
  {
    indication: 'Multiple Myeloma',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 22000,
    key_evidence:
      'NCI SEER: 2x incidence rate. Younger age at diagnosis. Despite higher incidence, similar outcomes when access equalized.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'bispecific'],
  },
  {
    indication: 'Stroke',
    community: 'African American / Black',
    prevalence_multiplier: 1.8,
    affected_population_estimate: 500000,
    key_evidence: 'AHA/ASA 2024: 1.8x incidence, 1.5x mortality. REGARDS study. Higher small vessel disease burden.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Type 2 Diabetes',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 4800000,
    key_evidence:
      'CDC National Diabetes Statistics 2024: 12.1% vs 7.4% in non-Hispanic whites. Higher complication rates.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Chronic Kidney Disease',
    community: 'African American / Black',
    prevalence_multiplier: 3.5,
    affected_population_estimate: 5600000,
    key_evidence:
      'USRDS 2024: 3.5x rate of ESRD. APOL1 risk variants in ~13% of African Americans. AASK and CRIC studies.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'rna_interference'],
  },
  {
    indication: 'Colorectal Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 20000,
    key_evidence: 'ACS 2024: 20% higher incidence, 40% higher mortality. Younger onset trend. SEER data.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'bispecific'],
  },

  // ══════════════════════════════════════════════════════════
  // HISPANIC / LATINO COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Non-Alcoholic Steatohepatitis',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 9000000,
    key_evidence:
      'NHANES data: Hispanic Americans have highest NAFLD prevalence (~50%). PNPLA3 I148M variant enriched.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['rna_interference', 'gene_editing', 'targeted_degrader'],
  },
  {
    indication: 'Type 2 Diabetes',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 5100000,
    key_evidence:
      'CDC 2024: 12.5% prevalence vs 7.5% non-Hispanic white. Higher gestational diabetes rates. HCHS/SOL study.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },
  {
    indication: 'Systemic Lupus Erythematosus',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 120000,
    key_evidence:
      'Lupus Foundation: 2x prevalence vs non-Hispanic whites. More severe renal and neuropsychiatric manifestations.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'cell_therapy'],
  },
  {
    indication: 'Cervical Cancer',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 5600,
    key_evidence: 'ACS 2024: Highest incidence among major racial/ethnic groups. Screening access disparities persist.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['mrna', 'checkpoint_inhibitor'],
  },
  {
    indication: 'Gastric Cancer',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 4500,
    key_evidence: 'NCI SEER: 1.7x incidence. H. pylori prevalence higher. Later stage at diagnosis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'bispecific'],
  },
  {
    indication: 'Obesity',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 14000000,
    key_evidence: 'CDC NHANES 2023: 45.6% obesity prevalence vs 41.4% overall. Higher in Mexican-American subgroup.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Chronic Kidney Disease',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 3500000,
    key_evidence:
      'USRDS 2024: 1.5x ESRD incidence. Diabetes-driven CKD disproportionately affects Hispanic populations.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'rna_interference'],
  },

  // ══════════════════════════════════════════════════════════
  // ASIAN / PACIFIC ISLANDER COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Hepatocellular Carcinoma',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 12000,
    key_evidence: 'NCI SEER: 2x incidence driven by Hepatitis B endemicity. CDC Viral Hepatitis Surveillance 2023.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'cell_therapy'],
  },
  {
    indication: 'Gastric Cancer',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 7500,
    key_evidence:
      'NCI SEER: 2x incidence rate. H. pylori and dietary factors. Japanese and Korean populations highest.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['adc', 'bispecific'],
  },
  {
    indication: 'Nasopharyngeal Cancer',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 7.0,
    affected_population_estimate: 2100,
    key_evidence: 'NCI SEER: 7x incidence. EBV-driven. Southeast Asian and Southern Chinese populations highest risk.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'mrna', 'bispecific'],
  },
  {
    indication: 'Type 2 Diabetes',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 2800000,
    key_evidence: 'ADA 2024: Higher risk at lower BMI thresholds (BMI 23 vs 25). South Asian subgroup 3x risk.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy'],
  },

  // ══════════════════════════════════════════════════════════
  // NATIVE AMERICAN / ALASKA NATIVE COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Type 2 Diabetes',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 2.3,
    affected_population_estimate: 190000,
    key_evidence:
      'CDC 2024: 14.7% prevalence, highest of any racial group. Pima Indians: 50%+ prevalence. Strong Genetic Study.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy', 'gene_editing'],
  },
  {
    indication: 'Chronic Kidney Disease',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 1.8,
    affected_population_estimate: 95000,
    key_evidence: 'USRDS 2024: Diabetes-driven CKD. 1.8x ESRD. Strong Heart Study and CRIC data.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'rna_interference'],
  },
  {
    indication: 'Substance Use Disorder',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 135000,
    key_evidence: 'SAMHSA 2023: Highest rates of SUD among racial groups. Opioid and alcohol use disorders elevated.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },

  // ══════════════════════════════════════════════════════════
  // ASHKENAZI JEWISH COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Breast Cancer',
    community: 'Ashkenazi Jewish',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 18000,
    key_evidence: 'NCI: 1 in 40 Ashkenazi Jews carry BRCA1/2 vs 1 in 400 general population. 10x carrier frequency.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_editing', 'mrna'],
  },
  {
    indication: 'Ovarian Cancer',
    community: 'Ashkenazi Jewish',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 3500,
    key_evidence: 'NCI: BRCA1/2 founder mutations. 40-60% lifetime ovarian cancer risk for BRCA1 carriers.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_editing'],
  },
  {
    indication: 'Gaucher Disease',
    community: 'Ashkenazi Jewish',
    prevalence_multiplier: 100.0,
    affected_population_estimate: 6000,
    key_evidence: 'NINDS: 1 in 450 Ashkenazi Jews vs 1 in 40,000-60,000 general population. N370S founder mutation.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing', 'rna_interference'],
  },

  // ══════════════════════════════════════════════════════════
  // WOMEN (SEX-BASED DISPARITIES)
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Systemic Lupus Erythematosus',
    community: 'Women',
    prevalence_multiplier: 9.0,
    affected_population_estimate: 1350000,
    key_evidence: 'Lupus Foundation: 9:1 female-to-male ratio. Hormonal and X-chromosome linked mechanisms.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['targeted_degrader', 'gene_editing'],
  },
  {
    indication: 'Multiple Sclerosis',
    community: 'Women',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 700000,
    key_evidence:
      'National MS Society: 3:1 female-to-male ratio, increasing over time. Hormonal modulation of autoimmunity.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Rheumatoid Arthritis',
    community: 'Women',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 1100000,
    key_evidence:
      'ACR: 2-3x prevalence in women. Earlier onset, different joint pattern. Estrogen-related pathogenesis.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['targeted_degrader'],
  },
  {
    indication: 'Migraine',
    community: 'Women',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 28000000,
    key_evidence: 'American Migraine Foundation: 3x prevalence vs men. Hormonal triggers well-established.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: "Alzheimer's Disease",
    community: 'Women',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 3900000,
    key_evidence:
      'Alzheimer Association 2024: Nearly 2/3 of Americans with AD are women. Longer lifespan + biological factors.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Major Depressive Disorder',
    community: 'Women',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 14500000,
    key_evidence: 'NIMH: Women 1.7x more likely to have MDD episode. Perinatal, perimenopausal, and hormonal factors.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },

  // ══════════════════════════════════════════════════════════
  // MEDITERRANEAN COMMUNITY
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Beta-Thalassemia',
    community: 'Mediterranean',
    prevalence_multiplier: 15.0,
    affected_population_estimate: 25000,
    key_evidence:
      'WHO: Beta-thalassemia trait prevalence 5-20% in Mediterranean basin (Italy, Greece, Turkey, Cyprus).',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_editing', 'gene_therapy'],
  },

  // ══════════════════════════════════════════════════════════
  // ADDITIONAL CROSS-COMMUNITY ENTRIES
  // ══════════════════════════════════════════════════════════
  {
    indication: 'Non-Small Cell Lung Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 30000,
    key_evidence:
      'ACS 2024: Black men have highest lung cancer incidence. Later stage diagnosis. Lower surgical resection rates.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'bispecific', 'cell_therapy'],
  },
  {
    indication: 'Pancreatic Ductal Adenocarcinoma',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 10000,
    key_evidence: 'ACS 2024: 1.5x incidence. Higher rates of diabetes comorbidity. Later diagnosis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'cell_therapy', 'targeted_degrader'],
  },
  {
    indication: 'Glioblastoma',
    community: 'Men',
    prevalence_multiplier: 1.6,
    affected_population_estimate: 9000,
    key_evidence: 'CBTRUS 2024: 1.6x incidence in males. Possible hormonal/genetic susceptibility.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy', 'mrna'],
  },
  {
    indication: 'Melanoma',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 0.3,
    affected_population_estimate: 3200,
    key_evidence:
      'SEER: Lower overall incidence but later stage at diagnosis, thicker tumors, worse outcomes. Acral subtype elevated.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'mrna', 'cell_therapy'],
  },
  {
    indication: 'Atopic Dermatitis',
    community: 'African American / Black',
    prevalence_multiplier: 1.7,
    affected_population_estimate: 5100000,
    key_evidence:
      'AAD 2024: 1.7x prevalence in Black children. More severe disease, higher IgE. Filaggrin mutations less common — different pathogenesis.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Asthma',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 4200000,
    key_evidence: 'CDC 2024: 1.5x prevalence, 3x hospitalization rate, 2x mortality. Environmental + genetic factors.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Asthma',
    community: 'Hispanic / Latino (Puerto Rican)',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 1800000,
    key_evidence: 'CDC 2024: Puerto Rican Americans have highest asthma prevalence (~16.1%) of any ethnic group.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Obesity',
    community: 'African American / Black',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 8400000,
    key_evidence: 'CDC NHANES 2023: 49.9% obesity prevalence, highest of any group. Socioeconomic and genetic factors.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: "Parkinson's Disease",
    community: 'Men',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 600000,
    key_evidence:
      'Parkinson Foundation: 1.5x prevalence in men. Possible testosterone and occupational exposure factors.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Hepatocellular Carcinoma',
    community: 'African American / Black',
    prevalence_multiplier: 1.8,
    affected_population_estimate: 8500,
    key_evidence: 'SEER: 1.8x incidence. Hepatitis C driven. Later diagnosis and lower transplant rates.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'cell_therapy'],
  },
  {
    indication: 'Bladder Cancer',
    community: 'Men',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 63000,
    key_evidence: 'ACS 2024: 4x incidence in males vs females. Smoking and occupational exposure. SEER data.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Amyotrophic Lateral Sclerosis',
    community: 'Men',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 18000,
    key_evidence: 'ALS Association: 1.5x prevalence in males. Military service is a risk factor.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing', 'cell_therapy'],
  },
];

// ────────────────────────────────────────────────────────────
// QUERY HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Returns all community prevalence entries for a given indication.
 */
export function getCommunityDataForIndication(indicationName: string): CommunityPrevalenceEntry[] {
  const normalized = indicationName.toLowerCase().trim();
  return COMMUNITY_PREVALENCE_DATA.filter(
    (entry) =>
      entry.indication.toLowerCase() === normalized ||
      entry.indication.toLowerCase().includes(normalized) ||
      normalized.includes(entry.indication.toLowerCase()),
  );
}

/**
 * Returns top community opportunities ranked by impact potential:
 * higher prevalence multiplier × underrepresentation × modality gap count.
 */
export function getTopCommunityOpportunities(limit: number = 20): CommunityPrevalenceEntry[] {
  return [...COMMUNITY_PREVALENCE_DATA]
    .sort((a, b) => {
      const scoreA =
        a.prevalence_multiplier *
        (a.clinical_trial_representation === 'underrepresented' ? 1.5 : 1.0) *
        (1 + a.modality_gaps.length * 0.2);
      const scoreB =
        b.prevalence_multiplier *
        (b.clinical_trial_representation === 'underrepresented' ? 1.5 : 1.0) *
        (1 + b.modality_gaps.length * 0.2);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Returns all unique community names in the dataset.
 */
export function getAvailableCommunities(): string[] {
  return Array.from(new Set(COMMUNITY_PREVALENCE_DATA.map((e) => e.community))).sort();
}

/**
 * Returns the modality gap display name for a given modality code.
 */
export function getModalityDisplayName(modality: string): string {
  return MODALITY_TYPES.find((m) => m.modality === modality)?.display_name ?? modality;
}
