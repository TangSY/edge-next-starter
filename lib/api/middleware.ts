import { NextRequest, NextResponse } from 'next/server';
import { LoggerFactory } from '@/lib/logger';
import { analytics } from '@/lib/analytics';

const logger = LoggerFactory.getLogger('api-middleware');

/**
 * Generate request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate Trace ID (for distributed tracing)
 */
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Generate Span ID (for specific operation tracing)
 */
function generateSpanId(): string {
  return `span_${Math.random().toString(36).substr(2, 12)}`;
}

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string | undefined {
  // Real IP provided by Cloudflare
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;

  // Fallback: X-Forwarded-For
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback: X-Real-IP
  return request.headers.get('X-Real-IP') || undefined;
}

/**
 * Request logging middleware
 * Enhanced: supports structured logging and request tracing
 */
export async function withRequestLogging<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const requestId = generateRequestId();
  const traceId = generateTraceId();
  const spanId = generateSpanId();
  const startTime = Date.now();

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  // Create request-level logger with tracing metadata
  const requestLogger = logger.withMetadata({
    requestId,
    traceId,
    spanId,
    method,
    path,
    ip: ip || undefined,
    userAgent: userAgent || undefined,
  });

  // Log request info (structured)
  requestLogger.info('Incoming request', {
    query: Object.fromEntries(url.searchParams),
  });

  try {
    const response = await handler();
    const duration = Date.now() - startTime;

    // Record request completion using http method (auto choose log level by status)
    requestLogger.http(method, path, response.status, duration, {
      requestId,
      traceId,
    });

    // Track analytics event
    await analytics.trackHttpRequest(method, path, response.status, duration, {
      requestId,
      traceId,
      spanId,
      ip: ip || undefined,
      userAgent: userAgent || undefined,
    });

    // Add tracing response headers
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Trace-ID', traceId);
    response.headers.set('X-Span-ID', spanId);
    response.headers.set('X-Response-Time', `${duration}ms`);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error info (structured)
    requestLogger.error('Request failed', error as Error, {
      requestId,
      traceId,
      spanId,
      method,
      path,
      duration,
      durationMs: `${duration}ms`,
    });

    // Track error event
    await analytics.trackError(
      (error as Error).name || 'Error',
      (error as Error).message || 'Unknown error',
      {
        requestId,
        traceId,
        spanId,
        method,
        path,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
      }
    );

    throw error;
  }
}

/**
 * Error handling middleware
 */
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  try {
    return await handler();
  } catch (error) {
    // Error already logged in withRequestLogging
    // Re-throw here; handled by errorResponse
    throw error;
  }
}

/**
 * Compose middleware
 */
export function withMiddleware<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  return withRequestLogging(request, () => withErrorHandling(handler));
}
