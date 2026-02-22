import type { CompetitorRecord } from './competitor-database';

export const RARE_DISEASE_COMPETITORS: CompetitorRecord[] = [
  // ─── 1. Gaucher Disease ───
  {
    asset_name: 'Cerezyme',
    generic_name: 'imiglucerase',
    company: 'Sanofi',
    indication: 'Gaucher Disease',
    indication_specifics: 'Type 1 Gaucher disease for long-term enzyme replacement therapy',
    mechanism: 'Recombinant glucocerebrosidase enzyme replacement that catalyzes hydrolysis of glucocerebroside to glucose and ceramide',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Glucocerebrosidase (GBA)',
    phase: 'Approved',
    primary_endpoint: 'Reduction in spleen and liver volume; improvement in hematologic parameters',
    key_data: 'Over 25 years of clinical experience; demonstrated reductions in spleen volume of 50-60% within 1-2 years',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Gold standard with extensive long-term safety and efficacy data',
      'Well-established global supply chain and manufacturing',
      'Broad label covering multiple disease manifestations'
    ],
    weaknesses: [
      'Requires biweekly intravenous infusions',
      'High annual cost exceeding $300,000',
      'Does not cross the blood-brain barrier for neuronopathic forms'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Cerdelga',
    generic_name: 'eliglustat',
    company: 'Sanofi',
    indication: 'Gaucher Disease',
    indication_specifics: 'Oral substrate reduction therapy for adults with type 1 Gaucher disease who are CYP2D6 extensive, intermediate, or poor metabolizers',
    mechanism: 'Oral ceramide analogue that inhibits glucosylceramide synthase, reducing substrate accumulation',
    mechanism_category: 'substrate_reduction',
    molecular_target: 'Glucosylceramide synthase',
    phase: 'Approved',
    primary_endpoint: 'Composite endpoint of spleen volume, liver volume, hemoglobin, and platelet count stability',
    key_data: 'ENGAGE and ENCORE trials showed non-inferiority to Cerezyme; 85% of patients maintained stability at 4 years',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First oral therapy for Gaucher disease, improving patient convenience',
      'Non-inferior efficacy to enzyme replacement therapy in clinical trials',
      'Stable long-term disease control demonstrated over 4+ years'
    ],
    weaknesses: [
      'Requires CYP2D6 genotyping prior to initiation',
      'Drug-drug interaction potential due to CYP2D6 metabolism',
      'Not suitable for ultrarapid CYP2D6 metabolizers (~5-10% of population)'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Venglustat',
    company: 'Sanofi',
    indication: 'Gaucher Disease',
    indication_specifics: 'Next-generation brain-penetrant substrate reduction therapy for GBA-associated neurological disease',
    mechanism: 'Brain-penetrant glucosylceramide synthase inhibitor designed to reduce glycosphingolipid accumulation in the CNS',
    mechanism_category: 'substrate_reduction',
    molecular_target: 'Glucosylceramide synthase',
    phase: 'Phase 3',
    primary_endpoint: 'Change in neurological severity score and CNS biomarkers',
    key_data: 'Phase 2 data showed CNS penetration and reduction in plasma GL-1 levels; Phase 3 LEAP trial ongoing',
    line_of_therapy: '1L',
    nct_ids: ['NCT05765006'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Brain-penetrant design addressing unmet need in neuronopathic Gaucher',
      'Oral administration with once-daily dosing',
      'Potential platform molecule for other glycosphingolipid storage disorders'
    ],
    weaknesses: [
      'Mixed results in Parkinson disease GBA trial raise efficacy questions',
      'Competes with established Sanofi portfolio creating internal cannibalization risk',
      'Long development timeline with uncertain regulatory path for CNS indications'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },

  // ─── 2. Pompe Disease ───
  {
    asset_name: 'Lumizyme',
    generic_name: 'alglucosidase alfa',
    company: 'Sanofi',
    indication: 'Pompe Disease',
    indication_specifics: 'Enzyme replacement therapy for infantile-onset and late-onset Pompe disease',
    mechanism: 'Recombinant human acid alpha-glucosidase that replaces deficient GAA enzyme to clear glycogen from lysosomes',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Acid alpha-glucosidase (GAA)',
    phase: 'Approved',
    primary_endpoint: 'Ventilator-free survival (infantile-onset); stabilization of pulmonary function and 6-minute walk test (late-onset)',
    key_data: 'LOTS trial showed significant improvement in walking distance and stabilization of pulmonary function vs placebo',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First approved therapy for Pompe disease with proven survival benefit in infantile-onset',
      'Over 15 years of real-world safety data',
      'Established standard of care across all ages'
    ],
    weaknesses: [
      'Suboptimal muscle uptake via mannose-6-phosphate receptor',
      'Biweekly IV infusions with infusion-associated reactions',
      'Declining efficacy over time in some patients due to antibody development'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Nexviazyme',
    generic_name: 'avalglucosidase alfa',
    company: 'Sanofi',
    indication: 'Pompe Disease',
    indication_specifics: 'Next-generation ERT with enhanced cellular uptake for late-onset Pompe disease',
    mechanism: 'Recombinant GAA with high mannose-6-phosphate content for enhanced cellular uptake via cation-independent M6P receptor',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Acid alpha-glucosidase (GAA)',
    phase: 'Approved',
    primary_endpoint: 'Change in respiratory function (FVC % predicted) and 6-minute walk test distance',
    key_data: 'COMET trial showed superiority over alglucosidase alfa in respiratory function improvement (+2.9% FVC difference)',
    line_of_therapy: '1L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Superior respiratory outcomes vs first-generation ERT in head-to-head trial',
      'Enhanced M6P targeting improves enzyme delivery to muscle',
      'Growing body of real-world evidence supporting switch from Lumizyme'
    ],
    weaknesses: [
      'Still requires biweekly IV infusions',
      'Premium pricing over first-generation ERT',
      'Limited long-term data compared to Lumizyme'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Cipaglucosidase alfa+miglustat',
    generic_name: 'cipaglucosidase alfa with miglustat',
    company: 'Amicus',
    indication: 'Pompe Disease',
    indication_specifics: 'Two-component therapy combining ERT with oral chaperone stabilizer for late-onset Pompe disease',
    mechanism: 'Unique ERT plus chaperone approach: cipaglucosidase alfa provides enzyme replacement while oral miglustat stabilizes the enzyme in the bloodstream',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Acid alpha-glucosidase (GAA)',
    phase: 'Approved',
    primary_endpoint: 'Change in 6-minute walk test distance and FVC % predicted',
    key_data: 'PROPEL trial showed clinically meaningful improvements in 6MWT (+20.8m) and respiratory function in ERT-experienced patients',
    line_of_therapy: '1L/2L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Novel chaperone-stabilized approach improves enzyme half-life and tissue delivery',
      'Differentiated mechanism vs standard ERT may benefit ERT-experienced patients',
      'Strong clinical data in both treatment-naive and switch populations'
    ],
    weaknesses: [
      'Two-component regimen adds dosing complexity',
      'Oral miglustat must be timed precisely with IV infusion',
      'Smaller company with limited commercial infrastructure vs Sanofi'
    ],
    source: 'Amicus 2024',
    last_updated: '2025-01-15'
  },

  // ─── 3. Fabry Disease ───
  {
    asset_name: 'Fabrazyme',
    generic_name: 'agalsidase beta',
    company: 'Sanofi',
    indication: 'Fabry Disease',
    indication_specifics: 'Enzyme replacement therapy for Fabry disease to reduce GL-3 accumulation',
    mechanism: 'Recombinant human alpha-galactosidase A that clears accumulated globotriaosylceramide (GL-3) from tissues',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Alpha-galactosidase A (GLA)',
    phase: 'Approved',
    primary_endpoint: 'Reduction in plasma and tissue GL-3 levels; composite renal, cardiac, and cerebrovascular events',
    key_data: 'Over 20 years of experience; shown to reduce risk of major clinical events by 53% in long-term follow-up studies',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Longest track record of any Fabry therapy with robust long-term data',
      'Proven reduction in major organ complications',
      'Global availability and established treatment protocols'
    ],
    weaknesses: [
      'Biweekly IV infusions lasting 2-4 hours',
      'Infusion-associated reactions in up to 50% of patients',
      'Formation of anti-drug antibodies can reduce efficacy in classic male patients'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Galafold',
    generic_name: 'migalastat',
    company: 'Amicus',
    indication: 'Fabry Disease',
    indication_specifics: 'Oral pharmacological chaperone for adults with amenable GLA mutations',
    mechanism: 'Small molecule pharmacological chaperone that stabilizes misfolded alpha-galactosidase A, restoring enzyme trafficking and activity',
    mechanism_category: 'chaperone_therapy',
    molecular_target: 'Alpha-galactosidase A (GLA)',
    phase: 'Approved',
    primary_endpoint: 'Change in kidney interstitial capillary GL-3 inclusions; long-term renal and cardiac function',
    key_data: 'ATTRACT trial demonstrated stable renal function over 24 months; FACETS showed significant GL-3 reduction in amenable patients',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only oral therapy for Fabry disease, taken every other day',
      'Avoids infusion-associated reactions and anti-drug antibodies',
      'Favorable long-term renal and cardiac stabilization data'
    ],
    weaknesses: [
      'Only effective in patients with amenable GLA mutations (~35-50% of patients)',
      'Requires genetic testing and in vitro amenability assay',
      'Less clinical experience compared to enzyme replacement therapies'
    ],
    source: 'Amicus 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Pegunigalsidase alfa',
    generic_name: 'pegunigalsidase alfa',
    company: 'Protalix/Chiesi',
    indication: 'Fabry Disease',
    indication_specifics: 'PEGylated enzyme replacement therapy with extended half-life for adult Fabry disease',
    mechanism: 'PEGylated plant cell-derived recombinant alpha-galactosidase A with prolonged circulatory half-life and reduced immunogenicity',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Alpha-galactosidase A (GLA)',
    phase: 'Approved',
    primary_endpoint: 'Annualized rate of change in eGFR; plasma GL-3 reduction',
    key_data: 'BALANCE trial demonstrated non-inferior renal function preservation vs agalsidase beta; BRIDGE trial showed stable switch from other ERTs',
    line_of_therapy: '1L/2L',
    partner: 'Chiesi',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Extended half-life allows every 4-week dosing option',
      'PEGylation reduces immunogenicity and antibody formation',
      'Suitable for patients who developed antibodies to other ERTs'
    ],
    weaknesses: [
      'Still requires IV administration',
      'Third-to-market in ERT class with established competitors',
      'Plant cell-derived manufacturing may face supply scaling challenges'
    ],
    source: 'Protalix/Chiesi 2024',
    last_updated: '2025-01-15'
  },

  // ─── 4. Hereditary Angioedema ───
  {
    asset_name: 'Takhzyro',
    generic_name: 'lanadelumab',
    company: 'Takeda',
    indication: 'Hereditary Angioedema',
    indication_specifics: 'Prophylactic treatment to prevent HAE attacks in patients aged 12 and older',
    mechanism: 'Fully human monoclonal antibody that inhibits plasma kallikrein, preventing excess bradykinin generation',
    mechanism_category: 'monoclonal_antibody',
    molecular_target: 'Plasma kallikrein',
    phase: 'Approved',
    primary_endpoint: 'Monthly HAE attack rate during steady-state dosing period',
    key_data: 'HELP trial showed 87% reduction in attack rate vs placebo; 77% of patients achieved zero attacks at every-2-week dosing',
    line_of_therapy: '1L prophylaxis',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Best-in-class attack rate reduction with majority of patients attack-free',
      'Convenient subcutaneous self-injection every 2 weeks',
      'Strong durability data with sustained efficacy over 2.5+ years'
    ],
    weaknesses: [
      'Injectable administration limits convenience vs oral options',
      'Injection site reactions in approximately 30% of patients',
      'Premium pricing in increasingly competitive prophylaxis market'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Orladeyo',
    generic_name: 'berotralstat',
    company: 'BioCryst',
    indication: 'Hereditary Angioedema',
    indication_specifics: 'Once-daily oral prophylactic therapy to prevent HAE attacks',
    mechanism: 'Oral small molecule inhibitor of plasma kallikrein that reduces bradykinin-mediated vascular permeability',
    mechanism_category: 'small_molecule_inhibitor',
    molecular_target: 'Plasma kallikrein',
    phase: 'Approved',
    primary_endpoint: 'Rate of investigator-confirmed HAE attacks per month',
    key_data: 'APeX-2 trial showed 44% reduction in attack rate at 150mg dose vs placebo; sustained efficacy through 48-week open-label extension',
    line_of_therapy: '1L prophylaxis',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'First and only oral once-daily prophylaxis for HAE',
      'No injection burden, improving adherence and patient preference',
      'Generally well-tolerated with manageable GI side effects'
    ],
    weaknesses: [
      'Lower attack rate reduction compared to Takhzyro in cross-trial comparison',
      'GI adverse events (abdominal pain, diarrhea) may limit tolerability',
      'Requires daily dosing adherence for optimal prophylaxis'
    ],
    source: 'BioCryst 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Donidalorsen',
    company: 'Ionis',
    indication: 'Hereditary Angioedema',
    indication_specifics: 'Antisense oligonucleotide targeting prekallikrein mRNA for HAE prophylaxis',
    mechanism: 'Ligand-conjugated antisense oligonucleotide that degrades prekallikrein mRNA in the liver, reducing plasma prekallikrein levels',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'Prekallikrein (KLKB1) mRNA',
    phase: 'Phase 3',
    primary_endpoint: 'Rate of HAE attacks per month vs placebo',
    key_data: 'Phase 2 OASIs trial showed 90% reduction in attack rate; monthly SC dosing',
    line_of_therapy: '1L prophylaxis',
    nct_ids: ['NCT05392114'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Monthly subcutaneous dosing offers dosing convenience advantage',
      'Impressive Phase 2 attack rate reduction of ~90%',
      'Upstream mechanism addressing root cause of kallikrein overproduction'
    ],
    weaknesses: [
      'Late-stage clinical risk with Phase 3 results pending',
      'Antisense class carries potential hepatotoxicity and injection site reaction risks',
      'Competitive market with multiple approved prophylactic options'
    ],
    source: 'Ionis 2024',
    last_updated: '2025-01-15'
  },

  // ─── 5. Phenylketonuria ───
  {
    asset_name: 'Palynziq',
    generic_name: 'pegvaliase',
    company: 'BioMarin',
    indication: 'Phenylketonuria',
    indication_specifics: 'Enzyme substitution therapy for adults with PKU and uncontrolled blood Phe levels',
    mechanism: 'PEGylated recombinant phenylalanine ammonia lyase (PAL) that converts phenylalanine to trans-cinnamic acid and ammonia',
    mechanism_category: 'enzyme_substitution',
    molecular_target: 'Phenylalanine (substrate)',
    phase: 'Approved',
    primary_endpoint: 'Blood phenylalanine levels reduction to below 600 umol/L',
    key_data: 'PRISM-2 showed 51% of patients achieved Phe levels <=360 umol/L; mean Phe reduction of 58% from baseline',
    line_of_therapy: '2L (after dietary management)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only enzyme therapy that can normalize blood Phe in classical PKU patients',
      'Enables dietary liberalization significantly improving quality of life',
      'Self-injectable with proven long-term efficacy'
    ],
    weaknesses: [
      'REMS program required due to anaphylaxis risk (~9% of patients)',
      'High immunogenicity requiring induction/titration over months',
      'Daily self-injection with injection site reactions in majority of patients'
    ],
    source: 'BioMarin 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Kuvan',
    generic_name: 'sapropterin',
    company: 'BioMarin',
    indication: 'Phenylketonuria',
    indication_specifics: 'Oral BH4 cofactor therapy for PKU patients with residual PAH activity',
    mechanism: 'Synthetic form of tetrahydrobiopterin (BH4), the natural cofactor of phenylalanine hydroxylase, that enhances residual enzyme activity',
    mechanism_category: 'cofactor_therapy',
    molecular_target: 'Phenylalanine hydroxylase (PAH)',
    phase: 'Approved',
    primary_endpoint: 'Reduction in blood phenylalanine levels; BH4 responsiveness',
    key_data: 'Approximately 20-50% of PKU patients are BH4-responsive; responders show mean Phe reduction of ~30%',
    line_of_therapy: '1L adjunct',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Oral formulation with once-daily dosing',
      'Well-tolerated with favorable long-term safety profile',
      'Approved for use in pediatric patients as young as 1 month'
    ],
    weaknesses: [
      'Only effective in BH4-responsive patients (minority of classical PKU)',
      'Modest Phe reduction often still requires significant dietary restriction',
      'Generic competition and loss of exclusivity'
    ],
    source: 'BioMarin 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Sepiapterin',
    company: 'PTC Therapeutics',
    indication: 'Phenylketonuria',
    indication_specifics: 'Oral synthetic sepiapterin for broad-spectrum BH4 augmentation in PKU',
    mechanism: 'Oral sepiapterin is converted to BH4 via salvage pathway, bypassing the rate-limiting de novo synthesis step and achieving higher intracellular BH4 levels',
    mechanism_category: 'cofactor_therapy',
    molecular_target: 'Phenylalanine hydroxylase (PAH) via BH4 augmentation',
    phase: 'Phase 3',
    primary_endpoint: 'Change in blood phenylalanine from baseline',
    key_data: 'Phase 2 APHENITY showed 63% mean Phe reduction with 80% of patients achieving Phe <360 umol/L, including patients non-responsive to sapropterin',
    line_of_therapy: '1L',
    nct_ids: ['NCT05532917'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Superior BH4 augmentation through salvage pathway may respond in more patients than Kuvan',
      'Impressive Phase 2 Phe reductions exceeding sapropterin historical benchmarks',
      'Oral once-daily dosing with potential for broad PKU patient coverage'
    ],
    weaknesses: [
      'Phase 3 confirmation of Phase 2 results still required',
      'Durability and long-term safety profile not yet established',
      'Will need to demonstrate clear superiority over generic sapropterin for market uptake'
    ],
    source: 'PTC Therapeutics 2024',
    last_updated: '2025-01-15'
  },

  // ─── 6. Wilson Disease ───
  {
    asset_name: 'Syprine',
    generic_name: 'trientine',
    company: 'Bausch',
    indication: 'Wilson Disease',
    indication_specifics: 'Copper chelation therapy for Wilson disease patients intolerant to penicillamine',
    mechanism: 'Polyamine chelator that binds copper in the intestine and bloodstream, promoting urinary copper excretion',
    mechanism_category: 'chelation_therapy',
    molecular_target: 'Free copper ions',
    phase: 'Approved',
    primary_endpoint: 'Normalization of free serum copper and 24-hour urinary copper excretion',
    key_data: 'Decades of clinical experience as second-line chelator; effective in >80% of penicillamine-intolerant patients',
    line_of_therapy: '2L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Better tolerability profile than penicillamine',
      'Established efficacy in hepatic and neurological Wilson disease',
      'Oral administration with straightforward dosing'
    ],
    weaknesses: [
      'Requires multiple daily doses on empty stomach',
      'Iron deficiency anemia as a class-related side effect',
      'Supply constraints and high cost for a decades-old drug'
    ],
    source: 'Bausch 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'ALXN1840',
    generic_name: 'bis-choline tetrathiomolybdate',
    company: 'Alexion',
    indication: 'Wilson Disease',
    indication_specifics: 'Novel copper-protein binding agent with dual mechanism for Wilson disease',
    mechanism: 'Tetrathiomolybdate forms tripartite complexes with copper and albumin, simultaneously reducing free copper and promoting biliary copper excretion',
    mechanism_category: 'chelation_therapy',
    molecular_target: 'Free and albumin-bound copper',
    phase: 'Phase 3',
    primary_endpoint: 'Normalized corrected non-ceruloplasmin-bound copper (NCC) at 48 weeks',
    key_data: 'Phase 3 FoCus trial showed superiority vs standard of care in NCC normalization; rapid copper control within weeks',
    line_of_therapy: '1L',
    nct_ids: ['NCT03403205'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Dual mechanism of copper chelation and copper-protein complex formation',
      'Once-daily oral dosing with rapid onset of copper control',
      'Potential to become new standard of care if Phase 3 confirms superiority'
    ],
    weaknesses: [
      'Transaminase elevations reported in clinical trials',
      'Novel mechanism requires long-term safety characterization',
      'Regulatory pathway complexity with existing generic chelators available'
    ],
    source: 'Alexion 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Penicillamine',
    generic_name: 'penicillamine',
    company: 'generic',
    indication: 'Wilson Disease',
    indication_specifics: 'First-line copper chelation therapy for Wilson disease',
    mechanism: 'Thiol-based chelator that binds copper and promotes urinary excretion, reducing tissue copper stores',
    mechanism_category: 'chelation_therapy',
    molecular_target: 'Free copper ions',
    phase: 'Approved',
    primary_endpoint: 'Normalization of serum free copper and urinary copper excretion',
    key_data: 'First approved chelator for Wilson disease; decades of clinical experience; effective but significant toxicity',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Longest clinical experience of any Wilson disease therapy',
      'Low cost as a generic medication',
      'Highly effective copper chelation with proven long-term outcomes'
    ],
    weaknesses: [
      'High rate of adverse effects including nephrotoxicity and bone marrow suppression',
      'Can paradoxically worsen neurological symptoms early in treatment',
      'Approximately 30% of patients discontinue due to intolerance'
    ],
    source: 'FDA label 2024',
    last_updated: '2025-01-15'
  },

  // ─── 7. Lysosomal Acid Lipase Deficiency ───
  {
    asset_name: 'Kanuma',
    generic_name: 'sebelipase alfa',
    company: 'Alexion',
    indication: 'Lysosomal Acid Lipase Deficiency',
    indication_specifics: 'Enzyme replacement therapy for LAL deficiency across all ages and phenotypes',
    mechanism: 'Recombinant human lysosomal acid lipase that restores hydrolysis of cholesteryl esters and triglycerides in lysosomes',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Lysosomal acid lipase (LAL)',
    phase: 'Approved',
    primary_endpoint: 'Normalization of ALT; reduction in hepatic fat content and lipid parameters',
    key_data: 'ARISE trial showed ALT normalization in 31% vs 7% placebo; significant improvements in LDL-C and hepatic fat',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only approved therapy for LAL deficiency across all ages',
      'Demonstrated survival benefit in rapidly progressive infantile-onset form',
      'Significant improvements in liver disease and dyslipidemia markers'
    ],
    weaknesses: [
      'Biweekly IV infusions required for life',
      'Limited awareness of LAL deficiency leads to underdiagnosis and small market',
      'Infusion-associated reactions and anti-drug antibody formation'
    ],
    source: 'Alexion 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy approaches',
    company: 'various',
    indication: 'Lysosomal Acid Lipase Deficiency',
    indication_specifics: 'AAV-based gene therapy to provide durable LAL enzyme expression',
    mechanism: 'Adeno-associated virus vector delivering functional LIPA gene to hepatocytes for endogenous LAL production',
    mechanism_category: 'gene_therapy',
    molecular_target: 'LIPA gene',
    phase: 'Preclinical',
    primary_endpoint: 'Sustained LAL enzyme activity and normalization of hepatic lipid storage',
    key_data: 'Preclinical models show durable LAL expression and correction of lipid storage; IND-enabling studies ongoing',
    line_of_therapy: '1L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Potential for one-time curative treatment eliminating need for lifelong ERT',
      'Liver-directed AAV approach leverages established gene therapy platform',
      'Addresses root cause of disease at the genetic level'
    ],
    weaknesses: [
      'Very early stage with significant development risk',
      'Pre-existing AAV antibodies may exclude a subset of patients',
      'Durability of transgene expression in the liver remains uncertain'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Small molecule chaperone',
    company: 'Amicus',
    indication: 'Lysosomal Acid Lipase Deficiency',
    indication_specifics: 'Pharmacological chaperone to stabilize mutant LAL enzyme',
    mechanism: 'Small molecule pharmacological chaperone that binds and stabilizes misfolded LAL enzyme, restoring proper lysosomal trafficking and activity',
    mechanism_category: 'chaperone_therapy',
    molecular_target: 'Lysosomal acid lipase (LAL)',
    phase: 'Phase 1',
    primary_endpoint: 'Safety, tolerability, and change in LAL enzyme activity',
    key_data: 'Early-stage development leveraging Amicus chaperone platform validated in Fabry and Pompe diseases',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Oral administration would be highly differentiated vs IV ERT',
      'Leverages proven pharmacological chaperone platform from Amicus',
      'Potential for combination with ERT to enhance enzyme stability'
    ],
    weaknesses: [
      'Very early clinical development with high failure risk',
      'Chaperone approach depends on patients having amenable mutations',
      'Small patient population limits commercial opportunity'
    ],
    source: 'Amicus 2024',
    last_updated: '2025-01-15'
  },

  // ─── 8. Acute Hepatic Porphyria ───
  {
    asset_name: 'Givlaari',
    generic_name: 'givosiran',
    company: 'Alnylam',
    indication: 'Acute Hepatic Porphyria',
    indication_specifics: 'RNAi therapeutic for prevention of acute attacks in adults with AHP',
    mechanism: 'GalNAc-conjugated siRNA that silences aminolevulinic acid synthase 1 (ALAS1) mRNA in hepatocytes, reducing neurotoxic heme intermediates ALA and PBG',
    mechanism_category: 'rnai',
    molecular_target: 'ALAS1 mRNA',
    phase: 'Approved',
    primary_endpoint: 'Annualized rate of porphyria attacks requiring hospitalization, IV hemin, or urgent healthcare visit',
    key_data: 'ENVISION trial showed 74% reduction in annualized attack rate vs placebo; sustained ALA and PBG reductions',
    line_of_therapy: '1L prophylaxis',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First disease-modifying therapy targeting root cause of acute attacks',
      'Monthly subcutaneous injection with sustained biomarker suppression',
      'Addresses all four types of acute hepatic porphyria'
    ],
    weaknesses: [
      'Hepatotoxicity with ALT elevations requiring monitoring',
      'Renal adverse events including increased serum creatinine',
      'Annual cost exceeding $500,000 limits accessibility'
    ],
    source: 'Alnylam 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Hematin',
    generic_name: 'hemin',
    company: 'Recordati',
    indication: 'Acute Hepatic Porphyria',
    indication_specifics: 'IV hemin for treatment of acute porphyria attacks',
    mechanism: 'Exogenous hemin replenishes hepatic heme pool, suppressing ALAS1 via negative feedback and reducing accumulation of neurotoxic ALA and PBG',
    mechanism_category: 'enzyme_regulation',
    molecular_target: 'ALAS1 (indirect via heme feedback)',
    phase: 'Approved',
    primary_endpoint: 'Resolution of acute attack symptoms; reduction in urinary ALA and PBG',
    key_data: 'Standard of care for acute attacks for over 30 years; rapid symptom relief in majority of patients',
    line_of_therapy: '1L acute treatment',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Rapid onset of action for acute attack management',
      'Decades of clinical experience and well-understood pharmacology',
      'Only approved treatment for acute porphyria attacks'
    ],
    weaknesses: [
      'Requires IV administration during acute attacks, often in hospital setting',
      'Phlebitis and iron overload with repeated use',
      'Does not prevent attacks; purely reactive treatment'
    ],
    source: 'Recordati 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy',
    company: 'Ultragenyx',
    indication: 'Acute Hepatic Porphyria',
    indication_specifics: 'AAV-based gene therapy delivering functional PBGD gene for acute intermittent porphyria',
    mechanism: 'Adeno-associated virus vector delivering porphobilinogen deaminase (PBGD) gene to hepatocytes to restore heme biosynthesis',
    mechanism_category: 'gene_therapy',
    molecular_target: 'HMBS (PBGD) gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety; reduction in annualized attack rate and urinary ALA/PBG levels',
    key_data: 'Early clinical data show transient PBGD expression and ALA/PBG reduction; durability of expression remains a challenge',
    line_of_therapy: '1L',
    nct_ids: ['NCT04684121'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Potential for one-time curative treatment of acute intermittent porphyria',
      'Addresses root genetic cause rather than downstream pathway modulation',
      'Ultragenyx gene therapy platform with multiple clinical programs'
    ],
    weaknesses: [
      'Early clinical data show limited durability of transgene expression',
      'AAV liver-directed gene therapy has immunogenicity challenges',
      'Competes with highly effective RNAi standard of care (Givlaari)'
    ],
    source: 'Ultragenyx 2024',
    last_updated: '2025-01-15'
  },

  // ─── 9. Hemophilia B ───
  {
    asset_name: 'Hemgenix',
    generic_name: 'etranacogene dezaparvovec',
    company: 'CSL Behring',
    indication: 'Hemophilia B',
    indication_specifics: 'One-time AAV5-based gene therapy for adults with severe or moderately severe hemophilia B',
    mechanism: 'Adeno-associated virus serotype 5 vector delivering a gain-of-function Padua variant of human Factor IX transgene to hepatocytes',
    mechanism_category: 'gene_therapy',
    molecular_target: 'Factor IX (FIX) gene',
    phase: 'Approved',
    primary_endpoint: 'Annualized bleeding rate and Factor IX activity levels',
    key_data: 'HOPE-B trial showed 54% reduction in ABR; mean FIX activity of 39% at 18 months; 96% of patients discontinued prophylaxis',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'One-time treatment with potential for long-term FIX expression',
      'Padua variant provides superior FIX activity per vector dose',
      'Majority of patients achieved FIX levels in mild hemophilia range'
    ],
    weaknesses: [
      'Highest-priced therapy at $3.5 million per dose',
      'Requires monitoring for hepatotoxicity and immunosuppression',
      'Pre-existing AAV5 antibodies may exclude some patients'
    ],
    source: 'CSL Behring 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Alprolix',
    generic_name: 'eftrenonacog alfa',
    company: 'Sanofi',
    indication: 'Hemophilia B',
    indication_specifics: 'Extended half-life recombinant Factor IX Fc fusion protein for hemophilia B prophylaxis and on-demand treatment',
    mechanism: 'Recombinant Factor IX fused to IgG1 Fc domain, leveraging FcRn recycling pathway to extend circulating half-life',
    mechanism_category: 'factor_replacement',
    molecular_target: 'Factor IX',
    phase: 'Approved',
    primary_endpoint: 'Annualized bleeding rate; Factor IX trough levels',
    key_data: 'B-LONG trial showed median ABR of 1.4 with every-2-week dosing; 77% reduction in ABR vs on-demand',
    line_of_therapy: '1L prophylaxis',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Extended half-life allows weekly to every-2-week dosing',
      'Well-established safety profile with no inhibitor development',
      'Convenient IV push administration for self-infusion'
    ],
    weaknesses: [
      'Still requires regular IV infusions unlike gene therapy',
      'Does not achieve normal FIX levels in most patients at standard doses',
      'Faces competition from gene therapy offering potential cure'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Fitusiran',
    generic_name: 'fitusiran',
    company: 'Sanofi',
    indication: 'Hemophilia B',
    indication_specifics: 'Subcutaneous RNAi therapy targeting antithrombin for hemophilia prophylaxis regardless of inhibitor status',
    mechanism: 'GalNAc-conjugated siRNA that silences antithrombin mRNA in hepatocytes, rebalancing hemostasis by lowering anticoagulant tone',
    mechanism_category: 'rnai',
    molecular_target: 'Antithrombin (SERPINC1) mRNA',
    phase: 'Approved',
    primary_endpoint: 'Annualized bleeding rate; treated bleeding episodes',
    key_data: 'ATLAS trials showed ~90% reduction in ABR; effective in patients with and without inhibitors',
    line_of_therapy: '1L prophylaxis',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Monthly subcutaneous injection eliminates IV infusion burden',
      'Effective regardless of FIX inhibitor status',
      'Novel mechanism bypasses the need for clotting factor replacement'
    ],
    weaknesses: [
      'Thrombotic events reported requiring careful dose management',
      'Does not treat acute bleeding episodes; requires on-demand factor for breakthroughs',
      'Requires antithrombin level monitoring to manage thrombotic risk'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },

  // ─── 10. Hunter Syndrome ───
  {
    asset_name: 'Elaprase',
    generic_name: 'idursulfase',
    company: 'Takeda',
    indication: 'Hunter Syndrome',
    indication_specifics: 'Enzyme replacement therapy for Hunter syndrome (MPS II) in patients aged 5 and older',
    mechanism: 'Recombinant human iduronate-2-sulfatase that replaces deficient IDS enzyme to clear accumulated glycosaminoglycans (heparan and dermatan sulfate)',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Iduronate-2-sulfatase (IDS)',
    phase: 'Approved',
    primary_endpoint: 'Composite of 6-minute walk test and FVC % predicted',
    key_data: 'Pivotal trial showed significant improvement in composite endpoint; reduction in liver and spleen volume',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only approved ERT for Hunter syndrome globally',
      'Over 15 years of real-world clinical experience',
      'Demonstrated improvements in somatic disease burden'
    ],
    weaknesses: [
      'Does not cross blood-brain barrier; no effect on CNS disease',
      'Weekly IV infusions lasting 1-3 hours',
      'Infusion-associated reactions and anti-drug antibody formation'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Pabinafusp alfa',
    company: 'JCR Pharma',
    indication: 'Hunter Syndrome',
    indication_specifics: 'Brain-penetrant ERT using transferrin receptor-mediated transcytosis for neuronopathic MPS II',
    mechanism: 'Anti-transferrin receptor antibody fused to iduronate-2-sulfatase that crosses the BBB via receptor-mediated transcytosis to deliver enzyme to the CNS',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Iduronate-2-sulfatase (IDS) via transferrin receptor',
    phase: 'Approved',
    primary_endpoint: 'Change in CSF heparan sulfate levels; neurodevelopmental assessments',
    key_data: 'Approved in Japan 2021; demonstrated CSF HS reduction and neurodevelopmental stabilization in Phase 2/3',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First approved brain-penetrant ERT for any lysosomal storage disease',
      'Addresses critical unmet need of CNS involvement in neuronopathic Hunter syndrome',
      'Novel platform technology applicable to other CNS lysosomal diseases'
    ],
    weaknesses: [
      'Currently approved only in Japan; global regulatory path uncertain',
      'Weekly IV infusion required',
      'Long-term CNS efficacy and neurodevelopmental outcomes still being evaluated'
    ],
    source: 'JCR Pharma 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Idursulfase-IT',
    company: 'Takeda',
    indication: 'Hunter Syndrome',
    indication_specifics: 'Intrathecal delivery of idursulfase directly to CSF for CNS manifestations of MPS II',
    mechanism: 'Direct intrathecal administration of recombinant iduronate-2-sulfatase bypassing the blood-brain barrier to clear GAG storage in the CNS',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Iduronate-2-sulfatase (IDS)',
    phase: 'Phase 2/3',
    primary_endpoint: 'Change in CSF glycosaminoglycan levels and neurodevelopmental outcomes',
    key_data: 'Phase 2/3 data show dose-dependent CSF HS reductions; cognitive stabilization observed in younger patients',
    line_of_therapy: '1L adjunct',
    nct_ids: ['NCT02055118'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Direct CNS delivery ensures therapeutic enzyme concentrations in the brain',
      'Leverages established idursulfase molecule with known safety profile',
      'Complementary to systemic ERT addressing unmet CNS need'
    ],
    weaknesses: [
      'Intrathecal delivery requires implanted port or repeated lumbar punctures',
      'Significant procedural burden and risk of device-related complications',
      'Competition from brain-penetrant IV approaches like pabinafusp alfa'
    ],
    source: 'Takeda 2024',
    last_updated: '2025-01-15'
  },

  // ─── 11. Hurler Syndrome ───
  {
    asset_name: 'Aldurazyme',
    generic_name: 'laronidase',
    company: 'Sanofi',
    indication: 'Hurler Syndrome',
    indication_specifics: 'Enzyme replacement therapy for MPS I (Hurler, Hurler-Scheie, Scheie syndromes)',
    mechanism: 'Recombinant human alpha-L-iduronidase that replaces deficient IDUA enzyme to clear accumulated dermatan and heparan sulfate GAGs',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Alpha-L-iduronidase (IDUA)',
    phase: 'Approved',
    primary_endpoint: 'Change in FVC % predicted and 6-minute walk test distance',
    key_data: 'Pivotal trial showed improvement in FVC and walking distance; significant reduction in liver volume and urinary GAGs',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only approved ERT for MPS I across all phenotypic variants',
      'Proven somatic benefits including respiratory and mobility improvements',
      'Over 20 years of clinical experience and safety data'
    ],
    weaknesses: [
      'Does not cross BBB; no benefit for CNS disease in severe Hurler phenotype',
      'Weekly IV infusions lasting 3-4 hours',
      'Patients with severe Hurler syndrome still require HSCT for CNS disease'
    ],
    source: 'Sanofi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Stem cell transplant',
    company: 'standard of care',
    indication: 'Hurler Syndrome',
    indication_specifics: 'Hematopoietic stem cell transplantation for severe MPS I (Hurler syndrome) before age 2.5',
    mechanism: 'Donor hematopoietic stem cells engraft and produce functional IDUA enzyme that cross-corrects host cells, including microglial cells in the CNS',
    mechanism_category: 'stem_cell_transplant',
    molecular_target: 'Alpha-L-iduronidase (IDUA) via donor cells',
    phase: 'Approved',
    primary_endpoint: 'Engraftment rate; survival; neurodevelopmental outcomes',
    key_data: 'When performed before age 2.5, HSCT preserves cognitive function in ~70% of patients; overall survival >90% with matched donors',
    line_of_therapy: '1L (severe phenotype)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Only treatment shown to stabilize CNS disease in severe Hurler syndrome',
      'Provides enzyme source to both somatic and CNS tissues',
      'Potentially curative if full engraftment is achieved early in life'
    ],
    weaknesses: [
      'Significant transplant-related morbidity and mortality risk',
      'Requires matched donor; outcomes variable with mismatched donors',
      'Must be performed very early in life (before age 2.5) for CNS benefit'
    ],
    source: 'Clinical guidelines 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy (SGSH)',
    company: 'Orchard/Kyowa Kirin',
    indication: 'Hurler Syndrome',
    indication_specifics: 'Ex vivo lentiviral gene therapy using autologous HSCs transduced with IDUA gene for severe MPS I',
    mechanism: 'Autologous hematopoietic stem cells transduced ex vivo with lentiviral vector carrying IDUA gene, enabling supraphysiological enzyme production and CNS cross-correction',
    mechanism_category: 'gene_therapy',
    molecular_target: 'IDUA gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety; IDUA enzyme activity in blood and CSF; neurodevelopmental outcomes',
    key_data: 'Early data show supraphysiological IDUA levels in blood and detectable CNS enzyme activity; favorable safety profile',
    line_of_therapy: '1L',
    nct_ids: ['NCT03580083'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Autologous approach eliminates graft-vs-host disease risk vs allogeneic HSCT',
      'Supraphysiological enzyme levels may provide superior CNS correction',
      'One-time treatment with potential for lifelong enzyme production'
    ],
    weaknesses: [
      'Requires myeloablative conditioning with associated toxicity risks',
      'Complex manufacturing process for patient-specific product',
      'Long-term durability and safety of lentiviral integration not yet established'
    ],
    source: 'Orchard/Kyowa Kirin 2024',
    last_updated: '2025-01-15'
  },

  // ─── 12. Niemann-Pick Disease Type C ───
  {
    asset_name: 'Zavesca',
    generic_name: 'miglustat',
    company: 'Actelion/J&J',
    indication: 'Niemann-Pick Disease Type C',
    indication_specifics: 'Oral substrate reduction therapy for neurological manifestations of NPC',
    mechanism: 'Iminosugar that inhibits glucosylceramide synthase, reducing glycosphingolipid synthesis and intracellular lipid trafficking burden',
    mechanism_category: 'substrate_reduction',
    molecular_target: 'Glucosylceramide synthase',
    phase: 'Approved',
    primary_endpoint: 'Stabilization of horizontal saccadic eye movement velocity; neurological composite score',
    key_data: 'Approved in EU for NPC; demonstrated stabilization of neurological progression in ~70% of patients over 12 months',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Only approved pharmacotherapy for NPC in many countries',
      'Oral administration with convenient dosing',
      'Demonstrated neurological stabilization in clinical studies'
    ],
    weaknesses: [
      'Not approved for NPC in the US (only for Gaucher disease)',
      'GI side effects (diarrhea, flatulence) affect majority of patients',
      'Stabilizes rather than reverses neurological decline'
    ],
    source: 'Actelion/J&J 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Arimoclomol',
    company: 'Orphazyme',
    indication: 'Niemann-Pick Disease Type C',
    indication_specifics: 'Heat shock protein amplifier to enhance cellular protein handling in NPC',
    mechanism: 'Co-inducer of heat shock protein response that amplifies HSP70 expression, enhancing proper folding and trafficking of NPC1 protein and reducing lipid storage',
    mechanism_category: 'heat_shock_protein_amplifier',
    molecular_target: 'Heat shock factor 1 (HSF1) / HSP70',
    phase: 'Phase 2/3',
    primary_endpoint: 'Change in 5-domain NPC Clinical Severity Scale score',
    key_data: 'Phase 2/3 showed numerical but not statistically significant improvement in NPC-CSS; FDA and EMA rejected applications in 2022',
    line_of_therapy: '1L',
    nct_ids: ['NCT02612129'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Novel mechanism targeting cellular protein quality control',
      'Oral formulation with manageable safety profile',
      'Potential applicability to other protein misfolding diseases'
    ],
    weaknesses: [
      'Failed to meet primary endpoint in pivotal Phase 2/3 trial',
      'Regulatory rejections from both FDA and EMA',
      'Orphazyme faced financial difficulties following regulatory setbacks'
    ],
    source: 'Orphazyme 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'N-acetyl-L-leucine',
    company: 'IntraBio',
    indication: 'Niemann-Pick Disease Type C',
    indication_specifics: 'Modified amino acid to improve neurological function in NPC',
    mechanism: 'Modified amino acid that modulates lysosomal and vesicular trafficking, improving intracellular cholesterol transport and reducing glycosphingolipid storage',
    mechanism_category: 'small_molecule_modulator',
    molecular_target: 'Lysosomal/vesicular trafficking pathways',
    phase: 'Phase 3',
    primary_endpoint: 'Change in modified NPC Clinical Severity Scale; functional assessments of ataxia and cognition',
    key_data: 'Phase 2 showed improvements in ataxia, ambulation, and cognition; well-tolerated oral therapy; Phase 3 ongoing',
    line_of_therapy: '1L',
    nct_ids: ['NCT05163288'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Oral administration with excellent tolerability profile',
      'Promising Phase 2 neurological improvements across multiple domains',
      'Novel mechanism addressing fundamental trafficking defect in NPC'
    ],
    weaknesses: [
      'Phase 3 confirmation of Phase 2 results still pending',
      'Mechanism of action not fully elucidated',
      'Small company with limited commercial resources for rare disease launch'
    ],
    source: 'IntraBio 2024',
    last_updated: '2025-01-15'
  },

  // ─── 13. Batten Disease ───
  {
    asset_name: 'Brineura',
    generic_name: 'cerliponase alfa',
    company: 'BioMarin',
    indication: 'Batten Disease',
    indication_specifics: 'Intracerebroventricular ERT for CLN2 (late infantile neuronal ceroid lipofuscinosis)',
    mechanism: 'Recombinant human TPP1 enzyme delivered directly to the CNS via intracerebroventricular infusion to clear accumulated storage material',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Tripeptidyl peptidase 1 (TPP1)',
    phase: 'Approved',
    primary_endpoint: 'Rate of decline on CLN2 Clinical Rating Scale (motor and language domains)',
    key_data: 'Significantly slowed disease progression: 0.27-point decline/48 weeks vs 2.1 historical decline; 80% maintained walking ability at 96 weeks',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First approved therapy for any form of Batten disease',
      'Dramatically slows irreversible neurological decline in CLN2',
      'Biweekly dosing with consistent long-term efficacy demonstrated'
    ],
    weaknesses: [
      'Requires surgical implantation of intracerebroventricular reservoir',
      'Biweekly ICV infusions with risk of device-related infections',
      'Only addresses CLN2 subtype; other NCL forms remain untreated'
    ],
    source: 'BioMarin 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy CLN3',
    company: 'Weill Cornell',
    indication: 'Batten Disease',
    indication_specifics: 'Intrathecal AAV gene therapy for CLN3 juvenile Batten disease',
    mechanism: 'AAVrh10 vector delivering functional CLN3 gene to CNS via intrathecal administration for sustained battenin protein expression',
    mechanism_category: 'gene_therapy',
    molecular_target: 'CLN3 gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety; change in Unified Batten Disease Rating Scale; CSF biomarkers',
    key_data: 'Phase 1/2 showing acceptable safety profile; preliminary evidence of disease stabilization in some patients',
    line_of_therapy: '1L',
    nct_ids: ['NCT03770572'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Addresses CLN3 form which has no approved treatment',
      'Potential for one-time treatment with durable transgene expression',
      'Intrathecal delivery targets CNS directly'
    ],
    weaknesses: [
      'Very early clinical stage with limited efficacy data',
      'CLN3 protein function not fully understood, complicating endpoint selection',
      'Academic-led program with uncertain commercial development path'
    ],
    source: 'Weill Cornell 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'AT-GTX-501',
    company: 'Amicus',
    indication: 'Batten Disease',
    indication_specifics: 'AAV gene therapy for CLN6 variant of Batten disease',
    mechanism: 'Self-complementary AAV9 vector delivering functional CLN6 gene via intrathecal injection for sustained protein expression in CNS neurons',
    mechanism_category: 'gene_therapy',
    molecular_target: 'CLN6 gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety; change in motor and language function on Hamburg Motor and Language Scale',
    key_data: 'Phase 1/2 data showed disease stabilization in majority of treated patients vs natural history; durable response at 3+ years in some patients',
    line_of_therapy: '1L',
    nct_ids: ['NCT02725580'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Demonstrated meaningful disease stabilization vs natural history decline',
      'Single intrathecal administration for potential long-term benefit',
      'scAAV9 vector optimized for neuronal transduction'
    ],
    weaknesses: [
      'Intrathecal delivery may not reach all affected brain regions uniformly',
      'Small patient numbers limit statistical power of clinical evidence',
      'Long-term durability of transgene expression in post-mitotic neurons uncertain'
    ],
    source: 'Amicus 2024',
    last_updated: '2025-01-15'
  },

  // ─── 14. Epidermolysis Bullosa ───
  {
    asset_name: 'Vyjuvek',
    generic_name: 'beremagene geperpavec',
    company: 'Krystal Biotech',
    indication: 'Epidermolysis Bullosa',
    indication_specifics: 'Topical gene therapy for dystrophic EB delivering COL7A1 to wound sites',
    mechanism: 'Replication-defective HSV-1 vector delivering functional COL7A1 gene directly to wound keratinocytes and fibroblasts for local type VII collagen production',
    mechanism_category: 'gene_therapy',
    molecular_target: 'COL7A1 gene',
    phase: 'Approved',
    primary_endpoint: 'Complete wound healing of paired wounds at 6 months',
    key_data: 'GEM-3 trial showed 67% complete wound healing vs 22% placebo at 6 months; durable healing maintained',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First gene therapy approved for any dermatological condition',
      'Topical application directly to wounds without systemic exposure',
      'Significant wound healing improvement vs placebo in pivotal trial'
    ],
    weaknesses: [
      'Requires repeated applications as HSV-1 vector does not integrate',
      'Must be applied to individual wounds, limiting treatment of widespread disease',
      'Cold chain storage and specialized handling requirements'
    ],
    source: 'Krystal Biotech 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'FILSUVEZ',
    generic_name: 'birch bark extract',
    company: 'Amryt/Chiesi',
    indication: 'Epidermolysis Bullosa',
    indication_specifics: 'Topical wound healing gel for junctional and dystrophic EB',
    mechanism: 'Triterpene-rich birch bark extract (betulin) that promotes wound healing by modulating inflammation and enhancing re-epithelialization',
    mechanism_category: 'wound_healing_agent',
    molecular_target: 'Wound healing pathways (inflammatory modulation)',
    phase: 'Approved',
    primary_endpoint: 'Time to first complete closure of EB target wound',
    key_data: 'EASE trial showed faster wound closure and improved wound burden scores; approved EU 2022, FDA 2023',
    line_of_therapy: '1L supportive',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Topical gel with simple application to EB wounds',
      'Addresses wound healing without genetic modification',
      'Approved in both EU and US for broad EB subtypes'
    ],
    weaknesses: [
      'Symptom management rather than disease modification',
      'Modest clinical benefit compared to gene therapy approaches',
      'Does not address underlying collagen or laminin deficiency'
    ],
    source: 'Amryt/Chiesi 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'PTR-01',
    company: 'Phoenix Tissue Repair',
    indication: 'Epidermolysis Bullosa',
    indication_specifics: 'Recombinant type VII collagen protein for dystrophic EB wound healing',
    mechanism: 'Intravenously administered recombinant human type VII collagen that homes to wound sites and incorporates into the dermal-epidermal junction forming anchoring fibrils',
    mechanism_category: 'protein_replacement',
    molecular_target: 'Type VII collagen (C7)',
    phase: 'Phase 2',
    primary_endpoint: 'Change in wound burden; anchoring fibril formation at the dermal-epidermal junction',
    key_data: 'Phase 1/2 data showed type VII collagen detectable at the basement membrane zone; wound healing improvements observed',
    line_of_therapy: '1L',
    nct_ids: ['NCT04599881'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Systemic delivery addresses all wounds simultaneously unlike topical approaches',
      'Protein replacement avoids gene therapy immunogenicity concerns',
      'Demonstrated basement membrane zone localization of delivered collagen'
    ],
    weaknesses: [
      'Requires repeated IV infusions for sustained collagen replacement',
      'Large protein may have immunogenicity with chronic administration',
      'Manufacturing complexity of full-length type VII collagen'
    ],
    source: 'Phoenix Tissue Repair 2024',
    last_updated: '2025-01-15'
  },

  // ─── 15. Achondroplasia ───
  {
    asset_name: 'Voxzogo',
    generic_name: 'vosoritide',
    company: 'BioMarin',
    indication: 'Achondroplasia',
    indication_specifics: 'Daily CNP analog for improvement of linear growth in pediatric achondroplasia',
    mechanism: 'C-type natriuretic peptide (CNP) analog that antagonizes FGFR3 downstream signaling, promoting endochondral ossification and linear bone growth',
    mechanism_category: 'cnp_analog',
    molecular_target: 'Natriuretic peptide receptor B (NPR-B) / FGFR3 pathway',
    phase: 'Approved',
    primary_endpoint: 'Change in annualized growth velocity',
    key_data: 'Phase 3 showed 1.57 cm/year increase in growth velocity vs placebo; sustained over 4+ years of treatment',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'First approved pharmacological therapy for achondroplasia',
      'Sustained improvement in growth velocity over multiple years',
      'Well-characterized mechanism targeting the core FGFR3 signaling defect'
    ],
    weaknesses: [
      'Daily subcutaneous injections in pediatric patients',
      'Does not address all skeletal complications (spinal stenosis, foramen magnum compression)',
      'Long-term effects on final adult height and proportionality still being assessed'
    ],
    source: 'BioMarin 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'TransCon CNP',
    company: 'Ascendis',
    indication: 'Achondroplasia',
    indication_specifics: 'Long-acting prodrug CNP analog for weekly dosing in pediatric achondroplasia',
    mechanism: 'TransCon sustained-release prodrug that provides continuous CNP exposure, counteracting constitutive FGFR3 activation to restore normal endochondral bone growth',
    mechanism_category: 'cnp_analog',
    molecular_target: 'Natriuretic peptide receptor B (NPR-B) / FGFR3 pathway',
    phase: 'Phase 2',
    primary_endpoint: 'Change in annualized growth velocity',
    key_data: 'Phase 2 ACcomplisH trial showed dose-dependent growth velocity increases of up to 2.5 cm/year above baseline',
    line_of_therapy: '1L',
    nct_ids: ['NCT05362422'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Weekly dosing provides significant convenience advantage over daily Voxzogo',
      'TransCon technology delivers steady-state CNP levels reducing peak-trough variability',
      'Potentially superior growth velocity in early clinical data'
    ],
    weaknesses: [
      'Phase 2 stage with significant development risk remaining',
      'Must demonstrate safety and efficacy advantage vs approved daily competitor',
      'Weekly injection still represents burden for young pediatric patients'
    ],
    source: 'Ascendis 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Infigratinib',
    company: 'QED/BridgeBio',
    indication: 'Achondroplasia',
    indication_specifics: 'Selective FGFR1-3 tyrosine kinase inhibitor for achondroplasia growth improvement',
    mechanism: 'Oral selective FGFR1-3 tyrosine kinase inhibitor that directly blocks the overactive FGFR3 signaling responsible for impaired chondrocyte proliferation and bone growth',
    mechanism_category: 'tyrosine_kinase_inhibitor',
    molecular_target: 'FGFR3',
    phase: 'Phase 2',
    primary_endpoint: 'Change in annualized growth velocity; safety and tolerability',
    key_data: 'Phase 2 PROPEL2 showed growth velocity improvements; oral formulation differentiates from injectable CNP analogs',
    line_of_therapy: '1L',
    nct_ids: ['NCT04265651'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Oral administration offers clear convenience advantage over daily/weekly injections',
      'Directly targets the constitutively active FGFR3 receptor',
      'Potential for broader effects on FGFR3-driven skeletal complications'
    ],
    weaknesses: [
      'FGFR inhibitor class carries risks of hyperphosphatemia and ocular toxicity',
      'Careful dose selection needed for growing children to avoid toxicity',
      'Known FGFR class effects may limit long-term safety in pediatric population'
    ],
    source: 'QED/BridgeBio 2024',
    last_updated: '2025-01-15'
  },

  // ─── 16. Hypophosphatasia ───
  {
    asset_name: 'Strensiq',
    generic_name: 'asfotase alfa',
    company: 'Alexion',
    indication: 'Hypophosphatasia',
    indication_specifics: 'Bone-targeted enzyme replacement for perinatal, infantile, and juvenile-onset HPP',
    mechanism: 'Bone-targeted tissue-nonspecific alkaline phosphatase (TNSALP) fused to IgG1 Fc and deca-aspartate domain for hydroxyapatite binding',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'Tissue-nonspecific alkaline phosphatase (TNSALP)',
    phase: 'Approved',
    primary_endpoint: 'Overall survival (perinatal/infantile); radiographic improvement in skeletal mineralization (Radiographic Global Impression of Change)',
    key_data: 'Demonstrated 84% survival vs 27% historical in life-threatening perinatal/infantile HPP; significant skeletal healing in juvenile patients',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only approved therapy for HPP with dramatic survival benefit in severe forms',
      'Bone-targeted design concentrates enzyme where needed most',
      'Proven across the spectrum from perinatal to juvenile-onset disease'
    ],
    weaknesses: [
      'Up to 6 subcutaneous injections per week causing significant injection burden',
      'Injection site reactions including lipodystrophy at injection sites',
      'Annual cost exceeding $300,000 with lifelong treatment requirement'
    ],
    source: 'Alexion 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy',
    company: 'Ultragenyx',
    indication: 'Hypophosphatasia',
    indication_specifics: 'AAV-based gene therapy for durable TNSALP expression in HPP',
    mechanism: 'Adeno-associated virus vector delivering ALPL gene encoding tissue-nonspecific alkaline phosphatase for sustained endogenous enzyme production',
    mechanism_category: 'gene_therapy',
    molecular_target: 'ALPL gene',
    phase: 'Preclinical',
    primary_endpoint: 'Sustained ALP enzyme activity; skeletal mineralization; survival',
    key_data: 'Preclinical data in HPP mouse models showing improved mineralization and survival; IND-enabling studies planned',
    line_of_therapy: '1L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Potential to eliminate need for frequent injections with one-time treatment',
      'Endogenous enzyme production may provide more physiological activity',
      'Ultragenyx gene therapy expertise and pipeline infrastructure'
    ],
    weaknesses: [
      'Very early preclinical stage with years to potential approval',
      'Bone-specific expression challenging to achieve with systemic AAV vectors',
      'Must compete with effective but burdensome existing enzyme replacement'
    ],
    source: 'Ultragenyx 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Small molecule TNAP activator',
    company: 'various',
    indication: 'Hypophosphatasia',
    indication_specifics: 'Small molecule approaches to enhance residual TNSALP enzyme activity',
    mechanism: 'Small molecule allosteric activators designed to enhance catalytic activity of mutant TNSALP enzyme in patients with residual enzyme function',
    mechanism_category: 'enzyme_activator',
    molecular_target: 'Tissue-nonspecific alkaline phosphatase (TNSALP)',
    phase: 'Preclinical',
    primary_endpoint: 'TNSALP enzyme activity enhancement; reduction in PLP and PEA substrates',
    key_data: 'Multiple academic and biotech groups pursuing TNAP activator discovery; hit compounds identified in high-throughput screens',
    line_of_therapy: '1L/2L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Oral small molecule would dramatically reduce treatment burden vs injectable ERT',
      'Potential to treat milder adult-onset HPP not well served by current ERT',
      'Lower manufacturing cost than recombinant enzyme protein'
    ],
    weaknesses: [
      'Very early discovery stage with no clinical candidates',
      'Only applicable to patients with residual enzyme activity (excludes null mutations)',
      'TNAP activation specificity and off-target phosphatase effects unknown'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  },

  // ─── 17. Alpha-1 Antitrypsin Deficiency ───
  {
    asset_name: 'Prolastin/Zemaira',
    generic_name: 'alpha-1 proteinase inhibitor',
    company: 'Grifols/CSL',
    indication: 'Alpha-1 Antitrypsin Deficiency',
    indication_specifics: 'IV augmentation therapy to raise serum AAT levels and protect lungs from neutrophil elastase damage',
    mechanism: 'Plasma-derived alpha-1 proteinase inhibitor infused intravenously to augment circulating AAT levels above the protective threshold of 11 uM',
    mechanism_category: 'protein_augmentation',
    molecular_target: 'Neutrophil elastase (inhibition via AAT)',
    phase: 'Approved',
    primary_endpoint: 'Maintenance of serum AAT levels above protective threshold; rate of FEV1 decline',
    key_data: 'RAPID trial showed 34% reduction in lung density loss by CT densitometry vs placebo over 2 years',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Only approved disease-modifying therapy for AATD-related lung disease',
      'Multiple products available improving supply security',
      'CT densitometry evidence of lung tissue preservation'
    ],
    weaknesses: [
      'Weekly IV infusions for life with significant patient burden',
      'Derived from human plasma with supply limitations',
      'Slows but does not halt lung function decline'
    ],
    source: 'Grifols/CSL 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Fazirsiran',
    company: 'Takeda/Arrowhead',
    indication: 'Alpha-1 Antitrypsin Deficiency',
    indication_specifics: 'RNAi therapy to reduce hepatic production of mutant Z-AAT protein and prevent liver disease',
    mechanism: 'GalNAc-conjugated siRNA that silences production of mutant Z-form AAT in hepatocytes, reducing hepatic Z-AAT polymer accumulation and liver toxicity',
    mechanism_category: 'rnai',
    molecular_target: 'SERPINA1 mRNA',
    phase: 'Phase 3',
    primary_endpoint: 'Change in liver Z-AAT polymer burden; liver fibrosis staging',
    key_data: 'Phase 2 AROAAT-2002 showed >90% reduction in circulating Z-AAT and significant reduction in liver Z-AAT polymers on biopsy',
    line_of_therapy: '1L (liver disease)',
    partner: 'Arrowhead',
    nct_ids: ['NCT05666960'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First therapy addressing AATD liver disease rather than just lung protection',
      'Quarterly subcutaneous dosing with dramatic Z-AAT reduction',
      'Potential to prevent progression to cirrhosis and need for liver transplant'
    ],
    weaknesses: [
      'Further reduces already-deficient circulating AAT which may worsen lung disease',
      'May require co-administration with augmentation therapy for lung protection',
      'Long-term hepatic safety of sustained SERPINA1 silencing unknown'
    ],
    source: 'Takeda/Arrowhead 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'INBRX-101',
    company: 'Inhibrx',
    indication: 'Alpha-1 Antitrypsin Deficiency',
    indication_specifics: 'Recombinant AAT-Fc fusion protein for extended half-life augmentation therapy',
    mechanism: 'Recombinant human AAT fused to IgG1 Fc domain leveraging FcRn recycling for extended half-life, enabling less frequent dosing',
    mechanism_category: 'protein_augmentation',
    molecular_target: 'Neutrophil elastase (inhibition via AAT)',
    phase: 'Phase 1',
    primary_endpoint: 'Safety, PK, and achievement of protective AAT serum threshold',
    key_data: 'Phase 1 showed extended half-life enabling every-2-to-4-week dosing; protective AAT levels maintained between doses',
    line_of_therapy: '1L',
    nct_ids: ['NCT04919239'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Recombinant production eliminates plasma supply dependency',
      'Extended half-life via Fc fusion reduces dosing frequency to monthly',
      'Consistent product quality not dependent on donor plasma pools'
    ],
    weaknesses: [
      'Early clinical stage with Phase 1 data only',
      'Fc fusion may affect anti-elastase activity of AAT',
      'Must demonstrate non-inferiority to well-established plasma-derived products'
    ],
    source: 'Inhibrx 2024',
    last_updated: '2025-01-15'
  },

  // ─── 18. Prader-Willi Syndrome ───
  {
    asset_name: 'DCCR',
    generic_name: 'diazoxide choline',
    company: 'Soleno',
    indication: 'Prader-Willi Syndrome',
    indication_specifics: 'Controlled-release diazoxide choline for hyperphagia and metabolic dysfunction in PWS',
    mechanism: 'KATP channel activator that suppresses insulin secretion and modulates hypothalamic appetite signaling, reducing hyperphagia and improving metabolic parameters',
    mechanism_category: 'potassium_channel_activator',
    molecular_target: 'KATP channels (SUR1/Kir6.2)',
    phase: 'Phase 3',
    primary_endpoint: 'Change in Hyperphagia Questionnaire for Clinical Trials (HQ-CT) score; change in body fat mass',
    key_data: 'Phase 3 DESTINY PWS showed significant improvements in hyperphagia, body composition, and behavioral symptoms',
    line_of_therapy: '1L',
    nct_ids: ['NCT04109080'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Addresses core hyperphagia which is the most burdensome symptom of PWS',
      'Oral formulation with once-daily dosing',
      'Multi-dimensional benefits on appetite, body composition, and behavior'
    ],
    weaknesses: [
      'Diazoxide class associated with fluid retention and hypertrichosis',
      'Edema monitoring and management required during treatment',
      'Complex regulatory path with PWS-specific endpoint validation needed'
    ],
    source: 'Soleno 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Livoletide',
    company: 'Rhythm',
    indication: 'Prader-Willi Syndrome',
    indication_specifics: 'Unacylated ghrelin analog for appetite regulation and metabolic improvement in PWS',
    mechanism: 'Analog of unacylated ghrelin that antagonizes orexigenic effects of acylated ghrelin, reducing appetite drive and improving insulin sensitivity',
    mechanism_category: 'ghrelin_modulator',
    molecular_target: 'Ghrelin receptor (GHSR) / unacylated ghrelin pathway',
    phase: 'Phase 2/3',
    primary_endpoint: 'Change in Hyperphagia Questionnaire for Clinical Trials; body composition measures',
    key_data: 'Phase 2b showed trends in hyperphagia improvement and body composition; Phase 3 design refined based on learnings',
    line_of_therapy: '1L',
    nct_ids: ['NCT03790865'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Novel mechanism targeting ghrelin dysregulation central to PWS pathophysiology',
      'Subcutaneous injection with manageable dosing schedule',
      'Potential metabolic benefits beyond appetite suppression'
    ],
    weaknesses: [
      'Phase 2 results showed trends but mixed statistical significance',
      'Injection-based administration in a pediatric population',
      'Ghrelin pathway complexity may limit single-agent efficacy'
    ],
    source: 'Rhythm 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Setmelanotide',
    company: 'Rhythm',
    indication: 'Prader-Willi Syndrome',
    indication_specifics: 'MC4R agonist being evaluated for hyperphagia and obesity in PWS',
    mechanism: 'Melanocortin-4 receptor (MC4R) agonist that restores hypothalamic satiety signaling downstream of the leptin-melanocortin pathway',
    mechanism_category: 'mc4r_agonist',
    molecular_target: 'Melanocortin-4 receptor (MC4R)',
    phase: 'Phase 3',
    primary_endpoint: 'Change in BMI z-score; change in hyperphagia-related behavior score',
    key_data: 'Approved for other genetic obesity syndromes (POMC, LEPR, PCSK1 deficiency); Phase 3 in PWS evaluating broader melanocortin pathway modulation',
    line_of_therapy: '1L',
    nct_ids: ['NCT05093634'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Proven mechanism with regulatory precedent in genetic obesity disorders',
      'Daily subcutaneous injection with established safety database',
      'Potential to address both hyperphagia and obesity in PWS'
    ],
    weaknesses: [
      'MC4R pathway may not be the primary driver of hyperphagia in PWS',
      'Skin hyperpigmentation and injection site reactions common',
      'Efficacy in PWS may differ from monogenic obesity indications'
    ],
    source: 'Rhythm 2024',
    last_updated: '2025-01-15'
  },

  // ─── 19. Tuberous Sclerosis Complex ───
  {
    asset_name: 'Afinitor',
    generic_name: 'everolimus',
    company: 'Novartis',
    indication: 'Tuberous Sclerosis Complex',
    indication_specifics: 'mTOR inhibitor for TSC-associated SEGA and renal angiomyolipoma',
    mechanism: 'Oral mTOR complex 1 (mTORC1) inhibitor that blocks the constitutively activated mTOR signaling pathway caused by TSC1/TSC2 mutations, reducing tumor growth',
    mechanism_category: 'mtor_inhibitor',
    molecular_target: 'mTOR (mTORC1)',
    phase: 'Approved',
    primary_endpoint: 'SEGA volume reduction (>=50%); angiomyolipoma response rate',
    key_data: 'EXIST-1 showed 35% SEGA response rate vs 0% placebo; EXIST-2 showed 42% angiomyolipoma response vs 0% placebo',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Oral once-daily dosing targeting core mTOR pathway dysregulation',
      'Proven efficacy across multiple TSC manifestations (brain, kidney, skin)',
      'Also reduces TSC-associated seizure frequency as add-on therapy'
    ],
    weaknesses: [
      'Immunosuppressive effects increasing infection susceptibility',
      'Stomatitis, pneumonitis, and metabolic effects requiring monitoring',
      'Tumor regrowth upon treatment discontinuation necessitating chronic therapy'
    ],
    source: 'Novartis 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Sabril',
    generic_name: 'vigabatrin',
    company: 'Lundbeck',
    indication: 'Tuberous Sclerosis Complex',
    indication_specifics: 'First-line antiepileptic for TSC-associated infantile spasms',
    mechanism: 'Irreversible GABA-transaminase inhibitor that increases brain GABA levels, suppressing epileptiform activity particularly effective in TSC-related infantile spasms',
    mechanism_category: 'gaba_modulator',
    molecular_target: 'GABA-transaminase',
    phase: 'Approved',
    primary_endpoint: 'Complete cessation of infantile spasms; EEG resolution of hypsarrhythmia',
    key_data: 'First-line response rate >90% for TSC-associated infantile spasms; superior to ACTH in this population',
    line_of_therapy: '1L (infantile spasms)',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Gold standard for TSC-associated infantile spasms with >90% response rate',
      'Oral formulation available as powder for solution suitable for infants',
      'Rapid onset of action with spasm cessation often within days'
    ],
    weaknesses: [
      'Risk of irreversible bilateral concentric visual field constriction',
      'REMS program with mandatory ophthalmologic monitoring',
      'Limited efficacy for non-TSC seizure types in older patients'
    ],
    source: 'Lundbeck 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Cannabidiol',
    company: 'Jazz',
    indication: 'Tuberous Sclerosis Complex',
    indication_specifics: 'Adjunctive cannabidiol treatment for TSC-associated seizures',
    mechanism: 'Plant-derived cannabidiol that modulates neuronal excitability through multiple mechanisms including GPR55 antagonism, TRPV1 modulation, and adenosine reuptake inhibition',
    mechanism_category: 'cannabinoid',
    molecular_target: 'GPR55, TRPV1, adenosine reuptake',
    phase: 'Phase 3',
    primary_endpoint: 'Percent change in TSC-associated seizure frequency',
    key_data: 'GWPCARE6 Phase 3 showed 49% median reduction in TSC-associated seizure frequency vs 27% placebo; approved for Lennox-Gastaut and Dravet',
    line_of_therapy: '2L adjunct',
    nct_ids: ['NCT02544763'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Established safety profile from Epidiolex approval in other epilepsy syndromes',
      'Oral solution with straightforward titration dosing',
      'Addresses seizure burden which is a major quality-of-life driver in TSC'
    ],
    weaknesses: [
      'Drug interaction with clobazam and other AEDs requiring dose adjustments',
      'Hepatotoxicity risk requiring liver function monitoring',
      'Adjunctive therapy only; does not address underlying mTOR pathway activation'
    ],
    source: 'Jazz 2024',
    last_updated: '2025-01-15'
  },

  // ─── 20. Spinal and Bulbar Muscular Atrophy ───
  {
    asset_name: 'Leuprolide',
    company: 'AbbVie',
    indication: 'Spinal and Bulbar Muscular Atrophy',
    indication_specifics: 'GnRH agonist used off-label to reduce androgen-driven toxicity of mutant androgen receptor in SBMA',
    mechanism: 'GnRH agonist that suppresses testosterone production, reducing ligand-dependent nuclear translocation and aggregation of mutant polyglutamine-expanded androgen receptor',
    mechanism_category: 'hormone_modulation',
    molecular_target: 'GnRH receptor / Androgen receptor (indirect)',
    phase: 'Approved',
    primary_endpoint: 'Motor function outcomes; serum creatine kinase levels; swallowing function',
    key_data: 'Japanese trial showed improvements in swallowing function with leuprolide in SBMA patients; used off-label in clinical practice',
    line_of_therapy: '1L (off-label)',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Established drug with well-known safety profile over decades of use',
      'Depot formulations available for monthly or quarterly dosing',
      'Evidence of swallowing function improvement in clinical trials'
    ],
    weaknesses: [
      'Off-label use without formal SBMA indication in most countries',
      'Androgen deprivation causes significant side effects (osteoporosis, hot flashes, fatigue)',
      'Modest efficacy limited to slowing rather than halting disease progression'
    ],
    source: 'AbbVie 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'AP-101',
    company: 'antisense',
    indication: 'Spinal and Bulbar Muscular Atrophy',
    indication_specifics: 'Antisense oligonucleotide targeting androgen receptor mRNA to reduce toxic polyQ-AR protein',
    mechanism: 'Antisense oligonucleotide that selectively degrades androgen receptor mRNA, reducing both wild-type and mutant polyglutamine-expanded AR protein levels in motor neurons',
    mechanism_category: 'antisense_oligonucleotide',
    molecular_target: 'Androgen receptor (AR) mRNA',
    phase: 'Phase 1',
    primary_endpoint: 'Safety and tolerability; change in serum and CSF AR protein levels; muscle biomarkers',
    key_data: 'Preclinical models showed significant reduction in mutant AR aggregates and improvement in motor function; Phase 1 evaluating intrathecal delivery',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Directly targets root cause by reducing toxic mutant AR protein',
      'Antisense approach validated in other neuromuscular diseases (SMA)',
      'Potential for disease modification rather than symptom management'
    ],
    weaknesses: [
      'Very early clinical stage with uncertain efficacy in humans',
      'Intrathecal delivery required for CNS penetration adds procedural burden',
      'Reducing wild-type AR may cause androgen insensitivity-like side effects'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy approaches',
    company: 'various',
    indication: 'Spinal and Bulbar Muscular Atrophy',
    indication_specifics: 'AAV-based gene therapy approaches to silence or correct mutant androgen receptor in SBMA motor neurons',
    mechanism: 'Adeno-associated virus vectors delivering shRNA or miRNA targeting mutant androgen receptor mRNA for sustained silencing in motor neurons',
    mechanism_category: 'gene_therapy',
    molecular_target: 'Androgen receptor (AR) gene',
    phase: 'Preclinical',
    primary_endpoint: 'Mutant AR protein reduction; motor neuron preservation; motor function in animal models',
    key_data: 'Preclinical AAV-mediated AR silencing showed motor neuron rescue and functional improvement in SBMA mouse models',
    line_of_therapy: '1L',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Potential for one-time treatment with durable mutant AR silencing',
      'AAV tropism for motor neurons well-established from SMA gene therapy',
      'Could address disease at genetic level providing disease modification'
    ],
    weaknesses: [
      'Preclinical stage with many years to potential clinical translation',
      'Achieving adequate transduction of both lower motor neurons and muscle is challenging',
      'Small SBMA patient population limits commercial attractiveness for gene therapy investment'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  },

  // ─── 21. Homozygous Familial Hypercholesterolemia ───
  {
    asset_name: 'Evkeeza',
    generic_name: 'evinacumab',
    company: 'Regeneron',
    indication: 'Homozygous Familial Hypercholesterolemia',
    indication_specifics: 'ANGPTL3 inhibitor for LDL-C reduction in HoFH regardless of LDLR mutation status',
    mechanism: 'Fully human monoclonal antibody against ANGPTL3 that lowers LDL-C through an LDLR-independent pathway by enhancing LPL and endothelial lipase activity',
    mechanism_category: 'angptl3_inhibitor',
    molecular_target: 'Angiopoietin-like 3 (ANGPTL3)',
    phase: 'Approved',
    primary_endpoint: 'Percent change in LDL-C from baseline',
    key_data: 'ELIPSE HoFH trial showed 49% LDL-C reduction vs +2% placebo; effective even in LDLR-null patients',
    line_of_therapy: '2L/3L adjunct',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'LDLR-independent mechanism effective in receptor-null HoFH patients',
      'Dramatic LDL-C lowering in a population with limited treatment options',
      'Monthly IV infusion with consistent efficacy'
    ],
    weaknesses: [
      'Monthly IV infusions rather than oral or subcutaneous administration',
      'Very high annual cost exceeding $400,000',
      'Limited long-term cardiovascular outcomes data'
    ],
    source: 'Regeneron 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Juxtapid',
    generic_name: 'lomitapide',
    company: 'Amryt',
    indication: 'Homozygous Familial Hypercholesterolemia',
    indication_specifics: 'Oral MTP inhibitor for LDL-C reduction as adjunct to diet and other lipid-lowering treatments in HoFH',
    mechanism: 'Microsomal triglyceride transfer protein (MTP) inhibitor that blocks hepatic VLDL assembly and secretion, reducing LDL-C production independent of LDL receptor',
    mechanism_category: 'mtp_inhibitor',
    molecular_target: 'Microsomal triglyceride transfer protein (MTP)',
    phase: 'Approved',
    primary_endpoint: 'Percent change in LDL-C from baseline',
    key_data: 'Pivotal trial showed 50% LDL-C reduction at week 26; sustained in long-term extension study',
    line_of_therapy: '2L adjunct',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Oral once-daily therapy, only oral option specifically for HoFH',
      'Mechanism independent of LDL receptor, effective in all HoFH genotypes',
      'Can be combined with other lipid-lowering therapies for additive effect'
    ],
    weaknesses: [
      'Hepatotoxicity risk requiring regular liver function monitoring and REMS',
      'GI side effects (diarrhea, nausea, hepatic steatosis) limiting tolerability',
      'Strict low-fat diet required to minimize hepatic fat accumulation'
    ],
    source: 'Amryt 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Repatha',
    generic_name: 'evolocumab',
    company: 'Amgen',
    indication: 'Homozygous Familial Hypercholesterolemia',
    indication_specifics: 'PCSK9 inhibitor for LDL-C reduction in HoFH with residual LDLR function',
    mechanism: 'Fully human monoclonal antibody that binds and inhibits PCSK9, preventing LDLR degradation and increasing hepatic LDL-C clearance',
    mechanism_category: 'pcsk9_inhibitor',
    molecular_target: 'PCSK9 (proprotein convertase subtilisin/kexin type 9)',
    phase: 'Approved',
    primary_endpoint: 'Percent change in LDL-C from baseline',
    key_data: 'TESLA Part B showed 31% LDL-C reduction in HoFH vs placebo; FOURIER showed 15% CV event reduction in general population',
    line_of_therapy: '2L adjunct',
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Proven cardiovascular outcomes benefit from FOURIER trial',
      'Self-administered subcutaneous injection every 2-4 weeks',
      'Excellent tolerability profile with minimal side effects'
    ],
    weaknesses: [
      'Depends on residual LDLR function; limited efficacy in receptor-null patients',
      'LDL-C reduction more modest in HoFH (~30%) vs heterozygous FH (~60%)',
      'High cost and payer access barriers in many markets'
    ],
    source: 'Amgen 2024',
    last_updated: '2025-01-15'
  },

  // ─── 22. Congenital Adrenal Hyperplasia ───
  {
    asset_name: 'Crinecerfont',
    company: 'Neurocrine',
    indication: 'Congenital Adrenal Hyperplasia',
    indication_specifics: 'Oral CRF1 receptor antagonist to reduce supraphysiologic glucocorticoid doses in classic CAH',
    mechanism: 'Selective corticotropin-releasing factor type 1 (CRF1) receptor antagonist that suppresses excess ACTH drive, allowing reduction of exogenous glucocorticoid replacement doses',
    mechanism_category: 'crf1_antagonist',
    molecular_target: 'CRF1 receptor',
    phase: 'Phase 3',
    primary_endpoint: 'Proportion of patients achieving glucocorticoid dose reduction while maintaining androgen control',
    key_data: 'Phase 2 CAHmelia showed significant glucocorticoid dose reduction with maintained 17-OHP and androstenedione control; Phase 3 ongoing in adults and pediatrics',
    line_of_therapy: '1L adjunct',
    nct_ids: ['NCT05451836'],
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'First-in-class mechanism addressing root cause of ACTH-driven androgen excess',
      'Enables glucocorticoid dose reduction mitigating long-term steroid side effects',
      'Oral twice-daily dosing with favorable Phase 2 efficacy signals'
    ],
    weaknesses: [
      'Phase 3 confirmation of Phase 2 glucocorticoid dose reduction required',
      'Adjunctive therapy rather than replacement of glucocorticoids',
      'CRF1 antagonism may have CNS effects (anxiety, mood) requiring monitoring'
    ],
    source: 'Neurocrine 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Tildacerfont',
    company: 'Spruce Bio',
    indication: 'Congenital Adrenal Hyperplasia',
    indication_specifics: 'Oral CRF1 antagonist for glucocorticoid dose optimization in classic CAH',
    mechanism: 'Non-steroidal CRF1 receptor antagonist that reduces ACTH hypersecretion, lowering adrenal androgen production and enabling physiologic glucocorticoid dosing',
    mechanism_category: 'crf1_antagonist',
    molecular_target: 'CRF1 receptor',
    phase: 'Phase 2',
    primary_endpoint: 'Change in 17-OHP and androstenedione levels; glucocorticoid dose reduction',
    key_data: 'Phase 2 showed dose-dependent suppression of 17-OHP and androstenedione; glucocorticoid dose reductions of 30-50% achieved',
    line_of_therapy: '1L adjunct',
    nct_ids: ['NCT05197634'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Once-daily oral dosing may offer convenience advantage',
      'Dose-dependent androgen suppression demonstrated in Phase 2',
      'Potential for meaningful glucocorticoid dose reduction'
    ],
    weaknesses: [
      'Behind crinecerfont in development timeline',
      'Phase 2 stage with substantial clinical risk remaining',
      'Small biotech with limited resources for Phase 3 execution vs larger competitor'
    ],
    source: 'Spruce Bio 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Hydrocortisone modified-release',
    generic_name: 'hydrocortisone modified-release',
    company: 'Efmody',
    indication: 'Congenital Adrenal Hyperplasia',
    indication_specifics: 'Modified-release hydrocortisone mimicking physiological cortisol circadian rhythm for CAH management',
    mechanism: 'Dual-release hydrocortisone formulation with immediate and delayed release components that recapitulates the natural cortisol circadian rhythm, providing early-morning cortisol rise',
    mechanism_category: 'hormone_replacement',
    molecular_target: 'Glucocorticoid receptor',
    phase: 'Approved',
    primary_endpoint: 'Control of 17-OHP levels; total daily glucocorticoid dose; adrenal androgen normalization',
    key_data: 'Approved in EU; demonstrated improved androgen control with lower total glucocorticoid exposure vs conventional hydrocortisone dosing',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: false,
    strengths: [
      'Physiological cortisol profile reduces total glucocorticoid exposure',
      'Once-daily evening dosing for better early-morning ACTH suppression',
      'Approved therapy (EU) with established clinical evidence'
    ],
    weaknesses: [
      'Not approved in US market; limited global availability',
      'Still requires glucocorticoid replacement, does not eliminate steroid burden',
      'Premium pricing over generic hydrocortisone formulations'
    ],
    source: 'Efmody 2024',
    last_updated: '2025-01-15'
  },

  // ─── 23. Aromatic L-Amino Acid Decarboxylase Deficiency ───
  {
    asset_name: 'Upstaza',
    generic_name: 'eladocagene exuparvovec',
    company: 'PTC',
    indication: 'Aromatic L-Amino Acid Decarboxylase Deficiency',
    indication_specifics: 'Intraputaminal AAV2 gene therapy delivering DDC gene for AADC deficiency in patients 18 months and older',
    mechanism: 'Adeno-associated virus serotype 2 vector delivering functional DDC gene directly to the putamen via stereotactic neurosurgery, restoring dopamine synthesis',
    mechanism_category: 'gene_therapy',
    molecular_target: 'DDC (DOPA decarboxylase) gene',
    phase: 'Approved',
    primary_endpoint: 'Motor milestone achievement; change in PDMS-2 motor scores; oculogyric crisis frequency',
    key_data: 'EU-approved 2022; treated patients achieved motor milestones (head control, sitting, standing) never achieved pre-treatment; sustained at 5+ years',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Transformative efficacy with achievement of motor milestones in previously immobile patients',
      'One-time treatment with durable benefit demonstrated over 5+ years',
      'First approved gene therapy for a neurotransmitter disorder'
    ],
    weaknesses: [
      'Requires invasive stereotactic neurosurgery for intraputaminal delivery',
      'EU approval only; not yet approved in US',
      'Extremely small patient population limits commercial opportunity'
    ],
    source: 'PTC 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Gene therapy AAV2',
    company: 'various',
    indication: 'Aromatic L-Amino Acid Decarboxylase Deficiency',
    indication_specifics: 'Alternative AAV2-based gene therapy programs for AADC deficiency in development outside of Upstaza',
    mechanism: 'AAV2 vectors engineered for improved DDC transgene expression with alternative promoters and delivery approaches for enhanced dopamine restoration',
    mechanism_category: 'gene_therapy',
    molecular_target: 'DDC (DOPA decarboxylase) gene',
    phase: 'Phase 1/2',
    primary_endpoint: 'Safety; motor function improvement; neurotransmitter metabolite levels in CSF',
    key_data: 'Academic programs in Taiwan and US showed improvements in motor function and reduction in oculogyric crises; data support proof of concept',
    line_of_therapy: '1L',
    nct_ids: ['NCT02852213'],
    first_in_class: false,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Additional clinical evidence supporting gene therapy approach for AADC deficiency',
      'Potential for optimized vectors with improved expression or delivery',
      'Growing surgical experience with intraputaminal delivery technique'
    ],
    weaknesses: [
      'Competing with already-approved Upstaza in EU',
      'Requires same invasive neurosurgical procedure',
      'Ultra-rare disease limits trial enrollment and commercial viability'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  },
  {
    asset_name: 'Enzyme replacement',
    company: 'Preclinical',
    indication: 'Aromatic L-Amino Acid Decarboxylase Deficiency',
    indication_specifics: 'Recombinant AADC enzyme replacement approaches for peripheral and central neurotransmitter restoration',
    mechanism: 'Recombinant aromatic L-amino acid decarboxylase enzyme designed for systemic or CNS-targeted delivery to restore conversion of L-DOPA to dopamine and 5-HTP to serotonin',
    mechanism_category: 'enzyme_replacement',
    molecular_target: 'AADC enzyme (DDC)',
    phase: 'Preclinical',
    primary_endpoint: 'Restoration of dopamine and serotonin levels; motor function improvement in animal models',
    key_data: 'Early preclinical exploration; significant challenges in delivering enzyme across BBB and achieving sustained activity in target tissues',
    line_of_therapy: '1L',
    first_in_class: true,
    orphan_drug: true,
    has_biomarker_selection: true,
    strengths: [
      'Could provide non-surgical alternative to gene therapy',
      'Enzyme replacement paradigm well-validated in other rare diseases',
      'Potential for dose titration and reversibility unlike gene therapy'
    ],
    weaknesses: [
      'Major BBB penetration challenge for CNS enzyme delivery',
      'Enzyme instability and short half-life requiring frequent dosing',
      'Very early concept stage with no clinical development timeline'
    ],
    source: 'Various 2024',
    last_updated: '2025-01-15'
  }
];
