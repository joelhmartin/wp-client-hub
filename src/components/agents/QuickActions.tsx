'use client';

type AgentType = 'security' | 'seo-agent' | 'divi';

interface QuickActionsProps {
  agentType: AgentType;
  onAction: (instruction: string) => void;
}

interface QuickAction {
  label: string;
  instruction: string;
}

const ACTIONS: Record<AgentType, QuickAction[]> = {
  security: [
    { label: 'Full Audit', instruction: 'Run a full security audit on this site following your standard audit procedure. Present findings by severity.' },
    { label: 'Check Updates', instruction: 'Check for available updates on WordPress core, all plugins, and all themes. Flag any with known vulnerabilities.' },
    { label: 'List Admins', instruction: 'List all administrator users with their email, registration date, and last login. Flag any suspicious accounts.' },
    { label: 'Verify Checksums', instruction: 'Run wp core verify-checksums to check file integrity and report any modified or unexpected files.' },
    { label: 'DB Backup', instruction: 'Create a database backup using wp db export and report the file size and location.' },
  ],
  'seo-agent': [
    { label: 'SEO Audit', instruction: 'Run a full technical SEO audit on this site following your standard audit procedure. Present findings by severity.' },
    { label: 'Check Indexability', instruction: 'Check the site\'s indexability: blog_public option, robots.txt, XML sitemap status, and noindex meta tags.' },
    { label: 'Missing Meta', instruction: 'Find all published pages and posts that are missing SEO titles or meta descriptions.' },
    { label: 'Thin Content', instruction: 'Find published pages with thin content (under 300 words) and empty pages. List them with approximate word counts.' },
    { label: 'Permalink Check', instruction: 'Check the permalink structure, verify HTTPS, and check for www/non-www consistency.' },
  ],
  divi: [
    { label: 'Detect Version', instruction: 'Detect the Divi version, check if a child theme is active, and report the theme stack details.' },
    { label: 'List Divi Pages', instruction: 'List all published pages that use the Divi Builder, showing their IDs, titles, and module counts.' },
    { label: 'Library Items', instruction: 'List all Divi Library items with their IDs, titles, types, and whether they are global modules.' },
    { label: 'Theme Builder', instruction: 'Show all Theme Builder templates including headers, footers, body layouts, and their assignments.' },
    { label: 'Page Audit', instruction: 'Audit this site\'s Divi pages for performance issues: high module counts, unused library items, and missing image optimization.' },
  ],
};

const AGENT_COLORS: Record<AgentType, string> = {
  security: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20',
  'seo-agent': 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
  divi: 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/20',
};

export function QuickActions({ agentType, onAction }: QuickActionsProps) {
  const actions = ACTIONS[agentType];
  const colorClass = AGENT_COLORS[agentType];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border-b border-border overflow-x-auto">
      <span className="text-xs text-text-muted flex-shrink-0 mr-1">Quick:</span>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.instruction)}
          className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors flex-shrink-0 ${colorClass}`}
          title={action.instruction}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
