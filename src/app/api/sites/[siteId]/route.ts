import { NextResponse } from 'next/server';
import { getSiteWithEnvironments } from '@/lib/db/sites';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const site = getSiteWithEnvironments(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Strip passwords from response
    const safeSite = {
      ...site,
      environments: site.environments.map(({ ssh_password, ...env }) => ({
        ...env,
        has_password: !!ssh_password,
      })),
    };

    return NextResponse.json({ site: safeSite });
  } catch (error) {
    console.error('Failed to get site:', error);
    return NextResponse.json({ error: 'Failed to get site' }, { status: 500 });
  }
}
