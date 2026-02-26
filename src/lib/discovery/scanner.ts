import { resolveSSHConnection } from '../seo/ssh-executor';
import { getEnvironment } from '../db/sites';
import { getScanMetadata, setScanMetadata, getLiveEnvironments, getSitesNeedingScan } from '../db/sites';
import { getSiteClaudeMdPath, readClaudeMd, writeClaudeMd, ensureSiteWorkspace } from '../workspaces';
import { gatherSiteData } from './wp-commands';
import { renderClaudeMd } from './claude-md-template';
import { mergeClaudeMd } from './merge';
import type { ScanProgress } from './types';

const DELAY_BETWEEN_SITES_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// Global progress tracker for async scan-all
let currentProgress: ScanProgress | null = null;

export function getScanProgress(): ScanProgress | null {
  return currentProgress;
}

/**
 * Scan a single site: SSH in, gather WP-CLI data, render CLAUDE.md, merge with existing.
 */
export async function scanSite(siteId: string, envId: string): Promise<{ success: boolean; error?: string; durationMs: number }> {
  const startTime = Date.now();

  try {
    setScanMetadata(siteId, 'running');

    // Resolve SSH connection (fetches password from Kinsta API if needed)
    const conn = await resolveSSHConnection(envId);
    const env = getEnvironment(envId);
    if (!env) throw new Error(`Environment ${envId} not found`);

    // Gather all WP-CLI data in parallel
    const data = await gatherSiteData(conn, {
      host: conn.host,
      port: conn.port,
      username: conn.username,
    });

    // Render new CLAUDE.md content
    const newContent = renderClaudeMd(data);

    // Read existing CLAUDE.md
    ensureSiteWorkspace(siteId);
    const claudeMdPath = getSiteClaudeMdPath(siteId);
    const existingContent = readClaudeMd(claudeMdPath);

    // Merge (preserves manual sections)
    const merged = mergeClaudeMd(existingContent, newContent);

    // Write
    writeClaudeMd(claudeMdPath, merged);

    // Store scan data in DB
    setScanMetadata(siteId, 'completed', null, JSON.stringify(data));

    const durationMs = Date.now() - startTime;
    console.log(`[Discovery] Scanned ${data.siteTitle || siteId} in ${(durationMs / 1000).toFixed(1)}s`);

    return { success: true, durationMs };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Discovery] Failed to scan site ${siteId}:`, errorMsg);

    setScanMetadata(siteId, 'failed', errorMsg);

    return { success: false, error: errorMsg, durationMs };
  }
}

/**
 * Scan all live environments sequentially with delay between sites.
 * Optionally skip sites scanned within `skipIfScannedWithinDays`.
 */
export async function scanAllSites(options?: {
  skipIfScannedWithinDays?: number;
  onProgress?: (progress: ScanProgress) => void;
}): Promise<{ total: number; completed: number; failed: number; skipped: number }> {
  const skipDays = options?.skipIfScannedWithinDays;

  const sites = skipDays
    ? getSitesNeedingScan(skipDays)
    : getLiveEnvironments();

  const total = sites.length;
  let completed = 0;
  let failed = 0;

  currentProgress = {
    total,
    completed: 0,
    failed: 0,
    inProgress: null,
    startedAt: new Date().toISOString(),
  };

  console.log(`[Discovery] Starting scan of ${total} sites...`);

  for (const site of sites) {
    currentProgress.inProgress = site.site_name;
    options?.onProgress?.(currentProgress);

    const result = await scanSite(site.site_id, site.env_id);

    if (result.success) {
      completed++;
    } else {
      failed++;
    }

    currentProgress.completed = completed;
    currentProgress.failed = failed;
    options?.onProgress?.(currentProgress);

    // Delay between sites to avoid hammering SSH
    if (sites.indexOf(site) < sites.length - 1) {
      await delay(DELAY_BETWEEN_SITES_MS);
    }
  }

  currentProgress.inProgress = null;
  console.log(`[Discovery] Scan complete. ${completed} succeeded, ${failed} failed, ${total - completed - failed} skipped.`);

  const result = { total, completed, failed, skipped: 0 };
  currentProgress = null;
  return result;
}
