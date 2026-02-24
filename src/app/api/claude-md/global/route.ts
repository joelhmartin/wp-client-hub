import { NextResponse } from 'next/server';
import { getGlobalClaudeMdPath, readClaudeMd, writeClaudeMd } from '@/lib/workspaces';

export async function GET() {
  try {
    const content = readClaudeMd(getGlobalClaudeMdPath());
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to read global CLAUDE.md:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { content } = await request.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
    }
    writeClaudeMd(getGlobalClaudeMdPath(), content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to write global CLAUDE.md:', error);
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}
