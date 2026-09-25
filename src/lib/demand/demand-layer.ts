/**
 * Demand layer — one typed demand profile per indication.
 *
 * Terrain is the demand layer that Solidus (deal intelligence) and Augur
 * (investor intelligence) consume. `buildDemandProfile` composes the existing
 * Terrain analytics — `calculateMarketSizing`, `analyzeCompetitiveLandscape`,
 * the regulatory reference tables and the LoA tables — into a single object
 * keyed by Solidus slug or Terrain name. It does not re-implement any math.
 *
 * Where an engine needs inputs that a bare indication does not carry
 * (development stage, launch year, pricing assumption, mechanism) we use the
 * documented defaults in `DEMAND_DEFAULTS` and record each one in
 * `assumptions[]` so a consumer can see exactly what was assumed.
 */

import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import { analyzeCompetitiveLandscape, REFERENCE_MECHANISMS } from '@/lib/analytics/competitive';
import { VALIDATED_SURROGATES, CRL_RECOVERY_DATA } from '@/lib/analytics/regulatory';
import { getLikelihoodOfApproval } from '@/lib/data/loa-tables';
import { TERRITORY_MULTIPLIERS } from '@/lib/data/territory-multipliers';
import { getTABySlug } from '@/lib/data/ta-metadata';
import type { IndicationData } from '@/lib/data/indication-map';
import type {
  Competitor,
  CompetitiveLandscapeOutput,
  DevelopmentStage,
  GeographyCode,
  MarketMetric,
  MarketSizingInput,
  MarketSizingOutput,
  PricingAssumption,
  SurrogateEndpoint,
} from '@/types';
import {
  resolveIndicationKey,
  type MatchQuality,
  type ResolvedBy,
  type ResolvedIndication,
} from './indication-registry';

// ────────────────────────────────────────────────────────────
// DEFAULTS (documented; every use is echoed into `assumptions[]`)
// ────────────────────────────────────────────────────────────

export const DEMAND_DEFAULTS = {
  /** Terrain's own default when no stage is supplied. Mid-pipeline is the modal deal stage. */
  developmentStage: 'phase2' as DevelopmentStage,
  /** Base-case WAC from therapy-area comparables. */
  pricingAssumption: 'base' as PricingAssumption,
  /** Launch two years out from the request; the engine's own default. */
  launchYearOffset: 2,
  /** US is the reference market for TAM/SAM/SOM; territory only changes the breakdown. */
  territory: 'US' as GeographyCode,
  /** Programs listed under `competition.keyPrograms`. */
  keyProgramLimit: 10,
  /** Pricing comparables listed under `market.priceBenchmark.comparables`. */
  comparableLimit: 5,
} as const;

/** Profiles are memoised for one hour per (indication, territory). */
export const DEMAND_PROFILE_TTL_MS = 60 * 60 * 1000;

// ────────────────────────────────────────────────────────────
// TERRITORY ALIASES
// Solidus `epidemiology.json` territory codes → Terrain GeographyCode[]
// ────────────────────────────────────────────────────────────

const SOLIDUS_TERRITORY_ALIASES: Record<string, GeographyCode[]> = {
  us_only: ['US'],
  global: ['Global'],
  europe: ['EU5'],
  china: ['China'],
  japan: ['Japan'],
  canada: ['Canada'],
  australia: ['Australia'],
  south_korea: ['South Korea'],
  row: ['RoW'],
  ex_us: ['EU5', 'Japan', 'China', 'RoW'],
  us_eu: ['US', 'EU5'],
  us_japan: ['US', 'Japan'],
  apac_ex_cj: ['South Korea', 'Taiwan', 'India', 'Australia'],
  latam: ['Brazil', 'Mexico'],
  mena: ['Saudi Arabia', 'Israel'],
};

const TERRAIN_GEOGRAPHY_CODES: GeographyCode[] = [
  ...(TERRITORY_MULTIPLIERS.map((t) => t.code) as GeographyCode[]),
  'Global',
];

/** Engine breakdown labels are display names (`EU5 (Combined)`); map them back to codes. */
const CODE_BY_TERRITORY_LABEL = new Map<string, string>(
  TERRITORY_MULTIPLIERS.flatMap((t) => [
    [t.territory.toLowerCase(), t.code],
    [t.code.toLowerCase(), t.code],
  ]),
);

function territoryCodeFor(label: string): string {
  return CODE_BY_TERRITORY_LABEL.get(label.toLowerCase()) ?? label;
}

export class UnknownTerritoryError extends Error {
  readonly territory: string;
  readonly supported: string[];
  constructor(territory: string) {
    super(`Unknown territory "${territory}".`);
    this.name = 'UnknownTerritoryError';
    this.territory = territory;
    this.supported = supportedTerritories();
  }
}

/** Every territory string the demand layer accepts (Terrain codes + Solidus aliases). */
export function supportedTerritories(): string[] {
  return [...TERRAIN_GEOGRAPHY_CODES, ...Object.keys(SOLIDUS_TERRITORY_ALIASES)];
}

/**
 * Resolve a territory string to Terrain geography codes. Accepts Terrain codes
 * (`US`, `EU5`, `Japan`, `Global`, case-insensitive) and Solidus territory codes
 * (`us_only`, `europe`, `ex_us`, ...). Throws `UnknownTerritoryError` otherwise.
 */
export function resolveTerritory(territory?: string | null): { requested: string; geographies: GeographyCode[] } {
  const raw = (territory ?? '').trim();
  if (!raw) return { requested: DEMAND_DEFAULTS.territory, geographies: [DEMAND_DEFAULTS.territory] };

  const lower = raw.toLowerCase();
  const alias = SOLIDUS_TERRITORY_ALIASES[lower] ?? SOLIDUS_TERRITORY_ALIASES[lower.replace(/[\s-]+/g, '_')];
  if (alias) return { requested: raw, geographies: alias };

  const code = TERRAIN_GEOGRAPHY_CODES.find((c) => c.toLowerCase() === lower);
  if (code) return { requested: code, geographies: [code] };

  throw new UnknownTerritoryError(raw);
}

// ────────────────────────────────────────────────────────────
// PROFILE TYPES
// ────────────────────────────────────────────────────────────

export type SourceKind = 'terrain_static' | 'terrain_engine' | 'terrain_live' | 'terrain_reference';

export interface DemandSource {
  /** Dot path into the profile, e.g. `epidemiology.usPrevalence`. */
  field: string;
  /** Human-readable origin (dataset, engine, or publication). */
  origin: string;
  kind: SourceKind;
  /** Year the underlying data point was last verified, when known. */
  verified?: number | string;
}

export interface DemandIdentity {
  terrainName: string;
  /** Canonical Solidus slug; null when Solidus has no key for this indication. */
  solidusKey: string | null;
  solidusAliases: string[];
  therapyArea: string;
  therapyAreaLabel: string;
  icd10: string[];
  synonyms: string[];
  /** How the request key was resolved and how well Solidus/Terrain agree. */
  resolvedBy: ResolvedBy;
  match: MatchQuality | null;
  matchNote?: string;
}

export interface DemandEpidemiology {
  /** Reference population for prevalence/incidence figures below (always US in Terrain). */
  population: 'US';
  prevalence: number;
  incidence: number;
  /** 0..1 share of prevalent patients who are diagnosed. */
  diagnosisRate: number;
  /** 0..1 share of diagnosed patients who receive drug treatment. */
  treatmentRate: number;
  diagnosed: number;
  treated: number;
  severityDistribution: Record<string, number> | null;
  pediatricPrevalence: number | null;
  /** 0..1 share of prevalent patients who are pediatric; null when Terrain has no pediatric figure. */
  pediatricShare: number | null;
  confidence: IndicationData['data_confidence'];
  verifiedYear: number;
  source: string;
}

export interface DemandMetric {
  /** Value in USD. */
  valueUsd: number;
  /** Convenience display value + unit exactly as the engine reports it. */
  display: { value: number; unit: MarketMetric['unit'] };
  rangeUsd?: [number, number];
  confidence: MarketMetric['confidence'];
}

export interface DemandTerritoryBreakdown {
  /** Terrain GeographyCode (`US`, `EU5`, `Japan`, ...). */
  code: string;
  /** Engine display label (`United States`, `EU5 (Combined)`, ...). */
  territory: string;
  tamUsd: number;
  population: number;
  marketMultiplier: number;
  regulatoryStatus: string;
}

export interface DemandMarket {
  territory: { requested: string; geographies: GeographyCode[] };
  currency: 'USD';
  tamUs: DemandMetric;
  samUs: DemandMetric;
  somUs: DemandMetric;
  /** Sum of TAM across the requested geographies. */
  tamRequestedTerritory: DemandMetric;
  territoryBreakdown: DemandTerritoryBreakdown[];
  /** Peak annual US sales for one asset at the assumed stage, USD millions. */
  peakSalesUsdM: { low: number; base: number; high: number };
  priceBenchmark: {
    /** Annual WAC bands, USD. */
    wacAnnualUsd: { conservative: number; base: number; premium: number };
    /** 0..1 gross-to-net discount applied by the engine. */
    grossToNet: number;
    comparableCount: number;
    comparables: { drug: string; company: string; launchYear: number; launchWacUsd: number; mechanism: string }[];
    rationale: string;
  };
  cagr5yrPct: number;
  growthDriver: string;
  patientFunnel: MarketSizingOutput['patient_funnel'];
  /** Stage, pricing and launch year fed to the engine (see `assumptions`). */
  engineInputs: { developmentStage: DevelopmentStage; pricingAssumption: PricingAssumption; launchYear: number };
}

export interface DemandKeyProgram {
  company: string;
  asset: string;
  mechanism: string;
  phase: Competitor['phase'];
  differentiationScore: number;
  evidenceStrength: number;
  source: string;
}

export interface DemandCompetition {
  /** 1..10 crowding score from the competitive engine. */
  densityScore: number;
  densityLabel: CompetitiveLandscapeOutput['summary']['crowding_label'];
  countsByPhase: {
    approved: number;
    phase3: number;
    phase2: number;
    phase1: number;
    preclinical: number;
    withdrawnOrDiscontinued: number;
    total: number;
  };
  /** Mechanism categories Terrain expects to see in this therapy area. */
  referenceMechanisms: string[];
  keyPrograms: DemandKeyProgram[];
  /** Approved / late-stage products listed in Terrain's indication record. */
  majorCompetitors: string[];
  whiteSpace: string[];
  keyInsight: string;
  differentiationOpportunity: string;
  /** Live-data enrichment timestamps when the engine had them. */
  dataFreshness: CompetitiveLandscapeOutput['data_freshness'] | null;
}

export interface DemandRegulatory {
  validatedSurrogates: SurrogateEndpoint[];
  /** Pathway eligibility notes derived from the indication record and reference tables. */
  pathwayNotes: string[];
  orphanEligible: boolean;
  crlRecovery: {
    therapyArea: string;
    historicalCrlRatePct: number;
    avgMonthsToResubmission: number;
    resubmissionApprovalRatePct: number;
    commonReasons: string[];
  };
  /** Cumulative likelihood of approval from the given stage, 0..1. */
  likelihoodOfApproval: Record<DevelopmentStage, number>;
}

export interface DemandProfile {
  identity: DemandIdentity;
  epidemiology: DemandEpidemiology;
  market: DemandMarket;
  competition: DemandCompetition;
  regulatory: DemandRegulatory;
  assumptions: string[];
  sources: DemandSource[];
  /** ISO date of the data snapshot this profile reflects. Store this with the slug. */
  asOf: string;
  /** ISO timestamp when the profile object was generated. */
  generatedAt: string;
  /** Terrain build of the demand contract. Bump on breaking shape changes. */
  contractVersion: '1.0';
}

export interface DemandProfileOptions {
  /** Terrain GeographyCode or Solidus territory code. Default `US`. */
  territory?: string;
  /** Requested snapshot date. Terrain serves the current snapshot; a mismatch is flagged in `assumptions`. */
  asOf?: string;
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

const UNIT_MULTIPLIER: Record<MarketMetric['unit'], number> = { B: 1e9, M: 1e6, K: 1e3 };

function toDemandMetric(m: MarketMetric): DemandMetric {
  const mult = UNIT_MULTIPLIER[m.unit];
  return {
    valueUsd: Math.round(m.value * mult),
    display: { value: m.value, unit: m.unit },
    ...(m.range
      ? { rangeUsd: [Math.round(m.range[0] * mult), Math.round(m.range[1] * mult)] as [number, number] }
      : {}),
    confidence: m.confidence,
  };
}

function usdToMetric(valueUsd: number, confidence: MarketMetric['confidence']): DemandMetric {
  const unit: MarketMetric['unit'] = valueUsd >= 1e9 ? 'B' : valueUsd >= 1e6 ? 'M' : 'K';
  return {
    valueUsd: Math.round(valueUsd),
    display: { value: parseFloat((valueUsd / UNIT_MULTIPLIER[unit]).toFixed(2)), unit },
    confidence,
  };
}

const PHASE_ORDER: Competitor['phase'][] = [
  'Approved',
  'Phase 3',
  'Phase 2/3',
  'Phase 2',
  'Phase 1/2',
  'Phase 1',
  'Preclinical',
  'Withdrawn',
  'Discontinued',
];

function countByPhase(all: Competitor[]): DemandCompetition['countsByPhase'] {
  const counts = { approved: 0, phase3: 0, phase2: 0, phase1: 0, preclinical: 0, withdrawnOrDiscontinued: 0, total: 0 };
  for (const c of all) {
    counts.total++;
    switch (c.phase) {
      case 'Approved':
        counts.approved++;
        break;
      case 'Phase 3':
      case 'Phase 2/3':
        counts.phase3++;
        break;
      case 'Phase 2':
        counts.phase2++;
        break;
      case 'Phase 1':
      case 'Phase 1/2':
        counts.phase1++;
        break;
      case 'Preclinical':
        counts.preclinical++;
        break;
      default:
        counts.withdrawnOrDiscontinued++;
    }
  }
  return counts;
}

function selectKeyPrograms(all: Competitor[], limit: number): DemandKeyProgram[] {
  return [...all]
    .filter((c) => c.phase !== 'Withdrawn' && c.phase !== 'Discontinued')
    .sort((a, b) => {
      const pa = PHASE_ORDER.indexOf(a.phase);
      const pb = PHASE_ORDER.indexOf(b.phase);
      if (pa !== pb) return pa - pb;
      return (b.differentiation_score ?? 0) - (a.differentiation_score ?? 0);
    })
    .slice(0, limit)
    .map((c) => ({
      company: c.company,
      asset: c.asset_name,
      mechanism: c.mechanism,
      phase: c.phase,
      differentiationScore: c.differentiation_score,
      evidenceStrength: c.evidence_strength,
      source: c.source,
    }));
}

/** US Orphan Drug Act threshold: fewer than 200,000 US patients. */
const ORPHAN_THRESHOLD_US = 200_000;

function buildPathwayNotes(ind: IndicationData, surrogates: SurrogateEndpoint[], orphanEligible: boolean): string[] {
  const notes: string[] = [];
  if (orphanEligible) {
    notes.push(
      `Orphan Drug Designation eligible: US prevalence ${ind.us_prevalence.toLocaleString('en-US')} is below the 200,000-patient threshold (7-year US exclusivity, PDUFA fee waiver).`,
    );
  } else {
    notes.push(
      `Not orphan-eligible on prevalence: US prevalence ${ind.us_prevalence.toLocaleString('en-US')} exceeds 200,000.`,
    );
  }
  const acceptable = surrogates.filter((s) => s.status !== 'exploratory');
  if (acceptable.length > 0) {
    notes.push(
      `Accelerated Approval feasible: ${acceptable.length} FDA-accepted surrogate endpoint${acceptable.length === 1 ? '' : 's'} in ${ind.therapy_area.replace(/_/g, ' ')} (${acceptable
        .slice(0, 3)
        .map((s) => s.endpoint)
        .join('; ')}).`,
    );
  } else {
    notes.push(
      `No validated surrogate endpoints on file for ${ind.therapy_area.replace(/_/g, ' ')}; expect a clinical-outcome primary endpoint.`,
    );
  }
  if (ind.pediatric_prevalence && ind.pediatric_prevalence > 0) {
    notes.push(
      'Pediatric population present: Rare Pediatric Disease priority review voucher may apply if orphan-eligible; PREA pediatric plan required otherwise.',
    );
  }
  return notes;
}

const profileCache = new Map<string, { expiresAt: number; profile: DemandProfile }>();

/** Clear the in-memory profile cache (tests). */
export function clearDemandProfileCache(): void {
  profileCache.clear();
}

// ────────────────────────────────────────────────────────────
// BUILD
// ────────────────────────────────────────────────────────────

/**
 * Build the demand profile for a Solidus slug, Terrain name or synonym.
 * Returns `undefined` when the indication cannot be resolved; throws
 * `UnknownTerritoryError` for an unsupported territory.
 */
export async function buildDemandProfile(
  keyOrName: string,
  opts: DemandProfileOptions = {},
): Promise<DemandProfile | undefined> {
  const resolved = resolveIndicationKey(keyOrName);
  if (!resolved) return undefined;
  return buildDemandProfileFromResolved(resolved, opts);
}

/** Same as `buildDemandProfile`, memoised for `DEMAND_PROFILE_TTL_MS` per (indication, territory). */
export async function getDemandProfileCached(
  keyOrName: string,
  opts: DemandProfileOptions = {},
): Promise<{ profile: DemandProfile; cacheHit: boolean } | undefined> {
  const resolved = resolveIndicationKey(keyOrName);
  if (!resolved) return undefined;
  const territory = resolveTerritory(opts.territory);
  const cacheKey = `${resolved.indication.name.toLowerCase()}|${territory.geographies.join(',')}`;
  const hit = profileCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    return { profile: annotateAsOf(hit.profile, opts.asOf), cacheHit: true };
  }
  const profile = await buildDemandProfileFromResolved(resolved, { territory: opts.territory });
  profileCache.set(cacheKey, { expiresAt: Date.now() + DEMAND_PROFILE_TTL_MS, profile });
  return { profile: annotateAsOf(profile, opts.asOf), cacheHit: false };
}

function annotateAsOf(profile: DemandProfile, requestedAsOf?: string): DemandProfile {
  if (!requestedAsOf || requestedAsOf === profile.asOf) return profile;
  return {
    ...profile,
    assumptions: [
      ...profile.assumptions,
      `asOf ${requestedAsOf} was requested; Terrain serves the current snapshot only (asOf ${profile.asOf}). Historical snapshots are not supported.`,
    ],
  };
}

async function buildDemandProfileFromResolved(
  resolved: ResolvedIndication,
  opts: DemandProfileOptions,
): Promise<DemandProfile> {
  const ind = resolved.indication;
  const territory = resolveTerritory(opts.territory);
  const now = new Date();
  const asOf = now.toISOString().slice(0, 10);
  const assumptions: string[] = [];
  const sources: DemandSource[] = [];

  // ── Engine inputs (defaults, all flagged) ────────────────
  const launchYear = now.getFullYear() + DEMAND_DEFAULTS.launchYearOffset;
  const marketInput: MarketSizingInput = {
    indication: ind.name,
    geography: territory.geographies,
    development_stage: DEMAND_DEFAULTS.developmentStage,
    pricing_assumption: DEMAND_DEFAULTS.pricingAssumption,
    launch_year: launchYear,
  };
  assumptions.push(
    `development_stage defaulted to "${DEMAND_DEFAULTS.developmentStage}" (bare indication; drives peak-share band and LoA).`,
    `pricing_assumption defaulted to "${DEMAND_DEFAULTS.pricingAssumption}" (therapy-area comparable WAC).`,
    `launch_year defaulted to ${launchYear} (request year + ${DEMAND_DEFAULTS.launchYearOffset}).`,
    'No mechanism, subtype or patient segment supplied: addressability and competitive-response modifiers use engine defaults.',
    'TAM/SAM/SOM and peak sales are US figures; territory only changes `market.territoryBreakdown` and `market.tamRequestedTerritory`.',
  );
  if (resolved.match === 'proxy' && resolved.note) {
    assumptions.push(`Solidus key "${resolved.solidusKey}" is a proxy mapping: ${resolved.note}`);
  }
  if (opts.asOf && opts.asOf !== asOf) {
    assumptions.push(
      `asOf ${opts.asOf} was requested; Terrain serves the current snapshot only (asOf ${asOf}). Historical snapshots are not supported.`,
    );
  }

  // ── Run engines (competitive degrades gracefully) ────────
  const [market, competitive] = await Promise.all([
    calculateMarketSizing(marketInput),
    analyzeCompetitiveLandscape({ indication: ind.name }).catch((err: unknown) => {
      assumptions.push(
        `Competitive engine unavailable (${err instanceof Error ? err.message : String(err)}); competition block falls back to the static indication record.`,
      );
      return undefined;
    }),
  ]);

  // ── Identity ─────────────────────────────────────────────
  const ta = getTABySlug(ind.therapy_area);
  const identity: DemandIdentity = {
    terrainName: ind.name,
    solidusKey: resolved.solidusKey,
    solidusAliases: resolved.solidusAliases,
    therapyArea: ind.therapy_area,
    therapyAreaLabel: ta?.name ?? ind.therapy_area.replace(/_/g, ' '),
    icd10: ind.icd10_codes,
    synonyms: ind.synonyms,
    resolvedBy: resolved.resolvedBy,
    match: resolved.match,
    ...(resolved.note ? { matchNote: resolved.note } : {}),
  };
  sources.push({
    field: 'identity',
    origin: 'Terrain indication-map (INDICATION_DATA) + Solidus↔Terrain registry',
    kind: 'terrain_static',
  });

  // ── Epidemiology ─────────────────────────────────────────
  const diagnosed = Math.round(ind.us_prevalence * ind.diagnosis_rate);
  const treated = Math.round(diagnosed * ind.treatment_rate);
  const epidemiology: DemandEpidemiology = {
    population: 'US',
    prevalence: ind.us_prevalence,
    incidence: ind.us_incidence,
    diagnosisRate: ind.diagnosis_rate,
    treatmentRate: ind.treatment_rate,
    diagnosed,
    treated,
    severityDistribution: ind.severity_distribution ?? null,
    pediatricPrevalence: ind.pediatric_prevalence ?? null,
    pediatricShare:
      ind.pediatric_prevalence && ind.us_prevalence > 0
        ? parseFloat((ind.pediatric_prevalence / ind.us_prevalence).toFixed(4))
        : null,
    confidence: ind.data_confidence,
    verifiedYear: ind.last_verified_year,
    source: ind.prevalence_source,
  };
  sources.push(
    {
      field: 'epidemiology.prevalence',
      origin: ind.prevalence_source,
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    },
    {
      field: 'epidemiology.incidence',
      origin: ind.prevalence_source,
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    },
    {
      field: 'epidemiology.diagnosisRate',
      origin: `Terrain indication-map (${ind.data_confidence} confidence)`,
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    },
    {
      field: 'epidemiology.treatmentRate',
      origin: `Terrain indication-map (${ind.data_confidence} confidence)`,
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    },
  );
  if (ind.severity_distribution) {
    sources.push({
      field: 'epidemiology.severityDistribution',
      origin: 'Terrain indication-map',
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    });
  }
  if (ind.pediatric_prevalence) {
    sources.push({
      field: 'epidemiology.pediatricPrevalence',
      origin: 'Terrain indication-map',
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    });
  }

  // ── Market ───────────────────────────────────────────────
  const tamRequestedUsd = market.geography_breakdown.reduce(
    (sum, g) => sum + g.tam.value * UNIT_MULTIPLIER[g.tam.unit],
    0,
  );
  const demandMarket: DemandMarket = {
    territory,
    currency: 'USD',
    tamUs: toDemandMetric(market.summary.tam_us),
    samUs: toDemandMetric(market.summary.sam_us),
    somUs: toDemandMetric(market.summary.som_us),
    tamRequestedTerritory: usdToMetric(tamRequestedUsd, market.summary.tam_us.confidence),
    territoryBreakdown: market.geography_breakdown.map((g) => ({
      code: territoryCodeFor(g.territory),
      territory: g.territory,
      tamUsd: Math.round(g.tam.value * UNIT_MULTIPLIER[g.tam.unit]),
      population: g.population,
      marketMultiplier: g.market_multiplier,
      regulatoryStatus: g.regulatory_status,
    })),
    peakSalesUsdM: market.summary.peak_sales_estimate,
    priceBenchmark: {
      wacAnnualUsd: market.pricing_analysis.recommended_wac,
      grossToNet: market.pricing_analysis.gross_to_net_estimate,
      comparableCount: market.pricing_analysis.comparable_drugs.length,
      comparables: market.pricing_analysis.comparable_drugs.slice(0, DEMAND_DEFAULTS.comparableLimit).map((c) => ({
        drug: c.name,
        company: c.company,
        launchYear: c.launch_year,
        launchWacUsd: c.launch_wac,
        mechanism: c.mechanism,
      })),
      rationale: market.pricing_analysis.pricing_rationale,
    },
    cagr5yrPct: market.summary.cagr_5yr,
    growthDriver: market.summary.market_growth_driver,
    patientFunnel: market.patient_funnel,
    engineInputs: {
      developmentStage: marketInput.development_stage,
      pricingAssumption: marketInput.pricing_assumption,
      launchYear: marketInput.launch_year,
    },
  };
  sources.push(
    {
      field: 'market.tamUs|samUs|somUs|peakSalesUsdM|patientFunnel',
      origin: 'Terrain calculateMarketSizing (market-sizing engine)',
      kind: 'terrain_engine',
    },
    {
      field: 'market.territoryBreakdown',
      origin: 'Terrain territory multipliers (IQVIA Global Pharma Market 2024) + regional prevalence factors',
      kind: 'terrain_reference',
    },
    {
      field: 'market.priceBenchmark',
      origin: `Terrain PRICING_BENCHMARKS (${market.pricing_analysis.comparable_drugs.length} ${ind.therapy_area} comparables)`,
      kind: 'terrain_reference',
    },
    {
      field: 'market.cagr5yrPct',
      origin: 'Terrain indication-map',
      kind: 'terrain_static',
      verified: ind.last_verified_year,
    },
  );
  for (const ds of market.data_sources) {
    sources.push({
      field: 'market (engine input)',
      origin: ds.name,
      kind: ds.type === 'public' ? 'terrain_reference' : 'terrain_engine',
      ...(ds.last_updated ? { verified: ds.last_updated } : {}),
    });
  }
  assumptions.push(...market.assumptions.map((a) => `market-sizing: ${a}`));

  // ── Competition ──────────────────────────────────────────
  const referenceMechanisms = REFERENCE_MECHANISMS[ind.therapy_area] ?? [];
  let competition: DemandCompetition;
  if (competitive) {
    const all = [
      ...competitive.approved_products,
      ...competitive.late_stage_pipeline,
      ...competitive.mid_stage_pipeline,
      ...competitive.early_pipeline,
    ];
    competition = {
      densityScore: competitive.summary.crowding_score,
      densityLabel: competitive.summary.crowding_label,
      countsByPhase: countByPhase(all),
      referenceMechanisms,
      keyPrograms: selectKeyPrograms(all, DEMAND_DEFAULTS.keyProgramLimit),
      majorCompetitors: ind.major_competitors,
      whiteSpace: competitive.summary.white_space,
      keyInsight: competitive.summary.key_insight,
      differentiationOpportunity: competitive.summary.differentiation_opportunity,
      dataFreshness: competitive.data_freshness ?? null,
    };
    sources.push({
      field: 'competition',
      origin:
        'Terrain analyzeCompetitiveLandscape (competitor database + live ClinicalTrials.gov / FDA / EMA caches when available)',
      kind: 'terrain_engine',
    });
    for (const ds of competitive.data_sources) {
      sources.push({
        field: 'competition (engine input)',
        origin: ds.name,
        kind: ds.type === 'public' ? 'terrain_live' : 'terrain_reference',
        ...(ds.last_updated ? { verified: ds.last_updated } : {}),
      });
    }
  } else {
    competition = {
      densityScore: market.competitive_context.crowding_score,
      densityLabel:
        market.competitive_context.crowding_score >= 8
          ? 'Extremely High'
          : market.competitive_context.crowding_score >= 6
            ? 'High'
            : market.competitive_context.crowding_score >= 4
              ? 'Moderate'
              : 'Low',
      countsByPhase: {
        approved: market.competitive_context.approved_products,
        phase3: market.competitive_context.phase3_programs,
        phase2: 0,
        phase1: 0,
        preclinical: 0,
        withdrawnOrDiscontinued: 0,
        total: market.competitive_context.approved_products + market.competitive_context.phase3_programs,
      },
      referenceMechanisms,
      keyPrograms: [],
      majorCompetitors: ind.major_competitors,
      whiteSpace: [],
      keyInsight: market.competitive_context.differentiation_note,
      differentiationOpportunity: market.competitive_context.differentiation_note,
      dataFreshness: null,
    };
    sources.push({
      field: 'competition',
      origin: 'Terrain market-sizing competitive_context (fallback)',
      kind: 'terrain_engine',
    });
  }
  sources.push({
    field: 'competition.referenceMechanisms',
    origin: 'Terrain REFERENCE_MECHANISMS by therapy area',
    kind: 'terrain_reference',
  });
  sources.push({
    field: 'competition.majorCompetitors',
    origin: 'Terrain indication-map',
    kind: 'terrain_static',
    verified: ind.last_verified_year,
  });

  // ── Regulatory ───────────────────────────────────────────
  const taKey = ind.therapy_area.toLowerCase().replace(/[\s-]+/g, '_');
  const surrogates = VALIDATED_SURROGATES[taKey] ?? [];
  const crl = CRL_RECOVERY_DATA[taKey] ?? CRL_RECOVERY_DATA.default;
  const orphanEligible = ind.us_prevalence < ORPHAN_THRESHOLD_US;
  const stages: DevelopmentStage[] = ['preclinical', 'phase1', 'phase2', 'phase3', 'approved'];
  const likelihoodOfApproval = Object.fromEntries(
    stages.map((s) => [s, getLikelihoodOfApproval(ind.therapy_area, s, ind.name)]),
  ) as Record<DevelopmentStage, number>;
  const regulatory: DemandRegulatory = {
    validatedSurrogates: surrogates,
    pathwayNotes: buildPathwayNotes(ind, surrogates, orphanEligible),
    orphanEligible,
    crlRecovery: {
      therapyArea: CRL_RECOVERY_DATA[taKey] ? ind.therapy_area : 'default',
      historicalCrlRatePct: crl.historical_crl_rate_pct,
      avgMonthsToResubmission: crl.avg_months_to_resubmission,
      resubmissionApprovalRatePct: crl.resubmission_approval_rate_pct,
      commonReasons: crl.common_reasons,
    },
    likelihoodOfApproval,
  };
  if (!CRL_RECOVERY_DATA[taKey]) {
    assumptions.push(
      `No therapy-area CRL history for "${ind.therapy_area}"; regulatory.crlRecovery uses the cross-area default.`,
    );
  }
  sources.push(
    {
      field: 'regulatory.validatedSurrogates',
      origin: 'Terrain VALIDATED_SURROGATES (FDA endpoint guidances)',
      kind: 'terrain_reference',
    },
    {
      field: 'regulatory.crlRecovery',
      origin: 'Terrain CRL_RECOVERY_DATA (historical CRL/resubmission rates by therapy area)',
      kind: 'terrain_reference',
    },
    {
      field: 'regulatory.likelihoodOfApproval',
      origin: 'Terrain LoA tables (BIO/Informa/QLS 2011-2020 + indication-specific calibration)',
      kind: 'terrain_reference',
    },
    {
      field: 'regulatory.orphanEligible|pathwayNotes',
      origin: 'Derived: US prevalence vs Orphan Drug Act threshold; surrogate availability',
      kind: 'terrain_reference',
    },
  );

  return {
    identity,
    epidemiology,
    market: demandMarket,
    competition,
    regulatory,
    assumptions,
    sources,
    asOf,
    generatedAt: now.toISOString(),
    contractVersion: '1.0',
  };
}
