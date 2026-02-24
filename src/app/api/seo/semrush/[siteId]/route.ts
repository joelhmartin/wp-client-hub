import { NextRequest, NextResponse } from 'next/server';
import { fetchSEMrushKeywords } from '@/lib/seo/semrush-client';
import { createSEMrushSnapshot, getSiteConfig } from '@/lib/seo/queries';

// POST /api/seo/semrush/[siteId] — Pull SEMrush data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { envId } = body;
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const apiKey = process.env.SEMRUSH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SEMRUSH_API_KEY not configured' }, { status: 400 });
    }

    // Get domain from config or request
    const config = await getSiteConfig(siteId, envId);
    const domain = body.domain || config?.semrush_domain;
    if (!domain) {
      return NextResponse.json({ error: 'No domain configured for SEMrush' }, { status: 400 });
    }

    const data = await fetchSEMrushKeywords(apiKey, domain);
    const snapshot = await createSEMrushSnapshot(
      siteId, envId, domain, data.keywords, data.organicTraffic
    );

    return NextResponse.json({ snapshot });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'SEMrush fetch failed' },
      { status: 500 }
    );
  }
}
