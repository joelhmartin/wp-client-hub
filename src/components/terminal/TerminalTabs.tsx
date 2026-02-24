'use client';

import type { SiteTabGroup } from '@/stores/terminal-store';

type SubTab = 'claude' | 'ssh' | 'claude-md' | 'seo';

interface TerminalTabsProps {
  group: SiteTabGroup;
  onSubTabChange: (tab: SubTab) => void;
}

const TABS: { id: SubTab; label: string }[] = [
  { id: 'claude', label: 'Claude Code' },
  { id: 'ssh', label: 'SSH Terminal' },
  { id: 'claude-md', label: 'CLAUDE.md' },
  { id: 'seo', label: 'SEO' },
];

export function TerminalTabs({ group, onSubTabChange }: TerminalTabsProps) {
  return (
    <div className="flex border-b border-border bg-bg-secondary">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSubTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            group.activeSubTab === tab.id
              ? 'text-accent border-b-2 border-accent bg-bg-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
