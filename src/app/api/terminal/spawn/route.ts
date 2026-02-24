import { NextResponse } from 'next/server';
import { terminalManager } from '@/lib/terminal-manager';
import { getEnvironment, getSiteWithEnvironments } from '@/lib/db/sites';
import { getSSHPassword } from '@/lib/kinsta-api';
import { encryptPassword } from '@/lib/db';
import { setEnvironmentPassword } from '@/lib/db/sites';

export async function POST(request: Request) {
  try {
    const { siteId, envId, type } = await request.json();

    if (!siteId || !envId || !type) {
      return NextResponse.json({ error: 'Missing siteId, envId, or type' }, { status: 400 });
    }

    if (type !== 'claude' && type !== 'ssh') {
      return NextResponse.json({ error: 'type must be "claude" or "ssh"' }, { status: 400 });
    }

    const site = getSiteWithEnvironments(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const env = getEnvironment(envId);
    if (!env) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
    }

    // Get password - try cached first, then fetch from Kinsta API
    let password = env.ssh_password;
    if (!password) {
      password = await getSSHPassword(envId);
      if (password) {
        setEnvironmentPassword(envId, encryptPassword(password));
      }
    }

    if (!password) {
      // Fall back to user password from env vars
      password = process.env.KINSTA_USER_PASSWORD || '';
    }

    const sessionId = terminalManager.spawn({
      siteId,
      envId,
      type,
      siteName: site.site_name,
      envName: env.environment_name,
      sshHost: env.ssh_host,
      sshPort: env.ssh_port,
      sshUsername: env.ssh_username,
      sshPassword: password,
    });

    return NextResponse.json({ sessionId, type });
  } catch (error) {
    console.error('Failed to spawn terminal:', error);
    return NextResponse.json({ error: 'Failed to spawn terminal' }, { status: 500 });
  }
}
