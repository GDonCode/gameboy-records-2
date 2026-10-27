// app/api/unlock/route.ts
// Checks the development-phase site password and, if right, sets the access cookie.
import { NextResponse } from 'next/server';
import { GATE_COOKIE, GATE_MAX_AGE, accessToken, gatePassword, passwordMatches, safeNext } from '@/lib/site-gate';

export async function POST(request: Request) {
  const password = gatePassword();
  const body = await request.json().catch(() => null);
  const next = safeNext(body?.next);
  if (!password) return NextResponse.json({ next }); // gate is off

  const submitted = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  if (!(await passwordMatches(submitted, password))) {
    // A short pause makes guessing slow without a database.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'That password isn’t right.' }, { status: 401 });
  }

  const res = NextResponse.json({ next });
  res.cookies.set(GATE_COOKIE, await accessToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: GATE_MAX_AGE,
  });
  return res;
}
