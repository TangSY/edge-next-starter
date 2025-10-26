import { NextRequest } from 'next/server';
import { successResponse, noContentResponse, withRepositories } from '@/lib/api';
import { ValidationError, ResourceNotFoundError } from '@/lib/errors';

export const runtime = 'edge';

// GET /api/posts/[id] - Get single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    // DB operation: query post
    const post = await repos.posts.findById(postId);

    // Check whether post exists
    if (!post) {
      throw new ResourceNotFoundError('Post');
    }

    return successResponse(post, 'Post retrieved successfully');
  });
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    // Parse request body
    let body: { title?: string; content?: string; published?: boolean };
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON body', error);
    }

    // Check whether post exists
    const exists = await repos.posts.exists(postId);
    if (!exists) {
      throw new ResourceNotFoundError('Post');
    }

    // DB operation: update post
    const post = await repos.posts.update(postId, body);

    return successResponse(post, 'Post updated successfully');
  });
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRepositories(request, async repos => {
    const { id } = await params;

    // Validate ID
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    // Check whether post exists
    const exists = await repos.posts.exists(postId);
    if (!exists) {
      throw new ResourceNotFoundError('Post');
    }

    // DB operation: delete post
    await repos.posts.delete(postId);

    return noContentResponse();
  });
}
