// ============================================================
// TERRAIN — Predicate Device Database
// 55+ landmark device clearances/approvals for the device
// regulatory engine. The device equivalent of precedent-trials.ts.
// Source: FDA 510(k), PMA, De Novo databases; CDRH annual reports.
// ============================================================

import type {
  PredicateDeviceRecord,
  DeviceCategory,
} from '../../types/devices-diagnostics';

export const PREDICATE_DEVICE_DATABASE: PredicateDeviceRecord[] = [
  // ────────────────────────────────────────────────────────────
  // CARDIOVASCULAR (~12 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'SAPIEN 3 Transcatheter Heart Valve',
    company: 'Edwards Lifesciences',
    k_number_or_pma: 'P140031',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'NIQ',
    clearance_date: '2015-06-05',
    review_days: 327,
    device_category: 'cardiovascular',
    indication_for_use:
      'Treatment of symptomatic severe aortic stenosis via transcatheter aortic valve replacement (TAVR) in patients at intermediate to high surgical risk.',
    primary_endpoint: 'All-cause mortality or disabling stroke at 1 year',
    sample_size: 1077,
    clinical_study_required: true,
    landmark_significance:
      'Expanded TAVR to intermediate-risk patients, dramatically broadening the eligible population beyond the original high-risk-only indication and accelerating the shift away from open-heart surgery.',
  },
  {
    device_name: 'WATCHMAN FLX Left Atrial Appendage Closure Device',
    company: 'Boston Scientific',
    k_number_or_pma: 'P130013/S035',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DSG',
    clearance_date: '2020-07-14',
    review_days: 289,
    device_category: 'cardiovascular',
    indication_for_use:
      'Percutaneous closure of the left atrial appendage to reduce stroke risk in patients with non-valvular atrial fibrillation who are seeking an alternative to long-term warfarin therapy.',
    primary_endpoint: 'Composite of ischemic stroke, systemic embolism, and cardiovascular/unexplained death',
    sample_size: 462,
    clinical_study_required: true,
    landmark_significance:
      'Second-generation design with improved seal and dramatically lower residual leak rates, establishing LAA closure as a mainstream stroke-prevention alternative to lifelong anticoagulation.',
  },
  {
    device_name: 'CoreValve Evolut R/PRO Transcatheter Aortic Valve',
    company: 'Medtronic',
    k_number_or_pma: 'P130021/S002',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'NIQ',
    clearance_date: '2017-06-14',
    review_days: 341,
    device_category: 'cardiovascular',
    indication_for_use:
      'Treatment of symptomatic severe aortic stenosis via transcatheter aortic valve replacement in patients at high or extreme surgical risk.',
    primary_endpoint: 'All-cause mortality or disabling stroke at 2 years',
    sample_size: 1468,
    clinical_study_required: true,
    landmark_significance:
      'Self-expanding supra-annular design offered an alternative TAVR platform to balloon-expandable valves, enabling competition and price negotiation in the rapidly growing TAVR market.',
  },
  {
    device_name: 'Impella CP Heart Pump',
    company: 'Abiomed',
    k_number_or_pma: 'P140003',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DSQ',
    clearance_date: '2016-03-23',
    review_days: 365,
    device_category: 'cardiovascular',
    indication_for_use:
      'Temporary ventricular support for up to 6 hours for cardiogenic shock or decompensated heart failure, providing up to 4.0 L/min of forward flow.',
    primary_endpoint: 'Hemodynamic stabilization at 6 hours (MAP, cardiac index)',
    sample_size: 449,
    clinical_study_required: true,
    landmark_significance:
      'First percutaneous temporary mechanical circulatory support device to gain broad use in the cath lab for cardiogenic shock, changing the interventional cardiology workflow for high-risk PCI.',
  },
  {
    device_name: 'Micra Transcatheter Pacing System',
    company: 'Medtronic',
    k_number_or_pma: 'P150033',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DSK',
    clearance_date: '2016-04-06',
    review_days: 352,
    device_category: 'cardiovascular',
    indication_for_use:
      'Single-chamber ventricular pacing via a leadless, self-contained, catheter-delivered intracardiac pacemaker for patients with bradycardia requiring VVI pacing.',
    primary_endpoint: 'Pacing capture threshold acceptance and freedom from system-related or procedure-related major complications at 6 months',
    sample_size: 725,
    clinical_study_required: true,
    landmark_significance:
      'First FDA-approved leadless pacemaker, eliminating the surgical pocket and transvenous lead that cause the majority of traditional pacemaker complications.',
  },
  {
    device_name: 'Farapulse Pulsed Field Ablation System',
    company: 'Boston Scientific',
    k_number_or_pma: 'DEN210040',
    pathway: 'De Novo',
    device_class: 'Class II',
    product_code: 'QRC',
    clearance_date: '2024-01-19',
    review_days: 407,
    device_category: 'cardiovascular',
    indication_for_use:
      'Pulsed field ablation (PFA) for the treatment of drug-refractory recurrent symptomatic paroxysmal atrial fibrillation via pulmonary vein isolation.',
    primary_endpoint: 'Freedom from atrial arrhythmia recurrence at 12 months and acute procedural success',
    sample_size: 607,
    clinical_study_required: true,
    landmark_significance:
      'First pulsed field ablation system cleared in the US, introducing a tissue-selective energy modality that ablates cardiac tissue while sparing surrounding structures like the esophagus and phrenic nerve.',
  },
  {
    device_name: 'LINQ II Insertable Cardiac Monitor',
    company: 'Medtronic',
    k_number_or_pma: 'K201723',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'DSI',
    clearance_date: '2021-02-12',
    review_days: 142,
    device_category: 'cardiovascular',
    indication_for_use:
      'Continuous monitoring and recording of subcutaneous ECG in patients at risk for cardiac arrhythmias, including patients with cryptogenic stroke, unexplained syncope, or atrial fibrillation.',
    clinical_study_required: false,
    landmark_significance:
      'Extended battery life to 4+ years with Bluetooth connectivity, enabling long-term remote cardiac monitoring and establishing the insertable cardiac monitor as a standard tool for cryptogenic stroke workup.',
  },
  {
    device_name: 'Shockwave Intravascular Lithotripsy (IVL) System',
    company: 'Shockwave Medical',
    k_number_or_pma: 'K182432',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'QGM',
    clearance_date: '2019-02-13',
    review_days: 183,
    device_category: 'cardiovascular',
    indication_for_use:
      'Intravascular lithotripsy for the treatment of severely calcified coronary arterial lesions using localized sonic pressure waves delivered via a balloon catheter to fracture calcium and facilitate stent deployment.',
    primary_endpoint: 'Procedural success (stent delivery with <50% residual stenosis)',
    sample_size: 431,
    clinical_study_required: true,
    landmark_significance:
      'First application of lithotripsy to coronary arteries, creating a new treatment paradigm for calcified lesions that were previously untreatable or required aggressive atherectomy.',
  },
  {
    device_name: 'Aveir VR Leadless Pacemaker',
    company: 'Abbott',
    k_number_or_pma: 'P210026',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DSK',
    clearance_date: '2022-03-16',
    review_days: 318,
    device_category: 'cardiovascular',
    indication_for_use:
      'Single-chamber ventricular pacing via a leadless intracardiac pacemaker with active fixation helix for patients requiring VVI pacing for bradycardia.',
    primary_endpoint: 'Freedom from procedure- or system-related serious adverse events and adequate pacing performance at 6 months',
    sample_size: 350,
    clinical_study_required: true,
    landmark_significance:
      'First retrievable leadless pacemaker, designed for extraction and replacement, addressing a critical limitation of prior leadless devices that were intended to remain implanted permanently.',
  },
  {
    device_name: 'MitraClip G4 Transcatheter Mitral Valve Repair System',
    company: 'Abbott',
    k_number_or_pma: 'P100009/S017',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'QBC',
    clearance_date: '2019-03-14',
    review_days: 296,
    device_category: 'cardiovascular',
    indication_for_use:
      'Percutaneous reduction of significant mitral regurgitation (MR >= 3+) in patients who are at prohibitive risk for mitral valve surgery, using a clip-based edge-to-edge repair technique.',
    primary_endpoint: 'Composite of freedom from device-related complications and reduction of MR to moderate or less at 12 months',
    sample_size: 614,
    clinical_study_required: true,
    landmark_significance:
      'COAPT trial data demonstrated a landmark 29% absolute mortality reduction in functional MR, establishing transcatheter mitral repair as a standard of care for heart failure patients with severe secondary MR.',
  },
  {
    device_name: 'HeartMate 3 Left Ventricular Assist Device',
    company: 'Abbott (formerly Thoratec/St. Jude)',
    k_number_or_pma: 'P160054',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DSQ',
    clearance_date: '2017-10-18',
    review_days: 378,
    device_category: 'cardiovascular',
    indication_for_use:
      'Long-term mechanical circulatory support as a bridge to transplant or destination therapy in patients with advanced refractory left ventricular heart failure (NYHA Class IIIB or IV).',
    primary_endpoint: 'Survival free from disabling stroke or reoperation to replace the pump at 2 years',
    sample_size: 366,
    clinical_study_required: true,
    landmark_significance:
      'Full-maglev centrifugal pump eliminated mechanical bearings and blood-contacting surfaces, dramatically reducing pump thrombosis rates compared to axial-flow LVADs and setting a new standard for destination therapy.',
  },
  {
    device_name: 'TriClip Transcatheter Tricuspid Valve Repair System',
    company: 'Abbott',
    k_number_or_pma: 'K222055',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'QBC',
    clearance_date: '2023-04-03',
    review_days: 198,
    device_category: 'cardiovascular',
    indication_for_use:
      'Transcatheter edge-to-edge repair for the reduction of clinically significant tricuspid regurgitation (TR >= 3+) in symptomatic patients who are at high surgical risk.',
    primary_endpoint: 'TR reduction to moderate or less at 30 days',
    sample_size: 350,
    clinical_study_required: true,
    landmark_significance:
      'First FDA-cleared transcatheter tricuspid repair device, opening a new therapeutic frontier for the previously untreated "forgotten valve" and establishing the tricuspid space as a viable device market.',
  },

  // ────────────────────────────────────────────────────────────
  // ORTHOPEDIC (~8 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'Mako SmartRobotics Total Knee Application',
    company: 'Stryker',
    k_number_or_pma: 'K171832',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2017-12-20',
    review_days: 186,
    device_category: 'orthopedic',
    indication_for_use:
      'Robotic-arm assisted total knee arthroplasty (TKA) using CT-based 3D planning for precise bone resection and component positioning in patients with degenerative joint disease.',
    clinical_study_required: false,
    landmark_significance:
      'Expanded robotic-arm surgery from partial to total knee replacement, establishing Stryker as the market leader in robotic orthopedics and accelerating hospital adoption of robotic TKA platforms.',
  },
  {
    device_name: 'ROSA ONE Spine Robotic Surgical Assistant',
    company: 'Zimmer Biomet',
    k_number_or_pma: 'K183273',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2019-01-25',
    review_days: 162,
    device_category: 'orthopedic',
    indication_for_use:
      'Robotic surgical assistant for spinal surgery, providing stereotactic guidance for pedicle screw placement, interbody cage positioning, and other spinal instrumentation procedures.',
    clinical_study_required: false,
    landmark_significance:
      'First robotic platform to cover both spine and knee procedures on a single system, giving Zimmer Biomet a competitive platform strategy against Stryker Mako in the robotic surgery arms race.',
  },
  {
    device_name: 'Persona Total Knee System',
    company: 'Zimmer Biomet',
    k_number_or_pma: 'K130165',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OPZ',
    clearance_date: '2013-11-07',
    review_days: 127,
    device_category: 'orthopedic',
    indication_for_use:
      'Total knee replacement for the treatment of severely disabled joints resulting from osteoarthritis, traumatic arthritis, rheumatoid arthritis, or post-traumatic deformity, using an anatomically shaped implant system.',
    clinical_study_required: false,
    landmark_significance:
      'Introduced the concept of shape-matching knee implant technology with 8 size increments per component, offering patient-specific fit and reducing the need for intra-operative compromises in component sizing.',
  },
  {
    device_name: 'ATTUNE Total Knee Replacement System',
    company: 'DePuy Synthes (J&J)',
    k_number_or_pma: 'K131407',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OPZ',
    clearance_date: '2013-12-19',
    review_days: 138,
    device_category: 'orthopedic',
    indication_for_use:
      'Total knee arthroplasty for patients with painful, disabling joint disease of the knee resulting from degenerative or rheumatoid arthritis, featuring a redesigned patellofemoral articulation.',
    clinical_study_required: false,
    landmark_significance:
      'Major redesign of the DePuy knee platform with improved mid-flexion stability and reduced anterior knee pain, recapturing market share from competitors and becoming one of the highest-volume TKA systems globally.',
  },
  {
    device_name: 'Pulse Integrated Surgical Navigation Platform',
    company: 'NuVasive',
    k_number_or_pma: 'K190934',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2019-07-18',
    review_days: 145,
    device_category: 'orthopedic',
    indication_for_use:
      'Intraoperative surgical navigation for spinal procedures, providing real-time imaging, rod bending planning, and neuromonitoring integration on a single platform.',
    clinical_study_required: false,
    landmark_significance:
      'Integrated navigation, imaging, and neuromonitoring into a single ecosystem, demonstrating the trend toward software-enabled surgical platforms rather than standalone hardware instruments in spine surgery.',
  },
  {
    device_name: 'Mako Total Hip Application',
    company: 'Stryker',
    k_number_or_pma: 'K152516',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2015-12-21',
    review_days: 171,
    device_category: 'orthopedic',
    indication_for_use:
      'Robotic-arm assisted total hip arthroplasty for acetabular cup positioning and femoral preparation using CT-based 3D surgical planning and haptic-guided bone preparation.',
    clinical_study_required: false,
    landmark_significance:
      'Pioneered robotic-arm assisted total hip replacement with haptic boundaries, enabling precise acetabular cup placement and reducing outlier positioning that contributes to dislocation and early revision.',
  },
  {
    device_name: 'ExcelsiusGPS Robotic Navigation Platform',
    company: 'Globus Medical',
    k_number_or_pma: 'K170926',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2017-08-18',
    review_days: 153,
    device_category: 'orthopedic',
    indication_for_use:
      'Robotic-guided navigation for spinal surgery, including pedicle screw placement, interbody fusion, and other instrumentation procedures requiring stereotactic surgical guidance.',
    clinical_study_required: false,
    landmark_significance:
      'First robotic spine platform to combine a rigid robotic arm with full navigation, offering direct screw placement without the need for a separate navigation reference frame, streamlining the surgical workflow.',
  },
  {
    device_name: 'CORI Surgical System',
    company: 'Smith+Nephew',
    k_number_or_pma: 'K200754',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OXP',
    clearance_date: '2020-10-28',
    review_days: 176,
    device_category: 'orthopedic',
    indication_for_use:
      'Handheld robotic-assisted surgical system for partial and total knee arthroplasty, utilizing image-free 3D intraoperative mapping without the need for preoperative CT scanning.',
    clinical_study_required: false,
    landmark_significance:
      'First image-free handheld robotic system for knee replacement, eliminating the need for preoperative CT scans and reducing both cost and radiation exposure compared to CT-based robotic platforms.',
  },

  // ────────────────────────────────────────────────────────────
  // NEUROLOGY (~6 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'Percept PC Deep Brain Stimulation System',
    company: 'Medtronic',
    k_number_or_pma: 'P140009/S096',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'MHY',
    clearance_date: '2020-06-19',
    review_days: 287,
    device_category: 'neurology',
    indication_for_use:
      'Deep brain stimulation for the management of symptoms of Parkinson\'s disease, essential tremor, dystonia, epilepsy, and obsessive-compulsive disorder, with BrainSense technology for local field potential sensing.',
    primary_endpoint: 'Improvement in UPDRS motor scores and freedom from serious device-related adverse events',
    sample_size: 204,
    clinical_study_required: true,
    landmark_significance:
      'First DBS system with BrainSense neural signal sensing, enabling clinicians to objectively measure brain activity during programming and laying the foundation for closed-loop adaptive stimulation.',
  },
  {
    device_name: 'RNS System (Responsive Neurostimulation)',
    company: 'NeuroPace',
    k_number_or_pma: 'P100026',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'PFC',
    clearance_date: '2013-11-14',
    review_days: 398,
    device_category: 'neurology',
    indication_for_use:
      'Responsive neurostimulation for the adjunctive treatment of medically refractory partial onset epilepsy in adults (18+) with 1-2 seizure foci, providing continuous ECoG monitoring and triggered stimulation.',
    primary_endpoint: 'Reduction in seizure frequency vs. sham stimulation over the blinded period',
    sample_size: 191,
    clinical_study_required: true,
    landmark_significance:
      'First and only closed-loop brain stimulation system approved by FDA, detecting abnormal electrical activity and delivering responsive stimulation only when needed, representing a paradigm shift from open-loop neurostimulation.',
  },
  {
    device_name: 'HFX iQ Spinal Cord Stimulation System',
    company: 'Nevro',
    k_number_or_pma: 'P150004/S011',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'GZF',
    clearance_date: '2022-01-13',
    review_days: 263,
    device_category: 'neurology',
    indication_for_use:
      'Spinal cord stimulation at 10 kHz frequency for the management of chronic intractable pain of the trunk and/or limbs, including painful diabetic neuropathy, with AI-driven dosing algorithms.',
    primary_endpoint: 'Proportion of subjects with >= 50% pain relief (VAS) at 3 months without stimulation paresthesia',
    sample_size: 356,
    clinical_study_required: true,
    landmark_significance:
      'Pioneered high-frequency (10 kHz) paresthesia-free spinal cord stimulation and later added AI-based individualized dosing, fundamentally changing the SCS paradigm from paresthesia-based to sub-perception therapy.',
  },
  {
    device_name: 'Inspire Upper Airway Stimulation System',
    company: 'Inspire Medical Systems',
    k_number_or_pma: 'P130008',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'QAU',
    clearance_date: '2014-04-30',
    review_days: 331,
    device_category: 'neurology',
    indication_for_use:
      'Hypoglossal nerve stimulation for the treatment of moderate to severe obstructive sleep apnea (AHI 15-65) in patients who have failed or cannot tolerate CPAP therapy.',
    primary_endpoint: 'Reduction in AHI and ODI at 12 months compared to baseline',
    sample_size: 126,
    clinical_study_required: true,
    landmark_significance:
      'Created an entirely new implantable neurostimulation category for sleep apnea, providing the first effective surgical alternative to CPAP and demonstrating sustained efficacy through 5-year follow-up data.',
  },
  {
    device_name: 'Axonics Sacral Neuromodulation System',
    company: 'Axonics Modulation Technologies',
    k_number_or_pma: 'P180025',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'GZF',
    clearance_date: '2019-09-06',
    review_days: 294,
    device_category: 'neurology',
    indication_for_use:
      'Sacral neuromodulation for the treatment of overactive bladder (urge incontinence and urgency-frequency), non-obstructive urinary retention, and fecal incontinence in patients who have failed conservative therapies.',
    primary_endpoint: 'Proportion of patients with >= 50% improvement in OAB symptoms at 6 months',
    sample_size: 129,
    clinical_study_required: true,
    landmark_significance:
      'First rechargeable sacral neuromodulation implant with 15-year longevity, full-body MRI compatibility, and a miniaturized design, breaking Medtronic\'s InterStim monopoly and catalyzing major market competition.',
  },
  {
    device_name: 'Proclaim XR Spinal Cord Stimulation System',
    company: 'Abbott (formerly St. Jude Medical)',
    k_number_or_pma: 'P150004/S001',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'GZF',
    clearance_date: '2019-01-18',
    review_days: 275,
    device_category: 'neurology',
    indication_for_use:
      'Spinal cord stimulation using BurstDR waveform technology for the management of chronic intractable pain of the trunk and/or limbs, with low-dose micro-burst stimulation patterns.',
    primary_endpoint: 'Proportion of subjects with pain relief >= 50% on VAS with BurstDR stimulation at 3 months',
    sample_size: 278,
    clinical_study_required: true,
    landmark_significance:
      'Introduced BurstDR stimulation waveform that modulates both the lateral and medial pain pathways, demonstrating superiority to tonic stimulation and adding a differentiated therapy option in the competitive SCS market.',
  },

  // ────────────────────────────────────────────────────────────
  // DIABETES / METABOLIC (~5 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'Dexcom G7 Continuous Glucose Monitoring System',
    company: 'Dexcom',
    k_number_or_pma: 'K221803',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OIU',
    clearance_date: '2022-12-16',
    review_days: 207,
    device_category: 'diabetes_metabolic',
    indication_for_use:
      'Continuous glucose monitoring for individuals aged 2 years and older with diabetes, providing real-time glucose readings, trend data, and customizable alerts without the need for fingerstick calibration.',
    clinical_study_required: true,
    landmark_significance:
      'Reduced sensor warm-up from 2 hours to 30 minutes with a 60% smaller form factor, achieving the fastest and smallest integrated CGM and enabling non-adjunctive insulin dosing decisions without fingersticks.',
  },
  {
    device_name: 'Omnipod 5 Automated Insulin Delivery System',
    company: 'Insulet Corporation',
    k_number_or_pma: 'K213489',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OZO',
    clearance_date: '2022-01-28',
    review_days: 231,
    device_category: 'diabetes_metabolic',
    indication_for_use:
      'Automated insulin delivery using a tubeless, wearable insulin pump integrated with Dexcom G6 CGM for patients with type 1 diabetes aged 6 years and older, using SmartAdjust algorithm for automated basal delivery.',
    primary_endpoint: 'Change in HbA1c and time in range (70-180 mg/dL) over 3 months',
    sample_size: 245,
    clinical_study_required: true,
    landmark_significance:
      'First tubeless automated insulin delivery system, combining the simplicity of a patch pump with hybrid closed-loop control, dramatically lowering the barrier to AID adoption for insulin-dependent patients.',
  },
  {
    device_name: 'MiniMed 780G Insulin Pump System',
    company: 'Medtronic',
    k_number_or_pma: 'P160017/S076',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'OZO',
    clearance_date: '2023-04-21',
    review_days: 312,
    device_category: 'diabetes_metabolic',
    indication_for_use:
      'Advanced hybrid closed-loop insulin delivery for type 1 diabetes in patients aged 7 years and older, with automated basal and correction bolus delivery based on Guardian 4 sensor glucose values.',
    primary_endpoint: 'Time in range (70-180 mg/dL) and reduction in HbA1c over 3 months',
    sample_size: 319,
    clinical_study_required: true,
    landmark_significance:
      'First system to automate both basal rate adjustment and correction boluses, moving closer to a fully closed-loop artificial pancreas with a meal-announcement-only interaction model.',
  },
  {
    device_name: 'FreeStyle Libre 3 Continuous Glucose Monitor',
    company: 'Abbott',
    k_number_or_pma: 'K221382',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OIU',
    clearance_date: '2022-08-31',
    review_days: 195,
    device_category: 'diabetes_metabolic',
    indication_for_use:
      'Continuous glucose monitoring for adults and children (4 years+) with diabetes, providing real-time continuous glucose readings to a smartphone app with optional alarms, calibration-free, 14-day sensor wear.',
    clinical_study_required: true,
    landmark_significance:
      'Smallest CGM sensor in the world at clearance (about the size of two stacked pennies) with real-time streaming and the lowest-cost 14-day wear period, enabling mass-market CGM adoption including type 2 diabetes.',
  },
  {
    device_name: 't:slim X2 Insulin Pump with Control-IQ',
    company: 'Tandem Diabetes Care',
    k_number_or_pma: 'K193546',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'OZO',
    clearance_date: '2020-01-13',
    review_days: 218,
    device_category: 'diabetes_metabolic',
    indication_for_use:
      'Insulin pump with Control-IQ advanced hybrid closed-loop technology for automated insulin delivery in type 1 diabetes (age 6+), adjusting basal insulin and delivering automatic correction boluses based on Dexcom G6 CGM values.',
    primary_endpoint: 'Time in range (70-180 mg/dL) at 6 months compared to sensor-augmented pump therapy',
    sample_size: 168,
    clinical_study_required: true,
    landmark_significance:
      'First insulin pump to receive FDA clearance with an interoperable automated glycemic controller (iAGC), demonstrating the modular regulatory approach that allows pump + algorithm + CGM component updates independently.',
  },

  // ────────────────────────────────────────────────────────────
  // DIAGNOSTICS (~8 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'FoundationOne CDx',
    company: 'Foundation Medicine (Roche)',
    k_number_or_pma: 'P170019',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'PQP',
    clearance_date: '2017-11-30',
    review_days: 338,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Comprehensive genomic profiling IVD test for detection of substitutions, insertions/deletions, and copy number alterations in 324 genes plus select rearrangements using FFPE solid tumor tissue specimens, as a companion diagnostic for multiple FDA-approved targeted therapies.',
    primary_endpoint: 'Analytical concordance with validated assays for each CDx indication',
    sample_size: 5738,
    clinical_study_required: true,
    landmark_significance:
      'First FDA-approved broad companion diagnostic covering multiple tumor types and therapies on a single NGS panel, establishing the paradigm of "one test, many therapies" genomic profiling in oncology.',
  },
  {
    device_name: 'Guardant360 CDx',
    company: 'Guardant Health',
    k_number_or_pma: 'P200010',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'PQP',
    clearance_date: '2020-08-07',
    review_days: 302,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Liquid biopsy companion diagnostic using cfDNA analysis of blood plasma for the detection of genomic alterations in solid tumors, including EGFR mutations in NSCLC for osimertinib therapy selection.',
    primary_endpoint: 'Positive predictive agreement and negative predictive agreement with tissue-based testing',
    sample_size: 1832,
    clinical_study_required: true,
    landmark_significance:
      'First comprehensive liquid biopsy approved as a companion diagnostic, enabling tumor genomic profiling from a simple blood draw when tissue biopsy is insufficient or unavailable, advancing the "blood-first" testing paradigm.',
  },
  {
    device_name: 'GeneXpert Xpress System',
    company: 'Cepheid (Danaher)',
    k_number_or_pma: 'K190105',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'MOY',
    clearance_date: '2019-06-14',
    review_days: 168,
    device_category: 'ivd_infectious',
    indication_for_use:
      'Rapid molecular diagnostic system for point-of-care detection of infectious diseases, including influenza A/B, RSV, Strep A, and SARS-CoV-2, providing PCR-quality results from a single cartridge in under 30 minutes.',
    clinical_study_required: true,
    landmark_significance:
      'Democratized molecular diagnostics by enabling true near-patient PCR testing outside traditional labs, becoming critical infrastructure during the COVID-19 pandemic for rapid and decentralized testing.',
  },
  {
    device_name: 'BioFire FilmArray 2.0 Syndromic Testing System',
    company: 'bioMerieux (formerly BioFire Diagnostics)',
    k_number_or_pma: 'K192042',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'MOY',
    clearance_date: '2019-11-21',
    review_days: 156,
    device_category: 'ivd_infectious',
    indication_for_use:
      'Multiplex PCR-based syndromic testing for simultaneous identification of multiple pathogens from a single patient sample, including respiratory, gastrointestinal, blood culture, meningitis/encephalitis, and pneumonia panels.',
    clinical_study_required: true,
    landmark_significance:
      'Established syndromic testing as a clinical standard by detecting 20+ pathogens from one sample in one hour, enabling empiric antibiotic de-escalation and antimicrobial stewardship programs across hospitals.',
  },
  {
    device_name: 'Galleri Multi-Cancer Early Detection Test',
    company: 'GRAIL (Illumina)',
    k_number_or_pma: 'DEN200043',
    pathway: 'De Novo',
    device_class: 'Class II',
    product_code: 'QRF',
    clearance_date: '2023-06-02',
    review_days: 468,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Multi-cancer early detection (MCED) blood test using cell-free DNA methylation patterns to screen for a cancer signal across 50+ cancer types, with cancer signal origin prediction, intended for adults aged 50+ at elevated cancer risk.',
    primary_endpoint: 'Cancer detection sensitivity and cancer signal origin accuracy across cancer types',
    sample_size: 6681,
    clinical_study_required: true,
    landmark_significance:
      'First multi-cancer blood test to receive FDA authorization, creating an entirely new screening category (MCED) that can detect cancers with no existing screening method, including pancreatic, liver, and ovarian cancers.',
  },
  {
    device_name: 'Shield Blood-Based Colorectal Cancer Screening Test',
    company: 'Guardant Health',
    k_number_or_pma: 'DEN230017',
    pathway: 'De Novo',
    device_class: 'Class II',
    product_code: 'QRF',
    clearance_date: '2024-07-29',
    review_days: 421,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Blood-based screening test for colorectal cancer (CRC) in average-risk adults aged 45-84 using cell-free DNA analysis, intended as an alternative to existing CRC screening modalities for patients who decline colonoscopy or stool-based tests.',
    primary_endpoint: 'Sensitivity for CRC and advanced adenomas compared to colonoscopy as gold standard',
    sample_size: 7861,
    clinical_study_required: true,
    landmark_significance:
      'First blood-only colorectal cancer screening test to receive FDA authorization, offering a compliance-friendly alternative to colonoscopy and stool-based tests for the large population of unscreened average-risk adults.',
  },
  {
    device_name: 'GeneStrat ddPCR Test',
    company: 'Biodesix',
    k_number_or_pma: 'K191685',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'PQP',
    clearance_date: '2019-09-12',
    review_days: 173,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Droplet digital PCR-based blood test for the rapid detection of EGFR mutations (exon 19 deletions and L858R substitutions) in NSCLC patients, delivering actionable biomarker results within 72 hours of blood draw.',
    clinical_study_required: true,
    landmark_significance:
      'Demonstrated the clinical utility of rapid liquid biopsy turnaround (72 hours vs. 2+ weeks for tissue) in treatment initiation, enabling faster access to targeted therapy in newly diagnosed NSCLC patients.',
  },
  {
    device_name: 'Cologuard Plus Multi-Target Stool DNA Test',
    company: 'Exact Sciences',
    k_number_or_pma: 'DEN230023',
    pathway: 'De Novo',
    device_class: 'Class II',
    product_code: 'QRF',
    clearance_date: '2024-09-20',
    review_days: 387,
    device_category: 'ivd_oncology',
    indication_for_use:
      'Next-generation multi-target stool DNA test for colorectal cancer screening in average-risk adults aged 45 years and older, with improved sensitivity for advanced adenomas through additional methylation and protein biomarkers.',
    primary_endpoint: 'Sensitivity for CRC and specificity for advanced neoplasia compared to colonoscopy',
    sample_size: 10258,
    clinical_study_required: true,
    landmark_significance:
      'Improved advanced adenoma sensitivity from 42% to 75% compared to first-generation Cologuard, addressing the key clinical limitation of stool DNA testing and positioning next-gen Cologuard as a credible alternative to colonoscopy.',
  },

  // ────────────────────────────────────────────────────────────
  // SaMD / DIGITAL HEALTH (~4 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'IDx-DR Autonomous AI Diagnostic System',
    company: 'Digital Diagnostics (formerly IDx Technologies)',
    k_number_or_pma: 'DEN180001',
    pathway: 'De Novo',
    device_class: 'Class II',
    product_code: 'PIB',
    clearance_date: '2018-04-11',
    review_days: 364,
    device_category: 'ophthalmology',
    indication_for_use:
      'Autonomous AI-based diagnostic system for the detection of more-than-mild diabetic retinopathy in adults with diabetes, providing a screening decision (positive/negative) from retinal images without physician interpretation.',
    primary_endpoint: 'Sensitivity and specificity for detecting more-than-mild diabetic retinopathy vs. ETDRS grading',
    sample_size: 900,
    clinical_study_required: true,
    landmark_significance:
      'First FDA-authorized autonomous AI diagnostic system (requiring no physician interpretation), setting the regulatory precedent for AI-based autonomous diagnosis and opening the door for AI diagnostics in primary care settings.',
  },
  {
    device_name: 'Viz.ai LVO Stroke Detection',
    company: 'Viz.ai',
    k_number_or_pma: 'K182177',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'QAS',
    clearance_date: '2018-02-13',
    review_days: 152,
    device_category: 'neurology',
    indication_for_use:
      'AI-powered software for automated analysis of CT angiography images to detect suspected large vessel occlusion (LVO) stroke indicators and alert neurovascular specialists for triage and transfer decisions.',
    clinical_study_required: true,
    landmark_significance:
      'First AI triage and notification software cleared for stroke, demonstrating that AI could reduce time-to-treatment in acute stroke by automatically alerting neurointerventionalists and cutting door-to-puncture times.',
  },
  {
    device_name: 'Caption Health AI-Guided Echocardiography',
    company: 'Caption Health (GE HealthCare)',
    k_number_or_pma: 'K200946',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'IYO',
    clearance_date: '2020-02-07',
    review_days: 168,
    device_category: 'cardiovascular',
    indication_for_use:
      'AI-guided ultrasound software that provides real-time guidance to users for acquiring diagnostic-quality echocardiographic images, including automated ejection fraction calculation, enabling non-expert operators to perform cardiac ultrasound.',
    primary_endpoint: 'Image quality assessment and diagnostic agreement with expert sonographers',
    sample_size: 240,
    clinical_study_required: true,
    landmark_significance:
      'First AI guidance software to enable untrained users (nurses, NPs) to perform diagnostic echocardiography, demonstrating AI\'s ability to democratize specialist imaging and expand cardiac screening to primary care.',
  },
  {
    device_name: 'Eko AI Cardiac Murmur Detection',
    company: 'Eko Health',
    k_number_or_pma: 'K212654',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'QQE',
    clearance_date: '2022-01-24',
    review_days: 137,
    device_category: 'cardiovascular',
    indication_for_use:
      'AI-powered analysis of phonocardiogram and ECG signals from a digital stethoscope to detect heart murmurs indicative of structural heart disease, including aortic stenosis and mitral regurgitation, in a primary care point-of-care setting.',
    primary_endpoint: 'Sensitivity and specificity for detecting clinically significant structural heart murmurs vs. echocardiography',
    sample_size: 3543,
    clinical_study_required: true,
    landmark_significance:
      'Transformed the traditional stethoscope into an AI-powered cardiac screening tool, detecting structural heart disease murmurs at the point of care with higher sensitivity than unaided auscultation by primary care physicians.',
  },

  // ────────────────────────────────────────────────────────────
  // SURGICAL / OTHER (~8 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'da Vinci Xi Surgical System',
    company: 'Intuitive Surgical',
    k_number_or_pma: 'K140903',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'NAY',
    clearance_date: '2014-04-18',
    review_days: 136,
    device_category: 'general_surgery',
    indication_for_use:
      'Robotic-assisted surgical system for minimally invasive surgery including general surgery, gynecology, urology, thoracic, and head/neck procedures, featuring multi-quadrant access and overhead instrument arm architecture.',
    clinical_study_required: false,
    landmark_significance:
      'Fourth-generation da Vinci platform with overhead boom-mounted arms enabling multi-quadrant surgery from a single docking position, cementing Intuitive\'s near-monopoly in robotic surgery and crossing 7 million cumulative procedures.',
  },
  {
    device_name: 'iStent inject W Trabecular Micro-Bypass System',
    company: 'Glaukos Corporation',
    k_number_or_pma: 'P170043',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'OOR',
    clearance_date: '2020-06-25',
    review_days: 341,
    device_category: 'ophthalmology',
    indication_for_use:
      'Micro-invasive glaucoma surgery (MIGS) device for the reduction of intraocular pressure in adult patients with mild-to-moderate open-angle glaucoma, implanted during cataract surgery via two heparin-coated titanium micro-stents into the trabecular meshwork.',
    primary_endpoint: 'Proportion of patients achieving >= 20% IOP reduction from baseline at 24 months without IOP-lowering medications',
    sample_size: 505,
    clinical_study_required: true,
    landmark_significance:
      'Pioneered the MIGS category by creating the smallest FDA-approved implantable device, establishing a new standard of care that offers glaucoma treatment during routine cataract surgery with minimal additional risk.',
  },
  {
    device_name: 'Ion Endoluminal Robotic Bronchoscopy System',
    company: 'Intuitive Surgical',
    k_number_or_pma: 'K190596',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'EOQ',
    clearance_date: '2019-02-01',
    review_days: 162,
    device_category: 'respiratory',
    indication_for_use:
      'Robotic-assisted bronchoscopy system for navigating into peripheral lung nodules for biopsy, using shape-sensing catheter technology and CT-based 3D navigation for diagnosis of lung lesions.',
    clinical_study_required: false,
    landmark_significance:
      'Applied Intuitive\'s robotic expertise to bronchoscopy, enabling biopsy of peripheral lung nodules that are inaccessible to conventional bronchoscopes, addressing a critical gap in early lung cancer diagnosis.',
  },
  {
    device_name: 'Monarch Robotic Bronchoscopy Platform',
    company: 'Auris Health (J&J)',
    k_number_or_pma: 'K181056',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'EOQ',
    clearance_date: '2018-03-22',
    review_days: 148,
    device_category: 'respiratory',
    indication_for_use:
      'Robotic endoscope system for diagnostic and therapeutic bronchoscopic procedures, using electromagnetic navigation and vision-based control for accessing peripheral lung lesions for biopsy.',
    clinical_study_required: false,
    landmark_significance:
      'First robotic bronchoscopy platform to receive FDA clearance, demonstrating the feasibility of robotic-assisted navigation to peripheral lung nodules and catalyzing the robotic bronchoscopy market.',
  },
  {
    device_name: 'LENSAR Laser System',
    company: 'LENSAR Inc.',
    k_number_or_pma: 'K103620',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'HNG',
    clearance_date: '2015-11-06',
    review_days: 193,
    device_category: 'ophthalmology',
    indication_for_use:
      'Femtosecond laser system for use in cataract surgery, including anterior capsulotomy, lens fragmentation/softening, and corneal incisions, with 3D augmented reality visualization for surgical planning.',
    clinical_study_required: false,
    landmark_significance:
      'Introduced augmented reality-assisted femtosecond laser cataract surgery with intraoperative 3D imaging of the crystalline lens, improving the precision of capsulotomy and lens fragmentation.',
  },
  {
    device_name: 'Hugo RAS Robotic-Assisted Surgery System',
    company: 'Medtronic',
    k_number_or_pma: 'K210638',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'NAY',
    clearance_date: '2021-10-22',
    review_days: 209,
    device_category: 'general_surgery',
    indication_for_use:
      'Modular robotic-assisted surgical platform for minimally invasive urologic and gynecologic procedures, featuring independent movable arms and an open-architecture instrument ecosystem.',
    clinical_study_required: false,
    landmark_significance:
      'Medtronic\'s entry into soft-tissue robotic surgery with an open-platform, modular arm architecture that challenges Intuitive\'s da Vinci monopoly by offering a lower cost of ownership and hospital-friendly economics.',
  },
  {
    device_name: 'Senhance Surgical System',
    company: 'Asensus Surgical (formerly TransEnterix)',
    k_number_or_pma: 'K172423',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'NAY',
    clearance_date: '2017-10-13',
    review_days: 221,
    device_category: 'general_surgery',
    indication_for_use:
      'Robotic-assisted surgical system for minimally invasive laparoscopic surgery using eye-tracking camera control, haptic feedback, and reusable standard laparoscopic instruments, for colorectal and gynecologic procedures.',
    clinical_study_required: false,
    landmark_significance:
      'First surgical robot with eye-tracking camera control and haptic feedback, demonstrating an alternative approach to the da Vinci model by leveraging standard reusable instruments rather than proprietary disposables.',
  },
  {
    device_name: 'Monarch Robotic Platform for Endourology',
    company: 'Auris Health (J&J)',
    k_number_or_pma: 'K201985',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'GEX',
    clearance_date: '2021-03-18',
    review_days: 173,
    device_category: 'urology',
    indication_for_use:
      'Robotic endoscope system for urological diagnostic and therapeutic procedures, including flexible ureteroscopy for kidney stone treatment and upper urinary tract visualization with robotic-assisted navigation.',
    clinical_study_required: false,
    landmark_significance:
      'Extended the Monarch robotic platform from bronchoscopy into endourology, demonstrating the multi-specialty expandability of robotic endoscopy platforms and J&J\'s strategy to build a broad robotic surgery ecosystem.',
  },

  // ────────────────────────────────────────────────────────────
  // VASCULAR (~4 records)
  // ────────────────────────────────────────────────────────────

  {
    device_name: 'GORE EXCLUDER AAA Endoprosthesis',
    company: 'W. L. Gore & Associates',
    k_number_or_pma: 'P020004/S072',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'NIV',
    clearance_date: '2018-11-08',
    review_days: 283,
    device_category: 'vascular',
    indication_for_use:
      'Endovascular repair of infrarenal abdominal aortic aneurysms (AAA) with aortic necks >= 15mm, using an expanded PTFE-based stent graft system delivered via the femoral artery to exclude the aneurysm from systemic blood flow.',
    primary_endpoint: 'Freedom from aneurysm-related mortality, type I/III endoleaks, and secondary interventions at 5 years',
    sample_size: 702,
    clinical_study_required: true,
    landmark_significance:
      'Gold-standard endovascular AAA repair device with the longest clinical follow-up data of any endograft, establishing benchmarks for endoleak rates and long-term durability that all subsequent devices are measured against.',
  },
  {
    device_name: 'JET 7 Reperfusion Catheter with MAX',
    company: 'Penumbra',
    k_number_or_pma: 'K191685',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'GYB',
    clearance_date: '2019-10-04',
    review_days: 134,
    device_category: 'vascular',
    indication_for_use:
      'Large-bore aspiration catheter for the revascularization of patients with acute ischemic stroke due to large vessel occlusion, using continuous aspiration thrombectomy without the need for a stent retriever.',
    clinical_study_required: false,
    landmark_significance:
      'Largest-bore aspiration catheter (0.072" ID) cleared for stroke at the time, advancing the aspiration-first approach to mechanical thrombectomy and challenging the stent-retriever-dominant paradigm in acute stroke intervention.',
  },
  {
    device_name: 'ENROUTE Transcarotid Neuroprotection and Stent System',
    company: 'Silk Road Medical',
    k_number_or_pma: 'P180030',
    pathway: 'PMA',
    device_class: 'Class III',
    product_code: 'DQY',
    clearance_date: '2019-09-27',
    review_days: 308,
    device_category: 'vascular',
    indication_for_use:
      'Transcarotid artery revascularization (TCAR) system for the treatment of carotid artery stenosis, providing direct carotid access with temporary flow reversal neuroprotection and self-expanding stent deployment.',
    primary_endpoint: 'Composite of stroke, MI, and death within 30 days of the procedure',
    sample_size: 305,
    clinical_study_required: true,
    landmark_significance:
      'Created a new hybrid surgical-endovascular approach to carotid stenting that combines the neuroprotection of surgical flow reversal with the minimally invasive nature of stenting, reducing stroke rates compared to transfemoral CAS.',
  },
  {
    device_name: 'Shockwave C2+ Coronary IVL Catheter',
    company: 'Shockwave Medical',
    k_number_or_pma: 'K222148',
    pathway: '510(k)',
    device_class: 'Class II',
    product_code: 'QGM',
    clearance_date: '2023-02-17',
    review_days: 164,
    device_category: 'vascular',
    indication_for_use:
      'Intravascular lithotripsy catheter for the treatment of severely calcified coronary artery lesions prior to stent deployment, using sonic pressure waves to selectively fracture intimal and medial calcium.',
    clinical_study_required: true,
    landmark_significance:
      'Extended IVL technology to the coronary vasculature with DISRUPT CAD IV data, providing a safer alternative to high-speed rotational atherectomy for severely calcified coronary lesions and rapidly gaining interventional cardiologist adoption.',
  },
];

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

/**
 * Find predicate devices by device category.
 * Useful for identifying comparable clearances/approvals in a specific clinical area.
 */
export function findPredicatesByCategory(
  category: DeviceCategory,
): PredicateDeviceRecord[] {
  return PREDICATE_DEVICE_DATABASE.filter(
    (d) => d.device_category === category,
  );
}

/**
 * Find predicate devices by regulatory pathway.
 * Useful for benchmarking review timelines and clinical evidence requirements.
 */
export function findPredicatesByPathway(
  pathway: PredicateDeviceRecord['pathway'],
): PredicateDeviceRecord[] {
  return PREDICATE_DEVICE_DATABASE.filter((d) => d.pathway === pathway);
}

/**
 * Find predicate devices by keyword match against indication_for_use.
 * All keywords must be present (AND logic) for a match.
 * Case-insensitive.
 */
export function findPredicatesByUse(
  keywords: string[],
): PredicateDeviceRecord[] {
  const normalizedKeywords = keywords.map((k) => k.toLowerCase());
  return PREDICATE_DEVICE_DATABASE.filter((d) => {
    const indication = d.indication_for_use.toLowerCase();
    return normalizedKeywords.every((kw) => indication.includes(kw));
  });
}
