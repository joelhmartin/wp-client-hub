export const CREATE_TABLES_SQL = `
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

CREATE TABLE IF NOT EXISTS scan_metadata (
    site_id TEXT PRIMARY KEY REFERENCES sites(id) ON DELETE CASCADE,
    last_scan_at TEXT,
    last_scan_status TEXT DEFAULT 'pending',
    last_scan_error TEXT,
    scan_data_json TEXT
);
`;
