import { NextRequest, NextResponse } from 'next/server';
import { getSiteTimeline } from '@/lib/seo/queries';

// GET /api/seo/history/[siteId]?envId=...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const envId = request.nextUrl.searchParams.get('envId');
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const timeline = await getSiteTimeline(siteId, envId);
    return NextResponse.json({ timeline });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
