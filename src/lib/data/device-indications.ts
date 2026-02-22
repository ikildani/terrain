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

  // ──────────────────────────────────────────
  // OPHTHALMOLOGY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Cataract Surgery (Phacoemulsification)',
    cpt_codes: ['66984', '66982'],
    annual_us_procedures: 4000000,
    procedure_growth_rate: 3.5,
    applicable_indications: ['Cataract', 'Age-Related Cataract', 'Posterior Subcapsular Cataract', 'Nuclear Sclerotic Cataract'],
    applicable_device_categories: ['device_implantable', 'device_capital_equipment'],
    current_standard_of_care: 'Phacoemulsification with IOL implant (Alcon AcrySof, Johnson & Johnson TECNIS, Bausch + Lomb enVista)',
    new_device_eligible_procedures: 1200000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Ophthalmology'],
    source: 'American Academy of Ophthalmology 2024; CMS Medicare Part B Claims; Market Scope 2024',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'LASIK/PRK Refractive Surgery',
    cpt_codes: ['65760', '65765', '65767', '65771'],
    annual_us_procedures: 700000,
    procedure_growth_rate: 4.0,
    applicable_indications: ['Myopia', 'Hyperopia', 'Astigmatism', 'Refractive Error'],
    applicable_device_categories: ['device_capital_equipment'],
    current_standard_of_care: 'Excimer laser systems (Alcon WaveLight, Johnson & Johnson VISX, Zeiss SMILE)',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Ophthalmology', 'Refractive Surgery'],
    source: 'Market Scope Refractive Surgery Report 2024; ASCRS Member Survey',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // CARDIAC / VASCULAR (ADDITIONAL)
  // ──────────────────────────────────────────
  {
    procedure_name: 'Pacemaker Implant (Single/Dual Chamber)',
    cpt_codes: ['33206', '33207', '33208', '33212', '33213'],
    annual_us_procedures: 250000,
    procedure_growth_rate: 2.0,
    applicable_indications: ['Bradycardia', 'Sick Sinus Syndrome', 'Atrioventricular Block', 'Heart Block', 'Chronotropic Incompetence'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Transvenous pacemakers (Medtronic Azure, Abbott Assurity, Boston Scientific Accolade); Leadless (Medtronic Micra)',
    new_device_eligible_procedures: 60000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Electrophysiology', 'Cardiac Surgery'],
    source: 'NCDR ICD Registry 2024; CMS Claims Data; HRS Pacing and EP Survey',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Cardiac Resynchronization Therapy (CRT-D/CRT-P)',
    cpt_codes: ['33224', '33225', '33226', '33249'],
    annual_us_procedures: 50000,
    procedure_growth_rate: 1.5,
    applicable_indications: ['Heart Failure with Reduced Ejection Fraction', 'LBBB', 'Wide QRS Heart Failure', 'NYHA Class III-IV HF'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'CRT-D/CRT-P systems (Medtronic, Abbott, Boston Scientific); Conduction system pacing emerging',
    new_device_eligible_procedures: 15000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Electrophysiology', 'Heart Failure Cardiology'],
    source: 'NCDR ICD Registry 2024; ACC/AHA Heart Failure Guidelines; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Transcatheter Edge-to-Edge Repair (TEER/MitraClip)',
    cpt_codes: ['33418', '33419'],
    annual_us_procedures: 30000,
    procedure_growth_rate: 15.0,
    applicable_indications: ['Degenerative Mitral Regurgitation', 'Functional Mitral Regurgitation', 'Tricuspid Regurgitation', 'Structural Heart Disease'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Abbott MitraClip G4; Edwards PASCAL system; open surgical mitral valve repair/replacement',
    new_device_eligible_procedures: 20000,
    adoption_curve: 'rapid',
    site_of_care: 'inpatient',
    physician_specialty: ['Interventional Cardiology', 'Cardiac Surgery'],
    source: 'TVT Registry 2024; STS/ACC Structural Heart Data; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Watchman Left Atrial Appendage Closure (LAAC)',
    cpt_codes: ['33340'],
    annual_us_procedures: 80000,
    procedure_growth_rate: 18.0,
    applicable_indications: ['Atrial Fibrillation', 'Stroke Prevention in AFib', 'Anticoagulant Intolerance', 'Non-Valvular AFib'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Boston Scientific WATCHMAN FLX; Abbott Amulet; oral anticoagulation (warfarin, DOACs)',
    new_device_eligible_procedures: 50000,
    adoption_curve: 'rapid',
    site_of_care: 'inpatient',
    physician_specialty: ['Interventional Cardiology', 'Electrophysiology'],
    source: 'NCDR LAAO Registry 2024; Boston Scientific Investor Reports; CMS NCD 20.34',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Endovascular Aneurysm Repair (EVAR)',
    cpt_codes: ['34802', '34803', '34804', '34805', '34812'],
    annual_us_procedures: 40000,
    procedure_growth_rate: -1.0,
    applicable_indications: ['Abdominal Aortic Aneurysm', 'AAA', 'Thoracic Aortic Aneurysm', 'Aortic Dissection'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Endovascular stent grafts (Medtronic Endurant/Aorfix, Gore Excluder, Cook Zenith)',
    new_device_eligible_procedures: 10000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Vascular Surgery', 'Interventional Radiology'],
    source: 'SVS Vascular Quality Initiative 2024; CMS Medicare Claims; EVAR Trial Follow-Up Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Carotid Artery Stenting (CAS)',
    cpt_codes: ['37215', '37216', '37217'],
    annual_us_procedures: 15000,
    procedure_growth_rate: 2.5,
    applicable_indications: ['Carotid Artery Stenosis', 'Stroke Prevention', 'Transient Ischemic Attack', 'Carotid Artery Disease'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Carotid endarterectomy (CEA); Stent systems (Abbott Acculink, Medtronic Protege, Silk Road TCAR)',
    new_device_eligible_procedures: 8000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Vascular Surgery', 'Interventional Radiology', 'Neurosurgery'],
    source: 'SVS VQI 2024; CREST-2 Trial Data; CMS Claims',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // ORTHOPEDICS (ADDITIONAL)
  // ──────────────────────────────────────────
  {
    procedure_name: 'Total Shoulder Replacement (TSA/RSA)',
    cpt_codes: ['23472', '23473', '23474'],
    annual_us_procedures: 130000,
    procedure_growth_rate: 9.0,
    applicable_indications: ['Glenohumeral Osteoarthritis', 'Rotator Cuff Arthropathy', 'Proximal Humerus Fracture', 'Shoulder OA'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Reverse shoulder (Zimmer Biomet Comprehensive, DePuy Synthes Delta Xtend, Stryker ReUnion)',
    new_device_eligible_procedures: 40000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Orthopedic Surgery'],
    source: 'AAOS Annual Meeting 2024; American Shoulder and Elbow Surgeons Registry; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'ACL Reconstruction',
    cpt_codes: ['29888'],
    annual_us_procedures: 250000,
    procedure_growth_rate: 3.0,
    applicable_indications: ['ACL Tear', 'Anterior Cruciate Ligament Injury', 'Knee Instability', 'Sports Knee Injury'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Autograft/allograft reconstruction with interference screws (Arthrex, Smith+Nephew, Stryker, ConMed)',
    new_device_eligible_procedures: 60000,
    adoption_curve: 'slow',
    site_of_care: 'outpatient',
    physician_specialty: ['Orthopedic Surgery', 'Sports Medicine'],
    source: 'AAOS OrthoInfo 2024; MOON Cohort Study; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Rotator Cuff Repair (Arthroscopic)',
    cpt_codes: ['29827', '29826', '23410', '23412'],
    annual_us_procedures: 300000,
    procedure_growth_rate: 3.5,
    applicable_indications: ['Rotator Cuff Tear', 'Supraspinatus Tear', 'Shoulder Impingement', 'Full-Thickness Rotator Cuff Tear'],
    applicable_device_categories: ['device_surgical', 'device_implantable'],
    current_standard_of_care: 'Arthroscopic repair with suture anchors (Arthrex, Smith+Nephew, Stryker); biologics augmentation emerging',
    new_device_eligible_procedures: 80000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Orthopedic Surgery', 'Sports Medicine'],
    source: 'AAOS Clinical Practice Guidelines 2024; CMS Physician Supplier Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Total Ankle Replacement / Ankle Fusion',
    cpt_codes: ['27702', '27703', '27870'],
    annual_us_procedures: 30000,
    procedure_growth_rate: 8.0,
    applicable_indications: ['Ankle Osteoarthritis', 'End-Stage Ankle Arthritis', 'Post-Traumatic Ankle Arthritis', 'Rheumatoid Ankle Arthritis'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Total ankle arthroplasty (Stryker STAR, Zimmer Biomet Trabecular Metal, Integra Cadence/Salto)',
    new_device_eligible_procedures: 15000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Orthopedic Surgery', 'Foot and Ankle Surgery'],
    source: 'AOFAS 2024; CMS Claims Data; NIS Database',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Knee Arthroscopy (Meniscectomy/Debridement)',
    cpt_codes: ['29881', '29880', '29882', '29883'],
    annual_us_procedures: 750000,
    procedure_growth_rate: -2.0,
    applicable_indications: ['Meniscus Tear', 'Knee Cartilage Injury', 'Loose Body Removal', 'Chondral Lesion'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'Arthroscopic shaver/resection systems (Arthrex, Smith+Nephew, Stryker, ConMed)',
    new_device_eligible_procedures: 100000,
    adoption_curve: 'slow',
    site_of_care: 'outpatient',
    physician_specialty: ['Orthopedic Surgery', 'Sports Medicine'],
    source: 'AAOS Appropriate Use Criteria 2024; CMS Claims Data; Cochrane Review 2024',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // GENERAL / BARIATRIC SURGERY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Bariatric Surgery (Sleeve Gastrectomy / Gastric Bypass)',
    cpt_codes: ['43775', '43644', '43645', '43770', '43659'],
    annual_us_procedures: 250000,
    procedure_growth_rate: 5.0,
    applicable_indications: ['Morbid Obesity', 'BMI > 40', 'BMI > 35 with Comorbidities', 'Type 2 Diabetes with Obesity', 'Metabolic Syndrome'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'Laparoscopic sleeve gastrectomy (dominant ~60%); RYGB; robotic-assisted (Intuitive da Vinci)',
    new_device_eligible_procedures: 80000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Bariatric Surgery', 'General Surgery'],
    source: 'ASMBS 2024 Estimate; MBSAQIP Registry; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Hernia Repair (Inguinal/Ventral)',
    cpt_codes: ['49505', '49507', '49520', '49560', '49565', '49652', '49653'],
    annual_us_procedures: 1100000,
    procedure_growth_rate: 2.0,
    applicable_indications: ['Inguinal Hernia', 'Ventral Hernia', 'Incisional Hernia', 'Umbilical Hernia', 'Hiatal Hernia'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Synthetic mesh repair (Medtronic/Covidien, BD/Bard, Gore, Atrium/Getinge); robotic-assisted increasing',
    new_device_eligible_procedures: 300000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['General Surgery'],
    source: 'ACS NSQIP 2024; Americas Hernia Society Quality Collaborative; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Laparoscopic Cholecystectomy',
    cpt_codes: ['47562', '47563', '47564'],
    annual_us_procedures: 750000,
    procedure_growth_rate: 1.5,
    applicable_indications: ['Cholelithiasis', 'Gallstones', 'Cholecystitis', 'Biliary Dyskinesia', 'Gallbladder Polyps'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'Laparoscopic cholecystectomy (Medtronic/Covidien, Ethicon, Olympus); robotic-assisted growing',
    new_device_eligible_procedures: 100000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['General Surgery'],
    source: 'ACS NSQIP 2024; NIS Database; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Appendectomy',
    cpt_codes: ['44970', '44960', '44950'],
    annual_us_procedures: 300000,
    procedure_growth_rate: 1.0,
    applicable_indications: ['Acute Appendicitis', 'Perforated Appendicitis', 'Appendiceal Abscess'],
    applicable_device_categories: ['device_surgical'],
    current_standard_of_care: 'Laparoscopic appendectomy (Ethicon, Medtronic/Covidien stapling/energy devices)',
    new_device_eligible_procedures: 40000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['General Surgery', 'Acute Care Surgery'],
    source: 'ACS NSQIP 2024; NIS Database; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // WOMEN'S HEALTH / OBSTETRICS & GYNECOLOGY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Hysterectomy (Abdominal/Laparoscopic/Robotic)',
    cpt_codes: ['58150', '58152', '58180', '58260', '58262', '58550', '58553', '58570', '58572'],
    annual_us_procedures: 500000,
    procedure_growth_rate: -1.5,
    applicable_indications: ['Uterine Fibroids', 'Endometriosis', 'Uterine Prolapse', 'Abnormal Uterine Bleeding', 'Gynecologic Cancer'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'Laparoscopic/robotic hysterectomy (Intuitive da Vinci, Ethicon, Medtronic energy devices); open for complex cases',
    new_device_eligible_procedures: 100000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Gynecology', 'Gynecologic Oncology'],
    source: 'ACOG Practice Bulletin 2024; ACS NSQIP; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Cesarean Section (C-Section)',
    cpt_codes: ['59510', '59514', '59515', '59618', '59620', '59622'],
    annual_us_procedures: 1200000,
    procedure_growth_rate: 0.5,
    applicable_indications: ['Cephalopelvic Disproportion', 'Fetal Distress', 'Placenta Previa', 'Repeat Cesarean', 'Breech Presentation'],
    applicable_device_categories: ['device_surgical'],
    current_standard_of_care: 'Standard surgical instruments and closure devices (Ethicon, Medtronic/Covidien); uterine closure stapling systems',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Obstetrics and Gynecology', 'Maternal-Fetal Medicine'],
    source: 'CDC National Vital Statistics 2024; ACOG C-Section Rate Data; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'In Vitro Fertilization (IVF) Procedures',
    cpt_codes: ['58970', '58974', '58976', '89250', '89251', '89253', '89254', '89268'],
    annual_us_procedures: 200000,
    procedure_growth_rate: 8.0,
    applicable_indications: ['Infertility', 'Polycystic Ovary Syndrome', 'Endometriosis-Related Infertility', 'Male Factor Infertility', 'Diminished Ovarian Reserve'],
    applicable_device_categories: ['device_capital_equipment', 'device_surgical', 'diagnostics_ivd'],
    current_standard_of_care: 'IVF culture systems (CooperSurgical/Origio, Vitrolife); embryo assessment AI (TMRW, Igenomix); PGT diagnostics',
    new_device_eligible_procedures: 80000,
    adoption_curve: 'rapid',
    site_of_care: 'outpatient',
    physician_specialty: ['Reproductive Endocrinology', 'Obstetrics and Gynecology'],
    source: 'CDC ART National Summary 2024; SART Clinical Outcomes Reporting; ASRM',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // UROLOGY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Radical Prostatectomy (Open + Robotic)',
    cpt_codes: ['55840', '55842', '55845', '55866'],
    annual_us_procedures: 150000,
    procedure_growth_rate: 2.0,
    applicable_indications: ['Prostate Cancer', 'Localized Prostate Cancer', 'Intermediate-Risk Prostate Cancer', 'High-Risk Prostate Cancer'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'Robot-assisted radical prostatectomy (Intuitive da Vinci, ~85% of cases); open retropubic prostatectomy declining',
    new_device_eligible_procedures: 30000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Urology', 'Urologic Oncology'],
    source: 'AUA Quality Registry 2024; SEER-Medicare Data; Intuitive Surgical Procedure Reports',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Kidney Stone Lithotripsy / Ureteroscopy',
    cpt_codes: ['50590', '52353', '52356', '52352'],
    annual_us_procedures: 400000,
    procedure_growth_rate: 4.0,
    applicable_indications: ['Nephrolithiasis', 'Kidney Stones', 'Ureteral Stones', 'Renal Calculi', 'Staghorn Calculus'],
    applicable_device_categories: ['device_surgical', 'device_capital_equipment'],
    current_standard_of_care: 'ESWL (Dornier, Storz Medical); flexible ureteroscopy with laser lithotripsy (Lumenis, Boston Scientific, Olympus)',
    new_device_eligible_procedures: 100000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Urology'],
    source: 'AUA Guidelines on Surgical Management of Stones 2024; CMS Claims Data; NIS Database',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Sacral Neuromodulation Implant (InterStim)',
    cpt_codes: ['64561', '64581', '64590'],
    annual_us_procedures: 20000,
    procedure_growth_rate: 5.0,
    applicable_indications: ['Overactive Bladder', 'Urinary Retention', 'Fecal Incontinence', 'Urinary Urge Incontinence'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Medtronic InterStim II/Micro; Axonics r-SNM System; conservative therapy (medication, pelvic floor PT)',
    new_device_eligible_procedures: 12000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Urology', 'Urogynecology', 'Colorectal Surgery'],
    source: 'AUA/SUFU Guidelines 2024; Medtronic and Axonics Investor Reports; CMS Claims',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // ENT / OTOLARYNGOLOGY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Tympanostomy Tubes (Ear Tubes)',
    cpt_codes: ['69436', '69433'],
    annual_us_procedures: 700000,
    procedure_growth_rate: -1.0,
    applicable_indications: ['Recurrent Acute Otitis Media', 'Chronic Otitis Media with Effusion', 'Eustachian Tube Dysfunction', 'Conductive Hearing Loss'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Myringotomy with tube insertion (Medtronic, Olympus); in-office tube placement (Tympanostomy, Preceptis Hummingbird)',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Otolaryngology', 'Pediatric Otolaryngology'],
    source: 'AAO-HNS Clinical Practice Guideline 2024; CMS Claims; HCUP Kids Database',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Tonsillectomy / Adenoidectomy',
    cpt_codes: ['42820', '42821', '42825', '42826', '42830', '42831', '42835', '42836'],
    annual_us_procedures: 500000,
    procedure_growth_rate: -0.5,
    applicable_indications: ['Recurrent Tonsillitis', 'Tonsillar Hypertrophy', 'Obstructive Sleep Apnea (Pediatric)', 'Adenoid Hypertrophy'],
    applicable_device_categories: ['device_surgical'],
    current_standard_of_care: 'Electrocautery, coblation (Smith+Nephew), microdebrider, harmonic scalpel (Ethicon)',
    new_device_eligible_procedures: 100000,
    adoption_curve: 'slow',
    site_of_care: 'outpatient',
    physician_specialty: ['Otolaryngology', 'Pediatric Otolaryngology'],
    source: 'AAO-HNS Clinical Practice Guideline 2024; HCUP Kids Database; CMS Claims',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Functional Endoscopic Sinus Surgery (FESS)',
    cpt_codes: ['31254', '31255', '31256', '31267', '31276', '31287', '31288'],
    annual_us_procedures: 450000,
    procedure_growth_rate: 3.0,
    applicable_indications: ['Chronic Rhinosinusitis', 'Nasal Polyps', 'Recurrent Sinusitis', 'Mucocele', 'Fungal Sinusitis'],
    applicable_device_categories: ['device_surgical', 'device_implantable', 'device_drug_delivery'],
    current_standard_of_care: 'Endoscopic sinus surgery with powered instrumentation (Medtronic, Stryker); steroid-eluting implants (Intersect ENT PROPEL)',
    new_device_eligible_procedures: 150000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Otolaryngology', 'Rhinology'],
    source: 'AAO-HNS 2024; American Rhinologic Society Survey; CMS Claims Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Cochlear Implant',
    cpt_codes: ['69930'],
    annual_us_procedures: 15000,
    procedure_growth_rate: 7.0,
    applicable_indications: ['Severe-to-Profound Sensorineural Hearing Loss', 'Bilateral Hearing Loss', 'Single-Sided Deafness', 'Pediatric Hearing Loss'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Cochlear Americas Nucleus, Advanced Bionics (Sonova), MED-EL',
    new_device_eligible_procedures: 8000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Otolaryngology', 'Neurotology', 'Audiology'],
    source: 'ASHA Cochlear Implant Data 2024; FDA MAUDE Database; CMS NCD 50.3; NIDCD Statistics',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // GI / HEPATOBILIARY (ADDITIONAL)
  // ──────────────────────────────────────────
  {
    procedure_name: 'Upper Endoscopy (Esophagogastroduodenoscopy / EGD)',
    cpt_codes: ['43235', '43239', '43249', '43250', '43251'],
    annual_us_procedures: 7000000,
    procedure_growth_rate: 3.0,
    applicable_indications: ['GERD', 'Barrett Esophagus', 'Peptic Ulcer Disease', 'Dysphagia', 'GI Bleeding', 'Esophageal Cancer Screening'],
    applicable_device_categories: ['device_capital_equipment', 'device_surgical'],
    current_standard_of_care: 'Upper endoscopy systems (Olympus, Fujifilm, Pentax); AI-enhanced detection emerging',
    new_device_eligible_procedures: 1500000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Gastroenterology'],
    source: 'AGA/ACG Guidelines 2024; CMS Physician Supplier Procedure Summary; ASGE Survey',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Endoscopic Retrograde Cholangiopancreatography (ERCP)',
    cpt_codes: ['43260', '43261', '43262', '43263', '43264', '43265', '43274', '43275'],
    annual_us_procedures: 600000,
    procedure_growth_rate: 2.0,
    applicable_indications: ['Choledocholithiasis', 'Bile Duct Stones', 'Biliary Stricture', 'Pancreatic Duct Leak', 'Cholangiocarcinoma', 'Pancreatic Cancer'],
    applicable_device_categories: ['device_capital_equipment', 'device_surgical'],
    current_standard_of_care: 'Duodenoscopes (Olympus, Fujifilm, Pentax); single-use duodenoscopes (Boston Scientific EXALT)',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'moderate',
    site_of_care: 'inpatient',
    physician_specialty: ['Gastroenterology', 'Advanced Endoscopy'],
    source: 'ASGE Standards of Practice 2024; CMS Claims Data; FDA Duodenoscope Safety Communication',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Bariatric Endoscopy (ESG / Intragastric Balloon)',
    cpt_codes: ['43284', '43285', '43999'],
    annual_us_procedures: 60000,
    procedure_growth_rate: 25.0,
    applicable_indications: ['Obesity BMI 30-40', 'Mild-to-Moderate Obesity', 'Weight Regain Post-Bariatric Surgery', 'Metabolic Syndrome'],
    applicable_device_categories: ['device_surgical', 'device_implantable'],
    current_standard_of_care: 'Endoscopic sleeve gastroplasty (ESG with Apollo OverStitch); intragastric balloons (Orbera, Obalon); GLP-1 medications as alternative',
    new_device_eligible_procedures: 40000,
    adoption_curve: 'rapid',
    site_of_care: 'outpatient',
    physician_specialty: ['Gastroenterology', 'Bariatric Medicine'],
    source: 'ASGE Bariatric Endoscopy Task Force 2024; Apollo Endosurgery Reports; CMS Coverage Analysis',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // DENTAL / ORAL SURGERY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Dental Implants',
    cpt_codes: ['D6010', 'D6040', 'D6050', 'D6065', 'D6066', 'D6067'],
    annual_us_procedures: 5000000,
    procedure_growth_rate: 6.0,
    applicable_indications: ['Edentulism', 'Single Tooth Loss', 'Partial Edentulism', 'Full Arch Restoration', 'Implant-Supported Dentures'],
    applicable_device_categories: ['device_implantable'],
    current_standard_of_care: 'Titanium endosseous implants (Straumann, Nobel Biocare/Envista, Zimmer Biomet Dental, Dentsply Sirona, BioHorizons)',
    new_device_eligible_procedures: 1500000,
    adoption_curve: 'moderate',
    site_of_care: 'office',
    physician_specialty: ['Oral and Maxillofacial Surgery', 'Periodontology', 'Prosthodontics', 'General Dentistry'],
    source: 'ADA Health Policy Institute 2024; iData Research Dental Implant Market Report; AAID Survey',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // VASCULAR ACCESS
  // ──────────────────────────────────────────
  {
    procedure_name: 'Central Venous Catheter Placement',
    cpt_codes: ['36555', '36556', '36557', '36558', '36560', '36561', '36563', '36565', '36566', '36568', '36569', '36570', '36571'],
    annual_us_procedures: 5000000,
    procedure_growth_rate: 2.0,
    applicable_indications: ['Chemotherapy Access', 'Parenteral Nutrition', 'Hemodialysis Access', 'Long-Term IV Therapy', 'Critical Care Access'],
    applicable_device_categories: ['device_surgical', 'device_implantable'],
    current_standard_of_care: 'PICC lines, tunneled catheters, implanted ports (BD/Bard, Teleflex, B. Braun, AngioDynamics, Cook Medical)',
    new_device_eligible_procedures: 800000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Interventional Radiology', 'Critical Care Medicine', 'General Surgery', 'Vascular Access Teams'],
    source: 'AVA (Association for Vascular Access) 2024; CMS Claims Data; NHSN HAI Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Dialysis Vascular Access (AV Fistula / AV Graft)',
    cpt_codes: ['36818', '36819', '36820', '36821', '36825', '36830'],
    annual_us_procedures: 120000,
    procedure_growth_rate: 3.0,
    applicable_indications: ['End-Stage Renal Disease', 'Chronic Kidney Disease Stage 5', 'Hemodialysis Access', 'Dialysis Access Dysfunction'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Surgical AV fistula creation; ePTFE grafts (Gore, BD/Bard); endovascular AV fistula (Becton Dickinson WavelinQ, Medtronic)',
    new_device_eligible_procedures: 50000,
    adoption_curve: 'moderate',
    site_of_care: 'outpatient',
    physician_specialty: ['Vascular Surgery', 'Nephrology', 'Interventional Radiology'],
    source: 'USRDS Annual Data Report 2024; Fistula First Breakthrough Initiative; CMS Claims',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // DERMATOLOGY / AESTHETICS
  // ──────────────────────────────────────────
  {
    procedure_name: 'Mohs Micrographic Surgery',
    cpt_codes: ['17311', '17312', '17313', '17314', '17315'],
    annual_us_procedures: 800000,
    procedure_growth_rate: 4.0,
    applicable_indications: ['Basal Cell Carcinoma', 'Squamous Cell Carcinoma', 'Melanoma in Situ', 'Dermatofibrosarcoma Protuberans', 'Non-Melanoma Skin Cancer'],
    applicable_device_categories: ['device_surgical', 'diagnostics_ivd'],
    current_standard_of_care: 'Mohs excision with frozen section pathology; cryostat tissue processors (Leica, Sakura); AI digital pathology emerging',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'moderate',
    site_of_care: 'office',
    physician_specialty: ['Dermatology', 'Mohs Surgery'],
    source: 'ACMS (American College of Mohs Surgery) 2024 Annual Report; CMS Part B Claims; AAD Skin Cancer Data',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Laser Skin Procedures (Resurfacing/Rejuvenation)',
    cpt_codes: ['17999', '15780', '15781', '15782', '15783', '15786', '15787'],
    annual_us_procedures: 2000000,
    procedure_growth_rate: 7.0,
    applicable_indications: ['Photoaging', 'Acne Scarring', 'Melasma', 'Vascular Lesions', 'Tattoo Removal', 'Skin Laxity', 'Hyperpigmentation'],
    applicable_device_categories: ['device_capital_equipment'],
    current_standard_of_care: 'Fractional CO2 lasers (Lumenis, Cynosure/Hologic); Nd:YAG and picosecond lasers (Cutera, Candela, Sciton); IPL devices',
    new_device_eligible_procedures: 600000,
    adoption_curve: 'rapid',
    site_of_care: 'office',
    physician_specialty: ['Dermatology', 'Plastic Surgery', 'Aesthetic Medicine'],
    source: 'ASDS Consumer Survey 2024; Medical Insight Aesthetic Laser Market Report; ASLMS Data',
    last_updated: '2025-01-15',
  },

  // ──────────────────────────────────────────
  // RESPIRATORY / PULMONOLOGY
  // ──────────────────────────────────────────
  {
    procedure_name: 'Bronchoscopy (Diagnostic + Interventional)',
    cpt_codes: ['31622', '31623', '31624', '31625', '31626', '31628', '31629', '31631', '31632', '31633'],
    annual_us_procedures: 600000,
    procedure_growth_rate: 5.0,
    applicable_indications: ['Lung Cancer Diagnosis', 'Pulmonary Nodule Evaluation', 'Airway Obstruction', 'Hemoptysis', 'Interstitial Lung Disease', 'Lung Infection'],
    applicable_device_categories: ['device_capital_equipment', 'device_surgical'],
    current_standard_of_care: 'Flexible bronchoscopy (Olympus, Fujifilm); robotic bronchoscopy (Intuitive Ion, J&J Monarch, Noah Medical Galaxy)',
    new_device_eligible_procedures: 200000,
    adoption_curve: 'rapid',
    site_of_care: 'outpatient',
    physician_specialty: ['Pulmonology', 'Interventional Pulmonology', 'Thoracic Surgery'],
    source: 'AABIP 2024; ATS/CHEST Guidelines; CMS Claims Data; Intuitive Ion Procedure Reports',
    last_updated: '2025-01-15',
  },

  {
    procedure_name: 'Tracheostomy',
    cpt_codes: ['31600', '31601', '31603', '31605', '31610'],
    annual_us_procedures: 100000,
    procedure_growth_rate: 1.0,
    applicable_indications: ['Prolonged Mechanical Ventilation', 'Upper Airway Obstruction', 'Laryngeal Cancer', 'Neurological Impairment', 'Subglottic Stenosis'],
    applicable_device_categories: ['device_implantable', 'device_surgical'],
    current_standard_of_care: 'Percutaneous dilational tracheostomy (Ciaglia technique); surgical tracheostomy; tracheostomy tubes (Shiley/Medtronic, Portex/Smiths Medical, Bivona)',
    new_device_eligible_procedures: 25000,
    adoption_curve: 'slow',
    site_of_care: 'inpatient',
    physician_specialty: ['Critical Care Medicine', 'Otolaryngology', 'Pulmonology', 'General Surgery'],
    source: 'NIS Database 2024; SCCM ICU Procedure Data; CMS MEDPAR',
    last_updated: '2025-01-15',
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
