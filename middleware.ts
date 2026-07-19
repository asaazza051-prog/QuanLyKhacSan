import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const SESSION_COOKIE_NAME = 'admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoot = pathname === '/admin' || pathname.startsWith('/admin/');
  const isLoginRoute = pathname === '/admin/login';

  // Secret setup matching action
  const secret = process.env.ADMIN_SESSION_SECRET;
  const secretKey = secret && secret.length >= 32
    ? new TextEncoder().encode(secret)
    : new TextEncoder().encode('fallback_secret_must_be_at_least_32_characters_long');

  if (isAdminRoot && !isLoginRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      const url = new URL('/admin/login', request.url);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      if (payload.role !== 'admin') {
        throw new Error('Unauthorized role in session');
      }
      return NextResponse.next();
    } catch (err) {
      console.error('Admin middleware token validation failed:', err);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  if (isLoginRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, secretKey);
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch {
        // Token invalid, allow viewing login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
