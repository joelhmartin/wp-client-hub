import { NextRequest, NextResponse } from 'next/server';
import { getCrawlSnapshot } from '@/lib/seo/queries';

// GET /api/seo/crawl/[siteId]/[snapshotId] — Get a specific crawl snapshot
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; snapshotId: string }> }
) {
  try {
    const { snapshotId } = await params;
    const snapshot = await getCrawlSnapshot(snapshotId);
    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch snapshot' },
      { status: 500 }
    );
  }
}
