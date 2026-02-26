'use client';

import { useRef } from 'react';
import { TerminalInstance, type TerminalInstanceHandle } from '../terminal/TerminalInstance';
import { QuickActions } from './QuickActions';

type AgentType = 'security' | 'seo-agent' | 'divi';

interface AgentTerminalProps {
  agentType: AgentType;
  siteId: string;
  envId: string;
  visible: boolean;
  claudeMode: string | null;
}

export function AgentTerminal({ agentType, siteId, envId, visible, claudeMode }: AgentTerminalProps) {
  const termRef = useRef<TerminalInstanceHandle>(null);

  const handleQuickAction = (instruction: string) => {
    termRef.current?.writeToTerminal(instruction + '\n');
  };

  return (
    <div className={`flex flex-col w-full h-full ${visible ? '' : 'hidden'}`}>
      <QuickActions agentType={agentType} onAction={handleQuickAction} />
      <div className="flex-1 min-h-0">
        <TerminalInstance
          ref={termRef}
          siteId={siteId}
          envId={envId}
          type="claude"
          visible={true}
          claudeMode={claudeMode}
          agentType={agentType}
        />
      </div>
    </div>
  );
}
