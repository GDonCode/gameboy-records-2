// proxy.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isLoginPage = req.nextUrl.pathname === '/account/login';
  const isRegisterPage = req.nextUrl.pathname === '/account/register';
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAccountRoute = req.nextUrl.pathname.startsWith('/account');
  const isCartRoute = req.nextUrl.pathname.startsWith('/cart');

  if (isDashboardRoute && !(isLoggedIn && role === 'artist')) {
    return NextResponse.redirect(new URL('/account/login', req.nextUrl));
  }

  if (isAccountRoute && !isLoginPage && !isRegisterPage && !(isLoggedIn && role === 'user')) {
    return NextResponse.redirect(new URL('/account/login', req.nextUrl));
  }

  if (isCartRoute && !(isLoggedIn && role === 'user')) {
    return NextResponse.redirect(new URL('/account/login', req.nextUrl));
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL(role === 'artist' ? '/dashboard' : '/account', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/cart/:path*'],
};