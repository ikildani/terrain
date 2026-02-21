import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Partner analysis not implemented yet.' },
    { status: 501 }
  );
}
