// ============================================================
// TERRAIN — Companion Diagnostic (CDx) Deal Database
// Historical CDx deals, partnerships, and approvals.
// 60+ entries covering the major CDx-pharma relationships.
// ============================================================

import type { CDxDeal } from '@/types/devices-diagnostics';

export { type CDxDeal };

export const CDX_DEAL_DATABASE: CDxDeal[] = [
  // ────────────────────────────────────────────────────────────
  // FOUNDATION MEDICINE (Roche subsidiary)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Roche/Genentech',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Multiple (Alecensa, Rozlytrek, Zelboraf, Cotellic + Zelboraf)',
    biomarker: 'Comprehensive genomic profiling (324 genes)',
    indication: 'Multiple solid tumors',
    test_type: 'NGS panel',
    deal_type: 'In-house (Roche subsidiary)',
    value_reported: 'Roche acquired Foundation Medicine for $5.3B (2018)',
    date: '2017-11',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Pfizer',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Lorbrena (lorlatinib)',
    biomarker: 'ALK rearrangement',
    indication: 'ALK-positive metastatic NSCLC',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2018-11',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'AstraZeneca',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Lynparza (olaparib)',
    biomarker: 'BRCA1/2 mutations',
    indication: 'HRR-mutated metastatic castration-resistant prostate cancer',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2020-05',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Bristol-Myers Squibb',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Opdivo (nivolumab)',
    biomarker: 'TMB (Tumor Mutational Burden)',
    indication: 'TMB-high solid tumors',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2020-06',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Janssen (J&J)',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Erleada (apalutamide)',
    biomarker: 'BRCA1/2 mutations',
    indication: 'BRCA-mutated metastatic castration-resistant prostate cancer',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2021-08',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Eli Lilly',
    cdx_name: 'FoundationOne CDx',
    drug_name: 'Retevmo (selpercatinib)',
    biomarker: 'RET gene alterations (fusions/mutations)',
    indication: 'RET-altered NSCLC, thyroid cancer, and other solid tumors',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2020-05',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Roche/Genentech',
    cdx_name: 'FoundationOne Liquid CDx',
    drug_name: 'Alecensa (alectinib)',
    biomarker: 'ALK rearrangement (liquid biopsy)',
    indication: 'ALK-positive metastatic NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'In-house (Roche subsidiary)',
    date: '2020-08',
    status: 'approved',
  },
  {
    cdx_company: 'Foundation Medicine',
    drug_company: 'Roche/Genentech',
    cdx_name: 'FoundationOne Liquid CDx',
    drug_name: 'Tagrisso (osimertinib)',
    biomarker: 'EGFR mutations (liquid biopsy)',
    indication: 'EGFR-mutated NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    date: '2020-08',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // GUARDANT HEALTH
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Guardant Health',
    drug_company: 'Amgen',
    cdx_name: 'Guardant360 CDx',
    drug_name: 'Lumakras (sotorasib)',
    biomarker: 'KRAS G12C mutation',
    indication: 'KRAS G12C-mutated locally advanced or metastatic NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    value_reported: 'Terms not disclosed',
    date: '2021-05',
    status: 'approved',
  },
  {
    cdx_company: 'Guardant Health',
    drug_company: 'AstraZeneca',
    cdx_name: 'Guardant360 CDx',
    drug_name: 'Tagrisso (osimertinib)',
    biomarker: 'EGFR exon 19 deletion or L858R',
    indication: 'EGFR-mutated metastatic NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    date: '2021-08',
    status: 'approved',
  },
  {
    cdx_company: 'Guardant Health',
    drug_company: 'Janssen (J&J)',
    cdx_name: 'Guardant360 CDx',
    drug_name: 'Rybrevant (amivantamab)',
    biomarker: 'EGFR exon 20 insertion mutations',
    indication: 'EGFR exon 20 insertion-mutated NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    date: '2021-05',
    status: 'approved',
  },
  {
    cdx_company: 'Guardant Health',
    drug_company: 'Bristol-Myers Squibb',
    cdx_name: 'Guardant360 CDx',
    drug_name: 'Augtyro (repotrectinib)',
    biomarker: 'ROS1-positive (ROS1 rearrangement)',
    indication: 'ROS1-positive NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    date: '2023-11',
    status: 'approved',
  },
  {
    cdx_company: 'Guardant Health',
    drug_company: 'Multiple pharma partners',
    cdx_name: 'Guardant360 TissueNext',
    drug_name: 'Pan-tumor CDx (tissue)',
    biomarker: 'Comprehensive genomic profiling (tissue)',
    indication: 'Solid tumors',
    test_type: 'NGS panel (tissue)',
    deal_type: 'Platform development',
    date: '2023-06',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // AGILENT / DAKO
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Agilent (Dako)',
    drug_company: 'Merck',
    cdx_name: 'PD-L1 IHC 22C3 pharmDx',
    drug_name: 'Keytruda (pembrolizumab)',
    biomarker: 'PD-L1 expression (TPS and CPS)',
    indication: 'Multiple solid tumors (NSCLC, gastric, cervical, HNSCC, urothelial, TNBC, esophageal)',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2015-10',
    status: 'approved',
  },
  {
    cdx_company: 'Agilent (Dako)',
    drug_company: 'Bristol-Myers Squibb',
    cdx_name: 'PD-L1 IHC 28-8 pharmDx',
    drug_name: 'Opdivo (nivolumab)',
    biomarker: 'PD-L1 expression',
    indication: 'NSCLC, melanoma, urothelial carcinoma',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2015-10',
    status: 'approved',
  },
  {
    cdx_company: 'Agilent (Dako)',
    drug_company: 'Merck',
    cdx_name: 'HER2 IHC pharmDx',
    drug_name: 'Herceptin (trastuzumab) / Enhertu (T-DXd)',
    biomarker: 'HER2 protein expression',
    indication: 'Breast cancer, gastric cancer',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2017-03',
    status: 'approved',
  },
  {
    cdx_company: 'Agilent (Dako)',
    drug_company: 'Pfizer',
    cdx_name: 'ALK (D5F3) CDx Assay',
    drug_name: 'Xalkori (crizotinib)',
    biomarker: 'ALK protein expression',
    indication: 'ALK-positive NSCLC',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2015-06',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // QIAGEN
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Qiagen',
    drug_company: 'Merck KGaA / Eli Lilly',
    cdx_name: 'therascreen KRAS RGQ PCR Kit',
    drug_name: 'Erbitux (cetuximab) / Vectibix (panitumumab)',
    biomarker: 'KRAS mutations (codons 12 and 13)',
    indication: 'Metastatic colorectal cancer',
    test_type: 'PCR',
    deal_type: 'CDx development partnership',
    date: '2012-07',
    status: 'approved',
  },
  {
    cdx_company: 'Qiagen',
    drug_company: 'AstraZeneca',
    cdx_name: 'therascreen EGFR RGQ PCR Kit',
    drug_name: 'Iressa (gefitinib)',
    biomarker: 'EGFR exon 19 deletions and L858R',
    indication: 'EGFR-mutated NSCLC',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2015-07',
    status: 'approved',
  },
  {
    cdx_company: 'Qiagen',
    drug_company: 'AstraZeneca',
    cdx_name: 'therascreen PIK3CA RGQ PCR Kit',
    drug_name: 'Piqray (alpelisib)',
    biomarker: 'PIK3CA mutations',
    indication: 'HR+/HER2- PIK3CA-mutated advanced breast cancer',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2019-05',
    status: 'approved',
  },
  {
    cdx_company: 'Qiagen',
    drug_company: 'Novartis',
    cdx_name: 'therascreen FGFR RGQ RT-PCR Kit',
    drug_name: 'Balversa (erdafitinib)',
    biomarker: 'FGFR3 gene alterations',
    indication: 'FGFR3-altered urothelial carcinoma',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2019-04',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // ROCHE DIAGNOSTICS (cobas platform)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'AstraZeneca',
    cdx_name: 'cobas EGFR Mutation Test v2',
    drug_name: 'Tagrisso (osimertinib)',
    biomarker: 'EGFR T790M resistance mutation',
    indication: 'EGFR T790M-positive metastatic NSCLC (2L+)',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2016-09',
    status: 'approved',
  },
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'Roche/Genentech',
    cdx_name: 'cobas EGFR Mutation Test v2',
    drug_name: 'Tarceva (erlotinib)',
    biomarker: 'EGFR exon 19 deletions and L858R',
    indication: 'EGFR-mutated metastatic NSCLC',
    test_type: 'PCR',
    deal_type: 'In-house (Roche)',
    date: '2016-01',
    status: 'approved',
  },
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'Roche/Genentech',
    cdx_name: 'cobas BRAF V600 Mutation Test',
    drug_name: 'Zelboraf (vemurafenib)',
    biomarker: 'BRAF V600E mutation',
    indication: 'BRAF V600E-mutated unresectable or metastatic melanoma',
    test_type: 'PCR',
    deal_type: 'In-house (Roche)',
    date: '2011-08',
    status: 'approved',
  },
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'Ventana (Roche)',
    cdx_name: 'VENTANA PD-L1 (SP142) Assay',
    drug_name: 'Tecentriq (atezolizumab)',
    biomarker: 'PD-L1 expression (IC score)',
    indication: 'Urothelial carcinoma, TNBC, NSCLC, HCC',
    test_type: 'IHC',
    deal_type: 'In-house (Roche)',
    date: '2016-10',
    status: 'approved',
  },
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'Ventana (Roche)',
    cdx_name: 'VENTANA PD-L1 (SP263) Assay',
    drug_name: 'Imfinzi (durvalumab)',
    biomarker: 'PD-L1 expression',
    indication: 'NSCLC, urothelial carcinoma',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2017-05',
    status: 'approved',
  },
  {
    cdx_company: 'Roche Diagnostics',
    drug_company: 'AstraZeneca',
    cdx_name: 'VENTANA HER2 (4B5) RxDx Assay',
    drug_name: 'Enhertu (trastuzumab deruxtecan)',
    biomarker: 'HER2-low expression (IHC 1+ or 2+)',
    indication: 'HER2-low metastatic breast cancer',
    test_type: 'IHC',
    deal_type: 'CDx co-development agreement',
    date: '2022-08',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // MYRIAD GENETICS
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Myriad Genetics',
    drug_company: 'AstraZeneca',
    cdx_name: 'BRACAnalysis CDx',
    drug_name: 'Lynparza (olaparib)',
    biomarker: 'Germline BRCA1/2 mutations',
    indication: 'gBRCA-mutated HER2-negative metastatic breast cancer',
    test_type: 'PCR/Sequencing',
    deal_type: 'CDx co-development agreement',
    value_reported: 'Multi-year agreement, terms not disclosed',
    date: '2018-01',
    status: 'approved',
  },
  {
    cdx_company: 'Myriad Genetics',
    drug_company: 'AstraZeneca',
    cdx_name: 'BRACAnalysis CDx',
    drug_name: 'Lynparza (olaparib)',
    biomarker: 'Germline BRCA1/2 mutations',
    indication: 'gBRCA-mutated advanced ovarian cancer (1L maintenance)',
    test_type: 'PCR/Sequencing',
    deal_type: 'CDx co-development agreement',
    date: '2014-12',
    status: 'approved',
  },
  {
    cdx_company: 'Myriad Genetics',
    drug_company: 'Pfizer',
    cdx_name: 'BRACAnalysis CDx',
    drug_name: 'Talzenna (talazoparib)',
    biomarker: 'Germline BRCA1/2 mutations',
    indication: 'gBRCA-mutated HER2-negative locally advanced or metastatic breast cancer',
    test_type: 'PCR/Sequencing',
    deal_type: 'CDx co-development agreement',
    date: '2018-10',
    status: 'approved',
  },
  {
    cdx_company: 'Myriad Genetics',
    drug_company: 'AstraZeneca',
    cdx_name: 'MyChoice CDx',
    drug_name: 'Lynparza (olaparib)',
    biomarker: 'HRD (Homologous Recombination Deficiency) score',
    indication: 'HRD-positive advanced ovarian cancer',
    test_type: 'NGS + LOH scoring',
    deal_type: 'CDx co-development agreement',
    date: '2019-12',
    status: 'approved',
  },
  {
    cdx_company: 'Myriad Genetics',
    drug_company: 'GSK',
    cdx_name: 'MyChoice CDx',
    drug_name: 'Zejula (niraparib)',
    biomarker: 'HRD status',
    indication: 'HRD-positive advanced ovarian cancer',
    test_type: 'NGS + LOH scoring',
    deal_type: 'CDx co-development agreement',
    date: '2020-04',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // THERMO FISHER SCIENTIFIC
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Thermo Fisher Scientific',
    drug_company: 'Pfizer',
    cdx_name: 'Oncomine Dx Target Test',
    drug_name: 'Xalkori (crizotinib)',
    biomarker: 'ROS1 rearrangement',
    indication: 'ROS1-positive metastatic NSCLC',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2017-06',
    status: 'approved',
  },
  {
    cdx_company: 'Thermo Fisher Scientific',
    drug_company: 'Novartis',
    cdx_name: 'Oncomine Dx Target Test',
    drug_name: 'Tabrecta (capmatinib)',
    biomarker: 'MET exon 14 skipping mutation',
    indication: 'METex14-mutated metastatic NSCLC',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2020-05',
    status: 'approved',
  },
  {
    cdx_company: 'Thermo Fisher Scientific',
    drug_company: 'Bayer',
    cdx_name: 'Oncomine Dx Target Test',
    drug_name: 'Vitrakvi (larotrectinib)',
    biomarker: 'NTRK gene fusions',
    indication: 'NTRK fusion-positive solid tumors',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2018-11',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // ILLUMINA / TSO 500
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Illumina',
    drug_company: 'Bristol-Myers Squibb',
    cdx_name: 'TruSight Oncology 500 (TSO 500) CDx',
    drug_name: 'Opdivo (nivolumab) + Yervoy (ipilimumab)',
    biomarker: 'TMB-High (Tumor Mutational Burden)',
    indication: 'TMB-high NSCLC',
    test_type: 'NGS panel (523 genes)',
    deal_type: 'CDx co-development agreement',
    date: '2022-09',
    status: 'approved',
  },
  {
    cdx_company: 'Illumina',
    drug_company: 'Multiple pharma partners',
    cdx_name: 'TruSight Oncology 500 CDx',
    drug_name: 'Multiple (pan-tumor platform)',
    biomarker: 'Comprehensive genomic profiling (523 genes, TMB, MSI)',
    indication: 'Pan-tumor',
    test_type: 'NGS panel',
    deal_type: 'Platform partnership',
    date: '2023-01',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // EXACT SCIENCES
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Exact Sciences (Genomic Health)',
    drug_company: 'Multiple (not drug-linked — prognostic)',
    cdx_name: 'Oncotype DX Breast Recurrence Score',
    drug_name: 'Chemotherapy decision (prognostic, not CDx in strict sense)',
    biomarker: '21-gene expression profile (Recurrence Score)',
    indication: 'HR+/HER2- early-stage breast cancer',
    test_type: 'RT-PCR gene expression',
    deal_type: 'Standalone diagnostic',
    value_reported: 'Exact Sciences acquired Genomic Health for $2.8B (2019)',
    date: '2004-01',
    status: 'approved',
  },
  {
    cdx_company: 'Exact Sciences',
    drug_company: 'Multiple oncology drug companies',
    cdx_name: 'Oncotype DX Colon Recurrence Score',
    drug_name: 'Adjuvant chemotherapy decision',
    biomarker: '12-gene expression profile',
    indication: 'Stage II/III colon cancer',
    test_type: 'RT-PCR gene expression',
    deal_type: 'Standalone diagnostic',
    date: '2010-01',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // NATERA
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Natera',
    drug_company: 'AstraZeneca',
    cdx_name: 'Signatera',
    drug_name: 'Imfinzi (durvalumab)',
    biomarker: 'ctDNA (circulating tumor DNA) — MRD detection',
    indication: 'Muscle-invasive bladder cancer (MRD-guided therapy)',
    test_type: 'Tumor-informed liquid biopsy (personalized ctDNA)',
    deal_type: 'CDx co-development agreement',
    value_reported: '$36M upfront + milestones',
    date: '2021-03',
    status: 'clinical',
  },
  {
    cdx_company: 'Natera',
    drug_company: 'Bristol-Myers Squibb',
    cdx_name: 'Signatera',
    drug_name: 'Opdivo (nivolumab)',
    biomarker: 'ctDNA MRD status',
    indication: 'Colorectal cancer (adjuvant therapy selection)',
    test_type: 'Tumor-informed liquid biopsy',
    deal_type: 'CDx co-development agreement',
    date: '2022-06',
    status: 'clinical',
  },
  {
    cdx_company: 'Natera',
    drug_company: 'Merck',
    cdx_name: 'Signatera',
    drug_name: 'Keytruda (pembrolizumab)',
    biomarker: 'ctDNA MRD status',
    indication: 'Stage II/III colorectal cancer',
    test_type: 'Tumor-informed liquid biopsy',
    deal_type: 'CDx co-development agreement',
    date: '2023-01',
    status: 'clinical',
  },
  {
    cdx_company: 'Natera',
    drug_company: 'GSK',
    cdx_name: 'Signatera',
    drug_name: 'Jemperli (dostarlimab)',
    biomarker: 'ctDNA MRD status',
    indication: 'Endometrial cancer',
    test_type: 'Tumor-informed liquid biopsy',
    deal_type: 'CDx co-development agreement',
    date: '2022-09',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // VERACYTE
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Veracyte',
    drug_company: 'Not drug-linked (standalone)',
    cdx_name: 'Afirma Genomic Sequencing Classifier',
    drug_name: 'Thyroid surgery decision (diagnostic, not CDx)',
    biomarker: 'Gene expression classifier for thyroid nodules',
    indication: 'Indeterminate thyroid nodules',
    test_type: 'RNA gene expression + genomic classifier',
    deal_type: 'Standalone diagnostic',
    date: '2012-01',
    status: 'approved',
  },
  {
    cdx_company: 'Veracyte',
    drug_company: 'Not drug-linked (standalone)',
    cdx_name: 'Percepta Genomic Sequencing Classifier',
    drug_name: 'Lung cancer risk stratification',
    biomarker: 'Bronchial genomic classifier',
    indication: 'Lung cancer risk assessment from bronchoscopy samples',
    test_type: 'Genomic classifier',
    deal_type: 'Standalone diagnostic',
    date: '2018-06',
    status: 'approved',
  },
  {
    cdx_company: 'Veracyte',
    drug_company: 'Not drug-linked (standalone)',
    cdx_name: 'Decipher Prostate',
    drug_name: 'Radiation/ADT decision (prognostic)',
    biomarker: '22-gene genomic classifier (GC)',
    indication: 'Localized prostate cancer (post-prostatectomy)',
    test_type: 'RNA gene expression',
    deal_type: 'Standalone diagnostic (acquired from GenomeDx)',
    date: '2013-01',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // NEOGENOMICS
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'NeoGenomics',
    drug_company: 'Bayer',
    cdx_name: 'NeoTYPE Discovery Profile',
    drug_name: 'Vitrakvi (larotrectinib)',
    biomarker: 'NTRK fusions',
    indication: 'NTRK fusion-positive solid tumors',
    test_type: 'NGS panel',
    deal_type: 'Lab partnership',
    date: '2019-06',
    status: 'approved',
  },
  {
    cdx_company: 'NeoGenomics',
    drug_company: 'Multiple pharma partners',
    cdx_name: 'NeoTYPE Comprehensive Tumor Panel',
    drug_name: 'Multiple targeted therapies',
    biomarker: 'Multi-gene panel (500+ genes)',
    indication: 'Solid tumors',
    test_type: 'NGS panel',
    deal_type: 'Reference laboratory partnership',
    date: '2020-01',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // ABBOTT / VYSIS
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Abbott (Vysis)',
    drug_company: 'Pfizer',
    cdx_name: 'Vysis ALK Break Apart FISH Probe Kit',
    drug_name: 'Xalkori (crizotinib)',
    biomarker: 'ALK rearrangement',
    indication: 'ALK-positive metastatic NSCLC',
    test_type: 'FISH',
    deal_type: 'CDx co-development agreement',
    date: '2011-08',
    status: 'approved',
  },
  {
    cdx_company: 'Abbott (Vysis)',
    drug_company: 'Daiichi Sankyo / AstraZeneca',
    cdx_name: 'Vysis HER2 IQFISH pharmDx',
    drug_name: 'Enhertu (trastuzumab deruxtecan)',
    biomarker: 'HER2 gene amplification',
    indication: 'HER2-positive metastatic breast cancer',
    test_type: 'FISH',
    deal_type: 'CDx partnership',
    date: '2019-12',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // BIODESIX
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Biodesix',
    drug_company: 'Not drug-linked (treatment selection)',
    cdx_name: 'GeneStrat',
    drug_name: 'NSCLC targeted therapy selection',
    biomarker: 'Liquid biopsy multi-gene panel (EGFR, ALK, ROS1, BRAF, KRAS, MET)',
    indication: 'Newly diagnosed NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'Standalone diagnostic',
    date: '2019-03',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // TEMPUS AI
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Tempus AI',
    drug_company: 'Multiple pharma partners',
    cdx_name: 'Tempus xT',
    drug_name: 'Multiple (platform for clinical trial matching)',
    biomarker: 'Comprehensive genomic profiling (648 genes)',
    indication: 'Solid tumors',
    test_type: 'NGS panel + transcriptome',
    deal_type: 'Data partnership + clinical trial support',
    value_reported: '$6B+ valuation (2024 IPO)',
    date: '2020-01',
    status: 'approved',
  },
  {
    cdx_company: 'Tempus AI',
    drug_company: 'GSK',
    cdx_name: 'Tempus xT / xR',
    drug_name: 'GSK oncology pipeline',
    biomarker: 'Multi-omics (genomic + transcriptomic)',
    indication: 'Multiple oncology indications',
    test_type: 'NGS + RNA sequencing',
    deal_type: 'Strategic data partnership',
    value_reported: '$70M multi-year agreement',
    date: '2022-04',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // BIOCARTIS
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Biocartis',
    drug_company: 'Janssen (J&J)',
    cdx_name: 'Idylla KRAS Mutation Test',
    drug_name: 'Anti-EGFR therapy selection',
    biomarker: 'KRAS mutations (21 mutations)',
    indication: 'Metastatic colorectal cancer',
    test_type: 'PCR (cartridge-based)',
    deal_type: 'CDx development agreement',
    date: '2017-11',
    status: 'approved',
  },
  {
    cdx_company: 'Biocartis',
    drug_company: 'AstraZeneca',
    cdx_name: 'Idylla EGFR Mutation Test',
    drug_name: 'Tagrisso (osimertinib)',
    biomarker: 'EGFR mutations',
    indication: 'EGFR-mutated NSCLC',
    test_type: 'PCR (cartridge-based)',
    deal_type: 'CDx development agreement',
    date: '2018-06',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // RESOLUTION BIOSCIENCE (now Agilent)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Resolution Bioscience (Agilent)',
    drug_company: 'Janssen (J&J)',
    cdx_name: 'Resolution ctDx FIRST',
    drug_name: 'Rybrevant (amivantamab)',
    biomarker: 'EGFR exon 20 insertion mutations (liquid biopsy)',
    indication: 'EGFR exon 20 insertion-mutated NSCLC',
    test_type: 'Liquid biopsy NGS',
    deal_type: 'CDx co-development agreement',
    date: '2021-05',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // INVIVOSCRIBE (ArcherDx / now Invivoscribe)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Invivoscribe',
    drug_company: 'Novartis',
    cdx_name: 'LeukoStrat CDx FLT3 Mutation Assay',
    drug_name: 'Rydapt (midostaurin)',
    biomarker: 'FLT3 ITD and TKD mutations',
    indication: 'FLT3-mutated acute myeloid leukemia (AML)',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2017-04',
    status: 'approved',
  },
  {
    cdx_company: 'Invivoscribe',
    drug_company: 'Astellas/Seagen',
    cdx_name: 'LeukoStrat CDx FLT3 Mutation Assay',
    drug_name: 'Xospata (gilteritinib)',
    biomarker: 'FLT3 ITD and TKD mutations',
    indication: 'FLT3-mutated relapsed/refractory AML',
    test_type: 'PCR',
    deal_type: 'CDx co-development agreement',
    date: '2018-11',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // LEICA BIOSYSTEMS (Danaher)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Leica Biosystems',
    drug_company: 'Pfizer',
    cdx_name: 'BOND Oracle HER2 IHC System',
    drug_name: 'HER2-targeted therapies',
    biomarker: 'HER2 protein expression',
    indication: 'Breast cancer',
    test_type: 'IHC',
    deal_type: 'CDx development partnership',
    date: '2016-05',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // PERSONAL GENOME DIAGNOSTICS (PGDx)
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Personal Genome Diagnostics (PGDx)',
    drug_company: 'Merck',
    cdx_name: 'PGDx elio tissue complete',
    drug_name: 'Keytruda (pembrolizumab)',
    biomarker: 'MSI-High / TMB-High',
    indication: 'MSI-H/TMB-H solid tumors',
    test_type: 'NGS panel',
    deal_type: 'CDx co-development agreement',
    date: '2022-01',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // HOLOGIC / GEN-PROBE
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Hologic (Gen-Probe)',
    drug_company: 'AstraZeneca',
    cdx_name: 'Aptima BRCAness CDx',
    drug_name: 'Lynparza (olaparib)',
    biomarker: 'HRD-related gene expression',
    indication: 'Advanced ovarian cancer',
    test_type: 'RNA-based transcriptome assay',
    deal_type: 'CDx development partnership',
    date: '2021-06',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // CARIS LIFE SCIENCES
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Caris Life Sciences',
    drug_company: 'Multiple pharma partners',
    cdx_name: 'MI Profile (Molecular Intelligence)',
    drug_name: 'Treatment selection across multiple drugs',
    biomarker: 'Multi-analyte profiling (WES + WTS + proteomics)',
    indication: 'Pan-tumor molecular profiling',
    test_type: 'WES + RNA sequencing + IHC/FISH',
    deal_type: 'Platform partnership + clinical trial matching',
    date: '2019-01',
    status: 'approved',
  },

  // ────────────────────────────────────────────────────────────
  // BIORAD
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'Bio-Rad',
    drug_company: 'Amgen',
    cdx_name: 'QX200 Droplet Digital PCR — KRAS',
    drug_name: 'Lumakras (sotorasib)',
    biomarker: 'KRAS G12C mutation (ddPCR)',
    indication: 'KRAS G12C-mutated NSCLC',
    test_type: 'Digital PCR',
    deal_type: 'Technology partnership',
    date: '2021-01',
    status: 'clinical',
  },

  // ────────────────────────────────────────────────────────────
  // NEOGENOMICS / INFORM DIAGNOSTICS
  // ────────────────────────────────────────────────────────────
  {
    cdx_company: 'NeoGenomics',
    drug_company: 'Eli Lilly',
    cdx_name: 'NeoGenomics RET CDx',
    drug_name: 'Retevmo (selpercatinib)',
    biomarker: 'RET fusions and mutations',
    indication: 'RET-altered NSCLC and thyroid cancer',
    test_type: 'NGS panel',
    deal_type: 'CDx development partnership',
    date: '2020-09',
    status: 'clinical',
  },
];

// ────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────

export function getCDxDealsByCompany(cdxCompany: string): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter(
    (d) => d.cdx_company.toLowerCase().includes(cdxCompany.toLowerCase()),
  );
}

export function getCDxDealsByDrugCompany(drugCompany: string): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter(
    (d) => d.drug_company.toLowerCase().includes(drugCompany.toLowerCase()),
  );
}

export function getCDxDealsByBiomarker(biomarker: string): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter(
    (d) => d.biomarker.toLowerCase().includes(biomarker.toLowerCase()),
  );
}

export function getCDxDealsByIndication(indication: string): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter(
    (d) => d.indication.toLowerCase().includes(indication.toLowerCase()),
  );
}

export function getCDxDealsByStatus(status: CDxDeal['status']): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter((d) => d.status === status);
}

export function getCDxDealsByTestType(testType: string): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter(
    (d) => d.test_type.toLowerCase().includes(testType.toLowerCase()),
  );
}

export function getApprovedCDxDeals(): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter((d) => d.status === 'approved');
}

export function getPipelineCDxDeals(): CDxDeal[] {
  return CDX_DEAL_DATABASE.filter((d) => d.status === 'clinical' || d.status === 'pending');
}
