import { env } from '@/lib/config/env';
import { LoggerFactory } from '@/lib/logger';
import { getKVNamespace } from '@/lib/cache/client';
import { getCloudflareEnv } from '@/lib/db/client';

const logger = LoggerFactory.getLogger('analytics');

/**
 * Event type enumeration
 */
export enum AnalyticsEventType {
  // HTTP events
  HTTP_REQUEST = 'http.request',
  HTTP_ERROR = 'http.error',

  // Database events
  DATABASE_QUERY = 'database.query',
  DATABASE_SLOW_QUERY = 'database.slow_query',
  DATABASE_ERROR = 'database.error',

  // Cache events
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',
  CACHE_ERROR = 'cache.error',

  // Business events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  POST_CREATED = 'post.created',
  FILE_UPLOADED = 'file.uploaded',

  // Performance events
  PERFORMANCE_METRIC = 'performance.metric',
  SLOW_OPERATION = 'performance.slow_operation',

  // Error events
  ERROR_OCCURRED = 'error.occurred',
  RATE_LIMIT_EXCEEDED = 'rate_limit.exceeded',
}

/**
 * Analytics event data interface
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  data: Record<string, unknown>;
  metadata?: {
    requestId?: string;
    traceId?: string;
    // Allow numeric types for DB primary keys etc.
    userId?: string | number;
    ip?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}

/**
 * Analytics client class
 * Records and sends analytics events to Cloudflare Analytics Engine
 */
export class AnalyticsClient {
  private enabled: boolean;

  constructor() {
    this.enabled = env.ANALYTICS_ENABLED ?? true;
  }

  /**
   * Record event
   * Note: Cloudflare Analytics Engine is available via binding
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled) {
      logger.debug('Analytics disabled, skipping event', {
        eventType: event.type,
      });
      return;
    }

    try {
      // Write according to selected backend
      switch (env.ANALYTICS_SINK) {
        case 'log':
          // Log to structured logger
          logger.info('Analytics event tracked', {
            eventType: event.type,
            timestamp: event.timestamp,
            ...event.data,
            ...event.metadata,
          });
          break;
        case 'kv': {
          // Lightweight counting: per type + date (optional)
          const key = `analytics:count:${event.type}:${new Date(event.timestamp).toISOString().slice(0, 10)}`;
          try {
            const kv = getKvForAnalytics();
            if (kv) {
              const current = parseInt((await kv.get(key, 'text')) || '0', 10) || 0;
              await kv.put(key, String(current + 1), { expirationTtl: 7 * 24 * 3600 });
            } else {
              // Fallback to log when KV is unavailable
              logger.info('Analytics event tracked', {
                eventType: event.type,
                timestamp: event.timestamp,
                ...event.data,
                ...event.metadata,
              });
            }
          } catch (e) {
            logger.warn('KV analytics write failed', e as Error);
          }
          break;
        }
        case 'd1': {
          // Simplified DB sink: log instead (avoid migration dependency)
          // If persisting to DB is required, add tables in migrations and insert here
          logger.info('Analytics event (D1 stub)', {
            eventType: event.type,
            timestamp: event.timestamp,
            ...event.data,
            ...event.metadata,
          });
          // Example:
          // const prisma = createPrismaClient();
          // await prisma?.$executeRaw`INSERT INTO analytics_events(type, ts, data) VALUES(${event.type}, ${event.timestamp}, ${JSON.stringify(event)})`;
          break;
        }
        case 'engine': {
          const engine = getAnalyticsEngine();
          if (engine) {
            try {
              // Column conventions:
              // blobs:  [b0=type, b1=method, b2=path, b3=errorType, b4=operation]
              // doubles:[d0=timestamp, d1=duration_ms, d2=statusCode]
              // indexes:[i0=requestId, i1=traceId, i2=table, i3=userId]
              const dataAny = event.data as Record<string, unknown>;
              const blobs = [
                String(event.type || ''),
                String((dataAny.method as string) || ''),
                String((dataAny.path as string) || ''),
                String((dataAny.errorType as string) || ''),
                String((dataAny.operation as string) || ''),
              ];
              // Unified fields: timestamp and duration_ms always present; statusCode defaults to 0
              const durationMs = Number((dataAny.duration as number) ?? 0) || 0;
              const statusCode = Number((dataAny.statusCode as number) ?? 0) || 0;
              const doubles = [Number(event.timestamp || Date.now()), durationMs, statusCode];
              // Normalize optional fields to avoid issues when querying
              const requestId = String(event.metadata?.requestId || '');
              const traceId = String(event.metadata?.traceId || '');
              const table = String((dataAny.table as string) || '');
              const userId = String((event.metadata?.userId as string | number | undefined) ?? '');
              const indexes = [requestId, traceId, table, userId];

              await engine.writeDataPoint({ blobs, doubles, indexes });
            } catch (e) {
              // On write failure, fallback to log
              logger.warn('Analytics Engine write failed, falling back to log', e as Error);
              logger.info('Analytics event tracked', {
                eventType: event.type,
                timestamp: event.timestamp,
                ...event.data,
                ...event.metadata,
              });
            }
          } else {
            // Fallback to log when binding missing
            logger.info('Analytics event tracked', {
              eventType: event.type,
              timestamp: event.timestamp,
              ...event.data,
              ...event.metadata,
            });
          }
          break;
        }
        default:
          logger.info('Analytics event tracked', {
            eventType: event.type,
            timestamp: event.timestamp,
            ...event.data,
            ...event.metadata,
          });
      }

      // TODO: Integrate Cloudflare Analytics Engine
      // When Analytics Engine binding is configured, can use:
      // const analyticsEngine = getAnalyticsEngine();
      // if (analyticsEngine) {
      //   await analyticsEngine.writeDataPoint({
      //     blobs: [event.type],
      //     doubles: [event.timestamp],
      //     indexes: [event.metadata?.requestId || ''],
      //   });
      // }

      // Currently use console log as fallback
      if (env.ENABLE_PERFORMANCE_MONITORING) {
        this.logEventToConsole(event);
      }
    } catch (error) {
      logger.error('Failed to track analytics event', error as Error, {
        eventType: event.type,
      });
    }
  }

  /**
   * Track HTTP request event
   */
  async trackHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    await this.trackEvent({
      type: AnalyticsEventType.HTTP_REQUEST,
      timestamp: Date.now(),
      data: {
        method,
        path,
        statusCode,
        duration,
        success: statusCode < 400,
      },
      metadata,
    });
  }

  /**
   * Track database query event
   */
  async trackDatabaseQuery(
    operation: string,
    table: string,
    duration: number,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    const threshold = env.SLOW_QUERY_THRESHOLD_MS || 1000;
    const isSlow = duration > threshold;

    await this.trackEvent({
      type: isSlow ? AnalyticsEventType.DATABASE_SLOW_QUERY : AnalyticsEventType.DATABASE_QUERY,
      timestamp: Date.now(),
      data: {
        operation,
        table,
        duration,
        slow: isSlow,
      },
      metadata,
    });
  }

  /**
   * Track cache hit/miss event
   */
  async trackCacheAccess(
    key: string,
    hit: boolean,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    await this.trackEvent({
      type: hit ? AnalyticsEventType.CACHE_HIT : AnalyticsEventType.CACHE_MISS,
      timestamp: Date.now(),
      data: {
        key,
        hit,
      },
      metadata,
    });
  }

  /**
   * Track error event
   */
  async trackError(
    errorType: string,
    errorMessage: string,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    await this.trackEvent({
      type: AnalyticsEventType.ERROR_OCCURRED,
      timestamp: Date.now(),
      data: {
        errorType,
        errorMessage,
      },
      metadata,
    });
  }

  /**
   * Track performance metric
   */
  async trackPerformance(
    operation: string,
    duration: number,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    const threshold = env.SLOW_QUERY_THRESHOLD_MS || 1000;
    const isSlow = duration > threshold;

    await this.trackEvent({
      type: isSlow ? AnalyticsEventType.SLOW_OPERATION : AnalyticsEventType.PERFORMANCE_METRIC,
      timestamp: Date.now(),
      data: {
        operation,
        duration,
        slow: isSlow,
      },
      metadata,
    });
  }

  /**
   * Track business event
   */
  async trackBusinessEvent(
    type: AnalyticsEventType,
    data: Record<string, unknown>,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    await this.trackEvent({
      type,
      timestamp: Date.now(),
      data,
      metadata,
    });
  }

  /**
   * Track rate limit event
   */
  async trackRateLimitExceeded(
    clientId: string,
    path: string,
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    await this.trackEvent({
      type: AnalyticsEventType.RATE_LIMIT_EXCEEDED,
      timestamp: Date.now(),
      data: {
        clientId,
        path,
      },
      metadata,
    });
  }

  /**
   * Log event to console (dev/debug)
   */
  private logEventToConsole(event: AnalyticsEvent): void {
    const formatted = {
      '📊 Analytics Event': event.type,
      timestamp: new Date(event.timestamp).toISOString(),
      ...event.data,
      ...(event.metadata && { metadata: event.metadata }),
    };

    console.log(JSON.stringify(formatted, null, 2));
  }
}

/**
 * Global Analytics client instance
 */
export const analytics = new AnalyticsClient();

/**
 * Get Analytics Engine binding (if configured)
 */
export function getAnalyticsEngine(): AnalyticsEngineDataset | null {
  const env = getCloudflareEnv();
  return (env?.ANALYTICS as unknown as AnalyticsEngineDataset) || null;
}

/**
 * Performance monitoring decorator (with Analytics tracking)
 */
// Method decorator: automatically record performance and errors
export function trackPerformanceDecorator(eventType?: AnalyticsEventType) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operation = `${String(target)}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        // Track performance; if eventType specified, also record business event
        await analytics.trackPerformance(operation, duration);
        if (eventType) {
          await analytics.trackBusinessEvent(eventType, { operation, duration });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Track error with operation name and duration metadata
        await analytics.trackError(
          (error as Error).name || 'Error',
          (error as Error).message || 'Unknown error',
          { operation, duration }
        );

        throw error;
      }
    };

    return descriptor;
  };
}
function getKvForAnalytics(): KVNamespace | null {
  // Reuse existing KV binding (simple case)
  return getKVNamespace();
}
