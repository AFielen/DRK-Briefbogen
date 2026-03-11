import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'drk_session';

const PUBLIC_PATHS = ['/', '/auth/verify', '/auth/magic', '/impressum',
                      '/datenschutz', '/hilfe', '/spenden'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/') ||
      PUBLIC_PATHS.some(p => pathname === p) ||
      pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // /dashboard and /onboarding require login
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
