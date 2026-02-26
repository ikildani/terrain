// ============================================================
// TERRAIN — Regional Prevalence Adjustment Factors
// lib/data/regional-prevalence-factors.ts
//
// Territory-specific disease burden multipliers relative to the US.
// Used to convert US epidemiology data to global estimates that
// account for geographic variation in disease burden.
//
// Factor = 1.0 means same per-capita rate as US.
// Factor > 1.0 means higher burden than US per capita.
// Factor < 1.0 means lower burden than US per capita.
//
// Sources: WHO Global Burden of Disease 2021, IARC GLOBOCAN 2022,
// published literature, regional disease registries.
// ============================================================

export interface RegionalPrevalenceFactor {
  therapy_area: string;
  eu5: number;
  japan: number;
  china: number;
  row: number; // Rest of World weighted average
  notes: string;
}

export const REGIONAL_PREVALENCE_FACTORS: RegionalPrevalenceFactor[] = [
  {
    therapy_area: 'oncology',
    eu5: 1.05,
    japan: 1.15,
    china: 1.1,
    row: 0.75,
    notes:
      'Overall cancer burden similar in developed nations; China elevated (gastric, liver, lung); RoW lower due to younger demographics and competing mortality',
  },
  {
    therapy_area: 'neurology',
    eu5: 1.1,
    japan: 1.2,
    china: 0.8,
    row: 0.6,
    notes:
      'EU5/Japan higher due to aging populations; dementia especially elevated in Japan; China/RoW lower due to younger populations and under-diagnosis',
  },
  {
    therapy_area: 'immunology',
    eu5: 1.05,
    japan: 0.7,
    china: 0.65,
    row: 0.55,
    notes:
      'Autoimmune conditions higher in Northern European/US populations; lower prevalence in East Asia; significant under-diagnosis in developing nations',
  },
  {
    therapy_area: 'cardiovascular',
    eu5: 0.85,
    japan: 0.65,
    china: 1.3,
    row: 1.15,
    notes:
      'EU5 lower than US (less obesity, better prevention); Japan low (diet); China/RoW elevated (hypertension, stroke burden, limited prevention)',
  },
  {
    therapy_area: 'metabolic',
    eu5: 0.8,
    japan: 0.6,
    china: 1.4,
    row: 1.1,
    notes: 'Type 2 diabetes epidemic in China/South Asia; NAFLD rising globally; Japan lower; EU5 moderate',
  },
  {
    therapy_area: 'rare_disease',
    eu5: 1.0,
    japan: 0.95,
    china: 0.9,
    row: 0.7,
    notes:
      'Genetic rare diseases have similar per-capita rates globally but diagnosis rates vary enormously; RoW significantly under-diagnosed',
  },
  {
    therapy_area: 'infectious_disease',
    eu5: 0.6,
    japan: 0.4,
    china: 0.8,
    row: 3.5,
    notes:
      'HIV, TB, malaria, hepatitis heavily concentrated in Sub-Saharan Africa and South/Southeast Asia; minimal in EU5/Japan',
  },
  {
    therapy_area: 'hematology',
    eu5: 0.95,
    japan: 0.9,
    china: 0.85,
    row: 1.2,
    notes:
      'Sickle cell high in Sub-Saharan ancestry; thalassemia high in Mediterranean/Asia; leukemia/lymphoma similar across developed nations',
  },
  {
    therapy_area: 'ophthalmology',
    eu5: 0.95,
    japan: 1.15,
    china: 1.05,
    row: 0.8,
    notes:
      'Myopia epidemic in East Asia; AMD similar in aging populations; glaucoma under-diagnosed in developing nations',
  },
  {
    therapy_area: 'dermatology',
    eu5: 1.1,
    japan: 0.75,
    china: 0.7,
    row: 0.65,
    notes:
      'Psoriasis and atopic dermatitis higher in Northern European populations; lower in East Asia; skin cancer patterns vary with UV exposure and skin type',
  },
  {
    therapy_area: 'gastroenterology',
    eu5: 1.0,
    japan: 1.3,
    china: 1.15,
    row: 0.7,
    notes:
      'H. pylori and gastric disease higher in Japan/China; IBD higher in Western nations; IBS similar globally but under-diagnosed in developing world',
  },
  {
    therapy_area: 'psychiatry',
    eu5: 1.0,
    japan: 0.7,
    china: 0.55,
    row: 0.5,
    notes:
      'Depression/anxiety diagnosis rates much higher in Western nations; significant cultural and diagnostic variation; true prevalence may be similar but treated prevalence is not',
  },
  {
    therapy_area: 'pulmonology',
    eu5: 0.9,
    japan: 0.85,
    china: 1.4,
    row: 1.2,
    notes:
      'COPD/asthma elevated in China (smoking + pollution); IPF similar in developed nations; TB-related pulmonary disease high in RoW',
  },
  {
    therapy_area: 'nephrology',
    eu5: 0.9,
    japan: 1.1,
    china: 1.05,
    row: 0.8,
    notes:
      'CKD/ESRD elevated in Japan (aging); IgA nephropathy more common in East Asia; lupus nephritis varies by ethnicity',
  },
  {
    therapy_area: 'endocrinology',
    eu5: 0.85,
    japan: 0.75,
    china: 0.9,
    row: 0.7,
    notes:
      'Thyroid disorders higher at northern latitudes; growth disorders similar globally; adrenal conditions equally distributed',
  },
  {
    therapy_area: 'hepatology',
    eu5: 0.8,
    japan: 1.3,
    china: 3.0,
    row: 2.0,
    notes:
      'Hepatitis B endemic in China/SE Asia (300M carriers); liver cancer 4-5x higher per capita in China vs US; NAFLD/NASH rising globally; Japan elevated (HCV legacy)',
  },
  {
    therapy_area: 'musculoskeletal',
    eu5: 1.05,
    japan: 1.15,
    china: 0.9,
    row: 0.7,
    notes:
      'Osteoarthritis and osteoporosis higher in aging EU5/Japan populations; rheumatoid arthritis similar globally; sports injuries higher in developed nations',
  },
  {
    therapy_area: 'pain_management',
    eu5: 0.85,
    japan: 0.7,
    china: 0.6,
    row: 0.5,
    notes:
      'Chronic pain diagnosis/treatment rates much higher in US; opioid prescribing patterns unique to US; neuropathic pain similar but treatment rates vary enormously',
  },
];

/**
 * Returns the regional prevalence factor for a given therapy area.
 * Falls back to neutral (1.0) factors if the therapy area is not found.
 */
export function getRegionalFactors(therapyArea: string): RegionalPrevalenceFactor {
  const match = REGIONAL_PREVALENCE_FACTORS.find((f) => f.therapy_area.toLowerCase() === therapyArea.toLowerCase());
  return (
    match ?? {
      therapy_area: therapyArea,
      eu5: 1.0,
      japan: 1.0,
      china: 1.0,
      row: 1.0,
      notes: 'Default neutral factors — no therapy-area-specific adjustment available',
    }
  );
}
