/**
 * NextAuth API Route Handler
 * Handles all authentication-related API requests
 *
 * Note: Uses Node.js runtime to support bcryptjs password encryption
 */

import { handlers } from '@/auth';

// Use Node.js runtime (required by bcryptjs)
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
