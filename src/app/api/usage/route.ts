import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      market_sizing: { used: 0, limit: 3 },
      competitive: { used: 0, limit: 1 },
      partners: { used: 0, limit: 0 },
      regulatory: { used: 0, limit: 0 },
      reports_saved: { used: 0, limit: 3 },
    },
  });
}
