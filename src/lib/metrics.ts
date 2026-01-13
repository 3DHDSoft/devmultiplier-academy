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
    },
  };
}

// Helper to create lazy-initialized histograms
function createLazyHistogram(name: string, options?: MetricOptions) {
  let histogram: Histogram | null = null;
  return {
    record(value: number, attributes?: Attributes) {
      if (!histogram) histogram = getMeter().createHistogram(name, options);
      histogram.record(value, attributes);
    },
  };
}

// Helper to create lazy-initialized up-down counters
function createLazyUpDownCounter(name: string, options?: MetricOptions) {
  let counter: UpDownCounter | null = null;
  return {
    add(value: number, attributes?: Attributes) {
      if (!counter) counter = getMeter().createUpDownCounter(name, options);
      counter.add(value, attributes);
    },
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
export const dbQueryCounter = createLazyCounter('db_queries_total', {
  description: 'Total number of database queries',
  unit: '1',
});

export const dbQueryDuration = createLazyHistogram('db_query_duration_seconds', {
  description: 'Database query duration in seconds',
  unit: 's',
});

export const dbErrorCounter = createLazyCounter('db_errors_total', {
  description: 'Total number of database errors',
  unit: '1',
});

export const dbConnectionPoolSize = createLazyUpDownCounter('db_connection_pool_size', {
  description: 'Current database connection pool size',
  unit: '1',
});

// API metrics
export const apiCallCounter = createLazyCounter('api_calls_total', {
  description: 'Total number of external API calls',
  unit: '1',
});

export const apiCallDuration = createLazyHistogram('api_call_duration_seconds', {
  description: 'External API call duration in seconds',
  unit: 's',
});

export const apiErrorCounter = createLazyCounter('api_errors_total', {
  description: 'Total number of external API errors',
  unit: '1',
});

/**
 * Business Metrics - User Activity
 */

// User authentication metrics
export const loginAttemptCounter = createLazyCounter('user_login_attempts_total', {
  description: 'Total number of login attempts',
  unit: '1',
});

export const loginSuccessCounter = createLazyCounter('user_login_success_total', {
  description: 'Total number of successful logins',
  unit: '1',
});

export const loginFailureCounter = createLazyCounter('user_login_failures_total', {
  description: 'Total number of failed logins',
  unit: '1',
});

export const logoutCounter = createLazyCounter('user_logout_total', {
  description: 'Total number of user logouts',
  unit: '1',
});

export const newLocationLoginCounter = createLazyCounter('user_login_new_location_total', {
  description: 'Total number of logins from new locations',
  unit: '1',
});

export const suspiciousLoginCounter = createLazyCounter('user_login_suspicious_total', {
  description: 'Total number of suspicious login attempts',
  unit: '1',
});

// User registration metrics
export const userRegistrationCounter = createLazyCounter('user_registration_total', {
  description: 'Total number of user registrations',
  unit: '1',
});

export const userActivationCounter = createLazyCounter('user_activation_total', {
  description: 'Total number of user account activations',
  unit: '1',
});

// Active users
export const activeUsersGauge = createLazyUpDownCounter('user_active', {
  description: 'Number of currently active users',
  unit: '1',
});

export const activeSessionsGauge = createLazyUpDownCounter('user_sessions_active', {
  description: 'Number of currently active sessions',
  unit: '1',
});

/**
 * Business Metrics - Feature Usage
 */

// Page views
export const pageViewCounter = createLazyCounter('page_views_total', {
  description: 'Total number of page views',
  unit: '1',
});

export const uniquePageViewCounter = createLazyCounter('page_views_unique_total', {
  description: 'Total number of unique page views',
  unit: '1',
});

// Course/content metrics
export const courseViewCounter = createLazyCounter('course_views_total', {
  description: 'Total number of course views',
  unit: '1',
});

export const courseEnrollmentCounter = createLazyCounter('course_enrollments_total', {
  description: 'Total number of course enrollments',
  unit: '1',
});

export const courseCompletionCounter = createLazyCounter('course_completions_total', {
  description: 'Total number of course completions',
  unit: '1',
});

export const lessonViewCounter = createLazyCounter('lesson_views_total', {
  description: 'Total number of lesson views',
  unit: '1',
});

export const lessonCompletionCounter = createLazyCounter('lesson_completions_total', {
  description: 'Total number of lesson completions',
  unit: '1',
});

// Search metrics
export const searchCounter = createLazyCounter('search_queries_total', {
  description: 'Total number of search queries',
  unit: '1',
});

export const searchDuration = createLazyHistogram('search_duration_seconds', {
  description: 'Search query duration in seconds',
  unit: 's',
});

export const searchResultsHistogram = createLazyHistogram('search_results_count', {
  description: 'Number of search results returned',
  unit: '1',
});

/**
 * Business Metrics - Email & Notifications
 */

export const emailSentCounter = createLazyCounter('email_sent_total', {
  description: 'Total number of emails sent',
  unit: '1',
});

export const emailFailureCounter = createLazyCounter('email_failures_total', {
  description: 'Total number of email send failures',
  unit: '1',
});

export const emailDuration = createLazyHistogram('email_send_duration_seconds', {
  description: 'Email send duration in seconds',
  unit: 's',
});

export const notificationCounter = createLazyCounter('notification_sent_total', {
  description: 'Total number of notifications sent',
  unit: '1',
});

/**
 * Business Metrics - Payments
 */

// Payment metrics
export const paymentCounter = createLazyCounter('payment_total', {
  description: 'Total number of payments processed',
  unit: '1',
});

export const paymentAmountHistogram = createLazyHistogram('payment_amount_cents', {
  description: 'Payment amounts in cents',
  unit: 'cents',
});

export const paymentFailureCounter = createLazyCounter('payment_failures_total', {
  description: 'Total number of payment failures',
  unit: '1',
});

export const paymentRefundCounter = createLazyCounter('payment_refunds_total', {
  description: 'Total number of payment refunds',
  unit: '1',
});

// Subscription metrics
export const subscriptionCounter = createLazyCounter('subscription_total', {
  description: 'Total number of subscriptions created',
  unit: '1',
});

export const subscriptionCancelCounter = createLazyCounter('subscription_cancellations_total', {
  description: 'Total number of subscription cancellations',
  unit: '1',
});

export const activeSubscriptionsGauge = createLazyUpDownCounter('subscription_active', {
  description: 'Number of currently active subscriptions',
  unit: '1',
});

// Checkout metrics
export const checkoutSessionCounter = createLazyCounter('checkout_sessions_total', {
  description: 'Total number of checkout sessions created',
  unit: '1',
});

export const checkoutCompletionCounter = createLazyCounter('checkout_completions_total', {
  description: 'Total number of completed checkouts',
  unit: '1',
});

export const checkoutAbandonmentCounter = createLazyCounter('checkout_abandonments_total', {
  description: 'Total number of abandoned checkouts',
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
    http_request_method: method,
    http_route: route,
    http_response_status_code: statusCode.toString(),
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
      error_type: statusCode >= 500 ? 'server_error' : 'client_error',
    });
  }
}

/**
 * Record database query metrics
 */
export function recordDbQuery(attributes: {
  operation: string;
  table?: string;
  duration: number; // Duration in milliseconds
  success: boolean;
  error?: string;
}) {
  const { operation, table, duration, success, error } = attributes;

  const commonAttrs: Attributes = {
    db_operation: operation,
    ...(table && { db_table: table }),
  };

  dbQueryCounter.add(1, commonAttrs);
  // Convert milliseconds to seconds
  dbQueryDuration.record(duration / 1000, commonAttrs);

  if (!success) {
    dbErrorCounter.add(1, {
      ...commonAttrs,
      ...(error && { error_type: error }),
    });
  }
}

/**
 * Record external API call metrics
 */
export function recordApiCall(attributes: {
  service: string;
  endpoint: string;
  duration: number; // Duration in milliseconds
  statusCode?: number;
  success: boolean;
  error?: string;
}) {
  const { service, endpoint, duration, statusCode, success, error } = attributes;

  const commonAttrs: Attributes = {
    api_service: service,
    api_endpoint: endpoint,
    ...(statusCode && { api_status_code: statusCode }),
  };

  apiCallCounter.add(1, commonAttrs);
  // Convert milliseconds to seconds
  apiCallDuration.record(duration / 1000, commonAttrs);

  if (!success) {
    apiErrorCounter.add(1, {
      ...commonAttrs,
      ...(error && { error_type: error }),
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
    user_success: success,
    ...(userId && { user_id: userId }),
    ...(country && { geo_country: country }),
    ...(city && { geo_city: city }),
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
      ...(failureReason && { failure_reason: failureReason }),
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
  const { path, userId, isUnique } = attributes;

  const commonAttrs: Attributes = {
    page_path: path,
    ...(userId && { user_id: userId }),
  };

  pageViewCounter.add(1, commonAttrs);

  if (isUnique) {
    uniquePageViewCounter.add(1, commonAttrs);
  }
}

/**
 * Record email sending metrics
 */
export function recordEmailSent(attributes: {
  type: string;
  recipient: string;
  success: boolean;
  duration: number; // Duration in milliseconds
  error?: string;
}) {
  const { type, success, duration, error } = attributes;

  const commonAttrs: Attributes = {
    email_type: type,
    email_success: success,
  };

  // Convert milliseconds to seconds
  emailDuration.record(duration / 1000, commonAttrs);

  if (success) {
    emailSentCounter.add(1, commonAttrs);
  } else {
    emailFailureCounter.add(1, {
      ...commonAttrs,
      ...(error && { error_type: error }),
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
 * Record payment metrics
 */
export function recordPayment(attributes: {
  purchaseType: 'course' | 'bundle' | 'subscription';
  amount: number; // Amount in cents
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  userId?: string;
  courseId?: string;
  bundleId?: string;
}) {
  const { purchaseType, amount, currency, status, userId, courseId, bundleId } = attributes;

  const commonAttrs: Attributes = {
    payment_type: purchaseType,
    payment_currency: currency,
    payment_status: status,
    ...(userId && { user_id: userId }),
    ...(courseId && { course_id: courseId }),
    ...(bundleId && { bundle_id: bundleId }),
  };

  paymentCounter.add(1, commonAttrs);
  paymentAmountHistogram.record(amount, commonAttrs);

  if (status === 'failed') {
    paymentFailureCounter.add(1, commonAttrs);
  } else if (status === 'refunded') {
    paymentRefundCounter.add(1, commonAttrs);
  }
}

/**
 * Record checkout session metrics
 */
export function recordCheckoutSession(attributes: {
  purchaseType: 'course' | 'bundle' | 'subscription';
  status: 'created' | 'completed' | 'abandoned';
  userId?: string;
}) {
  const { purchaseType, status, userId } = attributes;

  const commonAttrs: Attributes = {
    checkout_type: purchaseType,
    ...(userId && { user_id: userId }),
  };

  if (status === 'created') {
    checkoutSessionCounter.add(1, commonAttrs);
  } else if (status === 'completed') {
    checkoutCompletionCounter.add(1, commonAttrs);
  } else if (status === 'abandoned') {
    checkoutAbandonmentCounter.add(1, commonAttrs);
  }
}

/**
 * Record subscription metrics
 */
export function recordSubscription(attributes: {
  action: 'created' | 'canceled' | 'updated';
  planType: string;
  userId?: string;
}) {
  const { action, planType, userId } = attributes;

  const commonAttrs: Attributes = {
    subscription_plan: planType,
    ...(userId && { user_id: userId }),
  };

  if (action === 'created') {
    subscriptionCounter.add(1, commonAttrs);
    activeSubscriptionsGauge.add(1, commonAttrs);
  } else if (action === 'canceled') {
    subscriptionCancelCounter.add(1, commonAttrs);
    activeSubscriptionsGauge.add(-1, commonAttrs);
  }
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
