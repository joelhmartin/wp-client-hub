import { create } from 'zustand';
import type { CrawlSnapshot, SEOPlan, SEOPlanChange, TimelineEvent } from '@/lib/seo/types';

export type SEOInnerTab = 'plan' | 'execute' | 'review' | 'history' | 'config';

interface SEOStore {
  activeInnerTab: SEOInnerTab;
  setActiveInnerTab: (tab: SEOInnerTab) => void;

  // Crawl state
  crawlLoading: boolean;
  crawlSnapshotId: string | null;
  latestCrawl: CrawlSnapshot | null;
  setCrawlLoading: (loading: boolean) => void;
  setCrawlSnapshotId: (id: string | null) => void;
  setLatestCrawl: (crawl: CrawlSnapshot | null) => void;

  // Plan state
  currentPlan: SEOPlan | null;
  currentChanges: SEOPlanChange[];
  planLoading: boolean;
  setCurrentPlan: (plan: SEOPlan | null) => void;
  setCurrentChanges: (changes: SEOPlanChange[]) => void;
  setPlanLoading: (loading: boolean) => void;

  // Execute state
  executing: boolean;
  executionProgress: { total: number; completed: number; current: string } | null;
  dryRun: boolean;
  setExecuting: (executing: boolean) => void;
  setExecutionProgress: (progress: { total: number; completed: number; current: string } | null) => void;
  setDryRun: (dryRun: boolean) => void;

  // History state
  timeline: TimelineEvent[];
  setTimeline: (events: TimelineEvent[]) => void;

  // Reset for site change
  resetSEOState: () => void;
}

export const useSEOStore = create<SEOStore>((set) => ({
  activeInnerTab: 'plan',
  setActiveInnerTab: (tab) => set({ activeInnerTab: tab }),

  crawlLoading: false,
  crawlSnapshotId: null,
  latestCrawl: null,
  setCrawlLoading: (loading) => set({ crawlLoading: loading }),
  setCrawlSnapshotId: (id) => set({ crawlSnapshotId: id }),
  setLatestCrawl: (crawl) => set({ latestCrawl: crawl }),

  currentPlan: null,
  currentChanges: [],
  planLoading: false,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  setCurrentChanges: (changes) => set({ currentChanges: changes }),
  setPlanLoading: (loading) => set({ planLoading: loading }),

  executing: false,
  executionProgress: null,
  dryRun: true,
  setExecuting: (executing) => set({ executing }),
  setExecutionProgress: (progress) => set({ executionProgress: progress }),
  setDryRun: (dryRun) => set({ dryRun }),

  timeline: [],
  setTimeline: (events) => set({ timeline: events }),

  resetSEOState: () =>
    set({
      crawlLoading: false,
      crawlSnapshotId: null,
      latestCrawl: null,
      currentPlan: null,
      currentChanges: [],
      planLoading: false,
      executing: false,
      executionProgress: null,
      timeline: [],
    }),
}));
