import type { SiteDiscoveryData } from './types';

const AUTO_SCAN = '<!-- AUTO-SCAN -->';

export function renderClaudeMd(data: SiteDiscoveryData): string {
  const sections: string[] = [];

  // Title
  sections.push(`# ${data.siteTitle || 'Unknown Site'}`);

  // Site Details
  sections.push(renderSiteDetails(data));

  // Theme & Architecture
  sections.push(renderThemeArchitecture(data));

  // Key Plugins
  sections.push(renderPlugins(data));

  // Custom Post Types
  if (data.customPostTypes.length > 0) {
    sections.push(renderCustomPostTypes(data));
  }

  // Debugging
  sections.push(renderDebugging(data));

  // Manual sections (empty for first-time generation)
  sections.push(`## Issue Log\n`);
  sections.push(`## Agent Notes\n`);

  return sections.join('\n');
}

function renderSiteDetails(data: SiteDiscoveryData): string {
  const lines = [
    `## Site Details ${AUTO_SCAN}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| URL | ${data.siteUrl || 'unknown'} |`,
    `| WordPress | ${data.wpVersion} |`,
    `| PHP | ${data.phpVersion} |`,
    `| Multisite | ${data.isMultisite ? 'Yes' : 'No'} |`,
    `| SSH Host | ${data.sshDetails.host} |`,
    `| SSH Port | ${data.sshDetails.port} |`,
    `| SSH User | ${data.sshDetails.username} |`,
    `| WP Path | ${data.sshDetails.wpPath} |`,
    `| Last Scanned | ${formatDate(data.scannedAt)} |`,
    '',
  ];
  return lines.join('\n');
}

function renderThemeArchitecture(data: SiteDiscoveryData): string {
  const { themes } = data;
  const lines = [
    `## Theme & Architecture ${AUTO_SCAN}`,
    '',
  ];

  if (themes.parentTheme) {
    lines.push(`- **Parent Theme**: ${themes.parentTheme}${themes.isDivi && themes.diviVersion ? ` (Divi v${themes.diviVersion})` : ''}`);
    lines.push(`- **Child Theme**: ${themes.childTheme}`);
    if (themes.childThemePath) {
      lines.push(`- **Child Theme Path**: \`${themes.childThemePath}\``);
    }
  } else {
    lines.push(`- **Active Theme**: ${themes.activeTheme}${themes.isDivi && themes.diviVersion ? ` (Divi v${themes.diviVersion})` : ''}`);
  }

  if (themes.isDivi) {
    lines.push(`- **Divi**: Yes${themes.diviVersion ? ` (v${themes.diviVersion})` : ''}`);
  }

  lines.push('');
  return lines.join('\n');
}

function renderPlugins(data: SiteDiscoveryData): string {
  const active = data.plugins.filter(p => p.status === 'active').sort((a, b) => a.name.localeCompare(b.name));
  const inactive = data.plugins.filter(p => p.status === 'inactive');
  const mustUse = data.plugins.filter(p => p.status === 'must-use');
  const withUpdates = data.plugins.filter(p => p.updateAvailable);

  const lines = [
    `## Key Plugins ${AUTO_SCAN}`,
    '',
  ];

  if (active.length > 0) {
    lines.push(`### Active (${active.length})`);
    lines.push('');
    lines.push('| Plugin | Version |');
    lines.push('|--------|---------|');
    for (const p of active) {
      const update = p.updateAvailable ? ' *' : '';
      lines.push(`| ${p.name} | ${p.version}${update} |`);
    }
    lines.push('');
  }

  if (mustUse.length > 0) {
    lines.push(`### Must-Use (${mustUse.length})`);
    lines.push('');
    for (const p of mustUse) {
      lines.push(`- ${p.name} (${p.version})`);
    }
    lines.push('');
  }

  if (inactive.length > 0) {
    lines.push(`*${inactive.length} inactive plugin${inactive.length === 1 ? '' : 's'}*`);
    lines.push('');
  }

  if (withUpdates.length > 0) {
    lines.push(`*${withUpdates.length} update${withUpdates.length === 1 ? '' : 's'} available (marked with \\*)*`);
    lines.push('');
  }

  return lines.join('\n');
}

function renderCustomPostTypes(data: SiteDiscoveryData): string {
  const lines = [
    `## Custom Post Types ${AUTO_SCAN}`,
    '',
    '| Name | Label | Public | Archive |',
    '|------|-------|--------|---------|',
  ];

  for (const cpt of data.customPostTypes) {
    lines.push(`| ${cpt.name} | ${cpt.label} | ${cpt.isPublic ? 'Yes' : 'No'} | ${cpt.hasArchive ? 'Yes' : 'No'} |`);
  }

  lines.push('');
  return lines.join('\n');
}

function renderDebugging(data: SiteDiscoveryData): string {
  const { debugging } = data;
  const lines = [
    `## Debugging ${AUTO_SCAN}`,
    '',
    `- **WP_DEBUG**: ${debugging.wpDebug ? 'Enabled' : 'Disabled'}`,
    `- **WP_DEBUG_LOG**: ${debugging.wpDebugLog ? 'Enabled' : 'Disabled'}`,
    `- **WP_DEBUG_DISPLAY**: ${debugging.wpDebugDisplay ? 'Enabled' : 'Disabled'}`,
    '',
  ];
  return lines.join('\n');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return iso;
  }
}
