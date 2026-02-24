import { execFile } from 'child_process';
import { createPlan, createPlanChanges } from './queries';
import type {
  CrawlData,
  SEMrushKeyword,
  SEOPlan,
  SEOPlanChange,
  KeywordCluster,
  ChangeType,
} from './types';

const CLAUDE_CLI = '/Users/bif/.local/bin/claude';

interface GeneratePlanParams {
  siteId: string;
  envId: string;
  crawlData: CrawlData;
  crawlSnapshotId: string;
  semrushData: SEMrushKeyword[] | null;
  semrushSnapshotId: string | null;
  model: string;
}

interface GeneratePlanResult {
  plan: SEOPlan;
  changes: SEOPlanChange[];
}

export async function generateSEOPlan(params: GeneratePlanParams): Promise<GeneratePlanResult> {
  const { siteId, envId, crawlData, crawlSnapshotId, semrushData, semrushSnapshotId, model } = params;

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(crawlData, semrushData);
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const text = await runClaude(fullPrompt);
  const parsed = parseResponse(text);

  // Save to database
  const plan = await createPlan({
    site_id: siteId,
    env_id: envId,
    crawl_snapshot_id: crawlSnapshotId,
    semrush_snapshot_id: semrushSnapshotId,
    model_used: model,
    prompt_tokens: 0,
    completion_tokens: 0,
    strategy_summary: parsed.strategy_summary,
    keyword_clusters: parsed.keyword_clusters,
  });

  const changes = await createPlanChanges(
    parsed.changes.map((c, i) => ({
      plan_id: plan.id,
      post_id: c.post_id,
      change_type: c.change_type,
      field_name: c.field_name,
      old_value: c.old_value,
      new_value: c.new_value,
      reasoning: c.reasoning,
      priority: c.priority,
      execution_order: i,
    }))
  );

  return { plan, changes };
}

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      CLAUDE_CLI,
      ['--print', '--output-format', 'text'],
      { maxBuffer: 10 * 1024 * 1024, timeout: 120000 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Claude CLI failed: ${error.message}\nstderr: ${stderr}`));
          return;
        }
        resolve(stdout);
      }
    );
    if (child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }
  });
}

function buildSystemPrompt(): string {
  return `You are an expert SEO strategist analyzing WordPress site data. Your job is to produce actionable SEO recommendations.

You MUST respond with valid JSON in exactly this format:
{
  "strategy_summary": "A 2-3 paragraph summary of the overall SEO strategy",
  "keyword_clusters": [
    {
      "name": "Cluster Name",
      "primary_keyword": "main keyword",
      "related_keywords": ["kw1", "kw2"],
      "search_volume": 1000,
      "difficulty": "medium",
      "target_posts": [123, 456]
    }
  ],
  "changes": [
    {
      "post_id": 123,
      "change_type": "title_rewrite",
      "field_name": "post_title",
      "old_value": "Current Title",
      "new_value": "Optimized Title | Brand",
      "reasoning": "Why this change improves SEO",
      "priority": "high"
    }
  ]
}

Valid change_type values: title_rewrite, meta_description, slug_change, content_addition, internal_link, schema_markup, redirect, category_change, tag_change, excerpt_rewrite

Priority values: high, medium, low

Guidelines:
- Focus on the highest-impact changes first
- Title rewrites should include target keywords naturally
- Meta descriptions should be 150-160 characters
- Suggest internal linking opportunities between related content
- Consider existing SEO plugin meta (Yoast/RankMath) when present
- Be specific with recommendations — include exact new values
- Return ONLY the JSON, no markdown formatting or code fences`;
}

function buildUserPrompt(crawlData: CrawlData, semrushData: SEMrushKeyword[] | null): string {
  const parts: string[] = [];

  parts.push(`Site: ${crawlData.site_title} (${crawlData.site_url})`);
  parts.push(`Theme: ${crawlData.theme}`);
  parts.push(`Permalinks: ${crawlData.permalink_structure}`);
  parts.push(`Posts: ${crawlData.posts.length}, Pages: ${crawlData.pages.length}`);
  parts.push(`Categories: ${crawlData.categories.length}, Tags: ${crawlData.tags.length}`);

  // SEO plugins
  const seoPlugins = crawlData.plugins.filter(
    (p) => p.status === 'active' && (p.name.includes('seo') || p.name.includes('rankmath'))
  );
  if (seoPlugins.length) {
    parts.push(`SEO Plugins: ${seoPlugins.map((p) => p.name).join(', ')}`);
  }

  // Posts with SEO data
  parts.push('\n--- POSTS ---');
  for (const post of crawlData.posts.slice(0, 50)) {
    const meta = Object.entries(post.meta || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(' | ');
    parts.push(`[ID:${post.ID}] "${post.post_title}" /${post.post_name}/ ${meta ? `(${meta})` : ''}`);
  }

  // Pages
  parts.push('\n--- PAGES ---');
  for (const page of crawlData.pages.slice(0, 30)) {
    const meta = Object.entries(page.meta || {})
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(' | ');
    parts.push(`[ID:${page.ID}] "${page.post_title}" /${page.post_name}/ ${meta ? `(${meta})` : ''}`);
  }

  // Categories
  if (crawlData.categories.length > 0) {
    parts.push('\n--- CATEGORIES ---');
    for (const cat of crawlData.categories) {
      parts.push(`${cat.name} (${cat.count} posts)`);
    }
  }

  // Tags
  if (crawlData.tags.length > 0) {
    parts.push('\n--- TAGS ---');
    for (const tag of crawlData.tags.slice(0, 30)) {
      parts.push(`${tag.name} (${tag.count} posts)`);
    }
  }

  // SEMrush data
  if (semrushData && semrushData.length > 0) {
    parts.push('\n--- SEMRUSH KEYWORD DATA ---');
    for (const kw of semrushData.slice(0, 50)) {
      parts.push(`"${kw.keyword}" pos:${kw.position} vol:${kw.search_volume} cpc:${kw.cpc} url:${kw.url}`);
    }
  }

  parts.push('\nAnalyze this site data and generate a comprehensive SEO optimization plan.');

  return parts.join('\n');
}

interface ParsedPlan {
  strategy_summary: string;
  keyword_clusters: KeywordCluster[];
  changes: Array<{
    post_id: number | null;
    change_type: ChangeType;
    field_name: string;
    old_value: string | null;
    new_value: string;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

function parseResponse(text: string): ParsedPlan {
  // Strip markdown code fences if present
  let json = text.trim();
  if (json.startsWith('```')) {
    json = json.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${json.slice(0, 200)}`);
  }

  const validChangeTypes = new Set([
    'title_rewrite', 'meta_description', 'slug_change', 'content_addition',
    'internal_link', 'schema_markup', 'redirect', 'category_change',
    'tag_change', 'excerpt_rewrite',
  ]);
  const validPriorities = new Set(['high', 'medium', 'low']);

  const changes = (Array.isArray(parsed.changes) ? parsed.changes : []).map(
    (c: Record<string, unknown>) => ({
      post_id: typeof c.post_id === 'number' ? c.post_id : null,
      change_type: (validChangeTypes.has(c.change_type as string) ? c.change_type : 'title_rewrite') as ChangeType,
      field_name: String(c.field_name || ''),
      old_value: c.old_value ? String(c.old_value) : null,
      new_value: String(c.new_value || ''),
      reasoning: String(c.reasoning || ''),
      priority: (validPriorities.has(c.priority as string) ? c.priority : 'medium') as 'high' | 'medium' | 'low',
    })
  );

  return {
    strategy_summary: String(parsed.strategy_summary || ''),
    keyword_clusters: Array.isArray(parsed.keyword_clusters) ? parsed.keyword_clusters : [],
    changes,
  };
}
