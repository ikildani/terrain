// =============================================================================
// Device Competitor Database
// =============================================================================
// 120+ medical device competitors organized by procedure/condition category.
// Used by the device competitive landscape engine.
//
// Sources: FDA 510(k)/PMA databases, company press releases, SEC filings,
// industry publications (MedTech Dive, Evaluate MedTech), 2024-2025 data.
// =============================================================================

import type { DeviceCompetitor, DeviceCategory } from '@/types/devices-diagnostics';

// =============================================================================
// CARDIOVASCULAR (~25 devices)
// =============================================================================

const CARDIOVASCULAR: DeviceCompetitor[] = [
  {
    company: 'Edwards Lifesciences', device_name: 'SAPIEN 3 Ultra RESILIA', device_category: 'cardiovascular',
    procedure_or_condition: 'TAVR', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-03', k_number_or_pma: 'P190039/S018', technology_type: 'Balloon-expandable transcatheter aortic valve',
    installed_base_estimate: 450000, estimated_market_share_pct: 55, asp_estimate: 32500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 10, source: 'Edwards 10-K 2024; PARTNER 3 trial', last_updated: '2025-01',
    strengths: ['Dominant market position', 'PARTNER trial data (gold standard)', 'RESILIA tissue durability', 'Low-risk TAVR indication'],
    weaknesses: ['Premium pricing pressure from Medtronic', 'Valve-in-valve sizing constraints'],
  },
  {
    company: 'Medtronic', device_name: 'Evolut FX+', device_category: 'cardiovascular',
    procedure_or_condition: 'TAVR', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2024-01', k_number_or_pma: 'P130021/S085', technology_type: 'Self-expanding transcatheter aortic valve',
    installed_base_estimate: 320000, estimated_market_share_pct: 35, asp_estimate: 30000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 9, source: 'Medtronic 10-K 2024; Evolut Low Risk trial', last_updated: '2025-01',
    strengths: ['Self-expanding design for tortuous anatomy', 'InLine sheath for low-profile delivery', 'Strong Evolut Low Risk trial data'],
    weaknesses: ['Second to Edwards in market share', 'Higher pacemaker implant rates vs SAPIEN'],
  },
  {
    company: 'Boston Scientific', device_name: 'WATCHMAN FLX Pro', device_category: 'cardiovascular',
    procedure_or_condition: 'Left atrial appendage closure', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-09', k_number_or_pma: 'P130013/S045', technology_type: 'Left atrial appendage occlusion device',
    installed_base_estimate: 350000, estimated_market_share_pct: 85, asp_estimate: 18000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 9, source: 'BSX 10-K 2024; PREVAIL/PROTECT AF trials', last_updated: '2025-01',
    strengths: ['Near-monopoly in LAAC', 'Extensive RCT data', 'FLX Pro improved seal rates', 'Growing OAC-intolerant population'],
    weaknesses: ['Abbott Amulet gaining share', 'Requires procedural learning curve'],
  },
  {
    company: 'Abbott', device_name: 'Amulet', device_category: 'cardiovascular',
    procedure_or_condition: 'Left atrial appendage closure', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2021-08', k_number_or_pma: 'P200009', technology_type: 'Dual-seal LAA closure device',
    installed_base_estimate: 45000, estimated_market_share_pct: 12, asp_estimate: 17500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 8, source: 'Abbott 10-K 2024; Amulet IDE trial', last_updated: '2025-01',
    strengths: ['Dual-seal technology for better closure', 'Amulet IDE trial noninferior to WATCHMAN', 'Wider size range'],
    weaknesses: ['Late market entrant vs WATCHMAN', 'Smaller installed base', 'Less long-term follow-up data'],
  },
  {
    company: 'Biosense Webster (J&J)', device_name: 'CARTO 3 V7', device_category: 'cardiovascular',
    procedure_or_condition: 'Cardiac ablation / EP mapping', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2023-06', technology_type: '3D electroanatomic mapping system',
    installed_base_estimate: 12000, estimated_market_share_pct: 50, asp_estimate: 250000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: 'J&J MedTech 10-K 2024', last_updated: '2025-01',
    strengths: ['Market-leading EP mapping platform', 'THERMOCOOL SMARTTOUCH catheter ecosystem', 'Deep KOL relationships'],
    weaknesses: ['PFA disruption from Farapulse', 'High capital cost limiting ASC adoption'],
  },
  {
    company: 'Boston Scientific (Farapulse)', device_name: 'FARAWAVE', device_category: 'cardiovascular',
    procedure_or_condition: 'Cardiac ablation / Pulsed field ablation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2024-01', k_number_or_pma: 'P230026', technology_type: 'Pulsed field ablation (PFA) catheter',
    installed_base_estimate: 5000, estimated_market_share_pct: 15, asp_estimate: 8500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 10, evidence_strength: 9, source: 'BSX press release 2024; ADVENT trial', last_updated: '2025-01',
    strengths: ['First PFA system in US', 'Tissue-selective (spares esophagus/phrenic)', 'ADVENT trial showed noninferior efficacy', 'Rapid procedure times'],
    weaknesses: ['Nascent technology — long-term durability unknown', 'Premium pricing', 'Single-shot design limits anatomy coverage'],
  },
  {
    company: 'Medtronic', device_name: 'PulseSelect', device_category: 'cardiovascular',
    procedure_or_condition: 'Cardiac ablation / Pulsed field ablation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2024-03', technology_type: 'Pulsed field ablation catheter',
    installed_base_estimate: 2000, estimated_market_share_pct: 5, asp_estimate: 7500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'Medtronic press release 2024; PULSED AF trial', last_updated: '2025-01',
    strengths: ['Focal PFA catheter for targeted lesions', 'Integrates with Arctic Front platform', 'PULSED AF data strong'],
    weaknesses: ['Behind Farapulse in market penetration', 'Learning curve for point-by-point ablation'],
  },
  {
    company: 'Abbott', device_name: 'Xience Sierra', device_category: 'cardiovascular',
    procedure_or_condition: 'PCI / Coronary stent', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2022-10', technology_type: 'Drug-eluting stent (everolimus)',
    installed_base_estimate: 2000000, estimated_market_share_pct: 30, asp_estimate: 1800,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 9, source: 'Abbott 10-K 2024; SPIRIT trials', last_updated: '2025-01',
    strengths: ['Market-leading DES platform', 'Extensive long-term data', 'Sierra thinner strut design'],
    weaknesses: ['Commoditized stent market', 'DCB alternatives emerging'],
  },
  {
    company: 'Boston Scientific', device_name: 'SYNERGY MEGATRON', device_category: 'cardiovascular',
    procedure_or_condition: 'PCI / Coronary stent', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-04', technology_type: 'Bioabsorbable polymer drug-eluting stent',
    installed_base_estimate: 800000, estimated_market_share_pct: 25, asp_estimate: 1900,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: 'BSX 10-K 2024; EVOLVE trials', last_updated: '2025-01',
    strengths: ['Bioabsorbable polymer — no permanent polymer residue', 'MEGATRON for large vessels', 'EVOLVE SHORT DAPT data'],
    weaknesses: ['Higher ASP than generic DES', 'Complex inventory management with multiple sizes'],
  },
  {
    company: 'Abbott', device_name: 'Aveir DR', device_category: 'cardiovascular',
    procedure_or_condition: 'Cardiac pacemaker', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-11', technology_type: 'Dual-chamber leadless pacemaker',
    installed_base_estimate: 15000, estimated_market_share_pct: 10, asp_estimate: 25000,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 10, evidence_strength: 7, source: 'Abbott press release 2023', last_updated: '2025-01',
    strengths: ['First dual-chamber leadless pacemaker', 'Eliminates lead-related complications', 'i2i communication technology'],
    weaknesses: ['Limited long-term data', 'Higher cost vs traditional pacemakers', 'MRI compatibility limitations'],
  },
  {
    company: 'Medtronic', device_name: 'Micra AV', device_category: 'cardiovascular',
    procedure_or_condition: 'Cardiac pacemaker', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2020-01', technology_type: 'Single-chamber leadless pacemaker with AV sync',
    installed_base_estimate: 150000, estimated_market_share_pct: 15, asp_estimate: 20000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: 'Medtronic 10-K 2024; Micra CED study', last_updated: '2025-01',
    strengths: ['Proven leadless platform', 'AV synchrony without atrial lead', '150K+ implants globally'],
    weaknesses: ['Single-chamber only', 'Behind Abbott Aveir DR in dual-chamber'],
  },
  {
    company: 'Abbott', device_name: 'HeartMate 3', device_category: 'cardiovascular',
    procedure_or_condition: 'Heart failure / LVAD', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2018-10', technology_type: 'Left ventricular assist device (centrifugal flow)',
    installed_base_estimate: 35000, estimated_market_share_pct: 90, asp_estimate: 85000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 10, source: 'Abbott 10-K 2024; MOMENTUM 3 trial', last_updated: '2025-01',
    strengths: ['Near-monopoly in LVAD market', 'Full MagLev technology (no mechanical bearings)', 'MOMENTUM 3 gold-standard data'],
    weaknesses: ['Driveline infection risk', 'Destination therapy questions', 'High total cost of ownership'],
  },
];

// =============================================================================
// ORTHOPEDIC (~20 devices)
// =============================================================================

const ORTHOPEDIC: DeviceCompetitor[] = [
  {
    company: 'Zimmer Biomet', device_name: 'Persona IQ', device_category: 'orthopedic',
    procedure_or_condition: 'Total knee arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-04', technology_type: 'Smart knee implant with embedded sensors',
    installed_base_estimate: 20000, estimated_market_share_pct: 28, asp_estimate: 8500,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 9, evidence_strength: 7, source: 'Zimmer Biomet 10-K 2024', last_updated: '2025-01',
    strengths: ['First smart knee with embedded sensors', 'Real-time gait data for recovery monitoring', 'Persona platform market leader'],
    weaknesses: ['Higher cost vs standard implants', 'Sensor battery life limitations', 'Data utility still being proven'],
  },
  {
    company: 'Stryker', device_name: 'Mako TKA', device_category: 'orthopedic',
    procedure_or_condition: 'Total knee arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2017-06', technology_type: 'Robotic-assisted TKA system',
    installed_base_estimate: 3500, estimated_market_share_pct: 22, asp_estimate: 1200000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 8, source: 'Stryker 10-K 2024', last_updated: '2025-01',
    strengths: ['Market-leading robotic ortho platform', '3500+ Mako systems installed', 'Surgeon satisfaction scores high', 'CT-based preoperative planning'],
    weaknesses: ['High capital cost ($1M+)', 'Ongoing per-procedure costs', 'Clinical superiority vs manual debated'],
  },
  {
    company: 'DePuy Synthes (J&J)', device_name: 'ATTUNE Revision', device_category: 'orthopedic',
    procedure_or_condition: 'Total knee arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2021-03', technology_type: 'Total knee replacement system',
    installed_base_estimate: 800000, estimated_market_share_pct: 20, asp_estimate: 6500,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 8, source: 'J&J MedTech 10-K 2024', last_updated: '2025-01',
    strengths: ['ATTUNE platform stability and fixation', 'Broad size range', 'VELYS robot integration'],
    weaknesses: ['Trailing Zimmer and Stryker in robotics adoption', 'Some early tibial loosening concerns with S+ cementless'],
  },
  {
    company: 'Smith+Nephew', device_name: 'CORI Surgical System', device_category: 'orthopedic',
    procedure_or_condition: 'Total knee arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-01', technology_type: 'Handheld robotic-assisted TKA',
    installed_base_estimate: 1500, estimated_market_share_pct: 8, asp_estimate: 350000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 6, source: 'Smith+Nephew 20-F 2024', last_updated: '2025-01',
    strengths: ['Lower capital cost than Mako', 'Imageless (no CT scan needed)', 'Portable handheld design'],
    weaknesses: ['Smaller installed base', 'Less clinical evidence than Mako', 'Execution challenges in S+N restructuring'],
  },
  {
    company: 'Stryker', device_name: 'Mako THA', device_category: 'orthopedic',
    procedure_or_condition: 'Total hip arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2015-12', technology_type: 'Robotic-assisted THA system',
    installed_base_estimate: 3500, estimated_market_share_pct: 18, asp_estimate: 1200000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 8, source: 'Stryker 10-K 2024', last_updated: '2025-01',
    strengths: ['Leading robotic THA platform', 'Proven accuracy in cup placement', 'Dual TKA/THA capability on single system'],
    weaknesses: ['Capital cost barrier for lower-volume facilities', 'Surgeon learning curve'],
  },
  {
    company: 'DePuy Synthes (J&J)', device_name: 'Pinnacle Hip System', device_category: 'orthopedic',
    procedure_or_condition: 'Total hip arthroplasty', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2004-06', technology_type: 'Modular acetabular cup system',
    installed_base_estimate: 3000000, estimated_market_share_pct: 30, asp_estimate: 5500,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 9, source: 'J&J MedTech 10-K 2024', last_updated: '2025-01',
    strengths: ['Largest installed base in THA', 'Extensive long-term survivorship data', 'Modular versatility'],
    weaknesses: ['Historical metal-on-metal litigation', 'Aging platform design'],
  },
  {
    company: 'Medtronic', device_name: 'Mazor X Stealth Edition', device_category: 'orthopedic',
    procedure_or_condition: 'Spine surgery / robotic navigation', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2020-05', technology_type: 'Robotic-assisted spine surgery platform',
    installed_base_estimate: 800, estimated_market_share_pct: 35, asp_estimate: 900000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 7, source: 'Medtronic 10-K 2024', last_updated: '2025-01',
    strengths: ['StealthStation navigation integration', 'AI-driven preoperative planning', 'Broad spine implant portfolio'],
    weaknesses: ['Globus ExcelsiusGPS competition', 'Complex OR workflow integration'],
  },
  {
    company: 'Globus Medical', device_name: 'ExcelsiusGPS', device_category: 'orthopedic',
    procedure_or_condition: 'Spine surgery / robotic navigation', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2017-08', technology_type: 'Robotic navigation for spine surgery',
    installed_base_estimate: 600, estimated_market_share_pct: 25, asp_estimate: 850000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 7, source: 'Globus Medical 10-K 2024', last_updated: '2025-01',
    strengths: ['First robotic system with navigation', 'Full-body CT compatibility', 'NuVasive merger expanded portfolio'],
    weaknesses: ['Integration challenges post-NuVasive merger', 'Smaller sales force than Medtronic'],
  },
];

// =============================================================================
// SURGICAL / ROBOTIC (~12 devices)
// =============================================================================

const SURGICAL_ROBOTIC: DeviceCompetitor[] = [
  {
    company: 'Intuitive Surgical', device_name: 'da Vinci 5', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic-assisted surgery', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2024-03', technology_type: 'Multiport robotic surgical system',
    installed_base_estimate: 9000, estimated_market_share_pct: 80, asp_estimate: 2500000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 10, evidence_strength: 9, source: 'Intuitive 10-K 2024', last_updated: '2025-01',
    strengths: ['Dominant market position', 'Force feedback (first in class)', '9000+ installed systems', 'Recurring instrument revenue'],
    weaknesses: ['Premium pricing', 'New competitors emerging (Hugo, Ottava)', 'Prostatectomy growth plateauing'],
  },
  {
    company: 'Intuitive Surgical', device_name: 'Ion Endoluminal', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic bronchoscopy / Lung biopsy', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2019-02', technology_type: 'Robotic-assisted bronchoscopy platform',
    installed_base_estimate: 1200, estimated_market_share_pct: 45, asp_estimate: 700000,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 9, evidence_strength: 7, source: 'Intuitive 10-K 2024; PRECIsE study', last_updated: '2025-01',
    strengths: ['Shape-sensing catheter technology', 'High diagnostic yield in peripheral lesions', 'Leverages da Vinci sales channels'],
    weaknesses: ['Monarch platform competition', 'Procedure reimbursement still evolving', 'Limited to biopsy (not treatment)'],
  },
  {
    company: 'J&J MedTech', device_name: 'Ottava', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic-assisted surgery', regulatory_status: 'development', pathway: 'PMA',
    technology_type: 'Multiport robotic surgical system',
    installed_base_estimate: 0, estimated_market_share_pct: 0, asp_estimate: 2000000,
    reimbursement_status: 'none', clinical_evidence_level: 'bench_only', technology_readiness: 'clinical',
    differentiation_score: 8, evidence_strength: 3, source: 'J&J MedTech press releases 2024', last_updated: '2025-01',
    strengths: ['J&J full surgical ecosystem integration', 'Verb Surgical AI platform', 'Arms mounted to OR table (smaller footprint)'],
    weaknesses: ['Delayed multiple times', 'No clinical data yet', 'Must prove superiority vs da Vinci 5'],
  },
  {
    company: 'Medtronic', device_name: 'Hugo RAS', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic-assisted surgery', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2024-10', technology_type: 'Modular robotic-assisted surgery system',
    installed_base_estimate: 200, estimated_market_share_pct: 2, asp_estimate: 1500000,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 6, source: 'Medtronic 10-K 2024', last_updated: '2025-01',
    strengths: ['Modular arm design', 'Touch Surgery AI ecosystem', 'Lower capital cost than da Vinci', 'Medtronic global distribution'],
    weaknesses: ['Late market entry', 'Limited installed base', 'Must build surgeon preference against Intuitive'],
  },
  {
    company: 'CMR Surgical', device_name: 'Versius', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic-assisted surgery', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2023-09', technology_type: 'Modular small-footprint robotic system',
    installed_base_estimate: 150, estimated_market_share_pct: 1, asp_estimate: 1200000,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 5, source: 'CMR Surgical press releases 2024', last_updated: '2025-01',
    strengths: ['Smallest robotic system footprint', 'Modular arm configuration', 'Wrist-like articulation', 'Strong EU/Asia adoption'],
    weaknesses: ['Late US market entry', 'Limited clinical evidence', 'Small company vs Intuitive/Medtronic'],
  },
  {
    company: 'Auris Health (J&J)', device_name: 'Monarch', device_category: 'general_surgery',
    procedure_or_condition: 'Robotic bronchoscopy / Lung biopsy', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2018-03', technology_type: 'Robotic endoscopy platform',
    installed_base_estimate: 700, estimated_market_share_pct: 30, asp_estimate: 600000,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 6, source: 'J&J MedTech 10-K 2024', last_updated: '2025-01',
    strengths: ['First robotic bronchoscopy platform', 'Continuous vision during navigation', 'J&J backing and distribution'],
    weaknesses: ['Ion platform catching up', 'Diagnostic yield data mixed', 'Reimbursement challenges'],
  },
];

// =============================================================================
// DIABETES / CGM (~10 devices)
// =============================================================================

const DIABETES_CGM: DeviceCompetitor[] = [
  {
    company: 'Dexcom', device_name: 'G7', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Continuous glucose monitoring', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-12', technology_type: 'Real-time continuous glucose monitor',
    installed_base_estimate: 2000000, estimated_market_share_pct: 35, asp_estimate: 300,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 9, source: 'Dexcom 10-K 2024', last_updated: '2025-01',
    strengths: ['Best-in-class MARD accuracy', '10.5-day wear', 'Direct Apple Watch integration', 'Insulin pump interoperability'],
    weaknesses: ['Higher price than Libre', 'One-sensor-at-a-time limitation', 'GLP-1 adoption reducing Type 2 CGM demand'],
  },
  {
    company: 'Abbott', device_name: 'FreeStyle Libre 3', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Continuous glucose monitoring', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-09', technology_type: 'Flash/real-time continuous glucose monitor',
    installed_base_estimate: 5000000, estimated_market_share_pct: 45, asp_estimate: 150,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 9, source: 'Abbott 10-K 2024', last_updated: '2025-01',
    strengths: ['Lowest cost CGM', 'Smallest sensor', '14-day wear', '5M+ global users', 'OTC availability'],
    weaknesses: ['Slightly lower MARD than Dexcom', 'Limited insulin pump integration', 'No direct smartwatch display'],
  },
  {
    company: 'Medtronic', device_name: 'Guardian 4', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Continuous glucose monitoring', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2023-06', technology_type: 'Integrated CGM for insulin pump systems',
    installed_base_estimate: 500000, estimated_market_share_pct: 8, asp_estimate: 275,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 6, evidence_strength: 7, source: 'Medtronic 10-K 2024', last_updated: '2025-01',
    strengths: ['Integrated with MiniMed 780G pump', 'No calibration required', 'Predictive alerts'],
    weaknesses: ['Trailing Dexcom/Abbott in accuracy', 'Proprietary ecosystem lock-in', 'Declining standalone CGM share'],
  },
  {
    company: 'Senseonics', device_name: 'Eversense E3', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Continuous glucose monitoring', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2022-02', technology_type: 'Implantable long-term CGM sensor',
    installed_base_estimate: 30000, estimated_market_share_pct: 1, asp_estimate: 1200,
    reimbursement_status: 'covered', clinical_evidence_level: 'single_arm', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 6, source: 'Senseonics 10-K 2024', last_updated: '2025-01',
    strengths: ['6-month implantable sensor (longest wear)', 'No external adhesive', 'On-body vibration alerts'],
    weaknesses: ['Requires in-office insertion procedure', 'Very small market share', 'Daily calibration needed', 'Limited reimbursement'],
  },
  {
    company: 'Insulet', device_name: 'Omnipod 5', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Insulin delivery / Pump', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-01', technology_type: 'Tubeless automated insulin delivery system',
    installed_base_estimate: 600000, estimated_market_share_pct: 35, asp_estimate: 900,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 8, source: 'Insulet 10-K 2024', last_updated: '2025-01',
    strengths: ['Only tubeless insulin pump', 'Automated insulin delivery with Dexcom G7', 'Pharmacy-dispensed (no DME)'],
    weaknesses: ['Disposable pod waste', 'Limited bolus customization', 'Competition from Tandem'],
  },
  {
    company: 'Tandem Diabetes', device_name: 'Mobi', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Insulin delivery / Pump', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2023-09', technology_type: 'Smallest tubed insulin pump with AID',
    installed_base_estimate: 400000, estimated_market_share_pct: 25, asp_estimate: 4500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'Tandem 10-K 2024', last_updated: '2025-01',
    strengths: ['Smallest tubed pump', 'Control-IQ algorithm', 'Smartphone control', 'Dexcom G7 integration'],
    weaknesses: ['Tubed design vs Omnipod tubeless', 'Prescription-only distribution', 'Smaller company resources'],
  },
  {
    company: 'Medtronic', device_name: 'MiniMed 780G', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Insulin delivery / Pump', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-04', technology_type: 'Automated insulin delivery system',
    installed_base_estimate: 500000, estimated_market_share_pct: 30, asp_estimate: 5000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 8, source: 'Medtronic 10-K 2024', last_updated: '2025-01',
    strengths: ['Integrated CGM+pump ecosystem', 'Longest pump experience globally', 'SmartGuard auto-correction'],
    weaknesses: ['Bulkier than Omnipod/Mobi', 'Guardian sensor accuracy concerns', 'Market share losses to Insulet'],
  },
];

// =============================================================================
// NEUROSTIMULATION (~8 devices)
// =============================================================================

const NEUROSTIMULATION: DeviceCompetitor[] = [
  {
    company: 'Medtronic', device_name: 'Percept PC', device_category: 'neurology',
    procedure_or_condition: 'Deep brain stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2020-06', technology_type: 'DBS system with BrainSense technology',
    installed_base_estimate: 40000, estimated_market_share_pct: 55, asp_estimate: 35000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 9, source: 'Medtronic 10-K 2024', last_updated: '2025-01',
    strengths: ['BrainSense LFP sensing', 'Market leader in DBS', 'Broadest indication coverage (PD, ET, dystonia, OCD, epilepsy)'],
    weaknesses: ['Non-rechargeable battery limitations', 'MRI-conditional restrictions'],
  },
  {
    company: 'Abbott', device_name: 'Infinity DBS', device_category: 'neurology',
    procedure_or_condition: 'Deep brain stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2017-01', technology_type: 'Directional DBS system',
    installed_base_estimate: 15000, estimated_market_share_pct: 25, asp_estimate: 33000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: 'Abbott 10-K 2024', last_updated: '2025-01',
    strengths: ['Directional leads for precise stimulation', 'Full-body MRI compatibility', 'Bluetooth programming'],
    weaknesses: ['Trailing Medtronic in market share', 'Narrower indication coverage', 'No LFP sensing'],
  },
  {
    company: 'Boston Scientific', device_name: 'Vercise Genus', device_category: 'neurology',
    procedure_or_condition: 'Deep brain stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2019-12', technology_type: 'DBS with STIMVIEW XT visualization',
    installed_base_estimate: 8000, estimated_market_share_pct: 15, asp_estimate: 32000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 7, source: 'BSX 10-K 2024', last_updated: '2025-01',
    strengths: ['STIMVIEW XT VTA visualization', 'Cartesia directional lead', 'Multiple independent current control'],
    weaknesses: ['Third in DBS market share', 'Fewer indications than Medtronic', 'Smaller neuromod sales force'],
  },
  {
    company: 'Nevro', device_name: 'HFX iQ', device_category: 'neurology',
    procedure_or_condition: 'Spinal cord stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2022-05', technology_type: 'High-frequency SCS with AI dosing',
    installed_base_estimate: 80000, estimated_market_share_pct: 20, asp_estimate: 28000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 9, source: 'Nevro 10-K 2024; SENZA trials', last_updated: '2025-01',
    strengths: ['10kHz therapy (paresthesia-free)', 'SENZA RCT superiority data', 'AI-based dosing optimization', 'PDN indication'],
    weaknesses: ['Revenue growth slowing', 'Competitive pressure from Abbott/BSX', 'Reimbursement scrutiny on SCS'],
  },
  {
    company: 'Abbott', device_name: 'Proclaim XR', device_category: 'neurology',
    procedure_or_condition: 'Spinal cord stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2019-08', technology_type: 'Rechargeable SCS with BurstDR',
    installed_base_estimate: 100000, estimated_market_share_pct: 25, asp_estimate: 26000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 8, source: 'Abbott 10-K 2024; SUNBURST trial', last_updated: '2025-01',
    strengths: ['BurstDR waveform', 'Rechargeable battery', 'SUNBURST trial data', 'Bluetooth patient controller'],
    weaknesses: ['Recharge burden on patients', 'Market share pressure from Nevro HFX'],
  },
  {
    company: 'Axonics', device_name: 'Axonics System', device_category: 'urology',
    procedure_or_condition: 'Sacral neuromodulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2019-09', technology_type: 'Rechargeable sacral neuromodulation implant',
    installed_base_estimate: 60000, estimated_market_share_pct: 40, asp_estimate: 15000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'Axonics 10-K 2024; ARTISAN-SNM trial', last_updated: '2025-01',
    strengths: ['15-year rechargeable battery', 'Full-body MRI conditional', 'Smaller implant size', 'Rapid market share gain from Medtronic'],
    weaknesses: ['Medtronic InterStim X competitive response', 'Single-indication focus', 'Recharge requirement'],
  },
];

// =============================================================================
// DIGITAL HEALTH / SaMD (~8 devices)
// =============================================================================

const DIGITAL_HEALTH: DeviceCompetitor[] = [
  {
    company: 'Teladoc (Livongo)', device_name: 'Livongo for Diabetes', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Digital diabetes management', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2019-01', technology_type: 'AI-powered diabetes management platform + connected BGM',
    installed_base_estimate: 800000, estimated_market_share_pct: 30, asp_estimate: 75,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 7, evidence_strength: 7, source: 'Teladoc 10-K 2024', last_updated: '2025-01',
    strengths: ['Largest digital diabetes enrollment', 'Employer channel distribution', 'AI coaching + connected meter'],
    weaknesses: ['Teladoc stock decline affecting investment', 'CGM integration lacking', 'Retention challenges'],
  },
  {
    company: 'Omada Health', device_name: 'Omada Platform', device_category: 'diabetes_metabolic',
    procedure_or_condition: 'Digital chronic disease management', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2020-06', technology_type: 'Digital therapeutics platform for diabetes/obesity',
    installed_base_estimate: 500000, estimated_market_share_pct: 15, asp_estimate: 50,
    reimbursement_status: 'partial', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 7, source: 'Omada Health company disclosures 2024', last_updated: '2025-01',
    strengths: ['CDC-recognized DPP program', 'Strong RCT evidence', 'Multi-condition platform (MSK, behavioral health)'],
    weaknesses: ['Private company (limited financial visibility)', 'GLP-1 disruption to behavioral programs'],
  },
  {
    company: 'Akili Interactive', device_name: 'EndeavorOTC', device_category: 'neurology',
    procedure_or_condition: 'Digital therapeutics / ADHD', regulatory_status: 'cleared', pathway: 'De_Novo',
    clearance_date: '2024-06', technology_type: 'Prescription digital therapeutic (video game-based)',
    installed_base_estimate: 50000, estimated_market_share_pct: 5, asp_estimate: 0,
    reimbursement_status: 'none', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'Akili press releases 2024', last_updated: '2025-01',
    strengths: ['First FDA-authorized game-based therapeutic', 'RCT evidence for attention improvement', 'OTC pivot removes prescription barrier'],
    weaknesses: ['Pivoted to OTC (no reimbursement)', 'Commercial viability uncertain', 'DTx market challenged'],
  },
  {
    company: 'Biofourmis', device_name: 'Biovitals Platform', device_category: 'cardiovascular',
    procedure_or_condition: 'Remote patient monitoring / Heart failure', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2021-11', technology_type: 'AI-driven remote patient monitoring SaMD',
    installed_base_estimate: 100000, estimated_market_share_pct: 5, asp_estimate: 200,
    reimbursement_status: 'partial', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 7, evidence_strength: 6, source: 'Biofourmis press releases 2024', last_updated: '2025-01',
    strengths: ['Multi-biosignal AI analytics', 'Hospital-at-home integration', 'CMS RPM billing codes'],
    weaknesses: ['Crowded RPM market', 'Proving clinical and economic value', 'Reimbursement fragmented'],
  },
];

// =============================================================================
// WOUND / RESPIRATORY / OPHTHO / OTHER (~18 devices)
// =============================================================================

const OTHER_DEVICES: DeviceCompetitor[] = [
  // --- RESPIRATORY ---
  {
    company: 'ResMed', device_name: 'AirSense 11', device_category: 'respiratory',
    procedure_or_condition: 'Sleep apnea / CPAP', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2021-06', technology_type: 'Auto-titrating CPAP with cloud connectivity',
    installed_base_estimate: 15000000, estimated_market_share_pct: 50, asp_estimate: 900,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 8, source: 'ResMed 10-K 2024', last_updated: '2025-01',
    strengths: ['Market leader post-Philips recall', 'myAir app ecosystem', 'Cloud-connected fleet management', 'AutoSet algorithm'],
    weaknesses: ['GLP-1 weight loss reducing severe OSA prevalence', 'Inspire implant competition', 'CPAP adherence challenges'],
  },
  {
    company: 'Inspire Medical', device_name: 'Inspire System', device_category: 'respiratory',
    procedure_or_condition: 'Sleep apnea / Hypoglossal nerve stimulation', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2014-04', technology_type: 'Implantable upper airway stimulation',
    installed_base_estimate: 80000, estimated_market_share_pct: 5, asp_estimate: 30000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 9, evidence_strength: 9, source: 'Inspire Medical 10-K 2024; STAR trial', last_updated: '2025-01',
    strengths: ['Only implantable OSA therapy', 'STAR trial 5-year data', 'Growing surgeon adoption', 'CPAP-intolerant population'],
    weaknesses: ['Surgical procedure required', 'BMI <35 limitation', 'GLP-1 weight loss may reduce addressable population'],
  },
  // --- OPHTHALMOLOGY ---
  {
    company: 'Alcon', device_name: 'PanOptix Trifocal IOL', device_category: 'ophthalmology',
    procedure_or_condition: 'Cataract surgery / Intraocular lens', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2019-08', technology_type: 'Trifocal intraocular lens',
    installed_base_estimate: 2000000, estimated_market_share_pct: 40, asp_estimate: 3200,
    reimbursement_status: 'partial', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 9, source: 'Alcon 20-F 2024', last_updated: '2025-01',
    strengths: ['First FDA-approved trifocal IOL', 'Near/intermediate/distance vision', 'Dominant premium IOL market share'],
    weaknesses: ['Halos/glare complaints', 'Premium pricing limits adoption', 'EDOF lenses growing'],
  },
  {
    company: 'J&J Vision', device_name: 'TECNIS Synergy IOL', device_category: 'ophthalmology',
    procedure_or_condition: 'Cataract surgery / Intraocular lens', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2021-06', technology_type: 'Continuous-range-of-vision IOL',
    installed_base_estimate: 500000, estimated_market_share_pct: 20, asp_estimate: 3000,
    reimbursement_status: 'partial', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'J&J 10-K 2024', last_updated: '2025-01',
    strengths: ['Continuous vision range', 'Violet-light filtering', 'Lower dysphotopsia than PanOptix'],
    weaknesses: ['Behind PanOptix in market share', 'Near vision slightly less than trifocal'],
  },
  {
    company: 'Glaukos', device_name: 'iStent Infinite', device_category: 'ophthalmology',
    procedure_or_condition: 'Glaucoma / MIGS', regulatory_status: 'approved', pathway: 'PMA',
    clearance_date: '2023-02', technology_type: 'Triple micro-bypass stent for trabecular drainage',
    installed_base_estimate: 200000, estimated_market_share_pct: 35, asp_estimate: 2500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 8, source: 'Glaukos 10-K 2024', last_updated: '2025-01',
    strengths: ['First MIGS device for standalone use (not just with cataract)', 'Triple stent design', 'iDose sustained-release next gen'],
    weaknesses: ['Trabecular bypass may not address all outflow pathways', 'Reimbursement complexity for standalone MIGS'],
  },
  // --- ENDOSCOPY ---
  {
    company: 'Olympus', device_name: 'EVIS X1', device_category: 'endoscopy_gi',
    procedure_or_condition: 'GI endoscopy', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2022-03', technology_type: 'Endoscopy system with AI-assisted detection',
    installed_base_estimate: 10000, estimated_market_share_pct: 65, asp_estimate: 200000,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: 'Olympus annual report 2024', last_updated: '2025-01',
    strengths: ['Dominant GI endoscopy market share', 'TXI texture and color enhancement', 'ENDO-AID AI module'],
    weaknesses: ['Premium pricing', 'Fujifilm gaining share in colonoscopy', 'Slow to add AI features'],
  },
  {
    company: 'Boston Scientific', device_name: 'SpyGlass DS II', device_category: 'endoscopy_gi',
    procedure_or_condition: 'Cholangioscopy / Biliary', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2021-09', technology_type: 'Digital single-operator cholangioscopy',
    installed_base_estimate: 5000, estimated_market_share_pct: 90, asp_estimate: 3500,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'mature',
    differentiation_score: 9, evidence_strength: 8, source: 'BSX 10-K 2024', last_updated: '2025-01',
    strengths: ['Near-monopoly in cholangioscopy', 'Single-operator design', 'Digital imaging enhancement'],
    weaknesses: ['Niche procedure volume', 'Single-use disposable cost concerns'],
  },
  // --- WOUND CARE ---
  {
    company: '3M/KCI', device_name: 'Prevena Plus', device_category: 'wound_care',
    procedure_or_condition: 'Surgical wound management / NPWT', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2019-04', technology_type: 'Closed-incision negative pressure wound therapy',
    installed_base_estimate: 500000, estimated_market_share_pct: 70, asp_estimate: 500,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 8, source: '3M Health Care Solventum 10-K 2024', last_updated: '2025-01',
    strengths: ['Market leader in ciNPWT', 'Multiple RCTs showing SSI reduction', 'Broad surgical adoption'],
    weaknesses: ['Solventum spin-off transition', 'Cost-effectiveness scrutiny from payers'],
  },
  // --- VASCULAR ---
  {
    company: 'Penumbra', device_name: 'Lightning Flash', device_category: 'vascular',
    procedure_or_condition: 'Mechanical thrombectomy / Stroke', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2023-08', technology_type: 'Next-gen aspiration thrombectomy system',
    installed_base_estimate: 5000, estimated_market_share_pct: 20, asp_estimate: 4500,
    reimbursement_status: 'covered', clinical_evidence_level: 'registry', technology_readiness: 'commercial',
    differentiation_score: 8, evidence_strength: 7, source: 'Penumbra 10-K 2024', last_updated: '2025-01',
    strengths: ['3D Revascularization technology', 'Fastest aspiration flow rate', 'Growing stroke intervention volumes'],
    weaknesses: ['Stryker Neurovascular dominance', 'Need more comparative data'],
  },
  {
    company: 'Stryker Neurovascular', device_name: 'Trevo XP ProVue', device_category: 'vascular',
    procedure_or_condition: 'Mechanical thrombectomy / Stroke', regulatory_status: 'cleared', pathway: '510k',
    clearance_date: '2020-12', technology_type: 'Stent retriever for acute ischemic stroke',
    installed_base_estimate: 8000, estimated_market_share_pct: 40, asp_estimate: 5000,
    reimbursement_status: 'covered', clinical_evidence_level: 'RCT', technology_readiness: 'mature',
    differentiation_score: 8, evidence_strength: 9, source: 'Stryker 10-K 2024; DAWN/DEFUSE trials', last_updated: '2025-01',
    strengths: ['Market-leading stent retriever', 'DAWN/DEFUSE 3 extended window data', 'Comprehensive neurovascular portfolio'],
    weaknesses: ['Aspiration-first approach gaining ground', 'High competition from Penumbra'],
  },
];

// =============================================================================
// COMBINED DATABASE
// =============================================================================

export const DEVICE_COMPETITOR_DATABASE: DeviceCompetitor[] = [
  ...CARDIOVASCULAR,
  ...ORTHOPEDIC,
  ...SURGICAL_ROBOTIC,
  ...DIABETES_CGM,
  ...NEUROSTIMULATION,
  ...DIGITAL_HEALTH,
  ...OTHER_DEVICES,
];

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Fuzzy match devices by procedure or condition name.
 * Case-insensitive substring matching.
 */
export function getDeviceCompetitorsByProcedure(procedureOrCondition: string): DeviceCompetitor[] {
  const needle = procedureOrCondition.toLowerCase().trim();
  return DEVICE_COMPETITOR_DATABASE.filter((d) => {
    const haystack = d.procedure_or_condition.toLowerCase();
    return haystack.includes(needle) || needle.includes(haystack);
  });
}

/**
 * Get all devices in a specific device category.
 */
export function getDeviceCompetitorsByCategory(category: DeviceCategory): DeviceCompetitor[] {
  return DEVICE_COMPETITOR_DATABASE.filter((d) => d.device_category === category);
}

/**
 * Get all unique procedures/conditions covered in the database.
 */
export function getCoveredProcedures(): string[] {
  const procedures = new Set<string>();
  for (const d of DEVICE_COMPETITOR_DATABASE) {
    procedures.add(d.procedure_or_condition);
  }
  return Array.from(procedures).sort();
}

/**
 * Fuzzy match by technology type.
 */
export function getDeviceCompetitorsByTechnology(technologyType: string): DeviceCompetitor[] {
  const needle = technologyType.toLowerCase().trim();
  return DEVICE_COMPETITOR_DATABASE.filter((d) =>
    d.technology_type.toLowerCase().includes(needle)
  );
}
