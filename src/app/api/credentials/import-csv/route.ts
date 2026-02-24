import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { importCSV } from '@/lib/csv-importer';
import path from 'path';
import fs from 'fs';

export async function POST() {
  try {
    const csvPath = path.join(process.cwd(), 'kinsta_ssh_credentials.csv');
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }

    const db = getDb();
    const count = importCSV(db, csvPath);
    return NextResponse.json({ message: `Imported ${count} environments`, count });
  } catch (error) {
    console.error('CSV import failed:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
