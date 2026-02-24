'use client';

import { useSEOStore, type SEOInnerTab } from '@/stores/seo-store';
import { useSEO } from '@/hooks/useSEO';
import { SEOPlanView } from './SEOPlanView';
import { SEOPlanDetail } from './SEOPlanDetail';
import { SEOExecuteView } from './SEOExecuteView';
import { SEOReviewView } from './SEOReviewView';
import { SEOHistoryView } from './SEOHistoryView';
import { SEOConfigPanel } from './SEOConfigPanel';

interface SEOPanelProps {
  siteId: string;
  envId: string;
  siteName: string;
}

const INNER_TABS: { id: SEOInnerTab; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'execute', label: 'Execute' },
  { id: 'review', label: 'Review' },
  { id: 'history', label: 'History' },
  { id: 'config', label: 'Config' },
];

export function SEOPanel({ siteId, envId, siteName }: SEOPanelProps) {
  const { activeInnerTab, setActiveInnerTab } = useSEOStore();
  const seo = useSEO(siteId, envId);

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Inner tab bar */}
      <div className="flex border-b border-border bg-bg-secondary px-2">
        {INNER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveInnerTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeInnerTab === tab.id
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeInnerTab === 'plan' && !seo.currentPlan && (
          <SEOPlanView
            siteId={siteId}
            envId={envId}
            siteName={siteName}
            crawlLoading={seo.crawlLoading}
            latestCrawl={seo.latestCrawl}
            planLoading={seo.planLoading}
            onCrawl={seo.triggerCrawl}
            onGeneratePlan={seo.generatePlan}
          />
        )}
        {activeInnerTab === 'plan' && seo.currentPlan && (
          <SEOPlanDetail
            plan={seo.currentPlan}
            changes={seo.currentChanges}
            onBack={() => {
              useSEOStore.getState().setCurrentPlan(null);
              useSEOStore.getState().setCurrentChanges([]);
            }}
            onExecute={() => setActiveInnerTab('execute')}
          />
        )}
        {activeInnerTab === 'execute' && (
          <SEOExecuteView
            siteId={siteId}
            envId={envId}
            plan={seo.currentPlan}
            changes={seo.currentChanges}
          />
        )}
        {activeInnerTab === 'review' && (
          <SEOReviewView siteId={siteId} envId={envId} />
        )}
        {activeInnerTab === 'history' && (
          <SEOHistoryView
            siteId={siteId}
            envId={envId}
            onLoadPlan={seo.loadPlan}
          />
        )}
        {activeInnerTab === 'config' && (
          <SEOConfigPanel siteId={siteId} envId={envId} />
        )}
      </div>
    </div>
  );
}
