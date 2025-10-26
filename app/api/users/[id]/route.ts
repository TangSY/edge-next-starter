import { NextRequest } from 'next/server';
import { successResponse, noContentResponse, withRepositories } from '@/lib/api';
import { createCacheClient } from '@/lib/cache/client';
import { ValidationError, ResourceNotFoundError } from '@/lib/errors';

export const runtime = 'edge';

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    // DB operation: query user (with posts)
    const user = await repos.users.findByIdWithPosts(userId, 10);

    // Check whether user exists
    if (!user) {
      throw new ResourceNotFoundError('User');
    }

    return successResponse(user, 'User retrieved successfully');
  });
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    // Parse request body
    let body: { email?: string; name?: string };
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON body', error);
    }

    const { email, name } = body;

    // Validate email format
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
      }
    }

    // Check whether user exists
    const exists = await repos.users.exists(userId);
    if (!exists) {
      throw new ResourceNotFoundError('User');
    }

    // DB operation: update user
    const user = await repos.users.update(userId, {
      ...(email && { email }),
      ...(name !== undefined && { name }),
    });

    // Clear cache
    const cache = createCacheClient();
    await cache?.delete('users:all');
    await cache?.delete(`user:${userId}`);

    return successResponse(user, 'User updated successfully');
  });
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    // Check whether user exists
    const exists = await repos.users.exists(userId);
    if (!exists) {
      throw new ResourceNotFoundError('User');
    }

    // DB operation: delete user (cascade delete related posts)
    await repos.users.delete(userId);

    // Clear cache
    const cache = createCacheClient();
    await cache?.delete('users:all');
    await cache?.delete(`user:${userId}`);

    return noContentResponse();
  });
}
