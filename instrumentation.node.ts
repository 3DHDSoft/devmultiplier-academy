/**
 * OpenTelemetry Node.js Instrumentation
 *
 * Configures OpenTelemetry with:
 * - Automatic instrumentation for HTTP, Prisma, and more
 * - OTLP trace exporter for Grafana Cloud Tempo
 * - OTLP metrics exporter for Grafana Cloud Prometheus
 * - Custom resource attributes
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable error-level logging only (change to DiagLogLevel.DEBUG for verbose debugging)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Service configuration
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'dev-academy-web',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

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

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Auto-instrument HTTP requests
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (request) => {
          // Ignore health checks and static assets
          const url = request.url || '';
          return url.includes('/_next/static') || url.includes('/favicon.ico') || url === '/health';
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

// Start the SDK
sdk.start();
console.log('✅ OpenTelemetry instrumentation initialized');

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    // .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});
