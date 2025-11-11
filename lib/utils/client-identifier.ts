/**
 * Client Identifier Utility
 * Generates unique identifiers for clients to prevent rate limit bypasses
 */

import { NextRequest } from 'next/server';

/**
 * Get client IP address from request headers
 * Priority: cf-connecting-ip > x-forwarded-for > fallback to fingerprint
 */
export function getClientIp(request: NextRequest): string | null {
  // 1. Try Cloudflare's connecting IP (most reliable)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  // 2. Try x-forwarded-for (may contain multiple IPs, use the first one)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be: "client, proxy1, proxy2"
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp && firstIp !== 'unknown') {
      return firstIp;
    }
  }

  // 3. Try x-real-ip (some proxies use this)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp !== 'unknown') {
    return realIp;
  }

  return null;
}

/**
 * Generate a fingerprint from request headers (fallback when IP is not available)
 * Uses User-Agent and Accept-Language to create a semi-unique identifier
 */
export async function generateClientFingerprint(request: NextRequest): Promise<string> {
  const userAgent = request.headers.get('user-agent') || 'unknown-ua';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown-lang';
  const acceptEncoding = request.headers.get('accept-encoding') || 'unknown-enc';

  // Combine multiple headers for better uniqueness
  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

  // Use Web Crypto API to hash the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Return first 16 characters for brevity
  return `fp_${hashHex.slice(0, 16)}`;
}

/**
 * Get a unique identifier for the client (IP or fingerprint)
 * This is used for rate limiting
 *
 * @param request - Next.js request object
 * @returns A unique identifier for rate limiting
 */
export async function getClientIdentifier(request: NextRequest): Promise<string> {
  // Try to get IP first
  const ip = getClientIp(request);
  if (ip) {
    return `ip_${ip}`;
  }

  // Fallback to fingerprint if IP is not available
  const fingerprint = await generateClientFingerprint(request);
  return fingerprint;
}

/**
 * Check if the client identifier is based on IP or fingerprint
 * This helps adjust rate limits (fingerprint-based can be stricter)
 */
export function isIpBasedIdentifier(identifier: string): boolean {
  return identifier.startsWith('ip_');
}

/**
 * Get adjusted rate limit based on identifier type
 * Fingerprint-based identifiers get stricter limits to prevent abuse
 */
export function getAdjustedRateLimit(
  identifier: string,
  defaultLimit: number
): { limit: number; isStrict: boolean } {
  if (isIpBasedIdentifier(identifier)) {
    return {
      limit: defaultLimit,
      isStrict: false,
    };
  }

  // Fingerprint-based: reduce limit by 70% to prevent abuse
  return {
    limit: Math.floor(defaultLimit * 0.3),
    isStrict: true,
  };
}
