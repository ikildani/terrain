import type { CompetitorRecord } from './competitor-database';

export const PSYCHIATRY_COMPETITORS: CompetitorRecord[] = [
  // ══════════════════════════════════════════════════════════════════════════════
  // 1. MAJOR DEPRESSIVE DISORDER (MDD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Spravato',
    generic_name: 'esketamine',
    company: 'Janssen',
    indication: 'Major Depressive Disorder',
    indication_specifics:
      'Adults with MDD with acute suicidal ideation or behavior, in conjunction with an oral antidepressant; also indicated for treatment-resistant depression',
    mechanism:
      'NMDA receptor antagonist (S-enantiomer of ketamine) that enhances glutamatergic signaling and promotes rapid synaptic plasticity via BDNF/mTOR pathways',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor (GluN2B subunit)',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in MADRS total score at Day 28',
    key_data:
      'TRANSFORM-2 (NCT02418585): Statistically significant reduction in MADRS vs placebo at Day 28 (-4.0 points, p=0.020); n=223. ASPIRE I/II trials demonstrated rapid reduction in MADRS at 24 hours in patients with acute suicidal ideation.',
    line_of_therapy: 'Adjunctive to oral AD in TRD or MDD with suicidality',
    nct_ids: ['NCT02418585', 'NCT03039192'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First FDA-approved treatment specifically indicated for MDD with acute suicidal ideation, addressing critical unmet need',
      'Rapid onset of antidepressant effect within hours, unlike traditional SSRIs/SNRIs requiring 4-6 weeks',
      'Novel glutamatergic mechanism differentiated from all existing monoamine-based antidepressants',
    ],
    weaknesses: [
      'REMS requirement mandates administration in certified healthcare settings with 2-hour post-dose monitoring, limiting convenience',
      'Dissociative side effects, sedation, and abuse potential (Schedule III) create prescriber and payer hesitation',
      'High cost (~$5,900-$7,600 per month) with variable payer coverage and prior authorization burden',
    ],
    source:
      'FDA label (2019, updated 2020); TRANSFORM-2 (Popova et al., Am J Psychiatry 2019); ASPIRE I/II (Fu et al., J Clin Psychiatry 2020)',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Auvelity',
    generic_name: 'dextromethorphan-bupropion',
    company: 'Axsome Therapeutics',
    indication: 'Major Depressive Disorder',
    indication_specifics: 'Treatment of major depressive disorder in adults; oral fixed-dose combination tablet',
    mechanism:
      'Combination of dextromethorphan (NMDA receptor antagonist and sigma-1 receptor agonist) with bupropion (CYP2D6 inhibitor that increases dextromethorphan bioavailability and provides norepinephrine-dopamine reuptake inhibition)',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor / Sigma-1 receptor / NET / DAT',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6',
    key_data:
      'GEMINI (NCT04019704): Statistically significant improvement in MADRS vs placebo at Week 6 (-15.9 vs -12.0; p<0.001); n=327. Separation from placebo observed as early as Week 1.',
    line_of_therapy: '1L',
    nct_ids: ['NCT04019704', 'NCT02741791'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Oral formulation with rapid onset of action (Week 1 separation) offers practical advantage over intranasal esketamine',
      'First new mechanism oral antidepressant approved in over a decade, strong commercial positioning',
      'No REMS requirement or in-office monitoring needed, enabling broad primary care adoption',
    ],
    weaknesses: [
      'Contains bupropion component, limiting use in patients with seizure disorders or eating disorders',
      'Competing against well-established, low-cost generic SSRIs/SNRIs as first-line options',
      'Long-term durability data beyond 6-month open-label extension still maturing',
    ],
    source:
      'FDA label (August 2022); GEMINI trial (Iosifescu et al., J Clin Psychiatry 2022); Axsome Therapeutics 10-K 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Zurzuvae',
    generic_name: 'zuranolone',
    company: 'Sage Therapeutics',
    indication: 'Major Depressive Disorder',
    indication_specifics:
      'Treatment of postpartum depression in adults; 14-day oral course. MDD broader indication not approved (FDA CRL for general MDD in 2023)',
    mechanism:
      'Positive allosteric modulator of synaptic and extrasynaptic GABA-A receptors, acting as a neuroactive steroid that restores GABAergic tone disrupted in depression',
    mechanism_category: 'gaba_modulator',
    molecular_target: 'GABA-A receptor (synaptic and extrasynaptic)',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in HAM-D17 total score at Day 15',
    key_data:
      'ROBIN (NCT02978326) for PPD: Significant HAM-D improvement vs placebo at Day 15 (-15.6 vs -11.6; p=0.003); n=151. For MDD, WATERFALL (NCT04442490) met primary endpoint but CORAL trial showed inconsistent results, leading to FDA CRL for broad MDD indication.',
    line_of_therapy: '1L for PPD',
    partner: 'Biogen',
    nct_ids: ['NCT02978326', 'NCT04442490'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First oral neuroactive steroid for postpartum depression; 14-day course offers defined treatment duration',
      'Rapid onset within days, addressing acute suffering in peripartum period',
      'Novel GABAergic mechanism orthogonal to monoamine-based therapies',
    ],
    weaknesses: [
      'FDA rejected broader MDD indication due to inconsistent Phase 3 results (CORAL failure), limiting addressable market',
      'Postpartum depression market is relatively small compared to general MDD (~400K US patients/year)',
      'CNS depression and somnolence side effects require boxed warning about driving impairment for 12 hours',
    ],
    source:
      'FDA label (August 2023); ROBIN trial (Deligiannidis et al., Am J Psychiatry 2023); Sage Therapeutics/Biogen press release (2023)',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Aticaprant',
    generic_name: 'aticaprant',
    company: 'Janssen',
    indication: 'Major Depressive Disorder',
    indication_specifics:
      'Adjunctive treatment of MDD in adults with inadequate response to SSRI/SNRI monotherapy; kappa opioid receptor antagonist',
    mechanism:
      'Selective kappa opioid receptor (KOR) antagonist that modulates the dynorphin/KOR system implicated in anhedonia and negative affect in depression',
    mechanism_category: 'opioid_modulator',
    molecular_target: 'Kappa opioid receptor (KOR)',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6',
    key_data:
      'ESCAPE-TRD (NCT04221230) Phase 2: Adjunctive aticaprant 10mg showed significant MADRS improvement vs placebo at Week 6 (-2.4 points; nominal p=0.028); n=163. Phase 3 VIVID-1 trial completed enrollment with results expected 2025.',
    line_of_therapy: 'Adjunctive to SSRI/SNRI',
    nct_ids: ['NCT04221230', 'NCT05455294'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First-in-class kappa opioid antagonist mechanism targeting anhedonia, a core MDD symptom poorly addressed by current treatments',
      'Oral, once-daily dosing with no abuse liability concerns (KOR antagonist, not agonist)',
      'Backed by Janssen/J&J resources with strong CNS commercial infrastructure',
    ],
    weaknesses: [
      'Phase 2 effect size was modest (-2.4 MADRS points); Phase 3 confirmation uncertain',
      'Adjunctive-only positioning means competing with established augmentation strategies (aripiprazole, quetiapine)',
      'Novel mechanism with limited clinical precedent for KOR antagonism in psychiatry',
    ],
    source:
      'ESCAPE-TRD (Krystal et al., Biol Psychiatry 2023); Janssen pipeline disclosure Q4 2024; ClinicalTrials.gov NCT05455294',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'COMP360 Psilocybin',
    generic_name: 'psilocybin',
    company: 'Compass Pathways',
    indication: 'Major Depressive Disorder',
    indication_specifics:
      'Psilocybin-assisted therapy for treatment-resistant depression and major depressive disorder; administered with psychological support',
    mechanism:
      'Serotonin 5-HT2A receptor agonist that induces acute psychedelic experience promoting neuroplasticity, emotional processing, and default mode network reset',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 3',
    key_data:
      'Phase 2b (NCT03775200): 25mg psilocybin showed rapid MADRS reduction; 29.1% of patients achieved remission at Week 3 vs 7.6% placebo (p=0.002); n=233. Effect attenuated by Week 12. Phase 3 program initiated for TRD.',
    line_of_therapy: '2L+ (treatment-resistant)',
    nct_ids: ['NCT03775200'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Breakthrough Therapy Designation from FDA for TRD; single-dose paradigm fundamentally different from chronic daily medication',
      'High remission rates in Phase 2b with rapid onset, addressing patients who failed multiple conventional treatments',
      'Growing body of academic evidence supporting psychedelic-assisted therapy across mood disorders',
    ],
    weaknesses: [
      'Requires specialized certified treatment centers with trained therapists, severely limiting scalability',
      'Effect durability questionable — benefits attenuated by Week 12 in Phase 2b, may require re-dosing',
      'Regulatory pathway unprecedented for psychedelic-assisted therapy; FDA may require complex REMS',
    ],
    source: 'Goodwin et al., NEJM 2022; Compass Pathways Phase 2b results; ClinicalTrials.gov NCT03775200',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'REL-1017',
    generic_name: 'esmethadone',
    company: 'Relmada Therapeutics',
    indication: 'Major Depressive Disorder',
    indication_specifics:
      'Adjunctive treatment of MDD in adults with inadequate response to standard antidepressant therapy; NMDA receptor channel blocker',
    mechanism:
      'Uncompetitive NMDA receptor channel blocker (dextroisomer of methadone) that lacks opioid activity at therapeutic doses and modulates glutamatergic neurotransmission',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor ion channel',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in MADRS total score at Day 7',
    key_data:
      'Phase 2a (NCT03051256): REL-1017 25mg and 50mg showed significant MADRS improvement vs placebo at Day 7 (p<0.05); n=62. Rapid onset within 4 days. Phase 2b RELIANCE II trial reported mixed results in 2023.',
    line_of_therapy: 'Adjunctive to oral AD',
    nct_ids: ['NCT03051256', 'NCT04855747'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Rapid-acting NMDA mechanism with oral dosing and no psychotomimetic effects reported in trials',
      'No opioid receptor activity at therapeutic doses despite methadone structural backbone',
    ],
    weaknesses: [
      'Phase 2b RELIANCE II showed inconsistent results, raising efficacy questions',
      'Structural similarity to methadone creates perception challenges with regulators and prescribers',
      'Crowded adjunctive MDD space with Auvelity already approved and aticaprant in Phase 3',
    ],
    source:
      'Relmada Therapeutics pipeline update 2024; Phase 2a (Fava et al., J Psychiatr Res 2022); ClinicalTrials.gov NCT04855747',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. BIPOLAR DISORDER
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Caplyta',
    generic_name: 'lumateperone',
    company: 'Intra-Cellular Therapies',
    indication: 'Bipolar Disorder',
    indication_specifics:
      'Treatment of depressive episodes associated with bipolar I or bipolar II disorder in adults, as monotherapy or adjunctive to lithium or valproate',
    mechanism:
      'Dual serotonin 5-HT2A antagonist and dopamine receptor phosphoprotein modulator (DPPM) with presynaptic D2 partial agonism and postsynaptic D2 antagonism, plus serotonin reuptake inhibition',
    mechanism_category: 'serotonin_modulator',
    molecular_target: '5-HT2A / D2 / SERT',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6',
    key_data:
      'Study 401 (NCT03249376): Monotherapy lumateperone 42mg significantly improved MADRS vs placebo (-4.6 points; p<0.001); n=377. Study 402 (NCT03249389): Adjunctive to mood stabilizer also significant (-4.0 points; p<0.001); n=356.',
    line_of_therapy: '1L or adjunctive',
    nct_ids: ['NCT03249376', 'NCT03249389'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Favorable metabolic profile vs other atypical antipsychotics — minimal weight gain, no clinically significant lipid/glucose changes',
      'Approved as both monotherapy and adjunctive, providing flexible prescribing across bipolar depression',
      'Once-daily oral dosing with low somnolence rates compared to quetiapine, improving adherence',
    ],
    weaknesses: [
      'No indication for bipolar mania, limiting it to depressive episodes only',
      'Competes directly against well-established, now-generic quetiapine XR and cariprazine in bipolar depression',
      'Moderate effect size in pivotal trials; real-world differentiation from lurasidone still debated',
    ],
    source:
      'FDA label (December 2021 bipolar depression indication); Calabrese et al., Am J Psychiatry 2021; Intra-Cellular Therapies 10-K 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Lybalvi',
    generic_name: 'olanzapine-samidorphan',
    company: 'Alkermes',
    indication: 'Bipolar Disorder',
    indication_specifics:
      'Treatment of bipolar I disorder in adults, for acute manic or mixed episodes as monotherapy or adjunct to lithium/valproate, and maintenance monotherapy',
    mechanism:
      'Combination of olanzapine (multi-receptor antagonist: D2, 5-HT2A, 5-HT2C, H1, M1) with samidorphan (opioid receptor antagonist) designed to mitigate olanzapine-associated weight gain via opioid system modulation',
    mechanism_category: 'dopamine_antagonist',
    molecular_target: 'D2 / 5-HT2A / Opioid receptors (mu, kappa, delta)',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in Y-MRS total score at Week 3; percent change in body weight',
    key_data:
      'ENLIGHTEN-1 (NCT02694328): Non-inferior to olanzapine on Y-MRS efficacy. ENLIGHTEN-2 (NCT02734745): Significantly less weight gain vs olanzapine alone at Week 24 (-37% relative reduction; p<0.001); n=561.',
    line_of_therapy: '1L or adjunctive for acute mania',
    nct_ids: ['NCT02694328', 'NCT02734745'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Preserves olanzapine efficacy (gold standard for acute mania) while significantly mitigating its worst side effect (weight gain)',
      'Broad indication covering acute mania, mixed episodes, and maintenance in bipolar I',
      'Familiar olanzapine efficacy profile reduces prescriber learning curve',
    ],
    weaknesses: [
      'Weight gain mitigation is relative, not absolute — patients still gain weight, just less than olanzapine alone',
      'Premium pricing vs generic olanzapine creates significant payer pushback',
      'Contraindicated with opioid use, limiting prescribing in patients with comorbid pain conditions or substance use',
    ],
    source: 'FDA label (May 2021); ENLIGHTEN-1/2 (Correll et al., Am J Psychiatry 2020); Alkermes 10-K 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Vraylar',
    generic_name: 'cariprazine',
    company: 'AbbVie',
    indication: 'Bipolar Disorder',
    indication_specifics:
      'Treatment of manic or mixed episodes and depressive episodes associated with bipolar I disorder in adults',
    mechanism:
      'Dopamine D3-preferring partial agonist and D2 partial agonist with 5-HT2A antagonism; uniquely high D3/D2 binding ratio promotes pro-cognitive and antianhedonic effects',
    mechanism_category: 'dopamine_partial_agonist',
    molecular_target: 'D3 / D2 / 5-HT2A',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in MADRS total score (depression) and Y-MRS total score (mania)',
    key_data:
      'RGH-MD-53 (NCT02670538) bipolar depression: Cariprazine 1.5mg significantly improved MADRS vs placebo (-2.5 points; p=0.003); n=476. Also approved for mania/mixed episodes based on earlier Phase 3 trials.',
    line_of_therapy: '1L',
    nct_ids: ['NCT02670538', 'NCT01058096'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Only atypical antipsychotic with FDA approval for both bipolar mania AND bipolar depression in a single molecule',
      'D3-preferring pharmacology provides differentiated pro-cognitive effects relevant to bipolar cognitive impairment',
      'Long half-life active metabolites provide stable receptor occupancy and potential for dosing flexibility',
    ],
    weaknesses: [
      'Akathisia rates (~9-13%) higher than some competitors, driving discontinuation in sensitive patients',
      'Long active metabolite half-life (2-3 weeks) complicates dose titration and washout',
      'Loss of exclusivity approaching; generic cariprazine will erode branded revenue',
    ],
    source: 'FDA label (May 2019 bipolar depression sNDA); Earley et al., Am J Psychiatry 2019; AbbVie 10-K 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'SEP-4199',
    generic_name: 'SEP-4199',
    company: 'Sunovion Pharmaceuticals',
    indication: 'Bipolar Disorder',
    indication_specifics: 'Bipolar I depression in adults; investigational selective 5-HT2A inverse agonist',
    mechanism:
      'Selective serotonin 5-HT2A receptor inverse agonist that modulates cortical glutamatergic and serotonergic signaling without dopamine D2 binding, aiming to treat bipolar depression without antimanic receptor pharmacology',
    mechanism_category: 'serotonin_modulator',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6',
    key_data:
      'Phase 2 (NCT03468985): SEP-4199 met primary endpoint with significant MADRS improvement vs placebo at Week 6; 50mg dose showed -5.2 point advantage (p=0.013); n=185. Discontinued due to QTc signal at higher doses.',
    line_of_therapy: '1L for bipolar depression',
    nct_ids: ['NCT03468985'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Selective 5-HT2A mechanism avoids D2-related movement disorders and metabolic effects of atypical antipsychotics',
      'Demonstrated significant efficacy signal in Phase 2 for bipolar depression',
    ],
    weaknesses: [
      'QTc prolongation signal at higher doses led to program discontinuation/restructuring concerns',
      'Parent company Sumitomo (Sunovion) deprioritized development; future unclear',
      'Increasingly crowded bipolar depression space with Caplyta and Vraylar already established',
    ],
    source: 'Sunovion Phase 2 results (APA 2022 presentation); ClinicalTrials.gov NCT03468985',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Lumateperone Bipolar Maintenance',
    generic_name: 'lumateperone',
    company: 'Intra-Cellular Therapies',
    indication: 'Bipolar Disorder',
    indication_specifics:
      'Long-term maintenance treatment of bipolar I and bipolar II disorder to prevent mood episode recurrence',
    mechanism:
      'Dual serotonin 5-HT2A antagonist and dopamine receptor phosphoprotein modulator (DPPM) with serotonin reuptake inhibition; same mechanism as Caplyta acute, evaluated for relapse prevention',
    mechanism_category: 'serotonin_modulator',
    molecular_target: '5-HT2A / D2 / SERT',
    phase: 'Phase 3',
    primary_endpoint: 'Time to recurrence of any mood episode (depression, mania, hypomania, or mixed)',
    key_data:
      'Study 403 (NCT04596150): Phase 3 maintenance trial evaluating lumateperone monotherapy and adjunctive to lithium/valproate for prevention of mood episode recurrence. Enrollment completed; topline results anticipated.',
    line_of_therapy: 'Maintenance',
    nct_ids: ['NCT04596150'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'If approved for maintenance, would expand Caplyta franchise from acute to long-term management — significant revenue opportunity',
      'Favorable metabolic and tolerability profile positions well for chronic maintenance use where side effects drive non-adherence',
    ],
    weaknesses: [
      'Maintenance bipolar trials historically high-risk with high placebo response and enrichment design complexity',
      'Competes with lithium and divalproex (generic, decades of evidence) as maintenance standards of care',
      'Depends on single Phase 3 study; failure would limit long-term franchise potential',
    ],
    source: 'Intra-Cellular Therapies pipeline update Q4 2024; ClinicalTrials.gov NCT04596150',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. SCHIZOPHRENIA
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Cobenfy',
    generic_name: 'xanomeline-trospium',
    company: 'Bristol-Myers Squibb',
    indication: 'Schizophrenia',
    indication_specifics:
      'Treatment of schizophrenia in adults; first antipsychotic with a non-dopaminergic mechanism approved in over 30 years',
    mechanism:
      'Combination of xanomeline (M1/M4 muscarinic receptor agonist that modulates mesolimbic dopamine release indirectly) with trospium (peripheral muscarinic antagonist that blocks cholinergic side effects of xanomeline in the periphery)',
    mechanism_category: 'muscarinic_agonist',
    molecular_target: 'M1 / M4 muscarinic receptors (central) + peripheral muscarinic blockade',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in PANSS total score at Week 5',
    key_data:
      'EMERGENT-1 (NCT03697252): Significant PANSS improvement vs placebo (-9.6 points; p<0.001); n=182. EMERGENT-2 (NCT04738123): Confirmed (-6.0 points; p<0.001); n=252. EMERGENT-3 (NCT04659161): (-8.4 points; p<0.001); n=256.',
    line_of_therapy: '1L or 2L',
    nct_ids: ['NCT03697252', 'NCT04738123', 'NCT04659161'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First fundamentally new mechanism for schizophrenia in 30+ years — no direct D2 blockade eliminates EPS, tardive dyskinesia, and prolactin elevation',
      'Minimal weight gain and metabolic disruption compared to all existing atypical antipsychotics',
      'Robust efficacy across three positive Phase 3 trials with consistent PANSS improvement',
    ],
    weaknesses: [
      'Cholinergic side effects (nausea, vomiting, constipation, dyspepsia) affect ~20-30% of patients despite trospium mitigation',
      'No long-acting injectable formulation available; oral-only limits use in non-adherent patients',
      'Premium pricing in a market where generic olanzapine, risperidone, and quetiapine dominate volume',
    ],
    source: 'FDA approval (September 2024); Kaul et al., NEJM 2024; Bristol-Myers Squibb pipeline update 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Emraclidine',
    generic_name: 'emraclidine',
    company: 'AbbVie',
    indication: 'Schizophrenia',
    indication_specifics:
      'Treatment of schizophrenia in adults; selective M4 muscarinic acetylcholine receptor positive allosteric modulator (PAM)',
    mechanism:
      'Selective positive allosteric modulator (PAM) of M4 muscarinic receptors that enhances acetylcholine signaling at M4 without directly activating the receptor, modulating striatal dopamine release',
    mechanism_category: 'muscarinic_agonist',
    molecular_target: 'M4 muscarinic receptor (PAM)',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in PANSS total score at Week 6',
    key_data:
      'EMPOWER-1 (NCT05227703) Phase 2: Did not meet primary endpoint — PANSS improvement was not statistically significant vs placebo at Week 6 (p=0.15); n=222. AbbVie (acquired from Cerevel) evaluating path forward with dose optimization.',
    line_of_therapy: '1L or 2L',
    nct_ids: ['NCT05227703'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Selective M4 PAM mechanism avoids peripheral cholinergic side effects without needing a trospium-like add-on',
      'AbbVie has deep CNS commercial infrastructure and resources to run optimized Phase 3 if dose-response improves',
      'Allosteric modulation may provide more physiological receptor engagement than direct agonism',
    ],
    weaknesses: [
      'Phase 2 EMPOWER-1 failed primary endpoint, creating significant clinical and regulatory risk for the program',
      'M4-selective approach may lack the dual M1/M4 efficacy signal demonstrated by xanomeline in Cobenfy',
      'Behind Cobenfy (already approved) in the muscarinic class; would need to demonstrate clear differentiation',
    ],
    source: 'AbbVie/Cerevel Phase 2 EMPOWER-1 results (2024); ClinicalTrials.gov NCT05227703',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Iclepertin',
    generic_name: 'iclepertin',
    company: 'Roche',
    indication: 'Schizophrenia',
    indication_specifics:
      'Cognitive impairment associated with schizophrenia (CIAS); adjunctive to antipsychotic therapy targeting cognitive deficits',
    mechanism:
      'Glycine transporter type 1 (GlyT1) inhibitor that increases glycine levels at NMDA receptor co-agonist sites, enhancing glutamatergic neurotransmission in cortical circuits underlying cognition',
    mechanism_category: 'glutamate_modulator',
    molecular_target: 'GlyT1 (glycine transporter 1)',
    phase: 'Phase 3',
    primary_endpoint:
      'Change from baseline in BACS composite score (Brief Assessment of Cognition in Schizophrenia) at Week 26',
    key_data:
      'CONNEX Phase 2 (NCT03859973): Iclepertin 10mg showed significant improvement in BACS composite vs placebo (+0.24 effect size; nominal p=0.014); n=509. Phase 3 CONNEX-1/2/3 trials underway targeting cognitive impairment.',
    line_of_therapy: 'Adjunctive to antipsychotic',
    nct_ids: ['NCT03859973', 'NCT05652946'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Targets cognitive impairment in schizophrenia — a major unmet need with ZERO approved treatments',
      'Breakthrough Therapy Designation from FDA for CIAS; strong regulatory engagement',
      'Positive Phase 2 signal with well-defined mechanism and robust Roche development resources',
    ],
    weaknesses: [
      'Cognitive endpoints are notoriously difficult to achieve in schizophrenia trials; no drug has ever succeeded in Phase 3 for CIAS',
      'NMDA hypofunction hypothesis for cognition has multiple prior clinical failures (bitopertin, other GlyT1 inhibitors)',
      'Modest effect size in Phase 2 may not translate to clinically meaningful cognitive improvement in Phase 3',
    ],
    source:
      'Roche pipeline update Q4 2024; Fleischhacker et al., Lancet Psychiatry 2023; ClinicalTrials.gov NCT05652946',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Lybalvi',
    generic_name: 'olanzapine-samidorphan',
    company: 'Alkermes',
    indication: 'Schizophrenia',
    indication_specifics:
      'Treatment of schizophrenia in adults; combination designed to mitigate olanzapine-associated weight gain',
    mechanism:
      'Combination of olanzapine (multi-receptor antagonist: D2, 5-HT2A, 5-HT2C, H1, M1) with samidorphan (opioid receptor antagonist) to attenuate olanzapine-induced weight gain through opioid system modulation of appetite pathways',
    mechanism_category: 'dopamine_antagonist',
    molecular_target: 'D2 / 5-HT2A / Opioid receptors',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in PANSS total score and percent change in body weight',
    key_data:
      'ENLIGHTEN-1: Non-inferior to olanzapine on PANSS efficacy. ENLIGHTEN-2 (NCT02734745): 37% less weight gain vs olanzapine alone over 24 weeks (p<0.001); n=561. Schizophrenia indication approved May 2021.',
    line_of_therapy: '2L+',
    nct_ids: ['NCT02694328', 'NCT02734745'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Preserves olanzapine efficacy (among the most effective antipsychotics per CATIE/CUtLASS) with reduced metabolic burden',
      'Clear positioning for patients who respond to olanzapine but discontinue due to weight gain',
    ],
    weaknesses: [
      'Weight mitigation is partial, not complete — metabolic monitoring still required',
      'Branded pricing vs widely available generic olanzapine creates adoption barrier with payers',
      'Opioid antagonist component contraindicates use with opioid medications, a relevant comorbidity in SMI patients',
    ],
    source: 'FDA label (May 2021); ENLIGHTEN-2 (Correll et al., Am J Psychiatry 2020); Alkermes 10-K 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Evenamide',
    generic_name: 'evenamide',
    company: 'Newron Pharmaceuticals',
    indication: 'Schizophrenia',
    indication_specifics:
      'Adjunctive treatment of schizophrenia in adults with inadequate response to current antipsychotic therapy; voltage-gated sodium channel inhibitor',
    mechanism:
      'Selective voltage-gated sodium channel (Nav) inhibitor that modulates excessive glutamate release from hyperactive cortical neurons, normalizing glutamatergic/GABAergic balance without direct dopamine receptor binding',
    mechanism_category: 'glutamate_modulator',
    molecular_target: 'Voltage-gated sodium channels (Nav)',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in PANSS total score at Week 6',
    key_data:
      'Phase 2 (Study 008/014): Open-label adjunctive evenamide showed PANSS improvement of -11.5 points over 6 weeks in patients on stable antipsychotics; n=118. Phase 3 (Study 015, NCT05325398) randomized controlled trial underway.',
    line_of_therapy: 'Adjunctive to antipsychotic',
    nct_ids: ['NCT05325398'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Non-dopaminergic mechanism offers adjunctive option without compounding D2-related side effects of existing antipsychotics',
      'Addresses treatment-resistant population (inadequate response to antipsychotics) — large unmet need',
    ],
    weaknesses: [
      'Phase 2 data was open-label only, making true efficacy assessment uncertain pending randomized Phase 3',
      'Sodium channel modulation for psychiatry is mechanistically novel but clinically unproven in schizophrenia',
      'Small company (Newron) with limited commercial capabilities; would likely need partnership for launch',
    ],
    source:
      'Newron Pharmaceuticals pipeline update 2024; Bhatt et al., Schizophr Res 2023; ClinicalTrials.gov NCT05325398',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. POST-TRAUMATIC STRESS DISORDER (PTSD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'MDMA-Assisted Therapy',
    generic_name: 'midomafetamine',
    company: 'Lykos Therapeutics',
    indication: 'Post-Traumatic Stress Disorder',
    indication_specifics:
      'MDMA-assisted therapy for severe PTSD in adults; three sessions of MDMA combined with standardized trauma-focused psychotherapy',
    mechanism:
      'Entactogen that increases release of serotonin, norepinephrine, and dopamine while promoting oxytocin and prolactin release, reducing amygdala fear response and enabling trauma processing within therapeutic context',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: 'SERT / NET / DAT (release and reuptake inhibition) / Oxytocin system',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in CAPS-5 (Clinician-Administered PTSD Scale) total score',
    key_data:
      'MAPP1 (NCT03537014): MDMA-AT showed -24.4 CAPS-5 reduction vs -13.9 placebo (p<0.001); 71% no longer met PTSD diagnosis; n=90. MAPP2 replicated. FDA rejected NDA in August 2024 citing trial conduct concerns and request for additional trial.',
    line_of_therapy: '2L+ (treatment-resistant PTSD)',
    nct_ids: ['NCT03537014', 'NCT04077437'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Unprecedented efficacy: 71% of patients no longer met PTSD diagnostic criteria after 3 sessions in MAPP1',
      'Addresses massive unmet need — existing PTSD treatments (SSRIs) have modest effect sizes and high non-response rates',
      'Time-limited treatment (3 sessions) versus indefinite daily medication, potentially cost-effective long-term',
    ],
    weaknesses: [
      'FDA issued Complete Response Letter in August 2024, citing concerns about functional unblinding, trial methodology, and therapist misconduct allegations',
      'Requires specialized certified therapists and multi-hour supervised sessions, limiting scalability and increasing cost',
      'Schedule I substance creates complex regulatory, DEA, and institutional adoption challenges',
    ],
    source:
      'Mitchell et al., Nature Medicine 2021; FDA Advisory Committee briefing documents (June 2024); Lykos Therapeutics press releases 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Brexpiprazole Adjunctive',
    generic_name: 'brexpiprazole',
    company: 'Otsuka/Lundbeck',
    indication: 'Post-Traumatic Stress Disorder',
    indication_specifics:
      'Adjunctive treatment of PTSD in adults with inadequate response to SSRI/SNRI; serotonin-dopamine activity modulator',
    mechanism:
      'Serotonin-dopamine activity modulator (SDAM) acting as partial agonist at 5-HT1A and D2 receptors with antagonism at 5-HT2A and alpha-1B/2C adrenergic receptors, modulating anxiety and hyperarousal circuits',
    mechanism_category: 'dopamine_partial_agonist',
    molecular_target: '5-HT1A / D2 / 5-HT2A / alpha-1B/2C',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in CAPS-5 total score at Week 10',
    key_data:
      'Phase 3 VALOR (NCT05765006): Evaluating brexpiprazole as adjunct to SSRI/SNRI for PTSD. Brexpiprazole already approved for schizophrenia and adjunctive MDD. Enrollment ongoing with results expected 2025-2026.',
    line_of_therapy: 'Adjunctive to SSRI/SNRI',
    nct_ids: ['NCT05765006'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Already approved for two CNS indications with well-characterized safety profile, reducing regulatory risk for PTSD expansion',
      'Favorable metabolic and akathisia profile vs aripiprazole, the most commonly used adjunctive atypical in PTSD',
      'Otsuka/Lundbeck have strong CNS commercial presence and PTSD-relevant VA/DoD relationships',
    ],
    weaknesses: [
      'Atypical antipsychotic augmentation for PTSD is already used off-label; may be difficult to demonstrate incremental benefit',
      'Phase 3 results pending; PTSD trials have historically high placebo response rates (40-50%)',
      'Does not address PTSD-specific trauma processing; symptomatic treatment only',
    ],
    source: 'ClinicalTrials.gov NCT05765006; Otsuka pipeline update 2024; Rexulti FDA label for reference safety data',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'MM-120',
    generic_name: 'lysergide',
    company: 'MindMed',
    indication: 'Post-Traumatic Stress Disorder',
    indication_specifics: 'LSD-assisted therapy for PTSD; single or limited dosing sessions with psychological support',
    mechanism:
      'Serotonin 5-HT2A receptor agonist (lysergic acid diethylamide, pharmaceutical-grade) that induces neuroplasticity-promoting psychedelic state, facilitating trauma processing and fear extinction',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A / 5-HT2C / D2',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in CAPS-5 total score at Week 12',
    key_data:
      'Phase 2 PTSD trial initiated 2024 (NCT06216717). MM-120 demonstrated positive Phase 2b results in generalized anxiety disorder (significant reduction in HAM-A; topline 2024), supporting cross-indication development in trauma/anxiety spectrum.',
    line_of_therapy: '2L+ (treatment-resistant)',
    nct_ids: ['NCT06216717'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Positive Phase 2b data in GAD provides mechanistic validation for serotonergic psychedelic approach in anxiety/trauma spectrum',
      'Single-dose paradigm could offer durable PTSD symptom relief without chronic medication',
      'Proprietary pharmaceutical-grade lysergide with defined dose-response from GAD program',
    ],
    weaknesses: [
      'Schedule I substance with uncertain regulatory pathway and significant institutional adoption barriers',
      'PTSD Phase 2 just initiated; several years from potential approval with high clinical risk',
      'MDMA-AT FDA rejection in 2024 cast shadow over entire psychedelic-assisted therapy regulatory landscape',
    ],
    source: 'MindMed pipeline update Q4 2024; ClinicalTrials.gov NCT06216717; MM-120 GAD Phase 2b topline results 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'TNX-102 SL',
    generic_name: 'cyclobenzaprine sublingual',
    company: 'Tonix Pharmaceuticals',
    indication: 'Post-Traumatic Stress Disorder',
    indication_specifics:
      'Treatment of PTSD in adults; sublingual formulation of cyclobenzaprine targeting sleep disturbance and hyperarousal symptoms',
    mechanism:
      'Multimodal mechanism: potent 5-HT2A receptor antagonist, antihistamine (H1), and anticholinergic at sublingual doses; normalizes disrupted sleep architecture and reduces hyperarousal through serotonergic and histaminergic modulation',
    mechanism_category: 'serotonin_modulator',
    molecular_target: '5-HT2A / H1 / Muscarinic receptors',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in CAPS-5 total score at Week 12',
    key_data:
      'HONOR Phase 3 (NCT03690596): TNX-102 SL 5.6mg met primary endpoint with significant CAPS-5 improvement vs placebo (-6.9 points; p=0.013); n=224. Second Phase 3 RESILIENCE trial ongoing for confirmatory data.',
    line_of_therapy: '1L or 2L',
    nct_ids: ['NCT03690596', 'NCT05591924'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Positive Phase 3 HONOR trial met primary CAPS-5 endpoint, providing strong clinical validation',
      'Sublingual formulation of repurposed molecule provides defined pharmacology and safety database',
      'Targets sleep and hyperarousal, the most distressing and treatment-resistant PTSD symptom clusters',
    ],
    weaknesses: [
      'Cyclobenzaprine is a well-known generic muscle relaxant; perception of a repurposed old drug may limit excitement',
      'Somnolence and anticholinergic side effects may limit daytime dosing flexibility',
      'Requires confirmatory Phase 3 RESILIENCE trial success; single positive Phase 3 may not be sufficient',
    ],
    source:
      'HONOR Phase 3 (Tonix Pharmaceuticals press release 2023); ClinicalTrials.gov NCT05591924; Neylan et al., presented at ACNP 2023',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. OBSESSIVE-COMPULSIVE DISORDER (OCD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Troriluzole',
    generic_name: 'troriluzole',
    company: 'Biohaven Pharmaceuticals',
    indication: 'Obsessive-Compulsive Disorder',
    indication_specifics:
      'Treatment of OCD in adults with inadequate response to SRI therapy; glutamate modulating agent (prodrug of riluzole)',
    mechanism:
      'Third-generation glutamate modulator (prodrug of riluzole with improved bioavailability) that inhibits presynaptic glutamate release, enhances astrocytic glutamate uptake, and modulates postsynaptic glutamate signaling to normalize cortico-striato-thalamo-cortical circuit hyperactivity in OCD',
    mechanism_category: 'glutamate_modulator',
    molecular_target: 'Glutamate release / EAAT2 transporter / voltage-gated sodium channels',
    phase: 'Phase 2/3',
    primary_endpoint: 'Change from baseline in Y-BOCS (Yale-Brown Obsessive Compulsive Scale) total score at Week 12',
    key_data:
      'Phase 2/3 (NCT03299166): Troriluzole 200mg adjunctive to SRI showed numerical improvement in Y-BOCS but did not reach statistical significance (p=0.071) at Week 12; n=323. Post-hoc analyses suggested benefit in severe OCD subgroup.',
    line_of_therapy: 'Adjunctive to SRI',
    nct_ids: ['NCT03299166'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First glutamate-modulating agent specifically developed for OCD, addressing a validated but untapped mechanism',
      'Well-characterized safety profile based on riluzole clinical experience (ALS indication)',
      'Post-hoc signal in severe OCD subgroup could support enriched Phase 3 design',
    ],
    weaknesses: [
      'Phase 2/3 trial missed primary endpoint; development path forward requires new trial investment',
      'Glutamate hypothesis for OCD, while biologically plausible, has not yet produced an approved therapy',
      'Biohaven acquisition by Pfizer may deprioritize OCD program relative to larger indications',
    ],
    source:
      'Biohaven Phase 2/3 results (Pittenger et al., Biol Psychiatry 2023); ClinicalTrials.gov NCT03299166; Pfizer/Biohaven pipeline 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Pimavanserin OCD',
    generic_name: 'pimavanserin',
    company: 'Acadia Pharmaceuticals',
    indication: 'Obsessive-Compulsive Disorder',
    indication_specifics:
      'Adjunctive treatment of OCD in adults with inadequate SRI response; selective 5-HT2A inverse agonist',
    mechanism:
      'Selective serotonin 5-HT2A receptor inverse agonist and antagonist that modulates cortical serotonergic signaling involved in obsessive thought generation without dopamine receptor binding',
    mechanism_category: 'serotonin_modulator',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in Y-BOCS total score at Week 12',
    key_data:
      'Phase 2 (NCT04855903): Pimavanserin 34mg adjunctive to SRI evaluated in SRI-refractory OCD patients; initial results showed trend toward Y-BOCS improvement in treatment-resistant subgroup; n=approx 100. Acadia evaluating next steps.',
    line_of_therapy: 'Adjunctive to SRI',
    nct_ids: ['NCT04855903'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Already FDA-approved for Parkinson disease psychosis (Nuplazid), providing established safety and manufacturing',
      'Selective 5-HT2A mechanism avoids D2-related side effects that limit atypical antipsychotic augmentation in OCD',
      'Oral, once-daily dosing with well-characterized pharmacokinetics from Nuplazid experience',
    ],
    weaknesses: [
      'OCD efficacy data is early-stage and not yet compelling; trend-level results need confirmation',
      'Acadia may not prioritize OCD development given focus on neurology franchise (Nuplazid, ACP-204)',
      'OCD augmentation trials are historically difficult with high placebo response in partial responders',
    ],
    source:
      'ClinicalTrials.gov NCT04855903; Acadia Pharmaceuticals pipeline update 2024; Nuplazid FDA label for safety reference',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Psilocybin for OCD',
    generic_name: 'psilocybin',
    company: 'Usona Institute',
    indication: 'Obsessive-Compulsive Disorder',
    indication_specifics:
      'Psilocybin-assisted therapy for treatment-resistant OCD; single or limited dose sessions with psychological support',
    mechanism:
      'Serotonin 5-HT2A receptor agonist inducing neuroplasticity and disrupting rigid cortico-striato-thalamo-cortical circuit patterns underlying obsessions and compulsions; promotes cognitive flexibility',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in Y-BOCS total score at Week 4',
    key_data:
      'Yale pilot study (Moreno et al., J Clin Psychiatry 2006): Psilocybin produced acute 23-100% Y-BOCS reduction in 9 patients. University of Arizona Phase 2 (NCT03300947) and Usona-sponsored trials evaluating optimal dose and durability in larger samples.',
    line_of_therapy: '2L+ (treatment-resistant)',
    nct_ids: ['NCT03300947'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Dramatic acute Y-BOCS reductions observed in early studies, far exceeding typical SRI augmentation effects',
      'Single-dose paradigm could disrupt lifelong chronic SRI use model for OCD management',
      'Strong mechanistic rationale: 5-HT2A agonism directly targets cortico-striatal circuits implicated in OCD pathophysiology',
    ],
    weaknesses: [
      'Only small open-label/pilot data available; no randomized controlled Phase 2 results yet published',
      'Durability of anti-obsessional effect unclear — may require repeated dosing sessions',
      'Regulatory pathway for psychedelic-assisted OCD therapy remains undefined; FDA precedent lacking',
    ],
    source:
      'Moreno et al., J Clin Psychiatry 2006; ClinicalTrials.gov NCT03300947; Usona Institute research updates 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'REL-1017 for OCD',
    generic_name: 'esmethadone',
    company: 'Relmada Therapeutics',
    indication: 'Obsessive-Compulsive Disorder',
    indication_specifics: 'NMDA receptor channel blocker evaluated for SRI-resistant OCD based on glutamate hypothesis',
    mechanism:
      'Uncompetitive NMDA receptor channel blocker (dextroisomer of methadone) that reduces excessive glutamatergic neurotransmission in cortico-striatal circuits without opioid activity at therapeutic doses',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor ion channel',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in Y-BOCS total score',
    key_data:
      'Early clinical investigation based on NMDA modulation rationale supported by memantine and ketamine case series in OCD. REL-1017 OCD-specific clinical data is preclinical/early Phase 2. Primary development focus remains MDD.',
    line_of_therapy: 'Adjunctive to SRI',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'NMDA antagonism has mechanistic support from ketamine and memantine case reports showing rapid OCD symptom reduction',
      'Oral formulation with no reported psychotomimetic effects, potentially more practical than IV ketamine for OCD',
    ],
    weaknesses: [
      'OCD-specific clinical data is minimal; primary development focus is MDD, and OCD indication is exploratory',
      'MDD Phase 2b showed mixed results, raising questions about NMDA antagonist efficacy across indications',
      'Methadone structural backbone creates regulatory and perception challenges despite lack of opioid activity',
    ],
    source:
      'Relmada Therapeutics pipeline 2024; Rodriguez et al., JAMA Psychiatry 2013 (memantine/NMDA rationale); preclinical data',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. ATTENTION-DEFICIT/HYPERACTIVITY DISORDER (ADHD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Qelbree',
    generic_name: 'viloxazine',
    company: 'Supernus Pharmaceuticals',
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    indication_specifics:
      'Treatment of ADHD in pediatric patients (6-17 years) and adults; non-stimulant, once-daily extended-release capsule',
    mechanism:
      'Selective norepinephrine reuptake inhibitor (NRI) with serotonin receptor modulating activity (5-HT2C antagonism, 5-HT2B agonism); enhances prefrontal cortical noradrenergic and serotonergic tone involved in attention and executive function',
    mechanism_category: 'norepinephrine_reuptake_inhibitor',
    molecular_target: 'NET / 5-HT2C / 5-HT2B',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in ADHD-RS-5 (ADHD Rating Scale 5) total score',
    key_data:
      'Phase 3 pediatric trials (NCT03247530, NCT03247543): Significant ADHD-RS-5 improvement vs placebo across 200mg, 400mg, and 600mg doses (p<0.001 for all); n=477 (children) and n=310 (adolescents). Adult trial (NCT04016779): 400mg and 600mg significant vs placebo.',
    line_of_therapy: '1L non-stimulant or 2L after stimulant',
    nct_ids: ['NCT03247530', 'NCT03247543', 'NCT04016779'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First new non-stimulant ADHD medication approved in nearly two decades, filling gap between atomoxetine and alpha-2 agonists',
      'No DEA scheduling or controlled substance restrictions — key differentiator from stimulants for prescribers and parents',
      'Rapid onset of effect (Week 1) compared to atomoxetine (4-6 weeks), with favorable somnolence/appetite profile',
    ],
    weaknesses: [
      'Effect size lower than first-line stimulants (methylphenidate, amphetamine), limiting positioning to stimulant-averse or stimulant-intolerant patients',
      'Competing against well-established generic atomoxetine and branded guanfacine XR in non-stimulant segment',
      'Suicidality boxed warning (class-wide for NRIs in pediatrics) creates prescriber hesitation despite no signal in trials',
    ],
    source:
      'FDA label (April 2021 pediatric; April 2022 adult); Supernus Pharmaceuticals 10-K 2024; Nasser et al., J Clin Psychiatry 2021',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Centanafadine',
    generic_name: 'centanafadine',
    company: 'Otsuka Pharmaceutical',
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    indication_specifics:
      'Treatment of ADHD in adults and adolescents; triple reuptake inhibitor (norepinephrine, dopamine, serotonin) — non-stimulant',
    mechanism:
      'Triple monoamine reuptake inhibitor preferentially inhibiting norepinephrine > dopamine > serotonin reuptake; enhances catecholaminergic neurotransmission in prefrontal cortex with lower striatal dopamine release than stimulants',
    mechanism_category: 'triple_reuptake_inhibitor',
    molecular_target: 'NET / DAT / SERT',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in ADHD-RS-5 total score at Week 6',
    key_data:
      'Phase 3 adult trials (NCT04936750): Centanafadine ER showed significant ADHD-RS-5 improvement vs placebo in two of three Phase 3 studies. One study (Study 301) did not meet primary endpoint. Adolescent Phase 3 (Study 305) ongoing.',
    line_of_therapy: '1L non-stimulant',
    nct_ids: ['NCT04936750', 'NCT05765747'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Triple reuptake mechanism may provide stimulant-like efficacy without Schedule II controlled substance classification',
      'Non-stimulant positioning addresses growing demand from patients and parents seeking alternatives to amphetamines',
      'Otsuka has extensive CNS infrastructure and pediatric development capabilities',
    ],
    weaknesses: [
      'Mixed Phase 3 results (one study missed primary endpoint) create regulatory uncertainty',
      'Dopamine reuptake inhibition raises abuse liability concerns; DEA scheduling decision pending',
      'Entering crowded ADHD non-stimulant market with Qelbree recently launched and generic atomoxetine established',
    ],
    source:
      'Otsuka Pharmaceutical pipeline update Q4 2024; ClinicalTrials.gov NCT04936750; Adler et al., J Clin Psychiatry 2023',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Mazindol CR',
    generic_name: 'mazindol',
    company: 'NLS Pharmaceutics',
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    indication_specifics:
      'Treatment of ADHD in adults; controlled-release reformulation of mazindol, a historically approved anorectic with dopamine/norepinephrine activity',
    mechanism:
      'Norepinephrine-dopamine reuptake inhibitor with additional orexin-2 receptor modulating activity; enhances arousal and attention circuits in prefrontal cortex through dual catecholaminergic and orexinergic mechanisms',
    mechanism_category: 'norepinephrine_dopamine_reuptake_inhibitor',
    molecular_target: 'NET / DAT / Orexin-2 receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in ADHD-RS-5 total score at Week 6',
    key_data:
      'Phase 2 (NCT04009836): Mazindol CR showed statistically significant ADHD-RS-5 improvement vs placebo at Week 6 (p=0.021); n=85. Effect size comparable to low-dose stimulants. Orexin-2 modulation provides unique wakefulness-promoting component.',
    line_of_therapy: '2L after first-line stimulant or non-stimulant failure',
    nct_ids: ['NCT04009836'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Dual catecholaminergic and orexinergic mechanism is differentiated from all current ADHD treatments',
      'Positive Phase 2 efficacy signal with effect size suggesting meaningful clinical benefit',
      'Controlled-release formulation of known molecule reduces development risk compared to novel chemical entities',
    ],
    weaknesses: [
      'Mazindol was historically withdrawn/limited due to anorectic potential and abuse liability concerns',
      'Small Phase 2 sample size (n=85) requires confirmation in larger trials',
      'NLS Pharmaceutics is a micro-cap company with limited resources for Phase 3 development and commercialization',
    ],
    source:
      'NLS Pharmaceutics Phase 2 results 2023; ClinicalTrials.gov NCT04009836; Wigal et al., ADHD Atten Deficit Hyperact Disord 2023',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Dasotraline',
    generic_name: 'dasotraline',
    company: 'Sunovion Pharmaceuticals',
    indication: 'Attention-Deficit/Hyperactivity Disorder',
    indication_specifics:
      'Treatment of ADHD in children and adults; dual dopamine-norepinephrine reuptake inhibitor with long half-life enabling once-daily dosing',
    mechanism:
      'Potent dual inhibitor of dopamine transporter (DAT) and norepinephrine transporter (NET) with uniquely long plasma half-life (~47-77 hours) providing stable, sustained catecholamine enhancement without peak-trough fluctuations',
    mechanism_category: 'norepinephrine_dopamine_reuptake_inhibitor',
    molecular_target: 'DAT / NET',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in ADHD-RS-IV total score at Week 6',
    key_data:
      'Phase 3 adult (SEP360-301, NCT02276209): 4mg dasotraline significantly improved ADHD-RS-IV vs placebo (-5.1 points; p=0.007); n=341. However, Phase 3 pediatric trial (SEP360-302) failed primary endpoint. FDA issued CRL in 2019 requesting additional data.',
    line_of_therapy: '1L',
    nct_ids: ['NCT02276209', 'NCT02428088'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Ultra-long half-life provides 24-hour symptom coverage with once-daily dosing and smooth onset/offset',
      'Positive Phase 3 adult data with meaningful effect size on ADHD-RS-IV',
    ],
    weaknesses: [
      'FDA issued Complete Response Letter in 2019; pediatric Phase 3 failure complicates development',
      'Long half-life is double-edged: slow onset and prolonged adverse events if dose adjustment needed',
      'Development deprioritized by Sumitomo/Sunovion; uncertain whether program will advance further',
    ],
    source:
      'FDA CRL (2019); Sunovion Phase 3 results; Koblan et al., J Clin Psychiatry 2020; ClinicalTrials.gov NCT02276209',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. GENERALIZED ANXIETY DISORDER (GAD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Zuranolone for GAD',
    generic_name: 'zuranolone',
    company: 'Sage Therapeutics',
    indication: 'Generalized Anxiety Disorder',
    indication_specifics:
      'Treatment of generalized anxiety disorder in adults; 14-day oral course of neuroactive steroid GABA-A positive allosteric modulator',
    mechanism:
      'Positive allosteric modulator of synaptic and extrasynaptic GABA-A receptors acting as a neuroactive steroid to restore GABAergic inhibitory tone; targets both tonic (extrasynaptic) and phasic (synaptic) GABA-A receptor subtypes',
    mechanism_category: 'gaba_modulator',
    molecular_target: 'GABA-A receptor (synaptic and extrasynaptic)',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in HAM-A (Hamilton Anxiety Rating Scale) total score at Day 15',
    key_data:
      'CORAL-GAD Phase 3 trial initiated following positive signal in MDD trials showing anxiolytic effects. Zuranolone 50mg is being evaluated as a short-course (14-day) treatment for GAD. Results pending 2025-2026.',
    line_of_therapy: '1L or acute exacerbation',
    partner: 'Biogen',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Short 14-day course paradigm fundamentally disrupts chronic daily SSRI/SNRI model for anxiety, potentially improving adherence',
      'Already FDA-approved for PPD (Zurzuvae), providing established safety database and manufacturing infrastructure',
      'Extrasynaptic GABA-A modulation provides anxiolysis without benzodiazepine-class dependence or cognitive impairment',
    ],
    weaknesses: [
      'GAD Phase 3 results not yet available; MDD broader indication was rejected by FDA, raising efficacy bar concerns',
      'Somnolence and CNS depression side effects with boxed warning for driving impairment may limit adoption',
      'Short-course treatment may not provide durable anxiolysis in GAD, a chronic relapsing condition',
    ],
    source:
      'Sage Therapeutics/Biogen pipeline update Q4 2024; Zurzuvae FDA label (PPD) for safety reference; ClinicalTrials.gov',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'MM-120 for GAD',
    generic_name: 'lysergide',
    company: 'MindMed',
    indication: 'Generalized Anxiety Disorder',
    indication_specifics: 'Single-dose lysergide (pharmaceutical-grade LSD) for generalized anxiety disorder in adults',
    mechanism:
      'Serotonin 5-HT2A receptor agonist that induces acute neuroplasticity-promoting psychedelic experience; proposed to reset anxiety-maintaining neural circuits in prefrontal cortex and amygdala through enhanced fear extinction and cognitive flexibility',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A / 5-HT2C / D2',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in HAM-A total score at Week 4 and Week 12',
    key_data:
      'Phase 2b VOYAGE (NCT05407064): MM-120 100mcg showed statistically significant HAM-A reduction vs placebo at Week 4 (-7.7 points; p=0.0003); n=198. Dose-dependent anxiolysis observed. Effect maintained through Week 12 from single dose. Breakthrough Therapy Designation sought.',
    line_of_therapy: '2L after SSRI/SNRI or benzodiazepine failure',
    nct_ids: ['NCT05407064'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Striking Phase 2b efficacy: single dose produced clinically meaningful HAM-A improvement sustained through 12 weeks',
      'Dose-dependent response strengthens mechanistic confidence and supports dose optimization in Phase 3',
      'Single-dose paradigm could eliminate chronic medication burden, a major driver of non-adherence in GAD',
    ],
    weaknesses: [
      'Schedule I classification creates complex regulatory, DEA scheduling, and institutional adoption hurdles',
      'Requires supervised clinical setting for administration, limiting scalability vs oral daily medications',
      'Durability beyond 12 weeks unknown; chronic relapsing GAD may require periodic re-dosing',
    ],
    source:
      'MindMed Phase 2b VOYAGE topline results (2024); ClinicalTrials.gov NCT05407064; MindMed corporate presentation Q4 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Fasedienol',
    generic_name: 'fasedienol',
    company: 'PureTech Health',
    indication: 'Generalized Anxiety Disorder',
    indication_specifics:
      'Intranasal neuroactive steroid for acute and chronic treatment of generalized anxiety disorder; activates nasal chemosensory neurons',
    mechanism:
      'Synthetic neuroactive steroid administered intranasally that activates nasal chemosensory (trigeminal) neurons, modulating brainstem arousal centers and amygdala reactivity via olfactory-limbic pathways; also acts as GABA-A positive allosteric modulator',
    mechanism_category: 'gaba_modulator',
    molecular_target: 'Nasal chemosensory neurons / GABA-A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in HAM-A total score at Week 4',
    key_data:
      'Phase 2 QUELL (NCT05593224): Fasedienol intranasal showed dose-dependent HAM-A improvement with 3.6mg dose achieving significance vs placebo at Week 4 (p<0.05); n=164. Rapid onset of anxiolysis within hours of first dose reported.',
    line_of_therapy: '1L or adjunctive',
    nct_ids: ['NCT05593224'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Novel nasal chemosensory mechanism is first-in-class with no direct precedent, offering true differentiation',
      'Intranasal route enables rapid onset (minutes to hours) for acute anxiety without systemic benzodiazepine exposure',
      'PRN (as-needed) and scheduled dosing flexibility addresses both acute episodes and chronic GAD management',
    ],
    weaknesses: [
      'Completely novel mechanism with limited clinical validation; Phase 2 effect size needs confirmation',
      'Intranasal administration may face patient acceptance challenges versus oral tablets in chronic use',
      'PureTech is an early-stage company; commercialization likely requires partnership for GAD launch',
    ],
    source:
      'PureTech Health Phase 2 QUELL results 2024; ClinicalTrials.gov NCT05593224; PureTech investor presentation 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'NYX-783',
    generic_name: 'NYX-783',
    company: 'Tenacia Therapeutics',
    indication: 'Generalized Anxiety Disorder',
    indication_specifics:
      'NMDA receptor modulator for generalized anxiety disorder and PTSD-related anxiety; GluN2B-containing NMDA receptor modulator',
    mechanism:
      'Positive modulator of NMDA receptors containing the GluN2B subunit that enhances glutamatergic neurotransmission to promote fear extinction and synaptic plasticity in anxiety-related circuits; distinct from NMDA antagonists like ketamine',
    mechanism_category: 'glutamate_modulator',
    molecular_target: 'NMDA receptor (GluN2B subunit) — positive modulator',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in HAM-A total score',
    key_data:
      'Phase 2 proof-of-concept data in PTSD/anxiety showed trend-level anxiolytic signal. Originally developed by Aptinyx; program acquired by Tenacia Therapeutics (formed from Aptinyx restructuring) for continued development. Phase 2 GAD trial design being finalized.',
    line_of_therapy: 'Adjunctive or monotherapy',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'NMDA receptor positive modulation is mechanistically differentiated from both GABA modulators and serotonergic agents',
      'Enhances fear extinction learning, potentially addressing root pathophysiology of anxiety rather than symptom suppression',
    ],
    weaknesses: [
      'Early clinical data is limited with only trend-level signals; no definitive Phase 2 efficacy demonstrated',
      'Aptinyx restructuring and program transfer to Tenacia creates organizational risk and funding uncertainty',
      'NMDA receptor modulation for anxiety is conceptually compelling but clinically unproven at scale',
    ],
    source:
      'Tenacia Therapeutics pipeline 2024; Aptinyx prior clinical data disclosures; Khan et al., Neuropsychopharmacology 2022',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Igalmi',
    generic_name: 'dexmedetomidine sublingual',
    company: 'BioXcel Therapeutics',
    indication: 'Generalized Anxiety Disorder',
    indication_specifics:
      'Sublingual dexmedetomidine film approved for acute agitation in schizophrenia/bipolar; being evaluated for acute anxiety episodes and GAD-related agitation',
    mechanism:
      'Selective alpha-2A adrenergic receptor agonist that reduces noradrenergic hyperactivation and sympathetic outflow; sublingual delivery bypasses first-pass metabolism for rapid anxiolytic/sedative onset',
    mechanism_category: 'alpha2_agonist',
    molecular_target: 'Alpha-2A adrenergic receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in anxiety measures (PEC, HAM-A) at 2 hours post-dose',
    key_data:
      'Igalmi approved for acute agitation in schizophrenia/bipolar (2022). Phase 2 exploration for acute anxiety episodes based on mechanism: alpha-2A agonism reduces locus coeruleus noradrenergic firing underlying acute anxiety. GAD-specific development in planning.',
    line_of_therapy: 'PRN (acute episodes)',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Already FDA-approved (for agitation) with established safety and rapid sublingual onset of action within 20-30 minutes',
      'Non-benzodiazepine acute anxiolytic mechanism avoids abuse liability and respiratory depression concerns',
    ],
    weaknesses: [
      'Primary approval is for agitation, not anxiety; GAD indication would require dedicated pivotal trials',
      'Sedation and hypotension side effects may limit use outside of acute care settings',
      'BioXcel Therapeutics facing financial challenges and restructuring, creating development uncertainty',
    ],
    source:
      'Igalmi FDA label (April 2022); BioXcel Therapeutics pipeline update 2024; clinical rationale from alpha-2 agonist literature',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 8. ANOREXIA NERVOSA
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Olanzapine (off-label)',
    generic_name: 'olanzapine',
    company: 'Various (generic)',
    indication: 'Anorexia Nervosa',
    indication_specifics:
      'Off-label use of low-dose olanzapine (2.5-10mg) for weight restoration and reduction of obsessive/anxious cognitions in anorexia nervosa',
    mechanism:
      'Multi-receptor antagonist (D2, 5-HT2A, 5-HT2C, H1, M1) that promotes weight gain through H1 antihistamine and 5-HT2C antagonist effects on appetite regulation; reduces anxiety and obsessive rumination via serotonergic modulation',
    mechanism_category: 'dopamine_antagonist',
    molecular_target: 'D2 / 5-HT2A / 5-HT2C / H1',
    phase: 'Approved',
    primary_endpoint: 'Weight gain (BMI change from baseline)',
    key_data:
      'Multiple RCTs: Attia et al. (Am J Psychiatry 2019) 16-week RCT showed olanzapine 2.5-10mg significantly increased BMI vs placebo (+0.7 kg/m2; p=0.02); n=152. Metabolic profile tolerable at low doses. Most commonly used pharmacotherapy in AN despite no FDA indication.',
    line_of_therapy: 'Adjunctive to nutritional rehabilitation',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Most studied and commonly prescribed medication for AN with multiple RCTs supporting modest weight gain',
      'Widely available as inexpensive generic with decades of safety data across psychiatric indications',
      'Anxiolytic and anti-obsessional properties address psychological symptoms alongside weight restoration',
    ],
    weaknesses: [
      'No FDA approval for AN; all use is off-label, limiting payer coverage and guideline endorsement',
      'Modest BMI effect (+0.7 kg/m2) may not be clinically transformative for severely underweight patients',
      'Metabolic side effects (dyslipidemia, glucose dysregulation) concerning in medically fragile AN patients',
    ],
    source:
      "Attia et al., Am J Psychiatry 2019; Brewerton & D'Agostino, J Clin Psychopharmacol 2017; no FDA-approved indication for AN",
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'DCCR',
    generic_name: 'diazoxide choline controlled-release',
    company: 'Soleno Therapeutics',
    indication: 'Anorexia Nervosa',
    indication_specifics:
      'Diazoxide choline controlled-release tablet for hypothalamic-driven appetite and metabolic dysregulation; primary development in Prader-Willi syndrome, exploratory interest in AN',
    mechanism:
      'Potassium channel opener (KATP channel activator) that modulates hypothalamic neuropeptide signaling, reduces ghrelin sensitivity, and normalizes metabolic set-point; originally developed for hyperphagia in Prader-Willi but mechanism relevant to AN metabolic dysregulation',
    mechanism_category: 'potassium_channel_opener',
    molecular_target: 'KATP channels (SUR1/Kir6.2) in pancreatic beta cells and hypothalamic neurons',
    phase: 'Phase 3',
    primary_endpoint:
      'Change in hyperphagia score and BMI (Prader-Willi primary development); AN application would target metabolic normalization',
    key_data:
      'DESTINY-PWS Phase 3 (NCT03440814): DCCR significantly improved hyperphagia and lean body mass in Prader-Willi syndrome. FDA accepted NDA for PWS. AN-specific development remains exploratory, based on shared hypothalamic metabolic circuit dysfunction.',
    line_of_therapy: 'Adjunctive',
    nct_ids: ['NCT03440814'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Novel hypothalamic mechanism targeting metabolic set-point rather than just appetite, potentially addressing core AN pathophysiology',
      'Positive Phase 3 data in Prader-Willi provides clinical proof of mechanism for metabolic normalization',
      'Orphan drug designation in PWS provides regulatory experience and potential pathway for rare eating disorder development',
    ],
    weaknesses: [
      'AN-specific clinical data does not yet exist; extrapolation from Prader-Willi is mechanistically speculative',
      'Anorexia nervosa pathophysiology is primarily psychological with metabolic consequences, unlike primary hyperphagia in PWS',
      'Small patient population in AN willing to accept pharmacotherapy creates enrollment and commercial challenges',
    ],
    source:
      'Soleno Therapeutics NDA filing 2024; DESTINY-PWS (ClinicalTrials.gov NCT03440814); AN mechanistic hypothesis from Misra & Klibanski, Nat Rev Endocrinol 2014',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Psilocybin for AN',
    generic_name: 'psilocybin',
    company: 'Compass Pathways',
    indication: 'Anorexia Nervosa',
    indication_specifics:
      'Psilocybin-assisted therapy for treatment-resistant anorexia nervosa; single-dose sessions with integrated eating disorder-focused psychotherapy',
    mechanism:
      'Serotonin 5-HT2A receptor agonist that disrupts rigid, self-referential neural patterns (default mode network hyperconnectivity) underlying body dysmorphia and compulsive restriction; promotes cognitive flexibility and emotional processing',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in BMI and Eating Disorder Examination (EDE) global score at Week 12',
    key_data:
      'UCSD Phase 2 pilot (NCT04505189): Psilocybin 25mg with therapy showed promising BMI improvement and EDE score reduction in treatment-resistant AN; n=10 (pilot). Compass Pathways and academic centers expanding controlled trials. Breakthrough Therapy Designation not yet sought for AN.',
    line_of_therapy: '2L+ (treatment-resistant)',
    nct_ids: ['NCT04505189'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Addresses core psychological rigidity in AN — a key therapeutic target that current medications fail to modify',
      'Pilot data showing meaningful BMI and EDE improvements in treatment-resistant patients represents first pharmacological signal in severe AN',
      'Default mode network disruption mechanism is biologically aligned with neuroimaging findings in AN',
    ],
    weaknesses: [
      'Only pilot-level data (n=10); much larger controlled trials needed to establish efficacy and safety in medically fragile AN patients',
      'Medical instability in severe AN (electrolyte abnormalities, cardiac risk) creates safety concerns for psychedelic administration',
      'Regulatory pathway completely undefined for psychedelic-assisted therapy in eating disorders',
    ],
    source:
      'ClinicalTrials.gov NCT04505189; Peck et al., Nat Med preliminary findings 2023; Compass Pathways exploratory pipeline',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Lisdexamfetamine (investigational AN)',
    generic_name: 'lisdexamfetamine',
    company: 'Takeda',
    indication: 'Anorexia Nervosa',
    indication_specifics:
      'Investigational use of lisdexamfetamine for binge-eating/purging subtype of AN; approved for ADHD and binge eating disorder but evaluated in AN subtypes with compulsive features',
    mechanism:
      'Prodrug of dextroamphetamine that increases synaptic dopamine and norepinephrine via vesicular release and reuptake inhibition; in eating disorders, modulates reward circuitry and reduces compulsive behavioral patterns',
    mechanism_category: 'stimulant',
    molecular_target: 'DAT / NET / VMAT2',
    phase: 'Phase 2',
    primary_endpoint: 'Change in binge-purge frequency and EDE score',
    key_data:
      'Approved for binge eating disorder (BED) based on Phase 3 data. For AN binge-purge subtype, only case series and small open-label studies exist. FDA explicitly does NOT indicate Vyvanse for weight loss, and AN use is strictly investigational with medical monitoring.',
    line_of_therapy: 'Investigational',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Established efficacy in binge eating disorder provides mechanistic rationale for AN binge-purge subtype',
      'Widely available with extensive safety database from ADHD and BED indications',
    ],
    weaknesses: [
      'Schedule II controlled substance with significant abuse potential, particularly concerning in eating disorder population',
      'Appetite-suppressing effects directly counterproductive to weight restoration goals in anorexia nervosa',
      'No controlled trials in AN; FDA boxed warning against use for weight loss creates major regulatory and liability barriers',
    ],
    source:
      'Vyvanse FDA label (BED indication 2015); McElroy et al., JAMA Psychiatry 2016 (BED data); AN use investigational only',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 9. SUBSTANCE USE DISORDER
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'VK2735 Oral',
    generic_name: 'VK2735',
    company: 'Viking Therapeutics',
    indication: 'Substance Use Disorder',
    indication_specifics:
      'GLP-1 receptor agonist being evaluated for alcohol use disorder (AUD); oral formulation targeting central reward circuitry to reduce alcohol craving and consumption',
    mechanism:
      'Dual GLP-1/GIP receptor agonist that modulates mesolimbic dopamine reward pathways, reducing alcohol reward signaling and craving through central GLP-1 receptor activation in nucleus accumbens and ventral tegmental area',
    mechanism_category: 'glp1_agonist',
    molecular_target: 'GLP-1 receptor / GIP receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Reduction in heavy drinking days and total alcohol consumption',
    key_data:
      'GLP-1 agonist class showing compelling preclinical and epidemiological evidence for AUD reduction. Semaglutide (Novo Nordisk) showed 50-60% reduction in alcohol consumption in observational studies of obesity patients. VK2735 oral Phase 2 for obesity showed strong metabolic efficacy; AUD application based on emerging GLP-1/addiction neuroscience.',
    line_of_therapy: '1L or 2L for AUD',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'GLP-1 class has compelling preclinical and real-world evidence for reducing alcohol craving and consumption',
      'Oral formulation addresses major barrier of injectable GLP-1s for SUD population with adherence challenges',
      'Dual GLP-1/GIP mechanism may provide enhanced reward modulation vs single GLP-1 agonists',
    ],
    weaknesses: [
      'No completed AUD-specific clinical trials; efficacy extrapolated from obesity data and observational studies',
      'GI side effects (nausea, vomiting) common with GLP-1 class may limit tolerance in AUD patients',
      'Regulatory pathway for GLP-1 agonists in SUD is uncharted; FDA indication for AUD would require dedicated Phase 3 program',
    ],
    source:
      'Viking Therapeutics pipeline 2024; Klausen et al., JCI Insight 2022 (GLP-1/alcohol preclinical); Quddos et al., JAMA Psychiatry 2023 (semaglutide/AUD observational)',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Opvee',
    generic_name: 'nalmefene',
    company: 'Indivior',
    indication: 'Substance Use Disorder',
    indication_specifics:
      'Nalmefene nasal spray for emergency treatment of known or suspected opioid overdose; also approved in EU for alcohol dependence (oral Selincro)',
    mechanism:
      'Opioid receptor antagonist with high affinity for mu and kappa opioid receptors and partial agonist at delta receptors; longer duration of action than naloxone provides extended opioid reversal and reduces alcohol reward in AUD',
    mechanism_category: 'opioid_antagonist',
    molecular_target: 'Mu / Kappa / Delta opioid receptors',
    phase: 'Approved',
    primary_endpoint:
      'Reversal of opioid-induced respiratory depression (overdose); reduction in heavy drinking days (AUD)',
    key_data:
      'Opvee nasal spray approved FDA May 2023 for opioid overdose reversal. Oral nalmefene (Selincro) approved EMA 2013 for AUD: reduced heavy drinking days by 23% vs placebo in ESENSE trials; n=1,322. US AUD development under evaluation.',
    line_of_therapy: 'Rescue (overdose) or PRN (AUD)',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Longer half-life than naloxone (8-9 hours vs 1-2 hours) provides extended opioid reversal protection against fentanyl re-sedation',
      'Dual-use potential: approved for overdose rescue (US) and alcohol dependence reduction (EU), broadening addressable market',
      'Nasal spray OTC accessibility lowers barriers to emergency opioid reversal access',
    ],
    weaknesses: [
      'Oral AUD formulation not yet approved in US; would need dedicated Phase 3 program for American regulatory approval',
      'Competing against naloxone (Narcan), which became OTC in 2023 with extensive market awareness and distribution',
      'Nalmefene AUD effect size in EU trials was modest; US market has entrenched naltrexone for AUD',
    ],
    source:
      'Opvee FDA label (May 2023); Selincro EMA assessment report; ESENSE-1/2 trials (Mann et al., Biol Psychiatry 2013)',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'BXCL501 for SUD',
    generic_name: 'dexmedetomidine sublingual',
    company: 'BioXcel Therapeutics',
    indication: 'Substance Use Disorder',
    indication_specifics:
      'Sublingual dexmedetomidine film for acute agitation and withdrawal management in substance use disorder settings; alpha-2A agonist',
    mechanism:
      'Selective alpha-2A adrenergic receptor agonist that reduces noradrenergic hyperactivation characteristic of acute substance withdrawal; attenuates sympathetic storm (tachycardia, hypertension, diaphoresis, anxiety) without opioid or benzodiazepine mechanisms',
    mechanism_category: 'alpha2_agonist',
    molecular_target: 'Alpha-2A adrenergic receptor',
    phase: 'Phase 2',
    primary_endpoint:
      'Change in agitation scores (PEC) and withdrawal symptom severity (COWS for opioid withdrawal, CIWA for alcohol withdrawal)',
    key_data:
      'Igalmi approved for acute agitation in schizophrenia/bipolar. Phase 2 expansion into SUD-related agitation and withdrawal management in emergency department settings. Alpha-2 agonist mechanism parallel to lofexidine (approved for opioid withdrawal) but with sublingual rapid onset.',
    line_of_therapy: 'Acute management',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Non-opioid, non-benzodiazepine acute withdrawal management — addresses critical need for alternatives in SUD population',
      'Sublingual film provides rapid onset (20-30 minutes) suitable for emergency department and detox settings',
      'Alpha-2A mechanism has proven efficacy for opioid withdrawal symptoms (validated by lofexidine/clonidine precedent)',
    ],
    weaknesses: [
      'SUD-specific clinical data is limited; primary approval was for psychiatric agitation, not substance withdrawal',
      'Hypotension and bradycardia side effects concerning in hemodynamically unstable withdrawal patients',
      'BioXcel Therapeutics facing financial restructuring; SUD development timeline uncertain',
    ],
    source:
      'Igalmi FDA label (2022); BioXcel Therapeutics pipeline 2024; alpha-2 agonist withdrawal management literature',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Lucemyra',
    generic_name: 'lofexidine',
    company: 'US WorldMeds',
    indication: 'Substance Use Disorder',
    indication_specifics:
      'Mitigation of opioid withdrawal symptoms to facilitate abrupt opioid discontinuation in adults; first FDA-approved non-opioid treatment for opioid withdrawal management',
    mechanism:
      'Central alpha-2A adrenergic receptor agonist that reduces norepinephrine release from locus coeruleus neurons, attenuating the sympathetic hyperactivity (anxiety, muscle aches, insomnia, diaphoresis) that characterizes opioid withdrawal',
    mechanism_category: 'alpha2_agonist',
    molecular_target: 'Alpha-2A adrenergic receptor',
    phase: 'Approved',
    primary_endpoint: 'Short Opiate Withdrawal Scale of Gossop (SOWS-Gossop) total score change from baseline',
    key_data:
      'Phase 3 (NCT02264717/NCT02264679): Lofexidine 0.54mg QID significantly reduced SOWS-Gossop scores vs placebo on Days 1-7 (p<0.001); n=602 combined. Also significantly more patients completed opioid withdrawal on lofexidine vs placebo.',
    line_of_therapy: '1L for opioid withdrawal management',
    nct_ids: ['NCT02264717', 'NCT02264679'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'First and only FDA-approved non-opioid medication specifically for opioid withdrawal symptom management',
      'No abuse potential or controlled substance scheduling — critical advantage over opioid-based withdrawal management',
      'Enables medication-free detoxification pathway for patients who refuse or are ineligible for buprenorphine/methadone',
    ],
    weaknesses: [
      'Symptom management only — does not treat underlying opioid use disorder or prevent relapse',
      'QTc prolongation risk requires ECG monitoring and dose limitations, adding clinical burden',
      'Limited commercial uptake due to short 14-day treatment course, low awareness, and competition with off-label clonidine (generic)',
    ],
    source: 'FDA label (May 2018); Fishman et al., JAMA Intern Med 2019; ClinicalTrials.gov NCT02264717',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Semaglutide for AUD',
    generic_name: 'semaglutide',
    company: 'Novo Nordisk',
    indication: 'Substance Use Disorder',
    indication_specifics:
      'GLP-1 receptor agonist approved for obesity/diabetes being investigated for alcohol use disorder based on compelling preclinical and observational evidence of reduced alcohol consumption',
    mechanism:
      'GLP-1 receptor agonist that activates central GLP-1 receptors in mesolimbic reward circuitry (nucleus accumbens, ventral tegmental area), reducing dopamine-mediated alcohol reward and craving; also normalizes stress-related HPA axis dysregulation in AUD',
    mechanism_category: 'glp1_agonist',
    molecular_target: 'GLP-1 receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Reduction in heavy drinking days; change in total alcohol consumption',
    key_data:
      'NIH-funded Phase 2 trial (NCT06053775) evaluating semaglutide 2.4mg weekly for AUD. Observational data: large cohort study (n>84,000) showed 50-56% lower rates of AUD diagnoses and alcohol intoxication in semaglutide users vs non-GLP-1 users (Wang et al., Nature Comm 2024).',
    line_of_therapy: '1L or 2L for AUD',
    nct_ids: ['NCT06053775'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Massive real-world evidence base from obesity/diabetes showing dramatic reductions in alcohol craving and consumption',
      'Already FDA-approved with well-characterized safety profile in millions of patients globally',
      'Addresses comorbid obesity/metabolic syndrome frequently co-occurring with AUD',
    ],
    weaknesses: [
      'No completed randomized AUD-specific trial; observational data subject to confounding and selection bias',
      'Novo Nordisk has not committed to dedicated AUD development program; trials primarily NIH/academic-funded',
      'Supply constraints for obesity indication may deprioritize SUD development; cost ($1,000+/month) prohibitive for SUD population',
    ],
    source:
      'Wang et al., Nature Communications 2024; ClinicalTrials.gov NCT06053775; Leggio et al., Neuropsychopharmacology 2023',
    last_updated: '2025-01-15',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // 10. TREATMENT-RESISTANT DEPRESSION (TRD)
  // ══════════════════════════════════════════════════════════════════════════════

  {
    asset_name: 'Spravato for TRD',
    generic_name: 'esketamine',
    company: 'Janssen',
    indication: 'Treatment-Resistant Depression',
    indication_specifics:
      'Treatment-resistant depression in adults, defined as failure to respond to at least 2 adequate antidepressant trials; intranasal esketamine with oral antidepressant',
    mechanism:
      'NMDA receptor antagonist (S-enantiomer of ketamine) that rapidly enhances glutamatergic signaling and promotes synaptic plasticity via AMPA receptor activation and BDNF/mTOR-mediated synaptogenesis in prefrontal cortex',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor (GluN2B subunit)',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 4 (induction phase)',
    key_data:
      'TRANSFORM-1/2/3 (NCT02417064/NCT02418585/NCT02422186): TRANSFORM-2 met primary endpoint (-4.0 MADRS difference vs placebo; p=0.020). SUSTAIN-1 (NCT02493868): Relapse prevention trial showed 51% lower relapse risk vs placebo (HR 0.49; p<0.001); n=297.',
    line_of_therapy: '2L+ (after 2 failed antidepressant trials)',
    nct_ids: ['NCT02418585', 'NCT02493868'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Only FDA-approved medication specifically indicated for treatment-resistant depression, a validated and severe clinical entity',
      'Demonstrated both acute efficacy and relapse prevention in TRD — critical for a chronic, relapsing condition',
      'Over 5 years of real-world post-marketing experience with >150,000 patients treated, establishing safety confidence',
    ],
    weaknesses: [
      'REMS-mandated in-office administration with 2-hour monitoring creates logistical and economic barriers for patients and providers',
      'Dissociative and sedative side effects limit patient acceptance; abuse potential (Schedule III) limits prescriber comfort',
      'High cost ($5,900-$7,600/month for maintenance) with prior authorization burden reduces access, particularly for underserved populations',
    ],
    source:
      'FDA label (March 2019); TRANSFORM-2 (Popova et al., Am J Psychiatry 2019); SUSTAIN-1 (Daly et al., JAMA Psychiatry 2019)',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'PCN-101',
    generic_name: 'arketamine',
    company: 'Perception Neuroscience',
    indication: 'Treatment-Resistant Depression',
    indication_specifics:
      'R-enantiomer of ketamine (arketamine) for treatment-resistant depression; proposed to have antidepressant efficacy with reduced dissociative side effects vs S-ketamine',
    mechanism:
      'NMDA receptor antagonist (R-enantiomer of ketamine) with relatively lower NMDA binding affinity than S-ketamine; proposed to exert antidepressant effects primarily through AMPA receptor potentiation and BDNF-TrkB signaling rather than direct NMDA blockade',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor / AMPA receptor (downstream)',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in MADRS total score at Day 15',
    key_data:
      'Phase 2 (NCT04560569): IV arketamine showed rapid MADRS improvement in TRD patients at 24 hours post-infusion. Japanese Phase 2 data (Otsuka collaboration) demonstrated antidepressant effects with lower dissociation scores compared to esketamine. Dose-finding ongoing.',
    line_of_therapy: '2L+ (after antidepressant failure)',
    partner: 'Otsuka (Japan rights)',
    nct_ids: ['NCT04560569'],
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'R-ketamine enantiomer may retain rapid antidepressant efficacy while reducing dissociative side effects that limit S-ketamine adoption',
      'Strong preclinical evidence suggesting superior neuroplasticity promotion vs S-ketamine in animal models',
      'Potential for simpler REMS if dissociation and abuse liability are indeed lower than esketamine',
    ],
    weaknesses: [
      'Clinical differentiation from esketamine not yet convincingly demonstrated in controlled human trials',
      'Requires IV administration (like generic ketamine clinics), without the intranasal convenience of Spravato',
      'Perception Neuroscience is a small company; large-scale Phase 3 development will require partnership or additional funding',
    ],
    source:
      'ClinicalTrials.gov NCT04560569; Leal et al., Transl Psychiatry 2021 (preclinical); Perception Neuroscience pipeline 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'BUP-SAM (ALTO-100 predecessor)',
    generic_name: 'buprenorphine-samidorphan',
    company: 'Bristol-Myers Squibb',
    indication: 'Treatment-Resistant Depression',
    indication_specifics:
      'Fixed-dose combination of buprenorphine (mu-opioid partial agonist) and samidorphan (mu-opioid antagonist) for adjunctive treatment of MDD/TRD; opioid system modulation without abuse liability',
    mechanism:
      'Buprenorphine provides mu-opioid partial agonism and kappa-opioid antagonism that modulates stress-responsive and reward circuits in depression; samidorphan blocks buprenorphine-induced euphoria and physical dependence, enabling chronic use without opioid side effects',
    mechanism_category: 'opioid_modulator',
    molecular_target: 'Mu-opioid receptor (partial agonist) / Kappa-opioid receptor (antagonist)',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6',
    key_data:
      'FORWARD-3 (NCT02158533): BUP/SAM (2mg/2mg) adjunctive to AD showed significant MADRS improvement vs placebo at Week 3 (-2.8 points; p=0.018) but primary endpoint at Week 5 was not met (p=0.11); n=385. FORWARD-4/5 results mixed. Program placed on strategic hold by BMS.',
    line_of_therapy: 'Adjunctive to oral antidepressant',
    nct_ids: ['NCT02158533'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Novel opioid system modulation approach addressing the endogenous opioid dysregulation hypothesis in depression',
      'Samidorphan successfully mitigates opioid-class abuse liability, enabling non-scheduled chronic use',
      'BMS resources and opioid system expertise (from Alkermes acquisition of samidorphan data) provide development depth',
    ],
    weaknesses: [
      'Mixed Phase 3 results — FORWARD-3 missed primary timepoint; overall TRD efficacy not convincingly demonstrated',
      'BMS has placed program on strategic hold/deprioritized, suggesting low confidence in regulatory path forward',
      'Opioid modulation mechanism carries regulatory scrutiny burden even with abuse-deterrent samidorphan component',
    ],
    source: 'FORWARD-3 (Fava et al., Am J Psychiatry 2020); BMS pipeline update 2024; ClinicalTrials.gov NCT02158533',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'COMP360 for TRD',
    generic_name: 'psilocybin',
    company: 'Compass Pathways',
    indication: 'Treatment-Resistant Depression',
    indication_specifics:
      'Psilocybin-assisted therapy (COMP360) for treatment-resistant depression; single 25mg dose administered with psychological support in Phase 3 Breakthrough Therapy Designation program',
    mechanism:
      'Serotonin 5-HT2A receptor agonist that induces acute neuroplasticity, disrupts default mode network hyperconnectivity underlying depressive rumination, and facilitates emotional processing and cognitive reappraisal within therapeutic context',
    mechanism_category: 'psychedelic_assisted',
    molecular_target: '5-HT2A receptor',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in MADRS total score at Week 6 (sustained response at Week 12)',
    key_data:
      'Phase 2b (NCT03775200): COMP360 25mg produced 36.7% response rate (>=50% MADRS reduction) at Week 3 vs 17.7% placebo; remission 29.1% vs 7.6% (p=0.002); n=233. FDA Breakthrough Therapy Designation granted. Phase 3 COMP005/006 trials underway with primary completion expected 2025.',
    line_of_therapy: '2L+ (treatment-resistant)',
    nct_ids: ['NCT03775200', 'NCT05624268', 'NCT05624281'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'FDA Breakthrough Therapy Designation for TRD accelerates regulatory pathway and signals agency recognition of unmet need',
      'Single-dose treatment paradigm could fundamentally disrupt chronic medication model for TRD if durability confirmed',
      'Largest psilocybin Phase 3 program globally with multiple confirmatory trials, providing robust dataset for approval decision',
    ],
    weaknesses: [
      'Phase 2b showed effect attenuation by Week 12, raising critical durability questions for a chronic condition like TRD',
      'Requires REMS-like certified treatment centers with trained therapists, limiting scalability and increasing per-patient cost',
      'FDA has no established regulatory framework for psychedelic-assisted therapy; approval pathway and labeling remain uncertain',
    ],
    source:
      'Goodwin et al., NEJM 2022; Compass Pathways Breakthrough Therapy Designation (2018); ClinicalTrials.gov NCT05624268/NCT05624281',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'AV-101',
    generic_name: 'L-4-chlorokynurenine',
    company: 'VistaGen Therapeutics',
    indication: 'Treatment-Resistant Depression',
    indication_specifics:
      'Oral prodrug of 7-chlorokynurenic acid, a GluN2B-selective NMDA receptor glycine site antagonist for TRD; targets NMDA receptor without dissociative effects',
    mechanism:
      'Oral prodrug converted to 7-chlorokynurenic acid, a selective antagonist at the glycine co-agonist site of GluN2B-containing NMDA receptors; provides glutamatergic modulation similar to ketamine but through glycine site rather than ion channel blockade, potentially avoiding dissociation',
    mechanism_category: 'nmda_antagonist',
    molecular_target: 'NMDA receptor glycine site (GluN2B)',
    phase: 'Phase 2',
    primary_endpoint: 'Change from baseline in HAM-D17 total score at Week 2',
    key_data:
      'Phase 2 ELEVATE (NCT03078322): AV-101 1,440mg/day adjunctive to AD did not meet primary HAM-D endpoint vs placebo in TRD; n=180. Post-hoc analysis showed signal in patients without concurrent benzodiazepine use. VistaGen evaluating dose optimization.',
    line_of_therapy: 'Adjunctive to antidepressant',
    nct_ids: ['NCT03078322'],
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Oral, non-dissociative NMDA modulation could address TRD without Spravato REMS and monitoring burden',
      'Glycine site mechanism is differentiated from ion channel blockers (ketamine/esketamine), offering distinct pharmacological approach',
    ],
    weaknesses: [
      'Phase 2 ELEVATE trial failed primary endpoint, significantly diminishing program viability',
      'Post-hoc subgroup signal (non-benzodiazepine users) is hypothesis-generating only, not confirmatory',
      'VistaGen (now Bionomics) has shifted focus to anxiety programs; TRD development deprioritized',
    ],
    source:
      'ELEVATE Phase 2 (Park et al., J Clin Psychiatry 2022); ClinicalTrials.gov NCT03078322; VistaGen/Bionomics pipeline 2024',
    last_updated: '2025-01-15',
  },
];
