# Structured Error Handling & Logging for Next.js TypeScript

> Best practices, tools, and implementation patterns for local development and production cloud environments.

## Table of Contents

- [Overview](#overview)
- [Error Handling Patterns](#error-handling-patterns)
  - [Custom Error Classes](#custom-error-classes)
  - [Result Pattern (No-Throw)](#result-pattern-no-throw)
  - [API Route Error Handling](#api-route-error-handling)
- [Logging Solutions](#logging-solutions)
  - [Pino (Recommended)](#pino-recommended)
  - [Next.js Integration](#nextjs-integration)
  - [Request Context & Correlation IDs](#request-context--correlation-ids)
- [Production Error Monitoring](#production-error-monitoring)
  - [Sentry](#option-1-sentry-recommended)
  - [Axiom](#option-2-axiom)
  - [Self-Hosted (OpenTelemetry)](#option-3-self-hosted-opentelemetry--grafana)
- [Environment Configuration](#environment-configuration)
- [Implementation Checklist](#implementation-checklist)
- [Package Summary](#package-summary)

---

## Overview

A robust error handling and logging strategy requires:

| Concern | Local Development | Production Cloud |
|---------|-------------------|------------------|
| **Logging** | Pretty-printed console | Structured JSON → aggregator |
| **Error Tracking** | Stack traces in terminal | Centralized monitoring + alerts |
| **Tracing** | Optional | Distributed tracing for debugging |
| **Alerting** | None | Slack/Email on critical errors |

### Goals

1. **Consistent error handling** across API routes, server actions, and client components
2. **Structured logging** with correlation IDs for request tracing
3. **Type-safe errors** that integrate with TypeScript
4. **Zero-config local development** with production-ready output
5. **Sensitive data redaction** in all environments

---

## Error Handling Patterns

### Custom Error Classes

Create a hierarchy of typed errors for consistent handling across your application.

```typescript
// lib/errors.ts

/**
 * Base application error class
 * All custom errors should extend this
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

/**
 * Client-side validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, { fields });
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, { resource, identifier });
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

/**
 * Rate limiting errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    public readonly retryAfter?: number
  ) {
    super('Too many requests', 'RATE_LIMIT_ERROR', 429, true, { retryAfter });
  }
}

/**
 * Database/infrastructure errors (500) - non-operational
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', 500, false, context);
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
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
 * Type guard for AppError
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
```

### Result Pattern (No-Throw)

For predictable error handling without try/catch everywhere. Inspired by Rust's `Result` type.

```typescript
// lib/result.ts

/**
 * Discriminated union for success/failure results
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create a success result
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Create a failure result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wrap an async function that might throw into a Result
 */
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

/**
 * Unwrap a result or throw
 */
export function unwrap<T>(result: Result<T, AppError>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap a result or return a default value
 */
export function unwrapOr<T>(result: Result<T, AppError>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}
```

#### Usage Example

```typescript
// services/user-service.ts
import { ok, err, Result, tryCatch } from '@/lib/result';
import { NotFoundError, DatabaseError } from '@/lib/errors';
import { db } from '@/lib/db';

export async function getUserById(id: string): Promise<Result<User, AppError>> {
  const result = await tryCatch(
    () => db.user.findUnique({ where: { id } }),
    (error) => new DatabaseError('Failed to fetch user', { originalError: error })
  );

  if (!result.success) {
    return result;
  }

  if (!result.data) {
    return err(new NotFoundError('User', id));
  }

  return ok(result.data);
}

// In your API route or server action
const result = await getUserById(userId);

if (!result.success) {
  // Handle error - type is narrowed to AppError
  logger.warn({ error: result.error }, 'Failed to get user');
  return NextResponse.json(
    { error: result.error.message },
    { status: result.error.statusCode }
  );
}

// result.data is typed as User
return NextResponse.json(result.data);
```

### API Route Error Handling

Create a wrapper for consistent error handling across all API routes.

```typescript
// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';
import { AppError, isAppError, isOperationalError } from '@/lib/errors';

type RouteContext = {
  params: Promise<Record<string, string>>;
};

type ApiHandler = (
  request: NextRequest,
  context?: RouteContext
) => Promise<NextResponse>;

interface ApiHandlerOptions {
  /** Log successful requests */
  logSuccess?: boolean;
  /** Custom error transformer */
  transformError?: (error: unknown) => AppError;
}

/**
 * Wraps an API route handler with consistent error handling and logging
 */
export function withErrorHandling(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): ApiHandler {
  const { logSuccess = true, transformError } = options;

  return async (request, context) => {
    const requestId =
      request.headers.get('x-request-id') || crypto.randomUUID();
    const startTime = Date.now();

    // Create child logger with request context
    const log = logger.child({
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
    });

    try {
      const response = await handler(request, context);

      // Log successful requests
      if (logSuccess) {
        log.info(
          {
            statusCode: response.status,
            duration: Date.now() - startTime,
          },
          'Request completed'
        );
      }

      // Add request ID to response headers
      response.headers.set('x-request-id', requestId);
      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        log.warn(
          { errors: error.errors, duration },
          'Validation failed'
        );
        return NextResponse.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          {
            status: 400,
            headers: { 'x-request-id': requestId },
          }
        );
      }

      // Handle known operational errors
      if (isOperationalError(error)) {
        log.warn(
          {
            error: error.toJSON(),
            duration,
          },
          error.message
        );
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          {
            status: error.statusCode,
            headers: { 'x-request-id': requestId },
          }
        );
      }

      // Transform unknown errors if transformer provided
      if (transformError && !isAppError(error)) {
        const transformed = transformError(error);
        log.error(
          { err: error, transformedError: transformed.toJSON(), duration },
          'Transformed error'
        );
        return NextResponse.json(
          {
            error: transformed.message,
            code: transformed.code,
          },
          {
            status: transformed.statusCode,
            headers: { 'x-request-id': requestId },
          }
        );
      }

      // Log unknown/unexpected errors with full details
      log.error(
        {
          err: error,
          duration,
        },
        'Unhandled error'
      );

      // Return generic error to client (don't leak internal details)
      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          requestId, // Include for support tickets
        },
        {
          status: 500,
          headers: { 'x-request-id': requestId },
        }
      );
    }
  };
}
```

#### Usage in API Routes

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api-handler';
import { getUserById } from '@/services/user-service';
import { unwrap } from '@/lib/result';

export const GET = withErrorHandling(async (request, context) => {
  const { id } = await context!.params;
  
  const result = await getUserById(id);
  const user = unwrap(result); // Throws if error, caught by wrapper
  
  return NextResponse.json(user);
});
```

---

## Logging Solutions

### Pino (Recommended)

Pino is the fastest Node.js logger with excellent TypeScript support and structured JSON output.

#### Installation

```bash
bun add pino pino-pretty
bun add -D @types/pino
```

#### Configuration

```typescript
// lib/logger.ts
import pino, { Logger, LoggerOptions } from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Base logger configuration
 */
const baseConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

  // Add common fields to all log entries
  base: {
    env: process.env.NODE_ENV,
    service: process.env.SERVICE_NAME || 'nextjs-app',
    version: process.env.npm_package_version,
  },

  // Redact sensitive information
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

  // Custom serializers
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },

  // Custom timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
};

/**
 * Development configuration with pretty printing
 */
const devConfig: LoggerOptions = {
  ...baseConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname,env,service,version',
      messageFormat: '{msg}',
      errorLikeObjectKeys: ['err', 'error'],
    },
  },
};

/**
 * Production configuration (JSON output)
 */
const prodConfig: LoggerOptions = {
  ...baseConfig,
  // Ensure proper JSON formatting
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
};

/**
 * Test configuration (minimal output)
 */
const testConfig: LoggerOptions = {
  ...baseConfig,
  level: 'silent', // Disable logging in tests by default
};

/**
 * Create the main logger instance
 */
function createLogger(): Logger {
  if (isTest) {
    return pino(testConfig);
  }
  if (isDev) {
    return pino(devConfig);
  }
  return pino(prodConfig);
}

export const logger = createLogger();

/**
 * Create child loggers for specific modules
 */
export const dbLogger = logger.child({ module: 'database' });
export const apiLogger = logger.child({ module: 'api' });
export const authLogger = logger.child({ module: 'auth' });
export const cacheLogger = logger.child({ module: 'cache' });

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(requestId: string, metadata?: object): Logger {
  return logger.child({ requestId, ...metadata });
}

/**
 * Log levels reference:
 * - fatal: System is unusable
 * - error: Error conditions (exceptions, failures)
 * - warn: Warning conditions (deprecated features, retries)
 * - info: Informational messages (request completed, job started)
 * - debug: Debug information (detailed flow)
 * - trace: Very detailed tracing (function entry/exit)
 */
```

### Next.js Integration

#### Middleware Logging

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Add request ID to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Add request ID to response headers
  response.headers.set('x-request-id', requestId);

  // Log request (in production, consider logging only errors/slow requests)
  logger.info(
    {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      duration: Date.now() - startTime,
    },
    'Incoming request'
  );

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Optionally match pages too
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### Server Actions Logging

```typescript
// lib/action-wrapper.ts
'use server';

import { logger } from '@/lib/logger';
import { AppError, isOperationalError } from '@/lib/errors';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

/**
 * Wrap server actions with logging and error handling
 */
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

      log.info(
        { duration: Date.now() - startTime },
        'Action completed'
      );

      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (isOperationalError(error)) {
        log.warn(
          { error: (error as AppError).toJSON(), duration },
          'Action failed (operational)'
        );
        return {
          success: false,
          error: (error as AppError).message,
          code: (error as AppError).code,
        };
      }

      log.error(
        { err: error, duration },
        'Action failed (unexpected)'
      );

      return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      };
    }
  };
}
```

### Request Context & Correlation IDs

For tracing requests across your application, use AsyncLocalStorage.

```typescript
// lib/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';
import { logger, Logger } from '@/lib/logger';

interface RequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  logger: Logger;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Run a function within a request context
 */
export function runWithContext<T>(
  context: Omit<RequestContext, 'logger'>,
  fn: () => T
): T {
  const contextLogger = logger.child({
    requestId: context.requestId,
    userId: context.userId,
    sessionId: context.sessionId,
  });

  return requestContext.run(
    { ...context, logger: contextLogger },
    fn
  );
}

/**
 * Get the current request context
 */
export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/**
 * Get the context-aware logger (falls back to base logger)
 */
export function getLogger(): Logger {
  return getContext()?.logger || logger;
}
```

---

## Production Error Monitoring

### Option 1: Sentry (Recommended)

Best-in-class error tracking with Next.js native support, source maps, and performance monitoring.

#### Installation

```bash
bunx @sentry/wizard@latest -i nextjs
```

This creates the configuration files automatically. Customize them as follows:

#### Client Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay for debugging user issues
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
    }),
  ],

  // Filter out common noise
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // Resize observer (benign)
    'ResizeObserver loop',
    // User aborted
    'AbortError',
  ],

  beforeSend(event, hint) {
    // Filter out errors from bot traffic
    const userAgent = event.request?.headers?.['user-agent'];
    if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
      return null;
    }
    return event;
  },
});
```

#### Server Configuration

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],

  beforeSend(event, hint) {
    // Don't send operational errors
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'isOperational' in error) {
      if ((error as AppError).isOperational) {
        return null;
      }
    }
    return event;
  },
});
```

#### Integration with Logger

```typescript
// lib/error-reporter.ts
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import { AppError, isAppError } from '@/lib/errors';

interface ErrorContext {
  userId?: string;
  requestId?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Report an error to both logger and Sentry
 */
export function captureError(
  error: Error | AppError | unknown,
  context?: ErrorContext
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Always log locally
  logger.error(
    {
      err: errorObj,
      ...context,
    },
    errorObj.message
  );

  // Send to Sentry in production (skip operational errors)
  if (process.env.NODE_ENV === 'production') {
    if (isAppError(error) && error.isOperational) {
      // Log operational errors as breadcrumbs, not events
      Sentry.addBreadcrumb({
        category: 'operational-error',
        message: error.message,
        level: 'warning',
        data: {
          code: error.code,
          ...error.context,
        },
      });
      return;
    }

    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId });
      }
      if (context?.requestId) {
        scope.setTag('requestId', context.requestId);
      }
      scope.setExtras(context || {});
      Sentry.captureException(errorObj);
    });
  }
}

/**
 * Capture a message (non-error) event
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  logger[level === 'warning' ? 'warn' : level](context, message);

  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setExtras(context || {});
      Sentry.captureMessage(message, level);
    });
  }
}
```

### Option 2: Axiom

Great for log aggregation with excellent Vercel integration and SQL-like querying.

#### Installation

```bash
bun add @axiomhq/pino
```

#### Configuration

```typescript
// lib/logger.ts (Axiom variant)
import pino from 'pino';
import { createWriteStream } from '@axiomhq/pino';

const isDev = process.env.NODE_ENV === 'development';

const streams: pino.StreamEntry[] = [];

// Pretty console in development
if (isDev) {
  streams.push({
    stream: pino.transport({
      target: 'pino-pretty',
      options: { colorize: true },
    }),
  });
}

// Axiom in production
if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
  streams.push({
    stream: createWriteStream({
      dataset: process.env.AXIOM_DATASET,
      token: process.env.AXIOM_TOKEN,
      orgId: process.env.AXIOM_ORG_ID,
    }),
  });
}

// Fallback to stdout if no streams configured
if (streams.length === 0) {
  streams.push({ stream: process.stdout });
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV,
      service: process.env.SERVICE_NAME,
    },
  },
  pino.multistream(streams)
);
```

### Option 3: Self-Hosted (OpenTelemetry + Grafana)

Full observability stack with traces, metrics, and logs.

#### Installation

```bash
bun add @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-logs-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http
```

#### Configuration

```typescript
// instrumentation.ts (Next.js 15+)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export function register() {
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME || 'nextjs-app',
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.0.0',
    environment: process.env.NODE_ENV,
  });

  const sdk = new NodeSDK({
    resource,
    
    traceExporter: new OTLPTraceExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    }),
    
    logRecordProcessor: new SimpleLogRecordProcessor(
      new OTLPLogExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
      })
    ),
    
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      }),
      exportIntervalMillis: 60000,
    }),
    
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
}
```

---

## Environment Configuration

### Environment Variables

```bash
# .env.local (development)
NODE_ENV=development
LOG_LEVEL=debug
SERVICE_NAME=devmultiplier-web

# .env.production (production)
NODE_ENV=production
LOG_LEVEL=info
SERVICE_NAME=devmultiplier-web

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# Axiom (if using)
AXIOM_TOKEN=xapt-xxx
AXIOM_DATASET=nextjs-logs
AXIOM_ORG_ID=your-org

# OpenTelemetry (if using)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Next.js Configuration

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Enable instrumentation hook
  experimental: {
    instrumentationHook: true,
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: 'your-org',
  project: 'your-project',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
```

---

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Install Pino and configure logger (`lib/logger.ts`)
- [ ] Create custom error classes (`lib/errors.ts`)
- [ ] Implement Result pattern (`lib/result.ts`)
- [ ] Create API handler wrapper (`lib/api-handler.ts`)

### Phase 2: Integration

- [ ] Add request logging middleware
- [ ] Implement request context with AsyncLocalStorage
- [ ] Update existing API routes to use wrapper
- [ ] Add logging to database operations

### Phase 3: Production Monitoring

- [ ] Set up Sentry (or alternative)
- [ ] Configure source map uploads
- [ ] Set up alerting rules
- [ ] Test error reporting end-to-end

### Phase 4: Polish

- [ ] Add log rotation for local development
- [ ] Configure log retention policies
- [ ] Create dashboards for key metrics
- [ ] Document runbooks for common errors

---

## Package Summary

### Required Packages

```bash
# Core logging
bun add pino pino-pretty

# Error tracking (choose one)
bun add @sentry/nextjs       # Sentry
# OR
bun add @axiomhq/pino        # Axiom

# Validation
bun add zod

# Dev dependencies
bun add -D @types/pino
```

### Optional Packages

```bash
# OpenTelemetry (full observability)
bun add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node

# Additional utilities
bun add neverthrow            # Alternative Result library with more features
bun add ts-results-es         # Another Result implementation
```

---

## Quick Reference

### Log Levels

| Level | When to Use |
|-------|-------------|
| `fatal` | System is unusable, immediate action required |
| `error` | Error conditions, exceptions, failures |
| `warn` | Warning conditions, deprecated features, retries |
| `info` | Informational messages (request completed, job done) |
| `debug` | Detailed debugging information |
| `trace` | Very detailed tracing (function entry/exit) |

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Not authenticated |
| `AUTHORIZATION_ERROR` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_ERROR` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 502 | Third-party service failed |

---

## Resources

- [Pino Documentation](https://getpino.io/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Axiom Documentation](https://axiom.co/docs)
- [OpenTelemetry JS](https://opentelemetry.io/docs/instrumentation/js/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

*Document Version: 1.0.0*  
*Last Updated: January 2026*  
*Author: DevMultiplier Academy*
