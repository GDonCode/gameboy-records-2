// app/api/rewards/claim/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { claimReward } from '@/lib/claims';

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session?.user || !userId || (session.user as any).role !== 'user') {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const level = body?.level;
  if (typeof level !== 'number' || !Number.isInteger(level)) {
    return NextResponse.json({ error: 'level is required.' }, { status: 400 });
  }

  const result = await claimReward(userId, level);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, alreadyClaimed: result.alreadyClaimed });
}