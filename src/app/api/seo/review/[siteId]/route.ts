import { NextRequest, NextResponse } from 'next/server';
import { listReports, createReport } from '@/lib/seo/queries';

// GET /api/seo/review/[siteId]?envId=...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const envId = request.nextUrl.searchParams.get('envId');
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const reports = await listReports(siteId, envId);
    return NextResponse.json({ reports });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

// POST /api/seo/review/[siteId] — Generate a review report
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { envId, planId, reportType, content, modelUsed } = body;

    if (!envId || !reportType || !content) {
      return NextResponse.json({ error: 'envId, reportType, and content required' }, { status: 400 });
    }

    const report = await createReport({
      site_id: siteId,
      env_id: envId,
      plan_id: planId || null,
      report_type: reportType,
      content,
      model_used: modelUsed || 'unknown',
    });

    return NextResponse.json({ report });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
