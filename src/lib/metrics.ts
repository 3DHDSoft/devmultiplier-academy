/**
 * OpenTelemetry Metrics Utility
 *
 * Provides a centralized interface for application metrics including:
 * - Counters: Cumulative values that only increase (e.g., request count, error count)
 * - Histograms: Distribution of values (e.g., request duration, response size)
 * - UpDown Counters: Values that can increase and decrease (e.g., active users, queue size)
 */

import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram, UpDownCounter, MetricOptions, Attributes, Meter } from '@opentelemetry/api';

// Lazy-initialize the meter to ensure MeterProvider is registered first
let _meter: Meter | null = null;
function getMeter(): Meter {
  if (!_meter) {
    _meter = metrics.getMeter('dev-academy-web', '1.0.0');
  }
  return _meter;
}

// Helper to create lazy-initialized counters
function createLazyCounter(name: string, options?: MetricOptions) {
  let counter: Counter | null = null;
  return {
    add(value: number, attributes?: Attributes) {
      if (!counter) counter = getMeter().createCounter(name, options);
      counter.add(value, attributes);
    }
  };
}

// Helper to create lazy-initialized histograms
function createLazyHistogram(name: string, options?: MetricOptions) {
  let histogram: Histogram | null = null;
  return {
    record(value: number, attributes?: Attributes) {
      if (!histogram) histogram = getMeter().createHistogram(name, options);
      histogram.record(value, attributes);
    }
  };
}

// Helper to create lazy-initialized up-down counters
function createLazyUpDownCounter(name: string, options?: MetricOptions) {
  let counter: UpDownCounter | null = null;
  return {
    add(value: number, attributes?: Attributes) {
      if (!counter) counter = getMeter().createUpDownCounter(name, options);
      counter.add(value, attributes);
    }
  };
}

/**
 * Application Performance Metrics
 */

// HTTP Server request metrics (incoming requests)
export const httpServerRequestCounter = createLazyCounter('http_server_requests_total', {
  description: 'Total number of HTTP server requests',
  unit: '1',
});

export const httpServerRequestDuration = createLazyHistogram('http_server_request_duration_seconds', {
  description: 'HTTP server request duration in seconds',
  unit: 's',
});

export const httpServerRequestSize = createLazyHistogram('http_server_request_size_bytes', {
  description: 'HTTP server request body size',
  unit: 'bytes',
});

export const httpServerResponseSize = createLazyHistogram('http_server_response_size_bytes', {
  description: 'HTTP server response body size',
  unit: 'bytes',
});

export const httpServerErrorCounter = createLazyCounter('http_server_errors_total', {
  description: 'Total number of HTTP server errors',
  unit: '1',
});

// Legacy aliases for backward compatibility (middleware still uses these)
export const httpRequestCounter = httpServerRequestCounter;
export const httpRequestDuration = httpServerRequestDuration;
export const httpRequestSize = httpServerRequestSize;
export const httpResponseSize = httpServerResponseSize;
export const httpErrorCounter = httpServerErrorCounter;

// Database metrics
export const dbQueryCounter = createLazyCounter('db.queries', {
  description: 'Total number of database queries',
  unit: '1',
});

export const dbQueryDuration = createLazyHistogram('db.query.duration', {
  description: 'Database query duration',
  unit: 'ms',
});

export const dbErrorCounter = createLazyCounter('db.errors', {
  description: 'Total number of database errors',
  unit: '1',
});

export const dbConnectionPoolSize = createLazyUpDownCounter('db.connection_pool.size', {
  description: 'Current database connection pool size',
  unit: '1',
});

// API metrics
export const apiCallCounter = createLazyCounter('api.calls', {
  description: 'Total number of external API calls',
  unit: '1',
});

export const apiCallDuration = createLazyHistogram('api.call.duration', {
  description: 'External API call duration',
  unit: 'ms',
});

export const apiErrorCounter = createLazyCounter('api.errors', {
  description: 'Total number of external API errors',
  unit: '1',
});

/**
 * Business Metrics - User Activity
 */

// User authentication metrics
export const loginAttemptCounter = createLazyCounter('user.login.attempts', {
  description: 'Total number of login attempts',
  unit: '1',
});

export const loginSuccessCounter = createLazyCounter('user.login.success', {
  description: 'Total number of successful logins',
  unit: '1',
});

export const loginFailureCounter = createLazyCounter('user.login.failures', {
  description: 'Total number of failed logins',
  unit: '1',
});

export const logoutCounter = createLazyCounter('user.logout', {
  description: 'Total number of user logouts',
  unit: '1',
});

export const newLocationLoginCounter = createLazyCounter('user.login.new_location', {
  description: 'Total number of logins from new locations',
  unit: '1',
});

export const suspiciousLoginCounter = createLazyCounter('user.login.suspicious', {
  description: 'Total number of suspicious login attempts',
  unit: '1',
});

// User registration metrics
export const userRegistrationCounter = createLazyCounter('user.registration', {
  description: 'Total number of user registrations',
  unit: '1',
});

export const userActivationCounter = createLazyCounter('user.activation', {
  description: 'Total number of user account activations',
  unit: '1',
});

// Active users
export const activeUsersGauge = createLazyUpDownCounter('user.active', {
  description: 'Number of currently active users',
  unit: '1',
});

export const activeSessionsGauge = createLazyUpDownCounter('user.sessions.active', {
  description: 'Number of currently active sessions',
  unit: '1',
});

/**
 * Business Metrics - Feature Usage
 */

// Page views
export const pageViewCounter = createLazyCounter('page.views', {
  description: 'Total number of page views',
  unit: '1',
});

export const uniquePageViewCounter = createLazyCounter('page.views.unique', {
  description: 'Total number of unique page views',
  unit: '1',
});

// Course/content metrics
export const courseViewCounter = createLazyCounter('course.views', {
  description: 'Total number of course views',
  unit: '1',
});

export const courseEnrollmentCounter = createLazyCounter('course.enrollments', {
  description: 'Total number of course enrollments',
  unit: '1',
});

export const courseCompletionCounter = createLazyCounter('course.completions', {
  description: 'Total number of course completions',
  unit: '1',
});

export const lessonViewCounter = createLazyCounter('lesson.views', {
  description: 'Total number of lesson views',
  unit: '1',
});

export const lessonCompletionCounter = createLazyCounter('lesson.completions', {
  description: 'Total number of lesson completions',
  unit: '1',
});

// Search metrics
export const searchCounter = createLazyCounter('search.queries', {
  description: 'Total number of search queries',
  unit: '1',
});

export const searchDuration = createLazyHistogram('search.duration', {
  description: 'Search query duration',
  unit: 'ms',
});

export const searchResultsHistogram = createLazyHistogram('search.results.count', {
  description: 'Number of search results returned',
  unit: '1',
});

/**
 * Business Metrics - Email & Notifications
 */

export const emailSentCounter = createLazyCounter('email.sent', {
  description: 'Total number of emails sent',
  unit: '1',
});

export const emailFailureCounter = createLazyCounter('email.failures', {
  description: 'Total number of email send failures',
  unit: '1',
});

export const emailDuration = createLazyHistogram('email.send.duration', {
  description: 'Email send duration',
  unit: 'ms',
});

export const notificationCounter = createLazyCounter('notification.sent', {
  description: 'Total number of notifications sent',
  unit: '1',
});

/**
 * Helper Functions
 */

/**
 * Record HTTP server request metrics
 */
export function recordHttpRequest(attributes: {
  method: string;
  route: string;
  statusCode: number;
  duration: number; // Duration in milliseconds
  requestSize?: number;
  responseSize?: number;
}) {
  const { method, route, statusCode, duration, requestSize, responseSize } = attributes;

  const commonAttrs: Attributes = {
    'http_request_method': method,
    'http_route': route,
    'http_response_status_code': statusCode.toString(),
  };

  httpServerRequestCounter.add(1, commonAttrs);

  // Convert milliseconds to seconds for histogram (OpenTelemetry standard)
  httpServerRequestDuration.record(duration / 1000, commonAttrs);

  if (requestSize !== undefined) {
    httpServerRequestSize.record(requestSize, commonAttrs);
  }

  if (responseSize !== undefined) {
    httpServerResponseSize.record(responseSize, commonAttrs);
  }

  if (statusCode >= 400) {
    httpServerErrorCounter.add(1, {
      ...commonAttrs,
      'error_type': statusCode >= 500 ? 'server_error' : 'client_error',
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
export function createCounter(name: string, options?: MetricOptions) {
  return createLazyCounter(name, options);
}

/**
 * Create a custom histogram
 */
export function createHistogram(name: string, options?: MetricOptions) {
  return createLazyHistogram(name, options);
}

/**
 * Create a custom up-down counter
 */
export function createUpDownCounter(name: string, options?: MetricOptions) {
  return createLazyUpDownCounter(name, options);
}
