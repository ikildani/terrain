import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      market_sizing: { used: 0, limit: 3 },
      competitive: { used: 0, limit: 1 },
      pipeline: { used: 0, limit: 5 },
      reports_saved: { used: 0, limit: 3 },
    },
  });
}
