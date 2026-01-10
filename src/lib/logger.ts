/**
 * Structured Logging with Axiom Integration
 *
 * This module provides a production-ready logger with:
 * - Environment-aware configuration (pretty dev, JSON prod)
 * - Axiom integration for production log aggregation
 * - Automatic sensitive data redaction
 * - Module-specific child loggers
 * - Request-scoped loggers with correlation IDs
 * - Log levels matching severity
 *
 * @module lib/logger
 *
 * @example
 * ```typescript
 * import { logger, dbLogger, createRequestLogger } from '@/lib/logger';
 *
 * // Basic logging
 * logger.info({ userId }, 'User logged in');
 * logger.error({ err: error }, 'Failed to process request');
 *
 * // Module-specific logging
 * dbLogger.debug({ query, duration }, 'Query executed');
 *
 * // Request-scoped logging
 * const log = createRequestLogger(requestId, { userId });
 * log.info('Processing request');
 * ```
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Log level names
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Logger interface matching Pino's API
 */
export interface Logger {
  fatal: LogFn;
  error: LogFn;
  warn: LogFn;
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
  child: (bindings: Record<string, unknown>) => Logger;
  level: string;
}

type LogFn = {
  (obj: Record<string, unknown>, msg?: string): void;
  (msg: string): void;
};

// =============================================================================
// Environment Detection
// =============================================================================

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

// Axiom configuration (auto-set by Vercel integration)
const AXIOM_DATASET = process.env.AXIOM_DATASET;
const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
const hasAxiom = Boolean(AXIOM_DATASET && AXIOM_TOKEN);

// =============================================================================
// Configuration
// =============================================================================

/**
 * Paths to redact from logs (supports wildcards)
 */
const REDACT_PATHS = [
  // HTTP headers
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  // Common sensitive fields
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'creditCard',
  'ssn',
  // Nested sensitive fields
  '*.password',
  '*.token',
  '*.apiKey',
  '*.secret',
  // Auth specific
  'credentials',
  'credentials.password',
  'body.password',
  'body.token',
];

/**
 * Base fields added to every log entry
 */
const BASE_FIELDS = {
  env: process.env.NODE_ENV,
  service: process.env.SERVICE_NAME || 'devmultiplier-web',
  version: process.env.npm_package_version || '0.0.0',
};

/**
 * Default log level by environment
 */
function getDefaultLevel(): LogLevel {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL as LogLevel;
  }
  if (isTest) return 'silent' as LogLevel;
  if (isDev) return 'debug';
  return 'info';
}

// =============================================================================
// Simple Logger Implementation (No External Dependencies)
// =============================================================================

/**
 * Log level values for comparison
 */
const LOG_LEVELS: Record<string, number> = {
  silent: Infinity,
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

/**
 * ANSI colors for pretty printing
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
};

const LEVEL_COLORS: Record<string, string> = {
  fatal: COLORS.red,
  error: COLORS.red,
  warn: COLORS.yellow,
  info: COLORS.blue,
  debug: COLORS.cyan,
  trace: COLORS.gray,
};

// =============================================================================
// Axiom Transport
// =============================================================================

/**
 * Buffer for batching logs to Axiom
 */
const axiomBuffer: Record<string, unknown>[] = [];
const AXIOM_BATCH_SIZE = 10;
const AXIOM_FLUSH_INTERVAL = 5000; // 5 seconds
let axiomFlushTimer: NodeJS.Timeout | null = null;

/**
 * Send logs to Axiom
 */
async function sendToAxiom(logs: Record<string, unknown>[]): Promise<void> {
  if (!hasAxiom || logs.length === 0) return;

  try {
    const response = await fetch(`https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AXIOM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logs),
    });

    if (!response.ok) {
      console.error(`Axiom ingest failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Silently fail - don't let logging errors affect the application
    console.error('Failed to send logs to Axiom:', error);
  }
}

/**
 * Flush the Axiom buffer
 */
async function flushAxiomBuffer(): Promise<void> {
  if (axiomBuffer.length === 0) return;

  const logs = axiomBuffer.splice(0, axiomBuffer.length);
  await sendToAxiom(logs);
}

/**
 * Queue a log entry for Axiom
 */
function queueForAxiom(logEntry: Record<string, unknown>): void {
  if (!hasAxiom) return;

  axiomBuffer.push({
    ...logEntry,
    _time: new Date().toISOString(),
  });

  // Flush if batch size reached
  if (axiomBuffer.length >= AXIOM_BATCH_SIZE) {
    flushAxiomBuffer();
  }

  // Set up interval flush if not already running
  if (!axiomFlushTimer) {
    axiomFlushTimer = setInterval(() => {
      flushAxiomBuffer();
    }, AXIOM_FLUSH_INTERVAL);

    // Unref the timer so it doesn't keep the process alive
    if (axiomFlushTimer.unref) {
      axiomFlushTimer.unref();
    }
  }
}

// Flush on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => flushAxiomBuffer());
}

/**
 * Redact sensitive values from an object
 */
function redactSensitive(obj: Record<string, unknown>, paths: string[]): Record<string, unknown> {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    // Check direct match
    if (paths.includes(key) || paths.includes(`*.${key}`)) {
      result[key] = '[REDACTED]';
      continue;
    }

    // Recursively redact nested objects
    if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = redactSensitive(result[key] as Record<string, unknown>, paths);
    }
  }

  return result;
}

/**
 * Format timestamp for pretty printing
 */
function formatTime(): string {
  const now = new Date();
  return now.toISOString().slice(11, 23); // HH:MM:SS.mmm
}

/**
 * Create a logger instance
 */
function createLoggerInstance(bindings: Record<string, unknown> = {}): Logger {
  const currentLevel = getDefaultLevel();
  const levelValue = LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info;

  const shouldLog = (level: string): boolean => {
    return (LOG_LEVELS[level] ?? 0) >= levelValue;
  };

  const formatMessage = (level: string, objOrMsg: Record<string, unknown> | string, msg?: string): void => {
    if (!shouldLog(level)) return;

    let logObj: Record<string, unknown>;
    let message: string;

    if (typeof objOrMsg === 'string') {
      logObj = {};
      message = objOrMsg;
    } else {
      logObj = objOrMsg;
      message = msg || '';
    }

    // Merge bindings
    const fullObj = { ...BASE_FIELDS, ...bindings, ...logObj };

    // Redact sensitive data
    const redacted = redactSensitive(fullObj, REDACT_PATHS);

    // Add metadata
    const logEntry = {
      level,
      time: new Date().toISOString(),
      msg: message,
      ...redacted,
    };

    if (isProd) {
      // JSON output for production
      console.log(JSON.stringify(logEntry));
    } else if (!isTest) {
      // Pretty output for development
      const color = LEVEL_COLORS[level] || COLORS.white;
      const levelStr = level.toUpperCase().padEnd(5);

      // Format context (excluding standard fields)
      const context = { ...redacted };
      delete context.env;
      delete context.service;
      delete context.version;

      const contextStr =
        Object.keys(context).length > 0 ? ` ${COLORS.gray}${JSON.stringify(context)}${COLORS.reset}` : '';

      console.log(
        `${COLORS.gray}${formatTime()}${COLORS.reset} ${color}${levelStr}${COLORS.reset} ${message}${contextStr}`
      );

      // Log error stack traces
      if (logObj.err && typeof logObj.err === 'object' && 'stack' in logObj.err) {
        console.log(COLORS.gray + (logObj.err as Error).stack + COLORS.reset);
      }
    }

    // Send to Axiom if configured (works in any environment)
    if (hasAxiom) {
      queueForAxiom(logEntry);
    }
  };

  const createLogFn = (level: string): LogFn => {
    return ((objOrMsg: Record<string, unknown> | string, msg?: string) => {
      formatMessage(level, objOrMsg, msg);
    }) as LogFn;
  };

  return {
    fatal: createLogFn('fatal'),
    error: createLogFn('error'),
    warn: createLogFn('warn'),
    info: createLogFn('info'),
    debug: createLogFn('debug'),
    trace: createLogFn('trace'),
    child: (childBindings: Record<string, unknown>) => createLoggerInstance({ ...bindings, ...childBindings }),
    level: currentLevel,
  };
}

// =============================================================================
// Logger Instances
// =============================================================================

/**
 * Main application logger
 */
export const logger = createLoggerInstance();

/**
 * Database operations logger
 */
export const dbLogger = logger.child({ module: 'database' });

/**
 * API routes logger
 */
export const apiLogger = logger.child({ module: 'api' });

/**
 * Authentication logger
 */
export const authLogger = logger.child({ module: 'auth' });

/**
 * Cache operations logger
 */
export const cacheLogger = logger.child({ module: 'cache' });

/**
 * Email service logger
 */
export const emailLogger = logger.child({ module: 'email' });

/**
 * External services logger
 */
export const externalLogger = logger.child({ module: 'external' });

// =============================================================================
// Request-Scoped Logging
// =============================================================================

/**
 * Create a logger with request context
 *
 * @example
 * ```typescript
 * const log = createRequestLogger(requestId, { userId, sessionId });
 * log.info('Processing enrollment');
 * log.debug({ courseId }, 'Checking course availability');
 * ```
 */
export function createRequestLogger(requestId: string, metadata?: Record<string, unknown>): Logger {
  return logger.child({
    requestId,
    ...metadata,
  });
}

/**
 * Create a module-specific logger
 *
 * @example
 * ```typescript
 * const enrollmentLogger = createModuleLogger('enrollment');
 * enrollmentLogger.info({ userId, courseId }, 'User enrolled');
 * ```
 */
export function createModuleLogger(module: string): Logger {
  return logger.child({ module });
}

// =============================================================================
// Log Utilities
// =============================================================================

/**
 * Log levels reference
 *
 * | Level | Value | Use Case |
 * |-------|-------|----------|
 * | fatal | 60 | System unusable, immediate action required |
 * | error | 50 | Error conditions, exceptions, failures |
 * | warn | 40 | Warning conditions, deprecated features, retries |
 * | info | 30 | Informational (request completed, job done) |
 * | debug | 20 | Detailed debugging information |
 * | trace | 10 | Very detailed tracing (function entry/exit) |
 */
export const LogLevels = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const;

/**
 * Measure and log operation duration
 *
 * @example
 * ```typescript
 * const { result, duration } = await measureDuration(
 *   () => prisma.users.findMany(),
 *   dbLogger,
 *   'Fetched all users'
 * );
 * ```
 */
export async function measureDuration<T>(
  fn: () => Promise<T>,
  log: Logger,
  message: string,
  context?: Record<string, unknown>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    log.info({ ...context, duration }, message);

    return { result, duration };
  } catch (error) {
    const duration = Date.now() - start;

    log.error({ ...context, duration, err: error }, `${message} (failed)`);

    throw error;
  }
}

/**
 * Create a timer for manual duration tracking
 *
 * @example
 * ```typescript
 * const timer = startTimer();
 * // ... do work ...
 * logger.info({ duration: timer.elapsed() }, 'Work completed');
 * ```
 */
export function startTimer(): { elapsed: () => number } {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
  };
}

/**
 * Flush all pending logs to Axiom
 *
 * Call this before serverless functions exit to ensure all logs are sent.
 *
 * @example
 * ```typescript
 * // In API route
 * export async function GET() {
 *   logger.info('Processing request');
 *   // ... do work ...
 *   await flushLogs();
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export async function flushLogs(): Promise<void> {
  await flushAxiomBuffer();
}
