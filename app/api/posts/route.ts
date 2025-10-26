import { NextRequest } from 'next/server';
import { createdResponse, paginatedResponse, withRepositories } from '@/lib/api';
import { ValidationError, ResourceNotFoundError } from '@/lib/errors';
import { analytics, AnalyticsEventType } from '@/lib/analytics';
import type { PaginationParams, PaginationMeta } from '@/types';

export const runtime = 'edge';

// GET /api/posts - Get all posts (supports pagination and filters)
export async function GET(request: NextRequest) {
  return withRepositories(request, async repos => {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userIdParam = searchParams.get('userId');
    const publishedParam = searchParams.get('published');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      throw new ValidationError('Invalid pagination parameters');
    }

    const pagination: PaginationParams = { page, limit };
    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;
    const published = publishedParam !== null ? publishedParam === 'true' : undefined;

    const timerStart = Date.now();
    // DB operations: query posts and total count
    const [posts, total] = await Promise.all([
      repos.posts.findAll({
        userId,
        published,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      repos.posts.count({ userId, published }),
    ]);

    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1,
    };

    await analytics.trackPerformance('post.list', Date.now() - timerStart, {
      userId,
      published,
      ...meta,
    });

    return paginatedResponse(
      posts,
      pagination.page,
      pagination.limit,
      total,
      'Posts retrieved successfully'
    );
  });
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  return withRepositories(request, async repos => {
    // Parse request body
    let body: { userId?: number; title?: string; content?: string; published?: boolean };
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON body', error);
    }

    const { userId, title, content, published } = body;

    // Validate required fields
    if (!userId) {
      throw new ValidationError('userId is required');
    }

    if (!title) {
      throw new ValidationError('title is required');
    }

    // Validate user existence
    const userExists = await repos.users.exists(userId);
    if (!userExists) {
      throw new ResourceNotFoundError('User');
    }

    // DB operation: create post
    const post = await repos.posts.create({
      userId,
      title,
      content: content || null,
      published: published ?? false,
    });

    await analytics.trackBusinessEvent(AnalyticsEventType.POST_CREATED, {
      postId: post.id,
      userId,
      published: post.published,
    });

    return createdResponse(post, 'Post created successfully');
  });
}
