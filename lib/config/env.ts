import { z } from 'zod';

/**
 * Environment variable schema definition
 * Use zod to validate environment variables with type safety
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Rate limit configuration
  RATE_LIMIT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().min(1).max(10000).default(100),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().min(1).max(3600).default(60),

  // Cloudflare Analytics configuration
  ANALYTICS_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  // Analytics backend selection: log|kv|d1|engine
  ANALYTICS_SINK: z.enum(['log', 'kv', 'd1', 'engine']).default('log'),

  // Logging configuration
  LOG_LEVEL: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  LOG_INCLUDE_TIMESTAMP: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),

  // Database configuration
  DATABASE_QUERY_TIMEOUT: z.coerce.number().min(1000).max(30000).default(5000),

  // Cache configuration
  CACHE_DEFAULT_TTL: z.coerce.number().min(1).max(86400).default(3600),

  // Monitoring configuration
  ENABLE_PERFORMANCE_MONITORING: z
    .enum(['true', 'false'])
    .default('true')
    .transform(val => val === 'true'),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().min(100).max(10000).default(1000),
});

/**
 * Optional environment variable schema (needed only in specific environments)
 */
const optionalEnvSchema = z.object({
  // Cloudflare configuration (required only in deployment)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // External services configuration
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Merge required and optional configuration
 */
const fullEnvSchema = envSchema.merge(optionalEnvSchema);

/**
 * Environment variable types
 */
export type Env = z.infer<typeof envSchema>;
export type FullEnv = z.infer<typeof fullEnvSchema>;

/**
 * Validate environment variables
 * @throws {ZodError} when env vars do not match the schema
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      console.error('-----------------------------------');

      error.issues.forEach(err => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });

      console.error('-----------------------------------');
      console.error(
        'Please check environment variable configuration in .env.local or wrangler.toml'
      );

      throw new Error('Environment variable validation failed. Please check configuration');
    }
    throw error;
  }
}

/**
 * Validate full environment (including optional values)
 */
function validateFullEnv(): FullEnv {
  try {
    return fullEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.issues.forEach(err => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw error;
  }
}

/**
 * Export validated environment variables
 * Automatically validated on app startup
 */
export const env = validateEnv();

/**
 * Get full environment variables (including optional values)
 */
export function getFullEnv(): FullEnv {
  return validateFullEnv();
}

/**
 * Check if production environment
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Check if development environment
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Check if test environment
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

/**
 * Get environment variable value (with type hints)
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return env[key];
}

/**
 * Print environment variable configuration (for debugging)
 */
export function printEnvConfig(): void {
  console.log('📋 Environment variable configuration:');
  console.log('-----------------------------------');
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Rate limiting: ${env.RATE_LIMIT_ENABLED ? 'Enabled' : 'Disabled'}`);
  if (env.RATE_LIMIT_ENABLED) {
    console.log(`    - Max requests: ${env.RATE_LIMIT_MAX_REQUESTS}`);
    console.log(`    - Time window: ${env.RATE_LIMIT_WINDOW_SECONDS} seconds`);
  }
  console.log(`  Log level: ${env.LOG_LEVEL}`);
  console.log(`  Log format: ${env.LOG_FORMAT}`);
  console.log(`  Analytics: ${env.ANALYTICS_ENABLED ? 'Enabled' : 'Disabled'}`);
  console.log(
    `  Performance monitoring: ${env.ENABLE_PERFORMANCE_MONITORING ? 'Enabled' : 'Disabled'}`
  );
  console.log('-----------------------------------');
}
