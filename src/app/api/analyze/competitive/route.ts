import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { analyzeCompetitiveLandscape } from '@/lib/analytics/competitive';
import type { ApiResponse, CompetitiveLandscapeOutput } from '@/types';

// ────────────────────────────────────────────────────────────
// REQUEST SCHEMA
// ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  input: z.object({
    indication: z.string().min(1, 'Indication is required.'),
    mechanism: z.string().optional(),
  }),
  save: z.boolean().optional(),
  report_title: z.string().optional(),
});

// ────────────────────────────────────────────────────────────
// POST /api/analyze/competitive
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

    // ── Run competitive landscape analysis ──────────────────
    const result = await analyzeCompetitiveLandscape(parsed.data.input);

    // ── Success ─────────────────────────────────────────────
    return NextResponse.json(
      { success: true, data: result } satisfies ApiResponse<CompetitiveLandscapeOutput>,
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Competitive analysis failed.';
    return NextResponse.json(
      { success: false, error: message } satisfies ApiResponse<never>,
      { status: 500 },
    );
  }
}
