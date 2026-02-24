import { useCallback, useEffect } from 'react';
import { useSEOStore } from '@/stores/seo-store';

export function useSEOHistory(siteId: string, envId: string) {
  const { timeline, setTimeline } = useSEOStore();

  const loadTimeline = useCallback(async () => {
    try {
      const res = await fetch(`/api/seo/history/${siteId}?envId=${envId}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
      }
    } catch {
      // ignore
    }
  }, [siteId, envId, setTimeline]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  return { timeline, refresh: loadTimeline };
}
