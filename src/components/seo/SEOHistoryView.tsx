'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimelineEvent } from '@/lib/seo/types';

interface SEOHistoryViewProps {
  siteId: string;
  envId: string;
  onLoadPlan: (planId: string) => void;
}

export function SEOHistoryView({ siteId, envId, onLoadPlan }: SEOHistoryViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo/history/${siteId}?envId=${envId}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.timeline || []);
      }
    } finally {
      setLoading(false);
    }
  }, [siteId, envId]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  if (loading) {
    return (
      <div className="text-sm text-text-muted flex items-center gap-2">
        <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Loading history...
      </div>
    );
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'crawl': return 'C';
      case 'plan': return 'P';
      case 'execution': return 'E';
      case 'review': return 'R';
      default: return '?';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'crawl': return 'bg-accent/20 text-accent';
      case 'plan': return 'bg-success/20 text-success';
      case 'execution': return 'bg-warning/20 text-warning';
      case 'review': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-bg-tertiary text-text-muted';
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold text-text-primary">SEO History</h2>

      {events.length === 0 ? (
        <p className="text-sm text-text-muted">No SEO activity yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={`${event.type}-${event.id}`}
              className="flex items-start gap-3 bg-bg-secondary border border-border rounded-lg p-3"
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${typeColor(event.type)}`}>
                {typeIcon(event.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {event.type}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5 truncate">
                  {event.summary}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    event.status === 'completed' ? 'bg-success/20 text-success' :
                    event.status === 'failed' ? 'bg-danger/20 text-danger' :
                    'bg-bg-tertiary text-text-muted'
                  }`}>
                    {event.status}
                  </span>
                  {event.type === 'plan' && (
                    <button
                      onClick={() => onLoadPlan(event.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      Load plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
