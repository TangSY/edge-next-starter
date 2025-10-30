/**
 * NextAuth Middleware
 * Protects routes that require authentication
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth(req => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

  // If user is authenticated, redirect to home when accessing login/register pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is not authenticated, redirect to login when accessing protected pages
  // Add protected routes as needed
  const protectedPaths = ['/dashboard', '/profile'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// Configure routes where middleware should run
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in the public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
