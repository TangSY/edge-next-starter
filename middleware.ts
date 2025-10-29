/**
 * NextAuth 中间件
 * 用于保护需要认证的路由
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth(req => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register');

  // 如果用户已登录，访问登录/注册页面时重定向到首页
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 如果用户未登录，访问受保护页面时重定向到登录页
  // 根据需要添加需要保护的路由
  const protectedPaths = ['/dashboard', '/profile'];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (!isAuthenticated && isProtectedPath) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// 配置需要运行中间件的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon 文件)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
