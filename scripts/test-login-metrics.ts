#!/usr/bin/env tsx
/**
 * Login metrics generator for testing Grafana login activity dashboard
 *
 * This directly calls the login logging functions to generate login metrics.
 *
 * Run: bun run telemetry:login [num_attempts]
 * Or: bunx tsx scripts/test-login-metrics.ts [num_attempts] [--burst]
 */

import '../instrumentation.node';
import { recordLoginAttempt } from '../src/lib/metrics';

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random helpers
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

// Test data
const testUsers = [
  { email: 'alice@example.com', userId: 'user-1' },
  { email: 'bob@example.com', userId: 'user-2' },
  { email: 'charlie@example.com', userId: 'user-3' },
  { email: 'diana@example.com', userId: 'user-4' },
];

const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Singapore', 'Toronto'];
const countries = ['US', 'GB', 'JP', 'FR', 'DE', 'AU', 'SG', 'CA'];
const failureReasons = [
  'invalid_password',
  'account_locked',
  'invalid_email',
  'account_not_found',
];

/**
 * Generate a single login attempt
 */
async function generateLoginAttempt() {
  const user = randomChoice(testUsers);
  const success = Math.random() < 0.75; // 75% success rate
  const city = randomChoice(cities);
  const country = randomChoice(countries);
  const isNewLocation = success && Math.random() < 0.15; // 15% new location for successful logins
  const isSuspicious = !success && Math.random() < 0.25; // 25% of failures are suspicious

  recordLoginAttempt({
    success,
    userId: success ? user.userId : undefined,
    email: user.email,
    failureReason: success ? undefined : randomChoice(failureReasons),
    isNewLocation,
    isSuspicious,
    country,
    city,
  });

  const statusIcon = success ? '✅' : '❌';
  const locationFlag = isNewLocation ? '🆕' : '';
  const suspiciousFlag = isSuspicious ? '⚠️' : '';

  console.log(`${statusIcon} Login ${success ? 'success' : 'failure'} - ${user.email} from ${city}, ${country} ${locationFlag}${suspiciousFlag}`);
}

/**
 * Generate a burst of failed login attempts (simulate attack)
 */
async function generateFailedLoginBurst(email: string) {
  console.log(`\n🚨 Simulating failed login burst for ${email}...`);

  for (let i = 0; i < 5; i++) {
    recordLoginAttempt({
      success: false,
      email,
      failureReason: 'invalid_password',
      isSuspicious: true,
      country: randomChoice(countries),
      city: randomChoice(cities),
    });

    console.log(`❌ Failed login attempt ${i + 1}/5 for ${email}`);
    await sleep(200);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔐 Login Metrics Generator for Grafana Dashboard Testing\n');

  const numAttempts = parseInt(process.argv[2] || '30', 10);
  const withBurst = process.argv.includes('--burst');

  console.log(`📊 Generating ${numAttempts} login attempts...`);

  if (withBurst) {
    console.log(`🚨 Will also generate failed login burst\n`);
  } else {
    console.log();
  }

  // Generate regular login attempts
  for (let i = 0; i < numAttempts; i++) {
    await generateLoginAttempt();
    await sleep(randomInt(100, 300));
  }

  // Optionally generate a burst of failed attempts
  if (withBurst) {
    await sleep(500);
    await generateFailedLoginBurst(randomChoice(testUsers).email);
  }

  console.log('\n✅ Login metrics generation complete!');
  console.log('⏳ Waiting 20 seconds for metrics to be exported...');
  console.log('   (Metrics export every 15 seconds)\n');

  // Wait for at least one metric export cycle (15s + 5s buffer)
  await sleep(20000);

  console.log('✨ Metrics should now be visible in your Grafana dashboard');
  console.log('   Dashboard: http://localhost:3001 → DevAcademy → Application Overview');
  console.log('   Panel: Login Activity');
  console.log('   If you don\'t see data, wait 15 more seconds and refresh\n');

  // Exit cleanly
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
