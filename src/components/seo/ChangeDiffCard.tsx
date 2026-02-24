'use client';

import type { SEOPlanChange } from '@/lib/seo/types';

interface ChangeDiffCardProps {
  change: SEOPlanChange;
  onApprove?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
}

export function ChangeDiffCard({ change, onApprove, onSkip, showActions = true }: ChangeDiffCardProps) {
  const typeLabel = change.change_type.replace(/_/g, ' ');
  const priorityColor =
    change.priority === 'high' ? 'text-danger' :
    change.priority === 'medium' ? 'text-warning' : 'text-text-muted';

  const statusBadge = {
    pending: 'bg-bg-tertiary text-text-secondary',
    approved: 'bg-success/20 text-success',
    skipped: 'bg-bg-tertiary text-text-muted',
    executed: 'bg-accent/20 text-accent',
    failed: 'bg-danger/20 text-danger',
    rolled_back: 'bg-warning/20 text-warning',
  }[change.status];

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {typeLabel}
          </span>
          <span className={`text-xs font-medium ${priorityColor}`}>
            {change.priority}
          </span>
          {change.post_id && (
            <span className="text-xs text-text-muted">Post #{change.post_id}</span>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge}`}>
          {change.status}
        </span>
      </div>

      {/* Field */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">{change.field_name}</span>
      </div>

      {/* Diff */}
      <div className="space-y-2">
        {change.old_value && (
          <div className="bg-danger/5 border border-danger/20 rounded px-3 py-2">
            <span className="text-xs text-danger font-medium">OLD</span>
            <div className="text-sm text-text-primary mt-1 whitespace-pre-wrap break-words">
              {change.old_value}
            </div>
          </div>
        )}
        <div className="bg-success/5 border border-success/20 rounded px-3 py-2">
          <span className="text-xs text-success font-medium">NEW</span>
          <div className="text-sm text-text-primary mt-1 whitespace-pre-wrap break-words">
            {change.new_value}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {change.reasoning && (
        <div className="text-xs text-text-muted italic">
          {change.reasoning}
        </div>
      )}

      {/* Actions */}
      {showActions && change.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={onApprove}
            className="px-3 py-1 text-xs font-medium bg-success/20 text-success rounded hover:bg-success/30 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={onSkip}
            className="px-3 py-1 text-xs font-medium bg-bg-tertiary text-text-secondary rounded hover:bg-bg-tertiary/80 transition-colors"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
