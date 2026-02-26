import { NextResponse } from 'next/server';
import { scanSite, scanAllSites } from '@/lib/discovery/scanner';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { siteId, envId } = body as { siteId?: string; envId?: string };

    if (siteId && envId) {
      // Scan a single site synchronously
      const result = await scanSite(siteId, envId);
      return NextResponse.json({
        message: result.success
          ? `Scan completed in ${(result.durationMs / 1000).toFixed(1)}s`
          : `Scan failed: ${result.error}`,
        ...result,
      });
    }

    // Scan all sites — fire and forget, return immediately
    scanAllSites({ skipIfScannedWithinDays: 7 }).catch(err => {
      console.error('[Discovery API] scanAllSites error:', err);
    });

    return NextResponse.json({
      message: 'Full site scan started in background. Check /api/discovery/status for progress.',
    });
  } catch (error) {
    console.error('[Discovery API] scan error:', error);
    return NextResponse.json(
      { error: 'Scan failed', details: String(error) },
      { status: 500 }
    );
  }
}
