'use client';

import { Fragment } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import type { ClaudeMode } from '@/stores/terminal-store';
import { useTerminal } from '@/hooks/useTerminal';
import { TerminalTabs } from './TerminalTabs';
import { TerminalInstance } from './TerminalInstance';
import { ClaudeMdEditor } from './ClaudeMdEditor';
import { WelcomeScreen } from '../dashboard/WelcomeScreen';
import { SEOPanel } from '../seo/SEOPanel';
import { PushEnvironmentMenu } from './PushEnvironmentMenu';

function ClaudeModePicker({ onSelect }: { onSelect: (mode: ClaudeMode) => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <h3 className="text-lg font-medium text-text-primary">
          Choose Claude Code Mode
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => onSelect('regular')}
            className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg border border-border bg-bg-secondary hover:bg-bg-tertiary/50 transition-colors"
          >
            <span className="text-sm font-medium text-text-primary">Regular</span>
            <span className="text-xs text-text-muted text-center">
              Claude will ask permission<br />before running commands
            </span>
          </button>
          <button
            onClick={() => onSelect('skip-permissions')}
            className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg border border-warning/50 bg-bg-secondary hover:bg-bg-tertiary/50 transition-colors"
          >
            <span className="text-sm font-medium text-warning">Skip Permissions</span>
            <span className="text-xs text-text-muted text-center">
              Claude runs commands<br />without asking first
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function TerminalPanel() {
  const { tabGroups, activeGroupIndex } = useTerminalStore();
  const { setActiveGroup, setActiveSubTab, setClaudeMode } = useTerminalStore();
  const { disconnectFromSite } = useTerminal();

  if (tabGroups.length === 0) {
    return <WelcomeScreen />;
  }

  const activeGroup = tabGroups[activeGroupIndex];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Site-level tabs */}
      <div className="flex bg-bg-secondary border-b border-border overflow-x-auto">
        {tabGroups.map((group, index) => (
          <div
            key={`${group.siteId}-${group.envId}`}
            className={`flex items-center gap-1 px-3 py-2 text-sm cursor-pointer border-r border-border min-w-0 ${
              index === activeGroupIndex
                ? 'bg-bg-primary text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/30'
            }`}
            onClick={() => setActiveGroup(index)}
          >
            <span className="truncate max-w-40">{group.siteName}</span>
            <span className="text-xs text-text-muted">({group.envName})</span>
            <PushEnvironmentMenu siteId={group.siteId} siteName={group.siteName} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                disconnectFromSite(group.siteId, group.envId);
              }}
              className="ml-1 text-text-muted hover:text-danger flex-shrink-0"
              title="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Sub-tabs for active group */}
      {activeGroup && (
        <TerminalTabs
          group={activeGroup}
          onSubTabChange={(tab) =>
            setActiveSubTab(activeGroup.siteId, activeGroup.envId, tab)
          }
        />
      )}

      {/* All groups' terminal instances — persistent across tab switches */}
      <div className="flex-1 relative overflow-hidden">
        {tabGroups.map((group, index) => {
          const isActive = index === activeGroupIndex;
          const showClaudePicker = isActive && group.activeSubTab === 'claude' && !group.claudeMode;

          return (
            <Fragment key={`${group.siteId}-${group.envId}`}>
              {/* Claude mode picker — only for active group, only when needed */}
              {showClaudePicker && (
                <ClaudeModePicker
                  onSelect={(mode) =>
                    setClaudeMode(group.siteId, group.envId, mode)
                  }
                />
              )}

              {/* Claude terminal — persists once mode is chosen */}
              {group.claudeMode && (
                <TerminalInstance
                  siteId={group.siteId}
                  envId={group.envId}
                  type="claude"
                  visible={isActive && group.activeSubTab === 'claude'}
                  claudeMode={group.claudeMode}
                />
              )}

              {/* SSH terminal — always persists */}
              <TerminalInstance
                siteId={group.siteId}
                envId={group.envId}
                type="ssh"
                visible={isActive && group.activeSubTab === 'ssh'}
              />

              {/* Non-terminal panels — only render for active group */}
              {isActive && group.activeSubTab === 'claude-md' && (
                <ClaudeMdEditor
                  siteId={group.siteId}
                  siteName={group.siteName}
                />
              )}
              {isActive && group.activeSubTab === 'seo' && (
                <SEOPanel
                  siteId={group.siteId}
                  envId={group.envId}
                  siteName={group.siteName}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
