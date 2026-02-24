import { resolveSSHConnection } from './ssh-executor';
import * as wp from './wp-cli';
import * as db from './queries';
import type { SEOContentBackup, SSHConnectionInfo } from './types';

interface RollbackResult {
  rolledBack: number;
  failed: number;
  logs: Array<{ changeId: string; success: boolean; message: string }>;
}

export async function rollbackPlan(planId: string): Promise<RollbackResult> {
  const plan = await db.getPlan(planId);
  if (!plan) throw new Error('Plan not found');

  const conn = await resolveSSHConnection(plan.env_id);
  const backups = await db.getPlanBackups(planId);

  const result: RollbackResult = { rolledBack: 0, failed: 0, logs: [] };

  // Rollback in reverse order
  for (const backup of backups.reverse()) {
    try {
      await restoreFromBackup(conn, backup);
      await db.updateChangeStatus(backup.change_id, 'rolled_back');

      await db.createExecutionLog({
        plan_id: planId,
        change_id: backup.change_id,
        command: `rollback ${backup.field_name} on post ${backup.post_id}`,
        stdout: 'Restored from backup',
        stderr: '',
        exit_code: 0,
        duration_ms: 0,
      });

      result.rolledBack++;
      result.logs.push({ changeId: backup.change_id, success: true, message: 'Rolled back' });
    } catch (err) {
      result.failed++;
      result.logs.push({
        changeId: backup.change_id,
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Mark plan as rolled back
  await db.updatePlanStatus(planId, 'rolled_back');

  return result;
}

export async function rollbackChange(changeId: string): Promise<RollbackResult> {
  const backup = await db.getContentBackup(changeId);
  if (!backup) throw new Error('No backup found for this change');

  // We need the plan to get the environment
  const changes = await db.getPlanChanges(backup.plan_id);
  const change = changes.find((c) => c.id === changeId);
  if (!change) throw new Error('Change not found');

  const plan = await db.getPlan(backup.plan_id);
  if (!plan) throw new Error('Plan not found');

  const conn = await resolveSSHConnection(plan.env_id);

  try {
    await restoreFromBackup(conn, backup);
    await db.updateChangeStatus(changeId, 'rolled_back');

    await db.createExecutionLog({
      plan_id: backup.plan_id,
      change_id: changeId,
      command: `rollback ${backup.field_name} on post ${backup.post_id}`,
      stdout: 'Restored from backup',
      stderr: '',
      exit_code: 0,
      duration_ms: 0,
    });

    return { rolledBack: 1, failed: 0, logs: [{ changeId, success: true, message: 'Rolled back' }] };
  } catch (err) {
    return {
      rolledBack: 0,
      failed: 1,
      logs: [{ changeId, success: false, message: err instanceof Error ? err.message : String(err) }],
    };
  }
}

async function restoreFromBackup(conn: SSHConnectionInfo, backup: SEOContentBackup): Promise<void> {
  if (!backup.post_id) return;

  // Determine what kind of field to restore
  const field = backup.field_name;

  if (field === 'post_title') {
    const result = await wp.updatePostTitle(conn, backup.post_id, backup.original_value);
    if (result.exitCode !== 0) throw new Error(`Failed to restore title: ${result.stderr}`);
  } else if (field === 'post_name') {
    const result = await wp.updatePostSlug(conn, backup.post_id, backup.original_value);
    if (result.exitCode !== 0) throw new Error(`Failed to restore slug: ${result.stderr}`);
  } else if (field === 'post_excerpt') {
    const result = await wp.updatePostExcerpt(conn, backup.post_id, backup.original_value);
    if (result.exitCode !== 0) throw new Error(`Failed to restore excerpt: ${result.stderr}`);
  } else if (field === 'post_content') {
    const result = await wp.updatePostContent(conn, backup.post_id, backup.original_value);
    if (result.exitCode !== 0) throw new Error(`Failed to restore content: ${result.stderr}`);
  } else {
    // Assume it's a meta field
    const result = await wp.updatePostMeta(conn, backup.post_id, field, backup.original_value);
    if (result.exitCode !== 0) throw new Error(`Failed to restore meta ${field}: ${result.stderr}`);
  }
}
