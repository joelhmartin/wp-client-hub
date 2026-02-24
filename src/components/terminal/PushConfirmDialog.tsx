'use client';

interface PushConfirmDialogProps {
  direction: 'staging-to-live' | 'live-to-staging';
  siteName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PushConfirmDialog({
  direction,
  siteName,
  loading,
  onConfirm,
  onCancel,
}: PushConfirmDialogProps) {
  const isDanger = direction === 'staging-to-live';
  const sourceLabel = isDanger ? 'Staging' : 'Live';
  const targetLabel = isDanger ? 'Live' : 'Staging';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={loading ? undefined : onCancel} />
      <div className="relative bg-bg-secondary border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-medium text-text-primary mb-3">
          Push {sourceLabel} → {targetLabel}
        </h3>
        <p className="text-sm text-text-secondary mb-2">
          Site: <span className="text-text-primary font-medium">{siteName}</span>
        </p>
        <div
          className={`text-sm p-3 rounded border mb-4 ${
            isDanger
              ? 'bg-danger/10 border-danger/30 text-danger'
              : 'bg-warning/10 border-warning/30 text-warning'
          }`}
        >
          This will overwrite the <strong>{targetLabel}</strong> environment with the contents of{' '}
          <strong>{sourceLabel}</strong> (database, files, and search-replace).
          This cannot be undone.
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded font-medium transition-colors disabled:opacity-50 ${
              isDanger
                ? 'bg-danger text-white hover:bg-danger/80'
                : 'bg-warning text-black hover:bg-warning/80'
            }`}
          >
            {loading ? 'Pushing...' : `Push to ${targetLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
