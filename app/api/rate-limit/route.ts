import { NextRequest } from 'next/server';
import { successResponse, withRateLimit, getRateLimitStatus } from '@/lib/api';

export const runtime = 'edge';

/**
 * GET /api/rate-limit - Query current rate limit status
 *
 * This is an example endpoint demonstrating how to:
 * 1. Apply rate limiting
 * 2. Query rate limit status
 *
 * Response includes rate limit info in headers:
 * - X-RateLimit-Limit: maximum requests
 * - X-RateLimit-Remaining: remaining requests
 * - X-RateLimit-Reset: reset timestamp
 */
export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    // Get current rate limit status (without incrementing count)
    const status = await getRateLimitStatus(request);

    return successResponse(
      {
        rateLimit: {
          limit: status.limit,
          remaining: status.remaining,
          resetAt: new Date(status.resetAt).toISOString(),
          resetInSeconds: Math.ceil((status.resetAt - Date.now()) / 1000),
        },
        message: 'Rate limit status retrieved successfully',
      },
      'Rate limit info'
    );
  });
}
