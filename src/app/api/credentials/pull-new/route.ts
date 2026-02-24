import { NextResponse } from 'next/server';
import { listAllSites, getEnvironmentDetail, getSSHPassword } from '@/lib/kinsta-api';
import { getExistingSiteIds, upsertSite, upsertEnvironment, setEnvironmentPassword, getEnvironmentsMissingPasswords } from '@/lib/db/sites';
import { encryptPassword } from '@/lib/db';

// Pause between password fetches to avoid Kinsta API rate limits
const PASSWORD_FETCH_DELAY_MS = 500;

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function POST() {
  try {
    const existingIds = getExistingSiteIds();
    const kinstaSites = await listAllSites();

    let newSiteCount = 0;
    let newEnvCount = 0;

    for (const site of kinstaSites) {
      const isNew = !existingIds.has(site.id);
      if (isNew) {
        newSiteCount++;
      }

      upsertSite(site.id, site.display_name || site.name);

      for (const env of site.environments || []) {
        if (isNew) newEnvCount++;

        // Fetch full environment details
        try {
          const detail = await getEnvironmentDetail(env.id);
          const isLive = (env.display_name || env.name || '').toLowerCase() === 'live' ? 1 : 0;

          upsertEnvironment({
            id: env.id,
            site_id: site.id,
            environment_name: env.display_name || env.name,
            primary_domain: detail.primary_domain?.name || null,
            ssh_host: detail.ssh_connection?.ssh_ip?.external_ip || '',
            ssh_ip: detail.ssh_connection?.ssh_ip?.external_ip || '',
            ssh_port: detail.ssh_connection?.ssh_port || 0,
            ssh_username: detail.container_info?.ssh_username || '',
            ssh_command: detail.ssh_connection && detail.container_info
              ? `ssh ${detail.container_info.ssh_username}@${detail.ssh_connection.ssh_ip.external_ip} -p ${detail.ssh_connection.ssh_port}`
              : '',
            is_live: isLive,
          });
        } catch (err) {
          console.error(`Failed to fetch env detail for ${env.id}:`, err);
        }
      }
    }

    // Fetch passwords for ALL environments missing them, not just new ones
    const missingPasswordEnvs = getEnvironmentsMissingPasswords();
    let passwordsFetched = 0;
    let passwordsFailed = 0;

    console.log(`[Pull] Fetching passwords for ${missingPasswordEnvs.length} environments missing credentials...`);

    for (const envId of missingPasswordEnvs) {
      try {
        const password = await getSSHPassword(envId);
        if (password) {
          setEnvironmentPassword(envId, encryptPassword(password));
          passwordsFetched++;
        } else {
          passwordsFailed++;
        }
      } catch (err) {
        console.error(`Failed to fetch password for ${envId}:`, err);
        passwordsFailed++;
      }
      // Pace requests to avoid rate limits
      await delay(PASSWORD_FETCH_DELAY_MS);
    }

    console.log(`[Pull] Done. Fetched ${passwordsFetched} passwords, ${passwordsFailed} failed.`);

    return NextResponse.json({
      message: `Found ${newSiteCount} new sites. Fetched ${passwordsFetched} passwords (${passwordsFailed} failed, ${missingPasswordEnvs.length} were missing).`,
      newSiteCount,
      newEnvCount,
      totalKinstaSites: kinstaSites.length,
      passwordsFetched,
      passwordsFailed,
      passwordsMissing: missingPasswordEnvs.length,
    });
  } catch (error) {
    console.error('Pull new credentials failed:', error);
    return NextResponse.json({ error: 'Failed to pull credentials' }, { status: 500 });
  }
}
