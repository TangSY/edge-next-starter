import { env, isDevelopment } from '@/lib/config/env';

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log level priority
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

const DEFAULT_LOG_FORMAT = env.LOG_FORMAT || (isDevelopment() ? 'pretty' : 'json');

/**
 * Log metadata interface
 */
export interface LogMetadata {
  [key: string]: unknown;
  requestId?: string;
  // Allow numeric types to record DB primary keys etc.
  userId?: string | number;
  duration?: number;
  statusCode?: number;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  traceId?: string;
  spanId?: string;
}

/**
 * Structured log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: LogMetadata;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Format timestamp
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check whether this log level should be recorded
 */
function shouldLog(level: LogLevel): boolean {
  const configLevel = env.LOG_LEVEL || LogLevel.INFO;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configLevel];
}

/**
 * Format log output
 */
function formatLogEntry(entry: LogEntry): string {
  const format = DEFAULT_LOG_FORMAT;

  if (format === 'pretty') {
    // Pretty output (development)
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const message = entry.message;

    let output = `${timestamp} ${level} ${context} ${message}`;

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `\n  📋 Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  ❌ Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }

  // JSON format (production)
  return JSON.stringify(entry);
}

/**
 * Enhanced logger class
 */
export class Logger {
  private context?: string;
  private defaultMetadata: LogMetadata;

  constructor(context?: string, defaultMetadata: LogMetadata = {}) {
    this.context = context;
    this.defaultMetadata = defaultMetadata;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level,
      message,
      context: this.context,
    };

    // Merge default metadata and incoming metadata
    const allMetadata = { ...this.defaultMetadata, ...metadata };
    if (Object.keys(allMetadata).length > 0) {
      entry.metadata = allMetadata;
    }

    // Attach error information
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Write log
   */
  private write(entry: LogEntry): void {
    const formatted = formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  /**
   * DEBUG level log
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    this.write(entry);
  }

  /**
   * INFO level log
   */
  info(message: string, metadata?: LogMetadata): void {
    if (!shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    this.write(entry);
  }

  /**
   * WARN level log
   */
  warn(message: string, error?: Error, metadata?: LogMetadata): void {
    if (!shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, metadata, error);
    this.write(entry);
  }

  /**
   * ERROR level log
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    if (!shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, error);
    this.write(entry);
  }

  /**
   * Create child logger (inherits parent context and metadata)
   */
  child(context: string, metadata?: LogMetadata): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    const childMetadata = { ...this.defaultMetadata, ...metadata };
    return new Logger(childContext, childMetadata);
  }

  /**
   * Add default metadata
   */
  withMetadata(metadata: LogMetadata): Logger {
    return new Logger(this.context, { ...this.defaultMetadata, ...metadata });
  }

  /**
   * Record performance metric
   */
  performance(operation: string, duration: number, metadata?: LogMetadata): void {
    const threshold = env.SLOW_QUERY_THRESHOLD_MS || 1000;
    const level = duration > threshold ? LogLevel.WARN : LogLevel.INFO;

    const performanceMetadata: LogMetadata = {
      ...metadata,
      operation,
      duration,
      durationMs: `${duration}ms`,
      slow: duration > threshold,
    };

    if (!shouldLog(level)) return;

    const message = `Performance: ${operation} completed in ${duration}ms`;
    const entry = this.createLogEntry(level, message, performanceMetadata);
    this.write(entry);
  }

  /**
   * Record HTTP request
   */
  http(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata
  ): void {
    const httpMetadata: LogMetadata = {
      ...metadata,
      method,
      path,
      statusCode,
      duration,
      durationMs: `${duration}ms`,
    };

    const level =
      statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    if (!shouldLog(level)) return;

    const message = `${method} ${path} ${statusCode} - ${duration}ms`;
    const entry = this.createLogEntry(level, message, httpMetadata);
    this.write(entry);
  }

  /**
   * Record database query
   */
  query(sql: string, duration: number, metadata?: LogMetadata): void {
    const threshold = env.SLOW_QUERY_THRESHOLD_MS || 1000;
    const level = duration > threshold ? LogLevel.WARN : LogLevel.DEBUG;

    const queryMetadata: LogMetadata = {
      ...metadata,
      sql: sql.substring(0, 200), // Truncate long SQL
      duration,
      durationMs: `${duration}ms`,
      slow: duration > threshold,
    };

    if (!shouldLog(level)) return;

    const message =
      duration > threshold ? `Slow query detected: ${duration}ms` : `Query executed: ${duration}ms`;

    const entry = this.createLogEntry(level, message, queryMetadata);
    this.write(entry);
  }
}

/**
 * Logger factory
 */
export class LoggerFactory {
  private static loggers: Map<string, Logger> = new Map();

  /**
   * Get or create logger
   */
  static getLogger(context: string, metadata?: LogMetadata): Logger {
    const key = `${context}:${JSON.stringify(metadata || {})}`;

    if (!this.loggers.has(key)) {
      this.loggers.set(key, new Logger(context, metadata));
    }

    return this.loggers.get(key)!;
  }

  /**
   * Clear all loggers (mainly for tests)
   */
  static clearAll(): void {
    this.loggers.clear();
  }
}

/**
 * Default logger
 */
export const logger = LoggerFactory.getLogger('app');

/**
 * Performance monitoring decorator factory
 */
export function measurePerformance(operationName?: string) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operation = operationName || `${String(target)}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      const methodLogger = LoggerFactory.getLogger('performance');

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        methodLogger.performance(operation, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        methodLogger.error(`${operation} failed after ${duration}ms`, error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}
