import 'dotenv/config';
import { getDb } from '../src/lib/db';
import { getLiveEnvironments, getSitesNeedingScan } from '../src/lib/db/sites';
import { scanSite } from '../src/lib/discovery/scanner';

const args = process.argv.slice(2);

// Parse arguments
let targetSiteId: string | null = null;
let force = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--site' && args[i + 1]) {
    targetSiteId = args[i + 1];
    i++;
  } else if (args[i] === '--force') {
    force = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: npm run scan [options]

Options:
  --site <siteId>   Scan a single site by its ID
  --force           Scan all sites, even if scanned recently
  --help, -h        Show this help message

Examples:
  npm run scan                      # Scan sites not scanned in 7 days
  npm run scan -- --force           # Scan all live sites
  npm run scan -- --site abc123     # Scan one specific site
`);
    process.exit(0);
  }
}

async function main() {
  // Initialize DB
  getDb();

  if (targetSiteId) {
    // Scan a single site
    const allEnvs = getLiveEnvironments();
    const match = allEnvs.find(e => e.site_id === targetSiteId);
    if (!match) {
      console.error(`Site ${targetSiteId} not found or has no live environment.`);
      process.exit(1);
    }

    console.log(`Scanning "${match.site_name}"...`);
    const result = await scanSite(match.site_id, match.env_id);
    if (result.success) {
      console.log(`Done in ${(result.durationMs / 1000).toFixed(1)}s`);
    } else {
      console.error(`Failed: ${result.error}`);
      process.exit(1);
    }
    return;
  }

  // Scan all
  const sites = force
    ? getLiveEnvironments()
    : getSitesNeedingScan(7);

  if (sites.length === 0) {
    console.log('All sites are up to date (scanned within 7 days). Use --force to re-scan.');
    return;
  }

  console.log(`Scanning ${sites.length} site${sites.length === 1 ? '' : 's'}...\n`);

  let completed = 0;
  let failed = 0;

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const idx = `[${i + 1}/${sites.length}]`;

    process.stdout.write(`${idx} Scanning "${site.site_name}"...`);

    const result = await scanSite(site.site_id, site.env_id);

    if (result.success) {
      console.log(` done (${(result.durationMs / 1000).toFixed(1)}s)`);
      completed++;
    } else {
      console.log(` FAILED: ${result.error}`);
      failed++;
    }

    // Small delay between sites
    if (i < sites.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`\nComplete: ${completed} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
