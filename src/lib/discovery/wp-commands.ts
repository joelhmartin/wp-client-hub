import { sshExec } from '../seo/ssh-executor';
import type { SSHConnectionInfo } from '../seo/types';
import type { SiteDiscoveryData, ThemeInfo, PluginInfo, CustomPostType, DebuggingInfo, SSHDetails } from './types';

const WP_PATH = '~/public';

function wpCmd(cmd: string): string {
  return `cd ${WP_PATH} && ${cmd}`;
}

// ─── Individual WP-CLI Data Gatherers ───

async function getSiteUrl(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp option get siteurl'));
  return result.exitCode === 0 ? result.stdout.trim() : '';
}

async function getSiteTitle(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp option get blogname'));
  return result.exitCode === 0 ? result.stdout.trim() : '';
}

async function getWpVersion(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp core version'));
  return result.exitCode === 0 ? result.stdout.trim() : 'unknown';
}

async function getPhpVersion(conn: SSHConnectionInfo): Promise<string> {
  const result = await sshExec(conn, wpCmd('wp --info'));
  if (result.exitCode !== 0) return 'unknown';
  const match = result.stdout.match(/PHP binary:\s+.*?(\d+\.\d+\.\d+)/);
  if (match) return match[1];
  // Try alternate format
  const alt = result.stdout.match(/PHP version:\s+(\d+\.\d+\.\d+)/);
  return alt ? alt[1] : 'unknown';
}

async function getIsMultisite(conn: SSHConnectionInfo): Promise<boolean> {
  const result = await sshExec(conn, wpCmd("wp config get MULTISITE 2>/dev/null || echo 'false'"));
  if (result.exitCode !== 0) return false;
  const val = result.stdout.trim().toLowerCase();
  return val === 'true' || val === '1';
}

async function getThemeInfo(conn: SSHConnectionInfo): Promise<ThemeInfo> {
  const [themeListResult, templateResult, stylesheetResult] = await Promise.all([
    sshExec(conn, wpCmd('wp theme list --format=json')),
    sshExec(conn, wpCmd('wp option get template')),
    sshExec(conn, wpCmd('wp option get stylesheet')),
  ]);

  const template = templateResult.exitCode === 0 ? templateResult.stdout.trim() : '';
  const stylesheet = stylesheetResult.exitCode === 0 ? stylesheetResult.stdout.trim() : '';

  let themes: Array<{ name: string; status: string; version: string }> = [];
  if (themeListResult.exitCode === 0) {
    try { themes = JSON.parse(themeListResult.stdout); } catch {}
  }

  const isChildTheme = template !== stylesheet;
  const activeTheme = themes.find(t => t.name === stylesheet);
  const parentThemeObj = isChildTheme ? themes.find(t => t.name === template) : null;

  // Detect Divi
  const isDivi = template === 'Divi' || template === 'divi' || themes.some(t => t.name.toLowerCase() === 'divi');
  const diviTheme = themes.find(t => t.name.toLowerCase() === 'divi');

  return {
    activeTheme: stylesheet,
    parentTheme: isChildTheme ? template : null,
    childTheme: isChildTheme ? stylesheet : null,
    isDivi,
    diviVersion: isDivi && diviTheme ? diviTheme.version : null,
    childThemePath: isChildTheme ? `/wp-content/themes/${stylesheet}/` : null,
  };
}

async function getPluginList(conn: SSHConnectionInfo): Promise<PluginInfo[]> {
  const result = await sshExec(conn, wpCmd('wp plugin list --format=json'));
  if (result.exitCode !== 0) return [];
  try {
    const plugins = JSON.parse(result.stdout) as Array<{
      name: string;
      status: string;
      version: string;
      update: string;
    }>;
    return plugins.map(p => ({
      name: p.name,
      status: p.status as PluginInfo['status'],
      version: p.version,
      updateAvailable: p.update === 'available',
    }));
  } catch {
    return [];
  }
}

async function getCustomPostTypes(conn: SSHConnectionInfo): Promise<CustomPostType[]> {
  const result = await sshExec(conn, wpCmd('wp post-type list --format=json'));
  if (result.exitCode !== 0) return [];

  const BUILTIN_TYPES = new Set([
    'post', 'page', 'attachment', 'revision', 'nav_menu_item',
    'custom_css', 'customize_changeset', 'oembed_cache',
    'user_request', 'wp_block', 'wp_template', 'wp_template_part',
    'wp_global_styles', 'wp_navigation', 'wp_font_family', 'wp_font_face',
    'wp_pattern',
  ]);

  try {
    const types = JSON.parse(result.stdout) as Array<{
      name: string;
      label: string;
      public: boolean | string;
      has_archive: boolean | string;
    }>;
    return types
      .filter(t => !BUILTIN_TYPES.has(t.name))
      .map(t => ({
        name: t.name,
        label: t.label,
        isPublic: t.public === true || t.public === '1' || t.public === 'true',
        hasArchive: t.has_archive === true || t.has_archive === '1' || t.has_archive === 'true',
      }));
  } catch {
    return [];
  }
}

async function getDebuggingInfo(conn: SSHConnectionInfo): Promise<DebuggingInfo> {
  const [debugResult, logResult, displayResult] = await Promise.all([
    sshExec(conn, wpCmd("wp config get WP_DEBUG 2>/dev/null || echo 'false'")),
    sshExec(conn, wpCmd("wp config get WP_DEBUG_LOG 2>/dev/null || echo 'false'")),
    sshExec(conn, wpCmd("wp config get WP_DEBUG_DISPLAY 2>/dev/null || echo 'false'")),
  ]);

  function parseBool(result: { exitCode: number; stdout: string }): boolean {
    if (result.exitCode !== 0) return false;
    const val = result.stdout.trim().toLowerCase();
    return val === 'true' || val === '1';
  }

  return {
    wpDebug: parseBool(debugResult),
    wpDebugLog: parseBool(logResult),
    wpDebugDisplay: parseBool(displayResult),
  };
}

async function getWpPath(conn: SSHConnectionInfo): Promise<string> {
  // Try to find the actual WP path
  const result = await sshExec(conn, wpCmd('wp eval "echo ABSPATH;"'));
  if (result.exitCode === 0 && result.stdout.trim()) {
    return result.stdout.trim();
  }
  return '~/public';
}

// ─── Main Discovery Function ───

export async function gatherSiteData(
  conn: SSHConnectionInfo,
  sshDetails: Omit<SSHDetails, 'wpPath'>
): Promise<SiteDiscoveryData> {
  const startTime = Date.now();

  // Run all independent commands in parallel
  const [
    siteUrl,
    siteTitle,
    wpVersion,
    phpVersion,
    isMultisite,
    themes,
    plugins,
    customPostTypes,
    debugging,
    wpPath,
  ] = await Promise.all([
    getSiteUrl(conn),
    getSiteTitle(conn),
    getWpVersion(conn),
    getPhpVersion(conn),
    getIsMultisite(conn),
    getThemeInfo(conn),
    getPluginList(conn),
    getCustomPostTypes(conn),
    getDebuggingInfo(conn),
    getWpPath(conn),
  ]);

  return {
    siteUrl,
    siteTitle,
    wpVersion,
    phpVersion,
    isMultisite,
    themes,
    plugins,
    customPostTypes,
    debugging,
    sshDetails: {
      ...sshDetails,
      wpPath,
    },
    scannedAt: new Date().toISOString(),
    scanDurationMs: Date.now() - startTime,
  };
}
