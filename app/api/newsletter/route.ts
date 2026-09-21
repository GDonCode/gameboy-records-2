import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        return NextResponse.json({ message: 'You’re already subscribed!' }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: 'You’re subscribed!' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}