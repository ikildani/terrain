# Terrain Demand Layer — API contract

Terrain is the demand layer of the Alaric outcomes program. Solidus (deal
intelligence) and Augur (investor intelligence) read indication demand from
Terrain through the keyed v1 API described here. Nothing in this contract is
computed outside Terrain's existing engines; the demand layer composes them.

- Code: `src/lib/demand/indication-registry.ts`, `src/lib/demand/demand-layer.ts`
- Routes: `src/app/api/v1/demand/route.ts`, `src/app/api/v1/demand/[indication]/route.ts`
- Contract version: `1.0` (echoed as `contractVersion` in every response)

---

## 1. Authentication, scope, limits

Identical to the other `/api/v1/*` routes.

| Item         | Value                                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Header       | `Authorization: Bearer sk_terrain_...`                                                                                                   |
| Scope        | `demand` (new). Wildcard `*` keys pass.                                                                                                  |
| Rate limit   | Per-key `rate_limit_rpm` (default 60/min), shared bucket `v1:<keyId>` with other v1 routes                                               |
| Error shape  | `{ "success": false, "error": "...", "errors"?: [...] }` with `X-Request-Id` header                                                      |
| Status codes | 401 missing/invalid key · 403 missing scope · 429 rate limited · 400 bad territory/asOf · 404 unresolved indication · 500 engine failure |

### Scope decision

Scopes are an explicit `TEXT[]` on `api_keys` (default `'{*}'`). There is no
migration or backfill mechanism for new scopes in this codebase: a key created
with `['market_sizing']` never gains `reports`, and the same holds for
`demand`. So:

- Keys with `*` (the default at creation) get `demand` automatically.
- Keys with an explicit scope list must be updated (`PATCH /api/workspaces/:id/api-keys/:keyId`) to add `demand`.
- `demand` was added to `VALID_SCOPES` in both api-key routes and to
  `AVAILABLE_SCOPES` in `CreateApiKeyModal.tsx`. No database change.

---

## 2. `GET /api/v1/demand` — supported indications

Lists every Terrain indication with both keys. Cached 24 h (`Cache-Control: private, max-age=86400`
plus an in-process memo).

Query parameters:

| Param          | Effect                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `therapy_area` | Filter to one Terrain therapy-area slug (`oncology`, `neurology`, ...) |
| `mapped=true`  | Only indications that have a Solidus key                               |

```http
GET /api/v1/demand?therapy_area=neurology&mapped=true
Authorization: Bearer sk_terrain_...
```

```json
{
  "success": true,
  "data": {
    "contractVersion": "1.0",
    "count": 20,
    "coverage": {
      "mappedKeys": 178,
      "exactKeys": 162,
      "proxyKeys": 16,
      "unmappedKeys": 93,
      "totalKeys": 271,
      "aliasKeysMapped": 26,
      "aliasKeysUnmapped": 4,
      "terrainIndications": 236,
      "terrainIndicationsWithSolidusKey": 184
    },
    "territories": ["US", "EU5", "Germany", "…", "Global", "us_only", "europe", "ex_us", "…"],
    "indications": [
      {
        "solidusKey": "alzheimers",
        "solidusAliases": ["alzheimers"],
        "terrainName": "Alzheimer's Disease",
        "therapyArea": "neurology",
        "match": "exact"
      },
      {
        "solidusKey": "tremor",
        "solidusAliases": ["tremor"],
        "terrainName": "Essential Tremor",
        "therapyArea": "neurology",
        "match": "proxy",
        "note": "Solidus \"Movement Disorders / Tremor\"; Terrain figures are essential tremor only."
      },
      {
        "solidusKey": null,
        "solidusAliases": [],
        "terrainName": "Progressive Supranuclear Palsy",
        "therapyArea": "neurology",
        "match": null
      }
    ],
    "unmappedSolidusKeys": [
      { "solidusKey": "all", "label": "Acute Lymphoblastic Leukemia (ALL)", "reason": "No ALL entry in Terrain." },
      "…"
    ]
  }
}
```

---

## 3. `GET /api/v1/demand/:indication` — demand profile

`:indication` is a Solidus slug (`alzheimers`, `lung_nsclc`, `nashMash`), a
Terrain name (`Alzheimer's Disease`) or a Terrain synonym (`NSCLC`). Slug
lookup is case- and punctuation-insensitive. Cached 1 h per
(indication, territory): `Cache-Control: private, max-age=3600`, `X-Cache: HIT|MISS`.

Query parameters:

| Param       | Default | Accepts                                                                                                                                                                                                                                                                                                                   |
| ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `territory` | `US`    | Terrain codes `US, EU5, Germany, France, Italy, Spain, UK, Japan, China, Canada, Australia, South Korea, Brazil, India, Mexico, Taiwan, Saudi Arabia, Israel, RoW, Global` or Solidus codes `us_only, global, europe, china, japan, canada, australia, south_korea, row, ex_us, us_eu, us_japan, apac_ex_cj, latam, mena` |
| `asOf`      | today   | `YYYY-MM-DD`. Terrain serves the current snapshot only; a mismatch is flagged in `assumptions[]`.                                                                                                                                                                                                                         |

```http
GET /api/v1/demand/alzheimers?territory=us_eu
Authorization: Bearer sk_terrain_...
```

Abridged real response (generated 2026-09-25):

```json
{
  "success": true,
  "data": {
    "identity": {
      "terrainName": "Alzheimer's Disease",
      "solidusKey": "alzheimers",
      "solidusAliases": ["alzheimers"],
      "therapyArea": "neurology",
      "therapyAreaLabel": "Neurology",
      "icd10": ["G30", "G30.0", "G30.1", "G30.8", "G30.9"],
      "synonyms": ["Alzheimer's", "AD", "Alzheimer disease", "dementia Alzheimer type"],
      "resolvedBy": "solidus_key",
      "match": "exact"
    },
    "epidemiology": {
      "population": "US",
      "prevalence": 6800000,
      "incidence": 500000,
      "diagnosisRate": 0.45,
      "treatmentRate": 0.6,
      "diagnosed": 3060000,
      "treated": 1836000,
      "severityDistribution": { "mci": 0.2, "mild": 0.3, "moderate": 0.3, "severe": 0.2 },
      "pediatricPrevalence": null,
      "pediatricShare": null,
      "confidence": "medium",
      "verifiedYear": 2024,
      "source": "Alzheimer's Association 2024 Facts and Figures"
    },
    "market": {
      "territory": { "requested": "us_eu", "geographies": ["US", "EU5"] },
      "currency": "USD",
      "tamUs": { "valueUsd": 77110000000, "display": { "value": 77.11, "unit": "B" }, "confidence": "high" },
      "samUs": { "valueUsd": 30070000000, "display": { "value": 30.07, "unit": "B" }, "confidence": "high" },
      "somUs": {
        "valueUsd": 3430000000,
        "display": { "value": 3.43, "unit": "B" },
        "rangeUsd": [1430000000, 5140000000],
        "confidence": "medium"
      },
      "tamRequestedTerritory": {
        "valueUsd": 107950000000,
        "display": { "value": 107.95, "unit": "B" },
        "confidence": "high"
      },
      "territoryBreakdown": [
        {
          "code": "US",
          "territory": "United States",
          "tamUsd": 77110000000,
          "population": 336000000,
          "marketMultiplier": 1,
          "regulatoryStatus": "FDA NDA/BLA pathway. …"
        },
        {
          "code": "EU5",
          "territory": "EU5 (Combined)",
          "tamUsd": 30840000000,
          "population": 330000000,
          "marketMultiplier": 0.4,
          "regulatoryStatus": "EMA centralized MAA. …"
        }
      ],
      "peakSalesUsdM": { "low": 1428, "base": 3428, "high": 5143 },
      "priceBenchmark": {
        "wacAnnualUsd": { "conservative": 27350, "base": 56000, "premium": 82500 },
        "grossToNet": 0.25,
        "comparableCount": 8,
        "comparables": [
          {
            "drug": "Kisunla",
            "company": "Eli Lilly",
            "launchYear": 2024,
            "launchWacUsd": 32000,
            "mechanism": "Anti-amyloid mAb (N3pG)"
          },
          {
            "drug": "Leqembi",
            "company": "Eisai/Biogen",
            "launchYear": 2023,
            "launchWacUsd": 26500,
            "mechanism": "Anti-amyloid mAb"
          }
        ],
        "rationale": "Based on 23 approved neurology comparables. WAC range: $27K (25th pctl) to $83K (75th pctl), base $56K (median). Net after 25% GTN."
      },
      "cagr5yrPct": 14.2,
      "growthDriver": "Anti-amyloid approvals opening premium treatment market, …",
      "patientFunnel": {
        "us_prevalence": 6800000,
        "diagnosed": 3060000,
        "treated": 1836000,
        "adherent": "…",
        "addressable": "…",
        "capturable": "…"
      },
      "engineInputs": { "developmentStage": "phase2", "pricingAssumption": "base", "launchYear": 2028 }
    },
    "competition": {
      "densityScore": 5,
      "densityLabel": "Moderate",
      "countsByPhase": {
        "approved": 3,
        "phase3": 2,
        "phase2": 0,
        "phase1": 4,
        "preclinical": 1,
        "withdrawnOrDiscontinued": 0,
        "total": 10
      },
      "referenceMechanisms": [
        "anti_amyloid",
        "anti_alpha_synuclein",
        "anti_tau",
        "small_molecule_tki",
        "gene_therapy",
        "antisense_oligonucleotide",
        "nmda_modulator",
        "serotonin_modulator"
      ],
      "keyPrograms": [
        {
          "company": "Eisai/Biogen",
          "asset": "Leqembi",
          "mechanism": "Anti-amyloid beta antibody (protofibril-selective)",
          "phase": "Approved",
          "differentiationScore": 3,
          "evidenceStrength": 9,
          "source": "FDA label; Clarity AD trial; Eisai 2024"
        }
      ],
      "majorCompetitors": [
        "Leqembi (lecanemab, Eisai/Biogen)",
        "Kisunla (donanemab, Eli Lilly)",
        "Memantine (generic)",
        "Donepezil (generic)"
      ],
      "whiteSpace": ["No Anti Tau assets in Alzheimer's Disease — potential novel mechanism opportunity", "…"],
      "keyInsight": "The Alzheimer's Disease landscape comprises 10 tracked competitive assets: 3 approved, 2 in late-stage development.",
      "differentiationOpportunity": "…",
      "dataFreshness": {
        "clinical_trials": null,
        "fda_approvals": null,
        "ema_approvals": null,
        "literature": null,
        "competitor_database": "2026-08-01",
        "market_intelligence": "2026-09-25T16:15:29.574Z"
      }
    },
    "regulatory": {
      "validatedSurrogates": [
        {
          "endpoint": "Amyloid PET Clearance",
          "status": "reasonably_likely",
          "fda_guidance": "FDA AA Pathway for Alzheimer's"
        },
        "…"
      ],
      "pathwayNotes": [
        "Not orphan-eligible on prevalence: US prevalence 6,800,000 exceeds 200,000.",
        "Accelerated Approval feasible: 4 FDA-accepted surrogate endpoints in neurology (…)."
      ],
      "orphanEligible": false,
      "crlRecovery": {
        "therapyArea": "neurology",
        "historicalCrlRatePct": 18,
        "avgMonthsToResubmission": 14,
        "resubmissionApprovalRatePct": 62,
        "commonReasons": ["Failed primary endpoint (cognitive decline)", "…"]
      },
      "likelihoodOfApproval": { "preclinical": 0.02, "phase1": 0.03, "phase2": 0.06, "phase3": 0.3, "approved": 1 }
    },
    "assumptions": [
      "development_stage defaulted to \"phase2\" (bare indication; drives peak-share band and LoA).",
      "pricing_assumption defaulted to \"base\" (therapy-area comparable WAC).",
      "launch_year defaulted to 2028 (request year + 2).",
      "No mechanism, subtype or patient segment supplied: addressability and competitive-response modifiers use engine defaults.",
      "TAM/SAM/SOM and peak sales are US figures; territory only changes `market.territoryBreakdown` and `market.tamRequestedTerritory`.",
      "market-sizing: …"
    ],
    "sources": [
      {
        "field": "epidemiology.prevalence",
        "origin": "Alzheimer's Association 2024 Facts and Figures",
        "kind": "terrain_static",
        "verified": 2024
      },
      {
        "field": "market.tamUs|samUs|somUs|peakSalesUsdM|patientFunnel",
        "origin": "Terrain calculateMarketSizing (market-sizing engine)",
        "kind": "terrain_engine"
      },
      { "field": "competition", "origin": "Terrain analyzeCompetitiveLandscape (…)", "kind": "terrain_engine" },
      { "field": "regulatory.likelihoodOfApproval", "origin": "Terrain LoA tables (…)", "kind": "terrain_reference" }
    ],
    "asOf": "2026-09-25",
    "generatedAt": "2026-09-25T16:15:29.601Z",
    "contractVersion": "1.0"
  }
}
```

### 404 — unresolved indication

Returned for unknown inputs and for Solidus keys that are explicitly unmapped.
Always carries the nearest three Terrain indications (substring hits first,
then character-bigram similarity).

```json
{
  "success": false,
  "error": "Solidus key \"thymoma\" has no Terrain counterpart: No thymic epithelial tumour entry in Terrain.",
  "suggestions": [
    { "terrainName": "Thyroid Cancer", "solidusKey": "thyroid", "therapyArea": "oncology" },
    { "terrainName": "Mesothelioma", "solidusKey": "mesothelioma", "therapyArea": "oncology" },
    { "terrainName": "Multiple Myeloma", "solidusKey": "myeloma", "therapyArea": "oncology" }
  ]
}
```

### 400 — unsupported territory

```json
{ "success": false, "error": "Unknown territory \"mars\". Supported: US, EU5, …, mena.", "errors": ["US", "EU5", "…"] }
```

---

## 4. Field semantics

| Block          | What it is                                                                                                                                                | Origin                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `identity`     | Terrain name, canonical Solidus slug (+ aliases), therapy area, ICD-10, how the request resolved (`resolvedBy`) and match quality (`exact`/`proxy`)       | `INDICATION_DATA` + registry                                                                           |
| `epidemiology` | **US** prevalence/incidence, diagnosis and treatment rates, derived diagnosed/treated counts, severity mix, pediatric share, confidence, verified year    | `INDICATION_DATA` (per-indication source string in `source`)                                           |
| `market`       | US TAM/SAM/SOM (USD), TAM for the requested territory + breakdown, peak sales band (USD M), WAC bands and comparables, gross-to-net, CAGR, patient funnel | `calculateMarketSizing` with `DEMAND_DEFAULTS`; territory multipliers; `PRICING_BENCHMARKS`            |
| `competition`  | Crowding score/label, counts by phase, therapy-area reference mechanisms, top-10 programs, white space, key insight                                       | `analyzeCompetitiveLandscape` (+ live CT.gov/FDA/EMA caches when reachable) and `REFERENCE_MECHANISMS` |
| `regulatory`   | Validated surrogates, orphan eligibility, pathway notes, CRL/resubmission history, cumulative LoA by stage                                                | `VALIDATED_SURROGATES`, `CRL_RECOVERY_DATA`, `getLikelihoodOfApproval`                                 |
| `assumptions`  | Every default the demand layer or the engine applied                                                                                                      | —                                                                                                      |
| `sources`      | Origin of every figure (`terrain_static` / `terrain_engine` / `terrain_live` / `terrain_reference`)                                                       | —                                                                                                      |
| `asOf`         | ISO date of the data snapshot. **This is the only value Solidus should persist beside the slug.**                                                         | —                                                                                                      |

### Defaults (`DEMAND_DEFAULTS`)

| Default             | Value    | Why                                                                                |
| ------------------- | -------- | ---------------------------------------------------------------------------------- |
| `developmentStage`  | `phase2` | Terrain's own engine default; modal deal stage. Drives the SOM share band and LoA. |
| `pricingAssumption` | `base`   | Median WAC of therapy-area comparables.                                            |
| `launchYearOffset`  | +2 years | Engine default.                                                                    |
| `territory`         | `US`     | US is the reference market for headline figures.                                   |
| `keyProgramLimit`   | 10       | Programs listed, ordered Approved → Phase 3 → … then by differentiation.           |
| `comparableLimit`   | 5        | Pricing comparables listed.                                                        |

Every default is echoed in `assumptions[]`. A consumer that has a stage or
mechanism should call `/api/v1/analyze/market` directly for a tailored run;
the demand profile is the indication-level baseline.

### Known limitations

- Epidemiology is US-only in Terrain; territory changes the market breakdown, not the patient counts.
- `validatedSurrogates` and `crlRecovery` are therapy-area level (e.g. Alzheimer's lists MS relapse-rate endpoints). Indication-level surrogate tables are a follow-up.
- Live competitor enrichment (ClinicalTrials.gov / FDA / EMA caches) degrades to the static competitor database when the cache tables are unreachable; `competition.dataFreshness` shows `null` for those feeds.
- Historical snapshots are not served; `asOf` is always the current snapshot.

---

## 5. Solidus ↔ Terrain mapping coverage

Universe: the **271** keys in Solidus `data/epidemiology.json`, plus the 30
`INDICATION_REGISTRY`-only values that have no epidemiology row (treated as
aliases).

| Bucket                                                        | Count                 |
| ------------------------------------------------------------- | --------------------- |
| Epidemiology keys mapped                                      | **178 / 271** (65.7%) |
| — exact (same disease entity)                                 | 162                   |
| — proxy (Terrain covers a subset/superset; `note` says which) | 16                    |
| Epidemiology keys unmapped                                    | 93                    |
| Registry-only aliases mapped                                  | 26 / 30               |
| Terrain indications with a Solidus key                        | 184 / 236             |

### Proxy mappings (16)

| Solidus key                    | Terrain indication                   | Caveat                                          |
| ------------------------------ | ------------------------------------ | ----------------------------------------------- |
| `sarcoma`                      | Soft Tissue Sarcoma                  | bone sarcomas keyed separately                  |
| `mpn`                          | Myelofibrosis                        | PV keyed separately (`polycythemiaVera`)        |
| `tCellLymphoma`                | Cutaneous T-Cell Lymphoma            | PTCL not covered                                |
| `tremor`                       | Essential Tremor                     | other movement disorders not covered            |
| `peripheralNeuropathy`         | Diabetic Peripheral Neuropathy       | largest subset only                             |
| `ocd`                          | Obsessive-Compulsive Disorder        | GAD is a separate Terrain indication            |
| `pain`                         | Neuropathic Pain                     | `chronicPain` maps to Chronic Pain              |
| `nephroticSyndrome`            | Minimal Change Disease               | FSGS / MN keyed separately                      |
| `glycogenStorage`              | Glycogen Storage Disease Type I      | GSD II = `pompe`                                |
| `familialHypercholesterolemia` | Heterozygous FH                      | HoFH is a separate Terrain indication           |
| `mpsDisorders`                 | Hunter Syndrome (MPS II)             | Hurler / MPS I is a separate Terrain indication |
| `attrAmyloidosis`              | Transthyretin Amyloid Cardiomyopathy | ATTR-PN not covered                             |
| `cardiomyopathy`               | Dilated Cardiomyopathy               | HCM = `hypertrophicCardiomyopathy`              |
| `amrBacterial`                 | MRSA Infections                      | other resistant pathogens not covered           |
| `dengueMalaria`                | Malaria                              | dengue not covered                              |
| `uveiticMacular`               | Uveitis                              | uveitis overall, not UME specifically           |

### Unmapped epidemiology keys (93)

Oncology (17): `smallBowel, neuroendocrine, uvealMelanoma, thymoma, retinoblastoma, rhabdomyosarcoma, vulvar, all, marginalZone, primaryCNSLymphoma, systemicMastocytosis, cmml, hairyCell, amyloidosisAL, castlemanDisease, aplasticAnemia, bpdcn`

Neurology / psychiatry (16): `tbi, rareNeuro, autism, myotonicDystrophy, spinalCordInjury, frontotemporal, lewyBody, fragileX, cdkl5, neurofibromatosis, restlessLeg, insomnia, lgmd, fshd, gbs, ataxiaTelangiectasia`

Immunology (14): `ibd_broad, aancaVasculitis, rareAutoimmune, gvhd, organTransplant, thyroidEye, behcets, polymyalgiaRheumatica, foodAllergy, dermatomyositis, antiphospholipid, egpa, systemicJIA, primaryImmunodeficiency`

Metabolic / rare (9): `metabolicSyndrome, lipodystrophy, rareMetabolic, hyperoxaluria, asmd, cystinosis, krabbe, hemochromatosis, mitochondrialDisease`

Cardiovascular (8): `coronaryArteryDisease, aorticStenosis, resistantHypertension, myocarditis, cardiacArrhythmia, atherosclerosis, cardiacFibrosis, longQtSyndrome`

Infectious (6): `covid, cmvInfection, ebv, norovirus, zika, lymeDisease`

Ophthalmology (9): `diabeticRetinopathy, retinalVeinOcclusion, stargardt, myopiaProgression, keratoconus, presbyopia, cornealDystrophy, opticNeuritis, achromatopsia`

Women's health (14): `uterineFibroids, preeclampsia, prematureLabor, fertilityArt, vulvodynia, cervicalDysplasia, contraceptionNovel, breastCancerPrevention, gestationalDiabetes, hyperemesisGravidarum, placentaAccreta, vaginalAtrophy, menstrualDisorders, ovarianCancerScreening`

Registry-only aliases unmapped (4): `krasMutant, her2Low, msiHigh` (biomarker-defined pan-tumour keys) and `microscopicColitis`.

The per-key reason is served by `GET /api/v1/demand` (`unmappedSolidusKeys`)
and by `listUnmapped()`.

Highest-value gaps to close on the Terrain side (each would flip a Solidus key
that has deal flow): ALL, NET, uveal melanoma, GVHD, ANCA vasculitis, FTD/DLB,
autism, uterine fibroids, diabetic retinopathy, COVID-19.

---

## 6. Consumer rule for Solidus (and Augur)

1. **Call by Solidus slug.** `GET /api/v1/demand/<slug>` — never by Terrain
   name. The registry owns the translation; Solidus never learns Terrain names.
2. **Store nothing but the slug and the `asOf`.** Do not persist prevalence,
   TAM, crowding or any other figure. Re-read the profile when needed (it is
   cached 1 h server-side) and compare `asOf` to decide whether a cached view is
   stale.
3. Treat `match: "proxy"` as a warning: show `identity.matchNote` next to any
   figure derived from the profile.
4. Treat a 404 as "no demand baseline"; surface the `suggestions` only to an
   operator, never auto-select one.
5. Do not derive new numbers from the profile outside Terrain's `assumptions`
   (e.g. do not rescale TAM by territory yourself; request `?territory=`).

Programmatic access from another Terrain module: `buildDemandProfile(keyOrName, { territory, asOf })`
and `resolveIndicationKey(keyOrName)`; both are pure with respect to the database
(engine live-data reads are optional and fail soft).

---

## 7. Follow-ups

- **Solidus patient funnel**: replace `epidemiology.json` reads with
  `epidemiology` + `market.patientFunnel` from this endpoint (prevalence →
  diagnosed → treated → adherent → addressable → capturable), keyed by slug.
- **Solidus pipeline map**: source `competition.countsByPhase`,
  `keyPrograms` and `whiteSpace` from here instead of its own competitor lists.
- **Augur**: consume `market.peakSalesUsdM`, `regulatory.likelihoodOfApproval`
  and `competition.densityScore` as the demand inputs to outcome prediction;
  `sources[]` gives the audit trail Augur's explainability layer needs.
- Terrain: indication-level surrogate endpoints; add the ten gap indications
  above; consider a `POST` variant that accepts stage/mechanism for a tailored
  demand profile.
