'use client';

import type { SiteListItem } from '@/lib/types';
import { SidebarSiteItem } from './SidebarSiteItem';
import { useTerminalStore } from '@/stores/terminal-store';

interface SidebarSiteListProps {
  sites: SiteListItem[];
  onSelect: (site: SiteListItem, envId: string, envName: string) => void;
}

export function SidebarSiteList({ sites, onSelect }: SidebarSiteListProps) {
  const tabGroups = useTerminalStore((s) => s.tabGroups);

  return (
    <div className="flex-1 overflow-y-auto">
      {sites.length === 0 ? (
        <div className="px-3 py-8 text-center text-text-muted text-sm">
          No sites found
        </div>
      ) : (
        sites.map((site) => {
          const isActive = tabGroups.some((g) => g.siteId === site.id);
          return (
            <SidebarSiteItem
              key={site.id}
              site={site}
              isActive={isActive}
              onSelect={onSelect}
            />
          );
        })
      )}
    </div>
  );
}
