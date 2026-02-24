'use client';

import { useState, useMemo } from 'react';
import { useSites } from '@/hooks/useSites';
import { useTerminal } from '@/hooks/useTerminal';
import { useTerminalStore } from '@/stores/terminal-store';
import { SidebarSearch } from './SidebarSearch';
import { SidebarSiteList } from './SidebarSiteList';
import type { SiteListItem } from '@/lib/types';

export function Sidebar() {
  const [search, setSearch] = useState('');
  const { sites, loading, refetch } = useSites();
  const { connectToSite } = useTerminal();
  const showToast = useTerminalStore((s) => s.showToast);
  const [pulling, setPulling] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter((s) => s.site_name.toLowerCase().includes(q));
  }, [sites, search]);

  const handleSelect = (site: SiteListItem, envId: string, envName: string) => {
    connectToSite(site.id, envId, site.site_name, envName);
  };

  const handlePullNew = async () => {
    setPulling(true);
    try {
      const res = await fetch('/api/credentials/pull-new', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        refetch();
      } else {
        showToast(data.error || 'Failed to pull credentials', 'error');
      }
    } catch {
      showToast('Failed to pull credentials', 'error');
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="w-72 bg-bg-secondary border-r border-border flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h1 className="text-lg font-bold text-text-primary">WP Client Hub</h1>
        <div className="text-xs text-text-muted mt-1">
          {loading ? 'Loading...' : `${sites.length} sites`}
        </div>
      </div>

      <SidebarSearch value={search} onChange={setSearch} />

      <SidebarSiteList sites={filtered} onSelect={handleSelect} />

      <div className="p-3 border-t border-border">
        <button
          onClick={handlePullNew}
          disabled={pulling}
          className="w-full px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
        >
          {pulling ? 'Pulling...' : 'Pull New Credentials'}
        </button>
      </div>
    </div>
  );
}
