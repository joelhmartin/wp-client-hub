import { sshExec } from './ssh-executor';
import type { SSHConnectionInfo, SSHExecResult, WPPost, WPTerm, WPPlugin } from './types';

// Kinsta WordPress root — all WP-CLI commands run from here
const WP_PATH = '~/public';

function wpCmd(cmd: string): string {
  return `cd ${WP_PATH} && ${cmd}`;
}

// ─── Read Operations ───

export async function getSiteUrl(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp option get siteurl'));
  if (result.exitCode !== 0) throw new WPCLIError('siteurl', result);
  return result.stdout.trim();
}

export async function getSiteTitle(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp option get blogname'));
  if (result.exitCode !== 0) throw new WPCLIError('blogname', result);
  return result.stdout.trim();
}

export async function getPermalinkStructure(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp option get permalink_structure'));
  if (result.exitCode !== 0) return '';
  return result.stdout.trim();
}

export async function getActiveTheme(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp theme list --status=active --format=json'));
  if (result.exitCode !== 0) return 'unknown';
  try {
    const themes = JSON.parse(result.stdout);
    return themes[0]?.name || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function listPlugins(conn: SSHConnectionInfo): Promise<WPPlugin[]> {
  const result = await sshExec(conn, wpCmd('wp plugin list --format=json'));
  if (result.exitCode !== 0) return [];
  try {
    return JSON.parse(result.stdout);
  } catch {
    return [];
  }
}

export async function listPosts(
  conn: SSHConnectionInfo,
  postType: 'post' | 'page' = 'post',
  limit = 100
): Promise<WPPost[]> {
  const fields = 'ID,post_title,post_name,post_status,post_type,post_date,post_modified,post_excerpt,url';
  const result = await sshExec(
    conn,
    wpCmd(`wp post list --post_type=${postType} --post_status=publish --fields=${fields} --format=json --posts_per_page=${limit}`),
    60000 // 60s for large sites
  );
  if (result.exitCode !== 0) throw new WPCLIError(`list ${postType}s`, result);
  try {
    const posts: WPPost[] = JSON.parse(result.stdout);
    return posts.map((p) => ({ ...p, meta: {}, post_content: '' }));
  } catch {
    throw new WPCLIError(`parse ${postType} list`, result);
  }
}

export async function getPost(conn: SSHConnectionInfo, postId: number): Promise<WPPost | null> {
  const fields = 'ID,post_title,post_name,post_status,post_type,post_date,post_modified,post_excerpt,post_content,url';
  const result = await sshExec(
    conn,
    wpCmd(`wp post get ${postId} --fields=${fields} --format=json`)
  );
  if (result.exitCode !== 0) return null;
  try {
    const post = JSON.parse(result.stdout);
    return { ...post, meta: {} };
  } catch {
    return null;
  }
}

export async function getPostMeta(
  conn: SSHConnectionInfo,
  postId: number,
  metaKeys: string[]
): Promise<Record<string, string>> {
  const meta: Record<string, string> = {};
  for (const key of metaKeys) {
    const result = await sshExec(conn, wpCmd(`wp post meta get ${postId} ${shellEscape(key)}`));
    if (result.exitCode === 0 && result.stdout.trim()) {
      meta[key] = result.stdout.trim();
    }
  }
  return meta;
}

export async function listCategories(conn: SSHConnectionInfo): Promise<WPTerm[]> {
  const result = await sshExec(
    conn,
    wpCmd('wp term list category --fields=term_id,name,slug,count,description --format=json')
  );
  if (result.exitCode !== 0) return [];
  try {
    const terms = JSON.parse(result.stdout);
    return terms.map((t: WPTerm) => ({ ...t, taxonomy: 'category' }));
  } catch {
    return [];
  }
}

export async function listTags(conn: SSHConnectionInfo): Promise<WPTerm[]> {
  const result = await sshExec(
    conn,
    wpCmd('wp term list post_tag --fields=term_id,name,slug,count,description --format=json')
  );
  if (result.exitCode !== 0) return [];
  try {
    const terms = JSON.parse(result.stdout);
    return terms.map((t: WPTerm) => ({ ...t, taxonomy: 'post_tag' }));
  } catch {
    return [];
  }
}

// ─── Write Operations ───

export async function updatePostTitle(
  conn: SSHConnectionInfo,
  postId: number,
  title: string
): Promise<SSHExecResult> {
  return sshExec(conn, wpCmd(`wp post update ${postId} --post_title=${shellEscape(title)}`));
}

export async function updatePostExcerpt(
  conn: SSHConnectionInfo,
  postId: number,
  excerpt: string
): Promise<SSHExecResult> {
  return sshExec(conn, wpCmd(`wp post update ${postId} --post_excerpt=${shellEscape(excerpt)}`));
}

export async function updatePostSlug(
  conn: SSHConnectionInfo,
  postId: number,
  slug: string
): Promise<SSHExecResult> {
  return sshExec(conn, wpCmd(`wp post update ${postId} --post_name=${shellEscape(slug)}`));
}

export async function updatePostMeta(
  conn: SSHConnectionInfo,
  postId: number,
  metaKey: string,
  metaValue: string
): Promise<SSHExecResult> {
  return sshExec(conn, wpCmd(`wp post meta update ${postId} ${shellEscape(metaKey)} ${shellEscape(metaValue)}`));
}

export async function updatePostContent(
  conn: SSHConnectionInfo,
  postId: number,
  content: string
): Promise<SSHExecResult> {
  // For large content, use stdin via echo pipe
  const escaped = content.replace(/'/g, "'\\''");
  return sshExec(
    conn,
    wpCmd(`echo '${escaped}' | wp post update ${postId} --post_content=-`),
    60000
  );
}

export async function createPost(
  conn: SSHConnectionInfo,
  params: { title: string; content: string; post_type: string; status?: string }
): Promise<SSHExecResult> {
  const status = params.status || 'draft';
  return sshExec(
    conn,
    wpCmd(`wp post create --post_title=${shellEscape(params.title)} --post_type=${params.post_type} --post_status=${status} --porcelain`)
  );
}

// ─── Plugin-Specific Operations ───

export async function getYoastMeta(
  conn: SSHConnectionInfo,
  postId: number
): Promise<{ title: string; description: string; focusKeyword: string }> {
  const meta = await getPostMeta(conn, postId, [
    '_yoast_wpseo_title',
    '_yoast_wpseo_metadesc',
    '_yoast_wpseo_focuskw',
  ]);
  return {
    title: meta['_yoast_wpseo_title'] || '',
    description: meta['_yoast_wpseo_metadesc'] || '',
    focusKeyword: meta['_yoast_wpseo_focuskw'] || '',
  };
}

export async function getRankMathMeta(
  conn: SSHConnectionInfo,
  postId: number
): Promise<{ title: string; description: string; focusKeyword: string }> {
  const meta = await getPostMeta(conn, postId, [
    'rank_math_title',
    'rank_math_description',
    'rank_math_focus_keyword',
  ]);
  return {
    title: meta['rank_math_title'] || '',
    description: meta['rank_math_description'] || '',
    focusKeyword: meta['rank_math_focus_keyword'] || '',
  };
}

export async function detectSEOPlugin(conn: SSHConnectionInfo): Promise<'yoast' | 'rankmath' | 'none'> {
  const plugins = await listPlugins(conn);
  for (const p of plugins) {
    if (p.status !== 'active') continue;
    if (p.name.includes('wordpress-seo') || p.name === 'wordpress-seo') return 'yoast';
    if (p.name.includes('seo-by-rank-math') || p.name === 'seo-by-rank-math') return 'rankmath';
  }
  return 'none';
}

// ─── Helpers ───

function shellEscape(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

export class WPCLIError extends Error {
  public result: SSHExecResult;
  constructor(operation: string, result: SSHExecResult) {
    super(`WP-CLI ${operation} failed (exit ${result.exitCode}): ${result.stderr.slice(0, 200)}`);
    this.name = 'WPCLIError';
    this.result = result;
  }
}
