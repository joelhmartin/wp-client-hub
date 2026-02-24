import { NextRequest, NextResponse } from 'next/server';
import { getPlanChanges, updateChangeStatus } from '@/lib/seo/queries';

// GET /api/seo/plan/[planId]/changes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const changes = await getPlanChanges(planId);
    return NextResponse.json({ changes });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}

// PATCH /api/seo/plan/[planId]/changes — Update individual change statuses
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    await params; // validate route
    const body = await request.json();
    const { updates } = body; // Array of { changeId, status }

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates array required' }, { status: 400 });
    }

    for (const { changeId, status } of updates) {
      await updateChangeStatus(changeId, status);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    );
  }
}
