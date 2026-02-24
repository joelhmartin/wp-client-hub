import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CREATE_TABLES_SQL } from './schema';
import { importCSV } from '../csv-importer';
import { encrypt, decrypt } from '../crypto';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'wp-client-hub.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const isNew = !fs.existsSync(DB_PATH);
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.exec(CREATE_TABLES_SQL);

  if (isNew) {
    const csvPath = path.join(process.cwd(), 'kinsta_ssh_credentials.csv');
    if (fs.existsSync(csvPath)) {
      console.log('[DB] New database - importing CSV...');
      const count = importCSV(_db, csvPath);
      console.log(`[DB] Imported ${count} environments from CSV`);
    }
  }

  return _db;
}

export function encryptPassword(password: string): string {
  return encrypt(password);
}

export function decryptPassword(encrypted: string): string {
  return decrypt(encrypted);
}
