# Terrain — Market Opportunity Intelligence Platform

Terrain gives biotech founders and BD executives instant, data-driven answers to market questions that precede every major licensing deal, M&A transaction, or partnership discussion.

**Live**: [terrain.ambrosiaventures.co](https://terrain.ambrosiaventures.co)

## Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe (subscriptions)
- **Monitoring**: Sentry, Vercel Speed Insights
- **CI/CD**: GitHub Actions → Vercel (preview + production deploys)
- **Testing**: Vitest + Testing Library + Playwright

## Getting Started

```bash
# Prerequisites: Node.js 20 (see .nvmrc)
nvm use

# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                         | Description             |
| ------------------------------- | ----------------------- |
| `npm run dev`                   | Start dev server        |
| `npm run build`                 | Production build        |
| `npm run start`                 | Start production server |
| `npm test`                      | Run unit tests (Vitest) |
| `npx vitest run --coverage`     | Run tests with coverage |
| `npx playwright test`           | Run E2E tests           |
| `npx tsc --noEmit`              | Type check              |
| `npx eslint src/`               | Lint                    |
| `npx prettier --check "src/**"` | Format check            |

## Project Structure

```
src/
├── app/             # Next.js App Router pages + API routes
├── components/      # React components (ui/, layout/, shared/)
├── hooks/           # Custom React hooks
├── lib/             # Business logic, analytics engines, data
│   ├── analytics/   # Market sizing, competitive, partners, regulatory
│   ├── api/         # Shared API middleware (withAnalysisHandler)
│   ├── data/        # Static datasets (indications, pricing, territories)
│   └── supabase/    # Supabase client configuration
└── types/           # TypeScript type definitions
```

## Modules

- **Market Sizing** — TAM/SAM/SOM analysis for pharma, devices, CDx, nutraceuticals
- **Competitive Landscape** — Pipeline mapping and competitor profiling
- **Pipeline Intelligence** — ClinicalTrials.gov integration
- **Partner Discovery** — Algorithmic partner matching (Pro)
- **Regulatory Intelligence** — FDA/EMA pathway analysis (Pro)

## Deployment

Production deploys automatically on push to `main` via GitHub Actions → Vercel.

Preview deploys are created for every pull request.

---

Built by [Ambrosia Ventures](https://ambrosiaventures.co).
