/**
 * NextAuth Middleware
 * Default-protected strategy: All routes require authentication unless explicitly made public
 */

import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export default auth(req => {
  const isAuthenticated = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicPaths = [
    '/', // Home page
    '/privacy', // Privacy policy page
    '/terms', // Terms of service page
    '/login', // Login page
    '/register', // Register page
    '/api/auth', // NextAuth API routes
    '/api/health', // Health check endpoint
    '/api/register', // User registration endpoint
  ];

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
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
