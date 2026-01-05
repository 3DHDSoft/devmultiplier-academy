/**
 * OpenTelemetry Node.js Instrumentation
 *
 * Configures OpenTelemetry with:
 * - Automatic instrumentation for HTTP, Prisma, and more
 * - OTLP exporter for Grafana Cloud
 * - Custom resource attributes
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable debug logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Service configuration
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'dev-academy-web',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

// Configure OTLP exporter for Grafana Cloud
console.log('🔧 Configuring OTLP Exporter:');
console.log('  URL:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces');
console.log('  Headers configured:', !!process.env.OTEL_EXPORTER_OTLP_HEADERS);

// Parse headers from environment variable
console.log('  Raw OTEL_EXPORTER_OTLP_HEADERS:', process.env.OTEL_EXPORTER_OTLP_HEADERS);

// Clear the env var to prevent OTLPTraceExporter from reading it directly
const headersEnv = process.env.OTEL_EXPORTER_OTLP_HEADERS;
delete process.env.OTEL_EXPORTER_OTLP_HEADERS;

// Parse headers - support both JSON format and key=value format
let headers: Record<string, string> = {};
if (headersEnv) {
  if (headersEnv.startsWith('{')) {
    // JSON format: {"Authorization":"Basic ..."}
    headers = JSON.parse(headersEnv);
  } else {
    // key=value format: Authorization=Basic ...
    const pairs = headersEnv.split(',');
    pairs.forEach(pair => {
      const [key, ...valueParts] = pair.split('=');
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

console.log('  Parsed headers type:', typeof headers);
console.log('  Parsed headers:', headers);
console.log('  Parsed headers keys:', Object.keys(headers));

// Append /v1/traces to the endpoint if not already present
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const url = endpoint.endsWith('/v1/traces') ? endpoint : `${endpoint}/v1/traces`;

const traceExporter = new OTLPTraceExporter({
  url,
  headers,
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Auto-instrument HTTP requests
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (request) => {
          // Ignore health checks and static assets
          const url = request.url || '';
          return (
            url.includes('/_next/static') ||
            url.includes('/favicon.ico') ||
            url === '/health'
          );
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

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((error) => console.log('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

console.log('✅ OpenTelemetry instrumentation initialized');
