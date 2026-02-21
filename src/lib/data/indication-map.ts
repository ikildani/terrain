// ============================================================
// TERRAIN — Indication Data Map
// lib/data/indication-map.ts
//
// Static database of 150+ indications with epidemiology data.
// Sources: WHO GBD, published literature, IQVIA market research.
// Claude Code: Expand this to 150+ indications following this pattern.
// ============================================================

export interface IndicationData {
  name: string;
  synonyms: string[];
  icd10_codes: string[];
  therapy_area: string;
  us_prevalence: number;         // Number of US patients with condition
  us_incidence: number;          // New cases per year in US
  prevalence_source: string;
  diagnosis_rate: number;        // 0-1: % of prevalent patients who are diagnosed
  treatment_rate: number;        // 0-1: % of diagnosed who receive treatment
  cagr_5yr: number;              // Market CAGR %
  major_competitors: string[];   // Approved/late-stage drugs
  market_growth_driver: string;
  therapy_area_pricing_context: string;
}

export const INDICATION_DATA: IndicationData[] = [

  // ──────────────────────────────────────────
  // ONCOLOGY
  // ──────────────────────────────────────────
  {
    name: 'Non-Small Cell Lung Cancer',
    synonyms: ['NSCLC', 'lung adenocarcinoma', 'lung squamous cell carcinoma', 'lung cancer'],
    icd10_codes: ['C34.10', 'C34.11', 'C34.12', 'C34.30'],
    therapy_area: 'oncology',
    us_prevalence: 235000,
    us_incidence: 236740,
    prevalence_source: 'American Cancer Society 2024; SEER Database',
    diagnosis_rate: 0.85,
    treatment_rate: 0.78,
    cagr_5yr: 9.2,
    major_competitors: [
      'Keytruda (pembrolizumab, MSD)',
      'Opdivo (nivolumab, BMS)',
      'Tagrisso (osimertinib, AstraZeneca)',
      'Alecensa (alectinib, Roche)',
      'Lorbrena (lorlatinib, Pfizer)',
      'Lumakras (sotorasib, Amgen)',
      'Krazati (adagrasib, Mirati)',
    ],
    market_growth_driver: 'Expanding biomarker-selected populations, combination regimens, and earlier-line treatment opportunities',
    therapy_area_pricing_context: 'Oncology premium pricing environment; $150K-$250K annually typical for targeted therapies',
  },

  {
    name: 'Pancreatic Ductal Adenocarcinoma',
    synonyms: ['PDAC', 'pancreatic cancer', 'pancreatic adenocarcinoma'],
    icd10_codes: ['C25.0', 'C25.1', 'C25.2', 'C25.3', 'C25.9'],
    therapy_area: 'oncology',
    us_prevalence: 62000,
    us_incidence: 66440,
    prevalence_source: 'American Cancer Society 2024; National Cancer Database',
    diagnosis_rate: 0.90,        // High because symptomatic presentation
    treatment_rate: 0.75,        // Many patients diagnosed at unresectable stage
    cagr_5yr: 11.5,
    major_competitors: [
      'Gemcitabine (generic)',
      'FOLFIRINOX regimen',
      'Abraxane (nab-paclitaxel)',
      'Olaparib (AstraZeneca, BRCA+ only)',
    ],
    market_growth_driver: 'Massive unmet need, rising incidence, KRAS targeted therapy emerging, ADC combinations',
    therapy_area_pricing_context: 'High unmet need supports premium pricing. First effective targeted therapy could command $200K+ annually',
  },

  {
    name: 'Acute Myeloid Leukemia',
    synonyms: ['AML', 'acute myelogenous leukemia'],
    icd10_codes: ['C92.00', 'C92.01', 'C92.02', 'C92.60', 'C92.40'],
    therapy_area: 'oncology',
    us_prevalence: 35000,
    us_incidence: 20800,
    prevalence_source: 'SEER Database 2024; Leukemia and Lymphoma Society',
    diagnosis_rate: 0.95,
    treatment_rate: 0.85,
    cagr_5yr: 8.8,
    major_competitors: [
      'Venclexta (venetoclax, AbbVie/Roche)',
      'Enasidenib (Bristol Myers Squibb)',
      'Ivosidenib (Servier)',
      'Quizartinib (Daiichi Sankyo)',
      'Gilteritinib (Astellas)',
    ],
    market_growth_driver: 'Molecular subtype targeting expansion, frontline combination opportunities, MRD-driven treatment strategies',
    therapy_area_pricing_context: 'Hematology oncology commands $150K-$300K+ annually; intensity of therapy supports high pricing',
  },

  {
    name: 'Triple Negative Breast Cancer',
    synonyms: ['TNBC', 'triple negative breast cancer'],
    icd10_codes: ['C50.01', 'C50.02', 'C50.11', 'C50.12'],
    therapy_area: 'oncology',
    us_prevalence: 42000,
    us_incidence: 43000,
    prevalence_source: 'American Cancer Society 2024; BreastCancer.org Statistics',
    diagnosis_rate: 0.92,
    treatment_rate: 0.88,
    cagr_5yr: 10.1,
    major_competitors: [
      'Keytruda (pembrolizumab, MSD)',
      'Trodelvy (sacituzumab govitecan, Gilead)',
      'Lynparza (olaparib, AstraZeneca/MSD, germline BRCA)',
      'Talzenna (talazoparib, Pfizer, germline BRCA)',
    ],
    market_growth_driver: 'ADC wave, TROP2 targets, immunotherapy combination, BRCA-targeted expansion',
    therapy_area_pricing_context: 'Breast oncology: $100K-$200K annually typical. ADCs command premium.',
  },

  {
    name: 'Colorectal Cancer',
    synonyms: ['CRC', 'colon cancer', 'rectal cancer', 'colorectal adenocarcinoma'],
    icd10_codes: ['C18', 'C19', 'C20', 'C21'],
    therapy_area: 'oncology',
    us_prevalence: 188000,
    us_incidence: 154270,
    prevalence_source: 'American Cancer Society 2024; SEER 5-year survival data',
    diagnosis_rate: 0.87,
    treatment_rate: 0.82,
    cagr_5yr: 7.8,
    major_competitors: [
      'Avastin (bevacizumab, Roche)',
      'Vectibix (panitumumab, Amgen)',
      'Erbitux (cetuximab, Eli Lilly)',
      'Opdivo + Yervoy (BMS, MSI-H)',
      'KRAZATI (adagrasib, KRAS G12C)',
    ],
    market_growth_driver: 'MSI-H immunotherapy expansion, KRAS-targeted therapies, EGFR combinations',
    therapy_area_pricing_context: 'Competitive landscape; targeted agents $80K-$150K annually',
  },

  {
    name: 'Ovarian Cancer',
    synonyms: ['ovarian carcinoma', 'EOC', 'epithelial ovarian cancer', 'ovarian adenocarcinoma'],
    icd10_codes: ['C56.1', 'C56.2', 'C56.9'],
    therapy_area: 'oncology',
    us_prevalence: 72000,
    us_incidence: 19680,
    prevalence_source: 'American Cancer Society 2024; OCRA Foundation',
    diagnosis_rate: 0.82,        // Often late-stage at diagnosis
    treatment_rate: 0.90,
    cagr_5yr: 9.5,
    major_competitors: [
      'Lynparza (olaparib, AstraZeneca/MSD)',
      'Zejula (niraparib, GSK)',
      'Rubraca (rucaparib, Clovis/Pfizer)',
      'Avastin (bevacizumab, Roche)',
    ],
    market_growth_driver: 'PARP inhibitor maintenance expansion, HRD testing, ADC development, VEGF combinations',
    therapy_area_pricing_context: 'PARP inhibitors set $150K+ benchmark; follow-on assets need differentiation for premium pricing',
  },

  // ──────────────────────────────────────────
  // NEUROLOGY / CNS
  // ──────────────────────────────────────────
  {
    name: "Alzheimer's Disease",
    synonyms: ["Alzheimer's", 'AD', 'Alzheimer disease', 'dementia Alzheimer type'],
    icd10_codes: ['G30', 'G30.0', 'G30.1', 'G30.8', 'G30.9'],
    therapy_area: 'neurology',
    us_prevalence: 6800000,
    us_incidence: 500000,
    prevalence_source: "Alzheimer's Association 2024 Facts and Figures",
    diagnosis_rate: 0.45,        // Many undiagnosed; early detection remains challenge
    treatment_rate: 0.60,        // Of diagnosed, many on symptomatic treatment
    cagr_5yr: 14.2,
    major_competitors: [
      'Leqembi (lecanemab, Eisai/Biogen)',
      'Kisunla (donanemab, Eli Lilly)',
      'Memantine (generic)',
      'Donepezil (generic)',
    ],
    market_growth_driver: 'Anti-amyloid approvals opening premium treatment market, early detection via blood biomarkers, pipeline for early-stage disease',
    therapy_area_pricing_context: "Leqembi at $26,500/year sets early precedent; anti-tau and next-gen modalities could command $30K-$80K annually",
  },

  {
    name: "Parkinson's Disease",
    synonyms: ["Parkinson's", 'PD', 'Parkinson disease', 'idiopathic Parkinson'],
    icd10_codes: ['G20'],
    therapy_area: 'neurology',
    us_prevalence: 1000000,
    us_incidence: 90000,
    prevalence_source: "Parkinson's Foundation 2024; NPF National Parkinson Foundation",
    diagnosis_rate: 0.75,
    treatment_rate: 0.88,
    cagr_5yr: 8.4,
    major_competitors: [
      'Levodopa/Carbidopa (generic)',
      'Rytary (IPX066, Amneal)',
      'Xadago (safinamide, Supernus)',
      'Ongentys (opicapone, Neurocrine)',
      'Inbrija (levodopa inhalation, Acorda)',
    ],
    market_growth_driver: 'Disease-modifying therapy opportunity (alpha-synuclein, LRRK2), device-aided therapies, digital health integration',
    therapy_area_pricing_context: 'Symptomatic drugs face generic competition; disease-modifying therapy could command $40K-$100K annually',
  },

  {
    name: 'Amyotrophic Lateral Sclerosis',
    synonyms: ['ALS', 'Lou Gehrig Disease', 'motor neuron disease', 'MND'],
    icd10_codes: ['G12.21'],
    therapy_area: 'neurology',
    us_prevalence: 32000,
    us_incidence: 16000,
    prevalence_source: 'ALS Association 2024; CDC ALS Registry',
    diagnosis_rate: 0.88,
    treatment_rate: 0.82,
    cagr_5yr: 15.2,
    major_competitors: [
      'Radicava (edaravone, Mitsubishi Tanabe)',
      'Relyvrio (phenylbutyrate+tauro, Amylyx) — withdrawn US market 2024',
      'Qalsody (tofersen, Biogen, SOD1-ALS only)',
      'Riluzole (generic)',
    ],
    market_growth_driver: 'Genetic subtype targeting (SOD1, FUS, TDP-43), gene therapy approaches, high unmet need, rare disease pricing',
    therapy_area_pricing_context: 'Rare neurological disease; $100K-$300K annually. Orphan designation available.',
  },

  {
    name: 'Multiple Sclerosis',
    synonyms: ['MS', 'relapsing MS', 'RRMS', 'relapsing-remitting multiple sclerosis', 'PPMS', 'progressive MS'],
    icd10_codes: ['G35'],
    therapy_area: 'neurology',
    us_prevalence: 1000000,
    us_incidence: 10000,
    prevalence_source: 'National MS Society 2024; MSIF Atlas',
    diagnosis_rate: 0.90,
    treatment_rate: 0.82,
    cagr_5yr: 5.8,
    major_competitors: [
      'Ocrevus (ocrelizumab, Roche)',
      'Kesimpta (ofatumumab, Novartis)',
      'Tysabri (natalizumab, Biogen)',
      'Mavenclad (cladribine, EMD Serono)',
      'Zeposia (ozanimod, BMS)',
      'Fenway (ponesimod, Janssen)',
    ],
    market_growth_driver: 'Progressive MS treatment gap, neuroprotection/repair targets, subtype-specific biologics',
    therapy_area_pricing_context: 'Highly competitive; Ocrevus set $65K/year benchmark. Novel mechanisms with neuroprotection claims could command premium',
  },

  {
    name: 'Spinal Muscular Atrophy',
    synonyms: ['SMA', 'spinal muscular atrophy type 1', 'SMA1', 'SMA2', 'SMA3'],
    icd10_codes: ['G12.0', 'G12.1'],
    therapy_area: 'neurology',
    us_prevalence: 10000,
    us_incidence: 600,
    prevalence_source: 'SMA Foundation; Cure SMA 2024',
    diagnosis_rate: 0.95,        // Newborn screening expanding
    treatment_rate: 0.90,
    cagr_5yr: 18.5,
    major_competitors: [
      'Zolgensma (onasemnogene, Novartis) — $2.1M gene therapy',
      'Spinraza (nusinersen, Biogen) — $125K/year',
      'Evrysdi (risdiplam, Roche) — $340K/year',
    ],
    market_growth_driver: 'Gene therapy precedent, combination approaches, next-gen RNA splicing therapies, newborn screening expansion',
    therapy_area_pricing_context: 'Ultra-rare; gene therapy sets multi-million dollar precedent. Chronic treatments $120K-$340K annually.',
  },

  // ──────────────────────────────────────────
  // RARE DISEASE
  // ──────────────────────────────────────────
  {
    name: 'Duchenne Muscular Dystrophy',
    synonyms: ['DMD', 'Duchenne MD', 'X-linked muscular dystrophy'],
    icd10_codes: ['G71.01'],
    therapy_area: 'rare_disease',
    us_prevalence: 15000,
    us_incidence: 500,
    prevalence_source: 'Parent Project Muscular Dystrophy 2024; CDC',
    diagnosis_rate: 0.92,
    treatment_rate: 0.85,
    cagr_5yr: 22.0,
    major_competitors: [
      'Elevidys (delandistrogene moxeparvovec, Sarepta) — gene therapy',
      'Exondys 51 (eteplirsen, Sarepta)',
      'Vyondys 53 (golodirsen, Sarepta)',
      'Amondys 45 (casimersen, Sarepta)',
      'Viltepso (viltolarsen, NS Pharma)',
      'Corticosteroids (standard of care)',
    ],
    market_growth_driver: 'Gene therapy expansion (all patients), exon skipping expansion, stop codon readthrough, combination approaches',
    therapy_area_pricing_context: 'Ultra-rare, pediatric; gene therapies $3M+. Chronic therapies $500K-$1M annually.',
  },

  {
    name: 'Cystic Fibrosis',
    synonyms: ['CF', 'cystic fibrosis', 'CF lung disease'],
    icd10_codes: ['E84', 'E84.0', 'E84.1', 'E84.8', 'E84.9'],
    therapy_area: 'rare_disease',
    us_prevalence: 35000,
    us_incidence: 1000,
    prevalence_source: 'Cystic Fibrosis Foundation 2024 Patient Registry',
    diagnosis_rate: 0.98,        // Newborn screening near-universal
    treatment_rate: 0.92,
    cagr_5yr: 6.5,               // Trikafta has transformed market
    major_competitors: [
      'Trikafta (elexacaftor/tezacaftor/ivacaftor, Vertex)',
      'Symdeko (tezacaftor/ivacaftor, Vertex)',
      'Orkambi (lumacaftor/ivacaftor, Vertex)',
      'Kalydeco (ivacaftor, Vertex)',
    ],
    market_growth_driver: 'Patients not eligible for current modulators, next-gen modulators, mRNA/gene therapy, combination approaches',
    therapy_area_pricing_context: 'Vertex dominant at $300K+ annually; gene therapy could be single curative dose',
  },

  // ──────────────────────────────────────────
  // IMMUNOLOGY / INFLAMMATION
  // ──────────────────────────────────────────
  {
    name: 'Rheumatoid Arthritis',
    synonyms: ['RA', 'rheumatoid arthritis', 'seronegative RA', 'seropositive RA'],
    icd10_codes: ['M05', 'M06'],
    therapy_area: 'immunology',
    us_prevalence: 1500000,
    us_incidence: 75000,
    prevalence_source: 'American College of Rheumatology 2024; ACR Epidemiology',
    diagnosis_rate: 0.72,
    treatment_rate: 0.75,
    cagr_5yr: 5.2,
    major_competitors: [
      'Humira (adalimumab, AbbVie)',
      'Rinvoq (upadacitinib, AbbVie)',
      'Skyrizi (risankizumab, AbbVie)',
      'Orencia (abatacept, BMS)',
      'Actemra (tocilizumab, Roche)',
      'Xeljanz (tofacitinib, Pfizer)',
    ],
    market_growth_driver: 'Post-Humira biosimilar dynamics, next-gen selective JAKi, B cell depletion, bispecifics',
    therapy_area_pricing_context: 'Highly competitive; TNF biosimilars driving price pressure. Novel mechanisms with superior efficacy needed for premium positioning ($40K-$60K annually)',
  },

  // ──────────────────────────────────────────
  // CARDIOLOGY
  // ──────────────────────────────────────────
  {
    name: 'Heart Failure with Reduced Ejection Fraction',
    synonyms: ['HFrEF', 'heart failure', 'systolic heart failure', 'CHF', 'congestive heart failure'],
    icd10_codes: ['I50.20', 'I50.21', 'I50.22', 'I50.23'],
    therapy_area: 'cardiovascular',
    us_prevalence: 3600000,
    us_incidence: 550000,
    prevalence_source: 'American Heart Association 2024 Statistical Update',
    diagnosis_rate: 0.80,
    treatment_rate: 0.70,
    cagr_5yr: 6.8,
    major_competitors: [
      'Entresto (sacubitril/valsartan, Novartis)',
      'Farxiga (dapagliflozin, AstraZeneca)',
      'Jardiance (empagliflozin, Boehringer)',
      'Verquvo (vericiguat, Merck/Bayer)',
      'Ivabradine (Amgen)',
      'ACE inhibitors / ARBs (generic)',
      'Beta blockers (generic)',
    ],
    market_growth_driver: 'SGLT2 class expansion, combination regimens, HFpEF emerging market, device-drug combination',
    therapy_area_pricing_context: 'Price-sensitive; generic backbone + branded agents. Novel mechanisms need strong outcome data for formulary positioning ($25K-$45K annually)',
  },

  // ──────────────────────────────────────────
  // METABOLIC
  // ──────────────────────────────────────────
  {
    name: 'Type 2 Diabetes',
    synonyms: ['T2DM', 'type 2 diabetes mellitus', 'T2D', 'diabetes', 'adult-onset diabetes'],
    icd10_codes: ['E11', 'E11.0', 'E11.9', 'E11.65'],
    therapy_area: 'cardiovascular',
    us_prevalence: 38000000,
    us_incidence: 1900000,
    prevalence_source: 'CDC National Diabetes Statistics Report 2024; ADA',
    diagnosis_rate: 0.79,        // ~21% undiagnosed per CDC
    treatment_rate: 0.82,
    cagr_5yr: 7.5,
    major_competitors: [
      'Ozempic (semaglutide, Novo Nordisk)',
      'Mounjaro (tirzepatide, Eli Lilly)',
      'Jardiance (empagliflozin, Boehringer)',
      'Farxiga (dapagliflozin, AstraZeneca)',
      'Metformin (generic)',
      'GLP-1 class broadly',
    ],
    market_growth_driver: 'GLP-1 class expansion, NASH comorbidity treatment, weight management, combination approaches, oral GLP-1 development',
    therapy_area_pricing_context: 'GLP-1 agents at $10K-$15K annually; high formulary competition and rebating. Access/adherence critical.',
  },

  {
    name: 'Obesity',
    synonyms: ['obesity', 'overweight and obesity', 'BMI > 30', 'adiposity', 'weight management'],
    icd10_codes: ['E66', 'E66.01', 'E66.09'],
    therapy_area: 'cardiovascular',
    us_prevalence: 108000000,
    us_incidence: 8000000,
    prevalence_source: 'CDC NHANES 2024; Trust for America\'s Health',
    diagnosis_rate: 0.60,        // Many obese patients not coded/treated for obesity
    treatment_rate: 0.25,        // Only fraction receiving pharmacotherapy
    cagr_5yr: 32.0,              // Explosive growth driven by GLP-1 class
    major_competitors: [
      'Wegovy (semaglutide 2.4mg, Novo Nordisk)',
      'Zepbound (tirzepatide, Eli Lilly)',
      'Saxenda (liraglutide, Novo Nordisk)',
      'Qsymia (phentermine/topiramate, Vivus)',
      'Contrave (naltrexone/bupropion, Currax)',
    ],
    market_growth_driver: 'Massive untreated population, next-gen triple agonists (GIP/GLP-1/glucagon), oral formulations, combination approaches, subcutaneous monthly dosing',
    therapy_area_pricing_context: 'Wegovy at $1,350/month ($16K/year). Payer coverage inconsistent but improving. Next-gen differentiation needs to justify premium.',
  },

  // ──────────────────────────────────────────
  // INFECTIOUS DISEASE
  // ──────────────────────────────────────────
  {
    name: 'HIV/AIDS',
    synonyms: ['HIV', 'human immunodeficiency virus', 'AIDS', 'HIV infection', 'HIV-1'],
    icd10_codes: ['B20', 'Z21'],
    therapy_area: 'infectious_disease',
    us_prevalence: 1200000,
    us_incidence: 36000,
    prevalence_source: 'CDC HIV Surveillance Report 2024; HRSA Ryan White',
    diagnosis_rate: 0.87,
    treatment_rate: 0.80,
    cagr_5yr: 4.2,
    major_competitors: [
      'Biktarvy (BIC/TAF/FTC, Gilead)',
      'Dovato (DTG/3TC, ViiV)',
      'Cabenuva (CAB + RPV, ViiV/Janssen) — long-acting IM',
      'Sunlenca (lenacapavir, Gilead) — twice-yearly SC',
      'Descovy (TAF/FTC, Gilead)',
    ],
    market_growth_driver: 'Ultra-long-acting formulations (implant/annual), cure strategies, broadly neutralizing antibodies, prevention expansion',
    therapy_area_pricing_context: 'Established regimens $20K-$40K annually. Long-acting innovations command premium for convenience; cure would be high single-payment scenario',
  },

  // ──────────────────────────────────────────
  // HEMATOLOGY (NON-ONCOLOGY)
  // ──────────────────────────────────────────
  {
    name: 'Sickle Cell Disease',
    synonyms: ['SCD', 'sickle cell anemia', 'HbSS disease', 'hemoglobin SS', 'sickle cell'],
    icd10_codes: ['D57.0', 'D57.1', 'D57.2', 'D57.3', 'D57.4', 'D57.8'],
    therapy_area: 'rare_disease',
    us_prevalence: 100000,
    us_incidence: 2000,
    prevalence_source: 'CDC Sickle Cell Disease Data; ASH 2024',
    diagnosis_rate: 0.98,        // Universal newborn screening
    treatment_rate: 0.75,
    cagr_5yr: 25.0,
    major_competitors: [
      'Casgevy (exagamglogene, Vertex/CRISPR) — gene editing cure',
      'Lyfgenia (lovotibeglogene, bluebird bio) — gene therapy',
      'Oxbryta (voxelotor, Pfizer) — recently withdrawn',
      'Adakveo (crizanlizumab, Novartis) — withdrawn',
      'Endari (L-glutamine, Emmaus)',
      'Hydroxyurea (generic)',
    ],
    market_growth_driver: 'Gene therapy/editing expansion, anti-sickling agents, VOC prevention, pediatric approaches',
    therapy_area_pricing_context: 'Gene therapies at $2-3M+ for cure; chronic therapies $50K-$150K. Access disparities given predominantly Black patient population.',
  },

  // ──────────────────────────────────────────
  // OPHTHALMOLOGY
  // ──────────────────────────────────────────
  {
    name: 'Neovascular Age-Related Macular Degeneration',
    synonyms: ['wet AMD', 'nAMD', 'neovascular AMD', 'exudative AMD', 'wet macular degeneration'],
    icd10_codes: ['H35.31', 'H35.32'],
    therapy_area: 'ophthalmology',
    us_prevalence: 1800000,
    us_incidence: 200000,
    prevalence_source: 'Bright Focus Foundation 2024; AAO',
    diagnosis_rate: 0.85,
    treatment_rate: 0.70,
    cagr_5yr: 7.8,
    major_competitors: [
      'Eylea (aflibercept, Regeneron)',
      'Eylea HD (high-dose aflibercept, Regeneron)',
      'Vabysmo (faricimab, Roche) — anti-VEGF + Ang-2',
      'Susvimo (ranibizumab port delivery, Roche)',
      'Syfovre (pegcetacoplan, Apellis)',
      'Lucentis (ranibizumab, Genentech)',
    ],
    market_growth_driver: 'Extended dosing intervals, gene therapy single-dose cure potential, combination anti-VEGF approaches, GA prevention',
    therapy_area_pricing_context: 'Anti-VEGF injections $2K-$8K per dose; $15K-$40K annually. Gene therapy for sustained delivery could be high-value single-payment.',
  },

];

// Export helper for lookup
export function findIndicationByName(name: string): IndicationData | undefined {
  const normalized = name.toLowerCase().trim();
  return INDICATION_DATA.find(i =>
    i.name.toLowerCase() === normalized ||
    i.synonyms.some(s => s.toLowerCase() === normalized) ||
    normalized.includes(i.name.toLowerCase()) ||
    i.name.toLowerCase().includes(normalized)
  );
}

export function getIndicationNames(): string[] {
  return INDICATION_DATA.map(i => i.name);
}

export function getIndicationSuggestions(query: string): IndicationData[] {
  if (!query || query.length < 2) return INDICATION_DATA.slice(0, 10);
  const q = query.toLowerCase();
  return INDICATION_DATA.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.synonyms.some(s => s.toLowerCase().includes(q))
  ).slice(0, 10);
}

/*
  ────────────────────────────────────────────────────────────
  NOTE TO CLAUDE CODE:
  
  Expand this list to 150+ indications covering:
  
  ONCOLOGY (additional 30+ needed):
  - Diffuse Large B-Cell Lymphoma (DLBCL)
  - Follicular Lymphoma
  - Multiple Myeloma
  - Renal Cell Carcinoma
  - Hepatocellular Carcinoma
  - Gastric / Gastroesophageal Junction Cancer
  - Bladder Cancer (Urothelial Carcinoma)
  - Melanoma
  - Prostate Cancer (CRPC, CSPC)
  - Cervical Cancer
  - Endometrial Cancer
  - Thyroid Cancer
  - Head & Neck Squamous Cell Carcinoma
  - Glioblastoma Multiforme
  - Mesothelioma
  - Small Cell Lung Cancer
  - Merkel Cell Carcinoma
  - Cholangiocarcinoma
  - Adrenocortical Carcinoma
  
  NEUROLOGY / CNS (additional 15+):
  - Epilepsy / Treatment-Resistant Epilepsy
  - Migraine (episodic and chronic)
  - Huntington Disease
  - Friedreich Ataxia
  - Progressive Supranuclear Palsy
  - Myasthenia Gravis
  - Neuromyelitis Optica
  - Peripheral Neuropathy
  - Transthyretin Amyloid Cardiomyopathy (ATTR-CM)
  
  RARE DISEASE (additional 20+):
  - Gaucher Disease
  - Pompe Disease
  - Fabry Disease
  - Hereditary Angioedema
  - Phenylketonuria (PKU)
  - Wilson Disease
  - Lysosomal Acid Lipase Deficiency
  - Acute Hepatic Porphyria
  
  IMMUNOLOGY (additional 10+):
  - Systemic Lupus Erythematosus (SLE)
  - Psoriatic Arthritis
  - Ankylosing Spondylitis
  - Atopic Dermatitis
  - Plaque Psoriasis
  - Crohn's Disease
  - Ulcerative Colitis
  - Giant Cell Arteritis
  
  CARDIOVASCULAR (additional 10+):
  - HFpEF
  - NASH / Steatotic Liver Disease
  - Primary Hypercholesterolemia
  - Pulmonary Arterial Hypertension
  - Chronic Thromboembolic Pulmonary Hypertension
  
  INFECTIOUS DISEASE (additional 5+):
  - RSV
  - Influenza
  - MRSA / Serious Bacterial Infections
  - Clostridioides difficile
  
  Follow exact same data structure for each indication.
  Source prevalence/incidence from:
  - CDC NCHS / WONDER database
  - NIH National Institute reports
  - Disease-specific foundation statistics
  - SEER for cancer indications
  - Published systematic reviews / meta-analyses
  ────────────────────────────────────────────────────────────
*/
