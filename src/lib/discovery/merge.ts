const AUTO_SCAN_MARKER = '<!-- AUTO-SCAN -->';

interface Section {
  heading: string;
  content: string;
  isAutoScan: boolean;
}

/**
 * Merge new auto-scanned CLAUDE.md content with existing content,
 * preserving manually-written sections (Issue Log, Agent Notes, etc.)
 */
export function mergeClaudeMd(existingContent: string, newContent: string): string {
  // If no existing content, use new content as-is
  if (!existingContent.trim()) {
    return newContent;
  }

  const existingSections = parseSections(existingContent);
  const newSections = parseSections(newContent);

  // Build a map of new sections by heading for lookup
  const newSectionMap = new Map<string, Section>();
  for (const s of newSections) {
    newSectionMap.set(normalizeHeading(s.heading), s);
  }

  // Track which new sections we've placed
  const placed = new Set<string>();

  // Start with the title (# heading) from new content if available
  const newTitle = newSections.find(s => s.heading.startsWith('# ') && !s.heading.startsWith('## '));
  const existingTitle = existingSections.find(s => s.heading.startsWith('# ') && !s.heading.startsWith('## '));

  const resultSections: Section[] = [];

  // Use new title if it exists, otherwise keep existing
  if (newTitle) {
    resultSections.push(newTitle);
    placed.add(normalizeHeading(newTitle.heading));
  } else if (existingTitle) {
    resultSections.push(existingTitle);
  }

  // Process existing ## sections in order
  for (const existing of existingSections) {
    if (existing.heading.startsWith('# ') && !existing.heading.startsWith('## ')) {
      continue; // Already handled title
    }

    const key = normalizeHeading(existing.heading);

    if (existing.isAutoScan) {
      // Replace auto-scan sections with new version
      const replacement = newSectionMap.get(key);
      if (replacement) {
        resultSections.push(replacement);
        placed.add(key);
      }
      // If no replacement found, drop the old auto-scan section (data no longer collected)
    } else {
      // Preserve manual sections as-is
      resultSections.push(existing);
      placed.add(key);
    }
  }

  // Add any new sections that weren't in the old file
  // Insert them before Issue Log / Agent Notes
  const manualSectionNames = new Set(['issue log', 'agent notes']);
  const newUnplaced = newSections.filter(s => {
    if (s.heading.startsWith('# ') && !s.heading.startsWith('## ')) return false;
    return !placed.has(normalizeHeading(s.heading));
  });

  if (newUnplaced.length > 0) {
    // Find index of first manual section
    const insertIdx = resultSections.findIndex(s =>
      manualSectionNames.has(normalizeHeading(s.heading).replace('## ', ''))
    );

    if (insertIdx >= 0) {
      resultSections.splice(insertIdx, 0, ...newUnplaced);
    } else {
      resultSections.push(...newUnplaced);
    }
  }

  // Ensure Issue Log and Agent Notes exist at the end
  const hasIssueLog = resultSections.some(s => normalizeHeading(s.heading).includes('issue log'));
  const hasAgentNotes = resultSections.some(s => normalizeHeading(s.heading).includes('agent notes'));

  if (!hasIssueLog) {
    resultSections.push({ heading: '## Issue Log', content: '\n', isAutoScan: false });
  }
  if (!hasAgentNotes) {
    resultSections.push({ heading: '## Agent Notes', content: '\n', isAutoScan: false });
  }

  return resultSections.map(s => `${s.heading}\n${s.content}`).join('\n');
}

function parseSections(content: string): Section[] {
  const lines = content.split('\n');
  const sections: Section[] = [];

  let currentHeading = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.match(/^#{1,2}\s+/)) {
      // Save previous section
      if (currentHeading) {
        const sectionContent = currentLines.join('\n');
        const isAutoScan = sectionContent.includes(AUTO_SCAN_MARKER) || currentHeading.includes(AUTO_SCAN_MARKER);
        sections.push({
          heading: currentHeading,
          content: sectionContent,
          isAutoScan,
        });
      }
      currentHeading = line;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentHeading) {
    const sectionContent = currentLines.join('\n');
    const isAutoScan = sectionContent.includes(AUTO_SCAN_MARKER) || currentHeading.includes(AUTO_SCAN_MARKER);
    sections.push({
      heading: currentHeading,
      content: sectionContent,
      isAutoScan,
    });
  }

  return sections;
}

function normalizeHeading(heading: string): string {
  return heading
    .replace(AUTO_SCAN_MARKER, '')
    .trim()
    .toLowerCase();
}
