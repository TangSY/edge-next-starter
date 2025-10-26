/**
 * Cloudflare Workers environment type definitions
 * Contains only types for Cloudflare bindings and environment variables
 */

/**
 * Cloudflare bindings interface
 * Defines all bindings configured in wrangler.toml
 */
export interface CloudflareEnv {
  // D1 database binding
  DB: D1Database;

  // R2 object storage binding (Note: binding is named BUCKET in wrangler.toml)
  BUCKET: R2Bucket;

  // KV key-value storage binding
  KV: KVNamespace;

  // Analytics Engine dataset binding (optional)
  ANALYTICS?: AnalyticsEngineDataset;

  // Environment identifier
  ENVIRONMENT?: 'local' | 'test' | 'production';

  // API key (optional)
  API_SECRET?: string;

  // CORS allowed origins (optional)
  ALLOWED_ORIGINS?: string;

  // Log level (optional)
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';

  // Rate limit configuration (optional)
  RATE_LIMIT_ENABLED?: string; // 'true' | 'false'
  RATE_LIMIT_MAX_REQUESTS?: string; // Numeric string
  RATE_LIMIT_WINDOW_SECONDS?: string; // Numeric string
}

/**
 * Extend NodeJS.ProcessEnv to include Cloudflare environment
 * Enables type hints in code
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Partial<CloudflareEnv> {
      // Node.js environment
      NODE_ENV: 'development' | 'production' | 'test';

      // Next.js Runtime
      NEXT_RUNTIME?: 'edge' | 'nodejs';

      // Database connection string (for Prisma)
      DATABASE_URL?: string;

      // Cloudflare deployment related
      CLOUDFLARE_ACCOUNT_ID?: string;
      CLOUDFLARE_API_TOKEN?: string;
    }
  }

  /**
   * Edge Runtime global flag
   * Used to detect if running in Edge Runtime
   */
  const EdgeRuntime: string | undefined;

  /**
   * Deno global flag
   * Used to detect if running in Deno environment
   */
  const Deno: any | undefined;
}

export {};
