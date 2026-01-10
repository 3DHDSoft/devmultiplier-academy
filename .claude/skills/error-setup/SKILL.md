# Error Handling Setup Skill

Implement the complete error handling and logging infrastructure for Next.js TypeScript applications.

## Overview

This skill guides you through setting up:
1. Custom error classes with type safety
2. Result pattern for no-throw error handling
3. Pino logger with environment-aware configuration
4. API route error handler wrapper
5. Server action error wrapper
6. Request context with correlation IDs
7. Sentry integration (optional)

## Prerequisites

```bash
# Required packages
bun add pino pino-pretty zod
bun add -D @types/pino

# Optional: Error monitoring
bun add @sentry/nextjs
```

## Implementation Steps

### Step 1: Create Error Classes

Create `lib/errors.ts`:

```typescript
/**
 * Base application error class
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

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, true, { fields });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier ? `${resource} not found: ${identifier}` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, { resource, identifier });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class RateLimitError extends AppError {
  constructor(public readonly retryAfter?: number) {
    super('Too many requests', 'RATE_LIMIT_ERROR', 429, true, { retryAfter });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, false, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, false, { service, ...context });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: unknown): boolean {
  return isAppError(error) && error.isOperational;
}
```

### Step 2: Create Result Pattern

Create `lib/result.ts`:

```typescript
import { AppError, isAppError } from './errors';

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorTransform?: (error: unknown) => AppError
): Promise<Result<T, AppError>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    if (isAppError(error)) {
      return err(error);
    }
    const appError = errorTransform
      ? errorTransform(error)
      : new AppError(
          error instanceof Error ? error.message : 'Unknown error',
          'UNKNOWN_ERROR',
          500,
          false
        );
    return err(appError);
  }
}

export function unwrap<T>(result: Result<T, AppError>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

export function unwrapOr<T>(result: Result<T, AppError>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}
```

### Step 3: Create Logger

Create `lib/logger.ts`:

```typescript
import pino, { Logger, LoggerOptions } from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const baseConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: {
    env: process.env.NODE_ENV,
    service: process.env.SERVICE_NAME || 'nextjs-app',
    version: process.env.npm_package_version,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      '*.password',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const devConfig: LoggerOptions = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname,env,service,version',
      errorLikeObjectKeys: ['err', 'error'],
    },
  },
};

const prodConfig: LoggerOptions = {
  ...baseConfig,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({ pid: bindings.pid, host: bindings.hostname }),
  },
};

const testConfig: LoggerOptions = {
  ...baseConfig,
  level: 'silent',
};

function createLogger(): Logger {
  if (isTest) return pino(testConfig);
  if (isDev) return pino(devConfig);
  return pino(prodConfig);
}

export const logger = createLogger();

export const dbLogger = logger.child({ module: 'database' });
export const apiLogger = logger.child({ module: 'api' });
export const authLogger = logger.child({ module: 'auth' });
export const cacheLogger = logger.child({ module: 'cache' });

export function createRequestLogger(requestId: string, metadata?: object): Logger {
  return logger.child({ requestId, ...metadata });
}

export type { Logger };
```

### Step 4: Create API Handler Wrapper

Create `lib/api-handler.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { isOperationalError } from '@/lib/errors';

type RouteContext = { params: Promise<Record<string, string>> };
type ApiHandler = (request: NextRequest, context?: RouteContext) => Promise<NextResponse>;

interface ApiHandlerOptions {
  logSuccess?: boolean;
}

export function withErrorHandling(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): ApiHandler {
  const { logSuccess = true } = options;

  return async (request, context) => {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const startTime = Date.now();

    const log = logger.child({
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
    });

    try {
      const response = await handler(request, context);

      if (logSuccess) {
        log.info({ statusCode: response.status, duration: Date.now() - startTime }, 'Request completed');
      }

      response.headers.set('x-request-id', requestId);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof ZodError) {
        log.warn({ errors: error.errors, duration }, 'Validation failed');
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
          },
          { status: 400, headers: { 'x-request-id': requestId } }
        );
      }

      if (isOperationalError(error)) {
        log.warn({ error: error.toJSON(), duration }, error.message);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode, headers: { 'x-request-id': requestId } }
        );
      }

      log.error({ err: error, duration }, 'Unhandled error');
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR', requestId },
        { status: 500, headers: { 'x-request-id': requestId } }
      );
    }
  };
}
```

### Step 5: Create Request Context

Create `lib/request-context.ts`:

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import { logger, Logger } from '@/lib/logger';

interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  logger: Logger;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(
  context: Omit<RequestContext, 'logger'>,
  fn: () => T
): T {
  const contextLogger = logger.child({
    requestId: context.requestId,
    userId: context.userId,
    sessionId: context.sessionId,
  });

  return requestContext.run({ ...context, logger: contextLogger }, fn);
}

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getLogger(): Logger {
  return getContext()?.logger || logger;
}
```

### Step 6: Create Server Action Wrapper

Create `lib/action-wrapper.ts`:

```typescript
'use server';

import { logger } from '@/lib/logger';
import { AppError, isOperationalError } from '@/lib/errors';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

export function withActionLogging<TInput, TOutput>(
  name: string,
  action: (input: TInput) => Promise<TOutput>
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input) => {
    const actionId = crypto.randomUUID();
    const log = logger.child({ actionId, action: name });
    const startTime = Date.now();

    log.debug({ input }, 'Action started');

    try {
      const data = await action(input);
      log.info({ duration: Date.now() - startTime }, 'Action completed');
      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (isOperationalError(error)) {
        log.warn({ error: (error as AppError).toJSON(), duration }, 'Action failed (operational)');
        return { success: false, error: (error as AppError).message, code: (error as AppError).code };
      }

      log.error({ err: error, duration }, 'Action failed (unexpected)');
      return { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
    }
  };
}
```

## Verification Checklist

- [ ] `lib/errors.ts` - Custom error classes created
- [ ] `lib/result.ts` - Result pattern implemented
- [ ] `lib/logger.ts` - Pino logger configured
- [ ] `lib/api-handler.ts` - API error wrapper created
- [ ] `lib/request-context.ts` - AsyncLocalStorage context
- [ ] `lib/action-wrapper.ts` - Server action wrapper
- [ ] Environment variables set: `LOG_LEVEL`, `SERVICE_NAME`
- [ ] Test error handling works in development
- [ ] Verify JSON logs in production mode

## Usage Examples

### In API Routes

```typescript
import { withErrorHandling } from '@/lib/api-handler';
import { NotFoundError } from '@/lib/errors';

export const GET = withErrorHandling(async (request, context) => {
  const { id } = await context!.params;
  const course = await getCourse(id);

  if (!course) {
    throw new NotFoundError('Course', id);
  }

  return NextResponse.json({ data: course });
});
```

### In Services

```typescript
import { ok, err, Result, tryCatch } from '@/lib/result';
import { DatabaseError, NotFoundError } from '@/lib/errors';

export async function getUserById(id: string): Promise<Result<User, AppError>> {
  const result = await tryCatch(
    () => prisma.users.findUnique({ where: { id } }),
    (e) => new DatabaseError('Failed to fetch user', { originalError: e })
  );

  if (!result.success) return result;
  if (!result.data) return err(new NotFoundError('User', id));

  return ok(result.data);
}
```

### In Server Actions

```typescript
import { withActionLogging } from '@/lib/action-wrapper';

export const enrollInCourse = withActionLogging(
  'enrollInCourse',
  async ({ userId, courseId }) => {
    return await prisma.enrollments.create({
      data: { userId, courseId },
    });
  }
);
```
