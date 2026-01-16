/**
 * Server Action Error Handler Wrapper
 *
 * This module provides wrappers for Next.js Server Actions with consistent
 * error handling, logging, and type-safe results.
 *
 * @module lib/action-wrapper
 *
 * @example
 * ```typescript
 * // Define the action
 * export const enrollInCourse = createAction(
 *   'enrollInCourse',
 *   z.object({
 *     courseId: z.string().uuid(),
 *   }),
 *   async ({ courseId }, { userId }) => {
 *     const enrollment = await prisma.enrollments.create({
 *       data: { userId, courseId },
 *     });
 *     return enrollment;
 *   }
 * );
 *
 * // Use in a component
 * const result = await enrollInCourse({ courseId });
 * if (result.success) {
 *   toast.success('Enrolled successfully');
 * } else {
 *   toast.error(result.error);
 * }
 * ```
 */

'use server';

import { z, ZodSchema, ZodError } from 'zod';
import { logger, Logger } from './logger';
import { AppError, isOperationalError, isAppError, AuthenticationError } from './errors';

// =============================================================================
// Types
// =============================================================================

/**
 * Success result from an action
 */
export type ActionSuccess<T> = {
  success: true;
  data: T;
};

/**
 * Failure result from an action
 */
export type ActionFailure = {
  success: false;
  error: string;
  code: string;
  details?: Record<string, string[]>;
};

/**
 * Combined action result type
 */
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

/**
 * Action context provided to handlers
 */
export interface ActionContext {
  /** Authenticated user ID */
  userId: string;

  /** User email */
  email: string;

  /** User locale */
  locale: string;

  /** Action-scoped logger */
  logger: Logger;

  /** Action ID for tracing */
  actionId: string;
}

/**
 * Action handler function type
 */
export type ActionHandler<TInput, TOutput> = (input: TInput, context: ActionContext) => Promise<TOutput>;

/**
 * Options for action creation
 */
export interface ActionOptions {
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;

  /** Custom error transformer */
  transformError?: (error: unknown) => AppError;
}

// =============================================================================
// Core Wrapper
// =============================================================================

/**
 * Wrap a server action with logging and error handling
 *
 * This is a lower-level wrapper for cases where you need more control.
 *
 * @example
 * ```typescript
 * const updateProfile = withActionLogging(
 *   'updateProfile',
 *   async (input: UpdateProfileInput) => {
 *     const session = await auth();
 *     if (!session?.user?.id) {
 *       throw new AuthenticationError();
 *     }
 *
 *     return await prisma.users.update({
 *       where: { id: session.user.id },
 *       data: input,
 *     });
 *   }
 * );
 * ```
 */
export function withActionLogging<TInput, TOutput>(name: string, action: (input: TInput) => Promise<TOutput>, options: { transformError?: (error: unknown) => AppError } = {}): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    const actionId = crypto.randomUUID();
    const log = logger.child({ actionId, action: name });
    const startTime = Date.now();

    log.debug({ input }, 'Action started');

    try {
      const data = await action(input);
      const duration = Date.now() - startTime;

      log.info({ duration }, 'Action completed');

      return { success: true, data };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        log.warn({ issues: error.issues, duration }, 'Action validation failed');

        const fieldErrors: Record<string, string[]> = {};
        for (const e of error.issues) {
          const path = e.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(e.message);
        }

        return {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: fieldErrors,
        };
      }

      // Handle operational errors (safe to show to users)
      if (isOperationalError(error)) {
        const appError = error as AppError;
        log.warn({ error: appError.toJSON(), duration }, 'Action failed (operational)');

        return {
          success: false,
          error: appError.message,
          code: appError.code,
        };
      }

      // Handle AppError (non-operational)
      if (isAppError(error)) {
        log.error({ error: error.toJSON(), duration }, 'Action failed (non-operational)');

        return {
          success: false,
          error: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        };
      }

      // Transform unknown errors if transformer provided
      if (options.transformError) {
        const transformed = options.transformError(error);
        log.error({ err: error, transformedError: transformed.toJSON(), duration }, 'Action failed (transformed)');

        return {
          success: false,
          error: transformed.isOperational ? transformed.message : 'An unexpected error occurred',
          code: transformed.code,
        };
      }

      // Unknown errors
      log.error({ err: error, duration }, 'Action failed (unexpected)');

      return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      };
    }
  };
}

// =============================================================================
// Authenticated Action Creator
// =============================================================================

/**
 * Create an authenticated server action with validation and error handling
 *
 * This is the recommended way to create server actions. It provides:
 * - Automatic authentication check
 * - Input validation with Zod
 * - Structured error handling
 * - Logging with action context
 *
 * @example
 * ```typescript
 * export const createEnrollment = createAction(
 *   'createEnrollment',
 *   z.object({
 *     courseId: z.string().uuid(),
 *   }),
 *   async ({ courseId }, { userId, logger }) => {
 *     logger.info({ courseId }, 'Creating enrollment');
 *
 *     const enrollment = await prisma.enrollments.create({
 *       data: {
 *         userId,
 *         courseId,
 *         status: 'active',
 *       },
 *     });
 *
 *     return enrollment;
 *   }
 * );
 * ```
 */
export function createAction<TSchema extends ZodSchema, TOutput>(name: string, schema: TSchema, handler: ActionHandler<z.infer<TSchema>, TOutput>, options: ActionOptions = {}): (input: z.infer<TSchema>) => Promise<ActionResult<TOutput>> {
  const { requireAuth = true } = options;

  return withActionLogging(
    name,
    async (input: z.infer<TSchema>): Promise<TOutput> => {
      // Validate input
      const validated = schema.parse(input);

      // Check authentication if required
      let context: ActionContext;

      if (requireAuth) {
        const { auth } = await import('@/auth');
        const session = await auth();

        if (!session?.user?.id || !session?.user?.email) {
          throw new AuthenticationError();
        }

        context = {
          userId: session.user.id,
          email: session.user.email,
          locale: session.user.locale || 'en',
          logger: logger.child({ action: name, userId: session.user.id }),
          actionId: crypto.randomUUID(),
        };
      } else {
        context = {
          userId: '',
          email: '',
          locale: 'en',
          logger: logger.child({ action: name }),
          actionId: crypto.randomUUID(),
        };
      }

      // Execute handler
      return handler(validated, context);
    },
    options
  );
}

/**
 * Create a public server action (no authentication required)
 *
 * @example
 * ```typescript
 * export const submitContactForm = createPublicAction(
 *   'submitContactForm',
 *   z.object({
 *     email: z.string().email(),
 *     message: z.string().min(10),
 *   }),
 *   async ({ email, message }) => {
 *     await sendEmail({ to: 'support@example.com', from: email, body: message });
 *     return { sent: true };
 *   }
 * );
 * ```
 */
export function createPublicAction<TSchema extends ZodSchema, TOutput>(name: string, schema: TSchema, handler: (input: z.infer<TSchema>, logger: Logger) => Promise<TOutput>, options: Omit<ActionOptions, 'requireAuth'> = {}): (input: z.infer<TSchema>) => Promise<ActionResult<TOutput>> {
  return withActionLogging(
    name,
    async (input: z.infer<TSchema>): Promise<TOutput> => {
      const validated = schema.parse(input);
      const log = logger.child({ action: name });
      return handler(validated, log);
    },
    options
  );
}

// =============================================================================
// Form Action Helpers
// =============================================================================

/**
 * Create an action that works with form data
 *
 * @example
 * ```typescript
 * export const updateProfileAction = createFormAction(
 *   'updateProfile',
 *   z.object({
 *     name: z.string().min(1),
 *     bio: z.string().optional(),
 *   }),
 *   async (data, { userId }) => {
 *     await prisma.users.update({
 *       where: { id: userId },
 *       data,
 *     });
 *     return { updated: true };
 *   }
 * );
 *
 * // In a form
 * <form action={updateProfileAction}>
 *   <input name="name" />
 *   <textarea name="bio" />
 *   <button type="submit">Save</button>
 * </form>
 * ```
 */
export function createFormAction<TSchema extends ZodSchema, TOutput>(name: string, schema: TSchema, handler: ActionHandler<z.infer<TSchema>, TOutput>, options: ActionOptions = {}): (formData: FormData) => Promise<ActionResult<TOutput>> {
  const action = createAction(name, schema, handler, options);

  return async (formData: FormData): Promise<ActionResult<TOutput>> => {
    // Convert FormData to object
    const data: Record<string, unknown> = {};

    formData.forEach((value, key) => {
      // Handle multiple values for same key
      if (data[key]) {
        if (Array.isArray(data[key])) {
          (data[key] as unknown[]).push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    return action(data as z.infer<TSchema>);
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if an action result is successful
 */
export function isActionSuccess<T>(result: ActionResult<T>): result is ActionSuccess<T> {
  return result.success;
}

/**
 * Check if an action result is a failure
 */
export function isActionFailure<T>(result: ActionResult<T>): result is ActionFailure {
  return !result.success;
}

/**
 * Unwrap an action result or throw
 */
export function unwrapAction<T>(result: ActionResult<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(`${result.code}: ${result.error}`);
}

/**
 * Unwrap an action result or return default value
 */
export function unwrapActionOr<T>(result: ActionResult<T>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}
