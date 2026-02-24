import { useCallback } from 'react';
import { useSEOStore } from '@/stores/seo-store';
import type { SEOPlanChange } from '@/lib/seo/types';

export function useSEOPlan() {
  const { currentPlan, currentChanges, setCurrentPlan, setCurrentChanges } = useSEOStore();

  const approveChange = useCallback(async (changeId: string) => {
    if (!currentPlan) return;
    await fetch(`/api/seo/plan/${currentPlan.id}/changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: [{ changeId, status: 'approved' }] }),
    });
    setCurrentChanges(
      currentChanges.map((c) => (c.id === changeId ? { ...c, status: 'approved' as const } : c))
    );
  }, [currentPlan, currentChanges, setCurrentChanges]);

  const skipChange = useCallback(async (changeId: string) => {
    if (!currentPlan) return;
    await fetch(`/api/seo/plan/${currentPlan.id}/changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: [{ changeId, status: 'skipped' }] }),
    });
    setCurrentChanges(
      currentChanges.map((c) => (c.id === changeId ? { ...c, status: 'skipped' as const } : c))
    );
  }, [currentPlan, currentChanges, setCurrentChanges]);

  const approveAll = useCallback(async () => {
    if (!currentPlan) return;
    const pending = currentChanges.filter((c) => c.status === 'pending');
    await fetch(`/api/seo/plan/${currentPlan.id}/changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: pending.map((c) => ({ changeId: c.id, status: 'approved' })),
      }),
    });
    setCurrentChanges(
      currentChanges.map((c) => (c.status === 'pending' ? { ...c, status: 'approved' as const } : c))
    );
  }, [currentPlan, currentChanges, setCurrentChanges]);

  const deletePlan = useCallback(async () => {
    if (!currentPlan) return;
    await fetch(`/api/seo/plan/${currentPlan.id}`, { method: 'DELETE' });
    setCurrentPlan(null);
    setCurrentChanges([]);
  }, [currentPlan, setCurrentPlan, setCurrentChanges]);

  return {
    plan: currentPlan,
    changes: currentChanges,
    approveChange,
    skipChange,
    approveAll,
    deletePlan,
  };
}
