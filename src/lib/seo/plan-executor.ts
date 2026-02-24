import { resolveSSHConnection } from './ssh-executor';
import * as wp from './wp-cli';
import * as db from './queries';
import type { SEOPlanChange, SSHConnectionInfo } from './types';

interface ExecuteOptions {
  dryRun: boolean;
}

interface ExecuteResult {
  executed: number;
  failed: number;
  skipped: number;
  logs: Array<{ changeId: string; success: boolean; message: string }>;
}

export async function executePlan(planId: string, options: ExecuteOptions): Promise<ExecuteResult> {
  const plan = await db.getPlan(planId);
  if (!plan) throw new Error('Plan not found');

  const conn = await resolveSSHConnection(plan.env_id);
  const changes = await db.getPlanChanges(planId);
  const approvedChanges = changes.filter((c) => c.status === 'approved');

  if (approvedChanges.length === 0) {
    return { executed: 0, failed: 0, skipped: changes.length, logs: [] };
  }

  // Mark plan as executing
  await db.updatePlanStatus(planId, 'executing');

  const result: ExecuteResult = { executed: 0, failed: 0, skipped: 0, logs: [] };

  for (const change of approvedChanges) {
    try {
      if (options.dryRun) {
        result.logs.push({ changeId: change.id, success: true, message: 'Dry run — no changes made' });
        result.executed++;
        continue;
      }

      // Backup current value before modifying
      await backupCurrentValue(conn, change, planId);

      // Execute the change
      const execResult = await executeChange(conn, change);

      // Log the command
      await db.createExecutionLog({
        plan_id: planId,
        change_id: change.id,
        command: describeChange(change),
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        exit_code: execResult.exitCode,
        duration_ms: execResult.durationMs,
      });

      if (execResult.exitCode === 0) {
        await db.updateChangeStatus(change.id, 'executed');
        result.executed++;
        result.logs.push({ changeId: change.id, success: true, message: 'Executed successfully' });
      } else {
        await db.updateChangeStatus(change.id, 'failed');
        result.failed++;
        result.logs.push({
          changeId: change.id,
          success: false,
          message: `Exit code ${execResult.exitCode}: ${execResult.stderr.slice(0, 200)}`,
        });
      }
    } catch (err) {
      await db.updateChangeStatus(change.id, 'failed');
      result.failed++;
      result.logs.push({
        changeId: change.id,
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Count skipped
  result.skipped = changes.filter((c) => c.status === 'skipped' || c.status === 'pending').length;

  // Update plan status
  if (!options.dryRun) {
    await db.updatePlanStatus(planId, 'executed');
  }

  return result;
}

async function backupCurrentValue(
  conn: SSHConnectionInfo,
  change: SEOPlanChange,
  planId: string
): Promise<void> {
  if (!change.post_id) return;

  let currentValue = '';

  switch (change.change_type) {
    case 'title_rewrite': {
      const post = await wp.getPost(conn, change.post_id);
      currentValue = post?.post_title || '';
      break;
    }
    case 'meta_description': {
      const meta = await wp.getPostMeta(conn, change.post_id, [change.field_name]);
      currentValue = meta[change.field_name] || '';
      break;
    }
    case 'slug_change': {
      const post = await wp.getPost(conn, change.post_id);
      currentValue = post?.post_name || '';
      break;
    }
    case 'excerpt_rewrite': {
      const post = await wp.getPost(conn, change.post_id);
      currentValue = post?.post_excerpt || '';
      break;
    }
    default:
      currentValue = change.old_value || '';
  }

  await db.createContentBackup({
    change_id: change.id,
    plan_id: planId,
    post_id: change.post_id,
    field_name: change.field_name,
    original_value: currentValue,
  });
}

async function executeChange(
  conn: SSHConnectionInfo,
  change: SEOPlanChange
): Promise<{ stdout: string; stderr: string; exitCode: number; durationMs: number }> {
  if (!change.post_id && change.change_type !== 'redirect') {
    throw new Error(`Change ${change.id}: post_id required for ${change.change_type}`);
  }

  switch (change.change_type) {
    case 'title_rewrite':
      return wp.updatePostTitle(conn, change.post_id!, change.new_value);

    case 'meta_description':
      return wp.updatePostMeta(conn, change.post_id!, change.field_name, change.new_value);

    case 'slug_change':
      return wp.updatePostSlug(conn, change.post_id!, change.new_value);

    case 'excerpt_rewrite':
      return wp.updatePostExcerpt(conn, change.post_id!, change.new_value);

    case 'content_addition':
      return wp.updatePostContent(conn, change.post_id!, change.new_value);

    case 'internal_link':
    case 'schema_markup':
    case 'category_change':
    case 'tag_change':
      // These use meta updates
      return wp.updatePostMeta(conn, change.post_id!, change.field_name, change.new_value);

    case 'redirect':
      // Redirect — attempt via wp-cli or plugin-specific command
      return wp.updatePostMeta(conn, change.post_id || 0, change.field_name, change.new_value);

    default:
      throw new Error(`Unsupported change type: ${change.change_type}`);
  }
}

function describeChange(change: SEOPlanChange): string {
  return `${change.change_type} on post ${change.post_id || 'N/A'}: ${change.field_name}`;
}
