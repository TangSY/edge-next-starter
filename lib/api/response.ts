import { NextResponse } from 'next/server';
import { AppError, createAppErrorFromNative, ErrorType } from '@/lib/errors';
import { logger } from '@/lib/logger';

/**
 * API response interface - success
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/**
 * API response interface - error
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
 * API response type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create success response
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Create error response
 */
export function createErrorResponse(error: Error | AppError | unknown): ApiErrorResponse {
  const appError = error instanceof AppError ? error : createAppErrorFromNative(error);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      type: appError.type,
      message: appError.message,
    },
  };

  // Add detailed info in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    if (appError.details) {
      response.error.details = appError.details;
    }
    if (appError.stack) {
      response.error.stack = appError.stack;
    }
  }

  return response;
}

/**
 * Return a successful Next.js response
 */
export function successResponse<T = unknown>(
  data: T,
  message?: string,
  statusCode = 200,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  const response = createSuccessResponse(data, message, meta);
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Return an error Next.js response
 */
export function errorResponse(
  error: Error | AppError | unknown,
  statusCode?: number
): NextResponse<ApiErrorResponse> {
  const appError = error instanceof AppError ? error : createAppErrorFromNative(error);
  const response = createErrorResponse(appError);
  const status = statusCode || appError.statusCode;

  // Log error
  logger.error(`API Error: ${appError.message}`, appError, {
    type: appError.type,
    statusCode: status,
  });

  return NextResponse.json(response, { status });
}

/**
 * API handler wrapper
 * Automatically handles errors and returns unified response format
 */
export function withApiHandler<T = unknown>(
  handler: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler()
    .then(data => successResponse(data))
    .catch(error => errorResponse(error));
}

/**
 * Pagination response helper
 */
export function paginatedResponse<T = unknown>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse<ApiSuccessResponse<T[]>> {
  return successResponse(data, message, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  });
}

/**
 * Created response helper
 */
export function createdResponse<T = unknown>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, 201);
}

/**
 * No content response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Not found response
 */
export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse(new AppError(message, ErrorType.RESOURCE_NOT_FOUND), 404);
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  message: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return errorResponse(new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, details), 400);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return errorResponse(new AppError(message, ErrorType.AUTHENTICATION_ERROR), 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return errorResponse(new AppError(message, ErrorType.AUTHORIZATION_ERROR), 403);
}

/**
 * Service unavailable response
 */
export function serviceUnavailableResponse(
  message = 'Service unavailable'
): NextResponse<ApiErrorResponse> {
  return errorResponse(new AppError(message, ErrorType.EXTERNAL_SERVICE_ERROR, 503), 503);
}
