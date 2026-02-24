'use client';

import { useState, useCallback } from 'react';
import { useSEOStore } from '@/stores/seo-store';
import type { SEOPlan, SEOPlanChange } from '@/lib/seo/types';
import { ChangeDiffCard } from './ChangeDiffCard';
import { ExecutionProgress } from './ExecutionProgress';

interface SEOExecuteViewProps {
  siteId: string;
  envId: string;
  plan: SEOPlan | null;
  changes: SEOPlanChange[];
}

export function SEOExecuteView({ siteId, envId, plan, changes }: SEOExecuteViewProps) {
  const { dryRun, setDryRun, executing, setExecuting, executionProgress, setExecutionProgress } = useSEOStore();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ executed: number; failed: number; skipped: number } | null>(null);

  const approvedChanges = changes.filter((c) => c.status === 'approved');

  const handleExecute = useCallback(async () => {
    if (!plan) return;
    setError(null);
    setResult(null);
    setExecuting(true);
    setExecutionProgress({ total: approvedChanges.length, completed: 0, current: 'Starting...' });

    try {
      const res = await fetch(`/api/seo/plan/${plan.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setResult(data);
      setExecutionProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setExecuting(false);
    }
  }, [plan, dryRun, approvedChanges.length, setExecuting, setExecutionProgress]);

  const handleRollback = useCallback(async () => {
    if (!plan) return;
    setError(null);
    try {
      const res = await fetch(`/api/seo/plan/${plan.id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed');
      setResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="text-sm text-text-muted">
        No plan selected. Go to the Plan tab to generate or load a plan.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Execute Plan</h2>
        <p className="text-sm text-text-secondary mt-1">
          {approvedChanges.length} approved changes ready for execution.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-secondary">Dry run (preview only)</span>
        </label>
        <button
          onClick={handleExecute}
          disabled={executing || approvedChanges.length === 0}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            dryRun
              ? 'bg-accent/20 text-accent hover:bg-accent/30'
              : 'bg-danger text-white hover:bg-danger/90'
          }`}
        >
          {executing ? 'Executing...' : dryRun ? 'Preview Changes' : 'Execute Changes'}
        </button>
        {plan.status === 'executed' && (
          <button
            onClick={handleRollback}
            className="px-4 py-2 text-sm font-medium bg-warning/20 text-warning rounded hover:bg-warning/30 transition-colors"
          >
            Rollback All
          </button>
        )}
      </div>

      {/* Progress */}
      {executionProgress && (
        <ExecutionProgress
          total={executionProgress.total}
          completed={executionProgress.completed}
          current={executionProgress.current}
        />
      )}

      {/* Result */}
      {result && (
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">Execution Result</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-success">Executed: {result.executed}</span>
            {result.failed > 0 && <span className="text-danger">Failed: {result.failed}</span>}
            <span className="text-text-muted">Skipped: {result.skipped}</span>
          </div>
        </div>
      )}

      {/* Change list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">Approved Changes</h3>
        {approvedChanges.map((change) => (
          <ChangeDiffCard key={change.id} change={change} showActions={false} />
        ))}
        {approvedChanges.length === 0 && (
          <p className="text-sm text-text-muted">No approved changes. Go to Plan tab to approve changes first.</p>
        )}
      </div>
    </div>
  );
}
