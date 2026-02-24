'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SiteListItem } from '@/lib/types';

export function useSites() {
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sites');
      if (!res.ok) throw new Error('Failed to fetch sites');
      const data = await res.json();
      setSites(data.sites);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return { sites, loading, error, refetch: fetchSites };
}
