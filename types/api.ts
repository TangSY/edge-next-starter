/**
 * API related type definitions
 */

/**
 * API request context type
 * Used to pass data between middleware and route handlers
 */
export interface RequestContext {
  requestId: string;
  startTime: number;
  clientIp?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Pagination parameter type
 */
export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: 'asc' | 'desc';
}

/**
 * Pagination response metadata type
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Generic API error detail type
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}
