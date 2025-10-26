import { getCloudflareEnv } from '@/lib/db/client';
import { analytics } from '@/lib/analytics';

/**
 * Get KV namespace instance
 */
export function getKVNamespace(): KVNamespace | null {
  const env = getCloudflareEnv();
  return env?.KV || null;
}

/**
 * KV cache client
 */
export class CacheClient {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Set cache
   */
  async set(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: KVNamespacePutOptions
  ): Promise<void> {
    try {
      await this.kv.put(key, value, options);
    } catch (error) {
      console.error('KV set error:', error);
    }
  }

  /**
   * Set cache (alias, KV API compatible)
   */
  async put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: KVNamespacePutOptions
  ): Promise<void> {
    return this.set(key, value, options);
  }

  /**
   * Get cache
   */
  async get(key: string, type?: 'text'): Promise<string | null>;
  async get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  async get(key: string, type: 'stream'): Promise<ReadableStream | null>;
  async get(
    key: string,
    type: 'text' | 'arrayBuffer' | 'stream' = 'text'
  ): Promise<string | ArrayBuffer | ReadableStream | null> {
    try {
      // Use string overloads to match tests and KV type signatures
      if (type === 'arrayBuffer') {
        return await this.kv.get(key, 'arrayBuffer');
      }
      if (type === 'stream') {
        return await this.kv.get(key, 'stream');
      }
      return await this.kv.get(key, 'text');
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  /**
   * Delete cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('KV delete error:', error);
    }
  }

  /**
   * List all keys
   */
  async list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<unknown>> {
    return await this.kv.list(options);
  }

  /**
   * Get raw KV instance
   */
  get raw(): KVNamespace {
    return this.kv;
  }
}

/**
 * Create cache client instance
 */
export function createCacheClient(): CacheClient | null {
  const kv = getKVNamespace();
  if (!kv) {
    return null;
  }
  return new CacheClient(kv);
}

/**
 * Cache wrapper - functional caching pattern
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600 // Default: 1 hour
): Promise<T> {
  const cache = createCacheClient();

  // If no cache client, execute function directly
  if (!cache) {
    return await fn();
  }

  // Try to get from cache
  const cached = await cache.get(key);
  if (cached) {
    try {
      await analytics.trackCacheAccess(key, true);
      return JSON.parse(cached) as T;
    } catch {
      // If parsing fails, delete cache and re-fetch
      await cache.delete(key);
    }
  }

  // Execute function and cache the result
  const result = await fn();
  await cache.set(key, JSON.stringify(result), {
    expirationTtl: ttl,
  });

  await analytics.trackCacheAccess(key, false);

  return result;
}
