import { NextRequest, NextResponse } from 'next/server';
import { executePlan } from '@/lib/seo/plan-executor';

// POST /api/seo/plan/[planId]/execute
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const dryRun = body.dryRun ?? true;

    const result = await executePlan(planId, { dryRun });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Execution failed' },
      { status: 500 }
    );
  }
}
