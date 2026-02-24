import { query, queryOne } from './postgres';
import type {
  SEOSiteConfig,
  CrawlSnapshot,
  CrawlData,
  SEMrushSnapshot,
  SEOPlan,
  SEOPlanChange,
  SEOContentBackup,
  SEOExecutionLog,
  SEORankingSnapshot,
  SEOReport,
  KeywordCluster,
  SEMrushKeyword,
  RankingEntry,
  EnabledFeatures,
  ChangeType,
} from './types';

// ─── Site Config ───

export async function getSiteConfig(siteId: string, envId: string): Promise<SEOSiteConfig | null> {
  return queryOne<SEOSiteConfig>(
    'SELECT * FROM seo_site_config WHERE site_id = $1 AND env_id = $2',
    [siteId, envId]
  );
}

export async function upsertSiteConfig(
  siteId: string,
  envId: string,
  updates: { semrush_domain?: string | null; enabled_features?: EnabledFeatures }
): Promise<SEOSiteConfig> {
  const rows = await query<SEOSiteConfig>(
    `INSERT INTO seo_site_config (site_id, env_id, semrush_domain, enabled_features)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (site_id, env_id) DO UPDATE SET
       semrush_domain = COALESCE($3, seo_site_config.semrush_domain),
       enabled_features = COALESCE($4, seo_site_config.enabled_features),
       updated_at = NOW()
     RETURNING *`,
    [siteId, envId, updates.semrush_domain ?? null, updates.enabled_features ? JSON.stringify(updates.enabled_features) : null]
  );
  return rows[0];
}

// ─── Crawl Snapshots ───

export async function createCrawlSnapshot(siteId: string, envId: string): Promise<CrawlSnapshot> {
  const rows = await query<CrawlSnapshot>(
    `INSERT INTO seo_crawl_snapshots (site_id, env_id, status) VALUES ($1, $2, 'running') RETURNING *`,
    [siteId, envId]
  );
  return rows[0];
}

export async function completeCrawlSnapshot(
  id: string,
  data: CrawlData,
  postCount: number,
  pageCount: number
): Promise<void> {
  await query(
    `UPDATE seo_crawl_snapshots SET crawl_data = $1, post_count = $2, page_count = $3, status = 'completed', completed_at = NOW() WHERE id = $4`,
    [JSON.stringify(data), postCount, pageCount, id]
  );
}

export async function failCrawlSnapshot(id: string, error: string): Promise<void> {
  await query(
    `UPDATE seo_crawl_snapshots SET status = 'failed', error = $1, completed_at = NOW() WHERE id = $2`,
    [error, id]
  );
}

export async function getCrawlSnapshot(id: string): Promise<CrawlSnapshot | null> {
  return queryOne<CrawlSnapshot>('SELECT * FROM seo_crawl_snapshots WHERE id = $1', [id]);
}

export async function getLatestCrawlSnapshot(siteId: string, envId: string): Promise<CrawlSnapshot | null> {
  return queryOne<CrawlSnapshot>(
    `SELECT * FROM seo_crawl_snapshots WHERE site_id = $1 AND env_id = $2 AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`,
    [siteId, envId]
  );
}

export async function listCrawlSnapshots(siteId: string, envId: string): Promise<CrawlSnapshot[]> {
  return query<CrawlSnapshot>(
    'SELECT * FROM seo_crawl_snapshots WHERE site_id = $1 AND env_id = $2 ORDER BY started_at DESC LIMIT 20',
    [siteId, envId]
  );
}

// ─── SEMrush Snapshots ───

export async function createSEMrushSnapshot(
  siteId: string,
  envId: string,
  domain: string,
  keywordData: SEMrushKeyword[],
  organicTraffic: number | null
): Promise<SEMrushSnapshot> {
  const rows = await query<SEMrushSnapshot>(
    `INSERT INTO seo_semrush_snapshots (site_id, env_id, domain, keyword_data, organic_traffic) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [siteId, envId, domain, JSON.stringify(keywordData), organicTraffic]
  );
  return rows[0];
}

export async function getLatestSEMrushSnapshot(siteId: string, envId: string): Promise<SEMrushSnapshot | null> {
  return queryOne<SEMrushSnapshot>(
    `SELECT * FROM seo_semrush_snapshots WHERE site_id = $1 AND env_id = $2 ORDER BY fetched_at DESC LIMIT 1`,
    [siteId, envId]
  );
}

// ─── SEO Plans ───

export async function createPlan(params: {
  site_id: string;
  env_id: string;
  crawl_snapshot_id: string;
  semrush_snapshot_id?: string | null;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  strategy_summary: string;
  keyword_clusters: KeywordCluster[];
}): Promise<SEOPlan> {
  const rows = await query<SEOPlan>(
    `INSERT INTO seo_plans (site_id, env_id, crawl_snapshot_id, semrush_snapshot_id, model_used, prompt_tokens, completion_tokens, strategy_summary, keyword_clusters)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      params.site_id, params.env_id, params.crawl_snapshot_id,
      params.semrush_snapshot_id ?? null, params.model_used,
      params.prompt_tokens, params.completion_tokens,
      params.strategy_summary, JSON.stringify(params.keyword_clusters),
    ]
  );
  return rows[0];
}

export async function getPlan(planId: string): Promise<SEOPlan | null> {
  return queryOne<SEOPlan>('SELECT * FROM seo_plans WHERE id = $1', [planId]);
}

export async function updatePlanStatus(planId: string, status: SEOPlan['status']): Promise<void> {
  await query('UPDATE seo_plans SET status = $1, updated_at = NOW() WHERE id = $2', [status, planId]);
}

export async function listPlans(siteId: string, envId: string): Promise<SEOPlan[]> {
  return query<SEOPlan>(
    'SELECT * FROM seo_plans WHERE site_id = $1 AND env_id = $2 ORDER BY created_at DESC LIMIT 50',
    [siteId, envId]
  );
}

export async function deletePlan(planId: string): Promise<void> {
  await query('DELETE FROM seo_plans WHERE id = $1', [planId]);
}

// ─── Plan Changes ───

export async function createPlanChange(params: {
  plan_id: string;
  post_id?: number | null;
  change_type: ChangeType;
  field_name: string;
  old_value?: string | null;
  new_value: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  execution_order: number;
}): Promise<SEOPlanChange> {
  const rows = await query<SEOPlanChange>(
    `INSERT INTO seo_plan_changes (plan_id, post_id, change_type, field_name, old_value, new_value, reasoning, priority, execution_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      params.plan_id, params.post_id ?? null, params.change_type,
      params.field_name, params.old_value ?? null, params.new_value,
      params.reasoning, params.priority, params.execution_order,
    ]
  );
  return rows[0];
}

export async function createPlanChanges(changes: Array<{
  plan_id: string;
  post_id?: number | null;
  change_type: ChangeType;
  field_name: string;
  old_value?: string | null;
  new_value: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  execution_order: number;
}>): Promise<SEOPlanChange[]> {
  if (changes.length === 0) return [];
  const results: SEOPlanChange[] = [];
  for (const change of changes) {
    results.push(await createPlanChange(change));
  }
  return results;
}

export async function getPlanChanges(planId: string): Promise<SEOPlanChange[]> {
  return query<SEOPlanChange>(
    'SELECT * FROM seo_plan_changes WHERE plan_id = $1 ORDER BY execution_order, created_at',
    [planId]
  );
}

export async function updateChangeStatus(changeId: string, status: SEOPlanChange['status']): Promise<void> {
  await query('UPDATE seo_plan_changes SET status = $1, updated_at = NOW() WHERE id = $2', [status, changeId]);
}

export async function bulkUpdateChangeStatus(planId: string, fromStatus: string, toStatus: string): Promise<void> {
  await query(
    'UPDATE seo_plan_changes SET status = $1, updated_at = NOW() WHERE plan_id = $2 AND status = $3',
    [toStatus, planId, fromStatus]
  );
}

// ─── Content Backups ───

export async function createContentBackup(params: {
  change_id: string;
  plan_id: string;
  post_id?: number | null;
  field_name: string;
  original_value: string;
}): Promise<SEOContentBackup> {
  const rows = await query<SEOContentBackup>(
    `INSERT INTO seo_content_backups (change_id, plan_id, post_id, field_name, original_value) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [params.change_id, params.plan_id, params.post_id ?? null, params.field_name, params.original_value]
  );
  return rows[0];
}

export async function getContentBackup(changeId: string): Promise<SEOContentBackup | null> {
  return queryOne<SEOContentBackup>('SELECT * FROM seo_content_backups WHERE change_id = $1', [changeId]);
}

export async function getPlanBackups(planId: string): Promise<SEOContentBackup[]> {
  return query<SEOContentBackup>('SELECT * FROM seo_content_backups WHERE plan_id = $1', [planId]);
}

// ─── Execution Log ───

export async function createExecutionLog(params: {
  plan_id: string;
  change_id?: string | null;
  command: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
}): Promise<SEOExecutionLog> {
  const rows = await query<SEOExecutionLog>(
    `INSERT INTO seo_execution_log (plan_id, change_id, command, stdout, stderr, exit_code, duration_ms) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [params.plan_id, params.change_id ?? null, params.command, params.stdout, params.stderr, params.exit_code, params.duration_ms]
  );
  return rows[0];
}

export async function getPlanExecutionLogs(planId: string): Promise<SEOExecutionLog[]> {
  return query<SEOExecutionLog>(
    'SELECT * FROM seo_execution_log WHERE plan_id = $1 ORDER BY executed_at',
    [planId]
  );
}

// ─── Ranking Snapshots ───

export async function createRankingSnapshot(params: {
  site_id: string;
  env_id: string;
  plan_id?: string | null;
  snapshot_type: 'before' | 'after';
  rankings: RankingEntry[];
}): Promise<SEORankingSnapshot> {
  const rows = await query<SEORankingSnapshot>(
    `INSERT INTO seo_ranking_snapshots (site_id, env_id, plan_id, snapshot_type, rankings) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [params.site_id, params.env_id, params.plan_id ?? null, params.snapshot_type, JSON.stringify(params.rankings)]
  );
  return rows[0];
}

export async function getRankingSnapshots(siteId: string, envId: string): Promise<SEORankingSnapshot[]> {
  return query<SEORankingSnapshot>(
    'SELECT * FROM seo_ranking_snapshots WHERE site_id = $1 AND env_id = $2 ORDER BY captured_at DESC LIMIT 20',
    [siteId, envId]
  );
}

// ─── Reports ───

export async function createReport(params: {
  site_id: string;
  env_id: string;
  plan_id?: string | null;
  report_type: SEOReport['report_type'];
  content: string;
  model_used: string;
}): Promise<SEOReport> {
  const rows = await query<SEOReport>(
    `INSERT INTO seo_reports (site_id, env_id, plan_id, report_type, content, model_used) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [params.site_id, params.env_id, params.plan_id ?? null, params.report_type, params.content, params.model_used]
  );
  return rows[0];
}

export async function listReports(siteId: string, envId: string): Promise<SEOReport[]> {
  return query<SEOReport>(
    'SELECT * FROM seo_reports WHERE site_id = $1 AND env_id = $2 ORDER BY created_at DESC LIMIT 50',
    [siteId, envId]
  );
}

// ─── History Timeline ───

import type { TimelineEvent } from './types';
export type { TimelineEvent };

export async function getSiteTimeline(siteId: string, envId: string, limit = 50): Promise<TimelineEvent[]> {
  const [crawls, plans, reports] = await Promise.all([
    query<CrawlSnapshot>(
      `SELECT id, status, post_count, page_count, started_at as created_at FROM seo_crawl_snapshots WHERE site_id = $1 AND env_id = $2 ORDER BY started_at DESC LIMIT $3`,
      [siteId, envId, limit]
    ),
    query<SEOPlan>(
      `SELECT id, status, strategy_summary, created_at FROM seo_plans WHERE site_id = $1 AND env_id = $2 ORDER BY created_at DESC LIMIT $3`,
      [siteId, envId, limit]
    ),
    query<SEOReport>(
      `SELECT id, report_type, created_at FROM seo_reports WHERE site_id = $1 AND env_id = $2 ORDER BY created_at DESC LIMIT $3`,
      [siteId, envId, limit]
    ),
  ]);

  const events: TimelineEvent[] = [
    ...crawls.map((c) => ({
      type: 'crawl' as const,
      id: c.id,
      summary: `Crawled ${c.post_count} posts, ${c.page_count} pages`,
      status: c.status,
      created_at: c.started_at,
    })),
    ...plans.map((p) => ({
      type: 'plan' as const,
      id: p.id,
      summary: p.strategy_summary?.slice(0, 100) || 'SEO Plan',
      status: p.status,
      created_at: p.created_at,
    })),
    ...reports.map((r) => ({
      type: 'review' as const,
      id: r.id,
      summary: r.report_type.replace(/_/g, ' '),
      status: 'completed',
      created_at: r.created_at,
    })),
  ];

  events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return events.slice(0, limit);
}
