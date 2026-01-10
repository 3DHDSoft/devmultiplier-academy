/**
 * Result Pattern for No-Throw Error Handling
 *
 * Inspired by Rust's Result type, this module provides a type-safe way to handle
 * errors without throwing exceptions. This makes error handling explicit and
 * prevents unhandled rejections.
 *
 * @module lib/result
 *
 * @example
 * ```typescript
 * // Instead of throwing
 * async function getUser(id: string): Promise<User> {
 *   const user = await db.findUser(id);
 *   if (!user) throw new NotFoundError('User', id);
 *   return user;
 * }
 *
 * // Use Result pattern
 * async function getUser(id: string): Promise<Result<User>> {
 *   const user = await db.findUser(id);
 *   if (!user) return err(new NotFoundError('User', id));
 *   return ok(user);
 * }
 *
 * // Handle the result
 * const result = await getUser(id);
 * if (!result.success) {
 *   logger.warn({ error: result.error }, 'User not found');
 *   return Response.json(result.error.toResponse(), { status: result.error.statusCode });
 * }
 * // result.data is typed as User
 * ```
 */

import { AppError, isAppError, toAppError, fromPrismaError } from './errors';

// =============================================================================
// Core Types
// =============================================================================

/**
 * Discriminated union representing either success with data or failure with error
 */
export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

/**
 * Async version of Result
 */
export type AsyncResult<T, E = AppError> = Promise<Result<T, E>>;

// =============================================================================
// Result Constructors
// =============================================================================

/**
 * Create a success result
 *
 * @example
 * ```typescript
 * return ok(user);
 * return ok({ id: 1, name: 'John' });
 * ```
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Create a failure result
 *
 * @example
 * ```typescript
 * return err(new NotFoundError('User', id));
 * return err(new ValidationError('Invalid email'));
 * ```
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

// =============================================================================
// Result Utilities
// =============================================================================

/**
 * Wrap an async function that might throw into a Result
 *
 * @example
 * ```typescript
 * const result = await tryCatch(
 *   () => prisma.users.findUnique({ where: { id } }),
 *   (e) => new DatabaseError('Failed to fetch user', { originalError: e })
 * );
 * ```
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorTransform?: (error: unknown) => AppError
): AsyncResult<T, AppError> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    if (isAppError(error)) {
      return err(error);
    }

    const appError = errorTransform ? errorTransform(error) : toAppError(error);
    return err(appError);
  }
}

/**
 * Wrap a sync function that might throw into a Result
 *
 * @example
 * ```typescript
 * const result = tryCatchSync(
 *   () => JSON.parse(jsonString),
 *   (e) => new ValidationError('Invalid JSON')
 * );
 * ```
 */
export function tryCatchSync<T>(fn: () => T, errorTransform?: (error: unknown) => AppError): Result<T, AppError> {
  try {
    const data = fn();
    return ok(data);
  } catch (error) {
    if (isAppError(error)) {
      return err(error);
    }

    const appError = errorTransform ? errorTransform(error) : toAppError(error);
    return err(appError);
  }
}

/**
 * Wrap a Prisma operation with automatic error transformation
 *
 * @example
 * ```typescript
 * const result = await tryCatchPrisma(
 *   () => prisma.users.create({ data: userData })
 * );
 * ```
 */
export async function tryCatchPrisma<T>(fn: () => Promise<T>): AsyncResult<T, AppError> {
  return tryCatch(fn, fromPrismaError);
}

// =============================================================================
// Result Unwrapping
// =============================================================================

/**
 * Unwrap a result or throw the error
 * Use this when you want to convert back to throw-based error handling
 *
 * @example
 * ```typescript
 * // In API routes with withErrorHandling wrapper
 * const user = unwrap(await getUserById(id));
 * // If error, it's caught by the wrapper
 * ```
 */
export function unwrap<T>(result: Result<T, AppError>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap a result or return a default value
 *
 * @example
 * ```typescript
 * const user = unwrapOr(await getUserById(id), null);
 * const settings = unwrapOr(await getSettings(), defaultSettings);
 * ```
 */
export function unwrapOr<T>(result: Result<T, AppError>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Unwrap a result or compute a default value from the error
 *
 * @example
 * ```typescript
 * const user = unwrapOrElse(await getUserById(id), (error) => {
 *   logger.warn({ error }, 'Using default user');
 *   return createGuestUser();
 * });
 * ```
 */
export function unwrapOrElse<T, E>(result: Result<T, E>, defaultFn: (error: E) => T): T {
  return result.success ? result.data : defaultFn(result.error);
}

// =============================================================================
// Result Transformation
// =============================================================================

/**
 * Map a successful result to a new value
 *
 * @example
 * ```typescript
 * const userResult = await getUserById(id);
 * const nameResult = map(userResult, (user) => user.name);
 * ```
 */
export function map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result;
}

/**
 * Map an error to a new error type
 *
 * @example
 * ```typescript
 * const result = mapErr(await externalApiCall(), (e) =>
 *   new ExternalServiceError('API', e.message)
 * );
 * ```
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) {
    return err(fn(result.error));
  }
  return result;
}

/**
 * Chain Result operations (flatMap)
 *
 * @example
 * ```typescript
 * const result = await andThen(
 *   await getUserById(id),
 *   async (user) => getEnrollmentsByUserId(user.id)
 * );
 * ```
 */
export async function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

/**
 * Synchronous chain Result operations
 */
export function andThenSync<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

// =============================================================================
// Result Combinators
// =============================================================================

/**
 * Combine multiple Results into one
 * Returns first error or array of all data
 *
 * @example
 * ```typescript
 * const [user, course, enrollment] = unwrap(
 *   all([
 *     await getUserById(userId),
 *     await getCourseById(courseId),
 *     await getEnrollment(userId, courseId),
 *   ])
 * );
 * ```
 */
export function all<T extends readonly Result<unknown, AppError>[]>(
  results: T
): Result<{ [K in keyof T]: T[K] extends Result<infer U, AppError> ? U : never }, AppError> {
  const data: unknown[] = [];

  for (const result of results) {
    if (!result.success) {
      return result as Result<never, AppError>;
    }
    data.push(result.data);
  }

  return ok(data as { [K in keyof T]: T[K] extends Result<infer U, AppError> ? U : never });
}

/**
 * Execute multiple async operations and combine results
 *
 * @example
 * ```typescript
 * const result = await allSettled([
 *   getUserById(userId),
 *   getCourseById(courseId),
 * ]);
 * ```
 */
export async function allAsync<T>(fns: (() => AsyncResult<T, AppError>)[]): AsyncResult<T[], AppError> {
  const results = await Promise.all(fns.map((fn) => fn()));
  return all(results) as Result<T[], AppError>;
}

/**
 * Return first successful result or last error
 *
 * @example
 * ```typescript
 * const user = await firstSuccess([
 *   () => getUserFromCache(id),
 *   () => getUserFromDatabase(id),
 *   () => getUserFromExternalApi(id),
 * ]);
 * ```
 */
export async function firstSuccess<T>(fns: (() => AsyncResult<T, AppError>)[]): AsyncResult<T, AppError> {
  let lastError: AppError | undefined;

  for (const fn of fns) {
    const result = await fn();
    if (result.success) {
      return result;
    }
    lastError = result.error;
  }

  return err(lastError!);
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Check if a result is a failure
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

// =============================================================================
// Result Helpers for Common Patterns
// =============================================================================

/**
 * Convert nullable value to Result
 *
 * @example
 * ```typescript
 * const user = await prisma.users.findUnique({ where: { id } });
 * const result = fromNullable(user, new NotFoundError('User', id));
 * ```
 */
export function fromNullable<T>(value: T | null | undefined, error: AppError): Result<T, AppError> {
  if (value === null || value === undefined) {
    return err(error);
  }
  return ok(value);
}

/**
 * Execute a Result operation with logging on failure
 *
 * @example
 * ```typescript
 * const result = await withLogging(
 *   getUserById(id),
 *   logger,
 *   'Failed to get user'
 * );
 * ```
 */
export async function withLogging<T>(
  resultPromise: AsyncResult<T, AppError>,
  logger: { warn: (obj: object, msg: string) => void },
  message: string
): AsyncResult<T, AppError> {
  const result = await resultPromise;

  if (!result.success) {
    logger.warn({ error: result.error.toJSON() }, message);
  }

  return result;
}
