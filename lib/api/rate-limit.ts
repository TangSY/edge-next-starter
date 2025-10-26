import { NextRequest, NextResponse } from 'next/server';
import { createCacheClient } from '@/lib/cache/client';
import { RateLimitConfig, RateLimitStatus } from '@/types/rate-limit';
import { analytics } from '@/lib/analytics';

/**
 * Default rate limit configuration
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 300, // 300 requests
  windowSeconds: 60, // per minute
  keyPrefix: 'rate-limit',
  skipPaths: ['/api/health'], // Do not rate limit health checks
};

/**
 * Read rate limit configuration from environment variables
 */
function getRateLimitConfig(): RateLimitConfig {
  const env = process.env;

  return {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS
      ? parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10)
      : DEFAULT_CONFIG.maxRequests,
    windowSeconds: env.RATE_LIMIT_WINDOW_SECONDS
      ? parseInt(env.RATE_LIMIT_WINDOW_SECONDS, 10)
      : DEFAULT_CONFIG.windowSeconds,
    keyPrefix: DEFAULT_CONFIG.keyPrefix,
    skipPaths: DEFAULT_CONFIG.skipPaths,
  };
}

/**
 * Check whether rate limiting is enabled
 */
function isRateLimitEnabled(): boolean {
  const env = process.env;
  // Enabled by default unless explicitly set to 'false'
  return env.RATE_LIMIT_ENABLED !== 'false';
}

/**
 * Get client identifier
 * Prefer Cloudflare-provided real IP
 */
function getClientIdentifier(request: NextRequest): string {
  // Real IP provided by Cloudflare
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;

  // Fallback: X-Forwarded-For
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    const ips = forwarded.split(',');
    return ips[0].trim();
  }

  // Fallback: X-Real-IP
  const realIp = request.headers.get('X-Real-IP');
  if (realIp) return realIp;

  // Last resort: use User-Agent (not recommended)
  const ua = request.headers.get('User-Agent') || 'unknown';
  return `ua-${ua.substring(0, 50)}`;
}

/**
 * Check rate limit
 * Uses sliding window algorithm
 */
async function checkRateLimit(clientId: string, config: RateLimitConfig): Promise<RateLimitStatus> {
  const cache = createCacheClient();
  if (!cache) {
    // If KV is unavailable, allow request to pass
    console.warn('KV not available, skipping rate limit');
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowSeconds * 1000,
      limit: config.maxRequests,
    };
  }

  const key = `${config.keyPrefix}:${clientId}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const resetAt = now + windowMs;

  try {
    // Get current count
    const currentData = await cache.get(key);
    let count = 0;
    let firstRequestTime = now;

    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        count = parsed.count || 0;
        firstRequestTime = parsed.firstRequestTime || now;
      } catch {
        // If parsing fails, reset counter
        count = 0;
        firstRequestTime = now;
      }
    }

    // Check whether time window expired
    if (now - firstRequestTime > windowMs) {
      // Window expired; reset counter
      count = 0;
      firstRequestTime = now;
    }

    // Check whether over the limit
    if (count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: firstRequestTime + windowMs,
        limit: config.maxRequests,
      };
    }

    // Increment counter
    count++;
    await cache.put(key, JSON.stringify({ count, firstRequestTime }), {
      expirationTtl: config.windowSeconds,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - count,
      resetAt: firstRequestTime + windowMs,
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request to pass
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt,
      limit: config.maxRequests,
    };
  }
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders<T>(
  response: NextResponse<T>,
  status: RateLimitStatus
): NextResponse<T> {
  response.headers.set('X-RateLimit-Limit', String(status.limit));
  response.headers.set('X-RateLimit-Remaining', String(status.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.floor(status.resetAt / 1000)));
  return response;
}

/**
 * Rate limiting middleware
 * Use in API routes to automatically check and apply rate limits
 *
 * @param request - Next.js request object
 * @param handler - Business logic handler
 * @param customConfig - Optional custom config (overrides defaults)
 * @returns Promise<NextResponse>
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withRateLimit(request, async () => {
 *     const data = await fetchData();
 *     return successResponse(data);
 *   });
 * }
 *
 * @example
 * // Custom config
 * export async function POST(request: NextRequest) {
 *   return withRateLimit(
 *     request,
 *     async () => {
 *       const result = await processData();
 *       return successResponse(result);
 *     },
 *     { maxRequests: 10, windowSeconds: 60 } // 10 requests per minute
 *   );
 * }
 */
export async function withRateLimit<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>,
  customConfig?: Partial<RateLimitConfig>
): Promise<NextResponse<T>> {
  // Check whether rate limiting is enabled
  if (!isRateLimitEnabled()) {
    return handler();
  }

  const config = { ...getRateLimitConfig(), ...customConfig };

  // Check skip list
  const pathname = new URL(request.url).pathname;
  if (config.skipPaths?.some(path => pathname.startsWith(path))) {
    return handler();
  }

  // Get client identifier
  const clientId = getClientIdentifier(request);

  // Check rate limit
  const status = await checkRateLimit(clientId, config);

  // If over the limit, return 429
  if (!status.allowed) {
    const retryAfter = Math.ceil((status.resetAt - Date.now()) / 1000);
    const response = NextResponse.json(
      {
        success: false,
        error: {
          type: 'RATE_LIMIT_ERROR',
          message: 'Too many requests, please try again later',
          details: {
            limit: status.limit,
            resetAt: status.resetAt,
            retryAfter,
          },
        },
      },
      { status: 429 }
    ) as NextResponse<T>;

    response.headers.set('Retry-After', String(retryAfter));

    await analytics.trackRateLimitExceeded(clientId, pathname, {
      retryAfter,
      limit: status.limit,
    });

    return addRateLimitHeaders(response, status);
  }

  // Execute business logic
  const response = await handler();

  // Add rate limit headers to response
  return addRateLimitHeaders(response, status);
}

/**
 * Get client rate limit status (without incrementing count)
 * For querying current rate limit status
 */
export async function getRateLimitStatus(
  request: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitStatus> {
  const config = { ...getRateLimitConfig(), ...customConfig };
  const clientId = getClientIdentifier(request);

  const cache = createCacheClient();
  if (!cache) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowSeconds * 1000,
      limit: config.maxRequests,
    };
  }

  const key = `${config.keyPrefix}:${clientId}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  try {
    const currentData = await cache.get(key);
    if (!currentData) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: now + windowMs,
        limit: config.maxRequests,
      };
    }

    const parsed = JSON.parse(currentData);
    const count = parsed.count || 0;
    const firstRequestTime = parsed.firstRequestTime || now;

    // Check whether window expired
    if (now - firstRequestTime > windowMs) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: now + windowMs,
        limit: config.maxRequests,
      };
    }

    return {
      allowed: count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt: firstRequestTime + windowMs,
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error('Get rate limit status error:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + windowMs,
      limit: config.maxRequests,
    };
  }
}
