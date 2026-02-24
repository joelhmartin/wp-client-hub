'use client';

import { useState } from 'react';
import type { CrawlSnapshot } from '@/lib/seo/types';
import { CrawlStatus } from './CrawlStatus';

interface SEOPlanViewProps {
  siteId: string;
  envId: string;
  siteName: string;
  crawlLoading: boolean;
  latestCrawl: CrawlSnapshot | null;
  planLoading: boolean;
  onCrawl: () => Promise<void>;
  onGeneratePlan: (model?: string) => Promise<void>;
}

export function SEOPlanView({
  siteId,
  envId,
  siteName,
  crawlLoading,
  latestCrawl,
  planLoading,
  onCrawl,
  onGeneratePlan,
}: SEOPlanViewProps) {
  const [model, setModel] = useState('claude-sonnet-4-5-20250929');
  const [error, setError] = useState<string | null>(null);

  const handleCrawl = async () => {
    setError(null);
    try {
      await onCrawl();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crawl failed');
    }
  };

  const handleGenerate = async () => {
    setError(null);
    try {
      await onGeneratePlan(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan generation failed');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{siteName} — SEO Plan</h2>
        <p className="text-sm text-text-secondary mt-1">
          Crawl the site to pull WP data, then generate an SEO optimization plan with Claude.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step 1: Crawl */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">1. Site Crawl</h3>
        <CrawlStatus crawl={latestCrawl} loading={crawlLoading} />
        <button
          onClick={handleCrawl}
          disabled={crawlLoading}
          className="px-4 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {crawlLoading ? 'Crawling...' : latestCrawl ? 'Re-crawl Site' : 'Crawl Site'}
        </button>
      </section>

      {/* Step 2: Generate Plan */}
      {latestCrawl?.status === 'completed' && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary">2. Generate SEO Plan</h3>
          <div className="flex items-center gap-3">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="text-sm bg-bg-secondary border border-border rounded px-3 py-1.5 text-text-primary"
            >
              <option value="claude-sonnet-4-5-20250929">Sonnet 4.5 (fast)</option>
              <option value="claude-opus-4-6">Opus 4.6 (quality)</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={planLoading}
              className="px-4 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {planLoading ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
          {planLoading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Claude is analyzing your site data and generating an SEO strategy...
            </div>
          )}
        </section>
      )}
    </div>
  );
}
