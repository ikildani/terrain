import { NextRequest, NextResponse } from 'next/server';
import { calculateMarketSizing } from '@/lib/analytics/market-sizing';
import type { MarketSizingInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: MarketSizingInput = body.input || body;

    if (!input.indication) {
      return NextResponse.json(
        { success: false, error: 'Indication is required.' },
        { status: 400 }
      );
    }
    if (!input.geography || input.geography.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one geography is required.' },
        { status: 400 }
      );
    }
    if (!input.development_stage) {
      return NextResponse.json(
        { success: false, error: 'Development stage is required.' },
        { status: 400 }
      );
    }

    const fullInput: MarketSizingInput = {
      indication: input.indication,
      subtype: input.subtype || '',
      geography: input.geography,
      development_stage: input.development_stage,
      mechanism: input.mechanism || '',
      patient_segment: input.patient_segment || '',
      pricing_assumption: input.pricing_assumption || 'base',
      launch_year: input.launch_year || 2028,
    };

    const result = await calculateMarketSizing(fullInput);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
