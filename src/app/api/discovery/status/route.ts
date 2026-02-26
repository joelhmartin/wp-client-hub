import { NextResponse } from 'next/server';
import { getScanProgress } from '@/lib/discovery/scanner';
import { getStaleScannedSiteCount } from '@/lib/db/sites';

export async function GET() {
  const progress = getScanProgress();
  const staleCount = getStaleScannedSiteCount(30);

  return NextResponse.json({
    scanning: progress !== null,
    progress,
    staleSites: staleCount,
  });
}
