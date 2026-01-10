/**
 * Custom Error Classes for DevMultiplier Academy
 *
 * This module provides a hierarchy of typed errors for consistent handling
 * across the application. All errors extend AppError which provides:
 * - Structured JSON serialization
 * - HTTP status codes
 * - Error codes for client handling
 * - Operational vs non-operational classification
 * - Contextual data for debugging
 *
 * @module lib/errors
 */

/**
 * Base application error class.
 * All custom errors should extend this class.
 *
 * @example
 * ```typescript
 * throw new AppError('Something went wrong', 'CUSTOM_ERROR', 500, false, { userId });
 * ```
 */
export class AppError extends Error {
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for logging and API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Create safe response object (no internal details)
   */
  toResponse(): { error: string; code: string } {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

/**
 * Validation errors for invalid client input (400)
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid email format', {
 *   email: ['Must be a valid email address'],
 *   password: ['Must be at least 8 characters'],
 * });
 * ```
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, { fields });
  }

  toResponse(): { error: string; code: string; details?: Record<string, string[]> } {
    return {
      error: this.message,
      code: this.code,
      details: this.fields,
    };
  }
}

/**
 * Resource not found errors (404)
 *
 * @example
 * ```typescript
 * throw new NotFoundError('Course', courseId);
 * throw new NotFoundError('User'); // Without identifier
 * ```
 */
export class NotFoundError extends AppError {
  constructor(
    public readonly resource: string,
    public readonly identifier?: string
  ) {
    const message = identifier ? `${resource} not found: ${identifier}` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, { resource, identifier });
  }
}

/**
 * Authentication errors (401) - User not logged in
 *
 * @example
 * ```typescript
 * throw new AuthenticationError();
 * throw new AuthenticationError('Session expired');
 * ```
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
  }
}

/**
 * Authorization errors (403) - User lacks permission
 *
 * @example
 * ```typescript
 * throw new AuthorizationError();
 * throw new AuthorizationError('Admin access required');
 * ```
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

/**
 * Conflict errors (409) - Resource already exists
 *
 * @example
 * ```typescript
 * throw new ConflictError('User already enrolled in this course');
 * throw new ConflictError('Email already registered', { email });
 * ```
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, true, context);
  }
}

/**
 * Rate limiting errors (429)
 *
 * @example
 * ```typescript
 * throw new RateLimitError(60); // Retry after 60 seconds
 * throw new RateLimitError();
 * ```
 */
export class RateLimitError extends AppError {
  constructor(public readonly retryAfter?: number) {
    super('Too many requests', 'RATE_LIMIT_ERROR', 429, true, { retryAfter });
  }

  toResponse(): { error: string; code: string; retryAfter?: number } {
    return {
      error: this.message,
      code: this.code,
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Database/infrastructure errors (500) - Non-operational
 * These errors indicate system problems and should trigger alerts.
 *
 * @example
 * ```typescript
 * throw new DatabaseError('Failed to connect to database', { host, port });
 * throw new DatabaseError('Query timeout', { query: 'SELECT...', duration: 30000 });
 * ```
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, false, context);
  }
}

/**
 * External service errors (502) - Non-operational
 * Used when third-party services fail.
 *
 * @example
 * ```typescript
 * throw new ExternalServiceError('Stripe', 'Payment processing failed', { paymentId });
 * throw new ExternalServiceError('SendGrid', 'Email delivery failed');
 * ```
 */
export class ExternalServiceError extends AppError {
  constructor(
    public readonly service: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, false, {
      service,
      ...context,
    });
  }
}

/**
 * Configuration errors (500) - Non-operational
 * Used when environment or configuration is invalid.
 *
 * @example
 * ```typescript
 * throw new ConfigurationError('Missing DATABASE_URL environment variable');
 * throw new ConfigurationError('Invalid SMTP configuration', { host, port });
 * ```
 */
export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', 500, false, context);
  }
}

/**
 * Business logic errors (422) - Operational
 * Used when business rules prevent an operation.
 *
 * @example
 * ```typescript
 * throw new BusinessError('Cannot enroll in archived course');
 * throw new BusinessError('Course capacity reached', { courseId, capacity: 100 });
 * ```
 */
export class BusinessError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BUSINESS_ERROR', 422, true, context);
  }
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard for AppError instances
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for operational errors (safe to show to users)
 */
export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}

/**
 * Type guard for non-operational errors (system failures)
 */
export function isSystemError(error: unknown): boolean {
  return isAppError(error) && !error.isOperational;
}

// =============================================================================
// Error Mapping Utilities
// =============================================================================

/**
 * Map Prisma error codes to AppError instances
 */
export function fromPrismaError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        return new ConflictError('Resource already exists', prismaError.meta);
      case 'P2025': // Record not found
        return new NotFoundError('Resource');
      case 'P2003': // Foreign key constraint failed
        return new ValidationError('Invalid reference', {
          reference: ['Referenced resource does not exist'],
        });
      case 'P2024': // Connection pool timeout
        return new DatabaseError('Database connection timeout', { code: prismaError.code });
      default:
        return new DatabaseError('Database operation failed', {
          code: prismaError.code,
          meta: prismaError.meta,
        });
    }
  }

  return new DatabaseError(error instanceof Error ? error.message : 'Unknown database error');
}

/**
 * Create an AppError from any unknown error
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, false, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new AppError(String(error), 'UNKNOWN_ERROR', 500, false);
}

// =============================================================================
// Error Code Reference
// =============================================================================

/**
 * All error codes used in the application
 */
export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
