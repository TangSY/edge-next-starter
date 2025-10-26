/**
 * Rate limit related type definitions
 */

/**
 * Rate limit configuration type
 */
export interface RateLimitConfig {
  maxRequests: number; // Maximum requests within the time window
  windowSeconds: number; // Time window (seconds)
  keyPrefix?: string; // KV storage key prefix
  skipPaths?: string[]; // Paths to skip rate limiting
}

/**
 * Rate limit state type
 */
export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
  limit: number;
}
