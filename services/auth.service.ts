/**
 * Authentication API Service
 * Handles user authentication operations
 */

import { http } from '@/lib/http';

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

/**
 * Registration result
 */
export interface RegisterResult {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/**
 * Authentication API service
 */
export class AuthService {
  /**
   * Register a new user
   * @param data - Registration data (email, password, name)
   * @returns Registered user information
   */
  static async register(data: RegisterData): Promise<RegisterResult> {
    return http.post<RegisterResult>('/api/register', data);
  }
}
