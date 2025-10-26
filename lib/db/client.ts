import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { CloudflareEnv } from '@/types/cloudflare';

/**
 * Global Prisma client instance cache
 * In Edge Runtime, each isolate has its own global scope
 */
let prismaClient: PrismaClient | null = null;

/**
 * Get Cloudflare environment bindings
 * Access via process.env in Edge Runtime
 */
export function getCloudflareEnv(): CloudflareEnv | null {
  // In Cloudflare Workers, bindings are exposed via process.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = process.env as any as CloudflareEnv;

  // Check whether running in Cloudflare environment
  if (!env || typeof env.DB === 'undefined') {
    console.warn('Cloudflare bindings not available. Running in local mode?');
    return null;
  }

  return env;
}

/**
 * Get D1 database instance
 */
export function getDatabase(): D1Database | null {
  const env = getCloudflareEnv();
  return env?.DB || null;
}

/**
 * Create or reuse Prisma client instance (singleton)
 * Connect to Cloudflare D1 using D1 adapter
 *
 * Important:
 * - In Edge Runtime, each isolate has its own global scope
 * - This function reuses the PrismaClient instance within the same isolate
 * - Avoid creating new client per request for performance
 */
export function createPrismaClient(): PrismaClient | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }

  // If instance exists, return it (reuse)
  if (prismaClient) {
    return prismaClient;
  }

  // Create new instance and cache it
  const adapter = new PrismaD1(db);
  prismaClient = new PrismaClient({
    adapter,
    // In Edge Runtime, no pool configuration needed
    // D1 adapter manages connections automatically
  });

  return prismaClient;
}

/**
 * Reset Prisma client (mainly for tests)
 * ⚠️ Should not be called in production
 */
export function resetPrismaClient(): void {
  if (prismaClient) {
    prismaClient.$disconnect();
    prismaClient = null;
  }
}

/**
 * Database query helper (kept for backward compatibility)
 * @deprecated Use createPrismaClient() to get Prisma client
 */
export class DatabaseClient {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute query and return all results
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.db
      .prepare(sql)
      .bind(...(params || []))
      .all();
    return (result.results as T[]) || [];
  }

  /**
   * Execute query and return first result
   */
  async queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.db
      .prepare(sql)
      .bind(...(params || []))
      .first();
    return (result as T) || null;
  }

  /**
   * Execute insert/update/delete operations
   */
  async execute(sql: string, params?: unknown[]): Promise<D1Result> {
    return await this.db
      .prepare(sql)
      .bind(...(params || []))
      .run();
  }

  /**
   * Execute batch operations
   */
  async batch(statements: { sql: string; params?: unknown[] }[]): Promise<D1Result[]> {
    const prepared = statements.map(({ sql, params }) =>
      this.db.prepare(sql).bind(...(params || []))
    );
    return await this.db.batch(prepared);
  }

  /**
   * Get raw database instance
   */
  get raw(): D1Database {
    return this.db;
  }
}

/**
 * Create database client instance (kept for backward compatibility)
 * @deprecated Use createPrismaClient() to get Prisma client
 */
export function createDatabaseClient(): DatabaseClient | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }
  return new DatabaseClient(db);
}
