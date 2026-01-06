/**
 * OpenTelemetry Metrics Utility
 *
 * Provides a centralized interface for application metrics including:
 * - Counters: Cumulative values that only increase (e.g., request count, error count)
 * - Histograms: Distribution of values (e.g., request duration, response size)
 * - UpDown Counters: Values that can increase and decrease (e.g., active users, queue size)
 */

import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram, UpDownCounter, MetricOptions, Attributes } from '@opentelemetry/api';

// Get the global meter for this service
const meter = metrics.getMeter('dev-academy-web', '1.0.0');

/**
 * Application Performance Metrics
 */

// HTTP request metrics
export const httpRequestCounter = meter.createCounter('http.server.requests', {
  description: 'Total number of HTTP requests',
  unit: '1',
}) as Counter;

export const httpRequestDuration = meter.createHistogram('http.server.duration', {
  description: 'HTTP request duration',
  unit: 'ms',
}) as Histogram;

export const httpRequestSize = meter.createHistogram('http.server.request.size', {
  description: 'HTTP request body size',
  unit: 'bytes',
}) as Histogram;

export const httpResponseSize = meter.createHistogram('http.server.response.size', {
  description: 'HTTP response body size',
  unit: 'bytes',
}) as Histogram;

export const httpErrorCounter = meter.createCounter('http.server.errors', {
  description: 'Total number of HTTP errors',
  unit: '1',
}) as Counter;

// Database metrics
export const dbQueryCounter = meter.createCounter('db.queries', {
  description: 'Total number of database queries',
  unit: '1',
}) as Counter;

export const dbQueryDuration = meter.createHistogram('db.query.duration', {
  description: 'Database query duration',
  unit: 'ms',
}) as Histogram;

export const dbErrorCounter = meter.createCounter('db.errors', {
  description: 'Total number of database errors',
  unit: '1',
}) as Counter;

export const dbConnectionPoolSize = meter.createUpDownCounter('db.connection_pool.size', {
  description: 'Current database connection pool size',
  unit: '1',
}) as UpDownCounter;

// API metrics
export const apiCallCounter = meter.createCounter('api.calls', {
  description: 'Total number of external API calls',
  unit: '1',
}) as Counter;

export const apiCallDuration = meter.createHistogram('api.call.duration', {
  description: 'External API call duration',
  unit: 'ms',
}) as Histogram;

export const apiErrorCounter = meter.createCounter('api.errors', {
  description: 'Total number of external API errors',
  unit: '1',
}) as Counter;

/**
 * Business Metrics - User Activity
 */

// User authentication metrics
export const loginAttemptCounter = meter.createCounter('user.login.attempts', {
  description: 'Total number of login attempts',
  unit: '1',
}) as Counter;

export const loginSuccessCounter = meter.createCounter('user.login.success', {
  description: 'Total number of successful logins',
  unit: '1',
}) as Counter;

export const loginFailureCounter = meter.createCounter('user.login.failures', {
  description: 'Total number of failed logins',
  unit: '1',
}) as Counter;

export const logoutCounter = meter.createCounter('user.logout', {
  description: 'Total number of user logouts',
  unit: '1',
}) as Counter;

export const newLocationLoginCounter = meter.createCounter('user.login.new_location', {
  description: 'Total number of logins from new locations',
  unit: '1',
}) as Counter;

export const suspiciousLoginCounter = meter.createCounter('user.login.suspicious', {
  description: 'Total number of suspicious login attempts',
  unit: '1',
}) as Counter;

// User registration metrics
export const userRegistrationCounter = meter.createCounter('user.registration', {
  description: 'Total number of user registrations',
  unit: '1',
}) as Counter;

export const userActivationCounter = meter.createCounter('user.activation', {
  description: 'Total number of user account activations',
  unit: '1',
}) as Counter;

// Active users
export const activeUsersGauge = meter.createUpDownCounter('user.active', {
  description: 'Number of currently active users',
  unit: '1',
}) as UpDownCounter;

export const activeSessionsGauge = meter.createUpDownCounter('user.sessions.active', {
  description: 'Number of currently active sessions',
  unit: '1',
}) as UpDownCounter;

/**
 * Business Metrics - Feature Usage
 */

// Page views
export const pageViewCounter = meter.createCounter('page.views', {
  description: 'Total number of page views',
  unit: '1',
}) as Counter;

export const uniquePageViewCounter = meter.createCounter('page.views.unique', {
  description: 'Total number of unique page views',
  unit: '1',
}) as Counter;

// Course/content metrics
export const courseViewCounter = meter.createCounter('course.views', {
  description: 'Total number of course views',
  unit: '1',
}) as Counter;

export const courseEnrollmentCounter = meter.createCounter('course.enrollments', {
  description: 'Total number of course enrollments',
  unit: '1',
}) as Counter;

export const courseCompletionCounter = meter.createCounter('course.completions', {
  description: 'Total number of course completions',
  unit: '1',
}) as Counter;

export const lessonViewCounter = meter.createCounter('lesson.views', {
  description: 'Total number of lesson views',
  unit: '1',
}) as Counter;

export const lessonCompletionCounter = meter.createCounter('lesson.completions', {
  description: 'Total number of lesson completions',
  unit: '1',
}) as Counter;

// Search metrics
export const searchCounter = meter.createCounter('search.queries', {
  description: 'Total number of search queries',
  unit: '1',
}) as Counter;

export const searchDuration = meter.createHistogram('search.duration', {
  description: 'Search query duration',
  unit: 'ms',
}) as Histogram;

export const searchResultsHistogram = meter.createHistogram('search.results.count', {
  description: 'Number of search results returned',
  unit: '1',
}) as Histogram;

/**
 * Business Metrics - Email & Notifications
 */

export const emailSentCounter = meter.createCounter('email.sent', {
  description: 'Total number of emails sent',
  unit: '1',
}) as Counter;

export const emailFailureCounter = meter.createCounter('email.failures', {
  description: 'Total number of email send failures',
  unit: '1',
}) as Counter;

export const emailDuration = meter.createHistogram('email.send.duration', {
  description: 'Email send duration',
  unit: 'ms',
}) as Histogram;

export const notificationCounter = meter.createCounter('notification.sent', {
  description: 'Total number of notifications sent',
  unit: '1',
}) as Counter;

/**
 * Helper Functions
 */

/**
 * Record HTTP request metrics
 */
export function recordHttpRequest(attributes: {
  method: string;
  route: string;
  statusCode: number;
  duration: number;
  requestSize?: number;
  responseSize?: number;
}) {
  const { method, route, statusCode, duration, requestSize, responseSize } = attributes;

  const commonAttrs: Attributes = {
    'http.method': method,
    'http.route': route,
    'http.status_code': statusCode,
  };

  httpRequestCounter.add(1, commonAttrs);
  httpRequestDuration.record(duration, commonAttrs);

  if (requestSize !== undefined) {
    httpRequestSize.record(requestSize, commonAttrs);
  }

  if (responseSize !== undefined) {
    httpResponseSize.record(responseSize, commonAttrs);
  }

  if (statusCode >= 400) {
    httpErrorCounter.add(1, {
      ...commonAttrs,
      'error.type': statusCode >= 500 ? 'server_error' : 'client_error',
    });
  }
}

/**
 * Record database query metrics
 */
export function recordDbQuery(attributes: {
  operation: string;
  table?: string;
  duration: number;
  success: boolean;
  error?: string;
}) {
  const { operation, table, duration, success, error } = attributes;

  const commonAttrs: Attributes = {
    'db.operation': operation,
    ...(table && { 'db.table': table }),
  };

  dbQueryCounter.add(1, commonAttrs);
  dbQueryDuration.record(duration, commonAttrs);

  if (!success) {
    dbErrorCounter.add(1, {
      ...commonAttrs,
      ...(error && { 'error.type': error }),
    });
  }
}

/**
 * Record external API call metrics
 */
export function recordApiCall(attributes: {
  service: string;
  endpoint: string;
  duration: number;
  statusCode?: number;
  success: boolean;
  error?: string;
}) {
  const { service, endpoint, duration, statusCode, success, error } = attributes;

  const commonAttrs: Attributes = {
    'api.service': service,
    'api.endpoint': endpoint,
    ...(statusCode && { 'api.status_code': statusCode }),
  };

  apiCallCounter.add(1, commonAttrs);
  apiCallDuration.record(duration, commonAttrs);

  if (!success) {
    apiErrorCounter.add(1, {
      ...commonAttrs,
      ...(error && { 'error.type': error }),
    });
  }
}

/**
 * Record login attempt metrics
 */
export function recordLoginAttempt(attributes: {
  success: boolean;
  userId?: string;
  email?: string;
  failureReason?: string;
  isNewLocation?: boolean;
  isSuspicious?: boolean;
  country?: string;
  city?: string;
}) {
  const { success, userId, failureReason, isNewLocation, isSuspicious, country, city } = attributes;

  const commonAttrs: Attributes = {
    'user.success': success,
    ...(userId && { 'user.id': userId }),
    ...(country && { 'geo.country': country }),
    ...(city && { 'geo.city': city }),
  };

  loginAttemptCounter.add(1, commonAttrs);

  if (success) {
    loginSuccessCounter.add(1, commonAttrs);

    if (isNewLocation) {
      newLocationLoginCounter.add(1, commonAttrs);
    }
  } else {
    loginFailureCounter.add(1, {
      ...commonAttrs,
      ...(failureReason && { 'failure.reason': failureReason }),
    });

    if (isSuspicious) {
      suspiciousLoginCounter.add(1, commonAttrs);
    }
  }
}

/**
 * Record page view metrics
 */
export function recordPageView(attributes: { path: string; userId?: string; isUnique?: boolean; duration?: number }) {
  const { path, userId, isUnique, duration } = attributes;

  const commonAttrs: Attributes = {
    'page.path': path,
    ...(userId && { 'user.id': userId }),
  };

  pageViewCounter.add(1, commonAttrs);

  if (isUnique) {
    uniquePageViewCounter.add(1, commonAttrs);
  }

  if (duration !== undefined) {
    // Could add a page load duration histogram if needed
  }
}

/**
 * Record email sending metrics
 */
export function recordEmailSent(attributes: {
  type: string;
  recipient: string;
  success: boolean;
  duration: number;
  error?: string;
}) {
  const { type, success, duration, error } = attributes;

  const commonAttrs: Attributes = {
    'email.type': type,
    'email.success': success,
  };

  emailDuration.record(duration, commonAttrs);

  if (success) {
    emailSentCounter.add(1, commonAttrs);
  } else {
    emailFailureCounter.add(1, {
      ...commonAttrs,
      ...(error && { 'error.type': error }),
    });
  }
}

/**
 * Update active user count
 */
export function updateActiveUsers(change: number, attributes?: Attributes) {
  activeUsersGauge.add(change, attributes || {});
}

/**
 * Update active session count
 */
export function updateActiveSessions(change: number, attributes?: Attributes) {
  activeSessionsGauge.add(change, attributes || {});
}

/**
 * Create a custom counter
 */
export function createCounter(name: string, options?: MetricOptions): Counter {
  return meter.createCounter(name, options) as Counter;
}

/**
 * Create a custom histogram
 */
export function createHistogram(name: string, options?: MetricOptions): Histogram {
  return meter.createHistogram(name, options) as Histogram;
}

/**
 * Create a custom up-down counter
 */
export function createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
  return meter.createUpDownCounter(name, options) as UpDownCounter;
}
