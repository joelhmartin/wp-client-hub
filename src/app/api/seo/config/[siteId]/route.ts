import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, upsertSiteConfig } from '@/lib/seo/queries';

// GET /api/seo/config/[siteId]?envId=...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const envId = request.nextUrl.searchParams.get('envId');
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const config = await getSiteConfig(siteId, envId);
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

// PUT /api/seo/config/[siteId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { envId, semrush_domain, enabled_features } = body;
    if (!envId) return NextResponse.json({ error: 'envId required' }, { status: 400 });

    const config = await upsertSiteConfig(siteId, envId, { semrush_domain, enabled_features });
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
