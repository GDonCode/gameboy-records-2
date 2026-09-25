// proxy.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
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

export const config = {
  matcher: ['/account/:path*', '/cart/:path*', '/feed/:path*', '/artists/:path*', '/dashboard/:path*'],
};