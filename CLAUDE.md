# TERRAIN — Market Opportunity Intelligence Platform
## Claude Code Master Context File

> **Build standard**: Investment-bank quality. Every screen should feel like it belongs inside a Bloomberg Terminal or a Goldman Sachs research portal. No startup aesthetics. No generic SaaS patterns. This is institutional-grade intelligence infrastructure for biotech professionals making $50M+ decisions.

---

## Project Overview

**Product**: Terrain — Market Opportunity Intelligence Platform  
**URL**: terrain.ambrosiaventures.co  
**Parent Brand**: Ambrosia Ventures (boutique life sciences M&A and strategy advisory)  
**Ecosystem**: Tool #2 in the 6-tool AlaricAI pre-launch suite  
**Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Stripe  

**What Terrain does**: Gives biotech founders and BD executives instant, data-driven answers to the market questions that precede every major licensing deal, M&A transaction, or partnership discussion. It turns 3 weeks of analyst research into a 90-second intelligence report.

---

## Brand & Design System

### Colors (use CSS variables, never hardcoded hex)
```css
--navy-950: #04080F;       /* Page background */
--navy-900: #07101E;       /* Card backgrounds */
--navy-800: #0D1B2E;       /* Elevated surfaces */
--navy-700: #102236;       /* Borders, dividers */
--teal-500: #00C9A7;       /* Primary accent, CTAs, active states */
--teal-400: #00E4BF;       /* Hover states */
--teal-900: #002E27;       /* Teal surface backgrounds */
--white: #F0F4F8;          /* Primary text */
--slate-300: #94A3B8;      /* Secondary text */
--slate-500: #64748B;      /* Muted text */
--amber-400: #FBBF24;      /* Warnings, opportunity signals */
--red-400: #F87171;        /* Alerts, risk signals */
--emerald-400: #34D399;    /* Positive signals, growth */
```

### Typography
```
Display font:    "DM Serif Display" (headings, hero text, report titles)
Body font:       "Sora" (all body copy, UI labels, navigation)
Mono font:       "DM Mono" (data values, metrics, code, table numbers)
```

Load from Google Fonts:
```
https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Sora:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap
```

### Design Principles
- **Data density**: Show more information than typical SaaS tools. Think Bloomberg, not Notion.
- **Texture over flatness**: Use `noise.png` SVG texture overlays at 3-5% opacity on dark surfaces.
- **No gradients for decoration**: Gradients only for data visualization and focus glow effects.
- **Institutional tables**: Every data table should look like it came from a Morgan Stanley equity research report.
- **Numbers in mono**: Every metric, percentage, dollar value, and count uses DM Mono font.
- **Teal as signal**: Teal (#00C9A7) means "active", "positive", "selected", "primary action". Never use it decoratively.

### Noise texture (use inline SVG for the filter):
```css
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
}
```

---

## Tech Stack (Exact Versions)

```json
{
  "framework": "Next.js 14 with App Router",
  "language": "TypeScript 5+",
  "styling": "Tailwind CSS 3.4+",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth (email/password + magic link)",
  "payments": "Stripe (subscriptions)",
  "charts": "Recharts or Tremor (data visualization)",
  "icons": "Lucide React",
  "animations": "Framer Motion",
  "forms": "React Hook Form + Zod",
  "state": "Zustand (client) + React Query (server state)",
  "email": "Resend",
  "deployment": "Vercel"
}
```

---

## Repository Structure

```
terrain/
├── CLAUDE.md                          ← This file
├── .env.local                         ← Environment variables (never commit)
├── .env.example                       ← Safe template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/                               ← Next.js App Router
│   ├── layout.tsx                     ← Root layout (fonts, providers)
│   ├── page.tsx                       ← Landing page
│   ├── globals.css                    ← CSS variables, base styles
│   │
│   ├── (auth)/                        ← Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts          ← Supabase auth callback
│   │
│   ├── (dashboard)/                   ← Protected dashboard route group
│   │   ├── layout.tsx                 ← Dashboard shell (sidebar + topbar)
│   │   ├── dashboard/page.tsx         ← Home dashboard
│   │   ├── market-sizing/
│   │   │   ├── page.tsx               ← Market Sizing module
│   │   │   └── [reportId]/page.tsx    ← Saved report view
│   │   ├── competitive/page.tsx       ← Competitive Landscape
│   │   ├── pipeline/page.tsx          ← Pipeline Intelligence
│   │   ├── partners/page.tsx          ← Partner Discovery
│   │   ├── regulatory/page.tsx        ← Regulatory Intelligence
│   │   ├── alerts/page.tsx            ← Deal Alerts
│   │   ├── reports/page.tsx           ← Saved Reports library
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── billing/page.tsx
│   │       └── team/page.tsx
│   │
│   └── api/
│       ├── analyze/
│       │   ├── market/route.ts        ← Market sizing engine
│       │   ├── competitive/route.ts   ← Competitive analysis engine
│       │   ├── pipeline/route.ts      ← Pipeline search
│       │   ├── partners/route.ts      ← Partner matching
│       │   └── regulatory/route.ts    ← FDA/EMA pathway analysis
│       ├── reports/
│       │   ├── route.ts               ← CRUD reports
│       │   └── [id]/route.ts
│       ├── alerts/
│       │   └── route.ts
│       ├── stripe/
│       │   ├── checkout/route.ts
│       │   ├── portal/route.ts
│       │   └── webhook/route.ts
│       └── usage/route.ts             ← Track feature usage
│
├── components/
│   ├── ui/                            ← Base design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Table.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Progress.tsx
│   │   └── Tabs.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx                ← Left navigation
│   │   ├── Topbar.tsx                 ← Top bar with search + user menu
│   │   ├── PageHeader.tsx             ← Consistent page headers
│   │   └── DashboardShell.tsx         ← Main dashboard wrapper
│   │
│   ├── market-sizing/
│   │   ├── MarketSizingForm.tsx       ← Primary input form
│   │   ├── TAMChart.tsx               ← TAM/SAM/SOM waterfall
│   │   ├── PatientFunnelChart.tsx     ← Patient population funnel
│   │   ├── GeographyBreakdown.tsx     ← Territory-level market data
│   │   ├── MarketGrowthChart.tsx      ← CAGR projection chart
│   │   └── MarketSizingReport.tsx     ← Full report assembly
│   │
│   ├── competitive/
│   │   ├── LandscapeMap.tsx           ← Visual competitive map
│   │   ├── CompetitorCard.tsx         ← Individual competitor profile
│   │   ├── PipelineTable.tsx          ← Competitor pipeline table
│   │   └── MarketShareChart.tsx
│   │
│   ├── pipeline/
│   │   ├── PipelineSearchForm.tsx
│   │   ├── PipelineTable.tsx          ← Main pipeline data table
│   │   ├── PhaseDistributionChart.tsx
│   │   └── AssetCard.tsx
│   │
│   ├── partners/
│   │   ├── PartnerSearchForm.tsx
│   │   ├── PartnerCard.tsx
│   │   ├── DealHistoryTable.tsx
│   │   └── PartnerMatchScore.tsx
│   │
│   ├── regulatory/
│   │   ├── PathwaySelector.tsx
│   │   ├── TimelineChart.tsx
│   │   └── RegulatoryRiskCard.tsx
│   │
│   ├── alerts/
│   │   ├── AlertFeed.tsx
│   │   ├── AlertCard.tsx
│   │   └── AlertConfigForm.tsx
│   │
│   └── shared/
│       ├── UpgradeGate.tsx            ← Paywall component for Pro features
│       ├── ExportButton.tsx           ← PDF/CSV export
│       ├── SaveReportButton.tsx
│       ├── DataSourceBadge.tsx        ← Show data source attribution
│       └── ConfidentialFooter.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  ← Browser Supabase client
│   │   ├── server.ts                  ← Server Supabase client
│   │   └── middleware.ts
│   ├── stripe.ts                      ← Stripe client
│   ├── analytics/
│   │   ├── market-sizing.ts           ← Market sizing calculation engine
│   │   ├── competitive.ts             ← Competitive analysis logic
│   │   ├── pipeline.ts                ← Pipeline data processing
│   │   ├── partners.ts                ← Partner matching algorithm
│   │   └── regulatory.ts             ← Regulatory pathway logic
│   ├── data/
│   │   ├── indication-map.ts          ← Indication → ICD-10 → prevalence mapping
│   │   ├── territory-multipliers.ts   ← Geographic market multipliers
│   │   ├── pricing-benchmarks.ts      ← Drug pricing by therapy area
│   │   └── regulatory-pathways.ts    ← FDA/EMA pathway definitions
│   └── utils/
│       ├── format.ts                  ← Number, currency, date formatters
│       ├── cn.ts                      ← className utility (clsx + tailwind-merge)
│       └── api.ts                     ← API fetch helpers
│
├── hooks/
│   ├── useUser.ts                     ← Current user + subscription
│   ├── useSubscription.ts             ← Subscription tier checks
│   ├── useReports.ts                  ← Saved reports CRUD
│   └── useAlerts.ts                   ← Alert management
│
├── types/
│   ├── database.ts                    ← Supabase generated types
│   ├── market.ts                      ← Market analysis types
│   ├── pipeline.ts                    ← Pipeline data types
│   └── api.ts                         ← API request/response types
│
└── supabase/
    ├── migrations/                    ← SQL migration files
    └── seed.sql                       ← Development seed data
```

---

## Database Schema (Supabase / PostgreSQL)

Run these migrations in order via `supabase/migrations/`:

### Migration 001 — Core Auth & Users

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,                          -- 'founder' | 'bd_executive' | 'investor' | 'corp_dev'
  therapy_areas TEXT[],               -- ['oncology', 'neurology', 'rare_disease']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migration 002 — Subscriptions

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro' | 'team'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'trialing' | 'canceled' | 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

### Migration 003 — Usage Tracking

```sql
CREATE TABLE public.usage_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,              -- 'market_sizing' | 'competitive' | 'pipeline' | 'partners' | 'regulatory' | 'alerts'
  indication TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly usage counts (materialized for performance)
CREATE VIEW public.monthly_usage AS
SELECT
  user_id,
  feature,
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS usage_count
FROM public.usage_events
GROUP BY user_id, feature, DATE_TRUNC('month', created_at);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.usage_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.usage_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Migration 004 — Reports

```sql
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,          -- 'market_sizing' | 'competitive' | 'pipeline' | 'full'
  indication TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}', -- The form inputs used to generate
  outputs JSONB NOT NULL DEFAULT '{}', -- The calculated results
  status TEXT DEFAULT 'draft',        -- 'draft' | 'final'
  is_starred BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- RLS for team plan (org-level sharing)
CREATE TABLE public.report_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT DEFAULT 'view',     -- 'view' | 'edit'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 005 — Alerts

```sql
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,           -- 'competitor_filing' | 'partner_deal' | 'market_shift' | 'trial_update' | 'fda_action'
  indication TEXT,
  company TEXT,
  filters JSONB DEFAULT '{}',         -- Specific alert configuration
  is_active BOOLEAN DEFAULT TRUE,
  frequency TEXT DEFAULT 'weekly',    -- 'realtime' | 'daily' | 'weekly'
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.alert_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  source_url TEXT,
  signal_type TEXT,                   -- 'opportunity' | 'threat' | 'neutral'
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.alerts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own alert events"
  ON public.alert_events FOR ALL USING (auth.uid() = user_id);
```

---

## Subscription Tiers & Access Control

```typescript
// lib/subscription.ts

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      market_sizing: { limit: 3 },          // 3 reports/month
      competitive: { limit: 1 },             // 1 landscape/month
      pipeline: { access: true, limit: 5 }, // 5 searches/month
      partners: { access: false },
      regulatory: { access: false },
      alerts: { access: false },
      reports_saved: { limit: 3 },
      export_pdf: { access: false },
      export_csv: { access: false },
    }
  },
  pro: {
    name: 'Pro',
    price: 299,                              // $/month
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      market_sizing: { limit: -1 },          // Unlimited
      competitive: { limit: -1 },
      pipeline: { access: true, limit: -1 },
      partners: { access: true },
      regulatory: { access: true },
      alerts: { access: true, limit: 10 },   // 10 active alerts
      reports_saved: { limit: -1 },
      export_pdf: { access: true },
      export_csv: { access: true },
    }
  },
  team: {
    name: 'Team',
    price: 799,                              // $/month
    stripe_price_id: process.env.STRIPE_TEAM_PRICE_ID,
    seats: 5,
    features: {
      // Everything in Pro, plus:
      team_sharing: { access: true },
      api_access: { access: true },
      custom_alerts: { access: true, limit: -1 },
      white_label: { access: false },        // Enterprise only
    }
  }
} as const;
```

### Paywall Gate Component

```tsx
// components/shared/UpgradeGate.tsx
// Wrap any Pro feature with this component
// Shows blurred preview + upgrade prompt when user is on free tier

interface UpgradeGateProps {
  feature: keyof typeof PLANS.pro.features;
  children: React.ReactNode;
  preview?: React.ReactNode;  // Optional blurred preview content
}
```

---

## Core Modules — Detailed Specifications

---

### Module 1: Market Sizing Engine

**Route**: `/dashboard/market-sizing`

**What it does**: Takes an indication + development stage as input, outputs structured TAM/SAM/SOM with methodology and sourcing.

**Input Form Fields**:
```typescript
interface MarketSizingInput {
  indication: string;                  // "Non-Small Cell Lung Cancer" — autocomplete from indication list
  subtype: string;                     // "EGFR+ Stage III/IV"
  geography: string[];                 // ['US', 'EU5', 'Japan', 'China', 'RoW']
  development_stage: DevelopmentStage; // 'preclinical' | 'phase1' | 'phase2' | 'phase3' | 'approved'
  mechanism: string;                   // "KRAS G12C inhibitor"
  patient_segment: string;             // "2L+ after platinum-based chemo"
  pricing_assumption: 'conservative' | 'base' | 'premium';
  launch_year: number;                 // Expected launch year (affects projections)
}
```

**Output Structure**:
```typescript
interface MarketSizingOutput {
  summary: {
    tam_us: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    sam_us: { value: number; unit: 'B' | 'M'; confidence: 'high' | 'medium' | 'low' };
    som_us: { value: number; unit: 'B' | 'M'; range: [number, number] };
    global_tam: { value: number; unit: 'B' | 'M' };
    cagr_5yr: number;                  // Percentage
    peak_sales_estimate: { low: number; base: number; high: number };
  };
  patient_funnel: {
    us_prevalence: number;
    us_incidence: number;
    diagnosed: number;
    treated: number;
    addressable: number;               // Meets your patient_segment criteria
    capturable: number;                // Realistic market share
  };
  geography_breakdown: {
    territory: string;
    tam: number;
    population_prevalence: number;
    market_multiplier: number;         // vs US baseline
    regulatory_status: string;
  }[];
  pricing_analysis: {
    comparable_drugs: { name: string; launch_price: number; wac: number; net_price: number }[];
    recommended_wac: { low: number; base: number; high: number };
    payer_dynamics: string;
    pricing_rationale: string;
  };
  methodology: string;                 // Plain-language explanation of calculation approach
  data_sources: DataSource[];
  generated_at: string;
}
```

**Calculation Engine** (`lib/analytics/market-sizing.ts`):

```typescript
// Step 1: Indication lookup
// Map indication → ICD-10 codes → prevalence/incidence data
// Data: lib/data/indication-map.ts (static dataset, 150+ indications)

// Step 2: Patient funnel
// prevalence → diagnosed rate → treated rate → eligible (filter by subtype/line)
// Diagnosis rates vary by indication (e.g., 85% for NSCLC, 40% for early Parkinson's)

// Step 3: Geography scaling
// US baseline → apply territory multipliers from lib/data/territory-multipliers.ts
// EU5: Germany 1.3x, France 1.1x, Italy 0.9x, Spain 0.85x, UK 1.0x
// Japan: 0.55x, China: 1.8x (rapidly growing), RoW: 0.6x

// Step 4: Pricing benchmarks
// Match indication + mechanism to comparable drug pricing
// Source: lib/data/pricing-benchmarks.ts (150+ drug price database)
// Apply: conservative (80th percentile peers), base (median), premium (top quartile)

// Step 5: Market share modeling
// Stage-adjusted peak share: preclinical 2-8%, Phase 2 8-15%, Phase 3 15-25%
// Apply: competition density, mechanism differentiation score, geography priority

// Step 6: Revenue projection
// Build 10-year model: launch ramp (yr 1-3), peak (yr 4-7), maturity/LOE (yr 8-10)
// CAGR driven by: indication prevalence trend, pricing environment, competition
```

**Visualization Components**:
- `TAMChart`: Horizontal bar chart showing TAM → SAM → SOM as nested rectangles (not pie chart)
- `PatientFunnelChart`: Vertical waterfall funnel (prevalence → diagnosed → treated → addressable → capturable)
- `GeographyBreakdown`: Horizontal bar chart ranked by market size + data table below
- `MarketGrowthChart`: Line chart with 3 scenarios (bear/base/bull) on 10-year revenue projection

---

### Module 2: Competitive Landscape

**Route**: `/dashboard/competitive`

**Input**: Indication + Mechanism of Action

**Output**:
```typescript
interface CompetitiveLandscapeOutput {
  market_leaders: Competitor[];          // Approved products
  late_stage_pipeline: Competitor[];     // Phase 3
  mid_stage_pipeline: Competitor[];      // Phase 2
  early_pipeline: Competitor[];          // Phase 1 + Preclinical (Pro only)
  landscape_summary: {
    crowding_score: number;              // 1-10, 10 = extremely crowded
    differentiation_opportunity: string; // AI-generated insight
    white_space: string[];               // Uncontested patient segments
  };
  head_to_head_comparison: CompetitorAttribute[][];
}

interface Competitor {
  company: string;
  asset_name: string;
  mechanism: string;
  phase: string;
  indication_specifics: string;          // Exact label/trial population
  primary_endpoint: string;
  key_data: string;                      // Most recent readout summary
  partner: string | null;
  deal_value: string | null;
  strengths: string[];
  weaknesses: string[];
  source: string;
  last_updated: string;
}
```

**Visualization**:
- `LandscapeMap`: 2x2 scatter plot — X axis: Differentiation, Y axis: Clinical Evidence Strength. Each bubble = one competitor, sized by estimated deal value / market cap. Color = phase.
- `PipelineTable`: Sortable, filterable table with all competitors. Columns: Company, Asset, Phase, MoA, Endpoint, Key Data, Partner, Deal Value.

---

### Module 3: Pipeline Intelligence

**Route**: `/dashboard/pipeline`

**Data Source**: ClinicalTrials.gov API (live), augmented with proprietary deal data

**Input**: 
```typescript
interface PipelineSearchInput {
  indication?: string;
  mechanism?: string;
  phase?: ('Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4')[];
  company?: string;
  target?: string;                     // Molecular target
  geography?: string[];               // Trial country
  status?: ('Recruiting' | 'Active' | 'Completed')[];
  start_date_from?: string;
  has_deal?: boolean;                  // Filter to assets with known partnerships
}
```

**ClinicalTrials.gov Integration**:
```typescript
// lib/analytics/pipeline.ts
// Use ClinicalTrials.gov v2 API:
// https://clinicaltrials.gov/api/v2/studies

const CTGOV_BASE = 'https://clinicaltrials.gov/api/v2/studies';

// Query params mapping:
// indication → query.cond
// mechanism/target → query.intr  
// phase → filter.phase
// company → query.spons
// geography → filter.locn
// status → filter.overallStatus

// Response: parse and normalize into PipelineAsset[] type
// Cache responses in Supabase for 24 hours to reduce API calls
```

**Display**: Dense data table with inline sparkline charts for enrollment trends. Export to CSV.

---

### Module 4: Partner Discovery

**Route**: `/dashboard/partners` — **Pro only**

**What it does**: Matches your asset profile to likely licensing/partnership candidates based on their deal history, pipeline gaps, and strategic priorities.

**Input**:
```typescript
interface PartnerDiscoveryInput {
  asset_description: string;           // Free text: "KRAS G12C inhibitor, Phase 2 NSCLC"
  indication: string;
  mechanism: string;
  development_stage: string;
  geography_rights: string[];          // Rights you're offering: 'US' | 'EU' | 'Japan' | 'China' | 'Global'
  deal_type: ('licensing' | 'co-development' | 'acquisition' | 'co-promotion')[];
  exclude_companies?: string[];
}
```

**Partner Matching Algorithm** (`lib/analytics/partners.ts`):
```typescript
// Score each potential partner (database of 300+ active biopharma BD groups) on:

interface PartnerScore {
  company: string;
  match_score: number;                 // 0-100
  score_breakdown: {
    therapeutic_alignment: number;     // Do they have existing presence in your indication?
    pipeline_gap: number;              // Do they have a gap this asset could fill?
    deal_history: number;              // Have they done deals at your stage?
    financial_capacity: number;        // Can they afford a deal at expected terms?
    geography_fit: number;             // Do the rights geographies match their footprint?
    strategic_priority: number;        // Is this indication a stated priority?
  };
  recent_deals: PartnerDeal[];
  key_contacts: string[];              // BD lead names (from public sources)
  deal_terms_benchmark: {
    typical_upfront: string;
    typical_milestones: string;
    typical_royalty: string;
  };
  rationale: string;                   // Plain-language match explanation
}
```

**Display**: 
- Ranked card grid (top 10 partners shown, sorted by match score)
- Each card: company name, logo, match score progress bar, score breakdown mini-chart, 3 recent comparable deals, deal terms benchmark
- Expand to full partner profile with complete deal history table

---

### Module 5: Regulatory Intelligence

**Route**: `/dashboard/regulatory` — **Pro only**

**Input**:
```typescript
interface RegulatoryInput {
  indication: string;
  geography: 'FDA' | 'EMA' | 'PMDA' | 'NMPA';
  development_stage: string;
  unmet_need: 'high' | 'medium' | 'low';
  patient_population: 'pediatric' | 'adult' | 'geriatric' | 'all';
  has_orphan_designation: boolean;
  mechanism_class: string;
}
```

**Output**:
```typescript
interface RegulatoryOutput {
  recommended_pathway: {
    primary: RegulatoryPathway;
    alternatives: RegulatoryPathway[];
    rationale: string;
  };
  timeline_estimate: {
    ind_to_bla: { optimistic: number; realistic: number; pessimistic: number }; // months
    review_timeline: number;
    total_to_approval: { optimistic: number; realistic: number };
  };
  designation_opportunities: {
    designation: 'Breakthrough Therapy' | 'Fast Track' | 'Priority Review' | 'Accelerated Approval' | 'Orphan Drug';
    eligibility: 'likely' | 'possible' | 'unlikely';
    benefit: string;
    application_timing: string;
  }[];
  key_risks: RegulatoryRisk[];
  comparable_approvals: {
    drug: string; company: string; indication: string; pathway: string; timeline: number;
  }[];
  data_package_requirements: string[];
}

interface RegulatoryPathway {
  name: string;                        // "Standard NDA", "505(b)(2)", "BLA", "NDA with Accelerated Approval"
  review_division: string;
  typical_review_time: string;
  requirements: string[];
}
```

---

### Module 6: Deal Alerts

**Route**: `/dashboard/alerts` — **Pro only**

**Alert Types**:
```typescript
type AlertType = 
  | 'competitor_filing'      // New competitor trial registered
  | 'competitor_data'        // Competitor published results
  | 'partner_deal'           // Target partner announced a deal
  | 'fda_action'             // FDA approval, CRL, or advisory in your indication
  | 'market_shift'           // Pricing, reimbursement, or policy change
  | 'trial_update';          // Update to tracked trials

// Delivery: in-app feed + email digest
// Frequency: Pro = daily digest; Team = near-real-time
```

**Alert Feed UI** (`/dashboard/alerts`):
- Left column: Alert configuration panel (manage active alerts)
- Right column: Alert event feed, sorted by recency
- Each alert event card: signal type badge (Opportunity/Threat/Neutral), title, 2-sentence summary, source link, timestamp, read/unread state

---

## API Route Specifications

### POST /api/analyze/market

```typescript
// Request
{
  input: MarketSizingInput;
  save: boolean;               // Save to reports table?
  report_title?: string;
}

// Response
{
  success: boolean;
  data: MarketSizingOutput;
  report_id?: string;          // If saved
  usage: {
    feature: 'market_sizing';
    monthly_count: number;
    limit: number;             // -1 = unlimited
    remaining: number;
  };
  errors?: string[];
}

// Server logic:
// 1. Authenticate user (Supabase server client)
// 2. Check subscription + usage limits
// 3. Log usage_event to DB
// 4. Run calculation engine (lib/analytics/market-sizing.ts)
// 5. If save=true, insert into reports table
// 6. Return result
```

### POST /api/stripe/checkout

```typescript
// Create Stripe checkout session for plan upgrade
// Returns: { url: string } — redirect to Stripe hosted checkout
// On success: Stripe webhook updates subscriptions table
// Redirect: /dashboard?upgraded=true
```

### POST /api/stripe/webhook

```typescript
// Handle Stripe events:
// - customer.subscription.created → insert/update subscriptions
// - customer.subscription.updated → update plan/status
// - customer.subscription.deleted → downgrade to free
// - invoice.payment_failed → update status to 'past_due'
// IMPORTANT: Verify Stripe-Signature header before processing
```

---

## Key Pages — Detailed UI Specifications

---

### Landing Page (`/`)

**Purpose**: Convert visitors to signups. Audience is sophisticated biotech professionals — no fluff, lead with data.

**Sections**:
1. **Hero**: Full-width dark navy hero. Headline: "Market intelligence for life sciences deals." Subhead: "TAM analysis, competitive landscapes, and partner matching — in 90 seconds, not 3 weeks." CTA: "Start for free" + "See a sample report" (opens modal with pre-built report). Background: subtle animated particle field or grid pattern.

2. **Data Source Strip** (NOT a "trust strip" or "social proof" section): Show the data sources powering the platform: ClinicalTrials.gov, FDA/EMA, SEC EDGAR, WHO GBD, 10,000+ Transactions. **DO NOT** add fake company logos, placeholder names like "Series A Biotech" or "Top-20 Pharma BD", or any "Trusted by teams at" section. The platform has no external customers yet — never fabricate social proof.

3. **Feature Showcase**: 6 module cards in a 3x2 grid. Each card has the module name, one-line description, and a miniature screenshot/preview. On hover: expand slightly with slight glow.

4. **Live Demo**: Embedded interactive demo of the market sizing form. Pre-populated with "KRAS G12C inhibitor, NSCLC, Phase 2." Shows the output as user tabs through it. This is the most important section for conversion.

5. **Pricing**: Three-column pricing table. Free | Pro ($299/mo) | Team ($799/mo). Clean comparison with feature checkmarks.

6. **Ambrosia Ventures Attribution**: Footer section: "Terrain is built by Ambrosia Ventures, a life sciences M&A and strategy advisory firm. Our deal experience is embedded in every calculation." Link to ambrosiaventures.co.

---

### Dashboard Home (`/dashboard`)

**Layout**: Fixed left sidebar (240px) + main content area

**Sidebar Navigation**:
```
[Ambrosia / Terrain logo]

INTELLIGENCE
  ● Market Sizing
  ● Competitive Landscape
  ● Pipeline Intelligence

DEAL TOOLS (Pro)
  ● Partner Discovery      [Pro badge if locked]
  ● Regulatory Intel       [Pro badge if locked]
  ● Deal Alerts            [Pro badge if locked]

WORKSPACE
  ● Saved Reports
  ● Settings

[Upgrade to Pro card at bottom if free tier]
```

**Main Content — Dashboard Home**:
- Welcome header: "Good morning, [Name]. Your market is moving."
- Quick start panel: 4 action cards — "New Market Analysis", "Map a Landscape", "Search Pipeline", "Find Partners"
- Recent reports: last 3 saved reports as cards
- Alert feed preview: last 5 alert events (blurred/gated if free)
- Usage meter: visual usage meter per feature (free tier)

---

### Market Sizing Page (`/dashboard/market-sizing`)

**Layout**: Two-column (form left 380px, results right)

**Form Panel** (left):
- Indication autocomplete field (typeahead from 150+ indications list)
- Subtype/specifics text input
- Geography multi-select checklist
- Development stage selector (pill buttons: Preclinical | Phase 1 | Phase 2 | Phase 3 | Approved)
- Mechanism of action text input
- Patient segment (line of therapy, biomarker, etc.)
- Pricing assumption selector (Conservative / Base / Premium)
- Expected launch year (slider: 2025–2035)
- "Generate Analysis" button (teal, full width)

**Results Panel** (right):
- Top: Summary metrics row — 4 stat cards: US TAM, US SAM, US SOM, Global TAM
- TAM/SAM/SOM waterfall bar chart
- Patient funnel chart
- Geography breakdown table + chart
- Revenue projection chart (10-year, 3 scenarios)
- Pricing comparable table
- Methodology section (collapsed by default, expandable)
- Data sources footer
- Action bar: "Save Report" | "Export PDF" | "Export CSV" (last two gated behind Pro)

---

### Saved Reports (`/dashboard/reports`)

**Layout**: Full-width list view

**Report card fields**: Title, type badge, indication, date created, star/favorite, share (Team plan), quick preview, open, delete.

**Filters**: By type (Market Sizing / Competitive / Pipeline / Full), by indication, by date, starred only.

**Empty state**: Animated illustration + "You haven't saved any reports yet. Run your first market analysis to get started."

---

## Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_TEAM_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Terrain

# Email (Resend)
RESEND_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## Build Order (Recommended Sequence for Claude Code)

Build in this order to have a working product at each phase:

### Phase 1 — Foundation (Days 1-3)
1. `next.config.ts` + `tailwind.config.ts` + `globals.css` (design system variables)
2. Supabase project setup + run all 5 migrations
3. Auth pages: signup, login, callback route
4. Middleware: protect `/dashboard/**` routes
5. Dashboard shell: sidebar + topbar + layout

### Phase 2 — Core Module (Days 4-7)
6. Indication data: `lib/data/indication-map.ts` (minimum 50 indications)
7. Territory multipliers + pricing benchmarks data files
8. Market sizing calculation engine: `lib/analytics/market-sizing.ts`
9. Market sizing API route: `POST /api/analyze/market`
10. Market sizing UI: form + all 4 chart components + results panel

### Phase 3 — Second Module (Days 8-10)
11. Competitive landscape static data structure
12. Competitive analysis UI: landscape map + pipeline table
13. Save/load reports: `POST /api/reports` + saved reports page

### Phase 4 — Payments (Days 11-12)
14. Stripe integration: checkout + webhook + portal
15. UpgradeGate component
16. Usage tracking: middleware that logs events + checks limits

### Phase 5 — Pro Modules (Days 13-18)
17. Pipeline intelligence + ClinicalTrials.gov integration
18. Partner discovery: partner database + matching algorithm + UI
19. Regulatory intelligence: pathways data + UI
20. Deal alerts: alert CRUD + event feed UI

### Phase 6 — Polish (Days 19-21)
21. Landing page
22. Export functionality (PDF via `@react-pdf/renderer` or Puppeteer, CSV via custom hook)
23. Email notifications (Resend)
24. Mobile responsiveness audit
25. Vercel deployment + environment variables

---

## Component Patterns (Consistent Across All Modules)

### Stat Card
```tsx
// Reusable metric display card — use for all key metrics
<StatCard
  label="US Total Addressable Market"
  value="$4.2B"
  subvalue="Peak sales estimate"
  trend="+12% CAGR"
  trendDirection="up"
  confidence="high"
  source="Terrain analysis, ClinicalTrials.gov"
/>
```

### Data Table
```tsx
// All tables use this component for visual consistency
// Features: sorting, filtering, column visibility, pagination
// Style: dark background (#0D1B2E), teal header accents, mono font for numbers
<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  exportable={user.plan === 'pro'}
/>
```

### Module Header
```tsx
// Consistent page header for all dashboard pages
<PageHeader
  title="Market Sizing"
  subtitle="Quantify your opportunity before the first meeting"
  badge="Pro" // Optional — show Pro badge for gated modules
  actions={<SaveReportButton />}
  breadcrumb={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Market Sizing' }]}
/>
```

### Loading States
```tsx
// Always use skeleton loading, never spinners
// Match skeleton shape to actual content layout
<SkeletonCard height={280} />
<SkeletonTable rows={8} columns={6} />
```

---

## Code Quality Standards

- **TypeScript strict mode**: `"strict": true` in tsconfig. No `any` types.
- **Error boundaries**: Wrap each module in `<ErrorBoundary>` with graceful fallback UI.
- **API error handling**: Every API route returns consistent `{ success, data, error }` shape.
- **Loading states**: Every async operation has a skeleton loader, not a spinner.
- **Empty states**: Every list/table has a designed empty state with CTA.
- **Form validation**: All forms use Zod schemas. Show inline field-level errors.
- **Accessibility**: All interactive elements have proper ARIA labels. Keyboard navigable.
- **Performance**: 
  - All chart data fetches use React Query with 5-minute stale time
  - Supabase queries use `.select()` with specific columns only
  - Images use `next/image`
  - Heavy components use dynamic imports with `next/dynamic`

---

## Data Quality & Sourcing

Every number displayed must have a source attribution. Use `<DataSourceBadge>` component throughout.

**Primary Data Sources**:
- ClinicalTrials.gov API v2 — pipeline and trial data (live)
- FDA Drug Approvals Database — approval history
- SEC EDGAR — biotech company filings (deal announcements, partnership disclosures)
- WHO Global Burden of Disease — epidemiology data
- IQVIA/EvaluatePharma benchmarks — pricing and market size (licensed data, shown as "Industry benchmarks")
- Ambrosia Ventures proprietary deal database — 10,000+ transactions

**Important**: Be transparent about data recency. Show `Last updated: [date]` on all data tables. Pipeline data from ClinicalTrials.gov is updated nightly.

---

## Deployment

```bash
# Vercel deployment
vercel deploy --prod

# Required Vercel environment variables: all from .env.example
# Required Vercel settings:
#   Framework: Next.js
#   Node version: 20.x
#   Build command: next build
#   Install command: npm install

# Supabase edge function for alert processing (optional for MVP):
# supabase functions deploy process-alerts
```

**Production URL**: terrain.ambrosiaventures.co  
**Configure in Vercel**: Custom domain → terrain.ambrosiaventures.co  
**Stripe webhook**: Register https://terrain.ambrosiaventures.co/api/stripe/webhook in Stripe dashboard

---

## What Success Looks Like

A completed Terrain platform:
- Loads market sizing results in < 3 seconds
- Covers 150+ indications with accurate epidemiology data
- Returns competitive landscape with 20+ competitors per indication
- Pipeline search pulls live ClinicalTrials.gov data
- Partner matching scores 300+ companies
- Regulatory pathways cover FDA + EMA + PMDA
- Free tier is genuinely useful (converts users to Pro)
- Pro tier is genuinely indispensable (converts users to clients)
- Exports look like Goldman Sachs research reports

---

*Terrain is built by Ambrosia Ventures. Confidential. Version 1.0.0*

---

## EXPANSION: Diagnostics & Medical Devices

Terrain covers **three product categories**, each with fundamentally different market sizing logic, regulatory pathways, and reimbursement frameworks:

```
┌─────────────────────────────────────────────────────────────┐
│  PHARMACEUTICALS          DIAGNOSTICS           DEVICES     │
│  Patient × drug price     Test volume × CPT     Procedure × │
│  × market share           reimbursement rate    ASP × adopt. │
│                                                              │
│  FDA: NDA/BLA/sNDA        FDA: PMA/510(k)/CDx   510(k)/PMA/ │
│  EMA: MAA                 CE: IVDR               De Novo     │
│                           LDT exempt (changing)  CE: MDR     │
│                                                              │
│  Payer: formulary         Payer: NCD/LCD/        Payer: DRG/ │
│  PBAC negotiations        MolDx/CPT gap-fill     APC/NTAP   │
└─────────────────────────────────────────────────────────────┘
```

---

### Product Category Input — Updated Form

The Market Sizing form gains a **Product Type** selector at the top that routes to the correct sizing engine:

```
[ ] Pharmaceutical / Biologic / RNA
[ ] In Vitro Diagnostic (IVD)
[ ] Companion Diagnostic (CDx)
[●] Medical Device — Implantable
[ ] Medical Device — Surgical
[ ] Medical Device — Monitoring / Wearable
[ ] Medical Device — Digital Health / SaMD
[ ] Medical Device — Capital Equipment
[ ] Imaging Agent / Contrast Media
```

Selecting a category:
- Changes the **Pricing inputs** (ASP vs. WAC vs. per-test reimbursement)
- Changes the **Regulatory module** (510(k)/PMA/CDx instead of NDA/BLA)
- Changes the **Sizing method selector** (procedure volume / installed base / test volume / subscription)
- Changes the **Geography multipliers** (device multipliers ≠ pharma multipliers — EU and Japan weighted differently)
- Changes the **Partner matching database** (MedTech/Diagnostics partners vs. pharma partners)

---

### New Module: Device Regulatory Intelligence

**Route**: `/dashboard/regulatory?mode=device`

Covers:
- 510(k) vs. De Novo vs. PMA pathway selection based on predicate analysis and risk class
- Breakthrough Device Designation eligibility assessment
- IDE study requirements and design (for Class III / novel Class II)
- EU MDR / IVDR classification and CE marking timeline
- Comparable clearances database (searchable FDA 510(k) and PMA databases)
- NTAP application guidance for reimbursement acceleration
- CMS coverage determination strategy (NCD/LCD, MolDx for diagnostics)

**Key data file to create**: `lib/data/device-regulatory-pathways.ts`

```typescript
export const DEVICE_REGULATORY_PATHWAYS = [
  {
    pathway: '510(k) Clearance',
    fda_class: 'Class II',
    requires_clinical_data: 'sometimes', // Only if predicate doesn't adequately address safety
    average_review_days_fda: 174,        // FDA 2024 CDRH performance data
    total_days_to_clearance: 280,        // Including pre-sub, preparation, FDA review
    success_rate: 0.82,
    description: 'Substantial equivalence to a predicate device. Most common pathway for Class II devices.',
  },
  {
    pathway: 'De Novo Classification',
    fda_class: 'Class II',
    requires_clinical_data: 'usually',
    average_review_days_fda: 344,
    total_days_to_clearance: 500,
    success_rate: 0.75,
    description: 'For novel, low-to-moderate risk devices with no predicate. Creates a new device classification.',
  },
  {
    pathway: 'PMA (Premarket Approval)',
    fda_class: 'Class III',
    requires_clinical_data: 'always',
    average_review_days_fda: 365,
    total_days_to_clearance: 900,         // Including IDE study
    success_rate: 0.68,
    description: 'Highest scrutiny. Required for Class III high-risk devices and most diagnostics for serious conditions.',
  },
  {
    pathway: 'Breakthrough Device',
    fda_class: 'Class II or III',
    requires_clinical_data: 'always',
    average_review_days_fda: 230,         // Faster review with designation
    total_days_to_clearance: 700,
    success_rate: 0.78,
    description: 'For devices providing more effective treatment for serious conditions. Interactive review with FDA.',
  },
  // ... add all pathways from CLAUDE.md types
];
```

---

### Reimbursement Module — Device & Diagnostics Extensions

The existing Regulatory Intelligence module at `/dashboard/regulatory` gains a **Reimbursement tab** for devices (pharma has formulary strategy; devices have different mechanics):

**Device Reimbursement Workflow**:
1. **Site-of-care determination** → Inpatient (DRG), Outpatient (APC), Physician Office (CPT), Home (DMEPOS)
2. **DRG/APC mapping** → Show existing DRG payment rates and whether device cost is carved out or bundled
3. **NTAP eligibility** → If device cost >25% of DRG payment, NTAP application may be available (50% of excess cost covered by CMS)
4. **Coverage pathway** → NCD or LCD required? Which MAC jurisdiction? MolDx for molecular tests?
5. **Commercial payer dynamics** → Prior auth requirements, step therapy, medical necessity criteria typical for this category

**Diagnostics Reimbursement Workflow**:
1. **CPT code strategy** → Existing codes vs. new Category III vs. unlisted code (81479)
2. **MolDx determination** → For molecular/genomic tests in MAC jurisdictions (Palmetto, Noridian, CGS)
3. **Gap-fill pricing** → When no national fee schedule rate, contractors set local rates — show historical gap-fill outcomes
4. **NCD 90.2** → CMS national coverage for NGS-based tumor profiling in cancer — check if test qualifies
5. **Commercial payer landscape** → Coverage policies for comparable tests at major payers (UnitedHealth, Aetna, CIGNA, BCBS)

---

### Updated Indication Map Coverage

Expand `lib/data/indication-map.ts` to include **device-context indications** with procedure volume data:

Each indication in the map gets new optional device-specific fields:
```typescript
interface IndicationData {
  // ... existing pharma fields ...
  
  // NEW: Device context
  device_context?: {
    primary_procedure: string;           // "TAVR", "TKA", "DBS implant"
    annual_us_procedures: number;
    procedure_cpt_codes: string[];
    procedure_growth_rate: number;
    primary_site_of_care: string;
    key_physician_specialties: string[];
    current_soc_devices: string[];       // Current standard-of-care devices
    device_market_size_usd_b: number;   // Total US device market for this indication
    device_market_cagr: number;
  };
  
  // NEW: Diagnostics context
  diagnostics_context?: {
    standard_biomarkers: string[];       // What's routinely tested today
    emerging_biomarkers: string[];       // Pipeline biomarkers being validated
    current_testing_rate: number;        // % of eligible patients receiving any biomarker test
    test_type: string;                   // IHC, NGS, liquid biopsy, etc.
    annual_test_volume_us: number;
    reimbursement_status: string;
    cdx_opportunity: boolean;            // Is there a CDx opportunity linked to emerging drugs?
  };
}
```

---

### Key Data Files to Create (Devices & Diagnostics)

```
lib/data/procedure-volumes.ts          ← 50+ procedure volume records (see device-indications-partners.ts spec)
lib/data/device-pricing-benchmarks.ts  ← 50+ device ASP benchmarks (see spec)
lib/data/cpt-codes.ts                  ← CPT code database with CMS 2025 fee schedule rates
lib/data/drg-database.ts               ← DRG payment rates for device-relevant DRGs
lib/data/device-regulatory-pathways.ts ← 510(k)/PMA/De Novo pathway definitions
lib/data/device-partners.ts            ← 50+ MedTech/Diagnostics partner profiles (see spec)
lib/data/medtech-deal-database.ts      ← Historical MedTech M&A and licensing transactions
```

---

### Companion Diagnostics — Special Case

CDx sits at the intersection of diagnostics, devices, and pharma. Terrain handles it with a dedicated flow:

```
User selects: "Companion Diagnostic (CDx)"
↓
Form asks:
  - What drug is this CDx for? (or "standalone diagnostic")
  - What biomarker does it detect?
  - What's the current test type? (IHC / NGS / PCR / liquid biopsy)
  - What's the regulatory strategy? (Co-submission / bridging / standalone)
↓
Outputs:
  - Test volume tied to drug-eligible patients (not general population)
  - Revenue model: per-test revenue × testing rate
  - CDx partner analysis (Roche, Foundation Medicine, Guardant, Exact, Dako/Agilent)
  - Regulatory timeline factoring co-submission with NDA/BLA
  - Reimbursement: NCD 90.2 applicability, MolDx coverage, commercial medical policy landscape
  - Deal terms benchmark: CDx licensing vs. development partnership structures
```

---

### Updated Partner Matching — MedTech Companies Added

`lib/data/device-partners.ts` covers 50+ companies:

**Large MedTech** (Tier 1):
Medtronic, Abbott, Boston Scientific, Stryker, Johnson & Johnson MedTech, Becton Dickinson, Baxter, Edwards Lifesciences, Zimmer Biomet, Smith+Nephew, Hologic, Intuitive Surgical, Varian (Siemens), Elekta

**Mid-size MedTech** (Tier 2):
Natus, NovaBay, Integra, Insulet, Tandem, iRhythm, Invacare, ICU Medical, Agiliti, Natus, Masimo, Haemonetics

**Diagnostics Majors**:
Roche Diagnostics, Abbott Diagnostics, Siemens Healthineers, bioMérieux, Hologic, Qiagen, Luminex (DiaSorin), Beckman Coulter (Danaher)

**Specialty Diagnostics**:
Foundation Medicine, Guardant Health, Exact Sciences, Invitae, Myriad Genetics, Tempus AI, Veracyte, NeoGenomics, Genomic Health

**Strategic Pharma** (CDx/combination product):
Roche Group, AstraZeneca, Merck, Pfizer, Eli Lilly, BMS, Novartis, Pfizer (acquiring device capabilities)

---

### UI Updates for Device/Diagnostics Mode

**New UI elements**:

1. **Category selector** — pill buttons at top of market sizing form
2. **Procedure volume chart** — replaces/supplements patient funnel for procedure-based devices; shows "Total Procedures → Eligible → Capturable"
3. **Reimbursement card** — shows DRG/APC/CPT code, payment rate, and coverage status with traffic light (🟢 covered / 🟡 emerging / 🔴 not covered)
4. **Regulatory pathway badge** — shows 510(k) / De Novo / PMA badge prominently in summary
5. **NTAP indicator** — if device qualifies for New Technology Add-on Payment, show estimated $ add-on
6. **CDx linkage card** — for companion diagnostics, shows the linked drug, drug approval status, and how CDx revenue ties to drug uptake

**New badge variants** (add to globals.css):
```css
.badge-510k { background: rgba(96, 165, 250, 0.12); color: #60A5FA; border: 1px solid rgba(96,165,250,0.2); }
.badge-pma { background: rgba(251, 191, 36, 0.12); color: #FBBF24; border: 1px solid rgba(251,191,36,0.2); }
.badge-de-novo { background: rgba(167, 139, 250, 0.12); color: #A78BFA; border: 1px solid rgba(167,139,250,0.2); }
.badge-cdx { background: rgba(0, 201, 167, 0.12); color: #00C9A7; border: 1px solid rgba(0,201,167,0.2); }
.badge-breakthrough-device { background: rgba(52, 211, 153, 0.12); color: #34D399; border: 1px solid rgba(52,211,153,0.2); }

/* Reimbursement coverage indicators */
.coverage-green { color: #34D399; }
.coverage-amber { color: #FBBF24; }
.coverage-red { color: #F87171; }
```

---

*Terrain covers pharmaceutical, diagnostic, and medical device market intelligence. Built by Ambrosia Ventures — the only boutique life sciences advisory firm that built its own intelligence infrastructure.*
