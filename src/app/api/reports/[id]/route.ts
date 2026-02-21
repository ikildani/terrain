import { NextRequest, NextResponse } from 'next/server';
import type { Report } from '@/types';
import { reportsStore } from '@/lib/reports-store';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const report = reportsStore.get(id);

  if (!report) {
    return NextResponse.json(
      { success: false, error: 'Report not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: report });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const report = reportsStore.get(id);

  if (!report) {
    return NextResponse.json(
      { success: false, error: 'Report not found.' },
      { status: 404 }
    );
  }

  reportsStore.delete(id);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const report = reportsStore.get(id);

  if (!report) {
    return NextResponse.json(
      { success: false, error: 'Report not found.' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { title, is_starred, status, tags } = body as Partial<
      Pick<Report, 'title' | 'is_starred' | 'status' | 'tags'>
    >;

    // Apply only the fields that were provided
    if (title !== undefined) report.title = title;
    if (is_starred !== undefined) report.is_starred = is_starred;
    if (status !== undefined) {
      const validStatuses: Report['status'][] = ['draft', 'final'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      report.status = status;
    }
    if (tags !== undefined) report.tags = tags;

    report.updated_at = new Date().toISOString();
    reportsStore.set(id, report);

    return NextResponse.json({ success: true, data: report });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
