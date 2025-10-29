/**
 * User Registration API
 * Handles new user registration requests
 */

import { NextRequest } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';
import { withRepositories, createdResponse } from '@/lib/api';
import { createCacheClient } from '@/lib/cache/client';
import { ResourceAlreadyExistsError, ValidationError } from '@/lib/errors';
import { analytics, AnalyticsEventType } from '@/lib/analytics';

// Use Edge runtime (compatible with Web Crypto API)
export const runtime = 'edge';

// Registration request validation schema
const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Please provide a username').optional(),
});

export async function POST(request: NextRequest) {
  return withRepositories(request, async repos => {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON body', error);
    }

    let validatedData: z.infer<typeof registerSchema>;
    try {
      validatedData = registerSchema.parse(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        throw new ValidationError(firstError?.message || 'Validation failed', error);
      }
      throw error;
    }

    // Check if user already exists
    const exists = await repos.users.existsByEmail(validatedData.email);
    if (exists) {
      throw new ResourceAlreadyExistsError('User with this email');
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const displayName = validatedData.name || validatedData.email.split('@')[0];

    const user = await repos.users.create({
      email: validatedData.email,
      name: displayName,
      password: hashedPassword,
    });

    // Clear cache
    const cache = createCacheClient();
    await cache?.delete('users:all');

    await analytics.trackBusinessEvent(AnalyticsEventType.USER_CREATED, {
      userId: user.id,
      email: user.email,
      source: 'register',
    });

    return createdResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.createdAt * 1000).toISOString(),
      },
      'Registration successful'
    );
  });
}
