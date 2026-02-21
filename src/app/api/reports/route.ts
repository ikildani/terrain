import { NextRequest, NextResponse } from 'next/server';
import type { ReportType } from '@/types';
import { reportsStore } from '@/lib/reports-store';

export async function GET() {
  const reports = Array.from(reportsStore.values());
  return NextResponse.json({ success: true, data: reports });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, report_type, indication, inputs, outputs, tags } = body as {
      title?: string;
      report_type?: ReportType;
      indication?: string;
      inputs?: any;
      outputs?: any;
      tags?: string[];
    };

    if (!title || !report_type || !indication) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, report_type, indication.' },
        { status: 400 }
      );
    }

    const validTypes: ReportType[] = ['market_sizing', 'competitive', 'pipeline', 'full'];
    if (!validTypes.includes(report_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid report_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const report: Report = {
      id: crypto.randomUUID(),
      user_id: 'demo-user',
      title,
      report_type,
      indication,
      inputs: inputs ?? null,
      outputs: outputs ?? null,
      status: 'draft',
      is_starred: false,
      tags: tags ?? [],
      created_at: now,
      updated_at: now,
    };

    reportsStore.set(report.id, report);

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
