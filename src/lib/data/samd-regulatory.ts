// ============================================================
// TERRAIN — SaMD (Software as a Medical Device) Regulatory Framework
// src/lib/data/samd-regulatory.ts
//
// Comprehensive regulatory data for Digital Health / SaMD:
// FDA pathways, PCCP framework for AI/ML, IEC 62304,
// clinical evidence tiers, international regulations,
// cybersecurity requirements, and market subcategories.
// ============================================================

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

/** IMDRF SaMD risk classification (I = lowest, IV = highest) */
export type SaMDRiskClass = 'I' | 'II' | 'III' | 'IV';

export type ClinicalEvidenceLevel = 'none' | 'analytical_only' | 'clinical_valid' | 'prospective';

/** AI/ML algorithm modification type (PCCP framework) */
export type AIMLChangeType = 'locked' | 'predetermined' | 'adaptive';

// ────────────────────────────────────────────────────────────
// SaMD REGULATORY PATHWAYS
// ────────────────────────────────────────────────────────────

export interface SaMDRegulatoryPathway {
  pathway: string;
  description: string;
  applicable_risk_class: SaMDRiskClass[];
  fda_device_class: string;
  avg_review_months: number;
  total_to_market_months: { optimistic: number; realistic: number; pessimistic: number };
  clinical_evidence_required: ClinicalEvidenceLevel;
  predicate_required: boolean;
  typical_cost_range: { low_k: number; high_k: number };
  key_requirements: string[];
  fda_guidance_documents: string[];
  success_rate_pct: number;
  notable_clearances: { product: string; company: string; year: number; indication: string }[];
}

export const SAMD_REGULATORY_PATHWAYS: SaMDRegulatoryPathway[] = [
  {
    pathway: '510(k) Software Device',
    description:
      'Most common pathway for SaMD. Demonstrates substantial equivalence to a legally marketed predicate device. Suitable for Class II devices with existing predicates.',
    applicable_risk_class: ['II'],
    fda_device_class: 'Class II',
    avg_review_months: 6,
    total_to_market_months: { optimistic: 8, realistic: 12, pessimistic: 18 },
    clinical_evidence_required: 'analytical_only',
    predicate_required: true,
    typical_cost_range: { low_k: 150, high_k: 500 },
    key_requirements: [
      'Predicate device identification and comparison',
      'Software documentation (IEC 62304 Level of Concern)',
      'Performance testing (analytical validation)',
      'Cybersecurity documentation (FDA premarket guidance)',
      'Human factors / usability testing',
      'Software description including SOUP (Software of Unknown Provenance)',
      'Electromagnetic compatibility testing (if applicable)',
      'Labeling (intended use, indications, warnings)',
    ],
    fda_guidance_documents: [
      'Software as a Medical Device (SaMD): Clinical Evaluation (2017)',
      'Guidance for the Content of Premarket Submissions for Device Software Functions (2023)',
      'Cybersecurity in Medical Devices (2023)',
      'Clinical Decision Support Software (2022)',
    ],
    success_rate_pct: 82,
    notable_clearances: [
      { product: 'Viz LVO', company: 'Viz.ai', year: 2018, indication: 'Large vessel occlusion stroke triage' },
      { product: 'Aidoc ICH', company: 'Aidoc', year: 2020, indication: 'Intracranial hemorrhage detection on CT' },
      { product: 'Caption Health', company: 'Caption Health', year: 2020, indication: 'AI-guided cardiac ultrasound' },
      { product: 'Paige Prostate', company: 'Paige AI', year: 2021, indication: 'AI prostate cancer detection in pathology' },
    ],
  },
  {
    pathway: 'De Novo Novel SaMD',
    description:
      'For novel, low-to-moderate risk SaMD without an existing predicate. Creates a new device classification. Used when 510(k) is unavailable but device does not warrant PMA.',
    applicable_risk_class: ['II', 'III'],
    fda_device_class: 'Class II (most) or Class I',
    avg_review_months: 11,
    total_to_market_months: { optimistic: 14, realistic: 20, pessimistic: 30 },
    clinical_evidence_required: 'clinical_valid',
    predicate_required: false,
    typical_cost_range: { low_k: 300, high_k: 1200 },
    key_requirements: [
      'Risk-based classification justification',
      'Clinical validation study (retrospective or prospective)',
      'Comprehensive software documentation (IEC 62304)',
      'Performance data demonstrating safety and effectiveness',
      'Proposed special controls for device classification',
      'Cybersecurity plan',
      'Human factors validation study',
      'Labeling with full performance characteristics',
    ],
    fda_guidance_documents: [
      'De Novo Classification Process (2021)',
      'Software as a Medical Device (SaMD): Clinical Evaluation (2017)',
      'Artificial Intelligence and Machine Learning in SaMD (2021)',
    ],
    success_rate_pct: 72,
    notable_clearances: [
      { product: 'IDx-DR', company: 'Digital Diagnostics', year: 2018, indication: 'Autonomous AI detection of diabetic retinopathy — first fully autonomous AI diagnostic' },
      { product: 'Apple Watch ECG', company: 'Apple', year: 2018, indication: 'Over-the-counter ECG for atrial fibrillation detection' },
      { product: 'KidneyIntelX', company: 'RenalytixAI', year: 2022, indication: 'AI-enabled kidney disease progression risk assessment' },
      { product: 'Butterfly iQ', company: 'Butterfly Network', year: 2017, indication: 'Single-probe whole-body ultrasound with AI guidance' },
    ],
  },
  {
    pathway: 'PMA High-Risk SaMD',
    description:
      'Premarket Approval for highest-risk SaMD (Class III). Requires prospective clinical evidence of safety and effectiveness. Used for devices making critical clinical decisions.',
    applicable_risk_class: ['III', 'IV'],
    fda_device_class: 'Class III',
    avg_review_months: 14,
    total_to_market_months: { optimistic: 24, realistic: 36, pessimistic: 48 },
    clinical_evidence_required: 'prospective',
    predicate_required: false,
    typical_cost_range: { low_k: 1500, high_k: 5000 },
    key_requirements: [
      'Prospective clinical trial(s) demonstrating safety and effectiveness',
      'IDE (Investigational Device Exemption) for clinical studies',
      'Comprehensive manufacturing and quality system information',
      'Complete software lifecycle documentation (IEC 62304)',
      'Cybersecurity plan with SBOM (Software Bill of Materials)',
      'Post-market surveillance plan',
      'Human factors validation study',
      'Clinical performance benchmarks vs. standard of care',
    ],
    fda_guidance_documents: [
      'Premarket Approval (PMA) (2019)',
      'Clinical Evidence for SaMD (IMDRF N41, 2017)',
      'IDE Guidance for Early Feasibility Studies (2013)',
    ],
    success_rate_pct: 65,
    notable_clearances: [
      { product: 'RAPID ICH/LVO', company: 'iSchemaView/RapidAI', year: 2018, indication: 'CT perfusion for stroke treatment decision (PMA supplement)' },
    ],
  },
  {
    pathway: 'Exempt / Non-Device (CDS Criteria)',
    description:
      '21st Century Cures Act exemption for Clinical Decision Support (CDS) software meeting all 4 criteria: (1) not intended to acquire/analyze medical images or signals, (2) intended for display to HCP, (3) intended for HCP to independently review basis of recommendation, (4) intended as an aid only, not replacement for clinical judgment.',
    applicable_risk_class: ['I'],
    fda_device_class: 'Not a device (exempt)',
    avg_review_months: 0,
    total_to_market_months: { optimistic: 0, realistic: 2, pessimistic: 4 },
    clinical_evidence_required: 'none',
    predicate_required: false,
    typical_cost_range: { low_k: 0, high_k: 50 },
    key_requirements: [
      'Must meet ALL 4 CDS criteria under 21st Century Cures Act Section 3060(a)',
      'Cannot acquire, process, or analyze medical images, signals, or patterns',
      'Must display to healthcare professional (not patient-facing autonomous)',
      'Must allow HCP to independently review basis of recommendation',
      'Must be intended as aid only, not replacement for clinical judgment',
      'Self-assessment documentation recommended',
      'If any criterion is not met, product is a device and needs 510(k)/De Novo/PMA',
    ],
    fda_guidance_documents: [
      'Clinical Decision Support Software (2022)',
      '21st Century Cures Act Section 3060(a)',
      'Policy for Device Software Functions and Mobile Medical Applications (2019)',
    ],
    success_rate_pct: 100,
    notable_clearances: [
      { product: 'UpToDate / DynaMed', company: 'Wolters Kluwer / EBSCO', year: 2020, indication: 'Clinical reference CDS — meets 4 criteria' },
      { product: 'Drug interaction checkers', company: 'Various', year: 2020, indication: 'EHR-integrated drug-drug interaction alerts' },
    ],
  },
  {
    pathway: 'Breakthrough Device SaMD',
    description:
      'Expedited pathway for devices providing more effective treatment/diagnosis of life-threatening or irreversibly debilitating conditions. Interactive review with FDA CDRH. Can be combined with 510(k), De Novo, or PMA.',
    applicable_risk_class: ['II', 'III', 'IV'],
    fda_device_class: 'Class II or III (depends on underlying pathway)',
    avg_review_months: 8,
    total_to_market_months: { optimistic: 10, realistic: 16, pessimistic: 24 },
    clinical_evidence_required: 'clinical_valid',
    predicate_required: false,
    typical_cost_range: { low_k: 300, high_k: 2000 },
    key_requirements: [
      'Breakthrough Device Designation (BDD) application to FDA',
      'Must demonstrate device provides more effective treatment/diagnosis of life-threatening condition',
      'Interactive review — sprint discussions, data development plan agreement',
      'Pre-submission meetings with FDA',
      'Underlying 510(k), De Novo, or PMA submission with priority review',
      'Post-market data collection may be required',
    ],
    fda_guidance_documents: [
      'Breakthrough Devices Program (2018)',
      'Expedited Access for Premarket Approval and De Novo Medical Devices (2015)',
    ],
    success_rate_pct: 78,
    notable_clearances: [
      { product: 'Guardian Connect CGM', company: 'Medtronic', year: 2018, indication: 'Predictive glucose alert system with AI' },
      { product: 'Tempus xT CDx', company: 'Tempus AI', year: 2023, indication: 'NGS-based tumor profiling CDx with AI interpretation' },
      { product: 'ContaCT (stroke)', company: 'Viz.ai', year: 2018, indication: 'AI stroke triage with automated notification' },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// AI/ML PREDETERMINED CHANGE CONTROL PLAN (PCCP) FRAMEWORK
// ────────────────────────────────────────────────────────────

export interface PCCPFramework {
  change_type: AIMLChangeType;
  description: string;
  regulatory_approach: string;
  documentation_requirements: string[];
  fda_review_frequency: string;
  risk_mitigation: string[];
  examples: string[];
}

export const AIML_PCCP_FRAMEWORK: PCCPFramework[] = [
  {
    change_type: 'locked',
    description:
      'Algorithm is frozen after initial training and validation. No modifications to the model after FDA clearance/approval. Any change requires a new regulatory submission.',
    regulatory_approach: 'Standard 510(k)/De Novo/PMA. Each algorithm update = new submission or supplement.',
    documentation_requirements: [
      'Complete training dataset description',
      'Validation study results (fixed test set)',
      'Software version control documentation',
      'Performance specifications (sensitivity, specificity, AUC)',
    ],
    fda_review_frequency: 'Per-change (each update is a new submission)',
    risk_mitigation: [
      'Simplest regulatory approach — well-understood by FDA',
      'Performance is fixed and predictable',
      'No risk of model drift or degradation',
      'Downside: cannot improve without new submission',
    ],
    examples: [
      'IDx-DR (locked model for diabetic retinopathy)',
      'Most currently cleared AI diagnostic devices',
    ],
  },
  {
    change_type: 'predetermined',
    description:
      'Algorithm changes are planned and described in advance via a Predetermined Change Control Plan (PCCP). FDA reviews and authorizes specific categories of changes upfront. Changes within the approved plan do not require new submissions.',
    regulatory_approach:
      'Submit PCCP with initial marketing submission. Describes: (1) description of modifications, (2) modified algorithm protocol, (3) impact assessment methodology, (4) transparency/reporting plan.',
    documentation_requirements: [
      'PCCP document describing planned modification types',
      'Algorithmic change protocol (ACP) — how changes are developed, validated',
      'Impact assessment — how to evaluate if change is safe/effective',
      'Performance monitoring plan',
      'Transparency plan — how users are informed of changes',
      'Re-training dataset requirements and bias monitoring',
    ],
    fda_review_frequency: 'Upfront review of plan; periodic reporting on changes made within plan',
    risk_mitigation: [
      'FDA-endorsed approach for iterative AI/ML improvement',
      'Allows performance improvement without per-change submissions',
      'Changes must stay within pre-approved boundaries',
      'Real-world performance monitoring required',
      'Drift detection and rollback procedures needed',
    ],
    examples: [
      'AI imaging device updating training data with new patient populations',
      'NLP algorithm expanding to new note types within same clinical context',
      'Classifier updating decision thresholds based on accumulated real-world data',
    ],
  },
  {
    change_type: 'adaptive',
    description:
      'Algorithm continuously learns and adapts in real-time from new data without explicit human retraining. Highest regulatory complexity. FDA framework still evolving — no fully adaptive AI devices cleared yet.',
    regulatory_approach:
      'No established FDA pathway. Discussion papers and IMDRF working groups in progress. Would require robust PCCP + continuous monitoring + guardrails + human oversight.',
    documentation_requirements: [
      'Comprehensive PCCP with adaptive change boundaries',
      'Continuous learning protocol',
      'Real-time performance monitoring system',
      'Drift detection with automatic rollback triggers',
      'Human oversight framework — when does a human intervene?',
      'Bias monitoring for evolving datasets',
      'Transparency requirements for users',
    ],
    fda_review_frequency: 'Framework under development — likely continuous monitoring with periodic FDA reporting',
    risk_mitigation: [
      'Highest risk category — model behavior can change unpredictably',
      'Requires sophisticated guardrails and performance bounds',
      'Patient safety monitoring with automated alerts',
      'Mandatory human-in-the-loop for critical decisions',
      'Geographic and demographic performance stratification',
    ],
    examples: [
      'Theoretical: continuously learning sepsis prediction model',
      'Theoretical: adaptive drug dosing algorithm',
      'No FDA-cleared adaptive AI devices as of 2025',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// IEC 62304 SOFTWARE LIFECYCLE CLASSES
// ────────────────────────────────────────────────────────────

export interface IEC62304Class {
  software_class: 'A' | 'B' | 'C';
  risk_level: string;
  description: string;
  development_requirements: string[];
  documentation_requirements: string[];
  testing_requirements: string[];
  examples: string[];
}

export const IEC_62304_CLASSES: IEC62304Class[] = [
  {
    software_class: 'A',
    risk_level: 'No injury or damage to health is possible',
    description:
      'Software system where failure cannot contribute to a hazardous situation. Lightest documentation burden.',
    development_requirements: [
      'Software development planning',
      'Software requirements analysis',
      'Software architecture (basic)',
    ],
    documentation_requirements: [
      'Software development plan',
      'Software requirements specification',
      'Traceability matrix (requirements → verification)',
    ],
    testing_requirements: [
      'Software system testing',
      'Acceptance testing',
    ],
    examples: ['Wellness apps that do not claim medical use', 'Hospital scheduling software', 'Non-diagnostic data viewers'],
  },
  {
    software_class: 'B',
    risk_level: 'Non-serious injury is possible',
    description:
      'Software system where failure can contribute to non-serious injury. Moderate documentation requirements. Most SaMD falls here.',
    development_requirements: [
      'Software development planning',
      'Software requirements analysis',
      'Software architecture design',
      'Software detailed design',
      'Software unit implementation',
      'Software integration and testing',
      'Software risk management (per ISO 14971)',
      'Software configuration management',
    ],
    documentation_requirements: [
      'Software development plan',
      'Software requirements specification',
      'Software architecture document',
      'Software detailed design document',
      'Traceability matrix (requirements → design → verification → validation)',
      'Risk management file',
      'Software maintenance plan',
    ],
    testing_requirements: [
      'Software unit verification',
      'Software integration testing',
      'Software system testing',
      'Acceptance testing',
      'Regression testing for changes',
    ],
    examples: [
      'AI triage notifications (Viz.ai)',
      'Remote patient monitoring alerts',
      'Clinical decision support tools',
      'Most SaMD 510(k) devices',
    ],
  },
  {
    software_class: 'C',
    risk_level: 'Death or serious injury is possible',
    description:
      'Software system where failure can contribute to death or serious injury. Most rigorous documentation and testing requirements. Applies to autonomous diagnostic/treatment systems.',
    development_requirements: [
      'All Class B requirements, plus:',
      'Software detailed design (all units)',
      'Software unit verification (all units)',
      'Static analysis (MISRA, CERT, or equivalent)',
      'Software integration testing (all interfaces)',
      'Formal code review process',
      'Independent verification activities',
    ],
    documentation_requirements: [
      'All Class B documents, plus:',
      'Unit-level design and verification records',
      'Static analysis reports',
      'Code review records',
      'Independent verification records',
      'SBOM (Software Bill of Materials)',
    ],
    testing_requirements: [
      'All Class B testing, plus:',
      'Unit testing (100% of units)',
      'Integration testing (all interfaces)',
      'Static analysis',
      'Penetration testing / security testing',
      'Performance testing under stress conditions',
      'Failure mode testing',
    ],
    examples: [
      'Autonomous diagnostic AI (IDx-DR)',
      'Radiation treatment planning software',
      'Infusion pump control software',
      'ICU decision support with autonomous actions',
    ],
  },
];

// ────────────────────────────────────────────────────────────
// CLINICAL EVIDENCE TIERS
// ────────────────────────────────────────────────────────────

export interface SaMDClinicalEvidenceTier {
  tier: number;
  name: string;
  description: string;
  study_types: string[];
  applicable_risk_classes: SaMDRiskClass[];
  typical_sample_size: string;
  estimated_cost_range_k: { low: number; high: number };
  duration_months: { low: number; high: number };
  regulatory_acceptance: string;
}

export const SAMD_CLINICAL_EVIDENCE_TIERS: SaMDClinicalEvidenceTier[] = [
  {
    tier: 1,
    name: 'Analytical Validation',
    description:
      'Demonstrates the SaMD correctly processes input data and generates accurate output. Tests technical performance (sensitivity, specificity, AUC) on curated datasets.',
    study_types: [
      'Standalone performance testing on curated dataset',
      'Multi-reader multi-case (MRMC) studies',
      'Comparison to reference standard (ground truth)',
      'Subgroup analysis (age, sex, ethnicity, disease severity)',
    ],
    applicable_risk_classes: ['I', 'II'],
    typical_sample_size: '500-5,000 cases (curated dataset)',
    estimated_cost_range_k: { low: 50, high: 300 },
    duration_months: { low: 3, high: 9 },
    regulatory_acceptance: 'Sufficient for most 510(k) SaMD submissions. Must demonstrate performance comparable to predicate.',
  },
  {
    tier: 2,
    name: 'Clinical Validation (Retrospective)',
    description:
      'Demonstrates the SaMD provides clinically meaningful output when used in the intended clinical workflow. Retrospective analysis on real clinical data.',
    study_types: [
      'Retrospective clinical study using real patient data',
      'Multi-site retrospective validation',
      'Reader study comparing AI-assisted vs. unassisted workflow',
      'Time-motion study for workflow impact',
      'Clinical outcome correlation study',
    ],
    applicable_risk_classes: ['II', 'III'],
    typical_sample_size: '1,000-10,000 cases (multi-site)',
    estimated_cost_range_k: { low: 200, high: 800 },
    duration_months: { low: 6, high: 18 },
    regulatory_acceptance: 'Standard for De Novo and Breakthrough Device submissions. Increasingly expected for 510(k) with novel intended use.',
  },
  {
    tier: 3,
    name: 'Clinical Validation (Prospective)',
    description:
      'Prospective clinical trial demonstrating the SaMD improves clinical outcomes or decision-making when deployed in real clinical practice.',
    study_types: [
      'Prospective, multi-center clinical trial',
      'Randomized controlled trial (AI-assisted vs. standard of care)',
      'Pragmatic clinical trial in real-world setting',
      'Adaptive trial design with pre-specified interim analyses',
      'Pivotal study for PMA submission',
    ],
    applicable_risk_classes: ['III', 'IV'],
    typical_sample_size: '500-5,000 patients (prospective enrollment)',
    estimated_cost_range_k: { low: 1000, high: 5000 },
    duration_months: { low: 12, high: 36 },
    regulatory_acceptance: 'Required for PMA Class III devices. Strongest evidence level. May be required for high-risk De Novo.',
  },
];

// ────────────────────────────────────────────────────────────
// INTERNATIONAL SaMD REGULATIONS
// ────────────────────────────────────────────────────────────

export interface InternationalSaMDRegulation {
  jurisdiction: string;
  regulatory_body: string;
  framework: string;
  classification_system: string;
  key_requirements: string[];
  ai_specific_requirements: string[];
  timeline_months: { optimistic: number; realistic: number; pessimistic: number };
  mutual_recognition: string[];
  market_size_b_2025: number;
}

export const INTERNATIONAL_SAMD_REGULATIONS: InternationalSaMDRegulation[] = [
  {
    jurisdiction: 'United States',
    regulatory_body: 'FDA (CDRH)',
    framework: 'FD&C Act + 21st Century Cures Act + FDA SaMD guidance',
    classification_system: 'Class I / II / III (risk-based)',
    key_requirements: [
      '510(k), De Novo, or PMA submission',
      'Quality System Regulation (QSR / 21 CFR 820) — transitioning to ISO 13485',
      'Cybersecurity premarket and postmarket guidance',
      'Software documentation per FDA guidance',
      'Unique Device Identification (UDI)',
    ],
    ai_specific_requirements: [
      'PCCP framework for algorithm modifications (2023 final guidance)',
      'Good Machine Learning Practice (GMLP) guiding principles (2021)',
      'Transparency and explainability requirements',
      'Real-world performance monitoring',
      'Algorithmic bias assessment',
    ],
    timeline_months: { optimistic: 6, realistic: 12, pessimistic: 24 },
    mutual_recognition: [],
    market_size_b_2025: 12.8,
  },
  {
    jurisdiction: 'European Union',
    regulatory_body: 'Notified Bodies (BSI, TUV, etc.) under EC',
    framework: 'MDR 2017/745 + EU AI Act (2024)',
    classification_system: 'Class I / IIa / IIb / III (IMDRF-aligned)',
    key_requirements: [
      'CE marking via Notified Body conformity assessment',
      'EU MDR compliance (full application since May 2021)',
      'ISO 13485 certified QMS',
      'Clinical evaluation per MEDDEV 2.7/1 rev 4',
      'Post-market surveillance and PMCF',
      'EUDAMED registration',
      'EU Authorized Representative',
    ],
    ai_specific_requirements: [
      'EU AI Act (2024) — SaMD classified as high-risk AI system',
      'Conformity assessment for high-risk AI',
      'Data governance and training data documentation',
      'Human oversight requirements',
      'Transparency obligations (users must know they are interacting with AI)',
      'CE marking must cover both MDR and AI Act requirements',
    ],
    timeline_months: { optimistic: 12, realistic: 18, pessimistic: 30 },
    mutual_recognition: ['MDSAP (partial)'],
    market_size_b_2025: 8.5,
  },
  {
    jurisdiction: 'United Kingdom',
    regulatory_body: 'MHRA (Medicines and Healthcare products Regulatory Agency)',
    framework: 'UK MDR 2002 (amended post-Brexit) + Software and AI as Medical Device guidance',
    classification_system: 'Class I / IIa / IIb / III',
    key_requirements: [
      'UKCA marking (UK Conformity Assessed)',
      'UK Approved Body conformity assessment',
      'UK Responsible Person registration',
      'MHRA device registration',
      'ISO 13485 QMS',
    ],
    ai_specific_requirements: [
      'MHRA AI guidance (Software and AI as a Medical Device Change Programme)',
      'NICE Evidence Standards Framework for Digital Health Technologies',
      'Data-driven algorithm assessment framework',
      'UK-specific clinical evidence requirements',
    ],
    timeline_months: { optimistic: 8, realistic: 14, pessimistic: 22 },
    mutual_recognition: [],
    market_size_b_2025: 2.1,
  },
  {
    jurisdiction: 'Japan',
    regulatory_body: 'PMDA (Pharmaceuticals and Medical Devices Agency) + MHLW',
    framework: 'PMD Act + DASH (Developing AI in Society for Healthcare)',
    classification_system: 'Class I / II / III / IV',
    key_requirements: [
      'Shonin (marketing approval) or Todokede (notification)',
      'In-country clinical data may be required',
      'QMS compliance (MHLW Ordinance 169)',
      'Japanese labeling requirements',
      'Marketing Authorization Holder (MAH) in Japan',
    ],
    ai_specific_requirements: [
      'DASH guidelines for AI-based medical devices',
      'SaMD-specific review pathway (2020)',
      'PMDA fast-track for innovative SaMD (SAKIGAKE)',
      'Algorithm change management framework (aligned with IMDRF)',
    ],
    timeline_months: { optimistic: 10, realistic: 16, pessimistic: 28 },
    mutual_recognition: ['MDSAP (participant)'],
    market_size_b_2025: 3.2,
  },
  {
    jurisdiction: 'China',
    regulatory_body: 'NMPA (National Medical Products Administration)',
    framework: 'Regulations on Supervision and Administration of Medical Devices + AI SaMD guidance',
    classification_system: 'Class I / II / III',
    key_requirements: [
      'NMPA registration (Class II: provincial; Class III: national)',
      'In-country clinical trials typically required for Class III',
      'Chinese labeling and IFU',
      'In-country Authorized Representative',
      'GMP inspection by NMPA',
    ],
    ai_specific_requirements: [
      'AI medical device classification catalogue (2021)',
      'AI SaMD-specific technical review guidelines',
      'Algorithm transparency and validation on Chinese patient population',
      'Data localization requirements (health data must reside in China)',
    ],
    timeline_months: { optimistic: 12, realistic: 24, pessimistic: 36 },
    mutual_recognition: [],
    market_size_b_2025: 4.8,
  },
];

// ────────────────────────────────────────────────────────────
// CYBERSECURITY REQUIREMENTS
// ────────────────────────────────────────────────────────────

export interface CybersecurityRequirement {
  category: string;
  fda_guidance_reference: string;
  description: string;
  requirements: string[];
  documentation_needed: string[];
  premarket_vs_postmarket: 'premarket' | 'postmarket' | 'both';
}

export const SAMD_CYBERSECURITY_REQUIREMENTS: CybersecurityRequirement[] = [
  {
    category: 'Secure Product Development Framework (SPDF)',
    fda_guidance_reference: 'Cybersecurity in Medical Devices: Quality System Considerations and Content of Premarket Submissions (2023)',
    description:
      'FDA requires manufacturers to establish and maintain a Secure Product Development Framework encompassing the entire software lifecycle.',
    requirements: [
      'Threat modeling (STRIDE, DREAD, or equivalent)',
      'Security risk assessment integrated with ISO 14971 risk management',
      'Secure design principles (defense in depth, least privilege)',
      'Software Bill of Materials (SBOM) — required since 2023',
      'Third-party software component vulnerability management',
      'Security testing (penetration testing, fuzz testing, SAST/DAST)',
    ],
    documentation_needed: [
      'Threat model document',
      'Security risk assessment',
      'SBOM (cycloneDX or SPDX format)',
      'Security testing reports',
      'Vulnerability assessment results',
    ],
    premarket_vs_postmarket: 'both',
  },
  {
    category: 'Authentication & Access Control',
    fda_guidance_reference: 'Cybersecurity in Medical Devices (2023)',
    description:
      'Devices must implement appropriate authentication and access controls to prevent unauthorized access.',
    requirements: [
      'Multi-factor authentication for privileged access',
      'Role-based access control (RBAC)',
      'Session management and timeout policies',
      'Password policy compliance',
      'Audit logging of authentication events',
    ],
    documentation_needed: [
      'Authentication architecture document',
      'Access control matrix',
      'Audit log specification',
    ],
    premarket_vs_postmarket: 'premarket',
  },
  {
    category: 'Data Protection',
    fda_guidance_reference: 'Cybersecurity in Medical Devices (2023) + HIPAA',
    description:
      'Protection of data at rest, in transit, and during processing. HIPAA compliance for PHI.',
    requirements: [
      'Encryption of data at rest (AES-256 or equivalent)',
      'Encryption of data in transit (TLS 1.2+)',
      'Data integrity verification',
      'PHI de-identification / anonymization capabilities',
      'Backup and recovery mechanisms',
      'Data retention and destruction policies',
    ],
    documentation_needed: [
      'Data flow diagram',
      'Encryption specifications',
      'HIPAA compliance documentation',
      'Data handling procedures',
    ],
    premarket_vs_postmarket: 'both',
  },
  {
    category: 'Software Update Mechanism',
    fda_guidance_reference: 'Postmarket Management of Cybersecurity in Medical Devices (2016) + 2023 update',
    description:
      'Devices must support secure, authenticated software updates and patch management.',
    requirements: [
      'Authenticated and integrity-verified update mechanism',
      'Ability to deploy patches without full regulatory resubmission (for cybersecurity fixes)',
      'Rollback capability for failed updates',
      'Update notification to users',
      'Version tracking and change log',
    ],
    documentation_needed: [
      'Software update procedure',
      'Patch management policy',
      'Version control documentation',
    ],
    premarket_vs_postmarket: 'both',
  },
  {
    category: 'Post-Market Vulnerability Management',
    fda_guidance_reference: 'Postmarket Management of Cybersecurity in Medical Devices (2016)',
    description:
      'Ongoing monitoring, identification, and remediation of cybersecurity vulnerabilities throughout device lifecycle.',
    requirements: [
      'Coordinated vulnerability disclosure policy',
      'Participation in ISAO (Information Sharing and Analysis Organization)',
      'Continuous monitoring of SBOM components for new CVEs',
      'Risk assessment for identified vulnerabilities',
      'Timely patch deployment (critical: 30 days; high: 60 days)',
      'Customer communication plan for vulnerability disclosures',
    ],
    documentation_needed: [
      'Vulnerability disclosure policy',
      'Post-market cybersecurity monitoring plan',
      'Incident response plan',
      'ISAO membership documentation',
    ],
    premarket_vs_postmarket: 'postmarket',
  },
];

// ────────────────────────────────────────────────────────────
// DIGITAL HEALTH SUBCATEGORIES
// ────────────────────────────────────────────────────────────

export interface DigitalHealthSubcategory {
  subcategory: string;
  description: string;
  us_market_size_b_2025: number;
  cagr_5yr_pct: number;
  typical_regulatory_pathway: string;
  key_players: string[];
  reimbursement_status: string;
  technology_stack: string[];
}

export const DIGITAL_HEALTH_SUBCATEGORIES: DigitalHealthSubcategory[] = [
  {
    subcategory: 'AI Diagnostic Imaging',
    description:
      'AI/ML algorithms that analyze medical images (radiology, pathology, dermatology, ophthalmology) to detect, classify, or quantify findings.',
    us_market_size_b_2025: 2.8,
    cagr_5yr_pct: 28,
    typical_regulatory_pathway: '510(k) with predicate (most), De Novo for novel applications',
    key_players: ['Viz.ai', 'Aidoc', 'Paige AI', 'PathAI', 'Tempus', 'Lunit', 'Zebra Medical', 'Arterys'],
    reimbursement_status: 'CPT codes emerging (0689T, 0690T for AI-assisted). NTAP available for qualifying technologies. Hospital budget via reduced read time.',
    technology_stack: ['Deep learning (CNN, transformer)', 'DICOM integration', 'PACS connectivity', 'Cloud/edge inference'],
  },
  {
    subcategory: 'Digital Therapeutics (DTx)',
    description:
      'Software-based interventions that deliver evidence-based therapeutic interventions to prevent, manage, or treat medical conditions.',
    us_market_size_b_2025: 1.2,
    cagr_5yr_pct: 22,
    typical_regulatory_pathway: 'De Novo (most) or 510(k). FDA has cleared ~30 DTx products.',
    key_players: ['Pear Therapeutics (bankrupt 2023)', 'Akili Interactive', 'Better Therapeutics', 'Freespira', 'Mahana', 'Swing Therapeutics'],
    reimbursement_status: 'Challenging. Some CPT codes (e.g., 98975-98981 for remote therapeutic monitoring). Payer adoption inconsistent. Employer and pharma co-pay models emerging.',
    technology_stack: ['Mobile app (iOS/Android)', 'Behavioral algorithms', 'Patient engagement systems', 'EHR integration', 'Outcome measurement'],
  },
  {
    subcategory: 'Remote Patient Monitoring (RPM)',
    description:
      'Systems for collecting and transmitting patient health data from home/remote settings to clinicians for monitoring.',
    us_market_size_b_2025: 5.4,
    cagr_5yr_pct: 18,
    typical_regulatory_pathway: '510(k) for monitoring devices. Software platform may be CDS exempt or 510(k).',
    key_players: ['Livongo/Teladoc', 'Dexcom', 'Abbott (Libre)', 'Biobeat', 'Current Health (Best Buy)', 'Biofourmis'],
    reimbursement_status: 'Strong CMS reimbursement. CPT 99453-99458 for RPM. $55-175/patient/month. Expanded post-COVID.',
    technology_stack: ['Wearable sensors', 'BLE/WiFi connectivity', 'Cloud platform', 'Clinical dashboard', 'Alert engine', 'EHR integration'],
  },
  {
    subcategory: 'Clinical Decision Support (CDS)',
    description:
      'Software providing clinicians with knowledge and patient-specific information to enhance clinical decisions.',
    us_market_size_b_2025: 3.1,
    cagr_5yr_pct: 15,
    typical_regulatory_pathway: 'Many exempt under 21st Century Cures Act CDS criteria. Non-exempt: 510(k) or De Novo.',
    key_players: ['Epic (embedded CDS)', 'Wolters Kluwer (UpToDate)', 'Elsevier (ClinicalKey)', 'Zynx Health', 'EBSCO (DynaMed)'],
    reimbursement_status: 'Typically bundled into EHR/hospital IT budgets. No separate CPT reimbursement for CDS software itself.',
    technology_stack: ['Rules engine', 'Knowledge base', 'EHR integration (FHIR/HL7)', 'NLP', 'Alert management'],
  },
  {
    subcategory: 'AI Drug Discovery',
    description:
      'AI/ML platforms for drug target identification, molecular design, clinical trial optimization, and biomarker discovery. Not SaMD per se but part of digital health ecosystem.',
    us_market_size_b_2025: 4.2,
    cagr_5yr_pct: 35,
    typical_regulatory_pathway: 'Not regulated as medical device (research use only). Downstream drugs go through standard NDA/BLA.',
    key_players: ['Recursion', 'Insilico Medicine', 'Exscientia', 'BenevolentAI', 'Absci', 'Generate Biomedicines'],
    reimbursement_status: 'N/A — pharma R&D investment model. Revenue from drug licensing/partnerships.',
    technology_stack: ['Graph neural networks', 'Generative chemistry', 'Protein structure prediction', 'High-throughput screening integration', 'Clinical trial simulation'],
  },
  {
    subcategory: 'Mental Health SaMD',
    description:
      'Software for mental health assessment, intervention, or monitoring. Includes CBT-based apps, mood tracking with clinical alerts, and AI chatbots for mental health.',
    us_market_size_b_2025: 0.8,
    cagr_5yr_pct: 25,
    typical_regulatory_pathway: 'De Novo (therapeutic claims) or 510(k). Some exempt as wellness tools without medical claims.',
    key_players: ['Woebot Health', 'Wysa', 'Spring Health', 'Ginger/Headspace Health', 'Talkiatry'],
    reimbursement_status: 'Improving. CPT 98975-98981 for RTM. Mental health parity laws support coverage. Employer-sponsored access growing rapidly.',
    technology_stack: ['NLP / conversational AI', 'Mobile app', 'Clinician dashboard', 'PHQ-9/GAD-7 integration', 'Crisis detection algorithms'],
  },
];

// ────────────────────────────────────────────────────────────
// FDA AI/ML AUTHORIZED DEVICE CATALOG (TOP 50)
// ────────────────────────────────────────────────────────────

export interface FDAAuthorizedAIDevice {
  product_name: string;
  company: string;
  clearance_date: string;
  submission_type: '510(k)' | 'De Novo' | 'PMA';
  k_number: string;
  medical_specialty: string;
  indication: string;
  ai_type: 'CADe' | 'CADx' | 'CADt' | 'Triage' | 'Quantification' | 'Workflow' | 'Other';
  modality: string;
}

export const FDA_AUTHORIZED_AI_DEVICES: FDAAuthorizedAIDevice[] = [
  // Radiology — CT
  { product_name: 'Aidoc BriefCase ICH', company: 'Aidoc', clearance_date: '2020-02', submission_type: '510(k)', k_number: 'K193658', medical_specialty: 'Radiology', indication: 'Intracranial hemorrhage triage on CT', ai_type: 'Triage', modality: 'CT' },
  { product_name: 'Aidoc PE', company: 'Aidoc', clearance_date: '2020-05', submission_type: '510(k)', k_number: 'K200160', medical_specialty: 'Radiology', indication: 'Pulmonary embolism triage on CTA', ai_type: 'Triage', modality: 'CT' },
  { product_name: 'Viz LVO', company: 'Viz.ai', clearance_date: '2018-02', submission_type: 'De Novo', k_number: 'DEN180014', medical_specialty: 'Radiology', indication: 'Large vessel occlusion stroke triage', ai_type: 'Triage', modality: 'CT' },
  { product_name: 'Viz Aortic', company: 'Viz.ai', clearance_date: '2023-03', submission_type: '510(k)', k_number: 'K222497', medical_specialty: 'Radiology', indication: 'Aortic disease detection on CT', ai_type: 'Triage', modality: 'CT' },
  { product_name: 'RAPID CTA/CTP', company: 'RapidAI', clearance_date: '2018-04', submission_type: '510(k)', k_number: 'K173584', medical_specialty: 'Radiology', indication: 'CT perfusion for stroke treatment decision', ai_type: 'Quantification', modality: 'CT' },
  { product_name: 'Qure.ai qXR', company: 'Qure.ai', clearance_date: '2020-08', submission_type: '510(k)', k_number: 'K201501', medical_specialty: 'Radiology', indication: 'Chest X-ray abnormality detection', ai_type: 'CADe', modality: 'X-ray' },
  { product_name: 'Annalise.ai CXR', company: 'Annalise.ai', clearance_date: '2022-10', submission_type: '510(k)', k_number: 'K221898', medical_specialty: 'Radiology', indication: 'Chest X-ray triage (124 findings)', ai_type: 'CADe', modality: 'X-ray' },
  { product_name: 'Lunit INSIGHT CXR', company: 'Lunit', clearance_date: '2020-01', submission_type: '510(k)', k_number: 'K192287', medical_specialty: 'Radiology', indication: 'Lung nodule detection on chest X-ray', ai_type: 'CADe', modality: 'X-ray' },
  // Radiology — Mammography
  { product_name: 'Transpara', company: 'ScreenPoint Medical', clearance_date: '2019-10', submission_type: '510(k)', k_number: 'K191994', medical_specialty: 'Radiology', indication: 'Breast cancer detection in mammography', ai_type: 'CADe', modality: 'Mammography' },
  { product_name: 'ProFound AI', company: 'iCAD', clearance_date: '2020-01', submission_type: '510(k)', k_number: 'K192854', medical_specialty: 'Radiology', indication: 'Breast cancer detection in DBT/mammography', ai_type: 'CADe', modality: 'Mammography' },
  { product_name: 'Genius AI Detection', company: 'Hologic', clearance_date: '2020-03', submission_type: '510(k)', k_number: 'K200080', medical_specialty: 'Radiology', indication: 'AI-assisted breast cancer detection in 3D mammography', ai_type: 'CADe', modality: 'Mammography' },
  { product_name: 'MammoScreen', company: 'Therapixel', clearance_date: '2021-03', submission_type: '510(k)', k_number: 'K210278', medical_specialty: 'Radiology', indication: 'Breast cancer suspicion scoring on mammography', ai_type: 'CADx', modality: 'Mammography' },
  // Radiology — MRI
  { product_name: 'SubtleMR', company: 'Subtle Medical', clearance_date: '2019-12', submission_type: '510(k)', k_number: 'K192596', medical_specialty: 'Radiology', indication: 'MRI image enhancement / accelerated acquisition', ai_type: 'Other', modality: 'MRI' },
  { product_name: 'AIR Recon DL', company: 'GE HealthCare', clearance_date: '2020-07', submission_type: '510(k)', k_number: 'K201433', medical_specialty: 'Radiology', indication: 'Deep learning MRI reconstruction', ai_type: 'Other', modality: 'MRI' },
  // Cardiology
  { product_name: 'Apple Watch ECG', company: 'Apple', clearance_date: '2018-09', submission_type: 'De Novo', k_number: 'DEN180044', medical_specialty: 'Cardiology', indication: 'Over-the-counter single-lead ECG for AFib detection', ai_type: 'CADe', modality: 'ECG' },
  { product_name: 'KardiaMobile 6L', company: 'AliveCor', clearance_date: '2019-05', submission_type: '510(k)', k_number: 'K190442', medical_specialty: 'Cardiology', indication: '6-lead personal ECG with AFib detection', ai_type: 'CADe', modality: 'ECG' },
  { product_name: 'Eko Analysis Platform', company: 'Eko Health', clearance_date: '2020-01', submission_type: '510(k)', k_number: 'K192004', medical_specialty: 'Cardiology', indication: 'AI detection of heart murmurs and AFib from stethoscope', ai_type: 'CADe', modality: 'Digital Stethoscope' },
  { product_name: 'Caption Health (Caption AI)', company: 'Caption Health', clearance_date: '2020-02', submission_type: '510(k)', k_number: 'K193468', medical_specialty: 'Cardiology', indication: 'AI-guided cardiac ultrasound for non-expert users', ai_type: 'Workflow', modality: 'Ultrasound' },
  { product_name: 'Tempus ECG', company: 'Tempus AI', clearance_date: '2023-06', submission_type: '510(k)', k_number: 'K231050', medical_specialty: 'Cardiology', indication: 'AI ECG analysis with low EF detection', ai_type: 'CADe', modality: 'ECG' },
  // Pathology
  { product_name: 'Paige Prostate', company: 'Paige AI', clearance_date: '2021-09', submission_type: 'De Novo', k_number: 'DEN200080', medical_specialty: 'Pathology', indication: 'AI prostate cancer detection in whole slide images (first AI pathology device)', ai_type: 'CADe', modality: 'Digital Pathology' },
  { product_name: 'Proscia Galen Prostate', company: 'Proscia', clearance_date: '2023-07', submission_type: '510(k)', k_number: 'K231234', medical_specialty: 'Pathology', indication: 'AI prostate biopsy grading assistance', ai_type: 'CADx', modality: 'Digital Pathology' },
  { product_name: 'PathAI AISight', company: 'PathAI', clearance_date: '2023-11', submission_type: '510(k)', k_number: 'K232001', medical_specialty: 'Pathology', indication: 'AI-powered PDL1 scoring for NSCLC', ai_type: 'CADx', modality: 'Digital Pathology' },
  // Ophthalmology
  { product_name: 'IDx-DR (LumineticsCore)', company: 'Digital Diagnostics', clearance_date: '2018-04', submission_type: 'De Novo', k_number: 'DEN180001', medical_specialty: 'Ophthalmology', indication: 'Autonomous AI detection of diabetic retinopathy (first fully autonomous AI diagnostic)', ai_type: 'CADx', modality: 'Fundus Camera' },
  { product_name: 'EyeArt', company: 'Eyenuk', clearance_date: '2020-08', submission_type: 'De Novo', k_number: 'DEN200020', medical_specialty: 'Ophthalmology', indication: 'Autonomous diabetic retinopathy screening', ai_type: 'CADx', modality: 'Fundus Camera' },
  { product_name: 'IRIS (Diabetic Retinopathy)', company: 'IRIS/Intelligent Retinal Imaging Systems', clearance_date: '2020-11', submission_type: '510(k)', k_number: 'K202142', medical_specialty: 'Ophthalmology', indication: 'Diabetic retinopathy screening assistance', ai_type: 'CADe', modality: 'Fundus Camera' },
  // Dermatology
  { product_name: 'DermaSensor', company: 'DermaSensor', clearance_date: '2024-01', submission_type: 'De Novo', k_number: 'DEN230008', medical_specialty: 'Dermatology', indication: 'Skin cancer detection in primary care (first AI derm device for non-specialists)', ai_type: 'CADe', modality: 'Spectroscopy' },
  // Gastroenterology
  { product_name: 'GI Genius', company: 'Medtronic', clearance_date: '2021-04', submission_type: 'De Novo', k_number: 'DEN200055', medical_specialty: 'Gastroenterology', indication: 'AI polyp detection during colonoscopy', ai_type: 'CADe', modality: 'Endoscopy' },
  { product_name: 'ENDO-AID (CADe)', company: 'Olympus', clearance_date: '2022-03', submission_type: '510(k)', k_number: 'K213867', medical_specialty: 'Gastroenterology', indication: 'AI colorectal polyp detection in endoscopy', ai_type: 'CADe', modality: 'Endoscopy' },
  // Orthopedics / MSK
  { product_name: 'OsteoDetect', company: 'Imagen Technologies', clearance_date: '2018-05', submission_type: 'De Novo', k_number: 'DEN180005', medical_specialty: 'Orthopedics', indication: 'AI wrist fracture detection on X-ray', ai_type: 'CADe', modality: 'X-ray' },
  { product_name: 'BoneView', company: 'Gleamer', clearance_date: '2022-01', submission_type: '510(k)', k_number: 'K213245', medical_specialty: 'Orthopedics', indication: 'AI fracture detection across skeletal regions', ai_type: 'CADe', modality: 'X-ray' },
  // Digital Therapeutics (FDA-cleared)
  { product_name: 'reSET', company: 'Pear Therapeutics', clearance_date: '2017-09', submission_type: 'De Novo', k_number: 'DEN160018', medical_specialty: 'Psychiatry', indication: 'CBT-based DTx for substance use disorders (first FDA-cleared DTx)', ai_type: 'Other', modality: 'Mobile App' },
  { product_name: 'reSET-O', company: 'Pear Therapeutics', clearance_date: '2018-12', submission_type: '510(k)', k_number: 'K183681', medical_specialty: 'Psychiatry', indication: 'DTx for opioid use disorder', ai_type: 'Other', modality: 'Mobile App' },
  { product_name: 'EndeavorRx', company: 'Akili Interactive', clearance_date: '2020-06', submission_type: 'De Novo', k_number: 'DEN200026', medical_specialty: 'Neurology', indication: 'Video game DTx for pediatric ADHD (first game-based DTx)', ai_type: 'Other', modality: 'Mobile App' },
  { product_name: 'Freespira', company: 'Freespira', clearance_date: '2018-01', submission_type: '510(k)', k_number: 'K172946', medical_specialty: 'Psychiatry', indication: 'Biofeedback DTx for PTSD and panic disorder', ai_type: 'Other', modality: 'Sensor + App' },
  { product_name: 'Mahana DTx', company: 'Mahana Therapeutics', clearance_date: '2021-06', submission_type: '510(k)', k_number: 'K210570', medical_specialty: 'Gastroenterology', indication: 'CBT-based DTx for irritable bowel syndrome', ai_type: 'Other', modality: 'Mobile App' },
  { product_name: 'Woebot', company: 'Woebot Health', clearance_date: '2023-09', submission_type: 'De Novo', k_number: 'DEN230006', medical_specialty: 'Psychiatry', indication: 'AI chatbot DTx for mood disorders', ai_type: 'Other', modality: 'Mobile App' },
  { product_name: 'Dario Diabetes', company: 'DarioHealth', clearance_date: '2016-02', submission_type: '510(k)', k_number: 'K152131', medical_specialty: 'Endocrinology', indication: 'AI-powered diabetes management platform', ai_type: 'Workflow', modality: 'App + Glucometer' },
  // RPM / Monitoring
  { product_name: 'Current Health RPM', company: 'Current Health (Best Buy)', clearance_date: '2020-04', submission_type: '510(k)', k_number: 'K200300', medical_specialty: 'General', indication: 'Multi-parameter continuous RPM with AI deterioration detection', ai_type: 'Triage', modality: 'Wearable' },
  { product_name: 'Biofourmis Biovitals', company: 'Biofourmis', clearance_date: '2019-07', submission_type: '510(k)', k_number: 'K191000', medical_specialty: 'Cardiology', indication: 'AI-powered physiological analytics for HF decompensation', ai_type: 'CADe', modality: 'Wearable' },
  { product_name: 'EarlySense InSight', company: 'EarlySense', clearance_date: '2019-03', submission_type: '510(k)', k_number: 'K183400', medical_specialty: 'General', indication: 'Contact-free continuous patient monitoring with AI alerts', ai_type: 'Triage', modality: 'Under-mattress Sensor' },
  // Oncology / Genomics
  { product_name: 'Tempus xT CDx', company: 'Tempus AI', clearance_date: '2023-11', submission_type: '510(k)', k_number: 'K231872', medical_specialty: 'Oncology', indication: 'AI-augmented NGS genomic profiling with CDx claims', ai_type: 'CADx', modality: 'NGS' },
  { product_name: 'FoundationOne CDx', company: 'Foundation Medicine', clearance_date: '2017-11', submission_type: 'PMA', k_number: 'P170019', medical_specialty: 'Oncology', indication: 'Comprehensive genomic profiling CDx (324 genes)', ai_type: 'CADx', modality: 'NGS' },
  // Neurology
  { product_name: 'Brainomix e-Stroke', company: 'Brainomix', clearance_date: '2020-10', submission_type: '510(k)', k_number: 'K202021', medical_specialty: 'Neurology', indication: 'AI analysis of brain CT for stroke (ASPECTS score)', ai_type: 'Quantification', modality: 'CT' },
  { product_name: 'Embrace2', company: 'Empatica', clearance_date: '2018-02', submission_type: 'De Novo', k_number: 'DEN180003', medical_specialty: 'Neurology', indication: 'AI seizure detection wearable (first wearable seizure monitor)', ai_type: 'CADe', modality: 'Wearable' },
  // Lung Screening
  { product_name: 'ClearRead CT', company: 'Riverain Technologies', clearance_date: '2019-09', submission_type: '510(k)', k_number: 'K191345', medical_specialty: 'Radiology', indication: 'AI bone suppression and vessel suppression for lung nodule detection', ai_type: 'CADe', modality: 'CT' },
  { product_name: 'Optellum Virtual Nodule Clinic', company: 'Optellum', clearance_date: '2022-08', submission_type: '510(k)', k_number: 'K221567', medical_specialty: 'Radiology', indication: 'AI lung nodule malignancy risk scoring', ai_type: 'CADx', modality: 'CT' },
  // Wound Care
  { product_name: 'Healthy.io Minuteful Kidney', company: 'Healthy.io', clearance_date: '2021-02', submission_type: 'De Novo', k_number: 'DEN200044', medical_specialty: 'Nephrology', indication: 'Smartphone-based urinalysis with AI for CKD screening', ai_type: 'CADx', modality: 'Smartphone Camera' },
  { product_name: 'Swift Medical MolecuLight', company: 'MolecuLight', clearance_date: '2020-09', submission_type: '510(k)', k_number: 'K201645', medical_specialty: 'Wound Care', indication: 'AI-assisted wound measurement and bacterial fluorescence', ai_type: 'Quantification', modality: 'Imaging Device' },
];

// ────────────────────────────────────────────────────────────
// SaMD BUSINESS MODELS AND PRICING
// ────────────────────────────────────────────────────────────

export interface SaMDBusinessModel {
  model: string;
  description: string;
  typical_pricing: string;
  revenue_per_unit: { low: number; high: number };
  unit_basis: string;
  gross_margin_pct: { low: number; high: number };
  customer_type: string[];
  sales_cycle_months: { low: number; high: number };
  key_metrics: string[];
  examples: { product: string; company: string; pricing_detail: string }[];
}

export const SAMD_BUSINESS_MODELS: SaMDBusinessModel[] = [
  {
    model: 'Per-Scan / Per-Read Fee',
    description: 'Pay-per-use for each image or scan analyzed. Dominant model for AI radiology. Low barrier to adoption.',
    typical_pricing: '$3-50 per scan',
    revenue_per_unit: { low: 3, high: 50 },
    unit_basis: 'per scan/study analyzed',
    gross_margin_pct: { low: 85, high: 95 },
    customer_type: ['Hospital radiology departments', 'Imaging centers', 'Teleradiology companies'],
    sales_cycle_months: { low: 3, high: 9 },
    key_metrics: ['Scans per month', 'Revenue per scan', 'Adoption rate (% of eligible scans)', 'Scan volume growth'],
    examples: [
      { product: 'Aidoc BriefCase', company: 'Aidoc', pricing_detail: '$8-15 per CT scan analyzed; enterprise volume pricing available' },
      { product: 'Viz.ai', company: 'Viz.ai', pricing_detail: '$10-25 per notification; stroke triage premium pricing' },
      { product: 'Lunit INSIGHT', company: 'Lunit', pricing_detail: '$3-8 per chest X-ray; mammography premium $15-25/study' },
    ],
  },
  {
    model: 'Annual Site License / SaaS',
    description: 'Annual subscription per site (hospital/clinic). Predictable revenue for vendor, volume flexibility for customer.',
    typical_pricing: '$50K-500K per site per year',
    revenue_per_unit: { low: 50, high: 500 },
    unit_basis: 'K per site per year',
    gross_margin_pct: { low: 75, high: 90 },
    customer_type: ['Health systems', 'Large hospitals', 'Academic medical centers'],
    sales_cycle_months: { low: 6, high: 18 },
    key_metrics: ['Sites under contract', 'ARR per site', 'NRR (net revenue retention)', 'Logo churn rate'],
    examples: [
      { product: 'RapidAI', company: 'RapidAI', pricing_detail: '$100-300K per site/year; tiered by bed count and modules' },
      { product: 'Caption AI', company: 'Caption Health', pricing_detail: '$100-250K per site/year; includes hardware + AI software' },
      { product: 'Epic AI modules', company: 'Epic Systems', pricing_detail: 'Bundled into EHR license; incremental $50-200K for AI add-ons' },
    ],
  },
  {
    model: 'Per-Patient / Per-Episode',
    description: 'Charge per patient enrolled or per clinical episode. Common for RPM, DTx, and chronic disease management.',
    typical_pricing: '$50-300 per patient per month',
    revenue_per_unit: { low: 50, high: 300 },
    unit_basis: 'per patient per month (PPPM)',
    gross_margin_pct: { low: 70, high: 85 },
    customer_type: ['Health plans', 'Employers', 'Pharma companies (co-pay)', 'Health systems (value-based)'],
    sales_cycle_months: { low: 6, high: 24 },
    key_metrics: ['Enrolled patients', 'PPPM revenue', 'Patient retention (6-month)', 'Outcomes improvement (clinical endpoints)'],
    examples: [
      { product: 'Livongo Diabetes', company: 'Teladoc/Livongo', pricing_detail: '$75-150 PPPM; employer/health plan contract' },
      { product: 'Omada Health', company: 'Omada Health', pricing_detail: '$100-200 PPPM for chronic disease prevention; outcomes-based bonuses' },
      { product: 'Biofourmis', company: 'Biofourmis', pricing_detail: '$100-250 PPPM for hospital-at-home RPM' },
    ],
  },
  {
    model: 'Prescription DTx (Pharmacy Benefit)',
    description: 'Prescription digital therapeutic dispensed via pharmacy benefit. Patient receives Rx from physician, fills at digital pharmacy.',
    typical_pricing: '$200-1,500 per 90-day prescription',
    revenue_per_unit: { low: 200, high: 1500 },
    unit_basis: 'per 90-day prescription fill',
    gross_margin_pct: { low: 80, high: 92 },
    customer_type: ['Patients (via Rx)', 'Health plans (pharmacy benefit)', 'PBMs'],
    sales_cycle_months: { low: 12, high: 36 },
    key_metrics: ['Prescriptions written', 'Fill rate', 'Payer coverage %', 'Patient adherence (days active/90)'],
    examples: [
      { product: 'reSET / reSET-O', company: 'Pear Therapeutics', pricing_detail: 'WAC $1,665/90 days (before bankruptcy); payer coverage was primary challenge' },
      { product: 'EndeavorRx', company: 'Akili', pricing_detail: '$450/90-day supply; shifted to consumer OTC model (EndeavorOTC) after payer challenges' },
      { product: 'Freespira', company: 'Freespira', pricing_detail: '$500-800/treatment course; VA coverage secured' },
    ],
  },
  {
    model: 'Platform / Marketplace',
    description: 'AI platform that aggregates multiple algorithms. Hospital buys platform, accesses curated AI apps. Vendor takes revenue share.',
    typical_pricing: '$100K-1M platform fee + per-use app fees',
    revenue_per_unit: { low: 100, high: 1000 },
    unit_basis: 'K platform fee per year',
    gross_margin_pct: { low: 60, high: 80 },
    customer_type: ['Health systems', 'Large hospital networks', 'Academic medical centers'],
    sales_cycle_months: { low: 9, high: 24 },
    key_metrics: ['Platform sites deployed', 'Apps activated per site', 'GMV through marketplace', 'Developer ecosystem size'],
    examples: [
      { product: 'Nuance AI Marketplace', company: 'Microsoft/Nuance', pricing_detail: '$200K-1M platform + per-app fees; bundled with PowerScribe' },
      { product: 'GE Edison', company: 'GE HealthCare', pricing_detail: 'Platform bundled with GE imaging; AI apps $50-300K each' },
      { product: 'Blackford Platform', company: 'Blackford Analysis', pricing_detail: 'Platform-as-a-Service for hospital AI deployment; revenue share with AI vendors' },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// DTx PRODUCT DATABASE
// ────────────────────────────────────────────────────────────

export interface DTxProduct {
  product_name: string;
  company: string;
  indication: string;
  mechanism: string;
  fda_status: 'cleared' | 'under_review' | 'investigational' | 'consumer_wellness';
  clearance_year?: number;
  prescription_required: boolean;
  pricing_model: string;
  wac_or_price: string;
  payer_coverage: string;
  clinical_evidence: string;
  patient_population: string;
  status: 'active' | 'discontinued' | 'pivoted';
}

export const DTX_PRODUCT_DATABASE: DTxProduct[] = [
  { product_name: 'reSET', company: 'Pear Therapeutics', indication: 'Substance use disorder', mechanism: 'CBT-based interactive modules + clinician dashboard', fda_status: 'cleared', clearance_year: 2017, prescription_required: true, pricing_model: 'Prescription (pharmacy benefit)', wac_or_price: '$1,665/90 days', payer_coverage: 'Limited — primary cause of company failure', clinical_evidence: 'Pivotal RCT: 40% improvement in abstinence vs. treatment-as-usual', patient_population: 'Adults with SUD in outpatient treatment', status: 'discontinued' },
  { product_name: 'reSET-O', company: 'Pear Therapeutics', indication: 'Opioid use disorder', mechanism: 'CBT + contingency management for OUD', fda_status: 'cleared', clearance_year: 2018, prescription_required: true, pricing_model: 'Prescription', wac_or_price: '$1,665/90 days', payer_coverage: 'Some Medicaid coverage in select states', clinical_evidence: 'Pivotal RCT: 77% retention in treatment vs. 63% TAU', patient_population: 'Adults with OUD on buprenorphine', status: 'discontinued' },
  { product_name: 'EndeavorRx', company: 'Akili Interactive', indication: 'Pediatric ADHD', mechanism: 'Video game-based sensory stimuli targeting attention systems', fda_status: 'cleared', clearance_year: 2020, prescription_required: true, pricing_model: 'Pivoted from Rx to OTC consumer', wac_or_price: '$450/90 days (Rx); pivoted to free consumer app', payer_coverage: 'Minimal payer uptake — triggered business model pivot', clinical_evidence: 'Pivotal RCT (STARS): improvement in TOVA attention metric', patient_population: 'Children 8-12 with ADHD', status: 'pivoted' },
  { product_name: 'Freespira', company: 'Freespira', indication: 'PTSD and panic disorder', mechanism: 'Respiratory biofeedback reducing CO2 hypersensitivity', fda_status: 'cleared', clearance_year: 2018, prescription_required: true, pricing_model: 'Per-treatment course', wac_or_price: '$500-800/treatment course', payer_coverage: 'VA coverage secured; commercial coverage growing', clinical_evidence: 'Multiple RCTs: 86% panic symptom reduction; 69% no longer meet PTSD criteria', patient_population: 'Adults with panic disorder or PTSD', status: 'active' },
  { product_name: 'Mahana DTx (Parallel)', company: 'Mahana Therapeutics', indication: 'Irritable bowel syndrome (IBS)', mechanism: 'CBT-based modules adapted from Mahoney RCT protocol', fda_status: 'cleared', clearance_year: 2021, prescription_required: true, pricing_model: 'Prescription', wac_or_price: '$750/3-month treatment', payer_coverage: 'Limited commercial coverage', clinical_evidence: 'Pivotal RCT: significant improvement in IBS-SSS score vs. sham', patient_population: 'Adults with IBS (all subtypes)', status: 'active' },
  { product_name: 'Better Therapeutics (AspyreRx)', company: 'Better Therapeutics', indication: 'Type 2 diabetes', mechanism: 'CBT-based behavioral intervention targeting dietary habits', fda_status: 'cleared', clearance_year: 2023, prescription_required: true, pricing_model: 'Prescription', wac_or_price: '$499/90-day prescription', payer_coverage: 'Coverage negotiations ongoing with major PBMs', clinical_evidence: 'Pivotal RCT: -0.4% HbA1c reduction vs. sham', patient_population: 'Adults with T2D inadequately controlled on metformin', status: 'active' },
  { product_name: 'Woebot', company: 'Woebot Health', indication: 'Major depressive disorder, anxiety', mechanism: 'AI chatbot delivering CBT, DBT, and IPT interventions', fda_status: 'cleared', clearance_year: 2023, prescription_required: true, pricing_model: 'Per-patient', wac_or_price: '$100-200 PPPM (B2B)', payer_coverage: 'Employer and health plan contracts', clinical_evidence: 'RCT: significant PHQ-9 improvement; FDA Breakthrough designation', patient_population: 'Adults with MDD or GAD', status: 'active' },
  { product_name: 'Swing Therapeutics (Stanza)', company: 'Swing Therapeutics', indication: 'Fibromyalgia', mechanism: 'ACT (Acceptance and Commitment Therapy) digital intervention', fda_status: 'cleared', clearance_year: 2023, prescription_required: true, pricing_model: 'Prescription', wac_or_price: '$600/3-month course', payer_coverage: 'Early-stage payer discussions', clinical_evidence: 'Pivotal RCT: improvement in FIQR score vs. sham', patient_population: 'Adults with fibromyalgia', status: 'active' },
  { product_name: 'Dario Diabetes Platform', company: 'DarioHealth', indication: 'Diabetes, hypertension, MSK', mechanism: 'Multi-condition chronic disease management with AI coaching', fda_status: 'cleared', clearance_year: 2016, prescription_required: false, pricing_model: 'B2B2C (employer/health plan)', wac_or_price: '$80-150 PPPM', payer_coverage: 'Extensive employer coverage; health plan partnerships', clinical_evidence: 'Real-world evidence: HbA1c reduction, BP improvement', patient_population: 'Adults with chronic conditions', status: 'active' },
  { product_name: 'Noom Clinical (MedOp)', company: 'Noom', indication: 'Obesity / weight management', mechanism: 'CBT-based behavioral weight management with GLP-1 support', fda_status: 'consumer_wellness', prescription_required: false, pricing_model: 'Consumer subscription + clinical program', wac_or_price: '$59-209/month consumer; B2B contracts vary', payer_coverage: 'Some employer wellness coverage; not FDA-cleared as DTx', clinical_evidence: 'Observational: avg 5-8% body weight loss at 16 weeks', patient_population: 'Adults seeking weight management', status: 'active' },
];

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

/** Recommend the most appropriate SaMD regulatory pathway based on risk class and predicate availability */
export function recommendSaMDPathway(
  riskClass: SaMDRiskClass,
  hasPredicateDevice: boolean,
  isLifeThreatening: boolean,
): SaMDRegulatoryPathway[] {
  const pathways = SAMD_REGULATORY_PATHWAYS.filter((p) =>
    p.applicable_risk_class.includes(riskClass)
  );

  // Sort by relevance
  return pathways.sort((a, b) => {
    // If has predicate and 510(k) is available, prefer it
    if (hasPredicateDevice && a.predicate_required && !b.predicate_required) return -1;
    if (hasPredicateDevice && !a.predicate_required && b.predicate_required) return 1;
    // If life-threatening, Breakthrough Device gets a boost
    if (isLifeThreatening && a.pathway.includes('Breakthrough')) return -1;
    if (isLifeThreatening && b.pathway.includes('Breakthrough')) return 1;
    // Otherwise prefer faster pathways
    return a.total_to_market_months.realistic - b.total_to_market_months.realistic;
  });
}

/** Determine the IEC 62304 software safety class based on hazard severity */
export function getIEC62304Class(
  canCauseSerious: boolean,
  canCauseDeath: boolean,
): IEC62304Class {
  if (canCauseDeath) return IEC_62304_CLASSES[2]; // Class C
  if (canCauseSerious) return IEC_62304_CLASSES[1]; // Class B
  return IEC_62304_CLASSES[0]; // Class A
}

/** Get the required clinical evidence tier based on SaMD risk class */
export function getRequiredEvidenceTier(riskClass: SaMDRiskClass): SaMDClinicalEvidenceTier {
  switch (riskClass) {
    case 'I':
      return SAMD_CLINICAL_EVIDENCE_TIERS[0]; // Analytical only
    case 'II':
      return SAMD_CLINICAL_EVIDENCE_TIERS[1]; // Clinical validation (retrospective)
    case 'III':
    case 'IV':
      return SAMD_CLINICAL_EVIDENCE_TIERS[2]; // Clinical validation (prospective)
  }
}
