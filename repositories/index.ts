import { PrismaClient } from '@prisma/client';
import { UserRepository } from './user.repository';
import { PostRepository } from './post.repository';

/**
 * Repository Factory
 * Create and manage all repository instances
 */
export class RepositoryFactory {
  private userRepo?: UserRepository;
  private postRepo?: PostRepository;

  constructor(private prisma: PrismaClient) {}

  /**
   * Get User Repository
   */
  get users(): UserRepository {
    if (!this.userRepo) {
      this.userRepo = new UserRepository(this.prisma);
    }
    return this.userRepo;
  }

  /**
   * Get Post Repository
   */
  get posts(): PostRepository {
    if (!this.postRepo) {
      this.postRepo = new PostRepository(this.prisma);
    }
    return this.postRepo;
  }
}

/**
 * Create Repository Factory instance
 */
export function createRepositories(prisma: PrismaClient): RepositoryFactory {
  return new RepositoryFactory(prisma);
}

// Export all repositories
export { UserRepository } from './user.repository';
export { PostRepository } from './post.repository';
