import { NextRequest, NextResponse } from 'next/server';
import { crawlSite } from '@/lib/seo/crawler';
import { listCrawlSnapshots, getLatestCrawlSnapshot } from '@/lib/seo/queries';

// POST /api/seo/crawl/[siteId] — Trigger a new crawl
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const envId = body.envId;
    if (!envId) {
      return NextResponse.json({ error: 'envId is required' }, { status: 400 });
    }

    const snapshotId = await crawlSite(siteId, envId);
    return NextResponse.json({ snapshotId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Crawl failed' },
      { status: 500 }
    );
  }
}

// GET /api/seo/crawl/[siteId]?envId=...&latest=true — List or get latest crawl
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const envId = request.nextUrl.searchParams.get('envId');
    if (!envId) {
      return NextResponse.json({ error: 'envId query param required' }, { status: 400 });
    }

    const latest = request.nextUrl.searchParams.get('latest');
    if (latest) {
      const snapshot = await getLatestCrawlSnapshot(siteId, envId);
      return NextResponse.json({ snapshot });
    }

    const snapshots = await listCrawlSnapshots(siteId, envId);
    return NextResponse.json({ snapshots });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch crawls' },
      { status: 500 }
    );
  }
}
