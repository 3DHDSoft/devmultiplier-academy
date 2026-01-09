/**
 * OpenTelemetry Node.js Instrumentation for Next.js + Vercel
 *
 * Configures OpenTelemetry with:
 * - @vercel/otel for Next.js integration
 * - Automatic instrumentation for HTTP, Prisma, and more
 * - OTLP trace exporter for Grafana Cloud Tempo
 * - OTLP metrics exporter for Grafana Cloud Prometheus
 * - Custom resource attributes
 */

import { registerOTel } from '@vercel/otel';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable error-level logging only (change to DiagLogLevel.DEBUG for verbose debugging)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Environment-based endpoint configuration
// Use local OTLP collector in development, Grafana Cloud in production
const isProduction = process.env.NODE_ENV === 'production';
const useCloudBackend = process.env.OTEL_USE_CLOUD === 'true' || isProduction;

console.log(`📊 OpenTelemetry configuration: ${useCloudBackend ? 'Grafana Cloud' : 'Local Stack'} (${process.env.NODE_ENV})`);

// Configure OTLP exporter endpoint based on environment
let endpoint: string;
let headers: Record<string, string> = {};

if (useCloudBackend) {
  // Production: Use Grafana Cloud
  const headersEnv = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  delete process.env.OTEL_EXPORTER_OTLP_HEADERS;

  // Parse headers - support both JSON format and key=value format
  if (headersEnv) {
    if (headersEnv.startsWith('{')) {
      // JSON format: {"Authorization":"Basic ..."}
      headers = JSON.parse(headersEnv);
    } else {
      // key=value format: Authorization=Basic ...
      const pairs = headersEnv.split(',');
      pairs.forEach((pair) => {
        const [key, ...valueParts] = pair.split('=');
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  }

  endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://otlp-gateway-prod-us-east-3.grafana.net/otlp';
  console.log('  ☁️  Using Grafana Cloud endpoint:', endpoint);
} else {
  // Development: Use local OTLP collector
  endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318';
  console.log('  🏠 Using local OTLP collector:', endpoint);
}

// Append /v1/traces to the endpoint if not already present
const url = endpoint.endsWith('/v1/traces') ? endpoint : `${endpoint}/v1/traces`;

const traceExporter = new OTLPTraceExporter({
  url,
  headers,
});

// Configure OTLP metrics exporter
const metricsUrl = endpoint.endsWith('/v1/metrics') ? endpoint : endpoint.replace(/\/v1\/traces$/, '') + '/v1/metrics';

const metricExporter = new OTLPMetricExporter({
  url: metricsUrl,
  headers,
});

// Configure metric reader with 15-second export interval
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 15000, // Export every 15 seconds
});

// Initialize OpenTelemetry SDK using @vercel/otel
// Note: registerOTel will create and register the MeterProvider globally
registerOTel({
  serviceName: 'dev-academy-web',
  traceExporter,
  metricReaders: [metricReader],
  instrumentations: [
    ...getNodeAutoInstrumentations({
      // Auto-instrument HTTP requests (creates traces + metrics)
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (request) => {
          // Ignore health checks and static assets
          const url = 'url' in request ? request.url || '' : '';
          return url.includes('/_next/static') || url.includes('/favicon.ico') || url === '/health';
        },
        // Enable metrics collection for incoming HTTP requests
        requestHook: (span, request) => {
          // Add custom attributes to spans that will be converted to metrics
          if ('url' in request && request.url) {
            span.setAttribute('http.route', request.url);
          }
        },
        responseHook: (span, response) => {
          // Add response attributes
          if (response.statusCode) {
            span.setAttribute('http.status_code', response.statusCode);
          }
        },
      },
      // Auto-instrument fetch calls (includes undici)
      '@opentelemetry/instrumentation-undici': {
        enabled: true,
      },
      // Disable instrumentations we don't need
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
    }),
  ],
});

console.log('✅ OpenTelemetry instrumentation initialized with @vercel/otel');
console.log('📊 Metrics will be exported to:', metricsUrl, 'every 15 seconds');
console.log('🔍 Metrics endpoint available at: http://otel-collector:8889/metrics (after first export)');

// Initialize HTTP server metrics instrumentation
import { initializeHttpServerMetrics } from './src/lib/http-server-metrics';
initializeHttpServerMetrics();
