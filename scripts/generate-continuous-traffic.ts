#!/usr/bin/env tsx
/**
 * Continuous traffic generator for testing Grafana dashboards
 *
 * Generates realistic HTTP traffic to your Next.js app to populate dashboards.
 * This script makes actual HTTP requests that will be captured by OpenTelemetry instrumentation.
 *
 * Run: bun run telemetry:traffic
 * Or: bunx tsx scripts/generate-continuous-traffic.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DURATION_MINUTES = parseInt(process.env.DURATION_MINUTES || '5', 10);
const REQUESTS_PER_MINUTE = parseInt(process.env.REQUESTS_PER_MINUTE || '10', 10);

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

// Test data
const endpoints = [
  { path: '/', method: 'GET', weight: 5 },
  { path: '/api/auth/session', method: 'GET', weight: 3 },
  { path: '/api/users', method: 'GET', weight: 2 },
  { path: '/api/courses', method: 'GET', weight: 2 },
  { path: '/about', method: 'GET', weight: 1 },
  { path: '/dashboard', method: 'GET', weight: 2 },
];

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
];

/**
 * Make a weighted random choice from endpoints
 */
function selectEndpoint() {
  const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
  let random = Math.random() * totalWeight;

  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }

  return endpoints[0];
}

/**
 * Make an HTTP request
 */
async function makeRequest() {
  const endpoint = selectEndpoint();
  const url = `${BASE_URL}${endpoint.path}`;
  const userAgent = randomChoice(userAgents);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'User-Agent': userAgent,
      },
      // Don't follow redirects to test different status codes
      redirect: 'manual',
    });

    const duration = Date.now() - startTime;
    const status = response.status;
    const statusIcon = status < 400 ? '✅' : '❌';

    console.log(`${statusIcon} ${endpoint.method} ${endpoint.path} - ${status} (${duration}ms)`);

    return { success: status < 400, duration, status };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${endpoint.method} ${endpoint.path} - Error: ${error instanceof Error ? error.message : 'Unknown'} (${duration}ms)`);

    return { success: false, duration, status: 0 };
  }
}

/**
 * Generate traffic for a specific duration
 */
async function generateTraffic() {
  const endTime = Date.now() + DURATION_MINUTES * 60 * 1000;
  const delayBetweenRequests = (60 * 1000) / REQUESTS_PER_MINUTE;

  let totalRequests = 0;
  let successfulRequests = 0;

  console.log(`🚀 Starting traffic generation...`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Duration: ${DURATION_MINUTES} minutes`);
  console.log(`   Rate: ${REQUESTS_PER_MINUTE} requests/minute`);
  console.log(`   Delay between requests: ${Math.round(delayBetweenRequests)}ms\n`);

  while (Date.now() < endTime) {
    const result = await makeRequest();
    totalRequests++;

    if (result.success) {
      successfulRequests++;
    }

    // Add some randomness to request timing (±20%)
    const jitter = delayBetweenRequests * 0.2;
    const actualDelay = delayBetweenRequests + (Math.random() - 0.5) * 2 * jitter;

    await sleep(Math.max(100, actualDelay));
  }

  console.log(`\n✅ Traffic generation complete!`);
  console.log(`   Total requests: ${totalRequests}`);
  console.log(`   Successful: ${successfulRequests}`);
  console.log(`   Failed: ${totalRequests - successfulRequests}`);
  console.log(`   Success rate: ${((successfulRequests / totalRequests) * 100).toFixed(1)}%`);
}

/**
 * Main function
 */
async function main() {
  console.log('📊 Continuous Traffic Generator for Grafana Dashboard Testing\n');

  // Check if the server is reachable
  console.log(`🔍 Checking if server is reachable at ${BASE_URL}...`);

  try {
    const response = await fetch(BASE_URL, {
      method: 'HEAD',
      // Don't follow redirects
      redirect: 'manual',
    });

    // Accept any response (including redirects)
    if (response.status >= 200 && response.status < 600) {
      console.log(`✅ Server is reachable (status: ${response.status})\n`);
    }
  } catch (error) {
    console.error(`❌ Cannot reach server at ${BASE_URL}`);
    console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    console.error(`\n💡 Make sure your Next.js app is running:`);
    console.error(`   npm run dev\n`);
    process.exit(1);
  }

  await generateTraffic();

  console.log(`\n✨ Check your Grafana dashboard at http://localhost:3000`);
  console.log(`   Dashboard: DevAcademy - Application Overview`);
  console.log(`   Note: Metrics are exported every 60 seconds\n`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
