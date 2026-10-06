import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth } from '@/auth';
import { awardPoints } from '@/lib/points';
import { NEWSLETTER_POINTS } from '@/lib/quests';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only signed-in members subscribing with their own account email earn points.
async function awardNewsletterPoints(email: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const sessionEmail = session?.user?.email?.toLowerCase();
  if (!userId || (session?.user as any)?.role !== 'user' || sessionEmail !== email) return;
  await awardPoints(userId, NEWSLETTER_POINTS, 'newsletter_signup');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('newsletter_subscribers').insert({ email });

    if (error) {
      // 23505 = unique violation → already subscribed; treat as success
      if (error.code === '23505') {
        await awardNewsletterPoints(email);
        return NextResponse.json({ message: 'You’re already subscribed!' }, { status: 200 });
      }
      throw error;
    }

    await awardNewsletterPoints(email);

    return NextResponse.json({ message: 'You’re subscribed!' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}