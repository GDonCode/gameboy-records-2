// proxy.ts
import { auth } from '@/auth';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { GATE_COOKIE, gatePassword, hasAccess } from '@/lib/site-gate';

// Sign-in rules for account, cart and archived routes.
const memberRoutes = auth((req) => {
  const { pathname } = req.nextUrl;
  const isCustomer = !!req.auth && (req.auth?.user as any)?.role === 'user';

  const isArchivedRoute = ['/feed', '/artists', '/dashboard'].some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );

  if (isArchivedRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (pathname === '/account/register') {
    return NextResponse.redirect(new URL('/account/login?mode=register', req.nextUrl));
  }

  const isLoginPage = pathname === '/account/login';
  const isAccountRoute = pathname.startsWith('/account');
  const isCartRoute = pathname.startsWith('/cart');

  if (isAccountRoute && !isLoginPage && !isCustomer) {
    return NextResponse.redirect(new URL('/account/login', req.nextUrl));
  }

  if (isCartRoute && !isCustomer) {
    return NextResponse.redirect(new URL('/account/login', req.nextUrl));
  }

  if (isLoginPage && isCustomer) {
    return NextResponse.redirect(new URL('/account', req.nextUrl));
  }

  return NextResponse.next();
});

const MEMBER_ROUTE = /^\/(account|cart|feed|artists|dashboard)(\/|$)/;

// Development-phase password gate (lib/site-gate.ts). Off unless SITE_PASSWORD is set.
async function gate(req: NextRequest): Promise<NextResponse | null> {
  const password = gatePassword();
  const { pathname, search } = req.nextUrl;
  if (!password || pathname === '/unlock' || pathname === '/api/unlock') return null;
  if (await hasAccess(req.cookies.get(GATE_COOKIE)?.value, password)) return null;

  // API calls get a plain 401 instead of being redirected to an HTML page.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'This site is password protected.' }, { status: 401 });
  }
  const url = new URL('/unlock', req.nextUrl);
  if (pathname !== '/') url.searchParams.set('next', pathname + search);
  return NextResponse.redirect(url);
}

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const blocked = await gate(req);
  if (blocked) {
    blocked.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return blocked;
  }
  const res = MEMBER_ROUTE.test(req.nextUrl.pathname)
    ? await (memberRoutes as unknown as (r: NextRequest, e: NextFetchEvent) => Promise<Response>)(req, event)
    : NextResponse.next();
  // Keep search engines out while the site is still in development.
  if (gatePassword() && res) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  // Everything except build assets and public files with an extension (images, fonts, icons),
  // which the unlock page needs and which aren't secret.
  matcher: ['/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)'],
};