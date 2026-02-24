'use client';

import { useCallback } from 'react';
import type { SEOPlan, SEOPlanChange } from '@/lib/seo/types';
import { ChangeDiffCard } from './ChangeDiffCard';

interface SEOPlanDetailProps {
  plan: SEOPlan;
  changes: SEOPlanChange[];
  onBack: () => void;
  onExecute: () => void;
}

export function SEOPlanDetail({ plan, changes, onBack, onExecute }: SEOPlanDetailProps) {
  const pendingCount = changes.filter((c) => c.status === 'pending').length;
  const approvedCount = changes.filter((c) => c.status === 'approved').length;

  const updateChange = useCallback(async (changeId: string, status: string) => {
    await fetch(`/api/seo/plan/${plan.id}/changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: [{ changeId, status }] }),
    });
    // Optimistic update — changes array is from parent state
    const { setCurrentChanges } = await import('@/stores/seo-store').then(m => m.useSEOStore.getState());
    setCurrentChanges(
      changes.map((c) => (c.id === changeId ? { ...c, status: status as SEOPlanChange['status'] } : c))
    );
  }, [plan.id, changes]);

  const approveAll = useCallback(async () => {
    const pendingChanges = changes.filter((c) => c.status === 'pending');
    await fetch(`/api/seo/plan/${plan.id}/changes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: pendingChanges.map((c) => ({ changeId: c.id, status: 'approved' })),
      }),
    });
    const { setCurrentChanges } = await import('@/stores/seo-store').then(m => m.useSEOStore.getState());
    setCurrentChanges(
      changes.map((c) => (c.status === 'pending' ? { ...c, status: 'approved' } : c))
    );
  }, [plan.id, changes]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-text-muted hover:text-text-primary mb-2"
          >
            &larr; Back to Plan View
          </button>
          <h2 className="text-lg font-semibold text-text-primary">SEO Plan</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-muted">Model: {plan.model_used}</span>
            <span className="text-xs text-text-muted">
              Tokens: {plan.prompt_tokens + plan.completion_tokens}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              plan.status === 'draft' ? 'bg-bg-tertiary text-text-secondary' :
              plan.status === 'approved' ? 'bg-success/20 text-success' :
              'bg-accent/20 text-accent'
            }`}>
              {plan.status}
            </span>
          </div>
        </div>
      </div>

      {/* Strategy Summary */}
      {plan.strategy_summary && (
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">Strategy Summary</h3>
          <div className="text-sm text-text-secondary whitespace-pre-wrap">
            {plan.strategy_summary}
          </div>
        </div>
      )}

      {/* Keyword Clusters */}
      {plan.keyword_clusters && plan.keyword_clusters.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Keyword Clusters</h3>
          <div className="grid gap-2">
            {plan.keyword_clusters.map((cluster, i) => (
              <div key={i} className="bg-bg-secondary border border-border rounded px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{cluster.name}</span>
                  <span className="text-xs text-text-muted">
                    Vol: {cluster.search_volume} | {cluster.difficulty}
                  </span>
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  Primary: <span className="font-medium">{cluster.primary_keyword}</span>
                  {cluster.related_keywords.length > 0 && (
                    <> | Related: {cluster.related_keywords.join(', ')}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary">
            Changes ({changes.length})
            {pendingCount > 0 && (
              <span className="text-text-muted font-normal"> — {pendingCount} pending</span>
            )}
          </h3>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <button
                onClick={approveAll}
                className="px-3 py-1 text-xs font-medium bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
              >
                Approve All ({pendingCount})
              </button>
            )}
            {approvedCount > 0 && (
              <button
                onClick={onExecute}
                className="px-3 py-1 text-xs font-medium bg-accent text-white rounded hover:bg-accent/90 transition-colors"
              >
                Execute ({approvedCount})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {changes.map((change) => (
            <ChangeDiffCard
              key={change.id}
              change={change}
              onApprove={() => updateChange(change.id, 'approved')}
              onSkip={() => updateChange(change.id, 'skipped')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
