/**
 * NextAuth API Route Handler
 * Handles all authentication-related API requests
 */

import { handlers } from '@/lib/auth/config';

// Use Edge runtime (compatible with Web Crypto API)
export const runtime = 'edge';

export const { GET, POST } = handlers;
