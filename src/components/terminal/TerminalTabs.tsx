'use client';

import type { SiteTabGroup, SubTab } from '@/stores/terminal-store';

interface TerminalTabsProps {
  group: SiteTabGroup;
  onSubTabChange: (tab: SubTab) => void;
}

interface TabDef {
  id: SubTab;
  label: string;
  group: 'core' | 'agents' | 'tools';
}

const TABS: TabDef[] = [
  { id: 'claude', label: 'Claude Code', group: 'core' },
  { id: 'ssh', label: 'SSH Terminal', group: 'core' },
  { id: 'claude-md', label: 'CLAUDE.md', group: 'core' },
  { id: 'security', label: 'Security', group: 'agents' },
  { id: 'seo-agent', label: 'SEO', group: 'agents' },
  { id: 'divi', label: 'Divi', group: 'agents' },
  { id: 'seo-engine', label: 'SEO Engine', group: 'tools' },
];

export function TerminalTabs({ group, onSubTabChange }: TerminalTabsProps) {
  let lastGroup = '';

  return (
    <div className="flex border-b border-border bg-bg-secondary">
      {TABS.map((tab) => {
        const showSeparator = tab.group !== lastGroup && lastGroup !== '';
        lastGroup = tab.group;

        return (
          <div key={tab.id} className="flex items-center">
            {showSeparator && (
              <div className="w-px h-5 bg-border mx-1" />
            )}
            <button
              onClick={() => onSubTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                group.activeSubTab === tab.id
                  ? 'text-accent border-b-2 border-accent bg-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
