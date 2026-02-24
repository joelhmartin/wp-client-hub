import { NextRequest, NextResponse } from 'next/server';
import { generateSEOPlan } from '@/lib/seo/claude-seo';
import { getCrawlSnapshot, getLatestSEMrushSnapshot } from '@/lib/seo/queries';

// POST /api/seo/plan — Generate a new SEO plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, envId, crawlSnapshotId, model } = body;

    if (!siteId || !envId || !crawlSnapshotId) {
      return NextResponse.json(
        { error: 'siteId, envId, and crawlSnapshotId are required' },
        { status: 400 }
      );
    }

    const crawlSnapshot = await getCrawlSnapshot(crawlSnapshotId);
    if (!crawlSnapshot || crawlSnapshot.status !== 'completed') {
      return NextResponse.json({ error: 'Crawl snapshot not found or not completed' }, { status: 400 });
    }

    // Optionally include SEMrush data
    const semrushSnapshot = await getLatestSEMrushSnapshot(siteId, envId);

    const result = await generateSEOPlan({
      siteId,
      envId,
      crawlData: crawlSnapshot.crawl_data,
      crawlSnapshotId,
      semrushData: semrushSnapshot?.keyword_data || null,
      semrushSnapshotId: semrushSnapshot?.id || null,
      model: model || 'claude-sonnet-4-5-20250929',
    });

    return NextResponse.json({ plan: result.plan, changes: result.changes });
  } catch (err) {
    console.error('[SEO Plan] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Plan generation failed' },
      { status: 500 }
    );
  }
}
