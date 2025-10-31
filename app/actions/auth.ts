/**
 * Authentication Server Actions
 * Server-side actions for authentication operations
 */

'use server';

import { signOut } from '@/lib/auth/config';

/**
 * Sign out the current user
 * Redirects to home page after successful sign out
 */
export async function handleSignOut() {
  await signOut({ redirectTo: '/' });
}
