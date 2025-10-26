/**
 * Unified API entry
 * Export all API-related utilities and middleware
 */

// Response utilities
export {
  createSuccessResponse,
  createErrorResponse,
  successResponse,
  errorResponse,
  withApiHandler,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serviceUnavailableResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type ApiResponse,
} from './response';

// Middleware
export { withRequestLogging, withErrorHandling, withMiddleware } from './middleware';

// Database access wrapper
export { withRepositories } from './database';

// Rate limiting
export { withRateLimit, getRateLimitStatus } from './rate-limit';
