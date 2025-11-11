/**
 * Rate Limiter using Cloudflare KV
 * Prevents abuse by limiting the number of requests per time window
 */

import { getCloudflareEnv } from '@/lib/db/client';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Key prefix for KV storage
   */
  keyPrefix: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests made in the current window
   */
  current: number;

  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Remaining requests in the current window
   */
  remaining: number;

  /**
   * Time when the limit will reset (Unix timestamp in seconds)
   */
  resetAt: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const env = getCloudflareEnv();
  if (!env?.KV) {
    // If KV is not available, allow the request (fail open)
    return {
      allowed: true,
      current: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: Math.floor(Date.now() / 1000) + config.windowSeconds,
    };
  }

  const kv = env.KV;

  const key = `${config.keyPrefix}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.windowSeconds;

  // Get existing timestamps from KV
  const stored = await kv.get<number[]>(key, 'json');
  const timestamps = stored || [];

  // Filter out timestamps outside the current window
  const validTimestamps = timestamps.filter((ts: number) => ts > windowStart);

  // Check if limit exceeded
  const current = validTimestamps.length;
  const allowed = current < config.maxRequests;

  if (allowed) {
    // Add current timestamp
    validTimestamps.push(now);
    // Store updated timestamps with TTL
    await kv.put(key, JSON.stringify(validTimestamps), {
      expirationTtl: config.windowSeconds,
    });
  }

  const resetAt = validTimestamps.length > 0 ? validTimestamps[0] + config.windowSeconds : now;

  return {
    allowed,
    current: allowed ? current + 1 : current,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - (allowed ? current + 1 : current)),
    resetAt,
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Upload rate limiter: 5 uploads per minute per user
 */
export async function checkUploadRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, {
    maxRequests: 5,
    windowSeconds: 60,
    keyPrefix: 'rate-limit:upload',
  });
}

/**
 * Download rate limiter: 30 downloads per minute per IP
 */
export async function checkDownloadRateLimit(ipAddress: string): Promise<RateLimitResult> {
  return checkRateLimit(ipAddress, {
    maxRequests: 30,
    windowSeconds: 60,
    keyPrefix: 'rate-limit:download',
  });
}
