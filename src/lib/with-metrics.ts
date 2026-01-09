/**
 * Higher-order function to wrap Next.js API routes with metrics collection
 *
 * Usage:
 * export const GET = withMetrics(async (request: NextRequest) => {
 *   // Your handler code
 *   return NextResponse.json({ data });
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordHttpRequest } from './metrics';

type RouteHandler = (request: NextRequest, context?: any) => Promise<Response> | Response;

export function withMetrics(handler: RouteHandler, route?: string): RouteHandler {
  return async function metricsWrapper(request: NextRequest, context?: any) {
    const startTime = Date.now();
    const method = request.method;
    const pathname = route || new URL(request.url).pathname;

    let response: Response;
    let statusCode: number;

    try {
      // Call the actual handler
      response = await handler(request, context);
      statusCode = response.status;
    } catch (error) {
      // Handle errors
      console.error('Error in route handler:', error);
      statusCode = 500;
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Record metrics
    const duration = Date.now() - startTime;

    try {
      recordHttpRequest({
        method,
        route: pathname,
        statusCode,
        duration,
      });
    } catch (metricsError) {
      console.error('Error recording metrics:', metricsError);
    }

    return response;
  };
}

/**
 * Create metrics-enabled route handlers for all HTTP methods
 */
export function createMetricsHandlers<T extends Record<string, RouteHandler>>(
  handlers: T,
  route?: string
): T {
  const wrappedHandlers: any = {};

  for (const [method, handler] of Object.entries(handlers)) {
    wrappedHandlers[method] = withMetrics(handler, route);
  }

  return wrappedHandlers as T;
}
