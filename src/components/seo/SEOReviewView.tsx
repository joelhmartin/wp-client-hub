'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SEOReport } from '@/lib/seo/types';

interface SEOReviewViewProps {
  siteId: string;
  envId: string;
}

export function SEOReviewView({ siteId, envId }: SEOReviewViewProps) {
  const [reports, setReports] = useState<SEOReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<SEOReport | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo/review/${siteId}?envId=${envId}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } finally {
      setLoading(false);
    }
  }, [siteId, envId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <div className="text-sm text-text-muted flex items-center gap-2">
        <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Loading reviews...
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="space-y-4 max-w-3xl">
        <button
          onClick={() => setSelectedReport(null)}
          className="text-xs text-text-muted hover:text-text-primary"
        >
          &larr; Back to reviews
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {selectedReport.report_type.replace(/_/g, ' ')}
          </h2>
          <span className="text-xs text-text-muted">
            {new Date(selectedReport.created_at).toLocaleString()}
          </span>
        </div>
        <div className="bg-bg-secondary border border-border rounded-lg p-4 text-sm text-text-secondary whitespace-pre-wrap">
          {selectedReport.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold text-text-primary">Reviews</h2>

      {reports.length === 0 ? (
        <p className="text-sm text-text-muted">
          No reviews yet. Reviews are generated after plan execution.
        </p>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="w-full text-left bg-bg-secondary border border-border rounded-lg p-3 hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {report.report_type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(report.created_at).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                {report.content.slice(0, 150)}...
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
