import { NextRequest } from 'next/server';
import { withMiddleware, withApiHandler } from '@/lib/api';
import { analytics, AnalyticsEventType } from '@/lib/analytics';
import {
  TokenExpiredError,
  InvalidCredentialsError,
  AuthenticationError,
  AuthorizationError,
} from '@/lib/errors';

export const runtime = 'edge';

/**
 * Simple auth demo route
 * Scenarios:
 * - Missing Authorization header -> 401
 * - Expired token -> 401 TOKEN_EXPIRED
 * - Role not authorized -> 403 AUTHORIZATION_ERROR
 * - Success -> 200, and records business event
 */
export async function GET(request: NextRequest) {
  return withMiddleware(request, () =>
    withApiHandler(async () => {
      const authHeader = request.headers.get('authorization');
      const url = new URL(request.url);
      const requiredRole = url.searchParams.get('role') || 'admin';

      if (!authHeader) {
        await analytics.trackError('AUTHENTICATION_ERROR', 'Missing Authorization header', {
          path: url.pathname,
        });
        throw new AuthenticationError('Missing Authorization header');
      }

      const token = authHeader.replace(/Bearer\s+/i, '').trim();

      // Simulate credential validation
      if (!token || token.length < 10) {
        await analytics.trackError('INVALID_CREDENTIALS', 'Invalid token', {
          path: url.pathname,
        });
        throw new InvalidCredentialsError('Invalid token');
      }

      // Simulate expiration check
      if (token.endsWith('.expired')) {
        await analytics.trackError('TOKEN_EXPIRED', 'Token expired', {
          path: url.pathname,
        });
        throw new TokenExpiredError('Token expired');
      }

      // Simulate role parsing
      const roles = token.split('.');
      const hasRole = roles.includes(requiredRole);

      if (!hasRole) {
        await analytics.trackError('AUTHORIZATION_ERROR', 'Insufficient role', {
          path: url.pathname,
          requiredRole,
        });
        throw new AuthorizationError('Insufficient role');
      }

      await analytics.trackBusinessEvent(AnalyticsEventType.USER_UPDATED, {
        action: 'auth.success',
        role: requiredRole,
      });

      return { ok: true, role: requiredRole };
    })
  );
}
