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
    indication: 'Metabolic Dysfunction-Associated Steatohepatitis',
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

  // ══════════════════════════════════════════════════════════
  // EXPANDED COMMUNITY PREVALENCE DATA (40 additional indications)
  // Sources: CDC, NIH NIMHD, SEER, AHA, ADA, SAMHSA, published
  // epidemiology literature. Added March 2026.
  // ══════════════════════════════════════════════════════════

  // ── ATRIAL FIBRILLATION ──────────────────────────────────
  {
    indication: 'Atrial Fibrillation',
    community: 'African American / Black',
    prevalence_multiplier: 0.5,
    affected_population_estimate: 250000,
    key_evidence:
      'AHA 2024: Paradoxically lower diagnosed prevalence (despite higher HTN) — likely underdiagnosis. Higher stroke risk when present.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Atrial Fibrillation',
    community: 'Geriatric',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 5000000,
    key_evidence: 'AHA 2024: Prevalence ~9% in adults >65, ~12% in adults >75. Age is strongest risk factor.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Atrial Fibrillation',
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 1200000,
    key_evidence:
      'JAHA 2023: Rural patients have higher undiagnosed AFib, delayed anticoagulation initiation, and reduced access to ablation centers.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── HEART FAILURE WITH REDUCED EJECTION FRACTION ─────────
  {
    indication: 'Heart Failure with Reduced Ejection Fraction',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 450000,
    key_evidence:
      'AHA 2024: Earlier onset by ~10 years. ARIC and Jackson Heart Study data. Beta-blocker response differences (carvedilol vs metoprolol).',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy', 'mrna'],
  },
  {
    indication: 'Heart Failure with Reduced Ejection Fraction',
    community: 'Rural',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 380000,
    key_evidence:
      'Circulation 2023: Rural communities have 28% higher HF mortality. Limited access to advanced HF centers and device therapy.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },
  {
    indication: 'Heart Failure with Reduced Ejection Fraction',
    community: 'Geriatric',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 2400000,
    key_evidence:
      'AHA 2024: Prevalence >10% in adults >80. Polypharmacy, frailty, and renal impairment complicate management.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },

  // ── HEART FAILURE WITH PRESERVED EJECTION FRACTION ───────
  {
    indication: 'Heart Failure with Preserved Ejection Fraction',
    community: 'Women',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 1800000,
    key_evidence:
      'Circulation 2023: Women comprise ~60% of HFpEF patients. Distinct phenotype with microvascular dysfunction, diastolic impairment.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },
  {
    indication: 'Heart Failure with Preserved Ejection Fraction',
    community: 'Geriatric',
    prevalence_multiplier: 3.5,
    affected_population_estimate: 2000000,
    key_evidence: 'JACC 2023: HFpEF prevalence increases exponentially with age. Median age at diagnosis ~75 years.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },

  // ── ISCHEMIC STROKE ──────────────────────────────────────
  {
    indication: 'Ischemic Stroke',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 300000,
    key_evidence:
      'AHA/ASA 2024: 2x incidence, younger onset (mean 6 years earlier). REGARDS study. Higher small vessel disease burden.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },
  {
    indication: 'Ischemic Stroke',
    community: 'Rural',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 200000,
    key_evidence:
      'Stroke 2023: Rural populations have higher stroke mortality due to longer transport times to comprehensive stroke centers and reduced tPA access.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy'],
  },
  {
    indication: 'Ischemic Stroke',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 180000,
    key_evidence:
      'AHA 2024: 1.5x incidence in Mexican Americans. Younger age at first stroke. Higher recurrence rates.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },

  // ── SCHIZOPHRENIA ────────────────────────────────────────
  {
    indication: 'Schizophrenia',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 420000,
    key_evidence:
      'NIMH/Schwartz 2021: Misdiagnosis rates 2-3x higher (often diagnosed as schizophrenia when bipolar). Diagnostic bias well-documented.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Schizophrenia',
    community: 'LGBTQ+',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 140000,
    key_evidence:
      'Lancet Psychiatry 2022: Higher psychosis rates linked to minority stress, discrimination, and social adversity. Treatment engagement gaps.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Schizophrenia',
    community: 'Rural',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 300000,
    key_evidence:
      'Schizophrenia Bull 2023: Rural areas have severe psychiatrist shortages (<25% of needed workforce). Long-acting injectable access limited.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },

  // ── BIPOLAR DISORDER ─────────────────────────────────────
  {
    indication: 'Bipolar Disorder',
    community: 'LGBTQ+',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 450000,
    key_evidence:
      'JAMA Psychiatry 2021: Sexual minorities show 1.5x bipolar disorder prevalence. Minority stress model and intersectional stigma.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Bipolar Disorder',
    community: 'Rural',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 600000,
    key_evidence:
      'Am J Psychiatry 2022: Similar prevalence but severe treatment gaps — 40% of rural counties have zero psychiatrists.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Bipolar Disorder',
    community: 'Pediatric',
    prevalence_multiplier: 0.8,
    affected_population_estimate: 750000,
    key_evidence:
      'AACAP 2023: Pediatric bipolar diagnosis controversial but growing. Often misdiagnosed as ADHD. Limited pharmacotherapy evidence in youth.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── POST-TRAUMATIC STRESS DISORDER ───────────────────────
  {
    indication: 'Post-Traumatic Stress Disorder',
    community: 'LGBTQ+',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 2400000,
    key_evidence:
      'JAMA Psychiatry 2023: Sexual/gender minorities 2x PTSD prevalence. Hate crimes, family rejection, and conversion therapy as traumas.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },
  {
    indication: 'Post-Traumatic Stress Disorder',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 200000,
    key_evidence:
      'Am Indian Alsk Native Ment Health Res 2022: Historical trauma, elevated rates of violence exposure. Intergenerational transmission documented.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Post-Traumatic Stress Disorder',
    community: 'Women',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 7200000,
    key_evidence: 'NIMH 2024: Women 2x lifetime PTSD prevalence vs men (10% vs 5%). Sexual assault is leading cause.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Post-Traumatic Stress Disorder',
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 1500000,
    key_evidence:
      'J Rural Health 2023: Combat veterans disproportionately in rural areas. Limited trauma-focused therapy and EMDR access.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── EPILEPSY ─────────────────────────────────────────────
  {
    indication: 'Epilepsy',
    community: 'African American / Black',
    prevalence_multiplier: 1.4,
    affected_population_estimate: 560000,
    key_evidence:
      'CDC 2024: Higher incidence, lower access to epilepsy centers and surgery. Higher status epilepticus mortality.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Epilepsy',
    community: 'Pediatric',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 470000,
    key_evidence:
      'Epilepsia 2023: Incidence peaks in first year of life. Pediatric epilepsy surgery underutilized. Developmental comorbidities common.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Epilepsy',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 520000,
    key_evidence:
      'Neurology 2023: Higher epilepsy prevalence in rural areas. Limited neurologist access and EEG monitoring. Higher ER utilization.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },

  // ── CHRONIC OBSTRUCTIVE PULMONARY DISEASE ────────────────
  {
    indication: 'Chronic Obstructive Pulmonary Disease',
    community: 'Rural',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 6000000,
    key_evidence:
      'CDC 2024: COPD prevalence 2x higher in rural vs urban areas. Smoking rates, occupational exposures, and limited pulmonology access.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy', 'bispecific'],
  },
  {
    indication: 'Chronic Obstructive Pulmonary Disease',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 2100000,
    key_evidence:
      'CHEST 2023: Earlier onset, more rapid FEV1 decline. Underdiagnosed relative to symptom burden. Less spirometry utilization.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Chronic Obstructive Pulmonary Disease',
    community: 'Geriatric',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 8000000,
    key_evidence:
      'ATS 2024: Prevalence exceeds 15% in adults >65. Frailty, comorbidity burden, and inhaler technique challenges.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Chronic Obstructive Pulmonary Disease',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 180000,
    key_evidence:
      'CDC 2023: High smoking prevalence, indoor biomass exposure. Limited access to pulmonary rehabilitation.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'bispecific'],
  },

  // ── SEVERE ASTHMA ────────────────────────────────────────
  {
    indication: 'Severe Asthma',
    community: 'African American / Black',
    prevalence_multiplier: 1.6,
    affected_population_estimate: 1500000,
    key_evidence:
      'JACI 2023: 3x ER visits, 2x mortality vs white patients. Th17-high phenotype more common. Biologic access disparities.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Severe Asthma',
    community: 'Pediatric',
    prevalence_multiplier: 1.8,
    affected_population_estimate: 1100000,
    key_evidence:
      'AAP 2024: Asthma most common chronic childhood disease. Biologic therapies only recently approved for pediatric severe asthma.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },

  // ── GLAUCOMA ─────────────────────────────────────────────
  {
    indication: 'Glaucoma',
    community: 'African American / Black',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 1200000,
    key_evidence:
      'NEI/NIH 2024: 3-4x prevalence of POAG vs whites. Earlier onset (by ~10 years). Higher rates of progression to blindness.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Glaucoma',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 650000,
    key_evidence:
      'Los Angeles Latino Eye Study (LALES): Higher open-angle glaucoma prevalence. Lower awareness and screening rates.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Glaucoma',
    community: 'Geriatric',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 2400000,
    key_evidence:
      'NEI 2024: Prevalence >5% in adults >70. Age-related trabecular meshwork degeneration. Adherence challenges with topical drops.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },

  // ── DIABETIC MACULAR EDEMA ───────────────────────────────
  {
    indication: 'Diabetic Macular Edema',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 400000,
    key_evidence:
      'NEI 2024: Tied to higher diabetes prevalence and worse glycemic control. Diabetic retinopathy rates 46% higher.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Diabetic Macular Edema',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.8,
    affected_population_estimate: 350000,
    key_evidence:
      'LALES: Diabetic retinopathy prevalence ~48% in diabetic Latinos. Higher rates of macular edema. Lower screening rates.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Diabetic Macular Edema',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 250000,
    key_evidence:
      'Ophthalmology 2023: Limited retinal specialist access in rural areas. Anti-VEGF injection burden (monthly visits) creates treatment gaps.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── HIV/AIDS ─────────────────────────────────────────────
  {
    indication: 'HIV/AIDS',
    community: 'African American / Black',
    prevalence_multiplier: 8.0,
    affected_population_estimate: 476000,
    key_evidence:
      'CDC HIV Surveillance 2024: Black Americans are 13% of US population but 40% of new HIV diagnoses. 8x rate vs whites.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'mrna', 'cell_therapy'],
  },
  {
    indication: 'HIV/AIDS',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 286000,
    key_evidence:
      'CDC 2024: Hispanic/Latino rate 4x that of whites. Stigma, language barriers, and immigration status reduce testing/treatment access.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'mrna'],
  },
  {
    indication: 'HIV/AIDS',
    community: 'LGBTQ+',
    prevalence_multiplier: 12.0,
    affected_population_estimate: 620000,
    key_evidence:
      'CDC 2024: MSM account for ~67% of new diagnoses. Transgender women have disproportionate burden. PrEP uptake gaps persist.',
    awareness_gap: 'low',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'mrna', 'cell_therapy'],
  },
  {
    indication: 'HIV/AIDS',
    community: 'Rural',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 120000,
    key_evidence:
      'J Rural Health 2023: Rising HIV rates in rural South. Limited infectious disease specialists and PrEP prescribers. Stigma barriers.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },

  // ── HEPATITIS B ──────────────────────────────────────────
  {
    indication: 'Hepatitis B',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 6.0,
    affected_population_estimate: 600000,
    key_evidence:
      'CDC 2024: Asian Americans account for ~58% of chronic HBV in US. Perinatal and childhood transmission in endemic countries.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_editing', 'rna_interference', 'mrna'],
  },
  {
    indication: 'Hepatitis B',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 200000,
    key_evidence:
      'CDC 2024: Higher chronic HBV prevalence, linked to late vaccination and immigration from endemic regions in sub-Saharan Africa.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_editing', 'rna_interference'],
  },

  // ── HEPATITIS C ──────────────────────────────────────────
  {
    indication: 'Hepatitis C',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 500000,
    key_evidence:
      'CDC 2024: 2x prevalence. Lower cure rates despite DAA availability due to access barriers. Baby boomer cohort disproportionately affected.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_editing', 'mrna'],
  },
  {
    indication: 'Hepatitis C',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 65000,
    key_evidence:
      'MMWR 2023: Highest HCV incidence of any racial group, driven by injection drug use epidemic. IHS treatment access limited.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_editing'],
  },
  {
    indication: 'Hepatitis C',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 400000,
    key_evidence:
      'CDC 2023: Rising HCV rates linked to opioid epidemic in rural Appalachia and Midwest. Limited hepatology access for DAA treatment.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_editing'],
  },

  // ── PROSTATE CANCER (additional communities) ─────────────
  {
    indication: 'Metastatic Castration-Resistant Prostate Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 2.4,
    affected_population_estimate: 18000,
    key_evidence:
      'ACS/SEER 2024: 2.4x mortality. Higher-grade tumors at diagnosis. PTEN loss and aggressive biology more common.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'adc', 'bispecific', 'targeted_degrader'],
  },

  // ── COLORECTAL CANCER (additional communities) ───────────
  {
    indication: 'Colorectal Cancer',
    community: 'Rural',
    prevalence_multiplier: 1.2,
    affected_population_estimate: 25000,
    key_evidence:
      'Cancer 2023: Higher CRC mortality in rural Appalachian and Southern communities. Lower screening colonoscopy rates.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc'],
  },
  {
    indication: 'Colorectal Cancer',
    community: 'Pediatric',
    prevalence_multiplier: 0.05,
    affected_population_estimate: 400,
    key_evidence:
      'ACS 2024: Rising early-onset CRC (under 50) is alarming trend. Under-45 incidence doubled since 1990s. Molecular profiles differ.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'adc', 'bispecific'],
  },

  // ── CERVICAL CANCER (additional communities) ─────────────
  {
    indication: 'Cervical Cancer',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 3500,
    key_evidence:
      'ACS 2024: 1.3x incidence, 1.8x mortality. Hysterectomy-corrected rates show even larger disparity. Screening access gaps.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'mrna'],
  },
  {
    indication: 'Cervical Cancer',
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 2800,
    key_evidence:
      'Cancer Epidemiol 2023: Lower HPV vaccination rates and Pap smear screening in rural communities. Later stage at diagnosis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['checkpoint_inhibitor', 'mrna'],
  },

  // ── PLAQUE PSORIASIS ─────────────────────────────────────
  {
    indication: 'Plaque Psoriasis',
    community: 'African American / Black',
    prevalence_multiplier: 0.5,
    affected_population_estimate: 750000,
    key_evidence:
      'JAAD 2023: Lower overall prevalence but underdiagnosed due to different clinical presentation on darker skin. More severe disease at diagnosis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'gene_therapy'],
  },
  {
    indication: 'Plaque Psoriasis',
    community: 'Geriatric',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 2500000,
    key_evidence:
      'BJD 2022: Bimodal age distribution with late-onset peak. Comorbidity burden (CVD, metabolic) complicates biologic selection.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific'],
  },

  // ── CROHN'S DISEASE ──────────────────────────────────────
  {
    indication: "Crohn's Disease",
    community: 'Pediatric',
    prevalence_multiplier: 0.3,
    affected_population_estimate: 80000,
    key_evidence:
      'NASPGHAN 2023: Pediatric Crohn rising rapidly. More extensive disease phenotype in children. Growth failure as unique complication.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'bispecific'],
  },
  {
    indication: "Crohn's Disease",
    community: 'African American / Black',
    prevalence_multiplier: 0.5,
    affected_population_estimate: 100000,
    key_evidence:
      'CGH 2023: Historically considered rare in Black populations but rising. Perianal disease and stricturing phenotype more common. Diagnostic delays.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'cell_therapy'],
  },

  // ── ULCERATIVE COLITIS ───────────────────────────────────
  {
    indication: 'Ulcerative Colitis',
    community: 'Pediatric',
    prevalence_multiplier: 0.3,
    affected_population_estimate: 65000,
    key_evidence:
      'JPGN 2023: Very early onset IBD increasing. Pancolitis more common in pediatric UC than adult UC. Limited biologic trial data.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'bispecific'],
  },
  {
    indication: 'Ulcerative Colitis',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 0.4,
    affected_population_estimate: 45000,
    key_evidence:
      'Gut 2023: UC incidence rising rapidly in Asian populations (both immigrant and Asian-resident). Westernization of diet implicated.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'cell_therapy'],
  },

  // ── TYPE 1 DIABETES ──────────────────────────────────────
  {
    indication: 'Type 1 Diabetes',
    community: 'Pediatric',
    prevalence_multiplier: 5.0,
    affected_population_estimate: 244000,
    key_evidence:
      'ADA 2024: Peak incidence at ages 10-14. Most autoimmune diabetes diagnosed in childhood. Increasing incidence 2-3% per year globally.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['cell_therapy', 'gene_editing', 'mrna'],
  },
  {
    indication: 'Type 1 Diabetes',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 300000,
    key_evidence:
      'Diabetes Care 2023: Rising T1D incidence in Black youth. Higher DKA rates at diagnosis. More misdiagnosed as T2D.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_editing'],
  },

  // ── OSTEOARTHRITIS ───────────────────────────────────────
  {
    indication: 'Osteoarthritis',
    community: 'Geriatric',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 25000000,
    key_evidence:
      'CDC 2024: ~50% of adults >65 have OA. Strongest risk factor is age. Joint replacement access varies by geography and race.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Osteoarthritis',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 4500000,
    key_evidence:
      'Arthritis Care Res 2023: Similar or higher prevalence, but 40% less likely to receive TKA. Higher pain severity and functional limitation.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },
  {
    indication: 'Osteoarthritis',
    community: 'Women',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 18000000,
    key_evidence:
      'ACR 2024: 1.5x prevalence in women, especially post-menopause. Hand and knee OA more severe. Estrogen loss accelerates cartilage degradation.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['cell_therapy'],
  },

  // ── OSTEOPOROSIS ─────────────────────────────────────────
  {
    indication: 'Osteoporosis',
    community: 'Women',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 8000000,
    key_evidence:
      'NOF 2024: 80% of osteoporosis patients are women. Post-menopausal estrogen loss drives rapid bone density decline.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Osteoporosis',
    community: 'Geriatric',
    prevalence_multiplier: 3.5,
    affected_population_estimate: 9000000,
    key_evidence:
      'CDC 2024: Prevalence >25% in women >65. Hip fracture mortality 20% at 1 year in elderly. Treatment gap persists.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Osteoporosis',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 600000,
    key_evidence:
      'JBMR 2023: Asian women have lower bone mineral density and higher fracture risk at given BMD. Different body composition and geometry.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── GOUT ─────────────────────────────────────────────────
  {
    indication: 'Gout',
    community: 'Native Hawaiian / Pacific Islander',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 45000,
    key_evidence:
      'Arthritis Rheumatol 2023: Highest gout prevalence globally (up to 12%). Genetic SLC2A9/ABCG2 variants. Severe tophaceous disease common.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'targeted_degrader'],
  },
  {
    indication: 'Gout',
    community: 'African American / Black',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 1500000,
    key_evidence:
      'J Rheumatol 2023: Higher gout prevalence, more frequent flares. Allopurinol hypersensitivity (HLA-B*5801) prevalent — pharmacogenomic testing underutilized.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['targeted_degrader'],
  },
  {
    indication: 'Gout',
    community: 'Men',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 6300000,
    key_evidence:
      'ACR 2024: 3x prevalence in men vs women (6% vs 2%). Sex hormone differences in renal urate handling.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['targeted_degrader'],
  },

  // ── IRRITABLE BOWEL SYNDROME ─────────────────────────────
  {
    indication: 'Irritable Bowel Syndrome',
    community: 'Women',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 18000000,
    key_evidence:
      'AGA 2024: 1.5-2x prevalence in women. Hormonal modulation of gut motility and visceral hypersensitivity.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Irritable Bowel Syndrome',
    community: 'LGBTQ+',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 1500000,
    key_evidence:
      'Neurogastroenterol Motil 2023: Higher functional GI disorder prevalence in sexual minorities. Stress-gut axis and minority stress.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── GENERALIZED ANXIETY DISORDER ─────────────────────────
  {
    indication: 'Generalized Anxiety Disorder',
    community: 'Women',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 9600000,
    key_evidence:
      'NIMH 2024: Women 2x lifetime GAD prevalence. Hormonal fluctuations, postpartum, and perimenopausal periods as risk factors.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Generalized Anxiety Disorder',
    community: 'LGBTQ+',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 3000000,
    key_evidence:
      'JAMA Network Open 2023: 2.5x anxiety disorder prevalence. Discrimination, identity concealment, and societal stigma as drivers.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Generalized Anxiety Disorder',
    community: 'Pediatric',
    prevalence_multiplier: 1.0,
    affected_population_estimate: 2400000,
    key_evidence:
      'AACAP 2023: ~7% of children/adolescents meet GAD criteria. COVID-19 pandemic increased rates ~25%. Limited CBT access for youth.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── ATTENTION-DEFICIT/HYPERACTIVITY DISORDER ─────────────
  {
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    community: 'Pediatric',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 6000000,
    key_evidence:
      'CDC 2024: ~9.8% of US children diagnosed with ADHD. Peak diagnosis ages 6-11. Stimulant medication most common treatment.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    community: 'African American / Black',
    prevalence_multiplier: 0.7,
    affected_population_estimate: 1200000,
    key_evidence:
      'Pediatrics 2023: Lower diagnosis rates despite similar symptom prevalence — suggesting underdiagnosis. Later age at diagnosis, less medication use.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    community: 'Women',
    prevalence_multiplier: 0.5,
    affected_population_estimate: 5000000,
    key_evidence:
      'J Clin Psychiatry 2023: Historically underdiagnosed in females (inattentive subtype more common). Growing recognition of adult female ADHD.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── CHRONIC PAIN ─────────────────────────────────────────
  {
    indication: 'Chronic Pain',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 15000000,
    key_evidence:
      'Pain Med 2023: Higher chronic pain prevalence, more opioid prescribing, fewer multimodal pain management options. Physical therapy access limited.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Chronic Pain',
    community: 'Native American / Alaska Native',
    prevalence_multiplier: 1.6,
    affected_population_estimate: 300000,
    key_evidence:
      'Pain 2023: Highest chronic pain prevalence of any racial group. Opioid crisis disproportionate impact. Limited integrative pain services.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Chronic Pain',
    community: 'Geriatric',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 18000000,
    key_evidence:
      'JAGS 2024: >50% of adults >65 have chronic pain. Undertreated due to opioid concerns, polypharmacy, and cognitive impairment challenges.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── FIBROMYALGIA ─────────────────────────────────────────
  {
    indication: 'Fibromyalgia',
    community: 'Women',
    prevalence_multiplier: 7.0,
    affected_population_estimate: 3500000,
    key_evidence:
      'ACR 2024: 7:1 female-to-male ratio in diagnosis. Central sensitization and neuroendocrine mechanisms. Often comorbid with mood disorders.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Fibromyalgia',
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 800000,
    key_evidence:
      'J Pain 2023: Limited access to rheumatology, pain psychology, and multidisciplinary pain programs in rural areas.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── IDIOPATHIC PULMONARY FIBROSIS ────────────────────────
  {
    indication: 'Idiopathic Pulmonary Fibrosis',
    community: 'Men',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 80000,
    key_evidence:
      'ATS 2024: 2:1 male predominance. Occupational dust/fume exposure history more common in male IPF patients.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Idiopathic Pulmonary Fibrosis',
    community: 'Geriatric',
    prevalence_multiplier: 5.0,
    affected_population_estimate: 90000,
    key_evidence:
      'Lancet Respir Med 2023: Median age at diagnosis 66 years. Prevalence increases with age. Lung transplant less accessible for elderly.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },

  // ── TREATMENT-RESISTANT DEPRESSION ───────────────────────
  {
    indication: 'Treatment-Resistant Depression',
    community: 'LGBTQ+',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 600000,
    key_evidence:
      'JAMA Psychiatry 2023: Higher rates of treatment resistance in sexual/gender minorities. Minority stress as perpetuating factor.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Treatment-Resistant Depression',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 450000,
    key_evidence:
      'Depression Anxiety 2023: Limited access to esketamine treatment centers, TMS, and ECT in rural areas. Fewer psychiatrists to manage treatment optimization.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Treatment-Resistant Depression',
    community: 'Geriatric',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 500000,
    key_evidence:
      'Am J Geriatr Psychiatry 2023: Late-life TRD associated with vascular depression, white matter disease. Higher medical comorbidity complicates treatment.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── ALZHEIMER'S DISEASE (additional communities) ─────────
  {
    indication: "Alzheimer's Disease",
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 1300000,
    key_evidence:
      'Alzheimer Association 2024: 2x AD risk vs white Americans. Vascular risk factor burden, APOE4 penetrance differences. Later diagnosis.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'adc'],
  },
  {
    indication: "Alzheimer's Disease",
    community: 'Hispanic / Latino',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 750000,
    key_evidence:
      'Alzheimer Association 2024: 1.5x AD risk. Fastest-growing affected demographic. Language and cultural barriers delay diagnosis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: "Alzheimer's Disease",
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 800000,
    key_evidence:
      'Neurology 2023: Delayed diagnosis by 1-2 years in rural areas. Limited neurologist access, amyloid PET scanning, and infusion centers for anti-amyloid antibodies.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'adc'],
  },

  // ── PARKINSON'S DISEASE (additional communities) ─────────
  {
    indication: "Parkinson's Disease",
    community: 'Geriatric',
    prevalence_multiplier: 5.0,
    affected_population_estimate: 800000,
    key_evidence:
      'Parkinson Foundation 2024: Prevalence increases dramatically with age. >4% of adults >80 affected. Falls and cognitive decline major challenges.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: "Parkinson's Disease",
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 130000,
    key_evidence:
      'Mov Disord 2023: Pesticide exposure as risk factor in agricultural communities. Limited access to movement disorder specialists and DBS centers.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },

  // ── HIDRADENITIS SUPPURATIVA ─────────────────────────────
  {
    indication: 'Hidradenitis Suppurativa',
    community: 'African American / Black',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 600000,
    key_evidence:
      'JAAD 2023: 3x prevalence vs white populations. More severe disease phenotype. Delayed diagnosis (average 7+ years). Biologic access disparities.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'targeted_degrader'],
  },
  {
    indication: 'Hidradenitis Suppurativa',
    community: 'Women',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 750000,
    key_evidence:
      'BJD 2023: 3:1 female predominance. Hormonal influence (flares premenstrual). Significant impact on quality of life and mental health.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['bispecific'],
  },

  // ── CHRONIC SPONTANEOUS URTICARIA ────────────────────────
  {
    indication: 'Chronic Spontaneous Urticaria',
    community: 'Women',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 2400000,
    key_evidence:
      'JACI Pract 2023: 2:1 female predominance. Autoimmune basis (IgG anti-FcεRI or anti-IgE antibodies) more common in women.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['bispecific'],
  },

  // ── IGA NEPHROPATHY ──────────────────────────────────────
  {
    indication: 'IgA Nephropathy',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 2.5,
    affected_population_estimate: 50000,
    key_evidence:
      'JASN 2023: IgAN is the most common glomerulonephritis worldwide, with highest prevalence in East Asia. GWAS identifies Asian-enriched risk loci.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'rna_interference'],
  },
  {
    indication: 'IgA Nephropathy',
    community: 'Pediatric',
    prevalence_multiplier: 0.8,
    affected_population_estimate: 15000,
    key_evidence:
      'Pediatr Nephrol 2023: Significant pediatric burden (20-30% of cases present in childhood). Better renal survival than adult-onset but long-term monitoring needed.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'rna_interference'],
  },

  // ── NEOVASCULAR AGE-RELATED MACULAR DEGENERATION ─────────
  {
    indication: 'Neovascular Age-Related Macular Degeneration',
    community: 'Geriatric',
    prevalence_multiplier: 5.0,
    affected_population_estimate: 1500000,
    key_evidence:
      'NEI 2024: Prevalence increases exponentially after age 70. Leading cause of vision loss in elderly. Anti-VEGF injection burden challenges.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },
  {
    indication: 'Neovascular Age-Related Macular Degeneration',
    community: 'Rural',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 300000,
    key_evidence:
      'Ophthalmology 2023: Rural patients travel >60 miles for retinal care. Monthly anti-VEGF injections create treatment adherence crisis.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── GEOGRAPHIC ATROPHY ───────────────────────────────────
  {
    indication: 'Geographic Atrophy',
    community: 'Geriatric',
    prevalence_multiplier: 4.0,
    affected_population_estimate: 800000,
    key_evidence:
      'NEI 2024: Almost exclusively affects adults >60. New complement inhibitor therapies require regular intravitreal injection — adherence challenge in elderly.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy', 'gene_editing'],
  },

  // ── SUBSTANCE USE DISORDER (additional communities) ──────
  {
    indication: 'Substance Use Disorder',
    community: 'LGBTQ+',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 3000000,
    key_evidence:
      'SAMHSA 2024: Sexual minorities 2x SUD prevalence. Methamphetamine and alcohol use disorders disproportionately elevated. Fewer affirming treatment programs.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },
  {
    indication: 'Substance Use Disorder',
    community: 'Rural',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 3500000,
    key_evidence:
      'CDC/SAMHSA 2024: Opioid crisis epicenter in rural Appalachia, Ohio Valley, and Southwest. Limited MAT providers (buprenorphine waivers). Methamphetamine rising.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'mrna'],
  },

  // ── ACNE VULGARIS ────────────────────────────────────────
  {
    indication: 'Acne Vulgaris',
    community: 'Pediatric',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 17000000,
    key_evidence:
      'AAD 2024: ~85% of adolescents affected. Peak prevalence ages 12-18. Isotretinoin use requires iPLEDGE compliance. Psychosocial impact significant.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Acne Vulgaris',
    community: 'African American / Black',
    prevalence_multiplier: 1.0,
    affected_population_estimate: 4500000,
    key_evidence:
      'JAAD 2023: Similar prevalence but higher post-inflammatory hyperpigmentation risk. Scarring patterns differ. Fewer dermatology visits.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── HYPERLIPIDEMIA ───────────────────────────────────────
  {
    indication: 'Hyperlipidemia',
    community: 'Geriatric',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 30000000,
    key_evidence:
      'AHA 2024: High prevalence but statin deprescribing debate in very elderly. ASCVD risk management complicated by polypharmacy and frailty.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['rna_interference', 'gene_editing'],
  },
  {
    indication: 'Hyperlipidemia',
    community: 'Asian / Pacific Islander',
    prevalence_multiplier: 1.3,
    affected_population_estimate: 3000000,
    key_evidence:
      'AHA 2024: South Asian populations have atherogenic dyslipidemia pattern (high TG, low HDL, small dense LDL) at lower BMIs.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['rna_interference', 'gene_editing'],
  },

  // ── PULMONARY ARTERIAL HYPERTENSION ──────────────────────
  {
    indication: 'Pulmonary Arterial Hypertension',
    community: 'Women',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 37500,
    key_evidence:
      'CHEST 2024: 3-4:1 female predominance. Idiopathic PAH and PAH associated with connective tissue disease (scleroderma, lupus) strongly female-predominant.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Pulmonary Arterial Hypertension',
    community: 'African American / Black',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 12000,
    key_evidence:
      'CHEST 2023: Higher PAH mortality. SLE-associated PAH more common in Black women. Delayed referral to PH centers.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── PERIPHERAL ARTERY DISEASE ────────────────────────────
  {
    indication: 'Peripheral Artery Disease',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 2000000,
    key_evidence:
      'AHA 2024: 2x PAD prevalence. Higher amputation rates (3-4x). Ankle-brachial index screening underutilized. ARIC study data.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'cell_therapy'],
  },
  {
    indication: 'Peripheral Artery Disease',
    community: 'Geriatric',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 6000000,
    key_evidence:
      'AHA 2024: Prevalence >15% in adults >70. Age is strongest risk factor. Often asymptomatic until critical limb ischemia.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['cell_therapy', 'gene_therapy'],
  },

  // ── HYPOTHYROIDISM ───────────────────────────────────────
  {
    indication: 'Hypothyroidism',
    community: 'Women',
    prevalence_multiplier: 5.0,
    affected_population_estimate: 15000000,
    key_evidence:
      'ATA 2024: 5-8x more common in women. Autoimmune thyroiditis (Hashimoto) is leading cause. Pregnancy and postpartum periods increase risk.',
    awareness_gap: 'low',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Hypothyroidism',
    community: 'Geriatric',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 5000000,
    key_evidence:
      'J Clin Endocrinol Metab 2023: Prevalence increases with age. Subclinical hypothyroidism common (>10% of elderly women). TSH thresholds debated in elderly.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── IRON DEFICIENCY ANEMIA ───────────────────────────────
  {
    indication: 'Iron Deficiency Anemia',
    community: 'Women',
    prevalence_multiplier: 3.0,
    affected_population_estimate: 6000000,
    key_evidence:
      'WHO/CDC 2024: Menstruation, pregnancy, and lactation drive 3x prevalence vs men. Iron supplementation guidelines often underfollowed.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Iron Deficiency Anemia',
    community: 'Pediatric',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 2500000,
    key_evidence:
      'AAP 2024: Toddlers (6-24 months) and adolescent girls at highest risk. Dietary insufficiency. Impacts neurocognitive development.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },
  {
    indication: 'Iron Deficiency Anemia',
    community: 'African American / Black',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 1600000,
    key_evidence:
      'Blood 2023: Higher IDA prevalence in Black women (12% vs 5% white women). Fibroid-related blood loss and dietary factors contribute.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy'],
  },

  // ── IMMUNE THROMBOCYTOPENIA ──────────────────────────────
  {
    indication: 'Immune Thrombocytopenia',
    community: 'Pediatric',
    prevalence_multiplier: 2.0,
    affected_population_estimate: 20000,
    key_evidence:
      'ASH 2024: Pediatric ITP is most common autoimmune cytopenia in children. Often post-viral. Higher spontaneous remission rate than adult ITP.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['bispecific', 'cell_therapy'],
  },
  {
    indication: 'Immune Thrombocytopenia',
    community: 'Women',
    prevalence_multiplier: 1.5,
    affected_population_estimate: 45000,
    key_evidence:
      'Blood Adv 2023: Female predominance in adult chronic ITP. Autoimmune co-occurrence (SLE, thyroid). Pregnancy management challenges.',
    awareness_gap: 'moderate',
    clinical_trial_representation: 'proportional',
    modality_gaps: ['bispecific'],
  },

  // ── CYSTIC FIBROSIS (additional communities) ─────────────
  {
    indication: 'Cystic Fibrosis',
    community: 'Hispanic / Latino',
    prevalence_multiplier: 0.3,
    affected_population_estimate: 3500,
    key_evidence:
      'CFF 2024: Lower prevalence but underdiagnosed. Non-classic CFTR mutations more common. Elexacaftor/tezacaftor/ivacaftor may have differential efficacy for non-F508del.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'mrna'],
  },
  {
    indication: 'Cystic Fibrosis',
    community: 'African American / Black',
    prevalence_multiplier: 0.15,
    affected_population_estimate: 1500,
    key_evidence:
      'CFF 2024: Rare but significantly underdiagnosed. Later diagnosis age. Different CFTR mutation spectrum — fewer eligible for current modulators.',
    awareness_gap: 'high',
    clinical_trial_representation: 'underrepresented',
    modality_gaps: ['gene_therapy', 'gene_editing', 'mrna'],
  },
];

// ────────────────────────────────────────────────────────────
// QUERY HELPERS
// ────────────────────────────────────────────────────────────

/**
 * Alias map for community-prevalence indication names that don't directly
 * match indication-map names. Keys are normalized community-prevalence names;
 * values are alternative tokens that should also match.
 */
const COMMUNITY_INDICATION_ALIASES: Record<string, string[]> = {
  'metabolic dysfunction-associated steatohepatitis': [
    'nash',
    'non-alcoholic steatohepatitis',
    'mash',
    'nonalcoholic steatohepatitis',
  ],
  stroke: ['ischemic stroke', 'cerebrovascular', 'hemorrhagic stroke'],
  'heart failure': [
    'heart failure with reduced ejection fraction',
    'heart failure with preserved ejection fraction',
    'hfref',
    'hfpef',
  ],
  'breast cancer': ['triple negative breast cancer', 'her2-positive breast cancer', 'hr+/her2- breast cancer'],
  'prostate cancer': ['metastatic castration-resistant prostate cancer', 'mcrpc', 'prostate'],
  'bladder cancer': ['urothelial carcinoma', 'urothelial cancer', 'bladder'],
  'nasopharyngeal cancer': ['nasopharyngeal carcinoma', 'npc'],
};

/**
 * Returns all community prevalence entries for a given indication.
 * Uses substring matching plus an alias map for known naming mismatches
 * between community-prevalence data and indication-map names.
 */
export function getCommunityDataForIndication(indicationName: string): CommunityPrevalenceEntry[] {
  const normalized = indicationName.toLowerCase().trim();
  return COMMUNITY_PREVALENCE_DATA.filter((entry) => {
    const entryName = entry.indication.toLowerCase();

    // Direct exact or substring match
    if (entryName === normalized || entryName.includes(normalized) || normalized.includes(entryName)) {
      return true;
    }

    // Check if the entry's indication has aliases that match the query
    const aliases = COMMUNITY_INDICATION_ALIASES[entryName];
    if (aliases) {
      for (const alias of aliases) {
        if (alias.includes(normalized) || normalized.includes(alias)) return true;
      }
    }

    // Check if the query matches an alias that maps back to the entry
    for (const [canonical, aliasList] of Object.entries(COMMUNITY_INDICATION_ALIASES)) {
      if (aliasList.some((a) => a.includes(normalized) || normalized.includes(a))) {
        if (entryName === canonical || entryName.includes(canonical) || canonical.includes(entryName)) {
          return true;
        }
      }
    }

    return false;
  });
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
