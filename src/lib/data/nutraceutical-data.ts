// ============================================================
// TERRAIN — Nutraceutical / Consumer Health / Longevity Data
// src/lib/data/nutraceutical-data.ts
//
// OTC regulatory framework, ingredient database, channel
// economics, and market context for the nutraceutical module.
// ============================================================

import type { NutraceuticalChannel } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// OTC & NUTRACEUTICAL REGULATORY PATHWAYS
// ────────────────────────────────────────────────────────────

export interface OTCRegulatoryPathway {
  pathway: string;
  description: string;
  applicable_categories: string[];
  regulatory_body: string;
  approval_required: boolean;
  timeline_months: { optimistic: number; realistic: number; pessimistic: number };
  estimated_cost_range_k: { low: number; high: number };
  key_requirements: string[];
  claim_types_allowed: string[];
  post_market_requirements: string[];
  risks: string[];
  notable_examples: { product: string; company: string; category: string }[];
}

export const OTC_REGULATORY_PATHWAYS: OTCRegulatoryPathway[] = [
  {
    pathway: 'DSHEA Dietary Supplement',
    description:
      'Dietary Supplement Health and Education Act (1994). No pre-market FDA approval required. Manufacturer responsible for safety and labeling. Must notify FDA of new dietary ingredients (NDI) not marketed before 1994.',
    applicable_categories: [
      'dietary_supplement',
      'longevity_compound',
      'probiotic_microbiome',
      'sports_nutrition',
      'functional_food',
    ],
    regulatory_body: 'FDA (CFSAN)',
    approval_required: false,
    timeline_months: { optimistic: 2, realistic: 6, pessimistic: 12 },
    estimated_cost_range_k: { low: 50, high: 500 },
    key_requirements: [
      'cGMP compliance (21 CFR Part 111)',
      'Facility registration with FDA',
      'New Dietary Ingredient (NDI) notification if ingredient not marketed pre-1994',
      'Accurate Supplement Facts panel',
      'Structure/function claim disclaimer ("not evaluated by FDA")',
      'Adverse event reporting (serious AEs within 15 business days)',
      'No disease claims (cannot claim to treat, cure, prevent disease)',
      'Identity testing of 100% of incoming ingredient lots',
    ],
    claim_types_allowed: ['structure_function', 'nutrient_content', 'qualified_health'],
    post_market_requirements: [
      'Serious adverse event reporting',
      'Maintain complaint files and batch records',
      'Annual facility registration',
      'Comply with FTC advertising rules',
    ],
    risks: [
      'FDA can challenge NDI status — NMN and NAC precedents (2022)',
      'FTC enforcement for unsubstantiated claims',
      'State AG actions (especially NY, CA)',
      'Amazon/retailer-imposed testing requirements increasingly strict',
      'Class action lawsuits for mislabeling or false claims',
    ],
    notable_examples: [
      {
        product: 'AG1 (Athletic Greens)',
        company: 'Athletic Greens',
        category: 'Greens powder — structure/function claims',
      },
      { product: 'Tru Niagen (NR)', company: 'ChromaDex', category: 'NAD+ precursor — NDI accepted' },
      { product: 'Seed DS-01 Synbiotic', company: 'Seed Health', category: 'Probiotic — clinical evidence emphasis' },
    ],
  },
  {
    pathway: 'NDI (New Dietary Ingredient) Notification',
    description:
      'Required for ingredients not marketed in the US before October 15, 1994. Manufacturer must file NDI notification with FDA 75 days before marketing, providing evidence of "reasonable expectation of safety."',
    applicable_categories: ['dietary_supplement', 'longevity_compound', 'probiotic_microbiome'],
    regulatory_body: 'FDA (CFSAN)',
    approval_required: false,
    timeline_months: { optimistic: 3, realistic: 8, pessimistic: 18 },
    estimated_cost_range_k: { low: 100, high: 800 },
    key_requirements: [
      '75-day pre-market notification to FDA',
      'Safety dossier with history of use and/or toxicology studies',
      'Manufacturing characterization and identity standards',
      'Stability data',
      'Proposed conditions of use (dose, frequency, duration)',
      'Literature review or original safety studies',
    ],
    claim_types_allowed: ['structure_function', 'nutrient_content'],
    post_market_requirements: ['Same as DSHEA supplement requirements', 'Maintain safety dossier updates'],
    risks: [
      'FDA can reject NDI notification — requires reformulation or additional studies',
      'FDA has issued ~1,000 NDI acknowledgment letters; rejection rate ~35%',
      'Competitor challenge if NDI basis is weak',
      'Post-market safety signal can trigger FDA warning letter',
    ],
    notable_examples: [
      { product: 'Niagen (NR chloride)', company: 'ChromaDex', category: 'NDI accepted — NAD+ precursor' },
      { product: 'Mitopure (Urolithin A)', company: 'Amazentis/Timeline', category: 'NDI accepted + GRAS — mitophagy' },
      { product: 'NMN', company: 'Multiple', category: 'NDI rejected by FDA (2022) — IND exclusion cited' },
    ],
  },
  {
    pathway: 'OTC Drug Monograph (CARES Act)',
    description:
      'OTC Monograph Reform (CARES Act 2020) replaced the old rulemaking system with administrative orders. Products conforming to a monograph do not need individual NDA approval. FDA issues administrative orders to establish/revise monographs.',
    applicable_categories: ['otc_drug'],
    regulatory_body: 'FDA (CDER/OTC)',
    approval_required: false,
    timeline_months: { optimistic: 6, realistic: 12, pessimistic: 24 },
    estimated_cost_range_k: { low: 200, high: 2000 },
    key_requirements: [
      'Product must conform to an existing OTC monograph (active ingredient, dose, indication, labeling)',
      'Drug Facts labeling format (21 CFR 201.66)',
      'Drug registration and listing with FDA',
      'cGMP for drugs (21 CFR Parts 210/211 — stricter than supplement cGMP)',
      'NDC number assignment',
      'Annual product listing updates',
      'If no existing monograph: OTC Monograph Order Request (OMOR) process',
    ],
    claim_types_allowed: ['drug_claim'],
    post_market_requirements: [
      'Adverse event reporting (MedWatch)',
      'Annual product listing',
      'cGMP inspections by FDA',
      'Label compliance monitoring',
    ],
    risks: [
      'Limited monograph categories — not all health areas covered',
      'Monograph changes via administrative order can restrict ingredients',
      'Higher manufacturing standards than supplements (drug cGMP)',
      'State-level additional requirements (e.g., CA Prop 65)',
    ],
    notable_examples: [
      { product: 'Tylenol (acetaminophen)', company: 'Johnson & Johnson', category: 'OTC analgesic monograph' },
      { product: 'Benadryl (diphenhydramine)', company: 'Johnson & Johnson', category: 'OTC antihistamine monograph' },
      { product: 'Prilosec OTC (omeprazole)', company: 'Procter & Gamble', category: 'Rx-to-OTC switch + monograph' },
    ],
  },
  {
    pathway: 'Rx-to-OTC Switch (NDA/sNDA)',
    description:
      'Converting a prescription drug to OTC status. Requires supplemental NDA (sNDA) demonstrating consumers can safely self-select and use without physician oversight. Label comprehension and actual-use studies required.',
    applicable_categories: ['rx_to_otc_switch'],
    regulatory_body: 'FDA (CDER)',
    approval_required: true,
    timeline_months: { optimistic: 24, realistic: 36, pessimistic: 60 },
    estimated_cost_range_k: { low: 5000, high: 25000 },
    key_requirements: [
      'Supplemental NDA to CDER',
      'Label comprehension study (LCS) — consumers understand Drug Facts label',
      'Self-selection study (SSS) — consumers identify appropriate use without physician',
      'Actual-use trial (AUT) — real-world evidence of safe self-administration',
      'Safety review with OTC Advisory Committee',
      'Revised Drug Facts label meeting OTC format requirements',
      'Post-market safety surveillance plan',
    ],
    claim_types_allowed: ['drug_claim'],
    post_market_requirements: [
      'Robust pharmacovigilance program',
      'Post-market studies if required by FDA',
      'MedWatch adverse event reporting',
      'Label updates as safety data accumulates',
    ],
    risks: [
      'High cost ($5-25M for switch program)',
      'FDA Advisory Committee can recommend against switch',
      'Rx revenue cannibalization risk',
      'Insurance coverage typically lost after OTC switch',
      'Consumer safety concerns for self-medication',
    ],
    notable_examples: [
      { product: 'Allegra (fexofenadine)', company: 'Sanofi', category: 'Rx-to-OTC switch 2011 — antihistamine' },
      { product: 'Nexium 24HR (esomeprazole)', company: 'Pfizer/GSK', category: 'Rx-to-OTC switch 2014 — PPI' },
      { product: 'Opill (norgestrel)', company: 'Perrigo', category: 'First OTC birth control pill — approved 2023' },
    ],
  },
  {
    pathway: 'Medical Food',
    description:
      'Products for dietary management of diseases with distinctive nutritional needs. Must be used under physician supervision. No pre-market approval but must meet medical food criteria. FDA enforces classification aggressively.',
    applicable_categories: ['medical_food'],
    regulatory_body: 'FDA (CFSAN)',
    approval_required: false,
    timeline_months: { optimistic: 3, realistic: 6, pessimistic: 12 },
    estimated_cost_range_k: { low: 50, high: 300 },
    key_requirements: [
      'Product must be for dietary management of disease with distinctive nutritional needs',
      'Must be used under physician supervision',
      'GRAS ingredients required',
      'Cannot make drug claims',
      'Must provide nutritional support that cannot be achieved through normal diet alone',
      'Labeling must include "Medical Food" designation',
      'cGMP compliance',
    ],
    claim_types_allowed: ['structure_function', 'nutrient_content'],
    post_market_requirements: ['Adverse event reporting', 'Maintain clinical substantiation for medical food status'],
    risks: [
      'FDA has challenged medical food classifications aggressively',
      'Must genuinely meet medical food criteria (distinctive nutritional needs of disease)',
      'FTC scrutiny of marketing claims',
    ],
    notable_examples: [
      {
        product: 'Axona (caprylic triglyceride)',
        company: 'Cerecin',
        category: "Alzheimer's medical food (controversial)",
      },
      {
        product: 'Deplin (L-methylfolate)',
        company: 'Alfasigma',
        category: 'Depression folate deficiency medical food',
      },
      {
        product: 'Limbrel (flavocoxid)',
        company: 'Primus/Limerick',
        category: 'Osteoarthritis medical food (FDA challenged)',
      },
    ],
  },
  {
    pathway: 'Cosmetic / Cosmeceutical',
    description:
      'Products intended to cleanse, beautify, or alter appearance. No pre-market FDA approval. "Cosmeceutical" is not an FDA-recognized category. MoCRA (2022) added new registration, listing, and safety requirements.',
    applicable_categories: ['cosmeceutical'],
    regulatory_body: 'FDA (CFSAN) + FTC',
    approval_required: false,
    timeline_months: { optimistic: 1, realistic: 2, pessimistic: 4 },
    estimated_cost_range_k: { low: 5, high: 50 },
    key_requirements: [
      'MoCRA (Modernization of Cosmetics Regulation Act, 2022) compliance',
      'Facility registration and product listing with FDA',
      'Adverse event reporting (serious AEs within 15 days)',
      'Safety substantiation (records must be available to FDA)',
      'Good manufacturing practices (FDA rulemaking pending)',
      'Fragrance allergen labeling',
      'No drug claims (cannot claim to change body structure/function)',
      'Color additives must be FDA-approved for intended use',
    ],
    claim_types_allowed: ['cosmetic_claim'],
    post_market_requirements: [
      'Serious adverse event reporting (new under MoCRA 2022)',
      'Facility registration renewal',
      'Product listing updates',
      'Records maintenance for safety substantiation',
    ],
    risks: [
      'Drug claims trigger FDA enforcement (product becomes unapproved drug)',
      'MoCRA 2022 significantly increased FDA oversight of cosmetics',
      'State-level regulation (California, EU compliance for export)',
      'Ingredient bans (PFAS, formaldehyde donors under scrutiny)',
    ],
    notable_examples: [
      { product: 'SkinCeuticals CE Ferulic', company: "L'Oreal", category: 'Vitamin C serum — cosmetic claim' },
      { product: 'Retinol serums', company: 'Various', category: 'Cosmetic if no drug claims; drug if "treats acne"' },
      {
        product: 'Retin-A (tretinoin)',
        company: 'Valeant/Bausch',
        category: 'Rx drug — NOT cosmetic despite anti-aging use',
      },
    ],
  },
  {
    pathway: 'FTC Advertising Compliance',
    description:
      'FTC enforces truth-in-advertising for supplements, OTC drugs, and consumer health products. "Competent and reliable scientific evidence" standard. Applies alongside FDA regulation.',
    applicable_categories: [
      'dietary_supplement',
      'otc_drug',
      'longevity_compound',
      'cosmeceutical',
      'probiotic_microbiome',
      'sports_nutrition',
      'functional_food',
    ],
    regulatory_body: 'FTC (Federal Trade Commission)',
    approval_required: false,
    timeline_months: { optimistic: 0, realistic: 1, pessimistic: 3 },
    estimated_cost_range_k: { low: 5, high: 50 },
    key_requirements: [
      'All advertising claims must be truthful and not misleading',
      '"Competent and reliable scientific evidence" for health claims',
      'Typically requires at least one well-designed RCT for efficacy claims',
      'Testimonials must reflect typical results (or disclose atypicality)',
      'Influencer marketing must disclose material connections',
      'Cannot imply FDA approval/endorsement',
      'Substantiation must exist BEFORE making claims',
    ],
    claim_types_allowed: ['structure_function', 'qualified_health', 'nutrient_content', 'cosmetic_claim'],
    post_market_requirements: [
      'Maintain substantiation files for all claims',
      'Monitor advertising (including social media, influencers)',
      'Respond to FTC Civil Investigative Demands (CIDs)',
    ],
    risks: [
      'FTC consent decrees can impose millions in penalties',
      'Individual officer liability for misleading claims',
      'Class action lawsuits triggered by FTC enforcement',
      'Social media/influencer claims are company responsibility',
      'Recent FTC enforcement trend: targeting NAD+ / longevity claims',
    ],
    notable_examples: [
      {
        product: 'Prevagen (apoaequorin)',
        company: 'Quincy Bioscience',
        category: 'FTC lawsuit for unsubstantiated memory claims ($12M)',
      },
      { product: 'POM Wonderful', company: 'POM Wonderful', category: 'FTC case — health claims ruled deceptive' },
      {
        product: 'Airborne (vitamin C)',
        company: 'Airborne',
        category: '$23.3M FTC settlement for false cold prevention claims',
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// NUTRACEUTICAL INGREDIENT DATABASE
// ────────────────────────────────────────────────────────────

export interface NutraceuticalIngredient {
  name: string;
  category: string;
  health_focus: string;
  regulatory_status: string;
  clinical_evidence_level: 'strong' | 'moderate' | 'emerging' | 'preliminary';
  us_market_size_m_2025: number;
  cagr_5yr_pct: number;
  typical_dose: string;
  typical_retail_price_monthly: { low: number; high: number };
  key_brands: string[];
  ip_landscape: string;
  trending: boolean;
  target_demographic?: string[];
}

export const NUTRACEUTICAL_INGREDIENTS: NutraceuticalIngredient[] = [
  // ═══ LONGEVITY / ANTI-AGING ═══
  {
    name: 'NMN (Nicotinamide Mononucleotide)',
    category: 'Longevity',
    health_focus: 'NAD+ restoration, cellular energy, aging',
    regulatory_status:
      'DSHEA status disputed — FDA issued exclusion opinion 2022 (Metro International IND). Industry challenging. Still widely sold.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 320,
    cagr_5yr_pct: 28,
    typical_dose: '250-1000mg/day',
    typical_retail_price_monthly: { low: 30, high: 120 },
    key_brands: ['ProHealth Longevity', 'Wonderfeel', 'Renue By Science', 'DoNotAge'],
    ip_landscape: 'Sinclair/Harvard patents on NMN for NAD+ (licensed to Metro International). Expiring 2030s.',
    trending: true,
    target_demographic: ['Adults 40+', 'Longevity-focused consumers', 'Biohackers', 'Anti-aging enthusiasts'],
  },
  {
    name: 'NR (Nicotinamide Riboside)',
    category: 'Longevity',
    health_focus: 'NAD+ precursor, cellular metabolism',
    regulatory_status: 'NDI accepted. GRAS affirmed. Patented by ChromaDex (Niagen). Cleaner regulatory path than NMN.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 18,
    typical_dose: '300-600mg/day',
    typical_retail_price_monthly: { low: 35, high: 80 },
    key_brands: ['Tru Niagen (ChromaDex)', 'Elysium Basis', 'Life Extension'],
    ip_landscape: 'ChromaDex holds key patents on Niagen (NR chloride). Dartmouth/Cornell origin patents.',
    trending: true,
    target_demographic: ['Adults 40+', 'Longevity-focused consumers', 'Biohackers', 'Health-conscious professionals'],
  },
  {
    name: 'Resveratrol',
    category: 'Longevity',
    health_focus: 'Sirtuin activation, antioxidant, cardiovascular',
    regulatory_status: 'DSHEA — dietary supplement. NDI not required (historical use). GRAS.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 5,
    typical_dose: '250-1000mg/day',
    typical_retail_price_monthly: { low: 15, high: 50 },
    key_brands: ['Life Extension', 'NOW Foods', 'Thorne'],
    ip_landscape: 'Largely off-patent. Bioavailability-enhanced formulations patentable.',
    trending: false,
    target_demographic: [
      'Adults 40+',
      'Longevity-focused consumers',
      'Cardiovascular risk-conscious adults',
      'Wine enthusiasts seeking health benefits',
    ],
  },
  {
    name: 'Spermidine',
    category: 'Longevity',
    health_focus: 'Autophagy induction, cardiovascular, cognitive',
    regulatory_status: 'DSHEA — sold as supplement (wheat germ extract). NDI filed by some manufacturers.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 65,
    cagr_5yr_pct: 35,
    typical_dose: '1-6mg/day',
    typical_retail_price_monthly: { low: 30, high: 80 },
    key_brands: ['spermidineLIFE', 'Oxford Healthspan', 'DoNotAge'],
    ip_landscape: 'Lonza partnership with spermidineLIFE. Wheat germ-derived broadly accessible.',
    trending: true,
    target_demographic: [
      'Adults 40+',
      'Longevity-focused consumers',
      'Biohackers',
      'Autophagy-aware health enthusiasts',
    ],
  },
  {
    name: 'Fisetin',
    category: 'Longevity',
    health_focus: 'Senolytic (clears senescent cells), anti-inflammatory',
    regulatory_status: 'DSHEA — sold as supplement (strawberry-derived flavonoid).',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 40,
    cagr_5yr_pct: 38,
    typical_dose: '100-500mg/day',
    typical_retail_price_monthly: { low: 15, high: 60 },
    key_brands: ['Life Extension', "Doctor's Best", 'Swanson'],
    ip_landscape: 'Open — no dominant patents. Mayo Clinic trials on senolytic protocols.',
    trending: true,
    target_demographic: ['Adults 50+', 'Longevity-focused consumers', 'Biohackers', 'Senolytic protocol followers'],
  },

  // ═══ GUT / MICROBIOME ═══
  {
    name: 'Multi-strain Probiotics',
    category: 'Gut Health',
    health_focus: 'Digestive health, immune support, gut-brain axis',
    regulatory_status: 'DSHEA — dietary supplement. Some strains have NDI.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 4200,
    cagr_5yr_pct: 9,
    typical_dose: '1-50 billion CFU/day',
    typical_retail_price_monthly: { low: 15, high: 80 },
    key_brands: ['Seed', 'Culturelle', 'Align', 'VSL#3', 'Garden of Life'],
    ip_landscape: 'Strain-specific patents (Probi, Chr. Hansen). Formulation IP is primary moat.',
    trending: false,
    target_demographic: [
      'Adults with digestive issues',
      'IBS sufferers',
      'Immune-conscious consumers',
      'Post-antibiotic recovery',
    ],
  },
  {
    name: 'Postbiotics (Urolithin A)',
    category: 'Gut Health / Longevity',
    health_focus: 'Mitophagy, mitochondrial health, muscle function',
    regulatory_status: 'GRAS affirmed. NDI filed. Amazentis holds key patents (Mitopure/Timeline brand).',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 85,
    cagr_5yr_pct: 40,
    typical_dose: '500-1000mg/day',
    typical_retail_price_monthly: { low: 50, high: 80 },
    key_brands: ['Timeline (Amazentis)', 'Mitopure'],
    ip_landscape: 'Amazentis/Nestle holds composition and use patents. Strong IP moat.',
    trending: true,
    target_demographic: [
      'Adults 40+',
      'Aging adults concerned about muscle decline',
      'Longevity-focused consumers',
      'Exercise recovery seekers',
    ],
  },

  // ═══ COGNITIVE / NOOTROPICS ═══
  {
    name: "Lion's Mane (Hericium erinaceus)",
    category: 'Cognitive',
    health_focus: 'Nerve growth factor, cognitive function, neuroprotection',
    regulatory_status: 'DSHEA — mushroom extract, long history of use. NDI not required.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 220,
    cagr_5yr_pct: 22,
    typical_dose: '500-3000mg/day (fruiting body extract)',
    typical_retail_price_monthly: { low: 20, high: 60 },
    key_brands: ['Host Defense (Paul Stamets)', 'Real Mushrooms', 'Four Sigmatic', 'Nootropics Depot'],
    ip_landscape: 'Open — no dominant patents on whole extract. Erinacine-enriched standardizations patentable.',
    trending: true,
    target_demographic: [
      'Cognitive performance seekers',
      'Students',
      'Adults 50+',
      'Neurodegenerative risk individuals',
    ],
  },
  {
    name: 'Creatine Monohydrate',
    category: 'Cognitive / Sports',
    health_focus: 'Muscle performance, cognitive enhancement, brain energy metabolism',
    regulatory_status: 'DSHEA — one of the most studied supplements. GRAS. No regulatory concerns.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 680,
    cagr_5yr_pct: 12,
    typical_dose: '3-5g/day',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['Thorne', 'NOW', 'Optimum Nutrition', 'Momentous'],
    ip_landscape: 'Open — base creatine monohydrate off-patent. Novel delivery forms patentable.',
    trending: true,
    target_demographic: ['Athletes', 'Strength trainers', 'Aging adults 50+', 'Cognitive performance seekers'],
  },

  // ═══ METABOLIC / WEIGHT MANAGEMENT ═══
  {
    name: 'Berberine',
    category: 'Metabolic',
    health_focus: 'Blood glucose management, cholesterol, AMPK activation',
    regulatory_status:
      'DSHEA — botanical supplement. Growing regulatory scrutiny. "Nature\'s Ozempic" claim misleading per FDA.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 350,
    cagr_5yr_pct: 25,
    typical_dose: '500-1500mg/day',
    typical_retail_price_monthly: { low: 12, high: 40 },
    key_brands: ['Thorne', 'NOW', 'Life Extension'],
    ip_landscape: 'Open — berberine HCl widely available. Novel delivery (dihydroberberine) patented.',
    trending: true,
    target_demographic: [
      'Metabolic syndrome patients',
      'Blood sugar-conscious adults',
      'Statin-averse consumers',
      'Weight management seekers',
    ],
  },
  {
    name: 'GLP-1 Support Supplements',
    category: 'Metabolic',
    health_focus: 'Weight management, appetite, GLP-1 pathway support',
    regulatory_status: 'DSHEA — various ingredients marketed for GLP-1 support. FDA watching closely for drug claims.',
    clinical_evidence_level: 'preliminary',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 55,
    typical_dose: 'Varies by formulation',
    typical_retail_price_monthly: { low: 30, high: 80 },
    key_brands: ['Pendulum GLP-1 Probiotic', 'Goli', 'Various DTC brands'],
    ip_landscape: 'Pendulum has IP on Akkermansia muciniphila strain for GLP-1 modulation.',
    trending: true,
    target_demographic: [
      'Weight management seekers',
      'GLP-1 drug users seeking adjuncts',
      'Adults with obesity',
      'Metabolic health-conscious consumers',
    ],
  },

  // ═══ IMMUNE / FOUNDATIONAL ═══
  {
    name: 'Vitamin D3',
    category: 'Foundational',
    health_focus: 'Bone health, immune function, mood',
    regulatory_status: 'DSHEA — well-established. Authorized health claim for calcium + vitamin D and osteoporosis.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 1800,
    cagr_5yr_pct: 6,
    typical_dose: '1000-5000 IU/day',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Nature Made', 'NOW', 'Thorne', 'Nordic Naturals'],
    ip_landscape: 'Open — commodity ingredient. Delivery innovations (liposomal, gummy, spray) patentable.',
    trending: false,
    target_demographic: [
      'General population',
      'Northern latitude residents',
      'Elderly 65+',
      'Dark-skinned individuals',
    ],
  },
  {
    name: 'Omega-3 (EPA/DHA)',
    category: 'Foundational',
    health_focus: 'Cardiovascular, brain health, anti-inflammatory',
    regulatory_status:
      'DSHEA for supplements. Qualified health claim for EPA/DHA and CHD risk. Rx versions (Vascepa) are NDA drugs.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 3500,
    cagr_5yr_pct: 5,
    typical_dose: '1-4g EPA+DHA/day',
    typical_retail_price_monthly: { low: 10, high: 60 },
    key_brands: ['Nordic Naturals', 'Carlson', 'Thorne Super EPA', 'Sports Research'],
    ip_landscape: "Amarin's Vascepa patent litigation created precedent. Supplement-grade fish oil is open.",
    trending: false,
    target_demographic: ['Cardiovascular risk patients', 'Pregnant women', 'Aging adults', 'Athletes'],
  },
  {
    name: 'Magnesium (various forms)',
    category: 'Foundational',
    health_focus: 'Sleep, muscle relaxation, stress, 300+ enzymatic reactions',
    regulatory_status: 'DSHEA — dietary supplement. Various chelated forms (glycinate, threonate, citrate).',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 1200,
    cagr_5yr_pct: 10,
    typical_dose: '200-400mg elemental Mg/day',
    typical_retail_price_monthly: { low: 8, high: 35 },
    key_brands: ['Natural Calm', 'Thorne', 'NOW', 'BiOptimizers'],
    ip_landscape: 'Magtein (magnesium L-threonate) patented for cognitive function. Other forms open.',
    trending: true,
    target_demographic: [
      'Sleep-deprived adults',
      'Stress-prone professionals',
      'Athletes',
      'Women 30+',
      'General population',
    ],
  },
  {
    name: 'Collagen Peptides',
    category: 'Beauty / Joint',
    health_focus: 'Skin elasticity, joint health, hair/nail strength',
    regulatory_status: 'DSHEA — dietary supplement (protein source). Structure/function claims well-established.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 2100,
    cagr_5yr_pct: 8,
    typical_dose: '10-20g/day',
    typical_retail_price_monthly: { low: 15, high: 50 },
    key_brands: ['Vital Proteins', 'Sports Research', 'Ancient Nutrition', 'Momentous'],
    ip_landscape: 'Open — commodity peptide. Branded forms (Verisol, Fortigel, UC-II) have IP.',
    trending: false,
    target_demographic: ['Women 30+', 'Beauty-conscious consumers', 'Joint health seekers', 'Athletes'],
  },
  {
    name: 'Ashwagandha (KSM-66 / Sensoril)',
    category: 'Adaptogen',
    health_focus: 'Stress reduction, cortisol modulation, sleep, testosterone support',
    regulatory_status: 'DSHEA — botanical supplement. NDI not required (historical Ayurvedic use). GRAS.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 450,
    cagr_5yr_pct: 14,
    typical_dose: '300-600mg/day',
    typical_retail_price_monthly: { low: 12, high: 40 },
    key_brands: ['Thorne', 'NOW', 'Jarrow', 'Nootropics Depot'],
    ip_landscape: 'KSM-66 (Ixoreal) and Sensoril (Natreon) are patented standardized extracts.',
    trending: true,
    target_demographic: ['Stress-prone adults', 'Athletes', 'Sleep quality seekers', "Men's health"],
  },

  // ═══ CARDIOVASCULAR / MITOCHONDRIAL ═══
  {
    name: 'CoQ10 (Ubiquinol)',
    category: 'Cardiovascular',
    health_focus: 'Mitochondrial energy, heart health, statin-induced myopathy',
    regulatory_status:
      'DSHEA — dietary supplement. GRAS. Well-established safety profile. Ubiquinol (reduced form) preferred over ubiquinone.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 850,
    cagr_5yr_pct: 6,
    typical_dose: '100-300mg/day',
    typical_retail_price_monthly: { low: 15, high: 50 },
    key_brands: ['Qunol', 'NOW', 'Life Extension'],
    ip_landscape: 'Kaneka holds key patents on biofermented ubiquinol (QH). Generic CoQ10 (ubiquinone) is open.',
    trending: false,
    target_demographic: ['Statin users', 'Cardiovascular risk patients', 'Adults 50+', 'Energy-deficient individuals'],
  },

  // ═══ COGNITIVE / RELAXATION ═══
  {
    name: 'L-Theanine',
    category: 'Cognitive / Relaxation',
    health_focus: 'Calm focus, stress reduction, sleep onset',
    regulatory_status: 'DSHEA — dietary supplement. GRAS. Naturally found in green tea. No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 220,
    cagr_5yr_pct: 15,
    typical_dose: '100-400mg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Thorne', 'NOW', 'Sports Research'],
    ip_landscape: 'Open — commodity amino acid. Suntheanine (Taiyo) is a branded, patented form.',
    trending: true,
    target_demographic: [
      'Anxiety-prone adults',
      'Caffeine users seeking calm focus',
      'Students',
      'Sleep quality seekers',
    ],
  },

  // ═══ ANTI-INFLAMMATORY ═══
  {
    name: 'Curcumin / Turmeric',
    category: 'Anti-inflammatory',
    health_focus: 'Joint inflammation, antioxidant, metabolic health',
    regulatory_status: 'DSHEA — botanical supplement. GRAS. Bioavailability-enhanced forms dominate premium market.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 1500,
    cagr_5yr_pct: 8,
    typical_dose: '500-2000mg/day (bioavailable form)',
    typical_retail_price_monthly: { low: 15, high: 50 },
    key_brands: ['Meriva (Thorne)', 'Theracurmin', 'NOW'],
    ip_landscape:
      'Meriva (Indena), Longvida (Verdure Sciences), and Theracurmin (Theravalues) hold phytosome/nanoparticle patents. Base curcumin is open.',
    trending: false,
    target_demographic: ['Joint pain sufferers', 'Arthritis patients', 'Aging adults 50+', 'Athletes seeking recovery'],
  },

  // ═══ IMMUNE ═══
  {
    name: 'Elderberry (Sambucus)',
    category: 'Immune',
    health_focus: 'Immune defense, cold/flu duration reduction',
    regulatory_status:
      'DSHEA — botanical supplement. GRAS. Long history of traditional use. Post-COVID demand surge stabilizing.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 680,
    cagr_5yr_pct: 7,
    typical_dose: '500-1000mg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Sambucol', 'Nature Made', 'Garden of Life'],
    ip_landscape: 'Sambucol has proprietary extract. Commodity elderberry extract widely available.',
    trending: false,
    target_demographic: [
      'Immune-conscious consumers',
      'Parents with children',
      'Cold/flu season preparers',
      'General population',
    ],
  },
  {
    name: 'Zinc',
    category: 'Foundational',
    health_focus: 'Immune function, wound healing, testosterone support',
    regulatory_status:
      'DSHEA — essential mineral. Authorized health claim for immune function. No regulatory concerns.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 500,
    cagr_5yr_pct: 5,
    typical_dose: '15-50mg/day',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Thorne', 'NOW', 'Nature Made'],
    ip_landscape: 'Open — commodity mineral. Chelated forms (zinc bisglycinate, zinc carnosine) may have limited IP.',
    trending: false,
    target_demographic: [
      'Immune-conscious consumers',
      'Men (testosterone support)',
      'Vegetarians/vegans',
      'Elderly 65+',
    ],
  },

  // ═══ SLEEP ═══
  {
    name: 'Melatonin',
    category: 'Sleep',
    health_focus: 'Sleep onset, circadian rhythm regulation, jet lag',
    regulatory_status:
      'DSHEA — dietary supplement in US (Rx in EU). GRAS. Widespread consumer use. Low-dose trend emerging.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 920,
    cagr_5yr_pct: 8,
    typical_dose: '0.5-10mg (low dose trending)',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Natrol', 'NOW', 'Life Extension'],
    ip_landscape: 'Open — commodity ingredient. Extended-release and novel delivery forms patentable.',
    trending: false,
    target_demographic: [
      'Sleep-deprived adults',
      'Shift workers',
      'Jet lag sufferers',
      'Elderly with circadian disruption',
    ],
  },

  // ═══ ANTIOXIDANT / RESPIRATORY ═══
  {
    name: 'NAC (N-Acetyl Cysteine)',
    category: 'Antioxidant / Respiratory',
    health_focus: 'Glutathione precursor, liver support, mucolytic',
    regulatory_status:
      'DSHEA status challenged by FDA 2020-2022 (IND exclusion argument). FDA enforcement discretion — widely sold.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 280,
    cagr_5yr_pct: 12,
    typical_dose: '600-1800mg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['NOW', 'Life Extension', 'Thorne'],
    ip_landscape: 'Open — off-patent pharmaceutical ingredient. Supplement status depends on FDA enforcement posture.',
    trending: true,
    target_demographic: [
      'Liver health seekers',
      'Respiratory health seekers',
      'Detox-conscious consumers',
      'Mental health support seekers',
    ],
  },

  // ═══ COGNITIVE (CHOLINE) ═══
  {
    name: 'Alpha-GPC',
    category: 'Cognitive',
    health_focus: 'Choline source, cognitive enhancement, power output',
    regulatory_status: 'DSHEA — dietary supplement. GRAS. Growing nootropics and sports nutrition demand.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 140,
    cagr_5yr_pct: 18,
    typical_dose: '300-600mg/day',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['Nootropics Depot', 'NOW', 'Jarrow'],
    ip_landscape: 'Open — commodity choline source. Branded standardized forms limited.',
    trending: true,
    target_demographic: [
      'Nootropic users',
      'Students',
      'Athletes seeking power output',
      'Adults 50+ (cognitive maintenance)',
    ],
  },

  // ═══ IMMUNE / SENOLYTIC ═══
  {
    name: 'Quercetin',
    category: 'Immune / Senolytic',
    health_focus: 'Immune modulation, senolytic (paired with dasatinib), anti-inflammatory',
    regulatory_status: 'DSHEA — flavonoid supplement. GRAS. Senolytic use off-label and research-driven.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 160,
    cagr_5yr_pct: 20,
    typical_dose: '500-1000mg/day',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Thorne', 'NOW', 'Life Extension'],
    ip_landscape:
      'Open — commodity flavonoid. Phytosome-enhanced quercetin (Quercefit) has IP. Mayo Clinic senolytic protocol research.',
    trending: true,
    target_demographic: [
      'Immune-conscious consumers',
      'Allergy sufferers',
      'Longevity-focused adults 50+',
      'Senolytic protocol followers',
    ],
  },

  // ═══ HORMONE ═══
  {
    name: 'Tongkat Ali (Eurycoma longifolia)',
    category: 'Hormone',
    health_focus: 'Testosterone support, cortisol reduction, athletic performance',
    regulatory_status:
      'DSHEA — botanical supplement. NDI not required (traditional use in Southeast Asia). Growing clinical evidence base.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 28,
    typical_dose: '200-400mg/day (100:1 extract)',
    typical_retail_price_monthly: { low: 15, high: 45 },
    key_brands: ['Nootropics Depot', 'Double Wood', 'Momentous'],
    ip_landscape:
      'LJ100 (HP Ingredients) is a patented standardized extract. Generic tongkat ali extracts widely available.',
    trending: true,
    target_demographic: [
      "Men's health seekers",
      'Athletes',
      'Men 30+ (testosterone optimization)',
      'Stress-recovery adults',
    ],
  },

  // ═══ LONGEVITY / CARDIOVASCULAR ═══
  {
    name: 'Taurine',
    category: 'Longevity / Cardiovascular',
    health_focus: 'Longevity (Singh 2023 Science paper), cardiovascular, exercise',
    regulatory_status:
      'DSHEA — amino acid supplement. GRAS. Long safety history (energy drinks). Renewed interest after 2023 Science publication.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 22,
    typical_dose: '1-3g/day',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['NOW', 'Life Extension', 'Thorne'],
    ip_landscape: 'Open — commodity amino acid. No dominant patents. Longevity positioning is new.',
    trending: true,
    target_demographic: [
      'Longevity-focused consumers',
      'Athletes',
      'Cardiovascular health seekers',
      'Aging adults 50+',
    ],
  },

  // ═══ SLEEP / LONGEVITY ═══
  {
    name: 'Glycine',
    category: 'Sleep / Longevity',
    health_focus: 'Sleep quality, collagen synthesis, methylation support',
    regulatory_status: 'DSHEA — amino acid supplement. GRAS. Long safety profile. Emerging longevity research.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 120,
    cagr_5yr_pct: 14,
    typical_dose: '3-5g/day',
    typical_retail_price_monthly: { low: 8, high: 20 },
    key_brands: ['Thorne', 'NOW', 'BulkSupplements'],
    ip_landscape: 'Open — commodity amino acid. No meaningful IP barriers.',
    trending: true,
    target_demographic: [
      'Sleep quality seekers',
      'Collagen production seekers',
      'Longevity-focused adults',
      'Biohackers',
    ],
  },

  // ═══ DIGESTIVE / METABOLIC ═══
  {
    name: 'Psyllium Husk',
    category: 'Digestive / Metabolic',
    health_focus: 'Fiber, cholesterol reduction, glycemic control, gut motility',
    regulatory_status:
      'DSHEA — dietary supplement. Authorized health claim for soluble fiber and coronary heart disease risk. FDA-approved OTC laxative.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 780,
    cagr_5yr_pct: 4,
    typical_dose: '5-10g/day',
    typical_retail_price_monthly: { low: 8, high: 20 },
    key_brands: ['Metamucil', 'NOW', 'Konsyl'],
    ip_landscape: 'Open — commodity fiber. Metamucil (P&G) dominates brand recognition but ingredient is unpatentable.',
    trending: false,
    target_demographic: [
      'Digestive health seekers',
      'Cholesterol-conscious adults',
      'Diabetic/pre-diabetic adults',
      'Elderly 60+',
    ],
  },

  // ═══ BONE / CARDIOVASCULAR ═══
  {
    name: 'Vitamin K2 (MK-7)',
    category: 'Bone / Cardiovascular',
    health_focus: 'Calcium direction (bones not arteries), osteocalcin activation',
    regulatory_status:
      'DSHEA — dietary supplement. GRAS. Commonly paired with Vitamin D3. Growing evidence for cardiovascular benefit.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 350,
    cagr_5yr_pct: 12,
    typical_dose: '100-200mcg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Thorne', 'Life Extension', 'Carlson'],
    ip_landscape:
      'MenaQ7 (NattoPharma/Gnosis by Lesaffre) holds key patents on fermentation-derived MK-7. Synthetic MK-7 alternatives emerging.',
    trending: true,
    target_demographic: [
      'Bone health seekers',
      'Postmenopausal women',
      'Vitamin D supplement users',
      'Cardiovascular health-conscious adults',
    ],
  },

  // ═══ URINARY TRACT ═══
  {
    name: 'D-Mannose',
    category: 'Urinary Tract',
    health_focus: 'UTI prevention, bladder health',
    regulatory_status: 'DSHEA — dietary supplement. Simple sugar (monosaccharide). No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 10,
    typical_dose: '500-2000mg/day',
    typical_retail_price_monthly: { low: 10, high: 25 },
    key_brands: ['NOW', 'Solaray', "Nature's Way"],
    ip_landscape: 'Open — commodity monosaccharide. No meaningful IP barriers. Formulation combinations patentable.',
    trending: false,
    target_demographic: ['Women prone to UTIs', 'Bladder health seekers', 'Antibiotic-averse consumers', 'Women 25-55'],
  },

  // ═══ ESSENTIAL VITAMINS ═══
  {
    name: 'Vitamin A (Retinol / Beta-Carotene)',
    category: 'Essential Vitamin',
    health_focus: 'Vision, immune function, skin health, cell differentiation',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient with established RDA. FDA-authorized health claims for beta-carotene. Preformed retinol has UL of 3,000 mcg RAE/day.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 420,
    cagr_5yr_pct: 5,
    typical_dose: '750-1500 mcg RAE/day (preformed) or 3-6mg beta-carotene/day',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['NOW', 'Thorne', 'Nature Made', 'Garden of Life'],
    ip_landscape:
      'Open — commodity vitamin. No meaningful IP barriers. Novel delivery forms (liposomal, nanoemulsion) patentable.',
    trending: false,
    target_demographic: [
      'General population',
      'Immune-conscious consumers',
      'Skin health seekers',
      'Pregnant/nursing women',
    ],
  },
  {
    name: 'Vitamin B Complex (B1, B2, B3, B5, B6)',
    category: 'Essential Vitamin',
    health_focus: 'Energy metabolism, nervous system function, red blood cell formation, homocysteine metabolism',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrients with established RDAs. Methylated forms (methylcobalamin, 5-MTHF) trending for bioavailability.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 1250,
    cagr_5yr_pct: 7,
    typical_dose: 'Varies by B vitamin — typical complex: 25-100mg B1/B2/B3/B5, 25-50mg B6',
    typical_retail_price_monthly: { low: 8, high: 35 },
    key_brands: [
      'Thorne Basic B Complex',
      'Pure Encapsulations B-Complex Plus',
      'Jarrow B-Right',
      'Life Extension BioActive Complete B-Complex',
    ],
    ip_landscape:
      'Open — commodity vitamins. Methylated/coenzyme forms command premium. Branded ingredients: Quatrefolic (5-MTHF), MecobalActive.',
    trending: true,
    target_demographic: [
      'General population',
      'Energy-deficient adults',
      'Stress-prone professionals',
      'Vegetarians/vegans',
    ],
  },
  {
    name: 'Vitamin B12 (Methylcobalamin / Cyanocobalamin)',
    category: 'Essential Vitamin',
    health_focus:
      'Neurological function, DNA synthesis, red blood cell formation, energy metabolism, homocysteine reduction',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient. Methylcobalamin preferred over cyanocobalamin for bioavailability. High-dose (1000-5000 mcg) sublingual forms popular.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 580,
    cagr_5yr_pct: 8,
    typical_dose: '500-5000 mcg/day (sublingual or oral)',
    typical_retail_price_monthly: { low: 6, high: 25 },
    key_brands: ['Jarrow Methyl B-12', 'NOW Methyl B-12', 'Pure Encapsulations', 'Garden of Life mykind'],
    ip_landscape:
      'Open — commodity vitamin. Methylcobalamin and adenosylcobalamin forms widely available. Liposomal delivery patentable.',
    trending: false,
    target_demographic: ['Vegetarians/vegans', 'Elderly 65+', 'Pernicious anemia patients', 'Energy-deficient adults'],
  },
  {
    name: 'Folate / 5-MTHF (Methylfolate)',
    category: 'Essential Vitamin',
    health_focus:
      'DNA synthesis, neural tube defect prevention, methylation support, homocysteine reduction, mood regulation',
    regulatory_status:
      'DSHEA — dietary supplement. FDA health claim for neural tube defect prevention. 5-MTHF (active folate) preferred for MTHFR polymorphism carriers (~40% of population).',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 340,
    cagr_5yr_pct: 12,
    typical_dose: '400-1000 mcg DFE/day (up to 15mg for clinical use)',
    typical_retail_price_monthly: { low: 8, high: 30 },
    key_brands: ['Thorne 5-MTHF', 'Jarrow Methyl Folate', 'Pure Encapsulations', 'Seeking Health'],
    ip_landscape:
      'Gnosis by Lesaffre holds patents on Quatrefolic (glucosamine salt of 5-MTHF). Merck & Cie holds Metafolin (calcium salt of 5-MTHF). Branded ingredient premiums.',
    trending: true,
    target_demographic: [
      'Women of childbearing age',
      'Pregnant women',
      'MTHFR mutation carriers',
      'Depression/mood support seekers',
    ],
  },
  {
    name: 'Vitamin C (Ascorbic Acid / Liposomal)',
    category: 'Essential Vitamin',
    health_focus: 'Immune support, collagen synthesis, antioxidant, iron absorption, cardiovascular health',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient with established RDA. FDA-authorized health claim for antioxidant properties. IV vitamin C investigated for oncology support.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 1680,
    cagr_5yr_pct: 6,
    typical_dose: '500-2000mg/day (up to 6000mg for acute immune support)',
    typical_retail_price_monthly: { low: 5, high: 40 },
    key_brands: ['NOW', 'Nature Made', 'LivOn Labs Lypo-Spheric', 'Thorne', 'Quicksilver Scientific'],
    ip_landscape:
      'Open — commodity vitamin. Liposomal delivery forms patentable and command 3-5x price premium. Branded ingredients: Quali-C (Scottish manufacturing), Ester-C (patented calcium ascorbate).',
    trending: false,
    target_demographic: ['General population', 'Immune-conscious consumers', 'Smokers', 'High-stress individuals'],
  },
  {
    name: 'Vitamin E (Tocopherols / Tocotrienols)',
    category: 'Essential Vitamin',
    health_focus: 'Antioxidant, skin health, cardiovascular protection, neuroprotection, immune modulation',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient. FDA-authorized health claim for heart health (qualified). Mixed tocopherol/tocotrienol forms preferred over synthetic dl-alpha-tocopherol.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 480,
    cagr_5yr_pct: 5,
    typical_dose: '200-400 IU/day mixed tocopherols; 50-200mg tocotrienols',
    typical_retail_price_monthly: { low: 8, high: 35 },
    key_brands: ['NOW', 'Thorne', 'Life Extension', 'Designs for Health'],
    ip_landscape:
      'Open for tocopherols. Tocotrienol-specific patents held by American River Nutrition (DeltaGold), ExcelVite (EVNol SupraBio). Annatto-derived tocotrienols trending.',
    trending: false,
    target_demographic: [
      'Cardiovascular health seekers',
      'Skin health-conscious adults',
      'Aging adults 50+',
      'Antioxidant-seeking consumers',
    ],
  },
  {
    name: 'Thiamine (Vitamin B1) / Benfotiamine',
    category: 'Essential Vitamin',
    health_focus: 'Energy metabolism, nervous system support, glucose metabolism, AGE prevention (benfotiamine)',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient. Benfotiamine (fat-soluble form) has enhanced bioavailability and clinical data for diabetic neuropathy.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 9,
    typical_dose: '50-300mg/day thiamine; 150-600mg/day benfotiamine',
    typical_retail_price_monthly: { low: 6, high: 22 },
    key_brands: ['Life Extension Benfotiamine', 'Thorne', 'NOW', 'Doctors Best'],
    ip_landscape:
      'Open — commodity vitamin. Benfotiamine manufacturing processes patented but ingredient widely available.',
    trending: false,
    target_demographic: [
      'Diabetic neuropathy patients',
      'Heavy alcohol consumers',
      'Energy-deficient adults',
      'Elderly 65+',
    ],
  },
  {
    name: 'Riboflavin (Vitamin B2) / Riboflavin 5-Phosphate',
    category: 'Essential Vitamin',
    health_focus: 'Energy production, migraine prevention, antioxidant recycling (glutathione), mitochondrial function',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrient. Riboflavin 5-phosphate (R5P) is the active coenzyme form with better bioavailability.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 65,
    cagr_5yr_pct: 6,
    typical_dose: '25-100mg/day general; 400mg/day for migraine prophylaxis',
    typical_retail_price_monthly: { low: 5, high: 18 },
    key_brands: ['Thorne', 'Pure Encapsulations', 'NOW', 'Life Extension'],
    ip_landscape: 'Open — commodity vitamin. Active coenzyme form (R5P) widely available. No significant IP barriers.',
    trending: false,
    target_demographic: [
      'Migraine sufferers',
      'Energy-deficient adults',
      'Mitochondrial health seekers',
      'Women on oral contraceptives',
    ],
  },

  // ═══ ESSENTIAL MINERALS ═══
  {
    name: 'Iron (Bisglycinate / Ferrous Sulfate)',
    category: 'Essential Mineral',
    health_focus: 'Red blood cell formation, oxygen transport, energy metabolism, cognitive function',
    regulatory_status:
      'DSHEA — dietary supplement. Essential mineral with established RDA. Iron bisglycinate (chelated) preferred for tolerability. FDA requires warning label for accidental overdose risk in children.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 620,
    cagr_5yr_pct: 6,
    typical_dose: '18-65mg elemental iron/day depending on deficiency status',
    typical_retail_price_monthly: { low: 5, high: 25 },
    key_brands: ['Thorne Iron Bisglycinate', 'Mega Food Blood Builder', 'Flora Floradix', 'NOW'],
    ip_landscape:
      'Open — commodity mineral. Chelated forms (Ferrochel by Albion Minerals) patented. Branded ingredients command premium.',
    trending: false,
    target_demographic: ['Women of menstruating age', 'Pregnant women', 'Vegetarians/vegans', 'Anemia patients'],
  },
  {
    name: 'Selenium (Selenomethionine / Sodium Selenite)',
    category: 'Essential Mineral',
    health_focus:
      'Thyroid function, antioxidant defense (glutathione peroxidase), immune modulation, cancer risk reduction',
    regulatory_status:
      'DSHEA — dietary supplement. Essential trace mineral. FDA qualified health claim for cancer risk reduction. Narrow therapeutic window — UL 400 mcg/day.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 7,
    typical_dose: '55-200 mcg/day',
    typical_retail_price_monthly: { low: 5, high: 18 },
    key_brands: ['NOW', 'Life Extension', 'Thorne', 'Pure Encapsulations'],
    ip_landscape:
      'Open — commodity mineral. SelenoExcell (high-selenium yeast) is a branded form. Organic selenium forms command slight premium.',
    trending: false,
    target_demographic: [
      'Thyroid health seekers',
      'Cancer risk-conscious adults',
      'Immune-conscious consumers',
      'Selenium-deficient regions',
    ],
  },
  {
    name: 'Chromium (Picolinate / GTF)',
    category: 'Essential Mineral',
    health_focus: 'Insulin sensitivity, glucose metabolism, lipid metabolism, body composition',
    regulatory_status:
      'DSHEA — dietary supplement. Essential trace mineral. FDA qualified health claim for chromium picolinate and insulin resistance risk reduction. Nutrition 21 holds Chromax patent.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 145,
    cagr_5yr_pct: 8,
    typical_dose: '200-1000 mcg/day',
    typical_retail_price_monthly: { low: 5, high: 15 },
    key_brands: ['NOW Chromium Picolinate', 'Thorne', 'Nature Made', 'Life Extension'],
    ip_landscape:
      'Nutrition 21 holds patents on Chromax (chromium picolinate). Generic chromium forms widely available. IP for novel chelation forms.',
    trending: false,
    target_demographic: [
      'Diabetic/pre-diabetic adults',
      'Insulin resistance patients',
      'Weight management seekers',
      'Metabolic syndrome adults',
    ],
  },
  {
    name: 'Manganese (Bisglycinate / Gluconate)',
    category: 'Essential Mineral',
    health_focus: 'Bone health, antioxidant defense (SOD cofactor), glucose metabolism, connective tissue formation',
    regulatory_status:
      'DSHEA — dietary supplement. Essential trace mineral. UL 11mg/day for adults. Typically included in multi-mineral formulas rather than standalone.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 55,
    cagr_5yr_pct: 4,
    typical_dose: '2-5mg/day',
    typical_retail_price_monthly: { low: 4, high: 12 },
    key_brands: ['NOW', 'Thorne', 'Pure Encapsulations', 'Solaray'],
    ip_landscape: 'Open — commodity mineral. Chelated forms (Albion) patented but generic alternatives available.',
    trending: false,
    target_demographic: [
      'Bone health seekers',
      'Elderly 65+',
      'Athletes (joint support)',
      'General wellness consumers',
    ],
  },
  {
    name: 'Iodine (Potassium Iodide / Kelp)',
    category: 'Essential Mineral',
    health_focus: 'Thyroid hormone synthesis, metabolic regulation, cognitive development, breast health',
    regulatory_status:
      'DSHEA — dietary supplement. Essential trace mineral with established RDA of 150 mcg/day. Kelp-derived iodine supplements popular. Potassium iodide (KI) also available for radiation emergency use.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 195,
    cagr_5yr_pct: 6,
    typical_dose: '150-500 mcg/day (up to 12.5mg for Iodoral protocol, controversial)',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Life Extension', 'NOW Kelp', 'Optimox Iodoral', 'Thorne'],
    ip_landscape:
      "Open — commodity mineral and natural source (kelp). Iodoral and Lugol's solution are established formulations. No significant IP barriers.",
    trending: false,
    target_demographic: [
      'Thyroid health seekers',
      'Pregnant/nursing women',
      'Iodine-deficient populations',
      'Hypothyroid patients',
    ],
  },
  {
    name: 'Potassium (Citrate / Gluconate / Chloride)',
    category: 'Essential Mineral',
    health_focus: 'Blood pressure regulation, muscle function, nerve signaling, electrolyte balance, bone health',
    regulatory_status:
      'DSHEA — dietary supplement. Essential mineral. FDA limits supplement forms to 99mg per serving (historical rule). Bulk powder forms circumvent this limit. Adequate Intake: 2,600-3,400mg/day.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 310,
    cagr_5yr_pct: 8,
    typical_dose: '99-500mg/serving (electrolyte products may contain more)',
    typical_retail_price_monthly: { low: 5, high: 18 },
    key_brands: ['NOW', 'Thorne', 'Life Extension', 'LMNT (electrolyte)', 'Nuun'],
    ip_landscape:
      'Open — commodity mineral. Electrolyte formulation blends patentable. Branded electrolyte products differentiate on taste and formulation.',
    trending: true,
    target_demographic: ['Athletes', 'Keto/fasting dieters', 'Blood pressure-conscious adults', 'General population'],
  },

  // ═══ AMINO ACIDS ═══
  {
    name: 'Acetyl-L-Carnitine (ALCAR)',
    category: 'Amino Acid',
    health_focus:
      'Mitochondrial fatty acid transport, cognitive function, neuroprotection, energy metabolism, exercise recovery',
    regulatory_status:
      'DSHEA — dietary supplement. Amino acid derivative. Well-established safety profile. NDI not required. Clinical trials in neuropathy and cognitive decline.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 280,
    cagr_5yr_pct: 9,
    typical_dose: '500-2000mg/day',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['NOW', 'Jarrow', 'Life Extension', 'Thorne'],
    ip_landscape:
      'Open — commodity amino acid derivative. Sigma-Tau (now Alfasigma) held early patents on ALCAR, now expired. Novel combination formulas patentable.',
    trending: false,
    target_demographic: [
      'Cognitive performance seekers',
      'Adults 50+',
      'Athletes (fat metabolism)',
      'Neuropathy patients',
    ],
  },
  {
    name: 'L-Arginine',
    category: 'Amino Acid',
    health_focus:
      'Nitric oxide production, vasodilation, blood flow, exercise performance, erectile function, wound healing',
    regulatory_status:
      'DSHEA — dietary supplement. Semi-essential amino acid. GRAS. Widely used in sports nutrition and cardiovascular support. No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 350,
    cagr_5yr_pct: 7,
    typical_dose: '3-6g/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['NOW', 'Thorne', 'Jarrow', 'Nutricost'],
    ip_landscape:
      'Open — commodity amino acid. Being partially displaced by L-citrulline for NO production. Novel arginine salt forms patentable.',
    trending: false,
    target_demographic: [
      'Athletes',
      'Cardiovascular health seekers',
      "Men's health (erectile function)",
      'Pre-workout users',
    ],
  },
  {
    name: 'L-Citrulline',
    category: 'Amino Acid',
    health_focus:
      'Nitric oxide precursor (more effective than L-arginine), blood flow, exercise performance, blood pressure support',
    regulatory_status:
      'DSHEA — dietary supplement. Non-essential amino acid. GRAS. Rapidly growing adoption in sports nutrition as superior NO booster vs. arginine.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 290,
    cagr_5yr_pct: 14,
    typical_dose: '3-6g/day (pure L-citrulline) or 6-8g/day (citrulline malate 2:1)',
    typical_retail_price_monthly: { low: 10, high: 28 },
    key_brands: ['Transparent Labs', 'NOW', 'Nutricost', 'Bulk Supplements'],
    ip_landscape:
      'Open — commodity amino acid. Citrulline malate salt widely available. Kyowa Quality (Kyowa Hakko) branded ingredient.',
    trending: true,
    target_demographic: ['Athletes', 'Pre-workout users', 'Blood pressure-conscious adults', 'Endurance athletes'],
  },
  {
    name: 'BCAAs (Branched-Chain Amino Acids)',
    category: 'Amino Acid / Sports',
    health_focus:
      'Muscle protein synthesis (leucine-driven), exercise recovery, muscle soreness reduction, anti-catabolic',
    regulatory_status:
      'DSHEA — dietary supplement. Essential amino acids (leucine, isoleucine, valine). GRAS. Mainstay of sports nutrition. Typical 2:1:1 ratio.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 520,
    cagr_5yr_pct: 6,
    typical_dose: '5-10g/day (typically 2:1:1 leucine:isoleucine:valine)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Scivation Xtend', 'Optimum Nutrition', 'NOW', 'Transparent Labs'],
    ip_landscape:
      'Open — commodity amino acids. Ajinomoto (AjiPure) is premium fermented BCAA source. Ratio formulations and novel delivery patentable.',
    trending: false,
    target_demographic: ['Athletes', 'Bodybuilders', 'Endurance athletes', 'Muscle recovery seekers'],
  },
  {
    name: 'L-Glutamine',
    category: 'Amino Acid',
    health_focus: 'Gut barrier integrity, immune function, muscle recovery, intestinal permeability ("leaky gut")',
    regulatory_status:
      'DSHEA — dietary supplement. Conditionally essential amino acid. GRAS. Widely used in sports nutrition and gut health protocols. No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 380,
    cagr_5yr_pct: 7,
    typical_dose: '5-20g/day (higher for gut repair protocols)',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['NOW', 'Jarrow', 'Thorne', 'Nutricost'],
    ip_landscape:
      'Open — commodity amino acid. Kyowa Quality (Kyowa Hakko) fermented L-glutamine is premium branded ingredient. Gut-specific formulations patentable.',
    trending: false,
    target_demographic: [
      'Athletes',
      'Gut health seekers (leaky gut)',
      'Immune-compromised individuals',
      'Post-surgery recovery',
    ],
  },
  {
    name: 'L-Tyrosine / N-Acetyl L-Tyrosine (NALT)',
    category: 'Amino Acid / Cognitive',
    health_focus:
      'Dopamine precursor, cognitive performance under stress, focus, thyroid hormone synthesis, mood support',
    regulatory_status:
      'DSHEA — dietary supplement. Non-essential amino acid. GRAS. Popular in nootropic stacks and pre-workout formulas. No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 165,
    cagr_5yr_pct: 11,
    typical_dose: '500-2000mg/day L-tyrosine; 300-600mg NALT',
    typical_retail_price_monthly: { low: 8, high: 22 },
    key_brands: ['Thorne', 'NOW', 'Nootropics Depot', 'Jarrow'],
    ip_landscape:
      'Open — commodity amino acid. NALT (acetylated form) slightly more expensive but debated bioavailability advantage. No significant IP barriers.',
    trending: true,
    target_demographic: ['Nootropic users', 'High-stress professionals', 'Students', 'Thyroid health seekers'],
  },

  // ═══ MEDICINAL MUSHROOMS ═══
  {
    name: 'Cordyceps (Cordyceps militaris / sinensis)',
    category: 'Medicinal Mushroom',
    health_focus: 'Athletic performance, oxygen utilization (VO2 max), energy, respiratory health, anti-fatigue',
    regulatory_status:
      'DSHEA — mushroom extract. Long history of traditional use (TCM). Cordyceps militaris cultivated; sinensis wild-harvested (expensive). NDI not required for traditional forms.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 185,
    cagr_5yr_pct: 20,
    typical_dose: '1000-3000mg/day (fruiting body extract, standardized to cordycepin and adenosine)',
    typical_retail_price_monthly: { low: 18, high: 50 },
    key_brands: ['Real Mushrooms', 'Host Defense', 'Four Sigmatic', 'Nootropics Depot', 'Mushroom Revival'],
    ip_landscape:
      'Open — natural mushroom extract. Cultivation methods patentable. Cordycepin standardization and extraction IP emerging. CS-4 mycelium strain widely used.',
    trending: true,
    target_demographic: [
      'Athletes',
      'Endurance sport enthusiasts',
      'Energy-seeking adults',
      'Traditional medicine followers',
    ],
  },
  {
    name: 'Reishi (Ganoderma lucidum)',
    category: 'Medicinal Mushroom',
    health_focus:
      'Immune modulation, stress adaptation, sleep quality, liver support, longevity (traditional "mushroom of immortality")',
    regulatory_status:
      'DSHEA — mushroom extract. Extensive history of traditional use in TCM and Japanese kampo medicine. NDI not required. Dual extraction (water + alcohol) preferred for full spectrum compounds.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 210,
    cagr_5yr_pct: 16,
    typical_dose: '1000-3000mg/day extract (standardized to triterpenes and beta-glucans)',
    typical_retail_price_monthly: { low: 15, high: 45 },
    key_brands: ['Real Mushrooms', 'Host Defense', 'Four Sigmatic', 'Life Cykel', 'Mushroom Revival'],
    ip_landscape:
      'Open — natural mushroom extract. Specific triterpene extractions and spore-cracking technologies patentable. Branded cultivation strains exist.',
    trending: false,
    target_demographic: [
      'Stress-prone adults',
      'Immune-conscious consumers',
      'Sleep quality seekers',
      'Longevity-focused adults',
    ],
  },
  {
    name: 'Turkey Tail (Trametes versicolor)',
    category: 'Medicinal Mushroom',
    health_focus: 'Immune support (PSK/PSP polysaccharides), gut microbiome, oncology support, antioxidant',
    regulatory_status:
      'DSHEA — mushroom extract. PSK (Krestin) approved as anti-cancer drug in Japan. FDA-funded clinical trial at Bastyr University for breast cancer. NDI not required in US.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 155,
    cagr_5yr_pct: 18,
    typical_dose: '1000-3000mg/day (extract standardized to PSP/beta-glucans)',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['Host Defense', 'Real Mushrooms', 'Mushroom Revival', 'Om Mushrooms'],
    ip_landscape:
      'PSK/Krestin patents (Kureha Chemical) expired. Open for generic extracts. NIH-funded research ongoing. Extraction method IP possible.',
    trending: true,
    target_demographic: [
      'Immune-conscious consumers',
      'Cancer patients (adjunct therapy)',
      'Gut health seekers',
      'Integrative medicine patients',
    ],
  },
  {
    name: 'Chaga (Inonotus obliquus)',
    category: 'Medicinal Mushroom',
    health_focus:
      'Antioxidant (highest ORAC score among mushrooms), immune modulation, anti-inflammatory, blood sugar support',
    regulatory_status:
      'DSHEA — mushroom extract. Wild-harvested from birch trees (sustainability concerns). Long traditional use in Siberian/Russian folk medicine. NDI not required.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 130,
    cagr_5yr_pct: 15,
    typical_dose: '500-2000mg/day (dual extract preferred)',
    typical_retail_price_monthly: { low: 15, high: 45 },
    key_brands: ['Four Sigmatic', 'Real Mushrooms', 'Host Defense', 'Sayan Chaga'],
    ip_landscape:
      'Open — wild-harvested natural product. Sustainable cultivation efforts underway. Betulinic acid extraction standardization patentable.',
    trending: false,
    target_demographic: [
      'Immune-conscious consumers',
      'Antioxidant seekers',
      'Blood sugar-conscious adults',
      'Functional mushroom enthusiasts',
    ],
  },

  // ═══ HERBAL / BOTANICAL ═══
  {
    name: 'Rhodiola Rosea',
    category: 'Adaptogen / Herbal',
    health_focus:
      'Stress resilience, mental fatigue reduction, physical endurance, cognitive function under stress, cortisol modulation',
    regulatory_status:
      'DSHEA — botanical supplement. Long traditional use (Scandinavian, Russian). NDI not required. Standardized to rosavins (3%) and salidroside (1%). Some supply chain concerns (wild-harvested).',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 175,
    cagr_5yr_pct: 14,
    typical_dose: '200-600mg/day (standardized extract)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Gaia Herbs', 'NOW', 'Thorne', 'Nootropics Depot'],
    ip_landscape:
      'Open — botanical extract. Standardization ratios (rosavins:salidroside) differentiating. Swedish Herbal Institute research foundational. Cultivation reducing wild-harvest dependency.',
    trending: true,
    target_demographic: [
      'Stress-prone professionals',
      'Athletes (endurance)',
      'Students during exam periods',
      'Burnout-prone adults',
    ],
  },
  {
    name: 'Maca Root (Lepidium meyenii)',
    category: 'Herbal / Adaptogen',
    health_focus: 'Hormonal balance, libido, fertility (male and female), energy, mood, menopausal symptom relief',
    regulatory_status:
      'DSHEA — botanical supplement. Traditional Peruvian food staple. GRAS. NDI not required. Color variants (red, black, yellow) have different clinical profiles. Gelatinized form preferred for digestibility.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 220,
    cagr_5yr_pct: 12,
    typical_dose: '1500-3000mg/day (gelatinized powder or extract)',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['The Maca Team', 'NOW', 'Gaia Herbs', 'Navitas Organics'],
    ip_landscape:
      'Open — traditional food/botanical. Peruvian government restricts raw maca export. Color-specific extract patents emerging. MacaPure is a branded standardized extract.',
    trending: false,
    target_demographic: [
      'Men (libido/fertility)',
      'Women (hormonal balance/menopause)',
      'Athletes',
      'Energy-seeking adults',
    ],
  },
  {
    name: 'Ginseng (Panax ginseng / americanus)',
    category: 'Herbal / Adaptogen',
    health_focus:
      'Energy, cognitive function, immune modulation, blood sugar regulation, sexual health, physical stamina',
    regulatory_status:
      'DSHEA — botanical supplement. One of the most studied herbal ingredients globally. Traditional use spanning millennia (TCM, Korean medicine). NDI not required. Standardized to ginsenosides.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 680,
    cagr_5yr_pct: 8,
    typical_dose: '200-400mg/day (standardized extract, 4-7% ginsenosides)',
    typical_retail_price_monthly: { low: 12, high: 45 },
    key_brands: ['Korean Ginseng Corp (CheongKwanJang)', 'NOW', "Nature's Way", 'Gaia Herbs'],
    ip_landscape:
      'Open — traditional botanical. Korean Red Ginseng (CheongKwanJang) is dominant global brand. Specific ginsenoside fraction extracts patentable. Cereboost (American ginseng) branded ingredient for cognition.',
    trending: false,
  },
  {
    name: 'Saw Palmetto (Serenoa repens)',
    category: 'Herbal',
    health_focus: 'Prostate health, BPH symptom relief, DHT reduction, urinary flow improvement, hair loss support',
    regulatory_status:
      'DSHEA — botanical supplement. EMA-approved traditional herbal medicine in EU. FDA rejected health claim for prostate cancer prevention. Standardized to fatty acids and sterols.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 240,
    cagr_5yr_pct: 5,
    typical_dose: '320mg/day (standardized to 85-95% fatty acids)',
    typical_retail_price_monthly: { low: 10, high: 25 },
    key_brands: ['NOW', "Nature's Way", "Doctor's Best", 'Gaia Herbs'],
    ip_landscape:
      'Open — botanical extract. Widely available. CO2 supercritical extraction process patentable. Major competition from pharmaceutical 5-alpha reductase inhibitors.',
    trending: false,
  },
  {
    name: 'Milk Thistle (Silymarin / Silybin)',
    category: 'Herbal',
    health_focus:
      'Liver protection, hepatocyte regeneration, antioxidant (liver-specific), detoxification support, gallbladder support',
    regulatory_status:
      'DSHEA — botanical supplement. Well-established European phytomedicine (German Commission E approved). NDI not required. Standardized to 80% silymarin. Phytosome (silybin-phosphatidylcholine) forms have enhanced bioavailability.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 260,
    cagr_5yr_pct: 7,
    typical_dose: '200-600mg/day silymarin (or 120-240mg silybin phytosome)',
    typical_retail_price_monthly: { low: 8, high: 30 },
    key_brands: ['Thorne Siliphos', 'NOW', 'Jarrow', "Nature's Way"],
    ip_landscape:
      'Open for standard silymarin extracts. Indena holds patents on Siliphos (silybin phytosome complex). Phytosome technology is proprietary delivery platform. Generic silymarin highly commoditized.',
    trending: false,
  },
  {
    name: 'Valerian Root (Valeriana officinalis)',
    category: 'Herbal',
    health_focus: 'Sleep quality, sleep onset latency, anxiety reduction, GABA modulation, muscle relaxation',
    regulatory_status:
      'DSHEA — botanical supplement. German Commission E and EMA approved for sleep disorders. Long European traditional use. NDI not required. Standardized to valerenic acid.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 155,
    cagr_5yr_pct: 5,
    typical_dose: '300-600mg/day (taken 30-60 min before bed)',
    typical_retail_price_monthly: { low: 6, high: 18 },
    key_brands: ['NOW', "Nature's Way", 'Gaia Herbs', "Oregon's Wild Harvest"],
    ip_landscape:
      'Open — traditional botanical. Highly commoditized. Combination formulas (valerian + hops + passionflower) patentable as specific ratios.',
    trending: false,
  },
  {
    name: 'Black Seed Oil (Nigella sativa)',
    category: 'Herbal',
    health_focus:
      'Immune modulation, anti-inflammatory (thymoquinone), blood sugar support, respiratory health, skin health',
    regulatory_status:
      'DSHEA — botanical supplement / food oil. Traditional use spanning 3,000+ years (Islamic traditional medicine). NDI not required. Active compound thymoquinone drives clinical interest. Cold-pressed oil and standardized extract forms.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 195,
    cagr_5yr_pct: 18,
    typical_dose: '1-3 tsp oil/day or 400-800mg standardized extract (2-5% thymoquinone)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Amazing Herbs', 'Zhou Nutrition', 'Heritage Store', 'Maju Superfoods'],
    ip_landscape:
      'Open — traditional botanical oil. Thymoquinone-standardized extracts emerging as premium ingredient. Trinutra (ThymoQuin) is branded standardized extract.',
    trending: true,
  },
  {
    name: 'Bacopa Monnieri',
    category: 'Herbal / Cognitive',
    health_focus: 'Memory enhancement, learning speed, attention, neuroprotection, anxiety reduction',
    regulatory_status:
      'DSHEA — botanical supplement. Ayurvedic traditional use. NDI not required. Standardized to bacosides (20-55%). Clinical trials demonstrate memory improvement over 8-12 weeks.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 140,
    cagr_5yr_pct: 13,
    typical_dose: '300-600mg/day (standardized to 50% bacosides)',
    typical_retail_price_monthly: { low: 10, high: 28 },
    key_brands: ['Nootropics Depot (Synapsa)', 'Himalaya', 'NOW', 'Life Extension'],
    ip_landscape:
      'Kemin Industries holds patents on KeenMind (CDRI-08 extract). PLT Health Solutions markets Synapsa. Multiple branded standardized extracts compete. Generic bacopa widely available.',
    trending: true,
  },

  // ═══ SPORTS NUTRITION ═══
  {
    name: 'Whey Protein (Isolate / Concentrate / Hydrolysate)',
    category: 'Sports Nutrition',
    health_focus: 'Muscle protein synthesis, post-workout recovery, satiety, lean body mass, immune (immunoglobulins)',
    regulatory_status:
      'DSHEA — dietary supplement / food. GRAS. Most researched protein supplement. Manufacturing regulated under 21 CFR Part 111. NSF Certified for Sport and Informed Sport certifications available.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 4200,
    cagr_5yr_pct: 7,
    typical_dose: '20-40g protein per serving, 1-3 servings/day',
    typical_retail_price_monthly: { low: 25, high: 80 },
    key_brands: ['Optimum Nutrition', 'Dymatize', 'Momentous', 'Transparent Labs', 'Kaged'],
    ip_landscape:
      'Open — commodity dairy protein. Grass-fed, cold-filtered, and cross-flow microfiltration claims differentiate. Branded sources: Provon (Glanbia), BiPro. Novel flavoring and instantization processes patentable.',
    trending: false,
  },
  {
    name: 'Beta-Alanine',
    category: 'Sports Nutrition',
    health_focus:
      'Muscular endurance (carnosine buffer), high-intensity exercise performance, fatigue delay, lean body mass',
    regulatory_status:
      'DSHEA — dietary supplement. Non-essential amino acid. GRAS (CarnoSyn). Paresthesia (tingling) at high doses is benign but requires consumer education. NDI not required.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 320,
    cagr_5yr_pct: 10,
    typical_dose: '3.2-6.4g/day (loading protocol: 4-6 weeks to saturate muscle carnosine)',
    typical_retail_price_monthly: { low: 12, high: 30 },
    key_brands: ['NOW', 'Thorne', 'Transparent Labs', 'Nutricost'],
    ip_landscape:
      'Natural Alternatives International (NAI) holds CarnoSyn patents (sustained-release SR CarnoSyn). Significant IP moat in sports nutrition. Generic beta-alanine available but CarnoSyn is gold standard.',
    trending: false,
  },
  {
    name: 'Citrulline Malate',
    category: 'Sports Nutrition',
    health_focus:
      'Nitric oxide production, blood flow, exercise performance, muscle endurance, reduced muscle soreness, ammonia clearance',
    regulatory_status:
      'DSHEA — dietary supplement. Combination of L-citrulline and malic acid (typically 2:1 ratio). GRAS. Widely used in pre-workout formulas. No regulatory concerns.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 240,
    cagr_5yr_pct: 13,
    typical_dose: '6-8g/day (2:1 citrulline:malate ratio)',
    typical_retail_price_monthly: { low: 10, high: 25 },
    key_brands: ['Transparent Labs', 'NOW', 'Bulk Supplements', 'Nutricost'],
    ip_landscape:
      'Open — combination of two commodity ingredients. No significant IP barriers. Differentiation through clinical dosing, third-party testing, and formulation.',
    trending: true,
  },
  {
    name: 'HMB (Beta-Hydroxy Beta-Methylbutyrate)',
    category: 'Sports Nutrition',
    health_focus:
      'Muscle preservation (anti-catabolic), lean mass during caloric restriction, recovery from intense exercise, sarcopenia prevention',
    regulatory_status:
      'DSHEA — dietary supplement. Leucine metabolite. GRAS. NDI not required. Free acid form (HMB-FA) has faster absorption vs. calcium salt (HMB-Ca). Clinical evidence in aging and muscle wasting.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 9,
    typical_dose: '3g/day (split into 1g doses with meals)',
    typical_retail_price_monthly: { low: 18, high: 40 },
    key_brands: ['Optimum Nutrition', 'NOW', 'BulkSupplements', 'Nutricost'],
    ip_landscape:
      'MTI (Metabolic Technologies Inc.) holds key patents on HMB-FA (free acid form, branded as myHMB). Calcium HMB salt is more widely available. Significant IP around free acid delivery.',
    trending: false,
  },
  {
    name: 'Electrolyte Complex',
    category: 'Sports Nutrition',
    health_focus:
      'Hydration, muscle function, nerve signaling, exercise performance, heat acclimation, hangover recovery',
    regulatory_status:
      'DSHEA — dietary supplement. Combination of sodium, potassium, magnesium, calcium, and trace minerals. GRAS ingredients. Growing market driven by keto/fasting and active lifestyle trends.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 890,
    cagr_5yr_pct: 16,
    typical_dose: 'Varies — typical: 1000mg sodium, 200mg potassium, 60mg magnesium per serving',
    typical_retail_price_monthly: { low: 15, high: 45 },
    key_brands: ['LMNT', 'Drip Drop', 'Nuun', 'Liquid IV', 'Pedialyte'],
    ip_landscape:
      'Open — commodity minerals. Formulation ratios, flavoring systems, and delivery formats (tablets, powder sticks, liquid) patentable. LMNT/Liquid IV differentiate on branding and formulation ratios.',
    trending: true,
  },

  // ═══ PREBIOTICS & FIBER ═══
  {
    name: 'Inulin / FOS (Fructooligosaccharides)',
    category: 'Prebiotic / Fiber',
    health_focus:
      'Prebiotic fiber, Bifidobacterium growth, gut microbiome diversity, calcium absorption, blood sugar modulation',
    regulatory_status:
      'DSHEA — dietary supplement / food ingredient. GRAS. Naturally occurring in chicory root, Jerusalem artichoke, garlic. Widely used as prebiotic fiber in functional foods and supplements.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 420,
    cagr_5yr_pct: 10,
    typical_dose: '5-15g/day (start low to avoid GI discomfort)',
    typical_retail_price_monthly: { low: 8, high: 22 },
    key_brands: ['NOW Inulin', 'Jarrow Inulin-FOS', 'Hyperbiotics', 'Prebiotin'],
    ip_landscape:
      'Open — naturally derived commodity fiber. Orafti (BENEO) is dominant inulin supplier. Branded prebiotic blends (Prebiotin) patentable. Novel chain-length specific FOS have IP potential.',
    trending: false,
  },
  {
    name: 'Resistant Starch',
    category: 'Prebiotic / Fiber',
    health_focus:
      'Gut microbiome (butyrate production), blood sugar regulation, insulin sensitivity, satiety, colon health',
    regulatory_status:
      'DSHEA — dietary supplement / food ingredient. GRAS. Types: RS2 (raw potato/green banana starch), RS3 (retrograded), RS4 (chemically modified). Growing clinical interest in metabolic health.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 165,
    cagr_5yr_pct: 14,
    typical_dose: '15-30g/day (titrate up slowly)',
    typical_retail_price_monthly: { low: 10, high: 25 },
    key_brands: ['Bobs Red Mill (potato starch)', 'MSPrebiotic', 'Resistant Starch Co.', 'NOW'],
    ip_landscape:
      'Open for natural RS2 sources. Ingredion and Tate & Lyle hold patents on modified resistant starches (RS4). MSPrebiotic (Solnul) is branded RS2 from potatoes. Novel processing methods patentable.',
    trending: true,
  },
  {
    name: 'Beta-Glucan (Oat / Mushroom-Derived)',
    category: 'Prebiotic / Immune',
    health_focus:
      'Immune modulation (innate immunity), cholesterol reduction (oat beta-glucan), gut health, post-exercise immune support',
    regulatory_status:
      'DSHEA — dietary supplement / food ingredient. GRAS. FDA health claim for oat beta-glucan and heart disease risk reduction (3g/day). Mushroom-derived (1,3/1,6 beta-glucan) for immune support.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 310,
    cagr_5yr_pct: 11,
    typical_dose: '250-500mg/day (immune, yeast/mushroom) or 3g/day (cholesterol, oat)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['NOW Beta-Glucans', 'Transfer Point', 'Jarrow', 'Solgar'],
    ip_landscape:
      'Open for oat-derived. Kerry Group (Wellmune) holds patents on yeast-derived 1,3/1,6 beta-glucan (Saccharomyces cerevisiae). Wellmune is dominant branded immune beta-glucan. Mushroom-derived beta-glucans open.',
    trending: false,
  },
  {
    name: 'Acacia Fiber (Acacia Senegal Gum)',
    category: 'Prebiotic / Fiber',
    health_focus:
      'Gentle prebiotic fiber, IBS-friendly, microbiome support, satiety, blood sugar modulation, low FODMAP',
    regulatory_status:
      'DSHEA — dietary supplement / food ingredient. GRAS. Also classified as food additive (gum arabic / E414). Well-tolerated prebiotic — less bloating than inulin. Fermented slowly in colon.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 12,
    typical_dose: '5-15g/day',
    typical_retail_price_monthly: { low: 10, high: 22 },
    key_brands: ["Heather's Tummy Fiber", 'NOW Acacia Fiber', "Anthony's", 'Organic India'],
    ip_landscape:
      'Open — natural gum commodity. Sourced primarily from Africa (Sudan, Senegal, Chad). Supply chain risk due to geopolitical instability. Processing and standardization patentable.',
    trending: false,
  },

  // ═══ EYE HEALTH ═══
  {
    name: 'Lutein',
    category: 'Eye Health / Carotenoid',
    health_focus:
      'Macular degeneration prevention (AMD), blue light protection, visual acuity, macular pigment density',
    regulatory_status:
      'DSHEA — dietary supplement. Carotenoid. GRAS. AREDS2 study (NEI/NIH) validated lutein + zeaxanthin for AMD. FDA qualified health claim for eye health. Marigold-derived (Tagetes erecta).',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 380,
    cagr_5yr_pct: 9,
    typical_dose: '10-20mg/day (AREDS2 dose: 10mg lutein + 2mg zeaxanthin)',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['PreserVision AREDS 2 (Bausch + Lomb)', 'NOW', 'Life Extension', 'Jarrow'],
    ip_landscape:
      'Kemin Industries (FloraGLO) holds key patents on marigold-derived free lutein. OmniActive (Lutemax 2020) is competing branded ingredient. FloraGLO is most clinically studied branded lutein.',
    trending: false,
  },
  {
    name: 'Zeaxanthin',
    category: 'Eye Health / Carotenoid',
    health_focus:
      'Macular pigment density, AMD prevention (works synergistically with lutein), central vision protection, photoreceptor health',
    regulatory_status:
      'DSHEA — dietary supplement. Carotenoid isomer of lutein. GRAS. AREDS2 study included zeaxanthin. Typically paired with lutein at 2mg zeaxanthin to 10mg lutein ratio.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 145,
    cagr_5yr_pct: 10,
    typical_dose: '2-4mg/day (typically combined with lutein)',
    typical_retail_price_monthly: { low: 10, high: 28 },
    key_brands: ['PreserVision (Bausch + Lomb)', 'Life Extension', 'NOW', 'EyePromise'],
    ip_landscape:
      'OmniActive (Lutemax 2020) offers lutein + RR-zeaxanthin + RS-zeaxanthin combination. ZeaONE (AIDP) is branded zeaxanthin. Often sold as combination products with lutein.',
    trending: false,
  },
  {
    name: 'Astaxanthin',
    category: 'Eye Health / Antioxidant',
    health_focus:
      'Powerful carotenoid antioxidant (6000x vitamin C), eye fatigue, skin protection (UV), cardiovascular, anti-inflammatory, exercise recovery',
    regulatory_status:
      'DSHEA — dietary supplement. Carotenoid from Haematococcus pluvialis microalgae. NDI accepted. GRAS. Natural astaxanthin distinguished from synthetic (petroleum-derived). Growing clinical evidence base.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 210,
    cagr_5yr_pct: 14,
    typical_dose: '4-12mg/day',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['BioAstin (Nutrex Hawaii)', 'Sports Research', 'NOW', 'Life Extension'],
    ip_landscape:
      'AstaReal (Fuji Chemical) holds key patents on natural astaxanthin production. Cyanotech (BioAstin) is major Hawaiian producer. Synthetic astaxanthin (BASF, DSM) dominates animal feed market. Natural vs. synthetic distinction is key.',
    trending: true,
  },

  // ═══ CARDIOVASCULAR ═══
  {
    name: 'Bergamot Extract (Citrus bergamia)',
    category: 'Cardiovascular',
    health_focus:
      'LDL cholesterol reduction, triglyceride management, HDL support, metabolic syndrome, statin alternative/adjunct',
    regulatory_status:
      'DSHEA — botanical supplement. Italian citrus extract. NDI filed for concentrated polyphenol extracts. Growing clinical evidence for lipid management. Positioned as natural statin alternative.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 120,
    cagr_5yr_pct: 22,
    typical_dose: '500-1000mg/day (standardized to 25-38% polyphenols)',
    typical_retail_price_monthly: { low: 18, high: 40 },
    key_brands: ['Jarrow Bergamot', 'Designs for Health', 'Life Extension', "Doctor's Best"],
    ip_landscape:
      'HP Ingredients holds patents on Bergamonte (38% BPF polyphenol fraction). Calabrian bergamot sourcing. Growing branded ingredient category with clinical differentiation.',
    trending: true,
  },
  {
    name: 'Red Yeast Rice (Monascus purpureus)',
    category: 'Cardiovascular',
    health_focus:
      'Cholesterol management (contains monacolin K / natural lovastatin), LDL reduction, cardiovascular risk reduction',
    regulatory_status:
      'COMPLEX — FDA considers monacolin K an unapproved drug. Supplements containing monacolin K face enforcement risk. Some products deliberately depleted of monacolin K. EU limits monacolin K to <3mg/day. Highly scrutinized category.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 3,
    typical_dose: '600-2400mg/day (monacolin K content varies widely due to regulatory pressure)',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['NOW', "Nature's Plus", 'Thorne Choleast', 'Jarrow'],
    ip_landscape:
      'Open — traditional fermentation product. FDA regulatory risk is primary barrier. EU regulation capping monacolin K at 3mg/day limits efficacy. Citrinin contamination concern requires quality testing.',
    trending: false,
  },
  {
    name: 'Plant Sterols / Stanols (Phytosterols)',
    category: 'Cardiovascular',
    health_focus:
      'LDL cholesterol reduction (block intestinal cholesterol absorption), cardiovascular risk reduction, FDA-approved health claim',
    regulatory_status:
      'DSHEA — dietary supplement / food ingredient. GRAS. FDA-approved health claim: 0.65g plant sterols or 1.7g plant stanols per serving, twice daily, may reduce heart disease risk. One of few FDA-authorized health claims.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 280,
    cagr_5yr_pct: 6,
    typical_dose: '1.3-3.4g/day plant sterols (divided with meals)',
    typical_retail_price_monthly: { low: 12, high: 30 },
    key_brands: ['CholestOff (Nature Made)', 'Benecol', 'NOW Beta-Sitosterol', 'Source Naturals'],
    ip_landscape:
      'Raisio (Benecol) holds patents on plant stanol esters. BASF and Cargill are major phytosterol suppliers. FDA health claim provides strong market positioning. Formulation and delivery IP exists.',
    trending: false,
  },
  {
    name: 'Nattokinase',
    category: 'Cardiovascular',
    health_focus: 'Fibrinolytic enzyme (clot dissolution), blood pressure support, circulation, cardiovascular health',
    regulatory_status:
      'DSHEA — dietary supplement. Fibrinolytic enzyme from natto (fermented soybean). GRAS. Measured in fibrinolytic units (FU). Contraindicated with anticoagulant medications. Japan Nattokinase Association (JNKA) certification.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 165,
    cagr_5yr_pct: 15,
    typical_dose: '2,000-4,000 FU/day (100-200mg)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ["Doctor's Best", 'NOW', 'Jarrow', 'Life Extension'],
    ip_landscape:
      'Japan Bio Science Laboratory (JBSL) holds foundational patents on nattokinase isolation (many expired). NSK-SD (JBSL) is vitamin K2-free nattokinase branded ingredient. Manufacturing standardization to FU activity important.',
    trending: true,
  },

  // ═══ BEAUTY / NUTRICOSMETICS ═══
  {
    name: 'Biotin (Vitamin B7)',
    category: 'Beauty / Nutricosmetic',
    health_focus: 'Hair growth, nail strength, skin health, keratin infrastructure, fatty acid synthesis',
    regulatory_status:
      'DSHEA — dietary supplement. Essential B vitamin. GRAS. Widely marketed for hair/skin/nails. FDA warned in 2017 that high-dose biotin interferes with troponin and other lab assays. No established UL.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 440,
    cagr_5yr_pct: 8,
    typical_dose: '2,500-10,000 mcg/day (adequate intake: 30 mcg/day)',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ["Nature's Bounty", 'NOW', 'Natrol', 'Sports Research'],
    ip_landscape:
      'Open — commodity B vitamin. Highly competitive and commoditized market. Differentiation through combination formulas (biotin + collagen + keratin) and beauty positioning.',
    trending: false,
  },
  {
    name: 'Hyaluronic Acid (Oral)',
    category: 'Beauty / Nutricosmetic',
    health_focus: 'Skin hydration, joint lubrication, wound healing, anti-aging (wrinkle reduction), eye moisture',
    regulatory_status:
      'DSHEA — dietary supplement. GRAS. Multiple molecular weight forms — low MW (<50 kDa) for absorption, high MW for joint/gut. Oral bioavailability debated. Growing clinical evidence for skin hydration.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 290,
    cagr_5yr_pct: 16,
    typical_dose: '120-240mg/day',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['NOW', 'Sports Research', 'NeoCell', 'Jarrow'],
    ip_landscape:
      'Open — widely manufactured via microbial fermentation. Injuv (Hyalogic) and BioCell Collagen (contains HA + collagen) are branded ingredients. Molecular weight differentiation and combination formulas patentable.',
    trending: true,
  },
  {
    name: 'Ceramides (Oral Phytoceramides)',
    category: 'Beauty / Nutricosmetic',
    health_focus:
      'Skin barrier restoration, moisture retention, wrinkle reduction, skin smoothness, dermatitis support',
    regulatory_status:
      'DSHEA — dietary supplement. Plant-derived ceramides (wheat, rice, sweet potato). GRAS. Oral ceramides shown in clinical trials to improve skin hydration and reduce wrinkles. NDI filed for specific extracts.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 18,
    typical_dose: '350-600 mcg/day (glycosylceramides)',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['Life Extension Skin Restoring Ceramides', 'Reserveage', 'NOW', 'Solgar'],
    ip_landscape:
      'Oryza Oil & Fat Chemical (Ceramosides) and Daicel Corporation hold patents on rice/wheat-derived phytoceramides. Lipowheat (Arco Iris) is a branded wheat-extract ceramide. Sourcing and extraction IP significant.',
    trending: true,
  },

  // ═══ DIGESTIVE ENZYMES ═══
  {
    name: 'Digestive Enzyme Complex',
    category: 'Digestive Health',
    health_focus:
      'Protein/fat/carbohydrate digestion, bloating reduction, nutrient absorption, food intolerance support (lactase, DPP-IV for gluten)',
    regulatory_status:
      'DSHEA — dietary supplement. Enzyme blends (protease, lipase, amylase, cellulase, lactase). GRAS. Measured in activity units (FCC). Not a drug unless disease claims made. Fungal-derived enzymes (Aspergillus) most common.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 520,
    cagr_5yr_pct: 8,
    typical_dose: '1-2 capsules with each meal (activity units vary by enzyme)',
    typical_retail_price_monthly: { low: 12, high: 40 },
    key_brands: [
      'Enzymedica Digest Gold',
      'NOW Super Enzymes',
      'Pure Encapsulations Digestive Enzymes Ultra',
      'Thorne Bio-Gest',
    ],
    ip_landscape:
      'National Enzyme Company (NEC/DEERLAND) and Enzymedica hold formulation patents. Thera-blend (Enzymedica) is patented multi-pH enzyme technology. Specialty enzymes (DPP-IV, alpha-galactosidase) differentiate.',
    trending: false,
  },
  {
    name: 'Betaine HCl',
    category: 'Digestive Health',
    health_focus:
      'Stomach acid support (hypochlorhydria), protein digestion, mineral absorption, GERD alternative approach, gut antimicrobial',
    regulatory_status:
      'DSHEA — dietary supplement. Hydrochloric acid supplement. Used in functional medicine for suspected low stomach acid. Must include pepsin often. Contraindicated with NSAIDs and ulcers. Not a drug.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 10,
    typical_dose: '650-3250mg per meal (titrate to tolerance)',
    typical_retail_price_monthly: { low: 10, high: 25 },
    key_brands: ['Thorne Bio-Gest', 'NOW Betaine HCl', 'Pure Encapsulations', "Doctor's Best"],
    ip_landscape:
      'Open — commodity ingredient. Formulation combinations (betaine HCl + pepsin + gentian root) patentable. Functional medicine practitioner channel drives adoption.',
    trending: false,
  },

  // ═══ BONE HEALTH ═══
  {
    name: 'Calcium + Vitamin D3 Complex',
    category: 'Bone Health',
    health_focus: 'Bone density, osteoporosis prevention, fracture risk reduction, muscle function, tooth health',
    regulatory_status:
      'DSHEA — dietary supplement. Essential nutrients. FDA-authorized health claim for calcium + D and osteoporosis. Calcium citrate preferred over carbonate for absorption. UL: 2,500mg calcium, 4,000 IU D3.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 1850,
    cagr_5yr_pct: 5,
    typical_dose: '500-1200mg calcium + 1000-2000 IU D3/day (divided doses)',
    typical_retail_price_monthly: { low: 6, high: 25 },
    key_brands: ['Citracal', 'Caltrate', 'Nature Made', 'New Chapter Bone Strength'],
    ip_landscape:
      'Open — commodity minerals/vitamins. AlgaeCal (plant-based calcium from marine algae) holds patents on algae-derived calcium. MCHA (microcrystalline hydroxyapatite) is bone-derived alternative. Formulation combinations patentable.',
    trending: false,
  },
  {
    name: 'Strontium (Citrate)',
    category: 'Bone Health',
    health_focus: 'Bone density support, osteoblast stimulation, osteoclast inhibition, osteoporosis adjunct therapy',
    regulatory_status:
      'DSHEA — dietary supplement (as strontium citrate). Note: strontium ranelate is a prescription drug in EU (Protelos). Supplement form uses citrate salt. FDA has not approved bone health claims for strontium supplements.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 45,
    cagr_5yr_pct: 7,
    typical_dose: '340-680mg/day strontium citrate (taken separately from calcium)',
    typical_retail_price_monthly: { low: 12, high: 28 },
    key_brands: ['NOW Strontium', 'Life Extension', 'Jarrow Bone-Up', "Doctor's Best"],
    ip_landscape:
      'Open — commodity mineral salt. Strontium ranelate (Servier) patents held for drug form. Supplement strontium citrate widely available. Controversy around DXA scan interference (strontium increases apparent BMD).',
    trending: false,
  },

  // ═══ ADAPTOGENS ═══
  {
    name: 'Schisandra (Schisandra chinensis)',
    category: 'Adaptogen',
    health_focus:
      'Stress resilience, liver protection, cognitive function, physical endurance, skin health, adaptogenic tonic',
    regulatory_status:
      'DSHEA — botanical supplement. Traditional use in TCM and Russian medicine. One of the original adaptogens studied by Lazarev/Brekhman (1960s). NDI not required. Standardized to schisandrins.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 75,
    cagr_5yr_pct: 13,
    typical_dose: '500-1500mg/day (standardized extract) or 1-3g dried berry',
    typical_retail_price_monthly: { low: 10, high: 28 },
    key_brands: ['Gaia Herbs', 'NOW', "Nature's Way", 'Dragon Herbs'],
    ip_landscape:
      'Open — traditional botanical. Specific schisandrin-enriched extracts patentable. Limited branded ingredient competition. Growing interest in liver support and adaptogen blends.',
    trending: false,
  },
  {
    name: 'Eleuthero (Eleutherococcus senticosus / Siberian Ginseng)',
    category: 'Adaptogen',
    health_focus: 'Stress adaptation, immune modulation, physical endurance, cognitive stamina, fatigue resistance',
    regulatory_status:
      'DSHEA — botanical supplement. Cannot be marketed as "Siberian Ginseng" per 2002 regulation (only Panax species = ginseng). Now labeled "Eleuthero." Extensive Soviet-era clinical research. NDI not required.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 85,
    cagr_5yr_pct: 8,
    typical_dose: '300-1200mg/day (standardized to eleutherosides B and E)',
    typical_retail_price_monthly: { low: 8, high: 22 },
    key_brands: ['Gaia Herbs', "Nature's Way", 'NOW', 'Herb Pharm'],
    ip_landscape:
      'Open — traditional botanical. Commodity ingredient. Swedish Herbal Institute foundational research. Standardization to eleutherosides differentiates quality products.',
    trending: false,
  },
  {
    name: 'Holy Basil / Tulsi (Ocimum tenuiflorum)',
    category: 'Adaptogen',
    health_focus:
      'Stress reduction (cortisol modulation), anxiolytic, blood sugar regulation, anti-inflammatory, immune modulation',
    regulatory_status:
      'DSHEA — botanical supplement. Sacred Ayurvedic herb with extensive traditional use. NDI not required. Standardized to ursolic acid and eugenol. Available as teas, extracts, and capsules.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 12,
    typical_dose: '300-600mg/day (standardized extract) or 2-3 cups tea',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['Organic India', 'Gaia Herbs', 'NOW', 'New Chapter'],
    ip_landscape:
      'Open — traditional Ayurvedic botanical. Organic India is market leader with vertically integrated supply chain. Branded extracts (OciBest, Holixer) exist but market is relatively open.',
    trending: true,
  },

  // ═══ SPECIALTY ═══
  {
    name: 'PQQ (Pyrroloquinoline Quinone)',
    category: 'Specialty / Longevity',
    health_focus:
      'Mitochondrial biogenesis, neuroprotection, cognitive function, cellular energy, nerve growth factor support',
    regulatory_status:
      'DSHEA — dietary supplement. NDI accepted (BioPQQ by Mitsubishi Gas Chemical). GRAS affirmed. Relatively novel ingredient with growing clinical evidence. Premium pricing due to complex manufacturing.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 20,
    typical_dose: '10-20mg/day',
    typical_retail_price_monthly: { low: 18, high: 45 },
    key_brands: ['Life Extension', 'Jarrow', 'NOW', 'Quality of Life (ProPQQ)'],
    ip_landscape:
      'Mitsubishi Gas Chemical (BioPQQ) holds key manufacturing patents on fermentation-derived PQQ. Limited alternative suppliers. Strong IP moat on production process. Premium ingredient pricing reflects manufacturing complexity.',
    trending: true,
  },
  {
    name: 'Shilajit (Purified)',
    category: 'Specialty / Adaptogen',
    health_focus:
      'Mitochondrial energy (fulvic acid), testosterone support, cognitive function, mineral transport, anti-aging (Ayurvedic rasayana)',
    regulatory_status:
      'DSHEA — dietary supplement. Mineral-rich exudate from Himalayan rocks. Traditional Ayurvedic use. Purification critical — raw shilajit may contain heavy metals and mycotoxins. PrimaVie (Natreon) is purified/standardized form with NDI.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 130,
    cagr_5yr_pct: 22,
    typical_dose: '250-500mg/day (purified extract, standardized to fulvic acid)',
    typical_retail_price_monthly: { low: 18, high: 50 },
    key_brands: ['Nootropics Depot (PrimaVie)', 'Pure Himalayan Shilajit', 'Cymbiotika', 'Jarrow'],
    ip_landscape:
      'Natreon Inc. holds patents on PrimaVie (purified shilajit, standardized to fulvic acid and DBPs). Primary differentiation is purification and safety testing. Generic shilajit products have quality/safety concerns.',
    trending: true,
  },
  {
    name: 'Sulforaphane (Broccoli Seed/Sprout Extract)',
    category: 'Specialty / Detoxification',
    health_focus:
      'Nrf2 pathway activation, Phase II detoxification, anti-inflammatory, anti-cancer (chemopreventive), antioxidant defense upregulation',
    regulatory_status:
      'DSHEA — botanical supplement. Derived from broccoli seeds/sprouts. Glucoraphanin (precursor) + myrosinase enzyme = sulforaphane. Stability challenges — many products contain only glucoraphanin. NDI not required for broccoli extract.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 175,
    cagr_5yr_pct: 24,
    typical_dose: '10-40mg sulforaphane/day (or 400-800mg glucoraphanin with myrosinase)',
    typical_retail_price_monthly: { low: 18, high: 50 },
    key_brands: ['Avmacol (Nutramax)', 'BrocElite', 'Jarrow BroccoMax', 'Thorne Crucera-SGS'],
    ip_landscape:
      'Johns Hopkins (Jed Fahey/Paul Talalay) holds foundational patents on sulforaphane use and Avmacol. Brassica Protection Products (Truebroc glucoraphanin). Stable sulforaphane delivery remains an IP frontier.',
    trending: true,
  },
  {
    name: 'DIM (Diindolylmethane)',
    category: 'Specialty / Hormonal',
    health_focus:
      'Estrogen metabolism (favoring 2-OH pathway), hormonal balance, breast health, prostate health, detoxification support',
    regulatory_status:
      'DSHEA — dietary supplement. Metabolite of indole-3-carbinol (I3C) from cruciferous vegetables. NDI not required. Microencapsulated forms (BioResponse DIM) improve bioavailability. Growing evidence for estrogen-dependent conditions.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 135,
    cagr_5yr_pct: 15,
    typical_dose: '100-300mg/day (BioResponse DIM) or 200-400mg (standard)',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Thorne', 'NOW DIM-200', 'Pure Encapsulations', 'Smoky Mountain Nutrition'],
    ip_landscape:
      'BioResponse LLC holds patents on absorption-enhanced DIM (microencapsulated form). Standard DIM has poor bioavailability without enhancement. BioResponse DIM is dominant branded ingredient.',
    trending: true,
  },
  {
    name: 'Apigenin',
    category: 'Specialty / Sleep & Longevity',
    health_focus:
      'Sleep onset (anxiolytic via GABA modulation), CD38 inhibition (NAD+ sparing), anti-inflammatory, neuroprotection, senolytic potential',
    regulatory_status:
      'DSHEA — dietary supplement. Flavonoid found in chamomile, parsley, celery. NDI not required. Popularized by Andrew Huberman podcast for sleep. Growing research interest for NAD+ preservation via CD38 inhibition.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 85,
    cagr_5yr_pct: 35,
    typical_dose: '50-100mg/day (sleep) or up to 500mg/day (longevity protocols)',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Nootropics Depot', 'Double Wood', 'Swanson', 'NOW'],
    ip_landscape:
      'Open — naturally occurring flavonoid. Commodity ingredient. Growing demand from podcast-driven awareness. Novel delivery forms and combination products (apigenin + magnesium + theanine) patentable.',
    trending: true,
  },

  // ═══ ADDITIONAL SPECIALTY ═══
  {
    name: 'Berberine + GlucoVantage (Dihydroberberine)',
    category: 'Metabolic / Specialty',
    health_focus:
      'Enhanced glucose metabolism (5x bioavailability of berberine), insulin sensitivity, AMPK activation, gut-friendly (reduced GI side effects)',
    regulatory_status:
      'DSHEA — dietary supplement. Dihydroberberine (GlucoVantage by NNB Nutrition) is the active metabolite of berberine with superior absorption. NDI filed. Positioned as next-generation berberine.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 65,
    cagr_5yr_pct: 40,
    typical_dose: '100-200mg dihydroberberine/day (equivalent to 500-1000mg berberine)',
    typical_retail_price_monthly: { low: 20, high: 45 },
    key_brands: ['NNB Nutrition (GlucoVantage)', 'Thorne Berberine-500', 'Transparent Labs'],
    ip_landscape:
      'NNB Nutrition holds patents on GlucoVantage (dihydroberberine). Strong IP moat. Growing adoption by premium supplement brands. Standard berberine HCl remains commodity alternative.',
    trending: true,
  },
  {
    name: 'Palmitoylethanolamide (PEA)',
    category: 'Specialty / Pain & Inflammation',
    health_focus:
      'Endocannabinoid system modulation, chronic pain management, neuroinflammation, neuropathic pain, mast cell stabilization',
    regulatory_status:
      'DSHEA — dietary supplement. Endogenous fatty acid amide. NDI filed. GRAS. Discovered by Rita Levi-Montalcini (Nobel laureate). Growing clinical evidence for pain management without opioid mechanisms.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 110,
    cagr_5yr_pct: 25,
    typical_dose: '300-1200mg/day (micronized form preferred)',
    typical_retail_price_monthly: { low: 20, high: 50 },
    key_brands: ['Life Extension', 'Nootropics Depot', 'Jarrow', 'Designs for Health'],
    ip_landscape:
      'Epitech Group (Normast, PeaPure) holds patents on micronized/ultra-micronized PEA formulations. Levagen+ (Gencor Pacific) is branded PEA. Particle size reduction is key IP differentiator.',
    trending: true,
  },
  {
    name: 'Spore-Based Probiotics (Bacillus subtilis / coagulans)',
    category: 'Gut Health / Specialty',
    health_focus:
      'Shelf-stable probiotics, leaky gut repair, immune modulation, antibiotic recovery, IBS symptom relief',
    regulatory_status:
      'DSHEA — dietary supplement. Spore-forming bacteria survive stomach acid (no refrigeration required). NDI filed for specific strains. GanedenBC30 (B. coagulans) GRAS. MegaSporeBiotic research by Microbiome Labs.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 285,
    cagr_5yr_pct: 18,
    typical_dose: '1-4 billion CFU/day (spore-based; lower CFU needed than Lactobacillus)',
    typical_retail_price_monthly: { low: 25, high: 55 },
    key_brands: ['Microbiome Labs (MegaSporeBiotic)', 'Just Thrive', 'Thorne FloraSport', 'Designs for Health'],
    ip_landscape:
      'Microbiome Labs holds IP on MegaSporeBiotic 5-strain formula. Kerry Group (GanedenBC30) holds patents on B. coagulans GBI-30. Strain-specific patents are the primary IP moat.',
    trending: true,
  },
  {
    name: 'Phosphatidylserine (PS)',
    category: 'Cognitive / Specialty',
    health_focus: 'Cognitive function, memory, cortisol reduction, exercise recovery, ADHD support, neuroprotection',
    regulatory_status:
      'DSHEA — dietary supplement. Phospholipid. FDA qualified health claim for cognitive function and dementia. Soy-derived or sunflower-derived (allergen-free). Sharp-PS (Enzymotec/Frutarom) is branded form.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 145,
    cagr_5yr_pct: 10,
    typical_dose: '100-400mg/day',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['Jarrow PS-100', 'NOW', 'Life Extension', 'Pure Encapsulations'],
    ip_landscape:
      'Enzymotec/Frutarom (IFF) holds patents on Sharp-PS (soy-derived) and Sharp-PS Green (sunflower-derived). Chemi Nutra (SerinAid) is alternative branded PS. Sunflower-derived PS growing due to soy allergen concerns.',
    trending: false,
  },
  {
    name: 'Glucosamine + Chondroitin',
    category: 'Joint Health',
    health_focus:
      'Joint cartilage support, osteoarthritis symptom relief, joint lubrication, anti-inflammatory (chondroitin)',
    regulatory_status:
      'DSHEA — dietary supplement. Among most studied joint supplements. Glucosamine HCl or sulfate (sulfate preferred for evidence). Shellfish-derived (allergy concern) or plant-based alternatives. GAIT trial (NIH) showed mixed results.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 780,
    cagr_5yr_pct: 4,
    typical_dose: '1500mg glucosamine + 1200mg chondroitin/day',
    typical_retail_price_monthly: { low: 12, high: 35 },
    key_brands: ['Schiff Move Free', 'Osteo Bi-Flex', 'NOW', "Doctor's Best"],
    ip_landscape:
      'Open — commodity ingredients. Largely off-patent. TSI Group, BASF, and Bioiberica are major chondroitin suppliers. Shellfish-free glucosamine (Regenasure from corn) patented. Declining growth as consumers shift to collagen/UC-II.',
    trending: false,
  },
  {
    name: 'UC-II (Undenatured Type II Collagen)',
    category: 'Joint Health',
    health_focus:
      'Joint comfort via oral tolerance (immune modulation), osteoarthritis, exercise-induced joint stress, cartilage support',
    regulatory_status:
      'DSHEA — dietary supplement. Undenatured (native) type II collagen from chicken sternum. Mechanism: oral tolerance modulates T-cell response to reduce joint inflammation. NDI filed. Different mechanism than hydrolyzed collagen.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 125,
    cagr_5yr_pct: 14,
    typical_dose: '40mg/day (taken on empty stomach)',
    typical_retail_price_monthly: { low: 15, high: 35 },
    key_brands: ['NOW UC-II', 'Jarrow', 'Life Extension', "Doctor's Best"],
    ip_landscape:
      'InterHealth (now Lonza) holds key patents on UC-II branded ingredient. Harvard Medical School research foundational. Strong IP moat on undenatured collagen processing. Limited competing ingredients.',
    trending: true,
  },
  {
    name: 'SAMe (S-Adenosyl-L-Methionine)',
    category: 'Specialty / Mood & Joint',
    health_focus:
      'Mood support (methylation, neurotransmitter synthesis), joint comfort, liver health (glutathione production), methylation support',
    regulatory_status:
      'DSHEA — dietary supplement in US. Prescription drug in Europe (Samyr, Gumbaral). Stability challenges — enteric coating required. Butanedisulfonate salt most stable. Premium pricing due to manufacturing complexity.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 195,
    cagr_5yr_pct: 6,
    typical_dose: '400-1600mg/day (divided doses, on empty stomach)',
    typical_retail_price_monthly: { low: 25, high: 65 },
    key_brands: ['Jarrow SAM-e', 'NOW', 'Life Extension', 'Nature Made'],
    ip_landscape:
      'Open — multiple manufacturers. Stability is key differentiator. Gnosis by Lesaffre (Adomet) is major bulk supplier. Enteric coating and stabilization technologies patentable. High manufacturing cost limits competition.',
    trending: false,
    target_demographic: [
      'Depression/mood support seekers',
      'Joint pain sufferers',
      'Liver health seekers',
      'Adults 40+',
    ],
  },
  {
    name: '5-HTP (5-Hydroxytryptophan)',
    category: 'Specialty / Mood & Sleep',
    health_focus: 'Serotonin precursor, mood support, sleep onset, appetite regulation, migraine prevention',
    regulatory_status:
      'DSHEA — dietary supplement. Derived from Griffonia simplicifolia seeds. Direct serotonin precursor. Potential interaction with SSRIs/MAOIs (serotonin syndrome risk). FDA monitors closely due to 1989 L-tryptophan EMS crisis.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 155,
    cagr_5yr_pct: 7,
    typical_dose: '50-300mg/day (start low, titrate up)',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['NOW', 'Natrol', 'Jarrow', 'Life Extension'],
    ip_landscape:
      'Open — naturally derived amino acid. Griffonia simplicifolia seed extraction is standard source. Supply chain concentrated in West Africa. No major IP barriers. Safety interaction warnings differentiate responsible brands.',
    trending: false,
  },
  {
    name: 'Olive Leaf Extract (Oleuropein)',
    category: 'Herbal / Cardiovascular',
    health_focus:
      'Blood pressure support, antioxidant, antimicrobial, immune support, cardiovascular protection, glucose metabolism',
    regulatory_status:
      'DSHEA — botanical supplement. GRAS. Standardized to oleuropein (15-40%) or hydroxytyrosol. EFSA health claim approved in EU for olive oil polyphenols and cardiovascular health. NDI not required.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 130,
    cagr_5yr_pct: 11,
    typical_dose: '500-1000mg/day (standardized to 15-20% oleuropein)',
    typical_retail_price_monthly: { low: 10, high: 28 },
    key_brands: ['Life Extension', 'NOW', 'Gaia Herbs', "Barlean's"],
    ip_landscape:
      'Open — botanical extract. Benolea (Frutarom/IFF) is branded olive leaf extract. HIDROX (oleuropein hydroxytyrosol) patented. Comvita and other producers compete on standardization and sourcing.',
    trending: false,
  },
  {
    name: 'Berberine Phytosome (Enhanced Absorption)',
    category: 'Metabolic / Specialty',
    health_focus: 'Blood glucose management, cholesterol support, gut-liver axis, weight management (AMPK activation)',
    regulatory_status:
      'DSHEA — dietary supplement. Berberine complexed with phospholipids (phytosome technology) for 10x bioavailability improvement. Indena holds Berbevis phytosome patents. NDI filed.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 55,
    cagr_5yr_pct: 30,
    typical_dose: '550mg/day berberine phytosome (equivalent to ~2000mg standard berberine)',
    typical_retail_price_monthly: { low: 25, high: 45 },
    key_brands: ['Thorne Berberine-500', 'Life Extension', 'Designs for Health'],
    ip_landscape:
      'Indena holds patents on Berbevis (berberine phytosome) leveraging Phytosome delivery platform. Same technology used for Siliphos, Meriva (curcumin). Strong IP moat on phospholipid complexation.',
    trending: true,
  },
  {
    name: 'Coenzyme B Vitamins (Active B Complex)',
    category: 'Essential Vitamin / Specialty',
    health_focus:
      'Methylation support, energy production, homocysteine reduction, mood support, MTHFR-friendly complete B spectrum',
    regulatory_status:
      'DSHEA — dietary supplement. All B vitamins in active coenzyme forms: methylcobalamin, 5-MTHF, pyridoxal-5-phosphate, riboflavin-5-phosphate, benfotiamine. Premium segment of B-vitamin market.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 380,
    cagr_5yr_pct: 14,
    typical_dose: 'Per formula — typical: 400mcg 5-MTHF, 1000mcg methylcobalamin, 25mg P5P, 25mg R5P',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: [
      'Thorne Basic B Complex',
      'Pure Encapsulations B-Complex Plus',
      'Seeking Health B-Minus',
      'Designs for Health B-Supreme',
    ],
    ip_landscape:
      'Gnosis (Quatrefolic 5-MTHF), Merck (Metafolin), and specific coenzyme form suppliers hold ingredient patents. Formulation combinations patentable. Premium pricing justified by bioavailability claims.',
    trending: true,
  },
  {
    name: 'Omega-3 (Krill Oil)',
    category: 'Essential Fatty Acid / Specialty',
    health_focus:
      'Cardiovascular health, joint inflammation, cognitive function, phospholipid-bound EPA/DHA (superior absorption), astaxanthin content',
    regulatory_status:
      'DSHEA — dietary supplement. Neptune Technologies originally patented krill oil extraction. Phospholipid-bound omega-3 form claimed superior to triglyceride form. Sustainability certifications (MSC) increasingly important.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 450,
    cagr_5yr_pct: 9,
    typical_dose: '1000-2000mg krill oil/day (provides ~250-500mg EPA+DHA)',
    typical_retail_price_monthly: { low: 18, high: 45 },
    key_brands: ['Krill Oil by Sports Research', 'MegaRed (Schiff)', 'NOW Neptune Krill Oil', 'Dr. Mercola'],
    ip_landscape:
      'Aker BioMarine (Superba) dominates Antarctic krill supply chain. Neptune Technologies holds extraction patents (many expiring). Sustainable sourcing certifications create barriers. Phospholipid form vs. triglyceride debate ongoing.',
    trending: false,
  },
  {
    name: 'Vitamin D3 + K2 (MK-7) Combination',
    category: 'Essential Vitamin / Bone Health',
    health_focus:
      'Calcium metabolism optimization (D3 absorption + K2 directs calcium to bones, away from arteries), bone density, cardiovascular protection',
    regulatory_status:
      'DSHEA — dietary supplement. Synergistic combination increasingly recommended by integrative medicine. D3 is most popular single supplement globally. K2 (MK-7) ensures proper calcium utilization. Well-established safety.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 520,
    cagr_5yr_pct: 15,
    typical_dose: '2000-5000 IU D3 + 100-200mcg K2 (MK-7)/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Thorne D3/K2', 'Life Extension', 'NOW', 'Sports Research'],
    ip_landscape:
      'NattoPharma (now Gnosis by Lesaffre) holds patents on MenaQ7 (all-trans MK-7 from natto fermentation). D3 is commodity. Combination products differentiate on K2 quality and form (MK-7 vs MK-4).',
    trending: true,
  },
  {
    name: 'Methylsulfonylmethane (MSM)',
    category: 'Joint Health / Specialty',
    health_focus:
      'Joint comfort, anti-inflammatory, exercise recovery, skin/hair/nail health (sulfur donor), allergic rhinitis symptom relief',
    regulatory_status:
      'DSHEA — dietary supplement. Organic sulfur compound. GRAS. OptiMSM (Bergstrom Nutrition) is distillation-purified and most studied. No serious safety concerns at typical doses.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 220,
    cagr_5yr_pct: 7,
    typical_dose: '1000-6000mg/day',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ["Doctor's Best (OptiMSM)", 'NOW', 'Jarrow', 'Life Extension'],
    ip_landscape:
      'Bergstrom Nutrition holds patents on OptiMSM (distillation-purified MSM). Dominant branded ingredient. Generic MSM (crystallization-produced) available at lower quality/purity. Distillation vs. crystallization is key differentiator.',
    trending: false,
  },
  {
    name: 'Myo-Inositol + D-Chiro-Inositol',
    category: 'Specialty / Hormonal',
    health_focus:
      'PCOS management (insulin sensitization, ovarian function), fertility support, mood regulation, metabolic syndrome',
    regulatory_status:
      'DSHEA — dietary supplement. Naturally occurring sugar alcohol. GRAS. 40:1 ratio (myo:D-chiro) mimics physiological plasma ratio. Strong clinical evidence for PCOS. Growing off-label use for metabolic health.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 175,
    cagr_5yr_pct: 20,
    typical_dose: '2000-4000mg myo-inositol + 50-100mg D-chiro-inositol/day',
    typical_retail_price_monthly: { low: 15, high: 35 },
    key_brands: ['Ovasitol (Theralogix)', 'Wholesome Story', 'NOW', 'Premama'],
    ip_landscape:
      'Theralogix holds IP on Ovasitol (40:1 ratio blend with clinical validation). Lo.Li. Pharma has foundational research patents. 40:1 ratio is well-established but specific formulations/delivery patentable.',
    trending: true,
  },
  {
    name: 'Serrapeptase (Serratiopeptidase)',
    category: 'Specialty / Enzyme',
    health_focus:
      'Systemic enzyme therapy, inflammation modulation, sinus and respiratory support, fibrin degradation, biofilm disruption',
    regulatory_status:
      'DSHEA — dietary supplement. Proteolytic enzyme originally from Serratia marcescens (silkworm). Enteric coating required for survival through stomach acid. Measured in SPU (serratiopeptidase units).',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 80,
    cagr_5yr_pct: 10,
    typical_dose: '60,000-120,000 SPU/day (on empty stomach)',
    typical_retail_price_monthly: { low: 12, high: 30 },
    key_brands: ["Doctor's Best", 'NOW', 'Enzymedica', 'Arthur Andrew Medical'],
    ip_landscape:
      'Open — enzyme ingredient. Enteric coating technology differentiates. Combination products (serrapeptase + nattokinase + other proteases) patentable. Takeda originally developed; now widely available.',
    trending: false,
  },
  {
    name: 'Boswellia Serrata (5-Loxin / AprsFlex)',
    category: 'Herbal / Anti-Inflammatory',
    health_focus:
      'Joint inflammation (5-LOX inhibition), osteoarthritis pain, IBD support, asthma, brain health (AKBA)',
    regulatory_status:
      'DSHEA — botanical supplement. Ayurvedic traditional use (frankincense). NDI not required. Standardized to boswellic acids (AKBA is key active). AprsFlex (PLT Health) and 5-Loxin are branded extracts.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 190,
    cagr_5yr_pct: 12,
    typical_dose: '300-500mg/day (standardized to 30% AKBA)',
    typical_retail_price_monthly: { low: 12, high: 32 },
    key_brands: ['Life Extension', 'NOW', 'Thorne', "Doctor's Best"],
    ip_landscape:
      'PLT Health Solutions holds patents on AprsFlex (formerly Aflapin) — AKBA-enriched boswellia. Sabinsa (5-Loxin) holds competing patents. Multiple branded extracts compete on AKBA standardization level.',
    trending: false,
  },
  {
    name: 'Humic/Fulvic Acid Complex',
    category: 'Specialty / Mineral Transport',
    health_focus:
      'Mineral absorption and transport, detoxification, gut health, electrolyte balance, antioxidant, cellular nutrient delivery',
    regulatory_status:
      'DSHEA — dietary supplement. Derived from ancient organic matter (humic deposits). Quality and sourcing highly variable. Some products contaminated with heavy metals. Reputable sources test extensively.',
    clinical_evidence_level: 'preliminary',
    us_market_size_m_2025: 65,
    cagr_5yr_pct: 18,
    typical_dose: '250-500mg/day fulvic acid or per product instructions',
    typical_retail_price_monthly: { low: 15, high: 40 },
    key_brands: ['BEAM Minerals', 'Trace Minerals Research', 'Vital Earth', 'BLK water'],
    ip_landscape:
      'Open — natural extract. Source material quality is primary differentiator. Extraction and purification methods patentable. Limited clinical evidence limits premium positioning.',
    trending: false,
  },
  {
    name: 'Tongkat Ali + Fadogia Agrestis Stack',
    category: 'Specialty / Hormonal',
    health_focus:
      'Testosterone optimization (dual mechanism: LH signaling + free T increase), libido, athletic performance, body composition',
    regulatory_status:
      'DSHEA — botanical supplements. Tongkat Ali well-established. Fadogia agrestis is newer with limited human data and potential testicular toxicity concerns at high doses. Popularized by Andrew Huberman. Regulatory scrutiny possible for Fadogia.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 30,
    typical_dose: '400-600mg Tongkat Ali (100:1) + 600mg Fadogia agrestis/day',
    typical_retail_price_monthly: { low: 25, high: 55 },
    key_brands: ['Momentous', 'Nootropics Depot', 'Double Wood', "Barlowe's Herbal"],
    ip_landscape:
      'Open — botanical extracts. LJ100 (HP Ingredients) is patented Tongkat Ali extract (standardized eurycomanone). Fadogia agrestis has no branded forms yet. Safety data gap is commercial risk for Fadogia.',
    trending: true,
  },
  {
    name: 'Grape Seed Extract (OPC)',
    category: 'Antioxidant / Cardiovascular',
    health_focus:
      'Antioxidant (oligomeric proanthocyanidins), blood pressure support, venous insufficiency, skin health, endothelial function',
    regulatory_status:
      'DSHEA — botanical supplement. GRAS. Well-studied polyphenol extract. Standardized to 95% OPC (oligomeric proanthocyanidins). French maritime pine bark (Pycnogenol) is related but separate ingredient.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 195,
    cagr_5yr_pct: 7,
    typical_dose: '100-300mg/day (standardized to 95% OPC)',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['NOW', "Nature's Way", 'Life Extension', 'Jarrow'],
    ip_landscape:
      'Open — commodity botanical extract. MegaNatural (Polyphenolics/Constellation Brands) is branded grape seed extract. Pycnogenol (Horphag Research) is pine bark competitor with extensive IP. Standard OPC extract is commoditized.',
    trending: false,
  },
  {
    name: 'Spirulina / Chlorella',
    category: 'Superfood / Greens',
    health_focus:
      'Nutrient density (protein, B12, iron, chlorophyll), detoxification (heavy metal binding), immune support, antioxidant, alkalizing',
    regulatory_status:
      'DSHEA — dietary supplement / food. GRAS. Both are microalgae with long history of human consumption. Quality concerns: heavy metal contamination (especially from polluted water sources). Organic and third-party tested products preferred.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 340,
    cagr_5yr_pct: 8,
    typical_dose: '3-10g/day (tablets or powder)',
    typical_retail_price_monthly: { low: 10, high: 35 },
    key_brands: ['NOW', 'Nutrex Hawaii (Hawaiian Spirulina)', 'Sun Chlorella', 'Earthrise'],
    ip_landscape:
      'Open — commodity microalgae. Controlled cultivation environments and purity testing differentiate. Earthrise and Cyanotech are major US producers. Broken cell wall chlorella processing patentable.',
    trending: false,
  },
];

// ────────────────────────────────────────────────────────────
// CHANNEL ECONOMICS
// ────────────────────────────────────────────────────────────

export interface ChannelEconomics {
  channel: NutraceuticalChannel;
  description: string;
  typical_margin_pct: { brand: number; channel: number };
  customer_acquisition_cost: { low: number; high: number };
  ltv_to_cac_benchmark: number;
  market_share_of_supplement_sales_pct: number;
  growth_trend: string;
  key_requirements: string[];
}

export const CHANNEL_ECONOMICS: ChannelEconomics[] = [
  {
    channel: 'dtc_ecommerce',
    description: 'Direct-to-consumer via own website (Shopify, custom). Highest margins, highest CAC.',
    typical_margin_pct: { brand: 70, channel: 0 },
    customer_acquisition_cost: { low: 30, high: 120 },
    ltv_to_cac_benchmark: 3.0,
    market_share_of_supplement_sales_pct: 18,
    growth_trend: 'Growing 15%+ annually. Premium/clinical brands dominate.',
    key_requirements: [
      'Strong brand identity',
      'Content marketing / influencer strategy',
      'Subscription model (70%+ retention target)',
      'Customer service infrastructure',
    ],
  },
  {
    channel: 'amazon',
    description:
      'Amazon marketplace (FBA/FBM). Largest single channel for supplements. High competition, margin pressure.',
    typical_margin_pct: { brand: 40, channel: 30 },
    customer_acquisition_cost: { low: 8, high: 35 },
    ltv_to_cac_benchmark: 2.5,
    market_share_of_supplement_sales_pct: 35,
    growth_trend: 'Dominant channel. Subscribe & Save drives retention.',
    key_requirements: [
      'Amazon advertising expertise',
      'Review velocity (100+ reviews)',
      'Subscribe & Save enrollment',
      'Brand Registry',
    ],
  },
  {
    channel: 'retail_mass',
    description: 'Walmart, Target, CVS, Walgreens, Costco. Highest volume, lowest margin. Slotting fees.',
    typical_margin_pct: { brand: 30, channel: 35 },
    customer_acquisition_cost: { low: 2, high: 10 },
    ltv_to_cac_benchmark: 5.0,
    market_share_of_supplement_sales_pct: 28,
    growth_trend: 'Stable. Mass market supplements commoditizing.',
    key_requirements: [
      'Slotting fees ($10K-$100K per SKU)',
      'Broker/distributor relationships',
      'Competitive retail pricing',
      'Velocity requirements',
    ],
  },
  {
    channel: 'retail_specialty',
    description: 'Whole Foods, Sprouts, GNC, Vitamin Shoppe, Natural Grocers. Premium positioning.',
    typical_margin_pct: { brand: 45, channel: 35 },
    customer_acquisition_cost: { low: 5, high: 20 },
    ltv_to_cac_benchmark: 3.5,
    market_share_of_supplement_sales_pct: 12,
    growth_trend: 'Steady growth. Clean label requirements.',
    key_requirements: [
      'Clean label / Non-GMO / Organic certs',
      'Natural channel distributor (UNFI, KeHE)',
      'Demo programs',
      'MSRP compliance',
    ],
  },
  {
    channel: 'practitioner',
    description: 'Healthcare practitioner dispensary (Fullscript, Wellevate, direct physician sales).',
    typical_margin_pct: { brand: 55, channel: 20 },
    customer_acquisition_cost: { low: 15, high: 50 },
    ltv_to_cac_benchmark: 4.0,
    market_share_of_supplement_sales_pct: 5,
    growth_trend: 'Growing with integrative/functional medicine. Telehealth expanding reach.',
    key_requirements: [
      'Practitioner-grade quality (NSF/USP tested)',
      'Medical affairs team',
      'Practitioner education',
      'Platform partnerships (Fullscript, Wellevate)',
    ],
  },
  {
    channel: 'subscription',
    description: 'Recurring subscription model (monthly auto-ship). Best for DTC brands.',
    typical_margin_pct: { brand: 65, channel: 0 },
    customer_acquisition_cost: { low: 25, high: 100 },
    ltv_to_cac_benchmark: 4.0,
    market_share_of_supplement_sales_pct: 8,
    growth_trend: 'Fastest growing channel segment. Personalization drives premium pricing.',
    key_requirements: [
      'Low-friction signup',
      'Personalization (quiz, AI)',
      'Flexible pause/cancel',
      '60%+ 6-month retention target',
    ],
  },
  {
    channel: 'wholesale_b2b',
    description: 'White-label / contract manufacturing / bulk ingredient supply to other brands.',
    typical_margin_pct: { brand: 20, channel: 0 },
    customer_acquisition_cost: { low: 500, high: 5000 },
    ltv_to_cac_benchmark: 8.0,
    market_share_of_supplement_sales_pct: 4,
    growth_trend: 'Steady. Contract manufacturing consolidating.',
    key_requirements: [
      'Minimum order quantities',
      'Quality certifications (NSF, GMP)',
      'Regulatory support for clients',
      'Competitive pricing at scale',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// US NUTRACEUTICAL MARKET OVERVIEW
// ────────────────────────────────────────────────────────────

export const US_SUPPLEMENT_MARKET = {
  total_market_size_b_2025: 65.1,
  cagr_5yr_pct: 7.5,
  us_adult_supplement_usage_pct: 57,
  avg_monthly_spend_per_user: 42,
  total_supplement_users_m: 170,
  top_categories: [
    { category: 'Vitamins & Minerals', share_pct: 32, size_b: 20.8 },
    { category: 'Herbal / Botanical', share_pct: 15, size_b: 9.8 },
    { category: 'Sports Nutrition', share_pct: 14, size_b: 9.1 },
    { category: 'Specialty (Probiotics, Omega-3, Collagen)', share_pct: 18, size_b: 11.7 },
    { category: 'Weight Management', share_pct: 8, size_b: 5.2 },
    { category: 'Longevity / Anti-Aging', share_pct: 5, size_b: 3.3 },
    { category: 'Cognitive / Nootropics', share_pct: 4, size_b: 2.6 },
    { category: 'Beauty (Nutricosmetics)', share_pct: 4, size_b: 2.6 },
  ],
  source: 'Nutrition Business Journal, Grand View Research, Euromonitor 2025',
} as const;

// ────────────────────────────────────────────────────────────
// AUTOCOMPLETE SUGGESTION DATA
// ────────────────────────────────────────────────────────────

export const INGREDIENT_SUGGESTIONS: { name: string; category: string; detail: string }[] =
  NUTRACEUTICAL_INGREDIENTS.map((i) => ({
    name: i.name,
    category: i.category,
    detail: `$${i.us_market_size_m_2025}M US market | ${i.cagr_5yr_pct}% CAGR`,
  }));

export const POPULAR_INGREDIENTS: string[] = [
  'NMN (Nicotinamide Mononucleotide)',
  'Multi-strain Probiotics',
  'Creatine Monohydrate',
  'Omega-3 (EPA/DHA)',
  'Magnesium (various forms)',
  'Vitamin D3',
  'Collagen Peptides',
  'Berberine',
];

export const HEALTH_FOCUS_SUGGESTIONS: { name: string; category: string; detail: string }[] = [
  { name: 'Longevity / NAD+ restoration', category: 'Longevity', detail: '$3.3B US market' },
  { name: 'Gut health / Microbiome', category: 'Gut', detail: '$4.2B probiotics market' },
  { name: 'Cognitive function / Nootropics', category: 'Cognitive', detail: '$2.6B US market' },
  { name: 'Weight management / GLP-1 support', category: 'Metabolic', detail: '$5.2B + fastest growing' },
  { name: 'Sports performance / Recovery', category: 'Sports', detail: '$9.1B US market' },
  { name: 'Immune support', category: 'Immune', detail: 'Post-COVID sustained demand' },
  { name: 'Sleep / Stress / Adaptogen', category: 'Wellness', detail: 'Ashwagandha, magnesium, L-theanine' },
  { name: 'Beauty / Skin / Hair / Nails', category: 'Beauty', detail: '$2.6B nutricosmetics' },
  { name: 'Joint health / Mobility', category: 'Joint', detail: 'Collagen, glucosamine, UC-II' },
  { name: 'Heart / Cardiovascular', category: 'Cardiovascular', detail: 'Omega-3, CoQ10, Lp(a) support' },
  { name: 'Blood sugar / Metabolic health', category: 'Metabolic', detail: 'Berberine, chromium, cinnamon' },
  { name: "Hormone optimization / Men's health", category: 'Hormone', detail: 'Testosterone support, fertility' },
  { name: "Women's health / Fertility", category: "Women's", detail: 'Prenatal, iron, hormone balance' },
  { name: 'Bone health / Osteoporosis prevention', category: 'Bone', detail: 'Calcium, D3, K2, collagen' },
];

// ────────────────────────────────────────────────────────────
// FORM OPTIONS (for dropdowns, selectors)
// ────────────────────────────────────────────────────────────

export const NUTRACEUTICAL_CATEGORY_OPTIONS = [
  { value: 'dietary_supplement', label: 'Dietary Supplement (DSHEA)' },
  { value: 'functional_food', label: 'Functional Food' },
  { value: 'medical_food', label: 'Medical Food' },
  { value: 'otc_drug', label: 'OTC Drug (Monograph/NDA)' },
  { value: 'rx_to_otc_switch', label: 'Rx-to-OTC Switch' },
  { value: 'cosmeceutical', label: 'Cosmeceutical / Skincare' },
  { value: 'longevity_compound', label: 'Longevity Compound' },
  { value: 'probiotic_microbiome', label: 'Probiotic / Microbiome' },
  { value: 'sports_nutrition', label: 'Sports Nutrition' },
];

export const NUTRACEUTICAL_CHANNEL_OPTIONS = [
  { value: 'dtc_ecommerce', label: 'DTC E-commerce' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'retail_mass', label: 'Retail (Mass)' },
  { value: 'retail_specialty', label: 'Retail (Specialty/Natural)' },
  { value: 'practitioner', label: 'Practitioner Channel' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'wholesale_b2b', label: 'Wholesale / B2B' },
];

export const CLAIM_TYPE_OPTIONS = [
  { value: 'structure_function', label: 'Structure/Function Claim' },
  { value: 'qualified_health', label: 'Qualified Health Claim' },
  { value: 'authorized_health', label: 'Authorized Health Claim' },
  { value: 'nutrient_content', label: 'Nutrient Content Claim' },
  { value: 'drug_claim', label: 'Drug Claim (OTC only)' },
  { value: 'cosmetic_claim', label: 'Cosmetic Claim' },
];

export const NUTRACEUTICAL_STAGES = [
  { value: 'formulation', label: 'Formulation' },
  { value: 'clinical_study', label: 'Clinical Study' },
  { value: 'market_ready', label: 'Market Ready' },
  { value: 'commercial', label: 'Commercial' },
] as const;
