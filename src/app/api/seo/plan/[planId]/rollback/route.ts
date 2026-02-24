import { NextRequest, NextResponse } from 'next/server';
import { rollbackPlan, rollbackChange } from '@/lib/seo/rollback';

// POST /api/seo/plan/[planId]/rollback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const changeId = body.changeId; // Optional: rollback single change

    if (changeId) {
      const result = await rollbackChange(changeId);
      return NextResponse.json(result);
    }

    const result = await rollbackPlan(planId);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Rollback failed' },
      { status: 500 }
    );
  }
}
