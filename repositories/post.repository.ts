import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';

/**
 * Post Repository
 * Responsible only for database operations; no business logic
 */
export class PostRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Query all posts (supports filters and pagination)
   */
  async findAll(options?: { userId?: number; published?: boolean; skip?: number; take?: number }) {
    try {
      const where: {
        userId?: number;
        published?: boolean;
      } = {};

      if (options?.userId !== undefined) {
        where.userId = options.userId;
      }

      if (options?.published !== undefined) {
        where.published = options.published;
      }

      const start = Date.now();
      const posts = await this.prisma.post.findMany({
        where,
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
        skip: options?.skip,
        take: options?.take,
      });
      await analytics.trackDatabaseQuery('post.findAll', 'posts', Date.now() - start, where);
      return posts;
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch posts', error);
    }
  }

  /**
   * Count posts (supports filters)
   */
  async count(options?: { userId?: number; published?: boolean }) {
    try {
      const where: {
        userId?: number;
        published?: boolean;
      } = {};

      if (options?.userId !== undefined) {
        where.userId = options.userId;
      }

      if (options?.published !== undefined) {
        where.published = options.published;
      }

      const start = Date.now();
      const total = await this.prisma.post.count({ where });
      await analytics.trackDatabaseQuery('post.count', 'posts', Date.now() - start, where);
      return total;
    } catch (error) {
      throw new DatabaseQueryError('Failed to count posts', error);
    }
  }

  /**
   * Find post by ID
   */
  async findById(id: number) {
    try {
      const start = Date.now();
      const post = await this.prisma.post.findUnique({
        where: { id },
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
      await analytics.trackDatabaseQuery('post.findById', 'posts', Date.now() - start, { id });
      return post;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch post with id ${id}`, error);
    }
  }

  /**
   * Find posts by user ID
   */
  async findByUserId(userId: number, options?: { published?: boolean; limit?: number }) {
    try {
      const where: { userId: number; published?: boolean } = { userId };

      if (options?.published !== undefined) {
        where.published = options.published;
      }

      const start = Date.now();
      const posts = await this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
      });
      await analytics.trackDatabaseQuery('post.findByUserId', 'posts', Date.now() - start, where);
      return posts;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch posts for user ${userId}`, error);
    }
  }

  /**
   * Create post
   */
  async create(data: {
    userId: number;
    title: string;
    content?: string | null;
    published?: boolean;
  }) {
    try {
      const start = Date.now();
      const post = await this.prisma.post.create({
        data: {
          userId: data.userId,
          title: data.title,
          content: data.content || null,
          published: data.published ?? false,
        },
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
      await analytics.trackDatabaseQuery('post.create', 'posts', Date.now() - start, {
        userId: data.userId,
      });
      return post;
    } catch (error) {
      throw new DatabaseError('Failed to create post', error);
    }
  }

  /**
   * Update post
   */
  async update(
    id: number,
    data: {
      title?: string;
      content?: string | null;
      published?: boolean;
    }
  ) {
    try {
      const start = Date.now();
      const post = await this.prisma.post.update({
        where: { id },
        data,
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
      await analytics.trackDatabaseQuery('post.update', 'posts', Date.now() - start, { id });
      return post;
    } catch (error) {
      throw new DatabaseError(`Failed to update post with id ${id}`, error);
    }
  }

  /**
   * Delete post
   */
  async delete(id: number) {
    try {
      const start = Date.now();
      const deleted = await this.prisma.post.delete({
        where: { id },
      });
      await analytics.trackDatabaseQuery('post.delete', 'posts', Date.now() - start, { id });
      return deleted;
    } catch (error) {
      throw new DatabaseError(`Failed to delete post with id ${id}`, error);
    }
  }

  /**
   * Check if post exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.post.count({
        where: { id },
      });
      await analytics.trackDatabaseQuery('post.exists', 'posts', Date.now() - start, { id });
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to check post existence: ${id}`, error);
    }
  }

  /**
   * Publish post
   */
  async publish(id: number) {
    try {
      const start = Date.now();
      const post = await this.prisma.post.update({
        where: { id },
        data: { published: true },
      });
      await analytics.trackDatabaseQuery('post.publish', 'posts', Date.now() - start, { id });
      return post;
    } catch (error) {
      throw new DatabaseError(`Failed to publish post with id ${id}`, error);
    }
  }

  /**
   * Unpublish post
   */
  async unpublish(id: number) {
    try {
      const start = Date.now();
      const post = await this.prisma.post.update({
        where: { id },
        data: { published: false },
      });
      await analytics.trackDatabaseQuery('post.unpublish', 'posts', Date.now() - start, { id });
      return post;
    } catch (error) {
      throw new DatabaseError(`Failed to unpublish post with id ${id}`, error);
    }
  }
}
