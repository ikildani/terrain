import type { PricingBenchmark } from '@/types';

export const PRICING_BENCHMARKS: PricingBenchmark[] = [
  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Checkpoint Inhibitors (PD-1/PD-L1)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Keytruda', company: 'Merck', indication: 'NSCLC', therapy_area: 'oncology', mechanism_class: 'PD-1 inhibitor', launch_year: 2014, us_launch_wac_annual: 150000, current_list_price: 191000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Opdivo', company: 'Bristol-Myers Squibb', indication: 'NSCLC', therapy_area: 'oncology', mechanism_class: 'PD-1 inhibitor', launch_year: 2014, us_launch_wac_annual: 143000, current_list_price: 170000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Tecentriq', company: 'Roche/Genentech', indication: 'Urothelial Carcinoma', therapy_area: 'oncology', mechanism_class: 'PD-L1 inhibitor', launch_year: 2016, us_launch_wac_annual: 146000, current_list_price: 187000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Bavencio', company: 'Pfizer/Merck KGaA', indication: 'Merkel Cell Carcinoma', therapy_area: 'oncology', mechanism_class: 'PD-L1 inhibitor', launch_year: 2017, us_launch_wac_annual: 156000, current_list_price: 186000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Libtayo', company: 'Regeneron/Sanofi', indication: 'Cutaneous Squamous Cell Carcinoma', therapy_area: 'oncology', mechanism_class: 'PD-1 inhibitor', launch_year: 2018, us_launch_wac_annual: 157000, current_list_price: 193000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Imfinzi', company: 'AstraZeneca', indication: 'NSCLC (Stage III)', therapy_area: 'oncology', mechanism_class: 'PD-L1 inhibitor', launch_year: 2017, us_launch_wac_annual: 180000, current_list_price: 198000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Opdualag', company: 'Bristol-Myers Squibb', indication: 'Melanoma', therapy_area: 'oncology', mechanism_class: 'PD-1/LAG-3 inhibitor', launch_year: 2022, us_launch_wac_annual: 218000, current_list_price: 236000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — CTLA-4 Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Yervoy', company: 'Bristol-Myers Squibb', indication: 'Melanoma', therapy_area: 'oncology', mechanism_class: 'CTLA-4 inhibitor', launch_year: 2011, us_launch_wac_annual: 120000, current_list_price: 190000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Antibody-Drug Conjugates (ADCs)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Enhertu', company: 'Daiichi Sankyo/AstraZeneca', indication: 'HER2+ Breast Cancer', therapy_area: 'oncology', mechanism_class: 'ADC (HER2)', launch_year: 2019, us_launch_wac_annual: 170000, current_list_price: 213000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Padcev', company: 'Astellas/Seagen', indication: 'Urothelial Carcinoma', therapy_area: 'oncology', mechanism_class: 'ADC (Nectin-4)', launch_year: 2019, us_launch_wac_annual: 182000, current_list_price: 228000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Trodelvy', company: 'Gilead', indication: 'Triple Negative Breast Cancer', therapy_area: 'oncology', mechanism_class: 'ADC (Trop-2)', launch_year: 2020, us_launch_wac_annual: 180000, current_list_price: 210000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Adcetris', company: 'Seagen', indication: 'Hodgkin Lymphoma', therapy_area: 'oncology', mechanism_class: 'ADC (CD30)', launch_year: 2011, us_launch_wac_annual: 112000, current_list_price: 215000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Polivy', company: 'Roche/Genentech', indication: 'Diffuse Large B-Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'ADC (CD79b)', launch_year: 2019, us_launch_wac_annual: 162000, current_list_price: 198000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Kadcyla', company: 'Roche/Genentech', indication: 'HER2+ Breast Cancer', therapy_area: 'oncology', mechanism_class: 'ADC (HER2)', launch_year: 2013, us_launch_wac_annual: 94000, current_list_price: 172000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Elahere', company: 'ImmunoGen', indication: 'Ovarian Cancer (FRa+)', therapy_area: 'oncology', mechanism_class: 'ADC (FRa)', launch_year: 2022, us_launch_wac_annual: 185000, current_list_price: 195000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Anti-CD38 / Myeloma Antibodies
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Darzalex', company: 'Johnson & Johnson', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'Anti-CD38 mAb', launch_year: 2015, us_launch_wac_annual: 132000, current_list_price: 178000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Sarclisa', company: 'Sanofi', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'Anti-CD38 mAb', launch_year: 2020, us_launch_wac_annual: 170000, current_list_price: 185000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Bispecific Antibodies
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Elrexfio', company: 'Pfizer', indication: 'Multiple Myeloma (BCMA-targeted)', therapy_area: 'oncology', mechanism_class: 'Bispecific (BCMAxCD3)', launch_year: 2023, us_launch_wac_annual: 380000, current_list_price: 380000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Talvey', company: 'Johnson & Johnson', indication: 'Multiple Myeloma (GPRC5D-targeted)', therapy_area: 'oncology', mechanism_class: 'Bispecific (GPRC5DxCD3)', launch_year: 2023, us_launch_wac_annual: 386000, current_list_price: 386000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Tecvayli', company: 'Johnson & Johnson', indication: 'Multiple Myeloma (BCMA-targeted)', therapy_area: 'oncology', mechanism_class: 'Bispecific (BCMAxCD3)', launch_year: 2022, us_launch_wac_annual: 395000, current_list_price: 395000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Epkinly', company: 'AbbVie/Genmab', indication: 'Diffuse Large B-Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'Bispecific (CD20xCD3)', launch_year: 2023, us_launch_wac_annual: 342000, current_list_price: 342000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Lunsumio', company: 'Roche/Genentech', indication: 'Follicular Lymphoma', therapy_area: 'oncology', mechanism_class: 'Bispecific (CD20xCD3)', launch_year: 2022, us_launch_wac_annual: 325000, current_list_price: 335000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Columvi', company: 'Roche/Genentech', indication: 'Diffuse Large B-Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'Bispecific (CD20xCD3)', launch_year: 2023, us_launch_wac_annual: 350000, current_list_price: 350000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Anti-CD19 / Lymphoma mAbs
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Monjuvi', company: 'MorphoSys/Incyte', indication: 'Diffuse Large B-Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'Anti-CD19 mAb', launch_year: 2020, us_launch_wac_annual: 184000, current_list_price: 200000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — KRAS Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Lumakras', company: 'Amgen', indication: 'NSCLC (KRAS G12C)', therapy_area: 'oncology', mechanism_class: 'KRAS G12C inhibitor', launch_year: 2021, us_launch_wac_annual: 178000, current_list_price: 189000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Krazati', company: 'Mirati/BMS', indication: 'NSCLC (KRAS G12C)', therapy_area: 'oncology', mechanism_class: 'KRAS G12C inhibitor', launch_year: 2022, us_launch_wac_annual: 196000, current_list_price: 204000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — AR-Targeted (Prostate Cancer)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Xtandi', company: 'Pfizer/Astellas', indication: 'Metastatic Prostate Cancer', therapy_area: 'oncology', mechanism_class: 'Androgen receptor inhibitor', launch_year: 2012, us_launch_wac_annual: 88000, current_list_price: 189000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Zytiga', company: 'Johnson & Johnson', indication: 'Metastatic Prostate Cancer', therapy_area: 'oncology', mechanism_class: 'CYP17 inhibitor', launch_year: 2011, us_launch_wac_annual: 55000, current_list_price: 122000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Nubeqa', company: 'Bayer', indication: 'Non-Metastatic Castration-Resistant Prostate Cancer', therapy_area: 'oncology', mechanism_class: 'Androgen receptor inhibitor', launch_year: 2019, us_launch_wac_annual: 146000, current_list_price: 163000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Erleada', company: 'Johnson & Johnson', indication: 'Non-Metastatic Castration-Resistant Prostate Cancer', therapy_area: 'oncology', mechanism_class: 'Androgen receptor inhibitor', launch_year: 2018, us_launch_wac_annual: 131000, current_list_price: 168000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — PARP Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Lynparza', company: 'AstraZeneca/Merck', indication: 'Ovarian Cancer (BRCA-mutated)', therapy_area: 'oncology', mechanism_class: 'PARP inhibitor', launch_year: 2014, us_launch_wac_annual: 108000, current_list_price: 186000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Zejula', company: 'GSK', indication: 'Ovarian Cancer', therapy_area: 'oncology', mechanism_class: 'PARP inhibitor', launch_year: 2017, us_launch_wac_annual: 178000, current_list_price: 203000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Rubraca', company: 'Clovis Oncology', indication: 'Ovarian Cancer (BRCA-mutated)', therapy_area: 'oncology', mechanism_class: 'PARP inhibitor', launch_year: 2016, us_launch_wac_annual: 168000, current_list_price: 188000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — BTK Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Imbruvica', company: 'AbbVie/Johnson & Johnson', indication: 'Chronic Lymphocytic Leukemia', therapy_area: 'oncology', mechanism_class: 'BTK inhibitor', launch_year: 2013, us_launch_wac_annual: 116000, current_list_price: 195000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Calquence', company: 'AstraZeneca', indication: 'Chronic Lymphocytic Leukemia', therapy_area: 'oncology', mechanism_class: 'BTK inhibitor', launch_year: 2017, us_launch_wac_annual: 158000, current_list_price: 186000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Brukinsa', company: 'BeiGene', indication: 'Mantle Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'BTK inhibitor', launch_year: 2019, us_launch_wac_annual: 168000, current_list_price: 193000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — IMiDs / Myeloma Agents
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Revlimid', company: 'Bristol-Myers Squibb', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'IMiD (immunomodulatory)', launch_year: 2005, us_launch_wac_annual: 64000, current_list_price: 251000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Thalomid', company: 'Bristol-Myers Squibb', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'IMiD (immunomodulatory)', launch_year: 1998, us_launch_wac_annual: 6000, current_list_price: 95000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Pomalyst', company: 'Bristol-Myers Squibb', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'IMiD (immunomodulatory)', launch_year: 2013, us_launch_wac_annual: 126000, current_list_price: 220000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Proteasome Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Velcade', company: 'Takeda', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'Proteasome inhibitor', launch_year: 2003, us_launch_wac_annual: 36000, current_list_price: 92000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Kyprolis', company: 'Amgen', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'Proteasome inhibitor', launch_year: 2012, us_launch_wac_annual: 96000, current_list_price: 175000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — JAK Inhibitors (Myeloproliferative)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Jakafi', company: 'Incyte', indication: 'Myelofibrosis', therapy_area: 'oncology', mechanism_class: 'JAK1/JAK2 inhibitor', launch_year: 2011, us_launch_wac_annual: 96000, current_list_price: 198000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Inrebic', company: 'Bristol-Myers Squibb', indication: 'Myelofibrosis', therapy_area: 'oncology', mechanism_class: 'JAK2/FLT3 inhibitor', launch_year: 2019, us_launch_wac_annual: 181000, current_list_price: 196000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Vonjo', company: 'CTI BioPharma', indication: 'Myelofibrosis (with thrombocytopenia)', therapy_area: 'oncology', mechanism_class: 'JAK2/IRAK1 inhibitor', launch_year: 2022, us_launch_wac_annual: 253000, current_list_price: 262000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — KIT/PDGFRA Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ayvakit', company: 'Blueprint Medicines', indication: 'GIST (PDGFRA D842V)', therapy_area: 'oncology', mechanism_class: 'KIT/PDGFRA inhibitor', launch_year: 2020, us_launch_wac_annual: 275000, current_list_price: 310000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — RET Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Gavreto', company: 'Roche/Genentech', indication: 'NSCLC (RET fusion+)', therapy_area: 'oncology', mechanism_class: 'RET inhibitor', launch_year: 2020, us_launch_wac_annual: 210000, current_list_price: 231000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Retevmo', company: 'Eli Lilly', indication: 'NSCLC (RET fusion+)', therapy_area: 'oncology', mechanism_class: 'RET inhibitor', launch_year: 2020, us_launch_wac_annual: 208000, current_list_price: 228000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — MET Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Tabrecta', company: 'Novartis', indication: 'NSCLC (MET exon 14 skipping)', therapy_area: 'oncology', mechanism_class: 'MET inhibitor', launch_year: 2020, us_launch_wac_annual: 196000, current_list_price: 218000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Tepmetko', company: 'Merck KGaA/EMD Serono', indication: 'NSCLC (MET exon 14 skipping)', therapy_area: 'oncology', mechanism_class: 'MET inhibitor', launch_year: 2021, us_launch_wac_annual: 208000, current_list_price: 222000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — TRK Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Vitrakvi', company: 'Bayer', indication: 'NTRK Fusion-Positive Solid Tumors', therapy_area: 'oncology', mechanism_class: 'TRK inhibitor', launch_year: 2018, us_launch_wac_annual: 393000, current_list_price: 415000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Rozlytrek', company: 'Roche/Genentech', indication: 'NTRK Fusion-Positive Solid Tumors', therapy_area: 'oncology', mechanism_class: 'TRK/ROS1 inhibitor', launch_year: 2019, us_launch_wac_annual: 206000, current_list_price: 228000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — EGFR / HER2 TKIs
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Tagrisso', company: 'AstraZeneca', indication: 'NSCLC', therapy_area: 'oncology', mechanism_class: 'EGFR TKI', launch_year: 2015, us_launch_wac_annual: 150000, current_list_price: 198000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — Multi-Kinase / VEGFR TKIs
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Lenvima', company: 'Eisai', indication: 'Thyroid Cancer / HCC / RCC', therapy_area: 'oncology', mechanism_class: 'Multi-kinase inhibitor (VEGFR)', launch_year: 2015, us_launch_wac_annual: 143000, current_list_price: 205000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Cabometyx', company: 'Exelixis', indication: 'Renal Cell Carcinoma', therapy_area: 'oncology', mechanism_class: 'Multi-kinase inhibitor (MET/VEGFR/AXL)', launch_year: 2016, us_launch_wac_annual: 168000, current_list_price: 229000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Sutent', company: 'Pfizer', indication: 'Renal Cell Carcinoma / GIST', therapy_area: 'oncology', mechanism_class: 'Multi-kinase inhibitor (VEGFR/PDGFR)', launch_year: 2006, us_launch_wac_annual: 48000, current_list_price: 193000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Nexavar', company: 'Bayer', indication: 'Hepatocellular Carcinoma / RCC', therapy_area: 'oncology', mechanism_class: 'Multi-kinase inhibitor (RAF/VEGFR)', launch_year: 2005, us_launch_wac_annual: 42000, current_list_price: 172000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Inlyta', company: 'Pfizer', indication: 'Renal Cell Carcinoma', therapy_area: 'oncology', mechanism_class: 'VEGFR inhibitor', launch_year: 2012, us_launch_wac_annual: 90000, current_list_price: 188000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — BRAF / MEK Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Braftovi', company: 'Pfizer', indication: 'Melanoma (BRAF V600E/K)', therapy_area: 'oncology', mechanism_class: 'BRAF inhibitor', launch_year: 2018, us_launch_wac_annual: 162000, current_list_price: 182000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Tafinlar', company: 'Novartis', indication: 'Melanoma (BRAF V600E/K)', therapy_area: 'oncology', mechanism_class: 'BRAF inhibitor', launch_year: 2013, us_launch_wac_annual: 96000, current_list_price: 174000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Mekinist', company: 'Novartis', indication: 'Melanoma (BRAF V600E/K)', therapy_area: 'oncology', mechanism_class: 'MEK inhibitor', launch_year: 2013, us_launch_wac_annual: 103000, current_list_price: 179000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Zelboraf', company: 'Roche/Genentech', indication: 'Melanoma (BRAF V600E)', therapy_area: 'oncology', mechanism_class: 'BRAF inhibitor', launch_year: 2011, us_launch_wac_annual: 56000, current_list_price: 145000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Cotellic', company: 'Roche/Genentech', indication: 'Melanoma (BRAF V600)', therapy_area: 'oncology', mechanism_class: 'MEK inhibitor', launch_year: 2015, us_launch_wac_annual: 91000, current_list_price: 153000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — BCL-2 Inhibitor
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Venclexta', company: 'AbbVie', indication: 'AML', therapy_area: 'oncology', mechanism_class: 'BCL-2 inhibitor', launch_year: 2016, us_launch_wac_annual: 120000, current_list_price: 145000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — CAR-T Cell Therapies
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Kymriah', company: 'Novartis', indication: 'B-ALL / DLBCL', therapy_area: 'oncology', mechanism_class: 'CAR-T (CD19)', launch_year: 2017, us_launch_wac_annual: 475000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Yescarta', company: 'Gilead/Kite', indication: 'DLBCL', therapy_area: 'oncology', mechanism_class: 'CAR-T (CD19)', launch_year: 2017, us_launch_wac_annual: 373000, current_list_price: 424000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Tecartus', company: 'Gilead/Kite', indication: 'Mantle Cell Lymphoma', therapy_area: 'oncology', mechanism_class: 'CAR-T (CD19)', launch_year: 2020, us_launch_wac_annual: 373000, current_list_price: 424000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Breyanzi', company: 'Bristol-Myers Squibb', indication: 'DLBCL', therapy_area: 'oncology', mechanism_class: 'CAR-T (CD19)', launch_year: 2021, us_launch_wac_annual: 410000, current_list_price: 435000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Abecma', company: 'Bristol-Myers Squibb/2seventy bio', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'CAR-T (BCMA)', launch_year: 2021, us_launch_wac_annual: 419000, current_list_price: 465000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Carvykti', company: 'Johnson & Johnson/Legend', indication: 'Multiple Myeloma', therapy_area: 'oncology', mechanism_class: 'CAR-T (BCMA)', launch_year: 2022, us_launch_wac_annual: 465000, current_list_price: 465000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // ONCOLOGY — CDK4/6 Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ibrance', company: 'Pfizer', indication: 'HR+ Breast Cancer', therapy_area: 'oncology', mechanism_class: 'CDK4/6 inhibitor', launch_year: 2015, us_launch_wac_annual: 118000, current_list_price: 178000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Kisqali', company: 'Novartis', indication: 'HR+ Breast Cancer', therapy_area: 'oncology', mechanism_class: 'CDK4/6 inhibitor', launch_year: 2017, us_launch_wac_annual: 138000, current_list_price: 183000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Verzenio', company: 'Eli Lilly', indication: 'HR+ Breast Cancer', therapy_area: 'oncology', mechanism_class: 'CDK4/6 inhibitor', launch_year: 2017, us_launch_wac_annual: 131000, current_list_price: 176000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — Alzheimer's Disease
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Leqembi', company: 'Eisai/Biogen', indication: "Alzheimer's Disease", therapy_area: 'neurology', mechanism_class: 'Anti-amyloid mAb', launch_year: 2023, us_launch_wac_annual: 26500, current_list_price: 26500, orphan_drug: false, first_in_class: false },
  { drug_name: 'Kisunla', company: 'Eli Lilly', indication: "Alzheimer's Disease", therapy_area: 'neurology', mechanism_class: 'Anti-amyloid mAb (N3pG)', launch_year: 2024, us_launch_wac_annual: 32000, current_list_price: 32000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Aduhelm', company: 'Biogen', indication: "Alzheimer's Disease", therapy_area: 'neurology', mechanism_class: 'Anti-amyloid mAb', launch_year: 2021, us_launch_wac_annual: 28200, current_list_price: 28200, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — Multiple Sclerosis
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ocrevus', company: 'Roche', indication: 'Multiple Sclerosis', therapy_area: 'neurology', mechanism_class: 'Anti-CD20 mAb', launch_year: 2017, us_launch_wac_annual: 65000, current_list_price: 75000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Kesimpta', company: 'Novartis', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'Anti-CD20 mAb (subQ)', launch_year: 2020, us_launch_wac_annual: 68000, current_list_price: 77000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Briumvi', company: 'TG Therapeutics', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'Anti-CD20 mAb', launch_year: 2022, us_launch_wac_annual: 56000, current_list_price: 59000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Mayzent', company: 'Novartis', indication: 'Multiple Sclerosis (SPMS)', therapy_area: 'neurology', mechanism_class: 'S1P receptor modulator', launch_year: 2019, us_launch_wac_annual: 88000, current_list_price: 103000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Ponvory', company: 'Johnson & Johnson', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'S1P receptor modulator', launch_year: 2021, us_launch_wac_annual: 87000, current_list_price: 93000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Zeposia', company: 'Bristol-Myers Squibb', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'S1P receptor modulator', launch_year: 2020, us_launch_wac_annual: 78000, current_list_price: 92000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Gilenya', company: 'Novartis', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'S1P receptor modulator', launch_year: 2010, us_launch_wac_annual: 48000, current_list_price: 105000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Tecfidera', company: 'Biogen', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'Fumarate (Nrf2 activator)', launch_year: 2013, us_launch_wac_annual: 55000, current_list_price: 101000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Tysabri', company: 'Biogen', indication: 'Multiple Sclerosis (RMS)', therapy_area: 'neurology', mechanism_class: 'Anti-VLA4 mAb (a4-integrin)', launch_year: 2004, us_launch_wac_annual: 32000, current_list_price: 95000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — SMA
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Spinraza', company: 'Biogen', indication: 'Spinal Muscular Atrophy', therapy_area: 'neurology', mechanism_class: 'ASO (SMN2 splicing modifier)', launch_year: 2016, us_launch_wac_annual: 750000, current_list_price: 375000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Evrysdi', company: 'Roche', indication: 'Spinal Muscular Atrophy', therapy_area: 'neurology', mechanism_class: 'SMN2 splicing modifier (oral)', launch_year: 2020, us_launch_wac_annual: 100000, current_list_price: 100000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — Migraine (CGRP)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ajovy', company: 'Teva', indication: 'Migraine Prevention', therapy_area: 'neurology', mechanism_class: 'Anti-CGRP mAb', launch_year: 2018, us_launch_wac_annual: 6900, current_list_price: 7700, orphan_drug: false, first_in_class: false },
  { drug_name: 'Aimovig', company: 'Amgen/Novartis', indication: 'Migraine Prevention', therapy_area: 'neurology', mechanism_class: 'Anti-CGRP receptor mAb', launch_year: 2018, us_launch_wac_annual: 6900, current_list_price: 7700, orphan_drug: false, first_in_class: true },
  { drug_name: 'Emgality', company: 'Eli Lilly', indication: 'Migraine Prevention', therapy_area: 'neurology', mechanism_class: 'Anti-CGRP mAb', launch_year: 2018, us_launch_wac_annual: 6900, current_list_price: 7700, orphan_drug: false, first_in_class: false },
  { drug_name: 'Reyvow', company: 'Eli Lilly', indication: 'Acute Migraine', therapy_area: 'neurology', mechanism_class: '5-HT1F agonist (ditan)', launch_year: 2019, us_launch_wac_annual: 8800, current_list_price: 9700, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — Movement Disorders
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ingrezza', company: 'Neurocrine Biosciences', indication: 'Tardive Dyskinesia', therapy_area: 'neurology', mechanism_class: 'VMAT2 inhibitor', launch_year: 2017, us_launch_wac_annual: 78000, current_list_price: 103000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Austedo', company: 'Teva', indication: 'Tardive Dyskinesia / Huntington Chorea', therapy_area: 'neurology', mechanism_class: 'VMAT2 inhibitor', launch_year: 2017, us_launch_wac_annual: 66000, current_list_price: 96000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // NEUROLOGY — ALS
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Qalsody', company: 'Biogen', indication: 'ALS (SOD1-mutated)', therapy_area: 'neurology', mechanism_class: 'ASO (SOD1-targeting)', launch_year: 2023, us_launch_wac_annual: 180000, current_list_price: 180000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Riluzole', company: 'Various (generic)', indication: 'Amyotrophic Lateral Sclerosis', therapy_area: 'neurology', mechanism_class: 'Glutamate release inhibitor', launch_year: 1995, us_launch_wac_annual: 6000, current_list_price: 1800, orphan_drug: true, first_in_class: true },
  { drug_name: 'Radicava', company: 'Mitsubishi Tanabe', indication: 'Amyotrophic Lateral Sclerosis', therapy_area: 'neurology', mechanism_class: 'Free radical scavenger', launch_year: 2017, us_launch_wac_annual: 146000, current_list_price: 171000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Gene Therapies
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Zolgensma', company: 'Novartis', indication: 'Spinal Muscular Atrophy', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (AAV9)', launch_year: 2019, us_launch_wac_annual: 2125000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Elevidys', company: 'Sarepta', indication: 'Duchenne Muscular Dystrophy', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (AAVrh74)', launch_year: 2023, us_launch_wac_annual: 3200000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Luxturna', company: 'Spark Therapeutics/Roche', indication: 'RPE65 Inherited Retinal Dystrophy', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (AAV2)', launch_year: 2017, us_launch_wac_annual: 850000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Hemgenix', company: 'CSL Behring', indication: 'Hemophilia B', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (AAV5)', launch_year: 2022, us_launch_wac_annual: 3500000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Roctavian', company: 'BioMarin', indication: 'Hemophilia A', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (AAV5)', launch_year: 2023, us_launch_wac_annual: 2900000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Skysona', company: 'bluebird bio', indication: 'Cerebral Adrenoleukodystrophy', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (lentiviral)', launch_year: 2022, us_launch_wac_annual: 3000000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Zynteglo', company: 'bluebird bio', indication: 'Beta-Thalassemia', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (lentiviral)', launch_year: 2022, us_launch_wac_annual: 2800000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Casgevy', company: 'Vertex/CRISPR Therapeutics', indication: 'Sickle Cell Disease / Beta-Thalassemia', therapy_area: 'rare_disease', mechanism_class: 'Gene editing (CRISPR-Cas9)', launch_year: 2023, us_launch_wac_annual: 2200000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Lyfgenia', company: 'bluebird bio', indication: 'Sickle Cell Disease', therapy_area: 'rare_disease', mechanism_class: 'Gene therapy (lentiviral)', launch_year: 2023, us_launch_wac_annual: 3100000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Cystic Fibrosis
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Trikafta', company: 'Vertex', indication: 'Cystic Fibrosis', therapy_area: 'rare_disease', mechanism_class: 'CFTR modulator', launch_year: 2019, us_launch_wac_annual: 311000, current_list_price: 327000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Orkambi', company: 'Vertex', indication: 'Cystic Fibrosis (F508del homozygous)', therapy_area: 'rare_disease', mechanism_class: 'CFTR modulator', launch_year: 2015, us_launch_wac_annual: 259000, current_list_price: 312000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Kalydeco', company: 'Vertex', indication: 'Cystic Fibrosis (G551D)', therapy_area: 'rare_disease', mechanism_class: 'CFTR potentiator', launch_year: 2012, us_launch_wac_annual: 294000, current_list_price: 345000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Lysosomal Storage Disorders
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Cerezyme', company: 'Sanofi Genzyme', indication: 'Gaucher Disease (Type 1)', therapy_area: 'rare_disease', mechanism_class: 'ERT (glucocerebrosidase)', launch_year: 1994, us_launch_wac_annual: 200000, current_list_price: 350000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Cerdelga', company: 'Sanofi Genzyme', indication: 'Gaucher Disease (Type 1)', therapy_area: 'rare_disease', mechanism_class: 'SRT (glucosylceramide synthase inhibitor)', launch_year: 2014, us_launch_wac_annual: 310000, current_list_price: 390000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Fabrazyme', company: 'Sanofi Genzyme', indication: 'Fabry Disease', therapy_area: 'rare_disease', mechanism_class: 'ERT (alpha-galactosidase A)', launch_year: 2003, us_launch_wac_annual: 210000, current_list_price: 330000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Elfabrio', company: 'Chiesi/Protalix', indication: 'Fabry Disease', therapy_area: 'rare_disease', mechanism_class: 'ERT (pegunigalsidase alfa)', launch_year: 2023, us_launch_wac_annual: 340000, current_list_price: 340000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Nexviazyme', company: 'Sanofi Genzyme', indication: 'Pompe Disease', therapy_area: 'rare_disease', mechanism_class: 'ERT (avalglucosidase alfa)', launch_year: 2021, us_launch_wac_annual: 321000, current_list_price: 336000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Lumizyme', company: 'Sanofi Genzyme', indication: 'Pompe Disease', therapy_area: 'rare_disease', mechanism_class: 'ERT (alglucosidase alfa)', launch_year: 2010, us_launch_wac_annual: 300000, current_list_price: 360000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Brineura', company: 'BioMarin', indication: 'CLN2 (Batten Disease)', therapy_area: 'rare_disease', mechanism_class: 'ERT (cerliponase alfa)', launch_year: 2017, us_launch_wac_annual: 702000, current_list_price: 730000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Hereditary Angioedema
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Firazyr', company: 'Takeda', indication: 'Hereditary Angioedema (acute)', therapy_area: 'rare_disease', mechanism_class: 'Bradykinin B2 receptor antagonist', launch_year: 2011, us_launch_wac_annual: 72000, current_list_price: 105000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Takhzyro', company: 'Takeda', indication: 'Hereditary Angioedema (prevention)', therapy_area: 'rare_disease', mechanism_class: 'Anti-kallikrein mAb', launch_year: 2018, us_launch_wac_annual: 461000, current_list_price: 494000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Hemophilia
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Hemlibra', company: 'Roche/Genentech', indication: 'Hemophilia A', therapy_area: 'rare_disease', mechanism_class: 'Bispecific mAb (FIXa/FX)', launch_year: 2017, us_launch_wac_annual: 482000, current_list_price: 598000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Alhemo', company: 'Novo Nordisk', indication: 'Hemophilia A/B with inhibitors', therapy_area: 'rare_disease', mechanism_class: 'Anti-TFPI mAb (fitusiran)', launch_year: 2023, us_launch_wac_annual: 436000, current_list_price: 436000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Bone / Growth Disorders
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Voxzogo', company: 'BioMarin', indication: 'Achondroplasia', therapy_area: 'rare_disease', mechanism_class: 'CNP analog (vosoritide)', launch_year: 2021, us_launch_wac_annual: 294000, current_list_price: 310000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Strensiq', company: 'Alexion/AstraZeneca', indication: 'Hypophosphatasia', therapy_area: 'rare_disease', mechanism_class: 'ERT (asfotase alfa)', launch_year: 2015, us_launch_wac_annual: 286000, current_list_price: 438000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Sickle Cell Disease / Hematology
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Oxbryta', company: 'Pfizer (Global Blood Therapeutics)', indication: 'Sickle Cell Disease', therapy_area: 'rare_disease', mechanism_class: 'HbS polymerization inhibitor', launch_year: 2019, us_launch_wac_annual: 125000, current_list_price: 135000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Adakveo', company: 'Novartis', indication: 'Sickle Cell Disease (VOC prevention)', therapy_area: 'rare_disease', mechanism_class: 'Anti-P-selectin mAb', launch_year: 2019, us_launch_wac_annual: 88000, current_list_price: 95000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — PKU / Metabolic
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Kuvan', company: 'BioMarin', indication: 'Phenylketonuria', therapy_area: 'rare_disease', mechanism_class: 'PAH cofactor (sapropterin)', launch_year: 2007, us_launch_wac_annual: 58000, current_list_price: 120000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Palynziq', company: 'BioMarin', indication: 'Phenylketonuria', therapy_area: 'rare_disease', mechanism_class: 'PAL enzyme (pegvaliase)', launch_year: 2018, us_launch_wac_annual: 192000, current_list_price: 253000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // RARE DISEASE — Complement-Mediated Disorders
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Soliris', company: 'Alexion/AstraZeneca', indication: 'PNH / aHUS', therapy_area: 'rare_disease', mechanism_class: 'Anti-C5 mAb', launch_year: 2007, us_launch_wac_annual: 350000, current_list_price: 678000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Ultomiris', company: 'Alexion/AstraZeneca', indication: 'PNH / aHUS / gMG', therapy_area: 'rare_disease', mechanism_class: 'Anti-C5 mAb (long-acting)', launch_year: 2018, us_launch_wac_annual: 458000, current_list_price: 503000, orphan_drug: true, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Anti-IL-4/IL-13
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Dupixent', company: 'Regeneron/Sanofi', indication: 'Atopic Dermatitis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-4Ra mAb', launch_year: 2017, us_launch_wac_annual: 37000, current_list_price: 43000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Anti-IL-17
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Cosentyx', company: 'Novartis', indication: 'Plaque Psoriasis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-17A mAb', launch_year: 2015, us_launch_wac_annual: 35000, current_list_price: 45000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Taltz', company: 'Eli Lilly', indication: 'Plaque Psoriasis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-17A mAb', launch_year: 2016, us_launch_wac_annual: 38000, current_list_price: 47000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Bimzelx', company: 'UCB', indication: 'Plaque Psoriasis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-17A/IL-17F mAb', launch_year: 2023, us_launch_wac_annual: 43000, current_list_price: 43000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Anti-IL-23
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Skyrizi', company: 'AbbVie', indication: 'Plaque Psoriasis / Crohn\'s Disease', therapy_area: 'immunology', mechanism_class: 'Anti-IL-23 mAb', launch_year: 2019, us_launch_wac_annual: 40000, current_list_price: 46000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Tremfya', company: 'Johnson & Johnson', indication: 'Plaque Psoriasis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-23 mAb', launch_year: 2017, us_launch_wac_annual: 37000, current_list_price: 43000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Omvoh', company: 'Eli Lilly', indication: 'Ulcerative Colitis', therapy_area: 'immunology', mechanism_class: 'Anti-IL-23p19 mAb', launch_year: 2023, us_launch_wac_annual: 41000, current_list_price: 41000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Anti-IL-12/23
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Stelara', company: 'Johnson & Johnson', indication: 'Plaque Psoriasis / Crohn\'s / UC', therapy_area: 'immunology', mechanism_class: 'Anti-IL-12/23 mAb', launch_year: 2009, us_launch_wac_annual: 22000, current_list_price: 45000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — JAK Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Rinvoq', company: 'AbbVie', indication: 'Rheumatoid Arthritis / Atopic Dermatitis', therapy_area: 'immunology', mechanism_class: 'JAK1 inhibitor', launch_year: 2019, us_launch_wac_annual: 59000, current_list_price: 72000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Olumiant', company: 'Eli Lilly', indication: 'Rheumatoid Arthritis / Alopecia Areata', therapy_area: 'immunology', mechanism_class: 'JAK1/JAK2 inhibitor', launch_year: 2018, us_launch_wac_annual: 43000, current_list_price: 55000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Xeljanz', company: 'Pfizer', indication: 'Rheumatoid Arthritis', therapy_area: 'immunology', mechanism_class: 'Pan-JAK inhibitor', launch_year: 2012, us_launch_wac_annual: 25000, current_list_price: 62000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Sotyktu', company: 'Bristol-Myers Squibb', indication: 'Plaque Psoriasis', therapy_area: 'immunology', mechanism_class: 'TYK2 inhibitor', launch_year: 2022, us_launch_wac_annual: 40000, current_list_price: 42000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Litfulo', company: 'Pfizer', indication: 'Alopecia Areata', therapy_area: 'immunology', mechanism_class: 'JAK3/TEC inhibitor', launch_year: 2023, us_launch_wac_annual: 49000, current_list_price: 49000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — TNF-alpha Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Humira', company: 'AbbVie', indication: 'Rheumatoid Arthritis', therapy_area: 'immunology', mechanism_class: 'TNF-alpha inhibitor', launch_year: 2002, us_launch_wac_annual: 19000, current_list_price: 88000, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Anti-Integrin / GI
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Entyvio', company: 'Takeda', indication: 'Ulcerative Colitis / Crohn\'s Disease', therapy_area: 'immunology', mechanism_class: 'Anti-a4b7 integrin mAb', launch_year: 2014, us_launch_wac_annual: 32000, current_list_price: 46000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // IMMUNOLOGY — Lupus (SLE)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Saphnelo', company: 'AstraZeneca', indication: 'Systemic Lupus Erythematosus', therapy_area: 'immunology', mechanism_class: 'Anti-IFNAR1 mAb', launch_year: 2021, us_launch_wac_annual: 44000, current_list_price: 48000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Benlysta', company: 'GSK', indication: 'Systemic Lupus Erythematosus', therapy_area: 'immunology', mechanism_class: 'Anti-BLyS mAb', launch_year: 2011, us_launch_wac_annual: 28000, current_list_price: 52000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Heart Failure / Hypertension
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Entresto', company: 'Novartis', indication: 'Heart Failure', therapy_area: 'cardiovascular', mechanism_class: 'ARNI', launch_year: 2015, us_launch_wac_annual: 4560, current_list_price: 7200, orphan_drug: false, first_in_class: true },
  { drug_name: 'Camzyos', company: 'Bristol-Myers Squibb', indication: 'Hypertrophic Cardiomyopathy', therapy_area: 'cardiovascular', mechanism_class: 'Cardiac myosin inhibitor', launch_year: 2022, us_launch_wac_annual: 89000, current_list_price: 92000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Verquvo', company: 'Merck/Bayer', indication: 'Heart Failure (HFrEF)', therapy_area: 'cardiovascular', mechanism_class: 'sGC stimulator', launch_year: 2021, us_launch_wac_annual: 6600, current_list_price: 7200, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — SGLT2 Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Farxiga', company: 'AstraZeneca', indication: 'Heart Failure / CKD / T2D', therapy_area: 'cardiovascular', mechanism_class: 'SGLT2 inhibitor', launch_year: 2014, us_launch_wac_annual: 4800, current_list_price: 6300, orphan_drug: false, first_in_class: false },
  { drug_name: 'Jardiance', company: 'Boehringer Ingelheim/Eli Lilly', indication: 'Heart Failure / T2D', therapy_area: 'cardiovascular', mechanism_class: 'SGLT2 inhibitor', launch_year: 2014, us_launch_wac_annual: 4500, current_list_price: 6500, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Anticoagulants (DOACs)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Xarelto', company: 'Johnson & Johnson/Bayer', indication: 'DVT/PE / AF Stroke Prevention', therapy_area: 'cardiovascular', mechanism_class: 'Factor Xa inhibitor', launch_year: 2011, us_launch_wac_annual: 4500, current_list_price: 6600, orphan_drug: false, first_in_class: false },
  { drug_name: 'Eliquis', company: 'Bristol-Myers Squibb/Pfizer', indication: 'DVT/PE / AF Stroke Prevention', therapy_area: 'cardiovascular', mechanism_class: 'Factor Xa inhibitor', launch_year: 2012, us_launch_wac_annual: 4200, current_list_price: 6800, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — PCSK9 Inhibitors
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Repatha', company: 'Amgen', indication: 'Hypercholesterolemia', therapy_area: 'cardiovascular', mechanism_class: 'Anti-PCSK9 mAb', launch_year: 2015, us_launch_wac_annual: 14100, current_list_price: 6500, orphan_drug: false, first_in_class: false },
  { drug_name: 'Praluent', company: 'Regeneron/Sanofi', indication: 'Hypercholesterolemia', therapy_area: 'cardiovascular', mechanism_class: 'Anti-PCSK9 mAb', launch_year: 2015, us_launch_wac_annual: 14600, current_list_price: 6900, orphan_drug: false, first_in_class: true },
  { drug_name: 'Leqvio', company: 'Novartis', indication: 'Hypercholesterolemia', therapy_area: 'cardiovascular', mechanism_class: 'PCSK9 siRNA', launch_year: 2021, us_launch_wac_annual: 6500, current_list_price: 6500, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Other Lipid-Lowering
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Nexletol', company: 'Esperion', indication: 'Hypercholesterolemia', therapy_area: 'cardiovascular', mechanism_class: 'ACL inhibitor (bempedoic acid)', launch_year: 2020, us_launch_wac_annual: 3800, current_list_price: 4400, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // CARDIOVASCULAR — Pulmonary Arterial Hypertension
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Opsumit', company: 'Johnson & Johnson', indication: 'Pulmonary Arterial Hypertension', therapy_area: 'cardiovascular', mechanism_class: 'Endothelin receptor antagonist', launch_year: 2013, us_launch_wac_annual: 85000, current_list_price: 145000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Uptravi', company: 'Johnson & Johnson', indication: 'Pulmonary Arterial Hypertension', therapy_area: 'cardiovascular', mechanism_class: 'IP receptor agonist (prostacyclin)', launch_year: 2015, us_launch_wac_annual: 160000, current_list_price: 228000, orphan_drug: true, first_in_class: true },
  { drug_name: 'Tyvaso', company: 'United Therapeutics', indication: 'Pulmonary Arterial Hypertension / PH-ILD', therapy_area: 'cardiovascular', mechanism_class: 'Prostacyclin analog (inhaled)', launch_year: 2009, us_launch_wac_annual: 78000, current_list_price: 175000, orphan_drug: true, first_in_class: false },
  { drug_name: 'Winrevair', company: 'Merck', indication: 'Pulmonary Arterial Hypertension', therapy_area: 'cardiovascular', mechanism_class: 'Activin signaling inhibitor (anti-activin)', launch_year: 2024, us_launch_wac_annual: 252000, current_list_price: 252000, orphan_drug: true, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // METABOLIC — GLP-1 / Diabetes / Obesity
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Ozempic', company: 'Novo Nordisk', indication: 'Type 2 Diabetes', therapy_area: 'metabolic', mechanism_class: 'GLP-1 RA', launch_year: 2017, us_launch_wac_annual: 9000, current_list_price: 12500, orphan_drug: false, first_in_class: false },
  { drug_name: 'Wegovy', company: 'Novo Nordisk', indication: 'Obesity', therapy_area: 'metabolic', mechanism_class: 'GLP-1 RA', launch_year: 2021, us_launch_wac_annual: 16000, current_list_price: 16000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Mounjaro', company: 'Eli Lilly', indication: 'Type 2 Diabetes', therapy_area: 'metabolic', mechanism_class: 'GIP/GLP-1 dual agonist', launch_year: 2022, us_launch_wac_annual: 12900, current_list_price: 13200, orphan_drug: false, first_in_class: true },
  { drug_name: 'Zepbound', company: 'Eli Lilly', indication: 'Obesity', therapy_area: 'metabolic', mechanism_class: 'GIP/GLP-1 dual agonist', launch_year: 2023, us_launch_wac_annual: 13000, current_list_price: 13000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Rybelsus', company: 'Novo Nordisk', indication: 'Type 2 Diabetes', therapy_area: 'metabolic', mechanism_class: 'GLP-1 RA (oral)', launch_year: 2019, us_launch_wac_annual: 9000, current_list_price: 11000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Trulicity', company: 'Eli Lilly', indication: 'Type 2 Diabetes', therapy_area: 'metabolic', mechanism_class: 'GLP-1 RA', launch_year: 2014, us_launch_wac_annual: 7200, current_list_price: 10800, orphan_drug: false, first_in_class: false },
  { drug_name: 'Victoza', company: 'Novo Nordisk', indication: 'Type 2 Diabetes', therapy_area: 'metabolic', mechanism_class: 'GLP-1 RA', launch_year: 2010, us_launch_wac_annual: 4600, current_list_price: 9200, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASE — HIV
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Biktarvy', company: 'Gilead', indication: 'HIV/AIDS', therapy_area: 'infectious_disease', mechanism_class: 'INSTI/NRTI', launch_year: 2018, us_launch_wac_annual: 42000, current_list_price: 48000, orphan_drug: false, first_in_class: false },
  { drug_name: 'Cabenuva', company: 'ViiV Healthcare/GSK', indication: 'HIV/AIDS (long-acting injectable)', therapy_area: 'infectious_disease', mechanism_class: 'INSTI + NNRTI (cabotegravir/rilpivirine)', launch_year: 2021, us_launch_wac_annual: 46000, current_list_price: 50000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Apretude', company: 'ViiV Healthcare/GSK', indication: 'HIV PrEP (prevention)', therapy_area: 'infectious_disease', mechanism_class: 'INSTI (cabotegravir LA)', launch_year: 2021, us_launch_wac_annual: 22000, current_list_price: 24000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Sunlenca', company: 'Gilead', indication: 'HIV/AIDS (multidrug resistant)', therapy_area: 'infectious_disease', mechanism_class: 'Capsid inhibitor', launch_year: 2022, us_launch_wac_annual: 42500, current_list_price: 45000, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASE — HCV / HBV
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Baraclude', company: 'Bristol-Myers Squibb', indication: 'Hepatitis B', therapy_area: 'infectious_disease', mechanism_class: 'Nucleoside analog (HBV)', launch_year: 2005, us_launch_wac_annual: 17000, current_list_price: 2400, orphan_drug: false, first_in_class: false },

  // ════════════════════════════════════════════════════════════
  // INFECTIOUS DISEASE — Anti-infectives
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Beyfortus', company: 'Sanofi/AstraZeneca', indication: 'RSV Prevention (infants)', therapy_area: 'infectious_disease', mechanism_class: 'Anti-RSV mAb (nirsevimab)', launch_year: 2023, us_launch_wac_annual: 495, current_list_price: 495, orphan_drug: false, first_in_class: false },
  { drug_name: 'TPOXX', company: 'SIGA Technologies', indication: 'Smallpox / Monkeypox', therapy_area: 'infectious_disease', mechanism_class: 'VP37 inhibitor (tecovirimat)', launch_year: 2018, us_launch_wac_annual: 4200, current_list_price: 5600, orphan_drug: true, first_in_class: true },
  { drug_name: 'Dalvance', company: 'AbbVie', indication: 'ABSSSI (Gram-positive infections)', therapy_area: 'infectious_disease', mechanism_class: 'Lipoglycopeptide antibiotic', launch_year: 2014, us_launch_wac_annual: 3700, current_list_price: 4800, orphan_drug: false, first_in_class: true },
  { drug_name: 'Dificid', company: 'Merck', indication: 'C. difficile Infection', therapy_area: 'infectious_disease', mechanism_class: 'RNA polymerase inhibitor (fidaxomicin)', launch_year: 2011, us_launch_wac_annual: 3400, current_list_price: 4800, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // OPHTHALMOLOGY — Anti-VEGF / Retinal
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Vabysmo', company: 'Roche/Genentech', indication: 'Wet AMD / DME', therapy_area: 'ophthalmology', mechanism_class: 'Bispecific mAb (VEGF-A/Ang-2)', launch_year: 2022, us_launch_wac_annual: 12000, current_list_price: 13000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Eylea', company: 'Regeneron', indication: 'Wet AMD / DME / RVO', therapy_area: 'ophthalmology', mechanism_class: 'Anti-VEGF fusion protein', launch_year: 2011, us_launch_wac_annual: 11500, current_list_price: 14500, orphan_drug: false, first_in_class: false },
  { drug_name: 'Eylea HD', company: 'Regeneron', indication: 'Wet AMD / DME (high dose)', therapy_area: 'ophthalmology', mechanism_class: 'Anti-VEGF fusion protein (high dose)', launch_year: 2023, us_launch_wac_annual: 14400, current_list_price: 14400, orphan_drug: false, first_in_class: false },
  { drug_name: 'Beovu', company: 'Novartis', indication: 'Wet AMD / DME', therapy_area: 'ophthalmology', mechanism_class: 'Anti-VEGF scFv', launch_year: 2019, us_launch_wac_annual: 12000, current_list_price: 13600, orphan_drug: false, first_in_class: false },
  { drug_name: 'Lucentis', company: 'Roche/Genentech', indication: 'Wet AMD / DME', therapy_area: 'ophthalmology', mechanism_class: 'Anti-VEGF mAb fragment', launch_year: 2006, us_launch_wac_annual: 9000, current_list_price: 14200, orphan_drug: false, first_in_class: true },

  // ════════════════════════════════════════════════════════════
  // OPHTHALMOLOGY — Geographic Atrophy (Dry AMD)
  // ════════════════════════════════════════════════════════════
  { drug_name: 'Syfovre', company: 'Apellis', indication: 'Geographic Atrophy (dry AMD)', therapy_area: 'ophthalmology', mechanism_class: 'Complement C3 inhibitor', launch_year: 2023, us_launch_wac_annual: 22000, current_list_price: 22000, orphan_drug: false, first_in_class: true },
  { drug_name: 'Izervay', company: 'Astellas/Iveric Bio', indication: 'Geographic Atrophy (dry AMD)', therapy_area: 'ophthalmology', mechanism_class: 'Complement C5 inhibitor', launch_year: 2023, us_launch_wac_annual: 21000, current_list_price: 21000, orphan_drug: false, first_in_class: false },
];
