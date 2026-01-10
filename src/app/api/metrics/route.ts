/**
 * Prometheus Metrics Endpoint
 *
 * Exposes application metrics in Prometheus format.
 * This endpoint is typically scraped by Prometheus or other monitoring tools.
 */

import { NextResponse } from 'next/server';
import { metrics } from '@opentelemetry/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get the meter provider (ensure it's initialized)
    metrics.getMeterProvider();

    // For now, return a simple response indicating the endpoint is working
    // In a production setup, you would integrate with a Prometheus exporter
    // that can serialize metrics in Prometheus text format

    const response = [
      '# HELP app_info Application information',
      '# TYPE app_info gauge',
      `app_info{service="dev-academy-web",environment="${process.env.NODE_ENV || 'development'}"} 1`,
      '',
      '# HELP app_uptime_seconds Application uptime in seconds',
      '# TYPE app_uptime_seconds counter',
      `app_uptime_seconds ${process.uptime()}`,
      '',
    ].join('\n');

    return new NextResponse(response, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}
