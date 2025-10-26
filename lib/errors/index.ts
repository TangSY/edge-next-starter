/**
 * Error type enumeration
 */
export enum ErrorType {
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',

  // File operation errors
  FILE_ERROR = 'FILE_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_DOWNLOAD_ERROR = 'FILE_DOWNLOAD_ERROR',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',

  // Conversion errors
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  TYPE_CONVERSION_ERROR = 'TYPE_CONVERSION_ERROR',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Authentication/Authorization errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

  // Business logic errors
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',

  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Rate limit errors
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',

  // General errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * HTTP status code mapping
 */
export const ERROR_STATUS_MAP: Record<ErrorType, number> = {
  // Database errors - 500
  [ErrorType.DATABASE_ERROR]: 500,
  [ErrorType.DATABASE_CONNECTION_ERROR]: 503,
  [ErrorType.DATABASE_QUERY_ERROR]: 500,
  [ErrorType.DATABASE_CONSTRAINT_ERROR]: 409,

  // File errors - 400/404/413/500
  [ErrorType.FILE_ERROR]: 500,
  [ErrorType.FILE_NOT_FOUND]: 404,
  [ErrorType.FILE_UPLOAD_ERROR]: 500,
  [ErrorType.FILE_DOWNLOAD_ERROR]: 500,
  [ErrorType.FILE_SIZE_EXCEEDED]: 413,

  // Conversion errors - 400
  [ErrorType.CONVERSION_ERROR]: 400,
  [ErrorType.JSON_PARSE_ERROR]: 400,
  [ErrorType.TYPE_CONVERSION_ERROR]: 400,

  // Validation errors - 400
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.INVALID_INPUT]: 400,
  [ErrorType.MISSING_REQUIRED_FIELD]: 400,

  // Authentication/Authorization errors - 401/403
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.TOKEN_EXPIRED]: 401,
  [ErrorType.INVALID_CREDENTIALS]: 401,

  // Resource errors - 404/409
  [ErrorType.RESOURCE_NOT_FOUND]: 404,
  [ErrorType.RESOURCE_ALREADY_EXISTS]: 409,

  // Business logic errors - 400
  [ErrorType.BUSINESS_LOGIC_ERROR]: 400,

  // External service errors - 502/503
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorType.API_ERROR]: 502,
  [ErrorType.NETWORK_ERROR]: 503,

  // Rate limit errors - 429
  [ErrorType.RATE_LIMIT_ERROR]: 429,

  // General errors - 500
  [ErrorType.INTERNAL_SERVER_ERROR]: 500,
  [ErrorType.UNKNOWN_ERROR]: 500,
};

/**
 * Application error base class
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    statusCode?: number,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = statusCode || ERROR_STATUS_MAP[type];
    this.isOperational = isOperational;
    this.details = details;

    // Preserve stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.DATABASE_ERROR, 500, true, details);
  }
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends AppError {
  constructor(message = 'Database connection failed', details?: unknown) {
    super(message, ErrorType.DATABASE_CONNECTION_ERROR, 503, true, details);
  }
}

/**
 * Database query error
 */
export class DatabaseQueryError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.DATABASE_QUERY_ERROR, 500, true, details);
  }
}

/**
 * Database constraint error
 */
export class DatabaseConstraintError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.DATABASE_CONSTRAINT_ERROR, 409, true, details);
  }
}

/**
 * File error
 */
export class FileError extends AppError {
  constructor(message: string, type: ErrorType = ErrorType.FILE_ERROR, details?: unknown) {
    super(message, type, ERROR_STATUS_MAP[type], true, details);
  }
}

/**
 * File not found error
 */
export class FileNotFoundError extends FileError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.FILE_NOT_FOUND, details);
  }
}

/**
 * File upload error
 */
export class FileUploadError extends FileError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.FILE_UPLOAD_ERROR, details);
  }
}

/**
 * File download error
 */
export class FileDownloadError extends FileError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.FILE_DOWNLOAD_ERROR, details);
  }
}

/**
 * File size exceeded error
 */
export class FileSizeExceededError extends FileError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.FILE_SIZE_EXCEEDED, details);
  }
}

/**
 * Conversion error
 */
export class ConversionError extends AppError {
  constructor(message: string, type: ErrorType = ErrorType.CONVERSION_ERROR, details?: unknown) {
    super(message, type, ERROR_STATUS_MAP[type], true, details);
  }
}

/**
 * JSON parse error
 */
export class JSONParseError extends ConversionError {
  constructor(message = 'Failed to parse JSON', details?: unknown) {
    super(message, ErrorType.JSON_PARSE_ERROR, details);
  }
}

/**
 * Type conversion error
 */
export class TypeConversionError extends ConversionError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.TYPE_CONVERSION_ERROR, details);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.VALIDATION_ERROR, 400, true, details);
  }
}

/**
 * Invalid input error
 */
export class InvalidInputError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.INVALID_INPUT, 400, true, details);
  }
}

/**
 * Missing required field error
 */
export class MissingRequiredFieldError extends AppError {
  constructor(field: string, details?: unknown) {
    super(`Missing required field: ${field}`, ErrorType.MISSING_REQUIRED_FIELD, 400, true, details);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details?: unknown) {
    super(message, ErrorType.AUTHENTICATION_ERROR, 401, true, details);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details?: unknown) {
    super(message, ErrorType.AUTHORIZATION_ERROR, 403, true, details);
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends AppError {
  constructor(message = 'Token expired', details?: unknown) {
    super(message, ErrorType.TOKEN_EXPIRED, 401, true, details);
  }
}

/**
 * Invalid credentials error
 */
export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid credentials', details?: unknown) {
    super(message, ErrorType.INVALID_CREDENTIALS, 401, true, details);
  }
}

/**
 * Resource not found error
 */
export class ResourceNotFoundError extends AppError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, ErrorType.RESOURCE_NOT_FOUND, 404, true, details);
  }
}

/**
 * Resource already exists error
 */
export class ResourceAlreadyExistsError extends AppError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} already exists`, ErrorType.RESOURCE_ALREADY_EXISTS, 409, true, details);
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.BUSINESS_LOGIC_ERROR, 400, true, details);
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.EXTERNAL_SERVICE_ERROR, 502, true, details);
  }
}

/**
 * API error
 */
export class APIError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.API_ERROR, 502, true, details);
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message = 'Network error', details?: unknown) {
    super(message, ErrorType.NETWORK_ERROR, 503, true, details);
  }
}

/**
 * Rate limit error
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later', details?: unknown) {
    super(message, ErrorType.RATE_LIMIT_ERROR, 429, true, details);
  }
}

/**
 * Internal server error
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, ErrorType.INTERNAL_SERVER_ERROR, 500, true, details);
  }
}

/**
 * Determine if an error is operational (expected error)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Create AppError from native error
 */
export function createAppErrorFromNative(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to identify common error types
    const message = error.message.toLowerCase();

    if (message.includes('database') || message.includes('sql')) {
      return new DatabaseError(error.message, error);
    }

    if (message.includes('network') || message.includes('fetch')) {
      return new NetworkError(error.message, error);
    }

    if (message.includes('json') || message.includes('parse')) {
      return new JSONParseError(error.message, error);
    }

    if (message.includes('file') || message.includes('upload')) {
      return new FileError(error.message, ErrorType.FILE_ERROR, error);
    }

    return new InternalServerError(error.message, error);
  }

  return new InternalServerError('An unexpected error occurred', error);
}
