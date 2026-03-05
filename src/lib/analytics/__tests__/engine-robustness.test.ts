/**
 * EXHAUSTIVE ENGINE ROBUSTNESS TEST SUITE
 * Tests EVERY procedure, indication, and ingredient across ALL product categories.
 * Zero tolerance for runtime crashes regardless of input combinations.
 *
 * Coverage targets:
 *   - Device:  64/64 procedures × 6 stages × 5 pricing models + fuzzy + edge cases
 *   - Pharma: 200/200 indications × 5 stages + edge cases
 *   - CDx:    all test types × all stage combos + edge cases
 *   - Nutra: 126/126 ingredients + all channels/stages + edge cases
 */

import { PROCEDURE_DATA } from '@/lib/data/procedure-map';
import { INDICATION_DATA } from '@/lib/data/indication-map';
import { NUTRACEUTICAL_INGREDIENTS } from '@/lib/data/nutraceutical-data';
import { calculateDeviceMarketSizing, calculateCDxMarketSizing } from '@/lib/analytics/device-market-sizing';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import { calculateNutraceuticalMarketSizing } from '@/lib/analytics/nutraceutical-market-sizing';

// ════════════════════════════════════════════════════════════
// DEVICE ENGINE — 64 procedures × stages × pricing × edge cases
// ════════════════════════════════════════════════════════════

const DEVICE_STAGES = [
  'concept',
  'preclinical',
  'clinical_trial',
  'fda_submitted',
  'cleared_approved',
  'commercial',
] as const;

const PRICING_MODELS = ['per_procedure', 'per_unit_capital', 'per_test', 'subscription', 'bundle'] as const;

describe('Device Engine — All 64 procedures', () => {
  for (const proc of PROCEDURE_DATA) {
    test(`${proc.name} (${proc.device_category})`, async () => {
      const result = await calculateDeviceMarketSizing({
        procedure_or_condition: proc.name,
        device_category: proc.device_category,
        product_category: 'device_implantable',
        target_setting: ['hospital_inpatient'],
        physician_specialty: proc.performing_specialty,
        development_stage: 'clinical_trial',
        pricing_model: 'per_procedure',
        unit_ase: 5000,
        reimbursement_status: 'covered',
        geography: ['US', 'EU5', 'Japan'],
        launch_year: 2028,
      });
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.us_tam).toBeDefined();
      expect(result.summary.us_tam.value).toBeGreaterThanOrEqual(0);
      expect(result.summary.us_tam.confidence).toBeTruthy();
      expect(result.geography_breakdown).toBeDefined();
      expect(result.revenue_projection).toBeDefined();
      expect(result.methodology).toBeTruthy();
    });
  }
});

describe('Device Engine — All development stages', () => {
  for (const stage of DEVICE_STAGES) {
    test(`stage: ${stage}`, async () => {
      const result = await calculateDeviceMarketSizing({
        procedure_or_condition: 'Total Knee Replacement',
        device_category: 'orthopedic',
        product_category: 'device_implantable',
        target_setting: ['hospital_inpatient'],
        physician_specialty: ['Orthopedic Surgery'],
        development_stage: stage,
        pricing_model: 'per_procedure',
        unit_ase: 8000,
        reimbursement_status: 'covered',
        geography: ['US'],
        launch_year: 2028,
      });
      expect(result.summary.us_tam.value).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('Device Engine — All pricing models', () => {
  for (const model of PRICING_MODELS) {
    test(`pricing: ${model}`, async () => {
      const result = await calculateDeviceMarketSizing({
        procedure_or_condition: 'Robotic-Assisted Radical Prostatectomy',
        device_category: 'oncology_surgical',
        product_category: 'device_capital_equipment',
        target_setting: ['hospital_inpatient'],
        physician_specialty: ['Urology'],
        development_stage: 'commercial',
        pricing_model: model,
        unit_ase: model === 'per_unit_capital' ? 1500000 : 5000,
        disposables_per_procedure: 3,
        disposable_ase: 2000,
        service_contract_annual: model === 'per_unit_capital' ? 150000 : undefined,
        reimbursement_status: 'covered',
        geography: ['US'],
        launch_year: 2028,
      });
      expect(result.summary.us_tam).toBeDefined();
    });
  }
});

describe('Device Engine — Missing fields resilience', () => {
  test('no physician_specialty', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: 'Total Knee Replacement',
      device_category: 'orthopedic',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient'],
      development_stage: 'commercial',
      pricing_model: 'per_procedure',
      unit_ase: 5000,
      reimbursement_status: 'covered',
      geography: ['US'],
      launch_year: 2028,
    });
    expect(result.summary.us_tam).toBeDefined();
  });

  test('no unit_ase (defaults to 0)', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: 'Total Knee Replacement',
      device_category: 'orthopedic',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient'],
      development_stage: 'commercial',
      pricing_model: 'per_procedure',
      reimbursement_status: 'covered',
      geography: ['US'],
      launch_year: 2028,
    });
    expect(result.summary.us_tam.value).toBe(0);
  });

  test('unknown procedure (fallback)', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: 'completely novel gene therapy implant XYZ',
      device_category: 'neurology',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient'],
      physician_specialty: ['Neurosurgery'],
      development_stage: 'preclinical',
      pricing_model: 'per_procedure',
      unit_ase: 50000,
      reimbursement_status: 'unlisted',
      geography: ['US'],
      launch_year: 2032,
    });
    expect(result.summary.us_tam.confidence).toBe('low');
  });

  test('invalid development_stage (fallback)', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: 'TAVR',
      device_category: 'cardiovascular',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient'],
      development_stage: 'invalid_stage_xyz' as any,
      pricing_model: 'per_procedure',
      unit_ase: 30000,
      reimbursement_status: 'covered',
      geography: ['US'],
      launch_year: 2028,
    });
    expect(result.summary.us_tam).toBeDefined();
  });

  test('all geographies', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: 'TAVR',
      device_category: 'cardiovascular',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient', 'hospital_outpatient'],
      physician_specialty: ['Interventional Cardiology'],
      development_stage: 'cleared_approved',
      pricing_model: 'per_procedure',
      unit_ase: 30000,
      reimbursement_status: 'covered',
      geography: ['US', 'EU5', 'Japan', 'China', 'RoW', 'UK', 'Germany', 'France', 'Canada', 'Australia'],
      launch_year: 2026,
    });
    expect(result.geography_breakdown.length).toBeGreaterThan(1);
  });

  test('empty string procedure_or_condition', async () => {
    const result = await calculateDeviceMarketSizing({
      procedure_or_condition: '',
      device_category: 'cardiovascular',
      product_category: 'device_implantable',
      target_setting: ['hospital_inpatient'],
      development_stage: 'clinical_trial',
      pricing_model: 'per_procedure',
      unit_ase: 10000,
      reimbursement_status: 'covered',
      geography: ['US'],
      launch_year: 2028,
    });
    expect(result.summary).toBeDefined();
  });
});

describe('Device Engine — Fuzzy matching', () => {
  const FUZZY_INPUTS = [
    'knee replacement',
    'hip replacement',
    'pacemaker',
    'afib',
    'CGM',
    'heart valve',
    'robotic surgery',
    'glucose monitor',
    'bariatric',
    'hernia',
    'cochlear',
    'spinal stimulator',
    'wound vac',
    'cataract',
    'kyphoplasty/vertebroplasty',
    'stent',
    'ablation',
    'DBS',
    'TMS',
    'TAVR',
    'lithotripsy',
    'sinuplasty',
    'spine fusion',
    'breast implant',
    'defibrillator',
    'insulin pump',
    'dialysis',
    'endoscopy',
    'laparoscopic',
    'coronary stent',
  ];

  for (const input of FUZZY_INPUTS) {
    test(`fuzzy: "${input}"`, async () => {
      const result = await calculateDeviceMarketSizing({
        procedure_or_condition: input,
        device_category: 'cardiovascular',
        product_category: 'device_implantable',
        target_setting: ['hospital_inpatient'],
        development_stage: 'clinical_trial',
        pricing_model: 'per_procedure',
        unit_ase: 8000,
        reimbursement_status: 'covered',
        geography: ['US'],
        launch_year: 2028,
      });
      expect(result.summary.us_tam).toBeDefined();
    });
  }
});

// ════════════════════════════════════════════════════════════
// PHARMA ENGINE — ALL 200 indications (zero sampling)
// ════════════════════════════════════════════════════════════

describe('Pharma Engine — ALL indications', () => {
  for (const ind of INDICATION_DATA) {
    test(`${ind.name}`, async () => {
      const result = await calculateMarketSizing({
        indication: ind.name,
        geography: ['US', 'EU5', 'Japan'],
        development_stage: 'phase2',
        pricing_assumption: 'base',
        launch_year: 2028,
      });
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.tam_us.value).toBeGreaterThan(0);
      expect(result.patient_funnel).toBeDefined();
      expect(result.geography_breakdown.length).toBeGreaterThan(0);
      expect(result.methodology).toBeTruthy();
      expect(result.revenue_projection).toBeDefined();
    });
  }
});

describe('Pharma Engine — All development stages', () => {
  const PHARMA_STAGES = ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'] as const;

  for (const stage of PHARMA_STAGES) {
    test(`stage: ${stage}`, async () => {
      const result = await calculateMarketSizing({
        indication: 'Non-Small Cell Lung Cancer',
        geography: ['US'],
        development_stage: stage,
        pricing_assumption: 'base',
        launch_year: 2028,
      });
      expect(result.summary.tam_us.value).toBeGreaterThan(0);
    });
  }
});

describe('Pharma Engine — All pricing assumptions × sample indications', () => {
  const PRICING = ['conservative', 'base', 'premium'] as const;
  const SAMPLE = [
    'Non-Small Cell Lung Cancer',
    'Multiple Myeloma',
    'Rheumatoid Arthritis',
    "Alzheimer's Disease",
    'Type 2 Diabetes',
  ];

  for (const pricing of PRICING) {
    for (const indication of SAMPLE) {
      test(`${indication} @ ${pricing}`, async () => {
        const result = await calculateMarketSizing({
          indication,
          geography: ['US'],
          development_stage: 'phase2',
          pricing_assumption: pricing,
          launch_year: 2028,
        });
        expect(result.summary.tam_us.value).toBeGreaterThan(0);
      });
    }
  }
});

describe('Pharma Engine — Edge cases', () => {
  test('no subtype, mechanism, patient_segment', async () => {
    const result = await calculateMarketSizing({
      indication: 'Multiple Myeloma',
      geography: ['US', 'EU5'],
      development_stage: 'phase2',
      pricing_assumption: 'base',
      launch_year: 2028,
    });
    expect(result.summary.tam_us).toBeDefined();
  });

  test('invalid development_stage fallback', async () => {
    const result = await calculateMarketSizing({
      indication: 'Multiple Myeloma',
      geography: ['US'],
      development_stage: 'invalid_xyz' as any,
      pricing_assumption: 'base',
      launch_year: 2028,
    });
    expect(result.summary.tam_us).toBeDefined();
  });

  test('with mechanism and patient_segment', async () => {
    const result = await calculateMarketSizing({
      indication: 'Non-Small Cell Lung Cancer',
      mechanism: 'KRAS G12C inhibitor',
      patient_segment: '2L+ after platinum',
      geography: ['US', 'EU5', 'Japan', 'China'],
      development_stage: 'phase3',
      pricing_assumption: 'premium',
      launch_year: 2027,
    });
    expect(result.summary.tam_us.value).toBeGreaterThan(0);
  });

  test('all geographies', async () => {
    const result = await calculateMarketSizing({
      indication: 'Breast Cancer',
      geography: ['US', 'EU5', 'Japan', 'China', 'RoW', 'UK', 'Germany', 'France', 'Canada', 'Australia'],
      development_stage: 'phase2',
      pricing_assumption: 'base',
      launch_year: 2028,
    });
    expect(result.geography_breakdown.length).toBeGreaterThan(1);
  });

  test('far-future launch year', async () => {
    const result = await calculateMarketSizing({
      indication: 'Sickle Cell Disease',
      geography: ['US'],
      development_stage: 'preclinical',
      pricing_assumption: 'base',
      launch_year: 2040,
    });
    expect(result.summary.tam_us).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════
// CDX ENGINE — All test types × stage combos × edge cases
// ════════════════════════════════════════════════════════════

describe('CDx Engine — All test types', () => {
  const CDX_TEST_TYPES = ['NGS_panel', 'IHC', 'PCR', 'FISH', 'liquid_biopsy'] as const;

  for (const testType of CDX_TEST_TYPES) {
    test(`test type: ${testType}`, async () => {
      const result = await calculateCDxMarketSizing({
        drug_indication: 'Non-Small Cell Lung Cancer',
        biomarker: 'EGFR',
        biomarker_prevalence_pct: 25,
        test_type: testType,
        test_setting: ['central_lab'],
        test_ase: 3500,
        drug_development_stage: 'phase2',
        cdx_development_stage: 'clinical_validation',
        geography: ['US'],
      });
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.patient_testing_funnel).toBeDefined();
    });
  }
});

describe('CDx Engine — All drug development stages', () => {
  const CDX_DRUG_STAGES = ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'] as const;

  for (const stage of CDX_DRUG_STAGES) {
    test(`drug stage: ${stage}`, async () => {
      const result = await calculateCDxMarketSizing({
        drug_indication: 'Breast Cancer',
        biomarker: 'HER2',
        biomarker_prevalence_pct: 20,
        test_type: 'IHC',
        test_setting: ['pathology_lab'],
        test_ase: 2000,
        drug_development_stage: stage,
        cdx_development_stage: 'clinical_validation',
        geography: ['US'],
      });
      expect(result.summary).toBeDefined();
    });
  }
});

describe('CDx Engine — All CDx development stages', () => {
  const CDX_CDX_STAGES = [
    'concept',
    'analytical_validation',
    'clinical_validation',
    'regulatory_submission',
    'approved',
  ] as const;

  for (const stage of CDX_CDX_STAGES) {
    test(`cdx stage: ${stage}`, async () => {
      const result = await calculateCDxMarketSizing({
        drug_indication: 'Melanoma',
        biomarker: 'BRAF V600E',
        biomarker_prevalence_pct: 50,
        test_type: 'PCR',
        test_setting: ['central_lab'],
        test_ase: 1500,
        drug_development_stage: 'phase3',
        cdx_development_stage: stage,
        geography: ['US'],
      });
      expect(result.summary).toBeDefined();
    });
  }
});

describe('CDx Engine — Multiple indication/biomarker combos', () => {
  const CDX_COMBOS = [
    {
      drug_indication: 'Non-Small Cell Lung Cancer',
      biomarker: 'EGFR',
      test_type: 'NGS_panel' as const,
      prevalence: 30,
    },
    { drug_indication: 'Breast Cancer', biomarker: 'HER2', test_type: 'IHC' as const, prevalence: 20 },
    { drug_indication: 'Colorectal Cancer', biomarker: 'KRAS', test_type: 'NGS_panel' as const, prevalence: 40 },
    { drug_indication: 'Melanoma', biomarker: 'BRAF', test_type: 'PCR' as const, prevalence: 50 },
    { drug_indication: 'Prostate Cancer', biomarker: 'BRCA1/2', test_type: 'NGS_panel' as const, prevalence: 15 },
    { drug_indication: 'Ovarian Cancer', biomarker: 'BRCA1/2', test_type: 'NGS_panel' as const, prevalence: 25 },
    { drug_indication: 'Bladder Cancer', biomarker: 'FGFR', test_type: 'PCR' as const, prevalence: 20 },
    { drug_indication: 'Gastric Cancer', biomarker: 'HER2', test_type: 'IHC' as const, prevalence: 18 },
    { drug_indication: 'Cholangiocarcinoma', biomarker: 'FGFR2', test_type: 'NGS_panel' as const, prevalence: 15 },
    { drug_indication: 'Non-Small Cell Lung Cancer', biomarker: 'ALK', test_type: 'FISH' as const, prevalence: 5 },
    { drug_indication: 'Non-Small Cell Lung Cancer', biomarker: 'PD-L1', test_type: 'IHC' as const, prevalence: 30 },
    {
      drug_indication: 'Non-Small Cell Lung Cancer',
      biomarker: 'ROS1',
      test_type: 'NGS_panel' as const,
      prevalence: 2,
    },
    { drug_indication: 'Thyroid Cancer', biomarker: 'RET', test_type: 'NGS_panel' as const, prevalence: 12 },
    { drug_indication: 'Multiple Myeloma', biomarker: 'BCMA', test_type: 'IHC' as const, prevalence: 80 },
    { drug_indication: 'Acute Myeloid Leukemia', biomarker: 'FLT3', test_type: 'PCR' as const, prevalence: 30 },
  ];

  for (const t of CDX_COMBOS) {
    test(`CDx: ${t.drug_indication} / ${t.biomarker} (${t.test_type})`, async () => {
      const result = await calculateCDxMarketSizing({
        drug_indication: t.drug_indication,
        biomarker: t.biomarker,
        biomarker_prevalence_pct: t.prevalence,
        test_type: t.test_type,
        test_setting: ['central_lab'],
        test_ase: 3500,
        drug_development_stage: 'phase2',
        cdx_development_stage: 'clinical_validation',
        geography: ['US'],
      });
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.patient_testing_funnel).toBeDefined();
    });
  }
});

describe('CDx Engine — Edge cases', () => {
  test('minimal input', async () => {
    const result = await calculateCDxMarketSizing({
      drug_indication: 'Lung Cancer',
      biomarker: 'PD-L1',
      biomarker_prevalence_pct: 25,
      test_type: 'IHC',
      test_setting: ['pathology_lab'],
      test_ase: 2000,
      drug_development_stage: 'approved',
      cdx_development_stage: 'approved',
      geography: ['US'],
    });
    expect(result.summary).toBeDefined();
  });

  test('unknown indication fallback', async () => {
    const result = await calculateCDxMarketSizing({
      drug_indication: 'Novel Rare Sarcoma Subtype XYZ',
      biomarker: 'NEW_BIOMARKER',
      biomarker_prevalence_pct: 10,
      test_type: 'NGS_panel',
      test_setting: ['central_lab'],
      test_ase: 5000,
      drug_development_stage: 'phase1',
      cdx_development_stage: 'concept',
      geography: ['US'],
    });
    expect(result.summary).toBeDefined();
  });

  test('all geographies', async () => {
    const result = await calculateCDxMarketSizing({
      drug_indication: 'Non-Small Cell Lung Cancer',
      biomarker: 'EGFR',
      biomarker_prevalence_pct: 25,
      test_type: 'NGS_panel',
      test_setting: ['central_lab', 'pathology_lab'],
      test_ase: 3500,
      drug_development_stage: 'phase3',
      cdx_development_stage: 'clinical_validation',
      geography: ['US', 'EU5', 'Japan', 'China'],
    });
    expect(result.summary).toBeDefined();
    // CDx may or may not have geography_breakdown depending on engine output
    if (result.geography_breakdown) {
      expect(result.geography_breakdown.length).toBeGreaterThan(0);
    }
  });

  test('very high prevalence biomarker (95%)', async () => {
    const result = await calculateCDxMarketSizing({
      drug_indication: 'Non-Small Cell Lung Cancer',
      biomarker: 'PD-L1',
      biomarker_prevalence_pct: 95,
      test_type: 'IHC',
      test_setting: ['pathology_lab'],
      test_ase: 800,
      drug_development_stage: 'approved',
      cdx_development_stage: 'approved',
      geography: ['US'],
    });
    expect(result.summary).toBeDefined();
  });

  test('very low prevalence biomarker (1%)', async () => {
    const result = await calculateCDxMarketSizing({
      drug_indication: 'Non-Small Cell Lung Cancer',
      biomarker: 'NTRK',
      biomarker_prevalence_pct: 1,
      test_type: 'NGS_panel',
      test_setting: ['central_lab'],
      test_ase: 5000,
      drug_development_stage: 'approved',
      cdx_development_stage: 'approved',
      geography: ['US'],
    });
    expect(result.summary).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════
// NUTRACEUTICAL ENGINE — ALL 126 ingredients + edge cases
// ════════════════════════════════════════════════════════════

describe('Nutraceutical Engine — ALL ingredients', () => {
  for (const ingredient of NUTRACEUTICAL_INGREDIENTS) {
    test(`${ingredient.name}`, async () => {
      const result = await calculateNutraceuticalMarketSizing({
        primary_ingredient: ingredient.name,
        health_focus: ingredient.health_focus?.split(',')[0]?.trim() || 'General Wellness',
        nutraceutical_category: ingredient.category || 'dietary_supplement',
        target_demographic: 'Adults 30-65',
        claim_type: 'structure_function',
        channels: ['dtc_ecommerce', 'amazon'],
        unit_price: 39.99,
        units_per_year_per_customer: 12,
        cogs_pct: 30,
        development_stage: 'market_ready',
        has_clinical_data: true,
        patent_protected: false,
        geography: ['US'],
        launch_year: 2026,
      });
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  }
});

describe('Nutraceutical Engine — All development stages', () => {
  const NUTRA_STAGES = ['concept', 'formulation', 'clinical_testing', 'market_ready', 'commercial'] as const;

  for (const stage of NUTRA_STAGES) {
    test(`stage: ${stage}`, async () => {
      const result = await calculateNutraceuticalMarketSizing({
        primary_ingredient: 'Omega-3 EPA/DHA',
        health_focus: 'Cardiovascular Health',
        nutraceutical_category: 'dietary_supplement',
        target_demographic: 'Adults 30-65',
        claim_type: 'structure_function',
        channels: ['dtc_ecommerce'],
        unit_price: 39.99,
        units_per_year_per_customer: 12,
        cogs_pct: 30,
        development_stage: stage,
        has_clinical_data: true,
        patent_protected: false,
        geography: ['US'],
        launch_year: 2026,
      });
      expect(result.summary).toBeDefined();
    });
  }
});

describe('Nutraceutical Engine — All channel combos', () => {
  const CHANNEL_COMBOS = [
    ['dtc_ecommerce'],
    ['amazon'],
    ['retail_mass'],
    ['retail_specialty'],
    ['subscription'],
    ['practitioner'],
    ['dtc_ecommerce', 'amazon'],
    ['dtc_ecommerce', 'amazon', 'retail_mass'],
    ['dtc_ecommerce', 'amazon', 'retail_mass', 'subscription'],
    ['dtc_ecommerce', 'amazon', 'retail_mass', 'retail_specialty', 'subscription', 'practitioner'],
  ];

  for (const channels of CHANNEL_COMBOS) {
    test(`channels: ${channels.join('+')}`, async () => {
      const result = await calculateNutraceuticalMarketSizing({
        primary_ingredient: 'Curcumin',
        health_focus: 'Joint Health',
        nutraceutical_category: 'dietary_supplement',
        target_demographic: 'Adults 45+',
        claim_type: 'structure_function',
        channels,
        unit_price: 34.99,
        units_per_year_per_customer: 12,
        cogs_pct: 25,
        development_stage: 'market_ready',
        has_clinical_data: true,
        patent_protected: false,
        geography: ['US'],
        launch_year: 2026,
      });
      expect(result.summary).toBeDefined();
    });
  }
});

describe('Nutraceutical Engine — All claim types', () => {
  const CLAIM_TYPES = [
    'structure_function',
    'qualified_health_claim',
    'nutrient_content',
    'disease_risk_reduction',
  ] as const;

  for (const claim of CLAIM_TYPES) {
    test(`claim: ${claim}`, async () => {
      const result = await calculateNutraceuticalMarketSizing({
        primary_ingredient: 'Vitamin D3',
        health_focus: 'Bone Health',
        nutraceutical_category: 'dietary_supplement',
        target_demographic: 'Adults 50+',
        claim_type: claim,
        channels: ['dtc_ecommerce', 'retail_mass'],
        unit_price: 19.99,
        units_per_year_per_customer: 12,
        cogs_pct: 20,
        development_stage: 'commercial',
        has_clinical_data: true,
        patent_protected: false,
        geography: ['US'],
        launch_year: 2026,
      });
      expect(result.summary).toBeDefined();
    });
  }
});

describe('Nutraceutical Engine — Edge cases', () => {
  test('unknown ingredient (fallback)', async () => {
    const result = await calculateNutraceuticalMarketSizing({
      primary_ingredient: 'Completely Novel Compound XYZ-9000',
      health_focus: 'Brain Health',
      nutraceutical_category: 'dietary_supplement',
      target_demographic: 'Adults 30-65',
      claim_type: 'structure_function',
      channels: ['dtc_ecommerce'],
      unit_price: 59.99,
      units_per_year_per_customer: 12,
      cogs_pct: 35,
      development_stage: 'concept',
      has_clinical_data: false,
      patent_protected: true,
      geography: ['US'],
      launch_year: 2028,
    });
    expect(result.summary).toBeDefined();
  });

  test('invalid development_stage fallback', async () => {
    const result = await calculateNutraceuticalMarketSizing({
      primary_ingredient: 'Ashwagandha',
      health_focus: 'Stress Management',
      nutraceutical_category: 'botanical',
      target_demographic: 'Adults 25-55',
      claim_type: 'structure_function',
      channels: ['dtc_ecommerce', 'amazon'],
      unit_price: 29.99,
      units_per_year_per_customer: 12,
      cogs_pct: 30,
      development_stage: 'invalid_stage_xyz' as any,
      has_clinical_data: true,
      patent_protected: false,
      geography: ['US'],
      launch_year: 2026,
    });
    expect(result.summary).toBeDefined();
  });

  test('all geographies', async () => {
    const result = await calculateNutraceuticalMarketSizing({
      primary_ingredient: 'Collagen Peptides',
      health_focus: 'Skin Health',
      nutraceutical_category: 'functional_food',
      target_demographic: 'Women 25-55',
      claim_type: 'structure_function',
      channels: ['dtc_ecommerce', 'amazon', 'retail_mass'],
      unit_price: 44.99,
      units_per_year_per_customer: 12,
      cogs_pct: 25,
      development_stage: 'commercial',
      has_clinical_data: true,
      patent_protected: false,
      geography: ['US', 'EU5', 'Japan', 'China', 'RoW'],
      launch_year: 2026,
    });
    expect(result.geography_breakdown.length).toBeGreaterThan(1);
  });

  test('extreme pricing', async () => {
    const result = await calculateNutraceuticalMarketSizing({
      primary_ingredient: 'NMN',
      health_focus: 'Longevity',
      nutraceutical_category: 'dietary_supplement',
      target_demographic: 'Adults 40+',
      claim_type: 'structure_function',
      channels: ['dtc_ecommerce'],
      unit_price: 199.99,
      units_per_year_per_customer: 12,
      cogs_pct: 15,
      development_stage: 'market_ready',
      has_clinical_data: true,
      patent_protected: true,
      geography: ['US'],
      launch_year: 2026,
    });
    expect(result.summary).toBeDefined();
  });

  test('minimal price', async () => {
    const result = await calculateNutraceuticalMarketSizing({
      primary_ingredient: 'Vitamin C',
      health_focus: 'Immune Health',
      nutraceutical_category: 'dietary_supplement',
      target_demographic: 'All Adults',
      claim_type: 'nutrient_content',
      channels: ['retail_mass'],
      unit_price: 4.99,
      units_per_year_per_customer: 6,
      cogs_pct: 50,
      development_stage: 'commercial',
      has_clinical_data: false,
      patent_protected: false,
      geography: ['US'],
      launch_year: 2026,
    });
    expect(result.summary).toBeDefined();
  });
});
