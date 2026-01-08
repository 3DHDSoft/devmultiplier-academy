#!/usr/bin/env tsx
/**
 * Test script to generate telemetry data for Grafana dashboard testing
 *
 * This script generates realistic telemetry data to test:
 * - HTTP client request metrics
 * - API error metrics
 * - Login activity metrics
 * - Database query metrics
 *
 * Run: bun run telemetry:test
 * Or: bunx tsx scripts/generate-test-telemetry.ts
 */

import { trace } from '@opentelemetry/api';

// We need to import the instrumentation to ensure OpenTelemetry is initialized
import '../instrumentation.node';

// Import metrics after instrumentation is loaded
import {
  recordLoginAttempt,
  recordDbQuery,
  recordApiCall,
  loginAttemptCounter,
  loginSuccessCounter,
  loginFailureCounter,
} from '../src/lib/metrics';

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random data helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney'];
const countries = ['US', 'GB', 'JP', 'FR', 'DE', 'AU'];
const endpoints = [
  'registry.npmjs.org',
  'telemetry.nextjs.org',
  'api.github.com',
  'api.stripe.com',
];
const dbOperations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
const tables = ['users', 'login_logs', 'sessions', 'courses', 'lessons'];

/**
 * Generate HTTP client request metrics
 */
async function generateHttpClientMetrics() {
  const tracer = trace.getTracer('test-generator');

  for (let i = 0; i < 10; i++) {
    const server = randomChoice(endpoints);
    const method = randomChoice(['GET', 'POST', 'PUT', 'DELETE']);
    const duration = randomInt(50, 500);

    // Create a span to simulate HTTP client request
    const span = tracer.startSpan('http.client.request', {
      attributes: {
        'http.request.method': method,
        'server.address': server,
        'http.response.status_code': 200,
        'url.full': `https://${server}/api/test`,
      },
    });

    // Simulate request duration
    await sleep(duration);

    span.end();

    console.log(`📤 HTTP ${method} ${server} - ${duration}ms`);
    await sleep(100);
  }
}

/**
 * Generate API error metrics
 */
async function generateApiErrorMetrics() {
  for (let i = 0; i < 5; i++) {
    const service = randomChoice(['ip-api.com', 'stripe', 'github', 'auth0']);
    const endpoint = `/api/v1/${randomChoice(['users', 'payments', 'auth', 'data'])}`;
    const hasError = Math.random() < 0.3; // 30% chance of error

    recordApiCall({
      service,
      endpoint,
      duration: randomInt(100, 1000),
      statusCode: hasError ? randomInt(400, 500) : 200,
      success: !hasError,
      error: hasError ? randomChoice(['timeout', 'network_error', 'rate_limit']) : undefined,
    });

    console.log(`🔌 API call to ${service}${endpoint} - ${hasError ? '❌ Error' : '✅ Success'}`);
    await sleep(200);
  }
}

/**
 * Generate login activity metrics
 */
async function generateLoginMetrics() {
  const emails = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];

  for (let i = 0; i < 20; i++) {
    const email = randomChoice(emails);
    const success = Math.random() < 0.8; // 80% success rate
    const city = randomChoice(cities);
    const country = randomChoice(countries);
    const isNewLocation = Math.random() < 0.2; // 20% new location
    const isSuspicious = !success && Math.random() < 0.3; // 30% of failures are suspicious

    recordLoginAttempt({
      success,
      userId: success ? `user-${randomInt(1, 100)}` : undefined,
      email,
      failureReason: success ? undefined : randomChoice(['invalid_password', 'account_locked', 'invalid_email']),
      isNewLocation: success ? isNewLocation : false,
      isSuspicious,
      country,
      city,
    });

    // Also directly increment the counters to ensure they're exported
    loginAttemptCounter.add(1, {
      'user.email': email,
      'geo.country': country,
      'geo.city': city,
    });

    if (success) {
      loginSuccessCounter.add(1, {
        'user.email': email,
        'geo.country': country,
      });
    } else {
      loginFailureCounter.add(1, {
        'user.email': email,
        'failure.reason': randomChoice(['invalid_password', 'account_locked']),
      });
    }

    console.log(`🔐 Login ${success ? '✅ success' : '❌ failure'} - ${email} from ${city}, ${country}`);
    await sleep(150);
  }
}

/**
 * Generate database query metrics
 */
async function generateDatabaseMetrics() {
  for (let i = 0; i < 15; i++) {
    const operation = randomChoice(dbOperations);
    const table = randomChoice(tables);
    const duration = randomInt(5, 100);
    const success = Math.random() < 0.95; // 95% success rate

    recordDbQuery({
      operation,
      table,
      duration,
      success,
      error: success ? undefined : randomChoice(['connection_error', 'timeout', 'constraint_violation']),
    });

    console.log(`🗄️  Database ${operation} on ${table} - ${duration}ms ${success ? '✅' : '❌'}`);
    await sleep(100);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting telemetry data generation...\n');

  try {
    // Generate different types of metrics
    console.log('📊 Generating HTTP client metrics...');
    await generateHttpClientMetrics();

    console.log('\n📊 Generating API error metrics...');
    await generateApiErrorMetrics();

    console.log('\n📊 Generating login activity metrics...');
    await generateLoginMetrics();

    console.log('\n📊 Generating database metrics...');
    await generateDatabaseMetrics();

    console.log('\n✅ Telemetry generation complete!');
    console.log('⏳ Waiting 20 seconds for metrics to be exported...');
    console.log('   (Metrics export every 15 seconds)');

    // Wait for at least one metric export cycle (15s + 5s buffer)
    await sleep(20000);

    console.log('\n✨ Done! Metrics should now be visible in Grafana');
    console.log('   Dashboard: http://localhost:3001 → DevAcademy → Application Overview');
    console.log('   If you don\'t see data, wait 15 more seconds and refresh');

  } catch (error) {
    console.error('❌ Error generating telemetry:', error);
    process.exit(1);
  }

  // Exit cleanly
  console.log('\n👋 Exiting...');
  process.exit(0);
}

main();
