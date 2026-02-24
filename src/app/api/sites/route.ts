import { NextResponse } from 'next/server';
import { getAllSites } from '@/lib/db/sites';

export async function GET() {
  try {
    const sites = getAllSites();
    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Failed to get sites:', error);
    return NextResponse.json({ error: 'Failed to get sites' }, { status: 500 });
  }
}
