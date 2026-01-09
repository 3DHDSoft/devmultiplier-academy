/**
 * OpenTelemetry Instrumentation for Next.js
 *
 * This file is automatically loaded by Next.js when instrumentation is enabled.
 * It sets up automatic tracing for HTTP requests, database queries, and more.
 */

export async function register() {
  // Only run instrumentation on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}
