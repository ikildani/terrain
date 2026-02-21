import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import {
  calculateDeviceMarketSizing,
  calculateCDxMarketSizing,
} from '@/lib/analytics/device-market-sizing';
import type { ApiResponse } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z
    .object({
      // Pharma fields
      indication: z.string().optional(),
      subtype: z.string().optional(),
      mechanism: z.string().optional(),
      molecular_target: z.string().optional(),
      patient_segment: z.string().optional(),
      pricing_assumption: z
        .enum(['conservative', 'base', 'premium'])
        .optional(),
      development_stage: z.string().optional(),

      // Device fields
      product_name: z.string().optional(),
      device_category: z.string().optional(),
      product_category: z.string().optional(),
      procedure_or_condition: z.string().optional(),
      target_setting: z.array(z.string()).optional(),
      pricing_model: z.string().optional(),
      unit_ase: z.number().optional(),
      disposables_per_procedure: z.number().optional(),
      disposable_ase: z.number().optional(),
      service_contract_annual: z.number().optional(),
      reimbursement_status: z.string().optional(),
      physician_specialty: z.array(z.string()).optional(),

      // CDx fields
      drug_name: z.string().optional(),
      drug_indication: z.string().optional(),
      biomarker: z.string().optional(),
      biomarker_prevalence_pct: z.number().optional(),
      test_type: z.string().optional(),
      test_setting: z.array(z.string()).optional(),
      drug_development_stage: z.string().optional(),
      cdx_development_stage: z.string().optional(),
      test_ase: z.number().optional(),
      is_standalone: z.boolean().optional(),
      drug_partner: z.string().optional(),

      // Shared fields
      geography: z.array(z.string()).min(1, 'At least one geography is required.'),
      launch_year: z
        .number()
        .int()
        .min(2024, 'Launch year must be 2024 or later.')
        .max(2045, 'Launch year must be 2045 or earlier.'),
    })
    .passthrough(),

  product_category: z.string().min(1, 'product_category is required.'),
  save: z.boolean().optional(),
  report_title: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// CATEGORY ROUTING HELPERS
// ────────────────────────────────────────────────────────────

function isPharma(category: string): boolean {
  return category === 'pharmaceutical' || category.startsWith('pharma');
}

function isDevice(category: string): boolean {
  return category.startsWith('medical_device') || category.startsWith('device');
}

function isCDx(category: string): boolean {
  return (
    category === 'companion_diagnostic' ||
    category === 'cdx' ||
    category === 'diagnostics_companion' ||
    category === 'diagnostics_ivd'
  );
}

// ────────────────────────────────────────────────────────────
// POST /api/analyze/market
// ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Parse body ──────────────────────────────────────────
    const body = await request.json();

    // ── Validate with Zod ───────────────────────────────────
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: messages.join('; '), errors: messages } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    const { input, product_category } = parsed.data;

    // ── Additional validation by category ───────────────────
    if (isPharma(product_category)) {
      if (!input.indication) {
        return NextResponse.json(
          { success: false, error: 'indication is required for pharmaceutical analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isDevice(product_category)) {
      if (!input.procedure_or_condition) {
        return NextResponse.json(
          { success: false, error: 'procedure_or_condition is required for device analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    } else if (isCDx(product_category)) {
      if (!input.drug_indication) {
        return NextResponse.json(
          { success: false, error: 'drug_indication is required for CDx analysis.' } satisfies ApiResponse<never>,
          { status: 400 },
        );
      }
    }

    // ── Route to the correct engine ─────────────────────────
    let result: unknown;

    if (isPharma(product_category)) {
      result = await calculateMarketSizing(input as Parameters<typeof calculateMarketSizing>[0]);
    } else if (isDevice(product_category)) {
      result = await calculateDeviceMarketSizing(input as Parameters<typeof calculateDeviceMarketSizing>[0]);
    } else if (isCDx(product_category)) {
      result = await calculateCDxMarketSizing(input as Parameters<typeof calculateCDxMarketSizing>[0]);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unknown product_category: "${product_category}". Supported categories: pharmaceutical, medical_device/device, companion_diagnostic/cdx.`,
        } satisfies ApiResponse<never>,
        { status: 400 },
      );
    }

    // ── Success ─────────────────────────────────────────────
    return NextResponse.json(
      { success: true, data: result } satisfies ApiResponse<typeof result>,
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Market analysis failed.';
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
