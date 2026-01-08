/**
 * HTTP Server Metrics Instrumentation
 *
 * This module instruments the HTTP server to collect metrics for incoming requests.
 * It works by patching the Node.js HTTP server to record metrics for each request.
 */

import { httpServerRequestCounter, httpServerRequestDuration } from './metrics';
import type { IncomingMessage, ServerResponse } from 'http';

// Track if we've already instrumented the server
let instrumented = false;

/**
 * Extract route from URL path
 * Normalizes dynamic routes to a common pattern
 */
function extractRoute(url: string): string {
  if (!url) return '/';

  // Remove query parameters
  const path = url.split('?')[0];

  // Normalize common patterns
  if (path.startsWith('/_next/')) return '/_next/*';
  if (path.startsWith('/api/auth/')) return '/api/auth/*';
  if (path.match(/^\/api\/[\w-]+\/[^/]+$/)) {
    // /api/courses/123 -> /api/courses/:id
    return path.replace(/\/[^/]+$/, '/:id');
  }

  return path;
}

/**
 * Instrument an HTTP server response to record metrics
 */
export function instrumentResponse(req: IncomingMessage, res: ServerResponse) {
  const startTime = Date.now();
  const method = req.method || 'UNKNOWN';
  const url = req.url || '/';
  const route = extractRoute(url);

  // Hook into response finish event
  const originalEnd = res.end;
  res.end = function (this: ServerResponse, ...args: any[]) {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const statusCode = res.statusCode || 200;

    // Record metrics
    try {
      const attrs = {
        'http_request_method': method,
        'http_route': route,
        'http_response_status_code': statusCode.toString(),
      };

      httpServerRequestCounter.add(1, attrs);
      httpServerRequestDuration.record(duration, attrs);
    } catch (error) {
      console.error('Error recording HTTP server metrics:', error);
    }

    // Call original end method
    return originalEnd.apply(this, args);
  };
}

/**
 * Initialize HTTP server metrics instrumentation
 * This should be called once during app startup
 */
export function initializeHttpServerMetrics() {
  if (instrumented) {
    console.log('⚠️  HTTP server metrics already instrumented');
    return;
  }

  // Mark as instrumented
  instrumented = true;

  console.log('✅ HTTP server metrics instrumentation initialized');
}
