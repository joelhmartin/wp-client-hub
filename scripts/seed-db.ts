import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'wp-client-hub.db');
const CSV_PATH = path.join(process.cwd(), 'kinsta_ssh_credentials.csv');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Delete existing DB to re-seed
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Deleted existing database');
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    site_name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS environments (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    environment_name TEXT NOT NULL,
    primary_domain TEXT,
    ssh_host TEXT NOT NULL,
    ssh_ip TEXT NOT NULL,
    ssh_port INTEGER NOT NULL,
    ssh_username TEXT NOT NULL,
    ssh_password TEXT,
    ssh_command TEXT NOT NULL,
    is_live INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_environments_site_id ON environments(site_id);
`);

const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const { data } = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

const insertSite = db.prepare('INSERT OR IGNORE INTO sites (id, site_name) VALUES (?, ?)');
const insertEnv = db.prepare(`
  INSERT OR IGNORE INTO environments (id, site_id, environment_name, primary_domain, ssh_host, ssh_ip, ssh_port, ssh_username, ssh_command, is_live)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let envCount = 0;
const siteIds = new Set<string>();

const importAll = db.transaction(() => {
  for (const row of data as any[]) {
    if (!row.site_id || !row.env_id) continue;
    siteIds.add(row.site_id);
    insertSite.run(row.site_id, row.site_name);
    const envName = row.environment || 'Live';
    const isLive = envName.toLowerCase() === 'live' ? 1 : 0;
    insertEnv.run(row.env_id, row.site_id, envName, row.primary_domain || null, row.ssh_host, row.ssh_ip, parseInt(row.ssh_port, 10), row.ssh_username, row.ssh_command, isLive);
    envCount++;
  }
});

importAll();

console.log(`Imported ${siteIds.size} sites and ${envCount} environments`);
db.close();
