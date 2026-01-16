/**
 * Error Reporter for Production Monitoring
 *
 * This module provides a unified interface for error reporting that can be
 * configured to use different backends (Sentry, Axiom, custom). It integrates
 * with the logger and error classes to provide comprehensive error tracking.
 *
 * @module lib/error-reporter
 *
 * @example
 * ```typescript
 * import { captureError, captureMessage, addBreadcrumb } from '@/lib/error-reporter';
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureError(error, {
 *     userId: session.user.id,
 *     action: 'enrollInCourse',
 *     courseId,
 *   });
 * }
 *
 * // Add breadcrumbs for debugging
 * addBreadcrumb({
 *   category: 'user-action',
 *   message: 'User clicked enroll button',
 *   data: { courseId },
 * });
 * ```
 */

import { logger } from './logger';
import { AppError, isOperationalError } from './errors';
import { getContext } from './request-context';

// =============================================================================
// Types
// =============================================================================

/**
 * Severity levels for error reporting
 */
export type Severity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Context provided to error reporter
 */
export interface ErrorContext {
  /** User identifier */
  userId?: string;

  /** Request identifier */
  requestId?: string;

  /** Action or operation being performed */
  action?: string;

  /** Additional tags for filtering */
  tags?: Record<string, string>;

  /** Extra data for debugging */
  extra?: Record<string, unknown>;

  /** Custom fingerprint for grouping */
  fingerprint?: string[];
}

/**
 * Breadcrumb for tracking user actions
 */
export interface Breadcrumb {
  /** Category of the breadcrumb */
  category: string;

  /** Human-readable message */
  message: string;

  /** Severity level */
  level?: Severity;

  /** Additional data */
  data?: Record<string, unknown>;

  /** Timestamp (defaults to now) */
  timestamp?: Date;
}

/**
 * Configuration for error reporter
 */
export interface ErrorReporterConfig {
  /** Whether to enable reporting (usually only in production) */
  enabled: boolean;

  /** DSN or endpoint for error reporting service */
  dsn?: string;

  /** Environment name */
  environment: string;

  /** Release/version */
  release?: string;

  /** Sample rate for errors (0-1) */
  sampleRate?: number;

  /** Errors to ignore (by message pattern) */
  ignoreErrors?: (string | RegExp)[];
}

// =============================================================================
// Configuration
// =============================================================================

const config: ErrorReporterConfig = {
  enabled: process.env.NODE_ENV === 'production',
  dsn: process.env.SENTRY_DSN || process.env.ERROR_REPORTER_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version,
  sampleRate: 1.0,
  ignoreErrors: [
    // Common browser errors
    /Network request failed/i,
    /Failed to fetch/i,
    /Load failed/i,
    /ResizeObserver loop/i,
    /AbortError/i,
    // Bot/crawler errors
    /bot|crawler|spider/i,
  ],
};

// =============================================================================
// Internal State
// =============================================================================

/** In-memory breadcrumb buffer */
const breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 100;

/** User context */
let userContext: { id?: string; email?: string; [key: string]: unknown } = {};

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Capture an error and report it
 *
 * @example
 * ```typescript
 * try {
 *   await processPayment(order);
 * } catch (error) {
 *   captureError(error, {
 *     userId: user.id,
 *     action: 'processPayment',
 *     extra: { orderId: order.id, amount: order.total },
 *   });
 *   throw error; // Re-throw if needed
 * }
 * ```
 */
export function captureError(error: Error | AppError | unknown, context?: ErrorContext): string {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const eventId = crypto.randomUUID();

  // Get request context if available
  const reqCtx = getContext();
  const fullContext: ErrorContext = {
    requestId: reqCtx?.requestId,
    userId: reqCtx?.userId,
    ...context,
  };

  // Always log locally
  if (isOperationalError(error)) {
    // Operational errors are expected - log as warning
    logger.warn(
      {
        eventId,
        error: (error as AppError).toJSON(),
        ...fullContext,
      },
      `Operational error: ${errorObj.message}`
    );

    // Add as breadcrumb, don't report to monitoring
    addBreadcrumb({
      category: 'operational-error',
      message: errorObj.message,
      level: 'warning',
      data: {
        code: (error as AppError).code,
        ...((error as AppError).context || {}),
      },
    });

    return eventId;
  }

  // Non-operational errors - log as error and report
  logger.error(
    {
      eventId,
      err: errorObj,
      ...fullContext,
    },
    `Error captured: ${errorObj.message}`
  );

  // Check if we should report
  if (!shouldReport(errorObj)) {
    return eventId;
  }

  // Report to monitoring service
  reportToService('error', eventId, errorObj, fullContext);

  return eventId;
}

/**
 * Capture a message (non-error event)
 *
 * @example
 * ```typescript
 * captureMessage('Payment processed successfully', 'info', {
 *   userId: user.id,
 *   extra: { orderId, amount },
 * });
 *
 * captureMessage('High memory usage detected', 'warning', {
 *   extra: { memoryUsage: process.memoryUsage() },
 * });
 * ```
 */
export function captureMessage(message: string, level: Severity = 'info', context?: ErrorContext): string {
  const eventId = crypto.randomUUID();

  // Get request context if available
  const reqCtx = getContext();
  const fullContext: ErrorContext = {
    requestId: reqCtx?.requestId,
    userId: reqCtx?.userId,
    ...context,
  };

  // Log locally
  const logLevel = level === 'warning' ? 'warn' : level === 'fatal' ? 'error' : level;
  logger[logLevel as 'info' | 'warn' | 'error' | 'debug']({ eventId, ...fullContext }, message);

  // Report to monitoring service
  if (config.enabled && (level === 'error' || level === 'fatal' || level === 'warning')) {
    reportToService(level, eventId, message, fullContext);
  }

  return eventId;
}

// =============================================================================
// Context Management
// =============================================================================

/**
 * Set user context for error reporting
 *
 * @example
 * ```typescript
 * // After login
 * setUser({
 *   id: user.id,
 *   email: user.email,
 *   role: user.role,
 * });
 *
 * // On logout
 * setUser({});
 * ```
 */
export function setUser(user: { id?: string; email?: string; [key: string]: unknown }): void {
  userContext = user;

  logger.debug({ userId: user.id }, 'User context set');
}

/**
 * Get current user context
 */
export function getUser(): typeof userContext {
  return userContext;
}

/**
 * Add a tag that will be included with all errors
 *
 * @example
 * ```typescript
 * setTag('feature', 'enrollment');
 * setTag('region', 'us-east-1');
 * ```
 */
const globalTags: Record<string, string> = {};

export function setTag(key: string, value: string): void {
  globalTags[key] = value;
}

/**
 * Get all global tags
 */
export function getTags(): Record<string, string> {
  return { ...globalTags };
}

// =============================================================================
// Breadcrumbs
// =============================================================================

/**
 * Add a breadcrumb for debugging
 *
 * Breadcrumbs create a trail of events leading up to an error.
 *
 * @example
 * ```typescript
 * addBreadcrumb({
 *   category: 'navigation',
 *   message: 'User navigated to /courses',
 *   data: { from: '/dashboard' },
 * });
 *
 * addBreadcrumb({
 *   category: 'api',
 *   message: 'API call to /api/courses',
 *   level: 'info',
 *   data: { method: 'GET', status: 200 },
 * });
 *
 * addBreadcrumb({
 *   category: 'user-action',
 *   message: 'User clicked enroll button',
 *   data: { courseId },
 * });
 * ```
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  const entry: Breadcrumb = {
    ...breadcrumb,
    level: breadcrumb.level || 'info',
    timestamp: breadcrumb.timestamp || new Date(),
  };

  breadcrumbs.push(entry);

  // Keep buffer size limited
  while (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }

  logger.trace({ breadcrumb: entry }, 'Breadcrumb added');
}

/**
 * Get all breadcrumbs
 */
export function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbs];
}

/**
 * Clear all breadcrumbs
 */
export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}

// =============================================================================
// Scoped Error Handling
// =============================================================================

/**
 * Create a scoped error handler for a specific domain
 *
 * @example
 * ```typescript
 * const enrollmentErrors = createScope('enrollment');
 *
 * try {
 *   await createEnrollment(data);
 * } catch (error) {
 *   enrollmentErrors.capture(error, { courseId, userId });
 * }
 * ```
 */
export function createScope(name: string) {
  return {
    capture: (error: unknown, context?: ErrorContext) =>
      captureError(error, {
        ...context,
        tags: { ...context?.tags, scope: name },
      }),

    message: (message: string, level: Severity = 'info', context?: ErrorContext) =>
      captureMessage(message, level, {
        ...context,
        tags: { ...context?.tags, scope: name },
      }),

    breadcrumb: (breadcrumb: Omit<Breadcrumb, 'category'>) =>
      addBreadcrumb({
        ...breadcrumb,
        category: name,
      }),
  };
}

// =============================================================================
// Error Boundary Helper
// =============================================================================

/**
 * Wrap an async function with error capturing
 *
 * @example
 * ```typescript
 * const safeFetch = withErrorCapture(
 *   async (url: string) => {
 *     const response = await fetch(url);
 *     return response.json();
 *   },
 *   { action: 'fetchData' }
 * );
 *
 * const data = await safeFetch('/api/data');
 * ```
 */
export function withErrorCapture<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, context?: ErrorContext): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error, context);
      throw error;
    }
  };
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Check if an error should be reported
 */
function shouldReport(error: Error): boolean {
  if (!config.enabled) {
    return false;
  }

  // Check ignore patterns
  for (const pattern of config.ignoreErrors || []) {
    if (typeof pattern === 'string' && error.message.includes(pattern)) {
      return false;
    }
    if (pattern instanceof RegExp && pattern.test(error.message)) {
      return false;
    }
  }

  // Sample rate
  if (config.sampleRate !== undefined && config.sampleRate < 1) {
    return Math.random() < config.sampleRate;
  }

  return true;
}

/**
 * Report to external monitoring service
 *
 * This is a placeholder that can be implemented with Sentry, Axiom, etc.
 */
function reportToService(type: 'error' | Severity, eventId: string, _payload: Error | string, context: ErrorContext): void {
  // If Sentry is available, use it
  // This is a placeholder - actual implementation would use:
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureException(error) or Sentry.captureMessage(message)

  // For now, we just log that we would report
  if (config.dsn) {
    logger.debug(
      {
        eventId,
        type,
        service: 'error-reporter',
        dsn: config.dsn.slice(0, 20) + '...',
        user: userContext.id,
        tags: { ...globalTags, ...context.tags },
        breadcrumbCount: breadcrumbs.length,
      },
      `Would report ${type} to monitoring service`
    );
  }

  // In production, this would be:
  // Sentry.withScope((scope) => {
  //   if (context.userId) scope.setUser({ id: context.userId });
  //   if (context.requestId) scope.setTag('requestId', context.requestId);
  //   scope.setTags(globalTags);
  //   scope.setTags(context.tags || {});
  //   scope.setExtras(context.extra || {});
  //   if (context.fingerprint) scope.setFingerprint(context.fingerprint);
  //
  //   if (payload instanceof Error) {
  //     Sentry.captureException(payload);
  //   } else {
  //     Sentry.captureMessage(payload, type as SentryLevel);
  //   }
  // });
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize error reporter with custom config
 *
 * @example
 * ```typescript
 * initErrorReporter({
 *   enabled: process.env.NODE_ENV === 'production',
 *   dsn: process.env.SENTRY_DSN,
 *   sampleRate: 0.5, // Report 50% of errors
 * });
 * ```
 */
export function initErrorReporter(customConfig: Partial<ErrorReporterConfig>): void {
  Object.assign(config, customConfig);

  logger.info(
    {
      enabled: config.enabled,
      environment: config.environment,
      release: config.release,
      sampleRate: config.sampleRate,
    },
    'Error reporter initialized'
  );
}

/**
 * Get current error reporter configuration
 */
export function getErrorReporterConfig(): ErrorReporterConfig {
  return { ...config };
}
