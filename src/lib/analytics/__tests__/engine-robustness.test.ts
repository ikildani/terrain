/**
 * EXHAUSTIVE ENGINE ROBUSTNESS TEST
 * Tests every procedure/indication across all product categories
 * to ensure no runtime crashes regardless of input combinations.
 */

import { PROCEDURE_DATA } from '@/lib/data/procedure-map';
import { INDICATION_DATA } from '@/lib/data/indication-map';
import { calculateDeviceMarketSizing, calculateCDxMarketSizing } from '@/lib/analytics/device-market-sizing';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import { calculateNutraceuticalMarketSizing } from '@/lib/analytics/nutraceutical-market-sizing';

// ──────────────────────────────────────────────────────────
// DEVICE ENGINE: All 64 procedures × all stages
// ──────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────
// PHARMA ENGINE: Sample of 30 indications
// ──────────────────────────────────────────────────────────

describe('Pharma Engine — Sample indications', () => {
  // Take every 7th indication to get broad coverage
  const sampleIndications = INDICATION_DATA.filter((_: unknown, i: number) => i % 7 === 0);

  for (const ind of sampleIndications) {
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

describe('Pharma Engine — Missing optional fields', () => {
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
});

// ──────────────────────────────────────────────────────────
// CDX ENGINE
// ──────────────────────────────────────────────────────────

describe('CDx Engine — Sample inputs', () => {
  const CDX_TESTS = [
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
  ];

  for (const t of CDX_TESTS) {
    test(`CDx: ${t.drug_indication} / ${t.biomarker}`, async () => {
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

describe('CDx Engine — Missing fields', () => {
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
});

// ──────────────────────────────────────────────────────────
// NUTRACEUTICAL ENGINE
// ──────────────────────────────────────────────────────────

describe('Nutraceutical Engine — Sample inputs', () => {
  const NUTRA_TESTS = [
    { ingredient: 'Omega-3 EPA/DHA', focus: 'Cardiovascular Health', category: 'dietary_supplement' },
    { ingredient: 'Curcumin', focus: 'Joint Health', category: 'dietary_supplement' },
    { ingredient: 'Vitamin D3', focus: 'Bone Health', category: 'dietary_supplement' },
    { ingredient: 'Ashwagandha', focus: 'Stress Management', category: 'botanical' },
    { ingredient: 'Collagen Peptides', focus: 'Skin Health', category: 'functional_food' },
    { ingredient: 'NMN', focus: 'Longevity', category: 'dietary_supplement' },
    { ingredient: 'Creatine Monohydrate', focus: 'Muscle Performance', category: 'sports_nutrition' },
    { ingredient: 'Berberine', focus: 'Metabolic Health', category: 'botanical' },
  ];

  for (const t of NUTRA_TESTS) {
    test(`${t.ingredient}`, async () => {
      const result = await calculateNutraceuticalMarketSizing({
        primary_ingredient: t.ingredient,
        health_focus: t.focus,
        nutraceutical_category: t.category,
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
