export interface TAMetadata {
  slug: string;
  name: string;
  description: string;
  indicationCount: number;
  competitorCount: number;
  keyIndications: string[];
}

export const THERAPEUTIC_AREAS: TAMetadata[] = [
  {
    slug: 'oncology',
    name: 'Oncology',
    description:
      'Solid tumors, hematologic malignancies, and immuno-oncology across all lines of therapy and modalities.',
    indicationCount: 49,
    competitorCount: 420,
    keyIndications: ['NSCLC', 'Breast Cancer', 'AML', 'Melanoma', 'Pancreatic Cancer', 'CRC'],
  },
  {
    slug: 'neurology',
    name: 'Neurology',
    description:
      'Neurodegenerative diseases, movement disorders, epilepsy, and neuromuscular conditions spanning CNS and PNS.',
    indicationCount: 26,
    competitorCount: 180,
    keyIndications: ["Alzheimer's Disease", "Parkinson's Disease", 'ALS', 'Epilepsy', 'Multiple Sclerosis'],
  },
  {
    slug: 'immunology',
    name: 'Immunology',
    description:
      'Autoimmune and inflammatory conditions including rheumatology, dermatologic, and systemic immune-mediated diseases.',
    indicationCount: 17,
    competitorCount: 190,
    keyIndications: ['Rheumatoid Arthritis', 'Lupus (SLE)', 'Psoriasis', 'Atopic Dermatitis', 'IBD'],
  },
  {
    slug: 'rare_disease',
    name: 'Rare Disease',
    description: 'Orphan indications across genetic, metabolic, and ultra-rare conditions with significant unmet need.',
    indicationCount: 29,
    competitorCount: 150,
    keyIndications: ['SMA', 'DMD', "Huntington's", 'Fabry Disease', 'PKU'],
  },
  {
    slug: 'cardiovascular',
    name: 'Cardiovascular',
    description: 'Heart failure, atherosclerosis, hypertension, and cardiometabolic conditions.',
    indicationCount: 14,
    competitorCount: 120,
    keyIndications: ['Heart Failure', 'Hypertension', 'PAH', 'Atrial Fibrillation'],
  },
  {
    slug: 'metabolic',
    name: 'Metabolic',
    description:
      'Obesity, diabetes, NASH/MASH, and lipid disorders including GLP-1 and next-generation metabolic targets.',
    indicationCount: 9,
    competitorCount: 110,
    keyIndications: ['Type 2 Diabetes', 'Obesity', 'NASH/MASH', 'Dyslipidemia'],
  },
  {
    slug: 'psychiatry',
    name: 'Psychiatry',
    description:
      'Mood disorders, psychotic disorders, ADHD, substance use, and emerging psychedelic-assisted therapies.',
    indicationCount: 11,
    competitorCount: 90,
    keyIndications: ['Major Depression', 'Schizophrenia', 'PTSD', 'ADHD', 'Bipolar Disorder'],
  },
  {
    slug: 'infectious_disease',
    name: 'Infectious Disease',
    description: 'Antiviral, antibacterial, antifungal, and vaccine programs including pandemic preparedness.',
    indicationCount: 12,
    competitorCount: 130,
    keyIndications: ['HIV', 'RSV', 'Hepatitis B', 'C. difficile', 'Influenza'],
  },
  {
    slug: 'hematology',
    name: 'Hematology',
    description: 'Non-malignant blood disorders including hemophilia, sickle cell disease, thalassemia, and ITP.',
    indicationCount: 10,
    competitorCount: 80,
    keyIndications: ['Sickle Cell Disease', 'Hemophilia A/B', 'ITP', 'Thalassemia'],
  },
  {
    slug: 'ophthalmology',
    name: 'Ophthalmology',
    description: 'Retinal diseases, glaucoma, dry eye, and gene therapies for inherited retinal dystrophies.',
    indicationCount: 8,
    competitorCount: 70,
    keyIndications: ['Wet AMD', 'DME', 'Dry Eye', 'Glaucoma', 'Geographic Atrophy'],
  },
  {
    slug: 'pulmonology',
    name: 'Pulmonology',
    description: 'Respiratory conditions including asthma, COPD, IPF, and cystic fibrosis.',
    indicationCount: 7,
    competitorCount: 85,
    keyIndications: ['Asthma', 'COPD', 'IPF', 'Cystic Fibrosis'],
  },
  {
    slug: 'nephrology',
    name: 'Nephrology',
    description: 'Chronic kidney disease, IgA nephropathy, FSGS, and dialysis-related conditions.',
    indicationCount: 6,
    competitorCount: 50,
    keyIndications: ['CKD', 'IgA Nephropathy', 'FSGS', 'PKD'],
  },
  {
    slug: 'dermatology',
    name: 'Dermatology',
    description: 'Inflammatory and oncologic skin conditions, alopecia, and aesthetic dermatology.',
    indicationCount: 8,
    competitorCount: 95,
    keyIndications: ['Atopic Dermatitis', 'Psoriasis', 'Alopecia Areata', 'Vitiligo', 'Acne'],
  },
  {
    slug: 'gastroenterology',
    name: 'Gastroenterology',
    description: 'IBD, IBS, celiac disease, and GI oncology including esophageal and gastric cancers.',
    indicationCount: 9,
    competitorCount: 75,
    keyIndications: ["Crohn's Disease", 'Ulcerative Colitis', 'IBS', 'Celiac Disease'],
  },
  {
    slug: 'endocrinology',
    name: 'Endocrinology',
    description: 'Thyroid disorders, growth hormone deficiency, adrenal insufficiency, and hypoparathyroidism.',
    indicationCount: 5,
    competitorCount: 40,
    keyIndications: ['Hypothyroidism', 'Growth Hormone Deficiency', 'Hypoparathyroidism'],
  },
  {
    slug: 'pain_management',
    name: 'Pain Management',
    description: 'Chronic pain, neuropathic pain, migraine, and non-opioid analgesic programs.',
    indicationCount: 7,
    competitorCount: 60,
    keyIndications: ['Migraine', 'Neuropathic Pain', 'Chronic Low Back Pain', 'Fibromyalgia'],
  },
  {
    slug: 'urology',
    name: 'Urology',
    description: 'BPH, overactive bladder, erectile dysfunction, and urologic oncology.',
    indicationCount: 5,
    competitorCount: 45,
    keyIndications: ['BPH', 'Overactive Bladder', 'Prostate Cancer'],
  },
  {
    slug: 'hepatology',
    name: 'Hepatology',
    description: 'Liver diseases including hepatitis B cure programs, PBC, PSC, and hepatocellular carcinoma.',
    indicationCount: 5,
    competitorCount: 55,
    keyIndications: ['Hepatitis B', 'PBC', 'PSC', 'HCC'],
  },
];

export function getTABySlug(slug: string): TAMetadata | undefined {
  return THERAPEUTIC_AREAS.find((ta) => ta.slug === slug);
}
