import { resolveSSHConnection } from './ssh-executor';
import * as wp from './wp-cli';
import * as db from './queries';
import type { CrawlData, SSHConnectionInfo } from './types';

const SEO_META_KEYS = [
  '_yoast_wpseo_title',
  '_yoast_wpseo_metadesc',
  '_yoast_wpseo_focuskw',
  'rank_math_title',
  'rank_math_description',
  'rank_math_focus_keyword',
];

export async function crawlSite(siteId: string, envId: string): Promise<string> {
  // Create snapshot record
  const snapshot = await db.createCrawlSnapshot(siteId, envId);

  // Run crawl async (don't block the request)
  runCrawl(snapshot.id, siteId, envId).catch((err) => {
    console.error('[SEO Crawler] Unhandled error:', err);
    db.failCrawlSnapshot(snapshot.id, String(err)).catch(() => {});
  });

  return snapshot.id;
}

async function runCrawl(snapshotId: string, siteId: string, envId: string): Promise<void> {
  let conn: SSHConnectionInfo;
  try {
    conn = await resolveSSHConnection(envId);
  } catch (err) {
    await db.failCrawlSnapshot(snapshotId, `SSH connection failed: ${err instanceof Error ? err.message : err}`);
    return;
  }

  try {
    const crawlData = await gatherCrawlData(conn);
    const postCount = crawlData.posts.length;
    const pageCount = crawlData.pages.length;
    await db.completeCrawlSnapshot(snapshotId, crawlData, postCount, pageCount);
    console.log(`[SEO Crawler] Completed: ${postCount} posts, ${pageCount} pages`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.failCrawlSnapshot(snapshotId, message);
    console.error('[SEO Crawler] Failed:', message);
  }
}

async function gatherCrawlData(conn: SSHConnectionInfo): Promise<CrawlData> {
  // Parallel: fetch site info + lists
  const [siteUrl, siteTitle, permalinkStructure, theme, plugins, posts, pages, categories, tags] =
    await Promise.all([
      wp.getSiteUrl(conn),
      wp.getSiteTitle(conn),
      wp.getPermalinkStructure(conn),
      wp.getActiveTheme(conn),
      wp.listPlugins(conn),
      wp.listPosts(conn, 'post', 200),
      wp.listPosts(conn, 'page', 200),
      wp.listCategories(conn),
      wp.listTags(conn),
    ]);

  // Fetch SEO meta for each post/page (batched to avoid overwhelming)
  const seoPlugin = await wp.detectSEOPlugin(conn);
  const metaKeys = seoPlugin === 'yoast'
    ? ['_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_focuskw']
    : seoPlugin === 'rankmath'
    ? ['rank_math_title', 'rank_math_description', 'rank_math_focus_keyword']
    : SEO_META_KEYS;

  // Fetch meta for posts in batches of 5
  const allItems = [...posts, ...pages];
  for (let i = 0; i < allItems.length; i += 5) {
    const batch = allItems.slice(i, i + 5);
    const metaResults = await Promise.all(
      batch.map((item) => wp.getPostMeta(conn, item.ID, metaKeys))
    );
    batch.forEach((item, idx) => {
      item.meta = metaResults[idx];
    });
  }

  return {
    site_url: siteUrl,
    site_title: siteTitle,
    posts,
    pages,
    categories,
    tags,
    plugins,
    theme,
    permalink_structure: permalinkStructure,
  };
}
