/**
 * HTTP client types
 * Matches the unified API response format from lib/api/response.ts
 */

import { ErrorType } from '@/lib/errors';

/**
 * API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    [key: string]: unknown;
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * API response type (union of success and error)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: ErrorType,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
