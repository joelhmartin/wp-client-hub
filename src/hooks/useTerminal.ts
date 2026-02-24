'use client';

import { useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminal-store';

export function useTerminal() {
  const { addTabGroup } = useTerminalStore();

  const connectToSite = useCallback(
    (siteId: string, envId: string, siteName: string, envName: string) => {
      addTabGroup({
        siteId,
        envId,
        siteName,
        envName,
        claudeSessionId: null,
        sshSessionId: null,
      });
    },
    [addTabGroup]
  );

  const disconnectFromSite = useCallback(
    (siteId: string, envId: string) => {
      // WebSocket close in TerminalInstance cleanup will kill the pty
      useTerminalStore.getState().removeTabGroup(siteId, envId);
    },
    []
  );

  return { connectToSite, disconnectFromSite };
}
