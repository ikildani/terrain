import { calculateMarketSizing } from '../src/lib/analytics/market-sizing';
import { calculateDeviceMarketSizing, calculateCDxMarketSizing } from '../src/lib/analytics/device-market-sizing';

interface Test {
  name: string;
  fn: () => Promise<any>;
}

const tests: Test[] = [
  // PHARMA — all 18 TAs × varied stages × mechanisms
  {
    name: 'Oncology Phase 3 PD-1',
    fn: () =>
      calculateMarketSizing({
        indication: 'Non-Small Cell Lung Cancer',
        geography: ['US'],
        development_stage: 'phase3',
        mechanism: 'PD-1 inhibitor',
        pricing_assumption: 'base',
        launch_year: 2027,
      } as any),
  },
  {
    name: 'Oncology Preclinical ADC',
    fn: () =>
      calculateMarketSizing({
        indication: 'Breast Cancer',
        subtype: 'HER2+',
        geography: ['US', 'EU5'],
        development_stage: 'preclinical',
        mechanism: 'ADC',
        pricing_assumption: 'premium',
        launch_year: 2033,
      } as any),
  },
  {
    name: 'Oncology Phase 2 bispecific',
    fn: () =>
      calculateMarketSizing({
        indication: 'Multiple Myeloma',
        geography: ['Global'],
        development_stage: 'phase2',
        mechanism: 'bispecific antibody',
        pricing_assumption: 'base',
        launch_year: 2029,
      } as any),
  },
  {
    name: 'Oncology Approved KRAS',
    fn: () =>
      calculateMarketSizing({
        indication: 'Pancreatic Cancer',
        geography: ['US'],
        development_stage: 'approved',
        mechanism: 'KRAS G12C inhibitor',
        pricing_assumption: 'base',
        launch_year: 2025,
      } as any),
  },
  {
    name: 'Neurology Phase 2 gene therapy',
    fn: () =>
      calculateMarketSizing({
        indication: 'Spinal Muscular Atrophy',
        geography: ['Global'],
        development_stage: 'phase2',
        mechanism: 'AAV gene therapy',
        pricing_assumption: 'base',
        launch_year: 2030,
      } as any),
  },
  {
    name: 'Neurology Phase 3 mAb',
    fn: () =>
      calculateMarketSizing({
        indication: "Alzheimer's Disease",
        geography: ['US', 'EU5'],
        development_stage: 'phase3',
        mechanism: 'anti-amyloid antibody',
        pricing_assumption: 'premium',
        launch_year: 2028,
      } as any),
  },
  {
    name: 'Rare Disease Phase 1',
    fn: () =>
      calculateMarketSizing({
        indication: 'Duchenne Muscular Dystrophy',
        geography: ['US'],
        development_stage: 'phase1',
        mechanism: 'exon skipping',
        pricing_assumption: 'premium',
        launch_year: 2031,
      } as any),
  },
  {
    name: 'Rare Disease Approved enzyme',
    fn: () =>
      calculateMarketSizing({
        indication: 'Fabry Disease',
        geography: ['US', 'EU5'],
        development_stage: 'approved',
        mechanism: 'enzyme replacement therapy',
        pricing_assumption: 'base',
        launch_year: 2025,
      } as any),
  },
  {
    name: 'Metabolic Phase 3 GLP-1',
    fn: () =>
      calculateMarketSizing({
        indication: 'Obesity',
        geography: ['US', 'EU5', 'Japan'],
        development_stage: 'phase3',
        mechanism: 'GLP-1 receptor agonist',
        pricing_assumption: 'conservative',
        launch_year: 2027,
      } as any),
  },
  {
    name: 'Immunology Phase 2 bispecific',
    fn: () =>
      calculateMarketSizing({
        indication: 'Rheumatoid Arthritis',
        geography: ['US', 'EU5'],
        development_stage: 'phase2',
        mechanism: 'bispecific antibody',
        pricing_assumption: 'base',
        launch_year: 2029,
      } as any),
  },
  {
    name: 'Psychiatry Approved NMDA',
    fn: () =>
      calculateMarketSizing({
        indication: 'Major Depressive Disorder',
        geography: ['US'],
        development_stage: 'approved',
        mechanism: 'NMDA receptor modulator',
        pricing_assumption: 'base',
        launch_year: 2025,
      } as any),
  },
  {
    name: 'CV Phase 2 siRNA',
    fn: () =>
      calculateMarketSizing({
        indication: 'Heart Failure',
        geography: ['Global'],
        development_stage: 'phase2',
        mechanism: 'siRNA',
        pricing_assumption: 'base',
        launch_year: 2030,
      } as any),
  },
  {
    name: 'Hematology Phase 1 CAR-T',
    fn: () =>
      calculateMarketSizing({
        indication: 'Diffuse Large B-Cell Lymphoma',
        geography: ['US'],
        development_stage: 'phase1',
        mechanism: 'CAR-T cell therapy',
        pricing_assumption: 'premium',
        launch_year: 2031,
      } as any),
  },
  {
    name: 'Infectious Disease Phase 3',
    fn: () =>
      calculateMarketSizing({
        indication: 'Hepatitis B',
        geography: ['US', 'China'],
        development_stage: 'phase3',
        mechanism: 'antisense oligonucleotide',
        pricing_assumption: 'base',
        launch_year: 2028,
      } as any),
  },
  {
    name: 'Ophthalmology Phase 2',
    fn: () =>
      calculateMarketSizing({
        indication: 'Wet Age-Related Macular Degeneration',
        geography: ['US'],
        development_stage: 'phase2',
        mechanism: 'anti-VEGF',
        pricing_assumption: 'conservative',
        launch_year: 2029,
      } as any),
  },
  {
    name: 'Dermatology Phase 3 JAK',
    fn: () =>
      calculateMarketSizing({
        indication: 'Atopic Dermatitis',
        geography: ['US', 'EU5'],
        development_stage: 'phase3',
        mechanism: 'JAK inhibitor',
        pricing_assumption: 'base',
        launch_year: 2027,
      } as any),
  },
  {
    name: 'GI Phase 2 anti-TL1A',
    fn: () =>
      calculateMarketSizing({
        indication: 'Ulcerative Colitis',
        geography: ['US'],
        development_stage: 'phase2',
        mechanism: 'anti-TL1A',
        pricing_assumption: 'premium',
        launch_year: 2029,
      } as any),
  },
  {
    name: 'Hepatology Phase 3 FXR',
    fn: () =>
      calculateMarketSizing({
        indication: 'NASH',
        geography: ['Global'],
        development_stage: 'phase3',
        mechanism: 'FXR agonist',
        pricing_assumption: 'base',
        launch_year: 2027,
      } as any),
  },
  {
    name: 'Endocrinology Phase 2 GIP',
    fn: () =>
      calculateMarketSizing({
        indication: 'Type 2 Diabetes',
        geography: ['US'],
        development_stage: 'phase2',
        mechanism: 'dual GIP/GLP-1 agonist',
        pricing_assumption: 'base',
        launch_year: 2029,
      } as any),
  },
  {
    name: 'Pulmonology Phase 2',
    fn: () =>
      calculateMarketSizing({
        indication: 'Idiopathic Pulmonary Fibrosis',
        geography: ['US', 'EU5'],
        development_stage: 'phase2',
        mechanism: 'autotaxin inhibitor',
        pricing_assumption: 'base',
        launch_year: 2030,
      } as any),
  },
  {
    name: 'Nephrology Phase 1',
    fn: () =>
      calculateMarketSizing({
        indication: 'IgA Nephropathy',
        geography: ['US'],
        development_stage: 'phase1',
        mechanism: 'complement inhibitor',
        pricing_assumption: 'premium',
        launch_year: 2032,
      } as any),
  },
  {
    name: 'Pain Mgmt Phase 3',
    fn: () =>
      calculateMarketSizing({
        indication: 'Chronic Pain',
        geography: ['US'],
        development_stage: 'phase3',
        mechanism: 'Nav1.7 inhibitor',
        pricing_assumption: 'conservative',
        launch_year: 2027,
      } as any),
  },
  {
    name: 'Musculoskeletal Phase 2',
    fn: () =>
      calculateMarketSizing({
        indication: 'Osteoarthritis',
        geography: ['US', 'EU5'],
        development_stage: 'phase2',
        mechanism: 'anti-NGF antibody',
        pricing_assumption: 'base',
        launch_year: 2029,
      } as any),
  },

  // EDGE CASES — pediatric, gene therapy, orphan
  {
    name: 'Pediatric SMA gene therapy',
    fn: () =>
      calculateMarketSizing({
        indication: 'Spinal Muscular Atrophy',
        patient_segment: 'pediatric',
        geography: ['US'],
        development_stage: 'phase2',
        mechanism: 'AAV9 gene therapy',
        pricing_assumption: 'premium',
        launch_year: 2030,
      } as any),
  },
  {
    name: 'Orphan ultra-rare',
    fn: () =>
      calculateMarketSizing({
        indication: 'Progeria',
        geography: ['US'],
        development_stage: 'phase2',
        mechanism: 'farnesyltransferase inhibitor',
        pricing_assumption: 'premium',
        launch_year: 2030,
        regulatory_designations: ['Orphan Drug', 'Breakthrough Therapy'],
      } as any),
  },
  {
    name: 'Approved biosimilar risk',
    fn: () =>
      calculateMarketSizing({
        indication: 'Rheumatoid Arthritis',
        geography: ['US', 'EU5'],
        development_stage: 'approved',
        mechanism: 'TNF inhibitor biosimilar',
        pricing_assumption: 'conservative',
        launch_year: 2025,
      } as any),
  },

  // DEVICE — varied procedures and stages
  {
    name: 'Device TAVR commercial',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'TAVR',
        geography: ['US'],
        development_stage: 'commercial',
        launch_year: 2025,
      } as any),
  },
  {
    name: 'Device kyphoplasty trial',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'kyphoplasty',
        geography: ['US', 'EU5'],
        development_stage: 'clinical_trial',
        launch_year: 2028,
      } as any),
  },
  {
    name: 'Device DBS preclinical',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'deep brain stimulation',
        geography: ['Global'],
        development_stage: 'preclinical',
        launch_year: 2032,
      } as any),
  },
  {
    name: 'Device robotic surgery',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'robotic surgery',
        geography: ['US'],
        development_stage: 'cleared_approved',
        launch_year: 2026,
      } as any),
  },
  {
    name: 'Device total knee',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'total knee replacement',
        geography: ['US', 'EU5', 'Japan'],
        development_stage: 'commercial',
        launch_year: 2025,
      } as any),
  },
  {
    name: 'Device SCS concept',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'spinal cord stimulation',
        geography: ['US'],
        development_stage: 'concept',
        launch_year: 2034,
      } as any),
  },
  {
    name: 'Device cataract',
    fn: () =>
      calculateDeviceMarketSizing({
        procedure_or_condition: 'cataract surgery',
        geography: ['Global'],
        development_stage: 'commercial',
        launch_year: 2025,
      } as any),
  },

  // CDx
  {
    name: 'CDx EGFR NGS',
    fn: () =>
      calculateCDxMarketSizing({
        drug_indication: 'NSCLC',
        biomarker: 'EGFR',
        biomarker_prevalence_pct: 15,
        test_type: 'NGS_panel',
        drug_development_stage: 'phase3',
        cdx_development_stage: 'clinical_validation',
        geography: ['US'],
        launch_year: 2028,
      } as any),
  },
  {
    name: 'CDx HER2 IHC',
    fn: () =>
      calculateCDxMarketSizing({
        drug_indication: 'Breast Cancer',
        biomarker: 'HER2',
        biomarker_prevalence_pct: 20,
        test_type: 'IHC',
        drug_development_stage: 'approved',
        cdx_development_stage: 'approved',
        geography: ['US', 'EU5'],
        launch_year: 2025,
      } as any),
  },
  {
    name: 'CDx PD-L1 liquid biopsy',
    fn: () =>
      calculateCDxMarketSizing({
        drug_indication: 'Melanoma',
        biomarker: 'PD-L1',
        biomarker_prevalence_pct: 40,
        test_type: 'liquid_biopsy',
        drug_development_stage: 'phase2',
        cdx_development_stage: 'analytical_validation',
        geography: ['US'],
        launch_year: 2030,
      } as any),
  },
];

async function runAll() {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];
  const details: string[] = [];

  for (const test of tests) {
    try {
      const r = await test.fn();
      const tam = r.summary?.tam_us || r.summary?.us_tam;
      const hasRevProj = r.revenue_projection?.length > 0;
      const hasGeo = r.geography_breakdown?.length > 0;

      if (tam && hasRevProj && hasGeo) {
        const tamStr = `$${tam.value}${tam.unit}`;

        // Count Pro sections
        let proSections = 0;
        if (r.label_expansion_opportunities?.length) proSections++;
        if (r.payer_tier_pricing?.length) proSections++;
        if (r.regulatory_pathway_analysis) proSections++;
        if (r.competitive_mechanism_analysis) proSections++;
        if (r.patent_cliff_analysis) proSections++;
        if (r.deal_comps_analysis) proSections++;
        if (r.investment_thesis) proSections++;
        if (r.dcf_waterfall) proSections++;
        if (r.development_cost_estimate) proSections++;
        if (r.manufacturing_constraint) proSections++;
        if (r.one_time_treatment_model?.is_one_time) proSections++;
        if (r.pediatric_analysis?.is_pediatric_focused) proSections++;
        // Device sections
        if (r.reimbursement_analytics) proSections++;
        if (r.competitive_share_distribution) proSections++;
        if (r.deal_benchmark) proSections++;

        console.log(`✓ ${test.name.padEnd(35)} TAM: ${tamStr.padEnd(10)} ProSections: ${proSections}`);
        passed++;
      } else {
        const missing = [];
        if (!tam) missing.push('TAM');
        if (!hasRevProj) missing.push('revenue_projection');
        if (!hasGeo) missing.push('geography');
        console.log(`✗ ${test.name} — missing: ${missing.join(', ')}`);
        failed++;
        failures.push(`${test.name}: missing ${missing.join(', ')}`);
      }
    } catch (err: any) {
      console.log(`✗ ${test.name} — CRASH: ${err.message.slice(0, 80)}`);
      failed++;
      failures.push(`${test.name}: ${err.message.slice(0, 60)}`);
    }
  }

  console.log('');
  console.log(`=== ${passed} passed, ${failed} failed out of ${tests.length} ===`);
  if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach((f) => console.log('  ' + f));
  }
}

runAll();
