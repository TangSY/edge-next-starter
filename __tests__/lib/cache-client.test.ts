import { describe, it, expect, vi } from 'vitest';
import { createCacheClient, CacheClient, withCache } from '@/lib/cache/client';

describe('Cache Client', () => {
  describe('createCacheClient', () => {
    it('should return null when KV is not available', () => {
      const client = createCacheClient();
      expect(client).toBeNull();
    });
  });

  describe('CacheClient', () => {
    it('should create instance with KV namespace', () => {
      const mockKV = {} as any;
      const client = new CacheClient(mockKV);
      expect(client).toBeInstanceOf(CacheClient);
      expect(client.raw).toBe(mockKV);
    });

    it('should set cache values', async () => {
      const mockKV = {
        put: vi.fn().mockResolvedValue(undefined),
      } as any;

      const client = new CacheClient(mockKV);
      await client.set('key', 'value', { expirationTtl: 3600 });

      expect(mockKV.put).toHaveBeenCalledWith('key', 'value', { expirationTtl: 3600 });
    });

    it('should get cache values', async () => {
      const mockKV = {
        get: vi.fn().mockResolvedValue('cached-value'),
      } as any;

      const client = new CacheClient(mockKV);
      const result = await client.get('key');

      expect(mockKV.get).toHaveBeenCalledWith('key', 'text');
      expect(result).toBe('cached-value');
    });

    it('should delete cache values', async () => {
      const mockKV = {
        delete: vi.fn().mockResolvedValue(undefined),
      } as any;

      const client = new CacheClient(mockKV);
      await client.delete('key');

      expect(mockKV.delete).toHaveBeenCalledWith('key');
    });

    it('should handle errors gracefully', async () => {
      const mockKV = {
        get: vi.fn().mockRejectedValue(new Error('KV error')),
      } as any;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const client = new CacheClient(mockKV);
      const result = await client.get('key');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('withCache', () => {
    it('should execute function and cache result when cache is not available', async () => {
      const fn = vi.fn().mockResolvedValue({ data: 'test' });
      const result = await withCache('test-key', fn, 60);

      expect(fn).toHaveBeenCalled();
      expect(result).toEqual({ data: 'test' });
    });
  });
});
