/**
 * Error Handling & Logging - Unified Exports
 *
 * This module re-exports all error handling, logging, and result utilities
 * from a single entry point for convenience.
 *
 * @module lib/error-handling
 *
 * @example
 * ```typescript
 * import {
 *   // Errors
 *   AppError,
 *   NotFoundError,
 *   AuthenticationError,
 *   ValidationError,
 *   isAppError,
 *   isOperationalError,
 *
 *   // Result pattern
 *   ok,
 *   err,
 *   tryCatch,
 *   unwrap,
 *
 *   // Logging
 *   logger,
 *   createRequestLogger,
 *
 *   // API handler
 *   withErrorHandling,
 *
 *   // Server actions
 *   createAction,
 *
 *   // Error reporting
 *   captureError,
 *   addBreadcrumb,
 *
 *   // Request context
 *   runWithContext,
 *   getLogger,
 * } from '@/lib/error-handling';
 * ```
 */

// =============================================================================
// Error Classes
// =============================================================================

export {
  // Base class
  AppError,

  // Client errors (4xx)
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  BusinessError,

  // Server errors (5xx)
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,

  // Type guards
  isAppError,
  isOperationalError,
  isSystemError,

  // Utilities
  fromPrismaError,
  toAppError,

  // Constants
  ErrorCodes,

  // Types
  type ErrorCode,
} from './errors';

// =============================================================================
// Result Pattern
// =============================================================================

export {
  // Constructors
  ok,
  err,

  // Async helpers
  tryCatch,
  tryCatchSync,
  tryCatchPrisma,

  // Unwrapping
  unwrap,
  unwrapOr,
  unwrapOrElse,

  // Transformations
  map,
  mapErr,
  andThen,
  andThenSync,

  // Combinators
  all,
  allAsync,
  firstSuccess,

  // Type guards
  isOk,
  isErr,

  // Helpers
  fromNullable,
  withLogging,

  // Types
  type Result,
  type AsyncResult,
} from './result';

// =============================================================================
// Logging
// =============================================================================

export {
  // Main logger
  logger,

  // Module loggers
  dbLogger,
  apiLogger,
  authLogger,
  cacheLogger,
  emailLogger,
  externalLogger,

  // Factory functions
  createRequestLogger,
  createModuleLogger,

  // Utilities
  measureDuration,
  startTimer,

  // Constants
  LogLevels,

  // Types
  type Logger,
  type LogLevel,
} from './logger';

// =============================================================================
// API Handler
// =============================================================================

export {
  // Main wrapper
  withErrorHandling,

  // Convenience wrappers
  withAuth,
  createHandlers,

  // Types
  type ApiHandler,
  type ApiHandlerWithLogger,
  type ApiHandlerOptions,
  type RouteContext,
} from './api-handler';

// =============================================================================
// Server Actions
// =============================================================================

export {
  // Core wrapper
  withActionLogging,

  // Action creators
  createAction,
  createPublicAction,
  createFormAction,

  // Type guards
  isActionSuccess,
  isActionFailure,

  // Unwrapping
  unwrapAction,
  unwrapActionOr,

  // Types
  type ActionResult,
  type ActionSuccess,
  type ActionFailure,
  type ActionContext,
  type ActionHandler,
  type ActionOptions,
} from './action-wrapper';

// =============================================================================
// Request Context
// =============================================================================

export {
  // Context management
  runWithContext,
  getContext,
  requireContext,
  updateContext,
  addContextMetadata,

  // Accessors
  getLogger,
  getRequestId,
  getUserId,
  getRequestDuration,

  // Utilities
  hasContext,
  isolatedContext,
  getContextSnapshot,
  withRequestContext,

  // Storage
  requestContextStorage,

  // Types
  type RequestContext,
  type RequestContextInput,
} from './request-context';

// =============================================================================
// Error Reporter
// =============================================================================

export {
  // Core functions
  captureError,
  captureMessage,

  // Context management
  setUser,
  getUser,
  setTag,
  getTags,

  // Breadcrumbs
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,

  // Scoped error handling
  createScope,

  // Utilities
  withErrorCapture,

  // Configuration
  initErrorReporter,
  getErrorReporterConfig,

  // Types
  type Severity,
  type ErrorContext,
  type Breadcrumb,
  type ErrorReporterConfig,
} from './error-reporter';
