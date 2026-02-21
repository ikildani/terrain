// ============================================================
// TERRAIN — Device & Diagnostics Indication/Procedure Data
// lib/data/device-indications.ts
//
// Extends indication-map.ts for device and diagnostic contexts.
// Unlike pharma which is patient-based, devices are often
// procedure-volume based. Both are captured here.
// ============================================================

import type { ProductCategory } from '@/types/devices-diagnostics';

// ────────────────────────────────────────────────────────────
// PROCEDURE VOLUME DATA
// Source: CMS Procedure Volume Statistics, AHA Annual Survey,
// Specialty society registries (ACC, STS, AAOS, etc.)
// ────────────────────────────────────────────────────────────

export interface ProcedureVolumeData {
  procedure_name: string;
  cpt_codes: string[];
  annual_us_procedures: number;
  procedure_growth_rate: number;         // % CAGR
  applicable_indications: string[];
  applicable_device_categories: ProductCategory[];
  current_standard_of_care: string;
  new_device_eligible_procedures: number; // Subset addressable by new technology
  adoption_curve: 'rapid' | 'moderate' | 'slow';
  site_of_care: 'inpatient' | 'outpatient' | 'office' | 'home' | 'lab';
  physician_specialty: string[];
  source: string;
  last_updated: string;
}

export const PROCEDURE_VOLUME_DATA: ProcedureVolumeData[] = [

  // ──────────────────────────────────────────
  // CARDIAC / CARDIOVASCULAR
  // ──────────────────────────────────────────
  {
    procedure_name: 'Transcatheter Aortic Valve Replacement (TAVR)',
    cpt_codes: ['33361', '33362', '33363', '33364', '33365', '33366'],
    annual_us_procedures: 110000,
    procedure_growth_rate: 8.5,
    applicable_indications: ['Aortic Stenosis', 'TAVR', 'structural heart disease'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Open surgical aortic valve replacement (SAVR) or TAVR (Edwards, Medtronic)',
    new_device_eligible_procedures: 25000,   // Share of procedures where new valve could compete
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Interventional Cardiology', 'Cardiac Surgery'],
    source: 'TVT Registry / STS TAVR Database 2024',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Percutaneous Coronary Intervention (PCI)',
    cpt_codes: ['92920', '92921', '92924', '92925', '92928', '92929'],
    annual_us_procedures: 650000,
    procedure_growth_rate: 3.2,
    applicable_indications: ['Coronary Artery Disease', 'STEMI', 'NSTEMI', 'stable angina'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Drug-eluting stents (Abbott, Medtronic, Boston Scientific)',
    new_device_eligible_procedures: 80000,
    adoption_curve: 'slow',              // Established market; innovation incremental
    site_of_care: 'inpatient',
    physician_specialty: ['Interventional Cardiology'],
    source: 'CathPCI Registry / NCDR 2024; CMS Physician Supplier Procedure Summary',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Atrial Fibrillation Ablation (Catheter)',
    cpt_codes: ['93656', '93657'],
    annual_us_procedures: 210000,
    procedure_growth_rate: 9.8,
    applicable_indications: ['Atrial Fibrillation', 'AFib', 'supraventricular tachycardia'],
    applicable_device_categories: ['device_surgical'],
    current_standard_of_care: 'Radiofrequency ablation (Abbott, Biosense Webster); Cryoablation (Medtronic)',
    new_device_eligible_procedures: 60000,
    adoption_curve: 'rapid',             // PFA (pulsed field ablation) entering market
    site_of_care: 'inpatient',
    physician_specialty: ['Electrophysiology', 'Cardiac Surgery'],
    source: 'AFIB Registry / ACC NCDR 2024; CMS Claims Data',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Left Ventricular Assist Device (LVAD) Implant',
    cpt_codes: ['33975', '33976', '33979'],
    annual_us_procedures: 3500,
    procedure_growth_rate: 7.0,
    applicable_indications: ['Heart Failure with Reduced Ejection Fraction', 'Advanced Heart Failure', 'HFrEF'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'HeartMate 3 (Abbott), HVAD (Medtronic, discontinued)',
    new_device_eligible_procedures: 1500,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Cardiac Surgery', 'Heart Failure Cardiology'],
    source: 'INTERMACS Registry 2024; STS Congenital Heart Surgery Database',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Subcutaneous Implantable Cardioverter Defibrillator (S-ICD)',
    cpt_codes: ['33270', '33271'],
    annual_us_procedures: 25000,
    procedure_growth_rate: 12.0,
    applicable_indications: ['Sudden Cardiac Death Prevention', 'Ventricular Tachycardia', 'Ventricular Fibrillation'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Transvenous ICD (Medtronic, Boston Scientific); EMBLEM S-ICD (Boston Scientific)',
    new_device_eligible_procedures: 10000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Electrophysiology'],
    source: 'NCDR ICD Registry 2024',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // ORTHOPEDICS
  // ──────────────────────────────────────────
  {
    procedure_name: 'Total Knee Replacement (TKA)',
    cpt_codes: ['27447'],
    annual_us_procedures: 790000,
    procedure_growth_rate: 5.8,
    applicable_indications: ['Osteoarthritis', 'Knee OA', 'rheumatoid arthritis knee', 'knee replacement'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Zimmer Biomet, Stryker, DePuy Synthes, Smith+Nephew cemented systems',
    new_device_eligible_procedures: 150000,  // Robotic/personalized segment
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Orthopedic Surgery'],
    source: 'American Academy of Orthopaedic Surgeons 2024; CMS MEDPAR',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Total Hip Replacement (THA)',
    cpt_codes: ['27130'],
    annual_us_procedures: 530000,
    procedure_growth_rate: 6.2,
    applicable_indications: ['Hip Osteoarthritis', 'Hip OA', 'femoral neck fracture', 'avascular necrosis hip'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Zimmer Biomet, Stryker, DePuy Synthes, Smith+Nephew',
    new_device_eligible_procedures: 80000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Orthopedic Surgery'],
    source: 'AAOS OrthoInfo 2024; American Joint Replacement Registry (AJRR)',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Spinal Fusion (ACDF + TLIF)',
    cpt_codes: ['22600', '22612', '22630', '22551'],
    annual_us_procedures: 450000,
    procedure_growth_rate: 4.5,
    applicable_indications: ['Degenerative Disc Disease', 'Spinal Stenosis', 'Spondylolisthesis', 'cervical myelopathy'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Cage/fixation systems (Medtronic, Stryker, DePuy Synthes, NuVasive)',
    new_device_eligible_procedures: 90000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Orthopedic Surgery', 'Neurosurgery'],
    source: 'NIS Database 2024; North American Spine Society',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // NEUROSURGERY / CNS DEVICES
  // ──────────────────────────────────────────
  {
    procedure_name: 'Deep Brain Stimulation (DBS) Implant',
    cpt_codes: ['61863', '61864', '61867', '61868', '61880', '61885', '61886'],
    annual_us_procedures: 8000,
    procedure_growth_rate: 6.5,
    applicable_indications: ["Parkinson's Disease", 'Essential Tremor', 'Dystonia', 'OCD', 'Treatment-Resistant Depression'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Medtronic Percept PC, Abbott Infinity, Boston Scientific Vercise',
    new_device_eligible_procedures: 3000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Neurosurgery', 'Neurology (Movement Disorders)'],
    source: 'DBS Think Tank 2024; North American Neuromodulation Society',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Spinal Cord Stimulation (SCS) Implant',
    cpt_codes: ['63650', '63655', '63685', '63688'],
    annual_us_procedures: 55000,
    procedure_growth_rate: 8.0,
    applicable_indications: ['Chronic Pain', 'Failed Back Surgery Syndrome', 'Complex Regional Pain Syndrome', 'Peripheral Vascular Disease'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Medtronic, Abbott (St. Jude), Boston Scientific, Nevro',
    new_device_eligible_procedures: 15000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Pain Management', 'Neurosurgery', 'Anesthesiology'],
    source: 'North American Neuromodulation Society 2024; CMS Claims',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // ONCOLOGY SURGICAL DEVICES
  // ──────────────────────────────────────────
  {
    procedure_name: 'Robotic-Assisted Surgery (Cancer Resection)',
    cpt_codes: ['Various — modifier -22 applied to primary procedure'],
    annual_us_procedures: 1200000,         // All robotic procedures; oncology ~20%
    procedure_growth_rate: 15.0,
    applicable_indications: ['Prostate Cancer', 'Colorectal Cancer', 'Lung Cancer', 'Gynecologic Cancer', 'Gastric Cancer'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'da Vinci Surgical System (Intuitive Surgical) — dominant at 75%+ market share',
    new_device_eligible_procedures: 300000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Urology', 'Gynecologic Oncology', 'Colorectal Surgery', 'Thoracic Surgery'],
    source: 'Intuitive Surgical Annual Report 2024; ACS NSQIP',
    last_updated: '2024-12-01',
  },

  {
    procedure_name: 'Stereotactic Radiosurgery (SRS/SBRT)',
    cpt_codes: ['77371', '77372', '77373'],
    annual_us_procedures: 180000,
    procedure_growth_rate: 9.5,
    applicable_indications: ['Brain Metastases', 'Lung Cancer', 'Prostate Cancer', 'Spinal Metastases', 'AVM'],
    applicable_device_categories: ['device_capital_equipment'],
    current_standard_of_care: 'Gamma Knife (Elekta), CyberKnife (Accuray), LINAC-based (Varian/Siemens)',
    new_device_eligible_procedures: 40000,
    adoption_curve: 'slow',
    site_of_care: 'outpatient',
    physician_specialty: ['Radiation Oncology', 'Neurosurgery'],
    source: 'ASTRO Survey 2024; CMS Medicare Claims Data',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // ENDOSCOPY / GI
  // ──────────────────────────────────────────
  {
    procedure_name: 'Colonoscopy (Screening + Diagnostic)',
    cpt_codes: ['45378', '45380', '45381', '45382', '45385'],
    annual_us_procedures: 19000000,
    procedure_growth_rate: 2.5,
    applicable_indications: ['Colorectal Cancer Screening', 'Colorectal Cancer', 'IBD surveillance', 'Polyp removal'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment', 'diagnostics_ivd'],
    current_standard_of_care: 'Olympus, Fujifilm, HOYA Pentax endoscopy systems; NovaBay AI-assisted detection',
    new_device_eligible_procedures: 2000000,  // AI-enhanced adenoma detection opportunity
    adoption_curve: 'rapid',
    site_of_care: 'outpatient',
    physician_specialty: ['Gastroenterology'],
    source: 'GI Society AGA/ACG 2024; CMS Claims',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // OPHTHALMOLOGY DEVICES
  // ──────────────────────────────────────────
  {
    procedure_name: 'Anti-VEGF Intravitreal Injection',
    cpt_codes: ['67028'],
    annual_us_procedures: 9000000,         // Among highest volume ophthalmic procedures
    procedure_growth_rate: 6.0,
    applicable_indications: ['Neovascular AMD', 'Diabetic Macular Edema', 'Retinal Vein Occlusion', 'DME'],
    applicable_device_categories: ['device_drug_delivery', 'device_implantable'],
    current_standard_of_care: 'Bevacizumab (off-label), ranibizumab, aflibercept, faricimab; Susvimo port delivery (Roche)',
    new_device_eligible_procedures: 3000000,  // Sustained-release delivery devices opportunity
    adoption_curve: 'moderate',
    site_of_care: 'office',
    physician_specialty: ['Retinal Surgery', 'Ophthalmology'],
    source: 'American Academy of Ophthalmology 2024; CMS Part B Summary',
    last_updated: '2024-12-01',
  },

  // ──────────────────────────────────────────
  // DIABETES MONITORING (WEARABLE/CGM)
  // ──────────────────────────────────────────
  {
    procedure_name: 'Continuous Glucose Monitoring (CGM) — Annual',
    cpt_codes: ['95250', '95251'],         // Professional CGM; personal CGM supplies via DMEPOS
    annual_us_procedures: 4500000,         // Patients on CGM annually
    procedure_growth_rate: 22.0,
    applicable_indications: ['Type 1 Diabetes', 'Type 2 Diabetes', 'Gestational Diabetes', 'Hypoglycemia'],
    applicable_device_categories: ['device_monitoring'],
    current_standard_of_care: 'Dexcom G7, Abbott FreeStyle Libre 3, Medtronic Guardian 4',
    new_device_eligible_procedures: 8000000, // Vast untreated T2DM population
    adoption_curve: 'rapid',
    site_of_care: 'home',
    physician_specialty: ['Endocrinology', 'Primary Care', 'Internal Medicine'],
    source: 'ADA 2024 Standards of Care; CMS DMEPOS Coverage',
    last_updated: '2024-12-01',
  },

];

// ────────────────────────────────────────────────────────────
// DEVICE PRICING BENCHMARKS
// lib/data/device-pricing-benchmarks.ts
// ────────────────────────────────────────────────────────────

export interface DevicePricingBenchmark {
  product_name: string;
  company: string;
  product_category: ProductCategory;
  indication: string;
  clearance_year: number;
  regulatory_pathway: string;
  hospital_asp_usd: number;              // Average Selling Price to hospital
  list_price_usd?: number;
  key_drg?: string;
  drg_payment_usd?: number;
  typical_reimbursement_usd?: number;    // What hospital receives from payer
  gross_margin_pct?: number;
  notes: string;
}

export const DEVICE_PRICING_BENCHMARKS: DevicePricingBenchmark[] = [

  // Structural Heart
  {
    product_name: 'SAPIEN 3 Ultra (TAVR Valve)',
    company: 'Edwards Lifesciences',
    product_category: 'device_implantable',
    indication: 'Aortic Stenosis',
    clearance_year: 2019,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 32500,
    list_price_usd: 32500,
    key_drg: 'DRG 266/267',
    drg_payment_usd: 58000,               // Total DRG payment includes hospital stay
    gross_margin_pct: 78,
    notes: 'Dominant TAVR market share with Medtronic Evolut. Procedural cost ~$58K DRG; device $32-35K.',
  },

  // Cardiac Rhythm
  {
    product_name: 'HeartMate 3 LVAD',
    company: 'Abbott',
    product_category: 'device_implantable',
    indication: 'Advanced Heart Failure',
    clearance_year: 2017,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 95000,
    drg_payment_usd: 140000,
    gross_margin_pct: 65,
    notes: 'Near-monopoly post-Medtronic HVAD withdrawal. Full system with controller and accessories.',
  },

  // Robotic Surgery
  {
    product_name: 'da Vinci Xi Surgical System',
    company: 'Intuitive Surgical',
    product_category: 'device_capital_equipment',
    indication: 'General Surgery / Cancer Resection',
    clearance_year: 2014,
    regulatory_pathway: '510(k)',
    hospital_asp_usd: 1500000,            // Capital equipment
    typical_reimbursement_usd: 0,         // Bundled in DRG; no separate reimbursement for robot
    gross_margin_pct: 68,
    notes: 'Capital $1.5M + $170K/year service + $700-1,000/procedure in instruments (key revenue stream). 75%+ market share.',
  },

  // Orthopedics
  {
    product_name: 'MAKO SmartRobotics TKA System',
    company: 'Stryker',
    product_category: 'device_capital_equipment',
    indication: 'Knee Osteoarthritis',
    clearance_year: 2015,
    regulatory_pathway: '510(k)',
    hospital_asp_usd: 800000,
    gross_margin_pct: 62,
    notes: 'Robot + software. Per-use implant revenue is the sustainable revenue stream. 35%+ TKA robotic market share.',
  },

  {
    product_name: 'Persona Total Knee System',
    company: 'Zimmer Biomet',
    product_category: 'device_implantable',
    indication: 'Knee Osteoarthritis',
    clearance_year: 2012,
    regulatory_pathway: '510(k)',
    hospital_asp_usd: 4800,               // Per implant set (femoral + tibial + patella)
    typical_reimbursement_usd: 12000,
    gross_margin_pct: 70,
    notes: 'All-component implant set. DRG 470 typical TKA; hospital negotiates on implant cost. ASP under pressure from volume contracts.',
  },

  // Neuromodulation
  {
    product_name: 'Percept PC DBS System',
    company: 'Medtronic',
    product_category: 'device_implantable',
    indication: "Parkinson's Disease",
    clearance_year: 2020,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 28000,
    drg_payment_usd: 55000,
    gross_margin_pct: 72,
    notes: 'First DBS with BrainSense sensing capability. Full system includes IPG, leads, extension, programmer.',
  },

  // Continuous Glucose Monitoring
  {
    product_name: 'Dexcom G7 CGM System',
    company: 'Dexcom',
    product_category: 'device_monitoring',
    indication: 'Type 1 Diabetes / Type 2 Diabetes',
    clearance_year: 2022,
    regulatory_pathway: 'De Novo',
    hospital_asp_usd: 0,
    typical_reimbursement_usd: 380,       // Per month CMS DMEPOS
    list_price_usd: 499,                  // Monthly out-of-pocket list price
    gross_margin_pct: 58,
    notes: '10-day wear. CMS reimbursement via DMEPOS (K0553/K0554). Commercial $400-500/month. Competitive with Abbott FreeStyle Libre.',
  },

  // Diagnostics — Companion Diagnostic
  {
    product_name: 'VENTANA PD-L1 (SP263) Assay',
    company: 'Roche/Ventana',
    product_category: 'diagnostics_companion',
    indication: 'NSCLC / Urothelial Carcinoma (Durvalumab CDx)',
    clearance_year: 2017,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 0,
    typical_reimbursement_usd: 250,       // Per IHC slide interpretation
    gross_margin_pct: 75,
    notes: 'CDx for Imfinzi. Pathology lab revenue. Multiple CDx assays now cover PD-L1 testing across NSCLC.',
  },

  // Diagnostics — NGS Liquid Biopsy
  {
    product_name: 'Guardant360 CDx',
    company: 'Guardant Health',
    product_category: 'diagnostics_companion',
    indication: 'NSCLC (EGFR, ALK); Pan-cancer liquid biopsy',
    clearance_year: 2020,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 0,
    typical_reimbursement_usd: 3500,      // CMS gapfill pricing; commercial $3,500-5,000
    list_price_usd: 5260,
    gross_margin_pct: 65,
    notes: 'FDA PMA approved CDx for EGFR in NSCLC. Comprehensive genomic profiling. MolDx covered for Medicare.',
  },

  // Diagnostics — NGS Tissue
  {
    product_name: 'FoundationOne CDx',
    company: 'Foundation Medicine (Roche)',
    product_category: 'diagnostics_companion',
    indication: 'Pan-cancer solid tumors (multiple CDx indications)',
    clearance_year: 2017,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 0,
    typical_reimbursement_usd: 3500,
    list_price_usd: 5800,
    gross_margin_pct: 60,
    notes: 'Broadest CDx approval portfolio. Covered under Medicare NCD for CGP testing in advanced cancer. >30 CDx approvals tied to specific drugs.',
  },

  // Digital Health / SaMD
  {
    product_name: 'Viz.ai (LVO Stroke Detection AI)',
    company: 'Viz.ai',
    product_category: 'device_digital_health',
    indication: 'Ischemic Stroke (Large Vessel Occlusion Detection)',
    clearance_year: 2018,
    regulatory_pathway: 'De Novo',
    hospital_asp_usd: 0,
    typical_reimbursement_usd: 1040,      // CMS NTAP codes for AI stroke detection
    list_price_usd: 0,                    // Subscription per hospital ~$50-80K/year
    gross_margin_pct: 80,
    notes: 'First AI/ML-based SaMD with CMS reimbursement via Category III CPT code and NTAP. Demonstrates AI device reimbursement pathway.',
  },

  // Drug Delivery Device (Combination Product)
  {
    product_name: 'Susvimo (Port Delivery System)',
    company: 'Roche/Genentech',
    product_category: 'device_drug_delivery',
    indication: 'Neovascular AMD',
    clearance_year: 2021,
    regulatory_pathway: 'PMA',
    hospital_asp_usd: 2200,              // Device implant; drug refills separate
    typical_reimbursement_usd: 5400,     // Device + initial drug fill; refills ~$5K/6-months
    gross_margin_pct: 72,
    notes: 'Combination product (device + ranibizumab). Transforms monthly injections to 6-month refills. Requires surgical implant procedure (ASC/hospital).',
  },
];

// ────────────────────────────────────────────────────────────
// DEVICE PARTNER DATABASE ADDITIONS
// Key MedTech and Diagnostics companies for partner matching
// ────────────────────────────────────────────────────────────

export interface DevicePartnerProfile {
  company: string;
  company_type: string;
  hq: string;
  market_cap_b?: number;
  revenue_b?: number;
  key_divisions: string[];
  primary_therapeutic_areas: string[];
  active_bd_interests: string[];
  recent_acquisitions: string[];
  deal_size_range: string;
  preferred_stage: string[];
  source: string;
}

export const DEVICE_PARTNER_DATABASE: DevicePartnerProfile[] = [
  {
    company: 'Medtronic',
    company_type: 'large_medtech',
    hq: 'Dublin, Ireland (operational HQ: Minneapolis, MN)',
    market_cap_b: 110,
    revenue_b: 32,
    key_divisions: ['Cardiovascular', 'Neuroscience', 'Medical Surgical', 'Diabetes'],
    primary_therapeutic_areas: ['cardiac', 'neuromodulation', 'spine', 'diabetes', 'surgical robotics'],
    active_bd_interests: ['surgical robotics (Hugo)', 'cardiac ablation (PFA)', 'closed-loop neuromodulation', 'continuous glucose monitoring'],
    recent_acquisitions: ['Intersect ENT ($1.1B, 2022)', 'Affera ($925M, 2023)', 'EOFlow ($738M, attempted, blocked by ITC)'],
    deal_size_range: '$100M - $5B+ acquisitions; licensing $10M-$500M',
    preferred_stage: ['cleared_approved', 'pivotal_ongoing', 'submission_pending'],
    source: 'Medtronic Annual Report 2024; SEC Filings',
  },
  {
    company: 'Abbott Laboratories',
    company_type: 'large_medtech',
    hq: 'Abbott Park, IL',
    market_cap_b: 180,
    revenue_b: 22,
    key_divisions: ['Medical Devices', 'Diagnostics', 'Nutrition', 'Established Pharmaceuticals'],
    primary_therapeutic_areas: ['structural heart', 'electrophysiology', 'neurostimulation', 'CGM/diabetes', 'rapid diagnostics'],
    active_bd_interests: ['PFA ablation', 'leadless pacing', 'next-gen CGM', 'glucose monitoring expansion', 'AI diagnostics'],
    recent_acquisitions: ['Cardiovascular Systems Inc. ($890M, 2023)', 'Bigfoot Biomedical (closed-loop insulin)'],
    deal_size_range: '$200M - $5B acquisitions',
    preferred_stage: ['pivotal_ongoing', 'submission_pending', 'cleared_approved'],
    source: 'Abbott Annual Report 2024',
  },
  {
    company: 'Boston Scientific',
    company_type: 'large_medtech',
    hq: 'Marlborough, MA',
    market_cap_b: 120,
    revenue_b: 15,
    key_divisions: ['Cardiology', 'MedSurg', 'Neuromodulation'],
    primary_therapeutic_areas: ['electrophysiology', 'structural heart', 'endoscopy', 'neuromodulation', 'urology'],
    active_bd_interests: ['PFA technologies', 'left heart access', 'image-guided therapy', 'pain management', 'obesity/metabolic (Empower RF)'],
    recent_acquisitions: ['Acotec Scientific ($1.3B, 2024)', 'Apollo Endosurgery ($615M, 2023)', 'Relievant Medsystems ($585M, 2023)'],
    deal_size_range: '$100M - $3B acquisitions; earlier stage licensing',
    preferred_stage: ['pivotal_design', 'pivotal_ongoing', 'cleared_approved'],
    source: 'Boston Scientific Annual Report 2024',
  },
  {
    company: 'Stryker',
    company_type: 'large_medtech',
    hq: 'Kalamazoo, MI',
    market_cap_b: 125,
    revenue_b: 20,
    key_divisions: ['MedSurg & Neurotechnology', 'Orthopedics & Spine', 'Endoscopy'],
    primary_therapeutic_areas: ['orthopedics', 'trauma', 'neurosurgery', 'spine', 'robotics', 'emergency care'],
    active_bd_interests: ['surgical robotics expansion', 'digital health for OR', 'upper extremity', 'sports medicine biologics'],
    recent_acquisitions: ['Vocera Communications ($3.09B, 2022)', 'Cerus Endovascular ($45M, 2024)'],
    deal_size_range: '$50M - $5B+ acquisitions; prefer tuck-in to platform',
    preferred_stage: ['cleared_approved', 'submission_pending'],
    source: 'Stryker Annual Report 2024',
  },
  {
    company: 'Zimmer Biomet',
    company_type: 'large_medtech',
    hq: 'Warsaw, IN',
    market_cap_b: 25,
    revenue_b: 7.5,
    key_divisions: ['Knees', 'Hips', 'S.E.T. (Surgical, Extremities, Trauma)', 'Spine'],
    primary_therapeutic_areas: ['orthopedics', 'spine', 'extremities'],
    active_bd_interests: ['robotic-assisted surgery (ROSA)', 'patient-specific implants', 'biologics for bone healing'],
    recent_acquisitions: ['Embody (tendon/ligament biologics, 2023)'],
    deal_size_range: '$50M - $1B acquisitions',
    preferred_stage: ['pivotal_ongoing', 'cleared_approved'],
    source: 'Zimmer Biomet Annual Report 2024',
  },
  {
    company: 'Roche Diagnostics',
    company_type: 'diagnostics_major',
    hq: 'Basel, Switzerland',
    market_cap_b: 200,   // Roche group
    revenue_b: 60,       // Roche group (diagnostics ~$16B)
    key_divisions: ['Centralized & Point of Care Solutions', 'Molecular Lab', 'Tissue Diagnostics', 'Information Solutions'],
    primary_therapeutic_areas: ['oncology diagnostics', 'companion diagnostics', 'infectious disease', 'blood glucose', 'digital pathology'],
    active_bd_interests: ['AI pathology integration', 'liquid biopsy', 'multimodal diagnostics', 'companion diagnostics for oncology pipeline'],
    recent_acquisitions: ['LumiraDx (POC diagnostics, $295M, 2024)', 'Compandiag assets'],
    deal_size_range: '$100M - $5B+ acquisitions; CDx partnerships common',
    preferred_stage: ['feasibility', 'pivotal_design', 'cleared_approved'],
    source: 'Roche Annual Report 2024',
  },
  {
    company: 'Abbott Diagnostics (Alinity)',
    company_type: 'diagnostics_major',
    hq: 'Abbott Park, IL',
    market_cap_b: 180,   // Abbott group
    revenue_b: 10,       // Diagnostics segment
    key_divisions: ['Core Laboratory', 'Molecular', 'Point of Care', 'Rapid Diagnostics'],
    primary_therapeutic_areas: ['infectious disease', 'cardiometabolic', 'oncology markers', 'women\'s health', 'POC testing'],
    active_bd_interests: ['decentralized diagnostics', 'AI interpretation', 'chronic disease monitoring biomarkers'],
    recent_acquisitions: ['Bigfoot Biomedical (diabetes data)', 'Egnite (oncology informatics)'],
    deal_size_range: '$50M - $2B acquisitions',
    preferred_stage: ['pivotal_design', 'cleared_approved'],
    source: 'Abbott Diagnostics Division Reports 2024',
  },
  {
    company: 'Siemens Healthineers',
    company_type: 'diagnostics_major',
    hq: 'Erlangen, Germany',
    market_cap_b: 62,
    revenue_b: 22,
    key_divisions: ['Imaging', 'Diagnostics', 'Advanced Therapies', 'Varian (oncology)'],
    primary_therapeutic_areas: ['radiology', 'laboratory diagnostics', 'radiation oncology', 'cardiovascular imaging'],
    active_bd_interests: ['AI radiology tools', 'theranostics (Lu-177)', 'digital pathology', 'molecular imaging'],
    recent_acquisitions: ['Corindus (vascular robots, 2019)', 'Varian Medical ($16.4B, 2021)'],
    deal_size_range: '$100M - $5B',
    preferred_stage: ['cleared_approved', 'pivotal_ongoing'],
    source: 'Siemens Healthineers Annual Report 2024',
  },
  {
    company: 'Exact Sciences',
    company_type: 'diagnostics_specialty',
    hq: 'Madison, WI',
    market_cap_b: 7,
    revenue_b: 2.5,
    key_divisions: ['Cologuard (CRC screening)', 'Oncotype DX (genomic profiling)', 'Precision Oncology Lab'],
    primary_therapeutic_areas: ['colorectal cancer screening', 'breast/prostate/colon genomic profiling'],
    active_bd_interests: ['multi-cancer early detection (MCED)', 'expanded Cologuard indications', 'liquid biopsy MRD'],
    recent_acquisitions: ['Thrive Earlier Detection ($2.15B, 2021 — MCED)', 'Genomic Health ($2.8B, 2019)'],
    deal_size_range: '$50M - $2B acquisitions; research partnerships earlier',
    preferred_stage: ['feasibility', 'pivotal_design', 'cleared_approved'],
    source: 'Exact Sciences Annual Report 2024',
  },
  {
    company: 'Guardant Health',
    company_type: 'diagnostics_specialty',
    hq: 'Redwood City, CA',
    market_cap_b: 4,
    revenue_b: 0.6,
    key_divisions: ['Oncology (Guardant360)', 'Shield (CRC screening)', 'Development Partnerships'],
    primary_therapeutic_areas: ['liquid biopsy oncology', 'CRC screening', 'MRD monitoring'],
    active_bd_interests: ['early detection expansion', 'therapy companion CDx partnerships', 'international expansion'],
    recent_acquisitions: ['None major; BD focused on pharma CDx partnerships (Amgen, Bayer, Pfizer)'],
    deal_size_range: 'CDx partnerships $10-50M; co-development deals $50-200M',
    preferred_stage: ['feasibility', 'pivotal_design', 'cleared_approved'],
    source: 'Guardant Health Annual Report 2024',
  },
  {
    company: 'Intuitive Surgical',
    company_type: 'large_medtech',
    hq: 'Sunnyvale, CA',
    market_cap_b: 155,
    revenue_b: 7.5,
    key_divisions: ['da Vinci Surgical Systems', 'Ion Endoluminal System', 'Digital ecosystem'],
    primary_therapeutic_areas: ['minimally invasive surgery (all specialties)', 'lung biopsy', 'surgical AI'],
    active_bd_interests: ['next-gen da Vinci', 'Ion pulmonary expansion', 'AI procedure guidance', 'single-port expansion'],
    recent_acquisitions: ['Orpheus Medical (OR workflow, 2022)'],
    deal_size_range: 'Primarily internal R&D; selective smaller acquisitions <$500M',
    preferred_stage: ['pivotal_ongoing', 'cleared_approved'],
    source: 'Intuitive Surgical Annual Report 2024',
  },
];
