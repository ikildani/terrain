import { z } from 'zod';
import { withAnalysisHandler } from '@/lib/api/with-analysis-handler';
import { analyzePartners } from '@/lib/analytics/partners';
import type { PartnerDiscoveryInput } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    asset_description: z.string().trim().max(1000).default(''),
    indication: z.string().trim().max(500).min(1, 'Indication is required.'),
    mechanism: z.string().trim().max(500).optional(),
    development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved'], {
      errorMap: () => ({ message: 'Valid development stage is required.' }),
    }),
    geography_rights: z
      .array(
        z.enum([
          'US',
          'EU5',
          'Germany',
          'France',
          'Italy',
          'Spain',
          'UK',
          'Japan',
          'China',
          'Canada',
          'Australia',
          'RoW',
          'Global',
        ]),
      )
      .min(1, 'At least one geography is required.'),
    deal_types: z
      .array(z.enum(['licensing', 'co-development', 'acquisition', 'co-promotion']))
      .min(1, 'At least one deal type is required.'),
    exclude_companies: z.array(z.string().trim().max(200)).optional(),
    minimum_match_score: z.number().min(0).max(100).optional(),
  }),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/partners
// ────────────────────────────────────────────────────────────

export const POST = withAnalysisHandler({
  feature: 'partners',
  route: '/api/analyze/partners',
  rateKey: 'partners',
  schema: RequestSchema,
  timingLabel: 'partner_analysis',
  extractIndication: (body) => body.input.indication,
  extractUsageMeta: (body) => ({
    mechanism: body.input.mechanism,
    development_stage: body.input.development_stage,
    deal_types: body.input.deal_types,
    geography_rights: body.input.geography_rights,
  }),
  handler: async (body) => analyzePartners(body.input as PartnerDiscoveryInput),
});
