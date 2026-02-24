import { getDb, decryptPassword } from './index';
import type { Site, SiteListItem, Environment } from '../types';

export function getAllSites(): SiteListItem[] {
  const db = getDb();
  const sites = db.prepare('SELECT id, site_name FROM sites ORDER BY site_name').all() as { id: string; site_name: string }[];

  const envStmt = db.prepare(
    'SELECT id, environment_name, is_live FROM environments WHERE site_id = ? ORDER BY is_live DESC, environment_name'
  );

  return sites.map((site) => ({
    id: site.id,
    site_name: site.site_name,
    environments: envStmt.all(site.id) as Pick<Environment, 'id' | 'environment_name' | 'is_live'>[],
  }));
}

export function getSiteWithEnvironments(siteId: string): Site | null {
  const db = getDb();
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId) as Site | undefined;
  if (!site) return null;

  const envs = db.prepare('SELECT * FROM environments WHERE site_id = ? ORDER BY is_live DESC').all(siteId) as Environment[];

  // Decrypt passwords
  for (const env of envs) {
    if (env.ssh_password) {
      try {
        env.ssh_password = decryptPassword(env.ssh_password);
      } catch {
        console.warn(`[DB] Failed to decrypt password for env ${env.id}, clearing to trigger re-fetch`);
        env.ssh_password = null as unknown as string;
      }
    }
  }

  return { ...site, environments: envs };
}

export function getEnvironment(envId: string): Environment | null {
  const db = getDb();
  const env = db.prepare('SELECT * FROM environments WHERE id = ?').get(envId) as Environment | undefined;
  if (!env) return null;

  if (env.ssh_password) {
    try {
      env.ssh_password = decryptPassword(env.ssh_password);
    } catch {
      console.warn(`[DB] Failed to decrypt password for env ${env.id}, clearing to trigger re-fetch`);
      env.ssh_password = null as unknown as string;
    }
  }

  return env;
}

export function upsertSite(id: string, siteName: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO sites (id, site_name) VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET site_name = excluded.site_name, updated_at = datetime('now')
  `).run(id, siteName);
}

export function upsertEnvironment(env: Omit<Environment, 'ssh_password'> & { ssh_password?: string | null }): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO environments (id, site_id, environment_name, primary_domain, ssh_host, ssh_ip, ssh_port, ssh_username, ssh_command, is_live, ssh_password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      environment_name = excluded.environment_name,
      primary_domain = excluded.primary_domain,
      ssh_host = excluded.ssh_host,
      ssh_ip = excluded.ssh_ip,
      ssh_port = excluded.ssh_port,
      ssh_username = excluded.ssh_username,
      ssh_command = excluded.ssh_command,
      is_live = excluded.is_live,
      ssh_password = COALESCE(excluded.ssh_password, environments.ssh_password)
  `).run(
    env.id, env.site_id, env.environment_name, env.primary_domain,
    env.ssh_host, env.ssh_ip, env.ssh_port, env.ssh_username,
    env.ssh_command, env.is_live, env.ssh_password || null
  );
}

export function setEnvironmentPassword(envId: string, encryptedPassword: string): void {
  const db = getDb();
  db.prepare('UPDATE environments SET ssh_password = ? WHERE id = ?').run(encryptedPassword, envId);
}

export function getExistingSiteIds(): Set<string> {
  const db = getDb();
  const rows = db.prepare('SELECT id FROM sites').all() as { id: string }[];
  return new Set(rows.map((r) => r.id));
}

export function getEnvironmentsMissingPasswords(): string[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT id FROM environments WHERE ssh_password IS NULL OR ssh_password = ''"
  ).all() as { id: string }[];
  return rows.map((r) => r.id);
}
