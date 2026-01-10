/**
 * API Route Error Handler Wrapper
 *
 * This module provides a higher-order function that wraps API route handlers
 * with consistent error handling, logging, and metrics. It integrates with
 * the custom error classes, logger, and OpenTelemetry metrics.
 *
 * @module lib/api-handler
 *
 * @example
 * ```typescript
 * // Basic usage
 * export const GET = withErrorHandling(async (request, context) => {
 *   const { id } = await context!.params;
 *   const user = await getUserById(id);
 *   return NextResponse.json({ data: user });
 * });
 *
 * // With options
 * export const POST = withErrorHandling(
 *   async (request) => {
 *     const body = await request.json();
 *     const result = await createUser(body);
 *     return NextResponse.json({ data: result }, { status: 201 });
 *   },
 *   { route: '/api/users', logSuccess: true }
 * );
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { apiLogger, createRequestLogger, Logger } from './logger';
import { AppError, isAppError, isOperationalError, fromPrismaError } from './errors';
import { recordHttpRequest } from './metrics';

// =============================================================================
// Types
// =============================================================================

/**
 * Route context with params
 */
export type RouteContext = {
  params: Promise<Record<string, string>>;
};

/**
 * API route handler function signature
 */
export type ApiHandler = (request: NextRequest, context?: RouteContext) => Promise<NextResponse> | NextResponse;

/**
 * Extended handler with access to request logger
 */
export type ApiHandlerWithLogger = (
  request: NextRequest,
  context: RouteContext | undefined,
  log: Logger
) => Promise<NextResponse> | NextResponse;

/**
 * Options for the error handling wrapper
 */
export interface ApiHandlerOptions {
  /** Route path for metrics (auto-detected if not provided) */
  route?: string;

  /** Whether to log successful requests (default: false to reduce noise). Slow requests (>1s) are always logged as warnings. */
  logSuccess?: boolean;

  /** Whether to log request body for debugging (default: false) */
  logRequestBody?: boolean;

  /** Custom error transformer */
  transformError?: (error: unknown) => AppError;

  /** Whether to include request ID in all responses (default: true) */
  includeRequestId?: boolean;
}

// =============================================================================
// Error Response Helpers
// =============================================================================

/**
 * Create a JSON error response
 */
function createErrorResponse(error: AppError, requestId: string, includeRequestId: boolean): NextResponse {
  const headers: HeadersInit = {};

  if (includeRequestId) {
    headers['x-request-id'] = requestId;
  }

  // Use error's toResponse method if available
  const body =
    'toResponse' in error && typeof error.toResponse === 'function'
      ? error.toResponse()
      : { error: error.message, code: error.code };

  return NextResponse.json(body, {
    status: error.statusCode,
    headers,
  });
}

/**
 * Create a Zod validation error response
 */
function createZodErrorResponse(error: ZodError, requestId: string, includeRequestId: boolean): NextResponse {
  const headers: HeadersInit = {};

  if (includeRequestId) {
    headers['x-request-id'] = requestId;
  }

  return NextResponse.json(
    {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.issues.map((e) => ({
        path: e.path.map(String).join('.'),
        message: e.message,
        code: e.code,
      })),
    },
    {
      status: 400,
      headers,
    }
  );
}

/**
 * Create a generic internal error response
 */
function createInternalErrorResponse(requestId: string, includeRequestId: boolean): NextResponse {
  const headers: HeadersInit = {};

  if (includeRequestId) {
    headers['x-request-id'] = requestId;
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(includeRequestId ? { requestId } : {}),
    },
    {
      status: 500,
      headers,
    }
  );
}

// =============================================================================
// Main Wrapper
// =============================================================================

/**
 * Wrap an API route handler with error handling, logging, and metrics
 *
 * Features:
 * - Automatic request ID generation and propagation
 * - Structured logging with request context
 * - Consistent error responses
 * - OpenTelemetry metrics integration
 * - Zod validation error handling
 * - Prisma error transformation
 *
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request, context) => {
 *   const session = await auth();
 *   if (!session?.user?.id) {
 *     throw new AuthenticationError();
 *   }
 *
 *   const { id } = await context!.params;
 *   const result = await getCourse(id);
 *
 *   if (!result.success) {
 *     throw result.error; // Will be handled appropriately
 *   }
 *
 *   return NextResponse.json({ data: result.data });
 * });
 * ```
 */
export function withErrorHandling(
  handler: ApiHandler | ApiHandlerWithLogger,
  options: ApiHandlerOptions = {}
): ApiHandler {
  // Default logSuccess to false to reduce log noise - only log errors/warnings
  const { route, logSuccess = false, logRequestBody = false, transformError, includeRequestId = true } = options;

  // Threshold for logging slow requests (ms)
  const SLOW_REQUEST_THRESHOLD = 1000;

  return async (request: NextRequest, context?: RouteContext): Promise<NextResponse> => {
    // Generate or extract request ID
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const startTime = Date.now();
    const method = request.method;
    const pathname = route || new URL(request.url).pathname;

    // Create request-scoped logger
    const log = createRequestLogger(requestId, {
      method,
      path: pathname,
    });

    // Only log request body in debug mode if explicitly enabled
    if (logRequestBody && request.method !== 'GET') {
      try {
        const body = await request.clone().json();
        log.debug({ body }, 'Request received with body');
      } catch {
        // No body to log
      }
    }

    let response: NextResponse;
    let statusCode: number;

    try {
      // Call the actual handler
      // Check if handler expects 3 arguments (with logger)
      if (handler.length === 3) {
        response = await (handler as ApiHandlerWithLogger)(request, context, log);
      } else {
        response = await (handler as ApiHandler)(request, context);
      }

      statusCode = response.status;

      // Add request ID to response headers
      if (includeRequestId) {
        response.headers.set('x-request-id', requestId);
      }

      // Log successful requests only if explicitly enabled or if request was slow
      const duration = Date.now() - startTime;
      if (logSuccess) {
        log.info({ statusCode, duration }, 'Request completed');
      } else if (duration > SLOW_REQUEST_THRESHOLD) {
        // Always log slow requests as warnings
        log.warn({ statusCode, duration }, 'Slow request completed');
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        log.warn({ issues: error.issues, duration }, 'Validation failed');
        response = createZodErrorResponse(error, requestId, includeRequestId);
        statusCode = 400;
      }
      // Handle known operational errors (safe to show to users)
      else if (isOperationalError(error)) {
        const appError = error as AppError;
        log.warn({ error: appError.toJSON(), duration }, appError.message);
        response = createErrorResponse(appError, requestId, includeRequestId);
        statusCode = appError.statusCode;
      }
      // Handle AppError (non-operational)
      else if (isAppError(error)) {
        log.error({ error: error.toJSON(), duration }, error.message);
        // Don't expose internal details for non-operational errors
        response = createInternalErrorResponse(requestId, includeRequestId);
        statusCode = 500;
      }
      // Handle Prisma errors
      else if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string' &&
        (error as { code: string }).code.startsWith('P')
      ) {
        const prismaError = fromPrismaError(error);

        if (prismaError.isOperational) {
          log.warn({ error: prismaError.toJSON(), duration }, prismaError.message);
          response = createErrorResponse(prismaError, requestId, includeRequestId);
          statusCode = prismaError.statusCode;
        } else {
          log.error({ err: error, duration }, 'Database error');
          response = createInternalErrorResponse(requestId, includeRequestId);
          statusCode = 500;
        }
      }
      // Transform unknown errors if transformer provided
      else if (transformError) {
        const transformed = transformError(error);
        log.error({ err: error, transformedError: transformed.toJSON(), duration }, 'Transformed error');
        response = createErrorResponse(transformed, requestId, includeRequestId);
        statusCode = transformed.statusCode;
      }
      // Unknown errors - log full details, return generic message
      else {
        log.error({ err: error, duration }, 'Unhandled error');
        response = createInternalErrorResponse(requestId, includeRequestId);
        statusCode = 500;
      }
    }

    // Record metrics
    try {
      const duration = Date.now() - startTime;
      recordHttpRequest({
        method,
        route: pathname,
        statusCode,
        duration,
      });
    } catch (metricsError) {
      apiLogger.error({ err: metricsError }, 'Error recording metrics');
    }

    return response;
  };
}

// =============================================================================
// Convenience Wrappers
// =============================================================================

/**
 * Create a handler that requires authentication
 *
 * @example
 * ```typescript
 * export const GET = withAuth(async (request, context, session) => {
 *   const enrollments = await getEnrollments(session.user.id);
 *   return NextResponse.json({ data: enrollments });
 * });
 * ```
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: RouteContext | undefined,
    session: { user: { id: string; email: string } }
  ) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
): ApiHandler {
  return withErrorHandling(async (request: NextRequest, context: RouteContext | undefined) => {
    // Dynamic import to avoid circular dependencies
    const { auth } = await import('@/auth');
    const session = await auth();

    if (!session?.user?.id) {
      const { AuthenticationError } = await import('./errors');
      throw new AuthenticationError();
    }

    return handler(request, context, session as { user: { id: string; email: string } });
  }, options);
}

/**
 * Create handlers for multiple HTTP methods with shared error handling
 *
 * @example
 * ```typescript
 * const { GET, POST } = createHandlers({
 *   GET: async (request) => {
 *     const data = await getData();
 *     return NextResponse.json({ data });
 *   },
 *   POST: async (request) => {
 *     const body = await request.json();
 *     const result = await createData(body);
 *     return NextResponse.json({ data: result }, { status: 201 });
 *   },
 * }, { route: '/api/data' });
 *
 * export { GET, POST };
 * ```
 */
export function createHandlers<T extends Record<string, ApiHandler>>(
  handlers: T,
  options: ApiHandlerOptions = {}
): { [K in keyof T]: ApiHandler } {
  const wrapped: Record<string, ApiHandler> = {};

  for (const [method, handler] of Object.entries(handlers)) {
    wrapped[method] = withErrorHandling(handler, options);
  }

  return wrapped as { [K in keyof T]: ApiHandler };
}

// =============================================================================
// Type Exports
// =============================================================================

export type { Logger };
