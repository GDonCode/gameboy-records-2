// app/api/guitar/score/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // ⚠️ VERIFY: confirm this matches your actual NextAuth v5 session helper export path
import { supabaseAdmin } from '@/lib/supabase-admin'; // ⚠️ VERIFY: confirm this matches your actual admin client path

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const score = Number(body?.score);

  if (!Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('guitar_scores').insert({
    user_id: (session.user as any).id,
    score,
  });

  if (error) {
    console.error('Failed to save guitar score:', error.message);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}