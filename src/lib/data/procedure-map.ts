// ============================================================
// TERRAIN — Procedure & Device Market Database
// lib/data/procedure-map.ts
//
// The device/diagnostics equivalent of indication-map.ts
// Claude Code: Expand to 100+ procedures following this pattern
//
// Sources: CMS claims data, AHA Annual Survey, Definitive Healthcare,
// MedPAC data books, published surgical society statistics
// ============================================================

import type { ProcedureData } from '@/types/devices-diagnostics';

export const PROCEDURE_DATA: ProcedureData[] = [

  // ──────────────────────────────────────────────────────────
  // CARDIOVASCULAR DEVICES
  // ──────────────────────────────────────────────────────────

  {
    name: 'Transcatheter Aortic Valve Replacement',
    synonyms: ['TAVR', 'TAVI', 'transcatheter aortic valve implantation', 'aortic valve replacement minimally invasive'],
    cpt_codes: ['33361', '33362', '33363', '33364', '33365', '33366'],
    drg_codes: ['266', '267'],
    device_category: 'cardiovascular',
    us_annual_procedures: 110000,
    us_procedure_growth_rate: 8.5,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient'],
    eligible_sites: { hospitals: 850, ascs: 0, clinics: 0 },
    performing_specialty: ['Interventional Cardiology', 'Cardiac Surgery'],
    adoption_barrier: 'moderate',
    procedure_source: 'TVT Registry / STS-ACC 2024; CMS Medicare data',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 32000,
      medicare_physician_rate: 1500,
      private_payer_coverage: 'Commercial coverage established. Prior authorization common. Evidence-based criteria (STS/ACC appropriate use).',
    },
    major_device_competitors: ['Edwards Sapien 3 (Edwards)', 'Evolut (Medtronic)', 'Acurate (Boston Scientific)', 'Myval (Meril Life)'],
    market_leader: 'Edwards Lifesciences (Sapien platform)',
    market_leader_share_pct: 48,
    current_standard_of_care: 'SAVR (surgical AVR) for younger, low-risk patients; TAVR has become standard for most patients, including low-risk since 2019',
    cagr_5yr: 8.5,
    growth_driver: 'Expanding to younger, lower-risk patients; borderline indication patients; aortic regurgitation indication',
  },

  {
    name: 'Cardiac Ablation for Atrial Fibrillation',
    synonyms: ['AF ablation', 'AFib ablation', 'pulmonary vein isolation', 'PVI', 'catheter ablation afib', 'pulsed field ablation'],
    cpt_codes: ['93656', '93657', '93750'],
    drg_codes: ['247', '248'],
    device_category: 'cardiovascular',
    us_annual_procedures: 250000,
    us_procedure_growth_rate: 12.0,
    procedure_setting: ['hospital_outpatient', 'hospital_inpatient'],
    eligible_sites: { hospitals: 1200, ascs: 50 },
    performing_specialty: ['Cardiac Electrophysiology'],
    adoption_barrier: 'moderate',
    procedure_source: 'AHA Heart Disease Statistics 2024; EP Lab Digest',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 18000,
      medicare_physician_rate: 3200,
      private_payer_coverage: 'Covered after antiarrhythmic drug failure. Pulsed field ablation gaining coverage.',
    },
    major_device_competitors: [
      'Thermocool SmartTouch (Biosense Webster/J&J)',
      'Arctic Front Advance (Medtronic)',
      'Farapulse (Boston Scientific)',
      'Heliostar (Medtronic, balloon)',
    ],
    market_leader: 'Biosense Webster (J&J MedTech)',
    market_leader_share_pct: 42,
    current_standard_of_care: 'Radiofrequency ablation (RF) dominant; cryoablation ~25% share; pulsed field ablation (PFA) rapidly gaining post-FDA clearance',
    cagr_5yr: 12.0,
    growth_driver: 'PFA technology driving procedure growth, earlier treatment, less repeat procedures, expansion to persistent AFib',
  },

  {
    name: 'Coronary Stent Implantation',
    synonyms: ['PCI', 'percutaneous coronary intervention', 'coronary stenting', 'drug-eluting stent', 'DES implantation'],
    cpt_codes: ['92928', '92929', '92933', '92934'],
    drg_codes: ['247', '248', '251', '252'],
    device_category: 'cardiovascular',
    us_annual_procedures: 650000,
    us_procedure_growth_rate: 1.5,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient'],
    eligible_sites: { hospitals: 1800 },
    performing_specialty: ['Interventional Cardiology'],
    adoption_barrier: 'low',
    procedure_source: 'NCDR CathPCI Registry 2024; AHA Statistics',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 12000,
      medicare_physician_rate: 800,
      private_payer_coverage: 'Universal coverage; prior auth for elective procedures',
    },
    major_device_competitors: [
      'Xience (Abbott)',
      'Synergy (Boston Scientific)',
      'Resolute Onyx (Medtronic)',
      'Ultimaster (Terumo)',
      'Orsiro (Biotronik)',
    ],
    market_leader: 'Abbott (Xience platform)',
    market_leader_share_pct: 35,
    current_standard_of_care: 'Drug-eluting stents (DES) gold standard. Bioresorbable scaffolds had setbacks; thin-strut DES dominant.',
    cagr_5yr: 2.0,
    growth_driver: 'Modest growth; mature market. Innovation in thin-strut design, polymer-free platforms, and chronic total occlusion (CTO) stenting',
  },

  // ──────────────────────────────────────────────────────────
  // ORTHOPEDIC DEVICES
  // ──────────────────────────────────────────────────────────

  {
    name: 'Total Knee Replacement',
    synonyms: ['TKA', 'total knee arthroplasty', 'knee replacement', 'TKR', 'primary knee replacement'],
    cpt_codes: ['27447'],
    drg_codes: ['470', '469'],
    device_category: 'orthopedic',
    us_annual_procedures: 1030000,
    us_procedure_growth_rate: 4.2,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient', 'asc'],
    eligible_sites: { hospitals: 3200, ascs: 1800 },
    performing_specialty: ['Orthopedic Surgery'],
    adoption_barrier: 'low',
    procedure_source: 'AJRR (American Joint Replacement Registry) 2024; CMS MEDPAR',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 12000,
      medicare_physician_rate: 1400,
      private_payer_coverage: 'Universal commercial coverage. ASC-setting coverage expanding post-2020 CMS rule change.',
    },
    major_device_competitors: [
      'Triathlon (Stryker)',
      'Attune (DePuy Synthes/J&J)',
      'Vanguard (Zimmer Biomet)',
      'Journey II (Smith+Nephew)',
      'Persona (Zimmer Biomet)',
    ],
    market_leader: 'Zimmer Biomet + Stryker (~60% combined)',
    market_leader_share_pct: 30,
    current_standard_of_care: 'Cemented TKA with fixed-bearing or mobile-bearing implants. Robotic-assisted growing rapidly (~25% of procedures).',
    cagr_5yr: 4.2,
    growth_driver: 'Aging population, obesity epidemic, ASC shift, robotic surgery adoption (Mako, Rosa, CORI)',
  },

  {
    name: 'Total Hip Replacement',
    synonyms: ['THA', 'total hip arthroplasty', 'hip replacement', 'THR', 'primary hip replacement'],
    cpt_codes: ['27130'],
    drg_codes: ['470', '469'],
    device_category: 'orthopedic',
    us_annual_procedures: 750000,
    us_procedure_growth_rate: 3.8,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient', 'asc'],
    eligible_sites: { hospitals: 3000, ascs: 1200 },
    performing_specialty: ['Orthopedic Surgery'],
    adoption_barrier: 'low',
    procedure_source: 'AJRR 2024; CMS MEDPAR data',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 11500,
      medicare_physician_rate: 1300,
      private_payer_coverage: 'Universal commercial coverage.',
    },
    major_device_competitors: [
      'Trident/Secur-Fit (Stryker)',
      'Pinnacle (DePuy Synthes)',
      'Continuum (Zimmer Biomet)',
      'Redapt (Smith+Nephew)',
    ],
    market_leader: 'Stryker',
    market_leader_share_pct: 28,
    current_standard_of_care: 'Cementless fixation dominant. Highly cross-linked polyethylene liner. Ceramic femoral head growing.',
    cagr_5yr: 3.8,
    growth_driver: 'Aging demographics, obesity, ASC migration, improved implant longevity enabling younger patients',
  },

  {
    name: 'Spinal Fusion',
    synonyms: ['vertebral fusion', 'ACDF', 'TLIF', 'PLIF', 'lumbar fusion', 'cervical fusion', 'spine surgery'],
    cpt_codes: ['22612', '22630', '22551', '22552', '22845', '22846'],
    drg_codes: ['459', '460', '473', '474'],
    device_category: 'orthopedic',
    us_annual_procedures: 600000,
    us_procedure_growth_rate: 2.5,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient', 'asc'],
    eligible_sites: { hospitals: 3500, ascs: 2000 },
    performing_specialty: ['Orthopedic Surgery', 'Neurosurgery'],
    adoption_barrier: 'moderate',
    procedure_source: 'NIS/HCUP 2024; North American Spine Society (NASS)',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 18000,
      medicare_physician_rate: 1800,
      private_payer_coverage: 'Coverage with clinical criteria; conservative treatment failure required. Vary by level and approach.',
    },
    major_device_competitors: [
      'Medtronic (largest share)',
      'DePuy Synthes Spine (J&J)',
      'Stryker Spine (K2M)',
      'Globus Medical',
      'NuVasive (Globus)',
      'Alphatec',
    ],
    market_leader: 'Medtronic Spine',
    market_leader_share_pct: 25,
    current_standard_of_care: 'Pedicle screw fixation + interbody cage. ACDF for cervical. LLIF/TLIF for lumbar. Robotic guidance growing.',
    cagr_5yr: 2.5,
    growth_driver: 'Aging population, minimally invasive approaches (MIS), robotic-assisted spine surgery, expandable cages',
  },

  // ──────────────────────────────────────────────────────────
  // DIABETES / METABOLIC
  // ──────────────────────────────────────────────────────────

  {
    name: 'Continuous Glucose Monitor (CGM)',
    synonyms: ['CGM', 'continuous glucose monitoring', 'real-time CGM', 'flash glucose monitoring', 'FGM'],
    cpt_codes: ['95250', '95251', '99453', '99454'],
    drg_codes: [],
    device_category: 'diabetes_metabolic',
    us_annual_procedures: 4200000,  // Active CGM users (patient-years)
    us_procedure_growth_rate: 18.0,
    procedure_setting: ['home', 'office'],
    eligible_sites: { hospitals: 0, ascs: 0, clinics: 8000 },
    performing_specialty: ['Endocrinology', 'Primary Care', 'Diabetes Education'],
    adoption_barrier: 'low',
    procedure_source: 'Dexcom / Abbott investor presentations; ADA 2024',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_physician_rate: 120,    // Monthly (supply cost covered by durable medical equipment benefit)
      private_payer_coverage: 'Medicare covers for insulin-treated diabetes. Commercial coverage broad for T1D; expanding rapidly for T2D. 2023 ADA guidance supports T2D CGM.',
    },
    major_device_competitors: [
      'Dexcom G7',
      'FreeStyle Libre 3 (Abbott)',
      'Eversense E3 (Senseonics, 6-month implantable)',
      'Guardian 4 (Medtronic)',
    ],
    market_leader: 'Dexcom + Abbott (combined ~85% market)',
    market_leader_share_pct: 42,
    current_standard_of_care: 'Real-time CGM replacing fingerstick testing for insulin-treated diabetes. Patch design (14-day wear) dominant.',
    cagr_5yr: 18.0,
    growth_driver: 'Type 2 diabetes expansion (massive untreated population), closed-loop insulin delivery systems, remote patient monitoring reimbursement',
  },

  {
    name: 'Insulin Pump Therapy',
    synonyms: ['insulin pump', 'CSII', 'continuous subcutaneous insulin infusion', 'AID system', 'automated insulin delivery', 'closed loop'],
    cpt_codes: ['E0784'],
    drg_codes: [],
    device_category: 'diabetes_metabolic',
    us_annual_procedures: 600000,  // Active pump users
    us_procedure_growth_rate: 8.0,
    procedure_setting: ['home', 'office'],
    eligible_sites: { hospitals: 0, clinics: 3000 },
    performing_specialty: ['Endocrinology', 'Diabetes Care'],
    adoption_barrier: 'moderate',
    procedure_source: 'Insulet / Tandem investor presentations; ATTD Conference 2024',
    reimbursement: {
      cms_coverage: 'covered',
      private_payer_coverage: 'Commercial coverage for T1D broad. T2D coverage improving. AID systems (hybrid closed loop) gaining coverage.',
    },
    major_device_competitors: [
      'Omnipod 5 (Insulet) — tubeless AID',
      'Control-IQ (Tandem) — tubed AID',
      'MiniMed 780G (Medtronic)',
    ],
    market_leader: 'Insulet (Omnipod platform)',
    market_leader_share_pct: 38,
    current_standard_of_care: 'Automated insulin delivery (AID/hybrid closed loop) becoming standard over traditional pump therapy',
    cagr_5yr: 8.0,
    growth_driver: 'AID system adoption, tubeless design expansion, Type 2 indication expansion, pediatric use',
  },

  // ──────────────────────────────────────────────────────────
  // ONCOLOGY — SURGICAL / ROBOTIC
  // ──────────────────────────────────────────────────────────

  {
    name: 'Robotic-Assisted Radical Prostatectomy',
    synonyms: ['RARP', 'robotic prostatectomy', 'da Vinci prostatectomy', 'laparoscopic radical prostatectomy'],
    cpt_codes: ['55866', '55840', '55845'],
    drg_codes: ['710', '711', '712'],
    device_category: 'oncology_surgical',
    us_annual_procedures: 120000,
    us_procedure_growth_rate: 3.5,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient', 'asc'],
    eligible_sites: { hospitals: 3000, ascs: 200 },
    performing_specialty: ['Urology'],
    adoption_barrier: 'low',
    procedure_source: 'AUA Data 2024; SEER prostate cancer treatment patterns',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 11000,
      medicare_physician_rate: 1800,
      private_payer_coverage: 'Universal commercial coverage. Robotic approach not separately reimbursed but accepted.',
    },
    major_device_competitors: [
      'da Vinci (Intuitive Surgical) — dominant',
      'Hugo RAS (Medtronic) — emerging',
      'Ion (Intuitive) — for lung biopsy',
      'Versius (CMR Surgical) — EU/emerging markets',
    ],
    market_leader: 'Intuitive Surgical (da Vinci)',
    market_leader_share_pct: 82,
    current_standard_of_care: 'Robotic-assisted (RARP) is now standard; >85% of prostatectomies are robot-assisted',
    cagr_5yr: 3.5,
    growth_driver: 'Expanded robotic systems, SP (single port) adoption, bladder and kidney procedures, competitive robotic entry',
  },

  // ──────────────────────────────────────────────────────────
  // DIAGNOSTICS — IVD / ONCOLOGY
  // ──────────────────────────────────────────────────────────

  {
    name: 'Next-Generation Sequencing Oncology Panel',
    synonyms: ['NGS tumor profiling', 'comprehensive genomic profiling', 'CGP', 'tumor sequencing', 'solid tumor NGS', 'liquid biopsy NGS'],
    cpt_codes: ['81445', '81455', '81479', '0242U', '0244U'],
    drg_codes: [],
    device_category: 'ivd_oncology',
    us_annual_procedures: 800000,
    us_procedure_growth_rate: 22.0,
    procedure_setting: ['lab'],
    eligible_sites: { labs: 200, hospitals: 500 },
    performing_specialty: ['Medical Oncology', 'Pathology', 'Molecular Pathology'],
    adoption_barrier: 'moderate',
    procedure_source: 'NCCN Guidelines Biomarker Testing; Foundation Medicine data 2024',
    reimbursement: {
      cms_coverage: 'partial',
      medicare_facility_rate: 600,     // Tissue NGS panel; liquid biopsy varies
      private_payer_coverage: 'Highly variable. Foundation Medicine F1CDx covered by Medicare when ordered for FDA-approved CDx indication. Broader CGP coverage varies by payer. Most major commercial payers now cover for approved indications (NSCLC, breast, colorectal, ovarian).',
    },
    major_device_competitors: [
      'FoundationOne CDx (Roche/Foundation Medicine)',
      'Guardant360 CDx (Guardant Health)',
      'Tempus xT (Tempus)',
      'Caris MI Profile (Caris Life Sciences)',
      'OncotypeDX (Exact Sciences)',
    ],
    market_leader: 'Roche / Foundation Medicine',
    market_leader_share_pct: 30,
    current_standard_of_care: 'NCCN recommends broad molecular profiling for NSCLC, colorectal, ovarian, and other solid tumors. Liquid biopsy gaining traction for monitoring and when tissue unavailable.',
    cagr_5yr: 22.0,
    growth_driver: 'NCCN guideline expansion, CDx approvals requiring testing, liquid biopsy adoption, Medicare coverage expansion, MRD monitoring',
  },

  {
    name: 'Liquid Biopsy for Cancer Detection',
    synonyms: ['ctDNA testing', 'circulating tumor DNA', 'cell-free DNA', 'cfDNA cancer test', 'Galleri', 'multi-cancer early detection'],
    cpt_codes: ['0242U', '81479', '81503'],
    drg_codes: [],
    device_category: 'ivd_oncology',
    us_annual_procedures: 500000,
    us_procedure_growth_rate: 45.0,
    procedure_setting: ['lab', 'office'],
    eligible_sites: { hospitals: 0, labs: 100, clinics: 10000 },
    performing_specialty: ['Primary Care', 'Medical Oncology', 'Internal Medicine'],
    adoption_barrier: 'high',   // Reimbursement still being established
    procedure_source: 'Grail / Guardant investor data 2024; CMS Coverage Analysis',
    reimbursement: {
      cms_coverage: 'unlisted',  // CMS has not yet established national coverage for MCED
      private_payer_coverage: 'Mostly not covered. CMS proposed coverage determination for Galleri ongoing. Individual payer pilots. Self-pay at $950-$1,200. Critical regulatory/coverage milestone for market growth.',
    },
    major_device_competitors: [
      'Galleri (Grail/Illumina)',
      'Shield (Guardant Health) — CRC screening; FDA approved',
      'CancerSEEK (Johns Hopkins, Exact Sciences)',
      'Signatera (Natera) — MRD monitoring',
      'Cobas ctDNA (Roche)',
    ],
    market_leader: 'Grail (Galleri) for MCED; Guardant for therapy monitoring',
    market_leader_share_pct: 35,
    current_standard_of_care: 'Emerging — not yet standard of care for screening. MRD monitoring (post-treatment) gaining adoption. CRC blood test (Shield) first FDA-approved blood-based cancer screening test (2024).',
    cagr_5yr: 45.0,
    growth_driver: 'CMS national coverage decision for MCED, CRC blood test expansion, MRD-guided treatment decisions, early cancer interception opportunity',
  },

  // ──────────────────────────────────────────────────────────
  // NEUROLOGY DEVICES
  // ──────────────────────────────────────────────────────────

  {
    name: 'Deep Brain Stimulation',
    synonyms: ["DBS", "deep brain stimulation", "subthalamic nucleus stimulation", "DBS for Parkinson's"],
    cpt_codes: ['61863', '61864', '61885', '61886', '95970', '95971'],
    drg_codes: ['040', '041', '042'],
    device_category: 'neurology',
    us_annual_procedures: 16000,
    us_procedure_growth_rate: 6.0,
    procedure_setting: ['hospital_inpatient'],
    eligible_sites: { hospitals: 350 },
    performing_specialty: ['Neurosurgery', 'Neurology'],
    adoption_barrier: 'high',
    procedure_source: 'Medtronic/Abbott DBS commercial data; published registry data',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 28000,
      medicare_physician_rate: 3500,
      private_payer_coverage: "Coverage for Parkinson's disease broad; expanding to Essential Tremor, OCD, epilepsy. Prior auth required.",
    },
    major_device_competitors: [
      "Percept PC (Medtronic) — sensing + stimulation",
      "Infinity DBS (Abbott)",
      "Vercise (Boston Scientific)",
      "Clarise (Nalu Medical) — emerging",
    ],
    market_leader: 'Medtronic',
    market_leader_share_pct: 55,
    current_standard_of_care: "DBS for Parkinson's (STN or GPi targets). Closed-loop (sensing) systems emerging as next-gen.",
    cagr_5yr: 6.0,
    growth_driver: 'Expanded indications (depression, OCD, Alzheimer pilot, epilepsy), closed-loop adaptive DBS, directional leads, rechargeable IPG',
  },

  // ──────────────────────────────────────────────────────────
  // OPHTHALMOLOGY
  // ──────────────────────────────────────────────────────────

  {
    name: 'Cataract Surgery with IOL Implantation',
    synonyms: ['phacoemulsification', 'cataract removal', 'IOL implant', 'intraocular lens', 'LASIK'],
    cpt_codes: ['66984', '66982', '66985'],
    drg_codes: [],
    device_category: 'ophthalmology',
    us_annual_procedures: 4000000,
    us_procedure_growth_rate: 3.5,
    procedure_setting: ['asc', 'hospital_outpatient'],
    eligible_sites: { ascs: 6000, hospitals: 2000 },
    performing_specialty: ['Ophthalmology'],
    adoption_barrier: 'low',
    procedure_source: 'AAO Market Study 2024; CMS Procedure Data',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 1200,
      medicare_physician_rate: 750,
      private_payer_coverage: 'Universal coverage. Premium IOLs (multifocal, extended depth of focus) are patient out-of-pocket.',
    },
    major_device_competitors: [
      'Alcon (Centurion phaco + AcrySof IOL)',
      'Johnson & Johnson Vision (TECNIS)',
      'Bausch & Lomb (Stellaris + enVista)',
      'Rayner (UK)',
    ],
    market_leader: 'Alcon',
    market_leader_share_pct: 42,
    current_standard_of_care: 'Phacoemulsification with foldable hydrophilic or hydrophobic acrylic IOL. Premium IOLs (EDOF, toric) growing.',
    cagr_5yr: 3.5,
    growth_driver: 'Aging population, premium IOL adoption, femtosecond laser-assisted cataract surgery, light-adjustable lens',
  },

  {
    name: 'Anti-VEGF Intravitreal Injection',
    synonyms: ['intravitreal injection', 'anti-VEGF injection', 'Eylea injection', 'Avastin injection', 'Lucentis injection', 'Vabysmo injection'],
    cpt_codes: ['67028'],
    drg_codes: [],
    device_category: 'ophthalmology',
    us_annual_procedures: 9000000,
    us_procedure_growth_rate: 6.0,
    procedure_setting: ['office', 'hospital_outpatient'],
    eligible_sites: { clinics: 8000, hospitals: 500 },
    performing_specialty: ['Retina Specialist', 'Ophthalmology'],
    adoption_barrier: 'low',
    procedure_source: 'Regeneron investor data; CMS Part B Drug Spending 2024',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_physician_rate: 80,     // Procedure fee; drug reimbursed separately (ASP + 6%)
      private_payer_coverage: 'Universal coverage. Drug cost is primary cost driver (ASP-based Medicare reimbursement).',
    },
    major_device_competitors: [
      'Eylea 2mg (Regeneron) — market leader',
      'Eylea HD 8mg (Regeneron)',
      'Vabysmo (Roche)',
      'Lucentis/biosimilars (Genentech/Novartis)',
      'Beovu (Novartis)',
    ],
    market_leader: 'Regeneron (Eylea)',
    market_leader_share_pct: 50,
    current_standard_of_care: 'Monthly to quarterly intravitreal injections for nAMD, DME, RVO. Extended dosing intervals (Eylea HD, Vabysmo) driving toward quarterly/biannual dosing.',
    cagr_5yr: 6.0,
    growth_driver: 'Extended dosing intervals reducing injection burden, geographic atrophy new treatment market, port delivery system avoiding injections',
  },

  // ──────────────────────────────────────────────────────────
  // WOUND CARE
  // ──────────────────────────────────────────────────────────

  {
    name: 'Negative Pressure Wound Therapy',
    synonyms: ['NPWT', 'VAC therapy', 'wound VAC', 'negative pressure therapy', 'KCI NPWT'],
    cpt_codes: ['97605', '97606', 'E2402'],
    drg_codes: [],
    device_category: 'wound_care',
    us_annual_procedures: 1500000,
    us_procedure_growth_rate: 5.0,
    procedure_setting: ['hospital_inpatient', 'hospital_outpatient', 'home'],
    eligible_sites: { hospitals: 4500, clinics: 2000 },
    performing_specialty: ['Wound Care', 'General Surgery', 'Plastic Surgery', 'Orthopedics'],
    adoption_barrier: 'low',
    procedure_source: 'CMS Wound Care Data 2024; 3M / KCI market data',
    reimbursement: {
      cms_coverage: 'covered',
      medicare_facility_rate: 800,     // per week (rental model)
      private_payer_coverage: 'Broadly covered. Rental model; DME benefit for home use.',
    },
    major_device_competitors: [
      'Prevena/ActiV.A.C. (3M/KCI)',
      'AVANCE (Mölnlycke)',
      'Renasys (Smith+Nephew)',
      'Snap (Acelity/3M)',
    ],
    market_leader: '3M (KCI)',
    market_leader_share_pct: 60,
    current_standard_of_care: 'Standard of care for complex wounds, diabetic foot ulcers, post-surgical. Disposable single-use NPWT devices growing.',
    cagr_5yr: 5.0,
    growth_driver: 'Diabetic population growth, single-use disposable NPWT, closed incision NPWT (surgical prophylaxis), home use expansion',
  },

];

// ────────────────────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────────────────────

export function findProcedureByName(name: string): ProcedureData | undefined {
  const q = name.toLowerCase().trim();
  return PROCEDURE_DATA.find(p =>
    p.name.toLowerCase() === q ||
    p.synonyms.some(s => s.toLowerCase() === q || s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))
  );
}

export function getProcedureSuggestions(query: string): ProcedureData[] {
  if (!query || query.length < 2) return PROCEDURE_DATA.slice(0, 10);
  const q = query.toLowerCase();
  return PROCEDURE_DATA.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.synonyms.some(s => s.toLowerCase().includes(q)) ||
    p.device_category.includes(q)
  ).slice(0, 10);
}

export function getProceduresByCategory(category: ProcedureData['device_category']): ProcedureData[] {
  return PROCEDURE_DATA.filter(p => p.device_category === category);
}

/*
  ────────────────────────────────────────────────────────────
  NOTE TO CLAUDE CODE: Expand to 100+ procedures covering:

  CARDIOVASCULAR (additional):
  - Leadless Pacemaker Implantation (Micra, EV-ICD)
  - Subcutaneous ICD (S-ICD) Implantation
  - Transcatheter Mitral/Tricuspid Valve Repair (MitraClip, CLASP)
  - Left Atrial Appendage Closure (Watchman)
  - TEER (Transcatheter Edge-to-Edge Repair)
  - Coronary Artery Bypass Graft (CABG)
  - Peripheral Vascular Stenting (PAD)
  - Carotid Artery Stenting
  - Renal Denervation (Spyral)
  - Left Ventricular Assist Device (LVAD)

  ORTHOPEDIC (additional):
  - Reverse Shoulder Arthroplasty
  - Ankle Replacement
  - Rotator Cuff Repair with Biologic Augmentation
  - Vertebral Compression Fracture (Kyphoplasty)
  - Bone Graft Substitutes

  NEUROLOGY (additional):
  - Vagus Nerve Stimulation (VNS)
  - Spinal Cord Stimulation (SCS)
  - Transcranial Magnetic Stimulation (TMS)
  - Responsive Neurostimulation (RNS)
  - Focused Ultrasound Thalamotomy

  GENERAL SURGERY / GI:
  - Laparoscopic Cholecystectomy
  - Endoscopic Sleeve Gastroplasty
  - Roux-en-Y Gastric Bypass (RYGB)
  - Endoscopic Mucosal Resection (EMR)
  - Endoscopic Submucosal Dissection (ESD)
  - Barrett's Ablation (Radiofrequency)
  - ERCP + Stenting

  DIAGNOSTICS:
  - Minimal Residual Disease (MRD) Testing
  - HER2 IHC/FISH Testing
  - PD-L1 IHC Testing
  - BRCA1/2 Germline Testing
  - Cardiac Troponin POC Testing
  - HbA1c POC Testing
  - Sepsis Blood Culture + Rapid ID
  - Digital Pathology AI-Assisted Reading
  
  For each: use published CMS procedure data + device company
  investor presentations as primary sources.
  ────────────────────────────────────────────────────────────
*/
