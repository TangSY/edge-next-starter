import { NextRequest } from 'next/server';
import { successResponse, createdResponse, withRepositories, withRateLimit } from '@/lib/api';
import { withCache, createCacheClient } from '@/lib/cache/client';
import { ValidationError, ResourceAlreadyExistsError } from '@/lib/errors';
import { analytics, AnalyticsEventType } from '@/lib/analytics';

export const runtime = 'edge';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    // Use cache wrapper
    const users = await withCache(
      'users:all',
      async () => {
        return await repos.users.findAll('desc');
      },
      60 // cache for 60 seconds
    );

    return successResponse(users, 'Users retrieved successfully');
  });
}

// POST /api/users - Create new user
// Note: Strict rate limit applied (10/min) to prevent abuse
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      return withRepositories(request, async repos => {
        // Parse request body
        let body: { email?: string; name?: string };
        try {
          body = await request.json();
        } catch (error) {
          throw new ValidationError('Invalid JSON body', error);
        }

        const { email, name } = body;

        // Validate email
        if (!email) {
          throw new ValidationError('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ValidationError('Invalid email format');
        }

        // Check whether email already exists
        const exists = await repos.users.existsByEmail(email);
        if (exists) {
          throw new ResourceAlreadyExistsError('User with this email');
        }

        // DB operation: create user
        const user = await repos.users.create({
          email,
          name: name || null,
        });

        // Clear cache
        const cache = createCacheClient();
        await cache?.delete('users:all');

        await analytics.trackBusinessEvent(AnalyticsEventType.USER_CREATED, {
          userId: user.id,
          email: user.email,
        });

        return createdResponse(user, 'User created successfully');
      });
    },
    // Custom config: stricter rate limit for user creation
    { maxRequests: 10, windowSeconds: 60 } // 10 per minute
  );
}
