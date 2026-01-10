/**
 * Request Context with AsyncLocalStorage
 *
 * This module provides request-scoped context using Node.js AsyncLocalStorage.
 * It allows propagating request information (like correlation IDs) through
 * async operations without explicitly passing them as parameters.
 *
 * @module lib/request-context
 *
 * @example
 * ```typescript
 * // In middleware or API route entry
 * return runWithContext({ requestId, userId }, async () => {
 *   // All code in this callback has access to the context
 *   const log = getLogger();
 *   log.info('Processing request'); // Automatically includes requestId, userId
 *
 *   await someAsyncOperation();
 *   // Context is still available here
 *
 *   return response;
 * });
 *
 * // Anywhere in the call chain
 * function deepFunction() {
 *   const ctx = getContext();
 *   if (ctx?.userId) {
 *     // Do something with user context
 *   }
 * }
 * ```
 */

import { AsyncLocalStorage } from 'async_hooks';
import { logger, Logger } from './logger';

// =============================================================================
// Types
// =============================================================================

/**
 * Request context data
 */
export interface RequestContext {
  /** Unique request identifier for tracing */
  requestId: string;

  /** Authenticated user ID (if available) */
  userId?: string;

  /** Session ID (if available) */
  sessionId?: string;

  /** Request start time for duration tracking */
  startTime: number;

  /** Request method */
  method?: string;

  /** Request path */
  path?: string;

  /** User locale */
  locale?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;

  /** Context-aware logger instance */
  logger: Logger;
}

/**
 * Input for creating a new context (logger is auto-generated)
 */
export type RequestContextInput = Omit<RequestContext, 'logger' | 'startTime'> & {
  startTime?: number;
};

// =============================================================================
// AsyncLocalStorage Instance
// =============================================================================

/**
 * AsyncLocalStorage instance for request context
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

// =============================================================================
// Context Management
// =============================================================================

/**
 * Run a function within a request context
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await runWithContext({ requestId }, async () => {
 *   return await processRequest();
 * });
 *
 * // With full context
 * const result = runWithContext(
 *   {
 *     requestId: crypto.randomUUID(),
 *     userId: session.user.id,
 *     method: 'GET',
 *     path: '/api/courses',
 *   },
 *   async () => {
 *     const log = getLogger();
 *     log.info('Starting request'); // Logs include requestId, userId
 *     return await getCourses();
 *   }
 * );
 * ```
 */
export function runWithContext<T>(input: RequestContextInput, fn: () => T | Promise<T>): T | Promise<T> {
  // Create context-aware logger
  const contextLogger = logger.child({
    requestId: input.requestId,
    ...(input.userId && { userId: input.userId }),
    ...(input.sessionId && { sessionId: input.sessionId }),
    ...(input.method && { method: input.method }),
    ...(input.path && { path: input.path }),
    ...(input.locale && { locale: input.locale }),
  });

  const context: RequestContext = {
    ...input,
    startTime: input.startTime ?? Date.now(),
    logger: contextLogger,
  };

  return requestContextStorage.run(context, fn);
}

/**
 * Get the current request context
 *
 * @returns The current context or undefined if not in a context
 *
 * @example
 * ```typescript
 * const ctx = getContext();
 * if (ctx) {
 *   console.log(`Request ID: ${ctx.requestId}`);
 *   console.log(`User ID: ${ctx.userId}`);
 *   console.log(`Duration: ${Date.now() - ctx.startTime}ms`);
 * }
 * ```
 */
export function getContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Get the current request context or throw an error
 *
 * @throws Error if not in a request context
 *
 * @example
 * ```typescript
 * const ctx = requireContext();
 * // ctx is guaranteed to exist here
 * ```
 */
export function requireContext(): RequestContext {
  const ctx = getContext();
  if (!ctx) {
    throw new Error('No request context available. Ensure code is running within runWithContext().');
  }
  return ctx;
}

// =============================================================================
// Context Accessors
// =============================================================================

/**
 * Get the context-aware logger
 *
 * Falls back to the base logger if not in a context.
 *
 * @example
 * ```typescript
 * const log = getLogger();
 * log.info({ courseId }, 'Processing enrollment');
 * // If in context, log includes requestId, userId automatically
 * ```
 */
export function getLogger(): Logger {
  return getContext()?.logger ?? logger;
}

/**
 * Get the current request ID
 *
 * @returns Request ID or undefined if not in context
 *
 * @example
 * ```typescript
 * const requestId = getRequestId();
 * // Include in error responses for debugging
 * return Response.json({ error: 'Failed', requestId }, { status: 500 });
 * ```
 */
export function getRequestId(): string | undefined {
  return getContext()?.requestId;
}

/**
 * Get the current user ID
 *
 * @returns User ID or undefined if not in context or not authenticated
 */
export function getUserId(): string | undefined {
  return getContext()?.userId;
}

/**
 * Get the current request duration
 *
 * @returns Duration in milliseconds or 0 if not in context
 */
export function getRequestDuration(): number {
  const ctx = getContext();
  return ctx ? Date.now() - ctx.startTime : 0;
}

// =============================================================================
// Context Modification
// =============================================================================

/**
 * Update the current context with new values
 *
 * Note: This creates a new context in the storage, so it only affects
 * code that runs after this call within the same async context.
 *
 * @example
 * ```typescript
 * // After authentication
 * updateContext({ userId: session.user.id });
 * ```
 */
export function updateContext(updates: Partial<RequestContextInput>): void {
  const current = getContext();
  if (!current) {
    logger.warn('updateContext called outside of request context');
    return;
  }

  // Create new logger with updated bindings
  const newLogger = logger.child({
    requestId: updates.requestId ?? current.requestId,
    ...((updates.userId ?? current.userId) ? { userId: updates.userId ?? current.userId } : {}),
    ...((updates.sessionId ?? current.sessionId) ? { sessionId: updates.sessionId ?? current.sessionId } : {}),
    ...((updates.method ?? current.method) ? { method: updates.method ?? current.method } : {}),
    ...((updates.path ?? current.path) ? { path: updates.path ?? current.path } : {}),
    ...((updates.locale ?? current.locale) ? { locale: updates.locale ?? current.locale } : {}),
  });

  // Note: We can't actually update the AsyncLocalStorage store in place,
  // but we can mutate the object reference
  Object.assign(current, {
    ...updates,
    logger: newLogger,
    metadata: { ...current.metadata, ...updates.metadata },
  });
}

/**
 * Add metadata to the current context
 *
 * @example
 * ```typescript
 * addContextMetadata({ courseId, action: 'enroll' });
 * ```
 */
export function addContextMetadata(metadata: Record<string, unknown>): void {
  const ctx = getContext();
  if (ctx) {
    ctx.metadata = { ...ctx.metadata, ...metadata };
  }
}

// =============================================================================
// Middleware Helper
// =============================================================================

/**
 * Create a middleware function that sets up request context
 *
 * @example
 * ```typescript
 * // In Next.js middleware
 * export function middleware(request: NextRequest) {
 *   const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
 *
 *   return withRequestContext(
 *     { requestId, method: request.method, path: request.nextUrl.pathname },
 *     () => {
 *       // Your middleware logic here
 *       return NextResponse.next();
 *     }
 *   );
 * }
 * ```
 */
export function withRequestContext<T>(input: RequestContextInput, fn: () => T | Promise<T>): T | Promise<T> {
  return runWithContext(input, fn);
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Check if currently running within a request context
 */
export function hasContext(): boolean {
  return getContext() !== undefined;
}

/**
 * Execute a function with isolated context (for testing or parallel operations)
 *
 * @example
 * ```typescript
 * // Run parallel operations with their own contexts
 * const results = await Promise.all([
 *   isolatedContext({ requestId: 'req-1' }, () => processItem(item1)),
 *   isolatedContext({ requestId: 'req-2' }, () => processItem(item2)),
 * ]);
 * ```
 */
export function isolatedContext<T>(input: RequestContextInput, fn: () => T | Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    runWithContext(input, async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Create a context snapshot for logging or debugging
 *
 * @example
 * ```typescript
 * const snapshot = getContextSnapshot();
 * logger.debug({ context: snapshot }, 'Context state');
 * ```
 */
export function getContextSnapshot(): Omit<RequestContext, 'logger'> | null {
  const ctx = getContext();
  if (!ctx) return null;

   
  const { logger: _, ...snapshot } = ctx;
  return {
    ...snapshot,
    duration: Date.now() - ctx.startTime,
  } as Omit<RequestContext, 'logger'>;
}
