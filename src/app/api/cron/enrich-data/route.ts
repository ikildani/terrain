import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';
import { captureApiError } from '@/lib/utils/sentry';
import {
  runIndicationEnrichment,
  runPricingEnrichment,
  runProcedureEnrichment,
  THERAPY_AREAS,
} from '@/lib/intelligence/enrichment-pipeline';

// ────────────────────────────────────────────────────────────
// Enrichment Cron — Daily at 5 AM UTC
// Rotates through therapy areas (one per day, all 18 in 18 days).
// Each run enriches indications + pricing for that therapy area.
// ────────────────────────────────────────────────────────────

// Device categories for procedure enrichment (cycle through separately)
const DEVICE_CATEGORIES = [
  'cardiovascular',
  'orthopedic',
  'neurology',
  'ophthalmology',
  'surgical',
  'monitoring',
  'diagnostics',
  'digital_health',
] as const;

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rotate through TAs (use day of year mod 18)
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const taIndex = dayOfYear % THERAPY_AREAS.length;
  const therapyArea = THERAPY_AREAS[taIndex];

  // Also rotate through device categories (slower cadence)
  const deviceIndex = dayOfYear % DEVICE_CATEGORIES.length;
  const deviceCategory = DEVICE_CATEGORIES[deviceIndex];

  const results: Record<string, unknown> = {
    therapy_area: therapyArea,
    device_category: deviceCategory,
    timestamp: now.toISOString(),
  };

  try {
    // Run indication enrichment
    const indicationResult = await runIndicationEnrichment(therapyArea);
    results.indications = indicationResult;

    logger.info('Enrichment: indications complete', {
      therapy_area: therapyArea,
      discovered: indicationResult.discovered,
      added: indicationResult.added,
    });

    // Run pricing enrichment for same TA
    const pricingResult = await runPricingEnrichment(therapyArea);
    results.pricing = pricingResult;

    logger.info('Enrichment: pricing complete', {
      therapy_area: therapyArea,
      discovered: pricingResult.discovered,
      added: pricingResult.added,
    });

    // Run procedure enrichment (device category)
    const procedureResult = await runProcedureEnrichment(deviceCategory);
    results.procedures = procedureResult;

    logger.info('Enrichment: procedures complete', {
      device_category: deviceCategory,
      discovered: procedureResult.discovered,
      added: procedureResult.added,
    });

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    captureApiError(error instanceof Error ? error : new Error(String(error)), {
      route: '/api/cron/enrich-data',
      therapy_area: therapyArea,
    });
    logger.error('Enrichment cron failed', { error: String(error), therapy_area: therapyArea });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        partial_results: results,
      },
      { status: 500 },
    );
  }
}
