import type { CompetitorRecord } from './competitor-database';

export const NEUROLOGY_COMPETITORS: CompetitorRecord[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Amyotrophic Lateral Sclerosis (ALS)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Relyvrio',
    generic_name: 'AMX0035',
    company: 'Amylyx Pharmaceuticals',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics: 'Treatment of ALS to slow functional decline; combination of sodium phenylbutyrate and taurursodiol targeting ER stress and mitochondrial dysfunction (voluntarily withdrawn from market 2024 after PHOENIX Phase 3 trial failure)',
    mechanism: 'Dual mechanism combining ER stress inhibitor (sodium phenylbutyrate) and mitochondrial modulator (taurursodiol) to reduce neuronal death',
    mechanism_category: 'neuroprotective_combination',
    molecular_target: 'Endoplasmic reticulum stress pathway / mitochondrial permeability transition pore',
    phase: 'Approved',
    primary_endpoint: 'ALSFRS-R (ALS Functional Rating Scale-Revised) total score change from baseline',
    key_data: 'CENTAUR trial (NCT03127514): -2.32 point difference in ALSFRS-R decline vs placebo over 24 weeks (p=0.03); n=137. Post-hoc long-term survival analysis showed ~6.5 month median survival benefit.',
    line_of_therapy: 'Add-on therapy',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT03127514'],
    strengths: [
      'First oral combination therapy approved for ALS with dual neuroprotective mechanism',
      'Demonstrated statistically significant slowing of functional decline in CENTAUR trial',
      'Generally well-tolerated with manageable GI side effects'
    ],
    weaknesses: [
      'Phase 3 PHOENIX confirmatory trial failed to meet primary endpoint, leading to voluntary market withdrawal in 2024',
      'Modest effect size in pivotal trial with relatively small sample size (n=137)',
      'High annual cost (~$158,000/year) with debated clinical meaningfulness of benefit'
    ],
    source: 'Amylyx Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Qalsody',
    generic_name: 'tofersen',
    company: 'Biogen',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics: 'Treatment of ALS in adults with SOD1 mutation; antisense oligonucleotide targeting superoxide dismutase 1 mRNA',
    mechanism: 'Antisense oligonucleotide (ASO) that binds to SOD1 mRNA, promoting RNase H-mediated degradation and reducing toxic SOD1 protein production',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'SOD1 mRNA',
    phase: 'Approved',
    primary_endpoint: 'Neurofilament light chain (NfL) plasma concentration change from baseline (surrogate endpoint for accelerated approval)',
    key_data: 'VALOR trial (NCT02623699): Did not meet primary clinical endpoint (ALSFRS-R) but showed 60% reduction in plasma NfL; n=108. Granted accelerated approval based on NfL reduction as reasonably likely surrogate. Open-label extension showed sustained NfL reduction.',
    line_of_therapy: 'First-line for SOD1-ALS',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT02623699'],
    strengths: [
      'First genetically targeted therapy for ALS; addresses root cause in SOD1 mutation carriers',
      'Robust and sustained reduction in plasma NfL, a validated neurodegeneration biomarker',
      'Strong biological rationale with clear genotype-phenotype correlation in SOD1-ALS'
    ],
    weaknesses: [
      'Only applicable to ~2% of ALS patients (SOD1 mutation carriers), severely limiting addressable market',
      'Failed to meet primary clinical endpoint in pivotal VALOR trial; approved via accelerated pathway on surrogate',
      'Requires intrathecal administration (lumbar puncture), creating significant patient burden'
    ],
    source: 'Biogen 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Radicava',
    generic_name: 'edaravone',
    company: 'Mitsubishi Tanabe Pharma',
    indication: 'Amyotrophic Lateral Sclerosis',
    indication_specifics: 'Treatment of ALS as a free radical scavenger to reduce oxidative stress-mediated neuronal damage',
    mechanism: 'Free radical scavenger that eliminates lipid peroxides and hydroxyl radicals, reducing oxidative stress-induced motor neuron damage',
    mechanism_category: 'antioxidant',
    molecular_target: 'Reactive oxygen species (ROS)',
    phase: 'Approved',
    primary_endpoint: 'ALSFRS-R total score change from baseline',
    key_data: 'Japanese Phase 3 (Study 19): 33% less decline in ALSFRS-R vs placebo over 24 weeks (p=0.001); n=137. Oral suspension (Radicava ORS) approved 2022 improving convenience over IV formulation.',
    line_of_therapy: 'Add-on therapy',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Established safety profile with years of post-marketing data from Japan and US',
      'Oral suspension formulation (Radicava ORS) significantly improved convenience over original IV infusion',
      'Well-characterized mechanism with broad applicability across ALS subtypes'
    ],
    weaknesses: [
      'Pivotal trial enriched for early-stage, definite ALS patients; real-world effectiveness debated',
      'Modest effect size and limited long-term survival benefit data',
      'High cost (~$171,000/year) with ongoing payer pushback'
    ],
    source: 'Mitsubishi Tanabe Pharma 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Progressive Supranuclear Palsy (PSP)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Tilavonemab',
    generic_name: 'tilavonemab',
    company: 'AbbVie',
    indication: 'Progressive Supranuclear Palsy',
    indication_specifics: 'Anti-tau monoclonal antibody targeting extracellular tau aggregates in progressive supranuclear palsy',
    mechanism: 'Humanized IgG4 monoclonal antibody that binds the N-terminal region of extracellular tau, preventing cell-to-cell spread of tau pathology',
    mechanism_category: 'anti_tau_antibody',
    molecular_target: 'Extracellular tau (N-terminal)',
    phase: 'Phase 2',
    primary_endpoint: 'PSP Rating Scale (PSPRS) total score change from baseline',
    key_data: 'PASSPORT Phase 2 trial (NCT04658472): Ongoing evaluation in PSP-Richardson syndrome. Earlier Phase 2 study in PSP showed dose-dependent reduction in free tau in CSF but did not meet primary clinical endpoint.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT04658472'],
    strengths: [
      'Strong preclinical rationale for targeting extracellular tau spread in tauopathies',
      'AbbVie provides robust development and commercialization infrastructure',
      'Demonstrated target engagement via CSF free tau reduction'
    ],
    weaknesses: [
      'Earlier tau-targeting antibodies have failed in PSP and Alzheimer\'s, raising class-level concerns',
      'PSP is a rapidly progressing disease making clinical trial endpoints difficult to power',
      'Unclear whether reducing extracellular tau alone is sufficient to slow neurodegeneration'
    ],
    source: 'AbbVie 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Zagotenemab',
    generic_name: 'zagotenemab',
    company: 'Eli Lilly',
    indication: 'Progressive Supranuclear Palsy',
    indication_specifics: 'Anti-tau antibody targeting aggregated tau in progressive supranuclear palsy',
    mechanism: 'Humanized monoclonal antibody that targets N3pE (pyroglutamate) tau aggregates and promotes their clearance via microglial phagocytosis',
    mechanism_category: 'anti_tau_antibody',
    molecular_target: 'N3pE tau aggregates',
    phase: 'Phase 2',
    primary_endpoint: 'PSP Rating Scale (PSPRS) total score change from baseline',
    key_data: 'Phase 2 study in PSP (NCT04185415): Evaluated multiple dose levels. Tau PET imaging substudies included to assess target engagement. Results pending full publication.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT04185415'],
    strengths: [
      'Targets a specific pathological form of tau (N3pE) that may be more disease-relevant',
      'Eli Lilly has deep tau biology expertise from Alzheimer\'s programs',
      'Tau PET imaging enables objective measurement of target engagement and plaque reduction'
    ],
    weaknesses: [
      'Anti-tau antibody class has seen multiple clinical failures in tauopathies',
      'PSP patient identification and recruitment remain challenging, slowing development timelines',
      'Unclear differentiation from other anti-tau approaches in the competitive landscape'
    ],
    source: 'Eli Lilly 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Bepranemab',
    generic_name: 'bepranemab',
    company: 'UCB',
    indication: 'Progressive Supranuclear Palsy',
    indication_specifics: 'Anti-tau antibody targeting the central domain of tau protein to prevent aggregation and spreading',
    mechanism: 'Humanized IgG4 monoclonal antibody binding the central region (mid-domain) of tau protein, inhibiting tau seeding and fibril formation',
    mechanism_category: 'anti_tau_antibody',
    molecular_target: 'Tau protein (central domain)',
    phase: 'Phase 1',
    primary_endpoint: 'Safety and tolerability; pharmacokinetics and CSF tau biomarkers',
    key_data: 'Phase 1 study demonstrated favorable safety profile and dose-proportional pharmacokinetics. CSF biomarker analysis showed target engagement at higher doses. Advancing into PSP with biomarker-enriched design.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Differentiated epitope (central tau domain) compared to N-terminal targeting competitors',
      'IgG4 backbone minimizes effector function and potential neuroinflammation',
      'UCB has strong neuroscience portfolio and development expertise'
    ],
    weaknesses: [
      'Early stage (Phase 1) with long development timeline ahead in a difficult indication',
      'Central domain targeting is a less validated approach than N-terminal tau antibodies',
      'High attrition rate in PSP clinical development across the industry'
    ],
    source: 'UCB 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Myasthenia Gravis (MG)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Vyvgart',
    generic_name: 'efgartigimod',
    company: 'argenx',
    indication: 'Myasthenia Gravis',
    indication_specifics: 'Treatment of generalized myasthenia gravis (gMG) in adults who are anti-AChR antibody positive via FcRn-mediated IgG reduction',
    mechanism: 'Human IgG1 Fc fragment engineered to bind neonatal Fc receptor (FcRn) with high affinity, blocking IgG recycling and reducing pathogenic autoantibody levels',
    mechanism_category: 'fcrn_inhibitor',
    molecular_target: 'Neonatal Fc receptor (FcRn)',
    phase: 'Approved',
    primary_endpoint: 'MG-ADL (Myasthenia Gravis Activities of Daily Living) responder rate',
    key_data: 'ADAPT trial (NCT03669588): 67.7% MG-ADL responder rate vs 29.7% placebo (p<0.0001) in first cycle; n=167. Rapid onset (~1 week). ADAPT+ long-term extension showed durable response. SC formulation (Vyvgart Hytrulo) approved 2023.',
    line_of_therapy: 'Second-line after inadequate response to conventional immunosuppressants',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: true,
    nct_ids: ['NCT03669588'],
    strengths: [
      'First-in-class FcRn inhibitor with rapid onset and strong clinical response rates in gMG',
      'Subcutaneous formulation (Vyvgart Hytrulo) offers significant convenience over IV',
      'Cyclic dosing allows immune recovery between cycles, reducing infection risk vs chronic immunosuppression'
    ],
    weaknesses: [
      'Currently approved only for AChR-Ab+ patients; seronegative gMG remains unaddressed',
      'Cyclic dosing may lead to symptom fluctuation between treatment cycles',
      'Premium pricing (~$300,000+/year) creates payer access challenges'
    ],
    source: 'argenx 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Ultomiris',
    generic_name: 'ravulizumab',
    company: 'Alexion (AstraZeneca)',
    indication: 'Myasthenia Gravis',
    indication_specifics: 'Treatment of generalized myasthenia gravis in adults who are anti-AChR antibody positive via terminal complement inhibition',
    mechanism: 'Long-acting humanized monoclonal antibody that binds complement component C5, preventing cleavage to C5a and C5b and blocking formation of the membrane attack complex (MAC)',
    mechanism_category: 'complement_inhibitor',
    molecular_target: 'Complement C5',
    phase: 'Approved',
    primary_endpoint: 'MG-ADL total score change from baseline at Week 26',
    key_data: 'CHAMPION-MG trial (NCT03920293): Statistically significant improvement in MG-ADL (-3.1 vs -1.4 placebo; p<0.001) at 26 weeks; n=175. Every 8-week dosing offers convenience advantage over eculizumab.',
    line_of_therapy: 'Second-line after inadequate response to conventional therapy',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: true,
    nct_ids: ['NCT03920293'],
    strengths: [
      'Every 8-week IV dosing interval is significantly more convenient than every 2-week eculizumab',
      'Well-established complement inhibition mechanism with extensive safety data from PNH/aHUS',
      'Strong clinical response with durable complement blockade through the dosing interval'
    ],
    weaknesses: [
      'IV-only administration requires infusion center visits, less convenient than oral or SC options',
      'Increased risk of meningococcal infection requiring vaccination and ongoing monitoring',
      'Very high annual cost (>$400,000/year) with significant payer scrutiny'
    ],
    source: 'Alexion/AstraZeneca 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Rozanolixizumab',
    generic_name: 'rozanolixizumab',
    company: 'UCB',
    indication: 'Myasthenia Gravis',
    indication_specifics: 'Treatment of generalized myasthenia gravis via FcRn inhibition to reduce pathogenic IgG autoantibodies',
    mechanism: 'Humanized monoclonal antibody targeting neonatal Fc receptor (FcRn), blocking IgG recycling and accelerating degradation of pathogenic autoantibodies',
    mechanism_category: 'fcrn_inhibitor',
    molecular_target: 'Neonatal Fc receptor (FcRn)',
    phase: 'Approved',
    primary_endpoint: 'MG-ADL total score change from baseline',
    key_data: 'MycarinG Phase 3 trial (NCT03971422): Statistically significant improvement in MG-ADL score vs placebo at Day 43 in both AChR-Ab+ and MuSK-Ab+ patients; n=200. Subcutaneous administration.',
    line_of_therapy: 'Second-line after inadequate response to conventional immunotherapy',
    partner: 'UCB',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: true,
    nct_ids: ['NCT03971422'],
    strengths: [
      'Subcutaneous self-administration offers convenience advantage for chronic treatment',
      'Demonstrated efficacy in both AChR-Ab+ and MuSK-Ab+ patient populations',
      'Weekly SC dosing provides more consistent IgG reduction vs cyclic IV approaches'
    ],
    weaknesses: [
      'Entering a competitive FcRn inhibitor market behind established Vyvgart',
      'Headache reported as common adverse event, potentially impacting tolerability',
      'Continuous weekly dosing may lead to sustained IgG reduction and increased infection risk'
    ],
    source: 'UCB 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Neuromyelitis Optica Spectrum Disorder (NMOSD)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Enspryng',
    generic_name: 'satralizumab',
    company: 'Roche (Chugai)',
    indication: 'Neuromyelitis Optica Spectrum Disorder',
    indication_specifics: 'Treatment of NMOSD in adults who are anti-AQP4 antibody positive via IL-6 receptor inhibition',
    mechanism: 'Humanized recycling monoclonal antibody targeting interleukin-6 receptor (IL-6R), blocking IL-6 signaling that drives B cell activation, plasmablast survival, and autoantibody production',
    mechanism_category: 'il6_receptor_inhibitor',
    molecular_target: 'IL-6 receptor (IL-6R)',
    phase: 'Approved',
    primary_endpoint: 'Time to first relapse',
    key_data: 'SAkuraSky (NCT02028884): 62% reduction in relapse risk vs placebo as add-on therapy (HR 0.38, p=0.02); n=83. SAkuraStar monotherapy: 55% relapse risk reduction (HR 0.45, p=0.06); n=95. Subcutaneous, self-administered every 4 weeks.',
    line_of_therapy: 'First-line or add-on',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT02028884'],
    strengths: [
      'Subcutaneous self-administration every 4 weeks offers significant convenience over IV infusions',
      'Demonstrated efficacy as both monotherapy and add-on to baseline immunosuppressants',
      'Recycling antibody technology provides sustained target suppression with less frequent dosing'
    ],
    weaknesses: [
      'Monotherapy study did not reach statistical significance (p=0.06) at primary analysis',
      'IL-6 blockade does not directly target the pathogenic AQP4-IgG; less mechanistically specific than complement inhibition',
      'Smaller clinical trial sizes limit confidence in subgroup analyses and rare adverse event detection'
    ],
    source: 'Roche/Chugai 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Soliris',
    generic_name: 'eculizumab',
    company: 'Alexion (AstraZeneca)',
    indication: 'Neuromyelitis Optica Spectrum Disorder',
    indication_specifics: 'Treatment of NMOSD in adults who are anti-AQP4 antibody positive via terminal complement inhibition to prevent complement-mediated astrocyte damage',
    mechanism: 'Humanized monoclonal antibody that binds complement component C5 with high affinity, preventing cleavage to C5a and C5b and blocking membrane attack complex formation on AQP4-expressing astrocytes',
    mechanism_category: 'complement_inhibitor',
    molecular_target: 'Complement C5',
    phase: 'Approved',
    primary_endpoint: 'Time to first adjudicated on-trial relapse',
    key_data: 'PREVENT trial (NCT01892345): 94% reduction in relapse risk vs placebo (HR 0.06, p<0.001); n=143. 97.9% of eculizumab patients were relapse-free at 48 weeks. Dramatic efficacy but very high cost.',
    line_of_therapy: 'First-line for active disease',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT01892345'],
    strengths: [
      'Near-complete suppression of relapses (94% risk reduction) with one of the most dramatic trial results in neurology',
      'Directly targets complement-mediated astrocyte destruction, the core pathogenic mechanism in AQP4+ NMOSD',
      'Extensive long-term safety data from use in PNH and aHUS over 15+ years'
    ],
    weaknesses: [
      'Among the most expensive drugs globally (~$500,000+/year) with extreme payer burden',
      'Every 2-week IV infusions create significant treatment burden and infusion center dependency',
      'Increased risk of Neisseria meningitidis infection requiring vaccination and monitoring'
    ],
    source: 'Alexion/AstraZeneca 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Uplizna',
    generic_name: 'inebilizumab',
    company: 'Horizon Therapeutics (Amgen)',
    indication: 'Neuromyelitis Optica Spectrum Disorder',
    indication_specifics: 'Treatment of NMOSD in adults who are anti-AQP4 antibody positive via B cell depletion targeting CD19',
    mechanism: 'Humanized monoclonal antibody targeting CD19 on B cells, inducing antibody-dependent cellular cytotoxicity (ADCC) for broad B cell depletion including plasmablasts that produce AQP4-IgG',
    mechanism_category: 'anti_cd19_antibody',
    molecular_target: 'CD19',
    phase: 'Approved',
    primary_endpoint: 'Time to first adjudicated NMOSD attack',
    key_data: 'N-MOmentum trial (NCT02200770): 73% reduction in NMOSD attacks vs placebo (HR 0.272, p<0.0001); n=230. Six-monthly IV infusion. Broader B cell depletion than anti-CD20 by targeting CD19+ plasmablasts.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT02200770'],
    strengths: [
      'Every 6-month IV dosing offers more convenient schedule than eculizumab every 2 weeks',
      'CD19 targeting depletes plasmablasts not reached by anti-CD20 therapies, potentially superior autoantibody reduction',
      'Largest pivotal trial in NMOSD (n=230) providing robust efficacy and safety data'
    ],
    weaknesses: [
      'Broad B cell depletion increases infection risk, including hypogammaglobulinemia over time',
      'Less dramatic relapse reduction (73%) compared to eculizumab (94%) in cross-trial comparison',
      'IV administration every 6 months still requires infusion center visits'
    ],
    source: 'Horizon Therapeutics/Amgen 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Chronic Inflammatory Demyelinating Polyneuropathy (CIDP)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'IVIG',
    generic_name: 'immune globulin intravenous',
    company: 'Various (CSL Behring, Grifols, Takeda)',
    indication: 'Chronic Inflammatory Demyelinating Polyneuropathy',
    indication_specifics: 'Standard of care immunomodulatory treatment for CIDP via polyclonal IgG immune modulation',
    mechanism: 'Polyclonal immunoglobulin preparation providing broad immunomodulation through Fc receptor saturation, complement scavenging, anti-idiotype antibody effects, and cytokine modulation',
    mechanism_category: 'immunoglobulin_therapy',
    molecular_target: 'Multiple immune targets (Fc receptors, complement, cytokine networks)',
    phase: 'Approved',
    primary_endpoint: 'INCAT (Inflammatory Neuropathy Cause and Treatment) disability score improvement',
    key_data: 'ICE trial (Gamunex): 54% INCAT responder rate vs 21% placebo (p=0.0002); n=117 over 24 weeks. Multiple IVIG brands approved for CIDP. Cornerstone therapy for decades with extensive real-world evidence.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Decades of clinical experience and the most established treatment for CIDP',
      'Multiple brands and supply sources provide market resilience',
      'Effective across broad CIDP subtypes without biomarker requirement'
    ],
    weaknesses: [
      'Plasma-derived product with supply constraints and batch variability concerns',
      'Frequent IV infusions (every 3-4 weeks) over many hours create significant treatment burden',
      'Systemic side effects including headache, thrombotic events, renal impairment, and infusion reactions'
    ],
    source: 'CSL Behring/Grifols/Takeda 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Hyqvia',
    generic_name: 'immune globulin infusion with recombinant human hyaluronidase',
    company: 'Takeda',
    indication: 'Chronic Inflammatory Demyelinating Polyneuropathy',
    indication_specifics: 'Subcutaneous immunoglobulin with hyaluronidase for maintenance treatment of CIDP, enabling large-volume SC infusion',
    mechanism: 'Subcutaneous immunoglobulin facilitated by recombinant human hyaluronidase (rHuPH20) which transiently increases SC tissue permeability, allowing large-volume immunoglobulin administration subcutaneously',
    mechanism_category: 'immunoglobulin_therapy',
    molecular_target: 'Multiple immune targets (Fc receptors, complement) / Hyaluronan (for delivery)',
    phase: 'Approved',
    primary_endpoint: 'CIDP relapse rate (proportion of patients relapsing)',
    key_data: 'ADVANCE-CIDP 3 trial (NCT02549170): Demonstrated non-inferiority to IVIG in preventing CIDP relapse; adjusted relapse rate 4.2% (Hyqvia) vs 5.2% (IVIG). Self-administered at home, reducing healthcare visits.',
    line_of_therapy: 'First-line (maintenance after IVIG stabilization)',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT02549170'],
    strengths: [
      'Self-administered subcutaneous infusion at home eliminates need for IV infusion center visits',
      'Monthly dosing interval with comparable efficacy to every 3-4 week IVIG',
      'Improved quality of life scores and patient preference vs IV immunoglobulin in studies'
    ],
    weaknesses: [
      'Local injection site reactions (swelling, redness, pain) common, especially early in treatment',
      'Still a plasma-derived product subject to supply constraints',
      'Requires initial stabilization on IVIG before switching to SC maintenance'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Efgartigimod',
    generic_name: 'efgartigimod',
    company: 'argenx',
    indication: 'Chronic Inflammatory Demyelinating Polyneuropathy',
    indication_specifics: 'FcRn inhibitor under investigation for CIDP to reduce pathogenic IgG autoantibodies driving nerve demyelination',
    mechanism: 'Human IgG1 Fc fragment that blocks neonatal Fc receptor (FcRn), accelerating degradation of IgG including pathogenic autoantibodies targeting peripheral nerve myelin',
    mechanism_category: 'fcrn_inhibitor',
    molecular_target: 'Neonatal Fc receptor (FcRn)',
    phase: 'Phase 3',
    primary_endpoint: 'CIDP relapse or INCAT score worsening during treatment withdrawal period',
    key_data: 'ADHERE Phase 3 trial (NCT04281472): Evaluating efgartigimod SC (Vyvgart Hytrulo) in CIDP. Positive topline results reported with statistically significant reduction in relapse risk vs placebo. Potential to displace IVIG as standard of care. Phase 3 as of Jan 2025; verify current approval status.',
    line_of_therapy: 'First-line or second-line',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT04281472'],
    strengths: [
      'Targeted mechanism of action vs broad immunomodulation of IVIG, potentially better risk-benefit profile',
      'Subcutaneous formulation enables self-administration at home',
      'Not a plasma-derived product, eliminating supply chain constraints of IVIG'
    ],
    weaknesses: [
      'FcRn inhibition reduces all IgG including protective immunoglobulins, increasing infection risk',
      'CIDP patients may require indefinite treatment; long-term safety of chronic IgG reduction unclear',
      'Must demonstrate superiority or meaningful differentiation vs well-established and lower-cost IVIG'
    ],
    source: 'argenx 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Transthyretin Amyloid Cardiomyopathy (ATTR-CM)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Vyndaqel',
    generic_name: 'tafamidis',
    company: 'Pfizer',
    indication: 'Transthyretin Amyloid Cardiomyopathy',
    indication_specifics: 'Treatment of ATTR cardiomyopathy (wild-type and hereditary) by stabilizing transthyretin tetramers to prevent amyloid fibril formation',
    mechanism: 'Small molecule TTR stabilizer that binds to the thyroxine-binding sites of the TTR tetramer, preventing dissociation into monomers that misfold and aggregate into amyloid fibrils',
    mechanism_category: 'ttr_stabilizer',
    molecular_target: 'Transthyretin (TTR) tetramer',
    phase: 'Approved',
    primary_endpoint: 'Hierarchical combination of all-cause mortality and cardiovascular-related hospitalizations',
    key_data: 'ATTR-ACT trial (NCT01994889): 30% reduction in all-cause mortality (HR 0.70) and significant reduction in CV hospitalizations over 30 months; n=441. Now standard of care for ATTR-CM with >$4B annual revenue.',
    line_of_therapy: 'First-line',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT01994889'],
    strengths: [
      'First and most established disease-modifying therapy for ATTR-CM with mortality benefit',
      'Simple once-daily oral dosing with excellent adherence',
      'Applicable to both wild-type and hereditary ATTR-CM, covering the full patient population'
    ],
    weaknesses: [
      'Stabilizes TTR but does not clear existing amyloid deposits; limited benefit in advanced disease',
      'High annual cost (~$225,000/year) with growing payer scrutiny as market expands',
      'Faces increasing competition from gene silencing therapies that more completely suppress TTR production'
    ],
    source: 'Pfizer 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Patisiran',
    generic_name: 'patisiran',
    company: 'Alnylam Pharmaceuticals',
    indication: 'Transthyretin Amyloid Cardiomyopathy',
    indication_specifics: 'RNAi therapeutic silencing TTR gene expression to reduce amyloidogenic protein production in ATTR cardiomyopathy',
    mechanism: 'Lipid nanoparticle-encapsulated small interfering RNA (siRNA) that targets TTR mRNA in hepatocytes, reducing TTR protein production by ~80% via RNA interference',
    mechanism_category: 'rna_interference',
    molecular_target: 'TTR mRNA',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in 6-minute walk test distance and Kansas City Cardiomyopathy Questionnaire (KCCQ-OS)',
    key_data: 'APOLLO-B trial (NCT03997383): Met primary endpoint with improvement in 6MWT and KCCQ-OS vs placebo at 12 months in ATTR-CM; n=360. Originally approved for ATTR polyneuropathy (APOLLO trial); cardiomyopathy indication expanded.',
    line_of_therapy: 'First-line or second-line',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT03997383'],
    strengths: [
      'Achieves ~80% reduction in serum TTR, more complete protein suppression than stabilizers',
      'Demonstrated functional improvement (6MWT, KCCQ) in ATTR-CM patients',
      'Proven technology platform with extensive real-world evidence from polyneuropathy indication'
    ],
    weaknesses: [
      'IV infusion every 3 weeks creates ongoing treatment burden compared to oral tafamidis',
      'Vitamin A supplementation required due to TTR role in retinol transport',
      'Higher cost and more complex administration may limit uptake vs simpler oral alternatives'
    ],
    source: 'Alnylam Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Eplontersen',
    generic_name: 'eplontersen',
    company: 'Ionis Pharmaceuticals / AstraZeneca',
    indication: 'Transthyretin Amyloid Cardiomyopathy',
    indication_specifics: 'Ligand-conjugated antisense oligonucleotide targeting TTR mRNA to reduce circulating TTR protein in ATTR cardiomyopathy',
    mechanism: 'GalNAc-conjugated antisense oligonucleotide (ASO) that binds TTR mRNA in hepatocytes and promotes RNase H-mediated degradation, reducing TTR protein production by ~80%',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'TTR mRNA',
    phase: 'Approved',
    primary_endpoint: 'Change from baseline in modified Neuropathy Impairment Score +7 (mNIS+7) and Norfolk QoL-DN',
    key_data: 'NEURO-TTRansform trial (NCT04136184): Superior to inotersen reference in polyneuropathy with ~80% TTR reduction; n=168. Monthly SC self-injection. CARDIO-TTRansform (NCT04136171) evaluating ATTR-CM indication ongoing.',
    line_of_therapy: 'First-line',
    partner: 'AstraZeneca',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT04136184', 'NCT04136171'],
    strengths: [
      'Monthly self-administered SC injection offers major convenience advantage over IV patisiran',
      'GalNAc conjugation provides liver-targeted delivery with improved safety over unconjugated ASOs',
      'No infusion reactions and no premedication required; simple at-home administration'
    ],
    weaknesses: [
      'ATTR-CM pivotal data (CARDIO-TTRansform) still maturing; cardiomyopathy approval timing uncertain',
      'Thrombocytopenia monitoring required based on ASO class effects',
      'Entering an increasingly competitive ATTR landscape with multiple approved and pipeline options'
    ],
    source: 'Ionis Pharmaceuticals/AstraZeneca 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Essential Tremor
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Propranolol',
    generic_name: 'propranolol',
    company: 'Generic (multiple manufacturers)',
    indication: 'Essential Tremor',
    indication_specifics: 'First-line pharmacotherapy for essential tremor; non-selective beta-adrenergic receptor antagonist reducing tremor amplitude',
    mechanism: 'Non-selective beta-adrenergic receptor antagonist that reduces tremor amplitude via peripheral beta-2 receptor blockade on skeletal muscle and central beta-1 receptor modulation',
    mechanism_category: 'beta_blocker',
    molecular_target: 'Beta-1 and beta-2 adrenergic receptors',
    phase: 'Approved',
    primary_endpoint: 'Tremor amplitude reduction (accelerometry) and clinical tremor rating scale improvement',
    key_data: 'Multiple controlled trials over 40+ years: Reduces tremor amplitude by ~50% in approximately 50-70% of patients. Extended-release formulation allows once-daily dosing. Gold standard first-line therapy.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Decades of clinical experience with well-characterized safety and efficacy profile',
      'Very low cost as generic medication (~$10-30/month), excellent insurance coverage',
      'Simple oral dosing with extended-release formulation available for once-daily use'
    ],
    weaknesses: [
      'Contraindicated in asthma, COPD, and decompensated heart failure, limiting patient eligibility',
      'Only ~50% of patients achieve meaningful tremor reduction; significant non-responder rate',
      'Fatigue, bradycardia, and exercise intolerance are common dose-limiting side effects'
    ],
    source: 'Generic 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'CALA TRIO',
    company: 'Cala Health',
    indication: 'Essential Tremor',
    indication_specifics: 'Non-invasive wrist-worn neuromodulation device delivering transcutaneous afferent patterned stimulation (TAPS) to reduce hand tremor',
    mechanism: 'Wrist-worn device delivering calibrated electrical stimulation to the median and radial nerves, disrupting the central tremor network via afferent nerve stimulation (TAPS therapy)',
    mechanism_category: 'neuromodulation_device',
    molecular_target: 'Median and radial peripheral nerves (afferent pathways to thalamic tremor circuit)',
    phase: 'Approved',
    primary_endpoint: 'Tremor power reduction measured by on-device accelerometry; TETRAS (The Essential Tremor Rating Assessment Scale) upper limb score',
    key_data: 'PROSPECT trial: 68% of patients experienced clinically meaningful tremor improvement; 49% median tremor power reduction during activities of daily living. FDA De Novo classification granted 2021.',
    line_of_therapy: 'First-line or adjunctive',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Non-invasive, drug-free approach eliminates systemic side effects of pharmacotherapy',
      'On-demand therapy that patients can self-administer before tremor-sensitive activities',
      'Prescription device with at-home use; no surgical procedure or clinic visits required for treatment'
    ],
    weaknesses: [
      'Limited long-term efficacy data compared to decades of evidence for pharmacotherapies',
      'Requires consistent daily use for sustained benefit; effect is temporary and task-specific',
      'Out-of-pocket cost (~$600/quarter) with variable insurance coverage creating access barriers'
    ],
    source: 'Cala Health 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'CX-8998',
    company: 'Cavion (Jazz Pharmaceuticals)',
    indication: 'Essential Tremor',
    indication_specifics: 'Selective T-type calcium channel blocker targeting thalamic oscillatory circuits underlying essential tremor',
    mechanism: 'Selective Cav3.1/Cav3.2/Cav3.3 T-type calcium channel blocker that modulates thalamic oscillatory activity in the inferior olive-cerebellar-thalamic circuit responsible for tremor generation',
    mechanism_category: 't_type_calcium_channel_blocker',
    molecular_target: 'T-type calcium channels (Cav3.1, Cav3.2, Cav3.3)',
    phase: 'Phase 2',
    primary_endpoint: 'TETRAS (The Essential Tremor Rating Assessment Scale) performance subscale upper limb score change from baseline',
    key_data: 'T-CALM Phase 2 trial (NCT03101241): Mixed results in essential tremor with some evidence of dose-dependent tremor reduction. Development status uncertain following Jazz Pharmaceuticals acquisition of Cavion.',
    line_of_therapy: 'Second-line',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT03101241'],
    strengths: [
      'First-in-class mechanism targeting the specific neural circuit underlying tremor generation',
      'Oral dosing with potential for superior efficacy over non-specific beta-blockers',
      'Strong preclinical rationale from thalamic oscillation models of essential tremor'
    ],
    weaknesses: [
      'Phase 2 results were mixed and development path remains unclear after acquisition',
      'T-type calcium channels are widely expressed; off-target CNS effects possible (somnolence, dizziness)',
      'Essential tremor market dominated by cheap generics, making commercial viability challenging without clear superiority'
    ],
    source: 'Cavion/Jazz Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Narcolepsy
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Xywav',
    generic_name: 'calcium, magnesium, potassium, and sodium oxybates',
    company: 'Jazz Pharmaceuticals',
    indication: 'Narcolepsy',
    indication_specifics: 'Treatment of cataplexy and excessive daytime sleepiness (EDS) in narcolepsy type 1 and type 2; lower-sodium oxybate formulation',
    mechanism: 'Mixed-salt oxybate formulation that acts as a GABA-B receptor agonist and GHB receptor agonist, consolidating nighttime sleep architecture and reducing REM sleep intrusions',
    mechanism_category: 'gaba_b_agonist',
    molecular_target: 'GABA-B receptor / GHB receptor',
    phase: 'Approved',
    primary_endpoint: 'Weekly cataplexy attack frequency and Epworth Sleepiness Scale (ESS) score change from baseline',
    key_data: 'Pivotal trial demonstrated non-inferiority to Xyrem (sodium oxybate) with 92% less sodium content. Phase 3 in idiopathic hypersomnia: significant ESS improvement (p<0.0001). ~$150,000/year US cost.',
    line_of_therapy: 'First-line for cataplexy; first or second-line for EDS',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      '92% lower sodium content vs Xyrem, significantly reducing cardiovascular risk for long-term use',
      'Highly effective for both cataplexy and EDS with dual-symptom management in a single therapy',
      'REMS program ensures controlled distribution addressing abuse potential concerns'
    ],
    weaknesses: [
      'Twice-nightly dosing (at bedtime and 2.5-4 hours later) disrupts sleep and is burdensome',
      'REMS-restricted with DEA Schedule III classification limiting prescriber and pharmacy access',
      'Very high annual cost (~$150,000/year) with payer pushback and prior authorization requirements'
    ],
    source: 'Jazz Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Wakix',
    generic_name: 'pitolisant',
    company: 'Harmony Biosciences',
    indication: 'Narcolepsy',
    indication_specifics: 'Treatment of excessive daytime sleepiness in narcolepsy; first-in-class histamine H3 receptor inverse agonist/antagonist',
    mechanism: 'Selective histamine H3 receptor inverse agonist/antagonist that blocks presynaptic autoreceptors, increasing histamine release in the tuberomammillary nucleus and enhancing wake-promoting neurotransmission',
    mechanism_category: 'h3_receptor_inverse_agonist',
    molecular_target: 'Histamine H3 receptor',
    phase: 'Approved',
    primary_endpoint: 'Epworth Sleepiness Scale (ESS) score change from baseline',
    key_data: 'HARMONY 1 (NCT01067222): ESS improvement of -3.0 vs placebo (p=0.024); n=94. HARMONY CTP: significant reduction in cataplexy (p=0.034). Once-daily oral dosing. Not a controlled substance.',
    line_of_therapy: 'First-line or second-line for EDS',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT01067222'],
    strengths: [
      'Not a controlled substance (unlike oxybates and stimulants), enabling simpler prescribing and dispensing',
      'Once-daily oral morning dosing is significantly more convenient than twice-nightly oxybates',
      'First-in-class mechanism with favorable safety profile and low abuse potential'
    ],
    weaknesses: [
      'Less efficacious than oxybates for cataplexy; ESS improvement modest compared to Xyrem/Xywav',
      'CYP2D6 poor metabolizers require dose adjustment; drug interaction potential',
      'QT prolongation risk at higher doses requires ECG monitoring in some patients'
    ],
    source: 'Harmony Biosciences 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'TAK-861',
    company: 'Takeda',
    indication: 'Narcolepsy',
    indication_specifics: 'Oral orexin receptor 2 (OX2R) agonist for treatment of narcolepsy type 1; replaces deficient orexin signaling',
    mechanism: 'Selective small molecule orexin receptor type 2 (OX2R) agonist that restores orexin signaling deficient in narcolepsy type 1, directly addressing the root pathophysiology of hypocretin neuron loss',
    mechanism_category: 'orexin_receptor_agonist',
    molecular_target: 'Orexin receptor type 2 (OX2R)',
    phase: 'Phase 3',
    primary_endpoint: 'Maintenance of Wakefulness Test (MWT) mean sleep latency change from baseline; weekly cataplexy rate',
    key_data: 'Phase 2 trial: Demonstrated dose-dependent improvement in MWT sleep latency and reduction in cataplexy frequency in NT1 patients. Moved to Phase 3 with multiple dose arms. Potential disease-modifying approach.',
    line_of_therapy: 'First-line',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Directly addresses the root cause of narcolepsy type 1 (orexin deficiency) rather than treating symptoms',
      'Oral small molecule with potential for once-daily dosing and simple administration',
      'First-in-class orexin agonist could transform narcolepsy treatment paradigm if successful'
    ],
    weaknesses: [
      'Achieving selective OX2R agonism without off-target effects has been historically challenging',
      'Phase 3 data not yet available; significant clinical and regulatory risk remains',
      'Primarily applicable to narcolepsy type 1 (orexin-deficient); may not benefit type 2 narcolepsy'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Rett Syndrome
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Daybue',
    generic_name: 'trofinetide',
    company: 'Acadia Pharmaceuticals',
    indication: 'Rett Syndrome',
    indication_specifics: 'Treatment of Rett syndrome in adults and pediatric patients aged 2+ years; synthetic analog of amino-terminal tripeptide of IGF-1',
    mechanism: 'Synthetic analog of the amino-terminal tripeptide of insulin-like growth factor 1 (glycine-proline-glutamate, GPE) that modulates neuroinflammation, supports synaptic function, and normalizes glial cell activation in MECP2-deficient neurons',
    mechanism_category: 'igf1_analog',
    molecular_target: 'IGF-1 signaling pathway / neuroinflammatory pathways',
    phase: 'Approved',
    primary_endpoint: 'Rett Syndrome Behaviour Questionnaire (RSBQ) total score and Clinical Global Impression-Improvement (CGI-I) at Week 12',
    key_data: 'LAVENDER trial (NCT04181723): Statistically significant improvement in both co-primary endpoints vs placebo: RSBQ (p=0.0175) and CGI-I (p=0.0030); n=187. First and only FDA-approved treatment for Rett syndrome.',
    line_of_therapy: 'First-line',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT04181723'],
    strengths: [
      'First and only FDA-approved treatment specifically for Rett syndrome, a major unmet need',
      'Statistically significant improvement on both co-primary endpoints in well-powered Phase 3 trial',
      'Addresses core disease symptoms (behavior, communication, hand use) rather than just seizures'
    ],
    weaknesses: [
      'Twice-daily oral solution requiring weight-based dosing volumes that can be difficult to administer',
      'Diarrhea reported in ~80% of patients, a significant tolerability concern requiring management',
      'Very high annual cost (~$575,000/year) with limited long-term data on sustained benefit'
    ],
    source: 'Acadia Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'ANAVEX 2-73',
    generic_name: 'blarcamesine',
    company: 'Anavex Life Sciences',
    indication: 'Rett Syndrome',
    indication_specifics: 'Sigma-1 receptor agonist under investigation for Rett syndrome to restore cellular homeostasis and synaptic plasticity',
    mechanism: 'Sigma-1 receptor agonist and muscarinic receptor modulator that restores cellular proteostasis, enhances mitochondrial function, and modulates calcium signaling in MECP2-deficient neurons',
    mechanism_category: 'sigma1_receptor_agonist',
    molecular_target: 'Sigma-1 receptor / Muscarinic receptors',
    phase: 'Phase 2/3',
    primary_endpoint: 'RSBQ (Rett Syndrome Behaviour Questionnaire) total score change from baseline and CGI-I',
    key_data: 'Phase 2/3 AVATAR trial (NCT03758924): Interim data showed improvement in RSBQ and CGI-I in pediatric Rett syndrome patients. Oral once-daily dosing. Pharmacogenomic biomarker (SIGMAR1 variants) explored for patient stratification.',
    line_of_therapy: 'First-line or adjunctive',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT03758924'],
    strengths: [
      'Oral once-daily capsule offers significant convenience advantage over trofinetide oral solution',
      'Multi-target mechanism may provide broader neuroprotection than single-pathway approaches',
      'Pharmacogenomic biomarker strategy could enable precision medicine approach in Rett syndrome'
    ],
    weaknesses: [
      'Full Phase 2/3 data not yet published; clinical significance of interim results uncertain',
      'Sigma-1 receptor biology is incompletely understood, creating mechanistic uncertainty',
      'Entering market behind approved Daybue with limited head-to-head differentiation data'
    ],
    source: 'Anavex Life Sciences 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'NGN-401',
    company: 'Neurogene',
    indication: 'Rett Syndrome',
    indication_specifics: 'AAV-based gene therapy delivering functional MECP2 gene with proprietary miRNA-Responsive Auto-Regulatory Element (miRARE) to treat the root cause of Rett syndrome',
    mechanism: 'AAV9-based gene therapy delivering a functional copy of the MECP2 gene with a self-regulating expression cassette (miRARE) that uses endogenous miR-124 and miR-132 to auto-regulate MECP2 expression and prevent toxicity from overexpression',
    mechanism_category: 'gene_therapy',
    molecular_target: 'MECP2 gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety, tolerability, and preliminary efficacy (RSBQ, CGI-I, CSBS-ITC)',
    key_data: 'Phase 1/2 trial (NCT05898620): First patients dosed in 2023. Self-regulating expression system designed to address the critical challenge of MECP2 overexpression toxicity. Intrathecal delivery route.',
    line_of_therapy: 'Potentially curative one-time treatment',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT05898620'],
    strengths: [
      'Addresses the root genetic cause of Rett syndrome with potential for one-time curative treatment',
      'Proprietary miRARE technology solves the critical MECP2 dosage sensitivity problem (overexpression is toxic)',
      'One-time treatment could transform the economic and treatment burden calculus vs chronic therapies'
    ],
    weaknesses: [
      'Very early stage (Phase 1/2) with limited clinical data and long development timeline',
      'Gene therapy manufacturing complexity and scale-up challenges for rare disease economics',
      'Intrathecal delivery of AAV carries risks including dorsal root ganglion toxicity observed in preclinical models'
    ],
    source: 'Neurogene 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. Angelman Syndrome
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'GTX-102',
    company: 'GeneTx / Ultragenyx',
    indication: 'Angelman Syndrome',
    indication_specifics: 'Antisense oligonucleotide targeting UBE3A-AS transcript to reactivate paternal UBE3A expression in Angelman syndrome neurons',
    mechanism: 'Antisense oligonucleotide (ASO) that targets the UBE3A antisense transcript (UBE3A-ATS), which silences the paternal UBE3A allele in neurons. By degrading UBE3A-ATS, the ASO reactivates paternal UBE3A protein expression',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'UBE3A antisense transcript (UBE3A-ATS)',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety and tolerability; Bayley Scales of Infant and Toddler Development; CGI-I',
    key_data: 'Phase 1/2 KIK-AS trial (NCT04259281): Early data showed improvements in communication and motor function in some patients. Initial dosing pause due to lower extremity weakness (resolved); revised titration protocol implemented.',
    line_of_therapy: 'First-line (disease-modifying)',
    partner: 'Ultragenyx',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT04259281'],
    strengths: [
      'Directly addresses the genetic root cause by reactivating the silenced paternal UBE3A gene',
      'First-in-class approach with strong preclinical evidence of UBE3A reactivation in mouse models',
      'Partnership with Ultragenyx provides rare disease development and commercialization expertise'
    ],
    weaknesses: [
      'Early safety signal of lower extremity weakness led to clinical hold and protocol modification',
      'Intrathecal administration creates significant burden, especially in pediatric patients',
      'Chronic dosing likely required as ASO effects are reversible; long-term safety unknown'
    ],
    source: 'GeneTx/Ultragenyx 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'ION582',
    company: 'Ionis Pharmaceuticals',
    indication: 'Angelman Syndrome',
    indication_specifics: 'Antisense oligonucleotide targeting UBE3A-AS to restore UBE3A expression from the intact paternal allele in Angelman syndrome',
    mechanism: 'Antisense oligonucleotide (ASO) designed to selectively degrade the UBE3A antisense transcript in CNS neurons, de-repressing paternal UBE3A expression to restore functional UBE3A protein levels',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'UBE3A antisense transcript (UBE3A-ATS)',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety and tolerability; developmental milestones and communication assessments',
    key_data: 'Phase 1/2 trial (NCT05127226): Evaluating intrathecal ASO in children with Angelman syndrome. Ionis has extensive ASO platform experience from nusinersen (Spinraza) and tofersen (Qalsody). Multiple dose cohorts enrolling.',
    line_of_therapy: 'First-line (disease-modifying)',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT05127226'],
    strengths: [
      'Ionis has the most extensive track record in CNS-delivered ASOs (Spinraza, Qalsody)',
      'Optimized ASO chemistry from decades of platform development may improve potency and safety',
      'Strong manufacturing and regulatory infrastructure for intrathecal ASO programs'
    ],
    weaknesses: [
      'Competing directly with GTX-102 for the same molecular target and patient population',
      'Intrathecal delivery in young children is procedurally challenging and burdensome for families',
      'Limited published clinical data at this stage of development'
    ],
    source: 'Ionis Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'RO7248824',
    company: 'Roche',
    indication: 'Angelman Syndrome',
    indication_specifics: 'Antisense oligonucleotide targeting UBE3A-ATS to restore paternal UBE3A expression in Angelman syndrome',
    mechanism: 'Stereopure antisense oligonucleotide that selectively degrades the UBE3A antisense transcript, enabling transcription and translation of UBE3A protein from the intact but silenced paternal allele',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'UBE3A antisense transcript (UBE3A-ATS)',
    phase: 'Phase 1',
    primary_endpoint: 'Safety, tolerability, pharmacokinetics, and preliminary efficacy measures',
    key_data: 'Phase 1 MAGNOLIA trial (NCT05607680): First-in-human study evaluating intrathecal administration in children with Angelman syndrome. Stereopure chemistry from Wave Life Sciences collaboration may provide improved therapeutic index.',
    line_of_therapy: 'First-line (disease-modifying)',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT05607680'],
    strengths: [
      'Stereopure ASO chemistry may offer improved potency and reduced off-target effects vs racemic mixtures',
      'Roche provides extensive global development, regulatory, and commercialization capabilities',
      'Potential for differentiated safety profile based on stereopure technology'
    ],
    weaknesses: [
      'Third entrant in a small rare disease market with two ASO competitors ahead in development',
      'Earliest-stage program among Angelman ASO competitors with longest timeline to potential approval',
      'Stereopure technology advantage remains to be demonstrated clinically in this indication'
    ],
    source: 'Roche 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 11. Dravet Syndrome
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Epidiolex',
    generic_name: 'cannabidiol',
    company: 'Jazz Pharmaceuticals (GW Pharma)',
    indication: 'Dravet Syndrome',
    indication_specifics: 'Adjunctive treatment of seizures associated with Dravet syndrome in patients aged 1 year and older',
    mechanism: 'Plant-derived cannabidiol (CBD) with multi-target anticonvulsant effects including GPR55 antagonism, TRPV1 desensitization, adenosine reuptake inhibition, and modulation of intracellular calcium via T-type calcium channels',
    mechanism_category: 'cannabinoid',
    molecular_target: 'GPR55 / TRPV1 / adenosine transporter / multiple',
    phase: 'Approved',
    primary_endpoint: 'Percent change from baseline in convulsive seizure frequency per 28 days',
    key_data: 'GWPCARE1 trial (NCT02091375): 39% median reduction in convulsive seizure frequency vs 13% placebo (p=0.01); n=120. GWPCARE2 confirmed: 42% reduction (20mg/kg/day) vs 17% placebo (p=0.002).',
    line_of_therapy: 'Adjunctive (add-on to existing antiseizure medications)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT02091375'],
    strengths: [
      'First FDA-approved cannabis-derived medication with rigorous Phase 3 evidence base',
      'Effective across multiple severe epilepsy syndromes (Dravet, LGS, TSC), broadening commercial reach',
      'Generally well-tolerated with a different mechanism of action from traditional ASMs'
    ],
    weaknesses: [
      'Drug-drug interactions with clobazam (increases desmethylclobazam levels), valproate (hepatotoxicity risk)',
      'Hepatotoxicity risk requiring liver function monitoring, especially with valproate co-administration',
      'Oral solution formulation with sesame oil can cause GI side effects; taste/palatability concerns in children'
    ],
    source: 'Jazz Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Fintepla',
    generic_name: 'fenfluramine',
    company: 'UCB (Zogenix)',
    indication: 'Dravet Syndrome',
    indication_specifics: 'Treatment of seizures associated with Dravet syndrome in patients aged 2 years and older; serotonergic anticonvulsant',
    mechanism: 'Releases serotonin (5-HT) via SERT reversal and activates specific serotonin receptors (5-HT1D, 5-HT2A, 5-HT2C) and sigma-1 receptors to reduce seizure susceptibility in SCN1A-deficient neural circuits',
    mechanism_category: 'serotonin_modulator',
    molecular_target: 'Serotonin transporter (SERT) / 5-HT1D, 5-HT2A, 5-HT2C receptors / Sigma-1 receptor',
    phase: 'Approved',
    primary_endpoint: 'Percent change from baseline in monthly convulsive seizure frequency',
    key_data: 'Study 1 (NCT02682927): 62.3% median reduction in convulsive seizure frequency (0.2 mg/kg/day) vs 17.4% placebo (p<0.001); n=119. Most effective adjunctive therapy for Dravet seizures. REMS required for cardiac monitoring.',
    line_of_therapy: 'Adjunctive (add-on)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT02682927'],
    strengths: [
      'Highest seizure reduction efficacy (~62%) among approved Dravet treatments in pivotal trials',
      'Unique serotonergic mechanism complementary to other ASMs, enabling effective polytherapy',
      'Demonstrated sustained long-term efficacy in open-label extension studies beyond 3 years'
    ],
    weaknesses: [
      'REMS program with mandatory echocardiogram monitoring due to historical cardiac valvulopathy signal from dexfenfluramine',
      'Serotonergic mechanism raises theoretical concerns about serotonin syndrome with concomitant serotonergic drugs',
      'Appetite reduction and weight loss can be clinically significant in already underweight pediatric patients'
    ],
    source: 'UCB 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Soticlestat',
    generic_name: 'soticlestat',
    company: 'Takeda',
    indication: 'Dravet Syndrome',
    indication_specifics: 'Cholesterol 24-hydroxylase (CH24H) inhibitor reducing brain cholesterol turnover to modulate NMDA receptor-mediated excitability in Dravet syndrome',
    mechanism: 'First-in-class inhibitor of cholesterol 24-hydroxylase (CYP46A1/CH24H), which catalyzes brain cholesterol to 24(S)-hydroxycholesterol (24HC). 24HC is a positive allosteric modulator of NMDA receptors; reducing its levels decreases glutamatergic excitotoxicity',
    mechanism_category: 'cholesterol_24_hydroxylase_inhibitor',
    molecular_target: 'Cholesterol 24-hydroxylase (CYP46A1/CH24H)',
    phase: 'Phase 3',
    primary_endpoint: 'Percent change from baseline in convulsive seizure frequency per 28 days',
    key_data: 'ENDYMION Phase 2 (NCT03635073): Open-label study showed 36% median reduction in convulsive seizure frequency. Phase 3 SKYLINE (NCT04940624) and STARGAZE trials ongoing in Dravet and Lennox-Gastaut syndromes.',
    line_of_therapy: 'Adjunctive',
    partner: 'Ovid Therapeutics (returned to Takeda)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT03635073', 'NCT04940624'],
    strengths: [
      'Completely novel mechanism of action (cholesterol metabolism/NMDA modulation) with no approved competitors in class',
      'Oral formulation suitable for pediatric and adult use',
      'Potential applicability across multiple developmental and epileptic encephalopathies'
    ],
    weaknesses: [
      'Phase 2 data was open-label only; placebo-controlled Phase 3 results pending',
      'Novel mechanism with limited long-term safety data on chronic brain cholesterol modulation',
      'Ovid Therapeutics returned rights, raising questions about confidence in Phase 3 success'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 12. Tardive Dyskinesia
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Ingrezza',
    generic_name: 'valbenazine',
    company: 'Neurocrine Biosciences',
    indication: 'Tardive Dyskinesia',
    indication_specifics: 'Treatment of tardive dyskinesia in adults; selective vesicular monoamine transporter 2 (VMAT2) inhibitor',
    mechanism: 'Highly selective vesicular monoamine transporter 2 (VMAT2) inhibitor that reduces presynaptic dopamine packaging into synaptic vesicles, decreasing dopaminergic neurotransmission in the basal ganglia to reduce involuntary movements',
    mechanism_category: 'vmat2_inhibitor',
    molecular_target: 'Vesicular monoamine transporter 2 (VMAT2)',
    phase: 'Approved',
    primary_endpoint: 'AIMS (Abnormal Involuntary Movement Scale) total score change from baseline',
    key_data: 'KINECT 3 trial (NCT02274558): -3.2 AIMS score improvement vs -0.1 placebo (80mg; p<0.001); n=234. First FDA-approved treatment specifically for tardive dyskinesia. Blockbuster with >$2B annual revenue.',
    line_of_therapy: 'First-line',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT02274558'],
    strengths: [
      'First FDA-approved treatment specifically for tardive dyskinesia with robust Phase 3 data',
      'Once-daily dosing with simple titration; well-tolerated with low discontinuation rates',
      'Selective VMAT2 inhibition minimizes risk of parkinsonism and depression seen with less selective agents'
    ],
    weaknesses: [
      'Does not address the underlying cause of TD; requires continuous treatment for sustained benefit',
      'Somnolence and QT prolongation potential at higher doses require monitoring',
      'High annual cost (~$90,000-100,000/year) in a population often covered by Medicaid/public payers'
    ],
    source: 'Neurocrine Biosciences 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Austedo',
    generic_name: 'deutetrabenazine',
    company: 'Teva Pharmaceutical',
    indication: 'Tardive Dyskinesia',
    indication_specifics: 'Treatment of tardive dyskinesia in adults; deuterated VMAT2 inhibitor with improved pharmacokinetics',
    mechanism: 'Deuterated form of tetrabenazine that inhibits vesicular monoamine transporter 2 (VMAT2). Deuterium substitution slows CYP2D6 metabolism, providing more stable plasma levels and reduced dosing frequency vs tetrabenazine',
    mechanism_category: 'vmat2_inhibitor',
    molecular_target: 'Vesicular monoamine transporter 2 (VMAT2)',
    phase: 'Approved',
    primary_endpoint: 'AIMS (Abnormal Involuntary Movement Scale) total score change from baseline',
    key_data: 'AIM-TD trial (NCT02291861): -3.0 AIMS score improvement (36mg) vs -1.4 placebo (p=0.019); n=298. Also approved for Huntington\'s chorea. Twice-daily dosing.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT02291861'],
    strengths: [
      'Dual indication (TD and Huntington\'s chorea) broadens clinical utility and commercial reach',
      'Deuterium modification provides longer half-life and more consistent drug exposure vs tetrabenazine',
      'Extensive real-world experience and growing prescriber familiarity in the TD market'
    ],
    weaknesses: [
      'Twice-daily dosing less convenient than once-daily Ingrezza',
      'CYP2D6 genotyping recommended for dose optimization; poor metabolizers have increased exposure',
      'Boxed warning for depression and suicidality (from tetrabenazine class label) limits prescriber comfort'
    ],
    source: 'Teva Pharmaceutical 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'NBI-921352',
    company: 'Neurocrine Biosciences',
    indication: 'Tardive Dyskinesia',
    indication_specifics: 'Selective NaV1.6 sodium channel inhibitor under investigation as a non-VMAT2 approach for tardive dyskinesia',
    mechanism: 'Selective inhibitor of the NaV1.6 voltage-gated sodium channel subtype, which is preferentially expressed on excitatory neurons, reducing pathological hyperexcitability without broadly suppressing inhibitory neurotransmission',
    mechanism_category: 'sodium_channel_blocker',
    molecular_target: 'NaV1.6 voltage-gated sodium channel',
    phase: 'Phase 2',
    primary_endpoint: 'AIMS (Abnormal Involuntary Movement Scale) total score change from baseline',
    key_data: 'Phase 2 proof-of-concept study evaluating NBI-921352 in tardive dyskinesia. Primary development focus is SCN8A epilepsy; TD represents indication expansion. Novel mechanism distinct from VMAT2 inhibitors.',
    line_of_therapy: 'Second-line or alternative to VMAT2 inhibitors',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Non-VMAT2 mechanism offers a fundamentally different therapeutic approach for TD non-responders',
      'Selective NaV1.6 blockade may avoid the sedation and parkinsonism of less selective sodium channel blockers',
      'Neurocrine has deep TD market expertise and established commercial presence from Ingrezza'
    ],
    weaknesses: [
      'Very early clinical data in TD indication; mechanism not yet validated for movement disorders',
      'Primary development is in SCN8A epilepsy; TD development could be deprioritized',
      'Sodium channel blockers carry class-level cardiac and CNS safety monitoring requirements'
    ],
    source: 'Neurocrine Biosciences 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 13. Lennox-Gastaut Syndrome (LGS)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Epidiolex',
    generic_name: 'cannabidiol',
    company: 'Jazz Pharmaceuticals (GW Pharma)',
    indication: 'Lennox-Gastaut Syndrome',
    indication_specifics: 'Adjunctive treatment of seizures associated with Lennox-Gastaut syndrome in patients aged 1 year and older',
    mechanism: 'Plant-derived cannabidiol (CBD) with multi-target anticonvulsant effects including GPR55 antagonism, TRPV1 desensitization, adenosine reuptake inhibition, and T-type calcium channel modulation',
    mechanism_category: 'cannabinoid',
    molecular_target: 'GPR55 / TRPV1 / adenosine transporter / multiple',
    phase: 'Approved',
    primary_endpoint: 'Percent change from baseline in drop seizure (atonic, tonic, tonic-clonic) frequency per 28 days',
    key_data: 'GWPCARE3 (NCT02224560): 44% median reduction in drop seizures (20mg/kg/day) vs 22% placebo (p=0.0135); n=225. GWPCARE4 confirmed: 42% reduction vs 17% placebo (p=0.0047); n=171.',
    line_of_therapy: 'Adjunctive',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT02224560'],
    strengths: [
      'Strong clinical evidence from two confirmatory Phase 3 trials in LGS',
      'Effective against drop seizures, the most disabling and injury-causing seizure type in LGS',
      'Different mechanism from traditional ASMs allows meaningful add-on benefit in polytherapy'
    ],
    weaknesses: [
      'Drug-drug interactions require dose adjustments of concomitant clobazam and valproate',
      'Hepatotoxicity risk necessitating liver function test monitoring',
      'High annual cost (~$32,500/year) with GI side effects (diarrhea, vomiting) impacting adherence'
    ],
    source: 'Jazz Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Fintepla',
    generic_name: 'fenfluramine',
    company: 'UCB (Zogenix)',
    indication: 'Lennox-Gastaut Syndrome',
    indication_specifics: 'Treatment of seizures associated with Lennox-Gastaut syndrome in patients aged 2 years and older',
    mechanism: 'Serotonin-releasing agent and receptor agonist (5-HT1D, 5-HT2A, 5-HT2C) with sigma-1 receptor activity that reduces seizure susceptibility through modulation of serotonergic neurotransmission',
    mechanism_category: 'serotonin_modulator',
    molecular_target: 'Serotonin transporter (SERT) / 5-HT receptors / Sigma-1 receptor',
    phase: 'Approved',
    primary_endpoint: 'Percent change from baseline in frequency of drop seizures per 28 days',
    key_data: 'Study 1601 (NCT03355209): 26.5% median reduction in drop seizures (0.7 mg/kg/day) vs 7.6% placebo (p=0.0012); n=263. FDA approval for LGS in 2022, expanding beyond original Dravet indication.',
    line_of_therapy: 'Adjunctive',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT03355209'],
    strengths: [
      'Demonstrated significant reduction in the most disabling seizure type (drop seizures) in LGS',
      'Serotonergic mechanism provides complementary action to GABA-ergic and sodium channel blocking ASMs',
      'Growing clinical experience and comfort with fenfluramine from established Dravet syndrome use'
    ],
    weaknesses: [
      'REMS-mandated echocardiogram monitoring adds cost, complexity, and patient burden',
      'Moderate effect size (~26% drop seizure reduction) compared to some competing options',
      'Risk of decreased appetite and weight loss in patients who may already have nutritional challenges'
    ],
    source: 'UCB 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Ztalmy',
    generic_name: 'ganaxolone',
    company: 'Marinus Pharmaceuticals',
    indication: 'Lennox-Gastaut Syndrome',
    indication_specifics: 'Treatment of seizures associated with CDKL5 deficiency disorder and under investigation for broader developmental and epileptic encephalopathies including LGS',
    mechanism: 'Synthetic neuroactive steroid (neurosteroid) that is a positive allosteric modulator of both synaptic and extrasynaptic GABA-A receptors, enhancing tonic and phasic GABAergic inhibition to reduce seizure susceptibility',
    mechanism_category: 'neurosteroid_gaba_modulator',
    molecular_target: 'GABA-A receptor (synaptic and extrasynaptic)',
    phase: 'Approved',
    primary_endpoint: 'Percent change from baseline in major motor seizure frequency per 28 days',
    key_data: 'Marigold trial (NCT03572933) in CDKL5: 30.7% median reduction in major motor seizures vs 6.9% placebo (p=0.0036); n=101. FDA approved for CDKL5 deficiency disorder 2022. LGS evaluation ongoing.',
    line_of_therapy: 'Adjunctive',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT03572933'],
    strengths: [
      'First-in-class neurosteroid targeting both synaptic and extrasynaptic GABA-A receptors for broader inhibition',
      'Novel mechanism distinct from benzodiazepines; may work in benzodiazepine-resistant seizures',
      'Available in both oral and IV formulations providing flexibility across clinical settings'
    ],
    weaknesses: [
      'Primary approval in CDKL5 deficiency disorder; LGS-specific data limited and extrapolation uncertain',
      'Somnolence and sedation are common dose-limiting adverse effects (~25% of patients)',
      'Three-times-daily oral dosing creates adherence challenges, especially in pediatric populations'
    ],
    source: 'Marinus Pharmaceuticals 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 14. Duchenne Muscular Dystrophy - CNS Manifestations
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Givinostat',
    generic_name: 'givinostat',
    company: 'Italfarmaco',
    indication: 'Duchenne Muscular Dystrophy - CNS Manifestations',
    indication_specifics: 'HDAC inhibitor for DMD targeting muscle inflammation and fibrosis; potential CNS benefits through HDAC-mediated epigenetic modulation in dystrophin-deficient brain',
    mechanism: 'Pan-histone deacetylase (HDAC) inhibitor that modulates gene expression epigenetically, reducing muscle inflammation, fibrosis, and fatty infiltration. In the CNS, HDAC inhibition may improve synaptic plasticity and cognitive function in dystrophin-deficient neurons',
    mechanism_category: 'hdac_inhibitor',
    molecular_target: 'Histone deacetylases (class I and II HDACs)',
    phase: 'Phase 3',
    primary_endpoint: 'Change from baseline in four-stair climb velocity and North Star Ambulatory Assessment (NSAA)',
    key_data: 'EPIDYS Phase 3 (NCT02851797): Met primary endpoint showing significant reduction in functional decline. First non-exon-skipping, non-gene therapy approach for DMD. FDA approved for DMD 2024 (Duvyzat).',
    line_of_therapy: 'Add-on to corticosteroids',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT02851797'],
    strengths: [
      'First non-genetic disease-modifying therapy for DMD; applicable to all mutations regardless of exon',
      'Addresses muscle inflammation and fibrosis pathways downstream of dystrophin absence',
      'Oral formulation (strawberry-flavored suspension) suitable for pediatric administration'
    ],
    weaknesses: [
      'CNS effects are secondary/exploratory; not specifically developed or approved for DMD cognitive manifestations',
      'Pan-HDAC inhibition carries risks including thrombocytopenia, diarrhea, and potential long-term epigenetic effects',
      'Limited blood-brain barrier penetration may reduce CNS efficacy compared to peripheral muscle effects'
    ],
    source: 'Italfarmaco 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Pamrevlumab',
    generic_name: 'pamrevlumab',
    company: 'FibroGen',
    indication: 'Duchenne Muscular Dystrophy - CNS Manifestations',
    indication_specifics: 'Anti-CTGF antibody targeting connective tissue growth factor to reduce fibrosis in DMD; potential CNS effects through reduction of CTGF-mediated neuroinflammation',
    mechanism: 'Fully human monoclonal antibody targeting connective tissue growth factor (CTGF/CCN2), blocking fibrotic signaling cascades (TGF-beta, Wnt, integrin pathways) that drive progressive muscle replacement with fibrotic tissue',
    mechanism_category: 'anti_ctgf_antibody',
    molecular_target: 'Connective tissue growth factor (CTGF/CCN2)',
    phase: 'Phase 3',
    primary_endpoint: 'North Star Ambulatory Assessment (NSAA) total score change from baseline',
    key_data: 'LELANTOS-2 Phase 3 trial (NCT04632940): Evaluating pamrevlumab in non-ambulatory DMD. Earlier Phase 2 showed trends toward slowed functional decline. CTGF is also expressed in brain, with potential neuroprotective effects.',
    line_of_therapy: 'Add-on therapy',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    nct_ids: ['NCT04632940'],
    strengths: [
      'Anti-fibrotic mechanism applicable to all DMD patients regardless of dystrophin mutation type',
      'CTGF targeting addresses the fibrotic cascade that is the final common pathway of muscle destruction',
      'IV infusion every 2 weeks is manageable and well-tolerated in Phase 2 data'
    ],
    weaknesses: [
      'Phase 3 LELANTOS-1 in ambulatory DMD did not meet primary endpoint, raising efficacy concerns',
      'CNS effects are speculative; no clinical evidence of cognitive benefit in DMD patients',
      'IV infusion every 2 weeks creates treatment burden for a pediatric chronic disease population'
    ],
    source: 'FibroGen 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Casimersen',
    generic_name: 'casimersen',
    company: 'Sarepta Therapeutics',
    indication: 'Duchenne Muscular Dystrophy - CNS Manifestations',
    indication_specifics: 'Exon 45 skipping antisense oligonucleotide for DMD; restores truncated dystrophin production including brain-expressed isoforms',
    mechanism: 'Phosphorodiamidate morpholino oligomer (PMO) that binds exon 45 of dystrophin pre-mRNA, inducing exon skipping to restore the reading frame and produce a truncated but partially functional dystrophin protein',
    mechanism_category: 'exon_skipping_antisense',
    molecular_target: 'Dystrophin pre-mRNA exon 45',
    phase: 'Approved',
    primary_endpoint: 'Dystrophin protein production in muscle biopsy (Western blot, immunohistochemistry)',
    key_data: 'Accelerated FDA approval 2021 based on dystrophin production surrogate endpoint. ESSENCE trial (NCT02500381): Evaluating casimersen alongside golodirsen. Applicable to ~8% of DMD patients with exon 45-amenable mutations.',
    line_of_therapy: 'First-line (mutation-specific)',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT02500381'],
    strengths: [
      'Restores dystrophin production at the genetic level, addressing the fundamental molecular defect',
      'Approved therapy with established IV infusion protocol and growing real-world experience',
      'Dystrophin restoration may benefit CNS isoforms (Dp140, Dp71) important for cognitive function'
    ],
    weaknesses: [
      'Only applicable to ~8% of DMD patients amenable to exon 45 skipping',
      'Accelerated approval based on surrogate endpoint; clinical functional benefit not yet confirmed',
      'Weekly IV infusions (~35 mg/kg) are burdensome, and PMO technology has limited CNS penetration'
    ],
    source: 'Sarepta Therapeutics 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 15. Trigeminal Neuralgia
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'Carbamazepine',
    generic_name: 'carbamazepine',
    company: 'Generic (multiple manufacturers)',
    indication: 'Trigeminal Neuralgia',
    indication_specifics: 'First-line treatment for trigeminal neuralgia; voltage-gated sodium channel blocker reducing ectopic neuronal firing in the trigeminal nerve',
    mechanism: 'Use-dependent voltage-gated sodium channel blocker (primarily NaV1.7 and NaV1.8) that stabilizes inactivated sodium channels, reducing high-frequency repetitive firing in damaged trigeminal nerve fibers',
    mechanism_category: 'sodium_channel_blocker',
    molecular_target: 'Voltage-gated sodium channels (NaV1.7, NaV1.8)',
    phase: 'Approved',
    primary_endpoint: 'Pain frequency and severity reduction (VAS, number of paroxysms per day)',
    key_data: 'Gold standard for trigeminal neuralgia for 60+ years. Initial response rate 70-90%. NNT (number needed to treat) of 1.7-1.8 for meaningful pain relief. Evidence from multiple controlled trials dating to 1960s.',
    line_of_therapy: 'First-line',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Highest efficacy of any pharmacotherapy for trigeminal neuralgia with 70-90% initial response rate',
      'Decades of clinical experience establishing it as the unquestioned gold standard first-line treatment',
      'Very low cost as a widely available generic (~$15-30/month)'
    ],
    weaknesses: [
      'Significant drug interaction profile via CYP3A4 induction affecting many concomitant medications',
      'HLA-B*1502 pharmacogenomic testing required in Asian populations due to Stevens-Johnson syndrome risk',
      'CNS side effects (dizziness, ataxia, somnolence) and hyponatremia are dose-limiting in many patients'
    ],
    source: 'Generic 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Oxcarbazepine',
    generic_name: 'oxcarbazepine',
    company: 'Generic (multiple manufacturers)',
    indication: 'Trigeminal Neuralgia',
    indication_specifics: 'Second-line treatment for trigeminal neuralgia; keto-analog of carbamazepine with improved tolerability and fewer drug interactions',
    mechanism: 'Voltage-gated sodium channel blocker that stabilizes hyperexcited neuronal membranes via its active metabolite (10-monohydroxy derivative, MHD). Blocks high-frequency repetitive firing with fewer CYP-mediated drug interactions than carbamazepine',
    mechanism_category: 'sodium_channel_blocker',
    molecular_target: 'Voltage-gated sodium channels',
    phase: 'Approved',
    primary_endpoint: 'Pain frequency and severity reduction (VAS, paroxysm frequency)',
    key_data: 'Multiple open-label and controlled studies supporting efficacy comparable to carbamazepine. Response rate 60-85% in trigeminal neuralgia. Often used when carbamazepine is not tolerated. Better drug interaction profile.',
    line_of_therapy: 'First-line or second-line (carbamazepine alternative)',
    first_in_class: false,
    orphan_drug: false,
    has_biomarker_selection: false,
    strengths: [
      'Fewer CYP-mediated drug interactions than carbamazepine (no CYP3A4 auto-induction)',
      'Better overall tolerability profile with lower risk of serious dermatologic reactions',
      'Low cost as a generic medication with established insurance coverage'
    ],
    weaknesses: [
      'Less robust evidence base in trigeminal neuralgia compared to carbamazepine (fewer RCTs)',
      'Higher risk of clinically significant hyponatremia, especially in elderly patients',
      'Still carries sodium channel blocker class adverse effects (dizziness, ataxia, diplopia)'
    ],
    source: 'Generic 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'Vixotrigine',
    generic_name: 'vixotrigine',
    company: 'Biogen',
    indication: 'Trigeminal Neuralgia',
    indication_specifics: 'Selective NaV1.7 sodium channel blocker for trigeminal neuralgia with improved selectivity over carbamazepine',
    mechanism: 'Selective state-dependent inhibitor of NaV1.7 voltage-gated sodium channel, preferentially blocking the channel in its inactivated state to reduce ectopic firing in nociceptive trigeminal neurons while minimizing effects on normal neuronal function',
    mechanism_category: 'sodium_channel_blocker',
    molecular_target: 'NaV1.7 voltage-gated sodium channel',
    phase: 'Phase 3',
    primary_endpoint: 'Number of treatment failure-free days over the double-blind period',
    key_data: 'Phase 3 CONVEY trial (NCT03637387): Evaluating vixotrigine vs placebo in classical trigeminal neuralgia. Phase 2a showed 30% reduction in paroxysm days vs placebo. NaV1.7 selectivity expected to improve tolerability.',
    line_of_therapy: 'First-line or second-line',
    first_in_class: true,
    orphan_drug: false,
    has_biomarker_selection: false,
    nct_ids: ['NCT03637387'],
    strengths: [
      'Selective NaV1.7 targeting designed to separate analgesic efficacy from CNS/cardiac side effects of non-selective blockers',
      'Potential to displace carbamazepine as first-line with better tolerability and fewer drug interactions',
      'Biogen\'s neuroscience expertise and commercial infrastructure support development and launch'
    ],
    weaknesses: [
      'Phase 3 results not yet available; clinical validation of NaV1.7 selectivity advantage pending',
      'Must demonstrate meaningful superiority over very cheap and effective generic carbamazepine/oxcarbazepine',
      'NaV1.7-selective pain programs have had mixed clinical success historically across the industry'
    ],
    source: 'Biogen 2024',
    last_updated: '2025-01-15',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 16. Charcot-Marie-Tooth Disease (CMT)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    asset_name: 'PXT3003',
    company: 'Pharnext',
    indication: 'Charcot-Marie-Tooth Disease',
    indication_specifics: 'Fixed-dose combination therapy (baclofen, naltrexone, sorbitol) for CMT1A targeting PMP22 overexpression',
    mechanism: 'Synergistic fixed-dose combination of three repurposed drugs: baclofen (GABA-B agonist), naltrexone (opioid antagonist), and sorbitol (mTOR pathway modulator) that together reduce PMP22 gene overexpression, the cause of CMT1A',
    mechanism_category: 'combination_pmp22_modulator',
    molecular_target: 'PMP22 gene expression (via GABA-B, opioid receptor, mTOR pathways)',
    phase: 'Phase 3',
    primary_endpoint: 'Overall Neuropathy Limitations Scale (ONLS) score change from baseline',
    key_data: 'PLEO-CMT Phase 3 (NCT02579759): Initial Phase 3 invalidated due to formulation stability issue. Reformulated PXT3003 in repeat Phase 3 (NCT04762758). Phase 2 showed dose-dependent improvement in ONLS and CMTNS. Most advanced therapy for CMT1A.',
    line_of_therapy: 'First-line (disease-modifying)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    nct_ids: ['NCT02579759', 'NCT04762758'],
    strengths: [
      'Most advanced therapeutic program for CMT1A, a disease with zero approved disease-modifying treatments',
      'Addresses root cause (PMP22 overexpression) using repurposed drugs with known safety profiles',
      'Oral combination therapy is highly convenient compared to gene therapy or ASO alternatives'
    ],
    weaknesses: [
      'First Phase 3 trial invalidated due to drug formulation stability issue, delaying development by years',
      'CMT1A progresses slowly, making clinical trial endpoints difficult to achieve in reasonable timeframes',
      'Pharnext faced financial difficulties requiring restructuring, raising execution risk concerns'
    ],
    source: 'Pharnext 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'BIIB100',
    generic_name: 'BIIB100',
    company: 'Biogen',
    indication: 'Charcot-Marie-Tooth Disease',
    indication_specifics: 'Antisense oligonucleotide designed to reduce PMP22 mRNA expression in Schwann cells for treatment of CMT1A',
    mechanism: 'Antisense oligonucleotide (ASO) targeting PMP22 mRNA to reduce overexpression of peripheral myelin protein 22 in Schwann cells, addressing the gene dosage mechanism underlying CMT1A demyelinating neuropathy',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'PMP22 mRNA',
    phase: 'Phase 1',
    primary_endpoint: 'Safety and tolerability; PMP22 mRNA levels in skin biopsies; nerve conduction studies',
    key_data: 'Phase 1 first-in-human study initiated to evaluate safety and target engagement. Preclinical data in CMT1A rodent models showed reduction in PMP22 expression and improvement in myelination. Intrathecal or subcutaneous delivery under evaluation.',
    line_of_therapy: 'First-line (disease-modifying)',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Direct PMP22 mRNA knockdown is mechanistically the most precise approach to CMT1A gene dosage',
      'Biogen has extensive ASO platform experience and CNS delivery expertise from Spinraza program',
      'Skin biopsy PMP22 biomarker enables non-invasive pharmacodynamic monitoring'
    ],
    weaknesses: [
      'Very early stage (Phase 1) with many years of development remaining before potential approval',
      'Optimal delivery route for peripheral nerve Schwann cell targeting remains uncertain',
      'ASO-class effects (injection site reactions, thrombocytopenia) may limit chronic dosing'
    ],
    source: 'Biogen 2024',
    last_updated: '2025-01-15',
  },
  {
    asset_name: 'IFB-088',
    generic_name: 'sephin1',
    company: 'InFlectis BioScience',
    indication: 'Charcot-Marie-Tooth Disease',
    indication_specifics: 'Selective inhibitor of stress-induced phosphatase PPP1R15A (GADD34) to enhance the integrated stress response and improve protein folding in CMT1B',
    mechanism: 'Selective inhibitor of the stress-induced regulatory subunit of protein phosphatase 1 (PPP1R15A/GADD34) that prolongs the integrated stress response (ISR), enhancing proteostasis and reducing accumulation of misfolded myelin protein zero (MPZ) in Schwann cells',
    mechanism_category: 'integrated_stress_response_modulator',
    molecular_target: 'PPP1R15A (GADD34) / Integrated stress response pathway',
    phase: 'Phase 1',
    primary_endpoint: 'Safety and tolerability; pharmacokinetics; exploratory nerve conduction parameters',
    key_data: 'Phase 1 study evaluating oral IFB-088 (sephin1) in healthy volunteers and CMT1B patients. Strong preclinical data showing improved myelination, motor function, and nerve conduction in CMT1B mouse models. Oral daily dosing.',
    line_of_therapy: 'First-line (disease-modifying)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First-in-class mechanism targeting cellular proteostasis via the integrated stress response',
      'Oral once-daily dosing offers convenience advantage for a chronic peripheral neuropathy',
      'Strong preclinical evidence of improved myelination and nerve function in CMT1B animal models'
    ],
    weaknesses: [
      'Very early clinical stage with no human efficacy data; therapeutic concept remains unproven',
      'Targets CMT1B (MPZ mutations), which is rarer than CMT1A, further limiting market size',
      'Small biotech company (InFlectis) with limited resources for late-stage development and commercialization'
    ],
    source: 'InFlectis BioScience 2024',
    last_updated: '2025-01-15',
  },
];
