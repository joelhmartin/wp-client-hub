import type Database from 'better-sqlite3';
import Papa from 'papaparse';
import fs from 'fs';

interface CSVRow {
  site_name: string;
  environment: string;
  primary_domain: string;
  ssh_host: string;
  ssh_ip: string;
  ssh_port: string;
  ssh_username: string;
  ssh_command: string;
  site_id: string;
  env_id: string;
}

export function importCSV(db: Database.Database, csvPath: string): number {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const { data } = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const insertSite = db.prepare(`
    INSERT OR IGNORE INTO sites (id, site_name) VALUES (?, ?)
  `);

  const insertEnv = db.prepare(`
    INSERT OR IGNORE INTO environments (
      id, site_id, environment_name, primary_domain,
      ssh_host, ssh_ip, ssh_port, ssh_username, ssh_command, is_live
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  const importAll = db.transaction(() => {
    for (const row of data) {
      if (!row.site_id || !row.env_id) continue;

      insertSite.run(row.site_id, row.site_name);

      const envName = row.environment || 'Live';
      const isLive = envName.toLowerCase() === 'live' ? 1 : 0;

      insertEnv.run(
        row.env_id,
        row.site_id,
        envName,
        row.primary_domain || null,
        row.ssh_host,
        row.ssh_ip,
        parseInt(row.ssh_port, 10),
        row.ssh_username,
        row.ssh_command,
        isLive
      );
      count++;
    }
  });

  importAll();
  return count;
}
