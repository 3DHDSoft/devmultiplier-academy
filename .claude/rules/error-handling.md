# Error Handling Rules

These rules apply to error handling, logging, and observability patterns.

## Custom Error Classes

### Import from lib/errors.ts

```typescript
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  isAppError,
  isOperationalError,
} from '@/lib/errors';
```

### Error Hierarchy

| Error Class | Code | HTTP | Operational |
|-------------|------|------|-------------|
| `ValidationError` | `VALIDATION_ERROR` | 400 | Yes |
| `AuthenticationError` | `AUTHENTICATION_ERROR` | 401 | Yes |
| `AuthorizationError` | `AUTHORIZATION_ERROR` | 403 | Yes |
| `NotFoundError` | `NOT_FOUND` | 404 | Yes |
| `RateLimitError` | `RATE_LIMIT_ERROR` | 429 | Yes |
| `DatabaseError` | `DATABASE_ERROR` | 500 | No |
| `ExternalServiceError` | `EXTERNAL_SERVICE_ERROR` | 502 | No |

### Usage Patterns

```typescript
// Validation errors - safe to show to users
throw new ValidationError('Invalid email format', {
  email: ['Must be a valid email address'],
});

// Not found - include resource type
throw new NotFoundError('Course', courseId);

// Database errors - non-operational, logged fully
throw new DatabaseError('Failed to update user', { userId, originalError: error });
```

## Result Pattern

### Prefer Result Over Throw

```typescript
import { ok, err, Result, tryCatch, unwrap } from '@/lib/result';

// Return Result instead of throwing
async function getUser(id: string): Promise<Result<User, AppError>> {
  const result = await tryCatch(
    () => prisma.users.findUnique({ where: { id } }),
    (error) => new DatabaseError('Failed to fetch user', { originalError: error })
  );

  if (!result.success) return result;
  if (!result.data) return err(new NotFoundError('User', id));

  return ok(result.data);
}

// Handle results explicitly
const result = await getUser(id);
if (!result.success) {
  logger.warn({ error: result.error }, 'Failed to get user');
  return Response.json({ error: result.error.message }, { status: result.error.statusCode });
}
// result.data is typed as User
```

## API Route Error Handling

### Use withErrorHandling Wrapper

```typescript
import { withErrorHandling } from '@/lib/api-handler';

export const GET = withErrorHandling(async (request, context) => {
  const { id } = await context!.params;
  const result = await getUserById(id);
  const user = unwrap(result); // Throws if error, caught by wrapper
  return NextResponse.json(user);
});
```

### Manual Error Handling

```typescript
try {
  // Route logic
} catch (error) {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return Response.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, { status: 400 });
  }

  // Operational errors (safe to show)
  if (isOperationalError(error)) {
    return Response.json({
      error: error.message,
      code: error.code,
    }, { status: error.statusCode });
  }

  // Unknown errors (log full details, return generic message)
  console.error('API error:', error);
  return Response.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  }, { status: 500 });
}
```

## Logging with Pino

### Logger Import

```typescript
import { logger, dbLogger, apiLogger, authLogger } from '@/lib/logger';
import { createRequestLogger } from '@/lib/logger';
```

### Log Levels

| Level | Use Case |
|-------|----------|
| `fatal` | System unusable, immediate action |
| `error` | Exceptions, failures |
| `warn` | Deprecated features, retries, operational errors |
| `info` | Request completed, job done |
| `debug` | Detailed debugging |
| `trace` | Function entry/exit |

### Logging Patterns

```typescript
// Structured logging with context
logger.info({ userId, action: 'login' }, 'User logged in');

// Error logging
logger.error({ err: error, requestId }, 'Database query failed');

// Child loggers for modules
const log = logger.child({ module: 'enrollment', requestId });
log.info({ courseId }, 'Processing enrollment');

// Request-scoped logger
const requestLog = createRequestLogger(requestId, { userId });
requestLog.debug({ payload }, 'Request received');
```

### Never Log Sensitive Data

```typescript
// Automatic redaction configured in logger
// But still be careful with:
logger.info({ email }, 'User registered'); // OK
logger.info({ password }, 'Login attempt'); // Never do this
logger.info({ password: '[REDACTED]' }, 'Login attempt'); // If needed
```

## Error Reporter (Sentry)

### Capture Non-Operational Errors

```typescript
import { captureError, captureMessage } from '@/lib/error-reporter';

// Capture unexpected errors
try {
  await riskyOperation();
} catch (error) {
  captureError(error, { userId, action: 'risky-operation' });
}

// Capture important events
captureMessage('Payment processed', 'info', { amount, userId });
```

### Error vs Breadcrumb

```typescript
// Non-operational errors → Sentry event
if (!isOperationalError(error)) {
  Sentry.captureException(error);
}

// Operational errors → Breadcrumb only
Sentry.addBreadcrumb({
  category: 'operational-error',
  message: error.message,
  level: 'warning',
  data: { code: error.code },
});
```

## Request Context

### Correlation IDs

```typescript
import { runWithContext, getContext, getLogger } from '@/lib/request-context';

// In middleware or route handler
runWithContext({ requestId, userId, sessionId }, async () => {
  // All logs in this context include requestId, userId
  const log = getLogger();
  log.info('Processing request');
});
```

### Response Headers

```typescript
// Always include request ID in responses
response.headers.set('x-request-id', requestId);

// Return in error responses for support
return Response.json({
  error: 'Internal server error',
  requestId, // For user to reference
}, { status: 500 });
```

## Server Actions

### Use Action Wrapper

```typescript
import { withActionLogging } from '@/lib/action-wrapper';

const enrollInCourse = withActionLogging(
  'enrollInCourse',
  async ({ userId, courseId }) => {
    // Implementation
    return enrollment;
  }
);

// Returns ActionResult<T>
const result = await enrollInCourse({ userId, courseId });
if (!result.success) {
  toast.error(result.error);
}
```

## Best Practices

### Do

- Use custom error classes for type-safe errors
- Prefer Result pattern over throw in services
- Use `withErrorHandling` wrapper for API routes
- Include correlation IDs in all logs
- Log operational errors as warnings, not errors
- Return generic messages for non-operational errors
- Configure sensitive data redaction

### Don't

- Don't expose stack traces to clients
- Don't log passwords, tokens, or API keys
- Don't throw generic `Error` - use specific classes
- Don't ignore error handling in async functions
- Don't use console.log - use logger
- Don't send operational errors to Sentry
