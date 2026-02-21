import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Alert creation not implemented yet.' },
    { status: 501 }
  );
}
