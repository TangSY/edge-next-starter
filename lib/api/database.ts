import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClient } from '@/lib/db/client';
import { createRepositories, RepositoryFactory } from '@/repositories';
import { DatabaseConnectionError } from '@/lib/errors';
import { withMiddleware } from './middleware';

/**
 * Database access wrapper
 * Automatically handles Prisma client initialization and Repository creation
 *
 * @param request - Next.js request object
 * @param handler - Business logic function receiving repositories as argument
 * @returns Promise<NextResponse>
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withRepositories(request, async (repos) => {
 *     const users = await repos.users.findAll();
 *     return successResponse(users);
 *   });
 * }
 */
export async function withRepositories<T>(
  request: NextRequest,
  handler: (repos: RepositoryFactory) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  return withMiddleware(request, async () => {
    // Initialize Prisma client
    const prisma = createPrismaClient();
    if (!prisma) {
      throw new DatabaseConnectionError('Database not available');
    }

    // Create Repository factory
    const repos = createRepositories(prisma);

    // Execute business logic
    return await handler(repos);
  });
}
