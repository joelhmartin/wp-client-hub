import { NextResponse } from 'next/server';
import { terminalManager } from '@/lib/terminal-manager';

export async function GET() {
  try {
    const sessions = terminalManager.listSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to list sessions:', error);
    return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
  }
}
