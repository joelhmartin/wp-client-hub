'use client';

import type { CrawlSnapshot } from '@/lib/seo/types';

interface CrawlStatusProps {
  crawl: CrawlSnapshot | null;
  loading: boolean;
}

export function CrawlStatus({ crawl, loading }: CrawlStatusProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Crawling site...
      </div>
    );
  }

  if (!crawl) {
    return (
      <div className="text-sm text-text-muted">
        No crawl data yet. Run a crawl to get started.
      </div>
    );
  }

  const data = crawl.crawl_data;
  const completedAt = crawl.completed_at
    ? new Date(crawl.completed_at).toLocaleString()
    : 'N/A';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${
          crawl.status === 'completed' ? 'bg-success' :
          crawl.status === 'failed' ? 'bg-danger' : 'bg-warning'
        }`} />
        <span className="text-sm font-medium text-text-primary">
          {crawl.status === 'completed' ? 'Crawl Complete' :
           crawl.status === 'failed' ? 'Crawl Failed' : 'Crawling...'}
        </span>
        <span className="text-xs text-text-muted">{completedAt}</span>
      </div>

      {crawl.status === 'completed' && data && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Posts" value={crawl.post_count} />
          <StatCard label="Pages" value={crawl.page_count} />
          <StatCard label="Categories" value={data.categories?.length ?? 0} />
          <StatCard label="Tags" value={data.tags?.length ?? 0} />
        </div>
      )}

      {crawl.status === 'failed' && crawl.error && (
        <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">
          {crawl.error}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bg-secondary rounded px-3 py-2 text-center">
      <div className="text-lg font-semibold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}
