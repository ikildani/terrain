import { z } from 'zod';
import { withAnalysisHandler } from '@/lib/api/with-analysis-handler';
import { analyzeRegulatory } from '@/lib/analytics/regulatory';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().trim().max(500).min(1, 'Indication is required.'),
    product_type: z.enum(['pharmaceutical', 'biologic', 'device', 'diagnostic'], {
      required_error: 'Product type is required.',
    }),
    development_stage: z.enum(['preclinical', 'phase1', 'phase2', 'phase3', 'approved'], {
      required_error: 'Development stage is required.',
    }),
    mechanism: z.string().trim().max(500).optional(),
    geography: z.array(z.enum(['FDA', 'EMA', 'PMDA', 'NMPA'])).min(1, 'At least one regulatory agency is required.'),
    unmet_need: z.enum(['high', 'medium', 'low'], {
      required_error: 'Unmet need level is required.',
    }),
    has_orphan_potential: z.boolean(),
  }),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/regulatory
// ────────────────────────────────────────────────────────────

export const POST = withAnalysisHandler({
  feature: 'regulatory',
  route: '/api/analyze/regulatory',
  rateKey: 'regulatory',
  schema: RequestSchema,
  timingLabel: 'regulatory_analysis',
  extractIndication: (body) => body.input.indication,
  extractUsageMeta: (body) => ({
    product_type: body.input.product_type,
    geography: body.input.geography,
    development_stage: body.input.development_stage,
  }),
  handler: async (body) => analyzeRegulatory(body.input),
});
