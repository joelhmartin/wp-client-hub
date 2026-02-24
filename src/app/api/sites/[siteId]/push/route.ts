import { NextResponse } from 'next/server';
import { getSiteWithEnvironments } from '@/lib/db/sites';
import { pushEnvironment } from '@/lib/kinsta-api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { direction } = await request.json();

    if (direction !== 'staging-to-live' && direction !== 'live-to-staging') {
      return NextResponse.json(
        { error: 'Invalid direction. Must be "staging-to-live" or "live-to-staging"' },
        { status: 400 }
      );
    }

    const site = getSiteWithEnvironments(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const liveEnv = site.environments.find((e) => e.is_live === 1);
    const stagingEnv = site.environments.find((e) => e.is_live === 0);

    if (!liveEnv || !stagingEnv) {
      return NextResponse.json(
        { error: 'Site must have both live and staging environments' },
        { status: 400 }
      );
    }

    const sourceEnvId = direction === 'staging-to-live' ? stagingEnv.id : liveEnv.id;
    const targetEnvId = direction === 'staging-to-live' ? liveEnv.id : stagingEnv.id;

    const result = await pushEnvironment(siteId, sourceEnvId, targetEnvId);

    return NextResponse.json({
      operation_id: result.operation_id,
      direction,
      source: direction === 'staging-to-live' ? stagingEnv.environment_name : liveEnv.environment_name,
      target: direction === 'staging-to-live' ? liveEnv.environment_name : stagingEnv.environment_name,
    });
  } catch (error) {
    console.error('Push environment failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Push failed' },
      { status: 500 }
    );
  }
}
