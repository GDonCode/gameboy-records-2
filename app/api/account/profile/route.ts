// app/api/account/profile/route.ts
// Update the member's display name.
import { NextResponse } from 'next/server';
import { getMemberId } from '@/lib/account-session';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateDisplayName } from '@/lib/account-validation';

export async function PATCH(request: Request) {
  const userId = await getMemberId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateDisplayName(body?.displayName);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error } = await supabaseAdmin.from('users').update({ display_name: result.value }).eq('id', userId);
  if (error) {
    console.error('Failed to update display name:', error.message);
    return NextResponse.json({ error: 'Could not save your name. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ displayName: result.value });
}
