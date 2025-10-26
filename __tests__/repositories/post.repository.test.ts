import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostRepository } from '@/repositories/post.repository';
import { PrismaClient } from '@prisma/client';

describe('PostRepository', () => {
  let repository: PostRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      post: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    repository = new PostRepository(mockPrisma as unknown as PrismaClient);
  });

  describe('findAll', () => {
    it('should return all posts with default options', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true },
        { id: 2, title: 'Post 2', content: 'Content 2', published: false },
      ];

      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      const result = await repository.findAll();

      expect(result).toEqual(mockPosts);
      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should filter by userId', async () => {
      const mockPosts = [{ id: 1, userId: 1, title: 'Post 1' }];

      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      await repository.findAll({ userId: 1 });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should filter by published status', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1', published: true }];

      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      await repository.findAll({ published: true });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: { published: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should apply skip and take for pagination', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1' }];

      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      await repository.findAll({ skip: 10, take: 5 });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 5,
      });
    });

    it('should combine all filters', async () => {
      await repository.findAll({
        userId: 1,
        published: true,
        skip: 0,
        take: 10,
      });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith({
        where: { userId: 1, published: true },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('count', () => {
    it('should count all posts', async () => {
      mockPrisma.post.count.mockResolvedValue(42);

      const result = await repository.count();

      expect(result).toBe(42);
      expect(mockPrisma.post.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should count posts by userId', async () => {
      mockPrisma.post.count.mockResolvedValue(10);

      const result = await repository.count({ userId: 1 });

      expect(result).toBe(10);
      expect(mockPrisma.post.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should count published posts', async () => {
      mockPrisma.post.count.mockResolvedValue(5);

      const result = await repository.count({ published: true });

      expect(result).toBe(5);
      expect(mockPrisma.post.count).toHaveBeenCalledWith({
        where: { published: true },
      });
    });

    it('should throw DatabaseQueryError on count error', async () => {
      mockPrisma.post.count.mockRejectedValue(new Error('Database error'));

      await expect(repository.count()).rejects.toThrow('Failed to count posts');
    });
  });

  describe('findById', () => {
    it('should return post by id with user info', async () => {
      const mockPost = {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
        user: { id: 1, name: 'User 1', email: 'user@test.com' },
      };

      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await repository.findById(1);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return null if post not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create post successfully', async () => {
      const createData = {
        userId: 1,
        title: 'New Post',
        content: 'Post content',
        published: false,
      };
      const mockPost = { id: 1, ...createData, createdAt: new Date() };

      mockPrisma.post.create.mockResolvedValue(mockPost);

      const result = await repository.create(createData);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw DatabaseQueryError on create error', async () => {
      mockPrisma.post.create.mockRejectedValue(new Error('Foreign key constraint failed'));

      await expect(
        repository.create({
          userId: 999,
          title: 'Test',
          content: null,
          published: false,
        })
      ).rejects.toThrow('Failed to create post');
    });
  });

  describe('update', () => {
    it('should update post successfully', async () => {
      const updateData = { title: 'Updated Title', published: true };
      const mockPost = { id: 1, ...updateData, content: 'Content', userId: 1 };

      mockPrisma.post.update.mockResolvedValue(mockPost);

      const result = await repository.update(1, updateData);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete post successfully', async () => {
      const mockPost = { id: 1, title: 'Post 1', content: 'Content' };

      mockPrisma.post.delete.mockResolvedValue(mockPost);

      const result = await repository.delete(1);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw DatabaseQueryError on delete error', async () => {
      mockPrisma.post.delete.mockRejectedValue(new Error('Record not found'));

      await expect(repository.delete(999)).rejects.toThrow('Failed to delete post with id 999');
    });
  });

  describe('exists', () => {
    it('should return true if post exists', async () => {
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await repository.exists(1);

      expect(result).toBe(true);
      expect(mockPrisma.post.count).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false if post does not exist', async () => {
      mockPrisma.post.count.mockResolvedValue(0);

      const result = await repository.exists(999);

      expect(result).toBe(false);
    });
  });

  describe('publish', () => {
    it('should publish post successfully', async () => {
      const mockPost = { id: 1, title: 'Post 1', published: true };

      mockPrisma.post.update.mockResolvedValue(mockPost);

      const result = await repository.publish(1);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { published: true },
      });
    });

    it('should throw DatabaseQueryError on publish error', async () => {
      mockPrisma.post.update.mockRejectedValue(new Error('Record not found'));

      await expect(repository.publish(999)).rejects.toThrow('Failed to publish post with id 999');
    });
  });

  describe('unpublish', () => {
    it('should unpublish post successfully', async () => {
      const mockPost = { id: 1, title: 'Post 1', published: false };

      mockPrisma.post.update.mockResolvedValue(mockPost);

      const result = await repository.unpublish(1);

      expect(result).toEqual(mockPost);
      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { published: false },
      });
    });

    it('should throw DatabaseQueryError on unpublish error', async () => {
      mockPrisma.post.update.mockRejectedValue(new Error('Record not found'));

      await expect(repository.unpublish(999)).rejects.toThrow(
        'Failed to unpublish post with id 999'
      );
    });
  });
});
