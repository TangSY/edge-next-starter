import { describe, it, expect, vi } from 'vitest';
import { createR2Client, R2Client } from '@/lib/r2/client';

describe('R2 Client', () => {
  describe('createR2Client', () => {
    it('should return null when R2 is not available', () => {
      const client = createR2Client();
      expect(client).toBeNull();
    });
  });

  describe('R2Client', () => {
    it('should create instance with bucket', () => {
      const mockBucket = {} as any;
      const client = new R2Client(mockBucket);
      expect(client).toBeInstanceOf(R2Client);
      expect(client.raw).toBe(mockBucket);
    });

    it('should put objects', async () => {
      const mockObject = { key: 'test.txt', size: 100 };
      const mockBucket = {
        put: vi.fn().mockResolvedValue(mockObject),
      } as any;

      const client = new R2Client(mockBucket);
      const result = await client.put('test.txt', 'content');

      expect(mockBucket.put).toHaveBeenCalledWith('test.txt', 'content', undefined);
      expect(result).toEqual(mockObject);
    });

    it('should get objects', async () => {
      const mockObject = {
        key: 'test.txt',
        body: 'content',
        blob: vi.fn().mockResolvedValue(new Blob(['content'])),
      };
      const mockBucket = {
        get: vi.fn().mockResolvedValue(mockObject),
      } as any;

      const client = new R2Client(mockBucket);
      const result = await client.get('test.txt');

      expect(mockBucket.get).toHaveBeenCalledWith('test.txt');
      expect(result).toEqual(mockObject);
    });

    it('should delete objects', async () => {
      const mockBucket = {
        delete: vi.fn().mockResolvedValue(undefined),
      } as any;

      const client = new R2Client(mockBucket);
      await client.delete('test.txt');

      expect(mockBucket.delete).toHaveBeenCalledWith('test.txt');
    });

    it('should list objects', async () => {
      const mockList = { objects: [{ key: 'file1.txt' }, { key: 'file2.txt' }] };
      const mockBucket = {
        list: vi.fn().mockResolvedValue(mockList),
      } as any;

      const client = new R2Client(mockBucket);
      const result = await client.list({ prefix: 'uploads/' });

      expect(mockBucket.list).toHaveBeenCalledWith({ prefix: 'uploads/' });
      expect(result).toEqual(mockList);
    });

    it('should handle errors gracefully', async () => {
      const mockBucket = {
        get: vi.fn().mockRejectedValue(new Error('Not found')),
      } as any;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const client = new R2Client(mockBucket);
      const result = await client.get('missing.txt');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
