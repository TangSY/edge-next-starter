import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '@/repositories/user.repository';
import { PrismaClient } from '@prisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPrisma: any;

  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    repository = new UserRepository(mockPrisma as unknown as PrismaClient);
  });

  describe('findAll', () => {
    it('should return all users in descending order by default', async () => {
      const mockUsers = [
        { id: 2, email: 'user2@test.com', name: 'User 2', createdAt: new Date() },
        { id: 1, email: 'user1@test.com', name: 'User 1', createdAt: new Date() },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return users in ascending order when specified', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', name: 'User 1', createdAt: new Date() },
        { id: 2, email: 'user2@test.com', name: 'User 2', createdAt: new Date() },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAll('asc');

      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should throw DatabaseQueryError on database error', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection lost'));

      await expect(repository.findAll()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 1, email: 'user@test.com', name: 'Test User', createdAt: new Date() };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should throw DatabaseQueryError on database error', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(repository.findById(1)).rejects.toThrow('Failed to fetch user with id 1');
    });
  });

  describe('findByIdWithPosts', () => {
    it('should return user with posts', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        posts: [
          { id: 1, title: 'Post 1', content: 'Content 1' },
          { id: 2, title: 'Post 2', content: 'Content 2' },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByIdWithPosts(1, 10);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    });

    it('should limit posts count', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        posts: [{ id: 1, title: 'Post 1' }],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await repository.findByIdWithPosts(1, 5);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: 1, email: 'user@test.com', name: 'Test User' };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('user@test.com');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createData = { email: 'new@test.com', name: 'New User' };
      const mockUser = { id: 1, ...createData, createdAt: new Date() };

      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await repository.create(createData);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should throw DatabaseQueryError on create error', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(repository.create({ email: 'test@test.com' })).rejects.toThrow(
        'Failed to create user'
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { email: 'updated@test.com', name: 'Updated Name' };
      const mockUser = { id: 1, ...updateData, createdAt: new Date() };

      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await repository.update(1, updateData);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw DatabaseQueryError on update error', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('Record not found'));

      await expect(repository.update(999, { name: 'Test' })).rejects.toThrow(
        'Failed to update user with id 999'
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const mockUser = { id: 1, email: 'user@test.com', name: 'Test User' };

      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const result = await repository.delete(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw DatabaseQueryError on delete error', async () => {
      mockPrisma.user.delete.mockRejectedValue(new Error('Record not found'));

      await expect(repository.delete(999)).rejects.toThrow('Failed to delete user with id 999');
    });
  });

  describe('existsByEmail', () => {
    it('should return true if user exists', async () => {
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repository.existsByEmail('existing@test.com');

      expect(result).toBe(true);
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: { email: 'existing@test.com' },
      });
    });

    it('should return false if user does not exist', async () => {
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await repository.existsByEmail('nonexistent@test.com');

      expect(result).toBe(false);
    });

    it('should throw DatabaseQueryError on count error', async () => {
      mockPrisma.user.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.existsByEmail('test@test.com')).rejects.toThrow(
        'Failed to check email existence'
      );
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false if user does not exist', async () => {
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });

    it('should throw DatabaseQueryError on count error', async () => {
      mockPrisma.user.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.exists(1)).rejects.toThrow('Failed to check user existence');
    });
  });
});
