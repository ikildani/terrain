import type { TerritoryMultiplier } from '@/types';

// Multipliers represent pharma market revenue ratios vs US (IQVIA Global Pharma Market 2024).
// US pharma market ~$600B; multiplier = territory_revenue / US_revenue.
// These are REVENUE multipliers (already incorporate local pricing, access, patient volumes).
export const TERRITORY_MULTIPLIERS: TerritoryMultiplier[] = [
  {
    territory: 'United States',
    code: 'US',
    multiplier: 1.0,
    population_m: 336,
    gdp_per_capita_usd: 76000,
    healthcare_spend_pct: 17.8,
    notes: 'Reference market. Premium pricing environment. ~$600B pharma market. Largest single market globally.',
  },
  {
    territory: 'EU5 (Combined)',
    code: 'EU5',
    multiplier: 0.4,
    population_m: 330,
    gdp_per_capita_usd: 43000,
    healthcare_spend_pct: 10.8,
    notes:
      'Combined EU5 ~$240B. Pricing 40-60% of US. Larger patient base partially offsets lower per-patient revenue.',
  },
  {
    territory: 'Germany',
    code: 'Germany',
    multiplier: 0.1,
    population_m: 84,
    gdp_per_capita_usd: 54000,
    healthcare_spend_pct: 12.8,
    notes:
      'Largest EU pharma market (~$60B). AMNOG pricing from month 13. Free pricing for first 12 months post-launch.',
  },
  {
    territory: 'France',
    code: 'France',
    multiplier: 0.07,
    population_m: 68,
    gdp_per_capita_usd: 44000,
    healthcare_spend_pct: 12.0,
    notes: 'Pharma market ~$42B. ATU early access. HAS assessment + CEPS negotiation. Prices 15-25% below Germany.',
  },
  {
    territory: 'Italy',
    code: 'Italy',
    multiplier: 0.06,
    population_m: 60,
    gdp_per_capita_usd: 36000,
    healthcare_spend_pct: 9.5,
    notes:
      'Pharma market ~$36B. AIFA negotiation; managed entry agreements common. Regional reimbursement disparities.',
  },
  {
    territory: 'Spain',
    code: 'Spain',
    multiplier: 0.04,
    population_m: 47,
    gdp_per_capita_usd: 32000,
    healthcare_spend_pct: 9.2,
    notes: 'Pharma market ~$24B. National + regional (CCAA) level access. Pricing reference country for many markets.',
  },
  {
    territory: 'United Kingdom',
    code: 'UK',
    multiplier: 0.06,
    population_m: 68,
    gdp_per_capita_usd: 47000,
    healthcare_spend_pct: 11.3,
    notes: 'Pharma market ~$36B. MHRA + NICE HTA. QALY threshold £20K-£30K. Innovative Medicines Fund for oncology.',
  },
  {
    territory: 'Japan',
    code: 'Japan',
    multiplier: 0.15,
    population_m: 124,
    gdp_per_capita_usd: 34000,
    healthcare_spend_pct: 11.0,
    notes:
      'Pharma market ~$90B. PMDA regulated. Biennial drug price revisions (downward). 2-year lag typical post-US approval.',
  },
  {
    territory: 'China',
    code: 'China',
    multiplier: 0.28,
    population_m: 1410,
    gdp_per_capita_usd: 13700,
    healthcare_spend_pct: 5.7,
    notes:
      'Pharma market ~$170B. NMPA regulated. NRDL negotiations apply 30-80% discounts. Massive patient numbers offset low per-patient pricing.',
  },
  {
    territory: 'Rest of World',
    code: 'RoW',
    multiplier: 0.3,
    population_m: 6000,
    gdp_per_capita_usd: 12000,
    healthcare_spend_pct: 5.0,
    notes:
      'Blended estimate ~$180B. Includes Brazil, South Korea, Taiwan, Middle East, India, ASEAN. Highly variable access and pricing.',
  },
  {
    territory: 'Canada',
    code: 'Canada',
    multiplier: 0.04,
    population_m: 40,
    gdp_per_capita_usd: 53000,
    healthcare_spend_pct: 12.2,
    notes: 'Pharma market ~$25B. CADTH HTA. PMPRB pricing controls. Prices 25-40% below US.',
  },
  {
    territory: 'Australia',
    code: 'Australia',
    multiplier: 0.025,
    population_m: 27,
    gdp_per_capita_usd: 66000,
    healthcare_spend_pct: 10.7,
    notes:
      'Pharma market ~$15B. TGA + PBAC. Strict cost-effectiveness threshold. PBS listing required for broad access.',
  },
];
