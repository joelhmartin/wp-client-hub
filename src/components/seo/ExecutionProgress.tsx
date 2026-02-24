'use client';

interface ExecutionProgressProps {
  total: number;
  completed: number;
  current: string;
  failed?: number;
}

export function ExecutionProgress({ total, completed, current, failed = 0 }: ExecutionProgressProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {completed}/{total} changes
          {failed > 0 && <span className="text-danger ml-1">({failed} failed)</span>}
        </span>
        <span className="text-text-muted">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {current && (
        <div className="text-xs text-text-muted flex items-center gap-2">
          <span className="inline-block w-2 h-2 border border-accent border-t-transparent rounded-full animate-spin" />
          {current}
        </div>
      )}
    </div>
  );
}
