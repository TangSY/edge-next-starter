import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCloudflareEnv,
  createDatabaseClient,
  DatabaseClient,
  resetPrismaClient,
} from '@/lib/db/client';

describe('Database Client', () => {
  describe('getCloudflareEnv', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      resetPrismaClient();
    });

    it('should return null when DB is not available', () => {
      const env = getCloudflareEnv();
      expect(env).toBeNull();
    });

    it('should warn when running in local mode', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      getCloudflareEnv();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cloudflare bindings not available. Running in local mode?'
      );
    });
  });

  describe('createDatabaseClient', () => {
    it('should return null when database is not available', () => {
      const client = createDatabaseClient();
      expect(client).toBeNull();
    });
  });

  describe('DatabaseClient', () => {
    it('should create instance with database', () => {
      const mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      } as any;

      const client = new DatabaseClient(mockDB);
      expect(client).toBeInstanceOf(DatabaseClient);
      expect(client.raw).toBe(mockDB);
    });

    it('should query all results', async () => {
      const mockResults = [{ id: 1, name: 'Test' }];
      const mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: mockResults }),
      } as any;

      const client = new DatabaseClient(mockDB);
      const results = await client.query('SELECT * FROM users');

      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM users');
      expect(results).toEqual(mockResults);
    });

    it('should query single result', async () => {
      const mockResult = { id: 1, name: 'Test' };
      const mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockResult),
      } as any;

      const client = new DatabaseClient(mockDB);
      const result = await client.queryOne('SELECT * FROM users WHERE id = ?', [1]);

      expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
      expect(result).toEqual(mockResult);
    });

    it('should execute statements', async () => {
      const mockResult = { success: true, meta: { last_row_id: 1 } };
      const mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(mockResult),
      } as any;

      const client = new DatabaseClient(mockDB);
      const result = await client.execute('INSERT INTO users (name) VALUES (?)', ['Test']);

      expect(mockDB.prepare).toHaveBeenCalledWith('INSERT INTO users (name) VALUES (?)');
      expect(result).toEqual(mockResult);
    });

    it('should execute batch operations', async () => {
      const mockResults = [{ success: true }, { success: true }];
      const mockDB = {
        prepare: vi.fn().mockReturnThis(),
        bind: vi.fn().mockReturnThis(),
        batch: vi.fn().mockResolvedValue(mockResults),
      } as any;

      const client = new DatabaseClient(mockDB);
      const statements = [
        { sql: 'INSERT INTO users (name) VALUES (?)', params: ['User 1'] },
        { sql: 'INSERT INTO users (name) VALUES (?)', params: ['User 2'] },
      ];
      const results = await client.batch(statements);

      expect(mockDB.batch).toHaveBeenCalled();
      expect(results).toEqual(mockResults);
    });
  });
});
