import { NextResponse } from 'next/server';
import { terminalManager } from '@/lib/terminal-manager';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const killed = terminalManager.kill(sessionId);
    if (!killed) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to kill terminal:', error);
    return NextResponse.json({ error: 'Failed to kill terminal' }, { status: 500 });
  }
}
