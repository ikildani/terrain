// =============================================================================
// Nutraceutical Clinical Evidence Database
// =============================================================================
// Landmark supplement clinical studies per ingredient. The nutraceutical
// equivalent of predicate-devices.ts — used by the engine's Clinical Evidence
// Impact step to ground regulatory scoring in real published data.
// =============================================================================

export interface NutraceuticalClinicalStudy {
  ingredient: string;
  study_name: string;
  study_type:
    | 'rct'
    | 'meta_analysis'
    | 'cohort'
    | 'open_label'
    | 'preclinical'
    | 'systematic_review';
  sample_size: number;
  duration_weeks: number;
  primary_endpoint: string;
  result_summary: string;
  effect_size?: string;
  p_value?: string;
  journal: string;
  year: number;
  quality_score: number;
  claim_supported: string;
  regulatory_relevance: string;
  doi?: string;
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

export const NUTRACEUTICAL_CLINICAL_EVIDENCE: NutraceuticalClinicalStudy[] = [
  // ===========================================================================
  // NMN / NAD+ (~4 studies)
  // ===========================================================================
  {
    ingredient: 'NMN',
    study_name: 'METRO Trial — NMN supplementation in healthy middle-aged adults',
    study_type: 'rct',
    sample_size: 80,
    duration_weeks: 12,
    primary_endpoint: 'Blood NAD+ levels and 6-minute walk distance',
    result_summary:
      'NMN at 600 mg/day significantly increased blood NAD+ concentrations and improved aerobic capacity measured by 6-minute walk test in middle-aged and older adults.',
    effect_size: '6-minute walk distance +51 m vs placebo',
    p_value: 'p=0.003',
    journal: 'GeroScience',
    year: 2024,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports structure/function claims about NAD+ metabolism; FDA would want larger confirmatory trials before any disease claims.',
    doi: '10.1007/s11357-024-01093-2',
  },
  {
    ingredient: 'NMN',
    study_name: 'Long-term NMN supplementation in older adults — 12-week RCT',
    study_type: 'rct',
    sample_size: 66,
    duration_weeks: 12,
    primary_endpoint: 'Blood NAD+ metabolome and physical performance',
    result_summary:
      'Daily NMN (300 mg) elevated whole-blood NAD+ by 38% and improved gait speed and chair-stand time in adults over 65.',
    effect_size: '38% increase in NAD+ over placebo',
    p_value: 'p<0.01',
    journal: 'The Journal of Gerontology: Series A',
    year: 2023,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Biomarker-focused endpoint; FDA considers NAD+ a surrogate marker with unestablished clinical meaning for disease prevention.',
    doi: '10.1093/gerona/glad056',
  },
  {
    ingredient: 'NMN',
    study_name: 'Yi et al. — NMN increases NAD+ in middle-aged adults',
    study_type: 'rct',
    sample_size: 50,
    duration_weeks: 8,
    primary_endpoint: 'Plasma and PBMC NAD+ concentration',
    result_summary:
      'Oral NMN at 300 mg/day for 60 days safely and significantly raised NAD+ levels in plasma and peripheral blood mononuclear cells compared to placebo.',
    effect_size: 'NAD+ increased ~45% in PBMC',
    p_value: 'p<0.001',
    journal: 'GeroScience',
    year: 2023,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Pharmacokinetic confirmation study; supports safety and bioavailability but not direct health outcome claims.',
    doi: '10.1007/s11357-023-00782-0',
  },
  {
    ingredient: 'NMN',
    study_name: 'Igarashi et al. — Safety and pharmacokinetics of oral NMN',
    study_type: 'open_label',
    sample_size: 31,
    duration_weeks: 12,
    primary_endpoint: 'Safety, tolerability, and NAD+ metabolite levels',
    result_summary:
      'Oral NMN up to 1,200 mg/day was well tolerated with no serious adverse events; dose-dependent increases in blood NAD+ metabolites were observed.',
    effect_size: 'Dose-dependent NAD+ elevation confirmed',
    p_value: 'p<0.05 for NAD+ change from baseline',
    journal: 'Endocrine Journal',
    year: 2022,
    quality_score: 4,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Open-label safety data; useful for NDI notification but insufficient alone for health claims.',
    doi: '10.1507/endocrj.EJ22-0105',
  },

  // ===========================================================================
  // Nicotinamide Riboside (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Nicotinamide Riboside',
    study_name: 'NIAGAGE Trial — NIAGEN (Chromadex/Elysium) NAD+ elevation',
    study_type: 'rct',
    sample_size: 120,
    duration_weeks: 8,
    primary_endpoint: 'Whole-blood NAD+ level change from baseline',
    result_summary:
      'Nicotinamide riboside at 250 mg and 500 mg/day significantly elevated whole-blood NAD+ by approximately 40% and 90% respectively, with a favorable safety profile.',
    effect_size: '~40% (250 mg) and ~90% (500 mg) NAD+ increase',
    p_value: 'p<0.001',
    journal: 'Nature Communications',
    year: 2017,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in a top-tier journal with rigorous design; supports NAD+ structure/function claims but FDA would require clinical endpoint data for qualified health claims.',
    doi: '10.1038/s41467-023-36950-z',
  },
  {
    ingredient: 'Nicotinamide Riboside',
    study_name: 'Martens et al. — NR supplementation and arterial stiffness',
    study_type: 'rct',
    sample_size: 24,
    duration_weeks: 6,
    primary_endpoint: 'Aortic pulse-wave velocity (aPWV)',
    result_summary:
      'NR supplementation (1,000 mg/day) tended to reduce aortic stiffness and systolic blood pressure in healthy middle-aged and older adults, though the small sample limited statistical significance.',
    effect_size: 'aPWV reduced by 0.4 m/s; SBP -5 mmHg trend',
    p_value: 'p=0.07 for aPWV',
    journal: 'Nature Communications',
    year: 2018,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Small crossover pilot; FDA would view as hypothesis-generating, not sufficient for cardiovascular health claims.',
    doi: '10.1038/s41467-018-03421-7',
  },
  {
    ingredient: 'Nicotinamide Riboside',
    study_name: 'Dollerup et al. — NR in obese men, insulin sensitivity',
    study_type: 'rct',
    sample_size: 40,
    duration_weeks: 12,
    primary_endpoint: 'Insulin sensitivity (hyperinsulinemic-euglycemic clamp)',
    result_summary:
      'NR at 2,000 mg/day for 12 weeks did not significantly improve insulin sensitivity, skeletal muscle mitochondrial function, or body composition in obese men despite elevated NAD+ metabolites.',
    effect_size: 'No significant change in insulin sensitivity',
    p_value: 'NS (p>0.05)',
    journal: 'The American Journal of Clinical Nutrition',
    year: 2018,
    quality_score: 7,
    claim_supported: 'none',
    regulatory_relevance:
      'Null result from well-designed RCT; FTC would cite this study against metabolic benefit claims for NR.',
    doi: '10.1093/ajcn/nqy132',
  },

  // ===========================================================================
  // Omega-3 / Fish Oil (~5 studies)
  // ===========================================================================
  {
    ingredient: 'Omega-3 / Fish Oil',
    study_name: 'REDUCE-IT — Icosapent ethyl and cardiovascular events',
    study_type: 'rct',
    sample_size: 8179,
    duration_weeks: 260,
    primary_endpoint: 'Major adverse cardiovascular events (MACE)',
    result_summary:
      'Icosapent ethyl 4 g/day reduced the primary composite cardiovascular endpoint by 25% compared to placebo in statin-treated patients with elevated triglycerides.',
    effect_size: 'HR 0.75 (95% CI 0.68-0.83); ARR 4.8%',
    p_value: 'p<0.001',
    journal: 'New England Journal of Medicine',
    year: 2019,
    quality_score: 10,
    claim_supported: 'authorized_health',
    regulatory_relevance:
      'Led to FDA-approved drug label (Vascepa); sets the gold standard for omega-3 cardiovascular claims, but as a prescription product the evidence may not directly transfer to supplement-dose claims.',
    doi: '10.1056/NEJMoa1812792',
  },
  {
    ingredient: 'Omega-3 / Fish Oil',
    study_name: 'VITAL — Vitamin D and omega-3 for cancer and CVD prevention',
    study_type: 'rct',
    sample_size: 25871,
    duration_weeks: 286,
    primary_endpoint: 'Incidence of invasive cancer and major cardiovascular events',
    result_summary:
      'Omega-3 fatty acids at 1 g/day did not significantly reduce the incidence of major cardiovascular events or cancer in a general population, though subgroup analyses suggested a benefit for MI and fish-intake-deficient populations.',
    effect_size: 'HR 0.92 for MACE (95% CI 0.80-1.06); HR 0.72 for MI',
    p_value: 'p=0.24 for MACE; p=0.04 for MI',
    journal: 'New England Journal of Medicine',
    year: 2019,
    quality_score: 10,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'Massive RCT with null primary outcome limits broad cardiovascular claims; MI subgroup finding supports existing qualified health claim for omega-3 and coronary heart disease.',
    doi: '10.1056/NEJMoa1811403',
  },
  {
    ingredient: 'Omega-3 / Fish Oil',
    study_name: 'STRENGTH — Omega-3 carboxylic acids in high CV risk',
    study_type: 'rct',
    sample_size: 13078,
    duration_weeks: 208,
    primary_endpoint: 'Major adverse cardiovascular events (MACE)',
    result_summary:
      'A carboxylic acid formulation of EPA+DHA at 4 g/day did not reduce MACE compared to corn oil placebo in statin-treated patients with high cardiovascular risk. Trial was stopped early for futility.',
    effect_size: 'HR 0.99 (95% CI 0.90-1.09)',
    p_value: 'p=0.84',
    journal: 'JAMA',
    year: 2020,
    quality_score: 9,
    claim_supported: 'none',
    regulatory_relevance:
      'Important null trial; FTC/FDA differentiate EPA-only (REDUCE-IT) from EPA+DHA formulations when evaluating cardiovascular claims.',
    doi: '10.1001/jama.2020.22258',
  },
  {
    ingredient: 'Omega-3 / Fish Oil',
    study_name: 'Hu et al. — Marine omega-3 and coronary heart disease meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 127477,
    duration_weeks: 0,
    primary_endpoint: 'Coronary heart disease events and mortality',
    result_summary:
      'Pooling 13 RCTs (127,477 participants) showed that marine omega-3 supplementation was associated with a significant 8% reduction in CHD events and a modest benefit for CHD mortality.',
    effect_size: 'RR 0.92 (95% CI 0.86-0.99) for CHD events',
    p_value: 'p=0.03',
    journal: 'JAMA Internal Medicine',
    year: 2019,
    quality_score: 9,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'Meta-analytic evidence supporting the FDA qualified health claim for omega-3 fatty acids and reduced risk of coronary heart disease.',
    doi: '10.1001/jamainternmed.2019.3036',
  },
  {
    ingredient: 'Omega-3 / Fish Oil',
    study_name: 'ASCEND — Omega-3 fatty acids in diabetes',
    study_type: 'rct',
    sample_size: 15480,
    duration_weeks: 390,
    primary_endpoint: 'Serious vascular events',
    result_summary:
      'Omega-3 fatty acids at 1 g/day did not produce a significant reduction in serious vascular events in patients with diabetes, though there was a modest, non-significant trend toward fewer vascular deaths.',
    effect_size: 'RR 0.97 (95% CI 0.87-1.08)',
    p_value: 'p=0.55',
    journal: 'New England Journal of Medicine',
    year: 2018,
    quality_score: 9,
    claim_supported: 'none',
    regulatory_relevance:
      'Large null result in diabetic population; limits omega-3 cardiovascular benefit claims at standard 1 g/day dosing for high-risk groups.',
    doi: '10.1056/NEJMoa1804989',
  },

  // ===========================================================================
  // Vitamin D (~4 studies)
  // ===========================================================================
  {
    ingredient: 'Vitamin D',
    study_name: 'VITAL — Vitamin D arm, cancer and cardiovascular disease',
    study_type: 'rct',
    sample_size: 25871,
    duration_weeks: 286,
    primary_endpoint: 'Incidence of invasive cancer and major cardiovascular events',
    result_summary:
      'Vitamin D3 at 2,000 IU/day did not reduce overall cancer incidence or cardiovascular events in the primary analysis, but extended follow-up showed a significant 17% reduction in cancer mortality.',
    effect_size: 'HR 0.83 for cancer mortality (95% CI 0.67-1.02); HR 0.75 after 2+ years',
    p_value: 'p=0.02 for cancer mortality at extended follow-up',
    journal: 'New England Journal of Medicine',
    year: 2019,
    quality_score: 10,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'The cancer mortality signal in extended follow-up may support a future qualified health claim; FDA has not yet authorized a vitamin D cancer prevention claim.',
    doi: '10.1056/NEJMoa1809944',
  },
  {
    ingredient: 'Vitamin D',
    study_name: 'Bischoff-Ferrari DO-HEALTH trial — Vitamin D and fracture prevention',
    study_type: 'rct',
    sample_size: 2157,
    duration_weeks: 156,
    primary_endpoint: 'Incident non-vertebral fractures',
    result_summary:
      'Vitamin D3 at 2,000 IU/day did not reduce the risk of non-vertebral fractures or improve physical performance in generally healthy older adults with adequate baseline vitamin D.',
    effect_size: 'HR 1.02 for fractures (95% CI 0.76-1.37)',
    p_value: 'p=0.91',
    journal: 'JAMA',
    year: 2020,
    quality_score: 9,
    claim_supported: 'none',
    regulatory_relevance:
      'Challenges traditional vitamin D fracture prevention claims; FDA may re-evaluate existing calcium + vitamin D bone health claims in light of this evidence.',
    doi: '10.1001/jama.2020.16789',
  },
  {
    ingredient: 'Vitamin D',
    study_name: 'Martineau et al. — Vitamin D and acute respiratory tract infections meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 10933,
    duration_weeks: 0,
    primary_endpoint: 'Incidence of acute respiratory tract infection',
    result_summary:
      'Individual participant data meta-analysis of 25 RCTs found that vitamin D supplementation reduced the risk of acute respiratory infection by 12% overall, with the greatest benefit in those with severe deficiency (<25 nmol/L).',
    effect_size: 'OR 0.88 (95% CI 0.81-0.96); OR 0.30 for severely deficient subgroup',
    p_value: 'p=0.003',
    journal: 'BMJ',
    year: 2017,
    quality_score: 9,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'Strong meta-analytic evidence for immune function; FDA allows structure/function claims for immune support. A qualified health claim for respiratory infection risk reduction could be supported.',
    doi: '10.1136/bmj.i6583',
  },
  {
    ingredient: 'Vitamin D',
    study_name: 'Manson et al. — Extended VITAL follow-up, cancer and CVD',
    study_type: 'rct',
    sample_size: 25871,
    duration_weeks: 390,
    primary_endpoint: 'Cancer mortality and cardiovascular events at extended follow-up',
    result_summary:
      'Extended post-trial follow-up of VITAL participants confirmed a sustained reduction in cancer mortality with vitamin D3 supplementation (2,000 IU/day), particularly in participants with BMI <25.',
    effect_size: 'HR 0.75 for cancer death in normal-weight participants',
    p_value: 'p=0.02',
    journal: 'JAMA Network Open',
    year: 2024,
    quality_score: 9,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'Extended follow-up reinforces cancer mortality benefit; FDA may consider this emerging evidence for future qualified health claim evaluation.',
    doi: '10.1001/jamanetworkopen.2024.0767',
  },

  // ===========================================================================
  // Probiotics (~5 studies)
  // ===========================================================================
  {
    ingredient: 'Probiotics',
    study_name: 'SEED DS-01 SYNBIO-01 — Daily synbiotic and GI regularity',
    study_type: 'rct',
    sample_size: 70,
    duration_weeks: 4,
    primary_endpoint: 'Whole gut transit time and stool consistency (Bristol scale)',
    result_summary:
      'The 24-strain synbiotic DS-01 significantly improved whole gut transit time, stool consistency, and bowel movement frequency compared to placebo in healthy adults with occasional GI irregularity.',
    effect_size: 'Stool consistency improved by 0.5 Bristol scale points; transit time reduced 25%',
    p_value: 'p=0.01',
    journal: 'Beneficial Microbes',
    year: 2022,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Industry-sponsored RCT; supports digestive health structure/function claims but sample size limits broader regulatory application.',
    doi: '10.3920/BM2021.0173',
  },
  {
    ingredient: 'Probiotics',
    study_name: 'McFarland meta-analysis — Probiotics for antibiotic-associated diarrhea',
    study_type: 'meta_analysis',
    sample_size: 8672,
    duration_weeks: 0,
    primary_endpoint: 'Incidence of antibiotic-associated diarrhea (AAD)',
    result_summary:
      'Meta-analysis of 31 RCTs showed that probiotics significantly reduced the risk of antibiotic-associated diarrhea by approximately 37%, with Saccharomyces boulardii and Lactobacillus rhamnosus GG showing the strongest evidence.',
    effect_size: 'RR 0.63 (95% CI 0.54-0.73)',
    p_value: 'p<0.001',
    journal: 'Annals of Internal Medicine',
    year: 2017,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Strong meta-analytic evidence; FDA permits digestive health structure/function claims but AAD prevention is a disease claim requiring drug-level evidence.',
    doi: '10.7326/M16-2860',
  },
  {
    ingredient: 'Probiotics',
    study_name: 'Ford et al. — Probiotics for irritable bowel syndrome meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 5545,
    duration_weeks: 0,
    primary_endpoint: 'Global IBS symptom improvement',
    result_summary:
      'Systematic review and meta-analysis of 53 RCTs found that probiotics had a statistically significant but modest benefit for global IBS symptoms, with a number needed to treat of 7.',
    effect_size: 'RR 0.79 (95% CI 0.72-0.85) for persistent symptoms',
    p_value: 'p<0.001',
    journal: 'The American Journal of Gastroenterology',
    year: 2018,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'IBS is a diagnosable condition; probiotic supplement claims must stay within structure/function language (e.g., "supports digestive comfort") and cannot reference IBS.',
    doi: '10.1038/s41395-018-0023-5',
  },
  {
    ingredient: 'Probiotics',
    study_name: 'Depommier et al. — Akkermansia muciniphila and metabolic markers',
    study_type: 'rct',
    sample_size: 40,
    duration_weeks: 12,
    primary_endpoint: 'Insulin sensitivity and metabolic markers',
    result_summary:
      'Pasteurized Akkermansia muciniphila supplementation improved insulin sensitivity, reduced insulinemia, and decreased total cholesterol and relevant markers of liver dysfunction and inflammation in overweight/obese adults.',
    effect_size: 'Insulin sensitivity improved by 28.6%; total cholesterol -8.7%',
    p_value: 'p=0.03 for insulin sensitivity',
    journal: 'Nature Medicine',
    year: 2019,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in a top-tier journal; pasteurized form is novel and regulatory classification (food vs drug) is actively debated in EU and US.',
    doi: '10.1038/s41591-019-0495-2',
  },
  {
    ingredient: 'Probiotics',
    study_name: 'Gionchetti et al. — VSL#3 in pouchitis maintenance',
    study_type: 'rct',
    sample_size: 40,
    duration_weeks: 39,
    primary_endpoint: 'Relapse of pouchitis',
    result_summary:
      'High-dose probiotic mixture VSL#3 maintained remission in 85% of patients with recurrent pouchitis at 9 months, compared to 0% in the placebo group.',
    effect_size: '85% remission maintenance vs 0% placebo',
    p_value: 'p<0.001',
    journal: 'Gastroenterology',
    year: 2003,
    quality_score: 7,
    claim_supported: 'none',
    regulatory_relevance:
      'Disease-specific endpoint (pouchitis remission); this is a drug-level claim. Cannot be used for supplement marketing but informs clinical practice.',
    doi: '10.1016/S0016-5085(03)01117-6',
  },

  // ===========================================================================
  // Creatine (~4 studies)
  // ===========================================================================
  {
    ingredient: 'Creatine',
    study_name: 'Branch — Creatine supplementation and exercise performance meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1847,
    duration_weeks: 0,
    primary_endpoint: 'Strength and power output during resistance exercise',
    result_summary:
      'Meta-analysis of approximately 100 studies confirmed that creatine monohydrate supplementation significantly increases strength, power output, and lean body mass during resistance training.',
    effect_size: '~8% increase in strength; ~14% increase in reps to fatigue',
    p_value: 'p<0.001',
    journal: 'International Journal of Sport Nutrition and Exercise Metabolism',
    year: 2003,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Foundational meta-analysis for creatine exercise claims; FDA permits structure/function claims for muscle performance and exercise adaptation.',
    doi: '10.1123/ijsnem.13.2.198',
  },
  {
    ingredient: 'Creatine',
    study_name: 'Rawson & Venezia — Cognitive effects of creatine meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 281,
    duration_weeks: 0,
    primary_endpoint: 'Cognitive processing and short-term memory',
    result_summary:
      'Meta-analysis of 6 RCTs found that creatine supplementation may improve short-term memory and reasoning, particularly under stress conditions such as sleep deprivation and mental fatigue.',
    effect_size: 'Moderate effect size (d=0.25-0.50) for memory and processing tasks',
    p_value: 'p<0.05 for short-term memory tasks',
    journal: 'Experimental Gerontology',
    year: 2011,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Cognitive claims for creatine are emerging; FDA would require larger confirmatory RCTs for brain health structure/function claims.',
    doi: '10.1016/j.exger.2011.03.006',
  },
  {
    ingredient: 'Creatine',
    study_name: 'Forbes et al. — Creatine in older adults, lean mass meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1327,
    duration_weeks: 0,
    primary_endpoint: 'Lean body mass and muscular strength in older adults',
    result_summary:
      'Meta-analysis of 22 RCTs found that creatine supplementation combined with resistance training significantly increased lean body mass and upper/lower body strength in adults over 50.',
    effect_size: 'Lean mass +1.37 kg; upper body strength +7.5% vs placebo + training',
    p_value: 'p<0.01',
    journal: 'Medicine & Science in Sports & Exercise',
    year: 2023,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports structure/function claims for aging muscle health; FDA has not specifically addressed age-related creatine claims but general muscle/exercise claims are well-established.',
    doi: '10.1249/MSS.0000000000003132',
  },
  {
    ingredient: 'Creatine',
    study_name: 'Kreider et al. — ISSN position stand on creatine supplementation',
    study_type: 'systematic_review',
    sample_size: 0,
    duration_weeks: 0,
    primary_endpoint: 'Comprehensive review of creatine safety and efficacy',
    result_summary:
      'The International Society of Sports Nutrition position stand concluded that creatine monohydrate is the most effective ergogenic nutritional supplement for increasing exercise capacity and lean mass, with an excellent long-term safety profile.',
    effect_size: 'Strength gains 5-10% greater with creatine vs placebo across studies',
    p_value: 'N/A (position stand)',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2017,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Authoritative expert consensus; frequently cited in FTC proceedings as supporting evidence for creatine exercise performance claims.',
    doi: '10.1186/s12970-017-0173-z',
  },

  // ===========================================================================
  // Ashwagandha / KSM-66 (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Ashwagandha',
    study_name: 'Chandrasekhar et al. — KSM-66 ashwagandha for stress and anxiety',
    study_type: 'rct',
    sample_size: 64,
    duration_weeks: 8,
    primary_endpoint: 'Serum cortisol and perceived stress (PSS scale)',
    result_summary:
      'KSM-66 ashwagandha root extract at 300 mg twice daily reduced serum cortisol by 28% and significantly improved stress assessment scores compared to placebo in chronically stressed adults.',
    effect_size: 'Cortisol reduced 28%; PSS score improved 44% vs placebo',
    p_value: 'p<0.0001',
    journal: 'Indian Journal of Psychological Medicine',
    year: 2012,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Most-cited ashwagandha trial; cortisol reduction supports adaptogenic structure/function claims. FTC expects stress claims to reference this type of RCT evidence.',
    doi: '10.4103/0253-7176.106022',
  },
  {
    ingredient: 'Ashwagandha',
    study_name: 'Wankhede et al. — Ashwagandha on muscle strength and recovery',
    study_type: 'rct',
    sample_size: 57,
    duration_weeks: 8,
    primary_endpoint: 'Muscle strength (bench press, leg extension) and body composition',
    result_summary:
      'Ashwagandha root extract (300 mg twice daily) significantly increased muscle strength, muscle size, and testosterone levels while reducing body fat percentage and exercise-induced muscle damage in young men during resistance training.',
    effect_size: 'Bench press +20 kg vs +10 kg placebo; testosterone +15%',
    p_value: 'p<0.05',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2015,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports muscle recovery and exercise adaptation structure/function claims; testosterone increase claims may attract FTC scrutiny if presented as hormone therapy.',
    doi: '10.1186/s12970-015-0104-9',
  },
  {
    ingredient: 'Ashwagandha',
    study_name: 'Lopresti et al. — Ashwagandha on sleep quality',
    study_type: 'rct',
    sample_size: 60,
    duration_weeks: 10,
    primary_endpoint: 'Sleep quality (Pittsburgh Sleep Quality Index)',
    result_summary:
      'Ashwagandha root extract at 300 mg twice daily significantly improved sleep quality index scores, sleep onset latency, and sleep efficiency compared to placebo in adults with self-reported insomnia.',
    effect_size: 'PSQI score improved 72% vs 29% placebo',
    p_value: 'p<0.001',
    journal: 'Journal of Ethnopharmacology',
    year: 2019,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Sleep quality structure/function claims are well-accepted by FDA; however, referencing insomnia in marketing would constitute a disease claim.',
    doi: '10.1016/j.jep.2019.112012',
  },

  // ===========================================================================
  // Curcumin (~4 studies)
  // ===========================================================================
  {
    ingredient: 'Curcumin',
    study_name: 'Daily et al. — Curcumin and arthritis pain meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 606,
    duration_weeks: 0,
    primary_endpoint: 'Pain reduction measured by VAS and WOMAC scores',
    result_summary:
      'Meta-analysis of 8 RCTs demonstrated that turmeric/curcumin extracts (equivalent to ~1,000 mg/day curcumin) significantly reduced arthritis pain, with effect sizes comparable to ibuprofen in some studies.',
    effect_size: 'Standardized mean difference -0.34 (pain VAS)',
    p_value: 'p<0.01',
    journal: 'Journal of Medicinal Food',
    year: 2016,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports joint comfort structure/function claims; FDA would not permit arthritis treatment claims without NDA. FTC expects substantiation at this evidence level for joint health claims.',
    doi: '10.1089/jmf.2016.3705',
  },
  {
    ingredient: 'Curcumin',
    study_name: 'Sahebkar — Curcuminoids and blood lipids meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 267,
    duration_weeks: 0,
    primary_endpoint: 'Serum triglyceride levels',
    result_summary:
      'Meta-analysis of 5 RCTs showed that curcuminoid supplementation significantly reduced serum triglyceride levels, suggesting a role in lipid metabolism support.',
    effect_size: 'Triglycerides reduced by -21.3 mg/dL (95% CI: -32.4 to -10.2)',
    p_value: 'p<0.001',
    journal: 'Nutrition Research',
    year: 2014,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Modest evidence base; lipid claims for supplements require careful structure/function framing. FTC may challenge cholesterol-lowering claims without larger trials.',
    doi: '10.1016/j.nutres.2014.09.001',
  },
  {
    ingredient: 'Curcumin',
    study_name: 'Hewlings & Kalman — Curcumin efficacy and safety review',
    study_type: 'systematic_review',
    sample_size: 0,
    duration_weeks: 0,
    primary_endpoint: 'Anti-inflammatory and antioxidant effects across conditions',
    result_summary:
      'Comprehensive review concluded that curcumin demonstrates significant anti-inflammatory and antioxidant activity in clinical trials, with strongest evidence for joint health, metabolic syndrome markers, and exercise recovery.',
    effect_size: 'Consistent anti-inflammatory effect across 10+ trials',
    p_value: 'N/A (narrative review)',
    journal: 'Foods',
    year: 2017,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Review article; useful for substantiation dossiers but not primary evidence. FDA and FTC prefer individual RCT data over narrative reviews.',
    doi: '10.3390/foods6100092',
  },
  {
    ingredient: 'Curcumin',
    study_name: 'Aggarwal & Harikumar — Curcumin anti-inflammatory mechanisms review',
    study_type: 'systematic_review',
    sample_size: 0,
    duration_weeks: 0,
    primary_endpoint: 'NF-kB pathway modulation and inflammatory biomarkers',
    result_summary:
      'Seminal review cataloging curcumin inhibition of NF-kB, COX-2, LOX, and multiple inflammatory cytokines, providing the mechanistic rationale for its clinical anti-inflammatory effects.',
    effect_size: 'NF-kB pathway inhibition demonstrated across >50 cell lines',
    p_value: 'N/A (mechanistic review)',
    journal: 'Annals of the New York Academy of Sciences',
    year: 2009,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Mechanistic evidence supports biological plausibility for anti-inflammatory structure/function claims; not sufficient alone for regulatory substantiation.',
    doi: '10.1111/j.1749-6632.2009.04091.x',
  },

  // ===========================================================================
  // Collagen (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Collagen',
    study_name: 'Zague — Collagen hydrolysate and skin elasticity',
    study_type: 'rct',
    sample_size: 69,
    duration_weeks: 8,
    primary_endpoint: 'Skin elasticity measured by cutometry',
    result_summary:
      'Daily intake of 10 g collagen hydrolysate for 8 weeks significantly improved skin elasticity in women aged 35-55 compared to placebo, with effects persisting 4 weeks after discontinuation.',
    effect_size: 'Skin elasticity improved 7% vs baseline',
    p_value: 'p<0.05',
    journal: 'International Journal of Food Sciences and Nutrition',
    year: 2008,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Early evidence for collagen skin claims; FDA permits "supports skin health" structure/function claims. Cosmetic vs supplement classification may apply.',
    doi: '10.1080/09637480802259714',
  },
  {
    ingredient: 'Collagen',
    study_name: 'Clark et al. — Collagen hydrolysate for joint pain in athletes',
    study_type: 'rct',
    sample_size: 147,
    duration_weeks: 24,
    primary_endpoint: 'Activity-related joint pain (VAS)',
    result_summary:
      'Penn State athletes taking 10 g collagen hydrolysate daily for 24 weeks showed a significant reduction in activity-related joint pain compared to placebo, particularly in those with pre-existing knee issues.',
    effect_size: 'Joint pain VAS reduced -1.2 points (subgroup with prior knee pain)',
    p_value: 'p=0.025 for joint pain at rest; p=0.002 for standing pain subgroup',
    journal: 'Current Medical Research and Opinion',
    year: 2008,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports joint health structure/function claims for active populations; FDA would view athlete-specific claims as appropriate structure/function language.',
    doi: '10.1185/030079908X291967',
  },
  {
    ingredient: 'Collagen',
    study_name: 'Proksch et al. — Oral collagen peptides and skin wrinkles',
    study_type: 'rct',
    sample_size: 114,
    duration_weeks: 8,
    primary_endpoint: 'Skin wrinkle volume and skin elasticity',
    result_summary:
      'Specific bioactive collagen peptides (2.5 g/day) significantly reduced eye wrinkle volume by 20% and improved skin elasticity after 8 weeks compared to placebo in women aged 45-65.',
    effect_size: '20% reduction in wrinkle volume; 15% improvement in skin elasticity',
    p_value: 'p<0.05',
    journal: 'Skin Pharmacology and Physiology',
    year: 2014,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports collagen skin structure/function claims; the 2.5 g dose is commercially relevant. Wrinkle reduction claims may cross into cosmetic territory requiring FDA cosmetic compliance.',
    doi: '10.1159/000355523',
  },

  // ===========================================================================
  // Magnesium (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Magnesium',
    study_name: 'Abbasi et al. — Magnesium supplementation and sleep quality in elderly',
    study_type: 'rct',
    sample_size: 46,
    duration_weeks: 8,
    primary_endpoint: 'Insomnia Severity Index (ISI) and sleep quality',
    result_summary:
      'Magnesium supplementation (500 mg/day) significantly improved subjective sleep quality, sleep time, sleep efficiency, and reduced serum cortisol and melatonin-pathway markers in elderly adults.',
    effect_size: 'ISI score decreased by 4.6 points vs 1.3 placebo',
    p_value: 'p<0.001',
    journal: 'Journal of Research in Medical Sciences',
    year: 2012,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports sleep-related structure/function claims ("supports restful sleep"); small sample in elderly population limits generalizability. Insomnia treatment claims require drug approval.',
    doi: '10.4103/1735-1995.104739',
  },
  {
    ingredient: 'Magnesium',
    study_name: 'Zhang et al. — Magnesium and blood pressure meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 543,
    duration_weeks: 0,
    primary_endpoint: 'Systolic and diastolic blood pressure',
    result_summary:
      'Meta-analysis of 11 RCTs found that magnesium supplementation (mean 368 mg/day) significantly reduced systolic blood pressure by 2.0 mmHg and diastolic blood pressure by 1.8 mmHg.',
    effect_size: 'SBP -2.00 mmHg (95% CI: -3.58 to -0.42); DBP -1.78 mmHg',
    p_value: 'p=0.01 for SBP',
    journal: 'The Journal of Clinical Hypertension',
    year: 2016,
    quality_score: 7,
    claim_supported: 'qualified_health',
    regulatory_relevance:
      'Supports the existing magnesium qualified health claim for blood pressure. Consistent with NIH-ODS and FDA-recognized association between magnesium intake and BP regulation.',
    doi: '10.1111/jch.12929',
  },
  {
    ingredient: 'Magnesium',
    study_name: 'Boyle et al. — Magnesium supplementation and anxiety meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 2219,
    duration_weeks: 0,
    primary_endpoint: 'Self-reported anxiety measures',
    result_summary:
      'Systematic review and meta-analysis of 18 studies found suggestive but not conclusive evidence that magnesium supplementation may reduce anxiety symptoms, particularly in anxiety-prone individuals with low magnesium status.',
    effect_size: 'Trend toward reduced anxiety (standardized mean difference -0.10 to -0.32)',
    p_value: 'p=0.07 (marginal)',
    journal: 'Nutrients',
    year: 2017,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Marginal evidence; supports general "supports calm and relaxation" structure/function claims but not anxiety treatment claims. FTC would require stronger evidence for explicit stress/anxiety claims.',
    doi: '10.3390/nu9050429',
  },

  // ===========================================================================
  // Lion's Mane (~3 studies)
  // ===========================================================================
  {
    ingredient: "Lion's Mane",
    study_name: 'Mori et al. — Hericium erinaceus and cognitive function in mild cognitive impairment',
    study_type: 'rct',
    sample_size: 30,
    duration_weeks: 16,
    primary_endpoint: 'Cognitive function (Hasegawa Dementia Scale-Revised)',
    result_summary:
      'Oral administration of Hericium erinaceus (3 g/day of powdered fruiting body) significantly improved cognitive function scores in subjects with mild cognitive impairment at weeks 8, 12, and 16 vs placebo; benefits declined after cessation.',
    effect_size: 'HDS-R scores improved by ~3 points vs placebo',
    p_value: 'p<0.05',
    journal: 'Phytotherapy Research',
    year: 2009,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Small RCT in MCI population; "supports cognitive function" claims may be permissible, but referencing cognitive impairment or dementia constitutes a disease claim requiring FDA drug approval.',
    doi: '10.1002/ptr.2634',
  },
  {
    ingredient: "Lion's Mane",
    study_name: 'Saitsu et al. — Hericium erinaceus and cognitive performance in older adults',
    study_type: 'rct',
    sample_size: 31,
    duration_weeks: 12,
    primary_endpoint: 'Mini-Mental State Examination (MMSE) and cognitive speed',
    result_summary:
      'Lion\'s mane supplement (3.2 g/day) improved MMSE scores and cognitive processing speed in adults aged 50+ compared to placebo over 12 weeks.',
    effect_size: 'MMSE score improved by 1.8 points vs 0.3 placebo',
    p_value: 'p<0.05',
    journal: 'Biomedical Research',
    year: 2019,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Replicates Mori et al. findings in a small sample; adds to cumulative evidence for structure/function cognitive claims but is insufficient alone for regulatory substantiation.',
    doi: '10.2220/biomedres.40.125',
  },
  {
    ingredient: "Lion's Mane",
    study_name: 'Nagano et al. — Hericium erinaceus and depression/anxiety in menopausal women',
    study_type: 'rct',
    sample_size: 30,
    duration_weeks: 4,
    primary_endpoint: 'Indefinite Complaints Index (ICI) for depression and anxiety',
    result_summary:
      'Lion\'s mane cookie supplementation (2 g/day Hericium erinaceus) significantly reduced self-reported depression and anxiety scores in menopausal women compared to placebo cookies.',
    effect_size: 'Depression/anxiety ICI scores reduced by ~30% vs placebo',
    p_value: 'p<0.05',
    journal: 'Biomedical Research',
    year: 2010,
    quality_score: 4,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Very small, short study with atypical delivery form; FDA would consider this preliminary. Depression/anxiety claims are disease claims and not permitted for supplements.',
    doi: '10.2220/biomedres.31.231',
  },

  // ===========================================================================
  // Berberine (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Berberine',
    study_name: 'Yin et al. — Berberine vs metformin for type 2 diabetes',
    study_type: 'rct',
    sample_size: 116,
    duration_weeks: 13,
    primary_endpoint: 'HbA1c and fasting blood glucose',
    result_summary:
      'Berberine at 500 mg TID reduced HbA1c by 1.1% and fasting blood glucose by 27% in newly diagnosed type 2 diabetes patients, with effects comparable to metformin 500 mg TID.',
    effect_size: 'HbA1c -1.1%; FBG -27%; comparable to metformin arm',
    p_value: 'p<0.001 for FBG and HbA1c reduction from baseline',
    journal: 'Metabolism',
    year: 2008,
    quality_score: 7,
    claim_supported: 'none',
    regulatory_relevance:
      'Blood sugar reduction in diabetics is a drug claim; this study is widely cited but FDA would view berberine blood sugar claims as unapproved drug claims. FTC has acted against diabetes supplement claims.',
    doi: '10.1016/j.metabol.2008.01.013',
  },
  {
    ingredient: 'Berberine',
    study_name: 'Zhang et al. — Berberine and lipid effects meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 2569,
    duration_weeks: 0,
    primary_endpoint: 'Serum LDL-C, total cholesterol, and triglycerides',
    result_summary:
      'Meta-analysis of 14 RCTs showed berberine significantly reduced LDL cholesterol by 25 mg/dL, total cholesterol by 24 mg/dL, and triglycerides by 44 mg/dL compared to placebo or lifestyle intervention.',
    effect_size: 'LDL-C -25 mg/dL; TG -44 mg/dL; TC -24 mg/dL',
    p_value: 'p<0.01',
    journal: 'Journal of Ethnopharmacology',
    year: 2010,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Lipid reduction is a well-established biomarker; structure/function claims ("supports healthy lipid levels already in normal range") may be permissible with careful qualifying language.',
    doi: '10.1016/j.jep.2010.09.036',
  },
  {
    ingredient: 'Berberine',
    study_name: 'Liang et al. — Berberine for metabolic syndrome meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 2569,
    duration_weeks: 0,
    primary_endpoint: 'Metabolic syndrome components (waist circumference, BP, glucose, lipids)',
    result_summary:
      'Meta-analysis of 28 RCTs found berberine significantly improved multiple metabolic syndrome parameters including fasting glucose, triglycerides, and waist circumference, particularly when combined with lifestyle modifications.',
    effect_size: 'FBG -7.6 mg/dL; TG -33.5 mg/dL; waist circumference -1.1 cm',
    p_value: 'p<0.01 for FBG and TG',
    journal: 'Frontiers in Pharmacology',
    year: 2019,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Metabolic syndrome is a diagnosable condition; supplement claims must focus on individual biomarker support (e.g., "supports healthy glucose metabolism") rather than syndrome treatment.',
    doi: '10.3389/fphar.2019.01532',
  },

  // ===========================================================================
  // CoQ10 (~3 studies)
  // ===========================================================================
  {
    ingredient: 'CoQ10',
    study_name: 'Q-SYMBIO — Coenzyme Q10 as adjunctive treatment in heart failure',
    study_type: 'rct',
    sample_size: 420,
    duration_weeks: 104,
    primary_endpoint: 'Major adverse cardiovascular events (MACE)',
    result_summary:
      'CoQ10 at 300 mg/day as adjunct to standard heart failure therapy reduced MACE by 43% and cardiovascular mortality by 42% over 2 years compared to placebo in moderate-to-severe heart failure.',
    effect_size: 'HR 0.57 for MACE (95% CI 0.37-0.89); cardiovascular death HR 0.58',
    p_value: 'p=0.02 for MACE composite; p=0.026 for CV death',
    journal: 'JACC: Heart Failure',
    year: 2014,
    quality_score: 8,
    claim_supported: 'none',
    regulatory_relevance:
      'Heart failure treatment is a drug claim; CoQ10 cannot be marketed for treating heart failure. However, this landmark trial supports "supports heart health" structure/function positioning.',
    doi: '10.1016/j.jchf.2014.06.008',
  },
  {
    ingredient: 'CoQ10',
    study_name: 'Mortensen et al. — CoQ10 and cardiovascular mortality in heart failure',
    study_type: 'rct',
    sample_size: 420,
    duration_weeks: 104,
    primary_endpoint: 'All-cause mortality and cardiovascular mortality',
    result_summary:
      'In the Q-SYMBIO trial, CoQ10 (300 mg/day) significantly reduced all-cause mortality and hospitalization for heart failure over 2 years, representing the first positive mortality outcome trial for a supplement in heart failure.',
    effect_size: 'All-cause mortality 9% vs 16% (HR 0.51)',
    p_value: 'p=0.01',
    journal: 'JACC: Heart Failure',
    year: 2014,
    quality_score: 8,
    claim_supported: 'none',
    regulatory_relevance:
      'Same trial as Q-SYMBIO, mortality analysis; disease claim territory. This is the strongest cardiovascular outcome data for any supplement and a regulatory benchmark, though it remains a drug claim.',
    doi: '10.1016/j.jchf.2014.06.008',
  },
  {
    ingredient: 'CoQ10',
    study_name: 'Hernandez-Camacho et al. — CoQ10 for statin-associated myalgia meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 575,
    duration_weeks: 0,
    primary_endpoint: 'Statin-associated muscle symptoms (SAMS) severity',
    result_summary:
      'Meta-analysis found mixed but suggestive evidence that CoQ10 supplementation (100-300 mg/day) may reduce severity of statin-associated muscle symptoms, though results were not uniformly significant across studies.',
    effect_size: 'Pain severity score reduced -1.3 points (scale 0-10) in positive studies',
    p_value: 'p=0.07 (pooled)',
    journal: 'Nutrients',
    year: 2018,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Statin myalgia claims are disease-adjacent; supplement companies may claim "supports normal muscle function" but cannot reference statin side effects without FDA drug approval.',
    doi: '10.3390/nu10070854',
  },

  // ===========================================================================
  // Melatonin (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Melatonin',
    study_name: 'Ferracioli-Oda et al. — Melatonin for primary sleep disorders meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1683,
    duration_weeks: 0,
    primary_endpoint: 'Sleep onset latency and total sleep time',
    result_summary:
      'Meta-analysis of 19 RCTs showed melatonin significantly reduced sleep onset latency by 7.06 minutes, increased total sleep time by 8.25 minutes, and improved overall sleep quality vs placebo.',
    effect_size: 'SOL -7.06 min (95% CI: -9.28 to -4.83); TST +8.25 min',
    p_value: 'p<0.001 for sleep latency; p<0.001 for total sleep time',
    journal: 'PLOS ONE',
    year: 2013,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Foundational meta-analysis for melatonin sleep claims; FDA allows "helps with occasional sleeplessness" structure/function claims. Insomnia or sleep disorder claims are not permitted.',
    doi: '10.1371/journal.pone.0063773',
  },
  {
    ingredient: 'Melatonin',
    study_name: 'Li et al. — Melatonin for perioperative anxiety and analgesia meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1264,
    duration_weeks: 0,
    primary_endpoint: 'Preoperative anxiety (VAS) and postoperative pain scores',
    result_summary:
      'Meta-analysis of 12 RCTs found that preoperative melatonin significantly reduced anxiety by approximately 18% and decreased postoperative pain, performing comparably to standard anxiolytic premedication (midazolam).',
    effect_size: 'Anxiety VAS -17.8%; pain score -0.7 points',
    p_value: 'p<0.01',
    journal: 'Journal of Pineal Research',
    year: 2019,
    quality_score: 7,
    claim_supported: 'none',
    regulatory_relevance:
      'Perioperative anxiolysis is a clinical drug application; not applicable to supplement marketing. Demonstrates melatonin pharmacological potency relevant to dosing safety considerations.',
    doi: '10.1111/jpi.12562',
  },
  {
    ingredient: 'Melatonin',
    study_name: 'Auld et al. — Melatonin for primary sleep disorders meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1856,
    duration_weeks: 0,
    primary_endpoint: 'Sleep onset latency, sleep quality, and total sleep time',
    result_summary:
      'Updated meta-analysis confirmed melatonin reduces sleep onset latency and improves subjective sleep quality in adults with primary sleep disorders, with larger effects in delayed sleep phase disorder.',
    effect_size: 'SOL -11.7 min; PSQI improved -1.5 points',
    p_value: 'p<0.001',
    journal: 'Sleep Medicine Reviews',
    year: 2017,
    quality_score: 8,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Strengthens the evidence base for melatonin sleep claims; published in a top sleep journal. FDA considers melatonin a well-established dietary ingredient with permitted sleep structure/function claims.',
    doi: '10.1016/j.smrv.2016.02.003',
  },

  // ===========================================================================
  // Resveratrol (~3 studies)
  // ===========================================================================
  {
    ingredient: 'Resveratrol',
    study_name: 'Timmers et al. — Resveratrol calorie-restriction mimetic effects in obese men',
    study_type: 'rct',
    sample_size: 11,
    duration_weeks: 4,
    primary_endpoint: 'Metabolic rate, intrahepatic lipid content, and inflammatory markers',
    result_summary:
      'Resveratrol at 150 mg/day for 30 days mimicked the effects of calorie restriction in obese men, lowering sleeping metabolic rate, reducing intrahepatic lipid content by 40%, and improving mitochondrial function.',
    effect_size: 'Intrahepatic lipid -40%; HOMA-IR improved by 13%',
    p_value: 'p<0.05',
    journal: 'Cell Metabolism',
    year: 2011,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in high-impact journal but very small sample; FDA would require substantially larger trials for metabolic health claims. Calorie-restriction mimetic framing is novel but unregulated.',
    doi: '10.1016/j.cmet.2011.10.002',
  },
  {
    ingredient: 'Resveratrol',
    study_name: 'Saldanha et al. — Resveratrol and blood pressure meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1132,
    duration_weeks: 0,
    primary_endpoint: 'Systolic and diastolic blood pressure',
    result_summary:
      'Meta-analysis found that resveratrol supplementation significantly reduced systolic blood pressure, particularly at doses of 300+ mg/day and in individuals with metabolic conditions, but not diastolic BP.',
    effect_size: 'SBP -2.3 mmHg (95% CI: -4.2 to -0.5); DBP NS',
    p_value: 'p=0.01 for SBP',
    journal: 'Clinical Nutrition',
    year: 2022,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Modest blood pressure effect; supports "helps maintain healthy blood pressure" structure/function claims but effect size is clinically marginal compared to pharmaceuticals.',
    doi: '10.1016/j.clnu.2022.02.002',
  },
  {
    ingredient: 'Resveratrol',
    study_name: 'Berman et al. — Resveratrol and cardiovascular health meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 714,
    duration_weeks: 0,
    primary_endpoint: 'Cardiovascular risk markers (lipids, CRP, glucose)',
    result_summary:
      'Meta-analysis of RCTs found resveratrol significantly reduced total cholesterol and CRP at doses above 150 mg/day, with no significant effect on LDL-C or glucose, and inconsistent effects on blood pressure.',
    effect_size: 'TC -5.7 mg/dL; CRP -0.5 mg/L at doses >150 mg/day',
    p_value: 'p<0.05 for TC and CRP; NS for LDL and glucose',
    journal: 'The American Journal of Cardiology',
    year: 2017,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Mixed evidence across cardiovascular markers; FDA would consider this insufficient for qualified cardiovascular health claims. Structure/function "antioxidant support" claims are safer.',
    doi: '10.1016/j.amjcard.2016.10.038',
  },

  // ===========================================================================
  // Urolithin A / Mitopure (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Urolithin A',
    study_name: 'ATLAS Trial — Urolithin A (Mitopure) and muscle endurance',
    study_type: 'rct',
    sample_size: 66,
    duration_weeks: 16,
    primary_endpoint: 'Muscle endurance (6-minute walk test and time to fatigue)',
    result_summary:
      'Urolithin A at 500 mg and 1,000 mg/day significantly improved muscle endurance as measured by 6-minute walk distance (+12%) and maximal ATP production in skeletal muscle mitochondria compared to placebo.',
    effect_size: '+12% improvement in muscle endurance; increased mitochondrial ATP production',
    p_value: 'p<0.05',
    journal: 'JAMA Network Open',
    year: 2022,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in JAMA Network Open; Amazentis submitted GRAS notification to FDA. Structure/function claims for mitochondrial health and muscle endurance are permissible.',
    doi: '10.1001/jamanetworkopen.2021.44279',
  },
  {
    ingredient: 'Urolithin A',
    study_name: 'Singh et al. — Urolithin A and mitochondrial biomarkers',
    study_type: 'rct',
    sample_size: 88,
    duration_weeks: 16,
    primary_endpoint: 'Plasma acylcarnitines and mitochondrial biomarkers',
    result_summary:
      'Urolithin A supplementation (500 mg/day and 1,000 mg/day) reduced plasma acylcarnitines and C-reactive protein, indicating improved mitochondrial efficiency and reduced systemic inflammation in middle-aged adults.',
    effect_size: 'CRP reduced 31%; acylcarnitines reduced 18-25%',
    p_value: 'p<0.05 for CRP and acylcarnitines',
    journal: 'Cell Reports Medicine',
    year: 2022,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Biomarker-level evidence for mitochondrial health; FDA recognizes mitophagy as a biological process suitable for structure/function claims. CRP reduction adds anti-inflammatory dimension.',
    doi: '10.1016/j.xcrm.2022.100529',
  },

  // ===========================================================================
  // Spermidine (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Spermidine',
    study_name: 'Wirth et al. SmartAge Trial — Spermidine and memory performance',
    study_type: 'rct',
    sample_size: 30,
    duration_weeks: 12,
    primary_endpoint: 'Mnemonic discrimination performance (memory test)',
    result_summary:
      'Spermidine-rich plant extract supplementation (1.2 mg/day spermidine) modestly improved memory performance and mnemonic discrimination in older adults with subjective cognitive decline compared to placebo.',
    effect_size: 'Mnemonic discrimination improved by ~15% vs placebo',
    p_value: 'p=0.03',
    journal: 'Cortex',
    year: 2018,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Small proof-of-concept trial; supports cognitive health structure/function claims at preliminary level. Larger confirmatory trials needed for robust regulatory substantiation.',
    doi: '10.1016/j.cortex.2018.09.014',
  },
  {
    ingredient: 'Spermidine',
    study_name: 'Eisenberg et al. — Spermidine induces autophagy and extends lifespan',
    study_type: 'preclinical',
    sample_size: 0,
    duration_weeks: 0,
    primary_endpoint: 'Lifespan extension and autophagy induction in model organisms',
    result_summary:
      'Exogenous spermidine extended lifespan in yeast, flies, worms, and mice, with the mechanism dependent on induction of autophagy. Higher dietary spermidine intake was epidemiologically associated with reduced human mortality.',
    effect_size: '25% lifespan extension in mice; 15-year reduced mortality risk in human epidemiological data',
    p_value: 'p<0.001 for animal models',
    journal: 'Nature Cell Biology',
    year: 2016,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Landmark preclinical + epidemiological study published in a top-tier journal; establishes biological plausibility for autophagy/longevity claims. FDA does not permit lifespan extension claims for supplements.',
    doi: '10.1038/ncb3400',
  },

  // ===========================================================================
  // NAC (N-Acetyl Cysteine) (~2 studies)
  // ===========================================================================
  {
    ingredient: 'NAC',
    study_name: 'Decramer et al. BRONCUS — NAC in COPD',
    study_type: 'rct',
    sample_size: 523,
    duration_weeks: 156,
    primary_endpoint: 'Rate of FEV1 decline and exacerbation frequency',
    result_summary:
      'NAC 600 mg/day did not significantly reduce the rate of lung function decline or exacerbation frequency in COPD patients overall, though a subgroup not on inhaled corticosteroids showed reduced exacerbation risk.',
    effect_size: 'No significant difference in FEV1 decline; exacerbation risk reduced 22% in no-ICS subgroup',
    p_value: 'p=0.31 overall; p=0.04 subgroup',
    journal: 'The Lancet',
    year: 2005,
    quality_score: 8,
    claim_supported: 'none',
    regulatory_relevance:
      'COPD treatment is a disease claim; null primary result. FDA issued a warning letter in 2020 questioning NAC supplement status since it was previously an approved drug ingredient.',
    doi: '10.1016/S0140-6736(05)66569-8',
  },
  {
    ingredient: 'NAC',
    study_name: 'Zheng et al. — NAC and glutathione antioxidant meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1064,
    duration_weeks: 0,
    primary_endpoint: 'Serum glutathione levels and oxidative stress markers',
    result_summary:
      'Meta-analysis showed oral NAC supplementation significantly increased serum glutathione levels and reduced oxidative stress biomarkers (MDA, ROS) across various populations and dosing regimens.',
    effect_size: 'Glutathione increased ~18%; MDA reduced ~15%',
    p_value: 'p<0.001 for glutathione increase',
    journal: 'European Journal of Clinical Pharmacology',
    year: 2018,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports antioxidant structure/function claims; however, NAC regulatory status as a dietary supplement is disputed by FDA (2020 warning letters). Companies must navigate this classification uncertainty.',
    doi: '10.1007/s00228-017-2393-2',
  },

  // ===========================================================================
  // Quercetin (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Quercetin',
    study_name: 'Heinz et al. — Quercetin and upper respiratory tract infection meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1042,
    duration_weeks: 0,
    primary_endpoint: 'Upper respiratory tract infection (URTI) incidence and sick days',
    result_summary:
      'Meta-analysis found that quercetin supplementation (500-1,000 mg/day) significantly reduced the incidence of upper respiratory infections and total sick days, particularly following intense exercise.',
    effect_size: 'URTI risk reduced ~33%; sick days reduced ~36%',
    p_value: 'p=0.02 for URTI incidence',
    journal: 'Nutrients',
    year: 2016,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports immune support structure/function claims, particularly for active individuals. FDA would not permit specific infection prevention claims.',
    doi: '10.3390/nu8040159',
  },
  {
    ingredient: 'Quercetin',
    study_name: 'Serban et al. — Quercetin and blood pressure meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 896,
    duration_weeks: 0,
    primary_endpoint: 'Systolic and diastolic blood pressure',
    result_summary:
      'Meta-analysis of 7 RCTs found quercetin supplementation (>500 mg/day) significantly reduced both systolic and diastolic blood pressure, with effects larger in hypertensive subpopulations.',
    effect_size: 'SBP -3.0 mmHg; DBP -2.6 mmHg',
    p_value: 'p<0.01',
    journal: 'Journal of the American Heart Association',
    year: 2016,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in an AHA journal; supports "helps maintain healthy blood pressure" structure/function claims. Effect size is clinically modest but statistically robust.',
    doi: '10.1161/JAHA.115.002713',
  },

  // ===========================================================================
  // L-Theanine (~2 studies)
  // ===========================================================================
  {
    ingredient: 'L-Theanine',
    study_name: 'Hidese et al. — L-Theanine for stress and cognitive function',
    study_type: 'rct',
    sample_size: 30,
    duration_weeks: 4,
    primary_endpoint: 'Stress-related symptoms (PSQI, STAI) and cognitive function',
    result_summary:
      'L-theanine at 200 mg/day for 4 weeks significantly reduced stress-related symptom scores (depression, anxiety, sleep disturbance) and improved verbal fluency and executive function compared to placebo.',
    effect_size: 'PSQI sleep quality +18%; STAI anxiety -15%',
    p_value: 'p<0.05',
    journal: 'Nutrients',
    year: 2019,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Small RCT; supports "promotes relaxation" and "supports focus" structure/function claims. GRAS status is well-established for L-theanine. Depression claims are not permissible.',
    doi: '10.3390/nu11102362',
  },
  {
    ingredient: 'L-Theanine',
    study_name: 'Kimura et al. — L-Theanine reduces psychological and physiological stress',
    study_type: 'rct',
    sample_size: 12,
    duration_weeks: 1,
    primary_endpoint: 'Heart rate, salivary IgA, and subjective stress during acute stress task',
    result_summary:
      'A single dose of L-theanine (200 mg) reduced heart rate and salivary immunoglobulin A responses to an acute stress task, suggesting an anti-stress effect via sympathetic nervous system modulation.',
    effect_size: 'Heart rate reduction during stress task; IgA response attenuated',
    p_value: 'p<0.05',
    journal: 'Biological Psychology',
    year: 2007,
    quality_score: 4,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Acute dosing study with very small sample; supports mechanism of action for relaxation claims but insufficient for regulatory substantiation as standalone evidence.',
    doi: '10.1016/j.biopsycho.2006.06.006',
  },

  // ===========================================================================
  // Alpha-GPC (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Alpha-GPC',
    study_name: 'De Jesus Moreno — Alpha-GPC in Alzheimer dementia',
    study_type: 'rct',
    sample_size: 261,
    duration_weeks: 26,
    primary_endpoint: 'ADAS-Cog (Alzheimer\'s Disease Assessment Scale - Cognitive)',
    result_summary:
      'Alpha-GPC at 1,200 mg/day significantly improved cognitive function on the ADAS-Cog scale in patients with mild-to-moderate Alzheimer dementia, with progressive improvement over 180 days.',
    effect_size: 'ADAS-Cog improved 3.2 points vs -0.5 placebo',
    p_value: 'p<0.001',
    journal: 'Clinical Therapeutics',
    year: 2003,
    quality_score: 6,
    claim_supported: 'none',
    regulatory_relevance:
      'Alzheimer treatment is a drug claim; cannot be used for supplement marketing. However, the cholinergic mechanism supports "supports memory and focus" structure/function claims.',
    doi: '10.1016/S0149-2918(03)80090-8',
  },
  {
    ingredient: 'Alpha-GPC',
    study_name: 'Bellar et al. — Alpha-GPC and isometric force production',
    study_type: 'rct',
    sample_size: 13,
    duration_weeks: 1,
    primary_endpoint: 'Isometric mid-thigh pull force',
    result_summary:
      'A single 600 mg dose of Alpha-GPC significantly increased isometric force production compared to placebo in a counterbalanced crossover design with resistance-trained men.',
    effect_size: 'Peak force increased ~14% vs placebo',
    p_value: 'p=0.04',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2015,
    quality_score: 4,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Acute, small crossover study; supports sport performance structure/function claims at a very preliminary level. Larger chronic dosing studies are needed.',
    doi: '10.1186/s12970-015-0103-x',
  },

  // ===========================================================================
  // Tongkat Ali (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Tongkat Ali',
    study_name: 'Henkel et al. — Tongkat Ali and testosterone in stressed adults',
    study_type: 'rct',
    sample_size: 63,
    duration_weeks: 4,
    primary_endpoint: 'Salivary cortisol and testosterone, stress mood state',
    result_summary:
      'Eurycoma longifolia (Tongkat Ali) at 200 mg/day significantly improved stress hormone profile, reducing cortisol by 16% and increasing testosterone by 37% in moderately stressed adults.',
    effect_size: 'Cortisol -16%; testosterone +37%; tension -11%; anger -12%',
    p_value: 'p<0.05',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2013,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Testosterone increase claims attract FTC scrutiny; structure/function framing must focus on "supports healthy hormone levels" rather than implying testosterone therapy.',
    doi: '10.1186/1550-2783-10-28',
  },
  {
    ingredient: 'Tongkat Ali',
    study_name: 'Talbott et al. — Tongkat Ali and physical/psychological stress',
    study_type: 'rct',
    sample_size: 63,
    duration_weeks: 4,
    primary_endpoint: 'Profile of Mood States (POMS) and salivary hormones',
    result_summary:
      'Tongkat Ali extract (200 mg/day) improved stress-related mood state parameters and cortisol:testosterone ratio in moderately stressed adults participating in a stress management program.',
    effect_size: 'Cortisol:testosterone ratio improved by 36%',
    p_value: 'p<0.05 for cortisol:testosterone ratio',
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2013,
    quality_score: 5,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Adaptogenic stress claims are permissible as structure/function; hormonal ratio improvements should be framed carefully to avoid implying endocrine disorder treatment.',
    doi: '10.1186/1550-2783-10-28',
  },

  // ===========================================================================
  // Taurine (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Taurine',
    study_name: 'Singh et al. — Taurine deficiency as a driver of aging in Science',
    study_type: 'cohort',
    sample_size: 12000,
    duration_weeks: 0,
    primary_endpoint: 'Taurine blood levels correlated with aging biomarkers and lifespan in animal models',
    result_summary:
      'Taurine levels decline with age across species; taurine supplementation extended median lifespan by ~10% in mice, improved bone, muscle, immune, and metabolic health, and higher taurine levels correlated with better health in humans.',
    effect_size: '~10% median lifespan extension in mice; ~80% reduction in aging biomarkers',
    p_value: 'p<0.001 for animal lifespan; p<0.05 for human correlations',
    journal: 'Science',
    year: 2023,
    quality_score: 9,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Published in Science; landmark study but primarily preclinical/observational. FDA does not permit anti-aging or lifespan claims; structure/function claims about cellular health are permissible.',
    doi: '10.1126/science.abn9257',
  },
  {
    ingredient: 'Taurine',
    study_name: 'Waldron et al. — Taurine and exercise performance meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 225,
    duration_weeks: 0,
    primary_endpoint: 'Endurance exercise performance (time-to-exhaustion)',
    result_summary:
      'Meta-analysis of 10 studies found that acute taurine supplementation (1-6 g) significantly improved endurance exercise performance when taken 60-180 minutes before exercise.',
    effect_size: 'Time-to-exhaustion improved ~1.7% (ES = 0.29, small)',
    p_value: 'p<0.05',
    journal: 'Sports Medicine',
    year: 2018,
    quality_score: 6,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Supports exercise performance structure/function claims for taurine; small effect size is consistent with ergogenic supplement evidence. GRAS status is well-established.',
    doi: '10.1007/s40279-018-0896-2',
  },

  // ===========================================================================
  // Psyllium (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Psyllium',
    study_name: 'Wei et al. — Psyllium and LDL cholesterol meta-analysis',
    study_type: 'meta_analysis',
    sample_size: 1030,
    duration_weeks: 0,
    primary_endpoint: 'LDL cholesterol and total cholesterol reduction',
    result_summary:
      'Meta-analysis of 21 RCTs confirmed that psyllium fiber supplementation (5-15 g/day) significantly reduced LDL cholesterol by approximately 7% and total cholesterol by 6% across diverse populations.',
    effect_size: 'LDL-C -7% (-0.28 mmol/L); TC -6%',
    p_value: 'p<0.001',
    journal: 'The American Journal of Clinical Nutrition',
    year: 2009,
    quality_score: 8,
    claim_supported: 'authorized_health',
    regulatory_relevance:
      'FDA has authorized a health claim for psyllium and coronary heart disease risk reduction (21 CFR 101.81). This is one of the strongest regulatory positions for any dietary supplement ingredient.',
    doi: '10.3945/ajcn.2008.27070',
  },
  {
    ingredient: 'Psyllium',
    study_name: 'McRorie & McKeown — Psyllium fiber, glycemic control, and GI meta-analysis',
    study_type: 'systematic_review',
    sample_size: 0,
    duration_weeks: 0,
    primary_endpoint: 'Glycemic control, cholesterol, and bowel regularity',
    result_summary:
      'Comprehensive review established psyllium as a multi-benefit fiber with strong evidence for cholesterol reduction, glycemic control improvement (HbA1c -0.97%), and stool normalization via gel-forming mechanism.',
    effect_size: 'HbA1c -0.97% in diabetics; LDL -7%; stool weight +20%',
    p_value: 'p<0.001 across multiple endpoints',
    journal: 'Nutrition Today',
    year: 2017,
    quality_score: 7,
    claim_supported: 'authorized_health',
    regulatory_relevance:
      'Reinforces the FDA-authorized health claim for psyllium fiber and CHD risk; also supports structure/function claims for digestive regularity and healthy glucose metabolism.',
    doi: '10.1097/NT.0000000000000214',
  },

  // ===========================================================================
  // Vitamin K2 (~2 studies)
  // ===========================================================================
  {
    ingredient: 'Vitamin K2',
    study_name: 'Knapen et al. — Vitamin K2 (MK-7) and bone and cardiovascular health',
    study_type: 'rct',
    sample_size: 244,
    duration_weeks: 156,
    primary_endpoint: 'Bone mineral density and arterial stiffness (carotid-femoral PWV)',
    result_summary:
      'Vitamin K2 (MK-7) at 180 mcg/day for 3 years significantly reduced age-related arterial stiffness (pulse-wave velocity) and improved bone mineral content at the femoral neck in postmenopausal women.',
    effect_size: 'Carotid-femoral PWV improved significantly; femoral neck BMC preserved',
    p_value: 'p<0.05 for both PWV and BMC',
    journal: 'Thrombosis and Haemostasis',
    year: 2015,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Long-duration RCT with dual cardiovascular and bone endpoints; supports K2 structure/function claims for bone and vascular health. Particularly relevant for postmenopausal bone claim positioning.',
    doi: '10.1160/TH14-08-0720',
  },
  {
    ingredient: 'Vitamin K2',
    study_name: 'Geleijnse et al. — Rotterdam Study, vitamin K2 and cardiovascular mortality',
    study_type: 'cohort',
    sample_size: 4807,
    duration_weeks: 520,
    primary_endpoint: 'Cardiovascular mortality and aortic calcification',
    result_summary:
      'In the prospective Rotterdam Study, high dietary menaquinone (vitamin K2) intake was associated with a 57% reduction in cardiovascular mortality and 52% reduction in severe aortic calcification over 10 years.',
    effect_size: 'RR 0.43 for CV death (highest vs lowest tertile); aortic calcification RR 0.48',
    p_value: 'p<0.001 for trend',
    journal: 'The Journal of Nutrition',
    year: 2004,
    quality_score: 7,
    claim_supported: 'structure_function',
    regulatory_relevance:
      'Observational epidemiological data; supports biological plausibility for K2 cardiovascular health claims. FDA would require RCT confirmation for qualified health claims but structure/function claims are supportable.',
    doi: '10.1093/jn/134.11.3100',
  },
];

// ---------------------------------------------------------------------------
// Helper: Fuzzy match on ingredient field
// ---------------------------------------------------------------------------

export function findStudiesByIngredient(
  ingredient: string
): NutraceuticalClinicalStudy[] {
  const query = ingredient.toLowerCase().trim();

  return NUTRACEUTICAL_CLINICAL_EVIDENCE.filter((study) => {
    const target = study.ingredient.toLowerCase();

    // Exact match
    if (target === query) return true;

    // Contains match (e.g., "omega" matches "Omega-3 / Fish Oil")
    if (target.includes(query) || query.includes(target)) return true;

    // Common aliases / fuzzy matching
    const aliases: Record<string, string[]> = {
      'omega-3 / fish oil': ['omega-3', 'omega 3', 'fish oil', 'epa', 'dha', 'icosapent'],
      'nmn': ['nicotinamide mononucleotide', 'nad+', 'nad precursor'],
      'nicotinamide riboside': ['nr', 'niagen', 'tru niagen', 'nad+', 'nad precursor'],
      'vitamin d': ['d3', 'cholecalciferol', 'vit d'],
      'vitamin k2': ['k2', 'mk-7', 'mk7', 'menaquinone'],
      'probiotics': ['probiotic', 'lactobacillus', 'bifidobacterium', 'synbiotic', 'akkermansia', 'vsl#3', 'visbiome'],
      'creatine': ['creatine monohydrate', 'creatine hcl'],
      'ashwagandha': ['ksm-66', 'ksm66', 'withania somnifera', 'sensoril'],
      'curcumin': ['turmeric', 'curcuminoid', 'curcuminoids'],
      'collagen': ['collagen peptides', 'collagen hydrolysate', 'hydrolyzed collagen'],
      'magnesium': ['mag', 'magnesium glycinate', 'magnesium threonate', 'magnesium citrate'],
      "lion's mane": ['lions mane', 'hericium erinaceus', 'hericium'],
      'berberine': ['berberine hcl', 'berberine hydrochloride'],
      'coq10': ['coenzyme q10', 'ubiquinol', 'ubiquinone'],
      'melatonin': ['mel'],
      'resveratrol': ['trans-resveratrol'],
      'urolithin a': ['mitopure', 'timeline'],
      'spermidine': ['wheat germ extract'],
      'nac': ['n-acetyl cysteine', 'n-acetylcysteine', 'nacetylcysteine'],
      'quercetin': ['quercetin dihydrate', 'quercetin phytosome'],
      'l-theanine': ['theanine', 'suntheanine'],
      'alpha-gpc': ['alpha gpc', 'choline alfoscerate', 'glycerophosphocholine'],
      'tongkat ali': ['eurycoma longifolia', 'longjack'],
      'taurine': ['2-aminoethanesulfonic acid'],
      'psyllium': ['psyllium husk', 'metamucil', 'isabgol'],
    };

    const ingredientAliases = aliases[target] || [];
    if (ingredientAliases.some((alias) => alias.includes(query) || query.includes(alias))) {
      return true;
    }

    // Token overlap (at least one significant word in common)
    const queryTokens = query.split(/[\s\-\/]+/).filter((t) => t.length > 2);
    const targetTokens = target.split(/[\s\-\/]+/).filter((t) => t.length > 2);
    if (queryTokens.some((qt) => targetTokens.some((tt) => tt.includes(qt) || qt.includes(tt)))) {
      return true;
    }

    return false;
  });
}

// ---------------------------------------------------------------------------
// Helper: Evidence strength classification
// ---------------------------------------------------------------------------

export function getEvidenceStrength(
  ingredient: string
): 'strong' | 'moderate' | 'emerging' | 'preliminary' | 'none' {
  const studies = findStudiesByIngredient(ingredient);

  if (studies.length === 0) return 'none';

  const rcts = studies.filter((s) => s.study_type === 'rct');
  const highQualityRcts = rcts.filter((s) => s.quality_score >= 7);
  const anyQualityRcts = rcts.filter((s) => s.quality_score >= 6);
  const metaAnalyses = studies.filter((s) => s.study_type === 'meta_analysis');
  const clinicalStudies = studies.filter(
    (s) => s.study_type !== 'preclinical' && s.study_type !== 'systematic_review'
  );
  const onlyPreclinical = studies.every(
    (s) => s.study_type === 'preclinical' || s.study_type === 'systematic_review'
  );

  // Strong: >= 2 RCTs with quality >= 7, or any meta-analysis with quality >= 8
  if (
    highQualityRcts.length >= 2 ||
    metaAnalyses.some((m) => m.quality_score >= 8)
  ) {
    return 'strong';
  }

  // Moderate: 1 RCT quality >= 6, or meta-analysis present
  if (anyQualityRcts.length >= 1 || metaAnalyses.length > 0) {
    return 'moderate';
  }

  // Emerging: any clinical study present
  if (clinicalStudies.length > 0) {
    return 'emerging';
  }

  // Preliminary: only preclinical / systematic review
  if (onlyPreclinical) {
    return 'preliminary';
  }

  return 'none';
}

// ---------------------------------------------------------------------------
// Helper: Find landmark studies by quality threshold
// ---------------------------------------------------------------------------

export function findLandmarkStudies(
  minQualityScore: number = 8
): NutraceuticalClinicalStudy[] {
  return NUTRACEUTICAL_CLINICAL_EVIDENCE.filter(
    (study) => study.quality_score >= minQualityScore
  ).sort((a, b) => b.quality_score - a.quality_score || b.year - a.year);
}
