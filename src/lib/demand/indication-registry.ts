/**
 * Demand layer — Solidus ↔ Terrain indication registry.
 *
 * Solidus (deal intelligence) keys indications with short slugs
 * (`alzheimers`, `lung_nsclc`, `nashMash`). Terrain keys them by canonical
 * name plus synonyms (`INDICATION_DATA` in `@/lib/data/indication-map`).
 * This module is the single translation table between the two.
 *
 * How the table was built (Sep 2026):
 *   1. Universe = the 271 keys in Solidus `data/epidemiology.json` plus the
 *      30 registry-only aliases in `lib/benchmarkPagesIndication.ts`
 *      (INDICATION_REGISTRY) that have no epidemiology row (301 keys total).
 *   2. Each key's label and humanised slug were normalised and matched against
 *      Terrain names + synonyms (exact, then `findIndicationByName`).
 *   3. Every fuzzy hit was reviewed by hand; wrong hits were removed and the
 *      remainder hand-fixed. Umbrella keys that only have a *subset* in
 *      Terrain are kept as `match: 'proxy'` with a note so consumers can
 *      decide whether the proxy is acceptable.
 *
 * Coverage against the 271 epidemiology keys: see `MAPPING_COVERAGE` (derived
 * at module load, asserted in tests) and docs/demand-layer.md.
 *
 * Rule for consumers (Solidus, Augur): call by Solidus slug; store nothing
 * but the slug and the `asOf` returned by the demand endpoint.
 */

import { INDICATION_DATA, getIndicationSuggestions, type IndicationData } from '@/lib/data/indication-map';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

/** `exact` = same disease entity. `proxy` = Terrain covers a subset/superset; see `note`. */
export type MatchQuality = 'exact' | 'proxy';

export interface SolidusIndicationMapping {
  /** Solidus slug (epidemiology.json key or INDICATION_REGISTRY value). */
  solidusKey: string;
  /** Canonical Terrain `IndicationData.name`. */
  terrainName: string;
  match: MatchQuality;
  /** Present for proxies: what the proxy covers and what it does not. */
  note?: string;
  /** True when this key is a registry-only alias of another Solidus key. */
  alias?: boolean;
}

export interface UnmappedSolidusKey {
  solidusKey: string;
  /** Solidus display label when INDICATION_REGISTRY has one. */
  label?: string;
  reason: string;
}

export type ResolvedBy = 'solidus_key' | 'solidus_alias' | 'terrain_name' | 'terrain_synonym' | 'terrain_fuzzy';

export interface ResolvedIndication {
  indication: IndicationData;
  /** Canonical Solidus slug, or null when Solidus has no key for this Terrain indication. */
  solidusKey: string | null;
  /** All Solidus keys (canonical + aliases) that point at this Terrain indication. */
  solidusAliases: string[];
  match: MatchQuality | null;
  note?: string;
  resolvedBy: ResolvedBy;
}

// ────────────────────────────────────────────────────────────
// NORMALISER
// ────────────────────────────────────────────────────────────

/**
 * Collapse any key/label/name to lowercase alphanumerics so that
 * `lung_nsclc`, `Lung NSCLC`, `lung-nsclc` and `LUNG_NSCLC` all agree.
 */
export function normaliseKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** `nashMash` → `nash mash`, `lung_nsclc` → `lung nsclc` (for suggestions). */
export function humaniseKey(input: string): string {
  return input
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ────────────────────────────────────────────────────────────
// MAPPING TABLE (hand-curated)
// ────────────────────────────────────────────────────────────

const M = (solidusKey: string, terrainName: string, note?: string): SolidusIndicationMapping =>
  note ? { solidusKey, terrainName, match: 'proxy', note } : { solidusKey, terrainName, match: 'exact' };

const A = (solidusKey: string, terrainName: string, note?: string): SolidusIndicationMapping => ({
  ...M(solidusKey, terrainName, note),
  alias: true,
});

export const SOLIDUS_TO_TERRAIN: readonly SolidusIndicationMapping[] = [
  // ── Oncology — solid tumours ─────────────────────────────
  M('lung_nsclc', 'Non-Small Cell Lung Cancer'),
  M('lung_sclc', 'Small Cell Lung Cancer'),
  M('breast_her2', 'HER2-Positive Breast Cancer'),
  M('breast_tnbc', 'Triple Negative Breast Cancer'),
  M('breast_hr', 'HR+/HER2- Breast Cancer'),
  M('colorectal', 'Colorectal Cancer'),
  M('pancreatic', 'Pancreatic Ductal Adenocarcinoma'),
  M('melanoma', 'Melanoma'),
  M('prostate', 'Metastatic Castration-Resistant Prostate Cancer'),
  M('ovarian', 'Ovarian Cancer'),
  M('gastric', 'Gastric/Gastroesophageal Junction Cancer'),
  M('liver', 'Hepatocellular Carcinoma'),
  M('renal', 'Renal Cell Carcinoma'),
  M('gbm', 'Glioblastoma'),
  M('bladder', 'Urothelial Carcinoma'),
  M('headNeck', 'Head and Neck Squamous Cell Carcinoma'),
  M('cholangiocarcinoma', 'Cholangiocarcinoma'),
  M('mesothelioma', 'Mesothelioma'),
  M(
    'sarcoma',
    'Soft Tissue Sarcoma',
    'Solidus "Sarcoma" is an umbrella; Terrain figures are soft-tissue sarcoma only (bone sarcomas keyed separately).',
  ),
  M('endometrial', 'Endometrial Cancer'),
  M('cervical', 'Cervical Cancer'),
  M('thyroid', 'Thyroid Cancer'),
  M('esophageal', 'Esophageal Cancer'),
  M('testicular', 'Testicular Cancer'),
  M('adrenocortical', 'Adrenocortical Carcinoma'),
  M('nasopharyngeal', 'Nasopharyngeal Carcinoma'),
  M('penile', 'Penile Cancer'),
  M('merkelCell', 'Merkel Cell Carcinoma'),
  M('neuroblastoma', 'Neuroblastoma'),
  M('osteosarcoma', 'Osteosarcoma'),
  M('ewingSarcoma', 'Ewing Sarcoma'),

  // ── Oncology — haematologic ──────────────────────────────
  M('aml', 'Acute Myeloid Leukemia'),
  M('cll', 'Chronic Lymphocytic Leukemia'),
  M('myeloma', 'Multiple Myeloma'),
  M('dlbcl', 'Diffuse Large B-Cell Lymphoma'),
  M('follicular', 'Follicular Lymphoma'),
  M('mantleCell', 'Mantle Cell Lymphoma'),
  M('mds', 'Myelodysplastic Syndromes'),
  M(
    'mpn',
    'Myelofibrosis',
    'Solidus MPN umbrella; Terrain figures are myelofibrosis only (polycythemia vera keyed separately as polycythemiaVera).',
  ),
  M(
    'tCellLymphoma',
    'Cutaneous T-Cell Lymphoma',
    'Solidus T-cell lymphoma umbrella; Terrain figures are cutaneous T-cell lymphoma only (PTCL not covered).',
  ),
  M('cml', 'Chronic Myeloid Leukemia'),
  M('waldenstrom', "Waldenstrom's Macroglobulinemia"),
  M('hodgkins', 'Hodgkin Lymphoma'),
  M('burkitt', 'Burkitt Lymphoma'),

  // ── Neurology ────────────────────────────────────────────
  M('alzheimers', "Alzheimer's Disease"),
  M('parkinsons', "Parkinson's Disease"),
  M('als', 'Amyotrophic Lateral Sclerosis'),
  M('huntingtons', "Huntington's Disease"),
  M('migraine', 'Migraine'),
  M('narcolepsy', 'Narcolepsy'),
  M('ms', 'Multiple Sclerosis'),
  M('epilepsy', 'Epilepsy'),
  M('tremor', 'Essential Tremor', 'Solidus "Movement Disorders / Tremor"; Terrain figures are essential tremor only.'),
  M('rett', 'Rett Syndrome'),
  M('friedreichs', "Friedreich's Ataxia"),
  M('dmd', 'Duchenne Muscular Dystrophy'),
  M('sma', 'Spinal Muscular Atrophy'),
  M('angelman', 'Angelman Syndrome'),
  M('dravet', 'Dravet Syndrome'),
  M(
    'peripheralNeuropathy',
    'Diabetic Peripheral Neuropathy',
    'Solidus peripheral neuropathy umbrella; Terrain figures are diabetic peripheral neuropathy (largest subset).',
  ),
  M('tuberousSclerosis', 'Tuberous Sclerosis Complex'),
  M('cmt', 'Charcot-Marie-Tooth Disease'),
  M('clusterHeadache', 'Cluster Headache'),
  M('stiffPerson', 'Stiff Person Syndrome'),
  M('praderWilli', 'Prader-Willi Syndrome'),
  M('batten', 'Batten Disease'),
  M('myastheniaGravis', 'Myasthenia Gravis'),
  M('cidp', 'Chronic Inflammatory Demyelinating Polyneuropathy'),
  M('multipleSclerosisMod', 'Multiple Sclerosis'),

  // ── Psychiatry ───────────────────────────────────────────
  M('schizophrenia', 'Schizophrenia'),
  M('depression', 'Major Depressive Disorder'),
  M('bipolar', 'Bipolar Disorder'),
  M('ptsd', 'Post-Traumatic Stress Disorder'),
  M(
    'ocd',
    'Obsessive-Compulsive Disorder',
    'Solidus "OCD / Anxiety Disorders"; Terrain figures are OCD only (GAD is a separate Terrain indication).',
  ),
  M('adhd', 'Attention-Deficit/Hyperactivity Disorder'),
  M('addiction', 'Substance Use Disorder'),
  M('postpartumDepression', 'Postpartum Depression'),

  // ── Pain ─────────────────────────────────────────────────
  M(
    'pain',
    'Neuropathic Pain',
    'Solidus "Chronic / Neuropathic Pain"; Terrain figures are neuropathic pain (chronicPain maps to Chronic Pain separately).',
  ),
  M('chronicPain', 'Chronic Pain'),

  // ── Immunology / inflammation ────────────────────────────
  M('rheumatoidArthritis', 'Rheumatoid Arthritis'),
  M('sle_lupus', 'Systemic Lupus Erythematosus'),
  M('lupusNephritis', 'Lupus Nephritis'),
  M('atopicderm', 'Atopic Dermatitis'),
  M('psoriasis', 'Plaque Psoriasis'),
  M('psoriaticArthritis', 'Psoriatic Arthritis'),
  M('ulcerativeColitis', 'Ulcerative Colitis'),
  M('crohns', "Crohn's Disease"),
  M('igan', 'IgA Nephropathy'),
  M('systemicSclerosis', 'Systemic Sclerosis'),
  M('sjogrens', "Sjogren's Syndrome"),
  M('alopecia', 'Alopecia Areata'),
  M('hidradenitis', 'Hidradenitis Suppurativa'),
  M('pnh', 'Paroxysmal Nocturnal Hemoglobinuria'),
  M('celiac', 'Celiac Disease'),
  M('vitiligo', 'Vitiligo'),
  M('pemphigus', 'Pemphigus Vulgaris'),
  M('itp', 'Immune Thrombocytopenia'),
  M('asthma', 'Severe Asthma'),
  M('eosinophilicEsophagitis', 'Eosinophilic Esophagitis'),
  M('pbc', 'Primary Biliary Cholangitis'),
  M('ankylosingSpondylitis', 'Ankylosing Spondylitis'),
  M('giantCellArteritis', 'Giant Cell Arteritis'),
  M('sarcoidosis', 'Sarcoidosis'),
  M('autoImmuneHepatitis', 'Autoimmune Hepatitis'),
  M('psc', 'Primary Sclerosing Cholangitis'),
  M('membranousNephropathy', 'Membranous Nephropathy'),
  M('fsgs', 'Focal Segmental Glomerulosclerosis'),
  M('uveitis', 'Uveitis'),
  M('chronicUrticaria', 'Chronic Spontaneous Urticaria'),
  M('heredAngioedema', 'Hereditary Angioedema'),
  M('epidermolysis', 'Epidermolysis Bullosa'),
  M('ipf', 'Idiopathic Pulmonary Fibrosis'),
  M('coldAgglutinin', 'Cold Agglutinin Disease'),
  M('ttpAutoimmune', 'Thrombotic Thrombocytopenic Purpura'),
  M(
    'nephroticSyndrome',
    'Minimal Change Disease',
    'Solidus nephrotic syndrome umbrella; Terrain figures are minimal change disease (FSGS and MN keyed separately).',
  ),
  M('copd', 'Chronic Obstructive Pulmonary Disease'),

  // ── Metabolic / endocrine / rare ─────────────────────────
  M('obesity', 'Obesity'),
  M('type2Diabetes', 'Type 2 Diabetes'),
  M('nashMash', 'Metabolic Dysfunction-Associated Steatohepatitis'),
  M(
    'glycogenStorage',
    'Glycogen Storage Disease Type I',
    'Solidus GSD umbrella; Terrain figures are GSD type I (Pompe/GSD II keyed separately as pompe).',
  ),
  M('pku', 'Phenylketonuria'),
  M('type1Diabetes', 'Type 1 Diabetes'),
  M('ckdMetabolic', 'Chronic Kidney Disease'),
  M('hfpef', 'Heart Failure with Preserved Ejection Fraction'),
  M(
    'familialHypercholesterolemia',
    'Heterozygous Familial Hypercholesterolemia',
    'Solidus FH umbrella; Terrain figures are heterozygous FH (HoFH is a separate Terrain indication).',
  ),
  M('gout', 'Gout'),
  M('wilsonDisease', 'Wilson Disease'),
  M('fabry', 'Fabry Disease'),
  M('gaucher', 'Gaucher Disease'),
  M('pompe', 'Pompe Disease'),
  M(
    'mpsDisorders',
    'Hunter Syndrome',
    'Solidus MPS umbrella; Terrain figures are MPS II / Hunter syndrome (Hurler / MPS I is a separate Terrain indication).',
  ),
  M('aatDeficiency', 'Alpha-1 Antitrypsin Deficiency'),
  M('ureaCycleDisorders', 'Urea Cycle Disorders'),
  M('galactosemia', 'Galactosemia'),
  M(
    'attrAmyloidosis',
    'Transthyretin Amyloid Cardiomyopathy',
    'Solidus ATTR amyloidosis (CM + PN); Terrain figures are ATTR cardiomyopathy only.',
  ),
  M('sickleCell', 'Sickle Cell Disease'),
  M('betaThalassemia', 'Beta-Thalassemia'),
  M('hemophiliaA', 'Hemophilia A'),
  M('hemophiliaB', 'Hemophilia B'),
  M('cysticFibrosis', 'Cystic Fibrosis'),
  M('acromegaly', 'Acromegaly'),
  M('cushings', 'Cushing Syndrome'),
  M('congenitalAdrenalHyperplasia', 'Congenital Adrenal Hyperplasia'),
  M('hypophosphatasia', 'Hypophosphatasia'),
  M('porphyria', 'Acute Hepatic Porphyria'),
  M('congenitalHyperinsulinism', 'Congenital Hyperinsulinism'),

  // ── Cardiovascular ───────────────────────────────────────
  M('heartFailureHfref', 'Heart Failure with Reduced Ejection Fraction'),
  M('atrialFibrillation', 'Atrial Fibrillation'),
  M('pulmonaryArterialHypertension', 'Pulmonary Arterial Hypertension'),
  M('peripheralArteryDisease', 'Peripheral Artery Disease'),
  M('venousThromboembolism', 'Deep Vein Thrombosis'),
  M('dyslipidemia', 'Hyperlipidemia'),
  M(
    'cardiomyopathy',
    'Dilated Cardiomyopathy',
    'Solidus cardiomyopathy umbrella; Terrain figures are dilated cardiomyopathy (HCM keyed separately as hypertrophicCardiomyopathy).',
  ),
  M('attrCardiomyopathy', 'Transthyretin Amyloid Cardiomyopathy'),
  M('acuteCoronarySyndrome', 'Acute Coronary Syndrome'),
  M('stroke', 'Ischemic Stroke'),

  // ── Infectious disease ───────────────────────────────────
  M('hivAids', 'HIV/AIDS'),
  M('hepatitisB', 'Hepatitis B'),
  M('rsv', 'Respiratory Syncytial Virus'),
  M('influenza', 'Influenza'),
  M('tuberculosis', 'Tuberculosis'),
  M('fungalInfections', 'Invasive Fungal Infections'),
  M(
    'amrBacterial',
    'MRSA Infections',
    'Solidus AMR bacterial umbrella; Terrain figures are MRSA / serious bacterial infections.',
  ),
  M('hepatitisD', 'Chronic Hepatitis D'),
  M('clostridioides', 'Clostridioides difficile Infection'),
  M('dengueMalaria', 'Malaria', 'Solidus combined dengue + malaria key; Terrain figures are malaria only.'),
  M('hepatitisC', 'Hepatitis C'),
  M('mpox', 'Mpox'),

  // ── Ophthalmology ────────────────────────────────────────
  M('wetAmd', 'Neovascular Age-Related Macular Degeneration'),
  M('dryAmdGA', 'Geographic Atrophy'),
  M('diabeticMacularEdema', 'Diabetic Macular Edema'),
  M('glaucoma', 'Glaucoma'),
  M('dryEyeDisease', 'Dry Eye Disease'),
  M('retinitisPigmentosa', 'Retinitis Pigmentosa'),
  M('uveiticMacular', 'Uveitis', 'Solidus uveitic macular edema; Terrain figures are non-infectious uveitis overall.'),

  // ── Women's health ───────────────────────────────────────
  M('endometriosis', 'Endometriosis'),
  M('pcos', 'Polycystic Ovary Syndrome'),
  M('menopause', 'Vasomotor Symptoms of Menopause'),

  // ── Registry-only aliases (INDICATION_REGISTRY values with no epidemiology row) ──
  A('hypertrophicCardiomyopathy', 'Hypertrophic Cardiomyopathy'),
  A('heartFailureHfpef', 'Heart Failure with Preserved Ejection Fraction'),
  A('spinalMuscularAtrophy', 'Spinal Muscular Atrophy'),
  A('duchenneMD', 'Duchenne Muscular Dystrophy'),
  A('fabryDisease', 'Fabry Disease'),
  A('gaucherDisease', 'Gaucher Disease'),
  A('pompeDisease', 'Pompe Disease'),
  A('mucopolysaccharidosis', 'Hunter Syndrome', 'Solidus MPS umbrella; Terrain figures are MPS II / Hunter syndrome.'),
  A('niemannPickC', 'Niemann-Pick Disease Type C'),
  A('follicularLymphoma', 'Follicular Lymphoma'),
  A('myelofibrosis', 'Myelofibrosis'),
  A('polycythemiaVera', 'Polycythemia Vera'),
  A('mantleCellLymphoma', 'Mantle Cell Lymphoma'),
  A('hodgkinLymphoma', 'Hodgkin Lymphoma'),
  A('atopicDermatitis', 'Atopic Dermatitis'),
  A('alopeciaAreata', 'Alopecia Areata'),
  A('hidradenitisSuppurativa', 'Hidradenitis Suppurativa'),
  A('acne', 'Acne Vulgaris'),
  A('rosacea', 'Rosacea'),
  A('prurigo', 'Prurigo Nodularis'),
  A('celiacDisease', 'Celiac Disease'),
  A('ibsD', 'Irritable Bowel Syndrome', 'Solidus IBS-D; Terrain figures are IBS overall (all subtypes).'),
  A('shortBowelSyndrome', 'Short Bowel Syndrome'),
  A('primaryBiliaryCholangitis', 'Primary Biliary Cholangitis'),
  A('gastroparesis', 'Gastroparesis'),
  A('nonAlcoholicSteatohepatitis', 'Metabolic Dysfunction-Associated Steatohepatitis'),
];

/**
 * Solidus keys with no defensible Terrain counterpart. Kept explicit so the
 * gap is visible to consumers and so the list route can publish it.
 */
export const UNMAPPED_SOLIDUS_KEYS: readonly UnmappedSolidusKey[] = [
  // Oncology
  { solidusKey: 'smallBowel', reason: 'No small-bowel adenocarcinoma entry in Terrain.' },
  {
    solidusKey: 'neuroendocrine',
    label: 'Neuroendocrine Tumors (NET)',
    reason: 'No GEP-NET entry in Terrain (Merkel cell is a skin NEC, not a proxy).',
  },
  {
    solidusKey: 'uvealMelanoma',
    label: 'Uveal Melanoma',
    reason: 'Terrain melanoma is cutaneous; uveal biology and prevalence differ too much for a proxy.',
  },
  { solidusKey: 'thymoma', reason: 'No thymic epithelial tumour entry in Terrain.' },
  { solidusKey: 'retinoblastoma', reason: 'No retinoblastoma entry in Terrain.' },
  { solidusKey: 'rhabdomyosarcoma', reason: 'No rhabdomyosarcoma entry in Terrain.' },
  { solidusKey: 'vulvar', reason: 'No vulvar cancer entry in Terrain.' },
  { solidusKey: 'all', label: 'Acute Lymphoblastic Leukemia (ALL)', reason: 'No ALL entry in Terrain.' },
  { solidusKey: 'marginalZone', reason: 'No marginal zone lymphoma entry in Terrain.' },
  { solidusKey: 'primaryCNSLymphoma', reason: 'No PCNSL entry in Terrain.' },
  { solidusKey: 'systemicMastocytosis', reason: 'No systemic mastocytosis entry in Terrain.' },
  { solidusKey: 'cmml', reason: 'No CMML entry in Terrain (MDS is not a proxy).' },
  { solidusKey: 'hairyCell', reason: 'No hairy cell leukemia entry in Terrain.' },
  { solidusKey: 'amyloidosisAL', reason: 'No AL amyloidosis entry in Terrain (ATTR is a different disease).' },
  { solidusKey: 'castlemanDisease', reason: 'No Castleman disease entry in Terrain.' },
  { solidusKey: 'aplasticAnemia', label: 'Aplastic Anemia', reason: 'No aplastic anemia entry in Terrain.' },
  { solidusKey: 'bpdcn', reason: 'No BPDCN entry in Terrain.' },
  {
    solidusKey: 'krasMutant',
    label: 'KRAS-Mutant Tumors',
    reason: 'Biomarker-defined pan-tumour key; Terrain is organised by indication.',
  },
  {
    solidusKey: 'her2Low',
    label: 'HER2-Low Tumors',
    reason: 'Biomarker-defined pan-tumour key; Terrain is organised by indication.',
  },
  {
    solidusKey: 'msiHigh',
    label: 'MSI-High / dMMR Tumors',
    reason: 'Biomarker-defined pan-tumour key; Terrain is organised by indication.',
  },
  // Neurology / psychiatry
  { solidusKey: 'tbi', label: 'Traumatic Brain Injury', reason: 'No TBI entry in Terrain.' },
  { solidusKey: 'rareNeuro', reason: 'Umbrella key with no single Terrain counterpart.' },
  { solidusKey: 'autism', label: 'Autism Spectrum Disorder', reason: 'No ASD entry in Terrain.' },
  { solidusKey: 'myotonicDystrophy', label: 'Myotonic Dystrophy', reason: 'No DM1/DM2 entry in Terrain.' },
  { solidusKey: 'spinalCordInjury', reason: 'No spinal cord injury entry in Terrain.' },
  {
    solidusKey: 'frontotemporal',
    label: 'Frontotemporal Dementia (FTD)',
    reason: "No FTD entry in Terrain (Alzheimer's is not a proxy).",
  },
  { solidusKey: 'lewyBody', label: 'Lewy Body Dementia', reason: 'No DLB entry in Terrain.' },
  { solidusKey: 'fragileX', label: 'Fragile X Syndrome', reason: 'No fragile X entry in Terrain.' },
  { solidusKey: 'cdkl5', reason: 'No CDKL5 deficiency disorder entry in Terrain.' },
  { solidusKey: 'neurofibromatosis', reason: 'No NF1/NF2 entry in Terrain.' },
  { solidusKey: 'restlessLeg', reason: 'No restless legs syndrome entry in Terrain.' },
  { solidusKey: 'insomnia', label: 'Insomnia', reason: 'No insomnia entry in Terrain (OSA is a different disorder).' },
  { solidusKey: 'lgmd', reason: 'No limb-girdle muscular dystrophy entry in Terrain.' },
  { solidusKey: 'fshd', reason: 'No FSHD entry in Terrain.' },
  { solidusKey: 'gbs', reason: 'No Guillain-Barre entry in Terrain (CIDP is chronic, not a proxy).' },
  { solidusKey: 'ataxiaTelangiectasia', reason: 'No A-T entry in Terrain.' },
  // Immunology
  {
    solidusKey: 'ibd_broad',
    reason: "Umbrella of Crohn's + UC; map the specific keys (crohns, ulcerativeColitis) to avoid double counting.",
  },
  { solidusKey: 'aancaVasculitis', label: 'ANCA Vasculitis', reason: 'No AAV entry in Terrain.' },
  { solidusKey: 'rareAutoimmune', reason: 'Umbrella key with no single Terrain counterpart.' },
  { solidusKey: 'gvhd', label: 'Graft-vs-Host Disease (GVHD)', reason: 'No GVHD entry in Terrain.' },
  { solidusKey: 'organTransplant', reason: 'No transplant-rejection entry in Terrain.' },
  {
    solidusKey: 'thyroidEye',
    reason: "No thyroid eye disease entry in Terrain (Graves' is the systemic disease, not TED).",
  },
  { solidusKey: 'behcets', reason: "No Behcet's entry in Terrain." },
  { solidusKey: 'polymyalgiaRheumatica', reason: 'No PMR entry in Terrain (GCA is a related but distinct entity).' },
  { solidusKey: 'foodAllergy', reason: 'No food allergy entry in Terrain.' },
  { solidusKey: 'dermatomyositis', reason: 'No dermatomyositis entry in Terrain.' },
  { solidusKey: 'antiphospholipid', reason: 'No APS entry in Terrain.' },
  { solidusKey: 'egpa', reason: 'No EGPA entry in Terrain.' },
  { solidusKey: 'systemicJIA', reason: 'No sJIA entry in Terrain.' },
  { solidusKey: 'primaryImmunodeficiency', reason: 'No PID entry in Terrain.' },
  // Metabolic / rare
  {
    solidusKey: 'metabolicSyndrome',
    label: 'Metabolic Syndrome',
    reason: 'No metabolic syndrome entry in Terrain (obesity / T2D keyed separately).',
  },
  { solidusKey: 'lipodystrophy', reason: 'No lipodystrophy entry in Terrain.' },
  { solidusKey: 'rareMetabolic', reason: 'Umbrella key with no single Terrain counterpart.' },
  { solidusKey: 'hyperoxaluria', reason: 'No primary hyperoxaluria entry in Terrain.' },
  { solidusKey: 'asmd', reason: 'No ASMD / Niemann-Pick A-B entry in Terrain (NPC is a different disease).' },
  { solidusKey: 'cystinosis', reason: 'No cystinosis entry in Terrain.' },
  { solidusKey: 'krabbe', reason: 'No Krabbe disease entry in Terrain.' },
  { solidusKey: 'hemochromatosis', reason: 'No hemochromatosis entry in Terrain.' },
  { solidusKey: 'mitochondrialDisease', reason: 'No mitochondrial disease entry in Terrain.' },
  // Cardiovascular
  {
    solidusKey: 'coronaryArteryDisease',
    label: 'Coronary Artery Disease',
    reason: 'No chronic CAD entry in Terrain (ACS keyed separately).',
  },
  { solidusKey: 'aorticStenosis', reason: 'No aortic stenosis entry in Terrain.' },
  { solidusKey: 'resistantHypertension', label: 'Resistant Hypertension', reason: 'No hypertension entry in Terrain.' },
  { solidusKey: 'myocarditis', reason: 'No myocarditis entry in Terrain.' },
  { solidusKey: 'cardiacArrhythmia', reason: 'No general arrhythmia entry in Terrain (AFib keyed separately).' },
  { solidusKey: 'atherosclerosis', reason: 'No atherosclerosis entry in Terrain.' },
  { solidusKey: 'cardiacFibrosis', reason: 'No cardiac fibrosis entry in Terrain.' },
  { solidusKey: 'longQtSyndrome', reason: 'No long QT entry in Terrain.' },
  // Infectious
  { solidusKey: 'covid', label: 'COVID-19', reason: 'No COVID-19 entry in Terrain.' },
  { solidusKey: 'cmvInfection', label: 'CMV Infection', reason: 'No CMV entry in Terrain.' },
  { solidusKey: 'ebv', reason: 'No EBV entry in Terrain (NPC is a cancer, not the infection).' },
  { solidusKey: 'norovirus', reason: 'No norovirus entry in Terrain.' },
  { solidusKey: 'zika', reason: 'No Zika entry in Terrain.' },
  { solidusKey: 'lymeDisease', reason: 'No Lyme disease entry in Terrain.' },
  // Ophthalmology
  {
    solidusKey: 'diabeticRetinopathy',
    label: 'Diabetic Retinopathy',
    reason: 'No DR entry in Terrain (DME keyed separately).',
  },
  { solidusKey: 'retinalVeinOcclusion', reason: 'No RVO entry in Terrain.' },
  { solidusKey: 'stargardt', label: 'Stargardt Disease', reason: 'No Stargardt entry in Terrain.' },
  { solidusKey: 'myopiaProgression', label: 'Myopia Progression', reason: 'No myopia entry in Terrain.' },
  { solidusKey: 'keratoconus', reason: 'No keratoconus entry in Terrain.' },
  { solidusKey: 'presbyopia', reason: 'No presbyopia entry in Terrain.' },
  { solidusKey: 'cornealDystrophy', reason: 'No corneal dystrophy entry in Terrain.' },
  {
    solidusKey: 'opticNeuritis',
    reason: 'No optic neuritis entry in Terrain (NMOSD is a related but distinct entity).',
  },
  { solidusKey: 'achromatopsia', reason: 'No achromatopsia entry in Terrain.' },
  // Women's health
  { solidusKey: 'uterineFibroids', label: 'Uterine Fibroids', reason: 'No uterine fibroids entry in Terrain.' },
  { solidusKey: 'preeclampsia', label: 'Preeclampsia', reason: 'No preeclampsia entry in Terrain.' },
  { solidusKey: 'prematureLabor', reason: 'No preterm labour entry in Terrain.' },
  { solidusKey: 'fertilityArt', reason: 'No fertility / ART entry in Terrain.' },
  { solidusKey: 'vulvodynia', reason: 'No vulvodynia entry in Terrain.' },
  {
    solidusKey: 'cervicalDysplasia',
    reason: 'No CIN entry in Terrain (cervical cancer is the malignancy, not the precursor).',
  },
  { solidusKey: 'contraceptionNovel', reason: 'Not a disease; no Terrain counterpart.' },
  {
    solidusKey: 'breastCancerPrevention',
    reason: 'Prevention population; Terrain breast cancer entries are treatment populations.',
  },
  { solidusKey: 'gestationalDiabetes', reason: 'No GDM entry in Terrain.' },
  { solidusKey: 'hyperemesisGravidarum', reason: 'No HG entry in Terrain.' },
  { solidusKey: 'placentaAccreta', reason: 'No placenta accreta entry in Terrain.' },
  {
    solidusKey: 'vaginalAtrophy',
    reason: 'No GSM / vaginal atrophy entry in Terrain (VMS is a different symptom set).',
  },
  { solidusKey: 'menstrualDisorders', reason: 'No menstrual disorder entry in Terrain.' },
  {
    solidusKey: 'ovarianCancerScreening',
    reason: 'Screening population; Terrain ovarian cancer is the treatment population.',
  },
  // GI (registry-only)
  {
    solidusKey: 'microscopicColitis',
    label: 'Microscopic Colitis',
    reason: 'No microscopic colitis entry in Terrain.',
  },
];

// ────────────────────────────────────────────────────────────
// INDEXES (built once at module load)
// ────────────────────────────────────────────────────────────

const terrainByName = new Map<string, IndicationData>();
for (const ind of INDICATION_DATA) terrainByName.set(ind.name.toLowerCase(), ind);

/** normalised Solidus key → mapping */
const byNormalisedKey = new Map<string, SolidusIndicationMapping>();
/** Terrain name (lowercase) → canonical Solidus key (first non-alias wins, then first alias) */
const canonicalKeyByTerrainName = new Map<string, string>();
/** Terrain name (lowercase) → every Solidus key pointing at it */
const allKeysByTerrainName = new Map<string, string[]>();

for (const m of SOLIDUS_TO_TERRAIN) {
  byNormalisedKey.set(normaliseKey(m.solidusKey), m);
  const tn = m.terrainName.toLowerCase();
  const list = allKeysByTerrainName.get(tn) ?? [];
  list.push(m.solidusKey);
  allKeysByTerrainName.set(tn, list);
  const existing = canonicalKeyByTerrainName.get(tn);
  if (!existing) {
    canonicalKeyByTerrainName.set(tn, m.solidusKey);
  } else if (m.alias !== true) {
    const existingMapping = byNormalisedKey.get(normaliseKey(existing));
    if (existingMapping?.alias === true) canonicalKeyByTerrainName.set(tn, m.solidusKey);
  }
}

const unmappedByNormalisedKey = new Map<string, UnmappedSolidusKey>();
for (const u of UNMAPPED_SOLIDUS_KEYS) unmappedByNormalisedKey.set(normaliseKey(u.solidusKey), u);

// ────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────

/** Look up the Terrain record for a mapping (throws if the table drifts from INDICATION_DATA). */
function terrainFor(m: SolidusIndicationMapping): IndicationData {
  const ind = terrainByName.get(m.terrainName.toLowerCase());
  if (!ind) {
    throw new Error(
      `Demand registry drift: Solidus key "${m.solidusKey}" maps to unknown Terrain name "${m.terrainName}".`,
    );
  }
  return ind;
}

function buildResolved(
  ind: IndicationData,
  resolvedBy: ResolvedBy,
  viaMapping?: SolidusIndicationMapping,
): ResolvedIndication {
  const tn = ind.name.toLowerCase();
  const canonical = canonicalKeyByTerrainName.get(tn) ?? null;
  const canonicalMapping = canonical ? byNormalisedKey.get(normaliseKey(canonical)) : undefined;
  const mapping = viaMapping ?? canonicalMapping;
  return {
    indication: ind,
    solidusKey: canonical,
    solidusAliases: allKeysByTerrainName.get(tn) ?? [],
    match: mapping?.match ?? null,
    ...(mapping?.note ? { note: mapping.note } : {}),
    resolvedBy,
  };
}

/**
 * Resolve a Solidus slug, a Terrain name, or a Terrain synonym to a Terrain
 * `IndicationData` plus the Solidus slug when one exists.
 *
 * Resolution order: Solidus key (normalised) → Terrain exact name/synonym →
 * Terrain fuzzy (`findIndicationByName`). Returns `undefined` when nothing
 * matches or when the input is a Solidus key that is explicitly unmapped.
 */
export function resolveIndicationKey(keyOrName: string): ResolvedIndication | undefined {
  const raw = (keyOrName ?? '').trim();
  if (!raw) return undefined;

  const norm = normaliseKey(raw);

  // 1. Solidus key (canonical or alias)
  const mapping = byNormalisedKey.get(norm);
  if (mapping) {
    return buildResolved(terrainFor(mapping), mapping.alias ? 'solidus_alias' : 'solidus_key', mapping);
  }

  // 2. Explicitly unmapped Solidus key → no result (callers use getSuggestionsFor)
  if (unmappedByNormalisedKey.has(norm)) return undefined;

  // 3. Terrain exact name or synonym
  const lower = raw.toLowerCase();
  const exactName = terrainByName.get(lower);
  if (exactName) return buildResolved(exactName, 'terrain_name');

  const bySynonym = INDICATION_DATA.find((i) => i.synonyms.some((s) => s.toLowerCase() === lower));
  if (bySynonym) return buildResolved(bySynonym, 'terrain_synonym');

  // 4. Constrained fuzzy. Terrain's `findIndicationByName` is deliberately
  //    loose (two-letter synonyms such as "AS" match almost anything), which
  //    is fine for a search box but not for a keyed API: a wrong indication is
  //    worse than a 404 with suggestions. Accept a fuzzy hit only when the
  //    input contains a full name/synonym (≥ 4 chars) or is highly similar.
  const human = humaniseKey(raw);
  const contained = INDICATION_DATA.find((i) =>
    [i.name, ...i.synonyms].some(
      (s) => s.length >= 4 && (lower.includes(s.toLowerCase()) || human.includes(s.toLowerCase())),
    ),
  );
  if (contained) return buildResolved(contained, 'terrain_fuzzy');

  let best: { ind: IndicationData; score: number } | undefined;
  for (const ind of INDICATION_DATA) {
    const score = Math.max(bigramSimilarity(human, ind.name), ...ind.synonyms.map((s) => bigramSimilarity(human, s)));
    if (!best || score > best.score) best = { ind, score };
  }
  if (best && best.score >= FUZZY_ACCEPT_THRESHOLD) return buildResolved(best.ind, 'terrain_fuzzy');

  return undefined;
}

/** Minimum bigram similarity for a non-substring fuzzy resolution. */
const FUZZY_ACCEPT_THRESHOLD = 0.6;

/** Explicit unmapped-key record when the input is a known-but-unmapped Solidus key. */
export function getUnmappedRecord(keyOrName: string): UnmappedSolidusKey | undefined {
  return unmappedByNormalisedKey.get(normaliseKey(keyOrName ?? ''));
}

/** Character-bigram Dice similarity, 0..1. Cheap and stable for short medical names. */
function bigramSimilarity(a: string, b: string): number {
  const grams = (s: string) => {
    const t = normaliseKey(s);
    const set = new Map<string, number>();
    for (let i = 0; i < t.length - 1; i++) {
      const g = t.slice(i, i + 2);
      set.set(g, (set.get(g) ?? 0) + 1);
    }
    return set;
  };
  const ga = grams(a);
  const gb = grams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let overlap = 0;
  for (const [g, n] of ga) overlap += Math.min(n, gb.get(g) ?? 0);
  let sizeA = 0;
  let sizeB = 0;
  for (const n of ga.values()) sizeA += n;
  for (const n of gb.values()) sizeB += n;
  return (2 * overlap) / (sizeA + sizeB);
}

/**
 * Up to `limit` Terrain suggestions for an unresolved input.
 *
 * Order: substring hits on the raw input, then on the humanised slug, then on
 * each slug token (via `getIndicationSuggestions`); remaining slots are filled
 * by bigram similarity over names + synonyms so that even an unknown slug
 * (`thymoma`) gets its nearest neighbours rather than nothing.
 */
export function getSuggestionsFor(keyOrName: string, limit = 3): IndicationData[] {
  const seen = new Set<string>();
  const out: IndicationData[] = [];
  const push = (list: IndicationData[]) => {
    for (const i of list) {
      if (seen.has(i.name)) continue;
      seen.add(i.name);
      out.push(i);
      if (out.length >= limit) return true;
    }
    return false;
  };

  const raw = (keyOrName ?? '').trim();
  if (!raw) return getIndicationSuggestions('').slice(0, limit);

  const human = humaniseKey(raw);
  const queries = Array.from(new Set([raw, human, ...human.split(' ').filter((t) => t.length >= 3)]));
  for (const q of queries) {
    if (push(getIndicationSuggestions(q))) return out;
  }

  const ranked = INDICATION_DATA.map((ind) => ({
    ind,
    score: Math.max(bigramSimilarity(human, ind.name), ...ind.synonyms.map((s) => bigramSimilarity(human, s))),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.ind);
  push(ranked);
  return out;
}

/** Solidus keys that have no Terrain counterpart. */
export function listUnmapped(): UnmappedSolidusKey[] {
  return [...UNMAPPED_SOLIDUS_KEYS];
}

export interface MappedIndicationSummary {
  solidusKey: string;
  terrainName: string;
  therapyArea: string;
  match: MatchQuality;
  alias: boolean;
  note?: string;
}

/** Every Solidus key that resolves, with its Terrain name and therapy area. */
export function listMapped(): MappedIndicationSummary[] {
  return SOLIDUS_TO_TERRAIN.map((m) => ({
    solidusKey: m.solidusKey,
    terrainName: m.terrainName,
    therapyArea: terrainFor(m).therapy_area,
    match: m.match,
    alias: m.alias === true,
    ...(m.note ? { note: m.note } : {}),
  }));
}

/** Canonical Solidus slug for a Terrain indication name, if any. */
export function solidusKeyForTerrainName(terrainName: string): string | undefined {
  return canonicalKeyByTerrainName.get(terrainName.toLowerCase());
}

/** Coverage numbers for docs and the list route. Aliases are excluded from `mappedKeys`. */
export const MAPPING_COVERAGE = (() => {
  const canonical = SOLIDUS_TO_TERRAIN.filter((m) => m.alias !== true);
  const aliases = SOLIDUS_TO_TERRAIN.filter((m) => m.alias === true);
  const unmappedAliases = UNMAPPED_SOLIDUS_KEYS.filter((u) =>
    ['krasMutant', 'her2Low', 'msiHigh', 'microscopicColitis'].includes(u.solidusKey),
  );
  const unmappedCanonical = UNMAPPED_SOLIDUS_KEYS.length - unmappedAliases.length;
  return {
    /** Solidus epidemiology.json keys (271) that map. */
    mappedKeys: canonical.length,
    exactKeys: canonical.filter((m) => m.match === 'exact').length,
    proxyKeys: canonical.filter((m) => m.match === 'proxy').length,
    unmappedKeys: unmappedCanonical,
    totalKeys: canonical.length + unmappedCanonical,
    /** INDICATION_REGISTRY-only aliases (no epidemiology row). */
    aliasKeysMapped: aliases.length,
    aliasKeysUnmapped: unmappedAliases.length,
    terrainIndications: INDICATION_DATA.length,
    terrainIndicationsWithSolidusKey: canonicalKeyByTerrainName.size,
  };
})();
