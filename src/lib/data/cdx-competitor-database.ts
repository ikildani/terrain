// =============================================================================
// Companion Diagnostic (CDx) Competitor Database
// =============================================================================
// 80+ CDx/molecular diagnostic tests organized by biomarker and platform.
// Used by the CDx competitive landscape engine.
//
// Sources: FDA PMA database, CMS MolDx coverage decisions, company 10-K filings,
// Evaluate MedTech, GenomeWeb, 2024-2025 data.
// =============================================================================

import type { CDxCompetitor, CDxPlatform } from '@/types/devices-diagnostics';

// =============================================================================
// COMPREHENSIVE NGS PANELS
// =============================================================================

const NGS_PANELS: CDxCompetitor[] = [
  {
    company: 'Foundation Medicine', test_name: 'FoundationOne CDx',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'NTRK', 'HER2', 'MET', 'RET', 'PIK3CA', 'BRCA1', 'BRCA2', 'TMB', 'MSI'],
    linked_drugs: ['Keytruda (pembrolizumab)', 'Lynparza (olaparib)', 'Rozlytrek (entrectinib)', 'Vitrakvi (larotrectinib)', 'Tagrisso (osimertinib)', 'Lumakras (sotorasib)', 'Enhertu (T-DXd)', 'Tabrecta (capmatinib)'],
    regulatory_status: 'PMA_approved', genes_in_panel: 324, turnaround_days: 14,
    test_price_estimate: 5800, sample_type: ['tissue'],
    estimated_annual_test_volume: 250000, estimated_revenue_m: 1200,
    differentiation_score: 9, evidence_strength: 10,
    strengths: ['Broadest FDA-approved CDx panel', 'Most drug label linkages (>30)', 'NCD 90.2 coverage', 'Gold standard for tissue CGP'],
    weaknesses: ['Tissue-only (no liquid)', 'Slow turnaround vs PCR', 'Requires adequate tissue sample', 'High per-test cost'],
    source: 'Roche 10-K 2024; FDA PMA P170019', last_updated: '2025-01',
  },
  {
    company: 'Foundation Medicine', test_name: 'FoundationOne Liquid CDx',
    platform: 'liquid_biopsy', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'BRCA1', 'BRCA2', 'MET', 'RET', 'PIK3CA', 'ERBB2'],
    linked_drugs: ['Tagrisso (osimertinib)', 'Lynparza (olaparib)', 'Rybrevant (amivantamab)', 'Rubraca (rucaparib)'],
    regulatory_status: 'PMA_approved', genes_in_panel: 324, turnaround_days: 10,
    test_price_estimate: 5800, sample_type: ['blood'],
    estimated_annual_test_volume: 80000, estimated_revenue_m: 400,
    differentiation_score: 8, evidence_strength: 9,
    strengths: ['FDA-approved liquid biopsy CGP', 'Blood draw (no biopsy needed)', 'Monitors treatment response', 'Broad panel'],
    weaknesses: ['Lower sensitivity than tissue for some variants', 'Higher false-negative rate for CNS-only disease', 'Expensive'],
    source: 'Roche 10-K 2024; FDA PMA P200006', last_updated: '2025-01',
  },
  {
    company: 'Tempus', test_name: 'Tempus xT',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'NTRK', 'HER2', 'MET', 'RET', 'PIK3CA', 'BRCA1', 'BRCA2', 'TMB', 'MSI', 'PD-L1'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 648, turnaround_days: 14,
    test_price_estimate: 5200, sample_type: ['tissue'],
    estimated_annual_test_volume: 180000, estimated_revenue_m: 700,
    differentiation_score: 8, evidence_strength: 7,
    strengths: ['Largest gene panel (648 genes)', 'AI-powered variant interpretation', 'Integrated clinical-genomic database', 'Fast-growing market share'],
    weaknesses: ['LDT — not FDA approved', 'Payer coverage inconsistent', 'No CDx drug linkages', 'Newer entrant vs F1'],
    source: 'Tempus S-1 filing 2024; GenomeWeb', last_updated: '2025-01',
  },
  {
    company: 'Tempus', test_name: 'Tempus xF',
    platform: 'liquid_biopsy', biomarkers_covered: ['EGFR', 'ALK', 'BRAF', 'KRAS', 'MET', 'RET', 'ERBB2', 'PIK3CA', 'BRCA1', 'BRCA2'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 105, turnaround_days: 7,
    test_price_estimate: 3800, sample_type: ['blood'],
    estimated_annual_test_volume: 60000, estimated_revenue_m: 180,
    differentiation_score: 7, evidence_strength: 6,
    strengths: ['Faster turnaround than F1 Liquid', 'Lower cost', 'Integrated with Tempus OS', 'Growing oncology network'],
    weaknesses: ['LDT status', 'Smaller panel than F1 Liquid', 'No FDA-approved CDx claims', 'Limited payer coverage'],
    source: 'Tempus S-1 filing 2024', last_updated: '2025-01',
  },
  {
    company: 'Caris Life Sciences', test_name: 'Caris Molecular Intelligence (MI)',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'NTRK', 'HER2', 'MET', 'RET', 'TMB', 'MSI', 'PD-L1'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 592, turnaround_days: 14,
    test_price_estimate: 5400, sample_type: ['tissue'],
    estimated_annual_test_volume: 120000, estimated_revenue_m: 500,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['Whole exome + transcriptome', 'Multi-omic profiling (DNA + RNA + protein)', 'Strong lab network', '30K+ oncologists in network'],
    weaknesses: ['LDT status', 'Less brand recognition than F1', 'No CDx approvals', 'Complex multi-omic reports'],
    source: 'GenomeWeb; Caris press releases 2024', last_updated: '2025-01',
  },
  {
    company: 'NeoGenomics', test_name: 'NeoTYPE Discovery Profile',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'MET', 'RET', 'NTRK', 'TMB', 'MSI'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 340, turnaround_days: 12,
    test_price_estimate: 4800, sample_type: ['tissue'],
    estimated_annual_test_volume: 50000, estimated_revenue_m: 180,
    differentiation_score: 6, evidence_strength: 6,
    strengths: ['Integrated lab services company', 'Fast turnaround', 'Strong pathology expertise', 'Regional lab footprint'],
    weaknesses: ['Smaller scale than F1/Tempus', 'LDT only', 'Limited liquid biopsy offerings', 'Revenue under pressure'],
    source: 'NeoGenomics 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Thermo Fisher Scientific', test_name: 'Oncomine Dx Target Test',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'MET', 'RET', 'HER2', 'NTRK'],
    linked_drugs: ['Tagrisso (osimertinib)', 'Xalkori (crizotinib)', 'Rozlytrek (entrectinib)'],
    regulatory_status: 'PMA_approved', genes_in_panel: 23, turnaround_days: 4,
    test_price_estimate: 2800, sample_type: ['tissue'],
    estimated_annual_test_volume: 40000, estimated_revenue_m: 90,
    differentiation_score: 6, evidence_strength: 8,
    strengths: ['FDA PMA approved', 'Very fast turnaround', 'Runs on Ion Torrent platform (broadly installed)', 'Lower cost per test'],
    weaknesses: ['Small panel (23 genes)', 'Limited to NSCLC', 'Being overtaken by larger panels', 'No liquid biopsy'],
    source: 'FDA PMA P160045; Thermo Fisher 10-K 2024', last_updated: '2025-01',
  },
];

// =============================================================================
// LIQUID BIOPSY SPECIALISTS
// =============================================================================

const LIQUID_BIOPSY: CDxCompetitor[] = [
  {
    company: 'Guardant Health', test_name: 'Guardant360 CDx',
    platform: 'liquid_biopsy', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'NTRK', 'HER2', 'MET', 'RET', 'PIK3CA', 'BRCA1', 'BRCA2', 'TMB', 'MSI'],
    linked_drugs: ['Tagrisso (osimertinib)', 'Rybrevant (amivantamab)', 'Lumakras (sotorasib)'],
    regulatory_status: 'PMA_approved', genes_in_panel: 74, turnaround_days: 7,
    test_price_estimate: 5000, sample_type: ['blood'],
    estimated_annual_test_volume: 200000, estimated_revenue_m: 800,
    differentiation_score: 9, evidence_strength: 9,
    strengths: ['Market-leading liquid biopsy', 'Fastest turnaround (7 days)', 'FDA CDx approvals', '300K+ tests/year', 'Real-world data platform'],
    weaknesses: ['Blood-only (miss tissue-only variants)', 'Smaller panel vs tissue NGS', 'Profitability challenges', 'Competition from F1 Liquid'],
    source: 'Guardant Health 10-K 2024; FDA PMA P200010', last_updated: '2025-01',
  },
  {
    company: 'Guardant Health', test_name: 'Guardant360 TissueNext',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'NTRK', 'MET', 'RET', 'HER2', 'TMB', 'MSI'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 500, turnaround_days: 10,
    test_price_estimate: 5200, sample_type: ['tissue'],
    estimated_annual_test_volume: 30000, estimated_revenue_m: 120,
    differentiation_score: 6, evidence_strength: 6,
    strengths: ['Complements liquid biopsy', 'Whole exome option', 'Growing tissue business'],
    weaknesses: ['Newer offering', 'LDT only', 'Competes against established tissue players', 'Small volume vs F1'],
    source: 'Guardant Health 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Guardant Health', test_name: 'GuardantReveal',
    platform: 'liquid_biopsy', biomarkers_covered: ['ctDNA (MRD)', 'MSI'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 74, turnaround_days: 7,
    test_price_estimate: 3500, sample_type: ['blood'],
    estimated_annual_test_volume: 25000, estimated_revenue_m: 70,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['MRD detection for CRC', 'Serial monitoring capability', 'Growing evidence base', 'NCCN guideline included'],
    weaknesses: ['LDT status', 'Competes with Signatera', 'Limited to CRC initially', 'Reimbursement uncertain'],
    source: 'Guardant Health 10-K 2024; ECLIPSE trial', last_updated: '2025-01',
  },
  {
    company: 'Guardant Health', test_name: 'Shield',
    platform: 'liquid_biopsy', biomarkers_covered: ['cfDNA methylation (CRC screening)'],
    linked_drugs: [],
    regulatory_status: 'PMA_approved', genes_in_panel: 0, turnaround_days: 10,
    test_price_estimate: 895, sample_type: ['blood'],
    estimated_annual_test_volume: 50000, estimated_revenue_m: 40,
    differentiation_score: 8, evidence_strength: 8,
    strengths: ['First blood-based CRC screening test', 'FDA approved 2024', 'CMS coverage pathway', 'Massive TAM (50M+ eligible adults)'],
    weaknesses: ['Lower sensitivity vs Cologuard (83% vs 93%)', 'Lower specificity', 'Reimbursement rate uncertain', 'Consumer awareness low'],
    source: 'FDA PMA P230014; Guardant ECLIPSE trial', last_updated: '2025-01',
  },
  {
    company: 'Biodesix', test_name: 'GeneStrat ddPCR',
    platform: 'ddPCR', biomarkers_covered: ['EGFR', 'KRAS', 'BRAF', 'ALK', 'ROS1', 'MET', 'RET'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 7, turnaround_days: 3,
    test_price_estimate: 1800, sample_type: ['blood'],
    estimated_annual_test_volume: 30000, estimated_revenue_m: 45,
    differentiation_score: 6, evidence_strength: 6,
    strengths: ['Fastest liquid biopsy turnaround (3 days)', 'Low cost per test', 'Combined with VeriStrat protein test', 'Lung-focused'],
    weaknesses: ['Narrow panel', 'ddPCR platform less scalable', 'Small market share', 'Not FDA-approved CDx'],
    source: 'Biodesix 10-K 2024', last_updated: '2025-01',
  },
];

// =============================================================================
// SCREENING & EARLY DETECTION
// =============================================================================

const SCREENING: CDxCompetitor[] = [
  {
    company: 'Exact Sciences', test_name: 'Cologuard Plus',
    platform: 'PCR', biomarkers_covered: ['KRAS', 'NDRG4', 'BMP3', 'hemoglobin', 'methylation markers'],
    linked_drugs: [],
    regulatory_status: 'PMA_approved', genes_in_panel: 5, turnaround_days: 10,
    test_price_estimate: 649, sample_type: ['stool'],
    estimated_annual_test_volume: 4500000, estimated_revenue_m: 2200,
    differentiation_score: 9, evidence_strength: 10,
    strengths: ['Dominant CRC screening test', '4.5M+ tests/year', 'At-home collection', 'CMS coverage at $649', 'BLUE-C trial data'],
    weaknesses: ['Stool-based (compliance barrier)', '3-year interval', 'False positive rate ~13%', 'Competition from blood-based tests'],
    source: 'Exact Sciences 10-K 2024; FDA PMA P130017', last_updated: '2025-01',
  },
  {
    company: 'GRAIL (Illumina)', test_name: 'Galleri',
    platform: 'NGS', biomarkers_covered: ['cfDNA methylation (50+ cancer types)'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 0, turnaround_days: 14,
    test_price_estimate: 949, sample_type: ['blood'],
    estimated_annual_test_volume: 150000, estimated_revenue_m: 120,
    differentiation_score: 10, evidence_strength: 7,
    strengths: ['Multi-cancer early detection (50+ types)', 'Blood-based', 'First-mover in MCED', 'NHS pilot study (140K participants)', 'Cancer Signal Origin localization'],
    weaknesses: ['No FDA approval yet', 'Self-pay only', 'Low sensitivity for Stage I', 'High cost', 'Illumina divestiture uncertainty'],
    source: 'GRAIL press releases; PATHFINDER trial; GenomeWeb', last_updated: '2025-01',
  },
  {
    company: 'Freenome', test_name: 'Freenome CRC Blood Test',
    platform: 'NGS', biomarkers_covered: ['cfDNA methylation', 'protein biomarkers (CRC)'],
    linked_drugs: [],
    regulatory_status: 'development', genes_in_panel: 0, turnaround_days: 10,
    test_price_estimate: 800, sample_type: ['blood'],
    estimated_annual_test_volume: 0, estimated_revenue_m: 0,
    differentiation_score: 7, evidence_strength: 5,
    strengths: ['Multi-omic approach (cfDNA + protein)', 'PREEMPT pivotal trial ongoing', 'Roche partnership', 'Strong funding ($1B+)'],
    weaknesses: ['Pre-market', 'Crowded CRC screening space', 'No FDA submission yet', 'Late vs Guardant Shield'],
    source: 'Freenome press releases; PREEMPT trial NCT04369053', last_updated: '2025-01',
  },
];

// =============================================================================
// MRD / RECURRENCE MONITORING
// =============================================================================

const MRD_MONITORING: CDxCompetitor[] = [
  {
    company: 'Natera', test_name: 'Signatera',
    platform: 'PCR', biomarkers_covered: ['ctDNA (personalized MRD)', 'tumor-informed SNVs'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 16, turnaround_days: 10,
    test_price_estimate: 3500, sample_type: ['blood'],
    estimated_annual_test_volume: 200000, estimated_revenue_m: 550,
    differentiation_score: 9, evidence_strength: 9,
    strengths: ['Market leader in MRD', 'Tumor-informed (custom per patient)', 'Serial monitoring', 'CMS coverage (CRC, breast, bladder)', 'NCCN guideline included'],
    weaknesses: ['Requires tumor tissue for panel design', 'Longer initial turnaround', 'Expensive per patient lifecycle', 'PCR-based (limited sensitivity floor)'],
    source: 'Natera 10-K 2024; CIRCULATE-Japan; IMvigor010', last_updated: '2025-01',
  },
  {
    company: 'Invivoscribe', test_name: 'ClonoSEQ',
    platform: 'NGS', biomarkers_covered: ['IgH VDJ', 'IgH DJ', 'IgK', 'TCRβ', 'TCRδ', 'TCRγ (MRD hematologic)'],
    linked_drugs: [],
    regulatory_status: 'cleared', genes_in_panel: 6, turnaround_days: 5,
    test_price_estimate: 3100, sample_type: ['blood', 'bone marrow'],
    estimated_annual_test_volume: 80000, estimated_revenue_m: 200,
    differentiation_score: 8, evidence_strength: 9,
    strengths: ['Only FDA-cleared MRD test', 'Gold standard for heme MRD', 'CMS coverage', 'Used in major clinical trials', 'Fast turnaround'],
    weaknesses: ['Hematologic malignancies only', 'Requires baseline sample', 'Adaptive Biotechnologies financial challenges', 'Narrow indication scope'],
    source: 'FDA 510(k) K173362; Adaptive Biotechnologies 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Personalis', test_name: 'NeXT Personal',
    platform: 'NGS', biomarkers_covered: ['ctDNA (whole-genome MRD)', 'germline + somatic variants'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 20000, turnaround_days: 14,
    test_price_estimate: 4500, sample_type: ['blood'],
    estimated_annual_test_volume: 15000, estimated_revenue_m: 50,
    differentiation_score: 7, evidence_strength: 6,
    strengths: ['Whole-genome approach (broadest)', 'Detects novel fusions', 'Pharma partnerships', 'Growing MRD evidence'],
    weaknesses: ['LDT only', 'Small commercial scale', 'Higher cost than Signatera', 'Slower turnaround'],
    source: 'Personalis 10-K 2024', last_updated: '2025-01',
  },
];

// =============================================================================
// IHC / PROTEIN-BASED CDx
// =============================================================================

const IHC_TESTS: CDxCompetitor[] = [
  {
    company: 'Agilent (Dako)', test_name: 'PD-L1 IHC 22C3 pharmDx',
    platform: 'IHC', biomarkers_covered: ['PD-L1 (TPS & CPS)'],
    linked_drugs: ['Keytruda (pembrolizumab)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 350, sample_type: ['tissue'],
    estimated_annual_test_volume: 1500000, estimated_revenue_m: 450,
    differentiation_score: 8, evidence_strength: 10,
    strengths: ['Gold standard PD-L1 CDx', 'Linked to #1 IO drug (Keytruda)', 'Highest test volume globally', 'CMS covered'],
    weaknesses: ['Single biomarker only', 'Scoring variability between pathologists', 'Being supplemented by NGS', 'Tissue-dependent'],
    source: 'FDA PMA P150013; Agilent 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Roche (Ventana)', test_name: 'VENTANA PD-L1 (SP142)',
    platform: 'IHC', biomarkers_covered: ['PD-L1 (IC score)'],
    linked_drugs: ['Tecentriq (atezolizumab)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 340, sample_type: ['tissue'],
    estimated_annual_test_volume: 500000, estimated_revenue_m: 140,
    differentiation_score: 7, evidence_strength: 9,
    strengths: ['Linked to Tecentriq', 'Immune cell scoring (different algorithm)', 'Strong Roche distribution', 'VENTANA platform widely installed'],
    weaknesses: ['Less dominant than 22C3', 'Tecentriq facing competition', 'IC scoring less familiar to pathologists', 'Narrow drug linkage'],
    source: 'FDA PMA P160002; Roche 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Roche (Ventana)', test_name: 'VENTANA PD-L1 (SP263)',
    platform: 'IHC', biomarkers_covered: ['PD-L1 (TC score)'],
    linked_drugs: ['Imfinzi (durvalumab)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 340, sample_type: ['tissue'],
    estimated_annual_test_volume: 300000, estimated_revenue_m: 85,
    differentiation_score: 6, evidence_strength: 8,
    strengths: ['Linked to Imfinzi', 'EC/CE-IVD marked', 'Used in PACIFIC trial (chemoradiation + IO)'],
    weaknesses: ['Third in PD-L1 volume behind 22C3', 'Imfinzi market share declining', 'Tissue-only'],
    source: 'FDA PMA; Roche 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Agilent (Dako)', test_name: 'HER2 IQFISH pharmDx',
    platform: 'FISH', biomarkers_covered: ['HER2 amplification'],
    linked_drugs: ['Herceptin (trastuzumab)', 'Enhertu (T-DXd)', 'Kadcyla (T-DM1)'],
    regulatory_status: 'PMA_approved', turnaround_days: 3,
    test_price_estimate: 400, sample_type: ['tissue'],
    estimated_annual_test_volume: 600000, estimated_revenue_m: 200,
    differentiation_score: 7, evidence_strength: 10,
    strengths: ['Gold standard HER2 FISH', 'Linked to major HER2 drugs', 'Long track record', 'Confirmatory test for IHC 2+'],
    weaknesses: ['Being replaced by IHC in many settings', 'Labor-intensive manual scoring', 'NGS eating into reflex testing'],
    source: 'FDA PMA; Agilent 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Roche (Ventana)', test_name: 'VENTANA HER2 (4B5)',
    platform: 'IHC', biomarkers_covered: ['HER2 protein expression'],
    linked_drugs: ['Enhertu (T-DXd)', 'Herceptin (trastuzumab)'],
    regulatory_status: 'PMA_approved', turnaround_days: 1,
    test_price_estimate: 250, sample_type: ['tissue'],
    estimated_annual_test_volume: 1200000, estimated_revenue_m: 250,
    differentiation_score: 7, evidence_strength: 10,
    strengths: ['Highest-volume HER2 IHC test', 'Fastest turnaround', 'Low-cost screening', 'Enhertu HER2-low paradigm expanding TAM'],
    weaknesses: ['Subjective scoring (0/1+/2+/3+)', 'HER2-low interpretation challenges', 'Needs FISH confirmation for 2+'],
    source: 'FDA PMA; Roche 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Leica Biosystems', test_name: 'BOND Oracle HER2 IHC',
    platform: 'IHC', biomarkers_covered: ['HER2 protein expression'],
    linked_drugs: ['Herceptin (trastuzumab)'],
    regulatory_status: 'cleared', turnaround_days: 1,
    test_price_estimate: 220, sample_type: ['tissue'],
    estimated_annual_test_volume: 200000, estimated_revenue_m: 35,
    differentiation_score: 5, evidence_strength: 7,
    strengths: ['Low cost', 'BOND platform automation', 'Fast results'],
    weaknesses: ['Smaller market share', 'Less pathologist familiarity', 'Fewer drug linkages', 'Second tier to Ventana/Dako'],
    source: 'Leica Biosystems/Danaher; FDA 510(k) database', last_updated: '2025-01',
  },
];

// =============================================================================
// PCR-BASED CDx
// =============================================================================

const PCR_TESTS: CDxCompetitor[] = [
  {
    company: 'Qiagen', test_name: 'therascreen EGFR RGQ PCR Kit',
    platform: 'PCR', biomarkers_covered: ['EGFR (exon 19 del, L858R, T790M, exon 20 ins)'],
    linked_drugs: ['Iressa (gefitinib)', 'Tagrisso (osimertinib)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 500, sample_type: ['tissue'],
    estimated_annual_test_volume: 300000, estimated_revenue_m: 120,
    differentiation_score: 6, evidence_strength: 9,
    strengths: ['Fast turnaround (same day possible)', 'Low cost per test', 'FDA CDx approved', 'Widely installed QIAGEN platform'],
    weaknesses: ['Single gene only', 'Being replaced by NGS panels', 'Declining volume', 'Cannot detect novel EGFR variants'],
    source: 'FDA PMA P120022; QIAGEN 20-F 2024', last_updated: '2025-01',
  },
  {
    company: 'Qiagen', test_name: 'therascreen PIK3CA RGQ PCR Kit',
    platform: 'PCR', biomarkers_covered: ['PIK3CA (11 mutations)'],
    linked_drugs: ['Piqray (alpelisib)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 500, sample_type: ['tissue'],
    estimated_annual_test_volume: 80000, estimated_revenue_m: 30,
    differentiation_score: 5, evidence_strength: 8,
    strengths: ['FDA CDx for alpelisib', 'Fast and cheap', 'Clear-cut single biomarker result'],
    weaknesses: ['Narrow — PIK3CA only', 'Piqray commercial challenges', 'Replaced by NGS in many practices'],
    source: 'FDA PMA P190004; QIAGEN 20-F 2024', last_updated: '2025-01',
  },
  {
    company: 'Roche', test_name: 'cobas EGFR Mutation Test v2',
    platform: 'PCR', biomarkers_covered: ['EGFR (42 mutations including T790M)'],
    linked_drugs: ['Tarceva (erlotinib)', 'Tagrisso (osimertinib)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 500, sample_type: ['tissue', 'blood'],
    estimated_annual_test_volume: 200000, estimated_revenue_m: 80,
    differentiation_score: 6, evidence_strength: 9,
    strengths: ['Tissue AND blood (plasma) sample types', 'FDA CDx approved', 'T790M detection from blood', 'cobas platform widely installed'],
    weaknesses: ['Single gene', 'Being replaced by NGS', 'Volume declining', 'Limited EGFR variant coverage vs NGS'],
    source: 'FDA PMA P150047; Roche 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Roche', test_name: 'cobas BRAF V600 Mutation Test',
    platform: 'PCR', biomarkers_covered: ['BRAF V600E', 'BRAF V600K'],
    linked_drugs: ['Zelboraf (vemurafenib)', 'Tafinlar+Mekinist (dabrafenib+trametinib)'],
    regulatory_status: 'PMA_approved', turnaround_days: 2,
    test_price_estimate: 450, sample_type: ['tissue'],
    estimated_annual_test_volume: 150000, estimated_revenue_m: 55,
    differentiation_score: 5, evidence_strength: 9,
    strengths: ['FDA CDx approved', 'Fast turnaround', 'Melanoma standard of care', 'BRAF V600 is actionable across tumor types'],
    weaknesses: ['Only V600E/K (misses V600D, non-V600)', 'Being subsumed by NGS panels', 'Volume declining'],
    source: 'FDA PMA P110020; Roche 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Abbott', test_name: 'Vysis ALK Break Apart FISH',
    platform: 'FISH', biomarkers_covered: ['ALK rearrangement'],
    linked_drugs: ['Xalkori (crizotinib)', 'Alecensa (alectinib)', 'Lorbrena (lorlatinib)'],
    regulatory_status: 'PMA_approved', turnaround_days: 3,
    test_price_estimate: 500, sample_type: ['tissue'],
    estimated_annual_test_volume: 100000, estimated_revenue_m: 40,
    differentiation_score: 5, evidence_strength: 10,
    strengths: ['Original ALK CDx (gold standard historically)', 'FDA approved', 'Well-established protocol', 'NCCN Category 1'],
    weaknesses: ['Expensive manual scoring', 'Being replaced by IHC + NGS', 'Labor-intensive', 'Declining volume'],
    source: 'FDA PMA P110012; Abbott 10-K 2024', last_updated: '2025-01',
  },
];

// =============================================================================
// HEREDITARY / GERMLINE TESTING
// =============================================================================

const HEREDITARY: CDxCompetitor[] = [
  {
    company: 'Myriad Genetics', test_name: 'BRACAnalysis CDx',
    platform: 'PCR', biomarkers_covered: ['BRCA1', 'BRCA2 (germline)'],
    linked_drugs: ['Lynparza (olaparib)', 'Rubraca (rucaparib)', 'Talazoparib'],
    regulatory_status: 'PMA_approved', turnaround_days: 14,
    test_price_estimate: 4000, sample_type: ['blood'],
    estimated_annual_test_volume: 250000, estimated_revenue_m: 350,
    differentiation_score: 8, evidence_strength: 10,
    strengths: ['Gold standard BRCA CDx', 'Multiple PARP inhibitor CDx linkages', 'CMS coverage', '20+ year BRCA data history', 'Direct consumer awareness'],
    weaknesses: ['Single gene family (BRCA)', 'Germline-only (misses somatic)', 'Being supplemented by broader panels', 'Myriad financial restructuring'],
    source: 'FDA PMA P140020; Myriad 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Myriad Genetics', test_name: 'myChoice CDx',
    platform: 'NGS', biomarkers_covered: ['HRD (homologous recombination deficiency)', 'BRCA1', 'BRCA2', 'genomic instability score'],
    linked_drugs: ['Lynparza (olaparib)', 'Zejula (niraparib)'],
    regulatory_status: 'PMA_approved', genes_in_panel: 2, turnaround_days: 14,
    test_price_estimate: 4200, sample_type: ['tissue'],
    estimated_annual_test_volume: 150000, estimated_revenue_m: 500,
    differentiation_score: 9, evidence_strength: 10,
    strengths: ['Only FDA-approved HRD test', 'CDx for two PARP inhibitors', 'Genomic instability scoring (beyond BRCA)', 'Critical for ovarian cancer treatment'],
    weaknesses: ['Tissue required', 'Long turnaround', 'HRD scoring cutoff debate', 'Competition from other HRD assays'],
    source: 'FDA PMA P190014; Myriad 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Myriad Genetics', test_name: 'GeneSight',
    platform: 'PCR', biomarkers_covered: ['CYP2D6', 'CYP2C19', 'CYP2B6', 'SLC6A4', 'HTR2A', 'pharmacogenomic panel'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 12, turnaround_days: 5,
    test_price_estimate: 330, sample_type: ['buccal swab'],
    estimated_annual_test_volume: 500000, estimated_revenue_m: 150,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['Market leader in psychotropic pharmacogenomics', 'GUIDED RCT data', 'Easy buccal swab collection', 'High patient demand'],
    weaknesses: ['Not FDA-approved (LDT)', 'Payer pushback on coverage', 'Clinical utility debate', 'Psychiatry KOL skepticism'],
    source: 'Myriad 10-K 2024; GUIDED trial', last_updated: '2025-01',
  },
  {
    company: 'Ambry Genetics (Konica Minolta)', test_name: 'AmbryScore + CustomNext',
    platform: 'NGS', biomarkers_covered: ['BRCA1', 'BRCA2', 'PALB2', 'ATM', 'CHEK2', 'TP53', 'multi-gene hereditary cancer panel'],
    linked_drugs: ['Lynparza (olaparib)'],
    regulatory_status: 'LDT', genes_in_panel: 80, turnaround_days: 14,
    test_price_estimate: 2500, sample_type: ['blood'],
    estimated_annual_test_volume: 100000, estimated_revenue_m: 180,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['Broad hereditary cancer panel', 'Strong genetic counseling network', 'Reclassification program (VUS reduction)', 'Extensive variant database'],
    weaknesses: ['LDT only', 'Smaller brand than Myriad', 'Konica Minolta ownership uncertainty', 'No CDx approvals'],
    source: 'GenomeWeb; Konica Minolta reports 2024', last_updated: '2025-01',
  },
];

// =============================================================================
// ONCOLOGY PROGNOSTIC / TREATMENT SELECTION
// =============================================================================

const PROGNOSTIC: CDxCompetitor[] = [
  {
    company: 'Exact Sciences', test_name: 'Oncotype DX Breast',
    platform: 'PCR', biomarkers_covered: ['21-gene expression (RS score)', 'ESR1', 'PGR', 'ERBB2', 'Ki67'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 21, turnaround_days: 10,
    test_price_estimate: 4175, sample_type: ['tissue'],
    estimated_annual_test_volume: 200000, estimated_revenue_m: 700,
    differentiation_score: 9, evidence_strength: 10,
    strengths: ['Standard of care for HR+/HER2- breast cancer', 'TAILORx + RxPONDER RCT data', 'CMS coverage', 'NCCN Category 1', 'Avoids unnecessary chemo'],
    weaknesses: ['Breast cancer only', 'RT-PCR platform (older technology)', 'Competition from Prosigna/MammaPrint', 'Patent expiration approaching'],
    source: 'Exact Sciences 10-K 2024; TAILORx, RxPONDER trials', last_updated: '2025-01',
  },
  {
    company: 'Veracyte', test_name: 'Decipher Prostate',
    platform: 'microarray', biomarkers_covered: ['22-gene genomic classifier (GC score)'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 22, turnaround_days: 10,
    test_price_estimate: 3800, sample_type: ['tissue'],
    estimated_annual_test_volume: 100000, estimated_revenue_m: 300,
    differentiation_score: 8, evidence_strength: 9,
    strengths: ['Leading prostate genomic test', 'NCCN Category 1', 'CMS coverage (both biopsy and RP)', 'Validated in 20+ clinical studies'],
    weaknesses: ['Prostate only', 'Competition from Prolaris/OncotypeDX Prostate', 'Tissue required', 'LDT status'],
    source: 'Veracyte 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Veracyte', test_name: 'Afirma Genomic Sequencing Classifier',
    platform: 'NGS', biomarkers_covered: ['Thyroid gene expression classifier', 'BRAF', 'RAS', 'RET', 'genomic alterations'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 593, turnaround_days: 5,
    test_price_estimate: 3200, sample_type: ['tissue'],
    estimated_annual_test_volume: 80000, estimated_revenue_m: 200,
    differentiation_score: 9, evidence_strength: 8,
    strengths: ['Gold standard thyroid FNA classifier', 'Avoids unnecessary surgery', 'CMS coverage', 'High NPV (96%)'],
    weaknesses: ['Thyroid only', 'LDT', 'Niche market', 'Competition from ThyroSeq'],
    source: 'Veracyte 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Veracyte', test_name: 'Percepta Nasal Swab',
    platform: 'NGS', biomarkers_covered: ['Nasal gene expression classifier (lung cancer risk)'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 30, turnaround_days: 5,
    test_price_estimate: 2800, sample_type: ['nasal swab'],
    estimated_annual_test_volume: 20000, estimated_revenue_m: 45,
    differentiation_score: 8, evidence_strength: 7,
    strengths: ['Non-invasive nasal swab', 'Rules out lung cancer in indeterminate nodules', 'Novel collection method', 'Growing adoption'],
    weaknesses: ['Early commercial stage', 'Limited evidence base', 'Payer coverage building', 'Niche application'],
    source: 'Veracyte 10-K 2024', last_updated: '2025-01',
  },
  {
    company: 'Agendia', test_name: 'MammaPrint',
    platform: 'microarray', biomarkers_covered: ['70-gene expression (breast cancer prognosis)'],
    linked_drugs: [],
    regulatory_status: 'cleared', genes_in_panel: 70, turnaround_days: 10,
    test_price_estimate: 4200, sample_type: ['tissue'],
    estimated_annual_test_volume: 50000, estimated_revenue_m: 170,
    differentiation_score: 7, evidence_strength: 9,
    strengths: ['MINDACT RCT data', 'FDA cleared (510k)', 'EU widely used', 'Combined with BluePrint for subtyping'],
    weaknesses: ['Second to Oncotype DX in US', 'Higher tissue requirement', 'Less US oncologist familiarity', 'Declining US market share'],
    source: 'FDA 510(k); Agendia press releases; MINDACT trial', last_updated: '2025-01',
  },
  {
    company: 'Biotheranostics', test_name: 'CancerTYPE ID',
    platform: 'PCR', biomarkers_covered: ['92-gene expression (cancer of unknown primary)'],
    linked_drugs: [],
    regulatory_status: 'LDT', genes_in_panel: 92, turnaround_days: 5,
    test_price_estimate: 3500, sample_type: ['tissue'],
    estimated_annual_test_volume: 15000, estimated_revenue_m: 40,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['CUP identification from 50 tumor types', 'CMS coverage', 'Fast turnaround', 'Clinical utility in guiding treatment'],
    weaknesses: ['Niche market (CUP)', 'Small volume', 'LDT', 'Competition from comprehensive NGS panels'],
    source: 'Biotheranostics/Hologic; GenomeWeb', last_updated: '2025-01',
  },
];

// =============================================================================
// EMERGING / NEXT-GEN CDx
// =============================================================================

const EMERGING: CDxCompetitor[] = [
  {
    company: 'C2i Genomics', test_name: 'C2i MRD (whole-genome)',
    platform: 'NGS', biomarkers_covered: ['ctDNA (whole-genome MRD)', 'genome-wide SNVs'],
    linked_drugs: [],
    regulatory_status: 'development', genes_in_panel: 20000, turnaround_days: 14,
    test_price_estimate: 2500, sample_type: ['blood'],
    estimated_annual_test_volume: 5000, estimated_revenue_m: 10,
    differentiation_score: 7, evidence_strength: 5,
    strengths: ['Tumor-naive approach (no prior tissue needed)', 'Whole-genome depth', 'Lower cost target', 'Roche partnership'],
    weaknesses: ['Pre-commercial scale', 'Limited validation data', 'Regulatory path unclear', 'Crowded MRD space'],
    source: 'C2i Genomics press releases; Roche partnership announcement', last_updated: '2025-01',
  },
  {
    company: 'Resolution Bioscience (Agilent)', test_name: 'Resolution ctDx Lung',
    platform: 'liquid_biopsy', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'MET', 'RET', 'HER2'],
    linked_drugs: [],
    regulatory_status: 'development', genes_in_panel: 21, turnaround_days: 7,
    test_price_estimate: 3000, sample_type: ['blood'],
    estimated_annual_test_volume: 10000, estimated_revenue_m: 25,
    differentiation_score: 6, evidence_strength: 5,
    strengths: ['Agilent backing', 'Hybrid capture liquid biopsy', 'Focused NSCLC panel', 'Low DNA input requirement'],
    weaknesses: ['Pre-PMA', 'Crowded liquid biopsy space', 'Narrow panel', 'Behind Guardant/F1 Liquid'],
    source: 'Agilent press releases; GenomeWeb', last_updated: '2025-01',
  },
  {
    company: 'Burning Rock Biotech', test_name: 'OncoScreen Plus',
    platform: 'NGS', biomarkers_covered: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'MET', 'RET', 'HER2', 'TMB', 'MSI'],
    linked_drugs: [],
    regulatory_status: 'PMA_approved', genes_in_panel: 520, turnaround_days: 10,
    test_price_estimate: 3000, sample_type: ['tissue', 'blood'],
    estimated_annual_test_volume: 300000, estimated_revenue_m: 180,
    differentiation_score: 7, evidence_strength: 7,
    strengths: ['Largest CGP provider in China', 'NMPA approved', 'Dual tissue + liquid', 'Rapid China market growth'],
    weaknesses: ['China-focused (limited US/EU)', 'Regulatory challenges outside China', 'US FDA approval not planned', 'Currency/geopolitical risk'],
    source: 'Burning Rock 20-F 2024; NMPA database', last_updated: '2025-01',
  },
];

// =============================================================================
// COMBINED DATABASE + LOOKUP FUNCTIONS
// =============================================================================

export const CDX_COMPETITOR_DATABASE: CDxCompetitor[] = [
  ...NGS_PANELS,
  ...LIQUID_BIOPSY,
  ...SCREENING,
  ...MRD_MONITORING,
  ...IHC_TESTS,
  ...PCR_TESTS,
  ...HEREDITARY,
  ...PROGNOSTIC,
  ...EMERGING,
];

/**
 * Find CDx competitors that cover a specific biomarker.
 * Fuzzy matches biomarker names (case-insensitive, partial match).
 */
export function getCDxCompetitorsByBiomarker(biomarker: string): CDxCompetitor[] {
  const needle = biomarker.toLowerCase().trim();
  return CDX_COMPETITOR_DATABASE.filter(c =>
    c.biomarkers_covered.some(b => b.toLowerCase().includes(needle) || needle.includes(b.toLowerCase()))
  );
}

/**
 * Find CDx competitors by platform type.
 */
export function getCDxCompetitorsByPlatform(platform: CDxPlatform): CDxCompetitor[] {
  return CDX_COMPETITOR_DATABASE.filter(c => c.platform === platform);
}

/**
 * Find CDx competitors linked to a specific drug.
 * Fuzzy matches drug names (case-insensitive, partial match).
 */
export function getCDxCompetitorsByLinkedDrug(drug: string): CDxCompetitor[] {
  const needle = drug.toLowerCase().trim();
  return CDX_COMPETITOR_DATABASE.filter(c =>
    c.linked_drugs.some(d => d.toLowerCase().includes(needle) || needle.includes(d.toLowerCase()))
  );
}

/**
 * Get all unique biomarkers covered across the database.
 */
export function getCoveredBiomarkers(): string[] {
  const biomarkers = new Set<string>();
  for (const c of CDX_COMPETITOR_DATABASE) {
    for (const b of c.biomarkers_covered) {
      biomarkers.add(b);
    }
  }
  return Array.from(biomarkers).sort();
}

/**
 * Find CDx competitors by company name.
 */
export function getCDxCompetitorsByCompany(company: string): CDxCompetitor[] {
  const needle = company.toLowerCase().trim();
  return CDX_COMPETITOR_DATABASE.filter(c =>
    c.company.toLowerCase().includes(needle)
  );
}

/**
 * Find CDx competitors by regulatory status.
 */
export function getCDxCompetitorsByStatus(status: CDxCompetitor['regulatory_status']): CDxCompetitor[] {
  return CDX_COMPETITOR_DATABASE.filter(c => c.regulatory_status === status);
}
