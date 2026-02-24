// ─── SEO Engine Types ───

// ─── Site Config ───
export interface SEOSiteConfig {
  id: string;
  site_id: string;
  env_id: string;
  semrush_domain: string | null;
  enabled_features: EnabledFeatures;
  created_at: string;
  updated_at: string;
}

export interface EnabledFeatures {
  title_optimization: boolean;
  meta_description: boolean;
  internal_linking: boolean;
  schema_markup: boolean;
  redirect_management: boolean;
}

// ─── Crawl Data ───
export interface CrawlSnapshot {
  id: string;
  site_id: string;
  env_id: string;
  crawl_data: CrawlData;
  post_count: number;
  page_count: number;
  status: 'running' | 'completed' | 'failed';
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface CrawlData {
  site_url: string;
  site_title: string;
  posts: WPPost[];
  pages: WPPost[];
  categories: WPTerm[];
  tags: WPTerm[];
  plugins: WPPlugin[];
  theme: string;
  permalink_structure: string;
}

export interface WPPost {
  ID: number;
  post_title: string;
  post_name: string;       // slug
  post_status: string;
  post_type: string;
  post_date: string;
  post_modified: string;
  post_content: string;    // truncated for crawl
  post_excerpt: string;
  url: string;
  meta: Record<string, string>;  // yoast/rankmath meta
}

export interface WPTerm {
  term_id: number;
  name: string;
  slug: string;
  taxonomy: string;
  count: number;
  description: string;
}

export interface WPPlugin {
  name: string;
  status: string;
  version: string;
}

// ─── SEMrush Data ───
export interface SEMrushSnapshot {
  id: string;
  site_id: string;
  env_id: string;
  domain: string;
  keyword_data: SEMrushKeyword[];
  organic_traffic: number | null;
  fetched_at: string;
}

export interface SEMrushKeyword {
  keyword: string;
  position: number;
  search_volume: number;
  cpc: number;
  url: string;
  traffic_percent: number;
}

// ─── SEO Plans ───
export interface SEOPlan {
  id: string;
  site_id: string;
  env_id: string;
  crawl_snapshot_id: string;
  semrush_snapshot_id: string | null;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  strategy_summary: string;
  keyword_clusters: KeywordCluster[];
  status: 'draft' | 'approved' | 'executing' | 'executed' | 'rolled_back';
  created_at: string;
  updated_at: string;
}

export interface KeywordCluster {
  name: string;
  primary_keyword: string;
  related_keywords: string[];
  search_volume: number;
  difficulty: string;
  target_posts: number[];
}

// ─── Plan Changes ───
export type ChangeType =
  | 'title_rewrite'
  | 'meta_description'
  | 'slug_change'
  | 'content_addition'
  | 'internal_link'
  | 'schema_markup'
  | 'redirect'
  | 'category_change'
  | 'tag_change'
  | 'excerpt_rewrite';

export interface SEOPlanChange {
  id: string;
  plan_id: string;
  post_id: number | null;
  change_type: ChangeType;
  field_name: string;
  old_value: string | null;
  new_value: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'skipped' | 'executed' | 'failed' | 'rolled_back';
  execution_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Content Backups ───
export interface SEOContentBackup {
  id: string;
  change_id: string;
  plan_id: string;
  post_id: number | null;
  field_name: string;
  original_value: string;
  backed_up_at: string;
}

// ─── Execution Log ───
export interface SEOExecutionLog {
  id: string;
  plan_id: string;
  change_id: string | null;
  command: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  executed_at: string;
}

// ─── Ranking Snapshots ───
export interface SEORankingSnapshot {
  id: string;
  site_id: string;
  env_id: string;
  plan_id: string | null;
  snapshot_type: 'before' | 'after';
  rankings: RankingEntry[];
  captured_at: string;
}

export interface RankingEntry {
  keyword: string;
  position: number | null;
  url: string;
  search_volume: number;
}

// ─── Reports ───
export interface SEOReport {
  id: string;
  site_id: string;
  env_id: string;
  plan_id: string | null;
  report_type: 'plan_review' | 'execution_review' | 'ranking_review';
  content: string;          // markdown
  model_used: string;
  created_at: string;
}

// ─── SSH Execution ───
export interface SSHExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface SSHConnectionInfo {
  host: string;
  port: number;
  username: string;
  password: string;
}

// ─── Timeline (shared between client & server) ───
export interface TimelineEvent {
  type: 'crawl' | 'plan' | 'execution' | 'review';
  id: string;
  summary: string;
  status: string;
  created_at: string;
}
