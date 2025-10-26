import { PrismaClient } from '@prisma/client';
import { DatabaseError, DatabaseQueryError } from '@/lib/errors';
import { analytics } from '@/lib/analytics';

/**
 * User Repository
 * Responsible only for database operations; no business logic
 */
export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Query all users
   */
  async findAll(orderBy: 'asc' | 'desc' = 'desc') {
    try {
      const start = Date.now();
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: orderBy },
      });
      await analytics.trackDatabaseQuery('user.findAll', 'users', Date.now() - start);
      return users;
    } catch (error) {
      throw new DatabaseQueryError('Failed to fetch users', error);
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: number) {
    try {
      const start = Date.now();
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      await analytics.trackDatabaseQuery('user.findById', 'users', Date.now() - start, { id });
      return user;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch user with id ${id}`, error);
    }
  }

  /**
   * Find user by ID (including related posts)
   */
  async findByIdWithPosts(id: number, limit = 10) {
    try {
      const start = Date.now();
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            take: limit,
          },
        },
      });
      await analytics.trackDatabaseQuery('user.findByIdWithPosts', 'users', Date.now() - start, {
        id,
        limit,
      });
      return user;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch user with posts for id ${id}`, error);
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    try {
      const start = Date.now();
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      await analytics.trackDatabaseQuery('user.findByEmail', 'users', Date.now() - start, {
        email,
      });
      return user;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to fetch user with email ${email}`, error);
    }
  }

  /**
   * Create user
   */
  async create(data: { email: string; name?: string | null }) {
    try {
      const start = Date.now();
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name || null,
        },
      });
      await analytics.trackDatabaseQuery('user.create', 'users', Date.now() - start);
      return user;
    } catch (error) {
      throw new DatabaseError('Failed to create user', error);
    }
  }

  /**
   * Update user
   */
  async update(id: number, data: { email?: string; name?: string | null }) {
    try {
      const start = Date.now();
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      await analytics.trackDatabaseQuery('user.update', 'users', Date.now() - start, { id });
      return user;
    } catch (error) {
      throw new DatabaseError(`Failed to update user with id ${id}`, error);
    }
  }

  /**
   * Delete user
   */
  async delete(id: number) {
    try {
      const start = Date.now();
      const deleted = await this.prisma.user.delete({
        where: { id },
      });
      await analytics.trackDatabaseQuery('user.delete', 'users', Date.now() - start, { id });
      return deleted;
    } catch (error) {
      throw new DatabaseError(`Failed to delete user with id ${id}`, error);
    }
  }

  /**
   * Check if email already exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.user.count({
        where: { email },
      });
      await analytics.trackDatabaseQuery('user.existsByEmail', 'users', Date.now() - start, {
        email,
      });
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to check email existence: ${email}`, error);
    }
  }

  /**
   * Check if user exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      const start = Date.now();
      const count = await this.prisma.user.count({
        where: { id },
      });
      await analytics.trackDatabaseQuery('user.exists', 'users', Date.now() - start, { id });
      return count > 0;
    } catch (error) {
      throw new DatabaseQueryError(`Failed to check user existence: ${id}`, error);
    }
  }
}
