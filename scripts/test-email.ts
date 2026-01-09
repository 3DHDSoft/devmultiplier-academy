#!/usr/bin/env bun

/**
 * Script to test email notifications
 * Usage: bun scripts/test-email.ts <email>
 */

import { sendNewLocationAlert, sendFailedLoginAlert } from '../src/lib/email-service';

async function testEmail() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Email address is required');
    console.log('Usage: bun scripts/test-email.ts <email>');
    process.exit(1);
  }

  console.log(`\n🧪 Testing email notifications to: ${email}\n`);

  try {
    // Test 1: New Location Alert
    console.log('📧 Test 1: Sending new location alert...');
    await sendNewLocationAlert(
      email,
      'Test User',
      {
        city: 'San Francisco',
        region: 'California',
        country: 'United States',
        ipAddress: '192.168.1.1',
      },
      new Date()
    );
    console.log('✅ New location alert sent!\n');

    // Wait a moment between emails
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Failed Login Alert
    console.log('📧 Test 2: Sending failed login alert...');
    await sendFailedLoginAlert(
      email,
      'Test User',
      3,
      {
        city: 'New York',
        region: 'New York',
        country: 'United States',
        ipAddress: '10.0.0.1',
      },
      new Date()
    );
    console.log('✅ Failed login alert sent!\n');

    console.log('🎉 All test emails sent successfully!');
    console.log('📬 Check your inbox at:', email);
    console.log('\n💡 Tips:');
    console.log('   - Check spam/junk folder if you don\'t see emails');
    console.log('   - Check Resend dashboard for delivery status: https://resend.com/emails');
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    process.exit(1);
  }
}

testEmail();
