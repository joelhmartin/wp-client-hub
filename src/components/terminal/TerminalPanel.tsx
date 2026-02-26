'use client';

import { Fragment, useState, useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';
import type { ClaudeMode, SubTab } from '@/stores/terminal-store';
import { useTerminal } from '@/hooks/useTerminal';
import { TerminalTabs } from './TerminalTabs';
import { TerminalInstance } from './TerminalInstance';
import { ClaudeMdEditor } from './ClaudeMdEditor';
import { WelcomeScreen } from '../dashboard/WelcomeScreen';
import { SEOPanel } from '../seo/SEOPanel';
import { PushEnvironmentMenu } from './PushEnvironmentMenu';
import { AgentTerminal } from '../agents/AgentTerminal';

type AgentType = 'security' | 'seo-agent' | 'divi';

const AGENT_TABS: SubTab[] = ['security', 'seo-agent', 'divi'];
const CLAUDE_BASED_TABS: SubTab[] = ['claude', 'security', 'seo-agent', 'divi'];

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

  // Track which agent tabs have been activated per group (lazy mounting)
  // Key: `${siteId}-${envId}-${agentType}`
  const [activatedAgents, setActivatedAgents] = useState<Set<string>>(new Set());

  const markAgentActivated = useCallback((siteId: string, envId: string, agentType: string) => {
    const key = `${siteId}-${envId}-${agentType}`;
    setActivatedAgents((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

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
            {group.primaryDomain && (
              <a
                href={`https://${group.primaryDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-text-muted hover:text-accent flex-shrink-0 text-sm transition-colors"
                title={`Visit ${group.primaryDomain}`}
              >
                ↗
              </a>
            )}
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
          onSubTabChange={(tab) => {
            setActiveSubTab(activeGroup.siteId, activeGroup.envId, tab);
            // Lazy-mount: mark agent as activated on first visit
            if (AGENT_TABS.includes(tab)) {
              markAgentActivated(activeGroup.siteId, activeGroup.envId, tab);
            }
          }}
        />
      )}

      {/* All groups' terminal instances — persistent across tab switches */}
      <div className="flex-1 relative overflow-hidden">
        {tabGroups.map((group, index) => {
          const isActive = index === activeGroupIndex;
          const needsClaudePicker = CLAUDE_BASED_TABS.includes(group.activeSubTab) && !group.claudeMode;
          const showClaudePicker = isActive && needsClaudePicker;

          return (
            <Fragment key={`${group.siteId}-${group.envId}`}>
              {/* Claude mode picker — for any Claude-based tab when mode not chosen */}
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

              {/* Agent terminals — lazy-mounted on first tab visit */}
              {AGENT_TABS.map((agentTab) => {
                const agentKey = `${group.siteId}-${group.envId}-${agentTab}`;
                const isActivated = activatedAgents.has(agentKey);
                if (!isActivated || !group.claudeMode) return null;

                return (
                  <AgentTerminal
                    key={agentKey}
                    agentType={agentTab as AgentType}
                    siteId={group.siteId}
                    envId={group.envId}
                    visible={isActive && group.activeSubTab === agentTab}
                    claudeMode={group.claudeMode}
                  />
                );
              })}

              {/* Non-terminal panels — only render for active group */}
              {isActive && group.activeSubTab === 'claude-md' && (
                <ClaudeMdEditor
                  siteId={group.siteId}
                  siteName={group.siteName}
                  envId={group.envId}
                />
              )}
              {isActive && group.activeSubTab === 'seo-engine' && (
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
