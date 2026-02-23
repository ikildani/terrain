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
      { product: 'AG1 (Athletic Greens)', company: 'Athletic Greens', category: 'Greens powder — structure/function claims' },
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
    post_market_requirements: [
      'Same as DSHEA supplement requirements',
      'Maintain safety dossier updates',
    ],
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
    post_market_requirements: [
      'Adverse event reporting',
      'Maintain clinical substantiation for medical food status',
    ],
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
      { product: 'Deplin (L-methylfolate)', company: 'Alfasigma', category: 'Depression folate deficiency medical food' },
      { product: 'Limbrel (flavocoxid)', company: 'Primus/Limerick', category: 'Osteoarthritis medical food (FDA challenged)' },
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
      { product: 'Retin-A (tretinoin)', company: 'Valeant/Bausch', category: 'Rx drug — NOT cosmetic despite anti-aging use' },
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
      { product: 'Prevagen (apoaequorin)', company: 'Quincy Bioscience', category: 'FTC lawsuit for unsubstantiated memory claims ($12M)' },
      { product: 'POM Wonderful', company: 'POM Wonderful', category: 'FTC case — health claims ruled deceptive' },
      { product: 'Airborne (vitamin C)', company: 'Airborne', category: '$23.3M FTC settlement for false cold prevention claims' },
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
}

export const NUTRACEUTICAL_INGREDIENTS: NutraceuticalIngredient[] = [
  // ═══ LONGEVITY / ANTI-AGING ═══
  {
    name: 'NMN (Nicotinamide Mononucleotide)',
    category: 'Longevity',
    health_focus: 'NAD+ restoration, cellular energy, aging',
    regulatory_status: 'DSHEA status disputed — FDA issued exclusion opinion 2022 (Metro International IND). Industry challenging. Still widely sold.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 320,
    cagr_5yr_pct: 28,
    typical_dose: '250-1000mg/day',
    typical_retail_price_monthly: { low: 30, high: 120 },
    key_brands: ['ProHealth Longevity', 'Wonderfeel', 'Renue By Science', 'DoNotAge'],
    ip_landscape: 'Sinclair/Harvard patents on NMN for NAD+ (licensed to Metro International). Expiring 2030s.',
    trending: true,
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
    key_brands: ["Life Extension", "Doctor's Best", 'Swanson'],
    ip_landscape: 'Open — no dominant patents. Mayo Clinic trials on senolytic protocols.',
    trending: true,
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
  },

  // ═══ METABOLIC / WEIGHT MANAGEMENT ═══
  {
    name: 'Berberine',
    category: 'Metabolic',
    health_focus: 'Blood glucose management, cholesterol, AMPK activation',
    regulatory_status: 'DSHEA — botanical supplement. Growing regulatory scrutiny. "Nature\'s Ozempic" claim misleading per FDA.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 350,
    cagr_5yr_pct: 25,
    typical_dose: '500-1500mg/day',
    typical_retail_price_monthly: { low: 12, high: 40 },
    key_brands: ['Thorne', 'NOW', 'Life Extension'],
    ip_landscape: 'Open — berberine HCl widely available. Novel delivery (dihydroberberine) patented.',
    trending: true,
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
  },
  {
    name: 'Omega-3 (EPA/DHA)',
    category: 'Foundational',
    health_focus: 'Cardiovascular, brain health, anti-inflammatory',
    regulatory_status: 'DSHEA for supplements. Qualified health claim for EPA/DHA and CHD risk. Rx versions (Vascepa) are NDA drugs.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 3500,
    cagr_5yr_pct: 5,
    typical_dose: '1-4g EPA+DHA/day',
    typical_retail_price_monthly: { low: 10, high: 60 },
    key_brands: ['Nordic Naturals', 'Carlson', 'Thorne Super EPA', 'Sports Research'],
    ip_landscape: "Amarin's Vascepa patent litigation created precedent. Supplement-grade fish oil is open.",
    trending: false,
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
  },

  // ═══ CARDIOVASCULAR / MITOCHONDRIAL ═══
  {
    name: 'CoQ10 (Ubiquinol)',
    category: 'Cardiovascular',
    health_focus: 'Mitochondrial energy, heart health, statin-induced myopathy',
    regulatory_status: 'DSHEA — dietary supplement. GRAS. Well-established safety profile. Ubiquinol (reduced form) preferred over ubiquinone.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 850,
    cagr_5yr_pct: 6,
    typical_dose: '100-300mg/day',
    typical_retail_price_monthly: { low: 15, high: 50 },
    key_brands: ['Qunol', 'NOW', 'Life Extension'],
    ip_landscape: 'Kaneka holds key patents on biofermented ubiquinol (QH). Generic CoQ10 (ubiquinone) is open.',
    trending: false,
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
    ip_landscape: 'Meriva (Indena), Longvida (Verdure Sciences), and Theracurmin (Theravalues) hold phytosome/nanoparticle patents. Base curcumin is open.',
    trending: false,
  },

  // ═══ IMMUNE ═══
  {
    name: 'Elderberry (Sambucus)',
    category: 'Immune',
    health_focus: 'Immune defense, cold/flu duration reduction',
    regulatory_status: 'DSHEA — botanical supplement. GRAS. Long history of traditional use. Post-COVID demand surge stabilizing.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 680,
    cagr_5yr_pct: 7,
    typical_dose: '500-1000mg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Sambucol', 'Nature Made', 'Garden of Life'],
    ip_landscape: 'Sambucol has proprietary extract. Commodity elderberry extract widely available.',
    trending: false,
  },
  {
    name: 'Zinc',
    category: 'Foundational',
    health_focus: 'Immune function, wound healing, testosterone support',
    regulatory_status: 'DSHEA — essential mineral. Authorized health claim for immune function. No regulatory concerns.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 500,
    cagr_5yr_pct: 5,
    typical_dose: '15-50mg/day',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Thorne', 'NOW', 'Nature Made'],
    ip_landscape: 'Open — commodity mineral. Chelated forms (zinc bisglycinate, zinc carnosine) may have limited IP.',
    trending: false,
  },

  // ═══ SLEEP ═══
  {
    name: 'Melatonin',
    category: 'Sleep',
    health_focus: 'Sleep onset, circadian rhythm regulation, jet lag',
    regulatory_status: 'DSHEA — dietary supplement in US (Rx in EU). GRAS. Widespread consumer use. Low-dose trend emerging.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 920,
    cagr_5yr_pct: 8,
    typical_dose: '0.5-10mg (low dose trending)',
    typical_retail_price_monthly: { low: 5, high: 20 },
    key_brands: ['Natrol', 'NOW', 'Life Extension'],
    ip_landscape: 'Open — commodity ingredient. Extended-release and novel delivery forms patentable.',
    trending: false,
  },

  // ═══ ANTIOXIDANT / RESPIRATORY ═══
  {
    name: 'NAC (N-Acetyl Cysteine)',
    category: 'Antioxidant / Respiratory',
    health_focus: 'Glutathione precursor, liver support, mucolytic',
    regulatory_status: 'DSHEA status challenged by FDA 2020-2022 (IND exclusion argument). FDA enforcement discretion — widely sold.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 280,
    cagr_5yr_pct: 12,
    typical_dose: '600-1800mg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['NOW', 'Life Extension', 'Thorne'],
    ip_landscape: 'Open — off-patent pharmaceutical ingredient. Supplement status depends on FDA enforcement posture.',
    trending: true,
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
    ip_landscape: 'Open — commodity flavonoid. Phytosome-enhanced quercetin (Quercefit) has IP. Mayo Clinic senolytic protocol research.',
    trending: true,
  },

  // ═══ HORMONE ═══
  {
    name: 'Tongkat Ali (Eurycoma longifolia)',
    category: 'Hormone',
    health_focus: 'Testosterone support, cortisol reduction, athletic performance',
    regulatory_status: 'DSHEA — botanical supplement. NDI not required (traditional use in Southeast Asia). Growing clinical evidence base.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 95,
    cagr_5yr_pct: 28,
    typical_dose: '200-400mg/day (100:1 extract)',
    typical_retail_price_monthly: { low: 15, high: 45 },
    key_brands: ['Nootropics Depot', 'Double Wood', 'Momentous'],
    ip_landscape: 'LJ100 (HP Ingredients) is a patented standardized extract. Generic tongkat ali extracts widely available.',
    trending: true,
  },

  // ═══ LONGEVITY / CARDIOVASCULAR ═══
  {
    name: 'Taurine',
    category: 'Longevity / Cardiovascular',
    health_focus: 'Longevity (Singh 2023 Science paper), cardiovascular, exercise',
    regulatory_status: 'DSHEA — amino acid supplement. GRAS. Long safety history (energy drinks). Renewed interest after 2023 Science publication.',
    clinical_evidence_level: 'emerging',
    us_market_size_m_2025: 180,
    cagr_5yr_pct: 22,
    typical_dose: '1-3g/day',
    typical_retail_price_monthly: { low: 8, high: 25 },
    key_brands: ['NOW', 'Life Extension', 'Thorne'],
    ip_landscape: 'Open — commodity amino acid. No dominant patents. Longevity positioning is new.',
    trending: true,
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
  },

  // ═══ DIGESTIVE / METABOLIC ═══
  {
    name: 'Psyllium Husk',
    category: 'Digestive / Metabolic',
    health_focus: 'Fiber, cholesterol reduction, glycemic control, gut motility',
    regulatory_status: 'DSHEA — dietary supplement. Authorized health claim for soluble fiber and coronary heart disease risk. FDA-approved OTC laxative.',
    clinical_evidence_level: 'strong',
    us_market_size_m_2025: 780,
    cagr_5yr_pct: 4,
    typical_dose: '5-10g/day',
    typical_retail_price_monthly: { low: 8, high: 20 },
    key_brands: ['Metamucil', 'NOW', 'Konsyl'],
    ip_landscape: 'Open — commodity fiber. Metamucil (P&G) dominates brand recognition but ingredient is unpatentable.',
    trending: false,
  },

  // ═══ BONE / CARDIOVASCULAR ═══
  {
    name: 'Vitamin K2 (MK-7)',
    category: 'Bone / Cardiovascular',
    health_focus: 'Calcium direction (bones not arteries), osteocalcin activation',
    regulatory_status: 'DSHEA — dietary supplement. GRAS. Commonly paired with Vitamin D3. Growing evidence for cardiovascular benefit.',
    clinical_evidence_level: 'moderate',
    us_market_size_m_2025: 350,
    cagr_5yr_pct: 12,
    typical_dose: '100-200mcg/day',
    typical_retail_price_monthly: { low: 10, high: 30 },
    key_brands: ['Thorne', 'Life Extension', 'Carlson'],
    ip_landscape: 'MenaQ7 (NattoPharma/Gnosis by Lesaffre) holds key patents on fermentation-derived MK-7. Synthetic MK-7 alternatives emerging.',
    trending: true,
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
    key_requirements: ['Strong brand identity', 'Content marketing / influencer strategy', 'Subscription model (70%+ retention target)', 'Customer service infrastructure'],
  },
  {
    channel: 'amazon',
    description: 'Amazon marketplace (FBA/FBM). Largest single channel for supplements. High competition, margin pressure.',
    typical_margin_pct: { brand: 40, channel: 30 },
    customer_acquisition_cost: { low: 8, high: 35 },
    ltv_to_cac_benchmark: 2.5,
    market_share_of_supplement_sales_pct: 35,
    growth_trend: 'Dominant channel. Subscribe & Save drives retention.',
    key_requirements: ['Amazon advertising expertise', 'Review velocity (100+ reviews)', 'Subscribe & Save enrollment', 'Brand Registry'],
  },
  {
    channel: 'retail_mass',
    description: 'Walmart, Target, CVS, Walgreens, Costco. Highest volume, lowest margin. Slotting fees.',
    typical_margin_pct: { brand: 30, channel: 35 },
    customer_acquisition_cost: { low: 2, high: 10 },
    ltv_to_cac_benchmark: 5.0,
    market_share_of_supplement_sales_pct: 28,
    growth_trend: 'Stable. Mass market supplements commoditizing.',
    key_requirements: ['Slotting fees ($10K-$100K per SKU)', 'Broker/distributor relationships', 'Competitive retail pricing', 'Velocity requirements'],
  },
  {
    channel: 'retail_specialty',
    description: 'Whole Foods, Sprouts, GNC, Vitamin Shoppe, Natural Grocers. Premium positioning.',
    typical_margin_pct: { brand: 45, channel: 35 },
    customer_acquisition_cost: { low: 5, high: 20 },
    ltv_to_cac_benchmark: 3.5,
    market_share_of_supplement_sales_pct: 12,
    growth_trend: 'Steady growth. Clean label requirements.',
    key_requirements: ['Clean label / Non-GMO / Organic certs', 'Natural channel distributor (UNFI, KeHE)', 'Demo programs', 'MSRP compliance'],
  },
  {
    channel: 'practitioner',
    description: 'Healthcare practitioner dispensary (Fullscript, Wellevate, direct physician sales).',
    typical_margin_pct: { brand: 55, channel: 20 },
    customer_acquisition_cost: { low: 15, high: 50 },
    ltv_to_cac_benchmark: 4.0,
    market_share_of_supplement_sales_pct: 5,
    growth_trend: 'Growing with integrative/functional medicine. Telehealth expanding reach.',
    key_requirements: ['Practitioner-grade quality (NSF/USP tested)', 'Medical affairs team', 'Practitioner education', 'Platform partnerships (Fullscript, Wellevate)'],
  },
  {
    channel: 'subscription',
    description: 'Recurring subscription model (monthly auto-ship). Best for DTC brands.',
    typical_margin_pct: { brand: 65, channel: 0 },
    customer_acquisition_cost: { low: 25, high: 100 },
    ltv_to_cac_benchmark: 4.0,
    market_share_of_supplement_sales_pct: 8,
    growth_trend: 'Fastest growing channel segment. Personalization drives premium pricing.',
    key_requirements: ['Low-friction signup', 'Personalization (quiz, AI)', 'Flexible pause/cancel', '60%+ 6-month retention target'],
  },
  {
    channel: 'wholesale_b2b',
    description: 'White-label / contract manufacturing / bulk ingredient supply to other brands.',
    typical_margin_pct: { brand: 20, channel: 0 },
    customer_acquisition_cost: { low: 500, high: 5000 },
    ltv_to_cac_benchmark: 8.0,
    market_share_of_supplement_sales_pct: 4,
    growth_trend: 'Steady. Contract manufacturing consolidating.',
    key_requirements: ['Minimum order quantities', 'Quality certifications (NSF, GMP)', 'Regulatory support for clients', 'Competitive pricing at scale'],
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
