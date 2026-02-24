import { NextResponse } from 'next/server';
import { getOperationStatus } from '@/lib/kinsta-api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    const result = await getOperationStatus(operationId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Operation status check failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    );
  }
}
