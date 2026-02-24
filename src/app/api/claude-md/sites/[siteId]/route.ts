import { NextResponse } from 'next/server';
import { getSiteClaudeMdPath, readClaudeMd, writeClaudeMd } from '@/lib/workspaces';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const content = readClaudeMd(getSiteClaudeMdPath(siteId));
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to read site CLAUDE.md:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const { content } = await request.json();
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
    }
    writeClaudeMd(getSiteClaudeMdPath(siteId), content);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to write site CLAUDE.md:', error);
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}
