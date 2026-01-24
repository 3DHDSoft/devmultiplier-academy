# Error Handling & Logging Implementation Guide

> Implementation documentation for the structured error handling and logging system in DevMultiplier Academy.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Error Classes](#error-classes)
- [Result Pattern](#result-pattern)
- [Structured Logging](#structured-logging)
- [API Route Handlers](#api-route-handlers)
- [Server Actions](#server-actions)
- [Request Context](#request-context)
- [Error Reporting](#error-reporting)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Overview

The error handling system provides:

| Feature                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| **Type-safe errors**   | Custom error classes with TypeScript integration |
| **Result pattern**     | No-throw error handling inspired by Rust         |
| **Structured logging** | Environment-aware JSON/pretty logging            |
| **Request tracing**    | Correlation IDs via AsyncLocalStorage            |
| **API wrappers**       | Consistent error handling for routes             |
| **Action wrappers**    | Server action error handling                     |
| **Error reporting**    | Sentry-ready error capture                       |

### File Structure

```
📦 apps/web/src/lib/
├── 📄 errors.ts              # Custom error class hierarchy
├── 📄 result.ts              # Result pattern (no-throw)
├── 📄 logger.ts              # Structured logging
├── 📄 api-handler.ts         # API route wrapper
├── 📄 request-context.ts     # AsyncLocalStorage context
├── 📄 action-wrapper.ts      # Server action wrapper
├── 📄 error-reporter.ts      # Error monitoring integration
└── 📄 error-handling.ts      # Unified exports

Legend: 📦 Directory | 📄 File
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌─────────────────┐    ┌──────────────────┐   │
│  │ Request  │───▶│ withErrorHandling│───▶│ Route Handler    │   │
│  └──────────┘    └─────────────────┘    └──────────────────┘   │
│       │                  │                       │              │
│       │                  ▼                       ▼              │
│       │         ┌───────────────┐       ┌──────────────┐       │
│       │         │ Request       │       │ Business     │       │
│       │         │ Context       │       │ Logic        │       │
│       │         │ (requestId,   │       │              │       │
│       │         │  userId)      │       │ throw errors │       │
│       │         └───────────────┘       └──────────────┘       │
│       │                  │                       │              │
│       │                  ▼                       ▼              │
│       │         ┌───────────────┐       ┌──────────────┐       │
│       │         │ Logger        │◀──────│ AppError     │       │
│       │         │ (structured)  │       │ Classes      │       │
│       │         └───────────────┘       └──────────────┘       │
│       │                  │                       │              │
│       │                  ▼                       ▼              │
│       │         ┌───────────────┐       ┌──────────────┐       │
│       └────────▶│ Response      │◀──────│ Error        │       │
│                 │ (JSON + ID)   │       │ Reporter     │       │
│                 └───────────────┘       └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Classes

### Import

```typescript
import { AppError, ValidationError, NotFoundError, AuthenticationError, AuthorizationError, ConflictError, RateLimitError, DatabaseError, ExternalServiceError, ConfigurationError, BusinessError, isAppError, isOperationalError, fromPrismaError } from '@/lib/errors';
```

### Error Hierarchy

| Error Class            | Code                     | HTTP | Operational | Use Case                 |
| ---------------------- | ------------------------ | ---- | ----------- | ------------------------ |
| `ValidationError`      | `VALIDATION_ERROR`       | 400  | Yes         | Invalid user input       |
| `AuthenticationError`  | `AUTHENTICATION_ERROR`   | 401  | Yes         | Not logged in            |
| `AuthorizationError`   | `AUTHORIZATION_ERROR`    | 403  | Yes         | Insufficient permissions |
| `NotFoundError`        | `NOT_FOUND`              | 404  | Yes         | Resource doesn't exist   |
| `ConflictError`        | `CONFLICT`               | 409  | Yes         | Resource already exists  |
| `RateLimitError`       | `RATE_LIMIT_ERROR`       | 429  | Yes         | Too many requests        |
| `BusinessError`        | `BUSINESS_ERROR`         | 422  | Yes         | Business rule violation  |
| `DatabaseError`        | `DATABASE_ERROR`         | 500  | No          | Database failures        |
| `ExternalServiceError` | `EXTERNAL_SERVICE_ERROR` | 502  | No          | Third-party API failures |
| `ConfigurationError`   | `CONFIGURATION_ERROR`    | 500  | No          | Missing config/env       |

### Operational vs Non-Operational

- **Operational errors**: Expected errors that are safe to show to users (validation, not found, etc.)
- **Non-operational errors**: System failures that should be logged but not exposed (database down, etc.)

### Usage Examples

```typescript
// Validation error with field details
throw new ValidationError('Invalid input', {
  email: ['Must be a valid email address'],
  password: ['Must be at least 8 characters'],
});

// Not found with identifier
throw new NotFoundError('Course', courseId);

// Authorization
throw new AuthorizationError('Admin access required');

// Conflict
throw new ConflictError('Email already registered');

// Database error (non-operational)
throw new DatabaseError('Connection timeout', { host: 'db.example.com' });

// External service error
throw new ExternalServiceError('Stripe', 'Payment failed', { paymentId });
```

### Prisma Error Mapping

```typescript
import { fromPrismaError } from '@/lib/errors';

try {
  await prisma.users.create({ data });
} catch (error) {
  // Automatically maps P2002 → ConflictError, P2025 → NotFoundError, etc.
  throw fromPrismaError(error);
}
```

---

## Result Pattern

The Result pattern provides type-safe error handling without exceptions.

### Import

```typescript
import { ok, err, Result, AsyncResult, tryCatch, tryCatchPrisma, unwrap, unwrapOr, map, andThen, all, fromNullable } from '@/lib/result';
```

### Basic Usage

```typescript
// Return a successful result
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return err(new ValidationError('Cannot divide by zero'));
  }
  return ok(a / b);
}

// Handle the result
const result = divide(10, 2);
if (result.success) {
  console.log(result.data); // 5
} else {
  console.log(result.error.message); // Error message
}
```

### Async Operations

```typescript
async function getUserById(id: string): Promise<Result<User>> {
  // Wrap async operation with automatic error handling
  const result = await tryCatch(
    () => prisma.users.findUnique({ where: { id } }),
    (error) => new DatabaseError('Failed to fetch user', { error })
  );

  if (!result.success) return result;
  if (!result.data) return err(new NotFoundError('User', id));

  return ok(result.data);
}

// For Prisma specifically
const result = await tryCatchPrisma(() => prisma.users.findUnique({ where: { id } }));
```

### Transformations

```typescript
// Map success value
const nameResult = map(userResult, (user) => user.name);

// Chain operations
const enrollmentResult = await andThen(await getUserById(userId), async (user) => getEnrollmentsByUserId(user.id));

// Combine multiple results
const [user, course] = unwrap(all([await getUserById(userId), await getCourseById(courseId)]));
```

### Unwrapping

```typescript
// Throw if error (use with withErrorHandling wrapper)
const user = unwrap(await getUserById(id));

// Return default value
const settings = unwrapOr(await getSettings(userId), defaultSettings);

// Convert nullable to Result
const user = await prisma.users.findUnique({ where: { id } });
const result = fromNullable(user, new NotFoundError('User', id));
```

---

## Structured Logging

### Import

```typescript
import { logger, dbLogger, apiLogger, authLogger, createRequestLogger, createModuleLogger, measureDuration } from '@/lib/logger';
```

### Log Levels

| Level   | Value | Use Case                                   |
| ------- | ----- | ------------------------------------------ |
| `fatal` | 60    | System unusable, immediate action required |
| `error` | 50    | Error conditions, exceptions               |
| `warn`  | 40    | Warning conditions, operational errors     |
| `info`  | 30    | Informational (request completed)          |
| `debug` | 20    | Detailed debugging                         |
| `trace` | 10    | Very detailed tracing                      |

### Basic Usage

```typescript
// Simple logging
logger.info('Server started');
logger.error({ err: error }, 'Failed to process request');

// With context
logger.info({ userId, action: 'login' }, 'User logged in');

// Module-specific loggers
dbLogger.debug({ query, duration }, 'Query executed');
authLogger.warn({ userId, attempts: 3 }, 'Multiple failed login attempts');
```

### Request-Scoped Logging

```typescript
// Create logger with request context
const log = createRequestLogger(requestId, { userId, path: '/api/courses' });

log.info('Processing request');
log.debug({ courseId }, 'Fetching course');
log.error({ err: error }, 'Request failed');
// All logs include requestId and userId automatically
```

### Duration Measurement

```typescript
const { result, duration } = await measureDuration(() => prisma.courses.findMany(), dbLogger, 'Fetched courses');
// Logs: "Fetched courses" with duration in ms
```

### Environment Behavior

| Environment | Output  | Format                     |
| ----------- | ------- | -------------------------- |
| Development | Console | Pretty-printed with colors |
| Production  | Console | JSON (for log aggregators) |
| Test        | Silent  | No output                  |

### Sensitive Data Redaction

The logger automatically redacts:

- `password`, `token`, `apiKey`, `secret`
- `*.password`, `*.token` (nested)
- `req.headers.authorization`, `req.headers.cookie`

---

## API Route Handlers

### Import

```typescript
import { withErrorHandling, withAuth, createHandlers } from '@/lib/api-handler';
```

### Basic Usage

```typescript
// Before (manual error handling)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// After (with wrapper)
export const GET = withErrorHandling(
  async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AuthenticationError();
    }
    const data = await fetchData();
    return NextResponse.json(data);
  },
  { route: '/api/data' }
);
```

### Features

The `withErrorHandling` wrapper provides:

- **Request ID**: Auto-generates and includes in response headers
- **Logging**: Logs request start, completion, and errors
- **Metrics**: Records HTTP metrics via OpenTelemetry
- **Error handling**: Catches and formats all error types
- **Zod validation**: Automatically handles ZodError
- **Prisma errors**: Maps Prisma error codes

### Options

```typescript
interface ApiHandlerOptions {
  route?: string; // Route path for metrics
  logSuccess?: boolean; // Log successful requests (default: true)
  logRequestBody?: boolean; // Log request body (default: false)
  includeRequestId?: boolean; // Include x-request-id header (default: true)
}
```

### With Authentication

```typescript
export const GET = withAuth(
  async (request, context, session) => {
    // session.user.id is guaranteed to exist
    const enrollments = await getEnrollments(session.user.id);
    return NextResponse.json({ data: enrollments });
  },
  { route: '/api/enrollments' }
);
```

### Multiple Handlers

```typescript
const { GET, POST, DELETE } = createHandlers(
  {
    GET: async () => {
      const items = await getItems();
      return NextResponse.json({ data: items });
    },
    POST: async (request) => {
      const body = await request.json();
      const item = await createItem(body);
      return NextResponse.json({ data: item }, { status: 201 });
    },
    DELETE: async (request, context) => {
      const { id } = await context!.params;
      await deleteItem(id);
      return new Response(null, { status: 204 });
    },
  },
  { route: '/api/items' }
);

export { GET, POST, DELETE };
```

---

## Server Actions

### Import

```typescript
import { createAction, createPublicAction, createFormAction, ActionResult } from '@/lib/action-wrapper';
```

### Basic Usage

```typescript
// Define an authenticated action
export const enrollInCourse = createAction(
  'enrollInCourse',
  z.object({
    courseId: z.string().uuid(),
  }),
  async ({ courseId }, { userId, logger }) => {
    logger.info({ courseId }, 'Creating enrollment');

    const enrollment = await prisma.enrollments.create({
      data: {
        userId,
        courseId,
        status: 'active',
      },
    });

    return enrollment;
  }
);

// Use in component
const result = await enrollInCourse({ courseId: '...' });

if (result.success) {
  toast.success('Enrolled successfully!');
  // result.data contains the enrollment
} else {
  toast.error(result.error);
  // result.code contains the error code
  // result.details contains field errors (if validation)
}
```

### Public Actions (No Auth)

```typescript
export const submitContactForm = createPublicAction(
  'submitContactForm',
  z.object({
    email: z.string().email(),
    message: z.string().min(10).max(1000),
  }),
  async ({ email, message }, logger) => {
    logger.info({ email }, 'Contact form submitted');
    await sendEmail({ to: 'support@example.com', from: email, body: message });
    return { sent: true };
  }
);
```

### Form Actions

```typescript
export const updateProfileAction = createFormAction(
  'updateProfile',
  z.object({
    name: z.string().min(1),
    bio: z.string().optional(),
  }),
  async (data, { userId }) => {
    await prisma.users.update({
      where: { id: userId },
      data,
    });
    return { updated: true };
  }
);

// In form
<form action={updateProfileAction}>
  <input name="name" />
  <textarea name="bio" />
  <button type="submit">Save</button>
</form>
```

### Action Context

```typescript
interface ActionContext {
  userId: string; // Authenticated user ID
  email: string; // User email
  locale: string; // User locale
  logger: Logger; // Action-scoped logger
  actionId: string; // Unique action ID for tracing
}
```

---

## Request Context

### Import

```typescript
import { runWithContext, getContext, getLogger, getRequestId, getUserId } from '@/lib/request-context';
```

### Usage

```typescript
// Wrap code in a context
const result = await runWithContext(
  {
    requestId: crypto.randomUUID(),
    userId: session.user.id,
    method: 'POST',
    path: '/api/enrollments',
  },
  async () => {
    // All code here has access to the context
    const log = getLogger();
    log.info('Processing...'); // Includes requestId, userId

    await someOperation();

    return result;
  }
);

// Access context anywhere in the call chain
function deepFunction() {
  const requestId = getRequestId();
  const userId = getUserId();
  const log = getLogger();

  log.debug({ operation: 'deep' }, 'Doing something');
}
```

---

## Error Reporting

### Import

```typescript
import { captureError, captureMessage, addBreadcrumb, setUser, createScope } from '@/lib/error-reporter';
```

### Capturing Errors

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Capture with context
  captureError(error, {
    userId: session.user.id,
    action: 'processPayment',
    extra: { orderId, amount },
  });

  // Re-throw or handle
  throw error;
}
```

### Breadcrumbs

```typescript
// Track user actions leading up to errors
addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  data: { from: '/cart' },
});

addBreadcrumb({
  category: 'user-action',
  message: 'User clicked submit payment',
  data: { paymentMethod: 'card' },
});

// When error occurs, breadcrumbs show the trail
```

### Scoped Error Handling

```typescript
const enrollmentErrors = createScope('enrollment');

try {
  await createEnrollment(data);
} catch (error) {
  enrollmentErrors.capture(error, { courseId, userId });
}

enrollmentErrors.breadcrumb({
  message: 'User started enrollment flow',
  data: { courseId },
});
```

### User Context

```typescript
// After login
setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

// All captured errors will include user info
```

---

## Migration Guide

### Migrating API Routes

**Before:**

```typescript
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await prisma.items.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**

```typescript
import { withErrorHandling } from '@/lib/api-handler';
import { AuthenticationError } from '@/lib/errors';

export const GET = withErrorHandling(
  async () => {
    const session = await auth();
    if (!session?.user?.email) {
      throw new AuthenticationError();
    }

    const data = await prisma.items.findMany();
    return NextResponse.json(data);
  },
  { route: '/api/items' }
);
```

### Migrating Service Functions

**Before:**

```typescript
async function getUser(id: string): Promise<User> {
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
```

**After:**

```typescript
import { ok, err, Result, tryCatchPrisma } from '@/lib/result';
import { NotFoundError } from '@/lib/errors';

async function getUser(id: string): Promise<Result<User>> {
  const result = await tryCatchPrisma(() => prisma.users.findUnique({ where: { id } }));

  if (!result.success) return result;
  if (!result.data) return err(new NotFoundError('User', id));

  return ok(result.data);
}
```

---

## Best Practices

### Do

- Use custom error classes instead of generic `Error`
- Use Result pattern for service functions
- Include correlation IDs in all logs
- Log operational errors as warnings, not errors
- Return generic messages for non-operational errors
- Use module-specific loggers (`dbLogger`, `authLogger`, etc.)
- Add breadcrumbs for important user actions

### Don't

- Don't expose stack traces to clients
- Don't log passwords, tokens, or API keys
- Don't throw generic `Error` - use specific classes
- Don't ignore error handling in async functions
- Don't use `console.log` - use the logger
- Don't send operational errors to Sentry (they're expected)

### Error Response Format

All error responses follow this format:

```typescript
// Validation error
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Must be a valid email address"]
  }
}

// Operational error
{
  "error": "Course not found: abc-123",
  "code": "NOT_FOUND"
}

// Internal error (non-operational)
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "req-xyz-789"  // For support reference
}
```

---

## Environment Variables

```bash
# Logging
LOG_LEVEL=debug              # trace, debug, info, warn, error, fatal
SERVICE_NAME=devmultiplier-web

# Error Reporting (optional)
SENTRY_DSN=https://...@sentry.io/...
ERROR_REPORTER_DSN=...       # Alternative to Sentry
```

---

## Quick Reference

### Imports Cheat Sheet

```typescript
// Everything from one import
import {
  // Errors
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  isAppError,
  isOperationalError,
  fromPrismaError,

  // Result
  ok,
  err,
  tryCatch,
  tryCatchPrisma,
  unwrap,
  unwrapOr,

  // Logging
  logger,
  dbLogger,
  apiLogger,
  createRequestLogger,

  // API
  withErrorHandling,
  withAuth,

  // Actions
  createAction,
  createPublicAction,

  // Context
  runWithContext,
  getLogger,
  getRequestId,

  // Reporting
  captureError,
  addBreadcrumb,
} from '@/lib/error-handling';
```

---

_Document Version: 1.0.0_ _Last Updated: January 2025_ _Author: DevMultiplier Academy_
