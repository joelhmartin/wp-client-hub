import { useCallback, useEffect, useRef } from 'react';
import { useSEOStore } from '@/stores/seo-store';

export function useSEO(siteId: string, envId: string) {
  const {
    crawlLoading, setCrawlLoading,
    crawlSnapshotId, setCrawlSnapshotId,
    latestCrawl, setLatestCrawl,
    planLoading, setPlanLoading,
    currentPlan, setCurrentPlan,
    currentChanges, setCurrentChanges,
    resetSEOState,
  } = useSEOStore();

  const prevSiteRef = useRef(`${siteId}-${envId}`);

  // Reset state when site changes
  useEffect(() => {
    const key = `${siteId}-${envId}`;
    if (prevSiteRef.current !== key) {
      resetSEOState();
      prevSiteRef.current = key;
    }
  }, [siteId, envId, resetSEOState]);

  // Load latest crawl on mount
  useEffect(() => {
    loadLatestCrawl();
  }, [siteId, envId]);

  const loadLatestCrawl = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/crawl/${siteId}?envId=${envId}&latest=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.snapshot) setLatestCrawl(data.snapshot);
      }
    } catch {
      // No crawl yet
    }
  }, [siteId, envId, setLatestCrawl]);

  const triggerCrawl = useCallback(async () => {
    setCrawlLoading(true);
    try {
      const res = await fetch(`/api/seo/crawl/${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Crawl failed');
      setCrawlSnapshotId(data.snapshotId);

      // Poll for completion
      pollCrawl(data.snapshotId);
    } catch (err) {
      setCrawlLoading(false);
      throw err;
    }
  }, [siteId, envId, setCrawlLoading, setCrawlSnapshotId]);

  const pollCrawl = useCallback(async (snapshotId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/seo/crawl/${siteId}/${snapshotId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.snapshot.status === 'completed') {
          setLatestCrawl(data.snapshot);
          setCrawlLoading(false);
          return;
        }
        if (data.snapshot.status === 'failed') {
          setCrawlLoading(false);
          return;
        }
        // Still running, poll again
        setTimeout(poll, 2000);
      } catch {
        setCrawlLoading(false);
      }
    };
    poll();
  }, [siteId, setLatestCrawl, setCrawlLoading]);

  const generatePlan = useCallback(async (model?: string) => {
    if (!latestCrawl) throw new Error('No crawl data available');
    setPlanLoading(true);
    try {
      const res = await fetch('/api/seo/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          envId,
          crawlSnapshotId: latestCrawl.id,
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Plan generation failed');
      setCurrentPlan(data.plan);
      setCurrentChanges(data.changes || []);
    } finally {
      setPlanLoading(false);
    }
  }, [siteId, envId, latestCrawl, setPlanLoading, setCurrentPlan, setCurrentChanges]);

  const loadPlan = useCallback(async (planId: string) => {
    const [planRes, changesRes] = await Promise.all([
      fetch(`/api/seo/plan/${planId}`),
      fetch(`/api/seo/plan/${planId}/changes`),
    ]);
    if (planRes.ok) {
      const { plan } = await planRes.json();
      setCurrentPlan(plan);
    }
    if (changesRes.ok) {
      const { changes } = await changesRes.json();
      setCurrentChanges(changes);
    }
  }, [setCurrentPlan, setCurrentChanges]);

  return {
    crawlLoading,
    crawlSnapshotId,
    latestCrawl,
    triggerCrawl,
    loadLatestCrawl,
    planLoading,
    currentPlan,
    currentChanges,
    generatePlan,
    loadPlan,
  };
}
