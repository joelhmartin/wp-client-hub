import { create } from 'zustand';

export interface TerminalTab {
  sessionId: string;
  siteId: string;
  envId: string;
  type: 'claude' | 'ssh';
  siteName: string;
  envName: string;
}

export type ClaudeMode = 'regular' | 'skip-permissions';

export interface SiteTabGroup {
  siteId: string;
  envId: string;
  siteName: string;
  envName: string;
  primaryDomain: string | null;
  claudeSessionId: string | null;
  sshSessionId: string | null;
  activeSubTab: 'claude' | 'ssh' | 'claude-md' | 'seo';
  claudeMode: ClaudeMode | null;
}

interface TerminalStore {
  tabGroups: SiteTabGroup[];
  activeGroupIndex: number;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  addTabGroup: (group: Omit<SiteTabGroup, 'activeSubTab' | 'claudeMode'>) => void;
  setClaudeMode: (siteId: string, envId: string, mode: ClaudeMode) => void;
  removeTabGroup: (siteId: string, envId: string) => void;
  setActiveGroup: (index: number) => void;
  setActiveSubTab: (siteId: string, envId: string, tab: 'claude' | 'ssh' | 'claude-md' | 'seo') => void;
  setSessionId: (siteId: string, envId: string, type: 'claude' | 'ssh', sessionId: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  tabGroups: [],
  activeGroupIndex: -1,
  toast: null,

  addTabGroup: (group) => {
    const existing = get().tabGroups.findIndex(
      (g) => g.siteId === group.siteId && g.envId === group.envId
    );
    if (existing >= 0) {
      set({ activeGroupIndex: existing });
      return;
    }
    set((state) => ({
      tabGroups: [...state.tabGroups, { ...group, activeSubTab: 'claude', claudeMode: null }],
      activeGroupIndex: state.tabGroups.length,
    }));
  },

  removeTabGroup: (siteId, envId) => {
    set((state) => {
      const newGroups = state.tabGroups.filter(
        (g) => !(g.siteId === siteId && g.envId === envId)
      );
      const newIndex = Math.min(state.activeGroupIndex, newGroups.length - 1);
      return { tabGroups: newGroups, activeGroupIndex: newIndex };
    });
  },

  setClaudeMode: (siteId, envId, mode) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) =>
        g.siteId === siteId && g.envId === envId ? { ...g, claudeMode: mode } : g
      ),
    }));
  },

  setActiveGroup: (index) => set({ activeGroupIndex: index }),

  setActiveSubTab: (siteId, envId, tab) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) =>
        g.siteId === siteId && g.envId === envId ? { ...g, activeSubTab: tab } : g
      ),
    }));
  },

  setSessionId: (siteId, envId, type, sessionId) => {
    set((state) => ({
      tabGroups: state.tabGroups.map((g) =>
        g.siteId === siteId && g.envId === envId
          ? {
              ...g,
              ...(type === 'claude' ? { claudeSessionId: sessionId } : { sshSessionId: sessionId }),
            }
          : g
      ),
    }));
  },

  showToast: (message, type) => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set((state) => (state.toast?.message === message ? { toast: null } : {}));
    }, 5000);
  },

  clearToast: () => set({ toast: null }),
}));
