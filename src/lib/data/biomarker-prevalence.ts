export interface BiomarkerEntry {
  biomarker: string;
  indications: string[];
  prevalence_pct: number;
  testing_rate_pct: number;
  test_type: string;
  cdx_drugs: string[];
  clinical_significance: string;
  trending: boolean;
}

export const BIOMARKER_PREVALENCE: BiomarkerEntry[] = [
  // ---------------------------------------------------------------------------
  // ONCOLOGY
  // ---------------------------------------------------------------------------

  // EGFR
  {
    biomarker: 'EGFR mutation (exon 19 del / L858R)',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 17,
    testing_rate_pct: 78,
    test_type: 'NGS',
    cdx_drugs: ['osimertinib', 'erlotinib', 'afatinib', 'gefitinib', 'dacomitinib'],
    clinical_significance:
      'Activating EGFR mutations predict response to EGFR TKIs with ORR ~70-80%. Standard first-line biomarker in NSCLC.',
    trending: false,
  },
  {
    biomarker: 'EGFR T790M',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 50,
    testing_rate_pct: 72,
    test_type: 'liquid biopsy',
    cdx_drugs: ['osimertinib'],
    clinical_significance:
      'Acquired resistance mutation arising in ~50% of patients after first/second-gen EGFR TKI. Detectable via ctDNA.',
    trending: false,
  },
  {
    biomarker: 'EGFR exon 20 insertion',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 2,
    testing_rate_pct: 65,
    test_type: 'NGS',
    cdx_drugs: ['amivantamab', 'mobocertinib'],
    clinical_significance:
      'Historically difficult-to-target EGFR alteration. New agents have expanded treatment options.',
    trending: true,
  },
  {
    biomarker: 'EGFR amplification',
    indications: ['glioblastoma', 'GBM', 'head and neck squamous cell carcinoma', 'HNSCC'],
    prevalence_pct: 40,
    testing_rate_pct: 45,
    test_type: 'FISH',
    cdx_drugs: ['cetuximab'],
    clinical_significance:
      'Common in GBM (~40%) and HNSCC (~15%). Prognostic role established; predictive value for anti-EGFR therapy is context-dependent.',
    trending: false,
  },

  // ALK
  {
    biomarker: 'ALK rearrangement',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 5,
    testing_rate_pct: 76,
    test_type: 'NGS',
    cdx_drugs: ['alectinib', 'brigatinib', 'lorlatinib', 'crizotinib', 'ceritinib'],
    clinical_significance:
      'EML4-ALK fusions define a targetable subset of NSCLC. ALK TKIs yield ORR ~70-85% including CNS activity.',
    trending: false,
  },
  {
    biomarker: 'ALK rearrangement',
    indications: ['anaplastic large cell lymphoma', 'ALCL'],
    prevalence_pct: 55,
    testing_rate_pct: 90,
    test_type: 'IHC',
    cdx_drugs: ['crizotinib', 'brentuximab vedotin'],
    clinical_significance:
      'ALK-positive ALCL has a more favorable prognosis than ALK-negative. IHC is the primary screening modality.',
    trending: false,
  },

  // ROS1
  {
    biomarker: 'ROS1 rearrangement',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 2,
    testing_rate_pct: 70,
    test_type: 'NGS',
    cdx_drugs: ['crizotinib', 'entrectinib', 'lorlatinib'],
    clinical_significance:
      'Rare but highly targetable fusion in NSCLC. Crizotinib ORR ~72%; entrectinib also active in CNS metastases.',
    trending: false,
  },

  // KRAS
  {
    biomarker: 'KRAS G12C',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 13,
    testing_rate_pct: 74,
    test_type: 'NGS',
    cdx_drugs: ['sotorasib', 'adagrasib'],
    clinical_significance:
      'First clinically targetable KRAS mutation. Sotorasib ORR ~37% in pretreated NSCLC; adagrasib shows similar activity.',
    trending: true,
  },
  {
    biomarker: 'KRAS G12C',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 3,
    testing_rate_pct: 68,
    test_type: 'NGS',
    cdx_drugs: ['sotorasib', 'adagrasib'],
    clinical_significance:
      'Lower prevalence than in NSCLC. Combination strategies (KRAS G12C inhibitor + anti-EGFR) under active investigation.',
    trending: true,
  },
  {
    biomarker: 'KRAS mutation (any)',
    indications: ['pancreatic cancer', 'pancreatic ductal adenocarcinoma', 'PDAC'],
    prevalence_pct: 90,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'KRAS is mutated in ~90% of PDAC, predominantly G12D and G12V. Direct targeting remains an unmet need; G12D inhibitors in early trials.',
    trending: true,
  },
  {
    biomarker: 'KRAS wild-type',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 55,
    testing_rate_pct: 88,
    test_type: 'NGS',
    cdx_drugs: ['cetuximab', 'panitumumab'],
    clinical_significance:
      'KRAS wild-type status is required for anti-EGFR antibody benefit. Extended RAS testing (NRAS, BRAF) further refines selection.',
    trending: false,
  },

  // BRAF
  {
    biomarker: 'BRAF V600E',
    indications: ['melanoma'],
    prevalence_pct: 50,
    testing_rate_pct: 92,
    test_type: 'NGS',
    cdx_drugs: ['dabrafenib', 'trametinib', 'vemurafenib', 'cobimetinib', 'encorafenib', 'binimetinib'],
    clinical_significance:
      'Hallmark oncogenic driver in melanoma. BRAF + MEK inhibitor combinations yield ORR ~65-70% with durable responses.',
    trending: false,
  },
  {
    biomarker: 'BRAF V600E',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 8,
    testing_rate_pct: 82,
    test_type: 'NGS',
    cdx_drugs: ['encorafenib', 'cetuximab'],
    clinical_significance:
      'Poor prognostic marker in CRC. BEACON regimen (encorafenib + cetuximab) improved OS in BRAF V600E-mutant mCRC.',
    trending: false,
  },
  {
    biomarker: 'BRAF V600E',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 2,
    testing_rate_pct: 72,
    test_type: 'NGS',
    cdx_drugs: ['dabrafenib', 'trametinib'],
    clinical_significance:
      'Rare but actionable mutation in NSCLC. Dabrafenib + trametinib ORR ~64% in treatment-naive patients.',
    trending: false,
  },
  {
    biomarker: 'BRAF V600E',
    indications: ['hairy cell leukemia', 'HCL'],
    prevalence_pct: 97,
    testing_rate_pct: 85,
    test_type: 'PCR',
    cdx_drugs: ['vemurafenib'],
    clinical_significance:
      'Near-universal in classic HCL, serving as a diagnostic marker and therapeutic target in relapsed disease.',
    trending: false,
  },
  {
    biomarker: 'BRAF V600E',
    indications: ['thyroid cancer', 'papillary thyroid carcinoma'],
    prevalence_pct: 45,
    testing_rate_pct: 60,
    test_type: 'NGS',
    cdx_drugs: ['dabrafenib', 'trametinib'],
    clinical_significance:
      'Most common driver in papillary thyroid cancer. Associated with radioiodine refractoriness and more aggressive behavior.',
    trending: false,
  },

  // HER2
  {
    biomarker: 'HER2 overexpression / amplification',
    indications: ['breast cancer'],
    prevalence_pct: 18,
    testing_rate_pct: 95,
    test_type: 'IHC',
    cdx_drugs: [
      'trastuzumab',
      'pertuzumab',
      'ado-trastuzumab emtansine',
      'trastuzumab deruxtecan',
      'tucatinib',
      'lapatinib',
      'neratinib',
      'margetuximab',
    ],
    clinical_significance:
      'Defines HER2-positive breast cancer. Anti-HER2 therapy has transformed prognosis; T-DXd active even in HER2-low.',
    trending: false,
  },
  {
    biomarker: 'HER2-low (IHC 1+ or 2+/ISH-)',
    indications: ['breast cancer'],
    prevalence_pct: 55,
    testing_rate_pct: 90,
    test_type: 'IHC',
    cdx_drugs: ['trastuzumab deruxtecan'],
    clinical_significance:
      'Emerging category encompassing majority of previously HER2-negative breast cancers. T-DXd showed PFS benefit in DESTINY-Breast04.',
    trending: true,
  },
  {
    biomarker: 'HER2 overexpression / amplification',
    indications: ['gastric cancer', 'gastroesophageal junction cancer', 'GEJ'],
    prevalence_pct: 20,
    testing_rate_pct: 80,
    test_type: 'IHC',
    cdx_drugs: ['trastuzumab', 'trastuzumab deruxtecan'],
    clinical_significance:
      'HER2 positivity in gastric/GEJ cancer predicts benefit from trastuzumab + chemotherapy. T-DXd active in later lines.',
    trending: false,
  },
  {
    biomarker: 'HER2 mutation',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 3,
    testing_rate_pct: 65,
    test_type: 'NGS',
    cdx_drugs: ['trastuzumab deruxtecan'],
    clinical_significance:
      'HER2 exon 20 insertions and missense mutations represent actionable targets; T-DXd granted accelerated approval.',
    trending: true,
  },
  {
    biomarker: 'HER2 amplification',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 3,
    testing_rate_pct: 50,
    test_type: 'NGS',
    cdx_drugs: ['trastuzumab', 'tucatinib', 'trastuzumab deruxtecan'],
    clinical_significance:
      'Enriched in KRAS wild-type CRC. HER2-targeted combinations (trastuzumab + tucatinib) show activity in refractory disease.',
    trending: true,
  },

  // PD-L1
  {
    biomarker: 'PD-L1 TPS >= 50%',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 28,
    testing_rate_pct: 85,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'atezolizumab', 'cemiplimab'],
    clinical_significance:
      'High PD-L1 expression predicts monotherapy benefit from anti-PD-1/PD-L1 agents; pembrolizumab monotherapy ORR ~45% in TPS >= 50%.',
    trending: false,
  },
  {
    biomarker: 'PD-L1 TPS >= 1%',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 60,
    testing_rate_pct: 85,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'nivolumab', 'atezolizumab'],
    clinical_significance:
      'Broader PD-L1 positivity threshold used to select patients for combination chemo-immunotherapy strategies.',
    trending: false,
  },
  {
    biomarker: 'PD-L1 CPS >= 10',
    indications: ['gastric cancer', 'gastroesophageal junction cancer', 'GEJ'],
    prevalence_pct: 35,
    testing_rate_pct: 72,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'nivolumab'],
    clinical_significance:
      'CPS (combined positive score) accounts for tumor and immune cell staining. Higher CPS correlates with greater immunotherapy benefit.',
    trending: false,
  },
  {
    biomarker: 'PD-L1 CPS >= 5',
    indications: ['triple-negative breast cancer', 'TNBC'],
    prevalence_pct: 40,
    testing_rate_pct: 78,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab'],
    clinical_significance:
      'KEYNOTE-522 demonstrated pCR and EFS benefit with pembrolizumab + chemo in early TNBC irrespective of PD-L1, but PD-L1 enriches benefit in metastatic setting.',
    trending: false,
  },
  {
    biomarker: 'PD-L1 expression',
    indications: ['urothelial carcinoma', 'bladder cancer'],
    prevalence_pct: 30,
    testing_rate_pct: 70,
    test_type: 'IHC',
    cdx_drugs: ['atezolizumab', 'pembrolizumab', 'nivolumab', 'avelumab'],
    clinical_significance:
      'PD-L1 status used for cisplatin-ineligible patient selection. Avelumab maintenance benefit seen regardless of PD-L1.',
    trending: false,
  },
  {
    biomarker: 'PD-L1 expression',
    indications: ['head and neck squamous cell carcinoma', 'HNSCC'],
    prevalence_pct: 55,
    testing_rate_pct: 75,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'nivolumab'],
    clinical_significance:
      'CPS >= 1 required for first-line pembrolizumab. Higher CPS associated with greater immunotherapy benefit in recurrent/metastatic HNSCC.',
    trending: false,
  },

  // MSI-H / dMMR
  {
    biomarker: 'MSI-H / dMMR',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 15,
    testing_rate_pct: 88,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'nivolumab', 'ipilimumab', 'dostarlimab'],
    clinical_significance:
      'MSI-H CRC responds exceptionally to checkpoint inhibitors. First-line pembrolizumab superior to chemo in metastatic MSI-H CRC.',
    trending: false,
  },
  {
    biomarker: 'MSI-H / dMMR',
    indications: ['endometrial cancer'],
    prevalence_pct: 28,
    testing_rate_pct: 80,
    test_type: 'IHC',
    cdx_drugs: ['pembrolizumab', 'dostarlimab'],
    clinical_significance:
      'High prevalence in endometrial cancer. Dostarlimab showed durable responses; pembrolizumab + lenvatinib approved for dMMR tumors.',
    trending: false,
  },
  {
    biomarker: 'MSI-H / dMMR (tumor-agnostic)',
    indications: ['solid tumors', 'pan-cancer'],
    prevalence_pct: 4,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: ['pembrolizumab', 'dostarlimab'],
    clinical_significance:
      'First tissue-agnostic biomarker approval. Pembrolizumab ORR ~40% across MSI-H solid tumors regardless of histology.',
    trending: false,
  },

  // BRCA1/2
  {
    biomarker: 'BRCA1/2 mutation (germline)',
    indications: ['ovarian cancer'],
    prevalence_pct: 18,
    testing_rate_pct: 82,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'rucaparib', 'niraparib'],
    clinical_significance:
      'BRCA-mutant ovarian cancer highly sensitive to PARP inhibitors. Olaparib maintenance improved PFS by >3 years in first-line.',
    trending: false,
  },
  {
    biomarker: 'BRCA1/2 mutation (germline)',
    indications: ['breast cancer'],
    prevalence_pct: 5,
    testing_rate_pct: 70,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'talazoparib'],
    clinical_significance:
      'Germline BRCA mutations confer sensitivity to PARP inhibitors and platinum chemotherapy in metastatic breast cancer.',
    trending: false,
  },
  {
    biomarker: 'BRCA1/2 mutation (somatic or germline)',
    indications: ['prostate cancer', 'castration-resistant prostate cancer', 'CRPC'],
    prevalence_pct: 12,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'rucaparib'],
    clinical_significance:
      'Homologous recombination deficiency in mCRPC predicts PARP inhibitor benefit. Olaparib + abiraterone also active in BRCA-mutant CRPC.',
    trending: true,
  },
  {
    biomarker: 'BRCA1/2 mutation (somatic)',
    indications: ['pancreatic cancer', 'PDAC'],
    prevalence_pct: 6,
    testing_rate_pct: 50,
    test_type: 'NGS',
    cdx_drugs: ['olaparib'],
    clinical_significance:
      'Olaparib maintenance after platinum-based chemo improved PFS in germline BRCA-mutant metastatic pancreatic cancer (POLO trial).',
    trending: false,
  },

  // NTRK
  {
    biomarker: 'NTRK fusion (tumor-agnostic)',
    indications: ['solid tumors', 'pan-cancer', 'infantile fibrosarcoma', 'secretory breast cancer', 'thyroid cancer'],
    prevalence_pct: 0.3,
    testing_rate_pct: 45,
    test_type: 'NGS',
    cdx_drugs: ['larotrectinib', 'entrectinib'],
    clinical_significance:
      'Rare across common cancers but enriched in specific histologies. Tissue-agnostic ORR ~75% with TRK inhibitors.',
    trending: true,
  },

  // RET
  {
    biomarker: 'RET fusion',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 2,
    testing_rate_pct: 68,
    test_type: 'NGS',
    cdx_drugs: ['selpercatinib', 'pralsetinib'],
    clinical_significance:
      'Selective RET inhibitors achieve ORR ~60-85% with durable CNS responses. Selpercatinib approved first-line.',
    trending: true,
  },
  {
    biomarker: 'RET mutation / fusion',
    indications: ['medullary thyroid cancer', 'MTC', 'thyroid cancer'],
    prevalence_pct: 60,
    testing_rate_pct: 78,
    test_type: 'NGS',
    cdx_drugs: ['selpercatinib', 'pralsetinib', 'vandetanib', 'cabozantinib'],
    clinical_significance:
      'RET is the primary oncogenic driver in hereditary and sporadic MTC. Selective RET inhibitors outperform multikinase inhibitors in ORR and tolerability.',
    trending: false,
  },

  // MET
  {
    biomarker: 'MET exon 14 skipping mutation',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 3,
    testing_rate_pct: 65,
    test_type: 'NGS',
    cdx_drugs: ['capmatinib', 'tepotinib'],
    clinical_significance:
      'Activating splice-site mutations lead to MET exon 14 skipping. Capmatinib ORR ~68% in treatment-naive patients.',
    trending: true,
  },
  {
    biomarker: 'MET amplification',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 4,
    testing_rate_pct: 55,
    test_type: 'FISH',
    cdx_drugs: ['capmatinib', 'tepotinib'],
    clinical_significance:
      'De novo or acquired (post-EGFR TKI) MET amplification. Emerging as combination strategy target with EGFR inhibitors.',
    trending: true,
  },

  // PIK3CA
  {
    biomarker: 'PIK3CA mutation',
    indications: ['breast cancer', 'HR-positive breast cancer'],
    prevalence_pct: 40,
    testing_rate_pct: 72,
    test_type: 'NGS',
    cdx_drugs: ['alpelisib'],
    clinical_significance:
      'PIK3CA mutations activate PI3K pathway. Alpelisib + fulvestrant improved PFS in PIK3CA-mutant HR+/HER2- advanced breast cancer.',
    trending: false,
  },

  // FGFR
  {
    biomarker: 'FGFR2 fusion / rearrangement',
    indications: ['cholangiocarcinoma', 'intrahepatic cholangiocarcinoma', 'bile duct cancer'],
    prevalence_pct: 14,
    testing_rate_pct: 65,
    test_type: 'NGS',
    cdx_drugs: ['pemigatinib', 'futibatinib', 'infigratinib'],
    clinical_significance:
      'FGFR2 fusions define a targetable subset of intrahepatic cholangiocarcinoma. ORR ~35-42% with selective FGFR inhibitors.',
    trending: true,
  },
  {
    biomarker: 'FGFR3 mutation / fusion',
    indications: ['urothelial carcinoma', 'bladder cancer'],
    prevalence_pct: 20,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: ['erdafitinib'],
    clinical_significance:
      'FGFR3 alterations enriched in luminal-papillary subtype. Erdafitinib ORR ~40% in pretreated FGFR-altered urothelial carcinoma.',
    trending: true,
  },

  // TP53
  {
    biomarker: 'TP53 mutation',
    indications: ['solid tumors', 'pan-cancer', 'AML', 'MDS', 'CLL'],
    prevalence_pct: 45,
    testing_rate_pct: 60,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Most commonly mutated gene in cancer. Generally a poor prognostic marker. No approved direct targeting agents yet; reactivators in clinical trials.',
    trending: true,
  },

  // TMB-High
  {
    biomarker: 'TMB-High (>= 10 mut/Mb, tumor-agnostic)',
    indications: ['solid tumors', 'pan-cancer'],
    prevalence_pct: 13,
    testing_rate_pct: 50,
    test_type: 'NGS',
    cdx_drugs: ['pembrolizumab'],
    clinical_significance:
      'Tissue-agnostic biomarker for pembrolizumab. TMB-H enriches for immunotherapy response but is imperfect as a standalone predictor.',
    trending: false,
  },

  // HRD
  {
    biomarker: 'HRD (homologous recombination deficiency)',
    indications: ['ovarian cancer'],
    prevalence_pct: 50,
    testing_rate_pct: 65,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'niraparib'],
    clinical_significance:
      'HRD-positive tumors (including BRCA-mutant and BRCA-wild-type with genomic scarring) benefit from PARP inhibitor maintenance.',
    trending: true,
  },
  {
    biomarker: 'HRD (homologous recombination deficiency)',
    indications: ['prostate cancer', 'CRPC'],
    prevalence_pct: 20,
    testing_rate_pct: 48,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'niraparib', 'talazoparib'],
    clinical_significance:
      'Broader HRD panel (ATM, PALB2, CDK12, CHEK2, etc.) identifies additional PARP-sensitive prostate cancers beyond BRCA.',
    trending: true,
  },

  // ctDNA / liquid biopsy
  {
    biomarker: 'ctDNA (circulating tumor DNA)',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 80,
    testing_rate_pct: 60,
    test_type: 'liquid biopsy',
    cdx_drugs: [],
    clinical_significance:
      'Enables non-invasive genotyping for EGFR, ALK, ROS1, KRAS. Detectable in ~80% of advanced NSCLC. Concordance with tissue ~85%.',
    trending: true,
  },
  {
    biomarker: 'ctDNA (MRD detection)',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 15,
    testing_rate_pct: 25,
    test_type: 'liquid biopsy',
    cdx_drugs: [],
    clinical_significance:
      'Post-surgical ctDNA positivity identifies patients at high relapse risk. MRD-guided adjuvant therapy trials (DYNAMIC) show promise.',
    trending: true,
  },
  {
    biomarker: 'ctDNA (MRD detection)',
    indications: ['breast cancer'],
    prevalence_pct: 18,
    testing_rate_pct: 20,
    test_type: 'liquid biopsy',
    cdx_drugs: [],
    clinical_significance:
      'Emerging application for residual disease monitoring post-neoadjuvant therapy. Predicts recurrence months before clinical detection.',
    trending: true,
  },

  // ESR1
  {
    biomarker: 'ESR1 mutation',
    indications: ['breast cancer', 'HR-positive metastatic breast cancer'],
    prevalence_pct: 30,
    testing_rate_pct: 45,
    test_type: 'liquid biopsy',
    cdx_drugs: ['elacestrant'],
    clinical_significance:
      'Acquired resistance mechanism to aromatase inhibitors. Elacestrant is the first oral SERD approved for ESR1-mutant ER+/HER2- mBC.',
    trending: true,
  },

  // IDH1/2
  {
    biomarker: 'IDH1 mutation',
    indications: ['cholangiocarcinoma', 'bile duct cancer'],
    prevalence_pct: 13,
    testing_rate_pct: 62,
    test_type: 'NGS',
    cdx_drugs: ['ivosidenib'],
    clinical_significance:
      'IDH1 R132 mutations define a targetable subset. Ivosidenib improved PFS vs placebo in pretreated IDH1-mutant cholangiocarcinoma.',
    trending: false,
  },
  {
    biomarker: 'IDH1/2 mutation',
    indications: ['AML', 'acute myeloid leukemia'],
    prevalence_pct: 20,
    testing_rate_pct: 85,
    test_type: 'NGS',
    cdx_drugs: ['ivosidenib', 'enasidenib'],
    clinical_significance:
      'IDH mutations produce oncometabolite 2-HG. Targeted inhibitors achieve CR/CRi in relapsed/refractory AML with favorable safety.',
    trending: false,
  },
  {
    biomarker: 'IDH1/2 mutation',
    indications: ['glioma', 'low-grade glioma', 'GBM'],
    prevalence_pct: 70,
    testing_rate_pct: 90,
    test_type: 'NGS',
    cdx_drugs: ['vorasidenib'],
    clinical_significance:
      'Defines favorable-prognosis glioma subtypes. Vorasidenib, a dual IDH1/2 inhibitor, showed significant PFS improvement in grade 2 gliomas.',
    trending: true,
  },

  // FLT3
  {
    biomarker: 'FLT3-ITD',
    indications: ['AML', 'acute myeloid leukemia'],
    prevalence_pct: 25,
    testing_rate_pct: 92,
    test_type: 'PCR',
    cdx_drugs: ['midostaurin', 'gilteritinib', 'quizartinib'],
    clinical_significance:
      'FLT3-ITD confers poor prognosis in AML. FLT3 inhibitors added to induction improve OS. Gilteritinib is standard in relapsed FLT3+ AML.',
    trending: false,
  },

  // BCR-ABL
  {
    biomarker: 'BCR-ABL1 (Philadelphia chromosome)',
    indications: ['CML', 'chronic myeloid leukemia', 'ALL', 'acute lymphoblastic leukemia'],
    prevalence_pct: 95,
    testing_rate_pct: 98,
    test_type: 'PCR',
    cdx_drugs: ['imatinib', 'dasatinib', 'nilotinib', 'bosutinib', 'ponatinib', 'asciminib'],
    clinical_significance:
      'Pathognomonic for CML. TKI therapy achieves deep molecular responses enabling treatment-free remission in select patients.',
    trending: false,
  },

  // CD markers - hematologic malignancies
  {
    biomarker: 'CD20 expression',
    indications: ['non-Hodgkin lymphoma', 'NHL', 'CLL', 'DLBCL'],
    prevalence_pct: 90,
    testing_rate_pct: 95,
    test_type: 'IHC',
    cdx_drugs: ['rituximab', 'obinutuzumab', 'ofatumumab'],
    clinical_significance:
      'Universal target in B-cell malignancies. Anti-CD20 antibodies are backbone of lymphoma treatment across subtypes.',
    trending: false,
  },
  {
    biomarker: 'CD19 expression',
    indications: ['ALL', 'acute lymphoblastic leukemia', 'DLBCL', 'non-Hodgkin lymphoma'],
    prevalence_pct: 88,
    testing_rate_pct: 90,
    test_type: 'IHC',
    cdx_drugs: [
      'blinatumomab',
      'tisagenlecleucel',
      'axicabtagene ciloleucel',
      'lisocabtagene maraleucel',
      'brexucabtagene autoleucel',
    ],
    clinical_significance:
      'Primary CAR-T cell therapy target. CD19-directed CAR-T achieves CR ~50-80% in relapsed/refractory B-ALL and DLBCL.',
    trending: false,
  },
  {
    biomarker: 'BCMA expression',
    indications: ['multiple myeloma'],
    prevalence_pct: 95,
    testing_rate_pct: 60,
    test_type: 'IHC',
    cdx_drugs: ['idecabtagene vicleucel', 'ciltacabtagene autoleucel', 'teclistamab', 'elranatamab'],
    clinical_significance:
      'Near-universal target on myeloma cells. BCMA-directed CAR-T and bispecific antibodies achieve deep responses in heavily pretreated patients.',
    trending: true,
  },

  // GPNMB / Claudin / Nectin / Trop-2
  {
    biomarker: 'Trop-2 expression',
    indications: ['triple-negative breast cancer', 'TNBC', 'urothelial carcinoma', 'bladder cancer', 'NSCLC'],
    prevalence_pct: 85,
    testing_rate_pct: 30,
    test_type: 'IHC',
    cdx_drugs: ['sacituzumab govitecan', 'datopotamab deruxtecan'],
    clinical_significance:
      'Broadly expressed but enriched in TNBC and urothelial cancer. Sacituzumab govitecan is standard in metastatic TNBC; no companion diagnostic required.',
    trending: true,
  },

  // Claudin 18.2
  {
    biomarker: 'Claudin 18.2 expression',
    indications: ['gastric cancer', 'gastroesophageal junction cancer', 'GEJ', 'pancreatic cancer'],
    prevalence_pct: 38,
    testing_rate_pct: 20,
    test_type: 'IHC',
    cdx_drugs: ['zolbetuximab'],
    clinical_significance:
      'Tight junction protein expressed in gastric and pancreatic cancers. Zolbetuximab + chemo improved OS in CLDN18.2+ gastric cancer (SPOTLIGHT/GLOW).',
    trending: true,
  },

  // DLL3
  {
    biomarker: 'DLL3 expression',
    indications: ['small cell lung cancer', 'SCLC'],
    prevalence_pct: 80,
    testing_rate_pct: 25,
    test_type: 'IHC',
    cdx_drugs: ['tarlatamab'],
    clinical_significance:
      'Neuroendocrine marker highly expressed in SCLC. Tarlatamab (DLL3 x CD3 bispecific T-cell engager) shows promising activity.',
    trending: true,
  },

  // Tumor-informed vs tumor-naive ctDNA panels
  {
    biomarker: 'Signatera (tumor-informed ctDNA)',
    indications: ['colorectal cancer', 'CRC', 'breast cancer', 'bladder cancer', 'NSCLC'],
    prevalence_pct: 10,
    testing_rate_pct: 15,
    test_type: 'liquid biopsy',
    cdx_drugs: [],
    clinical_significance:
      'Personalized MRD assay tracking patient-specific somatic variants. Positive ctDNA post-surgery associated with 7-18x higher relapse risk.',
    trending: true,
  },

  // HLA-A*02:01 (for TCR therapies)
  {
    biomarker: 'HLA-A*02:01 + MAGE-A4',
    indications: ['synovial sarcoma', 'NSCLC', 'head and neck cancer'],
    prevalence_pct: 40,
    testing_rate_pct: 15,
    test_type: 'NGS',
    cdx_drugs: ['afamitresgene autoleucel'],
    clinical_significance:
      'HLA-restricted TCR-based therapy. Afami-cel targets MAGE-A4 in HLA-A*02:01+ patients; ORR ~37% in synovial sarcoma.',
    trending: true,
  },

  // Oncotype DX / genomic assays (gene expression)
  {
    biomarker: 'Oncotype DX Recurrence Score (RS < 26)',
    indications: ['breast cancer', 'HR-positive HER2-negative early breast cancer'],
    prevalence_pct: 70,
    testing_rate_pct: 85,
    test_type: 'gene expression assay',
    cdx_drugs: [],
    clinical_significance:
      '21-gene assay predicts chemotherapy benefit in HR+/HER2- node-negative breast cancer. RS < 26 identifies patients who can safely omit chemo (TAILORx/RxPONDER).',
    trending: false,
  },

  // Microsatellite stable + other IO biomarkers
  {
    biomarker: 'POLE / POLD1 mutation',
    indications: ['endometrial cancer', 'colorectal cancer', 'CRC'],
    prevalence_pct: 7,
    testing_rate_pct: 45,
    test_type: 'NGS',
    cdx_drugs: ['pembrolizumab'],
    clinical_significance:
      'Ultramutated phenotype with excellent prognosis. POLE-mutant endometrial cancers respond to checkpoint inhibitors even without MSI-H.',
    trending: true,
  },

  // NRG1
  {
    biomarker: 'NRG1 fusion',
    indications: ['NSCLC', 'pancreatic cancer', 'PDAC'],
    prevalence_pct: 0.2,
    testing_rate_pct: 30,
    test_type: 'NGS',
    cdx_drugs: ['zenocutuzumab'],
    clinical_significance:
      'Ultra-rare fusion across solid tumors. Zenocutuzumab (anti-HER2/HER3 bispecific) shows activity in NRG1 fusion-positive cancers.',
    trending: true,
  },

  // KRASG12D
  {
    biomarker: 'KRAS G12D',
    indications: ['pancreatic cancer', 'PDAC', 'NSCLC', 'colorectal cancer'],
    prevalence_pct: 35,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Most common KRAS mutation in PDAC. KRAS G12D inhibitors (MRTX1133 and others) in early clinical development represent major unmet need.',
    trending: true,
  },

  // STK11 / KEAP1
  {
    biomarker: 'STK11 / LKB1 mutation',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 17,
    testing_rate_pct: 60,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Negative predictive biomarker for immunotherapy in KRAS-mutant NSCLC. STK11 loss associated with immunologically cold tumors.',
    trending: true,
  },
  {
    biomarker: 'KEAP1 mutation',
    indications: ['NSCLC', 'non-small cell lung cancer'],
    prevalence_pct: 15,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Poor prognostic marker associated with resistance to both chemo and immunotherapy. Emerging therapeutic strategies targeting NRF2 pathway.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // NEUROLOGY
  // ---------------------------------------------------------------------------
  {
    biomarker: 'Amyloid-beta (PET imaging)',
    indications: ["Alzheimer's disease", 'mild cognitive impairment', 'MCI'],
    prevalence_pct: 85,
    testing_rate_pct: 30,
    test_type: 'PET',
    cdx_drugs: ['lecanemab', 'donanemab', 'aducanumab'],
    clinical_significance:
      'Amyloid PET confirms cerebral amyloid plaques. Required for anti-amyloid therapy eligibility. ~85% of clinically suspected AD are amyloid-positive.',
    trending: true,
  },
  {
    biomarker: 'Amyloid-beta 42/40 ratio (CSF)',
    indications: ["Alzheimer's disease", 'mild cognitive impairment', 'MCI'],
    prevalence_pct: 85,
    testing_rate_pct: 22,
    test_type: 'CSF assay',
    cdx_drugs: ['lecanemab', 'donanemab'],
    clinical_significance:
      'Reduced CSF A-beta 42/40 ratio reflects amyloid plaque deposition. Alternative to PET for confirming amyloid pathology.',
    trending: true,
  },
  {
    biomarker: 'p-tau 217 (blood-based)',
    indications: ["Alzheimer's disease", 'mild cognitive impairment', 'MCI'],
    prevalence_pct: 80,
    testing_rate_pct: 10,
    test_type: 'blood assay',
    cdx_drugs: ['lecanemab', 'donanemab'],
    clinical_significance:
      'Most accurate blood-based AD biomarker. AUC >0.95 for amyloid/tau positivity. Poised to transform AD screening and clinical trial enrollment.',
    trending: true,
  },
  {
    biomarker: 'p-tau 181 (blood/CSF)',
    indications: ["Alzheimer's disease", 'mild cognitive impairment', 'MCI'],
    prevalence_pct: 75,
    testing_rate_pct: 15,
    test_type: 'blood assay',
    cdx_drugs: ['lecanemab'],
    clinical_significance:
      'Correlates with amyloid and tau PET. Less specific than p-tau 217 but more widely validated. Differentiates AD from other dementias.',
    trending: true,
  },
  {
    biomarker: 'Tau PET (flortaucipir)',
    indications: ["Alzheimer's disease"],
    prevalence_pct: 70,
    testing_rate_pct: 8,
    test_type: 'PET',
    cdx_drugs: [],
    clinical_significance:
      'Directly visualizes tau neurofibrillary tangles in vivo. Tau PET burden correlates with cognitive decline better than amyloid PET.',
    trending: true,
  },
  {
    biomarker: 'NfL (neurofilament light chain)',
    indications: [
      'multiple sclerosis',
      'MS',
      'ALS',
      'amyotrophic lateral sclerosis',
      'frontotemporal dementia',
      'FTD',
      "Alzheimer's disease",
    ],
    prevalence_pct: 70,
    testing_rate_pct: 20,
    test_type: 'blood assay',
    cdx_drugs: [],
    clinical_significance:
      'Non-specific marker of neuroaxonal damage. Elevated in active MS, ALS, FTD. Used to monitor treatment response and disease progression.',
    trending: true,
  },
  {
    biomarker: 'APOE4 (one or two alleles)',
    indications: ["Alzheimer's disease"],
    prevalence_pct: 25,
    testing_rate_pct: 35,
    test_type: 'genotyping',
    cdx_drugs: [],
    clinical_significance:
      'Strongest genetic risk factor for sporadic AD. APOE4 homozygotes have ~12x increased risk. Influences ARIA risk with anti-amyloid therapies.',
    trending: false,
  },
  {
    biomarker: 'SOD1 mutation',
    indications: ['ALS', 'amyotrophic lateral sclerosis'],
    prevalence_pct: 2,
    testing_rate_pct: 45,
    test_type: 'NGS',
    cdx_drugs: ['tofersen'],
    clinical_significance:
      'SOD1 mutations cause ~2% of all ALS and ~20% of familial ALS. Tofersen (antisense oligonucleotide) reduces SOD1 protein and slows progression.',
    trending: true,
  },
  {
    biomarker: 'C9orf72 repeat expansion',
    indications: ['ALS', 'amyotrophic lateral sclerosis', 'frontotemporal dementia', 'FTD'],
    prevalence_pct: 8,
    testing_rate_pct: 50,
    test_type: 'repeat-primed PCR',
    cdx_drugs: [],
    clinical_significance:
      'Most common genetic cause of ALS and FTD. GGGGCC hexanucleotide repeat expansion. Multiple antisense and gene therapy approaches in trials.',
    trending: true,
  },
  {
    biomarker: 'HTT CAG repeat expansion',
    indications: ["Huntington's disease"],
    prevalence_pct: 100,
    testing_rate_pct: 15,
    test_type: 'PCR',
    cdx_drugs: [],
    clinical_significance:
      'Definitive diagnostic biomarker. CAG >= 36 repeats is pathogenic; longer repeats correlate with earlier onset. HTT-lowering therapies in development.',
    trending: false,
  },
  {
    biomarker: 'Alpha-synuclein seed amplification assay (SAA)',
    indications: ["Parkinson's disease", 'dementia with Lewy bodies', 'DLB', 'multiple system atrophy', 'MSA'],
    prevalence_pct: 88,
    testing_rate_pct: 5,
    test_type: 'CSF assay',
    cdx_drugs: [],
    clinical_significance:
      'Detects misfolded alpha-synuclein in CSF with >90% sensitivity/specificity for synucleinopathies. Poised to become a definitive in-vivo diagnostic.',
    trending: true,
  },
  {
    biomarker: 'GFAP (glial fibrillary acidic protein)',
    indications: ["Alzheimer's disease", 'traumatic brain injury', 'TBI', 'multiple sclerosis'],
    prevalence_pct: 60,
    testing_rate_pct: 12,
    test_type: 'blood assay',
    cdx_drugs: [],
    clinical_significance:
      'Marker of astrocytic activation. Elevated in AD (correlates with amyloid), TBI, and active MS. Complementary to NfL for neurodegeneration monitoring.',
    trending: true,
  },
  {
    biomarker: '14-3-3 protein (CSF)',
    indications: ['Creutzfeldt-Jakob disease', 'CJD', 'prion disease'],
    prevalence_pct: 90,
    testing_rate_pct: 80,
    test_type: 'CSF assay',
    cdx_drugs: [],
    clinical_significance:
      'Established diagnostic marker for CJD with high sensitivity. RT-QuIC assay for prion seeding has further improved diagnostic accuracy.',
    trending: false,
  },
  {
    biomarker: 'Anti-aquaporin-4 (AQP4) antibody',
    indications: ['neuromyelitis optica spectrum disorder', 'NMOSD'],
    prevalence_pct: 75,
    testing_rate_pct: 85,
    test_type: 'serum assay',
    cdx_drugs: ['eculizumab', 'inebilizumab', 'satralizumab'],
    clinical_significance:
      'Pathogenic autoantibody defining AQP4+ NMOSD. All three approved therapies specifically target AQP4-seropositive patients.',
    trending: false,
  },
  {
    biomarker: 'Anti-MOG antibody',
    indications: ['MOG antibody-associated disease', 'MOGAD'],
    prevalence_pct: 95,
    testing_rate_pct: 65,
    test_type: 'serum assay',
    cdx_drugs: [],
    clinical_significance:
      'Defines MOGAD as distinct from NMOSD and MS. Cell-based assay preferred over ELISA. Treatment differs from MS; targeted therapies in trials.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // IMMUNOLOGY / AUTOIMMUNE
  // ---------------------------------------------------------------------------
  {
    biomarker: 'ANA (antinuclear antibody)',
    indications: [
      'systemic lupus erythematosus',
      'SLE',
      'lupus',
      "Sjogren's syndrome",
      'mixed connective tissue disease',
    ],
    prevalence_pct: 95,
    testing_rate_pct: 92,
    test_type: 'IFA',
    cdx_drugs: [],
    clinical_significance:
      'High sensitivity screening test for SLE (~95%) but limited specificity. Positive in many autoimmune and even healthy individuals.',
    trending: false,
  },
  {
    biomarker: 'Anti-dsDNA antibody',
    indications: ['systemic lupus erythematosus', 'SLE', 'lupus'],
    prevalence_pct: 60,
    testing_rate_pct: 88,
    test_type: 'ELISA',
    cdx_drugs: ['belimumab', 'anifrolumab'],
    clinical_significance:
      'Highly specific for SLE (~95% specificity). Titers correlate with disease activity, especially lupus nephritis. Useful for monitoring flares.',
    trending: false,
  },
  {
    biomarker: 'Anti-CCP antibody (anti-cyclic citrullinated peptide)',
    indications: ['rheumatoid arthritis', 'RA'],
    prevalence_pct: 70,
    testing_rate_pct: 85,
    test_type: 'ELISA',
    cdx_drugs: [],
    clinical_significance:
      'High specificity (~95%) for RA, can be positive years before symptom onset. Anti-CCP+ RA tends to be more erosive and aggressive.',
    trending: false,
  },
  {
    biomarker: 'Rheumatoid factor (RF)',
    indications: ['rheumatoid arthritis', 'RA', "Sjogren's syndrome", 'cryoglobulinemia'],
    prevalence_pct: 75,
    testing_rate_pct: 90,
    test_type: 'nephelometry',
    cdx_drugs: [],
    clinical_significance:
      'Present in ~75% of RA. Lower specificity than anti-CCP; positive in other autoimmune conditions and infections. Double-positive (RF+/CCP+) predicts aggressive disease.',
    trending: false,
  },
  {
    biomarker: 'HLA-B27',
    indications: ['ankylosing spondylitis', 'axial spondyloarthritis', 'reactive arthritis', 'anterior uveitis'],
    prevalence_pct: 90,
    testing_rate_pct: 70,
    test_type: 'genotyping',
    cdx_drugs: [],
    clinical_significance:
      'Present in ~90% of ankylosing spondylitis but also in 6-8% of general population. Supports diagnosis in appropriate clinical context.',
    trending: false,
  },
  {
    biomarker: 'ANCA (c-ANCA / PR3)',
    indications: ['granulomatosis with polyangiitis', 'GPA', "Wegener's granulomatosis"],
    prevalence_pct: 85,
    testing_rate_pct: 88,
    test_type: 'ELISA',
    cdx_drugs: ['rituximab', 'avacopan'],
    clinical_significance:
      'c-ANCA/PR3 highly specific for GPA. Titers may correlate with disease activity. Avacopan (C5a receptor inhibitor) approved for ANCA-associated vasculitis.',
    trending: false,
  },
  {
    biomarker: 'ANCA (p-ANCA / MPO)',
    indications: ['microscopic polyangiitis', 'MPA', 'eosinophilic granulomatosis with polyangiitis', 'EGPA'],
    prevalence_pct: 70,
    testing_rate_pct: 85,
    test_type: 'ELISA',
    cdx_drugs: ['rituximab', 'avacopan'],
    clinical_significance:
      'p-ANCA/MPO predominates in MPA and EGPA. Associated with renal-limited vasculitis and pulmonary-renal syndromes.',
    trending: false,
  },
  {
    biomarker: 'Complement C3/C4 (low levels)',
    indications: ['systemic lupus erythematosus', 'SLE', 'lupus nephritis', 'IgA nephropathy', 'C3 glomerulopathy'],
    prevalence_pct: 60,
    testing_rate_pct: 85,
    test_type: 'nephelometry',
    cdx_drugs: ['iptacopan', 'pegcetacoplan'],
    clinical_significance:
      'Low complement reflects consumption via immune complexes (SLE) or alternative pathway dysregulation. Complement inhibitors emerging for renal indications.',
    trending: true,
  },
  {
    biomarker: 'IL-6 (elevated)',
    indications: ['rheumatoid arthritis', 'RA', 'Castleman disease', 'cytokine release syndrome', 'CRS'],
    prevalence_pct: 50,
    testing_rate_pct: 40,
    test_type: 'ELISA',
    cdx_drugs: ['tocilizumab', 'sarilumab', 'siltuximab'],
    clinical_significance:
      'Key pro-inflammatory cytokine in RA pathogenesis. IL-6R blockade (tocilizumab) is established therapy. Siltuximab approved for Castleman disease.',
    trending: false,
  },
  {
    biomarker: 'TNF-alpha (elevated)',
    indications: [
      'rheumatoid arthritis',
      'RA',
      "Crohn's disease",
      'ulcerative colitis',
      'psoriasis',
      'ankylosing spondylitis',
    ],
    prevalence_pct: 65,
    testing_rate_pct: 25,
    test_type: 'ELISA',
    cdx_drugs: ['adalimumab', 'infliximab', 'etanercept', 'certolizumab pegol', 'golimumab'],
    clinical_significance:
      'Central mediator of inflammation. Anti-TNF biologics transformed treatment of autoimmune diseases. Not routinely measured clinically; used more in research.',
    trending: false,
  },
  {
    biomarker: 'Anti-phospholipid antibodies (aCL, anti-beta2-GPI, lupus anticoagulant)',
    indications: ['antiphospholipid syndrome', 'APS', 'systemic lupus erythematosus', 'SLE'],
    prevalence_pct: 40,
    testing_rate_pct: 75,
    test_type: 'ELISA',
    cdx_drugs: [],
    clinical_significance:
      'Defines APS risk for thrombosis and pregnancy complications. Triple-positive (all three antibodies) confers highest thrombotic risk. Present in ~40% of SLE.',
    trending: false,
  },
  {
    biomarker: 'Type I interferon gene signature',
    indications: ['systemic lupus erythematosus', 'SLE', 'dermatomyositis'],
    prevalence_pct: 75,
    testing_rate_pct: 15,
    test_type: 'gene expression assay',
    cdx_drugs: ['anifrolumab'],
    clinical_significance:
      'Elevated IFN signature in ~75% of SLE. Anifrolumab (anti-IFNAR1) approved for SLE; patients with high IFN signature derive greater benefit.',
    trending: true,
  },
  {
    biomarker: 'Blood eosinophil count (>= 300 cells/uL)',
    indications: ['severe asthma', 'eosinophilic asthma', 'EGPA', 'hypereosinophilic syndrome'],
    prevalence_pct: 50,
    testing_rate_pct: 80,
    test_type: 'CBC',
    cdx_drugs: ['mepolizumab', 'benralizumab', 'reslizumab', 'dupilumab'],
    clinical_significance:
      'Blood eosinophils >= 300/uL predict response to anti-IL-5/IL-5R and anti-IL-4R biologics. Higher counts correlate with greater exacerbation reduction.',
    trending: false,
  },
  {
    biomarker: 'IgE (total and specific)',
    indications: ['allergic asthma', 'chronic spontaneous urticaria', 'atopic dermatitis'],
    prevalence_pct: 60,
    testing_rate_pct: 75,
    test_type: 'ELISA',
    cdx_drugs: ['omalizumab'],
    clinical_significance:
      'Elevated total IgE and allergen-specific IgE guide anti-IgE therapy dosing. Omalizumab approved for allergic asthma and chronic urticaria.',
    trending: false,
  },
  {
    biomarker: 'Anti-MuSK antibody',
    indications: ['myasthenia gravis', 'MuSK-MG'],
    prevalence_pct: 7,
    testing_rate_pct: 80,
    test_type: 'cell-based assay',
    cdx_drugs: ['rituximab'],
    clinical_significance:
      'Defines a distinct MG subtype that responds poorly to cholinesterase inhibitors but well to rituximab. Predominantly IgG4 subclass.',
    trending: false,
  },
  {
    biomarker: 'Anti-AChR antibody',
    indications: ['myasthenia gravis'],
    prevalence_pct: 85,
    testing_rate_pct: 95,
    test_type: 'RIA',
    cdx_drugs: ['eculizumab', 'ravulizumab', 'efgartigimod', 'rozanolixizumab', 'zilucoplan'],
    clinical_significance:
      'Primary autoantibody in generalized MG. Complement-mediated pathogenesis targeted by C5 inhibitors and FcRn blockers.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // CARDIOLOGY
  // ---------------------------------------------------------------------------
  {
    biomarker: 'BNP (B-type natriuretic peptide)',
    indications: ['heart failure', 'acute decompensated heart failure', 'ADHF'],
    prevalence_pct: 90,
    testing_rate_pct: 92,
    test_type: 'immunoassay',
    cdx_drugs: [],
    clinical_significance:
      'BNP > 100 pg/mL suggests heart failure. Used for diagnosis, prognosis, and monitoring treatment response. Levels correlate with NYHA class.',
    trending: false,
  },
  {
    biomarker: 'NT-proBNP',
    indications: ['heart failure', 'HFrEF', 'HFpEF'],
    prevalence_pct: 88,
    testing_rate_pct: 90,
    test_type: 'immunoassay',
    cdx_drugs: ['sacubitril/valsartan'],
    clinical_significance:
      'Age-stratified cutoffs for diagnosis. NT-proBNP > 300 pg/mL has high sensitivity for acute HF. Used as enrollment criterion in heart failure trials.',
    trending: false,
  },
  {
    biomarker: 'High-sensitivity troponin I/T (hs-cTn)',
    indications: ['acute coronary syndrome', 'ACS', 'myocardial infarction', 'MI'],
    prevalence_pct: 95,
    testing_rate_pct: 98,
    test_type: 'immunoassay',
    cdx_drugs: [],
    clinical_significance:
      'Gold standard for myocardial injury diagnosis. Serial hs-cTn enables rapid rule-in/rule-out of MI within 1-3 hours.',
    trending: false,
  },
  {
    biomarker: 'hs-CRP (high-sensitivity C-reactive protein)',
    indications: ['cardiovascular disease', 'atherosclerosis', 'coronary artery disease'],
    prevalence_pct: 35,
    testing_rate_pct: 40,
    test_type: 'immunoassay',
    cdx_drugs: ['canakinumab'],
    clinical_significance:
      'hs-CRP > 2 mg/L indicates elevated cardiovascular risk. CANTOS trial showed IL-1beta inhibition reduced MACE in patients with residual inflammatory risk.',
    trending: false,
  },
  {
    biomarker: 'Lp(a) (lipoprotein(a))',
    indications: ['cardiovascular disease', 'atherosclerosis', 'aortic stenosis'],
    prevalence_pct: 20,
    testing_rate_pct: 25,
    test_type: 'immunoassay',
    cdx_drugs: [],
    clinical_significance:
      'Genetically determined cardiovascular risk factor. Lp(a) > 50 mg/dL (~125 nmol/L) doubles ASCVD risk. RNA-based therapies (pelacarsen, olpasiran) in phase 3.',
    trending: true,
  },
  {
    biomarker: 'PCSK9 level / genetic variant',
    indications: ['familial hypercholesterolemia', 'FH', 'atherosclerotic cardiovascular disease', 'ASCVD'],
    prevalence_pct: 100,
    testing_rate_pct: 30,
    test_type: 'genotyping',
    cdx_drugs: ['evolocumab', 'alirocumab', 'inclisiran'],
    clinical_significance:
      'PCSK9 inhibitors lower LDL-C by 50-60%. Gain-of-function mutations cause severe FH. Inclisiran (siRNA) offers twice-yearly dosing.',
    trending: false,
  },
  {
    biomarker: 'LDL-P (LDL particle number)',
    indications: ['cardiovascular disease', 'dyslipidemia', 'atherosclerosis'],
    prevalence_pct: 30,
    testing_rate_pct: 15,
    test_type: 'NMR spectroscopy',
    cdx_drugs: [],
    clinical_significance:
      'LDL-P may be more predictive of ASCVD risk than LDL-C, especially in discordant cases (normal LDL-C but high particle number). Guides therapy intensification.',
    trending: false,
  },
  {
    biomarker: 'Transthyretin (TTR) - cardiac amyloidosis',
    indications: ['ATTR cardiac amyloidosis', 'transthyretin amyloid cardiomyopathy', 'ATTR-CM'],
    prevalence_pct: 13,
    testing_rate_pct: 20,
    test_type: 'nuclear scintigraphy',
    cdx_drugs: ['tafamidis', 'acoramidis'],
    clinical_significance:
      'ATTR-CM underdiagnosed in HFpEF population (~13% of HFpEF). Tc-99m PYP scan enables non-invasive diagnosis. Tafamidis reduces mortality and hospitalization.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // METABOLIC
  // ---------------------------------------------------------------------------
  {
    biomarker: 'HbA1c',
    indications: ['type 2 diabetes', 'type 1 diabetes', 'prediabetes'],
    prevalence_pct: 100,
    testing_rate_pct: 95,
    test_type: 'chromatography',
    cdx_drugs: [],
    clinical_significance:
      'HbA1c >= 6.5% diagnostic for diabetes; 5.7-6.4% indicates prediabetes. Reflects average glycemia over 2-3 months. Guides treatment intensification.',
    trending: false,
  },
  {
    biomarker: 'HOMA-IR (insulin resistance index)',
    indications: ['type 2 diabetes', 'metabolic syndrome', 'NASH', 'PCOS'],
    prevalence_pct: 40,
    testing_rate_pct: 15,
    test_type: 'calculated (fasting glucose x fasting insulin / 405)',
    cdx_drugs: [],
    clinical_significance:
      'HOMA-IR > 2.5 suggests insulin resistance. Used in research to identify metabolically unhealthy phenotypes. Not routinely measured in clinical practice.',
    trending: false,
  },
  {
    biomarker: 'Adiponectin (low levels)',
    indications: ['metabolic syndrome', 'type 2 diabetes', 'NASH', 'cardiovascular disease'],
    prevalence_pct: 45,
    testing_rate_pct: 5,
    test_type: 'ELISA',
    cdx_drugs: [],
    clinical_significance:
      'Adiponectin inversely correlates with insulin resistance and visceral adiposity. Low levels predict cardiometabolic risk. Primarily a research biomarker.',
    trending: false,
  },
  {
    biomarker: 'GLP-1 (endogenous levels)',
    indications: ['type 2 diabetes', 'obesity'],
    prevalence_pct: 60,
    testing_rate_pct: 5,
    test_type: 'ELISA',
    cdx_drugs: ['semaglutide', 'liraglutide', 'tirzepatide', 'dulaglutide'],
    clinical_significance:
      'Impaired GLP-1 secretion contributes to T2D pathophysiology. GLP-1 RAs achieve HbA1c reduction of 1-2% and significant weight loss. Not measured to guide therapy.',
    trending: false,
  },
  {
    biomarker: 'FIB-4 index / ELF score (liver fibrosis)',
    indications: ['NASH', 'MASH', 'metabolic dysfunction-associated steatohepatitis', 'NAFLD'],
    prevalence_pct: 20,
    testing_rate_pct: 30,
    test_type: 'calculated / serum panel',
    cdx_drugs: ['resmetirom'],
    clinical_significance:
      'Non-invasive fibrosis assessment for NASH. FIB-4 >= 1.3 warrants further evaluation. Resmetirom is the first approved drug for NASH with fibrosis (F2-F3).',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // RARE DISEASES
  // ---------------------------------------------------------------------------
  {
    biomarker: 'SMN1 gene deletion (homozygous)',
    indications: ['spinal muscular atrophy', 'SMA'],
    prevalence_pct: 95,
    testing_rate_pct: 90,
    test_type: 'MLPA / qPCR',
    cdx_drugs: ['nusinersen', 'onasemnogene abeparvovec', 'risdiplam'],
    clinical_significance:
      'Biallelic SMN1 deletion/mutation causes SMA. SMN2 copy number modifies severity. Gene therapy (onasemnogene) and SMN2 splicing modifiers are transformative.',
    trending: false,
  },
  {
    biomarker: 'SMN2 copy number',
    indications: ['spinal muscular atrophy', 'SMA'],
    prevalence_pct: 100,
    testing_rate_pct: 85,
    test_type: 'MLPA',
    cdx_drugs: ['nusinersen', 'risdiplam'],
    clinical_significance:
      'Primary disease modifier in SMA. 1 copy = type 1 (severe), 2 copies = type 1-2, 3 copies = type 2-3, 4+ copies = milder phenotypes. Guides treatment urgency.',
    trending: false,
  },
  {
    biomarker: 'GBA1 mutation (glucocerebrosidase deficiency)',
    indications: ['Gaucher disease', "Parkinson's disease"],
    prevalence_pct: 95,
    testing_rate_pct: 85,
    test_type: 'enzyme assay / genotyping',
    cdx_drugs: ['imiglucerase', 'velaglucerase alfa', 'taliglucerase alfa', 'eliglustat', 'miglustat'],
    clinical_significance:
      "Biallelic GBA1 mutations cause Gaucher disease. Heterozygous GBA1 mutations are the strongest genetic risk factor for Parkinson's disease (5-10% of PD).",
    trending: true,
  },
  {
    biomarker: 'Alpha-galactosidase A deficiency',
    indications: ['Fabry disease'],
    prevalence_pct: 100,
    testing_rate_pct: 60,
    test_type: 'enzyme assay',
    cdx_drugs: ['agalsidase beta', 'agalsidase alfa', 'migalastat'],
    clinical_significance:
      'Males: low/absent enzyme activity is diagnostic. Females: enzyme levels unreliable (X-linked); molecular testing required. Migalastat for amenable GLA variants.',
    trending: false,
  },
  {
    biomarker: 'Acid sphingomyelinase deficiency',
    indications: ['Niemann-Pick disease type A/B', 'ASMD'],
    prevalence_pct: 100,
    testing_rate_pct: 50,
    test_type: 'enzyme assay',
    cdx_drugs: ['olipudase alfa'],
    clinical_significance:
      'Deficient ASM activity confirms ASMD. Olipudase alfa (enzyme replacement) is the first approved therapy, reducing spleen volume and improving pulmonary function.',
    trending: true,
  },
  {
    biomarker: 'Hexosaminidase A deficiency',
    indications: ['Tay-Sachs disease'],
    prevalence_pct: 100,
    testing_rate_pct: 75,
    test_type: 'enzyme assay',
    cdx_drugs: [],
    clinical_significance:
      'Absent or severely reduced Hex A activity is diagnostic. Carrier screening standard in Ashkenazi Jewish population (carrier frequency ~1 in 30).',
    trending: false,
  },
  {
    biomarker: 'Phenylalanine (elevated blood levels)',
    indications: ['phenylketonuria', 'PKU'],
    prevalence_pct: 100,
    testing_rate_pct: 99,
    test_type: 'tandem mass spectrometry (NBS)',
    cdx_drugs: ['sapropterin', 'pegvaliase'],
    clinical_significance:
      'Universal newborn screening detects PKU (Phe > 120 umol/L). Sapropterin effective in BH4-responsive PKU (~25-50%). Pegvaliase for adults with uncontrolled PKU.',
    trending: false,
  },
  {
    biomarker: 'GAA enzyme deficiency',
    indications: ['Pompe disease', 'glycogen storage disease type II'],
    prevalence_pct: 100,
    testing_rate_pct: 70,
    test_type: 'enzyme assay (DBS)',
    cdx_drugs: ['alglucosidase alfa', 'avalglucosidase alfa', 'cipaglucosidase alfa'],
    clinical_significance:
      'Acid alpha-glucosidase deficiency causes glycogen accumulation in muscle. Newborn screening expanding. Next-gen ERTs improve muscle uptake.',
    trending: false,
  },
  {
    biomarker: 'Chitotriosidase / lyso-Gb1',
    indications: ['Gaucher disease'],
    prevalence_pct: 90,
    testing_rate_pct: 75,
    test_type: 'fluorometric assay',
    cdx_drugs: [],
    clinical_significance:
      'Markedly elevated in untreated Gaucher disease. Used as a treatment response biomarker; lyso-Gb1 (glucosylsphingosine) is more specific and sensitive.',
    trending: false,
  },
  {
    biomarker: 'Galactose-1-phosphate uridylyltransferase (GALT) deficiency',
    indications: ['classic galactosemia'],
    prevalence_pct: 100,
    testing_rate_pct: 98,
    test_type: 'enzyme assay (NBS)',
    cdx_drugs: [],
    clinical_significance:
      'Detected via newborn screening. GALT deficiency leads to toxic galactose metabolite accumulation. Galactose-restricted diet is standard management.',
    trending: false,
  },
  {
    biomarker: 'DMD (dystrophin gene) mutation',
    indications: ['Duchenne muscular dystrophy', 'DMD', 'Becker muscular dystrophy'],
    prevalence_pct: 100,
    testing_rate_pct: 85,
    test_type: 'MLPA / NGS',
    cdx_drugs: ['eteplirsen', 'golodirsen', 'viltolarsen', 'casimersen', 'delandistrogene moxeparvovec'],
    clinical_significance:
      'Exon deletion pattern determines eligibility for exon-skipping ASOs (exons 51, 53, 45). Gene therapy (delandistrogene) produces micro-dystrophin.',
    trending: true,
  },
  {
    biomarker: 'CFTR mutation (F508del and others)',
    indications: ['cystic fibrosis', 'CF'],
    prevalence_pct: 100,
    testing_rate_pct: 98,
    test_type: 'NGS / genotyping panel',
    cdx_drugs: ['elexacaftor/tezacaftor/ivacaftor', 'ivacaftor', 'lumacaftor/ivacaftor', 'tezacaftor/ivacaftor'],
    clinical_significance:
      'CFTR modulator eligibility depends on genotype. Elexacaftor/tezacaftor/ivacaftor covers ~90% of CF patients (at least one F508del). Transformed CF outcomes.',
    trending: false,
  },
  {
    biomarker: 'TTR gene mutation (hereditary ATTR)',
    indications: [
      'hereditary transthyretin amyloidosis',
      'hATTR',
      'familial amyloid polyneuropathy',
      'familial amyloid cardiomyopathy',
    ],
    prevalence_pct: 100,
    testing_rate_pct: 60,
    test_type: 'NGS',
    cdx_drugs: ['patisiran', 'vutrisiran', 'inotersen', 'eplontersen', 'tafamidis'],
    clinical_significance:
      'Over 130 TTR variants known; V30M and V122I most common. RNA interference (patisiran, vutrisiran) and ASOs dramatically slow polyneuropathy progression.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // INFECTIOUS DISEASE
  // ---------------------------------------------------------------------------
  {
    biomarker: 'HIV-1 viral load (RNA copies/mL)',
    indications: ['HIV/AIDS', 'HIV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 95,
    test_type: 'RT-PCR',
    cdx_drugs: ['bictegravir/emtricitabine/TAF', 'dolutegravir', 'cabotegravir/rilpivirine', 'lenacapavir'],
    clinical_significance:
      'Treatment goal is sustained viral suppression (<50 copies/mL). Undetectable = untransmittable (U=U). Lenacapavir enables twice-yearly dosing.',
    trending: false,
  },
  {
    biomarker: 'HIV-1 drug resistance genotype',
    indications: ['HIV/AIDS', 'HIV infection'],
    prevalence_pct: 15,
    testing_rate_pct: 85,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Transmitted drug resistance in ~15% of new diagnoses. Genotyping before treatment initiation and at virologic failure guides regimen selection.',
    trending: false,
  },
  {
    biomarker: 'CD4+ T-cell count',
    indications: ['HIV/AIDS', 'HIV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 95,
    test_type: 'flow cytometry',
    cdx_drugs: [],
    clinical_significance:
      'Marker of immune function. CD4 < 200 cells/uL defines AIDS. Opportunistic infection prophylaxis thresholds: PJP <200, MAC <50. Recovery with ART.',
    trending: false,
  },
  {
    biomarker: 'HCV genotype',
    indications: ['hepatitis C', 'HCV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 90,
    test_type: 'RT-PCR / sequencing',
    cdx_drugs: ['sofosbuvir/velpatasvir', 'glecaprevir/pibrentasvir', 'sofosbuvir/ledipasvir'],
    clinical_significance:
      'GT1 most common globally (~46%). Pan-genotypic DAA regimens (SOF/VEL, G/P) now preferred, reducing need for pre-treatment genotyping.',
    trending: false,
  },
  {
    biomarker: 'HCV RNA viral load',
    indications: ['hepatitis C', 'HCV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 92,
    test_type: 'RT-PCR',
    cdx_drugs: [],
    clinical_significance:
      'Confirms active infection (vs resolved). SVR12 (undetectable RNA 12 weeks post-treatment) defines cure. DAAs achieve SVR > 95% across genotypes.',
    trending: false,
  },
  {
    biomarker: 'HBV surface antigen (HBsAg)',
    indications: ['hepatitis B', 'HBV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 88,
    test_type: 'immunoassay',
    cdx_drugs: ['entecavir', 'tenofovir', 'tenofovir alafenamide'],
    clinical_significance:
      'HBsAg positivity > 6 months defines chronic HBV. Functional cure (HBsAg loss) is the therapeutic goal. Novel approaches (siRNA, capsid inhibitors) target this endpoint.',
    trending: true,
  },
  {
    biomarker: 'HBV DNA viral load',
    indications: ['hepatitis B', 'HBV infection'],
    prevalence_pct: 100,
    testing_rate_pct: 85,
    test_type: 'RT-PCR',
    cdx_drugs: ['entecavir', 'tenofovir'],
    clinical_significance:
      'Guides treatment initiation (>2000 IU/mL with ALT elevation). Virologic suppression reduces cirrhosis and HCC risk. Monitored every 3-6 months on therapy.',
    trending: false,
  },
  {
    biomarker: 'HBV cccDNA / HBV RNA (serum)',
    indications: ['hepatitis B', 'HBV infection'],
    prevalence_pct: 95,
    testing_rate_pct: 5,
    test_type: 'RT-PCR',
    cdx_drugs: [],
    clinical_significance:
      'Emerging biomarkers reflecting intrahepatic viral reservoir activity. Serum HBV RNA indicates transcriptionally active cccDNA. Key endpoints for functional cure trials.',
    trending: true,
  },

  // ---------------------------------------------------------------------------
  // ADDITIONAL ONCOLOGY (ensuring 150+ total entries)
  // ---------------------------------------------------------------------------
  {
    biomarker: 'BRCA1/2 mutation (germline)',
    indications: ['triple-negative breast cancer', 'TNBC'],
    prevalence_pct: 15,
    testing_rate_pct: 75,
    test_type: 'NGS',
    cdx_drugs: ['olaparib', 'talazoparib'],
    clinical_significance:
      'BRCA mutations enriched in TNBC vs other breast cancer subtypes. PARP inhibitors and platinum chemo show enhanced activity.',
    trending: false,
  },
  {
    biomarker: 'PALB2 mutation',
    indications: ['breast cancer', 'pancreatic cancer'],
    prevalence_pct: 1,
    testing_rate_pct: 60,
    test_type: 'NGS',
    cdx_drugs: ['olaparib'],
    clinical_significance:
      'Moderate penetrance breast cancer susceptibility gene. PALB2-mutant tumors may respond to PARP inhibitors and platinum chemotherapy.',
    trending: true,
  },
  {
    biomarker: 'ATM mutation',
    indications: ['prostate cancer', 'CRPC', 'breast cancer'],
    prevalence_pct: 5,
    testing_rate_pct: 55,
    test_type: 'NGS',
    cdx_drugs: ['olaparib'],
    clinical_significance:
      'HRR gene included in PARP inhibitor companion diagnostics. ATM loss associated with DNA damage repair deficiency; clinical benefit from PARP inhibitors varies.',
    trending: false,
  },
  {
    biomarker: 'CDK12 mutation',
    indications: ['prostate cancer', 'CRPC'],
    prevalence_pct: 5,
    testing_rate_pct: 50,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'CDK12-mutant prostate cancers exhibit tandem duplications and neoantigen burden. May respond to immunotherapy; included in some HRR panels.',
    trending: true,
  },
  {
    biomarker: 'ARID1A mutation',
    indications: ['ovarian clear cell carcinoma', 'gastric cancer', 'endometrial cancer'],
    prevalence_pct: 30,
    testing_rate_pct: 40,
    test_type: 'NGS',
    cdx_drugs: [],
    clinical_significance:
      'Common SWI/SNF complex alteration. Loss of ARID1A may create synthetic lethality with EZH2 inhibitors, ATR inhibitors. Clinical validation ongoing.',
    trending: true,
  },
  {
    biomarker: 'VEGF / VEGFR expression',
    indications: ['renal cell carcinoma', 'RCC', 'hepatocellular carcinoma', 'HCC'],
    prevalence_pct: 70,
    testing_rate_pct: 20,
    test_type: 'IHC',
    cdx_drugs: ['bevacizumab', 'ramucirumab', 'sunitinib', 'pazopanib', 'cabozantinib', 'axitinib', 'lenvatinib'],
    clinical_significance:
      'VEGF pathway drives angiogenesis in RCC and HCC. Anti-VEGF/TKI therapy is standard but VEGF expression is not used as a predictive biomarker in practice.',
    trending: false,
  },
  {
    biomarker: 'AFP (alpha-fetoprotein)',
    indications: ['hepatocellular carcinoma', 'HCC', 'germ cell tumors'],
    prevalence_pct: 60,
    testing_rate_pct: 85,
    test_type: 'immunoassay',
    cdx_drugs: [],
    clinical_significance:
      'AFP > 400 ng/mL highly suggestive of HCC. Used for surveillance in cirrhosis (with ultrasound). AFP level is a prognostic factor in HCC staging systems.',
    trending: false,
  },
  {
    biomarker: 'PSA (prostate-specific antigen)',
    indications: ['prostate cancer'],
    prevalence_pct: 85,
    testing_rate_pct: 90,
    test_type: 'immunoassay',
    cdx_drugs: [],
    clinical_significance:
      'PSA > 4 ng/mL warrants evaluation; PSA kinetics guide treatment decisions. PSA density, velocity, and free/total ratio improve specificity. Screening remains debated.',
    trending: false,
  },
  {
    biomarker: 'PSMA (prostate-specific membrane antigen) expression',
    indications: ['prostate cancer', 'CRPC'],
    prevalence_pct: 85,
    testing_rate_pct: 40,
    test_type: 'PET',
    cdx_drugs: ['177Lu-PSMA-617 (lutetium Lu-177 vipivotide tetraxetan)'],
    clinical_significance:
      'PSMA PET superior to conventional imaging for staging. 177Lu-PSMA-617 (Pluvicto) improved OS in PSMA-positive mCRPC; PSMA PET required for eligibility.',
    trending: true,
  },
  {
    biomarker: 'AR-V7 (androgen receptor splice variant 7)',
    indications: ['prostate cancer', 'CRPC'],
    prevalence_pct: 20,
    testing_rate_pct: 15,
    test_type: 'liquid biopsy',
    cdx_drugs: [],
    clinical_significance:
      'AR-V7 in circulating tumor cells predicts resistance to abiraterone and enzalutamide but retained sensitivity to taxane chemotherapy.',
    trending: false,
  },
  {
    biomarker: 'Nectin-4 expression',
    indications: ['urothelial carcinoma', 'bladder cancer'],
    prevalence_pct: 60,
    testing_rate_pct: 15,
    test_type: 'IHC',
    cdx_drugs: ['enfortumab vedotin'],
    clinical_significance:
      'Nectin-4 is the target for enfortumab vedotin (ADC). Broadly expressed in urothelial cancer; no companion diagnostic required for prescribing.',
    trending: false,
  },
  {
    biomarker: 'FRalpha (folate receptor alpha) expression',
    indications: ['ovarian cancer', 'NSCLC'],
    prevalence_pct: 75,
    testing_rate_pct: 30,
    test_type: 'IHC',
    cdx_drugs: ['mirvetuximab soravtansine'],
    clinical_significance:
      'FRalpha expression in ovarian cancer predicts mirvetuximab soravtansine benefit. PS2+ staining (>= 75% of cells with moderate-high intensity) required.',
    trending: true,
  },
  {
    biomarker: 'DPYD variant (DPD deficiency)',
    indications: ['colorectal cancer', 'CRC', 'breast cancer', 'gastric cancer'],
    prevalence_pct: 5,
    testing_rate_pct: 40,
    test_type: 'genotyping',
    cdx_drugs: [],
    clinical_significance:
      'DPD deficiency increases risk of severe/fatal fluoropyrimidine toxicity. EMA recommends pre-treatment testing. Four key DPYD variants account for most deficiency.',
    trending: true,
  },
  {
    biomarker: 'UGT1A1*28 polymorphism',
    indications: ['colorectal cancer', 'CRC'],
    prevalence_pct: 10,
    testing_rate_pct: 30,
    test_type: 'genotyping',
    cdx_drugs: [],
    clinical_significance:
      'UGT1A1*28 homozygosity increases irinotecan toxicity risk (neutropenia, diarrhea). Dose reduction recommended for homozygous carriers.',
    trending: false,
  },
  {
    biomarker: 'EBV-positive (EBER ISH)',
    indications: ['nasopharyngeal carcinoma', 'NPC', 'gastric cancer', 'Hodgkin lymphoma'],
    prevalence_pct: 95,
    testing_rate_pct: 85,
    test_type: 'ISH',
    cdx_drugs: [],
    clinical_significance:
      'EBV association near-universal in NPC and ~8% in gastric cancer. EBV+ gastric cancers are MSS but have high PD-L1 and respond to immunotherapy.',
    trending: false,
  },
  {
    biomarker: 'EBV DNA (plasma, NPC-specific)',
    indications: ['nasopharyngeal carcinoma', 'NPC'],
    prevalence_pct: 90,
    testing_rate_pct: 75,
    test_type: 'RT-PCR',
    cdx_drugs: [],
    clinical_significance:
      'Plasma EBV DNA is a screening, prognostic, and treatment-monitoring biomarker in NPC. Post-treatment EBV DNA clearance correlates with PFS.',
    trending: false,
  },
  {
    biomarker: 'HPV status (p16 IHC)',
    indications: ['oropharyngeal cancer', 'head and neck cancer', 'cervical cancer'],
    prevalence_pct: 70,
    testing_rate_pct: 90,
    test_type: 'IHC',
    cdx_drugs: [],
    clinical_significance:
      'HPV-positive oropharyngeal cancer has dramatically better prognosis (5y OS ~80% vs ~50%). Determines TNM staging category. De-escalation trials ongoing.',
    trending: false,
  },
  {
    biomarker: 'MGMT promoter methylation',
    indications: ['glioblastoma', 'GBM'],
    prevalence_pct: 40,
    testing_rate_pct: 85,
    test_type: 'MSP / pyrosequencing',
    cdx_drugs: ['temozolomide'],
    clinical_significance:
      'MGMT methylation silences DNA repair enzyme, enhancing temozolomide sensitivity. Methylated GBM median OS ~21 months vs ~15 months for unmethylated.',
    trending: false,
  },
  {
    biomarker: '1p/19q co-deletion',
    indications: ['oligodendroglioma', 'low-grade glioma'],
    prevalence_pct: 70,
    testing_rate_pct: 90,
    test_type: 'FISH',
    cdx_drugs: [],
    clinical_significance:
      'Pathognomonic for oligodendroglioma (WHO 2021 classification). Predicts chemo-sensitivity to PCV and temozolomide. Associated with longer survival.',
    trending: false,
  },
  {
    biomarker: 'MYC / MYCN amplification',
    indications: ['neuroblastoma', 'DLBCL', 'medulloblastoma', 'small cell lung cancer'],
    prevalence_pct: 25,
    testing_rate_pct: 80,
    test_type: 'FISH',
    cdx_drugs: [],
    clinical_significance:
      'MYCN amplification in neuroblastoma defines high-risk disease (~20% of cases). MYC rearrangement in DLBCL (double-hit lymphoma) requires intensified therapy.',
    trending: false,
  },
  {
    biomarker: 'Philadelphia-like (Ph-like) ALL gene expression',
    indications: ['ALL', 'acute lymphoblastic leukemia'],
    prevalence_pct: 15,
    testing_rate_pct: 40,
    test_type: 'gene expression assay / NGS',
    cdx_drugs: ['dasatinib', 'ruxolitinib'],
    clinical_significance:
      'High-risk B-ALL subtype with kinase-activating alterations. ABL-class fusions respond to dasatinib; JAK-STAT fusions may respond to ruxolitinib.',
    trending: true,
  },
  {
    biomarker: 'Minimal residual disease (MRD) - hematologic malignancies',
    indications: ['ALL', 'CLL', 'multiple myeloma', 'AML'],
    prevalence_pct: 30,
    testing_rate_pct: 70,
    test_type: 'flow cytometry / NGS',
    cdx_drugs: [],
    clinical_significance:
      'MRD negativity (< 10^-4 to 10^-6) is the strongest prognostic factor across hematologic malignancies. Increasingly used as a surrogate endpoint in clinical trials.',
    trending: true,
  },
  {
    biomarker: 'TP53 mutation / del(17p)',
    indications: ['CLL', 'chronic lymphocytic leukemia'],
    prevalence_pct: 10,
    testing_rate_pct: 88,
    test_type: 'NGS / FISH',
    cdx_drugs: ['venetoclax', 'ibrutinib', 'acalabrutinib', 'zanubrutinib'],
    clinical_significance:
      'Defines high-risk CLL resistant to chemoimmunotherapy. BTK inhibitors and BCL-2 inhibitors overcome poor prognosis of TP53-disrupted CLL.',
    trending: false,
  },
  {
    biomarker: 'IGHV mutation status',
    indications: ['CLL', 'chronic lymphocytic leukemia'],
    prevalence_pct: 60,
    testing_rate_pct: 75,
    test_type: 'Sanger sequencing',
    cdx_drugs: [],
    clinical_significance:
      'Unmutated IGHV (~40% of CLL) indicates more aggressive disease course. Prognostic but less relevant in era of targeted therapy (BTKi, venetoclax).',
    trending: false,
  },
  {
    biomarker: 'EZH2 mutation',
    indications: ['follicular lymphoma', 'DLBCL'],
    prevalence_pct: 22,
    testing_rate_pct: 50,
    test_type: 'NGS',
    cdx_drugs: ['tazemetostat'],
    clinical_significance:
      'Gain-of-function EZH2 mutations in follicular lymphoma. Tazemetostat (EZH2 inhibitor) approved for EZH2-mutant relapsed/refractory FL.',
    trending: false,
  },
  {
    biomarker: 'HER2 overexpression',
    indications: ['endometrial cancer', 'biliary tract cancer'],
    prevalence_pct: 10,
    testing_rate_pct: 40,
    test_type: 'IHC',
    cdx_drugs: ['trastuzumab deruxtecan'],
    clinical_significance:
      'Emerging target beyond traditional indications. T-DXd and other HER2-directed therapies being evaluated in HER2-expressing endometrial and biliary cancers.',
    trending: true,
  },
];

export function getBiomarkersForIndication(indication: string): BiomarkerEntry[] {
  const query = indication.toLowerCase();
  return BIOMARKER_PREVALENCE.filter((entry) => entry.indications.some((ind) => ind.toLowerCase().includes(query)));
}

export function getBiomarkerByName(name: string): BiomarkerEntry | undefined {
  const query = name.toLowerCase();
  return BIOMARKER_PREVALENCE.find((entry) => entry.biomarker.toLowerCase().includes(query));
}
